/* OFFICE RUSH — Audio Engine — audio.js
   Procedural soundtrack: ambience + chiptune music
   Exposed as window.ORaudio — called from boot.js and game hooks
*/
(function(){
'use strict';

let ac = null;
let masterGain = null;
let currentTrack = null;  // 'menu' | 'game' | 'end'
let ambienceNodes = [];
let musicNodes = [];
let muted = false;

function getAC(){
  if(!ac){ ac = new (window.AudioContext||window.webkitAudioContext)(); }
  if(!masterGain){ masterGain=ac.createGain(); masterGain.gain.value=0.55; masterGain.connect(ac.destination); }
  return ac;
}

function stopAll(){
  [...ambienceNodes,...musicNodes].forEach(n=>{try{n.stop();}catch(e){}});
  ambienceNodes=[];musicNodes=[];
}

/* ══════════════════════════════════════
   AMBIENCE
══════════════════════════════════════ */

function makeOfficeAmbience(){
  const ac=getAC();

  // AC/HVAC hum — low drone
  function hum(freq,vol){
    const o=ac.createOscillator(), g=ac.createGain();
    o.type='sine'; o.frequency.value=freq;
    g.gain.value=vol;
    o.connect(g); g.connect(masterGain);
    o.start(); ambienceNodes.push(o);
  }
  hum(60,0.018); hum(120,0.010); hum(180,0.006);

  // keyboard typing rhythm (random noise bursts)
  function typeLoop(){
    if(muted||currentTrack===null) return;
    const ac2=getAC();
    const delay=800+Math.random()*2400;
    setTimeout(()=>{
      if(muted||currentTrack===null) return;
      const bursts=Math.floor(2+Math.random()*6);
      for(let i=0;i<bursts;i++){
        setTimeout(()=>{
          if(muted) return;
          const buf=ac2.createBuffer(1,ac2.sampleRate*0.018,ac2.sampleRate);
          const d=buf.getChannelData(0);
          for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*0.35;
          const src=ac2.createBufferSource(), g=ac2.createGain();
          src.buffer=buf; g.gain.value=0.06;
          src.connect(g); g.connect(masterGain); src.start();
        }, i*60+Math.random()*40);
      }
      typeLoop();
    }, delay);
  }
  typeLoop();

  // phone ring (rare)
  function phoneLoop(){
    if(muted||currentTrack===null) return;
    const delay=15000+Math.random()*25000;
    setTimeout(()=>{
      if(muted||currentTrack===null) return;
      const ac2=getAC();
      for(let r=0;r<2;r++){
        setTimeout(()=>{
          if(muted) return;
          const o=ac2.createOscillator(), g=ac2.createGain();
          o.type='square'; o.frequency.value=480;
          g.gain.setValueAtTime(0.04,ac2.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001,ac2.currentTime+0.8);
          o.connect(g); g.connect(masterGain);
          o.start(); o.stop(ac2.currentTime+0.8);
        },r*1200);
      }
      phoneLoop();
    },delay);
  }
  phoneLoop();
}

/* ══════════════════════════════════════
   MUSIC — MENU (lofi chiptune)
══════════════════════════════════════ */

function playMenuMusic(){
  const ac=getAC();
  const bpm=76, beat=60/bpm, bar=beat*4;

  // chord progression: Cm - Ab - Eb - Bb (lofi)
  const chords=[
    [130.81,155.56,196.00], // Cm
    [103.83,130.81,155.56], // Ab
    [77.78, 97.99, 123.47], // Eb (low)
    [116.54,146.83,174.61], // Bb
  ];

  // bass notes
  const bass=[65.41,51.91,38.89,58.27];

  let startT=ac.currentTime+0.1;
  const BARS=8;

  function scheduleLoop(){
    for(let b=0;b<BARS;b++){
      const t=startT+b*bar;
      const chord=chords[b%4];
      const bassNote=bass[b%4];

      // pad chord — soft sine waves
      chord.forEach(freq=>{
        const o=ac.createOscillator(), g=ac.createGain();
        o.type='triangle'; o.frequency.value=freq;
        g.gain.setValueAtTime(0,t);
        g.gain.linearRampToValueAtTime(0.06,t+0.3);
        g.gain.setValueAtTime(0.06,t+bar-0.4);
        g.gain.linearRampToValueAtTime(0,t+bar);
        o.connect(g); g.connect(masterGain);
        o.start(t); o.stop(t+bar);
        musicNodes.push(o);
      });

      // bass — square wave, muted feel
      const ob=ac.createOscillator(), gb=ac.createGain();
      ob.type='square'; ob.frequency.value=bassNote;
      gb.gain.setValueAtTime(0.04,t);
      gb.gain.exponentialRampToValueAtTime(0.001,t+beat*1.5);
      ob.connect(gb); gb.connect(masterGain);
      ob.start(t); ob.stop(t+beat*1.5);
      musicNodes.push(ob);

      // hi-hat pattern
      for(let h=0;h<8;h++){
        const ht=t+h*(beat/2);
        const vol=h%2===0?0.025:0.012;
        setTimeout(()=>{
          if(muted||currentTrack!=='menu') return;
          const buf=ac.createBuffer(1,ac.sampleRate*0.04,ac.sampleRate);
          const d=buf.getChannelData(0);
          for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*Math.pow(1-j/d.length,2);
          const src=ac.createBufferSource(), g=ac.createGain();
          src.buffer=buf; g.gain.value=vol;
          src.connect(g); g.connect(masterGain); src.start();
        }, Math.max(0,(ht-ac.currentTime)*1000));
      }

      // simple melody on last 4 bars
      if(b>=4){
        const mel=[196,220,246,220,196,175,196,220];
        mel.forEach((freq,mi)=>{
          const mt=t+mi*(beat/2);
          const om=ac.createOscillator(), gm=ac.createGain();
          om.type='square'; om.frequency.value=freq;
          gm.gain.setValueAtTime(0,mt);
          gm.gain.linearRampToValueAtTime(0.035,mt+0.04);
          gm.gain.exponentialRampToValueAtTime(0.001,mt+beat/2-0.02);
          om.connect(gm); gm.connect(masterGain);
          om.start(mt); om.stop(mt+beat/2);
          musicNodes.push(om);
        });
      }
    }

    startT+=BARS*bar;
    // schedule next loop slightly before end
    const loopDelay=(startT-ac.currentTime-0.5)*1000;
    setTimeout(()=>{ if(currentTrack==='menu') scheduleLoop(); }, Math.max(0,loopDelay));
  }
  scheduleLoop();
}

/* ══════════════════════════════════════
   MUSIC — GAMEPLAY (upbeat chiptune)
══════════════════════════════════════ */

function playGameMusic(){
  const ac=getAC();
  const bpm=128, beat=60/bpm, bar=beat*4;

  // C major energy: C-F-G-Am
  const chords=[
    [261.63,329.63,392.00], // C
    [174.61,220.00,261.63], // F
    [196.00,246.94,293.66], // G
    [220.00,261.63,329.63], // Am
  ];
  const bass=[65.41,87.31,98.00,55.00];
  const mel1=[392,440,523,440,392,349,392,440, 523,587,523,440,392,440,523,392];

  let startT=ac.currentTime+0.1;
  const BARS=8;

  function scheduleLoop(){
    for(let b=0;b<BARS;b++){
      const t=startT+b*bar;
      const chord=chords[b%4];

      // pad
      chord.forEach(freq=>{
        const o=ac.createOscillator(), g=ac.createGain();
        o.type='square'; o.frequency.value=freq;
        g.gain.setValueAtTime(0.03,t);
        g.gain.setValueAtTime(0.03,t+bar-0.05);
        g.gain.linearRampToValueAtTime(0,t+bar);
        o.connect(g); g.connect(masterGain);
        o.start(t); o.stop(t+bar);
        musicNodes.push(o);
      });

      // punchy bass
      for(let step=0;step<4;step++){
        const bt=t+step*beat;
        const ob=ac.createOscillator(), gb=ac.createGain();
        ob.type='square'; ob.frequency.value=bass[b%4];
        gb.gain.setValueAtTime(0.07,bt);
        gb.gain.exponentialRampToValueAtTime(0.001,bt+beat*0.4);
        ob.connect(gb); gb.connect(masterGain);
        ob.start(bt); ob.stop(bt+beat*0.4);
        musicNodes.push(ob);
      }

      // melody
      const melStep=beat/2;
      for(let mi=0;mi<16;mi++){
        const mt=t+(mi%8)*melStep + (mi>=8?bar/2:0);
        if(b*16+mi>=mel1.length*2) break;
        const freq=mel1[(b*16+mi)%mel1.length];
        const om=ac.createOscillator(), gm=ac.createGain();
        om.type='square'; om.frequency.value=freq;
        gm.gain.setValueAtTime(0.045,mt);
        gm.gain.exponentialRampToValueAtTime(0.001,mt+melStep*0.7);
        om.connect(gm); gm.connect(masterGain);
        om.start(mt); om.stop(mt+melStep*0.7);
        musicNodes.push(om);
      }

      // kick + snare
      for(let step=0;step<8;step++){
        const st=t+step*(beat/2);
        const isKick=step%4===0, isSnare=step%4===2;
        if(isKick){
          setTimeout(()=>{
            if(muted||currentTrack!=='game') return;
            const o=ac.createOscillator(), g=ac.createGain();
            o.type='sine'; o.frequency.setValueAtTime(150,ac.currentTime);
            o.frequency.exponentialRampToValueAtTime(40,ac.currentTime+0.1);
            g.gain.setValueAtTime(0.12,ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.12);
            o.connect(g); g.connect(masterGain); o.start(); o.stop(ac.currentTime+0.12);
          },Math.max(0,(st-ac.currentTime)*1000));
        }
        if(isSnare){
          setTimeout(()=>{
            if(muted||currentTrack!=='game') return;
            const buf=ac.createBuffer(1,ac.sampleRate*0.12,ac.sampleRate);
            const d=buf.getChannelData(0);
            for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*Math.pow(1-j/d.length,1.5);
            const src=ac.createBufferSource(), g=ac.createGain();
            src.buffer=buf; g.gain.value=0.07;
            src.connect(g); g.connect(masterGain); src.start();
          },Math.max(0,(st-ac.currentTime)*1000));
        }
      }
    }

    startT+=BARS*bar;
    const loopDelay=(startT-ac.currentTime-0.5)*1000;
    setTimeout(()=>{ if(currentTrack==='game') scheduleLoop(); }, Math.max(0,loopDelay));
  }
  scheduleLoop();
}

/* ══════════════════════════════════════
   MUSIC — END (slow, melancholic)
══════════════════════════════════════ */

function playEndMusic(){
  const ac=getAC();
  const bpm=52, beat=60/bpm, bar=beat*4;

  const chords=[
    [130.81,155.56,196.00], // Cm
    [116.54,138.59,174.61], // Bb
    [103.83,123.47,155.56], // Ab
    [87.31, 103.83,130.81], // Gm
  ];

  let startT=ac.currentTime+0.1;
  const BARS=4;

  function scheduleLoop(){
    for(let b=0;b<BARS;b++){
      const t=startT+b*bar;
      chords[b%4].forEach(freq=>{
        const o=ac.createOscillator(), g=ac.createGain();
        o.type='triangle'; o.frequency.value=freq;
        g.gain.setValueAtTime(0,t);
        g.gain.linearRampToValueAtTime(0.055,t+0.8);
        g.gain.setValueAtTime(0.055,t+bar-0.8);
        g.gain.linearRampToValueAtTime(0,t+bar);
        o.connect(g); g.connect(masterGain);
        o.start(t); o.stop(t+bar);
        musicNodes.push(o);
      });
    }
    startT+=BARS*bar;
    const loopDelay=(startT-ac.currentTime-0.5)*1000;
    setTimeout(()=>{ if(currentTrack==='end') scheduleLoop(); }, Math.max(0,loopDelay));
  }
  scheduleLoop();
}

/* ══════════════════════════════════════
   PUBLIC API
══════════════════════════════════════ */

function fadeOut(dur, cb){
  if(!masterGain) { if(cb) cb(); return; }
  const ac=getAC();
  const now=ac.currentTime;
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0, now+dur);
  setTimeout(()=>{ stopAll(); masterGain.gain.value=0.55; if(cb) cb(); }, dur*1000+50);
}

function fadeIn(dur){
  if(!masterGain) return;
  const ac=getAC();
  const now=ac.currentTime;
  masterGain.gain.setValueAtTime(0,now);
  masterGain.gain.linearRampToValueAtTime(0.55,now+dur);
}

window.ORaudio = {
  playMenu(){
    if(currentTrack==='menu') return;
    fadeOut(0.5,()=>{
      currentTrack='menu';
      getAC();
      makeOfficeAmbience();
      fadeIn(1.5);
      playMenuMusic();
    });
  },
  playGame(){
    if(currentTrack==='game') return;
    fadeOut(0.6,()=>{
      currentTrack='game';
      getAC();
      makeOfficeAmbience();
      fadeIn(1.0);
      playGameMusic();
    });
  },
  playEnd(){
    if(currentTrack==='end') return;
    fadeOut(0.8,()=>{
      currentTrack='end';
      getAC();
      fadeIn(1.5);
      playEndMusic();
    });
  },
  stop(){
    fadeOut(0.5,()=>{ currentTrack=null; });
  },
  mute(){
    muted=true;
    if(masterGain) masterGain.gain.value=0;
  },
  unmute(){
    muted=false;
    if(masterGain) masterGain.gain.value=0.55;
  },
  toggle(){
    muted ? this.unmute() : this.mute();
    return !muted;
  }
};

})();
