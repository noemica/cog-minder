import { useLocation, useSearch } from "wouter";

import machines from "../../../../json/machine_hacks.json";
import { JsonHack, JsonHackableMachine } from "../../../types/hackTypes";
import {
    canShowSpoiler,
    createImagePath,
    getLocationFromState,
    parseIntOrDefault,
    parseSearchParameters,
} from "../../../utilities/common";
import Button from "../../Buttons/Button";
import { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import { LabeledExclusiveButtonGroup, LabeledInput } from "../../LabeledItem/LabeledItem";
import TextTooltip from "../../Popover/TextTooltip";
import TextTooltipButton from "../../Popover/TextTooltipButton";

import "../Pages.less";
import "./HacksPage.less";
import { calculateHackPercentages } from "../../../utilities/hackUtilities";

type HasDataCore = "No" | "Yes";

type HacksPageState = {
    name?: string;
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

function getPageState(): HacksPageState {
    const search = useSearch();

    return parseSearchParameters(search, {});
}

function skipLocationMember(key: string, pageState: HacksPageState) {
    const typedKey: keyof HacksPageState = key as keyof HacksPageState;

    if (typedKey === "dataCore" && pageState.dataCore === "No") {
        // Skip enum default values
        return true;
    }

    return false;
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
    let hackValues = calculateHackPercentages(hack);

    hackValues = hackValues.map((value) => {
        if (value === undefined) {
            return undefined;
        }

        if (dataCoreActive) {
            // If data core applies and is active then multiply the
            // base percentage by 1.5, only if > 0
            value = Math.floor(value * 1.5);

            // After applying the multiplier, the base value is also max'd
            // to 0 so negative success hacks can't occur with a data core
            value = Math.max(0, value);
        }

        // Apply overall hacking modifier after data core boost
        value += hackingModifier;

        return value;
    });

    return (
        <tr className="hack-content-row">
            <td>
                <span>{hack.Name}</span>
                <TextTooltipButton className="hack-info-button" tooltipText={hack.Description}>
                    ?
                </TextTooltipButton>
            </td>
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

    const nameFilter = pageState.name?.toLowerCase() || "";
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
                    <th>
                        <TextTooltip tooltipText="The hack name to type into a machine.">Hack Name</TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The success rate of a direct hack at a level 1 machine.">
                            1 Dir
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The success rate of an indirect hack (aka manual hack) at a level 1 machine.">
                            1 Indir
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The success rate of a direct hack at a level 2 machine.">
                            2 Dir
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The success rate of an indirect hack (aka manual hack) at a level 2 machine.">
                            2 Indir
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The success rate of a direct hack at a level 3 machine.">
                            3 Dir
                        </TextTooltip>
                    </th>
                    <th>
                        <TextTooltip tooltipText="The success rate of an indirect hack (aka manual hack) at a level 3 machine.">
                            3 Indir
                        </TextTooltip>
                    </th>
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
    const [_, setLocation] = useLocation();

    const pageState = getPageState();

    function updatePageState(newPageState: HacksPageState) {
        const location = getLocationFromState("/hacks", newPageState, skipLocationMember);
        setLocation(location, { replace: true });
    }

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledInput
                    label="Name"
                    value={pageState.name || ""}
                    onChange={(val) => updatePageState({ ...pageState, name: val })}
                    placeholder="Any"
                    tooltip="The name of a hack to search for"
                />
                <LabeledExclusiveButtonGroup
                    label="Data Core"
                    className="flex-grow-0"
                    tooltip="Does Cogmind have a data core for the Terminal? Applicable to regular Terminals only."
                    buttons={dataCoreButtons}
                    selected={pageState.dataCore}
                    onValueChanged={(val) => updatePageState({ ...pageState, dataCore: val })}
                />
                <Button
                    tooltip="Resets all filters to their default (unfiltered) state"
                    className="flex-grow-0"
                    onClick={() => updatePageState({})}
                >
                    Reset
                </Button>
            </div>
            <div className="page-input-group">
                <LabeledInput
                    label="Hack Bonus"
                    value={pageState.hackBonus || ""}
                    onChange={(val) => updatePageState({ ...pageState, hackBonus: val })}
                    placeholder="0"
                    tooltip="The total bonus of all offensive hackware. For example, a standard Hacking Suite provides +10 bonus."
                />
                <LabeledInput
                    label="Corruption"
                    value={pageState.corruptionPercent || ""}
                    onChange={(val) => updatePageState({ ...pageState, corruptionPercent: val })}
                    placeholder="0%"
                    tooltip="Cogmind's current corruption. Every 3 points of corruption reduces success rates by 1%."
                />
                <LabeledInput
                    label="# Operators"
                    value={pageState.numOperators || ""}
                    onChange={(val) => updatePageState({ ...pageState, numOperators: val })}
                    placeholder="0"
                    tooltip="The number of active operator allies within 20 tiles. The first provides 10%, the second 5%, the third 2%, and all remaining provide 1% cumulative success rate to all hacks."
                />
                <LabeledInput
                    label="# Botnets"
                    value={pageState.numBotnets || ""}
                    onChange={(val) => updatePageState({ ...pageState, numBotnets: val })}
                    placeholder="0"
                    tooltip="The number of botnets installed on other Terminals. The first provides 6%, the second 3%, and all remaining provide 1% cumulative success rate to all hacks."
                />
            </div>
            <HacksTable pageState={pageState} />
        </div>
    );
}
