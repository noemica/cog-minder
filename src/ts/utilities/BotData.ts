import botExtraData from "../../json/bot_extra_data.json";
import lore from "../../json/lore.json";
import { Bot, BotCategory, BotPart, ItemOption, JsonBot, JsonBotExtraData } from "../types/botTypes";
import {
    Actuator,
    ActuatorArray,
    EnergyStorage,
    FabricationStats,
    Injector,
    Item,
    ItemType,
    ItemWithUpkeep,
    Kinecellerator,
    MassSupport,
    MeleeAnalysis,
    ParticleCharging,
    PropulsionItem,
    RangedWeaponCycling,
    WeaponItem,
} from "../types/itemTypes";
import { ItemData } from "./ItemData";
import {
    ceilToMultiple,
    getBotImageNames,
    hasActiveSpecialProperty,
    loadImage,
    parseIntOrDefault,
    sum,
} from "./common";
import { volleyTimeMap } from "./simulatorCalcs";

export class BotData {
    botData: { [key: string]: Bot } = {};

    constructor(bots: JsonBot[], itemData: ItemData) {
        // Create bots
        Object.keys(bots).forEach((key) => {
            function sumItemCoverage(sum: number, data: string | ItemOption[]) {
                if (typeof data === "string") {
                    // Item name, just parse coverage
                    return (itemData.getItem(data).coverage as number) + sum;
                } else {
                    // Option, return largest sum of items
                    let largest = 0;
                    data.forEach((optionData) => {
                        if (optionData.name === "None") {
                            return;
                        }

                        const number = optionData.number ?? 1;
                        const item = itemData.getItem(optionData.name);
                        const optionCoverage = (item.coverage as number) * number;
                        largest = Math.max(largest, optionCoverage);
                    });

                    return largest + sum;
                }
            }

            const bot = (bots as any as { [key: string]: JsonBot })[key];
            const botName = bot.Name;
            const itemCoverage =
                (bot.Armament?.reduce(sumItemCoverage, 0) ?? 0) + (bot.Components?.reduce(sumItemCoverage, 0) ?? 0);

            let roughCoreCoverage = (100.0 / (100.0 - parseInt(bot["Core Exposure %"]))) * itemCoverage - itemCoverage;
            if (isNaN(roughCoreCoverage)) {
                roughCoreCoverage = 1;
            }
            const estimatedCoreCoverage = ceilToMultiple(roughCoreCoverage, 10);
            const totalCoverage = estimatedCoreCoverage + itemCoverage;

            function addPartData(data: string | ItemOption[], partData: BotPart[], partOptionData: BotPart[][]) {
                if (typeof data === "string") {
                    const itemName = data;
                    // Item name, add to part data
                    const result = partData.find((p) => p.name === data);

                    if (result === undefined) {
                        const item = itemData.getItem(itemName);
                        partData.push({
                            name: itemName,
                            number: 1,
                            coverage: Math.floor((100.0 * (item.coverage as number)) / totalCoverage),
                            integrity: item.integrity,
                        });
                    } else {
                        result.number += 1;
                    }
                } else {
                    // Option, add all options
                    const options: BotPart[] = [];
                    data.forEach((optionData) => {
                        const itemName = optionData.name;

                        let coverage = 0;
                        const item = itemData.getItem(itemName);

                        if (itemName !== "None") {
                            coverage = Math.floor((100.0 * (item.coverage as number)) / totalCoverage);
                        }

                        options.push({
                            name: itemName,
                            number: optionData.number ?? 1,
                            coverage: coverage,
                            integrity: item.integrity,
                        });
                    });
                    partOptionData.push(options);
                }
            }

            // Add armament and component data
            const armamentData: BotPart[] = [];
            const armamentOptionData: BotPart[][] = [];
            bot.Armament?.forEach((data) => addPartData(data, armamentData, armamentOptionData));

            const componentData: BotPart[] = [];
            const componentOptionData: BotPart[][] = [];
            bot.Components?.forEach((data) => addPartData(data, componentData, componentOptionData));

            let extraData: JsonBotExtraData | undefined = undefined;
            if (!(botName in botExtraData)) {
                console.log(`Need to add extra data for ${botName}`);
            } else {
                extraData = (botExtraData as any as { [key: string]: JsonBotExtraData })[botName];
            }

            const fabrication: FabricationStats | undefined =
                bot["Fabrication Count"] === undefined
                    ? undefined
                    : {
                          number: bot["Fabrication Count"] as string,
                          time: bot["Fabrication Time"] as string,
                          components: undefined,
                      };

            // Parse numerical salvage values out
            let salvageLow: number;
            let salvageHigh: number;
            if (bot["Salvage Potential"].includes("~")) {
                const salvageArray = bot["Salvage Potential"]
                    .split("~")
                    .map((s) => s.trim())
                    .map((s) => parseInt(s));

                salvageLow = salvageArray[0];
                salvageHigh = salvageArray[1];
            } else {
                salvageLow = parseInt(bot["Salvage Potential"]);
                salvageHigh = salvageLow;
            }

            let description: string;
            if (bot.Analysis !== undefined) {
                description = bot.Analysis!;
            } else {
                const loreEntry = lore
                    .find((group) => group.Name === "0b10 Records")!
                    .Entries.find((e) => e["Name/Number"] === bot.Name);
                if (loreEntry !== undefined) {
                    description = loreEntry.Content;
                } else {
                    description = "";
                }
            }

            // Turn component names into list of active items
            // For options, work with the first option
            const components: Item[] = [];
            for (const data of bot.Components || []) {
                if (typeof data === "string") {
                    components.push(itemData.getItem(data));
                } else {
                    const item = itemData.getItem((data as ItemOption[])[0].name);
                    for (let i = 0; i < (data[0].number || 1); i++) {
                        components.push(item);
                    }
                }
            }

            // Base energy is fixed at 100 for almost every bot
            // Large botcubes do have 200 base energy, though since their loadout
            // can't be manually input into the sim, it isn't of much value to
            // support this here
            let maxEnergy = 100;

            for (const item of components) {
                if (hasActiveSpecialProperty(item, true, "EnergyStorage")) {
                    maxEnergy += (item.specialProperty!.trait as EnergyStorage).storage;
                }
            }

            let propulsionType: ItemType | undefined;
            const support = components
                .map((item) => {
                    if (item.slot === "Propulsion") {
                        if (propulsionType === undefined) {
                            propulsionType = item.type;
                        } else if (propulsionType !== item.type) {
                            // Only count the first type of propulsion listed
                            return 0;
                        }

                        return (item as PropulsionItem).support;
                    } else if (hasActiveSpecialProperty(item, true, "MassSupport")) {
                        return (item.specialProperty!.trait as MassSupport).support;
                    }

                    return 0;
                })
                .reduce(sum, 0);

            // Calculate injector dissipation
            let injectorDissipation = 0;
            for (const item of components) {
                if (hasActiveSpecialProperty(item, true, "Injector")) {
                    injectorDissipation += (item.specialProperty!.trait as Injector).dissipation;
                }
            }

            // Calculate energy/heat stats
            let energyGeneration = parseIntOrDefault(bot["Energy Generation"], 0);
            let heatDissipation = parseIntOrDefault(bot["Heat Dissipation"], 0);
            let netEnergyPerTurn = energyGeneration;
            let netHeatPerTurn = -heatDissipation;
            let energyPerMove = 0;
            let heatPerMove = 0;
            for (const item of components) {
                if (item.slot === "Power" || item.slot === "Propulsion" || item.slot === "Utility") {
                    netEnergyPerTurn -= (item as ItemWithUpkeep).energyUpkeep || 0;
                    netHeatPerTurn += (item as ItemWithUpkeep).heatGeneration || 0;
                }

                if (item.slot === "Propulsion") {
                    energyPerMove += (item as PropulsionItem).energyPerMove || 0;
                    heatPerMove += (item as PropulsionItem).heatPerMove || 0;
                }
            }

            // Calculate move energy/heat stats
            const speed = parseInt(bot.Speed);
            let netEnergyPerMove = Math.trunc((speed / 100) * netEnergyPerTurn - energyPerMove);
            let netHeatPerMove = Math.trunc((speed / 100) * netHeatPerTurn + heatPerMove);

            const mass = components.map((item) => item.mass || 0).reduce(sum, 0);

            const { damagePerTurn, damagePerVolley, energyPerVolley, heatPerVolley, volleyTime } =
                BotData.calculateArmamentStats(bot, components, itemData);

            // Calculate volley energy/heat stats
            let netEnergyPerVolley: number | undefined;
            let netHeatPerVolley: number | undefined;

            if (volleyTime === undefined) {
                netEnergyPerVolley = undefined;
                netHeatPerVolley = undefined;
            } else {
                netEnergyPerVolley = Math.trunc((volleyTime / 100) * netEnergyPerTurn - energyPerVolley);
                netHeatPerVolley = Math.trunc((volleyTime / 100) * netHeatPerTurn + heatPerVolley);
            }

            const newBot: Bot = {
                armament: bot.Armament ?? [],
                armamentData: armamentData,
                armamentOptionData: armamentOptionData,
                armamentString: bot["Armament String"] ?? "",
                categories: extraData?.Categories ?? [],
                class: bot.Class,
                componentData: componentData,
                componentOptionData: componentOptionData,
                components: bot.Components ?? [],
                componentsString: bot["Components String"] ?? "",
                coreCoverage: roughCoreCoverage,
                coreExposure: parseIntOrDefault(bot["Core Exposure %"], 0),
                coreIntegrity: parseInt(bot["Core Integrity"]),
                damagePerTurn: damagePerTurn,
                damagePerVolley: damagePerVolley,
                description: description,
                energyGeneration: energyGeneration,
                fabrication: fabrication,
                heatDissipation: heatDissipation,
                immunities: bot.Immunities ?? [],
                immunitiesString: bot.Immunities?.join(", ") ?? "",
                injectorDissipation: injectorDissipation,
                inventorySize: bot["Inventory Capacity"],
                locations: extraData?.Locations ?? [],
                mass: mass,
                maxEnergy: maxEnergy,
                memory: bot.Memory,
                movement: `${bot.Movement} (${bot.Speed}/${bot["Speed %"]}%)`,
                movementOverloaded:
                    bot["Overload Speed"] !== undefined
                        ? `${bot.Movement} (${bot["Overload Speed"]}/${bot["Overload Speed %"]}%)`
                        : undefined,
                name: botName,
                netEnergyPerMove: netEnergyPerMove,
                netEnergyPerTurn: netEnergyPerTurn,
                netEnergyPerVolley: netEnergyPerVolley,
                netHeatPerMove: netHeatPerMove,
                netHeatPerTurn: netHeatPerTurn,
                netHeatPerVolley: netHeatPerVolley,
                profile: bot.Profile,
                propulsionType: propulsionType,
                rating: bot.Rating,
                resistances: bot.Resistances,
                salvageHigh: salvageHigh,
                salvageLow: salvageLow,
                salvagePotential: bot["Salvage Potential"],
                speed: speed,
                spotPercent: bot["Spot %"] ?? "100",
                spoiler: extraData?.Categories.includes(BotCategory.Redacted)
                    ? "Redacted"
                    : extraData?.Categories.includes(BotCategory.Spoiler)
                      ? "Spoiler"
                      : "None",
                size: bot["Size Class"],
                support: support,
                threat: bot.Threat,
                totalCoverage: totalCoverage,
                tier: bot.Tier,
                traits: bot.Traits ?? [],
                traitsString: bot.Traits?.join(", ") ?? "",
                value: parseIntOrDefault(bot.Value, 0),
                visualRange: bot["Sight Range"],
                volleyTime: volleyTime,
                customBot: false,
            };

            this.botData[botName] = newBot;
        });
    }

    private static calculateArmamentStats(bot: JsonBot, components: Item[], itemData: ItemData) {
        function isMeleeWeapon(part: Item) {
            return (
                part.type === "Impact Weapon" ||
                part.type === "Piercing Weapon" ||
                part.type === "Slashing Weapon" ||
                part.type === "Special Melee Weapon"
            );
        }

        // TODO maybe consolidate the damage and TU calculation with simulator
        const armament: WeaponItem[] = [];
        bot.Armament?.forEach((p) => {
            let part: WeaponItem;
            if (typeof p === "string") {
                armament.push(itemData.getItem(p) as WeaponItem);
            } else {
                part = itemData.getItem(p[0].name) as WeaponItem;
                for (let i = 0; i < (p[0].number || 1); i++) {
                    armament.push(part);
                }
            }
        });

        if (armament.length === 0) {
            return { damagePerTurn: undefined, damagePerVolley: undefined, volleyTime: undefined };
        }

        const melee = armament.length > 0 && isMeleeWeapon(armament[0]);

        const actuatorArrayBonus = Math.max(
            ...components
                .filter((p) => hasActiveSpecialProperty(p, true, "ActuatorArray"))
                .map((p) => (p.specialProperty!.trait as ActuatorArray).amount),
            0,
        );

        const kinecelleratorBoost = Math.max(
            ...components
                .filter((p) => hasActiveSpecialProperty(p, true, "Kinecellerator"))
                .map((p) => (p.specialProperty!.trait as Kinecellerator).amount),
            0,
        );

        // TODO technically this is half stack but no bot uses >1 charger
        const particleChargerBoost = Math.max(
            ...components
                .filter((p) => hasActiveSpecialProperty(p, true, "ParticleCharging"))
                .map((p) => (p.specialProperty!.trait as ParticleCharging).percent),
            0,
        );

        const meleeAnalysisDamage = components
            .filter((p) => hasActiveSpecialProperty(p, true, "MeleeAnalysis"))
            .map((p) => (p.specialProperty!.trait as MeleeAnalysis).minDamage)
            .reduce(sum, 0);

        let volleyTime: number;
        if (armament.length === 0) {
            volleyTime = 0;
        } else if (melee) {
            // Melee weapons always have base 200 volley time
            volleyTime = 200;
        } else if (armament.length in volleyTimeMap) {
            volleyTime = volleyTimeMap[armament.length];
        } else {
            // No additional penalty past 6 weapons
            volleyTime = volleyTimeMap[6];
        }

        let heatPerVolley = 0;
        let energyPerVolley = 0;

        // Calculate damage per volley
        const damagePerVolley =
            armament
                .map((part, i) => {
                    if ((!melee && isMeleeWeapon(part)) || (melee && !isMeleeWeapon(part))) {
                        // Don't mix melee with non-melee weapons
                        return 0;
                    }

                    let minDamage = part.damageMin || 0;
                    let maxDamage = part.damageMax || 0;

                    // Apply kinecellerator boost if applicable
                    if (
                        (kinecelleratorBoost > 0 && part.type === "Ballistic Cannon") ||
                        part.type === "Ballistic Gun"
                    ) {
                        minDamage *= 1 + kinecelleratorBoost / 100;
                        // Bump max damage up if min damage is now higher
                        maxDamage = Math.max(minDamage, maxDamage);
                    }

                    // Apply particle charger boost if applicable
                    if (particleChargerBoost > 0 && (part.type === "Energy Cannon" || part.type === "Energy Gun")) {
                        minDamage = Math.trunc(minDamage * (1 + particleChargerBoost / 100));
                        maxDamage = Math.trunc(maxDamage * (1 + particleChargerBoost / 100));
                    }

                    if (melee) {
                        // Boost min damage from MAS but not above max damage
                        minDamage = Math.min(minDamage + meleeAnalysisDamage, maxDamage);
                    }

                    // Add explosion damage if applicable
                    // For weapons with a base hit and explosion hit, this will
                    // include both hits in the damage calculation
                    minDamage += part.explosionDamageMin || 0;
                    maxDamage += part.explosionDamageMax || 0;

                    if (melee && i > 0) {
                        // Apply melee follow-up damage as a ratio of the chance
                        // to perform the follow-up attack
                        const followUpChance =
                            (20 + actuatorArrayBonus + ((armament[0].delay || 0) - (part.delay || 0)) / 10) / 100;

                        minDamage *= followUpChance;
                        maxDamage *= followUpChance;

                        // Adjust volley time by half of the delay
                        volleyTime += (followUpChance * (part.delay || 0)) / 2;

                        // Add melee heat/energy costs proportionally
                        heatPerVolley += (part.shotHeat || 0) * followUpChance;
                        energyPerVolley += (part.shotEnergy || 0) * followUpChance;
                    } else {
                        volleyTime += part.delay || 0;

                        // Add heat/energy costs that aren't melee followups directly
                        heatPerVolley += part.shotHeat || 0;
                        energyPerVolley += part.shotEnergy || 0;
                    }

                    return part.projectileCount * Math.trunc((minDamage + maxDamage) / 2);
                })
                .reduce(sum, 0) || 0;

        // Adjust volley time based on utilities
        if (melee) {
            // Stack actuators up to 50%
            const actuating = Math.max(
                1 -
                    components
                        .filter((p) => hasActiveSpecialProperty(p, true, "Actuator"))
                        .map((p) => (p.specialProperty!.trait as Actuator).amount)
                        .reduce(sum, 0),
                0.5,
            );

            volleyTime = Math.trunc(actuating * volleyTime);
        } else {
            // Stack cyclers up to 30%
            let cycling = Math.max(
                1 -
                    components
                        .filter((p) => hasActiveSpecialProperty(p, true, "RangedWeaponCycling"))
                        .map((p) => (p.specialProperty!.trait as RangedWeaponCycling).amount)
                        .reduce(sum, 0),
                0.7,
            );

            // Launcher Loader/Quantum Capacitor override to 50%, Mni. QC to 60%
            // TODO would be nice to make sure that bots can actually make use of
            // these conditions
            if (
                components.find((p) => hasActiveSpecialProperty(p, true, "LauncherLoader")) ||
                components.find((p) => hasActiveSpecialProperty(p, true, "QuantumCapacitor"))
            ) {
                cycling = 0.5;
            } else if (components.find((p) => hasActiveSpecialProperty(p, true, "MniQuantumCapacitor"))) {
                cycling = 0.6;
            }

            volleyTime = Math.trunc(cycling * volleyTime);
        }

        // Cap min volley time at 25
        volleyTime = Math.max(volleyTime, 25);
        const damagePerTurn = (damagePerVolley / volleyTime) * 100;

        return {
            damagePerTurn: damagePerTurn,
            damagePerVolley: damagePerVolley,
            energyPerVolley: energyPerVolley,
            heatPerVolley: heatPerVolley,
            volleyTime: volleyTime,
        };
    }

    public getAllBots() {
        return Object.keys(this.botData).map((itemName) => this.botData[itemName]);
    }

    public getAllBotsSorted() {
        const botNames = Object.keys(this.botData);
        botNames.sort();
        return botNames.map((botName) => this.botData[botName]);
    }

    public getBot(botName: string) {
        if (botName in this.botData) {
            return this.botData[botName];
        }

        throw new Error(`${botName} not a valid bot`);
    }

    public getBotOrNull(botName: string) {
        if (botName in this.botData) {
            return this.botData[botName];
        }

        return null;
    }

    public async verifyImages() {
        const botPromises: Promise<any>[] = [];

        console.log("Verifying bot images...");

        for (const bot of this.getAllBots()) {
            for (const imageName of getBotImageNames(bot)) {
                if (imageName.includes("Special_") || imageName.includes("Unique_")) {
                    console.log(bot.name);
                }
                botPromises.push(loadImage(imageName));
            }
        }
        await Promise.all(botPromises);
    }
}
