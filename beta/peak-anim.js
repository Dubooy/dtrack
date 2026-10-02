/* Peak · fondo animado con la montaña del logo
   Una cuadrícula ordenada de pirámides de tres caras que giran en 3D, todas en
   el mismo sentido y a velocidad constante, mientras la cuadrícula avanza en
   diagonal también a velocidad constante. Las caras son como el logo:
   una lisa, una rayada entera y otra con rayas en la mitad de abajo.
   No responde al dedo. Todo se repite exactamente cada 12 s (vídeo en bucle).

   Uso: var a = PeakAnim(canvas, { darkFirst: false });
        a.stop();  a.setPaused(true);  a.step(1/30); */
(function(){
var CREAM = "#F5F0E6", INK = "#1C1B19";
// pirámide de base triangular; a 0° se ve como la montaña del logo:
// cara izquierda lisa y cara derecha con rayas en la mitad de abajo
var R = 1, H = 1.55, ROT0 = 10*Math.PI/180, CAM = 6;
var T = 12, SPIN = Math.PI*2/6;             // una vuelta cada 6 s
var FACES = [                               // [vértice, vértice, rayas: 0 lisa, 1 entera, 0.5 mitad]
  [2, 0, 0],                                // izquierda delantera: lisa
  [0, 1, 0.5],                              // derecha delantera: mitad rayada (como el logo)
  [1, 2, 1]                                 // trasera: rayada entera
];
var STRIPES = 6, GAP = 0.34;

function mod(a, n){ return ((a % n) + n) % n; }

window.PeakAnim = function(cv, o){
  o = o || {};
  var ctx = cv.getContext("2d");
  var bg = o.darkFirst ? INK : CREAM, fg = o.darkFirst ? CREAM : INK;
  var W = 0, Hc = 0, dpr = 1, alive = true, paused = false;
  var t = o.t0 || 0, prev = 0, speed = o.speed || 1;
  function resize(){
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr || 2.5);
    W = r.width; Hc = r.height;
    cv.width = Math.max(1, Math.round(W*dpr)); cv.height = Math.max(1, Math.round(Hc*dpr));
  }
  var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(cv); else window.addEventListener("resize", resize);
  resize();

  // proyecta un punto 3D (y hacia arriba) a la pantalla: centro (cx, cy), tamaño k
  function pj(p, cx, cy, k){
    var f = CAM/(CAM - p[2]);
    return [cx + p[0]*f*k, cy - (p[1] - H/2)*f*k];
  }
  function quad(a, b, c, d){
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
  }
  function lerp(a, b, u){ return [a[0] + (b[0]-a[0])*u, a[1] + (b[1]-a[1])*u, a[2] + (b[2]-a[2])*u]; }

  function pyramid(cx, cy, k, th){
    var v = [], i;
    for (i = 0; i < 3; i++){ var a = ROT0 + th + i*Math.PI*2/3; v.push([R*Math.sin(a), 0, R*Math.cos(a)]); }
    var A = [0, H, 0], pA = pj(A, cx, cy, k);
    for (i = 0; i < 3; i++){
      var F = FACES[i], B = v[F[0]], C = v[F[1]];
      var pB = pj(B, cx, cy, k), pC = pj(C, cx, cy, k);
      // solo las caras que miran a la cámara (según el sentido de A, B, C en pantalla)
      var area = (pB[0]-pA[0])*(pC[1]-pA[1]) - (pB[1]-pA[1])*(pC[0]-pA[0]);
      if (area >= 0) continue;
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(pA[0], pA[1]); ctx.lineTo(pB[0], pB[1]); ctx.lineTo(pC[0], pC[1]); ctx.closePath(); ctx.fill();
      if (!F[2]) continue;
      // rayas paralelas al borde A–C: van de la base (B→C) hacia la arista A–B
      ctx.fillStyle = bg;
      for (var j = 0; j < STRIPES; j++){
        var t0 = (j + 0.5)/STRIPES - GAP/STRIPES/2, t1 = t0 + GAP/STRIPES;
        var P0 = lerp(B, C, t0), P1 = lerp(B, C, t1);
        var Q0 = lerp(P0, lerp(B, A, t0), F[2]), Q1 = lerp(P1, lerp(B, A, t1), F[2]);
        quad(pj(P0, cx, cy, k), pj(Q0, cx, cy, k), pj(Q1, cx, cy, k), pj(P1, cx, cy, k));
      }
    }
  }

  function step(dt){
    t += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, Hc);
    var cols = o.cols || 4.2;
    var cw = W/cols, ch = cw*0.9, k = cw*0.3;
    // la cuadrícula avanza en diagonal, siempre igual de rápido: una celda por ciclo
    var u = mod(t/T, 1), shx = u*cw, shy = -u*ch*2;
    var j0 = Math.floor((-ch*2 - shy)/ch), j1 = Math.ceil((Hc + ch*2 - shy)/ch);
    for (var jj = j0; jj <= j1; jj++){
      var off = mod(jj, 2)*cw/2;
      var i0 = Math.floor((-cw - shx - off)/cw), i1 = Math.ceil((W + cw - shx - off)/cw);
      for (var ii = i0; ii <= i1; ii++){
        var x = ii*cw + off + shx, y = jj*ch + shy;
        // el desfase depende de la posición: el giro avanza en ola diagonal
        var th = SPIN*t + (x/cw)*0.9 + (y/ch)*0.6;
        pyramid(x, y, k, th);
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
    setAccent: function(){},
    setPaused: function(v){ paused = !!v; }
  };
};
})();
