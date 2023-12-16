import Select, { GroupBase, OptionProps, Props, components } from "react-select";
import { ReactNode } from "react";
import TextTooltip from "../Tooltip/TextTooltip";

import "./Select.less";

export type SelectpickerOptionType = {
    value: string;
    label: string | ReactNode;
    tooltip?: string;
};

const Option = (props: OptionProps<SelectpickerOptionType>) => {
    if (props.data.tooltip === undefined) {
        return <components.Option {...props} />;
    } else {
        return (
            <components.Option {...props}>
                <TextTooltip tooltipText={props.data.tooltip}>
                    {props.data.label}
                </TextTooltip>
            </components.Option>
        );
    }
};

// Would like to call this Select too but it interferes with the import and
// I can't figure out a way to rename the Select import to something else
export default function SelectWrapper<
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectpickerOptionType> = GroupBase<SelectpickerOptionType>,
>(props: Props<SelectpickerOptionType, IsMulti, Group>) {
    return <Select {...props} components={{ Option }} classNamePrefix={"select"} />;
}
