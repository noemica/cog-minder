import { canShowSpoiler, getBot, createBotDataContent, getItem, createItemDataContent } from "./common";
import { Spoiler } from "./commonTypes";
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

// Full parser state
type ParserState = {
    allEntries: Map<string, WikiEntry>;
    entry: WikiEntry;
    spoiler: Spoiler;
    inSpoiler: boolean;
    initialContent: string;
    index: number;
    output: OutputGroup[];
};

// Creates the HTML content of a wiki entry
export function createContentHtml(entry: WikiEntry, allEntries: Map<string, WikiEntry>, spoilerState: Spoiler): string {
    // Process each section into the same output groups
    const state: ParserState = {
        allEntries: allEntries,
        entry: entry,
        inSpoiler: false,
        index: 0,
        initialContent: entry.content,
        spoiler: spoilerState,
        output: [],
    };
    processSection(state, undefined);

    // Combine all alt names as part of the title
    const names = [entry.name];
    for (const name of entry.alternativeNames) {
        names.push(name);
    }

    const headerText = names.join("/");

    // Convert to HTML
    const outputHtml = outputGroupsToHtml(state.output, false);
    return `<h2 class="wiki-header">${headerText}</h2>${outputHtml}`;
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

// Process a header tag like [[Header]]Header Text[[/Header]]
// or like [[Header:2]]Header Text[[/Header]]
function processHeaderTag(state: ParserState, result: RegExpExecArray, type: string | undefined) {
    // Process the header subsection independently
    const subSectionStart = result.index + result[0].length;
    const tempState: ParserState = {
        allEntries: state.allEntries,
        entry: state.entry,
        inSpoiler: state.inSpoiler,
        index: subSectionStart,
        initialContent: state.initialContent,
        output: [],
        spoiler: state.spoiler,
    };
    processSection(tempState, "/Header");
    state.index = tempState.index;
    let headerContent = outputGroupsToHtml(tempState.output, state.inSpoiler, true);

    if (state.inSpoiler) {
        headerContent = `<span class="spoiler-text spoiler-text-multiline">${headerContent}</span>`;
    }

    if (type === undefined) {
        type = "1";
    } else if (type !== "1" && type !== "2") {
        console.log(`Found bad header type ${type} in ${state.entry.name}, should be 1 or 2`);
        type = "1";
    }

    if (type === "1") {
        state.output.push({ groupType: "Individual", html: `<h3 class="wiki-header">${headerContent}</h3>` });
    } else {
        state.output.push({ groupType: "Individual", html: `<h4>${headerContent}</h4>` });
    }
}

// Process an image link like [[Image]]ImageName.png|Optional Image Caption[[/Image]]
// Caption should probably be used but support no caption
function processImageTag(result: RegExpExecArray, state: ParserState) {
    const entry = state.entry;

    // Find [[/Image]] closing tag first
    const imageResult = /\[\[\/Image\]\]/.exec(state.initialContent.substring(state.index));

    if (imageResult === null) {
        // If we can't find the end tag then just skip over the opening image tag
        console.log(`Found image tag "${result[0]}" without close tag in ${entry.name}`);
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // Even numbered indices contain image filenames, odd numbers contain captions
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + imageResult.index - imageResult[0].length + 1;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));
    const imageName = split[0];

    // Determine if there is a caption or not
    let imageCaptionHtml: string;
    if (split.length === 1) {
        imageCaptionHtml = "";
    } else {
        if (split.length > 2) {
            console.log(`Found more than 1 | in image tag ${result[0]} in ${entry.name}`);
        }

        // Parse the image caption as a subsection individually so we can include links
        const tempState: ParserState = {
            allEntries: state.allEntries,
            entry: state.entry,
            inSpoiler: state.inSpoiler,
            index: 0,
            initialContent: split[1],
            output: [],
            spoiler: state.spoiler,
        };
        processSection(tempState, undefined);
        imageCaptionHtml = outputGroupsToHtml(tempState.output, state.inSpoiler);
    }

    // Create the image with an optional caption
    state.output.push({
        groupType: "Individual",
        html: `<div class="wiki-inline-image">
            <a ${state.inSpoiler ? 'class="spoiler-image"' : ""} href="wiki_images/${imageName}" target="_blank">
                ${state.inSpoiler ? '<div class="wiki-spoiler-image-text">SPOILER</div>' : ""}
                <img src="wiki_images/${imageName}"/>
            </a>
            ${imageCaptionHtml.length > 0 ? `<div>${imageCaptionHtml}</div>` : ""}
        </div>`,
    });

    state.index = endIndex + imageResult[0].length;
}

// Processes images link like [[Images]]Image1.png|Image Caption|Image2.png|Image 2 caption[[/Images]]
function processImagesTag(state: ParserState, result: RegExpExecArray) {
    const entry = state.entry;

    // Find [[/Images]] closing tag first
    const imagesResult = /\[\[\/Images\]\]/.exec(state.initialContent.substring(state.index));

    if (imagesResult === null) {
        // If we can't find the end tag then just skip over the opening images tag
        console.log(`Found images tag without close tag in ${entry.name}`);
        state.index += result[0].length;
        return;
    }

    // Split interior text by |
    // Even numbered indices contain image filenames, odd numbers contain captions
    const startIndex = state.index + result[0].length;
    const endIndex = startIndex + imagesResult.index - imagesResult[0].length + 1;
    const split = splitOutsideActions(state.initialContent.substring(startIndex, endIndex));

    if (split.length < 2) {
        console.log(`Found images action without enough images in ${entry.name}`);
        state.index = endIndex + imagesResult[0].length;
        return;
    }

    if (split.length % 2 !== 0) {
        // Just ignore the last image without a caption in this instance
        console.log(`Found images action without equal number of links/captions in ${entry.name}`);
    }

    let imagesContent = `<div class="wiki-inline-images">`;

    for (let i = 0; i < Math.floor(split.length / 2); i++) {
        const imageName = split[2 * i];
        const imageCaption = split[2 * i + 1];

        // Parse the image caption as a subsection individually so we can include links
        const tempState: ParserState = {
            allEntries: state.allEntries,
            entry: state.entry,
            inSpoiler: state.inSpoiler,
            index: 0,
            initialContent: imageCaption,
            output: [],
            spoiler: state.spoiler,
        };
        processSection(tempState, undefined);
        const imageCaptionHtml = outputGroupsToHtml(tempState.output, state.inSpoiler);

        // Append image content HTML
        imagesContent += `<div>
                    <div>
                        <a ${
                            state.inSpoiler ? 'class="spoiler-image"' : ""
                        } href="wiki_images/${imageName}" target="_blank">
                        ${state.inSpoiler ? '<div class="wiki-spoiler-image-text">SPOILER</div>' : ""}
                            <img src="wiki_images/${imageName}"/>
                        </a>
                    </div>
                    ${imageCaptionHtml}
                </div>`;
    }

    imagesContent += "</div>";

    state.output.push({
        groupType: "Individual",
        html: imagesContent,
    });

    state.index = endIndex + imagesResult[0].length;
}

// Found a [[X]] link, make sure we can link properly
function processLinkTag(state: ParserState, result: RegExpExecArray) {
    const entry = state.entry;
    const split = result[1].split("|");

    const linkTarget = split[0];
    let linkText = linkTarget;
    if (split.length > 1) {
        linkText = split[1];

        if (split.length > 2) {
            console.log(`Too many | in link in ${entry.name}`);
        }
    }

    const referenceEntry = state.allEntries.get(linkTarget);
    if (referenceEntry !== undefined) {
        let tooltipData = "";
        if (referenceEntry.type === "Bot") {
            // Add bot data content overlay
            const bot = getBot(referenceEntry.name);
            tooltipData = `data-html=true data-boundary="viewport" data-content='${createBotDataContent(
                bot,
                false,
            )}' data-toggle="popover" data-trigger="hover"`;
        } else if (referenceEntry.type === "Part") {
            // Add part data content overlay
            const item = getItem(referenceEntry.name);
            tooltipData = `data-html=true data-content='${createItemDataContent(
                item,
            )}' data-toggle="popover" data-trigger="hover"`;
        }

        state.output.push({
            groupType: "Grouped",
            html: `<a class="d-inline-block" href="#${linkTarget}" ${tooltipData}>${linkText}</a>`,
        });
    } else {
        console.log(`Bad link to ${linkTarget} in ${entry.name}`);
        state.output.push({
            groupType: "Grouped",
            html: linkTarget,
        });
    }

    state.index += result[0].length;
}

// Processes the current section of text in the parser state
function processSection(state: ParserState, endTag: string | undefined) {
    const entry = state.entry;

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
            state.output.push({
                groupType: "Grouped",
                html: state.initialContent.substring(state.index, newlineIndex),
            });
            state.output.push({ groupType: "Separator", html: undefined });

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

        if (result[2] !== undefined) {
            // Found a [[X:Y]] match
            if (result[1] === "Spoiler") {
                processSpoilerTag(state, result);
            } else if (result[1] === "Header") {
                processHeaderTag(state, result, result[2]);
            } else {
                console.log(`Unrecognized action tag ${result[2]} in ${entry.name}`);
                state.index += result[0].length;
            }
        } else if (result[1].startsWith("/")) {
            // Found an end tag like [[/X]], make sure it matches what we're expecting
            if (result[1] === endTag) {
                state.index += result[0].length;

                return;
            } else {
                console.log(`Found mismatched end tag ${result[1]} with expected tag ${endTag} in ${entry.name}`);
                state.index += result[0].length;
            }
        } else if (result[1] === "Image") {
            processImageTag(result, state);
        } else if (result[1] === "Images") {
            processImagesTag(state, result);
        } else if (result[1] === "Header") {
            processHeaderTag(state, result, undefined);
        } else {
            processLinkTag(state, result);
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

// Process a spoiler tag like [[Spoiler:Spoiler]]Text[[/Spoiler]]
function processSpoilerTag(state: ParserState, result: RegExpExecArray) {
    const entry = state.entry;

    // Search for the closing [[/Spoiler]] tag first
    const spoilerResult = /\[\[\/Spoiler\]\]/.exec(state.initialContent.substring(state.index));
    if (spoilerResult === null) {
        // If we can't find the end tag then just skip over the opening spoiler tag
        console.log(`Found spoiler tag without close tag in ${entry.name}`);
        state.index += result[0].length;
        return;
    }

    // Only 2 options are Spoiler and Redacted
    // If it's invalid canShowSpoiler will default to not showing
    // unless Redacted setting is active
    if (result[2] !== "Spoiler" && result[2] !== "Redacted") {
        console.log(`Found unknown spoiler type ${result[2]} in ${entry.name}`);
    }

    // Process the spoiler subsection independently
    const inSpoiler = !canShowSpoiler(result[2] as Spoiler, state.spoiler);
    const subSectionStart = result.index + result[0].length;
    const tempState: ParserState = {
        allEntries: state.allEntries,
        entry: state.entry,
        inSpoiler: inSpoiler,
        index: subSectionStart,
        initialContent: state.initialContent,
        output: [],
        spoiler: state.spoiler,
    };
    processSection(tempState, "/Spoiler");
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

function splitOutsideActions(string: string) {
    let index = 0;

    let splitIndex = string.indexOf("|");
    let actionStartIndex = string.indexOf("[[");

    if (splitIndex === -1) {
        // Nothing to split
        return [string];
    }

    if (actionStartIndex === -1) {
        // No brackets, don't need to do special split
        return string.split("|");
    }

    const split: string[] = [];
    let currentString = "";

    while (true) {
        if (actionStartIndex === -1) {
            // No further brackets, just split remaining text normally and add to end
            const remainingSplit = string.substring(index).split("|");
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
            index = splitIndex + 1;

            splitIndex = string.indexOf("|", index);
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
        splitIndex = string.indexOf("|", index);
    }
}
