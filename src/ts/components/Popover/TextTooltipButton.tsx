import { Placement } from "@floating-ui/react";
import { ReactNode, useState } from "react";

import Button from "../Buttons/Button";
import { useIsVisible } from "../Effects/useIsVisible";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

type TextTooltipButtonProps = {
    tooltipText: string;
    children: ReactNode;
    placement?: Placement;
};

export default function TextTooltipButton({ tooltipText, placement, children }: TextTooltipButtonProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [openByButton, setOpenByButton] = useState<boolean>(false);

    const isVisible = useIsVisible();

    const button = (
        <div>
            <Button
                onClick={() => {
                    setOpenByButton(!openByButton);
                    setOpen(!openByButton);
                }}
            >
                {children}
            </Button>
        </div>
    );

    if (!isVisible) {
        // If not visible then don't create the tooltip since that can be
        // expensive when there are a lot of different elements with tooltips
        return button;
    }

    return (
        <Tooltip
            placement={placement}
            open={open}
            useHover={true}
            onOpenChange={(open, event, reason) => {
                // Semi-convoluted logic, the idea is to open the tooltip on
                // hover and dismiss when hover is lost. However, if the tooltip
                // was opened by a button press, don't allow a hover change to
                // dismiss the button. Closing the tooltip is instead available
                // by clicking the button again or by clicking something else
                // outside of the button
                if (open) {
                    setOpen(open);
                } else {
                    if (!openByButton) {
                        setOpen(open);
                    } else if (reason === "outside-press") {
                        setOpen(open);
                        setOpenByButton(open);
                    }
                }
            }}
        >
            <TooltipTrigger asChild={true} children={button} />
            <TooltipContent className="text-tooltip">{tooltipText}</TooltipContent>
        </Tooltip>
    );
}
