import { ReactNode } from "react";
import "./ChartGrid.less";

export type ChartGridProps = {
    children: ReactNode;
};

export default function ChartGrid({ children }: ChartGridProps) {
    return <div className="chart-grid">{children}</div>;
}
