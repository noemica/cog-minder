export type JsonRifAbility = {
    Name: string;
    MinAbilities: string;
    Levels: string;
    Description: string;
};

export type JsonBotHack = {
    Name: string;
    Rif: boolean;
    Charges: number;
    Description: string;
};

export type JsonRifHackCategory = {
    CategoryName: string;
    Targets: string[];
    Hacks: JsonBotHack[];
};

export type JsonRifContents = {
    Abilities: JsonRifAbility[];
    Hacks: JsonRifHackCategory[];
}