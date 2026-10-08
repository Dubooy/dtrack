/* ════════════ Modos con degradado ════════════
   El fondo empieza con un degradado diagonal de dos colores en el primer cuarto
   de la pantalla y de ahí pasa a blanco (claros) o a negro (oscuros).
   Desbloqueados desde el principio. Sobrescribe applyTheme y muestraTema. */

/* funciones y no variables: applyTheme se llama antes de que esta pieza se ejecute */
function grTemas(){ return [
  { k:"gr-atardecer",  n:"Atardecer",       a:"#ff8a3d", b:"#ff3d8b", osc:false },
  { k:"gr-oceano",     n:"Océano",          a:"#2f7bff", b:"#18d2c0", osc:false },
  { k:"gr-uva",        n:"Uva",             a:"#7a5cff", b:"#e24cff", osc:false },
  { k:"gr-atardecer-n",n:"Atardecer noche", a:"#ff8a3d", b:"#ff3d8b", osc:true },
  { k:"gr-oceano-n",   n:"Océano noche",    a:"#2f7bff", b:"#18d2c0", osc:true },
  { k:"gr-uva-n",      n:"Uva noche",       a:"#7a5cff", b:"#e24cff", osc:true }
]; }
function grDe(k){ return grTemas().filter(function(t){ return t.k===k; })[0]||null; }

function applyTheme(mode){
  var root=document.documentElement, real=mode;
  if(mode==="system") real=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  var todos=TEMAS.map(function(t){ return t.k; }).concat(grTemas().map(function(t){ return t.k; }), ["gr"]);
  todos.forEach(function(k){ if(k!=="light" && k!=="system") root.classList.remove(k); });
  root.classList.remove("dark");
  var g=grDe(real);
  if(real!=="dark" && (TEMAS_OSCUROS.indexOf(real)>=0 || (g && g.osc))) root.classList.add("dark");
  if(real!=="light") root.classList.add(real);
  if(g){
    root.classList.add("gr");
    root.style.setProperty("--gr-a", g.a); root.style.setProperty("--gr-b", g.b);
  }
  if(typeof aplicaAcento==="function") aplicaAcento();
  var mt=document.querySelector('meta[name="theme-color"]');
  if(mt) mt.setAttribute("content", g ? g.a : (COLOR_TEMA[real]||"#f5f0e6"));
  if(typeof pintarIcono==="function") pintarIcono(real);
  if(typeof medRepinta==="function") medRepinta();
  pintaIconoTema(real);
}

/* la muestra del selector: el degradado arriba y el blanco o negro debajo */
function muestraTema(k){
  var g=grDe(k);
  if(g){
    var fondo=g.osc?"#000":"#fff", tarjeta=g.osc?"#1c1c1e":"#f2f2f5";
    return '<span class="tp-m" style="background:linear-gradient(180deg,transparent 35%,'+fondo+' 75%),linear-gradient(135deg,'+g.a+','+g.b+')">'+
      '<b style="background:'+tarjeta+'"><u style="background:linear-gradient(135deg,'+g.a+','+g.b+')"></u></b></span>';
  }
  if(k==="system"){
    var a=TEMA_MUESTRA.light, b=TEMA_MUESTRA.dark;
    return '<span class="tp-m tp-sis"><i style="background:'+a[0]+'"></i><i style="background:'+b[0]+'"></i>'+
      '<b style="background:'+a[1]+'"><u style="background:'+a[2]+'"></u></b></span>';
  }
  var c=TEMA_MUESTRA[k]||TEMA_MUESTRA.light;
  return '<span class="tp-m" style="background:'+c[0]+'"><b style="background:'+c[1]+'"><u style="background:'+c[2]+'"></u></b></span>';
}

(function(){
  /* los modos nuevos entran en la lista, sin nivel: libres desde el principio */
  var claros=[], oscuros=[];
  grTemas().forEach(function(g){
    (g.osc?oscuros:claros).push({ k:g.k, n:g.n });
    if(g.osc) TEMAS_OSCUROS.push(g.k);
    COLOR_TEMA[g.k]=g.a;
    ICONO_TEMA[g.k]={ b:g.a, p:"#ffffff" };
    ICONOS_TEMA[g.k]='<path d="M3 18h18"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 7V4.5M5.8 10.8 4.2 9.2M18.2 10.8l1.6-1.6"/>';
  });
  var i=0; while(i<TEMAS.length && !TEMAS[i].nv) i++;
  Array.prototype.splice.apply(TEMAS, [i,0].concat(claros, oscuros));

  var st=document.createElement("style");
  st.textContent=[
/* blanco o negro de fondo, tarjetas en gris como en las apps de Apple
   (clase repetida para ganar al estilo ordenado de 40-estilo-orden.js) */
'html.gr.gr.gr.gr.gr.gr.gr.gr:not(.dark){ color-scheme:light; --bg:#ffffff; --tarjeta:#f2f2f5; --glass-bg:#f2f2f5; --glass-bg-hi:#ffffff; --t1:#111113; --t2:#4a4a52; --t3:#8a8a92;',
'  --fill:rgba(0,0,0,.05); --fill-hi:rgba(0,0,0,.09); --hairline:rgba(0,0,0,.09); --accent:var(--gr-a); --on-accent:#fff; }',
'html.gr.gr.gr.gr.gr.gr.gr.gr.dark{ color-scheme:dark; --bg:#000000; --tarjeta:#1c1c1e; --glass-bg:#1c1c1e; --glass-bg-hi:#2c2c2e; --t1:#f5f5f7; --t2:#c7c7cc; --t3:#8e8e93;',
'  --fill:rgba(255,255,255,.08); --fill-hi:rgba(255,255,255,.14); --hairline:rgba(255,255,255,.12); --accent:var(--gr-a); --on-accent:#fff; }',
/* el degradado: diagonal de dos colores en el primer 25 % y luego se funde con el fondo */
'html.gr, html.gr body{ background-color:var(--bg)!important; }',
'html.gr body{ background-image:linear-gradient(180deg, transparent 0, transparent 8vh, var(--bg) 25vh), linear-gradient(135deg, var(--gr-a), var(--gr-b))!important;',
'  background-size:100% 25vh, 100% 25vh!important; background-repeat:no-repeat!important; background-position:top left!important; }',
'html.gr .canvas-bg{ display:none!important; }',
/* la cabecera fija al bajar, con el mismo fondo que la página */
'html.gr .barpill{ background:color-mix(in srgb, var(--bg) 82%, transparent); }'
  ].join("\n"); document.head.appendChild(st);

  applyTheme(curTheme());
})();
