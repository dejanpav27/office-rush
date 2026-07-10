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

const ITEM_SPOTS={
  cigs:{x:5,y:6,icon:'cig'},logsheet:{x:7,y:9,icon:'doc'},coffee:{x:12,y:6,icon:'cup'},
  contract:{x:12,y:8,icon:'doc'},router:{x:14,y:6,icon:'rtr'},vape:{x:7,y:3,icon:'vape'},
  laptop:{x:7,y:7,icon:'lap'},invoice:{x:3,y:8,icon:'inv'},lighter:{x:14,y:4,icon:'ltr'},
};

/* character visual specs for pixel sprites */
const LOOKS={
  dejan:{skin:'#e8b88a',hair:'#6b4a2a',shirt:'#2e4a72',pants:'#333',glasses:true},
  teonem:{skin:'#e8b88a',hair:'#1f1f1f',shirt:'#8a2e3e',pants:'#2a2a3a'},
  steve:{skin:'#e8c49a',hair:'#7a5a35',shirt:'#3e6b3a',pants:'#3a3a3a',beard:true,wide:true},
  brana:{skin:'#e8b88a',hair:'#4a2a5a',shirt:'#6b3e8a',pants:'#4a3a6a',long:true},
  sonja:{skin:'#edc9a2',hair:'#c9903f',shirt:'#3f8a80',pants:'#444',long:true},
  pedja:{skin:'#e8b88a',hair:'#2a2a2a',shirt:'#b8863e',pants:'#2f2f3f',tall:true},
  nina:{skin:'#edc9a2',hair:'#8a2e2e',shirt:'#d9663d',pants:'#3a2a2a',long:true},
  daniel:{skin:'#8a5a3a',hair:'#1a1a1a',shirt:'#5a3e8a',pants:'#2a2a2a'},
  nino:{skin:'#e8b88a',hair:'#888',shirt:'#caa53d',pants:'#2a2a2a',boss:true},
};

const SPRITES={};
Object.keys(SPRITE_B64).forEach(id=>{const im=new Image();im.src='data:image/png;base64,'+SPRITE_B64[id];SPRITES[id]=im;});

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

const POOLS={
 dejan:{desc:'Glasses, Gromix, chain-smoker',home:{x:12,y:4},pool:[
   {type:'fetch',item:'cigs',itemLabel:'cigarettes',ask:"Out of cigs mid-deploy. Grab a pack from the kitchen.",reward:'Dejan lights up. "Now Gromix compiles. Thanks brother."'},
   {type:'fetch',item:'lighter',itemLabel:'a lighter',ask:"Got cigs, lost the lighter. Fetch me one, fast.",reward:'*click* "Ahh. Back to coding."'},
   {type:'mash',ask:"Prod is on fire — mash SPACE to force-redeploy!",reward:'"Green build. We never speak of this."'},
   {type:'type',word:'GROMIX',ask:"Type the deploy passphrase, both my hands are busy (cigarette).",reward:'"Deployed. Beautiful."'},
   {type:'math',ask:"Quick, how many API tokens left? Do the math.",reward:'"Correct. Rate limit dodged."'},
   {type:'scramble',word:'DEPLOY',ask:"Unscramble the command I forgot.",reward:'"That is the one. Shipping it."'},
   {type:'qte',ask:"Emergency hotfix combo — hit the keys, fast!",reward:'"Patched live. Legend."'},
   {type:'pincode',ask:"Memorize the server PIN before I forget it again.",reward:'"In. Nice memory."'},
   {type:'lockpick',ask:"Locked out of prod. Pick it open, carefully.",reward:'"We are in. Do not tell security."'},
   {type:'count',subject:'coffees today',ask:"How many coffees have I had today? I genuinely lost count.",reward:'"...that\'s a personal record. And it\'s not even lunch."'},
   {type:'hold',ask:"Take a drag with me while the build runs. Hold it... release at the right time.",reward:'*exhales* "Perfect timing. Build passed."'},
   {type:'typerace',word:'HOTFIX',ask:"Prod dies in seconds — type the fix before the timer!",reward:'"Saved with 0.3s to spare. Respect."'},
   {type:'crack',ask:"Guess which port the service died on. I'll say higher or lower.",reward:'"That is the one. Restarting now."'},
   {type:'jenga',ask:"Kill unused servers without taking down anything load-bearing.",reward:'"Infra is lean now. Nothing fell over."'},
   {type:'forge',recipe:['DB_URL','API_KEY','CACHE_ON'],extra:['DEBUG_MODE','COMIC_SANS'],ask:"Chain the env variables in the exact right order or it won't boot.",reward:'"Boots clean. You just saved my night."'},
   {type:'splice',pairs:[['/login','AuthService'],['/invoice','Billing'],['/upload','MediaStore']],hint:'Match each endpoint to its service.',ask:"Match each API endpoint to the service that actually owns it.",reward:'"All wired right. Now it actually works."'},
   {type:'noise',real:'ERR 502: gromix',fakes:['OK 200: gromix','OK 200: deploy','INFO: cache hit','INFO: ping ok','OK 200: auth'],hint:'Find the real ERROR in the logs.',ask:"One real error is buried in the logs. Find it.",reward:'"There is the bug. Everything else was noise."'},
   {type:'impostor',word:'works on my machine',odd:'works in prod',hint:'Four devs lie the same way. One tells the truth.',ask:"Four devs said the same thing. One is lying differently. Find them.",reward:'"Ha. Classic. Ship it anyway."'},
   {type:'priority',cards:[{l:'Prod is DOWN',p:1},{l:'Client demo in 1h',p:2},{l:'Code review',p:3},{l:'Update Jira',p:4}],hint:'What burns first?',ask:"Everything is on fire. Tell me what burns first.",reward:'"Correct. Jira can wait until 2027."'},
   {type:'jam',ask:"Printer ate the deploy sheet. Yank it out — mind the direction.",reward:'"Free. Now it prints. Barely."'},
   {type:'circuit',ask:"Server rack lost power. Re-route the wire tiles so it boots.",reward:'"Green lights. Gromix lives again."'},
   {type:'wire',pairs:[['HDMI','Projector'],['Ethernet','Router'],['Power','Wall socket']],hint:'Match each cable to the right port before the client demo.',ask:"Client demo in 2 minutes and nothing's plugged in right. Fix it.",reward:'"Screen\'s up. Cutting it close, but up."'},
   {type:'cartridge',hint:'Click each cartridge to cycle its color, match the label, then lock in.',ask:"Printer's out of ink and I need three colors right now. Load them right.",reward:'"Printing again. You just saved my afternoon."'},
   {type:'typewriter',word:'DEPLOY',ask:"Server's waiting. Type the deploy command letter by letter before the timeout.",reward:'"Green light. You type fast for a smoker."'},
   {type:'cableroute',ask:"Server rack is down. Route the power cable from source to the switch — no diagonal.",reward:'"Power restored. I owe you a coffee. Maybe."'},
   {type:'voltage',ask:"Three servers need constant power — keep all rails in green while the deploy runs.",reward:'"Stable the whole time. Respect."'},
   {type:'wordsearch',words:['CODE','BUG','LOG'],ask:"Find the three keywords buried in the error log grid.",reward:'"All found. You have the eyes of a grep command."'},
   {type:'toggle',hint:'Set switches to match the target server config.',ask:"Set the server flags to match the prod config — every switch matters.",reward:'"Flags match. Zero downtime. Legendary."'},
   {type:'binary',val:13,ask:"Convert server port 13 to binary — flip the right bulbs.",reward:'"Binary correct. You could work at NASA."'},
   {type:'mirror',word:'DEBUG',ask:"Terminal flipped on me — mirror mode. Type DEBUG normally to fix it.",reward:'"Fixed. Mirror mode, classic Dejan problem."'},
   {type:'park',ask:"Server room is full — parallel park the equipment rack into the last open slot. Don't scrape anything.",reward:'"Tight fit. Not a scratch. Respect."'},
   {type:'gauge',ask:"CPU temp is spiking — watch the gauge and tell me when it crosses the red line.",reward:'"Caught it at 94°. Throttled in time."'},
   {type:'switchboard',callerHint:'Nino calling about the server',hint:'Route Nino to the server room extension.',ask:"Switchboard's going crazy — route Nino to the right extension before he loses it.",reward:'"Connected. He only yelled a little."'},
   {type:'docsort',ask:"My Downloads folder is a disaster. Sort the files into the right project folders.",reward:'"Finally. I can find things again. Almost."'},
   {type:'recipe',ask:"New dev environment setup — follow the install steps in exact order or it breaks.",reward:'"Environment up. First try. Legendary."'},
   {type:'wordle',word:'CRASH',ask:"Server's down and I need to find the error type — guess the 5-letter word from the logs.",reward:'"CRASH. Exactly. Already fixed it, obviously."'},
   {type:'minesweeper',size:5,mines:4,ask:"Server maintenance grid — clear the safe nodes without triggering any faults.",reward:'"All clear. Zero incidents. Legendary maintenance."'},
   {type:'hidden',items:[{label:'USB',emoji:'🔌',x:40,y:30},{label:'Dongle',emoji:'🔑',x:180,y:120},{label:'Badge',emoji:'🪪',x:260,y:60}],ask:"Can't find the USB, dongle, and my access badge. They're on my desk... somewhere.",reward:'"Found them. The chaos has a system, I promise."'},
   {type:'typingtest',passage:'git commit -m "fix: resolve merge conflict in production branch"',ask:"Type this commit message exactly before the deploy window closes.",reward:'"Committed. Clean history. Legendary."'},
   {type:'pipe',size:4,ask:"Network routing diagram is broken — rotate the pipe segments to reconnect the server to the switch.",reward:'"Network restored. Packet loss: zero. Obviously."'}
 ]},
 teonem:{desc:'Sales, always "out in town"',home:{x:10,y:9},pool:[
   {type:'deliver',item:'contract',itemLabel:'contract',to:'nino',ask:"Running into town (work!). Take this contract to Nino.",reward:'"Legend. I never left, clear?" *left*'},
   {type:'choose',q:'Client wants a discount. Best move?',opts:[{t:'Offer a bundle',ok:true},{t:'Say no, hang up',ok:false},{t:'Ghost them',ok:false}],ask:"Coach me — client wants a discount.",reward:'"Closed it from the parking lot."'},
   {type:'timing',ask:"Calling a lead NOW — nail the send timing.",reward:'"Perfect timing. Signed."'},
   {type:'reflex',ask:"Lead picks up any second. Click GO the instant it appears.",reward:'"Caught them on ring one. Out."'},
   {type:'hold',ask:"Busy CEO won't pick up — leave a voicemail. Hold SPACE, release right in the sweet spot.",reward:'"Reply in 2 min. Boom."'},
   {type:'dodge',ask:"Dodging awkward questions in the sales meeting — weave through!",reward:'"Deflected every one. Still closed."'},
   {type:'slider',ask:"Dial the discount to the exact sweet spot. Not a cent more.",reward:'"Perfect margin. That is the job."'},
   {type:'rhythm',ask:"Small talk has a rhythm. Match it, land the deal.",reward:'"Smooth as ever. Out the door."'},
   {type:'impostor',word:'READY TO BUY',odd:'JUST BROWSING',hint:'Four are buyers. Spot the time-waster.',ask:"One lead is a time-waster. Spot the odd one.",reward:'"Knew it. Not wasting my time."'},
   {type:'higherlower',ask:"Two offers on the table — always grab the bigger one. Three rounds.",reward:'"Maximum value, every time."'},
   {type:'moving',ask:"This client keeps dodging my calls — catch him! He moves.",reward:'"Cornered him by the printer. Signed."'},
   {type:'target',ask:"Build me a bundle that hits the exact price target.",reward:'"To the cent. You are wasted here."'},
   {type:'budget',ask:"Split my commission between three deals so it adds up right.",reward:'"Exactly what I earned. Nice math."'},
   {type:'rank',items:['Signed LOI, wants call NOW','Asked for a quote','Opened the email twice','Unsubscribed (twice)'],hint:'Drag hottest lead to the top.',ask:"Rank these leads hottest to coldest before they go cold for real.",reward:'"Perfect order. That is how deals get closed."'},
   {type:'crack',ask:"Guess this client's real budget. I'll tell you higher or lower.",reward:'"Nailed it. Now watch me close this."'},
   {type:'signal',ask:"Catch the client mid-call at exactly the right beat to pitch.",reward:'"Timed it perfect. Pitch landed."'},
   {type:'overload',ask:"Two leads calling in at once — keep both warm, don't drop either.",reward:'"Both closed. I contain multitudes."'},
   {type:'splice',pairs:[['Objection: too expensive','Show ROI math'],['Objection: no time','Offer 15-min call'],['Objection: thinking','Book follow-up date']],hint:'Match each objection to the counter.',ask:"Match each client objection to the right counter-move.",reward:'"Textbook. You could sell air."'},
   {type:'calendar',ask:"Book me three demos this week — no clashes, I'm 'in town' a lot.",reward:'"Slotted clean. I close from anywhere."'},
   {type:'maze',ask:"Move this car to the showroom floor for me — don't scuff anything on the way.",reward:'"Parked pretty. Client\'s gonna love it."'},
   {type:'handover',steps:['Greet the client','Check their ID & paperwork','Walk them around the car','Explain the key features','Hand over the keys','Wave them off'],hint:'Client\'s here for the car. Do the handover in the right order.',ask:"Handover time. Client's here for the car — do it right, step by step.",reward:'"Perfect handover. That\'s a referral right there."'},
   {type:'flowchart',tree:{q:'Client says too expensive?',yes:{q:'Offer a smaller package?',yes:{end:true,win:true},no:{end:true,win:false}},no:{q:'Close now?',yes:{end:true,win:true},no:{end:true,win:false}}},hint:'Follow the sales decision tree.',ask:"Walk the decision tree — what do I do with this client right now?",reward:'"Textbook close. Beautiful."'},
   {type:'inbox',emails:[{from:'Hot lead',sub:'Ready to sign contract',type:'urgent'},{from:'promo@deals.biz',sub:'Double commission offer!!!',type:'spam'},{from:'Steve',sub:'Follow-up with Zagreb client',type:'urgent'},{from:'newsletter@crm.io',sub:'CRM tips weekly digest',type:'safe'},{from:'unknown@fishy.net',sub:'Your account suspended',type:'spam'}],ask:"Clear my inbox before the client meeting — flag urgent, archive safe, delete spam.",reward:'"Inbox zero. Teonem is unstoppable."'},
   {type:'conveyor',target:'\uD83D\uDCCB',fakes:['\uD83D\uDCE7','\uD83D\uDCC1','\uD83D\uDCF1'],ask:"Contracts rolling in on the belt — grab the clipboards, ignore everything else.",reward:'"All contracts caught. Efficiency is beautiful."'},
   {type:'triage',cards:[{label:'Client ready to sign',bucket:'urgent'},{label:'Cold lead newsletter',bucket:'archive'},{label:'Follow-up in a week',bucket:'normal'},{label:'Demo request today',bucket:'urgent'},{label:'Unsubscribed prospect',bucket:'archive'}],ask:"Triage my sales pipeline — urgent, normal, or archive each one.",reward:'"Perfect sort. That is a clean pipeline."'},
   {type:'frequency',target:101,hint:'Tune the radio for the client drive — exactly 101.0 FM.',ask:"Set the car radio to 101.0 before the client gets in. Nothing worse than static.",reward:'"101.0. Smooth. Client is already impressed."'},
   {type:'approvalchain',chain:['Sales Rep','Team Lead','Sales Director','CEO'],hint:'Who approves a large deal, step by step?',ask:"Big deal needs sign-off up the chain — click each approver in the right order.",reward:'"Approved at every level. Deal\'s done."'},
   {type:'slot',target:[2,2,2],hint:'Stop all three reels on the checkmark.',ask:"Three clients all say yes at once — stop the reels on the triple win!",reward:'"Triple close. I can\'t even explain this."'},
   {type:'inspect',ask:"Client returning the demo car — find every scratch and dent before he claims it was there before.",reward:'"Four scratches. Two definitely his. Documentation saves lives."'},
   {type:'arrange',items:[['🔑','keys'],['📋','contract'],['🪪','id']],hint:'Lay out the handover items in the exact order.',ask:"Set up the delivery table before the client arrives — keys, contract, ID in my exact order.",reward:'"Perfect setup. First impressions close deals."'},
   {type:'barcode',ask:"New stock just arrived from the importer — scan each VIN barcode. Steady hand.",reward:'"All logged. Inventory updated. Clean."'},
   {type:'safe',ask:"Commission envelope's in the office safe — crack it before Nino gets back.",reward:'"Opened. Commission secured. Teonem was never here."'},
   {type:'spy',ask:"Competitor's price list is on the table — find the Golf price before they notice.",reward:'"Got it. We\'re cheaper by 800. Beautiful."'},
   {type:'flowfree',size:5,pairs:[{color:'#e03030',from:[0,0],to:[4,3]},{color:'#2e7d46',from:[0,4],to:[3,0]},{color:'#1565c0',from:[1,2],to:[4,1]},{color:'#b07d18',from:[0,2],to:[4,4]}],ask:"Route the client calls through the switchboard — connect every line without crossing them.",reward:'"All lines clear. Every client reached. Beautiful."'},
   {type:'merge2048',target:128,ask:"Budget spreadsheet — merge the numbers until you hit the quarterly target.",reward:'"128k. Nailed it. Commission incoming."'},
   {type:'wordle',word:'LEASE',ask:"Client mentioned the deal type but I forgot — guess the 5-letter word.",reward:'"LEASE. Of course. Three-year term, standard."'},
   {type:'hidden',items:[{label:'Contract',emoji:'📋',x:60,y:40},{label:'Keys',emoji:'🔑',x:200,y:130},{label:'Card',emoji:'💳',x:120,y:90}],ask:"Demo car keys, the contract, and the client's card are buried on my desk. Find them.",reward:'"Found everything. Now the handover can happen."'},
   {type:'tetris',lines:3,ask:"Car parts just came in — stack them in the warehouse so nothing falls over. Clear 3 rows.",reward:'"Stacked clean. Nino will never know it was chaos."'}
 ]},
 steve:{desc:'Beard, vape, sells in Croatia',home:{x:4,y:2},pool:[
   {type:'fetch',item:'vape',itemLabel:'vape',ask:"Left my vape by the entrance. No fog, no deals.",reward:'*huge cloud* "Now we do business."'},
   {type:'timing',ask:"Calling Zagreb — catch the second to drop the offer.",reward:'"Bang on. Respect." *vapor*'},
   {type:'typerace',word:'RAZMISLITCU',ask:"Type the Croatian phrase back before the timer — prove you were listening.",reward:'"Tocno. You get it."'},
   {type:'scramble',word:'ZAGREB',word:'CRNOMELJA',ask:"Unscramble where Teonem is actually from.",reward:'"Točno! Iz Črnomelja!"'},
   {type:'mash',ask:"Vape battery died — mash SPACE to charge it back!",reward:'*puff* "Alive again. Deals incoming."'},
   {type:'colormatch',ask:"Match my new vape color, obviously important.",reward:'"That is the shade. Classy clouds."'},
   {type:'trace',ask:"Trace the drive route to the Zagreb client, in order.",reward:'"Fastest way there. Let us go."'},
   {type:'whack',ask:"Notifications blowing up from Croatia — tap them all!",reward:'"Cleared. All deals, no spam."'},
   {type:'balance',ask:"Balance the vape on the desk while I talk. Steady.",reward:'"Did not drop it once. Pro."'},
   {type:'hold',ask:"Longest drag contest. Hold SPACE... release in the green.",reward:'*cloud fills the room* "Champion."'},
   {type:'higherlower',ask:"Compare these Croatian offers — pick the bigger, three times.",reward:'"Uvijek veca ponuda. Always."'},
   {type:'maze',ask:"Route the delivery van through Zagreb traffic without a scratch.",reward:'"Made it in one piece. Barely."'},
   {type:'noise',real:'Order: 10 units, Zagreb',fakes:['YOU WON $$$','FREE CRYPTO 4U','HOT DEAL CLICK','PRINCE NEEDS HELP','LAST WARNING!!'],hint:'Find the real client order in the spam.',ask:"Client sent one real message buried in a spam thread. Find it.",reward:'"There it is. The rest was noise, as usual."'},
   {type:'budget',ask:"Split territory between me and the other rep. Fair, but mostly mine.",reward:'"Perfect split. Mostly mine, like I said."'},
   {type:'forge',recipe:['SMALL TALK','PITCH','DISCOUNT'],extra:['HARD SELL','INVOICE FIRST'],ask:"Build the sales call in the right order — don't blow the deal.",reward:'"That combo closed it. Smooth."'},
   {type:'signal',ask:"Catch the call the instant it connects across the border.",reward:'"Connected clean. No lag, no lost deal."'},
   {type:'splice',pairs:[['Dobar dan','Good day'],['Racun, molim','Invoice, please'],['Dogovoreno','Deal']],hint:'Match Croatian to English.',ask:"Match my Croatian phrases so I don't embarrass myself in Zagreb.",reward:'"Bok! Now I sound like a local."'},
   {type:'qralign',ask:"Scan this Croatian client's QR invoice — line it up, hold steady.",reward:'*vapor* "Locked. Deal logged."'},
   {type:'patchline',pairs:[['Golf GTI','ZG-341-KL'],['Passat','ZG-852-MN'],['Octavia','ZG-119-RT']],hint:'Drag a line from each car to its plate.',ask:"Match each car on the lot to its actual plate. Zagreb inventory's a mess.",reward:'*vapor* "All matched. Inventory\'s clean."'},
   {type:'crack',ask:"Which car is the client asking about? I'll say warmer or colder on the stock number.",reward:'*vapor* "That\'s the one. Good guess, chief."'},
   {type:'barcode',ask:"Parts shipment just came in from Zagreb — scan it in. Steady hand, not too fast.",reward:'*vapor* "Logged. Croatia never disappoints."'},
   {type:'redact',sentences:['Client name: Marko Horvat signed today','Contact: +385 91 555 0192','Bank: IBAN HR1234567890123456'],sensitive:['Marko Horvat','+385 91 555 0192','HR1234567890123456'],ask:"Redact the client data before sending this to the wrong department. *vapor*",reward:'*vapor* "Clean send. Privacy intact."'},
   {type:'hotkey',items:[{k:'S',l:'Save'},{k:'P',l:'Print'},{k:'E',l:'Export'},{k:'C',l:'Close'}],target:'P',ask:"Print the contract — keyboard only, no mouse. That is how pros do it.",reward:'*vapor* "Printed. Respect."'},
   {type:'cipher',shift:3,raw:'INVOICE',ask:"Client sent an encoded message — shift 3 letters to decode. Which shift is it?",reward:'*vapor* "Decoded. Classic Caesar. Old school."'},
   {type:'contract',fields:['Supplier signature','Date','Reference number'],ask:"Supplier contract came in — scroll through and sign every field before it expires.",reward:'*vapor* "All signed. Deal\'s locked."'},
   {type:'handover',steps:['Greet the client','Verify ID and registration','Walk around the car together','Explain the warranty','Hand over the keys','Wave them off'],hint:'Croatian client handover — every step matters.',ask:"Zagreb client picking up their car. Do the handover properly — step by step. *vapor*",reward:'*vapor* "Flawless. That\'s a five-star review."'},
   {type:'calendar',ask:"Schedule the Zagreb client visit — find the free slot this week that works across time zones.",reward:'*vapor* "Booked. Croatia never sleeps."'},
   {type:'rotary',combo:[30,60,10],hint:'Spin to each number and press SET.',ask:"Office safe with the Croatian contracts — spin the combo before the courier leaves.",reward:'*vapor* "Opened. Contracts secured."'},
   {type:'heatmap',zones:['Zagreb','Split','Rijeka','Osijek'],hotIdx:0,hint:'Which territory is generating most leads right now?',ask:"Look at the territory heatmap — where should I focus this week?",reward:'*vapor* "Zagreb. Always Zagreb."'},
   {type:'dragfile',ask:"Client files from Zagreb are in the wrong folders again — drag them to the right place.",reward:'*vapor* "Organized. I can find things now."'},
   {type:'wordle',word:'SPLIT',ask:"Croatian city where the big client is based — guess the 5-letter word. *vapor*",reward:'*vapor* "SPLIT. Exactly. Road trip incoming."'},
   {type:'minesweeper',size:5,mines:3,ask:"Territory map has dead zones — clear the safe areas without hitting a bad lead.",reward:'*vapor* "Clean territory. Every safe lead flagged."'},
   {type:'hidden',items:[{label:'Vape',emoji:'💨',x:80,y:50},{label:'Offer',emoji:'📄',x:220,y:110},{label:'Phone',emoji:'📱',x:150,y:150}],ask:"Can't find my vape, the offer letter, and my phone before the client call. *vapor*",reward:'*vapor* "All found. Call starts in 30 seconds."'},
   {type:'flowfree',size:4,pairs:[{color:'#e03030',from:[0,0],to:[3,3]},{color:'#2e7d46',from:[0,3],to:[3,0]},{color:'#1565c0',from:[0,1],to:[2,3]}],ask:"Route the Croatian territory sales calls — connect every region without overlap.",reward:'*vapor* "All regions covered. Clean map."'},
   {type:'tetris',lines:3,ask:"Parts shipment from Zagreb — stack the boxes in the storage bay before the truck leaves. *vapor*",reward:'*vapor* "Clean stack. Zero damage. Professional."'},
   {type:'typingtest',passage:'Poštovani klijente, šaljemo Vam ponudu u prilogu.',ask:"Type this Croatian client email exactly — one typo and the deal looks amateur. *vapor*",reward:'*vapor* "Sent. Professional. Croatian clients expect nothing less."'}
 ]},
 brana:{desc:'Watches everyone (secretly)',home:{x:3,y:9},pool:[
   {type:'fetch',item:'logsheet',itemLabel:'attendance log',ask:"Bring that sheet by the entrance. I do not track people... just get it.",reward:'*hides it* "I did not ask for this. But I did."'},
   {type:'memory',ask:"Recall the exact order people arrived. I was not watching, obviously.",reward:'"Correct. Not that I keep records. (I do.)"'},
   {type:'rolodex',cards:['Sonja — 08:58','Pedja — 09:02','Nina — 09:04','Teonem — 09:47 ("errands")'],correctIdx:3,ask:"Between us... who was last?",reward:'*scribbles* "Thought so."'},
   {type:'sequence',ask:"Play back today's clock-in order on the grid.",reward:'"Flawless. This never happened."'},
   {type:'avoid',ask:"Flag the late arrivals, skip the punctual ones.",reward:'"Efficient. I trained you well."'},
   {type:'spotdiff',ask:"One timesheet does not match the rest. Find it.",reward:'"There it is. Someone fudged it."'},
   {type:'pincode',ask:"Memorize the door access code. For records.",reward:'"Logged. I remember everything."'},
   {type:'sortorder',ask:"Put the clock-in times in order for me.",reward:'"Perfectly sorted. As always."'},
   {type:'count',ask:"Count how many left early on Friday.",reward:'"Mhm. Thought it was that many."'},
   {type:'pairs',ask:"Match each badge to its owner. From memory. Which I do not keep.",reward:'"All matched. You would make a fine... observer."'},
   {type:'gridmem',ask:"Which desks were occupied at 9:01? Mark them.",reward:'"Exactly right. (I have it on camera anyway.)"'},
   {type:'oddeven',ask:"Sort these clock-ins: even minutes = on time, odd = late.",reward:'"Sorted. The odd ones will be... noted."'},
   {type:'spy',ask:"Memorize who sat where this morning. I definitely was not watching.",reward:'"Correct. (I was watching.)"'},
   {type:'echo',ask:"Repeat back the growing list of who left early. Do not skip anyone.",reward:'"All accounted for. Good memory."'},
   {type:'dial',hint:'Dial in the drawer combination.',ask:"Guess the drawer combination. Don't ask why I know it.",reward:'"Cracked. I am impressed. Slightly concerned."'},
   {type:'rank',items:['Someone got a raise (WHO?)','Fridge thief struck again','Parking spot dispute','Stapler was moved 3cm'],hint:'Drag the juiciest gossip to the top.',ask:"Rank the office gossip by how juicy it is. Highest first.",reward:'"Exactly my ranking. We think alike."'},
   {type:'splice',pairs:[['Teonem','arrived 09:47'],['Steve','arrived 08:55'],['Pedja','arrived 08:30']],hint:'Match each person to their arrival time.',ask:"Match each person to when they REALLY arrived. I have it memorized. Allegedly.",reward:'"All correct. I always know. Always."'},
   {type:'impostor',word:'I was here at 8:00',odd:'traffic was crazy',hint:'Four honest, one excuse.',ask:"Five people told me when they arrived. One is making excuses. Spot it.",reward:'"Noted. Filed. Never mentioned again. (Mentioned daily.)"'},
   {type:'docsort',ask:"Stamp the signed timesheets, reject the blanks. I'm... auditing.",reward:'"All sorted. Nothing gets past me."'},
   {type:'switchboard',opts:['Dejan (IT)','Sonja (Payroll)','Reception'],correctIdx:0,callerHint:'IT issue — Sonja\'s PC crashed',ask:"Phone's ringing. I know exactly who needs this, obviously — do you?",reward:'"Correct. I was testing you."'},
   {type:'priority',cards:[{l:'Get everyone to the exit',p:1},{l:'Call the fire department',p:2},{l:'Grab the visitor log',p:3},{l:'Lock your desk',p:4}],hint:'Drill\'s starting. What matters first?',ask:"Fire drill. I've mentally rehearsed this daily — what happens first?",reward:'"Correct. I would know."'},
   {type:'crack',ask:"This visitor badge doesn't look right to me. Higher or lower — guess the real badge number.",reward:'"Fake. I knew it. I know everything."'},
   {type:'typewriter',word:'WATCHING',ask:"Type what I\'m always doing — letter by letter before they fall.",reward:'"Correct. Though I prefer to deny it."'},
   {type:'crossword',clues:[{hint:'Opposite of punctual (4 letters)',ans:'LATE'},{hint:'I always secretly... (5 letters)',ans:'WATCH'},{hint:'What I write about everyone (5 letters)',ans:'NOTES'}],ask:"Fill in my attendance crossword. I may have prepared this.",reward:'"All correct. I always knew you were paying attention."'},
   {type:'wordsearch',words:['LATE','WATCH','NOTE'],ask:"Find the surveillance keywords I definitely do not track. In this grid. Allegedly.",reward:'"Found them all. I had nothing to do with it."'},
   {type:'triage',cards:[{label:'Someone arrived late',bucket:'urgent'},{label:'Birthday card signing',bucket:'normal'},{label:'Old meeting notes',bucket:'archive'},{label:'Attendance discrepancy',bucket:'urgent'},{label:'Lunch order spam',bucket:'archive'}],ask:"Triage these office incidents. I have a system. I always have a system.",reward:'"Exactly my order. We are aligned."'},
   {type:'approvalchain',chain:['Employee','HR','Manager','Brana'],hint:'Absence form goes up the chain. Who signs last?',ask:"Someone filed an absence form. Route it up the chain in the right order.",reward:'"Filed. Chronologically. Immaculately."'},
   {type:'voicemail',pool:['Tuesday','Thursday','Friday','Monday','Wednesday'],ask:"Someone left a day-by-day voicemail — remember and type back only the LAST day mentioned.",reward:'"Correct. I already knew, but I tested you."'},
   {type:'binary',val:7,ask:"Access code for the archive room is 7 in binary. Set the light panel correctly.",reward:'"Correct pattern. The archive is yours. Briefly."'},
   {type:'stopwatch',ms:3000,ask:"Time how long Teonem's been gone. Stop the watch at exactly 3 seconds — I\'m calibrating my estimates.",reward:'"3.0 seconds. My internal clock was right. As always."'},
   {type:'dodge',ask:"HR memo flood — dodge the irrelevant ones, let the important ones through.",reward:'"Perfect filter. I read everything anyway."'},
   {type:'jam',ask:"Office printer jammed mid-document — clear the jam sequence before anyone notices.",reward:'"Unjammed. Document: attendance report. Asking for a friend."'},
   {type:'qralign',ask:"Visitor badge QR needs scanning — line it up before they realize I\'ve been watching.",reward:'"Scanned. Visitor logged. I do not track people."'},
   {type:'inbox',emails:[{from:'Teonem',sub:'Working from "client site"',type:'spam'},{from:'HR',sub:'Attendance policy update',type:'urgent'},{from:'Pedja',sub:'Lunch order question',type:'safe'},{from:'Unknown',sub:'You\'ve been selected!',type:'spam'},{from:'Nino',sub:'Staff meeting NOW',type:'urgent'}],ask:"My inbox has noise. Flag urgent, file safe, delete spam. You know the drill.",reward:'"Perfect sort. I would have done the same. Exactly the same."'},
   {type:'wordle',word:'WATCH',ask:"Five letters. What I always do. Guess it.",reward:'"WATCH. Correct. I neither confirm nor deny."'},
   {type:'minesweeper',size:4,mines:3,ask:"Office seating grid — identify the problem areas without triggering a complaint.",reward:'"All clear. Problems identified. Quietly noted."'},
   {type:'hidden',items:[{label:'Log',emoji:'📒',x:50,y:60},{label:'Badge',emoji:'🪪',x:190,y:100},{label:'Pen',emoji:'🖊️',x:260,y:150}],ask:"My observation log, a visitor badge, and my pen — find them in this desk mess.",reward:'"All found. The system works. I have a system."'},
   {type:'merge2048',target:64,ask:"Attendance numbers — merge the daily counts into the weekly total.",reward:'"64. Exactly right. Every head counted."'},
   {type:'pipe',size:4,ask:"Office network cable layout needs fixing — rotate the segments to reconnect every desk without loops.",reward:'"Connected. Every desk online. I was watching the whole time."'},
   {type:'typingtest',passage:'All staff are reminded that arrival before 09:00 is mandatory.',ask:"Type this memo exactly — every character matters when you're documenting attendance policy.",reward:'"Typed and sent. Timestamped. Filed. Obviously."'}
 ]},
 sonja:{desc:'Quiet, runs payroll',home:{x:4,y:11},pool:[
   {type:'deliver',item:'router',itemLabel:'the router',to:'nino',ask:"Payroll needs internet. Give the router to Steve — he's the IT guy.",reward:'barely audible: "...thank you."'},
   {type:'type',word:'PAYROLL',ask:"Type the confirmation so salaries send. Quietly.",reward:'*nods* "Sent." *whisper*'},
   {type:'math',ask:"Double-check this payslip total for me?",reward:'"...exact. Good." *soft smile*'},
   {type:'fetch',item:'invoice',itemLabel:'an invoice',ask:"An invoice is on the far desk. Bring it, please.",reward:'"...perfect. Filed."'},
   {type:'pincode',ask:"Remember the payroll safe code. Do not say it aloud.",reward:'*nods slowly* "...correct."'},
   {type:'slider',ask:"Set the bonus rate to the agreed number. Exactly.",reward:'"...that is it. Approved." *whisper*'},
   {type:'sortorder',ask:"Order these payslips by amount. Quietly.",reward:'"...sorted. Thank you."'},
   {type:'count',ask:"Count the pending reimbursements for me?",reward:'"...yes. That many. Noted."'},
   {type:'target',ask:"Pick amounts that sum exactly to the payroll total.",reward:'"...balanced to the cent. Rare."'},
   {type:'oddeven',ask:"Valid invoices are even, odd are errors. Sort them, please.",reward:'"...all correct. So quiet. So precise."'},
   {type:'typerace',word:'APPROVED',ask:"Bank portal times out fast — type it before the clock!",reward:'"...made it. Everyone gets paid."'},
   {type:'dial',hint:'Dial in the safe combination.',ask:"Guess the safe combination. Not that I would ever forget it myself.",reward:'"...got it. Not that I would ever forget it myself."'},
   {type:'budget',ask:"Split this bonus pool so it adds up exactly. No more, no less.",reward:'"...balanced perfectly. Thank you."'},
   {type:'splice',pairs:[['ID-104 (junior)','\u20ac1.450'],['ID-207 (senior)','\u20ac2.900'],['ID-311 (intern)','\u20ac600']],hint:'Match each employee to the right salary.',ask:"Match each employee ID to their salary line. Quietly.",reward:'"...all matched. Nobody overpaid. Nobody underpaid."'},
   {type:'echo',ask:"Repeat this growing account number back to me. Do not lose a digit.",reward:'"...correct. Every digit." *whisper*'},
   {type:'noise',real:'INV-207 \u20ac1.850 DUE',fakes:['INV-201 \u20ac920 PAID','INV-114 \u20ac340 PAID','INV-166 \u20ac780 PAID','INV-090 \u20ac210 PAID'],hint:'Find the one UNPAID invoice.',ask:"One invoice in this ledger is still unpaid. Find it.",reward:'"...there it is. Caught before it caused trouble."'},
   {type:'priority',cards:[{l:'Salaries (today!)',p:1},{l:'Office rent',p:2},{l:'Software licenses',p:3},{l:"Nino's new chair",p:4}],hint:'What gets paid first?',ask:"Not everything can be paid today. Order the payments, please.",reward:'"...salaries first. Always. Good."'},
   {type:'cash',ask:"Count the petty-cash drawer to the exact figure. Quietly.",reward:'"...balances to the cent. Perfect."'},
   {type:'choose',q:'Payroll hotline is ringing — pick the professional reply.',opts:[{t:'"Payroll, this is Sonja, how can I help?"',ok:true},{t:'"What."',ok:false},{t:'"Call back later, obviously."',ok:false}],ask:"Phone won't stop ringing. Answer it properly, please.",reward:'"...good. Professional. Quietly proud."'},
   {type:'memory',ask:"Remember the voicemail number, then play it back for me. Quietly.",reward:'"...correct. Not one digit off."'},
   {type:'budgetslider',targets:[40,35,25],labels:['Salaries','Operations','Reserves'],ask:"Set the budget split to the agreed percentages. Exactly.",reward:'"...precise. That\'s the word."'},
   {type:'redact',sentences:['Salary: EUR 2850 gross for Teonem','Bonus: EUR 400 approved by Nino','Account: HR9876543210987654'],sensitive:['EUR 2850','EUR 400','HR9876543210987654'],ask:"This payslip must not leave with numbers visible. Redact.",reward:'"...thank you. Quietly."'},
   {type:'rotary',combo:[20,50,80],hint:'Spin to each number and press SET.',ask:"Spin the petty cash safe combination. Slowly. Exactly.",reward:'"...correct. Every cent accounted for."'},
   {type:'contract',fields:['Employee signature','HR signature','Effective date'],ask:"New hire contract needs every field signed before their start date. Scroll and sign.",reward:'"...filed. Quietly."'},
   {type:'toggle',hint:'Toggle only the approved bonus items — match HR guidelines.',ask:"Bonus eligibility flags need to match the policy doc — toggle them correctly.",reward:'"...matches policy. Precisely."'},
   {type:'voicemail',pool:['invoice','payment','transfer','balance','receipt'],ask:"Accounting voicemail had five terms — type back the last one you heard.",reward:'"...correct. Every word matters."'},
   {type:'frequency',target:97,hint:'Tune to 97 FM for the payroll compliance broadcast.',ask:"Tune the office radio to 97.0 — compliance update is broadcasting now.",reward:'"...97.0. On time. Always."'},
   {type:'conveyor',target:'📄',fakes:['📧','📁','📊'],ask:"Payslips coming off the printer belt — catch only the payslips, nothing else.",reward:'"...all payslips caught. Not one misfiled."'},
   {type:'gauge',ask:"Tax calculation is running — watch the progress gauge and stop it exactly at 100%. Not 99. Not 101.",reward:'"...100.0. Precisely. Of course."'},
   {type:'patchline',pairs:[['Sonja','Payroll extension'],['Nino','Director line'],['HR','Compliance desk']],hint:'Drag a line from each person to their extension.',ask:"Phone routing got reset again. Patch each person back to their correct line.",reward:'"...patched. Quietly efficient."'},
   {type:'circuit',ask:"Accounting software threw a fault — trace the circuit to find the broken connection.",reward:'"...found it. Third node. Fixed."'},
   {type:'cableroute',ask:"Server room cables got shuffled during the audit — route the payroll server back to the right port.",reward:'"...correct port. Payroll system online."'},
   {type:'wordle',word:'GROSS',ask:"Payroll term. Five letters. You should know this one.",reward:'"...GROSS. Yes. Before deductions."'},
   {type:'minesweeper',size:4,mines:2,ask:"Budget grid — identify the safe spending areas without triggering an overage.",reward:'"...all clear. Budget intact."'},
   {type:'hidden',items:[{label:'Payslip',emoji:'📄',x:70,y:80},{label:'Stamp',emoji:'🔏',x:200,y:50},{label:'Calc',emoji:'🖩',x:150,y:140}],ask:"The payslip, the approval stamp, and the calculator — somewhere on this desk.",reward:'"...found. Quietly efficient."'},
   {type:'flowfree',size:4,pairs:[{color:'#e03030',from:[0,0],to:[3,2]},{color:'#2e7d46',from:[0,3],to:[3,0]},{color:'#1565c0',from:[1,1],to:[3,3]}],ask:"Route the salary transfers through the correct bank channels — no crossings.",reward:'"...all routed. Transfers processing."'},
   {type:'typingtest',passage:'Salary transfer confirmed. Net amount: EUR 2,850.00. Reference: PAY-2024-047.',ask:"Type the salary confirmation exactly before the banking window closes.",reward:'"...sent. To the cent. As always."'}
 ]},
 pedja:{desc:'Ex-waiter, 2m tall, rookie',home:{x:4,y:3},pool:[
   {type:'timing',ask:"Holding a glass on the top shelf — say NOW at the right moment.",reward:'*hops down* "No tip, but we are good."'},
   {type:'mash',ask:"Huge lunch order — mash SPACE to carry all the trays!",reward:'"Ten plates, one hand. Waiter life."'},
   {type:'choose',q:'What does a real waiter never forget?',opts:[{t:'Who ordered what',ok:true},{t:'The wifi pass',ok:false},{t:'His own name',ok:false}],ask:"Quiz me, what does a pro never mess up?",reward:'"Exactly. Old habits."'},
   {type:'catch',ask:"Trays are falling off the counter — catch them!",reward:'"Not a single one dropped. Reflexes!"'},
   {type:'reflex',ask:"Order is up at the pass — grab it the second the bell rings.",reward:'"Fastest hands in the building."'},
   {type:'balance',ask:"Balance the tray of coffees across the room. Steady, tall guy.",reward:'"Not a drop spilled. Waiter mode."'},
   {type:'stack',ask:"Stack the clean plates without toppling them.",reward:'"Neat tower. Just like the old job."'},
   {type:'whack',ask:"Buzzers going off at every table — tap them fast!",reward:'"Served all six. Big tip energy."'},
   {type:'qte',ask:"Rush hour combo — fire off the orders in sequence!",reward:'"Flawless service. Chef kiss."'},
   {type:'moving',ask:"The lunch delivery guy keeps wandering — catch him, three taps!",reward:'"Got him. Food is safe."'},
   {type:'stopwatch',ask:"Espresso needs exactly 3 seconds. Stop the clock dead on.",reward:'"Perfect shot. Barista blood."'},
   {type:'jenga',ask:"Clear the stacked chairs without toppling the whole pile.",reward:'"Not one chair fell. Two meters of pure control."'},
   {type:'maze',ask:"Weave the food cart through the packed lunch crowd.",reward:'"Delivered hot. Never spilled a drop."'},
   {type:'signal',ask:"The kitchen bell rings on a rhythm — catch it at the peak.",reward:'"Order is up, right on the beat."'},
   {type:'pairs',ask:"Match each table number to its order ticket.",reward:'"All matched. Old habits really do stick."'},
   {type:'overload',ask:"Two tables calling at once — keep them both happy.",reward:'"Both served. Waiter reflexes never left."'},
   {type:'priority',cards:[{l:'Food is getting cold',p:1},{l:'Refill drinks',p:2},{l:'Wipe table 4',p:3},{l:'Chat with regulars',p:4}],hint:'Waiter instincts: what first?',ask:"Rush hour test: what does a waiter do first?",reward:'"Cold food is a crime. You get it."'},
   {type:'recipe',ask:"Old waiter skills — make the boss's coffee to the exact recipe.",reward:'"Nailed the measures. Some things you don\'t forget."'},
   {type:'park',ask:"New guy job: park the client's car in the bay. No scratches, please.",reward:'"Parked clean. Rookie\'s earning his keep."'},
   {type:'scrub',ask:"Give the showroom car a wash — scrub every dirty patch.",reward:'"Spotless. I miss bussing tables less now."'},
   {type:'checklist',items:['Tires','Fuel','Lights','Mirrors','Paperwork'],ask:"Delivery vehicle needs the full check before it leaves. Every item, fast.",reward:'"All checked. Ready to roll."'},
   {type:'gauge',ask:"Fill the tank for delivery — don't overshoot, don't undershoot.",reward:'"Tank\'s full. Didn\'t spill a drop, this time."'},
   {type:'count',ask:"Count what's missing from the supply shelf and restock exactly that much.",reward:'"Shelf\'s full again. Rookie delivers."'},
   {type:'flowchart',tree:{q:'Table needs attention?',yes:{q:'Food or service issue?',yes:{end:true,win:true},no:{end:true,win:false}},no:{q:'Pre-clean next table?',yes:{end:true,win:true},no:{end:true,win:false}}},hint:'Follow the waiter decision tree.',ask:"Walk me through the waiter decision tree — test your instincts.",reward:'"Right call. Old habits."'},
   {type:'hotkey',items:[{k:'T',l:'Tables'},{k:'K',l:'Kitchen'},{k:'M',l:'Manager'},{k:'B',l:'Bar'}],target:'K',ask:"Rush hour call — keyboard only. Where do I route this order?",reward:'"Kitchen gets it. No fumbling."'},
   {type:'heatmap',zones:['Burger station','Drinks bar','Dessert shelf','Register'],hotIdx:0,hint:'Which station gets the most customer attention during lunch?',ask:"Check the lunch rush heatmap — which station has the most traffic right now?",reward:'"Burger station always. Never changes."'},
   {type:'conveyor',target:'\uD83C\uDF7D',fakes:['\uD83E\uDDD2','\uD83E\uDDE2','\uD83D\uDCF1'],ask:"Plates coming off the kitchen belt fast — grab only the food plates, not the junk.",reward:'"Five plates, zero drops. Beautiful."'},
   {type:'slot',target:[0,0,0],hint:'Stop all three reels on the money sign.',ask:"Triple tips day! Stop the reels on the jackpot — all three match.",reward:'"Jackpot shift. Best day ever."'},
   {type:'pricetag',items:[{name:'House special',price:'€14'},{name:'Side salad',price:'€5'},{name:'Espresso',price:'€2'}],hint:'Drag each price to the right menu item.',ask:"New menu, new prices — drag each price tag to the right dish before service starts.",reward:'"Correct prices. Service ready."'},
   {type:'whiteboard',pts:[[20,80],[80,30],[160,50],[220,110],[160,150]],ask:"Draw the delivery route on the whiteboard map — hit every stop in order.",reward:'"Route mapped. Efficient. Rookie instincts."'},
   {type:'rhythm',ask:"Kitchen prep has a rhythm — tap along to keep pace with the orders. Old habit.",reward:'"In the groove. Chef would be proud."'},
   {type:'slider',ask:"Find the sweet spot on the sauce recipe — not too much, not too little. Feel it out.",reward:'"Perfect balance. Two years of that trains the hand."'},
   {type:'higherlower',ask:"Guess the table number the big order went to. I\'ll say warmer or colder.",reward:'"Table 12. Waiter memory never fades."'},
   {type:'voltage',ask:"Kitchen equipment on three circuits — keep them all green during the dinner rush.",reward:'"All green. Didn\'t blow a single breaker."'},
   {type:'oddeven',ask:"Odd tables get the fixed menu, even tables get à la carte. Sort them fast.",reward:'"Split perfectly. Old instincts, new job."'},
   {type:'wordle',word:'TABLE',ask:"Five letters. Where I spent five years of my life. Guess it.",reward:'"TABLE. Yeah. Good times, low pay."'},
   {type:'minesweeper',size:5,mines:4,ask:"Kitchen floor has wet spots — map the safe path to the service station without slipping.",reward:'"Safe route found. No incidents. Waiter instincts."'},
   {type:'hidden',items:[{label:'Tray',emoji:'🍽️',x:90,y:60},{label:'Timer',emoji:'⏱️',x:220,y:130},{label:'Ticket',emoji:'🎫',x:140,y:160}],ask:"Lost the service tray, the kitchen timer, and a table ticket. Classic Pedja.",reward:'"All found. Service resumes."'},
   {type:'merge2048',target:64,ask:"Table numbers are getting doubled up — merge them before service starts.",reward:'"Sorted. Clean floor plan. Ready to serve."'},
   {type:'flowfree',size:4,pairs:[{color:'#e03030',from:[0,0],to:[3,1]},{color:'#2e7d46',from:[0,3],to:[2,0]},{color:'#b07d18',from:[1,2],to:[3,3]}],ask:"Route the food orders from kitchen to tables without blocking the aisle.",reward:'"Every table served. Zero collisions. Waiter brain."'},
   {type:'tetris',lines:4,ask:"Stockroom delivery just came in — stack the boxes to clear space. Four rows at least.",reward:'"Four rows cleared. I have a gift for this apparently."'},
   {type:'typingtest',passage:'Table 4 ordered two specials, one soup, and three espressos.',ask:"Read back the order ticket to the kitchen — type it exactly before they start the wrong dish.",reward:'"Perfect read-back. Chef didn\'t even glare."'}
 ]},
 nina:{desc:"Boss's daughter, control freak",home:{x:13,y:9},pool:[
   {type:'simon',ask:"Do EXACTLY as I say, in order. Because I am always right. Repeat.",reward:'"See? Works when you listen to ME."'},
   {type:'type',word:'YES NINA',ask:"Type it. You know the magic words.",reward:'*smiles* "Good. Was not hard, was it."'},
   {type:'choose',q:'Nina says the sky is green. You say:',opts:[{t:'"You are right, Nina."',ok:true},{t:'"It is blue."',ok:false},{t:'Say nothing',ok:false}],ask:"The sky is green today. RIGHT?",reward:'"Obviously. I am always right."'},
   {type:'sequence',ask:"Repeat my priority list. In MY order. Exactly.",reward:'"Finally, someone competent."'},
   {type:'avoid',ask:"Approve MY ideas, reject everyone else's.",reward:'"Correct. My ideas are the best ideas."'},
   {type:'colormatch',ask:"Match the brand color I picked. It is the only right one.",reward:'"Obviously. My taste is flawless."'},
   {type:'trace',ask:"Follow my org chart, top to bottom. Me near the top.",reward:'"Good. Now you know the hierarchy."'},
   {type:'lockpick',ask:"Get into Dad's office. I am allowed. I said so.",reward:'"See? Rules do not apply to me."'},
   {type:'impostor',word:'YES NINA',odd:'actually, no',hint:'Four agree with her. Find the traitor.',ask:"Someone disagreed with me. Find the traitor.",reward:'"Knew it. Nobody disagrees with me."'},
   {type:'reverse',ask:"Now do my instructions BACKWARDS. Keep up. I invented this.",reward:'"Acceptable. I made you better today."'},
   {type:'gridmem',ask:"Memorize MY new seating chart. There will be a test. This is it.",reward:'"Correct. I assign, you remember."'},
   {type:'rank',items:["Nina's idea","Dad's idea","Client's request",'YOUR idea'],hint:'Drag to reorder. Hers goes first. Obviously.',ask:"Sort these by importance — mine first, obviously.",reward:'"Correct order. Mine is always first."'},
   {type:'echo',ask:"Repeat my growing list of demands. Don't fall behind.",reward:'"Good. You kept up with all of them."'},
   {type:'crack',ask:"Guess what I'm REALLY thinking. Hint: I'm always right.",reward:'"You got it eventually. Slow, but fine."'},
   {type:'forge',recipe:["NINA'S VISION",'EXECUTION','CREDIT TO NINA'],extra:['TEAM CREDIT','HUMILITY'],ask:"Combine everyone's ideas so mine comes out on top.",reward:'"See? Mine wins every time. As it should."'},
   {type:'overload',ask:"I need two things done AT ONCE. Both are urgent. Obviously.",reward:'"Finally, someone who can multitask like me."'},
   {type:'noise',real:'Nina approved this',fakes:['Team approved this','Nino approved this','Client approved this','HR approved this'],hint:'Find the only approval that counts.',ask:"Find the ONLY approval that matters in this pile.",reward:'"Correct. Mine. The rest are suggestions."'},
   {type:'dragfile',ask:"These files are in the WRONG folders. Fix it. Properly. My way.",reward:'"Finally organized. Was that so hard?"'},
   {type:'inspect',ask:"Inspect the returned vehicle — find every scratch. Miss nothing.",reward:'"Three flaws. I\'d have found a fourth. Good enough."'},
   {type:'arrange',items:[['🪑','chair'],['📽️','proj'],['💻','laptop']],hint:'Drag each item onto its marked spot. My way, exactly.',ask:"Set up the meeting room. Chair, projector, laptop — precisely where I want them.",reward:'"Perfect. Finally, someone who listens."'},
   {type:'pincode',ask:"Memorize the conference dial-in code. I will not repeat it. I already didn't.",reward:'"Correct. Obviously. I chose that code."'},
   {type:'crossword',clues:[{hint:'Top of the org chart (name)',ans:'NINA'},{hint:'Runs payroll (name)',ans:'SONJA'},{hint:'Always out of office (name)',ans:'TEONEM'}],ask:"Fill in my org chart crossword. My way. Correctly.",reward:'"Correct. Obviously."'},
   {type:'budgetslider',targets:[60,25,15],labels:['My projects','Team','Misc'],ask:"Set the project budget allocation. My priorities first. Obviously.",reward:'"Perfect percentages. Finally."'},
   {type:'voltage',ask:"Running three approval processes simultaneously — keep all systems green until they finish.",reward:'"All approved. Simultaneously. Flawlessly."'},
   {type:'heatmap',zones:['My desk','Meeting room','Coffee corner','Entrance'],hotIdx:0,hint:'Where is the most important activity in this office happening?',ask:"Office heatmap — identify where the most critical work happens. Obviously.",reward:'"My desk. Obviously. Good."'},
   {type:'anagram',word:'REVIEW',ask:"Unscramble what I demand from everyone before anything ships.",reward:'"REVIEW. Yes. Obviously. Always."'},
   {type:'mirror',word:'APPROVE',ask:"My screen flipped again. Type APPROVE normally — display is mirrored.",reward:'"Approved. Even in mirror mode I am in control."'},
   {type:'pricetag',items:[{name:'Premium seat',price:'€200'},{name:'Standard seat',price:'€80'},{name:'Basic seat',price:'€40'}],hint:'Drag the price tags to the conference seats.',ask:"Conference room seating — drag the right price tag to each tier before clients arrive.",reward:'"Correct pricing. Premium goes to me, obviously."'},
   {type:'rolodex',cards:['Nino — Director','Sonja — Payroll','Daniel — Design','Me — Basically everything'],correctIdx:3,ask:"Who actually runs this company? Scroll to the right card. Obviously.",reward:'"Me. Obviously. I\'m glad we agree."'},
   {type:'voicemail',pool:['approved','rejected','pending','revised','escalated'],ask:"Five status updates on my voicemail — type back the last one. I delete as I go.",reward:'"Correct. Escalated. As it should be."'},
   {type:'wire',pairs:[['Nina','Final approval'],['Nino','Budget sign-off'],['Sonja','Payroll processing']],hint:'Connect each person to their actual responsibility.',ask:"New org chart — wire each person to their real role. My role is obvious.",reward:'"Wired correctly. Finally, clarity."'},
   {type:'cableroute',ask:"Conference room AV got scrambled before my presentation — route the signal back to the main screen.",reward:'"Connected. Presentation will be flawless. Obviously."'},
   {type:'approvalchain',chain:['Employee','Manager','Nina','Nino'],hint:'Every request goes through Nina before Nino. Obviously.',ask:"Someone submitted a request skipping me. Show them the correct approval chain.",reward:'"Through ME first. Always. Obviously."'},
   {type:'wordle',word:'RIGHT',ask:"Five letters. What I always am. You should get this immediately.",reward:'"RIGHT. Obviously. First try? Acceptable."'},
   {type:'minesweeper',size:4,mines:2,ask:"Meeting room booking grid — clear the available slots without double-booking my time.",reward:'"My time protected. Obviously."'},
   {type:'hidden',items:[{label:'Stamp',emoji:'✅',x:60,y:50},{label:'Remote',emoji:'📡',x:210,y:120},{label:'Marker',emoji:'🖍️',x:160,y:80}],ask:"My approval stamp, presentation remote, and marker are missing. Obviously someone moved them.",reward:'"Found. I\'ll be putting these in a locked drawer now."'},
   {type:'merge2048',target:128,ask:"Combine the project scores until they reach my minimum acceptable threshold.",reward:'"128. My minimum. Obviously achieved."'},
   {type:'flowfree',size:4,pairs:[{color:'#e03030',from:[0,0],to:[3,3]},{color:'#2e7d46',from:[0,2],to:[3,0]},{color:'#b07d18',from:[1,3],to:[3,1]}],ask:"Route the approval flows — every request must pass through the right chain. No shortcuts.",reward:'"All approved via the correct chain. Obviously."'},
   {type:'typingtest',passage:'This proposal is rejected. Please revise and resubmit by Friday.',ask:"Type my feedback email word for word. My rejection letters must be pristine.",reward:'"Sent. Devastating, yet professional. Obviously."'},
   {type:'pipe',size:4,ask:"Conference room AV routing is wrong again — rotate the signal pipes to connect source to screen. Obviously.",reward:'"Signal connected. Presentation will be flawless. Obviously."'}
 ]},
 daniel:{desc:'Designer, chill, big vibes',home:{x:4,y:5},pool:[
   {type:'choose',q:'Which design has the best vibe?',opts:[{t:'Clean & minimal',ok:true},{t:'5 fonts, 3 gradients',ok:false},{t:'Default bootstrap',ok:false}],ask:"Yo, which design has the best vibe? Just feel it. *smoke*",reward:'*thumbs up through haze* "Flawless vibe, respect."'},
   {type:'timing',ask:"Exporting the artboard — catch the perfect frame, man.",reward:'"Buttery. Respect."'},
   {type:'memory',ask:"Remember my palette order? Play it back, keep the vibe.",reward:'"Palette locked. Immaculate."'},
   {type:'scramble',word:'PIXELS',ask:"Unscramble what I obsess over.",reward:'*slow nod* "Yeah man. Every one of them."'},
   {type:'catch',ask:"Loose layers floating off the canvas — catch them, gently.",reward:'"Caught the vibe AND the layers. Respect."'},
   {type:'colormatch',ask:"Yo, match this hex to the vibe swatch, man.",reward:'"That is the one. Pure harmony."'},
   {type:'wire',pairs:[['--bg-primary','Canvas layer'],['--accent','CTA button'],['--muted','Placeholder text']],hint:'Connect each token to its layer.',ask:"Connect the color tokens to their layers. Keep it flowing.",reward:'"All wired up. The system breathes now."'},
   {type:'rhythm',ask:"Design has a rhythm too. Tap the grid beat.",reward:'"Yeah man. You feel the flow."'},
   {type:'spotdiff',ask:"One pixel is off in this row. Find it, it is killing me.",reward:'"THERE. Thank you. I can sleep now."'},
   {type:'reverse',ask:"Play my palette back... in reverse. Trust the process.",reward:'"Backwards AND beautiful. Deep."'},
   {type:'pairs',ask:"Match the color pairs, man. They belong together.",reward:'"Reunited. The canvas is at peace."'},
   {type:'stopwatch',ask:"Stop the render at exactly 3 seconds. The perfect frame lives there.",reward:'"Frame-perfect. That is art."'},
   {type:'forge',recipe:['BASE NAVY','WARM ACCENT','SOFT GLOW'],extra:['NEON GREEN','COMIC SANS'],ask:"Mix the brand palette in the right order — this matters, man.",reward:'"That gradient is *chef kiss*. Pure alchemy."'},
   {type:'noise',ask:"One layer is aligned right, the rest are off-grid. Find it.",reward:'"There. My eye was twitching. Fixed."'},
   {type:'maze',ask:"Route this shape through the canvas without clipping anything.",reward:'"Smooth path. No clipping. Respect."'},
   {type:'colormatch',ask:"Match each element to its drop-shadow style.",reward:'"Every shape found its shadow. Beautiful."'},
   {type:'signal',ask:"Catch the animation at its peak frame — that's the money shot.",reward:'"That is THE frame. Ship it."'},
   {type:'impostor',word:'#2E4A72',odd:'#2E4B72',hint:'Four identical hex codes. One is off by a digit.',ask:"One hex code is off by ONE digit and it is ruining my life. Find it.",reward:'"THERE. One digit. Chaos averted. Respect."'},
   {type:'proofread',ask:"Client ad has a typo somewhere, man. Find it before it ships.",reward:'"Caught it. Crisis averted. Respect."'},
   {type:'stack',ask:"Pack these prints into the shipping box, man — stack it steady, don't crush the corners.",reward:'"Boxed clean. Art survives shipping."'},
   {type:'splice',pairs:[['Poster set A','Box 1'],['Poster set B','Box 2'],['Poster set C','Box 3']],hint:'Match each label to the right box.',ask:"Label these boxes right, man, or the wrong client gets the wrong art.",reward:'"All matched. Aesthetic AND logistics. Respect."'},
   {type:'proofread',ask:"One more typo hunt — the slide deck footer this time, man. Find it.",reward:'"Clean. Ship it before anyone notices there was one."'},
   {type:'cableroute',ask:"Route the USB from my laptop to the projector — no crossing walls, man.",reward:'"Powered up. Design can begin."'},
   {type:'typewriter',word:'VIBES',ask:"Type the most important concept in design — letter by letter, man.",reward:'"VIBES confirmed. You understand."'},
   {type:'cipher',shift:2,raw:'DESIGN',ask:"Client encoded their brief. Shift 2 letters — which shift value cracks it?",reward:'"Decoded. Now I can feel the brief, man."'},
   {type:'wordsearch',words:['HUE','VIBE','FONT'],ask:"Find the three design fundamentals in this letter grid, man.",reward:'"All found. Typography is everywhere if you look."'},
   {type:'anagram',word:'CLIENT',ask:"Unscramble the most important word in my vocabulary, man.",reward:'"CLIENT. The whole reason we exist."'},
   {type:'toggle',hint:'Toggle the right export switches — only PNG and SVG on.',ask:"Export settings got reset — toggle back to PNG and SVG only. Nothing else.",reward:'"Export clean. File system thanks you."'},
   {type:'whiteboard',pts:[[30,40],[120,20],[200,80],[160,140],[80,130]],ask:"Sketch the design flow on the whiteboard — connect the dots in order.",reward:'"Flow is mapped. Beautiful process."'},
   {type:'anagram',word:'CANVAS',ask:"Unscramble the word for my workspace. It\'s also an app I built.",reward:'"CANVAS. Obviously. Named it myself."'},
   {type:'whiteboard',pts:[[30,30],[130,20],[220,70],[200,140],[100,150]],ask:"Storyboard the client presentation — connect the slides on the whiteboard in order.",reward:'"Flow is perfect. Client won\'t know what hit them."'},
   {type:'binary',val:10,ask:"The client\'s revision count is 10 — flip the binary light panel to match.",reward:'"Ten revisions in binary. The client\'s lucky I\'m patient."'},
   {type:'park',ask:"Design expo parking — squeeze the van (with all the equipment) into the last spot. Don\'t scratch the vibe.",reward:'"Parallel parked. The equipment is safe. The vibe is intact."'},
   {type:'cash',ask:"Client paid the invoice in cash — count it out and confirm before I issue the receipt.",reward:'"Counted. Exact. Even the design industry runs on money, man."'},
   {type:'moving',ask:"New office layout — catch the furniture pieces as they move into the right spots.",reward:'"Every piece landed right. Space has intention now."'},
   {type:'qte',ask:"Client presentation combo — advance slides, dim lights, click demo, all in sequence. Go.",reward:'"Flawless execution. The room was speechless."'},
   {type:'redact',sentences:['Client budget: €45,000 for full rebrand','Contact: Ana Kovač, CEO +385 99 111 2233','Deadline: confidential — before competitor launch'],sensitive:['€45,000','Ana Kovač, CEO +385 99 111 2233','confidential'],ask:"Agency brief before sending to the printer — redact the sensitive bits.",reward:'"Redacted. Brief is clean. Printer gets the safe version."'},
   {type:'wordle',word:'PIXEL',ask:"Five letters. The smallest unit of my universe. You know this one.",reward:'"PIXEL. Obviously. I think in them."'},
   {type:'minesweeper',size:5,mines:3,ask:"Design grid with broken nodes — find the safe layout zones without triggering a client complaint.",reward:'"Clean grid. Zero broken layouts. Designer magic."'},
   {type:'hidden',items:[{label:'Stylus',emoji:'✏️',x:80,y:60},{label:'Tablet',emoji:'📱',x:220,y:100},{label:'Swatch',emoji:'🎨',x:130,y:160}],ask:"Lost my stylus, drawing tablet, and color swatch before the client meeting. Very chill about it.",reward:'"Found everything. Vibes restored. Let\'s create."'},
   {type:'merge2048',target:256,ask:"Layer complexity — merge the design iterations until the concept reaches full resolution.",reward:'"256. Full resolution. The client will love it."'},
   {type:'flowfree',size:5,pairs:[{color:'#e03030',from:[0,0],to:[4,4]},{color:'#2e7d46',from:[0,4],to:[4,0]},{color:'#1565c0',from:[2,0],to:[2,4]},{color:'#b07d18',from:[0,2],to:[4,2]}],ask:"Connect the design system tokens to their components — every cell must flow.",reward:'"Fully connected system. Every token placed. Beautiful."'},
   {type:'tetris',lines:3,ask:"Artboard layers are piling up in the wrong order — stack them clean. Three layers cleared.",reward:'"Layer stack is immaculate. The file is breathable now."'},
   {type:'typingtest',passage:'Final designs attached. Please review by EOD and confirm approval.',ask:"Type the handoff email to the client. Clean copy, no typos — this is the final impression.",reward:'"Sent. Professional. The client will feel the care."'},
   {type:'pipe',size:4,ask:"Design file export pipeline broke — rotate the nodes to reconnect the output stream.",reward:'"Export flowing. Files delivered. Smooth."'}
 ]},
};

// Ambient "thought bubble" lines — fire randomly while an NPC is just standing/wandering,
// no interaction needed. Pure flavor, matches each character's `desc` trait.
const IDLE_LINES={
  dejan:["Need a smoke in 5.","Gromix compiles... probably.","One more coffee.","Where's my lighter...","Terrace. Now."],
  teonem:["Client's calling again.","'Out in town', as always.","Big deal closing, trust me.","Gotta run — meeting.","Sales never sleeps."],
  steve:["*vape cloud*","Zagreb client's happy.","Beard's getting long.","Croatia's booming, boss.","One more puff."],
  brana:["...I see everything.","Noted. *writes it down*","Watching. Always watching.","Interesting... very interesting.","Nothing gets past me."],
  sonja:["Payroll doesn't run itself.","Numbers check out.","Quiet day, good day.","Don't ask me twice.","Almost done reconciling."],
  pedja:["Two meters of nerves.","Still learning the ropes.","Was easier waiting tables.","Hope I don't mess this up.","Getting the hang of it!"],
  nina:["This desk needs realigning.","Everything has its place.","Dad's watching, be sharp.","Control the chaos.","Not good enough. Again."],
  daniel:["*adjusts palette* ...nice.","Big vibes today, man.","This gradient though.","Design's basically therapy.","Feeling the flow."],
};
function randIdleLine(id){const arr=IDLE_LINES[id];return arr?arr[Math.floor(Math.random()*arr.length)]:'';}

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
function onTerrace(){const t=MAP[Math.floor(player.y/TS)]?.[Math.floor(player.x/TS)];return t===10||t===11;}
function tryCigarette(){ // F key dispatcher based on who you play
  if(state!=='play'||dialogOpen||miniOpen)return;
  if(smoking||vaping||biking||petting)return;
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
  // legs
  g.fillStyle=look.pants;g.fillRect(-s*3,s*3,s*2.4,s*5);g.fillRect(s*0.6,s*3,s*2.4,s*5);
  // body
  g.fillStyle=look.shirt;g.fillRect(-s*wdt/2,-s*3,s*wdt,s*7);
  // boss tie
  if(look.boss){g.fillStyle='#8a2e2e';g.fillRect(-s*0.7,-s*3,s*1.4,s*5);}
  // arms
  g.fillStyle=look.shirt;g.fillRect(-s*wdt/2-s*1.6,-s*2.5,s*1.6,s*5);g.fillRect(s*wdt/2,-s*2.5,s*1.6,s*5);
  g.fillStyle=look.skin;g.fillRect(-s*wdt/2-s*1.6,s*2,s*1.6,s*1.6);g.fillRect(s*wdt/2,s*2,s*1.6,s*1.6);
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
  allTasks().forEach(t=>{if(!t.done&&t.type==='fetch')need[t.item]=ITEM_SPOTS[t.item];});return need;}
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
function openMini(title,desc,useTimer){miniOpen=true;
  setMiniBackdrop();
  document.getElementById('miniTitle').textContent=title;document.getElementById('miniDesc').textContent=desc;
  const st=document.getElementById('miniStage');st.innerHTML='';
  document.getElementById('mini').style.display='flex';
  const tm=document.getElementById('miniTimer');tm.style.display=useTimer?'block':'none';
  if(useTimer)document.getElementById('miniTimerFill').style.width='100%';
  return st;}
function closeMini(){miniOpen=false;document.getElementById('mini').style.display='none';
  if(activeKeyHandler){document.removeEventListener('keydown',activeKeyHandler);activeKeyHandler=null;}}
function fail(n,msg){if(!testMode){week.streak=0;week.dayFails++;updateHUD();}const b=document.getElementById('miniBox');if(miniOpen&&b){b.classList.add('bad');setTimeout(()=>{b.classList.remove('bad');closeMini();openDialog(n.name,msg,[{label:'Ok',fn:closeDialog}]);},380);}else{closeMini();openDialog(n.name,msg,[{label:'Ok',fn:closeDialog}]);}}
function miniWin(n,t){const b=document.getElementById('miniBox');if(miniOpen&&b){b.classList.add('win');setTimeout(()=>{b.classList.remove('win');closeMini();finish(n,t);},470);}else{closeMini();finish(n,t);}}
function setKey(fn){if(activeKeyHandler)document.removeEventListener('keydown',activeKeyHandler);
  activeKeyHandler=fn;document.addEventListener('keydown',fn);}
function countdown(sec,onExpire){const fill=document.getElementById('miniTimerFill');let start=Date.now();
  const iv=setInterval(()=>{const el=(Date.now()-start)/1000;const left=Math.max(0,sec-el);
    fill.style.width=(left/sec*100)+'%';if(left<=0){clearInterval(iv);onExpire();}},50);return ()=>clearInterval(iv);}

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
  typingtest:miniTypingTest,tetris:miniTetris,pipe:miniPipe})[t.type](n,t);}

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
  for(const k in spots){const s=spots[k];if(!s)continue;
    const px=s.x*TS+TS/2,py=s.y*TS+TS/2,b=Math.sin(Date.now()/300)*3;
    // soft glow pad under the item
    ctx.save();ctx.translate(px,py);
    const g=ctx.createRadialGradient(0,4,2,0,4,18);g.addColorStop(0,'rgba(232,185,60,.45)');g.addColorStop(1,'rgba(232,185,60,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,4,18,9,0,0,7);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(px,py+b);ctx.lineJoin='round';
    const OL=(x,y,w,h)=>{ctx.strokeStyle='rgba(40,30,18,.55)';ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);};
    if(s.icon==='doc'){ // papers — a small fanned stack
      ctx.fillStyle='#d9cfae';ctx.fillRect(-7,-7,13,16);ctx.fillStyle='#f6efdb';ctx.fillRect(-6,-9,13,16);OL(-6,-9,13,16);
      ctx.fillStyle='#8a6a3a';ctx.fillRect(-3,-6,8,1.6);ctx.fillRect(-3,-2,8,1.6);ctx.fillRect(-3,2,5,1.6);}
    else if(s.icon==='inv'){ // invoice — paper with a red stamp + $ column
      ctx.fillStyle='#f6efdb';ctx.fillRect(-6,-9,13,17);OL(-6,-9,13,17);
      ctx.fillStyle='#7a5a30';ctx.fillRect(-4,-6,9,1.4);ctx.fillRect(-4,-3,9,1.4);ctx.fillRect(-4,0,6,1.4);
      ctx.fillStyle='#2e7d46';ctx.font='bold 6px monospace';ctx.textAlign='left';ctx.fillText('$',-4,7);
      ctx.strokeStyle='#c0392b';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(3,4,3.2,0,7);ctx.stroke();}
    else if(s.icon==='cig'){ // cigarette pack + one stick out
      ctx.fillStyle='#e8ecef';ctx.fillRect(-8,-2,13,10);OL(-8,-2,13,10);
      ctx.fillStyle='#c0392b';ctx.fillRect(-8,-2,13,3);
      ctx.fillStyle='#f7f4ee';ctx.fillRect(2,-8,3,7);ctx.fillStyle='#e8a03c';ctx.fillRect(2,-8,3,2);}
    else if(s.icon==='vape'){ // sleek vape pen with lit tip + vapor
      ctx.fillStyle='#2b2b36';ctx.fillRect(-3,-9,7,18);OL(-3,-9,7,18);
      ctx.fillStyle='#7ec8e8';ctx.fillRect(-1.5,-6,4,5);
      ctx.fillStyle='#e86b4a';ctx.fillRect(-1.5,-9,4,1.6);
      ctx.fillStyle='rgba(220,235,245,.5)';ctx.beginPath();ctx.arc(0.5,-12,2,0,7);ctx.arc(2,-14,1.4,0,7);ctx.fill();}
    else if(s.icon==='ltr'){ // lighter with a flame
      ctx.fillStyle='#c0392b';ctx.fillRect(-4,-4,9,13);OL(-4,-4,9,13);
      ctx.fillStyle='#9aa0a6';ctx.fillRect(-3,-7,7,3);
      ctx.fillStyle='#f5a623';ctx.beginPath();ctx.moveTo(0.5,-8);ctx.quadraticCurveTo(3,-11,0.5,-14);ctx.quadraticCurveTo(-2,-11,0.5,-8);ctx.fill();
      ctx.fillStyle='#e86b4a';ctx.beginPath();ctx.moveTo(0.5,-9);ctx.quadraticCurveTo(1.6,-11,0.5,-12.5);ctx.quadraticCurveTo(-0.6,-11,0.5,-9);ctx.fill();}
    else if(s.icon==='rtr'){ctx.fillStyle='#2a2a34';ctx.fillRect(-10,-4,20,10);OL(-10,-4,20,10);ctx.fillStyle='#5aa848';ctx.fillRect(-6,-1,3,3);
      ctx.fillStyle='#555';ctx.fillRect(-8,-10,2,7);ctx.fillRect(6,-10,2,7);}
    else if(s.icon==='cup'){ctx.fillStyle='#f4ead2';ctx.fillRect(-6,-6,12,12);OL(-6,-6,12,12);ctx.fillStyle='#6b431f';ctx.fillRect(-4,-4,8,8);}
    else if(s.icon==='lap'){ctx.fillStyle='#3a3a44';ctx.fillRect(-9,-6,18,12);OL(-9,-6,18,12);ctx.fillStyle='#7ec8e8';ctx.fillRect(-7,-4,14,8);}
    ctx.restore();
    ctx.textAlign='center';ctx.font='bold 9px monospace';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(245,240,224,.9)';ctx.strokeText(k,px,py-16);
    ctx.fillStyle='#5a3517';ctx.fillText(k,px,py-16);}}

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

function drawMinimap(){
  const MW=110,MH=70,MX=viewW-MW-10,MY=viewH-MH-10,PAD=4;
  const scaleX=(MW-PAD*2)/(COLS*TS),scaleY=(MH-PAD*2)/(ROWS*TS);
  ctx.fillStyle='rgba(20,12,6,.82)';ctx.strokeStyle='rgba(200,160,80,.5)';ctx.lineWidth=1.5;
  const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();};
  rr(MX,MY,MW,MH,5);ctx.fill();ctx.stroke();
  const vpX=MX+PAD+camX*scaleX,vpY=MY+PAD+camY*scaleY,vpW=(viewW/camZoom)*scaleX,vpH=(viewH/camZoom)*scaleY;
  ctx.strokeStyle='rgba(220,180,80,.55)';ctx.lineWidth=1;ctx.strokeRect(vpX,vpY,vpW,vpH);
  NPCS.forEach(n=>{const dx=MX+PAD+n.x*TS*scaleX,dy=MY+PAD+n.y*TS*scaleY;ctx.fillStyle=npcDone(n)?'#5aa848':'#c9a86b';ctx.beginPath();ctx.arc(dx,dy,2.2,0,7);ctx.fill();});
  const px2=MX+PAD+player.x*scaleX,py2=MY+PAD+player.y*scaleY;ctx.fillStyle='#e86b4a';ctx.beginPath();ctx.arc(px2,py2,3,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px2,py2,1.5,0,7);ctx.fill();
}
function loop(){if(state==='end'||state==='paused')return;
  frame++;
  let moving=false;
  if(smoking&&Date.now()>smokeUntil)smoking=false;
  if(vaping&&Date.now()>vapeUntil)vaping=false;
  if(biking&&Date.now()>bikeUntil)biking=false;
  if(petting&&Date.now()>pettingUntil)petting=false;
  const frozen=smoking||vaping||petting; // biking still moves via animation, but block WASD
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
