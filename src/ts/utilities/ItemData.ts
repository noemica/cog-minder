import itemCategories from "../../json/item_categories.json";
import { specialItemProperties } from "../specialItemProperties";
import { Spoiler } from "../types/commonTypes";
import {
    Critical,
    FabricationStats,
    Item,
    ItemCategory,
    ItemRatingCategory,
    JsonItem,
    OtherItem,
    PowerItem,
    PropulsionItem,
    UtilityItem,
    WeaponItem,
} from "../types/itemTypes";
import {
    getItemAsciiArtImageName,
    getItemSpriteImageName,
    getNoPrefixName,
    loadImage,
    parseFloatOrUndefined,
    parseIntOrDefault,
    parseIntOrUndefined,
} from "./common";

export class ItemData {
    itemData: { [key: string]: Item } = {};

    constructor(items: JsonItem[]) {
        this.itemData = {};

        // Create items
        Object.keys(items).forEach((key, index) => {
            const item = items[key];
            const itemName = item.Name;
            let newItem: Item | undefined;

            let category: ItemRatingCategory = ItemRatingCategory[item.Category ?? ""];
            if (category === undefined) {
                category = ItemRatingCategory.None;
            }

            let rating = parseIntOrUndefined(item.Rating) ?? 1;
            if (category == ItemRatingCategory.Alien) rating += 0.75;
            else if (category == ItemRatingCategory.Prototype) rating += 0.5;

            const ratingString = item.Rating;
            const fabrication: FabricationStats | undefined =
                item["Fabrication Number"] === undefined
                    ? undefined
                    : {
                          number: item["Fabrication Number"] as string,
                          time: item["Fabrication Time"] as string,
                      };

            let categories: ItemCategory[];
            if (!(itemName in itemCategories)) {
                console.log(`Need to add categories for ${itemName}`);
                categories = [];
            } else {
                categories = (itemCategories as { [key: string]: ItemCategory[] })[itemName];
            }

            const coverage = parseIntOrUndefined(item.Coverage) ?? 0;
            const hackable = !!(parseIntOrUndefined(item["Hackable Schematic"]) ?? false);
            const integrity = parseIntOrUndefined(item.Integrity) ?? 0;
            const mass = parseIntOrUndefined(item.Mass);
            const noPrefixName = getNoPrefixName(itemName);
            const size = parseIntOrUndefined(item.Size) ?? 1;
            const specialProperty = specialItemProperties[itemName];
            const spoiler: Spoiler = categories.includes("Redacted")
                ? "Redacted"
                : categories.includes("Spoiler")
                  ? "Spoiler"
                  : "None";

            switch (item["Slot"]) {
                case "N/A": {
                    const otherItem: OtherItem = {
                        slot: "N/A",
                        category: category,
                        coverage: undefined,
                        hackable: hackable,
                        integrity: integrity,
                        noRepairs: item["No Repairs"] === "1",
                        mass: undefined,
                        name: item.Name,
                        fullName: item["Full Name"],
                        noPrefixName: noPrefixName,
                        rating: rating,
                        ratingString: ratingString,
                        size: size,
                        type: item.Type,
                        description: item.Description,
                        categories: categories,
                        life: item.Life,
                        index: index,
                        specialProperty: specialProperty,
                        spoiler: spoiler,
                    };
                    newItem = otherItem;
                    break;
                }

                case "Power": {
                    let minChunks: number | undefined = undefined;
                    let maxChunks: number | undefined = undefined;

                    if (item["Chunks"] !== undefined) {
                        if (item["Chunks"].includes("-")) {
                            const split = item["Chunks"].split("-");

                            minChunks = parseInt(split[0]);
                            maxChunks = parseInt(split[1]);
                        } else {
                            minChunks = parseInt(item["Chunks"]);
                            maxChunks = minChunks;
                        }
                    }
                    const powerItem: PowerItem = {
                        slot: "Power",
                        category: category,
                        coverage: coverage,
                        energyGeneration: parseIntOrDefault(item["Energy Generation"], 0),
                        energyStorage: parseIntOrUndefined(item["Energy Storage"]),
                        hackable: hackable,
                        heatGeneration: parseIntOrUndefined(item["Heat Generation"]),
                        matterUpkeep: parseIntOrUndefined(item["Matter Upkeep"]),
                        integrity: integrity,
                        noRepairs: item["No Repairs"] === "1",
                        mass: mass,
                        name: item.Name,
                        fullName: item["Full Name"],
                        noPrefixName: noPrefixName,
                        rating: rating,
                        ratingString: ratingString,
                        size: size,
                        type: item.Type,
                        description: item.Description,
                        categories: categories,
                        effect: item.Effect,
                        fabrication: fabrication,
                        powerStability:
                            item["Power Stability"] == null
                                ? undefined
                                : parseIntOrUndefined(item["Power Stability"].slice(0, -1)),
                        explosionRadius: parseIntOrDefault(item["Explosion Radius"], 0),
                        explosionDamage: item["Explosion Damage"],
                        explosionDamageMax: parseIntOrDefault(item["Explosion Damage Max"], 0),
                        explosionDamageMin: parseIntOrDefault(item["Explosion Damage Min"], 0),
                        explosionDisruption: parseIntOrDefault(item["Explosion Disruption"], 0),
                        explosionHeatTransfer: item["Explosion Heat Transfer"],
                        explosionSalvage: parseIntOrDefault(item["Explosion Salvage"], 0),
                        explosionSpectrum: item["Explosion Spectrum"],
                        explosionType: item["Explosion Type"],
                        minChunks: minChunks,
                        maxChunks: maxChunks,
                        index: index,
                        specialProperty: specialProperty,
                        spoiler: spoiler,
                    };
                    newItem = powerItem;
                    break;
                }

                case "Propulsion": {
                    const propItem: PropulsionItem = {
                        slot: "Propulsion",
                        category: category,
                        coverage: coverage,
                        energyPerMove: parseFloatOrUndefined(item["Energy/Move"]),
                        hackable: hackable,
                        integrity: integrity,
                        noRepairs: item["No Repairs"] === "1",
                        name: item.Name,
                        fullName: item["Full Name"],
                        mass: mass,
                        noPrefixName: noPrefixName,
                        penalty: parseInt(item.Penalty as string),
                        rating: rating,
                        ratingString: ratingString,
                        size: size,
                        support: parseInt(item.Support as string),
                        timePerMove: parseInt(item["Time/Move"] as string),
                        type: item.Type,
                        fabrication: fabrication,
                        burnout: item.Burnout,
                        description: item.Description,
                        categories: categories,
                        effect: item.Effect,
                        drag: parseIntOrUndefined(item.Drag),
                        energyUpkeep: parseFloatOrUndefined(item["Energy Upkeep"]),
                        heatGeneration: parseIntOrUndefined(item["Heat Generation"]),
                        heatPerMove: parseIntOrUndefined(item["Heat/Move"]),
                        matterUpkeep: parseIntOrUndefined(item["Matter Upkeep"]),
                        modPerExtra: parseIntOrUndefined(item["Mod/Extra"]),
                        siege: item.Siege,
                        index: index,
                        specialProperty: specialProperty,
                        spoiler: spoiler,
                    };
                    newItem = propItem;
                    break;
                }

                case "Utility": {
                    const utilItem: UtilityItem = {
                        slot: "Utility",
                        category: category,
                        coverage: coverage,
                        hackable: hackable,
                        integrity: integrity,
                        noRepairs: item["No Repairs"] === "1",
                        name: item.Name,
                        fullName: item["Full Name"],
                        noPrefixName: noPrefixName,
                        rating: rating,
                        ratingString: ratingString,
                        size: size,
                        type: item.Type,
                        fabrication: fabrication,
                        description: item.Description,
                        effect: item.Effect,
                        categories: categories,
                        energyUpkeep: parseIntOrUndefined(item["Energy Upkeep"]),
                        heatGeneration: parseIntOrUndefined(item["Heat Generation"]),
                        matterUpkeep: parseIntOrUndefined(item["Matter Upkeep"]),
                        mass: parseIntOrUndefined(item.Mass) ?? 0,
                        specialTrait: item["Special Trait"],
                        index: index,
                        specialProperty: specialProperty,
                        spoiler: spoiler,
                    };
                    newItem = utilItem;
                    break;
                }

                case "Weapon": {
                    let critical: number | undefined;
                    let criticalType: Critical | undefined;
                    if (item.Critical !== undefined) {
                        const result = /(\d*)% (\w*)/.exec(item.Critical);
                        if (result === null) {
                            critical = undefined;
                            criticalType = undefined;
                        } else {
                            critical = parseInt(result[1]);
                            criticalType = result[2] as Critical;
                        }
                    }

                    let minChunks: number | undefined = undefined;
                    let maxChunks: number | undefined = undefined;

                    if (item["Chunks"] !== undefined) {
                        if (item["Chunks"].includes("-")) {
                            const split = item["Chunks"].split("-");

                            minChunks = parseInt(split[0]);
                            maxChunks = parseInt(split[1]);
                        } else {
                            minChunks = parseInt(item["Chunks"]);
                            maxChunks = minChunks;
                        }
                    }

                    const weaponItem: WeaponItem = {
                        slot: "Weapon",
                        category: category,
                        coverage: coverage,
                        hackable: hackable,
                        integrity: integrity,
                        noRepairs: item["No Repairs"] === "1",
                        name: item.Name,
                        fullName: item["Full Name"],
                        noPrefixName: noPrefixName,
                        rating: rating,
                        ratingString: ratingString,
                        size: size,
                        type: item.Type,
                        fabrication: fabrication,
                        description: item.Description,
                        effect: item.Effect,
                        categories: categories,
                        mass: parseIntOrUndefined(item.Mass) ?? 0,
                        specialTrait: item["Special Trait"],
                        critical: critical,
                        criticalType: criticalType,
                        criticalString: item.Critical,
                        delay: parseIntOrUndefined(item.Delay),
                        explosionHeatTransfer: item["Explosion Heat Transfer"],
                        explosionType: item["Explosion Type"],
                        penetration: item.Penetration,
                        projectileCount: parseIntOrUndefined(item["Projectile Count"]) ?? 1,
                        range: parseInt(item.Range as string),
                        shotEnergy: parseIntOrUndefined(item["Shot Energy"]),
                        shotHeat: parseIntOrUndefined(item["Shot Heat"]),
                        targeting: parseIntOrUndefined(item.Targeting),
                        damage:
                            item["Damage"] === undefined
                                ? item["Damage Min"] !== undefined
                                    ? `${item["Damage Min"]}-${item["Damage Max"]}`
                                    : undefined
                                : item["Damage"],
                        damageMin: parseIntOrUndefined(item["Damage Min"]),
                        damageMax: parseIntOrUndefined(item["Damage Max"]),
                        damageType: item["Damage Type"],
                        disruption: parseIntOrUndefined(item.Disruption),
                        explosionDamage:
                            item["Explosion Damage"] === undefined
                                ? item["Explosion Damage Max"] !== undefined
                                    ? `${item["Explosion Damage Min"]}-${item["Explosion Damage Max"]}`
                                    : undefined
                                : item["Explosion Damage"],
                        explosionDisruption: parseIntOrUndefined(item["Explosion Disruption"]),
                        explosionRadius: parseIntOrUndefined(item["Explosion Radius"]),
                        explosionSalvage: parseIntOrUndefined(item["Explosion Salvage"]),
                        explosionSpectrum: item["Explosion Spectrum"],
                        minChunks: minChunks,
                        maxChunks: maxChunks,
                        falloff: parseIntOrUndefined(item.Falloff),
                        heatTransfer: item["Heat Transfer"],
                        life: item.Life,
                        overloadStability:
                            item["Overload Stability"] == null
                                ? undefined
                                : parseIntOrUndefined(item["Overload Stability"].slice(0, -1)),
                        recoil: parseIntOrUndefined(item.Recoil),
                        salvage: parseIntOrUndefined(item.Salvage),
                        shotMatter: parseIntOrUndefined(item["Shot Matter"]),
                        spectrum: item.Spectrum,
                        waypoints: item.Waypoints,
                        arc: parseIntOrUndefined(item.Arc),
                        index: index,
                        specialProperty: specialProperty,
                        spoiler: spoiler,
                    };
                    newItem = weaponItem;
                    break;
                }
            }

            if (newItem !== undefined) {
                this.itemData[itemName] = newItem;
            }
        });
    }

    public getAllItems() {
        return Object.keys(this.itemData).map((itemName) => this.itemData[itemName]);
    }

    public getAllItemNames() {
        return Object.keys(this.itemData);
    }

    public getItem(itemName: string) {
        if (itemName in this.itemData) {
            return this.itemData[itemName];
        }

        throw new Error(`${itemName} not a valid item`);
    }

    public async verifyImages() {
        console.log("Verifying item images...");
        const itemPromises: Promise<any>[] = [];

        for (const item of this.getAllItems()) {
            itemPromises.push(loadImage(getItemSpriteImageName(item)));
            itemPromises.push(loadImage(getItemAsciiArtImageName(item)));
        }

        await Promise.all(itemPromises);
        console.log("Verified item images");
    }
}
