import {
    botData,
    createBotDataContent,
    getBot,
    getSpoilersState,
    initData,
    nameToId,
    resetButtonGroup,
    setSpoilersState,
} from "./common.js";

const jq = jQuery.noConflict();
jq(function ($) {
    // Map of bot names to bot elements, created at page init
    const botElements = {};

    // Faction HTML ids to JSON category names
    const factionIdToCategoryName = {
        "faction0b10": "0b10",
        "factionArchitect": "Architect",
        "factionDerelict": "Derelict",
        "factionExile": "Exiles",
        "factionWarlord": "Warlord",
        "factionZionite": "Zionite",
    };

    // Spoiler faction HTML ids
    const spoilerFactionIds = [
        "factionWarlord",
        "factionZionite",
    ];

    const redactedFactionIds = [
        "factionArchitect"
    ];

    $(document).ready(() => {
        init();
    });

    // Creates the bot buttons and adds them to the grid
    function createBots() {
        const bots = Object.values(botData);
        const botsGrid = $("#botsGrid");
        bots.forEach(bot => {
            const botName = bot["Name"];
            const botId = nameToId(botName);
            const element = $(
                `<button
                    id="${botId}"
                    class="item btn"
                    data-html=true
                    data-content='${createBotDataContent(bot)}'
                    data-toggle="popover">
                    ${botName}
                 </button>`);

            botElements[botName] = element;
            botsGrid.append(element);
        });

        $('#botsGrid > [data-toggle="popover"]').popover();
    }

    // Gets a filter function combining all current filters
    function getBotFilter() {
        const filters = [];

        // Spoilers filter
        const spoilersState = getSpoilersState();
        if (spoilersState === "None") {
            filters.push(bot =>
                !bot["Categories"].some(c => c === "Spoilers" || c === "Redacted")
            );
        }
        else if (spoilersState === "Spoilers") {
            filters.push(bot =>
                !bot["Categories"].some(c => c === "Redacted")
            );
        }

        // Name filter
        const nameValue = $("#name").val().toLowerCase();
        if (nameValue.length > 0) {
            filters.push(bot => bot["Name"].toLowerCase().includes(nameValue));
        }

        // Class filter
        const classValue = $("#class").val().toLowerCase();
        if (classValue.length > 0) {
            filters.push(bot => bot["Class"].toLowerCase().includes(classValue));
        }

        // Faction filter
        const factionId = $("#factionContainer > label.active").attr("id");
        if (factionId in factionIdToCategoryName) {
            const categoryName = factionIdToCategoryName[factionId];
            filters.push(bot => bot["Categories"].includes(categoryName));
        }

        // Create a function that checks all filters
        return bot => {
            return filters.every(func => func(bot));
        }
    }

    // Initialize the page state
    async function init() {
        await initData();

        createBots();

        // Load spoilers saved state
        $("#spoilers").text(getSpoilersState());

        // Set initial state
        updateFactionVisibility();
        resetFilters();

        // Register handlers
        $("#spoilersDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilersState(state);
            $("#spoilersDropdown > button").tooltip("hide");
            updateFactionVisibility();
            updateBots();
        });
        $("#name").on("input", updateBots);
        $("#class").on("input", updateBots);
        $("#reset").click(() => {
            $("#reset").tooltip("hide");
            resetFilters();
        });
        $("#factionContainer > label > input").on("click", updateBots);

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            if ($(e.target).parents(".popover").length === 0 && $(".popover").length >= 1) {
                $('[data-toggle="popover"]').not(e.target).popover("hide");
            }
        });

        // Enable tooltips
        $('[data-toggle="tooltip"]').tooltip();
    }

    // Resets all filters
    function resetFilters() {
        // Reset text inputs
        $("#name").val("");
        $("#class").val("");

        // Reset buttons
        resetButtonGroup($("#factionContainer"));

        // Update visible bots
        updateBots();
    }

    // Sorts bot names
    function sortBotNames(botNames) {
        botNames.sort((a, b) => {
            let aValue = typeof (a) === "string" ? a : "";
            let bValue = typeof (b) === "string" ? b : "";

            return aValue.localeCompare(bValue);
        });

        return botNames;
    }

    // Clears all existing bots and adds new ones based on the filters
    function updateBots() {
        // Hide any existing popovers
        $('[data-toggle="popover"]').popover("hide");

        // Get the names of all non-filtered bots
        const botFilter = getBotFilter();
        let bots = [];
        Object.keys(botData).forEach(botName => {
            const bot = getBot(botName);

            if (botFilter(bot)) {
                bots.push(bot["Name"]);
            }
        });

        // Sort bot names for display
        bots = sortBotNames(bots);

        // Update visibility and order of all bots
        $("#botsGrid > button").addClass("not-visible");

        let precedingElement = null;

        bots.forEach(botName => {
            const element = botElements[botName];
            element.removeClass("not-visible");

            if (precedingElement == null) {
                $("#botGrid").append(element);
            }
            else {
                element.insertAfter(precedingElement);
            }

            precedingElement = element;
        });
    }

    // Updates faction visibility based on the spoiler state
    function updateFactionVisibility() {
        const state = getSpoilersState();
        const showSpoilers = state === "Spoilers";
        const showRedacted = state === "Redacted";

        if (showSpoilers) {
            spoilerFactionIds.forEach(faction => $(`#${faction}`).removeClass("not-visible"));
            redactedFactionIds.forEach(faction => $(`#${faction}`).addClass("not-visible"));
        }
        else if (showRedacted) {
            spoilerFactionIds.forEach(faction => $(`#${faction}`).removeClass("not-visible"));
            redactedFactionIds.forEach(faction => $(`#${faction}`).removeClass("not-visible"));
        }
        else {
            spoilerFactionIds.forEach(faction => $(`#${faction}`).addClass("not-visible"));
            redactedFactionIds.forEach(faction => $(`#${faction}`).addClass("not-visible"));
        }
    }
});