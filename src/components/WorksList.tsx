import { Fragment, useMemo, useRef, type ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import { projects } from "../data/projects";
import { apps } from "../data/apps";
import type { Project, Status } from "../data/types";
import type { Lang } from "../i18n/dict";
import { biVal } from "../lib/bi";
import { useHashOpen } from "../lib/useHashOpen";
import { useCollapse } from "../lib/useCollapse";
import { Reveal } from "./Reveal";
import styles from "./WorksList.module.css";

/* "open" group = live/shipped work not tied to one client, ordered strongest-first */
const OPEN_ORDER: Status[] = ["prod", "open", "pet", "research", "saas"];

/* rows shown per group before "show all": the page was 19k px and 6 of 24 visitors
   reached its middle (counter 21.09–05.10.2026) */
const LIMIT = 5;
/* retired work is history, not proof: its group shows only the «show all» button (konsilium 24.11) */
const limitFor = (key: string) => (key === "closed" ? 0 : LIMIT);

const all: Project[] = [...projects, ...apps];

function WorkRow({
  p, lang, statusLabel, openLabel, setRef,
}: {
  p: Project;
  lang: Lang;
  statusLabel: string;
  openLabel: string;
  setRef: (el: HTMLDetailsElement | null) => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useHashOpen(ref, `work-${p.id}`);
  return (
    <details
      id={`work-${p.id}`}
      className={`${styles.item} hoverline`}
      ref={(el) => { ref.current = el; setRef(el); }}
    >
      <summary className={styles.row}>
        <span className={styles.kicker}>{p.kicker[lang]}</span>
        <span className={styles.title}>{p.title}</span>
        <span className={styles.year}>{p.year}</span>
        <span className={`${styles.tag} ${p.status === "prod" ? styles.prodTag : ""}`}>{statusLabel}</span>
        <span className={styles.sign} aria-hidden="true" />
      </summary>
      <div className={styles.body}>
        <p className={styles.desc}>{p.desc[lang]}</p>
        <div className={styles.tags}>
          {p.tags.map((tg) => <span key={tg} className={styles.ptag}>{tg}</span>)}
        </div>
        <div className={styles.meta}>
          {p.meta.map((m, i) => (
            <span key={i}><b>{m.k[lang]}</b> {biVal(m.v, lang)}</span>
          ))}
        </div>
        {p.link && (
          <a className={styles.link} href={p.link} target="_blank" rel="noopener noreferrer" data-cta={`work-link-${p.id}`}>
            {openLabel} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </details>
  );
}

/* Accordion of all work (projects + apps), grouped by status. The tag cloud
   was removed 24.11 (konsilium: noise between the work and the contact).
   Nativer <details> instead of a card grid: too many rows for a grid, and the
   click decision is made by name + type, same idiom as the Websites section. */
export function WorksList({ afterFirst }: { afterFirst?: ReactNode }) {
  const { t, lang } = useI18n();
  const listRefs = useRef(new Map<string, HTMLDetailsElement | null>());

  const groups = useMemo(() => {
    const open = all
      .filter((p) => OPEN_ORDER.includes(p.status))
      .sort((a, b) => OPEN_ORDER.indexOf(a.status) - OPEN_ORDER.indexOf(b.status));
    const client = all.filter((p) => p.status === "client");
    const closed = all.filter((p) => p.status === "closed");
    return [
      { key: "open", label: t.w_group_open, items: open },
      { key: "client", label: t.w_group_client, items: client },
      { key: "closed", label: t.w_group_closed, items: closed },
    ].filter((g) => g.items.length > 0);
  }, [t]);

  const collapseGroups = useMemo(
    () => groups.map((g) => ({ key: g.key, ids: g.items.map((p) => p.id) })),
    [groups],
  );
  const { isOpen, toggle } = useCollapse(collapseGroups, limitFor, "work-");

  return (
    <>
      {groups.map((g, gi) => (
        <Fragment key={g.key}>
        <div className={styles.group}>
          <div className={styles.groupHead}>{g.label}</div>
          <div className={styles.list}>
            {g.items.map((p, i) => (
              <div key={p.id} hidden={i >= limitFor(g.key) && !isOpen(g.key)}>
                <Reveal delay={(i % 4) * 0.04}>
                  <WorkRow
                    p={p}
                    lang={lang}
                    statusLabel={t.status[p.status]}
                    openLabel={t.w_open}
                    setRef={(el) => listRefs.current.set(p.id, el)}
                  />
                </Reveal>
              </div>
            ))}
          </div>
          {g.items.length > limitFor(g.key) && (
            <button
              type="button"
              className="show-more"
              aria-expanded={isOpen(g.key)}
              onClick={() => toggle(g.key)}
              data-cta={`works-more-${g.key}`}
            >
              {isOpen(g.key) ? t.list_less : `${t.list_more} (+${g.items.length - limitFor(g.key)})`}
            </button>
          )}
        </div>
        {/* a block that belongs between the first group (products and tools) and client work: it stays inside this component so chips and deep links keep one collapse state */}
        {gi === 0 && afterFirst && <div className={styles.afterFirst}>{afterFirst}</div>}
        </Fragment>
      ))}

    </>
  );
}
