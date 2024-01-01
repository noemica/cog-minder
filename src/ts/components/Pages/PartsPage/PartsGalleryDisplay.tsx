import { itemData } from "../../../utilities/common";
import { GalleryItemPopoverButton } from "../../Popover/ItemPopover";
import { PartsPageState } from "./PartsPage";

import "./PartsPage.less";

export default function PartsGalleryDisplay({
    pageState,
    itemNames,
}: {
    pageState: PartsPageState;
    itemNames: string[];
}) {
    const itemButtons = itemNames.map((itemName) => {
        const item = itemData[itemName];
        return <GalleryItemPopoverButton item={item} key={item.name} />;
    });

    return <div className="part-gallery-grid">{itemButtons}</div>;
}
