import { ChartType, Color } from "chart.js";

declare module "chart.js" {
    interface PluginOptionsByType<TType extends ChartType> {
        chartCanvasBackgroundColor?: {
            color: Color;
        };
    }
}
