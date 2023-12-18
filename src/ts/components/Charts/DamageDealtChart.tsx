import { CombatLogEntry, ChartDisplayOptions } from "../../types/combatLogTypes";
import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type DamageDealtChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function DamageDealtChart({ combatLogEntries, displayOptions }: DamageDealtChartProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return <CombatLogChart chartTitle="Damage Dealt" values={values} displayOptions={displayOptions}></CombatLogChart>;
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process combat log entries sourced from Cogmind
    processCombatLogEntry: (entry) => entry.sourceEntity === "Cogmind",

    // Process damage entries that have damage values
    processDamageEntry: (damageEntry) => damageEntry.damageDealt !== undefined,

    // Value is damage dealt
    getValue: (entry, damageEntry) => damageEntry.damageDealt!,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Target");
}
