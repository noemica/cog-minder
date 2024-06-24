import {
    ChartData,
    Chart as ChartJS,
    ChartOptions,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    Point,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { forwardRef, useRef } from "react";
import { Scatter } from "react-chartjs-2";

import { ThemeType } from "../../../types/commonTypes";
import { useTheme } from "../../Effects/useLocalStorageValue";
import { chartCanvasBackgroundColorPlugin } from "./chartCanvasBackgroundColorPlugin";
import { chartCogmindBackgroundColor, chartDarkBackgroundColor, chartGridColor, chartTextColor } from "./chartColors";

// Need to register functionality that gets used or else
// it gets tree-shaken out
ChartJS.register(Filler, Legend, LineElement, LinearScale, PointElement, Tooltip, Title);

export type ScatterChartDataGroup = {
    id?: string;
    label: string;
    values: Point[];
};

export type ScatterLineChartProps = {
    borderColors: string[];
    backgroundColors: string[];
    chartTitle: string;
    isPercentage?: boolean;
    stepSize?: number;
    values: ScatterChartDataGroup[];
    xLabel?: string;
    yLabel?: string;
};

export default function ScatterLineChart({
    chartTitle,
    values,
    backgroundColors,
    borderColors,
    isPercentage,
    stepSize,
    xLabel,
    yLabel,
}: ScatterLineChartProps) {
    const theme = useTheme();
    const xMax = Math.max(...values.map((val) => Math.max(...val.values.map((point) => point.x))));

    return (
        <Scatter
            data={makeChartData(values, backgroundColors, borderColors)}
            datasetIdKey="id"
            options={makeChartOptions(chartTitle, isPercentage, stepSize, theme, xLabel, yLabel, xMax)}
            plugins={[chartCanvasBackgroundColorPlugin]}
        />
    );
}

function makeChartData(
    values: ScatterChartDataGroup[],
    backgroundColors: string[],
    borderColors: string[],
): ChartData<"scatter"> {
    return {
        datasets: values.map((group, i) => {
            return {
                backgroundColor: backgroundColors[i],
                borderColor: borderColors[i],
                data: group.values,
                fill: "start",
                id: group.id || group.label,
                label: group.label,
                pointRadius: 0,
                pointHitRadius: 25,
                showLine: true,
                stepped: "before",
            };
        }),
    };
}

function makeChartOptions(
    chartTitle: string,
    isPercentage: boolean | undefined,
    stepSize: number | undefined,
    theme: ThemeType,
    xLabel: string | undefined,
    yLabel: string | undefined,
    xMax: number | undefined,
): ChartOptions<"scatter"> {
    return {
        animation: {
            duration: 300,
        },
        // animation: false,
        color: chartTextColor,
        maintainAspectRatio: false,
        plugins: {
            chartCanvasBackgroundColor: {
                color: theme === "Cogmind" ? chartCogmindBackgroundColor : chartDarkBackgroundColor,
            },
            legend: {
                labels: {
                    font: {
                        size: 16,
                    },
                },
            },
            title: {
                color: chartTextColor,
                font: {
                    size: 24,
                },
                display: true,
                text: chartTitle,
            },
        },
        scales: {
            x: {
                border: {
                    display: false,
                },
                min: 0,
                max: xMax,
                grid: {
                    display: false,
                },
                ticks: {
                    color: chartTextColor,
                    stepSize: stepSize,
                },
                title: {
                    color: chartTextColor,
                    display: xLabel !== undefined,
                    font: {
                        size: 24,
                    },
                    text: xLabel,
                },
            },
            y: {
                border: {
                    display: false,
                },
                max: isPercentage ? 100 : undefined,
                min: isPercentage ? 0 : undefined,
                grid: {
                    color: chartGridColor,
                },
                ticks: {
                    callback: isPercentage ? (tickValue, _index, _ticks) => tickValue + "%" : undefined,
                    color: chartTextColor,
                },
                title: {
                    color: chartTextColor,
                    display: yLabel !== undefined,
                    font: {
                        size: 24,
                    },
                    text: yLabel,
                },
            },
        },
    };
}
