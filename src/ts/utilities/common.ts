// Common code
import { Bot } from "../types/botTypes";
import { Spoiler } from "../types/commonTypes";
import { BaseItem, Item, ItemType, SpecialPropertyTypeName } from "../types/itemTypes";

// A special bot name to image name map for special/unique bots
const botNameImageMap = new Map<string, string>([
    ["01-MTF", "Programmer"],
    ["12-ASH", "Grunt"],
    ["1C-UTU", "Duelist"],
    ["5H-AD0", "Hunter"],
    ["6S-H0T", "Ranger (Derelict)"],
    ["7R-MNS", "Grunt"],
    ["7V-RTL", "Sentry"],
    ["8R-AWN", "Grunt"],
    ["99-TNT", "Demolisher"],
    ["AD-0RF", "Fireman (Derelict)"],
    ["AZ-K3N", "Sentry"],
    ["A2", "Programmer"],
    ["A3", "Programmer"],
    ["A4", "Programmer"],
    ["A5", "Programmer"],
    ["A6", "Programmer"],
    ["A7", "Programmer"],
    ["A8", "Programmer"],
    ["Access Guard", "Sentry"],
    ["Architect", "Architect"],
    ["Armor Guard", "Sentry"],
    ["Autobeam Turret", "Turret"],
    ["Bouncer", "Sentry"],
    ["Butcher (5)", "Duelist"],
    ["Butcher (7)", "Duelist"],
    ["Cetus Guard", "Sentry"],
    ["Cobbler", "Mechanic"],
    ["Combat Programmer", "Programmer"],
    ["Commander", "Grunt"],
    ["CL-ANK", "Brawler"],
    ["CL-0N3", "CL-0N3"],
    ["DD-05H", "Brawler"],
    ["DRS Ranger", "Ranger (Derelict)"],
    ["DW-4LL", "Subdweller (Derelict)"],
    ["Data Miner", "Data Miner"],
    ["Decapitator", "Cutter"],
    ["Decomposer", "Worker"],
    ["EX-BIN", "Researcher"],
    ["EX-DEC", "Researcher"],
    ["EX-HEX", "Researcher"],
    ["Enhanced Demolisher", "Demolisher"],
    ["Enhanced Hunter", "Hunter"],
    ["Enhanced Grunt", "Grunt"],
    ["Enhanced Programmer", "Programmer"],
    ["Enhanced Q-Series", "Q-Series"],
    ["Enhanced Sentry", "Sentry"],
    ["Federalist", "Grunt"],
    ["GL-D0S", "Watcher"],
    ["God Mode", "God Mode"],
    ["God Mode (Fake)", "God Mode"],
    ["Guerrilla (5)", "Hunter"],
    ["Guerrilla (7)", "Hunter"],
    ["Guru", "Programmer"],
    ["Hotshot", "Grunt"],
    ["HV-R5K", "Grunt"],
    ["Immortal", "Duelist"],
    ["Imprinter", "Imprinter"],
    ["Infiltrator (6)", "Specialist"],
    ["Infiltrator (7)", "Specialist"],
    ["Infiltrator (8)", "Specialist"],
    ["Investigator", "Researcher"],
    ["KN-7UR", "Hunter"],
    ["LRC-V4", "Cogmind"],
    ["LRC-V5", "Cogmind"],
    ["LRC-V6", "Cogmind"],
    ["LV-01A", "Demolisher"],
    ["Large Mutated Botcube", "Mutated Botcube"],
    ["Lightning", "Hunter"],
    ["Lugger", "Hauler"],
    ["M Guard", "Sentry"],
    ["M Shell/Atk", "Sentry"],
    ["M Shell/Def", "Protector"],
    ["MAIN.C", "MAIN.C2"],
    ["MAIN.C (Shell)", "MAIN.C1"],
    ["ME-RLN", "Programmer"],
    ["Master Thief", "Thief (Derelict)"],
    ["Marauder (6)", "Behemoth"],
    ["Marauder (8)", "Behemoth"],
    ["Martyr (5)", "Demolisher"],
    ["Martyr (7)", "Demolisher"],
    ["Mutated Botcube", "Mutated Botcube"],
    ["NK-0LA", "Specialist"],
    ["Optimus", "Optimus"],
    ["Overlord", "Heavy"],
    ["Packrat", "Recycler"],
    ["Perun", "Perun"],
    ["Protovariant D", "Demolisher"],
    ["Protovariant G", "Grunt"],
    ["Protovariant H", "Hunter"],
    ["Protovariant L", "Duelist"],
    ["Protovariant P", "Programmer"],
    ["Protovariant X", "Specialist"],
    ["Protovariant Y", "Sentry"],
    ["P1-3CE", "Mutant (Derelict)"],
    ["QV-33N", "QV-33N"],
    ["Quarantine Guard", "Sentry"],
    ["Revision", "Revision"],
    ["Revision 17", "Revision 17"],
    ["Revision 17++", "Revision 17++"],
    ["S7 Guard", "Sentry"],
    ["Sapper", "Grunt"],
    ["Savage (5)", "Brawler"],
    ["Savage (7)", "Brawler"],
    ["Sigix Warrior", "Sigix Warrior"],
    ["Superbehemoth", "Behemoth"],
    ["Superfortress", "Fortress (Prototype)"],
    ["Surgeon (4)", "Mechanic"],
    ["Surgeon (6)", "Mechanic"],
    ["Surveybot 24", "Researcher"],
    ["Svarog", "Svarog"],
    ["Tinkerer", "Researcher"],
    ["Thunder", "Hunter"],
    ["Thug (5)", "Grunt"],
    ["Thug (7)", "Grunt"],
    ["Tracker", "Swarmer"],
    ["Triborg", "Triborg"],
    ["Triborg (Optimus)", "Triborg"],
    ["VL-GR5", "Specialist"],
    ["Warbot", "Mutant (Derelict)"],
    ["Warlord", "Warlord"],
    ["Warlord (Command)", "Warlord"],
    ["Warlord 4Z-XS3", "Warlord"],
    ["Warlord AM-PH4", "Warlord"],
    ["Warlord D3-CKR", "Warlord"],
    ["Warlord HL-1SK", "Warlord"],
    ["Warlord KY-Z71", "Warlord"],
    ["Warlord MG-163", "Warlord"],
    ["Warlord SH-K8T", "Warlord"],
    ["Warlord Statue (Bot)", "Warlord"],
    ["Wasp (5)", "Swarmer"],
    ["Wasp (7)", "Swarmer"],
    ["Wizard (5)", "Programmer"],
    ["Wizard (7)", "Programmer"],
    ["Wyrm Statue", "Dragon (Derelict)"],
    ["YI-UF0", "Grunt"],
    ["Z-Courier", "Hauler"],
    ["Z-Drone", "Drone"],
    ["Z-Experimental (8)", "Z-Ex"],
    ["Z-Experimental (10)", "Z-Ex"],
    ["Z-Imprinter", "Imprinter"],
    ["Z-Technician", "Operator"],
    ["Zhirov", "Zhirov"],
]);

// A list of items with no gallery art
export const itemsWithNoArt = new Set([
    "T-thruster",
    "Mak. Microthruster",
    "Integrated Tracker Drive",
    "Detonator",
    "Splice Injector",
    "Mni. Tearclaws",
    "DAS Cannon",
    "Compactor",
    "Asb. Blade",
    "Asb. F-torch",
    "Asb. Gauss Rifle",
    "Asb. Heavy Rifle",
    "Asb. Hover System",
    "Asb. Hover Unit",
    "Asb. Maul",
    "Asb. P-maul",
    "Asb. P-torch",
    "Asb. P-sword",
    "Asb. Rifle",
    "Asb. Shotgun",
    "Vortex Shredder",
    "Centrium Claws",
    "T.R.O.L.L. Exoskeleton",
    "Master Link",
]);

// Character -> escape character map
export const entityMap: { [key: string]: string } = {
    "&": "&amp;",
    "<": "ᐸ",
    ">": "ᐳ",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
    "\n": "<br />",
};

export const rootDirectory = "cog-minder";

// Compile-time assert that code is unreachable
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(val: never): never {
    throw new Error(`This should not be reachable: ${val}`);
}

// Determines if the given part can be shown based on the current spoilers state
export function canShowPart(part: Item, spoilersState: Spoiler): boolean {
    if (spoilersState === "None") {
        // No spoilers, check that none of the categories are spoilers/redacted
        if (!part.categories.every((c) => c !== "Spoiler" && c !== "Redacted")) {
            return false;
        }
    } else if (spoilersState == "Spoiler") {
        // Spoilers allowed, check only for redacted category
        if (!part.categories.every((c) => c != "Redacted")) {
            return false;
        }
    } else {
        // Redacted, no checks
        return true;
    }

    return true;
}

// Determines whether something can be shown based on the spoiler state to check and the global state
export function canShowSpoiler(stateToCheck: Spoiler, globalState: Spoiler): boolean {
    if (globalState === "None" && stateToCheck !== "None") {
        // No spoilers, only show none
        return false;
    } else if (globalState == "Spoiler" && !(stateToCheck === "None" || stateToCheck === "Spoiler")) {
        // Spoilers allowed, show all but redacted
        return false;
    }

    return true;
}

// Ceil the number to the nearest multiple
export function ceilToMultiple(num: number, multiple: number) {
    return Math.ceil(num / multiple) * multiple;
}

// Links to an external image if a valid full URL, otherwise creates a relative path
export function createImagePath(nameOrUrl: string, fileDir: string = "") {
    try {
        new URL(nameOrUrl);
        return nameOrUrl;
    } catch (_) {
        return `/${rootDirectory}/${fileDir}${nameOrUrl}`;
    }
}

// Escapes the given string with HTML entities
export function escapeHtml(string: string): string {
    return string.replace(/[&<>"'`=/\n]/g, function (s) {
        return entityMap[s];
    });
}

// Flatten an array of arrays into a single array
export function flatten<T>(arrays: Array<Array<T>>): Array<T> {
    const array: Array<T> = [];
    return array.concat(...arrays);
}

// Do a lexicographical sort based on the no-prefix item name
export function gallerySort(itemA: Item, itemB: Item): number {
    const noPrefixA = getNoPrefixName(itemA.name);
    const noPrefixB = getNoPrefixName(itemB.name);
    let res = noPrefixA < noPrefixB ? -1 : noPrefixA > noPrefixB ? 1 : 0;

    if (res === 0) {
        // If no-prefix names match then use index in gallery export
        // There may be some formula to determine the real order or
        // it may be a hand-crafted list, I couldn't tell either way.
        // The export index will always be ordered for different prefix
        // versions of the same parts so this is the best way to sort
        // them how the in-game gallery does.
        res = itemA.index - itemB.index;
    }

    return res;
}

// Gets the paths for all sizes of images for a specified bot
const spriteSizes = ["12", "14", "16", "18", "24", "48"];
export function getBotImageNames(bot: Bot): string[] {
    const imageName = botNameImageMap.get(bot.name);
    if (imageName !== undefined) {
        return spriteSizes.map((size) => createImagePath(`game_sprites/${imageName}_${size}.png`));
    }

    return spriteSizes.map((size) => createImagePath(`game_sprites/${bot.class}_${size}.png`));
}

// Gets the paths for all sizes of images for a specified bot
export function getLargeBotImageName(bot: Bot): string {
    const imageName = botNameImageMap.get(bot.name);
    if (imageName !== undefined) {
        return createImagePath(`game_sprites/${imageName}_48.png`);
    }

    return createImagePath(`game_sprites/${bot.class}_48.png`);
}

// Gets the 24 tile size image name of an item
export function getDefaultItemSpriteImageName(item: Item): string {
    return createImagePath(`game_sprites/${item.type}_24.png`);
}

// Gets all sprite image names of an item
export function getItemSpriteImageNames(item: Item): string[] {
    return spriteSizes.map((size) => createImagePath(`game_sprites/${item.type}_${size}.png`));
}

// Gets the sprite image name of an item
export function getItemAsciiArtImageName(item: Item): string {
    if (item.imageName !== undefined) {
        return item.imageName;
    }

    if (itemsWithNoArt.has(item.name)) {
        // Some items have no gallery art
        return createImagePath("part_art/No Image Data.png");
    }

    return createImagePath(`part_art/${item.name.replace(/"/g, "").replace(/\//g, "")}.png`);
}

// Converts a normal string to a string safe to be used in an URL
export function getLinkSafeString(str: string) {
    return str
        .replaceAll("%", "%25")
        .replaceAll(" ", "%20")
        .replaceAll("#", "%23")
        .replaceAll("&", "%26")
        .replaceAll("(", "%28")
        .replaceAll(")", "%29")
        .replaceAll(",", "%2C")
        .replaceAll("/", "%2F")
        .replaceAll("\\", "%5C");
}

// Gets a location string with query parameters based on the given state object
export function getLocationFromState<T extends object>(
    baseLocation: string,
    stateObject: T,
    skipMember: (key: string, stateObject: T) => boolean,
) {
    let location = baseLocation;
    let search = "";

    for (const key of Object.keys(stateObject)) {
        if (stateObject[key] !== undefined) {
            if (skipMember(key, stateObject)) {
                continue;
            }

            if (typeof stateObject[key] === "string" && (stateObject[key] as string).length === 0) {
                // Skip empty values
                continue;
            }

            // Special escaping needs to match parseSearchParameters
            const paramValue = getLinkSafeString(stateObject[key] as string);

            // Append to search
            if (search.length === 0) {
                search = `${key}=${paramValue}`;
            } else {
                search += `&${key}=${paramValue}`;
            }
        }
    }

    if (search.length > 0) {
        location += `?${search}`;
    }

    return location;
}

// Gets the movement name given a propulsion type
export function getMovementText(propulsionType: ItemType | undefined): string {
    switch (propulsionType) {
        case "Flight Unit":
            return "Flying";
        case "Hover Unit":
            return "Hovering";
        case "Leg":
            return "Walking";
        case "Treads":
            return "Treading";
        case "Wheel":
            return "Rolling";
        default:
            return "Core";
    }
}

// Gets the top 2 highest values in an array, or 0 if undefined
export function getTopTwoValues(values: number[]) {
    values = values.sort((a, b) => b - a).splice(0, 2);
    return [values[0] === undefined ? 0 : values[0], values[1] === undefined ? 0 : values[1]];
}

// Converts a string from getLinkSafeString to a normal string
export function getStringFromLinkSafeString(str: string) {
    return str
        .replaceAll("%20", " ")
        .replaceAll("%23", "#")
        .replaceAll("%25", "%")
        .replaceAll("%26", "&")
        .replaceAll("%28", "(")
        .replaceAll("%29", ")")
        .replaceAll("%2C", ",")
        .replaceAll("%2F", "/")
        .replaceAll("%5C", "\\");
}

// Gets a per-TU value scaled to the given number of TUs
export function getValuePerTus(baseValue: number, numTus: number): number {
    return (baseValue * numTus) / 100;
}

// Removes the prefix from an item name
const noPrefixRegex = /\w{3}\. (.*)/;
export function getNoPrefixName(name: string): string {
    const newName = name.replace(noPrefixRegex, "$1");
    return newName;
}

export function getSpoilersValue<T>(spoiler: Spoiler, noSpoilerValue: T, spoilersValue: T, redactedValue: T): T {
    if (spoiler === "Spoiler") {
        return spoilersValue;
    } else if (spoiler === "Redacted") {
        return redactedValue;
    } else {
        return noSpoilerValue;
    }
}

// Checks if a part has an active special property of the given type
export function hasActiveSpecialProperty(
    part: Item,
    partActive: boolean,
    propertyType: SpecialPropertyTypeName,
): boolean {
    if (part.specialProperty === undefined) {
        return false;
    }

    if (part.specialProperty.trait.kind !== propertyType) {
        return false;
    }

    if (part.specialProperty.active === "Part Active" && !partActive) {
        return false;
    }

    return true;
}

export function isDev() {
    return process.env.NODE_ENV === "development";
}

// Determines if the given item type is melee
export function isPartMelee(part: BaseItem): boolean {
    if (
        part.type === "Impact Weapon" ||
        part.type === "Piercing Weapon" ||
        part.type === "Slashing Weapon" ||
        part.type === "Special Melee Weapon"
    ) {
        return true;
    }

    return false;
}

// Converts leetspeak numbers in a string to characters
export function leetSpeakMatchTransform(name: string): string {
    return name
        .replace(/0/, "o")
        .replace(/1/, "i")
        .replace(/3/, "e")
        .replace(/4/, "a")
        .replace(/7/, "t")
        .replace(/5/, "s")
        .replace(/8/, "b");
}

// Returns a promise waiting for the given image url to be loaded, returns success of load
// Will log to console if image not found
export async function loadImage(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
            resolve(true);
        };
        image.onerror = () => {
            console.log(`Found invalid image ${image.src}`);
            resolve(false);
        };
        image.src = imageUrl;
    });
}

// Converts an item or bot's name to an HTML id
const nameToIdRegex = /[ /.'"\][]]*/g;
export function nameToId(name: string): string {
    const id = `item${name.replace(nameToIdRegex, "")}`;
    return id;
}

// Parses the string into a number or null if invalid
export function parseFloatOrUndefined(value: string | undefined): number | undefined {
    const int = parseFloat(value ?? "");

    if (isNaN(int)) {
        return undefined;
    }

    return int;
}

// Attempts to parse an int from the string, otherwise uses the default value
export function parseIntOrDefault(string: string | number | undefined, defaultVal: number): number {
    const value = parseInt(string as string);
    if (isNaN(value)) {
        return defaultVal;
    }

    return value;
}

// Parses the string into a number or undefined if invalid
export function parseIntOrUndefined(value: string | undefined): number | undefined {
    const int = parseInt(value ?? "");

    if (isNaN(int)) {
        return undefined;
    }

    return int;
}

const paramRegex = /^(.*)=(.*)$/;
export function parseSearchParameters<T>(search: string, object: T): T {
    if (search.length === 0) {
        // If no search state set then return default of no state set
        return object;
    }

    const setParams = search.split("&");

    for (const param of setParams) {
        const match = paramRegex.exec(param);
        if (!match) {
            // Failed to get param out of URL, just ignore
            console.log(`Failed to parse page parameter ${param}`);
            continue;
        }

        const paramName = match[1];
        const paramValue = match[2];

        // Assign the parameter
        // Special escaping needs to match getLocationFromState
        object[paramName] = getStringFromLinkSafeString(paramValue);
    }

    return object;
}

// Gets a random integer between the min and max values (inclusive)
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sums the two values
export function sum(a: number, b: number): number {
    return a + b;
}

// Unescapes the given string with HTML entities
export function unescapeHtml(string: string): string {
    for (const entity of Object.keys(entityMap)) {
        string = string.replace(new RegExp(entityMap[entity], "g"), entity);
    }

    return string;
}

// Returns the value if it's not undefined, otherwise return defaultVal
export function valueOrDefault<T>(val: T | undefined, defaultVal: T): T {
    if (val === undefined) {
        return defaultVal;
    }

    return val;
}
