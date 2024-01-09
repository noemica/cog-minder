import { Placement } from "@floating-ui/react";
import { ReactNode } from "react";

import { useIsVisible } from "../Effects/useIsVisible";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

type TextTooltipProps = {
    tooltipText: string;
    children: ReactNode;
    placement?: Placement;
};

export default function TextTooltip({ tooltipText, placement, children }: TextTooltipProps) {
    const isVisible = useIsVisible();

    if (!isVisible) {
        // If not visible then don't create the tooltip since that can be
        // expensive when there are a lot of different elements with tooltips
        return children;
    }

    return (
        <Tooltip placement={placement}>
            <TooltipTrigger asChild={true} children={children} />
            <TooltipContent className="text-tooltip">{tooltipText}</TooltipContent>
        </Tooltip>
    );
}
