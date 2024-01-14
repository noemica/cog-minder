import bots from "../../../json/bots.json";
import { BotData } from "../../utilities/BotData";
import useItemData from "./useItemData";

const itemData = useItemData();
const botData: BotData = new BotData(bots, itemData);

export default function useBotData() {
    return botData;
}
