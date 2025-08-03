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

export type WikiEntry = {
    alternativeNames: string[];
    childEntries: WikiEntry[];
    content: string;
    extraData?: any;
    fakeGroup?: boolean;
    hasSupergroupChildren?: boolean;
    name: string;
    parentEntries: WikiEntry[];
    spoiler: Spoiler;
    type: EntryType;
};
