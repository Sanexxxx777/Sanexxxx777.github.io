/* Language = URL for bilingual static pages, as prerender.mjs does for the home page.
   One source, public/<page>/index.html: <html lang="en">, EN head, body text in [data-ru]/[data-en]
   spans. Two built pages: dist/<page>/index.html (EN) and dist/ru/<page>/index.html (RU).
   Runs after prerender, before brand-nav (which then stamps one-language tabs into each page).
   Per language:
   - <html lang>; on RU every head tag with data-ru-content takes that value (<title>: its text)
   - the other language's spans are dropped; a bare <span data-xx> is unwrapped, a span with
     other attributes only loses data-xx
   - href + data-href-ru + data-href-en resolve to the page language's href
   Any data-ru/data-en/data-ru-content/data-href-* left over fails the build (a span nested in a
   language span, another attribute order): a silent miss would ship both languages on one URL. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const PAGES = ["proof"];

/* a language span with no span inside it */
const SPAN = /<span([^>]*?)\sdata-(ru|en)(?=[\s>])([^>]*)>((?:(?!<\/?span[\s>])[\s\S])*?)<\/span>/g;
const HREF = /\shref="[^"]*"\sdata-href-ru="([^"]*)"\sdata-href-en="([^"]*)"/g;
const META = /(<meta\s[^>]*?\scontent=")[^"]*("[^>]*?)\sdata-ru-content="([^"]*)"/g;
const TITLE = /<title data-ru-content="([^"]*)">[^<]*<\/title>/;
const LEFT = /\sdata-(?:ru|en)(?=[\s>])|\sdata-ru-content=|\sdata-href-(?:ru|en)=/;

function build(src, lang, rel) {
  let html = src;
  if (lang === "ru") {
    if (!TITLE.test(html)) throw new Error(`static-lang: ${rel}: no <title data-ru-content>`);
    html = html.replace(/<html lang="en">/, '<html lang="ru">')
      .replace(TITLE, (_, t) => `<title>${t}</title>`)
      .replace(META, (_, a, b, ru) => `${a}${ru}${b}`);
  } else {
    html = html.replace(/(<title) data-ru-content="[^"]*"/, "$1")
      .replace(/(<meta\s[^>]*?)\sdata-ru-content="[^"]*"/g, "$1");
  }
  html = html
    .replace(SPAN, (_, pre, l, post, inner) => {
      if (l !== lang) return "";
      const attrs = (pre + post).trim();
      return attrs ? `<span ${attrs}>${inner}</span>` : inner;
    })
    .replace(HREF, (_, ru, en) => ` href="${lang === "ru" ? ru : en}"`);
  const left = html.match(LEFT);
  if (left) {
    const at = html.indexOf(left[0]);
    throw new Error(`static-lang: ${rel} (${lang}): «${left[0].trim()}» left at …${html.slice(at - 80, at + 40)}…`);
  }
  return html;
}

for (const page of PAGES) {
  const file = join(dist, page, "index.html");
  const src = readFileSync(file, "utf8");
  if ((src.match(/<html lang="en">/g) || []).length !== 1) throw new Error(`static-lang: ${page}: source must be <html lang="en">`);
  const out = [["en", file], ["ru", join(dist, "ru", page, "index.html")]];
  for (const [lang, to] of out) {
    const html = build(src, lang, `${page}/index.html`);
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, html);
    console.log(`static-lang: ${lang} -> ${to.replace(root + "/", "")} (${html.length} bytes)`);
  }
}
