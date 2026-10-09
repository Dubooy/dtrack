try{ if(window.self!==window.top && !window.DTRACK_PRUEBAS) document.documentElement.classList.add("embebido"); }catch(e){ document.documentElement.classList.add("embebido"); }
/* ════ idiomas: inicio ════ */
/* ════════ idiomas ════════
   El español es el de siempre. En ajustes se puede cambiar a inglés, francés
   o italiano: la app se sigue escribiendo en español y, al pintarse, cada
   texto se cambia por su traducción (diccionario + patrones para lo que
   lleva números o nombres). Fechas y días salen en el idioma elegido. */
var IDKEY="dtrack-idioma";
var IDIOMA=(function(){ try{ var v=localStorage.getItem(IDKEY); return (v==="en"||v==="fr"||v==="it")?v:"es"; }catch(e){ return "es"; } })();
var LOCALES={ es:"es-ES", en:"en-GB", fr:"fr-FR", it:"it-IT" }, LOCALE=LOCALES[IDIOMA];
try{ document.documentElement.lang=IDIOMA; }catch(e){}
var IDIOMAS=[
  { k:"es", n:"Español" }, { k:"en", n:"English" }, { k:"fr", n:"Français" }, { k:"it", n:"Italiano" }
];
var BANDERAS={
  es:'<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/></svg>',
  en:'<svg viewBox="0 0 60 40"><clipPath id="bgb"><rect width="60" height="40"/></clipPath><g clip-path="url(#bgb)"><rect width="60" height="40" fill="#012169"/>'+
     '<path d="M0 0 60 40M60 0 0 40" stroke="#fff" stroke-width="8"/><path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" stroke-width="3"/>'+
     '<path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/></g></svg>',
  fr:'<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#002395"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ed2939"/></svg>',
  it:'<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/></svg>'
};
/* días y meses para lo que no pasa por fechas del navegador */
var L10N_TODOS={
  es:{ dias:["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"], d3:["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"],
       ini:["D","L","M","X","J","V","S"], sem:["L","M","X","J","V","S","D"], meses:["E","F","M","A","M","J","J","A","S","O","N","D"], dec:"," },
  en:{ dias:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], d3:["MON","TUE","WED","THU","FRI","SAT","SUN"],
       ini:["S","M","T","W","T","F","S"], sem:["M","T","W","T","F","S","S"], meses:["J","F","M","A","M","J","J","A","S","O","N","D"], dec:"." },
  fr:{ dias:["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"], d3:["LUN","MAR","MER","JEU","VEN","SAM","DIM"],
       ini:["D","L","M","M","J","V","S"], sem:["L","M","M","J","V","S","D"], meses:["J","F","M","A","M","J","J","A","S","O","N","D"], dec:"," },
  it:{ dias:["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"], d3:["LUN","MAR","MER","GIO","VEN","SAB","DOM"],
       ini:["D","L","M","M","G","V","S"], sem:["L","M","M","G","V","S","D"], meses:["G","F","M","A","M","G","L","A","S","O","N","D"], dec:"," }
};
var L10N=L10N_TODOS[IDIOMA];

var TR_MAPA=null, TR_PAT=null;
function trPrepara(){
  if(TR_MAPA) return;
  TR_MAPA={}; TR_PAT=[];
  var col={ en:1, fr:2, it:3 }[IDIOMA]; if(!col) return;
  var I18N_FILAS=window.I18N_FILAS||[], I18N_PATRONES=window.I18N_PATRONES||[];
  for(var i=0;i<I18N_FILAS.length;i++){ var r=I18N_FILAS[i]; if(r && r[col]) TR_MAPA[r[0]]=r[col]; }
  for(var j=0;j<I18N_PATRONES.length;j++){ var p=I18N_PATRONES[j]; if(p && p[col]) TR_PAT.push({ re:new RegExp("^"+p[0]+"$"), t:p[col] }); }
}
function trCore(s, prof){
  if(Object.prototype.hasOwnProperty.call(TR_MAPA, s)) return TR_MAPA[s];
  for(var i=0;i<TR_PAT.length;i++){
    var m=TR_PAT[i].re.exec(s);
    if(m) return TR_PAT[i].t.replace(/\{(t?)(\d)\}/g, function(a, t, n){
      var v=m[+n]||""; if(!t) return v; var x=trCore(v,(prof||0)+1); return x==null?v:x; });
  }
  prof=prof||0; if(prof>2) return null;
  var trozos=null, sep="";
  if(s.indexOf(" · ")>0){ trozos=s.split(" · "); sep=" · "; }
  else if(s.indexOf(": ")>0 && s.length<80){ var k=s.indexOf(": "); trozos=[s.slice(0,k), s.slice(k+2)]; sep=": "; }
  else { var fr=s.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g); if(fr && fr.length>1){ trozos=fr.map(function(x){ return x.trim(); }); sep=" "; } }
  if(!trozos) return null;
  var algo=false, res=trozos.map(function(x){ var y=trCore(x, prof+1); if(y!=null){ algo=true; return y; } return x; });
  return algo ? res.join(sep) : null;
}
function tr(txt){
  if(IDIOMA==="es" || !txt) return txt;
  trPrepara();
  var m=/^(\s*)([\s\S]*?)(\s*)$/.exec(txt), core=m[2];
  if(!core || !/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(core)) return txt;
  var r=trCore(core, 0);
  return r==null ? txt : m[1]+r+m[3];
}
var TR_HECHO=typeof WeakMap!=="undefined" ? new WeakMap() : null;
function trNodo(raiz){
  if(IDIOMA==="es" || !raiz) return;
  if(raiz.nodeType===3){ trTexto(raiz); return; }
  if(raiz.nodeType!==1) return;
  if(raiz.closest && raiz.closest("script,style,textarea,[data-no-tr]")) return;
  var w=document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null), n, lista=[];
  while((n=w.nextNode())) lista.push(n);
  for(var i=0;i<lista.length;i++) trTexto(lista[i]);
  var ats=raiz.querySelectorAll ? raiz.querySelectorAll("[placeholder],[aria-label],[title]") : [];
  var todos=[raiz].concat(Array.prototype.slice.call(ats));
  for(var j=0;j<todos.length;j++){
    var el=todos[j]; if(!el.getAttribute) continue;
    ["placeholder","aria-label","title"].forEach(function(a){
      var v=el.getAttribute(a); if(!v) return;
      var t=tr(v); if(t!==v){ if(!el.__trOrig) el.__trOrig={}; if(el.__trOrig[a]==null){ el.__trOrig[a]=v; TR_TOCADOS.push(el); } el.setAttribute(a,t); }
    });
  }
}
var TR_ORIG=typeof WeakMap!=="undefined" ? new WeakMap() : null, TR_TOCADOS=[];
function trTexto(n){
  if(IDIOMA==="es") return;
  var pe=n.parentNode; if(!pe || pe.nodeType!==1) return;
  var tag=pe.tagName; if(tag==="SCRIPT"||tag==="STYLE"||tag==="TEXTAREA") return;
  if(pe.closest && pe.closest("[data-no-tr]")) return;
  var v=n.nodeValue;
  if(TR_HECHO && TR_HECHO.get(n)===v) return;
  var t=tr(v);
  if(t!==v){ if(TR_ORIG && !TR_ORIG.has(n)){ TR_ORIG.set(n, v); TR_TOCADOS.push(n); if(TR_TOCADOS.length>4000) TR_TOCADOS=TR_TOCADOS.filter(function(x){ return x.isConnected!==false; }); } n.nodeValue=t; }
  if(TR_HECHO) TR_HECHO.set(n, n.nodeValue);
}
var TR_OB=null;
function trArranca(){
  if(IDIOMA==="es") return;
  trNodo(document.body);
  try{ document.title=tr(document.title); }catch(e){}
  if(TR_OB) return;
  var ob=TR_OB=new MutationObserver(function(ms){
    if(IDIOMA==="es") return;
    for(var i=0;i<ms.length;i++){
      var m=ms[i];
      if(m.type==="characterData") trTexto(m.target);
      else if(m.type==="attributes") trNodo(m.target);
      else for(var j=0;j<m.addedNodes.length;j++) trNodo(m.addedNodes[j]);
    }
  });
  ob.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:["placeholder","aria-label","title"] });
}
/* se cambia en vivo, sin recargar (dentro de otras apps recargar no siempre funciona) */
function idiomaPon(k){
  if(!L10N_TODOS[k]) return;
  /* las traducciones van en un archivo aparte: si aún no están, se cargan y se vuelve a llamar */
  if(k!=="es" && !window.I18N_FILAS){
    var sc=document.createElement("script"); sc.src="idiomas-datos.js";
    sc.onload=function(){ idiomaPon(k); }; document.head.appendChild(sc); return;
  }
  try{ if(k==="es") localStorage.removeItem(IDKEY); else localStorage.setItem(IDKEY,k); }catch(e){}
  /* primero se devuelve todo a español */
  for(var i=0;i<TR_TOCADOS.length;i++){
    var n=TR_TOCADOS[i];
    if(n.nodeType===3){ var o=TR_ORIG && TR_ORIG.get(n); if(o!=null && n.isConnected!==false) n.nodeValue=o; }
    else if(n.__trOrig){ for(var a in n.__trOrig) n.setAttribute(a, n.__trOrig[a]); n.__trOrig=null; }
  }
  TR_TOCADOS=[]; TR_ORIG=typeof WeakMap!=="undefined" ? new WeakMap() : null; TR_HECHO=typeof WeakMap!=="undefined" ? new WeakMap() : null;
  IDIOMA=k; LOCALE=LOCALES[k]; L10N=L10N_TODOS[k]; TR_MAPA=null; TR_PAT=null;
  try{ document.documentElement.lang=k; }catch(e){}
  try{ if(typeof render==="function") render(); }catch(e){}
  try{ if(typeof sheetSettings==="function" && !document.getElementById("sheet").hidden && document.querySelector(".idiomas")) sheetSettings(); }catch(e){}
  if(k!=="es") trArranca();
  try{ document.title=(S&&S.labels&&S.labels.app)||"Peak."; if(k!=="es") document.title=tr(document.title); }catch(e){}
}
function selectorIdioma(){
  return '<p class="eyebrow mb-2">Idioma</p>'+
    '<div class="idiomas mb-6" data-no-tr>'+IDIOMAS.map(function(x){
      return '<button data-act="x-idioma" data-k="'+x.k+'" class="'+(x.k===IDIOMA?"on":"")+'">'+
        '<span class="bandera">'+BANDERAS[x.k]+'</span><span>'+x.n+'</span></button>';
    }).join("")+'</div>';
}

/* las tablas de traducción están en beta/idiomas-datos.js (solo se cargan si no es español) */

/* ════ idiomas: fin ════ */
