import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./BurstButton.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

const COLORS = ["var(--coral)", "var(--coral-2)", "var(--ink)"];

/* Brutalist click-burst: coral shards + shockwave ring fired at the cursor, then runs onClick.
   Particles are imperative DOM (WAAPI, self-removing) inside an empty React-owned layer — no re-render. */
export function BurstButton({ children, className, onClick, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const layer = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const fire = (e: React.MouseEvent) => {
    if (!reduce && layer.current && ref.current) {
      const r = ref.current.getBoundingClientRect();
      const ox = e.clientX - r.left;
      const oy = e.clientY - r.top;
      const N = 18;

      for (let i = 0; i < N; i++) {
        const p = document.createElement("i");
        p.className = styles.shard;
        const ang = (Math.PI * 2 * i) / N + (Math.random() - 0.5) * 0.6;
        const dist = 34 + Math.random() * 70;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist;
        const sz = 3 + Math.random() * 5;
        p.style.left = `${ox}px`;
        p.style.top = `${oy}px`;
        p.style.width = `${sz}px`;
        p.style.height = `${sz}px`;
        p.style.background = COLORS[i % COLORS.length];
        layer.current.appendChild(p);
        const anim = p.animate(
          [
            { transform: "translate(-50%, -50%) rotate(0deg) scale(1)", opacity: 1 },
            {
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 26}px)) rotate(${(Math.random() - 0.5) * 540}deg) scale(0.15)`,
              opacity: 0,
            },
          ],
          { duration: 560 + Math.random() * 280, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
        );
        anim.onfinish = () => p.remove();
      }

      const ring = document.createElement("i");
      ring.className = styles.ring;
      ring.style.left = `${ox}px`;
      ring.style.top = `${oy}px`;
      layer.current.appendChild(ring);
      const ra = ring.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.2)", opacity: 0.7 },
          { transform: "translate(-50%, -50%) scale(2.6)", opacity: 0 },
        ],
        { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
      );
      ra.onfinish = () => ring.remove();
    }
    onClick?.();
  };

  return (
    <button ref={ref} className={className} onClick={fire} {...rest}>
      {children}
      <span ref={layer} className={styles.layer} aria-hidden="true" />
    </button>
  );
}
