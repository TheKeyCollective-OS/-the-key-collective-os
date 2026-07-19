const STORE = "KeyCollectiveOS_v2";
const defaults = {
  weeklyFocus: "Build a calm, intentional week",
  water: 0, mood: "Steady", daily: {}, roadmap: {}, wellness: {},
  progress: {book:25,business:20,money:15,wellness:10},
  text: {}, weeklyMoney: "",
  workspace: [
    {id: crypto.randomUUID(), title:"Launch The Key Collective OS v2.0", category:"App Update", priority:"High", notes:"Redesigned dashboard, expanded navigation, and Jay's Workspace.", status:"Completed", created:Date.now()},
    {id: crypto.randomUUID(), title:"Build Money Center v2.1", category:"Budget", priority:"High", notes:"Paycheck planner, bills, debt, savings, and subscription tools.", status:"Open", created:Date.now()},
    {id: crypto.randomUUID(), title:"Expand Book HQ and Business tools", category:"Business", priority:"Medium", notes:"Milestone v2.2.", status:"Open", created:Date.now()}
  ]
};

function migrate(){
  let incoming = {};
  for (const key of ["keyCollectiveStateV2","KeyCollectivePersonalEdition_v1","KeyCollectiveOSv1"]) {
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
for(const [id,key] of [["quickCapture","quickCapture"],["growthProof","growthProof"],["aiNotes","aiNotes"],["knowledgeVault","knowledgeVault"]]){
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
$("workspaceFilter").onchange=renderWorkspace;
function renderWorkspace(){
  const filter=$("workspaceFilter").value;
  const items=S.workspace.filter(i=>filter==="all"||i.priority===filter||i.status===filter);
  $("workspaceItems").innerHTML=items.length?items.map(i=>`
    <div class="workspace-item">
      <div class="workspace-item-head"><h4>${escapeHtml(i.title)}</h4><div class="workspace-actions">
        <button data-complete="${i.id}">${i.status==="Completed"?"Reopen":"Complete"}</button>
        <button data-delete="${i.id}">Delete</button>
      </div></div>
      <div class="workspace-meta"><span class="tag">${escapeHtml(i.category)}</span><span class="tag ${i.priority.toLowerCase()}">${i.priority}</span><span class="tag ${i.status.toLowerCase()}">${i.status}</span></div>
      ${i.notes?`<small>${escapeHtml(i.notes)}</small>`:""}
    </div>`).join(""):`<p>No workspace items match this filter.</p>`;
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
