
const STORAGE_KEY='keyCollectiveOS.complete.v1';
const PAGES=[
 ['dashboard','⌂','Dashboard'],['today','✓','Today'],['calendar','◫','Calendar'],['lani','♡','Lani'],
 ['career','◇','Career'],['business','✦','Business'],['money','$','Money'],['wellness','❧','Wellness'],
 ['home','⌂','Home'],['journal','✎','Journal'],['goals','◎','Goals'],['progress','★','Progress'],['vision','◈','Vision Board']
];
const DEFAULTS={
 weeklyFocus:'A softer life, built with discipline', checks:{}, texts:{},
 water:0, todayTasks:[
  {id:'morning',text:'Start the day intentionally',done:false},
  {id:'lani',text:'Prepare Lani’s essentials',done:false},
  {id:'work',text:'Complete one meaningful work priority',done:false},
  {id:'home',text:'Reset one home area',done:false},
  {id:'care',text:'Take care of yourself',done:false},
  {id:'tomorrow',text:'Prepare for tomorrow',done:false}
 ],
 bills:[
 {name:'Preschool',amount:570,due:1},{name:'Disney+',amount:21.75,due:2},{name:'AppleCare',amount:9.99,due:4},
 {name:'iCloud+',amount:10.87,due:5},{name:'Peacock',amount:17,due:8},{name:'Car note',amount:246.63,due:10},
 {name:'Capital One',amount:0,due:11},{name:'Apple Music',amount:11.96,due:21},{name:'Google Drive',amount:9.99,due:21},
 {name:'Phone',amount:90,due:29},{name:'Gym',amount:52.98,due:29},{name:'Apple Card minimum',amount:126,due:31}
 ],
 income:3600,savings:0,weeklyLimit:145,weeklySpent:0,calendarNotes:{},
 progress:{book:25,money:15,wellness:10,home:20}, vision:['Peaceful home','Financial freedom','Published author','Healthy routines','Travel and joy','A beautiful life']
};
let state=merge(DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'));
let calendarCursor=new Date();calendarCursor.setDate(1);
function merge(a,b){const o={...a,...b};o.checks={...a.checks,...(b.checks||{})};o.texts={...a.texts,...(b.texts||{})};o.progress={...a.progress,...(b.progress||{})};return o}
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
function navMarkup(mobile=false){
 const allowed=mobile?PAGES.filter(p=>['dashboard','today','lani','money','journal'].includes(p[0])):PAGES;
 return allowed.map(([id,icon,name])=>`<button class="${mobile?'':'nav-button'} ${id==='dashboard'?'active':''}" data-page="${id}"><span class="nav-icon">${icon}</span>${name}</button>`).join('')
}
$('#desktopNav').innerHTML=navMarkup();$('#mobileNav').innerHTML=navMarkup(true);
function go(page){
 $$('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${page}`));
 $$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 $('.sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});
}
document.addEventListener('click',e=>{
 const p=e.target.closest('[data-page]');if(p)go(p.dataset.page);
 const g=e.target.closest('[data-go]');if(g)go(g.dataset.go)
});
$('#mobileMenuBtn').onclick=()=>$('.sidebar').classList.toggle('open');

const clocks=[
 ['Goodyear, Arizona','America/Phoenix'],['Cape Town, South Africa','Africa/Johannesburg'],
 ['Houston, Texas','America/Chicago'],['New York, New York','America/New_York']
];
$('#clockGrid').innerHTML=clocks.map(([city,tz])=>`<div class="clock"><div class="clock-city">${city.toUpperCase()}</div><div class="clock-time" data-clock="${tz}">--:--</div><div class="clock-date" data-clock-date="${tz}"></div></div>`).join('');
function updateTime(){
 const now=new Date();
 $$('[data-clock]').forEach(el=>el.textContent=new Intl.DateTimeFormat('en-US',{timeZone:el.dataset.clock,hour:'numeric',minute:'2-digit',second:'2-digit'}).format(now));
 $$('[data-clock-date]').forEach(el=>el.textContent=new Intl.DateTimeFormat('en-US',{timeZone:el.dataset.clockDate,weekday:'short',month:'short',day:'numeric'}).format(now));
 const ph=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',hour:'2-digit',hourCycle:'h23'}).format(now));
 $('#greeting').textContent=`Good ${ph<12?'morning':ph<17?'afternoon':'evening'}, Key.`;
 $('#todayText').textContent=new Intl.DateTimeFormat('en-US',{timeZone:'America/Phoenix',weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(now);
}
updateTime();setInterval(updateTime,1000);

function bindPersistent(){
 $('[id="weeklyFocus"]').value=state.weeklyFocus;
 $('[id="weeklyFocus"]').oninput=e=>{state.weeklyFocus=e.target.value;save()};
 $$('[data-store-check]').forEach(el=>{const k=el.dataset.storeCheck;el.checked=!!state.checks[k];el.onchange=()=>{state.checks[k]=el.checked;save()}});
 $$('[data-store-text]').forEach(el=>{const k=el.dataset.storeText;el.value=state.texts[k]||el.value||'';el.oninput=()=>{state.texts[k]=el.value;save()}});
}
function renderToday(){
 $('#todayChecklist').innerHTML=state.todayTasks.map(t=>`<div class="check-row"><input type="checkbox" ${t.done?'checked':''} data-task-check="${t.id}"><span>${escapeHtml(t.text)}</span><button class="delete-button" data-task-delete="${t.id}">×</button></div>`).join('');
 const done=state.todayTasks.filter(t=>t.done).length, total=state.todayTasks.length||1,pct=Math.round(done/total*100);
 $('#todayProgressPill').textContent=`${pct}% complete`;$('#todayProgressBar').style.width=pct+'%';
 $$('[data-task-check]').forEach(c=>c.onchange=()=>{state.todayTasks.find(t=>t.id===c.dataset.taskCheck).done=c.checked;save();renderToday()});
 $$('[data-task-delete]').forEach(b=>b.onclick=()=>{state.todayTasks=state.todayTasks.filter(t=>t.id!==b.dataset.taskDelete);save();renderToday();renderPages()});
}
$('#addTodayTask').onclick=()=>{const i=$('#newTodayTask');const text=i.value.trim();if(!text)return;state.todayTasks.push({id:crypto.randomUUID(),text,done:false});i.value='';save();renderToday();renderPages()};
function renderWater(){const v=Math.min(8,state.water||0);$('#waterNumber').textContent=v;$('#waterRing').style.background=`conic-gradient(var(--forest) ${v/8*360}deg,var(--champagne) 0deg)`}
$('#addWater').onclick=()=>{state.water=Math.min(8,(state.water||0)+1);save();renderWater()};$('#resetWater').onclick=()=>{state.water=0;save();renderWater()};

function heading(kicker,title,button=''){return `<div class="page-heading"><div><div class="kicker">${kicker}</div><h1>${title}</h1></div>${button}</div>`}
function checklist(group,items){return items.map(([k,label])=>`<label class="check-row"><input type="checkbox" data-check-group="${group}" data-check-key="${k}" ${state.checks[`${group}.${k}`]?'checked':''}><span>${label}</span><span></span></label>`).join('')}
function note(key,placeholder,rows=''){return `<textarea ${rows?`style="min-height:${rows}px"`:''} data-text-key="${key}" placeholder="${placeholder}">${escapeHtml(state.texts[key]||'')}</textarea>`}
function renderPages(){
 $('#page-today').innerHTML=heading('YOUR DAY, WITH A JOB FOR EVERYTHING','Today')+`
 <div class="grid-2"><article class="card"><div class="kicker">TODAY’S TASKS</div><div class="checklist">${state.todayTasks.map(t=>`<label class="check-row"><input type="checkbox" data-page-task="${t.id}" ${t.done?'checked':''}><span>${escapeHtml(t.text)}</span><span></span></label>`).join('')}</div></article>
 <article class="card"><div class="kicker">DAILY NOTES</div>${note('todayLongNote','Appointments, priorities, reminders, and anything else that matters today.',220)}</article></div>`;
 $('#page-calendar').innerHTML=heading('PLAN WITH PURPOSE','Calendar','<button class="primary" id="addCalendarBtn">+ Add note</button>')+`<article class="card"><div class="calendar-controls"><button class="ghost" id="prevMonth">←</button><h2 id="monthLabel"></h2><button class="ghost" id="nextMonth">→</button></div><div class="calendar-grid" id="calendarGrid"></div></article>`;
 $('#page-lani').innerHTML=heading('LOVE LIVES HERE','Lani’s Corner')+`
 <div class="grid-2"><article class="card"><div id="photoFrame" class="photo-frame">Choose approved photos for this device.</div><input id="photoPicker" type="file" accept="image/*" multiple style="margin-top:10px"><div class="button-pair" style="margin-top:10px"><button class="primary" id="nextPhoto">Show another</button><button class="ghost" id="clearPhotos">Clear photos</button></div></article>
 <article class="card"><div class="kicker">ROUTINE</div>${checklist('lani',[['hair','Hair'],['backpack','Backpack'],['school','School essentials'],['swim','Swim supplies'],['bed','Bedtime routine']])}<div class="kicker" style="margin-top:18px">MEMORIES</div>${note('laniMemories','Sweet moments, funny things she said, milestones, and memories.',190)}</article></div>`;
 $('#page-career').innerHTML=heading('CAREER HQ','Career')+`<div class="grid-2"><article class="card">${checklist('career',[['priority','Review priorities'],['followup','Complete follow-ups'],['learn','Professional development'],['linkedin','LinkedIn or resume update']])}</article><article class="card"><div class="kicker">CAREER NOTES</div>${note('careerNotes','Wins, challenges, goals, and next moves.',220)}</article></div>`;
 $('#page-business').innerHTML=heading('BUILD THE THING','Business')+`<div class="grid-2"><article class="card">${checklist('business',[['write','Write'],['research','Research'],['design','Design'],['market','Marketing'],['admin','Business admin']])}</article><article class="card"><div class="kicker">THE KEY COLLECTIVE</div>${note('businessNotes','Ideas, products, launch plans, content, and next moves.',220)}</article></div>`;
 const billTotal=state.bills.reduce((s,b)=>s+Number(b.amount||0),0), unassigned=(Number(state.income)||0)-billTotal-(Number(state.savings)||0);
 $('#page-money').innerHTML=heading('EVERY DOLLAR GETS A JOB','Money Center','<button class="primary" id="addBillBtn">+ Add bill</button>')+`
 <div class="grid-4"><div class="stat">Monthly income<strong>${money(state.income)}</strong></div><div class="stat">Monthly bills<strong>${money(billTotal)}</strong></div><div class="stat">Savings<strong>${money(state.savings)}</strong></div><div class="stat">Unassigned<strong>${money(unassigned)}</strong></div></div>
 <div class="grid-2" style="margin-top:16px"><article class="card"><div class="kicker">BILLS</div><div id="billList">${billRows()}</div></article><article class="card"><div class="kicker">MONTHLY NUMBERS</div><label>Income<input id="incomeInput" type="number" value="${state.income}"></label><label>Savings set-aside<input id="savingsInput" type="number" value="${state.savings}"></label><label>Weekly spending limit<input id="weeklyLimitInput" type="number" value="${state.weeklyLimit}"></label><label>Spent this week<input id="weeklySpentInput" type="number" value="${state.weeklySpent}"></label><div class="kicker" style="margin-top:16px">MONEY NOTES</div>${note('moneyNotes','Upcoming decisions, savings goals, and adjustments.',150)}</article></div>`;
 $('#page-wellness').innerHTML=heading('TAKE CARE OF YOU','Wellness')+`<div class="grid-2"><article class="card">${checklist('wellness',[['meds','Medication'],['water','Water'],['skin','Skincare'],['teeth','Brush teeth twice'],['food','Eat something nourishing'],['rest','Rest without guilt'],['sober','Keep the promise not to drink']])}</article><article class="card"><div class="kicker">HOW ARE YOU, REALLY?</div>${note('wellnessNotes','Mood, energy, symptoms, triggers, victories, and what you need.',240)}</article></div>`;
 $('#page-home').innerHTML=heading('A HOME THAT SUPPORTS YOU','Home')+`<div class="grid-2"><article class="card">${checklist('home',[['kitchen','Kitchen reset'],['laundry','Laundry'],['living','Living room'],['lani','Lani’s room'],['playroom','Playroom'],['prep','Prepare for tomorrow']])}</article><article class="card"><div class="kicker">MEALS & GROCERIES</div>${note('mealPlan','Meal plan',110)}${note('groceryList','Grocery list',150)}</article></div>`;
 $('#page-journal').innerHTML=heading('MAKE SPACE TO HEAR YOURSELF','Journal')+`<article class="card"><div class="kicker">TODAY’S ENTRY</div>${note('journalEntry','Write freely. This is your space.',360)}<div class="kicker" style="margin-top:15px">GRATITUDE</div>${note('gratitude','Today I am grateful for...',100)}</article>`;
 $('#page-goals').innerHTML=heading('THE LIFE YOU ARE BUILDING','Goals')+`<div class="grid-3"><article class="card"><div class="kicker">PERSONAL</div>${note('personalGoals','Personal goals',230)}</article><article class="card"><div class="kicker">CAREER & BUSINESS</div>${note('careerGoals','Career and business goals',230)}</article><article class="card"><div class="kicker">FINANCIAL</div>${note('financialGoals','Financial goals',230)}</article></div>`;
 $('#page-progress').innerHTML=heading('PROOF THAT YOU ARE GROWING','Progress')+`<div class="grid-4">${Object.entries({book:'Book',money:'Money',wellness:'Wellness',home:'Home'}).map(([k,l])=>`<article class="card"><div class="kicker">${l.toUpperCase()}</div><div class="metric-big"><span id="${k}Pct">${state.progress[k]}</span>%</div><input class="range" type="range" min="0" max="100" value="${state.progress[k]}" data-progress="${k}"></article>`).join('')}</div><article class="card" style="margin-top:16px"><div class="kicker">WINS WORTH REMEMBERING</div>${note('wins','Write down the proof that you are moving forward.',220)}</article>`;
 $('#page-vision').innerHTML=heading('KEEP THE BIG PICTURE VISIBLE','Vision Board','<button class="primary" id="editVision">Edit tiles</button>')+`<div class="vision-grid">${state.vision.map(v=>`<div class="vision-tile">${escapeHtml(v)}</div>`).join('')}</div><article class="card" style="margin-top:16px"><div class="kicker">THE VISION IN YOUR OWN WORDS</div>${note('visionNarrative','Describe the home, peace, work, freedom, family life, and experiences you are creating.',220)}</article>`;
 bindPageEvents();renderCalendar();
}
function billRows(){return [...state.bills].sort((a,b)=>a.due-b.due).map((b,i)=>`<div class="bill-row"><span>${escapeHtml(b.name)}</span><strong>${money(b.amount)}</strong><span class="pill">Due ${b.due}</span><button class="delete-button" data-delete-bill="${i}">×</button></div>`).join('')}
function renderDashboardBills(){$('#dashboardBills').innerHTML=[...state.bills].sort((a,b)=>a.due-b.due).slice(0,4).map(b=>`<div class="list-row"><span>${escapeHtml(b.name)}</span><strong>${money(b.amount)}</strong><span class="pill">${b.due}</span></div>`).join('')}
function bindPageEvents(){
 $$('[data-text-key]').forEach(el=>el.oninput=()=>{state.texts[el.dataset.textKey]=el.value;save()});
 $$('[data-check-group]').forEach(el=>el.onchange=()=>{state.checks[`${el.dataset.checkGroup}.${el.dataset.checkKey}`]=el.checked;save()});
 $$('[data-page-task]').forEach(el=>el.onchange=()=>{state.todayTasks.find(t=>t.id===el.dataset.pageTask).done=el.checked;save();renderToday()});
 $$('[data-progress]').forEach(el=>el.oninput=()=>{state.progress[el.dataset.progress]=Number(el.value);$(`#${el.dataset.progress}Pct`).textContent=el.value;save()});
 const ab=$('#addBillBtn');if(ab)ab.onclick=addBill;
 $$('[data-delete-bill]').forEach(b=>b.onclick=()=>{state.bills.splice(Number(b.dataset.deleteBill),1);save();renderPages();renderDashboardBills()});
 [['incomeInput','income'],['savingsInput','savings'],['weeklyLimitInput','weeklyLimit'],['weeklySpentInput','weeklySpent']].forEach(([id,k])=>{const el=$('#'+id);if(el)el.oninput=()=>{state[k]=Number(el.value)||0;save()}});
 const ev=$('#editVision');if(ev)ev.onclick=()=>{const val=prompt('Enter six vision tiles separated by |',state.vision.join(' | '));if(val){state.vision=val.split('|').map(x=>x.trim()).filter(Boolean).slice(0,9);save();renderPages()}};
 const ac=$('#addCalendarBtn');if(ac)ac.onclick=()=>{const d=prompt('Date (YYYY-MM-DD)');if(!d)return;const n=prompt('Note');if(n){state.calendarNotes[d]=n;save();renderCalendar()}};
 const pm=$('#prevMonth');if(pm)pm.onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar()};
 const nm=$('#nextMonth');if(nm)nm.onclick=()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar()};
 setupPhotos();
}
function addBill(){const name=prompt('Bill name');if(!name)return;const amount=Number(prompt('Amount'))||0;const due=Math.min(31,Math.max(1,Number(prompt('Due day (1–31)'))||1));state.bills.push({name,amount,due});save();renderPages();renderDashboardBills();toast('Bill added')}
function renderCalendar(){
 const grid=$('#calendarGrid');if(!grid)return;
 const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();$('#monthLabel').textContent=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(calendarCursor);
 const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),now=new Date();
 let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="calendar-head">${d}</div>`).join('');
 for(let i=0;i<first;i++)html+='<div></div>';
 for(let d=1;d<=days;d++){const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,today=now.getFullYear()===y&&now.getMonth()===m&&now.getDate()===d;html+=`<button class="calendar-day ${today?'today':''} ${state.calendarNotes[key]?'has-note':''}" data-calendar-day="${key}">${d}${state.calendarNotes[key]?'<br><small>• note</small>':''}</button>`}
 grid.innerHTML=html;
 $$('[data-calendar-day]').forEach(b=>b.onclick=()=>{const n=prompt('Calendar note',state.calendarNotes[b.dataset.calendarDay]||'');if(n===null)return;if(n)state.calendarNotes[b.dataset.calendarDay]=n;else delete state.calendarNotes[b.dataset.calendarDay];save();renderCalendar()});
}
function modal(title,body){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modalBackdrop').hidden=false}
$('#closeModal').onclick=()=>$('#modalBackdrop').hidden=true;$('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')e.currentTarget.hidden=true};
$('#quickAddBtn').onclick=()=>modal('Quick add',`<div class="tabs"><button class="tab active" data-quick="task">Task</button><button class="tab" data-quick="bill">Bill</button><button class="tab" data-quick="note">Journal note</button></div><div id="quickPane"><input id="quickTaskText" placeholder="What needs to be done?"><button class="primary" id="saveQuickTask" style="margin-top:10px">Add task</button></div>`);
document.addEventListener('click',e=>{
 if(e.target.id==='saveQuickTask'){const v=$('#quickTaskText').value.trim();if(v){state.todayTasks.push({id:crypto.randomUUID(),text:v,done:false});save();renderToday();renderPages();$('#modalBackdrop').hidden=true;toast('Task added')}}
 if(e.target.dataset.quick==='bill'){addBill();$('#modalBackdrop').hidden=true}
 if(e.target.dataset.quick==='note'){const n=prompt('Journal note');if(n){state.texts.journalEntry=(state.texts.journalEntry?state.texts.journalEntry+'\n\n':'')+n;save();toast('Journal updated')}$('#modalBackdrop').hidden=true}
});
$('#settingsBtn').onclick=()=>modal('Settings & backup',`<p class="muted">Your information is saved locally on this device. Export a backup before clearing Safari data or changing phones.</p><button class="primary" id="exportData">Export backup</button><label class="ghost" style="display:inline-block;margin-left:6px">Import backup<input id="importData" type="file" accept=".json" hidden></label><button class="ghost" id="resetApp" style="display:block;margin-top:12px">Reset app data</button><p class="muted" style="margin-top:16px">Version 1.0 · Local-first PWA</p>`);
document.addEventListener('click',e=>{
 if(e.target.id==='exportData'){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='key-collective-backup.json';a.click();URL.revokeObjectURL(a.href)}
 if(e.target.id==='resetApp'&&confirm('Reset all app data on this device?')){localStorage.removeItem(STORAGE_KEY);location.reload()}
});
document.addEventListener('change',e=>{
 if(e.target.id==='importData'){const r=new FileReader();r.onload=()=>{try{state=merge(DEFAULTS,JSON.parse(r.result));save();location.reload()}catch{alert('That backup file could not be read.')}};r.readAsText(e.target.files[0])}
});

function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

// Photo database
let photoCache=[],photoIndex=0;
function openDB(){return new Promise((resolve,reject)=>{const q=indexedDB.open('KeyCollectivePhotosV1',1);q.onupgradeneeded=()=>q.result.createObjectStore('photos',{autoIncrement:true});q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function refreshPhotos(){try{const db=await openDB(),tx=db.transaction('photos','readonly'),q=tx.objectStore('photos').getAll();q.onsuccess=()=>{photoCache=q.result||[];if(photoCache.length){photoIndex=new Date().getDate()%photoCache.length;showPhoto()}}}catch{}}
function showPhoto(){const f=$('#photoFrame');if(f&&photoCache.length)f.innerHTML=`<img src="${photoCache[photoIndex]}" alt="Selected Lani memory">`}
function setupPhotos(){
 const picker=$('#photoPicker');if(!picker)return;
 picker.onchange=async()=>{const files=[...picker.files];if(!files.length)return;const db=await openDB(),tx=db.transaction('photos','readwrite');for(const file of files){const r=new FileReader();await new Promise(done=>{r.onload=()=>{tx.objectStore('photos').add(r.result);done()};r.readAsDataURL(file)})}tx.oncomplete=()=>{refreshPhotos();toast('Photos saved to this device')}};
 $('#nextPhoto').onclick=()=>{if(photoCache.length){photoIndex=(photoIndex+1)%photoCache.length;showPhoto()}};
 $('#clearPhotos').onclick=async()=>{if(!confirm('Remove the selected photos from this app?'))return;const db=await openDB(),tx=db.transaction('photos','readwrite');tx.objectStore('photos').clear();tx.oncomplete=()=>{photoCache=[];$('#photoFrame').textContent='Choose approved photos for this device.'}};
 refreshPhotos();
}

bindPersistent();renderToday();renderWater();renderDashboardBills();renderPages();refreshPhotos();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
