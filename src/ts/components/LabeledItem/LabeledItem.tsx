import { ReactNode } from "react";
import { GroupBase, Props } from "react-select";

import ExclusiveButtonGroup, { ExclusiveButtonsProps } from "../Buttons/ExclusiveButtonGroup";
import Input, { CustomInputProps } from "../Input/Input";
import TextTooltip from "../Popover/TextTooltip";
import SelectWrapper, { SelectOptionType } from "../Selectpicker/Select";

import "./LabeledItem.less";

export type LabeledItemProps = {
    className?: string;
    label: string;
    tooltip?: string;
};

export type LabeledExclusiveButtonGroupProps<T extends string> = LabeledItemProps &
    ExclusiveButtonsProps<T> & {
        className?: string;
        flexGrowButtonCount?: boolean;
    };

export default function Label({ className, label, tooltip }: LabeledItemProps) {
    let classes = "label";

    if (className) {
        classes += " " + className;
    }

    const labelNode = <span className={classes}>{label}</span>;

    return <>{tooltip === undefined ? labelNode : <TextTooltip tooltipText={tooltip}>{labelNode}</TextTooltip>}</>;
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
            <Label label={label} tooltip={tooltip} />
            <ExclusiveButtonGroup {...props} />
        </div>
    );
}

export function LabeledInput({ className, label, onChange, placeholder, tooltip, value }: LabeledItemProps & CustomInputProps) {
    className = (className || "") + " labeled-item";

    return (
        <div className={className}>
            <Label label={label} tooltip={tooltip} />
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
            <Label label={label} tooltip={tooltip} />
            <SelectWrapper {...props} />
        </div>
    );
}

export function LabeledSelectGroup({ children, label, tooltip }: LabeledItemProps & { children: ReactNode }) {
    return (
        <div className="labeled-item labeled-select">
            <Label label={label} tooltip={tooltip} />
            {children}
        </div>
    );
}

export function SoloLabel({ className, label, tooltip }: LabeledItemProps) {
    let classes = "solo-label";

    if (className) {
        classes = classes + " " + className;
    }

    return <Label className={classes} label={label} tooltip={tooltip} />;
}
