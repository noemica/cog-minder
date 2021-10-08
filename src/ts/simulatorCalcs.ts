// Battle simulation calculation functions/constants
import { Bot, BotImmunity } from "./botTypes";
import { randomInt } from "./common";
import { Critical, DamageType, ItemSlot, ItemType, WeaponItem } from "./itemTypes";
import {
    BotState,
    DefensiveState,
    SimulatorPart,
    SimulatorState,
    SimulatorWeapon,
    SpecialPart,
} from "./simulatorTypes";

const minAccuracy = 10;
const maxRangedAccuracy = 95;
const maxMeleeAccuracy = 100;

export const maxVolleys = 100000;

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

const externalDamageReductionMap = {
    "Remote Shield": 0.75,
    "Stasis Trap": 0.75,
    "Phase Wall": 0.5,
    "Remote Force Field": 0.5,
    "Stasis Bubble": 0.5,
};

// Array of melee analysis accuracy increases
const meleeAnalysisAccuracy = [5, 6, 8, 12];

const categoryAntimissile = 0;
const categoryAvoid = 1;
const categoryCorruptionIgnore = 2;
const categoryDamageReduction = 3;
const categoryResist = 4;
const categoryRangedAvoid = 5;
const categorySelfDamageReduction = 6;
const categoryShielding = 7;
const specialItems = {
    // Antimissile, chance to shoot down launcher projectiles per tile
    "Point Defense System": { category: categoryAntimissile, chance: 8 },
    "Point Defense Array": { category: categoryAntimissile, chance: 16 },
    "Antimissile System": { category: categoryAntimissile, chance: 24 },

    // Avoid, - all weapon accuracy
    "Maneuvering Thrusters": { category: categoryAvoid, legs: 3, other: 6 },
    "Imp. Maneuvering Thrusters": { category: categoryAvoid, legs: 5, other: 10 },
    "Reaction Control System": { category: categoryAvoid, legs: 6, other: 12 },
    "Adv. Reaction Control System": { category: categoryAvoid, legs: 7, other: 14 },

    // Corruption ignore, % of ignoring corruption addition
    "Dynamic Insulation System": { category: categoryCorruptionIgnore, ignore: 50 },
    "Imp. Dynamic Insulation System": { category: categoryCorruptionIgnore, ignore: 67 },
    "Adv. Dynamic Insulation System": { category: categoryCorruptionIgnore, ignore: 75 },

    // Damage reduction, (val * damage = reduced damage)
    "Adv. Shield Generator": { category: categoryDamageReduction, reduction: 0.75 },
    "Exp. Shield Generator": { category: categoryDamageReduction, reduction: 0.75 },
    "Imp. Remote Shield": { category: categoryDamageReduction, reduction: 0.75 },
    "Imp. Shield Generator": { category: categoryDamageReduction, reduction: 0.75 },
    "Remote Shield": { category: categoryDamageReduction, reduction: 0.75 },
    "Shield Generator": { category: categoryDamageReduction, reduction: 0.75 },
    "AEGIS Remote Shield": { category: categoryDamageReduction, reduction: 0.5 },
    "Adv. Force Field": { category: categoryDamageReduction, reduction: 0.5 },
    "Exp. Force Field": { category: categoryDamageReduction, reduction: 0.5 },
    "Energy Mantle": { category: categoryDamageReduction, reduction: 0.5 },
    "Force Field": { category: categoryDamageReduction, reduction: 0.5 },
    "Imp. Energy Mantle": { category: categoryDamageReduction, reduction: 0.5 },
    "Imp. Force Field": { category: categoryDamageReduction, reduction: 0.5 },
    "Imp. Remote Force Field": { category: categoryDamageReduction, reduction: 0.5 },
    "Remote Force Field": { category: categoryDamageReduction, reduction: 0.5 },
    "7V-RTL's Ultimate Field": { category: categoryDamageReduction, reduction: 0.25 },
    "Vortex Field Projector": { category: categoryDamageReduction, reduction: 0.25 },

    // Resist, % of damage type resisted
    "Insulated Plating": { category: categoryResist, resists: { electromagnetic: 15 } },
    "Med. Insulated Plating": { category: categoryResist, resists: { electromagnetic: 20 } },
    "EM Shield": { category: categoryResist, resists: { electromagnetic: 25 } },
    "Hvy. Insulated Plating": { category: categoryResist, resists: { electromagnetic: 30 } },
    "EM Disruption": { category: categoryResist, resists: { electromagnetic: 50 } },
    "EM Dispersion": { category: categoryResist, resists: { electromagnetic: 75 } },
    "Damper Plating": { category: categoryResist, resists: { electromagnetic: 90 } },
    "8R-AWN's Armor/EX": { category: categoryResist, resists: { explosive: 90 } },
    "Shock Absorption System": { category: categoryResist, resists: { explosive: 25 } },
    "Imp. Shock Absorption System": { category: categoryResist, resists: { explosive: 50 } },
    "Exp. Shock Absorption System": { category: categoryResist, resists: { explosive: 75 } },
    "Mak. Kinetic Plating": { category: categoryResist, resists: { kinetic: 20 } },
    "Focal Shield": { category: categoryResist, resists: { kinetic: 20 } },
    "Reactive Plating": { category: categoryResist, resists: { kinetic: 20 } },
    "Imp. Focal Shield": { category: categoryResist, resists: { kinetic: 25 } },
    "Adv. Focal Shield": { category: categoryResist, resists: { kinetic: 30 } },
    "Exp. Focal Shield": { category: categoryResist, resists: { kinetic: 30 } },
    "Med. Reactive Plating": { category: categoryResist, resists: { kinetic: 30 } },
    "Hvy. Reactive Plating": { category: categoryResist, resists: { kinetic: 40 } },
    "8R-AWN's Armor/TH": { category: categoryResist, resists: { thermal: 90 } },
    "Mak. Thermal Plating": { category: categoryResist, resists: { thermal: 10 } },
    "Thermal Defense Suite": { category: categoryResist, resists: { thermal: 20 } },
    "Reflective Plating": { category: categoryResist, resists: { thermal: 10 } },
    "Med. Reflective Plating": { category: categoryResist, resists: { thermal: 15 } },
    "Thermal Shield": { category: categoryResist, resists: { thermal: 20 } },
    "Imp. Thermal Defense Suite": { category: categoryResist, resists: { thermal: 25 } },
    "Imp. Thermal Shield": { category: categoryResist, resists: { thermal: 25 } },
    "Hvy. Reflective Plating": { category: categoryResist, resists: { thermal: 25 } },
    "Adv. Thermal Defense Suite": { category: categoryResist, resists: { thermal: 30 } },
    "Adv. Thermal Shield": { category: categoryResist, resists: { thermal: 30 } },
    "Exp. Thermal Defense Suite": { category: categoryResist, resists: { thermal: 30 } },
    "Exp. Thermal Shield": { category: categoryResist, resists: { thermal: 30 } },
    "Thermal Barrier": { category: categoryResist, resists: { thermal: 50 } },
    "Beam Splitter": { category: categoryResist, resists: { thermal: 75 } },
    "ME-RLN's Chromatic Screen": {
        category: categoryResist,
        resists: {
            electromagnetic: 20,
            explosive: 20,
            impact: 20,
            kinetic: 20,
            piercing: 20,
            slashing: 20,
            thermal: 20,
        },
    },
    "Zio. Shade Carapace": {
        category: categoryResist,
        resists: {
            electromagnetic: 20,
            explosive: 20,
            impact: 20,
            kinetic: 20,
            piercing: 20,
            slashing: 20,
            thermal: 20,
        },
    },
    "Zio. Shade Armor": {
        category: categoryResist,
        resists: {
            electromagnetic: 30,
            explosive: 30,
            impact: 30,
            kinetic: 30,
            piercing: 30,
            slashing: 30,
            thermal: 30,
        },
    },

    // Ranged avoid, - ranged weapon accuracy
    "Phase Shifter": { category: categoryRangedAvoid, avoid: 5 },
    "Imp. Phase Shifter": { category: categoryRangedAvoid, avoid: 10 },
    "Adv. Phase Shifter": { category: categoryRangedAvoid, avoid: 15 },
    "Exp. Phase Shifter": { category: categoryRangedAvoid, avoid: 20 },

    // Self damage reduction, damage reduction (val * damage = reduced damage)
    "1C-UTU's Buckler": { category: categorySelfDamageReduction, reduction: 0.5 },
    "Powered Armor": { category: categorySelfDamageReduction, reduction: 0.5 },
    "Imp. Powered Armor": { category: categorySelfDamageReduction, reduction: 0.5 },
    "Adv. Powered Armor": { category: categorySelfDamageReduction, reduction: 0.5 },
    "Exp. Powered Armor": { category: categorySelfDamageReduction, reduction: 0.5 },

    // Part shielding, contains slot and percent of damage blocked
    "Core Shielding": { category: categoryShielding, slot: "Core", percent: 0.2 },
    "Imp. Core Shielding": { category: categoryShielding, slot: "Core", percent: 0.3 },
    "Exp. Core Shielding": { category: categoryShielding, slot: "Core", percent: 0.4 },
    "Power Shielding": { category: categoryShielding, slot: ItemSlot.Power, percent: 0.33 },
    "Imp. Power Shielding": { category: categoryShielding, slot: ItemSlot.Power, percent: 0.66 },
    "Exp. Power Shielding": { category: categoryShielding, slot: ItemSlot.Power, percent: 0.9 },
    "Propulsion Shielding": { category: categoryShielding, slot: ItemSlot.Propulsion, percent: 0.33 },
    "Imp. Propulsion Shielding": { category: categoryShielding, slot: ItemSlot.Propulsion, percent: 0.66 },
    "Exp. Propulsion Shielding": { category: categoryShielding, slot: ItemSlot.Propulsion, percent: 0.9 },
    "Utility Shielding": { category: categoryShielding, slot: ItemSlot.Utility, percent: 0.33 },
    "Imp. Utility Shielding": { category: categoryShielding, slot: ItemSlot.Utility, percent: 0.66 },
    "Exp. Utility Shielding": { category: categoryShielding, slot: ItemSlot.Utility, percent: 0.9 },
    "Weapon Shielding": { category: categoryShielding, slot: ItemSlot.Weapon, percent: 0.33 },
    "Imp. Weapon Shielding": { category: categoryShielding, slot: ItemSlot.Weapon, percent: 0.66 },
    "Exp. Weapon Shielding": { category: categoryShielding, slot: ItemSlot.Weapon, percent: 0.9 },
    "Zio. Weapon Casing": { category: categoryShielding, slot: ItemSlot.Weapon, percent: 1.0 },
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
    critical: Critical | undefined;
    damageType: DamageType;
    disruptChance: number;
    forceCore: boolean;
    originalDamage: number;
    realDamage: number;
    spectrum: number;
};

// Applies a final calculated damage value to a bot, splitting into chunks if necessary
function applyDamage(
    state: SimulatorState,
    botState: BotState,
    damage: number,
    critical: Critical | undefined,
    armorAnalyzed: boolean,
    coreAnalyzed: boolean,
    disruptChance: any,
    spectrum: any,
    canOverflow: any,
    damageType: DamageType,
) {
    const chunks: DamageChunk[] = [];

    // Split into chunks each containing originalDamage for other calcs (10)
    if (damageType === DamageType.Explosive) {
        if (critical !== undefined) {
            throw "Explosive damage can't be a crit";
        }

        // Split explosive damage randomly into 1-3 chunks (8)
        // EX damage can never crit, ignore armor, disrupt, explicitly
        // target core, or have a spectrum
        // Note: The remainder from the division is explicitly thrown out
        const numChunks = randomInt(1, 3);
        for (let i = 0; i < numChunks; i++) {
            chunks.push({
                armorAnalyzed: false,
                critical: undefined,
                damageType: damageType,
                disruptChance: 0,
                forceCore: false,
                originalDamage: Math.trunc(damage / numChunks),
                realDamage: 0,
                spectrum: 0,
            });
        }
    } else {
        // Non-EX damage is done in a single chunk unless core analyzer proc (8)
        if (
            ((coreAnalyzed && getShieldingType(botState, "Core") === undefined) || critical === Critical.Puncture) &&
            !botState.immunities.includes(BotImmunity.Criticals) &&
            !botState.immunities.includes(BotImmunity.Coring)
        ) {
            const chunkDamage = Math.trunc(damage / 2);

            chunks.push({
                armorAnalyzed: armorAnalyzed,
                critical: critical,
                damageType: damageType,
                disruptChance: disruptChance, // Might be fixed, currently rolls disrupt on part and core
                forceCore: false,
                originalDamage: chunkDamage,
                realDamage: 0,
                spectrum: spectrum,
            });
            chunks.push({
                armorAnalyzed: false,
                critical: undefined,
                damageType: damageType,
                disruptChance: disruptChance,
                forceCore: true,
                originalDamage: chunkDamage,
                realDamage: 0,
                spectrum: 0,
            });
        } else {
            chunks.push({
                armorAnalyzed: armorAnalyzed,
                critical: critical,
                damageType: damageType,
                disruptChance: disruptChance,
                forceCore: false,
                originalDamage: damage,
                realDamage: 0,
                spectrum: spectrum,
            });
        }
    }

    // Apply any additional damage reduction (11)
    const part = getDefensiveStatePart(botState.defensiveState.damageReduction);
    const multiplier = part != undefined ? part.reduction : 1;

    chunks.forEach((chunk) => {
        chunk.realDamage = Math.trunc(chunk.originalDamage * multiplier);
    });

    function applyDamageChunk(
        damage: number,
        damageType: DamageType,
        critical: Critical | undefined,
        isOverflow: boolean,
        forceCore: boolean,
        disruptChance: number,
        spectrum: number,
        armorAnalyzed: boolean,
    ) {
        // Determine hit part (14)
        const { part, partIndex } = getHitPart(botState, damageType, isOverflow, forceCore, armorAnalyzed);
        applyDamageChunkToPart(damage, damageType, critical, disruptChance, spectrum, part, partIndex);
    }

    function applyDamageChunkToPart(
        damage: number,
        damageType: DamageType,
        critical: Critical | undefined,
        disruptChance: number,
        spectrum: number,
        part: SimulatorPart | undefined,
        partIndex: number,
    ) {
        function doesCriticalDestroyPart(critical: Critical | undefined) {
            if (critical === Critical.Destroy || critical === Critical.Smash) {
                return true;
            }

            return false;
        }

        function destroyPart(
            partIndex: number,
            part: SimulatorPart,
            overflowDamage: number,
            critical: Critical | undefined,
            damageType: DamageType,
        ) {
            botState.parts.splice(partIndex, 1);
            botState.armorAnalyzedCoverage -= part.armorAnalyzedCoverage;
            botState.totalCoverage -= part.coverage;

            // If the part was providing any damage resistances remove them now
            if (part.resistances !== undefined) {
                Object.keys(part.resistances).forEach((type) => {
                    if (type in botState.resistances) {
                        botState.resistances[type]! -= part.resistances![type]!;
                    }
                });
            }

            // TODO: Remove crit-overflow prevention for B11
            if (overflowDamage > 0 && !part.protection && canOverflow && (state.isB11 || critical === undefined)) {
                // Handle overflow damage if excess damage was dealt
                // against a non-protection part (19)
                applyDamageChunk(overflowDamage, damageType, undefined, true, false, 0, 0, false);
            }

            if (damageType === DamageType.Impact) {
                // Apply 25-150% random corruption to the bot after
                // destroying a part (affected by EM resistance) (23)
                let corruption = randomInt(25, 150);
                corruption = calculateResistDamage(botState, corruption, DamageType.Electromagnetic);
                botState.corruption += corruption;
            }

            part.integrity = 0;
            updateWeaponsAccuracy(state);
        }

        // Remove all criticals from totally immune bots
        if (critical !== undefined) {
            if (botState.immunities.includes(BotImmunity.Criticals)) {
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
        // Apply detonate crit
        else if (critical === Critical.Detonate) {
            let i: number;
            for (i = 0; i < botState.parts.length; i++) {
                if (botState.parts[i].def.slot === ItemSlot.Power) {
                    break;
                }
            }

            // Destroy first engine found (if any)
            // TODO apply explosion damage
            if (i < botState.parts.length) {
                const engine = botState.parts[i];
                destroyPart(i, engine, 0, undefined, DamageType.Entropic);

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
            const shielding = getShieldingType(botState, "Core");

            // Remove crit types that apply to the core if immunity or shielding (15)
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

            // Apply disruption (18)
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
                        // Technically sever does a very minor amount of damage to the part
                        // Even if it isn't removed, but it isn't worth worrying about
                        continue;
                    }

                    destroyPart(partIndex, part, 0, undefined, DamageType.Phasic);
                }

                return;
            } else if (critical === Critical.Blast) {
                const { part, partIndex } = getRandomNonCorePart(botState, undefined);
                if (part === undefined || getShieldingType(botState, part.def.slot) !== undefined) {
                    // Shielding protects against blast completely
                    return;
                }

                if (part.def.size === 1) {
                    // Single-slot items get blasted off, treat as part destruction
                    destroyPart(partIndex, part, 0, undefined, DamageType.Phasic);
                } else {
                    // Multi-slot items don't get blasted off but still take damage
                    applyDamageChunkToPart(damage, DamageType.Phasic, undefined, 0, 0, part, partIndex);
                }
            } else if (critical === Critical.Phase) {
                // Apply phasing damage to another random part
                const { part, partIndex } = getRandomNonCorePart(botState, undefined);
                applyDamageChunkToPart(damage, DamageType.Phasic, undefined, 0, 0, part, partIndex);
            }

            return;
        }

        // Handle non-core hit
        // Try to get shielding for non-protection parts
        const shielding = part.def.type === ItemType.Protection ? undefined : getShieldingType(botState, part.def.slot);

        // Check for crit immunity or shielding (15)
        if (shielding !== undefined && doesCriticalDestroyPart(critical)) {
            critical = undefined;
        }

        // Check for spectrum engine explosion (17)
        // TODO apply damage
        const engineExplosion = part.def.slot === ItemSlot.Power && randomInt(0, 99) < spectrum;

        // Protection can't get instantly destroyed, only receives 20% more damage
        if (doesCriticalDestroyPart(critical) && part.protection) {
            critical = undefined;
            damage = Math.trunc(1.2 * damage);
        }

        // Reduce damage for powered armor/siege mode (18)
        // TODO enemy siege mode
        if (part.selfDamageReduction !== 0) {
            damage = damage * Math.trunc(part.selfDamageReduction);
        }

        // Apply disruption (18)
        // TODO

        if (shielding != undefined) {
            // Handle slot shielding reduction
            // Note: shielding may absorb more damage than integrity
            const shieldingDamage = Math.trunc(shielding.reduction * damage);
            shielding.part.integrity -= shieldingDamage;

            damage = damage - shieldingDamage;
        }

        let destroyed = part.integrity <= damage || doesCriticalDestroyPart(critical) || engineExplosion;

        // Check for sever from slash damage on parts with size 1
        // TODO: Remove for B11
        if (!state.isB11 && !destroyed && damageType === DamageType.Slashing && part.def.size == 1) {
            // Sever has a damage / 3 % chance of happening against a
            // non-destroyed part (23)
            if (randomInt(0, 99) < Math.trunc(damage / 3)) {
                destroyed = true;
            }
        }

        // Apply sever/sunder to instantly-remove (not destroy) part if it's a single slot and unshielded
        // Applied differently than other part destruction since this can't affect multislot
        // parts but can affect protection
        if (
            !destroyed &&
            (critical === Critical.Sever || critical === Critical.Sunder) &&
            part.def.size === 1 &&
            shielding === undefined
        ) {
            destroyed = true;
        }

        if (destroyed) {
            // Part destroyed, remove part and update bot state
            // Smash critical destroys the part instantly and deals full overflow damage
            const overflowDamage = critical === Critical.Smash ? damage : damage - part.integrity;
            destroyPart(partIndex, part, overflowDamage, critical, damageType);
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
                // Single-slot items get blasted off, treat as part destruction
                destroyPart(partIndex, part, 0, undefined, DamageType.Phasic);
            } else {
                // Multi-slot items don't get blasted off but still take damage
                applyDamageChunkToPart(damage, DamageType.Phasic, undefined, 0, 0, part, partIndex);
            }
        } else if (critical === Critical.Phase) {
            // Apply phasing damage to the core
            applyDamageChunkToPart(damage, DamageType.Phasic, undefined, 0, 0, undefined, -1);
        }
    }

    // Apply damage
    chunks.forEach((chunk) => {
        applyDamageChunk(
            chunk.realDamage,
            chunk.damageType,
            chunk.critical,
            false,
            chunk.forceCore,
            chunk.disruptChance,
            chunk.spectrum,
            chunk.armorAnalyzed,
        );

        // Apply corruption (23)
        if (damageType === DamageType.Electromagnetic) {
            // Check for corruption ignore chance
            const corruptionIgnorePart = getDefensiveStatePart(botState.defensiveState.corruptionIgnore);
            const corruptCritical =
                critical === Critical.Corrupt && !botState.immunities.includes(BotImmunity.Criticals);

            if (corruptionIgnorePart === undefined || randomInt(0, 99) >= corruptionIgnorePart.chance) {
                // Corruption critical always applies maximum 1.5 critical modifier
                const corruptionPercent = corruptCritical ? 1.5 : randomInt(50, 150) / 100;
                const corruption = chunk.originalDamage * corruptionPercent;
                botState.corruption += corruption;
            }
        }
    });
}

// Returns a clone of a bot state
// This is not a deep copy, any fields that can be modified are deep-copied
// but immutable fields are not.
function cloneBotState(botState: BotState): BotState {
    const resistances = {};
    Object.keys(botState.resistances).forEach((type) => (resistances[type] = botState.resistances[type]));
    const newState: BotState = {
        armorAnalyzedCoverage: botState.armorAnalyzedCoverage,
        coreCoverage: botState.coreCoverage,
        coreDisrupted: botState.coreDisrupted,
        coreIntegrity: botState.coreIntegrity,
        corruption: botState.corruption,
        def: botState.def,
        defensiveState: undefined as any,
        externalDamageReduction: botState.externalDamageReduction,
        immunities: botState.immunities,
        initialCoreIntegrity: botState.initialCoreIntegrity,
        parts: botState.parts.map((p) => {
            return {
                armorAnalyzedCoverage: p.armorAnalyzedCoverage,
                coverage: p.coverage,
                def: p.def,
                integrity: p.integrity,
                protection: p.protection,
                selfDamageReduction: p.selfDamageReduction,
            };
        }),
        regen: botState.regen,
        resistances: resistances,
        totalCoverage: botState.totalCoverage,
    };
    newState.defensiveState = getBotDefensiveState(newState.parts, newState.externalDamageReduction);

    return newState;
}

// Calculates the resisted damage for a bot given the initial damage value
export function calculateResistDamage(botState: BotState, damage: number, damageType: DamageType): number {
    if (damageType in botState.resistances) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return Math.trunc(damage * (1 - botState.resistances[damageType]! / 100));
    }

    return damage;
}

// Returns a bot's defensive state based on parts, also adds new relevant
// properties to parts
// Adding ad-hoc properties is a little messy but making a bunch of wrapper
// objects wouldn't really do very much
export function getBotDefensiveState(parts: SimulatorPart[], externalDamageReduction: string): DefensiveState {
    const state: DefensiveState = {
        antimissile: [],
        avoid: [],
        corruptionIgnore: [],
        damageReduction: [],
        rangedAvoid: [],
        shieldings: {
            Core: [],
            Power: [],
            Propulsion: [],
            Utility: [],
            Weapon: [],
        },
    };

    parts.forEach((part) => {
        const name = part.def.name;
        const specialItem = specialItems[name];

        if (specialItem === undefined) {
            return;
        }

        if (specialItem.category === categoryAntimissile) {
            // Antimissile System-like part
            state.antimissile.push({ chance: specialItem.chance, part: part });
        } else if (specialItem.category === categoryAvoid) {
            // Reaction Control System-like part
            // Leg/hover/flight determination done at accuracy update time
            state.avoid.push({
                legs: specialItem.legs,
                other: specialItem.other,
                part: part,
            });
        } else if (specialItem.category === categoryCorruptionIgnore) {
            // Dynamic Insulation System
            state.corruptionIgnore.push({ chance: specialItem.ignore, part: part });
        } else if (specialItem.category === categoryDamageReduction) {
            // Force field-like part
            state.damageReduction.push({ part: part, reduction: specialItem.reduction });
        } else if (specialItem.category === categoryResist) {
            // Damage type resist part
            part.resistances = specialItem.resists;
        } else if (specialItem.category === categoryRangedAvoid) {
            // Phase Shifters
            state.rangedAvoid.push({ avoid: specialItem.avoid, part: part });
        } else if (specialItem.category === categorySelfDamageReduction) {
            // Powered armor-like part
            part.selfDamageReduction = specialItem.reduction;
        } else if (specialItem.category === categoryShielding) {
            // Core/slot shielding
            state.shieldings[specialItem.slot].push({ part: part, reduction: specialItem.percent });
        }
    });

    // Sort damage reduction (11)
    if (externalDamageReduction in externalDamageReductionMap) {
        const reduction = externalDamageReductionMap[externalDamageReduction];

        if (state.damageReduction.length === 0) {
            // If no other damage reduction no need to sort
            state.damageReduction.push({
                reduction: reduction,
                part: {
                    armorAnalyzedCoverage: 0,
                    coverage: 0,
                    def: undefined as any,
                    integrity: 1,
                    protection: false,
                    selfDamageReduction: 0,
                },
            });
        } else {
            const existingIndex = damageReductionSortOrder.indexOf(state.damageReduction[0].part.def.name);
            const newIndex = damageReductionSortOrder.indexOf(externalDamageReduction);

            // Use sort order to decide to insert before or after
            if (newIndex < existingIndex) {
                state.damageReduction.unshift({
                    reduction: reduction,
                    part: {
                        armorAnalyzedCoverage: 0,
                        coverage: 0,
                        def: undefined as any,
                        integrity: 1,
                        protection: false,
                        selfDamageReduction: 0,
                    },
                });
            } else {
                state.damageReduction.push({
                    reduction: reduction,
                    part: {
                        armorAnalyzedCoverage: 0,
                        coverage: 0,
                        def: undefined as any,
                        integrity: 1,
                        protection: false,
                        selfDamageReduction: 0,
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

    if (damageType === DamageType.Impact) {
        // Impact damage targets core and all parts with equal probability
        const coverageHit = randomInt(0, botState.parts.length);

        if (coverageHit < botState.parts.length) {
            partIndex = coverageHit;
            part = botState.parts[partIndex];
        } else {
            // Keep part undefined for core hit
        }
    } else if (isOverflow) {
        const protectionParts = botState.parts.filter((p) => p.protection && p.coverage > 0);
        if (protectionParts.length > 0) {
            // Handle overflow damage specially when there's armor,
            // overflow into a random armor piece based on coverage (20)
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
    if (part === undefined && damageType !== DamageType.Impact) {
        // Piercing damage gets double core exposure
        const coreCoverageBonus = damageType === DamageType.Piercing ? botState.coreCoverage : 0;

        if (armorAnalyzed) {
            // Determine part based on reduced armor coverage
            const totalCoverage = botState.armorAnalyzedCoverage + coreCoverageBonus;
            let coverageHit = randomInt(0, totalCoverage - 1);

            for (partIndex = 0; partIndex < botState.parts.length; partIndex++) {
                // Subtract part's armor analyzed coverage to see if we got a hit
                coverageHit -= botState.parts[partIndex].armorAnalyzedCoverage;
                if (coverageHit < 0) {
                    part = botState.parts[partIndex];
                    break;
                }

                // If it's a core hit we'll run through all parts and exit
                // the loop with part still equal to undefined
            }
        } else {
            // Determine part based on regular coverage
            const totalCoverage = botState.totalCoverage + coreCoverageBonus;
            let coverageHit = randomInt(0, totalCoverage - 1);

            for (partIndex = 0; partIndex < botState.parts.length; partIndex++) {
                // Subtract part's coverage to see if we got a hit
                coverageHit -= botState.parts[partIndex].coverage;
                if (coverageHit < 0) {
                    part = botState.parts[partIndex];
                    break;
                }

                // If it's a core hit we'll run through all parts and exit
                // the loop with part still equal to undefined
            }
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
export function getRecoil(weaponDef: WeaponItem, numTreads: number, recoilReduction: number): number {
    let recoil = 0;

    // Add recoil if siege mode not active
    if (weaponDef.recoil !== undefined) {
        recoil += weaponDef.recoil;
        recoil -= numTreads;
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
    if (weapons.length in volleyTimeMap) {
        volleyTime = volleyTimeMap[weapons.length];
    } else {
        // No additional penalty past 6 weapons
        volleyTime = 400;
    }

    weapons.forEach((weapon) => {
        // Apply individual delays
        volleyTime += weapon.delay ?? 0;
    });

    volleyTime *= cyclerModifier;

    // Min time is capped at 25
    return Math.trunc(Math.max(25, volleyTime));
}

// Tries to get a bot's first shielding for a specific slot
// Parts will be removed from the array if their integrity has dropped below 0
function getShieldingType(botState: BotState, slot: string) {
    return getDefensiveStatePart(botState.defensiveState.shieldings[slot]);
}

const simulationEndConditions: { [key: string]: (state: BotState) => boolean } = {
    Kill: function (botState) {
        return botState.coreIntegrity <= 0 || botState.corruption >= 100;
    },
    "Kill or Core Disrupt": function (botState) {
        return botState.coreIntegrity <= 0 || botState.corruption >= 100 || botState.coreDisrupted;
    },
    "Kill or No Power": function (botState) {
        return (
            botState.coreIntegrity <= 0 ||
            botState.corruption >= 100 ||
            botState.parts.every((part) => part.def.slot != ItemSlot.Power)
        );
    },
    "Kill or No Weapons": function (botState) {
        return (
            botState.coreIntegrity <= 0 ||
            botState.corruption >= 100 ||
            botState.parts.every((part) => part.def.slot != ItemSlot.Weapon)
        );
    },
    "Kill or No TNC": function (botState) {
        return (
            botState.coreIntegrity <= 0 ||
            botState.corruption >= 100 ||
            botState.parts.every((part) => part.def.name != "Transport Network Coupler")
        );
    },
    "Architect Tele (80% integrity, 1 weapon, or 1 prop)": function (botState) {
        return (
            botState.coreIntegrity <= botState.initialCoreIntegrity * 0.8 ||
            botState.parts.filter((part) => part.def.slot === ItemSlot.Weapon).length === 1 ||
            botState.parts.filter((part) => part.def.slot === ItemSlot.Propulsion).length === 1
        );
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

    // Update initial accuracy
    updateWeaponsAccuracy(state);

    const endCondition = simulationEndConditions[state.endCondition];

    // Update initial sneak attack state
    offensiveState.sneakAttack =
        offensiveState.sneakAttackStrategy === "All" || offensiveState.sneakAttackStrategy === "First Only";

    // Update initial momentum
    offensiveState.momentum.current = offensiveState.momentum.bonus + offensiveState.momentum.initial;

    while (!endCondition(botState)) {
        // Apply core regen
        const lastCompletedTurns = Math.trunc(oldTus / 100);
        const newCompletedTurns = Math.trunc(state.tus / 100);
        const regenIntegrity = botState.regen * (newCompletedTurns - lastCompletedTurns);

        botState.coreIntegrity = Math.min(botState.initialCoreIntegrity, botState.coreIntegrity + regenIntegrity);

        // Process each volley
        volleys += 1;
        let volleyTime = offensiveState.volleyTime;

        if (offensiveState.melee) {
            // Always do primary attack
            simulateWeapon(state, state.weapons[0]);

            // Handle followups chances
            for (let i = 1; i < state.weapons.length; i++) {
                if (randomInt(0, 99) < offensiveState.followupChances[i - 1]) {
                    simulateWeapon(state, state.weapons[i]);

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
            state.weapons.forEach((weapon) => simulateWeapon(state, weapon));
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

        // Update accuracy when crossing siege mode activation
        if (
            !offensiveState.melee &&
            oldTus < offensiveState.siegeBonus.tus &&
            state.tus > offensiveState.siegeBonus.tus
        ) {
            updateWeaponsAccuracy(state);
        }
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

    return true;
}

// Simulates 1 weapon's damage in a volley
function simulateWeapon(state: SimulatorState, weapon: SimulatorWeapon) {
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
        damage = calculateResistDamage(botState, damage, DamageType.Impact);

        if (damage > 0) {
            applyDamage(
                state,
                botState,
                damage,
                undefined,
                false,
                false,
                weapon.disruption,
                weapon.spectrum,
                weapon.overflow,
                DamageType.Impact,
            );
        }

        return;
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

        if (weapon.damageType != undefined) {
            // Calculate base damage, then apply overloads, momentum,
            // and sneak attacks (2)
            let damage = randomInt(weapon.damageMin, weapon.damageMax);

            // Apply overload damage doubling + additional bonus
            if (weapon.overloaded) {
                damage = Math.trunc(damage * (2 + offensiveState.overloadBonus));
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

                if (weapon.damageType === DamageType.Piercing) {
                    // Piercing gets double bonus (not double cap)
                    momentumMultiplier *= 2;
                }

                momentumMultiplier = momentumMultiplier / 100 + 1;

                damage = Math.trunc(momentumMultiplier * damage);
            }

            // Apply double damage sneak attack bonus
            if (offensiveState.melee && offensiveState.sneakAttack) {
                damage *= 3; // Might be fixed, currently does 3x instead of 2x
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

            // Check for core analyzer (8)
            const coreAnalyzed = randomInt(0, 99) < offensiveState.coreAnalyzerChance;

            // Check for crit (9)
            const didCritical = randomInt(0, 99) < weapon.criticalChance;

            if (damage > 0) {
                applyDamage(
                    state,
                    botState,
                    damage,
                    didCritical ? weapon.criticalType : undefined,
                    armorAnalyzed,
                    coreAnalyzed,
                    weapon.disruption,
                    weapon.spectrum,
                    weapon.overflow,
                    weapon.damageType,
                );
            }
        }

        if (weapon.explosionType != undefined) {
            // Apply explosion damage (2)
            let damage = randomInt(weapon.explosionMin, weapon.explosionMax);

            // Apply resistances (6)
            damage = calculateResistDamage(botState, damage, weapon.explosionType);

            if (damage > 0) {
                applyDamage(
                    state,
                    botState,
                    damage,
                    undefined,
                    false,
                    false,
                    weapon.disruption,
                    weapon.explosionSpectrum,
                    weapon.overflow,
                    weapon.explosionType,
                );
            }
        }
    }
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
            // TODO - doesn't matter now but should make sure hover/flight is active here
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

    state.weapons.forEach((weapon) => {
        if (weapon.def.waypoints !== undefined) {
            // Guided weapons always have 100% accuracy
            weapon.accuracy = 100;
            return;
        }

        let accuracy = weapon.baseAccuracy + perWeaponBonus;

        if (!offensiveState.melee && siegeBonus === 0) {
            // Subtract recoil if siege mode inactive
            accuracy -=
                offensiveState.recoil - getRecoil(weapon.def, offensiveState.numTreads, offensiveState.recoilReduction);
        }

        // Cap accuracy
        const max = offensiveState.melee ? maxRangedAccuracy : maxMeleeAccuracy;
        weapon.accuracy = Math.min(max, Math.max(accuracy, minAccuracy));
    });
}
