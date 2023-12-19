import { ChartDataValue, ChartDisplayOptions, CombatLogEntry } from "../../types/combatLogTypes";
import { assertUnreachable } from "../../utilities/common";
import { getItemDamageType } from "../../utilities/itemUtilities";
import CombatLogChart from "./CombatLogChart/CombatLogChart";

export type CogmindAccuracyChartProps = {
    combatLogEntries: CombatLogEntry[];
    displayOptions: ChartDisplayOptions;
};

export default function CogmindAccuracyChart({ combatLogEntries, displayOptions }: CogmindAccuracyChartProps) {
    displayOptions = { ...displayOptions, chartType: "Bar" };
    const values = getValues(combatLogEntries, displayOptions);
    return (
        <CombatLogChart
            chartTitle="Cogmind's Accuracy"
            values={values}
            displayOptions={displayOptions}
            valuesArePercentages={true}
        />
    );
}

function getValues(combatLogEntries: CombatLogEntry[], displayOptions: ChartDisplayOptions) {
    switch (displayOptions.category) {
        case "Bot":
        case "Class":
        case "Critical":
        case "Part":
        case "Slot":
            // Accuracy doesn't make sense for these categories
            return [];
    }

    const hitsPerTarget = new Map<string, { hits: number; total: number }>();

    for (const entry of combatLogEntries) {
        if (entry.sourceEntity !== "Cogmind") {
            continue;
        }

        let label: string;

        switch (displayOptions.category) {
            case "Damage Type":
                label = getItemDamageType(entry.sourceWeapon);
                break;

            case "Weapon":
                label = entry.sourceWeapon;
                break;

            default:
                assertUnreachable(displayOptions.category);
        }

        let hits = hitsPerTarget.get(label);
        if (hits === undefined) {
            hits = { hits: 0, total: 0 };
        }

        hits.hits += entry.projectilesHit;
        hits.total += entry.projectilesTotal;

        hitsPerTarget.set(label, hits);
    }

    const values: ChartDataValue[] = [];
    for (const [label, hits] of hitsPerTarget) {
        values.push({
            label,
            value: (hits.hits / hits.total) * 100,
        });
    }

    return values;
}
