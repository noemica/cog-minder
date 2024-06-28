import { Fragment, ReactNode } from "react";
import { Link } from "wouter";

import lore from "../../json/lore.json";
import { LinkIcon } from "../components/Icons/Icons";
import WikiTableOfContents, { WikiHeadingState } from "../components/Pages/WikiPage/WikiTableOfContents";
import { BotLink, ItemLink, LocationLink } from "../components/Pages/WikiPage/WikiTooltips";
import { Bot } from "../types/botTypes";
import { MapLocation, Spoiler } from "../types/commonTypes";
import { Item } from "../types/itemTypes";
import { WikiEntry } from "../types/wikiTypes";
import { BotData } from "./BotData";
import { ItemData } from "./ItemData";
import {
    canShowSpoiler,
    createImagePath,
    getBotImageName,
    getLinkSafeString,
    parseIntOrDefault,
    rootDirectory,
} from "./common";

// Output group types
// Grouped can be in the same <p> block
// Individual will always be separated into their own HTML
// A separator exists to artificially separate Grouped sections
type OutputGroupType = "Grouped" | "Individual" | "Separator";

type OutputGroup = {
    node: ReactNode | undefined;
    groupType: OutputGroupType;
};

type AllowedContentType = "InlineOnly" | "InlineList" | "All";

class ParserState {
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

    // Replace all spaces with underscore since spaces are technically not allowed
    // Then strip out all chars except for alphabetical and -/_s.
    const textId = cleanedText
        .replaceAll(" ", "_")
        .replaceAll(/[^\w-]/g, "")
        .toLowerCase();

    return { text: cleanedText, id: textId };
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
                    {headingLink ? <Link href={`/${getLinkSafeString(entry.name)}`}>{headingText}</Link> : headingText}
                    <LinkIcon href="#" />
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
export function createPreviewContent(content: string, spoilerState: Spoiler): string {
    const spoilerRegex = /(\[\[Spoiler\]\])(.*?)(\[\[\/Spoiler\]\])/s;
    const redactedRegex = /(\[\[Redacted\]\])(.*?)(\[\[\/Redacted\]\])/s;
    const imageRegex = /\[\[Image\]\](.*?)\[\[\/Image\]\]/s;

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

function getLinkNode(state: ParserState, referenceEntry: WikiEntry, linkText: string) {
    let node: ReactNode | undefined;

    if (referenceEntry.type === "Bot") {
        const bot = referenceEntry.extraData as Bot;
        node = <BotLink bot={bot} text={linkText} />;
    } else if (referenceEntry.type === "Location") {
        const location = referenceEntry.extraData as MapLocation;
        node = <LocationLink location={location} text={linkText} />;
    } else if (referenceEntry.type === "Part") {
        const item = referenceEntry.extraData as Item;
        node = <ItemLink item={item} text={linkText} />;
    } else {
        node = <Link href={`/${getLinkSafeString(referenceEntry.name)}`}>{linkText}</Link>;
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
    spoilers: Spoiler,
    itemData: ItemData,
    botData: BotData,
    groupSelection?: number,
) {
    const parseResult = createContentHtml(entry, allEntries, spoilers, false, itemData, botData);

    if (parseResult.errors.length > 0) {
        console.log(`Errors while parsing ${entry.name}`);

        for (const error of parseResult.errors) {
            console.log(`Parse error: ${error}`);
        }
    }

    if (entry.parentGroup !== undefined) {
        const parentParseResult = createContentHtml(entry.parentGroup, allEntries, spoilers, true, itemData, botData);

        if (parentParseResult.errors.length > 0) {
            console.log(`Errors while parsing ${entry.name}`);

            for (const error of parentParseResult.errors) {
                console.log(`Parse error: ${error}`);
            }
        }

        // Merge the parent parse results with the main parse results
        parseResult.node = (
            <>
                {parentParseResult.node}
                {parseResult.node}
            </>
        );
        parseResult.errors = parseResult.errors.concat(parentParseResult.errors);

        for (const image of parentParseResult.images) {
            parseResult.images.add(image);
        }
    } else if ((entry.type === "Bot Group" || entry.type === "Part Group") && groupSelection !== undefined) {
        const childParseResult = createContentHtml(
            (entry.extraData as WikiEntry[])[groupSelection],
            allEntries,
            spoilers,
            true,
            itemData,
            botData,
        );

        if (childParseResult.errors.length > 0) {
            console.log(`Errors while parsing ${entry.name}`);

            for (const error of childParseResult.errors) {
                console.log(`Parse error: ${error}`);
            }
        }

        // Merge the parent parse results with the main parse results
        parseResult.node = (
            <>
                {parseResult.node}
                {childParseResult.node}
            </>
        );
        parseResult.errors = parseResult.errors.concat(childParseResult.errors);

        for (const image of childParseResult.images) {
            parseResult.images.add(image);
        }
    }

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
            <tbody>
                <tr>
                    <th>Location Name</th>
                    <th>Main Floor/Branch</th>
                    <th>Depths</th>
                </tr>
                {locationRows}
            </tbody>
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

// Process a [[BotGroups]][[/BotGroups]] tag
function processBotGroupsTag(state: ParserState, result: RegExpExecArray) {
    for (const groupEntry of state.allEntries.values()) {
        if (groupEntry.type !== "Bot Group" || !canShowSpoiler(groupEntry.spoiler, state.spoiler)) {
            continue;
        }

        // Get list of images to display
        const images = new Set<string>();
        for (const entry of state.allEntries.values()) {
            if (entry.parentGroup === groupEntry) {
                const bot = state.botData.getBot(entry.name);
                images.add(getBotImageName(bot));
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

        const content = (
            <>
                <h2 className="wiki-heading wiki-bot-group-heading">
                    {getLinkNode(state, groupEntry, groupEntry.name)}
                    {imageNode}
                </h2>
                {outputGroupsToHtml(tempState.output, false)}
            </>
        );

        state.output.push({ groupType: "Individual", node: content });
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

// Process a [[NonEmptyPages]][[/NonEmptyPages]] tag
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

// Process a GameText tag like [[GameText]]Text[[/GameText]]
function processGameTextTag(state: ParserState, result: RegExpExecArray) {
    // Process the heading subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inlineOnly = "InlineOnly";
    processSection(tempState, "/GameText");
    state.index = tempState.index;
    const gameTextContent = (
        <span className="wiki-game-text">{outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</span>
    );
    // TODO still get the {{/}}s in here, will need to unescape
    // .replace("{{", "[")
    // .replace("}}", "]");

    state.output.push({ groupType: "Grouped", node: gameTextContent });
}

// Processes gallery tag like [[Gallery]]Image1.png|Image Caption|Image2.png|Image 2 caption[[/Gallery]]
function processGalleryTag(state: ParserState, result: RegExpExecArray) {
    // Find [[/Gallery]] closing tag first
    const galleryResult = /\[\[\/Gallery\]\]/.exec(state.initialContent.substring(state.index));

    if (galleryResult === null) {
        // If we can't find the end tag then just skip over the opening gallery tag
        recordError(state, `Found gallery tag without close tag`);
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // Even numbered indices contain image filenames, odd numbers contain captions
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + galleryResult.index - result[0].length;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));

    if (split.length < 2) {
        recordError(
            state,
            `Found gallery action without enough images/captions, there should always be an equal number of images and captions`,
        );
        state.index = endIndex + galleryResult[0].length;
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
        tempState.inlineOnly = "InlineOnly";
        tempState.initialContent = imageCaption;
        processSection(tempState, undefined);
        const imageCaptionHtml = outputGroupsToHtml(tempState.output, state.inSpoiler);

        // Append image content HTML
        const path = createImagePath(`${imageName}`, `wiki_images/`);
        galleryItems.push(
            <div key={i}>
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
                {imageCaptionHtml}
            </div>,
        );
    }

    const galleryContent = <div className="wiki-gallery-images">{galleryItems}</div>;

    state.output.push({
        groupType: "Individual",
        node: galleryContent,
    });

    state.index = endIndex + galleryResult[0].length;
}

// Process a heading tag like [[Heading]]Heading Text[[/Heading]]
// or like [[Heading:2]]Heading Text[[/Heading]]
function processHeadingTag(state: ParserState, result: RegExpExecArray) {
    let type = result[2];

    if (type === undefined) {
        type = "1";
    } else if (type !== "1" && type !== "2" && type !== "3" && type !== "4") {
        recordError(state, `Found bad heading type ${type}, should be 1, 2, 3, or 4`);
        type = "1";
    }

    // Process the heading subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState = ParserState.Clone(state);
    tempState.index = subSectionStart;
    tempState.inlineOnly = "InlineOnly";
    processSection(tempState, "/Heading");
    state.index = tempState.index;
    let headingContent = outputGroupsToHtml(tempState.output, state.inSpoiler, true);

    const { text: cleanedText, id } = cleanHeadingText(
        state.initialContent.slice(subSectionStart, state.index - "[[/Heading]]".length),
    );

    if (state.headings.find((heading) => heading.id === id)) {
        recordError(state, `Found duplicate heading ID ${id}`, result.index);
    } else {
        state.headings.push({
            id: id,
            indent: parseInt(type),
            text: cleanedText,
        });
    }

    if (state.inSpoiler) {
        headingContent = <span className="spoiler-text spoiler-text-multiline">{headingContent}</span>;
    }

    if (type === "1") {
        state.output.push({
            groupType: "Individual",
            node: (
                <h2 id={id} className="wiki-emphasized-heading">
                    {headingContent}
                    <LinkIcon href={`#${id}`} />
                </h2>
            ),
        });
    } else if (type === "2") {
        state.output.push({
            groupType: "Individual",
            node: (
                <h3 id={id} className="wiki-heading">
                    {headingContent}
                    <LinkIcon href={`#${id}`} />
                </h3>
            ),
        });
    } else if (type === "3") {
        state.output.push({
            groupType: "Individual",
            node: (
                <h4 id={id} className="wiki-heading">
                    {headingContent}
                    <LinkIcon href={`#${id}`} />
                </h4>
            ),
        });
    } else {
        state.output.push({
            groupType: "Individual",
            node: (
                <h5 id={id} className="wiki-heading">
                    {headingContent}
                    <LinkIcon href={`#${id}`} />
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
        tempState.inlineOnly = "InlineOnly";
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
        const listItem = split[i];

        // Parse the list item as a subsection individually
        const tempState = ParserState.Clone(state);
        tempState.initialContent = listItem;
        tempState.inlineOnly = "InlineList";
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
    // Remove the earlier substituted {{ and }}s for their proper [ and ] counterparts
    const split = result[1].replace("{{", "[").replace("}}", "]").split("|");

    const linkTarget = split[0];
    let linkText = linkTarget;
    if (split.length > 1) {
        linkText = split[1];

        if (split.length > 2) {
            recordError(state, `Too many | in link`);
        }
    }

    const referenceEntry = state.allEntries.get(linkTarget);
    if (referenceEntry !== undefined) {
        const html = getLinkNode(state, referenceEntry, linkText);

        state.output.push({
            groupType: "Grouped",
            node: html,
        });
    } else if (linkTarget.startsWith("~/")) {
        state.output.push({
            groupType: "Grouped",
            node: <Link href={`~/${rootDirectory}/${linkTarget.slice(2)}`}>{linkText}</Link>,
        });
    } else if (linkTarget.includes(".htm") || linkTarget.startsWith("http")) {
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
    ["B", processBTag],
    ["BotGroups", processBotGroupsTag],
    ["Color", processColorTag],
    ["GameText", processGameTextTag],
    ["Gallery", processGalleryTag],
    ["Heading", processHeadingTag],
    ["I", processITag],
    ["Image", processImageTag],
    ["List", processListTag],
    ["AllLocations", processAllLocationsTag],
    ["Lore", processLoreTag],
    ["NonEmptyPages", processNonEmptyPagesTag],
    ["Spoiler", processSpoilerTag],
    ["Sub", processSubTag],
    ["Sup", processSupTag],
    ["Redacted", processSpoilerTag],
    ["Table", processTableTag],
]);

// Processes the current section of text in the parser state
function processSection(state: ParserState, endTag: string | undefined) {
    // Global regex for actions in the form of [[X]] or [[X:Y]]
    const actionRegex = /\[\[([^\]:]*)(?::([^\]]*))?\]\]/g;

    let result: RegExpExecArray | null;
    while ((result = actionRegex.exec(state.initialContent))) {
        if (state.index > result.index) {
            // Skip over results we've already processed
            continue;
        }

        // Process newlines before actions
        let newlineIndex: number;
        while (
            (newlineIndex = state.initialContent.indexOf("\n", state.index)) &&
            newlineIndex !== -1 &&
            newlineIndex < result.index
        ) {
            if (state.inlineOnly === "InlineOnly") {
                // If inline only don't allow separated content
                recordError(state, `Found line break when only inline actions are allowed`);
            } else {
                state.output.push({
                    groupType: "Grouped",
                    node: state.initialContent.substring(state.index, newlineIndex),
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
                node: state.initialContent.substring(state.index, result.index),
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

            if (state.inlineOnly === "InlineOnly" || state.inlineOnly === "InlineList") {
                // In some sections only specific inline tags are allowed
                // Check for a allowed tags first, then for any matched but forbidden tags
                if (
                    result[1] === "Spoiler" ||
                    result[1] === "Redacted" ||
                    result[1] === "B" ||
                    result[1] === "I" ||
                    result[1] === "GameText" ||
                    result[1] === "Sub" ||
                    result[1] === "Sup"
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
    while ((newlineIndex = state.initialContent.indexOf("\n", state.index)) && newlineIndex !== -1) {
        state.output.push({
            groupType: "Grouped",
            node: state.initialContent.substring(state.index, newlineIndex),
        });
        state.output.push({ groupType: "Separator", node: undefined });

        state.index = newlineIndex + 1;
    }

    // Append rest of content as regular text
    if (state.index < state.initialContent.length) {
        state.output.push({
            groupType: "Grouped",
            node: state.initialContent.substring(state.index),
        });
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

    const tableRows: ReactNode[] = [];

    let isHeaderRow = true;
    let totalColumnCount = 0;
    let row = 0;

    // Parse each row
    for (let i = 0; i < rowSplit.length; i++) {
        const tableRow = rowSplit[i];
        const cellSplit = splitOutsideActions(tableRow);

        if (isHeaderRow) {
            totalColumnCount = cellSplit.length;
        }

        const cells: ReactNode[] = [];

        // tableContent += "<tr>";

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

                cell = cell.substring(cellStyleResult[0].length);
            }

            let cellSpan: number | undefined = undefined;
            const cellSpanResult = /\[\[CellSpan:(.*?)\]\]/.exec(cell);
            if (cellSpanResult !== null) {
                cellSpan = parseIntOrDefault(cellSpanResult[1], 1);

                cell = cell.substring(cellSpanResult[0].length);
                currentColumnCount += parseIntOrDefault(cellSpanResult[1], 1);
            } else {
                currentColumnCount += 1;
            }

            const tempState = ParserState.Clone(state);
            tempState.initialContent = cell;
            tempState.inlineOnly = "InlineOnly";
            processSection(tempState, undefined);
            const cellHtml = outputGroupsToHtml(tempState.output, state.inSpoiler, true, false);

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
                        {cellHtml}
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
            recordError(
                state,
                `Found ${currentColumnCount} columns in row ${row + 1} but header had ${totalColumnCount}`,
            );
        }

        tableRows.push(<tr key={i}>{cells}</tr>);

        isHeaderRow = false;
        row += 1;
    }

    const tableContent = (
        <table className={`wiki-table${state.inSpoiler ? " spoiler-text spoiler-table" : ""}`}>
            <tbody>{tableRows}</tbody>
        </table>
    );

    state.output.push({
        groupType: "Individual",
        node: tableContent,
    });

    state.index = endIndex + tableResult[0].length;
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
