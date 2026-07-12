import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { Kinetic } from "./Kinetic";
import { CountUp } from "./CountUp";
import { MagneticButton } from "./MagneticButton";
import { HeroObject } from "./HeroObject";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "34%"]);
  const ghostRot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 7]);

  const line = {
    hidden: { opacity: 0, y: reduce ? 0 : "0.5em" },
    show: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <section className={`${styles.hero} section`} id="intro" ref={heroRef}>
      <motion.div className={styles.ghost} style={{ y: ghostY, rotate: ghostRot }} aria-hidden="true">25</motion.div>
      <HeroObject />

      <div className={`${styles.inner} wrap`}>
        <motion.p
          className="eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.led} aria-hidden="true" />{t.hero_eyebrow}
        </motion.p>

        <h1 className={styles.h1}>
          <motion.span custom={0} variants={line} initial="hidden" animate="show" className={styles.l}>
            <Kinetic>{t.hero_l1}</Kinetic>
          </motion.span>
          <motion.span custom={1} variants={line} initial="hidden" animate="show" className={styles.l}>
            <Kinetic>{t.hero_l2}</Kinetic>
          </motion.span>
          <motion.span custom={2} variants={line} initial="hidden" animate="show" className={styles.l}>
            <Kinetic>{t.hero_l3}</Kinetic><span className={styles.stop}>.</span>
            <span className={styles.cursor} aria-hidden="true" />
          </motion.span>
        </h1>

        <motion.p
          className={styles.lede}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          {t.hero_lede}
        </motion.p>

        <motion.div
          className={styles.actions}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.72 }}
        >
          <MagneticButton className={styles.cta} onClick={() => scrollToId("projects")}>{t.hero_cta1}</MagneticButton>
          <button className={styles.ghostBtn} onClick={() => scrollToId("principles")}>
            {t.hero_cta2} <span aria-hidden="true">↓</span>
          </button>
        </motion.div>

        <div className={styles.badge} aria-hidden="true">
          <svg viewBox="0 0 200 200" className={styles.star}>
            <path d="M 100,4 L 120.2,24.7 L 148,16.9 L 155.1,44.9 L 183.1,52 L 175.3,79.8 L 196,100 L 175.3,120.2 L 183.1,148 L 155.1,155.1 L 148,183.1 L 120.2,175.3 L 100,196 L 79.8,175.3 L 52,183.1 L 44.9,155.1 L 16.9,148 L 24.7,120.2 L 4,100 L 24.7,79.8 L 16.9,52 L 44.9,44.9 L 52,16.9 L 79.8,24.7 Z" fill="var(--coral)" />
          </svg>
          <div className={styles.badgeLbl}><span>MODEL</span><b><span className={styles.us}>_</span>CODING</b></div>
        </div>
      </div>

      <div className={styles.proof}>
        <Stat v={<><CountUp to={24} />/7</>} k={t.proof.uptime} />
        <Stat v={<CountUp to={10} suffix="+" />} k={t.proof.prodsys} />
        <Stat v={<CountUp to={13} prefix="×" />} k={t.proof.latency} />
        <Stat v={<CountUp to={3.9} decimals={1} suffix="M" />} k={t.proof.trades} />
      </div>
    </section>
  );
}

function Stat({ v, k }: { v: React.ReactNode; k: string }) {
  return (
    <div className={styles.cell}>
      <div className={styles.statk}>{k}</div>
      <div className={styles.statv}>{v}</div>
    </div>
  );
}
