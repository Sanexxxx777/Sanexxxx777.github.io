import { useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { projects } from "../data/projects";
import { apps } from "../data/apps";
import type { Project, Status } from "../data/types";
import type { Lang } from "../i18n/dict";
import { biVal } from "../lib/bi";
import { useHashOpen } from "../lib/useHashOpen";
import { Reveal } from "./Reveal";
import styles from "./WorksList.module.css";

/* "open" group = live/shipped work not tied to one client, ordered strongest-first */
const OPEN_ORDER: Status[] = ["prod", "open", "pet", "research", "saas"];

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

/* Accordion of all work (projects + apps), grouped by status, plus a tag
   cloud ("stack, through the work") that opens every row carrying a tag.
   Nativer <details> instead of a card grid: too many rows for a grid, and the
   click decision is made by name + type, same idiom as the Websites section. */
export function WorksList() {
  const { t, lang } = useI18n();
  const listRefs = useRef(new Map<string, HTMLDetailsElement | null>());
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

  const chips = useMemo(() => {
    const freq = new Map<string, number>();
    for (const p of all) for (const tag of p.tags) freq.set(tag, (freq.get(tag) ?? 0) + 1);
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 24)
      .map(([tag]) => tag);
  }, []);

  const toggleTag = (tag: string) => {
    const matchedEls = all
      .filter((p) => p.tags.includes(tag))
      .map((p) => listRefs.current.get(p.id))
      .filter((el): el is HTMLDetailsElement => !!el);

    if (activeTag === tag) {
      matchedEls.forEach((el) => { el.open = false; });
      setActiveTag(null);
      return;
    }
    matchedEls.forEach((el) => { el.open = true; });
    setActiveTag(tag);
    matchedEls[0]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {groups.map((g) => (
        <div key={g.key} className={styles.group}>
          <div className={styles.groupHead}>{g.label}</div>
          <div className={styles.list}>
            {g.items.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.04}>
                <WorkRow
                  p={p}
                  lang={lang}
                  statusLabel={t.status[p.status]}
                  openLabel={t.w_open}
                  setRef={(el) => listRefs.current.set(p.id, el)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.stack}>
        <div className={styles.stackHead}>{t.w_stack}</div>
        <p className={styles.stackHint}>{t.w_stack_hint}</p>
        <div className={styles.chips}>
          {chips.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${styles.chip} ${activeTag === tag ? styles.chipOn : ""}`}
              onClick={() => toggleTag(tag)}
              aria-pressed={activeTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
