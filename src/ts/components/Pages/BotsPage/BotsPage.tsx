import { ColumnDef, SortingState } from "@tanstack/react-table";
import { ReactNode } from "react";
import React from "react";
import { useLocation, useSearch } from "wouter";

import { Bot, BotCategory } from "../../../types/botTypes";
import { Spoiler } from "../../../types/commonTypes";
import { BotData } from "../../../utilities/BotData";
import {
    canShowSpoiler,
    getLocationFromState,
    leetSpeakMatchTransform,
    parseIntOrDefault,
    parseSearchParameters,
} from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import useBotData from "../../Effects/useBotData";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import { LabeledExclusiveButtonGroup, LabeledInput } from "../../LabeledItem/LabeledItem";
import BotPopoverButton from "../../Popover/BotPopover";
import Table from "../../Table/Table";

import "../Pages.less";
import "./BotsPage.less";

type BotsPageMode = "Simple" | "Spreadsheet";

type Faction = "Any" | "0b10" | "Architect" | "Derelict" | "Exiles" | "UFD" | "Unchained" | "Warlord" | "Zionite";

type BotsPageState = {
    name?: string;
    class?: string;
    part?: string;
    mode?: BotsPageMode;
    faction?: Faction;
};

const modeButtons: ExclusiveButtonDefinition<BotsPageMode>[] = [{ value: "Simple" }, { value: "Spreadsheet" }];

const allFactionButtons: (ExclusiveButtonDefinition<Faction> & { spoiler?: Spoiler })[] = [
    { value: "Any" },
    { value: "Architect", spoiler: "Redacted", tooltip: "Any Architect or Architect-related bots." },
    { value: "0b10", tooltip: "Any standard or prototype 0b10 bots." },
    { value: "Derelict", tooltip: "Any non-0b10 Derelict bots." },
    { value: "Exiles", tooltip: "Any Exiles or Exiles-related bots." },
    { value: "UFD", spoiler: "Spoiler", tooltip: "Any United Federation of Derelict (Scraptown) or related bots" },
    { value: "Unchained", spoiler: "Spoiler", tooltip: "Any Unchained or related bots" },
    { value: "Warlord", spoiler: "Spoiler", tooltip: "Any Warlord-related bots" },
    { value: "Zionite", spoiler: "Spoiler", tooltip: "Any Zion-related bots including Imprint-related bots" },
];

const botColumnDefs: ColumnDef<Bot>[] = [
    {
        header: "Overview",
        columns: [
            {
                accessorKey: "name",
                header: "Name",
                size: 12,
                maxSize: 12,
                cell: (info) => <BotPopoverButton className="name-popover" bot={info.row.original} />,
            },
            { accessorKey: "class", header: "Class", size: 12, maxSize: 12 },
            { accessorKey: "size", header: "Size" },
            { accessorKey: "profile", header: "Profile" },
            { accessorKey: "rating", header: "Rating" },
            { accessorKey: "tier", header: "Tier" },
            { accessorKey: "Threat", header: "Threat" },
            { accessorKey: "value", header: "Value" },
            { accessorKey: "energyGeneration", header: "Energy Generation" },
            { accessorKey: "innateEnergy", header: "Innate Energy" },
            { accessorKey: "netEnergyPerTurn", header: "Net Energy/Turn" },
            { accessorKey: "netEnergyPerMove", header: "Net Energy/Move" },
            { accessorKey: "netEnergyPerVolley", header: "Net Energy/Volley" },
            { accessorKey: "heatDissipation", header: "Heat Dissipation" },
            { accessorKey: "injectorDissipation", header: "Coolant Injector Dissipation" },
            { accessorKey: "netHeatPerTurn", header: "Net Heat/Turn" },
            { accessorKey: "netHeatPerMove", header: "Net Heat/Move" },
            { accessorKey: "netHeatPerVolley", header: "Net Heat/Volley" },
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
        header: "Combat",
        columns: [
            { accessorFn: (bot) => bot.damagePerTurn?.toFixed(0) || 0, header: "Damage/Turn" },
            { accessorFn: (bot) => bot.damagePerVolley?.toFixed(0) || 0, header: "Damage/Volley" },
            { accessorFn: (bot) => bot.volleyTime || 0, header: "Volley Time" },
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

function filterBots(pageState: BotsPageState, botData: BotData) {
    const spoilers = useSpoilers();

    const filteredBots = botData.getAllBots().filter((bot) => {
        // Filter spoilers
        if (!canShowSpoiler(bot.spoiler, spoilers)) {
            return false;
        }

        // Name filter
        if (pageState.name && pageState.name.length > 0) {
            // Only add a leetspeak convert if > 1 letter to reduce chance of
            // false positives on the translation
            // 2 min works well as it will catch somebody typing in the first half
            // of a bot name, like BR for 8R-AWN
            const nameSearch = pageState.name.toLowerCase();
            const lowerName = bot.name.toLowerCase();
            if (!lowerName.includes(nameSearch) && !leetSpeakMatchTransform(lowerName).includes(nameSearch)) {
                return false;
            }
        }

        // Class filter
        if (pageState.class && pageState.class.length > 0) {
            if (!bot.class.toLowerCase().includes(pageState.class.toLowerCase())) {
                return false;
            }
        }

        // Part filter
        if (pageState.part && pageState.part.length > 0) {
            const partSearch = pageState.part.toLowerCase();
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

        if (pageState.faction && pageState.faction !== "Any") {
            if (!bot.categories.includes(pageState.faction as BotCategory)) {
                return false;
            }
        }

        return true;
    });

    filteredBots.sort((botA, botB) => botA.name.localeCompare(botB.name));

    return filteredBots;
}

function getPageState(): BotsPageState {
    const search = useSearch();

    return parseSearchParameters(search, {});
}

function skipLocationMember(key: string, pageState: BotsPageState) {
    const typedKey: keyof BotsPageState = key as keyof BotsPageState;

    if (
        (typedKey === "mode" && pageState.mode === "Simple") ||
        (typedKey === "faction" && pageState.faction === "Any")
    ) {
        // Skip enum default values
        return true;
    }

    return false;
}

function BotsSimpleDisplay({ bots }: { bots: Bot[] }) {
    const botButtons = bots.map((bot) => {
        return <BotPopoverButton bot={bot} key={bot.name} />;
    });

    return <div className="bot-button-grid">{botButtons}</div>;
}

function BotsSpreadsheetDisplay({ bots }: { bots: Bot[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    return <Table className="table" data={bots} columns={botColumnDefs} setSorting={setSorting} sorting={sorting} stickyHeader={true} />;
}

export default function BotsPage() {
    const botData = useBotData();
    const spoilers = useSpoilers();

    const [_, setLocation] = useLocation();

    const pageState = getPageState();

    function updatePageState(newPageState: BotsPageState) {
        const location = getLocationFromState("/bots", newPageState, skipLocationMember);
        setLocation(location, { replace: true });
    }

    const bots = filterBots(pageState, botData);

    let pageContent: ReactNode | undefined;
    if (pageState.mode === "Spreadsheet") {
        pageContent = <BotsSpreadsheetDisplay bots={bots} />;
    } else {
        // Default to simple mode
        pageContent = <BotsSimpleDisplay bots={bots} />;
    }

    const factionButtons = allFactionButtons.filter((button) => canShowSpoiler(button.spoiler || "None", spoilers));

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledInput
                    label="Name"
                    placeholder="Any"
                    tooltip="The name of a bot to search for."
                    value={pageState.name || ""}
                    onChange={(val) => {
                        updatePageState({ ...pageState, name: val });
                    }}
                />
                <LabeledInput
                    label="Class"
                    placeholder="Any"
                    tooltip="The class of a bot to search for."
                    value={pageState.class || ""}
                    onChange={(val) => {
                        updatePageState({ ...pageState, class: val });
                    }}
                />
                <LabeledInput
                    label="Part"
                    placeholder="Any"
                    tooltip="The name of a part to search for."
                    value={pageState.part || ""}
                    onChange={(val) => {
                        updatePageState({ ...pageState, part: val });
                    }}
                />
                <LabeledExclusiveButtonGroup
                    label="Mode"
                    buttons={modeButtons}
                    className="flex-grow-0"
                    tooltip="The mode to display the parts in."
                    selected={pageState.mode}
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, mode: val });
                    }}
                />
                <Button
                    className="flex-grow-0"
                    tooltip="Resets all filters to their default (unfiltered) state"
                    onClick={() => {
                        updatePageState({
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
                    selected={pageState.faction}
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, faction: val });
                    }}
                />
            </div>
            {pageContent}
        </div>
    );
}
