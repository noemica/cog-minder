import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import { CombatLogEntry, ChartDisplayOptions } from "../../types/commonTypes";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type CogmindPartsDestroyedChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function CogmindPartsDestroyedChart({
    combatLogEntries,
    displayOptions,
}: CogmindPartsDestroyedChartProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return (
        <CombatLogChart
            chartTitle="Cogmind's Parts Destroyed"
            values={values}
            displayOptions={displayOptions}
        ></CombatLogChart>
    );
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process non-core entries that destroyed a part on Cogmind
    processDamageEntry: (damageEntry) =>
        damageEntry.damagedPart !== "Core" &&
        damageEntry.targetDestroyed === true &&
        damageEntry.damagedEntity === "Cogmind",

    // Value just increments by 1
    getValue: (_entry, _damageEntry) => 1,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Target");
}
