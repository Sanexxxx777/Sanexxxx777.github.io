import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import styles from "./StickyHire.module.css";

/* Mobile-only sticky "hire" door. Hidden while the hero (with its own big CTA)
   is on screen, appears once #intro scrolls out — so it never competes with
   the hero buttons, only fills the gap once they're gone. */
export function StickyHire() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("intro");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <a
      className={`${styles.sticky} ${visible ? styles.show : ""}`}
      href="https://shulgin.is-a.dev/store/prosto/"
      data-cta="sticky-hire"
      aria-hidden={!visible}
    >
      {t.sticky_hire} <span aria-hidden="true">↗</span>
    </a>
  );
}
