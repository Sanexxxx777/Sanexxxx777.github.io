import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useI18n } from "../i18n/I18nContext";
import styles from "./AsciiCoda.module.css";

/* ASCII-тор (donut) на чистом canvas — финальный «инженерный» аккорд.
   Палитра брутализма (coral→cream по освещению), наклон следует за курсором,
   RGB-glitch на hover. Без three.js — лёгкий, в духе HeroObject. */
const RAMP = ".,-~:;=!*#$@";

export function AsciiCoda() {
  const { t } = useI18n();
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const FONT = 13; // px, моноширинный кегль
    const CW = FONT * 0.62; // ширина моноглифа JetBrains Mono
    const CH = FONT * 0.92; // высота строки
    let w = 0, h = 0, cols = 0, rows = 0;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / CW);
      rows = Math.floor(h / CH);
      ctx.font = `${FONT}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
    };
    resize();
    window.addEventListener("resize", resize);

    // курсор → целевой наклон
    let tA = 0, tB = 0, cA = 0, cB = 0;
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      tA = ((e.clientY - (r.top + r.height / 2)) / r.height) * 0.9;
      tB = ((e.clientX - (r.left + r.width / 2)) / r.width) * 0.9;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let hover = false;
    cv.addEventListener("pointerenter", () => (hover = true));
    cv.addEventListener("pointerleave", () => (hover = false));

    let visible = true;
    const io = new IntersectionObserver(
      (es) => (visible = es[0].isIntersecting),
      { threshold: 0 },
    );
    io.observe(cv);

    // мягкое RGB-смещение по каналам (glitch)
    const drawLayer = (
      grid: string[],
      shade: number[],
      offX: number,
      tint: string | null,
      jitter: boolean,
    ) => {
      const ox = w / 2 + offX;
      const oy = h / 2;
      const gx = -(cols * CW) / 2 + CW / 2;
      const gy = -(rows * CH) / 2 + CH / 2;
      for (let j = 0; j < rows; j++) {
        const jx = jitter && Math.random() < 0.12 ? (Math.random() - 0.5) * 10 : 0;
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i;
          const ch = grid[idx];
          if (!ch || ch === " ") continue;
          const ln = shade[idx];
          if (tint) {
            ctx.fillStyle = tint;
            ctx.globalAlpha = 0.5 * (0.35 + 0.65 * ln);
          } else {
            const m = Math.min(1, Math.max(0, (ln - 0.2) / 0.8));
            const r = Math.round(238 + (243 - 238) * m);
            const g = Math.round(78 + (241 - 78) * m);
            const b = Math.round(78 + (236 - 78) * m);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.globalAlpha = 0.4 + 0.6 * ln;
          }
          ctx.fillText(ch, ox + gx + i * CW + jx, oy + gy + j * CH);
        }
      }
      ctx.globalAlpha = 1;
    };

    const render = (A: number, B: number, glitch: boolean) => {
      const grid: string[] = new Array(cols * rows).fill(" ");
      const shade: number[] = new Array(cols * rows).fill(0);
      const zbuf: number[] = new Array(cols * rows).fill(0);

      const R1 = 1, R2 = 2.1;
      const K1 = Math.min(cols * CW, rows * CH) * 0.42; // масштаб под блок
      const K2 = 5.2;
      const cA2 = Math.cos(A), sA2 = Math.sin(A), cB2 = Math.cos(B), sB2 = Math.sin(B);

      for (let theta = 0; theta < 6.283; theta += 0.07) {
        const ct = Math.cos(theta), st = Math.sin(theta);
        for (let phi = 0; phi < 6.283; phi += 0.02) {
          const cp = Math.cos(phi), sp = Math.sin(phi);
          const cx = R2 + R1 * ct, cy = R1 * st;
          const x = cx * (cB2 * cp + sA2 * sB2 * sp) - cy * cA2 * sB2;
          const y = cx * (sB2 * cp - sA2 * cB2 * sp) + cy * cA2 * cB2;
          const z = K2 + cA2 * cx * sp + cy * sA2;
          const ooz = 1 / z;
          const xp = Math.floor(cols / 2 + (K1 / CW) * ooz * x);
          const yp = Math.floor(rows / 2 - (K1 / CH) * ooz * y);
          const lum =
            cp * ct * sB2 - cA2 * ct * sp - sA2 * st +
            cB2 * (cA2 * st - ct * sA2 * sp);
          if (lum > 0 && xp >= 0 && xp < cols && yp >= 0 && yp < rows) {
            const idx = xp + yp * cols;
            if (ooz > zbuf[idx]) {
              zbuf[idx] = ooz;
              const li = Math.floor(lum * 8);
              grid[idx] = RAMP[Math.max(0, Math.min(RAMP.length - 1, li))];
              shade[idx] = Math.min(1, lum / 1.4);
            }
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      if (glitch) {
        drawLayer(grid, shade, -3, "#ff6a5a", true);
        drawLayer(grid, shade, 3, "#3fd8d0", true);
      }
      drawLayer(grid, shade, 0, null, false);
    };

    let raf = 0, startT = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (!startT) startT = now;
      const tt = (now - startT) / 1000;
      cA += (tA - cA) * 0.06;
      cB += (tB - cB) * 0.06;
      // наклон ¾ фиксирован (видно отверстие) + parallax; вращение вокруг вертикали
      render(0.55 + cA * 0.5, tt * 0.6 + cB, hover);
    };

    if (reduce) render(0.62, 1.1, false);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, [reduce]);

  return (
    <section className={`${styles.coda} wrap`} aria-hidden="true">
      <canvas ref={ref} className={styles.canvas} />
      <div className={styles.sign}>
        <span className={styles.mark}>SHULGIN</span>
        <span className={styles.dot}>·</span>
        <span>NFA</span>
        <span className={styles.dot}>·</span>
        <span>2026</span>
        <span className={styles.tag}>{t.coda_tag}</span>
      </div>
    </section>
  );
}
