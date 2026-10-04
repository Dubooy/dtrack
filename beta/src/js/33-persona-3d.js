/* ── la persona 3D de los estiramientos ──
   El cuerpo es cuerpo.glb (un modelo con esqueleto; ver cuerpo.LEEME.txt), con
   su piel y su contorno originales. Cada postura son ángulos en grados sobre
   un esqueleto guía invisible; el modelo copia los giros de la guía hueso a hueso.
   La figura va de la postura de partida (A) a la del estiramiento (B) y vuelve,
   en bucle. three.js y el modelo solo se cargan al abrir una rutina.
   Claves: rx/ry/rz el cuerpo entero (rr: girado sobre su propio eje, p. ej. tumbado de lado) · tx/ty/tz el tronco (tx hacia delante, tz hacia su derecha)
   hx/hy/hz la cabeza · aL/aR brazos: [adelante, abrir, girar, codo, rotar]
   pL/pR piernas: [adelante, abrir, girar, rodilla, rotar]. «girar» mueve el brazo o el muslo alrededor del
   eje vertical del tronco; «rotar» lo gira sobre su propio eje (+ = hacia fuera: el antebrazo sube, la espinilla va hacia dentro) · fL/fR tobillos (grados; + = puntas hacia arriba)
   ik: contactos de las manos (ver mqContacto); con s:1 la mano se apoya en el suelo donde cae, y con
   pared:1 en la pared. pared (en la postura): dónde va la pared, { h: hueso, eje:"z"|"x", d: metros } */
var MQ_NEUTRO={ rx:0, ry:0, rz:0, tx:0, ty:0, tz:0, hx:0, hy:0, hz:0, aL:[0,8,0,6], aR:[0,8,0,6], pL:[0,3,0,0], pR:[0,3,0,0], fL:0, fR:0, rr:0, tk:0, dL:0, dR:0 };
function mq(o){ var r={}, k; for(k in MQ_NEUTRO) r[k]=MQ_NEUTRO[k]; for(k in o) r[k]=o[k];
  ["aL","aR","pL","pR"].forEach(function(x){ if(r[x].length<5) r[x]=r[x].concat([0,0,0,0,0].slice(r[x].length)); });
  return r; }
function mqCon(base, o){ var r={}, k; for(k in base) r[k]=base[k]; for(k in o) r[k]=o[k]; return mq(r); }
/* bases: de pie es la neutra; tumbado boca arriba y boca abajo, a cuatro patas, de rodillas y en zancada con una rodilla en el suelo */
var MQ_SUPINO={ rx:-90, aL:[0,14,0,5], aR:[0,14,0,5], fL:-30, fR:-30 };
var MQ_PRONO={ rx:90, fL:-60, fR:-60, aL:[0,14,0,5], aR:[0,14,0,5] };
var MQ_CUATRO={ rx:90, tx:-6, hx:-14, aL:[84,8,0,0], aR:[84,8,0,0], pL:[90,5,0,90], pR:[90,5,0,90], fL:-80, fR:-80, ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } } };
var MQ_RODILLAS={ pL:[0,5,0,90], pR:[0,5,0,90], fL:-80, fR:-80 };
var MQ_CABALLERO={ pR:[100,5,0,95], pL:[-10,5,0,70], fL:-80, fR:0 };
var MQ_NUCA={ L:{ h:"cabeza", o:[.045,.05,-.125], m:[-1,.2,0], n:[0,0,1] }, R:{ h:"cabeza", o:[-.045,.05,-.125], m:[1,.2,0], n:[0,0,1] } };
var MQ_PIES={ L:{ h:"pieL", o:[.02,.03,.08] }, R:{ h:"pieR", o:[-.02,.03,.08] } };
/* cam: desde dónde se mira (grados alrededor de la figura; 0 de frente, 90 de lado) */
var MQ_FIG={
  /* 1. tren superior */
  cuello:{ cam:18, fases:{ aR:[0,.5], dR:[.3,.5], ik:[0,.5], hz:[.5,1] }, A:mq({}), B:mq({ hz:32, aR:[30,130,0,110,40], dR:40, ik:{ R:{ h:"cabeza", o:[-.02,.185,0], m:[1,-.5,0], n:[-.3,-1,0] } } }) },
  barbilla:{ cam:60, fases:{ aR:[0,.45], dR:[.3,.5], ik:[.25,.5], hx:[.5,1], hy:[.5,1] }, arco:{ aR:[0,.45,[-20,25,0,35]] }, A:mq({}), B:mq({ hy:-45, hx:45, aR:[60,110,0,120,40], dR:40, ik:{ R:{ h:"cabeza", o:[-.01,.18,-.065], m:[.4,-.7,-.5], n:[-.2,-.6,.8] } } }) },
  triceps:{ cam:150, fases:{ aR:[0,.6], aL:[.3,1], dL:[.6,1], ik:[.5,1], hx:[.5,1] }, A:mq({}), B:mq({ hx:8, aR:[172,12,0,150], aL:[130,10,-20,110], dL:35, ik:{ L:{ h:"antebrazoR", f:"espalda2", o:[.045,-.08,.075], m:[-.82,.47,-.37], n:[.33,-.25,-.9] } } }) },
  cruzado:{ cam:22, fases:{ aR:[0,.6], aL:[.3,1], dL:[.6,1], ik:[.5,1] }, A:mq({}), B:mq({ aR:[88,0,45,0], aL:[49,42,10,119], dL:45, ik:{ L:{ h:"antebrazoR", f:"espalda2", o:[-.074,-.03,.066], m:[-.85,.55,.31], n:[.26,0,-1] } } }) },
  pecho:{ cam:130, A:mq({ aL:[-30,-4,0,10], aR:[-30,-4,0,10] }), B:mq({ tx:-6, hx:-10, aL:[-50,-12,0,0], aR:[-50,-12,0,0], ik:{ L:{ h:"manoR", f:"cadera", o:[.05,0,0] } } }) },
  pectoral:{ cam:-140, el:14, pared:{ h:"brazoR", eje:"z", d:.06, de:"A", canto:{ h:"brazoR", d:-.14 } }, A:mq({ aR:[-10,90,0,90,90], ik:{ R:{ pared:1, codo:1 } } }), B:mq({ ty:20, aR:[-10,90,-20,90,90], pL:[25,4,0,10], pR:[-12,4,0,0], fR:10, ik:{ R:{ pared:1, codo:1 } } }) },
  aguja:{ cam:-30, el:25, fases:{ ty:[0,1], tx:[0,1], hy:[.1,1], aR:[0,1], dR:[0,1], ik:[0,1] }, A:mqCon(MQ_CUATRO,{}), B:mqCon(MQ_CUATRO,{ ty:75, tx:20, hy:-40, dR:15, aR:[84,8,90,20], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, suave:.03, o:[.55,0,-.1], m:[1,0,0], n:[0,1,0] } } }) },
  /* 2. tronco */
  gato:{ cam:84, arco:{ tx:[0,1,4] }, A:mqCon(MQ_CUATRO,{ rx:108, pL:[108,5,0,90], pR:[108,5,0,90], tx:-52, tk:34, hx:44, aL:[60,8,0,0], aR:[60,8,0,0] }), B:mqCon(MQ_CUATRO,{ rx:70, pL:[70,5,0,90], pR:[70,5,0,90], tx:6, tk:-34, hx:-34, aL:[60,8,0,0], aR:[60,8,0,0] }) },
  camello:{ cam:84, A:mqCon(MQ_RODILLAS,{ aL:[-18,15,0,25], aR:[-18,15,0,25] }), B:mqCon(MQ_RODILLAS,{ pL:[-15,5,0,75], pR:[-15,5,0,75], tx:-70, hx:-40, aL:[-40,10,0,0], aR:[-40,10,0,0], dL:45, dR:45, ik:{ L:{ h:"pieL", f:"cadera", o:[.01,.085,-.07], m:[0,-.3,-1], n:[0,-1,0] }, R:{ h:"pieR", f:"cadera", o:[-.01,.085,-.07], m:[0,-.3,-1], n:[0,-1,0] } } }) },
  nino:{ cam:84, ancla:"piernaL+piernaR", anclaRod:1, A:mq({ alto:.24, rx:5, fL:-80, fR:-80, aL:[25,8,0,30], aR:[25,8,0,30], ikp:{ L:{ rod:[.5,1], tob:[.05,-1] }, R:{ rod:[-.5,1], tob:[-.05,-1] } } }), B:mq({ alto:.32, rx:98, tx:16, hx:40, fL:-80, fR:-80, aL:[165,10,0,25], aR:[165,10,0,25], ik:{ L:{ s:1, suave:.04 }, R:{ s:1, suave:.04 } }, ikp:{ L:{ rod:[.5,1], tob:[.05,-1] }, R:{ rod:[-.5,1], tob:[-.05,-1] } } }) },
  cobra:{ cam:80, A:mqCon(MQ_PRONO,{ hx:-10, aL:[-10,40,0,130], aR:[-10,40,0,130], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } } }), B:mqCon(MQ_PRONO,{ rx:70, tx:-30, hx:-35, aL:[10,8,0,0], aR:[10,8,0,0], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } } }) },
  tspine:{ cam:-60, el:25, A:mqCon(MQ_CUATRO,{ ty:40, hy:15, aR:[30,95,0,130,60], dR:20, ik:{ L:{ s:1, fijo:1 }, R:MQ_NUCA.R } }), B:mqCon(MQ_CUATRO,{ ty:-50, hy:-40, aR:[30,95,0,130,60], dR:20, ik:{ L:{ s:1, fijo:1 }, R:MQ_NUCA.R } }) },
  torsion:{ cam:150, el:55, A:mqCon(MQ_SUPINO,{ aL:[0,88,0,0], aR:[0,88,0,0], pR:[90,4,0,90] }), B:mqCon(MQ_SUPINO,{ rr:80, ty:-80, hy:-40, aL:[0,88,0,0], aR:[0,88,0,0], pR:[90,-25,0,90] }) },
  /* 3. cadera */
  paloma:{ cam:60, el:18, ancla:"manoL+manoR", A:mqCon(MQ_CUATRO,{ ikp:{ R:{ rod:[0,1], tob:[0,-1] }, L:{ rod:[0,-1], tob:[0,-1] } } }), B:mq({ rx:55, tx:-50, hx:-10, alto:.15, aL:[12,12,4,0], aR:[22,19,35,0], pL:[-32,5,0,5], pR:[115,35,15,85,90], fL:-110, fR:6, ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } }, ikp:{ R:{ rod:[-1.6,1], tob:[1,-.45] }, L:{ rod:[0,-1], tob:[0,-1] } } }) },
  gluteo:{ cam:-60, el:25, tc:.45, fases:{ rx:[.3,.7], tx:[.3,.7], hx:[.3,.7] }, A:mqCon(MQ_SUPINO,{ rx:-81, tx:2, hx:-50, aL:[5,10,0,5], aR:[5,10,0,5], pL:[55,6,0,85], pR:[55,6,0,85], fL:-48, fR:-48 }), C:mqCon(MQ_SUPINO,{ rx:-81, tx:2, hx:-50, aL:[60,10,0,40], aR:[60,10,0,40], pL:[55,6,0,85], pR:[80,45,0,90,50], fL:-48, fR:10, ikp:{ R:{ h:"musloL", o:[-.02,-.30,.10] } } }), B:mqCon(MQ_SUPINO,{ rx:-73.5, tx:8, hx:-38, aL:[110,10,0,40], aR:[110,10,0,40], dL:40, dR:40, pL:[110,6,0,90], pR:[113,30,0,90,80], fL:0, fR:10, ikp:{ R:{ h:"musloL", o:[-.02,-.30,.10] } }, ik:{ L:{ h:"piernaL", o:[.06,-.01,.07], m:[-1,0,0], n:[0,0,-1] }, R:{ h:"piernaL", o:[0,-.04,.07], m:[1,0,0], n:[0,0,-1] } } }) },
  mariposa:{ cam:20, el:18, A:mq({ rx:-9, tx:22, pL:[113,48,8,106,55], pR:[113,48,8,106,55], fL:-10, fR:-10, aL:[55,15,0,25], aR:[55,15,0,25], ik:MQ_PIES, ikp:{ L:{ h:"cadera", o:[-.004,-.046,.424] }, R:{ h:"cadera", o:[.004,-.046,.424] } } }), B:mq({ rx:-9, tx:22, pL:[113,48,8,106,55], pR:[113,48,8,106,55], fL:-10, fR:-10, aL:[45,15,0,45], aR:[45,15,0,45], ik:MQ_PIES, ikp:{ L:{ h:"cadera", o:[-.004,-.02,.29] }, R:{ h:"cadera", o:[.004,-.02,.29] } } }) },
  flexor:{ cam:84, ancla:"piernaL", anclaRod:1, A:mqCon(MQ_CABALLERO,{ alto:.396, tx:2, pR:[90,5,0,90], pL:[0,5,0,90], fL:-60, fR:0, aL:[10,25,0,80], aR:[10,25,0,80], ik:{ L:{ h:"cadera", o:[.17,.10,.02] }, R:{ h:"cadera", o:[-.17,.10,.02] } }, ikp:{ L:{ rod:[0,-1], tob:[0,-1] }, R:{ h:"cadera", o:[-.1,-.31,.32] } } }), B:mqCon(MQ_CABALLERO,{ alto:.36, rx:-4, tx:-2, pR:[80,5,0,105], pL:[-15,5,0,90], fL:-60, fR:15, aL:[10,25,0,80], aR:[10,25,0,80], ik:{ L:{ h:"cadera", o:[.17,.10,.02] }, R:{ h:"cadera", o:[-.17,.10,.02] } }, ikp:{ L:{ rod:[0,-1], tob:[0,-1] }, R:{ fijo:1 } } }) },
  cosaco:{ cam:0, ancla:"pieL+pieR", A:mq({ pL:[0,30,0,0,15], pR:[0,30,0,0,15], aL:[30,12,0,10], aR:[30,12,0,10], ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }), B:mq({ alto:.44, tx:12, rx:8, hx:-18, pL:[10,62,0,0,66], pR:[97,32,24,130,9], fL:30, fR:0, aL:[80,8,0,20], aR:[80,8,0,20], ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }) },
  rana:{ cam:120, entrepierna:1, el:30, ancla:"piernaL+piernaR", anclaRod:1, A:mq({ rx:84, tx:-1, hx:-10, alto:.21, aL:[84,3,0,81], aR:[84,3,0,81], fL:-10, fR:-10, ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } }, ikp:{ L:{ rod:[1,0], tob:[0,-1] }, R:{ rod:[-1,0], tob:[0,-1] } } }), B:mq({ rx:82, hx:-10, alto:.18, aL:[107,3,0,80], aR:[107,3,0,80], fL:-10, fR:-10, ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } }, ikp:{ L:{ rod:[1,.37], tob:[0,-1] }, R:{ rod:[-1,.37], tob:[0,-1] } } }) },
  /* 4. muslos */
  cuadriceps:{ cam:84, ancla:"pieL", fases:{ pL:[0,.4], aL:[0,.4], tx:[0,.4], pR:[.2,1], aR:[.25,1], ik:[.4,1], dR:[.6,1], fR:[.25,1], ikp:[.2,.35] }, arco:{ aR:[.25,.75,[0,25,0,0]] }, A:mq({ aL:[5,8,0,10], aR:[5,8,0,10], ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }), B:mq({ tx:6, aL:[22,32,0,35], pL:[0,-6,0,10], pR:[-8,-2,0,135], aR:[-30,10,0,10], dR:45, ik:{ R:{ h:"piernaR", suave:.03, o:[-.01,-.34,.06], m:[1,0,0], n:[0,0,-1] } }, ikp:{ L:{ fijo:1 } } }) },
  sofa:{ cam:84, pared:{ h:"piernaL", eje:"z", d:-.05 }, ancla:"piernaL", anclaRod:1, A:mq({ rx:20, tx:22, alto:.35, pR:[100,5,0,100], pL:[10,5,0,150], fL:-100, fR:0, aL:[0,75,-30,80], aR:[40,23,0,57], ik:{ L:{ h:"cadera", o:[.17,.10,.02] }, R:{ h:"musloR", o:[-.03,-.34,.12] } }, ikp:{ L:{ rod:[0,-1], tob:[0,-.06,1], pieLibre:1 }, R:{ h:"cadera", o:[-.1,-.14,.4] } } }), B:mq({ rx:-4, tx:-2, alto:.32, pR:[90,5,0,90], pL:[0,5,0,160], fL:-72, fR:0, aL:[0,75,-30,80], aR:[30,23,0,57], ik:{ L:{ h:"cadera", o:[.17,.10,.02] }, R:{ h:"musloR", o:[-.03,-.30,.12] } }, ikp:{ L:{ rod:[0,-1], tob:[0,-.06,1], pieLibre:1 }, R:{ fijo:1 } } }) },
  isquiopie:{ cam:84, ancla:"pieL+pieR", A:mq({ rx:-2, pR:[25,4,0,3], pL:[2,0,0,37], fL:40, fR:20, aL:[10,10,0,10], aR:[10,10,0,10], ikp:{ L:{ fijo:1 }, R:{ h:"pieL", o:[-.19,-.06,.46] } } }), B:mq({ alto:.68, rx:48, tx:20, hx:-15, pR:[88,4,0,3], pL:[66,0,0,52], fR:20, fL:40, aL:[60,15,0,20], aR:[60,15,0,20], dL:30, dR:30, ik:{ L:{ h:"piernaR", o:[.1,.11,-.01], m:[-.2,-1,.3], n:[-1,0,-.8] }, R:{ h:"piernaR", o:[-.1,.11,-.01], m:[.2,-1,.3], n:[1,0,-.8] } }, ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }) },
  perroabajo:{ cam:84, ancla:"manoL+manoR", A:mqCon(MQ_CUATRO,{ alto:.41, fL:-25, fR:-25, ikp:{ L:{ rod:[0,-.05], tob:[0,-1,.15], pieLibre:1 }, R:{ rod:[0,-.05], tob:[0,-1,.15], pieLibre:1 } } }), B:mq({ alto:.80, rx:134, hx:-10, tx:0, pL:[144,5,0,30], pR:[144,5,0,30], fL:15, fR:15, aL:[156,8,0,0], aR:[156,8,0,0], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } }, ikp:{ L:{ fijo:1, talon:10 }, R:{ fijo:1, talon:10 } } }) },
  janu:{ cam:70, A:mq({ rx:-9, tx:22, pR:[91,10,0,0], pL:[113,53,8,116,55], fR:15, fL:16, aL:[30,12,0,20], aR:[30,12,0,20], ik:{ L:{ h:"musloL", o:[.0,-.32,.16] }, R:{ h:"musloR", o:[-.04,-.26,.09] } } }), B:mq({ rx:-9, tx:55, ty:-12, hx:5, pR:[91,10,0,0], pL:[113,53,8,116,55], fR:15, fL:16, aL:[85,4,0,5], aR:[85,4,0,5], ik:{ L:{ h:"pieR", o:[.05,.02,.07] }, R:{ h:"pieR", o:[-.04,.02,.07] } } }) },
  /* 5. pierna baja */
  gemelos:{ cam:100, pared:{ h:"manoL", eje:"z", d:.035, de:"A" }, ancla:"pieL+pieR", A:mq({ rx:7, pL:[39,3,0,5], pR:[10,3,0,0], fL:-27, fR:30, aL:[85,8,0,5], aR:[85,8,0,5], ik:{ L:{ pared:1, fijo:1 }, R:{ pared:1, fijo:1 } }, ikp:{ L:{ fijo:1 }, R:{ h:"pieL", o:[-.2,0,-.62] } } }),
  B:mq({ rx:22, tx:7, pL:[66,3,0,38], pR:[25,3,0,0], fL:-27, fR:30, aL:[85,8,0,60], aR:[85,8,0,60], ik:{ L:{ pared:1, fijo:1 }, R:{ pared:1, fijo:1 } }, ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }) },
  soleo:{ cam:100, pared:{ h:"manoL", eje:"z", d:.035, de:"A" }, ancla:"pieL+pieR", A:mq({ rx:7, pL:[30,3,0,5], pR:[10,3,0,0], fL:-20, fR:15, aL:[85,8,0,5], aR:[85,8,0,5], ik:{ L:{ pared:1, fijo:1 }, R:{ pared:1, fijo:1 } }, ikp:{ L:{ fijo:1 }, R:{ h:"pieL", o:[-.2,0,-.4] } } }),
  B:mq({ alto:.73, rx:8, pL:[55,3,0,50], pR:[40,3,0,45], fL:-20, fR:15, aL:[88,8,0,5], aR:[88,8,0,5], ik:{ L:{ pared:1, fijo:1 }, R:{ pared:1, fijo:1 } }, ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }) },
  tobillo:{ cam:84, ancla:"piernaL", anclaRod:1, A:mqCon(MQ_CABALLERO,{ alto:.396, tx:10, pR:[90,5,0,90], pL:[0,5,0,90], fL:-60, fR:0, aL:[45,60,15,120], aR:[40,50,0,120], ik:{ L:{ h:"musloR", o:[.046,-.339,.161], m:[.15,-1,-.4], n:[0,0,-1] }, R:{ h:"musloR", o:[-.046,-.386,.161], m:[-.15,-1,-.4], n:[0,0,-1] } }, ikp:{ L:{ rod:[0,-1], tob:[0,-1] }, R:{ h:"cadera", o:[-.1,-.31,.32] } } }), B:mqCon(MQ_CABALLERO,{ alto:.36, rx:15, tx:15, pR:[80,5,0,105], pL:[-15,5,0,90], fL:-60, fR:15, aL:[50,60,15,120], aR:[50,50,0,120], ik:{ L:{ h:"musloR", o:[.036,-.235,.299], m:[.15,-1,-.4], n:[0,0,-1] }, R:{ h:"musloR", o:[-.056,-.278,.316], m:[-.15,-1,-.4], n:[0,0,-1] } }, ikp:{ L:{ rod:[0,-1], tob:[0,-1] }, R:{ fijo:1 } } }) },
  /* 6. integración */
  mundo:{ cam:40, el:22, fases:{ ik:[0,.25], hy:[.2,1], ty:[0,.7], aR:[.15,1] }, arco:{ aR:[0,.8,[60,20,0,80]] }, ancla:"pieL+pieR", A:mq({ alto:.52, rx:25, tx:89, hx:15, pR:[122,36,0,100], pL:[-41,3,0,0], fR:0, fL:5, aL:[107,6,0,0], aR:[107,6,0,0], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } }, ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }), B:mq({ alto:.52, rx:25, tx:88, ty:-31, hx:30, hy:-35, pR:[122,36,0,100], pL:[-41,3,0,0], fR:0, fL:5, aL:[80,6,0,0], aR:[120,150,-15,0], ik:{ L:{ s:1, fijo:1 } }, ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }) },
  jefferson:{ cam:84, ancla:"pieL+pieR", fases:{ hx:[0,.35], tk:[0,.5], tx:[.1,.9], rx:[.35,1], pL:[.35,1], pR:[.35,1], fL:[.35,1], fR:[.35,1], aL:[.2,1], aR:[.2,1] }, A:mq({ aL:[20,12,0,10], aR:[20,12,0,10], ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }), B:mq({ rx:76, tx:50, tk:10, hx:38, pL:[87,4,0,0], pR:[87,4,0,0], fL:-8, fR:-8, aL:[119,9,0,5], aR:[119,9,0,5], ikp:{ L:{ fijo:1 }, R:{ fijo:1 } } }) },
  vinyasa:{ cam:84, ancla:"manoL+manoR", tira:1, A:mq({ alto:.36, rx:74, tx:-43, hx:-5, pL:[4,5,0,0], pR:[4,5,0,0], fL:-58, fR:-58, aL:[29,14,0,0], aR:[29,14,0,0], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } } }), C:mq({ alto:.52, rx:105, hx:-10, tx:-20, pL:[50,5,0,0], pR:[50,5,0,0], fL:30, fR:30, aL:[100,8,0,0], aR:[100,8,0,0], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } } }), tc:.4, B:mq({ alto:.7, rx:135, hx:-10, tx:-20, pL:[100,5,0,0], pR:[100,5,0,0], fL:20, fR:20, aL:[180,8,0,0], aR:[180,8,0,0], ik:{ L:{ s:1, fijo:1 }, R:{ s:1, fijo:1 } } }) },
};

var MQ_T=null, MQ_CARGA=null, MQ_GLB=null;
function maniquiCarga(){
  if(MQ_T && MQ_GLB) return Promise.resolve(MQ_T);
  if(!MQ_CARGA) MQ_CARGA=Promise.all([
    import("./tres.js"),
    fetch("./cuerpo.glb").then(function(r){ if(!r.ok) throw new Error("cuerpo.glb"); return r.arrayBuffer(); })
  ]).then(function(x){ MQ_T=x[0]; MQ_GLB=x[1]; return MQ_T; }).catch(function(e){ MQ_CARGA=null; throw e; });
  return MQ_CARGA;
}
/* el color de una variable CSS, ya resuelto (p. ej. "var(--accent)" → "rgb(…)") */
function mqColor(css){
  var e=document.createElement("i"); e.style.color=css; e.style.display="none"; document.body.appendChild(e);
  var c=getComputedStyle(e).color; e.remove(); return c;
}

/* el esqueleto guía: las mismas articulaciones con piezas simples (no se dibuja) */
function mqCuerpo(T, ropa){
  var piel=new T.MeshStandardMaterial({ color:0xe6d3bf, roughness:.52, metalness:0 });
  var tela=new T.MeshStandardMaterial({ color:new T.Color(ropa), roughness:.7, metalness:0 });
  var zapa=new T.MeshStandardMaterial({ color:0x2b2d33, roughness:.6, metalness:0 });
  var piezas=[];
  function pieza(geo, mat, x,y,z, sx,sy,sz, padre){
    var m=new T.Mesh(geo, mat); m.position.set(x,y,z); if(sx) m.scale.set(sx,sy,sz);
    m.castShadow=true; m.receiveShadow=true; padre.add(m); piezas.push(m); return m;
  }
  function g(padre, x,y,z){ var o=new T.Group(); o.position.set(x,y,z); o.rotation.order="YXZ"; padre.add(o); return o; }
  var esf=new T.SphereGeometry(1, 28, 20);
  function cap(r,l){ return new T.CapsuleGeometry(r, l, 8, 18); }
  var raiz=new T.Group(), cuerpo=g(raiz,0,0,0);
  /* cadera y pantalón corto */
  pieza(esf, tela, 0,0,0, .165,.11,.115, cuerpo);
  var tronco=g(cuerpo, 0,.04,0);
  pieza(cap(.112,.1), tela, 0,.13,0, 0,0,0, tronco);
  pieza(esf, tela, 0,.33,0, .185,.19,.12, tronco);
  var cuello=g(tronco, 0,.5,0);
  pieza(cap(.045,.05), piel, 0,.03,0, 0,0,0, cuello);
  var cabeza=g(cuello, 0,.09,0);
  pieza(esf, piel, 0,.085,.005, .1,.118,.108, cabeza);
  pieza(esf, piel, 0,.08,.105, .018,.024,.02, cabeza);   /* la nariz, para saber hacia dónde mira */
  var brazos={}, piernas={};
  [["L",1],["R",-1]].forEach(function(l){
    var h=g(tronco, l[1]*.205,.43,0);
    pieza(esf, tela, 0,0,0, .066,.066,.066, h);
    pieza(cap(.05,.19), piel, 0,-.14,0, 0,0,0, h);
    var codo=g(h, 0,-.285,0);
    pieza(cap(.042,.17), piel, 0,-.125,0, 0,0,0, codo);
    pieza(esf, piel, 0,-.27,.005, .042,.065,.026, codo);
    brazos[l[0]]={ h:h, codo:codo, s:l[1] };
    var c=g(cuerpo, l[1]*.092,-.055,0);
    pieza(cap(.075,.22), tela, 0,-.08,0, 0,0,0, c).scale.set(1,.5,1);
    pieza(cap(.07,.28), piel, 0,-.22,0, 0,0,0, c);
    var rod=g(c, 0,-.43,0);
    pieza(cap(.052,.3), piel, 0,-.2,0, 0,0,0, rod);
    var pie=g(rod, 0,-.41,0);
    var zp=pieza(cap(.045,.13), zapa, 0,-.015,.05, 0,0,0, pie); zp.rotation.x=Math.PI/2;
    piernas[l[0]]={ c:c, rod:rod, s:l[1] };
  });
  return { raiz:raiz, cuerpo:cuerpo, tronco:tronco, cuello:cuello, cabeza:cabeza, brazos:brazos, piernas:piernas, piezas:piezas };
}
var MQ_R=Math.PI/180;
/* gira las articulaciones de la guía según la postura P */
function mqGira(C, P){
  var R=MQ_R;
  C.cuerpo.rotation.set(P.rx*R, P.ry*R, P.rz*R);
  if(P.rr) C.cuerpo.quaternion.multiply(new C.cuerpo.quaternion.constructor().setFromAxisAngle({ x:0, y:1, z:0 }, P.rr*R));
  C.tronco.rotation.set(P.tx*R, P.ty*R, P.tz*R);
  C.cuello.rotation.set(P.hx*R*.35, P.hy*R*.4, P.hz*R*.4);
  C.cabeza.rotation.set(P.hx*R*.65, P.hy*R*.6, P.hz*R*.6);
  ["L","R"].forEach(function(l){
    var a=P["a"+l], b=C.brazos[l];
    b.h.rotation.set(-a[0]*R, a[2]*R*(l==="L"?-1:1), a[1]*R*b.s);
    if(a[4]) b.h.quaternion.multiply(new b.h.quaternion.constructor().setFromAxisAngle({ x:0, y:1, z:0 }, a[4]*R*b.s));
    b.codo.rotation.set(-a[3]*R, 0, 0);
    var p=P["p"+l], q=C.piernas[l];
    q.c.rotation.set(-p[0]*R, p[2]*R*(l==="L"?-1:1), p[1]*R*q.s);
    if(p[4]) q.c.quaternion.multiply(new q.c.quaternion.constructor().setFromAxisAngle({ x:0, y:1, z:0 }, p[4]*R*(l==="L"?1:-1)));
    q.rod.rotation.set(p[3]*R, 0, 0);
  });
  C.raiz.updateMatrixWorld(true);
}
/* fases: { clave:[de, a] } para que una parte se mueva solo en ese tramo de t (p. ej. la mano se apoya
   antes de que el cuello se incline); "ik" es el de los contactos de las manos. C: una postura intermedia
   (en tc, 0.5 si no se dice) por la que pasa cada parte al ir de A a B */
function mqMezcla(A, B, t, fases, C, tc, arco){
  var r={}, k; tc=tc||.5;
  function en(k){ var f=fases && fases[k]; if(!f) return t; var u=Math.max(0, Math.min(1, (t-f[0])/(f[1]-f[0]))); return u*u*(3-2*u); }   /* cada tramo arranca y frena suave */
  function tramo(u){ return !C ? [A, B, u] : u<tc ? [A, C, u/tc] : [C, B, (u-tc)/(1-tc)]; }
  for(k in A){ if(k==="ik") continue; var s=tramo(en(k)), X=s[0][k], Y=s[1][k], u=s[2];
    if(Array.isArray(X)) r[k]=X.map(function(v,i){ return v+(Y[i]-v)*u; }); else r[k]=X+(Y-X)*u;
    /* arco: { clave:[de, a, cuánto] } suma un arco (seno) en ese tramo, p. ej. para levantar una pierna al moverla */
    var ar=arco && arco[k]; if(ar && t>ar[0] && t<ar[1]){ var sn=Math.sin(Math.PI*(t-ar[0])/(ar[1]-ar[0]));
      if(Array.isArray(r[k])) r[k]=r[k].map(function(v,i){ return v+(ar[2][i]||0)*sn; }); else r[k]+=ar[2]*sn; } }
  r.tramo=C && t>=tc ? 1 : 0;
  /* los contactos de una mano: el de B si lo tiene (si no, el de A), con su peso mezclado; si los dos
     son al mismo hueso, el desplazamiento y la dirección de la mano también se mezclan */
  var si=tramo(en("ik")), a=si[0].ik||{}, b=si[1].ik||{}, ti=si[2]; r.ik={};
  function mv(x, y){ if(!x || !y) return y||x; return x.map(function(v,i){ return v+(y[i]-v)*ti; }); }
  ["L","R"].forEach(function(l){ var c=b[l]||a[l]; if(!c) return;
    var mismo=a[l] && b[l] && a[l].h===b[l].h && !!a[l].s===!!b[l].s && !!a[l].pared===!!b[l].pared;
    r.ik[l]={ h:c.h, f:c.f, o:mismo ? mv(a[l].o||[0,0,0], b[l].o||[0,0,0]) : c.o, m:mismo ? mv(a[l].m, b[l].m) : c.m, n:mismo ? mv(a[l].n, b[l].n) : c.n,
      s:c.s, pared:c.pared, codo:c.codo, suave:c.suave, fijo:mismo ? (a[l].fijo && b[l].fijo) : c.fijo,
      w:(a[l]?(a[l].w==null?1:a[l].w):0)*(1-ti)+(b[l]?(b[l].w==null?1:b[l].w):0)*ti };
    /* de un punto del cuerpo a otro (p. ej. del muslo al pie): la mano va de uno a otro, sin saltar */
    var pto=function(x){ return x && x.h && !x.s && !x.pared; };
    if(!mismo && pto(a[l]) && pto(b[l]) && ti<1){ r.ik[l].de=a[l]; r.ik[l].u=ti; } });
  /* las piernas, igual: con los dos del mismo tipo se mezclan las direcciones */
  var sp=tramo(en("ikp")), pa=sp[0].ikp||{}, pb=sp[1].ikp||{}, tp=sp[2];
  if(sp[0].ikp || sp[1].ikp){ r.ikp={};
    ["L","R"].forEach(function(l){ var x=pa[l], y=pb[l], c=y||x; if(!c) return;
      var wx=x?(x.w==null?1:x.w):0, wy=y?(y.w==null?1:y.w):0, o={}; for(var q in c) o[q]=c[q];
      if(x && y && x.rod && y.rod){ o.rod=[x.rod[0]+(y.rod[0]-x.rod[0])*tp, x.rod[1]+(y.rod[1]-x.rod[1])*tp]; o.rk=(x.rk||.03)+((y.rk||.03)-(x.rk||.03))*tp;
        if(x.tob && y.tob) o.tob=x.tob.map(function(v,i){ return v+((y.tob[i]||0)-v)*tp; }); }
      if(x && y && x.h && y.h && x.h===y.h && x.o && y.o) o.o=x.o.map(function(v,i){ return v+(y.o[i]-v)*tp; });
      /* A con el pie en un punto (h) o con la rodilla apoyada (rod) y B con fijo: ahí es justo donde se queda fijo */
      o.fijo=x && y ? ((x.fijo || x.h || x.rod) && y.fijo) : c.fijo;
      if(o.fijo){ delete o.rod; delete o.h; }
      /* talon: el pie fijo gira sobre la punta (grados, + = el talón baja hacia el suelo) */
      if((x && x.talon) || (y && y.talon)) o.talon=((x&&x.talon)||0)*(1-tp)+((y&&y.talon)||0)*tp;
      o.w=wx*(1-tp)+wy*tp; r.ikp[l]=o; }); }
  return r;
}
/* la postura de la figura F en el instante t (0 = A, 1 = B) */
function mqFigT(F, t){ return mqMezcla(F.A, F.B, t, F.fases, F.C, F.tc, F.arco); }

/* qué articulación de la guía mueve cada hueso del modelo (los demás siguen a su padre) */
var MQ_HUESOS={ cadera:"cuerpo", espalda1:"medio", espalda2:"tronco", cuello:"cuello", cabeza:"cabeza",
  brazoL:"bL", antebrazoL:"cL", brazoR:"bR", antebrazoR:"cR", musloL:"mL", piernaL:"rL", musloR:"mR", piernaR:"rR" };
var MQ_POSE_T=mq({ aL:[0,90,0,0], aR:[0,90,0,0], pL:[0,1,0,0], pR:[0,1,0,0] });   /* la pose en T del modelo, en ángulos de la guía */
var MQ_GUIA=null;
function mqGuiaQuats(T){
  var C=MQ_GUIA.C, q={};
  function w(o){ return o.getWorldQuaternion(new T.Quaternion()); }
  q.cuerpo=w(C.cuerpo); q.tronco=w(C.tronco); q.medio=q.cuerpo.clone().slerp(q.tronco,.5);
  q.cuello=w(C.cuello); q.cabeza=w(C.cabeza);
  q.bL=w(C.brazos.L.h); q.cL=w(C.brazos.L.codo); q.bR=w(C.brazos.R.h); q.cR=w(C.brazos.R.codo);
  q.mL=w(C.piernas.L.c); q.rL=w(C.piernas.L.rod); q.mR=w(C.piernas.R.c); q.rR=w(C.piernas.R.rod);
  return q;
}
function mqGuia(T){
  if(MQ_GUIA) return MQ_GUIA;
  MQ_GUIA={ C:mqCuerpo(T, "#000") };
  mqGira(MQ_GUIA.C, MQ_POSE_T); MQ_GUIA.enT=mqGuiaQuats(T);
  var inv={}; for(var k in MQ_GUIA.enT) inv[k]=MQ_GUIA.enT[k].clone().invert();
  MQ_GUIA.invT=inv;
  return MQ_GUIA;
}
/* los dedos: el modelo trae la mano de una pieza, así que se le añaden dos huesos (nudillos y media
   falange) y los dedos (sin el pulgar) pasan a ellos, para poder doblarlos (dL/dR) y abrazar algo */
function mqDedos(T, raiz, malla){
  raiz.updateMatrixWorld(true);
  var sk=malla.skeleton, huesos=sk.bones.slice(), inv=sk.boneInverses.slice(), nuevos={};
  ["L","R"].forEach(function(l){
    var i=huesos.findIndex(function(b){ return b.name==="mano"+l; }); if(i<0) return;
    var mano=huesos[i], Hueso=mano.constructor, d1=new Hueso(), d2=new Hueso();
    d1.name="dedo1"+l; d1.position.set(0,.078,0); mano.add(d1);
    d2.name="dedo2"+l; d2.position.set(0,.034,0); d1.add(d2);
    raiz.updateMatrixWorld(true);
    [d1,d2].forEach(function(d){ inv.push(d.matrixWorld.clone().invert().multiply(mano.matrixWorld).multiply(sk.boneInverses[i])); huesos.push(d); });
    nuevos[i]={ l:l, a:huesos.length-2, b:huesos.length-1, inv:mano.matrixWorld.clone().invert() };
  });
  var geo=malla.geometry, si=geo.attributes.skinIndex, sw=geo.attributes.skinWeight, n=si.count, v=new T.Vector3();
  function rampa(x, a, b){ x=Math.max(0, Math.min(1, (x-a)/(b-a))); return x*x*(3-2*x); }
  for(var k=0;k<n;k++){
    var cual=-1, j;
    for(j=0;j<4;j++) if(sw.getComponent(k,j)>.9 && nuevos[si.getComponent(k,j)]) cual=si.getComponent(k,j);
    if(cual<0) continue;
    var N=nuevos[cual]; malla.getVertexPosition(k, v); v.applyMatrix4(malla.matrixWorld).applyMatrix4(N.inv);
    /* la palma y el pulgar se quedan en la mano; el paso hacia el pulgar es gradual para que no salga un pico */
    var px=N.l==="L" ? v.x : -v.x; if(v.y<.066 || px>.056) continue;
    var r1=rampa(v.y, .066, .086)*(1-rampa(px, .036, .056)), r2=rampa(v.y, .102, .118);
    si.setXYZW(k, cual, N.a, N.b, 0); sw.setXYZW(k, 1-r1, r1*(1-r2), r1*r2, 0);
  }
  si.needsUpdate=true; sw.needsUpdate=true;
  malla.bind(new sk.constructor(huesos, inv), malla.bindMatrix);
}
/* piel con cuaterniones duales: con el mezclado normal de matrices, al subir mucho los brazos el
   hombro se estrecha y parece que el brazo se despega del cuerpo; así cada punto gira sin encogerse */
var MQ_DQS_GLSL=[
  "vec4 mqQ(mat4 M){",
  "  vec3 c0=normalize(M[0].xyz), c1=normalize(M[1].xyz), c2=normalize(M[2].xyz);",
  "  float m00=c0.x, m10=c0.y, m20=c0.z, m01=c1.x, m11=c1.y, m21=c1.z, m02=c2.x, m12=c2.y, m22=c2.z, tr=m00+m11+m22, s;",
  "  if(tr>0.){ s=sqrt(tr+1.)*2.; return vec4((m21-m12)/s, (m02-m20)/s, (m10-m01)/s, .25*s); }",
  "  if(m00>m11 && m00>m22){ s=sqrt(1.+m00-m11-m22)*2.; return vec4(.25*s, (m01+m10)/s, (m02+m20)/s, (m21-m12)/s); }",
  "  if(m11>m22){ s=sqrt(1.+m11-m00-m22)*2.; return vec4((m01+m10)/s, .25*s, (m12+m21)/s, (m02-m20)/s); }",
  "  s=sqrt(1.+m22-m00-m11)*2.; return vec4((m02+m20)/s, (m12+m21)/s, .25*s, (m10-m01)/s);",
  "}",
  "vec4 mqQD(vec4 q, vec3 t){ return .5*vec4(q.w*t + cross(t, q.xyz), -dot(t, q.xyz)); }",
  "void mqDQ(mat4 a, mat4 b, mat4 c, mat4 e, vec4 w, out vec4 r, out vec4 d){",
  "  vec4 q0=mqQ(a), q1=mqQ(b), q2=mqQ(c), q3=mqQ(e);",
  "  if(dot(q0,q1)<0.) q1=-q1; if(dot(q0,q2)<0.) q2=-q2; if(dot(q0,q3)<0.) q3=-q3;",
  "  r = w.x*q0 + w.y*q1 + w.z*q2 + w.w*q3;",
  "  d = w.x*mqQD(q0, a[3].xyz) + w.y*mqQD(q1, b[3].xyz) + w.z*mqQD(q2, c[3].xyz) + w.w*mqQD(q3, e[3].xyz);",
  "  float n=length(r); r/=n; d/=n;",
  "}",
  "vec3 mqGiraQ(vec4 r, vec3 v){ return v + 2.*cross(r.xyz, cross(r.xyz, v) + r.w*v); }",
  "vec3 mqMueveDQ(vec4 r, vec4 d, vec3 v){ return mqGiraQ(r, v) + 2.*(r.w*d.xyz - d.w*r.xyz + cross(r.xyz, d.xyz)); }"
].join("\n");
function mqDQS(mat){
  var antes=mat.onBeforeCompile;
  mat.onBeforeCompile=function(sh, r){
    if(antes) antes.call(this, sh, r);
    sh.vertexShader=sh.vertexShader.replace("#include <skinning_pars_vertex>", "#include <skinning_pars_vertex>\n#ifdef USE_SKINNING\n"+MQ_DQS_GLSL+"\n#endif")
      .replace("#include <skinnormal_vertex>", ["#ifdef USE_SKINNING",
        "  vec4 mqRn, mqDn; mqDQ(boneMatX, boneMatY, boneMatZ, boneMatW, skinWeight, mqRn, mqDn);",
        "  objectNormal = (bindMatrixInverse * vec4(mqGiraQ(mqRn, (bindMatrix * vec4(objectNormal, 0.)).xyz), 0.)).xyz;",
        "#endif"].join("\n"))
      .replace("#include <skinning_vertex>", ["#ifdef USE_SKINNING",
        "  vec4 mqRp, mqDp; mqDQ(boneMatX, boneMatY, boneMatZ, boneMatW, skinWeight, mqRp, mqDp);",
        "  transformed = (bindMatrixInverse * vec4(mqMueveDQ(mqRp, mqDp, (bindMatrix * vec4(transformed, 1.)).xyz), 1.)).xyz;",
        "#endif"].join("\n"));
  };
}
/* el modelo: se lee cuerpo.glb, se pinta y se apuntan los giros de reposo de cada hueso */
/* las normales que usa Blender para el contorno: la de cada punto del cuerpo, media de las caras
   que lo tocan (pesadas por su ángulo) y la misma en los vértices repetidos por las costuras de la textura */
function mqNormalesBorde(T, geo){
  if(geo.attributes.borde) return;
  var p=geo.attributes.position, n=p.count, ix=geo.index ? geo.index.array : null, grupo=new Int32Array(n), mapa={}, g=0, i, k;
  for(i=0;i<n;i++){ k=Math.round(p.getX(i)*1e5)+","+Math.round(p.getY(i)*1e5)+","+Math.round(p.getZ(i)*1e5);
    if(mapa[k]===undefined) mapa[k]=g++; grupo[i]=mapa[k]; }
  var suma=new Float32Array(g*3), a=new T.Vector3(), b=new T.Vector3(), c=new T.Vector3(), u=new T.Vector3(), v=new T.Vector3(), f=new T.Vector3();
  var tris=ix ? ix.length : n;
  for(i=0;i<tris;i+=3){
    var t=[ix?ix[i]:i, ix?ix[i+1]:i+1, ix?ix[i+2]:i+2];
    a.fromBufferAttribute(p,t[0]); b.fromBufferAttribute(p,t[1]); c.fromBufferAttribute(p,t[2]);
    f.subVectors(c,b).cross(u.subVectors(a,b)).normalize();
    [[a,b,c],[b,c,a],[c,a,b]].forEach(function(q, j){
      var ang=u.subVectors(q[1],q[0]).angleTo(v.subVectors(q[2],q[0])), o=grupo[t[j]]*3;
      if(!isFinite(ang)) return;
      suma[o]+=f.x*ang; suma[o+1]+=f.y*ang; suma[o+2]+=f.z*ang;
    });
  }
  var out=new Float32Array(n*3);
  for(i=0;i<n;i++){ var o=grupo[i]*3; f.set(suma[o],suma[o+1],suma[o+2]).normalize(); out[i*3]=f.x; out[i*3+1]=f.y; out[i*3+2]=f.z; }
  geo.setAttribute("borde", new T.BufferAttribute(out, 3));
}
/* la ropa: camiseta del color de acento del tema con la montaña de Peak. en el pecho izquierdo (del color
   que la app pone sobre el acento), pantalón corto y zapatillas crema con suela de tinta, también con la montaña, y
   ribete negro en el cuello, las mangas y la boca de la zapatilla. Se pinta sobre la piel según dónde
   está cada punto en la pose de reposo (en metros; y arriba, x hacia su izquierda, z hacia delante),
   así los bordes salen limpios aunque la malla tenga pocos vértices. */
/* colores de la paleta crema y tinta: el pantalón, un gris cálido que se separa de la camiseta en los dos modos */
/* el estilo: dibujo plano (2D) en vez de 3D realista. Colores lisos, la piel de un solo tono, contorno fino de tinta
   y la sombra rayada en diagonal, como la cara en sombra de la montaña del logo (elegido por Carlos el 4/10/2026) */
/* rayaPx: cada cuántos píxeles CSS hay una raya; rayaAncho: qué parte de ese hueco es raya; sombra/raya: cuánto oscurecen (1 = nada) */
var MQ_ESTILO={ plano:true, piel:"#eebf97", rayaPx:3, rayaAncho:.5, sombra:.9, raya:.72, borde:2 };
var MQ_ROPA={ pantalon:"#57524b", pantalonOsc:"#3a3631", zapas:"#f5f0e6", suela:"#1c1b19", ribete:"#141311", conRibete:false };
/* el logo: la montaña del icono de la app (PEAK_MK_D, caja de 900 × 900) dibujada una vez en una
   textura; el shader la lee como máscara (1 = montaña, 0 = tela) */
var MQ_LOGO_TEX=null;
/* tres.js va recortado y no trae CanvasTexture: se clona la textura de la piel y se le cambia la imagen */
function mqLogoTex(base){
  if(MQ_LOGO_TEX) return MQ_LOGO_TEX;
  var cv=document.createElement("canvas"); cv.width=cv.height=512;
  var x=cv.getContext("2d"); x.fillStyle="#fff"; x.translate(16,16); x.scale(480/900, 480/900); x.fill(new Path2D(PEAK_MK_D));   /* con margen: si no, el borde de arriba recoge la base al filtrar */
  /* ojo: la copia comparte la imagen (source) con la piel; se le da una propia antes de tocarla */
  var t=base.clone(); t.source=Object.assign(Object.create(Object.getPrototypeOf(base.source)), base.source, { uuid:"mq-logo", version:0 });
  t.image=cv; t.colorSpace=""; t.flipY=true; t.wrapS=t.wrapT=1001;   /* ClampToEdgeWrapping */ t.anisotropy=8; t.needsUpdate=true;
  MQ_LOGO_TEX=t; return t;
}
var MQ_LOGO_GLSL=[
  "uniform sampler2D logoTex;",
  /* c: centro del logo (en metros) en el plano de la superficie, alto: su lado en metros */
  "float mqLogoEn(vec2 q, vec2 c, float alto){ vec2 p = (q - c) / alto * (480. / 512.) + 0.5;",
  "  if(p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1.) return 0.; return texture2D(logoTex, p).a; }"
].join("\n");
function mqRopa(T, mat, color){
  var oscuro=document.documentElement.classList.contains("dark"), acento=color||"#4f46e5";
  /* un acento casi negro (la tinta) dejaba la camiseta como una mancha plana: se aclara lo justo para que se vean el volumen y los pliegues */
  var cam=new T.Color(acento), hsl={}; cam.getHSL(hsl, "srgb"); if(hsl.l<.25) cam.setHSL(hsl.h, hsl.s, .25, "srgb");
  var u={ plano:{ value:MQ_ESTILO.plano?1:0 }, piel2d:{ value:new T.Color(MQ_ESTILO.piel) }, rayaPx:{ value:MQ_ESTILO.rayaPx*(window.devicePixelRatio||1) }, rayaAncho:{ value:MQ_ESTILO.rayaAncho }, sombraF:{ value:MQ_ESTILO.sombra }, rayaF:{ value:MQ_ESTILO.raya }, camiseta:{ value:cam }, logoC:{ value:new T.Color(mqColor("var(--on-accent, #ffffff)")) },
          pantalon:{ value:new T.Color(oscuro ? MQ_ROPA.pantalonOsc : MQ_ROPA.pantalon) }, logoP:{ value:new T.Color(MQ_ROPA.zapas) },
          zapas:{ value:new T.Color(MQ_ROPA.zapas) }, logoZ:{ value:new T.Color(MQ_ROPA.suela) }, logoTex:{ value:mqLogoTex(mat.map) },
          suela:{ value:new T.Color(MQ_ROPA.suela) }, ribete:{ value:new T.Color(MQ_ROPA.ribete) }, conRib:{ value:MQ_ROPA.conRibete?1:0 }, espejo:{ value:1 } };
  mat.userData.ropa=u;
  mat.onBeforeCompile=function(sh){
    for(var k in u) sh.uniforms[k]=u[k];
    sh.vertexShader="varying vec3 vReposo;\nvarying vec3 vReposoN;\n"+sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vReposo = position; vReposoN = normal;");
    sh.fragmentShader="varying vec3 vReposo;\nvarying vec3 vReposoN;\nuniform vec3 camiseta, logoC, pantalon, logoP, zapas, logoZ, suela, ribete;\nuniform float conRib, espejo, plano, rayaPx, rayaAncho, sombraF, rayaF;\nuniform vec3 piel2d;\n"+
      "float mqBorde(float d){ return smoothstep(-1.0, 1.0, d/max(fwidth(d), 1e-5)); }\n"+MQ_LOGO_GLSL+"\n"+
      sh.fragmentShader.replace("#include <map_fragment>", [
        "#include <map_fragment>",
        "  vec3 r = vReposo, n = normalize(vReposoN); float ax = abs(r.x);",
        /* camiseta: de la cintura a los hombros, manga corta hasta media altura del brazo, con cuello redondo */
        "  float dCuello = min((length(vec2(r.x / 0.088, (r.y - 1.315) / 0.066)) - 1.0) * 0.066, max(1.30 - r.y, ax - 0.12));",
        "  float dManga = 0.335 - ax;",
        "  float dC = min(min(r.y - 0.855, dManga), dCuello);",
        /* pantalón: de la cadera a medio muslo */
        "  float dP = min(r.y - 0.60, 0.875 - r.y);",
        "  float dZ = 0.10 - r.y;",
        "  float aC = mqBorde(dC), aP = mqBorde(dP), aZ = mqBorde(dZ);",
        "  float doblC = 1.0 - 0.16 * (1.0 - smoothstep(0.004, 0.012, r.y - 0.855));",
        "  float doblP = 1.0 - 0.2 * (1.0 - smoothstep(0.004, 0.012, r.y - 0.60));",
        /* ribetes negros de 7 mm */
        "  float ribC = (1.0 - mqBorde(min(dCuello, dManga) - 0.007)) * conRib;",
        "  float ribZ = (1.0 - mqBorde(dZ - 0.007)) * conRib;",
        /* logos: pecho izquierdo y pantalón abajo a la izquierda, por delante; en la cara de fuera de cada zapatilla */
        "  float delante = step(0.12, n.z);",
        "  float lC = mqLogoEn(vec2(r.x * espejo, r.y), vec2(0.08, 1.135), 0.075) * delante;",
        "  float lP = mqLogoEn(vec2(r.x * espejo, r.y), vec2(0.1, 0.67), 0.045) * delante;",
        "  float fuera = step(0.12, n.x * sign(r.x));",
        "  float lZ = mqLogoEn(vec2((0.02 - r.z) * sign(r.x), r.y), vec2(0.0, 0.052), 0.04) * fuera;",   /* de pie, mirando desde fuera */
        "  vec3 cZ = mix(mix(suela, zapas, smoothstep(0.018, 0.024, r.y)), logoZ, lZ);",
        "  cZ = mix(cZ, ribete, ribZ);",
        "  vec3 cP = mix(pantalon * doblP, logoP, lP);",
        "  vec3 cC = mix(mix(camiseta * doblC, logoC, lC), ribete, ribC);",
        "  vec3 col = mix(diffuseColor.rgb, piel2d, plano);",
        "  col = mix(col, cZ, aZ);",
        "  col = mix(col, cP, aP);",
        "  col = mix(col, cC, aC);",
        "  diffuseColor.rgb = col;",
        "  float tela = max(aC, max(aP, aZ));"
      ].join("\n")).replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  roughnessFactor = mix(roughnessFactor, 0.88, tela);").replace("#include <opaque_fragment>", [
        "#include <opaque_fragment>",
        /* dibujo plano: la luz solo decide si un punto está en sombra; la sombra es el color algo más oscuro con rayas diagonales */
        "  if(plano > 0.5){",
        "    vec3 b = diffuseColor.rgb; float lb = dot(b, vec3(.2126, .7152, .0722));",
        "    float lum = dot(outgoingLight, vec3(.2126, .7152, .0722)) / max(lb, .004);",
        "    float sb = 1.0 - smoothstep(.70, .82, lum);",
        "    float st = step(1.0 - rayaAncho, fract((gl_FragCoord.x - gl_FragCoord.y) / rayaPx));",
        "    vec3 c = mix(b, b * sombraF, sb); c = mix(c, b * rayaF, sb * st);",
        "    gl_FragColor.rgb = c;",
        "  }"
      ].join("\n"));
  };
  mat.customProgramCacheKey=function(){ return "mq-ropa"; };
}
function mqModelo(T, color){
  return new Promise(function(ok, mal){
    new T.GLTFLoader().parse(MQ_GLB.slice(0), "./", function(g){
      var raiz=g.scene, malla=null;
      raiz.traverse(function(o){ if(o.isSkinnedMesh) malla=o; });
      /* la piel original del modelo: su textura tal cual, con el mismo material que en Blender (rugosidad 0,5) */
      var piel=malla.material.map; piel.anisotropy=8;
      malla.material=new T.MeshStandardMaterial({ map:piel, roughness:.5, metalness:0 });
      mqRopa(T, malla.material, color); mqDQS(malla.material);
      malla.castShadow=true; malla.frustumCulled=false;
      if(MQ_ESTILO.plano) malla.receiveShadow=false;   /* en plano no se hace sombra a sí mismo: dejaba manchas */
      mqDedos(T, raiz, malla);
      /* el contorno, hecho como en el modelo original (una copia vuelta del revés que asoma por fuera
         siguiendo la normal de cada vértice, del mismo casi negro que su material OL), pero fino:
         siempre de la misma anchura en pantalla (ver mqGrosor) y nunca más de los 5 mm del original */
      mqNormalesBorde(T, malla.geometry);
      var grueso={ value:.002 };
      var borde=new T.MeshBasicMaterial({ side:T.BackSide }); borde.color.setRGB(.003543, .00054, .0009);
      borde.onBeforeCompile=function(sh){
        sh.uniforms.grueso=grueso;
        sh.vertexShader="attribute vec3 borde;\nuniform float grueso;\n"+sh.vertexShader.replace("#include <skinning_vertex>",
          "#include <skinning_vertex>\n  float lejos = -(modelViewMatrix * vec4(transformed, 1.0)).z;\n  transformed += normalize((skinMatrix * vec4(borde, 0.0)).xyz) * min(grueso * lejos, 0.005);");
      };
      var contorno=new T.SkinnedMesh(malla.geometry, borde); contorno.bind(malla.skeleton, malla.bindMatrix); contorno.frustumCulled=false;
      malla.parent.add(contorno);
      raiz.updateMatrixWorld(true);
      var huesos=malla.skeleton.bones.slice(), reposo={};
      function hondo(b){ var n=0; while(b.parent && b.parent.isBone){ n++; b=b.parent; } return n; }
      huesos.sort(function(a,b){ return hondo(a)-hondo(b); });
      var hueso={};
      huesos.forEach(function(b){ hueso[b.name]=b; reposo[b.uuid]={ mundo:b.getWorldQuaternion(new T.Quaternion()), local:b.quaternion.clone() }; });
      var r0=huesos[0].parent.getWorldQuaternion(new T.Quaternion());
      ok({ ropa:malla.material.userData.ropa, raiz:raiz, malla:malla, huesos:huesos, hueso:hueso, reposo:reposo, grueso:grueso, contorno:contorno, base:r0, caja:new T.Box3(), tmp:new T.Quaternion() });
    }, mal);
  });
}
/* la entrepierna: los vértices del centro, repartidos entre los dos muslos, siguen sobre todo a la
   cadera; si no, con las rodillas muy abiertas (la rana) el pantalón cuelga como una bolsa. Solo en
   las figuras que lo piden (F.entrepierna): en las demás el pantalón queda mejor como está */
function mqEntrepierna(malla){
  var g=malla.geometry, P=g.attributes.position, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, nb=malla.skeleton.bones, ix={}, i, j;
  function rampa(x, a, b){ var u=Math.max(0, Math.min(1, (x-a)/(b-a))); return u*u*(3-2*u); }
  nb.forEach(function(b, k){ ix[b.name]=k; });
  for(i=0;i<si.count;i++){
    var y=P.getY(i), f=.45*(1-rampa(Math.abs(P.getX(i)), .02, .12))*rampa(y, .56, .68)*(1-rampa(y, .76, .9));
    if(f<=0) continue;
    var w=[], quita=0, hay=-1, menor=0;
    for(j=0;j<4;j++){ var b=si.getComponent(i,j), x=sw.getComponent(i,j); w.push(x);
      if(x>0 && (b===ix.musloL || b===ix.musloR)){ quita+=x*f; w[j]=x*(1-f); }
      if(x>0 && b===ix.cadera) hay=j; }
    if(quita<=0) continue;
    if(hay<0){ for(j=1;j<4;j++) if(w[j]<w[menor]) menor=j; quita+=w[menor]; w[menor]=0; si.setComponent(i,menor,ix.cadera); hay=menor; }
    w[hay]+=quita;
    for(j=0;j<4;j++) sw.setComponent(i,j,w[j]); }
  si.needsUpdate=true; sw.needsUpdate=true;
}
/* pone el modelo en la postura P y lo apoya en el suelo */
/* cuánto sube la clavícula al levantar el brazo (como en un hombro de verdad): nada hasta la
   horizontal y hasta 28° con el brazo arriba del todo. Así el hombro no se hunde ni se abre. */
function mqClavicula(T, C, l){
  var up=new T.Vector3(0,1,0).applyQuaternion(C.tronco.getWorldQuaternion(new T.Quaternion()));
  var h=C.brazos[l].h.getWorldPosition(new T.Vector3()), c=C.brazos[l].codo.getWorldPosition(new T.Vector3());
  var elev=c.sub(h).normalize().angleTo(up.clone().negate())/MQ_R;
  return { up:up, ang:Math.max(0, Math.min(1, (elev-80)/100))*MQ_CLAV*MQ_R };
}
var MQ_CLAV=40;
/* lleva la muñeca de un brazo a un punto (IK de dos huesos), sin cambiar hacia dónde dobla el codo */
function mqIK(T, M, l, dest, w){ mqIK2(T, M.hueso["brazo"+l], M.hueso["antebrazo"+l], M.hueso["mano"+l], dest, w); }
/* dos huesos (brazo y antebrazo, o muslo y pierna) para que el extremo C llegue a dest, doblando el
   codo o la rodilla hacia donde ya se doblaba */
function mqIK2(T, A, B, C, dest, w){
  if(!A||!B||!C||w<=0) return;
  function pos(o){ return o.getWorldPosition(new T.Vector3()); }
  function gira(o, de, a){
    var q=new T.Quaternion().setFromUnitVectors(de.normalize(), a.normalize());
    var wq=o.getWorldQuaternion(new T.Quaternion()), pq=o.parent.getWorldQuaternion(new T.Quaternion()).invert();
    o.quaternion.copy(pq.multiply(q).multiply(wq)); o.updateMatrixWorld(true);
  }
  var a=pos(A), b=pos(B), c=pos(C), t=c.clone().lerp(dest, Math.min(1,w));
  var l1=a.distanceTo(b), l2=b.distanceTo(c);
  /* suave: cerca del brazo estirado del todo el codo no se bloquea de golpe (se acerca poco a poco) */
  if(dest.suave){ var sv=dest.suave, da=l1+l2-sv, dt=a.distanceTo(t); if(dt>da) t=a.clone().add(t.clone().sub(a).normalize().multiplyScalar(da+sv*(1-Math.exp(-(dt-da)/sv)))); }
  var d=Math.min(Math.max(a.distanceTo(t), Math.abs(l1-l2)+.002), l1+l2-.002);
  var dir=t.clone().sub(a).normalize(), polo=b.clone().sub(a), ac=c.clone().sub(a).normalize();
  polo.sub(ac.multiplyScalar(polo.dot(ac)));
  polo.sub(dir.clone().multiplyScalar(polo.dot(dir)));
  if(polo.lengthSq()<1e-8) polo.set(0,0,-1).sub(dir.clone().multiplyScalar(-dir.z));
  polo.normalize();
  var x=(l1*l1-l2*l2+d*d)/(2*d), h=Math.sqrt(Math.max(0, l1*l1-x*x));
  /* plano: el codo también se apoya (en la pared): se elige, de su círculo, el punto que cae en el plano */
  if(dest.plano && h>1e-4){ var n=dest.plano.n, cen=a.clone().add(dir.clone().multiplyScalar(x)), otro=dir.clone().cross(polo);
    var kA=h*n.dot(polo), kB=h*n.dot(otro), Cc=dest.plano.d-n.dot(cen), R=Math.sqrt(kA*kA+kB*kB), fi=Math.atan2(kB, kA);
    if(R>1e-6){ if(Math.abs(Cc)<=R){ var dd=Math.acos(Cc/R), f1=fi+dd, f2=fi-dd; fi=Math.abs(Math.atan2(Math.sin(f1),Math.cos(f1)))<Math.abs(Math.atan2(Math.sin(f2),Math.cos(f2))) ? f1 : f2; }
      else if(Cc<0) fi+=Math.PI;
      polo=polo.clone().multiplyScalar(Math.cos(fi)).add(otro.multiplyScalar(Math.sin(fi))).normalize(); } }
  var b2=a.clone().add(dir.clone().multiplyScalar(x)).add(polo.multiplyScalar(h));
  gira(A, b.clone().sub(a), b2.sub(a));
  var bb=pos(B); gira(B, pos(C).sub(bb), t.clone().sub(bb));
  if(dest.mano){ var ahora=new T.Vector3(0,1,0).applyQuaternion(C.getWorldQuaternion(new T.Quaternion()));
    gira(C, ahora.clone(), ahora.clone().lerp(dest.mano, Math.min(1,w))); }
  /* la palma (la cara −z de la mano) mirando a dest.palma: se gira la mano sobre el eje de los dedos */
  if(dest.palma){ var cq=C.getWorldQuaternion(new T.Quaternion()), eje=new T.Vector3(0,1,0).applyQuaternion(cq);
    var pa=new T.Vector3(0,0,-1).applyQuaternion(cq), pb=dest.palma.clone();
    pa.sub(eje.clone().multiplyScalar(pa.dot(eje))); pb.sub(eje.clone().multiplyScalar(pb.dot(eje)));
    if(pa.lengthSq()>1e-6 && pb.lengthSq()>1e-6){ pa.normalize(); pb.normalize();
      var ang=Math.atan2(eje.dot(pa.clone().cross(pb)), pa.dot(pb))*Math.min(1,w);
      var rq=new T.Quaternion().setFromAxisAngle(eje, ang), pq=C.parent.getWorldQuaternion(new T.Quaternion()).invert();
      C.quaternion.copy(pq.multiply(rq).multiply(cq)); C.updateMatrixWorld(true); } }
}
/* las piernas (ikp: { L:{…}, R:{…} }): fijo, el pie se queda donde y como lo dejó la postura A (y el
   cuerpo baja lo que haga falta para llegar, como con el peso); h/o, el tobillo va a un punto de otro
   hueso (como las manos); rod y tob, la rodilla en el suelo en esa dirección desde la cadera ([x, z]) y
   la espinilla tumbada en el suelo en esa otra desde la rodilla */
function mqPierna(T, M, l, c, w){
  var A=M.hueso["muslo"+l], B=M.hueso["pierna"+l], C=M.hueso["pie"+l]; if(!A||!B||!C||w<=0) return;
  function pos(o){ return o.getWorldPosition(new T.Vector3()); }
  function gira(o, de, a){
    var q=new T.Quaternion().setFromUnitVectors(de.normalize(), a.normalize());
    if(w<1) q=new T.Quaternion().slerp(q, w);
    var wq=o.getWorldQuaternion(new T.Quaternion()), pq=o.parent.getWorldQuaternion(new T.Quaternion()).invert();
    o.quaternion.copy(pq.multiply(q).multiply(wq)); o.updateMatrixWorld(true);
  }
  if(c.rod){
    /* se apoya y, si la pierna se hunde en el suelo o se queda en el aire, se corrige la altura de la rodilla */
    var q0={ A:A.quaternion.clone(), B:B.quaternion.clone(), C:C.quaternion.clone() }, rk=c.rk||.03;
    for(var it=0; it<3; it++){
      if(it){ A.quaternion.copy(q0.A); B.quaternion.copy(q0.B); C.quaternion.copy(q0.C); A.updateMatrixWorld(true); }
      mqRodilla(T, A, B, C, c, rk, w, gira);
      var hu=mqHunde(T, M, l); if(Math.abs(hu)<.003) break; rk+=hu; }
    return;
  }
  var fp=c.fijo ? mqPieFijo(T, M, l, c) : null;
  var dest=c.fijo ? (fp ? fp.p.clone() : null) : (c.h ? mqContacto(T, M, c) : null);
  if(!dest) return;
  mqIK2(T, A, B, C, dest, w);
  /* el pie apoyado no gira (o gira sobre la punta lo que diga talon) */
  if(c.fijo){ var cq=C.getWorldQuaternion(new T.Quaternion()).slerp(fp.q, Math.min(1,w)), pq2=C.parent.getWorldQuaternion(new T.Quaternion()).invert();
    C.quaternion.copy(pq2.multiply(cq)); C.updateMatrixWorld(true); }
}
/* la rodilla en el suelo a la altura rk, en la dirección c.rod desde la cadera, y la espinilla tumbada hacia c.tob */
function mqRodilla(T, A, B, C, c, rk, w, gira){
  function pos(o){ return o.getWorldPosition(new T.Vector3()); }
  var h=pos(A), k=pos(B), L1=h.distanceTo(k), dy=Math.min(L1-.001, Math.max(0, h.y-rk)), dh=Math.sqrt(L1*L1-dy*dy);
  var d=new T.Vector3(c.rod[0], 0, c.rod[1]).normalize(), kt=new T.Vector3(h.x+d.x*dh, h.y-dy, h.z+d.z*dh);
  gira(A, k.clone().sub(h), kt.sub(h));
  if(!c.tob) return;
  /* la espinilla: se gira el muslo sobre sí mismo hasta que la rodilla se dobla hacia allí, y se dobla */
  h=pos(A); k=pos(B); var u=k.clone().sub(h).normalize(), s0=pos(C).sub(k), s1=new T.Vector3(c.tob[0], c.tob[2]!=null?c.tob[2]:0, c.tob[1]).normalize();
  var e0=s0.clone().sub(u.clone().multiplyScalar(s0.dot(u))), e1=s1.clone().sub(u.clone().multiplyScalar(s1.dot(u)));
  if(e0.lengthSq()>1e-8 && e1.lengthSq()>1e-8){ e0.normalize(); e1.normalize();
    var ang=Math.atan2(u.dot(e0.clone().cross(e1)), e0.dot(e1))*Math.min(1,w), wq=A.getWorldQuaternion(new T.Quaternion()), pq=A.parent.getWorldQuaternion(new T.Quaternion()).invert();
    A.quaternion.copy(pq.multiply(new T.Quaternion().setFromAxisAngle(u, ang)).multiply(wq)); A.updateMatrixWorld(true); }
  k=pos(B); gira(B, pos(C).sub(k), s1);
  /* el pie, de canto en el suelo: la punta en horizontal (salvo pieLibre, p. ej. el empeine contra la pared) */
  if(c.pieLibre) return;
  var cq=C.getWorldQuaternion(new T.Quaternion()), p0=new T.Vector3(0,1,0).applyQuaternion(cq), p1=p0.clone(); p1.y=0;
  if(p1.lengthSq()>1e-6){ var rq=new T.Quaternion().setFromUnitVectors(p0, p1.normalize()); if(w<1) rq=new T.Quaternion().slerp(rq, w);
    var pq3=C.parent.getWorldQuaternion(new T.Quaternion()).invert(); C.quaternion.copy(pq3.multiply(rq.multiply(cq))); C.updateMatrixWorld(true); }
}
/* cuánto se hunde en el suelo la pierna l (negativo: cuánto le falta para tocarlo) */
function mqHunde(T, M, l){
  var g=M.malla.geometry, v=new T.Vector3(), mw=M.malla.matrixWorld, min=Infinity, i;
  if(!M.piernaV){ var si=g.attributes.skinIndex, sw=g.attributes.skinWeight, nb=M.malla.skeleton.bones, n=g.attributes.position.count; M.piernaV={ L:[], R:[] };
    for(i=0;i<n;i++){ var mejor=0, cual=0; for(var j=0;j<4;j++){ var w=sw.getComponent(i,j); if(w>mejor){ mejor=w; cual=si.getComponent(i,j); } }
      var r=/^(muslo|pierna|pie)([LR])$/.exec(nb[cual].name); if(r && mejor>.5) M.piernaV[r[2]].push(i); } }
  M.raiz.updateMatrixWorld(true);
  M.piernaV[l].forEach(function(k){ M.malla.getVertexPosition(k, v); v.applyMatrix4(mw); if(v.y<min) min=v.y; });
  return isFinite(min) ? -min : 0;
}
/* dónde está el pie fijo: donde lo dejó A, girado sobre la punta (talon, en grados) */
function mqPieFijo(T, M, l, c){
  var f=M.fijoP && M.fijoP[l]; if(!f) return null;
  if(!c.talon) return f;
  var punta=new T.Vector3(0,.17,0).applyQuaternion(f.q).add(f.p), eje=new T.Vector3(1,0,0).applyQuaternion(f.q),
      g=new T.Quaternion().setFromAxisAngle(eje, -c.talon*MQ_R);
  return { p:f.p.clone().sub(punta).applyQuaternion(g).add(punta), q:g.multiply(f.q.clone()) };
}
/* con los pies fijos, el cuerpo baja hasta que las piernas llegan (como hace el peso) */
function mqBajaHastaPies(T, M, P){
  var baja=0;
  ["L","R"].forEach(function(l){ var c=P.ikp[l]; if(!c || !c.fijo || !M.fijoP || !M.fijoP[l]) return;
    var h=M.hueso["muslo"+l].getWorldPosition(new T.Vector3()), k=M.hueso["pierna"+l].getWorldPosition(new T.Vector3()), a=M.hueso["pie"+l].getWorldPosition(new T.Vector3());
    var L=h.distanceTo(k)+k.distanceTo(a)-.004, D=h.clone().sub(mqPieFijo(T, M, l, c).p), hz=D.x*D.x+D.z*D.z;
    if(hz<L*L){ var d=D.y-Math.sqrt(L*L-hz); if(d>baja) baja=d; } });
  if(baja>0){ M.raiz.position.y-=baja; M.raiz.updateMatrixWorld(true); }
}
/* el punto de contacto: un hueso del modelo más un desplazamiento en metros, medido en la pose de
   reposo (x a su izquierda, y arriba, z hacia delante) y que gira con ese hueso, o con el hueso f
   (p. ej. el pecho, para que «delante» sea delante del cuerpo al tocar un brazo) */
function mqContacto(T, M, c){
  var o=M.hueso[c.h], ref=M.hueso[c.f||c.h]; if(!o||!ref) return null;
  var dq=ref.getWorldQuaternion(new T.Quaternion()).multiply(M.reposo[ref.uuid].mundo.clone().invert());
  var p=o.getWorldPosition(new T.Vector3()).add(new T.Vector3(c.o[0],c.o[1],c.o[2]).applyQuaternion(dq));
  /* m: hacia dónde apunta la mano (para apoyarla plana), en el mismo marco */
  if(c.m) p.mano=new T.Vector3(c.m[0],c.m[1],c.m[2]).normalize().applyQuaternion(dq);
  /* n: hacia dónde mira la palma, en el mismo marco */
  if(c.n) p.palma=new T.Vector3(c.n[0],c.n[1],c.n[2]).normalize().applyQuaternion(dq);
  return p;
}
function mqPon(M, P, T){
  var G=mqGuia(T); mqGira(G.C, P);
  var q=mqGuiaQuats(T), meta={}, clav={ clavL:mqClavicula(T, G.C, "L"), clavR:mqClavicula(T, G.C, "R") };
  /* tk: la espalda se arquea (+ redonda hacia atrás, − hundida) sin mover los hombros: la lumbar gira
     hacia un lado y la dorsal lo compensa, y los brazos y la cabeza siguen donde estaban */
  if(P.tk){ var lat=new T.Vector3(1,0,0).applyQuaternion(q.cuerpo);
    q.medio=new T.Quaternion().setFromAxisAngle(lat, -P.tk*MQ_R).multiply(q.medio);
    q.tronco=new T.Quaternion().setFromAxisAngle(lat, P.tk*MQ_R*.8).multiply(q.tronco); }
  M.huesos.forEach(function(b){
    var clave=MQ_HUESOS[b.name], padre=(b.parent && b.parent.isBone) ? meta[b.parent.uuid] : M.base, r=M.reposo[b.uuid], t;
    if(clave) t=q[clave].clone().multiply(G.invT[clave]).multiply(r.mundo);
    else t=padre.clone().multiply(r.local);
    if(clav[b.name] && clav[b.name].ang>0){
      /* gira hacia arriba alrededor del eje que va de delante a atrás del tronco */
      var dirC=new T.Vector3(0,1,0).applyQuaternion(t), eje=dirC.clone().cross(clav[b.name].up).normalize();
      if(eje.lengthSq()>.5) t=new T.Quaternion().setFromAxisAngle(eje, clav[b.name].ang).multiply(t);
    }
    var dedo=/^dedo([12])([LR])$/.exec(b.name);
    if(dedo && P["d"+dedo[2]]) t=t.clone().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0), -P["d"+dedo[2]]*(dedo[1]==="2"?1.15:1)*MQ_R));
    var tob=b.name==="pieL" ? P.fL : b.name==="pieR" ? P.fR : 0;
    if(tob){ var ejeT=new T.Vector3(1,0,0).applyQuaternion(q[b.name==="pieL"?"rL":"rR"]); t=new T.Quaternion().setFromAxisAngle(ejeT, -tob*MQ_R).multiply(t); }
    meta[b.uuid]=t;
    b.quaternion.copy(padre.clone().invert().multiply(t));
  });
  M.raiz.position.set(0,0,0); M.raiz.quaternion.set(0,0,0,1); M.raiz.updateMatrixWorld(true);
  var apoyos=[];
  if(P.ik) ["R","L"].forEach(function(l){ var c=P.ik[l]; if(!c) return;
    if(c.s || c.pared){ apoyos.push([l,c]); return; }
    var d=mqContacto(T, M, c), d0=c.de && mqContacto(T, M, c.de);
    if(d && d0){ var dm=d0.clone().lerp(d, c.u); dm.y+=.1*Math.sin(Math.PI*c.u); if(d.mano && d0.mano) dm.mano=d0.mano.clone().lerp(d.mano, c.u).normalize(); else if(d.mano || d0.mano) dm.mano=(c.u<.5 ? d0 : d).mano; if(d.palma && d0.palma) dm.palma=d0.palma.clone().lerp(d.palma, c.u).normalize(); else if(d.palma || d0.palma) dm.palma=(c.u<.5 ? d0 : d).palma; d=dm; }
    if(d) mqIK(T, M, l, d, c.w==null?1:c.w); });
  /* con las manos apoyadas, el cuerpo se apoya sin contar los brazos, y luego las manos bajan hasta el suelo */
  var suelo=apoyos.some(function(x){ return x[1].s; });
  mqSuelo(T, M, suelo);
  /* alto: a qué altura queda la cadera (lo que baja la pelvis al estirar); las piernas se apoyan después */
  if(P.alto!=null){ var dh=P.alto-M.hueso.cadera.getWorldPosition(new T.Vector3()).y; M.raiz.position.y+=dh; M.raiz.updateMatrixWorld(true); M.caja.translate(new T.Vector3(0,dh,0)); }
  /* ancla: lo que se queda quieto en el suelo (los pies, las rodillas…) no resbala: el cuerpo entero
     se desplaza para que siga donde lo dejó la postura A */
  var an=M.anclas && M.anclas[P.tramo||0];
  function ancla(){ var ac=mqAncla(T, M, an.h), dx=an.en.x-ac.x, dz=an.en.z-ac.z;
    M.raiz.position.x+=dx; M.raiz.position.z+=dz; M.raiz.updateMatrixWorld(true); M.caja.translate(new T.Vector3(dx,0,dz)); }
  /* con anclaRod, lo que no resbala es una rodilla apoyada (rod): el cuerpo se desplaza después de apoyarla */
  var tras=an && an.en && M.anclaRod && P.ikp;
  if(an && an.en && !tras) ancla();
  if(P.ikp){ mqBajaHastaPies(T, M, P);
    ["L","R"].forEach(function(l){ var c=P.ikp[l]; if(c && (!tras || c.rod)) mqPierna(T, M, l, c, c.w==null?1:c.w); });
    if(tras){ ancla(); ["L","R"].forEach(function(l){ var c=P.ikp[l]; if(c && !c.rod) mqPierna(T, M, l, c, c.w==null?1:c.w); }); }
    if(!apoyos.length) mqSuelo(T, M, false); }
  if(apoyos.length){
    function apoya(){ apoyos.forEach(function(x){ var d=mqApoyo(T, M, x[0], x[1]), w=x[1].w==null?1:x[1].w; if(!d) return; mqIK(T, M, x[0], d, w);
      /* la palma justo en la superficie: lo que la mano se hunda o se quede corta se corrige y se vuelve a apoyar */
      if(w>0 && d.sup){ var hu=mqManoEntra(T, M, x[0], d.sup); if(Math.abs(hu)>.002){ d[d.sup.e]-=hu*d.sup.s*Math.min(1,w); mqIK(T, M, x[0], d, w); } } }); }
    apoya();
    /* tira: si las manos fijas no llegan a donde las dejó A, es el cuerpo el que se acerca a ellas
       (p. ej. del perro bocarriba al bocabajo: las manos no se mueven y los pies ruedan sobre los dedos) */
    if(M.tira && M.fijo) for(var it=0; it<4; it++){ var ex=0, ez=0, nf=0;
      apoyos.forEach(function(x){ var f=M.fijo[x[0]]; if(!x[1].fijo || !f) return; var h=M.hueso["mano"+x[0]].getWorldPosition(new T.Vector3()); ex+=f.x-h.x; ez+=f.z-h.z; nf++; });
      if(!nf || Math.hypot(ex/nf, ez/nf)<.003) break;
      M.raiz.position.x+=ex/nf; M.raiz.position.z+=ez/nf; M.raiz.updateMatrixWorld(true); M.caja.translate(new T.Vector3(ex/nf,0,ez/nf)); apoya(); }
    /* y si no llegan al suelo, el cuerpo bascula sobre las puntas de los pies hasta que llegan */
    if(M.tira && M.fijo) for(var ib=0; ib<8; ib++){ var falta=0, hm=new T.Vector3(), nb=0; mqSuelo(T, M, true); apoya();
      apoyos.forEach(function(x){ if(!x[1].s || !x[1].fijo || !M.fijo[x[0]]) return; falta+=-mqManoEntra(T, M, x[0], { e:"y", v:0, s:-1 }); hm.add(M.hueso["mano"+x[0]].getWorldPosition(new T.Vector3())); nb++; });
      if(!nb || falta/nb<.003) break; falta/=nb; hm.multiplyScalar(1/nb);
      var pv=mqPuntoBajo(T, M);
      var dh=hm.clone().sub(pv); dh.y=0; var dist=dh.length(); if(dist<.1) break;
      var giro=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0).cross(dh.normalize()), falta/dist);
      M.raiz.position.sub(pv).applyQuaternion(giro).add(pv); M.raiz.quaternion.premultiply(giro); M.raiz.updateMatrixWorld(true); }
    mqSuelo(T, M, false);
  }
}
/* el punto más bajo del cuerpo sin los brazos (sobre el que bascula al apoyar las manos) */
function mqPuntoBajo(T, M){
  M.raiz.updateMatrixWorld(true); mqSuelo(T, M, true);
  var g=M.malla.geometry, n=g.attributes.position.count, v=new T.Vector3(), mw=M.malla.matrixWorld, p=new T.Vector3(), min=Infinity;
  for(var k=0;k<n;k++){ if(M.brazo[k]) continue; M.malla.getVertexPosition(k, v); v.applyMatrix4(mw); if(v.y<min){ min=v.y; p.copy(v); } }
  return p;
}
/* cuánto entra la mano l en la superficie sup (e: eje, v: dónde está, s: hacia dónde queda el cuerpo
   con signo −: −1 en el suelo); negativo si se queda corta */
function mqManoEntra(T, M, l, sup){
  var g=M.malla.geometry, v=new T.Vector3(), mw=M.malla.matrixWorld, max=-Infinity, i;
  if(!M.manoV){ var si=g.attributes.skinIndex, sw=g.attributes.skinWeight, nb=M.malla.skeleton.bones, n=g.attributes.position.count; M.manoV={ L:[], R:[] };
    for(i=0;i<n;i++){ var mejor=0, cual=0; for(var j=0;j<4;j++){ var w=sw.getComponent(i,j); if(w>mejor){ mejor=w; cual=si.getComponent(i,j); } }
      var r=/^(mano|dedo[12])([LR])$/.exec(nb[cual].name); if(r && mejor>.5) M.manoV[r[2]].push(i); } }
  M.raiz.updateMatrixWorld(true);
  M.manoV[l].forEach(function(k){ M.malla.getVertexPosition(k, v); v.applyMatrix4(mw); var d=(v[sup.e]-sup.v)*sup.s; if(d>max) max=d; });
  return isFinite(max) ? max : 0;
}
/* el punto medio de los huesos del ancla ("pieL+pieR"), donde está ahora */
function mqAncla(T, M, a){
  var p=new T.Vector3(), n=0;
  a.split("+").forEach(function(h){ var o=M.hueso[h]; if(o){ p.add(o.getWorldPosition(new T.Vector3())); n++; } });
  return n ? p.multiplyScalar(1/n) : p;
}
/* apoya el cuerpo en el suelo: su punto más bajo (sin los brazos, si sinBrazos) a la altura 0.
   Si una mano queda por debajo, sube todo lo que haga falta. */
function mqSuelo(T, M, sinBrazos){
  M.raiz.updateMatrixWorld(true);
  var g=M.malla.geometry, n=g.attributes.position.count, v=new T.Vector3(), mw=M.malla.matrixWorld, min=Infinity, minB=Infinity;
  if(!M.brazo){ var si=g.attributes.skinIndex, sw=g.attributes.skinWeight, nb=M.malla.skeleton.bones, i, j;
    M.brazo=new Uint8Array(n);
    for(i=0;i<n;i++){ var mejor=0, cual=0; for(j=0;j<4;j++){ var w=sw.getComponent(i,j); if(w>mejor){ mejor=w; cual=si.getComponent(i,j); } }
      M.brazo[i]=/^(brazo|antebrazo|mano|dedo)/.test(nb[cual].name) ? 1 : 0; } }
  M.caja.makeEmpty();
  for(var k=0;k<n;k++){ M.malla.getVertexPosition(k, v); v.applyMatrix4(mw); M.caja.expandByPoint(v);
    if(M.brazo[k]){ if(v.y<minB) minB=v.y; } else if(v.y<min) min=v.y; }
  var baja=sinBrazos ? min : Math.min(min, minB);
  if(!isFinite(baja)) baja=M.caja.min.y;
  M.raiz.position.y-=baja; M.raiz.updateMatrixWorld(true);
  M.caja.translate(new T.Vector3(0,-baja,0));
}
/* dónde se apoya una mano: donde cae la muñeca, bajada al suelo (s) o llevada a la pared, con la
   mano plana (los dedos siguen hacia donde apuntaban, pero en el plano del apoyo). o: desplazamiento en metros */
function mqApoyo(T, M, l, c){
  var mu=M.hueso["mano"+l]; if(!mu || (c.pared && !M.pared)) return null;
  var p=mu.getWorldPosition(new T.Vector3()), dir=new T.Vector3(0,1,0).applyQuaternion(mu.getWorldQuaternion(new T.Quaternion())), palma;
  /* fijo: la mano no se mueve de donde la dejó la postura A (en el suelo, o en la pared) */
  if(c.fijo && M.fijo && M.fijo[l]){ var eF=c.pared && M.pared ? M.pared.eje : "y"; ["x","y","z"].forEach(function(a){ if(a!==eF) p[a]=M.fijo[l][a]; }); }
  if(c.o) p.add(new T.Vector3(c.o[0],c.o[1],c.o[2]));
  if(c.suave) p.suave=c.suave;
  if(c.pared && M.pared){ var e=M.pared.eje; p[e]=M.pared.v-M.pared.lado*.035; dir[e]=0; palma=new T.Vector3(); palma[e]=M.pared.lado; p.sup={ e:e, v:M.pared.v, s:M.pared.lado };
    /* codo: el antebrazo entero contra la pared */
    if(c.codo){ var nn=new T.Vector3(); nn[e]=M.pared.lado; p.plano={ n:nn, d:M.pared.v*M.pared.lado-.045 }; } }
  else { p.y=.035; palma=new T.Vector3(0,-1,0); p.sup={ e:"y", v:0, s:-1 };
    /* en el suelo los dedos miran hacia donde está la cabeza, un poco abiertos */
    dir=M.hueso.cabeza.getWorldPosition(new T.Vector3()).sub(M.hueso.cadera.getWorldPosition(new T.Vector3()));
    var lado=new T.Vector3(1,0,0).applyQuaternion(M.hueso.espalda2.getWorldQuaternion(new T.Quaternion()).multiply(M.reposo[M.hueso.espalda2.uuid].mundo.clone().invert()));
    dir.y=0; lado.y=0; if(dir.lengthSq()>1e-6 && lado.lengthSq()>1e-6) dir.normalize().add(lado.normalize().multiplyScalar(l==="L"?.18:-.18));
    dir.y=0; }
  if(c.m) dir.set(c.m[0],c.m[1],c.m[2]);
  if(c.n) palma=new T.Vector3(c.n[0],c.n[1],c.n[2]);
  if(dir.lengthSq()<1e-6) dir.set(0,0,1);
  p.mano=dir.normalize(); p.palma=palma.normalize();
  return p;
}
/* escena, luces, suelo y cámara encuadrada para las dos posturas */
function mqEscena(T, k, color){
  var F=MQ_FIG[k]||MQ_FIG.cuello;
  return mqModelo(T, color).then(function(M){
    var esc=new T.Scene();
    /* luz blanca uniforme y un sol suave: el color de la piel se ve como el de su textura */
    /* luz de cielo que llega más por arriba que por abajo, un sol algo más fuerte y un contraluz suave:
       así se leen el volumen y la silueta (con la luz igual por todos lados el cuerpo se veía plano) */
    esc.add(new T.HemisphereLight(0xffffff, 0xb9b1a6, Math.PI*.78));
    var contra=new T.DirectionalLight(0xffffff, .9); contra.position.set(-1.8,2.4,-2.4); esc.add(contra);
    var sol=new T.DirectionalLight(0xffffff, 1.5); sol.position.set(1.54,2.25,2.2); sol.castShadow=true;
    sol.shadow.mapSize.set(2048,2048); sol.shadow.camera.left=-2.4; sol.shadow.camera.right=2.4; sol.shadow.camera.top=2.4; sol.shadow.camera.bottom=-2.4;
    sol.shadow.radius=6; sol.shadow.bias=-.0006; esc.add(sol); esc.add(sol.target);
    if(F.entrepierna) mqEntrepierna(M.malla);
    var suelo=new T.Mesh(new T.CircleGeometry(2.4, 48), new T.ShadowMaterial({ opacity:.2 }));
    suelo.rotation.x=-Math.PI/2; suelo.receiveShadow=true; esc.add(suelo);
    esc.add(M.raiz);
    var tot=new T.Box3();
    /* ancla: lo que no se mueve del suelo, donde lo deja A; con una postura intermedia C puede haber
       otra ancla para el tramo de C a B (["pieL", "pieR"]), que se queda donde la deja C */
    var an=F.ancla ? (Array.isArray(F.ancla) ? F.ancla : [F.ancla, F.ancla]) : null;
    if(F.C) F.B.tramo=1;
    /* si B (o C) dice a qué altura va la cadera, A (y C) también, para mezclarla: la que tienen solas */
    function alto(P){ if(P.alto==null){ M.fijo=null; M.fijoP=null; M.anclas=null; mqPon(M, P, T); P.alto=M.hueso.cadera.getWorldPosition(new T.Vector3()).y; } }
    if(F.B.alto!=null || (F.C && F.C.alto!=null)){ alto(F.A); if(F.C) alto(F.C); }
    M.fijo=null; M.fijoP=null; M.anclas=null; M.anclaRod=!!F.anclaRod; M.tira=!!F.tira; mqPon(M, F.A, T); tot.copy(M.caja);
    if(an){ M.anclas=[{ h:an[0], en:mqAncla(T, M, an[0]) }, { h:an[1], en:null }];
      if(F.C) mqPon(M, F.C, T); M.anclas[1].en=mqAncla(T, M, an[1]); mqPon(M, F.A, T); }
    /* las manos que se quedan quietas (fijo): donde las deja la postura A */
    function fija(){ M.fijo={}; M.fijoP={}; ["L","R"].forEach(function(l){ var c=F.A.ik && F.A.ik[l]; if(c && c.fijo) M.fijo[l]=M.hueso["mano"+l].getWorldPosition(new T.Vector3());
      var e=F.A.ikp && F.A.ikp[l], eb=F.B.ikp && F.B.ikp[l]; if((e && e.fijo) || (eb && eb.fijo)) M.fijoP[l]={ p:M.hueso["pie"+l].getWorldPosition(new T.Vector3()), q:M.hueso["pie"+l].getWorldQuaternion(new T.Quaternion()) }; }); }
    fija(); mqPon(M, F.B, T); tot.union(M.caja);
    if(F.pared){ var W=F.pared===true ? { h:"manoL", eje:"z", d:.035 } : F.pared;
      /* de:"A": la pared se pone donde llega la postura A (p. ej. las manos con los brazos estirados) */
      if(W.de==="A") mqPon(M, F.A, T);
      var pm=M.hueso[W.h].getWorldPosition(new T.Vector3());
      if(W.de==="A") mqPon(M, F.B, T);
      var lado=W.d<0?-1:1, v=pm[W.eje]+W.d, cenW=M.caja.getCenter(new T.Vector3());
      var pared=new T.Mesh(new T.BoxGeometry(W.eje==="z"?1.6:.05, 2.1, W.eje==="z"?.05:1.6), new T.MeshStandardMaterial({ color:0xf1ece4, roughness:.9 }));
      pared.position.set(W.eje==="x" ? v+lado*.025 : cenW.x, 1.05, W.eje==="z" ? v+lado*.025 : cenW.z);
      /* canto: la pared acaba ahí (una esquina, como el marco de una puerta) y el cuerpo puede pasar por delante */
      if(W.canto){ var ot=W.eje==="z" ? "x" : "z", ce=M.hueso[W.canto.h].getWorldPosition(new T.Vector3())[ot]+W.canto.d, sg=W.canto.d<0?-1:1, gr=.3;
        pared.geometry.dispose(); pared.geometry=new T.BoxGeometry(ot==="x"?1.4:gr, 2.1, ot==="z"?1.4:gr);
        pared.position[W.eje]=v+lado*gr/2; pared.position[ot]=ce+sg*.7; pared.castShadow=true; }
      pared.receiveShadow=true; esc.add(pared);
      M.pared={ eje:W.eje, v:v, lado:lado, canto:W.canto ? { eje:ot, v:ce, lado:sg } : null };
      var ex=new T.Vector3(cenW.x, 1.3, cenW.z); ex[W.eje]=v; tot.expandByPoint(ex);
      M.fijo=null; M.fijoP=null; mqPon(M, F.A, T); fija(); tot.union(M.caja); mqPon(M, F.B, T); tot.union(M.caja); }
    var cen=tot.getCenter(new T.Vector3()), tam=tot.getSize(new T.Vector3());
    var cam=new T.PerspectiveCamera(30, 1, .05, 30);
    /* el sol (y su sombra) siguen a la figura: si no, en las posturas que se apartan del centro la sombra salía cortada */
    sol.target.position.set(cen.x, 0, cen.z); sol.position.set(cen.x+1.54, 2.25, cen.z+2.2);
    var az=(F.cam||0), el=(F.el!=null?F.el:14);
    return { esc:esc, cam:cam, M:M, F:F, cen:cen, dist:mqEncuadre(tot, cen, az, el, 15), az:az, el:el };
  });
}
/* la distancia justa para que las dos posturas llenen el cuadro visto desde donde mira la cámara
   (antes se usaba una esfera alrededor de todo y las posturas tumbadas se quedaban pequeñas en medio).
   gira: grados que se balancea la cámara a cada lado, para que tampoco se salga entonces. */
function mqEncuadre(caja, cen, az, el, gira){
  var t=Math.tan(15*MQ_R), d=0, e=el*MQ_R, m=caja.min, M=caja.max;
  [-gira, 0, gira].forEach(function(g){
    var a=(az+g)*MQ_R, fx=Math.sin(a)*Math.cos(e), fy=Math.sin(e), fz=Math.cos(a)*Math.cos(e);   /* hacia la cámara */
    var rx=Math.cos(a), rz=-Math.sin(a);                                                        /* a la derecha */
    var ux=-fy*Math.sin(a), uy=Math.cos(e), uz=-fy*Math.cos(a);                                 /* arriba */
    [m.x,M.x].forEach(function(x){ [m.y,M.y].forEach(function(y){ [m.z,M.z].forEach(function(z){
      var px=x-cen.x, py=y-cen.y, pz=z-cen.z, hacia=px*fx+py*fy+pz*fz;
      d=Math.max(d, Math.abs(px*rx+pz*rz)/t+hacia, Math.abs(px*ux+py*uy+pz*uz)/t+hacia);
    }); }); });
  });
  return d*1.06+.08;
}
/* anchura del contorno: MQ_BORDE_PX píxeles de pantalla, para un dibujo de «alto» píxeles CSS */
var MQ_BORDE_PX=1.3;
function mqGrosor(M, alto, cam){ if(M.contorno) M.contorno.visible=MQ_ESTILO.plano || MQ_ROPA.conRibete!==false; M.grueso.value=(MQ_ESTILO.plano?MQ_ESTILO.borde:MQ_BORDE_PX)*2*Math.tan(cam.fov*MQ_R/2)/Math.max(60, alto||300); }
function mqCamara(E, az, alto){
  mqGrosor(E.M, alto||E.alto, E.cam);
  var a=az*MQ_R, e=E.el*MQ_R;
  E.cam.position.set(E.cen.x+Math.sin(a)*Math.cos(e)*E.dist, E.cen.y+Math.sin(e)*E.dist, E.cen.z+Math.cos(a)*Math.cos(e)*E.dist);
  E.cam.lookAt(E.cen);
}
function mqRenderer(T, lienzo){
  var r=new T.WebGLRenderer({ canvas:lienzo, antialias:true, alpha:true, preserveDrawingBuffer:!!lienzo.dataset.foto });
  r.shadowMap.enabled=true; r.shadowMap.type=T.PCFSoftShadowMap;
  r.toneMapping=T.NoToneMapping; r.outputColorSpace=T.SRGBColorSpace; r.setClearColor(0x000000, 0);
  return r;
}

/* miniaturas: un solo renderer fuera de pantalla hace una foto de la postura B */
var MQ_FOTOS={}, MQ_FOTO_R=null, MQ_COLA=Promise.resolve();
function maniquiFoto(k, tam){
  tam=tam||220;
  var color=mqColor("var(--accent)"), clave=k+"|"+tam+"|"+color+"|"+mqColor("var(--on-accent, #fff)")+"|"+document.documentElement.classList.contains("dark")+"|"+(window.devicePixelRatio||1);
  if(MQ_FOTOS[clave]) return Promise.resolve(MQ_FOTOS[clave]);
  /* de una en una, que el renderer es compartido */
  var p=MQ_COLA.then(function(){ return maniquiCarga(); }).then(function(T){
    if(MQ_FOTOS[clave]) return MQ_FOTOS[clave];
    if(!MQ_FOTO_R){ var cv=document.createElement("canvas"); cv.dataset.foto="1"; MQ_FOTO_R=mqRenderer(T, cv); }
    /* a la densidad de la pantalla, para que en el móvil no se vea borrosa */
    var dpr=Math.min(3, window.devicePixelRatio||1); if(MQ_FOTO_R.getPixelRatio()!==dpr) MQ_FOTO_R.setPixelRatio(dpr);
    if(MQ_FOTO_R._tam!==tam){ MQ_FOTO_R._tam=tam; MQ_FOTO_R.setSize(tam,tam,false); }
    return mqEscena(T, k, color).then(function(E){
      mqPon(E.M, E.F.B, T); mqCamara(E, E.az, tam);
      MQ_FOTO_R.render(E.esc, E.cam);
      return (MQ_FOTOS[clave]=MQ_FOTO_R.domElement.toDataURL("image/png"));
    });
  });
  MQ_COLA=p.catch(function(){});
  return p;
}
/* rellena los <img data-mq="postura"> que haya dentro de un elemento */
function maniquiFotos(dentro){
  if(!dentro) return;
  Array.prototype.forEach.call(dentro.querySelectorAll("img[data-mq]:not([src])"), function(im){
    maniquiFoto(im.dataset.mq, +im.dataset.mqt||0).then(function(u){ im.src=u; im.classList.add("ve"); }).catch(function(){});
  });
}
/* la escena animada del modo guiado */
/* lado: una función que dice si se hace hacia el otro lado (la imagen se ve en espejo), o true para
   cambiar de lado en cada vuelta */
function maniquiVivo(lienzo, k, quieto, lado){
  var vivo={ para:function(){ vivo.fin=true; } };
  maniquiCarga().then(function(T){
    if(vivo.fin) return;
    return mqEscena(T, k, mqColor("var(--accent)")).then(function(E){
      if(vivo.fin) return;
      var r=mqRenderer(T, lienzo), t0=performance.now();
      function tam(){ var w=lienzo.clientWidth||300, h=lienzo.clientHeight||300; r.setPixelRatio(Math.min(3, window.devicePixelRatio||1)); r.setSize(w,h,false); E.cam.aspect=w/h; E.cam.updateProjectionMatrix(); }
      tam();
      function suave(x){ return x<.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2; }
      function cuadro(ahora){
        if(vivo.fin){ r.dispose(); try{ r.forceContextLoss(); }catch(e){} return; }
        var s=((ahora-t0)/4200)%1, t, vuelta=Math.floor((ahora-t0)/4200);
        if(quieto) t=1; else if(s<.32) t=suave(s/.32); else if(s<.68) t=1; else t=1-suave((s-.68)/.32);
        var espejo=typeof lado==="function" ? !!lado() : (lado===true && vuelta%2===1);
        if(espejo!==vivo.espejo){ vivo.espejo=espejo; lienzo.style.transform=espejo ? "scaleX(-1)" : ""; if(E.M.ropa) E.M.ropa.espejo.value=espejo ? -1 : 1; }
        mqPon(E.M, mqFigT(E.F, t), T);
        mqCamara(E, E.az + (quieto?0:Math.sin((ahora-t0)/2600)*14), lienzo.clientHeight);
        if(lienzo.clientWidth && Math.abs(lienzo.clientWidth-lienzo.width/r.getPixelRatio())>2) tam();
        r.render(E.esc, E.cam);
        requestAnimationFrame(cuadro);
      }
      requestAnimationFrame(cuadro);
    });
  }).catch(function(){ var p=lienzo.parentNode; if(p) p.classList.add("sin-3d"); });
  return vivo;
}

