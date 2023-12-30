import { GroupBase, Props } from "react-select";

import ExclusiveButtonGroup, { ExclusiveButtonsProps } from "../Buttons/ExclusiveButtonGroup";
import Input, { CustomInputProps } from "../Input/Input";
import SelectWrapper, { SelectOptionType } from "../Selectpicker/Select";
import TextTooltip from "../Popover/TextTooltip";

import "./LabeledItem.less";
import { ReactNode } from "react";

export type LabeledItemProps = {
    label: string;
    tooltip?: string;
};

export type LabeledExclusiveButtonGroupProps<T extends string> = LabeledItemProps &
    ExclusiveButtonsProps<T> & {
        className?: string;
        flexGrowButtonCount?: boolean;
    };

function itemLabel(label: string, tooltip?: string) {
    return (
        <>
            {tooltip === undefined ? (
                <span className="label">{label}</span>
            ) : (
                <TextTooltip tooltipText={tooltip}>{<span className="label">{label}</span>}</TextTooltip>
            )}
        </>
    );
}

export function Label({ label, tooltip }: LabeledItemProps) {
    return itemLabel(label, tooltip);
}

export function LabeledExclusiveButtonGroup<T extends string>({
    className,
    flexGrowButtonCount,
    label,
    tooltip,
    ...props
}: LabeledExclusiveButtonGroupProps<T>) {
    className = (className || "") + " labeled-item";
    return (
        <div
            style={{
                flexGrow: flexGrowButtonCount ? props.buttons.length : undefined,
            }}
            className={className}
        >
            {itemLabel(label, tooltip)}
            <ExclusiveButtonGroup {...props} />
        </div>
    );
}

export function LabeledInput({ label, onChange, placeholder, tooltip, value }: LabeledItemProps & CustomInputProps) {
    return (
        <div className="labeled-item">
            {itemLabel(label, tooltip)}
            <Input onChange={onChange} placeholder={placeholder} value={value || ""} />
        </div>
    );
}

export function LabeledSelect<
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectOptionType> = GroupBase<SelectOptionType>,
>({ className, label, tooltip, ...props }: LabeledItemProps & Props<SelectOptionType, IsMulti, Group>) {
    className = (className || "") + " labeled-item labeled-select";

    return (
        <div className={className}>
            {itemLabel(label, tooltip)}
            <SelectWrapper {...props} />
        </div>
    );
}

export function LabeledSelectGroup({ children, label, tooltip }: LabeledItemProps & { children: ReactNode }) {
    return (
        <div className="labeled-item labeled-select">
            {itemLabel(label, tooltip)}
            {children}
        </div>
    );
}
