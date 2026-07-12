/* Text Scramble («decrypted text»): при первом появлении заголовок «декодируется»
   посимвольно слева направо. Ходит по текст-нодам, так что вложенные span
   (акцентное слово, точка) сохраняют свои стили. Reduced-motion — эффект не запускается. */

const POOL_LAT = "ABCDEFGHIJKLMNPQRSTUVWXYZ#<>/*+=";
const POOL_CYR = "АБВГДЕЖЗИКЛМНПРСТУФХЦЧШЩЭЮЯ#<>/*";

function poolFor(ch: string): string {
  return /[Ѐ-ӿ]/.test(ch) ? POOL_CYR : POOL_LAT;
}

export function scrambleElement(el: HTMLElement, duration = 1750): () => void {
  const chunks: { node: Text; final: string }[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let total = 0;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const final = n.textContent ?? "";
    if (final.trim()) {
      chunks.push({ node: n as Text, final });
      total += final.length;
    }
  }
  if (!total) return () => {};

  const t0 = performance.now();
  let raf = 0;
  let lastShuffle = 0;
  let shuffled: string[][] = chunks.map(c => c.final.split(""));

  const restore = () => chunks.forEach(c => { c.node.textContent = c.final; });

  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    const eased = p * p * (3 - 2 * p); // smoothstep: медленный старт — скрембл виден и на первом слове
    if (now - lastShuffle > 40) {
      lastShuffle = now;
      shuffled = chunks.map(c =>
        c.final.split("").map(ch => {
          if (!/[\p{L}\p{N}]/u.test(ch)) return ch;
          const pool = poolFor(ch);
          return pool[(Math.random() * pool.length) | 0];
        }),
      );
    }
    let offset = 0;
    for (let i = 0; i < chunks.length; i++) {
      const { node, final } = chunks[i];
      const settled = Math.max(0, Math.round(eased * total) - offset);
      node.textContent =
        settled >= final.length
          ? final
          : final.slice(0, settled) + shuffled[i].slice(settled).join("");
      offset += final.length;
    }
    if (p < 1) raf = requestAnimationFrame(tick);
    else restore();
  };

  raf = requestAnimationFrame(tick);
  return () => { cancelAnimationFrame(raf); restore(); };
}

export function scrambleOnReveal(el: HTMLElement | null, duration?: number): () => void {
  if (!el) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  let cancel: (() => void) | null = null;
  const io = new IntersectionObserver(
    entries => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect();
        cancel = scrambleElement(el, duration);
      }
    },
    // старт, когда заголовок реально в поле взгляда: ≥60% видно И выше нижних 15% экрана
    { threshold: 0.6, rootMargin: "0px 0px -15% 0px" },
  );
  io.observe(el);
  return () => { io.disconnect(); cancel?.(); };
}
