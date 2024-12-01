import { ReactNode } from "react";

import { Item } from "../../types/itemTypes";
import { getItemAsciiArtImageName } from "../../utilities/common";
import Button from "../Buttons/Button";
import { useIsVisible } from "../Effects/useIsVisible";
import { usePopoverPositioning } from "../Effects/usePopoverPositioning";
import ItemDetails from "../GameDetails/ItemDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

import "./Popover.less";

type ItemPopoverProps = {
    button: ReactNode;
    isVisible: boolean;
    item: Item;
    showWikiLink?: boolean;
};

function ItemPopover({ button, isVisible, item, showWikiLink }: ItemPopoverProps) {
    const positioning = usePopoverPositioning();

    if (isVisible) {
        return (
            <Popover placement={positioning.placement} shouldShift={positioning.shouldShift}>
                <PopoverTrigger asChild={true}>{button}</PopoverTrigger>
                <PopoverContent floatingArrowClassName="item-popover-arrow">
                    <div className="popover">
                        <ItemDetails item={item} showWikiLink={showWikiLink} />
                    </div>
                </PopoverContent>
            </Popover>
        );
    } else {
        return button;
    }
}

export function BotItemPopoverButton({
    triggerContent,
    item,
    showWikiLink,
}: {
    triggerContent: ReactNode;
    item: Item;
    showWikiLink?: boolean;
}) {
    return <ItemPopover button={triggerContent} isVisible={true} item={item} showWikiLink={showWikiLink} />;
}

export function GalleryItemPopoverButton({ item }: { item: Item }) {
    const [isVisible, ref] = useIsVisible("500px");

    const button = (
        <div ref={ref}>
            <Button>
                <span>
                    {item.supporterAttribution === undefined ? (
                        <span className="unclaimed-supporter-span">&lt;unclaimed&gt;</span>
                    ) : (
                        `[${item.supporterAttribution}]`
                    )}
                </span>
                <span>{item.name}</span>
                <img src={isVisible ? getItemAsciiArtImageName(item) : undefined} />
            </Button>
        </div>
    );

    return <ItemPopover button={button} isVisible={isVisible} item={item} showWikiLink={true} />;
}

export default function ItemPopoverButton({
    item,
    text,
    tooltip,
    showWikiLink,
}: {
    item: Item;
    text?: string;
    tooltip?: string;
    showWikiLink?: boolean;
}) {
    const [isVisible, ref] = useIsVisible("50px");

    const button = (
        <div ref={ref}>
            <Button tooltip={tooltip}>{text || item.name}</Button>
        </div>
    );

    return <ItemPopover button={button} isVisible={isVisible} item={item} showWikiLink={showWikiLink} />;
}
