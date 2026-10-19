import { useI18n } from "../i18n/I18nContext";
import { Reveal } from "./Reveal";
import styles from "./Doors.module.css";

/* Door band right under the hero: one entrance per visitor intent (hiring a
   person, ordering software, a small-business site). Plain links, not a modal
   and not sticky. Strings and hrefs (with ?lang) live in dict.ts. */
export function Doors() {
  const { t } = useI18n();
  return (
    <section className={`${styles.doors} wrap`} aria-labelledby="doors-h">
      <Reveal>
        <h2 className={styles.h} id="doors-h">{t.doors_h}</h2>
        <div className={styles.grid}>
          {t.doors.map((d) => (
            <a key={d.cta} className={`${styles.tile} hoverline`} href={d.href} data-cta={d.cta}>
              <span className={styles.lbl}>{d.lbl}</span>
              <span className={styles.title}>{d.title}</span>
              <span className={styles.line}>{d.line}</span>
              <span className={styles.go} aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
