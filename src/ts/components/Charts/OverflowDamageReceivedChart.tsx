import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import { CombatLogEntry, ChartDisplayOptions } from "../../types/commonTypes";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type DamageReceivedChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function DamageReceivedChart({ combatLogEntries, displayOptions }: DamageReceivedChartProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return (
        <CombatLogChart
            chartTitle="Overflow Damage Received"
            values={values}
            displayOptions={displayOptions}
        ></CombatLogChart>
    );
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process damage entries that have damage values, hit Cogmind,
    // and are overflow damage
    processDamageEntry: (damageEntry) =>
        damageEntry.damageDealt !== undefined &&
        damageEntry.damagedEntity === "Cogmind" &&
        damageEntry.damageOverflow === true,

    // Value is damage dealt
    getValue: (entry, damageEntry) => damageEntry.damageDealt!,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Source");
}
