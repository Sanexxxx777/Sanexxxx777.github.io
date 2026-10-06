// Ghost emotion engine v3 — софт-3D маскот. Эталон: ~/.claude/skills/living-canvas/examples/ghost-emotions.js
// Правки движка вносить в эталон и копировать сюда (единый источник для портфолио и Setup Manager).
// @ts-nocheck
export function createGhostEmotions(canvas, opts) {
  // Логическое пространство 480×320: буфер больше → рисуем масштабом (резкость на retina при крупном CSS-размере).
  // opts.zoom (default 1) дополнительно ужимает логическое поле — тело крупнее в кадре; >1.25 клипает сальто/прыжки.
  const Z = (canvas.width / 480) * (opts.zoom || 1);
  const W = canvas.width / Z, H = canvas.height / Z;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let colors = opts.colors();
  let raf = 0, visible = true, destroyed = false;
  let mx = 0, my = -0.35;
  let wanderT = 0, wanderX = 0, wanderY = -0.35, lastPointer = 0;
  let driftT = 1400, driftX = 0, driftY = 0, driftTX = 0, driftTY = 0;
  let blink = 0, lastBlink = 0, nextBlink = 2500;
  let sparks = [], hearts = [], crumbs = [];
  let emote = null;
  let nextIdle = 4000 + Math.random() * 6000;
  let angryUntil = 0, angryHeat = 0;
  let clicks = [];
  let flipBurstDone = false;
  let flower = null, flDots = [];
  let wHappy = 0, wAngry = 0, wWide = 0, wBlush = 0;
  let sleeping = false, sleepSince = 0, lastZzz = 0, zzzs = [];
  let bx = 0, by = 0, gaze = null;

  // --- 3D параметры
  const RINGS = 26, SEGS = 52;
  const R = 59, TOPY = -78, HEMY = 58;      // модельные размеры (совпадают с v2 силуэтом)
  const FOC = 460, CAMD = 320;              // фокус и дистанция камеры
  const LGT = norm3([-0.45, -0.62, -0.62]); // свет сверху-слева-спереди
  const cy0 = H / 2 + H * 0.056;
  const headroom = Math.max(10, cy0 + TOPY - 14);
  const JUMP = Math.min(46, headroom), HOP = Math.min(15, headroom * 0.4);
  const SLEEP_AFTER = 50000, SLEEP_IN = 1200;   // мс бездействия до сна / длительность засыпания

  const IDLE_POOL = [
    ['wink', 2.3], ['lookAround', 3], ['bounce', 2],
    ['blush', 2], ['turn', 1.6], ['flip', 1], ['melt', 0.7], ['flower', 0.9], ['yawn', 1.3],
  ];
  const DUR = { wink: 750, lookAround: 1700, bounce: 950, blush: 2400,
                turn: 2100, flip: 1300, melt: 1900, surprise: 750, angry: 2600, yawn: 1900 };
  const FLD = { in: 700, fly: 7800, out: 700 };

  // Per-frame simulation is scaled by f = dt / FRAME. FRAME is the 60 Hz step the constants were tuned
  // for (the old fixed 16.7 decrement); frames within 1 ms of it snap to f = 1, so 60 Hz behaves exactly
  // as before and 120/144 Hz screens no longer run the simulation at 2x speed.
  const FRAME = 16.7;
  let f = 1, dtMs = FRAME, lastFrameT = 0;
  const kf = (k) => (f === 1 ? k : 1 - Math.pow(1 - k, f));   // per-frame easing factor, rate-independent

  // --- helpers
  function env(p) { return Math.sin(Math.PI * Math.min(1, Math.max(0, p))); }
  function easeIO(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function norm3(v) {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }
  function parseCol(col) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(col).trim());
    if (m) { const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    const r = /rgba?\(([^)]+)\)/.exec(String(col));
    if (r) { const q = r[1].split(',').map(Number); return [q[0], q[1], q[2]]; }
    return [128, 128, 128];
  }
  function desat(rgb, k) {  // k 0..1 к серому — убирает кислотность
    const g = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    return [lerp(rgb[0], g, k), lerp(rgb[1], g, k), lerp(rgb[2], g, k)];
  }
  function mix3(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
  function css3(rgb) { return 'rgb(' + (rgb[0] | 0) + ',' + (rgb[1] | 0) + ',' + (rgb[2] | 0) + ')'; }
  function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
  function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
  function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
  function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross3(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  // профиль тела: v 0(макушка)..1(подол); купол = сферический кап (округлая макушка)
  const DOMEH = (HEMY - TOPY) * 0.45;
  function profileR(v) {
    if (v < 0.45) return R * Math.sin((v / 0.45) * Math.PI / 2);
    return R * (1 + 0.05 * (v - 0.45));
  }
  function profileY(v) {
    if (v < 0.45) return TOPY + DOMEH * (1 - Math.cos((v / 0.45) * Math.PI / 2));
    return TOPY + DOMEH + (HEMY - TOPY - DOMEH) * ((v - 0.45) / 0.55);
  }

  // Body mesh buffers: allocated once, refilled every frame (no per-frame arrays/objects).
  const NV = RINGS * SEGS, NQ = (RINGS - 1) * SEGS;
  const vb = new Float64Array(NV * 3);   // rotated vertices
  const pb = new Float64Array(NV * 2);   // projected x, y
  const nb = new Float64Array(NQ * 3);   // raw quad normals
  const zq = new Float64Array(NQ);       // quad centre depth
  const cq = new Float64Array(NQ * 3);   // quad colour
  const order = new Array(NQ);           // draw order (back to front)
  const sinTh = new Float64Array(SEGS), cosTh = new Float64Array(SEGS);
  for (let j = 0; j < SEGS; j++) {
    const th = (j / SEGS) * Math.PI * 2;
    sinTh[j] = Math.sin(th); cosTh[j] = Math.cos(th);
  }
  const ringR = new Float64Array(RINGS), ringY = new Float64Array(RINGS);
  for (let i = 0; i < RINGS; i++) { ringR[i] = profileR(i / (RINGS - 1)); ringY[i] = profileY(i / (RINGS - 1)); }
  const byDepth = (a, b) => zq[b] - zq[a];

  function startEmote(name, t) {
    if (name === 'flower') { startFlower(t); if (opts.onMood) opts.onMood('flower'); return; }
    emote = { name, t0: t, dur: DUR[name] || 1000 };
    if (name === 'flip') flipBurstDone = false;
    if (name === 'angry') angryUntil = t + DUR.angry;
    if (opts.onMood) opts.onMood(name);
    if (reduced) { drawStatic(name); setTimeout(() => { if (!destroyed) drawStatic(null); }, 1200); }
  }

  function wake(t) {
    sleeping = false;
    startEmote('bounce', t);
  }

  function startFlower(t) {
    const side = Math.random() < 0.5 ? -1 : 1;
    flower = { phase: 'in', t0: t, side };
    flDots = [];
    const p0 = flowerPos(0.06, side);
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, r = 24 + Math.random() * 26;
      flDots.push({ fx: p0.x + Math.cos(a) * r, fy: p0.y + Math.sin(a) * r,
                    slot: i % 5, jitter: Math.random() });
    }
  }

  function flowerPos(u, side) {
    const x0 = side < 0 ? -30 : W + 30, x2 = side < 0 ? W + 30 : -30;
    const y0 = cy0 + TOPY - 22, y1 = Math.max(20, cy0 + TOPY - JUMP - 36), y2 = y0 + 10;
    const a = (1 - u) * (1 - u), bq = 2 * (1 - u) * u, c = u * u;
    return { x: a * x0 + bq * (W / 2) + c * x2, y: a * y0 + bq * y1 + c * y2 };
  }
  function edgeFade(x) { return clamp(Math.min(x, W - x) / 64, 0, 1); }

  // 3D-цветочек: 5 лепестков чашей в наклонённой вращающейся плоскости
  function drawFlower3D(x, y, t, alpha, scale) {
    const a = alpha * edgeFade(x);
    if (a <= 0.01) return;
    const spin = t * 0.0026;
    const tiltA = 1.02 + 0.16 * Math.sin(t * 0.0011);   // наклон оси от вертикали
    const wob = 0.35 * Math.sin(t * 0.00074);           // прецессия
    const petals = [];
    const CUP = 0.16;                                    // изгиб лепестка чашей
    for (let k = 0; k < 5; k++) {
      const beta = k * Math.PI * 2 / 5 + spin;
      const pts = [], NPT = 9;
      for (let i = 0; i < NPT; i++) {
        const phi = (i / NPT) * Math.PI * 2;
        const lx = Math.cos(phi) * 5.6, ly = 10 + Math.sin(phi) * 7.2;
        let p = [lx, ly, CUP * (lx * lx + (ly - 4) * (ly - 4)) * 0.06];
        p = rotZ(p, beta);
        p = rotX(p, tiltA);
        p = rotY(p, wob);
        pts.push(p);
      }
      let n = cross3(sub3(pts[3], pts[0]), sub3(pts[6], pts[0]));
      n = norm3(n);
      const zc = (pts[0][2] + pts[4][2]) / 2;
      petals.push({ pts, n, zc });
    }
    petals.sort((p, q) => q.zc - p.zc);                  // дальние первыми
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    for (const pt of petals) {
      const lit = 0.55 + 0.45 * Math.abs(dot3(pt.n, LGT));
      const base = mix3([255, 158, 184], [212, 92, 134], 1 - lit);
      ctx.globalAlpha = a * 0.96;
      ctx.fillStyle = css3(base);
      ctx.beginPath();
      pt.pts.forEach((p, i) => {
        const s = FOC / (FOC + p[2] + 40);
        if (i === 0) ctx.moveTo(p[0] * s, p[1] * s); else ctx.lineTo(p[0] * s, p[1] * s);
      });
      ctx.closePath();
      ctx.fill();
    }
    // сердцевина — маленькая «сфера»
    const cg = ctx.createRadialGradient(-1.2, -1.2, 0.4, 0, 0, 4.4);
    cg.addColorStop(0, '#ffe9b0');
    cg.addColorStop(1, '#d9a24e');
    ctx.globalAlpha = a;
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0, 0, 3.9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.3, y - s * 0.1, x - s * 0.6, y - s, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.6, y - s, x + s * 1.3, y - s * 0.1, x, y + s * 0.9);
    ctx.closePath();
  }

  function angerMark(x, y, t, heat) {
    ctx.save();
    ctx.translate(x, y);
    const ps = (1.25 + 0.14 * Math.sin(t * 0.02)) * Math.min(1, wAngry * 1.6);
    ctx.scale(ps, ps);
    ctx.globalAlpha = wAngry;
    ctx.strokeStyle = colors.anger;
    ctx.lineWidth = 3 + heat * 0.4;
    ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) {
      ctx.save();
      ctx.rotate(k * Math.PI / 2 + 0.4);
      ctx.beginPath();
      ctx.moveTo(2.5, -10 - heat);
      ctx.quadraticCurveTo(9 + heat, -9 - heat, 9.5 + heat, -3.5);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // точка на поверхности тела (модель) + её мировой transform
  function surfPoint(theta, v, hemAmp, hemPhase, yaw, pitch, sx, sy) {
    const r = profileR(v);
    let p = [r * Math.sin(theta), profileY(v), -r * Math.cos(theta)];
    if (v > 0.8) p[1] += Math.sin(3 * theta + hemPhase) * hemAmp * ((v - 0.8) / 0.2);
    p = [p[0] * sx, p[1] * sy, p[2] * sx];
    p = rotY(p, yaw);
    p = rotX(p, pitch);
    return p;
  }
  function project(p, cx, cy) {
    const s = FOC / (FOC + p[2] + CAMD);
    return { x: cx + p[0] * s, y: cy + p[1] * s, s };
  }

  function draw(t) {
    ctx.setTransform(Z, 0, 0, Z, 0, 0);
    ctx.clearRect(0, 0, W, H);
    let p = 0, name = emote ? emote.name : null;
    if (emote) {
      p = (t - emote.t0) / emote.dur;
      if (name === 'angry' && angryUntil > emote.t0 + emote.dur) {
        emote.dur = angryUntil - emote.t0;
        p = (t - emote.t0) / emote.dur;
      }
      if (p >= 1) { emote = null; name = null; p = 0; if (opts.onMood) opts.onMood(null); }
    }

    // --- цветочек: фазы (нужен раньше лица — призрак следит)
    let flPos = null;
    if (flower) {
      const fp = (t - flower.t0) / FLD[flower.phase];
      if (flower.phase === 'in') {
        flPos = flowerPos(0.06, flower.side);
        if (fp >= 1) flower = { phase: 'fly', t0: t, side: flower.side };
      } else if (flower.phase === 'fly') {
        flPos = flowerPos(easeIO(Math.min(1, fp)), flower.side);
        if (fp >= 1) {
          const last = flowerPos(1, flower.side);
          if (edgeFade(last.x) > 0.05) {              // распад виден только в кадре
            flDots = [];
            for (let i = 0; i < 14; i++) {
              const a = Math.random() * Math.PI * 2;
              flDots.push({ x: last.x, y: last.y, vx: Math.cos(a) * (0.6 + Math.random()),
                            vy: Math.sin(a) * 0.8 - 0.3, a: 1, r: 1.2 + Math.random() * 1.4 });
            }
            if (!emote) startEmote('melt', t);
          } else flDots = [];
          flower = { phase: 'out', t0: t, side: flower.side };
        }
      } else {
        flPos = null;
        if (fp >= 1) flower = null;
      }
    }

    // --- веса лица
    const happyT = (name === 'melt' || name === 'bounce') ? 1 : 0;
    const angryT = name === 'angry' ? 1 : 0;
    const wideT = name === 'surprise' ? 1 : 0;
    const blushT = name === 'blush' ? env(p) : name === 'melt' ? 0.9
                 : (flower && flower.phase === 'fly') ? 0.65 : 0;
    wHappy = lerp(wHappy, happyT, kf(0.10));
    wAngry = lerp(wAngry, angryT, kf(0.12));
    wWide = lerp(wWide, wideT, kf(0.16));
    wBlush = lerp(wBlush, blushT, kf(0.08));

    const sleepK = sleeping ? clamp((t - sleepSince) / SLEEP_IN, 0, 1) : 0;
    const bobY = sleeping
      ? lerp(Math.sin(t * 0.0011) * 9, Math.sin(t * 0.00047) * 3.4, sleepK)
      : Math.sin(t * 0.0011) * 9;
    let tilt = sleeping
      ? lerp(Math.sin(t * 0.0007) * 0.05 + mx * 0.06, 0, sleepK)
      : Math.sin(t * 0.0007) * 0.05 + mx * 0.06;
    let x = sleeping ? lerp(driftX, 0, sleepK) : driftX;
    let y = bobY + (sleeping ? lerp(driftY, 0, sleepK) : driftY);
    let sxA = 1, syA = 1;
    let yawE = 0, pitchE = 0;
    const heat = Math.min(3, angryHeat);

    if (name === 'wink') tilt += 0.07 * env(p);
    if (name === 'bounce') y -= Math.abs(Math.sin(p * Math.PI * 2)) * HOP;
    if (name === 'blush') { sxA = syA = 1 - 0.045 * env(p); y += 2 * env(p); }
    if (name === 'turn') yawE = easeIO(p) * Math.PI * 2;          // честный оборот
    if (name === 'flip') {
      const q = easeIO(p);
      y -= Math.sin(q * Math.PI) * JUMP;
      pitchE = -q * Math.PI * 2;                                   // честный кувырок
      syA = 1 - 0.10 * Math.sin(q * Math.PI * 2);
    }
    if (name === 'melt') { tilt += Math.sin(t * 0.008) * 0.04; syA = 1 + 0.02 * Math.sin(t * 0.01); }
    if (name === 'surprise') { y -= env(p) * Math.min(22, headroom * 0.55); syA = 1 + 0.06 * env(p); }
    if (name === 'angry') {
      x += Math.sin(t * 0.09) * (2 + heat) * env(Math.min(p * 3, 1));
      tilt += Math.sin(t * 0.05) * 0.02;
    }
    if (name === 'yawn') {
      const str = env(p);                 // тянется к пику и обратно за всю длительность
      sxA *= 1 - 0.055 * str;
      syA *= 1 + 0.05 * str;
      y -= 3 * str;
      if (p > 0.55 && p < 0.80) {          // микро-дрожь после пика — «отряхнулся»
        const sp = (p - 0.55) / 0.25;
        x += Math.sin(sp * Math.PI * 7) * 3 * (1 - sp);
      }
    }
    syA *= 1 + 0.008 * Math.sin(t * 0.00093);
    sxA *= 1 + 0.006 * Math.sin(t * 0.00093 + 1.2);

    // взгляд (курсор+nudge-биас / явная цель lookAt / цветочек / эмоции)
    let lookX = name === 'lookAround' ? Math.sin(p * Math.PI * 3) * 1.15
              : name === 'blush' ? -0.7 : mx + bx;
    let lookY = name === 'blush' ? 0.6 : my + by;
    const cx = W / 2 + x, cyB = cy0 + y;
    if (gaze) {
      if (t < gaze.until) {
        const relax = clamp((t - (gaze.until - 250)) / 250, 0, 1); // последние ~250мс — плавный возврат
        lookX = lerp(gaze.x, lookX, relax);
        lookY = lerp(gaze.y, lookY, relax);
      } else gaze = null;
    }
    if (flPos) {
      lookX = clamp((flPos.x - cx) / 150, -1.2, 1.2);
      lookY = clamp((flPos.y - (cyB + TOPY + 46)) / 110, -1.1, 1);
    }
    const yaw = yawE - lookX * (flPos ? 0.55 : 0.30);    // знак: yaw>0 визуально влево, поэтому минус — голова к курсору/цветку, не от них
    const pitch = pitchE + lookY * 0.05;
    const hemAmp = name === 'angry' ? 10 : name === 'surprise' ? 9 : 7;
    const hemPhase = t * (name === 'angry' ? 0.009 : 0.004);

    // тень
    const sh = Math.max(0.35, 1 - (cy0 - cyB + bobY) / 30 - bobY / 26);
    ctx.save();
    ctx.globalAlpha = 0.16 * sh;
    ctx.fillStyle = colors.ink;
    ctx.beginPath();
    ctx.ellipse(cx, H - Math.min(30, H * 0.1), 52 * sh, 8 * sh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- 3D-меш тела
    const baseA = desat(parseCol(wAngry > 0.5 ? colors.anger : colors.a), 0.18);
    const baseB = desat(parseCol(colors.b), 0.15);
    const dark = [Math.max(8, baseB[0] * 0.34), Math.max(8, baseB[1] * 0.34), Math.max(10, baseB[2] * 0.38)];

    // вершины (то же, что surfPoint: масштаб -> yaw -> pitch; sin/cos колец и углов посчитаны один раз)
    const cYaw = Math.cos(yaw), sYaw = Math.sin(yaw), cPit = Math.cos(pitch), sPit = Math.sin(pitch);
    for (let i = 0; i < RINGS; i++) {
      const v = i / (RINGS - 1), r = ringR[i], py0 = ringY[i];
      for (let j = 0; j < SEGS; j++) {
        let q0 = r * sinTh[j], q1 = py0, q2 = -r * cosTh[j];
        if (v > 0.8) q1 += Math.sin(3 * ((j / SEGS) * Math.PI * 2) + hemPhase) * hemAmp * ((v - 0.8) / 0.2);
        q0 *= sxA; q1 *= syA; q2 *= sxA;
        const y0 = q0 * cYaw + q2 * sYaw, y2 = -q0 * sYaw + q2 * cYaw;
        const o = (i * SEGS + j) * 3;
        vb[o] = y0;
        vb[o + 1] = q1 * cPit - y2 * sPit;
        vb[o + 2] = q1 * sPit + y2 * cPit;
      }
    }
    // квады; нормаль ориентируем наружу от оси тела (не зависим от винтинга)
    const axis = rotX([0, 1, 0], pitch);
    for (let i = 0; i < RINGS - 1; i++) {
      // 1-й проход: геометрия и сырые нормали кольца
      for (let j = 0; j < SEGS; j++) {
        const j2 = (j + 1) % SEGS;
        const a = (i * SEGS + j) * 3, b = ((i + 1) * SEGS + j) * 3, c = ((i + 1) * SEGS + j2) * 3, d = (i * SEGS + j2) * 3;
        const u0 = vb[b] - vb[a], u1 = vb[b + 1] - vb[a + 1], u2 = vb[b + 2] - vb[a + 2];
        const w0 = vb[c] - vb[a], w1 = vb[c + 1] - vb[a + 1], w2 = vb[c + 2] - vb[a + 2];
        let n0 = u1 * w2 - u2 * w1, n1 = u2 * w0 - u0 * w2, n2 = u0 * w1 - u1 * w0;
        const l = Math.hypot(n0, n1, n2) || 1;
        n0 /= l; n1 /= l; n2 /= l;
        const q0 = (vb[a] + vb[b] + vb[c] + vb[d]) / 4, q1 = (vb[a + 1] + vb[b + 1] + vb[c + 1] + vb[d + 1]) / 4,
              q2 = (vb[a + 2] + vb[b + 2] + vb[c + 2] + vb[d + 2]) / 4;
        const ad = q0 * axis[0] + q1 * axis[1] + q2 * axis[2];
        const rd0 = q0 - axis[0] * ad, rd1 = q1 - axis[1] * ad, rd2 = q2 - axis[2] * ad;
        if (n0 * rd0 + n1 * rd1 + n2 * rd2 < 0) { n0 = -n0; n1 = -n1; n2 = -n2; }
        const k = i * SEGS + j;
        nb[k * 3] = n0; nb[k * 3 + 1] = n1; nb[k * 3 + 2] = n2;
        zq[k] = q2;
      }
      // 2-й проход: сглаженная по соседям нормаль → плавный ламберт без фасеточных полос
      const vAvg = (i + 0.5) / (RINGS - 1);
      const g0 = lerp(baseA[0], baseB[0], vAvg), g1 = lerp(baseA[1], baseB[1], vAvg), g2 = lerp(baseA[2], baseB[2], vAvg);
      for (let j = 0; j < SEGS; j++) {
        const k = i * SEGS + j, kl = (i * SEGS + (j - 1 + SEGS) % SEGS) * 3, kr = (i * SEGS + (j + 1) % SEGS) * 3;
        const m0 = nb[k * 3], m1 = nb[k * 3 + 1], m2 = nb[k * 3 + 2];
        const back = m2 > 0;                              // изнанку решает СЫРАЯ нормаль
        let s0 = nb[kl] + 2 * m0 + nb[kr], s1 = nb[kl + 1] + 2 * m1 + nb[kr + 1], s2 = nb[kl + 2] + 2 * m2 + nb[kr + 2];
        const sl = Math.hypot(s0, s1, s2) || 1;
        s0 /= sl; s1 /= sl; s2 /= sl;
        const dl = s0 * LGT[0] + s1 * LGT[1] + s2 * LGT[2];
        const lit = Math.max(0, back ? -dl : dl);
        const kk = 0.42 + 0.58 * lit;                     // ламберт
        let c0 = lerp(dark[0], g0, kk), c1 = lerp(dark[1], g1, kk), c2 = lerp(dark[2], g2, kk);
        if (back) { c0 = lerp(c0, dark[0], 0.55); c1 = lerp(c1, dark[1], 0.55); c2 = lerp(c2, dark[2], 0.55); }  // внутренность юбки темнее
        cq[k * 3] = c0; cq[k * 3 + 1] = c1; cq[k * 3 + 2] = c2;
      }
    }
    for (let k = 0; k < NQ; k++) order[k] = k;            // исходный порядок: сортировка устойчива, как раньше
    order.sort(byDepth);

    ctx.save();
    ctx.translate(cx, cyB);
    ctx.rotate(tilt);
    ctx.translate(-cx, -cyB);
    // мягкое гало вокруг тела (вместо кислотного blur-шара)
    ctx.save();
    const gcol = desat(parseCol(wAngry > 0.5 ? colors.anger : colors.a), 0.25);
    const halo = ctx.createRadialGradient(cx, cyB - 6, R * 0.72, cx, cyB - 6, R * 1.7);
    halo.addColorStop(0, 'rgba(' + (gcol[0] | 0) + ',' + (gcol[1] | 0) + ',' + (gcol[2] | 0) + ',' + (0.14 + wAngry * heat * 0.05) + ')');
    halo.addColorStop(1, 'rgba(' + (gcol[0] | 0) + ',' + (gcol[1] | 0) + ',' + (gcol[2] | 0) + ',0)');
    ctx.fillStyle = halo;
    ctx.fillRect(cx - R * 1.8, cyB - 6 - R * 1.8, R * 3.6, R * 3.6);
    ctx.restore();

    // проекция каждой вершины один раз (раньше — по четыре раза на каждый квад)
    for (let k = 0; k < NV; k++) {
      const o = k * 3, sc = FOC / (FOC + vb[o + 2] + CAMD);
      pb[k * 2] = cx + vb[o] * sc; pb[k * 2 + 1] = cyB + vb[o + 1] * sc;
    }
    ctx.lineWidth = 1;
    for (let n = 0; n < NQ; n++) {
      const k = order[n], i = (k / SEGS) | 0, j = k - i * SEGS, j2 = (j + 1) % SEGS;
      const a = (i * SEGS + j) * 2, b = ((i + 1) * SEGS + j) * 2, c = ((i + 1) * SEGS + j2) * 2, d = (i * SEGS + j2) * 2;
      ctx.fillStyle = 'rgb(' + (cq[k * 3] | 0) + ',' + (cq[k * 3 + 1] | 0) + ',' + (cq[k * 3 + 2] | 0) + ')';
      ctx.strokeStyle = ctx.fillStyle;                    // шов-заполнитель против щелей
      ctx.beginPath();
      ctx.moveTo(pb[a], pb[a + 1]); ctx.lineTo(pb[b], pb[b + 1]); ctx.lineTo(pb[c], pb[c + 1]); ctx.lineTo(pb[d], pb[d + 1]);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    // --- лицо на поверхности (глаза θ=±0.42, v=0.30)
    const fw = Math.cos(yaw);                             // видимость фронта по yaw
    const pw = Math.cos(pitch);
    const faceK = clamp(fw, 0, 1) * clamp(pw, 0, 1);
    if (faceK > 0.1) {
      const blinkK = blink > 0 ? env(1 - blink / 140) : 0;
      const yawnShut = name === 'yawn' ? env(p) * 0.82 : 0;
      const sleepShut = sleeping ? sleepK * 0.95 : 0;
      // румянец
      if (wBlush > 0.02) {
        for (const s of [-1, 1]) {
          const th = s * 0.72;
          const vis = clamp(Math.cos(th - yaw), 0, 1) * clamp(pw, 0, 1);
          if (vis < 0.1) continue;
          const bp = project(surfPoint(th, 0.52, hemAmp, hemPhase, yaw, pitch, sxA, syA), cx, cyB);
          ctx.save();
          ctx.globalAlpha = 0.38 * wBlush * vis;
          ctx.fillStyle = colors.heart;
          ctx.beginPath();
          ctx.ellipse(bp.x, bp.y, 10 * Math.pow(vis, 0.7), 5.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.strokeStyle = colors.eye; ctx.fillStyle = colors.eye;
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        const th = s * 0.62;
        const vis = clamp(Math.cos(th - yaw), 0, 1) * clamp(pw, 0, 1);
        if (vis < 0.08) continue;
        const ep = project(surfPoint(th, 0.40, hemAmp, hemPhase, yaw, pitch, sxA, syA), cx, cyB);
        // живые глаза: овал сам смещается за взглядом, чуть дышит и наклоняется
        const gx = clamp(lookX, -1.2, 1.2), gy = clamp(lookY, -1.1, 1);
        const eyeShiftK = Math.pow(vis, 1.15);   // круче гасится к краю — голова несёт взгляд, зрачок только довешивает
        const ex = ep.x + gx * 1.7 * eyeShiftK, eyY = ep.y + gy * 1.7 * eyeShiftK;
        const alive = 1 + 0.045 * Math.sin(t * 0.0021 + s * 1.7);
        const tiltE = gx * 0.09;
        const winkShut = name === 'wink' && s === -1 ? env(clamp((p - 0.15) / 0.65, 0, 1)) : 0;
        const shut = Math.max(blinkK, winkShut, yawnShut, sleepShut);
        const openA = (1 - wHappy) * (1 - shut * 0.999) * Math.min(1, vis * 1.6);
        const fsh = Math.pow(vis, 0.7);                   // foreshortening ширины глаза
        if (openA > 0.03) {
          const rw = lerp(7.5, 9.5, wWide) * fsh;         // размер экранный, как в v2 — душа в глазах
          const rh0 = lerp(lerp(10.5, 8.5, wAngry), 13, wWide);
          const rh = Math.max(1.4, rh0 * (1 - shut));
          ctx.save();
          ctx.globalAlpha = openA;
          ctx.beginPath(); ctx.ellipse(ex, eyY, rw, rh * alive, tiltE, 0, Math.PI * 2); ctx.fill();
          if (rh > 3) {
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.beginPath();
            ctx.arc(ex + lerp(2.4 * fsh + clamp(lookX, -1.2, 1.2) * eyeShiftK * (flPos ? 3.6 : 2.0), 0, wWide),
                    eyY - lerp(3.2, 0, wWide) + clamp(lookY, -1.1, 1) * eyeShiftK * (flPos ? 3.2 : 2.0),
                    lerp(2.3, 1.7, wWide) * Math.min(1, rh / 8), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        if (wHappy > 0.03 && vis > 0.15) {
          ctx.save();
          ctx.globalAlpha = wHappy * Math.min(1, vis * 1.5);
          ctx.lineWidth = 3.4;
          ctx.beginPath();
          ctx.arc(ex, eyY + 4, Math.max(5.5, 7.5 * fsh), Math.PI * 1.12, Math.PI * 1.88);
          ctx.stroke();
          ctx.restore();
        }
        if (shut > 0.6 && wHappy < 0.5) {
          ctx.save();
          ctx.globalAlpha = (shut - 0.6) / 0.4;
          ctx.beginPath(); ctx.ellipse(ex, eyY, Math.max(5.5, 7.5 * fsh), 1.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        if (wAngry > 0.03 && vis > 0.15) {
          ctx.save();
          ctx.globalAlpha = wAngry * Math.min(1, vis * 1.5);
          ctx.lineWidth = 3.6;
          const rise = (1 - wAngry) * -5;
          ctx.beginPath();
          ctx.moveTo(ex + s * 10 * fsh, eyY - 18 + rise);
          ctx.lineTo(ex - s * 2 * fsh, eyY - 11 + rise);
          ctx.stroke();
          ctx.restore();
        }
      }
      // глянцевый блик — на светлой стороне купола, едет с телом
      const hp2 = project(surfPoint(-0.62, 0.24, hemAmp, hemPhase, yaw, pitch, sxA, syA), cx, cyB);
      const hVis = clamp(Math.cos(-0.62 - yaw), 0, 1) * clamp(pw, 0, 1);
      if (hVis > 0.1) {
        ctx.save();
        ctx.globalAlpha = 0.13 * hVis;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(hp2.x, hp2.y, 15 * hVis * hp2.s, 8 * hp2.s, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (wAngry > 0.03 && faceK > 0.15) {
        const ap = project(surfPoint(1.0, 0.12, hemAmp, hemPhase, yaw, pitch, sxA, syA), cx, cyB);
        angerMark(ap.x + 14, ap.y - 10, t, heat);
      }
      if (name === 'surprise') {
        ctx.save();
        ctx.font = '700 20px system-ui, sans-serif';
        ctx.fillStyle = colors.a; ctx.globalAlpha = env(p);
        ctx.fillText('!', cx + 52, cyB + TOPY + 18);
        ctx.restore();
      }
    }
    ctx.restore();

    // --- сон: z-глифы всплывают, пока призрак спит (только когда засыпание завершилось)
    if (sleeping && sleepK >= 1) {
      if (t - lastZzz > 2400 + Math.random() * 800) {
        lastZzz = t;
        zzzs.push({ x: cx + R * 0.5, y: cyB + TOPY + 8, t0: t, size: 11 + Math.random() * 5 });
      }
    }
    for (const z of zzzs) {
      const zp = (t - z.t0) / 2200;
      if (zp >= 1) continue;
      ctx.save();
      ctx.globalAlpha = (1 - zp) * 0.7;
      ctx.fillStyle = colors.eye || colors.ink;
      ctx.font = (z.size + zp * 6).toFixed(1) + 'px system-ui, sans-serif';
      ctx.fillText('z', z.x + zp * 18, z.y - zp * 26);
      ctx.restore();
    }
    zzzs = zzzs.filter((z) => (t - z.t0) / 2200 < 1);

    // --- магическая осыпь: частички медленно падают с призрака, покачиваясь,
    //     мерцают и гаснут рандомно в полёте — как тлеющая пыльца
    const floorY = H - Math.min(30, H * 0.1);          // уровень тени = «пол»
    if (Math.random() < 0.11 * f && crumbs.length < 22) {
      const th = Math.random() * Math.PI * 2;
      const v = 0.94 + Math.random() * 0.06;             // ТОЛЬКО кромка юбки
      const sp = project(surfPoint(th, v, hemAmp, hemPhase, yaw, pitch, sxA, syA), cx, cyB);
      crumbs.push({ x: sp.x, y: sp.y + 2 + Math.random() * 4,
                    vx: (sp.x - cx) / R * 0.06 + (Math.random() - 0.5) * 0.05,
                    vy: 0.05 + Math.random() * 0.14,     // медленно вниз, к полу
                    a: 0.85 + Math.random() * 0.15,
                    r: 0.6 + Math.random() * 2.0,        // разброс размеров ×4
                    glow: Math.random() < 0.3,           // светлячки с гало
                    sw: 0.10 + Math.random() * 0.20,     // своя амплитуда покачивания
                    sf: 0.0028 + Math.random() * 0.0035, // своя частота — плавнее и вразнобой
                    fl: Math.random() * 17, ff: 0.008 + Math.random() * 0.014 });
    }
    const emberHot = desat(parseCol(colors.a), 0.05);
    const emberBright = mix3(emberHot, [255, 236, 200], 0.55);
    const emberDim = mix3(emberHot, [20, 14, 12], 0.75);
    ctx.save();
    for (const q of crumbs) {
      q.x += (q.vx + Math.sin(t * (q.sf || 0.0047) + q.fl) * (q.sw || 0.18)) * f;
      q.vy += 0.0005 * f;                                // едва заметная гравитация
      q.y += q.vy * f;
      q.a -= 0.0020 * f;                                 // гаснут неспешно — успевают долететь ниже
      if (Math.random() < 0.004 * f) q.a -= 0.22;        // гаснет внезапно, рандомно
      q.r *= Math.pow(0.9993, f);
      const nearFloor = clamp((floorY + 4 - q.y) / 10, 0, 1); // растворяется у самого пола
      const flick = 0.5 + 0.5 * Math.sin(t * (q.ff || 0.017) + q.fl * 2.3);
      const heatK = clamp(q.a, 0, 1);
      const aFin = Math.max(0, q.a) * flick * 0.9 * nearFloor;
      const col = mix3(emberDim, emberBright, heatK);
      if (q.glow) {                                      // светлячок: мягкое гало вокруг
        ctx.globalAlpha = aFin * 0.30;
        ctx.fillStyle = css3(col);
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 2.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = aFin;
      ctx.fillStyle = css3(col);
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (0.8 + 0.3 * flick), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    crumbs = crumbs.filter((q) => q.a > 0 && q.y < floorY + 6);

    // сальто стряхивает облачко осыпи (падает как всё остальное)
    if (name === 'flip' && p > 0.88 && !flipBurstDone) {
      flipBurstDone = true;
      for (let i = 0; i < 8; i++) crumbs.push({
        x: cx + (Math.random() - 0.5) * R * 2, y: cyB + HEMY - Math.random() * 30,
        vx: (Math.random() - 0.5) * 0.5, vy: 0.14 + Math.random() * 0.24,
        a: 1, r: 1.1 + Math.random() * 1.3, fl: Math.random() * 17 });
    }

    // сердечки
    for (const hp of hearts) {
      hp.y += hp.vy * f; hp.x += hp.vx * f; hp.a -= 0.008 * f; hp.s += 0.02 * f;
      if (hp.y < 10) hp.a -= 0.05 * f;
      ctx.save();
      ctx.globalAlpha = Math.max(0, hp.a) * 0.85;
      ctx.fillStyle = colors.heart;
      heartPath(hp.x, hp.y, hp.s);
      ctx.fill();
      ctx.restore();
    }
    hearts = hearts.filter((hp) => hp.a > 0);

    // --- цветочек поверх (fade у краёв убирает резкие входы/выходы)
    if (flower && flower.phase === 'in' && flPos) {
      const fp = Math.min(1, (t - flower.t0) / FLD.in);
      const k = easeIO(fp);
      ctx.save();
      for (const d of flDots) {
        const slotA = d.slot * Math.PI * 2 / 5 + t * 0.0026;
        const tx = flPos.x + Math.cos(slotA) * 10, ty = flPos.y + Math.sin(slotA) * 5;
        const px = lerp(d.fx, tx, k), py = lerp(d.fy, ty, k);
        ctx.globalAlpha = (0.3 + 0.6 * k) * edgeFade(px);
        ctx.fillStyle = d.jitter > 0.5 ? '#f2a9c0' : '#dd7fa4';
        ctx.beginPath(); ctx.arc(px, py, 1.3 + d.jitter, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      drawFlower3D(flPos.x, flPos.y, t, Math.max(0, (fp - 0.45) / 0.55), 0.9 + 0.45 * k);
    } else if (flower && flower.phase === 'fly' && flPos) {
      drawFlower3D(flPos.x, flPos.y, t, 1, 1.35);
    } else if (flower && flower.phase === 'out') {
      const fp = Math.min(1, (t - flower.t0) / FLD.out);
      ctx.save();
      for (const d of flDots) {
        d.x += d.vx * f; d.y += d.vy * f; d.vy += 0.02 * f; d.a -= 0.02 * f;
        ctx.globalAlpha = Math.max(0, d.a) * (1 - fp * 0.4) * edgeFade(d.x);
        ctx.fillStyle = d.r > 1.9 ? '#e7c078' : (d.vx > 0 ? '#f2a9c0' : '#dd7fa4');
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawStatic(name) {
    blink = 0;
    wHappy = (name === 'melt' || name === 'bounce') ? 1 : 0;
    wAngry = name === 'angry' ? 1 : 0;
    wWide = name === 'surprise' ? 1 : 0;
    wBlush = name === 'blush' || name === 'melt' ? 0.8 : 0;
    emote = name && name !== 'flower' ? { name, t0: -DUR[name] / 2, dur: DUR[name] } : null;
    flower = null;
    draw(0);
    emote = null;
  }

  function loop(t) {
    raf = 0;
    if (destroyed || !canvas.isConnected || !visible || document.hidden) { lastFrameT = 0; return; }
    // real elapsed time since the previous frame (first frame after a pause = one 60 Hz step; stall capped)
    dtMs = lastFrameT ? clamp(t - lastFrameT, 0, 50) : FRAME;
    lastFrameT = t;
    if (Math.abs(dtMs - FRAME) < 1) dtMs = FRAME;
    f = dtMs / FRAME;
    bx *= Math.pow(0.94, f); by *= Math.pow(0.94, f);
    if (t - lastBlink > nextBlink) { blink = 140; lastBlink = t; nextBlink = 2200 + Math.random() * 3800; }
    if (blink > 0) blink -= dtMs;
    if (t - lastPointer > 4000 && !flower) {
      wanderT -= dtMs;
      if (wanderT <= 0) { wanderT = 1800 + Math.random() * 2600;
        wanderX = (Math.random() - 0.5) * 1.4; wanderY = -0.5 + Math.random() * 0.9; }
      mx += (wanderX - mx) * kf(0.02); my += (wanderY - my) * kf(0.02);
    }
    driftT -= dtMs;                                        // тело слегка гуляет в своих пределах
    if (driftT <= 0) { driftT = 3200 + Math.random() * 4300;
      driftTX = (Math.random() - 0.5) * 19; driftTY = (Math.random() - 0.5) * 11; }
    driftX += (driftTX - driftX) * kf(0.009); driftY += (driftTY - driftY) * kf(0.009);
    if (!sleeping && !emote && !flower && t - lastPointer > SLEEP_AFTER) {
      sleeping = true; sleepSince = t;
    }
    if (!sleeping && !emote && !flower && t > nextIdle) {
      const total = IDLE_POOL.reduce((s, e) => s + e[1], 0);
      let r = Math.random() * total;
      for (const [nm, w] of IDLE_POOL) { r -= w; if (r <= 0) { startEmote(nm, t); break; } }
      nextIdle = t + 6000 + Math.random() * 9000;
    }
    if (angryHeat > 0 && t > angryUntil) angryHeat = 0;
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  function spawnHearts() {
    for (let i = 0; i < 3; i++) hearts.push({
      x: W / 2 + (Math.random() - 0.5) * 70, y: cy0 + TOPY + 30 + Math.random() * 40,
      vy: -0.8 - Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.4,
      a: 1, s: 5 + Math.random() * 3 });
  }

  function click() {
    const t = performance.now();
    clicks.push(t);
    clicks = clicks.filter((c) => t - c < 2200);
    if ((emote && emote.name === 'angry' && angryUntil > t) || clicks.length >= 5) {
      angryHeat = Math.min(3, angryHeat + 1);
      if (emote && emote.name === 'angry') angryUntil = Math.min(t + 2600, emote.t0 + 9000);
      else startEmote('angry', t);
    } else if (clicks.length >= 3) {
      startEmote('surprise', t);
    } else {
      startEmote('melt', t);
      spawnHearts();
    }
  }

  const onDown = (e) => {
    e.preventDefault();
    const t = performance.now();
    if (sleeping) { wake(t); return; }
    click();
  };
  canvas.addEventListener('pointerdown', onDown);
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    lastPointer = performance.now();
    if (sleeping) wake(lastPointer);
    mx = clamp((e.clientX - (r.left + r.width / 2)) / 300, -1, 1);
    my = clamp((e.clientY - (r.top + r.height / 2)) / 300, -1, 1);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !reduced && !raf) raf = requestAnimationFrame(loop);
    if (visible && reduced) drawStatic(null);
  });
  io.observe(canvas);
  const onVis = () => {
    if (!document.hidden && visible && !raf && !reduced) raf = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', onVis);

  if (reduced) drawStatic(null);
  else raf = requestAnimationFrame(loop);

  return {
    emote(name) { startEmote(name, performance.now()); if (name === 'melt') spawnHearts(); },
    setColors() { colors = opts.colors(); if (reduced) drawStatic(null); },
    nudge(dx, dy) { bx = clamp(bx + dx, -0.5, 0.5); by = clamp(by + dy, -0.5, 0.5); },
    lookAt(nx, ny, o) {
      const hold = (o && o.hold) || 1300;
      gaze = { x: clamp(nx, -1.2, 1.2), y: clamp(ny, -1.1, 1), until: performance.now() + hold };
    },
    destroy() {
      destroyed = true; io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
