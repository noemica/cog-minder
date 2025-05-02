import { Bot, BotImmunity, BotResistances } from "./botTypes";
import { Critical, DamageType, Item, ItemSlot, WeaponItem } from "./itemTypes";

export type ExternalDamageReduction =
    | "None"
    | "Remote Shield"
    | "Stasis Trap"
    | "Phase Wall"
    | "Remote Force Field"
    | "Stasis Bubble";

export type SiegeState =
    | "No Siege"
    | "In Siege Mode"
    | "In High Siege Mode"
    | "Entering Siege Mode"
    | "Entering High Siege Mode";

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
    chance: number;
};

export type CorruptionAvoidPart = SpecialPart & {
    chance: number;
};

export type CorruptionPreventPart = SpecialPart;

export type CorruptionReductionPart = SpecialPart & {
    amount: number;
};

export type CriticalImmunityPart = SpecialPart;

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
    critImmunity: CriticalImmunityPart[];
    damageReduction: DamageReductionPart[];
    rangedAvoid: RangedAvoidPart[];
    shieldings: Record<ItemSlot | "Core", ShieldingPart[]>;
};

export type SuperfortressRegenState = {
    nextRegenAttempt: number;
}

export type BotBehavior = "Stand/Fight" | "Siege/Fight" | "Already Sieged/Fight" | "Running" | "Run When Hit";

export type BotState = {
    armorAnalyzedCoverage: number;
    armorAnalyzedSiegedCoverage: number;
    behavior: BotBehavior;
    coreCoverage: number;
    coreDisrupted: boolean;
    coreIntegrity: number;
    coreRegen: number;
    corruption: number;
    def: Bot;
    defensiveState: DefensiveState;
    destroyedParts: SimulatorPart[];
    externalDamageReduction: ExternalDamageReduction;
    heat: number;
    immunities: BotImmunity[];
    initialCoreIntegrity: number;
    parts: SimulatorPart[];
    partRegen: number;
    resistances: BotResistances;
    running: boolean;
    runningEvasion: number;
    runningMomentum: number;
    salvage: number;
    sieged: boolean;
    siegedCoverage: number;
    superfortressRegen: SuperfortressRegenState | undefined;
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

export type SneakAttackStrategy = "None" | "First Only" | "All";

export type SimulatorEndCondition =
    | "Kill"
    | "Kill or Core Disrupt"
    | "Kill or No Power"
    | "Kill or No Weapons"
    | "Kill or No TNC"
    | "Tele";

export type ItemLootState = {
    item: Item;
    numDrops: number;

    // Stats totaled for all drops
    totalCritRemoves: number;
    totalCorruptionPercent: number;
    totalFried: number;
    totalMelted: number;
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
    corruption: number;
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
    endCondition: SimulatorEndCondition;
    initialBotState: BotState;
    killTus: { [key: number]: number };
    killVolleys: { [key: number]: number };
    lootState: LootState;
    offensiveState: OffensiveState;
    tus: number;
    weapons: SimulatorWeapon[];
};
