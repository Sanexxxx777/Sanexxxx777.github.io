/* Счётчик визитов и событий главной. Тот же endpoint и формат, что у статических
   страниц (public/*) и витрины: путь, язык, хост реферера, query; глубина скролла
   на pagehide; клики по любому элементу с data-cta.
   Добавлено 06.10.2026: e=sec (секция впервые видна), e=first (время до первого клика
   по a/button), владельческий выключатель ?nohit=1 / ?nohit=0.
   IP не пишется, cookies нет. Живёт модулем, а не инлайном в index.html, чтобы точно
   попасть в сборку. */

const E = "https://backend-test.45-82-95-142.nip.io:8443/hit";
const NOHIT_KEY = "nohit";

/* Выключатель владельца: ?nohit=1 пишет localStorage.nohit="1", ?nohit=0 стирает.
   memMuted — запасной вариант, если localStorage недоступен (режим инкогнито Safari). */
let memMuted = false;
function readNohitParam() {
  try {
    const v = new URLSearchParams(location.search).get(NOHIT_KEY);
    if (v === "1") { memMuted = true; try { localStorage.setItem(NOHIT_KEY, "1"); } catch { /* ignore */ } }
    else if (v === "0") { memMuted = false; try { localStorage.removeItem(NOHIT_KEY); } catch { /* ignore */ } }
  } catch { /* ignore */ }
}
function muted(): boolean {
  try { if (localStorage.getItem(NOHIT_KEY) === "1") return true; } catch { /* ignore */ }
  return memMuted;
}

function send(q: string) {
  if (muted()) return;
  try {
    if (navigator.sendBeacon) navigator.sendBeacon(E + "?" + q);
    else fetch(E + "?" + q, { method: "POST", keepalive: true, mode: "no-cors" }).catch(() => {});
  } catch { /* ignore */ }
}

/* e=sec: один раз на секцию, когда её видно на >=25% своей площади ИЛИ когда она
   занимает >=25% высоты экрана (длинные секции «Работ» на телефоне иначе никогда не
   достигли бы 25% своей высоты). initHit() вызывается до рендера React, поэтому секции
   ищем по мере появления в DOM. */
function trackSections(base: string) {
  const seen = new Set<string>();
  const watched = new WeakSet<Element>();
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const id = (en.target as HTMLElement).id;
      if (!id || seen.has(id)) continue;
      const bigEnough = en.intersectionRatio >= 0.25 || en.intersectionRect.height >= innerHeight * 0.25;
      if (!en.isIntersecting || !bigEnough) continue;
      seen.add(id);
      io.unobserve(en.target);
      send(`e=sec&d=${encodeURIComponent(id)}&${base}`);
    }
  }, { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1] });

  const scan = () => {
    document.querySelectorAll("main section[id], #contact").forEach((el) => {
      if (!watched.has(el)) { watched.add(el); io.observe(el); }
    });
  };
  scan();
  const mo = new MutationObserver(scan);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => mo.disconnect(), 8000);
}

export function initHit() {
  if (typeof window === "undefined") return;
  try {
    readNohitParam();
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

    let firstSent = false;
    document.addEventListener("click", (ev) => {
      const t = ev.target as Element | null;
      if (!firstSent && t && t.closest && t.closest("a, button")) {
        firstSent = true;
        send(`e=first&d=${Math.round(performance.now())}&${base}`);
      }
      const el = t && t.closest ? t.closest("[data-cta]") : null;
      if (el) send(`e=cta&d=${encodeURIComponent(el.getAttribute("data-cta") || "")}&${base}`);
    });

    trackSections(base);
  } catch { /* ignore */ }
}
