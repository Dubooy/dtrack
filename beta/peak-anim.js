/* Peak · fondos y animaciones con la montaña del logo
   La montaña se ve siempre plana y del mismo tamaño: el contorno es el del
   logo y nunca cambia; lo que gira son sus tres caras, que pasan por dentro
   (una es el logo 2D tal cual, otra lisa y otra rayada).
   Fondos en bucle: "palabras", "ajedrez", "cuadricula", "columnas", "logo".
   Animaciones: "salto" (las letras saltan en ola), "construye" (montañas
   pequeñas forman una grande), "recoge" (las letras se meten en la montaña y queda el icono
   quieto) y "despliega" (del icono sale el logo completo).
   No responde al dedo. Todo se repite exactamente cada 12 s (vídeo en bucle).
   Los trazos son los del logo (sacados de Unbounded, licencia OFL).

   Uso: var a = PeakAnim(canvas, { pattern: "cuadricula", dark: false });
        a.setPattern("salto");  a.setDark(true);  a.setPaused(true);  a.restart();  a.stop(); */
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
var ORDER = ["logo", "rayas", "lisa"];       // a 0° se ve la cara del logo de frente
var STRIPES = 6, GAP = 0.34;

function mod(a, n){ return ((a % n) + n) % n; }
function clamp(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
function easeIO(x){ x = clamp(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; }
function easeOutBack(x, c){ x = clamp(x); return 1 + (c + 1)*Math.pow(x - 1, 3) + c*Math.pow(x - 1, 2); }
// arranca suave pero enseguida va rápida y luego frena larga hasta pararse (sin golpe)
function kick(x){ x = clamp(x); return 1 - Math.pow(1 - x, 4)*(1 + 4*x); }
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

  // montaña plana: contorno fijo (cima arriba al centro, base de ancho w y alto h).
  // Las caras pasan por dentro como en una cinta, a ritmo constante: cada tercio
  // de vuelta la cara siguiente entra por la izquierda y empuja a la actual.
  function mountain(cx, cy, w, h, th, fg, bg){
    var n = th/(Math.PI*2/3), k = Math.floor(n), f = n - k;
    var cur = ORDER[mod(k, 3)], nxt = ORDER[mod(k + 1, 3)];
    var A = [cx, cy - h/2], by = cy + h/2, x0 = cx - w/2, xr = x0 + f*w;
    face(nxt, A, [x0, by], [xr, by], fg, bg);
    face(cur, A, [xr, by], [x0 + w, by], fg, bg);
  }
  function face(kind, A, B, C, fg, bg){
    if (C[0] - B[0] < 0.3) return;
    ctx.fillStyle = fg;
    if (kind === "logo"){
      // el logo 2D pegado a la cara: (450,0) cima, (0,900) y (900,900) base
      var a1 = (C[0]-B[0])/900, c1 = ((B[0]+C[0])/2 - A[0])/900, d1 = (B[1] - A[1])/900;
      ctx.save(); ctx.transform(a1, 0, c1, d1, A[0] - 450*a1, A[1]); ctx.fill(markPath); ctx.restore();
      return;
    }
    tri(A, B, C);
    if (kind !== "rayas") return;
    ctx.fillStyle = bg;
    for (var j = 0; j < STRIPES; j++){
      var t0 = (j + 0.5)/STRIPES - GAP/STRIPES/2, t1 = t0 + GAP/STRIPES;
      quad(l2(B, C, t0), l2(B, A, t0), l2(B, A, t1), l2(B, C, t1));
    }
  }

  // PEAK. completo; p[i] = cuánto se ha metido cada letra en la montaña (0 fuera, 1 dentro)
  function wordmark(cx, cy, w, th, fg, bg, p, aDx, aScale, dy, dx){
    var s = w/(WM_X1 - WM_X0), ox = cx - w/2 - WM_X0*s, ac = (A_X0 + A_X1)/2;
    p = p || [0, 0, 0, 0]; aDx = aDx || 0; aScale = aScale || 1; dy = dy || [0, 0, 0, 0, 0]; dx = dx || [0, 0, 0, 0, 0];
    ctx.fillStyle = fg;
    for (var i = 0; i < 4; i++){
      var g = L[LETTERS[i]], u = p[i];
      if (u >= 0.999) continue;
      var gc = (g.x0 + g.x1)/2, x = mix(gc, ac, u), k = 1 - 0.8*u;
      ctx.save(); ctx.translate(ox + (x + dx[i < 2 ? i : i + 1])*s + aDx*u, cy + dy[i < 2 ? i : i + 1]*s); ctx.scale(s*k, s*k); ctx.translate(-gc, -WM_YC); ctx.fill(g.p); ctx.restore();
    }
    var aw = (A_X1 - A_X0)*s*aScale, ah = (A_Y1 - A_Y0)*s*aScale;
    mountain(ox + (ac + dx[2])*s + aDx, cy + dy[2]*s + ((A_Y0 + A_Y1)/2 - WM_YC)*s*aScale, aw, ah, th, fg, bg);
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
    // columnas crema y tinta; las montañas suben y bajan en sentidos alternos
    columnas: function(fg, bg){
      var C = 4, cw = W/C, sp = cw*1.08, m = cw*0.56, u = mod(t/T, 1);
      for (var c = 0; c < C; c++){
        var inv = c % 2 === 1, f = inv ? bg : fg, b = inv ? fg : bg, dir = inv ? 1 : -1, sh = dir*u*sp*2;
        ctx.fillStyle = b; ctx.fillRect(c*cw - 0.5, 0, cw + 1, Hc);
        var i0 = Math.floor((-sp - sh)/sp), i1 = Math.ceil((Hc + sp - sh)/sp);
        for (var i = i0; i <= i1; i++) mountain(c*cw + cw/2, i*sp + sh + sp/2, m, m, SPIN*t + i*Math.PI + c*Math.PI/2, f, b);
      }
    },
    logo: function(fg, bg){
      DRAW.cuadricula(dark ? FAINT_D : FAINT_L, bg);
      wordmark(W/2, Hc/2, bigW(), SPIN*t, fg, bg);
    },
    // PEAK. con las letras saltando en ola; la A da una vuelta en su salto
    salto: function(fg, bg){
      var P = 3, x = mod(t, P), dy = [], th = 0;
      for (var i = 0; i < 5; i++){
        var q = clamp((x - 0.5 - i*0.14)/0.55);
        dy.push(-Math.sin(q*Math.PI)*300);
        if (i === 2) th = Math.PI*2*q;
      }
      wordmark(W/2, Hc/2, bigW(), th, fg, bg, null, 0, 1, dy);
    },
    // cada vuelta de la A lanza ecos del logo hacia arriba y hacia abajo
    eco: function(fg, bg){
      var P = 3, x = mod(t, P), H = kick((x - 0.3)/2.2), th = Math.PI*2*H;
      var w = bigW()*0.8, gap = w*0.38, a = easeIO((H - 0.25)/0.35)*(1 - easeIO((H - 0.8)/0.2));
      ctx.save();
      for (var k = 3; k >= 1; k--){
        ctx.globalAlpha = a*0.5/k;
        wordmark(W/2, Hc/2 - k*gap*H, w, th, fg, bg);
        wordmark(W/2, Hc/2 + k*gap*H, w, th, fg, bg);
      }
      ctx.restore();
      wordmark(W/2, Hc/2, w, th, fg, bg);
    },
    // las letras llegan desde los lados empujadas por la vuelta de la A y luego se van
    llega: function(fg, bg){
      var P = 6, x = mod(t, P), w = bigW(), s = w/(WM_X1 - WM_X0);
      var D = (W/2 + w/2)/s + 200, side = [-1, -1, 0, 1, 1], o = [0, 0.12, 0, 0.12, 0];
      var dx = [], th, i;
      if (x < 3.3){
        for (i = 0; i < 5; i++) dx.push(side[i]*D*(1 - kick((x - 0.3 - o[i])/2.2)));
        th = Math.PI*2*kick((x - 0.3)/2.4);
      } else {
        // salida: al revés, arranca suave y se va acelerando
        for (i = 0; i < 5; i++) dx.push(side[i]*D*(1 - kick(1 - (x - 3.6 - (0.12 - o[i]))/2.2)));
        th = Math.PI*2*(2 - kick(1 - (x - 3.6)/2.3));
      }
      wordmark(W/2, Hc/2, w, th, fg, bg, null, 0, 1, null, dx);
    },
    // montañas pequeñas caen y forman una montaña grande; luego giran en ola
    construye: function(fg, bg){
      var P = 6, x = mod(t, P), N = 5, bw = Math.min(W*0.8, Hc*0.55), m = bw/N, top = Hc/2 - bw/2;
      ctx.save();
      ctx.globalAlpha = Math.min(clamp(x/0.3), clamp((P - x)/0.35));
      var n = 0;
      for (var r = N - 1; r >= 0; r--){
        for (var j = 0; j <= r; j++, n++){
          var cx = W/2 + (j - r/2)*m, cy = top + r*m + m/2;
          var q = (x - 0.3 - n*0.07)/0.55;
          if (q <= 0) continue;
          var drop = (1 - easeBack(q))*(cy + m);
          var th = Math.PI*2*clamp((x - 2.4 - (N - 1 - r)*0.15 - j*0.05)/1.2);
          mountain(cx, cy - drop, m*0.98, m*0.98, th, fg, bg);
        }
      }
      ctx.restore();
    },
    // las letras se meten en la montaña y queda el icono solo, quieto
    recoge: function(fg, bg){ seq(fg, bg, false); },
    // del icono quieto sale el logo completo
    // del icono quieto sale el logo completo; la vuelta arranca muy lenta, acelera
    // y al final se pasa un poco de largo y vuelve a su sitio, como con inercia
    despliega: function(fg, bg){ seq(fg, bg, true, "acelera"); },
    // igual, pero la vuelta arranca rápida y se va frenando hasta quedar de frente
    frena: function(fg, bg){ seq(fg, bg, true, "frena"); }
  };

  // secuencias de 6 s, con la montaña quieta y de frente al empezar y al acabar.
  // Mientras las letras entran o salen da exactamente una vuelta a ritmo constante.
  // recoge: logo → letras dentro → icono grande en el centro
  // despliega: icono grande → baja a su sitio → salen las letras
  function seq(fg, bg, back, curve){
    var P = 6, x = mod(t, P);
    var w = bigW(), s = w/(WM_X1 - WM_X0), ac = (A_X0 + A_X1)/2;
    var aDxEnd = W/2 - (W/2 - w/2 - WM_X0*s + ac*s);       // lo que se mueve la A hasta el centro
    var order = [0.2, 0, 0, 0.2];                           // E y K van antes que P y el punto
    var p = [], m, th, i, t0;
    if (!back){
      t0 = 0.8;
      for (i = 0; i < 4; i++) p.push(easeIO((x - t0 - order[i])/1.2));
      m = easeIO((x - 2.25)/1.0);
    } else if (curve === "frena"){
      // todo cuelga del giro: encoger y salir de las letras van al ritmo de la vuelta
      var H = kick((x - 0.6)/2.4), q = clamp(H/0.45);
      th = Math.PI*2*H;
      m = Math.pow(1 - q, 2);
      for (i = 0; i < 4; i++) p.push(1 - easeOutBack((H - 0.3 - order[i]*0.4)/0.6, 1.2));
    } else {
      t0 = 1.6;
      for (i = 0; i < 4; i++) p.push(1 - easeBack((x - t0 - order[i])/1.2));
      m = 1 - easeIO((x - 0.6)/1.0);
    }
    // una vuelta exacta: en despliega desde que empieza a encogerse hasta que se
    // colocan las letras (con velocidad curva); en recoge, al revés y constante
    var u;
    if (!back) u = clamp((x - 0.8)/2.45);
    else if (curve === "frena") u = th/(Math.PI*2);
    else {
      u = clamp((x - 0.6)/2.7);
      u = easeOutBack(Math.pow(u, 2.6), 1.1);
    }
    th = Math.PI*2*u;
    ctx.save();
    ctx.globalAlpha = Math.min(clamp(x/0.35), clamp((P - x)/0.35));
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
window.PeakAnim.patterns = ["palabras", "ajedrez", "cuadricula", "columnas", "logo", "salto", "eco", "llega", "construye", "recoge", "despliega", "frena"];
})();
