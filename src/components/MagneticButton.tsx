import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

type Props = { children: ReactNode; className?: string; onClick?: () => void; strength?: number };

/* Premium magnetic micro-physics. Motion values only (no re-render). Off under reduced motion. */
export function MagneticButton({ children, className, onClick, strength = 0.4 }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 });

  const move = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ x: sx, y: sy }}
    >
      {children}
    </motion.button>
  );
}
