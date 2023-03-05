import { Bot, BotImmunity, BotResistances } from "./botTypes";
import { Critical, DamageType, Item, ItemSlot, WeaponItem } from "./itemTypes";

export type SimulatorPart = {
    armorAnalyzedCoverage: number;
    armorAnalyzedSiegedCoverage: number;
    coverage: number;
    def: Item;
    integrity: number;
    initialIndex: number;
    protection: boolean;
    selfDamageReduction: number;
    siegedCoverage: number;
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

export type CorruptionPreventPart = SpecialPart;

export type CorruptionReductionPart = SpecialPart & {
    amount: number;
};

export type DamageReductionPart = SpecialPart & {
    reduction: number;
    remote: boolean;
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
    corruptionPrevent: CorruptionPreventPart[];
    corruptionReduce: CorruptionReductionPart[];
    damageReduction: DamageReductionPart[];
    rangedAvoid: RangedAvoidPart[];
    shieldings: Record<ItemSlot | "Core", ShieldingPart[]>;
};

export type BotBehavior = "Stand/Fight" | "Siege/Fight" | "Already Sieged/Fight" | "Running" | "Run When Hit";

export type BotState = {
    armorAnalyzedCoverage: number;
    armorAnalyzedSiegedCoverage: number;
    behavior: BotBehavior;
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
    running: boolean;
    runningEvasion: number;
    runningMomentum: number;
    salvage: number;
    sieged: boolean;
    siegedCoverage: number;
    totalCoverage: number;
    tusToSiege: number;
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
    explosionChunksMin: number;
    explosionChunksMax: number;
    explosionMin: number;
    explosionMax: number;
    explosionDisruption: number;
    explosionSpectrum: number;
    explosionType?: DamageType;
    isMissile: boolean;
    numProjectiles: number;
    overflow: boolean;
    overloaded: boolean;
    salvage: number;
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

export type ItemLootState = {
    item: Item;
    numDrops: number;

    // Stats totaled for all drops
    totalCritRemoves: number;
    totalCorruptionPercent: number;
    totalFried: number;
    totalIntegrity: number;
};

export type LootState = {
    numKills: number;
    items: ItemLootState[];
    matterDrop: number;
    matterBlasted: number;
};

export type OffensiveState = {
    action1Accuracy: number;
    action2Accuracy: number;
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
    recoil: number;
    ramming: boolean;
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
    actionNum: number;
    botState: BotState;
    endCondition: EndCondition;
    initialBotState: BotState;
    killTus: { [key: number]: number };
    killVolleys: { [key: number]: number };
    lootState: LootState;
    offensiveState: OffensiveState;
    tus: number;
    weapons: SimulatorWeapon[];
};
