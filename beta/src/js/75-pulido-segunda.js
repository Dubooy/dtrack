/* ════════ pulido, segunda tanda (18/10/2026) ════════
   · Iconos de «Tu progreso de hoy» y de los hábitos de General: los mismos que la
     barra (corredor, loto, diana, gente); el zapato pasa a ser el corredor.
   · Una sola animación al marcar algo (como el objetivo del grupo): el círculo se
     rellena y el check da un pequeño sello. Fuera botes de tarjetas, ondas, chispas
     y destellos de hábitos, ejercicio, retos de hoy y metas del mes.
   · Meditación: el sonido de fondo elegido se ve marcado y se dice bajo «Empezar»;
     la campana de cada cambio suena siempre, con su propio interruptor.
   · Dentro del grupo no se cambia tu foto (se cambia desde tu perfil). */
(function(){
  function sinCapas(svg){ return svg.replace(/<path class="f"[^>]*\/>/g, "").replace(/<g class="h">[\s\S]*?<\/g>/, ""); }
  GN_ICO.cuerpo=BARRA_ICO.vital;
  GN_ICO.zapa=BARRA_ICO.vital;
  GN_ICO.mente=BARRA_ICO.academico;
  GN_ICO.social=sinCapas(BARRA_ICO.social);
})();

/* ── meditación ── */
function medBongOn(){ return medPref().bong!==false; }
var _medAvanzaBong=medAvanza;
medAvanza=function(){
  var antes=medA && medA.fase, r=_medAvanzaBong.apply(this, arguments);
  /* con el sonido quitado, la campana de cada fase sigue sonando si no la apagas aparte */
  if(!medA || medA.fin || medA.pausadoEn || medA.tipo.guia!=="resp" || medA.fase===antes || !medA.fase || medSuena() || !medBongOn()) return r;
  var f=medFaseDe(medTranscurrido()); if(f.k==="prep") return r;
  medCuenco(293.7, .075, Math.min(5, Math.max(2.5, f.dur+.8)));
  return r;
};
function medExtrasPinta(){
  var c=document.getElementById("med-card"), go=c && c.querySelector(".med-go"); if(!go) return;
  var con=c.querySelector(".med-con");
  if(!con){ go.insertAdjacentHTML("afterend", '<p class="med-con"></p>'); con=c.querySelector(".med-con"); }
  var k=medFondoTipo();
  con.innerHTML=k==="nada" ? "Sin sonido de fondo" : "Con "+esc(medFondoNombre(k).toLowerCase());
  if(!c.querySelector(".med-bong")){
    con.insertAdjacentHTML("afterend", '<button class="med-bong" data-act="x-med-bong"><span><b>Campana en cada cambio</b><small>Suena al pasar de inspira a mantén y espira</small></span><i></i></button>');
  }
  c.querySelector(".med-bong").classList.toggle("on", medBongOn());
}
var _medPintaExtras=medPintaTarjeta;
medPintaTarjeta=function(){ var r=_medPintaExtras.apply(this, arguments); try{ medExtrasPinta(); }catch(e){} return r; };
document.addEventListener("click", function(e){
  var b=e.target.closest && e.target.closest('[data-act="x-med-bong"]');
  if(b){ e.stopPropagation(); medPref().bong=!medBongOn(); save(); medExtrasPinta(); sonido("tick"); if(medBongOn()) medCuenco(293.7, .06, 3); return; }
  if(e.target.closest && e.target.closest('[data-act="x-med-fondo-elige"]')) setTimeout(function(){ try{ medExtrasPinta(); }catch(err){} }, 0);
}, true);

(function(){
  var st=document.createElement("style"); st.id="pulido-segunda-css"; st.textContent=[
/* iconos de la barra dentro de General: sin las capas que solo usa la barra */
'.gn-aico .f, .gn-aico .h, .gn-hic .f, .gn-hic .h, .gn-ha-i .f, .gn-ha-i .h{ display:none; }',
/* ── una sola animación al marcar ── */
'@keyframes peakSello{ 0%{ transform:scale(.9); } 50%{ transform:scale(1.06); } 100%{ transform:none; } }',
'@keyframes hnPop{ 0%{ transform:scale(.9); } 50%{ transform:scale(1.06); } 100%{ transform:none; } }',
'@keyframes tickSalto{ 0%{ transform:scale(.9); } 50%{ transform:scale(1.06); } 100%{ transform:none; } }',
'@keyframes clPop{ 0%{ transform:scale(.9); } 50%{ transform:scale(1.06); } 100%{ transform:none; } }',
'@keyframes medPop{ 0%{ transform:scale(.9); } 50%{ transform:scale(1.06); } 100%{ transform:none; } }',
'@keyframes mmTick{ 0%{ opacity:0; } 100%{ opacity:1; } }',
/* lo que movía filas, tarjetas o la pantalla */
'@keyframes tickFila{ from{} to{} } @keyframes tickOnda{ from{ opacity:0; } to{ opacity:0; } } @keyframes tickGlow{ from{ opacity:0; } to{ opacity:0; } }',
'@keyframes saludOk{ from{} to{} } @keyframes clBrillo{ from{} to{} } @keyframes mmFondo{ from{} to{} } @keyframes mmTexto{ from{} to{} }',
'@keyframes opSube{ from{} to{} } @keyframes bxPop{ from{} to{} } @keyframes bxBrillo{ from{ opacity:0; } to{ opacity:0; } }',
'@keyframes cbChispa{ from{ opacity:0; } to{ opacity:0; } } @keyframes gymChispa{ from{ opacity:0; } to{ opacity:0; } } @keyframes gymOla{ from{ opacity:0; } to{ opacity:0; } }',
'#gym-btn.gym-sello, .ali-btn.ali-sello{ animation:none !important; }',
'.cb-ck.ali-sello, .rp-chk{ animation-name:peakSello; }',
/* el círculo se rellena suave */
'.gn-ck, .tick, .rp-chk, .cb-ck, .mm-anillo{ transition:background-color .25s ease, border-color .25s ease, box-shadow .25s ease; }',
/* ── meditación: sonido elegido bien marcado ── */
'#med-card .med-fondos button.on{ background:var(--c-mente) !important; color:var(--bg) !important; box-shadow:none !important; padding-left:30px; position:relative; }',
'#med-card .med-fondos button.on::before{ content:""; position:absolute; left:12px; top:50%; width:12px; height:12px; margin-top:-6px; background:currentColor;',
'  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%273%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M5 12l5 5 9-10%27/%3E%3C/svg%3E") center/contain no-repeat;',
'  mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%273%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M5 12l5 5 9-10%27/%3E%3C/svg%3E") center/contain no-repeat; }',
'#med-card .med-con{ text-align:center; font-size:13px; font-weight:500; color:var(--t2); margin-top:8px; }',
'#med-card .med-bong{ width:100%; display:flex; align-items:center; gap:12px; margin-top:14px; padding:12px 14px; border-radius:16px; background:var(--fill); text-align:left; }',
'#med-card .med-bong span{ flex:1; min-width:0; } #med-card .med-bong b{ display:block; font-size:14px; font-weight:600; } #med-card .med-bong small{ display:block; font-size:12px; color:var(--t3); }',
'#med-card .med-bong i{ width:44px; height:26px; flex:none; border-radius:99px; background:var(--hairline); position:relative; transition:background .2s; }',
'#med-card .med-bong i::after{ content:""; position:absolute; left:3px; top:3px; width:20px; height:20px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:transform .25s cubic-bezier(.3,1.4,.5,1); }',
'#med-card .med-bong.on i{ background:var(--c-mente); } #med-card .med-bong.on i::after{ transform:translateX(18px); }',
/* ── tu foto dentro del grupo: solo se ve, no se cambia ── */
'#v-social .av-lapiz[data-act="nube-foto"]{ display:none !important; }'
  ].join("\n"); document.head.appendChild(st);
})();
setTimeout(function(){ try{ render(); }catch(e){} }, 0);
