import type { CSSProperties } from "react";
import styles from "./Glitch.module.css";

/* Coral/ink RGB-split glitch — hero only, event-driven (not ambient). Runs once
   while an ancestor carries the "play" class (Hero.tsx toggles it on mount and
   on h1 hover). `seed` gives each of the three lines a small positive stagger
   so they don't glitch in unison. */
export function Glitch({ children, seed = 0, accent = false }: { children: string; seed?: number; accent?: boolean }) {
  const style = { "--gd": `${(seed * 0.12).toFixed(2)}s` } as CSSProperties;
  return (
    <span className={accent ? `${styles.glitch} ${styles.accent}` : styles.glitch} data-text={children} style={style}>
      {children}
    </span>
  );
}
