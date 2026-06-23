import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className={`${styles.foot} wrap`}>
      <span>{t.foot}</span>
      <button className={styles.link} onClick={() => scrollToId("contact")}>{t.foot_link}</button>
    </footer>
  );
}
