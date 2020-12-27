// Battle simulation calculation functions/constants
import {
    randomInt, valueOrDefault,
} from "./common.js";

const minAccuracy = 10;
const maxRangedAccuracy = 95;
const maxMeleeAccuracy = 100;

export const maxVolleys = 100000;

// Avoidance utility name to avoid % map
const avoidMap = {
    "Maneuvering Thrusters": { legs: 3, other: 6 },
    "Imp. Maneuvering Thrusters": { legs: 5, other: 10 },
    "Reaction Control System": { legs: 6, other: 12 },
    "Adv. Reaction Control System": { legs: 7, other: 14 },
};

// Part name to corruption ignore chance percent
const corruptionIgnoreMap = {
    "Dynamic Insulation System": 50,
    "Imp. Dynamic Insulation System": 67,
    "Adv. Dynamic Insulation System": 75,
};

// Part names to damage reduction (val * damage = reduced damage)
const damageReductionMap = {
    "7V-RTL's Ultimate Field": .25,
    "AEGIS Remote Shield": .50,
    "Adv. Force Field": .50,
    "Adv. Shield Generator": .75,
    "Exp. Force Field": .50,
    "Exp. Shield Generator": .75,
    "Energy Mantle": .50,
    "Force Field": .50,
    "Imp. Energy Mantle": .50,
    "Imp. Force Field": .50,
    "Imp. Remote Force Field": .50,
    "Imp. Remote Shield": .75,
    "Imp. Shield Generator": .75,
    "Remote Force Field": .50,
    "Remote Shield": .75,
    "Shield Generator": .75,
    "Vortex Field Projector": .25,
};

// Array of damage reducing parts to sort
// 11. Apply the first and only first defense applicable from the 
// following list: phase wall, 75% personal shield (VFP etc), 
// Force Field, Shield Generator, stasis bubble, active Stasis Trap,
// Remote Shield, 50% remote shield (Energy Mantle etc.), Hardlight Generator.
const damageReductionSortOrder = [
    "Phase Wall",
    "Vortex Field Projector", "7V-RTL'S Ultimate Field",
    "Force Field", "Imp. Force Field", "Adv. Force Field", "Exp. Force Field",
    "Shield Generator", "Imp. Shield Generator", "Adv. Shield Generator", "Exp. Shield Generator",
    "Stasis Bubble",
    "Stasis Trap",
    "Remote Shield", "Imp. Remote Shield",
    "Remote Force Field", "Imp. Remote Force Field", "Energy Mantle", "Imp. Energy Mantle", "AEGIS Remote Shield",
]

const externalDamageReductionMap = {
    "Remote Shield": 0.75,
    "Stasis Trap": 0.75,
    "Phase Wall": 0.5,
    "Remote Force Field": 0.5,
    "Stasis Bubble": 0.5,
}

// Array of melee analysis accuracy increases
const meleeAnalysisAccuracy = [
    5,
    6,
    8,
    12,
];

// Range avoid util name to avoid percent
const rangedAvoidMap = {
    "Phase Shifter": 5,
    "Imp. Phase Shifter": 10,
    "Adv. Phase Shifter": 15,
    "Exp. Phase Shifter": 20,
};

// Part names to self damage reduction (val * damage = reduced damage)
const selfDamageReduction = {
    "1C-UTU's Buckler": .50,
    "Adv. Powered Armor": .50,
    "Imp. Powered Armor": .50,
    "Powered Armor": .50,
};

// Shielding name to slot/absorption
const shieldingMap = {
    "Core Shielding": { slot: "Core", percent: .20 },
    "Imp. Core Shielding": { slot: "Core", percent: .30 },
    "Exp. Core Shielding": { slot: "Core", percent: .40 },
    "Power Shielding": { slot: "Power", percent: .33 },
    "Imp. Power Shielding": { slot: "Power", percent: .66 },
    "Exp. Power Shielding": { slot: "Power", percent: .90 },
    "Propulsion Shielding": { slot: "Propulsion", percent: .33 },
    "Imp. Propulsion Shielding": { slot: "Propulsion", percent: .66 },
    "Exp. Propulsion Shielding": { slot: "Propulsion", percent: .90 },
    "Utility Shielding": { slot: "Utility", percent: .33 },
    "Imp. Utility Shielding": { slot: "Utility", percent: .66 },
    "Exp. Utility Shielding": { slot: "Utility", percent: .90 },
    "Weapon Shielding": { slot: "Weapon", percent: .33 },
    "Imp. Weapon Shielding": { slot: "Weapon", percent: .66 },
    "Exp. Weapon Shielding": { slot: "Weapon", percent: .90 },
    "Zio. Weapon Casing": { slot: "Weapon", percent: 1.00 },
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

// Applies a final calculated damage value to a bot, splitting into chunks if necessary
function applyDamage(state, botState, damage, critical, armorAnalyzed, coreAnalyzed, canOverflow, damageType) {
    const chunks = [];

    // Split into chunks each containing originalDamage for other calcs (10)
    if (damageType === "Explosive") {
        if (critical) {
            throw "Explosive damage can't be a crit";
        }

        // Split explosive damage randomly into 1-3 chunks (8)
        // EX damage can never crit and can't ignore armor
        // Note: The remainder from the division is explicitly thrown out
        const numChunks = randomInt(1, 3);
        for (let i = 0; i < numChunks; i++) {
            chunks.push({
                armorAnalyzed: false,
                critical: false,
                damageType: damageType,
                forceCore: false,
                originalDamage: Math.trunc(damage / numChunks),
            });
        }
    }
    else {
        // Non-EX damage is done in a single chunk unless core analyzer proc (8)
        if (coreAnalyzed
            && !botState.immunities.includes("Criticals")
            && !botState.immunities.includes("Coring")) {
            let chunkDamage = Math.trunc(damage / 2);

            chunks.push({
                armorAnalyzed: armorAnalyzed,
                critical: critical,
                damageType: damageType,
                forceCore: false,
                originalDamage: chunkDamage,
            });
            chunks.push({
                armorAnalyzed: false,
                critical: false,
                damageType: damageType,
                forceCore: true,
                originalDamage: chunkDamage,
            });
        }
        else {
            chunks.push({
                armorAnalyzed: armorAnalyzed,
                critical: critical,
                damageType: damageType,
                forceCore: false,
                originalDamage: damage,
            });
        }
    }

    // Apply any additional damage reduction (11)
    const part = getDefensiveStatePart(botState.defensiveState.damageReduction);
    let multiplier = part != null ? part.damageReduction : 1;

    chunks.forEach(chunk => {
        chunk.damage = Math.trunc(chunk.originalDamage * multiplier);
    });

    function applyDamageChunk(damage, damageType, critical, isOverflow, forceCore, armorAnalyzed) {
        // Determine hit part (14)
        const { part, partIndex } = getHitPart(botState, damageType,
            isOverflow, forceCore, armorAnalyzed);

        // Handle core hit
        if (part === null) {
            // Try to get shielding
            const shielding = getShieldingType(botState, "Core");

            // Remove crit if immunity or shielding (15)
            if (critical) {
                critical = !botState.immunities.includes("Criticals")
                    && !botState.immunities.includes("Coring")
                    && shielding == null;
            }

            if (shielding != null) {
                // Handle core shielding reduction
                // Note: shielding may absorb more damage than integrity
                const shieldingDamage = Math.trunc(shielding.shieldingPercent * damage);
                shielding.integrity -= shieldingDamage;

                damage = damage - shieldingDamage;
            }

            if (critical) {
                botState.coreIntegrity = 0;
            }
            else {
                botState.coreIntegrity -= damage;
            }

            return;
        }

        // Try to get shielding
        const shielding = getShieldingType(botState, part.def["Slot"]);

        // Check for crit immunity or shielding (15)
        if (critical) {
            critical = !botState.immunities.includes("Criticals") && shielding == null;
        }

        // Check for spectrum engine explosion (17)
        // TODO

        // Protection can't get crit, only receives 20% more damage
        if (critical && part.protection) {
            critical = false;
            damage = Math.trunc(1.2 * damage);
        }

        // Reduce damage for powered armor/siege mode (18)
        // TODO enemy siege mode
        if ("selfDamageReduction" in part) {
            damage = Math.trunc(part.selfDamageReduction);
        }

        if (shielding != null) {
            // Handle slot shielding reduction
            // Note: shielding may absorb more damage than integrity
            const shieldingDamage = Math.trunc(shielding.shieldingPercent * damage);
            shielding.integrity -= shieldingDamage;

            damage = damage - shieldingDamage;
        }

        let destroyed = part.integrity <= damage || critical;

        // Check for sever            
        if (!destroyed && damageType === "Slashing") {
            // Sever has a damage / 3 % chance of happening against a
            // non-destroyed part (23)
            if (randomInt(0, 99) < Math.trunc(damage / 3)) {
                destroyed = true;
            }
        }

        if (destroyed) {
            // Part destroyed, remove part and update bot state
            botState.parts.splice(partIndex, 1);
            botState.armorAnalyzedCoverage -= part.armorAnalyzedCoverage;
            botState.totalCoverage -= part.coverage;

            if (part.integrity < damage && !part.protection && canOverflow && !critical) {
                // Handle overflow damage if excess damage was dealt 
                // against a non-protection part (19)
                applyDamageChunk(damage - part.integrity, damageType, false, true, false, false);
            }

            if (damageType === "Impact") {
                // Apply 25-150% random corruption to the bot after 
                // destroying a part (affected by EM resistance) (23)
                let corruption = randomInt(25, 150);
                corruption = calculateResistDamage(botState, corruption, "Electromagnetic");
                botState.corruption += corruption;
            }

            part.integrity = 0;

            updateWeaponsAccuracy(state);
        }
        else {
            // Part not destroyed, just reduce integrity
            part.integrity -= damage;
        }
    }

    // Apply damage 
    chunks.forEach(chunk => {
        applyDamageChunk(chunk.damage, chunk.damageType, chunk.critical,
            false, chunk.forceCore, chunk.armorAnalyzed);

        // Apply corruption (23)
        if (damageType === "Electromagnetic") {
            // Check for corruption ignore chance
            const corruptionIgnorePart = getDefensiveStatePart(botState.defensiveState.corruptionIgnore);

            if (corruptionIgnorePart === null
                || randomInt(0, 99) >= corruptionIgnorePart.corruptionIgnore) {
                const corruptionPercent = randomInt(50, 150) / 100;
                const corruption = chunk.originalDamage * corruptionPercent;
                botState.corruption += corruption;
            }
        }
    });
}

// Returns a clone of a bot state
// This is not a deep copy, any fields that can be modified are deep-copied
// but immutable fields are not.
function cloneBotState(botState) {
    const newState = {
        armorAnalyzedCoverage: botState.armorAnalyzedCoverage,
        coreCoverage: botState.coreCoverage,
        coreIntegrity: botState.coreIntegrity,
        corruption: botState.corruption,
        def: botState.def,
        immunities: botState.immunities,
        initialCoreIntegrity: botState.initialCoreIntegrity,
        parts: botState.parts.map(p => {
            return {
                armorAnalyzedCoverage: p.armorAnalyzedCoverage,
                coverage: p.coverage,
                def: p.def,
                integrity: p.integrity,
                protection: p.protection,
            }
        }),
        regen: botState.regen,
        resistances: botState.resistances,
        totalCoverage: botState.totalCoverage,
    }
    newState.defensiveState = getBotDefensiveState(newState.parts);

    return newState;
}

// Calculates the resisted damage for a bot given the initial damage value
export function calculateResistDamage(botState, damage, damageType) {
    if (damageType in botState.resistances) {
        return Math.trunc(damage * (1 - (botState.resistances[damageType] / 100)));
    }

    return damage;
}

// Returns a bot's defensive state based on parts, also adds new relevant 
// properties to parts
// Adding ad-hoc properties is a little messy but making a bunch of wrapper
// objects wouldn't really do very much
export function getBotDefensiveState(parts, externalDamageReduction) {
    const state = {
        avoid: [],
        corruptionIgnore: [],
        damageReduction: [],
        rangedAvoid: [],
        shieldings: {
            "Core": [],
            "Power": [],
            "Propulsion": [],
            "Utility": [],
            "Weapon": [],
        },
    };

    parts.forEach(part => {
        const name = part.def["Name"];
        if (name in avoidMap) {
            // Reaction Control System-like part
            part.avoid = avoidMap[name];
            state.avoid.push(part);
        }
        else if (name in corruptionIgnoreMap) {
            // Dynamic Insulation System
            part.corruptionIgnore = corruptionIgnoreMap[name];
            state.corruptionIgnore.push(part);
        }
        else if (name in damageReductionMap) {
            // Force field-like part
            part.damageReduction = damageReductionMap[name];
            state.damageReduction.push(part);
        }
        else if (name in rangedAvoidMap) {
            // Phase Shifters
            part.rangedAvoid = rangedAvoidMap[name];
            state.rangedAvoid.push(part);
        }
        else if (name in selfDamageReduction) {
            // Powered armor-like part
            part.selfDamageReduction = selfDamageReduction[name];
        }
        else if (name in shieldingMap) {
            // Core/slot shielding
            const shielding = shieldingMap[name];
            part.shieldingPercent = shielding.percent;
            state.shieldings[shielding.slot].push(part);
        }
    });

    // Sort damage reduction (11)
    if (externalDamageReduction in externalDamageReductionMap) {
        const reduction = externalDamageReductionMap[externalDamageReduction];

        if (state.damageReduction.length === 0) {
            // If no other damage reduction no need to sort
            state.damageReduction.push({ integrity: 1, damageReduction: reduction });
        }
        else {
            const existingIndex = damageReductionSortOrder.indexOf(state.damageReduction[0].def["Name"]);
            const newIndex = damageReductionSortOrder.indexOf(externalDamageReduction);

            // Use sort order to decide to insert before or after
            if (newIndex < existingIndex) {
                state.damageReduction.unshift({ integrity: 1, damageReduction: reduction });
            }
            else {
                state.damageReduction.push({ integrity: 1, damageReduction: reduction });
            }
        }

        // Don't need to fully sort this section because 
        if (externalDamageReduction === "Phase Wall") {
            state.damageReduction.unshift({ integrity: 1, damageReduction: reduction });
        }
        else {

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
function getDefensiveStatePart(array) {
    let part = null;

    while (array.length > 0) {
        if (array[0].integrity > 0) {
            // Found a good part, use it here
            part = array[0];
            break;
        }
        else {
            // Found destroyed part, remove from array
            array.shift();
        }
    }

    return part;
}

// Determines the part that was hit by an attack
function getHitPart(botState, damageType, isOverflow, forceCore, armorAnalyzed) {
    let part = null;
    let partIndex;

    if (forceCore) {
        // Keep part null for core hit
    }
    else {
        if (damageType === "Impact") {
            // Impact damage targets core and all parts with equal probability
            const coverageHit = randomInt(0, botState.parts.length);

            if (coverageHit < botState.parts.length) {
                partIndex = coverageHit;
                part = botState.parts[partIndex];
            }
            else {
                // Keep part null for core hit
            }
        }
        else if (isOverflow) {
            const protectionParts = botState.parts.filter(p => p.protection && p.coverage > 0);
            if (protectionParts.length > 0) {
                // Handle overflow damage specially when there's armor,
                // overflow into a random armor piece based on coverage (20)
                let coverageHit = randomInt(0, protectionParts.reduce(
                    (prev, part) => prev + part.coverage, 0));

                for (let i = 0; i < protectionParts.length; i++) {
                    coverageHit -= protectionParts[i].coverage;

                    if (coverageHit < 0) {
                        part = protectionParts[i];
                        break;
                    }

                    // If it's a core hit we'll run through all parts and exit
                    // the loop with part still equal to null
                }

                partIndex = botState.parts.indexOf(part);
            }

            // If no protection parts fall into standard coverage behavior
        }

        if (part === null) {
            // Piercing damage gets double core exposure
            const coreCoverageBonus = damageType === "Piercing" ? botState.coreCoverage : 0;

            if (armorAnalyzed) {
                // Determine part based on reduced armor coverage
                const totalCoverage = botState.armorAnalyzedCoverage + coreCoverageBonus;
                let coverageHit = randomInt(0, totalCoverage - 1);

                for (partIndex = 0; partIndex < botState.parts.length; partIndex++) {
                    // Subtract part's armor analyzed coverage to see if we got a hit
                    coverageHit -= botState.parts[partIndex].armorAnalyzedCoverage
                    if (coverageHit < 0) {
                        part = botState.parts[partIndex];
                        break;
                    }

                    // If it's a core hit we'll run through all parts and exit
                    // the loop with part still equal to null
                }
            }
            else {
                // Determine part based on regular coverage
                const totalCoverage = botState.totalCoverage + coreCoverageBonus;
                let coverageHit = randomInt(0, totalCoverage - 1);

                for (partIndex = 0; partIndex < botState.parts.length; partIndex++) {
                    // Subtract part's coverage to see if we got a hit
                    coverageHit -= botState.parts[partIndex].coverage
                    if (coverageHit < 0) {
                        part = botState.parts[partIndex];
                        break;
                    }

                    // If it's a core hit we'll run through all parts and exit
                    // the loop with part still equal to null
                }
            }
        }
    }

    if (part === null) {
        partIndex = -1;
    }

    return {
        part: part,
        partIndex: partIndex,
    };
}

// Calculates a weapon's recoil based on the number of treads
export function getRecoil(weaponDef, numTreads) {
    let recoil = 0;

    // Add recoil if siege mode not active
    if ("Recoil" in weaponDef) {
        recoil += parseInt(weaponDef["Recoil"]);
        recoil -= numTreads;
    }

    // Make sure we don't have negative recoil
    return Math.max(recoil, 0);
}

const regenRegex = /Core Regeneration \((\d*)\)/;
// Gets the core regen value for a bot, otherwise 0
export function getRegen(bot) {
    const traits = valueOrDefault(bot["Traits"], []);

    for (let i = 0; i < traits.length; i++) {
        const result = regenRegex.exec(traits[i]);

        if (result != null) {
            return parseInt(result[1]);
        }
    }

    return 0;
}

// Gets the volley time given an array of ranged weapons
export function getRangedVolleyTime(weapons, cyclerModifier) {
    let volleyTime;
    if (weapons.length in volleyTimeMap) {
        volleyTime = volleyTimeMap[weapons.length];
    }
    else {
        // No additional penalty past 6 weapons
        volleyTime = 400;
    }

    weapons.forEach(weapon => {
        // Apply individual delays
        volleyTime += weapon.delay;
    });

    volleyTime *= cyclerModifier;

    // Min time is capped at 25
    return Math.trunc(Math.max(25, volleyTime));
}


// Tries to get a bot's first shielding for a specific slot
// Parts will be removed from the array if their integrity has dropped below 0
function getShieldingType(botState, slot) {
    return getDefensiveStatePart(botState.defensiveState.shieldings[slot]);
}


// Fully simulates rounds of combat to a kill a bot from an initial state
export function simulateCombat(state) {
    // Clone initial bot state
    const botState = cloneBotState(state.initialBotState);
    state.botState = botState;
    const offensiveState = state.offensiveState;
    let volleys = 0;
    state.tus = 0;

    // Update initial accuracy
    updateWeaponsAccuracy(state);

    // Update initial sneak attack state
    offensiveState.sneakAttack = offensiveState.sneakAttackStrategy === "All"
        || offensiveState.sneakAttackStrategy === "First Only";

    // Update initial momentum
    offensiveState.momentum.current = offensiveState.momentum.bonus + offensiveState.momentum.initial;

    while (botState.coreIntegrity > 0 && botState.corruption < 100) {
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
        }
        else {
            state.weapons.forEach(weapon => simulateWeapon(state, weapon));
        }

        if (volleys >= maxVolleys) {
            // Exceeded max volleys and combat will likely never complete
            // Just bail here
            return false;
        }

        // Update TUs and time based changes
        const oldTus = state.tus;
        state.tus += volleyTime;

        // Update accuracy when crossing siege mode activation
        if (!offensiveState.melee && oldTus < offensiveState.siegeBonus.tus
            && state.tus > offensiveState.siegeBonus.tus) {
            updateWeaponsAccuracy(state);
        }

        // Apply core regen
        const lastCompletedTurns = Math.trunc(oldTus / 100);
        const newCompletedTurns = Math.trunc(state.tus / 100);
        const regenIntegrity = botState.regen * (newCompletedTurns - lastCompletedTurns);

        botState.coreIntegrity = Math.min(
            botState.initialCoreIntegrity,
            botState.coreIntegrity + regenIntegrity);
    }

    // Update kill dictionaries
    if (volleys in state.killVolleys) {
        state.killVolleys[volleys] += 1;
    }
    else {
        state.killVolleys[volleys] = 1;
    }

    if (state.tus in state.killTus) {
        state.killTus[state.tus] += 1;
    }
    else {
        state.killTus[state.tus] = 1;
    }

    return true;
}

// Simulates 1 weapon's damage in a ranged volley
function simulateWeapon(state, weapon) {
    const botState = state.botState;
    const offensiveState = state.offensiveState;

    for (let i = 0; i < weapon.numProjectiles; i++) {
        // Check if the attack was a sneak attack or was a hit.
        // Technically sneak attacks can miss, but not under any realistic
        // scenario I could find. Sneak attacks force a base accuracy of 120%,
        // seemingly overriding other penalties like size or defensive 
        // utilities like Reaction Control Systems. The most it seems to 
        // take into account is -targeting, the lowest of which
        // (CR-A16's Pointy Stick) only has -20%, making this always a
        // guaranteed hit.
        const hit = (offensiveState.melee && offensiveState.sneakAttack)
            || randomInt(0, 99) < weapon.accuracy;
        if (!hit) {
            continue;
        }

        if (weapon.damageType != null) {
            // Calculate base damage, then apply overloads, momentum,
            // and sneak attacks (2)
            let damage = randomInt(weapon.damageMin, weapon.damageMax);

            // Overloading guns TODO

            // Apply momentum bonus
            // ([momentum] * [speed%] / 1200) * 40)
            if (offensiveState.melee) {
                const speedPercent = 100 / offensiveState.speed * 100;
                let momentumMultiplier = offensiveState.momentum.current * speedPercent / 1200 * 40;

                // Cap at 1-40
                momentumMultiplier = Math.trunc(momentumMultiplier);
                momentumMultiplier = Math.max(1, momentumMultiplier);
                momentumMultiplier = Math.min(40, momentumMultiplier);

                if (weapon.damageType === "Piercing") {
                    // Piercing gets double bonus (not double cap)
                    momentumMultiplier *= 2;
                }

                momentumMultiplier = (momentumMultiplier / 100) + 1;

                damage = Math.trunc(momentumMultiplier * damage);

                // Apply double damage sneak attack bonus
                if (offensiveState.sneakAttack) {
                    damage *= 2;
                }
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
            const critical = randomInt(0, 99) < weapon.critical;

            applyDamage(state, botState, damage, critical, armorAnalyzed,
                coreAnalyzed, weapon.overflow, weapon.damageType);
        }

        if (weapon.explosionType != null) {
            // Apply explosion damage (2)
            let damage = randomInt(weapon.explosionMin, weapon.explosionMax);

            // Apply resistances (6)
            damage = calculateResistDamage(botState, damage, weapon.explosionType);

            applyDamage(state, botState, damage, false, false, false,
                weapon.overflow, weapon.explosionType);
        }
    }
}

// Updates all calculated weapon accuracies
function updateWeaponsAccuracy(state) {
    const offensiveState = state.offensiveState;
    const botState = state.botState;

    let perWeaponBonus = 0;

    // Flying/hovering enemy penalty
    // TODO handle bots becoming overweight
    const botDef = botState.def;
    const movement = botDef["Movement"];
    if (movement.includes("Hovering")
        || movement.includes("Flying")) {
        perWeaponBonus -= 10;
    }

    // Subtract always avoid util (reaction control system)
    const avoidPart = getDefensiveStatePart(botState.defensiveState.avoid);
    if (avoidPart != null) {
        if (movement.includes("Walking")) {
            perWeaponBonus -= avoidPart.avoid.legs;
        }
        else {
            perWeaponBonus -= avoidPart.avoid.other;
        }
    }

    let siegeBonus = 0;

    if (offensiveState.melee) {
        // Add melee analysis bonuses
        for (let i = 0; i < meleeAnalysisAccuracy.length; i++) {
            perWeaponBonus += offensiveState.meleeAnalysis[i] * meleeAnalysisAccuracy[i];
        }
    }
    else {
        // Add (low) distance bonus
        perWeaponBonus += offensiveState.distance < 6 ?
            (6 - offensiveState.distance) * 3 :
            0;

        // Add siege bonus
        const siege = offensiveState.siegeBonus;
        if (state.tus >= siege.tus) {
            siegeBonus = siege.bonus
        }
        perWeaponBonus += siegeBonus;

        // Subtract ranged avoid util (phase shifter)
        const rangedAvoidPart = getDefensiveStatePart(botState.defensiveState.rangedAvoid);
        if (rangedAvoidPart != null) {
            perWeaponBonus -= rangedAvoidPart.rangedAvoid;
        }
    }

    state.weapons.forEach(weapon => {
        if ("Waypoints" in weapon.def) {
            // Guided weapons always have 100% accuracy
            weapon.accuracy = 100;
            return;
        }

        let accuracy = weapon.baseAccuracy + perWeaponBonus;

        if (!offensiveState.melee && siegeBonus === 0) {
            // Subtract recoil if siege mode inactive
            accuracy -= offensiveState.recoil - getRecoil(weapon.def, offensiveState.numTreads);
        }

        // Cap accuracy
        let max = offensiveState.melee ? maxRangedAccuracy : maxMeleeAccuracy;
        weapon.accuracy = Math.min(max, Math.max(accuracy, minAccuracy));
    });
}
