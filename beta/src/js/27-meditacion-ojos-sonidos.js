/* ════════════════════════════════════════════════════════════════
   MEDITACIÓN CON LOS OJOS CERRADOS (sep 2026)
   · El cuenco suena en cada cambio de fase (inspira → mantén → espira
     → pausa → inspira), para seguir el ritmo sin mirar. Antes solo
     sonaba al inspirar, una vez de cada dos.
   · Al inspirar suena aire que entra (soplo que sube); al mantener,
     nada; al espirar, aire que sale (soplo que baja y se apaga).
     Ruido filtrado generado en el móvil, como las olas: sin archivos.
   ════════════════════════════════════════════════════════════════ */
var MED_RUIDO=null, MED_ALIENTO=null;
function medRuido(ctx){
  if(MED_RUIDO && MED_RUIDO.sampleRate===ctx.sampleRate) return MED_RUIDO;
  var n=ctx.sampleRate*2, b=ctx.createBuffer(1, n, ctx.sampleRate), d=b.getChannelData(0);
  for(var i=0;i<n;i++) d[i]=Math.random()*2-1;
  MED_RUIDO=b; return b;
}
function medAliento(k, seg){
  var ctx=medAudio(); if(!ctx) return;
  medAlientoPara(.15);
  seg=Math.max(1, seg);
  try{
    var t=ctx.currentTime+0.03, fin=t+seg, src=ctx.createBufferSource(); src.buffer=medRuido(ctx); src.loop=true;
    var bp=ctx.createBiquadFilter(), lp=ctx.createBiquadFilter(), g=ctx.createGain();
    bp.type="bandpass"; lp.type="lowpass"; g.gain.setValueAtTime(0.0001, t);
    if(k==="in"){
      /* por la nariz: fino, va subiendo y se corta suave al llenar */
      bp.Q.value=.8; bp.frequency.setValueAtTime(650, t); bp.frequency.linearRampToValueAtTime(1300, fin);
      lp.frequency.value=2000;
      g.gain.linearRampToValueAtTime(.028, t+Math.min(1.2, seg*.4));
      g.gain.linearRampToValueAtTime(.045, fin-Math.min(.6, seg*.18));
      g.gain.linearRampToValueAtTime(0.0001, fin);
    } else {
      /* soltar el aire: más grave y abierto, empieza fuerte y se apaga */
      bp.Q.value=.6; bp.frequency.setValueAtTime(800, t); bp.frequency.exponentialRampToValueAtTime(320, fin);
      lp.frequency.value=1500;
      g.gain.linearRampToValueAtTime(.05, t+Math.min(.6, seg*.15));
      g.gain.exponentialRampToValueAtTime(.008, fin-Math.min(.4, seg*.1));
      g.gain.linearRampToValueAtTime(0.0001, fin);
    }
    src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(medSalida(ctx));
    src.start(t); src.stop(fin+0.05);
    MED_ALIENTO={ src:src, g:g };
  }catch(e){ MED_ALIENTO=null; }
}
function medAlientoPara(s){
  if(!MED_ALIENTO || !MED_CTX) return;
  var a=MED_ALIENTO; MED_ALIENTO=null; s=s||.3;
  try{ var t=MED_CTX.currentTime; a.g.gain.cancelScheduledValues(t); a.g.gain.setValueAtTime(a.g.gain.value, t); a.g.gain.linearRampToValueAtTime(0.0001, t+s); a.src.stop(t+s+0.05); }catch(e){}
}
/* cada fase nueva: cuenco y, si toca, el aire */
var _medAvanzaCF=medAvanza;
medAvanza=function(){
  var antes=medA && medA.fase, r=_medAvanzaCF.apply(this, arguments);
  if(!medA || medA.fin || medA.pausadoEn || medA.tipo.guia!=="resp" || medA.fase===antes || !medA.fase) return r;
  var f=medFaseDe(medTranscurrido());
  if(f.k==="prep") return r;
  if(medSuena()) medCuenco(293.7, .075, Math.min(5, Math.max(2.5, f.dur+.8)));
  if(medSuena() && (f.k==="in" || f.k==="ex")) medAliento(f.k, f.rest); else medAlientoPara(.3);
  return r;
};
/* el cuenco de antes (solo al inspirar, una de cada dos) ya no hace falta: lo tapa el de cada fase */
var _medCuencoCF=medCuenco;
medCuenco=function(f, vol, dur){
  if(medA && !medA.fin && medA.tipo.guia==="resp" && f===293.7 && vol===.016) return;
  return _medCuencoCF.apply(this, arguments);
};
/* al parar el sonido, pausar o terminar, el aire también se calla */
var _medOlasParaCF=medOlasPara;
medOlasPara=function(){ medAlientoPara(.4); return _medOlasParaCF.apply(this, arguments); };
var _medPausaCF=medPausa;
medPausa=function(){ if(medA && !medA.pausadoEn) medAlientoPara(.4); return _medPausaCF.apply(this, arguments); };

/* ════════════════════════════════════════════════════════════════
   SONIDOS DE FONDO Y LIMITADOR (sep 2026)
   · Todo el sonido de la meditación pasa por un limitador suave: así el
     aire, el cuenco y el fondo no saturan los altavoces del móvil.
   · El cuenco y el aire suenan siempre que haya sonido (el editor ya
     solo pregunta «con sonido / sin sonido»); lo que se elige aparte es
     el fondo: olas suaves (siguen tu respiración, las de siempre),
     lluvia, mar rompiendo, río, hoguera, música relajante o nada.
     Se elige en la tarjeta de Meditación (con un trocito de prueba) y
     se puede cambiar durante la sesión con el botón de arriba.
   · Todo se genera en el móvil, sin archivos: ruido filtrado con
     envolventes (agua, fuego) y notas suaves de una escala pentatónica
     sobre un fondo tenue (música).
   ════════════════════════════════════════════════════════════════ */
var MED_SAL=null;
function medSalida(ctx){
  if(MED_SAL && MED_SAL.context===ctx) return MED_SAL;
  var g=ctx.createGain(); g.gain.value=.9;
  try{
    var c=ctx.createDynamicsCompressor();
    c.threshold.value=-20; c.knee.value=14; c.ratio.value=8; c.attack.value=.008; c.release.value=.35;
    g.connect(c); c.connect(ctx.destination);
  }catch(e){ g.connect(ctx.destination); }
  MED_SAL=g; return g;
}
var MED_FONDOS=[["olas","Olas suaves"],["lluvia","Lluvia"],["mar","Mar"],["rio","Río"],["hoguera","Hoguera"],["musica","Música"],["nada","Sin fondo"]];
var MED_FONDO_VOL={ lluvia:.11, mar:.14, rio:.1, hoguera:.13, musica:.5 };
function medFondoTipo(){ var f=medPref().fondo; return MED_FONDOS.some(function(x){ return x[0]===f; }) ? f : "olas"; }
function medFondoNombre(k){ for(var i=0;i<MED_FONDOS.length;i++) if(MED_FONDOS[i][0]===k) return MED_FONDOS[i][1]; return ""; }
/* ahora solo «con sonido» o «sin sonido»: lo de antes (olas, cuenco) cuenta como con sonido */
medModoSonido=function(v){ return (v===false || v==="nada") ? "nada" : "ambos"; };
MED_SONIDOS.length=0; MED_SONIDOS.push(["ambos","Con sonido"], ["nada","Sin sonido"]);
medHayOlas=function(){ return medSuena() && medFondoTipo()==="olas"; };
medHayCuenco=function(){ return medSuena(); };

/* ── los bucles, generados una vez ── */
var MED_BUF={};
function medRosa(n){
  var d=new Float32Array(n), b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for(var i=0;i<n;i++){ var w=Math.random()*2-1;
    b0=.99886*b0+w*.0555179; b1=.99332*b1+w*.0750759; b2=.969*b2+w*.153852; b3=.8665*b3+w*.3104856; b4=.55*b4+w*.5329522; b5=-.7616*b5-w*.016898;
    d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11; b6=w*.115926; }
  return d;
}
function medMarron(n){ var d=new Float32Array(n), l=0; for(var i=0;i<n;i++){ l=(l+.02*(Math.random()*2-1))/1.02; d[i]=l*3.5; } return d; }
/* el final se funde con el principio y todo se deja al mismo volumen medio */
function medCierraBucle(d, sr){
  var n=d.length, f=Math.min(n>>2, Math.floor(sr*.6));
  for(var k=0;k<f;k++){ var a=k/f; d[k]=d[k]*a+d[n-f+k]*(1-a); }
  var out=d.subarray(0, n-f), s=0; for(var i=0;i<out.length;i+=4) s+=out[i]*out[i];
  var rms=Math.sqrt(s/(out.length/4))||1, k2=.25/rms; for(var j=0;j<out.length;j++) out[j]=Math.max(-1, Math.min(1, out[j]*k2));
  return out;
}
function medBufFondo(ctx, k){
  if(MED_BUF[k] && MED_BUF[k].sampleRate===ctx.sampleRate) return MED_BUF[k];
  var sr=ctx.sampleRate, seg={ lluvia:9, mar:25, rio:9, hoguera:10 }[k]||8, n=Math.floor(sr*seg), d;
  if(k==="lluvia"){
    d=medRosa(n);
    /* gotas: golpecitos cortos repartidos al azar */
    for(var g=0; g<seg*28; g++){ var p=Math.floor(Math.random()*(n-sr*.02)), a=.15+Math.random()*.5, L=Math.floor(sr*(.002+Math.random()*.01));
      for(var i=0;i<L;i++) d[p+i]+=(Math.random()*2-1)*a*Math.exp(-i/(L*.3)); }
  } else if(k==="mar"){
    /* tres olas de distinto largo: suben, rompen (con espuma) y se retiran */
    var br=medMarron(n), bl=new Float32Array(n); for(var q=0;q<n;q++) bl[q]=Math.random()*2-1;
    d=new Float32Array(n); var cortes=[0, 7.6, 16.2, seg], ini;
    for(var o=0;o<3;o++){ ini=Math.floor(cortes[o]*sr); var fin=Math.floor(cortes[o+1]*sr), L2=fin-ini, sube=sr*(2+Math.random()*.8);
      for(var x=0;x<L2;x++){
        var env=x<sube ? .15+.85*Math.pow(x/sube, 2) : .15+.85*Math.exp(-(x-sube)/(sr*1.9));
        var esp=x<sube ? 0 : Math.exp(-(x-sube)/(sr*.9))*Math.min(1, (x-sube)/(sr*.15));
        d[ini+x]=br[ini+x]*env+bl[ini+x]*esp*.22;
      } }
  } else if(k==="rio"){
    /* agua corriendo: ruido rosa que se agita deprisa, sin ritmo */
    d=medRosa(n); var m=0, obj=0;
    for(var r=0;r<n;r++){ if(r%Math.floor(sr/9)===0) obj=(Math.random()*2-1)*.35; m+=(obj-m)*.002; d[r]*=1+m; }
  } else {
    /* hoguera: un rumor grave y chasquidos sueltos, a veces en racha */
    d=medMarron(n); for(var h2=0;h2<n;h2++) d[h2]*=.35;
    var t=0; while(t<n-sr*.05){
      t+=Math.floor(sr*(Math.random()<.2 ? .02+Math.random()*.05 : .08+Math.random()*.35));
      var amp=.25+Math.random()*(Math.random()<.1 ? 1.6 : .7), L3=Math.floor(sr*(.001+Math.random()*.004));
      for(var c2=0;c2<L3 && t+c2<n;c2++) d[t+c2]+=(Math.random()*2-1)*amp*Math.exp(-c2/(L3*.25));
    }
  }
  d=medCierraBucle(d, sr);
  var b=ctx.createBuffer(1, d.length, sr); b.getChannelData(0).set(d);
  MED_BUF[k]=b; return b;
}
/* crea el fondo k (sin las olas suaves, que van aparte) y lo devuelve para poder pararlo */
function medFondoCrea(k, vol){
  var ctx=medAudio(); if(!ctx || !MED_FONDO_VOL[k]) return null;
  var t=ctx.currentTime, sal=ctx.createGain(), F={ k:k, sal:sal, nodos:[], t:null, vol:MED_FONDO_VOL[k]*(vol==null?1:vol) };
  sal.gain.setValueAtTime(0.0001, t); sal.gain.linearRampToValueAtTime(F.vol, t+2.5); sal.connect(medSalida(ctx));
  try{
    if(k==="musica") medMusica(ctx, F);
    else {
      var src=ctx.createBufferSource(); src.buffer=medBufFondo(ctx, k); src.loop=true;
      var hp=ctx.createBiquadFilter(), lp=ctx.createBiquadFilter(); hp.type="highpass"; lp.type="lowpass";
      var fil={ lluvia:[350, 6500], mar:[40, 1700], rio:[250, 3200], hoguera:[60, 6000] }[k];
      hp.frequency.value=fil[0]; lp.frequency.value=fil[1];
      src.connect(hp); hp.connect(lp); lp.connect(sal);
      src.start(t, Math.random()*src.buffer.duration); F.nodos.push(src);
    }
  }catch(e){ return null; }
  return F;
}
/* música: un fondo tenue (la y mi) y notas sueltas de la pentatónica de la menor */
function medMusica(ctx, F){
  var t=ctx.currentTime, pad=ctx.createGain(), lp=ctx.createBiquadFilter();
  lp.type="lowpass"; lp.frequency.value=700; pad.gain.value=.05; pad.connect(lp); lp.connect(F.sal);
  [[110,"sine",1],[164.81,"sine",.7],[220,"triangle",.35],[110.4,"sine",.6]].forEach(function(v){
    var o=ctx.createOscillator(), g=ctx.createGain(); o.type=v[1]; o.frequency.value=v[0]; g.gain.value=v[2];
    o.connect(g); g.connect(pad); o.start(t); F.nodos.push(o);
  });
  var lfo=ctx.createOscillator(), lg=ctx.createGain(); lfo.frequency.value=.07; lg.gain.value=.02; lfo.connect(lg); lg.connect(pad.gain); lfo.start(t); F.nodos.push(lfo);
  var escala=[220,261.63,293.66,329.63,392,440,523.25,587.33], ult=-1;
  function nota(){
    if(F.parado) return;
    var c=MED_CTX; if(!c) return;
    var i; do{ i=Math.floor(Math.random()*escala.length); } while(i===ult); ult=i;
    var t0=c.currentTime+.05, f=escala[i], g=c.createGain(), fl=c.createBiquadFilter();
    fl.type="lowpass"; fl.frequency.value=1800; g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(.09, t0+1.1); g.gain.exponentialRampToValueAtTime(0.0001, t0+7);
    g.connect(fl); fl.connect(F.sal);
    [["sine",1,0],["triangle",.25,1.5],["sine",.12,2.002]].forEach(function(v){
      var o=c.createOscillator(), og=c.createGain(); o.type=v[0]; o.frequency.value=v[2] ? f*v[2] : f; og.gain.value=v[1];
      o.connect(og); og.connect(g); o.start(t0); o.stop(t0+7.2);
    });
  }
  nota(); F.t=setInterval(function(){ if(Math.random()<.75) nota(); }, 2800);
}
function medFondoQuita(F, s){
  if(!F) return; F.parado=true; clearInterval(F.t); s=s||1.5;
  try{ var t=MED_CTX.currentTime; F.sal.gain.cancelScheduledValues(t); F.sal.gain.setValueAtTime(F.sal.gain.value, t); F.sal.gain.linearRampToValueAtTime(0.0001, t+s);
    F.nodos.forEach(function(n){ try{ n.stop(t+s+.1); }catch(e){} }); }catch(e){}
}
var MED_FONDO=null, MED_PRUEBA=null, medPruebaT=null;
function medFondoPara(s){ var F=MED_FONDO; MED_FONDO=null; medFondoQuita(F, s); }
/* en la sesión: arranca el fondo elegido (las olas suaves, con su código de siempre) */
function medFondoEmpieza(){
  medFondoPara(1.2);
  if(!medA || medA.fin || !medSuena()) return;
  var k=medFondoTipo();
  if(k==="olas"){ medOlasEmpieza(); return; }
  if(MED_OLAS) _medOlasParaCF();
  MED_FONDO=medFondoCrea(k, medA.pausadoEn ? .3 : 1);
}
function medFondoNivel(x){
  if(!MED_FONDO || !MED_CTX) return;
  try{ var t=MED_CTX.currentTime, g=MED_FONDO.sal.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(Math.max(.0001, MED_FONDO.vol*x), t+1.2); }catch(e){}
}
/* un trocito para probarlo desde la tarjeta */
function medFondoPrueba(k){
  medFondoQuita(MED_PRUEBA, .4); MED_PRUEBA=null; clearTimeout(medPruebaT);
  if(medA) return;
  if(k==="olas"){ medCuenco(293.7, .06, 3); return; }
  MED_PRUEBA=medFondoCrea(k, .9);
  medPruebaT=setTimeout(function(){ medFondoQuita(MED_PRUEBA, 1.5); MED_PRUEBA=null; }, 4000);
}
var _medEmpiezaFD=medEmpieza;
medEmpieza=function(){ medFondoQuita(MED_PRUEBA, .3); MED_PRUEBA=null; var r=_medEmpiezaFD.apply(this, arguments); medFondoEmpieza(); return r; };
var _medOlasParaFD=medOlasPara;
medOlasPara=function(){ medFondoPara(1.8); return _medOlasParaFD.apply(this, arguments); };
var _medPausaFD=medPausa;
medPausa=function(){ var pausando=!!(medA && !medA.pausadoEn), r=_medPausaFD.apply(this, arguments); medFondoNivel(pausando ? .3 : 1); return r; };
/* el botón del fondo, arriba en la sesión */
var _medPintaCapaFD=medPintaCapa;
medPintaCapa=function(){
  var r=_medPintaCapaFD.apply(this, arguments);
  var ar=document.querySelector("#med-capa .med-arriba");
  if(medA && ar && !ar.querySelector(".med-fondo-bt")){
    var s=ar.querySelector('[data-act="x-med-son"]');
    if(s) s.insertAdjacentHTML("beforebegin", '<button class="med-fondo-bt" data-act="x-med-fondo" aria-label="Sonido de fondo">'+esc(medFondoNombre(medFondoTipo()))+'</button>');
  }
  return r;
};
/* en la tarjeta: la fila para elegir el fondo */
var _medPintaTarjetaFD=medPintaTarjeta;
medPintaTarjeta=function(){
  var r=_medPintaTarjetaFD.apply(this, arguments);
  var c=document.getElementById("med-card"), go=c && c.querySelector(".med-go");
  if(go && !c.querySelector(".med-fondos")){
    var k=medFondoTipo();
    go.insertAdjacentHTML("beforebegin", '<p class="eyebrow mt-4 mb-2">Sonido de fondo</p><div class="med-fondos">'+
      MED_FONDOS.map(function(f){ return '<button class="'+(f[0]===k?"on":"")+'" data-act="x-med-fondo-elige" data-k="'+f[0]+'">'+esc(f[1])+'</button>'; }).join("")+'</div>');
  }
  return r;
};
function fondoAccion(a, el){
  if(a==="x-med-fondo-elige"){
    medPref().fondo=el.dataset.k; save();
    $$("#med-card .med-fondos button").forEach(function(b){ b.classList.toggle("on", b===el); });
    medFondoPrueba(el.dataset.k); return true;
  }
  if(a==="x-med-fondo" && medA){
    var i=0; for(var j=0;j<MED_FONDOS.length;j++) if(MED_FONDOS[j][0]===medFondoTipo()) i=j;
    var k=MED_FONDOS[(i+1)%MED_FONDOS.length][0]; medPref().fondo=k; save();
    el.textContent=medFondoNombre(k);
    /* las olas suaves siguen la respiración: esas sí necesitan saber la fase */
    if(medSuena()){ if(k!=="olas" && MED_OLAS) _medOlasParaCF(); medFondoEmpieza(); if(k==="olas") medA.fase=""; }
    return true;
  }
  if(a==="x-med-son" && medA){
    medA.son=!medA.son; el.classList.toggle("on", medA.son);
    if(!medA.son) medOlasPara(); else { medFondoEmpieza(); medA.fase=""; }
    return true;
  }
  return false;
}
var _fdGA=grupoAccion;
grupoAccion=function(a, el){ if(fondoAccion(a, el)) return true; return _fdGA.apply(this, arguments); };

