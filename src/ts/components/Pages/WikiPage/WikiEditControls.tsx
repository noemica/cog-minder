import { useRef } from "react";

import { WikiEntry } from "../../../types/wikiTypes";
import Button from "../../Buttons/Button";
import { SavedWikiEntries, SavedWikiEntry, useEditableWikiEntryEdits } from "../../Effects/useLocalStorageValue";
import { SoloLabel } from "../../LabeledItem/LabeledItem";
import { EditState } from "./WikiPage";

import "./WikiPage.less";

export default function WikiEditControls({
    editState,
    entry,
    parsingErrors,
    setEditState,
}: {
    editState: EditState;
    entry: WikiEntry | undefined;
    parsingErrors: string[];
    setEditState: (editState: EditState) => void;
}) {
    const editAreaRef = useRef<HTMLTextAreaElement>(null);
    const [savedWikiEntries, setSavedWikiEntries] = useEditableWikiEntryEdits();

    if (!editState.showEdit || entry === undefined) {
        return undefined;
    }

    function updateSavedWikiEntries() {
        const newEntries: SavedWikiEntries = {
            entries: [...savedWikiEntries.entries],
        };

        let entryToUpdate: SavedWikiEntry | undefined = newEntries.entries.find(
            (savedEntry) => savedEntry.name === entry!.name,
        );

        const newContent = editAreaRef.current!.value;

        if (entryToUpdate === undefined) {
            // If there wasn't an existing entry, add a new one now
            entryToUpdate = {
                name: entry!.name,
                content: newContent,
            };
        } else {
            newEntries.entries.splice(newEntries.entries.indexOf(entryToUpdate), 1);

            entryToUpdate = { ...entryToUpdate, content: newContent };
        }

        newEntries.entries.push(entryToUpdate);

        setSavedWikiEntries(newEntries);
    }

    const savedEntry = savedWikiEntries.entries.find((savedEntry) => savedEntry.name === entry.name);
    const defaultEditorValue = savedEntry?.content || entry.content;

    function insertWrappedText(beforeText: string, afterText: string) {
        const textArea = editAreaRef.current!;

        textArea.focus();
        const initialText = textArea.value;
        const selection = initialText.substring(textArea.selectionStart, textArea.selectionEnd);

        // execCommand is deprecated but there is no other way to insert text
        // without obliterating the undo/redo stack
        document.execCommand("insertText", false, beforeText + selection + afterText);
        textArea.selectionStart = textArea.selectionStart - afterText.length - selection.length - beforeText.length;
    }

    const parsingErrorsNode = parsingErrors.length > 0 && (
        <div className="wiki-edit-errors">
            <p>Parsing Errors</p>
            <div>
                {parsingErrors.map((error, i) => (
                    <p key={i}>{error}</p>
                ))}
            </div>
        </div>
    );

    return (
        <div className="wiki-edit-content">
            <p>
                After editing the page, please visit the{" "}
                <a href="https://docs.google.com/spreadsheets/d/1Fv3WlkoueecEmZDh88XWSMuV8Qdfm3epzFrcx5nF33g">
                    spreadsheet
                </a>{" "}
                for instructions on how to update.
            </p>
            <div>
                <SoloLabel
                    label="Inline Content"
                    tooltip="Any kinds of inline content in this group can be placed anywhere where regular text can be processed. Except for Spoiler and Redacted tags, inline content can be nested with other inline content but not other top-level content. For example, Bold may be nested under Italicized text, but an Image cannot be nested under Bold Text"
                />
                <Button
                    tooltip="Bolds any text inside the selection."
                    onClick={() => insertWrappedText("[[B]]", "[[/B]]")}
                >
                    Bold
                </Button>
                <Button
                    tooltip="Italicizes any text inside the selection."
                    onClick={() => insertWrappedText("[[I]]", "[[/I]]")}
                >
                    Italicize
                </Button>
                <Button
                    tooltip="Creates a subscript section of any text inside the selection."
                    onClick={() => insertWrappedText("[[Sub]]", "[[/Sub]]")}
                >
                    Subscript
                </Button>
                <Button
                    tooltip="Creates a superscript section of any text inside the selection."
                    onClick={() => insertWrappedText("[[Sup]]", "[[/Sup]]")}
                >
                    Superscript
                </Button>
                <Button
                    tooltip="Provides a game-text style to text inside the selection."
                    onClick={() => insertWrappedText("[[GameText]]", "[[/GameText]]")}
                >
                    Game Text
                </Button>
                <Button
                    tooltip='Provides text that matches a tooltip by the same name. For example, Tooltip Text of "Burn" shows the burn critical description.'
                    onClick={() => insertWrappedText("[[TooltipText]]", "[[/TooltipText]]")}
                >
                    Tooltip Text
                </Button>
                <Button
                    tooltip="Provides a spoiler section around any text or image content nested underneath if the spoiler setting is set to None."
                    onClick={() => insertWrappedText("[[Spoiler]]", "[[/Spoiler]]")}
                >
                    Spoiler
                </Button>
                <Button
                    tooltip="Provides a spoiler section around any text or image content nested underneath if the spoiler setting is not set to Redacted."
                    onClick={() => insertWrappedText("[[Redacted]]", "[[/Redacted]]")}
                >
                    Redacted
                </Button>
                <Button
                    tooltip="Basically the opposite of Spoiler text; content is shown only if the spoiler setting is set to None."
                    onClick={() => insertWrappedText("[[SpoilerHidden]]", "[[/SpoilerHidden]]")}
                >
                    Spoiler Hidden
                </Button>
                <Button
                    tooltip="Basically the opposite of Redacted text; content is shown if the spoiler setting is not set to Redacted."
                    onClick={() => insertWrappedText("[[RedactedHidden]]", "[[/RedactedHidden]]")}
                >
                    Redacted Hidden
                </Button>
                <Button
                    tooltip="Inserts a link to the selected text. Link text may be different than the link itself by using the syntax [[Link|Link Text]]."
                    onClick={() => insertWrappedText("[[", "]]")}
                >
                    Link
                </Button>
                <Button
                    tooltip="Color the selected text in the form of [[Color:Red]]Text[[/Color]]"
                    onClick={() => insertWrappedText("[[Color]]", "[[/Color]]")}
                >
                    Color
                </Button>
                <Button
                    tooltip="Adds a comment for editors only that is ignored in the actual page in the form of [[Comment]]Hidden Text[[/Comment]]"
                    onClick={() => insertWrappedText("[[Comment]]", "[[/Comment]]")}
                >
                    Comment
                </Button>
            </div>
            <div>
                <SoloLabel
                    label="Top-level Content"
                    tooltip="Top-level content that can not typically be placed underneath other tags except for spoiler tags. Generally support all types of inline content."
                />
                <Button
                    tooltip="Provides a large heading line with an underline containing the given text."
                    onClick={() => insertWrappedText("[[Heading]]", "[[/Heading]]")}
                >
                    Heading 1
                </Button>
                <Button
                    tooltip="Provides a slightly smaller heading line containing the given text."
                    onClick={() => insertWrappedText("[[Heading:2]]", "[[/Heading]]")}
                >
                    Heading 2
                </Button>
                <Button
                    tooltip="Provides an even smaller heading line containing the given text."
                    onClick={() => insertWrappedText("[[Heading:3]]", "[[/Heading]]")}
                >
                    Heading 3
                </Button>
                <Button
                    tooltip="Provides the smallest heading line containing the given text."
                    onClick={() => insertWrappedText("[[Heading:4]]", "[[/Heading]]")}
                >
                    Heading 4
                </Button>
                <Button
                    tooltip="Creates an image on the right side of the page with an optional caption in the form of [[Image]]Image Name.png|Image Caption[[/Image]]. May also use an external URL."
                    onClick={() => insertWrappedText("[[Image]]", "[[/Image]]")}
                >
                    Sidebar Image
                </Button>
                <Button
                    tooltip="Creates a list of images centered in the page in a list form. Images and captions should be sequentially listed, like [[Gallery]]Image 1.png|Image 1 caption|Image 2.png|Image 2 caption[[/Gallery]]."
                    onClick={() => insertWrappedText("[[Gallery]]", "[[/Gallery]]")}
                >
                    Gallery Images
                </Button>
                <Button
                    tooltip="Creates a list of images centered in the page in a list form. Images and captions should be sequentially listed, like [[FanartGallery]]Image 1.png|Image 1 caption|Image 2.png|Image 2 caption[[/FanartGallery]]. Art takes up the full screen, compared to gallery where a smaller max size is allowed."
                    onClick={() => insertWrappedText("[[FanartGallery]]", "[[/FanartGallery]]")}
                >
                    Fanart Gallery Images
                </Button>
                <Button
                    tooltip="Creates a lore entry that pulls text from actual lore quotes, use Lore page as a reference."
                    onClick={() => insertWrappedText("[[Lore]]", "[[/Lore]]")}
                >
                    Lore
                </Button>
                <Button
                    tooltip="Creates an unordered (bulleted) list of items that can be separated out like [[List]]Item 1|Item 2|Item 3[[/List]]."
                    onClick={() => insertWrappedText("[[List]]", "[[/List]]")}
                >
                    Unordered List
                </Button>
                <Button
                    tooltip="Creates an ordered (numbered) list of items that can be separated out like [[List:Ordered]]Item 1|Item 2|Item 3[[/List]]."
                    onClick={() => insertWrappedText("[[List:Ordered]]", "[[/List]]")}
                >
                    Ordered List
                </Button>
                <Button
                    tooltip="Creates a 2-dimensional table of text items in the form of [[Table]]Column 1 Header|Column 2 header||Row 1 column 1|Row 1 column 2[[/Table]]."
                    onClick={() => insertWrappedText("[[Table]]", "[[/Table]]")}
                >
                    Table
                </Button>
                <Button
                    tooltip="Creates a fake item infobox based on the provided data in the form of [[ItemDetails]]Name|XYZ||Image Name|...[[/ItemDetails]]. See the Example page for a full list of available parameters."
                    onClick={() => insertWrappedText("[[ItemDetails]]", "[[/ItemDetails]]")}
                >
                    Item Details
                </Button>
                <Button
                    tooltip="Creates a fake bot infobox based on the provided data in the form of [[BotDetails]]Name|XYZ||Class|...[[/BotDetails]]. See the Example page for a full list of available parameters."
                    onClick={() => insertWrappedText("[[BotDetails]]", "[[/BotDetails]]")}
                >
                    Bot Details
                </Button>
                <Button
                    tooltip="Creates a sortable table of parts contained in a certain part group or part supergroup page in the form of [[PartGroupTable]]Group Name|Category/Stat|Category2/Stat 2...[[/PartGroupTable]]. The available categories and stat names are the same as the ones shown in the parts spreadsheet view. For example, Overview/Rating."
                    onClick={() => insertWrappedText("[[PartGroupTable]]", "[[/PartGroupTable]]")}
                >
                    Part Group Table
                </Button>
            </div>
            <textarea ref={editAreaRef} key={entry.name} className="wiki-edit-text" defaultValue={defaultEditorValue} />
            <div className="wiki-edit-changes-group">
                <Button
                    tooltip="Clears any saved changes from local storage and restores the original page text. Normally, changes are saved between sessions."
                    className="clear-changes-button"
                    clickOverrideText={{
                        tempChildren: "Cleared",
                        tempDuration: 2000,
                    }}
                    disabled={
                        savedWikiEntries.entries.find((savedEntry) => savedEntry.name === entry.name) === undefined
                    }
                    onClick={() => {
                        const newEntries: SavedWikiEntries = {
                            entries: [...savedWikiEntries.entries],
                        };

                        // Remove the saved entry from the list
                        newEntries.entries.splice(
                            newEntries.entries.findIndex((savedEntry) => savedEntry.name === entry.name),
                            1,
                        );
                        setSavedWikiEntries(newEntries);

                        // Remove saved editor value
                        setEditState({ ...editState, editText: "" });

                        // Restore editor to base entry value
                        // Need to use execCommand to maintain undo buffer
                        const textArea = editAreaRef.current!;
                        textArea.focus();
                        document.execCommand("selectall");
                        document.execCommand("delete");
                        document.execCommand("insertText", false, entry.content);
                    }}
                >
                    Clear Changes
                </Button>
                <Button
                    tooltip="Closes the edit pane and returns the content below to the original state if changes were previewed."
                    onClick={() => {
                        setEditState({ ...editState, showEdit: false });
                    }}
                >
                    Close
                </Button>
                <Button
                    tooltip="Previews the changes made in the editor above in the page below."
                    className="preview-changes-button"
                    clickOverrideText={{
                        tempChildren: "Updated",
                        tempDuration: 2000,
                    }}
                    onClick={() => {
                        setEditState({ ...editState, editText: editAreaRef.current!.value, entry: entry });
                        updateSavedWikiEntries();
                    }}
                >
                    Preview Changes
                </Button>
                <Button
                    className="copy-text-button"
                    tooltip="Copies the text in the editor above to the clipboard."
                    clickOverrideText={{
                        tempChildren: "Copied",
                        tempDuration: 2000,
                    }}
                    onClick={() => {
                        navigator.clipboard.writeText(editAreaRef.current!.value.replace(/\n/g, "\\n"));

                        setEditState({ ...editState, modified: false });
                        updateSavedWikiEntries();
                    }}
                >
                    Copy Text
                </Button>
            </div>
            {parsingErrorsNode}
        </div>
    );
}
