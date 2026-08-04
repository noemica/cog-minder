// Battle simulation calculation functions/constants
import { Bot, BotImmunity, BotSize } from "../types/botTypes";
import {
    AblativeArmorIndex,
    AntimissileChance,
    AntimissileChanceIndex,
    CorruptionIgnore,
    CorruptionIgnoreIndex,
    CorruptionMaximum,
    CorruptionMaximumIndex,
    CorruptionPreventIndex,
    CorruptionReduce,
    CorruptionReduceIndex,
    Critical,
    CriticalImmunityIndex,
    CryofiberWeb,
    CryofiberWebIndex,
    DamageReduction,
    DamageReductionIndex,
    DamageResists,
    DamageResistsIndex,
    DamageType,
    EnergyStorage,
    EnergyStorageIndex,
    HardlightGenerator,
    HardlightGeneratorIndex,
    HeatDissipation,
    HeatDissipationIndex,
    HeatTransfer,
    Injector,
    InjectorIndex,
    ItemSlot,
    ItemWithUpkeep,
    MassSupport,
    MassSupportIndex,
    MicrodissipatorIndex,
    PowerAmplifier,
    PowerAmplifierIndex,
    PowerItem,
    PropulsionItem,
    RangedAvoid,
    RangedAvoidIndex,
    ReactionControlSystem,
    ReactionControlSystemIndex,
    SelfReduction,
    SelfReductionIndex,
    Shielding,
    ShieldingIndex,
    Spectrum,
    ThunderLegIndex,
    WeaponItem,
} from "../types/itemTypes";
import {
    BotState,
    ExternalDamageReduction,
    OffensiveState,
    ShieldingPart,
    SimulatorPart,
    SimulatorState,
    SimulatorWeapon,
    SpecialPart,
    SpecialPartsState,
    SpecialPropState,
    SpecialPropulsionState,
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
    "Adv. Remote Shield",
    "Exp. Remote Shield",
    "Remote Force Field",
    "Imp. Remote Force Field",
    "Adv. Remote Force Field",
    "Energy Mantle",
    "Imp. Energy Mantle",
    "AEGIS Remote Shield",
    "QV-33N's Drone Shield",
    "Cep. Energy Mantle",
];

const externalDamageReductionMap: Map<ExternalDamageReduction, number> = new Map([
    ["Remote Shield", 0.75],
    ["Stasis Trap", 0.75],
    ["Phase Wall", 0.5],
    ["Remote Force Field", 0.5],
    ["Stasis Bubble", 0.5],
]);

// Array of force booster accuracy penalties
const forceBoosterAccuracyPenalty = [4, 6, 8, 10];

// Array of force booster maximum damage increases
export const forceBoosterMaxDamageIncrease = [0.2, 0.3, 0.4, 0.5];

// Base accuracies for combat
export const initialRangedAccuracy = 60;
export const initialMeleeAccuracy = 70;

// Array of melee analysis accuracy increases
const meleeAnalysisAccuracy = [5, 6, 8, 12];

// Array of melee analysis minimum damage increases
export const meleeAnalysisMinDamageIncrease = [2, 3, 4, 6];

// Siege mode text to accuracy bonus/TUs to activate map
export const specialModeBonusMap: Map<SpecialPropState, SpecialPropulsionState> = new Map([
    ["No Special", { bonus: 0, recoilNegated: false, tus: 0 }],
    ["In Siege Mode", { bonus: 15, recoilNegated: true, tus: 0 }],
    ["In High Siege Mode", { bonus: 25, recoilNegated: true, tus: 0 }],
    ["In Martial Mode", { bonus: 0, recoilNegated: true, tus: 0 }],
    ["Entering Siege Mode", { bonus: 15, recoilNegated: true, tus: 700 }],
    ["Entering High Siege Mode", { bonus: 25, recoilNegated: true, tus: 700 }],
    ["Entering Martial Mode", { bonus: 0, recoilNegated: true, tus: 300 }],
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

// Heat transfer stats
type HeatTransferValues = {
    heatTransfer: number;
    botMeltdownChance: number;
};

const heatTransferLookup = new Map<HeatTransfer, HeatTransferValues>([
    ["Minimal (5)", { heatTransfer: 5, botMeltdownChance: 5 }],
    ["Low (25)", { heatTransfer: 25, botMeltdownChance: 10 }],
    ["Medium (37)", { heatTransfer: 37, botMeltdownChance: 15 }],
    ["High (50)", { heatTransfer: 50, botMeltdownChance: 20 }],
    ["Massive (80)", { heatTransfer: 80, botMeltdownChance: 30 }],
    ["Deadly (120)", { heatTransfer: 120, botMeltdownChance: 100 }],
]);
const heatTransferTypes: HeatTransfer[] = [
    "Minimal (5)",
    "Low (25)",
    "Medium (37)",
    "High (50)",
    "Massive (80)",
    "Deadly (120)",
];

type DamageChunk = {
    armorAnalyzed: boolean;
    coreBonus: number;
    critical: Critical | undefined;
    damage: number;
    damageType: DamageType;
    disruptChance: number;
    forceCore: boolean;
    guided: boolean;
    heatTransferValues: HeatTransferValues | undefined;
    penetrate: boolean;
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
    botState.armorAnalyzedShieldedCoverage += part.armorAnalyzedShieldedCoverage;
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

type PartDestroyReason = "Integrity" | "CriticalRemove" | "Melt";

// Applies a final calculated damage value to a bot, splitting into chunks if necessary
function applyDamage(
    state: SimulatorState,
    botState: BotState,
    totalDamage: number,
    numChunks: number,
    critical: Critical | undefined,
    isAoe: boolean,
    armorAnalyzed: boolean,
    disruptChance: number,
    heatTransfer: HeatTransfer | undefined,
    overloaded: boolean,
    spectrum: number,
    canOverflow: boolean,
    damageType: DamageType,
    salvage: number,
    penetrationChance: number,
    guided: boolean,
) {
    const chunks: DamageChunk[] = [];

    // Split damage evenly between chunks while discarding the remainder
    const damage = Math.trunc(totalDamage / numChunks);

    const microdissipator = getSpecialStatePart(botState.specialPartsState.microdissipator);
    const finalHeatTransfer = adjustHeatTransferLevel(heatTransfer, overloaded, microdissipator !== undefined);
    const heatTransferValues = finalHeatTransfer === undefined ? undefined : heatTransferLookup.get(finalHeatTransfer);

    if (isAoe) {
        for (let i = 0; i < numChunks; i++) {
            // Aoe damage ignores a lot of specific mechanics
            chunks.push({
                armorAnalyzed: false,
                critical: undefined,
                coreBonus: 0,
                damage: damage,
                damageType: damageType,
                disruptChance: 0,
                forceCore: false,
                guided: guided,
                // Only the last chunk is capable of heat transfer
                heatTransferValues: i == numChunks - 1 ? heatTransferValues : undefined,
                penetrate: false,
                salvage: salvage,
                spectrum: 0,
            });
        }
    } else {
        if (numChunks !== 1) {
            console.log("Shouldn't have more than 1 chunk of non-AOE weapon");
        }

        for (let i = 0; i < numChunks; i++) {
            console;
            chunks.push({
                armorAnalyzed: armorAnalyzed,
                coreBonus: state.offensiveState.coreAnalyzerChance,
                critical: critical,
                damage: damage,
                damageType: damageType,
                disruptChance: disruptChance,
                forceCore: false,
                guided: guided,
                heatTransferValues: i == numChunks - 1 ? heatTransferValues : undefined,
                penetrate: randomInt(0, 99) < penetrationChance,
                salvage,
                spectrum: spectrum,
            });
        }
    }

    // Apply salvage for all chunks simultaneously
    botState.salvage += salvage;

    // Apply damage
    for (const chunk of chunks) {
        if (chunk.damage === 0) {
            // Don't process the chunk if damage is reduced to 0 by shielding
            return;
        }

        applyDamageChunk(
            state,
            chunk.coreBonus,
            chunk.damage,
            chunk.damageType,
            chunk.critical,
            canOverflow,
            false,
            chunk.forceCore,
            chunk.disruptChance,
            chunk.heatTransferValues,
            chunk.spectrum,
            chunk.armorAnalyzed,
            chunk.penetrate,
            chunk.guided,
        );

        // Apply corruption (22)
        if (damageType === "Electromagnetic") {
            // Check for corruption ignore chance
            const corruptionIgnorePart = getSpecialStatePart(botState.specialPartsState.corruptionIgnore);
            const corruptCritical =
                critical === Critical.Corrupt && !botState.immunities.includes(BotImmunity.Criticals);

            if (corruptionIgnorePart === undefined || randomInt(0, 99) >= corruptionIgnorePart.chance) {
                // Corruption critical always applies maximum 1.5 critical modifier
                const corruptionPercent = corruptCritical ? 1.5 : randomInt(50, 150) / 100;
                const corruption = chunk.damage * corruptionPercent;

                applyCorruption(state, corruption);
            }
        }
    }
}

function applyDamageChunk(
    state: SimulatorState,
    coreBonus: number,
    damage: number,
    damageType: DamageType,
    critical: Critical | undefined,
    canOverflow: boolean,
    isOverflow: boolean,
    forceCore: boolean,
    disruptChance: number,
    heatTransferValues: HeatTransferValues | undefined,
    spectrum: number,
    armorAnalyzed: boolean,
    penetrate: boolean,
    guided: boolean,
) {
    // Determine hit part (13)
    const { part, partIndex } = getHitPart(state.botState, coreBonus, damageType, isOverflow, forceCore, armorAnalyzed);
    applyDamageChunkToPart(
        state,
        damage,
        damageType,
        critical,
        disruptChance,
        heatTransferValues,
        spectrum,
        canOverflow,
        isOverflow,
        penetrate,
        guided,
        part,
        partIndex,
    );
}

function applyCorruption(state: SimulatorState, corruption: number) {
    const botState = state.botState;

    // Apply EM Disruption maximum corruption amount
    let corruptionMaximumPart = getSpecialStatePart(botState.specialPartsState.corruptionMaximum);
    if (corruptionMaximumPart !== undefined) {
        corruption = Math.min(corruptionMaximumPart.maximumCorruption, corruption);
    }

    // Check for corruption prevention parts
    let corruptionPreventPart = getSpecialStatePart(botState.specialPartsState.corruptionPrevent);
    while (corruption > 0 && corruptionPreventPart !== undefined) {
        // Assume that corruption prevention parts lose 2 integrity per corruption purged
        const maxPrevention = Math.ceil(corruptionPreventPart.part.integrity / 2);
        if (maxPrevention < corruption) {
            // Part has more than enough integrity to prevent corruption
            corruptionPreventPart.part.integrity -= corruption *= 2;
            corruption = 0;
        } else {
            // Corruption is greater than part can prevent, destroy part
            botState.specialPartsState.corruptionPrevent.shift();
            const index = botState.parts.indexOf(corruptionPreventPart.part);
            destroyPart(state, false, index, corruptionPreventPart.part, 0, "Entropic", "Integrity");
            corruptionPreventPart = getSpecialStatePart(botState.specialPartsState.corruptionPrevent);

            corruption -= maxPrevention;
        }
    }

    botState.corruption += corruption;
}

// Applies heat transfer to the bot, potentially melting the bot or the target part
// Returns true if the part was destroyed via melting
function applyHeatTransfer(
    state: SimulatorState,
    heatTransferValues: HeatTransferValues | undefined,
    originalDamage: number,
    damageForHeatTransfer: number,
    critical: Critical | undefined,
    part: SimulatorPart | undefined,
    partIndex: number,
) {
    if (heatTransferValues === undefined) {
        return false;
    }

    let partDestroyed = false;
    const botState = state.botState;

    // Apply heat transfer (listed as *)
    // Need to do this first so that the bot can be instantly melted before damaging the parts
    let heatTransfer = heatTransferValues.heatTransfer;

    if (originalDamage !== damageForHeatTransfer) {
        // Reduce heat by ratio of damage reduced via force field or similar
        heatTransfer = Math.trunc((heatTransfer * damageForHeatTransfer) / originalDamage);
    }
    if (critical === Critical.Burn && !botState.immunities.includes(BotImmunity.Criticals)) {
        // The tripling effect happens after the reduction
        heatTransfer *= 3;
    }

    if (botState.heat >= 250 && !botState.immunities.includes(BotImmunity.Meltdown)) {
        // Check for part instant meltdown before the heat is transferred to the bot (20)
        // The chance is original heat transfer % chance to melt the hit part
        if (part !== undefined && randomInt(0, 99) < heatTransferValues.heatTransfer) {
            destroyPart(state, false, partIndex, part, 0, "Entropic", "Melt");
            partDestroyed = true;
        }
    }

    botState.heat += heatTransfer;

    if (botState.heat >= 250 && !botState.immunities.includes(BotImmunity.Meltdown)) {
        // Check for bot meltdown after the heat is transferred (this is listed as an * item not numbered)
        // The specific % chance of the bot instantly melting depending on the heat transfer level
        // This value is also increased by 1% per 20 heat above the 250 melting point
        if (randomInt(0, 99) < heatTransferValues.botMeltdownChance) {
            // There is a 50% chance that the bot will instantly melt or melt at the beginning of their next turn
            if (randomInt(0, 1) === 1) {
                botState.coreIntegrity = 0;
            } else {
                botState.meltNextTurn = true;
            }
        }
    }

    return partDestroyed;
}

function applyUnresistedDamageChunkToPart(
    state: SimulatorState,
    damage: number,
    part: SimulatorPart | undefined,
    partIndex: number,
) {
    applyDamageChunkToPart(
        state,
        damage,
        "Phasic",
        undefined,
        0,
        undefined,
        0,
        false,
        false,
        false,
        false,
        part,
        partIndex,
    );
}

function applyDamageChunkToPart(
    state: SimulatorState,
    damage: number,
    damageType: DamageType,
    critical: Critical | undefined,
    disruptChance: number,
    heatTransferValues: HeatTransferValues | undefined,
    spectrum: number,
    canOverflow: boolean,
    isOverflow: boolean,
    penetrate: boolean,
    guided: boolean,
    part: SimulatorPart | undefined,
    partIndex: number,
) {
    const botState = state.botState;
    function doesCriticalDestroyPart(critical: Critical | undefined) {
        if (critical === undefined) {
            return false;
        }

        if (critical === Critical.Destroy || critical === Critical.Smash) {
            return true;
        }

        return false;
    }

    // Save original damage (10)
    const originalDamage = damage;

    // Apply any additional damage reduction (11)
    const damageReductionPart = getSpecialStatePart(botState.specialPartsState.damageReduction);

    let damageReductionEnergyRatio = 0;
    let damageReductionMultiplier = 1;
    let damageReduced = 0;
    if (damageReductionPart !== undefined) {
        damageReductionMultiplier = damageReductionPart.reduction;
        damageReductionEnergyRatio = damageReductionPart.ratio;

        if (damageReductionPart.remote) {
            damageReduced = Math.trunc(damage * damageReductionMultiplier);
        } else {
            damageReduced = damage - Math.trunc(damage * damageReductionMultiplier);
        }

        // If FF-like part, check that we actually have enough energy to
        // do the reduction
        const energyRequired = damageReduced * damageReductionEnergyRatio;

        if (botState.energy > energyRequired) {
            botState.energy -= energyRequired;
        } else {
            // If not enough energy available then don't apply the FF reduction
            damageReduced = 0;
        }
    } else {
        const hardlightPart = getSpecialStatePart(botState.specialPartsState.hardlightGenerator);
        if (hardlightPart !== undefined) {
            damageReduced = hardlightPart.reduction;
        }
    }

    // Save damage for heat transfer (12)
    damage = originalDamage - damageReduced;
    const damageForHeatTransfer = damage;

    // Remove all criticals from totally immune bots
    if (critical !== undefined) {
        if (
            botState.immunities.includes(BotImmunity.Criticals) ||
            getSpecialStatePart(botState.specialPartsState.critImmunity) !== undefined
        ) {
            critical = undefined;
        }
    }

    // Apply meltdown as immediate death unless immune
    if (critical === Critical.Meltdown && !botState.immunities.includes(BotImmunity.Meltdown)) {
        botState.coreIntegrity = 0;

        // Meltdown sets to a minimum of 300 heat
        botState.heat = Math.max(botState.heat, 300);
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
        const power = getSpecialStatePart(botState.specialPartsState.power);

        // Destroy first engine found (if any)
        if (power !== undefined) {
            destroyPart(state, false, botState.parts.indexOf(power.part), power.part, 0, "Entropic", "Integrity");
            applyEngineExplosion(state, power.part);

            if (part === power.part) {
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
        (botState.immunities.includes(BotImmunity.Coring) || getShieldingType(botState, "Core") !== undefined)
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
                destroyPart(state, false, index, shielding.part, 0, "Entropic", "Integrity");
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
        if (
            disruptChance > 0 &&
            !botState.immunities.includes(BotImmunity.Disruption) &&
            randomInt(0, 99) < Math.trunc(disruptChance / 2)
        ) {
            // TODO need to disable everything on the bot when this happens
            botState.coreDisrupted = true;
        }

        // Apply heat transfer (20)
        applyHeatTransfer(state, heatTransferValues, originalDamage, damageForHeatTransfer, critical, part, partIndex);

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

                destroyPart(state, false, partIndex, part, 0, "Phasic", "CriticalRemove");
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
                applyUnresistedDamageChunkToPart(state, damage, part, partIndex);

                // Dismemberment immunity stops the blasting off part
                if (part.integrity > 0 && !botState.immunities.includes(BotImmunity.Dismemberment)) {
                    destroyPart(state, false, partIndex, part, 0, "Phasic", "CriticalRemove");
                }
            } else {
                // Multi-slot items don't get blasted off but still take damage
                applyUnresistedDamageChunkToPart(state, damage, part, partIndex);
            }
        } else if (critical === Critical.Phase) {
            // Apply phasing damage to another random part
            const { part, partIndex } = getRandomNonCorePart(botState, undefined);
            applyUnresistedDamageChunkToPart(state, damage, part, partIndex);
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
    const engineExplosion = spectrum > 0 && part.def.slot === "Power" && randomInt(0, 99) < spectrum;

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
        damage = Math.trunc(damage * ((part.def as PropulsionItem).siege === "High Siege" ? 0.5 : 0.75));
    } else if (part.def.type === "Leg" && (part.def as PropulsionItem).shield && botState.shielded) {
        if (!penetrate && !guided && randomInt(0, 1) === 1) {
            // 50% complete deflection chance for non-penetrating and non-guided projectiles
            // TODO: Try to figure out if there is an easy way to determine which
            // projectiles are not deflected. Some example projectiles that don't deflect
            // are null and potential cannons.
            damage = 0;
        } else {
            // Otherwise, divide damage by 2
            damage = Math.trunc(damage * 0.5);
        }
    }

    // Apply disruption to non-core parts (17)
    if (
        disruptChance > 0 &&
        part.disabledTurns === 0 &&
        !botState.immunities.includes(BotImmunity.Disruption) &&
        randomInt(0, 99) < disruptChance
    ) {
        part.disabledTurns = randomInt(4, 12);
    }

    if (shielding != undefined) {
        // Handle slot shielding reduction
        // Note: shielding may absorb more damage than integrity
        const shieldingDamage = Math.trunc(shielding.reduction * damage);
        shielding.part.integrity -= shieldingDamage;

        if (shielding.part.integrity <= 0) {
            // Remove shielding if it has run out of integrity
            const index = botState.parts.indexOf(shielding.part);
            destroyPart(state, false, index, shielding.part, 0, "Entropic", "Integrity");
        }

        damage = damage - shieldingDamage;
    }

    // Apply heat transfer (20)
    let destroyed = applyHeatTransfer(
        state,
        heatTransferValues,
        originalDamage,
        damageForHeatTransfer,
        critical,
        part,
        partIndex,
    );

    // Destroy the part if not already destroyed from heat transfer
    destroyed = !destroyed && (part.integrity <= damage || doesCriticalDestroyPart(critical) || engineExplosion);

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
            destroyPart(state, false, partIndex, part, 0, "Slashing", "CriticalRemove");
        }
    }

    if (destroyed) {
        // Part destroyed, remove part and update bot state
        // Smash critical destroys the part instantly and deals full overflow damage
        const overflowDamage = critical === Critical.Smash ? damage : damage - part.integrity;
        destroyPart(state, canOverflow, partIndex, part, overflowDamage, damageType, "Integrity");
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
            applyUnresistedDamageChunkToPart(state, damage, part, partIndex);

            // Dismemberment immunity stops the blasting off part
            if (part.integrity > 0 && !botState.immunities.includes(BotImmunity.Dismemberment)) {
                destroyPart(state, false, partIndex, part, 0, "Phasic", "CriticalRemove");
            }
        } else {
            // Multi-slot items don't get blasted off but still take damage
            applyUnresistedDamageChunkToPart(state, damage, part, partIndex);
        }
    } else if (critical === Critical.Phase) {
        // Apply phasing damage to the core
        applyDamageChunkToPart(
            state,
            damage,
            "Phasic",
            undefined,
            0,
            undefined,
            0,
            false,
            false,
            false,
            false,
            undefined,
            -1,
        );
    }

    if (engineExplosion) {
        applyEngineExplosion(state, part);
    }
}

// Cap accuracy at a minimum of 10% and a maximum of 95% for ranged weapons or 100% for melee
function capAccuracy(offensiveState: OffensiveState, accuracy: number) {
    const max = offensiveState.melee ? maxMeleeAccuracy : maxRangedAccuracy;
    return Math.min(max, Math.max(accuracy, minAccuracy));
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
        armorAnalyzedShieldedCoverage: botState.armorAnalyzedShieldedCoverage,
        armorAnalyzedSiegedCoverage: botState.armorAnalyzedSiegedCoverage,
        behavior: botState.behavior,
        coreCoverage: botState.coreCoverage,
        coreDisrupted: botState.coreDisrupted,
        coreIntegrity: botState.coreIntegrity,
        corruption: botState.corruption,
        def: botState.def,
        destroyedParts: [],
        disabledParts: [],
        dormant: botState.dormant,
        dormantTimer: botState.dormantTimer,
        dormantTimerPassed: botState.dormantTimerPassed,
        dormantTimerSet: botState.dormantTimerSet,
        energy: botState.energy,
        externalDamageReduction: botState.externalDamageReduction,
        heat: 0,
        immunities: botState.immunities,
        initialCoreIntegrity: botState.initialCoreIntegrity,
        mass: botState.mass,
        maximumEnergy: botState.maximumEnergy,
        meltNextTurn: botState.meltNextTurn,
        parts: botState.parts.map((p) => {
            return {
                activeHeatGeneration: p.activeHeatGeneration,
                armorAnalyzedShieldedCoverage: p.armorAnalyzedShieldedCoverage,
                armorAnalyzedSiegedCoverage: p.armorAnalyzedSiegedCoverage,
                armorAnalyzedCoverage: p.armorAnalyzedCoverage,
                broken: p.broken,
                coverage: p.coverage,
                def: p.def,
                disabledTurns: p.disabledTurns,
                energyUpkeep: p.energyUpkeep,
                inactiveHeatGeneration: p.inactiveHeatGeneration,
                integrity: p.integrity,
                initialIndex: p.initialIndex,
                protection: p.protection,
                selfDamageReduction: p.selfDamageReduction,
                shieldedCoverage: p.shieldedCoverage,
                siegedCoverage: p.siegedCoverage,
            };
        }),
        partRegen: botState.partRegen,
        coreRegen: botState.coreRegen,
        resistances: resistances,
        running: botState.running,
        runningEvasion: botState.runningEvasion,
        runningMomentum: botState.runningMomentum,
        salvage: botState.salvage,
        shielded: botState.shielded,
        shieldedCoverage: botState.shieldedCoverage,
        sieged: botState.sieged,
        siegedCoverage: botState.siegedCoverage,
        specialPartsState: undefined as any,
        superfortressRegen: botState.superfortressRegen,
        support: botState.support,
        tusToShield: botState.tusToShield,
        tusToSiege: botState.tusToSiege,
        totalCoverage: botState.totalCoverage,
    };
    newState.specialPartsState = getBotSpecialPartState(
        newState.parts,
        newState.externalDamageReduction,
        botState.dormant,
    );

    return newState;
}

function applyEngineExplosion(state: SimulatorState, part: SimulatorPart) {
    if (part.def.slot !== "Power") {
        return;
    }

    const engine = part.def as PowerItem;
    if (engine.explosionDamageMax > 0 && engine.explosionType !== undefined) {
        // Apply engine explosion randomly as either 1 or 2 chunks (16)
        const baseDamage = randomInt(engine.explosionDamageMin, engine.explosionDamageMax);
        const numChunks = randomInt(engine.minChunks ?? 0, engine.maxChunks ?? 0);
        const chunkDamage = Math.trunc(baseDamage / numChunks);
        state.botState.salvage += engine.explosionSalvage;

        for (let i = 0; i < numChunks; i++) {
            applyDamageChunk(
                state,
                0,
                chunkDamage,
                engine.explosionType!,
                undefined,
                true,
                false,
                false,
                engine.explosionDisruption,
                heatTransferLookup.get(engine.explosionHeatTransfer!),
                spectrumToNumber(engine.explosionSpectrum),
                false,
                false,
                false,
            );
        }
    }
}

// Determines the heat transfer level when adjusting for overload and Mak. Microdissipator
function adjustHeatTransferLevel(
    heatTransfer: HeatTransfer | undefined,
    overloaded: boolean,
    microdissipator: boolean,
) {
    if (heatTransfer === undefined) {
        return undefined;
    }

    // Return original if there is no change
    if ((overloaded && microdissipator) || (!overloaded && !microdissipator)) {
        return heatTransfer;
    }

    let index = heatTransferTypes.indexOf(heatTransfer);
    if (index === undefined) {
        return undefined;
    }

    if (overloaded) {
        // Overload increases transfer type by 1
        if (index == heatTransferTypes.length) {
            console.log("Can't overload deadly heat transfer");
            return heatTransfer;
        }

        return heatTransferTypes[index + 1];
    }

    // Microdissipator decreases transfer type by 1
    if (index === 0) {
        // Minimal heat transfer gets reduced to 0
        return undefined;
    }

    return heatTransferTypes[index - 1];
}

// Calculates the resisted damage for a bot given the initial damage value
function calculateResistDamage(botState: BotState, damage: number, damageType: DamageType): number {
    if (damageType in botState.resistances) {
        return Math.trunc(damage * (1 - botState.resistances[damageType]! / 100));
    }

    return damage;
}

// Returns a bot's special parts state based on specific parts, also adds new relevant
// properties to parts
export function getBotSpecialPartState(
    parts: SimulatorPart[],
    externalDamageReduction: ExternalDamageReduction,
    dormant: boolean,
): SpecialPartsState {
    const state: SpecialPartsState = {
        ablativeArmors: [],
        antimissile: [],
        avoid: [],
        coolantInjectors: [],
        corruptionIgnore: [],
        corruptionMaximum: [],
        corruptionPrevent: [],
        corruptionReduce: [],
        critImmunity: [],
        cryofiberWebs: [],
        damageReduction: [],
        hardlightGenerator: [],
        coolingDevices: [],
        microdissipator: [],
        powerAmplifiers: [],
        power: [],
        rangedAvoid: [],
        shieldings: {
            Core: [],
            "N/A": [],
            Power: [],
            Propulsion: [],
            Utility: [],
            Weapon: [],
        },
        thunderLegs: [],
    };

    for (const part of parts) {
        if (part.def.specialProperty !== undefined) {
            switch (part.def.specialProperty!.trait.kind) {
                case AblativeArmorIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, AblativeArmorIndex)) {
                        // Mak. Ablative Armor
                        state.ablativeArmors.push({
                            part: part,
                        });
                    }
                    break;

                case AntimissileChanceIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, AntimissileChanceIndex)) {
                        // Antimissile system-like part
                        state.antimissile.push({
                            chance: (part.def.specialProperty!.trait as AntimissileChance).chance,
                            part: part,
                        });
                    }
                    break;

                case CorruptionIgnoreIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, CorruptionIgnoreIndex)) {
                        // Dynamic Insulation System-like part
                        state.corruptionIgnore.push({
                            chance: (part.def.specialProperty!.trait as CorruptionIgnore).chance,
                            part: part,
                        });
                    }
                    break;

                case CorruptionMaximumIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, CorruptionMaximumIndex)) {
                        // EM Disruption part
                        state.corruptionMaximum.push({
                            part: part,
                            maximumCorruption: (part.def.specialProperty!.trait as CorruptionMaximum).amount,
                        });
                    }
                    break;

                case CorruptionPreventIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, CorruptionPreventIndex)) {
                        // Corruption Screen part
                        state.corruptionPrevent.push({
                            part: part,
                        });
                    }
                    break;

                case CorruptionReduceIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, CorruptionReduceIndex)) {
                        // Corruption Screen part
                        state.corruptionReduce.push({
                            amount: (part.def.specialProperty!.trait as CorruptionReduce).amount,
                            part: part,
                        });
                    }
                    break;

                case CriticalImmunityIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, CriticalImmunityIndex)) {
                        // Critical immunity part
                        state.critImmunity.push({
                            part: part,
                        });
                    }
                    break;

                case CryofiberWebIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, CryofiberWebIndex)) {
                        // Cryofiber web part
                        state.cryofiberWebs.push({
                            part: part,
                            sideEffectNegationPercentage: (part.def.specialProperty!.trait as CryofiberWeb)
                                .sideEffectNegationPercentage,
                            temperatureReduction: (part.def.specialProperty!.trait as CryofiberWeb)
                                .temperatureReduction,
                        });
                    }
                    break;

                case DamageReductionIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, DamageReductionIndex)) {
                        // Force field-like part
                        state.damageReduction.push({
                            ratio: (part.def.specialProperty!.trait as DamageReduction).ratio,
                            reduction: (part.def.specialProperty!.trait as DamageReduction).multiplier,
                            remote: (part.def.specialProperty!.trait as DamageReduction).remote,
                            part: part,
                        });
                    }
                    break;

                case DamageResistsIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, DamageResistsIndex)) {
                        // Damage type resist part
                        part.resistances = (part.def.specialProperty!.trait as DamageResists).resists;
                    }
                    break;

                case HardlightGeneratorIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, HardlightGeneratorIndex)) {
                        // Force field-like part
                        state.hardlightGenerator.push({
                            reduction: (part.def.specialProperty!.trait as HardlightGenerator).amount,
                            part: part,
                        });
                    }
                    break;

                case HeatDissipationIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, HeatDissipationIndex)) {
                        // Cooling device (heat sink/cooling system) part
                        state.coolingDevices.push({
                            part: part,
                            amount: (part.def.specialProperty!.trait as HeatDissipation).dissipation,
                            isHeatSink: (part.def.specialProperty!.trait as HeatDissipation).heatSink,
                        });
                    }
                    break;

                case InjectorIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, InjectorIndex)) {
                        // Coolant injector part
                        state.coolantInjectors.push({
                            part: part,
                            amount: (part.def.specialProperty!.trait as Injector).dissipation,
                        });
                    }
                    break;

                case MicrodissipatorIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, MicrodissipatorIndex)) {
                        // Microdissipator part
                        state.microdissipator.push({
                            part: part,
                        });
                    }
                    break;

                case PowerAmplifierIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, PowerAmplifierIndex)) {
                        // Power amplifier part
                        state.powerAmplifiers.push({
                            multiplier: (part.def.specialProperty!.trait as PowerAmplifier).percent,
                            part: part,
                        });
                    }
                    break;

                case RangedAvoidIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, RangedAvoidIndex)) {
                        // Phase shifter-like part
                        state.rangedAvoid.push({
                            avoid: (part.def.specialProperty!.trait as RangedAvoid).avoid,
                            part: part,
                        });
                    }
                    break;

                case ReactionControlSystemIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, ReactionControlSystemIndex)) {
                        // Reaction Control System-like part
                        // Leg/hover/flight determination done at accuracy update time
                        state.avoid.push({
                            chance: (part.def.specialProperty!.trait as ReactionControlSystem).chance,
                            part: part,
                        });
                    }
                    break;

                case SelfReductionIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, SelfReductionIndex)) {
                        // Powered armor-like part
                        part.selfDamageReduction = (part.def.specialProperty!.trait as SelfReduction).shielding;
                    }
                    break;

                case ShieldingIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, ShieldingIndex)) {
                        // Shielding-like part
                        const trait = part.def.specialProperty!.trait as Shielding;
                        state.shieldings[trait.slot].push({ reduction: trait.shielding, part: part });
                    }
                    break;

                case ThunderLegIndex:
                    if (hasActiveSpecialProperty(part.def, !dormant, ThunderLegIndex)) {
                        // Thunder leg part
                        state.thunderLegs.push({ part: part });
                    }
                    break;
            }
        }

        if (part.def.slot === "Power") {
            state.power.push({ part: part });
        }
    }

    // Sort damage reduction (11)
    if (externalDamageReductionMap.has(externalDamageReduction)) {
        const reduction = externalDamageReductionMap.get(externalDamageReduction) || 1.0;
        const remote = externalDamageReduction.includes("Remote");

        if (state.damageReduction.length === 0) {
            // If no other damage reduction no need to sort
            state.damageReduction.push({
                ratio: 0,
                reduction: reduction,
                remote: remote,
                part: {
                    activeHeatGeneration: 0,
                    armorAnalyzedShieldedCoverage: 0,
                    armorAnalyzedSiegedCoverage: 0,
                    armorAnalyzedCoverage: 0,
                    broken: false,
                    coverage: 0,
                    def: undefined as any,
                    disabledTurns: 0,
                    energyUpkeep: 0,
                    inactiveHeatGeneration: 0,
                    integrity: 1,
                    initialIndex: 0,
                    protection: false,
                    selfDamageReduction: 0,
                    shieldedCoverage: 0,
                    siegedCoverage: 0,
                },
            });
        } else {
            const existingIndex = damageReductionSortOrder.indexOf(state.damageReduction[0].part.def.name);
            const newIndex = damageReductionSortOrder.indexOf(externalDamageReduction);

            // Use sort order to decide to insert before or after
            if (newIndex < existingIndex) {
                state.damageReduction.unshift({
                    ratio: 0,
                    reduction: reduction,
                    remote: remote,
                    part: {
                        activeHeatGeneration: 0,
                        armorAnalyzedCoverage: 0,
                        armorAnalyzedShieldedCoverage: 0,
                        armorAnalyzedSiegedCoverage: 0,
                        broken: false,
                        coverage: 0,
                        def: undefined as any,
                        disabledTurns: 0,
                        energyUpkeep: 0,
                        inactiveHeatGeneration: 0,
                        integrity: 1,
                        initialIndex: 0,
                        protection: false,
                        selfDamageReduction: 0,
                        shieldedCoverage: 0,
                        siegedCoverage: 0,
                    },
                });
            } else {
                state.damageReduction.push({
                    ratio: 0,
                    remote: remote,
                    reduction: reduction,
                    part: {
                        activeHeatGeneration: 0,
                        armorAnalyzedCoverage: 0,
                        armorAnalyzedShieldedCoverage: 0,
                        armorAnalyzedSiegedCoverage: 0,
                        broken: false,
                        coverage: 0,
                        def: undefined as any,
                        disabledTurns: 0,
                        energyUpkeep: 0,
                        inactiveHeatGeneration: 0,
                        initialIndex: 0,
                        integrity: 1,
                        protection: false,
                        selfDamageReduction: 0,
                        shieldedCoverage: 0,
                        siegedCoverage: 0,
                    },
                });
            }
        }
    }

    // All other parts should technically be sorted as well.
    // However, in game no bot ever has duplicate mixed-level defenses,
    // some have multiples of the same level like 2 base weapon shieldings on
    // Warbot, but that doesn't require sorting anyway.

    return state;
}

function destroyPart(
    state: SimulatorState,
    canOverflow: boolean,
    partIndex: number,
    part: SimulatorPart,
    overflowDamage: number,
    damageType: DamageType,
    destroyReason: PartDestroyReason,
) {
    const botState = state.botState;
    botState.parts.splice(partIndex, 1);

    // Update coverage
    botState.armorAnalyzedCoverage -= part.armorAnalyzedCoverage;
    botState.armorAnalyzedShieldedCoverage -= part.armorAnalyzedShieldedCoverage;
    botState.armorAnalyzedSiegedCoverage -= part.armorAnalyzedSiegedCoverage;
    botState.siegedCoverage -= part.siegedCoverage;
    botState.shieldedCoverage -= part.shieldedCoverage;
    botState.totalCoverage -= part.coverage;

    removePartBonusesFromState(state, part);

    if (overflowDamage > 0 && !part.protection && canOverflow) {
        // Handle overflow damage if excess damage was dealt
        // against a non-protection part (18)
        applyDamageChunk(
            state,
            0,
            overflowDamage,
            damageType,
            undefined,
            true,
            true,
            false,
            0,
            undefined,
            0,
            false,
            false,
            false,
        );
    }

    if (damageType === "Impact") {
        // Apply 50-150% random corruption to the bot after
        // destroying a part (affected by EM resistance) (22)
        let corruption = randomInt(50, 150);
        corruption = calculateResistDamage(botState, corruption, "Electromagnetic");

        applyCorruption(state, corruption);
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
        state.lootState.items[part.initialIndex].integrityDrops.push(part.integrity);
    } else if (destroyReason === "Melt" && part.integrity > 0) {
        state.lootState.items[part.initialIndex].totalMeltedHit += 1;
    }

    botState.destroyedParts.push(part);

    part.integrity = 0;
}

// Tries to get a bot special state part from an array
// Parts will be removed from the array if their integrity has dropped below 0
function getSpecialStatePart<T extends SpecialPart>(array: T[]) {
    let part: T | undefined = undefined;

    let i = 0;
    while (i < array.length) {
        if (array[i].part.integrity <= 0 || array[i].part.broken) {
            // Found destroyed or broken part, remove from array
            array.shift();
        } else if (array[0].part.disabledTurns === 0) {
            // Found a good part, use it here
            part = array[0];
            break;
        } else {
            i++;
        }
    }

    return part;
}

// Tries to get all bot special state parts from an array
// Parts will be removed from the array if their integrity has dropped below 0
function getSpecialStateParts<T extends SpecialPart>(array: T[]) {
    let needsCopy = false;
    // Disabled parts will require an array copy to only return those parts
    // that are currently active. If none are required we can return just the
    // array by itself
    for (let i = 0; i < array.length; i++) {
        if (array[i].part.disabledTurns > 0) {
            needsCopy = true;
            break;
        }
    }

    if (needsCopy) {
        const returnArray: T[] = [];
        for (let i = array.length - 1; i >= 0; i--) {
            // Check for and remove all destroyed parts
            if (array[i].part.integrity <= 0 || array[i].part.broken) {
                array.splice(i);
            } else if (array[i].part.disabledTurns === 0) {
                // Add to new list if part is not currently disabled
                returnArray.unshift(array[i]);
            }
        }

        return returnArray;
    } else {
        // Since copy is not needed, just remove the destroyed/broken parts
        // and return the original array
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i].part.integrity <= 0 || array[i].part.broken) {
                array.splice(i);
            }
        }

        return array;
    }
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
            } else if (botState.shielded) {
                totalCoverage = botState.armorAnalyzedShieldedCoverage;
            } else {
                totalCoverage = botState.armorAnalyzedCoverage;
            }
        } else {
            if (botState.sieged) {
                totalCoverage = botState.siegedCoverage;
            } else if (botState.shielded) {
                totalCoverage = botState.shieldedCoverage;
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
                } else if (botState.shielded) {
                    coverageHit -= botState.parts[partIndex].armorAnalyzedShieldedCoverage;
                } else {
                    coverageHit -= botState.parts[partIndex].armorAnalyzedCoverage;
                }
            } else {
                if (botState.sieged) {
                    coverageHit -= botState.parts[partIndex].siegedCoverage;
                } else if (botState.shielded) {
                    coverageHit -= botState.parts[partIndex].shieldedCoverage;
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

// Gets a random (i.e. coverage-ignoring) non-core part, used for some crit and heat effects
function getRandomNonCorePart(botState: BotState, ignoreIndex: number | undefined) {
    // Randomly target all parts, possibly excluding another specific index
    let partHit = randomInt(0, botState.parts.length - 1 - (ignoreIndex === undefined ? 0 : 1));

    if (ignoreIndex !== undefined && ignoreIndex > 0 && partHit >= ignoreIndex) {
        // Adjust the index based on the ignored part
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

// Gets a random (i.e. coverage-ignoring) non-core part, used for some crit and heat effects
function getRandomUniqueNonCoreParts(botState: BotState, numParts: number) {
    const randomParts: SimulatorPart[] = [];

    // Make clone of parts array for easier pruning
    const parts = [...botState.parts];

    // Keep picking random parts until we have found all requested or we run out
    for (let i = 0; i < numParts && parts.length >= 1; i++) {
        let partIndex = randomInt(0, parts.length - 1);
        const part = parts[partIndex];

        randomParts.push(part);
        parts.splice(i, 1);
    }

    return randomParts;
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
    return getSpecialStatePart(botState.specialPartsState.shieldings[slot]);
}

// Gets the bot's corruption when accounting for corruption reduction utilities
function getBotCorruption(botState: BotState) {
    let corruption = botState.corruption;

    for (const p of botState.specialPartsState.corruptionReduce) {
        if (p.part.integrity >= 0) {
            corruption -= p.amount;
        }
    }

    return corruption;
}

function removePartBonusesFromState(state: SimulatorState, part: SimulatorPart) {
    const botState = state.botState;

    // Update mass/support
    // TODO do we ever need to update the time/move here?
    botState.mass -= part.def.mass || 0;
    if (part.def.type === botState.def.propulsionType) {
        botState.support -= part.def.mass || 0;
    } else if (hasActiveSpecialProperty(part.def, true, MassSupportIndex)) {
        botState.support -= (part.def.specialProperty!.trait as MassSupport).support;
    }

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

    updateWeaponsAccuracy(state);

    // Subtract energy stats
    if (part.def.slot === "Power") {
        botState.maximumEnergy -= (part.def as PowerItem).energyStorage || 0;
        botState.energy = Math.min(botState.energy, botState.maximumEnergy);
    }

    if (hasActiveSpecialProperty(part.def, true, EnergyStorageIndex)) {
        botState.maximumEnergy -= (part.def.specialProperty!.trait as EnergyStorage).storage;
        botState.energy = Math.min(botState.energy, botState.maximumEnergy);
    }
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
            for (let i = 0; i < state.weapons.length; i++) {
                end = simulateWeapon(state, state.weapons[i], endConditions.projectileEndCondition);

                if (end) {
                    break;
                }

                if (i == 0) {
                    // Update accuracy after the initial weapon on relevant action #s
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

        if (botState.meltNextTurn) {
            // Don't count the whole volley time, treat as just 100 tus for the
            // bot to take its next turn (assuming bot is waiting)
            state.tus += 100;
            botState.coreIntegrity = 0;
            end = true;
            break;
        }

        updateTimeBasedStateChanges(state, volleyTime);

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

            if (drop && botState.heat > 0) {
                // Chance to melt is ([heat - max_integrity] / 4)
                if (randomInt(0, 99) < (botState.heat - part.def.integrity) / 4) {
                    itemLootState.totalMeltedDrop += 1;
                    drop = false;
                }
            }

            if (drop) {
                // Part dropped, increase stats
                itemLootState.totalIntegrity += part.integrity;
                itemLootState.integrityDrops.push(part.integrity);
                itemLootState.numDrops += 1;

                // Chance for corrupted part on bot death is simply corruption %
                const corrupted = randomInt(0, 99) < corruption;

                if (corrupted) {
                    // Corrupted bot part corruption increase is: 1 to (10*[corruption]/100)
                    // Also has a hard cap of 15
                    itemLootState.totalCorruptionPercent += randomInt(1, Math.min((10 * corruption) / 100, 15));
                }

                if (part.broken) {
                    itemLootState.totalBroken += 1;
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

type BotHeatEffect = {
    minHeat: number;
    effect: (state: SimulatorState) => void;
};
const botOverheatEffects: BotHeatEffect[] = [
    {
        minHeat: 150,
        effect: (state) => {
            // Spike heat
            state.botState.heat += randomInt(60, 119);
        },
    },
    {
        minHeat: 150,
        effect: (state) => {
            // Disable random part
            const { part } = getRandomNonCorePart(state.botState, undefined);
            if (part !== undefined) {
                part.disabledTurns += randomInt(8, 15);
            }
        },
    },
    {
        minHeat: 150,
        effect: (state) => {
            // Short circuit, break random already unbroken part that can be broken
            const { part } = getRandomNonCorePart(state.botState, undefined);
            if (
                part !== undefined &&
                !part.broken &&
                !(part.def.slot === "Utility" && !(part.def as ItemWithUpkeep).energyUpkeep === undefined)
            ) {
                part.broken = true;
                removePartBonusesFromState(state, part);
            }
        },
    },
    {
        minHeat: 150,
        effect: (state) => {
            // Damage random part from 50-100% of current integrity
            const { part, partIndex } = getRandomNonCorePart(state.botState, undefined);
            if (part !== undefined) {
                part.integrity -= Math.trunc(randomInt(50, 100) * part.integrity);
                if (part.integrity <= 0) {
                    destroyPart(state, false, partIndex, part, 0, "Entropic", "Integrity");
                }
            }
        },
    },
    {
        minHeat: 200,
        effect: (state) => {
            // Damage 1-4 parts from 60-90% of current integrity
            const numParts = randomInt(1, 4);
            const parts = getRandomUniqueNonCoreParts(state.botState, numParts);
            for (const part of parts) {
                part.integrity -= Math.trunc(randomInt(50, 100) * part.integrity);
                if (part.integrity <= 0) {
                    destroyPart(state, false, state.botState.parts.indexOf(part), part, 0, "Entropic", "Integrity");
                }
            }
        },
    },
    {
        minHeat: 250,
        effect: (state) => {
            // Damages core 20-40%
            state.botState.coreIntegrity -= Math.trunc(randomInt(20, 40) * state.botState.initialCoreIntegrity);
        },
    },
];
// Updates bot heat changes per turn
function simulateBotHeatUpdates(state: SimulatorState) {
    const botState = state.botState;

    // Handle heat changes
    // As a minor optimization, ignore heat if Cogmind didn't transfer any heat
    // While some bots do heat up when shooting, currently all bots are expected
    // to not be actively firing by the simulator. TODO add this later
    if (botState.heat <= 0) {
        return;
    }

    // Apply bot heat generation first
    for (let i = 0; i < botState.parts.length; i++) {
        const part = botState.parts[i];

        if (part.broken || part.disabledTurns > 0) {
            botState.heat += part.inactiveHeatGeneration;
        } else {
            botState.heat += part.activeHeatGeneration;
        }
    }

    const cryofiberWeb = getSpecialStatePart(botState.specialPartsState.cryofiberWebs);
    const coolantInjectors = getSpecialStateParts(botState.specialPartsState.coolantInjectors);
    const coolingDevices = getSpecialStateParts(botState.specialPartsState.coolingDevices);
    const ablativeArmors = getSpecialStateParts(botState.specialPartsState.ablativeArmors);
    const microdissipator = getSpecialStatePart(botState.specialPartsState.microdissipator);

    // Apply base heat dissipation first
    botState.heat -= botState.def.innateHeatDissipation;

    // Apply cooling devices first
    for (const coolingDevice of coolingDevices || []) {
        botState.heat -= coolingDevice.amount;

        // If heat sink + cryofiber web, double the dissipation
        if (cryofiberWeb !== undefined && coolingDevice.isHeatSink) {
            botState.heat -= coolingDevice.amount;
        }
    }

    // Technically should randomize the injector order as the chosen
    // injector is random, but this matters very little for simulator purposes
    for (const coolantInjector of coolantInjectors || []) {
        // Apply coolant injectors next if still over heat threshold
        // Note: The threshold for bots is 150 heat rather than 200 like
        // it is for Cogmind. The description doesn't mention this fact
        // though.
        if (botState.heat >= 150) {
            // All injectors lose 2 heat per application
            coolantInjector.part.integrity -= 2;
            botState.heat -= coolantInjector.amount;
        }
    }

    // Technically should randomize the ablative order as the chosen
    // armor is random, but there are no bots with more than one of these
    for (const ablativeArmor of ablativeArmors || []) {
        if (botState.heat > 150) {
            // Note: This subtracts 0 integrity for dissipating 1-19 heat
            ablativeArmor.part.integrity -= Math.trunc((botState.heat - 15) / 20);
        }
    }

    if (botState.heat > 150 && microdissipator !== undefined) {
        // Deal 1 point of damage per every 10 heat dissipated rounded down
        // Unlike ablative, even 1 dissipation results in 1 point of damage
        // However, 2 points aren't subtracted until 20 heat is dissipated
        let damageToApply = Math.min(Math.trunc((botState.heat - 150) / 10), 1);

        // Divide damage into 5 (or fewer) damage chunks
        while (damageToApply > 0) {
            const damageChunk = Math.min(5, damageToApply);
            damageToApply -= damageChunk;

            const { part, partIndex } = getRandomNonCorePart(botState, botState.parts.indexOf(microdissipator.part));
            applyUnresistedDamageChunkToPart(state, damageToApply, part, partIndex);
        }
    }

    // Apply heat effects per turn
    // They have an increasing chance to apply based on heat, capping at 50% at 300
    let effectChance = 0;
    if (botState.heat >= 300) {
        effectChance = 50;
    } else if (botState.heat >= 240) {
        effectChance = 25;
    } else if (botState.heat >= 180) {
        effectChance = 12;
    } else if (botState.heat >= 120) {
        effectChance = 6;
    }

    // Hardcode minimum effect heat value here for slightly simpler code
    if (
        botState.heat >= 150 &&
        randomInt(0, 99) < effectChance &&
        !botState.immunities.includes(BotImmunity.Meltdown)
    ) {
        // Apply random applicable effect
        // TODO if a heat effect is rolled that is N/A do we reroll or just give up?
        const effects = botOverheatEffects.filter((e) => botState.heat >= e.minHeat);
        const effect = effects[randomInt(0, effects.length - 1)];
        effect.effect(state);
    }

    const minBotHeat = cryofiberWeb ? cryofiberWeb.temperatureReduction : 0;
    botState.heat = Math.max(botState.heat, minBotHeat);
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
            applyDamage(
                state,
                botState,
                damage,
                1,
                undefined,
                false,
                false,
                0,
                undefined,
                false,
                0,
                true,
                "Impact",
                3,
                0,
                weapon.def.waypoints !== undefined,
            );
        }

        return endCondition(botState);
    }

    if (!offensiveState.melee && offensiveState.corruption > 0) {
        // Jamming/failing to cycle/failing to launch is a corruption-based
        // effect for non-melee weapons. Odds to fail to attack increases by
        // .2% for every 1% of corruption.
        if (randomInt(0, 999) < offensiveState.corruption * 2) {
            return false;
        }
    }

    for (let i = 0; i < weapon.numProjectiles; i++) {
        let accuracy = weapon.accuracy;
        if (botState.heat > 0) {
            // Apply heat bonus, +3% of heat
            // This is done here instead of updateWeaponsAccuracy as an optimization
            // It is expensive to do the full set of accuracy updates each time a
            // projectile transfers heat
            accuracy = capAccuracy(offensiveState, Math.trunc(botState.heat * 0.03) + accuracy);
        }

        // Check if the attack was a sneak attack or was a hit.
        // Technically sneak attacks can miss, but not under any realistic
        // scenario I could find. Sneak attacks force a base accuracy of 120%,
        // seemingly overriding other penalties like size or defensive
        // utilities like Reaction Control Systems. The most it seems to
        // take into account is -targeting, the lowest of which
        // (CR-A16's Pointy Stick) only has -20%, making this always a
        // guaranteed hit.
        let hit = (offensiveState.melee && offensiveState.sneakAttack) || randomInt(0, 99) < accuracy;

        if (hit && weapon.isMissile) {
            // Check for an antimissile intercept
            const part = getSpecialStatePart(botState.specialPartsState.antimissile);

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
            if (offensiveState.melee && (offensiveState.sneakAttack || botState.dormant)) {
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

            let penetrationChance = 0;
            if (weapon.def.penetrationChances !== undefined && weapon.def.penetrationChances.length > 0) {
                penetrationChance = Math.max(Math.min(weapon.def.penetrationChances[0], 100), 0);
            }

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
                    weapon.heatTransfer,
                    weapon.overloaded,
                    weapon.spectrum,
                    weapon.overflow,
                    weapon.damageType,
                    weapon.salvage,
                    penetrationChance,
                    weapon.guided,
                );

                if (
                    weapon.def.name === "Core Stripper" &&
                    botState.coreIntegrity > 0 &&
                    !botState.immunities.includes(BotImmunity.Dismemberment) &&
                    randomInt(0, 99) < 33
                ) {
                    // If core stripper procs (33% chance) it will drop all
                    // parts but they will be damaged between 25-75%
                    for (let i = 0; i < botState.parts.length; i++) {
                        const part = botState.parts[0];
                        part.integrity *= randomInt(25, 75) / 100;

                        destroyPart(state, false, 0, part, 0, "Entropic", "CriticalRemove");

                        botState.coreIntegrity = 0;
                    }
                }

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
                    weapon.explosionHeatTransfer,
                    false, // Explosions don't get overloaded
                    0, // Explosion spectrum only applies to engines on ground, ignore it here
                    true,
                    weapon.explosionType,
                    weapon.salvage,
                    0,
                    weapon.guided,
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

// Updates misc bot state changes over time from sim settings
function updateTimeBasedStateChanges(state: SimulatorState, volleyTime: number) {
    const botState = state.botState;
    const offensiveState = state.offensiveState;
    let updateAccuracy = false;

    // Update TUs and time based changes
    const oldTus = state.tus;
    state.tus += volleyTime;

    const lastCompletedTurns = Math.trunc(oldTus / 100);
    const newCompletedTurns = Math.trunc(state.tus / 100);
    const completedTurns = newCompletedTurns - lastCompletedTurns;
    const coreRegenIntegrity = botState.coreRegen * completedTurns;

    const powerMultiplier = getSpecialStateParts(botState.specialPartsState.powerAmplifiers)
        .map((amplifier) => amplifier.multiplier)
        .reduce(sum, 1);

    for (let i = 0; i < completedTurns; i++) {
        // Handle things that need to be checked once per turn

        // Add energy
        botState.energy += botState.def.innateEnergyGeneration;

        for (const power of getSpecialStateParts(botState.specialPartsState.power)) {
            botState.energy += Math.trunc(powerMultiplier * ((power.part.def as PowerItem).energyGeneration || 0));
        }

        // Subtract energy upkeep
        for (let j = 0; j < botState.parts.length; j++) {
            const part = botState.parts[j];
            if (!part.broken && part.disabledTurns === 0) {
                botState.energy -= part.energyUpkeep;
            }
        }

        // Cap between 0 and maximum energy
        botState.energy = Math.max(0, Math.min(botState.energy, botState.maximumEnergy));

        simulateBotHeatUpdates(state);

        // Decrement disabled turns check
        for (let i = botState.disabledParts.length - 1; i >= 0; i--) {
            const part = botState.disabledParts[i];
            if (part.disabledTurns > 0) {
                part.disabledTurns -= 1;
            }

            // Remove if no longer present
            if (part.disabledTurns === 0) {
                botState.disabledParts.splice(i, 1);
            }
        }
    }

    // Update accuracy when crossing special prop mode activation
    if (
        !offensiveState.melee &&
        oldTus < offensiveState.specialBonus.tus &&
        state.tus >= offensiveState.specialBonus.tus
    ) {
        updateAccuracy = true;
    }

    // Update enemy shield state
    if (
        oldTus < botState.tusToShield &&
        state.tus >= botState.tusToShield &&
        botState.behavior === "Shield/Fight" &&
        botState.parts.find((p) => p.def.type === "Leg" && (p.def as PropulsionItem).shield) !== undefined
    ) {
        botState.shielded = true;
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

    // Apply core regen
    botState.coreIntegrity = Math.min(botState.initialCoreIntegrity, botState.coreIntegrity + coreRegenIntegrity);

    if (botState.partRegen > 0) {
        // Apply part regen to existing parts
        const partRegenIntegrity = botState.partRegen * completedTurns;
        for (const part of botState.parts) {
            part.integrity = Math.min(part.integrity + partRegenIntegrity, part.def.integrity);
        }

        // Apply part regen to destroyed parts
        // Every 10 turns, one part is recreated
        const numRegenTurns = [...Array(completedTurns)]
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

    // Check for bot dormancy changes
    if (newCompletedTurns >= botState.dormantTimer && !botState.dormantTimerPassed) {
        // If timer has elapsed, recalculate the defensive state
        botState.dormant = false;
        botState.specialPartsState = getBotSpecialPartState(
            botState.parts,
            botState.externalDamageReduction,
            botState.dormant,
        );
        botState.dormantTimerPassed = true;
    } else if (
        !botState.dormantTimerSet &&
        botState.behavior === "Unpowered 10 Turns" &&
        botState.coreIntegrity != botState.initialCoreIntegrity
    ) {
        botState.dormantTimer = newCompletedTurns + 10;
        botState.dormantTimerSet = true;
    }

    // Update accuracy from any end of turn-based states
    if (updateAccuracy) {
        updateWeaponsAccuracy(state);
    }
}

// Updates all calculated weapon accuracies
function updateWeaponsAccuracy(state: SimulatorState) {
    const offensiveState = state.offensiveState;
    const botState = state.botState;
    const isUnderweight = botState.support > 0 && botState.mass <= botState.support;

    let perWeaponBonus = 0;

    // Flying/hovering enemy penalty if not overweight
    if (
        (botState.def.propulsionType === "Hover Unit" || botState.def.propulsionType === "Flight Unit") &&
        isUnderweight
    ) {
        if (botState.def.propulsionType === "Hover Unit") {
            perWeaponBonus -= 5;
        } else {
            perWeaponBonus -= 10;
        }
    }

    // Subtract always avoid util (reaction control system) unless overweight
    // or out of prop
    const avoidPart = getSpecialStatePart(botState.specialPartsState.avoid);
    if (avoidPart != undefined && isUnderweight) {
        perWeaponBonus -= avoidPart.chance;
    }

    if (offensiveState.analysis) {
        perWeaponBonus += 5;
    }

    let recoilNegated = false;

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

        // Add special prop mode bonus
        const specialBonus = offensiveState.specialBonus;
        if (state.tus >= specialBonus.tus) {
            perWeaponBonus += specialBonus.bonus;
            recoilNegated = specialBonus.recoilNegated;
        }

        // Subtract ranged avoid util (phase shifter)
        const rangedAvoidPart = getSpecialStatePart(botState.specialPartsState.rangedAvoid);
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

    // +10% if defender is immobile
    if (botState.sieged) {
        perWeaponBonus += 10;
    }

    if (botState.running) {
        const legs = botState.parts.filter((p) => p.def.type === "Leg");

        if (legs.length > 0 && isUnderweight) {
            // -5~15% if attacker running on legs (ranged attacks only)
            // (5% for each level of momentum)
            perWeaponBonus -= 5 * botState.runningMomentum;

            if (getSpecialStatePart(botState.specialPartsState.thunderLegs) !== undefined) {
                // If thunder leg is active then double the momentum bonus
                perWeaponBonus -= 5 * botState.runningMomentum;
            }
        }

        // Apply non-running evasion (<100 speed bonus)
        perWeaponBonus -= botState.runningEvasion;
    }

    for (const weapon of state.weapons) {
        if (weapon.guided) {
            // Guided weapons always have 100% accuracy
            weapon.accuracy = 100;
            return;
        }

        let accuracy = weapon.baseAccuracy + perWeaponBonus;

        if (!offensiveState.melee && !recoilNegated) {
            // Subtract recoil if siege mode inactive
            accuracy -= offensiveState.recoil - getRecoil(weapon.def, offensiveState.recoilReduction);
        }

        weapon.accuracy = capAccuracy(offensiveState, accuracy);
    }
}
