import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import { CombatLogEntry, ChartDisplayOptions } from "../../types/commonTypes";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type OverflowDamageReceivedChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function OverflowDamageReceivedChart({
    combatLogEntries,
    displayOptions,
}: OverflowDamageReceivedChartProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return (
        <CombatLogChart chartTitle="Damage Received" values={values} displayOptions={displayOptions}></CombatLogChart>
    );
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process damage entries that have damage values and that hit Cogmind
    processDamageEntry: (damageEntry) =>
        damageEntry.damageDealt !== undefined && damageEntry.damagedEntity === "Cogmind",

    // Value is damage dealt
    getValue: (entry, damageEntry) => damageEntry.damageDealt!,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Source");
}
