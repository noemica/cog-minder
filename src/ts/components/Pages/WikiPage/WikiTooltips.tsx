import { ReactNode } from "react";

import { Bot } from "../../../types/botTypes";
import { MapLocation } from "../../../types/commonTypes";
import { Item } from "../../../types/itemTypes";
import { getLinkSafeString } from "../../../utilities/common";
import { HashLink } from "../../../utilities/linkExport";
import { usePopoverPositioning } from "../../Effects/usePopoverPositioning";
import BotDetails from "../../GameDetails/BotDetails";
import ItemDetails from "../../GameDetails/ItemDetails";
import LocationDetails from "../../GameDetails/LocationDetails";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../Popover/Tooltip";

export function BotLink({ bot, linkTarget, text }: { bot: Bot; linkTarget?: string; text?: string }) {
    const positioning = usePopoverPositioning();

    return (
        <Tooltip placement={positioning.placement} shouldShift={positioning.shouldShift}>
            <TooltipTrigger asChild={true}>
                <HashLink to={linkTarget || `/${getLinkSafeString(bot.name)}`}>{text || bot.name}</HashLink>
            </TooltipTrigger>
            <TooltipContent floatingArrowClassName="bot-tooltip-arrow" className="bot-tooltip">
                <BotDetails bot={bot} />
            </TooltipContent>
        </Tooltip>
    );
}

export function ItemLink({
    item,
    linkTarget,
    text,
}: {
    item: Item;
    linkTarget?: string;
    text?: ReactNode;
}) {
    return (
        <ItemTooltip item={item}>
            <HashLink to={linkTarget || `/${getLinkSafeString(item.name)}`}>{text || item.name}</HashLink>
        </ItemTooltip>
    );
}

export function ItemTooltip({
    item,
    children,
}: {
    item: Item;
    children: ReactNode;
}) {
    const positioning = usePopoverPositioning();

    return (
        <Tooltip placement={positioning.placement} shouldShift={positioning.shouldShift}>
            <TooltipTrigger asChild={true}>{children}</TooltipTrigger>
            <TooltipContent floatingArrowClassName="item-tooltip-arrow" className="bot-tooltip">
                <ItemDetails item={item} />
            </TooltipContent>
        </Tooltip>
    );
}

export function LocationLink({
    linkTarget,
    location,
    text,
}: {
    linkTarget?: string;
    location: MapLocation;
    text?: string;
    inPopover?: boolean;
}) {
    const positioning = usePopoverPositioning();

    return (
        <Tooltip placement={positioning.placement} shouldShift={positioning.shouldShift}>
            <TooltipTrigger asChild={true}>
                <HashLink to={linkTarget || `/${getLinkSafeString(location.name)}`}>{text || location.name}</HashLink>
            </TooltipTrigger>
            <TooltipContent floatingArrowClassName="location-tooltip-arrow" className="bot-tooltip">
                <LocationDetails location={location} inPopover={true} />
            </TooltipContent>
        </Tooltip>
    );
}
