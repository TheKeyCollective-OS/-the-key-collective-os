const STORE="KeyCollectiveSmartOS_v3";
const defaults={
  tasks:{},
  laniTasks:{},
  water:0,
  focusMinutes:0,
  streak:1,
  sobrietyStreak:1,
  focus:{title:"Book Week",sub:"Finish Chapter 2 · Stay Consistent · Make Progress"},
  goals:[
    {id:crypto.randomUUID(),title:"Finish Chapter 2",progress:35,done:true},
    {id:crypto.randomUUID(),title:"Launch Website",progress:60,done:true},
    {id:crypto.randomUUID(),title:"Stay within May Budget",progress:80,done:true},
    {id:crypto.randomUUID(),title:"Work Out 4x This Week",progress:50,done:false},
    {id:crypto.randomUUID(),title:"Read 20 Pages Daily",progress:30,done:false},
    {id:crypto.randomUUID(),title:"Plan Q2 Content Calendar",progress:20,done:false}
  ],
  bills:[
    {name:"Apple Music",amount:11.96,due:21},
    {name:"Google Drive",amount:9.99,due:21},
    {name:"Car Insurance",amount:110.66,due:24}
  ],
  progress:[
    {name:"BOOK PROGRESS",icon:"▤",value:35,color:"#6f9475"},
    {name:"BUSINESS",icon:"◉",value:62,color:"#6d9ca3"},
    {name:"CAREER",icon:"▣",value:48,color:"#8db6c6"},
    {name:"MONEY",icon:"$",value:71,color:"#efaa86"},
    {name:"WELLNESS",icon:"♧",value:68,color:"#6f9475"},
    {name:"HOME",icon:"⌂",value:55,color:"#8ba77d"},
    {name:"LANI",icon:"☺",value:60,color:"#d4b46a"}
  ],
  events:[],
  text:{},
  budget:{left:2450,savings:72,debt:48,emergency:65}
};

function load(){
  for(const key of [STORE,"KeyCollectiveReferenceRebuild_v1","KeyCollectiveOS_v2_4","KeyCollectiveOS_v2_3","KeyCollectiveOS_v2_2","KeyCollectiveOS_v2_1","KeyCollectiveOS_v2"]){
    try{
      const d=JSON.parse(localStorage.getItem(key)||"null");
      if(d){
        const s=structuredClone(defaults);
        if(key===STORE)return d;
        if(d.bills)s.bills=d.bills.map(b=>({name:b.name,amount:b.amount,due:b.due||1}));
        if(d.goals)s.goals=d.goals;
        if(d.water)s.water=d.water;
        if(d.text)s.text={...s.text,...d.text};
        if(d.progress && !Array.isArray(d.progress)){
          s.progress=s.progress.map(p=>({...p,value:Number(d.progress[p.name.toLowerCase().split(" ")[0]])||p.value}));
        }
        return s;
      }
    }catch{}
  }
  return structuredClone(defaults);
}
let S=load();
const save=()=>localStorage.setItem(STORE,JSON.stringify(S));
const $=id=>document.getElementById(id);
const esc=s=>(s??"").toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function switchView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  document.querySelectorAll(".nav-link").forEach(n=>n.classList.toggle("active",n.dataset.view===id));
  closeDrawer();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));

function updateTime(){
  const now=new Date(),h=now.getHours();
  $("dayPart").textContent=h<12?"MORNING":h<17?"AFTERNOON":"EVENING";
  document.querySelectorAll(".time-tile").forEach(t=>{
    t.querySelector("strong").textContent=new Intl.DateTimeFormat("en-US",{timeZone:t.dataset.zone,hour:"numeric",minute:"2-digit"}).format(now);
  });
}
updateTime();setInterval(updateTime,30000);

function updateCompletion(){
  const total=6,done=Object.values(S.tasks).filter(Boolean).length,pct=Math.round(done/total*100);
  $("completionRing").style.setProperty("--pct",pct);
  $("completionPercent").textContent=pct+"%";
  $("statTasks").textContent=`${done} / ${total}`;
  $("completionMessage").textContent=pct>=75?"Great momentum!":pct>=40?"You’re building momentum.":"Start with one small win.";
  $("statEvents").textContent=S.events.length;
  $("statFocus").textContent=S.focusMinutes>=60?`${Math.floor(S.focusMinutes/60)}h ${S.focusMinutes%60}m`:`${S.focusMinutes}m`;
  $("statWater").textContent=`${S.water} / 8 cups`;
  $("statStreak").textContent=`${S.streak} day${S.streak===1?"":"s"}`;
  $("wellnessWater").textContent=`${S.water} / 8 cups`;
  $("sobrietyStreak").textContent=`${S.sobrietyStreak} day${S.sobrietyStreak===1?"":"s"}`;
}
updateCompletion();

$("focusDisplay").textContent=S.focus.title;
$("focusSub").innerHTML=esc(S.focus.sub).replaceAll(" · ","<br>· ");
$("editFocus").onclick=()=>{
  const title=prompt("Focus of the week",S.focus.title);if(title===null)return;
  const sub=prompt("Supporting plan",S.focus.sub);if(sub===null)return;
  S.focus={title,sub};save();$("focusDisplay").textContent=title;$("focusSub").innerHTML=esc(sub).replaceAll(" · ","<br>· ");
};

function renderBills(){
  const total=S.bills.reduce((t,b)=>t+Number(b.amount||0),0);
  $("billCount").textContent=S.bills.length;$("billTotal").textContent="-$"+total.toFixed(2);
  $("dashboardBills").innerHTML=S.bills.slice(0,3).map(b=>`<div><span>♙ ${esc(b.name)}</span><strong>$${Number(b.amount).toFixed(2)}</strong></div>`).join("");
  $("moneyPageBills").innerHTML=S.bills.map(b=>`<div>${esc(b.name)} — $${Number(b.amount).toFixed(2)} — due ${b.due}</div>`).join("");
}
renderBills();

let calDate=new Date();
function renderCalendar(){
  const y=calDate.getFullYear(),m=calDate.getMonth(),first=new Date(y,m,1),start=new Date(y,m,1-first.getDay());
  $("monthLabel").textContent=new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(calDate).toUpperCase();
  const days=["SUN","MON","TUE","WED","THU","FRI","SAT"];
  let html=days.map(d=>`<div class="weekday">${d}</div>`).join("");
  for(let i=0;i<35;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const today=d.toDateString()===new Date().toDateString();
    html+=`<div class="${today?"today":""}" style="opacity:${d.getMonth()===m?1:.35}">${d.getDate()}</div>`;
  }
  $("miniCalendar").innerHTML=html;
  $("calendarEventsCount").textContent=`${S.events.length} Events Today`;
}
$("prevMonth").onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar()};
$("todayMonth").onclick=()=>{calDate=new Date();renderCalendar()};
renderCalendar();

function renderGoals(){
  $("goalList").innerHTML=S.goals.map(g=>`<div class="goal-row"><input type="checkbox" data-goalcheck="${g.id}" ${g.done?"checked":""}><span>${esc(g.title)}</span><div class="goal-progress"><i style="width:${g.progress}%"></i></div><strong>${g.progress}%</strong></div>`).join("");
  document.querySelectorAll("[data-goalcheck]").forEach(c=>c.onchange=()=>{const g=S.goals.find(x=>x.id===c.dataset.goalcheck);g.done=c.checked;save()});
}
renderGoals();
const goalModal=$("goalModal");$("addGoal").onclick=()=>goalModal.hidden=false;$("closeGoalModal").onclick=()=>goalModal.hidden=true;
$("goalForm").onsubmit=e=>{e.preventDefault();S.goals.push({id:crypto.randomUUID(),title:$("goalTitle").value.trim(),progress:Number($("goalProgress").value)||0,done:false});save();renderGoals();e.target.reset();goalModal.hidden=true};

function renderProgress(){
  $("progressOverview").innerHTML=S.progress.map(p=>`<div class="progress-line"><span><b style="color:${p.color}">${p.icon}</b>${p.name}</span><div class="bar"><i style="width:${p.value}%;background:${p.color}"></i></div><strong>${p.value}%</strong></div>`).join("");
}
renderProgress();

document.querySelectorAll("[data-lani-task]").forEach(x=>{x.checked=!!S.laniTasks[x.dataset.laniTask];x.onchange=()=>{S.laniTasks[x.dataset.laniTask]=x.checked;save()}});
document.querySelectorAll("[data-text]").forEach(x=>{x.value=S.text[x.dataset.text]||"";x.oninput=()=>{S.text[x.dataset.text]=x.value;save()}});

$("budgetLeft").textContent=`$${Number(S.budget.left).toLocaleString()} left`;
for(const [id,val] of [["savingsBar",S.budget.savings],["debtBar",S.budget.debt],["emergencyBar",S.budget.emergency]])$(id).style.width=val+"%";
$("savingsPct").textContent=S.budget.savings+"%";$("debtPct").textContent=S.budget.debt+"%";$("emergencyPct").textContent=S.budget.emergency+"%";

const drawer=$("mobileDrawer"),backdrop=$("drawerBackdrop"),links=$("drawerLinks");
links.innerHTML=[...document.querySelectorAll(".top-nav .nav-link")].map(n=>n.outerHTML).join("");
links.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
function openDrawer(){drawer.classList.add("open");backdrop.classList.add("show");document.body.style.overflow="hidden"}
function closeDrawer(){drawer.classList.remove("open");backdrop.classList.remove("show");document.body.style.overflow=""}
$("mobileMenu").onclick=openDrawer;$("closeDrawer").onclick=closeDrawer;backdrop.onclick=closeDrawer;

if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js");

/* Sprint 2 functionality */
S.gymDays=S.gymDays||{};
S.journalEntries=S.journalEntries||[];

function dueDateForBill(b){
  const now=new Date(), d=new Date(now.getFullYear(),now.getMonth(),Math.min(Number(b.due)||1,31));
  if(d < new Date(now.getFullYear(),now.getMonth(),now.getDate())) d.setMonth(d.getMonth()+1);
  return d;
}
function renderMoneySprint2(){
  const rows=$('moneyPageBills'); if(!rows)return;
  const sorted=[...S.bills].sort((a,b)=>Number(a.due)-Number(b.due));
  rows.innerHTML=sorted.length?sorted.map((b,i)=>`<div class="data-row"><div><strong>${esc(b.name)}</strong><small>$${Number(b.amount).toFixed(2)} · due day ${b.due}</small></div><span>${dueDateForBill(b).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><button class="danger" data-delete-bill="${S.bills.indexOf(b)}">Delete</button></div>`).join(''):'<div class="empty-state">No bills yet.</div>';
  const total=S.bills.reduce((n,b)=>n+Number(b.amount||0),0), now=new Date();
  const soon=S.bills.filter(b=>(dueDateForBill(b)-now)/86400000<=7).reduce((n,b)=>n+Number(b.amount||0),0);
  if($('moneyMonthlyTotal'))$('moneyMonthlyTotal').textContent=total.toLocaleString('en-US',{style:'currency',currency:'USD'});
  if($('moneyDueSoon'))$('moneyDueSoon').textContent=soon.toLocaleString('en-US',{style:'currency',currency:'USD'});
  if($('moneyBillCount'))$('moneyBillCount').textContent=S.bills.length;
  rows.querySelectorAll('[data-delete-bill]').forEach(x=>x.onclick=()=>{S.bills.splice(Number(x.dataset.deleteBill),1);save();renderBills();renderMoneySprint2()});
}
$('billForm')?.addEventListener('submit',e=>{e.preventDefault();S.bills.push({name:$('billName').value.trim(),amount:Number($('billAmount').value),due:Number($('billDue').value)});save();e.target.reset();renderBills();renderMoneySprint2()});

function renderEventsSprint2(){
  const list=$('eventList'); if(!list)return;
  const sorted=[...S.events].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  list.innerHTML=sorted.length?sorted.map(ev=>`<div class="data-row"><div><strong>${esc(ev.title)}</strong><small>${esc(ev.category||'Personal')} · ${new Date(ev.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}${ev.time?' at '+new Date('2000-01-01T'+ev.time).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):''}</small></div><span></span><button class="danger" data-delete-event="${S.events.indexOf(ev)}">Delete</button></div>`).join(''):'<div class="empty-state">No upcoming events yet.</div>';
  list.querySelectorAll('[data-delete-event]').forEach(x=>x.onclick=()=>{S.events.splice(Number(x.dataset.deleteEvent),1);save();renderEventsSprint2();renderCalendar();updateCompletion()});
}
$('eventForm')?.addEventListener('submit',e=>{e.preventDefault();S.events.push({title:$('eventTitle').value.trim(),date:$('eventDate').value,time:$('eventTime').value,category:$('eventCategory').value});save();e.target.reset();renderEventsSprint2();renderCalendar();updateCompletion()});

const gymNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function weekKey(){const d=new Date(),sun=new Date(d);sun.setDate(d.getDate()-d.getDay());return sun.toISOString().slice(0,10)}
function renderWellnessSprint2(){
  if($('waterCount'))$('waterCount').textContent=`${S.water} / 8`;
  if($('sobrietyCount'))$('sobrietyCount').textContent=`${S.sobrietyStreak} day${S.sobrietyStreak===1?'':'s'}`;
  const key=weekKey();S.gymDays[key]=S.gymDays[key]||{};
  if($('gymWeek')){
    $('gymWeek').innerHTML=gymNames.map((n,i)=>`<button class="gym-day ${S.gymDays[key][i]?'active':''}" data-gym-day="${i}"><strong>${n}</strong><br>${S.gymDays[key][i]?'Done ✓':'Tap'}</button>`).join('');
    $('gymWeek').querySelectorAll('[data-gym-day]').forEach(b=>b.onclick=()=>{S.gymDays[key][b.dataset.gymDay]=!S.gymDays[key][b.dataset.gymDay];save();renderWellnessSprint2()});
    const count=Object.values(S.gymDays[key]).filter(Boolean).length;
    $('gymMessage').textContent=count>=4?'Four sessions complete—you did that.':count>=3?'Three sessions complete. Your weekly goal is met.':`${count} complete. ${3-count} more to reach your minimum goal.`;
  }
  updateCompletion();
}
$('waterMinus')?.addEventListener('click',()=>{S.water=Math.max(0,S.water-1);save();renderWellnessSprint2()});
$('waterPlus')?.addEventListener('click',()=>{S.water=Math.min(20,S.water+1);save();renderWellnessSprint2()});
$('sobrietyMinus')?.addEventListener('click',()=>{S.sobrietyStreak=Math.max(0,S.sobrietyStreak-1);save();renderWellnessSprint2()});
$('sobrietyPlus')?.addEventListener('click',()=>{S.sobrietyStreak+=1;save();renderWellnessSprint2()});

function renderJournalSprint2(){
  const list=$('journalEntries');if(!list)return;
  list.innerHTML=S.journalEntries.length?[...S.journalEntries].reverse().map((j,ri)=>`<div class="journal-entry"><time>${new Date(j.created).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}</time><p>${esc(j.text)}</p><button class="danger" data-delete-journal="${S.journalEntries.length-1-ri}">Delete</button></div>`).join(''):'<div class="empty-state">Your first entry will appear here.</div>';
  list.querySelectorAll('[data-delete-journal]').forEach(b=>b.onclick=()=>{S.journalEntries.splice(Number(b.dataset.deleteJournal),1);save();renderJournalSprint2()});
}
$('journalForm')?.addEventListener('submit',e=>{e.preventDefault();S.journalEntries.push({created:new Date().toISOString(),text:$('journalEntry').value.trim()});save();e.target.reset();renderJournalSprint2()});

renderMoneySprint2();renderEventsSprint2();renderWellnessSprint2();renderJournalSprint2();


/* Sprint 3 — Smart, on-device intelligence */
S.smart=S.smart||{lastPriority:"",lastBriefing:""};

function daysUntil(date){
  return Math.ceil((date-new Date())/86400000);
}
function thisWeekGymCount(){
  const key=weekKey();
  return Object.values((S.gymDays&&S.gymDays[key])||{}).filter(Boolean).length;
}
function smartSnapshot(){
  const now=new Date();
  const bills=[...S.bills].map(b=>({...b,date:dueDateForBill(b)})).sort((a,b)=>a.date-b.date);
  const dueSoon=bills.filter(b=>daysUntil(b.date)<=7);
  const dueTotal=dueSoon.reduce((n,b)=>n+Number(b.amount||0),0);
  const upcoming=[...S.events].filter(e=>new Date(e.date+'T23:59:00')>=now).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  const incomplete=S.goals.filter(g=>!g.done).sort((a,b)=>a.progress-b.progress);
  const gym=thisWeekGymCount();
  const water=Number(S.water||0);
  const priority = incomplete[0]?.title || S.focus.title || 'Choose one meaningful win';
  return {now,bills,dueSoon,dueTotal,upcoming,incomplete,gym,water,priority};
}
function smartRecommendations(){
  const x=smartSnapshot(), items=[];
  if(x.dueSoon.length) items.push({icon:'$',text:`Protect ${x.dueTotal.toLocaleString('en-US',{style:'currency',currency:'USD'})} for ${x.dueSoon.length} bill${x.dueSoon.length===1?'':'s'} due within seven days.`});
  if(x.upcoming.length) items.push({icon:'▦',text:`Prepare for “${x.upcoming[0].title}” on ${new Date(x.upcoming[0].date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}.`});
  if(x.gym<3) items.push({icon:'♧',text:`Schedule ${3-x.gym} more gym session${3-x.gym===1?'':'s'} to reach your weekly minimum.`});
  if(x.water<8) items.push({icon:'◌',text:`You are ${8-x.water} cup${8-x.water===1?'':'s'} away from today’s water goal.`});
  if(x.incomplete.length) items.push({icon:'◎',text:`Move “${x.priority}” forward with one focused 30-minute block.`});
  if(!items.length) items.push({icon:'✦',text:'Your core areas look balanced. Use today for maintenance, rest, or a creative stretch goal.'});
  return items.slice(0,5);
}
function generateBriefing(){
  const x=smartSnapshot();
  let headline='A calm, focused day is available to you.';
  if(x.dueSoon.length>=3) headline='Money needs a little attention this week.';
  else if(x.upcoming.length && daysUntil(new Date(x.upcoming[0].date+'T12:00:00'))<=1) headline='Tomorrow is already asking for preparation.';
  else if(x.gym<2 && new Date().getDay()>=4) headline='Your wellness goal needs a protected time block.';
  else if(x.incomplete.length) headline=`Your clearest next move: ${x.priority}.`;
  const summary=`Your OS reviewed your goals, bills, calendar, hydration, and gym progress. ${x.dueSoon.length?`${x.dueSoon.length} bill${x.dueSoon.length===1?' is':'s are'} due soon. `:'No bills are due in the next seven days. '}${x.upcoming.length?`Your next event is ${x.upcoming[0].title}. `:'Your calendar is currently open. '}You have completed ${x.gym} of your 3–4 weekly gym sessions.`;
  const insights=[
    {label:'Best next action',value:x.priority},
    {label:'Money signal',value:x.dueSoon.length?`${x.dueTotal.toLocaleString('en-US',{style:'currency',currency:'USD'})} due soon`:'Clear for 7 days'},
    {label:'Wellness signal',value:`${x.water}/8 water · ${x.gym}/3 gym`}
  ];
  $('smartHeadline').textContent=headline;
  $('smartSummary').textContent=summary;
  $('smartInsights').innerHTML=insights.map(i=>`<div class="smart-insight"><small>${esc(i.label)}</small><strong>${esc(i.value)}</strong></div>`).join('');
  S.smart.lastPriority=x.priority;S.smart.lastBriefing=summary;save();
  renderSmartHub();
}
function renderSmartHub(){
  const x=smartSnapshot();
  if($('hubPriority')) $('hubPriority').textContent=x.priority;
  if($('hubPressure')) $('hubPressure').textContent=x.dueSoon.length?`${x.dueSoon.length} bills · ${x.dueTotal.toLocaleString('en-US',{style:'currency',currency:'USD'})}`:(x.upcoming[0]?.title||'No urgent pressure');
  if($('hubWellness')) $('hubWellness').textContent=`Water ${x.water}/8 · Gym ${x.gym}/3`;
  if($('recommendationList')) $('recommendationList').innerHTML=smartRecommendations().map(r=>`<div class="recommendation-item"><b>${r.icon}</b><span>${esc(r.text)}</span></div>`).join('');
}
function answerSmartCommand(raw){
  const q=(raw||'').trim().toLowerCase(),x=smartSnapshot();
  if(!q) return 'Ask about today, money, wellness, business, goals, or your schedule.';
  if(q.includes('money')||q.includes('bill')||q.includes('budget')){
    return x.dueSoon.length?`Money check: ${x.dueSoon.length} bill${x.dueSoon.length===1?'':'s'} totaling ${x.dueTotal.toLocaleString('en-US',{style:'currency',currency:'USD'})} are due within seven days. Your practical move is to reserve that amount before assigning money to anything optional.`:'Money check: no bills are due within the next seven days. Use the breathing room to review your next paycheck plan or make a small debt or savings move.';
  }
  if(q.includes('wellness')||q.includes('gym')||q.includes('water')||q.includes('health')){
    const gymNeed=Math.max(0,3-x.gym), waterNeed=Math.max(0,8-x.water);
    return `Wellness check: you have completed ${x.gym} gym session${x.gym===1?'':'s'} this week and logged ${x.water} of 8 cups of water today. ${gymNeed?`Protect time for ${gymNeed} more workout${gymNeed===1?'':'s'}. `:'Your minimum gym goal is met. '}${waterNeed?`Your next tiny win is one cup of water.`:'Your hydration goal is met.'}`;
  }
  if(q.includes('business')||q.includes('book')||q.includes('brand')||q.includes('key collective')){
    const businessGoal=S.goals.find(g=>!g.done && /book|website|content|business|launch/i.test(g.title))||x.incomplete[0];
    return businessGoal?`Business next step: work on “${businessGoal.title}” for one focused hour. Define a finish line before starting—for example, complete one page, one section, or one publishable asset.`:'Business next step: choose one revenue-connected task today—finish a book section, improve the sales page, or create one piece of launch content.';
  }
  if(q.includes('calendar')||q.includes('schedule')||q.includes('event')){
    return x.upcoming.length?`Your next scheduled item is “${x.upcoming[0].title}” on ${new Date(x.upcoming[0].date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}${x.upcoming[0].time?' at '+new Date('2000-01-01T'+x.upcoming[0].time).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):''}. Prepare one thing for it today.`:'Your calendar has no upcoming events saved. This is a good time to intentionally schedule your gym sessions and one Key Collective work block.';
  }
  if(q.includes('today')||q.includes('focus')||q.includes('priority')||q.includes('plan')){
    return `Today’s plan:\n1. Protect your main priority: ${x.priority}.\n2. Complete one practical life-maintenance action: ${x.dueSoon.length?'set aside upcoming bill money':'review the next seven days'}.\n3. Support your body: ${x.water<8?'drink another cup of water':'keep hydration steady'}${x.gym<3?' and schedule your next gym session':'.'}\nKeep the day small enough to finish.`;
  }
  return `Based on your saved OS data, the best next move is “${x.priority}.” You also have ${x.dueSoon.length} bill${x.dueSoon.length===1?'':'s'} due soon, ${x.upcoming.length} upcoming event${x.upcoming.length===1?'':'s'}, and ${x.gym} gym session${x.gym===1?'':'s'} completed this week.`;
}
$('refreshBriefing')?.addEventListener('click',generateBriefing);
$('acceptSmartPriority')?.addEventListener('click',()=>{
  const x=smartSnapshot();
  S.focus={title:x.priority,sub:'Smart priority · Protect one focused block · Finish one clear next step'};
  save();$('focusDisplay').textContent=S.focus.title;$('focusSub').innerHTML='Smart priority<br>· Protect one focused block<br>· Finish one clear next step';
  $('smartResponse') && ($('smartResponse').textContent=`“${x.priority}” is now your focus of the week.`);
});
$('runSmartCommand')?.addEventListener('click',()=>{$('smartResponse').textContent=answerSmartCommand($('smartCommand').value)});
$('smartCommand')?.addEventListener('keydown',e=>{if(e.key==='Enter'){$('smartResponse').textContent=answerSmartCommand(e.target.value)}});
document.querySelectorAll('[data-smart-prompt]').forEach(b=>b.addEventListener('click',()=>{$('smartCommand').value=b.dataset.smartPrompt;$('smartResponse').textContent=answerSmartCommand(b.dataset.smartPrompt)}));

generateBriefing();renderSmartHub();


/* Sprint 4 — Premium controls */
S.premium=S.premium||{theme:'coastal',density:'comfortable',focusMinutes:25,focusSeconds:1500,focusRunning:false,focusSessions:0,routines:[]};
let premiumTimer=null;
function applyPremium(){
  document.body.dataset.premiumTheme=S.premium.theme||'coastal';
  document.body.classList.toggle('compact',S.premium.density==='compact');
  if($('densitySelect')) $('densitySelect').value=S.premium.density||'comfortable';
  document.querySelectorAll('[data-premium-theme]').forEach(b=>b.classList.toggle('active',b.dataset.premiumTheme===S.premium.theme));
}
function renderPremiumTimer(){
  if(!$('focusTimerDisplay')) return;
  const sec=Math.max(0,Number(S.premium.focusSeconds||0));
  $('focusTimerDisplay').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
  if($('statFocus')) $('statFocus').textContent=(Number(S.premium.focusSessions||0)*Number(S.premium.focusMinutes||25))+'m';
}
function stopPremiumTimer(){clearInterval(premiumTimer);premiumTimer=null;S.premium.focusRunning=false;save()}
function startPremiumTimer(){
  if(premiumTimer||S.premium.focusSeconds<=0)return;
  S.premium.focusRunning=true;save();
  premiumTimer=setInterval(()=>{S.premium.focusSeconds-=1;renderPremiumTimer();if(S.premium.focusSeconds<=0){stopPremiumTimer();S.premium.focusSessions+=1;S.premium.focusSeconds=S.premium.focusMinutes*60;save();renderPremiumTimer();if($('focusTimerMessage'))$('focusTimerMessage').textContent='Focused session complete. That is one promise kept.';renderPremiumBadges()}},1000)
}
function setPremiumMinutes(m){stopPremiumTimer();S.premium.focusMinutes=m;S.premium.focusSeconds=m*60;save();renderPremiumTimer()}
function renderRoutines(){
  const list=$('routineList');if(!list)return;
  list.innerHTML=S.premium.routines.length?S.premium.routines.map((r,i)=>`<div class="data-row"><div><strong>${esc(r.name)}</strong><small>${esc(r.day)}${r.time?' · '+new Date('2000-01-01T'+r.time).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):''}</small></div><button class="secondary" data-run-routine="${i}">Use today</button><button class="danger" data-delete-routine="${i}">Delete</button></div>`).join(''):'<div class="empty-state">No recurring routines yet.</div>';
  list.querySelectorAll('[data-delete-routine]').forEach(b=>b.onclick=()=>{S.premium.routines.splice(Number(b.dataset.deleteRoutine),1);save();renderRoutines()});
  list.querySelectorAll('[data-run-routine]').forEach(b=>b.onclick=()=>{const r=S.premium.routines[Number(b.dataset.runRoutine)];S.focus={title:r.name,sub:`Recurring routine · ${r.day}${r.time?' · '+r.time:''}`};save();$('focusDisplay').textContent=S.focus.title;$('focusSub').textContent=S.focus.sub;view('dashboard')});
}
function renderPremiumBadges(){
  const x=smartSnapshot();
  const badges=[['💧','Hydration Hero',x.water>=8],['🏋️','Gym Goal',x.gym>=3],['⏱️','Deep Work',S.premium.focusSessions>=1],['💰','Money Aware',S.bills.length>=3],['📖','Journal Keeper',S.journalEntries.length>=3],['👑','CEO Energy',S.goals.some(g=>/business|book|launch|website/i.test(g.title)&&g.progress>=50)],['🌱','Consistency',Object.values(S.tasks||{}).filter(Boolean).length>=3],['🗝️','OS Builder',true]];
  if($('premiumBadges'))$('premiumBadges').innerHTML=badges.map(b=>`<div class="premium-badge ${b[2]?'unlocked':''}"><span>${b[0]}</span><strong>${b[1]}</strong><small>${b[2]?'Unlocked':'Keep going'}</small></div>`).join('');
}
function exportPremiumData(){
  const blob=new Blob([JSON.stringify({app:'The Key Collective OS',version:4,exportedAt:new Date().toISOString(),data:S},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='the-key-collective-os-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);if($('backupStatus'))$('backupStatus').textContent='Backup downloaded successfully.';
}
function weeklyReset(){
  if($('resetTasks')?.checked) S.tasks={};
  if($('resetWater')?.checked) S.water=0;
  if($('resetReflection')?.checked){S.texts=S.texts||{};['reflection1','reflection2','notes'].forEach(k=>S.texts[k]='')}
  if($('resetGym')?.checked) S.gymDays[weekKey()]={};
  save();location.reload();
}
document.querySelectorAll('[data-premium-theme]').forEach(b=>b.addEventListener('click',()=>{S.premium.theme=b.dataset.premiumTheme;save();applyPremium()}));
$('densitySelect')?.addEventListener('change',e=>{S.premium.density=e.target.value;save();applyPremium()});
document.querySelectorAll('[data-minutes]').forEach(b=>b.addEventListener('click',()=>setPremiumMinutes(Number(b.dataset.minutes))));
$('startFocusTimer')?.addEventListener('click',startPremiumTimer);$('pauseFocusTimer')?.addEventListener('click',stopPremiumTimer);$('resetFocusTimer')?.addEventListener('click',()=>setPremiumMinutes(S.premium.focusMinutes));
$('addRoutine')?.addEventListener('click',()=>{const name=$('routineName').value.trim();if(!name)return;S.premium.routines.push({name,day:$('routineDay').value,time:$('routineTime').value});$('routineName').value='';$('routineTime').value='';save();renderRoutines()});
$('exportData')?.addEventListener('click',exportPremiumData);$('runWeeklyReset')?.addEventListener('click',weeklyReset);
$('importData')?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(r.result);const incoming=parsed.data||parsed;localStorage.setItem(KEY,JSON.stringify(incoming));location.reload()}catch(err){if($('backupStatus'))$('backupStatus').textContent='That backup file could not be read.'}};r.readAsText(f)});
applyPremium();renderPremiumTimer();renderRoutines();renderPremiumBadges();
