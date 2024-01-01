import { ReactNode } from "react";

import { Item } from "../../types/itemTypes";
import { getItemAsciiArtImageName } from "../../utilities/common";
import Button from "../Buttons/Button";
import { useIsVisible } from "../Effects/useIsVisible";
import PartDetails from "../GameDetails/PartDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

function ItemPopover({ button, isVisible, item }: { button: ReactNode; isVisible: boolean; item: Item }) {
    if (isVisible) {
        return (
            <Popover>
                <PopoverTrigger asChild={true}>{button}</PopoverTrigger>
                <PopoverContent floatingArrowClassName="part-popover-arrow">
                    <div className="item-popover">
                        <PartDetails item={item} />
                    </div>
                </PopoverContent>
            </Popover>
        );
    } else {
        return button;
    }
}

export function GalleryItemPopoverButton({ item }: { item: Item }) {
    const [isVisible, ref] = useIsVisible("500px");

    const button = (
        <div ref={ref}>
            <Button>
                <span>{item.name}</span>
                <img src={isVisible ? getItemAsciiArtImageName(item) : undefined} />
            </Button>
        </div>
    );

    return <ItemPopover button={button} isVisible={isVisible} item={item} />;
}

export default function ItemPopoverButton({ item }: { item: Item }) {
    const [isVisible, ref] = useIsVisible("50px");

    const button = (
        <div ref={ref}>
            <Button>{item.name}</Button>
        </div>
    );

    return <ItemPopover button={button} isVisible={isVisible} item={item} />;
}
