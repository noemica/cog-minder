import { Spoiler } from "./commonTypes";

export type EntryType = "Bot" | "Bot Group" | "Location" | "Other" | "Part" | "Part Group";

export type WikiEntry = {
    alternativeNames: string[];
    content: string;
    name: string;
    parentGroups: WikiEntry[];
    type: EntryType;
    spoiler: Spoiler;
    extraData?: any;
};
