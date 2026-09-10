import { useEffect, useRef, useState } from "react";
import { liveNodes, liveEdges } from "../data/live";
import { scrollToId } from "../lib/scroll";
import { useScrollSpy } from "../lib/useScrollSpy";
import styles from "./Minimap.module.css";

/* Same fixed table as HeroObject's POS (kept local on purpose - this widget
   only needs a static 2D read of the map, not the live scene). */
const POS: Record<string, [number, number, number]> = {
  trading: [-0.35, -0.35, 0.2603],
  "t-backbone": [-0.2075, -0.6187, -0.1699],
  "t-exec": [-0.2419, 0.0663, 0.2132],
  "t-mm": [-0.792, -0.6365, -0.0258],
  "t-research": [0.2498, -0.4508, 0.0472],
  "t-calib": [-0.7684, 0.1861, -0.0103],
  "content-factory": [0.1385, -0.187, -0.2921],
  "setup-manager": [0.1172, 0.2387, -0.2298],
  "job-search-agents": [-0.2247, -0.1981, 0.1881],
  "living-canvas": [0.4227, -0.0826, -0.2531],
  qwerty: [-0.21, 0.3131, 0.2576],
  "site-check": [0.0135, -0.4815, -0.0442],
  "agi-demo": [0.4158, 0.3209, -0.1314],
  store: [0.58, 0.55, 0.0001],
  horsesfarm: [0.3108, 0.4171, -0.069],
  tanyabunina: [0.9877, 0.4314, 0.3144],
  me4tut: [0.31, 0.9944, -0.1408],
};

/* Fixed camera angle for consistency with HeroObject's reduced-motion pose. */
const RY = 0.5, RX = 0.12;

/* Corner map that lights up the current section's cluster: appears once the
   hero has scrolled out of view, click jumps back to it. Static 2D read of
   the same live-systems graph as HeroObject, not animated. */
export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const active = useScrollSpy(["intro", "works", "projects", "websites", "contact"]);

  useEffect(() => {
    const hero = document.getElementById("intro");
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const activeGroups: Set<string> =
      active === "works" || active === "projects" ? new Set(["trading", "products"]) :
      active === "websites" ? new Set(["sites"]) :
      new Set();

    const size = 120;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cosX = Math.cos(RX), sinX = Math.sin(RX), cosY = Math.cos(RY), sinY = Math.sin(RY);
    const R = size * 0.42, cx = size / 2, cy = size / 2, focal = 620;

    const proj = liveNodes.map((n) => {
      const [x, y, z] = POS[n.id] ?? [0, 0, 0];
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const persp = focal / (focal + z2 * R);
      return { sx: cx + x1 * R * persp, sy: cy + y2 * R * persp, group: n.group };
    });
    const idIndex = new Map(liveNodes.map((n, i) => [n.id, i]));

    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(154,150,143,0.32)";
    for (const [a, b] of liveEdges) {
      const ai = idIndex.get(a), bi = idIndex.get(b);
      if (ai === undefined || bi === undefined) continue;
      const pa = proj[ai], pb = proj[bi];
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy);
      ctx.lineTo(pb.sx, pb.sy);
      ctx.stroke();
    }
    for (const p of proj) {
      const on = activeGroups.has(p.group);
      ctx.fillStyle = on ? "rgba(238,78,78,0.95)" : "rgba(154,150,143,0.7)";
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, on ? 2.6 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [active]);

  return (
    <div
      className={`${styles.minimap} ${visible ? styles.show : ""}`}
      aria-hidden="true"
      onClick={() => scrollToId("intro")}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
