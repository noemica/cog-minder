import { ReactNode } from "react";
import Select, { GroupBase, OptionProps, Props, components } from "react-select";

import TextTooltip from "../Popover/TextTooltip";

import "./Select.less";

export type SelectOptionType<T = any> = {
    value: T;
    label?: string | ReactNode;
    tooltip?: string;
};

const Option = (props: OptionProps<SelectOptionType>) => {
    if (props.data.tooltip === undefined) {
        return <components.Option {...props} />;
    } else {
        // Add a tooltip if specified
        return (
            <components.Option {...props}>
                <TextTooltip tooltipText={props.data.tooltip}>{props.data.label}</TextTooltip>
            </components.Option>
        );
    }
};

// Would like to call this Select too but it interferes with the import and
// I can't figure out a way to rename the Select import to something else
export default function SelectWrapper<
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectOptionType> = GroupBase<SelectOptionType>,
>({ defaultValue, options, value, ...props }: Props<SelectOptionType, IsMulti, Group>) {
    options = (options as SelectOptionType[])?.map((o) => {
        let label = o.label || o.value;
        if (typeof label === "string") {
            label = <div>{label}</div>;
        }

        return { ...o, label: label };
    });

    if (value !== undefined) {
        value = (options as SelectOptionType[]).find((o) => o.value === (value as SelectOptionType).value);
    }
    if (defaultValue !== undefined) {
        defaultValue = (options as SelectOptionType[]).find(
            (o) => o.value === (defaultValue as SelectOptionType).value,
        );
    }

    return (
        <Select
            {...props}
            options={options}
            formatGroupLabel={(data: GroupBase<SelectOptionType>) => {
                return <span>{data.label}</span>
            }}
            defaultValue={defaultValue}
            value={value}
            components={{ Option }}
            classNamePrefix={"select"}
        />
    );
}
