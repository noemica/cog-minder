import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App/App";

import "../styles/index.less";

async function render() {
    const container = document.getElementById("root")!;
    const root = createRoot(container);
    root.render(<App pageType="Hacks" />);
}

render();