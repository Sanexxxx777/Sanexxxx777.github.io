import { useEffect, useRef } from "react";
import styles from "./Kinetic.module.css";

/* Kinetic type: вес букв «плывёт» волной за курсором (ось wght вариативного шрифта).
   Big Shoulders Variable: 100–900; Oswald Variable (кириллица): 200–700 — диапазон
   подбирается по скрипту символа. Reduced-motion — статичный вес. */

const isCyr = (ch: string) => /[Ѐ-ӿ]/.test(ch);

export function Kinetic({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(root.querySelectorAll<HTMLElement>("[data-k]"));
    if (!letters.length) return;

    let raf = 0;
    let px = -1e4, py = -1e4;

    const frame = () => {
      raf = 0;
      // сначала все чтения, потом все записи — без layout thrash
      const rects = letters.map(el => el.getBoundingClientRect());
      letters.forEach((el, i) => {
        const r = rects[i];
        const dx = px - (r.left + r.width / 2);
        const dy = py - (r.top + r.height / 2);
        const f = Math.exp(-(dx * dx + dy * dy) / (2 * 110 * 110)); // гауссов спад ~110px
        const cyr = isCyr(el.textContent || "");
        const base = cyr ? 600 : 780;
        const peak = cyr ? 700 : 900;
        el.style.fontVariationSettings = `"wght" ${Math.round(base + (peak - base) * f)}`;
        el.style.transform = f > 0.02 ? `translateY(${(-3.5 * f).toFixed(2)}px)` : "";
      });
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [children]);

  return (
    <span ref={ref} className={styles.kinetic} aria-label={children} role="text">
      {children.split("").map((ch, i) =>
        ch === " " ? (
          " "
        ) : (
          <span key={i} data-k aria-hidden="true" className={styles.k}>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
