import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { setLenis } from "./scroll";

/* Smooth scroll. Disabled under reduced motion. Motion's useScroll reads the
   native scroll position Lenis drives, so no GSAP ScrollTrigger needed. */
export function useLenis() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    setLenis(lenis);
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, [reduce]);
}
