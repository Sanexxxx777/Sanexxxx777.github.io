import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import styles from "./SectionHead.module.css";

export function SectionHead({ badge, title, right }: { badge: string; title: string; right?: ReactNode }) {
  const num = badge.match(/(\d{2})/)?.[1] ?? "";
  const words = title.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop()! : null;
  const lead = words.join(" ");
  return (
    <Reveal className={styles.head}>
      {num && <span className={styles.watermark} aria-hidden="true">{num}</span>}
      <div className={styles.top}>
        <span className={styles.badge}><span className={styles.star}>★</span> {badge}</span>
        {right && <span className={styles.right}>{right}</span>}
      </div>
      <h2 className={styles.h2}>
        {last ? <>{lead} <span className={styles.accent}>{last}</span></> : title}
        <span className={styles.stop}>.</span>
      </h2>
    </Reveal>
  );
}
