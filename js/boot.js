/* OFFICE RUSH — CRT Boot Sequence — boot.js */
(function () {
  'use strict';

  /* ── audio ── */
  let _ac = null;
  function getAC() {
    if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
    return _ac;
  }
  function beep(freq, dur, vol, type) {
    try {
      const ac = getAC(), o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = type || 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.05, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.start(); o.stop(ac.currentTime + dur);
    } catch(e) {}
  }
  function crtPowerSound() {
    try {
      const ac = getAC(), o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(40, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.45);
      g.gain.setValueAtTime(0.07, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.55);
      o.start(); o.stop(ac.currentTime + 0.55);
    } catch(e) {}
  }
  function navBeep()     { beep(660, 0.07, 0.04, 'square'); }
  function confirmBeep() { beep(440, 0.05, 0.05, 'square'); setTimeout(()=>beep(880,0.1,0.05,'square'),55); }
  function hddClick() {
    try {
      const ac = getAC(), buf = ac.createBuffer(1, ac.sampleRate*0.03, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*0.25;
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buf; src.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.07, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime+0.05);
      src.start();
    } catch(e) {}
  }

  /* ── helpers ── */
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ── build DOM ── */
  function buildDOM() {
    // permanently hide modeScreen — monitor is the main menu now
    const ms = document.getElementById('modeScreen');
    if (ms) { ms.style.display = 'none'; ms.style.setProperty('display','none','important'); }

    // fade overlay
    const fade = document.createElement('div');
    fade.id = 'crtFade';
    document.body.appendChild(fade);

    // main wrapper
    const wrap = document.createElement('div');
    wrap.id = 'crtWrap';
    wrap.innerHTML = `
      <div id="crtBg"></div>
      <div id="crtMonitorWrap">
        <div id="crtScreen">
          <div id="crtVignette"></div>
          <div id="crtContent"></div>
        </div>
        <img id="crtMonitorImg" src="img/monitor.png" alt="">
      </div>
    `;
    document.body.appendChild(wrap);
  }

  /* ── typing effect ── */
  async function typeLine(container, text, charDelay) {
    charDelay = charDelay || 35;
    const el = document.createElement('div');
    el.className = 'biosLine';
    container.appendChild(el);
    for (let i = 0; i < text.length; i++) {
      el.textContent = text.slice(0, i + 1);
      await sleep(charDelay);
    }
    // colorize tags
    el.innerHTML = text
      .replace(/\[OK\]/g,    '<span class="ok">[OK]</span>')
      .replace(/\[ERROR\]/g, '<span class="err">[ERROR]</span>');
    return el;
  }

  /* ── BIOS ── */
  const BIOS = [
    { t:'GROMIX BIOS v2.4',                      d:32 },
    { t:'--------------------------------',        d:20 },
    { t:'',                                        d:0  },
    { t:'Memory Check............... [OK]',        d:26 },
    { t:'Video System............... [OK]',        d:26 },
    { t:'Employees Module........... [OK]',        d:26 },
    { t:'Coffee Machine............. [OK]',        d:26 },
    { t:'Boss AI Initialization..... [ERROR]',     d:26 },
    { t:'Retrying................... [OK]',        d:26 },
    { t:'',                                        d:0  },
    { t:'Booting Office Rush...',                  d:38 },
  ];

  async function runBios(content) {
    for (const line of BIOS) {
      await typeLine(content, line.t, line.d);
      if (line.t) hddClick();
      await sleep(line.t ? 300 : 80);
    }
    // blinking cursor at end
    const cur = document.createElement('span');
    cur.className = 'biosCursor';
    content.lastChild.appendChild(cur);
    await sleep(1000);
    cur.remove();
  }

  /* ── loading ── */
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

    wrap.appendChild(title); wrap.appendChild(barWrap); wrap.appendChild(sub);
    content.appendChild(wrap);

    hddClick();
    const steps = 38, stepTime = 900 / steps;
    for (let i = 1; i <= steps; i++) {
      await sleep(stepTime + Math.random()*18 - 9);
      const pct = Math.round((i/steps)*100);
      barFill.style.width = pct + '%';
      barText.textContent = pct + '%';
      if (i % 7 === 0) hddClick();
    }
    sub.textContent = 'Done.';
    await sleep(450);
  }

  /* ── main menu ── */
  const MENU_ITEMS = [
    { label: 'START WEEK',  action: 'play'        },
    { label: 'PRACTICE',    action: 'test'        },
    { label: 'LEADERBOARD', action: 'leaderboard' },
    { label: 'SETTINGS',    action: 'settings'    },
    { label: 'EXIT',        action: 'exit'        },
  ];
  let menuIndex = 0;
  let menuActive = false;
  let _keyHandler = null;

  function renderMenu(container) {
    container.innerHTML = '';
    const menu = document.createElement('div');
    menu.id = 'crtMenu';

    const header = document.createElement('div');
    header.className = 'menuHeader';
    header.textContent = 'GROMIX OS v1.0';
    menu.appendChild(header);

    MENU_ITEMS.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'menuItem' + (i === menuIndex ? ' active' : '');
      el.textContent = (i === menuIndex ? '> ' : '  ') + item.label;
      el.addEventListener('mouseover', () => {
        if (!menuActive) return;
        if (menuIndex !== i) { menuIndex = i; navBeep(); renderMenu(container); }
      });
      el.addEventListener('click', () => {
        if (!menuActive) return;
        menuIndex = i;
        selectMenu(container);
      });
      menu.appendChild(el);
    });

    const hint = document.createElement('div');
    hint.className = 'menuHint';
    hint.textContent = 'Use \u2191\u2193 to navigate, Enter to select.';
    menu.appendChild(hint);

    const footer = document.createElement('div');
    footer.className = 'menuFooter';
    footer.textContent = 'Employee #142 logged in.';
    menu.appendChild(footer);

    container.appendChild(menu);
  }

  function selectMenu(container) {
    menuActive = false;
    if (_keyHandler) { window.removeEventListener('keydown', _keyHandler); _keyHandler = null; }
    const action = MENU_ITEMS[menuIndex].action;
    confirmBeep();
    if      (action === 'play')        transitionToGame(container, false);
    else if (action === 'test')        transitionToGame(container, true);
    else if (action === 'leaderboard') { hideCRT(); if(typeof renderLeaderboard==='function') renderLeaderboard(); showGameScreen('leaderboardScreen'); }
    else if (action === 'settings')    { menuActive = true; attachKeys(container); }
    else if (action === 'exit')        location.reload();
  }

  function attachKeys(container) {
    _keyHandler = (e) => {
      if (!menuActive) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        menuIndex = (menuIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        navBeep(); renderMenu(container);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        menuIndex = (menuIndex + 1) % MENU_ITEMS.length;
        navBeep(); renderMenu(container);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMenu(container);
      }
    };
    window.addEventListener('keydown', _keyHandler);
  }

  async function showMainMenu(content) {
    content.innerHTML = '';
    menuIndex = 0;
    renderMenu(content);
    await sleep(100);
    menuActive = true;
    attachKeys(content);
  }

  /* ── transition to game ── */
  async function transitionToGame(container, testMode) {
    container.innerHTML = '';
    const t = document.createElement('div');
    t.id = 'crtTransition';
    t.innerHTML = `
      <div class="transText">Starting new week...</div>
      <div class="transSpinner">\u29d6</div>
      <div class="transText">Loading Monday...</div>
    `;
    container.appendChild(t);

    hddClick();
    await sleep(1800);

    // fade to black
    const fade = document.getElementById('crtFade');
    fade.classList.add('fade-in');
    await sleep(650);

    // hide CRT, show game
    hideCRT();
    if (testMode) {
      document.getElementById('modeScreen').style.display = 'none';
      if (typeof startTest === 'function') startTest();
    } else {
      if (typeof renderSlots === 'function') renderSlots();
      showGameScreen('userSelect');
    }
    fade.classList.remove('fade-in');
  }

  function hideCRT() {
    const w = document.getElementById('crtWrap');
    if (w) w.classList.add('hidden');
  }

  function showGameScreen(id) {
    if (typeof showScreen === 'function') { showScreen(id); return; }
    // fallback
    const screens = ['modeScreen','userSelect','newGame','userMenu','shopScreen','start','end','leaderboardScreen','firedScreen'];
    screens.forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = (s === id) ? 'flex' : 'none';
    });
  }

  /* ── intercept all showScreen('modeScreen') calls → show CRT instead ── */
  function patchShowScreen() {
    // wait for game.js to define showScreen, then wrap it
    const interval = setInterval(() => {
      if (typeof window.showScreen === 'function') {
        clearInterval(interval);
        const orig = window.showScreen;
        window.showScreen = function(id) {
          if (id === 'modeScreen') {
            // hide all game screens
            const screens = ['modeScreen','userSelect','newGame','userMenu','shopScreen','start','end','leaderboardScreen','firedScreen'];
            screens.forEach(s => { const el = document.getElementById(s); if(el) el.style.display='none'; });
            // bring CRT back
            const wrap = document.getElementById('crtWrap');
            if (wrap) {
              wrap.classList.remove('hidden');
              const content = document.getElementById('crtContent');
              if (content) showMainMenu(content);
            }
          } else {
            orig(id);
          }
        };
      }
    }, 100);
  }

  /* ── main boot flow ── */
  async function boot() {
    buildDOM();
    await sleep(200);

    crtPowerSound();
    const screen = document.getElementById('crtScreen');
    screen.classList.add('poweron');
    await sleep(750);

    const content = document.getElementById('crtContent');
    await runBios(content);
    await runLoading(content);
    await showMainMenu(content);

    // intercept showScreen('modeScreen') → show CRT
    patchShowScreen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
