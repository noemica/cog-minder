import { ReactNode } from "react";
import { Link } from "wouter";

import { Bot } from "../../../types/botTypes";
import { MapLocation } from "../../../types/commonTypes";
import { Item } from "../../../types/itemTypes";
import { getLinkSafeString } from "../../../utilities/common";
import { usePopoverPositioning } from "../../Effects/usePopoverPositioning";
import BotDetails from "../../GameDetails/BotDetails";
import ItemDetails from "../../GameDetails/ItemDetails";
import LocationDetails from "../../GameDetails/LocationDetails";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../Popover/Tooltip";

export function BotLink({ bot, text }: { bot: Bot; text?: string }) {
    const positioning = usePopoverPositioning();

    return (
        <Tooltip placement={positioning.placement} shouldShift={positioning.shouldShift}>
            <TooltipTrigger asChild={true}>
                <Link href={`/${getLinkSafeString(bot.name)}`}>{text || bot.name}</Link>
            </TooltipTrigger>
            <TooltipContent floatingArrowClassName="bot-tooltip-arrow" className="bot-tooltip">
                <BotDetails bot={bot} />
            </TooltipContent>
        </Tooltip>
    );
}

export function ItemLink({ item, text }: { item: Item; text?: ReactNode }) {
    return (
        <ItemTooltip item={item}>
            <Link href={`/${getLinkSafeString(item.name)}`}>{text || item.name}</Link>
        </ItemTooltip>
    );
}

export function ItemTooltip({ item, children }: { item: Item; children: ReactNode }) {
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

export function LocationLink({ location, text }: { location: MapLocation; text?: string; inPopover?: boolean }) {
    const positioning = usePopoverPositioning();

    return (
        <Tooltip placement={positioning.placement} shouldShift={positioning.shouldShift}>
            <TooltipTrigger asChild={true}>
                <Link href={`/${getLinkSafeString(location.name)}`}>{text || location.name}</Link>
            </TooltipTrigger>
            <TooltipContent floatingArrowClassName="location-tooltip-arrow" className="bot-tooltip">
                <LocationDetails location={location} inPopover={true} />
            </TooltipContent>
        </Tooltip>
    );
}
