import * as wiki from "../json/wiki.json";
import * as items from "../json/items.json";
import * as bots from "../json/bots.json";
import {
    createHeader,
    disableBotInfoInteraction,
    enableBotInfoInteraction,
    getSpoilerState,
    refreshSelectpicker,
    registerDisableAutocomplete,
    setSpoilerState,
    temporarilySetValue,
} from "./commonJquery";
import {
    canShowSpoiler,
    createBotDataContent,
    createItemDataContent,
    createLocationHtml,
    getBot,
    getItem,
    initData,
} from "./common";
import { MapLocation, Spoiler } from "./commonTypes";
import { Bot } from "./botTypes";

import * as jQuery from "jquery";
import "bootstrap";
import "bootstrap-select";
import { Item } from "./itemTypes";
import { createContentHtml } from "./wikiParser";
import { WikiEntry } from "./wikiTypes";

const jq = jQuery.noConflict();
jq(function ($) {
    $(() => init());

    // Map of all page names to entries
    const allEntries: Map<string, WikiEntry> = new Map();

    // Set of all entries shown in the select by default
    // If loading a spoiler-restricted page, this won't contain
    // that page
    const defaultShownEntries: Set<string> = new Set<string>();

    // Has the user edited the current page since copying the text?
    let editedCurrentPage: boolean;

    // Save the last entry for proper disposal when the page changes
    let lastEntry: WikiEntry | undefined;

    // Save when we're showing an edited preview
    let lastEntryIsEdit: boolean;

    // Keep track of whether we have promoted a spoiler-restricted
    // page to the select
    let showingTemporaryOption: boolean;

    // Avoid recursively processing selectpicker changes when
    // we're updating the value
    let skipSelectChange = false;

    // Clears the page content and cleans up any resources
    function clearPageContent() {
        const pageContent = $("#pageContent");

        if (lastEntry?.type === "Bot") {
            // Need to do proper cleanup for bots
            disableBotInfoInteraction(pageContent);
        }

        ($("#pageContent").find(`[data-toggle="popover"]`) as any).popover("dispose");

        pageContent.empty();
    }

    // Initialize the page state
    async function init() {
        createHeader("Wiki", $("#headerContainer"));
        registerDisableAutocomplete($(document));

        await initData(items as any, bots as any);

        initAllEntries();
        tryLoadFromHash(true);
        updatePageSelect();

        // Register handlers
        $("#spoilerDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilerState(state);
            ($("#spoilerDropdown > button") as any).tooltip("hide");

            updatePageSelect();
        });
        $("#pageSelect").on("changed.bs.select", () => {
            if (skipSelectChange) {
                // Avoid double-processing if we just set the select
                return;
            }

            const select = $("#pageSelect");
            const selectedPage = select.selectpicker("val") as any as string;

            if (!selectedPage) {
                // Shouldn't happen, just fall back to setting home if it does
                select.selectpicker("val", "Home");
                return;
            }

            setSelectedPage(selectedPage, false);
        });

        // Register editor buttons
        function insertWrappedText(beforeText: string, afterText: string) {
            const textArea = $("#editTextArea");
            const start = textArea.prop("selectionStart");
            const end = textArea.prop("selectionEnd");
            const initialText = textArea.val() as string;

            const preSplit = initialText.substring(0, start);
            const split = initialText.substring(start, end);
            const postSplit = initialText.substring(end);

            textArea.val(`${preSplit}${beforeText}${split}${afterText}${postSplit}`);
            (textArea.get(0) as any as HTMLTextAreaElement).setSelectionRange(
                start + beforeText.length,
                end + beforeText.length,
            );
            textArea.trigger("focus");
        }
        $("#editBoldTextButton").on("click", () => {
            insertWrappedText("[[B]]", "[[/B]]");
        });
        $("#editItalicizeTextButton").on("click", () => {
            insertWrappedText("[[I]]", "[[/I]]");
        });
        $("#editSpoilerTextButton").on("click", () => {
            insertWrappedText("[[Spoiler:Spoiler]]", "[[/Spoiler]]");
        });
        $("#editRedactedTextButton").on("click", () => {
            insertWrappedText("[[Spoiler:Redacted]]", "[[/Spoiler]]");
        });
        $("#editLinkTextButton").on("click", () => {
            insertWrappedText("[[", "]]");
        });
        $("#editHeader1TextButton").on("click", () => {
            insertWrappedText("[[Header]]", "[[/Header]]");
        });
        $("#editHeader2TextButton").on("click", () => {
            insertWrappedText("[[Header:2]]", "[[/Header]]");
        });
        $("#editImageTextButton").on("click", () => {
            insertWrappedText("[[Image]]", "[[/Image]]");
        });
        $("#editImagesTextButton").on("click", () => {
            insertWrappedText("[[Images]]", "[[/Images]]");
        });
        $("#editUnorderedListTextButton").on("click", () => {
            insertWrappedText("[[List]]", "[[/List]]");
        });
        $("#editOrderedListTextButton").on("click", () => {
            insertWrappedText("[[List:Ordered]]", "[[/List]]");
        });
        $("#editTextArea").on("input", () => {
            editedCurrentPage = true;
        });
        $("#editButton").on("click", () => {
            // Show the editor pane
            $("#editContent").removeClass("not-visible");
            ($("#editButton") as any).tooltip("hide");
        });
        $("#editContent button").on("click", (e) => {
            // Hide tooltips when any of the edit buttons are pressed
            ($(e.target) as any).tooltip("hide");
        });
        $("#closeEditButton").on("click", () => {
            // Hide the edit pane
            $("#editContent").addClass("not-visible");
            if (lastEntry !== undefined) {
                loadSelectedEntry(allEntries.get(lastEntry.name)!);
            }
        });
        $("#previewEditChangesButton").on("click", () => {
            // Previews the changes made for the current page
            const text = $("#editTextArea").val() as string;
            const entry: WikiEntry = {
                alternativeNames: lastEntry!.alternativeNames,
                content: text,
                name: lastEntry!.name,
                spoiler: "None",
                type: lastEntry!.type,
                extraData: lastEntry!.extraData,
            };
            lastEntryIsEdit = true;
            loadSelectedEntry(entry);

            temporarilySetValue($("#previewEditChangesButton"), "Updated", "Preview Changes", 2000, true);
        });
        $("#copyEditTextButton").on("click", () => {
            // Copies the edited text to the clipboard
            editedCurrentPage = false;
            const text = $("#editTextArea").val() as string;
            navigator.clipboard.writeText(text);
            temporarilySetValue($("#copyEditTextButton"), "Copied", "Copy Text", 2000, true);
        });
        $(window).on("hashchange", () => {
            // If the hash changes (pasted URL) then reload
            tryLoadFromHash(false);
        });
        $(window).on("popstate", () => {
            // Try to load the recently popped state if set
            if (history.state !== null) {
                setSelectedPage(history.state, true);
            }
        });

        $(window).on("click", (e) => {
            // If clicking outside of a popover close the current one
            const targetPopover = $(e.target).parents(".popover").length != 0;
            const targetUnderPopoverButton = $(e.target).parents("[data-toggle='popover']").length != 0;

            if (targetPopover) {
                $(e.target).trigger("blur");
                return;
            }

            let target = e.target;
            if (targetUnderPopoverButton) {
                target = $(e.target).parents("[data-toggle='popover']")[0] as any;
            }

            if ($(".popover").length >= 1) {
                ($("[data-toggle='popover']") as any).not(target).popover("hide");
            }
        });

        overrideLinks($("#homeContainer"));

        // These divs are created at runtime so have to do this at init
        $("#pageSelectContainer > div").addClass("page-dropdown");
        $("#pageSelectContainer > div > .dropdown-menu").addClass("page-dropdown-menu");

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Inits the wiki entries from JSON
    function initAllEntries() {
        // Initialize bots
        for (const botEntry of wiki.Bots) {
            const bot = getBot(botEntry.Name);

            allEntries.set(botEntry.Name, {
                alternativeNames: [],
                name: botEntry.Name,
                type: "Bot",
                spoiler: bot.spoiler,
                content: botEntry.Content,
                extraData: bot,
            });
        }

        // Initialize locations
        for (const locationEntry of wiki.Locations) {
            let spoiler: Spoiler = "None";
            if (locationEntry.Spoiler === "Redacted") {
                spoiler = "Redacted";
            } else if (locationEntry.Spoiler === "Spoiler") {
                spoiler = "Spoiler";
            }

            const specialBots = (locationEntry.SpecialBots ?? [])
                .map((botName) => {
                    try {
                        return getBot(botName);
                    } catch {
                        console.log(`Bad bot name ${botName} in ${locationEntry.Name}`);
                        return null;
                    }
                })
                .filter((b) => b !== null) as Bot[];

            const specialItems = (locationEntry.SpecialItems ?? [])
                .map((itemName) => {
                    try {
                        return getItem(itemName);
                    } catch {
                        console.log(`Bad item name ${itemName} in ${locationEntry.Name}`);
                        return null;
                    }
                })
                .filter((i) => i !== null) as Item[];

            const location: MapLocation = {
                branch: locationEntry.Branch ?? false,
                entries: [],
                exits: [],
                imageName: locationEntry.ImageName,
                maxDepth: locationEntry.MaxDepth,
                minDepth: locationEntry.MinDepth,
                name: locationEntry.Name,
                preDepthBranch: locationEntry.PreDepthBranch ?? false,
                spoiler: spoiler,
                specialBots: specialBots,
                specialItems: specialItems,
            };

            const entry: WikiEntry = {
                alternativeNames: locationEntry.AlternateNames ?? [],
                name: locationEntry.Name,
                type: "Location",
                spoiler: spoiler,
                content: locationEntry.Content,
                extraData: location,
            };

            allEntries.set(locationEntry.Name, entry);

            if (locationEntry.AlternateNames !== undefined) {
                for (const alternativeName of locationEntry.AlternateNames) {
                    allEntries.set(alternativeName, entry);
                }
            }
        }

        // Need to do a second pass to connect entry/exit references
        for (const locationEntry of wiki.Locations) {
            const location = allEntries.get(locationEntry.Name)!;

            for (const exit of locationEntry.Exits) {
                const exitEntry = allEntries.get(exit);
                if (exitEntry === undefined) {
                    console.log(`Bad location reference ${exit} in ${locationEntry.Name}`);
                } else {
                    const entryLocation = location.extraData as MapLocation;
                    const exitLocation = exitEntry.extraData as MapLocation;

                    entryLocation.exits.push(exitLocation);
                    exitLocation.entries.push(entryLocation);
                }
            }
        }

        // Initialize parts
        for (const partEntry of wiki.Parts) {
            const part = getItem(partEntry.Name);

            let spoiler: Spoiler = "None";
            if (part.categories.includes("Redacted")) {
                spoiler = "Redacted";
            } else if (part.categories.includes("Spoiler")) {
                spoiler = "Spoiler";
            }

            allEntries.set(partEntry.Name, {
                alternativeNames: [],
                name: partEntry.Name,
                type: "Part",
                spoiler: spoiler,
                content: partEntry.Content,
                extraData: part,
            });
        }

        // Initialize other
        for (const otherEntry of wiki.Other) {
            let spoiler: Spoiler = "None";
            if (otherEntry.Spoiler === "Redacted") {
            } else if (otherEntry.Spoiler === "Spoiler") {
                spoiler = "Spoiler";
            }

            const entry: WikiEntry = {
                alternativeNames: otherEntry.AlternateNames ?? [],
                name: otherEntry.Name,
                type: "Other",
                spoiler: spoiler,
                content: otherEntry.Content,
            };

            allEntries.set(otherEntry.Name, entry);

            if (otherEntry.AlternateNames !== undefined) {
                for (const alternativeName of otherEntry.AlternateNames) {
                    allEntries.set(alternativeName, entry);
                }
            }
        }
    }

    // Updates the page content based on the given entry
    function loadSelectedEntry(entry: WikiEntry) {
        const selectedPage = entry.name;
        const pageContent = $("#pageContent");
        lastEntry = entry;

        clearPageContent();

        function setContent(entry: WikiEntry) {
            switch (entry.type) {
                case "Bot":
                    updateBotContent(entry);
                    break;

                case "Location":
                    updateLocationContent(entry);
                    break;

                case "Other":
                    updateOtherContent(entry);
                    break;

                case "Part":
                    updatePartContent(entry);
                    break;
            }

            ($("#pageContent").find(`[data-toggle="popover"]`) as any).popover();

            // Fix up any links to work properly
            overrideLinks(pageContent);
        }

        if (defaultShownEntries.has(selectedPage)) {
            // If we're showing a page by default then just load it right away
            setContent(entry);
        } else {
            // If we're showing a spoilers page, create a warning page first
            pageContent.append(`
            <div class="d-grid justify-content-center">
                <div class="row">
                    <p>Page blocked by Spoilers setting. Would you like to continue?</p>
                </div>
                <div class="row">
                    <button id="spoilerYesButton" class="btn col mx-2">Yes</button>
                    <button id="spoilerBackButton" class="btn col mx-2">Back</button>
                </div>
            </div>`);

            // Continue on Yes, go back in history if not
            $("#spoilerYesButton").on("click", () => {
                clearPageContent();
                setContent(entry);
            });
            $("#spoilerBackButton").on("click", () => {
                history.back();
            });
        }
    }

    // Must override link behavior with a custom handler since we
    // don't actually have elements with the matching IDs set
    function overrideLinks(selector: JQuery<HTMLElement>) {
        selector.find("a").on("click", (e) => {
            if ($(e.target).attr("src")?.includes("wiki_images")) {
                return;
            }

            e.preventDefault();

            const selectedPage = $(e.target).attr("href")!.substring(1);

            setSelectedPage(selectedPage, true);
        });
    }

    // Parses the Wiki entry content and updates errors
    function parseEntryContent(entry: WikiEntry, allEntries: Map<string, WikiEntry>) {
        const parseResult = createContentHtml(entry, allEntries, getSpoilerState());

        if (parseResult.errors.length > 0) {
            $("#editErrorsParentContainer").removeClass("not-visible");
            $("editErrorsContainer").empty();
            console.log(`Errors while parsing ${entry.name}`);

            for (const error of parseResult.errors) {
                console.log(`Parse error: ${error}`);
                $("#editErrorsContainer").append(`<p>${error}</p>`);
            }
        } else {
            $("#editErrorsParentContainer").addClass("not-visible");
        }

        return $(parseResult.html);
    }

    // Sets the selected page
    function setSelectedPage(selectedPage: string, updateSelect: boolean, init = false) {
        const select = $("#pageSelect");

        // Skip handling any select setting events while we're updating here
        skipSelectChange = true;
        try {
            let needsRefresh = showingTemporaryOption;
            showingTemporaryOption = false;
            let addTemporaryOption = false;

            // If we need to update the history state then do so now
            if (history.state !== selectedPage) {
                if (init) {
                    if (selectedPage === "Home") {
                        history.replaceState("Home", "", "wiki.html");
                    } else {
                        history.replaceState(selectedPage, "", `#${selectedPage}`);
                    }
                } else {
                    if (selectedPage === "Home") {
                        history.pushState("Home", "", "wiki.html");
                    } else {
                        history.pushState(selectedPage, "", `#${selectedPage}`);
                    }
                }
            }

            if (editedCurrentPage && lastEntry?.name !== selectedPage) {
                // Try to prevent accidental edit data loss
                if (
                    !confirm(
                        "You have modified the editor since last copying the text, are you sure you want to change the page and lose any changes made?",
                    )
                ) {
                    select.selectpicker("val", lastEntry!.name);
                    return;
                }

                editedCurrentPage = false;
            }

            if (updateSelect) {
                if (defaultShownEntries.has(selectedPage)) {
                    // Found page, update now
                    select.selectpicker("val", selectedPage);
                    updateContent(selectedPage);
                } else if (allEntries.get(selectedPage)) {
                    // Found page but couldn't set selectpicker, page was filtered out
                    // Temporarily promote page in selectpicker
                    needsRefresh = true;
                    addTemporaryOption = true;
                    updateContent(selectedPage);
                } else {
                    // Page wasn't in select at all, just a bad URL
                    // Default to home page
                    select.selectpicker("val", "Home");
                    updateHomeContent(`Page ${selectedPage} was not found.`);
                }
            } else {
                updateContent(selectedPage);
            }

            if (needsRefresh) {
                // Refresh the selectpicker if the values changed
                if (addTemporaryOption) {
                    updatePageSelect(selectedPage);
                } else {
                    updatePageSelect();
                }
            }
        } finally {
            skipSelectChange = false;
        }
    }

    // Attempts to set the selected page from the current hash
    function tryLoadFromHash(init: boolean) {
        const hash = window.location.hash.substring(1);
        if (hash.length > 0) {
            const selectedPage = decodeURI(hash);
            setSelectedPage(selectedPage, true, init);
        } else {
            history.replaceState("Home", "", "wiki.html");
            setSelectedPage("Home", false);
        }
    }

    // Updates the page content with the specified bot
    function updateBotContent(entry: WikiEntry) {
        const bot = entry.extraData as Bot;
        const pageContent = $("#pageContent");

        // Create HTML elements
        const content = parseEntryContent(entry, allEntries);
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const infoboxContent = $(createBotDataContent(bot, true));

        // Append to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(infoboxContent as any);
        pageContent.append(content as any);

        // Bot parts have popovers, must hook them up here
        enableBotInfoInteraction(pageContent);
    }

    // Updates the page content based on the current selection
    function updateContent(selectedPage: string) {
        const homeContainer = $("#homeContainer");
        const pageContent = $("#pageContent");

        if (selectedPage === "Home") {
            // If we selected the home page then just show the home page div
            updateHomeContent();
            document.title = "Cogmind Wiki";
            $("#editButton").prop("disabled", true);

            return;
        }

        $("#editButton").prop("disabled", false);

        document.title = `${selectedPage} - Cogmind Wiki`;

        // Make sure the right containers are shown/hidden
        homeContainer.addClass("not-visible");
        pageContent.removeClass("not-visible");

        const entry = allEntries.get(selectedPage);
        if (entry === undefined) {
            clearPageContent();
            pageContent.append("Error generating page, this shouldn't happen");
            return;
        } else if (lastEntryIsEdit && lastEntry!.name === selectedPage) {
            // If we're attempting to reload the page (usually for spoilers change)
            // but we're currently displaying an edit preview of a page, maintain
            // the existing editable text area
            return;
        }

        $("#editTextArea").val(entry.content);
        lastEntryIsEdit = false;

        loadSelectedEntry(entry);
    }

    // Sets the home page to be active and updates the home status if set
    function updateHomeContent(statusMessage: string | undefined = undefined) {
        const homeContainer = $("#homeContainer");
        const pageContent = $("#pageContent");
        const homeStatus = $("#homeStatus");

        homeContainer.removeClass("not-visible");
        pageContent.addClass("not-visible");

        if (statusMessage === undefined) {
            homeStatus.addClass("not-visible");
        } else {
            homeStatus.removeClass("not-visible");
            homeStatus.text(statusMessage);
        }
    }

    function updateLocationContent(entry: WikiEntry) {
        const location = entry.extraData as MapLocation;
        const pageContent = $("#pageContent");

        // Create HTML elements
        const content = parseEntryContent(entry, allEntries);
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const infoboxContent = $(createLocationHtml(location, getSpoilerState()));

        // Append to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(infoboxContent as any);
        pageContent.append(content as any);
    }

    function updateOtherContent(entry: WikiEntry) {
        const pageContent = $("#pageContent");

        // Create HTML elements
        const content = parseEntryContent(entry, allEntries);

        // Append to DOM
        pageContent.append(content as any);
    }

    // Updates the available page select options
    function updatePageSelect(selectedPage: string | undefined = undefined) {
        const select = $("#pageSelect");

        function addOption(optionName: string) {
            select.append(`<option>${optionName}</option>`);
            defaultShownEntries.add(optionName);
        }

        defaultShownEntries.clear();
        select.empty();

        addOption("Home");
        if (selectedPage !== undefined) {
            addOption(selectedPage);
            showingTemporaryOption = true;
        } else {
            showingTemporaryOption = false;
        }
        select.append("<option data-divider='true'></option>");

        const allPageNames = Array.from(allEntries.keys());
        allPageNames.sort();
        const spoilersState = getSpoilerState();

        for (const pageName of allPageNames) {
            const entry = allEntries.get(pageName)!;
            if (canShowSpoiler(entry.spoiler, spoilersState)) {
                addOption(pageName);
            }
        }

        refreshSelectpicker(select);

        if (selectedPage === undefined) {
            tryLoadFromHash(false);
        } else {
            select.selectpicker("val", selectedPage);
        }
    }

    // Updates the page content with the specified part
    function updatePartContent(entry: WikiEntry) {
        const part = entry.extraData as Item;
        const pageContent = $("#pageContent");

        // Create HTML elements
        const content = parseEntryContent(entry, allEntries);
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const infoboxContent = $(createItemDataContent(part));

        // Append to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(infoboxContent as any);
        pageContent.append(content as any);
    }
});
