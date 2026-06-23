import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type Props = { to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number };

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export function CountUp({ to, decimals = 0, prefix = "", suffix = "", duration = 1.4 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      setN(easeOut(p) * to);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce, duration]);

  const value = reduce ? to : n;
  return <span ref={ref}>{prefix}{value.toFixed(decimals)}{suffix}</span>;
}
