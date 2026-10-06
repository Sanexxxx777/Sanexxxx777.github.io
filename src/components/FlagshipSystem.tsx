import { useMemo } from "react";
import { useI18n } from "../i18n/I18nContext";
import { flagshipStats, subsystems } from "../data/flagship";
import { Reveal } from "./Reveal";
import { biVal } from "../lib/bi";
import { useCollapse, type CollapseGroup } from "../lib/useCollapse";
import styles from "./FlagshipSystem.module.css";

/* selection before inventory: 3 cards, the rest hidden in the DOM behind `.show-more` (a #sub-<code> link reveals it) */
const LIMIT = 3;
const PREFIX = "sub-";

export function FlagshipSystem() {
  const { lang, t } = useI18n();
  const groups = useMemo<CollapseGroup[]>(() => [{ key: "subs", ids: subsystems.map((s) => s.code) }], []);
  const { isOpen, toggle } = useCollapse(groups, LIMIT, PREFIX);
  const all = isOpen("subs");
  return (
    <Reveal>
      <article className={styles.panel} id="flagship-trading" aria-label={t.flag_title}>

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
        <p className={styles.prov}>{t.flag_prov}</p>

        <div className={styles.subsHead}>
          <span>{t.flag_subs}</span>
          <span className={styles.subsCount}>{String(subsystems.length).padStart(2, "0")}</span>
        </div>
        <div className={`${styles.subs} ${all ? "" : styles.subsClosed}`}>
          {subsystems.map((s, i) => (
            <div key={s.code} id={`${PREFIX}${s.code}`} className={styles.cell} hidden={i >= LIMIT && !all}>
             <Reveal delay={(i % 3) * 0.06}>
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
            </div>
          ))}
        </div>
        {subsystems.length > LIMIT && (
          <button
            type="button"
            className="show-more"
            aria-expanded={all}
            onClick={() => toggle("subs")}
            data-cta="flag-more"
          >
            {all ? t.list_less : `${t.list_more} (+${subsystems.length - LIMIT})`}
          </button>
        )}
      </article>
    </Reveal>
  );
}
