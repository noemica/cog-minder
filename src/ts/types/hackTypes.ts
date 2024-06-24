import { Spoiler } from "./commonTypes";

export type HackIndirectType = "Always" | "Sometimes" | "Never";

// An individual hack can can be performed
export type JsonHack = {
    Name: string;
    BaseChance: number;
    Indirect: HackIndirectType;
    Level1DirectOnly?: boolean;
    SpoilerLevel?: Spoiler;
    Description: string;
};

// A machine category with a list of hacks
export type JsonHackableMachine = {
    DataCoreApplies: boolean;
    Name: string;
    ImageName: string;
    Hacks: JsonHack[];
};
