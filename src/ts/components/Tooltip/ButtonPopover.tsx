import { ReactNode } from "react";

import Button from "../Buttons/Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

type ButtonPopoverProps = {
    buttonLabel: string;
    buttonTooltip?: string;
    children: ReactNode;
};

export default function ButtonPopover({ buttonLabel, buttonTooltip, children }: ButtonPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <div>
                    <Button tooltip={buttonTooltip}>{buttonLabel}</Button>
                </div>
            </PopoverTrigger>
            <PopoverContent>
                <div className="button-popover">{children}</div>
            </PopoverContent>
        </Popover>
    );
}
