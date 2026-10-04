/* ════════════ lectura: libros de verdad dentro de Hábitos ════════════
   Una biblioteca de libros reales por tema, una encuesta que elige tu
   siguiente libro y un bloque «Lectura» en la tarjeta de Hábitos.
   Empezar un libro crea un hábito con cantidad (páginas al día), así que
   el progreso del libro sale solo de lo que apuntas cada día.
     S.lectura.libros[id] = { e:"leyendo"|"pausa"|"leido"|"quiero", habs:[ids], total, desde, fin }
     S.lectura.enc        = { r:{respuestas}, top:[ids], f:fecha }
   Las portadas son tipográficas y propias (sin imágenes con derechos). */
ICO_B.libro=ICO_B.libro||ICO_B.estudiar;

var LB_TEMAS=[
  { k:"eco", t:"Economía y dinero", c:"#1f8a5b", pal:[["#10382b","#f3ead3","#d9a441"],["#ece3cc","#173a2b","#b5452f"],["#1f6f55","#fff8e7","#f2c14e"],["#f6f1e6","#0f3d2e","#2f8f6a"]] },
  { k:"neg", t:"Negocio", c:"#d9822b", pal:[["#1c1c1e","#f5f5f0","#ff7a1a"],["#ff6b2c","#fff","#1c1c1e"],["#f2ede4","#1c1c1e","#ff6b2c"],["#23395b","#fdf6e9","#f5a623"]] },
  { k:"pol", t:"Política y sociedad", c:"#c0392b", pal:[["#b3261e","#fff5ec","#1a1a1a"],["#1a1a1a","#f4efe6","#d63a2f"],["#efe7da","#241c1a","#b3261e"],["#3b3f4a","#f7f2e8","#e0b84f"]] },
  { k:"des", t:"Desarrollo personal", c:"#6d5ce7", pal:[["#f7f3ea","#2b2a33","#6d5ce7"],["#4a3fc1","#fbf8ff","#ffd166"],["#fde7d8","#3a2330","#e2725b"],["#1e2a3a","#f1ede4","#7fc8a9"]] },
  { k:"cie", t:"Historia y ciencia", c:"#1b8fb0", pal:[["#0b2239","#e9f1f7","#46b1d9"],["#e8eef0","#0e2a3c","#d9534f"],["#1b6f8a","#f5fbfc","#ffcf5c"],["#f3ecdc","#2a2118","#8a5a2b"]] },
  { k:"cla", t:"Clásicos gratis", c:"#8a5a2b", pal:[["#f3ead6","#2a1f14","#a5402d"],["#2c2118","#f3ead6","#d9a441"],["#7a2e22","#fbf3e4","#e8c27a"],["#e7dcc4","#1d2a3a","#8a5a2b"]] }
];
/* e = cómo está contado · l = nivel (1 fácil, 3 exigente) · o = qué te llevas · n = páginas (aprox., según edición) */
var LB=[
  { id:"psico-dinero", k:"eco", t:"La psicología del dinero", a:"Morgan Housel", y:2020, n:256, e:["historia","ideas"], l:1, o:["calma","decidir"],
    p:"Ahorrar e invertir tiene más de comportamiento que de matemáticas. Veinte historias cortas que se leen solas.",
    i:["Ser rico es lo que no ves: el dinero que no te gastas.","El interés compuesto necesita tiempo, no genialidad.","Decide qué es «suficiente» para no arriesgar lo que ya tienes."] },
  { id:"economia-leccion", k:"eco", t:"La economía en una lección", a:"Henry Hazlitt", y:1946, n:224, e:["ideas"], l:2, o:["entender","decidir"],
    p:"Mira las consecuencias de una decisión para todos y a largo plazo, no solo lo que se ve a primera vista.",
    i:["La falacia de la ventana rota: romper cosas no crea riqueza.","Toda medida tiene efectos que no se ven al principio.","Pregunta siempre: ¿y para quién más?, ¿y después qué?"] },
  { id:"freakonomics", k:"eco", t:"Freakonomics", a:"Steven D. Levitt y Stephen J. Dubner", y:2005, n:320, e:["ciencia","historia"], l:1, o:["entender"],
    p:"Preguntas raras respondidas con datos. Engancha desde la primera página.",
    i:["Los incentivos explican casi todo lo que hace la gente.","Que dos cosas vayan juntas no significa que una cause la otra.","La sabiduría popular se equivoca más de lo que crees."] },
  { id:"babilonia", k:"eco", t:"El hombre más rico de Babilonia", a:"George S. Clason", y:1926, n:160, e:["novela","practico"], l:1, o:["decidir","foco"],
    p:"Las reglas básicas del dinero contadas como fábulas de la antigua Babilonia. Se lee en una tarde.",
    i:["Guarda al menos una décima parte de lo que ganas.","Haz que tu dinero trabaje para ti.","Desconfía de las promesas demasiado buenas."] },
  { id:"padre-rico", k:"eco", t:"Padre rico, padre pobre", a:"Robert T. Kiyosaki", y:1997, n:240, e:["historia","practico"], l:1, o:["inspirar","crear"],
    p:"El libro que hizo a millones de personas pensar por primera vez en activos y pasivos. Léelo con espíritu crítico.",
    i:["Un activo mete dinero en tu bolsillo; un pasivo lo saca.","De finanzas no te enseñan en el colegio: búscalo tú.","Trabaja para aprender, no solo para cobrar."] },
  { id:"inversor-inteligente", k:"eco", t:"El inversor inteligente", a:"Benjamin Graham", y:1949, n:640, e:["practico","ideas"], l:3, o:["decidir","calma"],
    p:"El clásico de la inversión en valor. Warren Buffett lo llama el mejor libro que se ha escrito sobre invertir.",
    i:["El señor Mercado: el precio de hoy no es lo que algo vale.","Margen de seguridad: compra con descuento.","El mayor enemigo del inversor suele ser él mismo."] },
  { id:"economista-camuflado", k:"eco", t:"El economista camuflado", a:"Tim Harford", y:2005, n:320, e:["ciencia","ideas"], l:2, o:["entender"],
    p:"La economía de lo cotidiano: por qué un café cuesta lo que cuesta y quién se queda la diferencia.",
    i:["Quien controla lo escaso puede poner el precio.","Las empresas intentan cobrar a cada uno lo máximo que pagaría.","Los mercados funcionan mejor cuando la información está clara."] },
  { id:"capital-xxi", k:"eco", t:"El capital en el siglo XXI", a:"Thomas Piketty", y:2013, n:704, e:["ciencia","ideas"], l:3, o:["entender"],
    p:"Tres siglos de datos sobre riqueza y desigualdad. Largo y exigente, pero marcó una época.",
    i:["Cuando el capital rinde más de lo que crece la economía, la desigualdad sube.","La herencia vuelve a pesar mucho.","Los datos históricos cambian el debate."] },

  { id:"cero-uno", k:"neg", t:"De cero a uno", a:"Peter Thiel", y:2014, n:224, e:["ideas"], l:2, o:["crear"],
    p:"Cómo crear algo nuevo en vez de copiar lo que ya existe. Corto y lleno de ideas que incomodan.",
    i:["Copiar lleva de 1 a n; crear algo nuevo, de 0 a 1.","Mejor dominar un mercado pequeño que pelear en uno enorme.","¿Qué verdad importante crees que casi nadie comparte contigo?"] },
  { id:"lean-startup", k:"neg", t:"El método Lean Startup", a:"Eric Ries", y:2011, n:320, e:["practico"], l:2, o:["crear"],
    p:"Probar una idea pequeña y barata antes de apostarlo todo. El manual de las startups modernas.",
    i:["Construir, medir, aprender: cuanto más rápido, mejor.","Producto mínimo viable: lo justo para aprender algo real.","Cambiar de rumbo a tiempo no es fracasar."] },
  { id:"nunca-te-pares", k:"neg", t:"Nunca te pares", a:"Phil Knight", y:2016, n:400, e:["historia"], l:1, o:["inspirar","crear"],
    p:"Cómo empezó Nike vendiendo zapatillas desde el maletero de un coche, contado por su fundador.",
    i:["Empezar pequeño está bien; parar, no.","Los primeros años son caos, deudas y fe.","Rodéate de gente rara, buena y leal."] },
  { id:"ganar-amigos", k:"neg", t:"Cómo ganar amigos e influir sobre las personas", a:"Dale Carnegie", y:1936, n:288, e:["practico"], l:1, o:["gente"],
    p:"Un clásico sobre tratar con la gente. Sirve para todo, no solo para vender.",
    i:["No critiques, no condenes, no te quejes.","Habla de lo que le interesa al otro.","Recuerda los nombres: para cada uno, es el sonido más bonito."] },
  { id:"semana-4h", k:"neg", t:"La semana laboral de 4 horas", a:"Timothy Ferriss", y:2007, n:400, e:["practico"], l:1, o:["crear","foco"],
    p:"Trabajar menos y mejor: eliminar lo que sobra, automatizar y diseñar la vida que quieres.",
    i:["Elimina antes de optimizar: muchas tareas sobran.","El 20 % de lo que haces da el 80 % del resultado.","Diseña tu estilo de vida, no solo tu carrera."] },
  { id:"steve-jobs", k:"neg", t:"Steve Jobs", a:"Walter Isaacson", y:2011, n:752, e:["historia"], l:2, o:["inspirar","crear"],
    p:"La biografía autorizada del fundador de Apple, con sus aciertos y sus sombras.",
    i:["La simplicidad es la máxima sofisticación.","Unir tecnología y humanidades crea productos únicos.","Su intensidad fue a la vez su fuerza y su problema."] },
  { id:"mito-emprendedor", k:"neg", t:"El mito del emprendedor", a:"Michael E. Gerber", y:1995, n:288, e:["practico"], l:2, o:["crear","foco"],
    p:"Por qué la mayoría de negocios pequeños no funcionan y qué hacer para que el tuyo sí.",
    i:["Trabaja en tu negocio, no solo dentro de él.","Crea sistemas como si fueras a abrir cien tiendas iguales.","Todo negocio necesita al técnico, al gerente y al emprendedor."] },
  { id:"influencia", k:"neg", t:"Influencia", a:"Robert B. Cialdini", y:1984, n:400, e:["ciencia","practico"], l:2, o:["gente","decidir"],
    p:"La psicología de la persuasión, con experimentos. Te sirve para convencer y para que no te convenzan.",
    i:["Seis atajos: reciprocidad, compromiso, prueba social, simpatía, autoridad y escasez.","Si alguien te da algo, sientes que debes devolverlo.","Reconocer los atajos te protege de quien los usa contra ti."] },

  { id:"rebelion-granja", k:"pol", t:"Rebelión en la granja", a:"George Orwell", y:1945, n:144, e:["novela"], l:1, o:["entender"],
    p:"Una fábula corta sobre cómo el poder cambia a quien lo consigue. Se lee de una sentada.",
    i:["Todos los animales son iguales, pero algunos son más iguales que otros.","El poder cambia a quien lo tiene.","Las palabras se retuercen para justificar lo injustificable."] },
  { id:"1984", k:"pol", t:"1984", a:"George Orwell", y:1949, n:352, e:["novela"], l:2, o:["entender"],
    p:"Vigilancia, propaganda y control. Para entender muchas noticias de hoy.",
    i:["El Gran Hermano te vigila: la vigilancia como forma de control.","Si recortas las palabras, recortas lo que se puede pensar.","Quien controla el pasado controla el futuro."] },
  { id:"principe", k:"pol", t:"El príncipe", a:"Nicolás Maquiavelo", y:1532, n:128, e:["ideas"], l:2, o:["entender","decidir"],
    p:"El manual original del poder, escrito hace 500 años. Corto, directo y sin adornos.",
    i:["Si no puedes ser amado y temido a la vez, es más seguro ser temido.","La fortuna manda en la mitad de lo que hacemos; la otra mitad es nuestra.","Juzga a quien gobierna por lo que hace, no por lo que dice."] },
  { id:"fracasan-paises", k:"pol", t:"Por qué fracasan los países", a:"Daron Acemoglu y James A. Robinson", y:2012, n:592, e:["ciencia","historia"], l:3, o:["entender"],
    p:"Por qué unos países son ricos y otros pobres. Sus autores ganaron el Nobel de Economía en 2024.",
    i:["Las instituciones inclusivas crean riqueza; las extractivas la exprimen.","Nogales: una misma ciudad partida por una frontera, dos destinos.","La prosperidad depende más de la política que del clima."] },
  { id:"mundo-feliz", k:"pol", t:"Un mundo feliz", a:"Aldous Huxley", y:1932, n:256, e:["novela"], l:2, o:["entender"],
    p:"Una sociedad controlada con placer en vez de con miedo. Da más miedo que 1984.",
    i:["Se puede controlar a la gente dándole lo que quiere.","El soma: felicidad química a cambio de libertad.","¿Prefieres estar cómodo o ser libre?"] },
  { id:"sobre-tirania", k:"pol", t:"Sobre la tiranía", a:"Timothy Snyder", y:2017, n:128, e:["practico","historia"], l:1, o:["entender","decidir"],
    p:"Veinte lecciones del siglo XX para defender la democracia. Muy corto y muy claro.",
    i:["No obedezcas por adelantado.","Defiende las instituciones.","Investiga por tu cuenta y lee cosas largas."] },
  { id:"rebelion-masas", k:"pol", t:"La rebelión de las masas", a:"José Ortega y Gasset", y:1930, n:272, e:["ideas"], l:3, o:["entender"],
    p:"Un clásico español sobre la sociedad de masas que se sigue citando casi cien años después.",
    i:["El «hombre masa» exige derechos sin sentir obligaciones.","La especialización puede crear sabios ignorantes.","Sin proyecto común, una sociedad se desorienta."] },
  { id:"orden-mundial", k:"pol", t:"Orden mundial", a:"Henry Kissinger", y:2014, n:432, e:["ideas","historia"], l:3, o:["entender"],
    p:"Cómo entiende el mundo cada gran potencia, contado por quien fue su diplomático más famoso.",
    i:["Cada región del mundo entiende el «orden» de forma distinta.","Westfalia: el origen del sistema de Estados.","El equilibrio de poder evita más guerras que las buenas intenciones."] },

  { id:"habitos-atomicos", k:"des", t:"Hábitos atómicos", a:"James Clear", y:2018, n:336, e:["practico"], l:1, o:["foco"],
    p:"Cambios pequeños que se suman. Encaja con lo que ya haces en Peak.",
    i:["Mejora un 1 % cada día y en un año serás otro.","Hazlo obvio, atractivo, fácil y satisfactorio.","Cambia tu identidad: «soy alguien que lee», no «quiero leer»."] },
  { id:"mindset", k:"des", t:"Mindset", a:"Carol S. Dweck", y:2006, n:320, e:["ciencia","ideas"], l:1, o:["inspirar"],
    p:"La diferencia entre creer que tu talento es fijo o que se entrena, y por qué lo cambia todo.",
    i:["Mentalidad fija frente a mentalidad de crecimiento.","Elogia el esfuerzo y el proceso, no el talento.","«Todavía no» cambia cómo ves un fallo."] },
  { id:"hombre-sentido", k:"des", t:"El hombre en busca de sentido", a:"Viktor E. Frankl", y:1946, n:168, e:["historia"], l:1, o:["calma","inspirar"],
    p:"Lo que aprendió un psiquiatra sobreviviendo a un campo de concentración. Corto y enorme.",
    i:["Pueden quitarte todo menos la libertad de elegir tu actitud.","Quien tiene un porqué soporta casi cualquier cómo.","El sentido está en lo que haces, en quien quieres y en cómo afrontas lo difícil."] },
  { id:"meditaciones", k:"des", t:"Meditaciones", a:"Marco Aurelio", y:"s. II", n:256, e:["ideas"], l:2, o:["calma"],
    p:"Las notas privadas de un emperador romano para mantener la calma. Estoicismo de primera mano.",
    i:["No te alteran las cosas, sino lo que piensas de ellas.","Céntrate en lo que depende de ti.","Haz cada cosa como si fuera la última."] },
  { id:"centrate", k:"des", t:"Céntrate (Deep Work)", a:"Cal Newport", y:2016, n:304, e:["practico"], l:2, o:["foco"],
    p:"Concentrarse a fondo es cada vez más raro y más valioso. Cómo entrenarlo.",
    i:["El trabajo profundo se entrena como un músculo.","Reserva bloques sin móvil ni avisos.","Aburrirte también es entrenar: no cojas el móvil a la primera."] },
  { id:"7-habitos", k:"des", t:"Los 7 hábitos de la gente altamente efectiva", a:"Stephen R. Covey", y:1989, n:432, e:["practico"], l:2, o:["foco","gente"],
    p:"Un clásico de la efectividad personal y de trabajar con otros.",
    i:["Sé proactivo: responde, no reacciones.","Empieza con un fin en mente.","Primero lo importante, aunque no sea urgente."] },
  { id:"poder-ahora", k:"des", t:"El poder del ahora", a:"Eckhart Tolle", y:1997, n:240, e:["ideas"], l:2, o:["calma"],
    p:"Un libro para salir del ruido de la cabeza y estar donde estás.",
    i:["No eres tus pensamientos: puedes observarlos.","Casi todo el sufrimiento vive en el pasado o en el futuro.","Aceptar lo que es no es rendirse."] },
  { id:"ikigai", k:"des", t:"Ikigai", a:"Héctor García y Francesc Miralles", y:2016, n:208, e:["practico","historia"], l:1, o:["calma","inspirar"],
    p:"Lo que aprendieron en Okinawa, una de las zonas del mundo con más centenarios.",
    i:["Tu ikigai: lo que amas, lo que se te da bien, lo que el mundo necesita y por lo que te pagarían.","Come hasta sentirte lleno al 80 %.","Muévete cada día y cuida a tus amigos."] },
  { id:"pensar-rapido", k:"des", t:"Pensar rápido, pensar despacio", a:"Daniel Kahneman", y:2011, n:672, e:["ciencia"], l:3, o:["decidir"],
    p:"Cómo decide tu cerebro y cuándo te engaña, por un premio Nobel. Largo, pero vale la pena.",
    i:["Sistema 1 rápido e intuitivo; sistema 2 lento y racional.","Anclaje, miedo a perder y exceso de confianza nos engañan.","Para lo importante, frena y mira los datos."] },
  { id:"grit", k:"des", t:"Grit", a:"Angela Duckworth", y:2016, n:400, e:["ciencia","historia"], l:2, o:["inspirar","foco"],
    p:"El poder de la pasión y la perseverancia: por qué el esfuerzo sostenido gana al talento.",
    i:["El talento importa, pero el esfuerzo cuenta dos veces.","La pasión se desarrolla; no aparece de golpe.","Practica justo por encima de tu nivel."] },

  { id:"sapiens", k:"cie", t:"Sapiens. De animales a dioses", a:"Yuval Noah Harari", y:2011, n:496, e:["ideas","historia"], l:2, o:["entender"],
    p:"La historia de la humanidad de un tirón: de cazadores a dueños del planeta.",
    i:["Cooperamos a lo grande gracias a ficciones compartidas: dinero, naciones, leyes.","La agricultura nos dio más comida, pero no una vida más fácil.","Tres revoluciones: cognitiva, agrícola y científica."] },
  { id:"factfulness", k:"cie", t:"Factfulness", a:"Hans Rosling", y:2018, n:336, e:["ciencia"], l:1, o:["entender","calma"],
    p:"El mundo va mejor de lo que crees, y los datos lo demuestran.",
    i:["Casi todos respondemos peor que al azar sobre cómo está el mundo.","Diez instintos distorsionan lo que vemos.","Busca la cifra antes de asustarte con la noticia."] },
  { id:"breve-tiempo", k:"cie", t:"Breve historia del tiempo", a:"Stephen Hawking", y:1988, n:256, e:["ciencia"], l:2, o:["entender"],
    p:"El universo, los agujeros negros y el big bang, sin fórmulas.",
    i:["El universo empezó con el big bang y se sigue expandiendo.","Los agujeros negros no son del todo negros: emiten radiación.","El tiempo no pasa igual para todos."] },
  { id:"armas-germenes", k:"cie", t:"Armas, gérmenes y acero", a:"Jared Diamond", y:1997, n:592, e:["ciencia","historia"], l:3, o:["entender"],
    p:"Por qué la historia fue como fue en cada continente. Premio Pulitzer.",
    i:["La geografía explica más que la biología.","La agricultura y los animales domésticos dieron ventaja a Eurasia.","Los gérmenes conquistaron América más que las armas."] },
  { id:"gen-egoista", k:"cie", t:"El gen egoísta", a:"Richard Dawkins", y:1976, n:400, e:["ciencia"], l:3, o:["entender"],
    p:"La evolución vista desde los genes. Un clásico que cambió la biología.",
    i:["La selección natural actúa sobre los genes.","El altruismo también tiene explicación evolutiva.","Aquí nace la palabra «meme»."] },
  { id:"casi-todo", k:"cie", t:"Una breve historia de casi todo", a:"Bill Bryson", y:2003, n:544, e:["ciencia","historia"], l:1, o:["entender"],
    p:"Cómo sabemos lo que sabemos, contado con muchísimo humor.",
    i:["La ciencia explicada a través de sus personajes y sus manías.","Del big bang a la célula, sin perderte.","Que estés aquí leyendo es un milagro estadístico."] },
  { id:"infinito-junco", k:"cie", t:"El infinito en un junco", a:"Irene Vallejo", y:2019, n:452, e:["historia"], l:2, o:["entender","inspirar"],
    p:"La invención de los libros en el mundo antiguo. Premio Nacional de Ensayo.",
    i:["Cómo nacieron los libros y quién los salvó.","La biblioteca de Alejandría y el sueño de guardarlo todo.","Los libros han sobrevivido a guerras, incendios y censura."] },
  { id:"por-que-dormimos", k:"cie", t:"Por qué dormimos", a:"Matthew Walker", y:2017, n:416, e:["ciencia","practico"], l:1, o:["foco","calma"],
    p:"Lo que la ciencia sabe del sueño. Encaja con el sueño que ya apuntas en Peak.",
    i:["Dormir poco pasa factura a la memoria, al humor y a la salud.","Mantén horarios regulares, también el fin de semana.","El sueño asienta lo que has estudiado."] },
  /* clásicos de dominio público: d = se leen dentro de Peak (libros/<id>.epub) */
  { id:"quijote", k:"cla", d:1, t:"Don Quijote de la Mancha", a:"Miguel de Cervantes", y:1605, n:1334, e:["novela"], l:3, o:["calma","gente"],
    p:"Un hidalgo que lee tantos libros de caballerías que sale a vivir uno. La novela que lo empezó todo, y más divertida de lo que te han contado.",
    i:["Por qué seguimos persiguiendo ideales aunque el mundo se ría.","Sancho y don Quijote: el sentido común y el sueño, uno al lado del otro.","El humor también es una forma de decir verdades."] },
  { id:"novelas-ejemplares", k:"cla", d:1, t:"Novelas ejemplares", a:"Miguel de Cervantes", y:1613, n:656, e:["novela"], l:2, o:["gente"],
    p:"Doce novelas cortas de pícaros, amores y engaños. Se pueden leer de una en una, sin prisa.",
    i:["Retratos de la gente de su tiempo que siguen siendo de hoy.","Cada novela se lee en una o dos tardes.","Cervantes en formato corto: ideal para empezar con él."] },
  { id:"lazarillo", k:"cla", d:1, t:"Lazarillo de Tormes", a:"Anónimo", y:1554, n:72, e:["novela","historia"], l:1, o:["gente"],
    p:"Un niño pobre que sobrevive sirviendo a amos cada vez peores. Corto, pícaro y sorprendentemente moderno.",
    i:["El ingenio como forma de salir adelante.","Cómo se ve el poder desde abajo.","Se lee en una semana a poco que le des."] },
  { id:"celestina", k:"cla", d:1, t:"La Celestina", a:"Fernando de Rojas", y:1499, n:414, e:["novela"], l:3, o:["gente"],
    p:"Un amor imposible, una alcahueta que lo arregla todo por dinero y un final que no perdona.",
    i:["El deseo y la codicia mueven a todos los personajes.","Diálogos vivos que se leen casi como teatro.","Un clásico que entiende muy bien a la gente."] },
  { id:"si-ninas", k:"cla", d:1, t:"El sí de las niñas", a:"Leandro Fernández de Moratín", y:1806, n:72, e:["novela"], l:1, o:["gente"],
    p:"Una comedia sobre una chica a la que quieren casar con un hombre mucho mayor. Corta, ligera y con mucho que decir.",
    i:["Decidir por ti mismo, aunque cueste.","Teatro: se lee rápido y en voz alta suena aún mejor.","Una crítica con humor, nada de sermones."] },
  { id:"marianela", k:"cla", d:1, t:"Marianela", a:"Benito Pérez Galdós", y:1878, n:185, e:["novela"], l:1, o:["gente","calma"],
    p:"Una chica humilde guía a un joven ciego que ve el mundo a través de ella. Hasta que puede ver de verdad.",
    i:["La belleza que vemos y la que no.","Galdós en su versión más corta y emotiva.","Engancha desde el primer capítulo."] },
  { id:"regenta", k:"cla", d:1, t:"La Regenta", a:"Leopoldo Alas «Clarín»", y:1884, n:1238, e:["novela"], l:3, o:["gente","entender"],
    p:"Una mujer atrapada en una ciudad de provincias donde todos se vigilan. De las mejores novelas en español.",
    i:["Cómo pesa lo que dirán.","Personajes que conoces mejor que a mucha gente real.","Un retrato de la sociedad que sigue funcionando."] },
  { id:"pazos-ulloa", k:"cla", d:1, t:"Los pazos de Ulloa", a:"Emilia Pardo Bazán", y:1886, n:313, e:["novela"], l:2, o:["gente","entender"],
    p:"Un cura joven llega a un caserón gallego donde mandan la fuerza y la costumbre. Tensa como un thriller.",
    i:["La civilización frente a lo salvaje.","Una autora que abrió camino a muchas otras.","Galicia rural contada con mano firme."] },
  { id:"barraca", k:"cla", d:1, t:"La barraca", a:"Vicente Blasco Ibáñez", y:1898, n:225, e:["novela"], l:1, o:["gente","inspirar"],
    p:"Una familia intenta salir adelante en unas tierras malditas de la huerta valenciana, contra todo un pueblo.",
    i:["Salir adelante cuando todo está en contra.","Novela corta, intensa y muy visual.","Cómo la presión del grupo puede con todo."] },
  { id:"niebla", k:"cla", d:1, t:"Niebla", a:"Miguel de Unamuno", y:1914, n:219, e:["novela","ideas"], l:2, o:["entender","calma"],
    p:"Un personaje que acaba yendo a discutir con su propio autor. Una «nivola» que juega con quién decide tu vida.",
    i:["¿Quién manda en tu vida, tú o tu historia?","Filosofía en forma de novela, y con humor.","Un final que no se olvida."] },
  { id:"cuentos-quiroga", k:"cla", d:1, t:"Cuentos de amor de locura y de muerte", a:"Horacio Quiroga", y:1917, n:185, e:["novela"], l:1, o:["inspirar"],
    p:"Cuentos de la selva y de la mente humana, del maestro del cuento latinoamericano.",
    i:["Un cuento por noche.","Tensión y naturaleza salvaje.","Cómo contar mucho en pocas páginas."] },
  { id:"azul", k:"cla", d:1, t:"Azul…", a:"Rubén Darío", y:1888, n:119, e:["novela"], l:2, o:["calma","inspirar"],
    p:"Cuentos y poemas que cambiaron la forma de escribir en español. Belleza en estado puro.",
    i:["El origen del modernismo.","Textos cortos para leer a ratos.","Lenguaje para disfrutar despacio."] },
  { id:"tonicos-voluntad", k:"cla", d:1, t:"Reglas y consejos sobre investigación científica", a:"Santiago Ramón y Cajal", y:1897, n:237, e:["practico","ciencia"], l:2, o:["foco","inspirar"],
    p:"El Nobel español explica cómo se trabaja de verdad: constancia, curiosidad y voluntad. Vale para cualquier proyecto.",
    i:["El talento importa menos que la constancia.","Los obstáculos se vencen con método.","Consejos de hace un siglo que siguen siendo oro."] }
];
/* para quien no ha hecho la encuesta: una recomendación distinta cada semana */
var LB_SEMANA=["habitos-atomicos","psico-dinero","nunca-te-pares","rebelion-granja","factfulness","hombre-sentido","freakonomics","sobre-tirania","ikigai","casi-todo","mindset","babilonia"];

var LB_ENC=[
  { k:"tema", q:"¿Qué te apetece entender o mejorar ahora?", ops:[
    ["eco","💶","El dinero y la economía"],["neg","🚀","Crear algo: negocio y emprender"],["pol","🏛️","El poder, la política y la sociedad"],
    ["des","🌱","A mí: hábitos, cabeza y calma"],["cie","🔭","Cómo hemos llegado hasta aquí"],["todo","✨","Sorpréndeme"] ]},
  { k:"estilo", q:"¿Qué tipo de libro te engancha?", ops:[
    ["historia","📖","Historias reales y biografías"],["practico","🛠️","Consejos que pueda usar mañana"],["ideas","💡","Ideas que me cambien la cabeza"],
    ["novela","🎭","Novelas y fábulas"],["ciencia","🔬","Datos, experimentos y ciencia"] ]},
  { k:"nivel", q:"¿Cuánto lees ahora mismo?", ops:[
    ["1","🐣","Casi nada: quiero algo que enganche"],["2","📚","A ratos, de vez en cuando"],["3","🦉","Bastante: dame algo con chicha"] ]},
  { k:"tiempo", q:"¿Cuánto tiempo al día le puedes dar?", ops:[
    ["10","⏱️","Unos 10 minutos"],["20","☕","Unos 20 minutos"],["30","🛋️","Media hora o más"] ]},
  { k:"obj", q:"¿Qué quieres llevarte al acabarlo?", ops:[
    ["inspirar","🔥","Ganas de ponerme a ello"],["calma","🌊","Calma y perspectiva"],["decidir","🧭","Decidir mejor"],
    ["foco","🎯","Más foco y disciplina"],["crear","🧱","Ideas para crear algo mío"],["gente","🤝","Entender mejor a la gente"],["entender","🧠","Saber de lo que hablo"] ]}
];
var LB_ESTILO_TXT={ historia:"Te lo cuenta con historias reales", practico:"Va al grano, con cosas que puedes aplicar ya", ideas:"Está lleno de ideas que cambian cómo piensas", novela:"Es una novela: se lee como una historia", ciencia:"Se apoya en datos y experimentos" };
var LB_OBJ_TXT={ inspirar:"Da ganas de ponerse", calma:"Te deja más tranquilo y con perspectiva", decidir:"Te ayuda a decidir mejor", foco:"Te ayuda con el foco y la disciplina", crear:"Da ideas para crear algo tuyo", gente:"Te ayuda a entender a la gente", entender:"Sales sabiendo de lo que hablas" };
var LB_NIVEL_TXT=["","Se lee fácil y engancha","Ni muy ligero ni muy denso","Exigente, de los de subrayar"];
var LB_RITMOS=[10,15,20,30];

var lbEncR=null, lbEncPaso=0, lbRitmoSel=null, lbTab="para";

function lbSt(){ if(!S.lectura || typeof S.lectura!=="object") S.lectura={}; if(!S.lectura.libros) S.lectura.libros={}; return S.lectura; }
function lbLibro(id){ for(var i=0;i<LB.length;i++) if(LB[i].id===id) return LB[i]; var P=S && S.lectura && S.lectura.propios; return (P && P[id]) || null; }
function lbTema(k){ for(var i=0;i<LB_TEMAS.length;i++) if(LB_TEMAS[i].k===k) return LB_TEMAS[i]; return k==="tuyo" && typeof LB_TEMA_TUYO!=="undefined" ? LB_TEMA_TUYO : LB_TEMAS[0]; }
function lbEst(id){ return lbSt().libros[id]||null; }
function lbEstado(id){ var s=lbEst(id); if(!s) return ""; if(s.e==="leyendo" && !lbHabActivo(id)) return "pausa"; return s.e; }
function lbHabActivo(id){ var s=lbEst(id); if(!s || !s.habs) return null;
  for(var i=s.habs.length-1;i>=0;i--){ var x=habPorId(s.habs[i]); if(x && !x.hasta) return x; } return null; }
/* páginas de un hábito: lo apuntado cada día, o la meta entera si se marcó sin cantidad */
function lbPagsHab(hid){
  var x=habPorId(hid); if(!x) return 0; var n=0, vistos={};
  if(S.cant) Object.keys(S.cant).forEach(function(d){ var v=S.cant[d] && S.cant[d][hid]; if(v){ n+=v; vistos[d]=1; } });
  if(S.checks) Object.keys(S.checks).forEach(function(d){ if(!vistos[d] && (S.checks[d]||[]).indexOf(hid)>=0) n+=(x.meta||0); });
  return n;
}
function lbPags(id){ var s=lbEst(id); if(!s || !s.habs) return 0; return Math.round(s.habs.reduce(function(a,h){ return a+lbPagsHab(h); },0)); }
function lbTotal(id){ var s=lbEst(id), b=lbLibro(id); return (s && s.total) || (b && b.n) || 300; }
function lbActual(){
  var L=lbSt().libros, ids=Object.keys(L);
  for(var i=0;i<ids.length;i++) if(L[ids[i]].e==="leyendo" && lbHabActivo(ids[i]) && lbLibro(ids[i])) return ids[i];
  return null;
}
function lbLeidos(){ var L=lbSt().libros; return Object.keys(L).filter(function(id){ return L[id].e==="leido" && lbLibro(id); })
  .sort(function(a,b){ return String(L[b].fin||"").localeCompare(String(L[a].fin||"")); }); }
function lbGuardados(){ var L=lbSt().libros; return Object.keys(L).filter(function(id){ var e=lbEstado(id); return (e==="quiero"||e==="pausa") && lbLibro(id); }); }
function lbDisponible(id){ var e=lbEstado(id); return e!=="leido" && e!=="leyendo"; }
function lbAnyo(b){ return typeof b.y==="number" ? String(b.y) : b.y; }
function lbDias(n, ritmo){ return Math.max(1, Math.ceil(n/Math.max(1,ritmo))); }
function lbDiasTxt(d){ if(d<=10) return d+(d===1?" día":" días"); var s=Math.round(d/7); if(s<9) return "unas "+s+" semanas"; var m=Math.round(d/30); return m<=1?"un mes":"unos "+m+" meses"; }
function lbRitmoEnc(){ var e=lbSt().enc; var t=e && e.r && +e.r.tiempo; return t>=30?30:t>=20?20:10; }

/* ── portadas tipográficas ── */
function lbHash(s){ var h=0; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }
function lbPortada(b, tam){
  var T=lbTema(b.k), idx=b.propio ? lbHash(b.id)%7 : 0; if(!b.propio) for(var i=0,n=0;i<LB.length;i++){ if(LB[i].k===b.k){ if(LB[i].id===b.id) idx=n; n++; } }
  var p=T.pal[idx%T.pal.length], v=(idx+Math.floor(idx/T.pal.length)+lbHash(b.k))%4;
  var ini=b.t.replace(/^(el|la|los|las|un|una)\s+/i,"").charAt(0).toUpperCase();
  return '<span class="lb-port '+(tam||"m")+' v'+v+'" style="--f:'+p[0]+';--t:'+p[1]+';--x:'+p[2]+'" aria-hidden="true"><i class="lb-deco"></i>'+
    '<span class="lb-in"><small class="lb-p-a">'+esc(b.a.split(" y ")[0])+'</small><b class="lb-p-t">'+esc(b.t)+'</b></span><b class="lb-ini">'+esc(ini)+'</b></span>';
}

/* ── encuesta: puntuación ── */
function lbPuntua(b, r){
  var s=0;
  if(r.tema===b.k) s+=6; else if(r.tema==="todo") s+=2.5;
  if(b.e.indexOf(r.estilo)>=0) s+=3;
  var dn=Math.abs(b.l-(+r.nivel||2)); s+= dn===0?2 : dn===1?0.5 : -1.5;
  var dias=lbDias(b.n, +r.tiempo||10);
  s+= dias<=21?1.5 : dias<=40?0.5 : dias>60?-1.5 : 0;
  if(+r.nivel===1 && b.n>450) s-=1;
  if(b.o.indexOf(r.obj)>=0) s+=2.5;
  if(lbEstado(b.id)==="quiero") s+=0.3;
  return s;
}
function lbRanking(r){
  return LB.filter(function(b){ return lbDisponible(b.id); })
    .map(function(b){ return { b:b, s:lbPuntua(b, r) }; })
    .sort(function(x,y){ return y.s-x.s || x.b.n-y.b.n; });
}
function lbMatch(s){ return Math.round(58+40*Math.max(0, Math.min(1, s/15))); }
function lbPorQue(b, r){
  var w=[], rit=+r.tiempo||10;
  if(r.tema===b.k) w.push("Va de "+lbTema(b.k).t.toLowerCase()+", justo lo que te apetece");
  if(b.e.indexOf(r.estilo)>=0) w.push(LB_ESTILO_TXT[r.estilo]);
  if(b.o.indexOf(r.obj)>=0) w.push(LB_OBJ_TXT[r.obj]);
  if(Math.abs(b.l-(+r.nivel||2))===0) w.push(LB_NIVEL_TXT[b.l]);
  w.push("Con "+rit+" páginas al día lo acabas en "+lbDiasTxt(lbDias(b.n, rit)));
  return w.slice(0,4);
}
/* recomendaciones: las de la encuesta o, sin encuesta, la de la semana y compañía */
function lbRecs(n){
  var e=lbSt().enc;
  if(e && e.r) return lbRanking(e.r).slice(0,n).map(function(x){ return x.b; });
  var sem=Math.floor((Date.now()/864e5+3)/7), out=[];
  for(var i=0;i<LB_SEMANA.length && out.length<n;i++){ var id=LB_SEMANA[(sem+i)%LB_SEMANA.length]; if(lbDisponible(id)) out.push(lbLibro(id)); }
  return out;
}

/* ── acciones sobre un libro ── */
function lbEmpieza(id, ritmo){
  var b=lbLibro(id); if(!b) return;
  var L=lbSt(), act=lbActual();
  if(act && act!==id){ var hx=lbHabActivo(act); if(hx) hx.hasta=addDays(today(),1); L.libros[act].e="pausa"; }
  var s=L.libros[id]||(L.libros[id]={ habs:[] });
  if(!s.habs) s.habs=[];
  var x=lbHabActivo(id);
  ritmo=ritmo||lbRitmoEnc();
  if(!x){
    x={ id:uid(), time:"", text:"Leer «"+b.t+"»", tag:"personal", desde:today(), meta:ritmo, unidad:"páginas", libro:id };
    S.ideal.push(x); s.habs.push(x.id);
  } else x.meta=ritmo;
  s.e="leyendo"; if(!s.desde) s.desde=today(); delete s.fin;
  save(); sonido("pop");
  avisoNube("Empiezas «"+b.t+"»: "+ritmo+" páginas al día en tus hábitos.");
}
function lbTermina(id){
  var s=lbEst(id); if(!s) s=lbSt().libros[id]={ habs:[] };
  var x=lbHabActivo(id); if(x) x.hasta=addDays(today(),1);   /* hoy aún cuenta; desde mañana ya no sale */
  s.e="leido"; s.fin=today();
  save(); sonido("gym");
}
function lbGuarda(id){
  var L=lbSt(), s=L.libros[id];
  if(s && s.e==="quiero"){ if(s.habs && s.habs.length) s.e="pausa"; else delete L.libros[id]; }
  else { if(!s) s=L.libros[id]={ habs:[] }; s.e="quiero"; }
  save(); sonido("tick");
}
function lbDeja(id){ var x=lbHabActivo(id); if(x) x.hasta=addDays(today(),1); var s=lbEst(id); if(s) s.e="pausa"; save(); sonido("des"); }

/* ── bloque «Lectura» dentro de la tarjeta de Hábitos ── */
function lbPinta(){
  var card=document.getElementById("card-ideal"), lista=document.getElementById("ideal-list");
  if(!card || !lista || !S || !S.ideal) return;
  var el=document.getElementById("lb-hab");
  if(!el){ el=document.createElement("div"); el.id="lb-hab"; el.className="lb-hab"; }
  if(el.parentNode!==card || el.previousSibling!==lista) lista.parentNode.insertBefore(el, lista.nextSibling);
  var act=lbActual(), h='<div class="lb-cab"><p class="eyebrow">'+ico("libro")+'Lectura</p><button data-act="x-lb-biblio" data-t="'+(act?"mis":"para")+'">Biblioteca</button></div>';
  if(act){
    var b=lbLibro(act), pg=lbPags(act), tot=lbTotal(act), pc=Math.min(100, Math.round(pg/tot*100)), x=lbHabActivo(act), rit=(x&&x.meta)||10;
    var hoy=cantDe(today(), x.id), queda=Math.max(0, tot-pg), fin=lbDias(queda, rit);
    h+='<div class="lb-now'+(pg>=tot?" fin":"")+'">'+
      '<button class="lb-now-port" data-act="x-lb-libro" data-id="'+act+'" aria-label="Ver el libro">'+lbPortada(b,"m")+'</button>'+
      '<div class="lb-now-t"><button data-act="x-lb-libro" data-id="'+act+'" class="lb-now-tit"><b>'+esc(b.t)+'</b><small>'+esc(b.a)+'</small></button>'+
      '<div class="lb-barra"><i style="width:'+pc+'%"></i></div>'+
      '<p class="lb-now-p num"><b>'+Math.min(pg,tot)+'</b> de '+tot+' págs · '+pc+' %</p>'+
      (pg>=tot
        ? '<button class="lb-pill lb-pill-ok" data-act="x-lb-termina" data-id="'+act+'">¡Lo he terminado!</button>'
        : '<p class="lb-now-s">'+(hoy>=rit?"Hoy ya has leído tus "+rit+" páginas. ":"")+'A este ritmo lo acabas en '+lbDiasTxt(fin)+'.</p>'+
          '<button class="lb-pill" data-act="x-lb-apunta" data-id="'+act+'">'+(hoy>0?"Hoy llevas "+fmtCant(hoy)+" · apuntar más":"Apuntar páginas de hoy")+'</button>')+
      '</div></div>';
  } else {
    var e=lbSt().enc, rs=lbRecs(3), top=rs[0];
    if(top){
      h+='<div class="lb-desc">'+
        '<button class="lb-pila" data-act="x-lb-libro" data-id="'+top.id+'" aria-label="Ver el libro">'+rs.slice(0,3).reverse().map(function(x){ return lbPortada(x,"m"); }).join("")+'</button>'+
        '<div class="lb-desc-t">'+
        (e&&e.r
          ? '<small>Tu libro perfecto</small><button class="lb-desc-tit" data-act="x-lb-libro" data-id="'+top.id+'"><b>'+esc(top.t)+'</b></button><p>'+esc(top.a)+' · '+lbMatch(lbPuntua(top,e.r))+' % para ti</p>'+
            '<div class="lb-desc-bt"><button class="lb-pill lb-pill-on" data-act="x-lb-libro" data-id="'+top.id+'">Empezarlo</button><button class="lb-pill" data-act="x-lb-biblio" data-t="para">Más para ti</button></div>'
          : '<small>¿Qué leer ahora?</small><b>Encuentra tu libro perfecto</b><p>Cinco preguntas y te digo cuál, entre '+LB.length+' libros de verdad.</p>'+
            '<div class="lb-desc-bt"><button class="lb-pill lb-pill-on" data-act="x-lb-enc">Hacer la encuesta</button><button class="lb-pill" data-act="x-lb-libro" data-id="'+top.id+'">El de esta semana</button></div>')+
        '</div></div>';
    }
  }
  el.innerHTML=h;
}

/* ── hojas ── */
function lbFila(b, extra){
  var e=lbEstado(b.id), tag=e==="leyendo"?'<em class="on">Leyendo</em>':e==="leido"?'<em class="ok">Leído</em>':e==="pausa"?'<em>A medias</em>':e==="quiero"?'<em>Guardado</em>':"";
  return '<button class="lb-fila" data-act="x-lb-libro" data-id="'+b.id+'">'+lbPortada(b,"s")+
    '<span class="lb-fila-t"><b>'+esc(b.t)+'</b><small>'+esc(b.a)+(b.n?' · '+b.n+' págs':'')+'</small><span>'+(b.d?'<i class="lb-aqui">Léelo aquí</i> ':'')+esc(b.p||"Tu EPUB, guardado en este dispositivo.")+'</span></span>'+
    '<span class="lb-fila-d">'+(extra||"")+tag+'</span></button>';
}
function lbSheetBiblio(t){
  lbTab=t||lbTab||"para";
  var L=lbSt(), e=L.enc, leidos=lbLeidos(), act=lbActual();
  var tabs=[["para","Para ti"]].concat(LB_TEMAS.map(function(T){ return [T.k, T.t]; })).concat([["mis","Mis libros"]]);
  var h='<div class="flex items-start justify-between mb-1"><div><p class="eyebrow mb-1.5">Hábitos · Lectura</p><h3 class="display text-[20px] font-bold">Biblioteca</h3></div>'+closeBtn()+'</div>'+
    '<p class="text-[12.5px] t3 mb-4">'+LB.length+' libros de verdad para crecer'+(leidos.length?' · has leído '+leidos.length:'')+'.</p>'+
    '<button class="lb-enc-ban" data-act="x-lb-enc"><span class="lb-enc-ico">✨</span><span><b>'+(e&&e.r?"Repetir la encuesta":"Encuentra tu libro perfecto")+'</b><small>'+(e&&e.r?"Si ha cambiado lo que te apetece, vuelve a hacerla.":"Cinco preguntas rápidas y te digo cuál leer.")+'</small></span>'+ico("flecha")+'</button>'+
    '<div class="lb-chips">'+tabs.map(function(x){ var T=lbTema(x[0]), c=(x[0]==="para"||x[0]==="mis")?"var(--accent)":T.c;
      return '<button data-act="x-lb-biblio" data-t="'+x[0]+'" class="'+(x[0]===lbTab?"on":"")+'" style="--c:'+c+'">'+esc(x[1])+'</button>'; }).join("")+'</div>';
  if(lbTab==="para"){
    if(e && e.r){
      h+='<p class="lb-sec">Según tu encuesta</p><div class="lb-lista">'+lbRanking(e.r).slice(0,8).map(function(x){ return lbFila(x.b, '<i class="lb-match num">'+lbMatch(x.s)+' %</i>'); }).join("")+'</div>';
    } else {
      h+='<p class="lb-sec">Para empezar con buen pie</p><div class="lb-lista">'+lbRecs(8).map(function(b){ return lbFila(b); }).join("")+'</div>';
    }
  } else if(lbTab==="mis"){
    var g=lbGuardados(), P=lcPropios(), sueltos=Object.keys(P).filter(function(pid){ return !lbEstado(pid); });
    h+='<button class="lb-subir" data-act="x-lb-subir"><span class="lb-subir-i">+</span><span><b>Subir un libro (EPUB)</b><small>Léelo dentro de Peak y tus páginas se apuntan solas.</small></span></button>';
    if(act) h+='<p class="lb-sec">Leyendo</p><div class="lb-lista">'+lbFila(lbLibro(act))+'</div>';
    if(g.length) h+='<p class="lb-sec">Para luego</p><div class="lb-lista">'+g.map(function(id){ return lbFila(lbLibro(id)); }).join("")+'</div>';
    if(leidos.length) h+='<p class="lb-sec">Leídos</p><div class="lb-lista">'+leidos.map(function(id){ return lbFila(lbLibro(id), '<i class="lb-fecha">'+esc(fmt(L.libros[id].fin||today()))+'</i>'); }).join("")+'</div>';
    if(sueltos.length) h+='<p class="lb-sec">Tus EPUB</p><div class="lb-lista">'+sueltos.map(function(pid){ return lbFila(P[pid]); }).join("")+'</div>';
    if(!act && !g.length && !leidos.length && !sueltos.length) h+='<p class="lb-vacio">Aquí saldrán el libro que estás leyendo, los que guardes para luego y los que termines.</p>';
  } else {
    if(lbTab==="cla") h+='<p class="lb-nota" style="margin:2px 0 10px">Grandes clásicos en español, de dominio público: gratis y para leer aquí mismo.</p>';
    h+='<div class="lb-lista">'+LB.filter(function(b){ return b.k===lbTab; }).map(function(b){ return lbFila(b); }).join("")+'</div>';
  }
  h+='<p class="lb-nota">Las páginas son aproximadas y cambian según la edición. Puedes ajustarlas en cada libro.</p>';
  openSheet(h);
  lbArriba();
}
function lbArriba(){ var sc=document.querySelector("#sheet .sheet-card"); if(sc) sc.scrollTop=0; }

function lbSheetLibro(id){
  var b=lbLibro(id); if(!b) return;
  var T=lbTema(b.k), e=lbEstado(id), act=lbActual(), s=lbEst(id);
  if(lbRitmoSel==null || lbRitmoSel.id!==id) lbRitmoSel={ id:id, n:(lbHabActivo(id)||{}).meta||lbRitmoEnc() };
  var rit=lbRitmoSel.n, pg=lbPags(id), tot=lbTotal(id);
  var h='<div class="flex items-center justify-between mb-4"><button class="lb-volver" data-act="x-lb-biblio">'+ico("flecha")+'Biblioteca</button>'+closeBtn()+'</div>'+
    '<div class="lb-ficha">'+lbPortada(b,"l")+
      '<div class="lb-ficha-t"><span class="lb-tema" style="--c:'+T.c+'">'+esc(T.t)+'</span><h3 class="display">'+esc(b.t)+'</h3><p>'+esc(b.a)+'</p>'+
      '<small class="num">'+[b.y?esc(lbAnyo(b)):"", (b.propio && !b.n && !(s&&s.total))?"":tot+" págs", b.l?esc(LB_NIVEL_TXT[b.l]):""].filter(Boolean).join(" · ")+'</small></div></div>'+
    (b.p?'<p class="lb-desc-l">'+esc(b.p)+'</p>':'')+
    (b.propio?'<p class="lb-desc-l">Tu EPUB. El archivo se guarda solo en este dispositivo; tu progreso y tus páginas van con tu cuenta.</p>':'')+
    (b.i?'<p class="lb-sec">Lo que te llevas</p><ul class="lb-ideas">'+b.i.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul>':'');
  if(e==="leyendo"){
    var x=lbHabActivo(id), pc=Math.min(100, Math.round(pg/tot*100));
    h+='<div class="lb-prog"><div class="flex items-baseline justify-between"><b class="num">'+Math.min(pg,tot)+' <span>de '+tot+' págs</span></b><em class="num">'+pc+' %</em></div>'+
      '<div class="lb-barra"><i style="width:'+pc+'%"></i></div>'+
      '<p>'+(pg>=tot?"Ya has llegado al final.":"Te quedan "+(tot-pg)+" páginas: "+lbDiasTxt(lbDias(tot-pg, x.meta||10))+" a "+(x.meta||10)+" al día.")+'</p></div>'+
      (b.d?'<button class="btn btn-primary w-full !py-3.5 mt-4" data-act="x-lb-lee" data-id="'+id+'">Seguir leyendo aquí</button>'+
        '<p class="lb-nota" style="text-align:center">Las páginas que leas aquí se apuntan solas en tu hábito.</p>':'')+
      '<button class="btn '+(b.d?"btn-quiet !py-3 mt-2":"btn-primary !py-3.5 mt-4")+' w-full" data-act="x-lb-apunta" data-id="'+id+'">Apuntar páginas de hoy</button>'+
      '<button class="btn btn-quiet w-full !py-3 mt-2" data-act="x-lb-termina" data-id="'+id+'">Lo he terminado</button>'+
      '<p class="lb-sec">Páginas al día</p>'+lbRitmosHTML(id, rit)+
      (b.d?'':'<div class="lb-edicion"><span>Mi edición tiene</span><input id="lb-tot" class="field num text-center" inputmode="numeric" maxlength="4" value="'+tot+'"><span>págs</span><button class="btn btn-quiet !py-2" data-act="x-lb-total" data-id="'+id+'">Guardar</button></div>')+
      '<button class="lb-link" data-act="x-lb-deja" data-id="'+id+'">Dejarlo por ahora</button>';
  } else if(e==="leido"){
    h+='<div class="lb-leido">'+ICON_CHECK+'<span>Lo terminaste el '+esc(fmt(s.fin||today(),{day:"numeric",month:"long",year:"numeric"}))+'.</span></div>'+
      '<button class="btn btn-quiet w-full !py-3 mt-4" data-act="x-lb-siguiente">Qué leo ahora</button>'+
      (b.d?'<button class="btn btn-quiet w-full !py-3 mt-2" data-act="x-lb-lee" data-id="'+id+'">Volver a abrirlo</button>':'');
  } else {
    h+='<p class="lb-sec">Páginas al día</p>'+lbRitmosHTML(id, rit)+
      '<p class="lb-est" id="lb-est">'+lbEstTxt(b, rit, pg)+'</p>'+
      (b.d?'<button class="btn btn-primary w-full !py-3.5 mt-3" data-act="x-lb-lee" data-id="'+id+'">'+(e==="pausa"?"Seguir leyéndolo aquí":"Leerlo aquí")+'</button>'+
        '<p class="lb-nota" style="text-align:center">'+(b.propio?"Se añade a tus hábitos y cada página que leas cuenta.":"Gratis: es de dominio público. Se añade a tus hábitos y cada página cuenta.")+'</p>':'')+
      '<button class="btn '+(b.d?"btn-quiet !py-3 mt-2":"btn-primary !py-3.5 mt-3")+' w-full" data-act="x-lb-empieza" data-id="'+id+'">'+(act?"Cambiar a este libro":e==="pausa"?"Seguir leyéndolo":b.d?"Empezar, pero en papel":"Empezar a leerlo")+'</button>'+
      (act?'<p class="lb-nota" style="text-align:center">«'+esc(lbLibro(act).t)+'» se queda a medias, con tus páginas guardadas.</p>':'')+
      '<div class="lb-dos"><button class="btn btn-quiet !py-3" data-act="x-lb-guarda" data-id="'+id+'">'+(e==="quiero"?"Guardado ✓":"Guardar para luego")+'</button>'+
      '<button class="btn btn-quiet !py-3" data-act="x-lb-termina" data-id="'+id+'">Ya lo he leído</button></div>';
  }
  if(b.propio) h+='<button class="lb-link" data-act="x-lb-borra" data-id="'+id+'">Quitar este libro</button>';
  else if(!b.d) h+='<a class="lb-link" href="https://www.google.com/search?tbm=bks&q='+encodeURIComponent(b.t+" "+b.a)+'" target="_blank" rel="noopener noreferrer">Buscar el libro '+ico("flecha")+'</a>';
  openSheet(h);
  lbArriba();
}
function lbRitmosHTML(id, rit){
  return '<div class="seg w-full" id="lb-ritmos" style="display:grid;grid-template-columns:repeat('+LB_RITMOS.length+',1fr)">'+LB_RITMOS.map(function(n){
    return '<button data-act="x-lb-ritmo" data-id="'+id+'" data-n="'+n+'"'+(n===rit?' aria-pressed="true"':'')+'>'+n+'</button>'; }).join("")+'</div>';
}
function lbEstTxt(b, rit, pg){
  var d=lbDias(Math.max(1, lbTotal(b.id)-(pg||0)), rit);
  return 'Unos '+Math.round(rit*1.2)+' minutos al día. Lo acabas en '+lbDiasTxt(d)+', hacia el '+esc(fmt(addDays(today(), d),{day:"numeric",month:"long"}))+'.';
}

function lbSheetEnc(){
  if(!lbEncR) lbEncR={};
  var Q=LB_ENC[lbEncPaso];
  var h='<div class="flex items-center justify-between mb-4">'+
      (lbEncPaso>0?'<button class="icon-btn !w-8 !h-8 lb-atras" data-act="x-lb-atras" aria-label="Atrás">'+ico("flecha")+'</button>':'<span class="eyebrow">Tu libro perfecto</span>')+
      closeBtn()+'</div>'+
    '<div class="lb-pasos">'+LB_ENC.map(function(x,i){ return '<i class="'+(i<lbEncPaso?"ya":i===lbEncPaso?"on":"")+'"></i>'; }).join("")+'</div>'+
    '<p class="lb-enc-n num">'+(lbEncPaso+1)+' de '+LB_ENC.length+'</p>'+
    '<h3 class="display lb-enc-q">'+esc(Q.q)+'</h3>'+
    '<div class="lb-ops">'+Q.ops.map(function(o){
      return '<button class="lb-op'+(lbEncR[Q.k]===o[0]?" on":"")+'" data-act="x-lb-resp" data-v="'+o[0]+'"><span class="lb-op-e">'+o[1]+'</span><span>'+esc(o[2])+'</span><i>'+ICON_CHECK+'</i></button>'; }).join("")+'</div>';
  openSheet(h);
  lbArriba();
}
function lbSheetResultado(fin){
  var L=lbSt(), e=L.enc; if(!e || !e.r){ lbEncPaso=0; lbEncR={}; lbSheetEnc(); return; }
  var rk=lbRanking(e.r); if(!rk.length){ lbSheetBiblio("mis"); return; }
  var top=rk[0].b, T=lbTema(top.k), rit=lbRitmoEnc();
  lbRitmoSel={ id:top.id, n:rit };
  var h='<div class="flex items-start justify-between mb-2"><p class="eyebrow mt-2">'+(fin?"Y ahora…":"Tu libro perfecto")+'</p>'+closeBtn()+'</div>'+
    '<div class="lb-res">'+
      '<div class="lb-res-port">'+lbPortada(top,"xl")+'<span class="lb-res-match num">'+lbMatch(rk[0].s)+' %</span></div>'+
      '<span class="lb-tema" style="--c:'+T.c+'">'+esc(T.t)+'</span>'+
      '<h3 class="display">'+esc(top.t)+'</h3><p>'+esc(top.a)+' · '+top.n+' págs</p></div>'+
    '<p class="lb-sec">Por qué este</p><ul class="lb-porque">'+lbPorQue(top, e.r).map(function(x){ return '<li>'+ICON_CHECK+'<span>'+esc(x)+'</span></li>'; }).join("")+'</ul>'+
    '<button class="btn btn-primary w-full !py-3.5 mt-5" data-act="x-lb-empieza" data-id="'+top.id+'">'+(lbActual()?"Cambiar a este libro":"Empezar a leerlo")+' · '+rit+' págs al día</button>'+
    '<button class="btn btn-quiet w-full !py-3 mt-2" data-act="x-lb-libro" data-id="'+top.id+'">Ver de qué va</button>'+
    (rk.length>1?'<p class="lb-sec">También te encajan</p><div class="lb-lista">'+rk.slice(1,3).map(function(x){ return lbFila(x.b, '<i class="lb-match num">'+lbMatch(x.s)+' %</i>'); }).join("")+'</div>':'')+
    '<button class="lb-link" data-act="x-lb-enc">Repetir la encuesta</button>';
  openSheet(h);
  lbArriba();
}
function lbFiesta(){
  var c=document.querySelector("#sheet .lb-res-port .lb-port") || document.querySelector("#sheet .lb-ficha .lb-port"); if(!c) return;
  var r=c.getBoundingClientRect(); if(!r.width) return;
  var capa=document.createElement("div"); capa.className="gym-fiesta tick-capa";
  capa.style.cssText="left:"+(r.left+r.width/2)+"px;top:"+(r.top+r.height/2)+"px;--col:var(--violet)";
  var h='<span class="tick-onda"></span>', cols=["#ffd45c","var(--accent)","var(--violet)","var(--good)"];
  for(var i=0;i<14;i++) h+='<i style="--ang:'+(i*(360/14)+10)+'deg;--dist:'+(48+(i%3)*18)+'px;--del:'+((i%4)*.03)+'s;background:'+cols[i%4]+'"></i>';
  capa.innerHTML=h; document.body.appendChild(capa);
  setTimeout(function(){ if(capa.parentNode) capa.parentNode.removeChild(capa); }, 1300);
  try{ if(navigator.vibrate) navigator.vibrate([12,40,12]); }catch(e){}
}

/* ── metas del mes: «Libros terminados» se cuenta solo ── */
if(typeof METAS_TIPOS!=="undefined" && !METAS_TIPOS.some(function(x){ return x.k==="libros"; }))
  METAS_TIPOS.push({ k:"libros", n:"Libros terminados", u:"libros" });
var _metaValorLb=metaValor;
metaValor=function(m, mk){
  if(m.tipo==="libros"){ var L=(S.lectura&&S.lectura.libros)||{}; return Object.keys(L).filter(function(id){ return L[id].e==="leido" && String(L[id].fin||"").slice(0,7)===mk; }).length; }
  return _metaValorLb(m, mk);
};

/* ── el editor de hábitos enseña la biblioteca ── */
var _sheetIdealLb=sheetIdeal;
sheetIdeal=function(){
  var r=_sheetIdealLb.apply(this, arguments);
  var lista=document.querySelector("#sheet-body .hb-lista");
  if(lista && !document.getElementById("lb-ed")){
    var act=lbActual(), d=document.createElement("button");
    d.id="lb-ed"; d.className="lb-ed"; d.setAttribute("data-act", act?"x-lb-libro":"x-lb-biblio"); if(act) d.setAttribute("data-id", act); else d.setAttribute("data-t","para");
    var rs=act?[lbLibro(act)]:lbRecs(2);
    d.innerHTML='<span class="lb-ed-p">'+rs.map(function(b){ return lbPortada(b,"s"); }).join("")+'</span><span class="lb-ed-t"><b>'+(act?"Leyendo «"+esc(lbLibro(act).t)+"»":"Un hábito de lectura")+'</b><small>'+(act?"Cambia el ritmo o apunta páginas":"Elige un libro y se añade con sus páginas al día")+'</small></span>'+ico("flecha");
    lista.parentNode.insertBefore(d, lista.nextSibling);
  }
  return r;
};

function lecturaAccion(a, el){
  if(a.indexOf("x-lb-")!==0) return false;
  var id=el.dataset.id;
  if(a==="x-lb-biblio"){ sonido("tick"); lbSheetBiblio(el.dataset.t); return true; }
  if(a==="x-lb-libro"){ lbSheetLibro(id); return true; }
  if(a==="x-lb-ritmo"){
    lbRitmoSel={ id:id, n:+el.dataset.n };
    var x=lbHabActivo(id);
    if(x && lbEstado(id)==="leyendo"){ x.meta=+el.dataset.n; save(); render(); lbSheetLibro(id); sonido("tick"); return true; }
    document.querySelectorAll("#lb-ritmos button").forEach(function(bt){ bt.setAttribute("aria-pressed", bt===el?"true":"false"); });
    var es=document.getElementById("lb-est"); if(es) es.innerHTML=lbEstTxt(lbLibro(id), lbRitmoSel.n, lbPags(id));
    sonido("tick"); return true;
  }
  if(a==="x-lb-empieza"){ lbEmpieza(id, lbRitmoSel && lbRitmoSel.id===id ? lbRitmoSel.n : null); render(); lbSheetLibro(id); lbFiesta(); return true; }
  if(a==="x-lb-guarda"){ lbGuarda(id); render(); lbSheetLibro(id); return true; }
  if(a==="x-lb-deja"){ lbDeja(id); render(); lbSheetLibro(id); avisoNube("Lo dejas a medias. Tus páginas se quedan guardadas."); return true; }
  if(a==="x-lb-termina"){
    var leia=!!lbHabActivo(id) || lbEstado(id)==="pausa";
    lbTermina(id); render();
    var n=lbLeidos().length;
    avisoNube(leia ? "¡Libro terminado! Ya "+(n===1?"llevas uno":"van "+n)+"." : "Apuntado como leído.");
    if(leia && lbSt().enc && lbSt().enc.r) lbSheetResultado(true); else lbSheetLibro(id);
    if(leia) lbFiesta(); return true;
  }
  if(a==="x-lb-siguiente"){ if(lbSt().enc && lbSt().enc.r) lbSheetResultado(true); else { lbEncPaso=0; lbEncR={}; lbSheetEnc(); } return true; }
  if(a==="x-lb-apunta"){ var hx=lbHabActivo(id); if(hx) abrirCantidad(hx.id, today()); return true; }
  if(a==="x-lb-total"){
    var v=parseInt((document.getElementById("lb-tot")||{}).value, 10);
    if(!(v>=20 && v<=3000)){ avisoNube("Pon un número de páginas entre 20 y 3000."); return true; }
    var s=lbEst(id); if(s){ s.total=v; save(); render(); lbSheetLibro(id); avisoNube("Guardado: "+v+" páginas."); }
    return true;
  }
  if(a==="x-lb-enc"){ lbEncPaso=0; lbEncR={}; sonido("tick"); lbSheetEnc(); return true; }
  if(a==="x-lb-atras"){ lbEncPaso=Math.max(0, lbEncPaso-1); lbSheetEnc(); return true; }
  if(a==="x-lb-resp"){
    var Q=LB_ENC[lbEncPaso]; lbEncR[Q.k]=el.dataset.v; sonido("tick");
    document.querySelectorAll("#sheet .lb-op").forEach(function(b){ b.classList.toggle("on", b===el); });
    setTimeout(function(){
      if(lbEncPaso<LB_ENC.length-1){ lbEncPaso++; lbSheetEnc(); return; }
      var r=lbEncR, rk=lbRanking(r);
      lbSt().enc={ r:r, top:rk.slice(0,3).map(function(x){ return x.b.id; }), f:today() };
      save(); render(); lbSheetResultado(false); sonido("pop"); lbFiesta();
    }, 260);
    return true;
  }
  return false;
}
function lecturaTrasRender(){ if(view==="resumen") lbPinta(); }

