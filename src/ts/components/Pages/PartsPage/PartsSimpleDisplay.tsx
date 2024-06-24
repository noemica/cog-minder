import { Item } from "../../../types/itemTypes";
import ItemPopoverButton from "../../Popover/ItemPopover";
import { PartsPageState } from "./PartsPage";

import "./PartsPage.less";

export default function PartsSimpleDisplay({ pageState, items }: { pageState: PartsPageState; items: Item[] }) {
    const itemButtons = items.map((item) => {
        return <ItemPopoverButton item={item} key={item.name} />;
    });

    return <div className="part-button-grid">{itemButtons}</div>;
}
