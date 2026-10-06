import { useI18n } from "../i18n/I18nContext";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Experiments.module.css";

/* Short layout only: the four live things that used to be separate sections
   (Lab, Flood, Films, Stonewake) as one row of tiles, each a door to its own page.
   Flood is a wow site with an effect, never a toy (see CLAUDE.md). */
export function Experiments() {
  const { t, lang } = useI18n();
  const tiles = [
    {
      cta: "exp-lab", href: "/lab/", src: "/lab/techniques/torchere/poster.webp", w: 840, h: 500,
      alt: t.exp_alt_lab, title: t.nav.lab, line: t.lab_right,
    },
    {
      cta: "exp-flood", href: `/flood/?lang=${lang}`, src: "/flood/flood.jpg", w: 1200, h: 630,
      alt: t.flood_alt, title: t.flood_h2, line: t.flood_right,
    },
    {
      cta: "exp-films", href: "/video/", src: "/films/cf-factory.jpg", w: 1280, h: 720,
      alt: t.exp_alt_films, title: t.film_h2, line: t.film_right,
    },
    {
      cta: "exp-game", href: `/game/?lang=${lang}`, src: "/game/stonewake.jpg", w: 1200, h: 630,
      alt: t.game_alt, title: t.game_title, line: t.game_txt, beta: t.game_beta,
    },
  ];
  return (
    <section className="section wrap" id="experiments">
      <SectionHead badge={t.exp_badge} title={t.exp_h2} id="experiments" />
      <div className={styles.grid}>
        {tiles.map((x, i) => (
          <Reveal key={x.cta} delay={i * 0.05} className={styles.cell}>
            <a className={`${styles.tile} hoverline`} href={x.href} data-cta={x.cta}>
              <img className={styles.img} src={x.src} width={x.w} height={x.h} loading="lazy" decoding="async" alt={x.alt} />
              <span className={styles.body}>
                <span className={styles.titleRow}>
                  <span className={styles.title}>{x.title}</span>
                  {x.beta && <span className={styles.pill}>{x.beta}</span>}
                  <span className={styles.go} aria-hidden="true">↗</span>
                </span>
                <span className={styles.line}>{x.line}</span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
