
var KEY="nura-v4", TKEY="nura-theme";
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function uid(){ return Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]}); }
function iso(d){ var t=new Date(d); return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); }
function today(){ return iso(new Date()); }
function addDays(s,n){ var d=new Date(s+"T00:00:00"); d.setDate(d.getDate()+n); return iso(d); }
function diff(a,b){ return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/864e5); }
function fmt(s,o){ try{ return new Date(s+"T00:00:00").toLocaleDateString(LOCALE,o||{day:"numeric",month:"short"}); }catch(e){ return s; } }
function cap(s){ return s?s.charAt(0).toUpperCase()+s.slice(1):s; }
function n1(x){ return (Math.round(x*10)/10).toFixed(1).replace(".",L10N.dec); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function mix(hex,a){ var h=String(hex||"").replace("#",""); if(h.length!==6) return "transparent";
  return "rgba("+parseInt(h.substr(0,2),16)+","+parseInt(h.substr(2,2),16)+","+parseInt(h.substr(4,2),16)+","+a+")"; }
var DAYS=L10N.dias, D3=L10N.d3, INI=L10N.ini;
/* la semana puede ser el horario del colegio (5 días, con recreo) o una
   semana libre (7 días, las horas que tú digas y texto libre en cada hueco) */
function agenda(){ var a=S.agenda||{}; return {modo:a.modo||"clase", ini:a.ini||"07:00", fin:a.fin||"22:00", paso:a.paso||60}; }
function esLibre(){ return agenda().modo==="libre"; }
function nDias(){ return esLibre()?7:5; }
function claveCelda(d,ci){ return (esLibre()?"L":"")+d+"-"+ci; }
function slotsLibres(){
  var a=agenda(), out=[], m=toMin(a.ini), fin=toMin(a.fin), i=0;
  while(m<fin && i<40){ out.push({t:toHM(m), e:toHM(Math.min(m+a.paso,fin)), ci:i}); m+=a.paso; i++; }
  return out;
}
var DIFFL={ alta:{l:"Alta",c:"var(--alert)"}, media:{l:"Media",c:"var(--warn)"}, baja:{l:"Suave",c:"var(--good)"} };
/* un evento puede ser un examen, una entrega o cualquier otra cosa */
var TIPOS={ examen:{l:"Examen"}, entrega:{l:"Entrega"}, otro:{l:"Evento"} };
function tipoDe(e){ return (e && TIPOS[e.tipo]) ? e.tipo : "examen"; }
function tipoL(e){ return TIPOS[tipoDe(e)].l; }
var PAL=["#4f46e5","#7c5cd6","#0f9d58","#c2740b","#d64545","#0b8fa8","#5b7cfa","#c2408f"];
var ICON_LLAMA='<svg viewBox="0 0 24 24" style="width:1.1em;height:1.1em;display:inline-block;vertical-align:-.17em;margin-left:.26em" fill="currentColor" aria-hidden="true">'+
  '<path d="M12 2.4c3.8 4.2 6 7.2 6 10.6a6 6 0 0 1-12 0c0-2.1.9-3.8 2.3-5.3-.1 1.5.4 2.5 1.2 3C9.8 7.5 10.6 5 12 2.4z"/></svg>';
/* comodín de racha: un escudo que protege la llama */
var ICON_COMODIN='<svg viewBox="0 0 24 24" style="width:1.1em;height:1.1em;display:inline-block;vertical-align:-.17em;margin-left:.26em" fill="currentColor" fill-rule="evenodd" aria-hidden="true">'+
  '<path d="M12 2.3 19.6 5.2v5.9c0 4.9-3.2 8.8-7.6 10.6-4.4-1.8-7.6-5.7-7.6-10.6V5.2z M12 7.1c1.9 2.1 3.1 3.7 3.1 5.4a3.1 3.1 0 0 1-6.2 0c0-1.1.47-1.95 1.18-2.72-.05.77.2 1.3.62 1.55.1-1.6.52-2.9 1.3-4.23z"/></svg>';
var ICON_TRASH='<svg viewBox="0 0 24 24" class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
var ICON_PEN='<svg viewBox="0 0 24 24" class="w-[14px] h-[14px]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z"/></svg>';
var ICON_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
var ICON_LOCK='<svg viewBox="0 0 24 24" class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

function toMin(h){ var q=String(h||"08:00").split(":"); return (+q[0])*60+(+q[1]||0); }
function toHM(m){ m=Math.max(0,Math.round(m)); return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); }
function defaultTimetable(){
  return [ {start:"08:00",len:55,before:3,after:4,brk:20},{start:"08:00",len:55,before:3,after:3,brk:30},
           {start:"09:00",len:55,before:2,after:4,brk:15},{start:"08:00",len:55,before:3,after:4,brk:20},
           {start:"08:00",len:55,before:3,after:3,brk:30} ];
}
function ttOf(d){ return (S.timetable&&S.timetable[d])||{start:"08:00",len:55,before:3,after:3,brk:20}; }
function slotsFor(d){
  if(esLibre()) return slotsLibres();
  var c=ttOf(d), out=[], m=toMin(c.start), i;
  for(i=0;i<c.before;i++){ out.push({t:toHM(m),e:toHM(m+c.len),ci:i}); m+=c.len; }
  if(c.brk>0){ out.push({r:1,t:toHM(m),e:toHM(m+c.brk),min:c.brk}); m+=c.brk; }
  for(i=0;i<c.after;i++){ out.push({t:toHM(m),e:toHM(m+c.len),ci:c.before+i}); m+=c.len; }
  return out;
}
function dayRange(d){ var sl=slotsFor(d); return sl.length? sl[0].t+" – "+sl[sl.length-1].e : "—"; }

/* ════════ retos y logros ════════ */
function defaultChallenges(){
  return TEXTOS.retos.map(function(t){ return {id:uid(), text:t}; });
}
function namedChallenges(){ return []; }
var MEDALS=[
  {id:"m1",xp:40,f:function(s){ return s.ch>=1 }},
  {id:"m2",xp:90,f:function(s){ return s.best>=7 }},
  {id:"m3",xp:175,f:function(s){ return s.best>=30 }},
  {id:"m4",xp:90,f:function(s){ return s.ch>=50 }},
  {id:"m5",xp:175,f:function(s){ return s.ch>=100 }},
  {id:"m6",xp:90,f:function(s){ return s.gym>=20 }},
  {id:"m7",xp:175,f:function(s){ return s.gym>=100 }},
  {id:"m8",xp:90,f:function(s){ return s.sleep>=10 }},
  {id:"m9",xp:90,f:function(s){ return s.lowScreen>=5 }},
  {id:"m10",xp:40,f:function(s){ return s.perfect>=1 }},
  {id:"m11",xp:90,f:function(s){ return s.perfect>=5 }},
  {id:"m12",xp:90,f:function(s){ return s.tasksDone>=10 && s.pending===0 }},
  {id:"m13",xp:90,f:function(s){ return s.examsPast>=10 }},
  {id:"m14",xp:0,lvlGate:1,f:function(s){ return s.lvl>=26 }},
  {id:"m15",xp:0,lvlGate:1,f:function(s){ return s.lvl>=LVL_NAMES.length }},
  {id:"m16",xp:40,f:function(s){ return s.triples>=1 }},
  {id:"m17",xp:90,f:function(s){ return s.triples>=10 }}
];
/* los nombres y las explicaciones salen de TEXTOS.logros, en el mismo orden */
MEDALS.forEach(function(m,i){ var t=(TEXTOS.logros||[])[i]||{}; m.n=t.n||m.id; m.d=t.d||""; });
/* 40 niveles sin nombre, solo rangos: Bronce, Plata, Oro, Platino, Diamante y
   Esmeralda tienen 5 niveles cada uno; Leyenda tiene 10 */
var LVL_NAMES=(function(){
  var R=[["Bronce",5],["Plata",5],["Oro",5],["Platino",5],["Diamante",5],["Esmeralda",5],["Leyenda",10]],
      N=["I","II","III","IV","V","VI","VII","VIII","IX","X"], l=[];
  R.forEach(function(x){ for(var i=0;i<x[1];i++) l.push(x[0]+" "+N[i]); });
  return l;
})();
TEXTOS.niveles=LVL_NAMES;


/* ════════ estado ════════ */
function seed(){
  var subs=[["Historia de España","HES"],["Historia de la Filosofía","FIL"],["Lengua Castellana","LEN"],["Inglés II","ING"],
            ["Matemáticas CC. Sociales II","MAT"],["Economía de la Empresa","ECO"],["Geografía","GEO"],["Historia del Arte","ART"]]
    .map(function(s,i){ return {id:"s"+(i+1),name:s[0],short:s[1],color:PAL[i%PAL.length]}; });
  return {
    profile:{ name:"", evento:"", ebau:"", school:{ name:"", links:[] } },
    labels:{ app:"Peak.", sub:"", resumen:"Hoy", retos:"Objetivos", vital:"Cuerpo", academico:"Mente", tareas:"Tareas", social:"Social" },
    subjects:subs, schedule:{}, timetable:defaultTimetable(), agenda:{modo:"libre", ini:"07:00", fin:"22:00", paso:60},
    exams:[],
    tasks:[],
    cats:[{id:"acad",name:"Académica",color:"#4f46e5"},{id:"pers",name:"Personal",color:"#0f9d58"}],
    mealNames:["Desayuno","Media mañana","Comida","Merienda","Cena"],
    gym:{}, habits:{}, meals:{},
    ideal:[
      {id:"i1",time:"",text:"Levantarme a la primera",tag:"personal"},
      {id:"i2",time:"",text:"Desayunar en condiciones",tag:"vital"},
      {id:"i3",time:"",text:"Bloque de estudio · 50 min",tag:"estudio"},
      {id:"i4",time:"",text:"Bloque de estudio · 50 min",tag:"estudio"},
      {id:"i5",time:"",text:"Entrenar",tag:"vital"},
      {id:"i6",time:"",text:"Repaso rápido y mochila lista",tag:"estudio"},
      {id:"i7",time:"",text:"Móvil fuera, a dormir",tag:"personal"}
    ],
    checks:{}, challenges:defaultChallenges(), chDone:{}, chPick:{}, plan:{}, parte:{}, modalidad:"", ejemplos:0,
    avisos:{activo:false, hm:7, hn:20, servidor:"", endpoint:""}, descanso:{}, imported:"limpio", tour:false
  };
}
var S=seed(), view="resumen", taskFilter="pend", newCat="c1", cellKey=null, selDay=null;
function curDay(){ return selDay||today(); }
function dayBar(){
  var d=curDay(), isT=d===today(), n=diff(d,today());
  var label = isT? "Hoy" : n===1? "Ayer" : cap(fmt(d,{weekday:"long",day:"numeric",month:"long"}));
  return '<div class="daybar'+(isT?'':' pasado')+'">'+
    '<div class="daybar-fila">'+
    '<button class="icon-btn !w-9 !h-9" data-act="day-prev" aria-label="Día anterior">'+
      '<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>'+
    '<div class="min-w-0 px-1 flex-1">'+
      '<p class="text-[15px] font-bold leading-tight truncate">'+esc(label)+'</p>'+
      '<p class="text-[11.5px] t3 num leading-tight">'+fmt(d,{day:"numeric",month:"long",year:"numeric"})+'</p></div>'+
    '<button class="icon-btn !w-9 !h-9" data-act="day-next" aria-label="Día siguiente" '+(isT?'disabled style="opacity:.35"':'')+'>'+
      '<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>'+
    '<label class="daybar-cal" aria-label="Elegir día">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'+
      '<input type="date" data-act="day-pick" value="'+d+'" max="'+today()+'"></label>'+
    '</div>'+
    (isT?'':'<div class="daybar-aviso"><span>Estás editando un día pasado</span>'+
        '<button data-act="day-today">Volver a hoy</button></div>')+
    '</div>';
}
var MEAL_KEYS=["desayuno","media","comida","merienda","cena"], MEAL_MAIN=[0,2,4];
var TAGV={ estudio:"var(--accent)", vital:"var(--good)", personal:"var(--warn)" };

function load(){
  try{
    var raw=localStorage.getItem(KEY); if(!raw) return false;
    var d=JSON.parse(raw); if(!d||!d.subjects) return false;
    var base=seed();
    Object.keys(base).forEach(function(k){ if(d[k]!==undefined && d[k]!==null) base[k]=d[k]; });
    /* lo que no está en la semilla (diario, ánimo, estudio, retos de la semana, cantidades…) también se queda */
    Object.keys(d).forEach(function(k){ if(base[k]===undefined && d[k]!==undefined && d[k]!==null) base[k]=d[k]; });
    if(!base.labels) base.labels=seed().labels;
    if(!base.cats||!base.cats.length) base.cats=seed().cats;
    if(!base.mealNames) base.mealNames=seed().mealNames;
    if(!base.challenges||!base.challenges.length) base.challenges=defaultChallenges();
    else {
      var have={}; base.challenges.forEach(function(c){ have[c.text]=1; });
      namedChallenges().forEach(function(c){ if(!have[c.text]) base.challenges.push(c); });
    }
    var wd=base.timetable&&base.timetable[2];
    if(wd && wd.start==="09:00" && wd.len===55 && wd.before===3 && wd.after===3 && wd.brk===15)
      base.timetable[2]={start:"09:00",len:55,before:2,after:4,brk:15};
    if(base.labels.app==="Nura"||base.labels.app==="Norte"||base.labels.app==="DuTrack"||base.labels.app==="DTrack") base.labels.app="Peak.";
    var _p0=null;
    for(var _q=0;_q<base.ideal.length;_q++) if(!base.ideal[_q].desde){
      if(_p0===null){ var _kk=Object.keys(base.checks||{}); _kk.sort(); _p0=_kk.length?_kk[0]:today(); }
      base.ideal[_q].desde=_p0;
    }
    if(base.profile.evento==null) base.profile.evento="";
    if(!base.labels.social) base.labels.social="Social";
    if(base.labels.academico==="Académico") base.labels.academico="Organización";
    if(base.labels.retos==="Retos") base.labels.retos="Objetivos";
    if(!base.deportes) base.deportes=[];
    if(!base.deporteDia) base.deporteDia={};
    for(var _e=0;_e<base.exams.length;_e++) if(!base.exams[_e].tipo) base.exams[_e].tipo="examen";
    if(!base.descanso) base.descanso={};
    if(!base.agenda) base.agenda={modo:"libre", ini:"07:00", fin:"22:00", paso:60};
    /* las tres categorías viejas pasan a dos ámbitos: académica o personal */
    if(!base.cats || base.cats.length!==2 || base.cats[0].id!=="acad"){
      var mapa={c1:"acad", c2:"acad", c3:"pers"};
      base.cats=[{id:"acad",name:"Académica",color:"#4f46e5"},{id:"pers",name:"Personal",color:"#0f9d58"}];
      for(var _t=0;_t<base.tasks.length;_t++){
        base.tasks[_t].cat = mapa[base.tasks[_t].cat] || (base.tasks[_t].cat==="pers"?"pers":"acad");
        delete base.tasks[_t].subject;
      }
    }
    if(!base.plan) base.plan={};
    if(!base.parte) base.parte={};
    if(base.modalidad===undefined) base.modalidad="";
    if(base.ejemplos===undefined) base.ejemplos=0;
    if(!base.avisos) base.avisos={activo:false, hm:7, hn:20, servidor:"", endpoint:""};
    if(base.avisos.hm===undefined){ base.avisos.hm=7; base.avisos.hn=base.avisos.hora||20; }
    S=base; return true;
  }catch(e){ return false; }
}
var storageOK=(function(){ try{ localStorage.setItem("__t","1"); localStorage.removeItem("__t"); return true; }catch(e){ return false; } })();
/* si el móvil no deja guardar (sin espacio o en modo privado), se avisa: antes fallaba sin decir nada */
var saveAvisado=0, guardados=0;
function save(){
  guardados++;   /* cuenta de guardados: lo calculado de paso (retos de días pasados) se rehace si algo cambia */
  try{ localStorage.setItem(KEY,JSON.stringify(S)); }
  catch(e){ if(storageOK && Date.now()-saveAvisado>60000){ saveAvisado=Date.now(); setTimeout(function(){ if(typeof avisoNube==="function") avisoNube("No se ha podido guardar en este móvil: puede que no quede espacio. Si tienes cuenta, pulsa «Guardar ahora» en Social."); }, 0); } }
  espejo();
}
function avisoGuardado(){
  if(storageOK || document.getElementById("nosave")) return;
  var d=document.createElement("div");
  d.id="nosave";
  d.style.cssText="position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:70;"+
    "border-radius:16px;padding:13px 15px;font-size:12.5px;line-height:1.45;"+
    "background:color-mix(in srgb,var(--bg) 88%,var(--warn));color:var(--t1);"+
    "box-shadow:0 10px 30px -12px rgba(0,0,0,.5), inset 0 0 0 1px var(--hairline)";
  d.innerHTML='<b>Este navegador no deja guardar nada aquí.</b><br>'+
    'Estás abriendo el archivo directamente. Ábrelo desde la dirección web (o instálalo en la pantalla de inicio) '+
    'y todo se guardará solo.<span style="float:right;font-weight:700;padding-left:12px;cursor:pointer" '+
    'onclick="this.parentNode.remove()">✕</span>';
  document.body.appendChild(d);
}

var TEMAS=[
  {k:"light", n:"Claro"}, {k:"dark", n:"Oscuro"}, {k:"system", n:"Sistema"},
  {k:"sage", n:"Jardín"}, {k:"neo", n:"Clásico"},
  {k:"cielo", n:"Cielo"}, {k:"melocoton", n:"Melocotón"}, {k:"lavanda", n:"Lavanda"}, {k:"menta", n:"Menta"},
  {k:"arena", n:"Arena", nv:7}, {k:"medianoche", n:"Medianoche", nv:10},
  {k:"porcelana", n:"Porcelana", nv:13}, {k:"oro", n:"Oro", nv:16},
  {k:"esmeralda", n:"Esmeralda", nv:26}, {k:"leyenda", n:"Leyenda", nv:31}, {k:"aurora", n:"Aurora", nv:40}
];
var TEMAS_OSCUROS=["dark","medianoche","oro","esmeralda","leyenda","aurora"];
var COLOR_TEMA={ cielo:"#eaf1fa", melocoton:"#fbeee6", lavanda:"#f0ecfa", menta:"#e8f5ef", light:"#f5f0e6", dark:"#181715", sage:"#eef3ec", neo:"#ece4d3", arena:"#efe6d8", porcelana:"#ffffff", medianoche:"#000000", oro:"#12100b", esmeralda:"#07140f", leyenda:"#110a1b", aurora:"#06121a" };
function applyTheme(mode){
  var root=document.documentElement;
  var real=mode;
  if(mode==="system") real=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  root.classList.remove("dark","sage","neo","medianoche","oro","arena","porcelana","esmeralda","leyenda","aurora","cielo","melocoton","lavanda","menta");
  if(real!=="dark" && TEMAS_OSCUROS.indexOf(real)>=0) root.classList.add("dark");
  if(real!=="light") root.classList.add(real);
  if(typeof aplicaAcento==="function") aplicaAcento();
  var mt=document.querySelector('meta[name="theme-color"]');
  if(mt) mt.setAttribute("content", COLOR_TEMA[real]||"#f5f0e6");
  if(typeof pintarIcono==="function") pintarIcono(real);
  if(typeof medRepinta==="function") medRepinta();
  pintaIconoTema(real);
}
/* cada tema tiene su icono en el botón de cambiar tema */
var ICONOS_TEMA={
  cielo:'<path d="M7 17.5h10.5a3.8 3.8 0 0 0 .4-7.6A5.5 5.5 0 0 0 7.4 9.2 4.2 4.2 0 0 0 7 17.5z"/>',
  melocoton:'<circle cx="12" cy="13.5" r="7"/><path d="M12 6.5c0-2 1.2-3 3.2-3"/><path d="M12 7.5c-2-1.8-4.5-1.8-5.5-.5"/>',
  lavanda:'<path d="M12 21V10"/><path d="M12 10c-1.6-1-1.6-3 0-4 1.6 1 1.6 3 0 4zM12 14c-2-.6-3-2.4-2-4 1.8.3 2.6 2 2 4zM12 14c2-.6 3-2.4 2-4-1.8.3-2.6 2-2 4zM12 18c-2-.6-3-2.4-2-4 1.8.3 2.6 2 2 4zM12 18c2-.6 3-2.4 2-4-1.8.3-2.6 2-2 4z"/>',
  menta:'<path d="M12 20c-4-2-6-5.5-6-9.5C6 7 8.5 4 12 3.5c3.5.5 6 3.5 6 7 0 4-2 7.5-6 9.5z"/><path d="M12 20V8"/><path d="M12 12l-2.5-2M12 15l3-2.5"/>',
  light:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  dark:'<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
  sage:'<path d="M20 4c0 8-5 13-11 13H5c0-8 5-13 11-13h4z"/><path d="M5 20c2-5 5-8 9-10"/>',
  neo:'<path d="M3 20h18M5 20V9M12 20V9M19 20V9M3 9h18l-9-6-9 6z"/>',
  medianoche:'<path d="M17 15.5A7 7 0 0 1 8.5 7a7 7 0 1 0 8.5 8.5z"/><path d="M17.5 3.5v3M16 5h3M20.5 9.5v2M19.5 10.5h2"/>',
  oro:'<path d="M3.5 17.5 2.5 7.5l5.5 4 4-7 4 7 5.5-4-1 10z"/><path d="M4 20.5h16"/>',
  arena:'<path d="M2.5 17c3-3 6-3 9.5 0s6.5 3 9.5 0"/><path d="M2.5 21c3-3 6-3 9.5 0s6.5 3 9.5 0"/><circle cx="16" cy="7" r="3.2"/>',
  porcelana:'<path d="M6 4h12l-1.2 4.5a6 6 0 0 1-9.6 0z"/><path d="M8 11.5c-.8 3.2 0 6.5 4 8.5 4-2 4.8-5.3 4-8.5"/><path d="M9 20.5h6"/>',
  esmeralda:'<path d="M7 3.5h10l4 5.5-9 11.5L3 9z"/><path d="M3 9h18M9.5 3.5 8 9l4 11.5L16 9l-1.5-5.5"/>',
  leyenda:'<path d="M12 2.8l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.2 6.8 19l1-5.9-4.3-4.1 5.9-.8z"/>',
  aurora:'<path d="M3 18c3-7 6-10 9-10s6 3 9 10"/><path d="M6 18c2-4.5 4-6.5 6-6.5s4 2 6 6.5"/><path d="M2.5 21h19"/>'
};
function pintaIconoTema(real){
  var ic=ICONOS_TEMA[real]||ICONOS_TEMA.light;
  $$('[data-act="toggle-theme"]').forEach(function(b){
    b.innerHTML='<svg viewBox="0 0 24 24" style="width:17px;height:17px" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+ic+'</svg>';
  });
}
/* logo de Peak.: el texto (PEAK. en Unbounded con la A de montaña) y la montaña sola,
   en trazos propios para no depender de ninguna fuente */
var PEAK_WM_VB="58 -6 3496 800", PEAK_WM_D="M494 34Q592 34 662.5 67Q733 100 770 159.5Q807 219 807 300Q807 380 770 440Q733 500 662.5 533Q592 566 494 566H173V382H479Q523 382 547.5 360Q572 338 572 300Q572 260 547.5 239Q523 218 479 218H193L298 112V784H65V34ZM1507 327V491H950V327ZM1109 409 1062 699 971 598H1542V784H831L887 409L831 34H1537V220H971L1062 119ZM2092.1 485.8 2082.6 513.7 2183.0 784.0 2213.6 784.0 2097.3 470.7 2119.4 405.8 2107.5 440.7 2235.0 784.0 2265.6 784.0 2092.3 317.3 1994.0 -4.0 1564.0 784.0 2137.3 784.0 2161.6 784.0 2072.4 543.7ZM2091.1 174.0 1995.2 -1.8 2287.0 784.0 2317.6 784.0ZM2253.8 472.2 2157.9 296.3 2339.0 784.0 2369.6 784.0ZM2416.6 770.4 2320.6 594.5 2391.0 784.0 2421.6 784.0ZM2446 784V34H2677V601L2617 552L3016 34H3260L2657 784ZM2805 433 2976 295 3271 784H3007ZM3420 795Q3385 795 3356 778.5Q3327 762 3310.5 733Q3294 704 3294 669Q3294 633 3310.5 604.5Q3327 576 3356 559.5Q3385 543 3420 543Q3456 543 3484.5 559.5Q3513 576 3529.5 604.5Q3546 633 3546 669Q3546 704 3529.5 733Q3513 762 3484.5 778.5Q3456 795 3420 795Z";
var PEAK_MK_D="M450 0 0 900 600 900 525 648 538 607 634 900 680 900 561 534 577 481 714 900 760 900 497 94 594 288ZM594 288 794 900 840 900 727 554ZM900 900 824 748 874 900Z"; /* caja de 900 x 900 */
function peakWM(fill){ return '<svg viewBox="'+PEAK_WM_VB+'" role="img" aria-label="Peak."><path d="'+PEAK_WM_D+'" fill="'+(fill||"currentColor")+'"/></svg>'; }
/* el icono de la pestaña se repinta con el color del modo */
var ICONO_TEMA={ cielo:{b:"#2f7fd8",p:"#fff"}, melocoton:{b:"#e0664a",p:"#fff"}, lavanda:{b:"#7457d9",p:"#fff"}, menta:{b:"#15936c",p:"#fff"}, light:{b:"#1c1b19",p:"#f5f0e6"}, dark:{b:"#f1ebdf",p:"#141311"},
                 sage:{b:"#4f7d63",p:"#ffffff"}, neo:{b:"#2f4a7d",p:"#fbf7ec"},
                 medianoche:{b:"#8f8fff",p:"#000000"}, oro:{b:"#d9ae45",p:"#17130a"},
                 arena:{b:"#b5562f",p:"#fbf6ee"}, porcelana:{b:"#1f4fd1",p:"#ffffff"},
                 esmeralda:{b:"#34c98a",p:"#07140f"}, leyenda:{b:"#b57bff",p:"#110a1b"}, aurora:{b:"#5ee0c8",p:"#06121a"} };
function pintarIcono(real){
  try{
    var c=ICONO_TEMA[real]||ICONO_TEMA.light, n=180;
    var cv=document.createElement("canvas"); cv.width=n; cv.height=n;
    var x=cv.getContext("2d"); if(!x) return;
    x.fillStyle=c.b; x.fillRect(0,0,n,n);
    var e=n*.72/900;
    x.setTransform(e,0,0,e,n*.14,n*.155); x.fillStyle=c.p; x.fill(new Path2D(PEAK_MK_D));
    var url=cv.toDataURL("image/png");
    var ic=document.querySelector('link[rel="icon"]'); if(ic) ic.setAttribute("href",url);
    /* el de la pantalla de inicio se queda siempre el del modo claro (apple-touch-icon.png) */
  }catch(e){}
}
function curTheme(){ try{ return localStorage.getItem(TKEY)||"system"; }catch(e){ return "system"; } }
applyTheme(curTheme());
try{ document.addEventListener("visibilitychange",function(){ if(!document.hidden && typeof medDespierta==="function") medDespierta(); }); }catch(e){}
try{ window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){ if(curTheme()==="system") applyTheme("system"); }); }catch(e){}

/* ════════ consultas ════════ */
function subj(id){ for(var i=0;i<S.subjects.length;i++) if(S.subjects[i].id===id) return S.subjects[i]; return null; }
function catOf(id){ for(var i=0;i<S.cats.length;i++) if(S.cats[i].id===id) return S.cats[i]; return S.cats[0]||{id:"",name:"",color:"#888"}; }
function future(){ return S.exams.filter(function(e){return e.date>=today()}).sort(function(a,b){return a.date<b.date?-1:1}); }
function habit(d){ var h=S.habits[d]||{}; return {water:h.water||0,sleep:h.sleep||0,screen:h.screen==null?null:h.screen}; }
function setHabit(d,p){ var h=S.habits[d]||{}; for(var k in p) h[k]=p[k]; S.habits[d]=h; save(); }
function cellOf(k){ var v=S.schedule[k]; if(!v) return null; if(typeof v==="string") return {sid:v,room:"",note:""}; return v; }
function mealsOf(d){ return S.meals[d]||{}; }
function mealCount(d){ var m=mealsOf(d),c=0; MEAL_MAIN.forEach(function(i){ if((m[MEAL_KEYS[i]]||"").trim()) c++; }); return c; }
function checksOf(d){ return S.checks[d]||[]; }
/* la checklist tiene historia: cada paso sabe desde cuándo existe y, si lo
   archivas, hasta cuándo estuvo. Así los días viejos conservan su techo. */
function primerDia(){
  var k=Object.keys(S.checks||{}).concat(Object.keys(S.habits||{}));
  k.sort(); return k.length? k[0] : today();
}
function idealActivos(){ return S.ideal.filter(function(x){ return !x.hasta; }); }
function idealDe(d){ return S.ideal.filter(function(x){ return (!x.desde || x.desde<=d) && (!x.hasta || d<x.hasta); }); }
function ordenIdeal(lista){
  return lista.map(function(x,i){ return [x,i]; }).sort(function(a,b){
    var ta=a[0].time||"", tb=b[0].time||"";
    if(ta&&tb) return ta<tb? -1 : ta>tb? 1 : a[1]-b[1];
    if(ta) return -1;
    if(tb) return 1;
    return a[1]-b[1];
  }).map(function(p){ return p[0]; });
}
function chOf(d){
  var raw=S.chDone[d]||[]; if(!raw.length) return raw;
  var ok={}; todaysChallenges(d).forEach(function(c){ ok[c.id]=1; });
  return raw.filter(function(id){ return ok[id]; });
}
function wentGym(d){ return !!S.gym[d]; }
function dayIdx(){ var w=new Date().getDay();
  if(esLibre()) return (w+6)%7;                 /* lunes = 0, domingo = 6 */
  return (w===0||w===6)?-1:w-1;
}

/* tres retos del día, estables para esa fecha */
function hash(str){ var h=2166136261; for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function byChId(id){ var l=S.challenges||[]; for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return null; }
function drawChallenges(d){
  var list=S.challenges||[]; if(!list.length) return [];
  if(list.length<=3) return list.slice();
  var out=[], used={}, h=hash(d), n=list.length;
  for(var k=0;k<3;k++){
    var i=(h+k*2654435761)%n, guard=0;
    while(used[i] && guard<n){ i=(i+1)%n; guard++; }
    used[i]=1; out.push(list[i]);
  }
  return out;
}
/* los tres de un día se fijan la primera vez y ya no cambian aunque edites la lista.
   Solo se guardan los de hoy (o los de un día pasado en el que marcaste alguno): pintar el
   año o las estadísticas pasaba por cientos de días vacíos y guardaba los de cada uno, con
   un guardado entero por día. Esos se calculan y se recuerdan mientras no cambie nada. */
var chPickTmp={}, chPickTmpN=-1;
function todaysChallenges(d){
  if(!S.chPick) S.chPick={};
  var saved=S.chPick[d];
  if(saved && saved.length){
    var kept=[]; for(var i=0;i<saved.length;i++){ var c=byChId(saved[i]); if(c) kept.push(c); }
    if(kept.length) return kept;
  }
  var fija = d>=today() || !!(S.chDone && S.chDone[d] && S.chDone[d].length);
  if(!fija){
    if(chPickTmpN!==guardados){ chPickTmp={}; chPickTmpN=guardados; }
    if(chPickTmp[d]) return chPickTmp[d];
  }
  var sel=drawChallenges(d);
  if(sel.length){ if(fija){ S.chPick[d]=sel.map(function(c){ return c.id; }); save(); } else chPickTmp[d]=sel; }
  return sel;
}
function descansoDe(d){ return !!(S.descanso && S.descanso[d]); }
function descansosDelMes(d){
  var mes=d.slice(0,7), n=0;
  for(var k in (S.descanso||{})) if(k.slice(0,7)===mes) n++;
  return n;
}
var DESCANSOS_MES=2;
function activeDay(d){
  if(descansoDe(d)) return true;      /* día de descanso: cuenta como día vivo */
  if(comodinUsado(d)) return true;    /* comodín de racha gastado ese día */
  if(S.rachaPrueba && S.rachaPrueba[d]) return true;   /* solo modo prueba */
  if(chOf(d).length) return true;
  if(wentGym(d)) return true;
  var n=idealDe(d).length||1;
  return checksOf(d).length/n >= .5;
}
function tasksByDay(){
  var m={};
  S.tasks.forEach(function(t){ if(t.done){ var d=t.day||today(); m[d]=(m[d]||0)+1; } });
  return m;
}
function dayXP(d, tmap){
  var x=0, done=chOf(d).length, total=done?todaysChallenges(d).length:0;   /* sin retos hechos, el ×1,5 no puede tocar */
  x += done*15;
  if(wentGym(d)) x+=20;
  x += checksOf(d).length*4;
  if(mealCount(d)>=3) x+=8;
  var h=S.habits[d]||{};
  if((h.sleep||0)>=7) x+=8;
  if((h.water||0)>=8) x+=6;
  if(h.screen!=null && h.screen>0 && h.screen<2) x+=6;
  x += (tmap[d]||0)*6;
  x += estudioXP(d);                   /* temporizador de estudio, con tope diario */
  if(total>0 && done>=total) x=Math.round(x*1.5);
  if(S.retoExtra && S.retoExtra[d]) x+=50;   /* cuarto reto, desde el nivel 7 */
  return x;
}
function tripleDone(d){ var dn=chOf(d).length; if(!dn) return false; var tc=todaysChallenges(d).length; return tc>0 && dn>=tc; }
var NV_XP_BASE=80, NV_XP_CRECE=1.1;
function stats(){
  var s={ch:0,gym:0,sleep:0,lowScreen:0,perfect:0,tasksDone:0,pending:0,examsPast:0,streak:0,best:0,xp:0,lvl:1};
  Object.keys(S.chDone).forEach(function(k){ s.ch+=S.chDone[k].length; });
  Object.keys(S.gym).forEach(function(k){ if(S.gym[k]) s.gym++; });
  Object.keys(S.habits).forEach(function(k){
    var h=S.habits[k]||{};
    if((h.sleep||0)>=7) s.sleep++;
    if(h.screen!=null && h.screen>0 && h.screen<2) s.lowScreen++;
  });
  Object.keys(S.checks).forEach(function(k){ var nk=idealDe(k).length; if(nk && S.checks[k].length>=nk) s.perfect++; });
  s.tasksDone=S.tasks.filter(function(t){return t.done}).length;
  s.pending=S.tasks.filter(function(t){return !t.done}).length;
  s.examsPast=S.exams.filter(function(e){return e.date<today()}).length;

  var tmap=tasksByDay(), seen={};
  [S.chDone,S.gym,S.checks,S.habits,S.meals,tmap].forEach(function(o){ Object.keys(o||{}).forEach(function(k){ seen[k]=1; }); });
  s.xp=0; s.triples=0;
  Object.keys(seen).forEach(function(d){ s.xp += dayXP(d,tmap); if(tripleDone(d)) s.triples++; });

  var lv=1, need=150, acc=0;
  s.lvl=1; s.lvlFloor=0; s.lvlNeed=NV_XP_BASE;

  var d=today();
  if(!activeDay(d)) d=addDays(d,-1);
  while(activeDay(d) && s.streak<400){ s.streak++; d=addDays(d,-1); }
  var run=0, cur=addDays(today(),-400);
  for(var i=0;i<=400;i++){ var day=addDays(cur,i);
    if(activeDay(day)){ run++; if(run>s.best) s.best=run; } else run=0; }
  if(s.streak>s.best) s.best=s.streak;
  s.medXP=0;
  MEDALS.forEach(function(m){ if(!m.lvlGate && m.f(s)) s.medXP+=(m.xp||0); });
  s.xp+=s.medXP;
  if(typeof semanalXP==="function") s.xp+=semanalXP();
  if(typeof metasXP==="function") s.xp+=metasXP();   /* metas del mes */   /* retos de la semana */
  s.xp+=(S.xpPajaros||0);   /* pájaros de la montaña 3D */
  s.xp+=(S.xpPrueba||0)+(typeof grupoXP==="function"?grupoXP():0);              /* solo modo prueba */
  lv=1; need=NV_XP_BASE; acc=0;
  /* 40 niveles: el primero pide 80 XP y cada uno un 10 % más que el anterior */
  while(lv<LVL_NAMES.length && s.xp>=acc+need){ acc+=need; lv++; need=Math.round(need*NV_XP_CRECE); }
  s.lvl=lv; s.lvlFloor=acc; s.lvlNeed=need;
  s.med=MEDALS.filter(function(m){ return m.f(s); }).length;
  return s;
}
function progress(){
  var t=today();
  var _na=idealActivos().length;
  var ideal = _na ? checksOf(t).length/_na : 0;
  var ch = todaysChallenges(t).length ? chOf(t).length/todaysChallenges(t).length : 0;
  var ts=S.tasks, tp = ts.length? ts.filter(function(x){return x.done}).length/ts.length : 1;
  var h=habit(t);
  var vital=((h.water>=8?1:0)+(h.sleep>=7?1:h.sleep/7)+(wentGym(t)?1:0))/3;   /* la comida ya no se apunta */
  return clamp(Math.round((ideal*.35 + ch*.2 + tp*.2 + vital*.25)*100),0,100);
}

