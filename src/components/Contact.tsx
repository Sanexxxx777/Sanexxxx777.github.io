import { useI18n } from "../i18n/I18nContext";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Contact.module.css";

const LINKS = [
  { lbl: "Email", val: "sanexxx777@gmail.com", href: "mailto:sanexxx777@gmail.com" },
  { lbl: "Telegram", val: "@Aleksandr_NFA", href: "https://t.me/Aleksandr_NFA" },
  { lbl: "GitHub", val: "/Sanexxxx777", href: "https://github.com/Sanexxxx777" },
  { lbl: "LinkedIn", val: "/aleksandr-shulgin", href: "https://www.linkedin.com/in/%D0%B0%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80-%D1%88%D1%83%D0%BB%D1%8C%D0%B3%D0%B8%D0%BD-42b40a272/" },
];

export function Contact() {
  const { t } = useI18n();
  return (
    <section className="section wrap" id="contact">
      <SectionHead badge={t.c6_badge} title={t.c6_h2} right={t.c6_right} />

      <div className={styles.block}>
        <Reveal className={styles.lead}>
          <h3 className={styles.leadH}>{t.c_lead_h3}<span className={styles.stop}>.</span></h3>
          <p className={styles.leadP}>{t.c_lead_p}</p>
        </Reveal>

        <Reveal delay={0.1} className={styles.cards}>
          {LINKS.map((l) => (
            <a className={styles.row} key={l.lbl} href={l.href} target="_blank" rel="noopener noreferrer">
              <span className={styles.rowLbl}>{l.lbl}</span>
              <span className={styles.rowVal}>{l.val}</span>
              <span className={styles.rowGo} aria-hidden="true">↗</span>
            </a>
          ))}
        </Reveal>
      </div>

      <div className={styles.meta}>
        <MetaCell h={t.cm.format_h} v={t.cm.format_v} p={t.cm.format_p} />
        <MetaCell h={t.cm.focus_h} v={t.cm.focus_v} p={t.cm.focus_p} />
        <MetaCell h={t.cm.lang_h} v={t.cm.lang_v} p={t.cm.lang_p} />
      </div>
    </section>
  );
}

function MetaCell({ h, v, p }: { h: string; v: string; p: string }) {
  return (
    <Reveal className={styles.cell}>
      <div className={styles.cellH}>▌ {h}</div>
      <div className={styles.cellV}>{v}</div>
      <p className={styles.cellP}>{p}</p>
    </Reveal>
  );
}
