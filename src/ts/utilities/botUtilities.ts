import jsonBots from "../../json/bots.json";
import { JsonBot } from "../botTypes";

const botsByName = new Map<string, JsonBot>(jsonBots.map((bot) => [bot.Name, bot]));

const botsByShortName = new Map<string, JsonBot>(
    jsonBots.filter((bot) => bot["Short Name"] !== undefined).map((bot) => [bot["Short Name"]!, bot]),
);

const _botsByAllyName = new Map<string, JsonBot>(
    jsonBots.filter((bot) => bot["Ally Name"] !== undefined).map((bot) => [bot["Ally Name"]!, bot]),
);

export function getBotByName(botName: string) {
    return botsByName.get(botName);
}

export function getBotByShortName(botShortName: string) {
    return botsByShortName.get(botShortName);
}

export function getBotClass(botName: string) {
    const bot = botsByName.get(botName);

    if (bot === undefined) {
        // This shouldn't normally happen
        console.log(`Failed to find bot ${botName}`);
        return "Unknown";
    }

    return bot.Class;
}
