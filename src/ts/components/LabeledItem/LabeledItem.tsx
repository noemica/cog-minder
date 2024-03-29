import { GroupBase, Props } from "react-select";

import ExclusiveButtonGroup, { ExclusiveButtonsProps } from "../Buttons/ExclusiveButtonGroup";
import SelectWrapper, { SelectOptionType } from "../Selectpicker/Select";
import TextTooltip from "../Tooltip/TextTooltip";

import "./LabeledItem.less";

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

export function LabeledSelect<
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectOptionType> = GroupBase<SelectOptionType>,
>({ label, tooltip, ...props }: LabeledItemProps & Props<SelectOptionType, IsMulti, Group>) {
    return (
        <div className="labeled-item labeled-select">
            {tooltip === undefined ? <span>{label}</span> : <TextTooltip tooltipText={tooltip}>{label}</TextTooltip>}
            <SelectWrapper {...props} />
        </div>
    );
}
