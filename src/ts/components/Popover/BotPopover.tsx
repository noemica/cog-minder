import { ReactNode } from "react";

import { Bot } from "../../types/botTypes";
import Button from "../Buttons/Button";
import { useIsVisible } from "../Effects/useIsVisible";
import { usePopoverPositioning } from "../Effects/usePopoverPositioning";
import BotDetails from "../GameDetails/BotDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

import "./Popover.less";

function BotPopover({ button, isVisible, bot }: { button: ReactNode; isVisible: boolean; bot: Bot }) {
    const positioning = usePopoverPositioning();

    if (isVisible) {
        return (
            <Popover placement={positioning.placement} shouldShift={positioning.shouldShift}>
                <PopoverTrigger asChild={true}>{button}</PopoverTrigger>
                <PopoverContent floatingArrowClassName="bot-popover-arrow">
                    <div className="popover">
                        <BotDetails bot={bot} />
                    </div>
                </PopoverContent>
            </Popover>
        );
    } else {
        return button;
    }
}

export default function BotPopoverButton({ bot }: { bot: Bot }) {
    const [isVisible, ref] = useIsVisible("50px");

    const button = (
        <div ref={ref}>
            <Button>{bot.name}</Button>
        </div>
    );

    return <BotPopover button={button} isVisible={isVisible} bot={bot} />;
}
