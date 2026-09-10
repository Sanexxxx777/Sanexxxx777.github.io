import { useI18n } from "../i18n/I18nContext";
import { SectionHead } from "./SectionHead";
import { FlagshipSystem } from "./FlagshipSystem";
import { FormalMath } from "./FormalMath";
import { WorksList } from "./WorksList";
import { Ghost } from "./Ghost";
import styles from "./Projects.module.css";

export function Projects() {
  const { t } = useI18n();
  return (
    <section className="section wrap" id="works">
      <Ghost />
      <SectionHead badge={t.w_badge} title={t.w_h2} right={t.w_right} />

      <FormalMath />

      <FlagshipSystem />

      <div className={styles.worksHead}>
        <span>{t.w_more}</span>
      </div>
      <WorksList />
    </section>
  );
}
