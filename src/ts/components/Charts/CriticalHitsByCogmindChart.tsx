import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import { CombatLogEntry, ChartDisplayOptions } from "../../types/commonTypes";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type CriticalHitsByCogmindProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function CriticalHitsByCogmind({ combatLogEntries, displayOptions }: CriticalHitsByCogmindProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return (
        <CombatLogChart
            chartTitle="Critical Hits by Cogmind"
            values={values}
            displayOptions={displayOptions}
        ></CombatLogChart>
    );
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process combat log entries sourced from Cogmind
    processCombatLogEntry: (entry) => entry.sourceEntity === "Cogmind",

    // Process critical hit effects
    processDamageEntry: (damageEntry) => damageEntry.criticalHitType !== undefined,

    // Value just increments by 1
    getValue: (_entry, _damageEntry) => 1,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Target");
}
