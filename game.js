(() => {
'use strict';

// ======================================================================
//  WORLD
// ======================================================================
const W = 960, H = 760, SURF = 130;          // view size and water line
const PX_PER_M = 10;                          // 10px of depth = 1 metre
const SEA_DEPTH = 2500;                       // sea floor is 250 m down
const WORLD_H = SURF + SEA_DEPTH;
const WRECK_CHANCE = 0.3;                     // chance a trip has a shipwreck
const LV_PER_TIER = 6;                        // gear levels per boat

// ======================================================================
//  FISH — all real ocean species.  depth in px (10px = 1 m)
//  tier = boat needed · cut = best knife speed · school = [min,max] group size
// ======================================================================
const SPECIES = [
  { id:'herring', name:'Atlantic Herring', min:15, max:140, value:8, hp:1, size:14, speed:80, tier:0, weight:10, cut:350, school:[7,12],
    look:{ h:.25, tail:'fork', back:'#2d5f80', side:'#c3d2dc', belly:'#f3f6f8', fin:'#8fa6b5' },
    fact:'Atlantic herring swim in schools that can contain millions of fish.' },
  { id:'mackerel', name:'Atlantic Mackerel', min:60, max:240, value:15, hp:1, size:17, speed:90, tier:0, weight:9, cut:450, school:[5,9],
    look:{ h:.22, tail:'fork', back:'#1d6a5b', side:'#cfe0db', belly:'#f4f7f6', fin:'#6b8f86', pattern:'wavy', finlets:'#6b8f86' },
    fact:'Mackerel have no swim bladder, so they must keep swimming or they slowly sink.' },
  { id:'bass', name:'Striped Bass', min:160, max:340, value:30, hp:2, size:21, speed:60, tier:0, weight:7, cut:500, school:[3,5],
    look:{ h:.3, tail:'fork', back:'#4b5b4a', side:'#d6dace', belly:'#f1f2ec', fin:'#7d8577', pattern:'stripes', dorsal:'two' },
    fact:'Striped bass live in the ocean but swim up rivers into fresh water to lay their eggs.' },
  { id:'snapper', name:'Red Snapper', min:260, max:430, value:55, hp:2, size:21, speed:55, tier:0, weight:6, cut:600,
    look:{ h:.42, tail:'fork', back:'#c8352d', side:'#e5675a', belly:'#f8c3b4', fin:'#d04a3f', dorsal:'spiny', eye:'#d93a2b' },
    fact:'Red snapper can live for more than 50 years.' },
  { id:'mahi', name:'Mahi-Mahi', min:380, max:600, value:80, hp:4, size:28, speed:90, tier:1, weight:6, cut:700,
    look:{ h:.32, tail:'fork', back:'#13866d', side:'#e3c02a', belly:'#f3e7a0', fin:'#1a7fa8', pattern:'bluespots', dorsal:'long', blunt:1 },
    fact:'Mahi-mahi grow incredibly fast and rarely live longer than about 5 years.' },
  { id:'yellowfin', name:'Yellowfin Tuna', min:520, max:790, value:130, hp:6, size:30, speed:110, tier:1, weight:6, cut:800, school:[3,5],
    look:{ h:.3, tail:'lunate', back:'#17305a', side:'#94a4b8', belly:'#e8edf3', fin:'#e8c21c', finlets:'#f0cc1f', pattern:'yellowband', dorsal:'tuna' },
    fact:'Yellowfin tuna can swim faster than 40 mph (about 65 km/h).' },
  { id:'cod', name:'Atlantic Cod', min:750, max:1000, value:210, hp:8, size:26, speed:50, tier:2, weight:6, cut:550,
    look:{ h:.28, tail:'square', back:'#7b6c42', side:'#b6a877', belly:'#ece6cf', fin:'#8a7b52', pattern:'mottled', dorsal:'triple', barbel:true, latline:'#f2eedc' },
    fact:'Cod use the whisker on their chin, called a barbel, to feel for food on the sea floor.' },
  { id:'swordfish', name:'Swordfish', min:880, max:1150, value:320, hp:11, size:30, speed:95, tier:2, weight:5, cut:900,
    look:{ h:.22, tail:'lunate', back:'#3b3c5c', side:'#7e8197', belly:'#d3d4de', fin:'#3b3c5c', bill:'sword', dorsal:'shark' },
    fact:'Swordfish warm their eyes and brain with a special organ so they can see in cold, deep water.' },
  { id:'amberjack', name:'Greater Amberjack', min:1050, max:1350, value:480, hp:12, size:30, speed:85, tier:3, weight:6, cut:750, school:[3,4],
    look:{ h:.3, tail:'fork', back:'#56677a', side:'#c7ccc6', belly:'#eeeee6', fin:'#c9a84a', pattern:'amberline' },
    fact:'Greater amberjacks love to gather around shipwrecks, reefs and oil rigs.' },
  { id:'hammer', name:'Hammerhead Shark', min:1200, max:1510, value:700, hp:16, size:38, speed:70, tier:3, weight:5, cut:650,
    look:{ h:.2, tail:'shark', back:'#7a8791', side:'#99a5ad', belly:'#edf0f2', fin:'#6e7b85', dorsal:'sharktall', shark:true, hammer:true },
    fact:'A hammerhead’s wide head spreads out its eyes and electric sensors, helping it find prey hidden in the sand.' },
  { id:'marlin', name:'Blue Marlin', min:1450, max:1700, value:1000, hp:20, size:34, speed:115, tier:4, weight:5, cut:950,
    look:{ h:.24, tail:'lunate', back:'#173a8c', side:'#6f8fc8', belly:'#dfe6f2', fin:'#1d3f86', bill:'spear', dorsal:'sail', pattern:'bars' },
    fact:'Female blue marlin can weigh more than 1,000 pounds, much bigger than the males.' },
  { id:'oarfish', name:'Giant Oarfish', min:1600, max:1870, value:1350, hp:24, size:62, speed:30, tier:4, weight:3, cut:400,
    look:{ eel:true, h:.09, back:'#c9d2da', side:'#e9eef2', belly:'#f7f9fa', fin:'#d8323a' },
    fact:'The giant oarfish is the longest bony fish in the world and can grow over 25 feet (8 m) long.' },
  { id:'angler', name:'Anglerfish', min:1850, max:2100, value:1800, hp:27, size:24, speed:28, tier:5, weight:5, cut:350,
    look:{ h:.62, tail:'round', back:'#3a2c30', side:'#4d3c40', belly:'#5d4a4e', fin:'#2e2326', angler:true },
    fact:'Deep-sea anglerfish wave a glowing lure, lit by bacteria, to attract prey in the dark.' },
  { id:'greenland', name:'Greenland Shark', min:1980, max:2230, value:2400, hp:33, size:42, speed:22, tier:5, weight:4, cut:500,
    look:{ h:.22, tail:'shark', back:'#4b4943', side:'#5c5a53', belly:'#7a776e', fin:'#45433d', dorsal:'sharksmall', shark:true, blunt:.6 },
    fact:'Greenland sharks may live 250 years or more, the longest of any animal with a backbone.' },
  { id:'coelacanth', name:'Coelacanth', min:2200, max:2440, value:3200, hp:38, size:30, speed:25, tier:6, weight:5, cut:600,
    look:{ h:.3, tail:'coel', back:'#2f4a6a', side:'#46658a', belly:'#5f7ea0', fin:'#2f4a6a', pattern:'blotches', lobed:true },
    fact:'Coelacanths were thought to be extinct for 65 million years until one was caught in 1938.' },
  { id:'goliath', name:'Goliath Grouper', min:2380, max:2470, value:4500, hp:45, size:40, speed:30, tier:6, weight:0, cut:450, wreck:true,
    look:{ h:.42, tail:'round', back:'#6f5f3a', side:'#9c8a5a', belly:'#cdbf92', fin:'#6a5a36', pattern:'grouperbars', bigmouth:true },
    fact:'Goliath groupers can weigh up to 800 pounds and love to live around shipwrecks.' },
  // the monster of the deep: only one, at the very bottom. It comes back after you catch it.
  { id:'squid', name:'Giant Squid', min:2400, max:2460, value:15000, hp:150, size:70, speed:22, tier:6, weight:0, cut:500, monster:true,
    look:{ squid:true, h:.3, back:'#9c3b30', side:'#c25a49', belly:'#e5a493', fin:'#8a3229' },
    fact:'Giant squid have the biggest eyes of any animal, about the size of a dinner plate.' },
];
const speciesById = id => SPECIES.find(s => s.id === id);

// ======================================================================
//  BOATS & GEAR
//  Each boat comes with a stronger set of gear. You must max out every
//  gear upgrade (Lv 4) before buying the next boat, and the new boat
//  resets your gear to Lv 1 of its stronger set.
// ======================================================================
const BOATS = [
  { name:'Tiny Raft',         cost:50,     w:130 },
  { name:'Rowboat',           cost:400,    w:170 },
  { name:'Skiff',             cost:2500,   w:200 },
  { name:'Fishing Boat',      cost:9000,   w:240 },
  { name:'Trawler',           cost:25000,  w:280 },
  { name:'Research Vessel',   cost:70000,  w:320 },
  { name:'Deep-Sea Explorer', cost:180000, w:360 },
];
const GEAR = {
  rod:    { kind:'Rod',    icon:'🎣', costMult:1.0, names:['Rusty Rod','Bamboo Rod','Fiberglass Rod','Graphite Rod','Carbon Rod','Titanium Rod','Legend Rod'] },
  lure:   { kind:'Lure',   icon:'🪝', costMult:1.1, names:['Bent Hook','Spinner','Silver Spoon','Bucktail Jig','Glow Jig','Golden Lure','Diamond Lure'] },
  line:   { kind:'Slack',  icon:'🧵', costMult:0.9, names:['Short Slack','Long Line','Deep Line','Deeper Line','Abyss Line','Trench Line','Bottomless Line'] },
  knife:  { kind:'Knife',  icon:'🔪', costMult:0.8, names:['Old Knife','Steel Knife',"Chef's Knife",'Fillet Knife','Damascus Knife','Obsidian Blade','Dragon Blade'] },
  bucket: { kind:'Bucket', icon:'🪣', costMult:1.2, names:['Small Bucket','Big Bucket','Cooler','Big Cooler','Fish Hold','Ice Hold','Mega Hold'] },
};
const GEAR_KEYS = Object.keys(GEAR);
const LURE_COLORS = ['#9aa4ad', '#e9a91c', '#e6eef5', '#f4f4f4', '#7dff9a', '#ffd34d', '#bff4ff'];
const ROD_COLORS  = ['#8b5a2b', '#c9a65b', '#4aa3df', '#555', '#222', '#9fa8b0', '#d4a017'];

// g = overall gear power index (0..41): boat tier * 6 + level
const STAT = {
  rod:    g => 180 + g * 12,                       // lure speed
  lure:   g => Math.round((2 * Math.floor(g / 6) + 1 + (g % 6) * 0.4) * 10) / 10,   // damage per hit
  line:   g => 220 + g * 58,                       // slack length
  knife:  g => ({ chops: Math.max(1, 4 - Math.floor(g / 10)), zone: g * 16, mult: Math.round((1 + g * 0.033) * 100) / 100 }),
  bucket: g => 4 + Math.floor(g / 6) * 5 + (g % 6),
};
const gearCost = (key, g) => Math.round(20 * Math.pow(1.22, g) * GEAR[key].costMult / 5) * 5;

// Special gear: these are kept when you buy a new boat.
const HOOKS = [
  { name:'Single Hook', n:1, cost:0 },
  { name:'Double Hook', n:2, cost:2500 },
  { name:'Triple Hook', n:3, cost:10000 },
  { name:'Quad Hook',   n:4, cost:35000 },
  { name:'Mega Rig',    n:5, cost:100000 },
];
const CANNONS = [
  { name:'No Cannon',     cost:0 },
  { name:'Old Cannon',    cost:300,   power:1, zone:0.22, reload:1.1 },
  { name:'Iron Cannon',   cost:1800,  power:2, zone:0.26, reload:1.0 },
  { name:'Bronze Cannon', cost:7000,  power:3, zone:0.30, reload:0.9 },
  { name:'Steel Cannon',  cost:25000, power:5, zone:0.34, reload:0.8 },
  { name:'Dragon Cannon', cost:80000, power:8, zone:0.40, reload:0.7 },
];
const RIVAL_NAMES = ['Captain Barnacle', 'Salty Sue', 'One-Eyed Pete', 'Rusty Ray', 'Big Bertha', 'Fishhook Fran', 'Old Man Moby', 'Gill Gordon', 'Mean Marlene', 'Skipper Skip'];
const RIVAL_COLORS = [['#6d3fa0', '#3e2160'], ['#2f7d4a', '#1c4a2c'], ['#b0452f', '#6a2318'], ['#3a5f8f', '#203752'], ['#8a6d2a', '#4f3d14']];
const hullHP = () => 12 + tier() * 6;

// Supplies come in packs of 10 from the market. Each cast uses 1 bait; each cannon shot uses 1 cannonball.
const PACK = 10;
const BAIT_PRICES = [10, 20, 40, 80, 150, 300, 600];   // better boats fish deeper, so bait costs more
const baitPrice = () => BAIT_PRICES[tier()];
const BALL_PRICE = 60;
const statText = {
  rod:    g => `Lure speed ${STAT.rod(g)}`,
  lure:   g => `Hits fish for ${STAT.lure(g)} damage`,
  line:   g => `Reaches ${Math.round(Math.min(SEA_DEPTH, STAT.line(g) - 60) / PX_PER_M)} m deep`,
  knife:  g => { const k = STAT.knife(g); return `${k.chops} cut${k.chops > 1 ? 's' : ''} per fish · ${k.zone ? `+${k.zone} speed zone · ` : ''}fillets ×${k.mult}`; },
  bucket: g => `Holds ${STAT.bucket(g)} fish`,
};

// ======================================================================
//  SAVE STATE
// ======================================================================
const SAVE_KEY = 'hook-line-sinker-v2';
function freshState() {
  return { coins:100, tier:-1, hasRod:false, lv:{ rod:0, lure:0, line:0, knife:0, bucket:0 }, hooks:0, cannon:0, bait:0, balls:0, bucket:[], seen:{}, earned:0 };
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

const tier = () => Math.max(0, S.tier);
const gIdx = key => tier() * LV_PER_TIER + S.lv[key];
const gearName = key => `${GEAR[key].names[tier()]} Lv ${S.lv[key] + 1}`;
const G = () => ({
  boat: BOATS[tier()],
  speed: STAT.rod(gIdx('rod')),
  power: STAT.lure(gIdx('lure')),
  len: STAT.line(gIdx('line')),
  knife: STAT.knife(gIdx('knife')),
  cap: STAT.bucket(gIdx('bucket')),
  hooks: HOOKS[S.hooks].n,
});
const allGearMaxed = () => GEAR_KEYS.every(k => S.lv[k] >= LV_PER_TIER - 1);

// ======================================================================
//  HELPERS
// ======================================================================
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => n.toLocaleString('en-US');
let toastTimer = null;
function toast(msg, ms = 2400) {
  const t = $('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
}

// ======================================================================
//  FISH PAINTER — draws real species from their "look"
//  L = half body length. Faces right when dir = 1.
// ======================================================================
function bodyPath(c, L, H, blunt) {
  const b = blunt || 0;
  c.beginPath();
  c.moveTo(L, H * 0.05);
  c.bezierCurveTo(L * (0.98 - b * 0.05), -H * (0.45 + b * 0.55), L * 0.6, -H, L * 0.15, -H);
  c.bezierCurveTo(-L * 0.35, -H, -L * 0.65, -H * 0.4, -L * 0.85, -H * 0.17);
  c.lineTo(-L * 0.85, H * 0.17);
  c.bezierCurveTo(-L * 0.65, H * 0.4, -L * 0.35, H * 0.95, L * 0.15, H * 0.95);
  c.bezierCurveTo(L * 0.6, H * 0.95, L * 0.97, H * 0.5, L, H * 0.05);
  c.closePath();
}
function tri(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); }

function drawTail(c, type, L, H, sw) {
  const x0 = -L * 0.83, s = sw * H;
  c.beginPath();
  if (type === 'fork') {
    c.moveTo(x0, -H * 0.16);
    c.quadraticCurveTo(-L * 1.05, -H * 0.5 + s, -L * 1.28, -H * 0.95 + s);
    c.quadraticCurveTo(-L * 1.12, -H * 0.2 + s, -L * 1.05, s * 0.5);
    c.quadraticCurveTo(-L * 1.12, H * 0.2 + s, -L * 1.28, H * 0.95 + s);
    c.quadraticCurveTo(-L * 1.05, H * 0.5 + s, x0, H * 0.16);
  } else if (type === 'lunate') {
    c.moveTo(x0, -H * 0.12);
    c.quadraticCurveTo(-L * 1.0, -H * 0.6 + s, -L * 1.25, -H * 1.35 + s);
    c.quadraticCurveTo(-L * 1.05, -H * 0.3 + s, -L * 1.0, s * 0.5);
    c.quadraticCurveTo(-L * 1.05, H * 0.3 + s, -L * 1.25, H * 1.35 + s);
    c.quadraticCurveTo(-L * 1.0, H * 0.6 + s, x0, H * 0.12);
  } else if (type === 'square') {
    c.moveTo(x0, -H * 0.16);
    c.lineTo(-L * 1.18, -H * 0.62 + s); c.lineTo(-L * 1.2, H * 0.62 + s);
    c.lineTo(x0, H * 0.16);
  } else if (type === 'round') {
    c.moveTo(x0, -H * 0.18);
    c.quadraticCurveTo(-L * 1.3, -H * 0.9 + s, -L * 1.3, s);
    c.quadraticCurveTo(-L * 1.3, H * 0.9 + s, x0, H * 0.18);
  } else if (type === 'shark') {
    c.moveTo(x0, -H * 0.15);
    c.quadraticCurveTo(-L * 1.05, -H * 0.8 + s, -L * 1.32, -H * 1.5 + s);
    c.quadraticCurveTo(-L * 1.2, -H * 0.3 + s, -L * 1.12, H * 0.1 + s);
    c.quadraticCurveTo(-L * 1.1, H * 0.5 + s, -L * 1.16, H * 0.75 + s);
    c.quadraticCurveTo(-L * 0.98, H * 0.4, x0, H * 0.15);
  } else if (type === 'coel') {   // three-lobed tail
    c.moveTo(x0, -H * 0.2);
    c.quadraticCurveTo(-L * 1.05, -H * 0.9 + s, -L * 1.15, -H * 0.85 + s);
    c.lineTo(-L * 1.1, -H * 0.15 + s);
    c.lineTo(-L * 1.35, s); c.lineTo(-L * 1.1, H * 0.15 + s);
    c.lineTo(-L * 1.15, H * 0.85 + s);
    c.quadraticCurveTo(-L * 1.05, H * 0.9 + s, x0, H * 0.2);
  }
  c.closePath(); c.fill();
}

function drawPattern(c, v, L, H, t) {
  c.save();
  c.lineCap = 'round';
  switch (v.pattern) {
    case 'wavy':      // mackerel tiger stripes on the back
      c.strokeStyle = 'rgba(10,30,25,.75)'; c.lineWidth = Math.max(1.2, L * 0.07);
      for (let i = 0; i < 9; i++) {
        const x = L * 0.45 - i * L * 0.15;
        c.beginPath(); c.moveTo(x, -H); c.quadraticCurveTo(x + L * 0.08, -H * 0.55, x - L * 0.02, -H * 0.15); c.stroke();
      }
      break;
    case 'stripes':   // striped bass horizontal lines
      c.strokeStyle = 'rgba(30,35,30,.6)'; c.lineWidth = Math.max(1, H * 0.09);
      for (let i = 0; i < 6; i++) {
        const y = -H * 0.75 + i * H * 0.27;
        c.beginPath(); c.moveTo(L * 0.55, y); c.lineTo(-L * 0.85, y * 0.5); c.stroke();
      }
      break;
    case 'bluespots':
      c.fillStyle = 'rgba(40,120,200,.7)';
      for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(L * 0.6 - (i % 7) * L * 0.2, -H * 0.4 + Math.floor(i / 7) * H * 0.5, L * 0.035, 0, 7); c.fill(); }
      break;
    case 'yellowband':
      c.fillStyle = 'rgba(240,200,40,.6)';
      c.beginPath(); c.ellipse(-L * 0.05, -H * 0.15, L * 0.7, H * 0.09, 0, 0, 7); c.fill();
      break;
    case 'mottled':
      c.fillStyle = 'rgba(60,45,20,.35)';
      for (let i = 0; i < 22; i++) { c.beginPath(); c.arc(L * (0.7 - ((i * 37) % 150) / 100), -H * (0.9 - ((i * 53) % 120) / 100), L * 0.05, 0, 7); c.fill(); }
      break;
    case 'amberline':  // dark band through the eye and a yellow side stripe
      c.strokeStyle = 'rgba(60,40,20,.65)'; c.lineWidth = L * 0.06;
      c.beginPath(); c.moveTo(L * 0.85, -H * 0.05); c.lineTo(L * 0.4, -H * 0.9); c.stroke();
      c.fillStyle = 'rgba(214,170,60,.6)';
      c.beginPath(); c.ellipse(-L * 0.1, -H * 0.05, L * 0.75, H * 0.1, 0, 0, 7); c.fill();
      break;
    case 'bars':      // marlin light-blue vertical bars
      c.strokeStyle = 'rgba(170,205,255,.6)'; c.lineWidth = L * 0.03;
      for (let i = 0; i < 12; i++) { const x = L * 0.5 - i * L * 0.11; c.beginPath(); c.moveTo(x, -H * 0.8); c.lineTo(x - L * 0.03, H * 0.4); c.stroke(); }
      break;
    case 'blotches':  // coelacanth white flecks
      c.fillStyle = 'rgba(235,240,245,.75)';
      for (let i = 0; i < 16; i++) { c.beginPath(); c.ellipse(L * (0.65 - ((i * 29) % 150) / 100), -H * (0.75 - ((i * 47) % 140) / 100), L * 0.06, L * 0.035, 0.4, 0, 7); c.fill(); }
      break;
    case 'grouperbars':
      c.fillStyle = 'rgba(50,38,18,.4)';
      for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(L * 0.45 - i * L * 0.3, -H * 0.2, L * 0.09, H * 0.75, 0.15, 0, 7); c.fill(); }
      for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(L * (0.75 - ((i * 31) % 160) / 100), -H * (0.8 - ((i * 43) % 150) / 100), L * 0.03, 0, 7); c.fill(); }
      break;
  }
  c.restore();
}

function drawEel(c, sp, v, L, t, flash) {
  // giant oarfish: a long silver ribbon with a red crest
  const N = 26, pts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = L - u * 2 * L;
    pts.push([x, Math.sin(t * 3 - u * 7) * L * 0.08 * u, L * v.h * (1 - u * 0.75)]);
  }
  c.strokeStyle = v.fin; c.lineWidth = Math.max(1.5, L * 0.025);
  for (let i = 1; i < N; i += 1) {   // dorsal crest
    const [x, y, h] = pts[i];
    c.beginPath(); c.moveTo(x, y - h); c.lineTo(x - L * 0.03, y - h - L * 0.07); c.stroke();
  }
  // crest plume on the head
  c.beginPath(); c.moveTo(L * 0.85, -L * 0.08); c.quadraticCurveTo(L * 0.8, -L * 0.35, L * 0.55, -L * 0.42 + Math.sin(t * 4) * 3); c.stroke();
  c.beginPath(); c.moveTo(L * 0.8, -L * 0.08); c.quadraticCurveTo(L * 0.7, -L * 0.28, L * 0.5, -L * 0.3); c.stroke();
  const g = c.createLinearGradient(0, -L * v.h, 0, L * v.h);
  g.addColorStop(0, v.back); g.addColorStop(0.5, v.side); g.addColorStop(1, v.belly);
  c.fillStyle = flash ? '#fff' : g;
  c.beginPath();
  pts.forEach(([x, y, h], i) => i ? c.lineTo(x, y - h) : c.moveTo(x, y - h));
  for (let i = N; i >= 0; i--) { const [x, y, h] = pts[i]; c.lineTo(x, y + h); }
  c.closePath(); c.fill();
  c.fillStyle = 'rgba(80,90,110,.35)';
  for (let i = 3; i < N; i += 2) { const [x, y] = pts[i]; c.beginPath(); c.arc(x, y, L * 0.012, 0, 7); c.fill(); }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(L * 0.9, -L * 0.015, L * 0.03, 0, 7); c.fill();
  c.fillStyle = '#111'; c.beginPath(); c.arc(L * 0.91, -L * 0.015, L * 0.016, 0, 7); c.fill();
}

function drawSquid(c, v, L, t, flash) {
  // giant squid: pointed mantle with fins at the back, big eye, 8 arms and 2 long tentacles in front
  const wave = (i, u) => Math.sin(t * 2.2 + i * 0.9 - u * 4) * L * 0.07 * u;
  c.lineCap = 'round';
  // two long feeding tentacles with clubs
  [-1, 1].forEach((s, i) => {
    c.strokeStyle = v.fin; c.lineWidth = Math.max(1.5, L * 0.025);
    c.beginPath();
    for (let k = 0; k <= 16; k++) { const u = k / 16; const x = L * (0.35 + u * 1.35), y = s * L * 0.05 + wave(i + 3, u) * 1.4; k ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
    c.fillStyle = v.fin;
    c.beginPath(); c.ellipse(L * 1.72, s * L * 0.05 + wave(i + 3, 1) * 1.4, L * 0.1, L * 0.04, 0, 0, 7); c.fill();
  });
  // eight arms
  for (let i = 0; i < 8; i++) {
    const spread = (i - 3.5) * 0.045;
    c.strokeStyle = i % 2 ? v.back : v.side; c.lineWidth = Math.max(2, L * (0.05 - i * 0.002));
    c.beginPath();
    for (let k = 0; k <= 12; k++) { const u = k / 12; const x = L * (0.35 + u * 0.85), y = L * spread * (1 + u * 2) + wave(i, u); k ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  }
  // fins at the tip of the mantle
  c.fillStyle = v.fin;
  c.beginPath(); c.moveTo(-L * 0.75, 0); c.lineTo(-L * 1.12, -L * 0.28 + Math.sin(t * 3) * 3); c.lineTo(-L * 1.2, 0); c.lineTo(-L * 1.12, L * 0.28 - Math.sin(t * 3) * 3); c.closePath(); c.fill();
  // mantle
  const g = c.createLinearGradient(0, -L * 0.25, 0, L * 0.25);
  g.addColorStop(0, v.back); g.addColorStop(0.5, v.side); g.addColorStop(1, v.belly);
  c.fillStyle = flash ? '#ffffff' : g;
  c.beginPath();
  c.moveTo(-L * 1.15, 0);
  c.quadraticCurveTo(-L * 0.6, -L * 0.3, L * 0.05, -L * 0.24);
  c.quadraticCurveTo(L * 0.42, -L * 0.2, L * 0.42, 0);
  c.quadraticCurveTo(L * 0.42, L * 0.2, L * 0.05, L * 0.24);
  c.quadraticCurveTo(-L * 0.6, L * 0.3, -L * 1.15, 0);
  c.fill();
  // spots
  c.fillStyle = 'rgba(90,20,15,.35)';
  for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(-L * (0.9 - (i * 13 % 90) / 100), L * (-0.15 + (i * 7 % 30) / 100), L * 0.025, 0, 7); c.fill(); }
  // the huge eye
  c.fillStyle = '#f4efe2'; c.beginPath(); c.arc(L * 0.25, -L * 0.04, L * 0.1, 0, 7); c.fill();
  c.fillStyle = '#121212'; c.beginPath(); c.arc(L * 0.27, -L * 0.04, L * 0.065, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(L * 0.29, -L * 0.07, L * 0.02, 0, 7); c.fill();
}

function drawFish(c, x, y, sp, dir, t, opts = {}) {
  const v = sp.look, L = opts.size || sp.size, H = L * v.h;
  c.save();
  c.translate(x, y);
  c.scale(dir, 1);
  if (opts.angle) c.rotate(opts.angle);
  if (v.eel) { drawEel(c, sp, v, L, t, opts.flash); c.restore(); return; }
  if (v.squid) { drawSquid(c, v, L, t, opts.flash); c.restore(); return; }
  const sw = Math.sin(t * (v.shark ? 5 : 9)) * 0.14;
  const fin = v.fin;

  // ---- tail & fins behind the body ----
  c.fillStyle = fin;
  drawTail(c, v.tail, L, H, sw);
  switch (v.dorsal) {
    case 'spiny':
      for (let i = 0; i < 9; i++) { const x0 = L * 0.35 - i * L * 0.1; tri(c, [[x0, -H * 0.8], [x0 - L * 0.04, -H * 1.35], [x0 - L * 0.1, -H * 0.8]]); }
      tri(c, [[-L * 0.4, -H * 0.7], [-L * 0.55, -H * 1.15], [-L * 0.75, -H * 0.3]]);
      break;
    case 'long':
      c.beginPath(); c.moveTo(L * 0.7, -H * 0.85); c.quadraticCurveTo(L * 0.2, -H * 1.55, -L * 0.8, -H * 0.4); c.lineTo(-L * 0.6, -H * 0.5); c.closePath(); c.fill();
      break;
    case 'sail':
      c.beginPath(); c.moveTo(L * 0.55, -H * 0.8); c.quadraticCurveTo(L * 0.4, -H * 2.6, L * 0.05, -H * 2.0); c.quadraticCurveTo(-L * 0.4, -H * 1.1, -L * 0.6, -H * 0.55); c.lineTo(-L * 0.2, -H * 0.8); c.closePath(); c.fill();
      break;
    case 'tuna':
      tri(c, [[L * 0.35, -H * 0.85], [L * 0.15, -H * 1.5], [L * 0.0, -H * 0.9]]);
      tri(c, [[-L * 0.1, -H * 0.85], [-L * 0.35, -H * 1.9], [-L * 0.32, -H * 0.7]]);
      tri(c, [[-L * 0.1, H * 0.85], [-L * 0.35, H * 1.9], [-L * 0.32, H * 0.7]]);
      break;
    case 'triple':
      [[0.4, 0.15], [0.05, -0.2], [-0.3, -0.55]].forEach(([a, b]) => {
        c.beginPath(); c.moveTo(L * a, -H * 0.85); c.quadraticCurveTo(L * (a + b) / 2, -H * 1.45, L * b, -H * 0.8); c.closePath(); c.fill();
      });
      break;
    case 'two':
      tri(c, [[L * 0.4, -H * 0.85], [L * 0.2, -H * 1.5], [L * 0.0, -H * 0.9]]);
      tri(c, [[-L * 0.05, -H * 0.9], [-L * 0.2, -H * 1.4], [-L * 0.45, -H * 0.7]]);
      break;
    case 'shark':
      tri(c, [[L * 0.3, -H * 0.9], [L * 0.12, -H * 1.9], [L * 0.0, -H * 0.9]]);
      break;
    case 'sharktall':
      c.beginPath(); c.moveTo(L * 0.25, -H * 0.9); c.quadraticCurveTo(L * 0.05, -H * 2.3, -L * 0.05, -H * 2.6); c.quadraticCurveTo(-L * 0.05, -H * 1.6, -L * 0.15, -H * 0.9); c.closePath(); c.fill();
      tri(c, [[-L * 0.5, -H * 0.6], [-L * 0.58, -H * 1.1], [-L * 0.66, -H * 0.5]]);
      break;
    case 'sharksmall':
      tri(c, [[L * 0.1, -H * 0.9], [-L * 0.02, -H * 1.35], [-L * 0.15, -H * 0.9]]);
      tri(c, [[-L * 0.35, -H * 0.75], [-L * 0.45, -H * 1.2], [-L * 0.55, -H * 0.65]]);
      break;
    default:
      if (!v.angler) tri(c, [[L * 0.3, -H * 0.85], [L * 0.05, -H * 1.55], [-L * 0.3, -H * 0.8]]);
  }
  if (!v.dorsal || v.dorsal === 'two' || v.dorsal === 'spiny' || v.dorsal === 'triple') tri(c, [[-L * 0.15, H * 0.85], [-L * 0.35, H * 1.35], [-L * 0.55, H * 0.6]]);
  if (v.lobed) {   // coelacanth's fleshy lobed fins
    [[L * 0.05, -H * 0.9, -1], [-L * 0.45, -H * 0.7, -1], [-L * 0.1, H * 0.9, 1], [-L * 0.45, H * 0.7, 1]].forEach(([fx, fy, s]) => {
      c.beginPath(); c.ellipse(fx, fy + s * H * 0.35, L * 0.08, H * 0.4, s * 0.5, 0, 7); c.fill();
    });
  }

  // ---- body ----
  bodyPath(c, L, H, v.blunt);
  const g = c.createLinearGradient(0, -H, 0, H);
  g.addColorStop(0, v.back); g.addColorStop(0.45, v.side); g.addColorStop(1, v.belly);
  c.fillStyle = g; c.fill();
  c.save(); bodyPath(c, L, H, v.blunt); c.clip();
  drawPattern(c, v, L, H, t);
  // lateral line
  c.strokeStyle = v.latline || 'rgba(255,255,255,.25)'; c.lineWidth = Math.max(0.8, L * 0.02);
  c.beginPath(); c.moveTo(L * 0.55, -H * 0.4); c.quadraticCurveTo(0, -H * 0.55, -L * 0.85, -H * 0.02); c.stroke();
  // gills
  if (v.shark) {
    c.strokeStyle = 'rgba(40,45,50,.45)'; c.lineWidth = Math.max(1, L * 0.02);
    for (let i = 0; i < 5; i++) { const gx = L * 0.55 - i * L * 0.05; c.beginPath(); c.moveTo(gx, -H * 0.35); c.lineTo(gx - L * 0.02, H * 0.25); c.stroke(); }
  } else {
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = Math.max(1, L * 0.03);
    c.beginPath(); c.arc(L * 0.9, 0, L * 0.38, Math.PI * 0.75, Math.PI * 1.22); c.stroke();
  }
  c.restore();

  // finlets (tuna, mackerel)
  if (v.finlets) {
    c.fillStyle = v.finlets;
    for (let i = 0; i < 5; i++) {
      const fx = -L * 0.4 - i * L * 0.08, fh = H * (0.55 - i * 0.07);
      tri(c, [[fx, -fh], [fx - L * 0.05, -fh - L * 0.06], [fx - L * 0.06, -fh + L * 0.01]]);
      tri(c, [[fx, fh], [fx - L * 0.05, fh + L * 0.06], [fx - L * 0.06, fh - L * 0.01]]);
    }
  }

  // ---- head features ----
  const eyeX = v.angler ? L * 0.55 : v.shark ? L * 0.78 : L * 0.72, eyeY = v.angler ? -H * 0.35 : -H * 0.18;
  const eyeR = Math.max(2, L * (v.angler ? 0.06 : v.shark ? 0.035 : 0.075));
  if (v.bill === 'sword') {
    c.fillStyle = v.back;
    tri(c, [[L * 0.95, -H * 0.22], [L * 2.0, -H * 0.02], [L * 0.95, H * 0.12]]);
  } else if (v.bill === 'spear') {
    c.fillStyle = v.back;
    tri(c, [[L * 0.95, -H * 0.15], [L * 1.7, H * 0.02], [L * 0.95, H * 0.1]]);
  }
  if (v.hammer) {
    c.fillStyle = v.back;
    c.beginPath(); c.ellipse(L * 0.98, -H * 0.05, L * 0.1, H * 1.6, 0, 0, 7); c.fill();
  }
  if (v.angler) {
    // huge toothy mouth
    c.fillStyle = '#1a1214';
    c.beginPath(); c.moveTo(L * 0.98, -H * 0.05); c.quadraticCurveTo(L * 0.7, H * 0.55, L * 0.25, H * 0.25); c.quadraticCurveTo(L * 0.6, H * 0.25, L * 0.98, -H * 0.05); c.fill();
    c.fillStyle = '#f2efe6';
    for (let i = 0; i < 6; i++) { const tx = L * (0.4 + i * 0.1); tri(c, [[tx, H * 0.18], [tx + L * 0.03, H * 0.42], [tx + L * 0.06, H * 0.2]]); }
    c.strokeStyle = v.fin; c.lineWidth = Math.max(1.5, L * 0.05);
    c.beginPath(); c.moveTo(L * 0.5, -H * 0.9); c.quadraticCurveTo(L * 1.0, -H * 2.0, L * 1.35, -H * 1.3); c.stroke();
    const glow = 0.6 + Math.sin(t * 4) * 0.3;
    c.fillStyle = `rgba(190,255,230,${glow * 0.35})`; c.beginPath(); c.arc(L * 1.35, -H * 1.3, L * 0.28, 0, 7); c.fill();
    c.fillStyle = `rgba(210,255,240,${glow})`; c.beginPath(); c.arc(L * 1.35, -H * 1.3, L * 0.11, 0, 7); c.fill();
  } else if (v.bigmouth) {
    c.strokeStyle = 'rgba(40,30,10,.7)'; c.lineWidth = Math.max(1.5, L * 0.04);
    c.beginPath(); c.moveTo(L * 0.99, H * 0.05); c.quadraticCurveTo(L * 0.8, H * 0.35, L * 0.62, H * 0.22); c.stroke();
  } else if (!v.shark) {
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = Math.max(1, L * 0.025);
    c.beginPath(); c.moveTo(L * 0.99, H * 0.08); c.lineTo(L * 0.85, H * 0.15); c.stroke();
  } else {
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = Math.max(1, L * 0.02);
    c.beginPath(); c.moveTo(L * 0.92, H * 0.35); c.quadraticCurveTo(L * 0.82, H * 0.5, L * 0.72, H * 0.38); c.stroke();
  }
  if (v.barbel) {
    c.strokeStyle = v.side; c.lineWidth = Math.max(1, L * 0.025);
    c.beginPath(); c.moveTo(L * 0.82, H * 0.4); c.lineTo(L * 0.8, H * 0.8); c.stroke();
  }
  c.fillStyle = v.eye || '#f4f1e6';
  c.beginPath(); c.arc(eyeX, eyeY, eyeR, 0, 7); c.fill();
  c.fillStyle = '#0d0d0d';
  c.beginPath(); c.arc(eyeX + eyeR * 0.15, eyeY, eyeR * 0.6, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.8)';
  c.beginPath(); c.arc(eyeX + eyeR * 0.35, eyeY - eyeR * 0.3, eyeR * 0.2, 0, 7); c.fill();

  // pectoral fin on top of the body
  c.fillStyle = v.fin; c.globalAlpha = 0.85;
  if (v.shark) tri(c, [[L * 0.45, H * 0.6], [L * 0.15, H * 1.5], [L * 0.2, H * 0.6]]);
  else if (v.lobed) { c.beginPath(); c.ellipse(L * 0.35, H * 0.45, L * 0.1, H * 0.35, 0.6, 0, 7); c.fill(); }
  else tri(c, [[L * 0.55, H * 0.15], [L * 0.25, H * (0.45 + Math.sin(t * 6) * 0.1)], [L * 0.32, H * 0.05]]);
  c.globalAlpha = 1;

  if (opts.flash) {
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(255,255,255,.7)';
    c.fillRect(-L * 2, -H * 3, L * 4.5, H * 6);
  }
  c.restore();
}

// ======================================================================
//  DOCK SCREEN
// ======================================================================
function renderDock() {
  $('dockCoins').textContent = `🪙 ${fmt(S.coins)}`;
  const starterDone = S.tier >= 0 && S.hasRod;

  $('dockGreeting').textContent = starterDone
    ? `You're back at Saltwater Dock. Sell your fillets and upgrade your gear!`
    : `Welcome to Saltwater Dock! You have 100 coins. Buy a Tiny Raft, a Rusty Rod, and a pack of bait at the market to head out.`;

  const shop = $('shop');
  shop.innerHTML = '';

  if (!starterDone) {
    shop.appendChild(starterCard('⛵', 'Boat', 'Tiny Raft', BOATS[0].cost, S.tier >= 0, () => { S.tier = 0; }));
    shop.appendChild(starterCard('🎣', 'Rod', 'Rusty Rod', 30, S.hasRod, () => { S.hasRod = true; }));
  } else {
    GEAR_KEYS.forEach(key => shop.appendChild(gearCard(key)));
    shop.appendChild(boatCard());
    shop.appendChild(specialCard('🪝', 'Multi-Hook', HOOKS, 'hooks',
      h => h.n > 1 ? `Catch ${h.n} fish on one cast` : 'Catches 1 fish per cast'));
    shop.appendChild(specialCard('💣', 'Cannon', CANNONS, 'cannon',
      c => c.power ? `${c.power} damage per shot · attack other fishermen` : 'Buy one to attack other fishermen and steal their fish'));
  }
  $('shopTitle').textContent = starterDone ? `🛒 Upgrade Shop — ${BOATS[tier()].name} gear` : '🛒 Starter Shop: buy these first!';

  // ---- market ----
  const fillets = S.bucket.filter(f => f.filleted);
  const raw = S.bucket.filter(f => !f.filleted);
  const ml = $('marketList');
  if (!S.bucket.length) {
    ml.innerHTML = `<p class="muted">Your bucket is empty. Go catch some fish!</p>`;
  } else {
    let html = fillets.map(f =>
      `<div class="market-row"><span>${speciesById(f.id).name} fillets${f.quality < 1 ? ` <i class="bled">(${Math.round(f.quality * 100)}% value)</i>` : ''}</span><b>🪙 ${fmt(f.value)}</b></div>`).join('');
    const total = fillets.reduce((a, f) => a + f.value, 0);
    if (fillets.length) html += `<div class="market-total">Total: 🪙 ${fmt(total)}</div>`;
    if (raw.length) html += `<p class="muted">🐟 ${raw.length} raw fish still in your bucket. The market only buys fillets, so fillet them with your knife on the boat!</p>`;
    ml.innerHTML = html;
  }
  $('sellBtn').disabled = !fillets.length;
  renderSupplies();

  $('sailBtn').disabled = !starterDone;
  $('sailNote').textContent = starterDone
    ? `${BOATS[tier()].name} · reach ${Math.round(Math.min(SEA_DEPTH, G().len - 60) / PX_PER_M)} m · ${G().power} damage · bucket holds ${G().cap}`
    : 'You need a boat and a rod before you can go fishing.';
  if (starterDone && S.bait <= 0) $('sailNote').innerHTML = '⚠️ <b>You have no bait!</b> Buy a pack at the market so you can cast.';

  renderGuide();
}

function starterCard(icon, kind, name, cost, owned, onBuy) {
  const el = document.createElement('div');
  el.className = 'item starter';
  el.innerHTML = `
    <div class="top"><span class="icon">${icon}</span><div><div class="kind">${kind}</div><div class="now">${owned ? name : 'None yet'}</div></div></div>
    ${owned ? `<div class="maxed">✔ Bought!</div>` :
      `<div class="next">Buy <b>${name}</b></div>
       <button class="btn ${S.coins >= cost ? 'green' : 'blue'}" ${S.coins >= cost ? '' : 'disabled'}>Buy · 🪙 ${cost}</button>`}`;
  const b = el.querySelector('button');
  if (b) b.onclick = () => { if (S.coins < cost) return; S.coins -= cost; onBuy(); save(); toast(`You got the ${name}!`); renderDock(); };
  return el;
}

function gearCard(key) {
  const gear = GEAR[key], lv = S.lv[key], g = gIdx(key);
  const maxed = lv >= LV_PER_TIER - 1;
  const cost = gearCost(key, g + 1);
  const el = document.createElement('div');
  el.className = 'item' + (maxed ? ' done' : '');
  const bars = Array.from({ length: LV_PER_TIER }, (_, i) => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('');
  el.innerHTML = `
    <div class="top"><span class="icon">${gear.icon}</span>
      <div><div class="kind">${gear.kind}</div><div class="now">${gearName(key)}</div></div></div>
    <div class="levels">${bars}</div>
    <div class="stat">${statText[key](g)}</div>
    ${maxed
      ? `<div class="maxed">★ Maxed for this boat</div>`
      : `<div class="next">Lv ${lv + 2}: ${statText[key](g + 1)}</div>
         <button class="btn ${S.coins >= cost ? 'green' : 'blue'}" ${S.coins >= cost ? '' : 'disabled'}>Upgrade · 🪙 ${fmt(cost)}</button>`}`;
  const b = el.querySelector('button');
  if (b) b.onclick = () => {
    if (S.coins < cost) return;
    S.coins -= cost; S.lv[key]++; save();
    toast(`${gear.icon} ${gearName(key)}!`);
    renderDock();
  };
  return el;
}

function boatCard() {
  const next = BOATS[tier() + 1];
  const el = document.createElement('div');
  el.className = 'item boat';
  const bars = BOATS.map((_, i) => `<i class="${i <= tier() ? 'on' : ''}"></i>`).join('');
  const unlocks = next ? SPECIES.filter(s => s.tier === tier() + 1 && !s.wreck).map(s => s.name).join(' & ') : '';
  el.innerHTML = `
    <div class="top"><span class="icon">⛵</span>
      <div><div class="kind">Boat</div><div class="now">${BOATS[tier()].name}</div></div></div>
    <div class="levels">${bars}</div>
    <div class="stat">Hull: ${hullHP()} HP in cannon battles</div>
    ${next ? `
      <div class="next">Next: <b>${next.name}</b><br>Unlocks ${unlocks}.<br>
        <small>Your gear moves up to Lv 1 of a <b>stronger set</b> (${GEAR.rod.names[tier() + 1]}, ${GEAR.lure.names[tier() + 1]}…), which is at least as good as your best gear now.</small></div>
      <button class="btn ${S.coins >= next.cost ? 'green' : 'blue'}" ${S.coins >= next.cost ? '' : 'disabled'}>Buy boat · 🪙 ${fmt(next.cost)}</button>`
    : `<div class="maxed">★ The best boat on the sea!</div>`}`;
  const b = el.querySelector('button');
  if (b) b.onclick = () => {
    if (S.coins < next.cost) return;
    S.coins -= next.cost;
    S.tier++;
    GEAR_KEYS.forEach(k => { S.lv[k] = 0; });
    save();
    toast(`⛵ Welcome aboard the ${next.name}! Your gear moved up to the ${GEAR.rod.names[tier()]} set.`, 4000);
    renderDock();
  };
  return el;
}

function renderSupplies() {
  const el = $('supplies');
  const row = (icon, name, have, price, note, id) => `
    <div class="supply">
      <span class="sicon">${icon}</span>
      <div class="sinfo"><b>${name}</b> · you have <b>${have}</b><br><small>${note}</small></div>
      <button class="btn ${S.coins >= price ? 'green' : 'blue'}" id="${id}" ${S.coins >= price ? '' : 'disabled'}>10 for 🪙 ${fmt(price)}</button>
    </div>`;
  el.innerHTML = `<h3>🧺 Bait &amp; Ammo</h3>` +
    row('🪱', 'Bait', S.bait, baitPrice(), 'Each cast uses 1 bait.', 'buyBait') +
    row('⚫', 'Cannonballs', S.balls, BALL_PRICE, S.cannon ? 'Each cannon shot uses 1.' : 'You need a cannon to use these.', 'buyBalls');
  $('buyBait').onclick = () => buyPack('bait', baitPrice(), '🪱 +10 bait');
  $('buyBalls').onclick = () => buyPack('balls', BALL_PRICE, '⚫ +10 cannonballs');
}
function buyPack(key, price, msg) {
  if (S.coins < price) return;
  S.coins -= price; S[key] += PACK; save();
  toast(msg);
  renderDock();
}

// Multi-Hook and Cannon: bought once, kept forever (not reset by a new boat)
function specialCard(icon, kind, list, key, stat) {
  const lv = S[key], cur = list[lv], next = list[lv + 1];
  const el = document.createElement('div');
  el.className = 'item special';
  const bars = list.slice(1).map((_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('');
  el.innerHTML = `
    <div class="top"><span class="icon">${icon}</span>
      <div><div class="kind">${kind} · kept with every boat</div><div class="now">${cur.name}</div></div></div>
    <div class="levels">${bars}</div>
    <div class="stat">${stat(cur)}</div>
    ${next
      ? `<div class="next">${lv ? 'Upgrade to' : 'Buy'} <b>${next.name}</b><br>${stat(next)}</div>
         <button class="btn ${S.coins >= next.cost ? 'green' : 'blue'}" ${S.coins >= next.cost ? '' : 'disabled'}>${lv ? 'Upgrade' : 'Buy'} · 🪙 ${fmt(next.cost)}</button>`
      : `<div class="maxed">★ Fully upgraded!</div>`}`;
  const b = el.querySelector('button');
  if (b) b.onclick = () => {
    if (S.coins < next.cost) return;
    S.coins -= next.cost; S[key]++; save();
    toast(`${icon} You got the ${next.name}!`);
    renderDock();
  };
  return el;
}

function sellAll() {
  const fillets = S.bucket.filter(f => f.filleted);
  if (!fillets.length) return;
  const total = fillets.reduce((a, f) => a + f.value, 0);
  S.coins += total; S.earned += total;
  S.bucket = S.bucket.filter(f => !f.filleted);
  save();
  toast(`Sold ${fillets.length} fillet${fillets.length > 1 ? 's' : ''} for 🪙 ${fmt(total)}!`);
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
    c.width = 180; c.height = 84;
    const cx = c.getContext('2d');
    const v = sp.look;
    const wide = v.squid ? 3.0 : v.bill === 'sword' ? 3.3 : v.bill ? 3.0 : v.eel ? 2.15 : 2.65;
    const tall = v.eel ? 0.5 : v.h * (v.dorsal === 'sail' ? 3.6 : v.dorsal === 'sharktall' ? 3.6 : v.angler ? 3.4 : 2.6);
    const scale = Math.min(2.4, 160 / (sp.size * wide), 70 / (sp.size * tall));
    cx.save(); cx.translate(v.bill ? 72 : v.squid ? 70 : 96, v.dorsal === 'sail' || v.dorsal === 'sharktall' || v.angler ? 50 : 44); cx.scale(scale, scale);
    if (!known) cx.filter = 'brightness(0)';
    drawFish(cx, 0, 0, sp, 1, 0);
    cx.restore();
    d.appendChild(c);
    d.insertAdjacentHTML('beforeend',
      `<b>${known ? sp.name : '???'}</b>${Math.round(sp.min / PX_PER_M)}–${Math.round(sp.max / PX_PER_M)} m · ${sp.hp} HP` +
      (sp.monster ? `<br><i>One lives at the very bottom. It comes back after you catch it!</i>` :
       sp.wreck ? `<br><i>Only near shipwrecks</i>` :
       sp.tier > tier() ? `<br><i>Needs ${BOATS[sp.tier].name}</i>` : '') +
      (known ? `<span class="gfact">${sp.fact}</span>` : ''));
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
let fish = [], floats = [], bubbles = [], clouds = [], wrecks = [];
const keys = {};
const BOAT_X = 560;
const player = { x: BOAT_X, targetX: null, facing: -1 };
const lure = { active:false, reeling:false, x:0, y:0, hooks:[], diving:false };
let pointerScreen = null;
let camY = 0;
let msgCooldown = 0;
let wreckTimer = 0;
let monsterTimer = 0;
let inks = [];

function boatW() { return BOATS[tier()].w; }
function deckY() { return SURF - 8 + Math.sin(T * 1.6) * 2; }
function fishingZone() { return player.x <= BOAT_X - boatW() / 2 + boatW() * 0.38; }
function filletZone()  { return player.x >= BOAT_X + boatW() / 2 - boatW() * 0.32; }
function rodTip() { return { x: player.x - 52, y: deckY() - 58 }; }
function bucketCount() { return S.bucket.length + lure.hooks.length; }
function bucketFull() { return bucketCount() >= G().cap; }
function lureReach() { return G().len - 60; }

function enterSea() {
  $('dock').classList.add('hidden');
  $('sea').classList.remove('hidden');
  fish = []; floats = []; bubbles = []; wrecks = [];
  camY = 0; pointerScreen = null;
  rival = null; rivalTimer = rand(15, 30);
  inks = []; monsterTimer = 0; spawnMonster(false);
  clouds = Array.from({ length: 5 }, () => ({ x: rand(0, W), y: rand(15, 70), s: rand(0.6, 1.3), v: rand(6, 16) }));
  player.x = BOAT_X; player.targetX = null;
  Object.assign(lure, { active:false, reeling:false, hooks:[] });
  while (unitCount() < targetFishCount()) spawnFish(true);

  if (Math.random() < WRECK_CHANCE) {
    const w = { x: rand(190, W - 190), tilt: rand(-0.1, 0.1), flip: Math.random() < 0.5 ? -1 : 1 };
    wrecks.push(w);
    for (let i = 0; i < 7; i++) spawnWreckFish(w);
  }

  running = true; last = performance.now();
  updateHud();
  if (wrecks.length) {
    const canReach = lureReach() >= SEA_DEPTH - 150;
    toast(`📡 Sonar ping! A shipwreck is resting on the sea floor (${SEA_DEPTH / PX_PER_M} m)` +
      (canReach ? '. Lots of fish are hiding there!' : '. You need a much longer line to reach it.'), 4200);
  } else {
    toast('Walk to the left side of your boat to start fishing! 🎣');
  }
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
  if (raw) toast(`You still have ${raw} raw fish. Fillet them on your boat before selling!`, 3200);
}

function targetFishCount() { return 24 + tier() * 4; }

function makeFish(sp, x, baseY, dir, speed) {
  return {
    sp, dir, baseY, y: baseY, x,
    hp: sp.hp, maxHp: sp.hp,
    speed: speed || sp.speed * rand(0.8, 1.15),
    phase: rand(0, 6.28), amp: rand(3, 8),
    inv: 0, flee: 0, flash: 0, hooked: false, home: null,
  };
}

// Pick a depth first (so fish fill the whole water column), then a species
// that lives there. Schooling species arrive as a group swimming together.
// Each spawn is one "unit": a single fish, or (1 time in 8) a whole school.
const SCHOOL_CHANCE = 1 / 8;
let unitId = 0;
function pickWeighted(list) {
  let r = Math.random() * list.reduce((a, s) => a + s.weight, 0);
  for (const s of list) { r -= s.weight; if (r <= 0) return s; }
  return list[0];
}
function spawnFish(anywhere) {
  const pool = SPECIES.filter(s => !s.wreck && !s.monster && s.tier <= tier());
  const schoolers = pool.filter(s => s.school);
  const isSchool = schoolers.length && Math.random() < SCHOOL_CHANCE;
  let sp, depth;
  if (isSchool) {
    sp = pickWeighted(schoolers);
    depth = rand(sp.min, sp.max);
  } else {
    depth = rand(15, Math.max(...pool.map(s => s.max)));
    let here = pool.filter(s => depth >= s.min && depth <= s.max);
    if (!here.length) here = [pool.reduce((a, s) => Math.abs((s.min + s.max) / 2 - depth) < Math.abs((a.min + a.max) / 2 - depth) ? s : a)];
    sp = pickWeighted(here);
  }
  const unit = ++unitId;
  const dir = Math.random() < 0.5 ? 1 : -1;
  const x0 = anywhere ? rand(60, W - 60) : (dir > 0 ? -70 : W + 70);
  const y0 = SURF + clamp(depth, sp.min, sp.max);
  if (isSchool) {
    const n = Math.round(rand(sp.school[0], sp.school[1]));
    const speed = sp.speed * rand(0.85, 1.1);
    for (let i = 0; i < n; i++) {
      const row = i % 3, col = Math.floor(i / 3);
      const x = x0 - dir * (col * sp.size * 2.3 + rand(0, sp.size));
      const y = clamp(y0 + (row - 1) * sp.size * 1.3 + rand(-4, 4), SURF + sp.min, SURF + sp.max);
      const f = makeFish(sp, x, y, dir, speed);
      f.amp = rand(2, 4); f.phase = rand(0, 1); f.unit = unit;
      fish.push(f);
    }
  } else {
    const f = makeFish(sp, x0, y0, dir);
    f.unit = unit;
    fish.push(f);
  }
}
// schools count as one, so they don't crowd out single fish
function unitCount() { return new Set(fish.filter(f => !f.home && !f.hooked).map(f => f.unit)).size; }

function spawnWreckFish(w) {
  const deep = SPECIES.filter(s => !s.wreck && !s.monster && s.tier <= tier()).slice(-3);
  const sp = Math.random() < 0.3 ? speciesById('goliath') : deep[Math.floor(Math.random() * deep.length)];
  const f = makeFish(sp, w.x + rand(-150, 150), WORLD_H - rand(40, 170), Math.random() < 0.5 ? 1 : -1);
  f.home = w; f.range = rand(90, 180); f.speed *= 0.6;
  fish.push(f);
}

// One Giant Squid lives at the very bottom. Catch it and another shows up a while later.
function spawnMonster(announce) {
  const sp = speciesById('squid');
  const f = makeFish(sp, rand(150, W - 150), SURF + rand(sp.min, sp.max), Math.random() < 0.5 ? 1 : -1);
  f.home = { x: W / 2 }; f.range = 360; f.amp = 6;
  fish.push(f);
  if (announce && lureReach() >= SEA_DEPTH - 150) toast('🦑 Something huge is moving at the very bottom again…', 3500);
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
  if (p.y + camY > SURF) {
    if (lure.active) { if (!lure.reeling) pointerScreen = p; return; }
    if (fishingZone()) cast(p);
    else { player.targetX = BOAT_X - boatW() / 2 + 10; say('Walk to the LEFT side of the boat to fish!'); }
  } else {
    if (lure.active) { reelIn(); return; }
    if (rivalHit(p)) { openBattle(); return; }
    player.targetX = clamp(p.x, BOAT_X - boatW() / 2 + 10, BOAT_X + boatW() / 2 - 10);
  }
});
cv.addEventListener('pointermove', e => {
  if (!lure.active || lure.reeling) return;
  if (e.pointerType === 'mouse' || e.buttons) pointerScreen = canvasPoint(e);
});

window.addEventListener('keydown', e => {
  if (!running) return;
  if (battleOpen()) { if (e.code === 'Space') { e.preventDefault(); fire(); } return; }
  keys[e.key.toLowerCase()] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    if (!$('fillet').classList.contains('hidden')) return;
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
  if (S.bait <= 0) { say('🪱 Out of bait! Sail back to the dock and buy a pack at the market.'); return; }
  S.bait--; save();
  const tip = rodTip();
  Object.assign(lure, { active:true, reeling:false, hooks:[], x: tip.x, y: tip.y });
  pointerScreen = p;
  updateHud();
  if (S.bait === 0) setTimeout(() => toast('🪱 That was your last bait!'), 600);
}
function reelIn() { if (lure.active) { lure.reeling = true; updateHud(); } }

function finishReel(instant) {
  const caught = lure.hooks;
  if (caught.length) {
    caught.forEach(f => { S.bucket.push({ id: f.sp.id, filleted: false, value: 0 }); S.seen[f.sp.id] = true; });
    if (caught.some(f => f.sp.monster)) {
      monsterTimer = 45;
      if (!instant) setTimeout(() => toast('🦑 You caught the GIANT SQUID! Another one will rise from the deep before long…', 4000), 400);
    }
    fish = fish.filter(x => !caught.includes(x));
    if (!instant) addFloat(rodTip().x, rodTip().y - 10,
      caught.length > 1 ? `${caught.length} fish in the bucket!` : `${caught[0].sp.name} in the bucket!`, '#ffe680');
    save();
  }
  Object.assign(lure, { active:false, reeling:false, hooks:[] });
  if (caught.length && bucketFull() && !instant) setTimeout(() => toast('Bucket full! Walk to the right side and fillet your fish 🔪', 3000), 300);
  updateHud();
}

// ---------------- update ----------------
function update(dt) {
  T += dt;
  msgCooldown -= dt;
  updateRival(dt);

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

  if (lure.active) {
    const tip = rodTip();
    const speed = G().speed;
    if (lure.reeling) {
      const dx = tip.x - lure.x, dy = tip.y - lure.y, d = Math.hypot(dx, dy);
      const step = speed * 1.6 * dt;
      if (d <= step + 2) finishReel(false);
      else { lure.x += dx / d * step; lure.y += dy / d * step; }
    } else {
      let tx = pointerScreen ? pointerScreen.x : lure.x;
      let ty = pointerScreen ? pointerScreen.y + camY : lure.y;
      let dx = tx - tip.x, dy = ty - tip.y, d = Math.hypot(dx, dy);
      const len = G().len;
      if (d > len) { tx = tip.x + dx / d * len; ty = tip.y + dy / d * len; }
      ty = clamp(ty, SURF + 6, WORLD_H - 14);
      tx = clamp(tx, 4, W - 4);
      dx = tx - lure.x; dy = ty - lure.y; d = Math.hypot(dx, dy);
      let vy = 0;
      if (d > 0.5) { const m = Math.min(speed * dt, d); lure.x += dx / d * m; lure.y += dy / d * m; vy = (dy / d * m) / dt; }
      lure.diving = vy > speed * 0.6;
      if (lure.diving && lure.y > SURF + 150 && !S.toldDive) {
        S.toldDive = true; save();
        toast('Diving fast! Fish can’t bite a sinking lure. Slow down or move sideways to catch one.', 4000);
      }
      if (Math.random() < dt * (lure.diving ? 10 : 2) && lure.y > SURF) bubbles.push({ x: lure.x, y: lure.y, r: rand(1.5, 3), v: rand(20, 40) });
      if (!lure.diving) checkHits();
    }
  }

  const camTarget = lure.active ? clamp(lure.y - H * 0.45, 0, WORLD_H + 24 - H) : 0;
  camY += (camTarget - camY) * Math.min(1, dt * 4);

  for (const f of fish) {
    f.inv -= dt; f.flee -= dt; f.flash -= dt;
    if (f.hooked) { const i = lure.hooks.indexOf(f); f.x = lure.x + 4 + (i % 2 ? -1 : 1) * i * 6; f.y = lure.y + f.sp.size * 0.3 + i * 14; continue; }
    if (f.home) {
      if (f.x > f.home.x + f.range) f.dir = -1;
      if (f.x < f.home.x - f.range) f.dir = 1;
    }
    // a hit fish speeds up a little but keeps swimming the same way
    f.x += f.dir * f.speed * (f.flee > 0 ? 1.35 : 1) * dt;
    f.y = f.baseY + Math.sin(T * 1.8 + f.phase) * f.amp;
    if (Math.random() < dt * 0.12) bubbles.push({ x: f.x + f.dir * f.sp.size, y: f.y, r: rand(1, 2.5), v: rand(15, 35) });
  }
  fish = fish.filter(f => f.hooked || f.home || (f.x > -260 && f.x < W + 260));
  while (unitCount() < targetFishCount()) spawnFish(false);
  if (!fish.some(f => f.sp.monster)) { monsterTimer -= dt; if (monsterTimer <= 0) spawnMonster(true); }
  inks.forEach(k => { k.life -= dt; k.r += 18 * dt; });
  inks = inks.filter(k => k.life > 0);
  wreckTimer += dt;
  if (wreckTimer > 8) {
    wreckTimer = 0;
    wrecks.forEach(w => { if (fish.filter(f => f.home === w).length < 7) spawnWreckFish(w); });
  }

  bubbles.forEach(b => { b.y -= b.v * dt; b.x += Math.sin(T * 3 + b.y) * 0.3; });
  bubbles = bubbles.filter(b => b.y > SURF && b.y > camY - 20);
  floats.forEach(f => { f.life -= dt; f.y -= 28 * dt; });
  floats = floats.filter(f => f.life > 0);
  clouds.forEach(c => { c.x += c.v * dt; if (c.x > W + 80) c.x = -80; });

  updateHudLive();
}

function checkHits() {
  if (lure.hooks.length >= G().hooks) return;
  for (const f of fish) {
    if (f.hooked || f.inv > 0) continue;
    const reach = (f.sp.look.eel ? f.sp.size * 0.5 : f.sp.size * 0.8) + 6;
    if (Math.hypot(lure.x - f.x, lure.y - f.y) > reach) continue;

    if (bucketFull()) { say('Bucket full! Fillet and sell your fish first.'); f.inv = 1; continue; }

    const dmg = G().power;
    f.hp -= dmg;
    S.seen[f.sp.id] = true;
    if (f.hp <= 0) {
      f.hooked = true;
      lure.hooks.push(f);
      const left = G().hooks - lure.hooks.length;
      if (left <= 0 || bucketFull()) lure.reeling = true;
      addFloat(f.x, f.y - 20, left > 0 && !bucketFull()
        ? `Caught a ${f.sp.name}! (${left} hook${left > 1 ? 's' : ''} left)` : `Caught a ${f.sp.name}!`, '#ffe680');
      updateHud();
    } else {
      f.inv = 0.5; f.flee = 0.8; f.flash = 0.25;
      if (f.sp.monster) for (let i = 0; i < 6; i++) inks.push({ x: f.x - f.dir * rand(20, 80), y: f.y + rand(-30, 30), r: rand(14, 26), life: rand(1.5, 2.5) });
      addFloat(f.x, f.y - 18, `-${dmg}  (${Math.round(f.hp * 10) / 10} left)`, '#ff9b8a');
      if (!f.wasHit) say(`Strong fish! Hit the ${f.sp.name} ${Math.ceil(f.hp / dmg)} more time${Math.ceil(f.hp / dmg) > 1 ? 's' : ''}!`);
      f.wasHit = true;
    }
    return;
  }
}

// ---------------- draw ----------------
function draw() {
  const top = camY, bottom = camY + H;
  ctx.save();
  ctx.translate(0, -camY);

  if (top < SURF) {
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
  }

  const g = ctx.createLinearGradient(0, SURF, 0, WORLD_H);
  g.addColorStop(0, '#2f8fd0'); g.addColorStop(0.08, '#1d5f9a'); g.addColorStop(0.25, '#123d6a');
  g.addColorStop(0.45, '#0a2547'); g.addColorStop(0.7, '#051429'); g.addColorStop(1, '#020a16');
  ctx.fillStyle = g; ctx.fillRect(0, Math.max(SURF, top), W, bottom - Math.max(SURF, top) + 40);

  if (top < SURF + 600) {
    ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) {
      const x = (i * 190 + Math.sin(T * 0.3 + i) * 30) % (W + 200) - 100;
      ctx.beginPath(); ctx.moveTo(x, SURF); ctx.lineTo(x + 60, SURF); ctx.lineTo(x + 220, SURF + 560); ctx.lineTo(x + 120, SURF + 560); ctx.fill();
    }
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
  for (let d = 100; d < SEA_DEPTH; d += 100) {
    const y = SURF + d;
    if (y < top - 10 || y > bottom + 10) continue;
    ctx.fillRect(W - 40, y, 34, 1);
    ctx.fillText(`${d / PX_PER_M} m`, W - 8, y - 4);
  }

  if (bottom > WORLD_H - 260) {
    wrecks.forEach(drawWreck);
    ctx.fillStyle = '#2a2318';
    ctx.beginPath(); ctx.moveTo(0, WORLD_H + 40);
    for (let x = 0; x <= W; x += 30) ctx.lineTo(x, WORLD_H - 10 - Math.sin(x * 0.017) * 9 - Math.sin(x * 0.05) * 4);
    ctx.lineTo(W, WORLD_H + 40); ctx.fill();
    ctx.fillStyle = '#3a3122';
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(40 + i * 113, WORLD_H - 6, 18 + (i % 3) * 8, 9, 0, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#1a4a2c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const x = 30 + i * 68, h = 40 + (i * 37) % 60;
      ctx.beginPath(); ctx.moveTo(x, WORLD_H - 8);
      ctx.quadraticCurveTo(x + Math.sin(T + i) * 14, WORLD_H - 8 - h / 2, x + Math.sin(T * 1.3 + i) * 8, WORLD_H - 8 - h);
      ctx.stroke();
    }
  }

  if (lure.active || fishingZone()) {
    const tip = rodTip(), len = G().len;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, SURF, W, WORLD_H - SURF); ctx.clip();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = lure.active ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.18)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tip.x, tip.y, len, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
  bubbles.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke(); });

  for (const f of fish) {
    if (f.y < top - 80 || f.y > bottom + 80 || f.x < -200 || f.x > W + 200) continue;
    const angle = f.hooked ? Math.sin(T * 14) * 0.4 - 0.9 : 0;
    drawFish(ctx, f.x, f.y, f.sp, f.hooked ? -1 : f.dir, T + f.phase, { flash: f.flash > 0, angle });
    if (f.hp < f.maxHp && !f.hooked) {
      const w = 34;
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(f.x - w / 2, f.y - f.sp.size * Math.max(0.6, f.sp.look.h * 2) - 14, w, 5);
      ctx.fillStyle = '#ff6b5b'; ctx.fillRect(f.x - w / 2, f.y - f.sp.size * Math.max(0.6, f.sp.look.h * 2) - 14, w * (f.hp / f.maxHp), 5);
    }
  }

  // squid ink
  inks.forEach(k => { ctx.fillStyle = `rgba(5,5,12,${Math.min(0.7, k.life * 0.4)})`; ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, 7); ctx.fill(); });

  const tip = rodTip();
  if (lure.active) {
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(tip.x, tip.y);
    ctx.quadraticCurveTo((tip.x + lure.x) / 2 - 10, (tip.y + lure.y) / 2 + 20, lure.x, lure.y);
    ctx.stroke();
    drawLure(lure.x, lure.y);
    if (G().hooks > 1) {
      ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(`🪝 ${lure.hooks.length}/${G().hooks}`, lure.x + 13, lure.y - 7);
      ctx.fillStyle = '#ffe680'; ctx.fillText(`🪝 ${lure.hooks.length}/${G().hooks}`, lure.x + 12, lure.y - 8);
    }
  }

  if (top < SURF + 40) {
    drawRival();
    drawBoat();
    drawPlayer();
    ctx.fillStyle = 'rgba(47,143,208,.55)';
    ctx.beginPath(); ctx.moveTo(0, SURF + 14);
    for (let x = 0; x <= W; x += 10) ctx.lineTo(x, SURF + Math.sin(x * 0.03 + T * 2) * 3);
    ctx.lineTo(W, SURF + 14); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 10) { const y = SURF + Math.sin(x * 0.03 + T * 2) * 3; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();

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
  }

  ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  floats.forEach(f => {
    ctx.globalAlpha = Math.min(1, f.life * 1.5);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(f.text, f.x + 1, f.y + 1);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
  });
  ctx.globalAlpha = 1;
  ctx.restore();

  const dark = clamp((camY - 300) / 1700, 0, 0.84);
  if (dark > 0) {
    const lx = lure.active ? lure.x : W / 2, ly = lure.active ? lure.y - camY : H / 2;
    const r = 210 + tier() * 25 + S.lv.lure * 8;
    const rg = ctx.createRadialGradient(lx, ly, 40, lx, ly, r);
    rg.addColorStop(0, 'rgba(0,4,14,0)');
    rg.addColorStop(1, `rgba(0,4,14,${dark})`);
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }

  if (lure.active && lure.y > SURF) {
    const m = Math.round((lure.y - SURF) / PX_PER_M);
    const maxM = Math.round(Math.min(SEA_DEPTH, lureReach()) / PX_PER_M);
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ctx.fillRect(12, 12, 176, 30);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`⬇ ${m} m  (max ${maxM} m)`, 22, 33);
  }
}

function drawWreck(w) {
  ctx.save();
  ctx.translate(w.x, WORLD_H - 12);
  ctx.rotate(w.tilt);
  ctx.scale(w.flip, 1);
  ctx.fillStyle = '#3d2b1c';
  ctx.beginPath();
  ctx.moveTo(-160, 4); ctx.lineTo(-178, -58); ctx.lineTo(120, -66);
  ctx.quadraticCurveTo(180, -60, 168, -22); ctx.lineTo(140, 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2;
  for (let y = -50; y < 0; y += 12) { ctx.beginPath(); ctx.moveTo(-170, y); ctx.lineTo(160, y - 4); ctx.stroke(); }
  ctx.fillStyle = '#05080c';
  ctx.beginPath(); ctx.ellipse(-50, -30, 30, 17, 0.3, 0, 7); ctx.fill();
  [[30, -40], [70, -42], [110, -44]].forEach(([x, y]) => {
    ctx.fillStyle = '#7a6a45'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
    ctx.fillStyle = '#0a1420'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
  });
  ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(10, -64); ctx.lineTo(44, -200); ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(22, -150); ctx.lineTo(84, -164); ctx.stroke();
  ctx.fillStyle = 'rgba(190,180,150,.3)';
  ctx.beginPath(); ctx.moveTo(30, -146); ctx.lineTo(80, -158); ctx.lineTo(70 + Math.sin(T) * 5, -100); ctx.lineTo(50, -112); ctx.lineTo(38, -96); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5c3a1a'; ctx.fillRect(-135, -18, 36, 20);
  ctx.fillStyle = '#7a4c22'; ctx.beginPath(); ctx.ellipse(-117, -18, 18, 8, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#e8b923'; ctx.fillRect(-119, -16, 4, 6);
  const sp = (Math.sin(T * 3) + 1) / 2;
  ctx.fillStyle = `rgba(255,230,120,${0.3 + sp * 0.6})`;
  ctx.beginPath(); ctx.arc(-108, -24, 2 + sp * 2, 0, 7); ctx.arc(-126, -20, 1.5 + (1 - sp) * 2, 0, 7); ctx.fill();
  ctx.strokeStyle = '#1f5a34'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const x = -150 + i * 55;
    ctx.beginPath(); ctx.moveTo(x, -6); ctx.quadraticCurveTo(x + Math.sin(T + i) * 8, -26, x + Math.sin(T * 1.2 + i) * 5, -42); ctx.stroke();
  }
  ctx.restore();
}

function drawLure(x, y) {
  const col = LURE_COLORS[tier()];
  ctx.save(); ctx.translate(x, y);
  if (tier() >= 4) { ctx.fillStyle = col + '55'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill(); }
  ctx.fillStyle = col; ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, 4, 7, Math.sin(T * 6) * 0.4, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(2, 9, 4, Math.PI * 0.9, Math.PI * 0.1, true); ctx.stroke();
  ctx.restore();
}

function drawBoat() {
  const w = boatW(), y = deckY(), l = BOAT_X - w / 2, r = BOAT_X + w / 2, lv = tier();
  ctx.save();
  if (lv === 0) {
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#8a5a2b' : '#9c6a36'; ctx.fillRect(l, y + i * 4, w, 5); }
    ctx.fillStyle = '#6e4420';
    for (let x = l + 6; x < r; x += 22) ctx.fillRect(x, y, 3, 18);
  } else {
    const hullH = 14 + lv * 5;
    const colors = [null, ['#b5542f', '#8c3e20'], ['#a9b3ba', '#5c6a75'], ['#f4f4f4', '#2a74c9'],
      ['#c0392b', '#1d2b3a'], ['#f2f2f2', '#e8742a'], ['#1f2d44', '#f28c28']][lv];
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(l - 10, y); ctx.lineTo(r + 14, y);
    ctx.lineTo(r - 8, y + hullH); ctx.lineTo(l + 12, y + hullH); ctx.closePath(); ctx.fill();
    ctx.fillStyle = colors[1]; ctx.fillRect(l - 4, y + 3, w + 12, 4);
    if (lv === 1) {   // oars
      ctx.strokeStyle = '#7a4f24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(BOAT_X - 10, y - 4); ctx.lineTo(BOAT_X - 40, y + 26); ctx.stroke();
    }
    if (lv === 2) {   // outboard motor
      ctx.fillStyle = '#333'; ctx.fillRect(r + 8, y - 16, 14, 18);
      ctx.fillStyle = '#555'; ctx.fillRect(r + 12, y + 2, 5, 20);
    }
    if (lv >= 3) {    // cabin
      const cw = w * 0.24, cx = BOAT_X - cw / 2 + 10, chH = 30 + lv * 3;
      ctx.fillStyle = lv === 6 ? '#e9edf2' : '#fff';
      ctx.fillRect(cx, y - chH, cw, chH);
      ctx.fillStyle = '#7fc3f0'; ctx.fillRect(cx + 6, y - chH + 6, cw - 12, 10);
      ctx.fillStyle = colors[1]; ctx.fillRect(cx - 4, y - chH - 4, cw + 8, 5);
      if (lv >= 4) {  // mast + flag
        ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(BOAT_X + 10, y - chH - 4); ctx.lineTo(BOAT_X + 10, y - chH - 56); ctx.stroke();
        ctx.fillStyle = '#ffd34d';
        ctx.beginPath(); ctx.moveTo(BOAT_X + 10, y - chH - 56); ctx.lineTo(BOAT_X + 40 + Math.sin(T * 5) * 3, y - chH - 48); ctx.lineTo(BOAT_X + 10, y - chH - 40); ctx.fill();
      }
      if (lv >= 5) {  // crane
        ctx.strokeStyle = colors[1]; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(BOAT_X - cw / 2, y - chH); ctx.lineTo(BOAT_X - cw / 2 - 50, y - chH - 40); ctx.stroke();
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(BOAT_X - cw / 2 - 50, y - chH - 40); ctx.lineTo(BOAT_X - cw / 2 - 50, y - 20); ctx.stroke();
      }
      if (lv === 6) { // radar dome
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + cw - 10, y - chH - 6, 9, Math.PI, 0); ctx.fill();
      }
    }
  }
  ctx.fillStyle = '#e2c08a'; ctx.fillRect(r - 34, y - 8, 28, 8);
  ctx.fillStyle = '#bbb'; ctx.fillRect(r - 28, y - 12, 14, 3);
  ctx.fillStyle = '#5c3a1a'; ctx.fillRect(r - 15, y - 13, 6, 4);
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
  ctx.strokeStyle = '#2b3a55'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x - 3, y - 22); ctx.lineTo(x - 4 + step, y);
  ctx.moveTo(x + 3, y - 22); ctx.lineTo(x + 4 - step, y); ctx.stroke();
  ctx.fillStyle = '#f2c230';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 10, y - 50, 20, 30, 6) : ctx.rect(x - 10, y - 50, 20, 30); ctx.fill();
  ctx.fillStyle = '#f1c9a5'; ctx.beginPath(); ctx.arc(x, y - 59, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + f * 4, y - 60, 1.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#e0a910';
  ctx.beginPath(); ctx.ellipse(x, y - 66, 14, 4, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 67, 8, Math.PI, 0); ctx.fill();

  if (fishingZone() || lure.active) {
    const tip = rodTip();
    ctx.strokeStyle = '#2b3a55'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y - 42); ctx.lineTo(x - 12, y - 38); ctx.stroke();
    ctx.strokeStyle = ROD_COLORS[tier()];
    ctx.lineWidth = 3;
    const bend = lure.hooks.length ? 10 + Math.sin(T * 20) * 4 : 0;
    ctx.beginPath(); ctx.moveTo(x - 10, y - 32);
    ctx.quadraticCurveTo(x - 30, y - 48 + bend, tip.x, tip.y + bend * 0.5); ctx.stroke();
    if (!lure.active) {
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
  $('seaCoins').textContent = `🪙 ${fmt(S.coins)}`;
  $('suppliesPill').textContent = `🪱 ${S.bait}` + (S.cannon ? ` · ⚫ ${S.balls}` : '');
  $('suppliesPill').classList.toggle('full', S.bait <= 0);
  $('gearPill').textContent = `${BOATS[tier()].name} · ${gearName('rod')} · ${gearName('lure')} (${G().power} dmg) · ${gearName('line')} · ${gearName('knife')}`;
  updateHudLive(true);
}
let lastHudKey = '';
function updateHudLive(force) {
  const cap = G().cap, n = S.bucket.length;
  const raw = S.bucket.some(f => !f.filleted);
  const key = [n, cap, lure.active, lure.reeling, filletZone(), raw, !!rivalVisible()].join();
  if (key === lastHudKey && !force) return;
  lastHudKey = key;
  const pill = $('bucketPill');
  pill.textContent = `🪣 ${n}/${cap}`;
  pill.classList.toggle('full', n >= cap);
  $('reelBtn').classList.toggle('hidden', !lure.active || lure.reeling);
  $('filletBtn').classList.toggle('hidden', !(filletZone() && raw && !lure.active));
  $('attackBtn').classList.toggle('hidden', !(rivalVisible() && S.cannon && !lure.active));
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if ($('fillet').classList.contains('hidden') && !battleOpen()) update(dt);
  draw();
  requestAnimationFrame(loop);
}

// ======================================================================
//  RIVAL FISHERMEN & CANNON BATTLES
//  Rivals sail past now and then. With a cannon you can attack them:
//  win and you steal their fish, lose and they take 25% of your coins
//  and half your fish. The better their catch, the tougher they are.
// ======================================================================
let rival = null, rivalTimer = 0;

function spawnRival() {
  const roll = Math.random();
  const t = clamp(tier() + (roll < 0.5 ? 0 : roll < 0.8 ? 1 : -1), 0, BOATS.length - 1);
  const pool = SPECIES.filter(s => !s.wreck && !s.monster && s.tier <= t);
  const n = Math.round(rand(2, 3 + t));
  const fishIds = Array.from({ length: n }, () => pool[Math.min(pool.length - 1, Math.floor(pool.length * Math.sqrt(Math.random())))].id);
  const dir = Math.random() < 0.5 ? 1 : -1;
  rival = {
    name: RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)],
    colors: RIVAL_COLORS[Math.floor(Math.random() * RIVAL_COLORS.length)],
    tier: t, w: BOATS[t].w * 0.8, x: dir > 0 ? -40 : W + 40, dir, speed: rand(26, 38),
    fish: fishIds, interval: rand(1.8, 2.6),
  };
  toast(`⛵ ${rival.name} is sailing by with ${n} fish` + (S.cannon ? '. Click their boat to attack! 💣' : '.'), 3200);
  updateHud();
}

function updateRival(dt) {
  rivalTimer -= dt;
  if (!rival && rivalTimer <= 0) spawnRival();
  if (rival) {
    rival.x += rival.dir * rival.speed * dt;
    if (rival.x < -160 || rival.x > W + 160) { rival = null; rivalTimer = rand(45, 80); updateHud(); }
  }
}

function rivalStats(r) {
  const value = r.fish.reduce((a, id) => a + speciesById(id).value, 0);
  return { value, hp: Math.round(6 + Math.sqrt(value) * 0.9), dmg: 1 + Math.floor(Math.sqrt(value) / 12), interval: r.interval };
}
function difficulty(r) {
  const st = rivalStats(r), c = CANNONS[S.cannon];
  const myDps = c.power * 0.75 / c.reload;
  const taken = (st.hp / myDps) * st.dmg * 0.7 / st.interval;
  const ratio = taken / hullHP();
  return ratio < 0.45 ? ['Easy', '#2e9d52'] : ratio < 0.8 ? ['Fair', '#b8860b'] : ratio < 1.15 ? ['Hard', '#d2683f'] : ['Very hard', '#b3261e'];
}

function drawRival() {
  if (!rival) return;
  const r = rival, y = SURF - 4 + Math.sin(T * 1.4 + 1) * 2, w = r.w, hh = 12 + r.tier * 3;
  ctx.save();
  ctx.translate(r.x, y);
  ctx.globalAlpha = 0.95;
  // hull
  ctx.fillStyle = r.colors[0];
  ctx.beginPath(); ctx.moveTo(-w / 2 - 8, 0); ctx.lineTo(w / 2 + 10, 0); ctx.lineTo(w / 2 - 6, hh); ctx.lineTo(-w / 2 + 10, hh); ctx.closePath(); ctx.fill();
  ctx.fillStyle = r.colors[1]; ctx.fillRect(-w / 2 - 4, 3, w + 12, 3);
  // cabin
  if (r.tier >= 2) { ctx.fillStyle = '#eee'; ctx.fillRect(-w * 0.12, -26, w * 0.24, 26); ctx.fillStyle = '#7fc3f0'; ctx.fillRect(-w * 0.12 + 4, -21, w * 0.24 - 8, 8); }
  // fisherman
  const fx = r.dir > 0 ? w * 0.3 : -w * 0.3;
  ctx.fillStyle = r.colors[1]; ctx.fillRect(fx - 7, -36, 14, 22);
  ctx.fillStyle = '#e9c3a0'; ctx.beginPath(); ctx.arc(fx, -42, 7, 0, 7); ctx.fill();
  ctx.fillStyle = '#333'; ctx.fillRect(fx - 9, -50, 18, 4); ctx.fillRect(fx - 5, -56, 10, 7);
  ctx.strokeStyle = '#5c3a1a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(fx, -30); ctx.lineTo(fx + r.dir * 40, -62); ctx.stroke();
  // flag
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-w * 0.3, 0); ctx.lineTo(-w * 0.3, -60); ctx.stroke();
  ctx.fillStyle = r.colors[0];
  ctx.beginPath(); ctx.moveTo(-w * 0.3, -60); ctx.lineTo(-w * 0.3 - r.dir * 22, -54 + Math.sin(T * 5) * 2); ctx.lineTo(-w * 0.3, -48); ctx.fill();
  // name tag
  ctx.globalAlpha = 1;
  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  const label = `${r.name} · ${r.fish.length} fish${S.cannon ? ' · 💣 click to attack' : ''}`;
  const tw = ctx.measureText(label).width + 12;
  ctx.fillStyle = 'rgba(10,25,45,.7)'; ctx.fillRect(-tw / 2, -84, tw, 18);
  ctx.fillStyle = '#fff'; ctx.fillText(label, 0, -71);
  ctx.restore();
}
const rivalVisible = () => rival && rival.x > -30 && rival.x < W + 30;
function rivalHit(p) {
  return rivalVisible() && Math.abs(p.x - rival.x) < rival.w / 2 + 20 && p.y + camY > SURF - 90 && p.y + camY < SURF + 25;
}

// ---------------- battle screen ----------------
const bcv = $('battleCanvas'), bx = bcv.getContext('2d');
const BW = bcv.width, BH = bcv.height;   // 460 x 250
let battle = null;
const battleOpen = () => !$('battle').classList.contains('hidden');

function openBattle() {
  if (!rival) return;
  if (!S.cannon) { toast('Buy a cannon at the dock to attack other fishermen! 💣'); return; }
  if (S.balls <= 0) { toast('⚫ You have no cannonballs! Buy a pack of 10 at the market.'); return; }
  if (lure.active) { say('Reel in your line first!'); return; }
  const st = rivalStats(rival), [diff, col] = difficulty(rival);
  const best = rival.fish.map(speciesById).reduce((a, s) => s.value > a.value ? s : a);
  battle = { phase: 'prompt', st };
  $('battleTitle').textContent = `⚔️ ${rival.name}`;
  $('battleSub').innerHTML = `Carrying <b>${rival.fish.length} fish</b>, best catch: <b>${best.name}</b>.<br>
    Difficulty: <b style="color:${col}">${diff}</b> · their boat ${st.hp} HP vs your ${BOATS[tier()].name} ${hullHP()} HP<br>
    You have <b>${S.balls} cannonballs</b>.<br>
    <small>Win: steal their fish. Lose (or run out of cannonballs): they take 25% of your coins and half your fish.</small>`;
  $('battleStart').classList.remove('hidden');
  $('battleFight').classList.add('hidden');
  $('battleEnd').classList.add('hidden');
  $('battle').classList.remove('hidden');
  requestAnimationFrame(battleLoop);
}

function startFight() {
  const st = battle.st;
  Object.assign(battle, {
    phase: 'fight', myHp: hullHP(), myMax: hullHP(), rHp: st.hp, rMax: st.hp, rDmg: st.dmg, rInterval: st.interval,
    rTimer: 1.6, reload: 0, t: 0, balls: [], booms: [], texts: [], last: performance.now(),
  });
  $('battleSub').textContent = 'Click FIRE (or press Space) when the needle is in the green. The dark middle does double damage!';
  $('battleStart').classList.add('hidden');
  $('battleFight').classList.remove('hidden');
}

function needlePos() { return 0.5 + 0.5 * Math.sin(battle.t * 3.1); }

function fire() {
  if (!battle || battle.phase !== 'fight' || battle.reload > 0 || S.balls <= 0) return;
  S.balls--;
  const c = CANNONS[S.cannon];
  const d = Math.abs(needlePos() - 0.5);
  const hit = d < c.zone / 2, crit = d < c.zone / 8;
  battle.balls.push({ from: 'me', t: 0, dur: 0.75, hit, crit, dmg: c.power * (crit ? 2 : 1), miss: rand(30, 60) });
  battle.reload = c.reload;
}

function endBattle(won) {
  battle.phase = 'result';
  const r = rival, st = battle.st;
  let msg;
  if (won) {
    const space = Math.max(0, G().cap - S.bucket.length);
    const taken = r.fish.slice(0, space);
    taken.forEach(id => { S.bucket.push({ id, filleted: false, value: 0 }); S.seen[id] = true; });
    const loot = Math.round(st.value * 0.1);
    S.coins += loot;
    msg = `🏴‍☠️ You beat ${r.name}! You stole ${taken.length} fish and 🪙 ${fmt(loot)}.` +
      (taken.length < r.fish.length ? ` Your bucket was too full for ${r.fish.length - taken.length} more.` : '');
  } else {
    const lostCoins = Math.floor(S.coins * 0.25);
    S.coins -= lostCoins;
    const nLose = Math.ceil(S.bucket.length / 2);
    const lost = [];
    for (let i = 0; i < nLose; i++) lost.push(S.bucket.splice(Math.floor(Math.random() * S.bucket.length), 1)[0]);
    msg = (battle.outOfAmmo ? '⚫ You ran out of cannonballs! ' : '') + `💥 ${r.name} won! You lost 🪙 ${fmt(lostCoins)}` + (lost.length ? ` and ${lost.length} fish.` : '.');
  }
  save();
  $('battleSub').textContent = msg;
  $('battleFight').classList.add('hidden');
  $('battleEnd').classList.remove('hidden');
  rival = null; rivalTimer = rand(45, 80);
}

function closeBattle() {
  $('battle').classList.add('hidden');
  battle = null;
  updateHud();
}

function drawBattleBoat(x, y, w, colors, facing, hp, max, isMe) {
  bx.save(); bx.translate(x, y);
  bx.fillStyle = colors[0];
  bx.beginPath(); bx.moveTo(-w / 2, 0); bx.lineTo(w / 2, 0); bx.lineTo(w / 2 - 14, 26); bx.lineTo(-w / 2 + 14, 26); bx.closePath(); bx.fill();
  bx.fillStyle = colors[1]; bx.fillRect(-w / 2 + 4, 5, w - 8, 4);
  bx.fillStyle = '#eee'; bx.fillRect(-18 - facing * 14, -24, 30, 24);
  bx.fillStyle = '#7fc3f0'; bx.fillRect(-14 - facing * 14, -19, 22, 8);
  // cannon
  bx.fillStyle = '#2b2b2b';
  bx.save(); bx.translate(facing * w * 0.28, -6); bx.rotate(facing > 0 ? -0.35 : Math.PI + 0.35);
  bx.fillRect(0, -5, 30, 10); bx.restore();
  bx.beginPath(); bx.arc(facing * w * 0.28, -2, 8, 0, 7); bx.fill();
  // flag
  bx.strokeStyle = '#333'; bx.lineWidth = 2;
  bx.beginPath(); bx.moveTo(-facing * w * 0.3, 0); bx.lineTo(-facing * w * 0.3, -54); bx.stroke();
  bx.fillStyle = isMe ? '#ffd34d' : colors[0];
  bx.beginPath(); bx.moveTo(-facing * w * 0.3, -54); bx.lineTo(-facing * w * 0.3 + facing * 24, -48); bx.lineTo(-facing * w * 0.3, -42); bx.fill();
  // smoke when damaged
  if (hp / max < 0.5) {
    for (let i = 0; i < 3; i++) {
      const s = (battle.t * 0.8 + i / 3) % 1;
      bx.fillStyle = `rgba(60,60,60,${0.5 * (1 - s)})`;
      bx.beginPath(); bx.arc(-6 + Math.sin(i + battle.t) * 6, -28 - s * 40, 6 + s * 10, 0, 7); bx.fill();
    }
  }
  bx.restore();
}

function battleLoop() {
  if (!battleOpen() || !battle) return;
  const now = performance.now();
  const dt = battle.last ? Math.min(0.05, (now - battle.last) / 1000) : 0;
  battle.last = now;
  battle.t = (battle.t || 0) + dt;
  const meX = 95, rX = 365, waterY = 150;

  if (battle.phase === 'fight') {
    battle.reload = Math.max(0, battle.reload - dt);
    battle.rTimer -= dt;
    if (battle.rTimer <= 0) {
      battle.rTimer = battle.rInterval * rand(0.85, 1.15);
      battle.balls.push({ from: 'rival', t: 0, dur: 0.8, hit: Math.random() < 0.7, dmg: battle.rDmg, miss: rand(30, 60) });
    }
    battle.balls.forEach(b => {
      b.t += dt;
      if (b.t >= b.dur && !b.done) {
        b.done = true;
        const tx = b.from === 'me' ? rX : meX;
        if (b.hit) {
          if (b.from === 'me') battle.rHp = Math.max(0, battle.rHp - b.dmg); else battle.myHp = Math.max(0, battle.myHp - b.dmg);
          battle.booms.push({ x: tx, y: waterY - 10, t: 0, fire: true });
          battle.texts.push({ x: tx, y: waterY - 60, t: 0, text: (b.crit ? 'CRIT! ' : '') + `-${b.dmg}`, color: b.from === 'me' ? '#ffe680' : '#ff8f80' });
        } else {
          battle.booms.push({ x: tx + (b.from === 'me' ? b.miss : -b.miss), y: waterY + 6, t: 0, fire: false });
          battle.texts.push({ x: tx, y: waterY - 60, t: 0, text: 'Miss', color: '#ffffff' });
        }
      }
    });
    battle.balls = battle.balls.filter(b => !b.done);
    if (battle.rHp <= 0) endBattle(true);
    else if (battle.myHp <= 0) endBattle(false);
    else if (S.balls <= 0 && !battle.balls.some(b => b.from === 'me')) { battle.outOfAmmo = true; endBattle(false); }
  }

  // ---- draw ----
  let g = bx.createLinearGradient(0, 0, 0, waterY);
  g.addColorStop(0, '#5db6ea'); g.addColorStop(1, '#bfe7fb');
  bx.fillStyle = g; bx.fillRect(0, 0, BW, waterY);
  g = bx.createLinearGradient(0, waterY, 0, BH);
  g.addColorStop(0, '#2f8fd0'); g.addColorStop(1, '#123d6a');
  bx.fillStyle = g; bx.fillRect(0, waterY, BW, BH - waterY);

  const r = rival || battle.lastRival;
  if (rival) battle.lastRival = rival;
  const meHp = battle.myHp ?? hullHP(), meMax = battle.myMax ?? hullHP();
  const rHp = battle.rHp ?? battle.st.hp, rMax = battle.rMax ?? battle.st.hp;
  const bob = Math.sin(battle.t * 2) * 2;
  const myColors = [['#9c6a36', '#6e4420'], ['#b5542f', '#8c3e20'], ['#a9b3ba', '#5c6a75'], ['#f4f4f4', '#2a74c9'], ['#c0392b', '#1d2b3a'], ['#f2f2f2', '#e8742a'], ['#1f2d44', '#f28c28']][tier()];
  if (!(battle.phase === 'result' && meHp <= 0)) drawBattleBoat(meX, waterY - 18 + bob, 130, myColors, 1, meHp, meMax, true);
  if (r && !(battle.phase === 'result' && rHp <= 0)) drawBattleBoat(rX, waterY - 18 - bob, 130, r.colors, -1, rHp, rMax, false);
  // waves in front
  bx.fillStyle = 'rgba(47,143,208,.6)';
  bx.beginPath(); bx.moveTo(0, waterY + 12);
  for (let x = 0; x <= BW; x += 10) bx.lineTo(x, waterY + Math.sin(x * 0.05 + battle.t * 2) * 3);
  bx.lineTo(BW, waterY + 12); bx.fill();

  // cannonballs
  (battle.balls || []).forEach(b => {
    const u = Math.min(1, b.t / b.dur);
    const x0 = b.from === 'me' ? meX + 50 : rX - 50, x1 = b.from === 'me' ? rX + (b.hit ? 0 : b.miss) : meX - (b.hit ? 0 : b.miss);
    const x = x0 + (x1 - x0) * u, y = waterY - 30 + (b.hit ? -10 : 30) * u - Math.sin(Math.PI * u) * 75;
    bx.fillStyle = '#1b1b1b'; bx.beginPath(); bx.arc(x, y, 5, 0, 7); bx.fill();
  });
  // explosions and splashes
  (battle.booms || []).forEach(e => {
    e.t += dt;
    const s = e.t / 0.6;
    if (e.fire) {
      bx.fillStyle = `rgba(255,170,40,${1 - s})`; bx.beginPath(); bx.arc(e.x, e.y, 10 + s * 26, 0, 7); bx.fill();
      bx.fillStyle = `rgba(255,240,150,${1 - s})`; bx.beginPath(); bx.arc(e.x, e.y, 5 + s * 12, 0, 7); bx.fill();
    } else {
      bx.strokeStyle = `rgba(255,255,255,${1 - s})`; bx.lineWidth = 3;
      for (let i = -2; i <= 2; i++) { bx.beginPath(); bx.moveTo(e.x + i * 5, e.y); bx.lineTo(e.x + i * 9, e.y - 30 * Math.sin(Math.PI * Math.min(1, s))); bx.stroke(); }
    }
  });
  if (battle.booms) battle.booms = battle.booms.filter(e => e.t < 0.6);
  bx.font = 'bold 16px sans-serif'; bx.textAlign = 'center';
  (battle.texts || []).forEach(tx => {
    tx.t += dt;
    bx.globalAlpha = Math.max(0, 1 - tx.t);
    bx.fillStyle = 'rgba(0,0,0,.5)'; bx.fillText(tx.text, tx.x + 1, tx.y - tx.t * 30 + 1);
    bx.fillStyle = tx.color; bx.fillText(tx.text, tx.x, tx.y - tx.t * 30);
  });
  bx.globalAlpha = 1;
  if (battle.texts) battle.texts = battle.texts.filter(tx => tx.t < 1);

  // health bars
  const bar = (x, label, hp, max, col) => {
    bx.fillStyle = 'rgba(0,0,0,.45)'; bx.fillRect(x, 10, 170, 24);
    bx.fillStyle = col; bx.fillRect(x + 3, 13, 164 * (hp / max), 18);
    bx.fillStyle = '#fff'; bx.font = 'bold 12px sans-serif'; bx.textAlign = 'center';
    bx.fillText(`${label}: ${hp}/${max}`, x + 85, 27);
  };
  bar(12, 'You', meHp, meMax, '#2e9d52');
  if (r) bar(BW - 182, r.name, rHp, rMax, '#d2483f');

  // aim meter
  if (battle.phase === 'fight') {
    const c = CANNONS[S.cannon], mx = 40, mw = BW - 80, my = 212;
    bx.fillStyle = 'rgba(0,0,0,.45)'; bx.fillRect(mx, my, mw, 16);
    bx.fillStyle = '#2e9d52'; bx.fillRect(mx + mw * (0.5 - c.zone / 2), my, mw * c.zone, 16);
    bx.fillStyle = '#1d6b37'; bx.fillRect(mx + mw * (0.5 - c.zone / 8), my, mw * c.zone / 4, 16);
    const nx = mx + mw * needlePos();
    bx.fillStyle = '#fff'; bx.fillRect(nx - 2, my - 6, 4, 28);
    bx.font = 'bold 12px sans-serif'; bx.textAlign = 'center';
    bx.fillStyle = '#fff';
    bx.fillText(`${battle.reload > 0 ? 'Reloading…' : 'Aim: fire in the green!'}   ⚫ ${S.balls} left`, BW / 2, my - 8);
    $('fireBtn').disabled = battle.reload > 0;
  }
  requestAnimationFrame(battleLoop);
}

$('battleGo').onclick = startFight;
$('battleNo').onclick = closeBattle;
$('fireBtn').onclick = fire;
$('battleClose').onclick = closeBattle;
$('attackBtn').onclick = openBattle;

// ======================================================================
//  FILLET STATION — drag the knife across the fish.
//  Every cut across the fish counts. A cut at the right speed is clean;
//  a cut that's too fast or too slow makes the fish bleed and lowers
//  what the fillet is worth.
// ======================================================================
const fc = $('filletCanvas'), fx = fc.getContext('2d');
const FW = fc.width, FH = fc.height;                 // 420 x 250
const FISH = { x: 210, y: 92, rx: 100, ry: 46 };
const METER = { x: 24, y: 212, w: 372, h: 16, max: 1600 };
// Three cut zones on the speed meter. Green pays the most, yellow less, red the least.
const GRADES = {
  green:  { pay: 1.0, color: '#2e9d52', emoji: '🟩' },
  yellow: { pay: 0.7, color: '#e9b91c', emoji: '🟨' },
  red:    { pay: 0.4, color: '#d2483f', emoji: '🟥' },
};
let fillet = null;
let stroke = null;
let liveSpeed = 0, shownSpeed = null;
let verdict = null;
let knifeAt = null;
let blood = [];          // dripping drops
let pools = [];          // stains on the board / fish

function zoneFor(sp) {                          // the green zone (same place as before)
  const half = 330 + G().knife.zone / 2;
  return [Math.max(40, sp.cut - half), sp.cut + half];
}
function yellowFor(sp) {                        // yellow band on both sides of green
  const [lo, hi] = zoneFor(sp), pad = 260 + G().knife.zone * 0.3;
  return [Math.max(0, lo - pad), hi + pad];
}
function gradeFor(sp, speed) {
  const [lo, hi] = zoneFor(sp), [ylo, yhi] = yellowFor(sp);
  return speed >= lo && speed <= hi ? 'green' : speed >= ylo && speed <= yhi ? 'yellow' : 'red';
}
function insideFish(p) {
  return ((p.x - FISH.x) / FISH.rx) ** 2 + ((p.y - FISH.y) / FISH.ry) ** 2 <= 1;
}
function speedWord(sp) {
  return sp.cut < 450 ? 'slow and gentle' : sp.cut < 700 ? 'at a steady speed' : sp.cut < 900 ? 'quickly' : 'very fast';
}

function openFillet() {
  if (lure.active) return;
  if (!S.bucket.some(f => !f.filleted)) { toast('No raw fish to fillet!'); return; }
  $('fillet').classList.remove('hidden');
  nextFilletFish();
  requestAnimationFrame(filletLoop);
}
function closeFillet() {
  $('fillet').classList.add('hidden');
  fillet = null; stroke = null;
  updateHud();
  if (S.bucket.length && S.bucket.every(f => f.filleted) && bucketFull()) toast('All filleted! Sail back to the dock to sell ⚓', 3000);
}
function nextFilletFish() {
  stroke = null; shownSpeed = null; blood = []; pools = [];
  const item = S.bucket.find(f => !f.filleted);
  if (!item) {
    fillet = { done: true, cuts: [] };
    $('filletFact').classList.add('hidden');
    $('filletInfo').textContent = '✨ All fish filleted! Take them to the market.';
    $('filletBar').style.width = '100%';
    return;
  }
  fillet = { item, sp: speciesById(item.id), chops: 0, cuts: [], done: false };
  $('filletFact').innerHTML = `<b>🐟 Did you know?</b> ${fillet.sp.fact}`;
  $('filletFact').classList.remove('hidden');
  const k = G().knife;
  const raw = S.bucket.filter(f => !f.filleted).length;
  $('filletInfo').textContent = `${fillet.sp.name}: ${k.chops} cut${k.chops > 1 ? 's' : ''}, cut it ${speedWord(fillet.sp)} (${raw} fish left)`;
  $('filletBar').style.width = '0%';
}

function fPoint(e) {
  const r = fc.getBoundingClientRect();
  return { x: (e.clientX - r.left) * FW / r.width, y: (e.clientY - r.top) * FH / r.height, t: performance.now() };
}
fc.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (!fillet || fillet.done || !fillet.sp) return;
  try { fc.setPointerCapture(e.pointerId); } catch (err) {}
  const p = fPoint(e);
  stroke = { pts: [p], inLen: 0, inTime: 0 };
  liveSpeed = 0; knifeAt = p;
});
fc.addEventListener('pointermove', e => {
  const p = fPoint(e);
  knifeAt = p;
  if (!stroke) return;
  const q = stroke.pts[stroke.pts.length - 1];
  const d = Math.hypot(p.x - q.x, p.y - q.y);
  const dt = Math.max(1, p.t - q.t) / 1000;
  if (insideFish({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 })) { stroke.inLen += d; stroke.inTime += dt; }
  stroke.pts.push(p);
  liveSpeed = liveSpeed * 0.65 + (d / dt) * 0.35;
});
fc.addEventListener('pointerup', endStroke);
fc.addEventListener('pointercancel', () => { stroke = null; });
fc.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !stroke) knifeAt = null; });

function say2(text, color) { verdict = { text, color, life: 1.5 }; }

function bleed(pts, amount = 14) {
  const inside = pts.filter(insideFish);
  const src = inside.length ? inside : pts;
  for (let i = 0; i < amount; i++) {
    const p = src[Math.floor(Math.random() * src.length)];
    blood.push({ x: p.x + rand(-4, 4), y: p.y + rand(-3, 3), vy: rand(10, 40), r: rand(2, 4.5), life: rand(1.5, 3) });
  }
  if (amount > 6) pools.push({ x: rand(FISH.x - 60, FISH.x + 60), y: FISH.y + FISH.ry + rand(4, 18), r: 0, max: rand(14, 26) });
}

function endStroke() {
  if (!stroke || !fillet || fillet.done) { stroke = null; return; }
  const s = stroke; stroke = null;
  if (s.inLen < 45) { say2('Drag the knife across the fish!', '#ffffff'); return; }
  const speed = s.inLen / Math.max(0.02, s.inTime);
  shownSpeed = speed;
  const grade = gradeFor(fillet.sp, speed);
  const slow = speed < zoneFor(fillet.sp)[0];
  fillet.cuts.push({ pts: s.pts, grade });
  fillet.chops++;
  if (grade === 'green') say2('🟩 Perfect cut!', '#9effa8');
  else if (grade === 'yellow') { bleed(s.pts, 4); say2(`🟨 Okay cut, a little ${slow ? 'slow' : 'fast'}`, '#ffe680'); }
  else { bleed(s.pts); say2(`🟥 Way too ${slow ? 'slow' : 'fast'}! It’s bleeding 🩸`, '#ff8f80'); }

  const k = G().knife;
  $('filletBar').style.width = `${(fillet.chops / k.chops) * 100}%`;
  if (fillet.chops < k.chops) return;

  const quality = Math.round(fillet.cuts.reduce((a, c) => a + GRADES[c.grade].pay, 0) / fillet.cuts.length * 100) / 100;
  const value = Math.round(fillet.sp.value * k.mult * quality);
  fillet.item.filleted = true;
  fillet.item.value = value;
  fillet.item.quality = quality;
  save();
  const marks = fillet.cuts.map(c => GRADES[c.grade].emoji).join('');
  $('filletInfo').textContent = quality < 1
    ? `${marks} ${fillet.sp.name} fillets (${Math.round(quality * 100)}% value): 🪙 ${fmt(value)}`
    : `${marks} Perfect ${fillet.sp.name} fillets: 🪙 ${fmt(value)}!`;
  fillet.done = true; fillet.showFillet = true;
  setTimeout(() => { if (!$('fillet').classList.contains('hidden')) nextFilletFish(); }, 1100);
}

function drawPath(pts) {
  fx.beginPath();
  pts.forEach((p, i) => i ? fx.lineTo(p.x, p.y) : fx.moveTo(p.x, p.y));
  fx.stroke();
}

function filletLoop() {
  if ($('fillet').classList.contains('hidden') || !fillet) return;
  fx.clearRect(0, 0, FW, FH);
  fx.strokeStyle = 'rgba(120,80,30,.25)'; fx.lineWidth = 1;
  for (let i = 0; i < 9; i++) { fx.beginPath(); fx.moveTo(0, 14 + i * 24); fx.bezierCurveTo(140, 4 + i * 24, 280, 24 + i * 24, 420, 12 + i * 24); fx.stroke(); }

  // blood pools on the board
  pools.forEach(p => {
    p.r = Math.min(p.max, p.r + 0.4);
    fx.fillStyle = 'rgba(150,15,15,.55)';
    fx.beginPath(); fx.ellipse(p.x, p.y, p.r * 1.6, p.r * 0.55, 0, 0, 7); fx.fill();
  });

  if (fillet.sp && !fillet.showFillet) {
    const sp = fillet.sp;
    const scale = Math.min(84 / sp.size, (sp.look.bill ? 64 : 84) / sp.size);
    fx.save(); fx.translate(FISH.x + (sp.look.bill ? -30 : 14), FISH.y); fx.scale(scale, scale);
    drawFish(fx, 0, 0, sp, 1, 0);
    fx.restore();
    fx.save();
    fx.beginPath(); fx.ellipse(FISH.x, FISH.y, FISH.rx, FISH.ry, 0, 0, 7); fx.clip();
    fx.lineCap = 'round';
    fillet.cuts.forEach(c => {
      if (c.grade === 'green') { fx.strokeStyle = '#a01f17'; fx.lineWidth = 3; }
      else if (c.grade === 'yellow') { fx.strokeStyle = 'rgba(190,25,20,.85)'; fx.lineWidth = 5; }
      else { fx.strokeStyle = 'rgba(200,20,20,.85)'; fx.lineWidth = 9; }
      drawPath(c.pts);
    });
    fx.restore();
  } else if (fillet.sp) {
    const q = fillet.item.quality || 1;
    fx.lineWidth = 2;
    [-1, 1].forEach(s => {
      fx.fillStyle = q < 1 ? '#e98a76' : '#f7a58c'; fx.strokeStyle = '#e07a5f';
      fx.beginPath(); fx.ellipse(210 + s * 72, FISH.y, 62, 28, s * 0.15, 0, 7); fx.fill(); fx.stroke();
      fx.strokeStyle = 'rgba(255,255,255,.6)';
      for (let i = -2; i <= 2; i++) { fx.beginPath(); fx.moveTo(210 + s * 72 + i * 16, FISH.y - 20); fx.lineTo(210 + s * 72 + i * 16 + 8, FISH.y + 20); fx.stroke(); }
      if (q < 1) {
        fx.fillStyle = 'rgba(150,10,10,.6)';
        for (let i = 0; i < Math.round((1 - q) * 20); i++) { fx.beginPath(); fx.arc(210 + s * 72 + rand(-40, 40), FISH.y + rand(-15, 15), rand(2, 5), 0, 7); fx.fill(); }
      }
    });
  } else {
    fx.font = '48px sans-serif'; fx.textAlign = 'center'; fx.fillText('🍣🍣🍣', 210, 110);
  }

  // dripping blood
  blood.forEach(b => {
    b.life -= 1 / 60; b.y += b.vy / 60; b.vy += 1.2;
    fx.fillStyle = `rgba(170,10,10,${clamp(b.life, 0, 1)})`;
    fx.beginPath(); fx.ellipse(b.x, b.y, b.r * 0.8, b.r * 1.2, 0, 0, 7); fx.fill();
  });
  blood = blood.filter(b => b.life > 0 && b.y < FH - 30);

  if (stroke && stroke.pts.length > 1) {
    fx.strokeStyle = 'rgba(255,255,255,.85)'; fx.lineWidth = 3; fx.lineCap = 'round';
    drawPath(stroke.pts.slice(-14));
  }
  if (knifeAt && fillet.sp && !fillet.done) {
    fx.save(); fx.translate(knifeAt.x, knifeAt.y); fx.rotate(-0.5);
    fx.fillStyle = '#dfe5ea'; fx.strokeStyle = '#8a959e'; fx.lineWidth = 1;
    fx.beginPath(); fx.moveTo(0, 0); fx.lineTo(8, -52); fx.lineTo(-4, -52); fx.closePath(); fx.fill(); fx.stroke();
    fx.fillStyle = '#5c3a1a'; fx.fillRect(-4, -76, 12, 24);
    fx.restore();
  }

  if (fillet.sp) {
    const [lo, hi] = zoneFor(fillet.sp), [ylo, yhi] = yellowFor(fillet.sp);
    const X = v => METER.x + clamp(v / METER.max, 0, 1) * METER.w;
    fx.fillStyle = GRADES.red.color;
    fx.fillRect(METER.x, METER.y, METER.w, METER.h);
    fx.fillStyle = GRADES.yellow.color;
    fx.fillRect(X(ylo), METER.y, X(yhi) - X(ylo), METER.h);
    fx.fillStyle = GRADES.green.color;
    fx.fillRect(X(lo), METER.y, X(hi) - X(lo), METER.h);
    fx.fillStyle = '#3d2610'; fx.font = 'bold 11px sans-serif';
    fx.textAlign = 'left'; fx.fillText('slow', METER.x, METER.y - 4);
    fx.textAlign = 'right'; fx.fillText('fast', METER.x + METER.w, METER.y - 4);
    fx.textAlign = 'center';
    const marks = (fillet.cuts || []).map(c => GRADES[c.grade].emoji).join(' ');
    fx.fillText(marks ? `knife speed · cuts so far: ${marks}` : 'knife speed: 🟩 most money · 🟨 less · 🟥 least', METER.x + METER.w / 2, METER.y + METER.h + 14);
    const v = stroke ? liveSpeed : shownSpeed;
    if (v != null) {
      const nx = X(v);
      fx.fillStyle = '#ffffff'; fx.strokeStyle = '#1b1b1b'; fx.lineWidth = 1.5;
      fx.beginPath(); fx.moveTo(nx, METER.y - 2); fx.lineTo(nx - 7, METER.y - 12); fx.lineTo(nx + 7, METER.y - 12); fx.closePath(); fx.fill(); fx.stroke();
      fx.fillRect(nx - 2, METER.y, 4, METER.h); fx.strokeRect(nx - 2, METER.y, 4, METER.h);
    }
  }

  if (verdict) {
    verdict.life -= 1 / 60;
    fx.globalAlpha = clamp(verdict.life * 2, 0, 1);
    fx.font = 'bold 20px sans-serif'; fx.textAlign = 'center';
    fx.fillStyle = 'rgba(0,0,0,.55)'; fx.fillText(verdict.text, 211, 31);
    fx.fillStyle = verdict.color; fx.fillText(verdict.text, 210, 30);
    fx.globalAlpha = 1;
    if (verdict.life <= 0) verdict = null;
  }
  requestAnimationFrame(filletLoop);
}
$('filletClose').onclick = closeFillet;

// ======================================================================
//  START
// ======================================================================
renderDock();
})();
