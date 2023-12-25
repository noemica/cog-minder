import { ReactNode } from "react";

import Button from "../Buttons/Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

type ButtonPopoverProps = {
    buttonLabel: string;
    buttonTooltip?: string;
    children: ReactNode;
    className?: string;
    floatingArrowClassName?: string;
};

export default function ButtonPopover({
    buttonLabel,
    buttonTooltip,
    children,
    className,
    floatingArrowClassName,
}: ButtonPopoverProps) {
    className = (className || "") + " button-popover";
    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <div>
                    <Button tooltip={buttonTooltip}>{buttonLabel}</Button>
                </div>
            </PopoverTrigger>
            <PopoverContent floatingArrowClassName={floatingArrowClassName}>
                <div className={className}>{children}</div>
            </PopoverContent>
        </Popover>
    );
}
