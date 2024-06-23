import { ReactNode, useEffect, useMemo, useState } from "react";
import { Route, Router, Switch, useLocation, useRoute } from "wouter";

import wiki from "../../../../json/wiki.json";
import { Bot } from "../../../types/botTypes";
import { MapLocation, Spoiler } from "../../../types/commonTypes";
import { Item } from "../../../types/itemTypes";
import { WikiEntry } from "../../../types/wikiTypes";
import { BotData } from "../../../utilities/BotData";
import { ItemData } from "../../../utilities/ItemData";
import {
    canShowSpoiler,
    createImagePath,
    getLinkSafeString,
    getStringFromLinkSafeString,
    isDev,
    loadImage,
} from "../../../utilities/common";
import { parseEntryContent } from "../../../wikiParser";
import Button, { ButtonLink } from "../../Buttons/Button";
import useBotData from "../../Effects/useBotData";
import useItemData from "../../Effects/useItemData";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import WikiAutocomplete from "./WikiAutocomplete";
import WikiEditControls from "./WikiEditControls";
import WikiHomepage from "./WikiHomepage";
import WikiPageContent from "./WikiPageContent";
import WikiSearchPage from "./WikiSearchPage";

import "../Pages.less";
import "./WikiPage.less";

export type EditState = {
    editText: string;
    entry: WikiEntry | undefined;
    modified: boolean;
    showEdit: boolean;
};

function initEntries(botData: BotData, itemData: ItemData) {
    const allEntries = new Map<string, WikiEntry>();

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
        const bot = botData.getBot(botEntry.Name);

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
                    return botData.getBot(botName);
                } catch {
                    console.log(`Bad bot name ${botName} in ${locationEntry.Name}`);
                    return null;
                }
            })
            .filter((b) => b !== null) as Bot[];

        const specialItems = (locationEntry.SpecialItems ?? [])
            .map((itemName) => {
                try {
                    return itemData.getItem(itemName);
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
        const part = itemData.getItem(partEntry.Name);

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
        // Currently no spoiler part groups
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

    return allEntries;
}

function WikiNavigationBar({
    allowedEntries,
    allEntries,
    setEditState,
}: {
    allowedEntries: WikiEntry[];
    allEntries: Map<string, WikiEntry>;
    setEditState: React.Dispatch<React.SetStateAction<EditState>>;
    spoilers: Spoiler;
}) {
    const [location, setLocation] = useLocation();
    const [searchString, setSearchString] = useState("");

    function ValidateAllButton() {
        const spoilers = useSpoilers();
        const itemData = useItemData();
        const botData = useBotData();

        return (
            <Button
                onClick={async () => {
                    for (const entry of allEntries.values()) {
                        const parseResult = parseEntryContent(
                            entry,
                            allEntries,
                            spoilers,
                            itemData,
                            botData,
                            undefined,
                        );

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
                }}
            >
                Validate All
            </Button>
        );
    }

    return (
        <div className="navigation-bar">
            {isDev() && <ValidateAllButton />}
            <ButtonLink href="/" tooltip="Navigates to the wiki home page.">
                Home
            </ButtonLink>
            <Button
                tooltip="Pops open an editor that allows previewing edits to the current page."
                disabled={location === "/"}
                onClick={() => {
                    setEditState((editState) => {
                        return { ...editState, showEdit: true };
                    });
                }}
            >
                Edit
            </Button>
            <WikiAutocomplete
                allowedEntries={allowedEntries}
                searchString={searchString}
                setSearchString={setSearchString}
            />
            <Button
                tooltip="Searches all pages for the given text."
                onClick={() => {
                    if (searchString.length > 0) {
                        setLocation(`/search/${getLinkSafeString(searchString)}`);
                    }
                }}
            >
                Search
            </Button>
        </div>
    );
}

export default function WikiPage() {
    const botData = useBotData();
    const itemData = useItemData();
    const [location] = useLocation();
    const spoilers = useSpoilers();

    const [groupSelection, setGroupSelection] = useState(0);
    const [pageDidMatch, pageNameMatch] = useRoute("/wiki/:page");

    const [editState, setEditState] = useState<EditState>({
        editText: "",
        entry: undefined,
        modified: false,
        showEdit: false,
    });

    const [allEntries, allowedEntries] = useMemo(() => {
        const allEntries = initEntries(botData, itemData);

        const allowedEntries = Array.from(allEntries.values()).filter((entry) =>
            canShowSpoiler(entry.spoiler, spoilers),
        );
        allowedEntries.sort((a, b) => a.name.localeCompare(b.name));

        return [allEntries, allowedEntries];
    }, [botData, itemData, spoilers]);

    let baseEntry: WikiEntry | undefined;
    let entry: WikiEntry | undefined;
    let parsedNode: ReactNode | undefined;
    let parsingErrors: string[] = [];

    if (pageDidMatch) {
        baseEntry = allEntries.get(getStringFromLinkSafeString(pageNameMatch[0]!));
        entry = baseEntry;

        if (entry !== undefined && editState.editText.length > 0 && editState.entry === entry) {
            // If the entry matches the current entry and the edit text has
            // been modified, replace the entry content with the edited content
            entry = { ...entry, content: editState.editText };
        }

        if (entry !== undefined) {
            let parseResult = parseEntryContent(entry, allEntries, spoilers, itemData, botData, groupSelection);
            parsedNode = parseResult.node;
            parsingErrors = parseResult.errors;
        }
    }

    return (
        <Router base="/wiki">
            <div className="page-content">
                <WikiNavigationBar
                    key={location}
                    allEntries={allEntries}
                    allowedEntries={allowedEntries}
                    setEditState={setEditState}
                    spoilers={spoilers}
                />
                <WikiEditControls
                    editState={editState}
                    entry={baseEntry}
                    parsingErrors={parsingErrors}
                    setEditState={setEditState}
                />
                <div className="wiki-page-content">
                    <Switch>
                        <Route path={"/"}>
                            <WikiHomepage />
                        </Route>
                        <Route path={"/search/:search"}>
                            {(params) => (
                                <WikiSearchPage
                                    allowedEntries={allowedEntries}
                                    search={getStringFromLinkSafeString(params["search"]!)}
                                />
                            )}
                        </Route>
                        <Route>
                            {(params) => (
                                <WikiPageContent
                                    key={entry?.name}
                                    allEntries={allEntries}
                                    entry={entry}
                                    groupSelection={groupSelection}
                                    parsedNode={parsedNode}
                                    spoilers={spoilers}
                                    path={getStringFromLinkSafeString(params[0]!)}
                                    setGroupSelection={setGroupSelection}
                                />
                            )}
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    );
}
