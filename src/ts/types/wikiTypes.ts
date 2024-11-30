import { Spoiler } from "./commonTypes";

export type EntryType = "Bot" | "Bot Group" | "Location" | "Other" | "Part" | "Part Group" | "Part Supergroup";

export type WikiEntry = {
    alternativeNames: string[];
    content: string;
    extraData?: any;
    fakeGroup?: boolean;
    hasSupergroupChildren?: boolean;
    name: string;
    parentGroups: WikiEntry[];
    spoiler: Spoiler;
    type: EntryType;
};
