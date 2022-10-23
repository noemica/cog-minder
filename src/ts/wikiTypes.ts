import { Spoiler } from "./commonTypes";

export type EntryType = "Part" | "Bot" | "Bot Group" | "Location" | "Other";

export type WikiEntry = {
    alternativeNames: string[];
    content: string;
    name: string;
    type: EntryType;
    spoiler: Spoiler;
    extraData?: any;
};
