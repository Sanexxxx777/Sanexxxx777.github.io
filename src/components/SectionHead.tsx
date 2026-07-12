import { useEffect, useRef, type ReactNode } from "react";
import { Reveal } from "./Reveal";
import { scrambleOnReveal } from "../lib/scramble";
import { kineticElement } from "../lib/kinetic";
import styles from "./SectionHead.module.css";

export function SectionHead({ badge, title, right, scramble = false }: { badge: string; title: string; right?: ReactNode; scramble?: boolean }) {
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = h2Ref.current;
    if (!el) return;
    /* kinetic оборачивает буквы в span ДО scramble (тот ходит по текст-нодам, порядок совместим);
       key={title} на h2 даёт свежий DOM при смене языка — React не спорит с ручными span'ами */
    const offKinetic = kineticElement(el);
    const offScramble = scramble ? scrambleOnReveal(el) : () => {};
    return () => {
      offKinetic();
      offScramble();
    };
  }, [title, scramble]);
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
      <h2 className={styles.h2} ref={h2Ref} key={title}>
        {last ? <>{lead} <span className={styles.accent}>{last}</span></> : title}
        <span className={styles.stop}>.</span>
      </h2>
    </Reveal>
  );
}
