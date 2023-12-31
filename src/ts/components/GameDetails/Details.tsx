import { ReactNode } from "react";

import { Item, WeaponItem } from "../../types/itemTypes";
import { getItemAsciiArtImageName, getItemSpriteImageName } from "../../utilities/common";

import "./Details.less";

export type DetailsRangeLineProps = {
    category: string;
    valueString?: string;
    value?: number;
    defaultValueString?: string;
    minValue?: number;
    maxValue?: number;
    colorScheme: ColorScheme;
    unitString?: string;
};

// Color schemes
export type ColorScheme = "LowGood" | "HighGood" | "Green" | "Red";
type ColorSchemeColors = "Low" | "MidLow" | "MidHigh" | "High";
const colorSchemes: Record<ColorScheme, Record<ColorSchemeColors, string>> = {
    LowGood: {
        Low: "range-green",
        MidLow: "range-yellow",
        MidHigh: "range-orange",
        High: "range-red",
    },
    HighGood: {
        Low: "range-red",
        MidLow: "range-orange",
        MidHigh: "range-yellow",
        High: "range-green",
    },
    Green: {
        Low: "range-green",
        MidLow: "range-green",
        MidHigh: "range-green",
        High: "range-green",
    },
    Red: {
        Low: "range-red",
        MidLow: "range-red",
        MidHigh: "range-red",
        High: "range-red",
    },
};

export function DetailsEmptyLine() {
    return <pre className="details-line"> </pre>;
}

export function DetailsPartArtLine({ part }: { part: Item }) {
    return (
        <div className="part-art-image-container">
            <img src={getItemAsciiArtImageName(part)} />
        </div>
    );
}

export function DetailsPartTitleLine({ part }: { part: Item }) {
    return (
        <pre className="details-title details-part-image-title">
            {part.name}[<img src={getItemSpriteImageName(part)} />]
        </pre>
    );
}

export type DetailsTextLineProps = {
    category: string;
    content?: string | ReactNode;
    defaultContent?: string;
};
export function DetailsTextLine({ category, content, defaultContent }: DetailsTextLineProps) {
    const numSpaces = 23 - 1 - category.length;

    if (content === undefined) {
        if (defaultContent) {
            content = <span className="dim-text">{defaultContent}</span>;
        } else {
            content = "";
        }
    }

    return (
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {content}
        </pre>
    );
}

export type DetailsTextValueLineProps = {
    category: string;
    defaultValueString?: string;
    textNode: string | ReactNode;
    unitString?: string;
    value: string | undefined;
    valueClass?: string;
};

export function DetailsTextValueLine({
    category,
    defaultValueString,
    textNode,
    unitString,
    valueClass,
    value,
}: DetailsTextValueLineProps) {
    if (value === undefined) {
        value = defaultValueString || "";
        valueClass = "dim-text";
    }
    
    if (unitString !== undefined) {
        value += unitString;
    }

    const numSpaces = 23 - 1 - 1 - category.length - value.length;

    let valueNode: ReactNode;
    if (valueClass !== undefined) {
        valueNode = <span className={valueClass}>{value}</span>;
    } else {
        valueNode = <>{value}</>;
    }

    return (
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {valueNode} {textNode}
        </pre>
    );
}

export function DetailsRangeLine({
    category,
    colorScheme,
    maxValue = 0,
    minValue = 0,
    defaultValueString = "",
    unitString = "",
    value,
    valueString,
}: DetailsRangeLineProps) {
    let valueNode: ReactNode;
    if (valueString === undefined || value === undefined) {
        valueString = defaultValueString;
        value = 0;
        valueNode = <span className="dim-text">{defaultValueString + unitString}</span>;
    } else {
        valueNode = <>{valueString + unitString}</>;
    }

    // Determine bars and spacing
    const maxBars = 22;
    const numSpaces = 23 - 1 - 1 - category.length - (valueString as string).length - unitString.length;
    let valuePercentage: number;
    if (maxValue - minValue === 0) {
        valuePercentage = 1;
    } else {
        valuePercentage = value / (maxValue - minValue);
    }

    let fullBars = Math.min(Math.floor(maxBars * valuePercentage), 22);

    // Always round away from 0
    // This allows for things like 1/100 to show 1 bar rather than 0
    if (fullBars === 0 && value != minValue) {
        fullBars = 1;
    }

    if (minValue === maxValue) {
        fullBars = 0;
    }
    const emptyBars = maxBars - fullBars;

    // Determine color
    let colorClass: string;
    if (valuePercentage < 0.25) {
        colorClass = colorSchemes[colorScheme].Low;
    } else if (valuePercentage < 0.5) {
        colorClass = colorSchemes[colorScheme].MidLow;
    } else if (valuePercentage < 0.75) {
        colorClass = colorSchemes[colorScheme].MidHigh;
    } else {
        colorClass = colorSchemes[colorScheme].High;
    }

    // Create bars HTML string
    let barsNode: ReactNode;
    if (emptyBars > 0) {
        barsNode = (
            <>
                <span className={colorClass}>{"▮".repeat(fullBars)}</span>
                <span className="range-dim">{"▯".repeat(emptyBars)}</span>
            </>
        );
    } else {
        barsNode = <span className={colorClass}>{"▮".repeat(fullBars)}</span>;
    }

    // Return full HTML
    return (
        <pre className="details-line">
            <span> {category}</span>
            {" ".repeat(numSpaces)}
            {valueNode} {barsNode}
        </pre>
    );
}

export function DetailsSummaryLine({ text }: { text: string }) {
    return <pre className="details-summary">{text}</pre>;
}

export function DetailsProjectileSummaryLine({ category, item }: { category: string; item: WeaponItem }) {
    if (item.projectileCount > 1) {
        return (
            <pre className="details-summary">
                {category}
                {" ".repeat(13)}
                <span className="projectile-num"> x{item.projectileCount} </span>
            </pre>
        );
    } else {
        return <DetailsSummaryLine text={category} />;
    }
}

export default function DetailsValueLine({
    category,
    defaultValue,
    unitString = "",
    valueString,
}: {
    category: string;
    defaultValue?: string;
    unitString?: string;
    valueString: string | undefined;
}) {
    let valueNode: ReactNode;

    if (valueString === undefined) {
        if (defaultValue === undefined) {
            valueNode = "";
            valueString = "";
        } else {
            valueString = defaultValue + unitString;
            valueNode = <span className="dim-text">{valueString}</span>;
        }
    } else {
        valueString += unitString;
        valueNode = valueString;
    }

    const numSpaces = 23 - 1 - category.length - 1 - valueString.length;
    return (
        <pre className="details-line">
            {" "}
            {category}
            {" ".repeat(numSpaces)}
            {valueNode}
        </pre>
    );
}
