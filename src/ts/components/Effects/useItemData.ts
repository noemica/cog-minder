import items from "../../../json/items.json";
import { ItemData } from "../../utilities/ItemData";

let itemData: ItemData | undefined;
// let oldPrerelease = false;

export default function useItemData() {
    // const prerelease = usePrerelease();

    if (itemData === undefined) {
        itemData = new ItemData(items);
    }
    // if (itemData === undefined || prerelease != oldPrerelease) {
    //     itemData = new ItemData(prerelease ? items_b15 : items);
    //     oldPrerelease = prerelease;
    // }

    return itemData;
}
