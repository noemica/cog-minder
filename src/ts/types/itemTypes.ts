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

export type HeatTransfer = "Minimal (5)" | "Low (25)" | "Medium (37)" | "High (50)" | "Massive (80)" | "Deadly (120)";

export type ItemRatingCategory = "Alien" | "Prototype" | "None";

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
    | "UFD"
    | "Unobtainable"
    | "Unchained"
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

export type SiegeMode = "High Siege" | "Siege";

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

export const CriticalNoneIndex = 0;
export const CriticalBlastIndex = 1;
export const CriticalBurnIndex = 2;
export const CriticalCorruptIndex = 3;
export const CriticalDestroyIndex = 4;
export const CriticalDetonateIndex = 5;
export const CriticalMeltdownIndex = 6;
export const CriticalImpaleIndex = 7;
export const CriticalIntensifyIndex = 8;
export const CriticalPhaseIndex = 9;
export const CriticalSmashIndex = 10;
export const CriticalSeverIndex = 11;
export const CriticalSunderIndex = 12;

export type CriticalIndex =
    | typeof CriticalNoneIndex
    | typeof CriticalBlastIndex
    | typeof CriticalBurnIndex
    | typeof CriticalCorruptIndex
    | typeof CriticalDestroyIndex
    | typeof CriticalDetonateIndex
    | typeof CriticalMeltdownIndex
    | typeof CriticalImpaleIndex
    | typeof CriticalIntensifyIndex
    | typeof CriticalPhaseIndex
    | typeof CriticalSmashIndex
    | typeof CriticalSeverIndex
    | typeof CriticalSunderIndex;

export const SpecialPropertyPartActiveActive = false;
export const SpecialPropertyAlwaysActive = true;
export type SpecialPropertyActive = typeof SpecialPropertyPartActiveActive | typeof SpecialPropertyAlwaysActive;

export const AblativeArmorIndex = 0;
export const ActuatorIndex = 1;
export const ActuatorArrayIndex = 2;
export const AirborneSpeedDoublingIndex = 3;
export const AntimissileChanceIndex = 4;
export const CombatSuiteIndex = 5;
export const CoreAnalyzerIndex = 6;
export const CorruptionIgnoreIndex = 7;
export const CorruptionMaximumIndex = 8;
export const CorruptionPreventIndex = 9;
export const CorruptionReduceIndex = 10;
export const CriticalImmunityIndex = 11;
export const CryofiberWebIndex = 12;
export const DamageReductionIndex = 13;
export const DamageResistsIndex = 14;
export const EnergyFilterIndex = 15;
export const EnergyStorageIndex = 16;
export const HardlightGeneratorIndex = 17;
export const HeatDissipationIndex = 18;
export const InjectorIndex = 19;
export const KinecelleratorIndex = 20;
export const LauncherGuidanceIndex = 21;
export const LauncherLoaderIndex = 22;
export const MassSupportIndex = 23;
export const MatterStorageIndex = 24;
export const MeleeAnalysisIndex = 25;
export const MetafiberIndex = 26;
export const MicrodissipatorIndex = 27;
export const MniQuantumCapacitorIndex = 28;
export const PowerAmplifierIndex = 29;
export const QuantumCapacitorIndex = 30;
export const ParticleChargingIndex = 31;
export const RangedAvoidIndex = 32;
export const RangedWeaponCyclingIndex = 33;
export const ReactionControlSystemIndex = 34;
export const RecoilReductionIndex = 35;
export const RocketBoosterIndex = 36;
export const SalvageTargetingIndex = 37;
export const SelfReductionIndex = 38;
export const ShieldingIndex = 39;
export const TargetAnalyzerIndex = 40;
export const TargetingIndex = 41;
export const ThunderLegIndex = 42;
export const TurboventsIndex = 43;
export const WeaponRegenIndex = 44;

export type AblativeArmor = { kind: typeof AblativeArmorIndex };
export type Actuator = { kind: typeof ActuatorIndex; amount: number };
export type ActuatorArray = { kind: typeof ActuatorArrayIndex; amount: number };
export type AirborneSpeedDoubling = { kind: typeof AirborneSpeedDoublingIndex };
export type AntimissileChance = { kind: typeof AntimissileChanceIndex; chance: number };
export type CombatSuite = { kind: typeof CombatSuiteIndex; core: 8; rangedAvoid: 8; targeting: 8 };
export type CoreAnalyzer = { kind: typeof CoreAnalyzerIndex; bonus: number };
export type CorruptionIgnore = { kind: typeof CorruptionIgnoreIndex; chance: number };
export type CorruptionMaximum = { kind: typeof CorruptionMaximumIndex; amount: number };
export type CorruptionPrevent = { kind: typeof CorruptionPreventIndex; amount: number };
export type CorruptionReduce = { kind: typeof CorruptionReduceIndex; amount: number };
export type CriticalImmunity = { kind: typeof CriticalImmunityIndex };
export type CryofiberWeb = {
    kind: typeof CryofiberWebIndex;
    temperatureReduction: number;
    sideEffectNegationPercentage: number;
};
export type DamageReduction = { kind: typeof DamageReductionIndex; multiplier: number; ratio: number; remote: boolean };
export type DamageResists = { kind: typeof DamageResistsIndex; resists: BotResistances };
export type EnergyFilter = { kind: typeof EnergyFilterIndex; percent: number };
export type EnergyStorage = { kind: typeof EnergyStorageIndex; storage: number };
export type HardlightGenerator = { kind: typeof HardlightGeneratorIndex; amount: number };
export type HeatDissipation = { kind: typeof HeatDissipationIndex; dissipation: number; heatSink: boolean };
export type Injector = { kind: typeof InjectorIndex; dissipation: number };
export type Kinecellerator = { kind: typeof KinecelleratorIndex; amount: number };
export type LauncherGuidance = { kind: typeof LauncherGuidanceIndex; bonus: number };
export type LauncherLoader = { kind: typeof LauncherLoaderIndex };
export type MassSupport = { kind: typeof MassSupportIndex; support: number };
export type MatterStorage = { kind: typeof MatterStorageIndex; storage: number };
export type MeleeAnalysis = { kind: typeof MeleeAnalysisIndex; accuracy: number; minDamage: number };
export type Metafiber = { kind: typeof MetafiberIndex };
export type Microdissipator = { kind: typeof MicrodissipatorIndex };
export type MniQuantumCapacitor = { kind: typeof MniQuantumCapacitorIndex };
export type PowerAmplifier = { kind: typeof PowerAmplifierIndex; percent: number };
export type QuantumCapacitor = { kind: typeof QuantumCapacitorIndex };
export type ParticleCharging = { kind: typeof ParticleChargingIndex; percent: number };
export type RangedAvoid = { kind: typeof RangedAvoidIndex; avoid: number };
export type RangedWeaponCycling = { kind: typeof RangedWeaponCyclingIndex; amount: number };
export type ReactionControlSystem = { kind: typeof ReactionControlSystemIndex; chance: number };
export type RecoilReduction = { kind: typeof RecoilReductionIndex; reduction: number };
export type RocketBooster = { kind: typeof RocketBoosterIndex };
export type SalvageTargeting = { kind: typeof SalvageTargetingIndex; amount: number };
export type SelfReduction = { kind: typeof SelfReductionIndex; shielding: number };
export type Shielding = { kind: typeof ShieldingIndex; shielding: number; slot: ItemSlot | "Core" };
export type TargetAnalyzer = { kind: typeof TargetAnalyzerIndex; bonus: number };
export type Targeting = { kind: typeof TargetingIndex; bonus: number };
export type ThunderLeg = { kind: typeof ThunderLegIndex };
export type Turbovents = { kind: typeof TurboventsIndex };
export type WeaponRegen = { kind: typeof WeaponRegenIndex; energyPerTurn: number; integrityPerTurn: number };

export type SpecialPropertyTypeIndex =
    | typeof AblativeArmorIndex
    | typeof ActuatorIndex
    | typeof ActuatorArrayIndex
    | typeof AirborneSpeedDoublingIndex
    | typeof AntimissileChanceIndex
    | typeof CombatSuiteIndex
    | typeof CoreAnalyzerIndex
    | typeof CorruptionIgnoreIndex
    | typeof CorruptionMaximumIndex
    | typeof CorruptionPreventIndex
    | typeof CorruptionReduceIndex
    | typeof CriticalImmunityIndex
    | typeof CryofiberWebIndex
    | typeof DamageReductionIndex
    | typeof DamageResistsIndex
    | typeof EnergyFilterIndex
    | typeof EnergyStorageIndex
    | typeof HardlightGeneratorIndex
    | typeof HeatDissipationIndex
    | typeof InjectorIndex
    | typeof KinecelleratorIndex
    | typeof LauncherLoaderIndex
    | typeof LauncherGuidanceIndex
    | typeof MassSupportIndex
    | typeof MatterStorageIndex
    | typeof MeleeAnalysisIndex
    | typeof MetafiberIndex
    | typeof MicrodissipatorIndex
    | typeof MniQuantumCapacitorIndex
    | typeof ParticleChargingIndex
    | typeof PowerAmplifierIndex
    | typeof QuantumCapacitorIndex
    | typeof RangedAvoidIndex
    | typeof RangedWeaponCyclingIndex
    | typeof ReactionControlSystemIndex
    | typeof RecoilReductionIndex
    | typeof RocketBoosterIndex
    | typeof SalvageTargetingIndex
    | typeof SelfReductionIndex
    | typeof ShieldingIndex
    | typeof TargetAnalyzerIndex
    | typeof TargetingIndex
    | typeof ThunderLegIndex
    | typeof TurboventsIndex
    | typeof WeaponRegenIndex;

export type SpecialPropertyType =
    | AblativeArmor
    | Actuator
    | ActuatorArray
    | AntimissileChance
    | AirborneSpeedDoubling
    | CombatSuite
    | CoreAnalyzer
    | CorruptionIgnore
    | CorruptionMaximum
    | CorruptionPrevent
    | CorruptionReduce
    | CriticalImmunity
    | CryofiberWeb
    | DamageReduction
    | DamageResists
    | EnergyFilter
    | EnergyStorage
    | HardlightGenerator
    | HeatDissipation
    | Injector
    | Kinecellerator
    | LauncherLoader
    | LauncherGuidance
    | MassSupport
    | MatterStorage
    | MeleeAnalysis
    | Metafiber
    | Microdissipator
    | MniQuantumCapacitor
    | ParticleCharging
    | PowerAmplifier
    | QuantumCapacitor
    | RangedAvoid
    | RangedWeaponCycling
    | ReactionControlSystem
    | RecoilReduction
    | RocketBooster
    | SalvageTargeting
    | SelfReduction
    | Shielding
    | TargetAnalyzer
    | Targeting
    | ThunderLeg
    | Turbovents
    | WeaponRegen;

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
    studyable: boolean;
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
        shield?: boolean;
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
    criticalIndex: CriticalIndex;
    criticalType?: Critical;
    criticalString?: string;
    targeting?: number;
    penetration?: string;
    penetrationChances?: number[];
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
    Studyable?: string;
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
