import { Item } from "../../../types/itemTypes";
import { GalleryItemPopoverButton } from "../../Popover/ItemPopover";
import { PartsPageState } from "./PartsPage";

import "./PartsPage.less";

export default function PartsGalleryDisplay({ pageState, items }: { pageState: PartsPageState; items: Item[] }) {
    const itemButtons = items.map((item) => {
        return <GalleryItemPopoverButton item={item} key={item.name} />;
    });

    return <div className="part-gallery-grid">{itemButtons}</div>;
}
