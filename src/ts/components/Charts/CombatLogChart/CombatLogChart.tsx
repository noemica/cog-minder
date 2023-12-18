import { ReactNode, useState } from "react";
import HorizontalBarChart from "../BaseCharts/HorizontalBarChart";
import PieChart from "../BaseCharts/PieChart";
import { barColors, barColorsWithOther, pieBackgroundColors, pieBorderColors } from "../BaseCharts/chartColors";
import Button from "../../Buttons/Button";
import { ChartDataValue, ChartDisplayOptions, CombatLogChartType } from "../../../types/combatLogTypes";

import "./combatLogChart.less";

export type CombatLogChartProps = {
    chartTitle: string;
    values: ChartDataValue[];
    displayOptions: ChartDisplayOptions;
    forceChartType?: CombatLogChartType;
};

export default function CombatLogChart({ chartTitle, values, displayOptions, forceChartType }: CombatLogChartProps) {
    const [expanded, setExpanded] = useState(false);
    const [sortDescending, setSortDescending] = useState(true);

    let otherCategoryAdded = false;
    values = [...values];
    values.sort((a, b) => (sortDescending ? b.value - a.value : a.value - b.value));
    const expandableItems = values.length > 10;

    if (!expanded && expandableItems) {
        // To avoid showing too many pieces of data at once,
        // only show the 10 highest values and then lump the
        // rest into an "Other" group unless explicitly expanded
        const topValues = values.splice(0, 10);
        topValues.push({
            label: "Other",
            value: values.reduce((p, v) => p + v.value, 0),
        });
        values = topValues;

        otherCategoryAdded = true;
    }

    if (displayOptions.chartType === "Pie" && forceChartType !== "Bar") {
        return createPieChart(chartTitle, values);
    } else {
        return createHorizontalBarChart(
            values,
            chartTitle,
            otherCategoryAdded,
            expandableItems,
            setExpanded,
            expanded,
            setSortDescending,
            sortDescending,
        );
    }
}
function createHorizontalBarChart(
    values: ChartDataValue[],
    chartTitle: string,
    otherCategoryAdded: boolean,
    expandableItems: boolean,
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>,
    expanded: boolean,
    setSortDescending: React.Dispatch<React.SetStateAction<boolean>>,
    sortDescending: boolean,
) {
    let maxValue: number | undefined = undefined;
    if (otherCategoryAdded && (!sortDescending || (sortDescending && values[10].value > 1.2 * values[0].value))) {
        // To better show the values when the "Other" category is far larger
        // than the other values, cap the maximum value at 1.2 times the biggest
        // value. Otherwise the values can look very tiny on the chart since
        // the Other category is too big.
        maxValue = Math.floor(1.2 * (sortDescending ? values[0].value : values[9].value));
    }

    const chart = (
        <div
            className="horizontal-bar-chart-wrapper"
            style={{
                height: `${75 + values.length * 20}px`,
            }}
        >
            <HorizontalBarChart
                chartTitle={chartTitle}
                values={values}
                barColors={otherCategoryAdded ? barColorsWithOther : barColors}
                maxValue={maxValue}
            />
        </div>
    );

    let expandCollapseButton: ReactNode = undefined;
    if (expandableItems) {
        expandCollapseButton = (
            <Button
                onClick={() => setExpanded((s) => !s)}
                className="button-expand-collapse"
                tooltip={
                    expanded
                        ? 'Click to collapse back to top 10 values and "Other" category'
                        : 'Click to expand "Other" category into all values'
                }
            >
                {expanded ? "▲ Collapse ▲" : "▼ Show All ▼"}
            </Button>
        );
    }

    const sortButton = (
        <Button
            onClick={() => setSortDescending((d) => !d)}
            className="button-ascending-descending"
            tooltip={
                sortDescending ? "Click to change sort order to descending" : "Click to change sort order to ascending"
            }
        >
            {sortDescending ? "Sort ↓" : "Sort ↑"}
        </Button>
    );

    const chartContainer = (
        <div className="horizontal-bar-chart-container">
            {sortButton}
            {chart}
            {expandCollapseButton}
        </div>
    );

    return chartContainer;
}

function createPieChart(chartTitle: string, values: ChartDataValue[]) {
    return (
        <div className="pie-chart-container">
            <PieChart
                chartTitle={chartTitle}
                values={values}
                borderColors={pieBorderColors}
                backgroundColors={pieBackgroundColors}
            />
        </div>
    );
}
