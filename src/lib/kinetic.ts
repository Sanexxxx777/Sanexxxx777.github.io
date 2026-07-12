/* Kinetic type: вес букв «плывёт» волной за курсором (ось wght вариативного шрифта).
   DOM-подход: оборачивает каждый символ текст-нод в span НА МЕСТЕ — вложенные span
   (цветовой акцент, точка) сохраняют свои стили. Совместим со scramble (тот ходит
   по текст-нодам, посимвольные ноды ему не мешают). Reduced-motion — не вешается.
   Big Shoulders Variable: 100–900; Oswald Variable (кириллица): 200–700. */

const isCyr = (ch: string) => /[Ѐ-ӿ]/.test(ch);
const VAR_FAMILY = '"Big Shoulders Display Variable", "Oswald Variable", var(--f-display)';

export function kineticElement(el: HTMLElement): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if ((n.textContent ?? "").trim()) textNodes.push(n as Text);
  }
  const letters: HTMLElement[] = [];
  for (const node of textNodes) {
    const frag = document.createDocumentFragment();
    for (const ch of node.textContent ?? "") {
      if (ch === " ") {
        frag.appendChild(document.createTextNode(" "));
        continue;
      }
      const sp = document.createElement("span");
      sp.textContent = ch;
      sp.style.display = "inline-block";
      sp.style.fontFamily = VAR_FAMILY;
      sp.style.fontVariationSettings = `"wght" ${isCyr(ch) ? 600 : 780}`;
      letters.push(sp);
      frag.appendChild(sp);
    }
    node.parentNode?.replaceChild(frag, node);
  }
  if (!letters.length) return () => {};

  let raf = 0;
  let px = -1e4, py = -1e4;
  const frame = () => {
    raf = 0;
    const rects = letters.map(l => l.getBoundingClientRect()); // все чтения до записей
    letters.forEach((l, i) => {
      const r = rects[i];
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height / 2);
      const f = Math.exp(-(dx * dx + dy * dy) / (2 * 110 * 110));
      const cyr = isCyr(l.textContent || "");
      const base = cyr ? 600 : 780;
      const peak = cyr ? 700 : 900;
      l.style.fontVariationSettings = `"wght" ${Math.round(base + (peak - base) * f)}`;
      l.style.transform = f > 0.02 ? `translateY(${(-3 * f).toFixed(2)}px)` : "";
    });
  };
  let inZone = false;
  const onMove = (e: PointerEvent) => {
    // просыпаемся только когда курсор недалеко от заголовка — не жечь rAF на всю страницу
    const box = el.getBoundingClientRect();
    const near = e.clientY >= box.top - 220 && e.clientY <= box.bottom + 220;
    if (!near) {
      if (inZone) {
        // вышли из зоны — один кадр-сброс к базовому весу, иначе буквы залипают жирными
        inZone = false;
        px = py = -1e4;
        if (!raf) raf = requestAnimationFrame(frame);
      }
      return;
    }
    inZone = true;
    px = e.clientX;
    py = e.clientY;
    if (!raf) raf = requestAnimationFrame(frame);
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return () => {
    window.removeEventListener("pointermove", onMove);
    if (raf) cancelAnimationFrame(raf);
  };
}
