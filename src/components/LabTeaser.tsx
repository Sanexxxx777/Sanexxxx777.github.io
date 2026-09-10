import { useI18n } from "../i18n/I18nContext";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./LabTeaser.module.css";

const TECHNIQUES = [
  { slug: "torchere", name: { ru: "Торшер со шнурком", en: "Torchere with a pull cord" } },
  { slug: "dot-matrix", name: { ru: "Точечные глифы", en: "Dot-matrix glyphs" } },
  { slug: "cursor-spotlight", name: { ru: "Курсор-прожектор", en: "Cursor spotlight" } },
] as const;

const SRC_BASE = "https://github.com/Sanexxxx777/Sanexxxx777.github.io/blob/main/public/lab/techniques";

export function LabTeaser() {
  const { t, lang } = useI18n();
  return (
    <section className="section wrap" id="lab">
      <SectionHead badge={t.lab_badge} title={t.lab_h2} right={t.lab_right} />
      <p className={styles.lede}>{t.lab_lede}</p>

      <div className={styles.grid}>
        {TECHNIQUES.map((tech, i) => (
          <Reveal key={tech.slug} delay={i * 0.06} className={`${styles.card} hoverline`}>
            <iframe
              className={styles.frame}
              src={`/lab/techniques/${tech.slug}/index.html`}
              loading="lazy"
              title={tech.name[lang]}
            />
            <div className={styles.foot}>
              <span className={styles.name}>{tech.name[lang]}</span>
              <div className={styles.links}>
                <a className={styles.link} href={`/lab/techniques/${tech.slug}/`} data-cta={`lab-open-${tech.slug}`}>{t.lab_open}</a>
                <a className={styles.link} href={`${SRC_BASE}/${tech.slug}/index.html`} target="_blank" rel="noopener noreferrer" data-cta={`lab-src-${tech.slug}`}>{t.lab_src}</a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <a className={styles.all} href="/lab/" data-cta="lab-all">
        {t.lab_all} <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
