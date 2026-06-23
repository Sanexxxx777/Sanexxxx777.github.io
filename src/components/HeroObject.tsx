import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./HeroObject.module.css";

type Node = { x: number; y: number; z: number; vx: number; vy: number; vz: number };

/* Living wireframe network: nodes drift in 3D, edges form/break by proximity.
   Reads as "connected systems / infrastructure", not a generic globe. Pure canvas, no deps. */
export function HeroObject() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const N = 46;
    const rand = () => Math.random() * 2 - 1;
    const nodes: Node[] = Array.from({ length: N }, () => ({
      x: rand(), y: rand(), z: rand(),
      vx: rand() * 0.0013, vy: rand() * 0.0013, vz: rand() * 0.0013,
    }));
    const D2 = 0.7 * 0.7; // squared connection threshold

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
    window.addEventListener("resize", resize);

    let tx = 0, ty = 0, mx = 0, my = 0;
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / r.width;
      ty = (e.clientY - (r.top + r.height / 2)) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 });
    io.observe(cv);

    const draw = (t: number) => {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.z += n.vz;
        if (n.x < -1 || n.x > 1) n.vx *= -1;
        if (n.y < -1 || n.y > 1) n.vy *= -1;
        if (n.z < -1 || n.z > 1) n.vz *= -1;
      }
      const ry = t * 0.12 + mx * 1.1;
      const rx = Math.sin(t * 0.1) * 0.18 + my * 1.1;
      const cosX = Math.cos(rx), sinX = Math.sin(rx), cosY = Math.cos(ry), sinY = Math.sin(ry);
      const R = Math.min(w, h) * 0.42, cx = w * 0.5, cy = h * 0.5;

      const proj = nodes.map((n) => {
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const persp = 620 / (620 + z2 * R);
        return { sx: cx + x1 * R * persp, sy: cy + y2 * R * persp, z: z2, persp };
      });

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

    let raf = 0, startT = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (!startT) startT = now;
      draw((now - startT) / 1000);
    };

    if (reduce) draw(0.8);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, [reduce]);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
