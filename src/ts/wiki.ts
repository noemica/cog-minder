import autocomplete, { AutocompleteItem, AutocompleteResult } from "autocompleter";
import "bootstrap";
import * as jQuery from "jquery";

import bots from "../json/bots.json";
import items from "../json/items.json";
import wiki from "../json/wiki.json";
import { Bot } from "./botTypes";
import { MapLocation, Spoiler } from "./types/commonTypes";
import { Item } from "./types/itemTypes";
import { WikiEntry } from "./types/wikiTypes";
import {
    boldMatches,
    canShowSpoiler,
    createBotDataContent,
    createImagePath,
    createItemDataContent,
    createLocationHtml,
    getBot,
    getItem,
    initData,
    loadImage,
} from "./utilities/common";
import {
    createHeader,
    enableBotInfoInteraction,
    getSpoilerState,
    registerDisableAutocomplete,
    setActiveButtonGroupButton,
    setSpoilerState,
    temporarilySetValue,
} from "./utilities/commonJquery";
import { createContentHtml, createPreviewContent } from "./wikiParser";

const jq = jQuery.noConflict();
jq(function ($) {
    $(() => init());

    // Set of all entries shown based on current spoiler settings
    const allowedEntries: Set<string> = new Set<string>();

    // Map of all page names to entries
    const allEntries: Map<string, WikiEntry> = new Map();

    // Autocomplete result when setup
    let autocompleteResult: AutocompleteResult | undefined;

    // Has the user edited the current page since copying the text?
    let editedCurrentPage: boolean;

    // Save the last entry for proper disposal when the page changes
    let lastEntry: WikiEntry | undefined;

    // Save when we're showing an edited preview
    let lastEntryIsEdit: boolean;

    type CustomAutocompleteItem = AutocompleteItem & {
        pageId: string;
    };

    const searchString = "Search/";

    // Clears the page content and cleans up any resources
    function clearPageContent() {
        const pageContent = $("#pageContent");

        // Dispose popovers
        ($("#pageContent").find(`[data-toggle="popover"]`) as any).popover("dispose");

        pageContent.empty();
    }

    // Initialize the page state
    async function init() {
        createHeader("Wiki", $("#headerContainer"));
        registerDisableAutocomplete($(document));

        await initData(items as any, bots as any);

        editedCurrentPage = false;
        $("#searchInput").val("");

        initAllEntries();
        initAutocomplete();
        tryLoadFromHash(true);
        updateAllowedPages();

        // Register handlers
        $("#spoilerDropdown > button").on("click", (e) => {
            const state = $(e.target).text();
            $("#spoilers").text(state);
            setSpoilerState(state);
            ($("#spoilerDropdown > button") as any).tooltip("hide");

            updateAllowedPages();
        });
        $("#homeButton").on("click", () => {
            ($("#homeButton") as any).tooltip("hide");

            // Hide the edit pane too if visible
            $("#editContent").addClass("not-visible");
        });
        $("#editButton").on("click", () => {
            // Show the editor pane
            $("#editContent").removeClass("not-visible");
            ($("#editButton") as any).tooltip("hide");
        });
        $("#validateButton").on("click", () => {
            // Validate all content
            validateAll();
            ($("#validateButton") as any).tooltip("hide");
        });
        function search() {
            // Search if there's any content
            const input = $("#searchInput").val() as string;

            if (!input) {
                return;
            }

            const lowerInput = input.toLowerCase();
            const matchingEntry = Array.from(allowedEntries).find((e) => e.toLowerCase() == lowerInput);

            // If we find an exact matching entry (case insensitive)
            // then open it directly, otherwise search
            if (matchingEntry) {
                setSelectedPage(matchingEntry);
            } else {
                setSelectedPage(`${searchString}${input}`);
            }

            $("#searchInput").val("");
        }
        $("#searchInput").on("keyup", (e) => {
            if (e.key === "Enter" || e.key === "NumpadEnter") {
                search();
                // We need to reinitialize the autocompleter
                // as there is no way to programmatically hide it
                initAutocomplete();
            }
        });
        $("#searchButton").on("click", () => {
            search();

            ($("#searchButton") as any).tooltip("hide");
        });

        if (process.env.NODE_ENV === "development") {
            $("#validateButton").removeClass("not-visible");
        }

        // Register editor buttons
        function insertWrappedText(beforeText: string, afterText: string) {
            // This code might break at some point but it's better than
            // the alternative which totally breaks the undo/redo stack
            const textArea = $("#editTextArea");
            textArea.trigger("focus");
            document.execCommand("insertText", false, beforeText + afterText);
            const newPosition = textArea.prop("selectionStart") - afterText.length;
            textArea.prop("selectionStart", newPosition);
            textArea.prop("selectionEnd", newPosition);

            // The below text doesn't work well with the undo/redo stack
            // // Insert the before and after text wrapping the selected text area
            // // If there is no selection then it'll just be inserted at the cursor position
            // // or the end if no text is selected at all
            // const textArea = $("#editTextArea");
            // const start = textArea.prop("selectionStart");
            // const end = textArea.prop("selectionEnd");
            // const initialText = textArea.val() as string;
            // const preSplit = initialText.substring(0, start);
            // const split = initialText.substring(start, end);
            // const postSplit = initialText.substring(end);
            // textArea.val(`${preSplit}${beforeText}${split}${afterText}${postSplit}`);
            // (textArea.get(0) as any as HTMLTextAreaElement).setSelectionRange(
            //     start + beforeText.length,
            //     end + beforeText.length,
            // );
            // textArea.trigger("focus");
        }
        $("#editBoldTextButton").on("click", () => {
            insertWrappedText("[[B]]", "[[/B]]");
        });
        $("#editItalicizeTextButton").on("click", () => {
            insertWrappedText("[[I]]", "[[/I]]");
        });
        $("#editSubscriptTextButton").on("click", () => {
            insertWrappedText("[[Sub]]", "[[/Sub]]");
        });
        $("#editSuperscriptTextButton").on("click", () => {
            insertWrappedText("[[Sup]]", "[[/Sup]]");
        });
        $("#editGameTextButton").on("click", () => {
            insertWrappedText("[[GameText]]", "[[/GameText]]");
        });
        $("#editSpoilerTextButton").on("click", () => {
            insertWrappedText("[[Spoiler]]", "[[/Spoiler]]");
        });
        $("#editRedactedTextButton").on("click", () => {
            insertWrappedText("[[Redacted]]", "[[/Redacted]]");
        });
        $("#editLinkTextButton").on("click", () => {
            insertWrappedText("[[", "]]");
        });
        $("#editHeading1TextButton").on("click", () => {
            insertWrappedText("[[Heading]]", "[[/Heading]]");
        });
        $("#editHeading2TextButton").on("click", () => {
            insertWrappedText("[[Heading:2]]", "[[/Heading]]");
        });
        $("#editImageTextButton").on("click", () => {
            insertWrappedText("[[Image]]", "[[/Image]]");
        });
        $("#editGalleryTextButton").on("click", () => {
            insertWrappedText("[[Gallery]]", "[[/Gallery]]");
        });
        $("#editLoreButton").on("click", () => {
            insertWrappedText("[[Lore]]", "[[/Lore]]");
        });
        $("#editUnorderedListTextButton").on("click", () => {
            insertWrappedText("[[List]]", "[[/List]]");
        });
        $("#editOrderedListTextButton").on("click", () => {
            insertWrappedText("[[List:Ordered]]", "[[/List]]");
        });
        $("#editTableTextButton").on("click", () => {
            insertWrappedText("[[Table]]", "[[/Table]]");
        });
        $("#editTextArea").on("input", () => {
            editedCurrentPage = true;
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
                extraData: lastEntry!.extraData,
                name: lastEntry!.name,
                parentGroup: lastEntry!.parentGroup,
                spoiler: "None",
                type: lastEntry!.type,
            };
            lastEntryIsEdit = true;
            loadSelectedEntry(entry);

            temporarilySetValue($("#previewEditChangesButton"), "Updated", "Preview Changes", 2000, true);
        });
        $("#copyEditTextButton").on("click", () => {
            // Copies the edited text to the clipboard
            editedCurrentPage = false;
            const text = $("#editTextArea").val() as string;
            navigator.clipboard.writeText(text.replace(/\n/g, "\\n"));
            temporarilySetValue($("#copyEditTextButton"), "Copied", "Copy Text", 2000, true);
        });
        $(window).on("hashchange", () => {
            // If the hash changes (pasted URL) then reload
            tryLoadFromHash(false);
        });
        $(window).on("popstate", () => {
            // Try to load the recently popped state if set
            if (history.state !== null) {
                setSelectedPage(history.state);
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

        // Enable tooltips
        ($('[data-toggle="tooltip"]') as any).tooltip();
    }

    // Inits the wiki entries from JSON
    function initAllEntries() {
        // Add an entry to the list with duplication checking
        function addEntry(entry: WikiEntry) {
            function add(name: string, entry: WikiEntry) {
                const existingEntry = allEntries.get(name);

                if (existingEntry !== undefined) {
                    console.log(`Found duplicate wiki entries for "${name}"`);
                }

                allEntries.set(name, entry);
            }

            add(entry.name, entry);

            for (const alternateName of entry.alternativeNames) {
                add(alternateName, entry);
            }
        }

        // Initialize bots
        for (const botEntry of wiki.Bots) {
            const bot = getBot(botEntry.Name);

            addEntry({
                alternativeNames: [],
                name: botEntry.Name,
                type: "Bot",
                spoiler: bot.spoiler,
                content: botEntry.Content,
                extraData: bot,
            });
        }

        // Initialize bot groups
        for (const botGroupEntry of wiki["Bot Groups"]) {
            let spoiler: Spoiler = "None";
            if (botGroupEntry.Spoiler === "Redacted") {
                spoiler = "Redacted";
            } else if (botGroupEntry.Spoiler === "Spoiler") {
                spoiler = "Spoiler";
            }

            const botEntries: WikiEntry[] = [];
            const entry: WikiEntry = {
                alternativeNames: [],
                content: botGroupEntry.Content ?? "",
                name: botGroupEntry.Name,
                spoiler: spoiler,
                type: "Bot Group",
                extraData: botEntries,
            };
            addEntry(entry);

            // Add all bots in group
            for (const botName of botGroupEntry.Bots) {
                const botEntry = allEntries.get(botName);
                if (botEntry === undefined) {
                    console.log(`Found bad bot name ${botName} in group ${botGroupEntry.Name}`);
                    continue;
                }

                if (botEntry.type !== "Bot") {
                    console.log(`Found non-bot ${botEntry.name} in bot group ${entry.name}`);
                    continue;
                }

                if (botEntry.parentGroup !== undefined) {
                    console.log(`Found bot ${botEntry.name} in multiple groups`);
                }

                // Set the bot's parent group to point to this
                botEntry.parentGroup = entry;
                botEntries.push(botEntry);
            }
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
                multipleDepths: locationEntry.MultipleDepths ?? false,
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

            addEntry(entry);
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

            addEntry({
                alternativeNames: [],
                name: partEntry.Name,
                type: "Part",
                spoiler: spoiler,
                content: partEntry.Content,
                extraData: part,
            });
        }

        // Initialize part groups
        for (const partGroupEntry of wiki["Part Groups"]) {
            const spoiler: Spoiler = "None";
            // if (partGroupEntry.Spoiler === "Redacted") {
            //     spoiler = "Redacted";
            // } else if (partGroupEntry.Spoiler === "Spoiler") {
            //     spoiler = "Spoiler";
            // }

            const partEntries: WikiEntry[] = [];
            const entry: WikiEntry = {
                alternativeNames: [],
                content: partGroupEntry.Content ?? "",
                name: partGroupEntry.Name,
                spoiler: spoiler,
                type: "Part Group",
                extraData: partEntries,
            };
            addEntry(entry);

            // Add all parts in group
            for (const partName of partGroupEntry.Parts) {
                const partEntry = allEntries.get(partName);
                if (partEntry === undefined) {
                    console.log(`Found bad part name ${partName} in group ${partGroupEntry.Name}`);
                    continue;
                }

                if (partEntry.type !== "Part") {
                    console.log(`Found non-part ${partEntry.name} in part group ${entry.name}`);
                    continue;
                }

                if (partEntry.parentGroup !== undefined) {
                    console.log(`Found part ${partEntry.name} in multiple groups`);
                }

                // Set the part's parent group to point to this
                partEntry.parentGroup = entry;
                partEntries.push(partEntry);
            }
        }

        // Initialize other
        for (const otherEntry of wiki.Other) {
            let spoiler: Spoiler = "None";
            if (otherEntry.Spoiler === "Redacted") {
                spoiler = "Redacted";
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

            addEntry(entry);
        }
    }

    // Initializes the autocomplete input
    function initAutocomplete() {
        const searchInput = $("#searchInput");
        const searchGroupName = "Search";

        if (autocompleteResult !== undefined) {
            autocompleteResult.destroy();
        }

        autocompleteResult = autocomplete({
            disableAutoSelect: true,
            emptyMsg: "No results found",
            input: searchInput[0] as any as HTMLInputElement,
            onSelect: (item: CustomAutocompleteItem, input) => {
                $(input).val("");

                if (item.group === searchGroupName) {
                    setSelectedPage(`${searchString}${item.pageId}`);
                } else {
                    setSelectedPage(item.label!);
                }
            },
            fetch: (text, update: (items: CustomAutocompleteItem[]) => void) => {
                text = text.toLowerCase();
                const suggestions = [...allowedEntries.keys()]
                    .filter((p) => p.toLowerCase().startsWith(text))
                    .splice(0, 20)
                    .map((p) => {
                        const item: CustomAutocompleteItem = { pageId: p, label: p, group: "Pages" };
                        return item;
                    });

                suggestions.push({
                    group: searchGroupName,
                    label: `Search for\n${searchInput.val()}`,
                    pageId: searchInput.val() as string,
                });

                update(suggestions);
            },
            renderGroup: () => {
                return undefined;
            },
        });
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

                case "Bot Group":
                    updateBotGroupContent(entry);
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

                case "Part Group":
                    updatePartGroupContent(entry);
                    break;
            }

            ($("#pageContent").find(`[data-toggle="popover"]`) as any).popover();

            // Fix up any links to work properly
            overrideLinks(pageContent);
        }

        if (allowedEntries.has(selectedPage)) {
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
            let target = $(e.target);
            if (e.target.tagName !== "A") {
                target = target.parents("a");
            }

            const src = target.attr("src");
            const href = target.attr("href");
            if ((src !== undefined && src.charAt(0) !== "#") || (href !== undefined && href.charAt(0) !== "#")) {
                // Only override local paths
                return;
            }

            e.preventDefault();

            const selectedPage = target.attr("href")!.substring(1);

            setSelectedPage(selectedPage);
            document.documentElement.scrollTop = 0;
        });
    }

    // Parses the Wiki entry content and updates errors
    function parseEntryContent(entry: WikiEntry, headerLink = false) {
        const parseResult = createContentHtml(entry, allEntries, getSpoilerState(), headerLink);

        if (parseResult.errors.length > 0) {
            $("#editErrorsParentContainer").removeClass("not-visible");
            $("#editErrorsContainer").empty();
            console.log(`Errors while parsing ${entry.name}`);

            for (const error of parseResult.errors) {
                console.log(`Parse error: ${error}`);
                $("#editErrorsContainer").append(`<p>${error}</p>`);
            }
        } else {
            $("#editErrorsParentContainer").addClass("not-visible");
        }

        return parseResult.html;
    }

    // Searches all pages for matching text
    // Searches page titles first as well as page contents
    function searchPages(text: string) {
        const homeContainer = $("#homeContainer");
        const pageContent = $("#pageContent");

        // Show page content container
        homeContainer.addClass("not-visible");
        pageContent.removeClass("not-visible");

        document.title = `Search for "${text}" - Cogmind Wiki`;
        const lowerText = text.toLowerCase();

        pageContent.empty();

        // Create overall header and search text
        const resultsHeader = $(`<h1 class="wiki-heading">Search Results</h1>`);
        const searchHeader = $(`<h3 class="mt-3">Searching for "${text}"</h3>`);
        pageContent.append(resultsHeader as any);
        pageContent.append(searchHeader as any);

        const spoilersState = getSpoilerState();
        let anyResults = false;
        const titleMatches = Array.from(allowedEntries).filter((n) => n.toLowerCase().includes(lowerText));
        const previewContents = Array.from(allowedEntries)
            .map((n) => allEntries.get(n)!)
            .filter((e) => e !== undefined)
            .map((e) => {
                return {
                    name: e.name,
                    previewContent: createPreviewContent(e.content, spoilersState),
                };
            });
        const contentMatches = previewContents.filter((e) => e.previewContent.toLowerCase().includes(lowerText));

        if (titleMatches.length > 0) {
            anyResults = true;

            // Create header and list
            const titleMatchesHeader = $(`<h2 class="wiki-heading mt-3">Title Matches</h2>`);
            const searchResultsList = $(`<ul class="wiki-search-result-list"></ul>`);

            for (const titleMatch of titleMatches) {
                // Determine the page preview
                let matchText = previewContents.find((p) => p.name === titleMatch)!.previewContent;
                const fullText = matchText.length <= 250;
                const lastPeriod = matchText.lastIndexOf(". ");

                if (lastPeriod > -1 && lastPeriod <= 250) {
                    // Found a period, chop the match off there
                    matchText = matchText.substring(0, lastPeriod + 1);
                } else if (matchText.length > 0 && !fullText) {
                    matchText = matchText.substring(0, 250) + "...";
                }

                if (matchText.length === 0) {
                    // Default to no page content if empty page
                    matchText = "No page content";
                } else {
                    // Bold matches in the page preview
                    matchText = boldMatches(matchText, lowerText);
                }

                // Bold matches in the title
                const boldedTitleMatch = boldMatches(titleMatch, lowerText);

                // Create list item for each result
                const titleItem = $(`<li class="mt-3"></li>`);
                const titleLink = $(`<a href="#${titleMatch}">${boldedTitleMatch}</a>`);
                const pagePreview = $(`<span>${matchText}</span>`);

                // Append HTML
                titleItem.append(titleLink as any);
                searchResultsList.append(titleItem as any);
                searchResultsList.append(pagePreview as any);
            }

            // Append to page content
            pageContent.append(titleMatchesHeader as any);
            pageContent.append(searchResultsList as any);
        }

        if (contentMatches.length > 0) {
            anyResults = true;

            // Create header and list
            const contentMatchesHeader = $(`<h2 class="wiki-heading mt-3">Content Matches</h2>`);
            const searchResultsList = $(`<ul class="wiki-search-result-list"></ul>`);

            for (const entry of contentMatches) {
                // Determine the page preview
                let matchIndex = entry.previewContent.toLowerCase().indexOf(lowerText);
                const entryIndex = Math.max(0, matchIndex - 150);
                let matchText = entry.previewContent.substring(entryIndex, matchIndex + 150);
                const fullTextBefore = entryIndex == 0;
                const fullTextAfter = matchIndex + 150 >= entry.previewContent.length;
                matchIndex = matchText.toLowerCase().indexOf(lowerText);
                const firstPeriodIndex = matchText.indexOf(". ");

                if (firstPeriodIndex !== -1 && firstPeriodIndex < matchIndex) {
                    // Found a sentence end before the match
                    // Start at the first sentence before the match
                    matchText = matchText.substring(firstPeriodIndex + 2);
                } else if (matchText.length > 0 && !fullTextBefore) {
                    matchText = "..." + matchText;
                }

                matchIndex = matchText.toLowerCase().indexOf(lowerText);
                const lastPeriodIndex = matchText.lastIndexOf(". ");
                if (lastPeriodIndex > -1 && lastPeriodIndex > matchIndex) {
                    // Found a period after the search, chop the match off there
                    matchText = matchText.substring(0, lastPeriodIndex + 1);
                } else if (matchText.length > 0 && !fullTextAfter) {
                    matchText = matchText + "...";
                }

                if (matchText.length === 0) {
                    // Default to no page content if empty page
                    matchText = "No page content";
                } else {
                    // Bold matches in the page preview
                    matchText = boldMatches(matchText, lowerText);
                }

                // Bold matches in the title
                const boldedTitleMatch = boldMatches(entry.name, lowerText);

                // Create list item for each result
                const titleItem = $(`<li class="mt-3"></li>`);
                const titleLink = $(`<a href="#${entry.name}">${boldedTitleMatch}</a>`);
                const pagePreview = $(`<span>${matchText}</span>`);

                // Append HTML
                titleItem.append(titleLink as any);
                searchResultsList.append(titleItem as any);
                searchResultsList.append(pagePreview as any);
            }

            // Append to page content
            pageContent.append(contentMatchesHeader as any);
            pageContent.append(searchResultsList as any);
        }

        if (!anyResults) {
            pageContent.append(`<span>No results found for "${text}".</span>`);
        }

        // Fixup links
        overrideLinks(pageContent);
    }

    // Sets the selected page
    function setSelectedPage(selectedPage: string, init = false) {
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
                return;
            }

            editedCurrentPage = false;
        }

        if (selectedPage.startsWith(searchString)) {
            searchPages(selectedPage.substring(searchString.length));
        } else if (allEntries.get(selectedPage)) {
            // Found page, update now
            updateContent(selectedPage);
        } else {
            // Page wasn't in select at all, just a bad URL
            // Default to home page
            updateHomeContent(selectedPage === "Home" ? "" : `Page ${selectedPage} was not found.`);
        }
    }

    // Attempts to set the selected page from the current hash
    function tryLoadFromHash(init: boolean) {
        const hash = window.location.hash.substring(1);
        if (hash.length > 0) {
            const selectedPage = decodeURI(hash);
            setSelectedPage(selectedPage, init);
        } else {
            history.replaceState("Home", "", "wiki.html");
            setSelectedPage("Home");
        }
    }

    // Updates the available page select options
    function updateAllowedPages(selectedPage: string | undefined = undefined) {
        function addOption(optionName: string) {
            allowedEntries.add(optionName);
        }

        allowedEntries.clear();

        addOption("Home");
        if (selectedPage !== undefined) {
            addOption(selectedPage);
        }

        const allPageNames = Array.from(allEntries.keys());
        allPageNames.sort();
        const spoilersState = getSpoilerState();

        for (const pageName of allPageNames) {
            const entry = allEntries.get(pageName)!;
            if (canShowSpoiler(entry.spoiler, spoilersState)) {
                addOption(pageName);
            }
        }

        if (selectedPage === undefined) {
            tryLoadFromHash(false);
        } else {
            setSelectedPage(selectedPage);
        }
    }

    // Updates the page content with the specified bot
    function updateBotContent(entry: WikiEntry) {
        const bot = entry.extraData as Bot;
        const pageContent = $("#pageContent");

        // Create HTML elements
        const content = $(parseEntryContent(entry));
        const parentContent =
            entry.parentGroup === undefined ? undefined : $(parseEntryContent(entry.parentGroup, true));
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const infoboxContent = $(createBotDataContent(bot, getSpoilerState(), true));

        // Append to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(infoboxContent as any);

        if (parentContent !== undefined) {
            // Append parent content first
            pageContent.append(parentContent as any);
        }
        pageContent.append(content as any);

        // Bot parts have popovers, must hook them up here
        enableBotInfoInteraction(pageContent);
    }

    // Updates the page content with the specified bot group
    function updateBotGroupContent(entry: WikiEntry) {
        const botEntries = entry.extraData as WikiEntry[];
        const pageContent = $("#pageContent");

        // Create HTML elements
        const botsContent = $("<div></div>");
        const commonContent = $(parseEntryContent(entry));
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const botNameContainer = $(`<div class="btn-group btn-group-toggle" data-toggle="buttons"></div>`);
        const infoboxContentContainer = $("<div></div>");

        let index = 0;

        for (const botEntry of botEntries) {
            // Add all of the bots in the group
            const botIndex = index;
            index += 1;

            // Create HTML elements
            const button = $(
                `<label class="btn wiki-infobox-selector-text${botIndex === 0 ? " active" : ""}"><input type="radio"${
                    botIndex === 0 ? " checked" : ""
                }>${botEntry.name}</label>`,
            );
            const botInfoboxContent = $(
                `<div class="mt-2">${createBotDataContent(botEntry.extraData as Bot, getSpoilerState(), true)}</div>`,
            );
            const botContent = $(`<div>${parseEntryContent(botEntry, true)}</div>`);

            // Append to DOM
            botsContent.append(botContent as any);
            botNameContainer.append(button[0]);
            infoboxContentContainer.append(botInfoboxContent as any);

            // Set up switching code
            button.on("click", () => {
                infoboxContentContainer.children().addClass("not-visible");
                botsContent.children().addClass("not-visible");
                botContent.removeClass("not-visible");
                botInfoboxContent.removeClass("not-visible");
                setActiveButtonGroupButton(botNameContainer, botIndex);
            });
        }

        // Toggle the first button
        botNameContainer.children().first().trigger("click");
        setActiveButtonGroupButton(botNameContainer, 1);

        // Append to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(botNameContainer as any);
        infoboxColumn.append(infoboxContentContainer as any);
        pageContent.append(commonContent as any);
        pageContent.append(botsContent as any);

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
            pageContent.append("Error generating page, maybe a bad link?");
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
        const content = $(parseEntryContent(entry));
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const infoboxContent = $(createLocationHtml(location, getSpoilerState(), false));

        // Append to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(infoboxContent as any);
        pageContent.append(content as any);
    }

    function updateOtherContent(entry: WikiEntry) {
        const pageContent = $("#pageContent");

        // Create HTML elements
        const content = $(parseEntryContent(entry));

        // Append to DOM
        pageContent.append(content as any);
    }

    // Updates the page content with the specified part
    function updatePartContent(entry: WikiEntry) {
        const part = entry.extraData as Item;
        const pageContent = $("#pageContent");

        // Create HTML elements
        const content = $(parseEntryContent(entry));
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const infoboxContent = $(createItemDataContent(part));
        const parentContent =
            entry.parentGroup === undefined ? undefined : $(parseEntryContent(entry.parentGroup, true));

        // Append to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(infoboxContent as any);

        if (parentContent !== undefined) {
            // Append parent content first
            pageContent.append(parentContent as any);
        }
        pageContent.append(content as any);
    }

    // Updates the page content with the specified part group
    function updatePartGroupContent(entry: WikiEntry) {
        const partEntries = entry.extraData as WikiEntry[];
        const pageContent = $("#pageContent");

        // Create HTML elements
        const partsContent = $("<div></div>");
        const commonContent = $(parseEntryContent(entry));
        const infoboxColumn = $(`<div class="wiki-infobox float-clear-right"></div>`);
        const partNameContainer = $(`<div class="btn-group btn-group-toggle" data-toggle="buttons"></div>`);
        const infoboxContentContainer = $("<div></div>");

        let index = 0;
        const spoilerState = getSpoilerState();

        // Add all of the parts in the group
        for (const partEntry of partEntries) {
            // Just skip parts we can't show
            if (!canShowSpoiler(partEntry.spoiler, spoilerState)) {
                continue;
            }

            const partIndex = index;
            index += 1;

            // Create HTML elements
            const button = $(
                `<label class="btn wiki-infobox-selector-text${partIndex === 0 ? " active" : ""}"><input type="radio"${
                    partIndex === 0 ? " checked" : ""
                }>${partEntry.name}</label>`,
            );
            const partInfoboxContent = $(
                `<div class="mt-2">${createItemDataContent(partEntry.extraData as Item)}</div>`,
            );
            const partContent = $(`<div>${parseEntryContent(partEntry, true)}</div>`);

            partInfoboxContent.addClass("not-visible");
            partContent.addClass("not-visible");

            // Append to DOM
            partsContent.append(partContent as any);
            partNameContainer.append(button[0]);
            infoboxContentContainer.append(partInfoboxContent as any);

            // Set up switching code
            button.on("click", () => {
                infoboxContentContainer.children().addClass("not-visible");
                partsContent.children().addClass("not-visible");
                partContent.removeClass("not-visible");
                partInfoboxContent.removeClass("not-visible");
                setActiveButtonGroupButton(partNameContainer, partIndex);
            });
        }

        // Toggle the first button
        partNameContainer.children().first().trigger("click");
        setActiveButtonGroupButton(partNameContainer, 1);

        // Append rest to DOM
        // Append the infobox first which floats to the right
        pageContent.append(infoboxColumn[0]);
        infoboxColumn.append(partNameContainer as any);
        infoboxColumn.append(infoboxContentContainer as any);
        pageContent.append(commonContent as any);
        pageContent.append(partsContent as any);
    }

    // Validates all page entries
    async function validateAll() {
        for (const entry of allEntries.values()) {
            const parseResult = createContentHtml(entry, allEntries, getSpoilerState(), false);
            const promises: Promise<any>[] = [];

            for (const imageName of parseResult.images.keys()) {
                promises.push(loadImage(createImagePath(`${imageName}`, `wiki_images/`)));
            }

            if (parseResult.errors.length > 0) {
                console.log(`Errors while parsing ${entry.name}`);

                for (const error of parseResult.errors) {
                    console.log(`Parse error: ${error}`);
                }
            }

            const results = await Promise.all(promises);

            if (!results.every((r) => r === true)) {
                console.log(`Missing images above in ${entry.name}`);
            }
        }

        console.log("Done validating");
    }
});
