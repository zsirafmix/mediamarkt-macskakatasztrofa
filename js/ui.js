'use strict';
MM.UI = (() => {
  const U = {}, G = MM.Game, A = MM.Audio, Art = MM.Art, $ = id => document.getElementById(id);
  const stage = $('stage'), cv = $('cv'), ctx = cv.getContext('2d');
  let screen = 'title', scale = 1, sel = 0;
  const NAMES_DEFAULT = { left: 'Laci', right: 'Luca' };
  U.names = () => { let sw = false; try { sw = localStorage.getItem('mmkk_swap') === '1'; } catch (e) {} return sw ? { left: NAMES_DEFAULT.right, right: NAMES_DEFAULT.left } : { ...NAMES_DEFAULT }; };
  // ---------- layout / letterbox ----------
  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    scale = Math.min(vw / MM.W, vh / MM.H);
    stage.style.transform = `translate(${(vw - MM.W * scale) / 2}px,${(vh - MM.H * scale) / 2}px) scale(${scale})`;
    const maxPx = MM.isTouch ? 1.6e6 : 3.7e6; let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let k = scale * dpr; if (MM.W * MM.H * k * k > maxPx) k = Math.sqrt(maxPx / (MM.W * MM.H));
    cv.width = Math.round(MM.W * k); cv.height = Math.round(MM.H * k); U.k = k;
    $('rotate').classList.toggle('need', MM.isTouch && vh > vw);
  }
  window.addEventListener('resize', resize); window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  // ---------- screens ----------
  function show(name) {
    screen = name;
    for (const id of ['title', 'select', 'help', 'pause', 'over']) $(id).classList.toggle('hidden', id !== name);
    const inGame = name === 'game' || name === 'pause';
    $('topbtns').classList.toggle('hidden', !inGame);
    $('touch').classList.toggle('hidden', !(name === 'game' && (MM.isTouch || /[?&]touch=1/.test(location.search))));
    if (name === 'title') { const b = G.loadBest(); $('recordLine').textContent = b.score ? `🏆 Rekord: ${MM.fmtNum(b.score)} pont · ${MM.fmtTime(b.time)} túlélés${b.name ? ' (' + b.name + ')' : ''}` : 'Még nincs rekord – légy te az első!'; }
    if (name === 'select') { const n = U.names(); document.querySelectorAll('.card').forEach((c, i) => { c.querySelector('.nm').textContent = n[c.dataset.who]; c.classList.toggle('sel', i === sel); }); }
  }
  U.show = show; U.screen = () => screen;
  function startGame(who, name) {
    A.init(); G.start(who, name || U.names()[who]); show('game');
  }
  U.startGame = startGame;
  function pause(on) { const S = G.S(); if (!S || S.over) return; S.paused = on; show(on ? 'pause' : 'game'); A.music(!on); }
  U.pause = pause;
  G.onGameOver = f => {
    $('stTime').textContent = MM.fmtTime(f.time); $('stRet').textContent = f.returned; $('stVal').textContent = MM.fmtFt(f.saved);
    $('stScore').textContent = MM.fmtNum(f.score); $('stBroken').textContent = G.S().broken; $('stCombo').textContent = f.bestCombo;
    $('stRecord').textContent = f.newRecord ? '🏆 ÚJ REKORD! 🏆' : 'Rekord: ' + MM.fmtNum(f.best) + ' pont';
    show('over');
  };
  // product table in help
  $('prodTable').innerHTML = '<tr><td>Termék</td><td>Nehézség</td><td>Pont</td><td>Ár</td></tr>' + Object.values(MM.TYPES).map(T => `<tr><td>${T.name}</td><td>${T.diff}</td><td>${T.pts}</td><td>${MM.fmtFt(T.price)}</td></tr>`).join('');
  const click = (id, fn) => $(id).addEventListener('click', e => { A.init(); A.sfx('pick'); fn(e); });
  click('playBtn', () => show('select'));
  click('helpBtn', () => show('help'));
  click('helpBack', () => show('title'));
  click('backBtn', () => show('title'));
  click('swapBtn', () => { const sw = localStorage.getItem('mmkk_swap') === '1'; try { localStorage.setItem('mmkk_swap', sw ? '0' : '1'); } catch (e) {} show('select'); });
  document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => { A.init(); startGame(c.dataset.who); }));
  click('resumeBtn', () => pause(false));
  click('restartBtn', () => { const S = G.S(); startGame(S.who, S.name); });
  click('menuBtn', () => { G.S().paused = true; A.music(false); show('title'); });
  click('againBtn', () => { const S = G.S(); startGame(S.who, S.name); });
  click('overMenuBtn', () => show('title'));
  click('pauseBtn', () => pause(!G.S().paused));
  const setMute = m => { A.setMuted(m); $('muteBtn').textContent = m ? '🔇' : '🔊'; try { localStorage.setItem('mmkk_mute', m ? '1' : '0'); } catch (e) {} };
  click('muteBtn', () => setMute(!A.isMuted()));
  try { if (localStorage.getItem('mmkk_mute') === '1') setMute(true); } catch (e) {}
  click('fsBtn', () => { const d = document.documentElement; if (!document.fullscreenElement) { (d.requestFullscreen || d.webkitRequestFullscreen || (() => {})).call(d); try { window.screen.orientation && window.screen.orientation.lock && window.screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} } else (document.exitFullscreen || (() => {})).call(document); });
  // ---------- keyboard ----------
  const KEYMAP = { KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', KeyW: 'jump', ArrowUp: 'jump', KeyS: 'down', ArrowDown: 'down', KeyE: 'pick', Space: 'place', ShiftLeft: 'sprint', ShiftRight: 'sprint' };
  function setKey(k, down) {
    const I = G.input;
    if (k === 'jump' || k === 'pick' || k === 'place') { if (down && !I[k]) G.press(k); I[k] = down; }
    else I[k] = down;
  }
  U.setKey = setKey;
  window.addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    A.init();
    if (screen === 'game') {
      if (e.code === 'KeyP' || e.code === 'Escape') { pause(true); return; }
      if (e.code === 'KeyM') { setMute(!A.isMuted()); return; }
      const k = KEYMAP[e.code]; if (k && !e.repeat) setKey(k, true);
    } else if (screen === 'pause') { if (e.code === 'KeyP' || e.code === 'Escape' || e.code === 'Enter') pause(false); }
    else if (screen === 'title') { if (e.code === 'Enter' || e.code === 'Space') show('select'); }
    else if (screen === 'select') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') { sel = 1 - sel; show('select'); }
      else if (e.code === 'Enter' || e.code === 'Space') startGame(sel ? 'right' : 'left');
      else if (e.code === 'Escape') show('title');
    } else if (screen === 'over') { if (e.code === 'Enter') { const S = G.S(); startGame(S.who, S.name); } }
    else if (screen === 'help' && e.code === 'Escape') show('title');
  });
  window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) setKey(k, false); });
  window.addEventListener('blur', () => { for (const k in G.input) G.input[k] = false; if (screen === 'game') pause(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && screen === 'game') pause(true); });
  // ---------- touch controls ----------
  document.querySelectorAll('.tb').forEach(b => {
    const k = b.dataset.k, on = e => { e.preventDefault(); A.init(); b.classList.add('on'); setKey(k, true); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
    const off = e => { e.preventDefault(); b.classList.remove('on'); setKey(k, false); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
    b.addEventListener('contextmenu', e => e.preventDefault());
  });
  document.addEventListener('touchmove', e => { if (screen !== 'help') e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());
  // ---------- character previews ----------
  function drawPreviews(t) {
    document.querySelectorAll('.card canvas').forEach(c => {
      const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.save(); x.translate(110, 236); x.scale(1.45, 1.45);
      Art.drawPerson(x, 0, 0, { who: c.parentElement.dataset.who, dir: 1, phase: t * 6, moving: c.parentElement.classList.contains('sel') || c.parentElement.matches(':hover'), mood: 'cheer', time: t, cheer: false });
      x.restore();
    });
  }
  // ---------- title attract: pan the store, cat strolls ----------
  let titleCat = { x: 300, y: MM.TOP - 8, dir: 1, phase: 0, time: 0, mode: 'walk' };
  function drawTitleBg(t) {
    const camX = (Math.sin(t * 0.05) * 0.5 + 0.5) * (MM.WORLD_W - MM.W);
    ctx.drawImage(Art.bg, camX * Art.BG_FACTOR, 0, MM.W, MM.H, 0, 0, MM.W, MM.H);
    ctx.drawImage(Art.world, camX, 0, MM.W, MM.H, 0, 0, MM.W, MM.H);
    Art.drawFloor(ctx, camX);
    ctx.save(); ctx.translate(-camX, 0);
    for (const s of G.layout().slots) if (s.x > camX - 100 && s.x < camX + MM.W + 100) Art.drawProduct(ctx, s.type, s.x, s.y);
    titleCat.time = t; titleCat.phase = t * 9; titleCat.x += titleCat.dir * 1.4; if (titleCat.x > MM.WORLD_W - 300 || titleCat.x < 300) titleCat.dir *= -1;
    if (titleCat.x < camX + 100) titleCat.x = camX + 100; if (titleCat.x > camX + MM.W - 100) titleCat.x = camX + MM.W - 100;
    const u = G.unitAt(titleCat.x); titleCat.y = u ? MM.TOP - 8 : MM.TOP - 30;
    Art.drawCat(ctx, titleCat); ctx.restore();
  }
  // ---------- loop ----------
  let last = performance.now(), fpsN = 0, fpsT = 0;
  function frame(now) {
    const dt = (now - last) / 1000; last = now; fpsN++; fpsT += dt; if (fpsT > 0.5) { MM.Render.fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; }
    const k = U.k; ctx.setTransform(k, 0, 0, k, 0, 0);
    const S = G.S();
    if (S && (screen === 'game' || screen === 'pause' || screen === 'over')) { G.update(dt); MM.Render.draw(ctx); }
    else { drawTitleBg(now / 1000); }
    if (screen === 'select') drawPreviews(now / 1000);
    A.tick();
    requestAnimationFrame(frame);
  }
  U.boot = async () => {
    resize(); await Art.load(); G.init(); show('title'); requestAnimationFrame(frame);
    if (MM.debug) U.installTest();
    window.MM_READY = true;
  };
  // ---------- debug / test hooks (?debug=1) ----------
  U.installTest = () => {
    const T = MM.test = {};
    T.S = () => G.S(); T.G = G;
    T.start = (who = 'left', name) => { G.noEvents = false; G.freezeCats = false; G.bot = false; G.botLag = 0; startGame(who, name); };
    T.timeScale = k => { G.timeScale = k; };
    T.setTime = t => { G.S().t = t; };
    T.noEvents = b => { G.noEvents = b; }; T.freezeCats = b => { G.freezeCats = b; }; T.bot = b => { G.bot = b; };
    T.step = n => { for (let i = 0; i < n; i++) G.step(); };
    T.key = (k, d) => setKey(k, d); T.press = k => G.press(k);
    T.teleport = (x, y) => { const p = G.S().player; p.x = x; p.y = y == null ? MM.FLOOR : y; p.vy = 0; p.vx = 0; G.S().camX = MM.clamp(x - MM.W / 2, 0, MM.WORLD_W - MM.W); };
    T.setAnger = v => { G.S().anger = v; };
    T.slots = () => G.layout().slots.map(s => ({ id: s.id, type: s.type, x: s.x, y: s.y, board: s.board, unit: s.unit, state: s.item ? s.item.state : 'none', item: s.item ? s.item.id : null }));
    T.items = () => G.S().items.filter(i => i.state !== 'gone').map(i => ({ id: i.id, type: i.type, state: i.state, x: Math.round(i.x), y: Math.round(i.y), slot: i.slot.id }));
    T.knockSlot = (id, dir = 1) => { const s = G.layout().slots[id]; return G._knock(s.item, dir); };
    T.dropAt = (id, x) => { const s = G.layout().slots[id], it = s.item; G._knock(it, 1); it.x = x; it.y = MM.FLOOR; it.vx = 0; it.vy = 0; it.state = 'floor'; it.rot = 0; return it.id; };
    T.give = id => { const s = G.layout().slots[id], it = s.item; G._knock(it, 1); it.state = 'carried'; G.S().player.carry.push(it); return it.id; };
    T.breakSlot = id => { const s = G.layout().slots[id]; G._knock(s.item, 1); G._break(s.item); };
    T.spawnBonus = (type, atPlayer = true) => G.spawnBonus(type, atPlayer);
    T.trigger = n => G.trigger(n);
    T.spite = id => G._spite(id);
    T.gameOver = () => G._gameOver();
    T.screen = () => screen;
    T.info = () => { const S = G.S(); if (!S) return null; const p = S.player; return { t: +S.t.toFixed(2), anger: +S.anger.toFixed(2), stage: S.stage, floor: G.floorCount(), carry: p.carry.map(i => i.type), cap: G.capacity(), score: Math.round(S.score), returned: S.returned, saved: S.saved, broken: S.broken, combo: S.combo, fx: { ...S.fx }, cats: S.cats.map(c => ({ name: c.name, state: c.state, x: Math.round(c.x), lvl: c.lvl })), knocks: S.log.knocks.length, log: { ...S.log, knocks: undefined }, over: S.over, overT: +S.overT.toFixed(2), final: S.final || null, boss: S.boss ? { mode: S.boss.mode, sub: S.boss.sub, mood: S.boss.mood } : null, cameo: !!S.cameo, player: { x: Math.round(p.x), y: Math.round(p.y), action: p.action ? p.action.type : null, mood: p.mood, stun: p.stun > 0, energy: Math.round(p.energy) }, who: S.who, name: S.name }; };
    T.knockLog = () => G.S().log.knocks;
  };
  return U;
})();
MM.UI.boot();
