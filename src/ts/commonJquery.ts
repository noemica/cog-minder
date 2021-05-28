// Common Jquery related code

import {
    createItemDataContent,
    getItem,
    itemData,
    Spoiler,
    valueOrDefault
} from "./common";

import * as jQuery from "jquery";
import { PageType, pageTypes } from "./commonTypes";
const $ = jQuery.noConflict();

type HeaderInfo = {
    name: string;
    pageName: string;
    spoilers: boolean;
    beta11Check: boolean;
}

const headerLookup: Record<PageType, HeaderInfo> = {
    About: { name: "About", pageName: "about.html", spoilers: false, beta11Check: false },
    Bots: { name: "Bots", pageName: "bots.html", spoilers: true, beta11Check: false },
    Hacks: { name: "Hacks", pageName: "hacks.html", spoilers: true, beta11Check: false },
    Parts: { name: "Parts", pageName: "parts.html", spoilers: true, beta11Check: true },
    Simulator: { name: "Simulator", pageName: "simulator.html", spoilers: true, beta11Check: false },
};

// Creates the header for a given page
export function createHeader(page: PageType, headerContainer: JQuery<HTMLElement>) {
    const info = headerLookup[page];

    const buttonsHtml = pageTypes.map(pageType => {
        const info = headerLookup[pageType];

        if (page === pageType) {
            return `<a href="${info.pageName}" class="btn btn-current-page">${info.name}</a>`;
        }
        else {
            return `<a href="${info.pageName}" class="btn">${info.name}</a>`;
        }
    }).join("");

    let spoilerHtml: string;
    if (info.spoilers) {
        spoilerHtml = `
<div class="d-flex align-self-center justify-content-center">
    <div class="spoilers-group btn-group">
        <div class="input-group-prepend" data-toggle="tooltip" title="What spoiler content to show.">
            <span class="input-group-text">Spoilers</span>
        </div>
        <button id="spoilers" class="btn btn-flex dropdown-toggle" type="button" data-toggle="dropdown">
            None
        </button>
        <div id="spoilersDropdown" class="dropdown-menu">
            <button class="dropdown-item" data-toggle="tooltip"
                title="No spoilers: Factory or higher depth branch content is hidden.">None</button>
            <button class="dropdown-item" data-toggle="tooltip"
                title="Moderate spoilers: Normal Factory and Research branch content is shown.">Spoilers</button>
            <button class="dropdown-item" data-toggle="tooltip"
                title="Full spoilers: All game content is shown.">Redacted</button>
        </div>
    </div>`;

        if (info.beta11Check) {
            spoilerHtml += `
    <label class="align-self-center ml-2" style="margin-bottom: 0;" data-toggle="tooltip"
        title="Enable or disable experimental Beta 11 part changes.">
        <input id="beta11Checkbox" type="checkbox">Beta 11</input>
    </label>
        `;
        }

        spoilerHtml += `
</div>`;
    }
    else {
        spoilerHtml = "<div></div>";
    }

    headerContainer.append(`
<div class="title-grid mt-2">
    <div class="header d-flex align-items-center justify-content-center">
        <span class="display-5">Cog-Minder</span>
    </div>
    <h1 class="display-4 text-center title">${info.name}</h1>
    ${spoilerHtml}
</div>
<div class="mb-2 menu-buttons-grid">
    ${buttonsHtml}
</div>
    `);

    if (info.spoilers) {
        // Load spoilers saved state
        $("#spoilers").text(getSpoilersState());
    }
}

const nameRegex = /\[([\w. '"\-/]*) \(\d/;
const optionNameRegex = /([\w. '"\-/]*) \(\d/;
// Enables nested bot info popovers given a selector to the root bot popover
export function enableBotInfoItemPopovers(selector: JQuery<HTMLElement>) {
    selector.on("shown.bs.popover", (e) => {
        // Set up popovers for items on bots
        const body = $(`#${$(e.target).attr("aria-describedby")}`).children(".popover-body");
        const items = body.find(".popover-part");
        items.each((_, element) => {
            const selector = $(element);
            const result = nameRegex.exec(selector.text());
            if (result === null || !(result[1] in itemData)) {
                // Not a valid item
                return;
            }

            // Set up popover attributes
            const weapon = getItem(result[1]);
            selector.data("html", true);
            selector.data("content", createItemDataContent(weapon));
            selector.data("toggle", "popover");
            selector.addClass("bot-popover-item");
            (selector as any).popover();

            // Show/hide surrounding brackets to indicate selection
            selector.on("mouseenter", () => {
                selector.children("span").removeClass("bot-popover-item-bracket-invisible");
            });
            selector.on("mouseleave", () => {
                selector.children("span").addClass("bot-popover-item-bracket-invisible");
            });

            selector.data("toggle", "popover");
        });

        const optionItems = body.find(".popover-option").parent();
        optionItems.each((_, element) => {
            const selector = $(element);
            const result = optionNameRegex.exec(selector.find("span:nth-child(3)").text());
            if (result === null || !(result[1] in itemData)) {
                // Not a valid item
                return;
            }

            // Set up popover attributes
            const weapon = getItem(result[1]);
            selector.data("html", true);
            selector.data("content", createItemDataContent(weapon));
            selector.data("toggle", "popover");
            selector.addClass("bot-popover-item");
            (selector as any).popover();

            // Show/hide surrounding brackets to indicate selection
            selector.on("mouseenter", () => {
                selector.children(".bot-popover-item-bracket").removeClass("bot-popover-item-bracket-invisible");
            });
            selector.on("mouseleave", () => {
                selector.children(".bot-popover-item-bracket").addClass("bot-popover-item-bracket-invisible");
            });

            selector.data("toggle", "popover");
        });
    });

    selector.on("hide.bs.popover", (e) => {
        // Dispose nested popovers when the base popover is closed
        const body = $(`#${$(e.target).attr("aria-describedby")}`).children(".popover-body");
        const items = body.find(".bot-popover-item");
        (items as any).popover("dispose");
    });
}

// Gets the ID of the selected button in a button group
export function getSelectedButtonId(selector: JQuery<HTMLElement>) {
    return selector.children(".active").attr("id") as string;
}

// Gets the stored spoilers state
export function getSpoilersState(): Spoiler {
    let value = valueOrDefault(window.localStorage.getItem("spoilers"), "None");
    if (typeof (value) != "string" || value != "None" && value != "Spoilers" && value != "Redacted") {
        value = "None";
    }

    return value;
}

// Clears a button group's state and sets the first item to be active
export function resetButtonGroup(group: JQuery<HTMLElement>) {
    group.children().removeClass("active");

    group.children("label:first-of-type").addClass("active");
}

export function refreshSelectpicker(selector: JQuery<HTMLElement>) {
    selector.selectpicker("refresh");

    // Minor hack, the btn-light class is auto-added to dropdowns with search 
    // but it doesn't really fit with everything else
    selector.next().removeClass("btn-light");
}