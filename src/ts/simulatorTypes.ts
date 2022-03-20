import { Bot, BotImmunity, BotResistances } from "./botTypes";
import { Critical, DamageType, Item, WeaponItem } from "./itemTypes";

export type SimulatorPart = {
    armorAnalyzedCoverage: number;
    coverage: number;
    def: Item;
    integrity: number;
    protection: boolean;
    selfDamageReduction: number;
    resistances?: BotResistances;
};

export type SpecialPart = {
    part: SimulatorPart;
};

export type AntimissilePart = SpecialPart & {
    chance: number;
};

export type AvoidPart = SpecialPart & {
    legs: number;
    other: number;
};

export type CorruptionAvoidPart = SpecialPart & {
    chance: number;
};

export type DamageReductionPart = SpecialPart & {
    reduction: number;
};

export type RangedAvoidPart = SpecialPart & {
    avoid: number;
};

export type ShieldingPart = SpecialPart & {
    reduction: number;
};

export type DefensiveState = {
    antimissile: AntimissilePart[];
    avoid: AvoidPart[];
    corruptionIgnore: CorruptionAvoidPart[];
    damageReduction: DamageReductionPart[];
    rangedAvoid: RangedAvoidPart[];
    shieldings: { [key: string]: ShieldingPart[] };
};

export type BotState = {
    armorAnalyzedCoverage: number;
    coreCoverage: number;
    coreDisrupted: boolean;
    coreIntegrity: number;
    corruption: number;
    def: Bot;
    defensiveState: DefensiveState;
    externalDamageReduction: string;
    immunities: BotImmunity[];
    initialCoreIntegrity: number;
    parts: SimulatorPart[];
    regen: number;
    resistances: BotResistances;
    totalCoverage: number;
};

export type SimulatorWeapon = {
    accelerated: boolean;
    accuracy: number;
    baseAccuracy: number;
    criticalChance: number;
    criticalType?: Critical;
    damageMin: number;
    damageMax: number;
    damageType?: DamageType;
    def: WeaponItem;
    delay: number;
    disruption: number;
    explosionMin: number;
    explosionMax: number;
    explosionSpectrum: number;
    explosionType?: DamageType;
    isMissile: boolean;
    numProjectiles: number;
    overflow: boolean;
    overloaded: boolean;
    spectrum: number;
};

export enum SneakAttackStrategy {
    None = "None",
    FirstOnly = "First Only",
    All = "All",
}

export enum EndCondition {
    Kill = "Kill",
    KillOrDisrupt = "Kill or Core Disrupt",
    KillOrPower = "Kill or No Power",
    KillOrWeapons = "Kill or No Weapons",
    KillOrNoTnc = "Kill or No TNC",
    Tele = "Architect Tele (80% integrity, 1 weapon, or 1 prop)",
}

export type OffensiveState = {
    armorAnalyzerChance: number;
    analysis: boolean;
    chargerBonus: number;
    coreAnalyzerChance: number;
    distance: number;
    followupChances: number[];
    forceBoosters: number[];
    melee: boolean;
    meleeAnalysis: number[];
    momentum: {
        bonus: number;
        current: number;
        initial: number;
    };
    numTreads: number;
    overloadBonus: number;
    ramming: boolean;
    recoil: number;
    recoilReduction: number;
    siegeBonus: {
        bonus: number;
        tus: number;
    };
    sneakAttack: boolean;
    sneakAttackStrategy: SneakAttackStrategy;
    speed: number;
    targetingComputerBonus: number;
    volleyTime: number;
    volleyTimeModifier: number;
};

export type SimulatorState = {
    botState: BotState;
    endCondition: EndCondition;
    initialBotState: BotState;
    killTus: { [key: number]: number };
    killVolleys: { [key: number]: number };
    offensiveState: OffensiveState;
    tus: number;
    weapons: SimulatorWeapon[];
};
