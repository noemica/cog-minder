// Battle simulation calculation functions/constants
import { Bot, BotImmunity, BotSize } from "../types/botTypes";
import {
    AntimissileChance,
    CorruptionIgnore,
    CorruptionReduce,
    Critical,
    DamageReduction,
    DamageResists,
    DamageType,
    ItemSlot,
    PowerItem,
    PropulsionItem,
    RangedAvoid,
    ReactionControlSystem,
    SelfReduction,
    Shielding,
    SiegeMode,
    Spectrum,
    WeaponItem,
} from "../types/itemTypes";
import {
    BotState,
    DefensiveState,
    ExternalDamageReduction,
    ShieldingPart,
    SiegeState,
    SimulatorPart,
    SimulatorState,
    SimulatorWeapon,
    SpecialPart,
} from "../types/simulatorTypes";
import { hasActiveSpecialProperty, randomInt, sum } from "./common";

const minAccuracy = 10;
const maxRangedAccuracy = 95;
const maxMeleeAccuracy = 100;

export const maxVolleys = 100000;

// Bot size mode to accuracy bonus map
export const sizeAccuracyMap: Map<BotSize, number> = new Map([
    ["Huge", 30],
    ["Large", 10],
    ["Medium", 0],
    ["Small", -10],
    ["Tiny", -30],
]);

// Array of damage reducing parts to sort
// 11. Apply the first and only first defense applicable from the
// following list: phase wall, 75% personal shield (VFP etc),
// Force Field, Shield Generator, stasis bubble, active Stasis Trap,
// Remote Shield, 50% remote shield (Energy Mantle etc.), Hardlight Generator.
const damageReductionSortOrder = [
    "Phase Wall",
    "Vortex Field Projector",
    "7V-RTL'S Ultimate Field",
    "Force Field",
    "Imp. Force Field",
    "Adv. Force Field",
    "Exp. Force Field",
    "Shield Generator",
    "Imp. Shield Generator",
    "Adv. Shield Generator",
    "Exp. Shield Generator",
    "Stasis Bubble",
    "Stasis Trap",
    "Remote Shield",
    "Imp. Remote Shield",
    "Remote Force Field",
    "Imp. Remote Force Field",
    "Energy Mantle",
    "Imp. Energy Mantle",
    "AEGIS Remote Shield",
];

const externalDamageReductionMap: Map<ExternalDamageReduction, number> = new Map([
    ["Remote Shield", 0.75],
    ["Stasis Trap", 0.75],
    ["Phase Wall", 0.5],
    ["Remote Force Field", 0.5],
    ["Stasis Bubble", 0.5],
]);

// Array of force booster accuracy penalties
const forceBoosterAccuracyPenalty = [4, 6, 8];

// Array of force booster maximum damage increases
export const forceBoosterMaxDamageIncrease = [0.2, 0.3, 0.4];

// Base accuracies for combat
export const initialRangedAccuracy = 60;
export const initialMeleeAccuracy = 70;

// Array of melee analysis accuracy increases
const meleeAnalysisAccuracy = [5, 6, 8, 12];

// Array of melee analysis minimum damage increases
export const meleeAnalysisMinDamageIncrease = [2, 3, 4, 6];

// Siege mode text to accuracy bonus/TUs to activate map
export const siegeModeBonusMap: Map<SiegeState, { bonus: number; tus: number }> = new Map([
    ["No Siege", { bonus: 0, tus: 0 }],
    ["In Siege Mode", { bonus: 20, tus: 0 }],
    ["In High Siege Mode", { bonus: 30, tus: 0 }],
    ["Entering Siege Mode", { bonus: 20, tus: 500 }],
    ["Entering High Siege Mode", { bonus: 30, tus: 500 }],
]);

// Map of spectrum values to engine explosion chance
const spectrumMap = {
    "Wide (10)": 10,
    "Intermediate (30)": 30,
    "Narrow (50)": 50,
    "Fine (100)": 100,
};

// Weapon number to base volley time map
export const volleyTimeMap = {
    1: 200,
    2: 300,
    3: 325,
    4: 350,
    5: 375,
    6: 400,
};

type DamageChunk = {
    armorAnalyzed: boolean;
    coreBonus: number;
    critical: Critical | undefined;
    damageType: DamageType;
    disruptChance: number;
    forceCore: boolean;
    originalDamage: number;
    realDamage: number;
    salvage: number;
    spectrum: number;
};

// Adds a part to the bot state
// Intended to only add parts back that have been destroyed
function addRandomDestroyedPart(state: SimulatorState) {
    const botState = state.botState;

    // If no parts destroyed then nothing to do
    if (botState.destroyedParts.length === 0) {
        return;
    }

    // Pick a random destroyed part to restore
    const part = botState.destroyedParts.splice(randomInt(0, botState.destroyedParts.length - 1), 1)[0];

    botState.parts.push(part);
    botState.armorAnalyzedCoverage += part.armorAnalyzedCoverage;
    botState.armorAnalyzedSiegedCoverage += part.armorAnalyzedSiegedCoverage;
    botState.siegedCoverage += part.siegedCoverage;
    botState.totalCoverage += part.coverage;

    // If the part provides damage resistances add them now
    // TODO - remove assumption that there can't be multiple sources of
    // a single type of damage resistance. e.g. One part is 30% and
    // another is providing 25% so we need to fallback to the 25%
    if (part.resistances !== undefined) {
        for (const type of Object.keys(part.resistances)) {
            if (type in botState.resistances) {
                botState.resistances[type]! += part.resistances![type]!;
            }
        }
    }

    part.integrity = part.def.integrity;
    updateWeaponsAccuracy(state);
}

type PartDestroyReason = "Integrity" | "CriticalRemove";

// Applies a final calculated damage value to a bot, splitting into chunks if necessary
function applyDamage(
    state: SimulatorState,
    botState: BotState,
    totalDamage: number,
    numChunks: number,
    critical: Critical | undefined,
    isAoe: boolean,
    armorAnalyzed: boolean,
    disruptChance: any,
    spectrum: any,
    canOverflow: any,
    damageType: DamageType,
    salvage: number,
) {
    const chunks: DamageChunk[] = [];

    // Split damage evenly between chunks while discarding the remainder
    const damage = Math.trunc(totalDamage / numChunks);

    if (isAoe) {
        for (let i = 0; i < numChunks; i++) {
            // Aoe damage ignores a lot of specific mechanics
            chunks.push({
                armorAnalyzed: false,
                critical: undefined,
                coreBonus: 0,
                damageType: damageType,
                disruptChance: 0,
                forceCore: false,
                originalDamage: damage,
                realDamage: 0,
                salvage: salvage,
                spectrum: 0,
            });
        }
    } else {
        for (let i = 0; i < numChunks; i++) {
            chunks.push({
                armorAnalyzed: armorAnalyzed,
                coreBonus: state.offensiveState.coreAnalyzerChance,
                critical: critical,
                damageType: damageType,
                disruptChance: disruptChance,
                forceCore: false,
                originalDamage: damage,
                realDamage: 0,
                salvage,
                spectrum: spectrum,
            });
        }
    }

    // Apply any additional damage reduction (10)
    const part = getDefensiveStatePart(botState.defensiveState.damageReduction);

    const multiplier = part != undefined ? part.reduction : 1;

    if (part !== undefined && part.remote) {
        for (const chunk of chunks) {
            chunk.realDamage = chunk.originalDamage - Math.trunc(chunk.originalDamage * (1 - multiplier));
        }
    } else {
        for (const chunk of chunks) {
            chunk.realDamage = Math.trunc(chunk.originalDamage * multiplier);
        }
    }

    function applyEngineExplosion(part: SimulatorPart) {
        if (part.def.slot !== "Power") {
            return;
        }

        const engine = part.def as PowerItem;
        if (engine.explosionDamageMax > 0 && engine.explosionType !== undefined) {
            // Apply engine explosion randomly as either 1 or 2 chunks (16)
            const baseDamage = randomInt(engine.explosionDamageMin, engine.explosionDamageMax);
            const numChunks = randomInt(engine.minChunks ?? 0, engine.maxChunks ?? 0);
            const chunkDamage = Math.trunc(baseDamage / numChunks);
            botState.salvage += engine.explosionSalvage;

            for (let i = 0; i < numChunks; i++) {
                applyDamageChunk(
                    0,
                    chunkDamage,
                    engine.explosionType!,
                    undefined,
                    false,
                    false,
                    engine.explosionDisruption,
                    spectrumToNumber(engine.explosionSpectrum),
                    false,
                );
            }
        }
    }

    function applyDamageChunk(
        coreBonus: number,
        damage: number,
        damageType: DamageType,
        critical: Critical | undefined,
        isOverflow: boolean,
        forceCore: boolean,
        disruptChance: number,
        spectrum: number,
        armorAnalyzed: boolean,
    ) {
        // Determine hit part (13)
        const { part, partIndex } = getHitPart(botState, coreBonus, damageType, isOverflow, forceCore, armorAnalyzed);
        applyDamageChunkToPart(damage, damageType, critical, disruptChance, spectrum, isOverflow, part, partIndex);
    }

    function destroyPart(
        partIndex: number,
        part: SimulatorPart,
        overflowDamage: number,
        damageType: DamageType,
        destroyReason: PartDestroyReason,
    ) {
        botState.parts.splice(partIndex, 1);
        botState.armorAnalyzedCoverage -= part.armorAnalyzedCoverage;
        botState.armorAnalyzedSiegedCoverage -= part.armorAnalyzedSiegedCoverage;
        botState.siegedCoverage -= part.siegedCoverage;
        botState.totalCoverage -= part.coverage;

        // If the part was providing any damage resistances remove them now
        // TODO - remove assumption that there can't be multiple sources of
        // a single type of damage resistance. e.g. One part is 30% and
        // another is providing 25% so we need to fallback to the 25%
        if (part.resistances !== undefined) {
            for (const type of Object.keys(part.resistances)) {
                if (type in botState.resistances) {
                    botState.resistances[type]! -= part.resistances![type]!;
                }
            }
        }

        if (overflowDamage > 0 && !part.protection && canOverflow && critical === undefined) {
            // Handle overflow damage if excess damage was dealt
            // against a non-protection part (18)
            applyDamageChunk(0, overflowDamage, damageType, undefined, true, false, 0, 0, false);
        }

        if (damageType === "Impact") {
            // Apply 50-150% random corruption to the bot after
            // destroying a part (affected by EM resistance) (22)
            let corruption = randomInt(50, 150);
            corruption = calculateResistDamage(botState, corruption, "Electromagnetic");

            applyCorruption(corruption);
        }

        if (
            destroyReason === "CriticalRemove" &&
            part.integrity > 0 &&
            // Processors/hackware removed via crit get destroyed
            part.def.type !== "Processor" &&
            part.def.type !== "Hackware"
        ) {
            // Save loot stats if the part gets removed due to crit effect
            state.lootState.items[part.initialIndex].numDrops += 1;
            state.lootState.items[part.initialIndex].totalCritRemoves += 1;
            state.lootState.items[part.initialIndex].totalIntegrity += part.integrity;
        }

        part.integrity = 0;
        updateWeaponsAccuracy(state);

        botState.destroyedParts.push(part);
    }

    function applyCorruption(corruption: number) {
        // Check for corruption prevention parts
        let corruptionPreventPart = getDefensiveStatePart(botState.defensiveState.corruptionPrevent);
        while (corruption > 0 && corruptionPreventPart !== undefined) {
            // Assume that corruption prevention parts lose 2 integrity per corruption purged
            // TODO - remove this assumption someday
            const maxPrevention = Math.ceil(corruptionPreventPart.part.integrity / 2);
            if (maxPrevention < corruption) {
                // Part has more than enough integrity to prevent corruption
                corruptionPreventPart.part.integrity -= corruption *= 2;
                corruption = 0;
            } else {
                // Corruption is greater than part can prevent, destroy part
                botState.defensiveState.corruptionPrevent.shift();
                const index = botState.parts.indexOf(corruptionPreventPart.part);
                destroyPart(index, corruptionPreventPart.part, 0, "Entropic", "Integrity");
                corruptionPreventPart = getDefensiveStatePart(botState.defensiveState.corruptionPrevent);

                corruption -= maxPrevention;
            }
        }

        botState.corruption += corruption;
    }

    function applyDamageChunkToPart(
        damage: number,
        damageType: DamageType,
        critical: Critical | undefined,
        disruptChance: number,
        spectrum: number,
        isOverflow: boolean,
        part: SimulatorPart | undefined,
        partIndex: number,
    ) {
        function doesCriticalDestroyPart(critical: Critical | undefined) {
            if (critical === Critical.Destroy || critical === Critical.Smash) {
                return true;
            }

            return false;
        }

        // Remove all criticals from totally immune bots
        if (critical !== undefined) {
            if (
                botState.immunities.includes(BotImmunity.Criticals) ||
                getDefensiveStatePart(botState.defensiveState.critImmunity) !== undefined
            ) {
                critical = undefined;
            }
        }

        // Apply meltdown as immediate death unless immune
        if (critical === Critical.Meltdown && !botState.immunities.includes(BotImmunity.Meltdown)) {
            botState.coreIntegrity = 0;
            return;
        }
        // Apply intensify damage doubling here
        else if (critical === Critical.Intensify) {
            damage *= 2.0;
        }
        // Apply impale damage doubling and add delay of 1 turn
        else if (critical === Critical.Impale) {
            damage *= 2.0;
            state.tus += 100;
        }
        // Apply detonate crit
        else if (critical === Critical.Detonate) {
            let i: number;
            for (i = 0; i < botState.parts.length; i++) {
                if (botState.parts[i].def.slot === "Power") {
                    break;
                }
            }

            // Destroy first engine found (if any)
            if (i < botState.parts.length) {
                const engine = botState.parts[i];
                destroyPart(i, engine, 0, "Entropic", "Integrity");
                applyEngineExplosion(engine);

                if (i === partIndex) {
                    // If detonate exploded power we were targeting just exit
                    return;
                }
            }
        }
        // Remove sever/sunder crit if target bot is immune
        else if (
            (critical === Critical.Sever || critical === Critical.Sunder) &&
            botState.immunities.includes(BotImmunity.Dismemberment)
        ) {
            critical = undefined;
        }
        // Remove phase crit if bot is coring immune or has core shielding
        else if (
            critical === Critical.Phase &&
            (botState.immunities.includes(BotImmunity.Coring) || getShieldingType(botState, "Core") === undefined)
        ) {
            critical = undefined;
        }

        // Handle core hit
        if (part === undefined) {
            // Try to get shielding
            const shielding = isOverflow ? undefined : getShieldingType(botState, "Core");

            // Remove crit types that apply to the core if immunity or shielding (14)
            if (
                (critical === Critical.Destroy ||
                    critical == Critical.Phase ||
                    critical == Critical.Smash ||
                    critical == Critical.Sunder ||
                    critical == Critical.Sever) &&
                (botState.immunities.includes(BotImmunity.Coring) || shielding !== undefined)
            ) {
                critical = undefined;
            }

            if (shielding != undefined) {
                // Handle core shielding reduction
                // Note: shielding may absorb more damage than integrity
                const shieldingDamage = Math.trunc(shielding.reduction * damage);
                shielding.part.integrity -= shieldingDamage;

                if (shielding.part.integrity <= 0) {
                    // Remove shielding if it has run out of integrity
                    const index = botState.parts.indexOf(shielding.part);
                    destroyPart(index, shielding.part, 0, "Entropic", "Integrity");
                }

                damage = damage - shieldingDamage;
            }

            if (critical === Critical.Destroy || critical === Critical.Smash) {
                botState.coreIntegrity = 0;
            } else {
                botState.coreIntegrity -= damage;
            }

            if (botState.coreIntegrity === 0) {
                return;
            }

            // Apply disruption (15)
            // Core disruption only has 50% of the usual chance
            if (!botState.immunities.includes(BotImmunity.Disruption) && randomInt(0, 99) < disruptChance / 2) {
                botState.coreDisrupted = true;
            }

            // Apply relevant criticals not yet applied
            // Apply sever/sunder crits to other parts
            if (critical === Critical.Sever || critical === Critical.Sunder) {
                const numParts = critical === Critical.Sunder ? randomInt(1, 2) : 1;
                for (let i = 0; i < numParts; i++) {
                    const { part, partIndex } = getRandomNonCorePart(botState, undefined);
                    if (part === undefined || getShieldingType(botState, part.def.slot) !== undefined) {
                        // Shielding protects against sever/sunder completely
                        continue;
                    }

                    if (part.def.size > 1) {
                        // Parts taking 2 or more slots can't be removed via sever/sunder
                        continue;
                    }

                    // Core severed parts lose 5-25% of integrity
                    part.integrity -= Math.trunc((part.def.integrity * randomInt(5, 25)) / 100);

                    destroyPart(partIndex, part, 0, "Phasic", "CriticalRemove");
                }

                return;
            } else if (critical === Critical.Blast) {
                const { part, partIndex } = getRandomNonCorePart(botState, undefined);
                if (part === undefined || getShieldingType(botState, part.def.slot) !== undefined) {
                    // Shielding protects against blast completely
                    return;
                }

                if (part.def.size === 1) {
                    // Single-slot items get blasted off
                    // Deal damage first, then destroy as a critical part removal if still intact
                    applyDamageChunkToPart(damage, "Phasic", undefined, 0, 0, false, part, partIndex);

                    // Dismemberment immunity stops the blasting off part
                    if (part.integrity > 0 && !botState.immunities.includes(BotImmunity.Dismemberment)) {
                        destroyPart(partIndex, part, 0, "Phasic", "CriticalRemove");
                    }
                } else {
                    // Multi-slot items don't get blasted off but still take damage
                    applyDamageChunkToPart(damage, "Phasic", undefined, 0, 0, false, part, partIndex);
                }
            } else if (critical === Critical.Phase) {
                // Apply phasing damage to another random part
                const { part, partIndex } = getRandomNonCorePart(botState, undefined);
                applyDamageChunkToPart(damage, "Phasic", undefined, 0, 0, false, part, partIndex);
            }

            return;
        }

        // Handle non-core hit
        // Try to get shielding for non-protection parts
        const shielding =
            part.def.type === "Protection" || isOverflow ? undefined : getShieldingType(botState, part.def.slot);

        // Check for crit immunity or shielding (14)
        if (shielding !== undefined && doesCriticalDestroyPart(critical)) {
            critical = undefined;
        }

        // Check for spectrum engine explosion (16)
        const engineExplosion = part.def.slot === "Power" && randomInt(0, 99) < spectrum;

        // Protection can't get instantly destroyed, only receives 20% more damage
        // Also check for crits against sieged treads, they can't be destroyed
        if (
            (doesCriticalDestroyPart(critical) && part.protection) ||
            (botState.sieged && part.def.type === "Treads" && (part.def as PropulsionItem).siege !== undefined)
        ) {
            critical = undefined;
            damage = Math.trunc(1.2 * damage);
        }

        // Reduce damage for powered armor/siege mode (17)
        if (part.selfDamageReduction !== 0) {
            damage = Math.trunc(damage * part.selfDamageReduction);
        } else if (part.def.type === "Treads" && (part.def as PropulsionItem).siege !== undefined && botState.sieged) {
            damage = Math.trunc(damage * ((part.def as PropulsionItem).siege === SiegeMode.High ? 0.5 : 0.75));
        }

        // Apply disruption to non-core parts (17)
        // TODO

        if (shielding != undefined) {
            // Handle slot shielding reduction
            // Note: shielding may absorb more damage than integrity
            const shieldingDamage = Math.trunc(shielding.reduction * damage);
            shielding.part.integrity -= shieldingDamage;

            if (shielding.part.integrity <= 0) {
                // Remove shielding if it has run out of integrity
                const index = botState.parts.indexOf(shielding.part);
                destroyPart(index, shielding.part, 0, "Entropic", "Integrity");
            }

            damage = damage - shieldingDamage;
        }

        const destroyed = part.integrity <= damage || doesCriticalDestroyPart(critical) || engineExplosion;

        // Apply sever/sunder to instantly-remove (not destroy) part if it's a single slot and unshielded
        // Applied differently than other part destruction since this can't affect multislot
        // parts but can affect protection
        if (
            !destroyed &&
            (critical === Critical.Sever || critical === Critical.Sunder) &&
            part.def.size === 1 &&
            shielding === undefined
        ) {
            if (!destroyed) {
                destroyPart(partIndex, part, 0, "Slashing", "CriticalRemove");
            }
        }

        if (destroyed) {
            // Part destroyed, remove part and update bot state
            // Smash critical destroys the part instantly and deals full overflow damage
            const overflowDamage = critical === Critical.Smash ? damage : damage - part.integrity;
            destroyPart(partIndex, part, overflowDamage, damageType, "Integrity");
        } else {
            // Part not destroyed, just reduce integrity
            part.integrity -= damage;
        }

        // Apply relevant criticals not yet applied
        const oldIndex = partIndex;
        if (critical === Critical.Blast) {
            const { part, partIndex } = getRandomNonCorePart(botState, destroyed ? oldIndex : undefined);
            if (part === undefined || shielding !== undefined) {
                // Shielding protects against blast completely
                return;
            }

            if (part.def.size === 1) {
                // Single-slot items get blasted off
                // Deal damage first, then destroy as a critical part removal if still intact
                applyDamageChunkToPart(damage, "Phasic", undefined, 0, 0, false, part, partIndex);

                // Dismemberment immunity stops the blasting off part
                if (part.integrity > 0 && !botState.immunities.includes(BotImmunity.Dismemberment)) {
                    destroyPart(partIndex, part, 0, "Phasic", "CriticalRemove");
                }
            } else {
                // Multi-slot items don't get blasted off but still take damage
                applyDamageChunkToPart(damage, "Phasic", undefined, 0, 0, false, part, partIndex);
            }
        } else if (critical === Critical.Phase) {
            // Apply phasing damage to the core
            applyDamageChunkToPart(damage, "Phasic", undefined, 0, 0, false, undefined, -1);
        }

        if (engineExplosion) {
            applyEngineExplosion(part);
        }
    }

    // Apply salvage for all chunks simulatenously
    botState.salvage += salvage;

    // Apply damage
    for (const chunk of chunks) {
        if (chunk.realDamage === 0) {
            // Don't process the chunk if damage is reduced to 0 by shielding
            return;
        }

        applyDamageChunk(
            chunk.coreBonus,
            chunk.realDamage,
            chunk.damageType,
            chunk.critical,
            false,
            chunk.forceCore,
            chunk.disruptChance,
            chunk.spectrum,
            chunk.armorAnalyzed,
        );

        // Apply corruption (22)
        if (damageType === "Electromagnetic") {
            // Check for corruption ignore chance
            const corruptionIgnorePart = getDefensiveStatePart(botState.defensiveState.corruptionIgnore);
            const corruptCritical =
                critical === Critical.Corrupt && !botState.immunities.includes(BotImmunity.Criticals);

            if (corruptionIgnorePart === undefined || randomInt(0, 99) >= corruptionIgnorePart.chance) {
                // Corruption critical always applies maximum 1.5 critical modifier
                const corruptionPercent = corruptCritical ? 1.5 : randomInt(50, 150) / 100;
                const corruption = chunk.originalDamage * corruptionPercent;

                applyCorruption(corruption);
            }
        }
    }
}

// Returns a clone of a bot state
// This is not a deep copy, any fields that can be modified are deep-copied
// but immutable fields are not.
function cloneBotState(botState: BotState): BotState {
    const resistances = {};
    for (const type of Object.keys(botState.resistances)) {
        resistances[type] = botState.resistances[type];
    }
    const newState: BotState = {
        armorAnalyzedCoverage: botState.armorAnalyzedCoverage,
        armorAnalyzedSiegedCoverage: botState.armorAnalyzedSiegedCoverage,
        behavior: botState.behavior,
        coreCoverage: botState.coreCoverage,
        coreDisrupted: botState.coreDisrupted,
        coreIntegrity: botState.coreIntegrity,
        corruption: botState.corruption,
        def: botState.def,
        defensiveState: undefined as any,
        destroyedParts: [],
        externalDamageReduction: botState.externalDamageReduction,
        immunities: botState.immunities,
        initialCoreIntegrity: botState.initialCoreIntegrity,
        parts: botState.parts.map((p) => {
            return {
                armorAnalyzedSiegedCoverage: p.armorAnalyzedSiegedCoverage,
                armorAnalyzedCoverage: p.armorAnalyzedCoverage,
                coverage: p.coverage,
                def: p.def,
                integrity: p.integrity,
                initialIndex: p.initialIndex,
                protection: p.protection,
                selfDamageReduction: p.selfDamageReduction,
                siegedCoverage: p.siegedCoverage,
            };
        }),
        partRegen: botState.partRegen,
        coreRegen: botState.coreRegen,
        resistances: resistances,
        running: botState.running,
        runningEvasion: botState.runningEvasion,
        runningMomentum: botState.runningMomentum,
        salvage: 0,
        sieged: botState.sieged,
        siegedCoverage: botState.siegedCoverage,
        superfortressRegen: botState.superfortressRegen,
        tusToSiege: botState.tusToSiege,
        totalCoverage: botState.totalCoverage,
    };
    newState.defensiveState = getBotDefensiveState(newState.parts, newState.externalDamageReduction);

    return newState;
}

// Calculates the resisted damage for a bot given the initial damage value
export function calculateResistDamage(botState: BotState, damage: number, damageType: DamageType): number {
    if (damageType in botState.resistances) {
        return Math.trunc(damage * (1 - botState.resistances[damageType]! / 100));
    }

    return damage;
}

// Returns a bot's defensive state based on parts, also adds new relevant
// properties to parts
export function getBotDefensiveState(
    parts: SimulatorPart[],
    externalDamageReduction: ExternalDamageReduction,
): DefensiveState {
    const state: DefensiveState = {
        antimissile: [],
        avoid: [],
        corruptionIgnore: [],
        corruptionPrevent: [],
        corruptionReduce: [],
        critImmunity: [],
        damageReduction: [],
        rangedAvoid: [],
        shieldings: {
            Core: [],
            "N/A": [],
            Power: [],
            Propulsion: [],
            Utility: [],
            Weapon: [],
        },
    };

    for (const part of parts) {
        if (hasActiveSpecialProperty(part.def, true, "AntimissileChance")) {
            state.antimissile.push({
                // Antimissile system-like part
                chance: (part.def.specialProperty!.trait as AntimissileChance).chance,
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "ReactionControlSystem")) {
            // Reaction Control System-like part
            // Leg/hover/flight determination done at accuracy update time
            state.avoid.push({
                legs: (part.def.specialProperty!.trait as ReactionControlSystem).legsChance,
                other: (part.def.specialProperty!.trait as ReactionControlSystem).chance,
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "CorruptionIgnore")) {
            // Dynamic Insulation System-like part
            state.corruptionIgnore.push({
                chance: (part.def.specialProperty!.trait as CorruptionIgnore).chance,
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "CorruptionPrevent")) {
            // Corruption Screen part
            state.corruptionPrevent.push({
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "CorruptionReduce")) {
            // Corruption Screen part
            state.corruptionReduce.push({
                amount: (part.def.specialProperty!.trait as CorruptionReduce).amount,
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "CriticalImmunity")) {
            // Critical immunity part
            state.critImmunity.push({
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "DamageReduction")) {
            // Force field-like part
            state.damageReduction.push({
                reduction: (part.def.specialProperty!.trait as DamageReduction).multiplier,
                remote: (part.def.specialProperty!.trait as DamageReduction).remote,
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "DamageResists")) {
            // Damage type resist part
            part.resistances = (part.def.specialProperty!.trait as DamageResists).resists;
        } else if (hasActiveSpecialProperty(part.def, true, "RangedAvoid")) {
            // Phase shifter-like part
            state.rangedAvoid.push({
                avoid: (part.def.specialProperty!.trait as RangedAvoid).avoid,
                part: part,
            });
        } else if (hasActiveSpecialProperty(part.def, true, "SelfReduction")) {
            // Powered armor-like part
            part.selfDamageReduction = (part.def.specialProperty!.trait as SelfReduction).shielding;
        } else if (hasActiveSpecialProperty(part.def, true, "Shielding")) {
            // Shielding-like part
            const trait = part.def.specialProperty!.trait as Shielding;
            state.shieldings[trait.slot].push({ reduction: trait.shielding, part: part });
        }
    }

    // Sort damage reduction (11)
    if (externalDamageReductionMap.has(externalDamageReduction)) {
        const reduction = externalDamageReductionMap.get(externalDamageReduction) || 1.0;
        const remote = externalDamageReduction.includes("Remote");

        if (state.damageReduction.length === 0) {
            // If no other damage reduction no need to sort
            state.damageReduction.push({
                reduction: reduction,
                remote: remote,
                part: {
                    armorAnalyzedSiegedCoverage: 0,
                    armorAnalyzedCoverage: 0,
                    coverage: 0,
                    def: undefined as any,
                    integrity: 1,
                    initialIndex: 0,
                    protection: false,
                    selfDamageReduction: 0,
                    siegedCoverage: 0,
                },
            });
        } else {
            const existingIndex = damageReductionSortOrder.indexOf(state.damageReduction[0].part.def.name);
            const newIndex = damageReductionSortOrder.indexOf(externalDamageReduction);

            // Use sort order to decide to insert before or after
            if (newIndex < existingIndex) {
                state.damageReduction.unshift({
                    reduction: reduction,
                    remote: remote,
                    part: {
                        armorAnalyzedCoverage: 0,
                        armorAnalyzedSiegedCoverage: 0,
                        coverage: 0,
                        def: undefined as any,
                        integrity: 1,
                        initialIndex: 0,
                        protection: false,
                        selfDamageReduction: 0,
                        siegedCoverage: 0,
                    },
                });
            } else {
                state.damageReduction.push({
                    remote: remote,
                    reduction: reduction,
                    part: {
                        armorAnalyzedCoverage: 0,
                        armorAnalyzedSiegedCoverage: 0,
                        coverage: 0,
                        def: undefined as any,
                        initialIndex: 0,
                        integrity: 1,
                        protection: false,
                        selfDamageReduction: 0,
                        siegedCoverage: 0,
                    },
                });
            }
        }
    }

    // All other parts should technically be sorted as well.
    // However, in game no bot ever has duplicate mixed-level defenses,
    // some have multiples of the same level like 2 base weapon shieldings on
    // Warbot which, but that doesn't require sorting anyways.

    return state;
}

// Tries to get a bot defensive state part from an array
// Parts will be removed from the array if their integrity has dropped below 0
function getDefensiveStatePart<T extends SpecialPart>(array: T[]) {
    let part: T | undefined = undefined;

    while (array.length > 0) {
        if (array[0].part.integrity > 0) {
            // Found a good part, use it here
            part = array[0];
            break;
        } else {
            // Found destroyed part, remove from array
            array.shift();
        }
    }

    return part;
}

// Determines the part that was hit by an attack
function getHitPart(
    botState: BotState,
    coreBonus: number,
    damageType: DamageType,
    isOverflow: boolean,
    forceCore: boolean,
    armorAnalyzed: boolean,
) {
    let part: SimulatorPart | undefined = undefined;
    let partIndex = -1;

    if (forceCore) {
        return {
            part: part,
            partIndex: partIndex,
        };
    }

    if (damageType === "Impact") {
        // Impact damage targets core and all parts with coverage relative to their slots
        let coverageHit = randomInt(0, botState.parts.map((p) => p.def.size).reduce(sum, 0));
        for (let i = 0; i < botState.parts.length; i++) {
            if (coverageHit < botState.parts[i].def.size) {
                partIndex = i;
                break;
            }

            coverageHit -= botState.parts[i].def.size;
        }

        // Assign part if non-core hit, otherwise leave undefined on core
        if (partIndex >= 0) {
            part = botState.parts[partIndex];
        }
    } else if (isOverflow) {
        const protectionParts = botState.parts.filter((p) => p.protection && p.coverage > 0);
        if (protectionParts.length > 0) {
            // Handle overflow damage specially when there's armor,
            // overflow into a random armor piece based on coverage (19)
            let coverageHit = randomInt(
                0,
                protectionParts.reduce((prev, part) => prev + part.coverage, 0),
            );

            for (let i = 0; i < protectionParts.length; i++) {
                coverageHit -= protectionParts[i].coverage;

                if (coverageHit < 0) {
                    part = protectionParts[i];
                    break;
                }

                // If it's a core hit we'll run through all parts and exit
                // the loop with part still equal to undefined
            }

            partIndex = botState.parts.indexOf(part as SimulatorPart);
        }

        // If no protection parts fall into standard coverage behavior
    }

    // Check to avoid rerolling an impact core hit
    if (part === undefined && damageType !== "Impact") {
        let totalCoverage: number;
        if (armorAnalyzed) {
            if (botState.sieged) {
                totalCoverage = botState.armorAnalyzedSiegedCoverage;
            } else {
                totalCoverage = botState.armorAnalyzedCoverage;
            }
        } else {
            if (botState.sieged) {
                totalCoverage = botState.siegedCoverage;
            } else {
                totalCoverage = botState.totalCoverage;
            }
        }
        if (damageType == "Piercing") {
            // Not ideal to force this here because it means the user has to account for half_stack manually
            // Makes the UI very cluttered if we want to make the user choose all the possible combinations though
            coreBonus += 8;
        }

        if (coreBonus > 0) {
            // Apply any core exposure % increases
            totalCoverage -= botState.coreCoverage;

            // Cap boosted coverage at 99.9% to avoid wrapping around to giving a negative core bonus
            const coreCoveragePercentage = Math.min(
                botState.coreCoverage / botState.totalCoverage + coreBonus / 100,
                0.999,
            );
            const boostedCoreCoverage = botState.totalCoverage * coreCoveragePercentage;
            totalCoverage += boostedCoreCoverage;
        }

        let coverageHit = randomInt(0, totalCoverage - 1);

        for (partIndex = 0; partIndex < botState.parts.length; partIndex++) {
            // Subtract part's coverage to see if we got a hit
            if (armorAnalyzed) {
                if (botState.sieged) {
                    coverageHit -= botState.parts[partIndex].armorAnalyzedSiegedCoverage;
                } else {
                    coverageHit -= botState.parts[partIndex].armorAnalyzedCoverage;
                }
            } else {
                if (botState.sieged) {
                    coverageHit -= botState.parts[partIndex].siegedCoverage;
                } else {
                    coverageHit -= botState.parts[partIndex].coverage;
                }
            }
            if (coverageHit < 0) {
                part = botState.parts[partIndex];
                break;
            }

            // If it's a core hit we'll run through all parts and exit
            // the loop with part still equal to undefined
        }
    }

    return {
        part: part,
        partIndex: partIndex,
    };
}

// Gets a random (i.e. coverage-ignoring) non-core part, used for some crit effects
function getRandomNonCorePart(botState: BotState, ignoreIndex: number | undefined) {
    // Randomly target all parts, possibly excluding another specific index
    let partHit = randomInt(0, botState.parts.length - 1 - (ignoreIndex === undefined ? 0 : 1));

    if (ignoreIndex !== undefined && ignoreIndex > 0 && partHit >= ignoreIndex) {
        // Adjust the coverage index based on the ignored part
        partHit += 1;
    }

    if (partHit >= botState.parts.length) {
        return {
            part: undefined,
            partIndex: -1,
        };
    }

    const part = botState.parts[partHit];

    return {
        part: part,
        partIndex: partHit,
    };
}

// Calculates a weapon's recoil based on the number of treads and other recoil reduction
export function getRecoil(weaponDef: WeaponItem, recoilReduction: number): number {
    let recoil = 0;

    // Add recoil if siege mode not active
    if (weaponDef.recoil !== undefined) {
        recoil += weaponDef.recoil;
        recoil -= recoilReduction;
    }

    // Make sure we don't have negative recoil
    return Math.max(recoil, 0);
}

const regenRegex = /Core Regeneration \((\d*)\)/;
// Gets the core regen value for a bot, otherwise 0
export function getRegen(bot: Bot): number {
    const traits = bot.traits;

    for (let i = 0; i < traits.length; i++) {
        const result = regenRegex.exec(traits[i]);

        if (result != null) {
            return parseInt(result[1]);
        }
    }

    return 0;
}

// Gets the volley time given an array of ranged weapons
export function getRangedVolleyTime(weapons: WeaponItem[], cyclerModifier: number): number {
    let volleyTime: number;
    if (weapons.length === 0) {
        return 0;
    } else if (weapons.length in volleyTimeMap) {
        volleyTime = volleyTimeMap[weapons.length];
    } else {
        // No additional penalty past 6 weapons
        volleyTime = 400;
    }

    for (const weapon of weapons) {
        // Apply individual delays
        volleyTime += weapon.delay ?? 0;
    }

    volleyTime *= cyclerModifier;

    // Min time is capped at 25
    return Math.trunc(Math.max(25, volleyTime));
}

// Tries to get a bot's first shielding for a specific slot
// Parts will be removed from the array if their integrity has dropped below 0
function getShieldingType(botState: BotState, slot: ItemSlot | "Core"): ShieldingPart | undefined {
    return getDefensiveStatePart(botState.defensiveState.shieldings[slot]);
}

// Gets the bot's corruption when accounting for corruption reduction utilities
function getBotCorruption(botState: BotState) {
    let corruption = botState.corruption;

    for (const p of botState.defensiveState.corruptionReduce) {
        if (p.part.integrity >= 0) {
            corruption -= p.amount;
        }
    }

    return corruption;
}

type EndConditions = {
    volleyEndCondition: (state: BotState) => boolean;
    projectileEndCondition: (state: BotState) => boolean;
};
const simulationEndConditions: { [key: string]: EndConditions } = {
    Kill: {
        volleyEndCondition: function (botState) {
            return botState.coreIntegrity <= 0 || getBotCorruption(botState) >= 100;
        },
        projectileEndCondition: function (botState) {
            return botState.coreIntegrity <= 0;
        },
    },
    "Kill or Core Disrupt": {
        projectileEndCondition: function (botState) {
            return botState.coreIntegrity <= 0;
        },
        volleyEndCondition: function (botState) {
            return botState.coreIntegrity <= 0 || getBotCorruption(botState) >= 100 || botState.coreDisrupted;
        },
    },
    "Kill or No Power": {
        projectileEndCondition: function (botState) {
            return botState.coreIntegrity <= 0;
        },
        volleyEndCondition: function (botState) {
            return (
                botState.coreIntegrity <= 0 ||
                getBotCorruption(botState) >= 100 ||
                botState.parts.every((part) => part.def.slot != "Power")
            );
        },
    },
    "Kill or No Weapons": {
        projectileEndCondition: function (botState) {
            return botState.coreIntegrity <= 0;
        },
        volleyEndCondition: function (botState) {
            return (
                botState.coreIntegrity <= 0 ||
                getBotCorruption(botState) >= 100 ||
                botState.parts.every((part) => part.def.slot != "Weapon")
            );
        },
    },
    "Kill or No TNC": {
        projectileEndCondition: function (botState) {
            return botState.coreIntegrity <= 0;
        },
        volleyEndCondition: function (botState) {
            return (
                botState.coreIntegrity <= 0 ||
                getBotCorruption(botState) >= 100 ||
                botState.parts.every((part) => part.def.name != "Transport Network Coupler")
            );
        },
    },
    Tele: {
        projectileEndCondition: function (botState) {
            return botState.coreIntegrity <= 0;
        },
        volleyEndCondition: function (botState) {
            return (
                botState.coreIntegrity <= botState.initialCoreIntegrity * 0.8 ||
                botState.parts.filter((part) => part.def.slot === "Weapon").length === 1 ||
                botState.parts.filter((part) => part.def.slot === "Propulsion").length === 1
            );
        },
    },
};
// Fully simulates rounds of combat to a kill a bot from an initial state
export function simulateCombat(state: SimulatorState): boolean {
    // Clone initial bot state
    const botState = cloneBotState(state.initialBotState);
    state.botState = botState;
    const offensiveState = state.offensiveState;
    let volleys = 0;

    let oldTus = 0;
    state.tus = 0;
    state.actionNum = 0;

    // Update initial accuracy
    updateWeaponsAccuracy(state);

    const endConditions = simulationEndConditions[state.endCondition];

    // Update initial sneak attack state
    offensiveState.sneakAttack =
        offensiveState.sneakAttackStrategy === "All" || offensiveState.sneakAttackStrategy === "First Only";

    // Update initial momentum
    offensiveState.momentum.current = offensiveState.momentum.bonus + offensiveState.momentum.initial;

    let end = false;
    while (!end) {
        // Apply core regen
        const lastCompletedTurns = Math.trunc(oldTus / 100);
        const newCompletedTurns = Math.trunc(state.tus / 100);
        const coreRegenIntegrity = botState.coreRegen * (newCompletedTurns - lastCompletedTurns);

        botState.coreIntegrity = Math.min(botState.initialCoreIntegrity, botState.coreIntegrity + coreRegenIntegrity);

        // Apply part regen to existing parts
        const partRegenIntegrity = botState.partRegen * (newCompletedTurns - lastCompletedTurns);
        for (const part of botState.parts) {
            part.integrity = Math.min(part.integrity + partRegenIntegrity, part.def.integrity);
        }

        if (botState.partRegen > 0) {
            // Apply part regen to destroyed parts
            // Every 10 turns, one part is recreated
            const numRegenTurns = [...Array(newCompletedTurns - lastCompletedTurns)]
                .map((_, i) => i + lastCompletedTurns)
                .filter((t) => t % 10 === 0).length;

            for (let i = 0; i < numRegenTurns; i++) {
                addRandomDestroyedPart(state);
            }
        }

        if (botState.superfortressRegen) {
            // Check for superfortress part regrowth
            if (newCompletedTurns <= botState.superfortressRegen.nextRegenAttempt) {
                addRandomDestroyedPart(state);

                // Observation shows this to be between this range
                // There are probably more complex rules, but this is a decent
                // enough approximation
                botState.superfortressRegen.nextRegenAttempt += randomInt(5, 25);
            }
        }

        // Process each volley
        volleys += 1;
        let volleyTime = offensiveState.volleyTime;

        if (offensiveState.melee) {
            // Always do primary attack
            end = simulateWeapon(state, state.weapons[0], endConditions.projectileEndCondition);
            state.actionNum += 1;

            if (state.actionNum <= 2) {
                // Update accuracy after the initial weapon on relevant action #s
                updateWeaponsAccuracy(state);
            }

            // Handle followups chances
            for (let i = 1; i < state.weapons.length && !end; i++) {
                if (randomInt(0, 99) < offensiveState.followupChances[i - 1]) {
                    end = simulateWeapon(state, state.weapons[i], endConditions.projectileEndCondition);

                    // Add followup delay, 50% of normal
                    volleyTime += 0.5 * state.weapons[i].delay;
                }
            }

            // Apply volley modifier (actuators) here since the total time
            // can't be known ahead of time
            volleyTime *= offensiveState.volleyTimeModifier;

            if (volleys === 1) {
                // Disable sneak attack if active only for the first turn
                if (offensiveState.sneakAttackStrategy === "First Only") {
                    offensiveState.sneakAttack = false;
                }

                // Remove initial momentum
                offensiveState.momentum.current = offensiveState.momentum.bonus;
            }
        } else {
            let firstWeapon = true;
            for (const weapon of state.weapons) {
                end = simulateWeapon(state, weapon, endConditions.projectileEndCondition);

                if (end) {
                    break;
                }

                if (firstWeapon) {
                    // Update accuracy after the initial weapon on relevant action #s
                    firstWeapon = false;
                    state.actionNum += 1;

                    if (state.actionNum <= 2) {
                        updateWeaponsAccuracy(state);
                    }
                }
            }
        }

        if (volleys >= maxVolleys) {
            // Exceeded max volleys and combat will likely never complete
            // Just bail here
            return false;
        }

        if (offensiveState.ramming) {
            // Ramming is always the slower of 100 TUs or the movement speed time
            volleyTime = Math.max(100, offensiveState.speed);
        }

        // Update TUs and time based changes
        oldTus = state.tus;
        state.tus += volleyTime;

        let updateAccuracy = false;

        // Update accuracy when crossing siege mode activation
        if (
            !offensiveState.melee &&
            oldTus < offensiveState.siegeBonus.tus &&
            state.tus >= offensiveState.siegeBonus.tus
        ) {
            updateAccuracy = true;
        }

        // Update enemy siege state
        if (
            oldTus < botState.tusToSiege &&
            state.tus >= botState.tusToSiege &&
            botState.behavior === "Siege/Fight" &&
            botState.parts.find((p) => p.def.type === "Treads" && (p.def as PropulsionItem).siege !== undefined) !==
                undefined
        ) {
            botState.sieged = true;
            updateAccuracy = true;
        }

        // Update enemy running state
        if (botState.behavior === "Run When Hit" && botState.runningMomentum < 3) {
            botState.running = true;
            botState.runningMomentum = Math.min(Math.trunc(state.tus / botState.def.speed), 3);
            updateAccuracy == true;
        }

        // Update accuracy from any end of turn-based states
        if (updateAccuracy) {
            updateWeaponsAccuracy(state);
        }

        end = endConditions.volleyEndCondition(botState);
    }

    // Update kill dictionaries
    if (volleys in state.killVolleys) {
        state.killVolleys[volleys] += 1;
    } else {
        state.killVolleys[volleys] = 1;
    }

    if (state.tus in state.killTus) {
        state.killTus[state.tus] += 1;
    } else {
        state.killTus[state.tus] = 1;
    }

    // Update loot tracker for non-destroyed parts
    for (const part of botState.parts) {
        if (part.integrity > 0) {
            const itemLootState = state.lootState.items[part.initialIndex];

            // Initial drop chance is:
            // ([percent_remaining_integrity / 2] + [salvage_modifier])
            // So undamaged parts have a base 50% drop rate, drop rate for items
            // should never be higher than 50% unless +salvage is applied
            let drop = randomInt(0, 99) < ((part.integrity / part.def.integrity) * 100) / 2 + botState.salvage;
            const corruption = getBotCorruption(botState);

            if (drop && corruption > 0) {
                // Chance to fry part and not drop is: [system_corruption - max_integrity]
                if (randomInt(0, 99) < corruption - part.def.integrity) {
                    itemLootState.totalFried += 1;
                    drop = false;
                }
            }

            // TODO add part melting here with rest of heat support

            if (drop) {
                // Part dropped, increase stats
                itemLootState.totalIntegrity += part.integrity;
                itemLootState.numDrops += 1;

                // Chance for corrupted part on bot death is simply corruption %
                const corrupted = randomInt(0, 99) < corruption;

                if (corrupted) {
                    // Corrupted bot part corruption increase is: 1 to (10*[corruption]/100)
                    // Also has a hard cap of 15
                    itemLootState.totalCorruptionPercent += randomInt(1, Math.min((10 * corruption) / 100, 15));
                }
            }
        }
    }

    state.lootState.numKills += 1;

    // Update matter
    // Start with a random number between the low/high salvage counts
    let matter = randomInt(botState.def.salvageLow, botState.def.salvageHigh);

    // Offset directly by salvage, then cap with 0/max if needed
    matter += botState.salvage;
    matter = Math.max(0, matter);
    matter = Math.min(matter, botState.def.salvageHigh);
    state.lootState.matterDrop += matter;

    return true;
}

// Simulates 1 weapon's damage in a volley
// Returns true if the weapon triggered the simulation end condition
function simulateWeapon(
    state: SimulatorState,
    weapon: SimulatorWeapon,
    endCondition: (state: BotState) => boolean,
): boolean {
    const botState = state.botState;
    const offensiveState = state.offensiveState;

    if (offensiveState.ramming) {
        // Apply ramming damage specially
        const speedPercent = (100 / state.offensiveState.speed) * 100;
        let damageMax =
            ((10 + (weapon.def.mass as number)) / 5 + 1) *
            (speedPercent / 100) *
            Math.max(state.offensiveState.momentum.current, 1);
        damageMax = Math.min(100, damageMax);

        let damage = randomInt(0, damageMax);
        damage = calculateResistDamage(botState, damage, "Impact");

        if (damage > 0) {
            applyDamage(state, botState, damage, 1, undefined, false, false, false, false, true, "Impact", 3);
        }

        return endCondition(botState);
    }

    for (let i = 0; i < weapon.numProjectiles; i++) {
        // Check if the attack was a sneak attack or was a hit.
        // Technically sneak attacks can miss, but not under any realistic
        // scenario I could find. Sneak attacks force a base accuracy of 120%,
        // seemingly overriding other penalties like size or defensive
        // utilities like Reaction Control Systems. The most it seems to
        // take into account is -targeting, the lowest of which
        // (CR-A16's Pointy Stick) only has -20%, making this always a
        // guaranteed hit.
        let hit = (offensiveState.melee && offensiveState.sneakAttack) || randomInt(0, 99) < weapon.accuracy;

        if (hit && weapon.isMissile) {
            // Check for an antimissile intercept
            const part = getDefensiveStatePart(botState.defensiveState.antimissile);

            if (part != undefined) {
                const intercept = part.chance;
                // Check once per tile
                // Note: even though the utilities have a range of 3 there are
                // still 4 attempts at an intercept because the projectile can
                // be intercepted on the same tile as the bot is currently on
                // before the damage is applied.
                // See below, @ is cogmind, i is intercept bot,
                // . is empty space, and x is intercept roll
                // @ . . . i
                // @ x . . i
                // @ . x . i
                // @ . . x i
                // @ . . . x
                const numChanges = Math.min(4, offensiveState.distance);
                for (let i = 0; i < numChanges; i++) {
                    if (randomInt(0, 99) < intercept) {
                        hit = false;
                        break;
                    }
                }
            }
        }

        if (!hit) {
            continue;
        }

        if (weapon.def.type === "Ballistic Cannon" && (weapon.def.salvage ?? 0) < -2) {
            // Apply matter blasted off for kinetic cannons
            state.lootState.matterBlasted += Math.trunc(randomInt(0, -weapon.def.salvage!));
        }

        if (weapon.damageType != undefined) {
            // Calculate base damage, then apply overloads, momentum,
            // and sneak attacks (2)
            let damage = randomInt(weapon.damageMin, weapon.damageMax);

            // Apply overload damage doubling
            if (weapon.overloaded) {
                damage = Math.trunc(damage * 2);
            }

            // Apply momentum bonus
            // ([momentum] * [speed%] / 1200) * 40)
            if (offensiveState.melee && offensiveState.momentum.current > 0) {
                const speedPercent = (100 / offensiveState.speed) * 100;
                let momentumMultiplier = ((offensiveState.momentum.current * speedPercent) / 1200) * 40;

                // Cap at 1-40
                momentumMultiplier = Math.trunc(momentumMultiplier);
                momentumMultiplier = Math.max(1, momentumMultiplier);
                momentumMultiplier = Math.min(40, momentumMultiplier);

                if (weapon.damageType === "Piercing") {
                    // Piercing gets double bonus (not double cap)
                    momentumMultiplier *= 2;
                }

                momentumMultiplier = momentumMultiplier / 100 + 1;

                damage = Math.trunc(momentumMultiplier * damage);
            }

            // Apply double damage sneak attack bonus
            if (offensiveState.melee && offensiveState.sneakAttack) {
                damage *= 2;
            }

            // Add analysis (3)
            if (offensiveState.analysis) {
                damage = Math.trunc(1.1 * damage);
            }

            // Add accelerator (5)
            if (weapon.accelerated) {
                damage = Math.trunc(offensiveState.chargerBonus * damage);
            }

            // Apply resistances (6)
            damage = calculateResistDamage(botState, damage, weapon.damageType);

            // Check for armor integrity analyzer
            const armorAnalyzed = randomInt(0, 99) < offensiveState.armorAnalyzerChance;

            // Check for crit (8)
            const didCritical = randomInt(0, 99) < weapon.criticalChance;

            if (damage > 0) {
                applyDamage(
                    state,
                    botState,
                    damage,
                    1,
                    didCritical ? weapon.criticalType : undefined,
                    false,
                    armorAnalyzed,
                    weapon.disruption,
                    weapon.spectrum,
                    weapon.overflow,
                    weapon.damageType,
                    weapon.salvage,
                );

                // If we've already met the end condition then exit mid-volley
                // Also exit before checking the explosion
                if (endCondition(botState)) {
                    return true;
                }
            }
        }

        if (weapon.explosionType != undefined) {
            // Apply explosion damage (2)
            let damage = randomInt(weapon.explosionMin, weapon.explosionMax);

            // Apply resistances (6)
            damage = calculateResistDamage(botState, damage, weapon.explosionType);

            // Explosive damage is split into multiple chunks depending on the source
            const numChunks = randomInt(weapon.explosionChunksMin, weapon.explosionChunksMax);

            if (damage > 0) {
                applyDamage(
                    state,
                    botState,
                    damage,
                    numChunks,
                    undefined,
                    true,
                    false,
                    weapon.explosionDisruption,
                    0, // Explosion spectrum only applies to engines on ground, ignore it here
                    weapon.overflow,
                    weapon.explosionType,
                    weapon.salvage,
                );

                // If we've already met the end condition then exit mid-volley
                if (endCondition(botState)) {
                    return true;
                }
            }
        }
    }

    return false;
}

// Converts a spectrum value to a numeric value
export function spectrumToNumber(spectrum: Spectrum | undefined): number {
    if (spectrum === undefined) {
        return 0;
    }

    return spectrumMap[spectrum];
}

// Updates all calculated weapon accuracies
function updateWeaponsAccuracy(state: SimulatorState) {
    const offensiveState = state.offensiveState;
    const botState = state.botState;

    let perWeaponBonus = 0;

    // Flying/hovering enemy penalty
    // TODO handle bots becoming overweight
    const botDef = botState.def;
    const movement = botDef.movement;
    if (movement.includes("Hovering") || movement.includes("Flying")) {
        perWeaponBonus -= 10;
    }

    // Subtract always avoid util (reaction control system)
    const avoidPart = getDefensiveStatePart(botState.defensiveState.avoid);
    if (avoidPart != undefined) {
        if (movement.includes("Walking")) {
            perWeaponBonus -= avoidPart.legs;
        } else {
            // TODO - handle hover/flight units are active here and not overweight
            perWeaponBonus -= avoidPart.other;
        }
    }

    if (offensiveState.analysis) {
        perWeaponBonus += 5;
    }

    let siegeBonus = 0;

    if (offensiveState.melee) {
        // Add melee analysis bonuses
        for (let i = 0; i < meleeAnalysisAccuracy.length; i++) {
            perWeaponBonus += offensiveState.meleeAnalysis[i] * meleeAnalysisAccuracy[i];
        }

        // Subtract force booster penalty
        // Earlier code ensures that there are at most 2 boosters enabled in the array
        let numBoostersProcessed = 0;
        for (let i = offensiveState.forceBoosters.length - 1; i >= 0; i--) {
            if (offensiveState.forceBoosters[i] == 2) {
                perWeaponBonus -= 1.5 * forceBoosterAccuracyPenalty[i];
                numBoostersProcessed += 2;
            } else if (offensiveState.forceBoosters[i] == 1) {
                perWeaponBonus -= forceBoosterAccuracyPenalty[i] * numBoostersProcessed == 0 ? 1 : 0.5;
                numBoostersProcessed += 1;
            }
        }
    } else {
        // Add (low) distance bonus
        perWeaponBonus += offensiveState.distance < 6 ? (6 - offensiveState.distance) * 3 : 0;

        // Add siege bonus
        const siege = offensiveState.siegeBonus;
        if (state.tus >= siege.tus) {
            siegeBonus = siege.bonus;
        }
        perWeaponBonus += siegeBonus;

        // Subtract ranged avoid util (phase shifter)
        const rangedAvoidPart = getDefensiveStatePart(botState.defensiveState.rangedAvoid);
        if (rangedAvoidPart != undefined) {
            perWeaponBonus -= rangedAvoidPart.avoid;
        }
    }

    // Update action-based accuracy calcs
    if (state.actionNum === 0) {
        perWeaponBonus += state.offensiveState.action1Accuracy;
    } else if (state.actionNum === 1) {
        perWeaponBonus += state.offensiveState.action2Accuracy;
    } else {
        // After the second action we gain a permanent +10% "no move" bonus
        perWeaponBonus += 10;
    }

    // +20%/30% if attacker in standard/high siege mode (non-melee only)
    if (botState.sieged) {
        // No enemy bots capable of high siege mode currently
        perWeaponBonus += 20;
    }

    if (botState.running) {
        // TODO don't assume that bots don't become overweight
        if (botState.parts.find((p) => p.def.type === "Leg") !== undefined) {
            // -5~15% if attacker running on legs (ranged attacks only)
            // (5% for each level of momentum)
            perWeaponBonus -= 5 * botState.runningMomentum;
        }

        // Apply non-running evasion (<100 speed bonus)
        perWeaponBonus -= botState.runningEvasion;
    }

    for (const weapon of state.weapons) {
        if (weapon.def.waypoints !== undefined) {
            // Guided weapons always have 100% accuracy
            weapon.accuracy = 100;
            return;
        }

        let accuracy = weapon.baseAccuracy + perWeaponBonus;

        if (!offensiveState.melee && siegeBonus === 0) {
            // Subtract recoil if siege mode inactive
            accuracy -= offensiveState.recoil - getRecoil(weapon.def, offensiveState.recoilReduction);
        }

        // Cap accuracy
        const max = offensiveState.melee ? maxMeleeAccuracy : maxRangedAccuracy;
        weapon.accuracy = Math.min(max, Math.max(accuracy, minAccuracy));
    }
}
