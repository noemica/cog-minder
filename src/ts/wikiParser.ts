import * as lore from "../json/lore.json";
import {
    canShowSpoiler,
    getBot,
    createBotDataContent,
    getItem,
    createItemDataContent,
    escapeHtml,
    createLocationHtml,
} from "./common";
import { MapLocation, Spoiler } from "./commonTypes";
import { WikiEntry } from "./wikiTypes";

// Output group types
// Grouped can be in the same <p> block
// Individual will always be separated into their own HTML
// A separator exists to artificially separate Grouped sections
type OutputGroupType = "Grouped" | "Individual" | "Separator";

type OutputGroup = {
    html: string | undefined;
    groupType: OutputGroupType;
};

type AllowedContentType = "InlineOnly" | "InlineList" | "All";

class ParserState {
    allEntries: Map<string, WikiEntry>;
    errors: string[];
    images: Set<string>;
    inSpoiler: boolean;
    initialContent: string;
    index: number;
    inlineOnly: AllowedContentType;
    preview: boolean;
    output: OutputGroup[];
    spoiler: Spoiler;

    constructor(
        allEntries: Map<string, WikiEntry>,
        errors: string[],
        images: Set<string>,
        inSpoiler: boolean,
        initialContent: string,
        inlineOnly: AllowedContentType,
        preview: boolean,
        spoiler: Spoiler,
    ) {
        this.allEntries = allEntries;
        this.errors = errors;
        this.images = images;
        this.inSpoiler = inSpoiler;
        this.initialContent = initialContent;
        this.index = 0;
        this.inlineOnly = inlineOnly;
        this.output = [];
        this.preview = preview;
        this.spoiler = spoiler;
    }

    static Clone(state: ParserState): ParserState {
        return new ParserState(
            state.allEntries,
            state.errors,
            state.images,
            state.inSpoiler,
            state.initialContent,
            state.inlineOnly,
            state.preview,
            state.spoiler,
        );
    }
}

// Creates the HTML content of a wiki entry
export function createContentHtml(
    entry: WikiEntry,
    allEntries: Map<string, WikiEntry>,
    spoilerState: Spoiler,
    headingLink: boolean,
): { html: string; errors: string[]; images: Set<string> } {
    // Process each section into the same output groups

    // Process initial content by replacing any instances of [XYZ] in links with {{xyz}}
    // Otherwise we hae issues with the regex for any links that include square brackets in them
    const initialContent = entry.content.replace(/([^\[])\[([\w\/]*)\]/g, (_, p1, p2) => {
        return `${p1}{{${p2}}}`;
    });
    const state = new ParserState(allEntries, [], new Set<string>(), false, initialContent, "All", false, spoilerState);
    processSection(state, undefined);

    // Combine all alt names as part of the title
    const names = [entry.name];
    for (const name of entry.alternativeNames) {
        names.push(name);
    }

    const headingText = names.join("/");

    // Convert to HTML
    let outputHtml = outputGroupsToHtml(state.output, false);
    if (outputHtml === "") {
        outputHtml = "<p>There is no content here. Please consider contributing. See the home page for details.</p>";
    }
    return {
        html: `<h1 class="wiki-heading">${
            headingLink ? `<a href="#${entry.name}">${headingText}</a>` : headingText
        }</h1>${outputHtml}`,
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

    return content;
}

function getLinkHtml(state: ParserState, referenceEntry: WikiEntry, linkText: string) {
    let tooltipData = "";
    if (referenceEntry.type === "Bot") {
        // Add bot data content overlay
        const bot = getBot(referenceEntry.name);
        tooltipData = `data-html=true data-boundary="window" data-content='${createBotDataContent(
            bot,
            false,
        )}' data-toggle="popover" data-trigger="hover"`;
    } else if (referenceEntry.type === "Part") {
        // Add part data content overlay
        const item = getItem(referenceEntry.name);
        tooltipData = `data-html=true data-boundary="window" data-content='${createItemDataContent(
            item,
        )}' data-toggle="popover" data-trigger="hover"`;
    } else if (referenceEntry.type === "Location") {
        // Add location data content overlay
        tooltipData = `data-html=true data-boundary="window" data-content='${createLocationHtml(
            referenceEntry.extraData as MapLocation,
            state.spoiler,
            true,
        )}' data-toggle="popover" data-trigger="hover"`;
    }

    let html = `<a class="d-inline-block" href="#${referenceEntry.name}" ${tooltipData}>${linkText}</a>`;
    if (!canShowSpoiler(referenceEntry.spoiler, state.spoiler) && !state.inSpoiler) {
        // Auto-spoiler links that aren't in a proper spoiler block
        html = `<span class="spoiler-text spoiler-text-multiline">${html}</span>`;
    }

    return html;
}

// Turns a list of output groups into HTML
// If startInGroup is true then don't auto-add the opening/closing <p> tags
function outputGroupsToHtml(
    outputGroups: OutputGroup[],
    inSpoiler: boolean,
    startInGroup = false,
    inTopLevelSpoiler = false,
): string {
    if (outputGroups.length === 0) {
        return "";
    }

    let output = "";
    let inGroup = startInGroup;
    let inSpan = false;
    let skipFirstP = false;

    if (inSpoiler && inTopLevelSpoiler) {
        if (outputGroups[0].groupType === "Grouped") {
            output += `<span class="spoiler-text spoiler-text-multiline">`;
            inSpan = true;
        } else {
            skipFirstP = true;
        }
    }

    for (const group of outputGroups) {
        // Auto add opening/closing <p> tags for groups
        if (!inGroup && group.groupType === "Grouped" && group.html !== undefined && group.html.length > 0) {
            inGroup = true;

            output += "<p>";

            if (inSpoiler) {
                inSpan = true;
                output += `<span class="spoiler-text spoiler-text-multiline">`;
            }
        }

        if (inGroup && (group.groupType === "Separator" || group.groupType === "Individual")) {
            inGroup = false;

            if (inSpan) {
                output += "</span>";
                inSpan = false;
            }

            if (skipFirstP) {
                skipFirstP = false;
            } else {
                output += "</p>";
            }
        }

        if (group.html !== undefined) {
            output += group.html;
        }
    }

    if (inSpan) {
        output += "</span>";
    }

    if (inGroup && !startInGroup) {
        output += "</p>";
    }

    return output;
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
    const boldedContent = `<b>${outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</b>`;

    state.output.push({ groupType: "Grouped", html: boldedContent });
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
    const gameTextContent = `<span class="wiki-game-text">${outputGroupsToHtml(
        tempState.output,
        state.inSpoiler,
        true,
    )}</span>`;

    state.output.push({ groupType: "Grouped", html: gameTextContent });
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

    let galleryContent = `<div class="wiki-gallery-images">`;

    for (let i = 0; i < Math.floor(split.length / 2); i++) {
        let inSpoiler = state.inSpoiler;
        let imageName = split[2 * i];
        const imageCaption = split[2 * i + 1];

        const spoilerResult = /\[\[([^\]]*)]\]([^\[]*)\[\[\/([^\]]*)\]\]/.exec(imageName);
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
        galleryContent += `<div>
            <div>
                <a ${inSpoiler ? 'class="spoiler-image"' : ""} href="wiki_images/${imageName}" target="_blank">
                ${inSpoiler ? '<div class="wiki-spoiler-image-text">SPOILER</div>' : ""}
                    <img src="wiki_images/${imageName}" onerror="this.onerror=null; this.src='wiki_images/Image Not Found.png'"/>
                </a>
            </div>
            ${imageCaptionHtml}
        </div>`;
    }

    galleryContent += "</div>";

    state.output.push({
        groupType: "Individual",
        html: galleryContent,
    });

    state.index = endIndex + galleryResult[0].length;
}

// Process a heading tag like [[Heading]]Heading Text[[/Heading]]
// or like [[Heading:2]]Heading Text[[/Heading]]
function processHeadingTag(state: ParserState, result: RegExpExecArray) {
    let type = result[2];

    if (type === undefined) {
        type = "1";
    } else if (type !== "1" && type !== "2" && type !== "3") {
        recordError(state, `Found bad heading type ${type}, should be 1, 2, or 3`);
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

    if (state.inSpoiler) {
        headingContent = `<span class="spoiler-text spoiler-text-multiline">${headingContent}</span>`;
    }

    if (type === "1") {
        state.output.push({ groupType: "Individual", html: `<h2 class="wiki-heading">${headingContent}</h2>` });
    } else if (type === "2") {
        state.output.push({ groupType: "Individual", html: `<h3>${headingContent}</h3>` });
    } else {
        state.output.push({ groupType: "Individual", html: `<h4>${headingContent}</h4>` });
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
    const boldedContent = `<i>${outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</i>`;

    state.output.push({ groupType: "Grouped", html: boldedContent });
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
    let imageCaptionHtml: string;
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
    state.output.push({
        groupType: "Individual",
        html: `<div class="wiki-sidebar-image">
            <a ${state.inSpoiler ? 'class="spoiler-image"' : ""} href="wiki_images/${imageName}" target="_blank">
                ${state.inSpoiler ? '<div class="wiki-spoiler-image-text">SPOILER</div>' : ""}
                <img src="wiki_images/${imageName}" onerror="this.onerror=null; this.src='wiki_images/Image Not Found.png'"/>
            </a>
            ${imageCaptionHtml.length > 0 ? `${imageCaptionHtml}` : ""}
        </div>`,
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

    let listType = "ul";
    if (result[2] === "Ordered") {
        listType = "ol";
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

    let listContent = `<${listType} class="wiki-list">`;

    for (const listItem of split) {
        // Parse the list item as a subsection individually
        const tempState = ParserState.Clone(state);
        tempState.initialContent = listItem;
        tempState.inlineOnly = "InlineList";
        processSection(tempState, undefined);
        const listItemHtml = outputGroupsToHtml(tempState.output, state.inSpoiler, true, false);

        // Append list item HTML
        if (state.inSpoiler) {
            listContent += `<li><span class="spoiler-text spoiler-text-multiline">${listItemHtml}</span></li>`;
        } else {
            listContent += `<li>${listItemHtml}</li>`;
        }
    }

    listContent += `</${listType}>`;

    state.output.push({
        groupType: "Individual",
        html: listContent,
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
        const html = getLinkHtml(state, referenceEntry, linkText);

        state.output.push({
            groupType: "Grouped",
            html: html,
        });
    } else if (linkTarget.includes(".htm")) {
        state.output.push({
            groupType: "Grouped",
            html: `<a class="d-inline-block" href="${linkTarget}">${linkText}</a>`,
        });
    } else {
        recordError(state, `Bad link to page "${linkTarget}" that doesn't exist`);
        state.output.push({
            groupType: "Grouped",
            html: linkTarget,
        });
    }

    state.index += result[0].length;
}

// Process the locations tag like [[Locations]]
function processLocationsTag(state: ParserState, result: RegExpExecArray) {
    state.index += result[0].length;

    // Start with table and header row
    let html = `
    <table class="wiki-table tablesorter">
        <tbody>
            <tr>
                <th>Location Name</th>
                <th>Main Floor/Branch</th>
                <th>Depths</th>
            </tr>`;

    for (const entryPair of state.allEntries.entries()) {
        const entryName = entryPair[0];
        const entry = entryPair[1];

        // Don't include alternative names as separate entries, only show the main entry
        if (entry.type !== "Location" || entryName != entry.name) {
            continue;
        }

        const location = entry.extraData as MapLocation;

        // Fill out row for each location
        html += `
        <tr>
            <td>${getLinkHtml(state, entry, location.name.replace(" (Location)", ""))}</td>
            <td>${location.branch ? "Branch" : "Main"}</td>
            <td>${
                location.minDepth === location.maxDepth
                    ? location.minDepth
                    : `${location.minDepth} to ${location.maxDepth} ${
                          location.multipleDepths ? "" : "(Only at one depth per run)"
                      }`
            }</td>
        </tr>`;
    }

    html += "</tbody></table>";

    // Add the locations table
    state.output.push({
        groupType: "Individual",
        html: html,
    });
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
    if (!Object.keys(lore).includes(groupName)) {
        recordError(state, `Lore group name ${groupName} is not valid, see lore.json for valid groups`);
        return;
    }

    const group = lore[groupName] as [];
    const entry = group.find((obj) => obj["Name/Number"] === entryName);
    if (entry === undefined) {
        recordError(state, `Lore group name ${groupName} doesn't contain entry with name/number ${entryName}`);
        return;
    }

    // Create the lore with an optional caption
    state.output.push({ groupType: "Separator", html: undefined });
    if (groupName.includes("Records")) {
        state.output.push({
            groupType: "Grouped",
            html: `<span class="wiki-game-text">&gt;Query(${entryName})</span>`,
        });
    }
    state.output.push({ groupType: "Separator", html: undefined });
    state.output.push({
        groupType: "Grouped",
        html: `<span class="wiki-game-text">${escapeHtml(entry["Content"])}</span>`,
    });
    state.output.push({ groupType: "Separator", html: undefined });
}

const actionMap: Map<string, (state: ParserState, result: RegExpExecArray) => void> = new Map([
    ["B", processBTag],
    ["GameText", processGameTextTag],
    ["Gallery", processGalleryTag],
    ["Heading", processHeadingTag],
    ["I", processITag],
    ["Image", processImageTag],
    ["List", processListTag],
    ["Locations", processLocationsTag],
    ["Lore", processLoreTag],
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
                    html: state.initialContent.substring(state.index, newlineIndex),
                });
                state.output.push({ groupType: "Separator", html: undefined });
            }

            state.index = newlineIndex + 1;
        }

        if (state.index < result.index) {
            // Append any content we've skipped processing, this should
            // just be plain text
            state.output.push({
                groupType: "Grouped",
                html: state.initialContent.substring(state.index, result.index),
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
            html: state.initialContent.substring(state.index, newlineIndex),
        });
        state.output.push({ groupType: "Separator", html: undefined });

        state.index = newlineIndex + 1;
    }

    // Append rest of content as regular text
    if (state.index < state.initialContent.length) {
        state.output.push({
            groupType: "Grouped",
            html: state.initialContent.substring(state.index),
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
    const spoilerContent = outputGroupsToHtml(tempState.output, inSpoiler, true, true);
    state.index = tempState.index;

    // If we have no grouped content then mark as an individual, otherwise mark as grouped
    const groupType: OutputGroupType =
        inSpoiler && tempState.output.length > 0 && tempState.output[0].groupType !== "Grouped"
            ? "Individual"
            : "Grouped";

    state.output.push({
        groupType: groupType,
        html: spoilerContent,
    });
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
    const boldedContent = `<sub>${outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</sub>`;

    state.output.push({ groupType: "Grouped", html: boldedContent });
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
    const boldedContent = `<sup>${outputGroupsToHtml(tempState.output, state.inSpoiler, true)}</sup>`;

    state.output.push({ groupType: "Grouped", html: boldedContent });
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

    let tableContent = `<table class="wiki-table"><tbody>`;
    let isHeaderRow = true;
    let columnCount = 0;
    let row = 0;

    // Parse each row
    for (const tableRow of rowSplit) {
        const cellSplit = splitOutsideActions(tableRow);

        if (isHeaderRow) {
            columnCount = cellSplit.length;
        } else {
            if (columnCount != cellSplit.length) {
                recordError(state, `Found ${cellSplit.length} columns in row ${row + 1} but header had ${columnCount}`);
            }
        }

        tableContent += "<tr>";

        for (const cell of cellSplit) {
            const tempState = ParserState.Clone(state);
            tempState.initialContent = cell;
            tempState.inlineOnly = "InlineOnly";
            processSection(tempState, undefined);
            const cellHtml = outputGroupsToHtml(tempState.output, state.inSpoiler, true, false);

            // Append cell HTML
            if (isHeaderRow) {
                tableContent += `<th>${cellHtml}</th>`;
            } else {
                tableContent += `<td>${cellHtml}</td>`;
            }
        }

        tableContent += "</tr>";
        isHeaderRow = false;
        row += 1;
    }

    tableContent += "</tbody></table>";

    state.output.push({
        groupType: "Individual",
        html: tableContent,
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
