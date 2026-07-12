import { useI18n } from "../i18n/I18nContext";
import { formalStats, formalItems } from "../data/formalMath";
import { Reveal } from "./Reveal";
import { biVal } from "../lib/bi";
import styles from "./FlagshipSystem.module.css";
import m from "./FormalMath.module.css";

export function FormalMath() {
  const { lang, t } = useI18n();
  return (
    <Reveal>
      <article className={styles.panel} aria-label={t.fmath_title}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={m.mathLayer} aria-hidden="true">
          <span className={`${m.formula} ${m.sigma}`}>∑</span>
          <span className={`${m.formula} ${m.f1}`}>f₁(n) = n − 1</span>
          <span className={`${m.formula} ${m.f2}`}>σ*(N) = 2N</span>
        </div>

        <div className={styles.head}>
          <div className={styles.kicker}><span className={styles.dot} /> {t.fmath_kicker}</div>
          <h3 className={styles.title}>{t.fmath_title}</h3>
          <p className={styles.lede}>{t.fmath_lede}</p>
        </div>

        <div className={styles.stats}>
          {formalStats.map((s, i) => (
            <div className={styles.stat} key={i}>
              <div className={styles.statv}>{biVal(s.v, lang)}</div>
              <div className={styles.statk}>{biVal(s.k, lang)}</div>
            </div>
          ))}
        </div>

        <div className={styles.subsHead}>
          <span>{t.fmath_subs}</span>
          <span className={styles.subsCount}>{String(formalItems.length).padStart(2, "0")}</span>
        </div>
        <div className={styles.subs}>
          {formalItems.map((it, i) => {
            const inner = (
              <>
                <div className={styles.subCode}>{it.code}</div>
                <div className={styles.subBody}>
                  <h4 className={styles.subTitle}>{it.title[lang]}</h4>
                  <p className={styles.subDesc}>{it.desc[lang]}</p>
                  <div className={styles.tags}>
                    <span className={styles.tag}>
                      {it.status[lang]}
                      {it.status.en === "merged" && <span className={m.qed}>∎</span>}
                    </span>
                  </div>
                </div>
              </>
            );
            return (
              <Reveal key={it.code} delay={i * 0.06}>
                {it.link ? (
                  <a
                    className={styles.sub}
                    href={it.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={styles.sub}>{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </article>
    </Reveal>
  );
}
