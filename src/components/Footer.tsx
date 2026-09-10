import { useI18n } from "../i18n/I18nContext";
import { scrollToId } from "../lib/scroll";
import { BurstButton } from "./BurstButton";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className={`${styles.foot} wrap`}>
      <span>{t.foot}</span>
      <nav className={styles.navf} aria-label={t.foot_nav.src}>
        <a href="https://shulgin.is-a.dev/store" data-cta="footer-store">{t.foot_nav.store}</a>
        <a href="/lab/">{t.foot_nav.lab}</a>
        <a href="/proof/">{t.foot_nav.proof}</a>
        <a href="/check/">{t.foot_nav.check}</a>
        <a href="/llms.txt">{t.foot_nav.llms}</a>
        <a href="/privacy/" data-cta="footer-privacy">{t.foot_nav.privacy}</a>
        <a href="https://github.com/Sanexxxx777/Sanexxxx777.github.io" target="_blank" rel="noopener noreferrer">{t.foot_nav.src}</a>
      </nav>
      <BurstButton className={styles.link} onClick={() => scrollToId("contact")}>{t.foot_link}</BurstButton>
    </footer>
  );
}
