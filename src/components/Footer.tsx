import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { BurstButton } from "./BurstButton";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className={`${styles.foot} wrap`}>
      <span>{t.foot}</span>
      <a
        className={styles.badge}
        href="https://launchbuck.com/p/curated-claude-code"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://launchbuck.com/badges/pill-neutral.png"
          alt="Curated Claude Code — Featured on LaunchBuck"
          width={168}
          height={49}
          loading="lazy"
        />
      </a>
      <BurstButton className={styles.link} onClick={() => scrollToId("contact")}>{t.foot_link}</BurstButton>
    </footer>
  );
}
