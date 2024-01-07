import { ColumnDef, SortingState, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ReactNode, useMemo, useState } from "react";
import React from "react";

import { Bot, BotCategory } from "../../../botTypes";
import { Spoiler } from "../../../types/commonTypes";
import {
    botData,
    canShowSpoiler,
    getBot,
    getSpoilersValue,
    leetSpeakMatchTransform,
    parseIntOrDefault,
} from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import { LabeledExclusiveButtonGroup, LabeledInput } from "../../LabeledItem/LabeledItem";
import BotPopoverButton from "../../Popover/BotPopover";
import Table from "../../Table/Table";

import "../Pages.less";

type BotsPageMode = "Simple" | "Spreadsheet";

type Faction = "Any" | "0b10" | "Architect" | "Derelict" | "Exiles" | "Warlord" | "Zionite";

type BotsPageState = {
    nameSearch?: string;
    classSearch?: string;
    partSearch?: string;
    mode: BotsPageMode;
    factionSearch?: Faction;
};

const modeButtons: ExclusiveButtonDefinition<BotsPageMode>[] = [{ value: "Simple" }, { value: "Spreadsheet" }];

const allFactionButtons: (ExclusiveButtonDefinition<Faction> & { spoiler?: Spoiler })[] = [
    { value: "Any" },
    { value: "Architect", spoiler: "Redacted" },
    { value: "0b10" },
    { value: "Derelict" },
    { value: "Exiles" },
    { value: "Warlord", spoiler: "Spoiler" },
    { value: "Zionite", spoiler: "Spoiler" },
];

const botColumnDefs: ColumnDef<Bot>[] = [
    {
        header: "Overview",
        columns: [
            { accessorKey: "name", header: "Name", size: 12, maxSize: 12 },
            { accessorKey: "class", header: "Class", size: 12, maxSize: 12 },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "profile", header: "Profile" },
            { accessorKey: "rating", header: "Rating" },
            { accessorKey: "tier", header: "Tier" },
            { accessorKey: "Threat", header: "Threat" },
            { accessorKey: "value", header: "Value" },
            { accessorKey: "energyGeneration", header: "Energy Generation" },
            { accessorKey: "heatDissipation", header: "Heat Dissipation" },
            { accessorKey: "visualRange", header: "Visual Range" },
            { accessorKey: "memory", header: "Memory" },
            { accessorKey: "spotPercent", header: "Spot %" },
            {
                accessorKey: "movement",
                header: "Movement",
                sortingFn: (rowA, rowB, columnId) =>
                    movementSpeedSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
                size: 10,
                maxSize: 10,
            },
            { accessorKey: "coreIntegrity", header: "Core Integrity" },
            { accessorKey: "coreExposure", header: "Core Exposure" },
            {
                accessorKey: "salvagePotential",
                header: "Salvage Potential",
                sortingFn: (rowA, rowB, columnId) =>
                    salvagePotentialSort(rowA.getValue<string>(columnId), rowB.getValue<string>(columnId)),
            },
        ],
    },
    {
        header: "Parts",
        columns: [
            { accessorKey: "armamentString", header: "Armament", size: 25 },
            { accessorKey: "componentsString", header: "Components", size: 60 },
        ],
    },
    {
        header: "Resistances",
        columns: [
            { accessorFn: (bot) => bot.resistances?.Electromagnetic, header: "Electromagnetic" },
            { accessorFn: (bot) => bot.resistances?.Explosive, header: "Explosive" },
            { accessorFn: (bot) => bot.resistances?.Impact, header: "Impact" },
            { accessorFn: (bot) => bot.resistances?.Kinetic, header: "Kinetic" },
            { accessorFn: (bot) => bot.resistances?.Piercing, header: "Piercing" },
            { accessorFn: (bot) => bot.resistances?.Slashing, header: "Slashing" },
            { accessorFn: (bot) => bot.resistances?.Thermal, header: "Thermal" },
        ],
    },
    {
        header: "Other",
        columns: [
            { accessorKey: "immunitiesString", header: "Immunities", size: 15 },
            { accessorKey: "traitsString", header: "Traits", size: 60 },
        ],
    },
];

const movementSpeedRegex = /\((\d*)/;
function movementSpeedSort(a: string, b: string) {
    const aValue = parseIntOrDefault(movementSpeedRegex.exec(a)![1], 0);
    const bValue = parseIntOrDefault(movementSpeedRegex.exec(b)![1], 0);

    return aValue - bValue;
}

function salvagePotentialSort(a: string, b: string) {
    function getAverage(damageString: string) {
        if (typeof damageString != "string" || damageString === "") {
            return 0;
        }

        const damageArray = damageString
            .split("~")
            .map((s) => s.trim())
            .map((s) => parseInt(s));
        return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
    }

    const aValue = getAverage(a);
    const bValue = getAverage(b);

    return aValue - bValue;
}

function filterBotNames(pageState: BotsPageState) {
    const spoilers = useSpoilers();

    const filteredBotNames = Object.keys(botData).filter((botName) => {
        const bot = botData[botName];

        // Filter spoilers
        if (!canShowSpoiler(bot.spoiler, spoilers)) {
            return false;
        }

        // Name filter
        if (pageState.nameSearch && pageState.nameSearch.length > 0) {
            // Only add a leetspeak convert if > 1 letter to reduce chance of
            // false positives on the translation
            // 2 min works well as it will catch somebody typing in the first half
            // of a bot name, like BR for 8R-AWN
            const nameSearch = pageState.nameSearch.toLowerCase();
            const lowerName = bot.name.toLowerCase();
            if (!lowerName.includes(nameSearch) && !leetSpeakMatchTransform(lowerName).includes(nameSearch)) {
                return false;
            }
        }

        // Class filter
        if (pageState.classSearch && pageState.classSearch.length > 0) {
            if (!bot.class.toLowerCase().includes(pageState.classSearch.toLowerCase())) {
                return false;
            }
        }

        // Part filter
        if (pageState.partSearch && pageState.partSearch.length > 0) {
            const partSearch = pageState.partSearch.toLowerCase();
            if (
                !bot.armamentData.find((data) => data.name.toLowerCase().includes(partSearch)) &&
                !bot.componentData.find((data) => data.name.toLowerCase().includes(partSearch)) &&
                !bot.armamentOptionData.find((data) =>
                    data.find((data) => data.name.toLowerCase().includes(partSearch)),
                ) &&
                !bot.componentOptionData.find((data) =>
                    data.find((data) => data.name.toLowerCase().includes(partSearch)),
                )
            ) {
                return false;
            }
        }

        if (pageState.factionSearch && pageState.factionSearch !== "Any") {
            if (!bot.categories.includes(pageState.factionSearch as BotCategory)) {
                return false;
            }
        }

        return true;
    });

    filteredBotNames.sort();
    return filteredBotNames;
}

function BotsSimpleDisplay({ pageState, botNames }: { pageState: BotsPageState; botNames: string[] }) {
    const botButtons = botNames.map((botName) => {
        const bot = getBot(botName);
        return <BotPopoverButton bot={bot} key={bot.name} />;
    });

    return <div className="part-button-grid">{botButtons}</div>;
}

function BotsSpreadsheetDisplay({ pageState, botNames }: { pageState: BotsPageState; botNames: string[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const data = useMemo(() => {
        return botNames.map((botName) => getBot(botName));
    }, [botNames]);

    return <Table data={data} columns={botColumnDefs} setSorting={setSorting} sorting={sorting} />;
}

export default function BotsPage() {
    const spoilers = useSpoilers();
    const [pageState, setPageState] = useState<BotsPageState>({ mode: "Simple" });

    const botNames = filterBotNames(pageState);

    let pageContent: ReactNode | undefined;
    if (pageState.mode === "Simple") {
        pageContent = <BotsSimpleDisplay pageState={pageState} botNames={botNames} />;
    } else if (pageState.mode === "Spreadsheet") {
        pageContent = <BotsSpreadsheetDisplay pageState={pageState} botNames={botNames} />;
    }

    const factionButtons = allFactionButtons.filter((button) => canShowSpoiler(button.spoiler || "None", spoilers));

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledInput
                    label="Name"
                    placeholder="Any"
                    tooltip="The name of a bot to search for."
                    value={pageState.nameSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, nameSearch: val });
                    }}
                />
                <LabeledInput
                    label="Class"
                    placeholder="Any"
                    tooltip="The class of a bot to search for."
                    value={pageState.classSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, classSearch: val });
                    }}
                />
                <LabeledInput
                    label="Part"
                    placeholder="Any"
                    tooltip="The name of a part to search for."
                    value={pageState.partSearch}
                    onChange={(val) => {
                        setPageState({ ...pageState, partSearch: val });
                    }}
                />
                <LabeledExclusiveButtonGroup
                    label="Mode"
                    buttons={modeButtons}
                    className="flex-grow-0"
                    tooltip="The mode to display the parts in."
                    selected={pageState.mode}
                    onValueChanged={(val) => {
                        setPageState({ ...pageState, mode: val });
                    }}
                />
                <Button
                    className="flex-grow-0"
                    onClick={() => {
                        setPageState({
                            // The only thing that is explicitly saved is the mode
                            mode: pageState.mode,
                        });
                    }}
                >
                    Reset
                </Button>
            </div>
            <div className="page-input-group">
                <LabeledExclusiveButtonGroup
                    label="Faction"
                    buttons={factionButtons}
                    tooltip="The mode to display the bots in."
                    selected={pageState.factionSearch}
                    onValueChanged={(val) => {
                        setPageState({ ...pageState, factionSearch: val });
                    }}
                />
            </div>
            {pageContent}
        </div>
    );
}
