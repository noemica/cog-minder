import { ArcElement, ChartData, Chart as ChartJS, ChartOptions, Legend, Title, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

import { ChartDataValue } from "../../../types/combatLogTypes";
import { ThemeType } from "../../../types/commonTypes";
import { useTheme } from "../../Effects/useLocalStorageValue";
import { WindowSize, useWindowSize } from "../../Effects/useWindowSize";
import { chartCanvasBackgroundColorPlugin } from "./chartCanvasBackgroundColorPlugin";
import { chartCogmindBackgroundColor, chartDarkBackgroundColor, chartTextColor } from "./chartColors";

// Need to register functionality that gets used or else
// it gets tree-shaken out
ChartJS.register(ArcElement, Tooltip, Legend, Title);

export type PieChartProps = {
    chartTitle: string;
    values: ChartDataValue[];
    backgroundColors: string[];
    borderColors: string[];
};

export default function PieChart({ chartTitle, values, backgroundColors, borderColors }: PieChartProps) {
    const windowSize = useWindowSize();
    const theme = useTheme();

    return (
        <Pie
            data={makeChartData(chartTitle, values, backgroundColors, borderColors)}
            options={makeChartOptions(chartTitle, theme, windowSize)}
            plugins={[chartCanvasBackgroundColorPlugin]}
        />
    );
}

function makeChartData(
    valueLabel: string,
    values: ChartDataValue[],
    backgroundColors: string[],
    borderColors: string[],
): ChartData<"pie"> {
    return {
        labels: values.map((d) => d.label),
        datasets: [
            {
                label: valueLabel,
                data: values.map((d) => d.value),
                backgroundColor: backgroundColors,
                borderColor: borderColors,
            },
        ],
    };
}

function makeChartOptions(chartTitle: string, theme: ThemeType, windowSize: WindowSize): ChartOptions<"pie"> {
    return {
        animation: {
            duration: 300,
        },
        color: chartTextColor,
        maintainAspectRatio: false,
        plugins: {
            chartCanvasBackgroundColor: {
                color: theme === "Cogmind" ? chartCogmindBackgroundColor : chartDarkBackgroundColor,
            },
            title: {
                color: chartTextColor,
                display: true,
                font: {
                    size: Math.min(20, windowSize.width / 22),
                },
                text: chartTitle,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        // Add the overall percentage of each slice to the tooltip
                        const value = Number(context.formattedValue);

                        const sum = context.chart.data.datasets[0].data
                            .map((d) => Number(d))
                            .reduce((a, b) => a + b, 0);

                        const percentage = ((value * 100) / sum).toFixed(1);
                        return `${chartTitle}: ${value} (${percentage}%) `;
                    },
                },
            },
        },
    };
}
