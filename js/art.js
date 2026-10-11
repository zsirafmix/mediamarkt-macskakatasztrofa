'use strict';
// All procedural drawing: products, store, characters, cat, boss, icons
MM.Art = (() => {
  const Art = {}, RED = '#e30613', DRED = '#9e0010', INK = '#1d1416';
  Art.RED = RED; Art.INK = INK;
  const imgs = {};
  Art.load = () => Promise.all(['left_head', 'right_head', 'cat_head'].map(n => new Promise(res => {
    const im = new Image(); im.onload = () => { imgs[n] = im; res(); }; im.onerror = () => res(); im.src = 'assets/images/' + n + '.png';
  })));
  Art.img = n => imgs[n];
  // head metadata from faces.py (eye/mouth coords in head image pixels)
  Art.HEADS = {
    left:  { img: 'left_head',  w: 104, h: 134, eyes: [[36.6, 64.9], [63.9, 64.9]], mouth: [50.2, 103.7], hair: null, glasses: false },
    right: { img: 'right_head', w: 107, h: 134, eyes: [[31.1, 75.8], [74.9, 75.8]], mouth: [53.0, 108.2], hair: '#6b4a32', glasses: true },
  };

  // ---------------- products ----------------
  const spr = {};
  function drawProduct(c, t, w, h) {
    c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = INK;
    switch (t) {
      case 'tv': {
        MM.rr(c, 2, 2, w - 4, h - 16, 5); c.fillStyle = '#222'; c.fill(); c.stroke();
        const g = c.createLinearGradient(0, 6, w, h - 18); g.addColorStop(0, '#3a7bd5'); g.addColorStop(0.5, '#a24bd8'); g.addColorStop(1, '#ff6a3d');
        c.fillStyle = g; c.fillRect(8, 8, w - 16, h - 28);
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(8, 8); c.lineTo(w * 0.45, 8); c.lineTo(w * 0.25, h - 20); c.lineTo(8, h - 20); c.fill();
        c.fillStyle = '#fff'; c.font = 'bold 15px Arial Black, Arial'; c.textAlign = 'center'; c.fillText('4K', w / 2, h / 2 - 2);
        c.fillStyle = '#444'; c.fillRect(w / 2 - 6, h - 15, 12, 8); MM.rr(c, w / 2 - 24, h - 9, 48, 7, 3); c.fill(); c.stroke();
        break; }
      case 'laptop': {
        c.fillStyle = '#c9ced6'; c.beginPath(); c.moveTo(4, h - 12); c.lineTo(w - 4, h - 12); c.lineTo(w - 1, h - 3); c.lineTo(1, h - 3); c.closePath(); c.fill(); c.stroke();
        MM.rr(c, 10, 3, w - 20, h - 16, 4); c.fillStyle = '#2b2f36'; c.fill(); c.stroke();
        const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#5ee7df'); g.addColorStop(1, '#3a6ff7');
        c.fillStyle = g; c.fillRect(15, 8, w - 30, h - 26);
        c.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 3; i++) c.fillRect(20, 13 + i * 7, (w - 40) * (0.9 - i * 0.2), 3);
        break; }
      case 'phone': {
        MM.rr(c, 3, 2, w - 6, h - 4, 7); c.fillStyle = '#111'; c.fill(); c.stroke();
        const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ff5f6d'); g.addColorStop(1, '#ffc371');
        MM.rr(c, 6, 6, w - 12, h - 12, 4); c.fillStyle = g; c.fill();
        c.fillStyle = '#111'; MM.rr(c, w / 2 - 5, 7, 10, 3, 1.5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) c.fillRect(9 + j * 8, 16 + i * 9, 5, 5);
        break; }
      case 'headphones': {
        c.lineWidth = 7; c.strokeStyle = INK; c.beginPath(); c.arc(w / 2, h * 0.55, w / 2 - 7, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
        c.lineWidth = 4; c.strokeStyle = '#e8e8e8'; c.beginPath(); c.arc(w / 2, h * 0.55, w / 2 - 7, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
        c.lineWidth = 3; c.strokeStyle = INK;
        [[8, h * 0.62], [w - 8, h * 0.62]].forEach(([x, y]) => { MM.rr(c, x - 7, y - 12, 14, 26, 6); c.fillStyle = RED; c.fill(); c.stroke(); c.fillStyle = '#333'; c.fillRect(x - 3, y - 8, 6, 18); });
        break; }
      case 'keyboard': {
        c.fillStyle = '#26262c'; c.beginPath(); c.moveTo(10, 3); c.lineTo(w - 4, 3); c.lineTo(w - 10, h - 3); c.lineTo(4, h - 3); c.closePath(); c.fill(); c.stroke();
        const cols = ['#ff3b3b', '#ffb13b', '#f7ff3b', '#3bff6e', '#3bd5ff', '#8a3bff'];
        for (let r = 0; r < 3; r++) for (let k = 0; k < 10; k++) { c.fillStyle = cols[(k + r) % 6]; c.globalAlpha = 0.85; c.fillRect(11 + k * 7.4 - r * 1.5, 7 + r * 6.5, 5.5, 4.5); }
        c.globalAlpha = 1; break; }
      case 'coffee': {
        MM.rr(c, 4, 2, w - 8, 16, 4); c.fillStyle = '#333'; c.fill(); c.stroke();
        MM.rr(c, 6, 14, w - 12, h - 18, 4); c.fillStyle = RED; c.fill(); c.stroke();
        c.fillStyle = '#d8d8d8'; c.fillRect(12, 26, w - 24, 22); c.strokeRect(12, 26, w - 24, 22);
        c.fillStyle = '#444'; c.fillRect(w / 2 - 4, 26, 8, 6);
        c.fillStyle = '#fff'; MM.rr(c, w / 2 - 8, 36, 16, 11, 2); c.fill(); c.stroke();
        c.fillStyle = '#6b3b1c'; c.fillRect(w / 2 - 6, 38, 12, 3);
        c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(w - 15, 8, 3, 0, 7); c.fill();
        MM.rr(c, 2, h - 6, w - 4, 5, 2); c.fillStyle = '#222'; c.fill(); break; }
    }
  }
  Art.productSprite = (t, broken) => {
    const k = t + (broken ? '_b' : '');
    if (spr[k]) return spr[k];
    const T = MM.TYPES[t], cv = MM.mkCanvas(T.w + 8, T.h + 8), c = cv.getContext('2d');
    c.translate(4, 4); drawProduct(c, t, T.w, T.h);
    if (broken) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(T.w * 0.3, 4); c.lineTo(T.w * 0.5, T.h * 0.4); c.lineTo(T.w * 0.38, T.h * 0.6); c.lineTo(T.w * 0.6, T.h - 6); c.moveTo(T.w * 0.5, T.h * 0.4); c.lineTo(T.w * 0.8, T.h * 0.35); c.stroke(); }
    spr[k] = cv; return cv;
  };
  // draw product with bottom-center anchor
  Art.drawProduct = (c, t, x, y, rot = 0, sc = 1, alpha = 1, broken = false) => {
    const s = Art.productSprite(t, broken); c.save(); c.globalAlpha *= alpha; c.translate(x, y - s.height / 2 * sc + 4 * sc); c.rotate(rot); c.scale(sc, sc);
    c.drawImage(s, -s.width / 2, -s.height / 2); c.restore();
  };

  // ---------------- store background (parallax) ----------------
  Art.BG_FACTOR = 0.5;
  Art.offices = [];
  Art.buildBackground = () => {
    const bw = Math.ceil((MM.WORLD_W - MM.W) * Art.BG_FACTOR + MM.W), cv = MM.mkCanvas(bw, MM.H), c = cv.getContext('2d');
    // ceiling
    let g = c.createLinearGradient(0, 0, 0, 110); g.addColorStop(0, '#2a2a30'); g.addColorStop(1, '#46464e'); c.fillStyle = g; c.fillRect(0, 0, bw, 110);
    c.fillStyle = '#5c5c66'; for (let x = 0; x < bw; x += 64) c.fillRect(x, 0, 2, 110);
    for (let x = 40; x < bw; x += 220) { c.fillStyle = '#fffbe6'; c.shadowColor = '#fff6c8'; c.shadowBlur = 18; c.fillRect(x, 40, 120, 8); c.shadowBlur = 0; }
    // back wall upper red
    g = c.createLinearGradient(0, 110, 0, 420); g.addColorStop(0, '#c4000f'); g.addColorStop(1, '#8e000b'); c.fillStyle = g; c.fillRect(0, 110, bw, 310);
    // big sign(s)
    for (let x = 120; x < bw; x += 1250) {
      c.save(); c.translate(x, 130);
      c.fillStyle = '#fff'; MM.rr(c, 0, 0, 470, 92, 10); c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
      c.font = '900 64px "Arial Black", Impact, Arial'; c.textBaseline = 'middle'; c.textAlign = 'left';
      c.fillStyle = INK; c.fillText('MEDIA', 22, 50); c.fillStyle = RED; c.fillText('MARKT', 236, 50);
      c.restore();
      c.save(); c.translate(x + 30, 240); c.fillStyle = '#fff'; c.font = 'italic 900 26px "Arial Black", Arial'; c.fillText('„Mert hülye azért nem vagyok…', 0, 0);
      c.fillStyle = '#ffd400'; c.fillText('…de a macska igen!”', 120, 34); c.restore();
      // TV wall
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
        const tx = x + 620 + i * 120, ty = 130 + j * 82; c.fillStyle = '#111'; c.fillRect(tx, ty, 110, 72); c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(tx, ty, 110, 72);
        const gg = c.createLinearGradient(tx, ty, tx + 110, ty + 72); const hues = [200, 280, 20, 140, 330, 50, 180, 260]; const h = hues[i + j * 4];
        gg.addColorStop(0, `hsl(${h},80%,55%)`); gg.addColorStop(1, `hsl(${h + 60},80%,40%)`); c.fillStyle = gg; c.fillRect(tx + 5, ty + 5, 100, 62);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(tx + 5, ty + 5, 40, 62);
      }
      // office window (boss)
      const ox = x + 1110 - 80; Art.offices.push(ox);
      c.fillStyle = '#d9d2c3'; c.fillRect(ox - 10, 150, 150, 130); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(ox - 10, 150, 150, 130);
      c.fillStyle = '#9fc6d9'; c.fillRect(ox, 160, 130, 95); c.fillStyle = 'rgba(255,255,255,0.4)'; for (let k = 0; k < 6; k++) c.fillRect(ox, 162 + k * 16, 130, 5);
      c.fillStyle = INK; c.font = 'bold 15px Arial'; c.textAlign = 'center'; c.fillText('FŐNÖKI IRODA', ox + 65, 273); c.textAlign = 'left';
    }
    // lower wall + background shelves
    c.fillStyle = '#d7d3cc'; c.fillRect(0, 420, bw, 240);
    c.fillStyle = '#bdb8b0'; for (let x = 0; x < bw; x += 300) {
      c.fillRect(x + 20, 440, 240, 220); c.fillStyle = '#a9a39a'; for (let k = 0; k < 4; k++) c.fillRect(x + 20, 480 + k * 45, 240, 6);
      // speakers & boxes on back shelves
      for (let k = 0; k < 4; k++) for (let m = 0; m < 5; m++) { const bx = x + 32 + m * 45, by = 446 + k * 45; c.fillStyle = (m + k) % 2 ? '#3c3c44' : '#8a8f9a'; c.fillRect(bx, by, 32, 32); c.fillStyle = '#222'; c.beginPath(); c.arc(bx + 16, by + 19, 8, 0, 7); c.fill(); c.fillStyle = '#666'; c.beginPath(); c.arc(bx + 16, by + 8, 3, 0, 7); c.fill(); }
      c.fillStyle = '#bdb8b0';
    }
    c.fillStyle = 'rgba(215,211,204,0.45)'; c.fillRect(0, 420, bw, 240);
    Art.bg = cv; Art.bgW = bw;
  };
  // world layer: shelves, stools, exit
  Art.buildWorld = (units, stools) => {
    const cv = MM.mkCanvas(MM.WORLD_W, MM.H), c = cv.getContext('2d');
    // exit door
    c.fillStyle = '#7d8a91'; c.fillRect(60, 300, 190, 360); c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(60, 300, 190, 360);
    c.fillStyle = '#b9dceb'; c.fillRect(72, 312, 80, 340); c.fillRect(158, 312, 80, 340); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(80, 320, 20, 320); c.fillRect(166, 320, 20, 320);
    c.fillStyle = '#1aa14a'; MM.rr(c, 70, 240, 170, 48, 8); c.fill(); c.lineWidth = 4; c.stroke();
    c.fillStyle = '#fff'; c.font = '900 26px "Arial Black", Arial'; c.textAlign = 'center'; c.fillText('KIJÁRAT', 155, 274);
    for (const u of units) {
      const x = u.x, w = MM.UNIT_W;
      // hanging sign
      c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2 - 70, 0); c.lineTo(x + w / 2 - 70, 120); c.moveTo(x + w / 2 + 70, 0); c.lineTo(x + w / 2 + 70, 120); c.stroke();
      c.fillStyle = RED; MM.rr(c, x + w / 2 - 110, 118, 220, 50, 8); c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.stroke();
      c.fillStyle = '#fff'; c.font = '900 24px "Arial Black", Arial'; c.fillText(u.sign, x + w / 2, 152);
      // depth side (2.5D)
      c.fillStyle = '#7a000a'; c.beginPath(); c.moveTo(x + w, MM.TOP); c.lineTo(x + w + 18, MM.TOP - 14); c.lineTo(x + w + 18, MM.FLOOR - 14); c.lineTo(x + w, MM.FLOOR); c.fill();
      c.fillStyle = '#5a0008'; c.beginPath(); c.moveTo(x, MM.TOP); c.lineTo(x + 18, MM.TOP - 14); c.lineTo(x + w + 18, MM.TOP - 14); c.lineTo(x + w, MM.TOP); c.fill();
      // back panel (pegboard)
      c.fillStyle = '#ecebe6'; c.fillRect(x, MM.TOP, w, MM.FLOOR - MM.TOP);
      c.fillStyle = '#cfcdc4'; for (let yy = MM.TOP + 12; yy < MM.FLOOR; yy += 18) for (let xx = x + 12; xx < x + w; xx += 18) c.fillRect(xx, yy, 3, 3);
      const sh = c.createLinearGradient(0, MM.TOP, 0, MM.FLOOR); sh.addColorStop(0, 'rgba(0,0,0,0.12)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); c.fillStyle = sh; c.fillRect(x, MM.TOP, w, MM.FLOOR - MM.TOP);
      // uprights
      c.fillStyle = RED; c.fillRect(x - 10, MM.TOP - 6, 14, MM.FLOOR - MM.TOP + 6); c.fillRect(x + w - 4, MM.TOP - 6, 14, MM.FLOOR - MM.TOP + 6);
      c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(x - 10, MM.TOP - 6, 14, MM.FLOOR - MM.TOP + 6); c.strokeRect(x + w - 4, MM.TOP - 6, 14, MM.FLOOR - MM.TOP + 6);
      // top cap
      c.fillStyle = '#2b2b31'; c.fillRect(x - 12, MM.TOP - 8, w + 24, 12); c.strokeRect(x - 12, MM.TOP - 8, w + 24, 12);
      // boards
      for (let b = 0; b < 3; b++) {
        const y = MM.LV[b];
        c.fillStyle = '#9aa0a8'; c.fillRect(x, y, w, 6); c.fillStyle = '#ffffff'; c.fillRect(x, y + 6, w, 16); c.strokeStyle = INK; c.lineWidth = 2.5; c.strokeRect(x, y, w, 22);
        c.fillStyle = RED; c.fillRect(x, y + 6, 6, 16);
      }
      // price tags under slots
      for (const s of u.slots) {
        const T = MM.TYPES[s.type], y = MM.LV[s.board];
        c.fillStyle = '#ffd400'; c.fillRect(s.x - 22, y + 8, 44, 12); c.fillStyle = INK; c.font = 'bold 9px Arial'; c.fillText(MM.fmtNum(T.price) + ' Ft', s.x, y + 18);
      }
      // base plinth
      c.fillStyle = '#2b2b31'; c.fillRect(x - 12, MM.FLOOR - 16, w + 24, 16);
      c.fillStyle = RED; c.font = '900 11px Arial'; c.fillText('MEDIA MARKT', x + w / 2, MM.FLOOR - 4);
    }
    for (const s of stools) {
      c.fillStyle = RED; c.strokeStyle = INK; c.lineWidth = 3;
      c.beginPath(); c.moveTo(s.x - s.w / 2, s.y); c.lineTo(s.x + s.w / 2, s.y); c.lineTo(s.x + s.w / 2 + 8, MM.FLOOR); c.lineTo(s.x - s.w / 2 - 8, MM.FLOOR); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#333'; c.fillRect(s.x - s.w / 2 - 2, s.y - 6, s.w + 4, 8); c.fillStyle = '#b5000c'; c.fillRect(s.x - s.w / 2 + 2, s.y + 50, s.w - 4, 8);
      c.fillStyle = '#fff'; c.font = '900 12px Arial'; c.fillText('LÉPCSŐ', s.x, s.y + 32);
    }
    c.textAlign = 'left';
    Art.world = cv;
  };
  Art.drawFloor = (c, camX) => {
    const y0 = MM.FLOOR, g = c.createLinearGradient(0, y0, 0, MM.H); g.addColorStop(0, '#b9b4ad'); g.addColorStop(1, '#e9e5de');
    c.fillStyle = g; c.fillRect(0, y0, MM.W, MM.H - y0);
    c.strokeStyle = 'rgba(0,0,0,0.13)'; c.lineWidth = 2;
    const off = -(camX % 80);
    for (let x = off - 80; x < MM.W + 160; x += 80) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x + (x - MM.W / 2) * 0.35, MM.H); c.stroke(); }
    c.beginPath(); c.moveTo(0, y0 + 22); c.lineTo(MM.W, y0 + 22); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(0, y0 + 2, MM.W, 6);
  };

  // ---------------- people ----------------
  // p: {who:'left'|'right', dir, phase, moving, air, crouch, carryN, mood, stun, cheer, scared, sprint}
  Art.drawPerson = (c, x, y, p) => {
    const H = Art.HEADS[p.who], im = imgs[H.img], dir = p.dir || 1, ph = p.phase || 0;
    const sw = p.moving ? Math.sin(ph) : 0, bob = p.moving ? Math.abs(Math.cos(ph)) * 3 : 0;
    c.save(); c.translate(x, y); if (p.stumble) c.rotate(dir * Math.min(0.5, p.stumble)); 
    const crouch = p.crouch || 0, legH = 44 - crouch * 14, torsoY = -legH - bob;
    const isL = p.who === 'left';
    c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 3;
    // legs
    const leg = (s, front) => {
      const a = s * 0.6 * (p.air ? 0.3 : 1) + (p.air ? 0.35 * (front ? 1 : -1) : 0), kx = Math.sin(a) * legH * 0.5, fx = Math.sin(a) * legH;
      c.lineWidth = 12; c.strokeStyle = INK; c.beginPath(); c.moveTo(front ? 5 : -5, torsoY); c.lineTo((front ? 5 : -5) + kx, torsoY + legH * 0.5); c.lineTo((front ? 5 : -5) + fx, -2); c.stroke();
      c.lineWidth = 8; c.strokeStyle = isL ? '#cdb998' : '#e6b49a'; c.beginPath(); c.moveTo(front ? 5 : -5, torsoY); c.lineTo((front ? 5 : -5) + kx, torsoY + legH * 0.5); c.lineTo((front ? 5 : -5) + fx, -2); c.stroke();
      if (!isL) { c.lineWidth = 11; c.strokeStyle = '#3d4350'; c.beginPath(); c.moveTo(front ? 5 : -5, torsoY); c.lineTo((front ? 5 : -5) + kx * 0.7, torsoY + legH * 0.38); c.stroke(); }
      // shoe
      c.fillStyle = isL ? '#f4f4f4' : '#2c2c34'; c.lineWidth = 2.5; c.strokeStyle = INK; MM.rr(c, (front ? 5 : -5) + fx - 7 + dir * 3, -7, 16, 8, 3); c.fill(); c.stroke();
    };
    leg(-sw, false); leg(sw, true);
    // torso
    const ty = torsoY - 46;
    c.fillStyle = '#fafafa'; c.lineWidth = 3; c.strokeStyle = INK; MM.rr(c, -17, ty, 34, 48, 9); c.fill(); c.stroke();
    if (isL) { c.fillStyle = '#cdb998'; c.fillRect(-17, torsoY - 6, 34, 8); c.strokeRect(-17, torsoY - 6, 34, 8); }
    else { c.fillStyle = '#3d4350'; c.fillRect(-17, torsoY - 7, 34, 9); c.strokeRect(-17, torsoY - 7, 34, 9); }
    // vest (MediaMarkt staff)
    c.fillStyle = RED; c.beginPath(); c.moveTo(-17, ty + 4); c.lineTo(-6, ty + 2); c.lineTo(-5, ty + 46); c.lineTo(-17, ty + 46); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(17, ty + 4); c.lineTo(6, ty + 2); c.lineTo(5, ty + 46); c.lineTo(17, ty + 46); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.font = 'bold 6px Arial'; c.textAlign = 'center'; c.fillText('MM', dir > 0 ? 11 : -11, ty + 16);
    if (!isL) { // butterfly print + belt bag
      c.fillStyle = '#ffcf33'; c.beginPath(); c.ellipse(-2, ty + 18, 3, 5, -0.5, 0, 7); c.ellipse(2, ty + 18, 3, 5, 0.5, 0, 7); c.fill();
      c.fillStyle = '#222'; c.beginPath(); c.moveTo(-12, ty + 2); c.lineTo(14, ty + 30); c.lineTo(10, ty + 33); c.lineTo(-15, ty + 6); c.fill();
      c.fillStyle = '#1a1a1e'; MM.rr(c, -1, ty + 24, 20, 13, 6); c.fill(); c.stroke();
    } else { c.strokeStyle = '#111'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(-13, ty + 3); c.lineTo(14, ty + 44); c.stroke(); c.lineWidth = 3; c.strokeStyle = INK; }
    // arms
    const skin = isL ? '#e9b896' : '#f0c2a6';
    const arm = (side) => {
      const sx = side * 15, sy = ty + 8; let ex, ey, hx, hy;
      if (p.carryN > 0 && !p.action) { ex = sx + side * 6; ey = sy - 18; hx = side * 9; hy = sy - 38; }
      else if (p.cheer) { ex = sx + side * 10; ey = sy - 16; hx = sx + side * 14; hy = sy - 34 + Math.sin(ph * 3) * 4; }
      else if (p.action) { ex = sx + dir * 12; ey = sy + (p.action === 'pick' ? 14 : -10); hx = sx + dir * 24; hy = sy + (p.action === 'pick' ? 30 : -26); }
      else if (p.scared) { ex = sx + side * 12; ey = sy + 2; hx = sx + side * 10; hy = sy - 16; }
      else { const s = (p.moving ? Math.sin(ph + (side > 0 ? Math.PI : 0)) : 0) * (p.sprint ? 1.4 : 1) + (p.panic ? Math.sin(ph * 4 + side) * 1.2 : 0); ex = sx + side * 2 + s * 8; ey = sy + 16; hx = sx + s * 16; hy = sy + 32 - Math.abs(s) * 4; }
      c.lineWidth = 9; c.strokeStyle = INK; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
      c.lineWidth = 6; c.strokeStyle = skin; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
      c.lineWidth = 7; c.strokeStyle = '#fafafa'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(MM.lerp(sx, ex, 0.4), MM.lerp(sy, ey, 0.4)); c.stroke();
      if (!isL && side === -1) { c.fillStyle = '#111'; c.beginPath(); c.arc(MM.lerp(ex, hx, 0.8), MM.lerp(ey, hy, 0.8), 3.5, 0, 7); c.fill(); }
      c.fillStyle = skin; c.lineWidth = 2; c.strokeStyle = INK; c.beginPath(); c.arc(hx, hy, 4.5, 0, 7); c.fill(); c.stroke();
      return [hx, hy];
    };
    arm(-1); const hand = arm(1);
    // head
    const hs = 60 / H.h, hw = H.w * hs, hh = H.h * hs, hx = dir * 2, hy = ty - hh + 12 + (p.carryN && !p.action ? 2 : 0);
    if (!isL) { // long hair falling behind the shoulders
      c.fillStyle = H.hair; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-hw / 2 + 4, hy + hh * 0.4); c.quadraticCurveTo(-hw / 2 - 2, hy + hh * 1.05, -hw / 2 + 8, hy + hh * 1.12);
      c.lineTo(hw / 2 - 8, hy + hh * 1.12); c.quadraticCurveTo(hw / 2 + 2, hy + hh * 1.05, hw / 2 - 4, hy + hh * 0.4); c.closePath(); c.fill(); c.stroke(); }
    c.save(); c.translate(hx, hy + hh / 2); if (p.stun) c.rotate(Math.sin(ph * 5) * 0.15); else if (p.panic) c.rotate(Math.sin(ph * 2.3) * 0.07);
    if (dir < 0) c.scale(-1, 1);
    if (im) c.drawImage(im, -hw / 2, -hh / 2, hw, hh); else { c.fillStyle = skin; MM.ell(c, 0, 0, hw / 2, hh / 2); c.fill(); }
    // expression overlays (in head coords)
    const E = H.eyes.map(e => [(e[0] - H.w / 2) * hs, (e[1] - H.h / 2) * hs]), M = [(H.mouth[0] - H.w / 2) * hs, (H.mouth[1] - H.h / 2) * hs];
    const mood = p.mood || 'ok';
    c.strokeStyle = INK; c.lineWidth = 2.2;
    if (mood === 'panic' || mood === 'scared' || mood === 'worried') { // worried brows
      for (let i = 0; i < 2; i++) { const [ex, ey] = E[i], s = i ? 1 : -1; c.beginPath(); c.moveTo(ex - s * 6, ey - 8); c.lineTo(ex + s * 4, ey - 12); c.stroke(); }
    }
    if (mood === 'panic' || mood === 'scared') {
      c.fillStyle = '#5a1a1a'; MM.ell(c, M[0], M[1] + 1, 4.5, mood === 'scared' ? 6.5 : 4.5); c.fill(); c.stroke();
      if (mood === 'scared' && !H.glasses) for (const [ex, ey] of E) { c.fillStyle = '#fff'; MM.ell(c, ex, ey, 5, 5); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(ex, ey, 1.6, 0, 7); c.fill(); }
    } else if (mood === 'cheer') {
      c.fillStyle = '#5a1a1a'; c.beginPath(); c.arc(M[0], M[1] - 1, 6, 0, Math.PI); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.fillRect(M[0] - 4, M[1] - 1, 8, 2);
    } else if (mood === 'effort') { c.beginPath(); c.moveTo(M[0] - 5, M[1]); c.lineTo(M[0] + 5, M[1]); c.stroke(); }
    if (p.blush) { c.fillStyle = 'rgba(255,60,60,0.35)'; MM.ell(c, E[0][0] - 2, E[0][1] + 10, 6, 3); c.fill(); MM.ell(c, E[1][0] + 2, E[1][1] + 10, 6, 3); c.fill(); }
    c.restore();
    // sweat drops
    if (p.sweat > 0) {
      const n = p.sweat > 0.7 ? 3 : p.sweat > 0.4 ? 2 : 1;
      for (let i = 0; i < n; i++) { const t = ((p.time || 0) * 1.4 + i * 0.37) % 1, sx = hx + (i % 2 ? 1 : -1) * (hw / 2 + 2), sy = hy + 12 + t * 26;
        c.globalAlpha = 1 - t; c.fillStyle = '#8fd3ff'; c.strokeStyle = '#2a6f9e'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(sx, sy - 7); c.quadraticCurveTo(sx + 5, sy, sx, sy + 3); c.quadraticCurveTo(sx - 5, sy, sx, sy - 7); c.fill(); c.stroke(); c.globalAlpha = 1; }
    }
    if (p.stun) { for (let i = 0; i < 3; i++) { const a = (p.time || 0) * 6 + i * 2.1; drawStar(c, hx + Math.cos(a) * 24, hy - 4 + Math.sin(a) * 6, 5, '#ffd400'); } }
    c.restore();
    return { headTop: y + hy, hand: [x + hand[0], y + hand[1]] };
  };
  function drawStar(c, x, y, r, col) { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); c.stroke(); }
  Art.drawStar = drawStar;

  // ---------------- cat ----------------
  Art.CAT_PAL = {
    dagadek: { back: '#56555e', dark: '#3d3c44', white: '#f6f5f1', eye: '#e9c74b', nose: '#f19aa6' },
    barat:   { back: '#e08a3c', dark: '#b8662a', white: '#fff6ea', eye: '#7fd16b', nose: '#e8818f' },
  };
  // k: {x,y,dir,pal,mode:'walk'|'run'|'stand'|'sit'|'roll'|'hop', phase, paw(0-1), tail(0-1 swipe), look:[dx,dy], innocent, smug, eyesBig, blink}
  Art.drawCat = (c, k) => {
    const P = Art.CAT_PAL[k.pal || 'dagadek'], dir = k.dir || 1, ph = k.phase || 0;
    c.save(); c.translate(k.x, k.y); c.scale(dir * (k.scale || 1), k.scale || 1);
    c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 3;
    const mode = k.mode || 'stand';
    if (mode === 'sit') { drawCatSit(c, k, P); c.restore(); return; }
    if (mode === 'roll') { drawCatRoll(c, k, P); c.restore(); return; }
    const run = mode === 'run', walk = mode === 'walk' || run, st = run ? 1.4 : 1;
    const bodyY = -28 - (walk ? Math.abs(Math.sin(ph)) * (run ? 5 : 2) : 0) + (mode === 'hop' ? -2 : 0);
    // tail
    const tw = k.tail || 0, tsw = Math.sin((k.time || 0) * 3) * 0.25;
    c.lineWidth = 14; c.strokeStyle = INK; c.beginPath(); const tx0 = -36, ty0 = bodyY - 6;
    const tA = -0.9 + tsw - tw * 2.2, tlen = 46;
    const tcx = tx0 - Math.cos(tA) * tlen * 0.6, tcy = ty0 + Math.sin(tA) * tlen * 0.7, tex = tx0 - Math.cos(tA - 0.6) * tlen + (tw * 30), tey = ty0 + Math.sin(tA - 0.6) * tlen - (tw * 4);
    c.moveTo(tx0, ty0); c.quadraticCurveTo(tcx, tcy, tex, tey); c.stroke();
    c.lineWidth = 9; c.strokeStyle = P.back; c.beginPath(); c.moveTo(tx0, ty0); c.quadraticCurveTo(tcx, tcy, tex, tey); c.stroke();
    // back legs
    const legs = [[-20, 0.0], [-8, Math.PI], [14, Math.PI * 0.5], [26, Math.PI * 1.5]];
    const drawLeg = (lx, lp, front, paw) => {
      let a = walk ? Math.sin(ph * st + lp) * (run ? 0.75 : 0.45) : 0; let len = 22;
      if (mode === 'hop') a = front ? -0.7 : 0.7;
      c.save(); c.translate(lx, bodyY + 10);
      if (paw) { c.rotate(-paw * 2.1); len = 22 + paw * 4; } else c.rotate(a);
      c.lineWidth = 14; c.strokeStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, len); c.stroke();
      c.lineWidth = 9; c.strokeStyle = front ? P.white : P.back; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, len - 4); c.stroke();
      c.fillStyle = P.white; c.lineWidth = 2.5; c.strokeStyle = INK; MM.ell(c, 2, len, 8, 5.5); c.fill(); c.stroke();
      if (paw > 0.3) { c.fillStyle = P.nose; for (let i = 0; i < 3; i++) { MM.ell(c, -3 + i * 3, len + 1.5, 1.4, 1.4); c.fill(); } }
      c.restore();
    };
    drawLeg(legs[1][0], legs[1][1], false); drawLeg(legs[3][0], legs[3][1], true);
    // body (chubby)
    c.fillStyle = P.back; c.lineWidth = 3; c.strokeStyle = INK; MM.ell(c, 0, bodyY, 40, 25); c.fill(); c.stroke();
    c.fillStyle = P.back; MM.ell(c, -4, bodyY + 10, 34, 16); c.fill();
    c.fillStyle = P.dark; MM.ell(c, -6, bodyY - 12, 28, 10); c.fill();
    c.fillStyle = P.white; c.beginPath(); c.ellipse(4, bodyY + 4, 8, 22, 0.3, 0, 7); c.fill(); // white belly band (like the photo)
    c.beginPath(); c.ellipse(26, bodyY + 4, 13, 18, -0.2, 0, 7); c.fill(); // chest
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(-4, bodyY + 12, 33, 14, 0, 0.2, Math.PI - 0.2); c.stroke();
    drawLeg(legs[0][0], legs[0][1], false); drawLeg(legs[2][0], legs[2][1], true, k.paw || 0);
    // head
    const hx = 34 + (k.headDx || 0), hy = bodyY - 18 + (walk ? Math.sin(ph * st) * 1.5 : 0);
    drawCatHead(c, hx, hy, k, P, 1);
    c.restore();
  };
  function drawCatHead(c, hx, hy, k, P, s) {
    c.save(); c.translate(hx, hy); c.scale(s, s);
    // ears
    for (const sx of [-1, 1]) {
      c.fillStyle = P.back; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(sx * 6, -14); c.lineTo(sx * 16, -30); c.lineTo(sx * 21, -8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = P.nose; c.beginPath(); c.moveTo(sx * 9, -14); c.lineTo(sx * 15.5, -25); c.lineTo(sx * 18, -11); c.closePath(); c.fill();
    }
    c.fillStyle = P.back; MM.ell(c, 0, 0, 23, 19); c.fill(); c.stroke();
    // cheeks fluff
    c.fillStyle = P.back; MM.ell(c, -18, 7, 8, 7); c.fill(); MM.ell(c, 18, 7, 8, 7); c.fill();
    // white blaze + muzzle
    c.fillStyle = P.white; c.beginPath(); c.moveTo(-3, -18); c.lineTo(3, -18); c.lineTo(7, 2); c.lineTo(-7, 2); c.closePath(); c.fill();
    MM.ell(c, 0, 8, 12, 9); c.fill();
    // eyes
    const big = k.eyesBig || (k.innocent ? 1 : 0), look = k.look || [0, 0];
    for (const sx of [-1, 1]) {
      const ex = sx * 10, ey = -3, rx = 6 + big * 2.5, ry = (k.smug ? 3 : 6) + big * 3;
      if (k.blink) { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ex - 6, ey); c.quadraticCurveTo(ex, ey + 3, ex + 6, ey); c.stroke(); continue; }
      c.fillStyle = P.eye; c.strokeStyle = INK; c.lineWidth = 2; MM.ell(c, ex, ey, rx, ry); c.fill(); c.stroke();
      c.fillStyle = INK; const px = ex + MM.clamp(look[0], -1, 1) * 2.5, py = ey + MM.clamp(look[1], -1, 1) * 2;
      if (big) MM.ell(c, px, py, rx * 0.6, ry * 0.65); else MM.ell(c, px, py, k.stare ? 1.3 : 2, ry * 0.8); c.fill();
      if (big) { c.fillStyle = '#fff'; MM.ell(c, px - 2, py - 3, 2.4, 2.4); c.fill(); MM.ell(c, px + 2, py + 2, 1.2, 1.2); c.fill(); }
      if (k.smug) { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ex - 7, ey - 4 + sx); c.lineTo(ex + 7, ey - 4 - sx * 1.5); c.stroke(); }
    }
    // nose & mouth
    c.fillStyle = P.nose; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3.5, 4); c.lineTo(3.5, 4); c.lineTo(0, 8); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0, 8); c.quadraticCurveTo(-3, 12, -6, 10); c.moveTo(0, 8); c.quadraticCurveTo(3, 12, 6, 10); c.stroke();
    if (k.meow) { c.fillStyle = '#7a1a2a'; MM.ell(c, 0, 13, 3.5, 3); c.fill(); }
    // whiskers
    c.strokeStyle = 'rgba(30,20,20,0.7)'; c.lineWidth = 1; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sx * 8, 8 + i * 2); c.lineTo(sx * 26, 4 + i * 5); c.stroke(); }
    if (k.innocent) { c.strokeStyle = '#ffd400'; c.lineWidth = 3; MM.ell(c, 0, -36, 15, 4); c.stroke(); }
    c.restore();
  }
  Art.drawCatHead = (c, x, y, k, s) => drawCatHead(c, x, y, k, Art.CAT_PAL[k.pal || 'dagadek'], s);
  function drawCatSit(c, k, P) {
    // tail wrap
    c.lineWidth = 13; c.strokeStyle = INK; c.beginPath(); c.moveTo(-16, -8); c.quadraticCurveTo(-34, -4 + Math.sin((k.time || 0) * 2) * 3, -10 + Math.sin((k.time || 0) * 2) * 4, 0); c.stroke();
    c.lineWidth = 8; c.strokeStyle = P.back; c.stroke();
    c.fillStyle = P.back; c.strokeStyle = INK; c.lineWidth = 3; MM.ell(c, 0, -28, 27, 29); c.fill(); c.stroke();
    c.fillStyle = P.white; MM.ell(c, 4, -24, 14, 22); c.fill();
    // front paws
    for (const sx of [-6, 10]) { c.fillStyle = P.white; c.strokeStyle = INK; c.lineWidth = 2.5; MM.ell(c, sx, -4, 8, 5.5); c.fill(); c.stroke(); }
    if (k.paw) { c.save(); c.translate(16, -30); c.rotate(-k.paw * 1.6); c.lineWidth = 13; c.strokeStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 22); c.stroke(); c.lineWidth = 8; c.strokeStyle = P.white; c.stroke(); c.fillStyle = P.white; c.lineWidth = 2.5; c.strokeStyle = INK; MM.ell(c, 1, 23, 7, 5); c.fill(); c.stroke(); c.restore(); }
    drawCatHead(c, 6, -64, k, P, 1);
  }
  function drawCatRoll(c, k, P) {
    const t = k.time || 0;
    c.rotate(Math.sin(t * 4) * 0.25);
    c.fillStyle = P.back; c.strokeStyle = INK; c.lineWidth = 3; MM.ell(c, 0, -20, 38, 20); c.fill(); c.stroke();
    c.fillStyle = P.white; MM.ell(c, 0, -30, 26, 10); c.fill();
    for (let i = 0; i < 4; i++) { const lx = -24 + i * 16, a = Math.sin(t * 8 + i) * 0.4; c.save(); c.translate(lx, -34); c.rotate(Math.PI + a); c.lineWidth = 12; c.strokeStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 16); c.stroke(); c.lineWidth = 7; c.strokeStyle = P.white; c.stroke(); c.restore(); }
    // catnip toy
    const ty = -62 + Math.abs(Math.sin(t * 6)) * -10; c.fillStyle = '#4caf50'; c.strokeStyle = INK; c.lineWidth = 2; MM.ell(c, 4, ty, 9, 6, t * 3); c.fill(); c.stroke();
    drawCatHead(c, 36, -18, Object.assign({}, k, { blink: Math.sin(t * 3) > 0.3, look: [0, -1] }), P, 0.95);
  }

  // ---------------- boss ----------------
  // o: {anger 0..1, mood:'calm'|'sus'|'phone'|'yell'|'rage'|'point', dir, phase, moving, time}
  Art.drawBoss = (c, x, y, o, s = 1) => {
    const dir = o.dir || 1, ph = o.phase || 0, sw = o.moving ? Math.sin(ph) : 0, t = o.time || 0;
    c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
    const rage = MM.clamp(o.anger || 0, 0, 1), skin = `rgb(${MM.lerp(240, 230, rage) | 0},${MM.lerp(190, 60, rage) | 0},${MM.lerp(160, 50, rage) | 0})`;
    // legs
    for (const s2 of [-1, 1]) { c.lineWidth = 15; c.strokeStyle = INK; c.beginPath(); c.moveTo(s2 * 9, -50); c.lineTo(s2 * 9 + sw * s2 * 14, -4); c.stroke(); c.lineWidth = 11; c.strokeStyle = '#26262c'; c.stroke();
      c.fillStyle = '#111'; MM.rr(c, s2 * 9 + sw * s2 * 14 - 9 + dir * 4, -9, 20, 9, 4); c.fill(); }
    // body (belly)
    c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 3; MM.ell(c, 0, -82, 34, 40); c.fill(); c.stroke();
    c.fillStyle = '#26262c'; c.beginPath(); c.moveTo(-34, -84); c.quadraticCurveTo(-36, -50, -26, -48); c.lineTo(-10, -60); c.lineTo(-14, -118); c.quadraticCurveTo(-30, -112, -34, -84); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(34, -84); c.quadraticCurveTo(36, -50, 26, -48); c.lineTo(10, -60); c.lineTo(14, -118); c.quadraticCurveTo(30, -112, 34, -84); c.fill(); c.stroke();
    c.fillStyle = RED; c.beginPath(); c.moveTo(-4, -118); c.lineTo(4, -118); c.lineTo(7, -72); c.lineTo(0, -64); c.lineTo(-7, -72); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = RED; MM.rr(c, 14, -104, 20, 9, 2); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 6px Arial'; c.textAlign = 'center'; c.fillText('FŐNÖK', 24, -97.5);
    // arms
    const pd = o.pointDir || -dir;
    const arm = (side, mode) => {
      let pts; const sx = side * 30, sy = -108;
      if (mode === 'phone' && side === dir) pts = [[sx + side * 4, sy + 22], [side * 14, sy - 26]];
      else if (mode === 'point' && side === pd) pts = [[sx + pd * 22, sy - 2], [sx + pd * 52, sy - 8]];
      else if ((mode === 'yell' || mode === 'rage') ) { const w = Math.sin(t * (mode === 'rage' ? 18 : 10) + side) * 10; pts = [[sx + side * 16, sy - 12 + w], [sx + side * 18, sy - 38 + w]]; }
      else if (mode === 'sus' && side === dir) pts = [[sx + side * 6, sy + 24], [side * 10, sy + 34]];
      else { const a = o.moving ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 12 : 0; pts = [[sx + side * 4 + a * 0.5, sy + 26], [sx + side * 2 + a, sy + 50]]; }
      c.lineWidth = 15; c.strokeStyle = INK; c.beginPath(); c.moveTo(sx, sy); c.lineTo(...pts[0]); c.lineTo(...pts[1]); c.stroke();
      c.lineWidth = 11; c.strokeStyle = '#26262c'; c.stroke();
      c.fillStyle = skin; c.lineWidth = 2.5; c.strokeStyle = INK; c.beginPath(); c.arc(pts[1][0], pts[1][1], 7, 0, 7); c.fill(); c.stroke();
      if (mode === 'phone' && side === dir) { c.fillStyle = '#111'; MM.rr(c, pts[1][0] - 5, pts[1][1] - 12, 9, 18, 2); c.fill(); }
      if (mode === 'point' && side === pd) { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(pts[1][0], pts[1][1]); c.lineTo(pts[1][0] + pd * 14, pts[1][1] - 2); c.stroke(); c.strokeStyle = skin; c.lineWidth = 3; c.stroke(); }
    };
    arm(-1, o.mood); arm(1, o.mood);
    // head
    const hy = -146 + (o.mood === 'rage' ? Math.sin(t * 30) * 1.5 : 0);
    c.fillStyle = skin; c.strokeStyle = INK; c.lineWidth = 3; MM.ell(c, 0, hy, 26, 29); c.fill(); c.stroke();
    MM.ell(c, -26, hy + 2, 5, 8); c.fill(); c.stroke(); MM.ell(c, 26, hy + 2, 5, 8); c.fill(); c.stroke();
    c.fillStyle = '#8b8b8b'; MM.ell(c, -20, hy - 8, 8, 12); c.fill(); MM.ell(c, 20, hy - 8, 8, 12); c.fill();
    c.strokeStyle = '#777'; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, hy - 26); c.quadraticCurveTo(4, hy - 32, 14, hy - 22); c.stroke(); // comb-over
    c.fillStyle = 'rgba(255,255,255,0.5)'; MM.ell(c, -8, hy - 18, 8, 4, -0.3); c.fill();
    // eyes + glasses
    const m = o.mood;
    for (const sx of [-1, 1]) {
      const ex = sx * 10 + dir * 2, ey = hy - 4;
      c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 2;
      const ry = m === 'sus' ? 2.5 : (m === 'rage' || m === 'yell') ? 5 : 4;
      MM.ell(c, ex, ey, 5, ry); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(ex + dir * 1.5, ey, m === 'rage' ? 1.2 : 2, 0, 7); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(ex, ey, 8, 0, 7); c.stroke();
      // brows
      c.lineWidth = 4; c.beginPath();
      if (m === 'calm') { c.moveTo(ex - 6, ey - 11); c.lineTo(ex + 6, ey - 12); }
      else if (m === 'sus') { if (sx > 0) { c.moveTo(ex - 6, ey - 16); c.lineTo(ex + 6, ey - 13); } else { c.moveTo(ex - 6, ey - 9); c.lineTo(ex + 6, ey - 10); } }
      else { c.moveTo(ex - sx * 7, ey - 15); c.lineTo(ex + sx * 6, ey - 8); }
      c.stroke();
    }
    c.lineWidth = 2; c.beginPath(); c.moveTo(-2, hy - 4); c.lineTo(2, hy - 4); c.stroke();
    // nose, mustache, mouth
    c.fillStyle = skin; MM.ell(c, dir * 3, hy + 5, 6, 5); c.fill(); c.stroke();
    if (m === 'yell' || m === 'rage' || m === 'point') { c.fillStyle = '#5a0f12'; MM.ell(c, 0, hy + 18, 10, 7 + Math.abs(Math.sin(t * 14)) * 3); c.fill(); c.stroke(); c.fillStyle = '#e85a6a'; MM.ell(c, 0, hy + 22, 5, 2.5); c.fill(); }
    else if (m === 'phone') { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-7, hy + 19); c.lineTo(7, hy + 19 + Math.sin(t * 9) * 2); c.stroke(); }
    else if (m === 'calm') { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.arc(0, hy + 14, 7, 0.3, Math.PI - 0.3); c.stroke(); }
    else { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-6, hy + 19); c.lineTo(6, hy + 17); c.stroke(); }
    c.fillStyle = '#5b4636'; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(0, hy + 10); c.quadraticCurveTo(-14, hy + 8, -17, hy + 16); c.quadraticCurveTo(-8, hy + 14, 0, hy + 13); c.quadraticCurveTo(8, hy + 14, 17, hy + 16); c.quadraticCurveTo(14, hy + 8, 0, hy + 10); c.fill(); c.stroke();
    if (m === 'rage') { for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) { const tt = (t * 1.6 + i * 0.5) % 1; c.globalAlpha = 1 - tt; c.fillStyle = '#eee'; MM.ell(c, sx * (30 + tt * 16), hy - 4 - tt * 30, 6 + tt * 8, 5 + tt * 6); c.fill(); c.globalAlpha = 1; } }
    if (rage > 0.55 && m !== 'calm') { c.strokeStyle = '#b00'; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, hy - 22); c.lineTo(-10, hy - 18); c.lineTo(-14, hy - 16); c.stroke(); }
    c.restore();
  };

  // ---------------- bonus icons ----------------
  Art.drawBonus = (c, type, x, y, r) => {
    c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = INK;
    c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
    c.lineWidth = 2.5; const s = r / 22; c.scale(s, s);
    switch (type) {
      case 'coffee': c.fillStyle = '#fff'; MM.rr(c, -10, -6, 18, 18, 3); c.fill(); c.stroke(); c.beginPath(); c.arc(9, 3, 5, -1.4, 1.4); c.stroke(); c.fillStyle = '#6b3b1c'; c.fillRect(-8, -4, 14, 4);
        c.strokeStyle = '#999'; for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(-4 + i * 6, -9); c.quadraticCurveTo(-8 + i * 6, -14, -4 + i * 6, -18); c.stroke(); } break;
      case 'catnip': c.fillStyle = '#4caf50'; c.beginPath(); c.ellipse(-5, 0, 6, 12, -0.6, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(6, 0, 6, 12, 0.6, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 6); c.lineTo(0, 15); c.stroke(); break;
      case 'cart': c.fillStyle = RED; c.beginPath(); c.moveTo(-14, -8); c.lineTo(12, -8); c.lineTo(8, 6); c.lineTo(-10, 6); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(12, -8); c.lineTo(16, -12); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(-7, 11, 3, 0, 7); c.arc(5, 11, 3, 0, 7); c.fill(); break;
      case 'vacation': c.fillStyle = '#ffd400'; c.beginPath(); c.arc(8, -8, 6, 0, 7); c.fill(); c.strokeStyle = '#8a5a2b'; c.lineWidth = 4; c.beginPath(); c.moveTo(-4, 14); c.quadraticCurveTo(-2, 0, -6, -6); c.stroke(); c.fillStyle = '#2e9e44'; c.strokeStyle = INK; c.lineWidth = 2;
        for (const a of [-2.6, -1.9, -1.2, -0.4]) { c.beginPath(); c.ellipse(-6 + Math.cos(a) * 8, -6 + Math.sin(a) * 6, 9, 3.5, a, 0, 7); c.fill(); c.stroke(); } break;
      case 'robot': c.fillStyle = '#9aa7b4'; MM.rr(c, -10, -12, 20, 16, 4); c.fill(); c.stroke(); c.fillStyle = '#3bd5ff'; c.fillRect(-6, -7, 4, 4); c.fillRect(2, -7, 4, 4); c.fillStyle = '#9aa7b4'; c.fillRect(-7, 5, 14, 9); c.strokeRect(-7, 5, 14, 9); c.beginPath(); c.moveTo(0, -12); c.lineTo(0, -17); c.stroke(); c.fillStyle = RED; c.beginPath(); c.arc(0, -18, 2.5, 0, 7); c.fill(); break;
    }
    c.restore();
  };
  return Art;
})();
