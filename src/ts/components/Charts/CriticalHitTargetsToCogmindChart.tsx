import { ChartDisplayOptions, CombatLogEntry } from "../../types/combatLogTypes";
import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type CriticalHitsToCogmindProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function CriticalHitTargetsToCogmind({ combatLogEntries, displayOptions }: CriticalHitsToCogmindProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return <CombatLogChart chartTitle="Critical Hits to Cogmind" values={values} displayOptions={displayOptions} />;
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process combat log entries not sourced from Cogmind
    processCombatLogEntry: (entry) => entry.sourceEntity !== "Cogmind",

    // Process critical hit effects
    processDamageEntry: (damageEntry) => damageEntry.criticalHitType !== undefined,

    // Value just increments by 1
    getValue: (_entry, _damageEntry) => 1,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Source");
}
