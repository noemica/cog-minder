import {
    botData,
    categoryData,
    createBotDataContent,
    createItemDataContent,
    getItemCategories,
    getSpoilersState,
    initData,
    itemData,
    nameToId,
    noPrefixName,
    setSpoilersState,
} from "./common.js";

const jq = jQuery.noConflict();
jq(function ($) {
    // Map of bot names to bot elements, created at page init
    const botElements = {};

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

    // Initialize the page state
    async function init() {
        await initData();

        createBots();

        // Load spoilers saved state
        $("#spoilers").attr("checked", getSpoilersState());

        // Register handlers
        $("#spoilers").on("change", () => {
            // Hide tooltip, update saved state, categories, and items
            // $("#spoilersPopupContainer").tooltip("hide");
            setSpoilersState($("#spoilers").is(":checked"));
            // updateCategoryVisibility();
            // updateItems();
        });

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            if ($(e.target).parents(".popover").length === 0 && $(".popover").length >= 1) {
                $('[data-toggle="popover"]').not(e.target).popover("hide");
            }
        });
    }
});