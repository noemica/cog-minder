import React from "react";
import { createRoot } from "react-dom/client";

import items from "../json/items.json";
import App from "./components/App/App";
import { initData } from "./utilities/common";

import "../styles/index.less";

async function render() {
    await initData(items, undefined);
    
    const container = document.getElementById("root")!;
    const root = createRoot(container);
    root.render(<App pageType="Parts" />);
}

render();