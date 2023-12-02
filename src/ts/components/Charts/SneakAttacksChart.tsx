import { CombatLogChartValuesCallbacks, getValuesForCombatLogChart } from "../../utilities/chartUtilities";
import { CombatLogEntry, ChartDisplayOptions } from "../../types/commonTypes";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type SneakAttacksChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function SneakAttacksChart({ combatLogEntries, displayOptions }: SneakAttacksChartProps) {
    const values = getValues(combatLogEntries, displayOptions);
    return (
        <CombatLogChart
            chartTitle="Sneak Attacks by Cogmind"
            values={values}
            displayOptions={displayOptions}
        ></CombatLogChart>
    );
}

const callbacks: CombatLogChartValuesCallbacks = {
    // Process combat log entries sourced from Cogmind and are sneak attacks
    processCombatLogEntry: (entry) => entry.sourceEntity === "Cogmind" && entry.sneakAttack === true,

    // Value just increments by 1
    getValue: (_entry, _damageEntry) => 1,
};

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    return getValuesForCombatLogChart(combatLogEntries, displayOptions.category, callbacks, "Target");
}
