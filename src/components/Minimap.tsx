import { useEffect, useRef, useState } from "react";
import { liveNodes, liveEdges } from "../data/live";
import { scrollToId } from "../lib/scroll";
import { useScrollSpy } from "../lib/useScrollSpy";
import styles from "./Minimap.module.css";

/* Same fixed table as HeroObject's POS (kept local on purpose - this widget
   only needs a static 2D read of the map, not the live scene). */
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
    /* показываем, когда hero ушёл из вьюпорта, и прячем у секции «Связь» и подвала:
       фиксированный угол иначе ложится на ячейки контактов слева внизу */
    const hero = document.getElementById("intro");
    const tail = document.getElementById("contact");
    if (!hero) return;
    let heroOut = false, tailIn = false;
    const apply = () => setVisible(heroOut && !tailIn);
    const ioHero = new IntersectionObserver(([entry]) => { heroOut = !entry.isIntersecting; apply(); }, { threshold: 0 });
    ioHero.observe(hero);
    let ioTail: IntersectionObserver | null = null;
    if (tail) {
      ioTail = new IntersectionObserver(([entry]) => { tailIn = entry.isIntersecting; apply(); }, { threshold: 0 });
      ioTail.observe(tail);
    }
    return () => { ioHero.disconnect(); ioTail?.disconnect(); };
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
