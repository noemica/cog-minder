import { CombatLogEntry, ChartDisplayOptions } from "../../types/combatLogTypes";
import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type PartsDestroyedByCogmindChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function PartsDestroyedByCogmindChart({
    combatLogEntries,
    displayOptions,
}: PartsDestroyedByCogmindChartProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return (
        <CombatLogChart
            chartTitle="Parts Destroyed by Cogmind"
            values={values}
            displayOptions={displayOptions}
        />
    );
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process parts destroyed by Cogmind
    processCombatLogEntry: (entry) => entry.sourceEntity === "Cogmind",

    // Process non-core entries that destroyed a part
    processDamageEntry: (damageEntry) => damageEntry.damagedPart !== "Core" && damageEntry.targetDestroyed === true,

    // Value just increments by 1
    getValue: (_entry, _damageEntry) => 1,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Target");
}
