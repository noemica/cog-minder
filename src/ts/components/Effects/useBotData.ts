import bots from "../../../json/bots.json";
import { BotData } from "../../utilities/BotData";
import useItemData from "./useItemData";

let botData: BotData;
// let oldPrerelease = false;

export default function useBotData() {
    // const prerelease = usePrerelease();
    const itemData = useItemData();

    if (botData === undefined) {
        botData = new BotData(bots, itemData);
    }
    // if (botData === undefined || prerelease !== oldPrerelease) {
    //     botData = new BotData(prerelease ? bots_b15 : bots, itemData);
    // }

    return botData;
}
