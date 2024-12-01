import { ReactNode, useContext, useState } from "react";

import { Item } from "../../types/itemTypes";
import { getItemAsciiArtImageName } from "../../utilities/common";
import Button from "../Buttons/Button";
import { PopupPositioningContext } from "../Contexts/PopupPositioningContext";
import { useIsVisible } from "../Effects/useIsVisible";
import ItemDetails from "../GameDetails/ItemDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

import "./Popover.less";

type ItemPopoverProps = {
    button: ReactNode;
    item: Item;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    showWikiLink?: boolean;
};

function ItemPopover({ button, item, open, setOpen, showWikiLink }: ItemPopoverProps) {
    const positioning = useContext(PopupPositioningContext);
    if (positioning === undefined) {
        throw Error("Missing PopupPositioningContext");
    }

    if (open !== undefined && !open) {
        return button;
    }

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            placement={positioning.placement}
            shouldShift={positioning.shouldShift}
        >
            <PopoverTrigger asChild={true}>{button}</PopoverTrigger>
            <PopoverContent floatingArrowClassName="item-popover-arrow">
                <div className="popover">
                    {(open === undefined || open) && <ItemDetails item={item} showWikiLink={showWikiLink} />}
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
    const [open, setOpen] = useState(false);

    const button = (
        <div ref={ref}>
            <Button onClick={() => setOpen(!open)}>
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

    return <ItemPopover button={button} item={item} open={open} setOpen={setOpen} showWikiLink={true} />;
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
    showWikiLink: boolean;
}) {
    const [open, setOpen] = useState(false);

    const button = (
        <div>
            <Button onClick={() => setOpen(!open)} tooltip={tooltip}>
                {text || item.name}
            </Button>
        </div>
    );

    return <ItemPopover button={button} item={item} open={open} setOpen={setOpen} showWikiLink={showWikiLink} />;
}
