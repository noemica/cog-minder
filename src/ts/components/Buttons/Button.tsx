import "./buttons.less";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip";
import { ReactNode } from "react";
import TextTooltip from "../Tooltip/TextTooltip";

export type ButtonProps = {
    children?: ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    tooltip?: string;
};

export default function Button({ children, onClick, className, tooltip }: ButtonProps) {
    let classes = "button";

    if (className !== undefined) {
        classes += ` ${className}`;
    }

    const button = (
        <button className={classes} onClick={onClick}>
            {children}
        </button>
    );

    if (tooltip) {
        return (
            <TextTooltip tooltipText={tooltip}>
                {button}
            </TextTooltip>
        );
    } else {
        return button;
    }
}
