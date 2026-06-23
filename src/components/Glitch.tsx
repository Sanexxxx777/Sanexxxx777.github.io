import styles from "./Glitch.module.css";

/* Coral RGB-split glitch on a word. Animation auto-disables under reduced motion (global rule). */
export function Glitch({ children }: { children: string }) {
  return (
    <span className={styles.glitch} data-text={children}>
      {children}
    </span>
  );
}
