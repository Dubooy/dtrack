/* Peak · animación del logo repetido
   Filas de PEAK. que se deslizan en sentidos opuestos, alternando crema y tinta.
   Cada letra cambia de ancho y alto siguiendo una ola, la montaña de la A gira
   en 3D y todo se hincha alrededor del dedo (o de un "dedo fantasma" si nadie toca).
   Los trazos son los del logo (sacados de Unbounded, licencia OFL).

   Uso: var a = PeakAnim(canvas, { rows: 11, interactive: true, darkFirst: false });
        a.stop();  a.setAccent(true);  a.setPaused(true); */
(function(){
var L = {
 P:{d:"M494 34Q592 34 662.5 67Q733 100 770 159.5Q807 219 807 300Q807 380 770 440Q733 500 662.5 533Q592 566 494 566H173V382H479Q523 382 547.5 360Q572 338 572 300Q572 260 547.5 239Q523 218 479 218H193L298 112V784H65V34Z",x0:65,x1:807},
 E:{d:"M1507 327V491H950V327ZM1109 409 1062 699 971 598H1542V784H831L887 409L831 34H1537V220H971L1062 119Z",x0:831,x1:1542},
 A:{d:"M2092.1 485.8 2082.6 513.7 2183.0 784.0 2213.6 784.0 2097.3 470.7 2119.4 405.8 2107.5 440.7 2235.0 784.0 2265.6 784.0 2092.3 317.3 1994.0 -4.0 1564.0 784.0 2137.3 784.0 2161.6 784.0 2072.4 543.7ZM2091.1 174.0 1995.2 -1.8 2287.0 784.0 2317.6 784.0ZM2253.8 472.2 2157.9 296.3 2339.0 784.0 2369.6 784.0ZM2416.6 770.4 2320.6 594.5 2391.0 784.0 2421.6 784.0Z",x0:1564,x1:2421},
 K:{d:"M2446 784V34H2677V601L2617 552L3016 34H3260L2657 784ZM2805 433 2976 295 3271 784H3007Z",x0:2446,x1:3271},
 ".":{d:"M3420 795Q3385 795 3356 778.5Q3327 762 3310.5 733Q3294 704 3294 669Q3294 633 3310.5 604.5Q3327 576 3356 559.5Q3385 543 3420 543Q3456 543 3484.5 559.5Q3513 576 3529.5 604.5Q3546 633 3546 669Q3546 704 3529.5 733Q3513 762 3484.5 778.5Q3456 795 3420 795Z",x0:3294,x1:3546}
};
var ready = false;
function prep(){ if(ready) return; for (var k in L){ L[k].p = new Path2D(L[k].d); L[k].w = L[k].x1 - L[k].x0; } ready = true; }
var SEQ = ["P","E","A","K","."];
var YH = 806, YC = 395;
var CREAM = "#F5F0E6", INK = "#1C1B19", GREEN = "#0E8A6E";
var SIDE_ON_CREAM = "#56524A", SIDE_ON_INK = "#CFC6B4", GREEN_SIDE = "#08503F";
function ease(x){ return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; }
function mod(a, n){ return ((a % n) + n) % n; }

window.PeakAnim = function(cv, o){
  o = o || {};
  prep();
  var ctx = cv.getContext("2d");
  var ROWS = o.rows || 11, speed = o.speed || 1, parity = o.darkFirst ? 0 : 1;
  var W = 0, H = 0, dpr = 1, alive = true, accent = !!o.accent, paused = false;
  var t = o.t0 || 0, prev = 0;
  function resize(){
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr || 2.5);
    W = r.width; H = r.height;
    cv.width = Math.max(1, Math.round(W*dpr)); cv.height = Math.max(1, Math.round(H*dpr));
  }
  var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(cv); else window.addEventListener("resize", resize);
  resize();

  // Todo se repite exactamente cada T segundos (bucle perfecto para vídeo):
  // las ondas usan múltiplos de 2π/T y cada fila avanza 10 o 20 letras por ciclo.
  var T = 12, F = Math.PI*2/T, KP = Math.PI*2/10;
  var rows = [];
  for (var r = 0; r < ROWS; r++) rows.push({ u: r*2.3 + 3, dir: r % 2 ? -1 : 1, rate: (r % 3 === 1 ? 20 : 10)/T, cy: 0, h: 0, y: 0, wt: 1 });

  var ptr = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0, down: false, last: -1e9 };
  function move(e){
    var b = cv.getBoundingClientRect();
    ptr.tx = e.clientX - b.left; ptr.ty = e.clientY - b.top; ptr.last = performance.now();
  }
  var on = [];
  function listen(el, ev, fn){ el.addEventListener(ev, fn); on.push([el, ev, fn]); }
  if (o.interactive){
    listen(cv, "pointerdown", function(e){ ptr.down = true; try{ cv.setPointerCapture(e.pointerId); }catch(_){} move(e); });
    listen(cv, "pointermove", function(e){ if (ptr.down || e.pointerType === "mouse") move(e); });
    listen(cv, "pointerup", function(){ ptr.down = false; });
    listen(cv, "pointercancel", function(){ ptr.down = false; });
    listen(cv, "pointerleave", function(){ if (!ptr.down) ptr.last = -1e9; });
  }

  function letterFx(k, r){
    var a = Math.sin(k*KP + t*2*F*(r%2 ? 1 : -1) + r*0.8);
    var b = Math.sin(k*2*KP - t*F + r*1.7);
    return 0.62 + 0.5*(0.5 + 0.5*a) + 0.18*b;
  }
  function letterFy(k, r){ return 0.62 + 0.38*(0.5 + 0.5*Math.sin(k*KP + 2.1 - t*2*F + r*0.55)); }
  function bulge(cx, cy){
    var R = Math.min(W, H)*0.34, dx = cx - ptr.x, dy = cy - ptr.y;
    return ptr.s*Math.exp(-(dx*dx + dy*dy)/(R*R));
  }
  function spinAngle(k, r){
    var P = 6, off = r*0.21 + k*0.6, f = mod((t - off)/P, 1), SP = 0.32;
    return f < SP ? ease(f/SP)*Math.PI*2 : 0;
  }
  function adv(k, r, s, xLeft, cy){
    var ch = SEQ[mod(k, 5)], g = L[ch];
    var b = bulge(xLeft + g.w*s*0.5, cy);
    var fx = letterFx(k, r)*(1 + 1.3*b);
    return { ch: ch, g: g, w: g.w*s*fx, gap: (ch === "." ? 170 : 26)*s, b: b, fx: fx };
  }

  function drawMountain(g, cx, cy, sx, sy, th, fg, dark){
    var c = Math.cos(th), sn = Math.sin(th);
    var side = accent ? GREEN_SIDE : (dark ? SIDE_ON_INK : SIDE_ON_CREAM);
    var depth = g.w*sx*0.16*sn, ox = g.x0 + g.w/2 - 2, N = 9, i;
    if (Math.abs(sn) > 0.02){
      ctx.fillStyle = side;
      for (i = N; i >= 1; i--){
        ctx.save(); ctx.translate(cx + depth*i/N, cy); ctx.scale(sx*c, sy); ctx.translate(-ox, -YC); ctx.fill(g.p); ctx.restore();
      }
    }
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(sx*(Math.abs(c) < 0.04 ? 0.04*(c < 0 ? -1 : 1) : c), sy); ctx.translate(-ox, -YC);
    ctx.fillStyle = accent ? GREEN : fg;
    ctx.globalAlpha = 0.75 + 0.25*Math.abs(c);
    ctx.fill(g.p);
    ctx.restore();
  }

  function drawRow(row, r){
    var dark = r % 2 === parity, fg = dark ? CREAM : INK;
    ctx.fillStyle = dark ? INK : CREAM;
    ctx.fillRect(0, row.y - 0.5, W, row.h + 1);
    var s = row.h*0.74/YH, a;
    // u = índice (con decimales) de la letra que asoma por la izquierda
    var u = row.u + row.dir*row.rate*t, k = Math.floor(u);
    a = adv(k, r, s, -100*s, row.cy);
    var x = -(u - k)*(a.w + a.gap);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, row.y, W, row.h); ctx.clip();
    while (x < W){
      a = adv(k, r, s, x, row.cy);
      var fy = Math.min(1.12, letterFy(k, r) + a.b*0.9);
      var sy = s*fy, sx = s*a.fx, cx = x + a.w/2;
      if (a.ch === "A") drawMountain(a.g, cx, row.cy, sx, sy, spinAngle(k, r), fg, dark);
      else {
        ctx.save(); ctx.translate(cx, row.cy); ctx.scale(sx, sy); ctx.translate(-(a.g.x0 + a.g.w/2), -YC);
        ctx.fillStyle = (a.ch === "." && accent) ? GREEN : fg;
        ctx.fill(a.g.p); ctx.restore();
      }
      x += a.w + a.gap; k++;
    }
    ctx.restore();
  }

  // dibuja un fotograma avanzando dt segundos (también sirve para grabar vídeo)
  function step(dt){
    t += dt;
    var idle = performance.now() - ptr.last > 1800 && !ptr.down;
    if (idle || o.fixedTime){
      ptr.tx = W*(0.5 + 0.36*Math.sin(t*F)); ptr.ty = H*(0.5 + 0.38*Math.sin(t*2*F + 1.3)); ptr.ts = 0.7;
    } else ptr.ts = 1.25;
    var lk = 1 - Math.pow(0.0015, dt || 0.016);
    ptr.x += (ptr.tx - ptr.x)*lk; ptr.y += (ptr.ty - ptr.y)*lk; ptr.s += (ptr.ts - ptr.s)*lk*0.6;
    var sum = 0, R = Math.min(W, H)*0.34, r, row, dy, y = 0;
    for (r = 0; r < ROWS; r++){
      row = rows[r]; dy = (row.cy || H*(r + .5)/ROWS) - ptr.y;
      row.wt = 1 + 0.42*Math.sin(t*F + r*0.95) + 1.4*ptr.s*Math.exp(-dy*dy/(R*R));
      sum += row.wt;
    }
    for (r = 0; r < ROWS; r++){ row = rows[r]; row.h = row.wt/sum*H; row.cy = y + row.h/2; row.y = y; y += row.h; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (r = 0; r < ROWS; r++) drawRow(rows[r], r);
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
    stop: function(){ alive = false; if (ro) ro.disconnect(); on.forEach(function(x){ x[0].removeEventListener(x[1], x[2]); }); },
    setAccent: function(v){ accent = !!v; },
    setPaused: function(v){ paused = !!v; }
  };
};
})();
