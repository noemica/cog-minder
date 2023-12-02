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
    weaponAccuracy: number;
};

export type ChartDataValue = {
    label: string;
    value: number;
};

export type CombatLogChartCategoryType = "Bot" | "Class" | "Damage Type" | "Part" | "Slot" | "Weapon";

export type CombatLogChartType = "Pie" | "Bar";

// Display options used by the charts
export type ChartDisplayOptions = {
    category: CombatLogChartCategoryType;
    chartType: CombatLogChartType;
};
