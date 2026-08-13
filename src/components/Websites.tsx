import { useI18n } from "../i18n/I18nContext";
import { websites } from "../data/websites";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Websites.module.css";

/* Список сделанных сайтов. Раскрывающийся, а не сетка карточек: строк много,
   а решение о клике человек принимает по названию и типу работы.
   Нативный <details> — работает с клавиатуры и без JS. */
export function Websites() {
  const { t, lang } = useI18n();

  return (
    <section className="section wrap" id="websites">
      <SectionHead badge={t.web_badge} title={t.web_h2} right={t.web_right} />

      <div className={styles.list}>
        {websites.map((w, i) => (
          <Reveal key={w.id} delay={(i % 3) * 0.05}>
            <details className={styles.item}>
              <summary className={styles.row}>
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.name}>{w.name[lang]}</span>
                <span
                  className={`${styles.kind} ${
                    w.kind.ru === "клиентский сайт" ? styles.client : styles.own
                  }`}
                >
                  {w.kind[lang]}
                </span>
                <span className={styles.year}>{w.year}</span>
                <span className={styles.sign} aria-hidden="true" />
              </summary>

              <div className={styles.body}>
                <p className={styles.desc}>{w.desc[lang]}</p>
                <div className={styles.foot}>
                  {w.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  {w.href ? (
                    <a
                      className={styles.link}
                      href={w.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {w.href.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
                    </a>
                  ) : (
                    <span className={styles.pending}>{w.pending?.[lang]}</span>
                  )}
                </div>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
