const STORE="KeyCollectiveReferenceRebuild_v1";
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
  for(const key of [STORE,"KeyCollectiveOS_v2_4","KeyCollectiveOS_v2_3","KeyCollectiveOS_v2_2","KeyCollectiveOS_v2_1","KeyCollectiveOS_v2"]){
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
