import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { useScrollSpy } from "../lib/useScrollSpy";
import styles from "./Topbar.module.css";

/* Only what a visitor uses to get around lives in scrollspy — lab/proof are
   pages, not anchors; websites/films/releases stay reachable from the mobile
   sheet and in-page, just not competing for header width. */
const ANCHOR_IDS = ["intro", "works", "method", "contact"] as const;

/* Sheet numbers mirror the § section numbers on the page (lab/proof are
   pages, not sections, so they get the "open" arrow instead of a number). */
const SHEET = [
  { id: "works", kind: "anchor", num: "02" },
  { id: "websites", kind: "anchor", num: "03" },
  { id: "lab", kind: "link", href: "/lab/", num: "↗" },
  { id: "films", kind: "anchor", num: "05" },
  { id: "proof", kind: "link", href: "/proof/", num: "↗" },
  { id: "method", kind: "anchor", num: "06" },
  { id: "releases", kind: "anchor", num: "07" },
  { id: "contact", kind: "anchor", num: "08" },
] as const;

export function Topbar() {
  const { lang, setLang, t } = useI18n();
  const active = useScrollSpy(ANCHOR_IDS as unknown as string[]);
  const [open, setOpen] = useState(false);

  const go = (id: string) => { setOpen(false); scrollToId(id); };

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => go("intro")} aria-label="Shulgin — top">
          SHULGIN.IS-A<span className={styles.dot}>.</span>
        </button>

        <nav className={styles.nav} aria-label={lang === "ru" ? "Разделы" : "Sections"}>
          <button
            className={`${styles.link} ${active === "works" ? styles.on : ""}`}
            aria-current={active === "works" ? "true" : undefined}
            onClick={() => go("works")}
          >
            {t.nav.works}
          </button>
          <a className={styles.link} href="/lab/" data-cta="header-lab">{t.nav.lab}</a>
          <a className={styles.link} href="/proof/" data-cta="header-proof">{t.nav.proof}</a>
          <button
            className={`${styles.link} ${active === "method" ? styles.on : ""}`}
            aria-current={active === "method" ? "true" : undefined}
            onClick={() => go("method")}
          >
            {t.nav.method}
          </button>
          <button
            className={`${styles.link} ${active === "contact" ? styles.on : ""}`}
            aria-current={active === "contact" ? "true" : undefined}
            onClick={() => go("contact")}
          >
            {t.nav.contact}
          </button>
        </nav>

        <div className={styles.right}>
          <a className={styles.hire} href="https://shulgin.is-a.dev/store/prosto/" data-cta="header-hire">
            {t.nav_hire} <span aria-hidden="true">↗</span>
          </a>
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
          <a className={`${styles.sheetLink} ${styles.sheetHire}`} href="https://shulgin.is-a.dev/store/prosto/">
            <span className={styles.sheetNum} aria-hidden="true">↗</span>
            {t.nav_hire}
          </a>
          {SHEET.map((item) =>
            item.kind === "anchor" ? (
              <button
                key={item.id}
                className={`${styles.sheetLink} ${active === item.id ? styles.on : ""}`}
                onClick={() => go(item.id)}
              >
                <span className={styles.sheetNum}>{item.num}</span>
                {t.nav[item.id as keyof typeof t.nav]}
              </button>
            ) : (
              <a key={item.id} className={styles.sheetLink} href={item.href}>
                <span className={styles.sheetNum} aria-hidden="true">{item.num}</span>
                {t.nav[item.id as keyof typeof t.nav]}
              </a>
            )
          )}
          <a className={`${styles.sheetLink} ${styles.sheetStore}`} href="https://shulgin.is-a.dev/store">
            <span className={styles.sheetNum} aria-hidden="true">↗</span>
            {t.nav_store}
          </a>
        </div>
      )}
    </header>
  );
}
