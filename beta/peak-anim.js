/* Peak · fondos animados con la montaña del logo
   La montaña es una pirámide de tres caras que gira en 3D a velocidad constante:
   una cara es el logo 2D tal cual (en reposo se ve exactamente el logo),
   otra es lisa y la tercera va rayada entera.
   Patrones: "cuadricula", "ajedrez", "palabras", "anillos", "logo".
   No responde al dedo. Todo se repite exactamente cada 12 s (vídeo en bucle).
   Los trazos son los del logo (sacados de Unbounded, licencia OFL).

   Uso: var a = PeakAnim(canvas, { pattern: "cuadricula", dark: false });
        a.setPattern("anillos");  a.setDark(true);  a.setPaused(true);  a.stop(); */
(function(){
var MARK = "M450 0 0 900 600 900 525 648 538 607 634 900 680 900 561 534 577 481 714 900 760 900 497 94 594 288ZM594 288 794 900 840 900 727 554ZM900 900 824 748 874 900Z";
var L = {
 P:{d:"M494 34Q592 34 662.5 67Q733 100 770 159.5Q807 219 807 300Q807 380 770 440Q733 500 662.5 533Q592 566 494 566H173V382H479Q523 382 547.5 360Q572 338 572 300Q572 260 547.5 239Q523 218 479 218H193L298 112V784H65V34Z",x0:65,x1:807},
 E:{d:"M1507 327V491H950V327ZM1109 409 1062 699 971 598H1542V784H831L887 409L831 34H1537V220H971L1062 119Z",x0:831,x1:1542},
 A:{d:"",x0:1564,x1:2421},
 K:{d:"M2446 784V34H2677V601L2617 552L3016 34H3260L2657 784ZM2805 433 2976 295 3271 784H3007Z",x0:2446,x1:3271},
 ".":{d:"M3420 795Q3385 795 3356 778.5Q3327 762 3310.5 733Q3294 704 3294 669Q3294 633 3310.5 604.5Q3327 576 3356 559.5Q3385 543 3420 543Q3456 543 3484.5 559.5Q3513 576 3529.5 604.5Q3546 633 3546 669Q3546 704 3529.5 733Q3513 762 3484.5 778.5Q3456 795 3420 795Z",x0:3294,x1:3546}
};
var markPath = null;
function prep(){ if (markPath) return; markPath = new Path2D(MARK); for (var k in L) if (L[k].d) L[k].p = new Path2D(L[k].d); }
var WM_X0 = 65, WM_X1 = 3546, WM_YC = 395;   // caja del wordmark en unidades de fuente

var CREAM = "#F5F0E6", INK = "#1C1B19", FAINT_L = "#E3DACA", FAINT_D = "#2B2925";
// pirámide de base triangular con una cara mirando de frente en reposo
var H = 1.73, ROT0 = Math.PI/3, CAM = 6;
var T = 12, SPIN = Math.PI*2/6;              // una vuelta cada 6 s, siempre igual
var FACES = [[2, 0, "logo"], [0, 1, "lisa"], [1, 2, "rayas"]];
var STRIPES = 6, GAP = 0.34;

function mod(a, n){ return ((a % n) + n) % n; }
function lerp(a, b, u){ return [a[0] + (b[0]-a[0])*u, a[1] + (b[1]-a[1])*u, a[2] + (b[2]-a[2])*u]; }

window.PeakAnim = function(cv, o){
  o = o || {};
  prep();
  var ctx = cv.getContext("2d");
  var pattern = o.pattern || "cuadricula", dark = !!(o.dark || o.darkFirst);
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

  function pj(p, cx, cy, k){ var f = CAM/(CAM - p[2]); return [cx + p[0]*f*k, cy - (p[1] - H/2)*f*k]; }
  function tri(a, b, c){ ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill(); }
  function quad(a, b, c, d){ ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); }

  // montaña 3D: centro (cx, cy), k = radio de la base en px, th = giro
  function pyramid(cx, cy, k, th, fg, bg){
    var v = [], i;
    for (i = 0; i < 3; i++){ var a = ROT0 + th + i*Math.PI*2/3; v.push([Math.sin(a), 0, Math.cos(a)]); }
    var A = [0, H, 0], pA = pj(A, cx, cy, k);
    for (i = 0; i < 3; i++){
      var F = FACES[i], B = v[F[0]], C = v[F[1]], pB = pj(B, cx, cy, k), pC = pj(C, cx, cy, k);
      if ((pB[0]-pA[0])*(pC[1]-pA[1]) - (pB[1]-pA[1])*(pC[0]-pA[0]) >= 0) continue;   // de espaldas
      ctx.fillStyle = fg;
      if (F[2] === "logo"){
        // el logo 2D pegado a la cara: (450,0) cima, (0,900) y (900,900) base
        var a1 = (pC[0]-pB[0])/900, b1 = (pC[1]-pB[1])/900;
        var c1 = ((pB[0]+pC[0])/2 - pA[0])/900, d1 = ((pB[1]+pC[1])/2 - pA[1])/900;
        ctx.save(); ctx.transform(a1, b1, c1, d1, pA[0] - 450*a1, pA[1] - 450*b1); ctx.fill(markPath); ctx.restore();
        continue;
      }
      tri(pA, pB, pC);
      if (F[2] !== "rayas") continue;
      ctx.fillStyle = bg;
      for (var j = 0; j < STRIPES; j++){
        var t0 = (j + 0.5)/STRIPES - GAP/STRIPES/2, t1 = t0 + GAP/STRIPES;
        var P0 = lerp(B, C, t0), P1 = lerp(B, C, t1), Q0 = lerp(B, A, t0), Q1 = lerp(B, A, t1);
        quad(pj(P0, cx, cy, k), pj(Q0, cx, cy, k), pj(Q1, cx, cy, k), pj(P1, cx, cy, k));
      }
    }
  }
  // tamaño de la base para que la montaña quepa en un hueco de ancho w
  function kFor(w){ return w/(1.732*CAM/(CAM - 0.5)); }

  // PEAK. completo con la A en 3D; (cx, cy) centro, w ancho total
  function wordmark(cx, cy, w, th, fg, bg){
    var s = w/(WM_X1 - WM_X0), x0 = cx - w/2;
    ctx.fillStyle = fg;
    ctx.save(); ctx.translate(x0, cy); ctx.scale(s, s); ctx.translate(-WM_X0, -WM_YC);
    ctx.fill(L.P.p); ctx.fill(L.E.p); ctx.fill(L.K.p); ctx.fill(L["."].p);
    ctx.restore();
    var ax = x0 + ((L.A.x0 + L.A.x1)/2 - WM_X0)*s, aw = (L.A.x1 - L.A.x0)*s;
    pyramid(ax, cy + (390 - WM_YC)*s, kFor(aw), th, fg, bg);
  }

  var DRAW = {
    // tresbolillo de montañas que sube en diagonal
    cuadricula: function(fg, bg){
      var cw = W/4.2, ch = cw*0.9, k = cw*0.27, u = mod(t/T, 1), shx = u*cw, shy = -u*ch*2;
      var j0 = Math.floor((-ch*2 - shy)/ch), j1 = Math.ceil((Hc + ch*2 - shy)/ch);
      for (var j = j0; j <= j1; j++){
        var off = mod(j, 2)*cw/2, i0 = Math.floor((-cw - shx - off)/cw), i1 = Math.ceil((W + cw - shx - off)/cw);
        for (var i = i0; i <= i1; i++){
          var x = i*cw + off + shx, y = j*ch + shy;
          pyramid(x, y, k, SPIN*t + (x/cw)*0.9 + (y/ch)*0.6, fg, bg);
        }
      }
    },
    // casillas crema y tinta; las filas se deslizan en sentidos opuestos
    ajedrez: function(fg, bg){
      var S = W/4, rows = Math.ceil(Hc/S) + 1, y0 = (Hc - rows*S)/2;
      for (var j = 0; j < rows; j++){
        var dir = j % 2 ? 1 : -1, sh = dir*mod(t/T, 1)*2*S;
        var i0 = Math.floor((-S - sh)/S), i1 = Math.ceil((W + S - sh)/S);
        for (var i = i0; i <= i1; i++){
          var x = i*S + sh, y = y0 + j*S, inv = mod(i + j, 2) === 1;
          ctx.fillStyle = inv ? fg : bg; ctx.fillRect(x - 0.5, y - 0.5, S + 1, S + 1);
          pyramid(x + S/2, y + S/2 + S*0.04, S*0.27, SPIN*t + i*Math.PI + j*Math.PI/3, inv ? bg : fg, inv ? fg : bg);
        }
      }
    },
    // franzas inclinadas de PEAK. que corren en sentidos alternos
    palabras: function(fg, bg){
      var D = Math.hypot(W, Hc), ww = W*0.62, gap = ww*0.2, per = ww + gap, rh = ww*0.36;
      ctx.save(); ctx.translate(W/2, Hc/2); ctx.rotate(-0.3);
      var n = Math.ceil(D/rh/2) + 1;
      for (var j = -n; j <= n; j++){
        var y = j*rh, band = mod(j, 2) === 1, f = band ? bg : fg, b = band ? fg : bg;
        ctx.fillStyle = b; ctx.fillRect(-D/2 - 2, y - rh/2 - 0.5, D + 4, rh + 1);
        var dir = band ? 1 : -1, sh = dir*mod(t/T, 1)*per + mod(j, 3)*per/3;
        var i0 = Math.floor((-D/2 - per - sh)/per), i1 = Math.ceil((D/2 + per - sh)/per);
        for (var i = i0; i <= i1; i++) wordmark(i*per + sh + per/2, y, ww, SPIN*t + j*Math.PI/4, f, b);
      }
      ctx.restore();
    },
    // aros concéntricos alternos que giran en sentidos opuestos
    anillos: function(fg, bg){
      var cx = W/2, cy = Hc/2, D = W*0.19, maxR = Math.hypot(W, Hc)/2 + D, n = Math.ceil(maxR/D);
      for (var r = n; r >= 0; r--){
        ctx.fillStyle = r % 2 ? fg : bg;
        ctx.beginPath(); ctx.arc(cx, cy, (r + 0.5)*D, 0, Math.PI*2); ctx.fill();
      }
      pyramid(cx, cy, D*0.3, SPIN*t, fg, bg);
      for (r = 1; r <= n; r++){
        var cnt = 6*r, dir = r % 2 ? 1 : -1, rot = dir*(t/T)*(Math.PI*2/cnt) + (r % 2 ? 0 : Math.PI/cnt);
        var f = r % 2 ? bg : fg, b = r % 2 ? fg : bg;
        for (var i = 0; i < cnt; i++){
          var a = rot + i*Math.PI*2/cnt;
          pyramid(cx + Math.cos(a)*r*D, cy + Math.sin(a)*r*D, D*0.26, SPIN*t + r*Math.PI/4, f, b);
        }
      }
    },
    // PEAK. grande en el centro sobre montañas suaves de fondo
    logo: function(fg, bg){
      DRAW.cuadricula(dark ? FAINT_D : FAINT_L, bg);
      wordmark(W/2, Hc/2, W*0.8, SPIN*t, fg, bg);
    }
  };

  function step(dt){
    t += dt;
    var fg = dark ? CREAM : INK, bg = dark ? INK : CREAM;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, Hc);
    (DRAW[pattern] || DRAW.cuadricula)(fg, bg);
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
    setPattern: function(p){ pattern = p; },
    setDark: function(v){ dark = !!v; },
    setAccent: function(){},
    setPaused: function(v){ paused = !!v; }
  };
};
window.PeakAnim.patterns = ["cuadricula", "ajedrez", "palabras", "anillos", "logo"];
})();
