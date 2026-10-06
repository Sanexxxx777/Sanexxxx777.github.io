import { useMemo } from "react";
import { useI18n } from "../i18n/I18nContext";
import { releases } from "../data/releases";
import type { Release } from "../data/types";
import { useCollapse, type CollapseGroup } from "../lib/useCollapse";
import { fullLayout } from "../lib/layout";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";
import styles from "./Releases.module.css";

const KIND: Record<Release["kind"], { label: string; cls: string }> = {
  prod: { label: "Production", cls: "prod" },
  infra: { label: "Infra", cls: "infra" },
  perf: { label: "Performance", cls: "perf" },
  research: { label: "Research", cls: "research" },
};

/* ?layout=short: 3 newest entries + «Show all (+N)»; the default full layout shows every entry.
   Rows past the limit stay in the DOM with `hidden` (same pattern as Websites). */
const LIMIT = fullLayout ? releases.length : 3;
const PREFIX = "release-";

export function Releases() {
  const { lang, t } = useI18n();
  const groups = useMemo<CollapseGroup[]>(() => [{ key: "releases", ids: releases.map((_, i) => String(i)) }], []);
  const { isOpen, toggle } = useCollapse(groups, LIMIT, PREFIX);
  const all = isOpen("releases");
  return (
    <section className="section wrap" id="releases">
      <SectionHead badge={t.r5_badge} title={t.r5_h2} id="releases" />
      <div className={styles.timeline}>
        {releases.map((r, i) => {
          const k = KIND[r.kind];
          return (
            <div key={i} className={styles.cell} hidden={i >= LIMIT && !all}>
              <Reveal delay={(i % 4) * 0.05} className={`${styles.item} ${i === 0 ? styles.featured : ""}`}>
                <div className={styles.rail}>
                  <span className={styles.ver}>{r.ver}</span>
                  <span className={styles.when}>{r.when[lang]}</span>
                  <span className={styles.node} aria-hidden="true" />
                </div>
                <div className={styles.body}>
                  <div className={styles.row}>
                    <h4 className={styles.title}>{r.title[lang]}</h4>
                    <span className={`${styles.kind} ${styles[k.cls]}`}>{k.label}</span>
                  </div>
                  <p className={styles.text}>{r.body[lang]}</p>
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
      {releases.length > LIMIT && (
        <button
          type="button"
          className="show-more"
          aria-expanded={all}
          onClick={() => toggle("releases")}
          data-cta="releases-more"
        >
          {all ? t.list_less : `${t.list_more} (+${releases.length - LIMIT})`}
        </button>
      )}
    </section>
  );
}
