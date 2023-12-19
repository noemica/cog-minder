import { Plugin } from "chart.js";

export const chartCanvasBackgroundColorPlugin: Plugin<any> = {
    id: "chartCanvasBackgroundColor",
    beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = options.color;
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    },
};
