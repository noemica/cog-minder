import { ColumnDef, GroupColumnDef } from "@tanstack/react-table";
import React, { Fragment, ReactNode } from "react";

import lore from "../../json/lore.json";
import hacks from "../../json/machine_hacks.json";
import BotDetails from "../components/GameDetails/BotDetails";
import { TooltipTexts } from "../components/GameDetails/Details";
import ItemDetails from "../components/GameDetails/ItemDetails";
import { LinkIcon } from "../components/Icons/Icons";
import WikiGroupInfobox from "../components/Pages/WikiPage/WikiGroupNavbox";
import WikiTableOfContents, { WikiHeadingState } from "../components/Pages/WikiPage/WikiTableOfContents";
import { BotLink, ItemLink, LocationLink } from "../components/Pages/WikiPage/WikiTooltips";
import TextTooltipButton from "../components/Popover/TextTooltipButton";
import { SortingTable } from "../components/Table/Table";
import { Bot, BotPart } from "../types/botTypes";
import { MapLocation, Spoiler } from "../types/commonTypes";
import { Critical, Item, WeaponItem } from "../types/itemTypes";
import { WikiEntry } from "../types/wikiTypes";
import { HashLink } from "../utilities/linkExport";
import { BotData } from "./BotData";
import { ItemData } from "./ItemData";
import {
    canShowSpoiler,
    createImagePath,
    getLargeBotImageName,
    getLinkSafeString,
    parseFloatOrUndefined,
    parseIntOrDefault,
    parseIntOrUndefined,
    rootDirectory,
} from "./common";
import { allPartColumnDefs } from "./partColumnDefs";

// Output group types
// Grouped can be in the same <p> block
// Individual will always be separated into their own HTML
// A separator exists to artificially separate Grouped sections
type OutputGroupType = "Grouped" | "Individual" | "Separator";

type OutputGroup = {
    node: ReactNode | undefined;
    groupType: OutputGroupType;
};

type AllowedContentType = "InlineOnly" | "InlineWithNewlines" | "All";

class ParserState {
    allowHeadingLinks: boolean;
    allEntries: Map<string, WikiEntry>;
    botData: BotData;
    errors: string[];
    headings: WikiHeadingState[];
    images: Set<string>;
    inSpoiler: boolean;
    initialContent: string;
    index: number;
    inlineOnly: AllowedContentType;
    itemData: ItemData;
    output: OutputGroup[];
    spoiler: Spoiler;

    constructor(
        allowHeadingLinks: boolean,
        allEntries: Map<string, WikiEntry>,
        botData: BotData,
        errors: string[],
        headings: WikiHeadingState[],
        images: Set<string>,
        inSpoiler: boolean,
        initialContent: string,
        inlineOnly: AllowedContentType,
        itemData: ItemData,
        spoiler: Spoiler,
    ) {
        this.allowHeadingLinks = allowHeadingLinks;
        this.allEntries = allEntries;
        this.botData = botData;
        this.errors = errors;
        this.headings = headings;
        this.images = images;
        this.inSpoiler = inSpoiler;
        this.initialContent = initialContent;
        this.index = 0;
        this.inlineOnly = inlineOnly;
        this.itemData = itemData;
        this.output = [];
        this.spoiler = spoiler;
    }

    static Clone(state: ParserState): ParserState {
        return new ParserState(
            state.allowHeadingLinks,
            state.allEntries,
            state.botData,
            state.errors,
            state.headings,
            state.images,
            state.inSpoiler,
            state.initialContent,
            state.inlineOnly,
            state.itemData,
            state.spoiler,
        );
    }
}

function cleanHeadingText(text: string): { text: string; id: string } {
    // First strips out tags to get the real displayed text
    // Then creates an ID from it
    const actionRegex = /\[\[([^\]:]*)(?::([^\]]*))?\]\]/g;

    let result: RegExpExecArray | null;

    let cleanedText = "";
    let index = 0;

    while ((result = actionRegex.exec(text))) {
        if (result.index > index) {
            cleanedText += text.slice(index, result.index);
        }

        if (actionMap.has(result[1].replace("/", ""))) {
            // Inline content types, skip the tags entirely
        } else {
            // [[Link]] or [[Link|Text]], strip content inside tag
            if (result[1].includes("|")) {
                cleanedText += result[1].slice(result[1].indexOf("|") + 1);
            } else {
                cleanedText += result[1];
            }
        }

        index = result.index + result[0].length;

        if (index >= text.length) {
            break;
        }
    }

    if (index < text.length) {
        cleanedText += text.slice(index);
    }

    // Unescape the links that have double curly braces
    cleanedText = cleanedText.replaceAll("{{", "[").replaceAll("}}", "]");

    // Replace all spaces with underscore since spaces are technically not allowed
    // Then strip out all chars except for alphabetical and -/_s.
    const textId = createIdFromText(cleanedText);
    return { text: cleanedText, id: textId };
}

// Turns an arbitrary string into an HTML ID-compatible one
function createIdFromText(text: string) {
    return text
        .replaceAll(" ", "_")
        .replaceAll(/[^\w-]/g, "")
        .toLowerCase();
}

function SpoilerButton({ spoiler }: { spoiler: Spoiler }) {
    let buttonStyle: string;
    let buttonText: string;
    let tooltipText: string;

    if (spoiler === "None") {
        buttonStyle = "no-spoiler-info-button";
        buttonText = "No Spoiler";
        tooltipText = "This page does not directly relate to spoiler content.";
    } else if (spoiler === "Spoiler") {
        buttonStyle = "spoiler-info-button";
        buttonText = "Spoiler";
        tooltipText =
            "This page relates to mild spoiler-related content. Spoiler-tier content primarily includes midgame Factory and Research branch maps.";
    } else {
        buttonStyle = "redacted-info-button";
        buttonText = "Redacted";
        tooltipText =
            "This page relates to the highest levels of spoiler-related content. Redacted-tier includes well hidden midgame maps like L, S7, and FRG, as well as extended endgame maps C and A0.";
    }

    return (
        <TextTooltipButton className={buttonStyle} tooltipText={tooltipText}>
            {buttonText}
        </TextTooltipButton>
    );
}

// Creates the HTML content of a wiki entry
export function createContentHtml(
    entry: WikiEntry,
    allEntries: Map<string, WikiEntry>,
    spoilerState: Spoiler,
    headingLink: boolean,
    itemData: ItemData,
    botData: BotData,
): { node: ReactNode; errors: string[]; images: Set<string> } {
    // Process each section into the same output groups

    // Process initial content by replacing any instances of [XYZ] in links with {{xyz}}
    // Otherwise we have issues with the regex for any links that include square brackets in them
    const initialContent = entry.content.replace(/([^[])\[([\w/]*)\]/g, (_, p1, p2) => {
        return `${p1}{{${p2}}}`;
    });
    const state = new ParserState(
        true,
        allEntries,
        botData,
        [],
        [],
        new Set<string>(),
        false,
        initialContent,
        "All",
        itemData,
        spoilerState,
    );
    processSection(state, undefined);

    // Combine all alt names as part of the title
    const names = [entry.name];
    for (const name of entry.alternativeNames) {
        names.push(name);
    }

    const headingText = names.join("/");

    // Convert to HTML
    let outputHtml = outputGroupsToHtml(state.output, false);
    if (outputHtml === undefined) {
        outputHtml = <p>This page is a stub. Please consider contributing.</p>;
    }
    return {
        node: (
            <>
                <h1 className="wiki-emphasized-heading">
                    {headingLink ? (
                        <HashLink to={`/${getLinkSafeString(entry.name)}`}>{headingText}</HashLink>
                    ) : (
                        headingText
                    )}
                    <LinkIcon href="#" />
                    <SpoilerButton spoiler={entry.spoiler} />
                </h1>
                {
                    // If the base heading is a link, don't create a TOC
                    headingLink ? undefined : <WikiTableOfContents headings={state.headings} />
                }
                {outputHtml}
            </>
        ),
        errors: state.errors,
        images: state.images,
    };
}

// Creates the preview content for a search result
// This strips out any spoiler/redacted tags as well as their internal content
// if not allowed by current spoiler level
const spoilerRegex = /(\[\[Spoiler\]\])(.*?)(\[\[\/Spoiler\]\])/s;
const redactedRegex = /(\[\[Redacted\]\])(.*?)(\[\[\/Redacted\]\])/s;
const imageRegex = /\[\[Image\]\](.*?)\[\[\/Image\]\]/s;
export function createPreviewContent(content: string, spoilerState: Spoiler): string {
    function stripSpoilerContent(regex: RegExp, spoiler: Spoiler) {
        let result: RegExpExecArray | null;
        do {
            // Remove spoilers from the preview. If we can show the spoilers then
            // just remove the tags but display the content. Otherwise remove the
            // entire interior section.
            result = regex.exec(content);
            if (result !== null) {
                if (canShowSpoiler(spoiler, spoilerState)) {
                    content =
                        content.substring(0, result.index) +
                        result[2] +
                        content.substring(result.index + result[0].length);
                } else {
                    content = content.substring(0, result.index) + content.substring(result.index + result[0].length);
                }
            }
        } while (result !== null);
    }

    stripSpoilerContent(spoilerRegex, "Spoiler");
    stripSpoilerContent(redactedRegex, "Redacted");
    content = content.replace(imageRegex, "");

    return content;
}

function getLinkNode(state: ParserState, referenceEntry: WikiEntry, linkText: string, linkTarget?: string) {
    let node: ReactNode | undefined;

    if (referenceEntry.type === "Bot") {
        const bot = referenceEntry.extraData as Bot;
        node = <BotLink bot={bot} linkTarget={linkTarget} text={linkText} />;
    } else if (referenceEntry.type === "Location") {
        const location = referenceEntry.extraData as MapLocation;
        node = <LocationLink linkTarget={linkTarget} location={location} text={linkText} />;
    } else if (referenceEntry.type === "Part") {
        const item = referenceEntry.extraData as Item;
        node = <ItemLink item={item} linkTarget={linkTarget} text={linkText} />;
    } else {
        node = <HashLink to={linkTarget || `/${getLinkSafeString(referenceEntry.name)}`}>{linkText}</HashLink>;
    }

    if (!canShowSpoiler(referenceEntry.spoiler, state.spoiler) && !state.inSpoiler) {
        // Auto-spoiler links that aren't in a proper spoiler block
        node = <span className="spoiler-text spoiler-text-multiline">{node}</span>;
    }

    return node;
}

// Turns a list of output groups into HTML
function outputGroupsToHtml(
    outputGroups: OutputGroup[],
    inSpoiler: boolean,
    startInGroup = false,
    inTopLevelSpoiler = false,
): ReactNode | undefined {
    if (outputGroups.length === 0) {
        return undefined;
    }

    type CombinedGroups = {
        groupNodes: (ReactNode | undefined)[];
        parentElement: "p" | "spoiler-span" | "spoiler-p" | "none";
    };

    function processCombinedGroups(groups: CombinedGroups, key: number) {
        switch (groups.parentElement) {
            case "none":
                return <Fragment key={key}>{groups.groupNodes}</Fragment>;

            case "p":
                return <p key={key}>{groups.groupNodes}</p>;

            case "spoiler-p":
                return (
                    <p key={key}>
                        <span className="spoiler-text spoiler-text-multiline">{groups.groupNodes}</span>
                    </p>
                );

            case "spoiler-span":
                return (
                    <span key={key} className="spoiler-text spoiler-text-multiline">
                        {groups.groupNodes}
                    </span>
                );
        }
    }

    const combinedGroups: CombinedGroups[] = [];
    let currentGroup: CombinedGroups | undefined;

    // If we are starting in a parent group, output a list of nodes instead of
    // adding another top level HTML element
    if (startInGroup) {
        currentGroup = {
            groupNodes: [],
            parentElement: "none",
        };
        combinedGroups.push(currentGroup);
    }

    if (inSpoiler && inTopLevelSpoiler) {
        // Grouped spoiler content needs to go into a span so it can continue
        // on in case we are adding a spoiler block in the middle of an existing
        // group. Otherwise, we don't want any special parent element.
        if (outputGroups[0].groupType === "Grouped") {
            currentGroup = {
                groupNodes: [],
                parentElement: "spoiler-span",
            };
            combinedGroups.push(currentGroup);
        } else {
            currentGroup = {
                groupNodes: [],
                parentElement: "none",
            };
            combinedGroups.push(currentGroup);
        }
    }

    for (const group of outputGroups) {
        if (group.node === "") {
            continue;
        }

        // Starting a new group
        if (currentGroup === undefined && group.groupType === "Grouped" && group.node !== undefined) {
            currentGroup = {
                groupNodes: [],
                parentElement: inSpoiler ? "spoiler-p" : "p",
            };
            combinedGroups.push(currentGroup);
        }

        // Ending an existing group
        if (group.groupType === "Separator" || group.groupType === "Individual") {
            currentGroup = undefined;
        }

        if (group.node !== undefined) {
            if (currentGroup === undefined) {
                // If we still don't have a group (separator/individual) then
                // create one here, but don't save it
                combinedGroups.push({
                    groupNodes: [<Fragment key={0}>{group.node}</Fragment>],
                    parentElement: group.groupType === "Grouped" ? "p" : "none",
                });
            } else {
                // Add onto existing group
                currentGroup.groupNodes.push(<Fragment key={currentGroup.groupNodes.length}>{group.node}</Fragment>);
            }
        }
    }

    return combinedGroups.map((combinedGroup, i) => processCombinedGroups(combinedGroup, i));
}

export function parseEntryContent(
    entry: WikiEntry,
    allEntries: Map<string, WikiEntry>,
    spoiler: Spoiler,
    itemData: ItemData,
    botData: BotData,
) {
    const parseResult = createContentHtml(entry, allEntries, spoiler, false, itemData, botData);

    if (parseResult.errors.length > 0) {
        console.log(`Errors while parsing ${entry.name}`);

        for (const error of parseResult.errors) {
            console.log(`Parse error: ${error}`);
        }
    }

    let groupNodes: ReactNode[] = [];

    if (entry.parentEntries.length > 0) {
        const ancestorEntries = new Set<WikiEntry>();

        function addAncestors(entry: WikiEntry) {
            for (const parent of entry.parentEntries.values()) {
                if (parent.parentEntries.length === 0) {
                    ancestorEntries.add(parent);
                } else {
                    addAncestors(parent);
                }
            }
        }

        addAncestors(entry);

        groupNodes = Array.from(ancestorEntries.values())
            .sort((entry1, entry2) => entry1.name.localeCompare(entry2.name))
            .map((ancestorEntry, i) => (
                <WikiGroupInfobox key={i} activeEntry={entry} groupEntry={ancestorEntry} spoiler={spoiler} />
            ));
    } else if (entry.childEntries.length > 0) {
        groupNodes.push(<WikiGroupInfobox activeEntry={entry} groupEntry={entry} key={0} spoiler={spoiler} />);
    }

    parseResult.node = (
        <>
            {parseResult.node}
            {groupNodes}
        </>
    );

    return parseResult;
}

// Process the locations tag like [[AllLocations]]
function processAllLocationsTag(state: ParserState, result: RegExpExecArray) {
    state.index += result[0].length;

    const locationRows: ReactNode[] = [];

    for (const entryPair of state.allEntries.entries()) {
        const entryName = entryPair[0];
        const entry = entryPair[1];

        // Don't include alternative names as separate entries, only show the main entry
        if (entry.type !== "Location" || entryName != entry.name) {
            continue;
        }

        const location = entry.extraData as MapLocation;

        // Fill out row for each location
        locationRows.push(
            <tr key={entryName}>
                <td>{getLinkNode(state, entry, location.name.replace(" (Location)", ""))}</td>
                <td>{location.branch ? "Branch" : "Main"}</td>
                <td>
                    {location.minDepth === location.maxDepth
                        ? location.minDepth
                        : `${location.minDepth} to ${location.maxDepth} ${
                              location.multipleDepths ? "" : "(Only at one depth per run)"
                          }`}
                </td>
            </tr>,
        );
    }

    const html = (
        <table className="wiki-table">
            <thead>
                <tr>
                    <th>Location Name</th>
                    <th>Main Floor/Branch</th>
                    <th>Depths</th>
                </tr>
            </thead>
            <tbody>{locationRows}</tbody>
        </table>
    );

    // Add the locations table
    state.output.push({
        groupType: "Individual",
        node: html,
    });
}

// Process a B tag like [[B]]Bolded Text[[/Bold]]
function processBTag(state: ParserState, result: RegExpExecArray) {
    // Process the heading subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inlineOnly = "InlineOnly";

    processSection(tempState, "/B");
    state.index = tempState.index;
    const boldedContent = <b>{outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</b>;

    state.output.push({ groupType: "Grouped", node: boldedContent });
}

const botDetailsMap = new Map<
    string,
    {
        key?: string;
        isArmament?: boolean;
        isArmamentOption?: boolean;
        isComponents?: boolean;
        isComponentsOption?: boolean;
        isNumber?: boolean;
    }
>([
    ["Name", {}],
    ["Class", {}],
    ["Size", {}],
    ["Profile", {}],
    ["Rating", {}],
    ["Tier", {}],
    ["Threat", {}],
    ["Value", { isNumber: true }],
    ["Energy Generation", { isNumber: true }],
    ["Heat Dissipation", { isNumber: true }],
    ["Visual Range", {}],
    ["Memory", {}],
    ["Spot Percent", {}],
    ["Movement", {}],
    ["Core Integrity", { isNumber: true }],
    ["Core Exposure", { isNumber: true }],
    ["Salvage Potential", {}],
    ["Inventory Size", {}],
    ["Armament", { isArmament: true }],
    ["Armament Option", { isArmamentOption: true }],
    ["Components", { isComponents: true }],
    ["Components Option", { isComponentsOption: true }],
    ["Description", {}],
]);
function processBotDetailsTag(state: ParserState, result: RegExpExecArray) {
    function getBotKey(inputName: string, key?: string) {
        if (key !== undefined) {
            return key;
        }

        return inputName[0].toLowerCase() + inputName.substring(1).replaceAll(" ", "");
    }

    // Find [[/BotDetails]] closing tag first
    const closeResult = /\[\[\/BotDetails\]\]/.exec(state.initialContent.substring(state.index));

    if (closeResult === null) {
        // If we can't find the end tag then just skip over the opening tag
        recordError(state, "Found bot details tag without close tag");
        state.index += result[0].length;
        return;
    }

    // Split interior text by || to get each category
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + closeResult.index - result[0].length;
    const categoriesSplit = state.initialContent.substring(startIndex, endIndex).split("||");

    const bot: Bot = {
        armament: [],
        armamentData: [],
        armamentOptionData: [],
        armamentString: "",
        categories: [],
        class: "",
        componentData: [],
        componentOptionData: [],
        components: [],
        componentsString: "",
        coreCoverage: 0,
        coreExposure: 0,
        coreIntegrity: 0,
        customBot: true,
        description: "",
        energyGeneration: 0,
        heatDissipation: 0,
        immunities: [],
        immunitiesString: "",
        inventorySize: "1",
        locations: [],
        memory: "",
        movement: "",
        name: "",
        profile: "",
        rating: "",
        salvageHigh: 0,
        salvageLow: 0,
        salvagePotential: "",
        size: "Medium",
        speed: 0,
        spoiler: "None",
        spotPercent: "",
        threat: "",
        tier: "",
        totalCoverage: 0,
        traits: [],
        traitsString: "",
        value: 0,
        visualRange: "16",
    };

    // Process each category
    for (const categoryValues of categoriesSplit) {
        const split = categoryValues.split("|");

        const category = split[0].trim();
        if (split.length === 1) {
            recordError(state, `Bot data category ${category} has no value`);
            continue;
        }

        const categoryData = botDetailsMap.get(category);
        if (categoryData === undefined) {
            recordError(state, `Bot data category ${category} is not expected`);
            continue;
        }

        let value: any = split[1].trim();

        // Special category processing
        if (categoryData.isNumber) {
            value = parseFloatOrUndefined(value);
            if (value === undefined) {
                recordError(state, `Bot data category ${category} has invalid number ${split[1]}`);
                continue;
            }

            if (value === 0) {
                continue;
            }
        } else if (
            categoryData.isArmament ||
            categoryData.isComponents ||
            categoryData.isArmamentOption ||
            categoryData.isComponentsOption
        ) {
            // Armament/component data is split into a chain of |-separated part + number pairs
            split.shift();

            if (split.length % 2 === 1) {
                recordError(state, `Bot data category ${category} has mismatched parts and part numbers`);
                continue;
            }

            const optionParts: BotPart[] = [];

            for (let i = 0; i < split.length; i += 2) {
                const item = split[i].trim();
                let number = parseIntOrUndefined(split[i + 1]);

                if (number === undefined) {
                    recordError(state, `Bot data category ${category} item ${item} has invalid number`);
                    number = 1;
                }

                const part: BotPart = {
                    coverage: 0,
                    integrity: 0,
                    name: item,
                    number,
                };

                if (categoryData.isArmament) {
                    bot.armamentData.push(part);
                } else if (categoryData.isComponents) {
                    bot.componentData.push(part);
                } else {
                    optionParts.push(part);
                }
            }

            if (categoryData.isArmamentOption) {
                bot.armamentOptionData.push(optionParts);
            } else if (categoryData.isComponentsOption) {
                bot.componentOptionData.push(optionParts);
            }

            continue;
        }

        // Assign the value to the item
        bot[getBotKey(category, categoryData?.key)] = value;
    }

    // If the rating is unset, manually calculate it
    if (bot.rating === "") {
        let rating = 0;

        const allParts: BotPart[] = [];

        allParts.push(...bot.armamentData);
        allParts.push(...bot.componentData);
        allParts.push(...bot.armamentOptionData.map((options) => options[0]));
        allParts.push(...bot.componentOptionData.map((options) => options[0]));

        for (const part of allParts) {
            const item = state.itemData.tryGetItem(part.name);

            if (item !== undefined) {
                rating += item.rating * part.number;
            }
        }

        rating += parseIntOrDefault(bot.tier, 1);

        bot.rating = rating.toString();
    }

    state.index = endIndex + closeResult[0].length;
    const content = (
        <div className="wiki-infobox wiki-infobox-centered">
            <BotDetails bot={bot} />
        </div>
    );

    state.output.push({
        groupType: "Individual",
        node: content,
    });
}

// Process a [[BotGroups]][[/BotGroups]] tag
function processBotGroupsTag(state: ParserState, result: RegExpExecArray) {
    const processedEntries = new Set<WikiEntry>();
    const nodes: Map<string, ReactNode> = new Map();

    for (const groupEntry of state.allEntries.values()) {
        if (
            (groupEntry.type !== "Bot Group" && groupEntry.type !== "Bot Supergroup") ||
            !canShowSpoiler(groupEntry.spoiler, state.spoiler) ||
            processedEntries.has(groupEntry)
        ) {
            continue;
        }

        processedEntries.add(groupEntry);

        // Get list of images to display
        // Only show images for non-supergroups because supergroups have too many
        // various sprites that cause clutter
        const images = new Set<string>();
        if (groupEntry.type === "Bot Group") {
            for (const entry of state.allEntries.values()) {
                if (entry.parentEntries?.includes(groupEntry)) {
                    const bot = state.botData.getBot(entry.name);
                    images.add(getLargeBotImageName(bot));
                }
            }
        }

        const imageNode = (
            <>
                {Array.from(images.values()).map((image) => (
                    <img key={image} className="wiki-bot-group-image" src={image} />
                ))}
            </>
        );

        const tempState = new ParserState(
            false,
            state.allEntries,
            state.botData,
            state.errors,
            state.headings,
            state.images,
            false,
            groupEntry.content,
            "All",
            state.itemData,
            state.spoiler,
        );

        processSection(tempState, undefined);

        // Only display the first paragraph of a page (up to the first separator)
        const firstSplitIdx = tempState.output.findIndex((outputGroup) => outputGroup.groupType === "Separator");
        if (firstSplitIdx !== -1) {
            tempState.output.splice(firstSplitIdx);
        }

        const id = getLinkSafeString(groupEntry.name);
        nodes.set(
            groupEntry.name,
            <>
                <h2 id={id} className="wiki-heading wiki-bot-group-heading">
                    {getLinkNode(state, groupEntry, groupEntry.name)}
                    {imageNode}
                    <LinkIcon href={`#${id}`} />
                </h2>
                {outputGroupsToHtml(tempState.output, false)}
            </>,
        );
    }

    for (const entryName of Array.from(nodes.keys()).sort()) {
        state.output.push({ groupType: "Individual", node: nodes.get(entryName)! });
    }

    state.index = result.index + result[0].length;
}

// Process a Color tag like [[Color:Red]]Red Text[[/Color]]
function processColorTag(state: ParserState, result: RegExpExecArray) {
    let color = result[2];

    if (color === undefined || color === "") {
        recordError(state, `Color tag with no color, has been marked cyan`);
        color = "cyan";
    }
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inlineOnly = "InlineOnly";

    processSection(tempState, "/Color");
    state.index = tempState.index;
    const boldedContent = (
        <span style={{ color: color }}>{outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</span>
    );

    state.output.push({ groupType: "Grouped", node: boldedContent });
}

// Process a Comment tag like [[Comment]]Hidden Text[[/Comment]]
function processCommentTag(state: ParserState, result: RegExpExecArray) {
    const index = state.initialContent.indexOf("[[/Comment]]", result.index);
    state.index = index + "[[/Comment]]".length;
}

// Process an Expandable tag like [[Expandable]]Expandable Text[[/Expandable]]
function processExpandableTag(state: ParserState, result: RegExpExecArray) {
    let isOpen = result[2] === "Expanded" ? true : false;

    // Find [[/Expandable]] closing tag first
    const expandableResult = /\[\[\/Expandable\]\]/.exec(state.initialContent.substring(state.index));

    if (expandableResult === null) {
        // If we can't find the end tag then just skip over the opening image tag
        recordError(state, `Found expandable tag "${result[0]}" without close tag`);
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // First text contains header, second text contains content
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + expandableResult.index - result[0].length;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));

    if (split.length !== 2) {
        recordError(state, `There should be 1 | in expandable tag ${result[0]}`);
        state.index += result[0].length;
        return;
    }

    // Parse the summary text
    let tempState = ParserState.Clone(state);
    tempState.initialContent = split[0];
    tempState.inlineOnly = "InlineOnly";
    processSection(tempState, undefined);
    const summary = outputGroupsToHtml(tempState.output, state.inSpoiler, true);

    // Parse the details text
    const subSectionStart = result.index + result[0].length + tempState.index + 1;
    tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inSpoiler = state.inSpoiler;
    processSection(tempState, "/Expandable");
    state.index = tempState.index;

    const details = outputGroupsToHtml(tempState.output, state.inSpoiler);

    state.output.push({
        groupType: "Individual",
        node: (
            <div className="wiki-expandable">
                <details open={isOpen}>
                    <summary>{summary}</summary>
                    <div>{details}</div>
                </details>
            </div>
        ),
    });
}

// Process a [[NonEmptyPages]]
function processNonEmptyPagesTag(state: ParserState, result: RegExpExecArray) {
    const listContents: { node: ReactNode; name: string }[] = [];
    const processedEntries = new Set<WikiEntry>();

    for (const groupEntry of state.allEntries.values()) {
        if (
            processedEntries.has(groupEntry) ||
            groupEntry.content.length < 20 ||
            !canShowSpoiler(groupEntry.spoiler, state.spoiler)
        ) {
            continue;
        }

        const listContent = <li key={groupEntry.name}>{getLinkNode(state, groupEntry, groupEntry.name)}</li>;
        processedEntries.add(groupEntry);
        listContents.push({ node: listContent, name: groupEntry.name });
    }

    listContents.sort((a, b) => a.name.localeCompare(b.name));

    state.output.push({
        groupType: "Individual",
        node: <ul className="wiki-list">{listContents.map((content) => content.node)}</ul>,
    });

    state.index = result.index + result[0].length;
}

// Process a PartGroupTable tag like [[PartGroupTable]]Flight Units[[/PartGroupTable]]
function processPartGroupTableTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/PartGroupTable]] closing tag first
    const closeResult = /\[\[\/PartGroupTable\]\]/.exec(state.initialContent.substring(state.index));

    if (closeResult === null) {
        // If we can't find the end tag then just skip over the opening tag
        recordError(state, `Found part group table tag without close tag`);
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // The first entry is the part group or supergroup
    // Following entries are columns to show
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + closeResult.index - result[0].length;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));

    if (split.length < 1) {
        recordError(state, `Found part group table without a part group`);
        state.index = endIndex + closeResult[0].length;
        return;
    }

    const partGroupName = split[0].trim();
    const groupEntry = state.allEntries.get(partGroupName);
    if (groupEntry === undefined) {
        recordError(state, `Found part group table with invalid group ${partGroupName}`);
        state.index = endIndex + closeResult[0].length;
        return;
    } else if (groupEntry.type !== "Part Group" && groupEntry.type !== "Part Supergroup") {
        recordError(state, `Found part group table with non-part group or supergroup ${partGroupName}`);
        state.index = endIndex + closeResult[0].length;
        return;
    }

    const partEntries = groupEntry
        .getAllDescendants()
        .filter((entry) => entry.canShowSpoiler(state.spoiler) && entry.type === "Part");
    const parts = partEntries.map((entry) => entry.extraData as Item);

    const columnDefs: GroupColumnDef<Item>[] = [];
    const nameColumnDef: ColumnDef<Item> = {
        accessorKey: "name",
        header: "Name",
        cell: (info) => <ItemLink item={info.row.original} text={info.getValue() as string} />,
    };
    const overviewColumnDef: GroupColumnDef<Item> = { header: "Overview", columns: [nameColumnDef] };

    const groupColumnDefs = new Map<string, GroupColumnDef<Item>>();
    groupColumnDefs.set(overviewColumnDef.header, overviewColumnDef);
    columnDefs.push(overviewColumnDef);

    for (const columnName of split.slice(1).map((name) => name.trim())) {
        const columnDef = allPartColumnDefs.get(columnName) as ColumnDef<Item>;

        if (columnDef === undefined) {
            recordError(state, `Found part column name ${columnName} that isn't supported`);
            continue;
        }

        const groupColumnName = columnName.split("/")[0];
        const groupColumnDef = groupColumnDefs.get(groupColumnName);

        if (groupColumnDef === undefined) {
            const newGroupColumnDef: GroupColumnDef<Item> = { header: groupColumnName, columns: [columnDef] };
            columnDefs.push(newGroupColumnDef);
            groupColumnDefs.set(groupColumnName, newGroupColumnDef);
        } else {
            groupColumnDef.columns!.push(columnDef);
        }
    }

    state.output.push({
        groupType: "Individual",
        node: (
            <SortingTable
                className="wiki-table wiki-sortable-table"
                columns={columnDefs}
                data={parts}
                stickyHeader={true}
            />
        ),
    });

    state.index = endIndex + closeResult[0].length;
}

// Process a GameText tag like [[GameText]]Text[[/GameText]]
function processGameTextTag(state: ParserState, result: RegExpExecArray) {
    // Process the heading subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inlineOnly = "InlineWithNewlines";
    processSection(tempState, "/GameText");
    state.index = tempState.index;
    const gameTextContent = (
        <span className="wiki-game-text">{outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</span>
    );

    state.output.push({ groupType: "Grouped", node: gameTextContent });
}

// Processes gallery tag like [[Gallery]]Image1.png|Image Caption|Image2.png|Image 2 caption[[/Gallery]]
function processGalleryTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/Gallery]] closing tag first
    const galleryResult = /\[\[\/(Gallery|FanartGallery)\]\]/.exec(state.initialContent.substring(state.index));

    if (galleryResult === null) {
        // If we can't find the end tag then just skip over the opening gallery tag
        recordError(state, `Found gallery tag without close tag`);
        state.index += result[0].length;
        return;
    }

    const isFanartGallery = galleryResult[1] === "FanartGallery";

    // Split interior text by |
    // Even numbered indices contain image filenames, odd numbers contain captions
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + galleryResult.index - result[0].length;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));
    state.index = endIndex + galleryResult[0].length;

    if (split.length < 2) {
        recordError(
            state,
            `Found gallery action without enough images/captions, there should always be an equal number of images and captions`,
        );
        return;
    }

    if (split.length % 2 !== 0) {
        // Just ignore the last image without a caption in this instance
        recordError(state, `Found gallery action without equal number of links/captions`);
    }

    const galleryItems: ReactNode[] = [];

    for (let i = 0; i < Math.floor(split.length / 2); i++) {
        let inSpoiler = state.inSpoiler;
        let imageName = split[2 * i];
        const imageCaption = split[2 * i + 1];

        const spoilerResult = /\[\[([^\]]*)]\]([^[]*)\[\[\/([^\]]*)\]\]/.exec(imageName);
        if (spoilerResult) {
            if (spoilerResult[1] === spoilerResult[3]) {
                if ((spoilerResult[1] as Spoiler) === "Spoiler" || (spoilerResult[1] as Spoiler) === "Redacted") {
                    const spoiler = spoilerResult[1] as Spoiler;

                    inSpoiler = !canShowSpoiler(spoiler, state.spoiler);
                    imageName = spoilerResult[2];
                } else {
                    recordError(state, `Found unsupported tag in ${imageName}, should only be Spoiler/Redacted here`);
                }
            } else {
                recordError(
                    state,
                    `Found mismatched start/end tags in image name ${imageName}, should only be Spoiler/Redacted`,
                );
            }
        }

        state.images.add(imageName);

        // Parse the image caption as a subsection individually so we can include links
        const tempState = ParserState.Clone(state);
        tempState.inlineOnly = "InlineWithNewlines";
        tempState.initialContent = imageCaption;
        processSection(tempState, undefined);
        const imageCaptionHtml = outputGroupsToHtml(tempState.output, state.inSpoiler);

        // Append image content HTML
        const path = createImagePath(`${imageName}`, `wiki_images/`);
        galleryItems.push(
            <div key={i}>
                {isFanartGallery ? imageCaptionHtml : undefined}
                <div>
                    <a className={inSpoiler ? "spoiler-image" : undefined} href={path} target="_blank" rel="noreferrer">
                        {inSpoiler && <div className="wiki-spoiler-image-text">SPOILER</div>}
                        <img
                            src={path}
                            onError={(event) => {
                                (event.target as HTMLImageElement).src = createImagePath(
                                    "wiki_images/Image Not Found.png",
                                );
                            }}
                        />
                    </a>
                </div>
                {isFanartGallery ? undefined : imageCaptionHtml}
            </div>,
        );
    }

    const galleryContent = (
        <div className={isFanartGallery ? "wiki-fanart-gallery-images" : "wiki-gallery-images"}>{galleryItems}</div>
    );

    state.output.push({
        groupType: "Individual",
        node: galleryContent,
    });
}

// Process a hacks tag like [[Hacks]]Terminal[[/Heading]]
function processHacksTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/Hacks]] closing tag first
    const hacksResult = /\[\[\/Hacks\]\]/.exec(state.initialContent.substring(state.index));

    if (hacksResult === null) {
        // If we can't find the end tag then just skip over the opening tag
        recordError(state, "Found hacks tag without close tag");
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // Even numbered indices contain image filenames, odd numbers contain captions
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + hacksResult.index - result[0].length;
    const machineType = state.initialContent.substring(startIndex, endIndex);

    state.index = endIndex + hacksResult[0].length;

    const machineHacks = hacks.find((machine) => machine.Name === machineType);
    if (machineHacks === undefined) {
        recordError(state, "Found hacks tag with invalid machine type");
    } else {
        const tableNode = (
            <table className="wiki-table">
                <tbody>
                    <tr>
                        <th>Hack name</th>
                        <th>Description</th>
                        <th>Base success rate</th>
                    </tr>
                    {machineHacks.Hacks.map(
                        (
                            hack: { BaseChance: number; Description: string; Name: string; SpoilerLevel?: string },
                            i: number,
                        ) => (
                            <tr
                                className={
                                    canShowSpoiler((hack.SpoilerLevel as Spoiler) || "None", state.spoiler)
                                        ? ""
                                        : "spoiler-text"
                                }
                                key={i}
                            >
                                <td className="wiki-cell-nowrap">
                                    <p>{hack.Name}</p>
                                </td>
                                <td>
                                    <p>{hack.Description}</p>
                                </td>
                                <td className="wiki-cell-center-align">
                                    <p>{hack.BaseChance}%</p>
                                </td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        );

        state.output.push({ groupType: "Individual", node: tableNode });
    }
}

// Process a heading tag like [[Heading]]Heading Text|Heading ID[[/Heading]]
// or like [[Heading:2]]Heading Text[[/Heading]]
function processHeadingTag(state: ParserState, result: RegExpExecArray) {
    let type = result[2];

    if (type === undefined) {
        type = "1";
    } else if (type !== "1" && type !== "2" && type !== "3" && type !== "4") {
        recordError(state, `Found bad heading type ${type}, should be 1, 2, 3, or 4`);
        type = "1";
    }

    // Find [[/Heading]] closing tag first
    const headingResult = /\[\[\/Heading\]\]/.exec(state.initialContent.substring(state.index));

    if (headingResult === null) {
        // If we can't find the end tag then just skip over the opening tag
        recordError(state, "Found heading tag without close tag");
        state.index += result[0].length;
        return;
    }

    // Split by |s to see if there is a separately defined ID
    const splitString = state.initialContent.substring(
        result.index + result[0].length,
        state.index + headingResult.index,
    );
    const split = splitOutsideActions(splitString);

    let string: string;
    let extraIndexOffset = 0;
    let id: string | undefined = undefined;

    if (split.length > 1) {
        if (split.length > 2) {
            recordError(state, "Found heading tag with multiple | characters, only 1 is supported");
        }

        // Found a bar means we have an explicitly defined ID
        string = split[0];
        id = createIdFromText(split[1]);
        extraIndexOffset = split[1].length + 1 + headingResult[0].length;
    } else {
        // No bar means no explicitly defined ID, use the heading text to
        // produce the ID
        string = state.initialContent.slice(
            state.index + result[0].length,
            state.index + headingResult.index + headingResult[0].length,
        );
    }

    // Process the heading subsection independently
    const tempState = ParserState.Clone(state);
    tempState.index = 0;
    tempState.inlineOnly = "InlineOnly";
    tempState.initialContent = string;
    processSection(tempState, "/Heading");
    state.index += result[0].length + tempState.index + extraIndexOffset;
    let headingContent = outputGroupsToHtml(tempState.output, state.inSpoiler, true);

    const { text: cleanedText, id: cleanedId } = cleanHeadingText(string);

    // Use the cleaned ID if no explicitly assigned ID
    if (id === undefined) {
        id = cleanedId;
    }

    if (state.allowHeadingLinks) {
        if (state.headings.find((heading) => heading.id === id)) {
            recordError(state, `Found duplicate heading ID ${id}`, result.index);
        } else {
            state.headings.push({
                id: id,
                indent: parseInt(type),
                text: cleanedText,
            });
        }
    }

    if (state.inSpoiler) {
        headingContent = <span className="spoiler-text spoiler-text-multiline">{headingContent}</span>;
    }

    const linkIcon = state.allowHeadingLinks && <LinkIcon href={`#${id}`} />;

    if (type === "1") {
        state.output.push({
            groupType: "Individual",
            node: (
                <h2 id={id} className="wiki-emphasized-heading">
                    {headingContent}
                    {linkIcon}
                </h2>
            ),
        });
    } else if (type === "2") {
        state.output.push({
            groupType: "Individual",
            node: (
                <h3 id={id} className="wiki-heading">
                    {headingContent}
                    {linkIcon}
                </h3>
            ),
        });
    } else if (type === "3") {
        state.output.push({
            groupType: "Individual",
            node: (
                <h4 id={id} className="wiki-heading">
                    {headingContent}
                    {linkIcon}
                </h4>
            ),
        });
    } else {
        state.output.push({
            groupType: "Individual",
            node: (
                <h5 id={id} className="wiki-heading">
                    {headingContent}
                    {linkIcon}
                </h5>
            ),
        });
    }
}

// Process a I tag like [[I]]Italicized Text[[/I]]
function processITag(state: ParserState, result: RegExpExecArray) {
    // Process the heading subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inlineOnly = "InlineOnly";
    processSection(tempState, "/I");
    state.index = tempState.index;
    const boldedContent = <i>{outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</i>;

    state.output.push({ groupType: "Grouped", node: boldedContent });
}

// Process an image link like [[Image]]ImageName.png|Optional Image Caption[[/Image]]
// Caption should probably be used but support no caption
function processImageTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/Image]] closing tag first
    const imageResult = /\[\[\/Image\]\]/.exec(state.initialContent.substring(state.index));

    if (imageResult === null) {
        // If we can't find the end tag then just skip over the opening image tag
        recordError(state, `Found image tag "${result[0]}" without close tag`);
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // Even numbered indices contain image filenames, odd numbers contain captions
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + imageResult.index - result[0].length;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));
    const imageName = split[0];

    state.images.add(imageName);

    // Determine if there is a caption or not
    let imageCaptionHtml: ReactNode;
    if (split.length === 1) {
        imageCaptionHtml = "";
    } else {
        if (split.length > 2) {
            recordError(state, `Found more than 1 | in image tag ${result[0]}`);
        }

        // Parse the image caption as a subsection individually so we can include links
        const tempState = ParserState.Clone(state);
        tempState.initialContent = split[1];
        tempState.inlineOnly = "InlineWithNewlines";
        processSection(tempState, undefined);
        imageCaptionHtml = outputGroupsToHtml(tempState.output, state.inSpoiler);
    }

    // Create the image with an optional caption
    const path = createImagePath(`${imageName}`, `wiki_images/`);
    state.output.push({
        groupType: "Individual",
        node: (
            <div className="wiki-sidebar-image">
                <a
                    className={state.inSpoiler ? "spoiler-image" : undefined}
                    href={path}
                    target="_blank"
                    rel="noreferrer"
                >
                    {state.inSpoiler && <div className="wiki-spoiler-image-text">SPOILER</div>}
                    <img
                        src={path}
                        onError={(event) => {
                            (event.target as HTMLImageElement).src = createImagePath("wiki_images/Image Not Found.png");
                        }}
                    />
                </a>
                {imageCaptionHtml}
            </div>
        ),
    });

    state.index = endIndex + imageResult[0].length;
}

const itemDetailsMap = new Map<
    string,
    {
        key?: string;
        isBoolean?: boolean;
        isChunks?: boolean;
        isCritical?: boolean;
        isNumber?: boolean;
        isDamage?: boolean;
        isExplosionDamage?: boolean;
    }
>([
    ["Image Name", {}],
    ["Name", {}],
    ["Type", {}],
    ["Slot", {}],
    ["Size", { isNumber: true }],
    ["Rating", { isNumber: true }],
    ["Rating Category", {}],
    ["Integrity", { isNumber: true }],
    ["Coverage", { isNumber: true }],
    ["Hackable", { isBoolean: true }],
    ["Mass", { isNumber: true }],
    ["Description", {}],
    ["Energy Upkeep", { isNumber: true }],
    ["Matter Upkeep", { isNumber: true }],
    ["Heat Generation", { isNumber: true }],
    ["Energy Generation", { isNumber: true }],
    ["Energy Storage", { isNumber: true }],
    ["Power Stability", { isNumber: true }],
    ["Time Per Move", { isNumber: true }],
    ["Drag", { isNumber: true }],
    ["Mod Per Extra", { isNumber: true }],
    ["Siege", {}],
    ["Energy Per Move", { isNumber: true }],
    ["Heat Per Move", { isNumber: true }],
    ["Support", { isNumber: true }],
    ["Penalty", { isNumber: true }],
    ["Burnout", {}],
    ["Range", { isNumber: true }],
    ["Shot Energy", { isNumber: true }],
    ["Shot Matter", { isNumber: true }],
    ["Shot Heat", { isNumber: true }],
    ["Recoil", { isNumber: true }],
    ["Targeting", { isNumber: true }],
    ["Delay", { isNumber: true }],
    ["Overload Stability", { isNumber: true }],
    ["Arc", { isNumber: true }],
    ["Waypoints", { isNumber: true }],
    ["Projectile Count", { isNumber: true }],
    ["Explosion Radius", { isDamage: true }],
    ["Damage", { isDamage: true }],
    ["Explosion Damage", { isExplosionDamage: true }],
    ["Falloff", { isNumber: true }],
    ["Chunks", { isChunks: true }],
    ["Damage Type", {}],
    ["Explosion Type", {}],
    ["Critical", { isCritical: true }],
    ["Penetration", {}],
    ["Spectrum", {}],
    ["Explosion Spectrum", {}],
    ["Disruption", { isNumber: true }],
    ["Explosion Disruption", { isNumber: true }],
    ["Heat Transfer", {}],
    ["Explosion Heat Transfer", {}],
    ["Salvage", { isNumber: true }],
    ["Explosion Salvage", { isNumber: true }],
]);
function processItemDetailsTag(state: ParserState, result: RegExpExecArray) {
    function getItemKey(inputName: string, key?: string) {
        if (key !== undefined) {
            return key;
        }

        return inputName[0].toLowerCase() + inputName.substring(1).replaceAll(" ", "");
    }

    // Find [[/ItemDetails]] closing tag first
    const closeResult = /\[\[\/ItemDetails\]\]/.exec(state.initialContent.substring(state.index));

    if (closeResult === null) {
        // If we can't find the end tag then just skip over the opening tag
        recordError(state, "Found item details tag without close tag");
        state.index += result[0].length;
        return;
    }

    // Split interior text by || to get each category
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + closeResult.index - result[0].length;
    const categoriesSplit = state.initialContent.substring(startIndex, endIndex).split("||");

    const item: Item = {
        slot: "N/A",
        hackable: false,
        name: "Item Name",
        noPrefixName: "",
        fullName: "",
        type: "Item",
        rating: 1,
        ratingString: "",
        ratingCategory: "None",
        categories: [],
        size: 1,
        integrity: 0,
        noRepairs: false,
        index: 0,
        penalty: 0,
        projectileCount: 1,
        range: 0,
        spoiler: "None",
        support: 0,
        timePerMove: 0,
        customItem: true,
    };

    // Process each category
    for (const categoryValues of categoriesSplit) {
        const split = categoryValues.split("|");

        const category = split[0].trim();
        if (split.length === 1) {
            recordError(state, `Item data category ${category} has no value`);
            continue;
        }

        const categoryData = itemDetailsMap.get(category);
        if (categoryData === undefined) {
            recordError(state, `Item data category ${category} is not expected`);
            continue;
        }

        let value: any = split[1].trim();

        if (categoryData.isNumber) {
            value = parseFloatOrUndefined(value);
            if (value === undefined) {
                recordError(state, `Item data category ${category} has invalid number ${split[1]}`);
                continue;
            }

            if (value === 0) {
                continue;
            }
        } else if (categoryData.isBoolean) {
            if (value === "True" || value === "true") {
                value = true;
            } else if (value === "False" || value === "false") {
                value = false;
            } else {
                recordError(state, `Item data category ${category} should be true or false but is neither`);
                value = false;
            }
        } else if (categoryData.isDamage || categoryData.isExplosionDamage) {
            const damageSplit = value.split("-");
            let damageMax: number;
            let damageMin: number;

            if (damageSplit.length === 1) {
                damageMin = parseIntOrDefault(damageSplit[0], 0);
                damageMax = damageMin;
            } else {
                damageMin = parseIntOrDefault(damageSplit[0], 0);
                damageMax = parseIntOrDefault(damageSplit[1], 0);
            }

            if (categoryData.isDamage) {
                (item as WeaponItem).damageMin = damageMin;
                (item as WeaponItem).damageMax = damageMax;
            } else {
                (item as WeaponItem).explosionDamageMin = damageMin;
                (item as WeaponItem).explosionDamageMax = damageMax;
            }
        } else if (categoryData.isCritical) {
            const result = /(\d*)% (\w*)/.exec(value);
            if (result !== null) {
                (item as WeaponItem).critical = parseIntOrDefault(result[1], 0);
                (item as WeaponItem).criticalType = result[2] as Critical;
            } else {
                recordError(state, `Item data category ${category} has invalid format. Should be like "x% type"`);
            }

            continue;
        } else if (categoryData.isChunks) {
            const chunkSplit = value.split("-");
            let minChunks: number;
            let maxChunks: number;

            if (chunkSplit.length === 1) {
                minChunks = parseIntOrDefault(chunkSplit[0], 0);
                maxChunks = minChunks;
            } else {
                minChunks = parseIntOrDefault(chunkSplit[0], 0);
                maxChunks = parseIntOrDefault(chunkSplit[1], 0);
            }

            (item as WeaponItem).maxChunks = maxChunks;
            (item as WeaponItem).minChunks = minChunks;
            continue;
        }

        // Assign the value to the item
        item[getItemKey(category, categoryData?.key)] = value;
    }

    state.index = endIndex + closeResult[0].length;
    const content = (
        <div className="wiki-infobox wiki-infobox-centered">
            <ItemDetails item={item} />
        </div>
    );

    state.output.push({
        groupType: "Individual",
        node: content,
    });
}

// Processes list tag like [[List]]Item 1|Item 2|Item 3[[/List]]
function processListTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/List]] closing tag first
    const listResult = /\[\[\/List\]\]/.exec(state.initialContent.substring(state.index));

    if (listResult === null) {
        // If we can't find the end tag then just skip over the opening tag
        recordError(state, `Found list tag without close tag`);
        state.index += result[0].length;
        return;
    }

    let ordered = false;
    if (result[2] === "Ordered") {
        ordered = true;
    } else if (result[2] !== undefined && result[2] !== "Unordered") {
        recordError(
            state,
            `Found list with invalid type ${result[2]}, type should be "Ordered", "Unordered", or empty (defaults to Unordered)`,
        );
    }

    // Split interior text by | to get list items
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + listResult.index - result[0].length;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));

    const listItems: ReactNode[] = [];

    for (let i = 0; i < split.length; i++) {
        const listItem = split[i].trim();

        // Parse the list item as a subsection individually
        const tempState = ParserState.Clone(state);
        tempState.initialContent = listItem;
        tempState.inlineOnly = "InlineWithNewlines";
        processSection(tempState, undefined);
        const listItemHtml = outputGroupsToHtml(tempState.output, state.inSpoiler, true, false);

        // Append list item HTML
        if (state.inSpoiler) {
            listItems.push(
                <li key={i}>
                    <span className="spoiler-text spoiler-text-multiline">{listItemHtml}</span>
                </li>,
            );
        } else {
            listItems.push(<li key={i}>{listItemHtml}</li>);
        }
    }

    const listContent = ordered ? (
        <ol className="wiki-list">{listItems}</ol>
    ) : (
        <ul className="wiki-list">{listItems}</ul>
    );

    state.output.push({
        groupType: "Individual",
        node: listContent,
    });

    state.index = endIndex + listResult[0].length;
}

// Found a [[X]] or [[X|Y]] link, make sure we can link properly
function processLinkTag(state: ParserState, result: RegExpExecArray) {
    function isExternalLink() {
        return result[0].includes("http");
    }

    let split: string[];
    if (isExternalLink()) {
        // If the link is external, check if we need to re-add the : since it
        // gets removed by the regex earlier
        if (result[2] !== undefined) {
            split = (result[1] + ":" + result[2]).replace("{{", "[").replace("}}", "]").split("|");
        } else {
            split = result[1].replace("{{", "[").replace("}}", "]").split("|");
        }
    } else {
        // Remove the earlier substituted {{ and }}s for their proper [ and ] counterparts
        split = result[1].replace("{{", "[").replace("}}", "]").split("|");
    }

    let linkTarget: string | undefined = split[0];
    let linkText = linkTarget.split("#")[0];
    if (split.length > 1) {
        linkText = split[1];

        if (split.length > 2) {
            recordError(state, `Too many | in link`);
        }
    }

    let referenceEntry: WikiEntry | undefined;

    const hashSplit = linkTarget.split("#");
    if (hashSplit.length > 1 && state.allEntries.get(hashSplit[0]) !== undefined) {
        // Need to split # portion out in order to convert to the real heading ID
        referenceEntry = state.allEntries.get(hashSplit[0]);

        linkTarget = `/${getLinkSafeString(hashSplit[0])}#${createIdFromText(hashSplit[1])}`;

        if (split.length > 2) {
            recordError(state, "Too many # in link");
        }
    } else {
        referenceEntry = state.allEntries.get(linkTarget);

        if (referenceEntry !== undefined) {
            linkTarget = `/${getLinkSafeString(linkTarget)}`;
        }
    }

    if (referenceEntry !== undefined) {
        const html = getLinkNode(state, referenceEntry, linkText, linkTarget);

        state.output.push({
            groupType: "Grouped",
            node: html,
        });
    } else if (linkTarget.startsWith("~/")) {
        state.output.push({
            groupType: "Grouped",
            node: <HashLink to={`~/${rootDirectory}/${linkTarget.slice(2)}`}>{linkText}</HashLink>,
        });
    } else if (isExternalLink()) {
        state.output.push({
            groupType: "Grouped",
            node: (
                <a className="wiki-link" href={linkTarget}>
                    {linkText}
                </a>
            ),
        });
    } else {
        recordError(state, `Bad link to page "${linkTarget}" that doesn't exist`);
        state.output.push({
            groupType: "Grouped",
            node: linkTarget,
        });
    }

    state.index += result[0].length;
}

// Process an lore tag like [[Lore:Lore]]Lore Group|Entry name/number[[/Lore]]
// See lore.json
function processLoreTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/Lore]] closing tag first
    const loreResult = /\[\[\/Lore\]\]/.exec(state.initialContent.substring(state.index));

    if (loreResult === null) {
        // If we can't find the end tag then just skip over the opening lore tag
        recordError(state, `Found lore tag "${result[0]}" without close tag`);
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // Even numbered indices contain image filenames, odd numbers contain captions
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + loreResult.index - result[0].length;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));
    const groupName = split[0];
    const entryName = split[1];

    state.index = endIndex + loreResult[0].length;

    // Make sure we have a group name and entry name
    if (split.length !== 2) {
        recordError(state, "Lore entry should have a group and entry name");
        state.index += result[0].length;
        return;
    }

    // Get group and entry
    const group = lore.find((group) => group.Name === groupName);
    if (!group) {
        recordError(state, `Lore group name ${groupName} is not valid, see lore.json for valid groups`);
        return;
    }

    const entry = group.Entries.find((obj) => obj["Name/Number"] === entryName);
    if (entry === undefined) {
        recordError(state, `Lore group name ${groupName} doesn't contain entry with name/number ${entryName}`);
        return;
    }

    // Create the lore with an optional caption
    state.output.push({ groupType: "Separator", node: undefined });
    if (groupName == "0b10 Records") {
        state.output.push({
            groupType: "Grouped",
            node: <span className="wiki-game-text">&gt;Query({entryName})</span>,
        });
        state.output.push({ groupType: "Separator", node: undefined });
    } else if (groupName == "WAR.Sys Records") {
        state.output.push({
            groupType: "Grouped",
            node: <span className="wiki-game-text">Intel &quot;{entryName}&quot;</span>,
        });
        state.output.push({ groupType: "Separator", node: undefined });
    }
    state.output.push({
        groupType: "Grouped",
        node: <span className="wiki-game-text">{entry["Content"]}</span>,
    });
    state.output.push({ groupType: "Separator", node: undefined });
}

const actionMap: Map<string, (state: ParserState, result: RegExpExecArray) => void> = new Map([
    ["AllLocations", processAllLocationsTag],
    ["B", processBTag],
    ["BotDetails", processBotDetailsTag],
    ["BotGroups", processBotGroupsTag],
    ["Color", processColorTag],
    ["Comment", processCommentTag],
    ["Expandable", processExpandableTag],
    ["FanartGallery", processGalleryTag],
    ["GameText", processGameTextTag],
    ["Gallery", processGalleryTag],
    ["Hacks", processHacksTag],
    ["Heading", processHeadingTag],
    ["I", processITag],
    ["Image", processImageTag],
    ["ItemDetails", processItemDetailsTag],
    ["List", processListTag],
    ["Lore", processLoreTag],
    ["NonEmptyPages", processNonEmptyPagesTag],
    ["PartGroupTable", processPartGroupTableTag],
    ["Spoiler", processSpoilerTag],
    ["SpoilerExpandable", processSpoilerExpandableTag],
    ["SpoilerHidden", processSpoilerHiddenTag],
    ["Sub", processSubTag],
    ["Sup", processSupTag],
    ["Redacted", processSpoilerTag],
    ["RedactedExpandable", processSpoilerExpandableTag],
    ["RedactedHidden", processSpoilerHiddenTag],
    ["Table", processTableTag],
    ["TooltipText", processTooltipText],
]);

// Processes the current section of text in the parser state
function processSection(state: ParserState, endTag: string | undefined) {
    // Global regex for actions in the form of [[X]] or [[X:Y]]
    const actionRegex = /\[\[([^\]:]*)(?::([^\]]*))?\]\]/g;

    function restoreBrackets(text: string) {
        // Needed to undo the escaping added at the start of createContentHtml
        return text.replaceAll("{{", "[").replaceAll("}}", "]");
    }

    let result: RegExpExecArray | null;
    while ((result = actionRegex.exec(state.initialContent))) {
        if (state.index > result.index) {
            // Skip over results we've already processed
            continue;
        }

        // Process newlines before actions
        let newlineIndex: number;
        while ((newlineIndex = state.initialContent.indexOf("\n", state.index)) !== -1 && newlineIndex < result.index) {
            if (state.inlineOnly === "InlineOnly") {
                // If inline only don't allow separated content
                recordError(state, "Newlines are not supported inside the current action", state.index);
            } else {
                state.output.push({
                    groupType: "Grouped",
                    node: restoreBrackets(state.initialContent.substring(state.index, newlineIndex)),
                });
                state.output.push({ groupType: "Separator", node: undefined });
            }

            state.index = newlineIndex + 1;
        }

        if (state.index < result.index) {
            // Append any content we've skipped processing, this should
            // just be plain text
            state.output.push({
                groupType: "Grouped",
                node: restoreBrackets(state.initialContent.substring(state.index, result.index)),
            });
            state.index = result.index;
        }

        if (result[1].startsWith("/")) {
            // Found an end tag like [[/X]], make sure it matches what we're expecting
            if (result[1] === endTag) {
                state.index += result[0].length;

                return;
            } else {
                recordError(state, `Found mismatched end tag ${result[1]} with expected tag ${endTag}`);
                state.index += result[0].length;
            }
        } else {
            const actionFunc = actionMap.get(result[1]);

            if (state.inlineOnly === "InlineOnly" || state.inlineOnly === "InlineWithNewlines") {
                // In some sections only specific inline tags are allowed
                // Check for a allowed tags first, then for any matched but forbidden tags
                if (
                    result[1] === "Spoiler" ||
                    result[1] === "Redacted" ||
                    result[1] === "B" ||
                    result[1] === "I" ||
                    result[1] === "GameText" ||
                    result[1] === "Sub" ||
                    result[1] === "Sup" ||
                    result[1] === "Link" ||
                    result[1] === "Color" ||
                    result[1] === "Comment" ||
                    result[1] === "TooltipText"
                ) {
                    actionFunc!(state, result);
                } else if (actionFunc !== undefined) {
                    recordError(
                        state,
                        `Found action tag ${result[1]} in scope where only links ` +
                            `and inline tags like bold/italics are allowed`,
                    );
                } else {
                    processLinkTag(state, result);
                }
            } else if (actionFunc !== undefined) {
                // Found match, process tag
                actionFunc(state, result);
            } else {
                // No match, assume it's a link
                processLinkTag(state, result);
            }
        }
    }

    // Split out all remaining newlines
    let newlineIndex: number;
    while ((newlineIndex = state.initialContent.indexOf("\n", state.index)) !== -1) {
        state.output.push({
            groupType: "Grouped",
            node: state.initialContent.substring(state.index, newlineIndex).replace("{{", "[").replace("}}", "]"),
        });
        state.output.push({ groupType: "Separator", node: undefined });

        state.index = newlineIndex + 1;
    }

    // Append rest of content as regular text
    if (state.index < state.initialContent.length) {
        state.output.push({
            groupType: "Grouped",
            node: state.initialContent.substring(state.index).replace("{{", "[").replace("}}", "]"),
        });
        state.index = state.initialContent.length;
    }
}

// Process a spoiler tag like [[Spoiler]]Text[[/Spoiler]] or [[Redacted]]Text[[/Redacted]]
function processSpoilerTag(state: ParserState, result: RegExpExecArray) {
    // Process the spoiler subsection independently
    const inSpoiler = !canShowSpoiler(result[1] as Spoiler, state.spoiler);
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inSpoiler = inSpoiler;
    processSection(tempState, result[1] === "Spoiler" ? "/Spoiler" : "/Redacted");
    state.index = tempState.index;

    let startIndex = 0;
    while (startIndex < tempState.output.length) {
        let count = 1;

        // Spoiler groups are a little special and we can't combine everything
        // into a single output node because we allow for splitting spoiler
        // content across multiple groups/paragraphs. Naively pushing all
        // content to the top level results in invalid constructs like nested
        // <p> tags. Instead, manually generate the output for grouped content
        // and then add each group to the top-level instead.
        // The reason we need to add additional groupings at this level is
        // because there is more special case spoiler-behavior at the
        // outputGroupsToHtml level, and we would lose the context of being
        // inside a spoiler block at the top level
        while (
            startIndex + count < tempState.output.length &&
            tempState.output[startIndex + count].groupType === "Grouped"
        ) {
            count++;
        }

        const content = outputGroupsToHtml(
            tempState.output.slice(startIndex, startIndex + count),
            inSpoiler,
            true,
            true,
        );

        state.output.push({
            groupType: tempState.output[startIndex].groupType,
            node: content,
        });

        startIndex += count;
    }
}

// Process a SpoilerExpandable tag like [[SpoilerExpandable]]Expandable Text[[/SpoilerExpandable]]
// Creates an expandable tag if the spoiler
function processSpoilerExpandableTag(state: ParserState, result: RegExpExecArray) {
    let redacted = result[1] === "RedactedExpandable" ? true : false;

    // Find [[/Expandable]] closing tag first
    const expandableResult = redacted
        ? /\[\[\/RedactedExpandable\]\]/.exec(state.initialContent.substring(state.index))
        : /\[\[\/SpoilerExpandable\]\]/.exec(state.initialContent.substring(state.index));

    if (expandableResult === null) {
        // If we can't find the end tag then just skip over the opening image tag
        recordError(state, `Found expandable tag "${result[0]}" without close tag`);
        state.index += result[0].length;
        return;
    }

    // Parse the details text
    const tempState = ParserState.Clone(state);
    tempState.index = result.index + result[0].length;
    tempState.inSpoiler = state.inSpoiler;
    processSection(tempState, `/${result[1]}`);
    state.index = tempState.index;

    const details = outputGroupsToHtml(tempState.output, state.inSpoiler);

    const spoiler: Spoiler = redacted ? "Redacted" : "Spoiler";
    if (canShowSpoiler(spoiler, state.spoiler)) {
        // If we can show the designated spoiler level, show the processed text as usual
        state.output.push({
            groupType: "Individual",
            node: details,
        });
    } else {
        // If we can't show the spoiler level, place it in an expandable details block
        state.output.push({
            groupType: "Individual",
            node: (
                <div className="wiki-expandable">
                    <details>
                        <summary>{`Reveal ${redacted ? "redacted spoiler" : "spoiler"} content`}</summary>
                        <div>{details}</div>
                    </details>
                </div>
            ),
        });
    }
}

// Process a spoiler hidden tag like [[SpoilerHidden]]Text[[/SpoilerHidden]]
// This is the inverse of the spoiler/redacted tags
function processSpoilerHiddenTag(state: ParserState, result: RegExpExecArray) {
    const spoilerToHide: Spoiler = result[1] === "RedactedHidden" ? "Redacted" : "Spoiler";
    // Hide SpoilerHidden for both Spoiler and Redacted
    // Hide RedactedHidden for Redacted only
    const show = !canShowSpoiler(spoilerToHide, state.spoiler);

    // Process the subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inSpoiler = state.inSpoiler;
    processSection(tempState, result[1] === "RedactedHidden" ? "/RedactedHidden" : "/SpoilerHidden");
    state.index = tempState.index;

    const content = outputGroupsToHtml(tempState.output, state.inSpoiler);

    if (show) {
        state.output.push({
            groupType: "Individual",
            node: content,
        });
    }
}

// Process a Sub tag like [[Sub]]Subscript Text[[/Sub]]
function processSubTag(state: ParserState, result: RegExpExecArray) {
    // Process the subscript subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inlineOnly = "InlineOnly";
    processSection(tempState, "/Sub");
    state.index = tempState.index;
    const subscriptContent = <sub>{outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</sub>;

    state.output.push({ groupType: "Grouped", node: subscriptContent });
}

// Process a Sup tag like [[Sup]]Superscript Text[[/Sup]]
function processSupTag(state: ParserState, result: RegExpExecArray) {
    // Process the superscript subsection independently
    const supSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = supSectionStart;
    tempState.inlineOnly = "InlineOnly";
    processSection(tempState, "/Sup");
    state.index = tempState.index;
    const superscriptContent = <sup>{outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</sup>;

    state.output.push({ groupType: "Grouped", node: superscriptContent });
}

// Processes table tag like [[Table]]Header 1|Header 2||Item 1|Item 2||Item 3|Item 4[[/Table]]
function processTableTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/Table]] closing tag first
    const tableResult = /\[\[\/Table\]\]/.exec(state.initialContent.substring(state.index));

    if (tableResult === null) {
        // If we can't find the end tag then just skip over the opening tag
        recordError(state, "Found table tag without close tag");
        state.index += result[0].length;
        return;
    }

    // Split interior text by || to get each row
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + tableResult.index - result[0].length;
    const rowSplit = splitOutsideActions(state.initialContent.substring(startIndex, endIndex), "||");

    let headerRow: ReactNode = undefined;
    const tableRows: ReactNode[] = [];

    let isHeaderRow = true;
    let totalColumnCount = 0;
    let _row = 0;

    // Parse each row
    for (let i = 0; i < rowSplit.length; i++) {
        const tableRow = rowSplit[i];
        const cellSplit = splitOutsideActions(tableRow);

        if (isHeaderRow) {
            totalColumnCount = cellSplit.length;
        }

        const cells: ReactNode[] = [];

        let currentColumnCount = 0;
        for (let j = 0; j < cellSplit.length; j++) {
            let cell = cellSplit[j];

            let cellStyle: string | undefined = undefined;
            const cellStyleResult = /\[\[CellStyle:(.*?)\]\]/.exec(cell);
            if (cellStyleResult !== null) {
                if (cellStyleResult[1] === "Good") {
                    cellStyle = "wiki-cell-good";
                } else if (cellStyleResult[1] === "Neutral") {
                    cellStyle = "wiki-cell-neutral";
                } else if (cellStyleResult[1] === "Bad") {
                    cellStyle = "wiki-cell-bad";
                } else {
                    recordError(
                        state,
                        `Found invalid table cell style ${cellStyleResult[1]}, expected types are Good Neutral and Bad`,
                    );
                }

                cell = cell.substring(cellStyleResult.index + cellStyleResult[0].length);
            }

            let cellSpan: number | undefined = undefined;
            const cellSpanResult = /\[\[CellSpan:(.*?)\]\]/.exec(cell);
            if (cellSpanResult !== null) {
                cellSpan = parseIntOrDefault(cellSpanResult[1], 1);

                cell = cell.substring(cellSpanResult.index + cellSpanResult[0].length);
                currentColumnCount += parseIntOrDefault(cellSpanResult[1], 1);
            } else {
                currentColumnCount += 1;
            }

            const tempState = ParserState.Clone(state);
            tempState.initialContent = cell;
            tempState.inlineOnly = "InlineWithNewlines";
            processSection(tempState, undefined);
            const cellHtml = outputGroupsToHtml(tempState.output, state.inSpoiler, false, false);

            if (state.inSpoiler) {
                if (cellStyle !== undefined) {
                    cellStyle += " spoiler-text";
                } else {
                    cellStyle = "spoiler-text";
                }
            }

            // Append cell HTML
            if (isHeaderRow) {
                cells.push(
                    <th key={j} className={cellStyle} colSpan={cellSpan}>
                        <div>{cellHtml}</div>
                    </th>,
                );
            } else {
                cells.push(
                    <td key={j} className={cellStyle} colSpan={cellSpan}>
                        {cellHtml}
                    </td>,
                );
            }
        }

        if (currentColumnCount != totalColumnCount) {
            for (let j = currentColumnCount; j < totalColumnCount; j++) {
                let cellStyle = "";

                if (state.inSpoiler) {
                    cellStyle = "spoiler-text";
                }

                cells.push(<td key={j} className={cellStyle} />);
            }

            // Maybe reinstate this and add option to fill empty cells instead
            // recordError(
            //     state,
            //     `Found ${currentColumnCount} columns in row ${row + 1} but header had ${totalColumnCount}`,
            // );
        }

        if (headerRow === undefined) {
            headerRow = <tr>{cells}</tr>;
        } else {
            tableRows.push(<tr key={i}>{cells}</tr>);
        }

        isHeaderRow = false;
        _row += 1;
    }

    const tableContent = (
        <table className={`wiki-table${state.inSpoiler ? " spoiler-text spoiler-table" : ""}`}>
            <thead>{headerRow}</thead>
            <tbody>{tableRows}</tbody>
        </table>
    );

    state.output.push({
        groupType: "Individual",
        node: tableContent,
    });

    state.index = endIndex + tableResult[0].length;
}

// Process a TooltipText tag like [[TooltipText]]Tooltip Category[[/TooltipText]]
function processTooltipText(state: ParserState, result: RegExpExecArray) {
    const endIndex = state.initialContent.indexOf("[[/TooltipText]]");
    const category = state.initialContent.substring(result.index + result[0].length, endIndex);
    state.index = endIndex + "[[/TooltipText]]".length;

    if (category in TooltipTexts) {
        state.output.push({ groupType: "Grouped", node: TooltipTexts[category] });
    } else {
        recordError(state, `Tooltip text category ${category} doesn't exist.`);
        state.output.push({ groupType: "Grouped", node: category });
    }
}

// Records a parse error in the error list
function recordError(state: ParserState, error: string, position: number | undefined = undefined) {
    if (position === undefined) {
        position = state.index;
    }

    let contentString = state.initialContent.substring(position, position + 50).replace("\n", "\\n");
    if (state.initialContent.length - position - 50 > 0) {
        contentString += "...";
    }

    state.errors.push(`${error}: section starting with "${contentString}"`);
}

// Splits a string on |s but only outside of action tags
// Allows for parsing things like [[Image]]Image.png|Caption [[Link|with link]][[/Image]]
function splitOutsideActions(string: string, delimiter = "|") {
    let index = 0;

    let splitIndex = string.indexOf(delimiter);
    let actionStartIndex = string.indexOf("[[");

    if (splitIndex === -1) {
        // Nothing to split
        return [string];
    }

    if (actionStartIndex === -1) {
        // No brackets, don't need to do special split
        return string.split(delimiter);
    }

    const split: string[] = [];
    let currentString = "";

    while (true) {
        if (actionStartIndex === -1) {
            // No further brackets, just split remaining text normally and add to end
            const remainingSplit = string.substring(index).split(delimiter);
            remainingSplit[0] = currentString + remainingSplit[0];
            return split.concat(remainingSplit);
        }

        if (splitIndex === -1) {
            // No more splits found
            if (index < string.length) {
                currentString += string.substring(index);
                split.push(currentString);
            }

            return split;
        }

        if (splitIndex < actionStartIndex) {
            // Found split first and we're not in a tag
            currentString += string.substring(index, splitIndex);
            split.push(currentString);
            currentString = "";
            index = splitIndex + delimiter.length;

            splitIndex = string.indexOf(delimiter, index);
            continue;
        }

        // Found start tag before split, process tags until we're back to neutral
        currentString += string.substring(index, actionStartIndex + 2);
        index = actionStartIndex + 2;
        actionStartIndex = string.indexOf("[[", index);
        let actionEndIndex = string.indexOf("]]", index);
        let numTags = 1;
        while (numTags > 0) {
            if (actionEndIndex === -1) {
                // Didn't find proper end to tags, just give up now
                return split;
            }

            if (actionStartIndex !== -1 && (actionEndIndex === -1 || actionStartIndex < actionEndIndex)) {
                numTags += 1;
                currentString += string.substring(index, actionStartIndex + 2);
                index = actionStartIndex + 2;

                actionStartIndex = string.indexOf("[[", index);
            } else {
                // Found end tag, decrease num tags and continue
                numTags -= 1;
                currentString += string.substring(index, actionEndIndex + 2);
                index = actionEndIndex + 2;

                actionEndIndex = string.indexOf("]]", index);
            }
        }

        actionStartIndex = string.indexOf("[[", index);
        splitIndex = string.indexOf(delimiter, index);
    }
}
