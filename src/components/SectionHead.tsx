import { useEffect, useRef, type ReactNode } from "react";
import { Reveal } from "./Reveal";
import { kineticElement } from "../lib/kinetic";
import { badgeFor } from "../lib/layout";
import styles from "./SectionHead.module.css";

/* `right` is accepted but not rendered: the mono meta strings on the right of the
   head were removed (hierarchy pass, 06.10) so only the title carries the section.
   `id` renumbers the badge for the active layout (see lib/layout.ts). */
export function SectionHead({ badge, title, id }: { badge: string; title: string; right?: ReactNode; id?: string }) {
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = h2Ref.current;
    if (!el) return;
    /* kinetic оборачивает буквы в span на месте; key={title} на h2 даёт свежий DOM
       при смене языка — React не спорит с ручными span'ами */
    return kineticElement(el);
  }, [title]);
  const shown = badgeFor(badge, id);
  const num = shown.match(/(\d{2})/)?.[1] ?? "";
  const words = title.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop()! : null;
  const lead = words.join(" ");
  return (
    <Reveal className={styles.head}>
      {num && (
        <span className={styles.watermark} aria-hidden="true">
          {num}
          <span className={styles.watermarkFill}>{num}</span>
        </span>
      )}
      <div className={styles.top}>
        <span className={styles.badge}><span className={styles.star}>★</span> {shown}</span>
      </div>
      <h2 className={styles.h2} ref={h2Ref} key={title}>
        {last ? <>{lead} <span className={styles.accent}>{last}</span></> : title}
        <span className={styles.stop}>.</span>
      </h2>
    </Reveal>
  );
}
