import type { CSSProperties } from "react";
import styles from "./Glitch.module.css";

/* Coral/cyan RGB-split glitch. `seed` рассинхронизирует экземпляры: свой delay и
   некруглые периоды слоёв — слова глитчатся вразнобой, не хором. Reduced motion — off. */
export function Glitch({ children, seed = 0, accent = false }: { children: string; seed?: number; accent?: boolean }) {
  const style = {
    "--gd": `${(-seed * 1.37).toFixed(2)}s`,
    "--gpA": `${(3.4 + seed * 0.63).toFixed(2)}s`,
    "--gpB": `${(2.55 + seed * 0.47).toFixed(2)}s`,
  } as CSSProperties;
  return (
    <span className={accent ? `${styles.glitch} ${styles.accent}` : styles.glitch} data-text={children} style={style}>
      {children}
    </span>
  );
}
