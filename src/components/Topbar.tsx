import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { useScrollSpy } from "../lib/useScrollSpy";
import { fullLayout, sectionNum } from "../lib/layout";
import styles from "./Topbar.module.css";

/* Only what a visitor uses to get around lives in scrollspy — lab/proof/cv/game are
   pages, not anchors; websites/films/releases stay reachable from the mobile
   sheet and in-page, just not competing for header width. The same tab row is
   stamped into every static page's .brand-bar at build time (scripts/brand-nav.mjs):
   a tab added here goes there too. */
const ANCHOR_IDS = ["intro", "works", "contact"];

/* Sheet numbers mirror the § section numbers on the page (lab/proof are
   pages, not sections, so they get the "open" arrow instead of a number).
   Numbers come from lib/layout.ts so they match the active layout; ids that the
   layout does not render are dropped. */
const SHEET_ALL = [
  { id: "home", kind: "anchor" },
  { id: "works", kind: "anchor" },
  { id: "websites", kind: "anchor" },
  { id: "lab", kind: "link", href: "/lab/" },
  { id: "films", kind: "anchor" },
  { id: "proof", kind: "link", href: "/proof/" },
  { id: "cv", kind: "link", href: "/cv/" },
  { id: "game", kind: "link", href: "/game/" },
  { id: "releases", kind: "anchor" },
  { id: "contact", kind: "anchor" },
] as const;
const SHEET = SHEET_ALL
  .filter((i) => i.kind === "link" || (fullLayout ? true : ["home", "works", "websites", "releases", "contact"].includes(i.id)))
  .map((i) => ({ ...i, num: i.kind === "link" ? "↗" : i.id === "home" ? "01" : sectionNum(i.id) }));

/* the game is its own full-screen site: it opens in a new tab so the portfolio tabs stay open */
const NEW_TAB = { target: "_blank", rel: "noopener" } as const;

export function Topbar() {
  const { lang, setLang, t } = useI18n();
  const active = useScrollSpy(ANCHOR_IDS);
  const [open, setOpen] = useState(false);

  const go = (id: string) => { setOpen(false); scrollToId(id === "home" ? "intro" : id); };

  /* /hire/ и /cv/ хранят язык отдельно от главной, поэтому язык едет в адресе (в обоих языках кнопка ведёт на /hire/) */
  const hireHref = `/hire/?lang=${lang}`;
  const pageHref = (href: string) => (href === "/lab/" ? href : `${href}?lang=${lang}`);

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => go("intro")} aria-label="Shulgin — top" data-cta="nav-intro">
          SHULGIN.IS-A<span className={styles.dot}>.</span>
        </button>

        <nav className={styles.nav} aria-label={lang === "ru" ? "Разделы" : "Sections"}>
          <button
            className={`${styles.link} ${active === "intro" ? styles.on : ""}`}
            aria-current={active === "intro" ? "true" : undefined}
            onClick={() => go("intro")}
            data-cta="nav-home"
          >
            {t.nav.home}
          </button>
          <button
            className={`${styles.link} ${active === "works" ? styles.on : ""}`}
            aria-current={active === "works" ? "true" : undefined}
            onClick={() => go("works")}
            data-cta="nav-works"
          >
            {t.nav.works}
          </button>
          <a className={styles.link} href="/lab/" data-cta="nav-lab">{t.nav.lab}</a>
          <a className={styles.link} href={`/proof/?lang=${lang}`} data-cta="nav-proof">{t.nav.proof}</a>
          <a className={styles.link} href={`/cv/?lang=${lang}`} data-cta="nav-cv">{t.nav.cv}</a>
          <a className={styles.link} href={`/game/?lang=${lang}`} {...NEW_TAB} data-cta="nav-game">
            {t.nav.game} <span className={styles.beta}>{t.game_beta}</span>
          </a>
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
          <a className={styles.hire} href={hireHref} data-cta="header-hire">
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
          <a className={`${styles.sheetLink} ${styles.sheetHire}`} href={hireHref} data-cta="sheet-hire">
            <span className={styles.sheetNum} aria-hidden="true">↗</span>
            {t.nav_hire}
          </a>
          {SHEET.map((item) =>
            item.kind === "anchor" ? (
              <button
                key={item.id}
                className={`${styles.sheetLink} ${active === (item.id === "home" ? "intro" : item.id) ? styles.on : ""}`}
                onClick={() => go(item.id)}
                data-cta={`nav-${item.id}`}
              >
                <span className={styles.sheetNum}>{item.num}</span>
                {t.nav[item.id as keyof typeof t.nav]}
              </button>
            ) : (
              <a key={item.id} className={styles.sheetLink} href={pageHref(item.href)}
                {...(item.id === "game" ? NEW_TAB : {})} data-cta={`nav-${item.id}`}>
                <span className={styles.sheetNum} aria-hidden="true">{item.num}</span>
                {t.nav[item.id as keyof typeof t.nav]}
                {item.id === "game" && <span className={styles.beta}>{t.game_beta}</span>}
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
