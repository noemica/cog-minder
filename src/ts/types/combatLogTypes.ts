// Combat log damage entry
export type CombatLogDamageEntry = {
    damagedEntity: string;
    damagedPart: string;
    damageDealt?: number;
    damageOverflow?: boolean;
    targetDestroyed?: boolean;
    criticalHitType?: string;
};

// Basic combat log entry
export type CombatLogEntry = {
    damageEntries: CombatLogDamageEntry[];
    projectilesHit: number;
    projectilesTotal: number;
    sneakAttack?: boolean;
    sourceEntity: string;
    sourceWeapon: string;
    turn?: number;
    weaponAccuracy?: number;
};

export type ChartDataValue = {
    label: string;
    value: number;
};

export type CombatLogChartCategoryType = "Bot" | "Class" | "Critical" | "Damage Type" | "Part" | "Slot" | "Weapon";
const combatLogChartCategoryTypes: CombatLogChartCategoryType[] = [
    "Bot",
    "Class",
    "Critical",
    "Damage Type",
    "Part",
    "Slot",
    "Weapon",
];
export function isValidCombatLogChartCategoryType(value: CombatLogChartCategoryType): boolean {
    return combatLogChartCategoryTypes.includes(value);
}

export type CombatLogChartType = "Bar" | "Pie";
const combatLogChartTypes: CombatLogChartType[] = ["Bar", "Pie"];
export function isValidCombatLogChartType(value: CombatLogChartType): boolean {
    return combatLogChartTypes.includes(value);
}

// Display options used by the charts
export type ChartDisplayOptions = {
    category: CombatLogChartCategoryType;
    chartType: CombatLogChartType;
};
