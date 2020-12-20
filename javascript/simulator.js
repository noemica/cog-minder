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

    // Actual accuracy is 60 but assume the defender immobile bonus for + 10
    const initialAccuracy = 70;
    const minAccuracy = 10;
    const maxRangedAccuracy = 95;
    const maxMeleeAccuracy = 100;

    // Uncomment for development type hinting
    let chart = new Chart("");

    // Armor integrity analyzer chance map
    const armorIntegrityMap = {
        "0%: None": 0,
        "33%: Armor Integrity Analyzer": 33,
        "50%: Imp. Armor Integrity Analyzer": 50,
        "66%: Adv. Armor Integrity Analyzer": 66,
        "90%: Exp. Armor Integrity Analyzer": 90,
    }

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
        "10%: Adv. Core Analyzer": 10,
        "15%: Exp. Core Analyzer": 15,
        "8%: Asb. Combat Suite": 8,
    }

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

    // Kinecellerator min damage increase values
    const kinecelleratorMap = {
        "0%: None": 1.00,
        "30%: Kinecellerator": 1.30,
        "40%: Imp. Kinecellerator": 1.40,
        "50%: Adv. Kinecellerator": 1.50,
    };

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

    // Siege mode ID to accuracy bonus map
    const siegeModeBonusMap = {
        "siegeModeNone": 0,
        "siegeModeStandard": 20,
        "siegeModeHigh": 30,
    };

    // Target analyzer name to critical % chance increase
    const targetAnalyzerMap = {
        "0%: None": 0,
        "5%: Target Analyzer": 5,
        "6%: Imp. Target Analyzer": 6,
        "8%: Adv. Target Analyzer": 8,
        "12%: Exp. Target Analyzer": 12,
    }

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

    // Adds a new weapon select dropdown
    function addWeaponSelect() {
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
                addWeaponSelect();
            }

            // Remove the associated item
            select.selectpicker("destroy");
            deleteButton.tooltip("hide");
            parent.remove();
            parent.children().remove();
        });

        select.selectpicker("val", "");
        // select.selectpicker("val", "Lgt. Assault Rifle");
        // select.selectpicker("val", "Mni. Grenade Launcher");

        // Add changed event
        select.on("changed.bs.select", () => {
            if (parent.next().length === 0) {
                addWeaponSelect();
            }
        });

        // Update dropdown
        select.selectpicker("refresh");

        // Enable tooltips
        deleteButton.tooltip();
        numberLabel.tooltip();
        selectLabel.tooltip();

        // Minor hack, the btn-light class is auto-added to dropdowns with search 
        // but it doesn't really fit with everything else
        parent.find(".btn-light").removeClass("btn-light");
    }

    // Applies damage to a bot
    function applyDamage(botState, damage, critical, armorAnalyzed, coreAnalyzed, canOverflow, type) {
        const chunks = [];

        // Split into chunks each containing originalDamage for other calcs (10)
        if (type === "Explosive") {
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
                    forceCore: false,
                    originalDamage: Math.floor(damage / numChunks),
                });
            }
        }
        else {
            // Non-explosive damage is done in a single chunk unless core analyzer proc (8)
            if (coreAnalyzed
                && !botState.immunities.includes("Criticals")
                && !botState.immunities.includes("Coring")) {
                let chunkDamage = Math.floor(damage / 2);

                chunks.push({
                    armorAnalyzed: armorAnalyzed,
                    originalDamage: chunkDamage,
                    critical: critical,
                    forceCore: false,
                });
                chunks.push({
                    armorAnalyzed: false,
                    originalDamage: chunkDamage,
                    critical: false,
                    forceCore: true,
                });
            }
            else {
                chunks.push({
                    armorAnalyzed: armorAnalyzed,
                    originalDamage: damage,
                    critical: critical,
                    forceCore: false,
                });
            }
        }

        chunks.forEach(chunk => {
            // Check for additional damage reduction (11)
            // TODO
            chunk.damage = chunk.originalDamage;
        });

        function applyDamageChunk(damage, critical, isOverflow, forceCore, armorAnalyzed) {
            // Determine hit part (14)
            const { part, partIndex } = getHitPart(botState, isOverflow, forceCore, armorAnalyzed);

            // Handle core hit
            if (part === null) {
                // Check for crit immunity or shielding (15)
                // Shielding TODO
                if (critical) {
                    critical = !botState.immunities.includes("Criticals")
                        && !botState.immunities.includes("Coring");
                }

                if (critical) {
                    botState.coreIntegrity = 0;
                }
                else {
                    botState.coreIntegrity -= damage;
                }

                return;
            }

            // Check for crit immunity or shielding (15)
            // Shielding TODO
            if (critical) {
                critical = !botState.immunities.includes("Criticals");
            }

            // Check for spectrum engine explosion (17)
            // TODO

            // Protection can't get crit, only receives 20% more damage
            if (critical && part.protection) {
                critical = false;
                damage = Math.floor(1.2 * damage);
            }

            if (part.integrity <= damage || critical) {
                // Part destroyed, remove part
                botState.parts.splice(partIndex, 1);
                botState.armorAnalyzedCoverage -= part.armorAnalyzedCoverage;
                botState.totalCoverage -= part.coverage;

                if (part.integrity < damage && !part.protection && canOverflow && !critical) {
                    // Handle overflow damage if excess damage was dealt 
                    // against a non-protection part
                    applyDamageChunk(damage - part.integrity, false, true, false);
                }
                return;
            }
            else {
                // Part not destroyed, just subtract integrity
                part.integrity -= damage;
                return;
            }
        }

        // Apply damage 
        chunks.forEach(chunk => {
            applyDamageChunk(chunk.damage, chunk.critical, false, chunk.forceCore, chunk.armorAnalyzed);

            // Apply corruption (23)
            if (type === "Electromagnetic") {
                const corruptionPercent = randomInt(50, 150) / 100;
                const corruption = chunk.originalDamage * corruptionPercent;
                botState.corruption += corruption;
            }
        });
    }

    // Returns a clone of a bot state
    // This is not a deep copy, any fields that can be modified are deep-copied
    // but immutable fields are not.
    function cloneBotState(botState) {
        return {
            armorAnalyzedCoverage: botState.armorAnalyzedCoverage,
            coreCoverage: botState.coreCoverage,
            coreIntegrity: botState.coreIntegrity,
            corruption: botState.corruption,
            immunities: botState.immunities,
            parts: botState.parts.map(p => {
                return {
                    armorAnalyzedCoverage: p.armorAnalyzedCoverage,
                    coverage: p.coverage,
                    integrity: p.integrity,
                    protection: p.protection,
                }
            }),
            resistances: botState.resistances,
            totalCoverage: botState.totalCoverage,
        }
    }

    // Gets the number of simulations to perform
    function getNumSimulations() {
        const stringValue = $("#numFightsInput").val().replace(",", "");
        let value = parseInt(stringValue);
        if (isNaN(value)) {
            value = 100000;
        }

        return value;
    }

    // Gets the string representing the number of simulations
    function getNumSimulationsString() {
        const number = getNumSimulations();
        return Number(number).toLocaleString("en");
    }

    // Determines the part that was hit by an attack
    function getHitPart(botState, isOverflow, forceCore, armorAnalyzed) {
        let part = null;
        let partIndex;

        if (forceCore) {
            // Keep part null for core hit
            partIndex = -1;
        }
        else {
            if (isOverflow) {
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
                    }

                    partIndex = botState.parts.indexOf(part);
                }
            }

            if (part === null) {
                if (armorAnalyzed) {
                    // Determine part based on reduced armor coverage
                    let coverageHit = randomInt(0, botState.armorAnalyzedCoverage - 1);

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
                    let coverageHit = randomInt(0, botState.totalCoverage - 1);

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

        return {
            part: part,
            partIndex: partIndex,
        };
    }

    // Gets the volley time given an array of ranged weapons
    function getRangedVolleyTime(weapons) {
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

        const cyclerModifier = cyclerMap[$("#cyclerSelect").selectpicker("val")];
        volleyTime *= cyclerModifier;

        // Min time is capped at 25
        return Math.max(25, volleyTime);
    }

    // Initialize the page state
    async function init() {
        await initData();

        // Load spoilers saved state
        $("#spoilers").text(getSpoilersState());

        // Set initial state
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

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            if ($(e.target).parents(".popover").length === 0 && $(".popover").length >= 1) {
                $('[data-toggle="popover"]').not(e.target).popover("hide");
            }
        });

        // Enable tooltips
        $('[data-toggle="tooltip"]').tooltip();

        initChart();
    }

    // TODO - move
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
            "rgba(0, 98, 0, 0.2)",
            "rgba(0, 136, 0, 1)");
        const cumulativeDataset = getDatasetSettings(
            "Cumulative kill %",
            "rgba(64, 64, 64, 0.2)",
            "rgba(32, 32, 32, 1)");

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
                        scaleLabel: {
                            display: true,
                            labelString: "Percent of kills",
                            fontSize: 24,
                        },
                        ticks: {
                            beginAtZero: true,
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

    // Resets a dropdown to the first item
    function resetDropdown(dropdown) {
        dropdown.selectpicker("val", dropdown.children().val());
    }

    // Resets all values
    function resetValues() {
        // Reset button groups
        resetButtonGroup($("#analysisContainer"));
        resetButtonGroup($("#combatTypeContainer"));
        resetButtonGroup($("#siegeModeContainer"));

        // Reset dropdowns
        resetDropdown($("#chargerSelect"));
        resetDropdown($("#kinecelleratorSelect"));
        resetDropdown($("#cyclerSelect"));
        resetDropdown($("#armorIntegSelect"));
        resetDropdown($("#coreAnalyzerSelect"));
        resetDropdown($("#targetAnalyzerSelect"));

        // Reset text inputs
        $("#targetingInput").val("");
        $("#treadsInput").val("");
        $("#numFightsInput").val("");

        // Reset with 1 weapon
        $("#weaponSelectContainer").empty();
        addWeaponSelect();
    }

    // Simulates combat
    function simulate() {
        // Check inputs first
        const botName = $("#botSelect").selectpicker("val");
        const weaponDefs = [];
        $("#weaponSelectContainer select").each((_, s) => {
            const name = $(s).selectpicker("val");
            if (name in itemData) {
                let number = parseInt($(s).parent().nextAll("input").val());
                const weapon = itemData[name];

                if (isNaN(number)) {
                    // Invalid or unfilled number, treat as 1
                    number = 1;
                }

                for (let i = 0; i < number; i++) {
                    weaponDefs.push(weapon);
                }
            }
        });

        if (!(botName in botData)) {
            // TODO, no bot
            return;
        }

        if (weaponDefs.length === 0) {
            // TODO, no weapons
            return;
        }

        // Set up initial calculation state
        const bot = botData[botName];
        const parts = [];
        bot["Components Data"].concat(bot["Armament Data"]).forEach(item => {
            for (let i = 0; i < item["Number"]; i++) {
                const itemDef = getItem(item["Name"]);
                const isProtection = itemDef["Type"] === "Protection";
                parts.push({
                    armorAnalyzedCoverage: isProtection ? 0 : parseInt(itemDef["Coverage"]),
                    coverage: parseInt(itemDef["Coverage"]),
                    integrity: parseInt(itemDef["Integrity"]),
                    protection: isProtection,
                });
            }
        });

        const armorAnalyzedCoverage = bot["Core Coverage"] +
            parts.reduce((prev, part) => prev + part.armorAnalyzedCoverage, 0);

        // Enemy bot state
        const botState = {
            armorAnalyzedCoverage: armorAnalyzedCoverage,
            coreCoverage: bot["Core Coverage"],
            coreIntegrity: bot["Core Integrity"],
            corruption: 0,
            immunities: valueOrDefault(bot["Immunities"], []),
            parts: parts,
            resistances: valueOrDefault(bot["Resistances"], []),
            totalCoverage: bot["Total Coverage"],
        }

        // Weapons
        let numTreads = parseInt($("#treadsInput").val());
        if (isNaN(numTreads)) {
            numTreads = 0;
        }

        // Accuracy bonuses
        const siegeBonus = siegeModeBonusMap[$("#siegeModeContainer > label.active").attr("id")];
        let targetComputerBonus = parseInt($("#targetingInput").val());
        if (isNaN(targetComputerBonus)) {
            targetComputerBonus = 0;
        }

        function getRecoil(weapon) {
            let recoil = 0;

            // Add recoil if siege mode not active
            if ("Recoil" in weapon && siegeBonus === 0) {
                recoil += parseInt(weapon["Recoil"]);
                recoil -= numTreads;
            }

            // Make sure we don't have negative recoil
            return Math.max(recoil, 0);
        }

        const allRecoil = weaponDefs.reduce((prev, weapon) => getRecoil(weapon) + prev, 0);
        const melee = isMelee();

        // Target Analyzer crit bonus
        const targetAnalyzerName = $("#targetAnalyzerSelect").selectpicker("val");
        const critBonus = targetAnalyzerMap[targetAnalyzerName];

        const weapons = weaponDefs.map(weapon => {
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

                // Increase minimum damage for kinecellerators (2)
                if (weapon["Type"] === "Ballistic Gun" || weapon["Type"] === "Ballistic Cannon") {
                    const kinecelleratorName = $("#kinecelleratorSelect").selectpicker("val");
                    const kinecelleratorBonus = kinecelleratorMap[kinecelleratorName];

                    // Ensure min damage can't exceed max
                    damageMin = Math.min(Math.floor(damageMin * kinecelleratorBonus), damageMax);
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

            // Calculate accuracy
            let accuracy = initialAccuracy + targetComputerBonus;

            // Size bonus/penalty
            if (bot["Size"] in sizeAccuracyMap) {
                accuracy += sizeAccuracyMap[bot["Size"]];
            }
            else {
                console.log(`${botName} has invalid size ${bot["Size"]}`);
            }

            // Treads
            accuracy = accuracy += (numTreads * 2) + siegeBonus;

            // Builtin targeting
            if ("Targeting" in weapon) {
                accuracy += parseInt(weapon["Targeting"])
            }

            // Recoil
            accuracy -= allRecoil - getRecoil(weapon);

            // Cap accuracy
            let max = melee ? maxRangedAccuracy : maxMeleeAccuracy;
            accuracy = Math.min(max, Math.max(accuracy, minAccuracy));

            return {
                accelerated: weapon["Type"] === "Energy Gun" || weapon["Type"] === "Energy Cannon",
                accuracy: accuracy,
                critical: critical,
                damageMin: damageMin,
                damageMax: damageMax,
                damageType: damageType,
                delay: valueOrDefault(weapon["Delay"], 0),
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

        // Other misc offensive state
        const offensiveState = {
            armorAnalyzerChance: armorAnalyzerChance,
            analysis: $("#analysisYes").hasClass("active"),
            chargerBonus: chargerBonus,
            coreAnalyzerChance: coreAnalyzerChance,
            melee: melee,
            volleyTime: melee ? volleyTimeMap[1] : getRangedVolleyTime(weapons),
        };

        // Overall state
        const state = {
            initialBotState: botState,
            killTus: {},
            killVolleys: {},
            offensiveState: offensiveState,
            weapons: weapons
        };

        // Run simulation
        const numSimulations = getNumSimulations();
        for (let i = 0; i < numSimulations; i++) {
            simulateCombat(state);
        }

        Object.keys(state.killVolleys).forEach(numVolleys => {
            console.log(`${numVolleys}: ${state.killVolleys[numVolleys] / numSimulations * 100.0}%`);
        });

        updateChart(state);
    }

    // TODO - move
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
    }

    // Fully simulates the rounds of combat to a kill from an initial state
    function simulateCombat(state) {
        // Clone initial bot state
        const botState = cloneBotState(state.initialBotState);
        let volleys = 0;
        let tus = 0;

        function calculateResistDamage(damage, damageType) {
            if (damageType in botState.resistances) {
                return Math.floor(damage * (1 - (botState.resistances[damageType] / 100)));
            }

            return damage;
        }

        while (botState.coreIntegrity > 0 && botState.corruption < 100) {
            // Process each volley
            volleys += 1;
            tus += state.offensiveState.volleyTime;

            if (state.offensiveState.melee) {
                // TODO
            }
            else {
                state.weapons.forEach(weapon => {
                    for (let i = 0; i < weapon.numProjectiles; i++) {
                        if (randomInt(0, 99) > weapon.accuracy) {
                            // Miss
                            return;
                        }

                        if (weapon.damageType != null) {
                            // Apply regular damage (2)
                            let damage = randomInt(weapon.damageMin, weapon.damageMax);

                            // Add analysis (3)
                            if (state.analysis) {
                                damage = Math.floor(1.1 * damage);
                            }

                            // Add accelerator (5)
                            if (weapon.accelerated) {
                                damage = Math.floor(state.offensiveState.chargerBonus * damage);
                            }

                            // Apply resistances (6)
                            damage = calculateResistDamage(damage, weapon.damageType);

                            // Check for armor integrity analyzer
                            const armorAnalyzed = randomInt(0, 99) < state.offensiveState.armorAnalyzerChance;

                            // Check for core analyzer (8)
                            const coreAnalyzed = randomInt(0, 99) < state.offensiveState.coreAnalyzerChance;

                            // Check for crit (9)
                            const critical = randomInt(0, 99) < weapon.critical;

                            applyDamage(botState, damage, critical, armorAnalyzed, coreAnalyzed, weapon.overflow, weapon.damageType);
                        }

                        if (weapon.explosionType != null) {
                            // Apply explosion damage (2)
                            let damage = randomInt(weapon.explosionMin, weapon.explosionMax);

                            // Apply resistances (6)
                            damage = calculateResistDamage(damage, weapon.explosionType);

                            applyDamage(botState, damage, false, false, false,
                                weapon.overflow, weapon.explosionType);
                        }
                    }
                });
            }
        }

        // Update kills
        if (volleys in state.killVolleys) {
            state.killVolleys[volleys] += 1;
        }
        else {
            state.killVolleys[volleys] = 1;
        }

        if (tus in state.killTus) {
            state.killTus[tus] += 1;
        }
        else {
            state.killTus[tus] = 1;
        }
    }

    // Updates the available choices for the dropdowns depending on spoiler state
    function updateChoices() {
        const spoilersState = getSpoilersState();

        // Update all bot selections
        const select = $("#botSelect");
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

        // Must refresh twice to pick up initial selection for some reason
        select.selectpicker("refresh");
        select.selectpicker("refresh");
        select.selectpicker("val", "G-34 Mercenary");

        // Minor hack, the btn-light class is auto-added to dropdowns with search 
        // but it doesn't really fit with everything else
        $(".btn-light").removeClass("btn-light");

        // Reset with 1 weapon
        $("#weaponSelectContainer").empty();
        addWeaponSelect();
    }
});