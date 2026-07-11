import { useEffect, useRef } from "react";
import { createGhostEmotions } from "../lib/ghostEngine";
import styles from "./Ghost.module.css";

export function Ghost() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cs = getComputedStyle(document.documentElement);
    const tok = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
    const ghost = createGhostEmotions(canvas, {
      colors: () => ({
        a: tok("--coral", "#ee4e4e"),
        b: tok("--coral-2", "#ff6a5a"),
        ink: tok("--ink", "#f3f1ec"),
        eye: "rgba(22, 9, 11, 0.88)",
        heart: "#ff96a0",
        anger: "#ff3b30",
      }),
    });
    return () => ghost.destroy();
  }, []);

  return (
    <div className={styles.slot} aria-hidden="true">
      <canvas ref={ref} width={480} height={320} className={styles.canvas} />
    </div>
  );
}
