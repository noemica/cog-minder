import * as bots from "../json/bots.json";
import * as items from "../json/items.json";
import { Bot } from "./botTypes";
import { botData, createBotDataContent, getBot, initData, leetSpeakMatchTransform, nameToId } from "./common";
import {
    getSpoilersState,
    getSelectedButtonId,
    resetButtonGroup,
    enableBotInfoItemPopovers,
    createHeader,
    registerDisableAutocomplete,
    setSpoilersState,
} from "./commonJquery";

import * as jQuery from "jquery";
import "popper.js";
import "bootstrap";
import "tablesorter";

const jq = jQuery.noConflict();
jq(function ($) {
    // Enum representing the selected viewing mode
    type ViewMode = "Simple" | "Spreadsheet";

    // Map of bot names to bot elements
    const botElements = {};
    const spreadsheetBotElements = {};

    // Faction HTML ids to JSON category names
    const factionIdToCategoryName = {
        faction0b10: "0b10",
        factionArchitect: "Architect",
        factionDerelict: "Derelict",
        factionExile: "Exiles",
        factionWarlord: "Warlord",
        factionZionite: "Zionite",
    };

    // Categories to show for spreadsheet view
    type botCategory = {
        name: string;
        propertyName?: string;
        propertyNames?: string[];
    };
    const batCategoryLookup: { [key: string]: botCategory[] } = {
        Overview: [
            { name: "Name" },
            { name: "Class" },
            { name: "Size" },
            { name: "Profile" },
            { name: "Rating" },
            { name: "Tier" },
            { name: "Threat" },
            { name: "Value" },
            { name: "Visual Range", propertyName: "visualRange" },
            { name: "Memory" },
            { name: "Spot %", propertyName: "spotPercent" },
            { name: "Movement" },
            { name: "Core Integrity", propertyName: "coreIntegrity" },
            { name: "Core Exposure", propertyName: "coreExposure" },
            { name: "Salvage Potential", propertyName: "salvagePotential" },
        ],
        Parts: [
            { name: "Armament", propertyName: "armamentString" },
            { name: "Components", propertyName: "componentsString" },
        ],
        Resistances: [
            { name: "Electromagnetic", propertyNames: ["resistances", "Electromagnetic"] },
            { name: "Explosive", propertyNames: ["resistances", "Explosive"] },
            { name: "Impact", propertyNames: ["resistances", "Impact"] },
            { name: "Kinetic", propertyNames: ["resistances", "Kinetic"] },
            { name: "Piercing", propertyNames: ["resistances", "Piercing"] },
            { name: "Slashing", propertyNames: ["resistances", "Slashing"] },
            { name: "Thermal", propertyNames: ["resistances", "Thermal"] },
        ],
        Other: [
            { name: "Immunities", propertyName: "immunitiesString" },
            { name: "Traits", propertyName: "traitsString" },
        ],
    };

    // Spoiler faction HTML ids
    const spoilerFactionIds = ["factionWarlord", "factionZionite"];
    const redactedFactionIds = ["factionArchitect"];

    $(() => init());

    // Creates the bot buttons and adds them to the grid
    function createBots() {
        const botsGrid = $("#botsGrid");
        const botNames = sortBotNames(Object.keys(botData));
        botNames.forEach((botName) => {
            // Creates button that will toggle a popover when pressed displaying
            // various stats and items
            const bot = botData[botName];
            const botId = nameToId(botName);
            const element = $(
                `<button
                    id="${botId}"
                    class="item btn"
                    data-html=true
                    data-content='${createBotDataContent(bot)}'
                    data-toggle="popover">
                    ${botName}
                 </button>`,
            );

            botElements[botName] = element;
            botsGrid.append(element[0]);
        });

        const popoverSelector = $('#botsGrid > [data-toggle="popover"]');
        (popoverSelector as any).popover();
        enableBotInfoItemPopovers(popoverSelector);
    }

    // Creates elements for all spreadsheet bots
    function createSpreadsheetBots() {
        const table = $("#spreadsheetBotsTable");
        const lookup = batCategoryLookup;
        const tableHeader = $("<thead></thead>");
        const tableHeaderRow = $("<tr></tr>");

        // The first header row contains the category groupings
        tableHeader.append(tableHeaderRow[0]);
        table.append(tableHeader[0]);
        Object.keys(lookup).forEach((categoryName) => {
            tableHeaderRow.append(`<th colspan=${lookup[categoryName].length}>${categoryName}</th>`);
        });

        // The second header row contains all the category names
        const nameRow = $("<tr></tr>");
        tableHeader.append(nameRow[0]);
        Object.keys(lookup).forEach((categoryName) => {
            lookup[categoryName].forEach((category) => {
                const textSorter = category.name === "Name";
                nameRow.append(`<th ${textSorter ? 'class="sorter-text"' : ""}>${category.name}</th>`);
            });
        });

        // Then create the body
        const tableBody = $("<tbody></tbody>");
        table.append(tableBody[0]);

        // Subsequent rows contain info about each bot
        const botNames = sortBotNames(Object.keys(botData));
        botNames.forEach((botName) => {
            const item = botData[botName];
            const row = $("<tr></tr>");

            Object.keys(lookup).forEach((categoryName) => {
                const categoryList = lookup[categoryName];
                categoryList.forEach((category) => {
                    let value: any = undefined;
                    if (category.propertyName !== undefined) {
                        // If explicit property name given then use that
                        value = item[category.propertyName];
                    } else if (category.propertyNames !== undefined) {
                        // If multiple names then use them in sequence
                        value = item[category.propertyNames[0]];
                        for (let i = 1; i < category.propertyNames.length; i++) {
                            if (value !== undefined) {
                                value = value[category.propertyNames[i]];
                            }
                        }
                    } else {
                        // No property name, default to the category name lowercase'd
                        value = item[category.name.toLowerCase()];
                    }

                    const cellValue = value === undefined ? "" : value.toString();
                    row.append(`<td>${cellValue}</td>`);
                });
            });

            spreadsheetBotElements[botName] = row;
            table.append(row[0]);
        });

        table.tablesorter({
            selectorHeaders: "> thead > tr:nth-child(2) > th",
            textSorter: function (a, b) {
                return a.localeCompare(b);
            },
        });
        table.find(".tablesorter-headerAsc").trigger("sort");
        table.find(".tablesorter-headerDesc").trigger("sort");
    }

    // Gets a filter function combining all current filters
    function getBotFilter() {
        const filters: ((bot: Bot) => boolean)[] = [];

        // Spoilers filter
        const spoilersState = getSpoilersState();
        if (spoilersState === "None") {
            filters.push((bot) => !bot.categories.some((c) => c === "Spoilers" || c === "Redacted"));
        } else if (spoilersState === "Spoilers") {
            filters.push((bot) => !bot.categories.some((c) => c === "Redacted"));
        }

        // Name filter
        const nameValue = ($("#name").val() as string).toLowerCase();
        if (nameValue.length > 1) {
            // Only add a leetspeak convert if > 1 letter to reduce chance of
            // false positives on the translation
            // 2 min works well as it will catch somebody typing in the first half
            // of a bot name, like BR for 8R-AWN
            filters.push((bot) => {
                const lowerName = bot.name.toLowerCase();
                return leetSpeakMatchTransform(lowerName).includes(nameValue) || lowerName.includes(nameValue);
            });
        } else if (nameValue.length > 0) {
            filters.push((bot) => bot.name.toLowerCase().includes(nameValue));
        }

        // Class filter
        const classValue = ($("#class").val() as string).toLowerCase();
        if (classValue.length > 0) {
            filters.push((bot) => bot.class.toLowerCase().includes(classValue));
        }

        // Part filter
        const partValue = ($("#part").val() as string).toLowerCase();
        if (partValue.length > 0) {
            filters.push((bot) => {
                if (bot.armamentData.map((data) => data.name).some((name) => name.toLowerCase().includes(partValue))) {
                    return true;
                }

                if (bot.componentData.map((data) => data.name).some((name) => name.toLowerCase().includes(partValue))) {
                    return true;
                }

                for (let i = 0; i < bot.armamentOptionData.length; i++) {
                    const data = bot.armamentOptionData[i];
                    if (data.map((data) => data.name).some((name) => name.toLowerCase().includes(partValue))) {
                        return true;
                    }
                }

                for (let i = 0; i < bot.componentOptionData.length; i++) {
                    const data = bot.componentOptionData[i];
                    if (data.map((data) => data.name).some((name) => name.toLowerCase().includes(partValue))) {
                        return true;
                    }
                }

                return false;
            });
        }

        // Faction filter
        const factionId = getSelectedButtonId($("#factionContainer"));
        if (factionId in factionIdToCategoryName) {
            const categoryName = factionIdToCategoryName[factionId];
            filters.push((bot) => bot.categories.includes(categoryName));
        }

        // Create a function that checks all filters
        return (bot: Bot) => {
            return filters.every((func) => func(bot));
        };
    }

    // Gets the active view mode
    function getViewMode(): ViewMode {
        const modeId = getSelectedButtonId($("#modeContainer"));

        if (modeId === "modeSpreadsheet") {
            return "Spreadsheet";
        }

        return "Simple";
    }

    // Initialize the page state
    async function init() {
        await initData(items as any, bots as any);

        createBots();
        createHeader("Bots", $("#headerContainer"));
        // Reinstate for beta 12
        // $("#beta11Checkbox").prop("checked", getB11State());
        resetButtonGroup($("#modeContainer"));
        registerDisableAutocomplete($(document));

        // Set initial state
        updateFactionVisibility();
        resetFilters();
        createSpreadsheetBots();

        // Register handlers
        $("#spoilersDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilersState(state);
            ($("#spoilersDropdown > button") as any).tooltip("hide");
            updateFactionVisibility();
            updateBots();
        });
        $("#name").on("input", updateBots);
        $("#class").on("input", updateBots);
        $("#part").on("input", updateBots);
        $("#modeContainer > label > input").on("change", (e) => {
            // Tooltips on buttons need to be explicitly hidden on press
            ($(e.target).parent() as any).tooltip("hide");
            updateBots();
        });
        $("#reset").on("click", () => {
            ($("#reset") as any).tooltip("hide");
            resetFilters();
        });
        $("#factionContainer > label > input").on("change", updateBots);

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

        // Reinstate for beta 12
        // $("#beta11Checkbox").on("change", () => {
        //     const isB11 = $("#beta11Checkbox").prop("checked");
        //     setB11State(isB11);
        //     const newItems = (isB11 ? itemsB11 : items) as any;
        //     const newBots = (isB11 ? botsB11 : bots) as any;

        //     initData(newItems, newBots);

        //     ($('#botsGrid > [data-toggle="popover"]') as any).popover("dispose");
        //     $("#botsGrid").empty();

        //     // Initialize page state
        //     createBots();
        //     updateFactionVisibility();
        //     resetFilters();

        //     ($("#beta11Checkbox").parent() as any).tooltip("hide");
        // });

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Resets all filters
    function resetFilters() {
        // Reset text inputs
        $("#name").val("");
        $("#class").val("");
        $("#part").val("");

        // Reset buttons
        resetButtonGroup($("#factionContainer"));

        // Update visible bots
        updateBots();
    }

    // Sorts bot names
    function sortBotNames(botNames: string[]) {
        botNames.sort((a, b) => {
            return a.localeCompare(b);
        });

        return botNames;
    }

    // Clears all existing bots and adds new ones based on the filters
    function updateBots() {
        // Hide any existing popovers
        ($('[data-toggle="popover"]') as any).popover("hide");

        // Get the names of all non-filtered bots
        const botFilter = getBotFilter();
        const botNames: string[] = [];
        Object.keys(botData).forEach((botName) => {
            const bot = getBot(botName);

            if (botFilter(bot)) {
                botNames.push(bot.name);
            }
        });

        const viewMode = getViewMode();

        if (viewMode == "Spreadsheet") {
            $("#botsGrid").addClass("not-visible");
            $("#spreadsheetBotsTable").removeClass("not-visible");

            // Update visibility of all bots
            Object.keys(spreadsheetBotElements).forEach((botName) => {
                const botElement = spreadsheetBotElements[botName];
                botElement.addClass("not-visible");
            });

            botNames.forEach((botName) => {
                const element = spreadsheetBotElements[botName];
                element.removeClass("not-visible");
            });
        } else if (viewMode == "Simple") {
            $("#botsGrid").removeClass("not-visible");
            $("#spreadsheetBotsTable").addClass("not-visible");

            // Update visibility and order of all bots
            $("#botsGrid > button").addClass("not-visible");

            botNames.forEach((botName) => {
                const element = botElements[botName];
                element.removeClass("not-visible");
            });
        }
    }

    // Updates faction visibility based on the spoiler state
    function updateFactionVisibility() {
        const state = getSpoilersState();
        const showSpoilers = state === "Spoilers";
        const showRedacted = state === "Redacted";

        if (showSpoilers) {
            spoilerFactionIds.forEach((faction) => $(`#${faction}`).removeClass("not-visible"));
            redactedFactionIds.forEach((faction) => $(`#${faction}`).addClass("not-visible"));
        } else if (showRedacted) {
            spoilerFactionIds.forEach((faction) => $(`#${faction}`).removeClass("not-visible"));
            redactedFactionIds.forEach((faction) => $(`#${faction}`).removeClass("not-visible"));
        } else {
            spoilerFactionIds.forEach((faction) => $(`#${faction}`).addClass("not-visible"));
            redactedFactionIds.forEach((faction) => $(`#${faction}`).addClass("not-visible"));
        }
    }
});
