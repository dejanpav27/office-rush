/* OFFICE RUSH — CRT Boot Sequence — boot.js
   Handles: boot → loading → main menu → game transition
   All showScreen('modeScreen') calls are intercepted and redirected to CRT.
*/
(function () {
  'use strict';

  /* ══════════════════════════════════════
     AUDIO
  ══════════════════════════════════════ */
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
  function confirmBeep() { beep(440, 0.05, 0.04, 'square'); setTimeout(()=>beep(880,0.1,0.04,'square'),55); }
  function powerOffBeep() {
    try {
      const ac = getAC(), o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(200, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.4);
      g.gain.setValueAtTime(0.06, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.45);
      o.start(); o.stop(ac.currentTime + 0.45);
    } catch(e) {}
  }
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

  /* ══════════════════════════════════════
     HELPERS
  ══════════════════════════════════════ */
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // days for transition text
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  function currentDayName() {
    // try to get from game state, fallback to Monday
    try {
      if (typeof week !== 'undefined' && week && week.day !== undefined) {
        return DAYS[week.day] || 'Monday';
      }
    } catch(e) {}
    return 'Monday';
  }

  /* ══════════════════════════════════════
     DOM SETUP
  ══════════════════════════════════════ */
  function buildDOM() {
    // permanently hide modeScreen
    const ms = document.getElementById('modeScreen');
    if (ms) ms.setAttribute('style', 'display:none!important');

    // hide HUD and dialog until game starts
    setHudVisible(false);

    // fade overlay
    const fade = document.createElement('div');
    fade.id = 'crtFade';
    document.body.appendChild(fade);

    // main CRT wrapper
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

  function setHudVisible(visible) {
    const v = visible ? 'visible' : 'hidden';
    const hud = document.getElementById('hud');
    const dlg = document.getElementById('dialog');
    if (hud) hud.style.visibility = v;
    if (dlg) dlg.style.visibility = v;
  }

  /* ══════════════════════════════════════
     TYPING EFFECT
  ══════════════════════════════════════ */
  async function typeLine(container, text, charDelay) {
    charDelay = charDelay || 35;
    const el = document.createElement('div');
    el.className = 'biosLine';
    container.appendChild(el);
    for (let i = 0; i < text.length; i++) {
      el.textContent = text.slice(0, i + 1);
      await sleep(charDelay);
    }
    // colorize
    el.innerHTML = text
      .replace(/\[OK\]/g,    '<span class="ok">[OK]</span>')
      .replace(/\[ERROR\]/g, '<span class="err">[ERROR]</span>');
    return el;
  }

  /* ══════════════════════════════════════
     BIOS SEQUENCE
  ══════════════════════════════════════ */
  const BIOS = [
    { t:'GROMIX BIOS v2.4',                      d:18 },
    { t:'--------------------------------',        d:10 },
    { t:'',                                        d:0  },
    { t:'Memory Check............... [OK]',        d:14 },
    { t:'Video System............... [OK]',        d:14 },
    { t:'Employees Module........... [OK]',        d:14 },
    { t:'Coffee Machine............. [OK]',        d:14 },
    { t:'Boss AI Initialization..... [ERROR]',     d:14 },
    { t:'Retrying................... [OK]',        d:14 },
    { t:'',                                        d:0  },
    { t:'Booting Office Rush...',                  d:20 },
  ];

  async function runBios(content) {
    for (const line of BIOS) {
      await typeLine(content, line.t, line.d);
      if (line.t) hddClick();
      await sleep(line.t ? 120 : 40);
    }
    // blinking cursor at end
    const cur = document.createElement('span');
    cur.className = 'biosCursor';
    content.lastChild.appendChild(cur);
    await sleep(700);
    cur.remove();
  }

  /* ══════════════════════════════════════
     LOADING SCREEN
  ══════════════════════════════════════ */
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

    hddClick();
    const steps = 38, stepTime = 2400 / steps;
    for (let i = 1; i <= steps; i++) {
      await sleep(stepTime + Math.random()*18 - 9);
      const pct = Math.round((i/steps)*100);
      barFill.style.width = pct + '%';
      barText.textContent = pct + '%';
      if (i % 7 === 0) hddClick();
    }
    sub.textContent = 'Done.';
    await sleep(350);
  }

  /* ══════════════════════════════════════
     MAIN MENU
  ══════════════════════════════════════ */
  const MENU_ITEMS = [
    { label:'START WEEK',  action:'play'        },
    { label:'PRACTICE',    action:'test'        },
    { label:'LEADERBOARD', action:'leaderboard' },
    { label:'SETTINGS',    action:'settings'    },
    { label:'EXIT',        action:'exit'        },
  ];
  let menuIndex  = 0;
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
    const now = new Date();
    footer.textContent = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} — Employee #142 logged in.`;
    menu.appendChild(footer);

    container.appendChild(menu);
  }

  function detachKeys() {
    if (_keyHandler) { window.removeEventListener('keydown', _keyHandler); _keyHandler = null; }
  }

  function attachKeys(container) {
    detachKeys();
    _keyHandler = (e) => {
      if (!menuActive) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        menuIndex = (menuIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
        navBeep(); renderMenu(container);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
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

  function selectMenu(container) {
    menuActive = false;
    detachKeys();
    confirmBeep();
    const action = MENU_ITEMS[menuIndex].action;
    if      (action === 'play')        transitionToGame(container, false);
    else if (action === 'test')        transitionToGame(container, true);
    else if (action === 'leaderboard') {
      showCRTOff(); // power-off anim
      setTimeout(() => {
        hideCRT();
        if (typeof renderLeaderboard === 'function') renderLeaderboard();
        gameShowScreen('leaderboardScreen');
      }, 400);
    }
    else if (action === 'settings') { menuActive = true; attachKeys(container); } // placeholder
    else if (action === 'exit')     location.reload();
  }

  async function showMainMenu(content) {
    content.innerHTML = '';
    menuIndex = 0;
    renderMenu(content);
    await sleep(80);
    menuActive = true;
    attachKeys(content);
  }

  /* ══════════════════════════════════════
     POWER-OFF ANIMATION
  ══════════════════════════════════════ */
  function showCRTOff() {
    powerOffBeep();
    const screen = document.getElementById('crtScreen');
    if (screen) {
      screen.style.transition = 'transform 0.35s ease-in, opacity 0.35s ease-in';
      screen.style.transform = 'scaleY(0.04) scaleX(0.95)';
      screen.style.opacity = '0';
    }
  }

  function resetCRTScreen() {
    const screen = document.getElementById('crtScreen');
    if (screen) {
      screen.style.transition = '';
      screen.style.transform = '';
      screen.style.opacity = '';
    }
  }

  /* ══════════════════════════════════════
     GAME TRANSITION
  ══════════════════════════════════════ */
  async function transitionToGame(container, testMode) {
    detachKeys();
    container.innerHTML = '';

    const dayName = currentDayName();
    const t = document.createElement('div');
    t.id = 'crtTransition';
    t.innerHTML = `
      <div class="transText">Starting new week...</div>
      <div class="transSpinner">\u29d6</div>
      <div class="transText">Loading ${dayName}...</div>
    `;
    container.appendChild(t);

    hddClick();
    await sleep(1600);

    // power-off + fade
    showCRTOff();
    await sleep(350);
    const fade = document.getElementById('crtFade');
    fade.classList.add('fade-in');
    await sleep(500);

    hideCRT();
    setHudVisible(true);

    if (testMode) {
      if (typeof startTest === 'function') startTest();
    } else {
      if (typeof renderSlots === 'function') renderSlots();
      gameShowScreen('userSelect');
    }

    fade.classList.remove('fade-in');
  }

  /* ══════════════════════════════════════
     CRT SHOW / HIDE
  ══════════════════════════════════════ */
  function hideCRT() {
    const w = document.getElementById('crtWrap');
    if (w) w.classList.add('hidden');
  }

  function showCRT() {
    resetCRTScreen();
    const w = document.getElementById('crtWrap');
    if (w) w.classList.remove('hidden');
    setHudVisible(false);
  }

  // show CRT with power-on effect
  async function revealCRT() {
    showCRT();
    crtPowerSound();
    const screen = document.getElementById('crtScreen');
    if (screen) {
      screen.classList.remove('poweron');
      void screen.offsetWidth; // reflow to restart animation
      screen.classList.add('poweron');
    }
    const content = document.getElementById('crtContent');
    if (content) await showMainMenu(content);
  }

  /* ══════════════════════════════════════
     GAME SCREEN HELPER
  ══════════════════════════════════════ */
  function gameShowScreen(id) {
    // use game.js showScreen but never for modeScreen
    if (id === 'modeScreen') { returnToMenu(); return; }
    if (typeof showScreen === 'function') { showScreen(id); }
  }

  /* ══════════════════════════════════════
     RETURN TO MENU (from anywhere in game)
  ══════════════════════════════════════ */
  async function returnToMenu() {
    // hide all game screens
    const SCREENS = ['modeScreen','userSelect','newGame','userMenu','shopScreen','start','end','leaderboardScreen','firedScreen'];
    SCREENS.forEach(s => { const el = document.getElementById(s); if(el) el.style.display='none'; });
    const po = document.getElementById('pauseOverlay');
    if (po) po.style.display = 'none';

    // fade to black
    const fade = document.getElementById('crtFade');
    fade.classList.add('fade-in');
    await sleep(400);

    await revealCRT();

    fade.classList.remove('fade-in');
  }

  /* ══════════════════════════════════════
     INTERCEPT showScreen('modeScreen')
  ══════════════════════════════════════ */
  function patchShowScreen() {
    const interval = setInterval(() => {
      if (typeof window.showScreen === 'function') {
        clearInterval(interval);
        const orig = window.showScreen;
        window.showScreen = function(id) {
          if (id === 'modeScreen') {
            returnToMenu();
          } else {
            orig(id);
          }
        };
      }
    }, 50);
  }

  /* ══════════════════════════════════════
     BOOT FLOW
  ══════════════════════════════════════ */
  async function boot() {
    buildDOM();
    await sleep(200);

    // power on
    crtPowerSound();
    const screen = document.getElementById('crtScreen');
    screen.classList.add('poweron');
    await sleep(750);

    const content = document.getElementById('crtContent');
    await runBios(content);
    await runLoading(content);
    await showMainMenu(content);

    // intercept all showScreen('modeScreen') calls
    patchShowScreen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
