import { Placement } from "@floating-ui/react";
import { ReactNode } from "react";

import { useIsVisible } from "../Effects/useIsVisible";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

type TextTooltipProps = {
    tooltipText: string;
    children: ReactNode;
    placement?: Placement;
    useFlexWrapper?: boolean;
};

export default function TextTooltip({ tooltipText, placement, children, useFlexWrapper = false }: TextTooltipProps) {
    const isVisible = useIsVisible();

    if (!isVisible) {
        // If not visible then don't create the tooltip since that can be
        // expensive when there are a lot of different elements with tooltips
        return children;
    }

    // In certain cases we do need the div element wrapper, and we always want
    // to flex. Possibly better ways to do this but this works where it's needed
    // for wrapping <Link>s with tooltips.
    const asChild = !useFlexWrapper;
    const className = asChild ? "" : "flex";

    return (
        <Tooltip placement={placement}>
            <TooltipTrigger className={className} asChild={asChild} children={children} />
            <TooltipContent className="text-tooltip">{tooltipText}</TooltipContent>
        </Tooltip>
    );
}
