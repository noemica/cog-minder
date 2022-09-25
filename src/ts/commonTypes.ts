export type PageType = "About" | "Bots" | "Build" | "Hacks" | "Lore" | "Parts" | "RIF" | "Simulator" | "Wiki";

export const pageTypes: PageType[] = ["About", "Bots", "Build", "Hacks", "Lore", "Parts", "RIF", "Simulator", "Wiki"];

// An enum to represent spoiler level
export type Spoiler = "None" | "Spoilers" | "Redacted";

// A map location
export type MapLocation = {
    branch: boolean;
    exits: MapLocation[];
    minDepth: string;
    maxDepth: string;
    name: string;
    specialBots: string[];
    specialParts: string[];
    spoiler: Spoiler;
};
