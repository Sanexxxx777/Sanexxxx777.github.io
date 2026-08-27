import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { films } from "../data/films";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Films.module.css";

/* Ролики. Постер показывается сразу, видео подставляется по клику
   (preload="none"): семь автозагрузок утопили бы мобильный трафик,
   а звук без спроса запускать нельзя. */
export function Films() {
  const { t, lang } = useI18n();
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section className="section wrap" id="films">
      <SectionHead badge={t.film_badge} title={t.film_h2} right={t.film_right} />

      <div className={styles.grid}>
        {films.map((f, i) => {
          /* У части роликов рядом лежит англоязычная сборка того же кадра —
             показываем ту, что совпадает с языком страницы. */
          const base = f.hasEn && lang === "en" ? `${f.id}-en` : f.id;
          return (
          <Reveal key={f.id} delay={(i % 3) * 0.05}>
            <article className={styles.card}>
              <div className={styles.stage}>
                {playing === f.id ? (
                  <video
                    src={`/films/${base}.mp4`}
                    poster={`/films/${base}.jpg`}
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <>
                    <img src={`/films/${base}.jpg`} alt="" loading="lazy" />
                    <button
                      className={styles.play}
                      onClick={() => setPlaying(f.id)}
                      aria-label={`${lang === "ru" ? "Смотреть" : "Play"}: ${f.title[lang]}`}
                    >
                      <span className={styles.tri} aria-hidden="true">
                        <svg viewBox="0 0 12 14" fill="currentColor">
                          <path d="M0 0l12 7-12 7z" />
                        </svg>
                      </span>
                    </button>
                    <span className={styles.dur}>{f.seconds}s</span>
                  </>
                )}
              </div>

              <div className={styles.body}>
                <div className={styles.top}>
                  <h3 className={styles.title}>{f.title[lang]}</h3>
                  <span className={styles.kind}>{f.kind[lang]}</span>
                  <span className={styles.lang}>{f.hasEn && lang === "en" ? "en" : f.lang}</span>
                </div>
                <p className={styles.desc}>{f.desc[lang]}</p>
                <p className={styles.style}>{f.style[lang]}</p>
              </div>
            </article>
          </Reveal>
          );
        })}
      </div>
    </section>
  );
}
