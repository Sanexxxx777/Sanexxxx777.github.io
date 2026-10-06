import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";
import { UI, META, type Lang } from "./dict";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (typeof UI)["ru"] };
const I18n = createContext<Ctx | null>(null);

/* Language is decided by the URL: /ru/... = RU, anything else = EN. During prerender there is
   no location, so entry-server.tsx sets the language through setRenderLang() before each
   (synchronous) renderToString. */
let renderLang: Lang = "en";
// eslint-disable-next-line react-refresh/only-export-components
export function setRenderLang(l: Lang) { renderLang = l; }

// eslint-disable-next-line react-refresh/only-export-components
export function langFromPath(path: string): Lang {
  return path === "/ru" || path.startsWith("/ru/") ? "ru" : "en";
}

function currentLang(): Lang {
  return typeof window === "undefined" ? renderLang : langFromPath(window.location.pathname);
}

function applyMeta(lang: Lang) {
  const m = META[lang];
  document.documentElement.lang = lang;
  document.title = m.title;
  const set = (sel: string, val: string) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute("content", val);
  };
  set('meta[name="description"]', m.desc);
  set('meta[property="og:title"]', m.ogt);
  set('meta[property="og:description"]', m.ogd);
  set('meta[name="twitter:title"]', m.ogt);
  set('meta[name="twitter:description"]', m.ogd);
  set('meta[property="og:locale"]', m.locale);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = currentLang();

  /* The switch is navigation between / and /ru/ (hash and query kept), not an in-place toggle;
     the choice is stored so the one-time ru redirect on "/" (index.html) never overrides it. */
  const setLang = (l: Lang) => {
    if (l === lang) return;
    try { localStorage.setItem("lang", l); } catch { /* ignore */ }
    const { search, hash } = window.location;
    window.location.assign((l === "ru" ? "/ru/" : "/") + search + hash);
  };

  /* Built pages ship their own head (prerender.mjs), so nothing to patch at runtime. Only
     `vite dev` has no prerendered head: keep <html lang>/title/meta in sync with the URL there. */
  useLayoutEffect(() => { if (import.meta.env.DEV) applyMeta(lang); }, [lang]);

  return <I18n.Provider value={{ lang, setLang, t: UI[lang] }}>{children}</I18n.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const c = useContext(I18n);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
