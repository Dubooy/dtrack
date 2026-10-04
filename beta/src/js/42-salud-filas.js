/* ════════════════════════════════════════════════════════════════
   SALUD DEL DÍA EN FILAS (oct 2026)
   Agua, sueño y pantalla: una fila cada uno, con su color, una frase
   en vez de «sin registrar», una barra hasta el objetivo y un «+».
   El «+» del agua suma un vaso; el de sueño y pantalla abre la hoja
   para apuntar las horas (la misma que al tocar la fila).
   Los iconos se mueven un poco: la gota cae y salpica, la luna se mece
   y suelta «z», y el móvil vibra cuando te pasas de pantalla.
   El marcado está en html/pantallas.html (.sf-caja).
   ════════════════════════════════════════════════════════════════ */

/* los medidores de lienzo de antes ya no existen */
function medSync(){}
/* las barritas de la semana bajo cada valor tampoco */
function vitalTendencias(){}

var SF_COLOR={ water:"--sf-agua", sleep:"--sf-sueno", screen:"--sf-pantalla" };
function sfHoras(v){ return String(Math.round(v*10)/10).replace(".", L10N.dec||","); }
function sfTexto(k, v){
  if(k==="water"){
    if(!v) return { n:"0", u:"/8", msg:"Empieza con un vaso", f:0 };
    return { n:String(v), u:"/8", msg: v>=8 ? "¡Bien hidratado!" : (8-v===1 ? "Te falta 1 vaso" : "Te faltan "+(8-v)+" vasos"), f:v/8 };
  }
  if(k==="sleep"){
    if(v==null || !v) return { n:"—", u:"", msg:"¿Cuánto dormiste anoche?", f:0 };
    return { n:sfHoras(v), u:"h", msg: v>=7 ? "Has dormido bien, sigue así" : "Te faltan "+sfHoras(7-v)+" h para las 7", f:v/7 };
  }
  if(v==null) return { n:"—", u:"", msg:"Toca + para apuntarla", f:0 };
  var queda=2-v;
  return { n:sfHoras(v), u:"h", f:v/2, pasa:v>2,
           msg: v<2 ? (queda>=1 ? "Te quedan "+sfHoras(queda)+" h libres" : "Te queda "+(queda===.5?"media hora":sfHoras(queda)+" h")+" libre")
                    : v===2 ? "Justo en el límite" : "Te has pasado "+sfHoras(v-2)+" h" };
}
function saludFilas(){
  var t=curDay(), h=habit(t);
  document.querySelectorAll(".sf-fila").forEach(function(f){
    var k=f.dataset.k, v=h[k], o=sfTexto(k, k==="water" ? (v||0) : v), ok=SALUD[k].ok(v);
    f.style.setProperty("--sf", "var("+(o.pasa ? "--sf-pasa" : SF_COLOR[k])+")");
    var n=f.querySelector(".sf-num"); n.innerHTML=o.n+(o.u?'<small>'+o.u+'</small>':"");
    f.querySelector(".sf-msg").textContent=o.msg;
    f.querySelector(".sf-barra u").style.width=Math.round(Math.min(1,o.f)*100)+"%";
    f.classList.toggle("ok", !!ok);
    f.classList.toggle("pasa", !!o.pasa);
    f.querySelectorAll("[data-act]").forEach(function(b){ b.dataset.day=t; });
  });
}
/* un toque: la animación del icono vuelve a empezar */
function sfToca(k, cls){
  var f=document.querySelector('.sf-fila[data-k="'+k+'"]'); if(!f) return;
  f.classList.remove(cls); void f.offsetWidth; f.classList.add(cls);
  setTimeout(function(){ f.classList.remove(cls); }, 900);
}

(function(){
  var antes=rVital;
  rVital=function(){ antes.apply(this, arguments); try{ saludFilas(); }catch(e){} };

  var acc=crecerAccion;
  crecerAccion=function(a, el){
    if(a==="x-sf-vaso"){
      var d=el.dataset.day||curDay();
      saludPon(d, "water", clamp((habit(d).water||0)+1, 0, 20));
      sonido("pop"); sfToca("water", "sf-cae");
      return true;
    }
    if(a==="x-valor" && el.classList.contains("sf-fila")) sfToca(el.dataset.k, "sf-cae");
    return acc(a, el);
  };

  var st=document.createElement("style");
  st.textContent=[
/* todo en tinta, como el resto de la app; lo cumplido lleva las rayas del logo */
':root{ --sf-agua:var(--t1); --sf-sueno:var(--t1); --sf-pantalla:var(--t1); --sf-pasa:var(--alert); }',
'.sf-caja{ padding:0!important; background:none!important; box-shadow:none!important; }',
/* una sola tarjeta con tres filas separadas por una línea */
'.sf-fila{ --sf:var(--t1); position:relative; display:flex; align-items:center; gap:14px; padding:16px 16px!important; margin:0; border-radius:0!important; cursor:pointer;',
'  background:var(--tarjeta, var(--glass-bg))!important; background-image:none!important; border:0!important;',
'  box-shadow:0 0 0 1px var(--tarjeta-borde, var(--hairline))!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important;',
'  -webkit-tap-highlight-color:transparent; transition:background .2s var(--ease); }',
'.sf-fila:first-of-type{ border-radius:24px 24px 0 0!important; }',
'.sf-fila:last-child{ border-radius:0 0 24px 24px!important; }',
'.sf-fila + .sf-fila{ margin-top:1px; }',
'.sf-fila:active{ background:color-mix(in srgb, var(--t1) 4%, var(--tarjeta, var(--bg)))!important; }',
'.sf-ic{ position:relative; flex:none; width:28px; height:28px; display:grid; place-items:center; color:var(--t1); }',
'.sf-ic svg{ width:26px; height:26px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; overflow:visible; }',
'.sf-z, .sf-hecho{ display:none!important; }',
'.sf-mid{ flex:1; min-width:0; }',
'.sf-top{ display:flex; align-items:baseline; justify-content:space-between; gap:8px; }',
'.sf-top b{ font-size:15px; font-weight:600; }',
'.sf-num{ font-family:Unbounded,sans-serif; font-weight:700; font-size:19px; letter-spacing:-.05em; line-height:1; }',
'.sf-num small{ font-family:Inter,sans-serif; font-size:12px; font-weight:600; letter-spacing:0; color:var(--t3); margin-left:2px; }',
'.sf-msg{ font-size:12.5px; color:var(--t3); margin:3px 0 10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.sf-fila.ok .sf-msg{ color:var(--good); }',
'.sf-fila.pasa .sf-msg{ color:var(--alert); }',
'.sf-barra{ height:6px; border-radius:4px; overflow:hidden; background:var(--fill-hi); }',
'.sf-barra u{ display:block; height:100%; width:0; border-radius:4px; background:var(--sf); transition:width .6s var(--spring); }',
'.sf-fila.ok .sf-barra{ height:7px; box-shadow:inset 0 0 0 1.2px var(--t1); background:transparent; }',
'.sf-fila.ok .sf-barra u{ background:repeating-linear-gradient(118deg,var(--t1) 0 1.6px,transparent 1.6px 5px); }',
'.sf-mas{ flex:none; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; font-size:20px; font-weight:400; line-height:1;',
'  color:var(--t1); box-shadow:inset 0 0 0 1.5px var(--t1); transition:transform .25s var(--spring), background .2s; }',
'.sf-mas:active{ transform:scale(.88); background:var(--t1); color:var(--bg); }',
'.sf-num.salud-ok{ animation:sfNum .6s var(--spring); background:none!important; color:inherit!important; }',
'@keyframes sfNum{ 30%{ transform:scale(1.18); } }',
/* movimiento discreto: solo al apuntar algo, sin nada dando vueltas en reposo */
'.sf-onda{ position:absolute; left:50%; bottom:1px; width:22px; height:6px; margin-left:-11px; border-radius:50%; border:1.5px solid var(--t1); opacity:0; pointer-events:none; }',
'.sf-cae .sf-ic svg{ animation:sfCae .55s cubic-bezier(.3,1.5,.5,1); }',
'@keyframes sfCae{ 0%{ transform:translateY(-8px); opacity:.2; } 100%{ transform:none; } }',
'.sf-cae .sf-onda{ animation:sfOnda .7s .2s ease-out; }',
'@keyframes sfOnda{ 0%{ transform:scale(.3); opacity:.7; } 100%{ transform:scale(1.6); opacity:0; } }',
'.sf-fila.pasa .sf-movil{ transform-origin:12px 12px; animation:sfVibra 3.2s ease-in-out infinite; }',
'@keyframes sfVibra{ 0%,84%,100%{ transform:none; } 87%{ transform:rotate(-7deg); } 90%{ transform:rotate(7deg); } 93%{ transform:rotate(-4deg); } 96%{ transform:none; } }',
'@media (prefers-reduced-motion: reduce){ .sf-fila *{ animation:none!important; } }'
  ].join("\n"); document.head.appendChild(st);
})();
