/* ════════ diseño nuevo · Tu semana para stories y pantallas vacías (oct 2026) ════════
   dibujaSemana (17) se rehace con la estética nueva: tinta o crema, Unbounded,
   barras como «Tu semana» de Hoy. Los domingos sale en Hoy una tarjeta para compartirla.
   Vacío: Social sin grupo, con dibujo, frase y botón (Objetivos ya tenía el suyo en 19). */
CS_COLORES=[
  { k:"tinta", bg:"#141414", fg:"#F3EEE3", ac:"#3BE08B" },
  { k:"crema", bg:"#F1ECE1", fg:"#141414", ac:"#0E8A6E" },
  { k:"verde", bg:"#0E8A6E", fg:"#F3EEE3", ac:"#F3EEE3" },
  { k:"tr-claro", bg:null, fg:"#ffffff", ac:"#3BE08B" },
  { k:"tr-oscuro", bg:null, fg:"#141414", ac:"#0E8A6E" }
];
dibujaSemana=function(l, col){
  var o=resumenSemana(l), st=stats(), hoy=today();
  var W=1080, H=1920, cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  var c=cv.getContext("2d"); if(!c) return null;
  var FT='Unbounded, "Plus Jakarta Sans", sans-serif', FX='"Instrument Sans", -apple-system, sans-serif';
  var FG=col.fg, AC=col.ac||FG, M=96, tr0=!col.bg;
  if(col.bg){ c.fillStyle=col.bg; c.fillRect(0,0,W,H); }
  function sombra(on){ if(!tr0 || FG!=="#ffffff") return; c.shadowColor=on?"rgba(0,0,0,.3)":"transparent"; c.shadowBlur=on?12:0; c.shadowOffsetY=on?2:0; }
  sombra(true);
  /* marca y fechas */
  c.fillStyle=FG; c.font="800 46px "+FT; c.fillText("PEAK", M, 170);
  var pw=c.measureText("PEAK").width; c.fillStyle=AC; c.fillText(".", M+pw+2, 170);
  c.fillStyle=alfa(FG,.55); c.font="600 30px "+FX; c.textAlign="right"; c.fillText(tr(rangoSemana(l)), W-M, 166); c.textAlign="left";
  /* el dato grande */
  c.fillStyle=alfa(FG,.55); c.font="600 30px "+FX; c.fillText(tr("MI SEMANA").split("").join(String.fromCharCode(8202)), M, 400);
  c.fillStyle=FG; c.font="800 250px "+FT; var num=String(o.xp); c.fillText(num, M-12, 640);
  var nw=c.measureText(num).width; c.fillStyle=AC; c.font="800 70px "+FT; c.fillText("XP", M+nw+6, 640);
  var dif=o.xp-o.antes, frase = o.antes>0 ? (dif>=0 ? "+"+Math.round(dif/Math.max(1,o.antes)*100)+"% "+tr("que la semana pasada") : tr("Semana más tranquila que la anterior"))
    : tr("Primera semana en Peak.");
  c.fillStyle=alfa(FG,.7); c.font="500 40px "+FX; c.fillText(frase, M, 720);
  /* barras de la semana */
  var gx=M, gy=840, gw=W-2*M, gh=470, paso=gw/7, an=Math.min(96, paso-34), max=Math.max(20, Math.max.apply(null,o.porDia));
  sombra(false); c.strokeStyle=alfa(FG,.16); c.lineWidth=2; c.beginPath(); c.moveTo(gx, gy+gh+.5); c.lineTo(gx+gw, gy+gh+.5); c.stroke();
  for(var d=0; d<7; d++){
    var v=o.dias[d]<=hoy ? o.porDia[d] : 0, h=v>0 ? Math.max(14, v/max*gh*.9) : 8, x=gx+d*paso+(paso-an)/2, y=gy+gh-h, mejor=(d===o.mejor && v>0);
    sombra(true); c.fillStyle= mejor ? AC : (v>0 ? alfa(FG,.85) : alfa(FG,.18));
    redondo(c, x, y, an, h, Math.min(14, h/2)); c.fill();
    if(mejor){ c.fillStyle=FG; c.font="700 34px "+FT; c.textAlign="center"; c.fillText(String(v), x+an/2, y-24); c.textAlign="left"; }
    c.fillStyle= v>0 ? FG : alfa(FG,.4); c.font="600 32px "+FX; c.textAlign="center"; c.fillText(L10N.sem[d], x+an/2, gy+gh+62); c.textAlign="left";
  }
  /* tres cifras */
  var cif=[[String(st.streak||0), tr("días de racha")],[o.activos+"/7", tr("días activos")],[String(o.retos), tr("retos hechos")]];
  var cy=1600, cw=gw/3;
  sombra(false); c.strokeStyle=alfa(FG,.16); c.beginPath(); c.moveTo(M,cy-130); c.lineTo(W-M,cy-130); c.stroke();
  cif.forEach(function(x,k){ var cx=M+k*cw; sombra(true);
    c.fillStyle=FG; c.font="800 88px "+FT; c.fillText(x[0], cx, cy);
    c.fillStyle=alfa(FG,.6); c.font="500 32px "+FX; c.fillText(x[1], cx, cy+52); });
  /* pie con las rayas del logo */
  sombra(false); c.save(); c.beginPath(); c.rect(M, H-150, 120, 34); c.clip(); c.strokeStyle=AC; c.lineWidth=6;
  for(var r=-40; r<180; r+=16){ c.beginPath(); c.moveTo(M+r, H-112); c.lineTo(M+r+30, H-156); c.stroke(); } c.restore();
  sombra(true); c.fillStyle=alfa(FG,.55); c.font="600 30px "+FX; c.textAlign="right"; c.fillText(tr("Sube tu montaña · Peak."), W-M, H-122); c.textAlign="left";
  sombra(false);
  return cv;
};

/* ── la tarjeta del domingo en Hoy (va justo debajo de «Empieza aquí») ── */
var _hnGuiaSemana=hnGuia;
hnGuia=function(){
  var g=_hnGuiaSemana.apply(this, arguments), t=today(), l=lunesDe(t);
  if(new Date(t+"T00:00:00").getDay()!==0 || (S.csVisto===l)) return g;
  var o=resumenSemana(l);
  return g+'<div class="cs-hoy"><div><p>Tu semana está lista</p><b class="num">+'+o.xp+' XP</b><small>'+o.activos+' de 7 días activos</small></div>'+
    '<span><button class="cs-hoy-x" data-act="x-cs-hoy-fuera" aria-label="Ocultar">✕</button><button class="cs-hoy-b" data-act="x-cs-hoy">Compartir</button></span></div>';
};

/* ── vacíos ── */
function vcDibujo(){
  return '<svg class="vc-svg" viewBox="0 0 120 64" aria-hidden="true"><defs><pattern id="vc-ry" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="1.6" height="5" fill="currentColor"/></pattern></defs>'+
    '<path d="M6 62 L42 18 L54 30 L72 6 L114 62Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'+
    '<path d="M72 6 L114 62 L80 62 L62 20Z" fill="url(#vc-ry)" opacity=".5"/>'+
    '<path d="M72 6 V-4 L80 -1 L72 2" fill="currentColor" transform="translate(0 4)"/></svg>';
}
var _socSinGrupoVacio=socSinGrupo;
socSinGrupo=function(){
  return '<div class="vc-caja vc-soc">'+vcDibujo()+'<h3>Sube con tu gente</h3><p>Un grupo de 2 a 12 amigos. Sin desconocidos ni clasificación mundial: veis quién va por delante y os picáis cada día.</p>'+
    _socSinGrupoVacio.apply(this, arguments)+'</div>';
};

var _hoyNuevoAccionSemana=hoyNuevoAccion;
hoyNuevoAccion=function(a, el){
  if(a==="x-cs-hoy"){ compartirSemana(lunesDe(today())); return true; }
  if(a==="x-cs-hoy-fuera"){ S.csVisto=lunesDe(today()); save(); render(); return true; }
  return _hoyNuevoAccionSemana.apply(this, arguments);
};

(function(){
  var st=document.createElement("style"); st.id="semana-vacios-css"; st.textContent=[
'.cs-hoy{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0 0 28px; padding:18px 18px 18px 20px; border-radius:22px; background:var(--t1); color:var(--bg); }',
'.cs-hoy p{ font-size:12px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; opacity:.6; }',
'.cs-hoy b{ display:block; font-family:var(--f-titulo); font-weight:800; font-size:30px; letter-spacing:-.05em; margin-top:6px; color:var(--hn-ac); }',
'html.dark .cs-hoy b{ color:#0E8A6E; text-shadow:none; }',
'html.dark .cs-marco{ box-shadow:0 0 0 1px rgba(243,238,227,.14); }',
'.cs-hoy small{ font-size:13.5px; opacity:.7; }',
'.cs-hoy > span{ display:flex; flex-direction:column; align-items:flex-end; gap:12px; }',
'.cs-hoy-b{ height:44px; padding:0 20px; border-radius:99px; background:var(--bg); color:var(--t1); font-weight:600; font-size:15px; }',
'.cs-hoy-x{ width:28px; height:28px; border-radius:99px; font-size:12px; opacity:.5; color:inherit; }',
/* vacíos */
'.vc-caja{ display:flex; flex-direction:column; align-items:flex-start; padding:6px 0 8px; }',
'.vc-svg{ width:96px; height:52px; color:var(--t1); overflow:visible; margin-bottom:18px; }',
'.vc-caja h3{ font-family:var(--f-titulo); font-weight:700; font-size:22px; letter-spacing:-.04em; line-height:1.15; color:var(--t1); }',
'.vc-caja p, .vc-caja .soc-nota{ font-size:15px; line-height:1.45; color:var(--t2); margin-top:8px; }',
'.vc-b{ margin-top:18px; height:48px; padding:0 22px; border-radius:99px; background:var(--t1); color:var(--bg); font-weight:600; font-size:15px; }',
'.vc-soc > .soc-sec, .vc-soc > .soc-sec + .soc-nota{ display:none; }',
'.vc-soc > div[style]{ width:100%; margin-top:18px!important; }',
'.vc-soc{ margin-top:26px; }'
  ].join("\n"); document.head.appendChild(st);
})();
