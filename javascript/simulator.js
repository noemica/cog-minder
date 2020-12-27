import {
    botData,
    gallerySort,
    getItem,
    getItemCategories,
    getSpoilersState,
    initData,
    itemData,
    resetButtonGroup,
    setSpoilersState,
    valueOrDefault,
} from "./common.js";

import {
    getBotDefensiveState,
    getRangedVolleyTime,
    getRecoil,
    getRegen,
    maxVolleys,
    simulateCombat,
    volleyTimeMap,
} from "./simulatorCalcs.js"; 

// import Chart from 'chart.js';

const jq = jQuery.noConflict();
jq(function ($) {
    const spoilerItemCategories = [1, 4, 5, 6];
    const redactedItemCategory = 7;

    // Actual accuracy is 60 for ranged and 70 for melee but just assume the
    // defender immobile bonus for + 10
    const initialRangedAccuracy = 70;
    const initialMeleeAccuracy = 80;

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

    // Damage reduction names
    const externalDamageReductionNameMap = {
        "0%: None": null,
        "25%: Remote Shield": "Remote Shield",
        "25%: Stasis Trap": "Stasis Trap",
        "50%: Phase Wall": "Phase Wall",
        "50%: Remote Force Field (Energy Mantle)": "Remote Force Field",
        "50%: Stasis Bubble": "Stasis Bubble",
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

    // Melee weapon types
    const meleeTypes = [
        "Impact Weapon",
        "Piercing Weapon",
        "Slashing Weapon",
        "Special Melee Weapon",
    ];

    // Ranged weapon types
    const rangedTypes = [
        "Ballistic Cannon",
        "Ballistic Gun",
        "Energy Cannon",
        "Energy Gun",
        "Launcher",
        "Special Weapon",
    ];

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
        $("#damageReductionSelect").parent().addClass("percent-dropdown");
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
        resetDropdown($("#damageReductionSelect"));
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

        func($("#combatTypeRanged"));
        func($("#combatTypeRanged > input"));
        func($("#combatTypeMelee"));
        func($("#combatTypeMelee > input"));
        func($("#numFightsInput"));
        func($("#reset"));

        func($("#botSelect").next());
        func($("#analysisNo"));
        func($("#analysisNo > input"));
        func($("#analysisYes"));
        func($("#analysisYes > input"));
        func($("#damageReductionSelect").next());

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

        const externalDamageReduction = externalDamageReductionNameMap[$("#damageReductionSelect").selectpicker("val")];
        const defensiveState = getBotDefensiveState(parts, externalDamageReduction);

        // Enemy bot state
        const botState = {
            armorAnalyzedCoverage: armorAnalyzedCoverage,
            coreCoverage: bot["Core Coverage"],
            coreIntegrity: bot["Core Integrity"],
            corruption: 0,
            def: bot,
            defensiveState: defensiveState,
            externalDamageReduction: externalDamageReduction,
            immunities: valueOrDefault(bot["Immunities"], []),
            initialCoreIntegrity: bot["Core Integrity"],
            parts: parts,
            regen: getRegen(bot),
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

                try {
                    if (!simulateCombat(state)) {
                        // Combat can only fail if we exceed max volleys
                        setStatusText(`The simulation exceeded ${maxVolleys} volleys and will likely never kill.`);
                        setSimulationRunning(false);
                        return;
                    }
                }
                catch (e) {
                    console.log(e);
                    setStatusText("The simulation encountered an unexpected error, this is a bug.");
                    setSimulationRunning(false);
                    return;
                }
            }

            if (i >= numSimulations) {
                setSimulationRunning(false);
                setStatusText("Simulations completed.");
                updateChart(state);
            }
        };

        run();
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
});