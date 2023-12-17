import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { Placement } from "@floating-ui/react";

type TextTooltipProps = {
    tooltipText: string;
    children: ReactNode;
    placement?: Placement;
};

export default function TextTooltip({ tooltipText, placement, children }: TextTooltipProps) {
    return (
        <Tooltip placement={placement}>
            <TooltipTrigger asChild={true} children={children} />
            <TooltipContent className="text-tooltip">{tooltipText}</TooltipContent>
        </Tooltip>
    );
}
