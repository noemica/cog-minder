import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App/App";

import "../styles/index.less";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
    <StrictMode>
        <App pageType="Combat" />
    </StrictMode>,
);
