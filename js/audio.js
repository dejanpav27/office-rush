/* OFFICE RUSH — Audio Engine — audio.js
   Real audio files: ambience.mp3 + music.mp3
*/
(function(){
'use strict';

let musicEl = null;
let ambEl = null;
let muted = false;
let currentTrack = null;
let initiated = false;

function init(){
  if(initiated) return;
  initiated = true;

  // ambience — always looping quietly in background
  ambEl = new Audio('audio/ambience.mp3');
  ambEl.loop = true;
  ambEl.volume = 0.18;

  // music
  musicEl = new Audio('audio/music.mp3');
  musicEl.loop = true;
  musicEl.volume = 0.0;
}

function fadeVolume(el, targetVol, durationMs){
  if(!el) return;
  const steps = 30;
  const interval = durationMs / steps;
  const startVol = el.volume;
  const delta = (targetVol - startVol) / steps;
  let step = 0;
  const t = setInterval(()=>{
    step++;
    el.volume = Math.max(0, Math.min(1, startVol + delta * step));
    if(step >= steps){
      clearInterval(t);
      el.volume = targetVol;
    }
  }, interval);
}

function startAmbience(){
  if(!ambEl || muted) return;
  ambEl.currentTime = 0;
  ambEl.play().catch(()=>{});
}

function stopAmbience(){
  if(!ambEl) return;
  fadeVolume(ambEl, 0, 800);
  setTimeout(()=>{ if(ambEl) ambEl.pause(); }, 900);
}

function startMusic(vol){
  if(!musicEl || muted) return;
  musicEl.currentTime = 0;
  musicEl.volume = 0;
  musicEl.play().catch(()=>{});
  fadeVolume(musicEl, vol || 0.5, 1500);
}

function stopMusic(cb){
  if(!musicEl) { if(cb) cb(); return; }
  const cur = musicEl.volume;
  fadeVolume(musicEl, 0, 600);
  setTimeout(()=>{ musicEl.pause(); if(cb) cb(); }, 700);
}

window.ORaudio = {
  // called on first user interaction
  start(){
    init();
    startAmbience();
  },

  playMenu(){
    if(currentTrack === 'menu') return;
    init();
    currentTrack = 'menu';
    startAmbience();
    startMusic(0.42);
  },

  playGame(){
    if(currentTrack === 'game') return;
    init();
    currentTrack = 'game';
    startAmbience();
    // game music same track, slightly louder
    if(musicEl){
      if(musicEl.paused){
        startMusic(0.48);
      } else {
        fadeVolume(musicEl, 0.48, 600);
      }
    }
  },

  playEnd(){
    if(currentTrack === 'end') return;
    init();
    currentTrack = 'end';
    // fade music down, keep ambience
    if(musicEl) fadeVolume(musicEl, 0.15, 1000);
    stopAmbience();
  },

  stop(){
    currentTrack = null;
    stopMusic();
    stopAmbience();
  },

  mute(){
    muted = true;
    if(musicEl) musicEl.volume = 0;
    if(ambEl) ambEl.volume = 0;
  },

  unmute(){
    muted = false;
    if(musicEl && !musicEl.paused) fadeVolume(musicEl, 0.45, 400);
    if(ambEl && !ambEl.paused) fadeVolume(ambEl, 0.18, 400);
  },

  toggle(){
    muted ? this.unmute() : this.mute();
    muted = !muted;
    return muted;
  }
};

})();
