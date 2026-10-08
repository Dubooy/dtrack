/* ════════════════════════════════════════════════════════════════
   LA MONTAÑA EN 3D (oct 2026)
   En «Ver tu montaña», arriba en el centro, se elige 2D o 3D. La de 3D
   es una sola montaña de roca, de caras planas, con aristas y nieve
   arriba. El camino de luz sube en espiral desde la base hasta la cima
   (40), con Peak. encima, y en el nivel de cada rango (5, 10, 15…) sale
   su nombre. Se gira con el dedo (de lado gira, de arriba abajo cambia la
   altura de la vista) y sigue un poco con la inercia. Al abrirla, el
   camino se enciende desde la base hasta donde vas tú y la montaña gira
   hasta dejarte de frente. Lo que queda detrás de la montaña (el camino,
   la gente, los nombres) se esconde. Se dibuja en un canvas 2D, sin
   librerías. La elección se recuerda en este móvil (localStorage
   «peak-monte-vista»).
   ════════════════════════════════════════════════════════════════ */
var M3_KEY="peak-monte-vista", M3_ALTO=1.95, M3_R=1.25;
function m3Pref(){ try{ return localStorage.getItem(M3_KEY)==="3d" ? "3d" : "2d"; }catch(e){ return "2d"; } }
var M3_VUELO="peak-monte-vuelo";
function m3VueloVisto(){ try{ return localStorage.getItem(M3_VUELO)==="1"; }catch(e){ return true; } }
function m3VueloMarca(){ try{ localStorage.setItem(M3_VUELO, "1"); }catch(e){} }
/* dentro de la vista 3D «S» es la escala del dibujo y tapa el estado de la app: esto lo alcanza */
function m3Estado(){ return S; }
var M3_RANGO="peak-monte-rango";   /* el último rango con el que viste la montaña: si subes de rango, el vuelo sale otra vez */
function m3RangoVisto(){ try{ var v=localStorage.getItem(M3_RANGO); return v===null ? null : +v; }catch(e){ return null; } }
function m3RangoMarca(i){ try{ localStorage.setItem(M3_RANGO, String(i)); }catch(e){} }
function m3PonPref(v){ try{ localStorage.setItem(M3_KEY, v); }catch(e){} }
function m3Azar(i){ var x=Math.sin(i*127.1+311.7)*43758.5453; return x-Math.floor(x); }

/* ── un solo pico, como el Cervino: una pirámide de cuatro caras con aristas afiladas, la punta
   un poco ladeada y una base ancha. La altura del terreno (0 a ~1) en un punto del suelo ── */
var M3_NIV=[5,10,15,20,25,30,40];
function m3Alt(x, z){
  var r=Math.sqrt(x*x+z*z); if(r>=M3_R) return 0;
  /* la punta no está justo en el centro: se ladea un poco hacia un lado, como el Cervino */
  var cx=0, cz=0, px=x-cx*(1-r/M3_R), pz=z-cz*(1-r/M3_R);
  var g=.42+.05*Math.sin(r*3), cg=Math.cos(g), sg=Math.sin(g), u=px*cg+pz*sg, w=-px*sg+pz*cg;
  /* cuatro caras planas (rombo) con las aristas en las esquinas, algo redondeadas abajo */
  var l1=(Math.abs(u)+Math.abs(w))*.78, l2=Math.sqrt(u*u+w*w), mezcla=Math.pow(Math.min(1, r/M3_R*1.1), 2);
  var d=Math.min(1, (l1*(1-mezcla*.6)+l2*mezcla*.6)/M3_R);
  var pico=Math.pow(Math.max(0, 1-d), 1.18);
  /* la base: un zócalo ancho y bajo, como el glaciar del que sale */
  var zocalo=.12*Math.pow(Math.max(0, 1-r/M3_R), .9);
  var a=Math.atan2(z, x);
  var n=(Math.sin(a*9+r*13)*.5+Math.sin(a*15-r*21)*.3+Math.sin(x*14+z*9)*.2)*.018*Math.min(1, r*4)*(1-r/M3_R);
  /* bandas de roca en las caras */
  var bandas=Math.sin((pico)*38)*.006*Math.min(1, r*5);
  return Math.max(0, Math.max(pico, zocalo+pico*.9)+n+bandas);
}
/* el camino: sube en espiral de la base (L 0) a la cima (L 40) */
var M3_GIROS=2.15, M3_A0=-2.4;
function m3Camino(L){
  L=Math.max(0, Math.min(40, L));
  var u=L/40, a=M3_A0-u*M3_GIROS*Math.PI*2, d=1.08*Math.pow(1-u, .85);
  var x=d*Math.cos(a), z=d*Math.sin(a), h=m3Alt(x, z);
  return [x, h*M3_ALTO+.014, z, a, h];
}
function m3Malla(){
  var NR=24, NA=52, V=[[0, m3Alt(0,0)*M3_ALTO, 0, m3Alt(0,0)]], T=[], i, j;
  for(i=1;i<=NR;i++){
    for(j=0;j<NA;j++){
      var k=i*NA+j, borde=i===NR;
      var a=(j+(i%2)*.5+(borde ? 0 : (m3Azar(k)-.5)*.45))/NA*Math.PI*2;
      var r=M3_R*Math.pow((i+(borde ? 0 : (m3Azar(k+9)-.5)*.4))/NR, 1.05);
      var x=r*Math.cos(a), z=r*Math.sin(a), h=m3Alt(x, z);
      V.push([x, h*M3_ALTO, z, h]);
    }
  }
  function id(i, j){ return i===0 ? 0 : 1+(i-1)*NA+((j%NA)+NA)%NA; }
  function tri(a, b, c){
    var A=V[a], B=V[b], C=V[c];
    var ux=B[0]-A[0], uy=B[1]-A[1], uz=B[2]-A[2], vx=C[0]-A[0], vy=C[1]-A[1], vz=C[2]-A[2];
    var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
    if(ny<0){ nx=-nx; ny=-ny; nz=-nz; }
    var l=Math.hypot(nx, ny, nz)||1;
    T.push({ a:a, b:b, c:c, nx:nx/l, ny:ny/l, nz:nz/l, x:(A[0]+B[0]+C[0])/3, y:(A[1]+B[1]+C[1])/3, z:(A[2]+B[2]+C[2])/3,
             h:(A[3]+B[3]+C[3])/3, rr:Math.hypot((A[0]+B[0]+C[0])/3, (A[2]+B[2]+C[2])/3)/M3_R, q:m3Azar(a*7+b*3+c)-.5, g:0, tk:99 });
  }
  for(j=0;j<NA;j++) tri(0, id(1, j), id(1, j+1));
  for(i=1;i<NR;i++) for(j=0;j<NA;j++){ tri(id(i, j), id(i, j+1), id(i+1, j)); tri(id(i, j+1), id(i+1, j+1), id(i+1, j)); }
  /* la luz del camino en la roca de al lado: el punto del camino más cercano a cada cara */
  var P=[]; for(var s=0;s<=320;s++){ var c=m3Camino(s/8); P.push([c[0], c[1], c[2], s/8]); }
  T.forEach(function(t){
    var mejor=9, L=99;
    for(var s=0;s<P.length;s++){ var dx=t.x-P[s][0], dy=(t.y-P[s][1])*.7, dz=t.z-P[s][2], d=dx*dx+dy*dy+dz*dz; if(d<mejor){ mejor=d; L=P[s][3]; } }
    t.g=Math.exp(-mejor/(.075*.075)); t.tk=L;
  });
  return { V:V, T:T };
}
var M3_MALLA=null;

/* ── lo que va encima del canvas ── */
function m3HTML(){
  var v=m3Pref();
  return '<div class="mt-vista" role="tablist" aria-label="'+tr("Vista")+'"><i></i>'+
      '<button role="tab" data-act="x-monte-vista" data-v="2d" class="'+(v==="2d"?"on":"")+'">2D</button>'+
      '<button role="tab" data-act="x-monte-vista" data-v="3d" class="'+(v==="3d"?"on":"")+'">3D</button></div>'+
    '<div class="m3"><canvas class="m3-cv" aria-label="'+tr("Tu montaña en 3D")+'"></canvas><div class="m3-capa"></div></div>';
}
function m3Vista(v){
  if(!MT) return;
  var capa=MT.capa; m3PonPref(v);
  capa.classList.toggle("en3d", v==="3d");
  capa.querySelectorAll(".mt-vista button").forEach(function(b){ b.classList.toggle("on", b.dataset.v===v); b.setAttribute("aria-selected", b.dataset.v===v ? "true" : "false"); });
  if(v==="3d"){ if(!MT.m3) MT.m3=m3Arranca(capa); else MT.m3.sigue(); }
  else if(MT.m3) MT.m3.pausa();
}

function m3Arranca(capa){
  if(!M3_MALLA) M3_MALLA=m3Malla();
  var V=M3_MALLA.V, T=M3_MALLA.T, NV=V.length;
  var caja=capa.querySelector(".m3"), cv=caja.querySelector(".m3-cv"), ctx=cv.getContext("2d"), capaHTML=caja.querySelector(".m3-capa");
  var Lz_=mtLuz(), LR=Lz_.rgb.split(",").map(Number), yo=mtYo(), quieto=medQuieto();
  var tu=Math.min(40, yo.lvl+yo.pct);
  var W=0, H=0, dpr=1, S=100, CX=0, CY=0, D=6.5, YC=.95, CAMX=0, CAMY=0, CAMZ=0;
  var PX=new Float32Array(NV), PY=new Float32Array(NV), PZ=new Float32Array(NV);

  /* el camino, muestreado una vez (12 puntos por nivel) */
  var NS=480, CAM=[];
  for(var k=0;k<=NS;k++) CAM.push(m3Camino(k/NS*40));
  /* la normal del terreno en cada punto del camino: el camino se ve si su ladera mira a la cámara.
     Así se esconde por el borde de la montaña de forma continua, igual que la roca, sin parpadeos */
  var CNX=new Float32Array(NS+1), CNY=new Float32Array(NS+1), CNZ=new Float32Array(NS+1);
  for(k=0;k<=NS;k++){ var cc=CAM[k], ep=.02;
    var gx=(m3Alt(cc[0]+ep, cc[2])-m3Alt(cc[0]-ep, cc[2]))/(2*ep)*M3_ALTO, gz=(m3Alt(cc[0], cc[2]+ep)-m3Alt(cc[0], cc[2]-ep))/(2*ep)*M3_ALTO;
    var nl=Math.hypot(gx, 1, gz); CNX[k]=-gx/nl; CNY[k]=1/nl; CNZ[k]=-gz/nl; }
  var CPX=new Float32Array(NS+1), CPY=new Float32Array(NS+1), CPF=new Float32Array(NS+1), CVI=new Float32Array(NS+1), CVS=new Float32Array(NS+1).fill(-1), CVT=new Float32Array(NS+1);
  var CIMA=m3Camino(40);

  /* estrellas */
  var EST=[]; for(var e=0;e<90;e++) EST.push([m3Azar(e*3.1), m3Azar(e*5.7+1), e%7===0 ? 1.4 : e%3===0 ? 1 : .6, m3Azar(e+40)*6.28]);

  /* encima: Peak., tú, la gente, la pista y la tarjeta de abajo */
  var gente=mtGente(), porNv={};
  function htmlPersona(g){
    return '<span class="mt-av">'+mtCara(g, 26)+'</span><span class="m3-p-t"><b>'+esc(String(g.u).slice(0,12))+'</b><small>'+tr("Nivel")+' '+(g.nv||1)+'</small></span>';
  }
  var st=stats(), falta=Math.max(0, Math.round(st.lvlNeed-(st.xp-st.lvlFloor)));
  /* las huellas de la semana: lo que has subido en los últimos 7 días (XP de cada día con lo guardado) */
  var semXP=0, tmS=tasksByDay(); for(var dd=0;dd<7;dd++) semXP+=dayXP(addDays(today(), -dd), tmS);
  function nivelDeXP(x){ var L=1; while(L<40 && pmXPSuelo(L+1)<=x) L++; if(L>=40) return 40; var a0=pmXPSuelo(L), a1=pmXPSuelo(L+1); return L+(x-a0)/Math.max(1, a1-a0); }
  var tuSem=semXP>0 ? Math.max(0, Math.min(tu, nivelDeXP(Math.max(0, st.xp-semXP)))) : tu;
  /* el clima depende de la racha; el cielo, de la hora del móvil */
  var racha=st.streak||0, horaM=new Date().getHours();
  /* solo dos cielos: atardecer mientras hay luz (7 a 21 h) y noche el resto */
  var CIELO=horaM>=7 && horaM<21 ? "atardecer" : "noche";
  var ESTK={ noche:1, atardecer:.3 }[CIELO];
  capaHTML.innerHTML=
    '<div class="m3-marca"><svg viewBox="'+PEAK_WM_VB+'" aria-label="Peak."><path d="'+PEAK_WM_D+'"/></svg></div>'+
    '<div class="m3-gente"></div>'+
    '<div class="m3-yo"><span class="mt-av">'+mtCara(yo, 40)+'</span><span class="m3-yo-t"><b>'+tr("Tú")+'</b> · '+esc(tr(rangoNombre(yo.lvl)))+'</span></div>'+
    '<div class="m3-pista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M4 12h16"/></svg>'+tr("Desliza para girar")+'</div>'+
    '<div class="m3-info"><div class="m3-i-fila"><span class="m3-i-n num">'+yo.lvl+'<small>/40</small></span>'+
      '<span class="m3-i-t"><b>'+esc(tr(rangoNombre(yo.lvl)))+'</b><small>'+(yo.lvl>=40 ? tr("Has llegado a la cima") : tr("Te faltan")+' <span class="num">'+falta+'</span> XP '+tr("para el nivel")+' '+(yo.lvl+1))+'</small></span>'+
      '<span class="m3-i-g"></span></div>'+
      '<div class="m3-barra"><i style="width:'+Math.round((yo.lvl>=40 ? 1 : yo.pct)*100)+'%"></i></div>'+
      (racha<1 ? '<p class="m3-niebla">'+tr("Sin racha hay niebla: haz algo hoy y se despeja")+'</p>' : '')+'</div>';
  var elMarca=capaHTML.querySelector(".m3-marca"), elYo=capaHTML.querySelector(".m3-yo"), elGente=capaHTML.querySelector(".m3-gente"), elPista=capaHTML.querySelector(".m3-pista");
  var CHIPS=[];
  function pintaGente(){
    gente=mtGente(); porNv={}; CHIPS=[]; elGente.innerHTML="";
    gente.forEach(function(g){
      var n=Math.max(1, Math.min(40, g.nv||1)), i=(porNv[n]=(porNv[n]||0)+1)-1;
      var d=document.createElement("div"); d.className="m3-p"; d.innerHTML=htmlPersona(g); elGente.appendChild(d);
      CHIPS.push({ el:d, p:m3Camino(Math.min(40, n+i*.7)), v:-1, ve:0 });
    });
    var gi=capaHTML.querySelector(".m3-i-g");
    if(gi) gi.innerHTML=gente.length ? '<span class="m3-caras">'+gente.slice(0,3).map(function(g){ return '<span class="mt-av">'+mtCara(g, 22)+'</span>'; }).join("")+'</span><small class="num">'+gente.length+'</small>' : '';
  }
  pintaGente();
  var ficha=document.createElement("div"); ficha.className="m3-ficha"; caja.appendChild(ficha);
  var foco=null, enFicha=false;
  function camHacia(dest, ms){ foco={ de:{ yaw:yaw, YC:YC, ZM:ZM, pitch:pitch }, a:dest, t0:performance.now(), ms:ms||900, vuelta:!!dest.vuelta }; vel=0; intro=false; }
  function yawA(a){ var y=Math.PI/2-a, d=Math.atan2(Math.sin(y-yaw), Math.cos(y-yaw)); return yaw+d; }
  function cierraFicha(){
    if(!enFicha) return; enFicha=false; ficha.classList.remove("on");
    camHacia({ yaw:yaw, YC:.95, ZM:1, pitch:.42, vuelta:true }, 750);
  }
  function abreFicha(html){
    ficha.innerHTML='<button class="m3-f-x" aria-label="'+tr("Cerrar")+'">×</button>'+html; ficha.classList.add("on"); enFicha=true;
    ficha.querySelector(".m3-f-x").onclick=function(ev){ ev.stopPropagation(); cierraFicha(); };
    elPista.classList.add("fuera");
  }
  function enfocaAmigo(i){
    var g=gente[i], ch=CHIPS[i]; if(!g || !ch) return;
    var p=ch.p, nv=Math.max(1, Math.min(40, g.nv||1)), rg=rangoDe(nv), txt;
    if(nv>yo.lvl) txt=tr("Te faltan")+' <b class="num">'+Math.max(1, Math.round(pmXPSuelo(nv)-st.xp))+'</b> XP '+tr("para alcanzarle");
    else if(nv===yo.lvl) txt=tr("Vais igualados: el primero que suba de nivel, delante");
    else txt=tr("Le sacas")+' <b class="num">'+(yo.lvl-nv)+'</b> '+(yo.lvl-nv===1 ? tr("nivel") : tr("niveles"));
    abreFicha('<div class="m3-f-cab"><span class="mt-av">'+mtCara(g, 44)+'</span><span><b>'+esc(String(g.u))+'</b><small>'+tr("Nivel")+' '+nv+' · <i style="color:'+rg.c+'">'+esc(tr(rg.n))+'</i></small></span></div>'+
      '<p class="m3-f-t">'+txt+'</p><button class="m3-f-b">'+tr("Ver perfil")+'</button>');
    ficha.querySelector(".m3-f-b").onclick=function(ev){
      ev.stopPropagation(); if(typeof abrirPerfil!=="function") return;
      abrirPerfil(g.u); var pc=document.getElementById("perfil-capa"); if(pc) pc.style.zIndex=200;
    };
    camHacia({ yaw:yawA(p[3]), YC:p[1]+.05, ZM:1.75, pitch:.3 }, 950);
    if(typeof sonido==="function") sonido("tick");
  }
  function abreRango(k){
    var rg=RANGOS[k], pasado=yo.lvl>=rg.hasta, dentroR=!pasado && yo.lvl>=rg.desde, lista=desbloqueosEntre(rg.desde-1, rg.hasta);
    abreFicha('<div class="m3-f-cab"><span class="m3-f-band" style="background:'+rg.c+'"></span><span><b>'+esc(tr(rg.n))+'</b><small>'+tr("Niveles")+' '+rg.desde+' '+tr("a")+' '+rg.hasta+'</small></span></div>'+
      '<p class="m3-f-t">'+(pasado ? tr("Ya has completado este rango") : (dentroR ? tr("Estás aquí: te faltan") : tr("Te faltan"))+' <b class="num">'+Math.max(1, rg.hasta-yo.lvl)+'</b> '+(rg.hasta-yo.lvl===1 ? tr("nivel") : tr("niveles"))+' '+tr("para completarlo"))+'</p>'+
      (lista.length ? '<ul class="m3-f-l">'+lista.map(function(u){ return '<li><span class="num">'+u.nv+'</span>'+esc(tr(u.t))+'</li>'; }).join("")+'</ul>' : ''));
    if(typeof sonido==="function") sonido("tick");
  }
  var gTimer=setTimeout(pintaGente, 1800);   /* por si llega la gente del servidor */

  /* ── cámara: empieza mirándote de frente ── */
  var miAng=m3Camino(tu)[3];
  var yawFin=Math.PI/2-miAng, yaw=quieto ? yawFin : yawFin-2.4, pitch=.42, vel=0, tocando=null, ultimo=0, t0=0, luz=quieto ? tu : 0, intro=!quieto, raf=0, vivo=true, parado=false, prev=0;

  /* ── el vuelo: la primera vez (o tras reiniciarlo en Ajustes) subes la montaña en espiral, como un pájaro;
     arriba del todo sale el logo delante, limpio, y luego la cámara se aleja a la vista de siempre ── */
  var miRango=RANGOS.indexOf(rangoDe(yo.lvl)), rgVisto=m3RangoVisto(), nuevoRango=rgVisto!==null && miRango>rgVisto;
  m3RangoMarca(miRango);
  var vuelo=!quieto && (!m3VueloVisto() || nuevoRango), cimaSono=false, vT0=0, ZM=1, S0=100;
  var V_SUBE=6.2, V_LOGO=5.6, V_FIN=8.6;
  /* empieza mirando el banderín de inicio y da más de una vuelta hasta acabar frente a ti */
  var yawIni=Math.PI/2-M3_A0, dVuelo=((yawFin-yawIni)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)+2*Math.PI;
  var yIni=m3Camino(0)[1]+.1, yArriba=CIMA[1]+.62;   /* arriba, la cámara queda por encima de la cima: el logo tiene aire */
  var elVuelo=null;
  if(vuelo){
    m3VueloMarca(); intro=false; luz=0;
    caja.classList.add("volando");
    elVuelo=document.createElement("div"); elVuelo.className="m3-vuelo";
    var rgN=RANGOS[miRango]||rangoDe(yo.lvl);
    elVuelo.innerHTML='<div class="m3-vuelo-c"><svg viewBox="'+PEAK_WM_VB+'" aria-label="Peak."><path d="'+PEAK_WM_D+'"/></svg>'+
      (nuevoRango ? '<p class="m3-vuelo-r"><small>'+tr("Nuevo rango")+'</small><b style="color:'+rgN.c+'">'+esc(tr(rgN.n))+'</b></p>' : '')+'</div>';
    caja.appendChild(elVuelo);
  }
  function vueloAcaba(){ vuelo=false; caja.classList.remove("volando"); if(elVuelo){ elVuelo.remove(); elVuelo=null; } D=6.5; YC=.95; pitch=.42; ZM=1; yaw=yawFin; ultimo=performance.now(); }
  function mide(){
    W=caja.clientWidth||window.innerWidth; H=caja.clientHeight||window.innerHeight;
    dpr=Math.min(2, window.devicePixelRatio||1);
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); cv.style.width=W+"px"; cv.style.height=H+"px";
    var arriba=150, abajo=H-150;
    S=Math.max(80, Math.min(W*.44, (abajo-arriba)/2.45));
    CX=W/2; CY=(arriba+abajo)/2+.08*S; S0=S;
  }
  mide();
  window.addEventListener("resize", mide);

  var cY=1, sY=0, cP=1, sP=0;
  function pr(x, y, z, o){
    var x1=x*cY-z*sY, z1=x*sY+z*cY, yy=y-YC, y2=yy*cP-z1*sP, z2=yy*sP+z1*cP, f=D/(D-z2);
    o[0]=CX+x1*S*f; o[1]=CY-y2*S*f; o[2]=z2; o[3]=f; return o;
  }
  /* ¿lo tapa la montaña? un rayo del punto a la cámara, mirando si pasa por debajo del terreno */
  var MAXY=1.08*M3_ALTO;
  function seVe(x, y, z){
    var dx=CAMX-x, dy=CAMY-y, dz=CAMZ-z;
    var uMax=dy>0 ? Math.min(1, (MAXY-y)/dy) : 1, l=Math.sqrt(dx*dx+dz*dz)*uMax; if(l<1e-4) return 1;
    var pasos=Math.max(6, Math.min(26, Math.ceil(l/.045))), u0=.035/Math.max(.05, Math.sqrt(dx*dx+dy*dy+dz*dz));
    for(var s=1;s<=pasos;s++){
      var u=u0+(uMax-u0)*s/pasos, px=x+dx*u, py=y+dy*u, pz=z+dz*u;
      if(m3Alt(px, pz)*M3_ALTO>py+.008) return 0;
    }
    return 1;
  }

  /* ── el dedo ── */
  var dedos={};
  caja.addEventListener("pointerdown", function(ev){
    if(ev.target && ev.target.closest && ev.target.closest(".m3-ficha")) return;
    dedos[ev.pointerId]=1;
    if(enFicha){ cierraFicha(); return; }   /* tocar fuera de la ficha vuelve a la vista de siempre */
    if(vuelo){ var ya=(performance.now()-vT0)/1000; if(ya<V_SUBE) vT0=performance.now()-V_SUBE*1000; return; }   /* tocar salta al final */
    if(tocando){ tocando.varios=true; return; }   /* segundo dedo: no cuenta, así no se dispara el giro */
    tocando={ id:ev.pointerId, x0:ev.clientX, y0:ev.clientY, t0:performance.now(), x:ev.clientX, y:ev.clientY, yaw:yaw, pitch:pitch, t:performance.now(), lx:ev.clientX }; vel=0; intro=false;
    try{ caja.setPointerCapture(ev.pointerId); }catch(e){}
    elPista.classList.add("fuera");
  });
  caja.addEventListener("pointermove", function(ev){
    if(!tocando || ev.pointerId!==tocando.id) return;
    if(tocando.varios){ tocando.t=performance.now(); tocando.lx=ev.clientX; vel=0; return; }
    var ahora=performance.now(), dt=Math.max(1, ahora-tocando.t);
    yaw=tocando.yaw-(ev.clientX-tocando.x)*.0095;
    pitch=Math.max(.16, Math.min(.72, tocando.pitch+(ev.clientY-tocando.y)*.0035));
    vel=vel*.6+(-(ev.clientX-tocando.lx)*.0095/dt*1000)*.4;
    tocando.lx=ev.clientX; tocando.t=ahora;
  });
  function suelta(ev){
    delete dedos[ev.pointerId];
    if(!tocando || ev.pointerId!==tocando.id) return;
    if(tocando.varios || performance.now()-tocando.t>90) vel=0;
    var toque=ev.type==="pointerup" && !tocando.varios && Math.hypot(ev.clientX-tocando.x0, ev.clientY-tocando.y0)<10 && performance.now()-tocando.t0<450;
    tocando=null; ultimo=performance.now();
    if(toque) tocaPerfil(ev.clientX, ev.clientY);
  }
  caja.addEventListener("pointerup", suelta); caja.addEventListener("pointercancel", suelta);
  /* tocar tu foto o la de alguien abre su perfil */
  /* ── pájaros de luz: de vez en cuando cruza uno el cielo dejando estela; a veces, una estrella fugaz.
     Si los tocas se abren en un anillo de luz y te dan XP (con tope al día) ── */
  var PAJ=[], CHISP=[], pajProx=performance.now()+4000;
  var PAJ_XP=5, PAJ_XP_ORO=20, PAJ_DIA=5, ORO="245,197,66";
  function pajHoy(){ var E=m3Estado(), d=today(); if(!E.pajaros || E.pajaros.d!==d) E.pajaros={ d:d, n:0 }; return E.pajaros; }
  function pajNuevo(){
    if(Math.random()<.15){   /* estrella fugaz: cruza en diagonal por arriba */
      var dr=Math.random()<.5 ? 1 : -1;
      PAJ.push({ oro:true, x:dr>0 ? -40 : W+40, y:H*(.06+Math.random()*.14), vx:dr*(150+Math.random()*40), vy:40+Math.random()*25, fase:0, cola:[] });
    } else {
      var izq=Math.random()<.5;
      PAJ.push({ oro:false, x:izq ? -30 : W+30, y:H*(.12+Math.random()*.28), vx:(izq ? 1 : -1)*(48+Math.random()*30), vy:0, fase:Math.random()*6, cola:[] });
    }
  }
  function pajPinta(dt, ahora, tt){
    if(!vuelo && ahora>pajProx && PAJ.length<2){ pajNuevo(); pajProx=ahora+9000+Math.random()*12000; }
    ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.lineCap="round"; ctx.lineJoin="round";
    for(var i=PAJ.length-1;i>=0;i--){
      var b=PAJ[i];
      b.x+=b.vx*dt; b.y+=(b.oro ? b.vy : Math.sin(tt*1.4+b.fase)*14)*dt;
      b.cola.unshift([b.x, b.y]); if(b.cola.length>(b.oro ? 26 : 16)) b.cola.pop();
      if(b.x<-80 || b.x>W+80 || b.y>H*.6){ PAJ.splice(i, 1); continue; }
      var rgb=b.oro ? ORO : Lz_.rgb, j, c0, c1;
      /* la estela: se adelgaza y se apaga */
      for(j=1;j<b.cola.length;j++){
        c0=b.cola[j-1]; c1=b.cola[j]; var k=1-j/b.cola.length;
        ctx.strokeStyle="rgba("+rgb+","+(k*(b.oro ? .75 : .4)).toFixed(3)+")"; ctx.lineWidth=(b.oro ? 3.4 : 2.2)*k+.3;
        ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.stroke();
      }
      /* el halo */
      var hr=b.oro ? 22 : 16, gh=ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, hr);
      gh.addColorStop(0, "rgba("+rgb+",.55)"); gh.addColorStop(1, "rgba("+rgb+",0)");
      ctx.fillStyle=gh; ctx.beginPath(); ctx.arc(b.x, b.y, hr, 0, 6.283); ctx.fill();
      if(b.oro){
        /* la cabeza de la estrella: un punto blanco con cuatro destellos que laten */
        var lt=4+2*Math.sin(tt*14);
        ctx.strokeStyle="rgba(255,250,230,.85)"; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.moveTo(b.x-lt*2.2, b.y); ctx.lineTo(b.x+lt*2.2, b.y); ctx.moveTo(b.x, b.y-lt*2.2); ctx.lineTo(b.x, b.y+lt*2.2); ctx.stroke();
        ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(b.x, b.y, 2.6, 0, 6.283); ctx.fill();
      } else {
        /* el pájaro: dos alas en media luna que baten suave, de luz */
        var al=Math.sin(tt*7.5+b.fase), dir=b.vx>0 ? 1 : -1, r=9;
        ctx.save(); ctx.translate(b.x, b.y); ctx.scale(dir, 1);
        ctx.fillStyle="rgba("+rgb+",.9)";
        for(var s2=-1;s2<=1;s2+=2){
          var py=-al*r*.9, mx=s2*r*.55;
          ctx.beginPath(); ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(mx, py*.6-r*.35, s2*r*1.35, py);
          ctx.quadraticCurveTo(mx, py*.6-r*.05, 0, r*.18);
          ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle="#fff"; ctx.beginPath(); ctx.ellipse(r*.12, .5, 2.6, 1.6, 0, 0, 6.283); ctx.fill();
        ctx.restore();
      }
    }
    /* lo que queda al tocarlos: anillos, chispas y la XP */
    for(i=CHISP.length-1;i>=0;i--){
      var c=CHISP[i]; c.v+=dt;
      if(c.v>c.vida){ CHISP.splice(i, 1); continue; }
      if(c.v<0) continue;   /* aún no ha empezado: con q negativo el radio salía negativo y arc() rompía todo el dibujo */
      var q=c.v/c.vida, e=1-Math.pow(1-q, 3);
      if(c.anillo){
        ctx.strokeStyle="rgba("+c.rgb+","+(.9*(1-q)).toFixed(3)+")"; ctx.lineWidth=2.5*(1-q)+.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, 6+c.r*e, 0, 6.283); ctx.stroke();
      } else if(c.txt){
        ctx.globalCompositeOperation="source-over";
        ctx.globalAlpha=q<.15 ? q/.15 : 1-Math.max(0, (q-.55)/.45);
        ctx.font='700 '+(c.big ? 17 : 15)+'px Unbounded, "Plus Jakarta Sans", system-ui, sans-serif'; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.shadowColor="rgba("+c.rgb+",.9)"; ctx.shadowBlur=12; ctx.fillStyle="#fff";
        ctx.fillText(c.txt, c.x, c.y-e*46); ctx.shadowBlur=0; ctx.globalAlpha=1;
        ctx.globalCompositeOperation="lighter";
      } else {
        var px=c.x+c.dx*e, py2=c.y+c.dy*e, rr=c.t*(1-q*.7);
        var gp=ctx.createRadialGradient(px, py2, 0, px, py2, rr*3);
        gp.addColorStop(0, "rgba(255,255,255,"+(1-q).toFixed(3)+")"); gp.addColorStop(.35, "rgba("+c.rgb+","+(.8*(1-q)).toFixed(3)+")"); gp.addColorStop(1, "rgba("+c.rgb+",0)");
        ctx.fillStyle=gp; ctx.beginPath(); ctx.arc(px, py2, rr*3, 0, 6.283); ctx.fill();
      }
    }
    ctx.restore();
  }
  function pajToca(x, y){
    for(var i=PAJ.length-1;i>=0;i--){
      var b=PAJ[i]; if(Math.hypot(b.x-x, b.y-y)>(b.oro ? 42 : 34)) continue;
      PAJ.splice(i, 1);
      var rgb=b.oro ? ORO : Lz_.rgb, n=b.oro ? 16 : 11;
      CHISP.push({ anillo:true, x:b.x, y:b.y, r:b.oro ? 60 : 42, rgb:rgb, v:0, vida:.7 });
      CHISP.push({ anillo:true, x:b.x, y:b.y, r:b.oro ? 34 : 24, rgb:"255,255,255", v:-.08, vida:.6 });
      for(var j=0;j<n;j++){ var a=j/n*6.283+Math.random()*.3, d=(b.oro ? 46 : 32)+Math.random()*22;
        CHISP.push({ x:b.x, y:b.y, dx:Math.cos(a)*d, dy:Math.sin(a)*d, t:1.6+Math.random()*1.4, rgb:rgb, v:0, vida:.65+Math.random()*.3 }); }
      var h=pajHoy(), xp=0;
      if(h.n<PAJ_DIA){ h.n++; xp=b.oro ? PAJ_XP_ORO : PAJ_XP; h.xp=(h.xp||0)+xp; var E=m3Estado(); E.xpPajaros=(E.xpPajaros||0)+xp; try{ save(); }catch(er){} }
      CHISP.push({ x:b.x, y:b.y-10, txt:xp ? "+"+xp+" XP" : tr("Hoy ya no da más XP"), big:!!xp, rgb:rgb, v:0, vida:1.5 });
      if(typeof sonido==="function") sonido(b.oro ? "nivel" : "ok");
      return true;
    }
    return false;
  }
  function dentro(el, x, y){ if(!el || !el.offsetParent) return false; var r=el.getBoundingClientRect(); return x>=r.left-6 && x<=r.right+6 && y>=r.top-6 && y<=r.bottom+6; }
  function tocaPerfil(x, y){
    var rc=caja.getBoundingClientRect(); if(pajToca(x-rc.left, y-rc.top)) return;
    for(var i=CHIPS.length-1;i>=0;i--) if(dentro(CHIPS[i].el, x, y) && +getComputedStyle(CHIPS[i].el).opacity>.3){ enfocaAmigo(i); return; }
    for(i=0;i<BANS.length;i++){ var bn=BANS[i], bx=x-rc.left, by=y-rc.top; if(Math.hypot(bn.x-bx, bn.y-by)<24 || (Math.abs(bn.x-4-bx)<26 && by>bn.y && by<bn.y+50)){ abreRango(bn.k); return; } }
    if(typeof abrirPerfil!=="function") return;
    var u=null;
    if(dentro(elYo, x, y)) u=(GRUPO && GRUPO.yo) || "";
    if(u===null) return;
    abrirPerfil(u);
    var pc=document.getElementById("perfil-capa"); if(pc) pc.style.zIndex=200;   /* por encima de la montaña */
  }
  var pistaT=setTimeout(function(){ elPista.classList.add("fuera"); }, 6500);

  function suave(x){ x=Math.max(0, Math.min(1, x)); return x<.5 ? 4*x*x*x : 1-Math.pow(-2*x+2, 3)/2; }
  function rgb(r, g, b){ return "rgb("+(r>255?255:r|0)+","+(g>255?255:g|0)+","+(b>255?255:b|0)+")"; }
  var Lx=-.8, Ly=.46, Lz=.3, ll=Math.hypot(Lx, Ly, Lz); Lx/=ll; Ly/=ll; Lz/=ll;
  /* sombras de verdad: un mapa de alturas y, por cada cara, un rayo hacia la luz;
     si la montaña se cruza, esa cara queda a la sombra (con el borde suave) */
  var HG=128, HG1=HG+1, HM=new Float32Array(HG1*HG1);
  for(var hi=0;hi<=HG;hi++) for(var hj=0;hj<=HG;hj++) HM[hi*HG1+hj]=m3Alt(-M3_R+2*M3_R*hj/HG, -M3_R+2*M3_R*hi/HG)*M3_ALTO;
  function altM(x, z){
    var fx=(x+M3_R)/(2*M3_R)*HG, fz=(z+M3_R)/(2*M3_R)*HG; if(fx<0 || fz<0 || fx>=HG || fz>=HG) return 0;
    var j=fx|0, i=fz|0, a=fx-j, b=fz-i, k=i*HG1+j;
    return (HM[k]*(1-a)+HM[k+1]*a)*(1-b)+(HM[k+HG1]*(1-a)+HM[k+HG1+1]*a)*b;
  }
  var sombYaw=99, sombPitch=99, sombPrimera=true;
  function sombras(){
    if(Math.abs(yaw-sombYaw)<.012 && Math.abs(pitch-sombPitch)<.012) return;
    sombYaw=yaw; sombPitch=pitch;
    /* la luz va con la cámara: se pasa al mundo */
    var yy=Ly*cP+Lz*sP, z1=-Ly*sP+Lz*cP, wx=Lx*cY+z1*sY, wz=-Lx*sY+z1*cY, wy=yy, R2=M3_R*M3_R, techo=1.1*M3_ALTO;
    for(var i=0;i<T.length;i++){
      var t=T[i], k=1, d=.05, y0=t.y+.03;
      for(var st_=0;st_<32;st_++){
        var px=t.x+wx*d, py=y0+wy*d, pz=t.z+wz*d;
        if(py>techo || px*px+pz*pz>R2) break;
        var sob=py-altM(px, pz);
        if(sob<0){ k=0; break; }
        k=Math.min(k, 9*sob/d);
        d+=Math.max(.025, sob*.6);
      }
      t.sh=k<0 ? 0 : k>1 ? 1 : k;
      if(sombPrimera) t.shS=t.sh;
    }
    sombPrimera=false;
  }
  /* el color de la luz y del cielo que rellena las sombras, según la hora */
  var LUZC={ noche:[1,1,1.04], atardecer:[1.15,.86,.7] }[CIELO];
  var AMB={ noche:[0,0,0], atardecer:[20,12,26] }[CIELO];
  var CLARO=CIELO==="noche" ? 1 : 1.25;
  var Hx=Lx, Hy=Ly, Hz=Lz+1, hl=Math.hypot(Hx, Hy, Hz); Hx/=hl; Hy/=hl; Hz/=hl;   /* entre la luz y la vista: para el reflejo */
  var BANS=[];
  /* el cielo según la hora: degradado detrás de todo */
  var CIELOS={ atardecer:[[0,"rgba(30,22,60,.95)"],[.55,"rgba(120,52,78,.65)"],[1,"rgba(238,122,66,.6)"]] };
  function pintaCielo(tt){
    var cs=CIELOS[CIELO]; if(!cs) return;
    var hz=pr(0, 0, 0, [0,0,0,0])[1], gc=ctx.createLinearGradient(0, 0, 0, hz);
    cs.forEach(function(c){ gc.addColorStop(c[0], c[1]); });
    ctx.fillStyle=gc; ctx.fillRect(0, 0, W, hz);
    var gb=ctx.createLinearGradient(0, hz, 0, H); gb.addColorStop(0, cs[cs.length-1][1]);
    gb.addColorStop(.35, "rgba(0,0,0,0)");
    ctx.fillStyle=gb; ctx.fillRect(0, hz, W, H-hz);
    /* el sol del atardecer: bajo y naranja */
    var sx=W*.17, sy=hz-Math.min(90, hz*.22), sr=22, col="255,170,110";
    ctx.save(); ctx.globalCompositeOperation="lighter";
    var gs=ctx.createRadialGradient(sx, sy, 0, sx, sy, sr*9);
    gs.addColorStop(0, "rgba("+col+",.5)"); gs.addColorStop(.18, "rgba("+col+",.18)"); gs.addColorStop(1, "rgba("+col+",0)");
    ctx.fillStyle=gs; ctx.fillRect(sx-sr*9, sy-sr*9, sr*18, sr*18);
    /* rayos muy suaves que giran despacio */
    ctx.translate(sx, sy); ctx.rotate(tt*.03);
    for(var k=0;k<12;k++){ ctx.rotate(Math.PI/6);
      var gr=ctx.createLinearGradient(0, 0, sr*6, 0); gr.addColorStop(0, "rgba("+col+",.13)"); gr.addColorStop(1, "rgba("+col+",0)");
      ctx.fillStyle=gr; ctx.beginPath(); ctx.moveTo(sr*.8, -2.5); ctx.lineTo(sr*(k%2 ? 4.2 : 6), 0); ctx.lineTo(sr*.8, 2.5); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle="#ffd3a8"; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.283); ctx.fill();
  }
  /* nubes y niebla cuando no hay racha */
  var NUB=[]; for(var nb=0;nb<7;nb++) NUB.push({ a:m3Azar(nb*5.1)*6.283, r:.95+m3Azar(nb*2.3)*.55, y:.35+m3Azar(nb*7.7)*.55, s:.28+m3Azar(nb*3.9)*.2, v:.02+m3Azar(nb)*.03 });
  function pintaClima(tt){
    if(racha>=1) return;
    var pb=pr(0, 0, 0, [0,0,0,0]);
    ctx.save();
    /* niebla en la base */
    for(var k=0;k<3;k++){
      var rr=S*(1.05+k*.32), gm=ctx.createRadialGradient(pb[0], pb[1], rr*.25, pb[0], pb[1], rr);
      gm.addColorStop(0, "rgba(196,200,212,"+(.2-k*.04)+")"); gm.addColorStop(1, "rgba(196,200,212,0)");
      ctx.save(); ctx.translate(pb[0], pb[1]-S*.08*k); ctx.scale(1, Math.max(.22, sP)*.85); ctx.translate(-pb[0], -pb[1]);
      ctx.fillStyle=gm; ctx.beginPath(); ctx.arc(pb[0], pb[1], rr, 0, 6.283); ctx.fill(); ctx.restore();
    }
    /* nubes bajas que dan la vuelta despacio; las de detrás no se ven */
    NUB.forEach(function(nu){
      var a=nu.a+tt*nu.v; pr(Math.cos(a)*nu.r, nu.y, Math.sin(a)*nu.r, o); if(o[2]<-.15) return;
      var al=Math.min(1, (o[2]+.15)/.4)*.22, rad=S*nu.s*o[3];
      for(var j=0;j<3;j++){
        var cx=o[0]+(j-1)*rad*.6, cy=o[1]+(j===1 ? -rad*.18 : 0), gn=ctx.createRadialGradient(cx, cy, 0, cx, cy, rad*.75);
        gn.addColorStop(0, "rgba(214,218,228,"+al.toFixed(3)+")"); gn.addColorStop(1, "rgba(214,218,228,0)");
        ctx.fillStyle=gn; ctx.beginPath(); ctx.ellipse(cx, cy, rad*.75, rad*.45, 0, 0, 6.283); ctx.fill();
      }
    });
    ctx.restore();
  }
  var vis=[], o=[0,0,0,0];
  /* lo que ya ocupa sitio en pantalla (tú, los nombres de los rangos, las pastillas): así nada se tapa */
  var OCU=[], OCUA=[], YREC=null;
  function pisa(x0, y0, x1, y1, lista){ var m=0; for(var i=0;i<lista.length;i++){ var b=lista[i];
    var w=Math.min(x1, b[2])-Math.max(x0, b[0]), h=Math.min(y1, b[3])-Math.max(y0, b[1]); if(w>0 && h>0) m+=w*h; } return m; }

  function cuadro(ahora){
    if(!vivo || parado) return;
    var dt=prev ? Math.min(.05, (ahora-prev)/1000) : 0; prev=ahora;
    if(!t0) t0=ahora;
    var tt=(ahora-t0)/1000;
    /* la entrada: la montaña gira hasta dejarte de frente mientras se enciende el camino */
    if(vuelo){
      if(!vT0) vT0=ahora;
      /* curva seno: arranca y frena con suavidad, sin el acelerón de la cúbica */
      var vt=(ahora-vT0)/1000, p=.5-.5*Math.cos(Math.PI*Math.min(1, vt/V_SUBE));
      var dS=2.9, ySub=yIni+(yArriba-yIni)*p, pS=.14+.3*p, zS=1.8;
      if(vt<V_SUBE){ yaw=yawIni+dVuelo*p; YC=ySub; D=dS; pitch=pS; ZM=zS; luz=Math.min(tu, 40*p); }
      else { var q=suave((vt-V_SUBE)/(V_FIN-V_SUBE)); yaw=yawFin; YC=ySub+(.95-ySub)*q; D=dS+(6.5-dS)*q; pitch=pS+(.42-pS)*q; ZM=zS+(1-zS)*q; luz=tu; }
      S=S0*ZM;
      if(elVuelo){
        var a=vt<V_LOGO ? 0 : vt<V_LOGO+.7 ? (vt-V_LOGO)/.7 : vt<V_FIN-1.3 ? 1 : Math.max(0, (V_FIN-.4-vt)/.9);
        elVuelo.style.opacity=a.toFixed(3);
        elVuelo.style.setProperty("--k", (.94+.06*Math.min(1, (vt-V_LOGO)/1.6)).toFixed(3));
      }
      if(!cimaSono && vt>=V_SUBE-.25){   /* al llegar a la cima: un toque de sonido y una vibración corta */
        cimaSono=true;
        if(typeof sonido==="function") sonido("nivel");   /* yaw llega a yawFin; lo que sigue ya no gira */
        try{ if(typeof prefValor!=="function" || prefValor("sonido")) navigator.vibrate && navigator.vibrate([18, 60, 28]); }catch(e){}
      }
      if(vt>=V_FIN){ vueloAcaba(); S=S0; }
    }
    if(foco){
      var kf=suave((ahora-foco.t0)/foco.ms), de=foco.de, aa=foco.a;
      yaw=de.yaw+(aa.yaw-de.yaw)*kf; YC=de.YC+(aa.YC-de.YC)*kf; ZM=de.ZM+(aa.ZM-de.ZM)*kf; pitch=de.pitch+(aa.pitch-de.pitch)*kf; S=S0*ZM;
      if(kf>=1 && foco.vuelta){ foco=null; ZM=1; S=S0; YC=.95; ultimo=ahora; }
    }
    if(intro){ var u=suave((tt-.25)/2.4); yaw=yawFin-2.4*(1-u); if(u>=1) intro=false; }
    if(!vuelo && luz<tu) luz=quieto ? tu : Math.min(tu, tu*suave((tt-.35)/2.3));
    if(!tocando && !intro && !foco && !enFicha){
      if(Math.abs(vel)>.01){ yaw+=vel*dt; vel*=Math.exp(-dt*2.6); }
      else if(!quieto && ahora-ultimo>2600) yaw+=dt*.07;   /* gira sola, muy despacio */
    }
    cY=Math.cos(yaw); sY=Math.sin(yaw); cP=Math.cos(pitch); sP=Math.sin(pitch);
    /* dónde está la cámara, en el mundo */
    var z1c=D*cP; CAMX=z1c*sY; CAMY=YC+D*sP; CAMZ=z1c*cY;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    pintaCielo(tt);
    /* estrellas */
    ctx.fillStyle="#fff";
    if(ESTK>0) EST.forEach(function(s){ ctx.globalAlpha=ESTK*(.18+.32*(.5+.5*Math.sin(tt*1.3+s[3]))); ctx.beginPath(); ctx.arc(s[0]*W, s[1]*H*.72, s[2], 0, 6.283); ctx.fill(); });
    ctx.globalAlpha=1;

    var pt=pr(CIMA[0], CIMA[1], CIMA[2], [0,0,0,0]), pb=pr(0, 0, 0, [0,0,0,0]);
    /* halo detrás de la cima */
    var hal=ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], S*1.15);
    hal.addColorStop(0, "rgba("+Lz_.rgb+",.30)"); hal.addColorStop(.35, "rgba("+Lz_.rgb+",.10)"); hal.addColorStop(1, "rgba("+Lz_.rgb+",0)");
    ctx.fillStyle=hal; ctx.fillRect(0, 0, W, H);
    /* el suelo: una sombra y un anillo de luz alrededor de la base */
    var suelo=ctx.createRadialGradient(pb[0], pb[1], 0, pb[0], pb[1], S*1.6);
    suelo.addColorStop(0, "rgba(0,0,0,.7)"); suelo.addColorStop(.6, "rgba("+Lz_.rgb+",.07)"); suelo.addColorStop(1, "rgba("+Lz_.rgb+",0)");
    ctx.save(); ctx.translate(pb[0], pb[1]); ctx.scale(1, Math.max(.15, sP)); ctx.translate(-pb[0], -pb[1]);
    ctx.fillStyle=suelo; ctx.beginPath(); ctx.arc(pb[0], pb[1], S*1.6, 0, 6.283); ctx.fill(); ctx.restore();
    function anillo(delante){
      ctx.beginPath(); var em=false;
      for(var q=0;q<=96;q++){ var a=q/96*6.283, fr=Math.sin(a+yaw)>0;
        if(fr!==delante){ em=false; continue; }
        pr(Math.cos(a)*1.42, 0, Math.sin(a)*1.42, o); if(!em){ ctx.moveTo(o[0], o[1]); em=true; } else ctx.lineTo(o[0], o[1]); }
      ctx.strokeStyle="rgba("+Lz_.rgb+","+(delante ? .3 : .13)+")"; ctx.lineWidth=1.2; ctx.stroke();
    }
    anillo(false);

    sombras();
    /* la roca: caras de cara a la cámara, de la más lejana a la más cercana */
    for(var i=0;i<NV;i++){ var v=V[i]; pr(v[0], v[1], v[2], o); PX[i]=o[0]; PY[i]=o[1]; PZ[i]=o[2]; }
    vis.length=0;
    for(i=0;i<T.length;i++){
      var tr_=T[i], nx1=tr_.nx*cY-tr_.nz*sY, nz1=tr_.nx*sY+tr_.nz*cY, ny2=tr_.ny*cP-nz1*sP, nz2=tr_.ny*sP+nz1*cP;
      if(nz2<-.02) continue;
      tr_.shS+=(tr_.sh-tr_.shS)*Math.min(1, dt*8);
      tr_.l=Math.max(0, nx1*Lx+ny2*Ly+nz2*Lz)*(.12+.88*tr_.shS);
      var hd=nx1*Hx+ny2*Hy+nz2*Hz; tr_.sp=hd>0 ? Math.pow(hd, 22)*tr_.shS : 0; tr_.d=PZ[tr_.a]+PZ[tr_.b]+PZ[tr_.c];
      vis.push(tr_);
    }
    vis.sort(function(a, b){ return a.d-b.d; });
    ctx.lineWidth=.7; ctx.lineJoin="round";
    for(i=0;i<vis.length;i++){
      var q=vis[i], lam=q.l, b0=(8+88*Math.pow(lam, 1.7))*CLARO+q.q*15;
      var r=b0*LUZC[0]+3+AMB[0], g=b0*LUZC[1]+3+AMB[1], bl=b0*LUZC[2]+6+AMB[2];
      /* nieve en lo alto, más en lo plano */
      var sn=Math.max(0, Math.min(1, (q.h-.55)/.2))*(.3+.7*q.ny);
      if(sn>0){ var nv=(120+125*Math.pow(lam, 1.15))*(CIELO==="noche" ? 1 : 1.12)+q.q*14, sa=1-Math.min(1, lam*2.2);
        /* la nieve a la sombra se vuelve azulada, la del sol coge el color de la luz */
        r+=(nv*LUZC[0]-sa*AMB[2]*.9-r)*sn; g+=(nv*LUZC[1]-sa*AMB[2]*.4-g)*sn; bl+=(nv*LUZC[2]+5+sa*AMB[2]*.6-bl)*sn; }
      /* brillo: el reflejo de la luz en las caras que la miran (más en la nieve) */
      var br=q.sp*(40+60*sn); r+=br; g+=br; bl+=br*1.04;
      /* el brillo del camino en la roca de al lado */
      var gl=q.g*(q.tk<=luz ? .42 : .05);
      if(gl>.01){ r+=LR[0]*gl; g+=LR[1]*gl; bl+=LR[2]*gl; }
      r+=LR[0]*.02; g+=LR[1]*.02; bl+=LR[2]*.02;
      /* hacia el borde se funde con la noche */
      var fo=Math.min(1, Math.pow(Math.max(0, 1-q.rr)*2.6, .8)); r*=fo; g*=fo; bl*=fo;
      var col=rgb(r, g, bl);
      ctx.fillStyle=col; ctx.strokeStyle=col;
      ctx.beginPath(); ctx.moveTo(PX[q.a], PY[q.a]); ctx.lineTo(PX[q.b], PY[q.b]); ctx.lineTo(PX[q.c], PY[q.c]); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    /* el camino: solo lo que se ve; lo que falta, tenue; lo que llevas, de luz */
    /* lo que tapa la montaña no desaparece de golpe: cada punto se funde, en el espacio y en el tiempo */
    for(i=0;i<=NS;i++){ var c=CAM[i]; pr(c[0], c[1], c[2], o); CPX[i]=o[0]; CPY[i]=o[1]; CPF[i]=o[3]; 
      var nz1=CNX[i]*sY+CNZ[i]*cY, nz2=CNY[i]*sP+nz1*cP, w=Math.max(0, Math.min(1, (nz2+.04)/.2));
      CVT[i]=w*w*(3-2*w); }
    var kV=Math.min(1, dt*10);
    for(i=0;i<=NS;i++){
      var m=(CVT[Math.max(0,i-2)]+CVT[Math.max(0,i-1)]*2+CVT[i]*3+CVT[Math.min(NS,i+1)]*2+CVT[Math.min(NS,i+2)])/9;
      CVS[i]=m; CVI[i]=CVS[i]>.5 ? 1 : 0;
    }
    var corteF=Math.max(0, Math.min(NS, luz/40*NS)), corte=Math.floor(corteF), fr=corteF-corte;
    /* la punta exacta de la luz, entre dos muestras: así avanza continua y no a saltitos */
    var hx=corte<NS ? CPX[corte]+(CPX[corte+1]-CPX[corte])*fr : CPX[NS], hy=corte<NS ? CPY[corte]+(CPY[corte+1]-CPY[corte])*fr : CPY[NS];
    /* se dibuja por tramos de igual transparencia (6 escalones), así el borde que tapa la montaña se difumina */
    function tramos(desde, hasta, pinta){
      var nivelA=-1, em=false;
      function cierra(){ if(em && nivelA>0){ ctx.globalAlpha=nivelA; pinta(); } em=false; }
      for(var i=desde;i<hasta;i++){
        var a=Math.round(Math.min(CVS[i], CVS[i+1])*12)/12;
        if(a!==nivelA){ cierra(); nivelA=a; }
        if(a<=0) continue;
        if(!em){ ctx.beginPath(); ctx.moveTo(CPX[i], CPY[i]); em=true; }
        ctx.lineTo(CPX[i+1], CPY[i+1]);
      }
      cierra(); ctx.globalAlpha=1;
    }
    ctx.lineCap="round";
    tramos(corte, NS, function(){ ctx.strokeStyle="rgba("+Lz_.rgb+",.4)"; ctx.lineWidth=1.5; ctx.setLineDash([2, 5]); ctx.stroke(); ctx.setLineDash([]); });
    if(corte>0){
      ctx.save();
      /* sin shadowBlur (en el iPhone hacía que fuera a tirones): tres trazos, del halo ancho al hilo blanco */
      var pintaLuz=function(){
        ctx.globalCompositeOperation="lighter";
        var ga=ctx.globalAlpha;
        ctx.globalAlpha=ga*.05; ctx.strokeStyle="rgba("+Lz_.rgb+",1)"; ctx.lineWidth=22; ctx.stroke();
        ctx.globalAlpha=ga*.10; ctx.lineWidth=11; ctx.stroke();
        ctx.globalAlpha=ga*.28; ctx.lineWidth=5.5; ctx.stroke();
        ctx.globalAlpha=ga*.95; ctx.strokeStyle=Lz_.claro; ctx.lineWidth=2; ctx.stroke();
        ctx.globalAlpha=ga; ctx.globalCompositeOperation="source-over";
      };
      tramos(0, corte, pintaLuz);
      /* las huellas de la semana: el tramo subido en los últimos 7 días, más vivo */
      var iSem=Math.floor(Math.min(tuSem, luz)/40*NS);
      if(corte-iSem>1){
        tramos(iSem, corte, function(){
          ctx.globalCompositeOperation="lighter"; var ga=ctx.globalAlpha;
          ctx.globalAlpha=ga*.35; ctx.strokeStyle="rgba("+Lz_.rgb+",1)"; ctx.lineWidth=8; ctx.stroke();
          ctx.globalAlpha=ga; ctx.strokeStyle="#fff"; ctx.lineWidth=2.6; ctx.setLineDash([1, 6]); ctx.stroke(); ctx.setLineDash([]);
          ctx.globalCompositeOperation="source-over";
        });
      }
      if(fr>0 && corte<NS && Math.min(CVS[corte], CVS[corte+1])>.05){
        ctx.globalAlpha=Math.min(CVS[corte], CVS[corte+1]); ctx.beginPath(); ctx.moveTo(CPX[corte], CPY[corte]); ctx.lineTo(hx, hy); pintaLuz(); ctx.globalAlpha=1;
      }
      ctx.restore();
    }
    /* el inicio: un banderín con «Inicio» en el primer punto del camino */
    if(CVS[0]>.03){
      var bx=CPX[0], by=CPY[0], bf=Math.min(1.2, CPF[0]);
      ctx.save(); ctx.globalAlpha=CVS[0];
      ctx.beginPath(); ctx.arc(bx, by, 4*bf, 0, 6.283); ctx.fillStyle=Lz_.claro; ctx.fill();
      ctx.strokeStyle="#fff"; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by-24*bf); ctx.stroke();
      ctx.fillStyle="rgba("+Lz_.rgb+",1)"; ctx.beginPath(); ctx.moveTo(bx, by-24*bf); ctx.lineTo(bx+13*bf, by-19.5*bf); ctx.lineTo(bx, by-15*bf); ctx.closePath(); ctx.fill();
      ctx.font="800 "+(9.5*bf).toFixed(1)+'px "Plus Jakarta Sans", system-ui, sans-serif'; ctx.textAlign="center"; ctx.textBaseline="top";
      ctx.lineWidth=3; ctx.strokeStyle="rgba(5,5,7,.75)"; ctx.strokeText(tr("INICIO"), bx, by+7*bf); ctx.fillStyle="#fff"; ctx.fillText(tr("INICIO"), bx, by+7*bf);
      ctx.restore();
    }
    anillo(true);
    pintaClima(tt);

    /* banderines de rango: clavados en el círculo de cada rango (su último nivel), de su color;
       al tocarlos dicen qué desbloquea. El mástil pasa por detrás del nombre */
    BANS.length=0;
    if(!vuelo) for(var kr=0;kr<RANGOS.length;kr++){
      var rgk=RANGOS[kr]; if(rgk.hasta>=40) continue;
      var ib=Math.round(rgk.hasta/40*NS); if(CVS[ib]<.25) continue;
      var ff=Math.min(1.25, CPF[ib]), fx=CPX[ib], fy=CPY[ib]-5.2*ff, pas=luz>=rgk.hasta, hb=38*ff;
      ctx.save(); ctx.globalAlpha=Math.min(1, CVS[ib]*1.3)*(pas ? 1 : .7);
      ctx.strokeStyle=pas ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.4)"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy-hb); ctx.stroke();
      ctx.fillStyle=rgk.c;
      if(pas){ ctx.shadowColor=rgk.c; ctx.shadowBlur=8; }
      ctx.beginPath(); ctx.moveTo(fx, fy-hb); ctx.lineTo(fx+12*ff, fy-hb+4*ff); ctx.lineTo(fx, fy-hb+8*ff); ctx.closePath(); ctx.fill();
      ctx.restore();
      BANS.push({ x:fx+4*ff, y:fy-hb+4*ff, k:kr });
    }
    /* «+N XP esta semana», junto al tramo de la semana */
    if(!vuelo && luz>=tu-.01 && semXP>0){
      var iM=Math.round((Math.min(tuSem, tu)+tu)/2/40*NS);
      if(CVS[iM]>.6 && tu-tuSem>.15){
        ctx.save(); ctx.font='700 10.5px "Plus Jakarta Sans", system-ui, sans-serif'; ctx.textAlign="center"; ctx.textBaseline="top";
        var tx="+"+semXP+" XP "+tr("esta semana"), tw=ctx.measureText(tx).width+14, lx=Math.max(tw/2+8, Math.min(W-tw/2-8, CPX[iM])), ly=CPY[iM]+10;
        /* que no la tape la pastilla «Tú»: si choca, encima del camino; si también, no se pinta */
        var choca=function(y0){ return pisa(lx-tw/2-3, y0-3, lx+tw/2+3, y0+22, OCUA)>0; };
        if(choca(ly)) ly=CPY[iM]-29;
        if(!choca(ly)){
          ctx.fillStyle="rgba(8,8,10,.62)"; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(lx-tw/2, ly, tw, 19, 10); else ctx.rect(lx-tw/2, ly, tw, 19); ctx.fill();
          ctx.fillStyle=Lz_.claro; ctx.fillText(tx, lx, ly+4.5);
        }
        ctx.restore();
      }
    }

    /* los niveles: un punto en cada uno; en el pico de cada rango, su nombre encima */
    OCU.length=0;
    for(var n=1;n<=40;n++){
      var ix=Math.round(n/40*NS); if(CVS[ix]<.03) continue; ctx.globalAlpha=Math.min(1, CVS[ix]*1.2);
      var ya=n<=luz+1e-6, pico=M3_NIV.indexOf(n)>=0, rg=rangoDe(n), x=CPX[ix], y=CPY[ix], f=CPF[ix];
      if(pico){
        ctx.beginPath(); ctx.arc(x, y, 5.2*f, 0, 6.283); ctx.fillStyle="#08080a"; ctx.fill();
        ctx.lineWidth=1.4; ctx.strokeStyle=rg.c; if(!ya) ctx.globalAlpha*=.6; ctx.stroke(); if(!ya) ctx.globalAlpha=Math.min(1, CVS[ix]*1.2);
      }
      ctx.beginPath(); ctx.arc(x, y, (pico ? 2.4 : 1.6)*f, 0, 6.283);
      ctx.fillStyle=ya ? (pico ? rg.c : Lz_.claro) : (pico ? rg.c : "rgba(255,255,255,.3)"); ctx.fill();
      if(pico && n<40){
        ctx.font="800 "+(10.5*Math.min(1.15, f)).toFixed(1)+'px "Plus Jakarta Sans", system-ui, sans-serif';
        try{ ctx.letterSpacing="1.4px"; }catch(er){}
        ctx.textBaseline="bottom";
        /* el nombre, a un lado del mástil del banderín: a la izquierda, o a la derecha si ahí está tu foto */
        var txt=tr(rg.n).toUpperCase(), ty=y-14*f, twR=ctx.measureText(txt).width+4, al="right", xt=x-5*f;
        if(YREC && pisa(xt-twR, ty-24*f, xt, ty+2, [YREC])>0){ al="left"; xt=x+5*f; }
        ctx.textAlign=al; x=xt;
        OCU.push([al==="right" ? xt-twR : xt-2, ty-24*f, al==="right" ? xt+2 : xt+twR, ty+2]);
        ctx.lineWidth=3; ctx.strokeStyle="rgba(5,5,7,.75)"; ctx.strokeText(txt, x, ty);
        if(ya){ ctx.shadowColor=rg.c; ctx.shadowBlur=10; }
        ctx.fillStyle=ya ? "#fff" : "rgba(255,255,255,.55)"; ctx.fillText(txt, x, ty);
        ctx.shadowBlur=0;
        ctx.font="700 "+(9*Math.min(1.15, f)).toFixed(1)+'px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle=ya ? rg.c : "rgba(255,255,255,.4)"; ctx.fillText(String(n), x, ty-12*f);
        try{ ctx.letterSpacing="0px"; }catch(er){}
      }
    }
    ctx.globalAlpha=1;

    /* la cabeza de la luz mientras sube */
    if(luz<tu-.02 && corte>0 && CVS[corte]>.05){
      /* un cometa: la cola se aviva cerca de la punta y la punta late */
      ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.lineCap="round";
      var cola=Math.min(corte, 30);
      for(var q=corte-cola;q<corte;q++){ var kq=(q-(corte-cola))/cola;
        ctx.globalAlpha=kq*kq*.9*CVS[q]; ctx.strokeStyle=Lz_.claro; ctx.lineWidth=2+kq*3;
        ctx.beginPath(); ctx.moveTo(CPX[q], CPY[q]); ctx.lineTo(q+1===corte+1 ? hx : CPX[q+1], q+1===corte+1 ? hy : CPY[q+1]); ctx.stroke(); }
      ctx.globalAlpha=CVS[corte];
      var rh=13+3*Math.sin(tt*9), gh2=ctx.createRadialGradient(hx, hy, 0, hx, hy, rh);
      gh2.addColorStop(0, "rgba(255,255,255,1)"); gh2.addColorStop(.25, "rgba("+Lz_.rgb+",.8)"); gh2.addColorStop(1, "rgba("+Lz_.rgb+",0)");
      ctx.fillStyle=gh2; ctx.beginPath(); ctx.arc(hx, hy, rh, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    /* tu sitio: un halo que late */
    if(luz>=tu-.01){
      var ym=m3Camino(tu); pr(ym[0], ym[1], ym[2], o);
      var ih=Math.round(tu/40*NS), vy=CVS[Math.min(NS, ih)];
      if(vy>.05){
        var ry=(30+6*Math.sin(tt*2.2))*Math.min(1.3, o[3]*ZM), gy=ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], ry);
        gy.addColorStop(0, "rgba("+Lz_.rgb+","+(.5*vy).toFixed(3)+")"); gy.addColorStop(1, "rgba("+Lz_.rgb+",0)");
        ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.fillStyle=gy; ctx.beginPath(); ctx.arc(o[0], o[1], ry, 0, 6.283); ctx.fill(); ctx.restore();
      }
    }
    /* la cima: una estrella de luz que late */
    var lat=.75+.25*Math.sin(tt*1.8);
    var cim=ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], 26*lat);
    cim.addColorStop(0, "rgba(255,255,255,.95)"); cim.addColorStop(.25, "rgba("+Lz_.rgb+",.7)"); cim.addColorStop(1, "rgba("+Lz_.rgb+",0)");
    ctx.fillStyle=cim; ctx.beginPath(); ctx.arc(pt[0], pt[1], 26*lat, 0, 6.283); ctx.fill();

    try{ pajPinta(dt, ahora, tt); }catch(e){ PAJ.length=0; CHISP.length=0; }   /* un fallo de los pájaros nunca para la montaña */

    /* encima, en HTML: Peak., tú y la gente */
    elMarca.style.transform="translate("+pt[0].toFixed(1)+"px,"+(pt[1]-30).toFixed(1)+"px) translate(-50%,-100%)";
    var my=m3Camino(Math.min(tu, luz)); pr(my[0], my[1], my[2], o);
    YREC=[o[0]-24, o[1]-24, o[0]+24, o[1]+24];
    if(!elYo._w) elYo._w=elYo.offsetWidth||150;
    var yIzq=o[0]<CX; if(!yIzq && o[0]-20+elYo._w>W-6) yIzq=true; else if(yIzq && o[0]+20-elYo._w<6) yIzq=false;
    elYo.classList.toggle("izq", yIzq);
    var yv=seVe(my[0], my[1]+.02, my[2]);
    elYo.style.opacity=(luz>=tu-.01) ? (yv ? "1" : ".35") : "0";
    elYo.style.transform="translate("+o[0].toFixed(1)+"px,"+o[1].toFixed(1)+"px)"+(yIzq ? " translate(-100%,0)" : "");
    if(luz>=tu-.01 && yv){ var yx0=yIzq ? o[0]+20-elYo._w : o[0]-20; OCU.push([yx0-4, o[1]-24, yx0+elYo._w+4, o[1]+24]); }
    /* las de delante eligen primero */
    var orden=CHIPS.map(function(ch, i){ var p=ch.p; pr(p[0], p[1], p[2], o); ch.sx=o[0]; ch.sy=o[1]; ch.sz=o[2]; ch.sf=o[3]; return i; });
    orden.sort(function(a, b){ return CHIPS[b].sz-CHIPS[a].sz; });
    orden.forEach(function(ci){
      var ch=CHIPS[ci], p=ch.p, ox=ch.sx, oy=ch.sy;
      ch.ve+=((seVe(p[0], p[1]+.02, p[2]) ? 1 : 0)-ch.ve)*Math.min(1, dt*9);
      var vv=ch.ve*(luz>=tu-.01 ? 1 : 0);
      if(!ch.w){ ch.w=ch.el.offsetWidth||110; ch.h=ch.el.offsetHeight||32; }
      var sc=Math.max(.78, Math.min(1.08, ch.sf)), w=ch.w*sc, h=ch.h*sc;
      var pref=ch.izq!=null ? ch.izq : ox<CX, izq=pref, dyO=0;
      if(vv>.3){
        var mejor=1e9, CAND=[[pref,0],[!pref,0],[pref,-h-4],[pref,h+4],[!pref,-h-4],[!pref,h+4],[pref,-2*h-8],[pref,2*h+8]];
        for(var c=0;c<CAND.length;c++){
          var iz=CAND[c][0], dy=CAND[c][1], x0=iz ? ox-8-w : ox+8, y0=oy+dy-h/2;
          if(x0<6 || x0+w>W-6) continue;
          var m=pisa(x0, y0, x0+w, y0+h, OCU)+c*2;   /* a igualdad, lo de siempre */
          if(m<mejor){ mejor=m; izq=iz; dyO=dy; }
          if(m<=c*2) break;
        }
        OCU.push([izq ? ox-8-w : ox+8, oy+dyO-h/2, izq ? ox-8 : ox+8+w, oy+dyO+h/2]);
      }
      ch.izq=izq; ch.dy=ch.dy==null ? dyO : ch.dy+(dyO-ch.dy)*Math.min(1, dt*10);
      if(Math.abs(vv-ch.v)>.01){ ch.el.style.opacity=vv.toFixed(2); ch.v=vv; }
      ch.el.style.zIndex=Math.round(ch.sz*100+200);
      ch.el.classList.toggle("izq", izq);
      ch.el.style.transform="translate("+(ox+(izq ? -8 : 8)).toFixed(1)+"px,"+(oy+ch.dy).toFixed(1)+"px) translate("+(izq ? "-100%" : "0")+",-50%) scale("+sc.toFixed(3)+")";
    });
    OCUA=OCU.slice();

    raf=requestAnimationFrame(cuadro);
  }
  raf=requestAnimationFrame(cuadro);

  return {
    pausa:function(){ parado=true; cancelAnimationFrame(raf); },
    sigue:function(){ if(!parado) return; parado=false; prev=0; pintaGente(); raf=requestAnimationFrame(cuadro); },
    para:function(){ if(vuelo) vueloAcaba(); vivo=false; cancelAnimationFrame(raf); clearTimeout(gTimer); clearTimeout(pistaT); window.removeEventListener("resize", mide); }
  };
}

/* ── se engancha a la montaña de siempre ── */
var _m3Abre=mtAbre;
mtAbre=function(){
  var r=_m3Abre.apply(this, arguments);
  if(MT && MT.capa && !MT.capa.querySelector(".mt-vista")){
    MT.capa.insertAdjacentHTML("beforeend", m3HTML());
    if(m3Pref()==="3d") m3Vista("3d");
  }
  return r;
};
var _m3Cierra=mtCierra;
mtCierra=function(){
  if(MT && MT.m3){ MT.m3.para(); MT.m3=null; }
  return _m3Cierra.apply(this, arguments);
};
var _m3GA=grupoAccion;
grupoAccion=function(a, el){
  if(a==="x-monte-vista"){ sonido("tick"); m3Vista(el.dataset.v); return true; }
  return _m3GA.apply(this, arguments);
};

(function(){ var st=document.createElement("style"); st.id="montana3d-css"; st.textContent=[
/* el selector 2D / 3D, arriba en el centro */
'.mt-vista{ position:absolute; z-index:4; left:50%; top:calc(env(safe-area-inset-top) + 15px); transform:translateX(-50%); display:grid; grid-template-columns:1fr 1fr; padding:3px; border-radius:99px;',
'  background:rgba(255,255,255,.09); box-shadow:inset 0 0 0 1px rgba(255,255,255,.13); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }',
'.mt-vista button{ position:relative; z-index:1; width:54px; height:30px; border-radius:99px; font-size:12.5px; font-weight:800; letter-spacing:.04em; color:rgba(255,255,255,.62); transition:color .3s ease; }',
'.mt-vista button.on{ color:#08080a; }',
'.mt-vista i{ position:absolute; top:3px; left:3px; width:54px; height:30px; border-radius:99px; background:var(--mt-claro); box-shadow:0 0 16px rgba(var(--mt-rgb),.55);',
'  transition:transform .45s cubic-bezier(.3,1.35,.5,1); }',
'#mt-capa.en3d .mt-vista i{ transform:translateX(54px); }',
/* la capa 3D */
'.m3{ position:absolute; inset:0; display:none; touch-action:none; cursor:grab; -webkit-user-select:none; user-select:none; }',
'.m3:active{ cursor:grabbing; }',
'#mt-capa.en3d .m3{ display:block; animation:m3Entra .5s ease both; }',
'#mt-capa.en3d .mt-scroll{ visibility:hidden; }',
'@keyframes m3Entra{ from{ opacity:0; transform:scale(.97); } to{ opacity:1; transform:none; } }',
'.m3-cv{ position:absolute; inset:0; display:block; }',
'.m3-capa{ position:absolute; inset:0; pointer-events:none; overflow:hidden; transition:opacity .8s ease; }',
'.m3.volando .m3-capa{ opacity:0; transition:none; }',
'.m3-vuelo{ position:absolute; inset:0; display:grid; place-items:center; pointer-events:none; opacity:0; background:radial-gradient(70% 45% at 50% 45%, rgba(5,5,7,.78), rgba(5,5,7,.35) 70%, transparent); }',
'.m3-vuelo-c{ display:flex; flex-direction:column; align-items:center; gap:14px; transform:scale(var(--k,1)); }',
'.m3-vuelo-r{ margin:0; display:flex; flex-direction:column; align-items:center; gap:2px; }',
'.m3-vuelo-r small{ font:700 11px "Plus Jakarta Sans",system-ui,sans-serif; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.7); }',
'.m3-vuelo-r b{ font:700 22px Unbounded,"Plus Jakarta Sans",system-ui,sans-serif; letter-spacing:.02em; }',
'.m3-vuelo svg{ width:min(62vw,280px); height:auto; fill:#fff; filter:drop-shadow(0 0 18px rgba(var(--mt-rgb),.45)); }',
'.m3-marca{ position:absolute; left:0; top:0; will-change:transform; }',
'.m3-marca svg{ display:block; width:132px; height:auto; fill:var(--mt-claro); filter:drop-shadow(0 0 8px var(--mt)) drop-shadow(0 0 24px rgba(var(--mt-rgb),.55)); animation:mtCima 3.6s ease-in-out infinite; }',
'.m3-yo{ position:absolute; left:0; top:0; z-index:400; display:flex; align-items:center; gap:8px; margin:-20px 0 0 -20px; transition:opacity .35s ease; will-change:transform; }',
'.m3-yo .mt-av{ position:relative; width:40px; height:40px; flex:0 0 auto; box-shadow:0 0 0 2.5px #050507, 0 0 0 4px var(--mt), 0 0 22px 2px rgba(var(--mt-rgb),.7); }',
'.m3-yo::before{ content:""; position:absolute; left:0; top:0; width:40px; height:40px; border-radius:99px; border:2px solid var(--mt); animation:mtOnda 2s ease-out infinite; }',
'.m3-yo-t{ padding:4px 10px; border-radius:99px; font-size:11.5px; color:#fff; white-space:nowrap; background:rgba(8,8,10,.55); box-shadow:inset 0 0 0 1px rgba(var(--mt-rgb),.55); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }',
'.m3-yo.izq{ flex-direction:row-reverse; margin-left:20px; } .m3-yo.izq::before{ left:auto; right:0; }',
'.m3-p{ position:absolute; left:0; top:0; display:flex; align-items:center; gap:6px; padding:3px 10px 3px 3px; border-radius:99px; opacity:0; will-change:transform, opacity; transform-origin:left center;',
'  background:rgba(14,14,18,.66); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14), 0 6px 18px -8px rgba(0,0,0,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }',
'.m3-p.izq{ flex-direction:row-reverse; padding:3px 3px 3px 10px; transform-origin:right center; }',
'.m3-p .mt-av{ width:26px; height:26px; flex:0 0 auto; box-shadow:0 0 0 1.5px rgba(var(--mt-rgb),.6); }',
'.m3-p-t{ display:flex; flex-direction:column; line-height:1.1; } .m3-p.izq .m3-p-t{ align-items:flex-end; }',
'.m3-p-t b{ font-size:11px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; color:#fff; white-space:nowrap; }',
'.m3-p-t small{ font-size:9.5px; color:rgba(255,255,255,.55); white-space:nowrap; }',
'.m3-pista{ position:absolute; left:50%; bottom:calc(env(safe-area-inset-bottom) + 132px); transform:translateX(-50%); display:flex; align-items:center; gap:7px; padding:7px 13px; border-radius:99px;',
'  font-size:12px; font-weight:700; color:rgba(255,255,255,.85); background:rgba(255,255,255,.08); box-shadow:inset 0 0 0 1px rgba(255,255,255,.12); white-space:nowrap; transition:opacity .6s ease, transform .6s ease; }',
'.m3-pista svg{ width:17px; height:17px; animation:m3Pista 1.8s ease-in-out infinite; }',
'.m3-pista.fuera{ opacity:0; transform:translate(-50%,8px); }',
'@keyframes m3Pista{ 0%,100%{ transform:translateX(-3px); } 50%{ transform:translateX(3px); } }',
/* la tarjeta de abajo */
'.m3-info{ position:absolute; left:50%; bottom:calc(env(safe-area-inset-bottom) + 18px); transform:translateX(-50%); width:min(calc(100% - 32px), 420px); padding:14px 16px 14px; border-radius:22px;',
'  background:rgba(18,18,22,.62); box-shadow:inset 0 0 0 1px rgba(255,255,255,.12), 0 18px 40px -18px rgba(0,0,0,.9); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); }',
'.m3-i-fila{ display:flex; align-items:center; gap:12px; }',
'.m3-i-n{ font-family:Unbounded, "Plus Jakarta Sans", sans-serif; font-size:28px; font-weight:800; letter-spacing:-.04em; line-height:1; color:var(--mt-claro); text-shadow:0 0 18px rgba(var(--mt-rgb),.6); }',
'.m3-i-n small{ font-size:12px; font-weight:700; letter-spacing:0; color:rgba(255,255,255,.4); margin-left:2px; }',
'.m3-i-t{ flex:1; min-width:0; } .m3-i-t b{ display:block; font-size:14.5px; font-weight:800; color:#fff; } .m3-i-t small{ display:block; font-size:12px; color:rgba(255,255,255,.6); margin-top:2px; }',
'.m3-i-g{ display:flex; align-items:center; gap:5px; } .m3-i-g small{ font-size:12px; font-weight:700; color:rgba(255,255,255,.7); }',
'.m3-caras{ display:flex; } .m3-caras .mt-av{ width:22px; height:22px; margin-left:-7px; box-shadow:0 0 0 2px #141418; font-size:10px; } .m3-caras .mt-av:first-child{ margin-left:0; }',
'.m3-barra{ height:5px; border-radius:99px; margin-top:12px; overflow:hidden; background:rgba(255,255,255,.1); }',
'.m3-barra i{ display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg, var(--mt), var(--mt-claro)); box-shadow:0 0 12px rgba(var(--mt-rgb),.8); }',
/* la ficha: un amigo o un rango, abajo, encima de la tarjeta */
'.m3-ficha{ position:absolute; z-index:6; left:50%; bottom:calc(env(safe-area-inset-bottom) + 18px); width:min(calc(100% - 32px), 420px); padding:16px 16px 16px; border-radius:22px; color:#fff;',
'  background:rgba(18,18,22,.86); box-shadow:inset 0 0 0 1px rgba(var(--mt-rgb),.35), 0 18px 40px -18px rgba(0,0,0,.9); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%);',
'  opacity:0; pointer-events:none; transform:translate(-50%,16px); transition:opacity .3s ease, transform .4s cubic-bezier(.3,1.3,.5,1); }',
'.m3-ficha.on{ opacity:1; pointer-events:auto; transform:translate(-50%,0); }',
'.m3-f-x{ position:absolute; top:8px; right:10px; width:30px; height:30px; border-radius:99px; font-size:20px; line-height:1; color:rgba(255,255,255,.6); }',
'.m3-f-cab{ display:flex; align-items:center; gap:12px; padding-right:30px; }',
'.m3-f-cab .mt-av{ width:44px; height:44px; flex:0 0 auto; box-shadow:0 0 0 2px rgba(var(--mt-rgb),.7); }',
'.m3-f-cab b{ display:block; font-size:16px; font-weight:800; } .m3-f-cab small{ display:block; font-size:12px; color:rgba(255,255,255,.6); margin-top:2px; } .m3-f-cab i{ font-style:normal; font-weight:800; }',
'.m3-f-band{ width:14px; height:22px; flex:0 0 auto; clip-path:polygon(0 0, 100% 50%, 0 100%); }',
'.m3-f-t{ margin:12px 0 0; font-size:13.5px; color:rgba(255,255,255,.85); } .m3-f-t b{ color:var(--mt-claro); font-size:15px; }',
'.m3-f-b{ margin-top:12px; width:100%; height:42px; border-radius:14px; font-weight:800; font-size:14px; color:#08080a; background:var(--mt-claro); box-shadow:0 0 18px rgba(var(--mt-rgb),.45); }',
'.m3-f-l{ list-style:none; margin:10px 0 0; padding:0; display:flex; flex-direction:column; gap:6px; font-size:12.5px; color:rgba(255,255,255,.75); }',
'.m3-f-l li{ display:flex; gap:8px; align-items:baseline; } .m3-f-l .num{ min-width:2.2em; font-weight:800; color:var(--mt-claro); }',
'.m3-niebla{ margin:8px 0 0; font-size:11.5px; color:rgba(214,218,228,.75); }',
'@media (prefers-reduced-motion:reduce){ .m3-marca svg, .m3-yo::before, .m3-pista svg, .mt-vista i{ animation:none!important; transition:none!important; } }'
].join("\n"); document.head.appendChild(st); })();

/* Ajustes › Avanzado: volver a ver el vuelo la próxima vez que abras la montaña en 3D */
var _sheetSettingsVuelo=sheetSettings;
sheetSettings=function(){
  var r=_sheetSettingsVuelo.apply(this, arguments);
  var av=document.getElementById("aj-av"); if(!av || document.getElementById("aj-vuelo")) return r;
  var b=document.createElement("button");
  b.id="aj-vuelo"; b.className="aj-priv"; b.setAttribute("data-act","x-vuelo-ajustes");
  b.innerHTML='<span class="aj-m-ico">'+ico("meta")+'</span><span class="aj-priv-t"><b>'+tr("Ver otra vez el vuelo de la montaña")+'</b><small>'+tr("Sale al abrir tu montaña en 3D")+'</small></span>'+ico("flecha");
  av.appendChild(b);
  return r;
};
var _vueloGA=grupoAccion;
grupoAccion=function(a, el){
  if(a==="x-vuelo-ajustes"){
    try{ localStorage.removeItem(M3_VUELO); }catch(e){}
    var sm=el && el.querySelector && el.querySelector("small"); if(sm) sm.textContent=tr("Listo: lo verás la próxima vez que abras tu montaña en 3D");
    return true;
  }
  return _vueloGA.apply(this, arguments);
};
