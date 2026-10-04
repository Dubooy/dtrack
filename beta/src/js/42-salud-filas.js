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
/* la semana en barritas, como en Salud del iPhone: grises y hoy en color */
var SF_TOPE={ water:10, sleep:10, screen:6 };
function sfSemana(k){
  var hoy=curDay(), out="";
  for(var i=6;i>=0;i--){
    var d=addDays(hoy,-i), v=((S.habits&&S.habits[d])||{})[k];
    var tiene=(v!=null && (k==="screen" || v>0));
    var alto=tiene ? Math.max(14, Math.min(100, Math.round(v/SF_TOPE[k]*100))) : 8;
    out+='<i class="'+(i===0?"hoy":"")+(tiene?"":" nada")+'" style="height:'+alto+'%"></i>';
  }
  return out;
}
function saludFilas(){
  var t=curDay(), h=habit(t);
  document.querySelectorAll(".sf-fila").forEach(function(f){
    var k=f.dataset.k, v=h[k], o=sfTexto(k, k==="water" ? (v||0) : v), ok=SALUD[k].ok(v);
    f.style.setProperty("--sf", "var("+SF_COLOR[k]+")");
    var n=f.querySelector(".sf-num"); n.innerHTML=o.n+(o.u?'<small>'+(o.u==="/8"?"de 8 vasos":o.u==="h"?"horas":o.u)+'</small>':"");
    n.classList.toggle("vacio", o.n==="—");
    f.querySelector(".sf-msg").textContent=o.msg;
    f.querySelector(".sf-sem").innerHTML=sfSemana(k);
    f.querySelector(".sf-cuando").textContent = t===today() ? "hoy" : "ese día";
    f.classList.toggle("ok", !!ok);
    f.classList.toggle("pasa", !!o.pasa);
    f.querySelectorAll("[data-act]").forEach(function(b){ b.dataset.day=t; });
    if(f.dataset.act) f.dataset.day=t;
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
    return acc(a, el);
  };

  var st=document.createElement("style");
  st.textContent=[
/* como Salud del iPhone: tarjeta lisa, el color solo en el título y en la barra de hoy */
':root{ --sf-agua:#2f8fd8; --sf-sueno:#5e5ce6; --sf-pantalla:#f2652a; }',
'html.dark{ --sf-agua:#4fb1f5; --sf-sueno:#8583ff; --sf-pantalla:#ff7d45; }',
'.sf-caja{ padding:0!important; background:none!important; box-shadow:none!important; }',
'.sf-fila{ --sf:var(--accent); display:block; padding:16px 18px 18px; margin-bottom:12px; border-radius:24px; cursor:pointer;',
'  background:var(--tarjeta, var(--glass-bg)); box-shadow:0 0 0 1px var(--tarjeta-borde, var(--hairline));',
'  -webkit-tap-highlight-color:transparent; transition:transform .25s var(--spring); }',
'.sf-fila:last-child{ margin-bottom:0; }',
'.sf-fila:active{ transform:scale(.985); }',
'.sf-cab{ display:flex; align-items:center; gap:7px; color:var(--sf); }',
'.sf-cab b{ font-size:15.5px; font-weight:600; flex:1; }',
'.sf-ic{ display:grid; place-items:center; width:20px; height:20px; }',
'.sf-ic svg{ width:19px; height:19px; fill:currentColor; }',
'.sf-cuando{ font-size:13.5px; color:var(--t3); }',
'.sf-chev{ width:15px; height:15px; fill:none; stroke:var(--t3); stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; margin-right:-3px; }',
'.sf-mas{ font-size:12.5px; font-weight:600; color:var(--sf); padding:5px 10px; border-radius:99px; margin-right:4px;',
'  background:color-mix(in srgb, var(--sf) 13%, transparent); transition:transform .2s var(--spring); }',
'.sf-mas:active{ transform:scale(.9); }',
'.sf-cuerpo{ display:flex; align-items:flex-end; justify-content:space-between; gap:14px; margin-top:22px; }',
'.sf-dato{ min-width:0; }',
'.sf-fila .sf-num{ display:block; font-family:Unbounded,sans-serif!important; font-weight:700!important; font-size:34px!important; letter-spacing:-.05em; line-height:1; color:var(--t1)!important; background:none!important; }',
'.sf-num small{ font-family:Inter,sans-serif; font-size:14px; font-weight:600; letter-spacing:0; color:var(--t3); margin-left:6px; }',
'.sf-fila .sf-num.vacio{ color:var(--t3)!important; }',
'.sf-msg{ font-size:12.5px; color:var(--t3); margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.sf-fila.pasa .sf-msg{ color:var(--sf); }',
'.sf-sem{ flex:none; display:flex; align-items:flex-end; gap:4px; height:52px; }',
'.sf-sem i{ width:8px; border-radius:2.5px; background:color-mix(in srgb, var(--t1) 22%, transparent); transition:height .5s var(--spring); }',
'.sf-sem i.nada{ background:color-mix(in srgb, var(--t1) 10%, transparent); }',
'.sf-sem i.hoy{ background:var(--sf); }',
'.sf-sem i.hoy.nada{ background:color-mix(in srgb, var(--sf) 35%, transparent); }',
/* al apuntar: el número da un saltito y el icono también */
'.sf-num.salud-ok{ animation:sfNum .6s var(--spring); background:none!important; color:var(--t1)!important; }',
'@keyframes sfNum{ 30%{ transform:scale(1.08); } }',
'.sf-cae .sf-ic{ animation:sfIc .5s var(--spring); }',
'@keyframes sfIc{ 40%{ transform:scale(1.35); } }',
'@media (prefers-reduced-motion: reduce){ .sf-fila *{ animation:none!important; } }'
  ].join("\n"); document.head.appendChild(st);
})();
