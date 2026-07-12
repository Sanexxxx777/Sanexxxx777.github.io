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
  let blink = 0, lastBlink = 0, nextBlink = 2500;
  let sparks = [], hearts = [], crumbs = [];
  let emote = null;
  let nextIdle = 4000 + Math.random() * 6000;
  let angryUntil = 0, angryHeat = 0;
  let clicks = [];
  let flipBurstDone = false;
  let flower = null, flDots = [];
  let wHappy = 0, wAngry = 0, wWide = 0, wBlush = 0;

  // --- 3D параметры
  const RINGS = 22, SEGS = 34;
  const R = 59, TOPY = -78, HEMY = 58;      // модельные размеры (совпадают с v2 силуэтом)
  const FOC = 460, CAMD = 320;              // фокус и дистанция камеры
  const LGT = norm3([-0.45, -0.62, -0.62]); // свет сверху-слева-спереди
  const cy0 = H / 2 + H * 0.056;
  const headroom = Math.max(10, cy0 + TOPY - 14);
  const JUMP = Math.min(46, headroom), HOP = Math.min(15, headroom * 0.4);

  const IDLE_POOL = [
    ['wink', 4], ['lookAround', 3], ['bounce', 2],
    ['blush', 2], ['turn', 1.6], ['flip', 1], ['melt', 0.7], ['flower', 0.9],
  ];
  const DUR = { wink: 750, lookAround: 1700, bounce: 950, blush: 2400,
                turn: 2100, flip: 1300, melt: 1900, surprise: 750, angry: 2600 };
  const FLD = { in: 700, fly: 7800, out: 700 };

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

  function startEmote(name, t) {
    if (name === 'flower') { startFlower(t); if (opts.onMood) opts.onMood('flower'); return; }
    emote = { name, t0: t, dur: DUR[name] || 1000 };
    if (name === 'flip') flipBurstDone = false;
    if (name === 'angry') angryUntil = t + DUR.angry;
    if (opts.onMood) opts.onMood(name);
    if (reduced) { drawStatic(name); setTimeout(() => { if (!destroyed) drawStatic(null); }, 1200); }
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
    wHappy = lerp(wHappy, happyT, 0.10);
    wAngry = lerp(wAngry, angryT, 0.12);
    wWide = lerp(wWide, wideT, 0.16);
    wBlush = lerp(wBlush, blushT, 0.08);

    const bobY = Math.sin(t * 0.0011) * 9;
    let tilt = Math.sin(t * 0.0007) * 0.05 + mx * 0.06;
    let x = 0, y = bobY, sxA = 1, syA = 1;
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
    syA *= 1 + 0.008 * Math.sin(t * 0.00093);
    sxA *= 1 + 0.006 * Math.sin(t * 0.00093 + 1.2);

    // взгляд (курсор / цветочек / эмоции)
    let lookX = name === 'lookAround' ? Math.sin(p * Math.PI * 3) * 1.15
              : name === 'blush' ? -0.7 : mx;
    let lookY = name === 'blush' ? 0.6 : my;
    const cx = W / 2 + x, cyB = cy0 + y;
    if (flPos) {
      lookX = clamp((flPos.x - cx) / 150, -1.2, 1.2);
      lookY = clamp((flPos.y - (cyB + TOPY + 46)) / 110, -1.1, 1);
    }
    const yaw = yawE + lookX * (flPos ? 0.55 : 0.30);    // за цветком голова доворачивается заметно
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

    // вершины
    const verts = [];
    for (let i = 0; i < RINGS; i++) {
      const v = i / (RINGS - 1);
      const ring = [];
      for (let j = 0; j < SEGS; j++) {
        const th = (j / SEGS) * Math.PI * 2;
        ring.push(surfPoint(th, v, hemAmp, hemPhase, yaw, pitch, sxA, syA));
      }
      verts.push(ring);
    }
    // квады; нормаль ориентируем наружу от оси тела (не зависим от винтинга)
    const axis = rotX([0, 1, 0], pitch);
    const quads = [];
    for (let i = 0; i < RINGS - 1; i++) {
      for (let j = 0; j < SEGS; j++) {
        const j2 = (j + 1) % SEGS;
        const A = verts[i][j], B = verts[i + 1][j], C = verts[i + 1][j2], D = verts[i][j2];
        let n = norm3(cross3(sub3(B, A), sub3(C, A)));
        const qc = [(A[0] + B[0] + C[0] + D[0]) / 4, (A[1] + B[1] + C[1] + D[1]) / 4,
                    (A[2] + B[2] + C[2] + D[2]) / 4];
        const ad = dot3(qc, axis);
        const radial = [qc[0] - axis[0] * ad, qc[1] - axis[1] * ad, qc[2] - axis[2] * ad];
        if (dot3(n, radial) < 0) n = [-n[0], -n[1], -n[2]];
        const back = n[2] > 0;                            // наружная нормаль от камеры → изнанка
        const lit = Math.max(0, dot3(back ? [-n[0], -n[1], -n[2]] : n, LGT));
        const vAvg = (i + 0.5) / (RINGS - 1);
        let col = mix3(baseA, baseB, vAvg);               // вертикальный градиент тела
        col = mix3(dark, col, 0.42 + 0.58 * lit);         // ламберт
        if (back) col = mix3(col, dark, 0.55);            // внутренность юбки темнее
        quads.push({ A, B, C, D, zc: qc[2], col });
      }
    }
    quads.sort((q1, q2) => q2.zc - q1.zc);

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

    for (const q of quads) {
      const a = project(q.A, cx, cyB), b = project(q.B, cx, cyB),
            c = project(q.C, cx, cyB), d = project(q.D, cx, cyB);
      ctx.fillStyle = css3(q.col);
      ctx.strokeStyle = ctx.fillStyle;                    // шов-заполнитель против щелей
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    // --- лицо на поверхности (глаза θ=±0.42, v=0.30)
    const fw = Math.cos(yaw);                             // видимость фронта по yaw
    const pw = Math.cos(pitch);
    const faceK = clamp(fw, 0, 1) * clamp(pw, 0, 1);
    if (faceK > 0.1) {
      const blinkK = blink > 0 ? env(1 - blink / 140) : 0;
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
        const ex = ep.x, eyY = ep.y;
        const winkShut = name === 'wink' && s === -1 ? env(clamp((p - 0.15) / 0.65, 0, 1)) : 0;
        const shut = Math.max(blinkK, winkShut);
        const openA = (1 - wHappy) * (1 - shut * 0.999) * Math.min(1, vis * 1.6);
        const fsh = Math.pow(vis, 0.7);                   // foreshortening ширины глаза
        if (openA > 0.03) {
          const rw = lerp(7.5, 9.5, wWide) * fsh;         // размер экранный, как в v2 — душа в глазах
          const rh0 = lerp(lerp(10.5, 8.5, wAngry), 13, wWide);
          const rh = Math.max(1.4, rh0 * (1 - shut));
          ctx.save();
          ctx.globalAlpha = openA;
          ctx.beginPath(); ctx.ellipse(ex, eyY, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
          if (rh > 3) {
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.beginPath();
            ctx.arc(ex + lerp(2.4 * fsh + clamp(lookX, -1.2, 1.2) * (flPos ? 5.0 : 3.2), 0, wWide),
                    eyY - lerp(3.2, 0, wWide) + clamp(lookY, -1.1, 1) * (flPos ? 4.2 : 2.8),
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

    // --- магическая осыпь: частички медленно падают с призрака, покачиваясь,
    //     мерцают и гаснут рандомно в полёте — как тлеющая пыльца
    const floorY = H - Math.min(30, H * 0.1);          // уровень тени = «пол»
    if (Math.random() < 0.11 && crumbs.length < 22) {
      const th = Math.random() * Math.PI * 2;
      const v = 0.94 + Math.random() * 0.06;             // ТОЛЬКО кромка юбки
      const sp = project(surfPoint(th, v, hemAmp, hemPhase, yaw, pitch, sxA, syA), cx, cyB);
      crumbs.push({ x: sp.x, y: sp.y + 2 + Math.random() * 4,
                    vx: (sp.x - cx) / R * 0.06 + (Math.random() - 0.5) * 0.05,
                    vy: 0.06 + Math.random() * 0.16,     // медленно вниз, к полу
                    a: 0.85 + Math.random() * 0.15,
                    r: 0.8 + Math.random() * 1.6,
                    fl: Math.random() * 17, ff: 0.011 + Math.random() * 0.014 });
    }
    const emberHot = desat(parseCol(colors.a), 0.05);
    const emberBright = mix3(emberHot, [255, 236, 200], 0.55);
    const emberDim = mix3(emberHot, [20, 14, 12], 0.75);
    ctx.save();
    for (const q of crumbs) {
      q.x += q.vx + Math.sin(t * 0.0047 + q.fl) * 0.18;  // ленивое покачивание пылинки
      q.vy += 0.0006;                                    // едва заметная гравитация
      q.y += q.vy;
      q.a -= 0.0028;
      if (Math.random() < 0.006) q.a -= 0.25;            // гаснет внезапно, рандомно
      q.r *= 0.999;
      const nearFloor = clamp((floorY - q.y) / 14, 0, 1); // у пола растворяется, не долетая за край
      const flick = 0.5 + 0.5 * Math.sin(t * (q.ff || 0.017) + q.fl * 2.3);
      const heatK = clamp(q.a, 0, 1);
      ctx.globalAlpha = Math.max(0, q.a) * flick * 0.9 * nearFloor;
      ctx.fillStyle = css3(mix3(emberDim, emberBright, heatK));
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (0.8 + 0.3 * flick), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    crumbs = crumbs.filter((q) => q.a > 0 && q.y < H + 4);

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
      hp.y += hp.vy; hp.x += hp.vx; hp.a -= 0.008; hp.s += 0.02;
      if (hp.y < 10) hp.a -= 0.05;
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
        d.x += d.vx; d.y += d.vy; d.vy += 0.02; d.a -= 0.02;
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
    if (destroyed || !canvas.isConnected || !visible || document.hidden) return;
    if (t - lastBlink > nextBlink) { blink = 140; lastBlink = t; nextBlink = 2200 + Math.random() * 3800; }
    if (blink > 0) blink -= 16.7;
    if (t - lastPointer > 4000 && !flower) {
      wanderT -= 16.7;
      if (wanderT <= 0) { wanderT = 1800 + Math.random() * 2600;
        wanderX = (Math.random() - 0.5) * 1.4; wanderY = -0.5 + Math.random() * 0.9; }
      mx += (wanderX - mx) * 0.02; my += (wanderY - my) * 0.02;
    }
    if (!emote && !flower && t > nextIdle) {
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

  const onDown = (e) => { e.preventDefault(); click(); };
  canvas.addEventListener('pointerdown', onDown);
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    lastPointer = performance.now();
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
    destroy() {
      destroyed = true; io.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
