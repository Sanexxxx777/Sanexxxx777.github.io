import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Flood.module.css";

/* The wow site «Flood any website» (a site with a flooding effect, not a toy): a Cloudflare Worker renders any URL into a level,
   the client floods it with Matter.js water. Lives on its own Worker; /flood/ here is the
   redirect page that carries the analytics beacon and the og image. */
export function Flood() {
  const { t, lang } = useI18n();
  const href = `/flood/?lang=${lang}`;
  const vidRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // the silent loop plays only while >= 50% of the picture is on screen (preload="none": nothing is fetched before that);
  // reduced motion keeps the poster only
  useEffect(() => {
    const v = vidRef.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <section className="section wrap" id="flood">
      <SectionHead badge={t.flood_badge} title={t.flood_h2} right={t.flood_right} />
      <div className={styles.grid}>
        <Reveal className={styles.media}>
          <a className={`${styles.shot} hoverline`} href={href} data-cta="flood-shot">
            <img
              className={styles.img}
              src="/flood/flood.jpg"
              width={1200}
              height={630}
              loading="lazy"
              alt={t.flood_alt}
            />
            <video
              ref={vidRef}
              className={`${styles.vid} ${playing ? styles.vidOn : ""}`}
              width={1200}
              height={630}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              tabIndex={-1}
              onPlaying={() => setPlaying(true)}
            >
              <source src="/flood/flood.webm" type="video/webm" />
              <source src="/flood/flood.mp4" type="video/mp4" />
            </video>
          </a>
          <p className={styles.stack}>CLOUDFLARE WORKER · BROWSER RUN · MATTER.JS · CANVAS 2D</p>
        </Reveal>
        <Reveal className={styles.text} delay={0.08}>
          <p className={styles.lede}>{t.flood_lede}</p>
          <ul className={styles.facts}>
            <li>{t.flood_f1}</li>
            <li>{t.flood_f2}</li>
            <li>{t.flood_f3}</li>
          </ul>
          <a className={styles.cta} href={href} data-cta="flood-open">
            {t.flood_open} <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
