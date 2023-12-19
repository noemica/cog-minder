import { createRoot } from "react-dom/client";

import App from "./components/App/App";

import "../styles/index.less";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App pageType="About" />);
