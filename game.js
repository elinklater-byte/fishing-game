(() => {
'use strict';

// ======================================================================
//  DATA
// ======================================================================
const W = 960, H = 760, SURF = 130;          // canvas size and water line
const PX_PER_M = 10;                          // 10px of depth = 1 metre

// Deeper fish are worth more and take more hits.  `boat` = boat level needed.
const SPECIES = [
  { id:'sardine',   name:'Sardine',       min:15,  max:85,  value:4,   hp:1,  size:12, speed:75,  color:'#9fb3c8', belly:'#eef3f7', boat:0, weight:10 },
  { id:'bluegill',  name:'Bluegill',      min:40,  max:125, value:8,   hp:1,  size:15, speed:55,  color:'#3f86bf', belly:'#f2c46d', boat:0, weight:8 },
  { id:'mackerel',  name:'Mackerel',      min:95,  max:190, value:16,  hp:2,  size:18, speed:85,  color:'#2f7a68', belly:'#dfe9e4', boat:0, weight:6, stripes:true },
  { id:'snapper',   name:'Red Snapper',   min:165, max:265, value:30,  hp:3,  size:21, speed:60,  color:'#d9534f', belly:'#f6b8a8', boat:0, weight:5 },
  { id:'grouper',   name:'Grouper',       min:235, max:335, value:50,  hp:5,  size:26, speed:42,  color:'#7a6a4f', belly:'#c9b88f', boat:0, weight:4, spots:true },
  { id:'tuna',      name:'Bluefin Tuna',  min:300, max:410, value:85,  hp:7,  size:28, speed:95,  color:'#1f3f73', belly:'#c8d4e6', boat:1, weight:4 },
  { id:'swordfish', name:'Swordfish',     min:370, max:480, value:140, hp:9,  size:28, speed:85,  color:'#4b5d8a', belly:'#cfd8ea', boat:1, weight:3, kind:'sword' },
  { id:'hammer',    name:'Hammerhead',    min:440, max:560, value:240, hp:12, size:34, speed:65,  color:'#6b7b86', belly:'#d5dde2', boat:2, weight:3, kind:'hammer' },
  { id:'angler',    name:'Anglerfish',    min:510, max:605, value:380, hp:15, size:24, speed:35,  color:'#3b2a3f', belly:'#5b4a5f', boat:2, weight:2, kind:'angler' },
  { id:'marlin',    name:'Golden Marlin', min:555, max:620, value:650, hp:20, size:32, speed:105, color:'#e8b923', belly:'#fff1b8', boat:3, weight:1.6, kind:'sword', gold:true },
];

const BOATS = [
  { name:'Tiny Raft',    cost:50,   w:130, note:'Floats… mostly.' },
  { name:'Rowboat',      cost:700,  w:180, note:'Unlocks Tuna & Swordfish' },
  { name:'Fishing Boat', cost:2200, w:240, note:'Unlocks Hammerheads & Anglerfish' },
  { name:'Trawler',      cost:6000, w:300, note:'Unlocks the Golden Marlin!' },
];
const RODS = [
  { name:'Rusty Rod',      cost:30,   speed:170 },
  { name:'Bamboo Rod',     cost:150,  speed:230 },
  { name:'Fiberglass Rod', cost:420,  speed:300 },
  { name:'Carbon Rod',     cost:1000, speed:380 },
  { name:'Legend Rod',     cost:2500, speed:470 },
];
const LURES = [
  { name:'Bent Hook',    cost:0,    power:1, color:'#9aa4ad' },
  { name:'Spinner',      cost:100,  power:2, color:'#e9a91c' },
  { name:'Silver Spoon', cost:320,  power:3, color:'#e6eef5' },
  { name:'Glow Jig',     cost:850,  power:5, color:'#7dff9a' },
  { name:'Golden Lure',  cost:2000, power:8, color:'#ffd34d' },
];
const LINES = [   // "slack" — how far the lure can go from the rod tip
  { name:'Short Slack',    cost:0,    len:150 },
  { name:'Longer Line',    cost:60,   len:220 },
  { name:'Deep Line',      cost:240,  len:310 },
  { name:'Deeper Line',    cost:650,  len:410 },
  { name:'Abyss Line',     cost:1400, len:520 },
  { name:'Bottomless Line',cost:3000, len:650 },
];
const KNIVES = [
  { name:'Old Knife',     cost:0,    chops:5, mult:1.0 },
  { name:'Steel Knife',   cost:80,   chops:4, mult:1.2 },
  { name:"Chef's Knife",  cost:280,  chops:3, mult:1.4 },
  { name:'Fillet Master', cost:750,  chops:2, mult:1.7 },
  { name:'Dragon Blade',  cost:2000, chops:1, mult:2.0 },
];
const BUCKETS = [
  { name:'Small Bucket', cost:0,    cap:4 },
  { name:'Big Bucket',   cost:100,  cap:6 },
  { name:'Cooler',       cost:350,  cap:8 },
  { name:'Big Cooler',   cost:900,  cap:10 },
  { name:'Fish Hold',    cost:2000, cap:12 },
];

const SHOP = [
  { key:'boat',   kind:'Boat',   icon:'⛵', list:BOATS,   stat:b => b.note },
  { key:'rod',    kind:'Rod',    icon:'🎣', list:RODS,    stat:r => `Lure moves ${r.speed} speed` },
  { key:'lure',   kind:'Lure',   icon:'🪝', list:LURES,   stat:l => `Hits fish for ${l.power} damage` },
  { key:'line',   kind:'Slack',  icon:'🧵', list:LINES,   stat:l => `Reaches about ${Math.round((l.len - 40) / PX_PER_M)} m deep` },
  { key:'knife',  kind:'Knife',  icon:'🔪', list:KNIVES,  stat:k => `${k.chops} chop${k.chops > 1 ? 's' : ''} per fish · fillets worth ×${k.mult}` },
  { key:'bucket', kind:'Bucket', icon:'🪣', list:BUCKETS, stat:b => `Holds ${b.cap} fish` },
];

// ======================================================================
//  SAVE STATE
// ======================================================================
const SAVE_KEY = 'hook-line-sinker-v1';
function freshState() {
  return { coins:100, lv:{ boat:-1, rod:-1, lure:0, line:0, knife:0, bucket:0 }, bucket:[], seen:{}, earned:0 };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.lv) return Object.assign(freshState(), s);
  } catch (e) {}
  return freshState();
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
let S = load();

const G = () => ({
  boat:   BOATS[Math.max(0, S.lv.boat)],
  rod:    RODS[Math.max(0, S.lv.rod)],
  lure:   LURES[S.lv.lure],
  line:   LINES[S.lv.line],
  knife:  KNIVES[S.lv.knife],
  bucket: BUCKETS[S.lv.bucket],
});
const speciesById = id => SPECIES.find(s => s.id === id);

// ======================================================================
//  HELPERS
// ======================================================================
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let toastTimer = null;
function toast(msg, ms = 2200) {
  const t = $('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
}

// Shared fish painter. dir = 1 faces right, -1 faces left.
function drawFish(ctx, x, y, sp, dir, t, opts = {}) {
  const s = opts.size || sp.size;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  if (opts.angle) ctx.rotate(opts.angle);
  const wig = Math.sin(t * 10) * 0.18;

  // tail
  ctx.fillStyle = sp.color;
  ctx.beginPath();
  ctx.moveTo(-s * 0.75, 0);
  ctx.lineTo(-s * 1.45, -s * (0.5 + wig));
  ctx.lineTo(-s * 1.3, 0);
  ctx.lineTo(-s * 1.45, s * (0.5 - wig));
  ctx.closePath(); ctx.fill();

  // dorsal fin
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, -s * 0.38);
  ctx.lineTo(s * 0.05, -s * (sp.kind === 'hammer' ? 0.95 : 0.78));
  ctx.lineTo(s * 0.3, -s * 0.38);
  ctx.closePath(); ctx.fill();

  // body
  const g = ctx.createLinearGradient(0, -s * 0.5, 0, s * 0.5);
  g.addColorStop(0, sp.color); g.addColorStop(0.55, sp.color); g.addColorStop(1, sp.belly);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * (sp.kind === 'sword' ? 0.38 : 0.5), 0, 0, Math.PI * 2);
  ctx.fill();

  if (sp.stripes) {
    ctx.strokeStyle = 'rgba(10,40,30,.55)'; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s * 0.28, -s * 0.45);
      ctx.quadraticCurveTo(i * s * 0.28 + 4, -s * 0.25, i * s * 0.28, -s * 0.08);
      ctx.stroke();
    }
  }
  if (sp.spots) {
    ctx.fillStyle = 'rgba(40,30,15,.45)';
    [[-.4,-.15],[-.1,.1],[.2,-.2],[.35,.12],[-.55,.12]].forEach(([a,b]) => {
      ctx.beginPath(); ctx.arc(a * s, b * s, s * 0.08, 0, 7); ctx.fill();
    });
  }
  if (sp.kind === 'sword') {
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.moveTo(s * 0.85, -s * 0.12); ctx.lineTo(s * 2.0, 0); ctx.lineTo(s * 0.85, s * 0.08);
    ctx.closePath(); ctx.fill();
  }
  if (sp.kind === 'hammer') {
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(s * 0.75, -s * 0.5, s * 0.28, s, 6) : ctx.rect(s * 0.75, -s * 0.5, s * 0.28, s);
    ctx.fill();
  }
  if (sp.kind === 'angler') {
    ctx.strokeStyle = sp.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.45);
    ctx.quadraticCurveTo(s * 0.9, -s * 1.3, s * 1.2, -s * 0.8); ctx.stroke();
    const glow = 0.6 + Math.sin(t * 4) * 0.3;
    ctx.fillStyle = `rgba(255,250,150,${glow})`;
    ctx.beginPath(); ctx.arc(s * 1.2, -s * 0.8, s * 0.18, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(s * (0.55 + i * 0.1), s * 0.1); ctx.lineTo(s * (0.6 + i * 0.1), s * 0.25); ctx.lineTo(s * (0.65 + i * 0.1), s * 0.1);
      ctx.fill();
    }
  }
  if (sp.gold) {
    ctx.strokeStyle = `rgba(255,255,255,${0.4 + Math.sin(t * 6) * 0.3})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.8, s * 0.25, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }

  // eye
  const ex = sp.kind === 'hammer' ? s * 0.92 : s * 0.55;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(ex, -s * 0.12, Math.max(2.5, s * 0.13), 0, 7); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(ex + 1, -s * 0.12, Math.max(1.4, s * 0.07), 0, 7); ctx.fill();

  if (opts.flash) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fillRect(-s * 2, -s, s * 4.2, s * 2);
  }
  ctx.restore();
}

// ======================================================================
//  DOCK SCREEN
// ======================================================================
function renderDock() {
  $('dockCoins').textContent = `🪙 ${S.coins}`;
  const starterDone = S.lv.boat >= 0 && S.lv.rod >= 0;

  $('dockGreeting').textContent = starterDone
    ? `You're back at Saltwater Dock. Sell your fillets and upgrade your gear!`
    : `Welcome to Saltwater Dock! You have 100 coins — buy a Tiny Raft and the Rusty Rod to head out.`;

  // ---- shop ----
  const shop = $('shop');
  shop.innerHTML = '';
  SHOP.forEach(cat => {
    if (!starterDone && cat.key !== 'boat' && cat.key !== 'rod') return;
    const lv = S.lv[cat.key];
    const cur = lv >= 0 ? cat.list[lv] : null;
    const next = cat.list[lv + 1];
    const el = document.createElement('div');
    el.className = 'item' + (!starterDone ? ' starter' : '');
    const bars = cat.list.map((_, i) => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('');
    el.innerHTML = `
      <div class="top"><span class="icon">${cat.icon}</span>
        <div><div class="kind">${cat.kind}</div><div class="now">${cur ? cur.name : 'None yet'}</div></div></div>
      <div class="levels">${bars}</div>
      ${cur ? `<div class="stat">${cat.stat(cur)}</div>` : ''}
      ${next
        ? `<div class="next">${lv < 0 ? 'Buy' : 'Upgrade to'} <b>${next.name}</b><br>${cat.stat(next)}</div>
           <button class="btn ${S.coins >= next.cost ? 'green' : 'blue'}" ${S.coins >= next.cost ? '' : 'disabled'}>
             ${lv < 0 ? 'Buy' : 'Upgrade'} · 🪙 ${next.cost}</button>`
        : `<div class="maxed">★ Fully upgraded!</div>`}
    `;
    const btn = el.querySelector('button');
    if (btn) btn.onclick = () => buy(cat);
    shop.appendChild(el);
  });
  $('shopTitle').textContent = starterDone ? '🛒 Upgrade Shop' : '🛒 Starter Shop — buy these first!';

  // ---- market ----
  const fillets = S.bucket.filter(f => f.filleted);
  const raw = S.bucket.filter(f => !f.filleted);
  const ml = $('marketList');
  if (!S.bucket.length) {
    ml.innerHTML = `<p class="muted">Your bucket is empty. Go catch some fish!</p>`;
  } else {
    const counts = {};
    fillets.forEach(f => {
      const c = counts[f.id] || (counts[f.id] = { n:0, v:0 });
      c.n++; c.v += f.value;
    });
    let html = Object.entries(counts).map(([id, c]) =>
      `<div class="market-row"><span>${speciesById(id).name} fillets × ${c.n}</span><b>🪙 ${c.v}</b></div>`).join('');
    const total = fillets.reduce((a, f) => a + f.value, 0);
    if (fillets.length) html += `<div class="market-total">Total: 🪙 ${total}</div>`;
    if (raw.length) html += `<p class="muted">🐟 ${raw.length} raw fish still in your bucket — the market only buys fillets. Fillet them with your knife on the boat!</p>`;
    ml.innerHTML = html;
  }
  $('sellBtn').disabled = !fillets.length;

  // ---- sail ----
  $('sailBtn').disabled = !starterDone;
  $('sailNote').textContent = starterDone
    ? `${G().boat.name} · ${G().rod.name} · ${G().lure.name} · bucket holds ${G().bucket.cap}`
    : 'You need a boat and a rod before you can go fishing.';

  renderGuide();
}

function buy(cat) {
  const next = cat.list[S.lv[cat.key] + 1];
  if (!next || S.coins < next.cost) return;
  S.coins -= next.cost;
  S.lv[cat.key]++;
  save();
  toast(`You got the ${next.name}! ${cat.icon}`);
  renderDock();
}

function sellAll() {
  const fillets = S.bucket.filter(f => f.filleted);
  if (!fillets.length) return;
  const total = fillets.reduce((a, f) => a + f.value, 0);
  S.coins += total; S.earned += total;
  S.bucket = S.bucket.filter(f => !f.filleted);
  save();
  toast(`Sold ${fillets.length} fillet${fillets.length > 1 ? 's' : ''} for 🪙 ${total}!`);
  renderDock();
}

function renderGuide() {
  const el = $('fishGuide');
  el.innerHTML = '';
  SPECIES.forEach(sp => {
    const known = S.seen[sp.id];
    const d = document.createElement('div');
    d.className = 'gfish' + (known ? '' : ' locked');
    const c = document.createElement('canvas');
    c.width = 160; c.height = 44;
    const cx = c.getContext('2d');
    const scale = Math.min(1, 15 / sp.size);
    cx.save(); cx.translate(80, 22); cx.scale(scale, scale);
    if (!known) cx.filter = 'brightness(0)';
    drawFish(cx, 0, 0, sp, 1, 0);
    cx.restore();
    d.appendChild(c);
    d.insertAdjacentHTML('beforeend',
      `<b>${known ? sp.name : '???'}</b>${Math.round(sp.min / PX_PER_M)}–${Math.round(sp.max / PX_PER_M)} m · ${sp.hp} HP · 🪙${sp.value}` +
      (sp.boat > Math.max(0, S.lv.boat) ? `<br><i>Needs ${BOATS[sp.boat].name}</i>` : ''));
    el.appendChild(d);
  });
}

$('sellBtn').onclick = sellAll;
$('sailBtn').onclick = () => enterSea();
let resetArmed = null;
$('resetBtn').onclick = () => {
  const b = $('resetBtn');
  if (!resetArmed) {
    b.textContent = 'Tap again to erase everything and start over';
    resetArmed = setTimeout(() => { resetArmed = null; b.textContent = 'Start a new game'; }, 3000);
    return;
  }
  clearTimeout(resetArmed); resetArmed = null;
  b.textContent = 'Start a new game';
  S = freshState(); save(); renderDock();
  toast('New game! You have 100 coins.');
};

// ======================================================================
//  SEA SCREEN
// ======================================================================
const cv = $('game');
const ctx = cv.getContext('2d');
let running = false, last = 0, T = 0;
let fish = [], floats = [], bubbles = [], clouds = [];
const keys = {};
const BOAT_X = 560;
const player = { x: BOAT_X, targetX: null, facing: -1 };
const lure = { active:false, reeling:false, x:0, y:0, tx:0, ty:0, hooked:null };
let pointerTarget = null;
let msgCooldown = 0;

function boatW() { return G().boat.w; }
function deckY() { return SURF - 8 + Math.sin(T * 1.6) * 2; }
function fishingZone() { return player.x <= BOAT_X - boatW() / 2 + boatW() * 0.38; }
function filletZone()  { return player.x >= BOAT_X + boatW() / 2 - boatW() * 0.32; }
function rodTip() { return { x: player.x - 52, y: deckY() - 58 }; }
function bucketCount() { return S.bucket.length + (lure.hooked ? 1 : 0); }
function bucketFull() { return bucketCount() >= G().bucket.cap; }

function enterSea() {
  $('dock').classList.add('hidden');
  $('sea').classList.remove('hidden');
  fish = []; floats = []; bubbles = [];
  clouds = Array.from({ length: 5 }, () => ({ x: rand(0, W), y: rand(15, 70), s: rand(0.6, 1.3), v: rand(6, 16) }));
  player.x = BOAT_X; player.targetX = null;
  Object.assign(lure, { active:false, reeling:false, hooked:null });
  for (let i = 0; i < targetFishCount(); i++) spawnFish(true);
  running = true; last = performance.now();
  updateHud();
  toast('Walk to the left side of your boat to start fishing! 🎣');
  requestAnimationFrame(loop);
}

function leaveSea() {
  if (lure.active) finishReel(true);
  running = false;
  save();
  $('sea').classList.add('hidden');
  $('dock').classList.remove('hidden');
  window.scrollTo(0, 0);
  renderDock();
  const raw = S.bucket.filter(f => !f.filleted).length;
  if (raw) toast(`You still have ${raw} raw fish — fillet them on your boat before selling!`, 3200);
}

function targetFishCount() { return 12 + Math.max(0, S.lv.boat) * 3; }

function spawnFish(anywhere) {
  const pool = SPECIES.filter(s => s.boat <= Math.max(0, S.lv.boat));
  let total = pool.reduce((a, s) => a + s.weight, 0), r = Math.random() * total, sp = pool[0];
  for (const s of pool) { r -= s.weight; if (r <= 0) { sp = s; break; } }
  const dir = Math.random() < 0.5 ? 1 : -1;
  const baseY = SURF + rand(sp.min, sp.max);
  fish.push({
    sp, dir, baseY, y: baseY,
    x: anywhere ? rand(30, W - 30) : (dir > 0 ? -50 : W + 50),
    hp: sp.hp, maxHp: sp.hp,
    speed: sp.speed * rand(0.75, 1.2),
    phase: rand(0, 6.28), amp: rand(3, 9),
    inv: 0, flee: 0, flash: 0, hooked: false,
  });
}

function addFloat(x, y, text, color = '#fff') { floats.push({ x, y, text, color, life: 1.2 }); }

// ---------------- input ----------------
function canvasPoint(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  const p = canvasPoint(e);
  if (p.y > SURF) {
    if (lure.active) { if (!lure.reeling) pointerTarget = p; return; }
    if (fishingZone()) { cast(p); }
    else {
      player.targetX = BOAT_X - boatW() / 2 + 10;
      say('Walk to the LEFT side of the boat to fish!');
    }
  } else {
    if (lure.active) { reelIn(); return; }
    player.targetX = clamp(p.x, BOAT_X - boatW() / 2 + 10, BOAT_X + boatW() / 2 - 10);
  }
});
cv.addEventListener('pointermove', e => {
  if (!lure.active || lure.reeling) return;
  const p = canvasPoint(e);
  if (e.pointerType === 'mouse' || e.buttons) pointerTarget = p;
});

window.addEventListener('keydown', e => {
  if (!running) return;
  keys[e.key.toLowerCase()] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    if (!$('fillet').classList.contains('hidden')) { chop(); return; }
    if (lure.active) reelIn();
    else if (fishingZone()) cast({ x: rodTip().x, y: SURF + 60 });
  }
  if (e.key.toLowerCase() === 'f' && filletZone()) openFillet();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function holdButton(id, key) {
  const b = $(id);
  const on = e => { e.preventDefault(); keys[key] = true; };
  const off = () => { keys[key] = false; };
  b.addEventListener('pointerdown', on);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, off));
}
holdButton('walkL', 'arrowleft');
holdButton('walkR', 'arrowright');
$('reelBtn').onclick = () => reelIn();
$('dockBtn').onclick = () => leaveSea();
$('filletBtn').onclick = () => openFillet();

function say(msg) { if (msgCooldown <= 0) { toast(msg); msgCooldown = 2; } }

function cast(p) {
  if (bucketFull()) { say('Your bucket is full! Walk right to fillet, then sail back to sell.'); return; }
  const tip = rodTip();
  Object.assign(lure, { active:true, reeling:false, hooked:null, x: tip.x, y: tip.y });
  pointerTarget = p;
  updateHud();
}
function reelIn() { if (lure.active) { lure.reeling = true; updateHud(); } }

function finishReel(instant) {
  if (lure.hooked) {
    const f = lure.hooked;
    S.bucket.push({ id: f.sp.id, filleted: false, value: 0 });
    S.seen[f.sp.id] = true;
    fish = fish.filter(x => x !== f);
    if (!instant) addFloat(rodTip().x, rodTip().y - 10, `${f.sp.name} in the bucket!`, '#ffe680');
    save();
    if (bucketFull() && !instant) setTimeout(() => toast('Bucket full! Walk to the right side and fillet your fish 🔪', 3000), 300);
  }
  Object.assign(lure, { active:false, reeling:false, hooked:null });
  updateHud();
}

// ---------------- update ----------------
function update(dt) {
  T += dt;
  msgCooldown -= dt;

  // walking (not while the lure is out)
  if (!lure.active) {
    let dx = 0;
    if (keys['arrowleft'] || keys['a']) dx -= 1;
    if (keys['arrowright'] || keys['d']) dx += 1;
    if (dx) { player.targetX = null; player.x += dx * 170 * dt; player.facing = dx; }
    else if (player.targetX != null) {
      const d = player.targetX - player.x;
      if (Math.abs(d) < 3) player.targetX = null;
      else { player.x += Math.sign(d) * Math.min(Math.abs(d), 170 * dt); player.facing = Math.sign(d); }
    }
    player.x = clamp(player.x, BOAT_X - boatW() / 2 + 14, BOAT_X + boatW() / 2 - 14);
  }
  if (fishingZone()) player.facing = -1;

  // lure
  if (lure.active) {
    const tip = rodTip();
    const speed = G().rod.speed;
    if (lure.reeling) {
      const dx = tip.x - lure.x, dy = tip.y - lure.y, d = Math.hypot(dx, dy);
      const step = speed * 1.6 * dt;
      if (d <= step + 2) finishReel(false);
      else { lure.x += dx / d * step; lure.y += dy / d * step; }
    } else {
      // steer toward pointer, clamped to the slack circle and under the water
      let tx = pointerTarget ? pointerTarget.x : lure.x, ty = pointerTarget ? pointerTarget.y : lure.y;
      let dx = tx - tip.x, dy = ty - tip.y, d = Math.hypot(dx, dy);
      const len = G().line.len;
      if (d > len) { tx = tip.x + dx / d * len; ty = tip.y + dy / d * len; }
      ty = Math.max(ty, SURF + 6);
      tx = clamp(tx, 4, W - 4);
      dx = tx - lure.x; dy = ty - lure.y; d = Math.hypot(dx, dy);
      const step = speed * dt;
      if (d > 0.5) { const m = Math.min(step, d); lure.x += dx / d * m; lure.y += dy / d * m; }
      lure.tx = tx; lure.ty = ty;
      if (Math.random() < dt * 2 && lure.y > SURF) bubbles.push({ x: lure.x, y: lure.y, r: rand(1.5, 3), v: rand(20, 40) });
      checkHits();
    }
  }

  // fish
  for (const f of fish) {
    f.inv -= dt; f.flee -= dt; f.flash -= dt;
    if (f.hooked) {
      f.x = lure.x + 4; f.y = lure.y + f.sp.size * 0.3;
      continue;
    }
    const sp = f.speed * (f.flee > 0 ? 2.6 : 1);
    f.x += f.dir * sp * dt;
    f.y = f.baseY + Math.sin(T * 1.8 + f.phase) * f.amp;
    if (Math.random() < dt * 0.15) bubbles.push({ x: f.x + f.dir * f.sp.size, y: f.y, r: rand(1, 2.5), v: rand(15, 35) });
  }
  fish = fish.filter(f => f.hooked || (f.x > -140 && f.x < W + 140));
  while (fish.length < targetFishCount()) spawnFish(false);

  bubbles.forEach(b => { b.y -= b.v * dt; b.x += Math.sin(T * 3 + b.y) * 0.3; });
  bubbles = bubbles.filter(b => b.y > SURF);
  floats.forEach(f => { f.life -= dt; f.y -= 28 * dt; });
  floats = floats.filter(f => f.life > 0);
  clouds.forEach(c => { c.x += c.v * dt; if (c.x > W + 80) c.x = -80; });

  updateHudLive();
}

function checkHits() {
  if (lure.hooked) return;
  for (const f of fish) {
    if (f.hooked || f.inv > 0) continue;
    const reach = f.sp.size * 0.85 + 6;
    // the head end of the fish is the best target, but anywhere on the body counts
    if (Math.hypot(lure.x - f.x, lure.y - f.y) > reach) continue;

    if (bucketFull()) { say('Bucket full! Fillet and sell your fish first.'); f.flee = 1; f.inv = 1; f.dir = -f.dir; continue; }

    const dmg = G().lure.power;
    f.hp -= dmg;
    S.seen[f.sp.id] = true;
    if (f.hp <= 0) {
      f.hooked = true;
      lure.hooked = f;
      lure.reeling = true;
      addFloat(f.x, f.y - 20, `Caught a ${f.sp.name}!`, '#ffe680');
      updateHud();
    } else {
      f.inv = 0.6; f.flee = 1.1; f.flash = 0.25;
      f.dir = Math.sign(f.x - lure.x) || f.dir;
      addFloat(f.x, f.y - 18, `-${dmg}  (${f.hp} left)`, '#ff9b8a');
      if (f.maxHp >= 3 && f.hp === f.maxHp - dmg) say(`Strong fish! Hit the ${f.sp.name} ${Math.ceil(f.hp / dmg)} more time${Math.ceil(f.hp / dmg) > 1 ? 's' : ''}!`);
    }
    return;
  }
}

// ---------------- draw ----------------
function draw() {
  // sky
  let g = ctx.createLinearGradient(0, 0, 0, SURF);
  g.addColorStop(0, '#5db6ea'); g.addColorStop(1, '#bfe7fb');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, SURF);
  ctx.fillStyle = 'rgba(255,230,128,.35)'; ctx.beginPath(); ctx.arc(90, 50, 46, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(90, 50, 28, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  clouds.forEach(c => {
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.s, c.s);
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.arc(18, -6, 20, 0, 7); ctx.arc(38, 0, 15, 0, 7); ctx.fill();
    ctx.restore();
  });

  // water
  g = ctx.createLinearGradient(0, SURF, 0, H);
  g.addColorStop(0, '#2f8fd0'); g.addColorStop(0.35, '#1d5f9a'); g.addColorStop(0.7, '#123d6a'); g.addColorStop(1, '#081d38');
  ctx.fillStyle = g; ctx.fillRect(0, SURF, W, H - SURF);

  // light rays
  ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) {
    const x = (i * 190 + Math.sin(T * 0.3 + i) * 30) % (W + 200) - 100;
    ctx.beginPath(); ctx.moveTo(x, SURF); ctx.lineTo(x + 60, SURF); ctx.lineTo(x + 200, H * 0.75); ctx.lineTo(x + 110, H * 0.75); ctx.fill();
  }
  ctx.restore();

  // seabed + seaweed
  ctx.fillStyle = '#3a3226';
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, H - 14 - Math.sin(x * 0.02) * 8);
  ctx.lineTo(W, H); ctx.fill();
  ctx.strokeStyle = '#1f6b3a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) {
    const x = 30 + i * 68, h = 40 + (i * 37) % 50;
    ctx.beginPath(); ctx.moveTo(x, H - 12);
    ctx.quadraticCurveTo(x + Math.sin(T + i) * 14, H - 12 - h / 2, x + Math.sin(T * 1.3 + i) * 8, H - 12 - h);
    ctx.stroke();
  }

  // depth markers
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
  for (let d = 100; d < H - SURF; d += 100) {
    ctx.fillRect(W - 40, SURF + d, 34, 1);
    ctx.fillText(`${d / PX_PER_M} m`, W - 8, SURF + d - 4);
  }

  // slack circle while fishing
  if (lure.active || fishingZone()) {
    const tip = rodTip(), len = G().line.len;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, SURF, W, H - SURF); ctx.clip();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = lure.active ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.18)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tip.x, tip.y, len, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // bubbles
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
  bubbles.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke(); });

  // fish
  for (const f of fish) {
    const angle = f.hooked ? Math.sin(T * 14) * 0.4 - 0.9 : 0;
    drawFish(ctx, f.x, f.y, f.sp, f.hooked ? -1 : f.dir, T + f.phase, { flash: f.flash > 0, angle });
    if (f.hp < f.maxHp && !f.hooked) {
      const w = 34;
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(f.x - w / 2, f.y - f.sp.size - 12, w, 5);
      ctx.fillStyle = '#ff6b5b'; ctx.fillRect(f.x - w / 2, f.y - f.sp.size - 12, w * (f.hp / f.maxHp), 5);
    }
  }

  // fishing line + lure
  const tip = rodTip();
  if (lure.active) {
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(tip.x, tip.y);
    ctx.quadraticCurveTo((tip.x + lure.x) / 2 - 10, (tip.y + lure.y) / 2 + 20, lure.x, lure.y);
    ctx.stroke();
    drawLure(lure.x, lure.y);
  }

  drawBoat();
  drawPlayer();

  // surface waves (in front of the boat hull)
  ctx.fillStyle = 'rgba(47,143,208,.55)';
  ctx.beginPath(); ctx.moveTo(0, SURF + 14);
  for (let x = 0; x <= W; x += 10) ctx.lineTo(x, SURF + Math.sin(x * 0.03 + T * 2) * 3);
  ctx.lineTo(W, SURF + 14); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 10) { const y = SURF + Math.sin(x * 0.03 + T * 2) * 3; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();

  // zone labels
  ctx.textAlign = 'center'; ctx.font = 'bold 13px sans-serif';
  const left = BOAT_X - boatW() / 2, right = BOAT_X + boatW() / 2;
  if (!lure.active) {
    ctx.fillStyle = fishingZone() ? '#ffe680' : 'rgba(255,255,255,.75)';
    ctx.fillText(fishingZone() ? '🎣 Click the water!' : '◀ fish here', left + 10, SURF - 104);
    if (S.bucket.some(f => !f.filleted)) {
      ctx.fillStyle = filletZone() ? '#ffe680' : 'rgba(255,255,255,.75)';
      ctx.fillText(filletZone() ? '🔪 Fillet (F)' : 'fillet here ▶', right - 10, SURF - 104);
    }
  }

  // floating text
  ctx.font = 'bold 15px sans-serif';
  floats.forEach(f => {
    ctx.globalAlpha = Math.min(1, f.life * 1.5);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(f.text, f.x + 1, f.y + 1);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
  });
  ctx.globalAlpha = 1;
}

function drawLure(x, y) {
  const l = G().lure;
  ctx.save(); ctx.translate(x, y);
  if (S.lv.lure >= 3) { ctx.fillStyle = l.color + '55'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill(); }
  ctx.fillStyle = l.color; ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, 4, 7, Math.sin(T * 6) * 0.4, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(2, 9, 4, Math.PI * 0.9, Math.PI * 0.1, true); ctx.stroke();
  ctx.restore();
}

function drawBoat() {
  const w = boatW(), y = deckY(), l = BOAT_X - w / 2, r = BOAT_X + w / 2, lv = Math.max(0, S.lv.boat);
  ctx.save();
  if (lv === 0) {
    // log raft
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#8a5a2b' : '#9c6a36';
      ctx.fillRect(l, y + i * 4, w, 5);
    }
    ctx.fillStyle = '#6e4420';
    for (let x = l + 6; x < r; x += 22) ctx.fillRect(x, y, 3, 18);
    ctx.strokeStyle = '#d9c08a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(l + 12, y + 2); ctx.lineTo(l + 12, y + 16); ctx.moveTo(r - 12, y + 2); ctx.lineTo(r - 12, y + 16); ctx.stroke();
  } else {
    const hullH = 14 + lv * 8;
    const colors = [null, ['#b5542f', '#8c3e20'], ['#f4f4f4', '#2a74c9'], ['#c0392b', '#1d2b3a']][lv];
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(l - 10, y); ctx.lineTo(r + 14, y);
    ctx.lineTo(r - 8, y + hullH); ctx.lineTo(l + 12, y + hullH); ctx.closePath(); ctx.fill();
    ctx.fillStyle = colors[1]; ctx.fillRect(l - 4, y + 3, w + 12, 4);
    if (lv >= 2) {   // cabin
      const cw = w * 0.22, cx = BOAT_X - cw / 2 + 10;
      ctx.fillStyle = lv === 3 ? '#e8e8e8' : '#fff';
      ctx.fillRect(cx, y - 34, cw, 34);
      ctx.fillStyle = '#7fc3f0'; ctx.fillRect(cx + 6, y - 28, cw - 12, 10);
      ctx.fillStyle = colors[1]; ctx.fillRect(cx - 4, y - 38, cw + 8, 5);
    }
    if (lv === 3) {   // mast + flag
      ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(BOAT_X + 10, y - 38); ctx.lineTo(BOAT_X + 10, y - 90); ctx.stroke();
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath(); ctx.moveTo(BOAT_X + 10, y - 90); ctx.lineTo(BOAT_X + 40 + Math.sin(T * 5) * 3, y - 82); ctx.lineTo(BOAT_X + 10, y - 74); ctx.fill();
    }
  }
  // cutting board + bucket on the right
  ctx.fillStyle = '#e2c08a'; ctx.fillRect(r - 34, y - 8, 28, 8);
  ctx.fillStyle = '#bbb'; ctx.fillRect(r - 28, y - 12, 14, 3);
  ctx.fillStyle = '#5c3a1a'; ctx.fillRect(r - 15, y - 13, 6, 4);
  // bucket in the middle
  const bx = BOAT_X + w * 0.12;
  ctx.fillStyle = '#9aa4ad';
  ctx.beginPath(); ctx.moveTo(bx - 9, y - 16); ctx.lineTo(bx + 9, y - 16); ctx.lineTo(bx + 7, y); ctx.lineTo(bx - 7, y); ctx.fill();
  ctx.strokeStyle = '#6b747c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(bx, y - 16, 9, Math.PI, 0); ctx.stroke();
  if (S.bucket.length) { ctx.fillStyle = '#ffd34d'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(S.bucket.length, bx, y - 21); }
  ctx.restore();
}

function drawPlayer() {
  const x = player.x, y = deckY(), f = player.facing || -1;
  const walking = !lure.active && (player.targetX != null || keys['arrowleft'] || keys['arrowright'] || keys['a'] || keys['d']);
  const step = walking ? Math.sin(T * 12) * 4 : 0;
  ctx.save();
  ctx.lineCap = 'round';
  // legs
  ctx.strokeStyle = '#2b3a55'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x - 3, y - 22); ctx.lineTo(x - 4 + step, y);
  ctx.moveTo(x + 3, y - 22); ctx.lineTo(x + 4 - step, y); ctx.stroke();
  // body (raincoat)
  ctx.fillStyle = '#f2c230';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 10, y - 50, 20, 30, 6) : ctx.rect(x - 10, y - 50, 20, 30); ctx.fill();
  // head
  ctx.fillStyle = '#f1c9a5'; ctx.beginPath(); ctx.arc(x, y - 59, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + f * 4, y - 60, 1.5, 0, 7); ctx.fill();
  // hat
  ctx.fillStyle = '#e0a910';
  ctx.beginPath(); ctx.ellipse(x, y - 66, 14, 4, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 67, 8, Math.PI, 0); ctx.fill();

  // rod
  const holdingRod = fishingZone() || lure.active;
  if (holdingRod) {
    const tip = rodTip();
    ctx.strokeStyle = '#2b3a55'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y - 42); ctx.lineTo(x - 12, y - 38); ctx.stroke();   // arm
    ctx.strokeStyle = ['#8b5a2b', '#c9a65b', '#4aa3df', '#333', '#d4a017'][Math.max(0, S.lv.rod)];
    ctx.lineWidth = 3;
    const bend = lure.hooked ? 10 + Math.sin(T * 20) * 4 : 0;
    ctx.beginPath(); ctx.moveTo(x - 10, y - 32);
    ctx.quadraticCurveTo(x - 30, y - 48 + bend, tip.x, tip.y + bend * 0.5); ctx.stroke();
    if (!lure.active) {  // dangling lure
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(tip.x, tip.y + 20); ctx.stroke();
      drawLure(tip.x, tip.y + 24);
    }
  } else {
    ctx.strokeStyle = '#2b3a55'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y - 44); ctx.lineTo(x + f * 8, y - 28); ctx.stroke();
  }
  ctx.restore();
}

// ---------------- HUD ----------------
function updateHud() {
  $('seaCoins').textContent = `🪙 ${S.coins}`;
  const g = G();
  $('gearPill').textContent = `${g.boat.name} · ${g.rod.name} · ${g.lure.name} (${g.lure.power} dmg) · ${g.line.name} · ${g.knife.name}`;
  updateHudLive(true);
}
let lastHudKey = '';
function updateHudLive(force) {
  const cap = G().bucket.cap, n = S.bucket.length;
  const raw = S.bucket.some(f => !f.filleted);
  const key = [n, cap, lure.active, lure.reeling, filletZone(), raw].join();
  if (key === lastHudKey && !force) return;
  lastHudKey = key;
  const pill = $('bucketPill');
  pill.textContent = `🪣 ${n}/${cap}`;
  pill.classList.toggle('full', n >= cap);
  $('reelBtn').classList.toggle('hidden', !lure.active || lure.reeling);
  $('filletBtn').classList.toggle('hidden', !(filletZone() && raw && !lure.active));
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if ($('fillet').classList.contains('hidden')) update(dt);
  draw();
  requestAnimationFrame(loop);
}

// ======================================================================
//  FILLET STATION
// ======================================================================
const fc = $('filletCanvas'), fx = fc.getContext('2d');
let fillet = null;   // { item, chops, cuts:[], slash, done }

function openFillet() {
  if (lure.active) return;
  if (!S.bucket.some(f => !f.filleted)) { toast('No raw fish to fillet!'); return; }
  $('fillet').classList.remove('hidden');
  nextFilletFish();
  requestAnimationFrame(filletLoop);
}
function closeFillet() {
  $('fillet').classList.add('hidden');
  fillet = null;
  updateHud();
  if (S.bucket.length && S.bucket.every(f => f.filleted) && bucketFull()) toast('All filleted! Sail back to the dock to sell ⚓', 3000);
}
function nextFilletFish() {
  const item = S.bucket.find(f => !f.filleted);
  if (!item) {
    fillet = { done: true, cuts: [], slash: 0 };
    $('filletInfo').textContent = '✨ All fish filleted! Take them to the market.';
    $('filletBar').style.width = '100%';
    $('chopBtn').disabled = true;
    return;
  }
  $('chopBtn').disabled = false;
  fillet = { item, sp: speciesById(item.id), chops: 0, cuts: [], slash: 0, done: false };
  const k = G().knife;
  const raw = S.bucket.filter(f => !f.filleted).length;
  $('filletInfo').textContent = `${fillet.sp.name} — ${k.chops} chop${k.chops > 1 ? 's' : ''} with your ${k.name} (${raw} left)`;
  $('filletBar').style.width = '0%';
}
function chop() {
  if (!fillet || fillet.done || !fillet.item) return;
  const k = G().knife;
  fillet.chops++;
  fillet.slash = 0.25;
  fillet.cuts.push(rand(-0.55, 0.55));
  $('filletBar').style.width = `${(fillet.chops / k.chops) * 100}%`;
  if (fillet.chops >= k.chops) {
    const value = Math.round(fillet.sp.value * k.mult);
    fillet.item.filleted = true;
    fillet.item.value = value;
    save();
    $('filletInfo').textContent = `🍣 ${fillet.sp.name} fillets — worth 🪙 ${value}!`;
    fillet.done = true; fillet.showFillet = 0.7;
    $('chopBtn').disabled = true;
    setTimeout(() => { if (!$('fillet').classList.contains('hidden')) nextFilletFish(); }, 700);
  }
}
function filletLoop() {
  if ($('fillet').classList.contains('hidden') || !fillet) return;
  const t = performance.now() / 1000;
  fx.clearRect(0, 0, fc.width, fc.height);
  // wood grain
  fx.strokeStyle = 'rgba(120,80,30,.25)'; fx.lineWidth = 1;
  for (let i = 0; i < 8; i++) { fx.beginPath(); fx.moveTo(0, 20 + i * 24); fx.bezierCurveTo(140, 10 + i * 24, 280, 30 + i * 24, 420, 18 + i * 24); fx.stroke(); }

  if (fillet.sp && !fillet.showFillet) {
    const scale = 70 / fillet.sp.size;
    fx.save(); fx.translate(200, 100); fx.scale(scale, scale);
    drawFish(fx, 0, 0, fillet.sp, 1, 0);
    fx.restore();
    // cut marks
    fx.strokeStyle = '#b3261e'; fx.lineWidth = 3;
    fillet.cuts.forEach(c => { const x = 200 + c * 120; fx.beginPath(); fx.moveTo(x - 6, 62); fx.lineTo(x + 6, 138); fx.stroke(); });
  } else if (fillet.sp) {
    // fillet slabs
    fx.fillStyle = '#f7a58c'; fx.strokeStyle = '#e07a5f'; fx.lineWidth = 2;
    [-1, 1].forEach(s => {
      fx.beginPath(); fx.ellipse(210 + s * 70, 100, 60, 26, s * 0.15, 0, 7); fx.fill(); fx.stroke();
      fx.strokeStyle = 'rgba(255,255,255,.6)';
      for (let i = -2; i <= 2; i++) { fx.beginPath(); fx.moveTo(210 + s * 70 + i * 16, 80); fx.lineTo(210 + s * 70 + i * 16 + 8, 120); fx.stroke(); }
      fx.strokeStyle = '#e07a5f';
    });
    fillet.showFillet -= 1 / 60;
    if (fillet.showFillet <= 0) fillet.showFillet = 0;
  } else {
    fx.font = '48px sans-serif'; fx.textAlign = 'center'; fx.fillText('🍣🍣🍣', 210, 115);
  }
  // knife slash
  if (fillet.slash > 0) {
    fillet.slash -= 1 / 60;
    const p = 1 - fillet.slash / 0.25;
    fx.save(); fx.translate(60 + p * 300, 40 + p * 120); fx.rotate(0.6);
    fx.fillStyle = '#d8dee4'; fx.fillRect(-4, -60, 8, 50);
    fx.fillStyle = '#5c3a1a'; fx.fillRect(-5, -10, 10, 26);
    fx.restore();
    fx.strokeStyle = `rgba(255,255,255,${fillet.slash * 3})`; fx.lineWidth = 4;
    fx.beginPath(); fx.moveTo(60, 40); fx.lineTo(60 + p * 300, 40 + p * 120); fx.stroke();
  }
  requestAnimationFrame(filletLoop);
}
fc.addEventListener('pointerdown', e => { e.preventDefault(); chop(); });
$('chopBtn').onclick = chop;
$('filletClose').onclick = closeFillet;

// ======================================================================
//  START
// ======================================================================
renderDock();
})();
