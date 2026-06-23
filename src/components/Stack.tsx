import { useI18n } from "../i18n/I18nContext";
import { stackGroups } from "../data/stack";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Stack.module.css";

export function Stack() {
  const { lang, t } = useI18n();
  return (
    <section className="section wrap" id="stack">
      <SectionHead badge={t.s4_badge} title={t.s4_h2} right={t.s4_right} />
      <div className={styles.grid}>
        {stackGroups.map((g, gi) => (
          <Reveal key={g.head.en} delay={gi * 0.05} className={styles.group}>
            <div className={styles.head}>
              <h3>{g.head[lang]}<span className={styles.stop}>.</span></h3>
              <span className={styles.key}>[ § ]</span>
            </div>
            <ul className={styles.list}>
              {g.rows.map((r) => (
                <li key={r.name} className={`${styles.row} ${r.pct >= 85 ? styles.core : ""}`}>
                  <span className={styles.name}>{r.name}</span>
                  {r.lvl && <span className={styles.lvl}>{r.lvl}</span>}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
