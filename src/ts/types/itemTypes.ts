import { BotResistances } from "../botTypes";
import { Spoiler } from "./commonTypes";

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

export enum ItemRatingCategory {
    Alien = "Alien",
    Prototype = "Prototype",
    None = "",
}

export type ItemCategory =
    | "0b10"
    | "Alien"
    | "Architects"
    | "Derelict"
    | "Exile"
    | "Golem"
    | "Heroes"
    | "Lab"
    | "Quarantine"
    | "Redacted"
    | "S7 Guarded"
    | "S7 Hangar"
    | "S7 LRC Lab"
    | "S7 Unguarded"
    | "Spoiler"
    | "Testing"
    | "Unobtainable"
    | "Warlord"
    | "Zion"
    | "Zionite";

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
    Impale = "Impale",
    Intensify = "Intensify",
    Phase = "Phase",
    Smash = "Smash",
    Sever = "Sever",
    Sunder = "Sunder",
}

export type SpecialPropertyActive = "Always" | "Part Active";

export type Actuator = { kind: "Actuator"; amount: number };
export type ActuatorArray = { kind: "ActuatorArray"; amount: number };
export type AirborneSpeedDoubling = { kind: "AirborneSpeedDoubling" };
export type AntimissileChance = { kind: "AntimissileChance"; chance: number };
export type CombatSuite = { kind: "CombatSuite"; core: 8; rangedAvoid: 8; targeting: 8 };
export type CoreAnalyzer = { kind: "CoreAnalyzer"; bonus: number };
export type CorruptionIgnore = { kind: "CorruptionIgnore"; chance: number };
export type CorruptionPrevent = { kind: "CorruptionPrevent"; amount: number };
export type CorruptionReduce = { kind: "CorruptionReduce"; amount: number };
export type CriticalImmunity = { kind: "CriticalImmunity" };
export type DamageReduction = { kind: "DamageReduction"; multiplier: number; remote: boolean };
export type DamageResists = { kind: "DamageResists"; resists: BotResistances };
export type EnergyFilter = { kind: "EnergyFilter"; percent: number };
export type EnergyStorage = { kind: "EnergyStorage"; storage: number };
export type FusionCompressor = { kind: "FusionCompressor"; energyPerTurn: number };
export type HeatDissipation = { kind: "HeatDissipation"; dissipation: number };
export type LauncherGuidance = { kind: "LauncherGuidance"; bonus: number };
export type LauncherLoader = { kind: "LauncherLoader" };
export type MassSupport = { kind: "MassSupport"; support: number };
export type Metafiber = { kind: "Metafiber" };
export type PowerAmplifier = { kind: "PowerAmplifier"; percent: number };
export type QuantumCapacitor = { kind: "QuantumCapacitor" };
export type ParticleCharging = { kind: "ParticleCharging"; percent: number };
export type RangedAvoid = { kind: "RangedAvoid"; avoid: number };
export type RangedWeaponCycling = { kind: "RangedWeaponCycling"; amount: number };
export type ReactionControlSystem = { kind: "ReactionControlSystem"; chance: number; legsChance: number };
export type RecoilReduction = { kind: "RecoilReduction"; reduction: number };
export type SalvageTargeting = { kind: "SalvageTargeting"; amount: number };
export type SelfReduction = { kind: "SelfReduction"; shielding: number };
export type Shielding = { kind: "Shielding"; shielding: number; slot: ItemSlot | "Core" };
export type TargetAnalyzer = { kind: "TargetAnalyzer"; bonus: number };
export type Targeting = { kind: "Targeting"; bonus: number };
export type WeaponRegen = { kind: "WeaponRegen"; energyPerTurn: number; integrityPerTurn: number };

export type SpecialPropertyType =
    | Actuator
    | ActuatorArray
    | AntimissileChance
    | AirborneSpeedDoubling
    | CombatSuite
    | CoreAnalyzer
    | CorruptionIgnore
    | CorruptionPrevent
    | CorruptionReduce
    | CriticalImmunity
    | DamageReduction
    | DamageResists
    | EnergyFilter
    | EnergyStorage
    | FusionCompressor
    | HeatDissipation
    | LauncherLoader
    | LauncherGuidance
    | MassSupport
    | Metafiber
    | ParticleCharging
    | PowerAmplifier
    | QuantumCapacitor
    | RangedAvoid
    | RangedWeaponCycling
    | ReactionControlSystem
    | RecoilReduction
    | SalvageTargeting
    | SelfReduction
    | Shielding
    | TargetAnalyzer
    | Targeting
    | WeaponRegen;

export type SpecialPropertyTypeName =
    | "Actuator"
    | "ActuatorArray"
    | "AirborneSpeedDoubling"
    | "AntimissileChance"
    | "CombatSuite"
    | "CoreAnalyzer"
    | "CorruptionIgnore"
    | "CorruptionPrevent"
    | "CorruptionReduce"
    | "CriticalImmunity"
    | "DamageReduction"
    | "DamageResists"
    | "EnergyFilter"
    | "EnergyStorage"
    | "FusionCompressor"
    | "HeatDissipation"
    | "LauncherLoader"
    | "LauncherGuidance"
    | "MassSupport"
    | "Metafiber"
    | "ParticleCharging"
    | "PowerAmplifier"
    | "QuantumCapacitor"
    | "RangedAvoid"
    | "RangedWeaponCycling"
    | "ReactionControlSystem"
    | "RecoilReduction"
    | "SalvageTargeting"
    | "SelfReduction"
    | "Shielding"
    | "TargetAnalyzer"
    | "Targeting"
    | "WeaponRegen";

export type SpecialItemProperty = {
    active: SpecialPropertyActive;
    trait: SpecialPropertyType;
};

export type FabricationStats = {
    number: string;
    time: string;
};

export type BaseItem = {
    slot: ItemSlot;
    hackable: boolean;
    name: string;
    noPrefixName: string;
    fullName: string;
    type: ItemType;
    rating: number;
    ratingString: string;
    category: ItemRatingCategory;
    size: number;
    mass?: number;
    integrity: number;
    noRepairs: boolean;
    coverage?: number;
    effect?: string;
    description?: string;
    categories: ItemCategory[];
    fabrication?: FabricationStats;
    index: number;
    specialProperty?: SpecialItemProperty;
    specialTrait?: string;
    spoiler: Spoiler;
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
        explosionRadius?: number;
        explosionDamage?: string;
        explosionDamageMin: number;
        explosionDamageMax: number;
        falloff?: string;
        minChunks?: number;
        maxChunks?: number;
        explosionType?: DamageType;
        explosionHeatTransfer?: HeatTransfer;
        explosionSpectrum?: Spectrum;
        explosionDisruption: number;
        explosionSalvage: number;
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

export type UtilityItem = BaseItem & ItemWithUpkeep;

export type WeaponItem = BaseItem & {
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
    falloff?: number;
    minChunks?: number;
    maxChunks?: number;
    explosionType?: DamageType;
    explosionHeatTransfer?: HeatTransfer;
    arc?: number;
    waypoints?: string;
    explosionSpectrum?: Spectrum;
    explosionDisruption?: number;
    explosionSalvage?: number;
    recoil?: number;
    life?: string;
};

export type Item = OtherItem | PowerItem | PropulsionItem | UtilityItem | WeaponItem;

export type JsonItem = {
    Slot: ItemSlot;
    Name: string;
    "Full Name": string;
    Type: ItemType;
    Rating: string;
    Size: string;
    Integrity: string;
    "No Repairs"?: string;
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
    Damage?: string;
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
    "Explosion Damage"?: string;
    "Explosion Damage Min"?: string;
    "Explosion Damage Max"?: string;
    Falloff?: string;
    Chunks?: string;
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
