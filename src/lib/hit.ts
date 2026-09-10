/* Счётчик визитов и событий главной. Тот же endpoint и формат, что у статических
   страниц (public/*) и витрины: путь, язык, хост реферера, query; глубина скролла
   на pagehide; клики по любому элементу с data-cta. IP не пишется, cookies нет.
   Живёт модулем, а не инлайном в index.html, чтобы точно попасть в сборку. */

const E = "https://backend-test.45-82-95-142.nip.io:8443/hit";

function send(q: string) {
  try {
    if (navigator.sendBeacon) navigator.sendBeacon(E + "?" + q);
    else fetch(E + "?" + q, { method: "POST", keepalive: true, mode: "no-cors" }).catch(() => {});
  } catch { /* ignore */ }
}

export function initHit() {
  if (typeof window === "undefined") return;
  try {
    let lang = "";
    try { lang = localStorage.getItem("lang") || ""; } catch { /* ignore */ }
    const l = (lang || navigator.language || "").slice(0, 5);
    let r = "";
    try { r = document.referrer ? new URL(document.referrer).host : ""; } catch { /* ignore */ }
    const q = location.search.replace(/^\?/, "");
    const base = `p=${encodeURIComponent(location.pathname)}&l=${encodeURIComponent(l)}&r=${encodeURIComponent(r)}&q=${encodeURIComponent(q)}`;
    send(base);

    let md = 0;
    addEventListener("scroll", () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      const d = h > 0 ? Math.round((scrollY / h) * 100) : 100;
      if (d > md) md = d;
    }, { passive: true });
    addEventListener("pagehide", () => send(`e=depth&d=${md}&${base}`));

    document.addEventListener("click", (ev) => {
      const t = ev.target as Element | null;
      const el = t && t.closest ? t.closest("[data-cta]") : null;
      if (el) send(`e=cta&d=${encodeURIComponent(el.getAttribute("data-cta") || "")}&${base}`);
    });
  } catch { /* ignore */ }
}
