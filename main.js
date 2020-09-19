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
        "lowGood": { low: "range-green", midLow: "range-yellow", midHigh: "range-orange", high: "range-red" },
        "highGood": { lowest: "range-red", midLow: "range-orange", midHigh: "range-yellow", high: "range-green" },
        "green": { lowest: "range-green", midLow: "range-green", midHigh: "range-green", high: "range-green" },
    }

    // Character -> escape character map
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

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
        function getDamageValue(item) {
            const damageString = item["Damage"];
            const damageArray = damageString.split("-").map(s => s.trim()).map(s => parseInt(s));
            return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
        }

        function getDelayString(item) {
            if ("Delay" in item) {
                const delay = item["Delay"];

                if (delay[0] != "-") {
                    return "+" + delay
                }

                return delay;
            }

            return null;
        }

        function getExplosionValue(item) {
            const damageString = item["Explosion Damage"];
            const damageArray = damageString.split("-").map(s => s.trim()).map(s => parseInt(s));
            return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
        }

        function getNegativeString(item, category) {
            const value = item[category];
            if (value === undefined) {
                return null;
            }
            else if (value[0] === "-") {
                return value;
            }
            else {
                return "-" + value;
            }
        }

        function getOverloadStabilityValue(item) {
            const stabilityString = item["Overload Stability"];
            if (stabilityString === undefined) {
                return 0
            }
            else {
                return parseInt(stabilityString.slice(0, -1))
            }
        }

        function getPenetrationTextHtml(item) {
            const penetrationString = item["Penetration"];

            if (penetrationString === undefined) {
                return "";
            }

            const penetrationArray = penetrationString.split("/").map(s => s.trim());

            return penetrationArray.join(" / ");
        }

        function getPenetrationValueClass(item) {
            if ("Penetration" in item) {
                return null;
            }

            return "dim-text";
        }

        function getPenetrationValue(item) {
            const penetrationString = item["Penetration"]

            if (penetrationString === undefined) {
                return "x0";
            }

            const penetrationArray = penetrationString.split("/").map(s => s.trim());

            return "x" + penetrationArray.length;
        }

        function getPositiveString(item, category) {
            const value = item[category];
            if (value === undefined) {
                return null;
            }
            else {
                return "+" + value;
            }
        }

        function getPowerStabilityValue(item) {
            const stabilityString = item["Power Stability"];
            if (stabilityString === undefined) {
                return 0;
            }
            else {
                return parseInt(stabilityString.slice(0, -1))
            }
        }

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

        function getSlotString(item) {
            if ("Size" in item && parseInt(item["Size"]) > 1) {
                return `${item["Slot"]} x${item["Size"]}`
            }

            return item["Slot"]
        }

        function rangeLine(category, valueString, value, defaultValueString, minValue, maxValue, colorScheme) {
            return rangeLineUnit(category, valueString, value, "", defaultValueString, minValue, maxValue, colorScheme);
        }

        // Creates a range line from minVal to maxVal using filled squares with the given color scheme
        function rangeLineUnit(category, valueString, value, unitString, defaultValueString, minValue, maxValue, colorScheme) {
            let valueHtml;
            if (typeof (valueString) != "string") {
                valueString = defaultValueString;
                value = 0;
                valueHtml = `<span class="dim-text">${defaultValueString}${unitString}</span>`;
            }
            else {
                valueHtml = valueString + unitString;
            }

            // Determine bars and spacing
            const maxBars = 22;
            const numSpaces = 23 - 1 - 1 - category.length - valueString.length - unitString.length;
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
            if (fullBars === 0 && value != minValue) {
                fullBars = 1;
            }

            if (minValue === maxValue) {
                fullBars = 0;
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
                barsHtml = `<span class="${colorClass}">${"▮".repeat(fullBars)}</span><span class="range-dim">${"▯".repeat(emptyBars)}</span>`;
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

        // Creates a summary line with an optional projectile multiplier
        function summaryProjectileLine(item) {
            if ("Projectile Count" in item && parseInt(item["Projectile Count"]) > 1) {
                return `<pre class="popover-summary">Projectile${" ".repeat(13)}<span class="projectile-num"> x${item["Projectile Count"]} </span></pre>`;
            }
            else {
                return summaryLine("Projectile")
            }
        }

        // Create a text line with no value and default style
        function textLine(category, text) {
            const numSpaces = 23 - 1 - category.length;
            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${text}</pre>`;
        }

        // Create a text line with no value  and a default
        function textLineWithDefault(category, textString, defaultString) {
            if (!typeof (textString) != "string") {
                textString = `<span class="dim-text">${defaultString}</span>`;
            }

            const numSpaces = 23 - 1 - category.length;
            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${textString}</pre>`;
        }

        // Create a text line with a value and a given HTML string for the text
        function textValueHtmlLine(category, valueString, valueClass, textHtml) {
            const numSpaces = 23 - 1 - 1 - category.length - valueString.length;

            let valueHtml;
            if (typeof (valueClass) === "string" && valueClass.length > 0) {
                valueHtml = `<span class="${valueClass}">${valueString}</span>`;
            }
            else {
                valueHtml = valueString;
            }

            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueHtml} ${textHtml}</pre>`;
        }

        // Create a value line with no text
        function valueLine(category, valueString) {
            const numSpaces = 23 - 1 - category.length - 1 - valueString.length;
            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueString}</pre>`;
        }

        // Create a value line with no text and a default
        function valueLineUnitsWithDefault(category, valueString, unitString, defaultString) {
            let valueLength;
            if (typeof (valueString) != "string") {
                valueString = `<span class="dim-text">${defaultString}${unitString}</span>`;
                valueLength = defaultString.length + unitString.length;
            }
            else {
                valueString += unitString;
                valueLength = valueString.length;
            }

            const numSpaces = 23 - 1 - category.length - 1 - valueLength;
            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueString}</pre>`;
        }

        // Create a value line with no text and a default
        function valueLineWithDefault(category, valueString, defaultString) {
            let valueLength;
            if (typeof (valueString) != "string") {
                valueString = `<span class="dim-text">${defaultString}</span>`;
                valueLength = defaultString.length;
            }
            else {
                valueLength = valueString.length;
            }

            const numSpaces = 23 - 1 - category.length - 1 - valueLength;
            return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueString}</pre>`;
        }

        // Create overview
        let html = `
        <pre class="popover-title">${escapeHtml(item["Name"])}</pre>
        <p/>
        ${summaryLine("Overview")}
        ${textLine("Type", item["Type"])}
        ${textLine("Slot", getSlotString(item))}
        ${rangeLine("Mass", item["Mass"], parseInt(item["Mass"]), "N/A", 0, 15, colorSchemeLowGood)}
        ${textValueHtmlLine("Rating", item["Rating"].replace("**", "").replace("*", ""), "", getRatingHtml(item))}
        ${rangeLine("Integrity", item["Integrity"], 1, null, 0, 1, colorSchemeGreen)}
        ${valueLine("Coverage", valueOrDefault(item["Coverage"], "0"))}
        `;

        if (item["Slot"] === "Power") {
            // Add power-unique categories
            html += `
            <p/>
            ${summaryLine("Active Upkeep")}
            ${rangeLine("Energy", null, 0, "-0", 0, 0, colorSchemeLowGood)}
            ${rangeLine("Matter", null, 0, "-0", 0, 0, colorSchemeLowGood)}
            ${rangeLine("Heat", getPositiveString(item, "Heat Generation"), parseInt(item["Heat Generation"]), "+0", 0, 20, colorSchemeLowGood)}
            <p/>
            ${summaryLine("Power")}
            ${rangeLine("Supply", "+" + item["Energy Generation"], parseInt(item["Energy Generation"]), null, 0, 30, colorSchemeGreen)}
            ${rangeLine("Storage", item["Energy Storage"], parseInt(item["Energy Storage"]), "0", 0, 300, colorSchemeGreen)}
            ${rangeLine("Stability", item["Power Stability"], getPowerStabilityValue(item), "N/A", 0, 100, colorSchemeHighGood)}
            `;
        }
        else if (item["Slot"] === "Propulsion") {
            // Add propulsion-unique categories
            html += `
            <p/>
            ${summaryLine("Active Upkeep")}
            ${rangeLine("Energy", getNegativeString(item, "Energy Upkeep"), parseInt(item["Energy Upkeep"]), "-0", 0, 20, colorSchemeLowGood)}
            ${rangeLine("Matter", null, 0, "-0", 0, 0, colorSchemeLowGood)}
            ${rangeLine("Heat", getPositiveString(item, "Heat Generation"), parseInt(item["Heat Generation"]), "+0", 0, 20, colorSchemeLowGood)}
            <p/>
            ${summaryLine("Propulsion")}
            ${rangeLine("Time/Move", item["Time/Move"], parseInt(item["Time/Move"]), null, 0, 150, colorSchemeLowGood)}
            ${"Mod/Extra" in item ? valueLine(" Mod/Extra", item["Mod/Extra"]) : ""}
            ${rangeLine("Energy", item["Energy/Move"], parseInt(item["Energy/Move"]), "-0", 0, 10, colorSchemeLowGood)}
            ${rangeLine("Heat", getPositiveString(item, "Heat/Move"), parseInt(item["Heat/Move"]), "+0", 0, 10, colorSchemeLowGood)}
            ${rangeLine("Support", item["Support"], parseInt(item["Support"]), null, 0, 20, colorSchemeHighGood)}
            ${rangeLine(" Penalty", item["Penalty"], parseInt(item["Penalty"]), "0", 0, 60, colorSchemeLowGood)}
            ${rangeLine("Burnout", item["Burnout"], parseInt(item["Burnout"]), "N/A", 0, 100, colorSchemeLowGood)}
            `;
        }
        else if (item["Slot"] == "Utility") {
            // Add utility-unique categories
            html += `
            <p/>
            ${summaryLine("Active Upkeep")}
            ${rangeLine("Energy", getNegativeString(item, "Energy Upkeep"), parseInt(item["Energy Upkeep"]), "-0", 0, 20, colorSchemeLowGood)}
            ${rangeLine("Matter", getNegativeString(item, "Matter Upkeep"), parseInt(item["Matter Upkeep"]), "-0", 0, 20, colorSchemeLowGood)}
            ${rangeLine("Heat", getPositiveString(item, "Heat Generation"), parseInt(item["Heat Generation"]), "+0", 0, 20, colorSchemeLowGood)}
            `;
        }
        else {
            // Add weapon-unique categories
            if (item["Type"].includes("Gun") || item["Type"].includes("Cannon")) {
                html += `
                <p/>
                ${summaryLine("Shot")}
                ${rangeLine("Range", item["Range"], parseInt(item["Range"]), null, 0, 20, colorSchemeHighGood)}
                ${rangeLine("Energy", getNegativeString(item, "Shot Energy"), parseInt(item["Shot Energy"]), "-0", 0, 50, colorSchemeLowGood)}
                ${rangeLine("Matter", getNegativeString(item, "Shot Matter"), parseInt(item["Shot Matter"]), "-0", 0, 25, colorSchemeLowGood)}
                ${rangeLine("Heat", getPositiveString(item, "Shot Heat"), parseInt(item["Shot Heat"]), "-0", 0, 100, colorSchemeLowGood)}
                ${valueLineWithDefault("Recoil", item["Recoil"], "0")}
                ${valueLineUnitsWithDefault("Targeting", item["Targeting"], "%", "0")}
                ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                ${rangeLine("Stability", item["Overload Stability"], getOverloadStabilityValue(item), "N/A", 0, 100, colorSchemeHighGood)}
                ${"Waypoints" in item ? valueLine("Waypoints", item["Waypoints"]) : valueLineWithDefault("Arc", item["Arc"], "N/A")}
                <p/>
                ${summaryProjectileLine(item)}
                ${rangeLine("Damage", item["Damage"], getDamageValue(item), null, 0, 100, colorSchemeGreen)}
                ${textLine("Type", item["Damage Type"])}
                ${rangeLineUnit("Critical", item["Critical"], parseInt(item["Critical"]), "%", "0", 0, 50, colorSchemeGreen)}
                ${textValueHtmlLine("Penetration", getPenetrationValue(item), getPenetrationValueClass(item), getPenetrationTextHtml(item))}
                ${"Heat Transfer" in item ? textLine("Heat Transfer", item["Heat Transfer"]) : textLineWithDefault("Spectrum", item["Spectrum"], "N/A")}
                ${rangeLineUnit("Disruption", item["Disruption"], parseInt(item["Disruption"]), "%", "0", 0, 50, colorSchemeGreen)}
                ${valueLineWithDefault("Salvage", item["Salvage"], "0")}
                `;
            }
            else if (item["Type"] === "Launcher") {
                html += `
                <p/>
                ${summaryLine("Shot")}
                ${rangeLine("Range", item["Range"], parseInt(item["Range"]), null, 0, 20, colorSchemeHighGood)}
                ${rangeLine("Energy", getNegativeString(item, "Shot Energy"), parseInt(item["Shot Energy"]), "-0", 0, 50, colorSchemeLowGood)}
                ${rangeLine("Matter", getNegativeString(item, "Shot Matter"), parseInt(item["Shot Matter"]), "-0", 0, 25, colorSchemeLowGood)}
                ${rangeLine("Heat", getPositiveString(item, "Shot Heat"), parseInt(item["Shot Heat"]), "-0", 0, 100, colorSchemeLowGood)}
                ${valueLineWithDefault("Recoil", item["Recoil"], "0")}
                ${valueLineUnitsWithDefault("Targeting", item["Targeting"], "%", "0")}
                ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                ${rangeLine("Stability", item["Overload Stability"], getOverloadStabilityValue(item), "N/A", 0, 100, colorSchemeHighGood)}
                ${"Waypoints" in item ? valueLine("Waypoints", item["Waypoints"]) : valueLineWithDefault("Arc", item["Arc"], "N/A")}
                <p/>
                ${summaryLine("Explosion")}
                ${rangeLine("Radius", item["Explosion Radius"], parseInt(item["Explosion Radius"]), null, 0, 8, colorSchemeGreen)}
                ${rangeLine("Damage", item["Explosion Damage"], getExplosionValue(item), null, 0, 100, colorSchemeGreen)}
                ${valueLineWithDefault(" Falloff", "Falloff" in item ? "-" + item["Falloff"] : null, "0")}
                ${textLine("Type", item["Explosion Type"])}
                ${textLineWithDefault("Spectrum", item["Explosion Spectrum"], "N/A")}
                ${rangeLineUnit("Disruption", item["Explosion Disruption"], parseInt(item["Explosion Disruption"]), "%", "0", 0, 50, colorSchemeGreen)}
                ${valueLineWithDefault("Salvage", item["Explosion Salvage"], "0")}
                `;
            }
            else if (item["Type"] === "Special Melee Weapon") {
                html += `
                <p/>
                ${summaryLine("Attack")}
                ${rangeLine("Energy", getNegativeString(item, "Shot Energy"), parseInt(item["Shot Energy"]), "-0", 0, 50, colorSchemeLowGood)}
                ${rangeLine("Matter", getNegativeString(item, "Shot Matter"), parseInt(item["Shot Matter"]), "-0", 0, 25, colorSchemeLowGood)}
                ${rangeLine("Heat", getPositiveString(item, "Shot Heat"), parseInt(item["Shot Heat"]), "-0", 0, 100, colorSchemeLowGood)}
                ${valueLineUnitsWithDefault("Targeting", item["Targeting"], "%", "0")}
                ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                `;
            }
            else if (item["Type"] === "Special Weapon") {
                html += `
                <p/>
                ${summaryLine("Shot")}
                ${rangeLine("Range", item["Range"], parseInt(item["Range"]), null, 0, 20, colorSchemeHighGood)}
                ${rangeLine("Energy", getNegativeString(item, "Shot Energy"), parseInt(item["Shot Energy"]), "-0", 0, 50, colorSchemeLowGood)}
                ${rangeLine("Matter", getNegativeString(item, "Shot Matter"), parseInt(item["Shot Matter"]), "-0", 0, 25, colorSchemeLowGood)}
                ${rangeLine("Heat", getPositiveString(item, "Shot Heat"), parseInt(item["Shot Heat"]), "-0", 0, 100, colorSchemeLowGood)}
                ${valueLineWithDefault("Recoil", item["Recoil"], "0")}
                ${valueLineUnitsWithDefault("Targeting", item["Targeting"], "%", "0")}
                ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                ${rangeLine("Stability", item["Overload Stability"], getOverloadStabilityValue(item), "N/A", 0, 100, colorSchemeHighGood)}
                ${"Waypoints" in item ? valueLine("Waypoints", item["Waypoints"]) : valueLineWithDefault("Arc", item["Arc"], "N/A")}
                `;

                if ("Damage" in item) {
                    html += `
                    <p/>
                    ${summaryLine("Projectile")}
                    ${rangeLine("Damage", item["Damage"], getDamageValue(item), null, 0, 100, colorSchemeGreen)}
                    ${textLine("Type", item["Damage Type"])}
                    ${rangeLineUnit("Critical", item["Critical"], parseInt(item["Critical"]), "%", "0", 0, 50, colorSchemeGreen)}
                    ${textValueHtmlLine("Penetration", getPenetrationValue(item), getPenetrationValueClass(item), getPenetrationTextHtml(item))}
                    ${"Heat Transfer" in item ? textLine("Heat Transfer", item["Heat Transfer"]) : textLineWithDefault("Spectrum", item["Spectrum"], "N/A")}
                    ${rangeLineUnit("Disruption", item["Disruption"], parseInt(item["Disruption"]), "%", "0", 0, 50, colorSchemeGreen)}
                    ${valueLineWithDefault("Salvage", item["Salvage"], "0")}
                    `;
                }
            }
            else if (item["Type"] === "Impact Weapon" || item["Type"] === "Slashing Weapon" || item["Type"] === "Piercing Weapon") {
                html += `
                <p/>
                ${summaryLine("Attack")}
                ${rangeLine("Energy", getNegativeString(item, "Shot Energy"), parseInt(item["Shot Energy"]), "-0", 0, 50, colorSchemeLowGood)}
                ${rangeLine("Matter", getNegativeString(item, "Shot Matter"), parseInt(item["Shot Matter"]), "-0", 0, 25, colorSchemeLowGood)}
                ${rangeLine("Heat", getPositiveString(item, "Shot Heat"), parseInt(item["Shot Heat"]), "-0", 0, 100, colorSchemeLowGood)}
                ${valueLineUnitsWithDefault("Targeting", item["Targeting"], "%", "0")}
                ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                <p/>
                ${rangeLine("Damage", item["Damage"], getDamageValue(item), null, 0, 100, colorSchemeGreen)}
                ${textLine("Type", item["Damage Type"])}
                ${rangeLineUnit("Critical", item["Critical"], parseInt(item["Critical"]), "%", "0", 0, 50, colorSchemeGreen)}
                ${rangeLineUnit("Disruption", item["Disruption"], parseInt(item["Disruption"]), "%", "0", 0, 50, colorSchemeGreen)}
                ${valueLineWithDefault("Salvage", item["Salvage"], "0")}
                `;
            }
        }

        // Add effect/description if present
        if ("Effect" in item || "Description" in item) {
            html += `
            <p/>
            ${summaryLine("Effect")}
            `;

            if ("Effect" in item) {
                html += `<span class="popover-description">${escapeHtml(item["Effect"])}</span>`

                if ("Description" in item) {
                    html += "<p/><p/>"
                }
            }

            if ("Description" in item) {
                html += `<span class="popover-description">${escapeHtml(item["Description"])}</span>`
            }
        }

        return html;
    }

    // Creates buttons for all items
    function createItems() {
        const items = Object.values(itemData);
        items.sort((a, b) => a["Name"].localeCompare(b["Name"]));
        const itemsGrid = $("#itemsGrid");
        items.forEach(item => {
            itemsGrid.append(
                `<button
                    class="item btn"
                    type="button"
                    data-html=true
                    data-content='${createItemDataContent(item)}'
                    data-toggle="popover">
                    ${item["Name"]}
                 </button>`);
        });

        $('#itemsGrid > [data-toggle="popover"]').popover();
    }

    // Initialize the page state
    function init(items, categories) {
        itemData = items;
        categoryData = categories;

        // Initialize page state
        createItems();
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
        $("#schematicsContainer > label > input").on("click", updateItems);
        $("#powerTypeContainer > label > input").on("click", updateItems);
        $("#propTypeContainer > label > input").on("click", updateItems);
        $("#utilTypeContainer > label > input").on("click", updateItems);
        $("#weaponTypeContainer > label > input").on("click", updateItems);
        $("#categoryContainer > label > input").on("click", updateItems);

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            if ($(e.target).parents(".popover").length === 0 && $(".popover").length >= 1) {
                $('[data-toggle="popover"]').not(e.target).popover("hide");
            }
        });

        // Enable tooltips
        $('[data-toggle="tooltip"]').tooltip()
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
        const nameValue = $("#name").val();
        if (nameValue.length > 0) {
            filters.push(item => item["Name"].toLowerCase().includes(nameValue.toLowerCase()));
        }

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

        // Schematic filter
        const depthValue = $("#depth").val();
        if (depthValue.length > 0) {
            const depthNum = parseInt(depthValue);

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

    // Escapes the given string for HTML
    function escapeHtml(string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
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
        resetButtonGroup($("#schematicsContainer"));
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
        // Hide any existing popovers
        $('[data-toggle="popover"]').popover("hide");

        // Get the names of all non-filtered items
        const itemFilter = getItemFilter();
        let items = new Set();
        Object.keys(itemData).forEach(itemName => {
            const item = itemData[itemName];

            if (itemFilter(item)) {
                items.add(item["Name"]);
            }
        });

        // Set visibility of all items
        $("#itemsGrid > button").addClass("not-visible");

        $("#itemsGrid > button").each((i, item) => {
            const itemName = $(item).text().trim();

            if (items.has(itemName)) {
                $(item).removeClass("not-visible");
            }
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

    // Returns the value if it's not undefined, otherwise return defaultVal
    function valueOrDefault(val, defaultVal) {
        if (val === undefined) {
            return defaultVal;
        }

        return val;
    }
});