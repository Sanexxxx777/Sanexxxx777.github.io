import { useEffect, useRef, useState } from "react";
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

/* A technique iframe lives only while its card is within the viewport (+200px): out of view the poster
   stands in and the iframe is removed, which stops its loops completely. */
function TechFrame({ slug, title }: { slug: string; title: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [live, setLive] = useState(false);
  const pull = useRef({ half: false, loaded: false, done: false, timer: 0 });
  const isTorch = slug === "torchere";

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the only auto invitation: the torchere tile, >= 50% visible for 600 ms, pulls its cord once.
  // The frame is loaded with ?auto=0 (own autoplay off); the page sends {type:"pull"}.
  const arm = () => {
    const st = pull.current;
    window.clearTimeout(st.timer);
    if (!isTorch || st.done || !st.half || !st.loaded) return;
    st.timer = window.setTimeout(() => {
      if (st.done || !st.half || !st.loaded) return;
      st.done = true;
      frameRef.current?.contentWindow?.postMessage({ type: "pull" }, window.location.origin);
    }, 600);
  };
  useEffect(() => {
    const el = boxRef.current;
    if (!isTorch || !el) return;
    const st = pull.current;
    const io = new IntersectionObserver(
      ([e]) => {
        st.half = e.isIntersecting;
        arm();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(st.timer);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTorch]);
  useEffect(() => {
    if (!live) {
      pull.current.loaded = false;
      window.clearTimeout(pull.current.timer);
    }
  }, [live]);

  return (
    <div className={styles.frameBox} ref={boxRef}>
      <img className={styles.poster} src={`/lab/techniques/${slug}/poster.webp`} alt="" loading="lazy" decoding="async" />
      {live && (
        <iframe
          ref={frameRef}
          className={styles.frame}
          src={`/lab/techniques/${slug}/index.html${isTorch ? "?auto=0" : ""}`}
          title={title}
          onLoad={() => {
            pull.current.loaded = true;
            arm();
          }}
        />
      )}
    </div>
  );
}

export function LabTeaser() {
  const { t, lang } = useI18n();
  return (
    <section className="section wrap" id="lab">
      <SectionHead badge={t.lab_badge} title={t.lab_h2} right={t.lab_right} />
      <p className={styles.lede}>{t.lab_lede}</p>

      <div className={styles.grid}>
        {TECHNIQUES.map((tech, i) => (
          <Reveal key={tech.slug} delay={i * 0.06} className={`${styles.card} hoverline`}>
            <TechFrame slug={tech.slug} title={tech.name[lang]} />
            <div className={styles.foot}>
              <div className={styles.titleBox}>
                <span className={styles.name}>{tech.name[lang]}</span>
                <span className={styles.cue}>{t.lab_cue[tech.slug]}</span>
              </div>
              {/* страницы приёмов существуют только на русском — метка, как у карточек фильмов */}
              {lang === "en" && <span className={styles.lang}>ru</span>}
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
