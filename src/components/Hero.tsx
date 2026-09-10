import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { liveSystems } from "../data/live";
import { Glitch } from "./Glitch";
import { CountUp } from "./CountUp";
import { MagneticButton } from "./MagneticButton";
import { HeroObject } from "./HeroObject";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useI18n();
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

  const PROOF_CARDS: { n: string; txt: string; href: string; cta: string }[] = [
    { n: t.hc1_n, txt: t.hc1_t, href: t.hc1_href, cta: "hero-lab" },
    { n: t.hc2_n, txt: t.hc2_t, href: t.hc2_href, cta: "hero-proof" },
    { n: t.hc3_n, txt: t.hc3_t, href: t.hc3_href, cta: "hero-third" },
  ];

  return (
    <section className={`${styles.hero} section`} id="intro">
      <HeroObject />

      <div className="wrap">
        <div className={styles.inner}>
        <motion.p
          className="eyebrow"
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
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.72 }}
        >
          <MagneticButton className={styles.cta} onClick={() => scrollToId("works")}>{t.hero_cta1}</MagneticButton>
          <a className={styles.ghostBtn} href="https://shulgin.is-a.dev/store/prosto/" data-cta="hero-prosto">
            {t.hero_cta2} <span aria-hidden="true">↗</span>
          </a>
        </motion.div>

        <motion.div
          className={styles.proofRow}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.86 }}
        >
          {PROOF_CARDS.map((c) => (
            <a key={c.cta} className={`${styles.proofCard} hoverline`} href={c.href} data-cta={c.cta}>
              <span className={styles.pcNum}>{c.n}</span>
              <span className={styles.pcTxt}>{c.txt}</span>
              <span className={styles.pcGo} aria-hidden="true">↗</span>
            </a>
          ))}
        </motion.div>
      </div>
      </div>

      <div className={styles.proof}>
        <Stat v={<><CountUp to={24} />/7</>} k={t.proof.uptime} prov={t.prov.uptime} />
        <Stat v={<CountUp to={liveSystems.length} />} k={t.proof.prodsys} prov={t.prov.prodsys} />
        <Stat v={<CountUp to={13} prefix="×" />} k={t.proof.latency} prov={t.prov.latency} />
        <Stat v={<CountUp to={3.9} decimals={1} suffix="M" />} k={t.proof.trades} prov={t.prov.trades} />
      </div>
    </section>
  );
}

function Stat({ v, k, prov }: { v: ReactNode; k: string; prov: string }) {
  return (
    <div className={styles.cell}>
      <div className={styles.statk}>{k}</div>
      <div className={styles.statv}>{v}</div>
      <div className={styles.statprov}>{prov}</div>
    </div>
  );
}
