import { ReactNode, useContext, useState } from "react";

import { Bot } from "../../types/botTypes";
import Button from "../Buttons/Button";
import { PopupPositioningContext } from "../Contexts/PopupPositioningContext";
import BotDetails from "../GameDetails/BotDetails";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

import "./Popover.less";

function BotPopover({
    bot,
    button,
    open,
    setOpen,
}: {
    bot: Bot;
    button: ReactNode;
    open?: boolean;
    setOpen?: (open: boolean) => void;
}) {
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
            <PopoverContent floatingArrowClassName="bot-popover-arrow">
                <div className="popover">
                    <BotDetails bot={bot} showWikiLink={true} />
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function BotPopoverButton({
    bot,
    className,
    text,
    tooltip,
}: {
    bot: Bot;
    className?: string;
    text?: string;
    tooltip?: string;
}) {
    const [open, setOpen] = useState(false);

    const button = (
        <div className={className}>
            <Button onClick={() => setOpen(!open)} tooltip={tooltip}>
                {text || bot.name}
            </Button>
        </div>
    );

    return <BotPopover bot={bot} button={button} open={open} setOpen={setOpen} />;
}
