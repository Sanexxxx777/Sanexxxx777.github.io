/* Kinetic type: вес букв «плывёт» за курсором (ось wght вариативного шрифта), буква уходит от курсора.
   DOM-подход: оборачивает каждый символ текст-нод в span НА МЕСТЕ — вложенные span
   (цветовой акцент, точка) сохраняют свои стили. Совместим со scramble (тот ходит
   по текст-нодам, посимвольные ноды ему не мешают). Reduced-motion — не вешается.
   Big Shoulders Variable: 100–900; Oswald Variable (кириллица): 200–700.

   Работа только когда нужна:
   - слушатель pointermove живёт, пока заголовок на экране (IntersectionObserver); вне экрана ни слушателя, ни rAF;
   - реагирует только внутри «своей» зоны: ±BAND_Y по вертикали и +MARGIN_X за краями по горизонтали;
   - сглаживание по времени (τ = TAU мс, экспонента), сдвиг зажат 3 px по X и 2 px по Y;
   - rAF останавливается, когда все буквы осели (< 0.1 px, вес в пределах округления);
   - геометрия букв кэшируется (центр относительно заголовка), перемеряется только на resize / загрузке шрифтов;
   - в DOM пишется только то, что изменилось. Тач: указатель не симулируется. */

const isCyr = (ch: string) => /[Ѐ-ӿ]/.test(ch);
const VAR_FAMILY = '"Big Shoulders Display Variable", "Oswald Variable", var(--f-display)';

const SIGMA = 110;   // радиус влияния курсора, px
const PUSH = 9;      // горизонтальный уход до зажима: профиль «производная гауссианы»
const MAX_X = 3;     // зажим сдвига, px
const MAX_Y = 2;
const LIFT = 4;      // приподнимание до зажима
const BAND_Y = 120;  // вертикальная полоса вокруг заголовка, px
const MARGIN_X = 80; // горизонтальный запас за краями заголовка, px
const TAU = 85;      // мс
const SETTLE_PX = 0.1;

type Letter = {
  el: HTMLElement;
  base: number; peak: number;
  relX: number; relY: number;        // центр буквы относительно левого верха заголовка (px)
  w: number; ox: number; oy: number; // текущие значения (вес, сдвиг)
  wDone: number; oxDone: number; oyDone: number; // что уже записано в DOM (квантованное)
};

export function kineticElement(el: HTMLElement): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if ((n.textContent ?? "").trim()) textNodes.push(n as Text);
  }
  const letters: Letter[] = [];
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
      const cyr = isCyr(ch);
      const base = cyr ? 600 : 780;
      sp.style.fontVariationSettings = `"wght" ${base}`;
      letters.push({
        el: sp, base, peak: cyr ? 700 : 900, relX: 0, relY: 0,
        w: base, ox: 0, oy: 0, wDone: base, oxDone: 0, oyDone: 0,
      });
      frag.appendChild(sp);
    }
    node.parentNode?.replaceChild(frag, node);
  }
  if (!letters.length) return () => {};

  let dirty = true; // геометрию нужно (пере)мерить: старт, resize, шрифты
  const measure = (box: DOMRect) => {
    for (const l of letters) {
      const r = l.el.getBoundingClientRect();
      // текущий сдвиг вычитаем: центр нужен «в покое», иначе уходящая буква сместила бы свой же центр
      l.relX = r.left + r.width / 2 - l.ox - box.left;
      l.relY = r.top + r.height / 2 - l.oy - box.top;
    }
    dirty = false;
  };
  const markDirty = () => { dirty = true; };
  window.addEventListener("resize", markDirty);
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  fonts?.addEventListener?.("loadingdone", markDirty);
  fonts?.ready.then(markDirty).catch(() => {});

  let raf = 0;
  let px = 0, py = 0;
  let active = false;   // курсор сейчас в зоне заголовка
  let onScreen = false;
  let lastT = 0;

  const kineticFrame = (now: number) => {
    raf = 0;
    const box = el.getBoundingClientRect(); // единственное чтение раскладки за кадр, до всех записей
    if (dirty) measure(box);
    const dt = lastT ? Math.min(100, Math.max(0, now - lastT)) : 16.7;
    lastT = now;
    const a = 1 - Math.exp(-dt / TAU);
    let moving = false;
    for (const l of letters) {
      let tw = l.base, tx = 0, ty = 0;
      if (active) {
        const dx = px - (box.left + l.relX);
        const dy = py - (box.top + l.relY);
        const f = Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA));
        tw = l.base + (l.peak - l.base) * f;
        // по X профиль «производная гауссианы» (под курсором 0, пик на расстоянии σ — нет скачка при проходе
        // через центр), по Y приподнимается; оба зажаты
        tx = Math.max(-MAX_X, Math.min(MAX_X, -(dx / SIGMA) * f * PUSH));
        ty = Math.max(-MAX_Y, Math.min(0, -LIFT * f));
      }
      l.w += (tw - l.w) * a;
      l.ox += (tx - l.ox) * a;
      l.oy += (ty - l.oy) * a;
      const settled =
        Math.abs(tw - l.w) < 0.5 && Math.abs(tx - l.ox) < SETTLE_PX && Math.abs(ty - l.oy) < SETTLE_PX;
      if (settled) { l.w = tw; l.ox = tx; l.oy = ty; } else moving = true;
      // квантование: вес — целое, сдвиг — 0.05 px; пишем только при изменении
      const w = Math.round(l.w);
      const ox = Math.round(l.ox * 20) / 20;
      const oy = Math.round(l.oy * 20) / 20;
      if (w !== l.wDone) { l.el.style.fontVariationSettings = `"wght" ${w}`; l.wDone = w; }
      if (ox !== l.oxDone || oy !== l.oyDone) {
        l.el.style.transform = ox || oy ? `translate(${ox}px, ${oy}px)` : "";
        l.oxDone = ox; l.oyDone = oy;
      }
    }
    if (moving) raf = requestAnimationFrame(kineticFrame);
    else lastT = 0; // осели: следующий запуск начнёт с нормального шага
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(kineticFrame); };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return; // тач: никакой симуляции указателя
    const box = el.getBoundingClientRect();
    const inside =
      e.clientY >= box.top - BAND_Y && e.clientY <= box.bottom + BAND_Y &&
      e.clientX >= box.left - MARGIN_X && e.clientX <= box.right + MARGIN_X;
    if (!inside && !active) return; // не в зоне и не было в зоне: ни работы, ни rAF
    active = inside;
    px = e.clientX;
    py = e.clientY;
    wake(); // вышли из зоны — буквы плавно возвращаются, rAF сам встанет, когда осядут
  };

  // слушатель — только пока заголовок на экране (запас BAND_Y: зона влияния шире самого заголовка)
  const io = new IntersectionObserver((es) => {
    const on = es[es.length - 1].isIntersecting;
    if (on === onScreen) return;
    onScreen = on;
    if (on) {
      window.addEventListener("pointermove", onMove, { passive: true });
    } else {
      window.removeEventListener("pointermove", onMove);
      active = false; // уехали с экрана: вернуть буквы в покой без плавности и остановить rAF
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      lastT = 0;
      for (const l of letters) {
        l.w = l.base; l.ox = 0; l.oy = 0;
        if (l.wDone !== l.base) { l.el.style.fontVariationSettings = `"wght" ${l.base}`; l.wDone = l.base; }
        if (l.oxDone || l.oyDone) { l.el.style.transform = ""; l.oxDone = 0; l.oyDone = 0; }
      }
    }
  }, { rootMargin: `${BAND_Y}px 0px ${BAND_Y}px 0px`, threshold: 0 });
  io.observe(el);

  return () => {
    io.disconnect();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", markDirty);
    fonts?.removeEventListener?.("loadingdone", markDirty);
    if (raf) cancelAnimationFrame(raf);
  };
}
