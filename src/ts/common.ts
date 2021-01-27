// Common code
import * as categories from "../json/categories.json";
import {
    Bot,
    BotPart,
    ItemOption,
    JsonBot
} from "./botTypes";
import {
    FabricationStats,
    Item,
    ItemCategory,
    ItemSlot,
    ItemType,
    JsonItem,
    OtherItem,
    PowerItem,
    PropulsionItem,
    UtilityItem,
    WeaponItem
} from "./itemTypes";

export let botData: { [key: string]: Bot };
export let itemData: { [key: string]: Item };

// Color schemes
enum ColorScheme {
    LowGood = "lowGood",
    HighGood = "highGood",
    Green = "green",
    Red = "red",
};
const colorSchemes = {
    "lowGood": { low: "range-green", midLow: "range-yellow", midHigh: "range-orange", high: "range-red" },
    "highGood": { low: "range-red", midLow: "range-orange", midHigh: "range-yellow", high: "range-green" },
    "green": { low: "range-green", midLow: "range-green", midHigh: "range-green", high: "range-green" },
    "red": { low: "range-red", midLow: "range-red", midHigh: "range-red", high: "range-red" },
}

// Character -> escape character map
export const entityMap: { [key: string]: string } = {
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

// Ceil the number to the nearest multiple
function ceilToMultiple(num: number, multiple: number) {
    return Math.ceil(num / multiple) * multiple;
}

// Creates a range line from minVal to maxVal using filled squares with the given color scheme with no unit
function rangeLine(category: string, valueString: string | undefined, value: number | undefined,
    defaultValueString: string | undefined, minValue: number, maxValue: number, colorScheme: ColorScheme) {
    return rangeLineUnit(category, valueString, value, "", defaultValueString, minValue, maxValue, colorScheme);
}

// Creates a range line from minVal to maxVal using filled squares with the given color scheme
function rangeLineUnit(category: string, valueString: string | undefined, value: number | undefined, unitString: string,
    defaultValueString: string | undefined, minValue: number, maxValue: number, colorScheme: ColorScheme) {
    let valueHtml: string;
    if (valueString === undefined || value === undefined) {
        valueString = defaultValueString;
        value = 0;
        valueHtml = `<span class="dim-text">${defaultValueString}${unitString}</span>`;
    }
    else {
        valueHtml = valueString + unitString;
    }

    const goodValue = value!;

    // Determine bars and spacing
    const maxBars = 22;
    const numSpaces = 23 - 1 - 1 - category.length - (valueString as string).length - unitString.length;
    let valuePercentage: number;
    if (maxValue - minValue === 0) {
        valuePercentage = 1;
    }
    else {
        valuePercentage = goodValue / (maxValue - minValue);
    }

    let fullBars = Math.min(Math.floor(maxBars * valuePercentage), 22);

    // Always round away from 0
    // This allows for things like 1/100 to show 1 bar rather than 0
    if (fullBars === 0 && goodValue != minValue) {
        fullBars = 1;
    }

    if (minValue === maxValue) {
        fullBars = 0;
    }
    const emptyBars = maxBars - fullBars;

    // Determine color
    let colorClass: string;
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
    let barsHtml: string;
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
function summaryLine(text: string) { return `<pre class="popover-summary">${text}</pre>` }

// Creates a summary line with an optional projectile multiplier
function summaryProjectileLine(item: WeaponItem, category: string) {
    if (item.projectileCount > 1) {
        return `<pre class="popover-summary">${category}${" ".repeat(13)}<span class="projectile-num"> x${item.projectileCount} </span></pre>`;
    }
    else {
        return summaryLine("Projectile")
    }
}

// Create a text line with no value and default style
function textLine(category: string, text: string | undefined) {
    const numSpaces = 23 - 1 - category.length;
    return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${text}</pre>`;
}

// Create a text line with no value and dim style
function textLineDim(category: string, text: string) {
    const numSpaces = 23 - 1 - category.length;
    return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}<span class="dim-text">${text}</span></pre>`;
}

// Create a text line with no value  and a default
function textLineWithDefault(category: string, textString: string | undefined, defaultString: string) {
    if (typeof (textString) != "string") {
        textString = `<span class="dim-text">${defaultString}</span>`;
    }

    const numSpaces = 23 - 1 - category.length;
    return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${textString}</pre>`;
}

// Create a text line with a value and a given HTML string for the text
function textValueHtmlLine(category: string, valueString: string, valueClass: string, textHtml: string) {
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
function valueLine(category: string, valueString: string) {
    const numSpaces = 23 - 1 - category.length - 1 - valueString.length;
    return `<pre class="popover-line"> ${category}${" ".repeat(numSpaces)}${valueString}</pre>`;
}

// Create a value line with no text and a default
function valueLineUnitsWithDefault(category: string, valueString: string | undefined,
    unitString: string, defaultString: string) {
    let valueLength: number;
    if (valueString === undefined) {
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
function valueLineWithDefault(category: string, valueString: string | undefined, defaultString: string) {
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

// Creates a HTML string representing a bot
export function createBotDataContent(bot: Bot) {
    function createItemHtml(data: BotPart) {
        let line = `${escapeHtml(data.name)} (${data.coverage}%)`;

        if (data.number > 1) {
            line += " x" + data.number;
        }
        return `${itemLine(line)}`;
    }

    function createItemOptionHtml(data: BotPart[]) {
        // Add all options
        let html = "";

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            let line: string;
            if (item.name === "None") {
                line = "None";
            }
            else {
                line = `${item.name} (${item.coverage}%)`;
            }

            if (item.number > 1) {
                line += " x" + item.number;
            }

            html += itemLineOption(line, i);
        }

        return html;
    }

    function getRatingValue(bot: Bot) {
        const ratingString = bot.rating;
        const ratingArray = ratingString.split("-").map(s => s.trim()).map(s => parseInt(s));
        return ratingArray.reduce((sum, val) => sum + val, 0) / ratingArray.length;
    }

    function itemLine(itemString: string) {
        itemString = itemString.padEnd(46);
        return "" +
            '<pre class="popover-part">' +
            '<span class="bot-popover-item-bracket bot-popover-item-bracket-invisible">[</span>' +
            `${itemString}` +
            '<span class="bot-popover-item-bracket bot-popover-item-bracket-invisible">]</span>' +
            '</pre>';
    }

    function itemLineOption(itemString: string, i: number) {
        itemString = itemString.padEnd(43);
        return "" +
            '<pre class="popover-line">' +
            '<span class="bot-popover-item-bracket bot-popover-item-bracket-invisible">[</span>' +
            `<span class="popover-option">${String.fromCharCode(97 + i)}) </span>` +
            `<span>${itemString}</span>` +
            '<span class="bot-popover-item-bracket bot-popover-item-bracket-invisible">]</span>' +
            '</pre>';
    }

    // Create overview
    let html = `
        <pre class="popover-title">${escapeHtml(bot.name)}</pre>
        <p/>
        ${summaryLine("Overview")}
        ${textLine("Class", bot.class)}
        ${textLine("Size", bot.size)}
        ${rangeLine("Rating", bot.rating, getRatingValue(bot), undefined, 0, 165, ColorScheme.LowGood)}
        ${textLine("Value", bot.value.toString())}
        ${textLine("Visual Range", bot.visualRange)}
        ${textLine("Movement", bot.movement)}
        ${rangeLine("Core Integrity", bot.coreIntegrity.toString(), bot.coreIntegrity, undefined, 0, bot.coreIntegrity, ColorScheme.Green)}
        ${rangeLineUnit("Core Exposure", bot.coreExposure.toString(), bot.coreExposure, "%", undefined, 0, 100, ColorScheme.LowGood)}
        ${textLine("Salvage Potential", bot.salvagePotential)}
        <p/>
        ${summaryLine("Armament")}
        `;

    // Add armament items and options
    if (bot.armament.length > 0) {
        bot.armamentData.forEach(data => {
            html += createItemHtml(data);
        });

        for (let i = 0; i < bot.armamentOptionData.length; i++) {
            if (i != 0 || bot.armamentData.length > 0) {
                html += "<p/>"
            }
            html += createItemOptionHtml(bot.armamentOptionData[i]);
        }
    }
    else {
        html += itemLine("None");
    }

    // Add component items
    html += `
    <p/>
    ${summaryLine("Components")}
    `;

    if (bot.components.length > 0) {
        bot.componentData.forEach(data => {
            html += createItemHtml(data);
        });

        for (let i = 0; i < bot.componentOptionData.length; i++) {
            if (i != 0 || bot.componentData.length > 0) {
                html += "<p/>"
            }
            html += createItemOptionHtml(bot.componentOptionData[i]);
        }
    }
    else {
        html += itemLine("N/A");
    }

    // Add Resistances/immunities
    const resistances = Object.keys(valueOrDefault(bot.resistances, {}));
    const immunities = bot.immunities;
    if (resistances.length > 0 || immunities.length > 0) {
        html += `
        <p/>
        ${summaryLine("Resistances")}
        `;

        resistances.forEach(damageType => {
            const resistValue = bot.resistances[damageType];

            if (resistValue === undefined) {
                return;
            }

            if (resistValue > 0) {
                html += rangeLine(damageType, resistValue.toString() + "%",
                    resistValue, undefined, 0, 100, ColorScheme.Green);
            }
            else {
                html += rangeLine(damageType, resistValue.toString() + "%",
                    resistValue, undefined, 0, -100, ColorScheme.Red);
            }
        });

        immunities.forEach(immunity => {
            html += textLineDim(immunity, "IMMUNE");
        });
    }

    // Add traits
    const traits = bot.traits;
    if (traits.length > 0) {
        html += `
        <p/>
        ${summaryLine("Traits")}
        `;

        traits.forEach(trait => {
            html += itemLine(trait);
        });
    }

    // Add description
    const description = escapeHtml(valueOrDefault(bot.description, ""));
    if (description.length > 0) {
        html += `
        <p/>
        ${summaryLine("Description")}
        <span class="popover-description">${description}</span>
        `;
    }

    return html;
}

// Creates an HTML string representing an item
export function createItemDataContent(baseItem: Item) {
    function getDamageValue(item: WeaponItem) {
        const damageString = item.damage!;
        const damageArray = damageString.split("-").map(s => s.trim()).map(s => parseInt(s));
        return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
    }

    function getDelayString(item: WeaponItem) {
        if (item.delay === undefined) {
            return undefined;
        }
        else {
            if (item.delay > 0) {
                return "+" + item.delay;
            }

            return (item.delay).toString();
        }
    }

    function getExplosionValue(item: WeaponItem) {
        const damageString = item.explosionDamage!;
        const damageArray = damageString.split("-").map(s => s.trim()).map(s => parseInt(s));
        return damageArray.reduce((sum, val) => sum + val, 0) / damageArray.length;
    }

    function getFabricationMatterString(stats: FabricationStats) {
        const matter = stats.matter;
        const siphonMatter = Math.floor(parseInt(matter) * .75).toString();

        return `${matter} (With siphon: ${siphonMatter})`;
    }

    function getPenetrationTextHtml(item: WeaponItem): string {
        const penetrationString = item.penetration;

        if (penetrationString === undefined) {
            return "";
        }

        const penetrationArray = penetrationString.split("/").map(s => s.trim());

        return penetrationArray.join(" / ");
    }

    function getPenetrationValueClass(item: WeaponItem): string {
        if (item.penetration !== undefined) {
            return "";
        }

        return "dim-text";
    }

    function getPenetrationValue(item: WeaponItem): string {
        const penetrationString = item.penetration;

        if (penetrationString === undefined) {
            return "x0";
        }

        if (penetrationString === "Unlimited") {
            return "x*";
        }

        const penetrationArray = penetrationString.split("/").map(s => s.trim());

        return "x" + penetrationArray.length;
    }

    function getRatingHtml(item: Item) {
        switch (item.category) {
            case ItemCategory.Alien:
                return '<span class="rating-alien"> Alien </span>';

            case ItemCategory.Prototype:
                return '<span class="rating-prototype"> Prototype </span>';

            case ItemCategory.None:
                return '<span class="dim-text">Standard</span>';
        }
    }

    function getSchematicString(item: Item) {
        if (item.hackable) {
            return "Hackable";
        }
        else if (item.fabrication != null) {
            return "Not Hackable"
        }

        return undefined;
    }

    function getSlotString(item: Item): string {
        let slotType = item.slot as string;

        if (slotType == ItemSlot.NA) {
            // Take care of item special cases
            if (item.type == ItemType.Item || item.type == ItemType.Trap) {
                slotType = "Inventory";
            }
            else {
                return `<span class="dim-text">N/A</span>`
            }
        }

        if (item.size > 1) {
            return `${slotType} x${item.size}`;
        }

        return slotType;
    }

    // Create overview
    let html = `
    <pre class="popover-title">${escapeHtml(baseItem.name)}</pre>
    <p/>
    ${summaryLine("Overview")}
    ${textLine("Type", baseItem.type)}
    ${textLine("Slot", getSlotString(baseItem))}
    ${rangeLine("Mass", baseItem.mass?.toString(), baseItem.mass, "N/A", 0, 15, ColorScheme.LowGood)}
    ${textValueHtmlLine("Rating", baseItem.ratingString.replace("**", "").replace("*", ""), "", getRatingHtml(baseItem))}
    ${rangeLine("Integrity", baseItem.integrity?.toString(), 1, undefined, 0, 1, ColorScheme.Green)}
    ${valueLine("Coverage", baseItem.coverage?.toString() ?? "0")}
    ${textLineWithDefault("Schematic", getSchematicString(baseItem), "N/A")}
    `;

    switch (baseItem.slot) {
        case ItemSlot.Power: {
            const item = baseItem as PowerItem;

            // Add power-unique categories
            html += `
                <p/>
                ${summaryLine("Active Upkeep")}
                ${rangeLine("Energy", undefined, 0, "-0", 0, 0, ColorScheme.LowGood)}
                ${rangeLine("Matter", undefined, 0, "-0", 0, 0, ColorScheme.LowGood)}
                ${rangeLine("Heat", "+" + item.heatGeneration, item.heatGeneration, "+0", 0, 20, ColorScheme.LowGood)}
                <p/>
                ${summaryLine("Power")}
                ${rangeLine("Supply", "+" + item.energyGeneration, item.energyGeneration, undefined, 0, 30, ColorScheme.Green)}
                ${rangeLine("Storage", item.energyStorage?.toString(), item.energyStorage, "0", 0, 300, ColorScheme.Green)}
                ${rangeLine("Stability", item.powerStability + "%", item.powerStability, "N/A", 0, 100, ColorScheme.HighGood)}
                `;
            break;
        }

        case ItemSlot.Propulsion: {
            const item = baseItem as PropulsionItem;

            // Add propulsion-unique categories
            html += `
                <p/>
                ${summaryLine("Active Upkeep")}
                ${rangeLine("Energy", "-" + item.energyUpkeep, item.energyUpkeep, "-0", 0, 20, ColorScheme.LowGood)}
                ${rangeLine("Matter", undefined, 0, "-0", 0, 0, ColorScheme.LowGood)}
                ${rangeLine("Heat", "+" + item.heatGeneration, item.heatGeneration, "+0", 0, 20, ColorScheme.LowGood)}
                <p/>
                ${summaryLine("Propulsion")}
                ${rangeLine("Time/Move", item.timePerMove.toString(), item.timePerMove, undefined, 0, 150, ColorScheme.LowGood)}
                ${item.modPerExtra == undefined ? "" : valueLine(" Mod/Extra", item.modPerExtra.toString())}
                ${rangeLine("Energy", "-" + item.energyPerMove, item.energyPerMove, "-0", 0, 10, ColorScheme.LowGood)}
                ${rangeLine("Heat", "+" + item.heatPerMove, item.heatPerMove, "+0", 0, 10, ColorScheme.LowGood)}
                ${rangeLine("Support", item.support?.toString(), item.support, undefined, 0, 20, ColorScheme.HighGood)}
                ${rangeLine(" Penalty", item.penalty?.toString(), item.penalty, "0", 0, 60, ColorScheme.LowGood)}
                ${item.type === ItemType.Treads ?
                    textLineWithDefault("Siege", item.siege, "N/A") :
                    rangeLine("Burnout", item.burnout, parseInt(item.burnout ?? ""), "N/A", 0, 100, ColorScheme.LowGood)}
                `;
            break;
        }

        case ItemSlot.Utility: {
            const item = baseItem as UtilityItem;

            // Add utility-unique categories
            html += `
                <p/>
                ${summaryLine("Active Upkeep")}
                ${rangeLine("Energy", "-" + item.energyUpkeep, item.energyUpkeep, "-0", 0, 20, ColorScheme.LowGood)}
                ${rangeLine("Matter", undefined, 0, "-0", 0, 0, ColorScheme.LowGood)}
                ${rangeLine("Heat", "+" + item.heatGeneration, item.heatGeneration, "+0", 0, 20, ColorScheme.LowGood)}
                `;
            break;
        }

        case ItemSlot.Weapon: {
            const item = baseItem as WeaponItem;
            // Add weapon-unique categories

            switch (item.type) {
                case ItemType.BallisticCannon:
                case ItemType.BallisticGun:
                case ItemType.EnergyCannon:
                case ItemType.EnergyGun:
                    html += `
                        <p/>
                        ${summaryLine("Shot")}
                        ${rangeLine("Range", item.range!.toString(), item.range, undefined, 0, 20, ColorScheme.HighGood)}
                        ${rangeLine("Energy", "-" + item.shotEnergy, item.shotEnergy, "-0", 0, 50, ColorScheme.LowGood)}
                        ${rangeLine("Matter", "-" + item.shotMatter, item.shotMatter, "-0", 0, 25, ColorScheme.LowGood)}
                        ${rangeLine("Heat", "+" + item.shotHeat, item.shotHeat, "+0", 0, 100, ColorScheme.LowGood)}
                        ${valueLineWithDefault("Recoil", item.recoil?.toString(), "0")}
                        ${valueLineUnitsWithDefault("Targeting", item.targeting?.toString(), "%", "0")}
                        ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                        ${rangeLine("Stability", item.overloadStability?.toString(), item.overloadStability, "N/A", 0, 100, ColorScheme.HighGood)}
                        ${item.waypoints === undefined ? valueLineWithDefault("Arc", item.arc?.toString(), "N/A") : valueLine("Waypoints", item.waypoints)}
                        <p/>
                        ${summaryProjectileLine(item, "Projectile")}
                        ${rangeLine("Damage", item.damage, getDamageValue(item), undefined, 0, 100, ColorScheme.Green)}
                        ${textLine("Type", item.damageType)}
                        ${rangeLineUnit("Critical", item.critical?.toString(), item.critical, "%", "0", 0, 50, ColorScheme.Green)}
                        ${textValueHtmlLine("Penetration", getPenetrationValue(item), getPenetrationValueClass(item), getPenetrationTextHtml(item))}
                        ${item.heatTransfer === undefined ? textLineWithDefault("Spectrum", item.spectrum, "N/A") : textLine("Heat Transfer", item.heatTransfer)}
                        ${rangeLineUnit("Disruption", item.disruption?.toString(), item.disruption, "%", "0", 0, 50, ColorScheme.Green)}
                        ${valueLineWithDefault("Salvage", item.salvage?.toString(), "0")}
                        `;
                    break;

                case ItemType.Launcher:
                    html += `
                        <p/>
                        ${summaryLine("Shot")}
                        ${rangeLine("Range", item.range!.toString(), item.range, undefined, 0, 20, ColorScheme.HighGood)}
                        ${rangeLine("Energy", "-" + item.shotEnergy, item.shotEnergy, "-0", 0, 50, ColorScheme.LowGood)}
                        ${rangeLine("Matter", "-" + item.shotMatter, item.shotMatter, "-0", 0, 25, ColorScheme.LowGood)}
                        ${rangeLine("Heat", "+" + item.shotHeat, item.shotHeat, "+0", 0, 100, ColorScheme.LowGood)}
                        ${valueLineWithDefault("Recoil", item.recoil?.toString(), "0")}
                        ${valueLineUnitsWithDefault("Targeting", item.targeting?.toString(), "%", "0")}
                        ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                        ${rangeLine("Stability", item.overloadStability?.toString(), item.overloadStability, "N/A", 0, 100, ColorScheme.HighGood)}
                        ${item.waypoints === undefined ? valueLineWithDefault("Arc", item.arc?.toString(), "N/A") : valueLine("Waypoints", item.waypoints)}
                        <p/>
                        ${summaryProjectileLine(item, "Explosion")}
                        ${rangeLine("Radius", item.explosionRadius?.toString(), item.explosionRadius, undefined, 0, 8, ColorScheme.Green)}
                        ${rangeLine("Damage", item.explosionDamage, getExplosionValue(item), undefined, 0, 100, ColorScheme.Green)}
                        ${valueLineWithDefault(" Falloff", item.falloff === undefined ? undefined : "-" + item.falloff, "0")}
                        ${textLine("Type", item.explosionType)}
                        ${textLineWithDefault("Spectrum", item.explosionSpectrum, "N/A")}
                        ${rangeLineUnit("Disruption", item.explosionDisruption?.toString(), item.explosionDisruption, "%", "0", 0, 50, ColorScheme.Green)}
                        ${valueLineWithDefault("Salvage", item.explosionSalvage, "0")}
                        `;
                    break;

                case ItemType.SpecialMeleeWeapon:
                    html += `
                        <p/>
                        ${summaryLine("Attack")}
                        ${rangeLine("Energy", "-" + item.shotEnergy, item.shotEnergy, "-0", 0, 50, ColorScheme.LowGood)}
                        ${rangeLine("Matter", "-" + item.shotMatter, item.shotMatter, "-0", 0, 25, ColorScheme.LowGood)}
                        ${rangeLine("Heat", "+" + item.shotHeat, item.shotHeat, "+0", 0, 100, ColorScheme.LowGood)}
                        ${valueLineUnitsWithDefault("Targeting", item.targeting?.toString(), "%", "0")}
                        ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                        `;
                    break;

                case ItemType.SpecialWeapon:
                    html += `
                        <p/>
                        ${summaryLine("Shot")}
                        ${rangeLine("Range", item.range!.toString(), item.range, undefined, 0, 20, ColorScheme.HighGood)}
                        ${rangeLine("Energy", "-" + item.shotEnergy, item.shotEnergy, "-0", 0, 50, ColorScheme.LowGood)}
                        ${rangeLine("Matter", "-" + item.shotMatter, item.shotMatter, "-0", 0, 25, ColorScheme.LowGood)}
                        ${rangeLine("Heat", "+" + item.shotHeat, item.shotHeat, "+0", 0, 100, ColorScheme.LowGood)}
                        ${valueLineWithDefault("Recoil", item.recoil?.toString(), "0")}
                        ${valueLineUnitsWithDefault("Targeting", item.targeting?.toString(), "%", "0")}
                        ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                        ${rangeLine("Stability", item.overloadStability?.toString(), item.overloadStability, "N/A", 0, 100, ColorScheme.HighGood)}
                        ${item.waypoints === undefined ? valueLineWithDefault("Arc", item.arc?.toString(), "N/A") : valueLine("Waypoints", item.waypoints)}
                        `;

                    if (item.damage !== undefined) {
                        // Only some special weapons have a damage section
                        html += `
                        <p/>
                        ${summaryProjectileLine(item, "Projectile")}
                        ${rangeLine("Damage", item.damage, getDamageValue(item), undefined, 0, 100, ColorScheme.Green)}
                        ${textLine("Type", item.damageType)}
                        ${rangeLineUnit("Critical", item.critical?.toString(), item.critical, "%", "0", 0, 50, ColorScheme.Green)}
                        ${textValueHtmlLine("Penetration", getPenetrationValue(item), getPenetrationValueClass(item), getPenetrationTextHtml(item))}
                        ${item.heatTransfer === undefined ? textLineWithDefault("Spectrum", item.spectrum, "N/A") : textLine("Heat Transfer", item.heatTransfer)}
                        ${rangeLineUnit("Disruption", item.disruption?.toString(), item.disruption, "%", "0", 0, 50, ColorScheme.Green)}
                        ${valueLineWithDefault("Salvage", item.salvage?.toString(), "0")}
                        `;
                    }
                    break;

                case ItemType.ImpactWeapon:
                case ItemType.SlashingWeapon:
                case ItemType.PiercingWeapon:
                    html += `
                        <p/>
                        ${summaryLine("Attack")}
                        ${rangeLine("Energy", "-" + item.shotEnergy, item.shotEnergy, "-0", 0, 50, ColorScheme.LowGood)}
                        ${rangeLine("Matter", "-" + item.shotMatter, item.shotMatter, "-0", 0, 25, ColorScheme.LowGood)}
                        ${rangeLine("Heat", "+" + item.shotHeat, item.shotHeat, "+0", 0, 100, ColorScheme.LowGood)}
                        ${valueLineUnitsWithDefault("Targeting", item.targeting?.toString(), "%", "0")}
                        ${valueLineWithDefault("Delay", getDelayString(item), "0")}
                        <p/>
                        ${rangeLine("Damage", item.damage, getDamageValue(item), undefined, 0, 100, ColorScheme.Green)}
                        ${textLine("Type", item.damageType)}
                        ${rangeLineUnit("Critical", item.critical?.toString(), item.critical, "%", "0", 0, 50, ColorScheme.Green)}
                        ${rangeLineUnit("Disruption", item.disruption?.toString(), item.disruption, "%", "0", 0, 50, ColorScheme.Green)}
                        ${valueLineWithDefault("Salvage", item.salvage?.toString(), "0")}
                        `;
                    break;

                default:
                    throw "Unhandled weapon type";
            }
        }
    }

    // Add effect/description if present
    if (baseItem.effect !== undefined || baseItem.description !== undefined) {
        html += `
        <p/>
        ${summaryLine("Effect")}
        `;

        if (baseItem.effect !== undefined) {
            html += `<span class="popover-description">${escapeHtml(baseItem.effect)}</span>`

            if (baseItem.description !== undefined) {
                html += "<p/><p/>"
            }
        }

        if (baseItem.description !== undefined) {
            html += `<span class="popover-description">${escapeHtml(baseItem.description)}</span>`
        }
    }

    // Add fabrication stats if present
    if (baseItem.fabrication != null) {
        const number = baseItem.fabrication.number;

        html += "<p/>";

        if (number === "1") {
            html += summaryLine("Fabrication");
        }
        else {
            html += summaryLine(`Fabrication x${number}`);
        }

        html += `
        ${textLine("Time", baseItem.fabrication.time)}
        ${textLine("Matter", getFabricationMatterString(baseItem.fabrication))}
        ${textLine("Components", "None")}
        `;
    }

    return html;
}

// Escapes the given string for HTML
export function escapeHtml(string: string) {
    return String(string).replace(/[&<>"'`=\/\n]/g, function (s) {
        return entityMap[s];
    });
}

// Flatten an array of arrays into a single array
export function flatten(arrays: [[]]) {
    return [].concat.apply([], arrays);
}

// Do a lexicographical sort based on the no-prefix item name
export function gallerySort(a: string, b: string) {
    const noPrefixA = getNoPrefixName(a);
    const noPrefixB = getNoPrefixName(b);
    let res = noPrefixA.localeCompare(noPrefixB);

    if (res === 0) {
        // If no-prefix names match then use index in gallery export
        // There may be some formula to determine the real order or
        // it may be a hand-crafted list, I couldn't tell either way.
        // The export index will always be ordered for different prefix
        // versions of the same parts so this is the best way to sort
        // them how the in-game gallery does.
        res = getItem(a).index - getItem(b).index;
    }

    return res;
}

// Tries to get an item by the name
export function getBot(botName: string) {
    if (botName in botData) {
        return botData[botName];
    }

    console.trace();
    throw `${botName} not a valid bot`;
}

// Tries to get an item by the name
export function getItem(itemName: string) {
    if (itemName in itemData) {
        return itemData[itemName];
    }
    console.trace();
    throw `${itemName} not a valid item`;
}

// Removes the prefix from an item name
const noPrefixRegex = /\w{3}\. (.*)/;
export function getNoPrefixName(name: string): string {
    const newName = name.replace(noPrefixRegex, "$1");
    return newName;
}

// Converts an item or bot's name to an HTML id
const nameToIdRegex = /[ /.'"\]\[]]*/g;
export function nameToId(name: string) {
    const id = `item${name.replace(nameToIdRegex, "")}`;
    return id;
}

// Initialize all item and bot data
export function initData(items: { [key: string]: JsonItem }, bots: { [key: string]: JsonBot } | undefined) {
    // Load external files
    botData = {};
    itemData = {};

    // Create items
    Object.keys(items).forEach((itemName, index) => {
        if (itemName === "default") {
            // Not sure why this "default" pops up but it messes things up
            // Maybe an artifact of being imported as a JSON file
            return;
        }

        const item = (items as { [key: string]: JsonItem })[itemName];
        let newItem: Item;

        let category: ItemCategory = (<any>ItemCategory)[item.Category ?? ""];
        if (category === undefined) {
            category = ItemCategory.None;
        }

        let rating = parseIntOrUndefined(item.Rating) ?? 1;
        if (category == ItemCategory.Alien) rating += .75;
        else if (category == ItemCategory.Prototype) rating += .5;

        let ratingString = item.Rating;
        if (category == ItemCategory.Alien) ratingString += "*";
        else if (category == ItemCategory.Prototype) ratingString += "**";

        const fabrication: FabricationStats | undefined = item["Fabrication Number"] === undefined ? undefined : {
            matter: item["Fabrication Matter"]!,
            number: item["Fabrication Number"]!,
            time: item["Fabrication Time"]!,
        };

        let itemCategories: number[];
        if (!(itemName in categories)) {
            console.log(`Need to add categories for ${itemName}`);
            itemCategories = [];
        }
        else {
            itemCategories = (categories as { [key: string]: number[] })[itemName];
        }

        const coverage = parseIntOrUndefined(item.Coverage!) ?? 0;
        const hackable = !!parseIntOrUndefined(item["Hackable Schematic"]!) ?? 0;
        const integrity = parseIntOrUndefined(item.Integrity) ?? 0;
        const mass = parseIntOrUndefined(item.Mass!);
        const noPrefixName = getNoPrefixName(itemName);
        const size = parseIntOrUndefined(item.Size) ?? 1;

        switch (item["Slot"]) {
            case ItemSlot.NA:
                const otherItem: OtherItem = {
                    slot: ItemSlot.NA,
                    category: category,
                    coverage: undefined,
                    hackable: hackable,
                    integrity: integrity,
                    mass: undefined,
                    name: item.Name,
                    noPrefixName: noPrefixName,
                    rating: rating,
                    ratingString: ratingString,
                    size: size,
                    type: item.Type,
                    description: item.Description,
                    categories: itemCategories,
                    life: item.Life,
                    index: index,
                };
                newItem = otherItem;
                break;

            case ItemSlot.Power:
                const powerItem: PowerItem = {
                    slot: ItemSlot.Power,
                    category: category,
                    coverage: coverage,
                    energyGeneration: parseIntOrUndefined(item["Energy Generation"]!),
                    energyStorage: parseIntOrUndefined(item["Energy Storage"]!),
                    hackable: hackable,
                    heatGeneration: parseIntOrUndefined(item["Heat Generation"]!),
                    integrity: integrity,
                    mass: mass!,
                    name: item.Name,
                    noPrefixName: noPrefixName,
                    rating: rating,
                    ratingString: ratingString,
                    size: size,
                    type: item.Type,
                    description: item.Description,
                    categories: itemCategories,
                    fabrication: fabrication,
                    powerStability: item["Power Stability"] == null ?
                        undefined :
                        parseIntOrUndefined(item["Power Stability"].slice(0, -1)),
                    index: index,
                };
                newItem = powerItem;
                break;

            case ItemSlot.Propulsion:
                const propItem: PropulsionItem = {
                    slot: ItemSlot.Propulsion,
                    category: category,
                    coverage: coverage,
                    energyPerMove: parseFloatOrUndefined(item["Energy/Move"]),
                    hackable: hackable,
                    integrity: integrity,
                    name: item.Name,
                    mass: mass!,
                    noPrefixName: noPrefixName,
                    penalty: parseInt(item.Penalty!),
                    rating: rating,
                    ratingString: ratingString,
                    size: size,
                    support: parseInt(item.Support!),
                    timePerMove: parseInt(item["Time/Move"]!),
                    type: item.Type,
                    fabrication: fabrication,
                    burnout: item.Burnout,
                    description: item.Description,
                    categories: itemCategories,
                    effect: item.Effect,
                    drag: item.Drag,
                    energyUpkeep: parseFloatOrUndefined(item["Energy Upkeep"]),
                    heatGeneration: parseIntOrUndefined(item["Heat Generation"]),
                    heatPerMove: parseIntOrUndefined(item["Heat/Move"]),
                    matterUpkeep: parseIntOrUndefined(item["Matter Upkeep"]),
                    modPerExtra: parseIntOrUndefined(item["Mod/Extra"]),
                    siege: item.Siege,
                    index: index,
                };
                newItem = propItem;
                break;

            case ItemSlot.Utility:
                const utilItem: UtilityItem = {
                    slot: ItemSlot.Utility,
                    category: category,
                    coverage: coverage,
                    hackable: hackable,
                    integrity: integrity,
                    name: item.Name,
                    noPrefixName: noPrefixName,
                    rating: rating,
                    ratingString: ratingString,
                    size: size,
                    type: item.Type,
                    fabrication: fabrication,
                    description: item.Description,
                    effect: item.Effect,
                    categories: itemCategories,
                    energyUpkeep: parseIntOrUndefined(item["Energy Upkeep"]),
                    heatGeneration: parseIntOrUndefined(item["Heat Generation"]),
                    matterUpkeep: parseIntOrUndefined(item["Matter Upkeep"]),
                    mass: parseIntOrUndefined(item.Mass!) ?? 0,
                    specialTrait: item["Special Trait"],
                    index: index,
                };
                newItem = utilItem;
                break;

            case ItemSlot.Weapon:
                const weaponItem: WeaponItem = {
                    slot: ItemSlot.Weapon,
                    category: category,
                    coverage: coverage,
                    hackable: hackable,
                    integrity: integrity,
                    name: item.Name,
                    noPrefixName: noPrefixName,
                    rating: rating,
                    ratingString: ratingString,
                    size: size,
                    type: item.Type,
                    fabrication: fabrication,
                    description: item.Description,
                    effect: item.Effect,
                    categories: itemCategories,
                    mass: parseIntOrUndefined(item.Mass!) ?? 0,
                    specialTrait: item["Special Trait"],
                    critical: parseIntOrUndefined(item.Critical!),
                    delay: parseIntOrUndefined(item.Delay!),
                    explosionHeatTransfer: item["Explosion Heat Transfer"],
                    explosionType: item["Explosion Type"],
                    penetration: item.Penetration,
                    projectileCount: parseIntOrUndefined(item["Projectile Count"]!) ?? 1,
                    range: parseInt(item.Range!),
                    shotEnergy: parseIntOrUndefined(item["Shot Energy"]),
                    shotHeat: parseIntOrUndefined(item["Shot Heat"]),
                    targeting: parseIntOrUndefined(item.Targeting),
                    damage: item.Damage,
                    damageType: item["Damage Type"],
                    disruption: parseIntOrUndefined(item.Disruption),
                    explosionDamage: item["Explosion Damage"],
                    explosionDisruption: parseIntOrUndefined(item["Explosion Disruption"]),
                    explosionRadius: parseIntOrUndefined(item["Explosion Radius"]),
                    explosionSalvage: item["Explosion Salvage"],
                    explosionSpectrum: item["Explosion Spectrum"],
                    falloff: item.Falloff,
                    heatTransfer: item["Heat Transfer"],
                    life: item.Life,
                    overloadStability: item["Overload Stability"] == null ?
                        undefined :
                        parseIntOrUndefined(item["Overload Stability"].slice(0, -1)),
                    recoil: parseIntOrUndefined(item.Recoil!),
                    salvage: parseIntOrUndefined(item.Salvage),
                    shotMatter: parseIntOrUndefined(item["Shot Matter"]),
                    spectrum: item.Spectrum,
                    waypoints: item.Waypoints,
                    arc: undefined, // Export bug, arc is never included
                    index: index,
                };
                newItem = weaponItem;
                break;
        }

        itemData[itemName] = newItem;
    });

    if (bots !== undefined) {
        // Create bots
        Object.keys(bots).forEach(botName => {
            if (botName === "default") {
                // Not sure why this "default" pops up but it messes things up
                // Maybe an artifact of being imported as a JSON file
                return;
            }

            function sumItemCoverage(sum: number, data: string | ItemOption[]) {
                if (typeof (data) === "string") {
                    // Item name, just parse coverage
                    return getItem(data).coverage! + sum;
                }
                else {
                    // Option, return largest sum of items
                    let largest = 0;
                    data.forEach(optionData => {
                        if (optionData.name === "None") {
                            return;
                        }

                        const number = optionData.number ?? 1;
                        const item = getItem(optionData.name);
                        const optionCoverage = item.coverage! * number;
                        largest = Math.max(largest, optionCoverage);
                    });

                    return largest + sum;
                }
            }
            const bot = (bots as any as { [key: string]: JsonBot })[botName];
            const itemCoverage = bot.armament.reduce(sumItemCoverage, 0) + bot.components.reduce(sumItemCoverage, 0);

            let roughCoreCoverage = (100.0 / (100.0 - bot.coreExposure) * itemCoverage) - itemCoverage;
            if (isNaN(roughCoreCoverage)) {
                roughCoreCoverage = 1;
            }
            const estimatedCoreCoverage = ceilToMultiple(roughCoreCoverage, 10);
            const totalCoverage = estimatedCoreCoverage + itemCoverage;

            function addPartData(data: string | ItemOption[], partData: BotPart[], partOptionData: BotPart[][]) {
                if (typeof (data) === "string") {
                    const itemName = data;
                    // Item name, add to part data
                    let result = partData.find(p => p.name === data);

                    if (result === undefined) {
                        const item = getItem(itemName);
                        partData.push({
                            name: itemName,
                            number: 1,
                            coverage: Math.floor(100.0 * item.coverage! / totalCoverage),
                            integrity: item.integrity,
                        });
                    }
                    else {
                        result.number += 1;
                    }
                }
                else {
                    // Option, add all options
                    const options: BotPart[] = [];
                    data.forEach(optionData => {
                        const itemName = optionData.name;

                        let coverage: number = 0;
                        const item = getItem(itemName);

                        if (itemName !== "None") {
                            coverage = Math.floor(100.0 * item.coverage! / totalCoverage);
                        }

                        options.push({
                            name: itemName,
                            number: optionData.number ?? 1,
                            coverage: coverage,
                            integrity: item.integrity,
                        });
                    });
                    partOptionData.push(options);
                }
            }

            // Add armament and component data
            const armamentData: BotPart[] = [];
            const armamentOptionData: BotPart[][] = [];
            bot.armament.forEach(data => addPartData(data, armamentData, armamentOptionData));

            const componentData: BotPart[] = [];
            const componentOptionData: BotPart[][] = [];
            bot.components.forEach(data => addPartData(data, componentData, componentOptionData));

            botData[botName] = {
                armament: bot.armament,
                armamentData: armamentData,
                armamentOptionData: armamentOptionData,
                categories: bot.categories,
                class: bot.class,
                componentData: componentData,
                componentOptionData: componentOptionData,
                components: bot.components,
                coreCoverage: estimatedCoreCoverage,
                coreExposure: bot.coreExposure,
                coreIntegrity: bot.coreIntegrity,
                description: bot.description,
                immunities: bot.immunities ?? [],
                movement: bot.movement,
                name: botName,
                rating: bot.rating,
                resistances: bot.resistances,
                salvagePotential: bot.salvagePotential,
                size: bot.size,
                totalCoverage: totalCoverage,
                traits: bot.traits ?? [],
                value: bot.value,
                visualRange: bot.visualRange,
            };
        });
    }
}

// Parses the string into a number or null if invalid
function parseFloatOrUndefined(value: string | undefined): number | undefined {
    const int = parseFloat(value ?? "");

    if (isNaN(int)) {
        return undefined;
    }

    return int;
}

// Parses the string into a number or null if invalid
function parseIntOrUndefined(value: string | undefined): number | undefined {
    const int = parseInt(value ?? "");

    if (isNaN(int)) {
        return undefined;
    }

    return int;
}

// Gets a random integer between the min and max values (inclusive)
export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Gets the stored spoilers state
export function setSpoilersState(state: string) {
    window.localStorage.setItem("spoilers", state);
}

// Returns the value if it's not undefined, otherwise return defaultVal
export function valueOrDefault(val: any, defaultVal: any) {
    if (val === undefined) {
        return defaultVal;
    }

    return val;
}