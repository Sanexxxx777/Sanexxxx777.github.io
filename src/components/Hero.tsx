import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { liveSystems } from "../data/live";
import { Glitch } from "./Glitch";
import { MagneticButton } from "./MagneticButton";
import { HeroObject } from "./HeroObject";
import { LINKS } from "./Contact";
import styles from "./Hero.module.css";

export function Hero() {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();

  /* Glitch is hero-only and event-driven: one run on mount, then re-armed on
     every h1 hover (toggling the "play" class off then on always restarts a
     CSS animation — see Glitch.module.css). */
  const [play, setPlay] = useState(true);
  const playTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (reduce) return;
    playTimer.current = window.setTimeout(() => setPlay(false), 1450);
    return () => window.clearTimeout(playTimer.current);
  }, [reduce]);
  const retrigger = () => {
    if (reduce) return;
    window.clearTimeout(playTimer.current);
    setPlay(false);
    requestAnimationFrame(() => {
      setPlay(true);
      playTimer.current = window.setTimeout(() => setPlay(false), 1450);
    });
  };

  const line = {
    /* только сдвиг, без opacity: текст hero — кандидат LCP, а Chrome засчитывает
       элемент с opacity-анимацией лишь по её концу (замер 10.09: LCP 1.85 с) */
    hidden: { y: reduce ? 0 : "0.5em" },
    show: (i: number) => ({
      y: 0,
      transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  /* proof row: PRs in DeepMind's repo, systems in production, the market-specific third card */
  const PROOF_CARDS: { n: ReactNode; txt: string; href: string; cta: string; onClick?: () => void }[] = [
    { n: t.hc2_n, txt: t.hc2_t, href: t.hc2_href, cta: "hero-proof-1" },
    { n: liveSystems.length, txt: t.hero_sys_t, href: "#works", cta: "hero-proof-2", onClick: () => scrollToId("works") },
    { n: t.hc3_n, txt: t.hc3_t, href: t.hc3_href, cta: "hero-proof-3" },
  ];

  return (
    <section className={`${styles.hero} section`} id="intro">
      <HeroObject />

      <div className="wrap">
        <div className={styles.inner}>
        <motion.p
          className={`eyebrow ${styles.eyebrow}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.led} aria-hidden="true" />{t.hero_eyebrow}
        </motion.p>

        <h1 className={`${styles.h1} ${play ? "play" : ""}`} onMouseEnter={retrigger}>
          <motion.span custom={0} variants={line} initial="hidden" animate="show" className={styles.l}>
            <Glitch seed={0} accent>{t.hero_l1}</Glitch>
          </motion.span>
          <motion.span custom={1} variants={line} initial="hidden" animate="show" className={styles.l}>
            <Glitch seed={1}>{t.hero_l2}</Glitch>
          </motion.span>
          <motion.span custom={2} variants={line} initial="hidden" animate="show" className={styles.l}>
            <Glitch seed={2} accent>{t.hero_l3}</Glitch><span className={styles.stop}>.</span>
            <span className={styles.cursor} aria-hidden="true" />
          </motion.span>
        </h1>

        <motion.p
          className={styles.lede}
          initial={reduce ? false : { y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          {t.hero_lede}
        </motion.p>

        <motion.div
          className={styles.actions}
          initial={reduce ? false : { opacity: 0.35, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
        >
          {/* MagneticButton не пробрасывает атрибуты: data-cta ловится обёрткой (display:contents) */}
          <span className={styles.ctaWrap} data-cta="hero-works">
            <MagneticButton className={styles.cta} onClick={() => scrollToId("works")}>{t.hero_cta1}</MagneticButton>
          </span>
          <a className={styles.ghostBtn} href={`/hire/?lang=${lang}`} data-cta="hero-hire">
            {/* текст и стрелка — один flex-элемент: иначе стрелка встаёт по центру кнопки,
                а не в конце надписи, когда та переносится на узком экране */}
            <span>{t.hero_cta2}{"\u00a0"}<span aria-hidden="true">↗</span></span>
          </a>
        </motion.div>

        <motion.ul
          className={styles.contacts}
          aria-label={t.hero_contact_aria}
          initial={reduce ? false : { opacity: 0.35, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.29 }}
        >
          {LINKS.map((l) => (
            <li key={l.lbl}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" title={l.val} data-cta={`hero-contact-${l.lbl.toLowerCase()}`}>
                {l.lbl}
              </a>
            </li>
          ))}
        </motion.ul>

        <motion.div
          className={styles.proofRow}
          initial={reduce ? false : { opacity: 0.35, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.34 }}
        >
          {PROOF_CARDS.map((c) => (
            <a
              key={c.cta}
              className={`${styles.proofCard} hoverline`}
              href={c.href}
              data-cta={c.cta}
              onClick={c.onClick ? (e) => { e.preventDefault(); c.onClick!(); } : undefined}
            >
              <span className={styles.pcNum}>{c.n}</span>
              <span className={styles.pcTxt}>{c.txt}</span>
              <span className={styles.pcGo} aria-hidden="true">↗</span>
            </a>
          ))}
        </motion.div>
      </div>
      </div>
    </section>
  );
}
