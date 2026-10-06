/* Prerender: turns the client build (dist/index.html) into two real HTML pages.
   Runs after `vite build` and `vite build --ssr` (see package.json "build").
   - dist/index.html      EN, <div id="root"> filled with the rendered app
   - dist/ru/index.html   RU, head swapped to the RU strings from dict.ts META
   No browser: React's renderToString on the SSR bundle (.ssr/entry-server.js). */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const { render, META } = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);

const SITE = "https://shulgin.is-a.dev";
const template = readFileSync(join(dist, "index.html"), "utf8");

const esc = (v) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/* replace exactly one occurrence or fail the build: a silent miss would ship the wrong head */
function swap(html, re, to, what) {
  if (!re.test(html)) throw new Error(`prerender: ${what} not found in dist/index.html`);
  return html.replace(re, () => to);
}

function page(lang) {
  const app = render(lang);
  if (app.length < 5000) throw new Error(`prerender: suspiciously short markup for ${lang} (${app.length})`);
  let html = swap(template, /<div id="root"><\/div>/, `<div id="root">${app}</div>`, "empty #root");
  if (lang === "en") return html;

  const m = META[lang];
  const url = `${SITE}/ru/`;
  html = swap(html, /<html lang="en">/, `<html lang="${lang}">`, "<html lang>");
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`, "<title>");
  const set = (attr, name, val) => {
    const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
    if (!re.test(html)) throw new Error(`prerender: <meta ${attr}="${name}"> not found`);
    html = html.replace(re, (_, a, b) => `${a}${esc(val)}${b}`);
  };
  set("name", "description", m.desc);
  set("property", "og:title", m.ogt);
  set("property", "og:description", m.ogd);
  set("property", "og:locale", m.locale);
  set("property", "og:url", url);
  set("name", "twitter:title", m.ogt);
  set("name", "twitter:description", m.ogd);
  html = swap(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`, "canonical");
  return html;
}

const out = [["en", join(dist, "index.html")], ["ru", join(dist, "ru", "index.html")]];
for (const [lang, file] of out) {
  const html = page(lang);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`prerender: ${lang} -> ${file.replace(root + "/", "")} (${html.length} bytes)`);
}
