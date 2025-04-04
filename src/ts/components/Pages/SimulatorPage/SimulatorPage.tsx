import { Point } from "chart.js";
import LZString from "lz-string";
import { ReactNode, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";

import { Bot } from "../../../types/botTypes";
import { Critical, DamageType, Item, PropulsionItem, WeaponItem } from "../../../types/itemTypes";
import {
    BotBehavior,
    BotState,
    ExternalDamageReduction,
    ItemLootState,
    LootState,
    OffensiveState,
    SiegeState,
    SimulatorEndCondition,
    SimulatorPart,
    SimulatorState,
    SimulatorWeapon,
    SneakAttackStrategy,
} from "../../../types/simulatorTypes";
import { BotData } from "../../../utilities/BotData";
import { ItemData } from "../../../utilities/ItemData";
import { getLocationFromState, parseIntOrDefault, parseSearchParameters } from "../../../utilities/common";
import {
    forceBoosterMaxDamageIncrease,
    getBotDefensiveState,
    getRangedVolleyTime,
    getRecoil,
    initialMeleeAccuracy,
    initialRangedAccuracy,
    meleeAnalysisMinDamageIncrease,
    siegeModeBonusMap,
    simulateCombat,
    maxVolleys as simulatorMaxVolleys,
    sizeAccuracyMap,
    spectrumToNumber,
    volleyTimeMap,
} from "../../../utilities/simulatorCalcs";
import Button from "../../Buttons/Button";
import ScatterLineChart, { ScatterChartDataGroup } from "../../Charts/BaseCharts/ScatterLineChart";
import useBotData from "../../Effects/useBotData";
import useItemData from "../../Effects/useItemData";
import { RoundedInput } from "../../Input/Input";
import { LabeledInput } from "../../LabeledItem/LabeledItem";
import SimulatorLootItemInfobox, { SimulatorMatterInfobox } from "./SimulatorLootInfobox";
import SimulatorPageInput from "./SimulatorPageInput";

import "../Pages.less";
import "./SimulatorPage.less";

export type YesNoType = "No" | "Yes";

export type CombatType = "Ranged" | "Melee";

export type WeaponState = {
    exo?: YesNoType;
    id: number;
    name: string;
    number?: string;
    overload?: YesNoType;
};

export type XAxisType = "Volleys" | "Time";

export type SimulatorPageState = {
    // Shared settings
    combatType?: CombatType;
    numSimulations?: string;
    botName?: string;
    analysis?: YesNoType;
    damageReduction?: ExternalDamageReduction;
    corruption?: string;
    actionsSinceMoving?: string;
    onLegs?: YesNoType;
    tilesRun?: string;
    enemyBehavior?: BotBehavior;
    armorIntegrityAnalyzer?: string;
    coreAnalyzer?: string;
    targetAnalyzer?: string;

    // Ranged settings
    targeting?: string;
    siege?: SiegeState;
    distance?: string;
    particleCharger?: string;
    kinecellerator?: string;
    salvageTargeting?: string;
    recoilReduction?: string;
    weaponCycling?: string;

    // Melee settings
    baseMas?: string;
    impMas?: string;
    advMas?: string;
    expMas?: string;
    baseForceBoosters?: string;
    impForceBoosters?: string;
    advForceBoosters?: string;
    expForceBoosters?: string;
    actuator?: string;
    actuatorArray?: string;
    bonusMomentum?: string;
    initialMomentum?: string;
    speed?: string;
    sneakAttacks?: SneakAttackStrategy;

    // Weapons
    weaponState?: WeaponState[];

    // Output type
    xAxis?: XAxisType;
    showLoot?: YesNoType;
    endCondition?: SimulatorEndCondition;
};

export type SerializableSimulatorPageState = Omit<SimulatorPageState, "weaponState"> & {
    weaponState?: string;
};

type ActiveChartState = {
    botName: string;
    comparisonData: Point[];
    cumulativeKillPerTuData: Point[];
    cumulativeKillPerVolleyData: Point[];
    killPerTuData: Point[];
    killPerVolleyData: Point[];
    lootState: LootState;
    volleyTime: number;
};

type ComparisonDatasetState = {
    colorIndex: number;
    data: Point[];
    id: number;
    name: string;
};

type ComparisonChartState = {
    comparisonChartName: string;
    datasets: ComparisonDatasetState[];
};

const comparisonBorderColors = [
    "rgba(228, 26, 28, .8)",
    "rgba(55, 126, 184, .8)",
    "rgba(36, 192, 36, .8)",
    "rgba(152, 78, 163, .8)",
    "rgba(255, 127, 0, .8)",
    "rgba(255, 255, 51, .8)",
    "rgba(243, 145, 146, .8)",
    "rgba(145, 187, 222, .8)",
    "rgba(135, 232, 135, .8)",
    "rgba(202, 159, 209, .8)",
    "rgba(255, 194, 133, .8)",
    "rgba(163, 163, 0, .8)",
];

// Keep outside of React state so cancellation can take place immediately
let simulationCancelled = false;

function getPageState(): SimulatorPageState {
    const search = useSearch();

    const serializablePageState: SerializableSimulatorPageState = parseSearchParameters(search, {});

    let weaponState: WeaponState[] | undefined = undefined;

    if (serializablePageState.weaponState !== undefined) {
        // Attempt to parse the parse weapon state from string
        const weaponString = LZString.decompressFromEncodedURIComponent(serializablePageState.weaponState);

        if (weaponString !== null) {
            const parsedWeaponState = JSON.parse(weaponString);

            if (Array.isArray(parsedWeaponState)) {
                weaponState = parsedWeaponState;
            }
        }
    }

    return {
        ...serializablePageState,
        weaponState: weaponState,
    };
}

const coreRegenRegex = /Core Regeneration \((\d*)\)/;
// Gets the core regen value for a bot, otherwise 0
export function getCoreRegen(bot: Bot): number {
    const traits = bot.traits;

    for (let i = 0; i < traits.length; i++) {
        const result = coreRegenRegex.exec(traits[i]);

        if (result != null) {
            return parseInt(result[1]);
        }
    }

    return 0;
}

const partRegenRegex = /Part Regeneration \((\d*)\)/;
// Gets the core regen value for a bot, otherwise 0
export function getPartRegen(bot: Bot): number {
    const traits = bot.traits;

    for (let i = 0; i < traits.length; i++) {
        const result = partRegenRegex.exec(traits[i]);

        if (result != null) {
            return parseInt(result[1]);
        }
    }

    return 0;
}

function getSerializedPageState(pageState: SimulatorPageState): SerializableSimulatorPageState {
    let weaponState: string | undefined;

    if (pageState.weaponState && pageState.weaponState.length > 0) {
        const weaponStateString = JSON.stringify(pageState.weaponState);
        weaponState = LZString.compressToEncodedURIComponent(weaponStateString);
    }

    return {
        ...pageState,
        weaponState: weaponState,
    };
}

function getSimulatorState(
    botData: BotData,
    itemData: ItemData,
    pageState: SimulatorPageState,
    setStatusText: React.Dispatch<React.SetStateAction<string>>,
): SimulatorState | undefined {
    const botName = pageState.botName || "G-34 Mercenary";

    const userWeapons: { def: WeaponItem; overloaded: boolean }[] = [];

    for (const weaponInfo of pageState.weaponState ?? []) {
        const weapon = itemData.tryGetItem(weaponInfo.name) as WeaponItem;
        if (weapon === undefined || weapon.slot !== "Weapon") {
            setStatusText(`Item ${weaponInfo.name} is not a valid weapon, this is probably a bug.`);
            return undefined;
        }
        // TODO RAM

        const number = parseIntOrDefault(weaponInfo.number, 1);
        const overloaded = weaponInfo.overload === "Yes";
        const exo = weaponInfo.exo === "Yes";

        for (let i = 0; i < number; i++) {
            // Overload and exoskeleton both double damage so treat them the same
            userWeapons.push({ def: weapon, overloaded: overloaded || exo });
        }
    }

    if (userWeapons.length === 0) {
        setStatusText("There must be at least 1 weapon selected.");
        return undefined;
    }

    // Set up initial calculation state
    const parts: SimulatorPart[] = [];
    let partCount = 0;
    function addPart(itemDef: Item, integrity: number) {
        const isProtection = itemDef.type === "Protection";
        const isTreads = itemDef.type === "Treads";
        const coverage = itemDef.coverage ?? 0;
        const siegedCoverage = isProtection || isTreads ? 2 * coverage : coverage;
        parts.push({
            armorAnalyzedCoverage: isProtection ? 0 : coverage,
            armorAnalyzedSiegedCoverage: isProtection ? 0 : siegedCoverage,
            coverage: coverage,
            def: itemDef,
            integrity: integrity,
            initialIndex: partCount++,
            protection: isProtection,
            selfDamageReduction: 1,
            siegedCoverage: siegedCoverage,
        });
    }

    // TODO dumpmind
    // if (botName === dumpMindTargetName) {
    //     const entity = savedTargetEntity!;
    //     bot = getBot(entity.entity);
    //     botTotalCoverage = 0;

    //     for (const part of entity.inventory.filter((p) => p.equipped)) {
    //         const itemDef = getItemOrNull(part.item);

    //         if (itemDef === null) {
    //             // Failed to find a part, just ignore it
    //             continue;
    //         }

    //         addPart(itemDef, part.integrity);
    //         botTotalCoverage += itemDef.coverage ?? 0;
    //     }

    //     botCoreCoverage = entity.exposure;
    //     botTotalCoverage += botCoreCoverage;
    //     botIntegrity = entity.integrity;
    // } else {
    const bot = botData.getBotOrNull(botName)!;
    if (!bot) {
        setStatusText(`Bot ${botName} is invalid, this is probably a bug.`);
        return undefined;
    }

    bot.componentData
        .concat(bot.armamentData)
        // For now just use the first option in each list
        .concat(bot.componentOptionData.map((c) => c[0]))
        .concat(bot.armamentOptionData.map((c) => c[0]))
        .forEach((item) => {
            for (let i = 0; i < item.number; i++) {
                const itemDef = itemData.getItem(item.name);
                addPart(itemDef, itemDef.integrity);
            }
        });

    const botCoreCoverage = bot.coreCoverage;
    const botTotalCoverage = bot.totalCoverage;
    const botIntegrity = bot.coreIntegrity;
    // }

    const armorAnalyzedCoverage = botCoreCoverage + parts.reduce((prev, part) => prev + part.armorAnalyzedCoverage, 0);
    const armorAnalyzedSiegedCoverage = botCoreCoverage + parts.reduce((prev, part) => prev + part.siegedCoverage, 0);
    const siegedCoverage = botCoreCoverage + parts.reduce((prev, part) => prev + part.siegedCoverage, 0);

    const behavior = pageState.enemyBehavior || "Stand/Fight";

    const defensiveState = getBotDefensiveState(parts, pageState.damageReduction || "None");

    let runningEvasion = 0;
    if (bot.speed < 100) {
        // Bots gain 1% of evasion for every 5 speed under 100
        runningEvasion = Math.trunc((100 - bot.speed) / 5);
    } else {
        runningEvasion = 0;
    }

    const sieged =
        behavior === "Already Sieged/Fight" &&
        parts.find((p) => p.def.type === "Treads" && (p.def as PropulsionItem).siege !== undefined) !== undefined;

    // Enemy bot state
    const botState: BotState = {
        armorAnalyzedCoverage: armorAnalyzedCoverage,
        armorAnalyzedSiegedCoverage: armorAnalyzedSiegedCoverage,
        behavior: behavior,
        coreCoverage: botCoreCoverage,
        coreDisrupted: false,
        coreIntegrity: botIntegrity,
        coreRegen: getCoreRegen(bot),
        corruption: 0,
        def: bot,
        defensiveState: defensiveState,
        destroyedParts: [],
        externalDamageReduction: pageState.damageReduction || "None",
        immunities: bot.immunities,
        initialCoreIntegrity: botIntegrity,
        parts: parts,
        partRegen: getPartRegen(bot),
        resistances: bot.resistances === undefined ? {} : bot.resistances,
        running: behavior === "Running",
        runningEvasion: runningEvasion,
        runningMomentum: behavior === "Running" ? 3 : 0,
        salvage: 0,
        sieged: sieged,
        siegedCoverage: siegedCoverage,
        superfortressRegen: bot.name === "Superfortress" ? { nextRegenAttempt: 0 } : undefined,
        totalCoverage: botTotalCoverage,
        tusToSiege: behavior === "Siege/Fight" ? 500 : 0,
    };

    // Weapons and other offensive state
    let ramming = false;
    const melee = pageState.combatType === "Melee";

    // Accuracy bonuses and penalties
    const noSiegeBonus = { bonus: 0, tus: 0 };
    const siegeBonus = melee ? noSiegeBonus : siegeModeBonusMap.get(pageState.siege!) || noSiegeBonus;
    let targetingComputerBonus = 0;
    if (!melee) {
        targetingComputerBonus = parseIntOrDefault(pageState.targeting, 0);
    }

    // Melee analysis/force boosters
    const meleeAnalysis = [
        parseIntOrDefault(pageState.baseMas, 0),
        parseIntOrDefault(pageState.impMas, 0),
        parseIntOrDefault(pageState.advMas, 0),
        parseIntOrDefault(pageState.expMas, 0),
    ];
    const forceBoosters = [
        parseIntOrDefault(pageState.baseForceBoosters, 0),
        parseIntOrDefault(pageState.impForceBoosters, 0),
        parseIntOrDefault(pageState.advForceBoosters, 0),
        parseIntOrDefault(pageState.expForceBoosters, 0),
    ];
    if (melee) {
        // Reduce force boosters to the 2 highest rating parts (half_stack)
        let numBoostersRemaining = 2;
        for (let i = forceBoosters.length - 1; i >= 0; i--) {
            if (forceBoosters[i] > numBoostersRemaining) {
                forceBoosters[i] = numBoostersRemaining;
                numBoostersRemaining = 0;
            } else {
                numBoostersRemaining -= forceBoosters[i];
            }
        }
    }

    // Invalid / 6 or more tiles = 0 bonus
    let distance = parseIntOrDefault(pageState.distance, 6);
    if (distance <= 1) {
        // Less than or equal to 1, just assign to 1
        distance = 1;
    }

    // Recoil reduction
    const recoilReduction = parseIntOrDefault(pageState.recoilReduction, 0);
    const allRecoil = userWeapons.reduce((prev, weapon) => getRecoil(weapon.def, recoilReduction) + prev, 0);

    // Target Analyzer crit bonus
    const critBonus = parseIntOrDefault(pageState.targetAnalyzer, 0);

    // Salvage targeting bonus
    const salvageTargetingBonus = parseIntOrDefault(pageState.salvageTargeting, 0);

    const corruption = parseIntOrDefault(pageState.corruption, 0);

    const weapons = userWeapons.map((weapon, i) => {
        const def = weapon.def;
        let damageMin = 0;
        let damageMax = 0;
        let damageType: DamageType | undefined = undefined;
        let explosionMin = 0;
        let explosionMax = 0;
        let explosionType: DamageType | undefined = undefined;

        if (def.damage !== undefined) {
            // Found regular damage
            if (def.damage.includes("-")) {
                const split = def.damage.split("-");
                damageMin = parseInt(split[0]);
                damageMax = parseInt(split[1]);
            } else {
                damageMin = parseInt(def.damage);
                damageMax = damageMin;
            }

            if (def.type === "Ballistic Gun" || def.type === "Ballistic Cannon") {
                // Increase minimum damage for kinecellerators (2)
                const kinecelleratorBonus = parseIntOrDefault(pageState.kinecellerator, 0);

                damageMin = Math.trunc(damageMin * (1 + kinecelleratorBonus / 100));

                // Min damage can increase max
                if (damageMin > damageMax) {
                    damageMax = damageMin;
                }
            } else if (melee) {
                // Apply damage for melee analyses/force boosters (2)
                let minDamageIncrease = 0;
                for (let i = 0; i < meleeAnalysisMinDamageIncrease.length; i++) {
                    minDamageIncrease += meleeAnalysis[i] * meleeAnalysisMinDamageIncrease[i];
                }

                // Ensure min damage can't exceed max
                damageMin = Math.min(minDamageIncrease + damageMin, damageMax);

                // Apply force boosters
                // Earlier code ensures that there are at most 2 boosters enabled in the array
                let maxDamageIncrease = 0;
                let numBoostersProcessed = 0;
                for (let i = forceBoosters.length - 1; i >= 0; i--) {
                    if (forceBoosters[i] == 2) {
                        maxDamageIncrease = 1.5 * forceBoosterMaxDamageIncrease[i];
                        numBoostersProcessed += 2;
                    } else if (forceBoosters[i] == 1) {
                        maxDamageIncrease += forceBoosterMaxDamageIncrease[i] * (numBoostersProcessed == 0 ? 1 : 0.5);
                        numBoostersProcessed += 1;
                    }
                }

                damageMax = Math.floor(damageMax * (1 + maxDamageIncrease));
            }

            damageType = def.damageType;
        }

        if (def.explosionDamage !== undefined) {
            // Found explosion damage
            if (def.explosionDamage.includes("-")) {
                const split = def.explosionDamage.split("-");
                explosionMin = parseInt(split[0]);
                explosionMax = parseInt(split[1]);
            } else {
                explosionMin = parseInt(def.explosionDamage);
                explosionMax = explosionMin;
            }

            explosionType = def.explosionType;
        }

        // Get crit chance, only apply target analyzer if there's a specific bonus
        let critical: number;
        if (def.criticalType === Critical.Meltdown) {
            // Meltdown ignores target analyzer bonus
            critical = def.critical!;
        } else {
            critical = def.critical === undefined || def.critical === 0 ? 0 : def.critical + critBonus;
        }

        // Corruption penalty, -1% per 4% corruption
        const corruptionPenalty = Math.trunc(corruption / 4);

        // Calculate base accuracy that can't change over the course of the fight
        let baseAccuracy = melee ? initialMeleeAccuracy : initialRangedAccuracy;

        if (!melee) {
            baseAccuracy += targetingComputerBonus;
        }

        // Size bonus/penalty
        if (sizeAccuracyMap.has(bot.size)) {
            baseAccuracy += sizeAccuracyMap.get(bot.size)!;
        } else {
            console.log(`${botName} has invalid size ${bot.size}`);
        }

        // Builtin targeting
        if (def.targeting !== undefined) {
            baseAccuracy += def.targeting;
        }

        // Corruption penalty
        baseAccuracy -= corruptionPenalty;

        const delay = parseIntOrDefault(def.delay, 0);

        // Follow-up attacks on melee gain a 10% bonus to targeting
        const followUp = melee && i != 0;
        if (followUp) {
            baseAccuracy += 10;
        }

        const disruption = def.disruption ?? 0;
        const explosionDisruption = def.explosionDisruption ?? 0;

        const spectrum = spectrumToNumber(def.spectrum);
        const explosionSpectrum = spectrumToNumber(def.explosionSpectrum);

        const explosionChunksMin = def.minChunks ?? 1;
        const explosionChunksMax = def.maxChunks ?? 1;

        if (def.name === "Ram") {
            ramming = true;
        }

        // All launchers are missiles except for special cases
        const isMissile =
            def.type === "Launcher" &&
            def.name != "Sigix Terminator" &&
            def.name != "Supercharged Sigix Terminator" &&
            def.name != "Vortex Catalyst Activator";

        let salvage = def.salvage ?? 0;
        if (
            salvageTargetingBonus > 0 &&
            def.projectileCount == 1 &&
            (def.type === "Ballistic Gun" || def.type === "Energy Gun")
        ) {
            salvage += salvageTargetingBonus;
        }

        const state: SimulatorWeapon = {
            accelerated: def.type === "Energy Gun" || def.type === "Energy Cannon",
            accuracy: baseAccuracy,
            baseAccuracy: baseAccuracy,
            criticalChance: critical,
            criticalType: def.criticalType,
            damageMin: damageMin,
            damageMax: damageMax,
            damageType: damageType,
            def: def,
            delay: delay,
            disruption: disruption,
            explosionChunksMin: explosionChunksMin,
            explosionChunksMax: explosionChunksMax,
            explosionDisruption: explosionDisruption,
            explosionMin: explosionMin,
            explosionMax: explosionMax,
            explosionSpectrum: explosionSpectrum,
            explosionType: explosionType,
            isMissile: isMissile,
            numProjectiles: def.projectileCount,
            overflow: !def.type.includes("Gun"),
            overloaded: weapon.overloaded,
            salvage: salvage,
            spectrum: spectrum,
        };

        return state;
    });

    const chargerValue = Math.max(parseIntOrDefault(pageState.particleCharger, 0), 0);
    const chargerBonus = 1 + chargerValue / 100;
    const armorAnalyzerChance = parseIntOrDefault(pageState.armorIntegrityAnalyzer, 0);
    const coreAnalyzerChance = parseIntOrDefault(pageState.coreAnalyzer, 0);
    const actuatorArrayBonus = parseIntOrDefault(pageState.actuatorArray, 0);

    // Calculate followup chance
    const followupChances: number[] = [];
    if (melee) {
        // melee followup% = 20 + ([(primary weapon speed mod) - (followup weapon speed mod)] / 10)
        const baseChance = 20 + actuatorArrayBonus;
        weapons.forEach((weapon, i) => {
            if (i != 0) {
                let chance = baseChance + Math.trunc((weapons[0].delay - weapon.delay) / 10);

                // Clamp between 0-100
                chance = Math.min(chance, 100);
                chance = Math.max(chance, 0);

                followupChances.push(chance);
            }
        });
    }

    // Get speed
    const speed = parseIntOrDefault(pageState.speed, 100);

    // Get momentum
    const bonusMomentum = parseIntOrDefault(pageState.bonusMomentum, 0);
    const initialMomentum = parseIntOrDefault(pageState.initialMomentum, 0);

    // Determine sneak attack strategy
    const sneakAttackStrategy = pageState.sneakAttacks || "None";

    // Calculate total (ranged) or initial (melee) volley time
    const actuatorPercent = Math.max(0, Math.min(99, parseIntOrDefault(pageState.actuator, 0)));
    const cyclerPercent = Math.max(0, Math.min(99, parseIntOrDefault(pageState.weaponCycling, 0)));
    const volleyTimeModifier = 1 - (melee ? actuatorPercent : cyclerPercent) / 100;

    const volleyTime = melee
        ? weapons[0].delay + volleyTimeMap[1]
        : getRangedVolleyTime(
              weapons.map((w) => w.def),
              volleyTimeModifier,
          );

    // Determine temporary accuracy modifiers
    // -10% if attacker moved last action (ignored in melee combat)
    // +10% if attacker didn't move for the last 2 actions
    // simulatorCalcs.ts will always enforce the +10% accuracy as part of the 3rd action
    let action1Accuracy: number;
    let action2Accuracy: number;
    const actionsSinceMoving = parseIntOrDefault(pageState.actionsSinceMoving, 2);
    if (actionsSinceMoving == 0) {
        action1Accuracy = melee ? 0 : -10;
        action2Accuracy = 0;
    } else if (actionsSinceMoving == 1) {
        action1Accuracy = 0;
        action2Accuracy = 10;
    } else {
        action1Accuracy = 10;
        action2Accuracy = 10;
    }

    // -5~15% if attacker running on legs (ranged attacks only)
    const onLegs = pageState.onLegs === "Yes";
    const tilesRun = onLegs ? parseIntOrDefault(pageState.tilesRun, 0) : 0;
    if (tilesRun > 0 && !melee) {
        // Cap at 3 tiles moved
        action1Accuracy -= Math.min(tilesRun, 3) * 5;
    }

    const itemLootStates: ItemLootState[] = [];
    for (const part of botState.parts) {
        itemLootStates.push({
            item: part.def,
            numDrops: 0,
            totalCritRemoves: 0,
            totalCorruptionPercent: 0,
            totalFried: 0,
            totalIntegrity: 0,
        });
    }

    // Loot state
    const lootState: LootState = {
        numKills: 0,
        items: itemLootStates,
        matterBlasted: 0,
        matterDrop: 0,
    };

    // Other misc offensive state
    const offensiveState: OffensiveState = {
        action1Accuracy: action1Accuracy,
        action2Accuracy: action2Accuracy,
        armorAnalyzerChance: armorAnalyzerChance,
        analysis: pageState.analysis === "Yes",
        chargerBonus: chargerBonus,
        coreAnalyzerChance: coreAnalyzerChance,
        corruption: corruption,
        distance: distance,
        followupChances: followupChances,
        forceBoosters: forceBoosters,
        melee: melee,
        meleeAnalysis: meleeAnalysis,
        momentum: {
            bonus: bonusMomentum,
            current: bonusMomentum + initialMomentum,
            initial: initialMomentum,
        },
        ramming: ramming,
        recoil: allRecoil,
        recoilReduction: recoilReduction,
        siegeBonus: siegeBonus,
        sneakAttack: false,
        sneakAttackStrategy: sneakAttackStrategy,
        speed: speed,
        targetingComputerBonus: targetingComputerBonus,
        volleyTime: volleyTime,
        volleyTimeModifier: volleyTimeModifier,
    };

    const endCondition = pageState.endCondition || "Kill";

    // Overall state
    const state: SimulatorState = {
        actionNum: 0,
        botState: botState,
        endCondition: endCondition,
        initialBotState: botState,
        killTus: {},
        killVolleys: {},
        lootState: lootState,
        offensiveState: offensiveState,
        tus: 0,
        weapons: weapons,
    };

    return state;
}

function skipLocationMember(key: string, pageState: SerializableSimulatorPageState) {
    const typedKey: keyof SerializableSimulatorPageState = key as keyof SerializableSimulatorPageState;

    if (
        (typedKey === "analysis" && pageState.analysis === "No") ||
        (typedKey === "combatType" && pageState.combatType === "Ranged") ||
        (typedKey === "damageReduction" && pageState.damageReduction === "None") ||
        (typedKey === "endCondition" && pageState.endCondition === "Kill") ||
        (typedKey === "enemyBehavior" && pageState.enemyBehavior === "Stand/Fight") ||
        (typedKey === "onLegs" && pageState.onLegs === "No") ||
        (typedKey === "siege" && pageState.siege === "No Siege") ||
        (typedKey === "xAxis" && pageState.xAxis === "Volleys")
    ) {
        // Skip enum default values
        return true;
    }

    return false;
}

export default function SimulatorPage() {
    const [_, setLocation] = useLocation();
    const botData = useBotData();
    const itemData = useItemData();

    const pageState = getPageState();
    const [simulationInProgress, setSimulationInProgress] = useState<boolean>(false);
    const [statusText, setStatusText] = useState<string>("");
    const [activeChartState, setActiveChartState] = useState<ActiveChartState | undefined>(undefined);
    const [newCustomDatasetName, setNewCustomDatasetName] = useState<string>("");
    const [comparisonChartState, setComparisonChartState] = useState<ComparisonChartState>({
        comparisonChartName: "",
        datasets: [],
    });

    const statusLabelRef = useRef<HTMLLabelElement>(null);

    function updatePageState(newPageState: SimulatorPageState) {
        const serializablePageState = getSerializedPageState(newPageState);
        const location = getLocationFromState("/simulator", serializablePageState, skipLocationMember);
        setLocation(location, { replace: true });
    }

    const numSimulations = parseIntOrDefault(pageState.numSimulations?.replace(",", ""), 100000);
    let activeSimulationChart: ReactNode | undefined;
    let lootData: ReactNode | undefined;
    let comparisonSimulationInput: ReactNode | undefined;
    let comparisonSimulationChart: ReactNode | undefined;

    // Create the active chart based on the last run simulation
    if (activeChartState !== undefined) {
        let title: string;
        let perXData: Point[];
        let cumulativeData: Point[];
        let xLabel: string;

        if (pageState.xAxis === "Time") {
            title = `Time Units/Kill vs ${activeChartState.botName}`;
            cumulativeData = activeChartState.cumulativeKillPerTuData;
            perXData = activeChartState.killPerTuData;
            xLabel = "Number of Time Units";
        } else {
            title = `Volleys/Kill vs ${activeChartState.botName}`;
            cumulativeData = activeChartState.cumulativeKillPerVolleyData;
            perXData = activeChartState.killPerVolleyData;
            xLabel = "Number of Volleys";
        }

        activeSimulationChart = (
            <div className="chart-container">
                <ScatterLineChart
                    backgroundColors={["rgba(0, 98, 0, 0.3)", "rgba(96, 96, 96, .3)"]}
                    borderColors={["rgba(0, 196, 0, 1)", "rgba(128, 128, 128, 1)"]}
                    chartTitle={title}
                    isPercentage={true}
                    values={[
                        {
                            label: "Current volley kill %",
                            values: perXData,
                        },
                        {
                            label: "Cumulative Kill %",
                            values: cumulativeData,
                        },
                    ]}
                    xLabel={xLabel}
                    yLabel="Percent of Kills"
                />
            </div>
        );

        // Create comparison input section
        comparisonSimulationInput = (
            <div className="page-input-group">
                <LabeledInput
                    label="Dataset Name"
                    value={newCustomDatasetName || ""}
                    onChange={(val) => setNewCustomDatasetName(val)}
                    placeholder="Enter dataset name"
                    tooltip="The name for this dataset when added to the custom comparison chart. Can be renamed once added."
                />
                <Button
                    className="flex-grow-0"
                    onClick={() => {
                        const newState: ComparisonChartState = {
                            ...comparisonChartState,
                        };

                        // Determine new color
                        const colorsUsed = new Array<number>(comparisonBorderColors.length).fill(0);
                        for (const dataset of comparisonChartState.datasets) {
                            colorsUsed[dataset.colorIndex] += 1;
                        }

                        let i = 0;
                        let colorIndex: number;
                        // Find the first available color for the given count
                        // This allows for using all 12 predetermined colors without
                        // any duplicates even if the datasets are not in color order
                        // because some sets were deleted
                        while (true) {
                            colorIndex = colorsUsed.indexOf(i);

                            if (colorIndex >= 0) {
                                break;
                            }

                            i += 1;
                        }

                        const id =
                            comparisonChartState.datasets.length === 0
                                ? 0
                                : Math.max(...comparisonChartState.datasets.map((dataset) => dataset.id)) + 1;

                        // Add the new dataset
                        newState.datasets = [
                            ...comparisonChartState.datasets,
                            {
                                colorIndex: colorIndex,
                                data: activeChartState.comparisonData,
                                id: id,
                                name: newCustomDatasetName,
                            },
                        ];

                        // Update the chart state
                        setComparisonChartState(newState);
                        setNewCustomDatasetName("");
                    }}
                    disabled={newCustomDatasetName === ""}
                >
                    Add To Comparison
                </Button>
            </div>
        );

        // Create loot infoboxes
        if (pageState.showLoot === "Yes") {
            // Show corruption/crits for all parts if any has relevant stats
            const showCorruption =
                activeChartState.lootState.items.find(
                    (item) => item.totalCorruptionPercent > 0 || item.totalFried > 0,
                ) !== undefined;
            const showCriticals =
                activeChartState.lootState.items.find((item) => item.totalCritRemoves > 0) !== undefined;

            lootData = (
                <div className="loot-grid">
                    <SimulatorMatterInfobox
                        bot={botData.getBot(activeChartState.botName)}
                        lootState={activeChartState.lootState}
                    />
                    {activeChartState.lootState.items.map((itemLootState, i) => (
                        <SimulatorLootItemInfobox
                            key={i}
                            itemLootState={itemLootState}
                            numKills={activeChartState.lootState.numKills}
                            showCorruption={showCorruption}
                            showCriticals={showCriticals}
                        />
                    ))}
                </div>
            );
        }
    }

    if (comparisonChartState.datasets.length > 0) {
        // Create comparison chart
        const backgroundColors: string[] = [];
        const borderColors: string[] = [];
        const values: ScatterChartDataGroup[] = [];

        for (const dataset of comparisonChartState.datasets) {
            backgroundColors.push("rgba(0, 0, 0, 0)");
            borderColors.push(comparisonBorderColors[dataset.colorIndex]);
            values.push({
                id: dataset.id.toString(),
                label: dataset.name,
                values: dataset.data,
            });
        }

        comparisonSimulationChart = (
            <>
                <div className="page-input-group">
                    <LabeledInput
                        label="Chart Name"
                        value={comparisonChartState.comparisonChartName || ""}
                        onChange={(val) =>
                            setComparisonChartState({ ...comparisonChartState, comparisonChartName: val })
                        }
                        placeholder="Custom Comparison"
                        tooltip="The name for this dataset when added to the custom comparison chart. Can be renamed once added."
                    />
                </div>
                <div className="custom-dataset-groups">
                    {comparisonChartState.datasets.map((dataset, i) => {
                        return (
                            <div key={dataset.id}>
                                <RoundedInput
                                    onChange={(val) => {
                                        // Replace the name of the dataset that changed
                                        const newDatasets: ComparisonDatasetState[] = [
                                            ...comparisonChartState.datasets,
                                        ];
                                        newDatasets[i] = { ...newDatasets[i], name: val };
                                        setComparisonChartState({ ...comparisonChartState, datasets: newDatasets });
                                    }}
                                    value={dataset.name}
                                />
                                <Button
                                    onClick={() => {
                                        // Remove this dataset
                                        const newDatasets: ComparisonDatasetState[] = [
                                            ...comparisonChartState.datasets,
                                        ];
                                        newDatasets.splice(i, 1);
                                        setComparisonChartState({ ...comparisonChartState, datasets: newDatasets });
                                    }}
                                >
                                    X
                                </Button>
                            </div>
                        );
                    })}
                </div>
                <div className="chart-container">
                    <ScatterLineChart
                        backgroundColors={backgroundColors}
                        borderColors={borderColors}
                        chartTitle={comparisonChartState.comparisonChartName || "Custom Comparison"}
                        isPercentage={true}
                        values={values}
                        xLabel="Number of Time Units"
                        yLabel="Percent of Kills"
                    />
                </div>
            </>
        );
    }

    function simulate() {
        // Run simulation
        let i = 0;
        const initial = performance.now();
        let lastFrame = initial;
        let lastStatusUpdate = lastFrame;
        const state = getSimulatorState(botData, itemData, pageState, setStatusText);

        if (state === undefined) {
            setSimulationInProgress(false);
            return;
        }

        // Run simulation in batches via setTimeout to avoid UI lockup.
        // After each 100 simulations check if we've surpassed 30 ms since the
        // last update (aim for ~30 fps)
        // If so then pass control back so events/updates can be processed.

        function run() {
            for (; i < numSimulations; i++) {
                if (simulationCancelled) {
                    return;
                }

                if (i % 100 === 0) {
                    const now = performance.now();
                    if (now - lastFrame > 30) {
                        lastFrame = now;

                        if (now - lastStatusUpdate > 100) {
                            // Only update status ~ 5 times a second
                            const percent = ((i * 100) / numSimulations).toFixed(1);

                            // Calling setStatusText() here ends up consuming a
                            // large percentage of the CPU when performing
                            // simulations. Instead, a ref is used for
                            // substantially better performance during renders
                            statusLabelRef.current!.innerHTML = `${String(percent).padStart(4, "0")} % completed.`;
                            lastStatusUpdate = now;
                        }

                        // Re-trigger setTimeout to allow UI to not hang
                        setTimeout(run, 0);
                        break;
                    }
                }

                try {
                    if (!simulateCombat(state!)) {
                        // Combat can only fail if we exceed max volleys
                        setStatusText(
                            `The simulation exceeded ${simulatorMaxVolleys} volleys and will likely never kill.`,
                        );
                        setSimulationInProgress(false);
                        return;
                    }
                } catch (e) {
                    console.log(e);
                    setStatusText("The simulation encountered an unexpected error, this is a bug.");
                    setSimulationInProgress(false);
                    return;
                }
            }

            if (i >= numSimulations) {
                // Completed successfully
                let time = performance.now() - initial;
                time /= 1000;
                setStatusText(`Completed in ${time.toFixed(2)} seconds.`);
                setSimulationInProgress(false);
                updateActiveSimulationChart(state!);
            }
        }

        simulationCancelled = false;
        setSimulationInProgress(true);
        run();
    }

    function cancelSimulation() {
        simulationCancelled = true;
        setSimulationInProgress(false);
        setStatusText("Simulation cancelled");
        // Since we are defeating React's change detection by directly setting
        // the label value in simulate, we need to update the text again here
        // to ensure that the value is properly updated
        statusLabelRef.current!.innerHTML = "Simulation cancelled";
    }

    function updateActiveSimulationChart(state: SimulatorState) {
        // Calculate data, round to the given number of decimal places and
        // ignore values smaller to reduce clutter
        function getData(
            perXKillsKeys: string[],
            perXKillsObject: { [key: number]: number },
            numDecimalPlaces: number,
            stepSize: number,
        ) {
            const data = perXKillsKeys
                .filter((numX) => perXKillsObject[numX] / numSimulations > Math.pow(10, -2 - numDecimalPlaces))
                .map((numX) => {
                    return {
                        x: parseInt(numX),
                        y:
                            Math.trunc((perXKillsObject[numX] / numSimulations) * Math.pow(10, 2 + numDecimalPlaces)) /
                            Math.pow(10, numDecimalPlaces),
                    };
                });

            if (data.length < 5) {
                // Add a 0 kill ending point if there aren't many data points
                // to fill out a bit more nicely
                data.push({
                    x: data[data.length - 1].x + stepSize,
                    y: 0,
                });
            }

            return data;
        }

        function getCumulativeData(data: Point[]) {
            const cumulativeData: Point[] = [];
            let total = 0;
            data.forEach((point) => {
                total += point.y;
                cumulativeData.push({
                    x: point.x,
                    y: Math.trunc(total * 100) / 100,
                });
            });

            return cumulativeData;
        }

        // Get comparison data first
        const perXKillsKeys = Object.keys(state.killTus);
        perXKillsKeys.sort((a, b) => parseFloat(a) - parseFloat(b));

        // Note: Melee (especially with followups) can create a lot of
        // relatively  lower probability scenarios due to strange melee delays
        // so add an extra decimal place to avoid cutting out too many
        // results that the max total % would end up being unreasonably
        // low (like under 80%) when killing enemies with particularly
        // large health pools.
        const comparisonData = getCumulativeData(
            getData(perXKillsKeys, state.killTus, state.offensiveState.melee ? 3 : 1, 100),
        );

        const perVolleyData = getData(Object.keys(state.killVolleys), state.killVolleys, 1, 1);
        const perTuData = getData(
            perXKillsKeys,
            state.killTus,
            state.offensiveState.melee ? 3 : 1,
            state.offensiveState.volleyTime,
        );

        const cumulativeKillPerVolley = getCumulativeData(perVolleyData);
        const cumulativeKillPerTu = getCumulativeData(perTuData);

        setActiveChartState({
            botName: pageState.botName || "G-34 Mercenary",
            comparisonData: comparisonData,
            cumulativeKillPerTuData: cumulativeKillPerTu,
            cumulativeKillPerVolleyData: cumulativeKillPerVolley,
            killPerTuData: perTuData,
            killPerVolleyData: perVolleyData,
            lootState: state.lootState,
            volleyTime: state.offensiveState.volleyTime,
        });
    }

    const simulateOrCancelButton = simulationInProgress ? (
        <Button className="simulate-button" tooltip="Cancels the running simulation" onClick={cancelSimulation}>
            Cancel
        </Button>
    ) : (
        <Button className="simulate-button" tooltip="Run the simulation" onClick={simulate}>
            Simulate
        </Button>
    );

    return (
        <div className="page-content">
            <SimulatorPageInput
                pageState={pageState}
                simulationInProgress={simulationInProgress}
                updatePageState={updatePageState}
            />
            <div className="simulate-row">
                {simulateOrCancelButton}
                <label ref={statusLabelRef} className="status-text">
                    {statusText}
                </label>
            </div>
            {activeSimulationChart}
            {comparisonSimulationInput}
            {lootData}
            {comparisonSimulationChart}
        </div>
    );
}
