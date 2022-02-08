export enum DamageType {
    Electromagnetic = "Electromagnetic",
    Entropic = "Entropic",
    Explosive = "Explosive",
    Impact = "Impact",
    Kinetic = "Kinetic",
    Phasic = "Phasic",
    Piercing = "Piercing",
    Slashing = "Slashing",
    Special = "Special",
    Thermal = "Thermal",
}

export enum HeatTransfer {
    Minimal = "Minimal (5)",
    Low = "Low (25)",
    Medium = "Medium (37)",
    High = "High (50)",
    Massive = "Massive (80)",
}

export enum ItemCategory {
    Alien = "Alien",
    Prototype = "Prototype",
    None = "",
}

export type ItemSlot = "N/A" | "Power" | "Propulsion" | "Utility" | "Weapon";

export interface ItemWithUpkeep {
    energyUpkeep?: number;
    matterUpkeep?: number;
    heatGeneration?: number;
}

export enum ItemType {
    Artifact = "Artifact",
    BallisticCannon = "Ballistic Cannon",
    BallisticGun = "Ballistic Gun",
    DataCore = "Data Core",
    Device = "Device",
    EnergyCannon = "Energy Cannon",
    EnergyGun = "Energy Gun",
    Engine = "Engine",
    FlightUnit = "Flight Unit",
    Hackware = "Hackware",
    HoverUnit = "Hover Unit",
    ImpactWeapon = "Impact Weapon",
    Item = "Item",
    Launcher = "Launcher",
    Leg = "Leg",
    Matter = "Matter",
    PiercingWeapon = "Piercing Weapon",
    PowerCore = "Power Core",
    Processor = "Processor",
    Protection = "Protection",
    Protomatter = "Protomatter",
    Reactor = "Reactor",
    Scrap = "Scrap",
    SlashingWeapon = "Slashing Weapon",
    SpecialMeleeWeapon = "Special Melee Weapon",
    SpecialWeapon = "Special Weapon",
    Storage = "Storage",
    Trap = "Trap",
    Treads = "Treads",
    Wheel = "Wheel",
}

export enum SiegeMode {
    High = "High",
    Standard = "Standard",
}

export enum Spectrum {
    Wide = "Wide (10)",
    Intermediate = "Intermediate (30)",
    Narrow = "Narrow (50)",
    Fine = "Fine (100)",
}

export enum Critical {
    Blast = "Blast",
    Burn = "Burn",
    Corrupt = "Corrupt",
    Destroy = "Destroy",
    Detonate = "Detonate",
    Meltdown = "Meltdown",
    Intensify = "Intensify",
    Phase = "Phase",
    Puncture = "Puncture",
    Smash = "Smash",
    Sever = "Sever",
    Sunder = "Sunder",
}

export type SpecialPropertyActive = "Always" | "Part Active";

export type Actuator = { kind: "Actuator"; amount: number };
export type AntimissileChance = { kind: "AntimissileChance"; chance: number };
export type AvoidChance = { kind: "AvoidChance"; chance: number };
export type CoreShielding = { kind: "CoreShielding"; shielding: number };
export type CorruptionIgnore = { kind: "CorruptionIgnore"; chance: number };
export type DamageReduction = { kind: "DamageReduction"; chance: number };
export type DamageResists = { kind: "DamageResists"; resists: Record<DamageType, number> };
export type EnergyFilter = { kind: "EnergyFilter"; percent: number };
export type EnergyStorage = { kind: "EnergyStorage"; storage: number };
export type FusionCompressor = { kind: "FusionCompressor"; energyPerTurn: number };
export type HeatDissipation = { kind: "HeatDissipation"; dissipation: number };
export type MassSupport = { kind: "MassSupport"; support: number };
export type PowerAmplifier = { kind: "PowerAmplifier"; percent: number };
export type PowerShielding = { kind: "PowerShielding"; shielding: number };
export type PropulsionShielding = { kind: "PropulsionShielding"; shielding: number };
export type RangedAvoid = { kind: "RangedAvoid"; avoid: number };
export type RangedWeaponCycling = { kind: "RangedWeaponCycling"; amount: number };
export type SelfReduction = { kind: "SelfReduction"; shielding: number };
export type UtilityShielding = { kind: "UtilityShielding"; shielding: number };
export type WeaponRegen = { kind: "WeaponRegen"; energyPerTurn: number; integrityPerTurn: number };
export type WeaponShielding = { kind: "WeaponShielding"; shielding: number };

export type SpecialPropertyType =
    | Actuator
    | AntimissileChance
    | AvoidChance
    | CoreShielding
    | CorruptionIgnore
    | DamageReduction
    | DamageResists
    | EnergyFilter
    | EnergyStorage
    | FusionCompressor
    | HeatDissipation
    | MassSupport
    | PowerAmplifier
    | PowerShielding
    | PropulsionShielding
    | RangedAvoid
    | RangedWeaponCycling
    | SelfReduction
    | UtilityShielding
    | WeaponRegen
    | WeaponShielding;

export type SpecialPropertyTypeName =
    | "Actuator"
    | "AntimissileChance"
    | "AvoidChance"
    | "CoreShielding"
    | "CorruptionIgnore"
    | "DamageReduction"
    | "DamageResists"
    | "EnergyFilter"
    | "EnergyStorage"
    | "FusionCompressor"
    | "HeatDissipation"
    | "MassSupport"
    | "PowerAmplifier"
    | "PowerShielding"
    | "PropulsionShielding"
    | "RangedAvoid"
    | "RangedWeaponCycling"
    | "SelfReduction"
    | "UtilityShielding"
    | "WeaponRegen"
    | "WeaponShielding";

export type SpecialItemProperty = {
    active: SpecialPropertyActive;
    trait: SpecialPropertyType;
};

export type FabricationStats = {
    number: string;
    time: string;
    matter: string;
};

export type BaseItem = {
    slot: ItemSlot;
    hackable: boolean;
    name: string;
    noPrefixName: string;
    type: ItemType;
    rating: number;
    ratingString: string;
    category: ItemCategory;
    size: number;
    mass?: number;
    integrity: number;
    coverage?: number;
    effect?: string;
    description?: string;
    categories: number[];
    fabrication?: FabricationStats;
    index: number;
    specialProperty?: SpecialItemProperty;
};

export type OtherItem = BaseItem & {
    life?: string;
};

export type PowerItem = BaseItem &
    ItemWithUpkeep & {
        heatGeneration?: number;
        energyGeneration?: number;
        energyStorage?: number;
        powerStability?: number;
    };

export type PropulsionItem = BaseItem &
    ItemWithUpkeep & {
        timePerMove: number;
        modPerExtra?: number;
        drag?: number;
        energyPerMove?: number;
        heatPerMove?: number;
        support: number;
        penalty: number;
        burnout?: string;
        siege?: SiegeMode;
    };

export type UtilityItem = BaseItem &
    ItemWithUpkeep & {
        specialTrait?: string;
    };

export type WeaponItem = BaseItem & {
    specialTrait?: string;
    range: number;
    shotEnergy?: number;
    shotHeat?: number;
    shotMatter?: number;
    projectileCount: number;
    damage?: string;
    damageMin?: number;
    damageMax?: number;
    damageType?: DamageType;
    spectrum?: Spectrum;
    disruption?: number;
    salvage?: number;
    critical?: number;
    criticalType?: Critical;
    criticalString?: string;
    targeting?: number;
    penetration?: string;
    delay?: number;
    heatTransfer?: HeatTransfer;
    overloadStability?: number;
    explosionRadius?: number;
    explosionDamage?: string;
    explosionDamageMin?: number;
    explosionDamageMax?: number;
    falloff?: string;
    explosionType?: DamageType;
    explosionHeatTransfer?: HeatTransfer;
    arc?: number;
    waypoints?: string;
    explosionSpectrum?: Spectrum;
    explosionDisruption?: number;
    explosionSalvage?: string;
    recoil?: number;
    life?: string;
};

export type Item = OtherItem | PowerItem | PropulsionItem | UtilityItem | WeaponItem;

export type JsonItem = {
    Slot: ItemSlot;
    Name: string;
    Type: ItemType;
    Rating: string;
    Size: string;
    Integrity: string;
    Description?: string;
    Index: number;
    "Hackable Schematic"?: string;
    Mass?: string;
    Coverage?: string;
    "Heat Generation"?: string;
    "Energy Generation"?: string;
    "Energy Storage"?: string;
    "Fabrication Number"?: string;
    "Fabrication Time"?: string;
    "Fabrication Matter"?: string;
    Category?: string;
    "Power Stability"?: string;
    Effect?: string;
    "Time/Move"?: string;
    Drag?: string;
    "Energy/Move"?: string;
    "Heat/Move"?: string;
    Support?: string;
    Penalty?: string;
    Siege?: SiegeMode;
    Burnout?: string;
    "Energy Upkeep"?: string;
    "Mod/Extra"?: string;
    "Matter Upkeep"?: string;
    "Special Trait"?: string;
    Range?: string;
    "Shot Energy"?: string;
    "Shot Heat"?: string;
    "Projectile Count"?: string;
    "Damage Min"?: string;
    "Damage Max"?: string;
    "Damage Type"?: DamageType;
    Spectrum?: Spectrum;
    Arc?: string;
    Disruption?: string;
    Salvage?: string;
    Critical?: string;
    Targeting?: string;
    Penetration?: string;
    Delay?: string;
    "Heat Transfer"?: HeatTransfer;
    "Overload Stability"?: string;
    "Explosion Radius"?: string;
    "Explosion Damage Min"?: string;
    "Explosion Damage Max"?: string;
    Falloff?: string;
    "Explosion Type"?: DamageType;
    "Explosion Heat Transfer"?: HeatTransfer;
    Waypoints?: string;
    "Explosion Spectrum"?: Spectrum;
    "Explosion Disruption"?: string;
    "Explosion Salvage"?: string;
    "Shot Matter"?: string;
    Recoil?: string;
    Life?: string;
};
