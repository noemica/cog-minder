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
};

export enum HeatTransfer {
    Minimal = "Minimal (5)",
    Low = "Low (25)",
    Medium = "Medium (37)",
    High = "High (50)",
    Massive = "Massive (80)",
};

export enum ItemCategory {
    Alien = "Alien",
    Prototype = "Prototype",
    None = "",
};

export enum ItemSlot {
    NA = "N/A",
    Power = "Power",
    Propulsion = "Propulsion",
    Utility = "Utility",
    Weapon = "Weapon",
};

export interface ItemWithUpkeep {
    energyUpkeep?: number;
    matterUpkeep?: number;
    heatGeneration?: number;
};

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
};

export enum SiegeMode {
    High = "High",
    Standard = "Standard",
};

export enum Spectrum {
    Wide = "Wide (10)",
    Intermediate = "Intermediate (30)",
    Narrow = "Narrow (50)",
    Fine = "Fine (100)",
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
};

export type OtherItem = BaseItem & {
    life?: string;
};

export type PowerItem = BaseItem & ItemWithUpkeep & {
    heatGeneration?: number;
    energyGeneration?: number;
    energyStorage?: number;
    powerStability?: number;
};

export type PropulsionItem = BaseItem & {
    energyUpkeep?: number;
    matterUpkeep?: number;
    heatGeneration?: number;
    timePerMove: number;
    modPerExtra?: number;
    drag?: string;
    energyPerMove?: number;
    heatPerMove?: number;
    support: number;
    penalty: number;
    burnout?: string;
    siege?: SiegeMode;
};

export type UtilityItem = BaseItem & ItemWithUpkeep & {
    specialTrait?: string;
};

export type WeaponItem = BaseItem & {
    specialTrait?: string;
    range: number;
    shotEnergy?: number;
    shotHeat?: number;
    projectileCount: number;
    damage?: string;
    damageType?: DamageType;
    spectrum?: Spectrum;
    disruption?: number;
    salvage?: number;
    critical?: number;
    targeting?: number;
    penetration?: string;
    delay?: number;
    heatTransfer?: HeatTransfer;
    overloadStability?: number;
    explosionRadius?: number;
    explosionDamage?: string;
    falloff?: string;
    explosionType?: DamageType;
    explosionHeatTransfer?: HeatTransfer;
    arc?: number,
    waypoints?: string;
    explosionSpectrum?: Spectrum;
    explosionDisruption?: number;
    explosionSalvage?: string;
    shotMatter?: number;
    recoil?: number;
    life?: string;
};

export type Item =
    | OtherItem
    | PowerItem
    | PropulsionItem
    | UtilityItem
    | WeaponItem;

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
    Damage?: string;
    "Damage Type"?: DamageType;
    Spectrum?: Spectrum;
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