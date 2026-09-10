import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useI18n } from "../i18n/I18nContext";
import { liveNodes, liveEdges } from "../data/live";
import styles from "./HeroObject.module.css";

type SceneNode = (typeof liveNodes)[number] & { x: number; y: number; z: number };
type Proj = { sx: number; sy: number; z: number; persp: number };
type ImpulseSlot = { active: boolean; edge: number; start: number };

declare global {
  interface Window {
    __pultDebug?: { id: string; sx: number; sy: number }[];
  }
}

/* Deterministic layout: three compact clusters standing in a triangle
   (trading top-left, products top-right, sites bottom-center). Each cluster
   is a hub at its center with the rest on an even ring around it - tuned so
   in-cluster spacing stays 0.22-0.30 and every cluster's own footprint stays
   near ~0.27 of the [-1,1] space the projection expects, so cross-cluster
   edges (all of them run product-nodes -> store) stay short instead of
   crossing the whole canvas. A fixed table, no Math.random - the map looks
   the same shape on every reload. */
const POS: Record<string, [number, number, number]> = {
  trading: [-0.4, -0.32, 0.1636],
  "t-backbone": [-0.1421, -0.2402, -0.1068],
  "t-exec": [-0.3962, -0.05, 0.134],
  "t-mm": [-0.6556, -0.2329, -0.0162],
  "t-research": [-0.5618, -0.5362, 0.0297],
  "t-calib": [-0.2444, -0.5407, -0.0065],
  "content-factory": [0.34, -0.24, -0.1836],
  "setup-manager": [0.61, -0.24, -0.1444],
  "living-canvas": [0.475, -0.0062, -0.1591],
  qwerty: [0.205, -0.0062, 0.162],
  "site-check": [0.07, -0.24, -0.0278],
  "job-search-agents": [0.205, -0.4738, 0.1182],
  "agi-demo": [0.475, -0.4738, -0.0826],
  store: [0.0, 0.36, 0.0001],
  horsesfarm: [-0.0073, 0.6099, -0.0433],
  tanyabunina: [-0.2128, 0.2287, 0.1976],
  me4tut: [0.2201, 0.2414, -0.0885],
};

/* Visual hubs - one per cluster, permanently labeled and drawn larger. Note:
   content-factory is a hub only visually (layout anchor + label), it's still
   a plain "system" in data/live.ts. */
const HUBS = new Set(["trading", "content-factory", "store"]);

const CLUSTER_LAYOUT: { group: "trading" | "products" | "sites"; cx: number; cy: number; radius: number }[] = [
  { group: "trading", cx: -0.4, cy: -0.32, radius: 0.27 },
  { group: "products", cx: 0.34, cy: -0.24, radius: 0.27 },
  { group: "sites", cx: 0.0, cy: 0.36, radius: 0.25 },
];

const FONT_MONO = '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace';

/* Deterministic pseudo-random in [0,1) from a seed number - drives impulse
   scheduling, edge pick and ghost path choices. No Math.random in this file. */
function pick01(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

/* Small silhouette: semicircle head + three wavy scallops for a bottom,
   two eye dots (or two closed-eye dashes while blinking). Pure path, no assets. */
function drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, blinking: boolean) {
  const r = 7;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.15, r, Math.PI, 0, false);
  ctx.lineTo(x + r, y + r * 0.55);
  const waveW = (2 * r) / 3;
  for (let i = 0; i < 3; i++) {
    const startX = x + r - i * waveW;
    const midX = startX - waveW / 2;
    const endX = startX - waveW;
    ctx.quadraticCurveTo(midX, y + r * 0.95, endX, y + r * 0.55);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(243,241,236,0.85)";
  ctx.fill();
  if (blinking) {
    ctx.strokeStyle = "#0b0b0c";
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.08); ctx.lineTo(x - r * 0.18, y - r * 0.08); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + r * 0.18, y - r * 0.08); ctx.lineTo(x + r * 0.5, y - r * 0.08); ctx.stroke();
  } else {
    ctx.fillStyle = "#0b0b0c";
    ctx.beginPath(); ctx.arc(x - r * 0.34, y - r * 0.08, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * 0.34, y - r * 0.08, 1.1, 0, Math.PI * 2); ctx.fill();
  }
}

/* "The console": a map of real running systems, not decoration. Nodes =
   liveNodes, edges = real relationships (shared infra, shared editor, sold
   through the storefront). Static layout, the camera rotates around it; a
   pulse walks an edge every few seconds and a small ghost patrols the graph.
   Reads as "a fleet of systems, connected, running unattended". Pure canvas. */
export function HeroObject() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { t, lang } = useI18n();
  const tRef = useRef(t);
  const langRef = useRef(lang);
  useEffect(() => { tRef.current = t; langRef.current = lang; }, [t, lang]);

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    const tooltip = tooltipRef.current;
    if (!cv || !wrap || !tooltip) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const nodes: SceneNode[] = liveNodes.map((n) => {
      const p = POS[n.id] ?? [0, 0, 0];
      return { ...n, x: p[0], y: p[1], z: p[2] };
    });
    const N = nodes.length;
    const idIndex = new Map(nodes.map((n, i) => [n.id, i]));
    const edgesIdx: [number, number][] = [];
    for (const [a, b] of liveEdges) {
      const ai = idIndex.get(a);
      const bi = idIndex.get(b);
      if (ai === undefined || bi === undefined) continue;
      edgesIdx.push([ai, bi]);
    }
    const adjacency: number[][] = nodes.map(() => []);
    for (const [ai, bi] of edgesIdx) { adjacency[ai].push(bi); adjacency[bi].push(ai); }

    // Cluster group captions ("TRADING · 6") - counts read from liveNodes, not hardcoded.
    const clusters = CLUSTER_LAYOUT.map((c) => ({
      ...c,
      count: nodes.filter((n) => n.group === c.group).length,
    }));

    // Reused every frame - never reallocated.
    const proj: Proj[] = nodes.map(() => ({ sx: 0, sy: 0, z: 0, persp: 0 }));

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let tx = 0, ty = 0, mx = 0, my = 0;
    let hoverIndex = -1;

    const FIXED_T = 0.8;
    let lastDebugT = -1;

    const impulseSlots: ImpulseSlot[] = [
      { active: false, edge: 0, start: 0 },
      { active: false, edge: 0, start: 0 },
    ];
    let impulseCounter = 0;
    let nextImpulseAt = 2.5 + pick01(0.5) * 1.5;

    let ghostFrom = 0, ghostPrev = -1, ghostTo = 0;
    let ghostPhase: "wait" | "move" = "wait";
    let ghostLegStart = 0, ghostLegDur = 0.6, ghostBlinkAt = 0.75, ghostCounter = 0;

    const positionTooltip = (sx: number, sy: number) => {
      // Flip to the left of the node if the label would run off the right edge.
      const tw = tooltip.offsetWidth || 160;
      const x = sx + 12 + tw > w ? sx - tw - 12 : sx + 12;
      tooltip.style.transform = `translate(${x.toFixed(1)}px, ${(sy - 30).toFixed(1)}px)`;
    };

    // Same left/right flip for canvas-drawn permanent hub labels. A small
    // backing plate keeps them legible when a neighbor node/edge lands
    // right behind the text (the compact clusters put ring-nodes close by).
    const drawEdgeAwareLabel = (text: string, sx: number, sy: number, size: number, color: string) => {
      ctx.font = `${size}px ${FONT_MONO}`;
      const tw = ctx.measureText(text).width;
      const right = sx + 10 + tw <= w;
      const tx2 = right ? sx + 10 : sx - 10 - tw;
      ctx.fillStyle = "rgba(11,11,12,0.72)";
      ctx.fillRect(tx2 - 3, sy - size * 0.75, tw + 6, size * 1.5);
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.fillText(text, tx2, sy + size * 0.35);
    };

    const draw = (t: number) => {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      const ry = reduce ? 0.5 : t * 0.06 + mx * 1.1;
      const rx = reduce ? 0.12 : Math.sin(t * 0.1) * 0.18 + my * 1.1;
      const cosX = Math.cos(rx), sinX = Math.sin(rx), cosY = Math.cos(ry), sinY = Math.sin(ry);
      // Same scale/position as the original network: right column, centered in canvas.
      const R = Math.min(w, h) * 0.42, cx = w * 0.5, cy = h * 0.42;
      const focal = 620;

      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const persp = focal / (focal + z2 * R);
        const pr = proj[i];
        pr.sx = cx + x1 * R * persp;
        pr.sy = cy + y2 * R * persp;
        pr.z = z2;
        pr.persp = persp;
      }

      ctx.clearRect(0, 0, w, h);

      // Quiet dashed ring + group caption under each cluster - explains the
      // grouping without needing hover. Projected as a simple screen-space
      // circle at the cluster's own depth (a decorative approximation, not a
      // true rotated ellipse - good enough at this scale).
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = "rgba(238,78,78,0.18)";
      ctx.lineWidth = 1;
      for (const c of clusters) {
        const x1 = c.cx * cosY - 0 * sinY;
        const z1 = c.cx * sinY + 0 * cosY;
        const y2 = c.cy * cosX - z1 * sinX;
        const z2 = c.cy * sinX + z1 * cosX;
        const persp = focal / (focal + z2 * R);
        const csx = cx + x1 * R * persp, csy = cy + y2 * R * persp;
        const cr = (c.radius + 0.06) * R * persp;
        ctx.beginPath();
        ctx.arc(csx, csy, cr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `10px ${FONT_MONO}`;
        ctx.fillStyle = "rgba(154,150,143,0.45)";
        ctx.textAlign = "center";
        ctx.fillText(c.group.toUpperCase(), csx, csy + cr + 16);
        ctx.setLineDash([2, 4]);
      }
      ctx.restore();

      ctx.lineWidth = 1.2;
      for (const [ai, bi] of edgesIdx) {
        const pa = proj[ai], pb = proj[bi];
        const depthT = ((pa.z + pb.z) / 2 + 1) / 2;
        const alpha = 0.35 + depthT * 0.4;
        ctx.strokeStyle = `rgba(238,78,78,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }

      if (!reduce) {
        if (t >= nextImpulseAt) {
          const slot = impulseSlots.find((s) => !s.active);
          if (slot && edgesIdx.length > 0) {
            const edge = Math.floor(pick01(impulseCounter * 7.13 + 1) * edgesIdx.length) % edgesIdx.length;
            slot.active = true; slot.edge = edge; slot.start = t;
          }
          impulseCounter++;
          nextImpulseAt = t + 2.5 + pick01(impulseCounter * 3.71 + 9) * 1.5;
        }
        for (const slot of impulseSlots) {
          if (!slot.active) continue;
          const p = (t - slot.start) / 0.9;
          if (p >= 1) { slot.active = false; continue; }
          const [ai, bi] = edgesIdx[slot.edge];
          const pa = proj[ai], pb = proj[bi];
          for (let k = 0; k < 4; k++) {
            const pk = Math.max(0, p - k * 0.055);
            const ek = 1 - Math.pow(1 - pk, 3);
            const hx = pa.sx + (pb.sx - pa.sx) * ek;
            const hy = pa.sy + (pb.sy - pa.sy) * ek;
            const a = k === 0 ? 0.95 : 0.95 * (1 - k / 4);
            ctx.fillStyle = `rgba(238,78,78,${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(hx, hy, k === 0 ? 2 : 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      for (let i = 0; i < N; i++) {
        const n = nodes[i], p = proj[i];
        const isHub = HUBS.has(n.id);
        const isHover = i === hoverIndex;
        let ringR: number;
        if (n.kind === "sub") {
          ctx.fillStyle = "rgba(154,150,143,0.85)";
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 2.5, 0, Math.PI * 2); ctx.fill();
          ringR = 2.5;
        } else if (n.kind === "site") {
          const s = isHub ? 7 : 5;
          ctx.fillStyle = "rgba(243,241,236,0.92)";
          ctx.fillRect(p.sx - s / 2, p.sy - s / 2, s, s);
          ringR = s * 0.75;
        } else {
          const r = isHub ? 5 : 3.5;
          ctx.fillStyle = "rgba(243,241,236,0.92)";
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(238,78,78,0.85)";
          ctx.lineWidth = isHub ? 1.5 : 1;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, r + 1.6, 0, Math.PI * 2); ctx.stroke();
          ringR = r + 1.6;
        }
        if (isHover) {
          ctx.save();
          ctx.shadowColor = "rgba(238,78,78,0.55)";
          ctx.shadowBlur = 8;
          ctx.strokeStyle = "rgba(238,78,78,1)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, ringR + 3, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
        // Trading / content-factory / store stay labeled even without hover -
        // the three anchors that explain the map at a glance.
        if (isHub) {
          drawEdgeAwareLabel(n.name[langRef.current], p.sx, p.sy, 11, "rgba(154,150,143,0.75)");
        }
      }

      if (!reduce) {
        if (ghostPhase === "wait") {
          if (t - ghostLegStart >= 1.5) {
            const all = adjacency[ghostFrom];
            const cands = all.filter((idx) => idx !== ghostPrev);
            const pool = cands.length > 0 ? cands : all;
            if (pool.length > 0) {
              const nextIdx = pool[Math.floor(pick01(ghostCounter * 5.19 + 3) * pool.length) % pool.length];
              const dx = proj[ghostFrom].sx - proj[nextIdx].sx, dy = proj[ghostFrom].sy - proj[nextIdx].sy;
              ghostTo = nextIdx;
              ghostLegDur = Math.max(0.3, Math.sqrt(dx * dx + dy * dy) / 40);
              ghostPhase = "move";
              ghostLegStart = t;
            } else {
              ghostLegStart = t;
            }
            ghostCounter++;
          }
        } else {
          const p = Math.min(1, (t - ghostLegStart) / ghostLegDur);
          if (p >= 1) {
            ghostPrev = ghostFrom;
            ghostFrom = ghostTo;
            ghostPhase = "wait";
            ghostLegStart = t;
            ghostBlinkAt = t + 0.6 + pick01(ghostCounter * 2.63 + 5) * 0.5;
          }
        }
        let gx: number, gy: number, blinking = false;
        if (ghostPhase === "wait") {
          gx = proj[ghostFrom].sx; gy = proj[ghostFrom].sy;
          blinking = Math.abs(t - ghostBlinkAt) < 0.06;
        } else {
          const p = Math.min(1, (t - ghostLegStart) / ghostLegDur);
          const ease = 1 - Math.pow(1 - p, 3);
          gx = proj[ghostFrom].sx + (proj[ghostTo].sx - proj[ghostFrom].sx) * ease;
          gy = proj[ghostFrom].sy + (proj[ghostTo].sy - proj[ghostFrom].sy) * ease;
        }
        drawGhost(ctx, gx, gy, blinking);
      }

      if (hoverIndex !== -1) positionTooltip(proj[hoverIndex].sx, proj[hoverIndex].sy);

      if (import.meta.env.DEV && t - lastDebugT >= 1) {
        lastDebugT = t;
        window.__pultDebug = nodes.map((n, i) => ({ id: n.id, sx: Math.round(proj[i].sx), sy: Math.round(proj[i].sy) }));
      }
    };

    const setHover = (idx: number) => {
      if (idx === hoverIndex) return;
      hoverIndex = idx;
      wrap.classList.toggle(styles.hover, idx !== -1);
      if (idx !== -1) {
        const n = nodes[idx];
        tooltip.textContent = `${n.name[langRef.current]} · ${tRef.current.node_kind[n.kind]} · ${n.since}`;
        tooltip.classList.add(styles.show);
        positionTooltip(proj[idx].sx, proj[idx].sy);
      } else {
        tooltip.classList.remove(styles.show);
      }
    };

    const hitTest = (clientX: number, clientY: number): number => {
      const r = cv.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return -1;
      const px = clientX - r.left, py = clientY - r.top;
      let best = -1, bestD2 = 24 * 24;
      for (let i = 0; i < N; i++) {
        const p = proj[i];
        const dx = p.sx - px, dy = p.sy - py;
        const d2 = dx * dx + dy * dy;
        if (d2 <= bestD2) { bestD2 = d2; best = i; }
      }
      return best;
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / r.width;
      ty = (e.clientY - (r.top + r.height / 2)) / r.height;
      setHover(hitTest(e.clientX, e.clientY));
      if (reduce) draw(FIXED_T);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onClick = (e: MouseEvent) => {
      const hit = hitTest(e.clientX, e.clientY);
      if (hit === -1) return;
      const anchor = nodes[hit].anchor;
      if (anchor.startsWith("#")) {
        location.hash = anchor;
        const el = document.getElementById(anchor.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.assign(anchor);
      }
    };
    window.addEventListener("click", onClick);

    const onResize = () => { resize(); if (reduce) draw(FIXED_T); };
    window.addEventListener("resize", onResize);

    let visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 });
    io.observe(cv);

    let raf = 0, startT = 0, lastDraw = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (!startT) startT = now;
      const active = hoverIndex !== -1 || impulseSlots.some((s) => s.active);
      const budget = active ? 1000 / 60 : 1000 / 30;
      if (now - lastDraw < budget) return;
      lastDraw = now;
      draw((now - startT) / 1000);
    };

    if (reduce) draw(FIXED_T);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      io.disconnect();
      delete window.__pultDebug;
    };
  }, [reduce]);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div ref={tooltipRef} className={styles.tooltip} aria-hidden="true" />
      <p className={styles.caption} aria-hidden="true">{t.scene_label} · {t.scene_hint}</p>
    </div>
  );
}
