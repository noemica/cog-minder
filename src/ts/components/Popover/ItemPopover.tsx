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
    item: Item;
    showWikiLink?: boolean;
};

function ItemPopover({ button, item, showWikiLink }: ItemPopoverProps) {
    const positioning = usePopoverPositioning();

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
    return <ItemPopover button={triggerContent} item={item} showWikiLink={showWikiLink} />;
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

    return <ItemPopover button={button} item={item} showWikiLink={true} />;
}

export default function ItemPopoverButton({
    item,
    showWikiLink,
    text,
    tooltip,
}: {
    item: Item;
    showWikiLink?: boolean;
    text?: string;
    tooltip?: string;
}) {
    const button = (
        <div>
            <Button tooltip={tooltip}>{text || item.name}</Button>
        </div>
    );

    return <ItemPopover button={button} item={item} showWikiLink={showWikiLink} />;
}
