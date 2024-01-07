import { Placement } from "@floating-ui/react";
import { ReactNode } from "react";

import { Item } from "../../types/itemTypes";
import { getItemAsciiArtImageName } from "../../utilities/common";
import Button from "../Buttons/Button";
import { useIsVisible } from "../Effects/useIsVisible";
import ItemDetails from "../GameDetails/ItemDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

import "./Popover.less";

type ItemPopoverProps = {
    button: ReactNode;
    isVisible: boolean;
    item: Item;
    placement?: Placement;
};

function ItemPopover({ button, isVisible, item, placement }: ItemPopoverProps) {
    if (isVisible) {
        return (
            <Popover test={true} placement={placement}>
                <PopoverTrigger asChild={true}>{button}</PopoverTrigger>
                <PopoverContent floatingArrowClassName="item-popover-arrow">
                    <div className="item-popover">
                        <ItemDetails item={item} />
                    </div>
                </PopoverContent>
            </Popover>
        );
    } else {
        return button;
    }
}

export function BotItemPopoverButton({ triggerContent, item }: { triggerContent: ReactNode; item: Item }) {
    return <ItemPopover button={triggerContent} isVisible={true} item={item} placement="left" />;
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
