const STORE = "KeyCollectiveOS_v2_1";
const defaults = {
  weeklyFocus: "Build a calm, intentional week",
  water: 0, mood: "Steady", daily: {}, roadmap: {}, wellness: {},
  progress: {book:25,business:20,money:15,wellness:10},
  text: {}, weeklyMoney: "",
  paycheck: {amount:0,bills:0,savings:0,debt:0,living:0},
  bills: [
    {id:crypto.randomUUID(),name:"Preschool",amount:570,due:1,paid:false,notes:"Jelani"},
    {id:crypto.randomUUID(),name:"Car note",amount:246.63,due:10,paid:false,notes:"Prefer one week early"},
    {id:crypto.randomUUID(),name:"Car insurance",amount:218.75,due:21,paid:false,notes:"Progressive monthly equivalent"},
    {id:crypto.randomUUID(),name:"Phone",amount:90,due:29,paid:false,notes:"Potential future Mint Mobile savings"},
    {id:crypto.randomUUID(),name:"Gym",amount:52.98,due:29,paid:false,notes:""},
    {id:crypto.randomUUID(),name:"Apple Card minimum",amount:126,due:31,paid:false,notes:""}
  ],
  debts: [
    {id:crypto.randomUUID(),name:"Apple Card",balance:4015.52,target:0,payment:126},
    {id:crypto.randomUUID(),name:"Capital One",balance:9947.11,target:0,payment:0},
    {id:crypto.randomUUID(),name:"Car loan",balance:6689.66,target:0,payment:246.63},
    {id:crypto.randomUUID(),name:"Affirm",balance:1035.41,target:0,payment:0},
    {id:crypto.randomUUID(),name:"Klarna",balance:235.38,target:0,payment:96}
  ],
  savingsGoals: [
    {id:crypto.randomUUID(),name:"Emergency fund",current:0,target:1000},
    {id:crypto.randomUUID(),name:"Mint Mobile switch",current:0,target:180}
  ],
  subscriptions: [
    {id:crypto.randomUUID(),name:"Netflix",amount:12,due:0,active:true},
    {id:crypto.randomUUID(),name:"Peacock",amount:17,due:8,active:true},
    {id:crypto.randomUUID(),name:"Disney+",amount:21.75,due:2,active:true},
    {id:crypto.randomUUID(),name:"Apple Music",amount:11.96,due:21,active:true},
    {id:crypto.randomUUID(),name:"ChatGPT Plus",amount:20,due:0,active:true}
  ],
  buildHistory:[
    {title:"Milestone 1 — v2.0",date:"July 2026",notes:"Luxury dashboard, expanded navigation, Jay's Workspace, and core app foundations."},
    {title:"Milestone 2 — v2.1",date:"July 2026",notes:"Money Center, paycheck planner, debt and savings tools, dashboard financial snapshot, and smarter workspace."}
  ],
  workspace: [
    {id: crypto.randomUUID(), title:"Launch The Key Collective OS v2.0", category:"App Update", priority:"High", notes:"Redesigned dashboard, expanded navigation, and Jay's Workspace.", status:"Completed", created:Date.now()},
    {id: crypto.randomUUID(), title:"Build Money Center v2.1", category:"Budget", priority:"High", notes:"Paycheck planner, bills, debt, savings, and subscription tools.", status:"Open", created:Date.now()},
    {id: crypto.randomUUID(), title:"Expand Book HQ and Business tools", category:"Business", priority:"Medium", notes:"Milestone v2.2.", status:"Open", created:Date.now()}
  ]
};

function migrate(){
  let incoming = {};
  for (const key of ["KeyCollectiveOS_v2","keyCollectiveStateV2","KeyCollectivePersonalEdition_v1","KeyCollectiveOSv1"]) {
    try { incoming = {...incoming, ...(JSON.parse(localStorage.getItem(key)||"{}"))}; } catch {}
  }
  const current = JSON.parse(localStorage.getItem(STORE)||"null");
  if(current) return current;
  const state = structuredClone(defaults);
  state.water = incoming.water ?? state.water;
  state.weeklyFocus = incoming.focus ?? state.weeklyFocus;
  state.weeklyMoney = incoming.weeklyMoney ?? incoming.weekly ?? "";
  state.text.journal = incoming.journal ?? incoming.vision ?? "";
  state.text.gratitude = incoming.gratitude ?? "";
  state.text.laniMemory = incoming.laniMemory ?? incoming.memoryNote ?? "";
  state.text.mealPlan = incoming.mealPlan ?? "";
  state.text.groceryList = incoming.groceryList ?? "";
  state.text.careerWins = incoming.careerWin ?? "";
  state.text.contentIdeas = incoming.businessIdea ?? "";
  state.daily = incoming.tasks ?? {};
  state.progress = {...state.progress, ...(incoming.progress||{})};
  for (const key of ["paycheck","bills","debts","savingsGoals","subscriptions","buildHistory","workspace"]) {
    if (incoming[key]) state[key] = incoming[key];
  }
  if(incoming.nextConversation) state.text.nextConversation = incoming.nextConversation;
  localStorage.setItem(STORE, JSON.stringify(state));
  return state;
}
let S = migrate();
const save = () => localStorage.setItem(STORE, JSON.stringify(S));
const $ = id => document.getElementById(id);
const toast = msg => { const el=$("toast"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2200); };

function switchView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===id));
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));

function updateTime(){
  const now = new Date();
  const azHour = +new Intl.DateTimeFormat("en-US",{timeZone:"America/Phoenix",hour:"2-digit",hourCycle:"h23"}).format(now);
  $("greeting").textContent = `${azHour<12?"Good morning":azHour<17?"Good afternoon":"Good evening"}, Keyona.`;
  $("todayLabel").textContent = new Intl.DateTimeFormat("en-US",{timeZone:"America/Phoenix",weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(now).toUpperCase();
  document.querySelectorAll(".clock").forEach(c=>{
    c.querySelector("strong").textContent = new Intl.DateTimeFormat("en-US",{timeZone:c.dataset.zone,hour:"numeric",minute:"2-digit"}).format(now);
  });
}
updateTime(); setInterval(updateTime,30000);

$("weeklyFocus").value=S.weeklyFocus;
$("weeklyFocus").addEventListener("input",e=>{S.weeklyFocus=e.target.value;save()});
$("waterCount").textContent=S.water;
$("waterAdd").onclick=()=>{S.water=Math.min(8,S.water+1);$("waterCount").textContent=S.water;save()};
$("waterReset").onclick=()=>{S.water=0;$("waterCount").textContent=0;save()};
$("moodSelect").value=S.mood; $("moodDisplay").textContent=S.mood;
$("moodSelect").onchange=e=>{S.mood=e.target.value;$("moodDisplay").textContent=S.mood;save()};

document.querySelectorAll("[data-daily]").forEach(x=>{
  x.checked=!!S.daily[x.dataset.daily];
  x.onchange=()=>{S.daily[x.dataset.daily]=x.checked;save();updateDaily()};
});
function updateDaily(){
  const a=[...document.querySelectorAll("[data-daily]")], done=a.filter(x=>x.checked).length, pct=Math.round(done/a.length*100);
  $("dailyPercent").textContent=pct+"%"; $("dailyBar").style.width=pct+"%"; $("dailyCount").textContent=`${done} of ${a.length} complete`; $("priorityBadge").textContent=`${done} complete`;
}
updateDaily();

document.querySelectorAll("[data-roadmap]").forEach(x=>{x.checked=!!S.roadmap[x.dataset.roadmap];x.onchange=()=>{S.roadmap[x.dataset.roadmap]=x.checked;save()}});
document.querySelectorAll("[data-wellness]").forEach(x=>{x.checked=!!S.wellness[x.dataset.wellness];x.onchange=()=>{S.wellness[x.dataset.wellness]=x.checked;save()}});

document.querySelectorAll("[data-progress]").forEach(x=>{
  const key=x.dataset.progress; x.value=S.progress[key]||0; $(key+"ProgressLabel").textContent=x.value+"%";
  x.oninput=()=>{S.progress[key]=+x.value;$(key+"ProgressLabel").textContent=x.value+"%";save()};
});
document.querySelectorAll("[data-text]").forEach(x=>{const key=x.dataset.text;x.value=S.text[key]||"";x.oninput=()=>{S.text[key]=x.value;save()}});
for(const [id,key] of [["quickCapture","quickCapture"],["growthProof","growthProof"],["aiNotes","aiNotes"],["knowledgeVault","knowledgeVault"],["nextConversation","nextConversation"]]){
  $(id).value=S.text[key]||""; $(id).oninput=e=>{S.text[key]=e.target.value;save()};
}
$("weeklyMoney").value=S.weeklyMoney||"";$("weeklyMoney").oninput=e=>{S.weeklyMoney=e.target.value;save()};

$("sendToJay").onclick=()=>{
  const value=$("quickCapture").value.trim(); if(!value){toast("Write something first.");return}
  S.workspace.unshift({id:crypto.randomUUID(),title:value.slice(0,70),category:"Life",priority:"Medium",notes:value,status:"Open",created:Date.now()});
  S.text.quickCapture="";$("quickCapture").value="";save();renderWorkspace();toast("Sent to Jay's Workspace.");
};

const modal=$("workspaceModal");
$("addWorkspaceItem").onclick=()=>modal.hidden=false;$("closeModal").onclick=()=>modal.hidden=true;
modal.addEventListener("click",e=>{if(e.target===modal)modal.hidden=true});
$("workspaceForm").onsubmit=e=>{
  e.preventDefault();
  S.workspace.unshift({id:crypto.randomUUID(),title:$("itemTitle").value.trim(),category:$("itemCategory").value,priority:$("itemPriority").value,notes:$("itemNotes").value.trim(),status:"Open",created:Date.now()});
  save();e.target.reset();modal.hidden=true;renderWorkspace();toast("Saved to Jay's Workspace.");
};
$("workspaceFilter").onchange=renderWorkspace; $("workspaceSearch").oninput=renderWorkspace;
function renderWorkspace(){
  const filter=$("workspaceFilter").value, q=$("workspaceSearch").value.trim().toLowerCase();
  const items=S.workspace.filter(i=>(filter==="all"||i.priority===filter||i.status===filter||(filter==="favorites"&&i.favorite)) && (!q || `${i.title} ${i.category} ${i.notes}`.toLowerCase().includes(q)));
  $("workspaceItems").innerHTML=items.length?items.map(i=>`
    <div class="workspace-item">
      <div class="workspace-item-head"><h4>${escapeHtml(i.title)}</h4><div class="workspace-actions">
        <button class="star-btn" data-favorite="${i.id}">${i.favorite?"★":"☆"}</button>
        <button data-complete="${i.id}">${i.status==="Completed"?"Reopen":"Complete"}</button>
        <button data-delete="${i.id}">Delete</button>
      </div></div>
      <div class="workspace-meta"><span class="tag">${escapeHtml(i.category)}</span><span class="tag ${i.priority.toLowerCase()}">${i.priority}</span><span class="tag ${i.status.toLowerCase()}">${i.status}</span></div>
      ${i.notes?`<small>${escapeHtml(i.notes)}</small>`:""}
    </div>`).join(""):`<p>No workspace items match this filter.</p>`;
  document.querySelectorAll("[data-favorite]").forEach(b=>b.onclick=()=>{const i=S.workspace.find(x=>x.id===b.dataset.favorite);i.favorite=!i.favorite;save();renderWorkspace()});
  document.querySelectorAll("[data-complete]").forEach(b=>b.onclick=()=>{const i=S.workspace.find(x=>x.id===b.dataset.complete);i.status=i.status==="Completed"?"Open":"Completed";save();renderWorkspace()});
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{S.workspace=S.workspace.filter(x=>x.id!==b.dataset.delete);save();renderWorkspace()});
  $("ideaCount").textContent=S.workspace.filter(i=>i.status!=="Completed").length;
  $("queueCount").textContent=S.workspace.filter(i=>i.status!=="Completed"&&i.category==="App Update").length;
  $("completedCount").textContent=S.workspace.filter(i=>i.status==="Completed").length;
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
renderWorkspace();

let calendarDate=new Date();
function renderCalendar(){
  const y=calendarDate.getFullYear(),m=calendarDate.getMonth();
  $("calendarTitle").textContent=new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(calendarDate);
  const first=new Date(y,m,1), start=new Date(y,m,1-first.getDay());
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  let html=days.map(d=>`<div class="weekday">${d}</div>`).join("");
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const today=new Date(), isToday=d.toDateString()===today.toDateString(), muted=d.getMonth()!==m;
    html+=`<div class="calendar-day ${muted?"muted":""} ${isToday?"today":""}"><strong>${d.getDate()}</strong></div>`;
  }
  $("calendarGrid").innerHTML=html;
}
$("prevMonth").onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()-1);renderCalendar()};
$("nextMonth").onclick=()=>{calendarDate.setMonth(calendarDate.getMonth()+1);renderCalendar()};
renderCalendar();

$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`key-collective-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast("Backup exported.");
};
$("importInput").onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  try{const data=JSON.parse(await file.text());S={...structuredClone(defaults),...data,text:{...defaults.text,...(data.text||{})},progress:{...defaults.progress,...(data.progress||{})}};save();location.reload()}
  catch{toast("That backup file could not be read.");}
};

if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");


function currency(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(n)||0)}
function monthBillTotal(){return S.bills.reduce((t,b)=>t+(Number(b.amount)||0),0)+S.subscriptions.filter(s=>s.active).reduce((t,s)=>t+(Number(s.amount)||0),0)}
function debtTotal(){return S.debts.reduce((t,d)=>t+(Number(d.balance)||0),0)}
function savingsTotal(){return S.savingsGoals.reduce((t,g)=>t+(Number(g.current)||0),0)}
function upcomingBills(){
  const day=new Date().getDate();
  return S.bills.filter(b=>!b.paid && ((b.due>=day&&b.due<=day+7)||(day>24&&b.due<=((day+7)%31))));
}
function updateMoneySummary(){
  const available=Number(S.weeklyMoney)||Math.max(0,(Number(S.paycheck.amount)||0)-["bills","savings","debt","living"].reduce((t,k)=>t+(Number(S.paycheck[k])||0),0));
  const mb=monthBillTotal(),dt=debtTotal(),st=savingsTotal(),up=upcomingBills();
  $("moneyAvailable").textContent=currency(available); $("moneyMonthlyBills").textContent=currency(mb); $("moneyDebtTotal").textContent=currency(dt); $("moneySavingsTotal").textContent=currency(st);
  $("dashboardWeeklyMoney").textContent=currency(available); $("monthlyBillsTotal").textContent=currency(mb); $("dashboardDebtTotal").textContent=currency(dt); $("dashboardSavingsTotal").textContent=currency(st);
  $("upcomingBillsCount").textContent=up.length; $("upcomingBillsText").textContent=up.length?`${up[0].name} due on the ${up[0].due}${ordinal(up[0].due)}`:"Nothing due soon";
}
function ordinal(n){return n%10===1&&n!==11?"st":n%10===2&&n!==12?"nd":n%10===3&&n!==13?"rd":"th"}

document.querySelectorAll(".money-tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".money-tab").forEach(x=>x.classList.toggle("active",x===b));
  document.querySelectorAll(".money-pane").forEach(x=>x.classList.toggle("active",x.id==="money-"+b.dataset.moneytab));
});

for(const [id,key] of [["paycheckAmount","amount"],["paycheckBills","bills"],["paycheckSavings","savings"],["paycheckDebt","debt"],["paycheckLiving","living"]]){
  $(id).value=S.paycheck[key]||"";
  $(id).oninput=e=>{S.paycheck[key]=Number(e.target.value)||0;save();renderPaycheck();updateMoneySummary()};
}
function renderPaycheck(){
  const p=S.paycheck,total=Number(p.amount)||0,used=["bills","savings","debt","living"].reduce((t,k)=>t+(Number(p[k])||0),0),left=total-used,pct=total?Math.min(100,Math.round(used/total*100)):0;
  $("unassignedMoney").textContent=currency(left); $("allocatedBar").style.width=pct+"%"; $("allocationText").textContent=`${pct}% allocated`;
  $("unassignedMessage").textContent=left<0?"You're assigning more than this paycheck contains.":left===0&&total>0?"Every dollar has a job. Beautiful.":"Give every dollar a purpose before it disappears.";
}
renderPaycheck();

function renderBills(){
  const filter=$("billFilter").value;
  const items=S.bills.filter(b=>filter==="all"||(filter==="paid"&&b.paid)||(filter==="unpaid"&&!b.paid)).sort((a,b)=>a.due-b.due);
  $("billsList").innerHTML=items.map(b=>`<div class="finance-row"><div class="name"><strong>${escapeHtml(b.name)}</strong><small>${escapeHtml(b.notes||"")}</small></div><div>${currency(b.amount)}</div><div>Due ${b.due}${ordinal(b.due)}</div><div>${b.paid?"Paid":"Unpaid"}</div><div class="finance-actions"><button data-paybill="${b.id}">${b.paid?"Undo":"Pay"}</button><button data-delbill="${b.id}">×</button></div></div>`).join("")||"<p>No bills here yet.</p>";
  document.querySelectorAll("[data-paybill]").forEach(x=>x.onclick=()=>{const b=S.bills.find(i=>i.id===x.dataset.paybill);b.paid=!b.paid;save();renderBills();updateMoneySummary()});
  document.querySelectorAll("[data-delbill]").forEach(x=>x.onclick=()=>{S.bills=S.bills.filter(i=>i.id!==x.dataset.delbill);save();renderBills();updateMoneySummary()});
}
$("billFilter").onchange=renderBills;

function renderDebts(){
  $("debtsList").innerHTML=S.debts.map(d=>{const original=Number(d.original||d.balance)||1,pct=Math.max(0,Math.min(100,100-(Number(d.balance)||0)/original*100));return `<div class="finance-row"><div class="name"><strong>${escapeHtml(d.name)}</strong><div class="debt-progress"><span style="width:${pct}%"></span></div></div><div>${currency(d.balance)}</div><div>Payment ${currency(d.payment)}</div><div><input type="number" min="0" step=".01" value="${d.balance}" data-debtbalance="${d.id}"></div><div class="finance-actions"><button data-deldebt="${d.id}">×</button></div></div>`}).join("")||"<p>No debts tracked.</p>";
  document.querySelectorAll("[data-debtbalance]").forEach(x=>x.onchange=()=>{const d=S.debts.find(i=>i.id===x.dataset.debtbalance);d.balance=Number(x.value)||0;d.original=d.original||d.balance;save();renderDebts();updateMoneySummary()});
  document.querySelectorAll("[data-deldebt]").forEach(x=>x.onclick=()=>{S.debts=S.debts.filter(i=>i.id!==x.dataset.deldebt);save();renderDebts();updateMoneySummary()});
}
function renderSavings(){
  $("savingsList").innerHTML=S.savingsGoals.map(g=>{const pct=g.target?Math.min(100,Math.round((Number(g.current)||0)/(Number(g.target)||1)*100)):0;return `<div class="finance-row"><div class="name"><strong>${escapeHtml(g.name)}</strong><div class="savings-progress"><span style="width:${pct}%"></span></div></div><div>${currency(g.current)} saved</div><div>Goal ${currency(g.target)}</div><div><input type="number" min="0" step=".01" value="${g.current}" data-savingcurrent="${g.id}"></div><div class="finance-actions"><button data-delsaving="${g.id}">×</button></div></div>`}).join("")||"<p>No savings goals yet.</p>";
  document.querySelectorAll("[data-savingcurrent]").forEach(x=>x.onchange=()=>{const g=S.savingsGoals.find(i=>i.id===x.dataset.savingcurrent);g.current=Number(x.value)||0;save();renderSavings();updateMoneySummary()});
  document.querySelectorAll("[data-delsaving]").forEach(x=>x.onclick=()=>{S.savingsGoals=S.savingsGoals.filter(i=>i.id!==x.dataset.delsaving);save();renderSavings();updateMoneySummary()});
}
function renderSubscriptions(){
  $("subscriptionsList").innerHTML=S.subscriptions.map(s=>`<div class="finance-row"><div class="name"><strong>${escapeHtml(s.name)}</strong></div><div>${currency(s.amount)}</div><div>${s.due?`Due ${s.due}${ordinal(s.due)}`:"Due date not set"}</div><div>${s.active?"Active":"Paused"}</div><div class="finance-actions"><button data-togglesub="${s.id}">${s.active?"Pause":"Activate"}</button><button data-delsub="${s.id}">×</button></div></div>`).join("")||"<p>No subscriptions tracked.</p>";
  document.querySelectorAll("[data-togglesub]").forEach(x=>x.onclick=()=>{const s=S.subscriptions.find(i=>i.id===x.dataset.togglesub);s.active=!s.active;save();renderSubscriptions();updateMoneySummary()});
  document.querySelectorAll("[data-delsub]").forEach(x=>x.onclick=()=>{S.subscriptions=S.subscriptions.filter(i=>i.id!==x.dataset.delsub);save();renderSubscriptions();updateMoneySummary()});
}

const fmodal=$("financeModal");
function openFinance(type){
  $("financeType").value=type;$("financeName").value="";$("financeAmount").value="";$("financeExtra").value="";$("financeNotes").value="";
  const map={bill:["Add bill","Due day"],debt:["Add debt","Monthly payment"],savings:["Add savings goal","Target amount"],subscription:["Add subscription","Due day"]};
  $("financeModalTitle").textContent=map[type][0];$("financeExtraLabel").firstChild.textContent=map[type][1];fmodal.hidden=false;
}
$("addBillBtn").onclick=()=>openFinance("bill");$("addDebtBtn").onclick=()=>openFinance("debt");$("addSavingsBtn").onclick=()=>openFinance("savings");$("addSubscriptionBtn").onclick=()=>openFinance("subscription");
$("closeFinanceModal").onclick=()=>fmodal.hidden=true;fmodal.addEventListener("click",e=>{if(e.target===fmodal)fmodal.hidden=true});
$("financeForm").onsubmit=e=>{
  e.preventDefault();const t=$("financeType").value,name=$("financeName").value.trim(),amount=Number($("financeAmount").value)||0,extra=Number($("financeExtra").value)||0,notes=$("financeNotes").value.trim();
  if(t==="bill")S.bills.push({id:crypto.randomUUID(),name,amount,due:extra||1,paid:false,notes});
  if(t==="debt")S.debts.push({id:crypto.randomUUID(),name,balance:amount,original:amount,payment:extra,target:0});
  if(t==="savings")S.savingsGoals.push({id:crypto.randomUUID(),name,current:amount,target:extra||amount});
  if(t==="subscription")S.subscriptions.push({id:crypto.randomUUID(),name,amount,due:extra,active:true});
  save();fmodal.hidden=true;renderBills();renderDebts();renderSavings();renderSubscriptions();updateMoneySummary();toast("Saved to Money Center.");
};

$("buildHistory").innerHTML=(S.buildHistory||[]).map(h=>`<div class="history-item"><strong>${escapeHtml(h.title)}</strong><small>${escapeHtml(h.date)} · ${escapeHtml(h.notes)}</small></div>`).join("");

renderBills();renderDebts();renderSavings();renderSubscriptions();updateMoneySummary();
