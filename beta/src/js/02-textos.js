/* instalada en la pantalla de inicio: se mide la franja del reloj y, si el móvil no la declara, se pone a mano */
(function(){
  try{
    var sonda=document.createElement("div");
    sonda.style.cssText="position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top,0px);pointer-events:none";
    document.body.appendChild(sonda);
    var alto=sonda.offsetHeight; sonda.remove();
    var instalada=(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||window.navigator.standalone;
    if(instalada && alto<10) alto=44;
    document.documentElement.style.setProperty("--safe-top", alto+"px");
  }catch(e){}
})();

/* ══════════════════════════════════════════════════════════════════════
   TEXTOS DE LA APP · cambia lo que quieras de aquí abajo
   ----------------------------------------------------------------------
   Todo lo que lee el usuario está en este bloque: niveles, retos, logros,
   tutorial, frases del parte del día y saludos. Cambia solo lo que hay
   entre comillas y guarda. No quites comas ni corchetes.
   · niveles  → tienen que ser 20, de peor a mejor
   · logros   → cambia el nombre (n) y la explicación (d); el orden importa
   · retos    → puedes añadir o quitar los que quieras
   · tutorial → son 12 pasos; si quitas uno, quita la línea entera
   Si prefieres editar esto en un archivo aparte, en el zip de la PWA hay
   un textos.js: lo que pongas allí manda sobre esto.
   ══════════════════════════════════════════════════════════════════════ */
var TEXTOS = {

  /* avisos diarios: pega aquí la dirección de tu servidor de Cloudflare.
     La clave pública es la que va emparejada con la privada que guardaste allí. */
  avisos: {
    servidor: "https://avisos-dutrack.cgduboycastosa.workers.dev",
    clave:    "BNLE0hErIZzlVHmqAt_MW0KHFwACLBZNp8yxbCIR2S3BEsMK6qZCjCAaBpedrve6EtOrcVWrOPHaPqK6ZkHemVM",
    /* lo que dicen los avisos. Lo que va entre llaves lo rellena tu móvil */
    textos: {
      manana:     { t:"Buenos días",       b:"{clases}. {tareas}" },
      finde:      { t:"Buenos días",       b:"Hoy no hay clase. {tareas}" },
      examen:     { t:"Examen a la vista", b:"{asignatura}, el {dia}. Quedan tres días." },
      entrega:    { t:"Mañana entregas",   b:"{tarea}" },
      ambos:      { t:"Ojo a esta semana", b:"{asignatura} en tres días y mañana entregas {tarea}." },
      noche:      { t:"Parte del día",     b:"¿Hacemos el Parte del día? {falta}" },
      nocheHecho: { t:"Parte del día hecho", b:"{xp} XP y {racha}. Buenas noches." },
      evento:     { t:"{evento}",          b:"Quedan {dias} días." },
      eventoHoy:  { t:"Hoy es {evento}",   b:"Suerte. Te lo has currado." },
      otroEvento: { t:"{tipo} a la vista",  b:"{titulo}, el {dia}. Quedan tres días." },
      viejo:      { t:"¿Sigues ahí?",     b:"Llevas días sin abrir esto. ¿Va todo bien?" }
    }
  },

  niveles: ["Principiante","Aprendiz","Constante","Disciplinado","Enfocado","Resiliente","Metódico",
            "Comprometido","Firme","Forjado","Templado","Sólido","Determinado","Ejemplar",
            "Referente","Incansable","Maestro del hábito","Élite","Imparable","Leyenda"],

  saludos: { madrugada:"Aún de madrugada", manana:"Buenos días", tarde:"Buenas tardes", noche:"Buenas noches" },

  anillo: { alto:"Día redondo. Cierra fuerte.", medio:"Buen ritmo, queda poco.", bajo:"Empieza por algo pequeño." },

  parte: {
    pasos: ["Los retos","El cuerpo","Los números","Para mañana","Cómo ha ido"],
    frases: {
      cero:    "Hoy no ha salido nada. Pasa. Mañana empieza por una sola cosa pequeña.",
      poco:    "Poquita cosa, pero peor era el cero. Que estuviste cerca, ¿eh?",
      normal:  "Día normal tirando a decente. Para ti eso ya es una racha.",
      flojo:   "Día flojo. No pasa nada: mañana, una cosa detrás de otra.",
      bien:    "Buen día de verdad. Repite esto cuatro veces y junio te pilla tranquilo.",
      bestial: "Día bestial. Descansa antes de que te lo creas demasiado."
    }
  },

  logros: [
    {n:"Algo es algo",                          d:"Completa tu primer reto"},
    {n:"Siete días sin recaer",                 d:"7 días seguidos de racha"},
    {n:"Esto ya es sospechoso",                 d:"30 días seguidos de racha"},
    {n:"Medio centenar de excusas menos",       d:"50 retos completados"},
    {n:"Ya no te queda excusa",                 d:"100 retos completados"},
    {n:"Te saluda el de recepción",             d:"20 días de ejercicio"},
    {n:"Pagas alquiler en el gimnasio",         d:"100 días de ejercicio"},
    {n:"Ya no pareces un zombi",                d:"10 días durmiendo 7 h o más"},
    {n:"Hay vida fuera del móvil",              d:"5 días con menos de 2 h de pantalla"},
    {n:"Un día fingiste ser productivo",        d:"Cumple todos tus hábitos un día"},
    {n:"Cinco veces fingiendo, ya es personalidad", d:"Cinco días con todos los hábitos"},
    {n:"Cero pendientes, cero drama",           d:"Deja las tareas a cero teniendo diez hechas"},
    {n:"Superviviente",                         d:"Sobrevive a 10 exámenes"},
    {n:"Sigma certificado",                     d:"Llega al nivel 13"},
    {n:"Ya eres tú mismo",                      d:"Llega al último nivel"},
    {n:"Los tres, por una vez",                 d:"Completa los tres retos de un día"},
    {n:"Diez veces del tirón, ¿quién eres?",    d:"Diez días con los tres retos hechos"}
  ],

  retos: [
    "Lavarte los dientes especialmente bien, tres minutos completos",
    "Aguantar un minuto colgado de la barra de dominadas",
    "Hacer la cama nada más levantarte",
    "Beber un vaso de agua antes de cada comida",
    "Diez minutos de estiramientos antes de dormir",
    "Subir por las escaleras todo el día, cero ascensor",
    "Media hora sin tocar el móvil mientras estudias",
    "Salir a andar veinte minutos sin auriculares",
    "Dejar la mochila preparada la noche anterior",
    "Escribir tres cosas que te han salido bien hoy",
    "Cincuenta sentadillas repartidas por el día",
    "Un minuto de plancha, en dos o tres series",
    "Comer una pieza de fruta a media mañana",
    "Recoger tu escritorio antes de ponerte a estudiar",
    "Repasar veinte minutos algo de hace dos semanas",
    "No mirar el móvil la primera hora del día",
    "Llamar o escribir a alguien de tu familia",
    "Ordenar los apuntes de una asignatura",
    "Dormir con el móvil fuera de la habitación",
    "Ducha fría los últimos treinta segundos",
    "Leer diez páginas de algo que no sea de clase",
    "Preguntar una duda en clase en voz alta",
    "Cinco minutos sentado en silencio, sin nada",
    "Hacer la cena o ayudar a hacerla",
    "Andar hasta el instituto en vez de que te lleven",
    "Terminar la tarea más pesada antes que las fáciles",
    "Levantarte a la primera, sin nueve alarmas",
    "45 minutos de estudio con el móvil en otra habitación",
    "Recoger el cuarto hasta que se vea el suelo",
    "Subir andando todo el día, cero ascensor",
    "Beberte los ocho vasos de agua",
    "Cero móvil durante la primera hora del día",
    "Un minuto colgado de la barra de dominadas",
    "Hacer tú la cena de principio a fin",
    "En la cama antes de las doce, con la luz apagada"
  ],

  tutorial: [
    {t:"Tu día en tres anillos", d:"Retos, hábitos y Vital. Cuando se cierran los tres, el día ha salido redondo. Toca uno para ver qué cuenta."},
    {t:"Tus hábitos",            d:"Lo que quieres hacer cada día. Tócalo para marcarlo; mantén pulsado uno para cambiarlo."},
    {t:"Para moverte",           d:"Aquí cambias de sección. En Ajustes puedes volver a ver esta guía cuando quieras."}
  ]
};
/* si existe un textos.js al lado, lo que ponga allí manda */
(function(){ var x=window.DTRACK_TEXTOS; if(!x) return;
  for(var k in x){
    if(x[k]==null) continue;
    var esObj = typeof x[k]==="object" && !Array.isArray(x[k]);
    if(esObj && typeof TEXTOS[k]==="object" && !Array.isArray(TEXTOS[k])){
      for(var k2 in x[k]) if(x[k][k2]!=null) TEXTOS[k][k2]=x[k][k2];   /* así un textos.js viejo no borra lo nuevo */
    } else TEXTOS[k]=x[k];
  }
})();
/* ═══════════════ fin de los textos ═══════════════ */
