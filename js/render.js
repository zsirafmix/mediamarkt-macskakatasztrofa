'use strict';
MM.Render = (() => {
  const R = {}, Art = MM.Art, G = MM.Game, INK = '#1d1416';
  const font = (sz, w = 900) => `${w} ${sz}px "Arial Black", "Arial Bold", Impact, sans-serif`;
  function txt(c, s, x, y, sz, col = '#fff', align = 'center', stroke = 5, sc = INK) {
    c.font = font(sz); c.textAlign = align; c.textBaseline = 'middle'; c.lineJoin = 'round';
    if (stroke) { c.lineWidth = stroke; c.strokeStyle = sc; c.strokeText(s, x, y); }
    c.fillStyle = col; c.fillText(s, x, y);
  }
  R.txt = txt;
  function bubbleAt(c, x, y, text, t, dur, col = '#fff', tail = 'down', screen = false) {
    c.font = font(17); const w = Math.min(520, c.measureText(text).width + 28), h = 38;
    const a = Math.min(1, t * 6, (dur - t) * 4), s = 0.8 + 0.2 * Math.min(1, t * 6);
    c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
    const bx = screen ? MM.clamp(-w / 2, -x + 10, MM.W - x - w - 10) : -w / 2;
    c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 3; MM.rr(c, bx, -h - 14, w, h, 12); c.fill(); c.stroke();
    c.beginPath(); if (tail === 'down') { c.moveTo(-10, -15); c.lineTo(0, 0); c.lineTo(10, -15); } else { c.moveTo(-10, -h - 13); c.lineTo(0, -h - 30); c.lineTo(10, -h - 13); } c.fill(); c.stroke();
    c.fillStyle = col; if (tail === 'down') c.fillRect(-9, -17, 18, 4); else c.fillRect(-9, -h - 16, 18, 4);
    c.fillStyle = INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, bx + w / 2, -h / 2 - 14);
    c.restore();
  }
  function catPose(c, S) {
    const p = S.player, look = [MM.clamp((p.x - c.x) / 300, -1, 1) * (c.dir || 1), MM.clamp((p.y - 90 - c.y) / 250, -1, 1)];
    const k = { x: c.x, y: c.y - (c.spawnY || 0), dir: c.dir, pal: c.pal, phase: c.phase, paw: c.paw, tail: c.tail, time: c.time, look };
    if (c.hop || c.leap) k.mode = 'hop';
    else if (c.state === 'catnip') k.mode = 'roll';
    else if (c.state === 'innocent') { k.mode = 'sit'; k.innocent = true; k.eyesBig = 1; k.look = [0, 0.3]; }
    else if (c.state === 'wait') { k.mode = c.st > 0.6 ? 'sit' : 'stand'; k.blink = Math.sin(c.time * 1.3) > 0.97; k.look = [1, 0.4]; }
    else if (c.state === 'stare') { k.mode = c.stareStarted ? 'stand' : (c.moving ? 'run' : 'stand'); if (c.stareStarted) { k.stare = true; k.smug = c.st > 1.6; k.headDx = 2; } }
    else if (c.state === 'finale') { k.mode = c.moving ? 'run' : 'sit'; k.smug = true; k.paw = c.paw; }
    else if (c.state === 'frenzy') { k.mode = c.moving ? 'run' : 'stand'; k.meow = true; }
    else if (c.state === 'swipe') { k.mode = 'stand'; k.meow = c.variant === 'multi'; }
    else k.mode = c.moving ? (G.S().t > 60 || c.due > 0 ? 'run' : 'walk') : 'stand';
    if (c.spawnY > 0) k.mode = 'hop';
    return k;
  }
  R.catPose = catPose;

  R.draw = (c) => {
    const S = G.S(); if (!S) return;
    const L = G.layout();
    const sh = S.shake > 0 ? [MM.rand(-1, 1) * S.shake, MM.rand(-1, 1) * S.shake] : [0, 0];
    const camX = S.camX + sh[0], bx = camX * Art.BG_FACTOR;
    c.save(); c.translate(0, sh[1]);
    // background (parallax)
    c.drawImage(Art.bg, MM.clamp(bx, 0, Art.bgW - MM.W), 0, MM.W, MM.H, 0, 0, MM.W, MM.H);
    // boss in office window (stages 25-89 %)
    const t = S.t, st = S.stage;
    if (st >= 1 && st <= 3 && !S.over) {
      let ox = null, bd = 1e9; for (const o of Art.offices) { const sx = o - bx; const d = Math.abs(sx + 65 - MM.W / 2); if (d < bd && sx > -130 && sx < MM.W) { bd = d; ox = sx; } }
      if (ox !== null) { c.save(); c.beginPath(); c.rect(ox, 160, 130, 95); c.clip();
        const mood = st === 1 ? 'sus' : st === 2 ? 'phone' : 'yell'; const pace = st >= 2 ? Math.sin(t * 1.5) * 30 : Math.sin(t * 0.7) * 10;
        Art.drawBoss(c, ox + 65 + pace, 160 + 95 + 75 + (st === 1 ? 18 : 0), { anger: S.anger / 100, mood, dir: pace > 0 ? 1 : -1, time: t }, 0.78);
        c.fillStyle = 'rgba(160,200,220,0.22)'; c.fillRect(ox, 160, 130, 95); c.restore(); }
    }
    c.save(); c.translate(-camX, 0);
    // boss running behind the shelves at >= 90 %
    if (st === 4 && !S.over) { const bxw = S.camX + MM.W / 2 + Math.sin(t * 1.4) * 620; Art.drawBoss(c, bxw, MM.FLOOR - 12, { anger: 1, mood: 'rage', dir: Math.cos(t * 1.4) > 0 ? 1 : -1, moving: true, phase: t * 14, time: t }, 0.86); }
    // cameo: peeks from behind the shelves in an aisle gap
    if (S.cameo) { const k = S.cameo.t < 0.4 ? S.cameo.t / 0.4 : S.cameo.t > S.cameo.dur ? 1 - (S.cameo.t - S.cameo.dur) / 0.5 : 1;
      Art.drawBoss(c, S.cameo.x + (1 - k) * 90, MM.FLOOR - 10, { anger: S.anger / 100, mood: 'sus', dir: -1, time: t }, 0.86); }
    c.drawImage(Art.world, camX, 0, MM.W, MM.H, camX, 0, MM.W, MM.H);
    c.restore();
    Art.drawFloor(c, camX);
    c.save(); c.translate(-camX, 0);
    const vis = x => x > camX - 160 && x < camX + MM.W + 160;
    const p = S.player, carriedSlots = new Set(p.carry.map(i => i.slot.id));
    // empty slot ghosts
    c.setLineDash([6, 5]);
    for (const s of L.slots) {
      if (!vis(s.x)) continue; const it = s.item, T = MM.TYPES[s.type];
      if (it && it.state === 'shelf') continue;
      const mine = carriedSlots.has(s.id), pulse = 0.5 + 0.5 * Math.sin(t * 8);
      c.lineWidth = mine ? 3 : 2; c.strokeStyle = mine ? `rgba(60,255,120,${0.6 + pulse * 0.4})` : s.restock > 0 ? 'rgba(120,120,120,0.5)' : 'rgba(227,6,19,0.55)';
      c.strokeRect(s.x - T.w / 2, s.y - T.h, T.w, T.h);
      if (mine) { c.globalAlpha = 0.25 + pulse * 0.15; Art.drawProduct(c, s.type, s.x, s.y); c.globalAlpha = 1; c.setLineDash([]);
        const ay = s.y - T.h - 18 - Math.abs(Math.sin(t * 5)) * 10; c.fillStyle = '#3cff78'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(s.x - 12, ay - 14); c.lineTo(s.x + 12, ay - 14); c.lineTo(s.x, ay); c.closePath(); c.fill(); c.stroke(); c.setLineDash([6, 5]);
        if (G.reachSlot(p, s)) txt(c, 'SPACE', s.x, s.y - T.h - 48, 13, '#3cff78', 'center', 3); }
      else if (s.restock > 0) { c.setLineDash([]); txt(c, 'ELFOGYOTT', s.x, s.y - 14, 10, '#bbb', 'center', 3); c.setLineDash([6, 5]); }
    }
    c.setLineDash([]);
    // shelf products
    for (const s of L.slots) { const it = s.item; if (!it || it.state !== 'shelf' || !vis(s.x)) continue; const pop = s.pop > 0 ? 1 + Math.sin(s.pop / 0.4 * Math.PI) * 0.15 : 1; Art.drawProduct(c, s.type, s.x, s.y, 0, pop); }
    // cats
    for (const ct of S.cats) { if (!vis(ct.x)) continue; const cp = catPose(ct, S); if (ct.state === 'stare' && ct.stareStarted) cp.scale = 1 + Math.min(1, ct.st * 2) * 0.3; Art.drawCat(c, cp); if (ct.state === 'catnip') { for (let i = 0; i < 2; i++) { const hh = (t * 0.8 + i * 0.5) % 1; c.globalAlpha = 1 - hh; txt(c, '♥', ct.x + (i ? 20 : -16), ct.y - 70 - hh * 40, 18, '#ff6b9a', 'center', 3); c.globalAlpha = 1; } } }
    // bonuses
    for (const b of S.bonuses) { if (!vis(b.x)) continue; if (b.life - b.t < 3 && Math.sin(b.t * 20) > 0) continue; const y = b.y + Math.sin(b.t * 4) * 6;
      c.save(); c.shadowColor = '#fff36b'; c.shadowBlur = 18; Art.drawBonus(c, b.type, b.x, y, 22); c.restore(); txt(c, G.BONUS_NAMES[b.type], b.x, y - 36, 12, '#ffe066', 'center', 3); }
    // floor & falling items
    for (const it of S.items) { if ((it.state === 'floor' || it.state === 'fall' || it.state === 'auto') && vis(it.x)) {
      if (it.state === 'floor') { c.fillStyle = 'rgba(0,0,0,0.18)'; MM.ell(c, it.x, MM.FLOOR + 2, it.T.w * 0.5, 5); c.fill(); }
      Art.drawProduct(c, it.type, it.x, it.y, it.rot); if (it.state === 'auto') { c.strokeStyle = '#9fd8ff'; c.lineWidth = 2; c.beginPath(); c.arc(it.x, it.y - it.T.h / 2, it.T.w / 2 + 8, 0, 7); c.stroke(); } } }
    // player
    const act = p.action;
    const pose = { who: S.who, dir: p.dir, phase: p.phase, moving: p.moving && p.onGround, air: !p.onGround, crouch: act && act.type === 'pick' ? Math.sin(Math.min(1, act.t / act.dur) * Math.PI) : 0,
      carryN: p.carry.length, action: act ? act.type : null, mood: S.over ? 'scared' : act ? 'effort' : p.mood, stun: p.stun > 0, sweat: p.sweat, time: p.time, panic: p.panic && !act, cheer: p.cheer > 0, scared: S.over, sprint: p.sprint, stumble: p.stumble, blush: p.sprint };
    c.save(); c.translate(p.x, p.y); c.scale(1.15, 1.15); const pi = Art.drawPerson(c, 0, 0, pose); c.restore();
    const info = { headTop: p.y + pi.headTop * 1.15 };
    // carried stack
    let sy = info.headTop - 2;
    p.carry.forEach((it, i) => { if (act && act.item === it) return; const wob = Math.sin(p.time * 7 + i) * (p.moving ? 3 + i * 2 : 1); Art.drawProduct(c, it.type, p.x + wob, sy, wob * 0.01 * (i + 1), 0.68); sy -= it.T.h * 0.68 - 1; });
    if (act) { const k = Math.min(1, act.t / act.dur);
      if (act.type === 'place') { const s = act.slot; Art.drawProduct(c, act.item.type, MM.lerp(p.x, s.x, k), MM.lerp(info.headTop, s.y, k), 0, MM.lerp(0.68, 1, k)); }
      c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.arc(p.x, info.headTop - 22, 13, 0, 7); c.stroke();
      c.strokeStyle = act.type === 'pick' ? '#ffd400' : '#3cff78'; c.lineWidth = 4; c.beginPath(); c.arc(p.x, info.headTop - 22, 13, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); c.stroke(); }
    // foreground boss
    if (S.boss) { const b = S.boss; Art.drawBoss(c, b.x, MM.FLOOR + 6, { anger: S.over ? 1 : S.anger / 100, mood: b.mood, dir: b.dir, moving: b.moving, phase: b.phase, time: t, pointDir: b.pointDir }, 1.05);
      if (b.mode === 'fire' && b.sub === 'point') { const k = Math.sin(t * 8) * 8; c.save(); c.fillStyle = '#1aa14a'; c.strokeStyle = INK; c.lineWidth = 4; MM.rr(c, camX + 40 + k, 200, 250, 60, 10); c.fill(); c.stroke(); c.restore(); txt(c, '⬅ KIJÁRAT', camX + 165 + k, 231, 30, '#fff', 'center', 5); } }
    // particles
    for (const q of S.particles) { const a = 1 - q.life / q.max; c.globalAlpha = a;
      if (q.type === 'shard') { c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.fillStyle = q.col; c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(-q.size, 0); c.lineTo(0, -q.size * 0.6); c.lineTo(q.size, q.size * 0.5); c.closePath(); c.fill(); c.stroke(); c.restore(); }
      else if (q.type === 'dust') { c.fillStyle = q.col; MM.ell(c, q.x, q.y, q.size * (1.5 + q.life * 2), q.size * (1 + q.life)); c.fill(); }
      else { Art.drawStar(c, q.x, q.y, q.size * 0.8, q.col); }
      c.globalAlpha = 1; }
    // popups
    for (const q of S.popups) { const k = q.t / q.dur; c.globalAlpha = Math.min(1, (1 - k) * 3); txt(c, q.text, q.x, q.y - k * 50, q.size * (k < 0.1 ? 0.6 + k * 4 : 1), q.col, 'center', 4); c.globalAlpha = 1; }
    // bubbles anchored in world
    for (const b of S.bubbles) {
      if (b.who === 'player') bubbleAt(c, p.x, info.headTop - 6 - p.carry.length * 40, b.text, b.t, b.dur);
      else if (b.who === 'cat') { const ct = S.cats.find(x => x.state === 'stare') || S.cats[0]; bubbleAt(c, ct.x, ct.y - 85, b.text, b.t, b.dur, '#f3e9ff'); }
      else if (b.who === 'bossCameo' && S.cameo) bubbleAt(c, S.cameo.x, MM.FLOOR - 160, b.text, b.t, b.dur, '#fff3c4');
      else if (b.who === 'boss' && S.boss) bubbleAt(c, S.boss.x, MM.FLOOR - 165, b.text, b.t, b.dur, '#ffd6d6');
    }
    c.restore();
    // screen-anchored boss bubble (from the office / HUD)
    for (const b of S.bubbles) if (b.who === 'boss' && !S.boss) bubbleAt(c, 520, 150, b.text, b.t, b.dur, '#ffd6d6', 'up', true);
    // stare cinematic
    if (S.stareFx) { const ct = S.cats.find(x => x.state === 'stare' && x.stareStarted); if (ct) { const sx = ct.x - camX, k = Math.min(1, ct.st * 2);
      const g = c.createRadialGradient(sx, ct.y - 40, 60, sx, ct.y - 40, 700); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(20,0,30,${0.55 * k})`); c.fillStyle = g; c.fillRect(0, 0, MM.W, MM.H);
      c.fillStyle = '#000'; c.fillRect(0, 0, MM.W, 46 * k); c.fillRect(0, MM.H - 46 * k, MM.W, 46 * k); } }
    // offscreen guidance
    for (const it of p.carry) { const s = it.slot, sx = s.x - camX; if (sx < 20 || sx > MM.W - 20) { const right = sx > 0, ax = right ? MM.W - 34 : 34, ay = s.y - 40;
      c.fillStyle = '#3cff78'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(ax + (right ? 22 : -22), ay); c.lineTo(ax - (right ? 6 : -6), ay - 18); c.lineTo(ax - (right ? 6 : -6), ay + 18); c.closePath(); c.fill(); c.stroke();
      Art.drawProduct(c, it.type, ax - (right ? 34 : -34), ay + 18, 0, 0.45); } }
    let lc = 0, rc = 0; for (const it of S.items) if (it.state === 'floor' || it.state === 'fall') { if (it.x < camX) lc++; else if (it.x > camX + MM.W) rc++; }
    if (lc) txt(c, '◀ ' + lc, 40, MM.FLOOR + 30, 22, '#ff6b6b', 'center', 4);
    if (rc) txt(c, rc + ' ▶', MM.W - 40, MM.FLOOR + 30, 22, '#ff6b6b', 'center', 4);
    c.restore();
    drawHUD(c, S, L);
    if (S.banner) { const b = S.banner, k = b.t / b.dur, s = k < 0.12 ? 0.4 + k / 0.12 * 0.7 : k < 0.18 ? 1.1 - (k - 0.12) / 0.06 * 0.1 : 1; c.save(); c.globalAlpha = Math.min(1, (1 - k) * 5); c.translate(MM.W / 2, 290); c.scale(s, s); c.rotate(-0.03);
      txt(c, b.text, 0, 0, 62, b.col, 'center', 10); if (b.sub) txt(c, b.sub, 0, 54, 24, '#fff', 'center', 6); c.restore(); }
    if (MM.debug && R.fps) { c.font = '12px monospace'; c.fillStyle = '#0f0'; c.textAlign = 'left'; c.fillText(`fps ${R.fps} t ${S.t.toFixed(1)} iv ${MM.knockInterval(S.t)} anger ${S.anger.toFixed(1)} floor ${G.floorCount()} knocks ${S.log.knocks.length} x${G.timeScale}`, 8, MM.H - 8); }
  };

  function drawHUD(c, S, L) {
    const p = S.player;
    // panel
    c.fillStyle = 'rgba(20,12,14,0.78)'; MM.rr(c, 6, 6, MM.W - 12, 84, 14); c.fill(); c.strokeStyle = '#e30613'; c.lineWidth = 3; c.stroke();
    // left: portrait
    const H = Art.HEADS[S.who], im = Art.img(H.img);
    c.save(); c.beginPath(); c.arc(50, 48, 34, 0, 7); c.fillStyle = '#e30613'; c.fill(); c.clip(); if (im) c.drawImage(im, 50 - 30, 48 - 38, 60, 60 * H.h / H.w); c.restore();
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(50, 48, 34, 0, 7); c.stroke();
    txt(c, S.name, 94, 28, 20, '#fff', 'left', 4);
    txt(c, 'PONT: ' + MM.fmtNum(S.score), 94, 54, 18, '#ffe066', 'left', 4);
    txt(c, 'REKORD: ' + MM.fmtNum(Math.max(S.best.score || 0, S.over ? S.score : 0)), 94, 76, 12, '#bbb', 'left', 3);
    // center: anger meter
    const mx = 400, my = 34, mw = 440, mh = 26, a = S.anger / 100;
    // boss face
    c.save(); c.beginPath(); c.arc(mx - 38, 48, 33, 0, 7); c.fillStyle = S.anger > 75 ? '#7a0010' : '#3a2a2e'; c.fill(); c.clip();
    const bm = S.over ? 'rage' : ['calm', 'sus', 'phone', 'yell', 'rage', 'rage'][S.stage];
    Art.drawBoss(c, mx - 38, 48 + 146 * 0.78 + 4, { anger: S.over ? 1 : a, mood: bm, dir: 1, time: S.t }, 0.78); c.restore();
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(mx - 38, 48, 33, 0, 7); c.stroke();
    txt(c, 'FŐNÖK DÜHE', mx, 18, 15, '#fff', 'left', 3);
    txt(c, Math.floor(S.anger) + '%', mx + mw, 18, 16, a > 0.75 ? '#ff4d4d' : '#fff', 'right', 3);
    c.fillStyle = '#2a2a2a'; MM.rr(c, mx, my, mw, mh, 8); c.fill();
    const g = c.createLinearGradient(mx, 0, mx + mw, 0); g.addColorStop(0, '#3ccf5a'); g.addColorStop(0.45, '#ffd400'); g.addColorStop(0.75, '#ff8a00'); g.addColorStop(1, '#e30613');
    c.save(); MM.rr(c, mx, my, mw, mh, 8); c.clip(); c.fillStyle = g; c.fillRect(mx, my, mw * a, mh);
    if (a > 0.9 && Math.sin(S.t * 14) > 0) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(mx, my, mw * a, mh); }
    if (S.fx.vacation > 0) { c.fillStyle = 'rgba(120,200,255,0.45)'; c.fillRect(mx, my, mw, mh); }
    c.restore(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; MM.rr(c, mx, my, mw, mh, 8); c.stroke();
    for (const th of [25, 50, 75, 90]) { const x = mx + mw * th / 100; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x, my); c.lineTo(x, my + mh); c.stroke(); c.fillStyle = '#ccc'; c.font = 'bold 9px Arial'; c.textAlign = 'center'; c.fillText(th + '', x, my + mh + 9); }
    txt(c, G.STAGE_TXT[S.over ? 5 : S.stage], mx + mw / 2, my + mh / 2, 14, '#fff', 'center', 4);
    // minimap
    const mmx = mx, mmy = 74, mmw = mw, mmh = 12, sc = mmw / MM.WORLD_W;
    c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(mmx, mmy, mmw, mmh);
    c.fillStyle = 'rgba(227,6,19,0.55)'; for (const u of L.units) c.fillRect(mmx + u.x * sc, mmy + 1, MM.UNIT_W * sc, mmh - 2);
    c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.strokeRect(mmx + S.camX * sc, mmy - 1, MM.W * sc, mmh + 2);
    c.fillStyle = '#ff4d4d'; for (const it of S.items) if (it.state === 'floor' || it.state === 'fall') c.fillRect(mmx + it.x * sc - 1.5, mmy + mmh - 5, 3, 4);
    c.fillStyle = '#3cff78'; for (const it of p.carry) c.fillRect(mmx + it.slot.x * sc - 2, mmy + 1, 4, 4);
    c.fillStyle = '#ffe066'; for (const b of S.bonuses) c.fillRect(mmx + b.x * sc - 2, mmy + 3, 4, 6);
    for (const ct of S.cats) { c.fillStyle = ct.pal === 'barat' ? '#ff9f43' : '#aaa'; c.beginPath(); c.arc(mmx + ct.x * sc, mmy + 3, 3.2, 0, 7); c.fill(); }
    c.fillStyle = '#fff'; c.beginPath(); c.arc(mmx + p.x * sc, mmy + mmh - 3, 3.5, 0, 7); c.fill();
    // right: time, combo, carry, energy, effects
    const rx = 880;
    txt(c, '⏱ ' + MM.fmtTime(S.t), rx, 28, 22, '#fff', 'left', 4);
    if (S.combo > 1) txt(c, 'SOROZAT x' + S.combo, rx + 140, 28, 16, '#7dff9a', 'left', 4);
    const cap = G.capacity(); txt(c, 'KÉZBEN:', rx, 56, 12, '#ccc', 'left', 3);
    for (let i = 0; i < cap; i++) { const bx2 = rx + 62 + i * 34; c.fillStyle = i < p.carry.length ? '#fff' : 'rgba(255,255,255,0.12)'; MM.rr(c, bx2, 44, 30, 26, 5); c.fill(); c.strokeStyle = cap > 2 ? '#9fd8ff' : '#888'; c.lineWidth = 2; c.stroke();
      if (p.carry[i]) Art.drawProduct(c, p.carry[i].type, bx2 + 15, 68, 0, Math.min(0.4, 24 / p.carry[i].T.w)); }
    txt(c, 'SPRINT', rx, 80, 10, '#ccc', 'left', 3); c.fillStyle = '#333'; c.fillRect(rx + 46, 75, 120, 9); c.fillStyle = p.sprintLock > 0 ? '#ff6b6b' : '#5ec8ff'; c.fillRect(rx + 46, 75, 120 * p.energy / 100, 9);
    let ex = rx + 250; const fx = S.fx;
    for (const k of ['coffee', 'catnip', 'cart', 'vacation']) if (fx[k] > 0) { Art.drawBonus(c, k, ex, 62, 15); txt(c, Math.ceil(fx[k]) + '', ex, 84, 11, '#fff', 'center', 3); ex += 36; }
  }
  return R;
})();
