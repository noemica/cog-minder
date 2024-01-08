import { useState } from "react";

import machines from "../../../../json/machine_hacks.json";
import { JsonHack, JsonHackableMachine } from "../../../hackTypes";
import { canShowSpoiler, createImagePath, parseIntOrDefault } from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import { LabeledExclusiveButtonGroup, LabeledInput } from "../../LabeledItem/LabeledItem";
import TextTooltip from "../../Popover/TextTooltip";

import "../pages.less";
import "./HacksPage.less";

type HasDataCore = "No" | "Yes";

type HacksPageState = {
    nameSearch?: string;
    dataCore?: HasDataCore;
    hackBonus?: string;
    corruptionPercent?: string;
    numOperators?: string;
    numBotnets?: string;
};

const dataCoreButtons: ExclusiveButtonDefinition<HasDataCore>[] = [{ value: "No" }, { value: "Yes" }];

function getHackingModifier(pageState: HacksPageState) {
    const hackBonus = parseIntOrDefault(pageState.hackBonus, 0);

    const numBotnets = parseIntOrDefault(pageState.numBotnets, 0);
    let botnetBonus = 0;
    if (numBotnets === 1) {
        botnetBonus = 6;
    } else if (numBotnets === 2) {
        botnetBonus = 9;
    } else if (numBotnets > 2) {
        botnetBonus = 9 + numBotnets - 2;
    }

    const numOperators = parseIntOrDefault(pageState.numOperators, 0);
    let operatorBonus = 0;
    if (numOperators === 1) {
        operatorBonus = 10;
    } else if (numOperators === 2) {
        operatorBonus = 15;
    } else if (numOperators === 3) {
        operatorBonus = 17;
    } else if (numOperators > 3) {
        operatorBonus = 17 + numOperators - 3;
    }

    const corruptionPenalty = Math.floor(parseIntOrDefault(pageState.corruptionPercent, 0) / 3);

    return hackBonus + botnetBonus + operatorBonus - corruptionPenalty;
}

function HackCell({ value }: { value: number | undefined }) {
    if (value === undefined) {
        return <td />;
    } else {
        return <td>{value}%</td>;
    }
}

function HackRow({
    dataCoreActive,
    hack,
    hackingModifier,
}: {
    dataCoreActive: boolean;
    hack: JsonHack;
    hackingModifier: number;
}) {
    const direct = hack.Indirect !== "Always";
    const indirect = hack.Indirect !== "Never";
    // Calculate the hack chances for direct/indirect hacks at
    // all terminal levels and apply hacking modifier
    // Indirect penalty is 15 per security level on top of the
    // standard security level penalty, level penalty is 100% for
    // level 1 terminal, 50% for level 2, and 25% for level 3
    let hackValues: (number | undefined)[];
    if (hack.Level1DirectOnly) {
        // Special case of restricted level 1 terminals with only 1 hack
        hackValues = [hack.BaseChance, undefined, undefined, undefined, undefined, undefined];
    } else {
        hackValues = [
            direct ? hack.BaseChance : undefined,
            indirect ? hack.BaseChance - (direct ? 15 : 0) : undefined,
            direct ? Math.floor(hack.BaseChance / 2) : undefined,
            indirect ? Math.floor(hack.BaseChance / 2) - (direct ? 30 : 0) : undefined,
            direct ? Math.floor(hack.BaseChance / 4) : undefined,
            indirect ? Math.floor(hack.BaseChance / 4) - (direct ? 45 : 0) : undefined,
        ];
    }

    hackValues = hackValues.map((value) => {
        if (value === undefined) {
            return undefined;
        }

        if (dataCoreActive && value > 0) {
            // If data core applies and is active then multiply the
            // base percentage by 1.5, only if > 0
            value = Math.floor(value * 1.5);
        }

        // Apply overall hacking modifier after data core boost
        value += hackingModifier;

        return value;
    });

    return (
        <tr className="hack-content-row">
            <TextTooltip tooltipText={hack.Description}>
                <td>{hack.Name}</td>
            </TextTooltip>
            {hackValues.map((value, i) => (
                <HackCell key={i} value={value} />
            ))}
        </tr>
    );
}

function HackHeaderRow({ machine }: { machine: JsonHackableMachine }) {
    return (
        <tr>
            <td className="hack-machine-header-cell">
                <p>{machine.Name}</p>
                <img src={createImagePath(`game_sprites/${machine.ImageName}`)} />
            </td>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
        </tr>
    );
}

function HacksTable({ pageState }: { pageState: HacksPageState }) {
    const spoilers = useSpoilers();
    const hackingModifier = getHackingModifier(pageState);

    const nameFilter = pageState.nameSearch?.toLowerCase() || "";
    const filterName = nameFilter.length > 0;

    function MachineRows({ machine }: { machine: JsonHackableMachine }) {
        const hacks = machine.Hacks.filter((hack) => {
            if (filterName && !hack.Name.toLowerCase().includes(nameFilter)) {
                return false;
            }

            if (!canShowSpoiler(hack.SpoilerLevel || "None", spoilers)) {
                return false;
            }

            return true;
        });

        if (hacks.length === 0) {
            return undefined;
        }

        return (
            <>
                <HackHeaderRow machine={machine} />
                {hacks.map((hack) => {
                    return (
                        <HackRow
                            key={hack.Name}
                            dataCoreActive={machine.DataCoreApplies && pageState.dataCore === "Yes"}
                            hack={hack}
                            hackingModifier={hackingModifier}
                        />
                    );
                })}
            </>
        );
    }

    return (
        <table cellSpacing={0} cellPadding={0} className="hack-table">
            <thead>
                <tr className="hack-header-row">
                    <th>Hack Command</th>
                    <th>1 Dir</th>
                    <th>1 Indir</th>
                    <th>2 Dir</th>
                    <th>2 Indir</th>
                    <th>3 Dir</th>
                    <th>3 Indir</th>
                </tr>
            </thead>
            <tbody>
                {machines.map((machine) => (
                    <MachineRows key={machine.Name} machine={machine as JsonHackableMachine} />
                ))}
            </tbody>
        </table>
    );
}

export default function HacksPage() {
    const [pageState, setPageState] = useState<HacksPageState>({});

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledInput
                    label="Name"
                    value={pageState.nameSearch}
                    onChange={(val) => setPageState({ ...pageState, nameSearch: val })}
                    placeholder="Any"
                    tooltip="The name of a hack to search for"
                />
                <LabeledExclusiveButtonGroup
                    label="Data Core"
                    className="flex-grow-0"
                    tooltip="Does Cogmind have a data core for the Terminal? Applicable to regular Terminals only."
                    buttons={dataCoreButtons}
                    selected={pageState.dataCore}
                    onValueChanged={(val) => setPageState({ ...pageState, dataCore: val })}
                />
                <Button
                    tooltip="Resets all filters to their default (unfiltered) state"
                    className="flex-grow-0"
                    onClick={() => setPageState({})}
                >
                    Reset
                </Button>
            </div>
            <div className="page-input-group">
                <LabeledInput
                    label="Hack Bonus"
                    value={pageState.hackBonus}
                    onChange={(val) => setPageState({ ...pageState, hackBonus: val })}
                    placeholder="0"
                    tooltip="The total bonus of all offensive hackware. For example, a standard Hacking Suite provides +10 bonus."
                />
                <LabeledInput
                    label="Corruption"
                    value={pageState.corruptionPercent}
                    onChange={(val) => setPageState({ ...pageState, corruptionPercent: val })}
                    placeholder="0%"
                    tooltip="Cogmind's current corruption. Every 3 points of corruption reduces success rates by 1%."
                />
                <LabeledInput
                    label="# Operators"
                    value={pageState.numOperators}
                    onChange={(val) => setPageState({ ...pageState, numOperators: val })}
                    placeholder="0"
                    tooltip="The number of active operator allies within 20 tiles. The first provides 10%, the second 5%, the third 2%, and all remaining provide 1% cumulative success rate to all hacks."
                />
                <LabeledInput
                    label="# Botnets"
                    value={pageState.numBotnets}
                    onChange={(val) => setPageState({ ...pageState, numBotnets: val })}
                    placeholder="0"
                    tooltip="The number of botnets installed on other Terminals. The first provides 6%, the second 3%, and all remaining provide 1% cumulative success rate to all hacks."
                />
            </div>
            <HacksTable pageState={pageState} />
        </div>
    );
}
