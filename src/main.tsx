import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

/* variable-версии нужны только кинетике заголовков (ось wght, lib/kinetic.ts) */
import "@fontsource-variable/big-shoulders-display/wght.css";
import "@fontsource-variable/oswald/wght.css";
import "@fontsource/big-shoulders-display/700.css";
import "@fontsource/big-shoulders-display/900.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import "./styles/global.css";
import App from "./App";
import { initHit } from "./lib/hit";
import { fullLayout } from "./lib/layout";

initHit();

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

/* build output carries the prerendered FULL layout (scripts/prerender.mjs): hydrate it.
   Plain client render instead (the prerendered markup is replaced) when there is nothing to
   hydrate (vite dev), `?layout=short` (a different tree), or prefers-reduced-motion: Reveal
   (motion) renders `initial={false}` for those visitors, which cannot match the server's
   opacity:0 markup, and attribute mismatches are never patched up by hydration. */
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (root.hasChildNodes() && fullLayout && !reduced) hydrateRoot(root, app);
else createRoot(root).render(app);
