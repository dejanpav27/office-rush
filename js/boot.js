/* ═══════════════════════════════════════════
   OFFICE RUSH — CRT Boot Sequence
   boot.js — runs before game.js shows modeScreen
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── audio context for beeps ── */
  let _ac = null;
  function getAC() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    return _ac;
  }

  function beep(freq, dur, vol, type) {
    try {
      const ac = getAC();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = type || 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.06, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + dur);
    } catch (e) {}
  }

  function crtPowerSound() {
    try {
      const ac = getAC();
      // low hum sweep
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(40, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(180, ac.currentTime + 0.4);
      g.gain.setValueAtTime(0.08, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.5);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + 0.5);
    } catch (e) {}
  }

  function biosBeep() {
    beep(880, 0.08, 0.05, 'square');
  }

  function confirmBeep() {
    beep(440, 0.05, 0.05, 'square');
    setTimeout(() => beep(660, 0.1, 0.05, 'square'), 60);
  }

  function hddSound() {
    try {
      const ac = getAC();
      // short noise bursts
      for (let i = 0; i < 6; i++) {
        const buf = ac.createBuffer(1, ac.sampleRate * 0.04, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * 0.3;
        const src = ac.createBufferSource();
        const g = ac.createGain();
        src.buffer = buf;
        src.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.06, ac.currentTime + i * 0.32);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.32 + 0.08);
        src.start(ac.currentTime + i * 0.32);
      }
    } catch (e) {}
  }

  /* ── helpers ── */
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function qs(sel) { return document.querySelector(sel); }

  /* ── build DOM ── */
  function buildCRT() {
    // hide modeScreen immediately
    const ms = document.getElementById('modeScreen');
    if (ms) ms.style.display = 'none';

    // fade overlay
    const fade = document.createElement('div');
    fade.id = 'crtFade';
    document.body.appendChild(fade);

    // main wrapper
    const wrap = document.createElement('div');
    wrap.id = 'crtWrap';
    wrap.innerHTML = `
      <div id="crtBezel">
        <div id="crtScreen">
          <div id="crtVignette"></div>
          <div id="crtContent"></div>
        </div>
        <div id="crtLabel">GROMIX MONITOR PRO — MODEL GX-14</div>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  /* ── typing effect ── */
  async function typeLine(container, text, cls, charDelay) {
    charDelay = charDelay || 38;
    const el = document.createElement('div');
    el.className = 'biosLine' + (cls ? ' ' + cls : '');
    container.appendChild(el);

    // parse inline tags: [OK], [ERROR], [WARN]
    // we type plain text, then colorize at the end
    for (let i = 0; i < text.length; i++) {
      el.textContent = text.slice(0, i + 1);
      await sleep(charDelay);
    }
    // now do HTML coloring
    el.innerHTML = text
      .replace(/\[OK\]/g,    '<span class="ok">[OK]</span>')
      .replace(/\[ERROR\]/g, '<span class="err">[ERROR]</span>')
      .replace(/\[WARN\]/g,  '<span class="warn">[WARN]</span>');
  }

  /* ── BIOS sequence ── */
  const BIOS_LINES = [
    { text: 'GROMIX BIOS v2.4 — Copyright 2024 Gromix Systems',  delay: 30 },
    { text: '',                                                    delay: 0  },
    { text: 'CPU Check..................... [OK]',                 delay: 28 },
    { text: 'Memory Check.................. [OK]',                delay: 28 },
    { text: 'Coffee Machine................ [OK]',                delay: 28 },
    { text: 'Employee Database............. [OK]',                delay: 28 },
    { text: 'Task Board.................... [OK]',                delay: 28 },
    { text: 'Boss AI....................... [ERROR]',             delay: 28 },
    { text: 'Retrying Boss AI.............. [OK]',               delay: 28 },
    { text: '',                                                    delay: 0  },
    { text: 'Initializing Office Rush...',                        delay: 40 },
  ];

  async function runBios(content) {
    for (const line of BIOS_LINES) {
      await typeLine(content, line.text, '', line.delay);
      if (line.text !== '') biosBeep();
      await sleep(line.text === '' ? 80 : 320);
    }
    await sleep(900);
  }

  /* ── loading screen ── */
  async function runLoading(content) {
    content.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.id = 'crtLoading';

    const title = document.createElement('div');
    title.className = 'loadTitle';
    title.textContent = 'Loading Office Rush...';

    const barWrap = document.createElement('div');
    barWrap.className = 'loadBarWrap';
    const barFill = document.createElement('div');
    barFill.className = 'loadBarFill';
    const barText = document.createElement('div');
    barText.className = 'loadBarText';
    barText.textContent = '0%';
    barWrap.appendChild(barFill);
    barWrap.appendChild(barText);

    const sub = document.createElement('div');
    sub.className = 'loadSub';
    sub.textContent = 'Please wait...';

    wrap.appendChild(title);
    wrap.appendChild(barWrap);
    wrap.appendChild(sub);
    content.appendChild(wrap);

    hddSound();

    // animate bar over ~2s
    const steps = 40;
    const stepTime = 2000 / steps;
    for (let i = 1; i <= steps; i++) {
      await sleep(stepTime + Math.random() * 20 - 10);
      const pct = Math.round((i / steps) * 100);
      barFill.style.width = pct + '%';
      barText.textContent = pct + '%';
      if (i % 8 === 0) hddSound();
    }

    await sleep(400);
    sub.textContent = 'Done.';
    await sleep(500);
  }

  /* ── fade out CRT, reveal modeScreen ── */
  async function revealMenu() {
    confirmBeep();
    const fade = document.getElementById('crtFade');
    fade.classList.add('fade-in');
    await sleep(650);

    // hide CRT
    const wrap = document.getElementById('crtWrap');
    if (wrap) wrap.classList.add('hidden');

    // show modeScreen
    const ms = document.getElementById('modeScreen');
    if (ms) ms.style.display = 'flex';

    // fade back in
    fade.classList.remove('fade-in');
  }

  /* ── main entry ── */
  async function boot() {
    buildCRT();

    // small delay so DOM settles
    await sleep(200);

    // power on animation
    crtPowerSound();
    const screen = document.getElementById('crtScreen');
    screen.classList.add('poweron');
    await sleep(700);

    // run BIOS
    const content = document.getElementById('crtContent');
    await runBios(content);

    // loading screen
    await runLoading(content);

    // reveal main menu
    await revealMenu();
  }

  /* ── kick off after DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
