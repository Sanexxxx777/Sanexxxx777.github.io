import { useI18n } from "../i18n/I18nContext";
import { projects } from "../data/projects";
import { SectionHead } from "./SectionHead";
import { FlagshipSystem } from "./FlagshipSystem";
import { FormalMath } from "./FormalMath";
import { ProjectCard } from "./ProjectCard";
import { Ghost } from "./Ghost";
import { Reveal } from "./Reveal";
import styles from "./Projects.module.css";

export function Projects() {
  const { t } = useI18n();
  return (
    <section className="section wrap" id="projects">
      <Ghost />
      <SectionHead badge={t.p3_badge} title={t.p3_h2} right={t.p3_right} />

      <FlagshipSystem />

      <FormalMath />

      <Reveal className={styles.divider}>
        <span>{t.flag_more}</span>
        <span className={styles.count}>{String(projects.length).padStart(2, "0")} —</span>
      </Reveal>

      <div className={styles.grid}>
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.06}>
            <ProjectCard p={p} index={i + 2} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
