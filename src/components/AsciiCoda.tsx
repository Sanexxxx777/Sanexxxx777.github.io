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
    // Per-frame grids: allocated once per size (see resize), refilled every frame.
    // Float64 keeps the depth/shade maths bit-identical to plain number arrays.
    let grid = new Uint8Array(0);      // RAMP index + 1, 0 = empty cell
    let shade = new Float64Array(0);
    let zbuf = new Float64Array(0);

    // Time-independent trig: the same accumulated angles the render loops used, computed once.
    const R1 = 1, R2 = 2.1;
    const thetas: number[] = [], phis: number[] = [];
    for (let theta = 0; theta < 6.283; theta += 0.07) thetas.push(theta);
    for (let phi = 0; phi < 6.283; phi += 0.02) phis.push(phi);
    const ctT = Float64Array.from(thetas, Math.cos), stT = Float64Array.from(thetas, Math.sin);
    const cpT = Float64Array.from(phis, Math.cos), spT = Float64Array.from(phis, Math.sin);
    const cxT = Float64Array.from(ctT, (c) => R2 + R1 * c);   // torus centre-circle x
    const cyT = Float64Array.from(stT, (v) => R1 * v);        // torus centre-circle y

    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / CW);
      rows = Math.floor(h / CH);
      const n = Math.max(0, cols * rows);
      if (grid.length !== n) {
        grid = new Uint8Array(n);
        shade = new Float64Array(n);
        zbuf = new Float64Array(n);
      }
      ctx.font = `${FONT}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
    };
    resize();
    // resize обнуляет битмап; в reduced-motion rAF-петли нет, перерисовываем вручную
    // безусловно: за экраном петля стоит по visible=false, а resize уже обнулил битмап
    const onResize = () => { resize(); render(0.62, 1.1, false); };
    window.addEventListener("resize", onResize);

    // курсор → целевой наклон (слушаем, только пока холст на экране; цель зажата в ±1 высоты/ширины)
    let tA = 0, tB = 0, cA = 0, cB = 0;
    const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
      const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
      if (!Number.isFinite(ny) || !Number.isFinite(nx)) return;
      tA = clamp1(ny) * 0.9;
      tB = clamp1(nx) * 0.9;
    };

    let hover = false;
    cv.addEventListener("pointerenter", () => (hover = true));
    cv.addEventListener("pointerleave", () => (hover = false));

    let io: IntersectionObserver | null = null;

    // мягкое RGB-смещение по каналам (glitch)
    const drawLayer = (
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
          const gi = grid[idx];
          if (!gi) continue;
          const ch = RAMP[gi - 1];
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
      grid.fill(0);
      shade.fill(0);
      zbuf.fill(0);

      const K1 = Math.min(cols * CW, rows * CH) * 0.42; // масштаб под блок
      const K2 = 5.2;
      const cA2 = Math.cos(A), sA2 = Math.sin(A), cB2 = Math.cos(B), sB2 = Math.sin(B);

      const kx = K1 / CW, ky = K1 / CH;
      for (let ti = 0; ti < thetas.length; ti++) {
        const ct = ctT[ti], st = stT[ti], cx = cxT[ti], cy = cyT[ti];
        for (let pi = 0; pi < phis.length; pi++) {
          const cp = cpT[pi], sp = spT[pi];
          const x = cx * (cB2 * cp + sA2 * sB2 * sp) - cy * cA2 * sB2;
          const y = cx * (sB2 * cp - sA2 * cB2 * sp) + cy * cA2 * cB2;
          const z = K2 + cA2 * cx * sp + cy * sA2;
          const ooz = 1 / z;
          const xp = Math.floor(cols / 2 + kx * ooz * x);
          const yp = Math.floor(rows / 2 - ky * ooz * y);
          const lum =
            cp * ct * sB2 - cA2 * ct * sp - sA2 * st +
            cB2 * (cA2 * st - ct * sA2 * sp);
          if (lum > 0 && xp >= 0 && xp < cols && yp >= 0 && yp < rows) {
            const idx = xp + yp * cols;
            if (ooz > zbuf[idx]) {
              zbuf[idx] = ooz;
              const li = Math.floor(lum * 8);
              grid[idx] = Math.max(0, Math.min(RAMP.length - 1, li)) + 1;
              shade[idx] = Math.min(1, lum / 1.4);
            }
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      if (glitch) {
        drawLayer(-3, "#ff6a5a", true);
        drawLayer(3, "#3fd8d0", true);
      }
      drawLayer(0, null, false);
    };

    let raf = 0, startT = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!startT) startT = now;
      const tt = (now - startT) / 1000;
      cA += (tA - cA) * 0.06;
      cB += (tB - cB) * 0.06;
      // наклон ¾ фиксирован (видно отверстие) + parallax; вращение вокруг вертикали
      render(0.55 + cA * 0.5, tt * 0.6 + cB, hover);
    };

    if (reduce) {
      render(0.62, 1.1, false);
    } else {
      // The loop (and the pointer listener) exist only while the canvas is on screen:
      // off-screen the rAF is cancelled, not left ticking; on entry it resumes (the
      // rotation clock is wall-time from startT, so the phase is unchanged).
      io = new IntersectionObserver((es) => {
        const on = es[es.length - 1].isIntersecting;
        if (on && !raf) {
          window.addEventListener("pointermove", onMove, { passive: true });
          raf = requestAnimationFrame(loop);
        } else if (!on && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          window.removeEventListener("pointermove", onMove);
          tA = 0; tB = 0; // no stale far-away target when it comes back
        }
      }, { threshold: 0 });
      io.observe(cv);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      io?.disconnect();
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
