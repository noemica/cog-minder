import { canShowSpoiler } from "../utilities/common";
import { Spoiler } from "./commonTypes";

export type EntryType =
    | "Bot"
    | "Bot Group"
    | "Bot Supergroup"
    | "Location"
    | "Other"
    | "Part"
    | "Part Group"
    | "Part Supergroup";

export class WikiEntry {
    alternativeNames: string[];
    childEntries: WikiEntry[];
    content: string;
    name: string;
    parentEntries: WikiEntry[];
    spoiler: Spoiler;
    type: EntryType;
    extraData?: any;
    fakeGroup: boolean;
    hasSupergroupChildren: boolean;

    constructor(
        alternativeNames: string[],
        childEntries: WikiEntry[],
        content: string,
        name: string,
        spoiler: Spoiler,
        type: EntryType,
        extraData?: any,
        fakeGroup?: boolean,
        hasSupergroupChildren?: boolean,
    ) {
        this.alternativeNames = alternativeNames;
        this.childEntries = childEntries;
        this.content = content;
        this.name = name;
        this.parentEntries = [];
        this.spoiler = spoiler;
        this.type = type;
        this.extraData = extraData;
        this.fakeGroup = fakeGroup ?? false;
        this.hasSupergroupChildren = hasSupergroupChildren ?? false;
    }

    public hasAncestorEntry(entry: WikiEntry) {
        for (const parent of this.parentEntries) {
            if (entry === parent || parent.hasAncestorEntry(entry)) {
                return true;
            }
        }

        return false;
    }

    public hasDescendantEntry(entry: WikiEntry) {
        for (const child of this.childEntries) {
            if (entry === child || child.hasDescendantEntry(entry)) {
                return true;
            }
        }

        return false;
    }

    public hasVisibleDescendant(spoiler: Spoiler) {
        for (const child of this.childEntries) {
            if (canShowSpoiler(child.spoiler, spoiler) || child.hasVisibleDescendant(spoiler)) {
                return true;
            }
        }

        return false;
    }

    public getMaxEntryDepth() {
        if (this.type === "Part" || this.type === "Bot" || this.type == "Location") {
            return 1;
        } else if (this.type === "Part Group" || this.type === "Bot Group") {
            return 2;
        } else {
            const childEntries = this.childEntries;

            if (childEntries.length === 0) {
                return 1;
            }

            return 1 + Math.max(...childEntries.map((entry) => entry.getMaxEntryDepth()));
        }
    }
}
