import { useI18n } from "../i18n/I18nContext";
import { apps } from "../data/apps";
import { projects } from "../data/projects";
import { SectionHead } from "./SectionHead";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";
import styles from "./Projects.module.css";

export function Applications() {
  const { t } = useI18n();
  const base = projects.length + 2; // continue MOD_ numbering after Projects (flagship = 01)
  return (
    <section className="section wrap" id="apps">
      <SectionHead badge={t.a_badge} title={t.a_h2} right={t.a_right} />
      <div className={styles.grid}>
        {apps.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.06}>
            <ProjectCard p={p} index={base + i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
