/* ════════ marca, iconos de la barra y modo oscuro (18/10/2026) ════════
   · «PEAK.» arriba igual en todas las pestañas (General incluida, mismo tamaño),
     con su A normal (Carlos no quiso la montaña en la A).
   · Barra: General con la montaña calcada del logo; Retos con una diana.
   · Modo oscuro con más vida: grafito cálido en vez de casi negro, tarjetas que
     se distinguen y colores de sección más vivos. */
function pkLogo(){ return 'PEAK.'; }
function pkLogoPon(){
  $$('.view:not(#v-resumen) p.eyebrow').forEach(function(p){
    var h=p.nextElementSibling; if(!h || !h.matches("h1.display")) return;
    if(!p.querySelector(".pk-logo")) p.insertAdjacentHTML("afterbegin", '<span class="pk-logo" aria-label="PEAK.">'+pkLogo()+'</span>');
  });
}
BARRA_ICO.resumen='<g class="mk"><path fill="currentColor" stroke="none" transform="translate(2.2 2.6) scale(.0218)" d="'+PEAK_MK_D+'"/></g>';
BARRA_ICO.retos='<circle class="r" cx="11" cy="13" r="8.25"/><circle class="d" cx="11" cy="13" r="4.4"/><circle class="dp" cx="11" cy="13" r="1.25" fill="currentColor" stroke="none"/>'+
  '<path d="M11 13l8-8"/><path d="M16.4 3.2l.3 3.1 3.1.3"/>';
(function(){
  $$('#mtabs button[data-view="resumen"], #mtabs button[data-view="retos"]').forEach(function(b){
    var sv=b.querySelector("svg"); if(sv) sv.outerHTML=barraIco(b.dataset.view);
  });
})();
var _renderMarca=render;
render=function(){ var r=_renderMarca.apply(this, arguments); try{ pkLogoPon(); }catch(e){} return r; };
try{ pkLogoPon(); }catch(e){} setTimeout(function(){ try{ pkLogoPon(); }catch(e){} }, 0);
(function(){
  var P="html:not(.sage):not(.neo):not(.arena):not(.porcelana):not(.medianoche):not(.oro):not(.gr)", D=P+".dark";
  var st=document.createElement("style"); st.id="marca-oscuro-css"; st.textContent=[
/* PEAK. a 17 px en todas */
'.view:not(#v-resumen) p.eyebrow:has(+ h1.display)::before{ content:none !important; }',
'.view:not(#v-resumen) p.eyebrow:has(+ h1.display){ font-size:0 !important; letter-spacing:0 !important; margin-bottom:0 !important; line-height:40px; }',
'.pk-logo{ font-family:"Unbounded",var(--f-titulo); font-weight:800; font-size:17px; letter-spacing:-.03em; line-height:40px; color:var(--t1); text-transform:none; }',
'html .gn-logo{ font-size:17px !important; letter-spacing:-.03em !important; }',
/* la diana: el punto del centro, del color del fondo cuando está abierta */
'#mtabs .mtab[aria-current="true"] svg .dp{ fill:var(--bg); }',
P+' #mtabs .mtab[aria-current="true"] svg .dp{ fill:#F1ECE1; }',
/* modo oscuro con vida */
D+'{ --bg:#1A1916; --tarjeta:#26241F; --t2:rgba(243,238,227,.74); --t3:rgba(243,238,227,.56); --hairline:rgba(243,238,227,.14); --tarjeta-borde:rgba(243,238,227,.1); }',
'html.dark{ --gn-tarjeta:#26241F; --tarjeta-dest-oscuro:#33302A;',
'  --gn-salvia:#B7D2A2; --gn-salvia-2:#323B2C; --gn-lavanda:#C6B3F0; --gn-lavanda-2:#363047;',
'  --gn-arena:#E8BF84; --gn-arena-2:#433623; --gn-verde:#93D0CC; --gn-verde-2:#263938;',
'  --gn-int:#2A2C24; --gn-reto:#2C2833; --gn-reto-ic:#3A3445; --gn-sol:#332E27; }',
P+'.dark #mtabs.barpill{ background:rgba(40,38,34,.94) !important; }'
  ].join("\n"); document.head.appendChild(st);
})();
