'use strict';
const MM = window.MM = window.MM || {};
MM.W = 1280; MM.H = 720;
MM.FLOOR = 660;               // aisle floor (feet line)
MM.LV = [600, 470, 340];      // shelf board tops (low, mid, high)
MM.TOP = 210;                 // top of shelf units (cat runway)
MM.STOOL_TOP = 528;
MM.UNIT_W = 440; MM.GAP = 120; MM.START_X = 300;
MM.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
MM.lerp = (a, b, t) => a + (b - a) * t;
MM.rand = (a, b) => a + Math.random() * (b - a);
MM.randi = (a, b) => Math.floor(MM.rand(a, b + 1));
MM.pick = a => a[Math.floor(Math.random() * a.length)];
MM.chance = p => Math.random() < p;
MM.fmtTime = s => { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60), r = s % 60; return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0'); };
MM.fmtNum = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
MM.fmtFt = n => MM.fmtNum(n) + ' Ft';
MM.rr = (c, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
MM.ell = (c, x, y, rx, ry, rot) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2); };
MM.mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
MM.debug = /[?&]debug=1/.test(location.search);
MM.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Products (spec table) + Ft prices for "Megmentett áru értéke"
MM.TYPES = {
  phone:      { name: 'Telefon',      diff: 'Könnyű',       pts: 10, price: 189990, w: 30,  h: 52, wt: 0.15, fragile: 0.18, small: true },
  headphones: { name: 'Fejhallgató',  diff: 'Könnyű',       pts: 15, price: 49990,  w: 50,  h: 48, wt: 0.22, fragile: 0.04, small: true },
  keyboard:   { name: 'Billentyűzet', diff: 'Közepes',      pts: 20, price: 24990,  w: 92,  h: 30, wt: 0.38, fragile: 0.12 },
  coffee:     { name: 'Kávéfőző',     diff: 'Közepes',      pts: 25, price: 89990,  w: 56,  h: 66, wt: 0.48, fragile: 0.22 },
  laptop:     { name: 'Laptop',       diff: 'Nehéz',        pts: 40, price: 349990, w: 84,  h: 58, wt: 0.68, fragile: 0.3 },
  tv:         { name: 'Televízió',    diff: 'Nagyon nehéz', pts: 60, price: 299990, w: 120, h: 82, wt: 0.95, fragile: 0.38 },
};
// shelf units: [low, mid, high] product per board
MM.UNITS = [
  { sign: 'TV & AUDIO',  boards: ['tv', 'headphones', 'phone'] },
  { sign: 'KONYHA',      boards: ['coffee', 'keyboard', 'laptop'] },
  { sign: 'LAPTOPOK',    boards: ['laptop', 'tv', 'headphones'] },
  { sign: 'GAMING',      boards: ['keyboard', 'phone', 'coffee'] },
  { sign: 'MOBIL',       boards: ['phone', 'laptop', 'tv'] },
  { sign: 'AKCIÓ -50%',  boards: ['coffee', 'headphones', 'keyboard'] },
];
MM.WORLD_W = MM.START_X + MM.UNITS.length * (MM.UNIT_W + MM.GAP) + 200;

// Cat knock interval by elapsed time (spec table)
MM.knockInterval = t => t < 30 ? 5 : t < 60 ? 3 : t < 120 ? 2 : t < 180 ? 1 : 0.5;

MM.BOSS_LINES = ['EZ ITT NEM MACSKAMENHELY!', 'MENNYIBE KERÜLT AZ A TÉVÉ?!', 'AZONNAL RAKD VISSZA!', 'KI ENGEDTE BE EZT A MACSKÁT?!',
  'MI EZ A KUPLERÁJ?!', 'LEVONOM A FIZETÉSEDBŐL!', 'MIÉRT VAN A LAPTOP A FÖLDÖN?!', 'A VEVŐK MINDENT LÁTNAK!',
  'GYORSABBAN, GYORSABBAN!', 'HÜLYE AZÉRT NEM VAGYOK!', 'EZ EGY ÁRUHÁZ, NEM ÁLLATKERT!', 'KÁVÉFŐZŐT A POLCRA, NEM A PADLÓRA!'];
MM.PLAYER_LINES = ['Jaj, ne!', 'Dagadék, NEEE!', 'Mindjárt, főnök!', 'Ezt nem hiszem el…', 'Rossz cica!', 'Hol a helye?!', 'Futás!'];
