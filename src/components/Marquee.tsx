import styles from "./Marquee.module.css";

const ITEMS = ["ШУЛЬГИН", "I.Shu", "CODE FOR ANY TASK", "OPEN TO WORK", "SHIP, DON'T TALK", "GMT+10", "PRODUCTION 24/7", "42"];

export function Marquee() {
  const block = (
    <div className={styles.block} aria-hidden="true">
      {ITEMS.map((it, i) => (
        <span className={styles.item} key={i}>
          {it}<span className={styles.star}>★</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={styles.marquee} role="presentation">
      <div className={styles.rail}><span>// MARQUEE</span></div>
      <div className={styles.track}>{block}{block}{block}</div>
      <div className={styles.rail}><span>LOOP · 24/7</span></div>
    </div>
  );
}
