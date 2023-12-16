import "./buttons.less";

import Button from "./Button";
import { useState } from "react";

export type ExclusiveButtonDefinition<T> = {
    label: string;
    value: T;
    tooltip?: string;
};

export type ExclusiveButtonsProps<T> = {
    buttons: ExclusiveButtonDefinition<T>[];
    onValueChanged?: (value: T) => void;
    initialSelected?: string | number;
};

export default function ExclusiveButtonGroup<T>({ buttons, onValueChanged, initialSelected }: ExclusiveButtonsProps<T>) {
    let initialSelectedIndex = 0;

    if (initialSelected !== undefined) {
        // Try to find initial selected index
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            if (button.label === initialSelected || i === initialSelected) {
                initialSelectedIndex = i;
                break;
            }
        }
    }

    const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);

    const buttonElements = buttons.map((b, index) => {
        return (
            <Button
                className={index === selectedIndex ? "exclusive-button-active" : ""}
                key={b.label}
                tooltip={b.tooltip}
                onClick={() => {
                    if (onValueChanged) {
                        onValueChanged(buttons[index].value);
                    }
                    return setSelectedIndex(index);
                }}
            >
                {b.label}
            </Button>
        );
    });

    return <div className="exclusive-buttons">{buttonElements}</div>;
}
