import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { BurstButton } from "./BurstButton";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className={`${styles.foot} wrap`}>
      <span>{t.foot}</span>
      <BurstButton className={styles.link} onClick={() => scrollToId("contact")}>{t.foot_link}</BurstButton>
    </footer>
  );
}
