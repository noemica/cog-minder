import { ReactNode } from "react";

import "./LabeledItem.less";
import TextTooltip from "../Tooltip/TextTooltip";
import { GroupBase, Props } from "react-select";
import Selectpicker, { SelectpickerOptionType } from "../Selectpicker/Selectpicker";
import ExclusiveButtonGroup, { ExclusiveButtonsProps } from "../Buttons/ExclusiveButtonGroup";

export type LabeledItemProps = {
    label: string;
    tooltip?: string;
};

export function LabeledExclusiveButtonGroup<T>({
    flexGrowButtonCount,
    label,
    tooltip,
    ...props
}: LabeledItemProps & { flexGrowButtonCount?: boolean } & ExclusiveButtonsProps<T>) {
    return (
        <div
            style={{ flexGrow: flexGrowButtonCount ? props.buttons.length : undefined }}
            className="labeled-item labeled-exclusive-button-group"
        >
            {tooltip === undefined ? <span>{label}</span> : <TextTooltip tooltipText={tooltip}>{label}</TextTooltip>}
            <ExclusiveButtonGroup {...props} />
        </div>
    );
}

export function LabeledSelectpicker<
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectpickerOptionType> = GroupBase<SelectpickerOptionType>,
>({ label, tooltip, ...props }: LabeledItemProps & Props<SelectpickerOptionType, IsMulti, Group>) {
    return (
        <div className="labeled-item labeled-selectpicker">
            {tooltip === undefined ? <span>{label}</span> : <TextTooltip tooltipText={tooltip}>{label}</TextTooltip>}
            <Selectpicker {...props} />
        </div>
    );
}
