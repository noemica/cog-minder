import { BotResistances } from "./botTypes";
import { Spoiler } from "./commonTypes";

export type DamageType =
    | "Electromagnetic"
    | "Entropic"
    | "Explosive"
    | "Impact"
    | "Kinetic"
    | "Phasic"
    | "Piercing"
    | "Slashing"
    | "Special"
    | "Thermal";

export type HeatTransfer =
    | "Minimal (5)"
    | "Low (25)"
    | "Medium (37)"
    | "High (50)"
    | "Massive (80)";

export type ItemRatingCategory =
    | "Alien"
    | "Prototype"
    | "None";

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
    | "Protoforge"
    | "Redacted"
    | "S7 Guarded"
    | "S7 Hangar"
    | "S7 LRC Lab"
    | "S7 Unguarded"
    | "Spoiler"
    | "Testing"
    | "Unobtainable"
    | "UFD"
    | "Warlord"
    | "Zion"
    | "Zionite";

export type ItemSlot = "N/A" | "Power" | "Propulsion" | "Utility" | "Weapon";

export interface ItemWithUpkeep {
    energyUpkeep?: number;
    matterUpkeep?: number;
    heatGeneration?: number;
}

export type ItemType =
    | "Artifact"
    | "Ballistic Cannon"
    | "Ballistic Gun"
    | "Data Core"
    | "Device"
    | "Energy Cannon"
    | "Energy Gun"
    | "Engine"
    | "Flight Unit"
    | "Hackware"
    | "Hover Unit"
    | "Impact Weapon"
    | "Item"
    | "Launcher"
    | "Leg"
    | "Matter"
    | "Piercing Weapon"
    | "Power Core"
    | "Processor"
    | "Protection"
    | "Protomatter"
    | "Reactor"
    | "Scrap"
    | "Slashing Weapon"
    | "Special Melee Weapon"
    | "Special Weapon"
    | "Storage"
    | "Trap"
    | "Treads"
    | "Wheel";

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
export type CryofiberWeb = { kind: "CryofiberWeb" };
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
export type MniQuantumCapacitor = { kind: "MniQuantumCapacitor" };
export type PowerAmplifier = { kind: "PowerAmplifier"; percent: number };
export type QuantumCapacitor = { kind: "QuantumCapacitor" };
export type ParticleCharging = { kind: "ParticleCharging"; percent: number };
export type RangedAvoid = { kind: "RangedAvoid"; avoid: number };
export type RangedWeaponCycling = { kind: "RangedWeaponCycling"; amount: number };
export type ReactionControlSystem = { kind: "ReactionControlSystem"; chance: number; };
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
    | CryofiberWeb
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
    | MniQuantumCapacitor
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
    | "CryofiberWeb"
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
    | "MniQuantumCapacitor"
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
    components: string | undefined;
};

export type BaseItem = {
    slot: ItemSlot;
    hackable: boolean;
    supporterAttribution?: string;
    name: string;
    noPrefixName: string;
    fullName: string;
    type: ItemType;
    rating: number;
    ratingString: string;
    ratingCategory: ItemRatingCategory;
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
    imageName?: string;
    customItem?: boolean;
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
        special?: string;
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
    "Supporter Attribution"?: string;
    "Hackable Schematic"?: string;
    Mass?: string;
    Coverage?: string;
    "Heat Generation"?: string;
    "Energy Generation"?: string;
    "Energy Storage"?: string;
    "Fabrication Number"?: string;
    "Fabrication Time"?: string;
    "Fabrication Components"?: string;
    Category?: string;
    "Power Stability"?: string;
    Effect?: string;
    "Time/Move"?: string;
    Drag?: string;
    "Energy/Move"?: string;
    "Heat/Move"?: string;
    Support?: string;
    Penalty?: string;
    Siege?: string; // TODO remove with b15
    Special?: string;
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
