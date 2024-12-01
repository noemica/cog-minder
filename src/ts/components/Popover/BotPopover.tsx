import { ReactNode } from "react";

import { Bot } from "../../types/botTypes";
import Button from "../Buttons/Button";
import { useIsVisible } from "../Effects/useIsVisible";
import { usePopoverPositioning } from "../Effects/usePopoverPositioning";
import BotDetails from "../GameDetails/BotDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

import "./Popover.less";

function BotPopover({ node, isVisible, bot }: { node: ReactNode; isVisible: boolean; bot: Bot }) {
    const positioning = usePopoverPositioning();

    if (isVisible) {
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
    } else {
        return node;
    }
}

export default function BotPopoverButton({ bot, text, tooltip }: { bot: Bot; text?: string; tooltip?: string }) {
    const [isVisible, ref] = useIsVisible("50px");

    const button = (
        <div ref={ref}>
            <Button tooltip={tooltip}>{text || bot.name}</Button>
        </div>
    );

    return <BotPopover node={button} isVisible={isVisible} bot={bot} />;
}
