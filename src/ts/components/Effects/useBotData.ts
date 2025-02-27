import bots from "../../../json/bots.json";
import bots_b15 from "../../../json/bots_b15.json";
import { BotData } from "../../utilities/BotData";
import useItemData from "./useItemData";
import { usePrerelease } from "./useLocalStorageValue";

let botData: BotData;
let oldPrerelease = false;

export default function useBotData() {
    const prerelease = usePrerelease();
    const itemData = useItemData();

    if (botData === undefined || prerelease !== oldPrerelease) {
        botData = new BotData(prerelease ? bots_b15 : bots, itemData);
    }

    return botData;
}
