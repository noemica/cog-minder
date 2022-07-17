import { DamageType, FabricationStats } from "./itemTypes";

export enum BotCategory {
    Alien = "Alien",
    Architect = "Architect",
    Derelict = "Derelict",
    Drone = "Drone",
    Exiles = "Exiles",
    Prototype = "Prototype",
    Redacted = "Redacted",
    Spoilers = "Spoilers",
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

export enum BotSize {
    Huge = "Huge",
    Large = "Large",
    Medium = "Medium",
    Small = "Small",
    Tiny = "Tiny",
}

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
    description: string;
    energyGeneration: number;
    fabrication?: FabricationStats;
    heatDissipation: number;
    immunities: BotImmunity[];
    immunitiesString: string;
    memory: string;
    movement: string;
    movementOverloaded?: string;
    name: string;
    profile: string;
    rating: string;
    resistances?: BotResistances;
    salvageHigh: number;
    salvageLow: number;
    salvagePotential: string;
    size: BotSize;
    speed: number;
    spotPercent: string;
    threat: string;
    tier: string;
    totalCoverage: number;
    traits: string[];
    traitsString: string;
    value: number;
    visualRange: string;
};

export type JsonBot = {
    Name: string;
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
    "Fabrication Matter"?: string;
};
