jq = jQuery.noConflict();
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

    // Color schemes 
    const colorSchemeLowGood = "lowGood";
    const colorSchemeHighGood = "highGood";
    const colorSchemeGreen = "green";
    const colorSchemes = {
        "lowGood": { low: "#range-green", midLow: "range-yellow", midHigh: "range-orange", high: "range-red" },
        "highGood": { lowest: "range-red", midLow: "range-orange", midHigh: "range-yellow", high: "range-green" },
        "green": { lowest: "#range-green", midLow: "#range-green", midHigh: "#range-green", high: "range-green" },
    }

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

    // Load external files
    let items = fetch("./json/items.json")
        .then(response => response.json());
    let categories = fetch("./json/categories.json")
        .then(response => response.json());

    Promise.all([items, categories]).then(data => {
        $(document).ready(() => {
            init(data[0], data[1]);
        });
    })

    // Creates a grid item's popover data content HTML string
    function createItemDataContent(item) {
        function getRatingHtml(item) {
            const category = item["Category"];
            if (category === "Prototype") {
                return '<span class="rating-prototype"> Prototype </span>';
            }
            else if (category === "Alien") {
                return '<span class="rating-alien"> Alien </span>';
            }
            else {
                return '<span class="dim-text">Standard</span>'
            }
        }

        // Creates a range line from minVal to maxVal using filled squares with the given color scheme
        function rangeLine(category, valueString, value, minValue, maxValue, colorScheme) {
            let valueHtml;
            if (valueString === undefined) {
                valueString = "N/A";
                value = 0;
                valueHtml = '<span class="dim-text">N/A</span>';
            }
            else {
                valueHtml = valueString;
            }

            // Determine bars and spacing
            const maxBars = 22;
            const numSpaces = 23 - 1 - 1 - category.length - valueString.length;
            let valuePercentage;
            if (maxValue - minValue === 0) {
                valuePercentage = 1;
            }
            else {
                valuePercentage = value / (maxValue - minValue);
            }
            let fullBars = Math.min(Math.floor(maxBars * valuePercentage), 22);

            // Always round away from 0
            // This allows for things like 1/100 to show 1 bar rather than 0
            if (fullBars == 0 && value != minValue) {
                fullBars = 1;
            }
            const emptyBars = maxBars - fullBars;

            // Determine color
            let colorClass;
            if (valuePercentage < .25) {
                colorClass = colorSchemes[colorScheme].low;
            }
            else if (valuePercentage < .5) {
                colorClass = colorSchemes[colorScheme].midLow;
            }
            else if (valuePercentage < .75) {
                colorClass = colorSchemes[colorScheme].midHigh;
            }
            else {
                colorClass = colorSchemes[colorScheme].high;
            }

            // Create bars HTML string
            let barsHtml;
            if (emptyBars > 0) {
                barsHtml = `<span class="${colorClass}">${"▮".repeat(fullBars)}</span><span class="dim-text">${"▯".repeat(emptyBars)}</span>`;
            }
            else {
                barsHtml = `<span class=${colorClass}>${"▮".repeat(fullBars)}</span>`;
            }

            // Return full HTML
            return `
            <pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueHtml} ${barsHtml}</pre>
            `;
        }

        // Create a summary line
        function summaryLine(text) { return `<pre class="popover-summary">${text}</pre>` }

        // Create a text line with no value and default style
        function textLine(category, text) {
            const numSpaces = 23 - 1 - category.length;
            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${text}</pre>`;
        }

        // Create a text line with a value and a given HTML string for the text
        function textValueHtmlLine(category, valueString, valueClass, textHtml) {
            const numSpaces = 23 - 1 - 1 - category.length - valueString.length;

            let valueHtml;
            if (typeof (valueClass) == "string" && valueClass.length > 0) {
                valueHtml = `<span class="${valueClass}">${valueString}</span>`;
            }
            else {
                valueHtml = valueString;
            }

            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueHtml} ${textHtml}</pre>`;
        }

        // Create a value line with no text and default style
        function valueLine(category, valueString) {
            const numSpaces = 23 - 1 - category.length - 1 - valueString.length;
            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueString}</pre>`;
        }

        return `
        ${summaryLine("Overview")}
        ${textLine("Type", item["Type"])}
        ${textLine("Slot", item["Slot"])}
        ${rangeLine("Mass", item["Mass"], parseInt(item["Mass"]), 0, 15, colorSchemeLowGood)}
        ${textValueHtmlLine("Rating", item["Rating"].replace("**", "").replace("*", ""), "", getRatingHtml(item))}
        ${rangeLine("Integrity", item["Integrity"], 0, 0, 0, colorSchemeGreen)}
        ${valueLine("Coverage", valueOrDefault(item["Coverage"], "0"))}
        <span></span>
        `;
    }

    // Initialize the page state
    function init(items, categories) {
        itemData = items;
        categoryData = categories;

        // Reset page state
        updateCategoryVisibility();
        resetFilters();

        // Register handlers
        $("#spoilers").on("change", () => {
            // Hide tooltip, update categories, then update items
            $("#spoilersPopupContainer").tooltip("hide");
            updateCategoryVisibility();
            updateItems();
        });
        $("#name").on("input", updateItems);
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
        $("#powerTypeContainer > label > input").on("click", updateItems);
        $("#propTypeContainer > label > input").on("click", updateItems);
        $("#utilTypeContainer > label > input").on("click", updateItems);
        $("#weaponTypeContainer > label > input").on("click", updateItems);
        $("#categoryContainer > label > input").on("click", updateItems);

        // Enable tooltips
        $('[data-toggle="tooltip"]').tooltip()
    }

    // Gets a filter function combining all current filters
    function getItemFilter() {
        let filters = [];

        // Spoilers filter
        const showSpoilers = $("#spoilers").is(":checked");
        if (!showSpoilers) {
            filters.push(item => !categoryData[item["Name"]].some(c => spoilerCategories.includes(c)));
        }

        // Name filter
        const nameValue = $("#name").val();
        if (nameValue.length > 0) {
            filters.push(item => item["Name"].toLowerCase().includes(nameValue.toLowerCase()));
        }

        // Depth filter TODO
        // const depthValue = $("#depth").val();
        // if (depthValue.length > 0) {
        // }

        // Rating filter
        const ratingValue = $("#rating").val();
        if (ratingValue.length > 0) {
            filters.push(item => item["Rating"].includes(ratingValue));
        }

        // Size filter
        const sizeValue = $("#size").val();
        if (sizeValue.length > 0) {
            filters.push(item => item["Size"] === sizeValue);
        }

        // Mass filter
        const massValue = $("#mass").val();
        if (massValue.length > 0) {
            filters.push(item => item["Mass"] === massValue);
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

    // Clears a button group's state and sets the first item to be active
    function resetButtonGroup(group) {
        group.children().removeClass("active");

        group.children("label:first-of-type").addClass("active");
    }

    // Resets all filters
    function resetFilters() {
        // Reset text inputs
        $("#name").val("");
        $("#depth").val("");
        $("#rating").val("");
        $("#size").val("");
        $("#mass").val("");

        // Reset buttons
        resetButtonGroup($("#slotsContainer"));
        resetButtonGroup($("#powerTypeContainer"));
        resetButtonGroup($("#propTypeContainer"));
        resetButtonGroup($("#utilTypeContainer"));
        resetButtonGroup($("#weaponTypeContainer"));
        resetButtonGroup($("#categoryContainer"));

        // Reset to default items view
        updateTypeFilters();
        updateItems();
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
        // Get the names of all non-filtered items
        const itemFilter = getItemFilter();
        let items = [];
        Object.keys(itemData).forEach(itemName => {
            const item = itemData[itemName];

            if (itemFilter(item)) {
                items.push(item);
            }
        });

        // Sort and create items
        items.sort();
        const itemsGrid = $("#itemsGrid");
        itemsGrid.empty();
        items.forEach(item => {
            itemsGrid.append(
                `<button
                    class="item btn" 
                    type="button"
                    data-html=true
                    data-content='${createItemDataContent(item)}'
                    data-toggle="popover">
                    <label>${item["Name"]}</label>
                 </button>`);
        });

        $('#itemsGrid > [data-toggle="popover"]').popover();
        // $('#itemsGrid > [data-toggle="tooltip"]').on("click", () => console.log("Test"));
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

    // Returns the value if it's not undefined, otherwise return defaultVal
    function valueOrDefault(val, defaultVal) {
        if (val === undefined) {
            return defaultVal;
        }

        return val;
    }
});