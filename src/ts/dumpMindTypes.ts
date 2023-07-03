export type DumpMindPart = {
    item: string;
    integrity: number;
    equipped: boolean;
};

export type DumpMindEntity = {
    entity: string;
    integrity: number;
    faction: number;
    entityActiveState: number;
    exposure: number;
    energy: number;
    matter: number;
    heat: number;
    corruption: number;
    speed: number;
    inventory: DumpMindPart[];
};
