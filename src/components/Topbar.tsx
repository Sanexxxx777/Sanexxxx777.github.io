import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { useScrollSpy } from "../lib/useScrollSpy";
import styles from "./Topbar.module.css";

const SECTIONS = ["intro", "principles", "projects", "apps", "stack", "releases", "contact"] as const;

export function Topbar() {
  const { lang, setLang, t } = useI18n();
  const active = useScrollSpy(SECTIONS as unknown as string[]);
  const [open, setOpen] = useState(false);

  const go = (id: string) => { setOpen(false); scrollToId(id); };

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => go("intro")} aria-label="Shulgin — top">
          SHULGIN.IS-A<span className={styles.dot}>.</span>
        </button>

        <nav className={styles.nav} aria-label={lang === "ru" ? "Разделы" : "Sections"}>
          {SECTIONS.map((id) => (
            <button
              key={id}
              className={`${styles.link} ${active === id ? styles.on : ""}`}
              aria-current={active === id ? "true" : undefined}
              onClick={() => go(id)}
            >
              {t.nav[id]}
            </button>
          ))}
          <a className={styles.store} href="https://shulgin.is-a.dev/store">
            <span className={styles.led} aria-hidden="true" />
            {lang === "ru" ? "Магазин" : "Store"}
            <span className={styles.storeBeta}>{lang === "ru" ? "бета" : "beta"}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <div className={styles.right}>
          <div className={styles.lang} role="group" aria-label="Language">
            {(["ru", "en"] as const).map((l) => (
              <button
                key={l}
                className={`${styles.langBtn} ${lang === l ? styles.langOn : ""}`}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className={styles.cta} onClick={() => go("contact")}>
            <span className={styles.led} aria-hidden="true" />
            {t.nav_cta} <span aria-hidden="true">↗</span>
          </button>
          <button
            className={styles.burger}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.sheet}>
          {SECTIONS.map((id) => (
            <button key={id} className={`${styles.sheetLink} ${active === id ? styles.on : ""}`} onClick={() => go(id)}>
              <span className={styles.sheetNum}>0{SECTIONS.indexOf(id) + 1}</span>
              {t.nav[id]}
            </button>
          ))}
          <a className={`${styles.sheetLink} ${styles.sheetStore}`} href="https://shulgin.is-a.dev/store">
            <span className={styles.sheetNum} aria-hidden="true">↗</span>
            {lang === "ru" ? "Магазин" : "Store"}
            <span className={styles.storeBeta}>{lang === "ru" ? "бета" : "beta"}</span>
          </a>
        </div>
      )}
    </header>
  );
}
