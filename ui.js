/* Everything that isn't 3D: panels, tabs, HUD, boot sequence and list view.
   This works on its own, so the site stays readable if WebGL or the CDN fails.
   Your text lives in content.js, not here. */

const C = window.CONTENT;
const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

// Text still holding a [placeholder] from content.js shows as one "Coming soon..." line
const paragraphs = (body) => {
  const lines = body.map((text) => (/\[[^\]]*\]/.test(text) ? 'Coming soon...' : text));
  return lines.filter((text, i) => text !== 'Coming soon...' || lines[i - 1] !== text)
    .map((text) => el('p', { textContent: text }));
};

const site = {
  scene: null,       // main.js fills this in when 3D is running
  open,
  fallback() {
    document.body.classList.add('no3d');
    $('plain').hidden = false;
  },
  setInside(inside) {
    document.body.classList.toggle('inside', inside);
    $('back').hidden = !inside;
  },
  spark() {}     // replaced below unless reduced motion is on
};
window.site = site;

/* ---------- Panels ---------- */
function projectPanel(body, p) {
  const shot = p.image
    ? [el('figure', {}, el('img', { src: p.image, alt: p.alt, loading: 'lazy' }),
      ...(p.caption ? [el('figcaption', { textContent: p.caption })] : []))]
    : [];
  body.append(
    ...shot,
    el('div', { className: 'project-text' }, ...paragraphs(p.body)),
    el('ul', { className: 'chips' }, ...p.tech.map((t) => el('li', { textContent: t }))),
    ...(p.link ? [el('a', { className: 'btn', href: p.link, target: '_blank', rel: 'noopener', textContent: 'View on GitHub' })] : [])
  );
}

function skillsPanel(body) {
  C.skills.forEach((s, i) => {
    body.append(el('section', { className: 'module' },
      el('h3', { textContent: s.group }),
      el('ul', { className: 'chips' }, ...s.items.map((t) => el('li', { textContent: t })))));
  });
}

let opener = null;

site.info = (id, tab = 0) => id === 'projects' ? { label: 'Project', title: C.projects[tab].title }
  : id === 'skills' ? { label: 'Skills', title: 'Skills' }
  : C.parts[id] || C.hobbies[id];

function open(id, tab) {
  const panel = $('panel'), body = $('panel-body');
  const info = site.info(id, tab);
  if (!info) return;

  if (panel.hidden) opener = document.activeElement;
  $('panel-chip').textContent = info.label;
  $('panel-title').textContent = info.title;
  body.replaceChildren();
  if (id === 'projects') projectPanel(body, C.projects[tab || 0]);
  else if (id === 'skills') skillsPanel(body);
  else body.append(...paragraphs(info.body));

  panel.hidden = false;
  panel.scrollTop = 0;
  document.body.classList.add('panel-open');
  panel.focus();
  site.scene?.panelOpened(id);
}

function close() {
  const panel = $('panel');
  if (panel.hidden) return;
  panel.hidden = true;
  document.body.classList.remove('panel-open');
  site.scene?.panelClosed();
  opener?.focus?.();
}

$('panel-close').onclick = close;
$('back').onclick = () => { close(); site.scene?.exit(); };
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('panel').hidden) close();
  else if (document.body.classList.contains('cards-open')) site.closeDeck();
  else if (document.body.classList.contains('inside')) site.scene?.exit();
});

/* ---------- Static text ---------- */
$('id-name').textContent = C.name;
$('id-major').textContent = C.major;
document.title = `${C.name} | Inside the PC`;
site.setInside(false);

const ICONS = {
  LinkedIn: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z',
  GitHub: 'M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.600 9.600 0 0 1 5 0c1.900-1.300 2.800-1 2.800-1 .5 1.400.2 2.400.1 2.700.6.700 1 1.600 1 2.700 0 3.900-2.300 4.700-4.500 5 .4.300.7.900.7 1.900V21c0 .3.200.6.700.500A10 10 0 0 0 12 2z'
};
for (const [name, url] of [['LinkedIn', C.linkedin], ['GitHub', C.github]]) {
  if (!url) { console.info(`${name} button hidden: add your link in content.js`); continue; }
  const a = el('a', { href: url, target: '_blank', rel: 'noopener' });
  a.setAttribute('aria-label', `${name} (opens in a new tab)`);
  a.className = 'profile-card__contact';
  a.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="${ICONS[name]}"/></svg>${name}`;
  $('hud-links').append(a);
}

/* ---------- Plain list: only shown when the 3D scene can't load ---------- */
const list = (title, items) => el('div', {}, el('h2', { textContent: title }),
  el('ul', {}, ...items.map(([id, label, tab]) => el('li', {}, el('button', { textContent: label, onclick: () => open(id, tab) })))));
$('plain').append(
  list('Work', [...C.projects.map((p, i) => ['projects', p.tab, i]), ['skills', 'Skills']]),
  list('About me', Object.entries(C.parts).map(([id, p]) => [id, p.title])),
  list('Life', Object.entries(C.hobbies).map(([id, h]) => [id, h.title]))
);
$('plain').hidden = false;


/* ---------- Shape Grid background ---------- */
addEventListener('DOMContentLoaded', () => shapeGrid($('grid'), document.querySelector('#grid canvas')));

/* ---------- Boot sequence: plays once per visit ---------- */
(function boot() {
  let seen = false;
  try { seen = sessionStorage.getItem('booted') === '1'; sessionStorage.setItem('booted', '1'); } catch {}
  if (seen || reduced) return;

  const screen = $('boot'), out = $('boot-text');
  const lines = [
    'POST ................. OK',
    'RGB CONTROLLER ....... OK',
    `Booting ${C.name}.exe...`,
    C.tagline
  ];
  const text = lines.join('\n');
  let i = 0, timer;
  const finish = () => {
    clearInterval(timer);
    screen.classList.add('done');
    setTimeout(() => { screen.hidden = true; }, 350);
  };
  screen.hidden = false;
  timer = setInterval(() => {
    out.textContent = text.slice(0, ++i);
    if (i >= text.length) { clearInterval(timer); setTimeout(finish, 500); }
  }, 22);
  $('boot-skip').onclick = finish;
})();

/* ---------- Sparks when you click a 3D model or PC part ---------- */
if (!reduced) {
  const canvas = el('canvas', { id: 'sparks' });
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const g = canvas.getContext('2d');
  const bursts = [];
  const LIFE = 380;

  function drawSparks(now) {
    g.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i], k = (now - b.start) / LIFE;
      if (k >= 1) { bursts.splice(i, 1); continue; }
      const reach = 34 * (1 - (1 - k) ** 3), len = 11 * (1 - k);
      g.strokeStyle = b.color;
      g.lineWidth = 2;
      g.beginPath();
      for (let n = 0; n < 8; n++) {
        const a = n * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
        g.moveTo(b.x + c * reach, b.y + s * reach);
        g.lineTo(b.x + c * (reach + len), b.y + s * (reach + len));
      }
      g.stroke();
    }
    if (bursts.length) requestAnimationFrame(drawSparks);
    else g.clearRect(0, 0, canvas.width, canvas.height);
  }

  site.spark = (x, y) => {
    canvas.width = innerWidth; canvas.height = innerHeight;
    const hue = getComputedStyle(document.documentElement).getPropertyValue('--hue');
    bursts.push({ x, y, start: performance.now(), color: `hsl(${hue} 95% 70%)` });
    if (bursts.length === 1) requestAnimationFrame(drawSparks);
  };
}
