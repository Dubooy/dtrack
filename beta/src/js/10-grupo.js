/* ════════ el grupo ════════ */
var GRUPO = null;

function grupoDemo(){
  var hoy = today(), ini = addDays(hoy,-4);
  function dias(ns){ return ns.map(function(n){ return addDays(ini,n); }); }
  GRUPO = {
    nombre: nombreGrupoGuardado() || "Mi grupo",
    codigo: "K7M2PQ",
    desc: (descGrupoGuardada()!==null ? descGrupoGuardada() : "Hábitos, gym y estudio. A por todas."),
    yo: "carlos",
    miembros: [
      { usuario:"lucia",  pct:92, racha:41, gym:5, retos:3, nivel:12, avatar:FOTOS_PRUEBA.lucia, mejor:41, logros:9, retosTot:88, estudioMin:1740, estudioTop:"Matemáticas", desc:"Medicina o nada. Si me ves sin estudiar, avísame.", medallas:["Algo es algo","Siete días sin recaer","Esto ya es sospechoso"] },
      { usuario:"carlos", pct:86, racha:34, gym:6, retos:3, nivel:8,  avatar:FOTOS_PRUEBA.carlos },
      { usuario:"marcos", pct:71, racha:12, gym:4, retos:2, nivel:7,  avatar:FOTOS_PRUEBA.marcos, mejor:19, logros:5, retosTot:41, estudioMin:620, estudioTop:"Economía", desc:"Gym, Economía y dormir. En ese orden.", medallas:["Algo es algo","Te saluda el de recepción"] },
      { usuario:"nerea",  pct:64, racha:8,  gym:3, retos:1, nivel:5,  avatar:FOTOS_PRUEBA.nerea, mejor:14, logros:3, retosTot:22, estudioMin:410, estudioTop:"Historia", desc:"", medallas:["Algo es algo"] },
      { usuario:"adri",   pct:38, racha:2,  gym:1, retos:0, nivel:3,  avatar:FOTOS_PRUEBA.adri, mejor:6,  logros:1, retosTot:7,  estudioMin:95,  estudioTop:"Inglés", desc:"Empezando. Paciencia conmigo.", medallas:[] }
    ],
    racha: { dias:9, mejor:14, cerrados:["lucia","marcos","nerea"] },
    meta: { txt:"25 días de gimnasio entre todos", hecho:19, objetivo:25, premio:"+120 XP" },
    /* reto en común: cada uno marca los días que lo cumple y todo suma a un bote */
    reto: {
      txt: "Sin móvil la primera hora del día",
      inicio: ini, acaba: addDays(ini,6),
      objetivo: 24, premio: "+150 XP para cada uno",
      marcas: {
        lucia:  dias([0,1,2,3,4]),
        marcos: dias([0,1,3,4]),
        carlos: dias([0,1,2]),
        nerea:  dias([1,3]),
        adri:   []
      }
    },
    muro: [
      { id:"m1", usuario:"lucia",  texto:"ha llegado a 41 días de racha",               cuando:"hace 2 h",    reac:{"🔥":3,"👏":1} },
      { id:"m2", usuario:"marcos", texto:"ha desbloqueado «Te saluda el de recepción»", cuando:"ayer",        reac:{"👏":2} },
      { id:"m3", usuario:"nerea",  texto:"ha hecho el Parte del día con los tres retos",        cuando:"ayer",        reac:{"🔥":1} },
      { id:"m4", usuario:"carlos", texto:"lleva 6 días seguidos de gimnasio",           cuando:"hace 2 días", reac:{"💪":4,"🔥":2} }
    ]
  };
}

function miembroYo(){
  if(!GRUPO) return null;
  for(var i=0;i<GRUPO.miembros.length;i++) if(GRUPO.miembros[i].usuario===GRUPO.yo) return GRUPO.miembros[i];
  return null;
}
function miembro(u){
  for(var i=0;i<GRUPO.miembros.length;i++) if(GRUPO.miembros[i].usuario===u) return GRUPO.miembros[i];
  return { usuario:u };
}
function ordenados(){
  return GRUPO.miembros.slice().sort(function(a,b){ return b.pct-a.pct; });
}

/* ── reto en común ── */
function retoMarcas(u){ var m=GRUPO.reto.marcas; return (m && m[u]) || []; }
function retoTotal(){
  var t=0, m=GRUPO.reto.marcas||{};
  Object.keys(m).forEach(function(k){ t+=m[k].length; });
  return t;
}
function retoHoyHecho(){ return retoMarcas(GRUPO.yo).indexOf(today())>=0; }
function retoMarcarHoy(){
  var r=GRUPO.reto, yo=GRUPO.yo, hoy=today();
  if(hoy<r.inicio || hoy>r.acaba) return false;
  r.marcas = r.marcas || {};
  var l = r.marcas[yo] = r.marcas[yo] || [];
  var i = l.indexOf(hoy);
  if(i>=0) l.splice(i,1); else l.push(hoy);
  return i<0;
}
function retoAportan(){
  return GRUPO.miembros.slice().sort(function(a,b){
    return retoMarcas(b.usuario).length - retoMarcas(a.usuario).length;
  });
}

/* ════════ estilo propio de la pestaña ════════
   Nada de tarjetas apiladas: el contenido vive sobre el fondo, las listas son
   filas con una línea fina, y solo el reto en común tiene superficie propia. */
var SOC_CSS = [
'#social-col.soc{ display:block; }',
'.soc-sec{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin:38px 0 4px; }',
'.soc-sec h2{ font-size:20px; font-weight:800; letter-spacing:-.03em; }',
'.soc-sec .soc-mas{ font-size:13px; font-weight:600; color:var(--accent); }',
'.soc-nota{ font-size:12.5px; line-height:1.5; color:var(--t3); margin-bottom:6px; max-width:44ch; }',

/* filas estilo lista nativa: línea fina que empieza después de la cara */
'.soc-fila{ display:flex; align-items:center; gap:13px; }',
'.soc-fila .soc-cuerpo{ flex:1; min-width:0; padding:13px 0; display:flex; align-items:center; gap:12px; }',
'.soc-lista .soc-fila + .soc-fila .soc-cuerpo{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.soc-pos{ width:16px; text-align:center; font-size:13px; font-weight:700; color:var(--t3); flex:0 0 auto; }',
'.soc-nombre{ font-size:15px; font-weight:600; letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.soc-sub{ font-size:12px; color:var(--t3); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.soc-lv{ display:inline-flex; align-items:center; height:18px; padding:0 6px; border-radius:6px; margin-left:6px; vertical-align:2px;',
'  font-size:10.5px; font-weight:800; letter-spacing:.02em; background:var(--accent-soft); color:var(--accent); }',
'.soc-pct{ font-size:17px; font-weight:800; letter-spacing:-.03em; flex:0 0 auto; }',
'.soc-barra{ height:4px; border-radius:99px; background:var(--fill-hi); overflow:hidden; margin-top:8px; }',
'.soc-barra > i{ display:block; height:100%; border-radius:99px; }',

/* cabecera: tú */
'.soc-yo{ display:flex; align-items:center; gap:16px; }',
'.soc-yo-foto{ width:68px; height:68px; border-radius:999px; flex:0 0 auto; position:relative; overflow:visible;',
'  display:flex; align-items:center; justify-content:center; background:var(--accent-soft); color:var(--accent); }',
'.soc-yo-foto img{ width:100%; height:100%; object-fit:cover; border-radius:999px; display:block; }',
'.soc-yo-foto .soc-mas-foto{ position:absolute; right:-1px; bottom:-1px; width:22px; height:22px; border-radius:99px;',
'  display:flex; align-items:center; justify-content:center; background:var(--accent); color:var(--on-accent);',
'  box-shadow:0 0 0 3px var(--bg); }',
'.soc-yo h2{ font-size:24px; font-weight:800; letter-spacing:-.035em; line-height:1.1; }',
'.soc-xp{ display:flex; align-items:center; gap:9px; margin-top:8px; }',
'.soc-xp .soc-barra{ flex:1; margin:0; height:6px; max-width:180px; }',

/* el grupo */
'.soc-grupo{ display:flex; align-items:center; gap:14px; margin-top:30px; padding-top:22px; box-shadow:inset 0 1px 0 var(--hairline); }',
'.soc-caras{ display:flex; flex:0 0 auto; }',
'.soc-caras > span{ margin-left:-10px; border-radius:999px; box-shadow:0 0 0 2.5px var(--bg); }',
'.soc-caras > span:first-child{ margin-left:0; }',

/* el reto: mismo estilo tranquilo que el resto */
'.soc-reto{ position:relative; overflow:hidden; margin-top:12px; border-radius:22px; padding:18px 16px 12px; color:var(--t1); background:var(--fill); }',
'.soc-reto .soc-reto-t{ font-size:19px; font-weight:800; letter-spacing:-.03em; line-height:1.2; margin-top:6px; max-width:22ch; }',
'.soc-reto .soc-ey{ font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--t3); }',
'.soc-reto .soc-cifra{ display:flex; align-items:baseline; gap:8px; margin-top:16px; }',
'.soc-reto .soc-cifra b{ font-family:var(--f-texto); font-size:38px; font-weight:800; letter-spacing:-.05em; line-height:.9; }',
'.soc-reto .soc-cifra span{ color:var(--t3); opacity:1!important; }',
'.soc-reto .soc-barra{ background:var(--fill-hi); height:6px; margin-top:10px; }',
'.soc-reto .soc-barra > i{ background:var(--accent); }',
'.soc-reto > p:not(.soc-reto-t){ color:var(--t3); opacity:1!important; }',
'.soc-reto .soc-boton{ width:100%; margin-top:14px; height:48px; border-radius:999px; font-size:15px; font-weight:700;',
'  display:flex; align-items:center; justify-content:center; gap:8px; background:var(--accent); color:var(--on-accent);',
'  transition:transform .35s var(--spring), background .25s var(--ease), color .25s var(--ease); }',
'.soc-reto .soc-boton:active{ transform:scale(.97); }',
'.soc-reto .soc-boton.hecho{ background:var(--accent-soft); color:var(--accent); box-shadow:none; }',
'.soc-reto .soc-aporta{ margin-top:14px; padding-top:4px; box-shadow:inset 0 1px 0 var(--hairline); }',
'.soc-reto .soc-aporta .soc-fila .soc-cuerpo{ padding:9px 0; }',
'.soc-reto .soc-aporta .soc-fila + .soc-fila .soc-cuerpo{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.soc-dias{ display:flex; gap:4px; flex:0 0 auto; }',
'.soc-dias i{ width:8px; height:8px; border-radius:99px; background:var(--fill-hi); }',
'.soc-dias i.si{ background:var(--accent); }',
'.soc-dias i.hoy{ box-shadow:0 0 0 1.5px var(--accent); }',
'.soc-dias i.luego{ opacity:.5; }',
'.soc-vertodos{ width:100%; padding:10px 0 4px; font-size:13.5px; font-weight:700; color:var(--accent); box-shadow:inset 0 1px 0 var(--hairline); }',
'.soc-reac-mas{ width:34px; height:30px; border-radius:99px; display:grid; place-items:center; color:var(--t3); background:none!important; box-shadow:inset 0 0 0 1px var(--hairline)!important; }',
'.soc-reac-mas svg{ width:17px; height:17px; }',
'.soc-corona{ font-size:12px; margin-left:4px; }',

/* meta del grupo, en línea */
'.soc-meta{ display:flex; align-items:center; gap:16px; padding:14px 0 4px; }',
'.soc-anillo{ width:62px; height:62px; flex:0 0 auto; position:relative; }',
'.soc-anillo svg{ width:100%; height:100%; transform:rotate(-90deg); }',
'.soc-anillo b{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; }',

/* muro */
'.soc-reac{ display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }',
'.soc-reac button{ height:28px; padding:0 10px; border-radius:999px; font-size:12.5px; display:inline-flex; align-items:center; gap:5px;',
'  background:var(--fill); color:var(--t2); transition:transform .3s var(--spring); }',
'.soc-reac button:active{ transform:scale(.9); }',
'.soc-reac button.vacio{ background:transparent; box-shadow:inset 0 0 0 1px var(--hairline); opacity:.6; }',
'.soc-muro .soc-fila{ align-items:flex-start; }',
'.soc-muro .soc-fila > span:first-child{ margin-top:12px; }',

/* ajustes de cuenta: el único sitio con grupo de filas, como en Ajustes */
'.soc-ajustes{ margin-top:10px; border-radius:18px; background:var(--glass-bg); box-shadow:inset 0 0 0 1px var(--hairline-2); padding:0 16px; }',
'.soc-ajustes > *{ display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%; min-height:50px; font-size:14.5px; text-align:left; }',
'.soc-ajustes > * + *{ box-shadow:inset 0 1px 0 var(--hairline); }',
'.soc-ajustes .rojo{ color:var(--alert); font-weight:600; }',

/* título pequeño que aparece arriba al bajar */
'#soc-mini{ position:fixed; left:0; right:0; top:0; z-index:40; pointer-events:none; opacity:0; transform:translateY(-6px);',
'  padding:calc(env(safe-area-inset-top) + 10px) 16px 10px; text-align:center;',
'  background:color-mix(in srgb,var(--bg) 72%,transparent);',
'  backdrop-filter:blur(18px) saturate(150%); -webkit-backdrop-filter:blur(18px) saturate(150%);',
'  box-shadow:0 1px 0 var(--hairline); transition:opacity .22s var(--ease), transform .3s var(--ease); }',
'#soc-mini.ve{ opacity:1; transform:none; }',
'#soc-mini b{ font-family:var(--f-texto); font-size:16px; font-weight:800; letter-spacing:-.02em; }',
'@media (min-width:1024px){ #soc-mini{ display:none; } }'
].join("\n");

function socEstilo(){
  if(document.getElementById("soc-css")) return;
  var st=document.createElement("style"); st.id="soc-css"; st.textContent=SOC_CSS;
  document.head.appendChild(st);
  var mini=document.createElement("div"); mini.id="soc-mini";
  mini.innerHTML='<b></b>';
  document.body.appendChild(mini);
  window.addEventListener("scroll", socMini, {passive:true});
}
function socMini(){
  var m=document.getElementById("soc-mini"); if(!m) return;
  var v=(typeof view!=="undefined") ? view : "";
  var lab=document.querySelector('#rail [data-label="'+v+'"]') || document.querySelector('#v-'+v+' h1');
  var b=m.querySelector("b"); if(b && lab) b.textContent=lab.textContent;
  m.classList.toggle("ve", window.scrollY>64);
}
socEstilo();

/* ── piezas ── */
function caraDe(m, tam){
  tam = tam || 34;
  var letra = (m.usuario||"?").charAt(0).toUpperCase();
  if(m.avatar)
    return '<span class="av-lp" style="display:block;width:'+tam+'px;height:'+tam+'px;border-radius:999px;overflow:hidden;flex:0 0 auto">'+
      '<img src="'+esc(m.avatar)+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></span>';
  return '<span class="display av-lp" style="width:'+tam+'px;height:'+tam+'px;border-radius:999px;'+
    'flex:0 0 auto;display:flex;align-items:center;justify-content:center;background:var(--accent-soft);'+
    'color:var(--accent);font-weight:800;font-size:'+Math.round(tam*0.42)+'px">'+esc(letra)+'</span>';
}
function tono(p){ return p>=80 ? "var(--good)" : p>=50 ? "var(--accent)" : "var(--warn)"; }

/* tú: foto, nombre y nivel */
function socYo(){
  var st=stats();
  var u = perfil&&perfil.usuario ? perfil.usuario : "tú";
  var foto = perfil&&perfil.avatar ? perfil.avatar : "";
  var nombreNv = tituloElegido(st.lvl);
  return '<div class="soc-yo" data-act="x-perfil" style="cursor:pointer">'+
    '<button class="soc-yo-foto" data-act="x-perfil" aria-label="Ver tu perfil">'+
      (foto ? '<img src="'+esc(foto)+'" alt="">'
            : '<span class="display" style="font-weight:800;font-size:26px">'+esc(u.charAt(0).toUpperCase())+'</span>')+
      '<span class="av-lapiz" role="button" data-act="nube-foto" aria-label="Cambiar foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg></span>'+
    '</button>'+
    '<div style="min-width:0;flex:1">'+
      '<h2 class="display">'+esc(u)+'</h2>'+
      '<p class="soc-nv"><span class="soc-nv-n num" style="--rc:'+rangoDe(st.lvl).c+'">Nivel '+st.lvl+'</span>'+
        '<span class="soc-nv-t">'+esc(nombreNv)+'</span></p>'+
    '</div>'+
  '</div>';
}

function socGrupo(){
  var n=GRUPO.miembros.length;
  return '<div class="soc-grupo" data-act="x-grupo">'+
    '<div class="soc-caras">'+GRUPO.miembros.slice(0,5).map(function(m){ return '<span>'+caraDe(m,34)+'</span>'; }).join("")+'</div>'+
    '<div style="min-width:0;flex:1">'+
      '<p class="soc-nombre" style="font-size:16px;font-weight:700">'+esc(GRUPO.nombre)+'</p>'+
      '<p class="soc-sub">'+(GRUPO.desc?esc(GRUPO.desc):(n===1?'1 persona':n+' personas'))+'</p>'+
    '</div>'+
    '<button data-act="x-grupo-compartir" style="font-size:14px;font-weight:700;color:var(--accent);flex:0 0 auto;padding:8px 2px">Invitar</button>'+
    '<svg viewBox="0 0 24 24" style="width:18px;height:18px;color:var(--t3);flex:0 0 auto" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'+
  '</div>';
}

var retoTodos=false;
function socReto(){
  var r=GRUPO.reto, hoy=today();
  var total=retoTotal(), pct=Math.min(100, Math.round(total/r.objetivo*100));
  var hecho=retoHoyHecho(), dentro=(hoy>=r.inicio && hoy<=r.acaba);
  var faltanDias=diff(hoy, r.acaba);
  var nDias=diff(r.inicio, r.acaba)+1;
  var lista=retoAportan(), max=retoMarcas(lista[0].usuario).length;

  var visibles = retoTodos ? lista : lista.filter(function(m,i){ return i<3 || m.usuario===GRUPO.yo; });
  var filas = visibles.map(function(m){
    var l=retoMarcas(m.usuario), puntos="";
    for(var i=0;i<nDias;i++){
      var d=addDays(r.inicio,i);
      puntos+='<i class="'+(l.indexOf(d)>=0?"si ":"")+(d===hoy?"hoy ":"")+(d>hoy?"luego":"")+'"></i>';
    }
    var yo=(m.usuario===GRUPO.yo);
    return '<div class="soc-fila" data-act="x-perfil" data-u="'+esc(m.usuario)+'">'+
      '<span class="soc-cara">'+caraDe(m,28)+'</span>'+
      '<div class="soc-cuerpo'+(yo?" sr-yo":"")+'">'+
        '<span style="flex:1;min-width:0;font-size:14px;font-weight:'+(yo?"800":"600")+'">'+esc(m.usuario)+
          (yo?'<span style="opacity:.6;font-weight:500"> · tú</span>':'')+
          (l.length && l.length===max?'<span class="soc-corona" title="El que más aporta">👑</span>':'')+'</span>'+
        '<span class="soc-dias">'+puntos+'</span>'+
        '<span class="num" style="width:22px;text-align:right;font-weight:800;font-size:14px">'+l.length+'</span>'+
      '</div></div>';
  }).join("");

  return '<div class="soc-reto">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'+
      '<span class="soc-ey">Objetivo del grupo</span>'+
      '<span style="font-size:12px;font-weight:700;opacity:.85">'+
        (faltanDias<0?"terminado":faltanDias===0?"último día":"quedan "+faltanDias+" días")+'</span>'+
    '</div>'+
    '<p class="soc-reto-t display">'+esc(r.txt)+'</p>'+
    '<div class="soc-cifra"><b class="num">'+total+'</b>'+
      '<span style="font-size:15px;opacity:.75" class="num">de '+r.objetivo+' días entre todos</span></div>'+
    '<div class="soc-barra"><i style="width:'+pct+'%"></i></div>'+
    '<p style="font-size:12.5px;opacity:.8;margin-top:10px">'+
      (total>=r.objetivo ? 'Conseguido. '+esc(r.premio)+'.' : 'Si llegáis: '+esc(r.premio)+'.')+'</p>'+
    (dentro
      ? '<button class="soc-boton'+(hecho?" hecho":"")+'" data-act="soc-reto">'+
          (hecho ? '<svg class="sr-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg><span>Hoy lo has cumplido</span>' : 'Hoy lo he cumplido')+'</button>'
      : '')+
    '<div class="soc-aporta">'+filas+'</div>'+
    (lista.length>visibles.length || retoTodos ? '<button class="soc-vertodos" data-act="x-reto-todos">'+(retoTodos?"Ver menos":"Ver los "+lista.length)+'</button>' : '')+
  '</div>';
}

function socSemana(){
  var lista=ordenados();
  var filas=lista.map(function(m,i){
    var yo=(m.usuario===GRUPO.yo);
    var nv = yo ? stats().lvl : m.nivel;
    var hEst = yo ? Math.round(estudioTotales().min/60) : Math.round((m.estudioMin||0)/60);
    return '<div class="soc-fila" data-act="x-perfil" data-u="'+esc(m.usuario)+'" style="cursor:pointer">'+
      '<span class="soc-pos num">'+(i+1)+'</span>'+
      caraDe(m,40)+
      '<div class="soc-cuerpo">'+
        '<div style="flex:1;min-width:0">'+
          '<p class="soc-nombre" style="font-weight:'+(yo?"800":"600")+'">'+esc(m.usuario)+
            (nv?'<span class="soc-lv num">NV '+nv+'</span>':'')+'</p>'+
          '<p class="soc-sub">'+m.racha+' de racha · '+m.gym+' de ejercicio · '+hEst+' h estudio</p>'+
          '<div class="soc-barra"><i style="width:'+m.pct+'%;background:'+tono(m.pct)+'"></i></div>'+
        '</div>'+
        '<span class="soc-pct num" style="color:'+tono(m.pct)+'">'+m.pct+'%</span>'+
      '</div></div>';
  }).join("");
  return '<div class="soc-sec"><h2 class="display">Esta semana</h2><span class="t3" style="font-size:12.5px">7 días</span></div>'+
    '<p class="soc-nota">Cada uno contra su propio plan. Tener treinta hábitos fáciles no te sube el número.</p>'+
    '<div class="soc-lista">'+filas+'</div>';
}

function socMeta(){
  var m=GRUPO.meta, pct=Math.min(100, Math.round(m.hecho/m.objetivo*100));
  var R=26, C=2*Math.PI*R;
  return '<div class="soc-sec"><h2 class="display">Meta del grupo</h2></div>'+
    '<div class="soc-meta">'+
      '<div class="soc-anillo"><svg viewBox="0 0 62 62">'+
        '<circle cx="31" cy="31" r="'+R+'" fill="none" stroke="var(--fill-hi)" stroke-width="7"/>'+
        '<circle cx="31" cy="31" r="'+R+'" fill="none" stroke="var(--good)" stroke-width="7" stroke-linecap="round" '+
          'stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-pct/100)).toFixed(1)+'"/></svg>'+
        '<b class="num">'+pct+'%</b></div>'+
      '<div style="min-width:0;flex:1">'+
        '<p style="font-size:15px;font-weight:600;line-height:1.35">'+esc(m.txt)+'</p>'+
        '<p class="soc-sub" style="white-space:normal">Vais por '+m.hecho+' de '+m.objetivo+'. Se cuenta solo desde Cuerpo. Si llegáis, '+esc(m.premio)+'.</p>'+
      '</div>'+
    '</div>';
}

var reacAbiertas={};
var EMOJIS=["🔥","👏","💪"];
function socMuro(){
  var filas = GRUPO.muro.map(function(p){
    var reac = Object.keys(p.reac||{}).map(function(e){
      return '<button class="'+((p.mias&&p.mias[e])?"mia":"")+'" data-act="x-reac" data-id="'+p.id+'" data-e="'+e+'">'+e+' <span class="num">'+p.reac[e]+'</span></button>';
    }).join("");
    var abierto = reacAbiertas[p.id];
    var libres = abierto ? emojisDisponibles().filter(function(e){ return !(p.reac&&p.reac[e]); }).map(function(e){
      return '<button class="vacio" data-act="x-reac" data-id="'+p.id+'" data-e="'+e+'">'+e+'</button>';
    }).join("") : '<button class="soc-reac-mas" data-act="x-reac-mas" data-id="'+p.id+'" aria-label="Reaccionar">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="12" r="8"/><path d="M8 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M8.5 10h.01M13.5 10h.01"/><path d="M19 3v4M17 5h4"/></svg></button>';
    return '<div class="soc-fila"><span data-act="x-perfil" data-u="'+esc(p.usuario)+'">'+caraDe(miembro(p.usuario),36)+'</span>'+
      '<div class="soc-cuerpo" style="display:block">'+
        '<p style="font-size:14px;line-height:1.45"><b data-act="x-perfil" data-u="'+esc(p.usuario)+'">'+esc(p.usuario)+'</b> '+esc(p.texto)+'</p>'+
        '<p class="soc-sub">'+esc(p.cuando)+'</p>'+
        '<div class="soc-reac">'+reac+libres+'</div>'+
      '</div></div>';
  }).join("");
  return '<div class="soc-sec"><h2 class="display">Actividad</h2></div>'+
    '<p class="soc-nota">Se publica sola cuando alguien consigue algo.</p>'+
    '<div class="soc-lista soc-muro">'+filas+'</div>';
}

function socCuenta(){
  if(!ses) return "";
  var foto = perfil&&perfil.avatar;
  return '<div class="soc-sec"><h2 class="display">Cuenta</h2></div>'+
    '<div class="soc-ajustes">'+
      '<div><span>'+(esPrueba()?"Modo prueba":esc(ses.email||""))+'</span><span id="nube-estado" class="t3" style="font-size:13px">al día</span></div>'+
      '<button data-act="nube-subir"><span>Guardar ahora</span><span class="t3">›</span></button>'+
      (foto?'<button data-act="nube-quitafoto"><span>Quitar la foto</span><span class="t3">›</span></button>':'')+
      '<button data-act="nube-salir"><span class="rojo">'+(esPrueba()?"Salir del modo prueba":"Cerrar sesión")+'</span></button>'+
    '</div>'+
    (esPrueba()
      ? '<div class="soc-sec"><h2 class="display">Pruebas</h2><span class="t3" style="font-size:12.5px">solo en modo prueba</span></div>'+
        '<div class="soc-ajustes">'+
          '<button data-act="x-dev-nivel"><span>Subir un nivel</span><span class="t3 num">NV '+stats().lvl+'</span></button>'+
          '<button data-act="x-dev-racha"><span>Sumar un día de racha</span><span class="t3 num">'+stats().streak+' días</span></button>'+
          '<button data-act="x-dev-reset"><span class="rojo">Quitar niveles y racha de prueba</span></button>'+
        '</div>'
      : '');
}

function socSinGrupo(){
  return '<div class="soc-sec"><h2 class="display">Tu grupo</h2></div>'+
    '<p class="soc-nota" style="font-size:14px;color:var(--t2)">De 5 a 12 personas que se conozcan. Sin clasificación mundial y sin desconocidos: solo tu gente.</p>'+
    '<div style="display:flex;gap:10px;margin-top:14px">'+
      '<button class="btn btn-primary" data-act="soc-crear" style="flex:1">Crear grupo</button>'+
      '<button class="btn btn-quiet" data-act="soc-entrar" style="flex:1">Tengo un código</button>'+
    '</div>';
}

function pintaSocial(c){
  socEstilo();
  c.className = "lg:col-span-7 min-w-0 soc";
  var h = socYo();
  if(GRUPO) h += socGrupo() + socRachaGrupo() + socRanking() + socReto() + socMuro();
  else h += socSinGrupo();
  h += '<div style="height:18px"></div>';
  c.innerHTML = h;
  socMini();
}

