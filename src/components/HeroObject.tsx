import { useEffect, useRef, type MutableRefObject } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./HeroObject.module.css";

type Node = { x: number; y: number; z: number; vx: number; vy: number; vz: number };
type Proj = { sx: number; sy: number; z: number; persp: number };
/* Hero hands the network a "pulse from this client point" callback through this ref (no globals). */
export type SignalRef = MutableRefObject<((clientX: number, clientY: number) => void) | null>;

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
const STILL_N = 36;          // node count of the phone's static frame (= the formula's floor)

/* CTA signal timing (s): head travels linearly, the edges it crosses brighten (ease-out) then fade. */
const SIG_TRAVEL = 0.65, SIG_RISE = 0.12, SIG_DECAY = 0.25, SIG_REDUCED_MS = 600;
const SIG_MIN_EDGES = 3, SIG_MAX_EDGES = 5;

/* cubic-bezier(0.16, 1, 0.3, 1) as a function of time (Newton on x, a few iterations is plenty) */
const easeOut = (() => {
  const x1 = 0.16, y1 = 1, x2 = 0.3, y2 = 1;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 6; i++) {
      const err = ((ax * s + bx) * s + cx) * s - x;
      const d = (3 * ax * s + 2 * bx) * s + cx;
      if (Math.abs(err) < 1e-5 || d === 0) break;
      s -= err / d;
    }
    return ((ay * s + by) * s + cy) * s;
  };
})();

function makeNodes(N: number): Node[] {
  const rng = mulberry32(SEED);
  const rand = () => rng() * 2 - 1;
  return Array.from({ length: N }, () => ({
    x: rand(), y: rand(), z: rand(),
    vx: rand() * SPEED, vy: rand() * SPEED, vz: rand() * SPEED,
  }));
}

function project(nodes: Node[], proj: Proj[], w: number, h: number, t: number, mx: number, my: number) {
  const ry = t * 0.12 + mx * 1.1;
  const rx = Math.sin(t * 0.1) * 0.18 + my * 1.1;
  const cosX = Math.cos(rx), sinX = Math.sin(rx), cosY = Math.cos(ry), sinY = Math.sin(ry);
  // Projection geometry is the original one: do not change R / focal / cx / cy.
  const R = Math.min(w, h) * 0.42, cx = w * 0.5, cy = h * 0.42;
  const focal = 620;
  for (let i = 0; i < nodes.length; i++) {
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
}

function drawNetwork(ctx: CanvasRenderingContext2D, w: number, h: number, nodes: Node[], proj: Proj[], t: number) {
  const N = nodes.length;
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
}

type Signal = { chain: number[]; t0: number; reduced: boolean };

/* Living wireframe network: nodes drift in 3D, edges form/break by proximity.
   Reads as "connected systems / infrastructure", not a generic globe. Pure canvas, no deps.
   All motion is time-based (dt), so speed does not depend on the display frame rate.
   <= 820 px: the animated canvas is hidden; a second small canvas holds ONE static frame of the
   same seeded network (N = 36), drawn once, redrawn only when its size changes. */
export function HeroObject({ signalRef }: { signalRef?: SignalRef }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null);
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
      nodes = makeNodes(N);
      proj = nodes.map(() => ({ sx: 0, sy: 0, z: 0, persp: 0 }));
    };

    let tx = 0, ty = 0, mx = 0, my = 0;
    const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return; // hidden (<= 820 px): no target, no 0-division
      const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;
      tx = clamp1(nx);
      ty = clamp1(ny);
    };

    /* ---- CTA signal: ONE chain of 3-5 currently existing edges, drawn inside the existing frame ---- */
    let sig: Signal | null = null;
    let sigTimer = 0;

    const pickChain = (px: number, py: number): number[] | null => {
      const adj: number[][] = Array.from({ length: N }, () => []);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          if (dx * dx + dy * dy + dz * dz <= D2) { adj[i].push(j); adj[j].push(i); }
        }
      }
      // "visible" = inside the canvas and clear of the faded mask edges
      const vis = (i: number, lo: number, hi: number) =>
        proj[i].sx >= w * lo && proj[i].sx <= w * hi && proj[i].sy >= h * 0.04 && proj[i].sy <= h * 0.96;
      const dist2 = (i: number) => (proj[i].sx - px) ** 2 + (proj[i].sy - py) ** 2;
      const starts: number[] = [];
      for (let i = 0; i < N; i++) if (adj[i].length && vis(i, 0.2, 0.88)) starts.push(i);
      starts.sort((a, b) => dist2(a) - dist2(b));
      for (const s of starts.slice(0, 6)) {
        const chain = [s];
        while (chain.length <= SIG_MAX_EDGES) {
          const cur = chain[chain.length - 1];
          let best = -1, bestD = -1;
          for (const nb of adj[cur]) {
            if (chain.includes(nb) || !vis(nb, 0.12, 0.92)) continue;
            const d = dist2(nb); // heads away from the CTA, into the network
            if (d > bestD) { bestD = d; best = nb; }
          }
          if (best < 0) break;
          chain.push(best);
        }
        if (chain.length - 1 >= SIG_MIN_EDGES) return chain;
      }
      return null;
    };

    // Cream head + cream-over-coral edges (animated); reduced motion: the chain recoloured solid coral.
    const drawSignal = (t: number) => {
      if (!sig) return;
      const { chain } = sig;
      const E = chain.length - 1;
      if (sig.reduced) {
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = "rgb(255,106,90)";
        ctx.beginPath();
        ctx.moveTo(proj[chain[0]].sx, proj[chain[0]].sy);
        for (let i = 1; i <= E; i++) ctx.lineTo(proj[chain[i]].sx, proj[chain[i]].sy);
        ctx.stroke();
        return;
      }
      const el = t - sig.t0;
      if (el >= SIG_TRAVEL + SIG_DECAY) { sig = null; return; }
      // cumulative on-screen length per edge: the head moves at constant screen speed
      const cum = [0];
      for (let i = 0; i < E; i++) {
        const a = proj[chain[i]], b = proj[chain[i + 1]];
        cum.push(cum[i] + Math.hypot(b.sx - a.sx, b.sy - a.sy));
      }
      const total = cum[E] || 1;
      const p = Math.min(1, el / SIG_TRAVEL);
      const head = p * total;
      for (let i = 0; i < E; i++) {
        const tEnter = (cum[i] / total) * SIG_TRAVEL;
        const tLeave = (cum[i + 1] / total) * SIG_TRAVEL;
        if (el < tEnter) continue;
        let k = easeOut((el - tEnter) / SIG_RISE);
        if (el > tLeave) k *= Math.max(0, 1 - (el - tLeave) / SIG_DECAY);
        if (k <= 0.001) continue;
        const a = proj[chain[i]], b = proj[chain[i + 1]];
        ctx.lineCap = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgba(255,106,90,${(0.32 * k).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = `rgba(243,241,236,${(0.95 * k).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      }
      ctx.lineCap = "butt";
      if (el <= SIG_TRAVEL) {
        let i = 0;
        while (i < E - 1 && head > cum[i + 1]) i++;
        const a = proj[chain[i]], b = proj[chain[i + 1]];
        const seg = cum[i + 1] - cum[i] || 1;
        const f = Math.min(1, Math.max(0, (head - cum[i]) / seg));
        const hx = a.sx + (b.sx - a.sx) * f, hy = a.sy + (b.sy - a.sy) * f;
        ctx.fillStyle = "rgba(255,106,90,0.28)";
        ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgb(243,241,236)";
        ctx.beginPath(); ctx.arc(hx, hy, 3.2, 0, Math.PI * 2); ctx.fill();
      }
    };

    const draw = (t: number, dt: number) => {
      // old easing 0.05 per 60 Hz frame, made frame-rate independent
      const k = 1 - Math.pow(0.95, dt * 60);
      mx += (tx - mx) * k;
      my += (ty - my) * k;
      if (!Number.isFinite(mx)) mx = 0;
      if (!Number.isFinite(my)) my = 0;
      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt; n.z += n.vz * dt;
        if (n.x < -1 || n.x > 1) n.vx *= -1;
        if (n.y < -1 || n.y > 1) n.vy *= -1;
        if (n.z < -1 || n.z > 1) n.vz *= -1;
      }
      project(nodes, proj, w, h, t, mx, my);
      drawNetwork(ctx, w, h, nodes, proj, t);
      drawSignal(t);
    };

    let raf = 0, last = 0, simT = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (w * h === 0) { last = 0; return; }
      const dt = last ? Math.min(MAX_DT, Math.max(0, (now - last) / 1000)) : 0;
      last = now;
      simT += dt;
      draw(simT, dt);
    };

    // Draw only while >= 15% of the canvas is on screen. Below that the rAF loop is cancelled
    // (no idle ticking) and resumes on re-entry with last = 0, so dt is 0 on the first frame.
    const io = new IntersectionObserver((es) => {
      const on = es[es.length - 1].intersectionRatio >= 0.15;
      if (reduce) return;
      if (on && !raf) { last = 0; raf = requestAnimationFrame(loop); }
      else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; last = 0; sig = null; }
    }, { threshold: [0, 0.15] });

    // Hover/focus on the primary CTA. One signal at a time; a request while one runs is ignored.
    const onSignal = (clientX: number, clientY: number) => {
      if (sig || !started || w * h === 0) return;
      if (!reduce && !raf) return; // network off screen / not running: nothing to answer with
      const r = cv.getBoundingClientRect();
      const chain = pickChain(clientX - r.left, clientY - r.top);
      if (!chain) return;
      if (reduce) {
        sig = { chain, t0: 0, reduced: true };
        draw(0.8, 0);
        sigTimer = window.setTimeout(() => { sig = null; draw(0.8, 0); }, SIG_REDUCED_MS);
      } else {
        sig = { chain, t0: simT, reduced: false };
      }
    };

    // Start after first paint so the h1 stays the LCP element and the main thread is free.
    let started = false;
    const start = () => {
      if (started) return;
      resize();
      if (w * h === 0) return; // hidden (<= 820 px): nothing to draw
      started = true;
      build();
      window.addEventListener("pointermove", onMove, { passive: true });
      io.observe(cv);
      cv.classList.add(styles.on);
      if (signalRef) signalRef.current = onSignal;
      if (reduce) draw(0.8, 0);
      // animated mode: the IntersectionObserver above starts the loop once the canvas is >= 15% visible
    };

    // Listens from mount: a page opened at <= 820 px starts once it is widened, and a resize
    // (it clears the bitmap) under reduced motion redraws the single static frame.
    const onResize = () => {
      if (!started) { start(); return; }
      resize();
      if (reduce) draw(0.8, 0);
    };
    window.addEventListener("resize", onResize);

    let idleId = 0, timerId = 0;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timerId = window.setTimeout(start, 300);
    }

    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(timerId);
      window.clearTimeout(sigTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      if (signalRef && signalRef.current === onSignal) signalRef.current = null;
      cv.classList.remove(styles.on);
    };
  }, [reduce, signalRef]);

  /* Phone identity: one static frame, no rAF, no pointer listener; only `resize` (redraw when the
     canvas size actually changed - mobile URL-bar scroll fires resize with the same size). */
  useEffect(() => {
    const cv = stillRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const mq = window.matchMedia("(max-width: 820px)");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let lw = 0, lh = 0;
    // Centre the frame on the h1 and tell the mask where that band is (style writes only: no layout, no shift).
    const place = () => {
      const hero = cv.parentElement, h1 = hero?.querySelector("h1");
      if (!hero || !h1) return;
      const hr = hero.getBoundingClientRect(), r = h1.getBoundingClientRect(), S = cv.getBoundingClientRect().height;
      if (!S) return;
      const a = r.top - hr.top - 6, b = r.bottom - hr.top + 6;
      const top = (a + b) / 2 - 0.42 * S; // the network's centre sits at 42% of the canvas height
      cv.style.top = `${top.toFixed(1)}px`;
      cv.style.setProperty("--band-a", `${(a - top).toFixed(1)}px`);
      cv.style.setProperty("--band-b", `${(b - top).toFixed(1)}px`);
    };
    const paint = () => {
      if (!mq.matches) return;
      place();
      const r = cv.getBoundingClientRect();
      const w = r.width, h = r.height;
      if (w * h === 0 || (w === lw && h === lh)) return;
      lw = w; lh = h;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const nodes = makeNodes(STILL_N);
      const proj: Proj[] = nodes.map(() => ({ sx: 0, sy: 0, z: 0, persp: 0 }));
      project(nodes, proj, w, h, 0.8, 0, 0); // the same frame the reduced-motion desktop shows
      drawNetwork(ctx, w, h, nodes, proj, 0.8);
      cv.classList.add(styles.stillOn);
    };
    window.addEventListener("resize", paint);
    document.fonts?.ready.then(() => { if (mq.matches) place(); }).catch(() => {}); // font swap moves the h1
    let idleId = 0, timerId = 0;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(paint, { timeout: 1200 });
    } else {
      timerId = window.setTimeout(paint, 300);
    }
    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(timerId);
      window.removeEventListener("resize", paint);
      cv.classList.remove(styles.stillOn);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
      <canvas ref={stillRef} className={styles.still} aria-hidden="true" />
    </>
  );
}
