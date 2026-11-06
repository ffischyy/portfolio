/* The 3D PC in the middle of the page, modelled from a photo of the real build.
   Words and links live in content.js, so you only need this file to change the model. */

// A plain script with dynamic imports, because browsers block module files
// when index.html is opened by double-clicking it.
(async () => {
const [THREE, { RoomEnvironment }] = await Promise.all([
  import('three'),
  import('three/addons/environments/RoomEnvironment.js')
]);

const { site, CONTENT: C } = window;
const canvas = document.getElementById('scene');
const tagLayer = document.getElementById('tags');
const mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PANEL_WIDTH = 480;   // matches --panel-w in style.css
const FOV = 38;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.42;

const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

/* ---------- Small helpers ---------- */
const mat = (color, metalness = 0.15, roughness = 0.42) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

const SHELL = mat(0x17191e, 0.6, 0.42);
const SHELL_DARK = mat(0x0e0f13, 0.5, 0.5);
const CHROME = mat(0xdde2e8, 1, 0.2);
const BLACK = mat(0x101216, 0.55, 0.42);
const CARBON = mat(0x1b1e24, 0.7, 0.34);
const SILVER = mat(0xa8afb8, 0.95, 0.28);
const GOLD = mat(0xc9a24a, 0.9, 0.3);

function box(w, h, d, m, x, y, z, parent) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z);
  parent.add(o);
  return o;
}
function cyl(r, h, m, x, y, z, parent, axis = 'y') {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40), m);
  o.position.set(x, y, z);
  if (axis === 'z') o.rotation.x = Math.PI / 2;
  if (axis === 'x') o.rotation.z = Math.PI / 2;
  parent.add(o);
  return o;
}
function tube(points, radius, m, parent) {
  const path = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  parent.add(new THREE.Mesh(new THREE.TubeGeometry(path, 64, radius, 12), m));
}
function canvasTexture(w, h, draw) {
  const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// The pastel light of the fans: a slowly turning pink, lilac and blue ring
const PASTEL = ['#ff7fcb', '#c88bff', '#6fb0ff', '#6fe3f5', '#fff2fa', '#ff9ccd', '#ff7fcb'];
const ringTexture = canvasTexture(512, 512, (g, w) => {
  const c = w / 2;
  const sweep = g.createConicGradient(0, c, c);
  PASTEL.forEach((col, i) => sweep.addColorStop(i / (PASTEL.length - 1), col));
  g.fillStyle = sweep;
  g.fillRect(0, 0, w, w);
});
const ringMat = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, toneMapped: false });

const glowTexture = canvasTexture(128, 128, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(.4, 'rgba(255,255,255,.28)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, w, w);
});
function glow(size, color, x, y, z, parent) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture, color, transparent: true, opacity: .24, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  s.scale.setScalar(size);
  s.position.set(x, y, z);
  parent.add(s);
  return s;
}

/* A fan with a white frame, translucent blades and a light ring.
   It faces +z until you rotate it. */
const rotors = [], rings = [];
const FAN_BLADE = (() => {
  const s = new THREE.Shape();
  s.moveTo(.12, -.05);
  s.bezierCurveTo(.2, -.17, .36, -.17, .44, -.1);
  s.bezierCurveTo(.4, .02, .26, .09, .12, .06);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: .008, bevelEnabled: false, curveSegments: 12 });
})();
const FAN_FRAME = (() => {
  const s = new THREE.Shape();
  const R = .06, H = .5;
  s.moveTo(-H + R, -H);
  s.lineTo(H - R, -H); s.quadraticCurveTo(H, -H, H, -H + R);
  s.lineTo(H, H - R); s.quadraticCurveTo(H, H, H - R, H);
  s.lineTo(-H + R, H); s.quadraticCurveTo(-H, H, -H, H - R);
  s.lineTo(-H, -H + R); s.quadraticCurveTo(-H, -H, -H + R, -H);
  s.holes.push(new THREE.Path().absarc(0, 0, .465, 0, Math.PI * 2, true));
  return new THREE.ExtrudeGeometry(s, { depth: .14, bevelEnabled: false, curveSegments: 48 });
})();
const bladeMat = new THREE.MeshStandardMaterial({ color: 0x2a2c34, transparent: true, opacity: .6, roughness: .25, side: THREE.DoubleSide, emissive: 0xffd7ee, emissiveIntensity: .12 });
const blackBlade = mat(0x16181d, .3, .4);
const fanFill = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, toneMapped: false, transparent: true, opacity: .9 });

function makeFan(size, { frame = true, dark = false, phase = 0 } = {}) {
  const fan = new THREE.Group(), rotor = new THREE.Group();
  if (frame) {
    const body = new THREE.Mesh(FAN_FRAME, SHELL);
    body.position.z = -.07;
    fan.add(body);
    for (const x of [-.42, .42]) for (const y of [-.42, .42]) cyl(.018, .01, CHROME, x, y, .075, fan, 'z');
  }
  const ring = new THREE.Mesh(new THREE.RingGeometry(dark ? .43 : .4, .465, 64), ringMat);
  ring.position.z = .072;
  ring.rotation.z = phase;
  fan.add(ring);
  rings.push(ring);

  if (!dark) {
    const fill = new THREE.Mesh(new THREE.CircleGeometry(.46, 48), fanFill);
    fill.position.z = -.06;
    fill.rotation.z = phase + 2;
    fan.add(fill);
    rings.push(fill);
  }
  cyl(.135, .1, dark ? BLACK : SHELL, 0, 0, 0, rotor, 'z');
  const hub = new THREE.Mesh(new THREE.RingGeometry(.075, .115, 48), ringMat);
  hub.position.z = .052;
  rotor.add(hub);
  for (let i = 0; i < 9; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = i * Math.PI * 2 / 9;
    const b = new THREE.Mesh(FAN_BLADE, dark ? blackBlade : bladeMat);
    b.rotation.x = .36;
    arm.add(b);
    rotor.add(arm);
  }
  fan.add(rotor);
  fan.scale.setScalar(size);
  rotors.push(rotor);
  return fan;
}

/* ---------- Clickable things ---------- */
const spots = [];
const frameMat = new THREE.LineBasicMaterial({ color: 0xffffff });

// Adds an invisible click box, a selection frame shown on hover, and a label
function spot(id, label, group, anchor, { kind, view, distance } = {}) {
  const bounds = new THREE.Box3().setFromObject(group);
  const size = bounds.getSize(new THREE.Vector3()).addScalar(.08);
  const center = bounds.getCenter(new THREE.Vector3()).sub(group.position);

  const hit = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z));
  hit.visible = false;
  hit.position.copy(center);
  group.add(hit);

  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(hit.geometry), frameMat);
  frame.visible = false;
  frame.position.copy(center);
  group.add(frame);

  const tag = document.createElement('button');
  tag.className = kind === 'pc' ? 'tag tag--keyboard' : 'tag';
  tag.textContent = label;
  const s = { id, group, hit, frame, tag, kind, center, view, distance, anchor: new THREE.Vector3(...anchor), shown: true };
  tag.onclick = () => {
    const r = tag.getBoundingClientRect();
    activate(s, r.left + r.width / 2, r.top + r.height / 2);
  };
  tag.onmouseenter = tag.onfocus = () => setHot(s);
  tag.onmouseleave = tag.onblur = () => setHot(null);
  tagLayer.append(tag);

  hit.userData.spot = s;
  spots.push(s);
  return s;
}

/* ---------- The PC ---------- */
const pc = new THREE.Group();
scene.add(pc);
const W = 4.2, H = 3.9, D = 2.9;      // case width, height, depth
const TRAY = -.72;                    // z of the motherboard tray

function buildCase() {
  const P = .07;   // frame bar thickness
  for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) box(P, H, P, SHELL, x, 0, z, pc);
  for (const y of [-H / 2, H / 2]) {
    for (const z of [-D / 2, D / 2]) box(W, P, P, SHELL, 0, y, z, pc);
    for (const x of [-W / 2, W / 2]) box(P, P, D, SHELL, x, y, 0, pc);
  }
  // Chrome bolts at the corners, as on the real case
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    cyl(.05, .03, CHROME, x * (W / 2 - .02), y * (H / 2 - .02), D / 2 + .05, pc, 'z');
    if (x > 0) cyl(.05, .03, CHROME, W / 2 + .05, y * (H / 2 - .02), D / 2 - .02, pc, 'x');
  }
  // Feet
  for (const x of [-1.8, 1.8]) for (const z of [-1.15, 1.15]) {
    cyl(.17, .09, SHELL, x, -H / 2 - .09, z, pc);
    cyl(.13, .03, CHROME, x, -H / 2 - .15, z, pc);
  }

  // Floor and tray
  box(W, .04, D, SHELL_DARK, 0, -H / 2 + .02, 0, pc);
  box(W - .1, H - .1, .05, SHELL_DARK, 0, 0, TRAY - .06, pc);
  box(W, H, .04, SHELL, 0, 0, -D / 2, pc);

  // Rear wall: perforated steel
  const vent = canvasTexture(512, 512, (g, w) => {
    g.fillStyle = '#17191e';
    g.fillRect(0, 0, w, w);
    g.fillStyle = '#030304';
    for (let y = 0; y < 34; y++) for (let x = 0; x < 34; x++) {
      g.beginPath();
      g.arc(10 + x * 15 + (y % 2) * 7.5, 10 + y * 15, 4.6, 0, 7);
      g.fill();
    }
  });
  box(.04, H, D, new THREE.MeshStandardMaterial({ map: vent, metalness: .2, roughness: .5 }), -W / 2 + .03, 0, 0, pc);

  // Glass on the long side, the fan side and the top
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x8d99a8, metalness: .1, roughness: .03, transparent: true, opacity: .12, depthWrite: false, envMapIntensity: 1.6 });
  const panes = [
    box(W, H, .025, glassMat, 0, 0, D / 2, pc),
    box(.025, H, D, glassMat, W / 2, 0, 0, pc),
    box(W, .025, D, glassMat, 0, H / 2, 0, pc)
  ];
  pc.userData.glass = { material: glassMat, panes };
}

function buildMotherboard() {
  const group = new THREE.Group();
  const tex = canvasTexture(1400, 1260, (g, w, h) => {
    g.fillStyle = '#131519';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2b2f37';
    g.fillStyle = '#3a3f49';
    g.lineWidth = 2;
    const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    for (let i = 0; i < 190; i++) {
      let x = Math.round(Math.random() * w / 16) * 16, y = Math.round(Math.random() * h / 16) * 16;
      let d = Math.floor(Math.random() * 8);
      g.beginPath();
      g.moveTo(x, y);
      for (let s = 0; s < 5; s++) {
        const len = 16 * (1 + Math.floor(Math.random() * 6));
        x += dirs[d][0] * len;
        y += dirs[d][1] * len;
        g.lineTo(x, y);
        d = (d + [7, 0, 1][Math.floor(Math.random() * 3)]) % 8;
      }
      g.stroke();
      g.beginPath();
      g.arc(x, y, 3.5, 0, 7);
      g.fill();
    }
    g.fillStyle = '#aab1bc';
    g.font = '700 30px monospace';
    g.fillText(C.name.toUpperCase(), 860, 560);
    g.font = '400 22px monospace';
    g.fillText('COMPUTER ENGINEERING', 860, 594);
    g.fillText('UNIVERSITY OF GUELPH', 860, 622);
  });
  box(3.1, 2.8, .05, new THREE.MeshStandardMaterial({ map: tex, metalness: .15, roughness: .55 }), -.42, .5, TRAY, group);

  // Rear I/O shroud and power stage heatsinks with cooling fins
  box(.62, 1.12, .3, SHELL, -1.62, 1.28, TRAY + .17, group);
  box(.5, .03, .31, SILVER, -1.62, 1.6, TRAY + .17, group);
  box(1.4, .3, .22, SHELL, -.55, 1.72, TRAY + .13, group);
  for (let i = 0; i < 9; i++) box(.05, .24, .03, SHELL_DARK, -1.15 + i * .15, 1.72, TRAY + .25, group);
  box(.3, .86, .2, SHELL, -1.16, 1.02, TRAY + .12, group);

  // Chipset cover and PCIe slots above the GPU
  box(.7, .28, .1, SHELL, .62, -.86, TRAY + .07, group);
  box(.5, .2, .04, CHROME, -1.5, -.8, TRAY + .05, group);
  box(.04, .5, .1, SHELL_DARK, 1.02, .9, TRAY + .07, group);

  // Motherboard power connector
  box(.16, .8, .14, SHELL_DARK, .98, .7, TRAY + .09, group);
  pc.add(group);
  spot('motherboard', C.parts.motherboard.label, group, [-.9, 1.16, TRAY + .14], { kind: 'part', distance: 6.4, view: [-.1, .05, 1] });
}

function buildCooler() {
  // Pump block: a white square body with a mirrored diamond light on top
  const cpu = new THREE.Group();
  const X = -.34, Y = .78, Z = TRAY + .03;
  box(.74, .74, .04, SILVER, X, Y, Z + .02, cpu);
  box(.68, .68, .17, SHELL, X, Y, Z + .13, cpu);
  box(.6, .6, .03, SHELL_DARK, X, Y, Z + .23, cpu);
  const logo = canvasTexture(256, 256, (g, w) => {
    g.fillStyle = '#15171c';
    g.fillRect(0, 0, w, w);
    const c = w / 2;
    const facets = [['#ffb3e0', -1, -1], ['#9fd0ff', 1, -1], ['#d6a8ff', -1, 1], ['#8fe8f5', 1, 1]];
    for (const [col, sx, sy] of facets) {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(c, c);
      g.lineTo(c + sx * 92, c);
      g.lineTo(c, c + sy * 92);
      g.closePath();
      g.fill();
    }
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(c, c - 34); g.lineTo(c + 34, c); g.lineTo(c, c + 34); g.lineTo(c - 34, c);
    g.closePath();
    g.fill();
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.54, .54), new THREE.MeshBasicMaterial({ map: logo, toneMapped: false }));
  face.position.set(X, Y, Z + .252);
  face.rotation.z = Math.PI / 4;
  face.scale.setScalar(.82);
  cpu.add(face);
  glow(.8, 0xffc9ec, X, Y, Z + .4, cpu);
  pc.add(cpu);
  spot('cpu', C.parts.cpu.label, cpu, [X - .56, Y, Z + .3], { kind: 'part' });

  // The two thick white coolant hoses, rising to the top radiator
  const hose = mat(0x17191d, .1, .45);
  tube([[X + .1, Y + .3, Z + .2], [X + .35, Y + .95, Z + .45], [X + .5, Y + 1.15, Z + .9], [X + 1.2, Y + .96, Z + 1.05]], .062, hose, pc);
  tube([[X + .24, Y + .3, Z + .2], [X + .6, Y + .75, Z + .55], [X + .85, Y + .95, Z + .75], [X + 1.5, Y + .96, Z + .78]], .062, hose, pc);
  for (const [x, z] of [[X + .1, Z + .2], [X + .24, Z + .2]]) cyl(.08, .1, SILVER, x, Y + .3, z, pc);
}

function buildRam() {
  const ram = new THREE.Group();
  const strip = canvasTexture(32, 256, (g, w, h) => {
    const r = g.createLinearGradient(0, 0, 0, h);
    PASTEL.forEach((col, i) => r.addColorStop(i / (PASTEL.length - 1), col));
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  });
  const light = new THREE.MeshBasicMaterial({ map: strip, toneMapped: false });
  [.24, .4, .56, .72].forEach((x) => {
    box(.1, 1.36, .36, SHELL, x, .78, TRAY + .2, ram);
    box(.11, 1.3, .02, CHROME, x, .78, TRAY + .1, ram);
    box(.07, 1.34, .05, light, x, .78, TRAY + .4, ram);
  });
  glow(.9, 0xc8d8ff, .48, .8, TRAY + .55, ram);
  pc.add(ram);
  spot('ram', C.parts.ram.label, ram, [.48, 1.56, TRAY + .4], { kind: 'part' });
}

function buildSsd() {
  const ssd = new THREE.Group();
  box(1.18, .26, .03, mat(0x1b3a2c, .2, .6), -.62, .12, TRAY + .04, ssd);
  box(1.08, .24, .07, SHELL_DARK, -.62, .12, TRAY + .08, ssd);
  for (let i = 0; i < 12; i++) box(.05, .2, .02, SHELL, -1.1 + i * .087, .12, TRAY + .125, ssd);
  pc.add(ssd);
  spot('ssd', C.parts.ssd.label, ssd, [-.98, .12, TRAY + .16], { kind: 'part' });
}

function buildGpu() {
  const gpu = new THREE.Group();
  const X = -.32, Y = -.42, Z = TRAY + .68, L = 3.1, T = .78, Dp = 1.2;

  // The long side faces the glass and carries the printing from the photo
  const side = canvasTexture(1400, 352, (g, w, h) => {
    const r = g.createLinearGradient(0, 0, 0, h);
    r.addColorStop(0, '#2a2d34');
    r.addColorStop(.5, '#121418');
    r.addColorStop(1, '#0a0b0e');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
    // Angled panels of the shroud
    g.fillStyle = '#1c1f25';
    g.beginPath();
    g.moveTo(760, 0); g.lineTo(980, 0); g.lineTo(860, h); g.lineTo(640, h);
    g.closePath();
    g.fill();
    g.strokeStyle = '#3c414a';
    g.lineWidth = 4;
    for (const x of [640, 860, 1020]) { g.beginPath(); g.moveTo(x + 120, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = '#f3f4f6';
    g.font = '700 74px Arial, sans-serif';
    g.fillText('GEFORCE RTX', 70, 200);
    g.font = '700 italic 118px Arial, sans-serif';
    g.fillText('msi', 1070, 214);
    g.fillStyle = '#c3322f';
    g.fillRect(1060, 246, 200, 6);
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(L, T, Dp), [
    CARBON, CARBON, CARBON, BLACK,
    new THREE.MeshStandardMaterial({ map: side, metalness: .55, roughness: .38 }), CARBON
  ]);
  body.position.set(X, Y, Z);
  gpu.add(body);

  // Backplate, silver spine, light bar and the end cap
  box(L, .05, Dp + .02, SILVER, X, Y + T / 2 + .03, Z, gpu);
  box(L - .3, .03, .3, CARBON, X, Y + T / 2 + .07, Z, gpu);
  box(L + .02, .05, .03, SILVER, X, Y - T / 2 + .02, Z + Dp / 2 + .02, gpu);
  box(.05, T + .06, Dp + .04, SILVER, X + L / 2 + .03, Y, Z, gpu);
  box(L * .9, .018, .018, ringMat, X, Y + T / 2 + .02, Z + Dp / 2 + .02, gpu);
  for (const x of [-1, 0, 1]) {
    const f = makeFan(.98, { frame: false, dark: true, phase: x });
    f.position.set(X + x * 1, Y - T / 2 - .02, Z);
    f.rotation.x = Math.PI / 2;
    gpu.add(f);
  }
  box(.18, .34, .3, SILVER, X - L / 2 + .02, Y + .1, TRAY + .1, gpu);
  pc.add(gpu);
  spot('gpu', C.parts.gpu.label, gpu, [X + .1, Y + .22, Z + Dp / 2 + .1], { kind: 'part', distance: 5.6 });

  // White sleeved power cables running from behind the tray into the card
  const cable = mat(0x1b1d22, .1, .6);
  for (let i = 0; i < 6; i++) {
    const x = .55 + i * .05;
    tube([[x, .02 - i * .004, TRAY + .04], [x, .36, TRAY + .4], [x, .24, Z + .1], [x, Y + T / 2 + .05, Z + .05]], .018, cable, pc);
  }
}

function buildPsu() {
  // The real power supply hides behind the tray, so a window in the tray shows it
  const psu = new THREE.Group();
  box(1.3, .62, .7, mat(0x17191e, .5, .4), -1.05, -1.45, TRAY - .1, psu);
  box(.6, .16, .02, GOLD, -1.05, -1.45, TRAY + .26, psu);
  box(1.3, .03, .02, ringMat, -1.05, -1.2, TRAY + .26, psu);
  pc.add(psu);
  spot('psu', C.parts.psu.label, psu, [-1.05, -1.72, TRAY + .3], { kind: 'part' });
}

function buildFans() {
  // Three on the side, facing out through the glass, are the clickable group
  const fans = new THREE.Group();
  box(.16, 3.4, 1.2, SHELL_DARK, W / 2 - .52, 0, -.05, fans);
  [1.16, 0, -1.16].forEach((y, i) => {
    const f = makeFan(1.14, { phase: i * 1.4 });
    f.position.set(W / 2 - .36, y, -.05);
    f.rotation.y = Math.PI / 2;
    fans.add(f);
    glow(2, [0xffbfe4, 0xbdd4ff, 0xe3c7ff][i], W / 2 - .2, y, -.05, fans);
  });
  pc.add(fans);
  spot('fans', C.parts.fans.label, fans, [W / 2 - .1, 0, .2], { kind: 'part', view: [1, .05, .5], distance: 7 });

  // Three on top under the radiator, three on the floor
  box(3.5, .18, 1.2, SHELL_DARK, -.2, H / 2 - .16, .35, pc);
  [-1.32, -.15, 1.02].forEach((x, i) => {
    const top = makeFan(1.12, { phase: i + 2 });
    top.position.set(x, H / 2 - .36, .35);
    top.rotation.x = Math.PI / 2;
    pc.add(top);
    glow(1.9, [0xffc6e6, 0xcfdcff, 0xe6ccff][i], x, H / 2 - .55, .35, pc);

    const floor = makeFan(1.12, { phase: i });
    floor.position.set(x, -H / 2 + .2, .5);
    floor.rotation.x = -Math.PI / 2;
    pc.add(floor);
    glow(2.1, [0xbfdcff, 0xffc2e6, 0xbff0ff][i], x, -H / 2 + .4, .5, pc);
  });
}

buildCase();
buildMotherboard();
buildCooler();
buildRam();
buildSsd();
buildGpu();
buildPsu();
buildFans();
spot('pc', 'Open the PC', pc, [0, H / 2 + .42, 0], { kind: 'pc' });

const lightA = new THREE.PointLight(0xffffff, 9, 8), lightB = new THREE.PointLight(0xffffff, 8, 8);
lightA.position.set(.2, 1.1, .5);
lightB.position.set(-.3, -1.1, .7);
pc.add(lightA, lightB);
scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x50507a, 1));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(4, 5, 9);
scene.add(key);

/* ---------- Camera moves ---------- */
let inside = false, focus = null, panelOpen = false, tween = null;
let enterAmt = 0;   // 0 = outside the case, 1 = inside it

function applyView(duration = 1.5) {
  const asp = camera.aspect;
  const p = new THREE.Vector3(), l = new THREE.Vector3();

  if (focus) {
    const dir = new THREE.Vector3(...(focus.view || [-.3, .1, 1])).normalize();
    const d = Math.max(focus.distance || 4.6, 1.6 / (TAN * asp));
    l.copy(focus.center);
    p.copy(l).addScaledVector(dir, d);
  } else if (inside) {
    const d = Math.max(7.8, 2.5 / (TAN * asp));
    p.set(.42, .12, 1).normalize().multiplyScalar(d);
  } else {
    const d = Math.max(10.6, 3.4 / (TAN * asp));
    p.set(0, d * .27, d);
  }

  if (inside && panelOpen && innerWidth > 760) {
    // Slide the view so the part sits beside the panel, not behind it
    const right = new THREE.Vector3().subVectors(l, p).normalize().cross(camera.up).normalize();
    const shift = (PANEL_WIDTH / 2 / innerWidth) * 2 * p.distanceTo(l) * TAN * asp;
    p.addScaledVector(right, shift);
    l.addScaledVector(right, shift);
  }

  if (reduced || !duration) {
    camPos.copy(p); camLook.copy(l); tween = null;
  } else {
    tween = { t: 0, duration, p0: camPos.clone(), l0: camLook.clone(), p1: p, l1: l };
  }
}

function setInside(value) {
  inside = value;
  site.setInside(value);
}

function activate(s, x, y) {
  setHot(null);
  site.spark(x, y);
  if (s.kind === 'pc') { setInside(true); applyView(); }
  else site.open(s.id);
}

/* ---------- Pointer ---------- */
const pointer = new THREE.Vector2(), parallax = new THREE.Vector2();
const ray = new THREE.Raycaster();
let hot = null, pointerMoved = false, overPage = false;

function setHot(s) {
  if (hot === s) return;
  if (hot) { hot.frame.visible = false; hot.tag.classList.remove('hot'); }
  hot = s;
  if (hot) { hot.frame.visible = true; hot.tag.classList.add('hot'); }
  document.body.style.cursor = s ? (s.kind === 'pc' ? 'grab' : 'pointer') : '';
}

const activeSpots = () => spots.filter((s) => (s.kind === 'part') === inside);

function pick() {
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(activeSpots().map((s) => s.hit), false)[0];
  return hit ? hit.object.userData.spot : null;
}

// The canvas sits above the folder and lets clicks through, so hits are worked out here
const UI = '#hud,#panel,#plain,#back,.tag,#boot,#deck';

function track(e) {
  pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  overPage = !e.target.closest?.(UI);
  pointerMoved = true;
}
addEventListener('pointermove', track);

// The PC floats around and can be dragged. It goes to the middle while you're inside the case.
const pcSpot = new THREE.Vector3(), pcTarget = new THREE.Vector3(), pcSpeed = new THREE.Vector3(), pcAim = new THREE.Vector3();
let pcDrag = null;

addEventListener('pointerdown', (e) => {
  if (e.button) return;
  track(e);
  if (!overPage || inside || pick()?.kind !== 'pc') return;
  e.stopPropagation();   // the PC is in front of the folder, so it gets the press
  pcDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, from: pcSpot.clone(), moved: false };
}, true);
addEventListener('pointermove', (e) => {
  if (!pcDrag || e.pointerId !== pcDrag.id) return;
  const dx = e.clientX - pcDrag.x, dy = e.clientY - pcDrag.y;
  if (!pcDrag.moved && Math.hypot(dx, dy) < 5) return;
  pcDrag.moved = true;
  document.body.style.cursor = 'grabbing';
  const unit = 2 * camera.position.distanceTo(camLook) * TAN / innerHeight;
  pcSpot.copy(pcDrag.from)
    .addScaledVector(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), dx * unit)
    .addScaledVector(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1), -dy * unit);
});
for (const type of ['pointerup', 'pointercancel']) {
  addEventListener(type, (e) => {
    if (e.pointerId !== pcDrag?.id) return;
    justDragged = pcDrag.moved;
    if (justDragged) pickPcSpot();
    pcDrag = null;
    document.body.style.cursor = '';
  });
}
let justDragged = false;

function pickPcSpot() {
  const halfH = camera.position.distanceTo(camLook) * TAN, halfW = halfH * camera.aspect;
  const room = (a) => Math.max(0, a) * (Math.random() * 2 - 1);
  pcTarget.set(room(halfW - 3), room(halfH - 2.6), 0);
  if (innerWidth <= 760 && innerHeight > innerWidth) {
    // Phones: sway in the gap between the profile card and the folder
    const top = document.getElementById('hud').offsetHeight + 8, bottom = innerHeight - document.getElementById('folder').offsetHeight - 8;
    pcTarget.set(room(.5), (innerHeight - top - bottom) * halfH / innerHeight + room(.3), 0);
  }
}

function floatPc(dt) {
  if (pcSpot.distanceTo(pcTarget) < .5) pickPcSpot();
  // Holds still under the pointer so it can be clicked
  pcAim.copy(pcTarget).sub(pcSpot).normalize().multiplyScalar(hot === spots.find((s) => s.kind === 'pc') ? 0 : .75);
  pcSpeed.lerp(pcAim, Math.min(1, dt * 1.1));
  pcSpot.addScaledVector(pcSpeed, dt);
}

addEventListener('click', (e) => {
  track(e);
  if (justDragged) { justDragged = false; e.stopPropagation(); return; }
  if (!overPage || site.justDropped) return;
  const s = pick();
  if (!s) return;
  e.stopPropagation();
  activate(s, e.clientX, e.clientY);
}, true);

site.scene = {
  exit() { focus = null; setInside(false); applyView(); },
  panelOpened(id) {
    panelOpen = true;
    setHot(null);
    const s = spots.find((x) => x.id === id && x.kind === 'part');
    if (s) { focus = s; setInside(true); }
    else focus = null;
    applyView(s ? 1.2 : .9);
  },
  panelClosed() { panelOpen = false; focus = null; applyView(.9); }
};

/* ---------- Layout ---------- */
function resize() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  applyView(0);
}
addEventListener('resize', resize);
resize();

/* ---------- Main loop ---------- */
// requestAnimationFrame stops by itself while the tab is hidden
const clock = new THREE.Clock();
const v = new THREE.Vector3();
const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
let t = 0, frames = 0, fpsTime = 0, slowSeconds = 0;

function animate() {
  requestAnimationFrame(animate);
  const raw = clock.getDelta();
  if (document.body.classList.contains('cards-open')) return;   // the PC rests in the card scene
  const dt = Math.min(raw, .1);
  if (!reduced) t += dt;

  enterAmt = reduced ? +inside : THREE.MathUtils.clamp(enterAmt + (inside ? dt : -dt) / 1.2, 0, 1);
  const A = ease(enterAmt);

  // The interface accent follows the PC's lighting
  const hue = (t * .03) % 1;
  if (frames % 15 === 0 && !reduced) document.documentElement.style.setProperty('--hue', hue * 360);
  lightA.color.setHSL(hue, .75, .78);
  lightB.color.setHSL((hue + .35) % 1, .75, .78);

  if (!panelOpen && !reduced) {
    for (const r of rotors) r.rotation.z -= dt * 6;
    for (const r of rings) r.rotation.z += dt * .4;
  }

  // Drifts side to side so the glass always faces the viewer
  pc.rotation.y = (-.4 + Math.sin(t * .22) * .2) * (1 - A) + -.34 * A;
  pc.rotation.x = .03 * (1 - A);
  if (!reduced && !inside && !panelOpen && !pcDrag && enterAmt === 0) floatPc(dt);
  pc.position.copy(pcSpot).multiplyScalar(1 - A);
  pc.position.y += Math.sin(t * .6) * .07 * (1 - A);
  const { material: glass, panes } = pc.userData.glass;
  glass.opacity = .12 * (1 - A);
  for (const pane of panes) pane.visible = A < .98;

  if (tween) {
    tween.t = Math.min(tween.t + dt / tween.duration, 1);
    const k = ease(tween.t);
    camPos.lerpVectors(tween.p0, tween.p1, k);
    camLook.lerpVectors(tween.l0, tween.l1, k);
    if (tween.t === 1) tween = null;
  }
  if (!mobile && !reduced && !panelOpen) parallax.lerp(pointer, .05);
  camera.position.copy(camPos);
  camera.position.x += parallax.x * .4;
  camera.position.y += parallax.y * .25;
  camera.lookAt(camLook);
  camera.updateMatrixWorld();

  if (pointerMoved && !mobile && !panelOpen) {
    pointerMoved = false;
    const settled = enterAmt > .85 || enterAmt < .15;
    setHot(settled && overPage ? pick() : null);
  }

  // Keep each label on its part
  const settled = inside ? enterAmt > .85 : enterAmt < .15;
  for (const s of spots) {
    const show = settled && (s.kind === 'part') === inside;
    if (show !== s.shown) { s.shown = show; s.tag.hidden = !show; }
    if (!show) continue;
    v.copy(s.anchor);
    s.group.localToWorld(v);
    v.project(camera);
    s.tagWidth ||= s.tag.offsetWidth;
    // Keep the label on screen even when its part sits near the edge
    const edge = s.tagWidth / 2 + 6;
    const x = THREE.MathUtils.clamp((v.x + 1) / 2 * innerWidth, edge, Math.max(edge, innerWidth - edge));
    s.tag.style.transform = `translate(${x}px, ${(1 - v.y) / 2 * innerHeight}px) translate(-50%, -50%)`;
  }

  renderer.render(scene, camera);

  frames++; fpsTime += raw;
  if (fpsTime >= 1) {
    const fps = frames / fpsTime;
    frames = 0; fpsTime = 0;
    // Slow GPU? Trade sharpness for smoothness. Under 4 fps means a throttled
    // background tab, not a slow GPU, so it doesn't count.
    slowSeconds = fps < 26 && fps > 4 ? slowSeconds + 1 : 0;
    if (slowSeconds >= 3 && renderer.getPixelRatio() > 1) {
      slowSeconds = 0;
      renderer.setPixelRatio(1);
    }
  }
}
animate();
})().catch((err) => {
  console.error(err);
  site.fallback();   // no WebGL, CDN down or a startup crash: show the list instead
});
