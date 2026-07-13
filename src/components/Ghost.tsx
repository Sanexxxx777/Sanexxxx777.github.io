import { useEffect, useRef } from "react";
import { createGhostEmotions } from "../lib/ghostEngine";
import styles from "./Ghost.module.css";

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export function Ghost() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cs = getComputedStyle(document.documentElement);
    const tok = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
    const ghost = createGhostEmotions(canvas, {
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

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      gazeHandlers.forEach(({ el, onEnter }) => el.removeEventListener("pointerenter", onEnter));
      ghost.destroy();
    };
  }, []);

  return (
    <div className={styles.slot} aria-hidden="true">
      <canvas ref={ref} width={840} height={560} className={styles.canvas} />
    </div>
  );
}
