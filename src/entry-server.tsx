/* eslint-disable react-refresh/only-export-components -- build-time entry, no fast refresh */
import { renderToString } from "react-dom/server";
import App from "./App";
import { META, type Lang } from "./i18n/dict";
import { setRenderLang } from "./i18n/I18nContext";

/* Build-time only (vite build --ssr, driven by scripts/prerender.mjs). Renders the FULL layout
   (no `location` on the server, see lib/layout.ts) in the given language. */
export function render(lang: Lang): string {
  setRenderLang(lang);
  return renderToString(<App />);
}

export { META };
