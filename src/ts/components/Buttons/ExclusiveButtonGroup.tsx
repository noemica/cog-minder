import Button from "./Button";

import "./buttons.less";

export type ExclusiveButtonDefinition<T extends string> = {
    label?: string;
    value: T;
    tooltip?: string;
};

export type ExclusiveButtonsProps<T extends string> = {
    buttons: ExclusiveButtonDefinition<T>[];
    className?: string;
    onValueChanged?: (value: T) => void;
    selected?: T | number;
};

export default function ExclusiveButtonGroup<T extends string>({
    buttons,
    className,
    onValueChanged,
    selected,
}: ExclusiveButtonsProps<T>) {
    function findIndex(selection: T | number | undefined) {
        if (selection === undefined) {
            return 0;
        }

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            if (button.value === selection || i === selection) {
                return i;
            }
        }

        return 0;
    }

    const selectedIndex = findIndex(selected);

    className = (className || "") + " exclusive-buttons";
    const buttonElements = buttons.map((b, index) => {
        return (
            <Button
                className={index === selectedIndex ? "exclusive-button exclusive-button-active" : "exclusive-button"}
                key={b.label || b.value}
                tooltip={b.tooltip}
                onClick={() => {
                    if (onValueChanged) {
                        onValueChanged(buttons[index].value);
                    }
                }}
            >
                {b.label || b.value}
            </Button>
        );
    });

    return <>{buttonElements}</>;
}
