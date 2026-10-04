/* ════════════ para crecer: libros por tema y estiramientos guiados ════════════
   Una tarjeta en Objetivos con dos pestañas. Los libros se agrupan por tema,
   cada uno con su color; los estiramientos van en rutinas cortas y cada paso
   tiene un enlace a vídeos para ver cómo se hace. Desde las dos se crea un
   hábito con un botón. */
ICO_B.libro=ICO_B.estudiar;
ICO_B.estira='<circle cx="12" cy="4.5" r="2"/><path d="M4 9.5l8 1.5 8-1.5"/><path d="M12 11v4.5l-4 5M12 15.5l4 5"/>';
ICO_B.video='<rect x="3" y="5.5" width="18" height="13" rx="3.5"/><path d="M10.5 9.5v5l4.2-2.5z"/>';

var LIB_TEMAS=[
  { k:"economia", t:"Economía", c:"var(--good)", libros:[
    { t:"Economía en una lección", a:"Henry Hazlitt", p:"Cómo pensar en las consecuencias de una decisión más allá de lo que se ve a primera vista." },
    { t:"El economista camuflado", a:"Tim Harford", p:"La economía de lo cotidiano: por qué un café cuesta lo que cuesta." },
    { t:"Freakonomics", a:"Steven D. Levitt y Stephen J. Dubner", p:"Preguntas raras respondidas con datos. Engancha desde la primera página." },
    { t:"La psicología del dinero", a:"Morgan Housel", p:"Ahorrar e invertir tiene más de comportamiento que de matemáticas." },
    { t:"El hombre más rico de Babilonia", a:"George S. Clason", p:"Las reglas básicas del dinero contadas como fábulas. Muy corto." }
  ]},
  { k:"negocio", t:"Negocio", c:"var(--warn)", libros:[
    { t:"De cero a uno", a:"Peter Thiel", p:"Cómo crear algo nuevo en vez de copiar lo que ya existe." },
    { t:"El método Lean Startup", a:"Eric Ries", p:"Probar una idea pequeña y barata antes de apostarlo todo." },
    { t:"Nunca te pares", a:"Phil Knight", p:"La historia de cómo empezó Nike, contada por su fundador." },
    { t:"Cómo ganar amigos e influir sobre las personas", a:"Dale Carnegie", p:"Un clásico sobre tratar con la gente. Sirve para todo, no solo para vender." }
  ]},
  { k:"politica", t:"Política", c:"var(--alert)", libros:[
    { t:"Rebelión en la granja", a:"George Orwell", p:"Una fábula corta sobre cómo el poder cambia a quien lo tiene." },
    { t:"1984", a:"George Orwell", p:"Vigilancia, propaganda y control. Para entender muchas noticias de hoy." },
    { t:"El príncipe", a:"Nicolás Maquiavelo", p:"El manual original del poder, escrito hace 500 años." },
    { t:"Por qué fracasan los países", a:"Daron Acemoglu y James A. Robinson", p:"Por qué unos países son ricos y otros pobres: las instituciones importan." }
  ]},
  { k:"mente", t:"Mente", c:"var(--violet)", libros:[
    { t:"Hábitos atómicos", a:"James Clear", p:"Cambios pequeños que se suman. Encaja con lo que ya haces en Peak." },
    { t:"Mindset", a:"Carol S. Dweck", p:"La diferencia entre creer que tu talento es fijo o que se entrena." },
    { t:"El hombre en busca de sentido", a:"Viktor Frankl", p:"Lo que aprendió un psiquiatra en un campo de concentración." },
    { t:"Meditaciones", a:"Marco Aurelio", p:"Las notas de un emperador romano para mantener la calma." },
    { t:"Pensar rápido, pensar despacio", a:"Daniel Kahneman", p:"Cómo decide tu cerebro y cuándo te engaña. Más largo, pero vale la pena." }
  ]},
  { k:"historia", t:"Historia y ciencia", c:"var(--cyan)", libros:[
    { t:"Sapiens. De animales a dioses", a:"Yuval Noah Harari", p:"La historia de la humanidad de un tirón." },
    { t:"Factfulness", a:"Hans Rosling", p:"El mundo va mejor de lo que crees, y los datos lo demuestran." },
    { t:"Breve historia del tiempo", a:"Stephen Hawking", p:"El universo, los agujeros negros y el big bang, sin fórmulas." },
    { t:"Armas, gérmenes y acero", a:"Jared Diamond", p:"Por qué la historia fue como fue en cada continente." }
  ]}
];

/* rutinas de estiramientos: s = segundos de cada paso, m = músculos, v = búsqueda de vídeo, f = postura de la persona 3D */
var ESTIRA_RUTINAS=[
  { k:"superior", t:"Cuello, espalda alta y hombros", sub:"Tren superior", c:"var(--accent)", pasos:[
    { t:"Inclinación lateral de cuello", s:60, m:"Trapecio superior y elevador de la escápula", d:"De pie, mirada al frente. Inclina la cabeza hacia el hombro derecho sin subirlo y pon la mano derecha sobre la sien izquierda para tirar suave hacia abajo. Espalda recta y hombros bajos. 30 segundos por lado.", v:"estiramiento cuello inclinacion lateral trapecio", f:"cuello" },
    { t:"Barbilla a la clavícula", s:60, m:"Esplenio de la cabeza y trapecio posterior", d:"Gira la cabeza 45 grados a la derecha y baja la barbilla hacia la clavícula derecha. Con la mano derecha en la nuca, guía el movimiento hacia abajo con suavidad. 30 segundos por lado.", v:"estiramiento cuello rotacion flexion barbilla clavicula", f:"barbilla" },
    { t:"Codo tras la cabeza", s:60, m:"Tríceps y dorsal ancho", d:"Sube los dos brazos. Dobla el codo derecho y lleva la palma a la escápula izquierda. Con la mano izquierda, coge el codo derecho y tira hacia la izquierda por detrás de la cabeza, con el tronco erguido. 30 segundos por lado.", v:"estiramiento triceps detras de la cabeza", f:"triceps" },
    { t:"Brazo cruzado", s:60, m:"Deltoides posterior e infraespinoso", d:"Sube el brazo derecho al frente a la altura del hombro y crúzalo por delante del pecho. Engánchalo con el antebrazo izquierdo por debajo y apriétalo contra el pecho. 30 segundos por lado.", v:"estiramiento hombro brazo cruzado", f:"cruzado" },
    { t:"Pecho con dedos entrelazados", s:30, m:"Pectoral mayor y deltoides anterior", d:"Lleva los brazos atrás y entrelaza los dedos detrás de la zona lumbar. Estira los codos, junta las paletillas y sube un poco los puños hacia atrás mientras abres el pecho.", v:"estiramiento pecho manos entrelazadas detras", f:"pecho" },
    { t:"Pectoral en la pared", s:60, m:"Pectoral mayor y menor", d:"Brazo derecho en L: el hombro a 90 grados y el codo a 90 grados. Apoya el antebrazo y la palma en una pared, da un paso al frente con el pie izquierdo y gira un poco el tronco hacia la izquierda. 30 segundos por lado.", v:"estiramiento pectoral pared marco puerta", f:"pectoral" },
    { t:"Enhebrar la aguja", s:60, m:"Romboides y movilidad de la columna torácica", d:"A cuatro patas, manos bajo los hombros y rodillas bajo la cadera. Pasa el brazo derecho por debajo del cuerpo hacia la izquierda hasta apoyar el hombro y la sien derechos en el suelo. La mano izquierda sigue apoyada. 30 segundos por lado.", v:"thread the needle estiramiento", f:"aguja" }
  ]},
  { k:"tronco", t:"Tronco y espalda", sub:"Lumbares y espalda completa", c:"var(--violet)", pasos:[
    { t:"Gato-vaca", s:45, m:"Erectores de la columna, recto abdominal y movilidad de la espalda", d:"A cuatro patas. Vaca: hunde la tripa, lleva la pelvis atrás y mira arriba. Gato: redondea toda la espalda hacia el techo, mete la pelvis y lleva la barbilla al pecho. Alterna despacio.", v:"estiramiento gato vaca", f:"gato" },
    { t:"Postura del camello", s:30, m:"Cadena anterior: flexores de cadera, abdomen y pectoral", d:"De rodillas, tronco vertical y muslos rectos. Arquea la espalda hacia atrás llevando los hombros atrás y pon las palmas en los talones (o en la zona lumbar si no llegas), con el pecho abierto hacia el techo.", v:"postura del camello ustrasana", f:"camello" },
    { t:"Postura del niño", s:45, m:"Dorsal ancho, erectores de la espalda y glúteos", d:"De rodillas, junta los dedos gordos de los pies y abre las rodillas algo más que la cadera. Siéntate sobre los talones, estira los brazos al frente en el suelo y apoya la frente.", v:"postura del niño estiramiento", f:"nino" },
    { t:"Perro bocarriba", s:30, m:"Abdominales, flexores del cuello y extensores de la espalda", d:"Boca abajo con las piernas estiradas y las palmas a los lados del pecho. Empuja el suelo estirando los codos, sube el tronco y deja la pelvis cerca del suelo mientras abres el pecho.", v:"perro bocarriba cobra estiramiento", f:"cobra" },
    { t:"Rotación torácica a cuatro patas", s:60, m:"Oblicuos y movilidad torácica", d:"A cuatro patas, mano derecha en la nuca con el codo hacia fuera. Gira el tronco llevando el codo derecho hacia la muñeca izquierda y luego ábrelo hacia el techo. 30 segundos por lado.", v:"rotacion toracica cuadrupedia t spine", f:"tspine" },
    { t:"Torsión tumbado", s:60, m:"Lumbares, glúteo medio y oblicuos", d:"Boca arriba con los brazos en cruz. Sube la pierna derecha con la cadera y la rodilla a 90 grados y déjala caer cruzando el cuerpo hacia la izquierda, con el hombro derecho pegado al suelo. 30 segundos por lado.", v:"torsion espinal tumbado estiramiento", f:"torsion" }
  ]},
  { k:"cadera", t:"Cadera y glúteos", sub:"Cadera, glúteos y pelvis", c:"var(--warn)", pasos:[
    { t:"La paloma", s:60, m:"Glúteo mayor, piriforme y rotadores de la cadera", d:"Desde cuatro patas, lleva la rodilla derecha detrás de la muñeca derecha con la espinilla hacia la izquierda. Estira la pierna izquierda atrás en el suelo y baja la pelvis. 30 segundos por lado.", v:"postura de la paloma estiramiento", f:"paloma" },
    { t:"Figura de 4 en el suelo", s:60, m:"Piriforme y glúteo profundo", d:"Boca arriba con las rodillas dobladas y los pies en el suelo. Cruza el tobillo derecho sobre el muslo izquierdo, coge la espinilla izquierda justo bajo la rodilla con las dos manos y acércala al pecho. 30 segundos por lado.", v:"estiramiento gluteo tumbado figura 4", f:"gluteo" },
    { t:"Mariposa", s:45, m:"Aductores y pectíneo", d:"Sentado con el tronco erguido, dobla las rodillas hacia los lados y junta las plantas de los pies. Coge los pies con las manos y acércalos hacia ti sin encorvarte: la espalda se queda recta y son las piernas las que se acercan.", v:"estiramiento mariposa aductores", f:"mariposa" },
    { t:"Estiramiento del caballero", s:60, m:"Psoas, ilíaco y recto femoral", d:"Rodilla izquierda en el suelo y pie derecho delante, las dos a 90 grados. Mete la pelvis apretando el glúteo izquierdo y lleva el peso hacia delante sin soltarla. 30 segundos por lado.", v:"estiramiento flexor de cadera arrodillado psoas", f:"flexor" },
    { t:"Sentadilla del cosaco", s:60, m:"Aductores, isquiotibiales y tobillo", d:"De pie con las piernas muy abiertas. Baja como si te sentaras sobre el talón derecho: la rodilla se dobla mucho, la cadera va atrás y el talón no se levanta del suelo. La pierna izquierda queda estirada con el talón apoyado y las puntas mirando al techo. 30 segundos por lado.", v:"sentadilla cosaco", f:"cosaco" },
    { t:"Postura de la rana", s:45, m:"Aductores profundos y cadera", d:"A cuatro patas sobre algo blando, abre las rodillas todo lo que puedas con rodillas y tobillos a 90 grados. Apoya los antebrazos y lleva la cadera atrás con suavidad.", v:"frog stretch postura de la rana", f:"rana" }
  ]},
  { k:"muslos", t:"Cuádriceps e isquios", sub:"Muslos", c:"var(--good)", pasos:[
    { t:"Cuádriceps de pie", s:60, m:"Cuádriceps", d:"De pie sobre la pierna izquierda. Dobla la rodilla derecha, lleva el talón al glúteo y cógelo con la mano derecha, con las rodillas juntas. 30 segundos por pierna.", v:"estiramiento cuadriceps de pie", f:"cuadriceps" },
    { t:"Estiramiento en la pared", s:60, m:"Recto femoral y psoas", d:"De rodillas de espaldas a una pared. Apoya la espinilla izquierda en la pared con los dedos hacia arriba, pon el pie derecho delante a 90 grados y sube el tronco hasta quedar erguido, con la pelvis metida, el glúteo apretado y la zona lumbar neutra. 30 segundos por pierna.", v:"couch stretch estiramiento", f:"sofa" },
    { t:"Isquios de pie con el talón", s:60, m:"Isquiotibiales", d:"Da medio paso al frente con la derecha y apoya solo el talón con las puntas arriba. Dobla la rodilla izquierda, echa el glúteo atrás con la espalda recta y apoya las dos manos en la rodilla derecha. 30 segundos por pierna.", v:"estiramiento isquiotibiales de pie talon", f:"isquiopie" },
    { t:"Perro bocabajo", s:45, m:"Isquiotibiales, gemelos, sóleo y lumbares", d:"Desde cuatro patas, apoya los dedos de los pies y levanta las rodillas. Empuja la cadera arriba y atrás hasta formar una V invertida, con los talones hacia el suelo y la espalda y los brazos en línea.", v:"perro bocabajo downward dog", f:"perroabajo" },
    { t:"Isquios sentado con una pierna", s:60, m:"Isquiotibiales y lumbares", d:"Sentado con la pierna derecha estirada. Apoya la planta del pie izquierdo en el muslo derecho por dentro e inclínate desde la cadera, girando un poco el pecho hacia la pierna derecha, con las manos hacia el pie derecho y la espalda recta. 30 segundos por pierna.", v:"janu sirsasana estiramiento isquiotibiales", f:"janu" }
  ]},
  { k:"gemelos", t:"Gemelos y tobillos", sub:"Pierna baja", c:"var(--cyan)", pasos:[
    { t:"Gemelos en la pared", s:60, m:"Gemelos", d:"De cara a una pared, palmas apoyadas a la altura de los hombros. Da un paso largo atrás con la derecha y mantén esa rodilla estirada y el talón pegado al suelo mientras llevas la cadera al frente. 30 segundos por pierna.", v:"estiramiento gemelos pared", f:"gemelos" },
    { t:"Sóleo en la pared", s:60, m:"Sóleo", d:"Igual que el de gemelos, con un paso algo más corto. Dobla la rodilla de atrás y mantén el talón en el suelo, notándolo en el tendón de Aquiles. 30 segundos por pierna.", v:"estiramiento soleo pared rodilla flexionada", f:"soleo" },
    { t:"Tobillo en zancada", s:60, m:"Tendón de Aquiles y tobillo", d:"Rodilla de atrás en el suelo y pie de delante adelantado. Lleva la rodilla de delante por encima y más allá de los dedos sin despegar el talón, con las dos manos sobre esa rodilla. 30 segundos por pierna.", v:"movilidad tobillo dorsiflexion zancada rodilla", f:"tobillo" }
  ]},
  { k:"completo", t:"Cuerpo completo", sub:"Cadenas enteras en movimiento", c:"var(--alert)", pasos:[
    { t:"El mejor estiramiento del mundo", s:60, m:"Psoas, isquios, cadera y rotación torácica", d:"Zancada larga con la derecha y las dos manos en el suelo por dentro del pie derecho. Baja el codo derecho hacia el tobillo y luego gira el tronco subiendo el brazo derecho hacia el techo. 30 segundos por lado.", v:"worlds greatest stretch", f:"mundo" },
    { t:"Jefferson curl", s:45, m:"Espalda e isquiotibiales", d:"De pie con los pies juntos. Baja primero la barbilla al pecho y enrolla la espalda vértebra a vértebra dejando colgar los brazos, sin doblar las rodillas. Sube igual de despacio.", v:"jefferson curl estiramiento", f:"jefferson" },
    { t:"De perro bocarriba a bocabajo", s:45, m:"Todo el cuerpo, de delante a atrás", d:"Empieza en perro bocarriba. Aprieta la tripa y sube la cadera atrás y arriba sin mover las manos, rodando sobre los dedos de los pies, hasta la V invertida del perro bocabajo. Si te tiran los isquios, dobla un poco las rodillas. Vuelve y repite.", v:"perro bocarriba a perro bocabajo vinyasa", f:"vinyasa" }
  ]}
];
var crecerTab="libros";

function estiraMin(r){ return Math.round(r.pasos.reduce(function(s,p){ return s+p.s; },0)/60); }
function estiraHabito(r){ return "Estiramientos: "+r.t.toLowerCase()+" ("+estiraMin(r)+" min)"; }
function libroHabito(b){ return "Leer 10 páginas de «"+b.t+"»"; }
function estiraVideo(q){ return "https://www.youtube.com/results?search_query="+encodeURIComponent(q); }
function habitoTiene(tx){ var k=tx.toLowerCase(); return idealTodos().some(function(x){ return String(x.text||"").toLowerCase()===k; }); }
function habitoAnade(tx, tag){
  if(habitoTiene(tx)){ avisoNube("Ya está en tus hábitos."); return false; }
  S.ideal.push({ id:uid(), time:"", text:tx, tag:tag, desde:today() });
  save(); sonido("pop"); avisoNube("Añadido a tus hábitos: "+tx);
  return true;
}
function libroTema(k){ for(var i=0;i<LIB_TEMAS.length;i++) if(LIB_TEMAS[i].k===k) return LIB_TEMAS[i]; return LIB_TEMAS[0]; }
function estiraRutina(k){ for(var i=0;i<ESTIRA_RUTINAS.length;i++) if(ESTIRA_RUTINAS[i].k===k) return ESTIRA_RUTINAS[i]; return ESTIRA_RUTINAS[0]; }
/* el lomo de un libro: un bloque de color con las iniciales del título */
function libroLomo(b, c){
  var ini=b.t.replace(/[«»¿?¡!.,]/g,"").split(/\s+/).filter(function(w){ return w.length>2 || /^\d/.test(w); }).slice(0,2).map(function(w){ return w.charAt(0).toUpperCase(); }).join("");
  return '<span class="cr-lomo" style="--c:'+c+'"><b>'+esc(ini||b.t.charAt(0))+'</b></span>';
}

function pintaCrecer(){
  var obj=document.getElementById("rt-obj"); if(!obj) return;
  var el=document.getElementById("rt-crecer");
  if(!el){ el=document.createElement("div"); el.id="rt-crecer"; el.className="glass rounded-[24px] pad"; }
  var ex=document.getElementById("rt-exp");
  if(ex && ex.parentNode===obj){ if(ex.nextSibling!==el) obj.insertBefore(el, ex.nextSibling); } else if(el.parentNode!==obj) obj.appendChild(el);
  var h='<div class="cr-cab"><div><h2 class="display">Para crecer</h2><p>Libros para pensar mejor y estiramientos para el cuerpo. Conviértelos en hábito con un toque.</p></div></div>'+
    '<div class="cr-tabs"><button data-act="x-cr-tab" data-t="libros" class="'+(crecerTab==="libros"?"on":"")+'">'+ico("libro")+'Libros</button>'+
    '<button data-act="x-cr-tab" data-t="estira" class="'+(crecerTab==="estira"?"on":"")+'">'+ico("estira")+'Estiramientos</button></div>';
  if(crecerTab==="libros"){
    h+='<div class="cr-temas">'+LIB_TEMAS.map(function(T){
      return '<button class="cr-tema" data-act="x-cr-libros" data-k="'+T.k+'" style="--c:'+T.c+'">'+
        '<span class="cr-pila">'+T.libros.slice(0,3).map(function(b){ return libroLomo(b, T.c); }).join("")+'</span>'+
        '<b>'+esc(T.t)+'</b><small>'+T.libros.length+' libros</small></button>'; }).join("")+'</div>';
  } else {
    h+='<div class="cr-rutinas">'+ESTIRA_RUTINAS.map(function(r){
      return '<button class="cr-rutina" data-act="x-cr-rutina" data-k="'+r.k+'" style="--c:'+r.c+'">'+
        '<span class="cr-r-ico"><img data-mq="'+r.pasos[0].f+'" alt=""></span><span class="cr-r-t"><b>'+esc(r.t)+'</b><small>'+esc(r.sub)+' · '+r.pasos.length+' pasos</small></span>'+
        '<em class="num">'+estiraMin(r)+' min</em></button>'; }).join("")+'</div>';
  }
  el.innerHTML=h;
  if(crecerTab==="estira") maniquiFotos(el);
}

function sheetLibros(k){
  var T=libroTema(k);
  openSheet('<div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">Libros para crecer</p><h3 class="display text-[20px] font-bold">'+esc(T.t)+'</h3></div>'+closeBtn()+'</div>'+
    '<div class="cr-chips">'+LIB_TEMAS.map(function(x){ return '<button data-act="x-cr-libros" data-k="'+x.k+'" class="'+(x.k===T.k?"on":"")+'" style="--c:'+x.c+'">'+esc(x.t)+'</button>'; }).join("")+'</div>'+
    '<div class="cr-libros">'+T.libros.map(function(b,i){
      var ya=habitoTiene(libroHabito(b));
      return '<div class="cr-libro">'+libroLomo(b, T.c)+
        '<div class="cr-l-t"><b>'+esc(b.t)+'</b><small>'+esc(b.a)+'</small><p>'+esc(b.p)+'</p></div>'+
        (ya?'<span class="cr-ya">'+ICON_CHECK+'</span>':'<button class="cr-empieza" data-act="x-cr-leer" data-k="'+T.k+'" data-i="'+i+'">Lo empiezo</button>')+'</div>'; }).join("")+'</div>'+
    '<p class="cr-nota">«Lo empiezo» añade el hábito de leer 10 páginas al día de ese libro.</p>');
}

function sheetRutina(k){
  var r=estiraRutina(k), ya=habitoTiene(estiraHabito(r));
  openSheet('<div class="flex items-start justify-between mb-2"><div><p class="eyebrow mb-1.5">Estiramientos · '+estiraMin(r)+' min</p><h3 class="display text-[20px] font-bold">'+esc(r.t)+'</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4 leading-relaxed">'+esc(r.sub)+'. Sin forzar: tiene que tirar, no doler.</p>'+
    '<ol class="cr-pasos" style="--c:'+r.c+'">'+r.pasos.map(function(p,i){
      return '<li><span class="cr-mini"><img data-mq="'+p.f+'" alt=""></span><div class="cr-p-t"><b><span class="cr-n num">'+(i+1)+'</span>'+esc(p.t)+' <span class="num">· '+(p.s>=60&&p.s%60===0?(p.s/60)+" min":p.s+" s")+'</span></b>'+(p.m?'<small class="cr-musc">'+esc(p.m)+'</small>':'')+'<p>'+esc(p.d)+'</p>'+
        '<a class="cr-video" href="'+estiraVideo(p.v)+'" target="_blank" rel="noopener noreferrer">'+ico("video")+'Ver cómo se hace</a></div></li>'; }).join("")+'</ol>'+
    '<button class="btn btn-primary w-full !py-3 mt-4" data-act="x-cr-empieza" data-k="'+r.k+'">Empezar rutina guiada</button>'+
    (ya?'<p class="cr-nota" style="text-align:center">Ya la tienes en tus hábitos. Al terminarla se marca sola.</p>'
       :'<button class="btn btn-quiet w-full !py-3 mt-2" data-act="x-cr-estira" data-k="'+r.k+'">Añadir a mis hábitos</button>'));
  maniquiFotos(document.getElementById("sheet-body"));
}

function crecerAccion(a, el){
  if(guiaAccion(a)) return true;
  if(a==="x-cr-empieza"){ guiaEmpieza(el.dataset.k); return true; }
  if(a==="x-cr-tab"){ crecerTab=el.dataset.t; sonido("tick"); pintaCrecer(); return true; }
  if(a==="x-cr-libros"){ sheetLibros(el.dataset.k); return true; }
  if(a==="x-cr-rutina"){ sheetRutina(el.dataset.k); return true; }
  if(a==="x-cr-leer"){ var T=libroTema(el.dataset.k), b=T.libros[+el.dataset.i]; if(b && habitoAnade(libroHabito(b), "personal")){ sheetLibros(T.k); render(); } return true; }
  if(a==="x-cr-estira"){ var r=estiraRutina(el.dataset.k); if(habitoAnade(estiraHabito(r), "vital")){ sheetRutina(r.k); render(); } return true; }
  return false;
}
function crecerTrasRender(){ if(view==="retos") pintaCrecer(); }

var CRECER_CSS=[
'.cr-cab h2{ font-size:17px; font-weight:800; letter-spacing:-.02em; } .cr-cab p{ font-size:12.5px; color:var(--t3); margin-top:2px; line-height:1.4; }',
'.cr-tabs{ display:flex; gap:6px; margin:14px 0 14px; padding:4px; border-radius:14px; background:var(--fill); }',
'.cr-tabs button{ flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:9px 8px; border-radius:11px; font-size:13px; font-weight:700; color:var(--t2); transition:background .2s var(--ease), color .2s var(--ease); }',
'.cr-tabs button .ic{ width:16px; height:16px; }',
'.cr-tabs button.on{ background:var(--glass-bg-hi); color:var(--t1); box-shadow:0 1px 3px rgba(0,0,0,.08), inset 0 0 0 1px var(--hairline-2); }',
'.cr-temas{ display:grid; grid-template-columns:repeat(auto-fill,minmax(128px,1fr)); gap:8px; }',
'.cr-tema{ display:flex; flex-direction:column; align-items:flex-start; gap:2px; padding:12px; border-radius:16px; text-align:left;',
'  background:color-mix(in srgb,var(--c) 10%,transparent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 22%,transparent); transition:transform .2s var(--spring); }',
'.cr-tema:active{ transform:scale(.97); }',
'.cr-tema b{ font-size:13.5px; font-weight:700; margin-top:8px; } .cr-tema small{ font-size:11.5px; color:var(--t3); }',
'.cr-pila{ display:flex; gap:3px; align-items:flex-end; height:44px; }',
'.cr-lomo{ display:grid; place-items:center; flex:0 0 auto; width:30px; height:44px; border-radius:4px 7px 7px 4px; color:#fff;',
'  background:linear-gradient(90deg, color-mix(in srgb,var(--c) 70%,#000) 0 4px, var(--c) 4px); box-shadow:0 2px 6px color-mix(in srgb,var(--c) 30%,transparent); }',
'.cr-pila .cr-lomo:nth-child(2){ height:38px; opacity:.85; } .cr-pila .cr-lomo:nth-child(3){ height:41px; opacity:.7; }',
'.cr-lomo b{ font-size:10.5px; font-weight:800; letter-spacing:.02em; }',
'.cr-rutinas{ display:flex; flex-direction:column; gap:8px; }',
'.cr-rutina{ display:flex; align-items:center; gap:12px; padding:12px; border-radius:16px; text-align:left;',
'  background:color-mix(in srgb,var(--c) 9%,transparent); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 20%,transparent); }',
'.cr-r-ico{ display:grid; place-items:center; width:54px; height:54px; border-radius:14px; border-radius:12px; flex:0 0 auto; color:#fff; background:var(--c); }',
'.cr-r-ico{ padding:3px; overflow:hidden; } .cr-pasos li .cr-mini{ overflow:hidden; }',
'.cr-r-t{ flex:1; min-width:0; } .cr-r-t b{ display:block; font-size:14px; font-weight:700; } .cr-r-t small{ display:block; font-size:12px; color:var(--t3); margin-top:1px; }',
'.cr-rutina em{ font-style:normal; font-size:12px; font-weight:700; color:var(--c); padding:5px 10px; border-radius:99px; background:color-mix(in srgb,var(--c) 14%,transparent); }',
'.cr-chips{ display:flex; gap:6px; overflow-x:auto; margin:6px -2px 14px; padding:2px; scrollbar-width:none; }',
'.cr-chips button{ flex:0 0 auto; font-size:12.5px; font-weight:700; padding:7px 12px; border-radius:99px; background:var(--fill); color:var(--t2); }',
'.cr-chips button.on{ background:var(--c); color:#fff; }',
'.cr-libros{ display:flex; flex-direction:column; }',
'.cr-libro{ display:flex; align-items:flex-start; gap:12px; padding:12px 0; box-shadow:inset 0 -1px 0 var(--hairline-2); }',
'.cr-libro .cr-lomo{ width:38px; height:54px; } .cr-libro .cr-lomo b{ font-size:12px; }',
'.cr-l-t{ flex:1; min-width:0; } .cr-l-t b{ display:block; font-size:14px; font-weight:700; line-height:1.3; } .cr-l-t small{ display:block; font-size:12px; color:var(--t3); margin-top:1px; }',
'.cr-l-t p{ font-size:12.5px; color:var(--t2); margin-top:5px; line-height:1.4; }',
'.cr-empieza{ flex:0 0 auto; font-size:12px; font-weight:700; color:var(--accent); padding:6px 11px; border-radius:99px; background:var(--accent-soft); margin-top:2px; }',
'.cr-ya{ flex:0 0 auto; display:grid; place-items:center; width:28px; height:28px; border-radius:99px; color:#fff; background:var(--good); margin-top:2px; }',
'.cr-ya svg{ width:14px; height:14px; }',
'.cr-nota{ font-size:12px; color:var(--t3); margin-top:12px; line-height:1.4; }',
'.cr-pasos{ display:flex; flex-direction:column; gap:4px; }',
'.cr-pasos li{ display:flex; gap:12px; padding:10px 0; box-shadow:inset 0 -1px 0 var(--hairline-2); }',
'.cr-n{ display:inline-grid; place-items:center; width:20px; height:20px; margin-right:7px; vertical-align:1px; border-radius:99px; font-size:11px; font-weight:800; color:#fff; background:var(--c); }',
'.cr-p-t{ flex:1; min-width:0; } .cr-p-t b{ font-size:14px; font-weight:700; } .cr-p-t b span{ font-weight:600; color:var(--t3); font-size:12.5px; }',
'.cr-p-t b .cr-n{ color:#fff; font-size:11px; font-weight:800; }',
'.cr-p-t p{ font-size:12.5px; color:var(--t2); margin-top:3px; line-height:1.4; }',
'.cr-musc{ display:block; font-size:11.5px; font-weight:700; color:var(--c); margin-top:2px; }',
'.cr-video{ display:inline-flex; align-items:center; gap:6px; margin-top:7px; font-size:12.5px; font-weight:700; color:var(--accent); }',
'.cr-video .ic{ width:16px; height:16px; }'
].join("\n");
(function(){ var st=document.createElement("style"); st.id="crecer-css"; st.textContent=CRECER_CSS; document.head.appendChild(st); })();

