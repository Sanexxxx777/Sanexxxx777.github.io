import { useI18n } from "../i18n/I18nContext";
import { releases } from "../data/releases";
import type { Release } from "../data/types";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Releases.module.css";

const KIND: Record<Release["kind"], { label: string; cls: string }> = {
  prod: { label: "Production", cls: "prod" },
  infra: { label: "Infra", cls: "infra" },
  perf: { label: "Performance", cls: "perf" },
  research: { label: "Research", cls: "research" },
};

export function Releases() {
  const { lang, t } = useI18n();
  return (
    <section className="section wrap" id="releases">
      <SectionHead badge={t.r5_badge} title={t.r5_h2} right={t.r5_right} />
      <div className={styles.timeline}>
        {releases.map((r, i) => {
          const k = KIND[r.kind];
          return (
            <Reveal key={i} delay={(i % 4) * 0.05} className={`${styles.item} ${i === 0 ? styles.featured : ""}`}>
              <div className={styles.rail}>
                <span className={styles.ver}>{r.ver}</span>
                <span className={styles.when}>{r.when[lang]}</span>
                <span className={styles.node} aria-hidden="true" />
              </div>
              <div className={styles.body}>
                <div className={styles.row}>
                  <h4 className={styles.title}>{r.title[lang]}</h4>
                  <span className={`${styles.kind} ${styles[k.cls]}`}>{k.label}</span>
                </div>
                <p className={styles.text}>{r.body[lang]}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
