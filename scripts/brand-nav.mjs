/* Brand-bar tabs: stamps the main page's tab row into every static page's header.
   Runs last in `npm run build`, over dist/ (public/ copied by Vite), so the sources stay
   as they are: /check/ stays byte-identical with the worker's page, and /lab/ copied from
   the design-showcase build gets the tabs without touching that project.
   - desktop (>1180px): inline tabs between the logo and the right block
   - narrower: a <details> burger in the right block (no JS, the bar keeps its 56px:
     /lab/ pins sticky elements under it via --sticky-top)
   Bilingual pages (RU/EN switch, [data-ru]/[data-en] CSS, a script swapping [data-href-ru])
   get both labels and both hrefs; one-language pages get their <html lang> only.
   The tab list mirrors src/components/Topbar.tsx: a tab added there goes here too.
   A page whose header does not match the expected shape fails the build (no silent miss). */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const TABS = [
  { id: "home", ru: "Главная", en: "Home", href: { ru: "/ru/", en: "/" } },
  { id: "works", ru: "Работы", en: "Work", href: { ru: "/ru/#works", en: "/#works" } },
  { id: "lab", ru: "Лаборатория", en: "Lab", href: { ru: "/lab/", en: "/lab/" } },
  { id: "proof", ru: "Открытый код", en: "Open source", href: { ru: "/proof/?lang=ru", en: "/proof/?lang=en" } },
  { id: "cv", ru: "Резюме", en: "CV", href: { ru: "/cv/?lang=ru", en: "/cv/?lang=en" } },
  /* the game is its own full-screen site: a new tab keeps the portfolio open */
  { id: "game", ru: "Игра", en: "Game", beta: { ru: "бета", en: "beta" }, newTab: true,
    href: { ru: "/game/?lang=ru", en: "/game/?lang=en" } },
  { id: "contact", ru: "Связь", en: "Contact", href: { ru: "/ru/#contact", en: "/#contact" } },
];

/* dist path -> tab that IS this page (its crumb then goes: the lit tab says where you are) */
function currentTab(rel) {
  if (rel === "proof/index.html") return "proof";
  if (rel === "cv/index.html") return "cv";
  if (rel.startsWith("lab/")) return "lab";
  return null;
}

const text = (t, mode) =>
  mode === "both" ? `<span data-ru>${t.ru}</span><span data-en>${t.en}</span>` : t[mode];

function tab(t, cls, mode, cur) {
  const lang = mode === "both" ? "ru" : mode;
  const href = t.href[lang];
  const swap = mode === "both" && t.href.ru !== t.href.en
    ? ` data-href-ru="${t.href.ru}" data-href-en="${t.href.en}"` : "";
  const blank = t.newTab ? ` target="_blank" rel="noopener"` : "";
  const here = cur === t.id ? ` aria-current="page"` : "";
  const beta = t.beta ? ` <span class="brand-bar__beta">${text(t.beta, mode)}</span>` : "";
  return `<a class="${cls}" href="${href}"${swap}${blank}${here} data-cta="nav-${t.id}">${text(t, mode)}${beta}</a>`;
}

function stamp(html, rel) {
  const n = (re) => (html.match(re) || []).length;
  if (html.includes("brand-bar__nav")) throw new Error(`brand-nav: ${rel} already has tabs`);
  if (n(/<div class="brand-bar__right">/g) !== 1 || n(/class="brand-bar__logo"/g) !== 1)
    throw new Error(`brand-nav: ${rel}: unexpected .brand-bar shape`);

  const bilingual = html.includes("data-set-lang=") && html.includes("[data-href-ru]") && /\[data-ru\]\s*\{\s*display:\s*none/.test(html);
  const pageLang = (html.match(/<html lang="(ru|en)"/) || [])[1];
  if (!bilingual && !pageLang) throw new Error(`brand-nav: ${rel}: no <html lang>`);
  const mode = bilingual ? "both" : pageLang;
  const cur = currentTab(rel);

  if (cur) {
    const crumb = /\s*<(a|span) class="brand-bar__crumb"[^>]*>(?:<span[^>]*>[^<]*<\/span>|[^<])*<\/\1>/;
    if (!crumb.test(html)) throw new Error(`brand-nav: ${rel}: crumb not found`);
    html = html.replace(crumb, "");
  }

  /* the logo is «Главная» too: the RU home is /ru/, the bare / is the English page */
  const home = TABS[0].href;
  const logo = mode === "both" ? `href="${home.ru}" data-href-ru="${home.ru}" data-href-en="${home.en}"` : `href="${home[mode]}"`;
  html = html.replace(/(<a class="brand-bar__logo") href="\/"/, `$1 ${logo}`);

  /* phones (<=620px) hide the bar's «Заказать», so the sheet opens with a copy of it (as on the main page) */
  const hire = html.match(/<a class="brand-bar__hire"[^>]*>(?:<span[^>]*>[^<]*<\/span>|[^<])*<\/a>/);
  if (!hire) throw new Error(`brand-nav: ${rel}: hire link not found`);
  const sheetHire = hire[0]
    .replace(`class="brand-bar__hire"`, `class="brand-bar__item brand-bar__item--hire"`)
    .replace(/data-cta="[^"]*"/, `data-cta="sheet-hire"`);

  const navLabel = mode === "en" ? "Sections" : "Разделы";
  const inline = `<nav class="brand-bar__nav" aria-label="${navLabel}">${TABS.map((t) => tab(t, "brand-bar__tab", mode, cur)).join("")}</nav>\n    `;
  const menu =
    `\n      <details class="brand-bar__menu">` +
    `<summary><span class="brand-bar__sr">${text({ ru: "Меню", en: "Menu" }, mode)}</span><i></i><i></i><i></i></summary>` +
    `<nav class="brand-bar__sheet" aria-label="${navLabel}">${sheetHire}${TABS.map((t) => tab(t, "brand-bar__item", mode, cur)).join("")}</nav>` +
    `</details>`;

  html = html.replace(/<div class="brand-bar__right">/, `${inline}<div class="brand-bar__right">`);
  /* the burger goes last in the right block: find that block's closing tag after its opening */
  const at = html.indexOf(`<div class="brand-bar__right">`);
  const close = html.indexOf(`</header>`, at);
  const end = html.lastIndexOf(`</div>`, html.lastIndexOf(`</div>`, close) - 1);
  if (at < 0 || close < 0 || end < at) throw new Error(`brand-nav: ${rel}: right block end not found`);
  return html.slice(0, end).trimEnd() + menu + "\n    " + html.slice(end);
}

function* pages(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* pages(p);
    else if (name.endsWith(".html")) yield p;
  }
}

let count = 0;
for (const file of pages(dist)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes(`<header class="brand-bar">`)) continue;
  writeFileSync(file, stamp(html, relative(dist, file)));
  count++;
}
if (count < 40) throw new Error(`brand-nav: only ${count} brand-bar pages, expected 40+`);
console.log(`brand-nav: tabs stamped into ${count} pages`);
