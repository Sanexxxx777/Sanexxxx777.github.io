/**
 * Generates public/llms.txt and public/llms-full.txt from src/data/*.ts and
 * src/i18n/dict.ts. Do not hand-edit the generated files - edit the data
 * instead and re-run `npm run gen:llms` (also runs automatically as `prebuild`).
 *
 * Card content is never hardcoded here. The only static text living in this
 * file is the handful of paragraphs that describe standalone pages
 * (lab/proof/check/store/curated-claude-code) which have no src/data source.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { UI, META } from "../src/i18n/dict";
import type { Bi, Meta, Project, Status } from "../src/data/types";
import { formalStats, formalItems } from "../src/data/formalMath";
import type { FormalItem } from "../src/data/formalMath";
import { flagshipStats, subsystems } from "../src/data/flagship";
import { projects } from "../src/data/projects";
import { apps } from "../src/data/apps";
import { websites } from "../src/data/websites";
import type { Website } from "../src/data/websites";
import { films } from "../src/data/films";
import type { Film } from "../src/data/films";
import { releases } from "../src/data/releases";
import { principles } from "../src/data/principles";

const ROOT = join(__dirname, "..", "..");
const SITE = "https://shulgin.is-a.dev";

/* ---------- small helpers ---------- */

function valOf(v: Bi | string): string {
  return typeof v === "string" ? v : v.en;
}

function metaKV(m: Meta): string {
  return `${m.k.en}: ${valOf(m.v)}`;
}

function metaVK(m: Meta): string {
  return `- **${valOf(m.v)}**: ${m.k.en}`;
}

function statusDisplay(status: Status): string {
  // "closed" systems are described as retired, never as still live.
  return status === "closed" ? "retired" : status;
}

function sanitizeDashes(s: string): string {
  // Site rule: EN copy never carries an em/en dash, hyphen only. A couple of
  // upstream data fields (META.en.desc, formalStats "M1-5" range) still use
  // one - normalize here instead of hand-editing files outside this task's
  // scope (src/i18n, src/data).
  return s.replace(/[–—]/g, "-");
}

function section(title: string, bodyLines: string[]): string {
  return [title, "", ...bodyLines].join("\n");
}

/* ---------- project / app / website / film blocks (shared shape) ---------- */

function projectBlock(p: Project): string {
  const lines = [
    `### ${p.title} (${p.year}, ${statusDisplay(p.status)})`,
    p.kicker.en,
    "",
    p.desc.en,
    "",
    `Tags: ${p.tags.join(", ")}`,
    `Meta: ${p.meta.map(metaKV).join(", ")}`,
  ];
  if (p.link) lines.push(`Link: ${p.link}`);
  return lines.join("\n");
}

function websiteBlock(w: Website): string {
  const lines = [
    `### ${w.name.en} (${w.kind.en}, ${w.year})`,
    w.desc.en,
    "",
    `Tags: ${w.tags.join(", ")}`,
  ];
  if (w.href) lines.push(`Live: ${w.href}`);
  else if (w.pending) lines.push(`Status: ${w.pending.en}`);
  return lines.join("\n");
}

function filmLine(f: Film): string {
  return `- **${f.title.en}** (${f.kind.en}, ${f.seconds} s) - ${f.desc.en} ${SITE}/films/${f.id}.mp4`;
}

function formalItemBlock(i: FormalItem): string {
  const link = i.link ? ` ${i.link}` : "";
  return `- **${i.code} ${i.title.en}** - ${i.desc.en} Status: ${i.status.en}.${link}`;
}

/* ---------- LinkedIn URL, sourced from Contact.tsx (not imported as a
   module - it's a .tsx file with JSX, so we just grep the constant). ---------- */

const contactSrc = readFileSync(join(ROOT, "src", "components", "Contact.tsx"), "utf-8");
const linkedinMatch = contactSrc.match(/https:\/\/www\.linkedin\.com\/in\/[^"']+/);
if (!linkedinMatch) {
  console.error("gen-llms: could not find a LinkedIn URL in src/components/Contact.tsx");
  process.exit(1);
}
const linkedinUrl = linkedinMatch[0];

/* ---------- lab technique slugs, read from disk ---------- */

const labDir = join(ROOT, "public", "lab", "techniques");
const labSlugs = readdirSync(labDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

/* ---------- static paragraphs about standalone pages (no src/data source) ---------- */

const CURATED_CLAUDE_CODE_TEXT = `An open-source harness for Claude Code, MIT licensed, with no auto-running hooks: ${SITE}/curated-claude-code/ (source: https://github.com/Sanexxxx777/curated-claude-code).

The premise is that most "everything for Claude Code" collections optimize for count - hundreds of skills, agents and event hooks - and fail quietly through bloated context and hooks that mutate things without asking. This one ships ten skills that earned their place (vet, proof, workflow-upgrade, goal, konsilium, ship-secure, pre-push, system-health, teach, longread), two agents (an adversarial verifier that tries to refute a finding, and a read-only scout for evaluating incoming tools), and six always-on rules.

Release v0.2.0 (September 2026) added the \`proof\` skill: an evidence ladder - declared, implemented, exercised, integrated, observed - where you climb only to the lowest rung that decides the claim, and a four-value verdict vocabulary (pass / partial / fail / skip) that keeps "we didn't look" distinct from "we looked and it's broken". The same release added a dependency-intake guard (a package name a model proposed is a claim, not a fact) and a rule that an artifact's own claims - a \`# noqa\`, a "verified safe" comment, a PR description - carry no evidential weight in a review.`;

/* ---------- public/llms.txt ---------- */

function buildLlmsTxt(): string {
  const pages: [string, string][] = [
    ["Home", `${SITE}/`],
    ["Evidence", `${SITE}/proof/`],
    ["Interaction lab", `${SITE}/lab/`],
    ["Free site check", `${SITE}/check/`],
    ["Curated Claude Code", `${SITE}/curated-claude-code/`],
    ["Store", `${SITE}/store/`],
    ["Hire, plain language", `${SITE}/store/prosto/`],
    ["Full portfolio as markdown", `${SITE}/llms-full.txt`],
  ];

  const openSource = [...projects, ...apps].filter((p) => p.link && p.link.includes("github.com"));
  const liveSites = websites.filter((w) => w.href);

  const blocks = [
    `# Aleksandr Shulgin (${SITE.replace("https://", "")})`,
    META.en.desc,
    section(
      "## Evidence",
      formalItems
        .filter((i) => i.link)
        .map((i) => `- [${i.code} ${i.title.en}](${i.link}): ${i.desc.en} (${i.status.en})`),
    ),
    section("## Pages", pages.map(([label, url]) => `- [${label}](${url})`)),
    section("## Open source", openSource.map((p) => `- [${p.title}](${p.link}): ${p.desc.en}`)),
    section("## Live sites", liveSites.map((w) => `- [${w.name.en}](${w.href}): ${w.desc.en}`)),
  ];

  return sanitizeDashes(blocks.join("\n\n") + "\n");
}

/* ---------- public/llms-full.txt ---------- */

function buildLlmsFullTxt(): string {
  const today = new Date().toISOString().slice(0, 10);
  const heroLine = `${UI.en.hero_l1} ${UI.en.hero_l2} ${UI.en.hero_l3}.`;

  const stackTags: string[] = [];
  for (const item of [...projects, ...apps]) {
    for (const t of item.tags) if (!stackTags.includes(t)) stackTags.push(t);
  }
  for (const w of websites) {
    for (const t of w.tags) if (!stackTags.includes(t)) stackTags.push(t);
  }

  const blocks = [
    "# Aleksandr Shulgin",
    [UI.en.hero_eyebrow, "", heroLine, "", UI.en.hero_lede].join("\n"),

    section("## Evidence (verifiable)", [
      ...formalStats.map(metaVK),
      "",
      ...formalItems.map(formalItemBlock),
      "",
      "All PR links open in a minute; status verified via the GitHub API.",
    ]),

    section(`## Flagship: ${UI.en.flag_title}`, [
      UI.en.flag_lede,
      "",
      ...flagshipStats.map(metaVK),
      "",
      ...subsystems.map((s) => `- **${s.code} ${s.title.en}** - ${s.desc.en} [${s.tags.join(", ")}]`),
      "",
      "Methods (protocol details, signing, batching, edge) are intentionally not published.",
    ]),

    section("## Projects", [projects.map(projectBlock).join("\n\n")]),
    section("## Apps", [apps.map(projectBlock).join("\n\n")]),
    section("## Websites shipped", [websites.map(websiteBlock).join("\n\n")]),
    section("## Films rendered from code", films.map(filmLine)),
    section("## Timeline", releases.map((r) => `- ${r.ver} (${r.when.en}): ${r.title.en}. ${r.body.en}`)),
    section("## How I work", principles.map((p) => `- ${p.h.en}: ${p.p.en}`)),
    section("## Stack", [stackTags.join(", ")]),

    section("## Contact", [
      "- Email: sanexxx777@gmail.com",
      "- Telegram: https://t.me/Aleksandr_NFA",
      "- GitHub: https://github.com/Sanexxxx777",
      `- LinkedIn: ${linkedinUrl}`,
      "",
      UI.en.cm.format_v,
      UI.en.cm.focus_p,
      UI.en.cm.lang_p,
      UI.en.c_lead_p,
    ]),

    section("## Interaction lab", [
      `13 live UI mechanics at ${SITE}/lab/: each runs in the browser, has a permalink at /lab/techniques/<slug>/ and its source on GitHub (MIT).`,
      "",
      ...labSlugs.map((slug) => `- ${slug}: ${SITE}/lab/techniques/${slug}/`),
    ]),

    section("## Evidence page", [
      // NOTE 2026-09-10: coordinator correction - 4 merged PRs (#4245, #4244,
      // #4364, #4361), not 3. src/data/formalMath.ts will grow a 4th entry in
      // another branch; this paragraph is static (no src/data source for it),
      // so the count is spelled out by hand and must move in lockstep with it.
      `${SITE}/proof/: only machine-verifiable links: 4 merged PRs in google-deepmind/formal-conjectures, open repositories, live sites. Trading systems and NDA work are deliberately absent.`,
    ]),

    section("## Free site check", [
      `${SITE}/check/: a free express check of a website against Russia's 152-FZ, executed in an isolated Cloudflare Worker. Ladder: free check, paid 16-point audit (500 RUB), fixes.`,
    ]),

    section("## Curated Claude Code", [CURATED_CLAUDE_CODE_TEXT]),

    section("## Store", [
      `${SITE}/store/: ready-made products and fixed-scope sprints; /store/prosto/ explains services in plain language. Qwerty Switcher is free with no subscription.`,
    ]),

    `Generated from src/data on ${today}; do not edit by hand.`,
  ];

  return sanitizeDashes(blocks.join("\n\n") + "\n");
}

/* ---------- honesty gate ---------- */

const FORBIDDEN = ["—", "–", "senior", "EIP-712", "$6/year", "IShu"];

function gate(label: string, text: string): void {
  const lines = text.split("\n");
  for (const term of FORBIDDEN) {
    const idx = lines.findIndex((l) => l.includes(term));
    if (idx !== -1) {
      console.error(`gen-llms: forbidden term ${JSON.stringify(term)} found in ${label}, line ${idx + 1}:`);
      console.error(lines[idx]);
      process.exit(1);
    }
  }
}

/* ---------- main ---------- */

const llmsTxt = buildLlmsTxt();
const llmsFullTxt = buildLlmsFullTxt();

gate("public/llms.txt", llmsTxt);
gate("public/llms-full.txt", llmsFullTxt);

writeFileSync(join(ROOT, "public", "llms.txt"), llmsTxt);
writeFileSync(join(ROOT, "public", "llms-full.txt"), llmsFullTxt);

console.log("gen-llms: wrote public/llms.txt and public/llms-full.txt");
