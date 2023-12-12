import Select, { GroupBase, OptionProps, Props, components } from "react-select";
import { ReactNode } from "react";

import "./selectpicker.less";
import TextTooltip from "../Tooltip/TextTooltip";

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

export default function Selectpicker<
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectpickerOptionType> = GroupBase<SelectpickerOptionType>,
>(props: Props<SelectpickerOptionType, IsMulti, Group>) {
    return <Select {...props} components={{ Option }} classNamePrefix={"select"} />;
}
