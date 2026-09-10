import { useI18n } from "../i18n/I18nContext";
import { principles } from "../data/principles";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Principles.module.css";

export function Principles() {
  const { lang, t } = useI18n();
  return (
    <section className="section wrap" id="method">
      <SectionHead badge={t.p2_badge} title={t.p2_h2} right={t.p2_right} />
      <div className={styles.grid}>
        {principles.map((p, i) => (
          <Reveal key={p.num} delay={i * 0.07}>
            <article className={styles.card}>
              <span className={styles.tag}>{p.tag[lang]}</span>
              <h3 className={styles.h3}>{p.h[lang]}</h3>
              <p className={styles.p}>{p.p[lang]}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
