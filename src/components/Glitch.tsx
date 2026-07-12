import type { CSSProperties } from "react";
import styles from "./Glitch.module.css";

/* Coral/cyan RGB-split glitch. `seed` рассинхронизирует экземпляры: свой delay и
   некруглые периоды слоёв — слова глитчатся вразнобой, не хором. Reduced motion — off. */
export function Glitch({ children, seed = 0, accent = false }: { children: string; seed?: number; accent?: boolean }) {
  const style = {
    "--gd": `${(-seed * 2.31).toFixed(2)}s`,
    "--gpA": `${(6.2 + seed * 1.13).toFixed(2)}s`,
    "--gpB": `${(4.9 + seed * 0.87).toFixed(2)}s`,
  } as CSSProperties;
  return (
    <span className={accent ? `${styles.glitch} ${styles.accent}` : styles.glitch} data-text={children} style={style}>
      {children}
    </span>
  );
}
