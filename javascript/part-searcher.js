import {
    categoryData,
    createItemDataContent,
    initItemData,
    itemData,
    noPrefixName,
    valueOrDefault,
} from "./common.js";

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
        "categoryUnobtainable": 7,
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

    // List of spoiler category #s
    const spoilerCategories = [
        "categoryAlien",
        "categoryTesting",
        "categoryGolem",
        "categorySpoiler",
    ].map(id => categoryIdMap[id]);

    // Slot ID -> Slot string
    const slotMap = {
        "slotPower": "Power",
        "slotPropulsion": "Propulsion",
        "slotUtility": "Utility",
        "slotWeapon": "Weapon",
        "slotOther": "Other",
    };

    // Terminal ID -> int level
    const terminalLevelMap = {
        "terminalLevel1": 1,
        "terminalLevel2": 2,
        "terminalLevel3": 3,
    }

    // Type ID -> Type string
    const typeMap = {
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
    const slotIdToTypeIdMap = {
        "slotPower": "powerTypeContainer",
        "slotPropulsion": "propTypeContainer",
        "slotUtility": "utilTypeContainer",
        "slotWeapon": "weaponTypeContainer",
    }

    $(document).ready(() => {
        init();
    });

    // Creates buttons for all items
    function createItems() {
        const items = Object.values(itemData);
        const itemsGrid = $("#itemsGrid");
        items.forEach(item => {
            const itemName = item["Name"];
            const itemId = itemNameToId(itemName);
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
        $('#itemsGrid > [data-toggle="popover"]').popover();
    }

    // Gets a filter function combining all current filters
    function getItemFilter() {
        let filters = [];

        // Spoilers filter
        const showSpoilers = $("#spoilers").is(":checked");
        if (!showSpoilers) {
            filters.push(item =>
                !categoryData[item["Name"]].some(c => spoilerCategories.includes(c))
            );
        }

        // Name filter
        const nameValue = $("#name").val().toLowerCase();
        if (nameValue.length > 0) {
            filters.push(item => item["Name"].toLowerCase().includes(nameValue));
        }

        // Effect/Description filter
        const effectValue = $("#effect").val().toLowerCase();
        if (effectValue.length > 0) {
            filters.push(item => {
                if ("Effect" in item && item["Effect"].toLowerCase().includes(effectValue)) {
                    return true;
                }
                else if ("Description" in item && item["Description"].toLowerCase().includes(effectValue)) {
                    return true;
                }

                return false;
            });
        }

        // Rating filter
        let ratingValue = $("#rating").val();
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
                filters.push(item => item["Float Rating"] >= floatRatingValue);
            }
            else if (includeBelow) {
                filters.push(item => item["Float Rating"] <= floatRatingValue);
            }
            else if (ratingValue === "*") {
                filters.push(item => item["Rating"].includes("*"));
            }
            else {
                filters.push(item => item["Float Rating"] == floatRatingValue);
            }
        }

        // Size filter
        let sizeValue = $("#size").val();
        if (sizeValue.length > 0) {
            const includeAbove = sizeValue.slice(-1) === "+";
            const includeBelow = sizeValue.slice(-1) === "-";
            sizeValue = sizeValue.replace("+", "").replace("-", "");

            const intSizeValue = parseInt(sizeValue);

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                filters.push(item => item["Int Size"] >= intSizeValue);
            }
            else if (includeBelow) {
                filters.push(item => item["Int Size"] <= intSizeValue);
            }
            else {
                filters.push(item => item["Int Size"] == intSizeValue);
            }
        }

        // Mass filter
        let massValue = $("#mass").val();
        if (massValue.length > 0) {
            const includeAbove = massValue.slice(-1) === "+";
            const includeBelow = massValue.slice(-1) === "-";
            massValue = massValue.replace("+", "").replace("-", "");

            const intMassValue = parseInt(massValue);

            // A + at the end means also include values above the given value
            // A - means include values below
            if (includeAbove) {
                filters.push(item => item["Int Mass"] >= intMassValue);
            }
            else if (includeBelow) {
                filters.push(item => item["Int Mass"] <= intMassValue);
            }
            else {
                filters.push(item => item["Int Mass"] == intMassValue);
            }
        }

        // Schematic filter
        const depthValue = $("#depth").val();
        if (depthValue.length > 0) {
            const depthNum = Math.abs(parseInt(depthValue));

            if (depthNum != NaN) {
                const terminalModifier = terminalLevelMap[$("#schematicsContainer > label.active").attr("id")];
                const hackLevel = 10 - depthNum + terminalModifier;

                filters.push(item => {
                    if (!"Hackable Schematic" in item || item["Hackable Schematic"] !== "1") {
                        return;
                    }

                    let ratingValue;
                    if (item["Rating"].includes("*")) {
                        ratingValue = parseInt(item["Rating"].slice(0, -1)) + 1;
                    }
                    else {
                        ratingValue = parseInt(item["Rating"]);
                    }

                    return hackLevel >= ratingValue;
                });
            }
        }

        // Slot filter
        const slotId = $("#slotsContainer > label.active").attr("id");
        if (slotId in slotMap) {
            const filterSlot = slotMap[slotId];
            filters.push(item => item["Slot"] === filterSlot);
        }

        // Type filter
        const typeId = $("#typeFilters > div:not(\".not-visible\") > label.active").attr("id");
        if (typeId in typeMap) {
            const filterType = typeMap[typeId];
            filters.push(item => item["Type"] === filterType);
        }

        // Category filter
        const categoryId = $("#categoryContainer > label.active").attr("id");
        if (categoryId in categoryIdMap) {
            const filterNum = categoryIdMap[categoryId];
            filters.push(item => categoryData[item["Name"]].includes(filterNum));
        }

        // Create a function that checks all filters
        return item => {
            return filters.every(func => func(item));
        }
    }

    // Initialize the page state
    async function init(items, categories) {
        await initItemData(items, categories);

        // Initialize page state
        createItems();
        updateCategoryVisibility();
        resetFilters();

        // Load spoilers saved state
        const spoilers = valueOrDefault(window.localStorage.getItem("spoilers"), false);
        $("#spoilers").attr("checked", spoilers);

        // Register handlers
        $("#spoilers").on("change", () => {
            // Hide tooltip, update saved state, categories, and items
            $("#spoilersPopupContainer").tooltip("hide");
            window.localStorage.setItem("spoilers", $("#spoilers").is(":checked"));
            updateCategoryVisibility();
            updateItems();
        });
        $("#name").on("input", updateItems);
        $("#effect").on("input", updateItems);
        $("#depth").on("input", updateItems);
        $("#rating").on("input", updateItems);
        $("#size").on("input", updateItems);
        $("#mass").on("input", updateItems);
        $("#reset").click(() => {
            $("#reset").tooltip("hide");
            resetFilters();
        });
        $("#slotsContainer > label > input").on("click", () => {
            updateTypeFilters();
            updateItems();
        });
        $("#schematicsContainer > label > input").on("click", updateItems);
        $("#powerTypeContainer > label > input").on("click", updateItems);
        $("#propTypeContainer > label > input").on("click", updateItems);
        $("#utilTypeContainer > label > input").on("click", updateItems);
        $("#weaponTypeContainer > label > input").on("click", updateItems);
        $("#categoryContainer > label > input").on("click", updateItems);
        $("#sortingContainer > div > button").on("click", () => {
            // Hide popovers when clicking a sort button
            $('[data-toggle="popover"]').popover("hide");
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
            if ($(e.target).parents(".popover").length === 0 && $(".popover").length >= 1) {
                $('[data-toggle="popover"]').not(e.target).popover("hide");
            }
        });

        // Enable tooltips
        $('[data-toggle="tooltip"]').tooltip()
    }

    // Converts an item's name to an HTML id
    function itemNameToId(name) {
        const id = `item${name.replace(/[ /.'"\]\[]]*/g, "")}`;
        return id;
    }

    // Clears a button group's state and sets the first item to be active
    function resetButtonGroup(group) {
        group.children().removeClass("active");

        group.children("label:first-of-type").addClass("active");
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
    function sortItemNames(itemNames) {
        function alphabeticalSort(a, b) {
            let aValue = typeof (a) === "string" ? a : "";
            let bValue = typeof (b) === "string" ? b : "";

            return aValue.localeCompare(bValue);
        }

        function damageSort(a, b) {
            function getAverage(damageString) {
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

        function gallerySort(a, b) {
            // Do a lexicographical sort based on the no-prefix item name
            const noPrefixA = noPrefixName(a);
            const noPrefixB = noPrefixName(b);
            let res = (noPrefixA > noPrefixB) - (noPrefixA < noPrefixB);

            if (res === 0) {
                // If no-prefix names match then use index in gallery export
                // There may be some formula to determine the real order or
                // it may be a hand-crafted list, I couldn't tell either way.
                // The export index will always be ordered for different prefix
                // versions of the same parts so this is the best way to sort
                // them how the in-game gallery does.
                res = parseInt(itemData[a]["Index"]) - parseInt(itemData[b]["Index"]);
            }

            return res;
        }

        function integerSort(a, b) {
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

        function ratingSort(a, b) {
            let aValue;
            let bValue;
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
            "Alphabetical": { "Key": "Name", "Sort": alphabeticalSort },
            "Gallery": { "Key": "Name", "Sort": gallerySort },
            "Rating": { "Key": "Rating", "Sort": ratingSort },
            "Size": { "Key": "Size", "Sort": integerSort },
            "Mass": { "Key": "Mass", "Sort": integerSort },
            "Integrity": { "Key": "Integrity", "Sort": integerSort },
            "Coverage": { "Key": "Coverage", "Sort": integerSort },
            "Critical": { "Key": "Critical", "Sort": integerSort },
            "Damage": { "Keys": ["Damage", "Explosion Damage"], "Sort": damageSort },
            "Delay": { "Key": "Delay", "Sort": integerSort },
            "Disruption": { "Key": "Disruption", "Sort": integerSort },
            "Drag": { "Key": "Drag", "Sort": integerSort },
            "Energy/Move": { "Key": "Energy/Move", "Sort": integerSort },
            "Energy Generation": { "Key": "Energy Generation", "Sort": integerSort },
            "Energy Storage": { "Key": "Energy Storage", "Sort": integerSort },
            "Energy Upkeep": { "Key": "Energy Upkeep", "Sort": integerSort },
            "Explosion Radius": { "Key": "Explosion Radius", "Sort": integerSort },
            "Falloff": { "Key": "Falloff", "Sort": integerSort },
            "Heat/Move": { "Key": "Heat/Move", "Sort": integerSort },
            "Heat Generation": { "Key": "Heat Generation", "Sort": integerSort },
            "Matter Upkeep": { "Key": "Matter Upkeep", "Sort": integerSort },
            "Penalty": { "Key": "Penalty", "Sort": integerSort },
            "Projectile Count": { "Key": "Projectile Count", "Sort": integerSort },
            "Range": { "Key": "Range", "Sort": integerSort },
            "Salvage": { "Key": "Salvage", "Sort": integerSort },
            "Shot Energy": { "Key": "Shot Energy", "Sort": integerSort },
            "Shot Heat": { "Key": "Shot Heat", "Sort": integerSort },
            "Shot Matter": { "Key": "Shot Matter", "Sort": integerSort },
            "Support": { "Key": "Support", "Sort": integerSort },
            "Targeting": { "Key": "Targeting", "Sort": integerSort },
            "Time/Move": { "Key": "Time/Move", "Sort": integerSort },
        };

        // Do initial sort
        const primaryObject = sortKeyMap[$("#primarySort").text()];
        const primaryKeys = "Key" in primaryObject ? [primaryObject["Key"]] : primaryObject["Keys"];
        const primarySort = primaryObject["Sort"];
        itemNames.sort((a, b) => {
            const itemA = itemData[a];
            const itemB = itemData[b];

            const aKey = primaryKeys.find((key) => key in itemA);
            const bKey = primaryKeys.find((key) => key in itemB);

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

        const secondaryKeys = "Key" in secondaryObject ? [secondaryObject["Key"]] : secondaryObject["Keys"];
        const secondarySort = secondaryObject["Sort"];

        // Group items based on the initial sort
        const groupedItemNames = {};
        const groupedKeys = [];
        itemNames.forEach(itemName => {
            const item = itemData[itemName];
            const key = primaryKeys.find((key) => key in item);
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

            itemNames.sort((a, b) => {
                const itemA = itemData[a];
                const itemB = itemData[b];

                const aKey = secondaryKeys.find((key) => key in itemA);
                const bKey = secondaryKeys.find((key) => key in itemB);

                return secondarySort(itemA[aKey], itemB[bKey]);
            });
        });


        // Combine groups back into single sorted array
        let newItems = [];
        groupedKeys.forEach(key => {
            newItems = newItems.concat(groupedItemNames[key]);
        });

        return newItems;
    }

    // Updates category visibility based on the spoiler checkbox
    function updateCategoryVisibility() {
        const showSpoilers = $("#spoilers").is(":checked");

        if (showSpoilers) {
            spoilerCategoryIds.forEach(category => $(`#${category}`).removeClass("not-visible"));
        }
        else {
            spoilerCategoryIds.forEach(category => $(`#${category}`).addClass("not-visible"));
        }
    }

    // Clears all existing items and creates new ones based on the filters
    function updateItems() {
        // Hide any existing popovers
        $('[data-toggle="popover"]').popover("hide");

        // Get the names of all non-filtered items
        const itemFilter = getItemFilter();
        let items = [];
        Object.keys(itemData).forEach(itemName => {
            const item = itemData[itemName];

            if (itemFilter(item)) {
                items.push(item["Name"]);
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

        const activeSlotId = $("#slotsContainer > label.active").attr("id");
        if (activeSlotId in slotIdToTypeIdMap) {
            $(`#${slotIdToTypeIdMap[activeSlotId]}`).removeClass("not-visible");
        }
    }
});