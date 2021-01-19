// Common Jquery related code

import {
    createItemDataContent,
    getItem,
    itemData,
    valueOrDefault
} from "./common";

import * as jQuery from "jquery";
const $ = jQuery.noConflict();

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
export function getSpoilersState() {
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