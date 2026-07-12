import type { CSSProperties } from "react";
import styles from "./Glitch.module.css";

/* Coral/cyan RGB-split glitch. `seed` рассинхронизирует экземпляры: свой delay и
   некруглые периоды слоёв — слова глитчатся вразнобой, не хором. Reduced motion — off. */
export function Glitch({ children, seed = 0, accent = false }: { children: string; seed?: number; accent?: boolean }) {
  const style = {
    "--gd": `${(-seed * 3.47).toFixed(2)}s`,
    "--gpA": `${(9.7 + seed * 1.53).toFixed(2)}s`,
    "--gpB": `${(7.9 + seed * 1.21).toFixed(2)}s`,
  } as CSSProperties;
  return (
    <span className={accent ? `${styles.glitch} ${styles.accent}` : styles.glitch} data-text={children} style={style}>
      {children}
    </span>
  );
}
