import * as items from "../json/items.json";
import * as itemsB11 from "../json/items_b11.json";
import { assertUnreachable, canShowPart, createItemDataContent, gallerySort, getMovementText, getValuePerTus, hasActiveSpecialProperty, initData, isPartMelee, itemData, parseIntOrDefault } from "./common";
import { createHeader, getSelectedButtonId, getSpoilersState, resetButtonGroup } from "./commonJquery";
import { Actuator, BaseItem, EnergyStorage, FusionCompressor, HeatDissipation, ItemSlot, ItemType, ItemWithUpkeep, JsonItem, MassSupport, PowerAmplifier, PowerItem, PropulsionItem, RangedWeaponCycling, WeaponItem, WeaponRegen } from "./itemTypes";

import * as jQuery from "jquery";
import "bootstrap";
import "bootstrap-select";
import { getRangedVolleyTime, volleyTimeMap } from "./simulatorCalcs";

const jq = jQuery.noConflict();
jq(function ($) {
    $((document) => init());

    // The type of additional part info to display
    type InfoType =
        | "Coverage"
        | "Energy/Move"
        | "Energy/Turn"
        | "Energy/Volley"
        | "Heat/Move"
        | "Heat/Turn"
        | "Heat/Volley"
        | "Integrity"
        | "Mass";

    // Calculated information for each part
    type PartInfo = {
        coverage: number;
        energyPerMove: number;
        energyPerTurn: number;
        energyPerVolley: number;
        heatPerMove: number;
        heatPerTurn: number;
        heatPerVolley: number;
        integrity: number;
        mass: number;
    }

    type PercentageColor =
        | "Default"
        | "EnergyConsumption"
        | "EnergyGen"
        | "HeatDissipation"
        | "HeatGen"
        | "MassSupport"
        | "Mass";

    const percentageColorLookup: Record<PercentageColor, string> = {
        "Default": "#162416",
        "EnergyConsumption": "#000073",
        "EnergyGen": "#004a4a",
        "HeatDissipation": "#5b5b00",
        "HeatGen": "#633200",
        "MassSupport": "#5b5b00",
        "Mass": "#493e2e",
    };

    // Calculated total parts state
    type TotalPartsState = {
        // "Part" information for the core
        coreInfo: PartInfo;

        // Information for all parts
        partsInfo: PartInfo[];

        // Active propulsion item type, or undefined if core hovering
        activePropulsionType: ItemType | undefined;

        // Energy cost associated with propulsion parts by moving 1 tile
        energyUsePerMove: number;

        // Energy cost associated with weapon slots firing one volley
        energyUsePerVolley: number;

        // Heat generation associated with propulsion parts by moving 1 tile
        heatGenPerMove: number;

        energyStorage: number;
        
        // Heat generation associated with weapon slots firing one volley
        heatGenPerVolley: number;
        isMelee: boolean;
        totalCoverage: number;
        totalEnergyGenPerMove: number;
        totalEnergyGenPerTurn: number;
        totalEnergyGenPerVolley: number;
        totalEnergyUsePerMove: number;
        totalEnergyUsePerTurn: number;
        totalEnergyUsePerVolley: number;
        totalHeatDissipationPerMove: number;
        totalHeatDissipationPerTurn: number;
        totalHeatDissipationPerVolley: number;
        totalHeatGenPerMove: number;
        totalHeatGenPerTurn: number;
        totalHeatGenPerVolley: number;
        totalIntegrity: number;
        totalMass: number;

        // The total support calculated from all active propulsion as the same type as the first active slot
        totalSupport: number;

        // The number of TUs per move including overweight penalties
        tusPerMove: number;

        // The number of TUs per volley including cycling time but not melee followups
        tusPerVolley: number;
    };
    let partsState: TotalPartsState;

    type PartType = {
        name: string;
        id: string;
        defaults: string[],
        slot: ItemSlot;
    };
    const partTypes: PartType[] = [
        { name: "power", id: "powerContainer", defaults: ["Ion Engine"], slot: ItemSlot.Power },
        { name: "propulsion", id: "propulsionContainer", defaults: ["Aluminum Leg", "Aluminum Leg"], slot: ItemSlot.Propulsion },
        { name: "utility", id: "utilityContainer", defaults: ["Sml. Storage Unit"], slot: ItemSlot.Utility },
        { name: "weapon", id: "weaponContainer", defaults: ["Assault Rifle", "Med. Laser"], slot: ItemSlot.Weapon },
    ];
    function addPartSelect(type: PartType, initialSelection: string) {
        const container = $("#" + type.id);
        const spoilersState = getSpoilersState();

        // Get list of valid names
        const partNames: string[] = [];
        Object.keys(itemData).forEach(name => {
            const baseItem = itemData[name];

            // Slot check
            if (baseItem.slot !== type.slot) {
                return;
            }

            if (!canShowPart(baseItem, spoilersState)) {
                return;
            }

            partNames.push(baseItem.name);
        });

        // Sort and create options
        partNames.sort(gallerySort);
        const partOptions = partNames.map(w => `<option>${w}</option>`).join();

        const row = $('<div class="row mt-1"></div>');
        const partPickerColumn = $('<div class="col"></div>');
        const partPickerContainer = $('<div class="input-group"></div>');
        const infoColumn = $('<div class="col-3"></div>')
        const select = $(`<select class="selectpicker" data-live-search="true">${partOptions}</select>`);
        const helpButton = $('<button class="btn part-help-btn" data-html=true data-toggle="popover">?</button>');
        const activeContainer = $('<div class="btn-group btn-group-toggle ml-2" data-toggle="buttons"></div>');
        const activeLabelContainer = $('<div class="input-group-prepend" data-toggle="tooltip" title="Whether the part is active."></div>');
        const activeLabel = $('<span class="input-group-text">Active</span>');
        const yesLabel = $('<label class="btn"><input type="radio" name="options">Yes</input></label>');
        const noLabel = $('<label class="btn"><input type="radio" name="options">No</input></label>');
        const deleteButton = $('<button class="btn ml-2" data-toggle="tooltip" title="Removes the part.">X</button>');

        // Add elements to DOM
        container.append(row);
        row.append(partPickerColumn);
        row.append(infoColumn);
        partPickerColumn.append(partPickerContainer);
        partPickerContainer.append(select);
        partPickerContainer.append(helpButton);
        partPickerContainer.append(activeContainer);
        activeContainer.append(activeLabelContainer);
        activeLabelContainer.append(activeLabel);
        activeContainer.append(yesLabel);
        activeContainer.append(noLabel);
        partPickerContainer.append(deleteButton);

        resetButtonGroup(activeContainer);

        // Add handlers
        deleteButton.on("click", () => {
            // Ensure the last dropdown is always empty
            if (row.next().length === 0) {
                addPartSelect(type, "");
            }

            // Remove the associated item
            select.selectpicker("destroy");
            (deleteButton as any).tooltip("dispose");
            row.remove();

            updateAll();
        });
        activeContainer.find("input").on("change", () => {
            updateAll();
        });

        select.selectpicker("val", initialSelection);

        const updateContent = (partName: string) => {
            let part: BaseItem | undefined;

            if (partName in itemData) {
                part = itemData[partName] as BaseItem;
                helpButton.attr("data-content", createItemDataContent(part));
                (helpButton as any).popover();

                updateAll();
            }
        };

        updateContent(initialSelection);

        // Update content when the weapon selection changes
        select.on("changed.bs.select", () => {
            if (row.next().length === 0) {
                addPartSelect(type, "");
            }

            updateContent(select.selectpicker("val") as any as string);
        });

        select.parent().addClass("part-dropdown");

        // Enable tooltips
        (deleteButton as any).tooltip();

        // Minor hack, the btn-light class is auto-added to dropdowns with search 
        // but it doesn't really fit with everything else
        partPickerContainer.find(".btn-light").removeClass("btn-light");
    }

    // Appends a percentage bar to the specified element
    function addPercentageBar(selector: JQuery<HTMLElement>, value: number, percentage: number, color: PercentageColor) {
        const valueText = Number.isInteger(value) ? value.toString() : value.toFixed(1);
        const percentageText = value === 0 ? value : `${valueText} ${percentage.toFixed(1)}%`;
        const container = $('<div class="percentage-bar-container"></div>');
        const span = $(`<span class="percentage-bar-text ml-1">${percentageText}</span>`);
        const percentageBar = $(`<div class="percentage-bar-inner"></div>`);
        percentageBar.css("background-color", percentageColorLookup[color]);
        const percentageWidth = percentage > 100 ? "100.0" : percentage;
        percentageBar.width(`${percentageWidth}%`);
        container.append(span);
        container.append(percentageBar);
        selector.append(container);
    }

    // Gets the current depth, enforcing range limits
    function getDepth() {
        let depth = Math.abs(parseIntOrDefault($("#depthInput").val(), 10));
        return Math.max(1, Math.min(10, depth));
    }

    const idToInfoTypeMap: Record<string, InfoType> = {
        "partInfoCoverage": "Coverage",
        "partInfoEnergyPerMove": "Energy/Move",
        "partInfoEnergyPerTurn": "Energy/Turn",
        "partInfoEnergyPerVolley": "Energy/Volley",
        "partInfoHeatPerMove": "Heat/Move",
        "partInfoHeatPerTurn": "Heat/Turn",
        "partInfoHeatPerVolley": "Heat/Volley",
        "partInfoIntegrity": "Integrity",
        "partInfoMass": "Mass",
    };
    // Gets the currently selected part info type
    function getInfoType() {
        let buttonId = getSelectedButtonId($("#infoTypeContainer"));
        if (buttonId === undefined || buttonId == "") {
            // Reset group if nothing is selected
            resetButtonGroup($("#infoTypeContainer"));
            buttonId = getSelectedButtonId($("#infoTypeContainer"));
        }
        return idToInfoTypeMap[buttonId];
    }

    // Initialize the page state
    function init() {
        $("#beta11Checkbox").prop("checked", false);

        initData(items as { [key: string]: JsonItem }, undefined);

        createHeader("Build", $("#headerContainer"));
        resetButtonGroup($("#infoTypeContainer"));

        initializePartsSelects();
        resetValues();

        // Add handlers
        $("#reset").on("click", () => {
            ($("#reset") as any).tooltip("hide");
            resetValues();
        });
        $("#depthInput").on("input", updateAll);
        $("#energyGenInput").on("input", updateAll);
        $("#heatDissipationInput").on("input", updateAll);
        $("#infoTypeContainer > label > input").on("change", e => {
            // Tooltips on buttons need to be explicitly hidden on press
            ($(e.target).parent() as any).tooltip("hide");
            updateAllPartInfo();
        });

        $("#beta11Checkbox").on("change", () => {
            const newItems = $("#beta11Checkbox").prop("checked") ? itemsB11 : items;

            initData(newItems as { [key: string]: JsonItem }, undefined);

            // Initialize page state
            resetValues();

            ($("#beta11Checkbox").parent() as any).tooltip("hide");
        });

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            const targetPopover = $(e.target).parents(".popover").length != 0;

            if (targetPopover) {
                $(e.target).trigger("blur");
            }
            else if (!targetPopover && $(".popover").length >= 1) {
                ($('[data-toggle="popover"]') as any).not(e.target).popover("hide");
            }
        });

        // Enable tooltips/popovers
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Adds the initial empty part selects for each type
    function initializePartsSelects() {
        partTypes.forEach(type => {
            addPartSelect(type, "");
        });
    }

    // Resets all part selects to their default values
    function resetPartSelects() {
        partTypes.forEach(type => {
            const container = $("#" + type.id);

            // Remove old options by pressing each delete button
            container.find(".input-group > button:last-child").trigger("click");

            type.defaults.forEach(partName => {
                container.find("select:last").selectpicker("val", partName);
            });
        });
    }

    // Resets all values on the page
    function resetValues() {
        $("#depthInput").val("");
        $("#energyGenInput").val("");
        $("#heatDissipationInput").val("");
        resetPartSelects();
    }

    // Updates all calculated part info, then updates individual part info rows
    function updateAll() {
        updatePartsState();
        updateAllPartInfo();
        updateSummary();
    }

    // Updates the extra part info for all parts
    function updateAllPartInfo() {
        let index = 0;

        partTypes.map(p => p.id).forEach(id => {
            $("#" + id).children("div").each((_, element) => {
                const selector = $(element);
                const partName = selector.find("select").selectpicker("val") as any as string;

                if (partName in itemData) {
                    updatePartInfo(selector.children("div:last"), partsState.partsInfo[index]);
                    index += 1;
                }
            })
        });

        updateCoreInfo();
    }

    // Updates the core info
    function updateCoreInfo() {
        const infoType = getInfoType();
        const infoContainer = $("#coreInfoContainer");
        infoContainer.empty();

        switch (infoType) {
            case "Coverage":
                addPercentageBar(infoContainer, 100, 10000 / partsState.totalCoverage, "Default");
                break;

            case "Energy/Move":
                {
                    const energy = partsState.coreInfo.energyPerMove;
                    const energyPercent = energy * 100 / partsState.totalEnergyGenPerMove;
                    addPercentageBar(infoContainer, energy, energyPercent, "EnergyGen");
                    break;
                }

            case "Energy/Turn":
                {
                    const energy = partsState.coreInfo.energyPerTurn;
                    const energyPercent = energy * 100 / partsState.totalEnergyGenPerTurn;
                    addPercentageBar(infoContainer, energy, energyPercent, "EnergyGen");
                    break;
                }

            case "Energy/Volley":
                {
                    const energy = partsState.coreInfo.energyPerVolley;
                    const energyPercent = energy * 100 / partsState.totalEnergyGenPerVolley;
                    addPercentageBar(infoContainer, energy, energyPercent, "EnergyGen");
                    break;
                }

            case "Heat/Move":
                {
                    const heat = partsState.coreInfo.heatPerMove;
                    const heatPercent = -heat * 100 / partsState.totalHeatDissipationPerMove;
                    addPercentageBar(infoContainer, heat, heatPercent, "HeatDissipation");
                    break;
                }

            case "Heat/Turn":
                {
                    const heat = partsState.coreInfo.heatPerTurn;
                    const heatPercent = -heat * 100 / partsState.totalHeatDissipationPerTurn;
                    addPercentageBar(infoContainer, heat, heatPercent, "HeatDissipation");
                    break;
                }

            case "Heat/Volley":
                {
                    const heat = partsState.coreInfo.heatPerVolley;
                    const heatPercent = -heat * 100 / partsState.totalHeatDissipationPerVolley;
                    addPercentageBar(infoContainer, heat, heatPercent, "HeatDissipation");
                    break;
                }

            case "Integrity":
                const integrity = partsState.coreInfo.integrity;
                const integrityPercent = integrity * 100 / partsState.totalIntegrity;
                addPercentageBar(infoContainer, integrity, integrityPercent, "Default");
                break;

            case "Mass":
                const support = partsState.coreInfo.mass;
                const supportPercent = -support * 100 / partsState.totalSupport;
                addPercentageBar(infoContainer, support, supportPercent, "MassSupport");
                break;

            default:
                assertUnreachable(infoType);
        }
    }

    // Updates the additional part info based on the chosen info type
    function updatePartInfo(infoColumn: JQuery<HTMLElement>, partInfo: PartInfo) {
        infoColumn.empty();

        const infoType = getInfoType();
        switch (infoType) {
            case "Coverage":
                {
                    // Add coverage info and percentage bar
                    const coverage = partInfo.coverage;
                    const coveragePercent = (coverage * 100 / partsState.totalCoverage);
                    addPercentageBar(infoColumn, coverage, coveragePercent, "Default");
                    break;
                }

            case "Energy/Move":
                {
                    // Add energy/move info and percentage bar
                    let energy = partInfo.energyPerMove;
                    let energyPercent = 0;
                    let color: PercentageColor = "Default";
                    if (energy > 0) {
                        energyPercent = energy * 100 / partsState.totalEnergyGenPerMove;
                        color = "EnergyGen";
                    }
                    else if (energy < 0) {
                        energyPercent = -energy * 100 / partsState.totalEnergyUsePerMove;
                        color = "EnergyConsumption";
                    }

                    addPercentageBar(infoColumn, energy, energyPercent, color);
                    break;
                }

            case "Energy/Turn":
                {
                    // Add energy/turn info and percentage bar
                    let energy = partInfo.energyPerTurn;
                    let energyPercent = 0;
                    let color: PercentageColor = "Default";
                    if (energy > 0) {
                        energyPercent = energy * 100 / partsState.totalEnergyGenPerTurn;
                        color = "EnergyGen";
                    }
                    else if (energy < 0) {
                        energyPercent = -energy * 100 / partsState.totalEnergyUsePerTurn;
                        color = "EnergyConsumption";
                    }

                    addPercentageBar(infoColumn, energy, energyPercent, color);
                    break;
                }

            case "Energy/Volley":
                {
                    // Add energy/volley info and percentage bar
                    let energy = partInfo.energyPerVolley;
                    let energyPercent = 0;
                    let color: PercentageColor = "Default";
                    if (energy > 0) {
                        energyPercent = energy * 100 / partsState.totalEnergyGenPerVolley;
                        color = "EnergyGen";
                    }
                    else if (energy < 0) {
                        energyPercent = -energy * 100 / partsState.totalEnergyUsePerVolley;
                        color = "EnergyConsumption";
                    }

                    addPercentageBar(infoColumn, energy, energyPercent, color);
                    break;
                }

            case "Heat/Move":
                {
                    // Add heat/move info and percentage bar
                    let heat = partInfo.heatPerMove;
                    let heatPercent = 0;
                    let color: PercentageColor;
                    if (heat > 0) {
                        heatPercent = heat * 100 / partsState.totalHeatGenPerMove;
                        color = "HeatGen";
                    }
                    else {
                        heatPercent = -heat * 100 / partsState.totalHeatDissipationPerMove;
                        color = "HeatDissipation";
                    }

                    addPercentageBar(infoColumn, heat, heatPercent, color);
                    break;
                }

            case "Heat/Turn":
                {
                    // Add heat/turn info and percentage bar
                    let heat = partInfo.heatPerTurn;
                    let heatPercent = 0;
                    let color: PercentageColor;
                    if (heat > 0) {
                        heatPercent = heat * 100 / partsState.totalHeatGenPerTurn;
                        color = "HeatGen"
                    }
                    else {
                        heatPercent = -heat * 100 / partsState.totalHeatDissipationPerTurn;
                        color = "HeatDissipation"
                    }

                    addPercentageBar(infoColumn, heat, heatPercent, color);
                    break;
                }

            case "Heat/Volley":
                {
                    // Add heat/volley info and percentage bar
                    let heat = partInfo.heatPerVolley;
                    let heatPercent = 0;
                    let color: PercentageColor;
                    if (heat > 0) {
                        heatPercent = heat * 100 / partsState.totalHeatGenPerVolley;
                        color = "HeatGen"
                    }
                    else {
                        heatPercent = -heat * 100 / partsState.totalHeatDissipationPerVolley;
                        color = "HeatDissipation"
                    }

                    addPercentageBar(infoColumn, heat, heatPercent, color);
                    break;
                }

            case "Integrity":
                {
                    // Add integrity info and percentage bar
                    const integrity = partInfo.integrity;
                    const integrityPercent = integrity * 100 / partsState.totalIntegrity;
                    addPercentageBar(infoColumn, integrity, integrityPercent, "Default");
                    break;
                }

            case "Mass":
                {
                    // Add mass info and percentage bar
                    // If we're a propulsion item then show negative mass for support and the total support percent
                    let mass = partInfo.mass;
                    let massPercent = 0;
                    let color: PercentageColor;
                    if (mass > 0) {
                        massPercent = mass * 100 / partsState.totalMass;
                        color = "Mass";
                    }
                    else {
                        massPercent = -mass * 100 / partsState.totalSupport;
                        color = "MassSupport";
                    }

                    addPercentageBar(infoColumn, mass, massPercent, color);
                    break;
                }

            default:
                assertUnreachable(infoType);
        }
    }

    type Part = {
        abilityActive: boolean,
        active: boolean,
        part: BaseItem,
    };
    // Recalculates the total parts state based on all current items
    function updatePartsState() {
        function sum(a: number, b: number) { return a + b; }

        function getEnergyPerMove(p: Part, powerAmplifierBonus: number, tusPerMove: number) {
            if (!p.active) {
                return 0;
            }

            // Return positive value for energy gen, negative for consumption
            if (p.part.slot === ItemSlot.Propulsion) {
                const energyPerTurn = getEnergyPerTurn(p, powerAmplifierBonus);
                return getValuePerTus(energyPerTurn, tusPerMove) - ((p.part as PropulsionItem).energyPerMove ?? 0);
            }
            else {
                return getValuePerTus(getEnergyPerTurn(p, powerAmplifierBonus), tusPerMove);
            }
        }

        function getEnergyPerTurn(p: Part, powerAmplifierBonus: number) {
            // Return positive value for energy gen, negative for consumption
            if (p.active && p.part.slot === ItemSlot.Power) {
                // Multiply only power-slot energy generation by the power amplifier bonus
                return ((p.part as PowerItem).energyGeneration ?? 0) * powerAmplifierBonus;
            }
            else if (hasActiveSpecialProperty(p.part, p.abilityActive, "FusionCompressor")) {
                // Fusion compressors convert matter to energy
                return (p.part.specialProperty!.trait as FusionCompressor).energyPerTurn;
            }
            else if (p.active && p.part.slot === ItemSlot.Propulsion || p.part.slot === ItemSlot.Utility) {
                return -((p.part as ItemWithUpkeep).energyUpkeep ?? 0);
            }
            else if (hasActiveSpecialProperty(p.part, p.abilityActive, "WeaponRegen")) {
                // Weapon regen ability turns energy into weapon integrity
                return -(p.part.specialProperty!.trait as WeaponRegen).energyPerTurn;
            }

            return 0;
        }

        function getEnergyPerVolley(p: Part, powerAmplifierBonus: number, tusPerVolley: number) {
            if (!p.active) {
                return 0;
            }

            // Return positive value for energy gen, negative for consumption
            if (p.part.slot === ItemSlot.Weapon) {
                return -((p.part as WeaponItem).shotEnergy ?? 0);
            }
            else {
                return getValuePerTus(getEnergyPerTurn(p, powerAmplifierBonus), tusPerVolley);
            }
        }

        function getHeatPerMove(p: Part, tusPerMove: number) {
            // Return negative value for heat dissipation, positive for generation
            if (p.active && p.part.slot === ItemSlot.Propulsion) {
                return getValuePerTus(getHeatPerTurn(p), tusPerMove) + ((p.part as PropulsionItem).heatPerMove ?? 0);
            }
            else {
                return getValuePerTus(getHeatPerTurn(p), tusPerMove);
            }
        }

        function getHeatPerTurn(p: Part) {
            // Return negative value for heat dissipation, positive for generation
            if (hasActiveSpecialProperty(p.part, p.active, "HeatDissipation")) {
                return -(p.part.specialProperty!.trait as HeatDissipation).dissipation;
            }
            else if (p.active && (p.part.slot === ItemSlot.Power
                || p.part.slot === ItemSlot.Propulsion || p.part.slot === ItemSlot.Utility)) {
                return (p.part as ItemWithUpkeep).heatGeneration ?? 0;
            }

            return 0;
        }

        function getHeatPerVolley(p: Part, tusPerVolley: number) {
            if (!p.active) {
                return 0;
            }

            // Return negative values for heat dissipation, positive for generation
            if (p.part.slot === ItemSlot.Weapon) {
                return (p.part as WeaponItem).shotHeat ?? 0;
            }
            else {
                return getValuePerTus(getHeatPerTurn(p), tusPerVolley);
            }
        }

        function getMass(p: Part) {
            // Return negative value for support, positive for mass used
            if (p.active && (p.part.slot === ItemSlot.Propulsion)) {
                return -(p.part as PropulsionItem).support;
            }
            else if (hasActiveSpecialProperty(p.part, p.active, "MassSupport")) {
                return -(p.part.specialProperty!.trait as MassSupport).support;
            }
            else {
                return p.part.mass ?? 0;
            }
        }

        // Get the definitions of all parts
        const parts: Part[] = [];
        partTypes.map(p => p.id).forEach(id => {
            $("#" + id).find(".input-group").each((_, element) => {
                const selector = $(element);

                // Check if the part is active
                const active = selector.find("label:first").hasClass("active");

                // Try to get the selected part
                const partName = selector.find("select").selectpicker("val") as any as string;
                if (partName in itemData) {
                    parts.push({ abilityActive: active, active: active, part: itemData[partName] as BaseItem });
                }
            });
        });

        // Calculate propulsion-related stats
        let firstProp = parts.find(p => p.active && p.part.slot === ItemSlot.Propulsion);
        let propulsionType: ItemType | undefined;
        let totalSupport: number;
        const totalMass = parts.map(p => p.part.mass ?? 0).reduce(sum, 0);
        if (firstProp !== undefined) {
            propulsionType = firstProp.part.type;
        }
        const activeProp = parts.filter(p => p.active && p.part.type === propulsionType).map(p => p.part as PropulsionItem);
        activeProp.sort((a, b) => (a.modPerExtra ?? 0) - (b.modPerExtra ?? 0));
        if (activeProp.length === 0) {
            // Core hover has 3 support
            totalSupport = 3;
        }
        else {
            // Sum support of all active prop
            totalSupport = activeProp.map(p => p.support).reduce(sum, 0);
        }

        // Add mass support utils
        totalSupport += parts.filter(p => hasActiveSpecialProperty(p.part, p.active, "MassSupport"))
            .map(p => (p.part.specialProperty!.trait as MassSupport).support)
            .reduce(sum, 0);

        // Set irrelevant prop types to inactive
        parts.forEach(p => {
            if (p.part.slot === ItemSlot.Propulsion && !activeProp.includes(p.part as PropulsionItem)) {
                p.active = false;
            }
        });

        let tusPerMove: number;
        let overweightPenalty: number;
        if (activeProp.length === 0) {
            // If no active prop then use core hover speed initially...
            tusPerMove = 50;
            overweightPenalty = 50;
        }
        else {
            // First calculate the average speed of all parts...
            tusPerMove = Math.trunc(activeProp.map(p => p.timePerMove).reduce(sum, 0) / activeProp.length);

            // Then calculate average penalty of all parts...
            overweightPenalty = Math.trunc(activeProp.map(p => p.penalty).reduce(sum, 0) / activeProp.length);

            // Then apply per/move mods...
            tusPerMove -= activeProp.filter((_, i) => i !== 0).map(p => p.modPerExtra ?? 0).reduce(sum, 0);

            // Then apply overload mods...
            // TODO
        }

        // Then apply overweight penalties...
        tusPerMove += Math.trunc(totalMass / totalSupport) * overweightPenalty;

        // Then apply drag penalties if airborne...
        if (propulsionType === ItemType.FlightUnit || propulsionType === ItemType.HoverUnit) {
            tusPerMove += parts.filter(p => p.part.slot === ItemSlot.Propulsion)
                .map(p => (p.part as PropulsionItem).drag ?? 0)
                .reduce(sum, 0);
        }

        // Also apply a cap of 20 for hover or 10 for flight
        if (propulsionType === ItemType.FlightUnit) {
            tusPerMove = Math.max(tusPerMove, 10);
        }
        else if (propulsionType === ItemType.HoverUnit) {
            tusPerMove = Math.max(tusPerMove, 10);
        }

        // Calculate weapon-related stats
        const firstWeapon = parts.find(p => p.active && p.part.slot === ItemSlot.Weapon);
        const isMelee = firstWeapon !== undefined && isPartMelee(firstWeapon.part);

        // Set irrelevant weapon types to inactive
        let activeWeapons: WeaponItem[] = new Array();
        parts.forEach(p => {
            if (p.part.slot !== ItemSlot.Weapon) {
                return;
            }

            if (isMelee && !isPartMelee(p.part) || (!isMelee && isPartMelee(p.part))) {
                p.active = false;
            }
            else if (p.active) {
                activeWeapons.push(p.part as WeaponItem);
            }
        });

        let tusPerVolley: number;
        if (isMelee) {
            // Assumes that all actuators stack up to 50%
            const actuatorParts = parts.filter(p => hasActiveSpecialProperty(p.part, p.active, "Actuator"));
            const actuatorModifier = 1 - Math.min(
                .5,
                actuatorParts.map(p => (p.part.specialProperty!.trait as Actuator).amount).reduce(sum, 0));

            tusPerVolley = actuatorModifier * ((activeWeapons[0].delay ?? 0) + volleyTimeMap[1]);
        }
        else {
            const cyclerParts = parts.filter(p => hasActiveSpecialProperty(p.part, p.active, "RangedWeaponCycling"));
            let cyclerModifier: number;
            // Semi-hacky, assumes that 50% cyclers are no-stack and all others stack up to 30%
            if (cyclerParts.find(p => (p.part.specialProperty!.trait as RangedWeaponCycling).amount === 50) !== undefined) {
                cyclerModifier = .5;
            }
            else {
                cyclerModifier = 1 - Math.min(
                    .3,
                    cyclerParts.map(p => (p.part.specialProperty!.trait as RangedWeaponCycling).amount)
                        .reduce(sum, 0));
            }

            tusPerVolley = getRangedVolleyTime(activeWeapons, cyclerModifier);
        }

        const depth = getDepth();
        const innateEnergyGen = parseIntOrDefault($("#energyGenInput").val(), 0);
        const innateHeatDissipation = parseIntOrDefault($("#heatDissipationInput").val(), 0);

        // Calculate core info
        const coreInfo: PartInfo = {
            coverage: 100,
            energyPerMove: activeProp.length > 0 ? getValuePerTus(5, tusPerMove) : (getValuePerTus(5, tusPerMove) - 1),
            energyPerTurn: 5,
            energyPerVolley: activeProp.length > 0 ? getValuePerTus(5, tusPerVolley) : (getValuePerTus(5, tusPerVolley) - 1),
            heatPerMove: -getValuePerTus(55 - (3 * depth) + innateHeatDissipation, tusPerMove),
            heatPerTurn: -(55 - (3 * depth) + innateHeatDissipation),
            heatPerVolley: -getValuePerTus(55 - (3 * depth) + innateHeatDissipation, tusPerVolley),
            integrity: 1750 - (150 * depth),
            mass: activeProp.length > 0 ? 0 : -3,
        };

        // Get energy bonuses
        const powerAmplifierBonus = 1 + parts.map(p => {
            if (hasActiveSpecialProperty(p.part, p.active, "PowerAmplifier")) {
                return (p.part.specialProperty!.trait as PowerAmplifier).percent;
            }

            return 0;
        }).reduce(sum, 0);

        // Calculate info for each part
        const partsInfo: PartInfo[] = parts.map(p => {
            return {
                coverage: p.part.coverage ?? 0,
                energyPerMove: getEnergyPerMove(p, powerAmplifierBonus, tusPerMove),
                energyPerTurn: getEnergyPerTurn(p, powerAmplifierBonus),
                energyPerVolley: getEnergyPerVolley(p, powerAmplifierBonus, tusPerVolley),
                heatPerMove: getHeatPerMove(p, tusPerMove),
                heatPerTurn: getHeatPerTurn(p),
                heatPerVolley: getHeatPerVolley(p, tusPerVolley),
                integrity: p.part.integrity,
                mass: getMass(p),
            };
        });

        // Calculate totals
        // Core is 100 coverage
        const allPartInfo = partsInfo.concat(coreInfo);
        const totalCoverage = allPartInfo.map(p => p.coverage).reduce(sum, 0);
        const totalEnergyGenPerTurn = innateEnergyGen + allPartInfo
            .map(p => p.energyPerTurn > 0 ? p.energyPerTurn : 0).reduce(sum, 0);
        const totalEnergyUsePerTurn = allPartInfo.map(p => p.energyPerTurn < 0 ? -p.energyPerTurn : 0).reduce(sum, 0);
        const totalHeatDissipationPerTurn = allPartInfo.map(p => p.heatPerTurn < 0 ? -p.heatPerTurn : 0).reduce(sum, 0);
        const totalHeatGenPerTurn = allPartInfo.map(p => p.heatPerTurn > 0 ? p.heatPerTurn : 0).reduce(sum, 0);
        const totalIntegrity = allPartInfo.map(p => p.integrity).reduce(sum, 0);

        let energyPerMove = activeProp.map(p => p.energyPerMove ?? 0).reduce(sum, 0);
        if (energyPerMove === 0) {
            // Core hover has 1 energy per move cost
            energyPerMove = 1;
        }
        const heatPerMove = activeProp.map(p => p.heatPerMove ?? 0).reduce(sum, 0);
        const totalEnergyGenPerMove = getValuePerTus(totalEnergyGenPerTurn, tusPerMove);
        const totalEnergyUsePerMove = getValuePerTus(totalEnergyUsePerTurn, tusPerMove) + energyPerMove;
        const totalHeatDissipationPerMove = getValuePerTus(totalHeatDissipationPerTurn, tusPerMove);
        const totalHeatGenPerMove = getValuePerTus(totalHeatGenPerTurn, tusPerMove) + heatPerMove;

        const energyPerVolley = activeWeapons.map(p => p.shotEnergy ?? 0).reduce(sum, 0);
        const heatPerVolley = activeWeapons.map(p => p.shotHeat ?? 0).reduce(sum, 0);
        const totalEnergyGenPerVolley = getValuePerTus(totalEnergyGenPerTurn, tusPerVolley);
        const totalEnergyUsePerVolley = getValuePerTus(totalEnergyUsePerTurn, tusPerVolley) + energyPerVolley;
        const totalHeatDissipationPerVolley = getValuePerTus(totalHeatDissipationPerTurn, tusPerVolley);
        const totalHeatGenPerVolley = getValuePerTus(totalHeatGenPerTurn, tusPerVolley) + heatPerVolley;

        const energyStorage = 100 + parts.map(p => {
            if (hasActiveSpecialProperty(p.part, p.active, "EnergyStorage")) {
                return (p.part.specialProperty!.trait as EnergyStorage).storage;
            }
            else if (p.active && p.part.slot === ItemSlot.Power) {
                return (p.part as PowerItem).energyStorage ?? 0;
            }
            else {
                return 0;
            }
        }).reduce(sum, 0);

        partsState = {
            activePropulsionType: propulsionType,
            coreInfo: coreInfo,
            isMelee: isMelee,
            partsInfo: partsInfo,
            energyStorage: energyStorage,
            energyUsePerMove: energyPerMove,
            energyUsePerVolley: energyPerVolley,
            heatGenPerMove: heatPerMove,
            heatGenPerVolley: heatPerVolley,
            totalCoverage: totalCoverage,
            totalEnergyGenPerMove: totalEnergyGenPerMove,
            totalEnergyGenPerTurn: totalEnergyGenPerTurn,
            totalEnergyGenPerVolley: totalEnergyGenPerVolley,
            totalEnergyUsePerMove: totalEnergyUsePerMove,
            totalEnergyUsePerTurn: totalEnergyUsePerTurn,
            totalEnergyUsePerVolley: totalEnergyUsePerVolley,
            totalHeatDissipationPerMove: totalHeatDissipationPerMove,
            totalHeatDissipationPerTurn: totalHeatDissipationPerTurn,
            totalHeatDissipationPerVolley: totalHeatDissipationPerVolley,
            totalHeatGenPerTurn: totalHeatGenPerTurn,
            totalHeatGenPerMove: totalHeatGenPerMove,
            totalHeatGenPerVolley: totalHeatGenPerVolley,
            totalIntegrity: totalIntegrity,
            totalMass: totalMass,
            totalSupport: totalSupport,
            tusPerMove: tusPerMove,
            tusPerVolley: tusPerVolley,
        };
    }

    // Updates all of the summary information based on the current state
    function updateSummary() {
        const summaryContainer = $("#summaryContainer");

        function addInfo(name: string, value: number | string, description: string) {
            if (typeof (value) === "number" && !Number.isInteger(value)) {
                // If a number then round to 10ths place
                value = value.toFixed(1);
            }
            const newElement = $(`<div class="input-group-prepend mr-1 mt-1" data-toggle="tooltip"
                title="${description}">
                <span class="input-group-text">${name}: ${value}</span>
            </div>`);

            summaryContainer.append(newElement);
            (newElement as any).tooltip();
        }

        // Remove old summary items
        (summaryContainer.children() as any).tooltip("dispose");
        summaryContainer.empty();

        const overweightText = partsState.totalSupport >= partsState.totalMass ?
            ""
            : " 0x" + Math.trunc(partsState.totalMass / partsState.totalSupport);
        addInfo("Support", `${partsState.totalMass}/${partsState.totalSupport}${overweightText}`,
            "Total mass / total support, including overweight multiplier if applicable.");
        addInfo("Movement", `${getMovementText(partsState.activePropulsionType)} (${partsState.tusPerMove})`,
            "Movement type and speed.");
        addInfo("Total Integrity", partsState.totalIntegrity, "Total integrity of all parts and core.");
        addInfo("Total Coverage", partsState.totalCoverage, "Total coverage of all parts and core.");
        addInfo("Energy Storage", partsState.energyStorage, "Total energy storage of all equipped parts");
        addInfo("Energy/Turn", partsState.totalEnergyGenPerTurn - partsState.totalEnergyUsePerTurn,
            "The amount of energy gained (or lost) per turn by waiting.");
        addInfo("Heat/Turn", partsState.totalHeatGenPerTurn - partsState.totalHeatDissipationPerTurn,
            "The amount of heat gained (or lost) per turn by waiting.");
        addInfo("Energy/Move", partsState.totalEnergyGenPerMove - partsState.totalEnergyUsePerMove,
            "The amount of energy gained (or lost) per single tile move.");
        addInfo("Heat/Move", partsState.totalHeatGenPerMove - partsState.totalHeatDissipationPerMove,
            "The amount of heat gained (or lost) per single tile move.");
        addInfo("Volley Time", partsState.tusPerVolley, "The amount of TUs per volley.");
        addInfo("Energy/Volley", partsState.totalEnergyGenPerVolley - partsState.totalEnergyUsePerVolley,
            "The amount of energy gained (or lost) per full volley.");
        addInfo("Heat/Volley", partsState.totalHeatGenPerVolley - partsState.totalHeatDissipationPerVolley,
            "The amount of heat gained (or lost) per full volley.");
    }
});