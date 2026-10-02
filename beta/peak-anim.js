/* Peak · fondos y animaciones con la montaña del logo
   La montaña se ve siempre plana y del mismo tamaño: el contorno es el del
   logo y nunca cambia; lo que gira son sus tres caras, que pasan por dentro
   (una es el logo 2D tal cual, otra lisa y otra rayada).
   Fondos en bucle: "palabras", "ajedrez", "anillos", "cuadricula", "logo", "tunel".
   Animaciones: "recoge" (las letras se meten en la montaña y queda el icono
   quieto) y "despliega" (del icono sale el logo completo).
   No responde al dedo. Todo se repite exactamente cada 12 s (vídeo en bucle).
   Los trazos son los del logo (sacados de Unbounded, licencia OFL).

   Uso: var a = PeakAnim(canvas, { pattern: "cuadricula", dark: false });
        a.setPattern("tunel");  a.setDark(true);  a.setPaused(true);  a.restart();  a.stop(); */
(function(){
var MARK = "M450 0 0 900 600 900 525 648 538 607 634 900 680 900 561 534 577 481 714 900 760 900 497 94 594 288ZM594 288 794 900 840 900 727 554ZM900 900 824 748 874 900Z";
var L = {
 P:{d:"M494 34Q592 34 662.5 67Q733 100 770 159.5Q807 219 807 300Q807 380 770 440Q733 500 662.5 533Q592 566 494 566H173V382H479Q523 382 547.5 360Q572 338 572 300Q572 260 547.5 239Q523 218 479 218H193L298 112V784H65V34Z",x0:65,x1:807},
 E:{d:"M1507 327V491H950V327ZM1109 409 1062 699 971 598H1542V784H831L887 409L831 34H1537V220H971L1062 119Z",x0:831,x1:1542},
 K:{d:"M2446 784V34H2677V601L2617 552L3016 34H3260L2657 784ZM2805 433 2976 295 3271 784H3007Z",x0:2446,x1:3271},
 ".":{d:"M3420 795Q3385 795 3356 778.5Q3327 762 3310.5 733Q3294 704 3294 669Q3294 633 3310.5 604.5Q3327 576 3356 559.5Q3385 543 3420 543Q3456 543 3484.5 559.5Q3513 576 3529.5 604.5Q3546 633 3546 669Q3546 704 3529.5 733Q3513 762 3484.5 778.5Q3456 795 3420 795Z",x0:3294,x1:3546}
};
var LETTERS = ["P", "E", "K", "."];
var markPath = null;
function prep(){ if (markPath) return; markPath = new Path2D(MARK); for (var k in L) L[k].p = new Path2D(L[k].d); }
// caja del wordmark (unidades de fuente) y hueco de la A
var WM_X0 = 65, WM_X1 = 3546, WM_YC = 395, A_X0 = 1564, A_X1 = 2421, A_Y0 = -4, A_Y1 = 784;

var CREAM = "#F5F0E6", INK = "#1C1B19", FAINT_L = "#E3DACA", FAINT_D = "#2B2925";
var T = 12, SPIN = Math.PI*2/6;              // una vuelta cada 6 s, siempre igual
var ROT0 = Math.PI/3;                        // a 0° la cara del logo mira de frente
var FACES = [[2, 0, "logo"], [0, 1, "lisa"], [1, 2, "rayas"]];
var STRIPES = 6, GAP = 0.34;

function mod(a, n){ return ((a % n) + n) % n; }
function clamp(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
function easeIO(x){ x = clamp(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; }
function easeBack(x){ x = clamp(x); var c = 1.6; return 1 + (c + 1)*Math.pow(x - 1, 3) + c*Math.pow(x - 1, 2); }
function mix(a, b, u){ return a + (b - a)*u; }

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

  function tri(a, b, c){ ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill(); }
  function quad(a, b, c, d){ ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); }
  function l2(a, b, u){ return [a[0] + (b[0]-a[0])*u, a[1] + (b[1]-a[1])*u]; }

  // montaña plana: contorno fijo (cima arriba al centro, base de ancho w y alto h);
  // por dentro pasan las tres caras según el giro th
  function mountain(cx, cy, w, h, th, fg, bg){
    var ang = [], xs = [], i;
    for (i = 0; i < 3; i++){ ang.push(ROT0 + th + i*Math.PI*2/3); xs.push(Math.sin(ang[i])); }
    var vis = [], lo = 9, hi = -9;
    for (i = 0; i < 3; i++){
      var F = FACES[i];
      if (Math.cos(ang[F[0]] + Math.PI/3) <= 1e-6) continue;   // cara de espaldas
      vis.push(F);
      lo = Math.min(lo, xs[F[0]], xs[F[1]]); hi = Math.max(hi, xs[F[0]], xs[F[1]]);
    }
    var span = hi - lo || 1, A = [cx, cy - h/2], by = cy + h/2;
    function bx(x){ return [cx - w/2 + (x - lo)/span*w, by]; }
    for (i = 0; i < vis.length; i++){
      var G = vis[i], B = bx(xs[G[0]]), C = bx(xs[G[1]]);
      if (C[0] - B[0] < 0.3) continue;
      ctx.fillStyle = fg;
      if (G[2] === "logo"){
        // el logo 2D pegado a la cara: (450,0) cima, (0,900) y (900,900) base
        var a1 = (C[0]-B[0])/900, c1 = ((B[0]+C[0])/2 - A[0])/900, d1 = (by - A[1])/900;
        ctx.save(); ctx.transform(a1, 0, c1, d1, A[0] - 450*a1, A[1]); ctx.fill(markPath); ctx.restore();
        continue;
      }
      tri(A, B, C);
      if (G[2] !== "rayas") continue;
      ctx.fillStyle = bg;
      for (var j = 0; j < STRIPES; j++){
        var t0 = (j + 0.5)/STRIPES - GAP/STRIPES/2, t1 = t0 + GAP/STRIPES;
        quad(l2(B, C, t0), l2(B, A, t0), l2(B, A, t1), l2(B, C, t1));
      }
    }
  }

  // PEAK. completo; p[i] = cuánto se ha metido cada letra en la montaña (0 fuera, 1 dentro)
  function wordmark(cx, cy, w, th, fg, bg, p, aDx, aScale){
    var s = w/(WM_X1 - WM_X0), ox = cx - w/2 - WM_X0*s, ac = (A_X0 + A_X1)/2;
    p = p || [0, 0, 0, 0]; aDx = aDx || 0; aScale = aScale || 1;
    ctx.fillStyle = fg;
    for (var i = 0; i < 4; i++){
      var g = L[LETTERS[i]], u = p[i];
      if (u >= 0.999) continue;
      var gc = (g.x0 + g.x1)/2, x = mix(gc, ac, u), k = 1 - 0.8*u;
      ctx.save(); ctx.translate(ox + x*s + aDx*u, cy); ctx.scale(s*k, s*k); ctx.translate(-gc, -WM_YC); ctx.fill(g.p); ctx.restore();
    }
    var aw = (A_X1 - A_X0)*s*aScale, ah = (A_Y1 - A_Y0)*s*aScale;
    mountain(ox + ac*s + aDx, cy + ((A_Y0 + A_Y1)/2 - WM_YC)*s*aScale, aw, ah, th, fg, bg);
  }

  // ancho del logo grande centrado
  function bigW(){ return Math.min(W*0.84, Hc*1.1); }

  var DRAW = {
    cuadricula: function(fg, bg){
      var cw = W/4.2, ch = cw*0.9, m = cw*0.5, u = mod(t/T, 1), shx = u*cw, shy = -u*ch*2;
      var j0 = Math.floor((-ch*2 - shy)/ch), j1 = Math.ceil((Hc + ch*2 - shy)/ch);
      for (var j = j0; j <= j1; j++){
        var off = mod(j, 2)*cw/2, i0 = Math.floor((-cw - shx - off)/cw), i1 = Math.ceil((W + cw - shx - off)/cw);
        for (var i = i0; i <= i1; i++){
          var x = i*cw + off + shx, y = j*ch + shy;
          mountain(x, y, m, m, SPIN*t + (x/cw)*0.9 + (y/ch)*0.6, fg, bg);
        }
      }
    },
    ajedrez: function(fg, bg){
      var S = W/4, rows = Math.ceil(Hc/S) + 1, y0 = (Hc - rows*S)/2;
      for (var j = 0; j < rows; j++){
        var dir = j % 2 ? 1 : -1, sh = dir*mod(t/T, 1)*2*S;
        var i0 = Math.floor((-S - sh)/S), i1 = Math.ceil((W + S - sh)/S);
        for (var i = i0; i <= i1; i++){
          var x = i*S + sh, y = y0 + j*S, inv = mod(i + j, 2) === 1;
          ctx.fillStyle = inv ? fg : bg; ctx.fillRect(x - 0.5, y - 0.5, S + 1, S + 1);
          mountain(x + S/2, y + S/2, S*0.52, S*0.52, SPIN*t + i*Math.PI + j*Math.PI/3, inv ? bg : fg, inv ? fg : bg);
        }
      }
    },
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
    anillos: function(fg, bg){
      var cx = W/2, cy = Hc/2, D = W*0.19, maxR = Math.hypot(W, Hc)/2 + D, n = Math.ceil(maxR/D);
      for (var r = n; r >= 0; r--){
        ctx.fillStyle = r % 2 ? fg : bg;
        ctx.beginPath(); ctx.arc(cx, cy, (r + 0.5)*D, 0, Math.PI*2); ctx.fill();
      }
      mountain(cx, cy, D*0.62, D*0.62, SPIN*t, fg, bg);
      for (r = 1; r <= n; r++){
        var cnt = 6*r, dir = r % 2 ? 1 : -1, rot = dir*(t/T)*(Math.PI*2/cnt) + (r % 2 ? 0 : Math.PI/cnt);
        var f = r % 2 ? bg : fg, b = r % 2 ? fg : bg;
        for (var i = 0; i < cnt; i++){
          var a = rot + i*Math.PI*2/cnt;
          mountain(cx + Math.cos(a)*r*D, cy + Math.sin(a)*r*D, D*0.5, D*0.5, SPIN*t + r*Math.PI/4, f, b);
        }
      }
    },
    logo: function(fg, bg){
      DRAW.cuadricula(dark ? FAINT_D : FAINT_L, bg);
      wordmark(W/2, Hc/2, bigW(), SPIN*t, fg, bg);
    },
    // túnel: el logo de la montaña repetido hacia dentro, acercándose sin parar
    tunel: function(fg, bg){
      var cx = W/2, cy = Hc/2, S0 = Math.min(W, Hc)*0.05, R = 1.42, u = mod(t/1.5, 4);
      var D = Math.hypot(W, Hc), kMax = Math.ceil(Math.log(D*2.6/S0)/Math.log(R)), kMin = -4;
      for (var k = kMax; k >= kMin; k--){
        var size = S0*Math.pow(R, k + u);
        if (size < 2) continue;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate((k + u)*0.04 + Math.PI*2*t/T);
        ctx.scale(size/900, size/900); ctx.translate(-450, -622);
        ctx.fillStyle = mod(k, 2) ? fg : bg;
        // triángulos lisos alternos; uno de cada cuatro es el logo con sus rayas
        if (mod(k, 4) === 1) ctx.fill(markPath);
        else { ctx.beginPath(); ctx.moveTo(450, 0); ctx.lineTo(900, 900); ctx.lineTo(0, 900); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      }
    },
    // las letras se meten en la montaña y queda el icono solo, quieto
    recoge: function(fg, bg){ seq(fg, bg, false); },
    // del icono quieto sale el logo completo
    despliega: function(fg, bg){ seq(fg, bg, true); }
  };

  // secuencia de 6 s: logo completo girando → letras dentro → icono grande quieto
  // (despliega es la misma al revés)
  function seq(fg, bg, back){
    var P = 6, tau = mod(t, P), x = back ? P - tau : tau;
    var w = bigW(), s = w/(WM_X1 - WM_X0), ac = (A_X0 + A_X1)/2;
    var aDxEnd = W/2 - (W/2 - w/2 - WM_X0*s + ac*s);       // lo que se mueve la A hasta el centro
    var order = [0.1, 0, 0, 0.1];                           // E y K entran antes que P y el punto
    var p = [], i;
    for (i = 0; i < 4; i++){
      var q = (x - 1.0 - order[i])/1.0;
      p.push(back ? 1 - easeBack(1 - clamp(q)) : easeIO(q));
    }
    var m = easeIO((x - 2.0)/1.1);
    // giro: constante y frenando hasta quedar de frente justo cuando llega al centro
    var t1 = 2.0, d = 1.1, end = Math.ceil((SPIN*(t1 + d/2))/(Math.PI*2))*Math.PI*2, th0 = end - SPIN*(t1 + d/2);
    var th = x < t1 ? th0 + SPIN*x : x < t1 + d ? th0 + SPIN*t1 + SPIN*(x - t1) - SPIN*(x - t1)*(x - t1)/(2*d) : end;
    if (back) th = -th;
    ctx.save();
    var fade = Math.min(clamp(tau/0.35), clamp((P - tau)/0.35));
    ctx.globalAlpha = fade;
    wordmark(W/2, Hc/2, w, th, fg, bg, p, aDxEnd*m, mix(1, 3.2, m));
    ctx.restore();
  }

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
    restart: function(){ t = 0; },
    setAccent: function(){},
    setPaused: function(v){ paused = !!v; }
  };
};
window.PeakAnim.patterns = ["palabras", "ajedrez", "anillos", "cuadricula", "logo", "tunel", "recoge", "despliega"];
})();
