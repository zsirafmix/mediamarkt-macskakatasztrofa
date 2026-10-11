'use strict';
MM.Game = (() => {
  const G = {}, A = MM.Audio, Art = MM.Art;
  let S = null;
  G.S = () => S;
  G.input = { left: false, right: false, jump: false, pick: false, place: false, sprint: false, down: false };
  const edge = { jump: false, pick: false, place: false };
  G.press = k => { edge[k] = true; };
  G.timeScale = 1; G.noEvents = false; G.freezeCats = false; G.bot = false;
  G.onGameOver = null; G.onHud = null;
  const STAGES = [25, 50, 75, 90];
  const STAGE_TXT = ['Nyugodt', 'Gyanakodva figyel', 'Idegesen telefonál', 'Üvöltözni kezd!', 'Vörös fejjel rohangál!!', 'KI VAGY RÚGVA!'];
  G.STAGE_TXT = STAGE_TXT;
  const lvY = l => l === 3 ? MM.TOP - 8 : MM.LV[l];

  // ---------- world ----------
  let units = [], slots = [], stools = [];
  function buildLayout() {
    units = []; slots = []; stools = [];
    MM.UNITS.forEach((u, i) => {
      const x = MM.START_X + i * (MM.UNIT_W + MM.GAP), unit = { i, x, sign: u.sign, slots: [] };
      u.boards.forEach((t, b) => {
        const T = MM.TYPES[t]; let n = Math.min(6, Math.floor((MM.UNIT_W - 20) / (T.w + 18)));
        const sp = MM.UNIT_W / n;
        for (let k = 0; k < n; k++) { const s = { id: slots.length, unit: i, board: b, type: t, x: Math.round(x + sp * (k + 0.5)), y: MM.LV[b], item: null, restock: 0, pop: 0 }; slots.push(s); unit.slots.push(s); }
      });
      units.push(unit);
      if (i < MM.UNITS.length - 1) stools.push({ x: x + MM.UNIT_W + MM.GAP / 2, y: MM.STOOL_TOP, w: 66 });
    });
    stools.push({ x: MM.START_X - 50, y: MM.STOOL_TOP, w: 60 });
  }
  G.layout = () => ({ units, slots, stools });
  const unitAt = x => { for (const u of units) if (x >= u.x - 6 && x <= u.x + MM.UNIT_W + 6) return u; return null; };
  let itemId = 0;
  function newItem(slot) { const T = MM.TYPES[slot.type]; const it = { id: itemId++, type: slot.type, T, slot, state: 'shelf', x: slot.x, y: slot.y, vx: 0, vy: 0, rot: 0, vr: 0, fellAt: 0, bounces: 0, dom: null, trip: 0 }; slot.item = it; S.items.push(it); return it; }

  // ---------- start ----------
  G.init = () => { buildLayout(); Art.buildBackground(); Art.buildWorld(units, stools); };
  G.start = (who, name) => {
    itemId = 0;
    S = {
      t: 0, who, name, score: 0, returned: 0, saved: 0, broken: 0, brokenValue: 0, combo: 0, bestCombo: 0, comboT: 0, caught: 0,
      anger: 0, stage: 0, items: [], bonuses: [], particles: [], popups: [], bubbles: [], fx: { coffee: 0, catnip: 0, cart: 0, vacation: 0 },
      banner: null, shake: 0, camX: 0, over: false, overT: 0, paused: false, spiteCD: 0, firstTv: true,
      next: { cameo: 22, inspect: 42, frenzy: 52, bonus: 14, alarm: 0, yell: 0, line: 6 },
      cameo: null, boss: null, log: { knocks: [], events: [], bonuses: [], spite: 0, domino: 0, frenzy: 0, inspect: 0, innocent: 0, wrong: 0, stumble: 0 },
      player: { x: 700, y: MM.FLOOR, vx: 0, vy: 0, dir: 1, onGround: true, carry: [], action: null, energy: 100, sprintLock: 0, stun: 0, phase: 0, mood: 'ok', cheer: 0, stumble: 0, time: 0, lastStep: 0 },
      cats: [], best: G.loadBest(),
    };
    for (const s of slots) { s.item = null; s.restock = 0; s.pop = 0; newItem(s); }
    S.cats.push(makeCat('Dagadék', 'dagadek', 1100));
    S.camX = MM.clamp(S.player.x - MM.W / 2, 0, MM.WORLD_W - MM.W);
    A.music(true); A.setIntensity(0);
    banner('MŰSZAK KEZDETE!', 'Dagadék már a polcon van…');
  };
  G.loadBest = () => { try { return JSON.parse(localStorage.getItem('mmkk_best')) || { score: 0, time: 0, returned: 0 }; } catch (e) { return { score: 0, time: 0, returned: 0 }; } };
  function makeCat(name, pal, x) { return { name, pal, x, lvl: 3, y: lvY(3), dir: -1, state: 'roam', st: 0, target: null, due: 0, phase: 0, paw: 0, tail: 0, hop: null, variant: 'paw', knocked: false, meowT: 0, time: 0, moving: false, run: false, frenzy: null, wait: 0, spawnY: 0 }; }

  // ---------- helpers ----------
  function popup(x, y, text, col = '#fff', size = 22, dur = 1.2) { S.popups.push({ x, y, text, col, size, t: 0, dur }); }
  function banner(text, sub = '', col = '#ffd400') { S.banner = { text, sub, t: 0, dur: 2.4, col }; A.sfx('banner'); }
  function bubble(who, text, dur = 2.2) { S.bubbles = S.bubbles.filter(b => b.who !== who); S.bubbles.push({ who, text, t: 0, dur }); }
  function particles(x, y, n, type, col, sp = 200) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = Math.random() * sp; S.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.5, life: 0, max: MM.rand(0.5, 1.1), type, col, size: MM.rand(3, 7), rot: Math.random() * 6, vr: MM.rand(-10, 10) }); } }
  const capacity = () => S.fx.cart > 0 ? 5 : 2;
  const floorItems = () => S.items.filter(i => i.state === 'floor' || i.state === 'fall');
  G.floorCount = () => S.items.reduce((n, i) => n + (i.state === 'floor' || i.state === 'fall' ? 1 : 0), 0);
  const comboReset = why => { if (S.combo >= 3) popup(S.player.x, S.player.y - 190, 'SOROZAT VÉGE', '#ff8a8a', 18); S.combo = 0; };

  function knock(it, dir, power = 1, reason = 'cat') {
    if (it.state !== 'shelf') return false;
    it.state = 'fall'; it.vx = dir * MM.rand(90, 210) * power; it.vy = -MM.rand(90, 230) * power; it.vr = dir * MM.rand(2, 6); it.fellAt = S.t; it.bounces = 0; it.dom = new Set(); it.y = it.slot.y; it.x = it.slot.x;
    A.sfx('swipe'); return true;
  }
  G._knock = knock;

  // ---------- player ----------
  function reachSlot(p, s) { const T = MM.TYPES[s.type], cy = s.y - T.h / 2; return Math.abs(s.x - p.x) < T.w / 2 + 46 && cy >= p.y - 238 && cy <= p.y + 10; }
  function nearHoriz(p, s) { return Math.abs(s.x - p.x) < MM.TYPES[s.type].w / 2 + 46; }
  function updatePlayer(dt) {
    const p = S.player, I = G.input; p.time += dt;
    if (S.over) { p.vx = 0; p.mood = 'scared'; p.action = null; gravityStep(p, dt); return; }
    if (p.stun > 0) { p.stun -= dt; p.stumble = Math.max(0, p.stumble - dt * 0.8); p.vx *= 0.9; gravityStep(p, dt); return; }
    p.stumble = 0;
    // actions
    if (p.action) {
      const a = p.action; a.t += dt; p.vx = 0;
      if (a.type === 'place' && !p.onGround) p.vy = 0; // clinging to shelf
      if (a.type === 'pick' && a.item.state !== 'floor' && a.item.state !== 'fall') p.action = null;
      else if (a.type === 'place' && (a.slot.item !== a.item || a.item.state !== 'carried')) p.action = null;
      else if (a.t >= a.dur) { if (a.type === 'pick') finishPick(a.item); else finishPlace(a.item); p.action = null; }
      gravityStep(p, dt); edge.jump = edge.pick = edge.place = false; return;
    }
    let mv = (I.right ? 1 : 0) - (I.left ? 1 : 0);
    const wsum = p.carry.reduce((s, i) => s + i.T.wt, 0);
    let spd = 330 * Math.max(0.55, 1 - wsum * 0.14) * (S.fx.coffee > 0 ? 1.45 : 1);
    let sprinting = I.sprint && mv !== 0 && p.energy > 0 && p.sprintLock <= 0;
    if (sprinting) { spd *= 1.6; p.energy -= 34 * dt; if (p.energy <= 0) { p.energy = 0; p.sprintLock = 1.2; popup(p.x, p.y - 180, 'Kifulladt!', '#9fd8ff', 18); } }
    else { p.sprintLock -= dt; p.energy = Math.min(100, p.energy + 17 * dt); }
    p.sprint = sprinting;
    if (mv) p.dir = mv;
    const tv = mv * spd; p.vx += MM.clamp(tv - p.vx, -2600 * dt, 2600 * dt);
    if (edge.jump && p.onGround) { p.vy = -840; p.onGround = false; A.sfx('jump'); }
    if (I.down && p.onGround && p.y < MM.FLOOR - 1) { p.y += 4; p.onGround = false; p.dropT = 0.2; }
    gravityStep(p, dt);
    const moving = Math.abs(p.vx) > 20; p.moving = moving;
    if (moving) { p.phase += dt * Math.abs(p.vx) / 26; if (p.onGround && p.phase - p.lastStep > Math.PI) { p.lastStep = p.phase; A.sfx('step'); } }
    // stumble over floor items while sprinting
    if (sprinting && p.onGround && p.y >= MM.FLOOR - 1 && Math.abs(p.vx) > 380) {
      for (const it of S.items) if (it.state === 'floor' && it.trip <= 0 && Math.abs(it.x - p.x) < it.T.w / 2 + 4) {
        it.trip = 1.5; if (MM.chance(0.45)) { p.stun = 0.75; p.stumble = 0.9; p.vx *= 0.3; it.vx = p.dir * 260; S.log.stumble++; A.sfx('stumble'); popup(p.x, p.y - 170, 'HOPPÁ!', '#ffd400', 24); bubble('player', MM.pick(['Aúúú!', 'Ki tette ezt ide?!', 'Hoppá!'])); particles(p.x, p.y - 10, 8, 'dust', '#ccc', 120); break; }
      }
    }
    // pickup
    if (edge.pick) tryPick();
    if (edge.place) tryPlace();
    // auto-catch falling items
    if (p.carry.length < capacity()) for (const it of S.items) {
      if (it.state === 'fall' && it.vy > 0 && Math.abs(it.x - p.x) < it.T.w / 2 + 22 && it.y > p.y - 150 && it.y < p.y - 40) {
        it.state = 'carried'; p.carry.push(it); S.caught++; S.score += 15; A.sfx('catch'); popup(p.x, p.y - 200, 'ELKAPTAD! +15', '#7dff9a', 22); particles(it.x, it.y, 8, 'spark', '#fff6a0', 150);
        if (p.carry.length >= capacity()) break;
      }
    }
    edge.jump = edge.pick = edge.place = false;
    // mood
    const fc = G.floorCount();
    p.mood = p.cheer > 0 ? 'cheer' : S.anger > 75 ? 'panic' : S.anger > 45 || fc > 6 ? 'worried' : 'ok';
    p.sweat = S.anger > 30 ? (S.anger - 30) / 70 : (p.sprint ? 0.3 : 0);
    p.panic = S.anger > 75; p.cheer = Math.max(0, p.cheer - dt);
  }
  function gravityStep(p, dt) {
    const prevY = p.y; p.vy += 2200 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.dropT = (p.dropT || 0) - dt;
    p.x = MM.clamp(p.x, 90, MM.WORLD_W - 60); p.onGround = false;
    if (p.vy >= 0 && p.dropT <= 0) for (const s of stools) if (prevY <= s.y + 1 && p.y >= s.y && Math.abs(p.x - s.x) < s.w / 2 + 8) { p.y = s.y; p.vy = 0; p.onGround = true; }
    if (p.y >= MM.FLOOR) { p.y = MM.FLOOR; p.vy = 0; p.onGround = true; }
  }
  function tryPick() {
    const p = S.player; let best = null, bd = 1e9;
    for (const it of S.items) if ((it.state === 'floor' || it.state === 'fall') && Math.abs(it.x - p.x) < it.T.w / 2 + 50 && it.y > p.y - 175 && it.y - it.T.h < p.y + 10) { const d = Math.abs(it.x - p.x) + Math.abs(it.y - p.y) * 0.3; if (d < bd) { bd = d; best = it; } }
    if (!best) { popup(p.x, p.y - 170, 'Nincs itt semmi', '#ddd', 16, 0.8); return false; }
    if (p.carry.length >= capacity()) { popup(p.x, p.y - 170, 'Tele a kezed! (' + capacity() + ')', '#ff9a9a', 18); A.sfx('wrong'); return false; }
    if (best.state === 'fall') { best.state = 'carried'; p.carry.push(best); A.sfx('catch'); return true; }
    p.action = { type: 'pick', item: best, t: 0, dur: Math.max(0.12, best.T.wt * (S.fx.cart > 0 ? 0.8 : 1)) }; p.dir = best.x >= p.x ? 1 : -1;
    return true;
  }
  function finishPick(it) { const p = S.player; it.state = 'carried'; p.carry.push(it); A.sfx('pick'); }
  function tryPlace() {
    const p = S.player;
    if (!p.carry.length) { popup(p.x, p.y - 170, 'Üres a kezed', '#ddd', 16, 0.8); return false; }
    const ok = p.carry.find(it => reachSlot(p, it.slot));
    if (ok) { p.action = { type: 'place', item: ok, slot: ok.slot, t: 0, dur: Math.max(0.12, ok.T.wt * 0.9 * (S.fx.cart > 0 ? 0.8 : 1)), from: [p.x, p.y - 150] }; p.dir = ok.slot.x >= p.x ? 1 : -1; return true; }
    const wrong = slots.find(s => s.item && s.item.state !== 'shelf' && reachSlot(p, s));
    if (wrong) { S.log.wrong++; A.sfx('wrong'); popup(p.x, p.y - 180, 'Ez nem az ő helye!', '#ff6a6a', 22); comboReset('wrong'); bubble('player', 'Hoppá, rossz polc…', 1.4); return false; }
    const high = p.carry.find(it => nearHoriz(p, it.slot));
    if (high) { popup(p.x, p.y - 180, 'Túl magasan! Ugorj (W) vagy lépj a lépcsőre!', '#ffd400', 17, 1.4); return false; }
    popup(p.x, p.y - 180, 'Kövesd a nyilat! →', '#ffd400', 18, 1); return false;
  }
  function finishPlace(it) { const p = S.player; p.carry.splice(p.carry.indexOf(it), 1); onReturn(it, false); }
  function onReturn(it, auto) {
    const s = it.slot; it.state = 'shelf'; it.x = s.x; it.y = s.y; it.rot = 0; s.pop = 0.25;
    S.returned++; S.saved += it.T.price;
    let pts = it.T.pts, txt;
    if (auto) { pts = Math.round(pts / 2); txt = '+' + pts; }
    else {
      S.combo++; S.comboT = 12; S.bestCombo = Math.max(S.bestCombo, S.combo);
      const mult = 1 + Math.min(S.combo - 1, 10) * 0.1; pts = Math.round(pts * mult);
      const quick = S.t - it.fellAt < 6; if (quick) { pts = Math.round(pts * 1.5); }
      txt = '+' + pts + (quick ? ' GYORS!' : '') + (S.combo > 1 ? '  x' + S.combo : '');
      if (S.combo > 0 && S.combo % 5 === 0) { S.player.cheer = 1.2; A.sfx('combo', 1 + S.combo / 40); popup(S.player.x, S.player.y - 230, S.combo + ' HIBÁTLAN SOROZAT!', '#7dff9a', 26, 1.6); S.score += S.combo * 10; }
    }
    S.score += pts; S.anger = Math.max(0, S.anger - (3 + it.T.wt * 3.5));
    A.sfx('place'); A.sfx('coin'); popup(s.x, s.y - it.T.h - 10, txt, '#ffe066', 22); particles(s.x, s.y - it.T.h / 2, 10, 'spark', '#fff6a0', 160);
    if (!auto) maybeSpite(it);
  }
  // THE running gag: you put the TV back, Dagadék walks over, stares, and knocks it down again
  function maybeSpite(it) {
    if (S.over || S.spiteCD > 0 || S.t < 12) return;
    const cand = S.cats.filter(c => ['roam', 'wait'].includes(c.state)); if (!cand.length) return;
    let pr = it.type === 'tv' ? (S.firstTv ? 1 : 0.38) : it.type === 'laptop' ? 0.2 : 0.04;
    if (!MM.chance(pr)) return;
    if (it.type === 'tv') S.firstTv = false;
    cand.sort((a, b) => Math.abs(a.x - it.x) - Math.abs(b.x - it.x));
    const c = cand[0]; c.state = 'stare'; c.st = 0; c.target = it.slot; c.stareStarted = false; S.spiteCD = 16; S.log.spite++;
  }
  G._spite = (slotId) => { const it = slots[slotId].item; S.spiteCD = 0; S.t = Math.max(S.t, 13); const c = S.cats[0]; c.state = 'stare'; c.st = 0; c.target = it.slot; c.stareStarted = false; S.log.spite++; };

  // ---------- items ----------
  function updateItems(dt) {
    for (const s of slots) {
      if (s.pop > 0) s.pop -= dt;
      if (s.restock > 0) { s.restock -= dt; if (s.restock <= 0) { const it = newItem(s); s.pop = 0.4; popup(s.x, s.y - it.T.h - 6, 'Új áru!', '#9fd8ff', 15, 1); } }
    }
    for (const it of S.items) {
      if (it.trip > 0) it.trip -= dt;
      if (it.state === 'auto') { it.at += dt / 0.9; const k = Math.min(1, it.at); it.x = MM.lerp(it.ax, it.slot.x, k); it.y = MM.lerp(it.ay, it.slot.y, k) - Math.sin(k * Math.PI) * 120; it.rot = (1 - k) * 6; if (k >= 1) onReturn(it, true); continue; }
      if (it.state !== 'fall' && it.state !== 'floor') continue;
      if (it.state === 'fall') {
        it.vy += 1900 * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
        // DOMINO: falling product clips another product on a lower shelf
        for (const s of slots) { const o = s.item; if (!o || o === it || o.state !== 'shelf' || s.y <= it.slot.y - 1 || it.dom.has(o.id)) continue;
          if (Math.abs(it.x - s.x) < (it.T.w + o.T.w) * 0.36 && it.y > s.y - o.T.h && it.y - it.T.h < s.y) { it.dom.add(o.id);
            if (MM.chance(0.22)) { knock(o, Math.sign(it.vx) || 1, 0.8, 'domino'); S.log.domino++; popup(s.x, s.y - o.T.h - 10, 'DOMINÓ!', '#ff9f43', 22); S.shake = Math.max(S.shake, 4); } } }
        if (it.y >= MM.FLOOR) {
          const imp = it.vy; it.y = MM.FLOOR;
          if (it.bounces === 0) {
            S.shake = Math.max(S.shake, 2 + it.T.wt * 6); particles(it.x, MM.FLOOR - 4, 6, 'dust', '#ddd', 90);
            if (imp > 540 && MM.chance(it.T.fragile * 0.7)) { breakItem(it); continue; }
            A.sfx(it.T.small ? 'clatter' : 'thud', 0.6 + it.T.wt * 0.6);
            if (MM.chance(0.08) && Math.abs(it.x - S.player.x) < 500) bubble('player', MM.pick(MM.PLAYER_LINES), 1.4);
          }
          if (imp > 160) { it.vy = -imp * 0.32; it.vr *= 0.5; it.bounces++; }
          else { it.vy = 0; it.state = 'floor'; }
        }
      } else { // floor: slide with friction, settle rotation
        it.x += it.vx * dt; it.vx *= Math.max(0, 1 - 3.5 * dt); if (Math.abs(it.vx) < 4) it.vx = 0;
        it.rot += (Math.round(it.rot / (Math.PI / 2)) * (Math.PI / 2) - it.rot) * Math.min(1, dt * 10);
        if (Math.abs(it.vx) > 60) for (const o of S.items) if (o !== it && o.state === 'floor' && Math.abs(o.x - it.x) < (o.T.w + it.T.w) * 0.45 && Math.sign(o.x - it.x) === Math.sign(it.vx)) { o.vx += it.vx * 0.6; it.vx *= 0.4; A.sfx('clatter'); }
      }
      if (it.x < 80) { it.x = 80; it.vx = Math.abs(it.vx) * 0.5; } if (it.x > MM.WORLD_W - 40) { it.x = MM.WORLD_W - 40; it.vx = -Math.abs(it.vx) * 0.5; }
    }
    if (S.items.length > 400) S.items = S.items.filter(i => i.state !== 'gone');
  }
  function breakItem(it) {
    it.state = 'gone'; it.slot.restock = 9; S.broken++; S.brokenValue += it.T.price;
    S.anger = Math.min(100, S.anger + (S.fx.vacation > 0 ? 0 : 6 + it.T.wt * 4)); comboReset('broken');
    A.sfx('crash'); S.shake = Math.max(S.shake, 10);
    particles(it.x, MM.FLOOR - 10, 18, 'shard', it.type === 'tv' || it.type === 'laptop' ? '#7fc8ff' : '#ccc', 260);
    popup(it.x, MM.FLOOR - 70, 'TÖRÖTT! -' + MM.fmtFt(it.T.price), '#ff4d4d', 22, 1.5);
    if (MM.chance(0.6)) bubble('boss', MM.pick(['MENNYIBE KERÜLT AZ A TÉVÉ?!', 'EZT LEVONOM A FIZETÉSEDBŐL!', 'MI TÖRT EL MEGINT?!']), 2);
  }
  G._break = breakItem;

  // ---------- cats ----------
  function catSpeed() { return Math.min(S.t > 180 ? 680 : 560, 150 + S.t * 1.7); }
  function chooseTarget(c) {
    const taken = new Set(S.cats.filter(o => o !== c && o.target).map(o => o.target.id));
    const cands = [];
    const fast = MM.knockInterval(S.t) <= 1, nearPlayer = !fast && MM.chance(0.25);
    for (const s of slots) { if (!s.item || s.item.state !== 'shelf' || taken.has(s.id)) continue;
      let d = Math.abs(s.x - c.x) + (unitAt(c.x) && unitAt(c.x).i === s.unit ? 0 : 160) + Math.abs((c.lvl === 3 ? 3 : c.lvl) - s.board) * 30;
      if (nearPlayer) d = Math.abs(s.x - S.player.x) * 0.7 + d * 0.3;
      cands.push([d, s]); }
    if (!cands.length) return null;
    cands.sort((a, b) => a[0] - b[0]);
    return cands[Math.floor(Math.random() * Math.min(fast ? 2 : 4, cands.length))][1];
  }
  function standX(c, s) { const u = units[s.unit], T = MM.TYPES[s.type]; const side = c.x <= s.x ? -1 : 1; return MM.clamp(s.x + side * (T.w / 2 + 24), u.x + 16, u.x + MM.UNIT_W - 16); }
  // returns true when arrived
  function catMove(c, tx, tl, spd, dt) {
    c.moving = false;
    if (c.hop) { const h = c.hop; h.t += dt / h.dur; const k = Math.min(1, h.t); c.y = MM.lerp(h.y0, h.y1, k) - Math.sin(k * Math.PI) * 34; if (k >= 1) { c.lvl = h.to; c.y = lvY(h.to); c.hop = null; } return false; }
    const here = unitAt(c.x), tu = unitAt(tx);
    const same = here && tu && here.i === tu.i;
    if (c.lvl !== tl || (!same && c.lvl !== 3)) {
      if (same) { startHop(c, tl, spd); return false; }
      if (c.lvl !== 3) { startHop(c, 3, spd); return false; }
    }
    const dx = tx - c.x;
    if (Math.abs(dx) < 3 && c.lvl === tl) { c.x = tx; c.y = lvY(c.lvl); return true; }
    c.dir = Math.sign(dx) || c.dir; const step = Math.min(Math.abs(dx), spd * dt) * Math.sign(dx);
    let nx = c.x + step;
    if (c.lvl !== 3) { const u = here || tu; if (u) nx = MM.clamp(nx, u.x + 12, u.x + MM.UNIT_W - 12); }
    c.x = nx; c.moving = true; c.phase += dt * spd / 14;
    c.y = lvY(c.lvl);
    if (c.lvl === 3 && !unitAt(c.x)) { // leap across the aisle gap
      let gl = null; for (const u of units) if (c.x > u.x + MM.UNIT_W && c.x < u.x + MM.UNIT_W + MM.GAP) gl = u.x + MM.UNIT_W;
      if (gl !== null) { const f = (c.x - gl) / MM.GAP; c.y = lvY(3) - Math.sin(f * Math.PI) * 46; c.leap = true; } else { c.x = MM.clamp(c.x, units[0].x, units[units.length - 1].x + MM.UNIT_W); }
    } else c.leap = false;
    return false;
  }
  function startHop(c, to, spd) { c.hop = { y0: c.y, y1: lvY(to), to, t: 0, dur: MM.clamp(0.42 * 200 / spd, 0.16, 0.42) }; }
  function bossVisible() { return (S.cameo && S.cameo.t < S.cameo.dur) || (S.boss && S.boss.mode === 'inspect'); }
  function updateCat(c, dt) {
    c.time += dt; c.st += dt; c.meowT -= dt; if (c.paw > 0 && c.state !== 'swipe' && c.state !== 'stare' && c.state !== 'frenzy' && c.state !== 'finale') c.paw = Math.max(0, c.paw - dt * 4);
    if (c.tail > 0 && c.state !== 'swipe') c.tail = Math.max(0, c.tail - dt * 4);
    if (c.spawnY > 0) { c.spawnY = Math.max(0, c.spawnY - dt * 500); }
    if (G.freezeCats) return;
    const iv = MM.knockInterval(S.t);
    if (S.over) { finaleCat(c, dt); return; }
    // interrupts
    if (S.fx.catnip > 0) { if (c.state !== 'catnip') { c.state = 'catnip'; c.st = 0; c.hop = null; c.y = lvY(c.lvl); A.sfx('purr'); } return; }
    if (bossVisible() && c.state !== 'frenzy') { if (c.state !== 'innocent') { c.prev = c.state === 'stare' ? 'stare' : 'roam'; c.state = 'innocent'; c.st = 0; c.hop = null; c.y = lvY(c.lvl); S.log.innocent++; } return; }
    if (c.state === 'catnip' || c.state === 'innocent') { c.state = c.prev === 'stare' && c.target ? 'stare' : 'roam'; c.st = 0; c.stareStarted = false; }
    if (['roam', 'wait', 'swipe'].includes(c.state)) c.due = Math.min(c.due + dt, iv * 3);
    const spd = catSpeed();
    switch (c.state) {
      case 'roam': {
        if (!c.target || !c.target.item || c.target.item.state !== 'shelf') c.target = chooseTarget(c);
        if (!c.target) { catMove(c, MM.clamp(S.player.x + Math.sin(c.time) * 300, units[0].x, MM.WORLD_W - 300), 3, spd * 0.5, dt); break; }
        const s = c.target, urgent = c.due >= iv;
        if (catMove(c, standX(c, s), s.board, spd * (urgent ? 1.5 : 0.9), dt)) { c.dir = Math.sign(s.x - c.x) || 1; c.state = 'wait'; c.st = 0; }
        break; }
      case 'wait': {
        const s = c.target; if (!s || !s.item || s.item.state !== 'shelf') { c.state = 'roam'; c.target = null; break; }
        c.dir = Math.sign(s.x - c.x) || c.dir;
        if (c.due >= iv) {
          c.state = 'swipe'; c.st = 0; c.knocked = false;
          const T = MM.TYPES[s.type];
          c.variant = (S.t > 35 && MM.chance(0.16)) ? 'multi' : T.small && MM.chance(0.6) ? 'tail' : 'paw';
          c.swDur = MM.clamp(iv * 0.45, 0.16, 0.5) * (c.variant === 'multi' ? 1.6 : 1);
          if (c.variant === 'tail') c.dir = -c.dir;
        }
        break; }
      case 'swipe': {
        const s = c.target, k = c.st / c.swDur;
        if (c.variant === 'tail') c.tail = Math.sin(Math.min(1, k) * Math.PI); else c.paw = Math.sin(Math.min(1, k) * Math.PI) * (c.variant === 'multi' ? 1 : 0.9);
        if (c.variant === 'multi') c.x += c.dir * spd * 0.25 * dt;
        if (!c.knocked && k >= 0.5) {
          c.knocked = true; const dir = c.variant === 'tail' ? -c.dir : c.dir; let n = 0;
          if (s && s.item && knock(s.item, dir)) n++;
          if (c.variant === 'multi') { const nb = slots.filter(o => o.unit === s.unit && o.board === s.board && o !== s && Math.abs(o.x - s.x) < 230 && o.item && o.item.state === 'shelf').sort((a, b) => Math.abs(a.x - s.x) - Math.abs(b.x - s.x)).slice(0, 2);
            nb.forEach(o => { if (knock(o.item, dir, 1.1)) n++; }); if (n > 1) popup(c.x, c.y - 70, 'TAROLÁS!', '#ff9f43', 22); }
          S.log.knocks.push({ t: +S.t.toFixed(2), n, v: c.variant, cat: c.name });
          c.due -= iv; if (c.meowT <= 0 && MM.chance(0.3)) { A.sfx('meow', c.pal === 'barat' ? 1.25 : 1); c.meowT = 3; }
        }
        if (k >= 1) { c.state = 'roam'; c.target = null; c.paw = 0; c.tail = 0; if (c.variant === 'tail') c.dir = -c.dir; }
        break; }
      case 'stare': {
        const s = c.target; if (!s || !s.item || s.item.state !== 'shelf') { c.state = 'roam'; c.target = null; c.paw = 0; break; }
        if (!c.stareStarted) { if (catMove(c, standX(c, s), s.board, spd * 1.2, dt)) { c.stareStarted = true; c.st = 0; A.sfx('stare'); popup(c.x, c.y - 90, '…', '#fff', 30, 1.4); bubble('cat', 'Dagadék a szemedbe néz…', 2.6); S.stareFx = 1; } break; }
        c.dir = Math.sign(s.x - c.x) || c.dir;
        if (c.st < 1.6) c.paw = 0; else if (c.st < 3.0) c.paw = (c.st - 1.6) / 1.4 * 0.55; else if (c.st < 3.25) c.paw = 0.55 + (c.st - 3.0) * 2;
        else if (!c.knocked2) { c.knocked2 = true; knock(s.item, c.dir, 1.2); A.sfx('meow', 0.9); popup(c.x, c.y - 90, 'MIAU >:3', '#ffd400', 22); }
        if (c.st > 3.6) { c.state = 'roam'; c.target = null; c.knocked2 = false; c.paw = 0; S.stareFx = 0; }
        break; }
      case 'frenzy': {
        const f = c.frenzy, u = units[f.unit];
        if (f.phase === 0) { if (catMove(c, u.x + 14, f.board, spd * 1.5, dt)) { f.phase = 1; banner('MACSKAŐRÜLET!', c.name + ' végigsöpör egy teljes polcot!', '#ff6b6b'); A.sfx('meow', 1.2); } break; }
        c.paw = 0.75; const arrived = catMove(c, u.x + MM.UNIT_W - 14, f.board, Math.max(480, spd * 1.6), dt);
        for (const s of u.slots) if (s.board === f.board && s.item && s.item.state === 'shelf' && Math.abs(s.x - c.x) < 22) { knock(s.item, 1, 1.15); f.n++; }
        if (MM.chance(dt * 8)) particles(c.x - 30, c.y - 10, 1, 'dust', '#eee', 60);
        if (arrived) { c.state = 'roam'; c.target = null; c.paw = 0; popup(c.x, c.y - 90, f.n + ' termék a földön!', '#ff6b6b', 20); }
        break; }
    }
  }
  function finaleCat(c, dt) {
    // calm cat sits on the shelf and knocks one last product
    if (c.state !== 'finale') { c.state = 'finale'; c.st = 0; c.hop = null; c.y = lvY(c.lvl); c.target = null; c.paw = 0;
      let best = null, bd = 1e9; for (const s of slots) if (s.item && s.item.state === 'shelf') { const d = Math.abs(s.x - S.player.x) + (s.board === 2 ? 0 : 60); if (d < bd) { bd = d; best = s; } } c.target = best; c.fin = 0; }
    const s = c.target; if (!s || c !== S.cats[0]) { c.moving = false; return; }
    if (c.fin === 0) { if (catMove(c, standX(c, s), s.board, 600, dt)) { c.fin = 1; c.st = 0; } return; }
    c.dir = Math.sign(s.x - c.x) || 1;
    if (c.fin === 1 && S.overT > 2.6) { c.paw = Math.min(1, c.paw + dt * 5); if (c.paw >= 0.9 && s.item && s.item.state === 'shelf') { knock(s.item, c.dir, 0.8); c.fin = 2; S.log.finalKnock = true; } }
    if (c.fin === 2) c.paw = Math.max(0, c.paw - dt * 3);
  }

  // ---------- events ----------
  function startFrenzy() {
    const c = S.cats.find(c => ['roam', 'wait'].includes(c.state)); if (!c) return false;
    let best = null, bn = 0;
    for (const u of units) for (let b = 0; b < 3; b++) { const n = u.slots.filter(s => s.board === b && s.item && s.item.state === 'shelf').length; const score = n - Math.abs(u.x + MM.UNIT_W / 2 - S.player.x) / 900 + Math.random(); if (n >= 2 && score > bn) { bn = score; best = [u.i, b]; } }
    if (!best) return false;
    c.state = 'frenzy'; c.frenzy = { unit: best[0], board: best[1], phase: 0, n: 0 }; c.target = null; S.log.frenzy++; S.log.events.push(['frenzy', S.t]); return true;
  }
  function startInspection() {
    if (S.boss) return false; const p = S.player, fromLeft = p.x - S.camX > MM.W / 2;
    S.boss = { mode: 'inspect', sub: 'enter', x: fromLeft ? S.camX - 80 : S.camX + MM.W + 80, dir: fromLeft ? 1 : -1, t: 0, phase: 0, mood: 'sus', moving: true };
    S.boss.tx = p.x - S.boss.dir * 230; banner('FŐNÖKI ELLENŐRZÉS!', 'Gyorsan, rakj rendet!', '#ffb703'); S.log.inspect++; S.log.events.push(['inspect', S.t]); return true;
  }
  function startCameo() {
    // boss peeks from behind the shelves in the nearest aisle gap
    let gx = null, bd = 1e9; for (const u of units) { const g = u.x + MM.UNIT_W + MM.GAP / 2; const d = Math.abs(g - (S.camX + MM.W / 2)); if (g < MM.WORLD_W - 200 && d < bd) { bd = d; gx = g; } }
    S.cameo = { x: gx, t: 0, dur: 3.4 }; bubble('bossCameo', MM.pick(['Hmm…', 'Mi folyik itt?', 'Figyellek!', 'Minden rendben?']), 2.4); S.log.events.push(['cameo', S.t]);
  }
  function spawnBonus(type, x) {
    const types = ['coffee', 'catnip', 'cart', 'vacation', 'robot'], rnd = x == null;
    type = type || MM.pick(types.filter(t => !(S.fx[t] > 0)));
    if (rnd) x = MM.clamp(S.camX + MM.rand(160, MM.W - 160), 120, MM.WORLD_W - 120);
    const onStool = rnd && stools.find(s => Math.abs(s.x - x) < 200 && MM.chance(0.3));
    const b = { type, x: onStool ? onStool.x : x, y: (onStool ? onStool.y : MM.FLOOR) - 34, t: 0, life: 13 }; S.bonuses.push(b); return b;
  }
  G.BONUS_NAMES = { coffee: 'Kávészünet', catnip: 'Macskamenta', cart: 'Takarítókocsi', vacation: 'Főnök szabadságon', robot: 'Automata polcrendező' };
  function applyBonus(type) {
    const nm = G.BONUS_NAMES[type]; A.sfx('bonus'); S.log.bonuses.push([type, +S.t.toFixed(1)]);
    switch (type) {
      case 'coffee': S.fx.coffee = 10; banner('KÁVÉSZÜNET!', '10 mp-ig gyorsabban rohansz', '#c8a27a'); break;
      case 'catnip': S.fx.catnip = 5; banner('MACSKAMENTA!', 'Dagadék 5 mp-ig csak játszik', '#7ddf6a'); break;
      case 'cart': S.fx.cart = 20; banner('TAKARÍTÓKOCSI!', 'Egyszerre 5 terméket vihetsz (20 mp)', '#9fd8ff'); break;
      case 'vacation': S.fx.vacation = 15; banner('FŐNÖK SZABADSÁGON!', '15 mp-ig nem nő a düh', '#ffd400'); bubble('boss', 'Viszlát, Mallorca!', 2); break;
      case 'robot': { const fl = floorItems().filter(i => i.state === 'floor').sort((a, b) => b.T.price - a.T.price).slice(0, MM.randi(3, 5));
        fl.forEach(i => { i.state = 'auto'; i.at = 0; i.ax = i.x; i.ay = i.y; }); A.sfx('robot'); banner('AUTOMATA POLCRENDEZŐ!', fl.length + ' termék magától visszakerül', '#b8c4d0'); break; }
    }
    void nm;
  }
  function updateEvents(dt) {
    const N = S.next;
    for (const k in S.fx) if (S.fx[k] > 0) S.fx[k] = Math.max(0, S.fx[k] - dt);
    S.spiteCD -= dt;
    // second cat at 5:00
    if (S.t >= 300 && S.cats.length < 2) { const c = makeCat('Dagadék barátja', 'barat', MM.clamp(S.player.x + 400, units[0].x + 40, units[units.length - 1].x + 300)); c.spawnY = 400; S.cats.push(c); banner('MÉG EGY MACSKA?!', 'Megérkezett Dagadék barátja!', '#ff9f43'); A.sfx('meow', 1.3); S.log.events.push(['secondCat', S.t]); }
    // bonuses
    for (const b of S.bonuses) { b.t += dt; const p = S.player; if (Math.abs(b.x - p.x) < 40 && b.y > p.y - 150 && b.y < p.y + 10) { b.t = 1e9; applyBonus(b.type); } }
    S.bonuses = S.bonuses.filter(b => b.t < b.life);
    if (G.noEvents) return;
    if (S.t >= N.bonus) { spawnBonus(); N.bonus = S.t + MM.rand(17, 27); }
    if (S.t >= N.cameo) { if (!S.boss) startCameo(); N.cameo = S.t + MM.rand(20, 32); }
    if (S.t >= N.inspect) { startInspection(); N.inspect = S.t + MM.rand(45, 65); }
    if (S.t >= N.frenzy) { startFrenzy(); N.frenzy = S.t + MM.rand(35, 55) * (S.t > 180 ? 0.8 : 1); }
  }
  G.trigger = name => {
    if (name === 'frenzy') return startFrenzy();
    if (name === 'inspect') return startInspection();
    if (name === 'cameo') return startCameo();
    if (name === 'secondCat') { S.t = Math.max(S.t, 300); return true; }
    return false;
  };
  G.spawnBonus = (type, atPlayer) => spawnBonus(type, atPlayer ? S.player.x : null);
  function updateBoss(dt) {
    if (S.cameo) { S.cameo.t += dt; if (S.cameo.t > S.cameo.dur + 0.5) S.cameo = null; }
    const b = S.boss; if (!b) return; b.t += dt;
    const walk = (tx, sp) => { const dx = tx - b.x; if (Math.abs(dx) < 4) { b.moving = false; return true; } b.dir = Math.sign(dx); b.x += Math.sign(dx) * Math.min(Math.abs(dx), sp * dt); b.moving = true; b.phase += dt * sp / 24; return false; };
    if (b.mode === 'inspect') {
      if (b.sub === 'enter') { b.mood = 'sus'; if (walk(b.tx, 230)) { b.sub = 'look'; b.t = 0; } }
      else if (b.sub === 'look') { b.dir = Math.sin(b.t * 2.2) > 0 ? 1 : -1; if (b.t > 2.4) { b.sub = 'verdict'; b.t = 0; const n = G.floorCount();
        if (n > 3) { const add = S.fx.vacation > 0 ? 0 : 12 + Math.min(n, 15) * 0.8; S.anger = Math.min(100, S.anger + add); b.mood = 'yell'; bubble('boss', MM.pick(['EZ ITT NEM MACSKAMENHELY!', 'AZONNAL RAKD VISSZA!', 'MI EZ A KUPLERÁJ?!']), 2.4); A.sfx('yell'); S.shake = 8; popup(b.x, MM.FLOOR - 200, 'ELLENŐRZÉS: MEGBUKTÁL! +' + Math.round(add) + '% düh', '#ff4d4d', 24, 2); S.log.inspectFail = (S.log.inspectFail || 0) + 1; }
        else { S.anger = Math.max(0, S.anger - 5); b.mood = 'calm'; bubble('boss', 'Hmm… rendben van. Egyelőre.', 2.2); popup(b.x, MM.FLOOR - 200, 'ELLENŐRZÉS: RENDBEN! -5% düh', '#7dff9a', 24, 2); S.score += 50; S.log.inspectPass = (S.log.inspectPass || 0) + 1; } } }
      else if (b.sub === 'verdict') { if (b.t > 2.2) { b.sub = 'leave'; b.lx = b.x < S.camX + MM.W / 2 ? S.camX - 120 : S.camX + MM.W + 120; } }
      else if (b.sub === 'leave') { b.mood = b.mood === 'yell' ? 'yell' : 'calm'; if (walk(b.lx, 260)) S.boss = null; }
    } else if (b.mode === 'fire') {
      const p = S.player;
      if (b.sub === 'run') { b.mood = 'rage'; if (walk(p.x + (b.x < p.x ? -95 : 95), 620)) { b.sub = 'point'; b.t = 0; b.dir = Math.sign(p.x - b.x) || 1; bubble('boss', 'KI VAGY RÚGVA!', 4); A.sfx('yell', 0.85); S.shake = 12; } }
      else if (b.sub === 'point') { b.mood = 'point'; b.dir = Math.sign(p.x - b.x) || 1; b.pointDir = -1; /* faces the player, points to the exit (left) */ }
    }
  }

  // ---------- anger ----------
  function updateAnger(dt) {
    const n = G.floorCount(), carried = S.player.carry.length;
    let rise = 0.055 * n + 0.002 * n * n + carried * 0.03;
    if (S.boss && S.boss.mode === 'inspect') rise *= 1.2;
    if (S.fx.vacation > 0) rise = 0;
    S.anger += rise * dt;
    if (n === 0 && carried === 0) S.anger -= 1.0 * dt;
    S.anger = MM.clamp(S.anger, 0, 100);
    let st = 0; for (const th of STAGES) if (S.anger >= th) st++;
    if (st > S.stage) { const L = ['', 'A főnök gyanakodva figyel…', 'A főnök idegesen telefonál!', 'A FŐNÖK ÜVÖLTÖZIK!', 'A FŐNÖK VÖRÖS FEJJEL ROHANGÁL!']; popup(S.player.x, S.player.y - 250, L[st], st >= 3 ? '#ff4d4d' : '#ffd400', 26, 2); if (st >= 3) A.sfx('yell'); bubble('boss', MM.pick(MM.BOSS_LINES), 2.4); }
    S.stage = st;
    if (st >= 3 && S.t >= S.next.yell) { bubble('boss', MM.pick(MM.BOSS_LINES), 2.2); if (st >= 3) A.sfx('yell', MM.rand(0.9, 1.15)); S.next.yell = S.t + (st >= 4 ? 4 : 6); }
    if (st >= 4 && S.t >= S.next.alarm) { A.sfx('alarm'); S.next.alarm = S.t + 2.2; }
    A.setIntensity(S.anger / 100);
    if (S.anger >= 100 && !S.over) gameOver();
  }
  function gameOver() {
    S.over = true; S.overT = 0; S.stage = 5; const p = S.player;
    p.carry.forEach(it => { it.state = 'fall'; it.x = p.x; it.y = p.y - 150; it.vx = MM.rand(-120, 120); it.vy = -200; it.vr = 3; it.dom = new Set(); it.bounces = 0; }); p.carry = []; p.action = null;
    const fromLeft = p.x - S.camX > MM.W / 2;
    S.boss = { mode: 'fire', sub: 'run', x: fromLeft ? S.camX - 100 : S.camX + MM.W + 100, dir: fromLeft ? 1 : -1, t: 0, phase: 0, mood: 'rage', moving: true };
    S.cameo = null; A.music(false); A.sfx('fired'); bubble('player', 'Ó, ne…', 2);
    const surv = Math.floor(S.t), best = S.best; S.newRecord = Math.round(S.score) > (best.score || 0);
    if (S.newRecord) { try { localStorage.setItem('mmkk_best', JSON.stringify({ score: Math.round(S.score), time: surv, returned: S.returned, name: S.name })); } catch (e) {} }
    S.final = { time: surv, returned: S.returned, saved: S.saved, score: Math.round(S.score), broken: S.broken, bestCombo: S.bestCombo, newRecord: S.newRecord, best: Math.max(best.score || 0, Math.round(S.score)) };
  }
  G._gameOver = gameOver;

  // ---------- bot (debug autoplay, also used for balance tests) ----------
  G.botLag = 0; let botHold = 0;
  function botThink() {
    const p = S.player, I = G.input;
    if (!p.action && p.carry.find(it => reachSlot(p, it.slot))) { G.press('place'); return; }
    if (G.botLag && botHold-- > 0) return; botHold = G.botLag;
    I.left = I.right = I.sprint = I.down = false;
    if (p.action || p.stun > 0) return;
    let tx = null, wantPlace = false;
    const fl = S.items.filter(i => i.state === 'floor' || (i.state === 'fall' && i.y > MM.FLOOR - 60));
    const reach = p.carry.find(it => reachSlot(p, it.slot));
    if (reach) { G.press('place'); return; }
    if (p.carry.length >= capacity() || (p.carry.length && !fl.length) || (p.carry.length && fl.every(i => Math.abs(i.x - p.x) > 350))) {
      const it = p.carry.slice().sort((a, b) => Math.abs(a.slot.x - p.x) - Math.abs(b.slot.x - p.x))[0]; tx = it.slot.x; wantPlace = it;
    } else if (fl.length) { const it = fl.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0]; tx = it.x; if (Math.abs(it.x - p.x) < it.T.w / 2 + 40 && p.onGround) { G.press('pick'); return; } }
    if (S.bonuses.length) { const b = S.bonuses[0]; if (Math.abs(b.x - p.x) < 250) tx = b.x; }
    if (tx == null) return;
    const dx = tx - p.x;
    if (Math.abs(dx) > 12) { if (dx > 0) I.right = true; else I.left = true; }
    if (Math.abs(dx) > 320 && p.energy > 40) I.sprint = true;
    if (wantPlace && nearHoriz(p, wantPlace.slot) && p.onGround) G.press('jump');
  }

  // ---------- main update ----------
  const DT = 1 / 60;
  G.step = () => {
    if (!S || S.paused) return;
    if (G.bot && !S.over) botThink();
    S.t += S.over ? 0 : DT; if (S.over) S.overT += DT;
    updatePlayer(DT);
    for (const c of S.cats) updateCat(c, DT);
    updateItems(DT); updateBoss(DT);
    if (!S.over) { updateEvents(DT); updateAnger(DT); S.score += 2 * DT; if (S.comboT > 0) { S.comboT -= DT; if (S.comboT <= 0) comboReset('timeout'); } }
    for (const q of S.particles) { q.life += DT; q.vy += (q.type === 'heart' ? -60 : 900) * DT; q.x += q.vx * DT; q.y += q.vy * DT; q.rot += q.vr * DT; if (q.y > MM.FLOOR + 30 && q.type === 'shard') { q.y = MM.FLOOR + 30; q.vy *= -0.3; q.vx *= 0.6; } }
    S.particles = S.particles.filter(q => q.life < q.max); if (S.particles.length > 500) S.particles.splice(0, S.particles.length - 500);
    for (const q of S.popups) q.t += DT; S.popups = S.popups.filter(q => q.t < q.dur);
    for (const q of S.bubbles) q.t += DT; S.bubbles = S.bubbles.filter(q => q.t < q.dur);
    if (S.banner) { S.banner.t += DT; if (S.banner.t > S.banner.dur) S.banner = null; }
    S.shake = Math.max(0, S.shake - DT * 30);
    // camera
    const p = S.player, tgt = MM.clamp(p.x - MM.W / 2 + p.dir * 90, 0, MM.WORLD_W - MM.W);
    S.camX += (tgt - S.camX) * Math.min(1, DT * 5);
    if (S.over && S.overT > 5.2 && !S.overShown) { S.overShown = true; if (G.onGameOver) G.onGameOver(S.final); }
  };
  G.update = (realDt) => {
    if (!S || S.paused) return;
    G.acc = (G.acc || 0) + Math.min(realDt, 0.1) * G.timeScale;
    let n = 0; while (G.acc >= DT && n < 60) { G.step(); G.acc -= DT; n++; }
    if (n >= 60) G.acc = 0;
  };
  G.reachSlot = reachSlot; G.capacity = () => capacity(); G.unitAt = unitAt; G.lvY = lvY;
  return G;
})();
