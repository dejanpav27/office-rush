// Office Rush — Task Board Edition
// Main game logic. Loaded after sprites-data.js, map-data.js, koda-data.js, monitor-data.js, bike-data.js.


function setMiniBackdrop(){document.getElementById('miniBg').style.backgroundImage=`url("${MAP_BG.src}")`;}
if(MAP_BG.complete)setMiniBackdrop();else MAP_BG.addEventListener('load',setMiniBackdrop);
document.getElementById('monitor').style.backgroundImage=`url("data:image/png;base64,${MONITOR_IMG_B64}")`;
const BIKE_IMG=new Image();BIKE_IMG.src='data:image/png;base64,'+BIKE_IMG_B64;

const cv=document.getElementById('game'),ctx=cv.getContext('2d');
let viewW=window.innerWidth,viewH=window.innerHeight;
function fitScreen(){
  const dpr=window.devicePixelRatio||1;
  viewW=window.innerWidth;viewH=window.innerHeight;
  cv.style.width=viewW+'px';cv.style.height=viewH+'px';
  cv.width=Math.round(viewW*dpr);cv.height=Math.round(viewH*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
}
function toggleFS(){
  if(!document.fullscreenElement){(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen).call(document.documentElement);}
  else{(document.exitFullscreen||document.webkitExitFullscreen).call(document);}
}
document.addEventListener('fullscreenchange',()=>setTimeout(fitScreen,60));
fitScreen();addEventListener('resize',fitScreen);
let TS=80;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>[...a].sort(()=>Math.random()-.5);

/* item spawn — positions are randomised onto walkable tiles each day */
const ITEM_DEFS={
  cigs:{icon:'cig'},logsheet:{icon:'doc'},coffee:{icon:'cup'},
  contract:{icon:'doc'},router:{icon:'rtr'},vape:{icon:'vape'},
  laptop:{icon:'lap'},invoice:{icon:'inv'},lighter:{icon:'ltr'},
};
let ITEM_SPOTS={};
function randomiseItemSpots(){
  // collect all walkable interior floor tiles (MAP value 0)
  const floors=[];
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(MAP[y][x]===0)floors.push({x,y});
  const used=new Set();
  // exclude NPC home tiles
  if(typeof POOLS!=='undefined')Object.values(POOLS).forEach(p=>{if(p.home)used.add(p.home.x+','+p.home.y);});
  const avail=shuffle(floors.filter(f=>!used.has(f.x+','+f.y)));
  let idx=0;
  ITEM_SPOTS={};
  for(const k in ITEM_DEFS){
    const spot=avail[idx++]||avail[0];
    ITEM_SPOTS[k]={x:spot.x,y:spot.y,icon:ITEM_DEFS[k].icon};
  }
}

/* character visual specs for pixel sprites */
const LOOKS={
  dejan:{skin:'#e8b88a',hair:'#6b4a2a',shirt:'#2e4a72',pants:'#333',glasses:true},
  teonem:{skin:'#e8b88a',hair:'#1f1f1f',shirt:'#8a2e3e',pants:'#2a2a3a'},
  steve:{skin:'#e8c49a',hair:'#7a5a35',shirt:'#3e6b3a',pants:'#3a3a3a',beard:true,wide:true},
  brana:{skin:'#e8b88a',hair:'#4a2a5a',shirt:'#6b3e8a',pants:'#2a1a3a',long:true},
  sonja:{skin:'#edc9a2',hair:'#c9903f',shirt:'#3f8a80',pants:'#444',long:true},
  pedja:{skin:'#e8b88a',hair:'#2a2a2a',shirt:'#b8863e',pants:'#2f2f3f',tall:true},
  nina:{skin:'#edc9a2',hair:'#8a2e2e',shirt:'#d9663d',pants:'#3a2a2a',long:true},
  daniel:{skin:'#8a5a3a',hair:'#1a1a1a',shirt:'#5a3e8a',pants:'#2a2a2a'},
  nino:{skin:'#e8b88a',hair:'#888',shirt:'#caa53d',pants:'#2a2a2a',boss:true},
};

const SPRITES={};
['dejan','teonem','steve','brana','sonja','pedja','nina','nino','daniel'].forEach(id=>{const im=new Image();im.src='img/sprites/'+id+'.png';SPRITES[id]=im;});

function drawSprite(g,cx,cy,id,scale,bob,flip){
  const img=SPRITES[id];const s=(scale||2);const b=bob||0;
  const w=img.naturalWidth||64,h=img.naturalHeight||90;
  const dw=w*0.22*s, dh=h*0.22*s; // smaller characters
  g.save();
  g.fillStyle='rgba(40,20,5,.32)';g.beginPath();g.ellipse(cx,cy+dh*0.16,dw*0.3,dw*0.11,0,0,7);g.fill();
  if(img.complete&&img.naturalWidth>0){
    if(flip===-1){g.translate(cx,0);g.scale(-1,1);g.drawImage(img,-dw/2,cy-dh*0.86+b,dw,dh);}
    else g.drawImage(img,cx-dw/2,cy-dh*0.86+b,dw,dh);
  }
  g.restore();
}

// POOLS and IDLE_LINES are in pools-data.js

const MAP=[
 [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],
 [1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
 [1,1,1,1,0,0,0,1,1,0,0,0,0,1,1,1,1,0,1,1,1,1,0,1],
 [1,1,1,1,0,0,0,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
 [1,1,1,1,0,0,0,1,1,0,1,1,0,0,0,0,1,0,0,0,0,0,0,1],
 [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
 [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
 [1,0,0,0,0,0,0,1,1,0,1,1,1,1,0,0,1,0,0,0,0,0,0,1],
 [1,0,0,0,0,0,0,1,1,0,1,1,1,1,0,0,1,1,1,1,1,1,0,1],
 [1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1],
 [1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
 [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
 [1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
 [9,9,9,9,9,11,11,9,9,9,9,9,9,9,9,9,9,11,11,11,11,11,11,9],
];
/* 0 floor 1 wall 2 desk 3 taskboard 4 window 5 rug 6 plant 7 coffee 8 cooler 9 grass terrace 10 small terrace
   office1 c1-8, office2 c10-15, boss c17-22 (wood). doors: r2 c5/c11/c20 (terrace), r6 c9/c16, r12 c5-6 entrance, r12 c17 small terrace */
const ROWS=MAP.length,COLS=MAP[0].length;
const FINE=[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]];
const FROWS=FINE.length,FCOLS=FINE[0].length,FTS=TS/2;
function fineWalk(px,py){const cx=Math.floor(px/FTS),cy=Math.floor(py/FTS);if(cy<0||cy>=FROWS||cx<0||cx>=FCOLS)return false;return FINE[cy][cx]===0;}
let zoom=1,offX=0,offY=0;
let camX=0,camY=0,camZoom=1.4,targetZoom=1.4;
const CAM_ZOOM_MIN=0.75,CAM_ZOOM_MAX=2.0,CAM_LERP=0.10,CAM_ZOOM_LERP=0.12;
cv.addEventListener('wheel',e=>{if(state!=='play')return;e.preventDefault();targetZoom=Math.max(CAM_ZOOM_MIN,Math.min(CAM_ZOOM_MAX,targetZoom-e.deltaY*0.001));},{passive:false});
function updateCamera(){
  if(state!=='play'||!player){zoom=Math.min(viewW/(COLS*TS),viewH/(ROWS*TS));offX=(viewW-COLS*TS*zoom)/2;offY=(viewH-ROWS*TS*zoom)/2;camZoom=zoom;return;}
  camZoom+=(targetZoom-camZoom)*CAM_ZOOM_LERP;
  const targetX=player.x-viewW/(2*camZoom),targetY=player.y-viewH/(2*camZoom);
  const maxX=COLS*TS-viewW/camZoom,maxY=ROWS*TS-viewH/camZoom;
  camX+=(Math.max(0,Math.min(maxX,targetX))-camX)*CAM_LERP;
  camY+=(Math.max(0,Math.min(maxY,targetY))-camY)*CAM_LERP;
  zoom=camZoom;offX=-camX*camZoom;offY=-camY*camZoom;
}


const TASKS_PER_NPC=2;

// ── 5-DAY WEEK CONFIG ──────────────────────────────────
const DAY_CONFIG=[
  {name:'Monday',   tasksPerNPC:1, target:80,  time:300},
  {name:'Tuesday',  tasksPerNPC:2, target:160, time:360},
  {name:'Wednesday',tasksPerNPC:3, target:240, time:420},
  {name:'Thursday', tasksPerNPC:4, target:320, time:480},
  {name:'Friday',   tasksPerNPC:5, target:420, time:540},
];
let week={day:0,points:0,coins:0,streak:0,target:0,dayCoins:0,dayFails:0,chosenId:null};

// ── SAVE SYSTEM ────────────────────────────────────────
const SLOT_KEY=i=>'officeRush_slot_'+i;
const NUM_SLOTS=3;
let currentSlot=null,currentUser=null;
function blankUser(name){return{name,created:Date.now(),coins:0,unlockedNPCs:[],stats:{bestScore:0,totalCoins:0,weeksPlayed:0,weeksSurvived:0}};}
function loadSlot(i){try{const r=localStorage.getItem(SLOT_KEY(i));return r?JSON.parse(r):null;}catch(e){return null;}}
function saveSlot(i,u){try{localStorage.setItem(SLOT_KEY(i),JSON.stringify(u));}catch(e){}}
function saveCurrent(){if(currentSlot!==null&&currentUser)saveSlot(currentSlot,currentUser);}
const LB_KEY='officeRush_leaderboard';
function loadLeaderboard(){try{return JSON.parse(localStorage.getItem(LB_KEY))||[];}catch(e){return[];}}
function updateLeaderboard(name,score){let lb=loadLeaderboard();const ex=lb.find(e=>e.name===name);if(ex){if(score>ex.score)ex.score=score;}else lb.push({name,score});lb.sort((a,b)=>b.score-a.score);lb=lb.slice(0,10);try{localStorage.setItem(LB_KEY,JSON.stringify(lb));}catch(e){}}
function renderLeaderboard(){const lb=loadLeaderboard();const el=document.getElementById('lbList');if(!lb.length){el.innerHTML='<div class="lbEmpty">No scores yet — survive a full week!</div>';return;}const medals=['🥇','🥈','🥉'];el.innerHTML=lb.map((e,i)=>'<div class="lbRow"><div class="lbRank">'+(medals[i]||i+1)+'</div><div class="lbName">'+esc(e.name)+'</div><div class="lbScore">'+e.score+' pt</div></div>').join('');}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

let player,state='start',time=420,timerId,dialogOpen=false,miniOpen=false;
let smoking=false,smokeParticles=[],smokeUntil=0;
let vaping=false,vapeParticles=[],vapeUntil=0;
let biking=false,bikeUntil=0,bikeDir=1,bikeX=0;
let petting=false,pettingUntil=0,pettingHearts=[];
let spying=false,spyUntil=0,spyParticles=[];
let crunching=false,crunchUntil=0,crunchParticles=[];
let stretching=false,stretchUntil=0,stretchParticles=[];
let vibing=false,vibeUntil=0,vibeParticles=[];
function onTerrace(){const t=MAP[Math.floor(player.y/TS)]?.[Math.floor(player.x/TS)];return t===10||t===11;}
function tryCigarette(){ // F key dispatcher based on who you play
  if(state!=='play'||dialogOpen||miniOpen)return;
  if(smoking||vaping||biking||petting||spying||crunching||stretching||vibing)return;
  if(player.id==='dejan'){
    if(!onTerrace()){openDialog('Dejan','Not here... take me to the terrace to light one up.',[{label:'Ok',fn:closeDialog}]);return;}
    smoking=true;smokeUntil=Date.now()+5000;smokeParticles=[];return;}
  if(player.id==='steve'){ // vape anytime
    vaping=true;vapeUntil=Date.now()+3500;vapeParticles=[];return;}
  if(player.id==='teonem'){ // ride motorbike on big terrace
    if(!onTerrace()){openDialog('Teonem','Gotta be out on the big terrace to ride, boss.',[{label:'Ok',fn:closeDialog}]);return;}
    biking=true;bikeUntil=Date.now()+6000;bikeDir=1;bikeX=player.x;return;}
  if(player.id==='nina'){ // pet Koda — must be near the dog
    const koda={x:15,y:8};const dx=player.x-(koda.x*TS+TS/2),dy=player.y-(koda.y*TS+TS/2);
    if(Math.hypot(dx,dy)>90){openDialog('Nina','Koda? Where\'s my dog — get me next to him first.',[{label:'Ok',fn:closeDialog}]);return;}
    petting=true;pettingUntil=Date.now()+4000;pettingHearts=[];return;}
  if(player.id==='brana'){ // eavesdrop — must be near an NPC
    const near=nearestNPC();
    if(!near||near.id==='nino'){openDialog('Brana','No one close enough to eavesdrop on...',[{label:'Ok',fn:closeDialog}]);return;}
    const gossip=rnd(['is slacking off again...','just lied to a client.','has been late three times.','is looking for another job.','forgot the deadline. Again.','left early yesterday.','is stealing office supplies.','was caught napping.']);
    spying=true;spyUntil=Date.now()+3500;spyParticles=[];
    openDialog('Brana','*listens* ...'+near.name+' '+gossip+' *noted.*',[{label:'Interesting',fn:closeDialog}]);return;}
  if(player.id==='sonja'){ // calculator crunch at desk
    crunching=true;crunchUntil=Date.now()+3000;crunchParticles=[];return;}
  if(player.id==='pedja'){ // stretching / push-ups
    stretching=true;stretchUntil=Date.now()+4000;stretchParticles=[];return;}
  if(player.id==='daniel'){ // headphones zone-out
    vibing=true;vibeUntil=Date.now()+4500;vibeParticles=[];return;}
}
let NPCS=[],carrying=null,activeKeyHandler=null,frame=0;

function cap(s){return s[0].toUpperCase()+s.slice(1);}

/* ---------- PIXEL SPRITE ---------- */
function drawPerson(g,cx,cy,look,scale,bob,facing){
  const s=scale||2, b=bob||0;
  const wdt=look.wide?12:10, hgt=look.tall?17:15;
  g.save();g.translate(cx,cy+b);
  // shadow
  g.fillStyle='rgba(40,20,5,.35)';g.beginPath();g.ellipse(0,s*8,s*6,s*2.4,0,0,7);g.fill();
  // body
  g.fillStyle=look.shirt;g.fillRect(-s*wdt/2,-s*3,s*wdt,s*7);
  // boss tie
  if(look.boss){g.fillStyle='#8a2e2e';g.fillRect(-s*0.7,-s*3,s*1.4,s*5);}
  // arms
  g.fillStyle=look.shirt;g.fillRect(-s*wdt/2-s*1.6,-s*2.5,s*1.6,s*5);g.fillRect(s*wdt/2,-s*2.5,s*1.6,s*5);
  g.fillStyle=look.skin;g.fillRect(-s*wdt/2-s*1.6,s*2,s*1.6,s*1.6);g.fillRect(s*wdt/2,s*2,s*1.6,s*1.6);
  // legs — drawn after body so they're always visible
  g.fillStyle=look.pants;g.fillRect(-s*3,s*3,s*2.4,s*5);g.fillRect(s*0.6,s*3,s*2.4,s*5);
  // head
  g.fillStyle=look.skin;g.fillRect(-s*4,-s*(hgt-4),s*8,s*7);
  // hair
  g.fillStyle=look.hair;
  g.fillRect(-s*4.4,-s*(hgt-3.4),s*8.8,s*3);
  g.fillRect(-s*4.4,-s*(hgt-6),s*1.6,s*4);g.fillRect(s*2.8,-s*(hgt-6),s*1.6,s*4);
  if(look.long){g.fillRect(-s*4.4,-s*(hgt-6),s*1.8,s*5.5);g.fillRect(s*2.6,-s*(hgt-6),s*1.8,s*5.5);}
  // eyes
  g.fillStyle='#222';g.fillRect(-s*2.2,-s*(hgt-7.5),s*1.2,s*1.2);g.fillRect(s*1,-s*(hgt-7.5),s*1.2,s*1.2);
  // glasses
  if(look.glasses){g.strokeStyle='#1a1a1a';g.lineWidth=s*.6;
    g.strokeRect(-s*3,-s*(hgt-7),s*2.6,s*2);g.strokeRect(s*0.4,-s*(hgt-7),s*2.6,s*2);
    g.beginPath();g.moveTo(-s*0.4,-s*(hgt-8));g.lineTo(s*0.4,-s*(hgt-8));g.stroke();}
  // beard
  if(look.beard){g.fillStyle=look.hair;g.fillRect(-s*3.4,-s*(hgt-10.6),s*6.8,s*2.6);}
  g.restore();
}

/* ── SCREEN NAVIGATION ───────────────────────────────── */
const SCREENS=['modeScreen','userSelect','newGame','userMenu','shopScreen','start','end','leaderboardScreen','firedScreen'];
function showScreen(id){SCREENS.forEach(s=>{const el=document.getElementById(s);if(el)el.style.display=(s===id)?'flex':'none';});}

/* mode select */
document.getElementById('modePlay').onclick=()=>{renderSlots();showScreen('userSelect');};
document.getElementById('modeTest').onclick=()=>{document.getElementById('modeScreen').style.display='none';startTest();};
document.getElementById('modeLeaderboard').onclick=()=>{renderLeaderboard();showScreen('leaderboardScreen');};
document.getElementById('lbBack').onclick=()=>showScreen('modeScreen');
/* ── title screen decorations ── */
(function decorateTitle(){
  const ms=document.getElementById('modeScreen');if(!ms)return;
  const dec=document.createElement('div');dec.id='titleDecor';ms.appendChild(dec);
  /* sticky notes */
  const notes=[
    {x:'3%',y:'12%',rot:'-4deg',cls:'yellow',txt:'8 characters\n229 tasks\n100 mini-games'},
    {x:'85%',y:'8%',rot:'5deg',cls:'pink',txt:'Don\'t forget:\nNino is watching!'},
    {x:'88%',y:'72%',rot:'-3deg',cls:'green',txt:'Survive\nthe week!'},
    {x:'2%',y:'75%',rot:'6deg',cls:'blue',txt:'Tip: press F\nfor special action'}
  ];
  notes.forEach(n=>{
    const el=document.createElement('div');el.className='titleNote '+n.cls;
    el.style.cssText='left:'+n.x+';top:'+n.y+';--rot:'+n.rot;
    el.textContent=n.txt;dec.appendChild(el);
  });
  /* paperclips */
  [{x:'6%',y:'25%',rot:'12deg'},{x:'92%',y:'20%',rot:'-8deg'},{x:'80%',y:'88%',rot:'25deg'}].forEach(c=>{
    const el=document.createElement('div');el.className='titleClip';
    el.style.cssText='left:'+c.x+';top:'+c.y+';transform:rotate('+c.rot+')';dec.appendChild(el);
  });
  /* character sprites peeking from bottom */
  const peekIds=['dejan','teonem','nina','daniel'];
  const peekPos=['8%','28%','68%','88%'];
  peekIds.forEach((id,i)=>{
    const img=SPRITES[id];if(!img)return;
    const cv=document.createElement('canvas');cv.width=60;cv.height=80;
    cv.className='titleSprite';
    cv.style.cssText='left:'+peekPos[i]+';bottom:-10px;width:60px;height:80px';
    const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
    function paint(){cx.clearRect(0,0,60,80);
      if(img.complete&&img.naturalWidth>0){
        const w=img.naturalWidth,h=img.naturalHeight,dh=75,dw=w*(dh/h);
        cx.drawImage(img,30-dw/2,78-dh,dw,dh);}}
    paint();if(img.complete)paint();else img.addEventListener('load',paint);
    dec.appendChild(cv);
  });
})();
document.getElementById('firedBack').onclick=backToUserMenu;

/* user select */
function renderSlots(){
  const list=document.getElementById('slotList');list.innerHTML='';
  for(let i=0;i<NUM_SLOTS;i++){
    const u=loadSlot(i);const d=document.createElement('div');
    if(u){
      d.className='char';d.style.minWidth='160px';d.style.textAlign='left';
      d.innerHTML=
        '<div class="n" style="text-align:center;margin-bottom:10px">'+esc(u.name)+'</div>'+
        '<div class="slot-stat"><span>⭐</span><span>Best: <b>'+u.stats.bestScore+' pt</b></span></div>'+
        '<div class="slot-stat"><span>🪙</span><span>Coins: <b>'+u.coins+'</b></span></div>'+
        '<div class="slot-stat"><span>📅</span><span>Weeks: <b>'+u.stats.weeksSurvived+'/'+u.stats.weeksPlayed+'</b></span></div>'+
        '<div class="slotDel" data-slot="'+i+'">🗑 Delete</div>';
      d.onclick=(e)=>{if(e.target.classList.contains('slotDel'))return;openUser(i);};
    }else{
      d.className='char empty-slot';d.style.minWidth='160px';d.style.textAlign='center';
      d.innerHTML='<div class="n">Empty Slot</div><div class="d" style="font-size:22px;margin-top:8px">+</div><div class="d">New Game</div>';
      d.onclick=()=>{newGameSlot=i;document.getElementById('newGameName').value='';showScreen('newGame');setTimeout(()=>document.getElementById('newGameName').focus(),50);};}
    list.appendChild(d);}
  list.querySelectorAll('.slotDel').forEach(b=>b.onclick=(e)=>{e.stopPropagation();const i=+b.dataset.slot;if(confirm('Delete this save?')){localStorage.removeItem(SLOT_KEY(i));renderSlots();}});}
document.getElementById('userSelectBack').onclick=()=>showScreen('modeScreen');

/* new game */
let newGameSlot=null;
function createNewGame(){const name=(document.getElementById('newGameName').value||'').trim()||'Player';saveSlot(newGameSlot,blankUser(name));openUser(newGameSlot);}
document.getElementById('newGameCreate').onclick=createNewGame;
document.getElementById('newGameName').addEventListener('keydown',e=>{if(e.key==='Enter')createNewGame();});
document.getElementById('newGameBack').onclick=()=>{renderSlots();showScreen('userSelect');};

/* user menu */
function openUser(i){currentSlot=i;currentUser=loadSlot(i)||blankUser('Player');renderUserMenu();showScreen('userMenu');}
function renderUserMenu(){const u=currentUser;document.getElementById('userMenuName').textContent=u.name.toUpperCase();document.getElementById('userStats').innerHTML='<div style="font-size:13px;line-height:1.9;color:var(--inkbrown)"><div>⭐ Best score: <b>'+u.stats.bestScore+' pt</b></div><div>🪙 Coins: <b>'+u.coins+'</b></div><div>📅 Weeks played: <b>'+u.stats.weeksPlayed+'</b></div><div>🏆 Weeks survived: <b>'+u.stats.weeksSurvived+'</b></div></div>';}
document.getElementById('userPlay').onclick=()=>{showScreen('start');};
document.getElementById('userShop').onclick=()=>{document.getElementById('shopCoins').textContent='Your coins: '+(currentUser?currentUser.coins:0);showScreen('shopScreen');};
document.getElementById('userMenuBack').onclick=()=>{renderSlots();showScreen('userSelect');};
document.getElementById('shopBack').onclick=()=>{renderUserMenu();showScreen('userMenu');};
document.getElementById('startBack').onclick=()=>{if(currentSlot!==null){renderUserMenu();showScreen('userMenu');}else showScreen('modeScreen');};

function backToUserMenu(){SCREENS.forEach(s=>{const el=document.getElementById(s);if(el)el.style.display='none';});state='start';if(currentSlot!==null){renderUserMenu();showScreen('userMenu');}else showScreen('modeScreen');}


/* start screen with sprite previews */
const pick=document.getElementById('pickChars');
['dejan','teonem','steve','brana','sonja','pedja','nina','daniel'].forEach(id=>{
  const d=document.createElement('div');d.className='char';d.style.cssText='min-width:130px;max-width:145px;padding:16px 12px 14px;';
  const pc=document.createElement('canvas');pc.width=90;pc.height=120;
  pc.style.cssText='width:90px;height:120px;display:block;margin:0 auto 8px;image-rendering:pixelated;';
  const pg=pc.getContext('2d');pg.imageSmoothingEnabled=false;
  function paint(){const img=SPRITES[id];pg.clearRect(0,0,90,120);
    if(img&&img.complete&&img.naturalWidth>0){
      const w=img.naturalWidth,h=img.naturalHeight;const dh=110,dw=w*(dh/h);
      pg.drawImage(img,45-dw/2,118-dh,dw,dh);}}
  paint();
  const img=SPRITES[id];
  if(img){ if(img.complete&&img.naturalWidth>0) paint(); img.addEventListener('load',paint); img.addEventListener('error',()=>{}); }
  d.appendChild(pc);
  d.innerHTML+='<div class="n">'+cap(id)+'</div><div class="d">'+POOLS[id].desc+'</div>';
  d.onclick=()=>startGame(id);pick.appendChild(d);});
// safety: repaint all previews shortly after load
window.addEventListener('load',()=>setTimeout(()=>{
  document.querySelectorAll('#pickChars canvas').forEach((c,i)=>{
    const ids=['dejan','teonem','steve','brana','sonja','pedja','nina','daniel'];const id=ids[i];
    const img=SPRITES[id];const pg=c.getContext('2d');pg.clearRect(0,0,90,120);
    if(img&&img.complete&&img.naturalWidth>0){const w=img.naturalWidth,h=img.naturalHeight;const dh=110,dw=w*(dh/h);pg.drawImage(img,45-dw/2,118-dh,dw,dh);}
  });},300));

let testMode=false;
function startTest(){
  testMode=true;
  randomiseItemSpots();
  // every NPC present with their FULL pool of tasks
  const order=['brana','sonja','pedja','nina','daniel','teonem','steve','dejan'];
  NPCS=order.map(id=>{const p=POOLS[id];
    const tasks=p.pool.map((t,i)=>({...t,id:id+'_'+i,done:false}));
    return {id,name:cap(id),desc:p.desc,x:p.home.x,y:p.home.y,homeX:p.home.x,homeY:p.home.y,wState:'idle',wTimer:60+Math.random()*160,wTarget:null,face:1,speech:null,speechUntil:0,speechTimer:400+Math.random()*700,tasks};});
  // player = a neutral controllable (use nino sprite as "tester")
  player={id:'nino',name:'Tester',x:6.25*TS,y:12.25*TS,r:12};
  document.getElementById('start').style.display='none';
  document.getElementById('whoami').textContent='TEST MODE';
  document.getElementById('timer').textContent='--:--';
  document.querySelector('#right div:nth-child(2)').textContent='no timer';
  state='play';renderTasks();
  loop();
}

function startGame(chosenId){
  testMode=false;
  week={day:0,points:0,coins:0,streak:0,target:0,dayCoins:0,dayFails:0,chosenId};
  startDay(0);
}
function startDay(d){
  week.day=d;week.dayCoins=0;week.dayFails=0;
  randomiseItemSpots();
  const cfg=DAY_CONFIG[d];week.target=cfg.target;
  const chosenId=week.chosenId;
  const all=['brana','sonja','pedja','nina','daniel','dejan','teonem','steve'];
  NPCS=all.filter(id=>id!==chosenId).map(id=>{const p=POOLS[id];
    const tasks=shuffle(p.pool).slice(0,cfg.tasksPerNPC).map((t,i)=>({...t,id:id+'_'+d+'_'+i,done:false}));
    return{id,name:cap(id),desc:p.desc,x:p.home.x,y:p.home.y,homeX:p.home.x,homeY:p.home.y,wState:'idle',wTimer:60+Math.random()*160,wTarget:null,face:1,speech:null,speechUntil:0,speechTimer:400+Math.random()*700,tasks};});
  player={id:chosenId,name:cap(chosenId),x:6.25*TS,y:12.25*TS,r:12};
  camX=player.x-viewW/(2*1.4);camY=player.y-viewH/(2*1.4);camZoom=1.4;targetZoom=1.4;
  SCREENS.forEach(s=>{const el=document.getElementById(s);if(el)el.style.display='none';});
  const ov=document.getElementById('pauseOverlay');if(ov)ov.style.display='none';
  time=cfg.time;state='play';renderTasks();updateHUD();
  clearInterval(timerId);
  timerId=setInterval(()=>{if(dialogOpen||miniOpen||state==='paused')return;time--;
    if(time<=0){time=0;endDay();}
    const m=String(Math.floor(time/60)).padStart(2,'0'),s=String(time%60).padStart(2,'0');
    document.getElementById('timer').textContent=m+':'+s;},1000);
  loop();
}
function updateHUD(){
  const cfg=DAY_CONFIG[week.day];
  const wa=document.getElementById('whoami');if(wa)wa.innerHTML='<b>'+cfg.name+'</b> (day '+(week.day+1)+'/5)';
  const hud=document.getElementById('econHud');
  if(hud){hud.innerHTML='⭐ <b>'+week.points+'</b>/'+week.target+'pt &nbsp; 🪙 <b>'+week.coins+'</b> &nbsp; 🔥'+week.streak;hud.style.color=week.points>=week.target?'var(--green)':'var(--wood2)';}
}

// ── PAUSE ──────────────────────────────────────────────
let prevState=null,pauseWired=false;
function pauseGame(){if(state!=='play')return;prevState=state;state='paused';
  const ov=document.getElementById('pauseOverlay');if(!ov)return;
  if(!pauseWired){const r=ov.querySelector('#pauseResume'),m=ov.querySelector('#pauseMenu');if(r)r.onclick=resumeGame;if(m)m.onclick=quitToMenu;pauseWired=true;}
  ov.style.display='flex';}
function resumeGame(){if(state!=='paused')return;state=prevState||'play';prevState=null;
  const ov=document.getElementById('pauseOverlay');if(ov)ov.style.display='none';loop();}
function quitToMenu(){clearInterval(timerId);state='start';prevState=null;
  const ov=document.getElementById('pauseOverlay');if(ov)ov.style.display='none';
  closeMini&&closeMini();backToUserMenu();}


function allTasks(){return NPCS.flatMap(n=>n.tasks);}
function npcDone(n){return n.tasks.every(t=>t.done);}
function nextTask(n){return n.tasks.find(t=>!t.done);}
const ML={fetch:'Fetch',deliver:'Deliver',timing:'Timing',simon:'Simon',mash:'Mash',type:'Type',
  memory:'Memory',choose:'Right call',scramble:'Unscramble',catch:'Catch',reflex:'Reflex',math:'Quick math',
  sequence:'Sequence',avoid:'Sort',whack:'Whack',dodge:'Dodge',colormatch:'Color match',count:'Count',
  rhythm:'Rhythm',slider:'Dial in',lockpick:'Lockpick',sortorder:'Order',spotdiff:'Spot it',stack:'Stack',
  wire:'Wire up',pincode:'PIN',balance:'Balance',qte:'Combo',impostor:'Find impostor',trace:'Trace',
  pairs:'Pairs',hold:'Hold it',typerace:'Type race',oddeven:'Odd/Even',target:'Hit target',
  reverse:'Reverse',moving:'Catch it',higherlower:'Higher',gridmem:'Grid memory',stopwatch:'Stopwatch',
  maze:'Maze',spy:'Spy',priority:'Priority',echo:'Echo',splice:'Splice',noise:'Find signal',
  budget:'Budget',crack:'Crack it',jenga:'Jenga',signal:'Signal',forge:'Forge',overload:'Overload'};
function renderTasks(){
  const list=document.getElementById('taskList');list.innerHTML='';
  if(testMode){
    list.innerHTML='<div style="font-size:11px;color:#7a5b34">Walk to any coworker, press E, pick a task to test. All tasks replayable. No timer.</div>';
    document.getElementById('score').textContent=NPCS.reduce((a,n)=>a+n.tasks.length,0)+' tasks';
    return;}
  NPCS.forEach(n=>{const g=document.createElement('div');g.className='npcGroup';const done=npcDone(n);
    let html='<div class="npcName'+(done?' alldone':'')+'">'+(done?'&#10003; ':'')+n.name+'</div>';
    n.tasks.forEach(t=>{html+='<div class="task'+(t.done?' done':'')+'">'+(t.done?'&#10003; ':'&bull; ')+ML[t.type]+'</div>';});
    g.innerHTML=html;list.appendChild(g);});
  const all=allTasks(),d=all.filter(t=>t.done).length;
  document.getElementById('score').textContent=d+' / '+all.length+' done';
  const allDone=all.every(t=>t.done);
  const bd=document.createElement('div');bd.className='npcName'+(allDone?' alldone':'');
  bd.style.marginTop='4px';bd.innerHTML=allDone?'&#9733; Report to Boss Nino!':'&#9733; Nino (locked)';list.appendChild(bd);
}
function setCarry(item,label){carrying=item?{item,label}:null;
  document.getElementById('carry').textContent=carrying?('carrying: '+label):'';}

const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;
  if(e.key==='Escape'){e.preventDefault();if(state==='play')pauseGame();else if(state==='paused')resumeGame();return;}
  if(state==='paused')return;
  if(e.key.toLowerCase()==='e'){e.preventDefault();interact();}
  if(e.key==='+'||e.key==='='){e.preventDefault();window.DEBUG_COLL=!window.DEBUG_COLL;}
  if(e.key.toLowerCase()==='f'){e.preventDefault();tryCigarette();}
  if(e.key===' '&&dialogOpen){e.preventDefault();closeDialog();}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function walkable(t){return t===0||t===10||t===11;}
function canMove(nx,ny,r){for(const[dx,dy]of[[-r,-r],[r,-r],[-r,r],[r,r]]){
  if(!fineWalk(nx+dx,ny+dy))return false;}return true;}
function nearestNPC(){const all=[...NPCS,{id:'nino',name:'Boss Nino',x:19,y:5}];let best=null,bd=58;
  for(const n of all){const nx=n.x*TS+TS/2,ny=n.y*TS+TS/2;const d=Math.hypot(player.x-nx,player.y-ny);
    if(d<bd){bd=d;best=n;}}return best;}
function activeItemSpots(){const need={};
  allTasks().forEach(t=>{if(!t.done&&t.type==='fetch')need[t.item]=ITEM_SPOTS[t.item];});
  if(carrying)delete need[carrying.item]; // hide picked-up item from map
  return need;}
function nearestItem(){const spots=activeItemSpots();let best=null,bd=50;
  for(const k in spots){const s=spots[k];if(!s)continue;const nx=s.x*TS+TS/2,ny=s.y*TS+TS/2;
    const d=Math.hypot(player.x-nx,player.y-ny);if(d<bd){bd=d;best={key:k,...s};}}return best;}

function interact(){
  if(state!=='play'||miniOpen)return;
  if(dialogOpen){closeDialog();return;}
  const item=nearestItem();
  if(item&&!carrying){setCarry(item.key,item.key);openDialog('','Picked up: '+item.key,[{label:'Ok',fn:closeDialog}]);return;}
  const n=nearestNPC();if(!n)return;
  if(n.id==='nino'){
    const delT=allTasks().find(t=>!t.done&&t.type==='deliver'&&t.to==='nino'&&carrying&&carrying.item===t.item);
    if(delT){delT.done=true;const it=carrying.item;const owner=NPCS.find(x=>x.tasks.includes(delT));setCarry(null);
      if(!testMode){const pts=10+Math.floor(Math.random()*11);week.points+=pts;week.streak++;updateHUD();}
      renderTasks();
      openDialog('Boss Nino','Ah, the '+it+' from '+owner.name+'. Good.',
        [{label:'Ok',fn:()=>{closeDialog();openDialog(owner.name,delT.reward,[{label:'ok',fn:()=>{closeDialog();checkBoardCleared();}}]);}}]);return;}
    const allDone=allTasks().every(t=>t.done);
    if(allDone)openDialog('Boss Nino','Whole board clear? Go home. Well done.',[{label:'End shift',fn:()=>{closeDialog();endDay();}}]);
    else{const left=allTasks().filter(t=>!t.done).length;openDialog('Boss Nino','In a million things. Finish the rest — '+left+' left.',[{label:'Got it boss',fn:closeDialog}]);}
    return;}
  if(testMode){ // pick any of this NPC's tasks to test
    const choices=n.tasks.map((t,i)=>({label:(i+1)+'. '+(ML[t.type]||t.type),fn:()=>{closeDialog();startTask(n,t);}}));
    choices.push({label:'Close',cls:'ghost',fn:closeDialog});
    openDialog(n.name+' — pick a task to test',n.desc,choices);return;}
  if(npcDone(n)){const extra=Math.random()<0.5?' '+randIdleLine(n.id):'';openDialog(n.name,'All done here. Appreciate it.'+extra,[{label:'Ok',fn:closeDialog}]);return;}
  const t=nextTask(n);startTask(n,t);
}
function startTask(n,t){
  if(testMode&&(t.type==='fetch'||t.type==='deliver')){
    openDialog(n.name,t.ask,[{label:'Simulate ✓',fn:()=>{closeDialog();finish(n,t);}},{label:'Close',cls:'ghost',fn:closeDialog}]);return;}
  if(t.type==='fetch'){if(carrying&&carrying.item===t.item)finish(n,t);
    else openDialog(n.name,t.ask+' ['+t.itemLabel+' is on the map]',[{label:'On it',fn:closeDialog}]);
  }else if(t.type==='deliver'){if(carrying&&carrying.item===t.item)openDialog(n.name,'You have it — take it to Nino!',[{label:'Ok',fn:closeDialog}]);
    else{setCarry(t.item,t.itemLabel);openDialog(n.name,t.ask+' [take it to Nino]',[{label:'Carrying it',fn:closeDialog}]);}
  }else openDialog(n.name,t.ask,[{label:'Start',fn:()=>{closeDialog();runMini(n,t);}},{label:'Later',cls:'ghost',fn:closeDialog}]);
}
function finish(n,t){if(testMode){renderTasks();openDialog(n.name,t.reward+'  (test: replayable)',[{label:'ok',fn:closeDialog}]);return;}
  t.done=true;
  const cfg=DAY_CONFIG[week.day];
  const pts=10+Math.floor(Math.random()*11);week.points+=pts;week.streak++;
  let coinMsg='';
  if(time>cfg.time*0.5){week.coins+=5;week.dayCoins+=5;coinMsg+=' ⚡+5';}
  if(week.streak===3){week.coins+=15;week.dayCoins+=15;coinMsg+=' 🔥+15';}
  else if(week.streak===5){week.coins+=30;week.dayCoins+=30;coinMsg+=' 🔥+30';}
  updateHUD();renderTasks();
  openDialog(n.name,t.reward+'  (+'+pts+'pt'+coinMsg+')',[{label:'ok',fn:()=>{closeDialog();checkBoardCleared();}}]);
}
function checkBoardCleared(){if(state==='play'&&allTasks().every(x=>x.done))endDay();}

function openDialog(who,txt,choices){dialogOpen=true;
  document.getElementById('dWho').textContent=who;document.getElementById('dTxt').textContent=txt;
  const c=document.getElementById('dChoices');c.innerHTML='';
  (choices||[]).forEach(ch=>{const b=document.createElement('button');b.className='btn'+(ch.cls?' '+ch.cls:'');
    b.textContent=ch.label;b.onclick=ch.fn;c.appendChild(b);});
  document.getElementById('dialog').style.display='block';}
function closeDialog(){dialogOpen=false;document.getElementById('dialog').style.display='none';}

/* ---- minigame framework ---- */
let _countdownCalled=false,_autoTimerStop=null;
// MINI_TIMER is in mini-games.js
function openMini(title,desc,useTimer){miniOpen=true;
  _countdownCalled=false;
  setMiniBackdrop();
  document.getElementById('miniTitle').textContent=title;document.getElementById('miniDesc').textContent=desc;
  const st=document.getElementById('miniStage');st.innerHTML='';
  document.getElementById('mini').style.display='flex';
  const tm=document.getElementById('miniTimer');tm.style.display='block';
  document.getElementById('miniTimerFill').style.width='100%';
  return st;}
function closeMini(){miniOpen=false;document.getElementById('mini').style.display='none';
  if(_autoTimerStop){_autoTimerStop();_autoTimerStop=null;}
  if(activeKeyHandler){document.removeEventListener('keydown',activeKeyHandler);activeKeyHandler=null;}}
function fail(n,msg){if(!testMode){week.streak=0;week.dayFails++;updateHUD();}const b=document.getElementById('miniBox');if(miniOpen&&b){b.classList.add('bad');setTimeout(()=>{b.classList.remove('bad');closeMini();openDialog(n.name,msg,[{label:'Ok',fn:closeDialog}]);},380);}else{closeMini();openDialog(n.name,msg,[{label:'Ok',fn:closeDialog}]);}}
function miniWin(n,t){const b=document.getElementById('miniBox');if(miniOpen&&b){b.classList.add('win');setTimeout(()=>{b.classList.remove('win');closeMini();finish(n,t);},470);}else{closeMini();finish(n,t);}}
function setKey(fn){if(activeKeyHandler)document.removeEventListener('keydown',activeKeyHandler);
  activeKeyHandler=fn;document.addEventListener('keydown',fn);}
function countdown(sec,onExpire){_countdownCalled=true;const fill=document.getElementById('miniTimerFill');let start=Date.now();
  const iv=setInterval(()=>{const el=(Date.now()-start)/1000;const left=Math.max(0,sec-el);
    fill.style.width=(left/sec*100)+'%';if(left<=0){clearInterval(iv);onExpire();}},50);return ()=>clearInterval(iv);}

// runMini + all miniXxx functions are in mini-games.js

function endDay(){
  if(state==='end')return;state='end';clearInterval(timerId);
  const survived=week.points>=week.target;
  if(survived&&week.dayFails===0){week.coins+=50;week.dayCoins+=50;}
  if(!survived){showFired();return;}
  if(week.day>=DAY_CONFIG.length-1){showWeekWin();return;}
  showEndOfDay();
}
function showEndOfDay(){
  const el=document.getElementById('end');el.style.display='flex';
  document.getElementById('endTitle').textContent=DAY_CONFIG[week.day].name.toUpperCase()+' DONE';
  document.getElementById('endTitle').style.color='var(--green)';
  document.getElementById('endSub').textContent='Survived — '+week.points+'/'+week.target+' pt';
  document.getElementById('endMsg').innerHTML='Coins today: <b>'+week.dayCoins+'</b> &nbsp; Total: <b>'+week.coins+'</b><br>Next: <b>'+DAY_CONFIG[week.day+1].name+'</b> — target '+DAY_CONFIG[week.day+1].target+' pt';
  setEndButton('▶ Next day',()=>{el.style.display='none';startDay(week.day+1);});
}
function showWeekWin(){
  bankWeek(true);const el=document.getElementById('end');el.style.display='flex';
  document.getElementById('endTitle').textContent='WEEK SURVIVED!';document.getElementById('endTitle').style.color='var(--gold)';
  document.getElementById('endSub').textContent='Friday cleared';
  document.getElementById('endMsg').innerHTML='Score: <b>'+week.points+' pt</b> &nbsp; Coins banked: <b>'+week.coins+'</b>';
  setEndButton('Back to menu',backToUserMenu);
}
function showFired(){
  bankWeek(false);const el=document.getElementById('firedScreen');
  if(!el){backToUserMenu();return;}el.style.display='flex';
  document.getElementById('firedTitle').textContent="YOU'RE FIRED";
  document.getElementById('firedMsg').innerHTML='"Clean out your desk."<br><br>Made it to <b>'+DAY_CONFIG[week.day].name+'</b> with '+week.points+'/'+week.target+' pt.<br>Coins banked: <b>'+week.coins+' 🪙</b>';
}
function bankWeek(survived){
  if(!currentUser)return;
  currentUser.coins+=week.coins;currentUser.stats.totalCoins+=week.coins;currentUser.stats.weeksPlayed++;
  if(survived)currentUser.stats.weeksSurvived++;
  if(week.points>currentUser.stats.bestScore)currentUser.stats.bestScore=week.points;
  saveCurrent();updateLeaderboard(currentUser.name,currentUser.stats.bestScore);
}
function setEndButton(label,fn){
  const el=document.getElementById('end');let btn=el.querySelector('.endBtn');
  if(!btn){btn=document.createElement('button');btn.className='btn endBtn';btn.style.marginTop='20px';el.appendChild(btn);}
  btn.textContent=label;btn.onclick=fn;
  el.querySelectorAll('button:not(.endBtn)').forEach(b=>b.style.display='none');
}
function endGame(win,reason){endDay();}



/* ---------- STARDEW-STYLE RENDER ---------- */
function drawTile(x,y,t){
  const px=x*TS,py=y*TS;
  if(t===9){ // grass terrace
    const sh=((x*3+y*7)%3);
    ctx.fillStyle=['#4a9e3f','#459a3a','#529f45'][sh];ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(px,py,TS,2);
    if((x*13+y*29)%5===0){ctx.fillStyle='#3d8a33';ctx.fillRect(px+8,py+12,3,6);ctx.fillRect(px+22,py+24,3,6);}
    if((x*7+y*17)%11===0){ctx.fillStyle='#c94f4f';ctx.fillRect(px+14,py+8,4,4);}
    return;}
  if(t===10){ // small terrace slabs
    ctx.fillStyle='#8a8a90';ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#95959b';ctx.fillRect(px+2,py+2,TS-4,TS-4);
    ctx.fillStyle='rgba(20,20,26,.2)';ctx.fillRect(px,py+TS-2,TS,2);ctx.fillRect(px+TS-2,py,2,TS);
    return;}
  if(t===1){ // wall
    ctx.fillStyle='#6b431f';ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#7d5228';ctx.fillRect(px,py,TS,TS-8);
    ctx.fillStyle='#8f6134';ctx.fillRect(px+2,py+2,TS-4,10);
    ctx.fillStyle='#5a3517';ctx.fillRect(px,py+TS-8,TS,8);
    return;}
  if(t===4){ // window on wall
    drawTile(x,y,1);
    ctx.fillStyle='#a8d4e8';ctx.fillRect(px+6,py+4,TS-12,18);
    ctx.fillStyle='#cbe8f4';ctx.fillRect(px+6,py+4,TS-12,7);
    ctx.strokeStyle='#5a3517';ctx.lineWidth=2;ctx.strokeRect(px+6,py+4,TS-12,18);
    ctx.beginPath();ctx.moveTo(px+TS/2,py+4);ctx.lineTo(px+TS/2,py+22);ctx.stroke();
    return;}
  const isBoss=x>=17&&x<=22&&y>=3&&y<=11;
  if(isBoss){ // wood floor (boss office)
    const shade=((x*7+y*13)%3);
    ctx.fillStyle=['#c8955c','#bf8b52','#c99a63'][shade];ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='rgba(90,53,23,.25)';ctx.fillRect(px,py+TS-2,TS,2);
    if((x+y*3)%4===0){ctx.fillStyle='rgba(90,53,23,.2)';ctx.fillRect(px+TS-2,py,2,TS);}
    ctx.fillStyle='rgba(255,240,210,.08)';ctx.fillRect(px,py,TS,3);
  }else{ // gray concrete floor (offices)
    const shade=((x*5+y*11)%3);
    ctx.fillStyle=['#9a9aa2','#8f8f97','#a4a4ac'][shade];ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='rgba(20,20,26,.15)';ctx.fillRect(px,py+TS-1,TS,1);ctx.fillRect(px+TS-1,py,1,TS);
    ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(px,py,TS,2);
  }
  if(t===5){ // rug
    ctx.fillStyle='#8a4a3e';ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='#9e5a4a';ctx.fillRect(px+2,py+2,TS-4,TS-4);
    ctx.fillStyle='#b06b55';if((x+y)%2===0)ctx.fillRect(px+6,py+6,TS-12,TS-12);}
}
function drawDecor(x,y,t){
  const px=x*TS,py=y*TS;
  if(t===2){ // desk with monitor + chair shadow
    ctx.fillStyle='rgba(40,20,5,.25)';ctx.fillRect(px+2,py+TS-6,TS-4,5);
    ctx.fillStyle='#7d4e26';ctx.fillRect(px+1,py+6,TS-2,TS-12);
    ctx.fillStyle='#96613a';ctx.fillRect(px+1,py+6,TS-2,6);
    ctx.fillStyle='#5a3517';ctx.fillRect(px+1,py+TS-8,4,6);ctx.fillRect(px+TS-5,py+TS-8,4,6);
    // monitor
    ctx.fillStyle='#2a2a34';ctx.fillRect(px+9,py+8,18,13);
    ctx.fillStyle='#7ec8e8';ctx.fillRect(px+11,py+10,14,9);
    ctx.fillStyle='#2a2a34';ctx.fillRect(px+16,py+21,4,3);
    // papers
    ctx.fillStyle='#f4ead2';ctx.fillRect(px+4,py+14,7,5);
    return;}
  if(t===3){ // task board
    ctx.fillStyle='#5a3517';ctx.fillRect(px-4,py+2,TS+8,TS-2);
    ctx.fillStyle='#8a6a3a';ctx.fillRect(px-2,py+4,TS+4,TS-6);
    ctx.fillStyle='#f4ead2';ctx.fillRect(px+2,py+8,10,8);ctx.fillRect(px+16,py+8,10,8);
    ctx.fillStyle='#ffe9a8';ctx.fillRect(px+8,py+20,10,8);ctx.fillRect(px+22,py+18,8,8);
    ctx.fillStyle='#c94f4f';ctx.fillRect(px+5,py+9,2,2);ctx.fillRect(px+19,py+9,2,2);ctx.fillRect(px+11,py+21,2,2);
    return;}
  if(t===6){ // plant
    ctx.fillStyle='rgba(40,20,5,.3)';ctx.beginPath();ctx.ellipse(px+TS/2,py+TS-5,10,3,0,0,7);ctx.fill();
    ctx.fillStyle='#a85a2e';ctx.fillRect(px+13,py+24,14,11);
    ctx.fillStyle='#8a4520';ctx.fillRect(px+13,py+24,14,3);
    ctx.fillStyle='#4a8a3a';
    ctx.beginPath();ctx.ellipse(px+20,py+16,10,10,0,0,7);ctx.fill();
    ctx.fillStyle='#5aa848';
    ctx.beginPath();ctx.ellipse(px+15,py+13,6,7,0,0,7);ctx.fill();
    ctx.beginPath();ctx.ellipse(px+25,py+14,6,6,0,0,7);ctx.fill();
    return;}
  if(t===7){ // coffee machine
    ctx.fillStyle='rgba(40,20,5,.3)';ctx.fillRect(px+6,py+TS-6,TS-12,4);
    ctx.fillStyle='#3a3a44';ctx.fillRect(px+8,py+8,24,26);
    ctx.fillStyle='#54545e';ctx.fillRect(px+8,py+8,24,6);
    ctx.fillStyle='#c94f4f';ctx.fillRect(px+12,py+18,6,4);
    ctx.fillStyle='#f4ead2';ctx.fillRect(px+22,py+24,8,8);
    ctx.fillStyle='#6b431f';ctx.fillRect(px+23,py+26,6,5);
    return;}
  if(t===8){ // water cooler
    ctx.fillStyle='rgba(40,20,5,.3)';ctx.fillRect(px+8,py+TS-6,TS-16,4);
    ctx.fillStyle='#e8e8ee';ctx.fillRect(px+11,py+16,18,20);
    ctx.fillStyle='#9ecdea';ctx.fillRect(px+13,py+4,14,14);
    ctx.fillStyle='#c2e4f4';ctx.fillRect(px+13,py+4,14,5);
    ctx.fillStyle='#4a7ab8';ctx.fillRect(px+14,py+22,4,4);
    return;}
  if(t===11){ // round meeting table
    ctx.fillStyle='rgba(40,20,5,.25)';ctx.beginPath();ctx.ellipse(px+TS/2,py+TS/2+3,20,20,0,0,7);ctx.fill();
    ctx.fillStyle='#7d4e26';ctx.beginPath();ctx.arc(px+TS/2,py+TS/2,18,0,7);ctx.fill();
    ctx.fillStyle='#96613a';ctx.beginPath();ctx.arc(px+TS/2,py+TS/2,14,0,7);ctx.fill();
    ctx.fillStyle='#2a2a34';[[-24,0],[24,0],[0,-24],[0,24]].forEach(([dx,dy])=>{
      ctx.fillRect(px+TS/2+dx-6,py+TS/2+dy-6,12,12);});
    return;}
}
function drawItems(){const spots=activeItemSpots();
  const now=Date.now();
  for(const k in spots){const s=spots[k];if(!s)continue;
    const px=s.x*TS+TS/2, py=s.y*TS+TS/2;
    const bob=Math.sin(now/400+s.x)*4;
    const pulse=0.3+Math.sin(now/600+s.y)*0.15;
    // ground shadow (squishes as item bobs up)
    ctx.save();
    ctx.fillStyle='rgba(20,10,5,.3)';
    ctx.beginPath();ctx.ellipse(px,py+12,10+bob*0.4,4-bob*0.3,0,0,7);ctx.fill();
    // pulsing pickup glow on ground
    const gg=ctx.createRadialGradient(px,py+10,2,px,py+10,22);
    gg.addColorStop(0,'rgba(255,220,80,'+pulse+')');gg.addColorStop(1,'rgba(255,180,40,0)');
    ctx.fillStyle=gg;ctx.beginPath();ctx.ellipse(px,py+10,22,10,0,0,7);ctx.fill();
    ctx.restore();
    // item body
    ctx.save();ctx.translate(px,py+bob-6);ctx.lineJoin='round';
    const S=1.3; // scale up items a bit
    ctx.scale(S,S);
    if(s.icon==='doc'){
      ctx.save();ctx.rotate(-0.1);ctx.fillStyle='#c9bfa0';ctx.fillRect(-7,-8,14,18);ctx.restore();
      ctx.fillStyle='#f5ecd6';ctx.fillRect(-6,-9,14,18);
      ctx.strokeStyle='rgba(120,90,50,.4)';ctx.lineWidth=0.8;ctx.strokeRect(-6,-9,14,18);
      ctx.fillStyle='#8a6a3a';for(let i=0;i<4;i++)ctx.fillRect(-3,-6+i*3.8,9,1.2);
      ctx.fillStyle='#c0392b';ctx.fillRect(3,4,3,3);}
    else if(s.icon==='inv'){
      ctx.fillStyle='#f5ecd6';ctx.fillRect(-7,-10,15,19);
      ctx.strokeStyle='rgba(120,90,50,.4)';ctx.lineWidth=0.8;ctx.strokeRect(-7,-10,15,19);
      ctx.fillStyle='#7a5a30';for(let i=0;i<3;i++)ctx.fillRect(-4,-7+i*3.2,10,1.2);
      ctx.fillStyle='#2e7d46';ctx.font='bold 7px monospace';ctx.textAlign='left';ctx.fillText('$',-4,6);
      ctx.strokeStyle='#c0392b';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(3,4,3.5,0,7);ctx.stroke();
      ctx.fillStyle='rgba(192,57,43,.15)';ctx.beginPath();ctx.arc(3,4,3.5,0,7);ctx.fill();}
    else if(s.icon==='cig'){
      ctx.fillStyle='#e8ecef';ctx.fillRect(-7,-3,14,11);
      ctx.strokeStyle='rgba(80,60,40,.35)';ctx.lineWidth=0.8;ctx.strokeRect(-7,-3,14,11);
      ctx.fillStyle='#c0392b';ctx.fillRect(-7,-3,14,4);
      ctx.fillStyle='#ddd';ctx.fillRect(-5,2,3,1);ctx.fillRect(-1,2,3,1);ctx.fillRect(3,2,3,1);
      ctx.fillStyle='#f7f4ee';ctx.fillRect(3,-10,3,8);ctx.fillStyle='#e8a03c';ctx.fillRect(3,-10,3,2);
      ctx.fillStyle='rgba(180,180,180,.4)';ctx.beginPath();ctx.arc(4.5,-12,2,0,7);ctx.fill();}
    else if(s.icon==='vape'){
      ctx.fillStyle='#2b2b36';
      const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();};
      rr(-3,-10,8,20,2);ctx.fill();ctx.strokeStyle='rgba(100,100,120,.5)';ctx.lineWidth=0.6;ctx.stroke();
      ctx.fillStyle='#6ab8d8';ctx.fillRect(-1.5,-6,5,6);
      ctx.fillStyle='#e86b4a';ctx.fillRect(-1.5,-10,5,2);
      const t2=now/200;ctx.fillStyle='rgba(200,220,240,.45)';
      ctx.beginPath();ctx.arc(1.5,-13,2.5+Math.sin(t2)*0.5,0,7);ctx.fill();
      ctx.fillStyle='rgba(200,220,240,.25)';ctx.beginPath();ctx.arc(3,-16,1.8+Math.sin(t2+1)*0.4,0,7);ctx.fill();}
    else if(s.icon==='ltr'){
      ctx.fillStyle='#b8332a';
      const rr2=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();};
      rr2(-4,-5,10,14,1.5);ctx.fill();ctx.strokeStyle='rgba(60,20,15,.4)';ctx.lineWidth=0.6;ctx.stroke();
      ctx.fillStyle='#9aa0a6';ctx.fillRect(-3,-8,8,4);
      // flame with flicker
      const flk=Math.sin(now/80)*1.5;
      ctx.fillStyle='#f5a623';ctx.beginPath();ctx.moveTo(0.5,-9);ctx.quadraticCurveTo(4+flk,-13,0.5,-17);ctx.quadraticCurveTo(-3-flk,-13,0.5,-9);ctx.fill();
      ctx.fillStyle='#fde68a';ctx.beginPath();ctx.moveTo(0.5,-10);ctx.quadraticCurveTo(2+flk*0.5,-12.5,0.5,-15);ctx.quadraticCurveTo(-1-flk*0.5,-12.5,0.5,-10);ctx.fill();}
    else if(s.icon==='rtr'){
      ctx.fillStyle='#2a2a34';ctx.fillRect(-11,-5,22,12);
      ctx.strokeStyle='rgba(80,80,90,.4)';ctx.lineWidth=0.6;ctx.strokeRect(-11,-5,22,12);
      ctx.fillStyle='#444';ctx.fillRect(-9,-4,18,2);
      const blink=Math.sin(now/300+s.x)>0;
      ctx.fillStyle=blink?'#5adf48':'#3a8a30';ctx.beginPath();ctx.arc(-5,2,2,0,7);ctx.fill();
      ctx.fillStyle='#e8a03c';ctx.beginPath();ctx.arc(0,2,2,0,7);ctx.fill();
      ctx.fillStyle='#555';ctx.fillRect(-8,-12,2.5,8);ctx.fillRect(6,-12,2.5,8);}
    else if(s.icon==='cup'){
      ctx.fillStyle='#f4ead2';ctx.fillRect(-7,-7,14,14);
      ctx.strokeStyle='rgba(120,90,50,.35)';ctx.lineWidth=0.8;ctx.strokeRect(-7,-7,14,14);
      ctx.fillStyle='#5a3517';ctx.fillRect(-5,-5,10,10);
      ctx.fillStyle='#f4ead2';ctx.fillRect(7,-4,4,5);ctx.fillRect(7,-4,4,1.2);ctx.fillRect(7,0,4,1.2);
      // steam
      ctx.strokeStyle='rgba(200,200,200,.35)';ctx.lineWidth=1;
      const st=now/250;
      ctx.beginPath();ctx.moveTo(-2,-8);ctx.quadraticCurveTo(-4+Math.sin(st)*2,-13,-2,-16);ctx.stroke();
      ctx.beginPath();ctx.moveTo(2,-8);ctx.quadraticCurveTo(4+Math.sin(st+1)*2,-13,2,-16);ctx.stroke();}
    else if(s.icon==='lap'){
      ctx.fillStyle='#333';ctx.fillRect(-10,-7,20,13);
      ctx.strokeStyle='rgba(80,80,90,.4)';ctx.lineWidth=0.6;ctx.strokeRect(-10,-7,20,13);
      ctx.fillStyle='#1a6aaa';ctx.fillRect(-8,-5,16,9);
      // screen content
      ctx.fillStyle='#3a9ae0';ctx.fillRect(-6,-3,8,1);ctx.fillRect(-6,0,5,1);ctx.fillRect(-6,2,7,1);
      // power led
      ctx.fillStyle='#5adf48';ctx.beginPath();ctx.arc(7,4,1,0,7);ctx.fill();}
    ctx.restore();
    // label
    ctx.textAlign='center';ctx.font='bold 10px monospace';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(10,5,0,.6)';ctx.strokeText(k,px,py-22+bob);
    ctx.fillStyle='#f5ecd6';ctx.fillText(k,px,py-22+bob);}}

function drawNameTag(px,py,name,done){
  if(done!==null){ // quest marker only, no name box
    ctx.font='bold 16px monospace';ctx.textAlign='center';
    ctx.fillStyle=done?'#5a9e4b':'#e8b93c';
    ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=3;
    ctx.strokeText(done?'\u2713':'!',px,py+2);
    ctx.fillText(done?'\u2713':'!',px,py+2);}
}
function drawSpeechBubble(px,py,text){
  ctx.save();ctx.font='11px monospace';ctx.textAlign='center';
  const padX=8,padY=5,w=ctx.measureText(text).width+padX*2,h=16+padY;
  const bx=px-w/2,by=py-h;
  ctx.globalAlpha=0.94;
  ctx.fillStyle='#f5f0e0';ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,w,h,6):ctx.rect(bx,by,w,h);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(px-5,by+h);ctx.lineTo(px+5,by+h);ctx.lineTo(px,by+h+7);ctx.closePath();
  ctx.fillStyle='#f5f0e0';ctx.fill();ctx.stroke();
  ctx.fillStyle='#2a2015';ctx.fillText(text,px,by+h-6);
  ctx.restore();
}

// Gentle idle wander (short leash around desk) + random ambient thought-bubble lines.
const WANDER_LEASH=1.35, WANDER_SPEED=0.016;
function updateNPCs(){
  NPCS.forEach(n=>{
    // ambient speech, independent of movement
    n.speechTimer--;
    if(n.speechTimer<=0){n.speech=randIdleLine(n.id);n.speechUntil=frame+320;n.speechTimer=480+Math.random()*760;}
    // wander state machine
    if(n.wState==='idle'){
      n.wTimer--;
      if(n.wTimer<=0){
        const ang=Math.random()*Math.PI*2,dist=Math.random()*WANDER_LEASH;
        const tx=n.homeX+Math.cos(ang)*dist, ty=n.homeY+Math.sin(ang)*dist;
        const px=tx*TS+TS/2, py=ty*TS+TS/2;
        if(canMove(px,py,10)){n.wTarget={x:tx,y:ty};n.wState='walk';}
        else n.wTimer=30+Math.random()*60;
      }
    }else if(n.wState==='walk'){
      const dx=n.wTarget.x-n.x, dy=n.wTarget.y-n.y, d=Math.hypot(dx,dy);
      if(d<0.04){n.x=n.wTarget.x;n.y=n.wTarget.y;n.wState='idle';n.wTimer=90+Math.random()*220;}
      else{
        const stepX=(dx/d)*WANDER_SPEED, stepY=(dy/d)*WANDER_SPEED;
        const nx=n.x+stepX, ny=n.y+stepY;
        const pxn=nx*TS+TS/2, pyn=ny*TS+TS/2;
        if(canMove(pxn,ny*TS+TS/2,10))n.x=nx; else n.wState='idle',n.wTimer=60;
        if(canMove(n.x*TS+TS/2,pyn,10))n.y=ny;
        if(Math.abs(stepX)>0.0008)n.face=stepX<0?-1:1;
      }
    }
  });
}

// ══════════════════════════════════════════════════════
// NEW MECHANICS
// ══════════════════════════════════════════════════════

/* WORDLE — guess the hidden 5-letter word in 6 tries.
   t.word = the answer (5 uppercase letters). */
function miniWordle(n,t){
  const ans=(t.word||'CRASH').toUpperCase();
  const ROWS=6,COLS=5;
  let row=0,col=0,done=false;
  const grid=Array.from({length:ROWS},()=>Array(COLS).fill(''));
  const st=openMini('WORDLE','Guess the 5-letter word. Green=right spot, Yellow=wrong spot, Grey=not in word.');
  const renderGrid=()=>{
    let html='<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px">';
    for(let r=0;r<ROWS;r++){
      html+='<div style="display:flex;gap:4px">';
      for(let c=0;c<COLS;c++){
        const ch=grid[r][c]||'';
        let bg='var(--paper2)';let col2='var(--inkbrown)';let border='2px solid var(--wood2)';
        if(r<row){
          if(ch===ans[c]){bg='#2e7d46';col2='#fff';border='2px solid #2e7d46';}
          else if(ans.includes(ch)){bg='#b07d18';col2='#fff';border='2px solid #b07d18';}
          else{bg='#555';col2='#fff';border='2px solid #555';}
        }else if(r===row){border='2px solid var(--accent)';}
        html+=`<div style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;border-radius:4px;background:${bg};color:${col2};border:${border}">${ch}</div>`;
      }
      html+='</div>';
    }
    html+='</div>';
    html+=`<div id="wdMsg" style="font-size:12px;color:var(--wood);text-align:center;min-height:16px"></div>`;
    html+=`<div style="font-size:11px;color:var(--wood2);text-align:center;margin-top:6px">Type letters, ENTER to guess, BACKSPACE to delete</div>`;
    st.innerHTML=html;
  };
  renderGrid();
  setKey(e=>{
    if(done)return;
    if(e.key==='Backspace'){if(col>0){col--;grid[row][col]='';renderGrid();}return;}
    if(e.key==='Enter'){
      if(col<COLS){document.getElementById('wdMsg').textContent='Not enough letters.';return;}
      const guess=grid[row].join('');
      if(guess===ans){done=true;renderGrid();setTimeout(()=>miniWin(n,t),600);return;}
      row++;col=0;renderGrid();
      if(row>=ROWS){done=true;setTimeout(()=>fail(n,`The word was ${ans}. [E]`),400);}
      return;
    }
    if(/^[a-zA-Z]$/.test(e.key)&&col<COLS){grid[row][col]=e.key.toUpperCase();col++;renderGrid();}
  });
}

/* MINESWEEPER — clear a small grid without hitting mines.
   t.size=5 (5×5), t.mines=4. Click safe cells, flag mines with right-click. */
function miniMinesweeper(n,t){
  const SIZE=t.size||5, MINES=t.mines||4;
  let done=false,firstClick=true;
  const cells=Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  const mines=new Set();const revealed=new Set();const flagged=new Set();
  const key=( r,c)=>r*SIZE+c;
  const adj=(r,c)=>{const a=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE)a.push([nr,nc]);}return a;};
  const placeMines=(sr,sc)=>{const pool=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(Math.abs(r-sr)>1||Math.abs(c-sc)>1)pool.push([r,c]);shuffle(pool).slice(0,MINES).forEach(([r,c])=>mines.add(key(r,c)));for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)cells[r][c]=[...adj(r,c)].filter(([ar,ac])=>mines.has(key(ar,ac))).length;};
  const flood=(r,c)=>{if(revealed.has(key(r,c))||mines.has(key(r,c)))return;revealed.add(key(r,c));if(cells[r][c]===0)adj(r,c).forEach(([ar,ac])=>flood(ar,ac));};
  const COLORS=['','#1565c0','#2e7d46','#c0392b','#6a1b9a','#b07d18','#00838f','#000','#555'];
  const render=()=>{
    let html='<div style="display:inline-flex;flex-direction:column;gap:2px;margin-bottom:8px">';
    for(let r=0;r<SIZE;r++){
      html+='<div style="display:flex;gap:2px">';
      for(let c=0;c<SIZE;c++){
        const k=key(r,c);const isRev=revealed.has(k);const isFlag=flagged.has(k);const isMine=mines.has(k);
        let bg=isRev?'#d9bd8a':'var(--paper2)';let txt='';let color='';let border='1px solid var(--wood2)';
        if(isRev&&isMine){bg='#c0392b';txt='💣';}
        else if(isRev&&cells[r][c]>0){txt=cells[r][c];color=COLORS[cells[r][c]];}
        else if(isFlag){txt='🚩';bg='#fff3cd';}
        html+=`<div class="msCell" data-r="${r}" data-c="${c}" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border-radius:3px;background:${bg};color:${color};border:${border};cursor:pointer;user-select:none">${txt}</div>`;
      }
      html+='</div>';
    }
    html+='</div>';
    const safe=SIZE*SIZE-MINES;const rem=safe-revealed.size;
    html+=`<div style="font-size:12px;color:var(--wood);text-align:center">${rem} safe cells left &nbsp;|&nbsp; right-click to flag mines</div>`;
    st.innerHTML=html;
    st.querySelectorAll('.msCell').forEach(el=>{
      el.onclick=()=>{
        if(done)return;
        const r=+el.dataset.r,c=+el.dataset.c,k2=key(r,c);
        if(flagged.has(k2)||revealed.has(k2))return;
        if(firstClick){firstClick=false;placeMines(r,c);}
        if(mines.has(k2)){done=true;revealed.add(k2);render();setTimeout(()=>fail(n,'BOOM — hit a mine. [E]'),500);return;}
        flood(r,c);
        const safe2=SIZE*SIZE-MINES;
        if(revealed.size>=safe2){done=true;render();setTimeout(()=>miniWin(n,t),400);}
        else render();
      };
      el.oncontextmenu=e=>{e.preventDefault();if(done)return;const k2=key(+el.dataset.r,+el.dataset.c);if(revealed.has(k2))return;flagged.has(k2)?flagged.delete(k2):flagged.add(k2);render();};
    });
  };
  const st=openMini('MINESWEEPER',`Clear ${SIZE*SIZE-MINES} safe cells. Right-click to flag mines.`);
  render();
}

/* 2048 — merge tiles to reach 2048 (or a lower target for quick games).
   t.target = 128 (fast) or 256 (medium). Arrow keys to slide. */
function mini2048(n,t){
  const TARGET=t.target||128;
  const G=4;let done=false;
  let board=Array.from({length:G},()=>Array(G).fill(0));
  const addRandom=()=>{const empty=[];board.forEach((row,r)=>row.forEach((v,c)=>{if(!v)empty.push([r,c]);}));if(!empty.length)return;const[r,c]=rnd(empty);board[r][c]=Math.random()<0.9?2:4;};
  addRandom();addRandom();
  const COLORS={0:'#cdc1b4',2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
  const render=()=>{
    let html='<div style="display:inline-flex;flex-direction:column;gap:5px;background:#bbada0;padding:6px;border-radius:8px;margin-bottom:8px">';
    board.forEach(row=>{
      html+='<div style="display:flex;gap:5px">';
      row.forEach(v=>{const bg=COLORS[v]||'#3c3a32';const col=v>4?'#f9f6f2':'#776e65';const fs=v>99?v>999?'16px':'18px':'22px';
        html+=`<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:${fs};border-radius:4px;background:${bg};color:${col}">${v||''}</div>`;});
      html+='</div>';});
    html+=`</div><div style="font-size:12px;color:var(--wood);text-align:center">Arrow keys to merge. Reach ${TARGET}!</div>`;
    st.innerHTML=html;
  };
  const slide=(row)=>{const r=row.filter(v=>v);for(let i=0;i<r.length-1;i++)if(r[i]===r[i+1]){r[i]*=2;r.splice(i+1,1);}while(r.length<G)r.push(0);return r;};
  const move=(dir)=>{if(done)return;let moved=false;const b=board.map(r=>[...r]);
    if(dir==='left')board=board.map(r=>{const s=slide(r);if(s.join()!==r.join())moved=true;return s;});
    else if(dir==='right')board=board.map(r=>{const s=slide([...r].reverse()).reverse();if(s.join()!==r.join())moved=true;return s;});
    else if(dir==='up'){for(let c=0;c<G;c++){const col=board.map(r=>r[c]);const s=slide(col);s.forEach((v,r)=>{if(v!==board[r][c])moved=true;board[r][c]=v;});}}
    else if(dir==='down'){for(let c=0;c<G;c++){const col=board.map(r=>r[c]).reverse();const s=slide(col).reverse();s.forEach((v,r)=>{if(v!==board[r][c])moved=true;board[r][c]=v;});}}
    if(!moved)return;addRandom();
    const max=Math.max(...board.flat());
    if(max>=TARGET){done=true;render();setTimeout(()=>miniWin(n,t),400);return;}
    const hasMoves=board.some((row,r)=>row.some((v,c)=>!v||[[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc])=>{const nr=r+dr,nc=c+dc;return nr>=0&&nr<G&&nc>=0&&nc<G&&board[nr][nc]===v;})));
    if(!hasMoves){done=true;render();setTimeout(()=>fail(n,`No moves left — reached ${max}, needed ${TARGET}. [E]`),400);return;}
    render();
  };
  const st=openMini('2048',`Merge tiles to reach ${TARGET}. Arrow keys.`);
  render();
  setKey(e=>{const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(map[e.key]){e.preventDefault();move(map[e.key]);}});
}

/* FLOW FREE — connect matching color dots with pipes. No cell left uncovered.
   t.size = grid size (5). t.pairs = [{color,from:[r,c],to:[r,c]},...]. */
function miniFlowFree(n,t){
  const SIZE=t.size||5;
  const PAIRS=t.pairs||[
    {color:'#e03030',from:[0,0],to:[4,4]},
    {color:'#2e7d46',from:[0,4],to:[4,0]},
    {color:'#1565c0',from:[0,2],to:[4,2]},
    {color:'#b07d18',from:[2,0],to:[2,4]},
  ];
  let done=false;
  // grid[r][c] = color string or null
  const grid=Array.from({length:SIZE},()=>Array(SIZE).fill(null));
  // place endpoints
  const endpoints=new Map();
  PAIRS.forEach(p=>{
    grid[p.from[0]][p.from[1]]=p.color;
    grid[p.to[0]][p.to[1]]=p.color;
    endpoints.set(p.from[0]*SIZE+p.from[1],p.color);
    endpoints.set(p.to[0]*SIZE+p.to[1],p.color);
  });
  let drawing=null,drawColor=null;
  const render=()=>{
    let html=`<div style="display:inline-flex;flex-direction:column;gap:3px;background:#1a1a2e;padding:6px;border-radius:8px;margin-bottom:8px">`;
    for(let r=0;r<SIZE;r++){
      html+='<div style="display:flex;gap:3px">';
      for(let c=0;c<SIZE;c++){
        const k=r*SIZE+c;const isEnd=endpoints.has(k);
        const fill=grid[r][c]?grid[r][c]:'#2a2a3e';
        const border=isEnd?`3px solid ${endpoints.get(k)||'#555'}`:'1px solid #3a3a5e';
        const inner=isEnd?`<div style="width:18px;height:18px;border-radius:50%;background:${endpoints.get(k)}"></div>`:'';
        html+=`<div class="ffCell" data-r="${r}" data-c="${c}" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:4px;background:${fill};border:${border};cursor:pointer">${inner}</div>`;
      }
      html+='</div>';
    }
    html+=`</div><div style="font-size:12px;color:var(--wood);text-align:center">Click a dot to start, drag to connect. Fill every cell.</div>`;
    st.innerHTML=html;
    st.querySelectorAll('.ffCell').forEach(el=>{
      el.onmousedown=e=>{e.preventDefault();const r=+el.dataset.r,c=+el.dataset.c,k=r*SIZE+c;
        if(endpoints.has(k)){drawing=[r,c];drawColor=endpoints.get(k);// clear existing path of this color
          for(let gr=0;gr<SIZE;gr++)for(let gc=0;gc<SIZE;gc++)if(grid[gr][gc]===drawColor&&!endpoints.has(gr*SIZE+gc))grid[gr][gc]=null;
          grid[r][c]=drawColor;render();}};
      el.onmouseenter=()=>{if(!drawing||!drawColor||done)return;const r=+el.dataset.r,c=+el.dataset.c;
        const[pr,pc]=drawing;if(Math.abs(r-pr)+Math.abs(c-pc)!==1)return;// must be adjacent
        const k=r*SIZE+c;
        if(endpoints.has(k)&&endpoints.get(k)!==drawColor)return;// can't overwrite other endpoint
        if(grid[r][c]&&grid[r][c]!==drawColor&&!endpoints.has(k))return;
        grid[r][c]=drawColor;drawing=[r,c];
        // check win: all cells filled and all pairs connected
        const allFilled=grid.every(row=>row.every(v=>v));
        if(allFilled){const allConnected=PAIRS.every(p=>{// BFS from p.from to p.to through same color
          const visited=new Set();const q=[p.from];while(q.length){const[cr,cc]=q.shift();if(cr===p.to[0]&&cc===p.to[1])return true;const ck=cr*SIZE+cc;if(visited.has(ck))continue;visited.add(ck);[[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{const nr=cr+dr,nc=cc+dc;if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&grid[nr][nc]===p.color)q.push([nr,nc]);});}return false;});
          if(allConnected){done=true;render();setTimeout(()=>miniWin(n,t),400);}
        }
        render();};
    });
    document.onmouseup=()=>{drawing=null;drawColor=null;};
  };
  const st=openMini('FLOW','Connect matching dots with pipes. Fill every cell.');
  render();
}

/* HIDDEN OBJECTS — find hidden items in a cluttered office scene drawn on canvas. */
function miniHidden(n,t){
  const items=t.items||[
    {label:'USB',emoji:'🔌',x:0,y:0},
    {label:'Key',emoji:'🔑',x:0,y:0},
    {label:'Badge',emoji:'🪪',x:0,y:0},
  ];
  const W=320,H=200;
  // place items at random non-overlapping positions
  const placed=[];
  items.forEach(item=>{let tries=0,ok=false;while(!ok&&tries<100){const x=20+Math.floor(Math.random()*(W-50)),y=20+Math.floor(Math.random()*(H-50));ok=placed.every(p=>Math.hypot(p.x-x,p.y-y)>36);if(ok){item.x=x;item.y=y;placed.push(item);}tries++;}});
  let found=new Set(),done=false;
  const noise=['📎','📌','✏️','📋','🖇️','📐','🗂️','📂','🖊️','📏','🗃️','📓'];
  const render=()=>{
    let html=`<div style="position:relative;width:${W}px;height:${H}px;background:#e4cd9d;border:3px solid var(--wood2);border-radius:8px;overflow:hidden;cursor:crosshair" id="hdScene">`;
    // scatter noise items
    for(let i=0;i<18;i++){const nx=10+Math.floor(Math.random()*(W-30)),ny=10+Math.floor(Math.random()*(H-30));html+=`<div style="position:absolute;left:${nx}px;top:${ny}px;font-size:18px;opacity:.55;pointer-events:none">${noise[i%noise.length]}</div>`;}
    // place hidden items (smaller + blended)
    items.forEach(item=>{const opacity=found.has(item.label)?'1':'0.5';const scale=found.has(item.label)?'1.3':'0.85';
      html+=`<div class="hdItem" data-label="${item.label}" style="position:absolute;left:${item.x}px;top:${item.y}px;font-size:20px;transform:scale(${scale}) rotate(${Math.random()*40-20}deg);opacity:${opacity};cursor:pointer;transition:.2s">${item.emoji}</div>`;});
    html+='</div>';
    const left=items.length-found.size;
    html+=`<div style="font-size:12px;color:var(--wood);text-align:center;margin-top:6px">Find: ${items.filter(i=>!found.has(i.label)).map(i=>i.emoji+' '+i.label).join('  ')} &nbsp; (${left} left)</div>`;
    st.innerHTML=html;
    st.querySelectorAll('.hdItem').forEach(el=>{
      el.onclick=()=>{if(done)return;const lbl=el.dataset.label;if(found.has(lbl))return;found.add(lbl);
        if(found.size>=items.length){done=true;render();setTimeout(()=>miniWin(n,t),400);}else render();};
    });
  };
  const st=openMini('FIND IT',`Find the hidden objects in the office clutter.`);
  render();
}


// ══════════════════════════════════════════════════════
// NEW MECHANICS — ROUND 2
// ══════════════════════════════════════════════════════

/* TYPING TEST — type the passage as fast and accurately as possible.
   t.passage = the text to type. Errors turn red and must be corrected. */
function miniTypingTest(n,t){
  const passage=t.passage||'The quarterly report is due at noon. All figures must be verified before submission.';
  let typed='',done=false,startT=0,started=false;
  const st=openMini('TYPING TEST','Type the text below as fast as you can. Errors must be fixed.');
  const render=()=>{
    let disp='';
    for(let i=0;i<passage.length;i++){
      if(i<typed.length){
        if(typed[i]===passage[i])disp+=`<span style="color:var(--green)">${passage[i]==' '?'&nbsp;':passage[i]}</span>`;
        else disp+=`<span style="background:#c0392b;color:#fff;border-radius:2px">${passage[i]==' '?'&nbsp;':passage[i]}</span>`;
      }else if(i===typed.length){
        disp+=`<span style="background:var(--accent);color:#fff;border-radius:2px">${passage[i]==' '?'&nbsp;':passage[i]}</span>`;
      }else{
        disp+=`<span style="color:var(--wood2)">${passage[i]==' '?'&nbsp;':passage[i]}</span>`;
      }
    }
    const wpm=started?Math.round((typed.length/5)/((Date.now()-startT)/60000)):0;
    const errors=[...typed].filter((ch,i)=>ch!==passage[i]).length;
    st.innerHTML=`<div style="font:15px/1.8 monospace;max-width:340px;background:var(--paper2);padding:10px 12px;border-radius:8px;border:2px solid var(--wood2);letter-spacing:.03em">${disp}</div>`+
      `<div style="display:flex;gap:18px;margin-top:8px;font-size:12px;color:var(--wood)"><span>WPM: <b>${wpm}</b></span><span>Errors: <b style="color:${errors?'#c0392b':'var(--green)'}">${errors}</b></span></div>`+
      `<div style="font-size:11px;color:var(--wood2);margin-top:4px">Type here — errors must be corrected with Backspace</div>`;
  };
  render();
  setKey(e=>{
    if(done)return;
    if(e.key==='Backspace'){if(typed.length)typed=typed.slice(0,-1);render();return;}
    if(e.key.length===1){
      if(!started){started=true;startT=Date.now();}
      typed+=e.key;render();
      if(typed.length>=passage.length){
        const errors=[...typed].filter((ch,i)=>ch!==passage[i]).length;
        if(errors===0){done=true;miniWin(n,t);}
        else{typed=typed.slice(0,-1);render();} // don't advance past end with errors
      }
    }
  });
}

/* TETRIS — clear the target number of lines. 7×14 grid, standard pieces. */
function miniTetris(n,t){
  const COLS=7,ROWS=14,TARGET=t.lines||3;
  const PIECES=[
    [[1,1,1,1]],                        // I
    [[1,1],[1,1]],                       // O
    [[0,1,0],[1,1,1]],                   // T
    [[1,0,0],[1,1,1]],                   // L
    [[0,0,1],[1,1,1]],                   // J
    [[0,1,1],[1,1,0]],                   // S
    [[1,1,0],[0,1,1]],                   // Z
  ];
  const COLORS=['#00bcd4','#ffeb3b','#9c27b0','#ff9800','#2196f3','#4caf50','#f44336'];
  let board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  let cur=null,curX=0,curY=0,curColor=0,linesCleared=0,done=false,gameOver=false;
  const st=openMini('TETRIS',`Clear ${TARGET} lines. ←→ move, ↑ rotate, ↓ drop.`,true);

  const newPiece=()=>{const idx=Math.floor(Math.random()*PIECES.length);cur=PIECES[idx].map(r=>[...r]);curColor=idx;curX=Math.floor((COLS-cur[0].length)/2);curY=0;
    if(!fits(cur,curX,curY)){gameOver=true;done=true;stopT();fail(n,'Stack reached the top. [E]');}};
  const fits=(p,x,y)=>p.every((row,r)=>row.every((v,c)=>!v||(y+r>=0&&y+r<ROWS&&x+c>=0&&x+c<COLS&&!board[y+r][x+c])));
  const place=()=>{cur.forEach((row,r)=>row.forEach((v,c)=>{if(v)board[curY+r][curX+c]=curColor+1;}));
    // clear full lines
    let cleared=0;
    for(let r=ROWS-1;r>=0;r--){if(board[r].every(v=>v)){board.splice(r,1);board.unshift(Array(COLS).fill(0));cleared++;r++;}}
    linesCleared+=cleared;
    if(linesCleared>=TARGET){done=true;stopT();render();setTimeout(()=>miniWin(n,t),400);return;}
    newPiece();};
  const rotate=(p)=>p[0].map((_,i)=>p.map(r=>r[i]).reverse());

  const render=()=>{
    const cell=(v,ghost=false)=>{const colors=['#2a2015','#00bcd4','#ffeb3b','#9c27b0','#ff9800','#2196f3','#4caf50','#f44336'];
      return `<div style="width:22px;height:22px;border-radius:2px;background:${ghost?'rgba(255,255,255,.12)':colors[v]};border:1px solid rgba(0,0,0,.3);box-sizing:border-box"></div>`;};
    // ghost piece
    let ghostY=curY;if(cur&&!gameOver){while(fits(cur,curX,ghostY+1))ghostY++;}
    const display=board.map(r=>[...r]);
    if(cur&&!gameOver){
      cur.forEach((row,r)=>row.forEach((v,c)=>{if(v&&ghostY+r<ROWS&&display[ghostY+r][curX+c]===0)display[ghostY+r][curX+c]=-1;}));
      cur.forEach((row,r)=>row.forEach((v,c)=>{if(v&&curY+r>=0)display[curY+r][curX+c]=curColor+1;}));
    }
    st.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start">'+
      '<div style="display:flex;flex-direction:column;gap:1px;background:#1a1008;padding:4px;border-radius:6px;border:2px solid var(--wood2)">'+
      display.map(row=>`<div style="display:flex;gap:1px">${row.map(v=>cell(v===-1?0:v,v===-1)).join('')}</div>`).join('')+
      '</div>'+
      `<div style="font-size:12px;color:var(--wood);padding-top:4px">Lines:<br><b style="font-size:20px">${linesCleared}/${TARGET}</b></div>`+
      '</div>';
  };

  newPiece();render();
  const dropInterval=setInterval(()=>{if(done)return;
    if(fits(cur,curX,curY+1))curY++;else place();render();},600);

  setKey(e=>{if(done)return;
    if(e.key==='ArrowLeft'){if(fits(cur,curX-1,curY))curX--;}
    else if(e.key==='ArrowRight'){if(fits(cur,curX+1,curY))curX++;}
    else if(e.key==='ArrowDown'){if(fits(cur,curX,curY+1))curY++;else{place();}}
    else if(e.key==='ArrowUp'){const r=rotate(cur);if(fits(r,curX,curY))cur=r;}
    else if(e.key===' '){e.preventDefault();while(fits(cur,curX,curY+1))curY++;place();}
    else return;
    e.preventDefault();render();});

  const stopT=countdown(60,()=>{if(!done){done=true;clearInterval(dropInterval);fail(n,'Time ran out — stack unsorted. [E]');}});
  // patch closeMini to clear drop interval
  const origClose=closeMini;
  // cleanup on close — handled by existing closeMini; clearInterval when done flag set
  const cleanup=()=>clearInterval(dropInterval);
  // wire cleanup via done flag poll — simpler: just clear when done is set
  const poll=setInterval(()=>{if(done){clearInterval(dropInterval);clearInterval(poll);}},100);
}

/* PIPE PUZZLE — rotate tiles to connect the source to the sink.
   t.size = grid size (4). Each cell has a pipe type and rotation. */
function miniPipe(n,t){
  const SZ=t.size||4;
  // pipe types: which sides they connect (N,E,S,W as bits 8,4,2,1)
  // straight: N+S=10, E+W=5; corner: N+E=12,E+S=6,S+W=3,N+W=9; T: N+E+S=14,E+S+W=7,S+W+N=11,W+N+E=13; cross=15; end=8,4,2,1
  const TYPES={straight:[10,5],corner:[12,6,3,9],tee:[14,7,11,13],cross:[15]};
  const N=8,E=4,S=2,W=1;
  const rotateBits=(b)=>((b>>1)|(b&1)<<3)&15; // rotate CW: N→E→S→W
  // generate a random solvable grid
  let grid,solved;
  const generate=()=>{
    // start with solved state, then scramble rotations
    solved=Array.from({length:SZ},()=>Array(SZ).fill(0));
    // simple path approach: fill grid with pipe types that form a connected network
    // For simplicity: random valid pipe for each cell based on neighbors
    const allTypes=[...TYPES.straight,...TYPES.corner,...TYPES.tee,...TYPES.cross];
    solved=Array.from({length:SZ},()=>Array(SZ).fill(0).map(()=>allTypes[Math.floor(Math.random()*allTypes.length)]));
    // scramble: randomly rotate each cell
    grid=solved.map(row=>row.map(v=>{let r=v;const times=Math.floor(Math.random()*4);for(let i=0;i<times;i++)r=rotateBits(r);return r;}));
  };
  generate();
  // source at [0,0], sink at [SZ-1,SZ-1]
  const connected=()=>{
    // BFS: check if flow reaches sink
    const visited=new Set();const q=[[0,0]];
    while(q.length){const[r,c]=q.shift();const k=r*SZ+c;if(visited.has(k))continue;visited.add(k);
      const v=grid[r][c];
      // N
      if((v&N)&&r>0&&(grid[r-1][c]&S)&&!visited.has((r-1)*SZ+c))q.push([r-1,c]);
      // E
      if((v&E)&&c<SZ-1&&(grid[r][c+1]&W)&&!visited.has(r*SZ+c+1))q.push([r,c+1]);
      // S
      if((v&S)&&r<SZ-1&&(grid[r+1][c]&N)&&!visited.has((r+1)*SZ+c))q.push([r+1,c]);
      // W
      if((v&W)&&c>0&&(grid[r][c-1]&E)&&!visited.has(r*SZ+(c-1)))q.push([r,c-1]);
    }
    return visited.has((SZ-1)*SZ+(SZ-1));
  };
  let done=false;
  const pipeChar=(v)=>{const m={10:'┃',5:'━',12:'┗',6:'┛',3:'┓',9:'┏',14:'┣',7:'┻',11:'┫',13:'┳',15:'╋',8:'╹',4:'╺',2:'╻',1:'╸'};return m[v]||'?';};
  const render=()=>{
    const isConn=connected();
    let html='<div style="display:inline-flex;flex-direction:column;gap:3px;background:#1a2a1a;padding:8px;border-radius:8px;border:2px solid var(--wood2);margin-bottom:8px">';
    for(let r=0;r<SZ;r++){html+='<div style="display:flex;gap:3px">';
      for(let c=0;c<SZ;c++){
        const isSource=r===0&&c===0,isSink=r===SZ-1&&c===SZ-1;
        const bg=isSource?'#2e5c2e':isSink?'#5c2e2e':'#2a3a2a';
        const ch=isSource?'▶':isSink?'⬛':pipeChar(grid[r][c]);
        html+=`<div class="pipeCell" data-r="${r}" data-c="${c}" style="width:46px;height:46px;display:flex;align-items:center;justify-content:center;font-size:22px;font-family:monospace;background:${bg};border-radius:4px;cursor:pointer;color:${isConn&&!isSource&&!isSink?'#5aa848':'#c9a86b'};border:2px solid ${isSource||isSink?'#5aa848':'#3a5a3a'};transition:.1s">${ch}</div>`;
      }
      html+='</div>';}
    html+='</div>';
    html+=`<div style="font-size:12px;color:var(--wood);text-align:center">Click tiles to rotate • Connect ▶ source to ⬛ sink</div>`;
    st.innerHTML=html;
    st.querySelectorAll('.pipeCell').forEach(el=>{
      el.onclick=()=>{if(done)return;const r=+el.dataset.r,c=+el.dataset.c;
        if((r===0&&c===0)||(r===SZ-1&&c===SZ-1))return; // don't rotate endpoints
        grid[r][c]=rotateBits(grid[r][c]);render();
        if(connected()){done=true;render();setTimeout(()=>miniWin(n,t),400);}};
    });
  };
  const st=openMini('PIPE PUZZLE','Click tiles to rotate. Connect the source ▶ to the sink ⬛.');
  render();
}

/* ── MINIMAP: pre-render MAP_BG thumbnail once, blit every frame ── */
let _mmCv=null,_mmReady=false;
function buildMinimapCache(){
  if(!MAP_BG.complete||!MAP_BG.naturalWidth)return;
  const iw=MAP_BG.naturalWidth,ih=MAP_BG.naturalHeight;
  const scale=220/iw; // target ~220px wide
  const cw=Math.round(iw*scale),ch=Math.round(ih*scale);
  _mmCv=document.createElement('canvas');_mmCv.width=cw;_mmCv.height=ch;
  const mg=_mmCv.getContext('2d');
  mg.imageSmoothingEnabled=true;mg.imageSmoothingQuality='high';
  mg.drawImage(MAP_BG,0,0,cw,ch);
  _mmReady=true;
}
MAP_BG.addEventListener('load',buildMinimapCache);
if(MAP_BG.complete&&MAP_BG.naturalWidth)buildMinimapCache();

function drawMinimap(){
  if(!_mmReady){buildMinimapCache();if(!_mmReady)return;}
  const iw=_mmCv.width, ih=_mmCv.height;
  const PAD=4;
  const MW=iw+PAD*2, MH=ih+PAD*2;
  const MX=viewW-MW-10, MY=viewH-MH-10;
  // frame
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=10;ctx.shadowOffsetY=3;
  const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();};
  rr(MX,MY,MW,MH,6);
  ctx.fillStyle='rgba(12,8,4,.9)';ctx.fill();
  ctx.shadowColor='transparent';
  ctx.strokeStyle='rgba(180,140,60,.55)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore();
  // map image
  const ox=MX+PAD, oy=MY+PAD;
  ctx.save();
  rr(ox,oy,iw,ih,3);ctx.clip();
  ctx.drawImage(_mmCv,0,0,iw,ih,ox,oy,iw,ih);
  ctx.restore();
  // viewport rectangle
  const scX=iw/(COLS*TS), scY=ih/(ROWS*TS);
  const vpX=ox+camX*scX, vpY=oy+camY*scY, vpW=(viewW/camZoom)*scX, vpH=(viewH/camZoom)*scY;
  ctx.strokeStyle='rgba(255,240,140,.45)';ctx.lineWidth=1.2;
  ctx.strokeRect(Math.max(vpX,ox),Math.max(vpY,oy),
    Math.min(vpW,iw-Math.max(0,(vpX-ox))),Math.min(vpH,ih-Math.max(0,(vpY-oy))));
  // NPC dots
  NPCS.forEach(n=>{
    const dx=ox+n.x*TS*scX+TS*scX/2, dy=oy+n.y*TS*scY+TS*scY/2;
    ctx.fillStyle=npcDone(n)?'#4adf30':'#f0d050';
    ctx.beginPath();ctx.arc(dx,dy,3,0,7);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=0.8;ctx.stroke();
  });
  // Boss Nino
  const bx=ox+19*TS*scX+TS*scX/2, by=oy+5*TS*scY+TS*scY/2;
  ctx.fillStyle='#d4a030';ctx.beginPath();ctx.arc(bx,by,3,0,7);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=0.8;ctx.stroke();
  // Player
  const ppx=ox+player.x*scX, ppy=oy+player.y*scY;
  ctx.fillStyle='#ff4a30';ctx.beginPath();ctx.arc(ppx,ppy,4,0,7);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ppx,ppy,1.8,0,7);ctx.fill();
}
function loop(){if(state==='end'||state==='paused')return;
  frame++;
  let moving=false;
  if(smoking&&Date.now()>smokeUntil)smoking=false;
  if(vaping&&Date.now()>vapeUntil)vaping=false;
  if(biking&&Date.now()>bikeUntil)biking=false;
  if(petting&&Date.now()>pettingUntil)petting=false;
  if(spying&&Date.now()>spyUntil)spying=false;
  if(crunching&&Date.now()>crunchUntil)crunching=false;
  if(stretching&&Date.now()>stretchUntil)stretching=false;
  if(vibing&&Date.now()>vibeUntil)vibing=false;
  const frozen=smoking||vaping||petting||spying||crunching||stretching||vibing; // biking still moves via animation, but block WASD
  if(!dialogOpen&&!miniOpen&&state==='play'&&!frozen&&!biking){const sp=3.0;let nx=player.x,ny=player.y;
    if(keys['w']||keys['arrowup'])ny-=sp;if(keys['s']||keys['arrowdown'])ny+=sp;
    if(keys['a']||keys['arrowleft'])nx-=sp;if(keys['d']||keys['arrowright'])nx+=sp;
    moving=(nx!==player.x||ny!==player.y);
    if(canMove(nx,player.y,player.r))player.x=nx;if(canMove(player.x,ny,player.r))player.y=ny;}
  if(state==='play')updateNPCs();
  updateCamera();
  ctx.clearRect(0,0,viewW,viewH);
  ctx.save();ctx.translate(offX,offY);ctx.scale(zoom,zoom);
  if(MAP_BG.complete&&MAP_BG.naturalWidth>0){ctx.save();ctx.filter='contrast(0.92) saturate(0.9) brightness(1.04)';ctx.drawImage(MAP_BG,0,0,COLS*TS,ROWS*TS);ctx.restore();}
  else{ctx.fillStyle='#2a2438';ctx.fillRect(0,0,COLS*TS,ROWS*TS);}
  if(window.DEBUG_COLL){for(let y=0;y<FROWS;y++)for(let x=0;x<FCOLS;x++){
    ctx.fillStyle=FINE[y][x]===0?'rgba(0,255,0,.25)':'rgba(255,0,0,.35)';
    ctx.fillRect(x*FTS,y*FTS,FTS-1,FTS-1);}}
  drawItems();
  NPCS.forEach((n,i)=>{const px=n.x*TS+TS/2,py=n.y*TS+TS/2;
    const walking=n.wState==='walk';
    const bob=walking?Math.sin(frame/4)*2:Math.sin(frame/22+i)*1.2;
    drawSprite(ctx,px,py,n.id,1,bob,n.face);
    drawNameTag(px,py-42,n.name,npcDone(n));
    if(n.speech&&frame<n.speechUntil)drawSpeechBubble(px,py-56,n.speech);});
  // Koda the dog next to Nina's desk
  {const kx=15*TS+TS/2,ky=8*TS+TS/2,kb=Math.sin(frame/26)*1.0;
   if(KODA_IMG.complete&&KODA_IMG.naturalWidth>0){
     const kh=TS*0.62,kw=KODA_IMG.naturalWidth*(kh/KODA_IMG.naturalHeight);
     ctx.fillStyle='rgba(40,20,5,.3)';ctx.beginPath();ctx.ellipse(kx,ky+kh*0.24,kw*0.3,kw*0.1,0,0,7);ctx.fill();
     ctx.drawImage(KODA_IMG,kx-kw/2,ky-kh*0.78+kb,kw,kh);}}
  const allDone=allTasks().every(t=>t.done);
  const bx=19*TS+TS/2,by=5*TS+TS/2;drawSprite(ctx,bx,by,'nino',1.1,Math.sin(frame/20)*1.2);
  drawNameTag(bx,by-46,'Boss Nino',allDone);
  const pbob=moving?Math.sin(frame/4)*2:Math.sin(frame/22)*1.2;
  drawSprite(ctx,player.x,player.y,player.id,1,pbob);
  drawNameTag(player.x,player.y-42,player.name,null);
  // cigarette smoke animation
  if(smoking){
    const img=SPRITES['dejan'];const dh=(img&&img.naturalHeight?img.naturalHeight:345)*0.22;
    const mouthY=player.y-dh*0.52; // up near the face
    const mouthX=player.x+4;
    // spawn particles at mouth
    if(frame%4===0)smokeParticles.push({x:mouthX,y:mouthY,vx:(Math.random()-.3)*.4,vy:-0.7-Math.random()*0.5,life:0,max:60+Math.random()*30,r:2+Math.random()*2});
    // orange ember at mouth
    ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.arc(mouthX,mouthY,2.2,0,7);ctx.fill();
    ctx.fillStyle='rgba(255,180,60,.5)';ctx.beginPath();ctx.arc(mouthX,mouthY,4,0,7);ctx.fill();
  }
  // update+draw smoke (persists a moment after)
  for(let i=smokeParticles.length-1;i>=0;i--){const p=smokeParticles[i];
    p.life++;p.x+=p.vx;p.y+=p.vy;p.vx+=(Math.random()-.5)*0.06;p.r+=0.05;
    const a=Math.max(0,0.5*(1-p.life/p.max));
    if(a<=0||p.life>p.max){smokeParticles.splice(i,1);continue;}
    ctx.fillStyle='rgba(220,220,225,'+a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();}
  // STEVE vape cloud
  if(vaping){const img=SPRITES['steve'];const dh=(img&&img.naturalHeight?img.naturalHeight:353)*0.22;
    const mx=player.x+3,my=player.y-dh*0.5;
    if(frame%2===0)for(let k=0;k<2;k++)vapeParticles.push({x:mx,y:my,vx:(Math.random()-.4)*1.2,vy:-0.5-Math.random()*0.6,life:0,max:45+Math.random()*25,r:3+Math.random()*3});}
  for(let i=vapeParticles.length-1;i>=0;i--){const p=vapeParticles[i];
    p.life++;p.x+=p.vx;p.y+=p.vy;p.vx*=0.98;p.r+=0.22;
    const a=Math.max(0,0.42*(1-p.life/p.max));
    if(a<=0||p.life>p.max){vapeParticles.splice(i,1);continue;}
    ctx.fillStyle='rgba(210,235,240,'+a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();}
  // TEONEM motorbike on terrace (left-right)
  if(biking){bikeX+=bikeDir*4.2;
    const lo=1*TS+20,hi=(COLS-2)*TS-20;
    if(bikeX>hi){bikeX=hi;bikeDir=-1;}if(bikeX<lo){bikeX=lo;bikeDir=1;}
    player.x=bikeX; player.y=0*TS+TS/2+8;
    const by2=player.y,dir=bikeDir;
    ctx.save();
    if(BIKE_IMG.complete&&BIKE_IMG.naturalWidth>0){
      const bh=56,bw=BIKE_IMG.naturalWidth*(bh/BIKE_IMG.naturalHeight);
      ctx.fillStyle='rgba(20,10,5,.3)';ctx.beginPath();ctx.ellipse(bikeX,by2+bh*0.4,bw*0.4,7,0,0,7);ctx.fill();
      // source photo faces right; flip horizontally when riding left
      if(dir===-1){ctx.translate(bikeX,0);ctx.scale(-1,1);ctx.drawImage(BIKE_IMG,-bw/2,by2-bh*0.72,bw,bh);}
      else ctx.drawImage(BIKE_IMG,bikeX-bw/2,by2-bh*0.72,bw,bh);
    }else{
      ctx.fillStyle='#222';ctx.beginPath();ctx.arc(bikeX-14*dir,by2+14,6,0,7);ctx.fill();ctx.beginPath();ctx.arc(bikeX+14*dir,by2+14,6,0,7);ctx.fill();
      ctx.strokeStyle='#c94f4f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(bikeX-14*dir,by2+14);ctx.lineTo(bikeX+14*dir,by2+14);ctx.stroke();
      ctx.fillStyle='rgba(180,180,190,.5)';for(let k=1;k<=3;k++){ctx.fillRect(bikeX-(20+k*8)*dir,by2+8+k*2,10,2);}
    }
    ctx.restore();}
  // NINA pet Koda hearts
  if(petting){if(frame%6===0)pettingHearts.push({x:15*TS+TS/2+(Math.random()*14-7),y:8*TS+TS/2-10,life:0});}
  for(let i=pettingHearts.length-1;i>=0;i--){const h=pettingHearts[i];h.life++;h.y-=0.7;
    const a=Math.max(0,1-h.life/40);if(a<=0){pettingHearts.splice(i,1);continue;}
    ctx.fillStyle='rgba(230,80,110,'+a+')';ctx.font='14px monospace';ctx.textAlign='center';ctx.fillText('\u2665',h.x,h.y);}
  // BRANA eavesdrop — ear icons + "..." bubbles
  if(spying){if(frame%8===0)spyParticles.push({x:player.x+(Math.random()*20-10),y:player.y-30,life:0,t:Math.random()>0.5?'ear':'dot'});}
  for(let i=spyParticles.length-1;i>=0;i--){const p=spyParticles[i];p.life++;p.y-=0.5;
    const a=Math.max(0,1-p.life/50);if(a<=0){spyParticles.splice(i,1);continue;}
    ctx.fillStyle='rgba(100,50,140,'+a+')';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText(p.t==='ear'?'\uD83D\uDC42':'...',p.x,p.y);}
  // SONJA calculator crunch — flying numbers
  if(crunching){if(frame%4===0){const nums='0123456789$%+=-';crunchParticles.push({x:player.x+(Math.random()*30-15),y:player.y-20,vx:(Math.random()-.5)*1.5,vy:-1.2-Math.random(),life:0,ch:nums[Math.floor(Math.random()*nums.length)]});}}
  for(let i=crunchParticles.length-1;i>=0;i--){const p=crunchParticles[i];p.life++;p.x+=p.vx;p.y+=p.vy;
    const a=Math.max(0,1-p.life/45);if(a<=0){crunchParticles.splice(i,1);continue;}
    ctx.fillStyle='rgba(50,180,80,'+a+')';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(p.ch,p.x,p.y);}
  // PEDJA stretch — sweat drops + flex emoji
  if(stretching){if(frame%6===0)stretchParticles.push({x:player.x+(Math.random()*24-12),y:player.y-35,life:0,t:Math.random()>0.3?'sweat':'flex'});}
  for(let i=stretchParticles.length-1;i>=0;i--){const p=stretchParticles[i];p.life++;p.y+=p.t==='sweat'?0.8:-0.6;
    const a=Math.max(0,1-p.life/45);if(a<=0){stretchParticles.splice(i,1);continue;}
    if(p.t==='sweat'){ctx.fillStyle='rgba(80,160,230,'+a+')';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('\uD83D\uDCA7',p.x,p.y);}
    else{ctx.fillStyle='rgba(230,180,60,'+a+')';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('\uD83D\uDCAA',p.x,p.y);}}
  // DANIEL headphones — music notes float up
  if(vibing){if(frame%7===0){const notes=['\u266A','\u266B','\u2669'];vibeParticles.push({x:player.x+(Math.random()*20-10),y:player.y-30,vx:(Math.random()-.5)*0.8,life:0,ch:rnd(notes)});}}
  for(let i=vibeParticles.length-1;i>=0;i--){const p=vibeParticles[i];p.life++;p.y-=0.6;p.x+=p.vx+Math.sin(p.life/8)*0.3;
    const a=Math.max(0,1-p.life/55);if(a<=0){vibeParticles.splice(i,1);continue;}
    ctx.fillStyle='rgba(80,140,220,'+a+')';ctx.font='14px monospace';ctx.textAlign='center';ctx.fillText(p.ch,p.x,p.y);}
  if(!dialogOpen&&!miniOpen){const item=nearestItem(),n=nearestNPC();let hx,hy,show=false;
    if(item&&!carrying){hx=item.x*TS+TS/2;hy=item.y*TS+TS/2-30;show=true;}
    else if(n){hx=n.x*TS+TS/2;hy=n.y*TS+TS/2-(n.id==='nino'?58:54);show=true;}
    if(show){const bb=Math.sin(Date.now()/200)*2;
      ctx.fillStyle='#6b431f';ctx.fillRect(hx-13,hy-11+bb,26,15);
      ctx.fillStyle='#f6e7c1';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('[E]',hx,hy+bb);}}
  ctx.restore();
  if(state==='play'&&player)drawMinimap();
  const g=ctx.createRadialGradient(viewW/2,viewH/2,viewH/2.4,viewW/2,viewH/2,viewH*0.95);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,15,5,.35)');
  ctx.fillStyle=g;ctx.fillRect(0,0,viewW,viewH);
  requestAnimationFrame(loop);}
