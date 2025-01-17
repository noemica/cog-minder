import { ReactNode, useEffect, useMemo, useState } from "react";
import { Route, Router, Switch, useLocation, useRoute } from "wouter";
// eslint-disable-next-line import/no-unresolved
import { useHashLocation } from "wouter/use-hash-location";

import wiki from "../../../../json/wiki.json";
import { Bot } from "../../../types/botTypes";
import { MapLocation, Spoiler } from "../../../types/commonTypes";
import { Item, PowerItem, PropulsionItem, WeaponItem } from "../../../types/itemTypes";
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
    parseIntOrDefault,
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

function addBotGroups(addEntry: (entry: WikiEntry) => void, allEntries: Map<string, WikiEntry>) {
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
            parentEntries: [],
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
            botEntry.parentEntries.push(entry);
            botEntries.push(botEntry);
        }

        botEntries.sort((entry1, entry2) => {
            const bot1 = entry1.extraData as Bot;
            const bot2 = entry2.extraData as Bot;

            return botCompare(bot1, bot2);
        });
    }
}

function addBots(botData: BotData, addEntry: (entry: WikiEntry) => void) {
    for (const botEntry of wiki.Bots) {
        const bot = botData.getBot(botEntry.Name);

        addEntry({
            alternativeNames: [],
            content: botEntry.Content,
            extraData: bot,
            name: botEntry.Name,
            parentEntries: [],
            spoiler: bot.spoiler,
            type: "Bot",
        });
    }
}

function addBotSupergroups(addEntry: (entry: WikiEntry) => void, allEntries: Map<string, WikiEntry>) {
    for (const botSupergroupEntry of wiki["Bot Supergroups"]) {
        let spoiler: Spoiler = "None";
        if (botSupergroupEntry.Spoiler === "Redacted") {
            spoiler = "Redacted";
        } else if (botSupergroupEntry.Spoiler === "Spoiler") {
            spoiler = "Spoiler";
        }
        const groupEntries: WikiEntry[] = [];
        const entry: WikiEntry = {
            alternativeNames: botSupergroupEntry.AlternateNames || [],
            content: botSupergroupEntry.Content ?? "",
            extraData: groupEntries,
            name: botSupergroupEntry.Name,
            parentEntries: [],
            spoiler: spoiler,
            type: "Bot Supergroup",
        };
        addEntry(entry);

        if (botSupergroupEntry.Groups !== undefined) {
            for (const groupName of botSupergroupEntry.Groups) {
                const groupEntry = allEntries.get(groupName);
                if (groupEntry === undefined) {
                    console.log(`Found bad bot group name ${groupName} in group ${entry.name}`);
                    continue;
                }

                if (groupEntry.type !== "Bot Group") {
                    console.log(`Found non-group ${groupName} in bot group ${entry.name}`);
                    continue;
                }

                // Set the bot's parent group to point to this
                groupEntry.parentEntries.push(entry);
                groupEntries.push(groupEntry);
            }
        }

        if (botSupergroupEntry.Bots !== undefined) {
            const botEntries: WikiEntry[] = [];

            for (const botName of botSupergroupEntry.Bots) {
                const botEntry = allEntries.get(botName);
                if (botEntry === undefined) {
                    console.log(`Found bad bot name ${botName} in group ${botSupergroupEntry.Name}`);
                    continue;
                }

                if (botEntry.type !== "Bot") {
                    console.log(`Found non-bot ${botEntry.name} in bot group ${entry.name}`);
                    continue;
                }

                // Set the part's parent group to point to this
                botEntry.parentEntries.push(entry);
                botEntries.push(botEntry);
            }

            botEntries.sort((entry1, entry2) => {
                entry1.name.localeCompare(entry2.name);
                const bot1 = entry1.extraData as Bot;
                const bot2 = entry2.extraData as Bot;

                return botCompare(bot1, bot2);
            });

            if (botEntries.length > 0) {
                groupEntries.push({
                    alternativeNames: [],
                    content: "",
                    fakeGroup: true,
                    name: "Other",
                    parentEntries: [],
                    spoiler: "None",
                    type: "Bot Group",
                    extraData: botEntries,
                });
            }
        }
    }

    // Need to do a second pass for supergroups that contain other supergroups
    for (const botSupergroupEntry of wiki["Bot Supergroups"]) {
        if (botSupergroupEntry.Supergroups === undefined) {
            continue;
        }

        const entry = allEntries.get(botSupergroupEntry.Name)!;
        const groupEntries = entry.extraData as WikiEntry[];

        for (const superGroupName of botSupergroupEntry.Supergroups) {
            const superGroupEntry = allEntries.get(superGroupName);
            if (superGroupEntry === undefined) {
                console.log(
                    `Found bad part supergroup name ${superGroupName} in supergroup ${botSupergroupEntry.Name}`,
                );
                continue;
            }

            if (superGroupEntry.type !== "Bot Supergroup") {
                console.log(`Found non-part supergroup name ${superGroupEntry.name} in supergroup ${entry.name}`);
                continue;
            }

            entry.hasSupergroupChildren = true;

            if (isEntryAncestor(superGroupEntry, entry)) {
                console.log(`Found recursion with bot supergroups ${entry.name} and ${superGroupEntry.name}`);
            } else {
                // Set the part's parent group to point to this
                superGroupEntry.parentEntries.push(entry);
                groupEntries.push(superGroupEntry);
            }
        }

        groupEntries.sort((entry1, entry2) => entry1.name.localeCompare(entry2.name));
    }
}

function addLocations(
    botData: BotData,
    itemData: ItemData,
    addEntry: (entry: WikiEntry) => void,
    allEntries: Map<string, WikiEntry>,
) {
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
            parentEntries: [],
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
                exitLocation.entries.push({ depthsString: exit.Depths, location: entryLocation });
            }
        }
    }
}

function addOther(addEntry: (entry: WikiEntry) => void, allEntries: Map<string, WikiEntry>) {
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
            extraData: [],
            name: otherEntry.Name,
            parentEntries: [],
            type: "Other",
            spoiler: spoiler,
        };

        addEntry(entry);
    }

    // After adding all pages, add grouped subcategories based on name
    for (const entry of allEntries.values()) {
        if (entry.type !== "Other") {
            continue;
        }

        if (entry.name.includes("/")) {
            const slashName = entry.name.split("/")[0];
            const parentEntry = allEntries.get(slashName);

            if (parentEntry !== undefined) {
                const childEntries = parentEntry.extraData as WikiEntry[];
                childEntries.push(entry);
                entry.parentEntries.push(parentEntry);
            }
        }
    }

    // Add subpages after all pages have been processed
    for (const otherEntry of wiki.Other) {
        if (otherEntry.Subpages !== undefined) {
            const parentEntry = allEntries.get(otherEntry.Name)!;
            const entries = parentEntry.extraData as WikiEntry[];

            for (const entryName of otherEntry.Subpages) {
                const entry = allEntries.get(entryName);
                if (entry === undefined) {
                    console.log(`Found bad page name ${entryName} in group ${otherEntry.Name}`);
                    continue;
                }

                // Add to the page's parent groups
                entry.parentEntries.push(parentEntry);
                entries.push(entry);
            }
        }
    }
}

function addPartGroups(addEntry: (entry: WikiEntry) => void, itemData: ItemData, allEntries: Map<string, WikiEntry>) {
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
            parentEntries: [],
            spoiler: spoiler,
            type: "Part Group",
        };
        addEntry(entry);

        let children: string[] = [];

        if (partGroupEntry.Parts) {
            children = partGroupEntry.Parts;
        } else if (partGroupEntry["Part Category"]) {
            children = getItemCategoryItems(partGroupEntry["Part Category"], itemData);
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
            partEntry.parentEntries.push(entry);
            partEntries.push(partEntry);
        }

        partEntries.sort((entry1, entry2) => {
            const item1 = entry1.extraData as Item;
            const item2 = entry2.extraData as Item;

            return itemCompare(item1, item2);
        });
    }
}

function addParts(itemData: ItemData, addEntry: (entry: WikiEntry) => void) {
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
            parentEntries: [],
            spoiler: spoiler,
            type: "Part",
        });
    }
}

function addPartSupergroups(addEntry: (entry: WikiEntry) => void, allEntries: Map<string, WikiEntry>) {
    for (const partSupergroupEntry of wiki["Part Supergroups"]) {
        let spoiler: Spoiler = "None";
        if (partSupergroupEntry.Spoiler === "Redacted") {
            spoiler = "Redacted";
        } else if (partSupergroupEntry.Spoiler === "Spoiler") {
            spoiler = "Spoiler";
        }

        const groupEntries: WikiEntry[] = [];
        const entry: WikiEntry = {
            alternativeNames: [],
            content: partSupergroupEntry.Content ?? "",
            extraData: groupEntries,
            name: partSupergroupEntry.Name,
            parentEntries: [],
            spoiler: spoiler,
            type: "Part Supergroup",
        };
        addEntry(entry);

        if (partSupergroupEntry.Groups !== undefined) {
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
                groupEntry.parentEntries.push(entry);
                groupEntries.push(groupEntry);
            }
        }

        if (partSupergroupEntry.Parts !== undefined) {
            const partEntries: WikiEntry[] = [];

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
                partEntry.parentEntries.push(entry);
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
                    parentEntries: [],
                    spoiler: "None",
                    type: "Part Group",
                    extraData: partEntries,
                });
            }
        }
    }

    // Need to do a second pass for supergroups that contain other supergroups
    for (const partSupergroupEntry of wiki["Part Supergroups"]) {
        if (partSupergroupEntry.Supergroups === undefined) {
            continue;
        }

        const entry = allEntries.get(partSupergroupEntry.Name)!;
        const groupEntries = entry.extraData as WikiEntry[];

        for (const superGroupName of partSupergroupEntry.Supergroups) {
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

            if (isEntryAncestor(superGroupEntry, entry)) {
                console.log(`Found recursion with part supergroups ${entry.name} and ${superGroupEntry.name}`);
            } else {
                // Set the part's parent group to point to this
                superGroupEntry.parentEntries.push(entry);
                groupEntries.push(superGroupEntry);
            }
        }

        groupEntries.sort((entry1, entry2) => entry1.name.localeCompare(entry2.name));
    }
}

const itemCategoryFilters = new Map<string, (item: Item) => boolean>([
    ["Alien Artifacts", (item) => item.ratingCategory === "Alien"],
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
    ["Guided Weapons", (item) => item.slot === "Weapon" && (item as WeaponItem).waypoints !== undefined],
    ["Hover Units", (item) => item.type === "Hover Unit"],
    ["Hybrid Power", (item) => item.slot === "Power" && item.name.startsWith("Hyb.")],
    ["Impact Weapons", (item) => item.type === "Impact Weapon"],
    ["Legs", (item) => item.type === "Leg"],
    ["Overloadable Power", (item) => item.slot === "Power" && (item as PowerItem).powerStability !== undefined],
    ["Overloadable Propulsion", (item) => item.slot === "Propulsion" && (item as PropulsionItem).burnout !== undefined],
    ["Overloadable Weapons", (item) => item.slot === "Weapon" && (item as WeaponItem).overloadStability !== undefined],
    ["Overtuned Parts", (item) => item.name.startsWith("Ovr.")],
    ["Phasers", (item) => item.type === "Energy Gun" && (item as WeaponItem).damageType === "Phasic"],
    ["Piercing Weapons", (item) => item.type === "Piercing Weapon"],
    ["Power Cores", (item) => item.type === "Power Core"],
    ["Reactors", (item) => item.type === "Reactor"],
    ["Reinforced Power", (item) => item.slot === "Power" && item.name.startsWith("Rnf.")],
    [
        "Resistance Armor",
        (item) =>
            item.type === "Protection" &&
            item.specialProperty !== undefined &&
            item.specialProperty.trait.kind === "DamageResists",
    ],
    ["Special Weapons", (item) => item.type === "Special Weapon"],
    ["Slashing Weapons", (item) => item.type === "Slashing Weapon"],
    [
        "Temporary Slot Parts",
        (item) => item.effect?.startsWith("When attached, gives access to additional temporary slot") || false,
    ],
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

    addBots(botData, addEntry);
    addBotGroups(addEntry, allEntries);
    addBotSupergroups(addEntry, allEntries);

    addLocations(botData, itemData, addEntry, allEntries);

    addParts(itemData, addEntry);
    addPartGroups(addEntry, itemData, allEntries);
    addPartSupergroups(addEntry, allEntries);

    addOther(addEntry, allEntries);

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

            function removeItems(entry: WikiEntry) {
                if (entry.type === "Part Group" || entry.type === "Part Supergroup") {
                    for (const childEntry of entry.extraData as WikiEntry[]) {
                        removeItems(childEntry);
                    }
                } else if (entry.type === "Part") {
                    items.delete(entry.extraData as Item);
                }
            }

            removeItems(supergroupEntry);

            if (items.size !== 0) {
                console.log(`Found uncategorized items for supergroup ${supergroupEntry.name}`);
                for (const item of items.values()) {
                    console.log(item.name);
                }
            }
        }

        checkType(allEntries.get("Armor")!, (item) => item.type === "Protection" && !item.effect?.includes("Absorbs "));
        checkType(allEntries.get("Energy Cannons")!, (item) => item.type === "Energy Cannon");
        checkType(allEntries.get("Energy Guns")!, (item) => item.type === "Energy Gun");
        checkType(allEntries.get("Launchers")!, (item) => item.type === "Launcher");
        checkType(allEntries.get("Power")!, (item) => item.slot === "Power");
        checkType(allEntries.get("Propulsion")!, (item) => item.slot === "Propulsion");
        checkType(allEntries.get("Special Melee Weapons")!, (item) => item.type === "Special Melee Weapon");
        checkType(allEntries.get("Special Weapons")!, (item) => item.type === "Special Weapon");
        checkType(allEntries.get("Utilities")!, (item) => item.slot === "Utility");
        checkType(allEntries.get("Weapons")!, (item) => item.slot === "Weapon");
    }

    return allEntries;
}

function isEntryAncestor(entry: WikiEntry, parentEntry: WikiEntry) {
    if (entry === parentEntry) {
        return true;
    }

    for (const grandparentEntry of parentEntry.parentEntries) {
        if (isEntryAncestor(entry, grandparentEntry)) {
            return true;
        }
    }

    return false;
}

function botCompare(bot1: Bot, bot2: Bot) {
    const bot1Tier = parseIntOrDefault(bot1.tier, 1);
    const bot2Tier = parseIntOrDefault(bot2.tier, 1);
    if (bot1Tier === bot2Tier) {
        return bot1.name.localeCompare(bot2.name);
    }

    return bot1Tier - bot2Tier;
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
