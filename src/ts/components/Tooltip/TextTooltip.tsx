import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import "./tooltip.less";

type TextTooltipProps = {
    tooltipText: string;
    children: ReactNode;
};

export default function TextTooltip({ tooltipText, children }: TextTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild={true} children={children} />
            <TooltipContent className="text-tooltip">{tooltipText}</TooltipContent>
        </Tooltip>
    );
}
