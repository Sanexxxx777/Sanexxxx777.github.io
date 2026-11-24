import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { liveSystems } from "../data/live";
import { websites } from "../data/websites";
import { Glitch } from "./Glitch";
import { MagneticButton } from "./MagneticButton";
import { LINKS } from "./Contact";
import styles from "./Hero.module.css";

/* last Glitch line = 1.4 s animation + 0.24 s stagger (seed 2 x 0.12 s): .play stays until it ends */
const GLITCH_MS = 1650;

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
    playTimer.current = window.setTimeout(() => setPlay(false), GLITCH_MS);
    return () => window.clearTimeout(playTimer.current);
  }, [reduce]);
  const retrigger = () => {
    if (reduce) return;
    window.clearTimeout(playTimer.current);
    setPlay(false);
    requestAnimationFrame(() => {
      setPlay(true);
      playTimer.current = window.setTimeout(() => setPlay(false), GLITCH_MS);
    });
  };

  /* handover card (konsilium + Astra 24.11): a delivered client site and its owner's words
     on the first screen, in place of the old node network */
  const handover = websites.find((w) => w.id === "mechta-tut");
  const tgHref = `https://t.me/Aleksandr_NFA?text=${encodeURIComponent(t.hero_tg_text)}`;

  const line = {
    /* только сдвиг, без opacity: текст hero — кандидат LCP, а Chrome засчитывает
       элемент с opacity-анимацией лишь по её концу (замер 10.09: LCP 1.85 с) */
    hidden: { y: reduce ? 0 : "0.5em" },
    show: (i: number) => ({
      y: 0,
      transition: { duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  /* proof row: PRs in DeepMind's repo, systems in production (the «2 references» card went: the handover card shows them) */
  const PROOF_CARDS: { n: ReactNode; txt: string; href: string; cta: string; onClick?: () => void }[] = [
    { n: t.hc2_n, txt: t.hc2_t, href: t.hc2_href, cta: "hero-proof-1" },
    { n: liveSystems.length, txt: t.hero_sys_t, href: "#works", cta: "hero-proof-2", onClick: () => scrollToId("works") },
  ];

  return (
    <section className={`${styles.hero} section`} id="intro">
      <div className="wrap">
        <div className={styles.inner}>
        <p className={styles.name}>{t.hero_name}</p>
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
          {/* главная кнопка = разговор в Telegram с готовым началом сообщения; «Смотреть работы» вторая */}
          <a className={styles.cta} href={tgHref} target="_blank" rel="noopener noreferrer" data-cta="hero-tg">
            {/* текст и стрелка — один flex-элемент: иначе стрелка встаёт по центру кнопки,
                а не в конце надписи, когда та переносится на узком экране */}
            <span>{t.hero_cta2}{"\u00a0"}<span aria-hidden="true">↗</span></span>
          </a>
          {/* MagneticButton не пробрасывает атрибуты: data-cta ловится обёрткой (display:contents) */}
          <span className={styles.ctaWrap} data-cta="hero-works">
            <MagneticButton className={styles.ghostBtn} onClick={() => scrollToId("websites")}>{t.hero_cta1}</MagneticButton>
          </span>
        </motion.div>
        <p className={styles.hint}>{t.hero_cta_hint}</p>

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
          <li>
            <a href={`/cv/?lang=${lang}`} data-cta="hero-contact-cv">{t.nav.cv}</a>
          </li>
        </motion.ul>

        {handover?.shot && (
          <figure className={styles.case}>
            <figcaption className={styles.caseLabel}>{t.hcase_label}</figcaption>
            <a className={styles.caseShot} href={handover.href} target="_blank" rel="noopener noreferrer" data-cta="hero-case-site">
              <img src={handover.shot} alt={handover.name[lang]} width={1200} height={1500} loading="eager" decoding="async" />
            </a>
            <blockquote className={styles.caseQuote}>{t.hcase_quote}</blockquote>
            <p className={styles.caseBy}>{t.hcase_by}</p>
            <p className={styles.caseDid}>{t.hcase_did}</p>
            <p className={styles.caseLinks}>
              <a href={handover.href} target="_blank" rel="noopener noreferrer" data-cta="hero-case-link">{handover.href?.replace(/^https?:\/\/|\/$/g, "")}{"\u00a0"}↗</a>
              <a href="#websites" data-cta="hero-case-all" onClick={(e) => { e.preventDefault(); scrollToId("websites"); }}>{t.hcase_all}{"\u00a0"}↓</a>
            </p>
          </figure>
        )}

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
