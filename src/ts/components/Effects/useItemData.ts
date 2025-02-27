import items from "../../../json/items.json";
import items_b15 from "../../../json/items_b15.json";
import { ItemData } from "../../utilities/ItemData";
import { usePrerelease } from "./useLocalStorageValue";

let itemData: ItemData | undefined;
let oldPrerelease = false;

export default function useItemData() {
    const prerelease = usePrerelease();

    if (itemData === undefined || prerelease != oldPrerelease) {
        itemData = new ItemData(prerelease ? items_b15 : items);
        oldPrerelease = prerelease;
    }

    return itemData;
}
