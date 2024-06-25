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

function BotContent({ entry, parsedNode }: { entry: WikiEntry; parsedNode: ReactNode }) {
    const bot = entry.extraData as Bot;

    return (
        <>
            <div className="wiki-infobox">
                <BotDetails bot={bot} itemsToLinks={true} />
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
    groupSelection: number;
    parsedNode: ReactNode;
    setGroupSelection: (selection: number) => void;
}) {
    const botEntries = entry.extraData as WikiEntry[];

    const botButtons = useMemo(() => {
        return botEntries.map<ExclusiveButtonDefinition<string>>((botEntry) => {
            return {
                value: botEntry.name,
            };
        });
    }, [entry]);

    const bot = botEntries[groupSelection].extraData as Bot;

    return (
        <>
            <div className="wiki-infobox">
                <div className="wiki-infobox-button-group">
                    <ExclusiveButtonGroup
                        buttons={botButtons}
                        selected={groupSelection}
                        onValueChanged={(val) => {
                            setGroupSelection(botEntries.findIndex((entry) => entry.name === val));
                        }}
                    />
                </div>
                <BotDetails bot={bot} itemsToLinks={true} />
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

function PartGroupContent({
    entry,
    groupSelection,
    parsedNode,
    setGroupSelection,
}: {
    entry: WikiEntry;
    groupSelection: number;
    parsedNode: ReactNode;
    setGroupSelection: (selection: number) => void;
}) {
    const itemEntries = entry.extraData as WikiEntry[];

    const itemButtons = useMemo(() => {
        return itemEntries.map<ExclusiveButtonDefinition<string>>((itemEntry) => {
            return {
                value: itemEntry.name,
            };
        });
    }, [entry]);

    const item = itemEntries[groupSelection].extraData as Item;

    return (
        <>
            <div className="wiki-infobox">
                <div className="wiki-infobox-button-group">
                    <ExclusiveButtonGroup
                        buttons={itemButtons}
                        selected={groupSelection}
                        onValueChanged={(val) => {
                            setGroupSelection(itemEntries.findIndex((entry) => entry.name === val));
                        }}
                    />
                </div>
                <ItemDetails item={item} />
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
    spoilers,
}: {
    allEntries: Map<string, WikiEntry>;
    entry: WikiEntry | undefined;
    groupSelection: number;
    setGroupSelection: (selection: number) => void;
    parsedNode: ReactNode;
    path: string;
    spoilers: Spoiler;
}) {
    const [bypassSpoilers, setBypassSpoilers] = useState(false);
    useEffect(() => {
        document.title = `${path} - Cog-Minder Wiki`;
    }, [path]);

    if (entry === undefined) {
        return <p>Page {path} not found</p>;
    }

    if (!canShowSpoiler(entry.spoiler, spoilers) && !bypassSpoilers) {
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
                <PartGroupContent
                    entry={entry}
                    groupSelection={groupSelection}
                    parsedNode={parsedNode}
                    setGroupSelection={setGroupSelection}
                />
            );

        default:
            assertUnreachable(entry.type);
    }
}
