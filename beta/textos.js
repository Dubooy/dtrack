/* ══════════════════════════════════════════════════════════════════════
   DTrack · TEXTOS
   ----------------------------------------------------------------------
   Este archivo manda sobre los textos que trae la app. Cambia lo que
   quieras entre comillas y guarda: al recargar, aparecen tus versiones.

   · avisos    servidor: la dirección de tu servidor de Cloudflare (mira
                LEEME-avisos.txt). clave: no la toques.
   · niveles   los 20 nombres de nivel, de peor a mejor. Tienen que ser 20.
   · saludos   lo que sale en el Resumen según la hora.
   · anillo    el comentario según el porcentaje del día.
   · parte     los cinco pasos del parte del día y las frases del final.
   · logros    nombre (n) y explicación (d) de cada logro. El ORDEN importa:
               cada línea va con una condición fija del programa, así que
               puedes cambiar el texto pero no mover las líneas de sitio.
   · retos     la lista de retos diarios. Añade o quita los que quieras.
   · tutorial  los 3 pasos. Si borras una línea, ese paso desaparece.

   Reglas: no quites las comas entre líneas ni los corchetes. Las comillas
   van siempre en pareja. Si algo se rompe, la app usa sus textos de serie.
   ══════════════════════════════════════════════════════════════════════ */
window.DTRACK_TEXTOS = {

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
