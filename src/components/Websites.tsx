import { useRef } from "react";
import { useI18n } from "../i18n/I18nContext";
import { websites } from "../data/websites";
import type { Website } from "../data/websites";
import type { Lang } from "../i18n/dict";
import { useHashOpen } from "../lib/useHashOpen";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Websites.module.css";

function WebsiteRow({ w, index, lang }: { w: Website; index: number; lang: Lang }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useHashOpen(ref, `site-${w.id}`);
  return (
    <details id={`site-${w.id}`} ref={ref} className={`${styles.item} hoverline`}>
      <summary className={styles.row}>
        <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
        <span className={styles.name}>{w.name[lang]}</span>
        <span
          className={`${styles.kind} ${
            w.kind.ru === "клиентский сайт" || w.kind.ru === "сопровождение" ? styles.client : styles.own
          }`}
        >
          {w.kind[lang]}
        </span>
        <span className={styles.year}>{w.year}</span>
        <span className={styles.sign} aria-hidden="true" />
      </summary>

      <div className={styles.body}>
        {w.shot && (
          <img
            className={styles.shot}
            src={w.shot}
            alt={`${w.name[lang]}: ${lang === "ru" ? "превью" : "preview"}`}
            loading="lazy"
            decoding="async"
          />
        )}
        <div className={styles.text}>
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
      </div>
    </details>
  );
}

/* Список сделанных сайтов. Раскрывающийся, а не сетка карточек: строк много,
   а решение о клике человек принимает по названию и типу работы.
   Нативный <details> — работает с клавиатуры и без JS. */
export function Websites() {
  const { t, lang } = useI18n();

  return (
    <section className="section wrap" id="websites">
      <SectionHead badge={t.web_badge} title={t.web_h2} right={t.web_right} />

      <div className={styles.quotes}>
        <span className={styles.quotesLabel}>{t.web_quotes_h}</span>
        <p className={styles.quotesNote}>{t.web_quotes_note}</p>
        <div className={styles.quotesGrid}>
          {websites
            .filter((w): w is Website & { quote: NonNullable<Website["quote"]> } => Boolean(w.quote))
            .map((w) => (
              <div className={styles.quoteCard} key={w.id}>
                <p className={styles.quoteText}>{w.quote[lang]}</p>
                <div className={styles.quoteBy}>{w.quoteBy?.[lang]}</div>
                {w.href && (
                  <a
                    className={styles.quoteLink}
                    href={w.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cta={`quote-${w.id}`}
                  >
                    {t.web_open} ↗
                  </a>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className={styles.list}>
        {websites.map((w, i) => (
          <Reveal key={w.id} delay={(i % 3) * 0.05}>
            <WebsiteRow w={w} index={i} lang={lang} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
