import { ReactNode, useMemo } from "react";
import Select, { GroupBase, OptionProps, Props, components, createFilter } from "react-select";
import { SelectComponents } from "react-select/dist/declarations/src/components";
import { Link } from "wouter";

import TextTooltip from "../Popover/TextTooltip";

import "./Select.less";

export type SelectOptionType<T = any> = {
    value: T;
    label?: string | ReactNode;
    tooltip?: string;
};

export type SelectOptionProps<IsMulti extends boolean, Group extends GroupBase<SelectOptionType>> = Props<
    SelectOptionType,
    IsMulti,
    Group
> & {
    useLink?: boolean;
};

const Option = (props: OptionProps<SelectOptionType>) => {
    // Possible alternate perf improvement, but doesn't fix scrolling speed
    // or show currently focused option
    // const { innerProps, isFocused, ...otherProps } = props;
    // const { onMouseMove, onMouseOver, ...otherInnerProps } = innerProps;
    // const newProps = {
    //     innerProps: { onMouseMove: undefined, onMouseOver: undefined, ...otherInnerProps },
    //     isFocused: false,
    //     ...otherProps,
    // };

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

// A link version of the regular option, supporting right click links
const LinkOption = (props: OptionProps<SelectOptionType>) => {
    if (props.data.tooltip !== undefined) {
        // TODO not needed yet
        console.log("Need to add tooltip support");
    }
    return (
        <components.Option {...props}>
            <Link href={`/${props.data.value}`}>
                {props.data.label}
            </Link>
        </components.Option>
    );
};

// const VirtualizedMenuList = (props: MenuListProps<SelectOptionType>) => {
//     // Not nice to hardcode this but currently all select items are text options
//     // that are about the same size anyway...
//     const itemHeight = 24;

//     const children = props.children as ReactNode[];
//     const [value] = props.getValue();
//     const initialOffset = props.options.indexOf(value) * itemHeight;

//     return (
//         <div>
//             <FixedSizeList
//                 height={props.maxHeight || 0}
//                 itemCount={children.length}
//                 itemSize={itemHeight}
//                 initialScrollOffset={initialOffset}
//                 overscanCount={5}
//                 width={undefined!}
//             >
//                 {({ index, style }) => {
//                     return <div style={style}>{children[index]}</div>;
//                 }}
//             </FixedSizeList>
//         </div>
//     );
// };

// Would like to call this Select too but it interferes with the import and
// I can't figure out a way to rename the Select import to something else
export default function SelectWrapper<
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectOptionType> = GroupBase<SelectOptionType>,
>({ defaultValue, options, value, ...props }: SelectOptionProps<IsMulti, Group>) {
    options = useMemo(() => {
        return (options as SelectOptionType[])?.map((o) => {
            let label = o.label || o.value;
            if (typeof label === "string") {
                label = <div>{label}</div>;
            }

            return { ...o, label: label };
        });
    }, [options]);

    if (value !== undefined) {
        value = (options as SelectOptionType[]).find((o) => o.value === (value as SelectOptionType).value);
    }
    if (defaultValue !== undefined) {
        defaultValue = (options as SelectOptionType[]).find(
            (o) => o.value === (defaultValue as SelectOptionType).value,
        );
    }

    const components: Partial<SelectComponents<SelectOptionType, IsMulti, Group>> = {
        Option: props.useLink ? LinkOption : (Option as any),
    };

    // Only virtualize if we have a significant number of items
    // Maybe will figure this out later but this has its own issues too and perf
    // is not good but not unusable
    // if (options.length > 100) {
    //     components.MenuList = VirtualizedMenuList;
    // }

    return (
        <Select
            {...props}
            // If ignoreAccents is true it causes a noticeable slowdown
            filterOption={createFilter({ ignoreAccents: false })}
            options={options}
            formatGroupLabel={(data: GroupBase<SelectOptionType>) => {
                return <span>{data.label}</span>;
            }}
            defaultValue={defaultValue}
            value={value}
            components={components}
            classNamePrefix={"select"}
        />
    );
}
