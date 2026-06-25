import { useI18n } from "../i18n/I18nContext";
import type { Project } from "../data/types";
import { biVal } from "../lib/bi";
import styles from "./ProjectCard.module.css";

const STATUS: Record<Project["status"], { ru: string; en: string; cls: string }> = {
  prod: { ru: "PRODUCTION", en: "PRODUCTION", cls: "prod" },
  research: { ru: "RESEARCH", en: "RESEARCH", cls: "research" },
  client: { ru: "КЛИЕНТСКИЙ", en: "CLIENT", cls: "client" },
  saas: { ru: "SAAS", en: "SAAS", cls: "prod" },
  open: { ru: "OPEN-SOURCE", en: "OPEN-SOURCE", cls: "open" },
  pet: { ru: "PET-PROJECT", en: "PET-PROJECT", cls: "pet" },
};

export function ProjectCard({ p, index }: { p: Project; index: number }) {
  const { lang } = useI18n();
  const st = STATUS[p.status];
  const body = (
    <>
      <div className={styles.top}>
        <span className={styles.code}>▌ MOD_{String(index).padStart(2, "0")}</span>
        <span className={`${styles.tag} ${styles[st.cls]}`}>{st[lang]}</span>
        <span className={styles.year}>{p.year}</span>
      </div>
      <div className={styles.kicker}>{p.kicker[lang]}</div>
      <h3 className={styles.title}>{p.title}</h3>
      <p className={styles.desc}>{p.desc[lang]}</p>
      <div className={styles.tags}>
        {p.tags.map((t) => <span key={t} className={styles.ptag}>{t}</span>)}
      </div>
      <div className={styles.meta}>
        {p.meta.map((m, i) => (
          <span key={i}><b>{m.k[lang]}</b> {biVal(m.v, lang)}</span>
        ))}
      </div>
      {p.link && <span className={styles.go} aria-hidden="true">↗</span>}
    </>
  );

  if (p.link) {
    return (
      <a className={`${styles.card} ${styles.linked}`} href={p.link} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }
  return <article className={styles.card}>{body}</article>;
}
