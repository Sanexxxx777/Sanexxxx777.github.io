import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./Marquee.module.css";

const ITEMS = [
  "ШУЛЬГИН", "SHULGIN.IS-A", "SYSTEMS THAT RUN WITHOUT ME", "LEAN @ DEEPMIND",
  "OPEN TO WORK", "GMT+10", "SHIP, DON'T TALK", "13 LIVE MECHANICS",
  "PRODUCTION 24/7", "SUB-50MS", "POLYMARKET + KALSHI",
];

export function Marquee() {
  const [egg, setEgg] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /* Track speed reacts to scroll velocity: a fast flick briefly speeds the
     belt up, then it eases back to normal. Uses the Web Animations API
     directly on the CSS `scroll` keyframe animation — no extra JS loop. */
  useEffect(() => {
    if (reduce) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let settleTimer = 0;
    let targetRate = 1;

    const decay = () => {
      const anim = trackRef.current?.getAnimations()[0];
      let settled = true;
      if (anim) {
        const next = anim.playbackRate + (targetRate - anim.playbackRate) * 0.08;
        settled = targetRate === 1 && Math.abs(next - 1) < 0.01;
        anim.playbackRate = settled ? 1 : next;
      }
      raf = settled ? 0 : requestAnimationFrame(decay);
    };

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const velocity = (window.scrollY - lastY) / dt; // px/ms
      lastY = window.scrollY;
      lastT = now;
      targetRate = 1 + Math.min(2, Math.abs(velocity) * 1.6);
      if (!raf) raf = requestAnimationFrame(decay);
      // scrolling stopped → let the rAF loop above ease playbackRate back to 1
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => { targetRate = 1; }, 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const block = (k: string) => (
    <div className={styles.block} key={k}>
      {ITEMS.map((it, i) => (
        <span className={styles.item} key={i} aria-hidden="true">
          {it}<span className={styles.star}>★</span>
        </span>
      ))}
      <button
        type="button"
        className={`${styles.item} ${styles.egg}`}
        onClick={() => setEgg(true)}
        aria-label="easter egg: 42"
      >
        42<span className={styles.star}>★</span>
      </button>
    </div>
  );

  return (
    <div className={styles.marquee} role="presentation">
      <div className={styles.rail}><span>// MARQUEE</span></div>
      <div className={styles.viewport}>
        <div className={styles.track} ref={trackRef}>{block("a")}{block("b")}{block("c")}</div>
      </div>
      <div className={styles.rail}><span>LOOP · 24/7</span></div>

      {egg && (
        <button type="button" className={styles.eggHint} onClick={() => setEgg(false)}>
          <span className={styles.eggNum}>42</span>
          <span className={styles.eggTxt}>
            the answer to life, the universe &amp; everything.
            <br />the real question: <span className={styles.eggCta}>hire me?</span>
          </span>
          <span className={styles.eggClose} aria-hidden="true">✕</span>
        </button>
      )}
    </div>
  );
}
