// Mini-game engines — extracted from game.js
// Depends on: openMini, closeMini, fail, miniWin, countdown, setKey, shuffle, rnd (from game.js)
// Loaded AFTER game.js via <script> tag

const MINI_TIMER={reflex:10,hold:10,stopwatch:10,mash:10,timing:10,simon:12,
  wordle:90,minesweeper:90,merge2048:90,flowfree:60,hidden:60,typingtest:60,tetris:90,pipe:60,
  crossword:45,wordsearch:45,pingpong:30,cableroute:20,maze:20};

function runMini(n,t){({timing:miniTiming,simon:miniSimon,mash:miniMash,type:miniType,memory:miniMemory,
  choose:miniChoose,scramble:miniScramble,catch:miniCatch,reflex:miniReflex,math:miniMath,
  sequence:miniSequence,avoid:miniAvoid,whack:miniWhack,dodge:miniDodge,colormatch:miniColorMatch,
  count:miniCount,rhythm:miniRhythm,slider:miniSlider,lockpick:miniLockpick,sortorder:miniSortOrder,
  spotdiff:miniSpotDiff,stack:miniStack,wire:miniWire,pincode:miniPin,balance:miniBalance,
  qte:miniQTE,impostor:miniImpostor,trace:miniTrace,pairs:miniPairs,hold:miniHold,typerace:miniTypeRace,
  oddeven:miniOddEven,target:miniTarget,reverse:miniReverse,moving:miniMoving,higherlower:miniHigherLower,
  gridmem:miniGridMem,stopwatch:miniStopwatch,maze:miniMaze,spy:miniSpy,priority:miniPriority,
  echo:miniEcho,splice:miniSplice,noise:miniNoise,budget:miniBudget,crack:miniCrack,jenga:miniJenga,
  signal:miniSignal,forge:miniForge,overload:miniOverload,dragfile:miniDragFile,calendar:miniCalendar,park:miniPark,qralign:miniQR,recipe:miniRecipe,cash:miniCash,proofread:miniProof,docsort:miniDocSort,jam:miniJam,scrub:miniScrub,inspect:miniInspect,circuit:miniCircuit,arrange:miniArrange,checklist:miniChecklist,gauge:miniGauge,barcode:miniBarcode,dial:miniDial,switchboard:miniSwitchboard,rolodex:miniRolodex,rank:miniRank,cartridge:miniCartridge,patchline:miniPatchline,typewriter:miniTypewriter,flowchart:miniFlowchart,redact:miniRedact,hotkey:miniHotkey,inbox:miniInbox,budgetslider:miniBudgetSlider,crossword:miniCrossword,cableroute:miniCableRoute,wordsearch:miniWordsearch,conveyor:miniConveyor,contract:miniContract,rotary:miniRotary,heatmap:miniHeatmap,triage:miniTriage,cipher:miniCipher,voltage:miniVoltage,toggle:miniToggle,anagram:miniAnagram,whiteboard:miniWhiteboard,slot:miniSlot,mirror:miniMirror,pricetag:miniPriceTag,binary:miniBinary,voicemail:miniVoicemail,approvalchain:miniApprovalChain,frequency:miniFrequency,handover:miniHandover,
  wordle:miniWordle,minesweeper:miniMinesweeper,merge2048:mini2048,flowfree:miniFlowFree,hidden:miniHidden,
  typingtest:miniTypingTest,tetris:miniTetris,pipe:miniPipe,
  stamp:miniStamp,elevator:miniElevator,copier:miniCopier,password:miniPassword,
  filing:miniFiling,phonetree:miniPhoneTree,waterplant:miniWaterPlant,shredder:miniShredder,
  stapler:miniStapler,expenses:miniExpenses,
  rubberband:miniRubberband,coffeeorder:miniCoffeeOrder,namecard:miniNamecard,
  pingpong:miniPingPong,firewall:miniFirewall,receipt:miniReceipt,schedule:miniSchedule})[t.type](n,t);
  if(!_countdownCalled&&miniOpen){const _s=MINI_TIMER[t.type]||15;_autoTimerStop=countdown(_s,()=>{if(miniOpen)fail(n,'Time\'s up! [E]');});}}


function miniCatch(n,t){const st=openMini('CATCH','A/D or mouse. Catch 5 before time runs out.',true);
  st.innerHTML='<div id="catcher"><div id="paddle"></div></div>';
  const box=document.getElementById('catcher'),pad=document.getElementById('paddle');
  let px=box.clientWidth/2-30,caught=0,done=false;pad.style.left=px+'px';
  box.onmousemove=e=>{const r=box.getBoundingClientRect();px=Math.max(0,Math.min(box.clientWidth-60,e.clientX-r.left-30));pad.style.left=px+'px';};
  setKey(e=>{if(e.key==='a')px=Math.max(0,px-24);if(e.key==='d')px=Math.min(box.clientWidth-60,px+24);pad.style.left=px+'px';});
  const items=[];
  const spawn=setInterval(()=>{if(done)return;const el=document.createElement('div');el.className='fall';el.innerHTML='&#128196;';
    el.style.left=(10+Math.random()*(box.clientWidth-40))+'px';el.style.top='-24px';box.appendChild(el);
    items.push({el,y:-24,x:parseFloat(el.style.left)});},700);
  const stopT=countdown(9,()=>end(false));
  const raf=setInterval(()=>{if(done)return;for(const it of items){if(!it.el)continue;it.y+=4;it.el.style.top=it.y+'px';
    if(it.y>150&&it.y<172){if(it.x>px-24&&it.x<px+60){caught++;it.el.remove();it.el=null;if(caught>=5)end(true);}}
    else if(it.y>=box.clientHeight){it.el.remove();it.el=null;}}},30);
  function end(win){if(done)return;done=true;clearInterval(spawn);clearInterval(raf);stopT();
    win?(closeMini(),finish(n,t)):fail(n,'Dropped too many ('+caught+'/5). [E]');}}


function miniSequence(n,t){const st=openMini('SEQUENCE','Watch the grid, repeat the order.');
  const grid=document.createElement('div');grid.style.display='grid';grid.style.gridTemplateColumns='repeat(3,1fr)';grid.style.gap='8px';
  const cells=[];for(let i=0;i<9;i++){const c=document.createElement('div');c.className='gridCell';c.dataset.i=i;grid.appendChild(c);cells.push(c);}
  st.appendChild(grid);
  const seq=shuffle([...Array(9).keys()]).slice(0,4);let ok=false,inp=[];
  const flash=i=>new Promise(r=>{cells[i].classList.add('lit');setTimeout(()=>{cells[i].classList.remove('lit');setTimeout(r,160);},380);});
  (async()=>{await new Promise(r=>setTimeout(r,400));for(const i of seq)await flash(i);ok=true;})();
  cells.forEach(c=>c.onclick=()=>{if(!ok)return;const i=+c.dataset.i;c.classList.add('lit');setTimeout(()=>c.classList.remove('lit'),140);inp.push(i);
    if(inp[inp.length-1]!==seq[inp.length-1]){ok=false;setTimeout(()=>fail(n,'Wrong sequence. [E]'),200);return;}
    if(inp.length===seq.length){ok=false;setTimeout(()=>{miniWin(n,t);},250);}});}

function miniAvoid(n,t){const st=openMini('SORT','Click only the GOOD ones. One wrong click = fail.',true);
  const good=['KEEP','YES','GO','OK'],bad=['NOPE','SKIP','NO','STOP'];
  const items=shuffle([...good.slice(0,3).map(x=>({t:x,g:true})),...bad.slice(0,3).map(x=>({t:x,g:false}))]);
  let need=items.filter(i=>i.g).length,got=0,done=false;
  items.forEach(o=>{const b=document.createElement('button');b.className='opt';b.textContent=o.t;
    b.onclick=()=>{if(done)return;if(o.g){b.style.opacity=.4;b.disabled=true;got++;
      if(got>=need){done=true;stopT();miniWin(n,t);}}
      else{done=true;stopT();fail(n,'Wrong one! [E]');}};st.appendChild(b);});
  const stopT=countdown(6,()=>{if(!done){done=true;fail(n,'Too slow. [E]');}});}

function miniWhack(n,t){const st=openMini('WHACK','Click the lit targets. Hit 6 in time.',true);
  const grid=document.createElement('div');grid.style.display='grid';grid.style.gridTemplateColumns='repeat(3,1fr)';grid.style.gap='8px';
  const cells=[];for(let i=0;i<9;i++){const c=document.createElement('div');c.className='gridCell';grid.appendChild(c);cells.push(c);}
  st.appendChild(grid);let hits=0,done=false,active=-1;
  const pop=setInterval(()=>{if(done)return;if(active>=0)cells[active].classList.remove('lit');
    active=Math.floor(Math.random()*9);cells[active].classList.add('lit');},650);
  cells.forEach((c,i)=>c.onclick=()=>{if(done)return;if(i===active){hits++;c.classList.remove('lit');active=-1;
    if(hits>=6){done=true;clearInterval(pop);stopT();miniWin(n,t);}}});
  const stopT=countdown(9,()=>{if(!done){done=true;clearInterval(pop);fail(n,'Too slow ('+hits+'/6). [E]');}});}

function miniDodge(n,t){const st=openMini('DODGE','A/D or mouse to dodge falling blocks. Survive.',true);
  st.innerHTML='<div id="catcher"><div id="paddle" style="background:var(--red)"></div></div>';
  const box=document.getElementById('catcher'),pad=document.getElementById('paddle');
  let px=box.clientWidth/2-30,done=false;pad.style.left=px+'px';
  box.onmousemove=e=>{const r=box.getBoundingClientRect();px=Math.max(0,Math.min(box.clientWidth-60,e.clientX-r.left-30));pad.style.left=px+'px';};
  setKey(e=>{if(e.key==='a')px=Math.max(0,px-26);if(e.key==='d')px=Math.min(box.clientWidth-60,px+26);pad.style.left=px+'px';});
  const items=[];
  const spawn=setInterval(()=>{if(done)return;const el=document.createElement('div');el.className='fall';el.innerHTML='&#129521;';
    el.style.left=(10+Math.random()*(box.clientWidth-40))+'px';el.style.top='-24px';box.appendChild(el);
    items.push({el,y:-24,x:parseFloat(el.style.left)});},600);
  const stopT=countdown(8,()=>end(true));
  const raf=setInterval(()=>{if(done)return;for(const it of items){if(!it.el)continue;it.y+=5;it.el.style.top=it.y+'px';
    if(it.y>150&&it.y<172&&it.x>px-20&&it.x<px+58){end(false);return;}
    if(it.y>=box.clientHeight){it.el.remove();it.el=null;}}},30);
  function end(win){if(done)return;done=true;clearInterval(spawn);clearInterval(raf);stopT();
    win?(closeMini(),finish(n,t)):fail(n,'Got hit! [E]');}}

function miniColorMatch(n,t){const cols=[['RED','#c94f4f'],['TEAL','#3f9e8f'],['GOLD','#e8b93c'],['PURPLE','#7a5aa8'],['BLUE','#4a7ab8'],['GREEN','#5a9e4b']];
  const target=rnd(cols);const st=openMini('COLOR MATCH','Click the swatch that is '+target[0]+'.');
  shuffle(cols).forEach(c=>{const b=document.createElement('div');b.className='simBtn';b.style.background=c[1];
    b.onclick=()=>c[0]===target[0]?(closeMini(),finish(n,t)):fail(n,'Wrong color. [E]');st.appendChild(b);});}

function miniCount(n,t){const icons=['&#128196;','&#9749;','&#128396;','&#128190;'];const labels=['docs','coffees','pens','disks'];
  // a task can pin the subject: {type:'count', subject:'coffees today'} -> counts coffee cups
  let idx=Math.floor(Math.random()*4);
  if(t.subject){const key=t.subject.toLowerCase();const hit=labels.findIndex(l=>key.includes(l.replace(/s$/,'')));if(hit>=0)idx=hit;}
  const ic=icons[idx];const count=3+Math.floor(Math.random()*6);
  const label=t.subject||labels[idx];
  const st=openMini('COUNT','How many '+label+'? Type it, Enter.');
  const box=document.createElement('div');box.style.cssText='display:flex;flex-wrap:wrap;gap:6px;max-width:300px;font-size:20px;justify-content:center';
  const total=count+2+Math.floor(Math.random()*4);const arr=[];for(let i=0;i<count;i++)arr.push(ic);
  while(arr.length<total)arr.push(icons[(idx+1+Math.floor(Math.random()*3))%4]);
  shuffle(arr).forEach(x=>{const s=document.createElement('span');s.innerHTML=x;box.appendChild(s);});
  st.appendChild(box);const inp=document.createElement('div');inp.className='typed';inp.style.width='100%';st.appendChild(inp);
  let cur='';setKey(e=>{if(e.key==='Enter'){if(parseInt(cur)===count){miniWin(n,t);}else{cur='';inp.textContent='';}}
    else if(e.key==='Backspace'){cur=cur.slice(0,-1);inp.textContent=cur;}
    else if(/^[0-9]$/.test(e.key)){cur+=e.key;inp.textContent=cur;}e.preventDefault();});}

function miniRhythm(n,t){const st=openMini('RHYTHM','Press SPACE each time the dot fills the ring. Nail 3.');
  st.innerHTML='<div style="position:relative;width:80px;height:80px"><div style="position:absolute;inset:0;border:3px solid var(--wood);border-radius:50%"></div><div id="dot" style="position:absolute;left:50%;top:50%;width:10px;height:10px;background:var(--accent);border-radius:50%;transform:translate(-50%,-50%)"></div></div><div class="typed" id="rsc">0 / 3</div>';
  const dot=document.getElementById('dot'),rsc=document.getElementById('rsc');let sc=0,r=0,dir=1,done=false,raf;
  (function step(){r+=dir*2.2;if(r>=36){r=36;dir=-1;}if(r<=0){r=0;dir=1;}
    dot.style.width=(10+r)+'px';dot.style.height=(10+r)+'px';raf=requestAnimationFrame(step);})();
  setKey(e=>{if(e.key===' '&&!done){e.preventDefault();if(r>=30){sc++;rsc.textContent=sc+' / 3';
    if(sc>=3){done=true;cancelAnimationFrame(raf);miniWin(n,t);}}
    else{done=true;cancelAnimationFrame(raf);fail(n,'Off beat. [E]');}}});}

function miniSlider(n,t){const target=20+Math.floor(Math.random()*60);
  const st=openMini('DIAL IT IN','← Feel it out → Find the sweet spot, then SPACE. (±3 off is fine)');
  st.innerHTML='<input type="range" min="0" max="100" value="50" id="sld" style="width:80%;accent-color:var(--accent)"><div id="sldVal" class="typed" style="color:var(--wood);font-size:12px">· · ·</div>';
  const sld=document.getElementById('sld'),val=document.getElementById('sldVal');
  sld.oninput=()=>{const diff=Math.abs(+sld.value-target);val.textContent=diff<=3?'🟢 Close!':diff<=10?'· · ·':'· ·';};
  setKey(e=>{if(e.key===' '){e.preventDefault();const diff=Math.abs(+sld.value-target);diff<=3?(closeMini(),finish(n,t)):fail(n,'Off by '+diff+'. [E]');}});}

function miniLockpick(n,t){const st=openMini('LOCKPICK','SPACE to set each pin in the green zone. 3 pins.');
  st.innerHTML='<div id="barWrap"><div id="barZone"></div><div id="barCursor"></div></div><div id="pins" class="typed">Pin 1 / 3</div>';
  const zone=document.getElementById('barZone'),cur=document.getElementById('barCursor'),pins=document.getElementById('pins');
  let pin=0,pos=0,dir=1,raf,busy=false;
  function newPin(){const zx=25+Math.random()*45;zone.style.left=zx+'%';zone.style.width='10%';zone._x=zx;}
  newPin();
  (function step(){pos+=dir*2;if(pos>=100){pos=100;dir=-1;}if(pos<=0){pos=0;dir=1;}cur.style.left=pos+'%';raf=requestAnimationFrame(step);})();
  setKey(e=>{if(e.key===' '&&!busy){e.preventDefault();const zx=zone._x;
    if(pos>=zx&&pos<=zx+14){pin++;if(pin>=3){cancelAnimationFrame(raf);miniWin(n,t);}else{pins.textContent='Pin '+(pin+1)+' / 3';newPin();}}
    else{busy=true;cancelAnimationFrame(raf);fail(n,'Pin slipped. [E]');}}});}

function miniSortOrder(n,t){const st=openMini('ORDER','Click the numbers from lowest to highest.');
  const nums=shuffle([...Array(5).keys()].map(i=>i+1));let next=1;
  nums.forEach(v=>{const b=document.createElement('div');b.className='memChip';b.textContent=v;
    b.onclick=()=>{if(v===next){b.classList.add('used');next++;if(next>5){miniWin(n,t);}}
      else fail(n,'Out of order. [E]');};st.appendChild(b);});}

function miniSpotDiff(n,t){const set=['&#128196;','&#9749;','&#128421;','&#128202;','&#128206;'];
  const bi=Math.floor(Math.random()*5);let oi=bi;while(oi===bi)oi=Math.floor(Math.random()*5);
  const st=openMini('SPOT IT','One icon is different. Click it.');
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:22px';
  const oddIdx=Math.floor(Math.random()*12);
  for(let i=0;i<12;i++){const c=document.createElement('div');c.className='gridCell';c.innerHTML=i===oddIdx?set[oi]:set[bi];
    c.onclick=()=>i===oddIdx?(closeMini(),finish(n,t)):fail(n,'Nope, look again. [E]');grid.appendChild(c);}
  st.appendChild(grid);}

function miniStack(n,t){const st=openMini('STACK','SPACE to drop each block near center. Stack 3.');
  st.innerHTML='<div id="barWrap" style="height:44px"><div id="barZone" style="left:38%;width:24%"></div><div id="barCursor"></div></div><div id="stk" class="typed">0 / 3</div>';
  const cur=document.getElementById('barCursor'),stk=document.getElementById('stk');
  let cnt=0,pos=0,dir=1,raf,busy=false;
  (function step(){pos+=dir*2.4;if(pos>=100){pos=100;dir=-1;}if(pos<=0){pos=0;dir=1;}cur.style.left=pos+'%';raf=requestAnimationFrame(step);})();
  setKey(e=>{if(e.key===' '&&!busy){e.preventDefault();if(pos>=38&&pos<=62){cnt++;stk.textContent=cnt+' / 3';
    if(cnt>=3){cancelAnimationFrame(raf);miniWin(n,t);}}else{busy=true;cancelAnimationFrame(raf);fail(n,'Missed the stack. [E]');}}});}

function miniWire(n,t){miniSplice(n,t);}

function miniPin(n,t){const code=String(1000+Math.floor(Math.random()*9000));
  const st=openMini('PIN CODE','Memorize the code...');
  const disp=document.createElement('div');disp.className='typed';disp.style.fontSize='30px';disp.textContent=code;st.appendChild(disp);
  setTimeout(()=>{disp.textContent='????';document.getElementById('miniDesc').textContent='Now type the 4-digit code, Enter.';
    let cur='';setKey(e=>{if(e.key==='Enter'){if(cur===code){miniWin(n,t);}else{cur='';disp.textContent='????';}}
      else if(e.key==='Backspace'){cur=cur.slice(0,-1);disp.textContent=cur||'????';}
      else if(/^[0-9]$/.test(e.key)&&cur.length<4){cur+=e.key;disp.textContent=cur;}e.preventDefault();});},1600);}

function miniPin(n,t){const code=String(1000+Math.floor(Math.random()*9000));
  const st=openMini('PIN CODE','Memorize the code...');
  const disp=document.createElement('div');disp.className='typed';disp.style.fontSize='30px';disp.textContent=code;st.appendChild(disp);
  setTimeout(()=>{disp.textContent='????';document.getElementById('miniDesc').textContent='Now type the 4-digit code, Enter.';
    let cur='';setKey(e=>{if(e.key==='Enter'){if(cur===code){miniWin(n,t);}else{cur='';disp.textContent='????';}}
      else if(e.key==='Backspace'){cur=cur.slice(0,-1);disp.textContent=cur||'????';}
      else if(/^[0-9]$/.test(e.key)&&cur.length<4){cur+=e.key;disp.textContent=cur;}e.preventDefault();});},1600);}

function miniBalance(n,t){const st=openMini('BALANCE','Keep the bar centered with A/D. Hold 4s total.',true);
  st.innerHTML='<div id="barWrap"><div id="barZone" style="left:42%;width:16%"></div><div id="barCursor"></div></div>';
  const cur=document.getElementById('barCursor');let pos=50,inZone=0,done=false;
  const drift=setInterval(()=>{if(done)return;pos+=(Math.random()-.5)*6;pos=Math.max(0,Math.min(100,pos));cur.style.left=pos+'%';
    if(pos>=42&&pos<=58)inZone+=0.1;
    if(inZone>=4){done=true;clearInterval(drift);stopT();miniWin(n,t);}},100);
  setKey(e=>{if(e.key==='a')pos=Math.max(0,pos-5);if(e.key==='d')pos=Math.min(100,pos+5);cur.style.left=pos+'%';});
  const stopT=countdown(10,()=>{if(!done){done=true;clearInterval(drift);fail(n,'Lost balance. [E]');}});}

function miniQTE(n,t){const seq=Array.from({length:5},()=>rnd(['W','A','S','D']));
  const st=openMini('COMBO','Press the keys in order, fast!',true);
  const disp=document.createElement('div');disp.className='typed';disp.style.cssText='font-size:24px;letter-spacing:8px';
  st.appendChild(disp);let i=0,done=false;
  const render=()=>{disp.innerHTML=seq.map((k,j)=>'<span style="color:'+(j<i?'var(--green)':j===i?'var(--accent)':'#b09468')+'">'+k+'</span>').join(' ');};
  render();
  setKey(e=>{if(done)return;const k=e.key.toUpperCase();if(['W','A','S','D'].includes(k)){e.preventDefault();
    if(k===seq[i]){i++;render();if(i>=seq.length){done=true;stopT();miniWin(n,t);}}
    else{done=true;stopT();fail(n,'Wrong key! [E]');}}});
  const stopT=countdown(5,()=>{if(!done){done=true;fail(n,'Too slow. [E]');}});}

function miniImpostor(n,t){const say=t.word||'coffee';const imp=t.odd||'tea';
  const st=openMini('FIND THE IMPOSTOR',t.hint||'Four match. Click the odd one out.');
  const impIdx=Math.floor(Math.random()*5);
  for(let i=0;i<5;i++){const b=document.createElement('button');b.className='opt';b.textContent=i===impIdx?imp:say;
    b.onclick=()=>i===impIdx?(closeMini(),finish(n,t)):fail(n,'Nope, blend-in. [E]');st.appendChild(b);}}
function miniTrace(n,t){const st=openMini('TRACE','Click the dots 1 to 5 in order.');
  const box=document.createElement('div');box.style.cssText='position:relative;width:300px;height:150px';
  const pts=[];for(let i=0;i<5;i++)pts.push({x:20+Math.random()*250,y:10+Math.random()*110,n:i+1});
  let next=1;pts.forEach(p=>{const d=document.createElement('div');d.textContent=p.n;
    d.style.cssText='position:absolute;width:30px;height:30px;border-radius:50%;background:var(--paper2);border:3px solid var(--wood);display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:bold;left:'+p.x+'px;top:'+p.y+'px;font-size:13px';
    d.onclick=()=>{if(p.n===next){d.style.background='var(--green)';d.style.color='#fff';next++;if(next>5){miniWin(n,t);}}
      else fail(n,'Wrong dot. [E]');};box.appendChild(d);});
  st.appendChild(box);}

/* ---- NEW MECHANICS ---- */
function miniPairs(n,t){const st=openMini('PAIRS','Find the 3 matching pairs. Flip two at a time.');
  const syms=shuffle(['&#9733;','&#9829;','&#9679;']);const deck=shuffle([...syms,...syms]);
  let open=[],lock=false,found=0;
  deck.forEach((s,i)=>{const c=document.createElement('div');c.className='gridCell';c.dataset.s=s;c.innerHTML='?';
    c.onclick=()=>{if(lock||c.classList.contains('lit')||open.includes(c))return;
      c.innerHTML=s;open.push(c);
      if(open.length===2){lock=true;setTimeout(()=>{
        if(open[0].dataset.s===open[1].dataset.s){open.forEach(x=>x.classList.add('lit'));found++;
          if(found>=3){miniWin(n,t);return;}}
        else open.forEach(x=>x.innerHTML='?');
        open=[];lock=false;},450);}
    };st.appendChild(c);});}

function miniTypewriter(n,t){const word=t.word||'INVOICE';const st=openMini('TYPEWRITER','Press each key as it falls. Miss one = fail.',true);
  st.innerHTML='<div id="twBox" style="position:relative;height:140px;overflow:hidden;width:100%;border-radius:8px;background:var(--paper2)"></div>'+
    '<div id="twWord" class="typed" style="letter-spacing:6px;font-size:18px"></div>';
  const box=document.getElementById('twBox'),wd=document.getElementById('twWord');
  let idx=0,falling=null,y=0,done=false;
  function nextLetter(){if(idx>=word.length){done=true;miniWin(n,t);return;}
    falling=document.createElement('div');falling.textContent=word[idx];
    falling.style.cssText='position:absolute;font-size:22px;font-weight:bold;top:-24px;left:'+(20+Math.random()*(box.clientWidth-40))+'px;color:var(--accent)';
    box.appendChild(falling);y=-24;
    const iv=setInterval(()=>{if(done)return;y+=3;falling.style.top=y+'px';
      if(y>=box.clientHeight){clearInterval(iv);if(!done){done=true;fail(n,'Missed "'+word[idx]+'". [E]');}};},40);
    falling._iv=iv;}
  setKey(e=>{if(done||!falling)return;e.preventDefault();
    if(e.key.toUpperCase()===word[idx]){clearInterval(falling._iv);falling.style.color='var(--green)';wd.textContent+='█';idx++;setTimeout(nextLetter,200);}
    else{falling.style.color='var(--red)';done=true;fail(n,'Wrong key "'+e.key.toUpperCase()+'" — needed "'+word[idx]+'". [E]');}});
  const stopT=countdown(12,()=>{if(!done){done=true;fail(n,'Too slow. [E]');}});
  setTimeout(nextLetter,400);}

// FLOWCHART: click through a yes/no decision tree to reach the correct outcome
function miniFlowchart(n,t){const tree=t.tree||{q:'Is the issue hardware?',yes:{q:'Is it the monitor?',yes:{end:true,win:true},no:{end:true,win:false}},no:{q:'Did you restart?',yes:{end:true,win:true},no:{end:true,win:false}}};
  const st=openMini('FLOWCHART',t.hint||'Follow the decision tree. Yes or No at each step.');
  let node=tree;let done=false;
  function render(){st.innerHTML='';const q=document.createElement('div');q.style.cssText='font-size:13px;font-weight:bold;margin:14px auto;max-width:320px;text-align:center';q.textContent=node.q;st.appendChild(q);
    const row=document.createElement('div');row.className='nmRow';
    ['yes','no'].forEach(k=>{if(!node[k])return;const b=document.createElement('button');b.className='btn'+(k==='no'?' ghost':'');b.textContent=k==='yes'?'✓ Yes':'✗ No';
      b.onclick=()=>{if(done)return;node=node[k];if(node.end){done=true;node.win?miniWin(n,t):fail(n,'Wrong branch. [E]');}else render();};row.appendChild(b);});
    st.appendChild(row);}
  render();}

// REDACT: click every sensitive word to redact it before the document is sent
function miniRedact(n,t){const sentences=t.sentences||['Name: John Smith is our client','Phone: 555-0192 call anytime','Email: john@example.com for invoice'];
  const sensitive=t.sensitive||['John Smith','555-0192','john@example.com'];
  const st=openMini('REDACT','Click every sensitive word/phrase before sending.',true);
  let total=sensitive.length,found=0,done=false;
  const wrap=document.createElement('div');wrap.style.cssText='max-width:360px;line-height:2.2;font-size:12px';
  sentences.forEach(s=>{const p=document.createElement('p');p.style.marginBottom='6px';
    let html=s;sensitive.forEach(word=>{html=html.replace(word,'<span class="redactable" data-w="'+word+'">'+word+'</span>');});
    p.innerHTML=html;wrap.appendChild(p);});
  st.appendChild(wrap);
  const btn=document.createElement('button');btn.className='btn';btn.style.marginTop='10px';btn.textContent='Send document';st.appendChild(btn);
  wrap.querySelectorAll('.redactable').forEach(el=>{el.style.cssText='cursor:pointer;background:var(--paper2);border-radius:3px;padding:0 2px';
    el.onclick=()=>{el.style.background='#222';el.style.color='#222';el.style.borderRadius='2px';el.style.pointerEvents='none';found++;};});
  btn.onclick=()=>{if(done)return;done=true;found>=total?miniWin(n,t):fail(n,(total-found)+' sensitive item(s) not redacted. [E]');};}

// HOTKEY: a UI menu appears — navigate to the right item using ONLY keyboard shortcuts (no mouse)
function miniHotkey(n,t){const items=t.items||[{k:'F',l:'File'},{k:'E',l:'Edit'},{k:'V',l:'View'},{k:'H',l:'Help'}];const target=t.target||'H';
  const st=openMini('HOTKEY',t.hint||'Use keyboard shortcuts only. Press the right key.',true);
  const bar=document.createElement('div');bar.style.cssText='display:flex;gap:4px;width:100%;justify-content:center';
  items.forEach(({k,l})=>{const d=document.createElement('div');d.className='memChip';d.style.cssText+='font-size:12px;min-width:70px;text-align:center';
    d.innerHTML='<u>'+k+'</u>'+l.slice(1);bar.appendChild(d);});
  st.appendChild(bar);
  const hint=document.createElement('div');hint.style.cssText='margin-top:14px;font-size:12px;color:var(--wood)';hint.textContent='Target: navigate to "'+items.find(i=>i.k===target)?.l+'"';
  st.appendChild(hint);let done=false;
  setKey(e=>{if(done)return;e.preventDefault();const key=e.key.toUpperCase();
    if(key===target){done=true;miniWin(n,t);}else if(items.find(i=>i.k===key)){done=true;fail(n,'Wrong menu. [E]');}});}

// INBOX: emails arrive — flag urgent, archive safe, delete spam. 5 cards, no mistakes
function miniInbox(n,t){const emails=t.emails||[
    {from:'Boss Nino',sub:'URGENT: Q3 report now',type:'urgent'},
    {from:'newsletter@spam.io',sub:'You won a prize!!!',type:'spam'},
    {from:'sonja@gromix',sub:'Payroll processed',type:'safe'},
    {from:'unknown@phish.net',sub:'Verify your account',type:'spam'},
    {from:'teonem@gromix',sub:'Client meeting Thursday',type:'urgent'}];
  const st=openMini('INBOX','Flag urgent 🚨 / Archive safe 📁 / Delete spam 🗑. No mistakes.',true);
  let i=0,done=false,mistakes=0;
  function show(){if(i>=emails.length){done=true;miniWin(n,t);return;}
    const e=emails[i];st.innerHTML='';
    const card=document.createElement('div');card.style.cssText='max-width:320px;margin:6px auto;background:var(--paper2);border:2px solid var(--wood);border-radius:8px;padding:12px;text-align:left';
    card.innerHTML='<div style="font-size:10px;color:var(--wood)">From: <b>'+e.from+'</b></div><div style="font-size:13px;margin:6px 0;font-weight:bold">'+e.sub+'</div>';
    st.appendChild(card);
    const row=document.createElement('div');row.className='nmRow';row.style.gap='8px';
    [['🚨 Urgent','urgent'],['📁 Archive','safe'],['🗑 Spam','spam']].forEach(([lbl,type])=>{
      const b=document.createElement('button');b.className='btn ghost';b.style.fontSize='11px';b.textContent=lbl;
      b.onclick=()=>{if(done)return;if(type===e.type){i++;show();}else{mistakes++;fail(n,'"'+e.sub+'" — wrong action. [E]');done=true;}};row.appendChild(b);});
    st.appendChild(row);}
  show();}

// BUDGET_SLIDER: three independent sliders, each must hit its own target value
function miniBudgetSlider(n,t){const targets=t.targets||[30,55,80];const labels=t.labels||['Design','Dev','Marketing'];
  const st=openMini('BUDGET SPLIT',t.hint||'Set each slider to its exact target. Then lock in.');
  const wrap=document.createElement('div');wrap.style.cssText='width:100%;max-width:340px';
  const sliders=[];
  targets.forEach((tgt,i)=>{const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;margin:8px 0';
    const lbl=document.createElement('span');lbl.style.cssText='width:72px;font-size:11px';lbl.textContent=labels[i]+' ('+tgt+'%)';
    const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=100;sl.value=Math.floor(Math.random()*100);sl.style.flex='1';
    const val=document.createElement('span');val.style.cssText='width:34px;font-size:11px;text-align:right';val.textContent=sl.value+'%';
    sl.oninput=()=>{val.textContent=sl.value+'%';};
    sliders.push(sl);row.appendChild(lbl);row.appendChild(sl);row.appendChild(val);wrap.appendChild(row);});
  st.appendChild(wrap);
  const btn=document.createElement('button');btn.className='btn';btn.style.marginTop='12px';btn.textContent='Lock in';st.appendChild(btn);
  btn.onclick=()=>{const ok=sliders.every((sl,i)=>Math.abs(+sl.value-targets[i])<=2);ok?miniWin(n,t):fail(n,'One or more sliders off target. [E]');};}

// CROSSWORD: fill in 3 short answers using keyboard, confirm each with Enter
function miniCrossword(n,t){const clues=t.clues||[{hint:'Opposite of credit',ans:'DEBIT'},{hint:'Boss\'s title (abbr.)',ans:'CEO'},{hint:'Revenue - costs',ans:'PROFIT'}];
  const st=openMini('FILL IN',t.hint||'Answer each clue. Type + Enter.');
  let i=0,done=false;
  function show(){if(i>=clues.length){done=true;miniWin(n,t);return;}
    const c=clues[i];st.innerHTML='';
    const q=document.createElement('div');q.style.cssText='font-size:13px;font-weight:bold;margin:10px 0 6px';q.textContent=(i+1)+'/'+clues.length+': '+c.hint;st.appendChild(q);
    const blanks=document.createElement('div');blanks.style.cssText='letter-spacing:8px;font-size:18px;margin:8px 0;min-height:30px';blanks.textContent='_ '.repeat(c.ans.length).trim();st.appendChild(blanks);
    const inp=document.createElement('div');inp.className='typed';st.appendChild(inp);
    let cur='';setKey(e=>{if(done)return;e.preventDefault();
      if(e.key==='Enter'){const guess=cur.toUpperCase();cur='';inp.textContent='';
        if(guess===c.ans){blanks.textContent=c.ans;blanks.style.color='var(--green)';i++;setTimeout(show,300);}
        else{fail(n,'Wrong — it was "'+c.ans+'". [E]');done=true;}}
      else if(e.key==='Backspace'){cur=cur.slice(0,-1);inp.textContent=cur;}
      else if(/^[a-zA-Z]$/.test(e.key)){cur+=e.key.toUpperCase();inp.textContent=cur;
        blanks.textContent=cur.split('').join(' ')+' _'.repeat(Math.max(0,c.ans.length-cur.length)).trim();};});}
  show();}

// CABLE_ROUTE: click cells in a grid to draw a cable path from source to destination
function miniCableRoute(n,t){const SIZE=5;const src={r:0,c:0},dst={r:SIZE-1,c:SIZE-1};
  const st=openMini('ROUTE CABLE','Click cells to draw a path from 🔌 (top-left) to 🖥 (bottom-right). No diagonal.');
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat('+SIZE+',44px);gap:4px;margin:8px auto';
  const cells=[];let path=new Set();let done=false;
  // random walls
  const walls=new Set();while(walls.size<5){const r=Math.floor(Math.random()*SIZE),c=Math.floor(Math.random()*SIZE);
    if((r===0&&c===0)||(r===SIZE-1&&c===SIZE-1))continue;walls.add(r+','+c);}
  for(let r=0;r<SIZE;r++){for(let c=0;c<SIZE;c++){const key=r+','+c;
    const d=document.createElement('div');d.style.cssText='width:44px;height:44px;border:2px solid var(--wood);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;background:var(--paper2)';
    if(walls.has(key)){d.style.background='var(--wood2)';d.style.cursor='default';d.textContent='█';}
    else if(r===0&&c===0)d.textContent='🔌';
    else if(r===SIZE-1&&c===SIZE-1)d.textContent='🖥';
    d.dataset.r=r;d.dataset.c=c;grid.appendChild(d);cells.push(d);}}
  st.appendChild(grid);
  const btn=document.createElement('button');btn.className='btn';btn.style.marginTop='8px';btn.textContent='Power up!';st.appendChild(btn);
  grid.querySelectorAll('div').forEach(d=>{d.onclick=()=>{if(done||walls.has(d.dataset.r+','+d.dataset.c))return;
    const k=d.dataset.r+','+d.dataset.c;
    if((d.dataset.r==0&&d.dataset.c==0)||(d.dataset.r==SIZE-1&&d.dataset.c==SIZE-1))return;
    if(path.has(k)){path.delete(k);d.style.background='var(--paper2)';}
    else{path.add(k);d.style.background='var(--teal)';}};});
  btn.onclick=()=>{if(done)return;
    // BFS check connectivity src->dst through selected+src+dst
    const passable=k=>!walls.has(k)&&(path.has(k)||k===src.r+','+src.c||k===dst.r+','+dst.c);
    const q=[src.r+','+src.c],vis=new Set(q);
    while(q.length){const [r,c]=q.shift().split(',').map(Number);
      if(r===dst.r&&c===dst.c){done=true;miniWin(n,t);return;}
      [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([nr,nc])=>{const nk=nr+','+nc;
        if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&passable(nk)&&!vis.has(nk)){vis.add(nk);q.push(nk);}});}
    fail(n,'No complete path yet. [E]');};}
// WORDSEARCH: find hidden words in a letter grid by clicking start+end cells

function miniTiming(n,t){const st=openMini('TIMING','Press SPACE when the red line hits the green zone.');
  st.innerHTML='<div id="barWrap"><div id="barZone"></div><div id="barCursor"></div></div>';
  const zone=document.getElementById('barZone'),cur=document.getElementById('barCursor');
  const zx=34+Math.random()*36,zw=10;zone.style.left=zx+'%';zone.style.width=zw+'%';
  let pos=0,dir=1,raf,done=false;
  (function step(){pos+=dir*1.6;if(pos>=100){pos=100;dir=-1;}if(pos<=0){pos=0;dir=1;}cur.style.left=pos+'%';raf=requestAnimationFrame(step);})();
  function attempt(){if(done)return;done=true;cancelAnimationFrame(raf);const hit=pos>=zx&&pos<=zx+zw;
    setTimeout(()=>hit?(closeMini(),finish(n,t)):fail(n,'Missed. Try again [E].'),180);}
  setKey(e=>{if(e.key===' '){e.preventDefault();attempt();}});st.firstChild.onclick=attempt;}

function miniSimon(n,t){const st=openMini('SIMON','Watch the order, then click it back.');
  const cols=['#c94f4f','#3f9e8f','#e8b93c','#7a5aa8'];
  const btns=cols.map((c,i)=>{const b=document.createElement('div');b.className='simBtn';b.style.background=c;b.dataset.i=i;st.appendChild(b);return b;});
  const seq=shuffle([0,1,2,3]).slice(0,4);let ok=false,inp=[];
  const flash=i=>new Promise(r=>{btns[i].classList.add('lit');setTimeout(()=>{btns[i].classList.remove('lit');setTimeout(r,170);},360);});
  (async()=>{await new Promise(r=>setTimeout(r,400));for(const i of seq)await flash(i);ok=true;})();
  btns.forEach(b=>b.onclick=()=>{if(!ok)return;const i=+b.dataset.i;b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),150);inp.push(i);
    if(inp[inp.length-1]!==seq[inp.length-1]){ok=false;setTimeout(()=>fail(n,'Wrong! "I said EXACTLY this." [E]'),250);return;}
    if(inp.length===seq.length){ok=false;setTimeout(()=>{miniWin(n,t);},300);}});}

function miniMash(n,t){const st=openMini('BUTTON MASH','Mash SPACE fast to fill the bar!');
  st.innerHTML='<div id="masher"><div id="masherFill"></div></div>';
  const fill=document.getElementById('masherFill');let v=0,done=false;
  const decay=setInterval(()=>{if(done)return;v=Math.max(0,v-2.8);fill.style.width=v+'%';},60);
  setKey(e=>{if(e.key===' '&&!done){e.preventDefault();v=Math.min(100,v+8);fill.style.width=v+'%';
    if(v>=100){done=true;clearInterval(decay);setTimeout(()=>{miniWin(n,t);},150);}}});
  setTimeout(()=>{if(!done){done=true;clearInterval(decay);fail(n,'Too slow! [E]');}},6000);}

function miniType(n,t){const st=openMini('TYPE IT','Type it exactly, then Enter.');
  st.innerHTML='<div style="font-size:22px;letter-spacing:4px;color:var(--accent);margin-bottom:12px;font-weight:bold">'+t.word+'</div><div class="typed" id="typed"></div>';
  const out=document.getElementById('typed');let cur='';
  setKey(e=>{if(e.key==='Enter'){if(cur.toUpperCase()===t.word.toUpperCase()){miniWin(n,t);}else{cur='';out.textContent='';}}
    else if(e.key==='Backspace'){cur=cur.slice(0,-1);out.textContent=cur;}
    else if(e.key.length===1&&/[a-zA-Z ]/.test(e.key)){cur+=e.key;out.textContent=cur.toUpperCase();}e.preventDefault();});}

function miniMemory(n,t){const st=openMini('MEMORY','Watch the chips light up, then click them in that order.');
  const items=shuffle(t.pool||['📄','☕','📊','📁','🖥','✅','⭐','🔑']).slice(0,4);
  const chips=items.map(x=>{const c=document.createElement('div');c.className='memChip';c.textContent=x;st.appendChild(c);return c;});
  const seq=shuffle(items.map((_,i)=>i));let ok=false,inp=[];
  const flash=i=>new Promise(r=>{chips[i].style.background='var(--accent)';setTimeout(()=>{chips[i].style.background='';setTimeout(r,180);},420);});
  (async()=>{await new Promise(r=>setTimeout(r,400));for(const i of seq)await flash(i);ok=true;})();
  chips.forEach((c,idx)=>c.onclick=()=>{if(!ok)return;inp.push(idx);c.classList.add('used');
    if(inp[inp.length-1]!==seq[inp.length-1]){ok=false;setTimeout(()=>fail(n,'Wrong order. [E]'),200);return;}
    if(inp.length===seq.length){ok=false;setTimeout(()=>{miniWin(n,t);},250);}});}

function miniChoose(n,t){const st=openMini('RIGHT CALL',t.q);
  shuffle(t.opts).forEach(o=>{const b=document.createElement('button');b.className='opt';b.textContent=o.t;
    b.onclick=()=>o.ok?(closeMini(),finish(n,t)):fail(n,'Not quite. [E]');st.appendChild(b);});}

function miniScramble(n,t){const st=openMini('UNSCRAMBLE','Type the unscrambled word, then Enter.');
  let sc=t.word;while(sc===t.word)sc=shuffle(t.word.split('')).join('');
  st.innerHTML='<div class="wordScram">'+sc+'</div><div class="typed" id="typed"></div>';
  const out=document.getElementById('typed');let cur='';
  setKey(e=>{if(e.key==='Enter'){if(cur.toUpperCase()===t.word){miniWin(n,t);}else{cur='';out.textContent='';}}
    else if(e.key==='Backspace'){cur=cur.slice(0,-1);out.textContent=cur;}
    else if(/^[a-zA-Z]$/.test(e.key)){cur+=e.key;out.textContent=cur.toUpperCase();}e.preventDefault();});}

function miniMath(n,t){const a=2+Math.floor(Math.random()*40),b=2+Math.floor(Math.random()*40);
  const st=openMini('QUICK MATH','What is '+a+' + '+b+' ?  Type it, Enter.');
  st.innerHTML='<div class="typed" id="typed" style="font-size:26px"></div>';
  const out=document.getElementById('typed');let cur='';
  setKey(e=>{if(e.key==='Enter'){if(parseInt(cur)===a+b){miniWin(n,t);}else{cur='';out.textContent='';}}
    else if(e.key==='Backspace'){cur=cur.slice(0,-1);out.textContent=cur;}
    else if(/^[0-9]$/.test(e.key)){cur+=e.key;out.textContent=cur;}e.preventDefault();});}

function miniReflex(n,t){const st=openMini('REFLEX','Click GO the instant it appears! Every ms counts.');
  st.innerHTML='<div id="rfBox" style="font-size:22px;height:64px;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:8px;width:100%;border:3px solid var(--wood);background:var(--paper2)">...</div><div id="rfTime" class="typed" style="font-size:18px;margin-top:6px"></div>';
  const box=document.getElementById('rfBox'),tim=document.getElementById('rfTime');
  let start=0,done=false,tickIv,fired=false;
  box.onclick=()=>{if(done)return;if(!fired){done=true;fail(n,'Too early! [E]');return;}
    done=true;clearInterval(tickIv);const ms=Date.now()-start;
    tim.textContent=ms+'ms '+(ms<900?'⚡ Fast!':'');
    ms<900?(closeMini(),finish(n,t)):fail(n,ms+'ms — too slow. [E]');};
  setTimeout(()=>{box.textContent='GO!';box.style.color='var(--green)';box.style.background='rgba(90,158,75,.1)';
    start=Date.now();fired=true;tickIv=setInterval(()=>{if(!done)tim.textContent=(Date.now()-start)+'ms';},16);
  },1000+Math.random()*2500);}

function miniHold(n,t){const st=openMini('HOLD IT','Hold SPACE... release while the bar is in the green.');
  st.innerHTML='<div id="masher"><div id="masherFill"></div></div><p style="margin-top:8px;font-size:11px;color:#9a7a4d">green zone: 60-80%</p>';
  const fill=document.getElementById('masherFill');let v=0,holding=false,done=false,iv;
  setKey(e=>{if(e.key===' '&&!holding&&!done){e.preventDefault();holding=true;
    iv=setInterval(()=>{v=Math.min(100,v+1.8);fill.style.width=v+'%';
      if(v>=100){clearInterval(iv);done=true;fail(n,'Held too long! [E]');}},40);}});
  addEventListener('keyup',function up(e){if(e.key===' '&&holding&&!done){done=true;clearInterval(iv);
    removeEventListener('keyup',up);
    (v>=60&&v<=80)?(closeMini(),finish(n,t)):fail(n,'Released at '+Math.round(v)+'%. Need 60-80. [E]');}});}

function miniTypeRace(n,t){const st=openMini('TYPE RACE','Type it before the timer runs out! Enter to submit.',true);
  st.innerHTML='<div style="font-size:22px;letter-spacing:4px;color:var(--accent);margin-bottom:12px;font-weight:bold">'+t.word+'</div><div class="typed" id="typed"></div>';
  const out=document.getElementById('typed');let cur='',done=false;
  const stopT=countdown(6,()=>{if(!done){done=true;fail(n,'Clock beat you. [E]');}});
  setKey(e=>{if(done)return;
    if(e.key==='Enter'){if(cur.toUpperCase()===t.word.toUpperCase()){done=true;stopT();miniWin(n,t);}else{cur='';out.textContent='';}}
    else if(e.key==='Backspace'){cur=cur.slice(0,-1);out.textContent=cur;}
    else if(e.key.length===1&&/[a-zA-Z ]/.test(e.key)){cur+=e.key;out.textContent=cur.toUpperCase();}e.preventDefault();});}

function miniOddEven(n,t){const st=openMini('ODD / EVEN','Click EVEN numbers only. Get all 3, one mistake = fail.');
  const evens=shuffle([2,4,6,8,10,12]).slice(0,3),odds=shuffle([1,3,5,7,9,11]).slice(0,3);
  let got=0;shuffle([...evens.map(v=>({v,g:true})),...odds.map(v=>({v,g:false}))]).forEach(o=>{
    const b=document.createElement('div');b.className='memChip';b.textContent=o.v;
    b.onclick=()=>{if(o.g){b.classList.add('used');got++;if(got>=3){miniWin(n,t);}}
      else fail(n,o.v+' is odd! [E]');};st.appendChild(b);});}

function miniTarget(n,t){const a=2+Math.floor(Math.random()*8),b=2+Math.floor(Math.random()*8);
  const target=a+b;const decoys=shuffle([target+1,target+2,target-1].filter(x=>x>0&&x!==a&&x!==b)).slice(0,2);
  const st=openMini('HIT THE TARGET','Click numbers that sum to exactly '+target+'.');
  let sum=0;shuffle([a,b,...decoys]).forEach(v=>{const c=document.createElement('div');c.className='memChip';c.textContent=v;
    c.onclick=()=>{if(c.classList.contains('used'))return;c.classList.add('used');sum+=v;
      if(sum===target){miniWin(n,t);}else if(sum>target)fail(n,'Overshot ('+sum+'/'+target+'). [E]');};
    st.appendChild(c);});}

function miniReverse(n,t){const st=openMini('REVERSE','Watch the order... then click it back in REVERSE.');
  const cols=['#c94f4f','#3f9e8f','#e8b93c','#7a5aa8'];
  const btns=cols.map((c,i)=>{const b=document.createElement('div');b.className='simBtn';b.style.background=c;b.dataset.i=i;st.appendChild(b);return b;});
  const seq=shuffle([0,1,2,3]).slice(0,3);const want=[...seq].reverse();let ok=false,inp=[];
  const flash=i=>new Promise(r=>{btns[i].classList.add('lit');setTimeout(()=>{btns[i].classList.remove('lit');setTimeout(r,170);},360);});
  (async()=>{await new Promise(r=>setTimeout(r,400));for(const i of seq)await flash(i);ok=true;})();
  btns.forEach(b=>b.onclick=()=>{if(!ok)return;const i=+b.dataset.i;b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),150);inp.push(i);
    if(inp[inp.length-1]!==want[inp.length-1]){ok=false;setTimeout(()=>fail(n,'Wrong — REVERSE order! [E]'),250);return;}
    if(inp.length===want.length){ok=false;setTimeout(()=>{miniWin(n,t);},300);}});}

function miniMoving(n,t){const st=openMini('CATCH IT','Click the moving button 3 times. It will not sit still.',true);
  const box=document.createElement('div');box.style.cssText='position:relative;width:100%;height:160px';
  const b=document.createElement('button');b.className='btn';b.textContent='CATCH';b.style.position='absolute';
  box.appendChild(b);st.appendChild(box);
  let hits=0,done=false;
  function jump(){b.style.left=(Math.random()*(box.clientWidth-90))+'px';b.style.top=(Math.random()*(160-40))+'px';}
  jump();const mover=setInterval(()=>{if(!done)jump();},800);
  b.onclick=()=>{if(done)return;hits++;b.textContent='CATCH x'+hits;jump();
    if(hits>=3){done=true;clearInterval(mover);stopT();miniWin(n,t);}};
  const stopT=countdown(8,()=>{if(!done){done=true;clearInterval(mover);fail(n,'Slipped away ('+hits+'/3). [E]');}});}

function miniHigherLower(n,t){const st=openMini('HIGHER','Click the BIGGER number. 3 rounds.');
  let round=0;const info=document.createElement('div');info.className='typed';info.textContent='Round 1 / 3';
  const row=document.createElement('div');row.style.cssText='display:flex;gap:20px';
  st.appendChild(info);st.appendChild(row);
  function newRound(){row.innerHTML='';let a=10+Math.floor(Math.random()*90),b=10+Math.floor(Math.random()*90);
    while(b===a)b=10+Math.floor(Math.random()*90);
    [a,b].forEach(v=>{const c=document.createElement('div');c.className='memChip';c.style.fontSize='22px';c.textContent=v;
      c.onclick=()=>{clearInterval(tv);if(v===Math.max(a,b)){round++;if(round>=3){miniWin(n,t);}else{info.textContent='Round '+(round+1)+' / 3';newRound();}}
        else fail(n,'That one was smaller. [E]');};row.appendChild(c);});
    let td=3;const tEl=document.createElement('div');tEl.style.cssText='font-size:11px;color:var(--wood);margin-top:4px';tEl.textContent='3s';st.appendChild(tEl);
    const tv=setInterval(()=>{td--;tEl.textContent=td+'s';if(td<=0){clearInterval(tv);fail(n,'Too slow! [E]');}},1000);}
  newRound();}

function miniGridMem(n,t){const st=openMini('GRID MEMORY','Memorize the lit cells... then click them all (any order).');
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:8px';
  const cells=[];for(let i=0;i<9;i++){const c=document.createElement('div');c.className='gridCell';c.dataset.i=i;grid.appendChild(c);cells.push(c);}
  st.appendChild(grid);
  const targets=shuffle([...Array(9).keys()]).slice(0,4);let ok=false,got=0;
  targets.forEach(i=>cells[i].classList.add('lit'));
  setTimeout(()=>{targets.forEach(i=>cells[i].classList.remove('lit'));ok=true;},1300);
  cells.forEach(c=>c.onclick=()=>{if(!ok)return;const i=+c.dataset.i;
    if(targets.includes(i)&&!c.classList.contains('lit')){c.classList.add('lit');got++;
      if(got>=targets.length){miniWin(n,t);}}
    else if(!targets.includes(i))fail(n,'That cell was dark. [E]');});}

function miniStopwatch(n,t){const st=openMini('STOPWATCH','Press SPACE to start, SPACE again to stop at exactly 3.00s (max 0.20 off).');
  st.innerHTML='<div class="typed" id="sw" style="font-size:34px">0.00</div>';
  const sw=document.getElementById('sw');let start=null,raf,done=false;
  function tick(){if(start===null||done)return;sw.textContent=((Date.now()-start)/1000).toFixed(2);raf=requestAnimationFrame(tick);}
  setKey(e=>{if(e.key!==' '||done)return;e.preventDefault();
    if(start===null){start=Date.now();tick();}
    else{done=true;cancelAnimationFrame(raf);const el=(Date.now()-start)/1000;sw.textContent=el.toFixed(2);
      setTimeout(()=>Math.abs(el-3)<=0.2?(closeMini(),finish(n,t)):fail(n,'Stopped at '+el.toFixed(2)+'s. [E]'),300);}});}

// MAZE: guide a dot from start to end without touching walls
function miniMaze(n,t){
  const COLS=9,ROWS=7,CS=30,W=270,H=210;
  const vis=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  const wh={h:Array.from({length:ROWS+1},()=>Array(COLS).fill(true)),v:Array.from({length:ROWS},()=>Array(COLS+1).fill(true))};
  function carve(r,c2){vis[r][c2]=true;[[0,1],[0,-1],[1,0],[-1,0]].sort(()=>Math.random()-.5).forEach(([dr,dc])=>{const nr=r+dr,nc=c2+dc;if(nr<0||nr>=ROWS||nc<0||nc>=COLS||vis[nr][nc])return;
    dc!==0?wh.v[r][c2+Math.max(0,dc)]=false:wh.h[r+Math.max(0,dr)][c2]=false;carve(nr,nc);});}
  carve(0,0);
  const st=openMini('MAZE','W/A/S/D to reach the green exit!',true);
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.style.cssText='border:3px solid var(--wood2);border-radius:6px;background:#e4cd9d;display:block;margin:0 auto';
  const g=cv.getContext('2d');let pr=CS/2,pc=CS/2,done=false;
  const draw=()=>{g.fillStyle='#e4cd9d';g.fillRect(0,0,W,H);
    g.strokeStyle='#6b431f';g.lineWidth=2;
    for(let r=0;r<=ROWS;r++)for(let cc=0;cc<COLS;cc++)if(wh.h[r][cc]){g.beginPath();g.moveTo(cc*CS,r*CS);g.lineTo((cc+1)*CS,r*CS);g.stroke();}
    for(let r=0;r<ROWS;r++)for(let cc=0;cc<=COLS;cc++)if(wh.v[r][cc]){g.beginPath();g.moveTo(cc*CS,r*CS);g.lineTo(cc*CS,(r+1)*CS);g.stroke();}
    g.fillStyle='var(--green)';g.beginPath();g.arc((COLS-.5)*CS,(ROWS-.5)*CS,9,0,7);g.fill();
    g.fillStyle='var(--accent)';g.beginPath();g.arc(pr,pc,7,0,7);g.fill();};
  draw();st.appendChild(cv);
  // pr=pixel-x (col), pc=pixel-y (row)
  const mv=(dr,dc)=>{if(done)return;
    const row=Math.round(pc/CS-.5),col=Math.round(pr/CS-.5);
    const nr=row+dr,nc=col+dc;
    if(nr<0||nr>=ROWS||nc<0||nc>=COLS)return;
    const ok=dr!==0?!wh.h[row+Math.max(0,dr)][col]:!wh.v[row][col+Math.max(0,dc)];
    if(!ok)return;pr=nc*CS+CS/2;pc=nr*CS+CS/2;draw();
    if(nc===COLS-1&&nr===ROWS-1){done=true;stopT();miniWin(n,t);}};
  setKey(e=>{const m={'w':[-1,0],'ArrowUp':[-1,0],'s':[1,0],'ArrowDown':[1,0],'a':[0,-1],'ArrowLeft':[0,-1],'d':[0,1],'ArrowRight':[0,1]}[e.key];
    if(m){e.preventDefault();mv(...m);}});
  const stopT=countdown(20,()=>{if(!done){done=true;fail(n,'Too slow. [E]');}});}

function miniSpy(n,t){const labels=t.labels||['📄 Doc','☕ Coffee','🖥 Monitor','📊 Chart','📁 Folder'];
  const used=shuffle(labels).slice(0,4);const pos=shuffle([0,1,2,3]);
  const st=openMini('SPY','Memorize the layout — then identify each slot.');
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-width:260px';
  const cells=[];for(let i=0;i<4;i++){const d=document.createElement('div');d.className='gridCell';d.style.cssText+='height:52px;font-size:13px;font-weight:bold;text-align:center;padding:6px';d.textContent=used[pos.indexOf(i)];grid.appendChild(d);cells.push(d);}
  st.appendChild(grid);
  const qIdx=Math.floor(Math.random()*4);const qLabel=used[pos.indexOf(qIdx)];const desc=document.getElementById('miniDesc');
  setTimeout(()=>{cells.forEach(d=>{d.textContent='?';d.style.color='var(--wood)';});
    desc.textContent='Which slot had "'+qLabel+'"?';
    cells.forEach((d,i)=>d.onclick=()=>i===qIdx?miniWin(n,t):fail(n,'Wrong slot. [E]'));},2500);}


// PRIORITY: click cards in priority order (1=highest)
function miniPriority(n,t){const st=openMini('PRIORITY',t.hint||'Click cards from HIGHEST priority to lowest.');
  const cards=shuffle(t.cards||[{l:'URGENT',p:1},{l:'Important',p:2},{l:'Normal',p:3},{l:'Whenever',p:4}]);
  let next=1;cards.forEach(c=>{const b=document.createElement('div');b.className='memChip';b.style.fontSize='12px';b.textContent=c.l;
    b.onclick=()=>{if(c.p===next){b.classList.add('used');next++;if(next>cards.length){miniWin(n,t);}}
      else fail(n,'Wrong priority. [E]');};st.appendChild(b);});}

// ECHO: sequence that grows each round (like Simon but escalating)
function miniEcho(n,t){const st=openMini('ECHO','Watch, repeat. Sequence grows each round. Reach length 5.');
  const cols=['#c94f4f','#3f9e8f','#e8b93c','#7a5aa8'];
  const btns=cols.map((c,i)=>{const b=document.createElement('div');b.className='simBtn';b.style.background=c;b.dataset.i=i;st.appendChild(b);return b;});
  let seq=[Math.floor(Math.random()*4)],ok=false,inp=[];
  const flash=i=>new Promise(r=>{btns[i].classList.add('lit');setTimeout(()=>{btns[i].classList.remove('lit');setTimeout(r,150);},320);});
  async function playRound(){ok=false;inp=[];await new Promise(r=>setTimeout(r,300));for(const i of seq)await flash(i);ok=true;}
  playRound();
  btns.forEach(b=>b.onclick=()=>{if(!ok)return;const i=+b.dataset.i;b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),140);inp.push(i);
    if(inp[inp.length-1]!==seq[inp.length-1]){ok=false;setTimeout(()=>fail(n,'Broke the echo at step '+seq.length+'. [E]'),250);return;}
    if(inp.length===seq.length){if(seq.length>=5){ok=false;setTimeout(()=>{miniWin(n,t);},300);}
      else{seq.push(Math.floor(Math.random()*4));setTimeout(playRound,400);}}});}

// SPLICE: match left half to its right half
function miniSplice(n,t){const st=openMini('SPLICE',t.hint||'Click a left item, then its matching right item.');
  const pairs=t.pairs||[['A','1'],['B','2'],['C','3']];
  const left=shuffle(pairs.map(p=>p[0])),right=shuffle(pairs.map(p=>p[1]));
  const map={};pairs.forEach(p=>map[p[0]]=p[1]);
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;gap:30px';
  const lc=document.createElement('div'),rc=document.createElement('div');
  lc.style.cssText=rc.style.cssText='display:flex;flex-direction:column;gap:8px';
  let sel=null,matched=0;
  left.forEach(v=>{const b=document.createElement('div');b.className='memChip';b.style.fontSize='12px';b.textContent=v;
    b.onclick=()=>{if(b.classList.contains('used'))return;sel=v;[...lc.children].forEach(x=>x.style.borderColor='');b.style.borderColor='var(--gold)';};lc.appendChild(b);});
  right.forEach(v=>{const b=document.createElement('div');b.className='memChip';b.style.fontSize='12px';b.textContent=v;
    b.onclick=()=>{if(sel===null)return;
      if(map[sel]===v){b.classList.add('used');[...lc.children].find(x=>x.textContent===sel&&!x.classList.contains('used')).classList.add('used');
        matched++;sel=null;if(matched>=pairs.length){miniWin(n,t);}}
      else fail(n,'Wrong match. [E]');};rc.appendChild(b);});
  wrap.appendChild(lc);wrap.appendChild(rc);st.appendChild(wrap);}

// NOISE: find the target among lots of near-identical decoys
function miniNoise(n,t){const st=openMini('FIND IT',t.hint||'Find the ONE real entry hiding in the noise.');
  const real=t.real||'OK';const fakes=t.fakes||['0K','O K','QK'];
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:5px;font-size:10px';
  const total=16,realIdx=Math.floor(Math.random()*total);
  for(let i=0;i<total;i++){const c=document.createElement('div');c.className='gridCell';c.style.cssText+='width:88px;height:34px;font-size:10px';
    c.textContent=i===realIdx?real:rnd(fakes);
    c.onclick=()=>i===realIdx?(closeMini(),finish(n,t)):fail(n,'That was noise. [E]');grid.appendChild(c);}
  st.appendChild(grid);}

// BUDGET: allocate slider values across categories to hit exact total
function miniBudget(n,t){const target=100;const cats=['A','B','C'];
  const st=openMini('BUDGET','Set the three sliders so they add up to exactly '+target+'.');
  const sliders=cats.map(c=>{const wrap=document.createElement('div');wrap.style.margin='6px';
    wrap.innerHTML='<div style="font-size:11px">'+c+'</div><input type="range" min="0" max="100" value="33" style="width:160px;accent-color:var(--accent)">';
    st.appendChild(wrap);return wrap.querySelector('input');});
  const out=document.createElement('div');out.className='typed';st.appendChild(out);
  function upd(){const sum=sliders.reduce((a,s)=>a+ +s.value,0);out.textContent='Total: '+sum+' / '+target;out.style.color=Math.abs(sum-target)<=5?'var(--green)':'var(--inkbrown)';}
  sliders.forEach(s=>s.oninput=upd);upd();
  const btn=document.createElement('button');btn.className='btn';btn.textContent='Lock it in';st.appendChild(btn);
  btn.onclick=()=>{const sum=sliders.reduce((a,s)=>a+ +s.value,0);
    Math.abs(sum-target)<=5?(closeMini(),finish(n,t)):fail(n,'Total was '+sum+', needed '+target+'. [E]');};}

// CRACK: guess the number with higher/lower feedback, limited attempts
function miniCrack(n,t){const secret=10+Math.floor(Math.random()*90);let tries=6;
  const st=openMini('CRACK IT','Guess the number (10-99). '+tries+' tries left. Type + Enter.');
  const out=document.createElement('div');out.className='typed';st.appendChild(out);
  const fb=document.createElement('div');fb.style.cssText='color:var(--accent);font-size:13px;margin-top:6px';st.appendChild(fb);
  let cur='';setKey(e=>{
    if(e.key==='Enter'){const g=parseInt(cur);cur='';out.textContent='';
      if(!g)return;
      if(g===secret){miniWin(n,t);return;}
      tries--;if(tries<=0){fail(n,'Out of tries. It was '+secret+'. [E]');return;}
      fb.textContent=(g<secret?'Higher! ':'Lower! ')+tries+' tries left.';
    }else if(e.key==='Backspace'){cur=cur.slice(0,-1);out.textContent=cur;}
    else if(/^[0-9]$/.test(e.key)){cur+=e.key;out.textContent=cur;}e.preventDefault();});}

// JENGA: remove blocks in a SAFE order (don't pull the marked support blocks first)
function miniJenga(n,t){
  const R=4,C=3;
  const W2=Array.from({length:R},()=>Array.from({length:C},()=>1+Math.floor(Math.random()*5)));
  W2.forEach(row=>{if(!row.some(v=>v>=4))row[Math.floor(Math.random()*C)]=4+Math.floor(Math.random()*2);});
  const rem=Array.from({length:R},()=>Array(C).fill(false));let done=false;
  const st=openMini('JENGA','Remove safe blocks (green/yellow) first. Red = load-bearing!');
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;gap:5px;align-items:center';
  W2.forEach((row,r)=>{const rowEl=document.createElement('div');rowEl.style.cssText='display:flex;gap:5px';
    row.forEach((w,col)=>{const b=document.createElement('div');
      b.style.cssText='width:60px;height:30px;border:2px solid var(--wood2);border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:#fff;transition:.15s';
      b.style.background=w>=4?'var(--red)':w===3?'var(--gold)':'var(--green)';b.textContent=(w>=4?'⚠ ':'')+w;b.dataset.w=w;
      b.onclick=()=>{if(done||b.dataset.gone)return;
        const safeLeft=W2.some((row2,r2)=>row2.some((v2,c2)=>!rem[r2][c2]&&v2<4&&!(r2===r&&c2===col)));
        if(+b.dataset.w>=4&&safeLeft){done=true;fail(n,'Load-bearing block removed too early! [E]');return;}
        rem[r][col]=true;b.style.opacity='.2';b.dataset.gone='1';
        if(W2.every((row2,r2)=>row2.every((_,c2)=>rem[r2][c2]))){done=true;miniWin(n,t);}};
      rowEl.appendChild(b);});wrap.appendChild(rowEl);});
  st.appendChild(wrap);}


// SIGNAL: click at the peak of an oscillating wave
function miniSignal(n,t){const st=openMini('SIGNAL','Click SPACE when the wave hits the peak (top). 3 peaks.');
  st.innerHTML='<div style="position:relative;width:260px;height:80px"><div id="wv" style="position:absolute;bottom:0;width:8px;height:8px;background:var(--accent);border-radius:50%"></div><div style="position:absolute;top:0;left:0;right:0;border-top:2px dashed var(--green)"></div></div><div class="typed" id="sgc">0 / 3</div>';
  const wv=document.getElementById('wv'),sgc=document.getElementById('sgc');let ph=0,hit=0,done=false;
  const raf=setInterval(()=>{if(done)return;ph+=0.12;const y=(Math.sin(ph)+1)/2*70;wv.style.bottom=y+'px';},20);
  setKey(e=>{if(e.key===' '&&!done){e.preventDefault();const y=(Math.sin(ph)+1)/2*70;
    if(y>=60){hit++;sgc.textContent=hit+' / 3';if(hit>=3){done=true;clearInterval(raf);miniWin(n,t);}}
    else{done=true;clearInterval(raf);fail(n,'Missed the peak. [E]');}}});}

// FORGE: combine two ingredients in the correct order to match target
// FORGE: sequential validation
function miniForge(n,t){const recipe=t.recipe||shuffle(['RED','BLUE','GOLD']).slice(0,2);const extra=t.extra||['TEAL'];
  const st=openMini('FORGE','Click in this exact order: '+recipe.join(' → '));
  const prog=document.createElement('div');prog.style.cssText='font-size:12px;color:var(--wood);margin:6px 0;font-weight:bold';prog.textContent='Step 1/'+recipe.length+': '+recipe[0];st.appendChild(prog);
  let step=0,done=false;
  shuffle([...recipe,...extra]).forEach(v=>{const b=document.createElement('div');b.className='memChip';b.style.fontSize='12px';b.textContent=v;
    b.onclick=()=>{if(done||b.dataset.gone)return;
      if(v===recipe[step]){b.dataset.gone='1';b.style.background='var(--green)';b.style.color='#fff';b.style.pointerEvents='none';step++;
        if(step>=recipe.length){done=true;miniWin(n,t);return;}prog.textContent='Step '+(step+1)+'/'+recipe.length+': '+recipe[step];}
      else{done=true;fail(n,'Needed "'+recipe[step]+'", got "'+v+'". [E]');}};st.appendChild(b);});}


// OVERLOAD: keep two bars filled simultaneously with different keys
function miniOverload(n,t){const st=openMini('OVERLOAD','Press J to fill the top bar, K the bottom. Keep BOTH above 70% for 3s.',true);
  st.innerHTML='<div style="margin-bottom:8px;width:100%"><div style="font-size:11px">J</div><div style="width:100%;height:30px;background:#d9bd8a;border:3px solid var(--wood2);border-radius:8px;overflow:hidden"><div id="ovl1" style="height:100%;width:0;background:var(--teal)"></div></div></div>'+
    '<div style="width:100%"><div style="font-size:11px">K</div><div style="width:100%;height:30px;background:#d9bd8a;border:3px solid var(--wood2);border-radius:8px;overflow:hidden"><div id="ovl2" style="height:100%;width:0;background:var(--gold)"></div></div></div>';
  const b1=document.getElementById('ovl1'),b2=document.getElementById('ovl2');let v1=0,v2=0,good=0,done=false;
  const decay=setInterval(()=>{if(done)return;v1=Math.max(0,v1-1.5);v2=Math.max(0,v2-1.5);b1.style.width=v1+'%';b2.style.width=v2+'%';
    good=(v1>=70&&v2>=70)?good+0.06:Math.max(0,good-0.03);
    if(good>=3){done=true;clearInterval(decay);stopT();miniWin(n,t);}},60);
  setKey(e=>{if(done)return;const k=e.key.toLowerCase();
    if(k==='j'){e.preventDefault();v1=Math.min(100,v1+9);b1.style.width=v1+'%';}
    if(k==='k'){e.preventDefault();v2=Math.min(100,v2+9);b2.style.width=v2+'%';}});
  const stopT=countdown(14,()=>{if(!done){done=true;clearInterval(decay);fail(n,'Dropped the load. [E]');}});}

/* ===== ROUND 1: 12 NEW MECHANICS ===== */

/* 1. DRAGFILE — drag file icons into the matching folder */
function miniDragFile(n,t){const st=openMini('ORGANIZE','Drag each file onto the folder of the SAME color.');
  const cols=[['#c94f4f','r'],['#3f9e8f','g'],['#e8b93c','y']];const order=shuffle(cols.slice());
  st.innerHTML='<div class="nmWrap"><div id="nmFiles" class="nmRow"></div><div id="nmFolders" class="nmRow" style="margin-top:24px"></div></div>';
  const fRow=document.getElementById('nmFiles'),dRow=document.getElementById('nmFolders');let left=cols.length,done=false;
  order.forEach(c=>{const f=document.createElement('div');f.className='nmFile';f.style.background=c[0];f.textContent='📄';f.dataset.k=c[1];fRow.appendChild(f);
    f.onpointerdown=e=>{e.preventDefault();f.setPointerCapture(e.pointerId);const r=st.getBoundingClientRect();
      f.style.position='absolute';f.style.zIndex=9;const mv=ev=>{f.style.left=(ev.clientX-r.left-27)+'px';f.style.top=(ev.clientY-r.top-27)+'px';};
      const up=ev=>{f.removeEventListener('pointermove',mv);f.removeEventListener('pointerup',up);
        f.style.visibility='hidden';const tgt=document.elementFromPoint(ev.clientX,ev.clientY);f.style.visibility='';
        const fol=tgt&&tgt.closest?tgt.closest('.nmFolder'):null;
        if(fol&&fol.dataset.k===f.dataset.k){f.remove();fol.classList.add('lit');left--;if(left===0&&!done){done=true;setTimeout(()=>{miniWin(n,t);},250);}}
        else{f.style.position='';f.style.left='';f.style.top='';f.style.zIndex='';}};
      f.addEventListener('pointermove',mv);f.addEventListener('pointerup',up);};});
  shuffle(cols.slice()).forEach(c=>{const d=document.createElement('div');d.className='nmFolder';d.style.borderColor=c[0];d.dataset.k=c[1];d.textContent='📁';dRow.appendChild(d);});}

/* 2. CALENDAR — drop meeting blocks into free slots without conflicts */
function miniCalendar(n,t){const st=openMini('SCHEDULE','Click a meeting, then click a FREE (green) slot. Fill all 3, no clash.');
  const days=['Mo','Tu','We','Th','Fr'];const busy=new Set();while(busy.size<4)busy.add(Math.floor(Math.random()*15));
  st.innerHTML='<div style="width:100%"><div id="nmMeet" class="nmRow" style="margin-bottom:10px"></div><div id="nmGrid" class="nmGrid"></div></div>';
  const grid=document.getElementById('nmGrid'),meet=document.getElementById('nmMeet');let sel=null,placed=0,done=false;
  for(let i=0;i<15;i++){const c=document.createElement('div');c.className='nmSlot';const b=busy.has(i);
    if(b){c.classList.add('busy');c.textContent='✕';}c.dataset.i=i;grid.appendChild(c);
    c.onclick=()=>{if(b||c.classList.contains('set')||!sel)return;c.classList.add('set');c.textContent='●';sel.remove();sel=null;placed++;
      if(placed===3&&!done){done=true;setTimeout(()=>{miniWin(n,t);},250);}};}
  ['1:1','Demo','Sync'].forEach(m=>{const b=document.createElement('div');b.className='nmMeetBlk';b.textContent=m;meet.appendChild(b);
    b.onclick=()=>{document.querySelectorAll('.nmMeetBlk').forEach(x=>x.classList.remove('lit'));b.classList.add('lit');sel=b;};});}

/* 3. PARK — steer the car into the marked bay with arrow keys, don't hit walls */
function miniPark(n,t){const st=openMini('PARK','Arrows to drive. Land fully inside the tight bay, then SPACE. Two pillars — one MOVES.',true);
  st.innerHTML='<div id="nmLot" class="nmLot" style="position:relative"><div id="nmBay" class="nmBay"></div><div id="nmObs" class="nmObs"></div><div id="nmObs2" class="nmObs" style="background:#7a4a2a"></div><div id="nmCar" class="nmCar">🚗</div></div>';
  const lot=document.getElementById('nmLot'),bay=document.getElementById('nmBay'),car=document.getElementById('nmCar'),obs=document.getElementById('nmObs'),obs2=document.getElementById('nmObs2');
  const W=300,H=170,CAR=32;
  // tighter bay: only ~8px of total slack around a 32px car
  bay.style.width='40px';bay.style.height='40px';bay.style.left=(W-46)+'px';bay.style.top=(6+Math.random()*(H-52))+'px';
  // static pillar mid-lane
  obs.style.left='120px';obs.style.top='0px';obs.style.height='70px';
  // moving pillar sliding vertically across the second choke point
  obs2.style.left='200px';obs2.style.width='22px';obs2.style.height='34px';
  let oy=0,odir=1;
  let x=8,y=H/2-16,done=false;
  const place=()=>{car.style.left=x+'px';car.style.top=y+'px';};place();
  const hit=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  // animate the moving pillar and check continuous collision with it
  const anim=setInterval(()=>{if(done)return;oy+=odir*2.6;if(oy>H-34||oy<0)odir*=-1;obs2.style.top=oy+'px';
    const cr=car.getBoundingClientRect(),o2=obs2.getBoundingClientRect();
    if(hit(cr,o2)){done=true;clearInterval(anim);stopT();fail(n,'Moving pillar clipped you! [E]');}},30);
  setKey(e=>{if(done)return;const s=8;if(e.key==='ArrowUp')y-=s;else if(e.key==='ArrowDown')y+=s;else if(e.key==='ArrowLeft')x-=s;else if(e.key==='ArrowRight')x+=s;
    else if(e.key===' '){e.preventDefault();const br=bay.getBoundingClientRect(),cr=car.getBoundingClientRect();
      // tolerance tightened from 4px to 3px on every edge
      if(cr.left>=br.left-3&&cr.right<=br.right+3&&cr.top>=br.top-3&&cr.bottom<=br.bottom+3){done=true;clearInterval(anim);stopT();miniWin(n,t);}
      else fail(n,'Not squarely in the bay. [E]');return;}
    else return;e.preventDefault();x=Math.max(0,Math.min(W-CAR,x));y=Math.max(0,Math.min(H-CAR,y));place();
    const cr=car.getBoundingClientRect(),or=obs.getBoundingClientRect();
    if(hit(cr,or)){done=true;clearInterval(anim);stopT();fail(n,'Scraped the pillar! [E]');}});
  const stopT=countdown(15,()=>{if(!done){done=true;clearInterval(anim);fail(n,'Too slow, blocked the lane. [E]');}});}

/* 4. QRALIGN — move the reticle over the code and hold steady to lock */
function miniQR(n,t){const st=openMini('SCAN','Arrows to move the scanner over the code. Hold it centered to lock.',true);
  st.innerHTML='<div id="nmScan" class="nmScan"><div id="nmCode" class="nmCode"></div><div id="nmRet" class="nmRet"></div><div id="nmLock" class="nmLockBar"><div id="nmLockF"></div></div></div>';
  const code=document.getElementById('nmCode'),ret=document.getElementById('nmRet'),lf=document.getElementById('nmLockF');
  const W=260,H=150;let cx=40+Math.random()*(W-140),cy=20+Math.random()*(H-100);code.style.left=cx+'px';code.style.top=cy+'px';
  let x=W/2-30,y=H/2-30,lock=0,done=false;const place=()=>{ret.style.left=x+'px';ret.style.top=y+'px';};place();
  setKey(e=>{if(done)return;const s=9;if(e.key==='ArrowUp')y-=s;else if(e.key==='ArrowDown')y+=s;else if(e.key==='ArrowLeft')x-=s;else if(e.key==='ArrowRight')x+=s;else return;e.preventDefault();place();});
  const iv=setInterval(()=>{if(done)return;const dx=Math.abs((x+30)-(cx+30)),dy=Math.abs((y+30)-(cy+30));
    if(dx<18&&dy<18){lock=Math.min(100,lock+7);ret.classList.add('lit');}else{lock=Math.max(0,lock-5);ret.classList.remove('lit');}
    lf.style.width=lock+'%';if(lock>=100){done=true;clearInterval(iv);stopT();miniWin(n,t);}},60);
  const stopT=countdown(14,()=>{if(!done){done=true;clearInterval(iv);fail(n,'Scan failed. [E]');}});}

/* 5. RECIPE — add ingredients to hit the exact recipe amounts */
function miniRecipe(n,t){const R={Water:3,Coffee:2,Milk:1};const st=openMini('MAKE COFFEE','Add each ingredient to EXACTLY the recipe amount, then SERVE.');
  st.innerHTML='<div style="width:100%"><div id="nmRec" style="text-align:center;margin-bottom:8px;font-size:13px"></div><div id="nmBtns" class="nmRow"></div><button id="nmServe" class="btn" style="margin-top:14px">SERVE</button></div>';
  const rec=document.getElementById('nmRec'),btns=document.getElementById('nmBtns');const cur={Water:0,Coffee:0,Milk:0};
  const render=()=>{rec.innerHTML=Object.keys(R).map(k=>k+': <b>'+cur[k]+'</b>/'+R[k]).join('&nbsp;&nbsp;');};render();
  Object.keys(R).forEach(k=>{const b=document.createElement('button');b.className='btn ghost';b.textContent='+ '+k;btns.appendChild(b);
    b.onclick=()=>{cur[k]++;render();};});
  document.getElementById('nmServe').onclick=()=>{const ok=Object.keys(R).every(k=>cur[k]===R[k]);
    if(ok){miniWin(n,t);}else fail(n,'Wrong measures — barista frowns. [E]');};}

/* 6. CASH — click bills/coins to reach the exact total */
function miniCash(n,t){const denom=[100,50,20,10,5,1];const target=[100,50,20,10,5,1].reduce((a,d)=>a+d*(Math.floor(Math.random()*3)),0)||55;
  const st=openMini('COUNT CASH','Click notes/coins to reach the EXACT amount, then LOCK.');
  st.innerHTML='<div style="width:100%;text-align:center"><div style="font-size:15px;margin-bottom:6px">Target: <b>'+target+'</b></div><div id="nmTot" style="font-size:20px;margin-bottom:8px">0</div><div id="nmDen" class="nmRow"></div><div style="margin-top:12px"><button id="nmUndo" class="btn ghost">Undo</button> <button id="nmLock2" class="btn">LOCK</button></div></div>';
  const den=document.getElementById('nmDen'),tot=document.getElementById('nmTot');let sum=0;const hist=[];
  denom.forEach(d=>{const b=document.createElement('button');b.className='btn ghost';b.textContent=d;den.appendChild(b);
    b.onclick=()=>{sum+=d;hist.push(d);tot.textContent=sum;};});
  document.getElementById('nmUndo').onclick=()=>{if(hist.length){sum-=hist.pop();tot.textContent=sum;}};
  document.getElementById('nmLock2').onclick=()=>{if(sum===target){miniWin(n,t);}else fail(n,'Drawer does not balance. [E]');};}

/* 7. PROOFREAD — click the misspelled word */
function miniProof(n,t){const sets=[['The','quarterly','report','was','aproved','yesterday'],['Please','sign','the','contarct','before','noon'],['Our','new','offise','opens','next','week'],['The','invoice','ammount','looks','correct','today']];
  const s=sets[Math.floor(Math.random()*sets.length)];const bad=s.findIndex(w=>/aproved|contarct|offise|ammount/.test(w));
  const st=openMini('FIND TYPO','One word is misspelled. Click it.');
  st.innerHTML='<div id="nmSent" style="font-size:16px;line-height:1.8;text-align:center;max-width:340px"></div>';
  const sent=document.getElementById('nmSent');s.forEach((w,i)=>{const sp=document.createElement('span');sp.className='nmWord';sp.textContent=w+' ';sent.appendChild(sp);
    sp.onclick=()=>{if(i===bad){miniWin(n,t);}else fail(n,'That one is fine. [E]');};});}

/* 8. DOCSORT — approve valid docs, reject invalid ones, fast, under timer */
function miniDocSort(n,t){const st=openMini('STAMP','APPROVE signed docs (✔ seal), REJECT the blank ones. Clear all 6.',true);
  st.innerHTML='<div style="width:100%;text-align:center"><div id="nmDoc" class="nmDoc"></div><div id="nmCnt" style="margin:8px 0;font-size:12px"></div><div><button id="nmRej" class="btn ghost">REJECT ✕</button> <button id="nmApp" class="btn">APPROVE ✔</button></div></div>';
  const doc=document.getElementById('nmDoc'),cnt=document.getElementById('nmCnt');let queue=Array.from({length:6},()=>Math.random()<0.5),idx=0,done=false;
  const show=()=>{if(idx>=queue.length){done=true;stopT();miniWin(n,t);return;}cnt.textContent=(idx+1)+'/'+queue.length;
    doc.style.opacity=0;setTimeout(()=>{doc.textContent=queue[idx]?'✔ SIGNED':'▭ BLANK';doc.style.borderColor=queue[idx]?'var(--green)':'var(--red)';doc.style.transition='opacity .2s';doc.style.opacity=1;},80);};
  const answer=app=>{if(done)return;const ok=(app===queue[idx]);if(!ok){done=true;stopT();fail(n,'Wrong stamp! [E]');return;}idx++;show();};
  document.getElementById('nmApp').onclick=()=>answer(true);document.getElementById('nmRej').onclick=()=>answer(false);show();
  setKey(e=>{if(e.key==='ArrowRight')answer(true);else if(e.key==='ArrowLeft')answer(false);});
  const stopT=countdown(12,()=>{if(!done){done=true;fail(n,'Too slow, pile toppled. [E]');}});}

/* 9. JAM — tug the stuck paper in the shown direction (directional mash) */
function miniJam(n,t){const st=openMini('PAPER JAM','Mash the ARROW shown to pull the paper. Direction changes — watch it.',true);
  st.innerHTML='<div style="width:100%;text-align:center"><div id="nmArrow" style="font-size:52px;margin-bottom:6px"></div><div id="nmJbar" style="width:100%;height:26px;background:#d9bd8a;border:3px solid var(--wood2);border-radius:8px;overflow:hidden"><div id="nmJfill" style="height:100%;width:0;background:var(--green)"></div></div></div>';
  const arr=document.getElementById('nmArrow'),fill=document.getElementById('nmJfill');const dirs={ArrowUp:'⬆',ArrowDown:'⬇',ArrowLeft:'⬅',ArrowRight:'➡'};
  let need='ArrowDown',prog=0,done=false;const roll=()=>{need=shuffle(Object.keys(dirs))[0];arr.textContent=dirs[need];};roll();
  setKey(e=>{if(done)return;if(e.key===need){e.preventDefault();prog=Math.min(100,prog+9);fill.style.width=prog+'%';
    if(prog>=100){done=true;stopT();miniWin(n,t);}else if(Math.random()<0.25)roll();}
    else if(dirs[e.key]){prog=Math.max(0,prog-6);fill.style.width=prog+'%';}});
  const stopT=countdown(14,()=>{if(!done){done=true;fail(n,'Paper tore. [E]');}});}

/* 10. SCRUB — drag over the dirty panel until it is clean */
function miniScrub(n,t){const st=openMini('WASH','Drag the sponge over every dirty patch until the panel is clean.');
  st.innerHTML='<div id="nmPanel" class="nmPanel"></div>';const panel=document.getElementById('nmPanel');
  const N=20,cells=[];for(let i=0;i<N;i++){const c=document.createElement('div');c.className='nmDirt';panel.appendChild(c);cells.push(c);}
  let cleaned=0,down=false,done=false;const clean=el=>{if(el&&el.classList.contains('nmDirt')&&!el.classList.contains('ok')){el.classList.add('ok');cleaned++;
    if(cleaned>=N&&!done){done=true;setTimeout(()=>{miniWin(n,t);},200);}}};
  panel.onpointerdown=e=>{down=true;clean(e.target);};panel.onpointermove=e=>{if(down)clean(document.elementFromPoint(e.clientX,e.clientY));};
  window.addEventListener('pointerup',()=>down=false,{once:false});}

/* 11. INSPECT — click every hidden damage spot on the vehicle */
function miniInspect(n,t){const st=openMini('INSPECT','Click all 3 damage spots on the car body.');
  const cv=document.createElement('canvas');cv.width=320;cv.height=200;cv.style.cssText='border:3px solid var(--wood);border-radius:8px;background:#d8ecf8;cursor:crosshair';
  st.appendChild(cv);const g=cv.getContext('2d');
  g.fillStyle='#4a8ac4';g.beginPath();g.roundRect(14,82,292,92,14);g.fill();
  g.fillStyle='#6aaee0';g.beginPath();g.roundRect(58,50,196,54,10);g.fill();
  g.fillStyle='#2a5a80';g.beginPath();g.roundRect(14,164,292,10,4);g.fill();
  [[62,172],[252,172]].forEach(([x,y])=>{g.fillStyle='#222';g.beginPath();g.arc(x,y,17,0,7);g.fill();g.fillStyle='#777';g.beginPath();g.arc(x,y,7,0,7);g.fill();});
  [[70,57],[192,57]].forEach(([x,y])=>{g.fillStyle='rgba(180,220,255,.7)';g.beginPath();g.roundRect(x,y,66,38,6);g.fill();});
  const flaws=t.flaws||[{x:52,y:120},{x:220,y:112},{x:138,y:66}];
  let found=0,done=false;const foundSet=new Set();
  const sc=document.createElement('div');sc.className='typed';sc.style.marginTop='6px';sc.textContent='Found: 0 / '+flaws.length;st.appendChild(sc);
  cv.onclick=e=>{if(done)return;const r2=cv.getBoundingClientRect();const mx=(e.clientX-r2.left)*(320/r2.width),my=(e.clientY-r2.top)*(200/r2.height);
    flaws.forEach((f,i)=>{if(foundSet.has(i)||Math.hypot(mx-f.x,my-f.y)>=22)return;foundSet.add(i);found++;
      g.strokeStyle='var(--red)';g.lineWidth=3;g.beginPath();g.arc(f.x,f.y,16,0,7);g.stroke();
      g.fillStyle='var(--red)';g.font='bold 14px monospace';g.textAlign='center';g.fillText('✕',f.x,f.y+5);
      sc.textContent='Found: '+found+' / '+flaws.length;if(found>=flaws.length&&!done){done=true;miniWin(n,t);}});};}

function miniCircuit(n,t){const st=openMini('CIRCUIT','Click each tile to rotate it. Make the wire run straight across to power up.');
  st.innerHTML='<div style="width:100%;text-align:center"><div class="nmRow" id="nmCirc" style="justify-content:center"></div><button id="nmPwr" class="btn" style="margin-top:14px">POWER ON</button></div>';
  const row=document.getElementById('nmCirc');const N=4,tiles=[];for(let i=0;i<N;i++){let r=Math.floor(Math.random()*4);if(r===0)r=Math.random()<0.5?1:3;
    const d=document.createElement('div');d.className='nmTile';d.dataset.r=r;row.appendChild(d);tiles.push(d);
    const draw=()=>{d.style.transform='rotate('+(d.dataset.r*90)+'deg)';d.classList.toggle('conn',(d.dataset.r%2)===0);};
    d.innerHTML='<div class="nmWireBar"></div>';draw();d.onclick=()=>{d.dataset.r=(+d.dataset.r+1)%4;draw();};}
  document.getElementById('nmPwr').onclick=()=>{const ok=tiles.every(d=>(+d.dataset.r%2)===0);if(ok){miniWin(n,t);}else fail(n,'Circuit broken somewhere. [E]');};}

// ARRANGE: drag each icon onto its matching marked spot (room/desk setup)
function miniArrange(n,t){const st=openMini('ARRANGE',t.hint||'Drag each item onto its marked spot.');
  const items=t.items||[['🪑','chair'],['📽️','proj'],['💻','laptop']];
  st.innerHTML='<div class="nmWrap"><div id="nmItems" class="nmRow"></div><div id="nmSpots" class="nmRow" style="margin-top:24px"></div></div>';
  const iRow=document.getElementById('nmItems'),sRow=document.getElementById('nmSpots');let left=items.length,done=false;
  shuffle(items.slice()).forEach(([ic,k])=>{const f=document.createElement('div');f.className='nmFile';f.textContent=ic;f.dataset.k=k;iRow.appendChild(f);
    f.onpointerdown=e=>{e.preventDefault();f.setPointerCapture(e.pointerId);const r=st.getBoundingClientRect();
      f.style.position='absolute';f.style.zIndex=9;const mv=ev=>{f.style.left=(ev.clientX-r.left-27)+'px';f.style.top=(ev.clientY-r.top-27)+'px';};
      const up=ev=>{f.removeEventListener('pointermove',mv);f.removeEventListener('pointerup',up);
        f.style.visibility='hidden';const tgt=document.elementFromPoint(ev.clientX,ev.clientY);f.style.visibility='';
        const spot=tgt&&tgt.closest?tgt.closest('.nmFolder'):null;
        if(spot&&spot.dataset.k===f.dataset.k){f.remove();spot.classList.add('lit');left--;if(left===0&&!done){done=true;setTimeout(()=>{miniWin(n,t);},250);}}
        else{f.style.position='';f.style.left='';f.style.top='';f.style.zIndex='';}};
      f.addEventListener('pointermove',mv);f.addEventListener('pointerup',up);};});
  shuffle(items.slice()).forEach(([ic,k])=>{const d=document.createElement('div');d.className='nmFolder';d.dataset.k=k;d.textContent='▢';sRow.appendChild(d);});}

// CHECKLIST: tap every item once before the timer runs out
function miniChecklist(n,t){const st=openMini('CHECKLIST',t.hint||'Tap every item before time runs out.',true);
  const items=t.items||['Tires','Fuel','Lights','Mirrors','Paperwork'];
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,1fr);gap:8px;width:100%;max-width:320px';
  let left=items.length,done=false;
  shuffle(items.slice()).forEach(label=>{const c=document.createElement('div');c.className='gridCell';c.style.cssText+='font-size:11px;padding:8px 12px;min-width:120px';c.textContent='☐ '+label;
    c.onclick=()=>{if(c.classList.contains('used'))return;c.classList.add('used');c.textContent='☑ '+label;left--;
      if(left===0&&!done){done=true;stopT();miniWin(n,t);}};grid.appendChild(c);});
  st.appendChild(grid);
  const stopT=countdown(9,()=>{if(!done){done=true;fail(n,'Ran out of time. [E]');}});}

// GAUGE: hold SPACE to fill, release while the DRIFTING green zone covers the needle
function miniGauge(n,t){const st=openMini('FILL IT',t.hint||'Hold SPACE to fill. Release inside the green zone — it drifts!');
  st.innerHTML='<div id="masher" style="position:relative"><div id="masherFill"></div><div id="gaugeZone" style="position:absolute;top:0;height:100%;background:rgba(90,158,75,.5);border-left:3px solid var(--green);border-right:3px solid var(--green)"></div></div>';
  const fill=document.getElementById('masherFill'),zone=document.getElementById('gaugeZone');
  let v=0,zx=30+Math.random()*20,zw=16,zdir=1,holding=false,done=false,iv,ziv;
  const drawZone=()=>{zone.style.left=zx+'%';zone.style.width=zw+'%';};drawZone();
  ziv=setInterval(()=>{if(done)return;zx+=zdir*0.7;if(zx+zw>=100){zx=100-zw;zdir=-1;}if(zx<=0){zx=0;zdir=1;}drawZone();},60);
  setKey(e=>{if(e.key===' '&&!holding&&!done){e.preventDefault();holding=true;
    iv=setInterval(()=>{v=Math.min(100,v+1.6);fill.style.width=v+'%';
      if(v>=100){clearInterval(iv);clearInterval(ziv);done=true;fail(n,'Overfilled! [E]');}},40);}});
  addEventListener('keyup',function up(e){if(e.key===' '&&holding&&!done){done=true;clearInterval(iv);clearInterval(ziv);
    removeEventListener('keyup',up);
    (v>=zx&&v<=zx+zw)?(closeMini(),finish(n,t)):fail(n,'Off by a bit — stopped at '+Math.round(v)+'%. [E]');}});}

// BARCODE: drag the scanner across the strip at a steady, correct speed
function miniBarcode(n,t){const st=openMini('SCAN',t.hint||'Drag the scanner across the barcode — steady pace, not too fast, not too slow.');
  // realistic barcode: varied-width dark bars on a label, a scan gun with a red laser line, and a live pace meter
  const bars=Array.from({length:34},()=>1+Math.floor(Math.random()*3));
  let grad='',pos=0;bars.forEach(w=>{const dark=pos;pos+=w;const light=pos;pos+=1;grad+=`#181410 ${dark*3}px ${light*3}px,#f4ecd6 ${light*3}px ${(pos)*3}px,`;});
  st.innerHTML='<div style="width:100%;max-width:340px">'+
    '<div id="bcLabel" style="position:relative;height:74px;background:#f4ecd6;border:3px solid var(--wood2);border-radius:8px;overflow:hidden;box-shadow:inset 0 0 0 2px #fff">'+
      '<div style="position:absolute;left:10px;right:10px;top:8px;height:44px;background:linear-gradient(90deg,'+grad+'#f4ecd6)"></div>'+
      '<div style="position:absolute;left:10px;bottom:5px;font:10px monospace;letter-spacing:3px;color:#2a2015">4 019283 55710</div>'+
      '<div id="bcLaser" style="position:absolute;top:0;bottom:0;width:2px;left:6px;background:#ff2d2d;box-shadow:0 0 8px 2px rgba(255,45,45,.7);opacity:0"></div>'+
      '<div id="bcGun" style="position:absolute;top:-14px;left:-10px;width:40px;height:30px;background:linear-gradient(#3a3f45,#23262b);border-radius:6px 6px 3px 3px;border:2px solid #14161a;cursor:grab;display:flex;align-items:flex-end;justify-content:center;font-size:9px;color:#9fb4c0">SCAN</div>'+
    '</div>'+
    '<div style="margin-top:10px;height:12px;border-radius:6px;background:linear-gradient(90deg,#c0392b 0 26%,#2e7d46 26% 64%,#c0392b 64% 100%);position:relative;border:2px solid var(--wood2)">'+
      '<div id="bcPace" style="position:absolute;top:-5px;width:4px;height:18px;background:#111;border-radius:2px;left:0"></div></div>'+
    '<div style="display:flex;justify-content:space-between;font:9px monospace;color:var(--wood);margin-top:2px"><span>too fast</span><span>steady</span><span>too slow</span></div>'+
  '</div>';
  const label=document.getElementById('bcLabel'),gun=document.getElementById('bcGun'),laser=document.getElementById('bcLaser'),pace=document.getElementById('bcPace');
  let done=false,startT=0,lastX=0,lastT=0;
  gun.onpointerdown=e=>{if(done)return;e.preventDefault();gun.setPointerCapture(e.pointerId);gun.style.cursor='grabbing';
    startT=Date.now();lastT=startT;const r=label.getBoundingClientRect();lastX=e.clientX;laser.style.opacity=1;
    const mv=ev=>{if(done)return;const x=Math.max(0,Math.min(r.width-30,ev.clientX-r.left-14));gun.style.left=x+'px';laser.style.left=(x+18)+'px';
      // live pace meter: map instantaneous speed to the 0-100% strip
      const now=Date.now(),dt=Math.max(1,now-lastT),dx=Math.abs(ev.clientX-lastX);const spd=dx/dt;lastX=ev.clientX;lastT=now;
      const frac=Math.max(0,Math.min(1,spd/2.2));pace.style.left=(frac*100)+'%';
      if(x>=r.width-34)finishScan();};
    const up=()=>{gun.removeEventListener('pointermove',mv);gun.removeEventListener('pointerup',up);gun.style.cursor='grab';laser.style.opacity=0;};
    gun.addEventListener('pointermove',mv);gun.addEventListener('pointerup',up);
    function finishScan(){if(done)return;done=true;gun.removeEventListener('pointermove',mv);
      const elapsed=Date.now()-startT;
      (elapsed>=500&&elapsed<=1600)?miniWin(n,t):fail(n,elapsed<500?'Too fast — blurred scan. [E]':'Too slow — timed out. [E]');}
  };}

// DIAL: drag a rotary knob to guess the secret number, higher/lower feedback, limited tries
function miniDial(n,t){const secret=10+Math.floor(Math.random()*90);let tries=6,val=50,done=false;
  const st=openMini('DIAL IT IN',t.hint||'Drag the dial. '+tries+' tries left.');
  st.innerHTML='<div id="dialWrap" style="position:relative;width:150px;height:150px;margin:8px auto"><svg viewBox="-75 -75 150 150" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><circle cx="0" cy="0" r="65" fill="none" stroke="var(--wood)" stroke-width="1.5"/>'+[0,10,20,30,40,50,60,70,80,90].map(v=>{const a=(v/99*270-135)*Math.PI/180;return`<text x="${(Math.cos(a)*52).toFixed(1)}" y="${(Math.sin(a)*52+4).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--wood)">${v}</text>`;}).join('')+'</svg>'+
    '<div id="dialFace" style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#e8dfc5,#c9bb92);border:4px solid var(--wood2);position:relative;cursor:grab">'+
    '<div id="dialPointer" style="position:absolute;left:50%;top:8%;width:6px;height:38%;background:var(--red);border-radius:3px;transform-origin:50% 130%;transform:translateX(-50%) rotate(0deg)"></div></div></div>'+
    '<div class="typed" id="dialVal">50</div><div id="dialFb" style="color:var(--accent);font-size:13px;margin:4px 0"></div>'+
    '<button class="btn" id="dialTry">Try</button>';
  const face=document.getElementById('dialFace'),ptr=document.getElementById('dialPointer'),vdisp=document.getElementById('dialVal'),fb=document.getElementById('dialFb');
  const draw=()=>{ptr.style.transform='translateX(-50%) rotate('+((val/99)*270-135)+'deg)';vdisp.textContent=val;};draw();
  face.onpointerdown=e=>{face.setPointerCapture(e.pointerId);const r=face.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    const mv=ev=>{if(done)return;let ang=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI+90;if(ang<0)ang+=360;
      let pct=(ang-45)/270;pct=Math.max(0,Math.min(1,pct));val=Math.round(pct*99);draw();};
    const up=()=>{face.removeEventListener('pointermove',mv);face.removeEventListener('pointerup',up);};
    face.addEventListener('pointermove',mv);face.addEventListener('pointerup',up);};
  document.getElementById('dialTry').onclick=()=>{if(done)return;
    if(val===secret){done=true;miniWin(n,t);return;}
    tries--;if(tries<=0){done=true;fail(n,'Out of tries. It was '+secret+'. [E]');return;}
    fb.textContent=(val<secret?'Higher! ':'Lower! ')+tries+' tries left.';};}

// SWITCHBOARD: drag the cable from the incoming jack to the correct extension
function miniSwitchboard(n,t){const callerHint=t.callerHint||'Unknown caller';const st=openMini('SWITCHBOARD',(t.hint||'Drag cable to right extension.')+'  📞 '+callerHint);
  const opts=t.opts||['Dejan (IT)','Sonja (Payroll)','Reception'];const correct=t.correctIdx??0;
  st.innerHTML='<div style="display:flex;align-items:center;justify-content:center;gap:60px;width:100%;position:relative">'+
    '<div id="swSrc" style="width:26px;height:26px;border-radius:50%;background:var(--red);border:3px solid var(--wood2)"></div>'+
    '<div id="swTargets" style="display:flex;flex-direction:column;gap:14px"></div><svg id="swSvg" style="position:absolute;inset:0;pointer-events:none;width:100%;height:100%"></svg></div>';
  const src=document.getElementById('swSrc'),tgtWrap=document.getElementById('swTargets'),svg=document.getElementById('swSvg');
  let done=false;
  opts.forEach((label,i)=>{const d=document.createElement('div');d.className='memChip';d.style.fontSize='12px';d.textContent=label;d.dataset.i=i;tgtWrap.appendChild(d);});
  src.onpointerdown=e=>{if(done)return;src.setPointerCapture(e.pointerId);const r=st.getBoundingClientRect();
    const sx=src.getBoundingClientRect().left-r.left+13,sy=src.getBoundingClientRect().top-r.top+13;
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('stroke','var(--red)');line.setAttribute('stroke-width','4');
    line.setAttribute('x1',sx);line.setAttribute('y1',sy);line.setAttribute('x2',sx);line.setAttribute('y2',sy);svg.appendChild(line);
    const mv=ev=>{const x=ev.clientX-r.left,y=ev.clientY-r.top;line.setAttribute('x2',x);line.setAttribute('y2',y);};
    const up=ev=>{src.removeEventListener('pointermove',mv);src.removeEventListener('pointerup',up);
      const tgt=document.elementFromPoint(ev.clientX,ev.clientY);const chip=tgt&&tgt.closest?tgt.closest('.memChip'):null;
      if(chip&&+chip.dataset.i===correct){done=true;line.setAttribute('stroke','var(--green)');miniWin(n,t);}
      else{fail(n,'Wrong line. [E]');}
    };src.addEventListener('pointermove',mv);src.addEventListener('pointerup',up);};}

// ROLODEX: flip through cards with Prev/Next, hit SELECT on the one matching the clue
function miniRolodex(n,t){const cards=t.cards||['08:12','08:47','09:03','09:31'];const correct=t.correctIdx??cards.length-1;
  const st=openMini('ROLODEX',t.hint||'Flip through the cards. SELECT the right one.');
  let i=0,done=false;
  st.innerHTML='<div id="rdCard" class="memChip" style="font-size:20px;padding:22px 34px;margin:10px auto"></div>'+
    '<div class="nmRow"><button class="btn ghost" id="rdPrev">&laquo; Prev</button><button class="btn ghost" id="rdNext">Next &raquo;</button></div>'+
    '<button class="btn" id="rdSel" style="margin-top:10px">This one</button>';
  const disp=document.getElementById('rdCard');const draw=()=>disp.textContent=cards[i];draw();
  document.getElementById('rdPrev').onclick=()=>{i=(i-1+cards.length)%cards.length;draw();};
  document.getElementById('rdNext').onclick=()=>{i=(i+1)%cards.length;draw();};
  document.getElementById('rdSel').onclick=()=>{if(done)return;done=true;i===correct?miniWin(n,t):fail(n,'Wrong card. [E]');};}

// RANK: drag list items into the correct vertical order
function miniRank(n,t){const items=t.items||['Urgent','Important','Normal','Low'];
  const st=openMini('RANK IT',t.hint||'Drag tiles up/down — TOP = highest priority. Then submit.');
  const list=document.createElement('div');list.style.cssText='display:flex;flex-direction:column;gap:6px;width:280px;margin:0 auto;user-select:none';
  shuffle(items.map((label,idx)=>({label,idx}))).forEach(o=>{const d=document.createElement('div');d.className='memChip';
    d.style.cssText+='cursor:grab;width:100%;box-sizing:border-box;touch-action:none;display:flex;align-items:center;gap:8px';
    d.innerHTML='<span style="color:var(--wood);font-size:16px;flex-shrink:0">⠿</span><span>'+o.label+'</span>';d.dataset.idx=o.idx;list.appendChild(d);});
  st.appendChild(list);
  const btn=document.createElement('button');btn.className='btn';btn.style.marginTop='10px';btn.textContent='Submit order';st.appendChild(btn);
  list.addEventListener('pointerdown',e=>{const chip=e.target.closest('.memChip');if(!chip)return;
    chip.setPointerCapture(e.pointerId);chip.style.opacity='.55';chip.style.cursor='grabbing';
    const mv=ev=>{const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest?.('.memChip');
      if(over&&over!==chip){const kids=[...list.children];kids.indexOf(chip)<kids.indexOf(over)?list.insertBefore(chip,over.nextSibling):list.insertBefore(chip,over);}};
    const up=()=>{chip.style.opacity='';chip.style.cursor='grab';chip.removeEventListener('pointermove',mv);chip.removeEventListener('pointerup',up);};
    chip.addEventListener('pointermove',mv);chip.addEventListener('pointerup',up);});
  btn.onclick=()=>{const cur=[...list.children].map(d=>+d.dataset.idx);cur.every((v,i)=>v===i)?miniWin(n,t):fail(n,"Order's off. [E]");};}


// CARTRIDGE: click each cartridge to cycle its color until it matches the label, then lock all in
function miniCartridge(n,t){const cols=t.cols||[['Black','#2a2a2a'],['Cyan','#3f9ecf'],['Magenta','#c94fa0']];
  const st=openMini('LOAD CARTRIDGES',t.hint||'Click each cartridge to cycle color. Match the label, then lock in.');
  const wrap=document.createElement('div');wrap.className='nmRow';
  const targets=shuffle(cols.map(c=>c[0]));
  cols.forEach((c,i)=>{const cell=document.createElement('div');cell.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px';
    const sw=document.createElement('div');sw.className='simBtn';let ci=Math.floor(Math.random()*cols.length);sw.style.background=cols[ci][1];
    const lbl=document.createElement('div');lbl.style.fontSize='11px';lbl.textContent='Needs: '+targets[i];
    sw.onclick=()=>{ci=(ci+1)%cols.length;sw.style.background=cols[ci][1];sw.dataset.name=cols[ci][0];};
    sw.dataset.name=cols[ci][0];cell.appendChild(sw);cell.appendChild(lbl);wrap.appendChild(cell);cell.dataset.need=targets[i];});
  st.appendChild(wrap);
  const btn=document.createElement('button');btn.className='btn';btn.style.marginTop='10px';btn.textContent='Lock in';st.appendChild(btn);
  btn.onclick=()=>{const cells=[...wrap.children];const ok=cells.every(c=>c.querySelector('.simBtn').dataset.name===c.dataset.need);
    ok?miniWin(n,t):fail(n,'Colors don\'t match the labels. [E]');};}

// PATCHLINE: drag cables from left to matching right items
function miniPatchline(n,t){const pairs=t.pairs||[['A','1'],['B','2'],['C','3']];
  const st=openMini('CONNECT',t.hint||'Drag a cable from each left item to its match on the right.');
  const left=shuffle(pairs.map(p=>p[0])),right=shuffle(pairs.map(p=>p[1]));
  const map={};pairs.forEach(p=>map[p[0]]=p[1]);
  const H=pairs.length*56+24;
  const wrap=document.createElement('div');wrap.style.cssText='position:relative;width:100%;max-width:320px;height:'+H+'px;margin:0 auto';
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible';
  wrap.appendChild(svg);st.appendChild(wrap);let matched=0,done=false;
  const mkChip=(text,side,idx)=>{const d=document.createElement('div');d.className='memChip';
    d.style.cssText+='position:absolute;font-size:12px;min-width:90px;text-align:center;';
    d.style.top=(idx*56+8)+'px';d.style[side==='L'?'left':'right']='4px';d.textContent=text;d.dataset.v=text;d.dataset.side=side;wrap.appendChild(d);return d;};
  const lEls={},rEls={};
  left.forEach((v,i)=>lEls[v]=mkChip(v,'L',i));right.forEach((v,i)=>rEls[v]=mkChip(v,'R',i));
  Object.entries(lEls).forEach(([lv,ch])=>{ch.style.cursor='crosshair';
    ch.onpointerdown=e=>{if(done||ch.classList.contains('used'))return;
      ch.setPointerCapture(e.pointerId);const wr=wrap.getBoundingClientRect();
      const cr2=ch.getBoundingClientRect();const x1=cr2.right-wr.left,y1=cr2.top+cr2.height/2-wr.top;
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('stroke','var(--accent)');line.setAttribute('stroke-width','3');line.setAttribute('stroke-dasharray','6 3');
      line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x1);line.setAttribute('y2',y1);svg.appendChild(line);
      const mv2=ev=>{line.setAttribute('x2',ev.clientX-wr.left);line.setAttribute('y2',ev.clientY-wr.top);};
      const up=ev=>{ch.removeEventListener('pointermove',mv2);ch.removeEventListener('pointerup',up);
        ch.style.visibility='hidden';const el=document.elementFromPoint(ev.clientX,ev.clientY);ch.style.visibility='';
        const rc=el?.closest?.('.memChip');
        if(rc&&rc.dataset.side==='R'&&!rc.classList.contains('used')&&map[lv]===rc.dataset.v){
          ch.classList.add('used');ch.style.background='var(--green)';ch.style.color='#fff';
          rc.classList.add('used');rc.style.background='var(--green)';rc.style.color='#fff';
          line.setAttribute('stroke','var(--green)');line.removeAttribute('stroke-dasharray');matched++;
          if(matched>=pairs.length&&!done){done=true;setTimeout(()=>miniWin(n,t),200);}
        }else{try{svg.removeChild(line);}catch(e2){}if(rc?.dataset.side==='R')fail(n,'Wrong match. [E]');}};
      ch.addEventListener('pointermove',mv2);ch.addEventListener('pointerup',up);};})}

function miniWordsearch(n,t){const words=t.words||['LOG','API','BUG'];const SIZE=7;
  const grid=[];for(let i=0;i<SIZE*SIZE;i++)grid.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*26)]);
  const wpos={};words.forEach((w,wi)=>{const row=wi*2;const col=Math.floor(Math.random()*(SIZE-w.length));
    w.split('').forEach((ch,i)=>{grid[row*SIZE+col+i]=ch;});wpos[w]={row,col};});
  const st=openMini('WORD SEARCH','Click each letter of each word IN ORDER: '+words.join(', '));
  const wrap=document.createElement('div');wrap.style.cssText='display:grid;grid-template-columns:repeat('+SIZE+',36px);gap:2px;margin:0 auto;width:'+(SIZE*38)+'px';
  const prog=document.createElement('div');prog.style.cssText='font-size:11px;color:var(--wood);margin:4px 0';
  let wi=0,li=0,done=false;
  const cw=()=>words[wi];const ct=()=>wpos[cw()].row*SIZE+wpos[cw()].col+li;
  const upP=()=>prog.textContent=cw()+' → letter '+(li+1)+'/'+cw().length;upP();
  grid.map((ch,i)=>{const d=document.createElement('div');d.className='gridCell';d.style.cssText+='width:36px;height:36px;font-size:13px;font-weight:bold';d.textContent=ch;d.dataset.i=i;
    d.onclick=()=>{if(done)return;if(i===ct()){d.classList.add('lit');li++;
        if(li>=cw().length){wi++;li=0;if(wi>=words.length){done=true;miniWin(n,t);return;}upP();}else upP();}
      else{d.style.background='var(--red)';d.style.color='#fff';setTimeout(()=>{if(!d.classList.contains('lit')){d.style.background='';d.style.color='';}},300);}};
    wrap.appendChild(d);});
  st.appendChild(prog);st.appendChild(wrap);}

function miniConveyor(n,t){const target=t.target||'\u{1F4C4}';const fakes=t.fakes||['\u{1F4E7}','\u{1F4CB}','\u{1F4C1}'];
  const st=openMini('CONVEYOR','Click every '+target+' before it falls off! Let others pass.',true);
  st.innerHTML='<div id="cvBelt" style="position:relative;height:80px;overflow:hidden;background:var(--paper2);border:3px solid var(--wood);border-radius:8px;width:100%"></div>'+
    '<div id="cvScore" class="typed" style="margin-top:6px">0 / 5</div>';
  const belt=document.getElementById('cvBelt'),sc=document.getElementById('cvScore');
  let caught=0,missed=0,done=false;const items=[];const all=[target,...fakes];
  const spawn=setInterval(()=>{if(done)return;const ic=all[Math.floor(Math.random()*all.length)];
    const el=document.createElement('div');el.style.cssText='position:absolute;font-size:26px;top:22px;cursor:pointer;user-select:none';
    el.textContent=ic;belt.appendChild(el);const item={el,x:belt.clientWidth+10,ic};items.push(item);
    el.onclick=()=>{if(done||item.removed)return;item.removed=true;el.remove();
      if(ic===target){caught++;sc.textContent=caught+' / 4';if(caught>=4&&!done){done=true;clearInterval(spawn);clearInterval(mover);stopT();miniWin(n,t);}}
      else{done=true;clearInterval(spawn);clearInterval(mover);stopT();fail(n,'Wrong item! [E]');}};},900);
  const mover=setInterval(()=>{if(done)return;items.forEach(it=>{if(it.removed)return;it.x-=1.8;it.el.style.left=it.x+'px';
    if(it.x<-40){it.removed=true;it.el.remove();if(it.ic===target){missed++;if(missed>=2&&!done){done=true;clearInterval(spawn);clearInterval(mover);stopT();fail(n,'Missed too many. [E]');}}}});},30);
  const stopT=countdown(14,()=>{if(!done){done=true;clearInterval(spawn);clearInterval(mover);caught>=4?miniWin(n,t):fail(n,'Time — got '+caught+'/5. [E]');}});}

// CONTRACT: scroll a doc and click every signature field
function miniContract(n,t){const fields=t.fields||['Client signature','Witness','Date confirmed','Initials'];
  const st=openMini('CONTRACT','Scroll and click every signature field.',true);
  const doc=document.createElement('div');doc.style.cssText='max-height:160px;overflow-y:auto;width:100%;background:var(--paper);border:2px solid var(--wood);border-radius:8px;padding:12px;font-size:11px;line-height:1.8';
  let found=0,done=false;
  const para=i=>'<p style="margin:6px 0;color:#777">Clause '+i+'. Lorem ipsum legal text et cetera, all parties agree.</p>';
  let html='';fields.forEach((f,i)=>{html+=para(i*3+1)+para(i*3+2)+'<div class="sig-fld" data-i="'+i+'" style="margin:10px 0;padding:8px;border:2px dashed var(--accent);border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;color:var(--accent)">\u25A2 '+f+'</div>'+para(i*3+3);});
  doc.innerHTML=html;st.appendChild(doc);
  const stopT=countdown(12,()=>{if(!done){done=true;fail(n,'Time up — '+found+'/'+fields.length+' signed. [E]');}});
  doc.querySelectorAll('.sig-fld').forEach(el=>{el.onclick=()=>{if(done||el.classList.contains('used'))return;
    el.classList.add('used');el.style.cssText='margin:10px 0;padding:8px;background:var(--green);border-radius:6px;font-size:12px;font-weight:bold;color:#fff';el.textContent='\u2713 '+fields[+el.dataset.i];
    found++;if(found>=fields.length&&!done){done=true;stopT();miniWin(n,t);}};});}

// ROTARY: spin a combination lock through 3 stages
function miniRotary(n,t){const combo=t.combo||[Math.floor(Math.random()*10)*10,Math.floor(Math.random()*10)*10,Math.floor(Math.random()*10)*10];
  let stage=0,val=0,done=false;
  const st=openMini('COMBINATION',t.hint||'Spin to each number in the combo. Press SET when you land on it.');
  st.innerHTML='<div style="font-size:36px;font-weight:bold;color:var(--accent);margin:4px 0" id="rVal">0</div>'+
    '<div id="rTarget" style="font-size:13px;color:var(--wood);margin:4px 0"></div>'+
    '<input type="range" id="rDial" min="0" max="90" step="10" value="0" style="width:80%;margin:6px 0">'+
    '<div class="nmRow"><button class="btn ghost" id="rMinus">- 10</button><button class="btn ghost" id="rPlus">+ 10</button></div>'+
    '<button class="btn" id="rSet" style="margin-top:8px">SET</button>';
  const upd=()=>{document.getElementById('rVal').textContent=val;document.getElementById('rDial').value=val;document.getElementById('rTarget').textContent='Step '+(stage+1)+'/3 — spin to: '+combo[stage];};upd();
  document.getElementById('rMinus').onclick=()=>{if(done)return;val=(val-10+100)%100;upd();};
  document.getElementById('rPlus').onclick=()=>{if(done)return;val=(val+10)%100;upd();};
  document.getElementById('rDial').oninput=e=>{if(done)return;val=+e.target.value;upd();};
  document.getElementById('rSet').onclick=()=>{if(done)return;
    if(val===combo[stage]){stage++;if(stage>=3){done=true;miniWin(n,t);}else upd();}
    else{done=true;fail(n,'Wrong — needed '+combo[stage]+', got '+val+'. [E]');}};}

// HEATMAP: click the hottest zone in a fake analytics heatmap
function miniHeatmap(n,t){const zones=t.zones||['Top CTA','Hero image','Nav bar','Footer'];const hotIdx=t.hotIdx!=null?t.hotIdx:Math.floor(Math.random()*zones.length);
  const st=openMini('HEATMAP',t.hint||'Click the zone with the highest user engagement (most clicks).');
  const wrap=document.createElement('div');wrap.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:320px';
  const vals=zones.map((_,i)=>i===hotIdx?85+Math.floor(Math.random()*15):5+Math.floor(Math.random()*55));
  zones.forEach((z,i)=>{const d=document.createElement('div');const v=vals[i];
    const r=Math.round(180+v*0.75),g=Math.round(60+v*0.5),b=30;
    d.style.cssText='padding:14px 8px;border-radius:8px;cursor:pointer;border:2px solid var(--wood);text-align:center;font-size:11px;font-weight:bold;background:rgba('+r+','+g+','+b+','+(0.2+v/100*0.7)+');color:'+(v>55?'#fff':'var(--inkbrown)');
    d.innerHTML=z+'<br><span style="font-size:9px;opacity:.7">'+v+'%</span>';
    d.onclick=()=>i===hotIdx?miniWin(n,t):fail(n,'Not the hottest zone. [E]');wrap.appendChild(d);});
  st.appendChild(wrap);}

// TRIAGE: cards arrive — sort each to URGENT / NORMAL / ARCHIVE fast
function miniTriage(n,t){const cards=t.cards||[{label:'Server is down',bucket:'urgent'},{label:'Newsletter signup',bucket:'archive'},{label:'Payment overdue',bucket:'urgent'},{label:'Team birthday',bucket:'normal'},{label:'Bug in prod',bucket:'urgent'}];
  const shuf=shuffle([...cards]);let i=0,done=false,correct=0;
  const st=openMini('TRIAGE','Sort each card: Urgent / Normal / Archive. No mistakes.',true);
  st.innerHTML='<div id="triCard" style="min-height:46px;padding:12px 16px;font-size:13px;font-weight:bold;background:var(--paper2);border:3px solid var(--wood);border-radius:8px;margin-bottom:10px;text-align:center"></div>'+
    '<div style="display:flex;gap:8px;justify-content:center">'+
    '<button class="btn" data-b="urgent" style="background:#c94f4f;font-size:11px">\uD83D\uDEA8 Urgent</button>'+
    '<button class="btn ghost" data-b="normal" style="font-size:11px">\uD83D\uDCCB Normal</button>'+
    '<button class="btn ghost" data-b="archive" style="font-size:11px">\uD83D\uDCC1 Archive</button></div>'+
    '<div id="triProg" class="typed" style="margin-top:6px;font-size:11px">0 / '+cards.length+'</div>';
  const card=document.getElementById('triCard'),prog=document.getElementById('triProg');
  const show=()=>{if(i>=shuf.length){done=true;stopT();miniWin(n,t);return;}card.textContent=shuf[i].label;};show();
  const stopT=countdown(10,()=>{if(!done){done=true;fail(n,'Time — '+correct+'/'+cards.length+'. [E]');}});
  st.querySelectorAll('[data-b]').forEach(btn=>btn.onclick=()=>{if(done)return;
    if(btn.dataset.b===shuf[i].bucket){correct++;prog.textContent=correct+' / '+cards.length;i++;show();}
    else{done=true;stopT();fail(n,'Wrong bucket for "'+shuf[i].label+'". [E]');}});}

// CIPHER: a Caesar-shifted word — pick the correct shift value
function miniCipher(n,t){
  const raw=t.raw||(t.pool||['MEETING','INVOICE','DEADLINE','CONTRACT','APPROVAL','BUDGET','DEPLOY'])[Math.floor(Math.random()*7)];
  const encoded=raw.split('').map(ch=>String.fromCharCode(((ch.charCodeAt(0)-65+1)%26)+65)).join('');
  let cur='',done=false;
  const st=openMini('CIPHER','Shift +1 applied. Type the DECODED word, press Enter.');
  const hint=document.createElement('div');hint.style.cssText='font-size:20px;font-weight:bold;letter-spacing:6px;margin:6px 0;color:var(--accent)';hint.textContent=encoded;
  const sub=document.createElement('div');sub.style.cssText='font-size:11px;color:var(--wood);margin-bottom:6px';sub.textContent='Shift each letter back by 1: B→A, C→B, D→C...';
  const inp=document.createElement('div');inp.className='typed';
  st.appendChild(hint);st.appendChild(sub);st.appendChild(inp);
  setKey(e=>{if(done)return;e.preventDefault();
    if(e.key==='Enter'){done=true;cur===raw?miniWin(n,t):fail(n,'It was "'+raw+'". [E]');}
    else if(e.key==='Backspace'){cur=cur.slice(0,-1);inp.textContent=cur;}
    else if(/^[a-zA-Z]$/.test(e.key)){cur+=e.key.toUpperCase();inp.textContent=cur;if(cur.length>raw.length){done=true;fail(n,'Too long. [E]');}}});}

function miniVoltage(n,t){const st=openMini('VOLTAGE','Keep ALL 3 rails in green. A=rail 1, S=rail 2, D=rail 3. Hold 5s.',true);
  const rails=[{key:'A',v:50},{key:'S',v:50},{key:'D',v:50}];let greenTime=0,done=false;
  st.innerHTML='<div id="voltWrap" style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px"></div>'+
    '<div id="voltMsg" style="font-size:11px;margin-top:6px;color:var(--wood)">Keep all in green for 5 seconds</div>';
  const wrap=document.getElementById('voltWrap'),msg=document.getElementById('voltMsg');
  const bars=rails.map(r=>{const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px';
    const lbl=document.createElement('span');lbl.style.cssText='width:18px;font-weight:bold;font-size:13px';lbl.textContent=r.key;
    const track=document.createElement('div');track.style.cssText='flex:1;height:20px;background:#ddd;border-radius:10px;overflow:hidden;border:2px solid var(--wood)';
    const fill=document.createElement('div');fill.style.cssText='height:100%;width:50%;background:var(--accent);border-radius:10px';
    track.appendChild(fill);row.appendChild(lbl);row.appendChild(track);wrap.appendChild(row);return fill;});
  setKey(e=>{if(done)return;e.preventDefault();const r=rails.find(r=>r.key===e.key.toUpperCase());if(r)r.v=Math.min(100,r.v+14);});
  const stopT=countdown(14,()=>{if(!done){done=true;fail(n,'Time up. [E]');}});
  const iv=setInterval(()=>{if(done)return;rails.forEach((r,i)=>{r.v=Math.max(0,r.v-1.2);bars[i].style.width=r.v+'%';bars[i].style.background=r.v>=30&&r.v<=80?'var(--green)':'var(--red)';});
    const allGreen=rails.every(r=>r.v>=30&&r.v<=80);
    if(allGreen){greenTime+=50;msg.textContent='Hold! '+(5-greenTime/1000).toFixed(1)+'s to go';if(greenTime>=5000){done=true;clearInterval(iv);stopT();miniWin(n,t);}}
    else{greenTime=Math.max(0,greenTime-100);msg.textContent='Keep all in green for 5 seconds';}},50);}


// TOGGLE: flip a set of switches to match a target pattern
function miniToggle(n,t){const size=t.size||6;const target=Array.from({length:size},()=>Math.random()>.5);
  let state=Array.from({length:size},()=>Math.random()>.5);let done=false;
  const st=openMini('SWITCHES',t.hint||'Flip switches to match the TARGET pattern above. Then confirm.');
  const mkRow=(arr,label,clickable)=>{const wrap=document.createElement('div');wrap.style.cssText='display:flex;align-items:center;gap:6px;margin:6px 0';
    const lbl=document.createElement('span');lbl.style.cssText='width:52px;font-size:10px;color:var(--wood)';lbl.textContent=label;wrap.appendChild(lbl);
    arr.forEach((v,i)=>{const sw=document.createElement('div');sw.style.cssText='width:36px;height:20px;border-radius:10px;border:2px solid var(--wood2);cursor:'+(clickable?'pointer':'default')+';position:relative;transition:.15s;background:'+(v?'var(--green)':'#bbb');
      const knob=document.createElement('div');knob.style.cssText='position:absolute;top:1px;width:14px;height:14px;border-radius:50%;background:#fff;transition:.15s;left:'+(v?'18px':'1px');
      sw.appendChild(knob);sw.dataset.i=i;
      if(clickable)sw.onclick=()=>{if(done)return;state[i]=!state[i];sw.style.background=state[i]?'var(--green)':'#bbb';knob.style.left=state[i]?'18px':'1px';};
      wrap.appendChild(sw);});
    return wrap;};
  st.appendChild(mkRow(target,'TARGET',false));
  const stateWrap=mkRow(state,'YOURS',true);st.appendChild(stateWrap);
  const btn=document.createElement('button');btn.className='btn';btn.style.marginTop='10px';btn.textContent='Confirm';st.appendChild(btn);
  btn.onclick=()=>{if(done)return;done=true;
    state.every((v,i)=>v===target[i])?miniWin(n,t):fail(n,'Pattern mismatch. [E]');};}

// ANAGRAM: unscramble a word by clicking letters in order
function miniAnagram(n,t){const word=t.word||['REPORT','BUDGET','CLIENT','DEPLOY','SERVER'][Math.floor(Math.random()*5)];
  const scrambled=shuffle(word.split(''));let built='',done=false;
  const st=openMini('UNSCRAMBLE','Click letters in the right order to spell the word. '+word.length+' letters.');
  const pool=document.createElement('div');pool.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px 0';
  const display=document.createElement('div');display.style.cssText='font-size:20px;font-weight:bold;letter-spacing:8px;min-height:30px;color:var(--accent);margin:6px 0';display.textContent='_'.repeat(word.length).split('').join(' ');
  scrambled.forEach(ch=>{const b=document.createElement('div');b.className='memChip';b.style.cssText+='font-size:16px;font-weight:bold;width:36px;text-align:center';b.textContent=ch;
    b.onclick=()=>{if(done||b.classList.contains('used'))return;
      if(ch===word[built.length]){b.classList.add('used');built+=ch;display.textContent=built.split('').join(' ')+'_'.repeat(word.length-built.length).split('').join(' ');
        if(built===word){done=true;miniWin(n,t);}}
      else{done=true;fail(n,'Wrong letter — needed "'+word[built.length]+'". [E]');}};
    pool.appendChild(b);});
  st.appendChild(display);st.appendChild(pool);}

// WHITEBOARD: draw a line connecting numbered dots in order (freehand trace)
function miniWhiteboard(n,t){const pts=t.pts||[[30,40],[140,20],[220,90],[160,140],[80,120]];
  const st=openMini('CONNECT THE DOTS','Draw a line through the numbered dots, in order, without lifting.');
  const canvas=document.createElement('canvas');canvas.width=260;canvas.height=170;canvas.style.cssText='border:3px solid var(--wood);border-radius:8px;background:#f8f5ed;cursor:crosshair;touch-action:none';
  const g=canvas.getContext('2d');let drawing=false,nextPt=0,done=false,path=[];
  const draw=()=>{g.clearRect(0,0,260,170);
    pts.forEach((p,i)=>{g.beginPath();g.arc(p[0],p[1],12,0,7);g.fillStyle=i<nextPt?'var(--green)':i===nextPt?'var(--accent)':'#ccc';g.fill();g.strokeStyle='var(--wood)';g.lineWidth=2;g.stroke();
      g.fillStyle='#fff';g.font='bold 11px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(i+1,p[0],p[1]);});
    if(path.length>1){g.beginPath();g.moveTo(path[0][0],path[0][1]);path.forEach(p=>g.lineTo(p[0],p[1]));g.strokeStyle='var(--accent)';g.lineWidth=3;g.stroke();}};draw();
  const hit=(x,y,p,r)=>Math.hypot(x-p[0],y-p[1])<r;
  const go=(x,y)=>{if(done)return;path.push([x,y]);
    if(nextPt<pts.length&&hit(x,y,pts[nextPt],20)){nextPt++;if(nextPt>=pts.length){done=true;draw();miniWin(n,t);}};draw();};
  canvas.addEventListener('pointerdown',e=>{drawing=true;const r=canvas.getBoundingClientRect();go(e.clientX-r.left,e.clientY-r.top);});
  canvas.addEventListener('pointermove',e=>{if(!drawing)return;const r=canvas.getBoundingClientRect();go(e.clientX-r.left,e.clientY-r.top);});
  canvas.addEventListener('pointerup',()=>{drawing=false;});
  st.appendChild(canvas);}

// SLOT: pull the handle, stop each reel on the correct symbol
function miniSlot(n,t){const symbols=['💰','📊','✅','⭐','💼'];const target=t.target||[0,0,0];
  const st=openMini('SLOT MACHINE',t.hint||'Click each reel to stop it on the right symbol. Match all three!');
  let spins=[0,1,2],stopped=[false,false,false],done=false;const ivs=[];
  st.innerHTML='<div style="display:flex;gap:12px;justify-content:center;margin:10px 0" id="reels"></div>'+
    '<div style="font-size:11px;color:var(--wood);margin:4px 0">Target: '+target.map(i=>symbols[i]).join(' ')+'</div>'+
    '<button class="btn ghost" id="slotBtn" style="margin-top:8px">Pull!</button>';
  const reelWrap=document.getElementById('reels');
  const reelEls=target.map((tgt,i)=>{const d=document.createElement('div');d.style.cssText='width:60px;height:60px;border:3px solid var(--wood2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;background:var(--paper2);cursor:pointer';
    d.textContent=symbols[spins[i]];reelWrap.appendChild(d);
    d.onclick=()=>{if(stopped[i]||!ivs[i]||done)return;clearInterval(ivs[i]);ivs[i]=null;stopped[i]=true;
      d.textContent=symbols[spins[i]];d.style.border='3px solid '+(spins[i]===tgt?'var(--green)':'var(--red)');
      if(stopped.every(Boolean)){done=true;stopped.every((_,j)=>spins[j]===target[j])?miniWin(n,t):fail(n,'Wrong symbols. [E]');}};
    return d;});
  document.getElementById('slotBtn').onclick=()=>{if(done)return;document.getElementById('slotBtn').disabled=true;
    target.forEach((tgt,i)=>{ivs[i]=setInterval(()=>{spins[i]=(spins[i]+1)%symbols.length;reelEls[i].textContent=symbols[spins[i]];},160+i*60);});
    setTimeout(()=>{if(!stopped[0])reelEls[0].click();},2000+Math.random()*1000);};}

// MIRROR: type input appears reversed — still type the normal word but read the mirror
function miniMirror(n,t){const word=t.word||['UPLOAD','SERVER','SPRINT','REVIEW','LAUNCH'][Math.floor(Math.random()*5)];
  const reversed=word.split('').reverse().join('');let cur='',done=false;
  const st=openMini('MIRROR MODE','Screen is flipped — type the word BACKWARDS. (e.g. DOG → G-O-D)');
  const tgt=document.createElement('div');tgt.style.cssText='font-size:18px;font-weight:bold;letter-spacing:6px;transform:scaleX(-1);display:inline-block;color:var(--wood);margin:6px 0';tgt.textContent=word;
  const disp=document.createElement('div');disp.style.cssText='font-size:24px;font-weight:bold;letter-spacing:6px;color:var(--accent);min-height:30px;margin:6px 0';
  const hint=document.createElement('div');hint.style.cssText='font-size:11px;color:var(--wood);margin-bottom:4px';hint.textContent='Type it backwards: e.g. DOG → G-O-D';
  st.appendChild(hint);st.appendChild(tgt);st.appendChild(disp);
  setKey(e=>{if(done)return;e.preventDefault();
    if(e.key==='Backspace'){cur=cur.slice(0,-1);disp.textContent=cur;}
    else if(/^[a-zA-Z]$/.test(e.key)){cur+=e.key.toUpperCase();disp.textContent=cur;
      if(cur===reversed){done=true;miniWin(n,t);}else if(cur.length>=word.length){done=true;fail(n,'Should be "'+reversed+'". [E]');}}});}

function miniPriceTag(n,t){const items=t.items||[{name:'Laptop stand',price:'€49'},{ name:'USB hub',price:'€29'},{name:'Monitor arm',price:'€89'}];
  const shuf=shuffle([...items]);let i=0,done=false;
  const st=openMini('PRICE IT',t.hint||'Drag the price tag to the correct product.',true);
  const render=()=>{if(i>=shuf.length){done=true;stopT();miniWin(n,t);return;}
    const cur=shuf[i];st.innerHTML='';
    const tag=document.createElement('div');tag.style.cssText='display:inline-block;padding:10px 16px;background:var(--gold);border:3px solid var(--wood2);border-radius:8px;font-size:16px;font-weight:bold;cursor:grab;margin:10px';tag.textContent=cur.price;
    const opts=shuffle(items.map(x=>x.name));const row=document.createElement('div');row.style.cssText='display:flex;flex-direction:column;gap:8px;width:100%;max-width:260px';
    opts.forEach(name=>{const slot=document.createElement('div');slot.className='memChip';slot.style.cssText+='width:100%;text-align:center;font-size:12px';slot.textContent=name;
      slot.addEventListener('dragover',e=>e.preventDefault());slot.addEventListener('drop',e=>{e.preventDefault();if(done)return;name===cur.name?(i++,render()):fail(n,'Wrong product! [E]',done=true);});row.appendChild(slot);});
    tag.draggable=true;tag.ondragstart=e=>e.dataTransfer.setData('text','tag');
    const hint=document.createElement('div');hint.style.cssText='font-size:11px;color:var(--wood);margin:4px';hint.textContent=(i+1)+'/'+shuf.length+' — drag tag to product';
    st.appendChild(hint);st.appendChild(tag);st.appendChild(row);};
  const stopT=countdown(10,()=>{if(!done){done=true;fail(n,'Time up. [E]');}});render();}

// BINARY: click which bulbs are ON to match a binary number shown in decimal
function miniBinary(n,t){const val=t.val||(1+Math.floor(Math.random()*15));const bits=4;
  let state=Array(bits).fill(false);let done=false;
  const st=openMini('BINARY','Set the light bulbs to represent '+val+' in binary. Left = highest bit. Then confirm.');
  const row=document.createElement('div');row.style.cssText='display:flex;gap:10px;justify-content:center;margin:10px 0';
  const labels=document.createElement('div');labels.style.cssText='display:flex;gap:10px;justify-content:center;font-size:10px;color:var(--wood)';
  state.forEach((_,i)=>{const pw=Math.pow(2,bits-1-i);
    const b=document.createElement('div');b.style.cssText='width:50px;height:50px;border-radius:50%;border:3px solid var(--wood2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:22px;background:#ddd;transition:.1s';b.textContent='💡';
    b.onclick=()=>{if(done)return;state[i]=!state[i];b.style.background=state[i]?'var(--gold)':'#ddd';b.style.boxShadow=state[i]?'0 0 14px var(--gold)':'none';};row.appendChild(b);
    const lbl=document.createElement('span');lbl.style.width='50px';lbl.style.fontSize='14px';lbl.style.fontWeight='bold';lbl.style.textAlign='center';lbl.style.textAlign='center';lbl.textContent=pw;labels.appendChild(lbl);});
  const target=document.createElement('div');target.style.cssText='font-size:14px;margin:4px 0;font-weight:bold';target.textContent='Decimal: '+val;
  st.appendChild(target);st.appendChild(row);st.appendChild(labels);
  const btn=document.createElement('button');btn.className='btn';btn.style.marginTop='10px';btn.textContent='Lock in';st.appendChild(btn);
  btn.onclick=()=>{if(done)return;done=true;
    const got=state.reduce((acc,v,i)=>acc+(v?Math.pow(2,bits-1-i):0),0);
    got===val?miniWin(n,t):fail(n,'Got '+got+', needed '+val+'. [E]');};}

// VOICEMAIL: listen to a growing sequence of words (shown briefly), then type the last one
function miniVoicemail(n,t){const pool=t.pool||['alpha','bravo','delta','echo','foxtrot','kilo','lima','oscar'];
  const seq=shuffle([...pool]).slice(0,4);let done=false;
  const st=openMini('VOICEMAIL','Watch the sequence. Type the LAST word you saw. Then Enter.');
  const disp=document.createElement('div');disp.style.cssText='font-size:22px;font-weight:bold;min-height:34px;color:var(--accent);margin:10px 0;letter-spacing:3px';
  const inp=document.createElement('div');inp.className='typed';let cur='';
  st.appendChild(disp);st.appendChild(inp);
  let si=0;const flash=()=>{if(si>=seq.length){disp.textContent='?';disp.style.color='var(--wood)';
    setKey(e=>{if(done)return;e.preventDefault();
      if(e.key==='Enter'){const guess=cur.toLowerCase().trim();cur='';inp.textContent='';
        guess===seq[seq.length-1]?(done=true,miniWin(n,t)):fail(n,'It was "'+seq[seq.length-1]+'". [E]',done=true);}
      else if(e.key==='Backspace'){cur=cur.slice(0,-1);inp.textContent=cur;}
      else if(/^[a-zA-Z]$/.test(e.key)){cur+=e.key.toUpperCase();inp.textContent=cur;}});return;}
    disp.textContent=seq[si].toUpperCase();setTimeout(()=>{disp.textContent='';setTimeout(()=>{si++;flash();},300);},900);};
  setTimeout(flash,400);}

// APPROVAL_CHAIN: click approvers in the correct hierarchy order
function miniApprovalChain(n,t){const chain=t.chain||['Team Lead','Manager','Director','CFO'];const shuf=shuffle([...chain]);let step=0,done=false;
  const st=openMini('APPROVAL CHAIN',t.hint||'Click approvers in the CORRECT hierarchy order, top to bottom.');
  const grid=document.createElement('div');grid.style.cssText='display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px';
  const hint=document.createElement('div');hint.style.cssText='font-size:11px;color:var(--wood);margin:4px 0';hint.textContent='Step 1/'+chain.length+': who signs first?';st.appendChild(hint);
  const chips={};shuf.forEach(name=>{const d=document.createElement('div');d.className='memChip';d.style.cssText+='width:100%;text-align:center;font-size:12px';d.textContent=name;
    d.onclick=()=>{if(done||d.classList.contains('used'))return;
      if(name===chain[step]){d.classList.add('used');d.style.background='var(--green)';d.style.color='#fff';step++;
        hint.textContent=step<chain.length?'Step '+(step+1)+'/'+chain.length+': next?':'Done!';
        if(step>=chain.length){done=true;miniWin(n,t);}}
      else{done=true;fail(n,'"'+name+'" is not step '+(step+1)+'. [E]');}};
    chips[name]=d;grid.appendChild(d);});
  st.appendChild(grid);}

// FREQUENCY: click radio frequency buttons to tune to the exact target frequency
function miniFrequency(n,t){const target=t.target||(88+Math.floor(Math.random()*20));let freq=88,done=false;
  const st=openMini('TUNE IN',t.hint||'Tune the radio to exactly '+target+'.0 MHz. Use + and − buttons.');
  st.innerHTML='<div style="font-size:32px;font-weight:bold;color:var(--accent);margin:8px 0;font-family:monospace" id="fDisp">88.0 MHz</div>'+
    '<div style="font-size:13px;color:var(--wood);margin-bottom:10px">Target: <b>'+target+'.0 MHz</b></div>'+
    '<div class="nmRow" style="gap:6px">'+
    '<button class="btn ghost" id="fMm">−5</button><button class="btn ghost" id="fM">−1</button>'+
    '<button class="btn ghost" id="fP">+1</button><button class="btn ghost" id="fPp">+5</button></div>'+
    '<button class="btn" id="fTune" style="margin-top:10px">Tune In</button>';
  const disp=document.getElementById('fDisp');
  const upd=()=>{disp.textContent=freq+'.0 MHz';disp.style.color=freq===target?'var(--green)':'var(--accent)';};
  document.getElementById('fMm').onclick=()=>{if(done)return;freq=Math.max(88,freq-5);upd();};
  document.getElementById('fM').onclick=()=>{if(done)return;freq=Math.max(88,freq-1);upd();};
  document.getElementById('fP').onclick=()=>{if(done)return;freq=Math.min(108,freq+1);upd();};
  document.getElementById('fPp').onclick=()=>{if(done)return;freq=Math.min(108,freq+5);upd();};
  document.getElementById('fTune').onclick=()=>{if(done)return;done=true;freq===target?miniWin(n,t):fail(n,'Tuned to '+freq+' not '+target+'. [E]');};}

/* HANDOVER — click the car-handover steps in the correct order. Wrong step = reset that pick.
   Task may override the ordered steps via t.steps:['Step1','Step2',...] (correct sequence). */
function miniHandover(n,t){
  const correct=t.steps||['Greet the client','Verify their ID & paperwork','Walk them around the car','Explain the key features','Hand over the keys','Wave them off'];
  const st=openMini('HANDOVER',t.hint||'Do the handover IN ORDER. Click each step at the right time.');
  st.innerHTML='<div style="width:100%;max-width:340px">'+
    '<div id="hoProg" style="display:flex;gap:4px;margin-bottom:10px">'+correct.map(()=>'<div style="flex:1;height:6px;border-radius:3px;background:#d9bd8a"></div>').join('')+'</div>'+
    '<div id="hoBtns" style="display:flex;flex-direction:column;gap:6px"></div>'+
    '<div id="hoMsg" style="text-align:center;font:11px monospace;color:var(--wood);margin-top:8px;min-height:14px"></div></div>';
  const btns=document.getElementById('hoBtns'),prog=document.getElementById('hoProg').children,msg=document.getElementById('hoMsg');
  let step=0,done=false;
  shuffle(correct).forEach(label=>{const b=document.createElement('button');b.className='btn ghost';b.style.textAlign='left';b.textContent=label;btns.appendChild(b);
    b.onclick=()=>{if(done)return;
      if(label===correct[step]){b.disabled=true;b.style.opacity=.4;b.classList.add('done');prog[step].style.background='var(--green)';step++;msg.textContent='';
        if(step>=correct.length){done=true;miniWin(n,t);}}
      else{msg.textContent='Not yet — do the earlier steps first.';b.classList.add('shake');setTimeout(()=>b.classList.remove('shake'),300);}};});}

/* ── NEW MECHANICS BATCH ── */

// STAMP — stamp papers in correct order
function miniStamp(n,t){
  const docs=t.docs||['Invoice','Receipt','Form A','Form B','Memo'];
  const correct=shuffle([...docs]);const shuf=shuffle([...correct]);
  let step=0,done=false;
  const st=openMini('STAMP','Stamp papers in the correct order: '+correct.join(' → '),true);
  const stop=countdown(12,()=>{if(!done)fail(n,'Too slow! [E]');});
  st.innerHTML='<div style="text-align:center;margin-top:8px"><div id="stampOrder" style="color:#c9a86b;margin-bottom:8px;font-size:11px">Order: '+correct.join(' → ')+'</div><div id="stampBtns" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div><div id="stampMsg" style="margin-top:8px;color:#e86b4a"></div></div>';
  shuf.forEach(d=>{const b=document.createElement('button');b.textContent='📄 '+d;b.className='miniBtn';
    b.onclick=()=>{if(done)return;
      if(d===correct[step]){b.disabled=true;b.style.opacity=.3;step++;
        if(step>=correct.length){done=true;stop();miniWin(n,t);}}
      else{document.getElementById('stampMsg').textContent='Wrong! Need: '+correct[step];}};
    document.getElementById('stampBtns').appendChild(b);});}

// ELEVATOR — stop at the right floor
function miniElevator(n,t){
  const target=t.floor||(1+Math.floor(Math.random()*9));let pos=0,speed=0.06,done=false;
  const st=openMini('ELEVATOR','Stop the elevator at floor '+target+'!');
  st.innerHTML='<div style="display:flex;align-items:center;justify-content:center;gap:20px;height:180px"><div id="elvShaft" style="width:50px;height:170px;background:#1a2a1a;border:2px solid #3a5a3a;border-radius:4px;position:relative"><div id="elvCar" style="position:absolute;bottom:0;width:46px;height:18px;background:#c9a86b;border-radius:2px;left:2px;transition:none"></div></div><div><div id="elvFloor" style="font-size:28px;color:#c9a86b;font-family:monospace">1</div><button id="elvStop" class="miniBtn" style="margin-top:12px">⏹ STOP</button></div></div>';
  const car=document.getElementById('elvCar');const floorEl=document.getElementById('elvFloor');
  let dir=1,raf;
  const anim=()=>{if(done)return;pos+=speed*dir;if(pos>1){pos=1;dir=-1;}if(pos<0){pos=0;dir=1;}
    const floor=Math.round(pos*9)+1;floorEl.textContent=floor;
    car.style.bottom=(pos*150)+'px';raf=requestAnimationFrame(anim);};
  raf=requestAnimationFrame(anim);
  document.getElementById('elvStop').onclick=()=>{if(done)return;done=true;cancelAnimationFrame(raf);
    const floor=Math.round(pos*9)+1;
    if(floor===target)miniWin(n,t);else fail(n,'Stopped at floor '+floor+', needed '+target+'. [E]');};}

// COPIER — click when the light is green
function miniCopier(n,t){
  const rounds=t.rounds||4;let round=0,done=false,lit=false,waiting=true;
  const st=openMini('COPIER','Hit COPY when the light turns green! ('+rounds+' copies)',true);
  const stop=countdown(15,()=>{if(!done)fail(n,'Out of time! [E]');});
  st.innerHTML='<div style="text-align:center;margin-top:12px"><div id="copLight" style="width:60px;height:60px;border-radius:50%;background:#5a2a2a;margin:0 auto;border:3px solid #3a3a3a;transition:.1s"></div><div style="margin-top:8px;color:#c9a86b" id="copCount">0/'+rounds+'</div><button id="copBtn" class="miniBtn" style="margin-top:10px">📋 COPY</button></div>';
  const light=document.getElementById('copLight');
  const flash=()=>{if(done)return;lit=false;light.style.background='#5a2a2a';
    setTimeout(()=>{if(done)return;lit=true;light.style.background='#4adf30';
      setTimeout(()=>{if(done||!lit)return;lit=false;light.style.background='#5a2a2a';flash();},800+Math.random()*600);
    },500+Math.random()*1500);};
  flash();
  document.getElementById('copBtn').onclick=()=>{if(done)return;
    if(lit){round++;lit=false;light.style.background='#2a5a2a';document.getElementById('copCount').textContent=round+'/'+rounds;
      if(round>=rounds){done=true;stop();miniWin(n,t);}else flash();}
    else{done=true;stop();fail(n,'Too early! Wait for the green light. [E]');}};}

// PASSWORD — type the scrambled password
function miniPassword(n,t){
  const words=['OFFICE','ADMIN','LOGIN','SECURE','ACCESS','SYSTEM','SERVER'];
  const pw=t.pw||rnd(words);const scrambled=shuffle(pw.split('')).join('');
  let done=false;
  const st=openMini('PASSWORD','Unscramble and type the password: '+scrambled,true);
  const stop=countdown(10,()=>{if(!done)fail(n,'Locked out! [E]');});
  st.innerHTML='<div style="text-align:center;margin-top:12px"><div style="font-size:24px;letter-spacing:4px;color:#e8a03c;font-family:monospace;margin-bottom:12px">'+scrambled+'</div><input id="pwInput" type="text" style="background:#1a2a1a;border:2px solid #3a5a3a;color:#c9a86b;padding:8px 12px;font-size:16px;font-family:monospace;text-align:center;border-radius:4px;text-transform:uppercase" autofocus><div id="pwMsg" style="margin-top:8px;color:#e86b4a;font-size:11px"></div></div>';
  const inp=document.getElementById('pwInput');setTimeout(()=>inp.focus(),50);
  inp.addEventListener('input',()=>{if(done)return;
    if(inp.value.toUpperCase()===pw){done=true;stop();miniWin(n,t);}
    else if(inp.value.length>=pw.length){document.getElementById('pwMsg').textContent='Wrong! Try again.';inp.value='';}});}

// FILING — drag files into correct cabinet labels
function miniFiling(n,t){
  const files=t.files||[{name:'Tax Return',cab:'Finance'},{name:'Resume',cab:'HR'},{name:'Blueprint',cab:'Engineering'},{name:'Invoice',cab:'Finance'}];
  const shuf=shuffle([...files]);const cabs=[...new Set(files.map(f=>f.cab))];
  let placed=0,done=false;
  const st=openMini('FILING','Click a file, then click the right cabinet.',true);
  const stop=countdown(15,()=>{if(!done)fail(n,'Time\'s up! [E]');});
  let sel=null;
  let html='<div style="margin-top:6px"><div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-bottom:10px">';
  shuf.forEach((f,i)=>{html+='<button class="miniBtn fileBtn" data-idx="'+i+'" data-cab="'+f.cab+'">📁 '+f.name+'</button>';});
  html+='</div><div style="display:flex;gap:8px;justify-content:center">';
  cabs.forEach(c=>{html+='<div class="miniBtn cabBtn" data-cab="'+c+'" style="padding:10px 14px;cursor:pointer;border:2px solid #3a5a3a">🗄️ '+c+'</div>';});
  html+='</div><div id="fileMsg" style="margin-top:8px;color:#c9a86b;text-align:center;font-size:11px"></div></div>';
  st.innerHTML=html;
  st.querySelectorAll('.fileBtn').forEach(b=>{b.onclick=()=>{if(done||b.disabled)return;
    st.querySelectorAll('.fileBtn').forEach(x=>x.style.borderColor='');
    sel=b;b.style.borderColor='#e8a03c';};});
  st.querySelectorAll('.cabBtn').forEach(b=>{b.onclick=()=>{if(done||!sel)return;
    if(sel.dataset.cab===b.dataset.cab){sel.disabled=true;sel.style.opacity=.3;placed++;sel=null;
      if(placed>=shuf.length){done=true;stop();miniWin(n,t);}}
    else{document.getElementById('fileMsg').textContent='Wrong cabinet!';sel.classList.add('shake');setTimeout(()=>sel.classList.remove('shake'),300);}};});}

// PHONETREE — navigate options to reach the right dept
function miniPhoneTree(n,t){
  const tree=t.tree||{q:'Main menu',opts:[
    {l:'Sales',sub:{q:'Sales dept',opts:[{l:'Domestic',win:false},{l:'International',win:true}]}},
    {l:'Support',sub:{q:'Support dept',opts:[{l:'Billing',win:false},{l:'Technical',win:false}]}},
    {l:'HR',sub:{q:'HR dept',opts:[{l:'Hiring',win:false},{l:'Benefits',win:false}]}}]};
  const target=t.target||'International';
  let done=false;
  const st=openMini('PHONE TREE','Navigate to: '+target,true);
  const stop=countdown(12,()=>{if(!done)fail(n,'Call dropped! [E]');});
  const render=(node)=>{
    let html='<div style="text-align:center;margin-top:8px"><div style="color:#c9a86b;margin-bottom:10px;font-size:13px">📞 '+node.q+'</div>';
    node.opts.forEach((o,i)=>{html+='<button class="miniBtn ptBtn" data-idx="'+i+'" style="display:block;margin:5px auto;min-width:160px">Press '+(i+1)+': '+o.l+'</button>';});
    html+='</div>';st.innerHTML=html;
    st.querySelectorAll('.ptBtn').forEach(b=>{b.onclick=()=>{if(done)return;
      const opt=node.opts[parseInt(b.dataset.idx)];
      if(opt.win){done=true;stop();miniWin(n,t);}
      else if(opt.sub)render(opt.sub);
      else{done=true;stop();fail(n,'Wrong department! [E]');}};});};
  render(tree);}

// WATERPLANT — fill the gauge to the green zone, don't overflow
function miniWaterPlant(n,t){
  const target=t.target||65;const tolerance=t.tol||10;let level=0,done=false,filling=false;
  const st=openMini('WATER PLANT','Fill to the green zone ('+Math.max(0,target-tolerance)+'–'+(target+tolerance)+'%)');
  st.innerHTML='<div style="text-align:center;margin-top:10px"><div style="width:40px;height:160px;background:#1a2a1a;border:2px solid #3a5a3a;margin:0 auto;position:relative;border-radius:4px"><div id="wpFill" style="position:absolute;bottom:0;width:100%;background:#4a8ae0;border-radius:0 0 2px 2px;transition:height .05s"></div><div id="wpZone" style="position:absolute;width:100%;background:rgba(80,200,80,.25);border-top:2px solid #4adf30;border-bottom:2px solid #4adf30;left:0"></div></div><div id="wpPct" style="color:#c9a86b;margin-top:6px;font-family:monospace">0%</div><button id="wpBtn" class="miniBtn" style="margin-top:8px">🚿 Hold to water</button><button id="wpDone" class="miniBtn" style="margin-top:4px">✓ Done</button></div>';
  const zone=document.getElementById('wpZone');
  zone.style.bottom=(Math.max(0,target-tolerance)/100*156)+'px';zone.style.height=((tolerance*2)/100*156)+'px';
  const fill=document.getElementById('wpFill');const pct=document.getElementById('wpPct');
  let raf;const upd=()=>{if(done)return;if(filling){level=Math.min(100,level+0.8);}
    fill.style.height=(level/100*156)+'px';pct.textContent=Math.round(level)+'%';
    if(level>=100){done=true;fail(n,'Overflowed! [E]');return;}raf=requestAnimationFrame(upd);};
  raf=requestAnimationFrame(upd);
  const btn=document.getElementById('wpBtn');
  btn.onmousedown=btn.ontouchstart=()=>{filling=true;};
  btn.onmouseup=btn.ontouchend=btn.onmouseleave=()=>{filling=false;};
  document.getElementById('wpDone').onclick=()=>{if(done)return;done=true;cancelAnimationFrame(raf);
    if(Math.abs(level-target)<=tolerance)miniWin(n,t);
    else fail(n,'Level at '+Math.round(level)+'% — needed '+Math.max(0,target-tolerance)+'–'+(target+tolerance)+'%. [E]');};}

// SHREDDER — feed all docs before time, but don't shred the important one
function miniShredder(n,t){
  const docs=t.docs||['Old memo','Draft v1','Draft v2','Tax receipt','Junk mail'];
  const keep=t.keep||'Tax receipt';const shuf=shuffle([...docs]);let done=false,shredded=0,total=docs.length-1;
  const st=openMini('SHREDDER','Shred everything EXCEPT: '+keep,true);
  const stop=countdown(10,()=>{if(!done)fail(n,'Too slow! [E]');});
  let html='<div style="text-align:center;margin-top:8px"><div id="shrMsg" style="color:#c9a86b;margin-bottom:8px;font-size:11px">Keep: '+keep+'</div><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">';
  shuf.forEach((d,i)=>{html+='<button class="miniBtn shrBtn" data-doc="'+d+'" data-idx="'+i+'">📄 '+d+'</button>';});
  html+='</div></div>';st.innerHTML=html;
  st.querySelectorAll('.shrBtn').forEach(b=>{b.onclick=()=>{if(done)return;
    if(b.dataset.doc===keep){done=true;stop();fail(n,'You shredded the important document! [E]');}
    else{b.disabled=true;b.style.opacity=.3;b.textContent='🗑️';shredded++;
      if(shredded>=total){done=true;stop();miniWin(n,t);}}};});}

// STAPLER — click the stapler at the right rhythm (3 beats)
function miniStapler(n,t){
  const beats=t.beats||4;const bpm=t.bpm||120;const interval=60000/bpm;
  let step=0,done=false,lastBeat=0,started=false;
  const st=openMini('STAPLER','Staple to the rhythm! Click every beat. ('+beats+' staples)');
  st.innerHTML='<div style="text-align:center;margin-top:16px"><div id="stpBeat" style="width:80px;height:80px;background:#3a3a3a;border:3px solid #5a5a5a;border-radius:50%;margin:0 auto;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:28px;transition:.1s">📎</div><div id="stpCount" style="color:#c9a86b;margin-top:10px;font-family:monospace">0/'+beats+'</div><div id="stpMsg" style="margin-top:6px;color:#e86b4a;font-size:11px"></div></div>';
  const dot=document.getElementById('stpBeat');const msg=document.getElementById('stpMsg');
  // visual metronome
  let metroId=setInterval(()=>{if(done)return;dot.style.borderColor='#e8a03c';setTimeout(()=>dot.style.borderColor='#5a5a5a',150);},interval);
  dot.onclick=()=>{if(done)return;const now=Date.now();
    if(!started){started=true;lastBeat=now;step++;document.getElementById('stpCount').textContent=step+'/'+beats;
      dot.style.background='#4a5a3a';setTimeout(()=>dot.style.background='#3a3a3a',100);
      if(step>=beats){done=true;clearInterval(metroId);miniWin(n,t);}return;}
    const diff=Math.abs((now-lastBeat)-interval);lastBeat=now;
    if(diff<interval*0.35){step++;document.getElementById('stpCount').textContent=step+'/'+beats;
      dot.style.background='#4a5a3a';setTimeout(()=>dot.style.background='#3a3a3a',100);
      if(step>=beats){done=true;clearInterval(metroId);miniWin(n,t);}}
    else{msg.textContent='Off beat! ('+Math.round(diff)+'ms off)';dot.style.background='#5a3a3a';setTimeout(()=>dot.style.background='#3a3a3a',200);}};}

// EXPENSES — categorise expenses as approve/reject based on amount threshold
function miniExpenses(n,t){
  const thresh=t.threshold||100;const items=t.items||[
    {name:'Lunch meeting',amount:45},{name:'Gold-plated stapler',amount:350},
    {name:'Taxi to client',amount:28},{name:'Team building yacht',amount:2400},
    {name:'Office supplies',amount:67},{name:'Conference ticket',amount:180}];
  const shuf=shuffle([...items]);let idx=0,done=false;
  const st=openMini('EXPENSES','Approve ≤$'+thresh+', Reject >$'+thresh,true);
  const stop=countdown(15,()=>{if(!done)fail(n,'Budget review incomplete! [E]');});
  const render=()=>{if(idx>=shuf.length){done=true;stop();miniWin(n,t);return;}
    const it=shuf[idx];
    st.innerHTML='<div style="text-align:center;margin-top:12px"><div style="color:#c9a86b;font-size:13px">'+it.name+'</div><div style="font-size:28px;color:#e8a03c;font-family:monospace;margin:10px 0">$'+it.amount+'</div><div style="display:flex;gap:10px;justify-content:center"><button class="miniBtn" id="expApp">✅ Approve</button><button class="miniBtn" id="expRej">❌ Reject</button></div><div style="color:#888;margin-top:6px;font-size:11px">'+(idx+1)+'/'+shuf.length+'</div></div>';
    document.getElementById('expApp').onclick=()=>{if(done)return;
      if(it.amount<=thresh){idx++;render();}else{done=true;stop();fail(n,'$'+it.amount+' is over budget! Should reject. [E]');}};
    document.getElementById('expRej').onclick=()=>{if(done)return;
      if(it.amount>thresh){idx++;render();}else{done=true;stop();fail(n,'$'+it.amount+' is within budget! Should approve. [E]');}};};
  render();}


// RUBBERBAND — hold and release at the right stretch level
function miniRubberband(n,t){
  const target=t.target||65;const tol=t.tol||10;let stretch=0,growing=false,done=false,snapped=false;
  const st=openMini('RUBBER BAND','Stretch to the green zone ('+Math.max(0,target-tol)+'–'+(target+tol)+'%) and release!');
  st.innerHTML='<div style="text-align:center;margin-top:10px"><div style="width:200px;height:24px;background:#1a2a1a;border:2px solid #3a5a3a;margin:0 auto;border-radius:12px;position:relative;overflow:hidden"><div id="rbFill" style="height:100%;background:#c9a86b;border-radius:12px;width:0;transition:width .03s"></div><div id="rbZone" style="position:absolute;top:0;height:100%;background:rgba(80,200,80,.25);border-left:2px solid #4adf30;border-right:2px solid #4adf30"></div></div><div id="rbPct" style="color:#c9a86b;margin-top:8px;font-family:monospace;font-size:20px">0%</div><button id="rbBtn" class="miniBtn" style="margin-top:10px;font-size:14px">🔴 HOLD TO STRETCH</button></div>';
  const zone=document.getElementById('rbZone');zone.style.left=Math.max(0,target-tol)+'%';zone.style.width=(tol*2)+'%';
  const fill=document.getElementById('rbFill');const pct=document.getElementById('rbPct');
  let raf;const upd=()=>{if(done)return;if(growing){stretch=Math.min(100,stretch+0.7);}
    fill.style.width=stretch+'%';pct.textContent=Math.round(stretch)+'%';
    fill.style.background=stretch>90?'#e86b4a':stretch>(target+tol)?'#e8a03c':'#c9a86b';
    if(stretch>=100){done=true;snapped=true;cancelAnimationFrame(raf);fail(n,'SNAP! Stretched too far! [E]');return;}
    raf=requestAnimationFrame(upd);};
  raf=requestAnimationFrame(upd);
  const btn=document.getElementById('rbBtn');
  btn.onmousedown=btn.ontouchstart=(e)=>{e.preventDefault();growing=true;};
  const release=()=>{if(done||!growing)return;growing=false;done=true;cancelAnimationFrame(raf);
    if(Math.abs(stretch-target)<=tol)miniWin(n,t);
    else fail(n,'Stretch at '+Math.round(stretch)+'% — needed '+Math.max(0,target-tol)+'–'+(target+tol)+'%. [E]');};
  btn.onmouseup=btn.ontouchend=release;}

// COFFEEORDER — remember coffee orders and select the right ones
function miniCoffeeOrder(n,t){
  const drinks=['Espresso','Latte','Cappuccino','Americano','Mocha','Flat White','Macchiato','Cortado'];
  const count=t.count||3;const order=shuffle([...drinks]).slice(0,count);
  let phase='memorize',picked=[],done=false;
  const st=openMini('COFFEE ORDER','Memorize the order!');
  st.innerHTML='<div style="text-align:center;margin-top:8px"><div style="color:#e8a03c;font-size:14px;margin-bottom:8px">☕ Remember this order:</div><div id="coList" style="font-size:16px;color:#c9a86b;line-height:2">'+order.map(d=>'<div>'+d+'</div>').join('')+'</div><div style="color:#888;margin-top:8px;font-size:11px">Memorizing... 4s</div></div>';
  setTimeout(()=>{if(done)return;phase='pick';
    const opts=shuffle([...drinks]).slice(0,6);order.forEach(o=>{if(!opts.includes(o))opts.push(o);});
    const shuf=shuffle(opts);
    st.innerHTML='<div style="text-align:center;margin-top:6px"><div style="color:#e8a03c;margin-bottom:6px">Pick the '+count+' drinks in order:</div><div id="coPicked" style="color:#4adf30;margin-bottom:6px;min-height:20px"></div><div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center" id="coBtns"></div><div id="coMsg" style="margin-top:6px;color:#e86b4a;font-size:11px"></div></div>';
    shuf.forEach(d=>{const b=document.createElement('button');b.textContent='☕ '+d;b.className='miniBtn';b.dataset.drink=d;
      b.onclick=()=>{if(done)return;
        if(d===order[picked.length]){picked.push(d);b.disabled=true;b.style.opacity=.3;
          document.getElementById('coPicked').textContent=picked.join(' → ');
          if(picked.length>=order.length){done=true;miniWin(n,t);}}
        else{done=true;fail(n,'Wrong! Expected '+order[picked.length]+'. [E]');}};
      document.getElementById('coBtns').appendChild(b);});
  },4000);}

// NAMECARD — sort business cards alphabetically
function miniNamecard(n,t){
  const names=t.names||['Anderson','Baker','Chen','Davis','Evans'];const correct=[...names].sort();
  const shuf=shuffle([...names]);let placed=[],done=false;
  const st=openMini('BUSINESS CARDS','Arrange alphabetically.',true);
  const stop=countdown(12,()=>{if(!done)fail(n,'Too slow! [E]');});
  const render=()=>{st.innerHTML='<div style="text-align:center;margin-top:6px"><div style="color:#c9a86b;margin-bottom:4px;font-size:11px">Placed: '+placed.join(', ')+'</div><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center" id="ncBtns"></div><div id="ncMsg" style="margin-top:6px;color:#e86b4a;font-size:11px"></div></div>';
    shuf.filter(x=>!placed.includes(x)).forEach(nm=>{const b=document.createElement('button');b.textContent='🪪 '+nm;b.className='miniBtn';
      b.onclick=()=>{if(done)return;
        if(nm===correct[placed.length]){placed.push(nm);if(placed.length>=correct.length){done=true;stop();miniWin(n,t);}else render();}
        else{document.getElementById('ncMsg').textContent='Not alphabetical! Next should be: '+correct[placed.length];}};
      document.getElementById('ncBtns').appendChild(b);});};
  render();}

// PINGPONG — time your clicks for a rally
function miniPingPong(n,t){
  const rallies=t.rallies||5;let pos=0,speed=0.04,dir=1,score=0,done=false;
  const st=openMini('PING PONG','Hit the ball when it reaches the paddle! ('+rallies+' rallies)');
  st.innerHTML='<div style="text-align:center;margin-top:10px"><div style="width:220px;height:30px;background:#1a3a1a;border:2px solid #3a5a3a;margin:0 auto;position:relative;border-radius:4px"><div id="ppBall" style="position:absolute;width:14px;height:14px;background:#e8a03c;border-radius:50%;top:8px;left:0;transition:none"></div><div style="position:absolute;right:0;top:2px;width:8px;height:26px;background:#4adf30;border-radius:2px"></div><div style="position:absolute;left:0;top:2px;width:8px;height:26px;background:#4adf30;border-radius:2px"></div></div><div id="ppScore" style="color:#c9a86b;margin-top:8px;font-family:monospace">0/'+rallies+'</div><button id="ppHit" class="miniBtn" style="margin-top:8px;font-size:14px">🏓 HIT</button></div>';
  const ball=document.getElementById('ppBall');
  let raf;const anim=()=>{if(done)return;pos+=speed*dir;
    if(pos>1){pos=1;dir=-1;speed=Math.min(0.08,speed+0.003);}
    if(pos<0){pos=0;dir=1;speed=Math.min(0.08,speed+0.003);}
    ball.style.left=(pos*206)+'px';raf=requestAnimationFrame(anim);};
  raf=requestAnimationFrame(anim);
  document.getElementById('ppHit').onclick=()=>{if(done)return;
    const atEdge=(dir===1&&pos>0.88)||(dir===-1&&pos<0.12);
    if(atEdge){score++;dir*=-1;document.getElementById('ppScore').textContent=score+'/'+rallies;
      if(score>=rallies){done=true;cancelAnimationFrame(raf);miniWin(n,t);}}
    else{done=true;cancelAnimationFrame(raf);fail(n,'Missed! Ball was in the middle. [E]');}};}

// FIREWALL — let good packets through, block bad ones
function miniFirewall(n,t){
  const rounds=t.rounds||6;const goodPorts=['80','443','22','3000'];const badPorts=['6666','1337','4444','31337'];
  let idx=0,done=false;
  const st=openMini('FIREWALL','Allow safe ports, block suspicious ones!',true);
  const stop=countdown(15,()=>{if(!done)fail(n,'Firewall timeout! [E]');});
  const pool=shuffle([...goodPorts,...badPorts]).slice(0,rounds);
  const render=()=>{if(idx>=pool.length){done=true;stop();miniWin(n,t);return;}
    const port=pool[idx];const isGood=goodPorts.includes(port);
    st.innerHTML='<div style="text-align:center;margin-top:12px"><div style="color:#c9a86b;font-size:11px;margin-bottom:6px">Packet '+(idx+1)+'/'+pool.length+'</div><div style="font-size:32px;color:#e8a03c;font-family:monospace;margin:10px 0">:'+port+'</div><div style="display:flex;gap:10px;justify-content:center"><button class="miniBtn" id="fwAllow">✅ Allow</button><button class="miniBtn" id="fwBlock">🚫 Block</button></div></div>';
    document.getElementById('fwAllow').onclick=()=>{if(done)return;if(isGood){idx++;render();}else{done=true;stop();fail(n,'Port :'+port+' is malicious! Should block. [E]');}};
    document.getElementById('fwBlock').onclick=()=>{if(done)return;if(!isGood){idx++;render();}else{done=true;stop();fail(n,'Port :'+port+' is safe! Should allow. [E]');}};};
  render();}

// RECEIPT — add up items and type the total
function miniReceipt(n,t){
  const items=t.items||[{name:'Pens',price:4},{name:'Paper',price:12},{name:'Toner',price:28},{name:'Staples',price:3},{name:'Folders',price:8}];
  const total=items.reduce((s,i)=>s+i.price,0);let done=false;
  const st=openMini('RECEIPT','Add up the receipt and type the total.',true);
  const stop=countdown(15,()=>{if(!done)fail(n,'Time\'s up! [E]');});
  let html='<div style="text-align:center;margin-top:6px"><div style="text-align:left;display:inline-block;background:#1a2a1a;padding:10px 16px;border-radius:4px;border:1px solid #3a5a3a;font-family:monospace">';
  items.forEach(i=>{html+='<div style="display:flex;justify-content:space-between;gap:20px;color:#c9a86b"><span>'+i.name+'</span><span>$'+i.price+'</span></div>';});
  html+='<div style="border-top:1px solid #3a5a3a;margin-top:6px;padding-top:6px;color:#e8a03c;font-weight:bold">Total: $???</div></div>';
  html+='<div style="margin-top:10px"><input id="rcInput" type="number" style="background:#1a2a1a;border:2px solid #3a5a3a;color:#c9a86b;padding:6px 10px;font-size:16px;font-family:monospace;text-align:center;width:80px;border-radius:4px" autofocus></div><div id="rcMsg" style="margin-top:6px;color:#e86b4a;font-size:11px"></div></div>';
  st.innerHTML=html;
  const inp=document.getElementById('rcInput');setTimeout(()=>inp.focus(),50);
  inp.addEventListener('keydown',e=>{if(done)return;if(e.key==='Enter'){
    const val=parseInt(inp.value);
    if(val===total){done=true;stop();miniWin(n,t);}
    else{document.getElementById('rcMsg').textContent='Wrong! Try again.';inp.value='';}}});}

// SCHEDULE — place meetings without time conflicts
function miniSchedule(n,t){
  const slots=['9:00','10:00','11:00','13:00','14:00','15:00','16:00'];
  const meetings=t.meetings||[{name:'Standup',slot:'9:00'},{name:'Client Call',slot:'11:00'},{name:'Review',slot:'14:00'},{name:'1-on-1',slot:'16:00'}];
  const shuf=shuffle([...meetings]);let placed={},done=false,selMeeting=null;
  const st=openMini('SCHEDULE','Place each meeting in its correct time slot.',true);
  const stop=countdown(15,()=>{if(!done)fail(n,'Calendar closed! [E]');});
  const render=()=>{
    const remaining=shuf.filter(m=>!Object.values(placed).includes(m.name));
    if(remaining.length===0){done=true;stop();miniWin(n,t);return;}
    let html='<div style="margin-top:4px"><div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-bottom:8px">';
    remaining.forEach(m=>{html+='<button class="miniBtn meetBtn" data-name="'+m.name+'" style="font-size:11px;'+(selMeeting===m.name?'border-color:#e8a03c':'')+'">📅 '+m.name+'</button>';});
    html+='</div><div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">';
    slots.forEach(s=>{const taken=placed[s];html+='<div class="miniBtn slotBtn" data-slot="'+s+'" style="font-size:11px;padding:6px 8px;cursor:'+(taken?'default':'pointer')+';opacity:'+(taken?'.4':'1')+'">'+s+(taken?' ✓':'')+'</div>';});
    html+='</div><div id="schMsg" style="margin-top:6px;color:#e86b4a;text-align:center;font-size:11px"></div></div>';
    st.innerHTML=html;
    st.querySelectorAll('.meetBtn').forEach(b=>{b.onclick=()=>{selMeeting=b.dataset.name;render();};});
    st.querySelectorAll('.slotBtn').forEach(b=>{b.onclick=()=>{if(done||!selMeeting||placed[b.dataset.slot])return;
      const m=shuf.find(x=>x.name===selMeeting);
      if(m&&m.slot===b.dataset.slot){placed[b.dataset.slot]=m.name;selMeeting=null;render();}
      else{document.getElementById('schMsg').textContent=selMeeting+' doesn\'t go at '+b.dataset.slot+'!';}};});};
  render();}


