import botExtraData from "../../json/bot_extra_data.json";
import lore from "../../json/lore.json";
import { Bot, BotCategory, BotPart, ItemOption, JsonBot, JsonBotExtraData } from "../botTypes";
import { FabricationStats } from "../types/itemTypes";
import { ItemData } from "./ItemData";
import { ceilToMultiple, getBotImageName, loadImage, parseIntOrDefault } from "./common";

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
                const loreEntry = lore["0b10 Records"].find((e) => e["Name/Number"] === bot.Name);
                if (loreEntry !== undefined) {
                    description = loreEntry.Content;
                } else {
                    description = "";
                }
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
                description: description,
                energyGeneration: parseIntOrDefault(bot["Energy Generation"], 0),
                fabrication: fabrication,
                heatDissipation: parseIntOrDefault(bot["Heat Dissipation"], 0),
                immunities: bot.Immunities ?? [],
                immunitiesString: bot.Immunities?.join(", ") ?? "",
                locations: extraData?.Locations ?? [],
                memory: bot.Memory,
                movement: `${bot.Movement} (${bot.Speed}/${bot["Speed %"]}%)`,
                movementOverloaded:
                    bot["Overload Speed"] !== undefined
                        ? `${bot.Movement} (${bot["Overload Speed"]}/${bot["Overload Speed %"]}%)`
                        : undefined,
                name: botName,
                profile: bot.Profile,
                rating: bot.Rating,
                resistances: bot.Resistances,
                salvageHigh: salvageHigh,
                salvageLow: salvageLow,
                salvagePotential: bot["Salvage Potential"],
                speed: parseInt(bot.Speed),
                spotPercent: bot["Spot %"] ?? "100",
                spoiler: extraData?.Categories.includes(BotCategory.Redacted)
                    ? "Redacted"
                    : extraData?.Categories.includes(BotCategory.Spoiler)
                      ? "Spoiler"
                      : "None",
                size: bot["Size Class"],
                threat: bot.Threat,
                totalCoverage: totalCoverage,
                tier: bot.Tier,
                traits: bot.Traits ?? [],
                traitsString: bot.Traits?.join(", ") ?? "",
                value: parseIntOrDefault(bot.Value, 0),
                visualRange: bot["Sight Range"],
            };

            this.botData[botName] = newBot;
        });
    }

    public getAllBots() {
        return Object.keys(this.botData).map((itemName) => this.botData[itemName]);
    }

    public getBot(botName: string) {
        if (botName in this.botData) {
            return this.botData[botName];
        }

        throw new Error(`${botName} not a valid bot`);
    }

    public async verifyImages() {
        const botPromises: Promise<any>[] = [];

        console.log("Verifying bot images...");

        for (const bot of this.getAllBots()) {
            botPromises.push(loadImage(getBotImageName(bot)));
        }
        await Promise.all(botPromises);

        console.log("Verified bot images");
    }
}
