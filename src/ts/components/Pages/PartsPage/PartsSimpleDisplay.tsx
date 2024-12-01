import { Item } from "../../../types/itemTypes";
import ItemPopoverButton from "../../Popover/ItemPopover";

import "./PartsPage.less";

export default function PartsSimpleDisplay({ items }: { items: Item[] }) {
    const itemButtons = items.map((item) => {
        return <ItemPopoverButton item={item} key={item.name} showWikiLink={true} />;
    });

    return <div className="part-button-grid">{itemButtons}</div>;
}
