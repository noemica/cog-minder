import { canShowSpoiler, getBot, createBotDataContent, getItem, createItemDataContent } from "./common";
import { Spoiler } from "./commonTypes";
import { WikiEntry } from "./wikitypes";

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
    initialContent: string;
    index: number;
    output: OutputGroup[];
};

// Creates the HTML content of a wiki entry
export function createContentHtml(entry: WikiEntry, allEntries: Map<string, WikiEntry>, spoilerState: Spoiler): string {
    // Parse each newline into separate sections
    const sections = entry.content.split("\n");

    const outputGroups: OutputGroup[] = [];
    sections.map((s) => {
        // Process each section into the same output groups
        const state: ParserState = {
            allEntries: allEntries,
            entry: entry,
            index: 0,
            initialContent: s,
            spoiler: spoilerState,
            output: outputGroups,
        };
        processSection(state, undefined);
        outputGroups.push({ groupType: "Separator", html: undefined });
    });

    // Combine all alt names as part of the title
    const names = [entry.name];
    for (const name of entry.alternativeNames) {
        names.push(name);
    }

    const headerText = names.join("/");

    // Convert to HTML
    return `<h2 class="wiki-header">${headerText}</h2>${outputGroupsToHtml(outputGroups)}`;
}

// Turns a list of output groups into HTML
// If startInGroup is true then don't auto-add the opening/closing <p> tags
function outputGroupsToHtml(outputGroups: OutputGroup[], startInGroup = false): string {
    let output = "";
    let inGroup = startInGroup;

    for (const group of outputGroups) {
        // Auto add opening/closing <p> tags for groups
        if (!inGroup && group.groupType === "Grouped") {
            inGroup = true;
            output += "<p>";
        }

        if (inGroup && (group.groupType === "Separator" || group.groupType === "Individual")) {
            inGroup = false;
            output += "</p>";
        }

        if (group.html !== undefined) {
            output += group.html;
        }
    }

    if (inGroup && !startInGroup) {
        output += "</p>";
    }

    return output;
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
                processSpoilerTag(state, entry, result);
            } else if (result[1] === "Image") {
                processImageTag(result, entry, state);
            } else if (result[1] === "Header") {
                state.output.push({ groupType: "Individual", html: `<h3 class="wiki-header">${result[2]}</h3>` });

                state.index += result[0].length;
            } else if (result[1] === "Header2") {
                state.output.push({ groupType: "Individual", html: `<h4>${result[2]}</h4>` });

                state.index += result[0].length;
            } else {
                console.log(`Unrecognized action tag ${result[2]} in ${entry.name}`);
                state.index += result[0].length;
            }
        } else if (result[1].startsWith("/")) {
            // Found an end tag, make sure it matches what we're expecting
            if (result[1] === endTag) {
                state.index += result[0].length;

                return;
            } else {
                console.log(`Found mismatched end tag ${result[1]} with expected tag ${endTag} in ${entry.name}`);
                state.index += result[0].length;
            }
        } else if (result[1] === "Images") {
            processImagesTag(state, entry, result);
        } else {
            processLink(state, result, entry);
        }
    }

    // Append rest of content as regular text
    state.output.push({
        groupType: "Grouped",
        html: state.initialContent.substring(state.index),
    });
}

// Found a [[X]] link, make sure we can link properly
function processLink(state: ParserState, result: RegExpExecArray, entry: WikiEntry) {
    const referenceEntry = state.allEntries.get(result[1]);
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
            html: `<a class="d-inline-block" href="#${result[1]}" ${tooltipData}>${result[1]}</a>`,
        });
    } else {
        console.log(`Bad link to ${result[1]} in ${entry.name}`);
        state.output.push({
            groupType: "Grouped",
            html: result[1],
        });
    }

    state.index += result[0].length;
}

// Processes images link like [[Images]]Image1.png|Image Caption|Image2.png|Image 2 caption[[/Images]]
function processImagesTag(state: ParserState, entry: WikiEntry, result: RegExpExecArray) {
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
    const split = state.initialContent.substring(startIndex, endIndex).split("|");

    if (split.length < 2) {
        console.log(`Found images action without enough images in ${entry.name}`);
        state.index = endIndex;
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

        // Parse the content as a subsection individually so we can include links
        const tempState: ParserState = {
            allEntries: state.allEntries,
            entry: state.entry,
            index: 0,
            initialContent: imageCaption,
            output: [],
            spoiler: state.spoiler,
        };
        processSection(tempState, undefined);

        const imageCaptionHtml = outputGroupsToHtml(tempState.output);

        // Append image content HTML
        imagesContent += `<div>
                    <div>
                        <a href="wiki_images/${imageName}" target="_blank">
                            <img src="wiki_images/${imageName}"></img>
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

    state.index = endIndex;
}

// Process an image link like [[Image:ImageName.png|Optional Image Caption]]
// These really should have caption but support missing caption
function processImageTag(result: RegExpExecArray, entry: WikiEntry, state: ParserState) {
    const split = result[2].split("|");
    const imageName = split[0];

    // Determine if there is a caption or not
    let imageCaption: string;
    if (split.length === 1) {
        imageCaption = "";
    } else {
        if (split.length > 1) {
            console.log(`Found more than 1 | in an image in ${entry.name}`);
        }
        imageCaption = split[1];
    }

    // Create the image with an optional caption
    state.output.push({
        groupType: "Grouped",
        html: `<div class="wiki-inline-image">
                            <a href="wiki_images/${imageName}" target="_blank">
                                <img src="wiki_images/${imageName}"></img>
                            </a>
                            ${imageCaption.length > 0 ? `<div>${imageCaption}</div>` : ""}
                        </div>`,
    });

    state.index += result[0].length;
}

// Process a spoiler tag like [[Spoiler:Spoiler]]Text[[/Spoiler]]
function processSpoilerTag(state: ParserState, entry: WikiEntry, result: RegExpExecArray) {
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
    const subSectionStart = result.index + result[0].length;
    const tempState: ParserState = {
        allEntries: state.allEntries,
        entry: state.entry,
        index: subSectionStart,
        initialContent: state.initialContent,
        output: [],
        spoiler: state.spoiler,
    };
    processSection(tempState, "/Spoiler");

    state.index = tempState.index;

    let spoilerContent = outputGroupsToHtml(tempState.output, true);

    // Decide whether to add spoiler-text protection or not
    if (!canShowSpoiler(result[2] as Spoiler, state.spoiler)) {
        spoilerContent = `<span class="spoiler-text spoiler-text-multiline">${spoilerContent}</span>`;
    }

    state.output.push({
        groupType: "Grouped",
        html: spoilerContent,
    });
}
