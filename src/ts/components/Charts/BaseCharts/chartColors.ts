// "Other" gray color
const chartOtherWeakColor = "rgba(217, 217, 217, 0.3)";
const chartOtherStrongColor = "rgb(217, 217, 217)";

// Weak colors should line up 1-1 with strong colors
const chartWeakColors = [
    "rgba(51, 160, 44, 0.3)",
    "rgba(31, 120, 180, 0.3)",
    "rgba(227, 26, 28, 0.3)",
    "rgba(255, 191, 0, 0.3)",
    "rgba(106, 61, 154, 0.3)",
    "rgba(178, 223, 138, 0.3)",
    "rgba(166, 206, 227, 0.3)",
    "rgba(251, 154, 153, 0.3)",
    "rgba(253, 191, 111, 0.3)",
    "rgba(202, 178, 214, 0.3)",
];

const chartStrongColors = [
    "rgba(51, 160, 44, 0.9)",
    "rgba(31, 120, 180, 0.9)",
    "rgba(227, 26, 28, 0.9)",
    "rgba(255, 191, 0, 0.9)",
    "rgba(106, 61, 154, 0.9)",
    "rgba(178, 223, 138, 0.9)",
    "rgba(166, 206, 227, 0.9)",
    "rgba(251, 154, 153, 0.9)",
    "rgba(253, 191, 111, 0.9)",
    "rgba(202, 178, 214, 0.9)",
];

export const pieBackgroundColors = [...chartWeakColors, chartOtherWeakColor];
export const pieBorderColors = [...chartStrongColors, chartOtherStrongColor];
export const barColors = chartStrongColors;
export const barColorsWithOther = [...chartStrongColors, chartOtherStrongColor];

export const chartTextColor = "#c8c8c8";
export const chartDarkBackgroundColor = "#474747";
export const chartCogmindBackgroundColor = "#080808";
export const chartGridColor = "#646464";
