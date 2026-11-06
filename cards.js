/* The folder, the holo cards and the scene they spin in. Card names and text are in content.js.
   Each picture is painted here in code: browsers won't let WebGL read image files
   when index.html is opened by double-clicking it, but they will read a canvas.

   The ring is the "cylinder" layout of Circular Carousel from React Bits
   (reactbits.dev), Copyright (c) 2026 David Haz, MIT + Commons Clause. */

(() => {
const { site, CONTENT: C } = window;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = 504, H = 704, LIFT = 64;
const TAU = Math.PI * 2;

/* ---------- Painting helpers ---------- */
function seeded(seed) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}
function sky(g, stops) {
  const r = g.createLinearGradient(0, 0, 0, H);
  stops.forEach((c, i) => r.addColorStop(i / (stops.length - 1), c));
  g.fillStyle = r;
  g.fillRect(0, 0, W, H);
}
function bloom(g, x, y, r, color, alpha = 1) {
  const q = g.createRadialGradient(x, y, 0, x, y, r);
  q.addColorStop(0, color);
  q.addColorStop(1, 'rgba(0,0,0,0)');
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = alpha;
  g.fillStyle = q;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
}
function stars(g, rand, n, top = H) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(255,255,255,${.25 + rand() * .75})`;
    g.beginPath();
    g.arc(rand() * W, rand() * top, rand() * 1.8, 0, TAU);
    g.fill();
  }
}
function rays(g, x, y, n, length, color) {
  g.save();
  g.translate(x, y);
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = color;
  for (let i = 0; i < n; i++) {
    g.rotate(TAU / n);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(length, -length * .05);
    g.lineTo(length, length * .05);
    g.closePath();
    g.fill();
  }
  g.restore();
}
function poly(g, points, fill) {
  g.fillStyle = fill;
  g.beginPath();
  points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
}
function rounded(g, x, y, w, h, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}
function line(g, points, color, width) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.stroke();
}

/* ---------- One painter per card ---------- */
const ART = {
  skills(g) {
    const rand = seeded(31);
    sky(g, ['#03140f', '#07342a', '#0a5a48', '#042018']);
    // Traces running in to the chip
    const cx = 252, cy = 300;
    for (let i = 0; i < 64; i++) {
      const side = i % 4, off = -118 + (i % 16) * 16;
      const s = [[cx + off, cy - 92], [cx + 92, cy + off], [cx + off, cy + 92], [cx - 92, cy + off]][side];
      const out = [[0, -1], [1, 0], [0, 1], [-1, 0]][side];
      const a = 50 + rand() * 90, b = 40 + rand() * 170, d = rand() > .5 ? 1 : -1;
      const m = [s[0] + out[0] * a, s[1] + out[1] * a];
      const k = [m[0] + out[0] * b + out[1] * b * d, m[1] + out[1] * b + out[0] * b * d];
      line(g, [s, m, k], `hsla(${150 + rand() * 40},90%,${50 + rand() * 25}%,.8)`, 2.5);
      g.fillStyle = '#ffd779'; g.beginPath(); g.arc(k[0], k[1], 4.5, 0, TAU); g.fill();
    }
    bloom(g, cx, cy, 300, '#22e0a8', .75);
    // Gold pins, then the chip
    for (let i = 0; i < 12; i++) {
      const o = -110 + i * 20;
      rounded(g, cx + o - 5, cy - 112, 10, 224, 2, '#d8ad4d');
      rounded(g, cx - 112, cy + o - 5, 224, 10, 2, '#d8ad4d');
    }
    rounded(g, cx - 100, cy - 100, 200, 200, 12, '#12161c');
    rounded(g, cx - 68, cy - 68, 136, 136, 8, '#c3cbd5');
    rounded(g, cx - 62, cy - 62, 124, 124, 6, '#e8edf3');
    g.fillStyle = '#10151b';
    g.textAlign = 'center';
    g.font = '500 48px "IBM Plex Mono", monospace';
    g.fillText('{ }', cx, cy + 16);
    g.textAlign = 'left';
    // The tools of the trade, orbiting the chip
    g.font = '500 25px "IBM Plex Mono", monospace';
    for (const [t, x, y] of [['Python', 28, 110], ['C++', 392, 104], ['C#', 42, 492], ['Java', 386, 490], ['JavaScript', 158, 92], ['AutoCAD', 8, 300], ['Blender', 388, 300]]) {
      rounded(g, x - 8, y - 26, g.measureText(t).width + 16, 36, 8, 'rgba(3,20,15,.8)');
      g.fillStyle = '#baf7e0';
      g.fillText(t, x, y);
    }
  },

  gojo(g) {
    const rand = seeded(47);
    sky(g, ['#05020f', '#14062e', '#1d0a45', '#070314']);
    stars(g, rand, 200);
    const cx = 252, cy = 310;
    // Particles pulled into a spiral around the core
    for (let i = 0; i < 5200; i++) {
      const arm = i % 3, f = rand();
      const r = 34 + Math.pow(f, 1.5) * 330;
      const a = arm * TAU / 3 + r * .021 + (rand() - .5) * .62;
      const hue = [270, 208, 348][arm] + rand() * 26;
      g.fillStyle = `hsla(${hue},100%,${62 + rand() * 30}%,${.28 + rand() * .68})`;
      g.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .72, 1 + rand() * 2.4, 1 + rand() * 2.4);
    }
    // Red and blue meet and make purple
    bloom(g, cx - 138, cy + 56, 158, '#3b78ff');
    bloom(g, cx + 138, cy - 56, 158, '#ff2e4d');
    bloom(g, cx - 138, cy + 56, 54, '#cfe2ff');
    bloom(g, cx + 138, cy - 56, 54, '#ffd2d9');
    bloom(g, cx, cy, 270, '#9a35ff');
    bloom(g, cx, cy, 124, '#e6b8ff');
    bloom(g, cx, cy, 66, '#ffffff');
    g.save();
    g.translate(cx, cy);
    g.rotate(-.34);
    g.strokeStyle = 'rgba(244,215,255,.8)';
    g.lineWidth = 3;
    g.beginPath(); g.ellipse(0, 0, 210, 52, 0, 0, TAU); g.stroke();
    g.rotate(1.1);
    g.strokeStyle = 'rgba(200,170,255,.5)';
    g.lineWidth = 2;
    g.beginPath(); g.ellipse(0, 0, 250, 80, 0, 0, TAU); g.stroke();
    g.restore();
    // Lightning off the core
    for (let b = 0; b < 8; b++) {
      let x = cx, y = cy, a = rand() * TAU;
      const pts = [[x, y]];
      for (let i = 0; i < 9; i++) {
        a += (rand() - .5) * 1.1;
        x += Math.cos(a) * 28; y += Math.sin(a) * 28;
        pts.push([x, y]);
      }
      line(g, pts, 'rgba(226,190,255,.8)', 2);
    }
  },

  capybara(g) {
    const rand = seeded(9);
    sky(g, ['#ffd9e8', '#ffc2d8', '#f4a3bb', '#c97a91']);
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(255,255,255,${.2 + rand() * .4})`;
      g.beginPath(); g.arc(rand() * W, rand() * 360, 4 + rand() * 12, 0, TAU); g.fill();
    }
    poly(g, [[0, 560], [504, 530], [504, 704], [0, 704]], '#a9674c');
    poly(g, [[0, 560], [504, 530], [504, 546], [0, 576]], '#c58766');
    rounded(g, 86, 508, 332, 34, 16, '#4c3128');
    const fur = g.createRadialGradient(210, 210, 40, 252, 340, 260);
    fur.addColorStop(0, '#dea06a');
    fur.addColorStop(1, '#a8682f');
    // Ears, body and face, all rounded like the printed shell
    for (const x of [130, 374]) {
      g.fillStyle = '#c98a4d'; g.beginPath(); g.arc(x, 180, 52, 0, TAU); g.fill();
      g.fillStyle = '#7a3e27'; g.beginPath(); g.arc(x, 180, 28, 0, TAU); g.fill();
    }
    g.fillStyle = fur;
    g.beginPath(); g.ellipse(252, 336, 200, 202, 0, 0, TAU); g.fill();
    for (const [x, r] of [[226, -.3], [252, 0], [278, .3]]) {
      g.save(); g.translate(x, 140); g.rotate(r); rounded(g, -6, -36, 12, 44, 6, '#5b3320'); g.restore();
    }
    rounded(g, 138, 238, 66, 15, 7, '#2c1c16');
    rounded(g, 300, 238, 66, 15, 7, '#2c1c16');
    g.fillStyle = '#7a3e27';
    g.beginPath(); g.ellipse(252, 288, 86, 58, 0, 0, TAU); g.fill();
    g.fillStyle = '#20130f';
    g.beginPath(); g.ellipse(252, 262, 36, 20, 0, 0, TAU); g.fill();
    line(g, [[252, 282], [252, 304], [224, 322]], '#3a1e12', 4);
    line(g, [[252, 304], [280, 322]], '#3a1e12', 4);
    // The belly screen, mid-game
    rounded(g, 132, 352, 240, 160, 16, '#24262b');
    rounded(g, 146, 364, 212, 136, 8, '#fdf6ee');
    rounded(g, 146, 364, 212, 26, 8, '#8f5a36');
    g.fillStyle = '#fff5e6'; g.font = '500 15px "IBM Plex Mono", monospace';
    g.fillText('Capybara Typer', 156, 382);
    g.fillStyle = '#ffd77a'; g.fillText('0:42', 316, 382);
    g.font = '400 16px "IBM Plex Mono", monospace';
    g.fillStyle = '#2f8a4d'; g.fillText('the quick br', 156, 414);
    g.fillStyle = '#9a8c7f'; g.fillText('own capybara', 264, 414);
    g.fillText('swims in the warm', 156, 434);
    for (const [x, t, v] of [[156, 'WPM', '68'], [226, 'ACC', '97%'], [296, 'ERR', '2']]) {
      rounded(g, x, 450, 62, 40, 6, '#c08a58');
      g.fillStyle = '#fff'; g.font = '500 11px "IBM Plex Mono", monospace'; g.fillText(t, x + 8, 464);
      g.font = '500 18px "IBM Plex Mono", monospace'; g.fillText(v, x + 8, 483);
    }
    for (const x of [122, 382]) {
      g.fillStyle = '#7a3e27'; g.beginPath(); g.ellipse(x, 510, 42, 34, 0, 0, TAU); g.fill();
    }
    bloom(g, 252, 430, 200, '#fff0d0', .25);
  },

  tracker(g) {
    const rand = seeded(61);
    sky(g, ['#02100f', '#03231f', '#062f35', '#020d12']);
    bloom(g, 196, 280, 320, '#0fb8a8', .35);
    // Face as a mesh of tracked points
    const cx = 196, cy = 260, rx = 120, ry = 160;
    const pts = [];
    for (let i = 0; i < 230; i++) {
      const a = rand() * TAU, r = Math.sqrt(rand());
      pts.push([cx + Math.cos(a) * r * rx * (.84 + .16 * Math.sin(a)), cy + Math.sin(a) * r * ry]);
    }
    g.strokeStyle = 'rgba(95,255,226,.2)';
    g.lineWidth = 1;
    for (const p of pts) {
      const near = pts.map((q) => [Math.hypot(p[0] - q[0], p[1] - q[1]), q]).sort((a, b) => a[0] - b[0]).slice(1, 4);
      for (const [, q] of near) { g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
    }
    for (const [x, y] of pts) {
      g.fillStyle = '#7fffe9'; g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill();
    }
    for (const [x, y] of [[148, 220], [244, 220]]) {
      line(g, [[x - 34, y], [x, y - 14], [x + 34, y], [x, y + 13], [x - 34, y]], '#c5fff4', 3);
      g.fillStyle = '#c5fff4'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill();
    }
    line(g, [[196, 228], [180, 300], [212, 302]], '#c5fff4', 3);
    line(g, [[140, 348], [196, 368], [252, 348], [196, 382], [140, 348]], '#c5fff4', 3);
    // Green recognition box with corner brackets
    const [bx, by, bw, bh] = [46, 70, 300, 384];
    g.strokeStyle = '#46ff8a';
    g.lineWidth = 5;
    for (const [x, y, dx, dy] of [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]]) {
      g.beginPath(); g.moveTo(x + dx * 54, y); g.lineTo(x, y); g.lineTo(x, y + dy * 54); g.stroke();
    }
    rounded(g, bx, by + bh + 8, 176, 34, 6, '#46ff8a');
    g.fillStyle = '#02231a'; g.font = '500 20px "IBM Plex Mono", monospace';
    g.fillText('Known, 98%', bx + 14, by + bh + 32);
    // Hand skeleton, 21 points
    g.save();
    g.translate(370, 470);
    g.scale(1.25, 1.25);
    const fingers = [
      [[0, 60], [-40, 30], [-66, -2], [-84, -24], [-98, -46]],
      [[0, 60], [-26, -20], [-34, -62], [-38, -90], [-42, -116]],
      [[0, 60], [-2, -26], [-4, -74], [-6, -106], [-8, -136]],
      [[0, 60], [22, -20], [28, -64], [32, -94], [36, -120]],
      [[0, 60], [42, -6], [54, -38], [62, -60], [70, -82]]
    ];
    fingers.forEach((f, i) => {
      line(g, f, `hsl(${150 + i * 28},100%,66%)`, 3.4);
      for (const [x, y] of f) {
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4.2, 0, TAU); g.fill();
      }
    });
    line(g, [[-26, -20], [-2, -26], [22, -20], [42, -6]], '#7dffd0', 3);
    g.restore();
    bloom(g, 370, 420, 180, '#2bffb0', .3);
  },

  math(g) {
    const rand = seeded(73);
    sky(g, ['#10201c', '#142e26', '#0f241f', '#0a1814']);
    g.strokeStyle = 'rgba(210,240,225,.1)';
    g.lineWidth = 1;
    for (let x = 12; x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 20; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    line(g, [[20, 320], [484, 320]], 'rgba(235,245,235,.75)', 3);
    line(g, [[100, 96], [100, 560]], 'rgba(235,245,235,.75)', 3);
    // Chalky equations
    g.font = '400 25px "IBM Plex Mono", monospace';
    g.fillStyle = 'rgba(235,245,230,.36)';
    for (const [t, x, y] of [['f\'(x) = cos x', 180, 114], ['∫ sin x dx = -cos x', 118, 150], ['lim x→0  sin x / x = 1', 112, 500], ['x - x³/6 + x⁵/120', 150, 536]]) g.fillText(t, x, y);
    // The curve drawn in the air, glowing
    const curve = [];
    for (let x = 30; x < 400; x += 6) curve.push([x, 320 - Math.sin((x - 100) / 58) * 124 + (rand() - .5) * 2]);
    bloom(g, 300, 320, 260, '#ffb02e', .32);
    line(g, curve, 'rgba(255,167,38,.28)', 26);
    line(g, curve, 'rgba(255,190,70,.55)', 13);
    line(g, curve, '#fff3cf', 5);
    // The pointing finger drawing it
    const [tx, ty] = curve[curve.length - 1];
    g.save();
    g.translate(tx, ty);
    g.rotate(.7);
    rounded(g, -15, 0, 30, 118, 15, '#e6ac88');
    rounded(g, -44, 90, 96, 150, 34, '#d99a76');
    rounded(g, 16, 110, 26, 70, 13, '#cf8d69');
    rounded(g, -10, 4, 20, 22, 8, '#f7d9c6');
    g.restore();
    bloom(g, tx, ty, 96, '#ffe3a1');
    rounded(g, 150, 182, 212, 50, 10, 'rgba(10,24,20,.88)');
    g.fillStyle = '#ffd67a'; g.font = '500 29px "IBM Plex Mono", monospace';
    g.fillText('y = sin(x)', 170, 217);
  },

  lodestar(g) {
    const rand = seeded(83);
    sky(g, ['#02040f', '#071538', '#123066', '#2b3f73', '#e0a94a']);
    stars(g, rand, 300, 500);
    // Constellation leading to the star
    const c = [[70, 332], [130, 270], [122, 182], [196, 214], [252, 170]];
    line(g, c, 'rgba(200,220,255,.5)', 2);
    for (const [x, y] of c.slice(0, -1)) { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
    // The lodestar
    const sx = 252, sy = 170;
    rays(g, sx, sy, 16, 560, 'rgba(255,224,150,.1)');
    bloom(g, sx, sy, 250, '#ffcc66');
    bloom(g, sx, sy, 86, '#ffffff');
    for (const [l, w, rot] of [[150, 13, 0], [94, 9, Math.PI / 4]]) {
      g.save(); g.translate(sx, sy); g.rotate(rot);
      for (let i = 0; i < 4; i++) {
        g.rotate(Math.PI / 2);
        poly(g, [[0, -w], [l, 0], [0, w]], '#fff7dc');
      }
      g.restore();
    }
    // Candlesticks rising like a mountain range
    let price = 610;
    for (let i = 0; i < 24; i++) {
      const x = 12 + i * 20.2;
      const open = price;
      price += -9 - rand() * 12 + (i % 5 === 3 ? 42 : 6) * rand();
      const up = price < open;
      const col = up ? '#4cdba0' : '#ff6f7a';
      line(g, [[x + 6, Math.min(open, price) - 16 - rand() * 18], [x + 6, Math.max(open, price) + 14 + rand() * 18]], col, 2);
      rounded(g, x, Math.min(open, price), 13, Math.max(8, Math.abs(open - price)), 2, col);
    }
    poly(g, [[0, 704], [0, 640], [150, 600], [260, 650], [400, 590], [504, 626], [504, 704]], '#0a1229');
  }
};

/* ---------- The card layout over the picture ---------- */
function wrapped(g, text, x, y, width, lineHeight) {
  let row = '';
  for (const word of text.split(' ')) {
    if (row && g.measureText(`${row} ${word}`).width > width) {
      g.fillText(row, x, y);
      y += lineHeight;
      row = word;
    } else row = row ? `${row} ${word}` : word;
  }
  g.fillText(row, x, y);
  return y + lineHeight;
}

function paintCard(card) {
  const paint = Object.assign(document.createElement('canvas'), { width: W, height: H });
  ART[card.art](paint.getContext('2d'));
  const art = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = art.getContext('2d');
  // Lifted so the picture sits above the text box, with the last rows filling the gap
  g.drawImage(paint, 0, -LIFT);
  g.drawImage(paint, 0, H - 2, W, 2, 0, H - LIFT, W, LIFT);

  const shade = g.createLinearGradient(0, 0, 0, 120);
  shade.addColorStop(0, 'rgba(0,0,0,.66)');
  shade.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = shade;
  g.fillRect(0, 0, W, 120);

  g.textAlign = 'left';
  g.fillStyle = '#ffffff';
  g.shadowColor = 'rgba(0,0,0,.6)';
  g.shadowBlur = 8;
  g.font = '500 38px "IBM Plex Sans", sans-serif';
  while (g.measureText(card.name).width > W - 60) g.font = g.font.replace(/\d+px/, (n) => `${parseInt(n) - 2}px`);
  g.fillText(card.name, 30, 60);
  g.shadowBlur = 0;

  const box = 178;
  rounded(g, 22, H - box - 22, W - 44, box, 12, 'rgba(8,10,16,.8)');
  let y = H - box + 12;
  for (const [title, text] of card.moves) {
    g.fillStyle = '#ffffff';
    g.font = '500 27px "IBM Plex Sans", sans-serif';
    g.fillText(title, 42, y);
    g.fillStyle = 'rgba(255,255,255,.84)';
    g.font = '400 22px "IBM Plex Sans", sans-serif';
    y = wrapped(g, text, 42, y + 30, W - 84, 27) + 14;
  }
  return art;
}

/* ---------- The carousel: the "cylinder" layout, with its spacing and motion ---------- */
const CARD_W = 220, CARD_H = CARD_W * 88 / 63, GAP = 25;     // width and gap as in React Bits
const TILT = -5, PERSPECTIVE = 2500, TILES = 8, OVERLAP = 2.5;
const SPEED = 14, SPRING = 118, SETTLE_SPEED = 9, MOMENTUM = .6, PARALLAX = .3, STRETCH = .5, DEPTH_FADE = .55;
const TO_RAD = Math.PI / 180;
const count = C.cards.length, step = 360 / count;
const pitch = CARD_W + GAP;
const RADIUS = Math.max(count * pitch / TAU, CARD_W * .6);   // the card bends exactly onto this ring
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const rotY = ([x, y, z], d) => { const c = Math.cos(d * TO_RAD), s = Math.sin(d * TO_RAD); return [x * c + z * s, y, z * c - x * s]; };
const rotX = ([x, y, z], d) => { const c = Math.cos(d * TO_RAD), s = Math.sin(d * TO_RAD); return [x, y * c - z * s, y * s + z * c]; };

const tiles = Array.from({ length: TILES }, (_, index) => {
  const length = CARD_W / TILES;
  const start = index * length - (index > 0 ? OVERLAP / 2 : 0);
  const end = (index + 1) * length + (index < TILES - 1 ? OVERLAP / 2 : 0);
  const alpha = ((start + end) / 2 - CARD_W / 2) / RADIUS;
  const move = `translate3d(${RADIUS * Math.sin(alpha)}px, 0px, ${-RADIUS * (1 - Math.cos(alpha))}px) rotateY(${alpha / TO_RAD}deg)`;
  return { index, start, end, size: end - start, move };
});

const state = {
  angle: 0, velocity: 0, target: null, dir: -1, press: null, drag: false, hover: false,
  pointer: { inside: false, x: 0, y: 0 }, yaw: 0, pitch: 0, intro: null, holdUntil: 0,
  suppressClick: false, fit: 1, shift: 0, drop: 0, last: 0
};
const cards = [];
let built = false, running = false;

function makeTile(card, index, tile, back) {
  const strip = back ? TILES - 1 - tile.index : tile.index;
  const r = 'var(--cc-radius)', first = strip === 0, last = strip === TILES - 1;
  const el = document.createElement('div');
  el.className = 'circular-carousel__tile';
  Object.assign(el.style, { left: `${-tile.size / 2}px`, top: `${-CARD_H / 2}px`, width: `${tile.size}px`, height: `${CARD_H}px`, transform: tile.move + (back ? ' rotateY(180deg)' : '') });
  const frame = document.createElement('div');
  frame.className = 'circular-carousel__frame';
  Object.assign(frame.style, { height: `${CARD_H}px`, borderRadius: `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}` });
  const slice = Object.assign(document.createElement('canvas'), { width: Math.ceil(tile.size * 1.5), height: Math.round(CARD_H * 1.5) });
  slice.className = 'circular-carousel__photo';
  Object.assign(slice.style, { left: 0, top: 0, width: `${tile.size}px`, height: `${CARD_H}px` });
  const offset = back ? CARD_W - tile.end : tile.start;
  const g = slice.getContext('2d');
  const part = { g, sx: offset / CARD_W, sw: tile.size / CARD_W };
  g.drawImage(card.art, part.sx * W, 0, part.sw * W, H, 0, 0, slice.width, slice.height);
  frame.append(slice);
  if (back) frame.append(Object.assign(document.createElement('div'), { className: 'circular-carousel__inner' }));
  frame.append(Object.assign(document.createElement('div'), { className: 'circular-carousel__shade' }));
  el.append(frame);
  if (!back) card.parts.push(part);
  return el;
}

function build() {
  built = true;
  C.cards.forEach((info, index) => {
    const art = paintCard(info);
    const foil = holoFoil(art, Math.round(CARD_W * 1.5), Math.round(CARD_H * 1.5), CARD_W, { intensity: .2, edge: .3 });
    const card = { info, art, foil, parts: [], el: document.createElement('div'), clock: index * 3 };
    card.el.className = 'circular-carousel__card';
    card.el.dataset.ccIndex = index;
    for (const tile of tiles) card.el.append(makeTile(card, index, tile, false));
    for (const tile of tiles) card.el.append(makeTile(card, index, tile, true));
    $('ring-ring').append(card.el);
    cards.push(card);

    // Screen reader and keyboard route to each card
    const key = Object.assign(document.createElement('button'), { textContent: info.name });
    key.onfocus = () => focusIndex(index);
    key.onclick = () => openCard(index);
    $('deck-keys').append(key);
  });
}

function measure() {
  const rect = $('ring').getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const width = rect.width * .94, height = rect.height * .92;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let a = -180; a <= 180; a += 7.5) {
    for (const [cx, cy] of [[-CARD_W / 2, -CARD_H / 2], [CARD_W / 2, -CARD_H / 2], [-CARD_W / 2, CARD_H / 2], [CARD_W / 2, CARD_H / 2]]) {
      const p = rotX(rotY([cx, cy, RADIUS], a), TILT);
      p[2] -= RADIUS;
      if (p[2] >= PERSPECTIVE * .95) continue;
      const q = PERSPECTIVE / (PERSPECTIVE - p[2]);
      minX = Math.min(minX, p[0] * q); maxX = Math.max(maxX, p[0] * q);
      minY = Math.min(minY, p[1] * q); maxY = Math.max(maxY, p[1] * q);
    }
  }
  state.fit = Math.min(1, width / Math.max(maxX - minX, 1), height / Math.max(maxY - minY, 1));
  state.shift = -((minY + maxY) / 2) * state.fit;
  state.drop = rect.height / state.fit * .55 + CARD_H;
  const stage = $('ring-stage');
  stage.style.perspective = `${PERSPECTIVE}px`;
  stage.style.transform = `translate3d(0, ${state.shift}px, 0) scale(${state.fit})`;
}

function advance(dt, now) {
  if (state.intro && now - state.intro >= 1400) state.intro = null;
  const paused = state.hover || state.drag || now < state.holdUntil || document.body.classList.contains('panel-open');
  const cruise = !reduced && !paused && !state.intro ? SPEED * state.dir : 0;
  if (state.drag || state.intro) {
    if (!state.drag) state.velocity = 0;
  } else if (state.target !== null) {
    let remaining = dt;
    const damping = 2 * Math.sqrt(SPRING);
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 240);
      state.velocity += (SPRING * (state.target - state.angle) - damping * state.velocity) * h;
      state.angle += state.velocity * h;
      remaining -= h;
    }
    if (Math.abs(state.target - state.angle) < .004 && Math.abs(state.velocity) < .03) {
      state.angle = state.target;
      state.velocity = 0;
      state.target = null;
    }
  } else {
    const tau = .18 + MOMENTUM * 1.5;
    state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
    state.angle += state.velocity * dt;
    if (cruise === 0 && Math.abs(state.velocity) < SETTLE_SPEED) state.target = Math.round(state.angle / step) * step;
  }
  const ease = 1 - Math.exp(-dt / .35);
  const reach = reduced ? 0 : PARALLAX;
  state.yaw += ((state.pointer.inside ? state.pointer.x * reach * 9 : 0) - state.yaw) * ease;
  state.pitch += ((state.pointer.inside ? -state.pointer.y * reach * 6 : 0) - state.pitch) * ease;
}

function render(dt, now) {
  const elapsed = state.intro ? now - state.intro : 0;
  const R = RADIUS * (1 + (reduced ? 0 : STRETCH) * .12 * Math.min(1, Math.abs(state.velocity) / 420));
  $('ring-camera').style.transform = `translate3d(0, 0, ${-R}px) rotateX(${TILT + state.pitch}deg) rotateY(${state.yaw}deg)`;
  $('ring-ring').style.transform = `rotateY(${state.angle}deg)`;

  cards.forEach((card, index) => {
    const base = index * step, world = wrap(base + state.angle);
    let lift = 0;
    if (state.intro) {
      const delay = Math.abs(world) / 180 * 480;
      lift = Math.pow(1 - clamp((elapsed - delay) / 900, 0, 1), 5) * state.drop;
    }
    card.el.style.transform = `rotateY(${base}deg) translateZ(${R}px)` + (lift ? ` translateY(${lift}px)` : '');
    const facing = Math.cos(world * TO_RAD);
    card.el.style.setProperty('--cc-depth', (DEPTH_FADE * Math.pow((1 - facing) / 2, 1.25)).toFixed(3));

    // Foil on the cards facing you, tilting with the ring as they turn past
    if (card.foil && facing > -.2 && !reduced) {
      card.clock += dt;
      const t = card.clock;
      card.foil.draw(Math.sin(t * .7) * 5, clamp(world, -50, 50) * .4 + Math.sin(t * .53) * 4, .5 + Math.sin(t * .41 + world * .02) * .42, .38 + Math.sin(t * .33) * .3);
      for (const part of card.parts) {
        const c = part.g.canvas, fw = card.foil.canvas.width, fh = card.foil.canvas.height;
        part.g.clearRect(0, 0, c.width, c.height);
        part.g.drawImage(card.foil.canvas, part.sx * fw, 0, part.sw * fw, fh, 0, 0, c.width, c.height);
      }
    }
  });
}

function frame(now) {
  if (!running) return;
  requestAnimationFrame(frame);
  const dt = state.last ? Math.min((now - state.last) / 1000, .05) : 1 / 60;
  state.last = now;
  advance(dt, now);
  render(dt, now);
}

function focusIndex(index) {
  let target = -index * step;
  target += 360 * Math.round((state.angle - target) / 360);
  state.target = target;
  state.holdUntil = performance.now() + 2800;
}

function openCard(index, x = innerWidth / 2, y = innerHeight / 2) {
  focusIndex(index);
  site.spark(x, y);
  const { open, tab } = C.cards[index];
  site.open(open, tab);
}

/* ---------- Moving between the two scenes ---------- */
let tunnelStarted = false;

async function openDeck() {
  await fontsReady;
  document.body.classList.add('cards-open');
  $('deck').hidden = false;
  if (!built) build();
  if (!tunnelStarted) {
    tunnelStarted = true;
    lightTunnel($('tunnel'), $('tunnel').querySelector('canvas'), { dpr: 1, brightness: .3 });
  }
  measure();
  state.intro = reduced ? null : performance.now();
  state.last = 0;
  running = true;
  requestAnimationFrame(frame);
  $('deck-back').focus();
}

site.closeDeck = () => {
  running = false;
  $('deck').hidden = true;
  document.body.classList.remove('cards-open');
  $('folder-open').focus();
};

const ring = $('ring');
$('deck-back').onclick = site.closeDeck;
ring.addEventListener('pointerdown', (e) => {
  state.suppressClick = false;
  if (e.button) return;
  state.press = { id: e.pointerId, x: e.clientX, angle: state.angle, moved: false, origin: 0, samples: [{ time: performance.now(), angle: state.angle }] };
});
ring.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse') {
    const r = ring.getBoundingClientRect();
    state.pointer.inside = true;
    state.pointer.x = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1);
    state.pointer.y = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
  }
  const press = state.press;
  if (!press || press.id !== e.pointerId) return;
  const delta = e.clientX - press.x;
  if (!press.moved) {
    if (Math.abs(delta) < 5) return;
    press.moved = true;
    press.origin = delta;
    state.drag = true;
    state.target = null;
    state.velocity = 0;
    ring.dataset.dragging = '';
    try { ring.setPointerCapture(e.pointerId); } catch {}
  }
  state.angle = press.angle + (delta - press.origin) * 180 / (Math.PI * RADIUS * state.fit);
  const now = performance.now();
  press.samples.push({ time: now, angle: state.angle });
  while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
});
function release(e) {
  const press = state.press;
  if (!press || press.id !== e.pointerId) return;
  state.press = null;
  if (!press.moved) return;
  state.drag = false;
  delete ring.dataset.dragging;
  state.suppressClick = true;
  const first = press.samples[0], last = press.samples[press.samples.length - 1];
  const span = (last.time - first.time) / 1000;
  state.velocity = span > .008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
  if (Math.abs(state.velocity) > 60) state.dir = Math.sign(state.velocity);
}
ring.addEventListener('pointerup', release);
ring.addEventListener('pointercancel', release);
// The scene is full screen, so only a card under the pointer pauses the spin
ring.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') state.hover = !!e.target.closest('[data-cc-index]'); });
ring.addEventListener('pointerleave', (e) => {
  if (e.pointerType !== 'mouse') return;
  state.hover = false;
  state.pointer.inside = false;
});
ring.addEventListener('click', (e) => {
  if (state.suppressClick) { state.suppressClick = false; return; }
  const card = e.target.closest('[data-cc-index]');
  if (card) openCard(+card.dataset.ccIndex, e.clientX, e.clientY);
});
addEventListener('resize', () => { if (running) measure(); });

/* ---------- The folder and profile card float around, and can be dragged ---------- */
const floater = (el, speed, tilt) => ({ el, speed, tilt, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, hover: false, held: false, moved: false });
const folder = floater($('folder'), 90, .07);
const profile = floater($('hud'), 55, .02);
let lastFloat = 0;

function pickSpot(f) {
  // Phones have no spare room: the profile card stays above the PC, the folder below it
  const tall = innerWidth <= 760 && innerHeight > innerWidth, h = f.el.offsetHeight;
  for (let tries = 0; tries < 12; tries++) {
    f.tx = 8 + Math.random() * Math.max(1, innerWidth - f.el.offsetWidth - 16);
    f.ty = 8 + Math.random() * Math.max(1, innerHeight - h - 16);
    if (tall) f.ty = f === profile ? 8 + Math.random() * 16 : innerHeight - h - 8 - Math.random() * 16;
    if (f !== folder || !overlapsProfile(f.tx, f.ty, 32)) break;
  }
}

// The folder can't be clicked under the profile card, so it keeps clear of it
function overlapsProfile(x, y, margin) {
  const w = folder.el.offsetWidth, h = folder.el.offsetHeight, pw = profile.el.offsetWidth, ph = profile.el.offsetHeight;
  return x < profile.x + pw + margin && x + w > profile.x - margin && y < profile.y + ph + margin && y + h > profile.y - margin;
}

const place = (f) => { f.el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.held ? 0 : clamp(f.vx * f.tilt, -7, 7)}deg)`; };

function drift(f, dt) {
  const dx = f.tx - f.x, dy = f.ty - f.y, far = Math.hypot(dx, dy);
  if (far < 40) pickSpot(f);
  const top = f.hover ? 0 : f.speed;     // holds still under the pointer so it can be clicked
  f.vx += ((dx / (far || 1)) * top - f.vx) * Math.min(1, dt * 1.1);
  f.vy += ((dy / (far || 1)) * top - f.vy) * Math.min(1, dt * 1.1);
  if (f === folder && overlapsProfile(f.x, f.y, 16)) {
    const ox = f.x - profile.x + (f.el.offsetWidth - profile.el.offsetWidth) / 2;
    const oy = f.y - profile.y + (f.el.offsetHeight - profile.el.offsetHeight) / 2;
    const near = Math.hypot(ox, oy) || 1;
    f.vx += (ox / near) * 500 * dt;
    f.vy += (oy / near) * 500 * dt;
  }
  f.x = clamp(f.x + f.vx * dt, 8, Math.max(8, innerWidth - f.el.offsetWidth - 8));
  f.y = clamp(f.y + f.vy * dt, 8, Math.max(8, innerHeight - f.el.offsetHeight - 8));
  place(f);
}

function float(now) {
  requestAnimationFrame(float);
  const dt = Math.min((now - lastFloat) / 1000, .05);
  lastFloat = now;
  const body = document.body.classList;
  if (reduced || body.contains('no3d') || body.contains('cards-open') || body.contains('inside') || body.contains('panel-open')) return;
  for (const f of [folder, profile]) if (!f.held) drift(f, dt);
}

function draggable(f) {
  f.el.addEventListener('pointerenter', () => { f.hover = true; });
  f.el.addEventListener('pointerleave', () => { f.hover = false; });
  f.el.addEventListener('pointerdown', (e) => {
    f.moved = false;
    if (e.button || e.target.closest('a')) return;
    const start = { x: e.clientX, y: e.clientY, fx: f.x, fy: f.y, id: e.pointerId };
    const move = (m) => {
      if (m.pointerId !== start.id) return;
      const dx = m.clientX - start.x, dy = m.clientY - start.y;
      if (!f.moved && Math.hypot(dx, dy) < 5) return;
      f.moved = f.held = true;
      f.el.dataset.dragging = '';
      f.x = clamp(start.fx + dx, 8 - f.el.offsetWidth / 2, innerWidth - f.el.offsetWidth / 2);
      f.y = clamp(start.fy + dy, 8 - f.el.offsetHeight / 2, innerHeight - f.el.offsetHeight / 2);
      f.vx = f.vy = 0;
      place(f);
    };
    const end = (u) => {
      if (u.pointerId !== start.id) return;
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', end);
      removeEventListener('pointercancel', end);
      if (!f.held) return;
      f.held = f.hover = false;   // back to floating from wherever it was dropped
      delete f.el.dataset.dragging;
      pickSpot(f);
      // The release isn't a click on whatever it was dropped over
      site.justDropped = true;
      setTimeout(() => { site.justDropped = false; }, 60);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);
  });
}

folder.el.addEventListener('pointerenter', () => { folder.el.dataset.open = ''; });
folder.el.addEventListener('pointerleave', () => { delete folder.el.dataset.open; });
$('folder-sub').textContent = 'and skills';
$('folder-open').setAttribute('aria-label', 'Open projects and skills');
$('folder-open').onclick = (e) => {
  if (folder.moved) return;
  site.spark(e.clientX, e.clientY);
  openDeck();
};

draggable(folder);
draggable(profile);
const margin = innerWidth < 760 || innerHeight < 500 ? 16 : 24;
profile.x = profile.y = margin;
folder.x = 40;
folder.y = Math.max(8, innerHeight - folder.el.offsetHeight - 40);
for (const f of [folder, profile]) { pickSpot(f); place(f); }
lastFloat = performance.now();
requestAnimationFrame(float);

profileCard($('hud'));

// The card text needs the page fonts, so wait briefly for them
const fontsReady = Promise.race([
  Promise.all(['500 38px "IBM Plex Sans"', '400 22px "IBM Plex Sans"', '500 25px "IBM Plex Mono"'].map((f) => document.fonts.load(f))),
  new Promise((done) => setTimeout(done, 1500))
]).catch(() => {});
})();
