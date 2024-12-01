import { ReactNode } from "react";

import { Bot } from "../../types/botTypes";
import Button from "../Buttons/Button";
import { usePopoverPositioning } from "../Effects/usePopoverPositioning";
import BotDetails from "../GameDetails/BotDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

import "./Popover.less";

function BotPopover({ node, bot }: { node: ReactNode; bot: Bot }) {
    const positioning = usePopoverPositioning();

    return (
        <Popover placement={positioning.placement} shouldShift={positioning.shouldShift}>
            <PopoverTrigger asChild={true}>{node}</PopoverTrigger>
            <PopoverContent floatingArrowClassName="bot-popover-arrow">
                <div className="popover">
                    <BotDetails bot={bot} showWikiLink={true} />
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function BotPopoverButton({ bot, text, tooltip }: { bot: Bot; text?: string; tooltip?: string }) {
    const button = (
        <div>
            <Button tooltip={tooltip}>{text || bot.name}</Button>
        </div>
    );

    return <BotPopover node={button} bot={bot} />;
}
