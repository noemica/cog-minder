import { CombatLogEntry, CombatLogDamageEntry, CombatLogChartCategoryType, ChartDataValue } from "../types/combatTypes";
import { getBotClass } from "./botUtilities";
import { assertUnreachable } from "./common";
import { getItemDamageType, getItemSlot } from "./itemUtilities";

export type CombatChartLabelType = "Source" | "Target";

export type CombatLogChartValuesCallbacks = {
    processCombatLogEntry?: (entry: CombatLogEntry) => boolean;
    processDamageEntry?: (damageEntry: CombatLogDamageEntry) => boolean;
    getValue: (entry: CombatLogEntry, damageEntry: CombatLogDamageEntry) => number;
};

function getValueLabel(
    entry: CombatLogEntry,
    damageEntry: CombatLogDamageEntry,
    category: CombatLogChartCategoryType,
    labelType: CombatChartLabelType,
) {
    switch (labelType) {
        case "Source":
            switch (category) {
                case "Bot":
                    return entry.sourceEntity;

                case "Class":
                    return getBotClass(entry.sourceEntity);

                case "Damage Type":
                    return getItemDamageType(entry.sourceWeapon);

                case "Part":
                    return damageEntry.damagedPart;

                case "Slot":
                    return getItemSlot(damageEntry.damagedPart);

                case "Weapon":
                    return entry.sourceWeapon;

                default:
                    assertUnreachable(category);
            }
            break;

        case "Target":
            switch (category) {
                case "Bot":
                    return damageEntry.damagedEntity;

                case "Class":
                    return getBotClass(damageEntry.damagedEntity);

                case "Damage Type":
                    return getItemDamageType(entry.sourceWeapon);

                case "Part":
                    return damageEntry.damagedPart;

                case "Slot":
                    return getItemSlot(damageEntry.damagedPart);

                case "Weapon":
                    return entry.sourceWeapon;

                default:
                    assertUnreachable(category);
                    break;
            }
            break;

        default:
            assertUnreachable(labelType);
    }

    return "Unknown";
}

export function getValuesForCombatLogChart(
    combatLogEntries: CombatLogEntry[],
    category: CombatLogChartCategoryType,
    callbacks: CombatLogChartValuesCallbacks,
    labelType: CombatChartLabelType,
) {
    const values: ChartDataValue[] = [];

    const valueByLabel = new Map<string, number>();
    for (const entry of combatLogEntries) {
        // Check if we process this log entry, if undefined then always process
        if (callbacks.processCombatLogEntry !== undefined && !callbacks.processCombatLogEntry(entry)) {
            continue;
        }

        for (const damageEntry of entry.damageEntries) {
            // Check if we process this damage entry,
            // if undefined then always process
            if (callbacks.processDamageEntry !== undefined && !callbacks.processDamageEntry(damageEntry)) {
                continue;
            }

            // Get the label and value associated with this label
            const label = getValueLabel(entry, damageEntry, category, labelType);
            let value = valueByLabel.get(label);
            if (value === undefined) {
                value = 0;
            }

            // Update the value for this label
            value += callbacks.getValue(entry, damageEntry);
            valueByLabel.set(label, value);
        }
    }

    for (const [entity, value] of valueByLabel) {
        values.push({ label: entity, value: value });
    }

    return values;
}
