import { ReactNode, useEffect, useMemo, useState } from "react";

import { Bot } from "../../../types/botTypes";
import { MapLocation, Spoiler } from "../../../types/commonTypes";
import { Item } from "../../../types/itemTypes";
import { WikiEntry } from "../../../types/wikiTypes";
import { assertUnreachable, canShowSpoiler } from "../../../utilities/common";
import Button from "../../Buttons/Button";
import ExclusiveButtonGroup, { ExclusiveButtonDefinition } from "../../Buttons/ExclusiveButtonGroup";
import BotDetails from "../../GameDetails/BotDetails";
import ItemDetails from "../../GameDetails/ItemDetails";
import LocationDetails from "../../GameDetails/LocationDetails";
import { LabeledSelect } from "../../LabeledItem/LabeledItem";
import { SelectOptionType } from "../../Selectpicker/Select";

function BotContent({ entry, parsedNode }: { entry: WikiEntry; parsedNode: ReactNode }) {
    const bot = entry.extraData as Bot;

    return (
        <>
            <div className="wiki-infobox">
                <BotDetails bot={bot} popoversToLinks={true} />
            </div>
            {parsedNode}
        </>
    );
}

function BotGroupContent({
    entry,
    groupSelection,
    parsedNode,
    setGroupSelection,
}: {
    entry: WikiEntry;
    groupSelection: string;
    parsedNode: ReactNode;
    setGroupSelection: (selection: string) => void;
}) {
    const botEntries = entry.extraData as WikiEntry[];

    const botButtons = useMemo(() => {
        return botEntries.map<ExclusiveButtonDefinition<string>>((botEntry) => {
            return {
                value: botEntry.name,
            };
        });
    }, [entry]);

    // Use the saved entry if it exists, otherwise use the first entry
    const bot = (botEntries.find((entry) => entry.name === groupSelection) || botEntries[0]).extraData as Bot;

    return (
        <>
            <div className="wiki-infobox">
                <div className="wiki-infobox-button-group">
                    <ExclusiveButtonGroup
                        buttons={botButtons}
                        selected={groupSelection}
                        onValueChanged={(val) => {
                            setGroupSelection(val);
                        }}
                    />
                </div>
                <BotDetails bot={bot} popoversToLinks={true} showWikiLink={true} />
            </div>
            {parsedNode}
        </>
    );
}

function ItemContent({ entry, parsedNode }: { entry: WikiEntry; parsedNode: ReactNode }) {
    const item = entry.extraData as Item;

    return (
        <>
            <div className="wiki-infobox">
                <ItemDetails item={item} />
            </div>
            {parsedNode}
        </>
    );
}

function ItemGroupContent({
    entry,
    groupSelection,
    parsedNode,
    setGroupSelection,
}: {
    entry: WikiEntry;
    groupSelection: string;
    parsedNode: ReactNode;
    setGroupSelection: (selection: string) => void;
}) {
    const itemEntries = entry.extraData as WikiEntry[];

    const [itemButtons, itemOptions] = useMemo(() => {
        const itemButtons = itemEntries.map<ExclusiveButtonDefinition<string>>((itemEntry) => {
            return {
                value: itemEntry.name,
            };
        });

        const itemOptions = itemEntries.map<SelectOptionType>((itemEntry) => {
            return {
                value: itemEntry.name,
            };
        });

        return [itemButtons, itemOptions];
    }, [entry]);

    const item = (itemEntries.find((entry) => entry.name === groupSelection) || itemEntries[0]).extraData as Item;

    const itemPicker =
        itemEntries.length < 20 ? (
            <div className="wiki-infobox-button-group">
                <ExclusiveButtonGroup
                    buttons={itemButtons}
                    selected={groupSelection}
                    onValueChanged={(val) => {
                        setGroupSelection(val);
                    }}
                />
            </div>
        ) : (
            <LabeledSelect
                className="wiki-item-select"
                label="Item"
                tooltip="Item to show information for."
                options={itemOptions}
                value={itemOptions.find((option) => option.value === groupSelection) || itemOptions[0]}
                onChange={(val) => {
                    setGroupSelection(val!.value);
                }}
            />
        );

    return (
        <>
            <div className="wiki-infobox">
                {itemPicker}
                <ItemDetails item={item} showWikiLink={true} />
            </div>
            {parsedNode}
        </>
    );
}

function LocationContent({ entry, parsedNode }: { entry: WikiEntry; parsedNode: ReactNode }) {
    const location = entry.extraData as MapLocation;

    return (
        <>
            <div className="wiki-infobox">
                <LocationDetails location={location} />
            </div>
            {parsedNode}
        </>
    );
}

export default function WikiPageContent({
    entry,
    groupSelection,
    parsedNode,
    path,
    setGroupSelection,
    spoiler,
}: {
    allEntries: Map<string, WikiEntry>;
    entry: WikiEntry | undefined;
    groupSelection: string;
    setGroupSelection: (selection: string) => void;
    parsedNode: ReactNode;
    path: string;
    spoiler: Spoiler;
}) {
    const [bypassSpoilers, setBypassSpoilers] = useState(false);
    useEffect(() => {
        document.title = `${path} - Cog-Minder Wiki`;
    }, [path]);

    if (entry === undefined) {
        return <p>Page {path} not found</p>;
    }

    if (!canShowSpoiler(entry.spoiler, spoiler) && !bypassSpoilers) {
        return (
            <div className="spoiler-warning">
                <p>Page blocked by Spoilers setting: Would you like to continue?</p>
                <p> Spoilers settings can be updated in the Settings popup in the top right corner of the page.</p>
                <div>
                    <Button onClick={() => setBypassSpoilers(true)}>Yes</Button>
                    <Button onClick={() => history.back()}>Back</Button>
                </div>
            </div>
        );
    }

    switch (entry.type) {
        case "Bot":
            return <BotContent entry={entry} parsedNode={parsedNode} />;

        case "Bot Group":
            return (
                <BotGroupContent
                    entry={entry}
                    groupSelection={groupSelection}
                    parsedNode={parsedNode}
                    setGroupSelection={setGroupSelection}
                />
            );

        case "Location":
            return <LocationContent entry={entry} parsedNode={parsedNode} />;

        case "Other":
            return parsedNode;

        case "Part":
            return <ItemContent entry={entry} parsedNode={parsedNode} />;

        case "Part Group":
            return (
                <ItemGroupContent
                    entry={entry}
                    groupSelection={groupSelection}
                    parsedNode={parsedNode}
                    setGroupSelection={setGroupSelection}
                />
            );

        case "Part Supergroup":
            return parsedNode;

        default:
            assertUnreachable(entry.type);
    }
}
