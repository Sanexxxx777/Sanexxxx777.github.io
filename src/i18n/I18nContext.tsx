import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { UI, META, type Lang } from "./dict";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (typeof UI)["ru"] };
const I18n = createContext<Ctx | null>(null);

function detect(): Lang {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "ru" || saved === "en") return saved;
  } catch { /* ignore */ }
  return (navigator.language || "").toLowerCase().startsWith("ru") ? "ru" : "en";
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
  const [lang, setLangState] = useState<Lang>(() => (typeof window === "undefined" ? "ru" : detect()));

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch { /* ignore */ }
  };

  // layout effect → sets <html lang> before first paint (drives per-language CSS, no flash)
  useLayoutEffect(() => { applyMeta(lang); }, [lang]);

  return <I18n.Provider value={{ lang, setLang, t: UI[lang] }}>{children}</I18n.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const c = useContext(I18n);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
