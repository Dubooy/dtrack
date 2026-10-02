/* Peak · animación del logo repetido
   Muchos PEAK. sueltos que fluyen por la pantalla como sobre agua, sin filas.
   Cada letra cambia de ancho y alto en ola y la A es una pirámide de tres caras
   que gira en 3D de verdad (la cara en sombra lleva las rayas del logo).
   No responde al dedo: se reproduce sola.
   Todo se repite exactamente cada 12 s, así el vídeo enlaza sin salto.
   Los trazos son los del logo (sacados de Unbounded, licencia OFL).

   Uso: var a = PeakAnim(canvas, { darkFirst: false });
        a.stop();  a.setAccent(true);  a.setPaused(true);  a.step(1/30); */
(function(){
var L = {
 P:{d:"M494 34Q592 34 662.5 67Q733 100 770 159.5Q807 219 807 300Q807 380 770 440Q733 500 662.5 533Q592 566 494 566H173V382H479Q523 382 547.5 360Q572 338 572 300Q572 260 547.5 239Q523 218 479 218H193L298 112V784H65V34Z",x0:65,x1:807},
 E:{d:"M1507 327V491H950V327ZM1109 409 1062 699 971 598H1542V784H831L887 409L831 34H1537V220H971L1062 119Z",x0:831,x1:1542},
 A:{d:"",x0:1564,x1:2421},
 K:{d:"M2446 784V34H2677V601L2617 552L3016 34H3260L2657 784ZM2805 433 2976 295 3271 784H3007Z",x0:2446,x1:3271},
 ".":{d:"M3420 795Q3385 795 3356 778.5Q3327 762 3310.5 733Q3294 704 3294 669Q3294 633 3310.5 604.5Q3327 576 3356 559.5Q3385 543 3420 543Q3456 543 3484.5 559.5Q3513 576 3529.5 604.5Q3546 633 3546 669Q3546 704 3529.5 733Q3513 762 3484.5 778.5Q3456 795 3420 795Z",x0:3294,x1:3546}
};
var ready = false;
function prep(){ if(ready) return; for (var k in L){ if (L[k].d) L[k].p = new Path2D(L[k].d); L[k].w = L[k].x1 - L[k].x0; } ready = true; }
var SEQ = ["P","E","A","K","."];
var GAPS = [24, 22, 25, 23, 0];
var YH = 806, YC = 395, BASE = 784;
var CREAM = "#F5F0E6", INK = "#1C1B19", GREEN = "#0E8A6E";

// pirámide de base triangular: a 0° se ve como la A del logo
// (cara izquierda maciza, cara derecha rayada, cresta al 65 % del ancho)
var PR = 857/1.706, PH = 788, PROT0 = 10*Math.PI/180, PCAM = 2600;
var PAX = 0.087*PR;   // el eje de giro pasa por la cima; así la silueta queda centrada
var LIGHT = (function(){ var x = -0.8, y = 0.45, z = 0.7, n = Math.hypot(x, y, z); return [x/n, y/n, z/n]; })();

function ease(x){ return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; }
function mod(a, n){ return ((a % n) + n) % n; }
function sub(a, b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function cross(a, b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function dot(a, b){ return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function norm(a){ var n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/n, a[1]/n, a[2]/n]; }

window.PeakAnim = function(cv, o){
  o = o || {};
  prep();
  var ctx = cv.getContext("2d");
  var bg = o.darkFirst ? INK : CREAM, fg = o.darkFirst ? CREAM : INK;
  var W = 0, H = 0, dpr = 1, alive = true, accent = !!o.accent, paused = false;
  var t = o.t0 || 0, prev = 0, speed = o.speed || 1;
  function resize(){
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr || 2.5);
    W = r.width; H = r.height;
    cv.width = Math.max(1, Math.round(W*dpr)); cv.height = Math.max(1, Math.round(H*dpr));
  }
  var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(cv); else window.addEventListener("resize", resize);
  resize();

  var T = 12, F = Math.PI*2/T;

  function spin(U, V){
    var P = 6, off = U*0.35 + V*0.55, f = mod((t - off)/P, 1), SP = 0.42;
    return f < SP ? ease(f/SP)*Math.PI*2 : 0;
  }

  // dibuja la pirámide con la cima en (cx, top) y escala sx, sy (px por unidad)
  function pyramid(cx, cy, sx, sy, th, col){
    var v = [], i;
    for (i = 0; i < 3; i++){ var a = PROT0 + th + i*Math.PI*2/3; v.push([PR*Math.sin(a), 0, PR*Math.cos(a)]); }
    var apex = [0, PH, 0], cen = [0, PH/4, 0], cam = [0, PH/2, PCAM];
    function pj(p){
      var k = PCAM/(PCAM - p[2]);
      return [cx + (p[0]*k + PAX)*sx, cy + ((BASE - p[1]) - YC - (PH/2 - p[1])*(1 - k))*sy];
    }
    var faces = [], litMax = -2;
    for (i = 0; i < 3; i++){
      var b = v[i], c = v[(i+1)%3];
      var n = norm(cross(sub(b, apex), sub(c, apex)));
      var mid = [(apex[0]+b[0]+c[0])/3, (apex[1]+b[1]+c[1])/3, (apex[2]+b[2]+c[2])/3];
      if (dot(n, sub(mid, cen)) < 0){ n = [-n[0], -n[1], -n[2]]; var tmp = b; b = c; c = tmp; }
      if (dot(n, sub(cam, mid)) <= 0) continue;          // cara de espaldas
      var lit = dot(n, LIGHT);
      if (lit > litMax) litMax = lit;
      faces.push({ b: b, c: c, lit: lit });
    }
    var A = pj(apex);
    ctx.fillStyle = col;
    for (i = 0; i < faces.length; i++){
      var f = faces[i], B = pj(f.b), C = pj(f.c);
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath(); ctx.fill();
      f.B = B; f.C = C;
    }
    // rayas del logo en las caras en sombra: cuanto más oscura la cara, más abiertas
    ctx.fillStyle = bg;
    for (i = 0; i < faces.length; i++){
      var g = faces[i], gap = Math.min(0.5, Math.max(0, (litMax - g.lit)/0.3)*0.5);
      if (gap < 0.03) continue;
      var N = 7;
      for (var j = 0; j < N; j++){
        var t0 = (j + 0.5)/N, t1 = t0 + gap/N;
        var P0 = [g.b[0] + (g.c[0]-g.b[0])*t0, 0, g.b[2] + (g.c[2]-g.b[2])*t0];
        var P1 = [g.b[0] + (g.c[0]-g.b[0])*t1, 0, g.b[2] + (g.c[2]-g.b[2])*t1];
        var q = 0.22 + 0.05*j;
        var Q0 = [apex[0] + (P0[0]-apex[0])*q, apex[1] + (P0[1]-apex[1])*q, apex[2] + (P0[2]-apex[2])*q];
        var Q1 = [apex[0] + (P1[0]-apex[0])*q, apex[1] + (P1[1]-apex[1])*q, apex[2] + (P1[2]-apex[2])*q];
        var a0 = pj(Q0), a1 = pj(P0), a2 = pj(P1), a3 = pj(Q1);
        ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.lineTo(a3[0], a3[1]); ctx.closePath(); ctx.fill();
      }
    }
  }

  function word(U, V, x, y, s, rot){
    // anchos y altos de cada letra: ola que recorre la palabra
    var ws = [], fys = [], total = 0, j, ph = U*0.8 + V*1.3;
    for (j = 0; j < 5; j++){
      var g = L[SEQ[j]];
      var fx = 0.66 + 0.48*(0.5 + 0.5*Math.sin(j*1.15 + ph - 2*F*t)) + 0.14*Math.sin(j*2.3 - ph + F*t);
      fys.push(0.66 + 0.34*(0.5 + 0.5*Math.sin(j*0.9 - ph*1.3 + 2*F*t + 1.7)));
      ws.push(g.w*s*fx); total += g.w*s*fx + (j < 4 ? GAPS[j]*s : 0);
    }
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    var cx = -total/2;
    for (j = 0; j < 5; j++){
      var ch = SEQ[j], gl = L[ch], sx = ws[j]/gl.w, sy = s*fys[j], mx = cx + ws[j]/2;
      if (ch === "A") pyramid(mx, 0, sx, sy, spin(U, V), accent ? GREEN : fg);
      else {
        ctx.save(); ctx.translate(mx, 0); ctx.scale(sx, sy); ctx.translate(-(gl.x0 + gl.w/2), -YC);
        ctx.fillStyle = (ch === "." && accent) ? GREEN : fg; ctx.fill(gl.p); ctx.restore();
      }
      cx += ws[j] + GAPS[j]*s;
    }
    ctx.restore();
  }

  function step(dt){
    t += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    var hW = Math.min(W, H*0.62)/(o.density || 8.2);   // alto de un logo
    var s = hW/YH, wordW = 3481*s;
    var cw = wordW*1.38, chh = hW*1.6;
    // la malla avanza justo una celda en diagonal por ciclo
    var shx = mod(t/T, 1)*cw*2, shy = -mod(t/T, 1)*chh*2;
    var AX = cw*0.13, AY = chh*0.26;
    var j0 = Math.floor((-chh*2 - shy)/chh), j1 = Math.ceil((H + chh*2 - shy)/chh);
    for (var jj = j0; jj <= j1; jj++){
      var off = mod(jj, 2)*cw*0.5;
      var i0 = Math.floor((-cw*1.5 - shx - off)/cw), i1 = Math.ceil((W + cw*1.5 - shx - off)/cw);
      for (var ii = i0; ii <= i1; ii++){
        var bx = ii*cw + off + shx, by = jj*chh + shy;
        // corriente suave: dos capas de ondas que tuercen la malla
        var U = bx/cw, V = by/chh;
        var x = bx + AX*Math.sin(V*0.55 + F*t + U*0.3) + AX*0.45*Math.sin(V*1.1 - 2*F*t + U*0.2 + 1.1);
        var y = by + AY*Math.sin(U*0.5 + 2*F*t + V*0.25) + AY*0.4*Math.sin(U*1.05 - F*t + 2.3);
        var rot = 0.07*Math.sin(U*0.6 - V*0.5 + F*t);
        if (x < -wordW || x > W + wordW || y < -hW*2 || y > H + hW*2) continue;
        word(U, V, x, y, s, rot);
      }
    }
  }

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function frame(now){
    if (!alive) return;
    var dt = prev ? Math.min(0.05, (now - prev)/1000) : 0; prev = now;
    if (paused) dt = 0;
    if (reduce) dt *= 0.3;
    step(dt*speed);
    requestAnimationFrame(frame);
  }
  if (!o.fixedTime) requestAnimationFrame(frame);

  return {
    step: step,
    stop: function(){ alive = false; if (ro) ro.disconnect(); },
    setAccent: function(v){ accent = !!v; },
    setPaused: function(v){ paused = !!v; }
  };
};
})();
