import "../styles/index.less";

import { createRoot } from "react-dom/client";
import { CombatPage } from "./components/Pages/CombatPage";
import { StrictMode } from "react";

// Create the root object
const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);

function App() {
    return <CombatPage />;
}
