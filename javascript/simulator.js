import {
    botData,
    gallerySort,
    getItem,
    getItemCategories,
    getSpoilersState,
    initData,
    itemData,
    randomInt,
    resetButtonGroup,
    setSpoilersState,
    valueOrDefault,
} from "./common.js";

// import Chart from 'chart.js';

const jq = jQuery.noConflict();
jq(function ($) {
    const spoilerItemCategories = [1, 4, 5, 6];
    const redactedItemCategory = 7;

    // Actual accuracy is 60 for ranged and 70 for melee but just assume the
    // defender immobile bonus for + 10
    const initialRangedAccuracy = 70;
    const initialMeleeAccuracy = 80;
    const minAccuracy = 10;
    const maxRangedAccuracy = 95;
    const maxMeleeAccuracy = 100;

    // Uncomment for development type hinting
    // let chart = new Chart("");

    let cancelled = false;

    // Actuator array name to followup chance increase map
    const actuatorArrayMap = {
        "0%: None": 0,
        "10%: Actuator Array": 10,
        "12%: Imp. Actuator Array": 12,
        "16%: Adv. Actuator Array": 16,
        "20%: Exp. Actuator Array": 20,
    }

    // Actuator name to tu multiplier map
    const actuatorMap = {
        "0%: None": 1.0,
        "20%: Microactuators": 0.8,
        "30%: Nanoactuators": 0.7,
        "40%: 2 Microactuators": 0.6,
        "50%: Femtoactuators": 0.5,
    };

    // Armor integrity analyzer chance map
    const armorIntegrityMap = {
        "0%: None": 0,
        "33%: Armor Integrity Analyzer": 33,
        "50%: Imp. Armor Integrity Analyzer": 50,
        "66%: Adv. Armor Integrity Analyzer": 66,
        "90%: Exp. Armor Integrity Analyzer": 90,
    };

    // Avoidance utility name to avoid % map
    const avoidMap = {
        "Maneuvering Thrusters": { legs: 3, other: 6 },
        "Imp. Maneuvering Thrusters": { legs: 5, other: 10 },
        "Reaction Control System": { legs: 6, other: 12 },
        "Adv. Reaction Control System": { legs: 7, other: 14 },
    };

    // Charger damage increase values
    const chargerMap = {
        "0%: None": 1.00,
        "15%: Particle Charger": 1.15,
        "20%: Imp. Particle Charger": 1.20,
        "25%: Adv. Particle Charger": 1.25,
        "30%: Particle Accelerator": 1.30,
        "40%: Imp. Particle Accelerator": 1.40,
        "50%: Adv. Particle Accelerator": 1.50,
    };

    // Core analyzer to percent chance map
    const coreAnalyzerMap = {
        "0%: None": 0,
        "6%: Core Analyzer": 6,
        "8%: Imp. Core Analyzer": 8,
        "8%: Asb. Combat Suite": 8,
        "10%: Adv. Core Analyzer": 10,
        "15%: Exp. Core Analyzer": 15,
    };

    // Part name to corruption ignore chance percent
    const corruptionIgnoreMap = {
        "Dynamic Insulation System": 50,
        "Imp. Dynamic Insulation System": 67,
        "Adv. Dynamic Insulation System": 75,
    };

    // Cycler volley time multiplier map
    const cyclerMap = {
        "0%: None": 1.00,
        "15%: Weapon Cycler": 0.85,
        "20%: Imp. Weapon Cycler": 0.80,
        "25%: Adv. Weapon Cycler": 0.75,
        "30%: Exp. Weapon Cycler": 0.70,
        "50%: Quantum Capacitor": 0.50,
        "50%: Launcher Loader": 0.50,
    };

    // Part names to damage reduction (val * damage = reduced damage)
    const damageReductionMap = {
        "7V-RTL's Ultimate Field": .25,
        "AEGIS Remote Shield": .50,
        "Adv. Force Field": .50,
        "Adv. Shield Generator": .75,
        "Energy Mantle": .50,
        "Force Field": .50,
        "Imp. Energy Mantle": .50,
        "Imp. Force Field": .50,
        "Imp. Remote Force Field": .50,
        "Imp. Remote Shield": .75,
        "Remote Force Field": .50,
        "Remote Shield": .75,
        "Shield Generator": .75,
        "Vortex Field Projector": .25,
    };

    // Kinecellerator min damage increase values
    const kinecelleratorMap = {
        "0%: None": 1.00,
        "30%: Kinecellerator": 1.30,
        "40%: Imp. Kinecellerator": 1.40,
        "50%: Adv. Kinecellerator": 1.50,
    };

    // Melee analysis ids
    const meleeAnalysisIds = [
        "meleeAnalysisInput",
        "impMeleeAnalysisInput",
        "advMeleeAnalysisInput",
        "expMeleeAnalysisInput",
    ];

    // Array of melee analysis minimum damage increases
    const meleeAnalysisMinDamageIncrease = [
        2,
        3,
        4,
        6,
    ];

    // Array of melee analysis accuracy increases
    const meleeAnalysisAccuracy = [
        5,
        6,
        8,
        12,
    ];

    // Melee weapon types
    const meleeTypes = [
        "Impact Weapon",
        "Piercing Weapon",
        "Slashing Weapon",
        "Special Melee Weapon",
    ];

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

    // Range avoid util name to avoid percent
    const rangedAvoidMap = {
        "Phase Shifter": 5,
        "Imp. Phase Shifter": 10,
        "Adv. Phase Shifter": 15,
        "Exp. Phase Shifter": 20,
    };

    // Ranged weapon types
    const rangedTypes = [
        "Ballistic Cannon",
        "Ballistic Gun",
        "Energy Cannon",
        "Energy Gun",
        "Launcher",
        "Special Weapon",
    ];

    // Part names to self damage reduction (val * damage = reduced damage)
    const selfDamageReduction = {
        "1C-UTU's Buckler": .50,
        "Adv. Powered Armor": .50,
        "Imp. Powered Armor": .50,
        "Powered Armor": .50,
    };

    // Bot size mode to accuracy bonus map
    const sizeAccuracyMap = {
        "Huge": 30,
        "Large": 10,
        "Medium": 0,
        "Small": -10,
        "Tiny": -30,
    };

    // Siege mode text to accuracy bonus/TUs to activate map
    const siegeModeBonusMap = {
        "No Siege": { bonus: 0, tus: 0 },
        "In Siege Mode": { bonus: 20, tus: 0 },
        "In High Siege Mode": { bonus: 30, tus: 0 },
        "Entering Siege Mode": { bonus: 20, tus: 500 },
        "Entering High Siege Mode": { bonus: 30, tus: 500 },
    };

    // Target analyzer name to critical % chance increase
    const targetAnalyzerMap = {
        "0%: None": 0,
        "5%: Target Analyzer": 5,
        "6%: Imp. Target Analyzer": 6,
        "8%: Adv. Target Analyzer": 8,
        "12%: Exp. Target Analyzer": 12,
    };

    // Weapon number to base volley time map
    const volleyTimeMap = {
        1: 200,
        2: 300,
        3: 325,
        4: 350,
        5: 375,
        6: 400,
    };

    $(document).ready(() => {
        init();
    });

    // Adds a new weapon select dropdown with an optional weapon name
    function addWeaponSelect(weaponName) {
        const spoilersState = getSpoilersState();
        const container = $("#weaponSelectContainer");

        const melee = isMelee();
        const types = melee ? meleeTypes : rangedTypes;
        const weapons = [];
        Object.keys(itemData).forEach(name => {
            const item = itemData[name];

            // Slot check
            if (item["Slot"] !== "Weapon") {
                return;
            }

            // Ranged/melee type check
            if (!types.includes(item["Type"])) {
                return;
            }

            // Damage check
            if (item["Damage Type"] === "Special") {
                return;
            }

            // Spoilers check
            if (spoilersState === "None") {
                // No spoilers, check that none of the categories are spoilers/redacted
                const categories = getItemCategories(name);
                if (categories.every(c => c != redactedItemCategory && !spoilerItemCategories.includes(c))) {
                    weapons.push(name);
                }
            }
            else if (spoilersState == "Spoilers") {
                // Spoilers allowed, check only for redacted category
                const categories = getItemCategories(name);
                if (categories.every(c => c != redactedItemCategory)) {
                    weapons.push(name);
                }
            }
            else {
                // Redacted, no checks
                weapons.push(name);
            }
        });

        // Sort and create weapon option HTML elements
        weapons.sort(gallerySort);
        const weaponOptions = weapons.map(w => `<option>${w}</option>`).join();

        // Add elements
        const parent = $('<div class="input-group mt-1"></div>');
        const selectLabel = $('<span class="input-group-text" data-toggle="tooltip" title="Name of an equipped weapon to fire">Weapon</span>');
        const select = $(`<select class="selectpicker" data-live-search="true">${weaponOptions}</select>`);
        const numberLabel = $(`
        <div class="input-group-prepend ml-2" data-toggle="tooltip" title="How many weapons of this type to have equipped.">
            <span class="input-group-text">Number</span>
        </div>`);
        const number = $('<input class="form-control" placeholder="1"></input>');
        const deleteButton = $('<button class="btn ml-2" data-toggle="tooltip" title="Removes the weapon.">X</button>');

        container.append(parent);
        parent.append(selectLabel);
        parent.append(select);
        parent.append(numberLabel);
        parent.append(number);
        parent.append(deleteButton);

        deleteButton.tooltip();
        deleteButton.on("click", () => {
            // Ensure the last dropdown is always empty
            if (parent.next().length === 0) {
                addWeaponSelect("");
            }

            // Remove the associated item
            select.selectpicker("destroy");
            deleteButton.tooltip("hide");
            parent.remove();
            parent.children().remove();
        });

        select.selectpicker("val", weaponName);

        // Add changed event
        select.on("changed.bs.select", () => {
            if (parent.next().length === 0) {
                addWeaponSelect("");
            }
        });

        select.parent().addClass("weapon-dropdown");

        // Enable tooltips
        deleteButton.tooltip();
        numberLabel.tooltip();
        selectLabel.tooltip();

        // Minor hack, the btn-light class is auto-added to dropdowns with search 
        // but it doesn't really fit with everything else
        parent.find(".btn-light").removeClass("btn-light");
    }

    // Calculates the resisted damage for a bot given the initial damage value
    function calculateResistDamage(botState, damage, damageType) {
        if (damageType in botState.resistances) {
            return Math.trunc(damage * (1 - (botState.resistances[damageType] / 100)));
        }

        return damage;
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

    // Tries to get a bot's first shielding for a specific slot
    // Parts will be removed from the array if their integrity has dropped below 0
    function getShieldingType(botState, slot) {
        return getDefensiveStatePart(botState.defensiveState.shieldings[slot]);
    }

    // Calculates a weapon's recoil based on the number of treads
    function getRecoil(weaponDef, numTreads) {
        let recoil = 0;

        // Add recoil if siege mode not active
        if ("Recoil" in weaponDef) {
            recoil += parseInt(weaponDef["Recoil"]);
            recoil -= numTreads;
        }

        // Make sure we don't have negative recoil
        return Math.max(recoil, 0);
    }

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
            parts: botState.parts.map(p => {
                return {
                    armorAnalyzedCoverage: p.armorAnalyzedCoverage,
                    coverage: p.coverage,
                    def: p.def,
                    integrity: p.integrity,
                    protection: p.protection,
                }
            }),
            resistances: botState.resistances,
            totalCoverage: botState.totalCoverage,
        }
        newState.defensiveState = getBotDefensiveState(newState.parts);

        return newState;
    }

    // Gets the number of simulations to perform
    function getNumSimulations() {
        const stringValue = $("#numFightsInput").val().replace(",", "");
        return (parseIntOrDefault(stringValue, 100000));
    }

    // Gets the string representing the number of simulations
    function getNumSimulationsString() {
        const number = getNumSimulations();
        return Number(number).toLocaleString("en");
    }

    // Returns a bot's defensive state based on parts, also adds new relevant 
    // properties to parts
    // Adding ad-hoc properties is a little messy but making a bunch of wrapper
    // objects wouldn't really do very much
    function getBotDefensiveState(parts) {
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

        // TODO sort damage reduction (11)
        // 11. Apply the first and only first defense applicable from the 
        // following list: phase wall, 75% personal shield (VFP etc), 
        // Force Field, Shield Generator, stasis bubble, active Stasis Trap,
        // Remote Shield, 50% remote shield (Energy Mantle etc.), Hardlight Generator.
        // All other parts should technically be sorted as well.
        // However, in game no bot ever has duplicate mixed-level defenses,
        // the most is for things like 2 base weapon shieldings on Warbot which
        // doesn't require sorting anyways.

        return state;
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

    // Gets the volley time given an array of ranged weapons
    function getRangedVolleyTime(weapons, cyclerModifier) {
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

    // Initialize the page state
    async function init() {
        await initData();

        // Load spoilers saved state
        $("#spoilers").text(getSpoilersState());

        // Set initial state
        resetButtonGroup($("#combatTypeContainer"));
        resetValues();
        updateChoices();

        // Register handlers
        $("#spoilersDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilersState(state);
            $("#spoilersDropdown > button").tooltip("hide");
            updateChoices();
        });
        $("#reset").click(() => {
            $("#reset").tooltip("hide");
            resetValues();
        });
        $("#combatTypeContainer > label > input").on("click", () => {
            updateChoices();
        });
        $("#simulateButton").click(() => {
            simulate();
        });
        $("#cancelButton").click(() => {
            cancelled = true;
        });

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            if ($(e.target).parents(".popover").length === 0 && $(".popover").length >= 1) {
                $('[data-toggle="popover"]').not(e.target).popover("hide");
            }
        });

        $("#cancelButton").addClass("not-visible");

        // Enable tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // These divs are created at runtime so have to do this at init
        $("#botSelectContainer > div").addClass("enemy-dropdown");
        $("#siegeSelectContainer > div").addClass("siege-dropdown");
        $("#chargerSelect").parent().addClass("percent-dropdown");
        $("#kinecelleratorSelect").parent().addClass("percent-dropdown");
        $("#cyclerSelect").parent().addClass("percent-dropdown");
        $("#armorIntegSelect").parent().addClass("percent-dropdown");
        $("#coreAnalyzerSelect").parent().addClass("percent-dropdown");
        $("#targetAnalyzerSelect").parent().addClass("percent-dropdown");
        $("#actuatorSelect").parent().addClass("percent-dropdown");
        $("#actuatorArraySelect").parent().addClass("percent-dropdown");
        $("#sneakAttackSelect").parent().addClass("sneak-attack-dropdown");

        initChart();
    }

    // Initializes the chart with default settings and no data
    function initChart() {
        function getDatasetSettings(label, backgroundColor, borderColor) {
            return {
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                label: label,
                pointRadius: 5,
                pointHitRadius: 25,
                showLine: true,
                steppedLine: "middle",
            }
        }

        const volleyDataset = getDatasetSettings(
            "Current volley kill %",
            "rgba(0, 98, 0, 0.3)",
            "rgba(0, 196, 0, 1)");
        const cumulativeDataset = getDatasetSettings(
            "Cumulative kill %",
            "rgba(96, 96, 96, 0.3)",
            "rgba(128, 128, 128, 1)");

        const chartElement = $("#chart");
        chart = new Chart(chartElement, {
            type: 'scatter',
            data: {
                datasets: [
                    volleyDataset,
                    cumulativeDataset,
                ],
            },
            options: {
                legend: {
                    labels: {
                        fontSize: 16,
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Number of volleys",
                            fontSize: 24,
                        },
                        ticks: {
                            min: 0,
                            stepSize: 1,
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "rgba(128, 128, 128, 0.8)",
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Percent of kills",
                            fontSize: 24,
                        },
                        ticks: {
                            beginAtZero: true,
                            callback: (value, index, values) => value + "%",
                        },
                    }],
                },
                title: {
                    display: true,
                    text: `Simulated volleys/kill`,
                    fontSize: 24,
                }
            },
        });
    }

    // Checks if the combat type is melee or ranged
    function isMelee() {
        return $("#combatTypeMelee").hasClass("active");
    }


    // Attempts to parse an int from the string, otherwise uses the default value
    function parseIntOrDefault(string, defaultVal) {
        const value = parseInt(string);
        if (isNaN(value)) {
            return defaultVal;
        }

        return value;
    }

    // Resets a dropdown to the first item
    function resetDropdown(dropdown) {
        dropdown.selectpicker("val", dropdown.children().val());
    }

    // Resets all values
    function resetValues() {
        // Reset button groups
        resetButtonGroup($("#analysisContainer"));
        resetButtonGroup($("#movedContainer"));
        resetButtonGroup($("#siegeModeContainer"));

        // Reset dropdowns
        resetDropdown($("#siegeSelect"));
        resetDropdown($("#chargerSelect"));
        resetDropdown($("#kinecelleratorSelect"));
        resetDropdown($("#cyclerSelect"));
        resetDropdown($("#armorIntegSelect"));
        resetDropdown($("#coreAnalyzerSelect"));
        resetDropdown($("#targetAnalyzerSelect"));
        resetDropdown($("#actuatorSelect"));
        resetDropdown($("#actuatorArraySelect"));
        resetDropdown($("#sneakAttackSelect"));

        // Reset text inputs
        $("#distanceInput").val("");
        $("#numFightsInput").val("");
        $("#targetingInput").val("");
        $("#treadsInput").val("");
        $("#meleeAnalysisContainer > input").val("");
        $("#speedInput").val("");
        $("#bonusMomentumInput").val("");
        $("#initialMomentumInput").val("");

        // Reset with 1 preset weapon and one empty one
        $("#weaponSelectContainer").empty();

        const defaultWeapon = isMelee() ? "Mining Claw" : "Lgt. Assault Rifle";
        addWeaponSelect(defaultWeapon);
        addWeaponSelect("");

        setStatusText("");

        $("#chart").addClass("not-visible");
    }

    // Sets controls to disabled/enabled based on if the simulation is running
    function setSimulationRunning(running) {
        function setEnabled(selector) {
            selector.removeClass("disabled");
            selector.prop("disabled", false);
        }
        function setDisabled(selector) {
            selector.addClass("disabled");
            selector.prop("disabled", true);
        }
        let func = running ? setDisabled : setEnabled;

        func($("#spoilers"));

        func($("#numFightsInput"));
        func($("#reset"));
        func($("#analysisNo"));
        func($("#analysisNo > input"));
        func($("#analysisYes"));
        func($("#analysisYes > input"));
        func($("#botSelect").next());

        func($("#combatTypeRanged"));
        func($("#combatTypeRanged > input"));
        func($("#combatTypeMelee"));
        func($("#combatTypeMelee > input"));

        func($("#targetingInput"));
        func($("#siegeSelect").next());
        func($("#treadsInput"));
        func($("#distanceInput"));
        func($("#chargerSelect").next());
        func($("#kinecelleratorSelect").next());
        func($("#cyclerSelect").next());

        func($("#meleeAnalysisContainer > input"));
        func($("#actuatorSelect").next());
        func($("#actuatorArraySelect").next());
        func($("#bonusMomentumInput"));
        func($("#initialMomentumInput"));
        func($("#speedInput"));
        func($("#sneakAttackSelect").next());

        func($("#armorIntegSelect").next());
        func($("#coreAnalyzerSelect").next());
        func($("#targetAnalyzerSelect").next());

        func($("#weaponSelectContainer button"));
        func($("#weaponSelectContainer input"));

        // Update the cancel/simulate buttons
        if (running) {
            $("#cancelButton").removeClass("not-visible");
            $("#simulateButton").addClass("not-visible");
        }
        else {
            $("#cancelButton").addClass("not-visible");
            $("#simulateButton").removeClass("not-visible");
        }
    }

    // Sets the status label to the specified value
    function setStatusText(text) {
        $("#statusText").text(text);
    }

    // Simulates combat with the current settings and updates the chart (simulate button entry point)
    function simulate() {
        // Check inputs first
        const botName = $("#botSelect").selectpicker("val");
        const weaponDefs = [];
        $("#weaponSelectContainer select").each((_, s) => {
            const name = $(s).selectpicker("val");
            if (name in itemData) {
                const weapon = itemData[name];

                // Tread invalid or unfilled numbers as 1
                const number = parseIntOrDefault($(s).parent().nextAll("input").val(), 1);

                for (let i = 0; i < number; i++) {
                    weaponDefs.push(weapon);
                }
            }
        });

        if (!(botName in botData)) {
            setStatusText(`Bot ${botName} is invalid, this is probably a bug.`);
            return;
        }

        if (weaponDefs.length === 0) {
            setStatusText("There must be at least 1 weapon.");
            return;
        }

        // Set up initial calculation state
        const bot = botData[botName];
        const parts = [];
        bot["Components Data"].concat(bot["Armament Data"]).forEach(item => {
            for (let i = 0; i < item["Number"]; i++) {
                const itemDef = getItem(item["Name"]);
                const isProtection = itemDef["Type"] === "Protection";
                const coverage = parseInt(itemDef["Coverage"]);
                parts.push({
                    armorAnalyzedCoverage: isProtection ? 0 : coverage,
                    coverage: coverage,
                    def: itemDef,
                    integrity: parseInt(itemDef["Integrity"]),
                    protection: isProtection,
                });
            }
        });

        const armorAnalyzedCoverage = bot["Core Coverage"] +
            parts.reduce((prev, part) => prev + part.armorAnalyzedCoverage, 0);

        const defensiveState = getBotDefensiveState(parts);

        // Enemy bot state
        const botState = {
            armorAnalyzedCoverage: armorAnalyzedCoverage,
            coreCoverage: bot["Core Coverage"],
            coreIntegrity: bot["Core Integrity"],
            corruption: 0,
            def: bot,
            defensiveState: defensiveState,
            immunities: valueOrDefault(bot["Immunities"], []),
            parts: parts,
            resistances: valueOrDefault(bot["Resistances"], []),
            totalCoverage: bot["Total Coverage"],
        }

        // Weapons and other offensive state
        const melee = isMelee();
        const numTreads = parseIntOrDefault($("#treadsInput").val(), 0);

        // Accuracy bonuses and penalties
        const siegeBonus = melee ? null : siegeModeBonusMap[$("#siegeSelect").selectpicker("val")];
        let targetingComputerBonus = 0;
        if (!melee) {
            targetingComputerBonus = parseIntOrDefault($("#targetingInput").val(), 0);
        }

        const meleeAnalysis = [0, 0, 0, 0];
        if (melee) {
            // Melee analysis types
            meleeAnalysisIds.map((id, i) => {
                meleeAnalysis[i] = parseIntOrDefault($(`#${id}`).val(), 0);
            });
        }

        // Invalid / 6 or more tiles = 0 bonus
        let distance = parseIntOrDefault($("#distanceInput").val(), 6);
        if (distance <= 1) {
            // Less than or equal to 1, just assign to 1
            distance = 1;
        }

        const allRecoil = weaponDefs.reduce((prev, weapon) =>
            getRecoil(weapon, numTreads) + prev, 0);

        // Target Analyzer crit bonus
        const targetAnalyzerName = $("#targetAnalyzerSelect").selectpicker("val");
        const critBonus = targetAnalyzerMap[targetAnalyzerName];

        const weapons = weaponDefs.map((weapon, i) => {
            let damageMin = 0;
            let damageMax = 0;
            let damageType = null;
            let explosionMin = 0;
            let explosionMax = 0;
            let explosionType = null;

            if ("Damage" in weapon) {
                // Found regular damage
                if (weapon["Damage"].includes("-")) {
                    const split = weapon["Damage"].split("-");
                    damageMin = parseInt(split[0]);
                    damageMax = parseInt(split[1]);
                }
                else {
                    damageMin = parseInt(weapon["Damage"]);
                    damageMax = damageMin;
                }

                if (weapon["Type"] === "Ballistic Gun" || weapon["Type"] === "Ballistic Cannon") {
                    // Increase minimum damage for kinecellerators (2)
                    const kinecelleratorName = $("#kinecelleratorSelect").selectpicker("val");
                    const kinecelleratorBonus = kinecelleratorMap[kinecelleratorName];

                    // Double damage for overloading (2)
                    // TODO

                    // Ensure min damage can't exceed max
                    damageMin = Math.min(Math.trunc(damageMin * kinecelleratorBonus), damageMax);
                }
                else if (melee) {
                    // Apply damage for melee analyses (2)
                    let minDamageIncrease = 0;
                    for (let i = 0; i < meleeAnalysisMinDamageIncrease.length; i++) {
                        minDamageIncrease += meleeAnalysis[i] * meleeAnalysisMinDamageIncrease[i];
                    }

                    // Ensure min damage can't exceed max
                    damageMin = Math.min(minDamageIncrease + damageMin, damageMax);
                }

                damageType = weapon["Damage Type"];
            }

            if ("Explosion Damage" in weapon) {
                // Found explosion damage
                if (weapon["Explosion Damage"].includes("-")) {
                    const split = weapon["Explosion Damage"].split("-");
                    explosionMin = parseInt(split[0]);
                    explosionMax = parseInt(split[1]);
                }
                else {
                    explosionMin = parseInt(weapon["Explosion Damage"]);
                    explosionMax = explosionMin;
                }

                explosionType = weapon["Explosion Type"];
            }

            // Get crit chance, only apply target analyzer if there's a specific bonus
            const critical = "Critical" in weapon ? parseInt(weapon["Critical"]) + critBonus : 0;

            // Calculate base accuracy that can't change over the course of the fight
            let baseAccuracy = melee ? initialMeleeAccuracy : initialRangedAccuracy;

            if (!melee) {
                baseAccuracy += targetingComputerBonus + (2 * numTreads);
            }

            // Size bonus/penalty
            if (bot["Size"] in sizeAccuracyMap) {
                baseAccuracy += sizeAccuracyMap[bot["Size"]];
            }
            else {
                console.log(`${botName} has invalid size ${bot["Size"]}`);
            }

            // Builtin targeting
            if ("Targeting" in weapon) {
                baseAccuracy += parseInt(weapon["Targeting"])
            }

            const delay = parseIntOrDefault(weapon["Delay"], 0);

            // Follow-up attacks on melee gain a 10% bonus to targeting
            const followUp = melee && i != 0;
            if (followUp) {
                baseAccuracy += 10;
            }

            return {
                accelerated: weapon["Type"] === "Energy Gun" || weapon["Type"] === "Energy Cannon",
                baseAccuracy: baseAccuracy,
                critical: critical,
                damageMin: damageMin,
                damageMax: damageMax,
                damageType: damageType,
                def: weapon,
                delay: delay,
                explosionMin: explosionMin,
                explosionMax: explosionMax,
                explosionType: explosionType,
                overflow: !weapon["Type"].includes("Gun"),
                numProjectiles: "Projectile Count" in weapon ? parseInt(weapon["Projectile Count"]) : 1,
            };
        });

        // Charger bonus
        const chargerName = $("#chargerSelect").selectpicker("val");
        const chargerBonus = chargerMap[chargerName];

        // Armor Integrity Analyzer chance
        const armorAnalyzerName = $("#armorIntegSelect").selectpicker("val");
        const armorAnalyzerChance = armorIntegrityMap[armorAnalyzerName];

        // Core Analyzer chance
        const coreAnalyzerName = $("#coreAnalyzerSelect").selectpicker("val");
        const coreAnalyzerChance = coreAnalyzerMap[coreAnalyzerName];

        // Actuator Array chance
        const actuatorArrayName = $("#actuatorArraySelect").selectpicker("val");
        const actuatorArrayBonus = actuatorArrayMap[actuatorArrayName];

        // Calculate followup chance
        const followupChances = [];
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
        const speed = parseIntOrDefault($("#speedInput").val(), 100);

        // Get momentum
        const bonusMomentum = parseIntOrDefault($("#bonusMomentumInput").val(), 0);
        const initialMomentum = parseIntOrDefault($("#initialMomentumInput").val(), 0);

        // Determine sneak attack strategy
        const sneakAttackStrategy = $("#sneakAttackSelect").selectpicker("val");

        // Calculate total (ranged) or initial (melee) volley time
        const volleyTimeModifier = melee ?
            actuatorMap[$("#actuatorSelect").selectpicker("val")] :
            cyclerMap[$("#cyclerSelect").selectpicker("val")];

        const volleyTime = melee ?
            weapons[0].delay + volleyTimeMap[1] :
            getRangedVolleyTime(weapons, volleyTimeModifier);

        // Other misc offensive state
        const offensiveState = {
            armorAnalyzerChance: armorAnalyzerChance,
            analysis: $("#analysisYes").hasClass("active"),
            chargerBonus: chargerBonus,
            coreAnalyzerChance: coreAnalyzerChance,
            distance: distance,
            followupChances: followupChances,
            melee: melee,
            meleeAnalysis: meleeAnalysis,
            momentum: {
                bonus: bonusMomentum,
                current: bonusMomentum + initialMomentum,
                initial: initialMomentum,
            },
            numTreads: numTreads,
            recoil: allRecoil,
            siegeBonus: siegeBonus,
            sneakAttack: false,
            sneakAttackStrategy: sneakAttackStrategy,
            speed: speed,
            targetingComputerBonus: targetingComputerBonus,
            volleyTime: volleyTime,
            volleyTimeModifier: volleyTimeModifier,
        };

        // Overall state
        const state = {
            initialBotState: botState,
            killTus: {},
            killVolleys: {},
            offensiveState: offensiveState,
            tus: 0,
            weapons: weapons
        };

        // Disable all input fields while the simulation is running
        setSimulationRunning(true);

        // Run simulation
        cancelled = false;
        let i = 0;
        const numSimulations = getNumSimulations();
        let lastFrame = performance.now();

        // Run simulation in batches via setTimeout to avoid UI lockup.
        // Each 100 simulations check if we've surpassed 30 ms since the last
        // update, if so then pass control back so events/updates can be processed.
        function run() {
            for (; i < numSimulations; i++) {
                if (i % 100 === 0) {
                    if (cancelled) {
                        // User cancelled
                        setStatusText("Cancelled simulation");
                        cancelled = false;
                        setSimulationRunning(false);
                        return;
                    }

                    const now = performance.now();
                    if (now - lastFrame > 30) {
                        lastFrame = now;
                        setStatusText(`${i} out of ${numSimulations} completed.`);
                        setTimeout(run, 0);
                        break;
                    }
                }

                simulateCombat(state);
            }

            if (i >= numSimulations) {
                setSimulationRunning(false);
                setStatusText("Simulations completed.");
                updateChart(state);
            }
        };

        run();
    }

    // Fully simulates rounds of combat to a kill a bot from an initial state
    function simulateCombat(state) {
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
                state.tus += volleyTime;

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

                const oldTus = state.tus;
                state.tus += volleyTime;

                // Update accuracy when crossing siege mode activation
                if (oldTus < offensiveState.siegeBonus.tus
                    && state.tus > offensiveState.siegeBonus.tus) {
                    updateWeaponsAccuracy(state);
                }
            }
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

    // Updates the chart based on the current simulation state
    function updateChart(state) {
        // Get datasets
        const perVolleyDataset = chart.data.datasets[0];
        const cumulativeDataset = chart.data.datasets[1];
        const numSimulations = getNumSimulations();

        // Calculate data, round to .1% and ignore values <.1% to avoid clutter
        const perVolleyData = Object.keys(state.killVolleys)
            .filter(numVolleys => state.killVolleys[numVolleys] / numSimulations > .001)
            .map(numVolleys => {
                return {
                    x: numVolleys,
                    y: Math.round(state.killVolleys[numVolleys] / numSimulations * 10000) / 100,
                }
            });

        // Add a 0 kill ending point
        perVolleyData.push({
            x: parseInt(perVolleyData[perVolleyData.length - 1].x) + 1,
            y: 0
        });

        const cumulativeData = [];
        let total = 0;
        perVolleyData.forEach(point => {
            total += point.y;
            cumulativeData.push({
                x: point.x,
                y: Math.round(total * 100) / 100,
            });
        });

        // Update chart
        perVolleyDataset.data = perVolleyData;
        cumulativeDataset.data = cumulativeData;

        chart.options.title.text = `Simulated volleys/kill vs. ${$("#botSelect").selectpicker("val")}: (${getNumSimulationsString()} fights)`;
        chart.update();
        $("#chart").removeClass("not-visible");
    }

    // Updates the available choices for the dropdowns depending on spoiler state and combat type
    function updateChoices() {
        const spoilersState = getSpoilersState();

        // Update all bot selections after saving old pick
        const select = $("#botSelect");
        const oldBot = select.selectpicker("val");
        select.empty();

        Object.keys(botData).forEach(name => {
            const bot = botData[name];

            if (bot["Categories"].some(c => c === "Spoilers")) {
                // Spoiler bots allowed for spoilers/redacted
                if ((spoilersState === "Spoilers" || spoilersState === "Redacted")) {
                    select.append(`<option>${name}</option>`);
                }
            }
            else if (bot["Categories"].some(c => c === "Redacted")) {
                // Redacted bots only allowed for spoilers/redacted
                if (spoilersState === "Redacted") {
                    select.append(`<option>${name}</option>`);
                }
            }
            else {
                // Non-spoiler bot always allowed
                select.append(`<option>${name}</option>`);
            }
        });

        select.selectpicker("refresh");

        // Try to preserve the old bot, otherwise default
        select.selectpicker("val", oldBot);

        if (select.selectpicker("val") === null) {
            select.selectpicker("val", "G-34 Mercenary");
        }

        // Minor hack, the btn-light class is auto-added to dropdowns with search 
        // but it doesn't really fit with everything else
        $(".btn-light").removeClass("btn-light");

        const melee = isMelee();

        function setVisibility(selector, visible) {
            visible ?
                selector.removeClass("not-visible") :
                selector.addClass("not-visible")
        }

        setVisibility($("#rangedAccuracyContainer"), !melee);
        setVisibility($("#rangedUtilitiesContainer"), !melee);
        setVisibility($("#meleeAnalysisContainer"), melee);
        setVisibility($("#meleeBehaviorContainer"), melee);
        setVisibility($("#meleeUtilitiesContainer"), melee);

        // Reset with 1 preset weapon and one empty one
        const defaultWeapon = melee ? "Mining Claw" : "Lgt. Assault Rifle";
        $("#weaponSelectContainer").empty();
        addWeaponSelect(defaultWeapon);
        addWeaponSelect("");
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
});