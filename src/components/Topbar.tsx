import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { useScrollSpy } from "../lib/useScrollSpy";
import { fullLayout, sectionNum } from "../lib/layout";
import styles from "./Topbar.module.css";

/* Only what a visitor uses to get around lives in scrollspy — lab/proof are
   pages, not anchors; websites/films/releases stay reachable from the mobile
   sheet and in-page, just not competing for header width. */
const ANCHOR_IDS = fullLayout ? ["intro", "works", "method", "contact"] : ["intro", "works", "contact"];

/* Sheet numbers mirror the § section numbers on the page (lab/proof are
   pages, not sections, so they get the "open" arrow instead of a number).
   Numbers come from lib/layout.ts so they match the active layout; ids that the
   layout does not render are dropped. */
const SHEET_ALL = [
  { id: "works", kind: "anchor" },
  { id: "websites", kind: "anchor" },
  { id: "lab", kind: "link", href: "/lab/" },
  { id: "films", kind: "anchor" },
  { id: "proof", kind: "link", href: "/proof/" },
  { id: "method", kind: "anchor" },
  { id: "releases", kind: "anchor" },
  { id: "contact", kind: "anchor" },
] as const;
const SHEET = SHEET_ALL
  .filter((i) => i.kind === "link" || (fullLayout ? true : ["works", "websites", "releases", "contact"].includes(i.id)))
  .map((i) => ({ ...i, num: i.kind === "link" ? "↗" : sectionNum(i.id) }));

export function Topbar() {
  const { lang, setLang, t } = useI18n();
  const active = useScrollSpy(ANCHOR_IDS);
  const [open, setOpen] = useState(false);

  const go = (id: string) => { setOpen(false); scrollToId(id); };

  /* «Заказать» ведёт на /hire/ только по-русски; английская кнопка «Hire me» прокручивает к контактам.
     /hire/ хранит язык отдельно от главной, поэтому язык едет в адресе. */
  const hireHref = lang === "ru" ? "/hire/?lang=ru" : "#contact";
  const hireClick = (e: React.MouseEvent) => {
    if (lang === "ru") return;
    e.preventDefault();
    go("contact");
  };

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => go("intro")} aria-label="Shulgin — top" data-cta="nav-intro">
          SHULGIN.IS-A<span className={styles.dot}>.</span>
        </button>

        <nav className={styles.nav} aria-label={lang === "ru" ? "Разделы" : "Sections"}>
          <button
            className={`${styles.link} ${active === "works" ? styles.on : ""}`}
            aria-current={active === "works" ? "true" : undefined}
            onClick={() => go("works")}
            data-cta="nav-works"
          >
            {t.nav.works}
          </button>
          <a className={styles.link} href="/lab/" data-cta="nav-lab">{t.nav.lab}</a>
          <a className={styles.link} href="/proof/" data-cta="nav-proof">{t.nav.proof}</a>
          {fullLayout && (
            <button
              className={`${styles.link} ${active === "method" ? styles.on : ""}`}
              aria-current={active === "method" ? "true" : undefined}
              onClick={() => go("method")}
              data-cta="nav-method"
            >
              {t.nav.method}
            </button>
          )}
          <button
            className={`${styles.link} ${active === "contact" ? styles.on : ""}`}
            aria-current={active === "contact" ? "true" : undefined}
            onClick={() => go("contact")}
            data-cta="nav-contact"
          >
            {t.nav.contact}
          </button>
        </nav>

        <div className={styles.right}>
          <a className={styles.hire} href={hireHref} onClick={hireClick} data-cta="header-hire">
            {t.nav_hire} <span aria-hidden="true">↗</span>
          </a>
          <div className={styles.lang} role="group" aria-label="Language">
            {(["ru", "en"] as const).map((l) => (
              <button
                key={l}
                className={`${styles.langBtn} ${lang === l ? styles.langOn : ""}`}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                data-cta={`lang-${l}`}
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
          <a className={`${styles.sheetLink} ${styles.sheetHire}`} href={hireHref} onClick={hireClick} data-cta="sheet-hire">
            <span className={styles.sheetNum} aria-hidden="true">↗</span>
            {t.nav_hire}
          </a>
          {SHEET.map((item) =>
            item.kind === "anchor" ? (
              <button
                key={item.id}
                className={`${styles.sheetLink} ${active === item.id ? styles.on : ""}`}
                onClick={() => go(item.id)}
                data-cta={`nav-${item.id}`}
              >
                <span className={styles.sheetNum}>{item.num}</span>
                {t.nav[item.id as keyof typeof t.nav]}
              </button>
            ) : (
              <a key={item.id} className={styles.sheetLink} href={item.href} data-cta={`nav-${item.id}`}>
                <span className={styles.sheetNum} aria-hidden="true">{item.num}</span>
                {t.nav[item.id as keyof typeof t.nav]}
              </a>
            )
          )}
          <a className={`${styles.sheetLink} ${styles.sheetStore}`} href="https://shulgin.is-a.dev/store" data-cta="nav-store">
            <span className={styles.sheetNum} aria-hidden="true">↗</span>
            {t.nav_store}
          </a>
        </div>
      )}
    </header>
  );
}
