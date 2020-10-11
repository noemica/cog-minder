// Common JS code
export let botData;
export let categoryData;
export let itemData;

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
export const entityMap = {
    '&': '&amp;',
    '<': 'ᐸ',
    '>': 'ᐳ',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
    '\n': '<br />',
};

// Creates a range line from minVal to maxVal using filled squares with the given color scheme with no unit
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
function summaryProjectileLine(item, category) {
    if ("Projectile Count" in item && parseInt(item["Projectile Count"]) > 1) {
        return `<pre class="popover-summary">${category}${" ".repeat(13)}<span class="projectile-num"> x${item["Projectile Count"]} </span></pre>`;
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
    if (typeof (textString) != "string") {
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

export function createBotDataContent(bot) {
    // Create overview
    let html = `
    <pre class="popover-title">${escapeHtml(bot["Name"])}</pre>
    <p/>
    `;

    return html;
}

// Creates a grid item's popover data content HTML string
export function createItemDataContent(item) {
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

        if (penetrationString === "Unlimited") {
            return "x*";
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
            ${summaryProjectileLine(item, "Projectile")}
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
            ${summaryProjectileLine(item, "Explosion")}
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

// Escapes the given string for HTML
export function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/\n]/g, function (s) {
        return entityMap[s];
    });
}

// Removes the prefix from an item name
const noPrefixRegex = /\w{3}\. (.*)/;
export function noPrefixName(name) {
    const newName = name.replace(noPrefixRegex, "$1");
    return newName;
}

// Initialize the item data
export async function initItemData() {
    // Load external files
    const bots = fetch("./json/bots.json")
        .then(response => response.json());
    const categories = fetch("./json/categories.json")
        .then(response => response.json());
    const items = fetch("./json/items.json")
        .then(response => response.json());

    await Promise.all([bots, categories, items]);

    botData = await bots;
    categoryData = await categories;
    itemData = await items;

    // Add calculated properties to items
    Object.keys(itemData).forEach(itemName => {
        // Add no prefix name
        const item = itemData[itemName];
        const name = noPrefixName(itemName);
        item["No Prefix Name"] = name;

        // Add float-value rating
        const rating = item["Rating"];
        if (rating.includes("*")) {
            item["Float Rating"] = parseFloat(rating.slice(0, rating.lastIndexOf("*"))) + 0.5;
        }
        else {
            item["Float Rating"] = parseFloat(rating);
        }

        // Add int-value size/mass
        item["Int Size"] = parseInt(item["Size"]);
        item["Int Mass"] = parseInt(item["Mass"]);
    });
}

// Returns the value if it's not undefined, otherwise return defaultVal
export function valueOrDefault(val, defaultVal) {
    if (val === undefined) {
        return defaultVal;
    }

    return val;
}