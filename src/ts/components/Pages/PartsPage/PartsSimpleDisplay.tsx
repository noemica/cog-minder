import { itemData } from "../../../utilities/common";
import ItemPopover from "../../Popover/ItemPopover";
import { PartsPageState } from "./PartsPage";

import "./PartsPage.less";

export default function PartsSimpleDisplay({
    pageState,
    itemNames,
}: {
    pageState: PartsPageState;
    itemNames: string[];
}) {
    const itemButtons = itemNames.map((itemName) => {
        const item = itemData[itemName];
        return <ItemPopover item={item} key={item.name} />;
    });

    return <div className="part-button-grid">{itemButtons}</div>;
}
