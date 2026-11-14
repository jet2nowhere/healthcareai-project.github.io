const $=id=>document.getElementById(id),f1=x=>x.toFixed(1);
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const P={none:{mode:0,signoff:0,audit:0,safe:0,train:0,phase:0},rush:{mode:2,signoff:0,audit:0,safe:0,train:0,phase:0},ours:{mode:1,signoff:1,audit:1,safe:1,train:1,phase:1}};
const S=Object.assign({vol:5000},P.ours),MN=["Doctors read everything as today.","AI gives a recommendation; the doctor decides.","AI clears normal-looking scans on its own; fewer human checks."];
let G=null;
/* ---------- tabs ---------- */
document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#tabs button").forEach(x=>x.setAttribute("aria-pressed",x===b));["dir","doc","src"].forEach(t=>$(t).hidden=t!==b.dataset.t)});
/* ---------- setup ---------- */
function ui(){document.querySelectorAll("#mode button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.v===S.mode));["signoff","audit","safe","train","phase"].forEach(k=>$(k).checked=!!S[k]);$("vol").value=S.vol;$("volv").textContent=S.vol.toLocaleString();$("modenote").textContent=MN[S.mode]}
document.querySelectorAll("#mode button").forEach(b=>b.onclick=()=>{S.mode=+b.dataset.v;ui()});
["signoff","audit","safe","train","phase"].forEach(k=>$(k).onchange=()=>{S[k]=$(k).checked?1:0});
$("vol").oninput=()=>{S.vol=+$("vol").value;ui()};
document.querySelectorAll("button[data-p]").forEach(b=>b.onclick=()=>{Object.assign(S,P[b.dataset.p]);ui()});
/* ---------- hospital engine ---------- */
const EV=[
{t:"Staff report the AI seems to miss more findings in elderly patients.",o:[["Pause the AI for elderly scans and audit it ($0.2M)",s=>{s.cost+=.2;s.pause=2;return"Audit run. Slightly slower for two months, but no extra harm."}],["Keep going and gather more data",s=>{s.extra=s.c.vol*.1*(s.c.audit?.004:.015);s.left=3;return s.c.audit?"Your local bias audit limited the damage, but a few findings were still missed.":"The gap went unchecked for three months. More elderly patients were missed."}]]},
{t:"The vendor proposes storing scans on overseas servers to save money.",o:[["Reject it ($0.1M legal cost)",s=>{s.cost+=.1;return"Rejected. Patient data stays local."}],["Accept and save $0.4M",s=>{const k=s.c.safe?.3:1.5;s.cost+=k-.4;return"Saved $0.4M, but fines and contract disputes cost $"+k.toFixed(1)+"M."}]]},
{t:"The vendor announces a price rise on the annual licence.",o:[["Pay the new price",s=>{const k=s.c.phase?.2:1.5;s.cost+=k;return"Paid $"+k.toFixed(1)+"M"+(s.c.phase?" (the budget cap limited the rise).":".")}],["Try to renegotiate",s=>{if(s.r()<.5){s.cost+=.4;return"Negotiation worked: only $0.4M."}s.cost+=2;return"Negotiation failed and the vendor held firm: $2.0M."}]]},
{t:"Good news: the AI flagged a rare tumour that three doctors had overlooked.",o:[["Continue",s=>"A life-saving catch. It shows why the tool is worth considering."]]},
{t:"Audit finds doctors now override the AI in under 1% of cases.",o:[["Add random second-reader checks ($0.1M)",s=>{s.cost+=.1;s.o=Math.max(0,s.o-.3);return"Doctors started challenging the AI again. Over-reliance fell."}],["Leave it for now",s=>{s.o=Math.min(1,s.o+.2);return"Nothing changed. Doctors rely on the AI even more."}]]}];
function init(c,seed){const r=rng(seed),pool=[0,1,2,3,4].sort(()=>r()-.5).slice(0,3),sch={};[3,6,9].forEach((m,i)=>sch[m]=pool[i]);
 return{c,r,m:0,cum:0,base:0,cost:0,o:0,br:0,law:0,ws:0,bws:0,gs:0,gn:0,fa:0,extra:0,left:0,pause:0,sch,seed}}
function advance(s){const c=s.c,ai=c.mode>0;s.m++;const m=s.m;
 const val=c.audit?1:.5,fr=c.audit?.06:.18,ramp=!ai?0:c.phase?(m<=3?.3:m<=6?.6:1):Math.min(1,m/2);
 const load=c.vol/5000,abn=c.vol*.1,m0=.05*(.7+.3*load*load);
 let sp=(c.mode==1?.44:c.mode==2?.55:0)*val;sp*=1-(fr-.06)*2;if(c.signoff&&c.mode==1)sp*=.9;if(s.pause>0){sp*=.9;s.pause--}
 const wait=20*load*load*(1-sp*ramp);s.ws+=wait;s.bws+=20*load*load;
 if(c.mode==2)s.o=.9;else if(ai){let g=.06;if(c.signoff)g*=.5;if(c.train)g*=.6;s.o=Math.min(1,s.o+g)}
 let spend=0;if(ai&&m==1)spend+=(c.phase?.7:1.2)+(c.train?.15:0)+(c.safe?.25:0)+(c.audit?.2:0);if(ai)spend+=.06;
 const red=(c.mode==2?.30:.25)*val,mr=m0*(1-red*ramp)+.05*s.o*ramp,bias=c.audit?.08:.35,mg=mr*(1+bias*ramp);
 let mis=abn*(.7*mr+.3*mg);if(s.left>0){mis+=s.extra;s.left--}
 s.cum+=mis;s.base+=abn*m0;let note="";
 if(ai){s.gs+=mg/mr-1;s.gn++;s.fa+=fr*ramp;
  if(s.r()<.01*(c.safe?.3:1)){s.br++;const k=9.77*(c.safe?.6:1);spend+=k;note=" DATA BREACH: "+(c.safe?"safeguards limited the damage":"records exposed")+" ($"+k.toFixed(1)+"M).";}
  const lw=abn*.05*s.o*ramp*.03*.2*(c.train?.4:1)*(c.mode==2?2:1);s.law+=lw;spend+=lw}
 s.cost+=spend;
 return{m,wait,note,gap:mg/mr-1}}
function result(s){const ai=s.c.mode>0;return{wait:s.ws/12,bwait:s.bws/12,miss:s.cum,bmiss:s.base,gap:s.gn?s.gs/s.gn:0,o:s.o,br:s.br,law:s.law,cost:s.cost,fa:ai?s.fa/12:0}}
function autoRun(c,seed){const s=init(c,seed);for(let i=0;i<12;i++){const e=s.sch[s.m+1];if(c.mode>0&&e!==undefined)EV[e].o[0][1](s);advance(s)}return result(s)}
/* ---------- hospital UI ---------- */
function tiles(s,last){const R=result(s),n=Math.max(s.m,1),ai=s.c.mode>0;
 $("tiles").innerHTML=[["Month",s.m+" of 12",""],["Wait for a report",f1(last?last.wait:20*(s.c.vol/5000)**2)+" h","hours"],["Findings missed so far",Math.round(s.cum)+" (no AI: "+Math.round(s.base)+")",""],["Spend so far","$"+s.cost.toFixed(1)+"M",""]].map(t=>'<div class="tile"><b>'+t[1]+'</b><span>'+t[0]+'</span></div>').join("");
 const gl=(n,v,max,bad)=>'<div class="bar"><div><span>'+n+'</span><span class="'+(v>=bad?"b":"g")+'">'+Math.round(v*100)+'%</span></div><div class="track"><div class="fill" style="width:'+Math.min(100,v/max*100)+'%;background:var(--'+(v>=bad?"bad":"ok")+')"></div></div></div>';
 $("gauges").innerHTML=gl("Over-reliance on AI",s.o,1,.5)+gl("Accuracy gap, under-represented patients",ai?s.gs/Math.max(s.gn,1):0,.5,.15)+gl("Budget used ($3M)",Math.min(s.cost/3,1),1,1)}
function startGame(c,seed){G=init(c,seed);$("setup").hidden=true;$("cmpbox").innerHTML="";$("play").hidden=false;$("end").hidden=true;$("log").innerHTML="";$("evbox").innerHTML="";$("next").disabled=false;tiles(G,null);log("Year begins. "+MN[c.mode]+" "+c.vol.toLocaleString()+" patients per month.")}
function log(t){const d=document.createElement("div");d.innerHTML=t;$("log").prepend(d)}
function nextMonth(){const e=G.sch[G.m+1];if(G.c.mode>0&&e!==undefined&&!G.pending){G.pending=true;$("next").disabled=true;
  $("evbox").innerHTML='<div class="event"><b>Month '+(G.m+1)+' decision</b><p>'+EV[e].t+'</p><div class="stack">'+EV[e].o.map((o,i)=>'<button data-i="'+i+'">'+o[0]+'</button>').join("")+'</div></div>';
  $("evbox").querySelectorAll("button").forEach(b=>b.onclick=()=>{const m=EV[e].o[+b.dataset.i][1](G);G.pending=false;$("evbox").innerHTML="";log('<span class="w">Month '+(G.m+1)+' decision:</span> '+m);$("next").disabled=false;step()});return}
 step()}
function step(){const r=advance(G);log("Month "+r.m+": wait "+f1(r.wait)+" h, "+Math.round(G.cum)+" findings missed so far."+(r.note?' <span class="b">'+r.note+'</span>':""));tiles(G,r);if(G.m>=12)finish()}
function finish(){$("next").disabled=true;const R=result(G),ai=G.c.mode>0,saved=R.bmiss-R.miss;
 const ck=[["Over-reliance under 50%",R.o<.5,Math.round(R.o*100)+"%","conditions 1 and 4"],["Accuracy gap under 15%",R.gap<.15,Math.round(R.gap*100)+"%","condition 2"],["No data breach",R.br==0,R.br+" incident(s)","condition 3"],["Legal exposure under $0.3M",R.law<.3,"$"+R.law.toFixed(2)+"M","conditions 1 and 4"],["Total cost under $3M",R.cost<3,"$"+R.cost.toFixed(1)+"M","condition 5"]];
 const fails=ck.filter(c=>!c[1]);let v;
 if(!ai)v="No AI means no new risk, but waits stayed at "+f1(R.wait)+" hours and about "+Math.round(R.bmiss)+" findings were missed. This is the cost of inaction.";
 else if(!fails.length&&saved>0)v="All five checks passed and about "+Math.round(saved)+" fewer findings were missed. Waits fell from "+f1(R.bwait)+" to "+f1(R.wait)+" hours. This matches our recommendation: implement under conditions.";
 else v="Missed findings changed by "+(saved>=0?"-":"+")+Math.abs(Math.round(saved))+", but "+fails.length+" check(s) failed: "+fails.map(c=>c[0]).join("; ")+". Relevant: "+fails[0][3]+".";
 $("end").hidden=false;$("end").innerHTML='<div class="panel"><h2>Year-end report</h2><div class="scroll"><table><tr><th>Measure</th><th>No AI</th><th>Your year</th></tr><tr><td>Average wait (hours)</td><td>'+f1(R.bwait)+'</td><td>'+f1(R.wait)+'</td></tr><tr><td>Findings missed</td><td>'+Math.round(R.bmiss)+'</td><td>'+Math.round(R.miss)+'</td></tr><tr><td>Scans flagged unnecessarily</td><td>0%</td><td>'+Math.round(R.fa*100)+'%</td></tr><tr><td>Total cost</td><td>$0M</td><td>$'+R.cost.toFixed(1)+'M</td></tr></table></div><div class="verdict">'+v+'</div>'+
 '<h2>Risk checks</h2><ul>'+ck.map(c=>'<li><span class="'+(c[1]?"g":"b")+'">'+(c[1]?"Pass":"Fail")+'</span> '+c[0]+' ('+c[2]+')'+(c[1]||!ai?"":' <span class="note">fix: '+c[3]+'</span>')+'</li>').join("")+'</ul>'+
 '<div class="row" style="margin-top:14px"><button class="pri" id="again">Change choices and replay</button><button id="rr">New random events</button></div></div>';
 $("again").onclick=reset;$("rr").onclick=()=>startGame(Object.assign({},S),Math.floor(Math.random()*9999)+1)}
function reset(){$("play").hidden=true;$("end").hidden=true;$("setup").hidden=false;window.scrollTo(0,0)}
$("start").onclick=()=>startGame(Object.assign({},S),7);$("next").onclick=nextMonth;$("restart").onclick=reset;
$("cmp").onclick=()=>{const rows=[["No AI",P.none],["Rush it",P.rush],["Our plan",P.ours]].map(([n,p])=>{const R=autoRun(Object.assign({vol:S.vol},p),7);return'<tr><td>'+n+'</td><td>'+f1(R.wait)+' h</td><td>'+Math.round(R.miss)+'</td><td>'+Math.round(R.gap*100)+'%</td><td>'+R.br+'</td><td>$'+R.cost.toFixed(1)+'M</td></tr>'}).join("");
 $("cmpbox").innerHTML='<div class="panel"><h2>Same year, same luck (prudent choices at each decision)</h2><div class="scroll"><table><tr><th>Strategy</th><th>Wait</th><th>Missed</th><th>Bias gap</th><th>Breaches</th><th>Cost</th></tr>'+rows+'</table></div></div>'};
/* ---------- doctor's desk ---------- */
const CA=["Cough for 3 weeks, long-term smoker. Small shadow near the lung edge.","Night sweats and weight loss. Thickening noted on the previous scan.","Persistent chest pain with a family history of lung disease.","Breathlessness worsening over a month. Reduced air entry."];
const CN=["Routine check, no symptoms. Lung fields look clear.","Mild cough after a cold, now resolved. Nothing abnormal noted.","Pre-surgery screening, no symptoms. Previous scans unremarkable.","Sports-injury follow-up. No chest complaints."];
let D=null;
function genCases(seed){const r=rng(seed),a=[];for(let i=0;i<10;i++){const gb=r()<.3,truth=r()<.4,clueSays=r()<.8?truth:!truth,aiSays=r()<(gb?.65:.9)?truth:!truth;
 a.push({gb,truth,clueSays,aiSays,age:gb?70+Math.floor(r()*18):25+Math.floor(r()*40),sex:r()<.5?"Female":"Male",conf:88+Math.floor(r()*10),clue:(clueSays?CA:CN)[Math.floor(r()*4)]})}return a}
$("dstart").onclick=()=>{D={i:0,cases:genCases(Math.floor(Math.random()*9999)+1),res:[],second:3};showCase()};
function showCase(){if(D.i>=10)return doneDesk();const c=D.cases[D.i];
 $("dplay").innerHTML='<div class="panel"><h2>Patient '+(D.i+1)+' of 10</h2><div class="case"><b>'+c.sex+', age '+c.age+'</b><p>'+c.clue+'</p><div class="ai">AI recommendation: '+(c.aiSays?"ABNORMAL":"NORMAL")+' (confidence '+c.conf+'%)</div></div><div class="stack"><button data-a="agree">Agree with the AI</button><button data-a="over">Overrule the AI</button><button data-a="second" '+(D.second?"":"disabled")+'>Order a second opinion ('+D.second+' left, adds delay)</button></div></div>';
 $("dplay").querySelectorAll("button").forEach(b=>b.onclick=()=>decide(b.dataset.a))}
function decide(a){const c=D.cases[D.i];let final,r;if(a=="second"){D.second--;final=Math.random()<.95?c.truth:!c.truth}else final=a=="agree"?c.aiSays:!c.aiSays;
 D.res.push({a,ok:final===c.truth,aiOk:c.aiSays===c.truth,gb:c.gb,clueOk:c.clueSays===c.truth});const x=D.res[D.res.length-1];
 $("dplay").innerHTML='<div class="panel"><h2>Outcome</h2><p><b class="'+(x.ok?"g":"b")+'">'+(x.ok?"Correct decision.":"Wrong decision.")+'</b> The patient’s scan was truly <b>'+(c.truth?"abnormal":"normal")+'</b>. The AI was <b class="'+(x.aiOk?"g":"b")+'">'+(x.aiOk?"right":"wrong")+'</b>'+(a=="agree"&&!x.aiOk?" and you followed it.":a=="over"&&x.aiOk?" and you overruled a correct recommendation.":".")+(c.gb?' <span class="note">(Patient aged 70+: the group the AI was trained on least.)</span>':"")+'</p><button class="pri" id="nx">'+(D.i<9?"Next patient":"See results")+'</button></div>';
 $("nx").onclick=()=>{D.i++;showCase()}}
function doneDesk(){const R=D.res,n=R.length,p=x=>Math.round(x/n*100)+"%",cnt=f=>R.filter(f).length;
 const fw=cnt(x=>x.a=="agree"&&!x.aiOk),ow=cnt(x=>x.a=="over"&&x.aiOk),gb=R.filter(x=>x.gb),go=R.filter(x=>!x.gb);
 const acc=a=>a.length?Math.round(a.filter(x=>x.aiOk).length/a.length*100)+"%":"n/a";
 $("dplay").innerHTML='<div class="panel"><h2>Your shift results</h2><div class="scroll"><table><tr><th>Measure</th><th>Result</th></tr><tr><td>Your accuracy</td><td>'+p(cnt(x=>x.ok))+'</td></tr><tr><td>AI alone</td><td>'+p(cnt(x=>x.aiOk))+'</td></tr><tr><td>Clinical notes alone</td><td>'+p(cnt(x=>x.clueOk))+'</td></tr><tr><td>Times you followed a wrong AI</td><td>'+fw+'</td></tr><tr><td>Times you overruled a correct AI</td><td>'+ow+'</td></tr><tr><td>AI accuracy, patients 70+ / under 70</td><td>'+acc(gb)+' / '+acc(go)+'</td></tr><tr><td>Second opinions used</td><td>'+(3-D.second)+'</td></tr></table></div>'+
 '<div class="verdict">'+(fw>=2?"You followed the AI when it was wrong "+fw+" times. This is automation bias, our top risk. Notice the AI’s confidence stayed high even when it was wrong. ":fw==1?"You followed a wrong recommendation once. Even careful doctors do this, which is why our plan requires sign-off and training. ":"You caught every wrong recommendation. Training and the doctor sign-off are what make that possible. ")+(gb.length&&gb.filter(x=>!x.aiOk).length>0?"The AI was less accurate for older patients, which is why we require a bias audit before launch.":"")+'</div><button class="pri" id="again2">Play another shift</button></div>';
 $("again2").onclick=()=>{D={i:0,cases:genCases(Math.floor(Math.random()*9999)+1),res:[],second:3};showCase()}}
ui();
