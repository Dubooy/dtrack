/* ════════════════════════════════════════════════════════════════
   ALIMENTACIÓN (Vital, entre Ejercicio y Meditación)
   · «He comido bien»: un toque al día, +10 XP.
   · Ideas para tus comidas: desayuno, almuerzo y cena. La primera vez
     que abres una, te pregunta el objetivo (definir, mantenerte o
     volumen); se puede cambiar cuando quieras. Para cada objetivo hay
     15 platos de cada comida, con el tiempo y la proteína aproximada.
   · Se guarda en S.comeBien (días) y S.aliObjetivo.
   ════════════════════════════════════════════════════════════════ */
var ALI_XP=10;
var ALI_OBJETIVOS=[
  { k:"definir",  n:"Definir",     d:"Perder grasa sin perder músculo. Platos ligeros, con mucha verdura y proteína." },
  { k:"mantener", n:"Mantenerme",  d:"Comer equilibrado y con energía para el día, sin contar nada." },
  { k:"volumen",  n:"Volumen",     d:"Ganar músculo. Raciones más grandes, con más hidratos y proteína." }
];
var ALI_COMIDAS=[
  { k:"desayuno", n:"Desayuno" },
  { k:"almuerzo", n:"Almuerzo" },
  { k:"cena",     n:"Cena" }
];
/* [plato, minutos, gramos de proteína aproximados] */
/* [plato, minutos, proteína, hidratos, grasas] en gramos, aproximados, para una ración normal */
var ALI_PLATOS={
  definir:{
    desayuno:[
      ["Tortilla de claras con espinacas y pan integral",10,24,22,5],
      ["Yogur griego natural con frutos rojos y unas nueces",5,17,14,14],
      ["Tostada integral con pavo, tomate y aceite de oliva",5,19,24,8],
      ["Avena cocida con leche desnatada, canela y manzana",10,14,52,5],
      ["Revuelto de huevo con champiñones y tostada integral",10,19,22,14],
      ["Queso fresco batido con fresas y semillas de chía",5,20,16,5],
      ["Kéfir con frutos rojos y copos de avena",5,12,35,6],
      ["Tortitas de avena y claras con fruta",15,22,45,5],
      ["Pan integral con un poco de aguacate y huevo cocido",10,13,25,14],
      ["Gofio con leche desnatada y una pieza de fruta",5,12,55,3],
      ["Requesón con kiwi y unas almendras",5,16,15,10],
      ["Tostada de centeno con salmón ahumado y queso fresco",5,20,20,9],
      ["Dos huevos cocidos con tomate aliñado y fruta",10,13,20,10],
      ["Skyr con mango y copos de avena",5,18,38,3],
      ["Tortilla de claras y atún con pan integral",10,28,22,4]
    ],
    almuerzo:[
      ["Pechuga de pollo a la plancha con ensalada y un poco de arroz integral",25,38,35,10],
      ["Merluza al horno con patata y verduras",30,32,35,8],
      ["Lentejas estofadas con verduras, sin chorizo",40,20,50,7],
      ["Ensalada de garbanzos con atún, tomate, pepino y huevo",10,30,30,12],
      ["Salmón a la plancha con brócoli y quinoa",20,32,30,18],
      ["Pavo salteado con verduras al wok",20,34,15,9],
      ["Garbanzos con espinacas",25,18,45,10],
      ["Bol de arroz integral con pollo, maíz y aguacate",20,35,55,14],
      ["Filete de ternera magra con pimientos asados",20,34,12,12],
      ["Crema de calabacín y tortilla francesa",25,20,12,15],
      ["Pasta integral con atún, tomate natural y albahaca",20,28,60,8],
      ["Pescado a la plancha con unas papas arrugadas y mojo verde",30,30,35,12],
      ["Ensalada de quinoa con pollo y verduras asadas",20,30,38,11],
      ["Hamburguesa casera de pollo con ensalada",20,32,8,10],
      ["Potaje de berros ligero, con millo y calabaza",45,15,45,8]
    ],
    cena:[
      ["Tortilla de calabacín con ensalada",15,20,10,14],
      ["Dorada al horno con verduras",25,30,12,12],
      ["Crema de verduras y pechuga de pavo a la plancha",20,28,18,7],
      ["Revuelto de gambas y espárragos trigueros",15,25,6,12],
      ["Ensalada templada de pollo y espinacas",15,30,10,11],
      ["Sepia a la plancha con ensalada",15,28,8,7],
      ["Brochetas de pavo y verduras",20,30,12,8],
      ["Calabacín relleno de carne picada magra",30,25,12,12],
      ["Merluza en papillote con verduras",20,30,10,6],
      ["Tofu salteado con verduras",15,20,12,12],
      ["Salpicón de marisco",15,22,8,9],
      ["Huevos al plato con tomate y espinacas",15,18,10,15],
      ["Wrap integral de pollo y verduras",10,28,32,9],
      ["Ensalada de atún, huevo y aguacate",10,28,8,20],
      ["Pescado blanco con puré de coliflor",25,28,12,9]
    ]
  },
  mantener:{
    desayuno:[
      ["Tostadas con tomate, aceite de oliva y jamón serrano",5,15,40,14],
      ["Bol de yogur con granola y fruta",5,12,50,10],
      ["Avena con leche, plátano y crema de cacahuete",10,15,60,14],
      ["Huevos revueltos con tostada y zumo de naranja",10,16,40,14],
      ["Tortitas de plátano y huevo con un poco de miel",15,14,45,10],
      ["Gofio amasado con leche y plátano",5,12,65,6],
      ["Bocadillo pequeño de tortilla francesa",10,16,40,13],
      ["Tostada con aguacate y huevo poché",10,14,28,16],
      ["Bol de batido de frutos rojos, plátano y avena",10,10,55,6],
      ["Pan con queso fresco, tomate y orégano",5,14,35,8],
      ["Muesli con leche y manzana",5,12,60,8],
      ["Sándwich de pavo y queso con una pieza de fruta",5,20,45,10],
      ["Kéfir con kiwi y copos de avena",5,12,40,7],
      ["Tostada de centeno con hummus y huevo",5,14,32,13],
      ["Crepes de avena con fresas",15,14,42,8]
    ],
    almuerzo:[
      ["Paella de pollo y verduras",45,30,75,15],
      ["Pasta con boloñesa casera",30,30,75,16],
      ["Lentejas con arroz",40,20,70,8],
      ["Pollo al horno con patatas y ensalada",45,35,45,18],
      ["Potaje de garbanzos con bacalao",40,28,50,12],
      ["Salmón al horno con patata y espárragos",30,32,40,20],
      ["Arroz a la cubana con huevo",25,16,80,18],
      ["Fajitas de pollo con pimientos",25,32,50,14],
      ["Ropa vieja canaria",40,30,40,16],
      ["Albóndigas en salsa con arroz",40,28,60,20],
      ["Ensalada de pasta con atún y huevo",20,26,55,14],
      ["Puchero de verduras con garbanzos",60,20,60,12],
      ["Pescado a la plancha con papas arrugadas y mojo",30,30,45,16],
      ["Macarrones con pollo y tomate",25,30,70,12],
      ["Arroz con pollo al curry suave",30,30,70,14]
    ],
    cena:[
      ["Tortilla de patatas con ensalada",30,18,30,20],
      ["Sándwich mixto con crema de verduras",15,20,40,16],
      ["Pizza casera integral de verduras y jamón",30,25,60,16],
      ["Pescado al horno con verduras",25,28,15,12],
      ["Quesadillas de pollo y queso",15,30,40,18],
      ["Revuelto de setas con pan",15,18,30,16],
      ["Ensalada César casera",15,28,20,20],
      ["Hamburguesa casera con ensalada",20,30,10,22],
      ["Crema de calabaza con huevo duro y picatostes",25,14,35,12],
      ["Burrito de alubias, arroz y queso",15,20,65,14],
      ["Salmón con arroz y verduras",20,30,50,18],
      ["Pisto con huevo",30,14,20,16],
      ["Pollo a la plancha con patatas asadas",30,32,40,12],
      ["Tostas de atún, pimiento asado y huevo",10,24,35,12],
      ["Wok de fideos con verduras y pollo",20,28,60,12]
    ]
  },
  volumen:{
    desayuno:[
      ["Avena con leche entera, plátano, crema de cacahuete y miel",10,22,95,24],
      ["Tortitas de avena y huevo con fruta y miel",15,25,85,15],
      ["Bocadillo de tortilla con jamón",10,28,60,22],
      ["Tres huevos revueltos con tostadas y aguacate",10,24,45,30],
      ["Batido de leche, plátano, avena y cacao",5,20,80,12],
      ["Gofio con leche, plátano y almendras",5,18,80,16],
      ["Yogur griego con granola, miel y nueces",5,20,60,22],
      ["Tostadas con aceite, tomate, jamón y queso",5,26,55,22],
      ["Sándwich de pollo, queso y aguacate",10,32,45,22],
      ["Porridge de avena con dátiles y crema de almendras",10,18,85,18],
      ["Pan integral con crema de cacahuete, plátano y un vaso de leche",5,20,70,20],
      ["Burrito de desayuno: huevo, queso y frijoles",15,30,55,22],
      ["Crepes rellenos de queso fresco y fruta",15,22,60,14],
      ["Muesli con leche entera, frutos secos y fruta",5,18,75,20],
      ["Torrija de pan integral con fruta y yogur",15,20,70,14]
    ],
    almuerzo:[
      ["Arroz con pollo y verduras, ración grande",30,45,100,15],
      ["Pasta boloñesa con queso",30,40,100,22],
      ["Lentejas con arroz y huevo",40,30,85,14],
      ["Ternera con patatas y pimientos",35,42,60,20],
      ["Poke de salmón con arroz, aguacate y edamame",20,38,80,24],
      ["Pollo al curry con garbanzos y arroz",30,42,95,18],
      ["Cocido de garbanzos con carne",90,40,70,28],
      ["Paella mixta",50,38,95,18],
      ["Macarrones gratinados con carne y tomate",35,40,95,24],
      ["Bol de arroz, frijoles, pollo, maíz y aguacate",25,45,100,20],
      ["Ropa vieja con papas",45,38,65,20],
      ["Lasaña de carne",60,35,60,30],
      ["Hamburguesa casera con pan y patatas al horno",30,40,85,28],
      ["Fideuá de pescado",40,30,90,18],
      ["Pollo al horno con boniato",45,40,70,14]
    ],
    cena:[
      ["Tortilla de patatas con pan",30,25,75,28],
      ["Pizza casera de pollo",35,40,85,22],
      ["Wrap de pollo, arroz y queso",15,40,75,18],
      ["Salmón con quinoa y aguacate",20,36,55,30],
      ["Revuelto de huevos con patatas y jamón",20,30,45,28],
      ["Pasta al pesto con pollo y nueces",20,38,85,28],
      ["Quesadillas de carne picada y frijoles",20,38,65,26],
      ["Hamburguesa de ternera con boniato asado",30,38,60,24],
      ["Arroz tres delicias casero con huevo y pollo",25,32,90,16],
      ["Bocadillo de lomo con queso y pimientos",15,36,65,20],
      ["Tacos de pescado con guacamole",25,30,60,22],
      ["Crema de legumbres con huevo y pan",25,26,70,14],
      ["Fajitas de ternera",25,38,65,20],
      ["Patatas rellenas de atún y queso",40,32,70,18],
      ["Pollo teriyaki con arroz",25,38,90,12]
    ]
  }
};

/* kcal a partir de los macros (4 · 4 · 9), redondeadas a 5 */
function aliKcal(p){ return Math.round((p[2]*4+p[3]*4+p[4]*9)/5)*5; }
function aliBien(d){ return !!(S.comeBien && S.comeBien[d]); }
function aliObjetivo(){ var o=S.aliObjetivo; return (o==="definir"||o==="mantener"||o==="volumen") ? o : ""; }
function aliObjNombre(o){ for(var i=0;i<ALI_OBJETIVOS.length;i++) if(ALI_OBJETIVOS[i].k===o) return ALI_OBJETIVOS[i].n; return ""; }
function aliComidaNombre(m){ for(var i=0;i<ALI_COMIDAS.length;i++) if(ALI_COMIDAS[i].k===m) return ALI_COMIDAS[i].n; return ""; }
/* la idea del día: cambia cada día, la misma todo el día */
function aliIdeaHoy(o, m){
  var l=ALI_PLATOS[o][m], d=today(), h=m.length*7+o.length;
  for(var i=0;i<d.length;i++) h=(h*31+d.charCodeAt(i))>>>0;
  return h % l.length;
}

/* +10 XP el día que has comido bien */
var _aliDayXP=dayXP;
dayXP=function(d, tmap){ return _aliDayXP(d, tmap)+(aliBien(d) ? ALI_XP : 0); };

var ALI_ICO={
  desayuno:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10h12v4.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 11.5h1.2a2.3 2.3 0 0 1 0 4.6h-1.6"/><path d="M8.5 3.5c-.8 1 .8 2-.1 3.2M12.5 3.5c-.8 1 .8 2-.1 3.2"/></svg>',
  almuerzo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12.5" r="6.2"/><circle cx="12" cy="12.5" r="3.2"/><path d="M3 4v5.5M4.8 4v5.5M3 7h1.8M3.9 9.5v11"/><path d="M21 4c-1.6.8-2.2 2.7-2.2 5.2V12H21M21 4v16.5"/></svg>',
  cena:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5a7.8 7.8 0 1 0 9.7 9.7z"/><path d="M16.5 3.5v2.6M15.2 4.8h2.6"/></svg>',
  hoja:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-4 6-6.5 10-8.5"/></svg>',
  lapiz:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 19.5l1-4L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.5 18.5z"/></svg>',
  reloj:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>',
  flecha:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  definir:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3.5 3.4 5.5 6.5 5.5 9.6a5.5 5.5 0 0 1-11 0c0-3.1 2-6.2 5.5-9.6z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2"/></svg>',
  mantener:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M5 20h14"/><path d="M4.5 8h15"/><path d="M4.5 8 2.5 13a2.3 2.3 0 0 0 4 0zM19.5 8l-2 5a2.3 2.3 0 0 0 4 0z"/></svg>',
  volumen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.5v5M6.5 7v10M17.5 7v10M20.5 9.5v5M6.5 12h11"/></svg>'
};

/* ── la tarjeta ── */
function aliTarjetaHTML(){
  var t=curDay(), esHoy=(t===today()), bien=aliBien(t), o=aliObjetivo();
  var semana=0, dias="", l=lunesDe(today());
  for(var i=0;i<7;i++){
    var d=addDays(l,i), si=aliBien(d); if(si) semana++;
    dias+='<span class="ali-dia'+(si?" si":"")+(d===today()?" hoy":"")+(d>today()?" fut":"")+'"><i></i><small>'+INI[new Date(d+"T00:00:00").getDay()]+'</small></span>';
  }
  var tiles=ALI_COMIDAS.map(function(c){
    var sub = o ? '<small class="ali-t-hoy">'+esc(ALI_PLATOS[o][c.k][aliIdeaHoy(o,c.k)][0])+'</small>'
                : '<small>15 ideas</small>';
    return '<button class="ali-tile ali-'+c.k+'" data-act="x-ali-comida" data-m="'+c.k+'">'+
      '<span class="ali-t-ic">'+ALI_ICO[c.k]+'</span>'+
      '<b>'+c.n+'</b>'+sub+'</button>';
  }).join("");
  return '<div class="flex items-start justify-between mb-6">'+
      '<div><h2 class="display text-[17px] font-bold">Alimentación</h2>'+
        '<p class="text-[12.5px] t3 mt-0.5">'+(esHoy?"¿Has comido bien hoy?":"¿Comiste bien ese día?")+
        ' <span class="chip ml-1" style="background:color-mix(in srgb,var(--good) 15%,transparent);color:var(--good)">+'+ALI_XP+' XP</span></p></div>'+
      '<div class="text-right"><div class="display text-[30px] font-extrabold num leading-none">'+semana+'<span class="ali-de">/7</span></div>'+
        '<div class="text-[11px] t3 mt-1">esta semana</div></div>'+
    '</div>'+
    '<button id="ali-btn" class="ali-btn'+(bien?" si":"")+'" data-act="x-ali-bien" data-day="'+t+'">'+
      (bien ? '<span class="display">'+(esHoy?"Hoy has comido bien":"Ese día comiste bien")+
                '<svg class="ali-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg></span>'
            : '<span class="display"><span class="ali-btn-ic">'+ALI_ICO.hoja+'</span>'+(esHoy?"He comido bien":"Ese día comí bien")+'</span>')+
    '</button>'+
    '<div class="ali-semana">'+dias+'</div>'+
    '<div class="ali-sep"></div>'+
    '<div class="ali-cab"><span class="eyebrow">Ideas para tus comidas</span>'+
      '<button class="ali-obj'+(o?"":" vacio")+'" data-act="x-ali-objetivo">'+
        (o ? '<span class="ali-obj-ic">'+ALI_ICO[o]+'</span>'+aliObjNombre(o)+'<span class="ali-obj-ed">'+ALI_ICO.lapiz+'</span>'
           : 'Elegir objetivo')+'</button></div>'+
    '<div class="ali-tiles">'+tiles+'</div>'+
    (o ? '<p class="ali-pie">Debajo de cada comida, la idea de hoy. Toca para ver las 15.</p>' : '');
}
function aliPintaTarjeta(){
  var gb=document.getElementById("gym-btn"); if(!gb) return;
  var gym=gb.closest(".glass"); if(!gym || !gym.parentNode) return;
  var c=document.getElementById("ali-card");
  if(!c){ c=document.createElement("div"); c.id="ali-card"; c.className="glass rounded-[24px] pad"; }
  if(gym.nextSibling!==c) gym.parentNode.insertBefore(c, gym.nextSibling);
  if(c.dataset.anima==="1") return;
  c.innerHTML=aliTarjetaHTML();
}

/* ── el objetivo ── */
var aliLuego="";
function aliSheetObjetivo(luego){
  aliLuego=luego||"";
  var o=aliObjetivo();
  openSheet('<div class="flex items-start justify-between mb-2"><h3 class="display text-[20px] font-bold">¿Cuál es tu objetivo?</h3>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4">Con esto te propongo platos que encajen contigo. Puedes cambiarlo cuando quieras.</p>'+
    '<div class="ali-objs">'+ALI_OBJETIVOS.map(function(x){
      return '<button class="ali-o ali-o-'+x.k+(o===x.k?" on":"")+'" data-act="x-ali-obj-elige" data-o="'+x.k+'">'+
        '<span class="ali-o-ic">'+ALI_ICO[x.k]+'</span>'+
        '<span class="ali-o-t"><b>'+x.n+'</b><small>'+x.d+'</small></span>'+
        '<span class="ali-o-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg></span>'+
      '</button>';
    }).join("")+'</div>');
}

/* ── las ideas de una comida ── */
var aliVer="desayuno";
function aliSheetIdeas(m){
  aliVer=m||aliVer;
  var o=aliObjetivo(); if(!o){ aliSheetObjetivo(aliVer); return; }
  var l=ALI_PLATOS[o][aliVer], hoy=aliIdeaHoy(o, aliVer);
  var orden=[hoy].concat(l.map(function(x,i){ return i; }).filter(function(i){ return i!==hoy; }));
  var tarjetas=orden.map(function(i, k){
    var p=l[i];
    return '<div class="ali-plato'+(k===0?" hoy":"")+'">'+
      (k===0 ? '<span class="ali-hoy-et">Idea de hoy</span>' : '')+
      '<b>'+esc(p[0])+'</b>'+
      '<span class="ali-meta"><span>'+ALI_ICO.reloj+p[1]+' min</span></span>'+
      '<span class="ali-macros num">'+
        '<span class="m-kcal"><b>'+aliKcal(p)+'</b><small>kcal</small></span>'+
        '<span class="m-prot"><b>'+p[2]+' g</b><small>Proteína</small></span>'+
        '<span class="m-hid"><b>'+p[3]+' g</b><small>Hidratos</small></span>'+
        '<span class="m-gra"><b>'+p[4]+' g</b><small>Grasas</small></span>'+
      '</span>'+
    '</div>';
  }).join("");
  openSheet('<div class="flex items-start justify-between mb-3"><h3 class="display text-[20px] font-bold">Ideas para '+(aliVer==="desayuno"?"el desayuno":aliVer==="almuerzo"?"el almuerzo":"la cena")+'</h3>'+closeBtn()+'</div>'+
    '<div class="ali-tabs" role="tablist">'+ALI_COMIDAS.map(function(c){
      return '<button role="tab" aria-selected="'+(c.k===aliVer)+'" class="'+(c.k===aliVer?"on":"")+'" data-act="x-ali-tab" data-m="'+c.k+'">'+ALI_ICO[c.k]+c.n+'</button>'; }).join("")+'</div>'+
    '<p class="eyebrow mt-4 mb-2">Tu objetivo</p>'+
    '<div class="ali-seg">'+ALI_OBJETIVOS.map(function(x){
      return '<button class="'+(x.k===o?"on":"")+'" data-act="x-ali-obj-cambia" data-o="'+x.k+'">'+x.n+'</button>'; }).join("")+'</div>'+
    '<div class="ali-lista">'+tarjetas+'</div>'+
    '<p class="ali-nota">Orientativo: los valores son aproximados para una ración normal y cambian con la cantidad. Si tienes dudas sobre qué te conviene, pregunta a un profesional de la nutrición.</p>');
  var sb=document.getElementById("sheet-body"); if(sb) sb.scrollTop=0;
}

/* ── marcar que has comido bien ── */
function aliMarca(el){
  var d=(el && el.dataset.day)||curDay();
  if(!S.comeBien) S.comeBien={};
  var on=!S.comeBien[d];
  if(typeof xpPreparar==="function" && on) xpPreparar();
  if(on){ S.comeBien[d]=1; if(!S.meals[d]) S.meals[d]={}; } else delete S.comeBien[d];
  save(); render();
  var b=document.getElementById("ali-btn"); if(!b) return;
  if(!on){ sonido("des"); return; }
  b.classList.add("ali-sello");
  sonido("pop"); try{ if(navigator.vibrate) navigator.vibrate(16); }catch(e){}
  if(typeof celebraEn==="function") celebraEn(b, "+"+ALI_XP+" XP");
  var r=b.getBoundingClientRect();
  if(typeof xpVuela==="function") xpVuela(r.left+r.width/2, r.top+r.height/2, ALI_XP);
}

function aliAccion(a, el){
  if(a.indexOf("x-ali-")!==0) return false;
  if(a==="x-ali-bien"){ aliMarca(el); return true; }
  if(a==="x-ali-objetivo"){ aliSheetObjetivo(""); return true; }
  if(a==="x-ali-comida"){ var m=el.dataset.m; if(!aliObjetivo()) aliSheetObjetivo(m); else aliSheetIdeas(m); sonido("tick"); return true; }
  if(a==="x-ali-obj-elige"){
    S.aliObjetivo=el.dataset.o; save(); sonido("pop");
    if(aliLuego){ var m2=aliLuego; aliLuego=""; aliSheetIdeas(m2); } else closeSheet();
    render(); return true;
  }
  if(a==="x-ali-obj-cambia"){ S.aliObjetivo=el.dataset.o; save(); sonido("tick"); aliSheetIdeas(aliVer); render(); return true; }
  if(a==="x-ali-tab"){ sonido("tick"); aliSheetIdeas(el.dataset.m); return true; }
  return false;
}

var ALI_CSS=[
'#ali-card .ali-de{ font-size:17px; color:var(--t3); font-weight:700; margin-left:1px; }',
'.ali-btn{ position:relative; width:100%; border-radius:18px; padding:20px 16px; display:flex; justify-content:center; align-items:center;',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--t2); transition:background .4s var(--spring), box-shadow .4s var(--spring), transform .35s var(--spring); }',
'.ali-btn:active{ transform:scale(.965); }',
'.ali-btn > span{ display:inline-flex; align-items:center; gap:9px; font-size:19px; font-weight:700; }',
'.ali-btn-ic{ width:22px; height:22px; display:grid; place-items:center; color:var(--good); } .ali-btn-ic svg{ width:21px; height:21px; }',
'.ali-btn.si{ color:var(--on-accent); box-shadow:0 10px 26px -10px color-mix(in srgb,var(--good) 60%,transparent);',
'  background:linear-gradient(145deg, color-mix(in srgb,var(--good) 88%,var(--gold)), color-mix(in srgb,var(--good) 58%,var(--gold))); }',
'.ali-btn.si > span{ color:#fff; }',
'.ali-check{ width:22px; height:22px; } .ali-check path{ stroke-dasharray:24; stroke-dashoffset:0; }',
'.ali-btn.ali-sello{ animation:gymSello .62s cubic-bezier(.3,1.5,.5,1); } .ali-btn.ali-sello .ali-check path{ animation:gymTraza .45s ease-out .18s both; }',
'.ali-semana{ display:flex; gap:6px; margin-top:14px; }',
'.ali-dia{ flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; }',
'.ali-dia i{ display:block; width:100%; height:6px; border-radius:99px; background:var(--fill-hi); transition:background .4s var(--ease); }',
'.ali-dia.si i{ background:color-mix(in srgb,var(--good) 80%,var(--gold)); }',
'.ali-dia.fut i{ opacity:.5; }',
'.ali-dia small{ font-size:10.5px; color:var(--t3); } .ali-dia.hoy small{ color:var(--t1); font-weight:700; }',
'.ali-sep{ height:1px; background:var(--hairline-2); margin:22px -4px 18px; }',
'.ali-cab{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px; }',
'.ali-obj{ display:inline-flex; align-items:center; gap:6px; padding:6px 8px 6px 7px; border-radius:99px; font-size:12.5px; font-weight:700;',
'  background:var(--accent-soft); color:var(--accent); flex:0 0 auto; }',
'.ali-obj.vacio{ padding:6px 12px; }',
'.ali-obj-ic{ width:18px; height:18px; display:grid; place-items:center; } .ali-obj-ic svg{ width:16px; height:16px; }',
'.ali-obj-ed{ width:18px; height:18px; display:grid; place-items:center; opacity:.7; } .ali-obj-ed svg{ width:12px; height:12px; }',
'.ali-tiles{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }',
'.ali-tile{ --tc:var(--accent); min-width:0; display:flex; flex-direction:column; align-items:flex-start; gap:2px; text-align:left; padding:12px 11px 13px;',
'  border-radius:18px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:transform .3s var(--spring), box-shadow .3s var(--ease); }',
'.ali-tile:active{ transform:scale(.96); }',
'.ali-tile:hover{ box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tc) 40%,transparent); }',
'.ali-desayuno{ --tc:var(--gold); } .ali-almuerzo{ --tc:var(--good); } .ali-cena{ --tc:var(--violet); }',
'.ali-t-ic{ width:34px; height:34px; border-radius:11px; display:grid; place-items:center; margin-bottom:8px;',
'  background:color-mix(in srgb,var(--tc) 16%,transparent); color:var(--tc); } .ali-t-ic svg{ width:20px; height:20px; }',
'.ali-tile b{ font-size:14px; font-weight:700; color:var(--t1); }',
'.ali-tile small{ font-size:11.5px; line-height:1.35; color:var(--t3); }',
'.ali-t-hoy{ display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; overflow-wrap:anywhere; }',
'.ali-pie{ margin-top:10px; font-size:11.5px; color:var(--t3); }',
/* hoja del objetivo */
'.ali-objs{ display:flex; flex-direction:column; gap:8px; }',
'.ali-o{ --oc:var(--accent); display:flex; align-items:center; gap:13px; width:100%; text-align:left; padding:14px; border-radius:18px;',
'  background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); transition:box-shadow .3s var(--ease), transform .3s var(--spring); }',
'.ali-o:active{ transform:scale(.98); }',
'.ali-o-definir{ --oc:var(--cyan); } .ali-o-mantener{ --oc:var(--good); } .ali-o-volumen{ --oc:var(--warn); }',
'.ali-o-ic{ width:42px; height:42px; border-radius:14px; flex:0 0 auto; display:grid; place-items:center; background:color-mix(in srgb,var(--oc) 16%,transparent); color:var(--oc); }',
'.ali-o-ic svg{ width:23px; height:23px; }',
'.ali-o-t{ flex:1; min-width:0; } .ali-o-t b{ display:block; font-size:16px; } .ali-o-t small{ display:block; font-size:12.5px; line-height:1.4; color:var(--t3); margin-top:2px; }',
'.ali-o-ok{ width:24px; height:24px; border-radius:99px; flex:0 0 auto; display:grid; place-items:center; box-shadow:inset 0 0 0 1.5px var(--hairline); color:transparent; }',
'.ali-o-ok svg{ width:14px; height:14px; }',
'.ali-o.on{ box-shadow:inset 0 0 0 2px var(--oc); } .ali-o.on .ali-o-ok{ background:var(--oc); box-shadow:none; color:#fff; }',
/* hoja de ideas */
'.ali-tabs{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; padding:4px; border-radius:16px; background:var(--fill); }',
'.ali-tabs button{ display:flex; align-items:center; justify-content:center; gap:6px; padding:9px 4px; border-radius:12px; font-size:13.5px; font-weight:700; color:var(--t2); transition:all .25s var(--ease); }',
'.ali-tabs button svg{ width:17px; height:17px; flex:0 0 auto; }',
'.ali-tabs button.on{ background:var(--glass-bg-hi); color:var(--t1); box-shadow:0 1px 3px rgba(0,0,0,.08), inset 0 0 0 1px var(--hairline); }',
'html.dark .ali-tabs button.on{ background:var(--fill-hi); }',
'.ali-seg{ display:flex; flex-wrap:wrap; gap:6px; }',
'.ali-seg button{ padding:8px 14px; border-radius:99px; font-size:13px; font-weight:700; background:var(--fill); color:var(--t2); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.ali-seg button.on{ background:var(--accent); color:var(--on-accent); box-shadow:none; }',
'.ali-lista{ display:flex; flex-direction:column; gap:8px; margin-top:16px; }',
'.ali-plato{ position:relative; padding:13px 14px; border-radius:16px; background:var(--fill); box-shadow:inset 0 0 0 1px var(--hairline-2); }',
'.ali-plato b{ display:block; font-size:14.5px; font-weight:650; line-height:1.35; color:var(--t1); }',
'.ali-meta{ display:flex; flex-wrap:wrap; gap:6px 12px; margin-top:7px; font-size:12px; color:var(--t3); }',
'.ali-meta > span{ display:inline-flex; align-items:center; gap:4px; } .ali-meta svg{ width:13px; height:13px; }',
'.ali-macros{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; margin-top:10px; }',
'.ali-macros > span{ display:flex; flex-direction:column; align-items:center; gap:1px; padding:7px 4px 6px; border-radius:11px;',
'  background:color-mix(in srgb,var(--mc) 11%,transparent); }',
'.ali-macros b{ font-size:13.5px; font-weight:800; color:var(--mc); letter-spacing:-.01em; white-space:nowrap; }',
'.ali-macros small{ font-size:10px; font-weight:600; color:var(--t3); }',
'.m-kcal{ --mc:var(--accent); } .m-prot{ --mc:var(--good); } .m-hid{ --mc:var(--gold); } .m-gra{ --mc:var(--violet); }',
'.ali-plato.hoy{ background:color-mix(in srgb,var(--accent) 9%,var(--glass-bg)); box-shadow:inset 0 0 0 1.5px var(--accent-line); padding-top:12px; }',
'.ali-hoy-et{ display:inline-block; margin-bottom:6px; font-size:10.5px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); }',
'.ali-nota{ margin-top:14px; font-size:11.5px; line-height:1.5; color:var(--t3); }',
'@media (prefers-reduced-motion:reduce){ .ali-btn.ali-sello, .ali-btn.ali-sello .ali-check path{ animation:none; } }'
].join("\n");

var _aliGA=grupoAccion;
grupoAccion=function(a, el){ if(aliAccion(a, el)) return true; return _aliGA.apply(this, arguments); };
var _aliTR=grupoTrasRender;
grupoTrasRender=function(){ var r=_aliTR.apply(this, arguments); if(view==="vital") aliPintaTarjeta(); return r; };
(function(){ var st=document.createElement("style"); st.id="ali-css"; st.textContent=ALI_CSS; document.head.appendChild(st); })();
