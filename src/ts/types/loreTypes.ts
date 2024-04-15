import { Spoiler } from "./commonTypes";

export type JsonLoreEntry = {
    "Name/Number": string;
    Spoiler?: Spoiler;
    Content: string;
};

export type JsonLoreGroup = {
    Name: string;
    Content: string;
    Spoiler?: Spoiler;
    Entries: JsonLoreEntry[];
};
