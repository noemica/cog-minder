import jsonItems from "../../json/items_b15.json";
import { JsonItem } from "../types/itemTypes";

const itemsByName = new Map<string, JsonItem>(jsonItems.map((item) => [item.Name, item as JsonItem]));

export function isKnownItem(itemName: string) {
    return itemsByName.get(itemName) !== undefined;
}

export function getItemByName(itemName: string) {
    return itemsByName.get(itemName);
}

export function getItemDamageType(itemName: string) {
    const item = itemsByName.get(itemName);

    if (item === undefined) {
        // This could happen with new weapon types or something like a
        // scrap engine weapon name, expected to sometimes happen
        console.log(`Failed to find item ${itemName}`);
        return "Unknown";
    }

    if (item["Damage Type"] === undefined) {
        if (item["Explosion Type"] === undefined) {
            // This shouldn't happen normally
            console.log(`Item ${itemName} didn't have any damage type`);
            return "Unknown";
        } else {
            return item["Explosion Type"];
        }
    }

    return item["Damage Type"];
}

export function getItemSlot(itemName: string) {
    const item = itemsByName.get(itemName);

    if (itemName === "Core") {
        // Consider core its own slot
        return "Core";
    }

    if (item === undefined) {
        // This could happen with new parts or something like a
        // scrap engine part name, expected to sometimes happen
        console.log(`Failed to find item ${itemName}`);
        return "Unknown";
    }

    if (item.Slot === undefined) {
        // This shouldn't happen normally
        console.log(`Item ${itemName} didn't have any slot`);
    }

    return item.Slot;
}
