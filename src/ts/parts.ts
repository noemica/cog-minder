import {
    createItemDataContent,
    gallerySort,
    getItem,
    initData,
    itemData,
    nameToId,
    setSpoilersState,
} from "./common";
import {
    getSelectedButtonId,
    getSpoilersState,
    resetButtonGroup
} from "./commonJquery";
import {
    Item,
} from "./itemTypes";

import * as jQuery from "jquery";
import "bootstrap";

const jq = jQuery.noConflict();
jq(function ($) {
    // Category ID -> 
    const categoryIdMap = {
        "category0b10": 0,
        "categoryAlien": 1,
        "categoryDerelict": 2,
        "categoryExile": 3,
        "categoryTesting": 4,
        "categoryGolem": 5,
        "categorySpoiler": 6,
        "categoryRedacted": 7,
        "categoryUnobtainable": 8,
    };

    // Map of item names to item elements, created at page init
    const itemElements = {};

    // Spoiler category HTML ids
    const spoilerCategoryIds = [
        "categoryAlien",
        "categoryTesting",
        "categoryGolem",
        "utilTypeArtifact",
    ];

    // List of categories hidden on "None" spoilers type
    const noneHiddenCategories = [
        "categoryAlien",
        "categoryTesting",
        "categoryGolem",
        "categorySpoiler",
        "categoryRedacted"
    ].map(id => categoryIdMap[id]);

    // List of categories hidden on "Spoilers" spoilers type
    const spoilerHiddenCategories = [
        "categoryRedacted"
    ].map(id => categoryIdMap[id]);

    // Slot ID -> Slot string
    const slotMap: { [key: string]: string } = {
        "slotOther": "N/A",
        "slotPower": "Power",
        "slotPropulsion": "Propulsion",
        "slotUtility": "Utility",
        "slotWeapon": "Weapon",
    };

    // Terminal ID -> int level
    const terminalLevelMap: { [key: string]: number } = {
        "terminalLevel1": 1,
        "terminalLevel2": 2,
        "terminalLevel3": 3,
    }

    // Type ID -> Type string
    const typeMap: { [key: string]: string } = {
        "powerTypeEngine": "Engine",
        "powerTypePowerCore": "Power Core",
        "powerTypeReactor": "Reactor",
        "propTypeFlight": "Flight Unit",
        "propTypeHover": "Hover Unit",
        "propTypeLeg": "Leg",
        "propTypeTread": "Treads",
        "propTypeWheel": "Wheel",
        "utilTypeArtifact": "Artifact",
        "utilTypeDevice": "Device",
        "utilTypeHackware": "Hackware",
        "utilTypeProcessor": "Processor",
        "utilTypeProtection": "Protection",
        "utilTypeStorage": "Storage",
        "weaponTypeBallisticCannon": "Ballistic Cannon",
        "weaponTypeBallisticGun": "Ballistic Gun",
        "weaponTypeEnergyCannon": "Energy Cannon",
        "weaponTypeEnergyGun": "Energy Gun",
        "weaponTypeImpactWeapon": "Impact Weapon",
        "weaponTypeLauncher": "Launcher",
        "weaponTypePiercingWeapon": "Piercing Weapon",
        "weaponTypeSlashingWeapon": "Slashing Weapon",
        "weaponTypeSpecialMeleeWeapon": "Special Melee Weapon",
        "weaponTypeSpecialWeapon": "Special Weapon",
    };

    // Slot ID -> Type button container ID
    const slotIdToTypeIdMap: { [key: string]: string } = {
        "slotPower": "powerTypeContainer",
        "slotPropulsion": "propTypeContainer",
        "slotUtility": "utilTypeContainer",
        "slotWeapon": "weaponTypeContainer",
    }

    $((document) => init());

    // Creates buttons for all items
    function createItems() {
        const itemNames = Object.keys(itemData);
        const itemsGrid = $("#itemsGrid");
        itemNames.forEach((itemName) => {
            const item = itemData[itemName];
            const itemId = nameToId(itemName);
            const element = $(
                `<button
                    id="${itemId}"
                    class="item btn"
                    type="button"
                    data-html=true
                    data-content='${createItemDataContent(item)}'
                    data-toggle="popover">
                    ${itemName}
                 </button>`);

            itemElements[itemName] = element;
            itemsGrid.append(element);
        });

        // Enable popovers
        ($('#itemsGrid > [data-toggle="popover"]') as any).popover();
    }

    // Gets a filter function combining all current filters
    function getItemFilter() {
        const filters: ((item: Item) => boolean)[] = [];

        // Spoilers filter
        const spoilersState = getSpoilersState();
        if (spoilersState === "None") {
            filters.push((item) =>
                !item.categories.some(c => noneHiddenCategories.includes(c))
            );
        }
        else if (spoilersState === "Spoilers") {
            filters.push(item =>
                !item.categories.some(c => spoilerHiddenCategories.includes(c))
            );
        }

        // Name filter
        const nameValue = ($("#name").val() as string).toLowerCase();
        if (nameValue.length > 0) {
            filters.push(item => item.name.toLowerCase().includes(nameValue));
        }

        // Effect/Description filter
        const effectValue = ($("#effect").val() as string).toLowerCase();
        if (effectValue.length > 0) {
            filters.push(item => {
                if (item.effect?.toLowerCase().includes(effectValue)) {
                    return true;
                }
                else if (item.description?.toLowerCase().includes(effectValue)) {
                    return true;
                }

                return false;
            });
        }

        // Rating filter
        let ratingValue = $("#rating").val() as string;
        if (ratingValue.length > 0) {
            const includeAbove = ratingValue.slice(-1) === "+";
            const includeBelow = ratingValue.slice(-1) === "-";
            ratingValue = ratingValue.replace("+", "").replace("-", "");

            let floatRatingValue;
            if (ratingValue.slice(-1) === "*") {
                floatRatingValue = parseFloat(ratingValue.slice(0, ratingValue.lastIndexOf("*"))) + 0.5;
            }
            else {
                floatRatingValue = parseFloat(ratingValue);
            }

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                filters.push(item => item.rating >= floatRatingValue);
            }
            else if (includeBelow) {
                filters.push(item => item.rating <= floatRatingValue);
            }
            else if (ratingValue === "*") {
                filters.push(item => item.ratingString.includes("*"));
            }
            else {
                filters.push(item => item.rating == floatRatingValue);
            }
        }

        // Size filter
        let sizeValue = $("#size").val() as string;
        if (sizeValue.length > 0) {
            const includeAbove = sizeValue.slice(-1) === "+";
            const includeBelow = sizeValue.slice(-1) === "-";
            sizeValue = sizeValue.replace("+", "").replace("-", "");

            const intSizeValue = parseInt(sizeValue);

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                filters.push(item => item.size >= intSizeValue);
            }
            else if (includeBelow) {
                filters.push(item => item.size <= intSizeValue);
            }
            else {
                filters.push(item => item.size == intSizeValue);
            }
        }

        // Mass filter
        let massValue = $("#mass").val() as string;
        if (massValue.length > 0) {
            const includeAbove = massValue.slice(-1) === "+";
            const includeBelow = massValue.slice(-1) === "-";
            massValue = massValue.replace("+", "").replace("-", "");

            const intMassValue = parseInt(massValue);

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                filters.push(item => item.mass !== undefined && item.mass >= intMassValue);
            }
            else if (includeBelow) {
                filters.push(item => item.mass !== undefined && item.mass <= intMassValue);
            }
            else {
                filters.push(item => item.mass !== undefined && item.mass == intMassValue);
            }
        }

        // Schematic filter
        const depthValue = $("#depth").val() as string;
        if (depthValue.length > 0) {
            const depthNum = Math.abs(parseInt(depthValue));

            if (depthNum != NaN) {
                const terminalModifier = terminalLevelMap[getSelectedButtonId($("#schematicsContainer"))];
                const hackLevel = 10 - depthNum + terminalModifier;

                filters.push(item => {
                    if (!item.hackable) {
                        return false;
                    }

                    return hackLevel >= Math.ceil(item.rating);
                });
            }
        }

        // Slot filter
        const slotId = getSelectedButtonId($("#slotsContainer"));
        if (slotId in slotMap) {
            const filterSlot = slotMap[slotId];
            filters.push(item => item.slot === filterSlot);
        }

        // Type filter
        const typeId = getSelectedButtonId($("#typeFilters > div:not(\".not-visible\")"));
        if (typeId in typeMap) {
            const filterType = typeMap[typeId];
            filters.push(item => item.type === filterType);
        }

        // Category filter
        const categoryId = getSelectedButtonId($("#categoryContainer"));
        if (categoryId in categoryIdMap) {
            const filterNum = categoryIdMap[categoryId];
            filters.push(item => item.categories.includes(filterNum));
        }

        // Create a function that checks all filters
        return item => {
            return filters.every(func => func(item));
        }
    }

    // Initialize the page state
    function init() {
        initData();

        // Initialize page state
        createItems();
        updateCategoryVisibility();
        resetFilters();

        // Load spoilers saved state
        $("#spoilers").text(getSpoilersState());

        // Register handlers
        $("#spoilersDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilersState(state);
            ($("#spoilersDropdown > button") as any).tooltip("hide");
            updateCategoryVisibility();
            updateItems();
        });
        $("#name").on("input", updateItems);
        $("#effect").on("input", updateItems);
        $("#depth").on("input", updateItems);
        $("#rating").on("input", updateItems);
        $("#size").on("input", updateItems);
        $("#mass").on("input", updateItems);
        $("#reset").on("click", () => {
            ($("#reset") as any).tooltip("hide");
            resetFilters();
        });
        $("#slotsContainer > label > input").on("change", () => {
            updateTypeFilters();
            updateItems();
        });
        $("#schematicsContainer > label > input").on("change", updateItems);
        $("#powerTypeContainer > label > input").on("change", updateItems);
        $("#propTypeContainer > label > input").on("change", updateItems);
        $("#utilTypeContainer > label > input").on("change", updateItems);
        $("#weaponTypeContainer > label > input").on("change", updateItems);
        $("#categoryContainer > label > input").on("change", updateItems);
        $("#sortingContainer > div > button").on("click", () => {
            // Hide popovers when clicking a sort button
            ($('[data-toggle="popover"]') as any).popover("hide");
        });
        $("#primarySortDropdown > button").on("click", (e) => {
            const targetText = $(e.target).text();
            $("#primarySort").text(targetText);

            // Reset some settings based on the primary filter choice
            if (targetText === "Alphabetical" || targetText === "Gallery") {
                $("#secondarySort").text("None");
                $("#secondarySortDirection").text("Ascending");
            }
            else {
                $("#secondarySort").text("Alphabetical");
                $("#secondarySortDirection").text("Ascending");
            }
            updateItems();
        });
        $("#primarySortDirectionDropdown > button").on("click", (e) => {
            $("#primarySortDirection").text($(e.target).text());
            updateItems();
        });
        $("#secondarySortDropdown > button").on("click", (e) => {
            $("#secondarySort").text($(e.target).text());
            updateItems();
        });
        $("#secondarySortDirectionDropdown > button").on("click", (e) => {
            $("#secondarySortDirection").text($(e.target).text());
            updateItems();
        });

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            const targetPopover = $(e.target).parents(".popover").length != 0;

            if (targetPopover) {
                $(e.target).trigger("blur");
            }
            else if (!targetPopover && $(".popover").length >= 1) {
                ($('[data-toggle="popover"]') as any).not(e.target).popover("hide");
                // $('[data-toggle="popover"]').popover("hide");
            }
        });

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Resets all filters
    function resetFilters() {
        // Reset text inputs
        $("#name").val("");
        $("#effect").val("");
        $("#depth").val("");
        $("#rating").val("");
        $("#size").val("");
        $("#mass").val("");

        // Reset buttons
        resetButtonGroup($("#schematicsContainer"));
        resetButtonGroup($("#slotsContainer"));
        resetButtonGroup($("#powerTypeContainer"));
        resetButtonGroup($("#propTypeContainer"));
        resetButtonGroup($("#utilTypeContainer"));
        resetButtonGroup($("#weaponTypeContainer"));
        resetButtonGroup($("#categoryContainer"));

        // Reset sort
        $("#primarySort").text("Alphabetical");
        $("#primarySortDirection").text("Ascending");
        $("#secondarySort").text("None");
        $("#secondarySortDirection").text("Ascending");

        // Reset to default items view
        updateTypeFilters();
        updateItems();
    }

    // Sorts the collection of item names based on the sort settings
    function sortItemNames(itemNames: string[]): string[] {
        function alphabeticalSort(a: any, b: any) {
            let aValue = typeof (a) === "string" ? a : "";
            let bValue = typeof (b) === "string" ? b : "";

            return aValue.localeCompare(bValue);
        }

        function damageSort(a: string, b: string) {
            function getAverage(damageString: string) {
                if (typeof (damageString) != "string") {
                    return 0;
                }

                const damageArray = damageString.split("-").map(s => s.trim()).map(s => parseInt(s));
                return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
            }

            const aValue = getAverage(a);
            const bValue = getAverage(b);

            return aValue - bValue;
        }

        function integerSort(a: string, b: string) {
            let aValue = parseInt(a);
            let bValue = parseInt(b);

            if (isNaN(aValue)) {
                aValue = 0;
            }
            if (isNaN(bValue)) {
                bValue = 0;
            }

            return aValue - bValue;
        }

        function ratingSort(a: string, b: string) {
            let aValue: number;
            let bValue: number;
            if (a.includes("*")) {
                aValue = parseInt(a.slice(0, a.indexOf("*"))) + 0.5;
            }
            else {
                aValue = parseInt(a);
            }
            if (b.includes("*")) {
                bValue = parseInt(b.slice(0, b.indexOf("*"))) + 0.5;
            }
            else {
                bValue = parseInt(b);
            }

            return aValue - bValue;
        }

        const sortKeyMap = {
            "Alphabetical": { key: "name", sort: alphabeticalSort },
            "Gallery": { key: "name", sort: gallerySort },
            "Rating": { key: "rating", sort: ratingSort },
            "Size": { key: "size", sort: integerSort },
            "Mass": { key: "mass", sort: integerSort },
            "Integrity": { key: "integrity", sort: integerSort },
            "Coverage": { key: "coverage", sort: integerSort },
            "Critical": { key: "critical", sort: integerSort },
            "Damage": { keys: ["damage", "explosionDamage"], sort: damageSort },
            "Delay": { key: "delay", sort: integerSort },
            "Disruption": { key: "disruption", sort: integerSort },
            "Drag": { key: "drag", sort: integerSort },
            "Energy/Move": { key: "energyPerMove", sort: integerSort },
            "Energy Generation": { key: "energyGeneration", sort: integerSort },
            "Energy Storage": { key: "energyStorage", sort: integerSort },
            "Energy Upkeep": { key: "energyUpkeep", sort: integerSort },
            "Explosion Radius": { key: "explosionRadius", sort: integerSort },
            "Falloff": { key: "falloff", sort: integerSort },
            "Heat/Move": { key: "heatPerMove", sort: integerSort },
            "Heat Generation": { key: "heatGeneration", sort: integerSort },
            "Matter Upkeep": { key: "matterUpkeep", sort: integerSort },
            "Penalty": { key: "penalty", sort: integerSort },
            "Projectile Count": { key: "projectileCount", sort: integerSort },
            "Range": { key: "range", sort: integerSort },
            "Salvage": { key: "salvage", sort: integerSort },
            "Shot Energy": { key: "shotEnergy", sort: integerSort },
            "Shot Heat": { key: "shotHeat", sort: integerSort },
            "Shot Matter": { key: "shotMatter", sort: integerSort },
            "Support": { key: "support", sort: integerSort },
            "Targeting": { key: "targeting", sort: integerSort },
            "Time/Move": { key: "timePerMove", sort: integerSort },
            "Waypoints": { key: "waypoints", sort: integerSort },
        };

        // Do initial sort
        const primaryObject = sortKeyMap[$("#primarySort").text()];
        const primaryKeys = "key" in primaryObject ? [primaryObject.key] : primaryObject.keys;
        const primarySort = primaryObject.sort;
        itemNames.sort((a, b) => {
            const itemA = getItem(a);
            const itemB = getItem(b);

            const aKey = primaryKeys.find((key: string) => key in itemA);
            const bKey = primaryKeys.find((key: string) => key in itemB);

            return primarySort(itemA[aKey], itemB[bKey]);
        });

        if ($("#primarySortDirection").text().trim() === "Descending") {
            itemNames.reverse();
        }

        // Do secondary sort if selected
        const secondaryObject = sortKeyMap[$("#secondarySort").text()];
        if (secondaryObject === undefined) {
            return itemNames;
        }

        const secondaryKeys = "key" in secondaryObject ? [secondaryObject.key] : secondaryObject.keys;
        const secondarySort = secondaryObject.sort;

        // Group items based on the initial sort
        const groupedItemNames = {};
        const groupedKeys: any[] = [];
        itemNames.forEach((itemName: string) => {
            const item = getItem(itemName);
            const key = primaryKeys.find((key: string) => key in item);
            const value = item[key];

            if (value in groupedItemNames) {
                groupedItemNames[value].push(itemName);
            }
            else {
                groupedItemNames[value] = [itemName];
                groupedKeys.push(value);
            }
        });

        // Sort subgroups
        groupedKeys.forEach(key => {
            const itemNames = groupedItemNames[key];

            itemNames.sort((a: string, b: string) => {
                const itemA = getItem(a);
                const itemB = getItem(b);

                const aKey = secondaryKeys.find((key: string) => key in itemA);
                const bKey = secondaryKeys.find((key: string) => key in itemB);

                return secondarySort(itemA[aKey], itemB[bKey]);
            });
        });


        // Combine groups back into single sorted array
        let newItems: string[] = [];
        groupedKeys.forEach(key => {
            newItems = newItems.concat(groupedItemNames[key]);
        });

        return newItems;
    }

    // Updates category visibility based on the spoiler state
    function updateCategoryVisibility() {
        const state = getSpoilersState();
        const showSpoilers = state === "Spoilers" || state === "Redacted";

        if (showSpoilers) {
            spoilerCategoryIds.forEach(category => $(`#${category}`).removeClass("not-visible"));
        }
        else {
            spoilerCategoryIds.forEach(category => $(`#${category}`).addClass("not-visible"));
        }
    }

    // Clears all existing items and adds new ones based on the filters
    function updateItems() {
        // Hide any existing popovers
        ($('[data-toggle="popover"]') as any).popover("hide");

        // Get the names of all non-filtered items
        const itemFilter = getItemFilter();
        let items: any[] = [];
        Object.keys(itemData).forEach(itemName => {
            const item = getItem(itemName);

            if (itemFilter(item)) {
                items.push(item.name);
            }
        });

        // Sort item names for display
        items = sortItemNames(items);

        // Update visibility and order of all items
        $("#itemsGrid > button").addClass("not-visible");

        let precedingElement = null;

        items.forEach(itemName => {
            const element = itemElements[itemName];
            element.removeClass("not-visible");

            if (precedingElement == null) {
                $("#itemsGrid").append(element);
            }
            else {
                element.insertAfter(precedingElement);
            }

            precedingElement = element;
        });
    }

    // Updates the type filters visibility based on the selected slot
    function updateTypeFilters() {
        // Hide all type filters
        Object.keys(slotIdToTypeIdMap).forEach(k => $(`#${slotIdToTypeIdMap[k]}`).addClass("not-visible"));

        const activeSlotId = getSelectedButtonId($("#slotsContainer"));
        if (activeSlotId in slotIdToTypeIdMap) {
            $(`#${slotIdToTypeIdMap[activeSlotId]}`).removeClass("not-visible");
        }
    }
});