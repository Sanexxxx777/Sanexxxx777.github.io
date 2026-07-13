import { useI18n } from "../i18n/I18nContext";
import { flagshipStats, subsystems } from "../data/flagship";
import { Reveal } from "./Reveal";
import { biVal } from "../lib/bi";
import styles from "./FlagshipSystem.module.css";

export function FlagshipSystem() {
  const { lang, t } = useI18n();
  return (
    <Reveal>
      <article className={styles.panel} aria-label={t.flag_title}>
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.head}>
          <div className={styles.kicker}><span className={styles.dot} /> {t.flag_kicker}</div>
          <h3 className={styles.title}>{t.flag_title}</h3>
          <p className={styles.lede}>{t.flag_lede}</p>
        </div>

        <div className={styles.stats}>
          {flagshipStats.map((s, i) => (
            <div className={styles.stat} key={i}>
              <div className={styles.statv}>{biVal(s.v, lang)}</div>
              <div className={styles.statk}>{biVal(s.k, lang)}</div>
            </div>
          ))}
        </div>

        <div className={styles.subsHead}>
          <span>{t.flag_subs}</span>
          <span className={styles.subsCount}>{String(subsystems.length).padStart(2, "0")}</span>
        </div>
        <div className={styles.subs}>
          {subsystems.map((s, i) => (
            <Reveal key={s.code} delay={i * 0.06}>
              <div className={styles.sub} data-ghost-gaze>
                <div className={styles.subCode}>{s.code}</div>
                <div className={styles.subBody}>
                  <h4 className={styles.subTitle}>{s.title[lang]}</h4>
                  <p className={styles.subDesc}>{s.desc[lang]}</p>
                  <div className={styles.tags}>
                    {s.tags.map((tg) => <span key={tg} className={styles.tag}>{tg}</span>)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </article>
    </Reveal>
  );
}
