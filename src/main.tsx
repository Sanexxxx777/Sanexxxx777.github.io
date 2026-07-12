import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/big-shoulders-display/index.css";
import "@fontsource-variable/oswald/index.css";
import "@fontsource/big-shoulders-display/700.css";
import "@fontsource/big-shoulders-display/900.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/permanent-marker/400.css";

import "./styles/global.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
