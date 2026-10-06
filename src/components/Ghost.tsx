import { useEffect, useRef } from "react";
import { useI18n } from "../i18n/I18nContext";
import { createGhostEmotions } from "../lib/ghostEngine";
import styles from "./Ghost.module.css";

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const PHONE_Q = "(max-width: 720px)";
/* the Living Canvas row in the works list (id from data/projects.ts) */
const CAPTION_HREF = "#work-living-canvas";

function makeGhost(canvas: HTMLCanvasElement) {
  const cs = getComputedStyle(document.documentElement);
  const tok = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
  return createGhostEmotions(canvas, {
    colors: () => ({
      a: tok("--coral", "#ee4e4e"),
      b: tok("--coral-2", "#ff6a5a"),
      ink: tok("--ink", "#f3f1ec"),
      eye: "rgba(22, 9, 11, 0.88)",
      heart: "#ff96a0",
      anger: "#ff3b30",
    }),
    zoom: 1.18,
  });
}

/* The markup is the same for every viewport (prerender-safe); CSS lays it out, the effect picks the engine mode:
   desktop = the live engine; phone = one static frame, a tap plays the click reaction once and the loop stops. */
export function Ghost() {
  const { t } = useI18n();
  const ref = useRef<HTMLCanvasElement>(null);
  const capRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const mq = window.matchMedia(PHONE_Q);
    let stop: (() => void) | null = null;
    const start = () => {
      stop?.();
      stop = mq.matches ? mountPhone(canvas) : mountDesktop(canvas, capRef.current);
    };
    start();
    mq.addEventListener("change", start);
    return () => {
      mq.removeEventListener("change", start);
      stop?.();
    };
  }, []);

  return (
    <div className={styles.slot}>
      <canvas ref={ref} width={840} height={560} className={styles.canvas} aria-hidden="true" />
      <a ref={capRef} className={styles.cap} href={CAPTION_HREF} data-cta="work-ghost-caption">
        {t.ghost_cap}
      </a>
    </div>
  );
}

/* Phone: draw one frame with the engine, then destroy it (the canvas keeps the last frame, no loop).
   A tap spins a fresh engine up for the length of the click reaction, then destroys it again. */
function mountPhone(canvas: HTMLCanvasElement) {
  let g: ReturnType<typeof createGhostEmotions> | null = null;
  let r1 = 0, r2 = 0, timer = 0, playing = false, dead = false;
  const freeze = () => { g?.destroy(); g = null; playing = false; };
  const still = () => {
    g = makeGhost(canvas);
    r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(freeze); });
  };
  const onTap = () => {
    if (playing || dead) return;
    playing = true;
    cancelAnimationFrame(r1); cancelAnimationFrame(r2);
    g?.destroy();
    g = makeGhost(canvas);
    g.emote("melt");
    timer = window.setTimeout(freeze, 2700);
  };
  still();
  canvas.addEventListener("pointerdown", onTap);
  return () => {
    dead = true;
    cancelAnimationFrame(r1); cancelAnimationFrame(r2);
    window.clearTimeout(timer);
    canvas.removeEventListener("pointerdown", onTap);
    g?.destroy();
  };
}

function mountDesktop(canvas: HTMLCanvasElement, cap: HTMLAnchorElement | null) {
  const ghost = makeGhost(canvas);

  /* Паттерны реакций на действия пользователя (не чаще одной за окно): */
  let lastReact = 0;
  const react = (name: string, cooldown: number) => {
    const now = performance.now();
    if (now - lastReact < cooldown) return;
    lastReact = now;
    ghost.emote(name);
  };

  // 1) первое появление в вьюпорте — приветственное подмигивание
  let greeted = false;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !greeted) {
        greeted = true;
        setTimeout(() => react("wink", 0), 500);
        io.disconnect();
      }
    },
    { threshold: 0.6 },
  );
  io.observe(canvas);

  // 2) скролл: непрерывный гейз-биас по направлению + резкий скролл мимо вздрагивает
  let lastY = window.scrollY;
  let lastT = performance.now();
  const onScroll = () => {
    const now = performance.now();
    const v = Math.abs(window.scrollY - lastY) / Math.max(1, now - lastT); // px/ms
    const dir = Math.sign(window.scrollY - lastY);
    lastY = window.scrollY;
    lastT = now;
    if (greeted) ghost.nudge(0, clamp(dir * Math.min(v, 3) * 0.18, -0.5, 0.5));
    if (v > 3.2 && greeted) {
      const r = canvas.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) react("surprise", 9000);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // 3) hover на карточках подсистем рядом с призраком — «замечает» наведение
  const gazeEls = Array.from(document.querySelectorAll<HTMLElement>("[data-ghost-gaze]"));
  const gazeHandlers = gazeEls.map((el) => {
    const onEnter = () => {
      const r = el.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      if (!cr.width) return;
      const nx = clamp((r.left + r.width / 2 - (cr.left + cr.width / 2)) / 300, -1.2, 1.2);
      const ny = clamp((r.top + r.height / 2 - (cr.top + cr.height / 2)) / 300, -1.1, 1);
      ghost.lookAt(nx, ny, { hold: 1400 });
    };
    el.addEventListener("pointerenter", onEnter);
    return { el, onEnter };
  });

  // 4) подпись «Living Canvas»: взгляд к ней за 180 мс, держит 900 мс, возврат 250 мс (последние 250 мс lookAt движок отдаёт сам)
  let capRaf = 0;
  const gazeToCaption = (from: { x: number; y: number }) => {
    if (!cap) return;
    const r = cap.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    if (!cr.width) return;
    const tx = clamp((r.left + r.width / 2 - (cr.left + cr.width / 2)) / 300, -1.2, 1.2);
    const ty = clamp((r.top + r.height / 2 - (cr.top + cr.height / 2)) / 300, -1.1, 1);
    cancelAnimationFrame(capRaf);
    const t0 = performance.now();
    const step = () => {
      const k = clamp((performance.now() - t0) / 180, 0, 1);
      if (k < 1) {
        ghost.lookAt(from.x + (tx - from.x) * k, from.y + (ty - from.y) * k, { hold: 120 });
        capRaf = requestAnimationFrame(step);
      } else {
        ghost.lookAt(tx, ty, { hold: 900 + 250 });
      }
    };
    step();
  };
  const fromPointer = (e: PointerEvent | FocusEvent) => {
    const cr = canvas.getBoundingClientRect();
    if (e instanceof PointerEvent && cr.width) {
      return {
        x: clamp((e.clientX - (cr.left + cr.width / 2)) / 300, -1, 1),
        y: clamp((e.clientY - (cr.top + cr.height / 2)) / 300, -1, 1),
      };
    }
    return { x: 0, y: -0.35 };
  };
  const onCapEnter = (e: PointerEvent) => gazeToCaption(fromPointer(e));
  const onCapFocus = (e: FocusEvent) => gazeToCaption(fromPointer(e));
  cap?.addEventListener("pointerenter", onCapEnter);
  cap?.addEventListener("focus", onCapFocus);

  return () => {
    cancelAnimationFrame(capRaf);
    cap?.removeEventListener("pointerenter", onCapEnter);
    cap?.removeEventListener("focus", onCapFocus);
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
    gazeHandlers.forEach(({ el, onEnter }) => el.removeEventListener("pointerenter", onEnter));
    ghost.destroy();
  };
}
