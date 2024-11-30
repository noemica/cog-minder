import { ReactNode, useEffect, useMemo, useState } from "react";
import { Route, Router, Switch, useLocation, useRoute } from "wouter";
// eslint-disable-next-line import/no-unresolved
import { useHashLocation } from "wouter/use-hash-location";

import wiki from "../../../../json/wiki.json";
import { Bot } from "../../../types/botTypes";
import { MapLocation, Spoiler } from "../../../types/commonTypes";
import { Item, WeaponItem } from "../../../types/itemTypes";
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
import { parseEntryContent } from "../../../utilities/wikiParser";
import Button, { ButtonLink } from "../../Buttons/Button";
import useBotData from "../../Effects/useBotData";
import useItemData from "../../Effects/useItemData";
import { useSpoilers } from "../../Effects/useLocalStorageValue";
import WikiAutocomplete from "./WikiAutocomplete";
import WikiEditControls from "./WikiEditControls";
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

const itemCategoryFilters = new Map<string, (item: Item) => boolean>([
    ["Alpha Cannons", (item) => item.type === "Energy Cannon" && item.name.includes("Alpha Cannon")],
    ["Ballistic Cannons", (item) => item.type === "Ballistic Cannon"],
    ["Ballistic Guns", (item) => item.type === "Ballistic Gun"],
    [
        "Electromagnetic Cannons",
        (item) => item.type === "Energy Cannon" && (item as WeaponItem).damageType === "Electromagnetic",
    ],
    [
        "Electromagnetic Guns",
        (item) => item.type === "Energy Gun" && (item as WeaponItem).damageType === "Electromagnetic",
    ],
    [
        "Electromagnetic Launchers",
        (item) => item.type === "Launcher" && (item as WeaponItem).explosionType === "Electromagnetic",
    ],
    ["Engines", (item) => item.type === "Engine"],
    ["Explosive Launchers", (item) => item.type === "Launcher" && (item as WeaponItem).explosionType === "Explosive"],
    ["Flight Units", (item) => item.type === "Flight Unit"],
    ["Hover Units", (item) => item.type === "Hover Unit"],
    ["Impact Weapons", (item) => item.type === "Impact Weapon"],
    ["Legs", (item) => item.type === "Leg"],
    ["Phasers", (item) => item.type === "Energy Gun" && (item as WeaponItem).damageType === "Phasic"],
    ["Power Cores", (item) => item.type === "Power Core"],
    ["Piercing Weapons", (item) => item.type === "Piercing Weapon"],
    ["Reactors", (item) => item.type === "Reactor"],
    ["Special Weapons", (item) => item.type === "Special Weapon"],
    ["Slashing Weapons", (item) => item.type === "Slashing Weapon"],
    ["Thermal Cannons", (item) => item.type === "Energy Cannon" && (item as WeaponItem).damageType === "Thermal"],
    ["Thermal Guns", (item) => item.type === "Energy Gun" && (item as WeaponItem).damageType === "Thermal"],
    ["Treads", (item) => item.type === "Treads"],
    ["Vortex Cannons", (item) => item.type === "Energy Cannon" && (item as WeaponItem).damageType === "Entropic"],
    ["Vortex Guns", (item) => item.type === "Energy Gun" && (item as WeaponItem).damageType === "Entropic"],
    ["Wheels", (item) => item.type === "Wheel"],
]);
function getItemCategoryItems(itemCategory: string, itemData: ItemData): string[] {
    const categoryFilter = itemCategoryFilters.get(itemCategory);

    if (categoryFilter === undefined) {
        console.log(`Tried to search for undefined item category ${itemCategory}`);
        return [];
    }

    const items: Item[] = [];

    for (const item of itemData.getAllItems()) {
        if (categoryFilter(item)) {
            items.push(item);
        }
    }

    items.sort(itemCompare);

    return items.map((item) => item.name);
}

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
            content: botEntry.Content,
            extraData: bot,
            name: botEntry.Name,
            parentGroups: [],
            spoiler: bot.spoiler,
            type: "Bot",
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
            alternativeNames: botGroupEntry.AlternateNames ?? [],
            content: botGroupEntry.Content ?? "",
            extraData: botEntries,
            name: botGroupEntry.Name,
            parentGroups: [],
            spoiler: spoiler,
            type: "Bot Group",
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

            // Add to the bot's parent groups
            botEntry.parentGroups.push(entry);
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
            exitSkipsDepth: locationEntry.ExitSkipsDepth ?? false,
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
            content: locationEntry.Content,
            extraData: location,
            name: locationEntry.Name,
            parentGroups: [],
            spoiler: spoiler,
            type: "Location",
        };

        addEntry(entry);
    }

    // Need to do a second pass to connect entry/exit references
    for (const locationEntry of wiki.Locations) {
        const location = allEntries.get(locationEntry.Name)!;

        for (const exit of locationEntry.Exits) {
            const exitEntry = allEntries.get(exit.Map);
            if (exitEntry === undefined) {
                console.log(`Bad location reference ${exit} in ${locationEntry.Name}`);
            } else {
                const entryLocation = location.extraData as MapLocation;
                const exitLocation = exitEntry.extraData as MapLocation;

                entryLocation.exits.push({ depthsString: exit.Depths, location: exitLocation });
                exitLocation.entries.push({ depthsString: exit.Depths, location: entryLocation }); // TODO
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
            content: partEntry.Content,
            extraData: part,
            name: partEntry.Name,
            parentGroups: [],
            spoiler: spoiler,
            type: "Part",
        });
    }

    // Initialize part groups
    for (const partGroupEntry of wiki["Part Groups"]) {
        let spoiler: Spoiler = "None";
        if (partGroupEntry.Spoiler === "Redacted") {
            spoiler = "Redacted";
        } else if (partGroupEntry.Spoiler === "Spoiler") {
            spoiler = "Spoiler";
        }

        const partEntries: WikiEntry[] = [];
        const entry: WikiEntry = {
            alternativeNames: [],
            content: partGroupEntry.Content ?? "",
            extraData: partEntries,
            name: partGroupEntry.Name,
            parentGroups: [],
            spoiler: spoiler,
            type: "Part Group",
        };
        addEntry(entry);

        let children: string[] = [];

        if (partGroupEntry.Parts) {
            children = partGroupEntry.Parts;
        } else if (partGroupEntry.PartCategory) {
            children = getItemCategoryItems(partGroupEntry.PartCategory, itemData);
        } else {
            console.log(`Part group ${entry.name} has no parts`);
        }

        // Add all parts in group
        for (const partName of children) {
            const partEntry = allEntries.get(partName);
            if (partEntry === undefined) {
                console.log(`Found bad part name ${partName} in group ${partGroupEntry.Name}`);
                continue;
            }

            if (partEntry.type !== "Part") {
                console.log(`Found non-part ${partEntry.name} in part group ${entry.name}`);
                continue;
            }

            // Set the part's parent group to point to this
            partEntry.parentGroups.push(entry);
            partEntries.push(partEntry);
        }

        partEntries.sort((entry1, entry2) => {
            const item1 = entry1.extraData as Item;
            const item2 = entry2.extraData as Item;

            return itemCompare(item1, item2);
        });
    }

    for (const partSupergroupEntry of wiki["Part Supergroups"]) {
        const groupEntries: WikiEntry[] = [];
        const entry: WikiEntry = {
            alternativeNames: [],
            content: partSupergroupEntry.Content ?? "",
            extraData: groupEntries,
            name: partSupergroupEntry.Name,
            parentGroups: [],
            spoiler: "None",
            type: "Part Supergroup",
        };
        addEntry(entry);

        for (const groupName of partSupergroupEntry.Groups) {
            const groupEntry = allEntries.get(groupName);
            if (groupEntry === undefined) {
                console.log(`Found bad part group name ${groupName} in group ${entry.name}`);
                continue;
            }

            if (groupEntry.type !== "Part Group") {
                console.log(`Found non-group ${groupName} in part group ${entry.name}`);
                continue;
            }

            // Set the part's parent group to point to this
            groupEntry.parentGroups.push(entry);
            groupEntries.push(groupEntry);
        }

        if (partSupergroupEntry.Parts !== undefined) {
            let partEntries: WikiEntry[] = [];

            for (const partName of partSupergroupEntry.Parts) {
                const partEntry = allEntries.get(partName);
                if (partEntry === undefined) {
                    console.log(`Found bad part name ${partName} in group ${partSupergroupEntry.Name}`);
                    continue;
                }

                if (partEntry.type !== "Part") {
                    console.log(`Found non-part ${partEntry.name} in part group ${entry.name}`);
                    continue;
                }

                // Set the part's parent group to point to this
                partEntry.parentGroups.push(entry);
                partEntries.push(partEntry);
            }

            partEntries.sort((entry1, entry2) => {
                const item1 = entry1.extraData as Item;
                const item2 = entry2.extraData as Item;
    
                return itemCompare(item1, item2);
            });    

            if (partEntries.length > 0) {
                groupEntries.push({
                    alternativeNames: [],
                    content: "",
                    fakeGroup: true,
                    name: "Other",
                    parentGroups: [],
                    spoiler: "None",
                    type: "Part Group",
                    extraData: partEntries,
                });
            }
        }
    }

    // Need to do a second pass for supergroups that contain other supergroups
    for (const partSupergroupEntry of wiki["Part Supergroups"]) {
        if (partSupergroupEntry.SuperGroups === undefined) {
            continue;
        }

        const entry = allEntries.get(partSupergroupEntry.Name)!;
        const groupEntries = entry.extraData as WikiEntry[];

        for (const superGroupName of partSupergroupEntry.SuperGroups) {
            const superGroupEntry = allEntries.get(superGroupName);
            if (superGroupEntry === undefined) {
                console.log(
                    `Found bad part supergroup name ${superGroupName} in supergroup ${partSupergroupEntry.Name}`,
                );
                continue;
            }

            if (superGroupEntry.type !== "Part Supergroup") {
                console.log(`Found non-part supergroup name ${superGroupEntry.name} in supergroup ${entry.name}`);
                continue;
            }

            entry.hasSupergroupChildren = true;

            // Set the part's parent group to point to this
            superGroupEntry.parentGroups.push(entry);
            groupEntries.push(superGroupEntry);
        }

        groupEntries.sort((entry1, entry2) => entry1.name.localeCompare(entry2.name));
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
            content: otherEntry.Content,
            name: otherEntry.Name,
            parentGroups: [],
            type: "Other",
            spoiler: spoiler,
        };

        addEntry(entry);
    }

    if (isDev()) {
        // Checks to make sure that all new parts are included in top level
        // supercategories that they should be in
        function checkType(supergroupEntry: WikiEntry, filterFunc: (item: Item) => boolean) {
            const items = new Set<Item>();

            for (const item of itemData.getAllItems()) {
                if (filterFunc(item)) {
                    items.add(item);
                }
            }

            for (const groupEntry of supergroupEntry.extraData as WikiEntry[]) {
                for (const itemEntry of groupEntry.extraData as WikiEntry[]) {
                    items.delete(itemEntry.extraData as Item);
                }
            }

            if (items.size !== 0) {
                console.log(`Found uncategorized items for supergroup ${supergroupEntry.name}`);
                for (const item of items.values()) {
                    console.log(item.name);
                }
            }
        }

        checkType(allEntries.get("Energy Cannons")!, (item) => item.type === "Energy Cannon");
        checkType(allEntries.get("Energy Guns")!, (item) => item.type === "Energy Gun");
        checkType(allEntries.get("Launchers")!, (item) => item.type === "Launcher");
        checkType(allEntries.get("Special Melee Weapons")!, (item) => item.type === "Special Melee Weapon");
        checkType(allEntries.get("Special Weapons")!, (item) => item.type === "Special Weapon");
    }

    return allEntries;
}

function itemCompare(item1: Item, item2: Item) {
    if (item1.rating === item2.rating) {
        return item1.name.localeCompare(item2.name);
    }

    return item1.rating - item2.rating;
}

function WikiNavigationBar({
    allowedEntries,
    allEntries,
    setEditState,
}: {
    allowedEntries: string[];
    allEntries: Map<string, WikiEntry>;
    setEditState: React.Dispatch<React.SetStateAction<EditState>>;
    spoiler: Spoiler;
}) {
    const [_, setLocation] = useLocation();
    const [searchString, setSearchString] = useState("");

    function ValidateAllButton() {
        const spoilers = useSpoilers();
        const itemData = useItemData();
        const botData = useBotData();

        return (
            <Button
                onClick={async () => {
                    console.log("Validating...");
                    for (const entry of allEntries.values()) {
                        const parseResult = parseEntryContent(entry, allEntries, spoilers, itemData, botData);

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

    const [groupSelection, setGroupSelection] = useState("");
    const [pageDidMatch, pageNameMatch] = useRoute("/wiki/:page");
    const [pageIsHomepage] = useRoute("/wiki");

    const [editState, setEditState] = useState<EditState>({
        editText: "",
        entry: undefined,
        modified: false,
        showEdit: false,
    });

    const [hashLocation] = useHashLocation();

    const [allEntries, allowedEntries] = useMemo(() => {
        const allEntries = initEntries(botData, itemData);

        // Need to exclude the home page from the list of allowed entries since
        // that is what is shown in the searchbar
        const allowedEntries = Array.from(allEntries.entries())
            .filter(([_, entry]) => canShowSpoiler(entry.spoiler, spoilers) && entry.name !== "Homepage")
            .map(([entryName, _]) => entryName);
        allowedEntries.sort();

        return [allEntries, allowedEntries];
    }, [botData, itemData, spoilers]);

    useEffect(() => {
        // If hash location has been set on initial load, we need to manually
        // scroll the div into view. Linking may not work without this as the
        // element needs to be immediately available when the page first
        // renders, which may not be true if the javascript is not immediately
        // loaded/cached. Thus, this only needs to be done on initial load.
        const hash = hashLocation.slice(1);

        if (hash.length === 0) {
            // Return early to get rid of console warning
            return;
        }

        const element = document.getElementById(hash);

        if (element !== null) {
            element.scrollIntoView();
        }
    }, []);

    let baseEntry: WikiEntry | undefined;
    let entry: WikiEntry | undefined;
    let parsedNode: ReactNode | undefined;
    let parsingErrors: string[] = [];

    if (pageDidMatch || pageIsHomepage) {
        let pageName: string;

        if (pageIsHomepage) {
            pageName = "Homepage";
        } else {
            pageName = getStringFromLinkSafeString(pageNameMatch![0]!);
        }

        baseEntry = allEntries.get(pageName);
        entry = baseEntry;

        if (entry !== undefined && editState.editText.length > 0 && editState.entry === entry) {
            // If the entry matches the current entry and the edit text has
            // been modified, replace the entry content with the edited content
            entry = { ...entry, content: editState.editText };
        }

        if (entry !== undefined) {
            const parseResult = parseEntryContent(entry, allEntries, spoilers, itemData, botData);
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
                    spoiler={spoilers}
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
                            <WikiPageContent
                                key="Homepage"
                                allEntries={allEntries}
                                entry={allEntries.get("Homepage")}
                                groupSelection={groupSelection}
                                parsedNode={parsedNode}
                                spoiler={spoilers}
                                path={"Homepage"}
                                setGroupSelection={setGroupSelection}
                            />
                        </Route>
                        <Route path={"/search/:search"}>
                            {(params) => (
                                <WikiSearchPage
                                    allEntries={allEntries}
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
                                    spoiler={spoilers}
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
