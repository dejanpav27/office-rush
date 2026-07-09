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
  laptop:{x:7,y:7,icon:'lap'},invoice:{x:3,y:8,icon:'doc'},lighter:{x:14,y:4,icon:'ltr'},
};

/* character visual specs for pixel sprites */
const LOOKS={
  dejan:{skin:'#e8b88a',hair:'#6b4a2a',shirt:'#2e4a72',pants:'#333',glasses:true},
  teonem:{skin:'#e8b88a',hair:'#1f1f1f',shirt:'#8a2e3e',pants:'#2a2a3a'},
  steve:{skin:'#e8c49a',hair:'#7a5a35',shirt:'#3e6b3a',pants:'#3a3a3a',beard:true,wide:true},
  brana:{skin:'#e8b88a',hair:'#4a2a5a',shirt:'#6b3e8a',pants:'#333',long:true},
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
   {type:'count',ask:"Count the open terminal tabs. I lost track.",reward:'"Yeah, way too many. Closing some."'},
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
   {type:'splice',pairs:[['Black','Slot 1'],['Cyan','Slot 2'],['Magenta','Slot 3']],hint:'Match each cartridge to its slot.',ask:"Printer's out of ink and I need three colors right now. Load them right.",reward:'"Printing again. You just saved my afternoon."'},
 ]},
 teonem:{desc:'Sales, always "out in town"',home:{x:10,y:9},pool:[
   {type:'deliver',item:'contract',itemLabel:'contract',to:'nino',ask:"Running into town (work!). Take this contract to Nino.",reward:'"Legend. I never left, clear?" *left*'},
   {type:'choose',q:'Client wants a discount. Best move?',opts:[{t:'Offer a bundle',ok:true},{t:'Say no, hang up',ok:false},{t:'Ghost them',ok:false}],ask:"Coach me — client wants a discount.",reward:'"Closed it from the parking lot."'},
   {type:'timing',ask:"Calling a lead NOW — nail the send timing.",reward:'"Perfect timing. Signed."'},
   {type:'reflex',ask:"Lead picks up any second. Click GO the instant it appears.",reward:'"Caught them on ring one. Out."'},
   {type:'choose',q:'Voicemail or text a busy CEO?',opts:[{t:'Short text',ok:true},{t:'5-min voicemail',ok:false},{t:'Call 8 times',ok:false}],ask:"Busy CEO will not answer. What do I do?",reward:'"Reply in 2 min. Boom."'},
   {type:'dodge',ask:"Dodging awkward questions in the sales meeting — weave through!",reward:'"Deflected every one. Still closed."'},
   {type:'slider',ask:"Dial the discount to the exact sweet spot. Not a cent more.",reward:'"Perfect margin. That is the job."'},
   {type:'rhythm',ask:"Small talk has a rhythm. Match it, land the deal.",reward:'"Smooth as ever. Out the door."'},
   {type:'impostor',word:'READY TO BUY',odd:'JUST BROWSING',hint:'Four are buyers. Spot the time-waster.',ask:"One lead is a time-waster. Spot the odd one.",reward:'"Knew it. Not wasting my time."'},
   {type:'higherlower',ask:"Two offers on the table — always grab the bigger one. Three rounds.",reward:'"Maximum value, every time."'},
   {type:'moving',ask:"This client keeps dodging my calls — catch him! He moves.",reward:'"Cornered him by the printer. Signed."'},
   {type:'target',ask:"Build me a bundle that hits the exact price target.",reward:'"To the cent. You are wasted here."'},
   {type:'budget',ask:"Split my commission between three deals so it adds up right.",reward:'"Exactly what I earned. Nice math."'},
   {type:'priority',cards:[{l:'Signed LOI, wants call NOW',p:1},{l:'Asked for a quote',p:2},{l:'Opened the email twice',p:3},{l:'Unsubscribed (twice)',p:4}],hint:'Hottest lead first.',ask:"Rank these leads hottest to coldest before they go cold for real.",reward:'"Perfect order. That is how deals get closed."'},
   {type:'crack',ask:"Guess this client's real budget. I'll tell you higher or lower.",reward:'"Nailed it. Now watch me close this."'},
   {type:'signal',ask:"Catch the client mid-call at exactly the right beat to pitch.",reward:'"Timed it perfect. Pitch landed."'},
   {type:'overload',ask:"Two leads calling in at once — keep both warm, don't drop either.",reward:'"Both closed. I contain multitudes."'},
   {type:'splice',pairs:[['Objection: too expensive','Show ROI math'],['Objection: no time','Offer 15-min call'],['Objection: thinking','Book follow-up date']],hint:'Match each objection to the counter.',ask:"Match each client objection to the right counter-move.",reward:'"Textbook. You could sell air."'},
   {type:'calendar',ask:"Book me three demos this week — no clashes, I'm 'in town' a lot.",reward:'"Slotted clean. I close from anywhere."'},
   {type:'maze',ask:"Move this car to the showroom floor for me — don't scuff anything on the way.",reward:'"Parked pretty. Client\'s gonna love it."'},
   {type:'choose',q:'Client is picking up the car — what do you say?',opts:[{t:'Walk them through every feature, unhurried',ok:true},{t:'Toss the keys and wave',ok:false},{t:'Ask if they want the extended warranty five times',ok:false}],ask:"Handover time. Client's here for the car — do it right.",reward:'"Perfect handover. That\'s a referral right there."'},
 ]},
 steve:{desc:'Beard, vape, sells in Croatia',home:{x:4,y:2},pool:[
   {type:'fetch',item:'vape',itemLabel:'vape',ask:"Left my vape by the entrance. No fog, no deals.",reward:'*huge cloud* "Now we do business."'},
   {type:'timing',ask:"Calling Zagreb — catch the second to drop the offer.",reward:'"Bang on. Respect." *vapor*'},
   {type:'choose',q:'"Razmislit cu" means...?',opts:[{t:'"I will think about it" — follow up',ok:true},{t:'Hard no',ok:false},{t:'They said yes',ok:false}],ask:"Test my Croatian sales lingo.",reward:'"Tocno. You get it."'},
   {type:'scramble',word:'ZAGREB',ask:"Unscramble where my best client is.",reward:'"Haha, yeah. Booking a trip."'},
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
   {type:'splice',pairs:[['Golf GTI','ZG-341-KL'],['Passat','ZG-852-MN'],['Octavia','ZG-119-RT']],hint:'Match each car to its plate.',ask:"Match each car on the lot to its actual plate. Zagreb inventory's a mess.",reward:'*vapor* "All matched. Inventory\'s clean."'},
   {type:'crack',ask:"Which car is the client asking about? I'll say warmer or colder on the stock number.",reward:'*vapor* "That\'s the one. Good guess, chief."'},
   {type:'barcode',ask:"Parts shipment just came in from Zagreb — scan it in. Steady hand, not too fast.",reward:'*vapor* "Logged. Croatia never disappoints."'},
 ]},
 brana:{desc:'Watches everyone (secretly)',home:{x:3,y:9},pool:[
   {type:'fetch',item:'logsheet',itemLabel:'attendance log',ask:"Bring that sheet by the entrance. I do not track people... just get it.",reward:'*hides it* "I did not ask for this. But I did."'},
   {type:'memory',ask:"Recall the exact order people arrived. I was not watching, obviously.",reward:'"Correct. Not that I keep records. (I do.)"'},
   {type:'choose',q:'Who came in latest today?',opts:[{t:'Teonem ("errands")',ok:true},{t:'Nino, he is the boss',ok:false},{t:'All on time',ok:false}],ask:"Between us... who was last?",reward:'*scribbles* "Thought so."'},
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
   {type:'crack',ask:"Guess the drawer combination. I'll say higher or lower. Don't ask why I know it.",reward:'"Cracked. I am impressed. Slightly concerned."'},
   {type:'priority',cards:[{l:'Someone got a raise (WHO?)',p:1},{l:'Fridge thief struck again',p:2},{l:'Parking spot dispute',p:3},{l:'Stapler was moved 3cm',p:4}],hint:'Juiciest gossip first.',ask:"Rank the office gossip by how juicy it is. Highest first.",reward:'"Exactly my ranking. We think alike."'},
   {type:'splice',pairs:[['Teonem','arrived 09:47'],['Steve','arrived 08:55'],['Pedja','arrived 08:30']],hint:'Match each person to their arrival time.',ask:"Match each person to when they REALLY arrived. I have it memorized. Allegedly.",reward:'"All correct. I always know. Always."'},
   {type:'impostor',word:'I was here at 8:00',odd:'traffic was crazy',hint:'Four honest, one excuse.',ask:"Five people told me when they arrived. One is making excuses. Spot it.",reward:'"Noted. Filed. Never mentioned again. (Mentioned daily.)"'},
   {type:'docsort',ask:"Stamp the signed timesheets, reject the blanks. I'm... auditing.",reward:'"All sorted. Nothing gets past me."'},
   {type:'choose',q:'Caller wants IT support — which extension?',opts:[{t:'Transfer to Dejan',ok:true},{t:'Transfer to Sonja',ok:false},{t:'Hang up',ok:false}],ask:"Phone's ringing. I know exactly who needs this, obviously — do you?",reward:'"Correct. I was testing you."'},
   {type:'priority',cards:[{l:'Get everyone to the exit',p:1},{l:'Call the fire department',p:2},{l:'Grab the visitor log',p:3},{l:'Lock your desk',p:4}],hint:'Drill\'s starting. What matters first?',ask:"Fire drill. I've mentally rehearsed this daily — what happens first?",reward:'"Correct. I would know."'},
   {type:'crack',ask:"This visitor badge doesn't look right to me. Higher or lower — guess the real badge number.",reward:'"Fake. I knew it. I know everything."'},
 ]},
 sonja:{desc:'Quiet, runs payroll',home:{x:4,y:11},pool:[
   {type:'deliver',item:'router',itemLabel:'the router',to:'nino',ask:"Payroll needs internet. Give the router to Nino to reset.",reward:'barely audible: "...thank you."'},
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
   {type:'crack',ask:"Guess the safe combination. Higher or lower, that's all you get.",reward:'"...got it. Not that I would ever forget it myself."'},
   {type:'budget',ask:"Split this bonus pool so it adds up exactly. No more, no less.",reward:'"...balanced perfectly. Thank you."'},
   {type:'splice',pairs:[['ID-104 (junior)','\u20ac1.450'],['ID-207 (senior)','\u20ac2.900'],['ID-311 (intern)','\u20ac600']],hint:'Match each employee to the right salary.',ask:"Match each employee ID to their salary line. Quietly.",reward:'"...all matched. Nobody overpaid. Nobody underpaid."'},
   {type:'echo',ask:"Repeat this growing account number back to me. Do not lose a digit.",reward:'"...correct. Every digit." *whisper*'},
   {type:'noise',real:'INV-207 \u20ac1.850 DUE',fakes:['INV-201 \u20ac920 PAID','INV-114 \u20ac340 PAID','INV-166 \u20ac780 PAID','INV-090 \u20ac210 PAID'],hint:'Find the one UNPAID invoice.',ask:"One invoice in this ledger is still unpaid. Find it.",reward:'"...there it is. Caught before it caused trouble."'},
   {type:'priority',cards:[{l:'Salaries (today!)',p:1},{l:'Office rent',p:2},{l:'Software licenses',p:3},{l:"Nino's new chair",p:4}],hint:'What gets paid first?',ask:"Not everything can be paid today. Order the payments, please.",reward:'"...salaries first. Always. Good."'},
   {type:'cash',ask:"Count the petty-cash drawer to the exact figure. Quietly.",reward:'"...balances to the cent. Perfect."'},
   {type:'choose',q:'Payroll hotline is ringing — pick the professional reply.',opts:[{t:'"Payroll, this is Sonja, how can I help?"',ok:true},{t:'"What."',ok:false},{t:'"Call back later, obviously."',ok:false}],ask:"Phone won't stop ringing. Answer it properly, please.",reward:'"...good. Professional. Quietly proud."'},
   {type:'memory',ask:"Remember the voicemail number, then play it back for me. Quietly.",reward:'"...correct. Not one digit off."'},
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
   {type:'splice',pairs:[['Table 3','Double burger'],['Table 7','Vegan salad'],['Table 12','Espresso x4']],hint:'Match each table to its order.',ask:"Match each table number to its order ticket.",reward:'"All matched. Old habits really do stick."'},
   {type:'overload',ask:"Two tables calling at once — keep them both happy.",reward:'"Both served. Waiter reflexes never left."'},
   {type:'priority',cards:[{l:'Food is getting cold',p:1},{l:'Refill drinks',p:2},{l:'Wipe table 4',p:3},{l:'Chat with regulars',p:4}],hint:'Waiter instincts: what first?',ask:"Rush hour test: what does a waiter do first?",reward:'"Cold food is a crime. You get it."'},
   {type:'recipe',ask:"Old waiter skills — make the boss's coffee to the exact recipe.",reward:'"Nailed the measures. Some things you don\'t forget."'},
   {type:'park',ask:"New guy job: park the client's car in the bay. No scratches, please.",reward:'"Parked clean. Rookie\'s earning his keep."'},
   {type:'scrub',ask:"Give the showroom car a wash — scrub every dirty patch.",reward:'"Spotless. I miss bussing tables less now."'},
   {type:'checklist',items:['Tires','Fuel','Lights','Mirrors','Paperwork'],ask:"Delivery vehicle needs the full check before it leaves. Every item, fast.",reward:'"All checked. Ready to roll."'},
   {type:'gauge',ask:"Fill the tank for delivery — don't overshoot, don't undershoot.",reward:'"Tank\'s full. Didn\'t spill a drop, this time."'},
   {type:'count',ask:"Count what's missing from the supply shelf and restock exactly that much.",reward:'"Shelf\'s full again. Rookie delivers."'},
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
   {type:'priority',cards:[{l:"Nina's idea",p:1},{l:"Dad's idea",p:2},{l:"Client's request",p:3},{l:'YOUR idea',p:4}],hint:"Sort by importance. Hers first. Obviously.",ask:"Sort these by importance — mine first, obviously.",reward:'"Correct order. Mine is always first."'},
   {type:'echo',ask:"Repeat my growing list of demands. Don't fall behind.",reward:'"Good. You kept up with all of them."'},
   {type:'crack',ask:"Guess what I'm REALLY thinking. Hint: I'm always right.",reward:'"You got it eventually. Slow, but fine."'},
   {type:'forge',recipe:["NINA'S VISION",'EXECUTION','CREDIT TO NINA'],extra:['TEAM CREDIT','HUMILITY'],ask:"Combine everyone's ideas so mine comes out on top.",reward:'"See? Mine wins every time. As it should."'},
   {type:'overload',ask:"I need two things done AT ONCE. Both are urgent. Obviously.",reward:'"Finally, someone who can multitask like me."'},
   {type:'noise',real:'Nina approved this',fakes:['Team approved this','Nino approved this','Client approved this','HR approved this'],hint:'Find the only approval that counts.',ask:"Find the ONLY approval that matters in this pile.",reward:'"Correct. Mine. The rest are suggestions."'},
   {type:'dragfile',ask:"These files are in the WRONG folders. Fix it. Properly. My way.",reward:'"Finally organized. Was that so hard?"'},
   {type:'inspect',ask:"Inspect the returned vehicle — find every scratch. Miss nothing.",reward:'"Three flaws. I\'d have found a fourth. Good enough."'},
   {type:'arrange',items:[['🪑','chair'],['📽️','proj'],['💻','laptop']],hint:'Drag each item onto its marked spot. My way, exactly.',ask:"Set up the meeting room. Chair, projector, laptop — precisely where I want them.",reward:'"Perfect. Finally, someone who listens."'},
   {type:'pincode',ask:"Memorize the conference dial-in code. I will not repeat it. I already didn't.",reward:'"Correct. Obviously. I chose that code."'},
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
   {type:'splice',pairs:[['Hero card','Soft shadow 8px'],['Button','Crisp shadow 2px'],['Body text','No shadow, man']],hint:'Match each element to its shadow.',ask:"Match each element to its drop-shadow style.",reward:'"Every shape found its shadow. Beautiful."'},
   {type:'signal',ask:"Catch the animation at its peak frame — that's the money shot.",reward:'"That is THE frame. Ship it."'},
   {type:'impostor',word:'#2E4A72',odd:'#2E4B72',hint:'Four identical hex codes. One is off by a digit.',ask:"One hex code is off by ONE digit and it is ruining my life. Find it.",reward:'"THERE. One digit. Chaos averted. Respect."'},
   {type:'proofread',ask:"Client ad has a typo somewhere, man. Find it before it ships.",reward:'"Caught it. Crisis averted. Respect."'},
   {type:'stack',ask:"Pack these prints into the shipping box, man — stack it steady, don't crush the corners.",reward:'"Boxed clean. Art survives shipping."'},
   {type:'splice',pairs:[['Poster set A','Box 1'],['Poster set B','Box 2'],['Poster set C','Box 3']],hint:'Match each label to the right box.',ask:"Label these boxes right, man, or the wrong client gets the wrong art.",reward:'"All matched. Aesthetic AND logistics. Respect."'},
   {type:'proofread',ask:"One more typo hunt — the slide deck footer this time, man. Find it.",reward:'"Clean. Ship it before anyone notices there was one."'},
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
function updateCamera(){
  zoom=Math.min(viewW/(COLS*TS), viewH/(ROWS*TS));
  offX=(viewW-COLS*TS*zoom)/2;
  offY=(viewH-ROWS*TS*zoom)/2;
}


const TASKS_PER_NPC=2;

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
  if(look.long){g.fillRect(-s*4.4,-s*(hgt-6),s*1.8,s*8);g.fillRect(s*2.6,-s*(hgt-6),s*1.8,s*8);}
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

/* mode select */
document.getElementById('modePlay').onclick=()=>{
  document.getElementById('modeScreen').style.display='none';
  document.getElementById('start').style.display='flex';};
document.getElementById('modeTest').onclick=()=>{
  document.getElementById('modeScreen').style.display='none';
  startTest();};

/* start screen with sprite previews */
const pick=document.getElementById('pickChars');
['dejan','teonem','steve','brana','sonja','pedja','nina','daniel'].forEach(id=>{
  const d=document.createElement('div');d.className='char';d.style.minWidth='120px';
  const pc=document.createElement('canvas');pc.width=90;pc.height=120;
  pc.style.width='90px';pc.style.height='120px';
  const pg=pc.getContext('2d');pg.imageSmoothingEnabled=true;
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
  const all=['brana','sonja','pedja','nina','daniel','dejan','teonem','steve'];
  const order=all.filter(id=>id!==chosenId);
  NPCS=order.map(id=>{const p=POOLS[id];
    const tasks=shuffle(p.pool).slice(0,TASKS_PER_NPC).map((t,i)=>({...t,id:id+'_'+i,done:false}));
    return {id,name:cap(id),desc:p.desc,x:p.home.x,y:p.home.y,homeX:p.home.x,homeY:p.home.y,wState:'idle',wTimer:60+Math.random()*160,wTarget:null,face:1,speech:null,speechUntil:0,speechTimer:400+Math.random()*700,tasks};});
  player={id:chosenId,name:cap(chosenId),x:6.25*TS,y:12.25*TS,r:12};
  document.getElementById('start').style.display='none';
  document.getElementById('whoami').textContent='playing: '+cap(chosenId);
  state='play';renderTasks();
  timerId=setInterval(()=>{if(dialogOpen||miniOpen)return;time--;
    if(time<=0){time=0;endGame(false,'Time ran out');}
    const m=String(Math.floor(time/60)).padStart(2,'0'),s=String(time%60).padStart(2,'0');
    document.getElementById('timer').textContent=m+':'+s;},1000);
  loop();
}
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
  if(e.key.toLowerCase()==='e'){e.preventDefault();interact();}
  if(e.key.toLowerCase()==='g'){e.preventDefault();window.DEBUG_COLL=!window.DEBUG_COLL;}
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
    if(delT){delT.done=true;const it=carrying.item;const owner=NPCS.find(x=>x.tasks.includes(delT));setCarry(null);renderTasks();
      openDialog('Boss Nino','Ah, the '+it+' from '+owner.name+'. Good.',
        [{label:'Ok',fn:()=>{closeDialog();openDialog(owner.name,delT.reward,[{label:'ok',fn:closeDialog}]);}}]);return;}
    const allDone=allTasks().every(t=>t.done);
    if(allDone)openDialog('Boss Nino','Whole board clear? I built this from nothing, you know. One more small task... kidding. Go home. Well done.',[{label:'End shift',fn:()=>endGame(true)}]);
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
  t.done=true;renderTasks();openDialog(n.name,t.reward,[{label:'ok',fn:closeDialog}]);}
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
function fail(n,msg){const b=document.getElementById('miniBox');if(miniOpen&&b){b.classList.add('bad');setTimeout(()=>{b.classList.remove('bad');closeMini();openDialog(n.name,msg,[{label:'Ok',fn:closeDialog}]);},380);}else{closeMini();openDialog(n.name,msg,[{label:'Ok',fn:closeDialog}]);}}
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
  signal:miniSignal,forge:miniForge,overload:miniOverload,dragfile:miniDragFile,calendar:miniCalendar,park:miniPark,qralign:miniQR,recipe:miniRecipe,cash:miniCash,proofread:miniProof,docsort:miniDocSort,jam:miniJam,scrub:miniScrub,inspect:miniInspect,circuit:miniCircuit,arrange:miniArrange,checklist:miniChecklist,gauge:miniGauge,barcode:miniBarcode})[t.type](n,t);}

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
  const items=shuffle(['A','B','C','D','E']).slice(0,4);
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

function miniReflex(n,t){const st=openMini('REFLEX','Wait for GO, then click FAST. Click early = fail.');
  st.innerHTML='<button class="quickBtn" id="rfx" style="border-color:var(--red);color:var(--red)">WAIT...</button>';
  const b=document.getElementById('rfx');let ready=false,clicked=false;
  const wait=800+Math.random()*2200;
  const to=setTimeout(()=>{if(clicked)return;ready=true;b.textContent='GO!';b.style.borderColor='var(--green)';b.style.color='var(--green)';},wait);
  b.onclick=()=>{if(clicked)return;if(!ready){clicked=true;clearTimeout(to);fail(n,'Too early! [E]');}
    else{clicked=true;miniWin(n,t);}};}

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

function miniCount(n,t){const icons=['&#128196;','&#9749;','&#128396;','&#128190;'];const idx=Math.floor(Math.random()*4);
  const ic=icons[idx];const count=3+Math.floor(Math.random()*6);
  const st=openMini('COUNT','How many '+['docs','coffees','pens','disks'][idx]+'? Type it, Enter.');
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
  const st=openMini('DIAL IT IN','Set the slider to '+target+' (max 3 off), then SPACE.');
  st.innerHTML='<input type="range" min="0" max="100" value="50" id="sld" style="width:80%;accent-color:var(--accent)"><div id="sldVal" class="typed">50</div>';
  const sld=document.getElementById('sld'),val=document.getElementById('sldVal');
  sld.oninput=()=>val.textContent=sld.value;
  setKey(e=>{if(e.key===' '){e.preventDefault();Math.abs(+sld.value-target)<=3?(closeMini(),finish(n,t)):fail(n,'Not close enough. [E]');}});}

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
      c.onclick=()=>{if(v===Math.max(a,b)){round++;if(round>=3){miniWin(n,t);}else{info.textContent='Round '+(round+1)+' / 3';newRound();}}
        else fail(n,'That one was smaller. [E]');};row.appendChild(c);});}
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
function miniMaze(n,t){const st=openMini('MAZE','Move the dot to the green exit with W/A/S/D. Touch a wall = fail.',true);
  st.innerHTML='<div id="mzBox" style="position:relative;width:280px;height:180px;background:#e4cd9d;border:3px solid var(--wood2);border-radius:6px;overflow:hidden"></div>';
  const box=document.getElementById('mzBox');
  const walls=[[0,60,180,10],[100,60,10,80],[100,130,180,10],[0,20,10,120]];
  walls.forEach(w=>{const el=document.createElement('div');el.style.cssText='position:absolute;background:var(--wood2);left:'+w[0]+'px;top:'+w[1]+'px;width:'+w[2]+'px;height:'+w[3]+'px';box.appendChild(el);});
  const goal=document.createElement('div');goal.style.cssText='position:absolute;left:255px;top:80px;width:16px;height:16px;background:var(--green);border-radius:50%';box.appendChild(goal);
  const dot=document.createElement('div');dot.style.cssText='position:absolute;left:8px;top:80px;width:14px;height:14px;background:var(--accent);border-radius:50%;border:2px solid var(--wood2)';box.appendChild(dot);
  let x=8,y=80,done=false;
  function hitWall(nx,ny){return walls.some(w=>nx+14>w[0]&&nx<w[0]+w[2]&&ny+14>w[1]&&ny<w[1]+w[3]);}
  setKey(e=>{if(done)return;const k=e.key.toLowerCase();let nx=x,ny=y;
    if(k==='w')ny-=8;if(k==='s')ny+=8;if(k==='a')nx-=8;if(k==='d')nx+=8;
    if(nx<0||ny<0||nx>264||ny>164){return;}
    if(hitWall(nx,ny)){done=true;stopT();fail(n,'Hit a wall! [E]');return;}
    x=nx;y=ny;dot.style.left=x+'px';dot.style.top=y+'px';
    if(Math.hypot(x-255,y-80)<20){done=true;stopT();miniWin(n,t);}});
  const stopT=countdown(14,()=>{if(!done){done=true;fail(n,'Too slow. [E]');}});}

// SPY: memorize a scene, then answer a question about it
function miniSpy(n,t){const items=shuffle(['&#128196;','&#9749;','&#128421;','&#128202;','&#128190;']).slice(0,4);
  const pos=shuffle([0,1,2,3]);
  const st=openMini('SPY','Memorize the layout...');
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:8px';
  const cells=[];for(let i=0;i<4;i++){const c=document.createElement('div');c.className='gridCell';c.innerHTML=items[pos.indexOf(i)];grid.appendChild(c);cells.push(c);}
  st.appendChild(grid);
  const qIdx=Math.floor(Math.random()*4);const qItem=items[pos.indexOf(qIdx)];
  setTimeout(()=>{cells.forEach(c=>c.innerHTML='?');
    document.getElementById('miniDesc').textContent='Which slot had '+qItem+' ?';
    cells.forEach((c,i)=>c.onclick=()=>i===qIdx?(closeMini(),finish(n,t)):fail(n,'Wrong slot. [E]'));},2200);}

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
  function upd(){const sum=sliders.reduce((a,s)=>a+ +s.value,0);out.textContent='Total: '+sum+' / '+target;}
  sliders.forEach(s=>s.oninput=upd);upd();
  const btn=document.createElement('button');btn.className='btn';btn.textContent='Lock it in';st.appendChild(btn);
  btn.onclick=()=>{const sum=sliders.reduce((a,s)=>a+ +s.value,0);
    sum===target?(closeMini(),finish(n,t)):fail(n,'Total was '+sum+', needed '+target+'. [E]');};}

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
function miniJenga(n,t){const st=openMini('JENGA','Remove blocks WITHOUT pulling a red support block too early. Clear all 6.');
  const support=new Set(shuffle([0,1,2,3,4,5]).slice(0,2));
  const wrap=document.createElement('div');wrap.style.cssText='display:flex;flex-direction:column;gap:4px;align-items:center';
  const blocks=[];for(let i=0;i<6;i++){const b=document.createElement('div');b.style.cssText='width:140px;height:22px;background:var(--woodlite);border:2px solid var(--wood2);cursor:pointer;border-radius:4px';
    wrap.appendChild(b);blocks.push(b);}
  st.appendChild(wrap);let removed=0,safeRemoved=0;
  blocks.forEach((b,i)=>{b.onclick=()=>{if(b.dataset.gone)return;
    if(support.has(i)&&safeRemoved<4){fail(n,'Tower collapsed! [E]');return;}
    b.style.opacity=.15;b.dataset.gone='1';removed++;if(!support.has(i))safeRemoved++;
    if(removed>=6){miniWin(n,t);}};});}

// SIGNAL: click at the peak of an oscillating wave
function miniSignal(n,t){const st=openMini('SIGNAL','Click SPACE when the wave hits the peak (top). 3 peaks.');
  st.innerHTML='<div style="position:relative;width:260px;height:80px"><div id="wv" style="position:absolute;bottom:0;width:8px;height:8px;background:var(--accent);border-radius:50%"></div><div style="position:absolute;top:0;left:0;right:0;border-top:2px dashed var(--green)"></div></div><div class="typed" id="sgc">0 / 3</div>';
  const wv=document.getElementById('wv'),sgc=document.getElementById('sgc');let ph=0,hit=0,done=false;
  const raf=setInterval(()=>{if(done)return;ph+=0.12;const y=(Math.sin(ph)+1)/2*70;wv.style.bottom=y+'px';},20);
  setKey(e=>{if(e.key===' '&&!done){e.preventDefault();const y=(Math.sin(ph)+1)/2*70;
    if(y>=60){hit++;sgc.textContent=hit+' / 3';if(hit>=3){done=true;clearInterval(raf);miniWin(n,t);}}
    else{done=true;clearInterval(raf);fail(n,'Missed the peak. [E]');}}});}

// FORGE: combine two ingredients in the correct order to match target
function miniForge(n,t){const recipe=t.recipe||shuffle(['RED','BLUE','GOLD']).slice(0,2);
  const extra=t.extra||['TEAL'];
  const st=openMini('FORGE','Combine in the RIGHT order: '+recipe.join(' \u2192 '));
  shuffle([...recipe,...extra]).forEach(v=>{const b=document.createElement('div');b.className='memChip';b.style.fontSize='12px';b.textContent=v;
    b.onclick=()=>{if(b.dataset.picked)return;b.dataset.picked='1';
      const chosen=[...st.children].filter(x=>x.dataset.picked).map(x=>x.textContent);
      if(chosen[chosen.length-1]!==recipe[chosen.length-1]){fail(n,'Wrong ingredient or order. [E]');return;}
      b.style.opacity=.4;if(chosen.length===recipe.length){miniWin(n,t);}};st.appendChild(b);});}

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
        const tgt=document.elementFromPoint(ev.clientX,ev.clientY);const fol=tgt&&tgt.closest?tgt.closest('.nmFolder'):null;
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
function miniPark(n,t){const st=openMini('PARK','Arrows to drive, land fully inside the bay, then SPACE. Do not hit walls.',true);
  st.innerHTML='<div id="nmLot" class="nmLot"><div id="nmBay" class="nmBay"></div><div id="nmObs" class="nmObs"></div><div id="nmCar" class="nmCar">🚗</div></div>';
  const lot=document.getElementById('nmLot'),bay=document.getElementById('nmBay'),car=document.getElementById('nmCar'),obs=document.getElementById('nmObs');
  const W=300,H=170;bay.style.left=(W-60)+'px';bay.style.top=(Math.random()*(H-60))+'px';
  obs.style.left='150px';obs.style.top='0px';let x=8,y=H/2-16,done=false;
  const place=()=>{car.style.left=x+'px';car.style.top=y+'px';};place();
  setKey(e=>{if(done)return;const s=10;if(e.key==='ArrowUp')y-=s;else if(e.key==='ArrowDown')y+=s;else if(e.key==='ArrowLeft')x-=s;else if(e.key==='ArrowRight')x+=s;
    else if(e.key===' '){e.preventDefault();const br=bay.getBoundingClientRect(),cr=car.getBoundingClientRect();
      if(cr.left>=br.left-4&&cr.right<=br.right+4&&cr.top>=br.top-4&&cr.bottom<=br.bottom+4){done=true;stopT();miniWin(n,t);}
      else fail(n,'Not in the bay yet. [E]');return;}
    else return;e.preventDefault();x=Math.max(0,Math.min(W-32,x));y=Math.max(0,Math.min(H-32,y));place();
    const cr=car.getBoundingClientRect(),or=obs.getBoundingClientRect();
    if(cr.left<or.right&&cr.right>or.left&&cr.top<or.bottom&&cr.bottom>or.top){done=true;stopT();fail(n,'Scraped the pillar! [E]');}});
  const stopT=countdown(20,()=>{if(!done){done=true;fail(n,'Too slow, blocked the lane. [E]');}});}

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
    doc.textContent=queue[idx]?'✔ SIGNED':'▭ BLANK';doc.style.borderColor=queue[idx]?'var(--green)':'var(--red)';};
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
function miniInspect(n,t){const st=openMini('INSPECT','Find and click all 3 damage spots on the car.');
  st.innerHTML='<div id="nmCarBox" class="nmCarBox">🚙</div>';const box=document.getElementById('nmCarBox');let found=0,total=3,done=false;
  const spots=[];while(spots.length<total){spots.push({x:15+Math.random()*250,y:15+Math.random()*100});}
  spots.forEach(s=>{const d=document.createElement('div');d.className='nmSpot';d.style.left=s.x+'px';d.style.top=s.y+'px';box.appendChild(d);
    d.onclick=e=>{e.stopPropagation();if(d.classList.contains('ok'))return;d.classList.add('ok');d.textContent='✕';found++;
      if(found>=total&&!done){done=true;setTimeout(()=>{miniWin(n,t);},250);}};});
  box.onclick=()=>{};}

/* 12. CIRCUIT — rotate each wire tile until the whole line connects */
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
        const tgt=document.elementFromPoint(ev.clientX,ev.clientY);const spot=tgt&&tgt.closest?tgt.closest('.nmFolder'):null;
        if(spot&&spot.dataset.k===f.dataset.k){f.remove();spot.classList.add('lit');left--;if(left===0&&!done){done=true;setTimeout(()=>{miniWin(n,t);},250);}}
        else{f.style.position='';f.style.left='';f.style.top='';f.style.zIndex='';}};
      f.addEventListener('pointermove',mv);f.addEventListener('pointerup',up);};});
  shuffle(items.slice()).forEach(([ic,k])=>{const d=document.createElement('div');d.className='nmFolder';d.dataset.k=k;d.textContent='▢';sRow.appendChild(d);});}

// CHECKLIST: tap every item once before the timer runs out
function miniChecklist(n,t){const st=openMini('CHECKLIST',t.hint||'Tap every item before time runs out.',true);
  const items=t.items||['Tires','Fuel','Lights','Mirrors','Paperwork'];
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,1fr);gap:8px;width:100%;max-width:320px';
  let left=items.length,done=false;
  shuffle(items.slice()).forEach(label=>{const c=document.createElement('div');c.className='gridCell';c.style.cssText+='font-size:11px;padding:0 6px';c.textContent='☐ '+label;
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
function miniBarcode(n,t){const st=openMini('SCAN',t.hint||'Drag the scanner across the barcode — not too fast, not too slow.');
  st.innerHTML='<div style="width:100%;max-width:340px"><div id="bcTrack" style="position:relative;height:54px;background:repeating-linear-gradient(90deg,#2a2015 0 3px,#e8dfc5 3px 7px);border:3px solid var(--wood2);border-radius:8px"></div>'+
    '<div id="bcHandle" style="position:absolute;top:-6px;left:-6px;width:34px;height:66px;background:var(--accent);border-radius:6px;border:2px solid var(--wood2);cursor:grab;display:flex;align-items:center;justify-content:center;font-size:16px">📷</div></div>';
  const track=document.getElementById('bcTrack'),handle=document.getElementById('bcHandle');
  track.style.position='relative';let done=false,startT=0,startX=0;
  handle.onpointerdown=e=>{if(done)return;e.preventDefault();handle.setPointerCapture(e.pointerId);startT=Date.now();
    const r=track.getBoundingClientRect();startX=r.left;
    const mv=ev=>{if(done)return;const x=Math.max(0,Math.min(r.width-20,ev.clientX-startX-14));handle.style.left=x+'px';
      if(x>=r.width-24){finishScan();}};
    const up=()=>{handle.removeEventListener('pointermove',mv);handle.removeEventListener('pointerup',up);};
    handle.addEventListener('pointermove',mv);handle.addEventListener('pointerup',up);
    function finishScan(){if(done)return;done=true;handle.removeEventListener('pointermove',mv);
      const elapsed=Date.now()-startT;
      (elapsed>=500&&elapsed<=1600)?miniWin(n,t):fail(n,elapsed<500?'Too fast — blurred scan. [E]':'Too slow — timed out. [E]');}
  };}

function endGame(win,reason){state='end';clearInterval(timerId);
  document.getElementById('end').style.display='flex';
  const t=document.getElementById('endTitle'),s=document.getElementById('endSub'),m=document.getElementById('endMsg');
  const all=allTasks(),d=all.filter(x=>x.done).length;
  if(win){t.textContent='SHIFT COMPLETE';t.style.color='var(--green)';s.textContent='Board cleared';
    m.textContent='Nino is pleased (briefly). Team heads home. Tomorrow: a new board.';
  }else{t.textContent='OUT OF TIME';t.style.color='var(--red)';s.textContent=reason+' — '+d+'/'+all.length+' done';
    m.textContent='The board is still full. Nina is already typing in the group chat.';}}

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
    ctx.fillStyle='rgba(232,185,60,.25)';ctx.beginPath();ctx.arc(px,py+2,15,0,7);ctx.fill();
    ctx.save();ctx.translate(px,py+b);
    if(s.icon==='doc'){ctx.fillStyle='#f4ead2';ctx.fillRect(-6,-8,12,15);ctx.fillStyle='#8a6a3a';
      ctx.fillRect(-4,-5,8,2);ctx.fillRect(-4,-1,8,2);ctx.fillRect(-4,3,5,2);}
    else if(s.icon==='cig'){ctx.fillStyle='#f4f4f4';ctx.fillRect(-9,-3,14,6);ctx.fillStyle='#e8a03c';ctx.fillRect(5,-3,4,6);}
    else if(s.icon==='vape'){ctx.fillStyle='#3a3a44';ctx.fillRect(-4,-10,8,20);ctx.fillStyle='#7ec8e8';ctx.fillRect(-2,-7,4,5);}
    else if(s.icon==='rtr'){ctx.fillStyle='#2a2a34';ctx.fillRect(-10,-4,20,10);ctx.fillStyle='#5aa848';ctx.fillRect(-6,-1,3,3);
      ctx.fillStyle='#555';ctx.fillRect(-8,-10,2,7);ctx.fillRect(6,-10,2,7);}
    else if(s.icon==='cup'){ctx.fillStyle='#f4ead2';ctx.fillRect(-6,-6,12,12);ctx.fillStyle='#6b431f';ctx.fillRect(-4,-4,8,8);}
    else if(s.icon==='ltr'){ctx.fillStyle='#c94f4f';ctx.fillRect(-4,-7,8,14);ctx.fillStyle='#e8b93c';ctx.fillRect(-3,-10,6,4);}
    else if(s.icon==='lap'){ctx.fillStyle='#3a3a44';ctx.fillRect(-9,-6,18,12);ctx.fillStyle='#7ec8e8';ctx.fillRect(-7,-4,14,8);}
    ctx.restore();
    ctx.fillStyle='#5a3517';ctx.font='bold 9px monospace';ctx.textAlign='center';
    ctx.fillText(k,px,py-16);}}

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
function loop(){if(state==='end')return;
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
  const g=ctx.createRadialGradient(viewW/2,viewH/2,viewH/2.4,viewW/2,viewH/2,viewH*0.95);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,15,5,.35)');
  ctx.fillStyle=g;ctx.fillRect(0,0,viewW,viewH);
  requestAnimationFrame(loop);}
