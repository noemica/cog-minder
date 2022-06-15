import * as bots from "../json/bots.json";
import * as items from "../json/items.json";
import {
    botData,
    canShowPart,
    createBotDataContent,
    createItemDataContent,
    gallerySort,
    getItem,
    initData,
    itemData,
    parseIntOrDefault,
} from "./common";
import {
    createHeader,
    enableBotInfoItemPopovers,
    getSpoilersState,
    refreshSelectpicker,
    registerDisableAutocomplete,
    resetButtonGroup,
    setSpoilersState,
} from "./commonJquery";
import { Critical, DamageType, ItemRatingCategory, ItemType, WeaponItem } from "./itemTypes";
import {
    getBotDefensiveState,
    getRangedVolleyTime,
    getRecoil,
    getRegen,
    maxVolleys,
    simulateCombat,
    spectrumToNumber,
    volleyTimeMap,
} from "./simulatorCalcs";
import {
    BotState,
    EndCondition,
    OffensiveState,
    SimulatorPart,
    SimulatorState,
    SimulatorWeapon,
    SneakAttackStrategy,
} from "./simulatorTypes";

import "bootstrap";
import { Chart, ChartDataSets, Point } from "chart.js";
import * as jQuery from "jquery";
import "bootstrap-select";

const jq = jQuery.noConflict();
jq(function ($) {
    // Actual accuracy is 60 for ranged and 70 for melee but just assume the
    // defender immobile bonus for + 10
    const initialRangedAccuracy = 70;
    const initialMeleeAccuracy = 80;

    // Chart variables set on init
    let chart: Chart;
    let comparisonChart: Chart;
    let currentComparisonData;

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

    // Array of colors currently used to try to avoid duplicating colors when possible
    const comparisonColorsUsed = comparisonBorderColors.map(() => 0);

    // Flag to cancel a simulation
    let cancelled = false;

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
        "30%: Armor Integrity Analyzer": 30,
        "40%: Imp. Armor Integrity Analyzer": 40,
        "50%: Exp. Armor Integrity Analyzer": 50,
    };

    // Charger damage increase values
    const chargerMap = {
        "0%: None": 1.0,
        "15%: Particle Charger": 1.15,
        "20%: Imp. Particle Charger": 1.2,
        "25%: Adv. Particle Charger": 1.25,
        "30%: Particle Accelerator": 1.3,
        "40%: Imp. Particle Accelerator": 1.4,
        "50%: Adv. Particle Accelerator": 1.5,
    };

    // Cycler volley time multiplier map
    const cyclerMap = {
        "0%: None": 1.0,
        "15%: Weapon Cycler": 0.85,
        "20%: Imp. Weapon Cycler": 0.8,
        "25%: Adv. Weapon Cycler": 0.75,
        "30%: Exp. Weapon Cycler": 0.7,
        "50%: Quantum Capacitor": 0.5,
        "50%: Launcher Loader": 0.5,
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

    // Force booster ids
    const forceBoosterIds = ["forceBoosterInput", "impForceBoosterInput", "advForceBoosterInput"];

    // Array of force booster maximum damage increases
    const forceBoosterMaxDamageIncrease = [0.2, 0.3, 0.4];

    // Kinecellerator min damage increase values
    const kinecelleratorMap = {
        "0%: None": 1.0,
        "30%: Kinecellerator": 1.3,
        "40%: Imp. Kinecellerator": 1.4,
        "50%: Adv. Kinecellerator": 1.5,
    };

    // Melee analysis ids
    const meleeAnalysisIds = [
        "meleeAnalysisInput",
        "impMeleeAnalysisInput",
        "advMeleeAnalysisInput",
        "expMeleeAnalysisInput",
    ];

    // Array of melee analysis minimum damage increases
    const meleeAnalysisMinDamageIncrease = [2, 3, 4, 6];

    // Melee weapon types
    const meleeTypes = [
        ItemType.ImpactWeapon,
        ItemType.PiercingWeapon,
        ItemType.SlashingWeapon,
        ItemType.SpecialMeleeWeapon,
    ];

    // Ranged weapon types
    const rangedTypes = [
        ItemType.BallisticCannon,
        ItemType.BallisticGun,
        ItemType.EnergyCannon,
        ItemType.EnergyGun,
        ItemType.Launcher,
        ItemType.SpecialWeapon,
    ];

    // List of weapons affected by the exoskeleton
    const sigixWeapons = [
        "Core Cannon",
        "Core Stripper",
        "Modified Sigix Sheargun",
        "Sigix Broadsword",
        "Sigix Shearcannon",
        "Sigix Sheargun",
    ];

    // Bot size mode to accuracy bonus map
    const sizeAccuracyMap = {
        Huge: 30,
        Large: 10,
        Medium: 0,
        Small: -10,
        Tiny: -30,
    };

    // Siege mode text to accuracy bonus/TUs to activate map
    const siegeModeBonusMap = {
        "No Siege": { bonus: 0, tus: 0 },
        "In Siege Mode": { bonus: 20, tus: 0 },
        "In High Siege Mode": { bonus: 30, tus: 0 },
        "Entering Siege Mode": { bonus: 20, tus: 500 },
        "Entering High Siege Mode": { bonus: 30, tus: 500 },
    };

    $(() => init());

    function addComparison() {
        const name = $("#comparisonNameInput").val() as string;
        $("#comparisonNameInput").val("");

        // Disable the button to avoid adding the dataset multiple times
        const button = $("#addComparisonButton");
        button.addClass("disabled");
        button.prop("disabled", true);
        (button as any).tooltip("hide");

        $("#comparisonContainer").removeClass("not-visible");

        // Try to get the first unused color if possible
        const { colorIndex } = comparisonColorsUsed.reduce(
            (acc, num, index) => {
                if (num < acc.value) {
                    return { colorIndex: index, value: num };
                } else {
                    return acc;
                }
            },
            { colorIndex: -1, value: Number.MAX_VALUE },
        );

        comparisonColorsUsed[colorIndex] += 1;

        // Create and append the dataset to the chart
        const newDataset = getDatasetSettings(name, "rgb(0, 0, 0, 0)", comparisonBorderColors[colorIndex]);
        newDataset.data = currentComparisonData;
        comparisonChart.data.datasets!.push(newDataset);

        // Create editor elements
        const parent = $('<div class="input-group"></div>');
        const nameInput = $(`<input class="form-control"></input>`);
        nameInput.val(name);
        const deleteButton = $(
            '<button class="btn ml-2" data-toggle="tooltip" title="Removes the dataset.">X</button>',
        );

        parent.append(nameInput[0]);
        parent.append(deleteButton[0]);

        // Set up callbacks
        (deleteButton as any).tooltip();
        deleteButton.on("click", () => {
            // Remove the dataset from the chart
            const datasets = comparisonChart.data.datasets!;
            datasets.splice(datasets.indexOf(newDataset), 1);
            comparisonChart.update();

            if (datasets.length === 0) {
                // Hide the comparison chart section if no more data to show
                $("#comparisonContainer").addClass("not-visible");
            }

            comparisonColorsUsed[colorIndex] -= 1;

            // Remove the associated item
            (deleteButton as any).tooltip("dispose");
            parent.remove();
        });

        nameInput.on("change", () => {
            newDataset.label = nameInput.val() as string;
            comparisonChart.update();
        });

        $("#comparisonDatasetsContainer").append(parent[0]);

        comparisonChart.update();
    }

    // Adds a new weapon select dropdown with an optional weapon name
    function addWeaponSelect(weaponName: string) {
        const spoilersState = getSpoilersState();
        const container = $("#weaponSelectContainer");

        const melee = isMelee();
        const types = melee ? meleeTypes : rangedTypes;
        const weapons: string[] = [];
        Object.keys(itemData).forEach((name) => {
            const baseItem = itemData[name];

            // Slot check
            if (baseItem.slot !== "Weapon") {
                return;
            }

            const weapon = baseItem as WeaponItem;

            // Ranged/melee type check
            if (!types.includes(weapon.type)) {
                return;
            }

            // Damage check
            if (weapon.damageType === "Special") {
                return;
            }

            if (canShowPart(weapon, spoilersState)) {
                weapons.push(name);
            }
        });

        if (melee) {
            weapons.push("Ram");
        }

        // Sort and create weapon option HTML elements
        weapons.sort(gallerySort);
        const weaponOptions = weapons.map((w) => `<option>${w}</option>`).join();

        // Create weapon elements
        const parent = $('<div class="input-group mt-1"></div>');
        const selectLabel = $(
            '<span class="input-group-text" data-toggle="tooltip" title="Name of an equipped weapon to fire">Weapon</span>',
        );
        const select = $(`<select class="selectpicker" data-live-search="true">${weaponOptions}</select>`);
        const helpButton = $('<button class="btn part-help-btn" data-html=true data-toggle="popover">?</button>');
        const massLabel = $(`
        <div class="input-group-prepend ml-2" data-toggle="tooltip" title="The mass of cogmind. Ram damage is a random amount from 0 to (((10 + [mass]) / 5) + 1) * ([speed%] / 100) * [momentum].">
            <span class="input-group-text">Mass</span>
        </div>`);
        const massInput = $('<input class="form-control" placeholder="0"></input>');
        const overloadContainer = $('<div class="btn-group btn-group-toggle ml-2" data-toggle="buttons"></div>');
        const overloadLabelContainer = $(
            '<div class="input-group-prepend" data-toggle="tooltip" title="Whether to fire the weapon as overloaded (double damage)."></div>',
        );
        const overloadLabel = $('<span class="input-group-text">Overload</span>');
        const overloadNoLabel = $('<label class="btn"><input type="radio" name="options">No</input></label>');
        const overloadYesLabel = $('<label class="btn"><input type="radio" name="options">Yes</input></label>');
        const exoContainer = $('<div class="btn-group btn-group-toggle ml-2" data-toggle="buttons"></div>');
        const exoLabelContainer = $(
            '<div class="input-group-prepend" data-toggle="tooltip" title="Whether a Sigix Exoskeleton is equipped (double damage)."></div>',
        );
        const exoLabel = $('<span class="input-group-text">Exoskeleton</span>');
        const exoNoLabel = $('<label class="btn"><input type="radio" name="options">No</input></label>');
        const exoYesLabel = $('<label class="btn"><input type="radio" name="options">Yes</input></label>');
        const numberLabel = $(`
        <div class="input-group-prepend ml-2" data-toggle="tooltip" title="How many weapons of this type to have equipped.">
            <span class="input-group-text">Number</span>
        </div>`);
        const numberInput = $('<input class="form-control" placeholder="1"></input>');
        const deleteButton = $('<button class="btn ml-2" data-toggle="tooltip" title="Removes the weapon.">X</button>');

        // Add elements to DOM
        container.append(parent[0]);
        parent.append(selectLabel[0]);
        parent.append(select[0]);
        parent.append(helpButton[0]);
        parent.append(overloadContainer[0]);
        overloadContainer.append(overloadLabelContainer[0]);
        overloadLabelContainer.append(overloadLabel[0]);
        overloadContainer.append(overloadNoLabel[0]);
        overloadContainer.append(overloadYesLabel[0]);
        parent.append(exoContainer[0]);
        exoContainer.append(exoLabelContainer[0]);
        exoLabelContainer.append(exoLabel[0]);
        exoContainer.append(exoNoLabel[0]);
        exoContainer.append(exoYesLabel[0]);
        parent.append(massLabel[0]);
        parent.append(massInput[0]);
        parent.append(numberLabel[0]);
        parent.append(numberInput[0]);
        parent.append(deleteButton[0]);

        resetButtonGroup(overloadContainer);
        resetButtonGroup(exoContainer);

        deleteButton.on("click", () => {
            // Ensure the last dropdown is always empty
            if (parent.next().length === 0) {
                addWeaponSelect("");
            }

            // Remove the associated item
            select.selectpicker("destroy");
            (deleteButton as any).tooltip("dispose");
            parent.remove();
        });

        select.selectpicker("val", weaponName);

        const updateContent = (weaponName: string) => {
            let weapon: WeaponItem | undefined;

            if (weaponName in itemData) {
                weapon = itemData[weaponName] as WeaponItem;
                helpButton.attr("data-content", createItemDataContent(weapon));
                (helpButton as any).popover();
            }

            if (weapon === undefined) {
                // If no valid weapon hide all options
                overloadContainer.addClass("not-visible");
                exoContainer.addClass("not-visible");
            } else if (weapon.overloadStability !== undefined) {
                // Show the overload option
                overloadContainer.removeClass("not-visible");
                resetButtonGroup(exoContainer);
                exoContainer.addClass("not-visible");
            } else if (sigixWeapons.includes(weapon.name) && getSpoilersState() === "Redacted") {
                // Show the exoskeleton option
                overloadContainer.addClass("not-visible");
                resetButtonGroup(overloadContainer);
                exoContainer.removeClass("not-visible");
            } else {
                // If can't overload and not sigix weapon then hide all
                resetButtonGroup(overloadContainer);
                overloadContainer.addClass("not-visible");
                resetButtonGroup(exoContainer);
                exoContainer.addClass("not-visible");
            }

            if (weaponName === "Ram") {
                // If ramming then show mass and hide weapon number
                massLabel.removeClass("not-visible");
                massInput.removeClass("not-visible");
                numberLabel.addClass("not-visible");
                numberInput.addClass("not-visible");
            } else {
                // Otherwise do the reverse
                massLabel.addClass("not-visible");
                massInput.addClass("not-visible");
                numberLabel.removeClass("not-visible");
                numberInput.removeClass("not-visible");
            }
        };

        // Set initial weapon info
        updateContent(weaponName);

        // Update content when the weapon selection changes
        select.on("changed.bs.select", () => {
            if (parent.next().length === 0) {
                addWeaponSelect("");
            }

            updateContent(select.selectpicker("val") as any as string);
        });

        select.parent().addClass("weapon-dropdown");

        // Enable tooltips
        (deleteButton as any).tooltip();
        (numberLabel as any).tooltip();
        (selectLabel as any).tooltip();
        (massLabel as any).tooltip();
        (overloadLabelContainer as any).tooltip();
        (exoLabelContainer as any).tooltip();

        // Minor hack, the btn-light class is auto-added to dropdowns with search
        // but it doesn't really fit with everything else
        parent.find(".btn-light").removeClass("btn-light");
    }

    // Gets a dataset's overall settings with some defaults
    function getDatasetSettings(label: string, backgroundColor: string, borderColor: string) {
        return {
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            label: label,
            pointRadius: 0,
            pointHitRadius: 25,
            showLine: true,
            steppedLine: "before",
        } as ChartDataSets;
    }

    // Gets the number of simulations to perform
    function getNumSimulations() {
        const stringValue = ($("#numFightsInput").val() as string).replace(",", "");
        return parseIntOrDefault(stringValue, 100000);
    }

    // Initialize the page state
    function init() {
        // Reinstate for beta 12
        // const isB11 = getB11State();
        initData(items as any, bots as any);

        createHeader("Simulator", $("#headerContainer"));
        // $("#beta11Checkbox").prop("checked", getB11State());
        registerDisableAutocomplete($(document));

        // Set initial state
        resetButtonGroup($("#combatTypeContainer"));
        resetButtonGroup($("#xAxisContainer"));
        $("#comparisonChartNameInput").val("");
        resetValues();
        updateChoices();

        // Register handlers
        $("#spoilersDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilersState(state);
            ($("#spoilersDropdown > button") as any).tooltip("hide");
            updateChoices();
        });
        $("#reset").on("click", () => {
            ($("#reset") as any).tooltip("hide");
            resetValues();
        });
        $("#botSelect").on("changed.bs.select", () => {
            const bot = botData[($("#botSelect") as any).selectpicker("val") as string];
            $("#enemyInfoButton").attr("data-content", createBotDataContent(bot));

            if (bot.name === "A-15 Conveyor") {
                $("#endConditionNoTnc").removeClass("not-visible");
            } else {
                $("#endConditionNoTnc").addClass("not-visible");
            }

            refreshSelectpicker($("#endConditionSelect"));
        });
        $("#combatTypeContainer > label > input").on("change", () => {
            updateChoices();
        });
        $("#simulateButton").on("click", () => {
            simulate();
        });
        $("#cancelButton").on("click", () => {
            cancelled = true;
        });
        $("#addComparisonButton").on("click", () => {
            addComparison();
        });
        $("#comparisonChartNameInput").on("change", () => {
            let label = $("#comparisonChartNameInput").val() as string;
            if (label === "") {
                label = "Custom Comparison";
            }

            comparisonChart.options.title!.text = label;
            comparisonChart.update();
        });

        // Reinstate for beta 12
        // $("#beta11Checkbox").on("change", () => {
        //     const isB11 = $("#beta11Checkbox").prop("checked");
        //     setB11State(isB11);
        //     const newItems = (isB11 ? itemsB11 : items) as any;
        //     const newBots = (isB11 ? botsB11 : bots) as any;

        //     initData(newItems, newBots);

        //     // Initialize page state
        //     resetValues();
        //     updateChoices();

        //     ($("#beta11Checkbox").parent() as any).tooltip("hide");
        // });

        $(window).on("click", (e) => {
            if ($(e.target).parents(".popover").length === 0 && $(".popover").length >= 1) {
                // If clicking outside of a popover close the current one
                ($('[data-toggle="popover"]') as any).not(e.target).popover("hide");
            } else if ($(e.target).parents(".popover").length === 1 && $(".popover").length > 1) {
                // If clicking inside of a popover close any nested popovers
                ($(e.target).parents(".popover").find(".bot-popover-item") as any)
                    .not(e.target)
                    .not($(e.target).parents())
                    .popover("hide");
            }
        });

        // Enable tooltips/popovers
        ($('[data-toggle="tooltip"]') as any).tooltip();

        //Set initial bot info
        const bot = botData[($("#botSelect") as any).selectpicker("val")];
        $("#enemyInfoButton").attr("data-content", createBotDataContent(bot));
        ($("#enemyInfoButton") as any).popover();

        enableBotInfoItemPopovers($("#enemyInfoButton"));

        // These divs are created at runtime so have to do this at init
        $("#damageReductionSelect").parent().addClass("percent-dropdown");
        $("#botSelectContainer > div").addClass("enemy-dropdown");
        $("#siegeSelectContainer > div").addClass("siege-dropdown");
        $("#chargerSelect").parent().addClass("percent-dropdown");
        $("#kinecelleratorSelect").parent().addClass("percent-dropdown");
        $("#cyclerSelect").parent().addClass("percent-dropdown");
        $("#overloadSelect").parent().addClass("percent-dropdown");
        $("#armorIntegSelect").parent().addClass("percent-dropdown");
        $("#actuatorSelect").parent().addClass("percent-dropdown");
        $("#sneakAttackSelect").parent().addClass("sneak-attack-dropdown");

        // Minor hack, the btn-light class is auto-added to dropdowns with search
        // but it doesn't really fit with everything else
        $(".btn-light").removeClass("btn-light");

        initCharts();
    }

    // Initializes the charts with default settings and no data
    function initCharts() {
        const perXDataset = getDatasetSettings("Current volley kill %", "rgba(0, 98, 0, 0.3)", "rgba(0, 196, 0, 1)");
        const cumulativeDataset = getDatasetSettings(
            "Cumulative kill %",
            "rgba(96, 96, 96, 0.3)",
            "rgba(128, 128, 128, 1)",
        );

        let chartElement = $("#chart");
        chart = new Chart(chartElement as any, {
            type: "scatter",
            data: {
                datasets: [perXDataset, cumulativeDataset],
            },
            options: {
                legend: {
                    labels: {
                        fontSize: 16,
                    },
                },
                scales: {
                    xAxes: [
                        {
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
                            },
                        },
                    ],
                    yAxes: [
                        {
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
                                callback: (value) => value + "%",
                            },
                        },
                    ],
                },
                title: {
                    display: true,
                    fontSize: 24,
                },
            },
        });

        chartElement = $("#comparisonChart");
        comparisonChart = new Chart(chartElement as any, {
            type: "scatter",
            data: {
                datasets: [],
            },
            options: {
                legend: {
                    labels: {
                        fontSize: 16,
                    },
                },
                scales: {
                    xAxes: [
                        {
                            gridLines: {
                                display: false,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "Number of time units",
                                fontSize: 24,
                            },
                            ticks: {
                                min: 0,
                                stepSize: 100,
                            },
                        },
                    ],
                    yAxes: [
                        {
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
                                callback: (value) => value + "%",
                            },
                        },
                    ],
                },
                title: {
                    display: true,
                    text: "Custom Comparison",
                    fontSize: 24,
                },
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
        resetButtonGroup($("#movedContainer"));
        resetButtonGroup($("#siegeModeContainer"));

        // Reset dropdowns
        resetDropdown($("#damageReductionSelect"));
        resetDropdown($("#siegeSelect"));
        resetDropdown($("#chargerSelect"));
        resetDropdown($("#kinecelleratorSelect"));
        resetDropdown($("#cyclerSelect"));
        resetDropdown($("#overloadSelect"));
        resetDropdown($("#armorIntegSelect"));
        resetDropdown($("#actuatorSelect"));
        resetDropdown($("#sneakAttackSelect"));
        resetDropdown($("#endConditionSelect"));

        // Reset text inputs
        $("#numFightsInput").val("");
        $("#targetingInput").val("");
        $("#treadsInput").val("");
        $("#distanceInput").val("");
        $("#recoilInput").val("");
        $("#coreAnalyzerInput").val("");
        $("#targetAnalyzerInput").val("");
        $("#meleeAnalysisContainer > input").val("");
        $("#forceBoosterContainer > input").val("");
        $("#speedInput").val("");
        $("#actuatorArrayInput").val("");
        $("#bonusMomentumInput").val("");
        $("#initialMomentumInput").val("");
        $("#comparisonNameInput").val("");

        // Reset with 1 preset weapon and one empty one
        $("#weaponSelectContainer").empty();

        const defaultWeapon = isMelee() ? "Mining Claw" : "Lgt. Assault Rifle";
        addWeaponSelect(defaultWeapon);
        addWeaponSelect("");

        setStatusText("");

        $("#resultsContainer").addClass("not-visible");
    }

    // Sets controls to disabled/enabled based on if the simulation is running
    function setSimulationRunning(running: boolean) {
        function setEnabled(selector: JQuery<HTMLElement>) {
            selector.removeClass("disabled");
            selector.prop("disabled", false);
        }
        function setDisabled(selector: JQuery<HTMLElement>) {
            selector.addClass("disabled");
            selector.prop("disabled", true);
        }
        const func = running ? setDisabled : setEnabled;

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

        func($("#recoilInput"));
        func($("#overloadSelect").next());

        func($("#meleeAnalysisContainer > input"));
        func($("#forceBoosterContainer > input"));
        func($("#actuatorSelect").next());
        func($("#actuatorArrayInput"));
        func($("#bonusMomentumInput"));
        func($("#initialMomentumInput"));
        func($("#speedInput"));
        func($("#sneakAttackSelect").next());

        func($("#armorIntegSelect").next());
        func($("#coreAnalyzerInput"));
        func($("#targetAnalyzerInput"));

        func($("#weaponSelectContainer button").not(".weapon-help-btn"));
        func($("#weaponSelectContainer .btn").not(".weapon-help-btn"));
        func($("#weaponSelectContainer input"));

        // Update the cancel/simulate buttons
        if (running) {
            $("#cancelButton").removeClass("not-visible");
            $("#simulateButton").addClass("not-visible");
        } else {
            $("#cancelButton").addClass("not-visible");
            $("#simulateButton").removeClass("not-visible");
        }
    }

    // Sets the status label to the specified value
    function setStatusText(text: string) {
        $("#statusText").text(text);
    }

    // Simulates combat with the current settings and updates the chart (simulate button entry point)
    function simulate() {
        // Check inputs first
        const botName = $("#botSelect").selectpicker("val") as any as string;
        const userWeapons: { def: WeaponItem; overloaded: boolean }[] = [];
        $("#weaponSelectContainer select").each((_, s) => {
            const name = $(s).selectpicker("val") as any as string;
            if (name in itemData) {
                const weapon = itemData[name] as WeaponItem;

                // Tread invalid or unfilled numbers as 1
                const number = parseIntOrDefault($(s).parent().nextAll("input").not(".not-visible").val() as string, 1);

                const overloaded = !$(s).parent().nextAll(".btn-group").children("label").first().hasClass("active");
                // This is so terrible but I can't be bothered to figure out a better way
                const exo = !$($(s).parent().nextAll(".btn-group")[1]).children("label").first().hasClass("active");

                for (let i = 0; i < number; i++) {
                    // Overload and exoskeleton both double damage so just treat them the same
                    userWeapons.push({ def: weapon, overloaded: overloaded || exo });
                }
            } else if (name === "Ram") {
                const weapon: WeaponItem = {
                    categories: [],
                    category: ItemRatingCategory.None,
                    hackable: false,
                    index: 0,
                    integrity: 0,
                    name: "Ram",
                    fullName: "Ram",
                    noPrefixName: "Ram",
                    projectileCount: 1,
                    range: 2,
                    rating: 0,
                    ratingString: "",
                    size: 0,
                    slot: "N/A",
                    type: ItemType.ImpactWeapon,
                    mass: parseIntOrDefault($(s).parent().nextAll("input").val() as string, 0),
                    noRepairs: false,
                };

                userWeapons.push({ def: weapon, overloaded: false });
            }
        });

        if (!(botName in botData)) {
            setStatusText(`Bot ${botName} is invalid, this is probably a bug.`);
            return;
        }

        if (userWeapons.length === 0) {
            setStatusText("There must be at least 1 weapon selected.");
            return;
        }

        // Set up initial calculation state
        const bot = botData[botName];
        const parts: SimulatorPart[] = [];
        bot.componentData
            .concat(bot.armamentData)
            // For now just use the first option in each list
            .concat(bot.componentOptionData.map((c) => c[0]))
            .concat(bot.armamentOptionData.map((c) => c[0]))
            .forEach((item) => {
                for (let i = 0; i < item.number; i++) {
                    const itemDef = getItem(item.name);
                    const isProtection = itemDef.type === ItemType.Protection;
                    const coverage = itemDef.coverage ?? 0;
                    parts.push({
                        armorAnalyzedCoverage: isProtection ? 0 : coverage,
                        coverage: coverage,
                        def: itemDef,
                        integrity: itemDef.integrity,
                        protection: isProtection,
                        selfDamageReduction: 1,
                    });
                }
            });

        const armorAnalyzedCoverage =
            bot.coreCoverage + parts.reduce((prev, part) => prev + part.armorAnalyzedCoverage, 0);

        const externalDamageReduction =
            externalDamageReductionNameMap[$("#damageReductionSelect").selectpicker("val") as any as string];
        const defensiveState = getBotDefensiveState(parts, externalDamageReduction);

        // Enemy bot state
        const botState: BotState = {
            armorAnalyzedCoverage: armorAnalyzedCoverage,
            coreCoverage: bot.coreCoverage,
            coreDisrupted: false,
            coreIntegrity: bot.coreIntegrity,
            corruption: 0,
            def: bot,
            defensiveState: defensiveState,
            externalDamageReduction: externalDamageReduction,
            immunities: bot.immunities,
            initialCoreIntegrity: bot.coreIntegrity,
            parts: parts,
            regen: getRegen(bot),
            resistances: bot.resistances === undefined ? {} : bot.resistances,
            totalCoverage: bot.totalCoverage,
        };

        // Weapons and other offensive state
        let ramming = false;
        const melee = isMelee();
        const numTreads = parseIntOrDefault($("#treadsInput").val() as string, 0);

        // Accuracy bonuses and penalties
        const siegeBonus = melee ? null : siegeModeBonusMap[$("#siegeSelect").selectpicker("val") as any as string];
        let targetingComputerBonus = 0;
        if (!melee) {
            targetingComputerBonus = parseIntOrDefault($("#targetingInput").val() as string, 0);
        }

        // Melee analysis/force boosters
        const meleeAnalysis = [0, 0, 0, 0];
        const forceBoosters = [0, 0, 0];
        if (melee) {
            meleeAnalysisIds.map((id, i) => {
                meleeAnalysis[i] = parseIntOrDefault($(`#${id}`).val() as string, 0);
            });

            forceBoosterIds.map((id, i) => {
                forceBoosters[i] = parseIntOrDefault($(`#${id}`).val() as string, 0);
            });

            // Reduce force boosters to the 2 highest rating parts
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
        let distance = parseIntOrDefault($("#distanceInput").val() as string, 6);
        if (distance <= 1) {
            // Less than or equal to 1, just assign to 1
            distance = 1;
        }

        // Recoil reduction
        const recoilReduction = parseIntOrDefault($("#recoilInput").val() as string, 0);

        const allRecoil = userWeapons.reduce(
            (prev, weapon) => getRecoil(weapon.def, numTreads, recoilReduction) + prev,
            0,
        );

        // Target Analyzer crit bonus
        const critBonus = parseIntOrDefault($("#targetAnalyzerInput").val() as string, 0);

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

                if (def.type === ItemType.BallisticGun || def.type === ItemType.BallisticCannon) {
                    // Increase minimum damage for kinecellerators (2)
                    const kinecelleratorName = $("#kinecelleratorSelect").selectpicker("val") as any as string;
                    const kinecelleratorBonus = kinecelleratorMap[kinecelleratorName];

                    // Ensure min damage can't exceed max
                    damageMin = Math.min(Math.trunc(damageMin * kinecelleratorBonus), damageMax);
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
                            maxDamageIncrease +=
                                forceBoosterMaxDamageIncrease[i] * (numBoostersProcessed == 0 ? 1 : 0.5);
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

            // Calculate base accuracy that can't change over the course of the fight
            let baseAccuracy = melee ? initialMeleeAccuracy : initialRangedAccuracy;

            if (!melee) {
                baseAccuracy += targetingComputerBonus;
            }

            // Size bonus/penalty
            if (bot.size in sizeAccuracyMap) {
                baseAccuracy += sizeAccuracyMap[bot.size];
            } else {
                console.log(`${botName} has invalid size ${bot.size}`);
            }

            // Builtin targeting
            if (def.targeting !== undefined) {
                baseAccuracy += def.targeting;
            }

            const delay = parseIntOrDefault(def.delay, 0);

            // Follow-up attacks on melee gain a 10% bonus to targeting
            const followUp = melee && i != 0;
            if (followUp) {
                baseAccuracy += 10;
            }

            const disruption = def.disruption ?? 0;

            const spectrum = spectrumToNumber(def.spectrum);
            const explosionSpectrum = spectrumToNumber(def.explosionSpectrum);

            if (def.name === "Ram") {
                ramming = true;
            }

            // All launchers are missiles except for special cases
            const isMissile =
                def.type === "Launcher" &&
                def.name != "Sigix Terminator" &&
                def.name != "Supercharged Sigix Terminator" &&
                def.name != "Vortex Catalyst Activator";

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
                explosionMin: explosionMin,
                explosionMax: explosionMax,
                explosionSpectrum: explosionSpectrum,
                explosionType: explosionType,
                isMissile: isMissile,
                numProjectiles: def.projectileCount,
                overflow: !def.type.includes("Gun"),
                overloaded: weapon.overloaded,
                spectrum: spectrum,
            };

            return state;
        });

        // Charger bonus
        const chargerName = $("#chargerSelect").selectpicker("val") as any as string;
        const chargerBonus = chargerMap[chargerName];

        // Armor Integrity Analyzer chance
        const armorAnalyzerName = $("#armorIntegSelect").selectpicker("val") as any as string;
        const armorAnalyzerChance = armorIntegrityMap[armorAnalyzerName];

        // Core Analyzer chance
        const coreAnalyzerChance = parseIntOrDefault($("#coreAnalyzerInput").val() as string, 0);

        // Actuator Array chance
        const actuatorArrayBonus = parseIntOrDefault($("#actuatorArrayInput").val() as string, 0);

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
        const speed = parseIntOrDefault($("#speedInput").val() as string, 100);

        // Get momentum
        const bonusMomentum = parseIntOrDefault($("#bonusMomentumInput").val() as string, 0);
        const initialMomentum = parseIntOrDefault($("#initialMomentumInput").val() as string, 0);

        // Determine sneak attack strategy
        const sneakAttackStrategy = $("#sneakAttackSelect").selectpicker("val") as any as SneakAttackStrategy;

        // Calculate total (ranged) or initial (melee) volley time
        const volleyTimeModifier = melee
            ? actuatorMap[$("#actuatorSelect").selectpicker("val") as any as string]
            : cyclerMap[$("#cyclerSelect").selectpicker("val") as any as string];

        const volleyTime = melee
            ? weapons[0].delay + volleyTimeMap[1]
            : getRangedVolleyTime(
                  weapons.map((w) => w.def),
                  volleyTimeModifier,
              );

        // Other misc offensive state
        const offensiveState: OffensiveState = {
            armorAnalyzerChance: armorAnalyzerChance,
            analysis: $("#analysisYes").hasClass("active"),
            chargerBonus: chargerBonus,
            coreAnalyzerChance: coreAnalyzerChance,
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
            numTreads: numTreads,
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

        const endCondition = $("#endConditionSelect").selectpicker("val") as any as string as EndCondition;

        // Overall state
        const state: SimulatorState = {
            botState: botState,
            endCondition: endCondition,
            initialBotState: botState,
            killTus: {},
            killVolleys: {},
            offensiveState: offensiveState,
            tus: 0,
            weapons: weapons,
        };

        // Disable all input fields while the simulation is running
        setSimulationRunning(true);

        // Run simulation
        cancelled = false;
        let i = 0;
        const numSimulations = getNumSimulations();
        const initial = performance.now();
        let lastFrame = initial;
        let lastStatusUpdate = lastFrame;

        // Run simulation in batches via setTimeout to avoid UI lockup.
        // After each 100 simulations check if we've surpassed 30 ms since the
        // last update (aim for ~30 fps)
        // If so then pass control back so events/updates can be processed.
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

                        if (now - lastStatusUpdate > 100) {
                            // Only update status ~ 10 times a second
                            const percent = ((i * 100) / numSimulations).toFixed(1);
                            setStatusText(`${String(percent).padStart(4, "0")} % completed.`);
                            lastStatusUpdate = now;
                        }
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
                } catch (e) {
                    console.log(e);
                    setStatusText("The simulation encountered an unexpected error, this is a bug.");
                    setSimulationRunning(false);
                    return;
                }
            }

            if (i >= numSimulations) {
                setSimulationRunning(false);
                let time = performance.now() - initial;
                time /= 1000;
                setStatusText(`Completed in ${time.toFixed(2)} seconds.`);
                updateChart(state);

                const button = $("#addComparisonButton");
                button.removeClass("disabled");
                button.prop("disabled", false);
            }
        }

        run();
    }

    // Updates the chart based on the current simulation state
    function updateChart(state: SimulatorState) {
        const numSimulations = getNumSimulations();

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

        // Get datasets
        const perXDataset = chart.data.datasets![0];
        const cumulativeDataset = chart.data.datasets![1];
        const perVolleys = $("#xAxisVolleys").hasClass("active");

        let perXData: Point[];
        const perXString = $("#endConditionSelect").selectpicker("val") as any as string;
        let stepSize: number;
        let xString: string;
        let xAxisString: string;

        // Get comparison data first
        const perXKillsKeys = Object.keys(state.killTus);
        perXKillsKeys.sort((a, b) => parseFloat(a) - parseFloat(b));
        // Note: Melee (especially with followups) can create a lot of
        // relatively  lower probability scenarios due to strange melee delays
        // so add an extra decimal place to avoid cutting out too many
        // results that the max total % would end up being unreasonably
        // low (like under 80%) when killing enemies with particularly
        // large health pools.
        const tuData = getData(perXKillsKeys, state.killTus, state.offensiveState.melee ? 3 : 1, 100);
        currentComparisonData = getCumulativeData(tuData);

        if (perVolleys) {
            // Show data per volley
            xString = "Volleys";
            stepSize = 1;
            xAxisString = "Number of volleys";

            perXData = getData(Object.keys(state.killVolleys), state.killVolleys, 1, 1);
        } else {
            // Show data per time unit
            xString = "Time Units";
            stepSize = state.offensiveState.volleyTime;
            xAxisString = "Number of time units";

            perXData = getData(perXKillsKeys, state.killTus, state.offensiveState.melee ? 3 : 1, stepSize);
        }

        const cumulativeData = getCumulativeData(perXData);

        // Update chart
        chart.options.scales!.xAxes![0].ticks!.stepSize = stepSize;
        chart.options.scales!.xAxes![0].scaleLabel!.labelString = xAxisString;
        perXDataset.data = perXData;
        cumulativeDataset.data = cumulativeData;

        chart.options.title!.text = `${xString}/${perXString} vs. ${$("#botSelect").selectpicker("val")}`;
        chart.update();
        $("#resultsContainer").removeClass("not-visible");
    }

    // Updates the available choices for the dropdowns depending on spoiler state and combat type
    function updateChoices() {
        const spoilersState = getSpoilersState();

        // Update all bot selections after saving old pick
        const select = $("#botSelect");
        const oldBot = select.selectpicker("val") as any as string;
        select.empty();

        const sortedBots = Object.keys(botData);
        sortedBots.sort();
        sortedBots.forEach((name) => {
            const bot = botData[name];

            if (bot.categories.some((c) => c === "Spoilers")) {
                // Spoiler bots allowed for spoilers/redacted
                if (spoilersState === "Spoilers" || spoilersState === "Redacted") {
                    select.append(`<option>${name}</option>`);
                }
            } else if (bot.categories.some((c) => c === "Redacted")) {
                // Redacted bots only allowed for spoilers/redacted
                if (spoilersState === "Redacted") {
                    select.append(`<option>${name}</option>`);
                }
            } else {
                // Non-spoiler bot always allowed
                select.append(`<option>${name}</option>`);
            }
        });

        // Don't show arch tele condition when not on redacted
        if (spoilersState === "Redacted") {
            $("#endConditionArchTele").removeClass("not-visible");
        } else {
            $("#endConditionArchTele").addClass("not-visible");
        }
        refreshSelectpicker($("#endConditionSelect"));
        refreshSelectpicker(select);

        // Try to preserve the old bot, otherwise default
        select.selectpicker("val", oldBot);

        if (select.selectpicker("val") === null) {
            select.selectpicker("val", "G-34 Mercenary");
        }

        const melee = isMelee();

        function setVisibility(selector: JQuery<HTMLElement>, visible: boolean) {
            visible ? selector.removeClass("not-visible") : selector.addClass("not-visible");
        }

        setVisibility($("#rangedAccuracyContainer"), !melee);
        setVisibility($("#rangedUtilitiesContainer"), !melee);
        setVisibility($("#rangedUtilitiesContainer2"), !melee);
        setVisibility($("#meleeAnalysisContainer"), melee);
        setVisibility($("#forceBoosterContainer"), melee);
        setVisibility($("#meleeBehaviorContainer"), melee);
        setVisibility($("#meleeUtilitiesContainer"), melee);

        // Reset with 1 preset weapon and one empty one
        const defaultWeapon = melee ? "Mining Claw" : "Lgt. Assault Rifle";
        $("#weaponSelectContainer").empty();
        addWeaponSelect(defaultWeapon);
        addWeaponSelect("");
    }
});
