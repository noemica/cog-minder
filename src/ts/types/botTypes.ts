import { Spoiler } from "./commonTypes";
import { DamageType, FabricationStats, ItemType } from "./itemTypes";

export enum BotCategory {
    Alien = "Alien",
    Architect = "Architect",
    Derelict = "Derelict",
    Drone = "Drone",
    Exiles = "Exiles",
    Prototype = "Prototype",
    Redacted = "Redacted",
    Spoiler = "Spoiler",
    OB10 = "0b10",
    Warlord = "Warlord",
    Zhirov = "Zhirov",
    Zionite = "Zionite",
}

export enum BotImmunity {
    Coring = "Coring",
    Criticals = "Criticals",
    Dismemberment = "Dismemberment",
    Disruption = "Disruption",
    Hacking = "Hacking",
    Jamming = "Jamming",
    Meltdown = "Meltdown",
}

export type BotSize = "Huge" | "Large" | "Medium" | "Small" | "Tiny";

export type BotResistances = Partial<Record<DamageType, number>>;

export type ItemOption = {
    name: string;
    number?: number;
};

export type BotPart = {
    name: string;
    number: number;
    coverage: number;
    integrity: number;
};

export type BotLocation = {
    Location: string;
    Description?: string;
    Spoiler?: Spoiler;
};

export type Bot = {
    armament: Array<string | ItemOption[]>;
    armamentData: BotPart[];
    armamentOptionData: BotPart[][];
    armamentString: string;
    categories: BotCategory[];
    class: string;
    components: Array<string | ItemOption[]>;
    componentData: BotPart[];
    componentOptionData: BotPart[][];
    componentsString: string;
    coreCoverage: number;
    coreExposure: number;
    coreIntegrity: number;
    customBot: boolean;
    damagePerTurn: number | undefined;
    damagePerVolley: number | undefined;
    description: string;
    energyGeneration: number;
    fabrication?: FabricationStats;
    heatDissipation: number;
    immunities: BotImmunity[];
    immunitiesString: string;
    injectorDissipation: number;
    inventorySize?: string;
    locations: BotLocation[];
    mass: number;
    maxEnergy: number;
    memory: string;
    movement: string;
    movementOverloaded?: string;
    name: string;
    netEnergyPerMove: number;
    netEnergyPerTurn: number;
    netEnergyPerVolley: number | undefined;
    netHeatPerMove: number;
    netHeatPerTurn: number;
    netHeatPerVolley: number | undefined;
    profile: string;
    propulsionType: ItemType | undefined,
    rating: string;
    resistances?: BotResistances;
    salvageHigh: number;
    salvageLow: number;
    salvagePotential: string;
    size: BotSize;
    speed: number;
    spotPercent: string;
    spoiler: Spoiler;
    support: number;
    threat: string;
    tier: string;
    totalCoverage: number;
    traits: string[];
    traitsString: string;
    value: number;
    visualRange: string;
    volleyTime: number | undefined;
};

export type JsonBotExtraData = {
    Categories: BotCategory[];
    Locations?: BotLocation[];
};

export type JsonBot = {
    Name: string;
    "Short Name"?: string;
    "Ally Name"?: string;
    Class: string;
    Tier: string;
    Threat: string;
    Rating: string;
    Value: string;
    "Size Class": BotSize;
    Size: string;
    Profile: string;
    Memory: string;
    "Spot %": string;
    Movement: string;
    Speed: string;
    "Speed %": string;
    "Overload Speed"?: string;
    "Overload Speed %"?: string;
    "Sight Range": string;
    "Energy Generation": string;
    "Heat Dissipation": string;
    "Core Integrity": string;
    "Core Exposure": string;
    "Core Exposure %": string;
    "Salvage Potential": string;
    "Inventory Capacity": string;
    Immunities?: BotImmunity[];
    Traits?: string[];
    "Armament String"?: string;
    Armament?: Array<string | ItemOption[]>;
    "Components String"?: string;
    Components?: Array<string | ItemOption[]>;
    Analysis?: string;
    Resistances: BotResistances;
    "Fabrication Count"?: string;
    "Fabrication Time"?: string;
};
