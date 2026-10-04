/* ════════════════════════════════════════════════════════════════
   RUTINAS DE ESTIRAR (oct 2026)
   «Estirar» va al final de Cuerpo. Cada rutina es una miniatura como las
   de YouTube: el título en grande con la letra del logo, la persona en la
   postura más clara y las rayas de la montaña detrás. Al tocarla se abre la
   rutina con los estiramientos en orden; ahí se cambian los segundos, el
   orden o se quita alguno, y se empieza. También se puede crear una rutina
   propia con cualquiera de los 30 estiramientos.
   Lo que cambia cada uno se guarda en S.estiraAj (las rutinas de Peak.) y
   S.estiraPropias (las tuyas).
   ════════════════════════════════════════════════════════════════ */
var RT_CORTO={ superior:"Cuello y hombros", tronco:"Espalda", cadera:"Cadera", muslos:"Piernas", gemelos:"Gemelos", completo:"Cuerpo entero" };
var RT_PORTADA={ superior:"cuello", tronco:"gato", cadera:"paloma", muslos:"cuadriceps", gemelos:"gemelos", completo:"mundo" };
var RT_PASO_S=15, RT_MIN_S=15, RT_MAX_S=180;
var rtEditando=false, rtNueva=null;

/* las rutinas tal y como vienen, sin los cambios de cada uno */
var rtBase=estiraRutina, rtHabitoBase=estiraHabito;
function rtPropias(){ if(!S.estiraPropias) S.estiraPropias=[]; return S.estiraPropias; }
function rtPropia(k){ var P=rtPropias(); for(var i=0;i<P.length;i++) if(P[i].k===k) return P[i]; return null; }
function rtEsBase(k){ return ESTIRA_RUTINAS.some(function(r){ return r.k===k; }); }
function rtPasoDe(ref){ var b=rtBase(ref.r), p=b.pasos[ref.i]; return p ? Object.assign({}, p, { s:ref.s||p.s }) : null; }

/* la rutina con los cambios aplicados: es la que usan la guía y la lista */
estiraRutina=function(k){
  var p=rtPropia(k);
  if(p) return { k:p.k, t:p.t, sub:"Tu rutina", c:"var(--accent)", propia:true, pasos:p.pasos.map(rtPasoDe).filter(Boolean) };
  var b=rtBase(k), aj=S.estiraAj && S.estiraAj[b.k];
  if(!aj) return b;
  return Object.assign({}, b, { ajustada:true, pasos:aj.orden.filter(function(i){ return b.pasos[i]; }).map(function(i){
    return Object.assign({}, b.pasos[i], aj.s && aj.s[i] ? { s:aj.s[i] } : {}); }) });
};
/* el hábito se llama como la rutina original, para que siga marcándose aunque cambies los tiempos */
estiraHabito=function(r){ return r.propia ? "Estiramientos: "+r.t.toLowerCase() : rtHabitoBase(rtBase(r.k)); };
function rtMin(r){ return Math.max(1, Math.round(r.pasos.reduce(function(s,p){ return s+p.s; },0)/60)); }
function rtTodas(){ return ESTIRA_RUTINAS.map(function(r){ return estiraRutina(r.k); }).concat(rtPropias().map(function(p){ return estiraRutina(p.k); })); }

/* la lista editable: para las de Peak. es la lista de índices (orden) y los segundos cambiados; para las tuyas, sus pasos */
function rtAjuste(k){
  if(!S.estiraAj) S.estiraAj={};
  if(!S.estiraAj[k]){ var b=rtBase(k); S.estiraAj[k]={ orden:b.pasos.map(function(_,i){ return i; }), s:{} }; }
  return S.estiraAj[k];
}
function rtCambia(k, j, que){
  var p=rtPropia(k), lista, seg;
  if(p){ lista=p.pasos; seg=function(x){ return x.s || rtPasoDe(x).s; }; }
  else { var aj=rtAjuste(k), b=rtBase(k); lista=aj.orden; seg=function(i){ return aj.s[i] || b.pasos[i].s; }; }
  var x=lista[j]; if(x===undefined) return;
  if(que==="mas" || que==="menos"){
    var s=Math.min(RT_MAX_S, Math.max(RT_MIN_S, seg(x)+(que==="mas"?RT_PASO_S:-RT_PASO_S)));
    if(p) x.s=s; else aj.s[x]=s;
  }
  if(que==="sube" && j>0){ lista[j]=lista[j-1]; lista[j-1]=x; }
  if(que==="baja" && j<lista.length-1){ lista[j]=lista[j+1]; lista[j+1]=x; }
  if(que==="quita") lista.splice(j,1);
  save(); sonido("tick");
}

/* ── la miniatura ── */
function rtMiniatura(r, grande){
  var corto=r.propia ? r.t : (RT_CORTO[r.k] || r.t), pose=r.propia ? (r.pasos[0] && r.pasos[0].f) : (RT_PORTADA[r.k] || r.pasos[0].f);
  return '<span class="rt-mini'+(grande?' rt-mini-g':'')+'"><i class="rt-rayas"></i>'+(pose?'<img data-mq="'+pose+'" alt="">':'')+
    '<b class="rt-gran">'+esc(corto)+'</b><span class="rt-min num">'+rtMin(r)+' min</span></span>';
}
function rtPinta(){
  var v=document.getElementById("v-vital"); if(!v || typeof ESTIRA_RUTINAS==="undefined") return;
  var viejo=document.getElementById("cu-estirar"); if(viejo && viejo.parentNode) viejo.parentNode.removeChild(viejo);
  var el=document.getElementById("cu-rutinas");
  if(!el){ el=document.createElement("div"); el.id="cu-rutinas"; el.className="tq"; }
  if(el.parentNode!==v || el.nextElementSibling) v.appendChild(el);   /* al final de Cuerpo */
  var h='<div class="tq-cab"><h2 class="display">Estirar</h2></div><div class="tq-fila">'+rtTodas().map(function(r){
      return '<button class="rt-card" data-act="x-rt-abre" data-k="'+esc(r.k)+'" aria-label="'+esc(r.t)+'">'+rtMiniatura(r)+
        '<span class="rt-pie"><b>'+esc(r.t)+'</b><small>'+r.pasos.length+' estiramientos · '+esc(r.sub)+'</small></span></button>';
    }).join("")+
    '<button class="rt-card rt-nueva" data-act="x-rt-nueva"><span class="rt-mini"><i class="rt-rayas"></i><b class="rt-gran">Tu rutina</b><span class="rt-mas">+</span></span>'+
      '<span class="rt-pie"><b>Crea la tuya</b><small>Elige entre los 30 estiramientos</small></span></button></div>';
  if(el._h!==h){ el._h=h; el.innerHTML=h; maniquiFotos(el); }
}

/* ── la rutina en orden ── */
function rtSeg(s){ return s>=60 && s%60===0 ? (s/60)+" min" : s+" s"; }
function rtHoja(k){
  var r=estiraRutina(k), ed=rtEditando, n=r.pasos.length;
  var h='<div class="rt-hoja"><div class="flex items-start justify-between mb-3"><p class="eyebrow mt-2">'+(r.propia?"Tu rutina":"Estirar")+'</p>'+closeBtn()+'</div>'+
    rtMiniatura(r, true)+
    '<div class="rt-cab"><div><h3>'+esc(r.t)+'</h3><p class="num">'+n+' estiramientos · '+rtMin(r)+' min</p></div>'+
      '<button class="rt-editar'+(ed?' on':'')+'" data-act="x-rt-edita" data-k="'+esc(k)+'">'+(ed?"Hecho":"Editar")+'</button></div>'+
    '<ol class="rt-lista'+(ed?' ed':'')+'">'+r.pasos.map(function(p,j){
      return '<li><span class="rt-l-f"><img data-mq="'+p.f+'" alt=""></span>'+
        '<span class="rt-l-t"><b>'+esc(p.t)+'</b><small>'+(p.m?esc(p.m):'')+'</small></span>'+
        (ed ? '<span class="rt-ctl">'+
            '<span class="rt-tiempo"><button data-act="x-rt-cambia" data-k="'+esc(k)+'" data-j="'+j+'" data-q="menos" aria-label="Menos tiempo">−</button><b class="num">'+rtSeg(p.s)+'</b>'+
            '<button data-act="x-rt-cambia" data-k="'+esc(k)+'" data-j="'+j+'" data-q="mas" aria-label="Más tiempo">+</button></span>'+
            '<span class="rt-mover"><button data-act="x-rt-cambia" data-k="'+esc(k)+'" data-j="'+j+'" data-q="sube" aria-label="Subir"'+(j?'':' disabled')+'>'+RT_ICO_SUBE+'</button>'+
            '<button data-act="x-rt-cambia" data-k="'+esc(k)+'" data-j="'+j+'" data-q="baja" aria-label="Bajar"'+(j<n-1?'':' disabled')+'>'+RT_ICO_BAJA+'</button>'+
            '<button data-act="x-rt-cambia" data-k="'+esc(k)+'" data-j="'+j+'" data-q="quita" aria-label="Quitar" class="rt-quita">'+RT_ICO_X+'</button></span></span>'
          : '<span class="rt-l-s num">'+rtSeg(p.s)+'</span>')+'</li>';
    }).join("")+'</ol>'+
    (n?'':'<p class="rt-vacia">No queda ningún estiramiento. '+(r.propia?'Borra la rutina o créala otra vez.':'Toca «Volver a la original».')+'</p>')+
    (ed && !r.propia && r.ajustada ? '<button class="rt-otro" data-act="x-rt-original" data-k="'+esc(k)+'">Volver a la original</button>' : '')+
    (ed && r.propia ? '<button class="rt-otro rt-borra" data-act="x-rt-borra" data-k="'+esc(k)+'">Borrar esta rutina</button>' : '')+
    '<div class="rt-empieza"><button class="btn btn-primary w-full !py-3.5" data-act="x-cr-empieza" data-k="'+esc(k)+'"'+(n?'':' disabled')+'>Empezar</button></div></div>';
  openSheet(h);
  maniquiFotos(document.getElementById("sheet-body"));
}
var RT_ICO_SUBE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
var RT_ICO_BAJA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
var RT_ICO_X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';

/* ── crear la tuya: nombre y estiramientos, en el orden en que los tocas ── */
function rtHojaNueva(){
  if(!rtNueva) rtNueva={ t:"", sel:[] };
  var h='<div class="rt-hoja"><div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">Tu rutina</p><h3 class="rt-h3">Crea la tuya</h3></div>'+closeBtn()+'</div>'+
    '<input id="rt-nombre" class="rt-nombre" maxlength="40" placeholder="Ponle nombre (p. ej. Antes de correr)" value="'+esc(rtNueva.t)+'">'+
    '<p class="rt-ayuda">Toca los estiramientos en el orden en que quieras hacerlos.</p>'+
    ESTIRA_RUTINAS.map(function(b){
      return '<p class="rt-grupo">'+esc(b.t)+'</p><div class="rt-elige">'+b.pasos.map(function(p,i){
        var pos=rtNueva.sel.indexOf(b.k+":"+i);
        return '<button class="'+(pos>=0?'on':'')+'" data-act="x-rt-elige" data-r="'+b.k+'" data-i="'+i+'"><span class="rt-l-f"><img data-mq="'+p.f+'" alt=""></span>'+
          '<span class="rt-l-t"><b>'+esc(p.t)+'</b><small class="num">'+rtSeg(p.s)+'</small></span><span class="rt-n num">'+(pos>=0?pos+1:'')+'</span></button>';
      }).join("")+'</div>';
    }).join("")+
    '<div class="rt-empieza"><button class="btn btn-primary w-full !py-3.5" data-act="x-rt-crea"'+(rtNueva.sel.length?'':' disabled')+'>'+
      (rtNueva.sel.length?'Crear rutina con '+rtNueva.sel.length+' estiramiento'+(rtNueva.sel.length>1?'s':''):'Elige al menos uno')+'</button></div></div>';
  var sb=document.getElementById("sheet-body"), arriba=sb && !document.getElementById("sheet").hidden ? sb.parentNode.scrollTop : 0;
  openSheet(h);
  if(sb && arriba) sb.parentNode.scrollTop=arriba;
  maniquiFotos(document.getElementById("sheet-body"));
}

function rtAccion(a, el){
  if(a==="x-rt-abre"){ rtEditando=false; rtHoja(el.dataset.k); return true; }
  if(a==="x-rt-edita"){ rtEditando=!rtEditando; sonido("tick"); rtHoja(el.dataset.k); if(!rtEditando) rtPinta(); return true; }
  if(a==="x-rt-cambia"){ rtCambia(el.dataset.k, +el.dataset.j, el.dataset.q); rtHoja(el.dataset.k); rtPinta(); return true; }
  if(a==="x-rt-original"){ if(S.estiraAj) delete S.estiraAj[el.dataset.k]; save(); sonido("pop"); rtHoja(el.dataset.k); rtPinta(); return true; }
  if(a==="x-rt-borra"){ S.estiraPropias=rtPropias().filter(function(p){ return p.k!==el.dataset.k; }); save(); closeSheet(); rtPinta(); avisoNube("Rutina borrada."); return true; }
  if(a==="x-rt-nueva"){ rtNueva={ t:"", sel:[] }; rtHojaNueva(); return true; }
  if(a==="x-rt-elige"){ var nb=document.getElementById("rt-nombre"); if(nb) rtNueva.t=nb.value;
    var id=el.dataset.r+":"+el.dataset.i, pos=rtNueva.sel.indexOf(id);
    if(pos>=0) rtNueva.sel.splice(pos,1); else rtNueva.sel.push(id);
    sonido("tick"); rtHojaNueva(); return true; }
  if(a==="x-rt-crea"){ var nm=document.getElementById("rt-nombre"), t=((nm && nm.value) || "").trim() || "Mi rutina";
    if(!rtNueva || !rtNueva.sel.length) return true;
    var p={ k:"p"+uid(), t:t, pasos:rtNueva.sel.map(function(id){ var q=id.split(":"); return { r:q[0], i:+q[1] }; }) };
    rtPropias().push(p); save(); sonido("pop"); rtNueva=null; rtEditando=false; rtPinta(); rtHoja(p.k); return true; }
  return false;
}
(function(){
  var antes=crecerAccion;
  crecerAccion=function(a, el){ return rtAccion(a, el) || antes(a, el); };
  crecerTrasRender=function(){ pintaCrecer(); if(view==="vital") rtPinta(); };
  /* la letra del logo para los títulos de las miniaturas */
  if(!document.querySelector('link[href*="family=Unbounded"]')){ var fu=document.createElement("link"); fu.rel="stylesheet";
    fu.href="https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&display=swap"; document.head.appendChild(fu); }
  var st=document.createElement("style"); st.id="rt-css"; st.textContent=[
/* la tarjeta: miniatura 16:9 con borde de tinta y, debajo, el título como en YouTube */
'#cu-rutinas{ margin-top:40px; }',
'.rt-card{ flex:0 0 84%; max-width:340px; scroll-snap-align:start; text-align:left; transition:transform .35s var(--spring); }',
'.rt-card:active{ transform:scale(.97); transition-duration:.12s; }',
'.rt-mini{ position:relative; display:block; aspect-ratio:16/9; border-radius:18px; overflow:hidden; border:1.5px solid var(--t1);',
'  background:color-mix(in srgb, var(--t1) 5%, var(--bg)); }',
/* las rayas de la montaña del logo, en diagonal detrás de la persona */
'.rt-rayas{ position:absolute; inset:0 0 0 42%; background:repeating-linear-gradient(118deg, color-mix(in srgb, var(--t1) 20%, transparent) 0 1.6px, transparent 1.6px 7px);',
'  clip-path:polygon(28% 0, 100% 0, 100% 100%, 0 100%); }',
'.rt-mini img{ position:absolute; right:-2%; top:4%; width:60%; height:96%; object-fit:contain; opacity:0; transition:opacity .45s ease; }',
'.rt-mini img.ve{ opacity:1; }',
'.rt-gran{ position:absolute; left:14px; top:14px; width:52%; font-family:Unbounded, "Plus Jakarta Sans", sans-serif; font-weight:800; text-transform:uppercase;',
'  font-size:clamp(17px, 5.6vw, 22px); line-height:1.02; letter-spacing:-.035em; color:var(--t1); text-wrap:balance; overflow-wrap:anywhere; }',
'.rt-min{ position:absolute; left:14px; bottom:12px; font-size:12px; font-weight:700; padding:4px 10px; border-radius:99px; background:var(--t1); color:var(--bg); }',
'.rt-mas{ position:absolute; right:22%; top:50%; transform:translate(50%,-50%); width:54px; height:54px; border-radius:99px; display:grid; place-items:center;',
'  font-size:30px; font-weight:300; line-height:1; background:var(--t1); color:var(--bg); }',
'.rt-pie{ display:block; padding:10px 4px 0; }',
'.rt-pie b{ display:block; font-size:15px; font-weight:700; letter-spacing:-.015em; line-height:1.25; color:var(--t1); }',
'.rt-pie small{ display:block; font-size:12.5px; color:var(--t3); margin-top:2px; }',
/* la hoja de la rutina */
'.rt-mini-g{ border-radius:20px; } .rt-mini-g .rt-gran{ font-size:clamp(20px, 7vw, 28px); left:18px; top:18px; } .rt-mini-g .rt-min{ left:18px; bottom:16px; }',
'.rt-cab{ display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin:16px 0 6px; }',
'.rt-cab h3, .rt-h3{ font-family:Unbounded, "Plus Jakarta Sans", sans-serif; font-size:19px; font-weight:800; letter-spacing:-.035em; line-height:1.15; }',
'.rt-cab p{ font-size:13px; color:var(--t3); margin-top:4px; }',
'.rt-editar{ flex:0 0 auto; font-size:13.5px; font-weight:700; padding:8px 15px; border-radius:99px; background:var(--fill); color:var(--t1); }',
'.rt-editar.on{ background:var(--t1); color:var(--bg); }',
'.rt-lista li{ display:flex; align-items:center; gap:12px; padding:10px 0; box-shadow:inset 0 -1px 0 var(--hairline-2); }',
'.rt-l-f{ flex:0 0 auto; width:56px; height:56px; border-radius:14px; overflow:hidden; background:color-mix(in srgb, var(--t1) 5%, var(--bg)); }',
'.rt-l-f img{ width:100%; height:100%; object-fit:contain; opacity:0; transition:opacity .35s ease; } .rt-l-f img.ve{ opacity:1; }',
'.rt-l-t{ flex:1; min-width:0; } .rt-l-t b{ display:block; font-size:14.5px; font-weight:700; line-height:1.25; }',
'.rt-l-t small{ display:block; font-size:12px; color:var(--t3); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
'.rt-l-s{ flex:0 0 auto; font-size:13.5px; font-weight:700; color:var(--t2); }',
'.rt-ctl{ flex:0 0 auto; display:flex; flex-direction:column; align-items:flex-end; gap:6px; }',
'.rt-tiempo{ display:flex; align-items:center; gap:2px; border-radius:99px; background:var(--fill); }',
'.rt-tiempo button{ width:30px; height:30px; font-size:18px; font-weight:600; color:var(--t1); } .rt-tiempo b{ min-width:46px; text-align:center; font-size:12.5px; }',
'.rt-mover{ display:flex; gap:4px; } .rt-mover button{ display:grid; place-items:center; width:30px; height:28px; border-radius:9px; color:var(--t2); background:var(--fill); }',
'.rt-mover button:disabled{ opacity:.3; } .rt-mover svg{ width:16px; height:16px; } .rt-mover .rt-quita{ color:var(--alert); }',
'.rt-lista.ed .rt-l-t small{ white-space:normal; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }',
'.rt-vacia{ font-size:13px; color:var(--t3); padding:14px 0; }',
'.rt-otro{ display:block; width:100%; margin-top:14px; padding:12px; border-radius:14px; font-size:14px; font-weight:700; color:var(--t2); background:var(--fill); }',
'.rt-borra{ color:var(--alert); }',
/* el botón de empezar se queda abajo mientras bajas por la lista */
'.rt-empieza{ position:sticky; bottom:-24px; margin:14px -4px -24px; padding:12px 4px calc(env(safe-area-inset-bottom) + 24px);',
'  background:linear-gradient(to top, var(--sheet-bg, var(--bg)) 70%, transparent); }',
'.rt-empieza .btn:disabled{ opacity:.45; }',
/* crear la tuya */
'.rt-nombre{ width:100%; margin-top:6px; padding:13px 14px; border-radius:14px; font-size:15px; background:var(--fill); color:var(--t1); border:0; outline:none; }',
'.rt-nombre:focus{ box-shadow:inset 0 0 0 1.5px var(--t1); }',
'.rt-ayuda{ font-size:12.5px; color:var(--t3); margin-top:8px; }',
'.rt-grupo{ font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--t3); margin:20px 0 4px; }',
'.rt-elige button{ display:flex; align-items:center; gap:12px; width:100%; text-align:left; padding:8px 0; box-shadow:inset 0 -1px 0 var(--hairline-2); }',
'.rt-elige .rt-n{ flex:0 0 auto; display:grid; place-items:center; width:28px; height:28px; border-radius:99px; font-size:12.5px; font-weight:800;',
'  box-shadow:inset 0 0 0 1.5px var(--hairline); color:var(--bg); }',
'.rt-elige button.on .rt-n{ background:var(--t1); box-shadow:none; }'
  ].join("\n"); document.head.appendChild(st);
})();
