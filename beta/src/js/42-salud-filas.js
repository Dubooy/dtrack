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
/* cada cosa con su color, aunque el resto de la app vaya con un solo acento */
':root{ --sf-agua:#2a8fc4; --sf-sueno:#7c5cd6; --sf-pantalla:#e0892a; --sf-pasa:#d64545; }',
'html.dark{ --sf-agua:#5bb6e6; --sf-sueno:#a993f0; --sf-pantalla:#f2a85a; --sf-pasa:#ff7b72; }',
'.sf-caja{ padding:0!important; background:none!important; box-shadow:none!important; }',
'.sf-fila{ --sf:var(--accent); position:relative; display:flex; align-items:center; gap:14px; padding:14px!important; margin-bottom:12px; border-radius:22px!important; cursor:pointer;',
'  background:var(--tarjeta, var(--glass-bg))!important; background-image:none!important; border:0!important;',
'  box-shadow:0 0 0 1px var(--tarjeta-borde, var(--hairline)), 0 6px 18px -8px rgba(60,40,10,.18)!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important;',
'  transition:transform .25s var(--spring); -webkit-tap-highlight-color:transparent; }',
'.sf-fila:last-child{ margin-bottom:0; }',
'.sf-fila:active{ transform:scale(.985); }',
'.sf-ic{ position:relative; flex:none; width:52px; height:52px; border-radius:16px; display:grid; place-items:center;',
'  color:var(--sf); background:color-mix(in srgb, var(--sf) 14%, transparent); transition:background .4s var(--ease), color .4s var(--ease); }',
'.sf-ic svg{ width:27px; height:27px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; overflow:visible; }',
'.sf-fila.ok .sf-ic{ background:var(--sf); color:var(--bg); }',
'.sf-fila.ok .sf-gota, .sf-fila.ok .sf-luna{ fill:currentColor; }',
'.sf-fila.ok .sf-brillo{ stroke:var(--sf); }',
'.sf-mid{ flex:1; min-width:0; }',
'.sf-top{ display:flex; align-items:baseline; justify-content:space-between; gap:8px; }',
'.sf-top b{ font-size:15px; font-weight:600; }',
'.sf-num{ font-family:Unbounded,sans-serif; font-weight:700; font-size:20px; letter-spacing:-.05em; line-height:1; }',
'.sf-num small{ font-family:Inter,sans-serif; font-size:12px; font-weight:600; letter-spacing:0; color:var(--t3); margin-left:2px; }',
'.sf-msg{ font-size:12.5px; color:var(--t2); margin:3px 0 9px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.sf-barra{ height:8px; border-radius:5px; overflow:hidden; background:color-mix(in srgb, var(--sf) 15%, transparent); }',
'.sf-barra u{ display:block; height:100%; width:0; border-radius:5px; background:var(--sf); transition:width .6s var(--spring); }',
'.sf-mas{ flex:none; width:42px; height:42px; border-radius:50%; display:grid; place-items:center; font-size:24px; font-weight:500; line-height:1;',
'  color:var(--bg); background:var(--sf); transition:transform .25s var(--spring); }',
'.sf-mas:active{ transform:scale(.88); }',
'.sf-hecho{ display:none; position:absolute; right:14px; top:-8px; font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:10px;',
'  color:var(--bg); background:var(--sf); z-index:2; }',
'.sf-fila.ok .sf-hecho{ display:block; animation:sfHecho .5s var(--spring); }',
'@keyframes sfHecho{ from{ transform:scale(.4); opacity:0; } }',
/* el número no se tiñe de verde como antes: ya lo hace la fila */
'.sf-num.salud-ok{ animation:sfNum .7s var(--spring); background:none!important; color:inherit!important; }',
'@keyframes sfNum{ 30%{ transform:scale(1.25); } }',
/* agua: la gota se balancea un poco y al sumar cae y salpica */
'.sf-gota, .sf-brillo{ transform-origin:12px 20px; animation:sfGota 3.6s ease-in-out infinite; }',
'@keyframes sfGota{ 0%,100%{ transform:rotate(0); } 25%{ transform:rotate(-5deg); } 75%{ transform:rotate(5deg); } }',
'.sf-onda{ position:absolute; left:50%; bottom:9px; width:26px; height:8px; margin-left:-13px; border-radius:50%; border:2px solid var(--sf); opacity:0; pointer-events:none; }',
'.sf-fila.ok .sf-onda{ border-color:var(--bg); }',
'.sf-cae .sf-ic svg{ animation:sfCae .6s cubic-bezier(.3,1.6,.5,1); }',
'@keyframes sfCae{ 0%{ transform:translateY(-12px) scale(.85); opacity:.3; } 60%{ transform:translateY(2px) scaleY(.9); } 100%{ transform:none; } }',
'.sf-cae .sf-onda{ animation:sfOnda .8s .25s ease-out; }',
'@keyframes sfOnda{ 0%{ transform:scale(.3); opacity:.9; } 100%{ transform:scale(1.7); opacity:0; } }',
/* sueño: la luna se mece y suben las «z» */
'.sf-luna{ transform-origin:12px 12px; animation:sfLuna 5s ease-in-out infinite; }',
'@keyframes sfLuna{ 0%,100%{ transform:rotate(-8deg); } 50%{ transform:rotate(8deg); } }',
'.sf-z{ position:absolute; right:7px; top:8px; font-style:normal; font-size:10px; font-weight:800; opacity:0; animation:sfZ 4s ease-out infinite; }',
'.sf-z2{ animation-delay:2s; font-size:8px; }',
'@keyframes sfZ{ 0%{ transform:translate(0,6px); opacity:0; } 20%{ opacity:1; } 70%{ opacity:0; transform:translate(5px,-8px); } 100%{ opacity:0; } }',
/* pantalla: el móvil se ilumina de vez en cuando y vibra si te pasas */
'.sf-movil{ transform-origin:12px 12px; animation:sfMovil 6s ease-in-out infinite; }',
'@keyframes sfMovil{ 0%,86%,100%{ transform:none; } 90%{ transform:translateY(-2px); } 94%{ transform:none; } }',
'.sf-fila.pasa .sf-movil{ animation:sfVibra 2.4s ease-in-out infinite; }',
'@keyframes sfVibra{ 0%,70%,100%{ transform:none; } 74%{ transform:rotate(-9deg); } 78%{ transform:rotate(9deg); } 82%{ transform:rotate(-7deg); } 86%{ transform:rotate(6deg); } 90%{ transform:none; } }',
'@media (prefers-reduced-motion: reduce){ .sf-fila *{ animation:none!important; } }'
  ].join("\n"); document.head.appendChild(st);
})();
