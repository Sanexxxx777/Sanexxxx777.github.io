import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./HeroObject.module.css";

type Node = { x: number; y: number; z: number; vx: number; vy: number; vz: number };
type Proj = { sx: number; sy: number; z: number; persp: number };

/* Seeded PRNG (mulberry32): same composition on every load and every screenshot. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20261006;
const SPEED = 0.0013 * 60;   // old per-frame drift x 60 = units per second
const MAX_DT = 0.05;         // s; no jump after a tab switch or a long stall
const D2 = 0.7 * 0.7;        // squared connection threshold

/* Living wireframe network: nodes drift in 3D, edges form/break by proximity.
   Reads as "connected systems / infrastructure", not a generic globe. Pure canvas, no deps.
   All motion is time-based (dt), so speed does not depend on the display frame rate. */
export function HeroObject() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Built once, from the canvas size at start (not rebuilt on resize).
    let nodes: Node[] = [];
    let proj: Proj[] = [];
    let N = 0;
    const build = () => {
      N = Math.min(72, Math.max(36, Math.round(46 * (w * h) / (760 * 900))));
      const rng = mulberry32(SEED);
      const rand = () => rng() * 2 - 1;
      nodes = Array.from({ length: N }, () => ({
        x: rand(), y: rand(), z: rand(),
        vx: rand() * SPEED, vy: rand() * SPEED, vz: rand() * SPEED,
      }));
      proj = nodes.map(() => ({ sx: 0, sy: 0, z: 0, persp: 0 }));
    };

    let tx = 0, ty = 0, mx = 0, my = 0;
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / r.width;
      ty = (e.clientY - (r.top + r.height / 2)) / r.height;
    };

    let visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 });

    const draw = (t: number, dt: number) => {
      // old easing 0.05 per 60 Hz frame, made frame-rate independent
      const k = 1 - Math.pow(0.95, dt * 60);
      mx += (tx - mx) * k;
      my += (ty - my) * k;
      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt; n.z += n.vz * dt;
        if (n.x < -1 || n.x > 1) n.vx *= -1;
        if (n.y < -1 || n.y > 1) n.vy *= -1;
        if (n.z < -1 || n.z > 1) n.vz *= -1;
      }
      const ry = t * 0.12 + mx * 1.1;
      const rx = Math.sin(t * 0.1) * 0.18 + my * 1.1;
      const cosX = Math.cos(rx), sinX = Math.sin(rx), cosY = Math.cos(ry), sinY = Math.sin(ry);
      // Projection geometry is the original one: do not change R / focal / cx / cy.
      const R = Math.min(w, h) * 0.42, cx = w * 0.5, cy = h * 0.42;
      const focal = 620;

      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const persp = focal / (focal + z2 * R);
        const p = proj[i];
        p.sx = cx + x1 * R * persp;
        p.sy = cy + y2 * R * persp;
        p.z = z2;
        p.persp = persp;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i], bn = nodes[j];
          const dx = a.x - bn.x, dy = a.y - bn.y, dz = a.z - bn.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > D2) continue;
          const pa = proj[i], pb = proj[j];
          const closeness = 1 - d2 / D2;
          const shimmer = 0.72 + 0.28 * Math.sin(t * 1.5 + i * 0.7);
          const depth = 0.5 + 0.5 * (((pa.z + pb.z) / 2 + 1) / 2); // brighter floor for back edges
          const alpha = Math.max(0, closeness * 0.95 * shimmer * depth);
          ctx.strokeStyle = `rgba(238,78,78,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          ctx.stroke();
        }
      }
      for (const p of proj) {
        const a = 0.45 + 0.45 * ((p.z + 1) / 2);
        ctx.fillStyle = `rgba(243,241,236,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.persp * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf = 0, last = 0, simT = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) { last = 0; return; }
      const dt = last ? Math.min(MAX_DT, Math.max(0, (now - last) / 1000)) : 0;
      last = now;
      simT += dt;
      draw(simT, dt);
    };

    // Start after first paint so the h1 stays the LCP element and the main thread is free.
    let started = false;
    const start = () => {
      if (started) return;
      resize();
      if (w * h === 0) return; // hidden (<= 820 px): nothing to draw
      started = true;
      build();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onMove, { passive: true });
      io.observe(cv);
      cv.classList.add(styles.on);
      if (reduce) draw(0.8, 0);
      else raf = requestAnimationFrame(loop);
    };

    let idleId = 0, timerId = 0;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timerId = window.setTimeout(start, 300);
    }

    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(timerId);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      cv.classList.remove(styles.on);
    };
  }, [reduce]);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
