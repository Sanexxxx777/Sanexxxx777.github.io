import { useMemo } from "react";
import { useI18n } from "../i18n/I18nContext";
import { formalStats, formalItems } from "../data/formalMath";
import { Reveal } from "./Reveal";
import { biVal } from "../lib/bi";
import { useCollapse, type CollapseGroup } from "../lib/useCollapse";
import styles from "./FlagshipSystem.module.css";
import m from "./FormalMath.module.css";

/* selection before inventory: 3 contributions, the rest hidden in the DOM behind `.show-more` (a #math-<code> link reveals it) */
const LIMIT = 3;
const PREFIX = "math-";

export function FormalMath() {
  const { lang, t } = useI18n();
  const groups = useMemo<CollapseGroup[]>(() => [{ key: "items", ids: formalItems.map((x) => x.code) }], []);
  const { isOpen, toggle } = useCollapse(groups, LIMIT, PREFIX);
  const all = isOpen("items");
  return (
    <Reveal>
      <article className={styles.panel} id="flagship-math" aria-label={t.fmath_title}>
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
        <p className={styles.prov}>{t.fmath_prov}</p>

        <div className={styles.subsHead}>
          <span>{t.fmath_subs}</span>
          <span className={styles.subsCount}>{String(formalItems.length).padStart(2, "0")}</span>
        </div>
        <div className={`${styles.subs} ${all ? "" : styles.subsClosed}`}>
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
            const card = it.link ? (
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
            );
            return (
              <div key={it.code} id={`${PREFIX}${it.code}`} className={styles.cell} hidden={i >= LIMIT && !all}>
              <Reveal delay={(i % 3) * 0.06}>
                {it.extra ? (
                  <div className={styles.subWrap}>
                    {card}
                    <a className={styles.subExtra} href={it.extra.href} target="_blank" rel="noopener noreferrer">
                      {t[it.extra.label]} <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                ) : card}
              </Reveal>
              </div>
            );
          })}
        </div>
        {formalItems.length > LIMIT && (
          <button
            type="button"
            className="show-more"
            aria-expanded={all}
            onClick={() => toggle("items")}
            data-cta="math-more"
          >
            {all ? t.list_less : `${t.list_more} (+${formalItems.length - LIMIT})`}
          </button>
        )}
      </article>
    </Reveal>
  );
}
