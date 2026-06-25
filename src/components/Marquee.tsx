import { useState } from "react";
import styles from "./Marquee.module.css";

const ITEMS = [
  "ШУЛЬГИН", "I.Shu", "CODE FOR ANY TASK", "FULL-CYCLE ENGINEER",
  "OPEN TO WORK", "POLYMARKET MM", "SHIP, DON'T TALK", "LEAN @ DEEPMIND",
  "SUB-50MS", "GMT+10", "PRODUCTION 24/7",
];

export function Marquee() {
  const [egg, setEgg] = useState(false);

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
        <div className={styles.track}>{block("a")}{block("b")}{block("c")}</div>
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
