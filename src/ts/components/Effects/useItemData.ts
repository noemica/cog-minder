import items from "../../../json/items.json";
import { ItemData } from "../../utilities/ItemData";

const itemData: ItemData = new ItemData(items);

export default function useItemData() {
    return itemData;
}
