import { ReactNode } from "react";

import "./LabeledItem.less";
import TextTooltip from "../Tooltip/TextTooltip";

export type LabeledItemProps = {
    children: ReactNode;
    label: string;
    tooltip?: string;
};

export function LabeledSelectpicker({ children, label, tooltip }: LabeledItemProps) {
    return (
        <div className="labeled-item labeled-selectpicker">
            {tooltip === undefined ? <span>{label}</span> : <TextTooltip tooltipText={tooltip}>{label}</TextTooltip>}
            {children}
        </div>
    );
}
