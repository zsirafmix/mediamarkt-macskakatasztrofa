'use strict';
// WebAudio synthesized sounds + store muzak
MM.Audio = (() => {
  let ac = null, master = null, musicGain = null, sfxGain = null, muted = false, noiseBuf = null;
  let musicOn = false, nextBeat = 0, beat = 0, tempo = 112, intensity = 0;
  const A = {};
  A.init = () => {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    ac = new C(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
    sfxGain = ac.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  };
  A.setMuted = m => { muted = m; if (master) master.gain.value = m ? 0 : 0.8; };
  A.isMuted = () => muted;
  const now = () => ac.currentTime;
  function tone(f, dur, type = 'square', vol = 0.2, t0 = 0, f2 = null, dest = sfxGain) {
    if (!ac) return; const t = now() + t0, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.3, fq = 1200, q = 1, t0 = 0, type = 'bandpass', dest = sfxGain) {
    if (!ac) return; const t = now() + t0, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = fq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  A.sfx = (name, p = 1) => {
    if (!ac || muted) return;
    switch (name) {
      case 'thud': noise(0.18, 0.5 * p, 220, 0.8, 0, 'lowpass'); tone(90, 0.15, 'sine', 0.35 * p, 0, 50); break;
      case 'clatter': for (let i = 0; i < 3; i++) noise(0.06, 0.18, 2500 + i * 900, 3, i * 0.05); tone(700, 0.08, 'triangle', 0.08, 0.02, 400); break;
      case 'crash': noise(0.5, 0.6, 3000, 0.7, 0, 'highpass'); for (let i = 0; i < 7; i++) tone(1800 + Math.random() * 3000, 0.12, 'triangle', 0.08, Math.random() * 0.3); noise(0.25, 0.5, 300, 1, 0, 'lowpass'); break;
      case 'swipe': noise(0.15, 0.25, 1800, 2, 0, 'bandpass'); break;
      case 'meow': { if (!ac) break; const t = now(), o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); const b = 520 * p;
        o.type = 'sawtooth'; o.frequency.setValueAtTime(b, t); o.frequency.linearRampToValueAtTime(b * 1.5, t + 0.15); o.frequency.linearRampToValueAtTime(b * 0.8, t + 0.45);
        f.type = 'bandpass'; f.Q.value = 4; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(1800, t + 0.15); f.frequency.linearRampToValueAtTime(700, t + 0.45);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(f); f.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.55); break; }
      case 'purr': for (let i = 0; i < 8; i++) noise(0.07, 0.12, 120, 2, i * 0.09, 'lowpass'); break;
      case 'pick': tone(520, 0.08, 'square', 0.12, 0, 780); break;
      case 'place': tone(660, 0.09, 'triangle', 0.18); tone(990, 0.14, 'triangle', 0.18, 0.08); break;
      case 'coin': tone(1320, 0.07, 'square', 0.1); tone(1760, 0.18, 'square', 0.1, 0.07); break;
      case 'wrong': tone(160, 0.25, 'sawtooth', 0.18, 0, 120); break;
      case 'jump': tone(300, 0.12, 'square', 0.08, 0, 600); break;
      case 'catch': tone(880, 0.06, 'square', 0.12); tone(1320, 0.1, 'square', 0.12, 0.06); break;
      case 'bonus': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.12, i * 0.07)); break;
      case 'combo': tone(784 * p, 0.1, 'triangle', 0.15); tone(1175 * p, 0.12, 'triangle', 0.12, 0.06); break;
      case 'stumble': tone(400, 0.25, 'triangle', 0.15, 0, 120); noise(0.12, 0.3, 400, 1, 0.15, 'lowpass'); break;
      case 'yell': { if (!ac) break; const t = now(); for (let k = 0; k < 2; k++) { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
        o.type = 'sawtooth'; const b = (k ? 150 : 110) * p; o.frequency.setValueAtTime(b, t); o.frequency.linearRampToValueAtTime(b * 1.35, t + 0.2); o.frequency.linearRampToValueAtTime(b * 0.9, t + 0.6);
        f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 2; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.04); g.gain.setValueAtTime(0.3, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
        o.connect(f); f.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.7); } break; }
      case 'alarm': tone(880, 0.2, 'square', 0.08); tone(660, 0.2, 'square', 0.08, 0.2); break;
      case 'stare': tone(110, 1.2, 'sine', 0.25, 0, 98); tone(233, 1.2, 'triangle', 0.06, 0, 220); for (let i = 0; i < 6; i++) tone(1400 + i * 30, 0.05, 'sine', 0.04, i * 0.2); break;
      case 'banner': tone(392, 0.12, 'square', 0.12); tone(523, 0.12, 'square', 0.12, 0.12); tone(784, 0.25, 'square', 0.12, 0.24); break;
      case 'fired': [392, 370, 349, 330, 311].forEach((f, i) => tone(f, 0.35, 'sawtooth', 0.12, i * 0.28)); tone(130, 1.2, 'sawtooth', 0.12, 1.4, 65); break;
      case 'robot': for (let i = 0; i < 4; i++) tone(300 + i * 150, 0.06, 'square', 0.08, i * 0.06); break;
      case 'step': noise(0.03, 0.06, 900, 1.5); break;
    }
  };
  // --- muzak: bossa-ish electric piano, bass, shaker ---
  const prog = [[57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71]]; // Am7 Dm7 G7 Cmaj7
  const mel = [76, 74, 72, 74, 76, 79, 76, 74, 72, 69, 71, 72, 74, 71, 67, 69];
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  A.music = on => { musicOn = on; if (on && ac) nextBeat = now() + 0.1; };
  A.setIntensity = v => { intensity = v; tempo = 108 + v * 60; };
  A.tick = () => {
    if (!ac || !musicOn || muted) return;
    while (nextBeat < now() + 0.25) {
      const t0 = nextBeat - now(), step = beat % 16, bar = Math.floor(beat / 16) % 4, ch = prog[bar], spb = 60 / tempo / 2;
      if (step % 8 === 0 || step % 8 === 3 || step % 8 === 6) ch.forEach(n => tone(mf(n), spb * 1.6, 'triangle', 0.045, t0, null, musicGain));
      if (step % 4 === 0) tone(mf(ch[0] - 24), spb * 1.8, 'sine', 0.22, t0, null, musicGain);
      if (step % 4 === 2) tone(mf(ch[2] - 24), spb * 1.2, 'sine', 0.16, t0, null, musicGain);
      noise(0.03, step % 2 ? 0.03 : 0.06, 6000, 1, t0, 'highpass', musicGain);
      if (intensity > 0.45 && step % 4 === 0) noise(0.1, 0.12, 150, 1, t0, 'lowpass', musicGain);
      if (step % 2 === 0) { const n = mel[(beat / 2 + bar * 3) % 16 | 0]; if ((beat / 2 | 0) % 3 !== 2) tone(mf(n), spb * 1.7, 'sine', 0.06 + intensity * 0.03, t0, null, musicGain); }
      if (intensity > 0.75 && step % 8 === 4) tone(1760, 0.08, 'square', 0.03, t0, null, musicGain);
      nextBeat += spb; beat++;
    }
  };
  return A;
})();
