import { ChartDisplayOptions, CombatLogEntry } from "../../types/combatLogTypes";
import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type OverflowDamageDealtChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function OverflowDamageDealtChart({ combatLogEntries, displayOptions }: OverflowDamageDealtChartProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return <CombatLogChart chartTitle="Overflow Damage Dealt" values={values} displayOptions={displayOptions} />;
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process combat log entries sourced from Cogmind
    processCombatLogEntry: (entry) => entry.sourceEntity === "Cogmind",

    // Process damage entries that have damage values and are overflow damage
    processDamageEntry: (damageEntry) => damageEntry.damageDealt !== undefined && damageEntry.damageOverflow === true,

    // Value is damage dealt
    getValue: (entry, damageEntry) => damageEntry.damageDealt!,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Target");
}
