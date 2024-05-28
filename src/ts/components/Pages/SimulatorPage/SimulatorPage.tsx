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

import "../pages.less";
import "./SimulatorPage.less";

type CombatType = "Ranged" | "Melee";

type SimulatorPageState = {
    combatType?: CombatType;
    numFights?: string;
};

const combatTypeButtons: ExclusiveButtonDefinition<CombatType>[] = [
    {
        value: "Ranged",
    },
    {
        value: "Melee",
    },
];

function getPageState(): SimulatorPageState {
    const search = useSearch();

    return parseSearchParameters(search, {});
}

function skipLocationMember(key: string, pageState: SimulatorPageState) {
    const typedKey: keyof SimulatorPageState = key as keyof SimulatorPageState;

    // if (typedKey === "dataCore" && pageState.dataCore === "No") {
    //     // Skip enum default values
    //     return true;
    // }

    return false;
}

export default function SimulatorPage() {
    const [_, setLocation] = useLocation();

    const pageState = getPageState();

    function updatePageState(newPageState: SimulatorPageState) {
        const location = getLocationFromState("/simulator", newPageState, skipLocationMember);
        setLocation(location, { replace: true });
    }

    return (
        <div className="page-content">
            <div className="page-input-group">
                <LabeledExclusiveButtonGroup
                    label="Combat Type"
                    buttons={combatTypeButtons}
                    className="flex-grow-0"
                    tooltip="The type of weapons to display. Melee and ranged weapons also have unique utilities and other settings."
                    selected={pageState.combatType}
                    onValueChanged={(val) => {
                        updatePageState({ ...pageState, combatType: val });
                    }}
                />
                <LabeledInput
                    label="Number of Fights"
                    value={pageState.numFights}
                    onChange={(val) => updatePageState({ ...pageState, numFights: val })}
                    placeholder="100,000"
                    tooltip="The number of fights to simulate. High numbers will increase result accuracy but also increase time to calculate."
                />
                <Button
                    tooltip="Resets all values to their default state"
                    className="flex-grow-0"
                    onClick={() => updatePageState({})}
                >
                    Reset
                </Button>
            </div>
        </div>
    );
}
