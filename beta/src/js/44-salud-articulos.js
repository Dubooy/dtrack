/* ───────── Salud del día: artículos largos ─────────
   Sustituye los artículos cortos de 42-salud-filas.js por artículos con portada,
   secciones con imagen, consejos con icono y un «Pruébalo hoy» al final.
   Las imágenes son SVG propios (pintura gouache) en beta/salud/. */

/* iconos de línea, 24×24: trazo del color del tema y un toque de relleno (.f) */
var SF_IC={
  cerebro:'<path class="f" d="M12 5a3 3 0 0 0-5.6 1.4A3 3 0 0 0 4.5 11a3 3 0 0 0 1.6 5.2A3 3 0 0 0 12 18z"/><path d="M12 5a3 3 0 0 0-5.6 1.4A3 3 0 0 0 4.5 11a3 3 0 0 0 1.6 5.2A3 3 0 0 0 12 18zM12 5a3 3 0 0 1 5.6 1.4A3 3 0 0 1 19.5 11a3 3 0 0 1-1.6 5.2A3 3 0 0 1 12 18zM12 5v13"/>',
  pesa:'<path d="M6 7.5v9M18 7.5v9M3.5 10v4M20.5 10v4M6 12h12"/>',
  tenedor:'<path d="M7.5 3v5.5a2.5 2.5 0 0 0 5 0V3M10 3v18M17 3c-2.2 2-2.2 7.5 0 9.5V21"/>',
  cara:'<circle class="f" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M8.8 14.3c1.7 1.5 4.7 1.5 6.4 0M9 10h.01M15 10h.01"/>',
  reloj:'<circle class="f" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  calendario:'<rect x="4" y="5" width="16" height="15" rx="3"/><path class="f" d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2H4z"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>',
  sol:'<circle class="f" cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  taza:'<path class="f" d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M9 3.5c-.8 1 .8 2 0 3M12.5 3.5c-.8 1 .8 2 0 3"/>',
  zapatilla:'<path class="f" d="M3 16.5V12l3-.5 2-4 3 2 2.5 2.8 5.5 1.7c1.5.5 2 1.4 2 2.5v.5z"/><path d="M3 16.5V12l3-.5 2-4 3 2 2.5 2.8 5.5 1.7c1.5.5 2 1.4 2 2.5v.5zM3 19.5h18"/>',
  luna:'<path class="f" d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  libro:'<path class="f" d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5z"/><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13"/>',
  termometro:'<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><circle class="s" cx="12" cy="17.5" r="1.8"/><path d="M12 9v6.5"/>',
  movilfuera:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M3.5 3.5l17 17"/>',
  arena:'<path class="f" d="M8 21v-2.5c0-2.5 4-4 4-6.5 0 2.5 4 4 4 6.5V21z"/><path d="M6.5 3h11M6.5 21h11M8 3v2.5c0 2.5 4 4 4 6.5 0-2.5 4-4 4-6.5V3M8 21v-2.5c0-2.5 4-4 4-6.5 0 2.5 4 4 4 6.5V21"/>',
  sofa:'<path class="f" d="M7 14h10v4H7z"/><path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v5H3zM5 18v2M19 18v2"/>',
  crono:'<circle class="f" cx="12" cy="13.5" r="7.5"/><circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V10M10 3h4M12 3v3M18.5 7l1.3-1.3"/>',
  aviso:'<path class="f" d="M12 4 2.8 19.5h18.4z"/><path d="M12 4 2.8 19.5h18.4zM12 10v4.5M12 17h.01"/>',
  vaso:'<path class="f" d="M6.6 11h10.8l-.9 8.2a1.8 1.8 0 0 1-1.8 1.6H9.3a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M5.5 4h13l-1.6 15.2a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8zM6.5 11h11"/>',
  manzana:'<path class="f" d="M12 7.5c-2-1.5-7-1.2-7 4.5 0 4.5 3 8.5 5 8.5 1 0 1.3-.5 2-.5s1 .5 2 .5c2 0 5-4 5-8.5 0-5.7-5-6-7-4.5z"/><path d="M12 7.5c-2-1.5-7-1.2-7 4.5 0 4.5 3 8.5 5 8.5 1 0 1.3-.5 2-.5s1 .5 2 .5c2 0 5-4 5-8.5 0-5.7-5-6-7-4.5zM12 7.5c0-2 1-3.5 3-4"/>',
  sopa:'<path class="f" d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M3.5 11h17a8.5 8.5 0 0 1-17 0zM8 20.5h8M9 3.5c-.8 1 .8 2 0 3.2M12.5 3.5c-.8 1 .8 2 0 3.2M16 3.5c-.8 1 .8 2 0 3.2"/>',
  gota:'<path class="f" d="M12 3.5s6.5 7 6.5 11a6.5 6.5 0 0 1-13 0c0-4 6.5-11 6.5-11z"/><path d="M12 3.5s6.5 7 6.5 11a6.5 6.5 0 0 1-13 0c0-4 6.5-11 6.5-11z"/>',
  gotallena:'<path class="s" d="M12 3.5s6.5 7 6.5 11a6.5 6.5 0 0 1-13 0c0-4 6.5-11 6.5-11z"/>',
  botella:'<path class="f" d="M7 12h10v7a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19z"/><path d="M10 2.5h4v3h-4zM9.5 5.5h5c1.5 1.5 2.5 3 2.5 5V19a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19v-8.5c0-2 1-3.5 2.5-5zM7 12h10"/>',
  ojo:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle class="s" cx="12" cy="12" r="3"/>',
  plato:'<circle cx="12" cy="12" r="8.5"/><circle class="f" cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="5"/>',
  limon:'<circle class="f" cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="8"/><path d="M12 6v12M6 12h12M7.8 7.8l8.4 8.4M16.2 7.8l-8.4 8.4"/>',
  hoja:'<path class="f" d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19l8.5-8.5"/>',
  fresa:'<path class="f" d="M12 8c-4 0-7 1.5-7 4.5C5 17 9.5 21 12 21s7-4 7-8.5C19 9.5 16 8 12 8z"/><path d="M12 8c-4 0-7 1.5-7 4.5C5 17 9.5 21 12 21s7-4 7-8.5C19 9.5 16 8 12 8zM8.5 4.5 12 8l3.5-3.5M12 8V3M9.5 12.5h.01M14.5 12.5h.01M12 15.5h.01"/>',
  sal:'<path class="f" d="M7.6 13h8.8l.6 6.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19.5z"/><path d="M8 9h8l1 10.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19.5zM8 9c0-3 1.5-5.5 4-5.5S16 6 16 9M10.5 6.2h.01M13.5 6.2h.01M12 5h.01"/>',
  corazon:'<path class="f" d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/><path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
  play:'<rect x="3" y="5" width="18" height="14" rx="3"/><path class="s" d="M10 9.2v5.6l4.8-2.8z"/>',
  mando:'<path class="f" d="M7 8h10a4.5 4.5 0 0 1 4.3 5.8l-1 3.2a2 2 0 0 1-3.4.7L15 16H9l-1.9 1.7a2 2 0 0 1-3.4-.7l-1-3.2A4.5 4.5 0 0 1 7 8z"/><path d="M7 8h10a4.5 4.5 0 0 1 4.3 5.8l-1 3.2a2 2 0 0 1-3.4.7L15 16H9l-1.9 1.7a2 2 0 0 1-3.4-.7l-1-3.2A4.5 4.5 0 0 1 7 8zM7.5 10.5v3M6 12h3M15.5 11.5h.01M17.5 13h.01"/>',
  nube:'<path class="f" d="M7 18.5h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 11a3.8 3.8 0 0 0 1 7.5z"/><path d="M7 18.5h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 11a3.8 3.8 0 0 0 1 7.5z"/>',
  campanafuera:'<path d="M6 16.5h12l-1.5-2V10A4.5 4.5 0 0 0 12 5.5 4.5 4.5 0 0 0 7.5 10v4.5zM10 19.5a2 2 0 0 0 4 0M3.5 3.5l17 17"/>',
  byn:'<circle cx="12" cy="12" r="8.5"/><path class="s" d="M12 3.5a8.5 8.5 0 0 1 0 17z"/>',
  candado:'<rect class="f" x="5" y="10.5" width="14" height="10" rx="2.5"/><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5"/>',
  puerta:'<path class="f" d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21z"/><path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M3.5 21h17M14.5 12h.01"/>',
  enchufe:'<path class="f" d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0zM12 16.5V21"/>',
  despertador:'<circle class="f" cx="12" cy="13" r="7.5"/><circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M4 6l3-2.5M20 6l-3-2.5M6.5 19.5 5 21M17.5 19.5 19 21"/>',
  bucle:'<path d="M17.5 7A7 7 0 1 0 19 12M19.5 3.5V7.5h-4"/>',
  cargador:'<path class="f" d="M7 7h10v4a5 5 0 0 1-10 0z"/><path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 0 1-10 0zM12 16v2.5a2.5 2.5 0 0 0 5 0V17"/>',
  diana:'<circle cx="12" cy="12" r="8.5"/><circle class="f" cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="5"/><circle class="s" cx="12" cy="12" r="1.8"/>'
};

/* artículos: d = portada, t = título, s = entradilla, i = introducción (párrafos),
   sec = secciones { h, p:[párrafos], img, tips:[[icono, título, texto]] },
   res = en resumen, reto = «Pruébalo hoy» */
SF_ARTS={
  sleep:[
    { d:"S1-portada", t:"Por qué dormir bien lo cambia todo", s:"Qué ocurre en el cuerpo y en el cerebro durante la noche, y cuánto descanso necesitas de verdad.",
      i:["Solemos tratar el sueño como el margen que queda cuando todo lo demás está hecho. Es un error caro: dormir no es una pausa, sino un estado activo en el que el organismo hace tareas que no puede hacer despierto.",
         "Cuando el descanso falla de forma repetida, se nota en casi todo: en la concentración, en el estado de ánimo, en el apetito y en cómo responde el cuerpo al entrenamiento. Entender qué pasa durante la noche ayuda a darle la prioridad que merece."],
      sec:[
        { h:"Lo que pasa mientras duermes", img:"S1-a",
          p:["El sueño no es uniforme. A lo largo de la noche se suceden ciclos de unos 90 minutos en los que se alternan el sueño ligero, el profundo y la fase REM, la de los sueños más vívidos. Al principio de la noche predomina el sueño profundo; hacia el final, el REM.",
             "Cada fase cumple una función distinta, y por eso no da igual recortar por el principio o por el final: acostarse tarde y levantarse temprano elimina sobre todo las fases que más se concentran en esos extremos."],
          tips:[["cerebro","Memoria y aprendizaje","Durante el sueño, el cerebro reactiva y consolida lo aprendido durante el día. Estudiar y dormir después rinde más que sacrificar horas de sueño para estudiar más."],
                ["pesa","Recuperación física","En el sueño profundo aumenta la liberación de hormona del crecimiento y se reparan los tejidos. Entrenar duro y dormir poco frena la mejora."],
                ["tenedor","Apetito","La falta de sueño altera las señales que regulan el hambre y la saciedad. Es habitual que, tras una mala noche, aumente el deseo de alimentos dulces o muy calóricos."],
                ["cara","Emociones","Con poco descanso, la parte del cerebro que reacciona ante las amenazas se vuelve más sensible y la que la regula, menos eficaz. Por eso todo parece más difícil de gestionar."]] },
        { h:"Cuántas horas necesitas", img:"S1-b",
          p:["Las necesidades cambian con la edad. Las recomendaciones de las sociedades del sueño son rangos, no cifras exactas: hay personas que funcionan bien en la parte baja y otras que necesitan la alta.",
             "La mejor señal es cómo te encuentras: si necesitas el despertador para salir de un sueño profundo, si te cuesta concentrarte a media mañana o si el fin de semana duermes muchas más horas, probablemente arrastras una deuda de sueño."],
          tips:[["reloj","De 14 a 17 años","Entre 8 y 10 horas por noche."],
                ["reloj","De 18 a 25 años","Entre 7 y 9 horas por noche."],
                ["calendario","La regularidad cuenta","Dormir bien de lunes a viernes importa más que recuperar el fin de semana. Los grandes cambios de horario desajustan el reloj interno, como un pequeño desfase horario."]] }
      ],
      res:["El sueño es un proceso activo que consolida la memoria, repara los músculos y regula el apetito y las emociones.",
           "Entre los 18 y los 25 años se recomiendan de 7 a 9 horas.",
           "La constancia de horarios es tan importante como la cantidad."],
      reto:"Esta noche, pon una alarma para empezar a prepararte para dormir 8 horas antes de la hora a la que te levantas." },
    { d:"S2-portada", t:"Una rutina para dormirte antes", s:"El reloj interno responde a la luz y a los horarios. Estas son las palancas que más influyen.",
      i:["Dormirse no se puede forzar, pero sí se pueden crear las condiciones para que ocurra. El cuerpo tiene un reloj interno, el ritmo circadiano, que se ajusta cada día con señales del entorno: sobre todo la luz, pero también la hora de las comidas, el ejercicio y la propia rutina.",
         "La idea no es aplicar todos los consejos a la vez, sino elegir dos o tres y mantenerlos el tiempo suficiente para notar el efecto, que suele aparecer en una o dos semanas."],
      sec:[
        { h:"Durante el día", img:"S2-a",
          p:["La calidad de la noche empieza a decidirse por la mañana. La luz natural temprana adelanta el reloj interno y hace que, por la noche, el sueño llegue antes y con más fuerza."],
          tips:[["sol","Luz natural por la mañana","Pasa entre 10 y 30 minutos al aire libre poco después de levantarte, aunque esté nublado. Es la señal más potente para poner en hora el reloj."],
                ["taza","Cafeína con horario","La cafeína tarda horas en eliminarse: tomada seis horas antes de acostarse todavía puede reducir el sueño de forma medible. Como norma, evita café, té fuerte y bebidas energéticas después de las 16:00."],
                ["zapatilla","Actividad física","El ejercicio regular mejora la profundidad del sueño. Lo ideal es terminar los entrenamientos intensos al menos dos o tres horas antes de acostarte."]] },
        { h:"Antes de acostarte", img:"S2-b",
          p:["La última hora del día funciona como una transición. Si pasas directamente de una actividad estimulante a la cama, el cerebro sigue en marcha."],
          tips:[["luna","Horarios estables","Acuéstate y levántate a la misma hora todos los días, con un margen de una hora el fin de semana."],
                ["libro","Una actividad tranquila","Leer en papel, estirar o escribir unas líneas sirven de señal de cierre. Lo importante es que sea siempre parecido."],
                ["termometro","Un dormitorio fresco y oscuro","La temperatura corporal baja al dormirse; una habitación a unos 18 o 19 grados lo facilita. Oscuridad y silencio hacen el resto."],
                ["movilfuera","Pantallas fuera","No es solo la luz: el contenido mantiene la mente activa. Deja el móvil cargando fuera del alcance de la cama."]] },
        { h:"Si no te duermes", img:"S2-c",
          p:["Pasar mucho tiempo despierto en la cama hace que el cerebro asocie la cama con estar alerta. Es uno de los mecanismos que mantienen el insomnio."],
          tips:[["arena","La regla de los 20 minutos","Si te parece que llevas unos 20 minutos sin dormirte, no mires el reloj: levántate."],
                ["sofa","Algo aburrido, con poca luz","Siéntate fuera de la cama y haz algo tranquilo hasta que vuelvas a notar sueño. Después, regresa."]] }
      ],
      res:["La luz de la mañana y unos horarios estables son las dos palancas más eficaces.",
           "La cafeína y el ejercicio intenso, lejos de la hora de dormir.",
           "Si no concilias el sueño, mejor levantarse que dar vueltas en la cama."],
      reto:"Elige una hora para acostarte y otra para levantarte, y mantenlas durante los próximos 7 días." },
    { d:"S3-portada", t:"Siestas: cuándo sí y cuándo no", s:"Bien hechas recargan la tarde. Mal planteadas, empeoran la noche.",
      i:["A primera hora de la tarde hay una bajada natural del estado de alerta, independiente de la comida. Una siesta corta en ese momento puede mejorar la atención y el rendimiento durante horas.",
         "El problema aparece cuando la siesta es demasiado larga o demasiado tardía: entonces resta presión de sueño a la noche y puede convertirse en parte del problema."],
      sec:[
        { h:"La siesta que funciona", img:"S3-a",
          p:["La clave es despertarse antes de entrar en sueño profundo. Si lo consigues, te levantas despejado; si no, aparece la inercia del sueño, esa sensación de aturdimiento que puede durar media hora."],
          tips:[["crono","Entre 10 y 20 minutos","Pon una alarma. Es el margen que mejora la alerta sin dejarte aturdido."],
                ["reloj","Mejor antes de las 16:00","Cuanto más tarde, más se resiente el sueño nocturno."]] },
        { h:"Cuándo conviene evitarla", img:"S3-b",
          p:["Si pasas de la media hora, es probable que te despiertes en pleno sueño profundo: desorientado y con más cansancio que antes."],
          tips:[["aviso","Si duermes mal por la noche","Las siestas largas reducen el sueño acumulado y hacen más difícil dormirse después. En ese caso, es mejor evitarlas y adelantar la hora de acostarse."],
                ["luna","Al final de la tarde","Una cabezada a las ocho de la tarde le roba horas a la noche, aunque solo dure unos minutos."]] }
      ],
      res:["Una siesta de 10 a 20 minutos mejora la alerta sin efectos secundarios.",
           "Las siestas largas o tardías empeoran el sueño nocturno.",
           "Si duermes mal por la noche, la solución no es la siesta."],
      reto:"La próxima vez que estés cansado después de comer, prueba una siesta de 15 minutos con alarma." }
  ],
  water:[
    { d:"A1-portada", t:"¿De verdad hacen falta 8 vasos?", s:"De dónde viene la cifra, cuánto necesitas y cómo saber si vas bien.",
      i:["Los famosos 8 vasos al día son una forma cómoda de recordar una cantidad aproximada, no una prescripción médica. Las autoridades sanitarias europeas recomiendan una ingesta total de unos 2 litros al día para las mujeres y 2,5 para los hombres, contando toda el agua que se consume, también la de los alimentos.",
         "Esa cifra varía mucho según el tamaño corporal, la actividad, el clima y la dieta. Más que contar con exactitud, conviene entender de dónde sale el agua y cuándo el cuerpo necesita más."],
      sec:[
        { h:"De dónde sale el agua", img:"A1-a",
          p:["Alrededor de una quinta parte del agua que tomamos llega con la comida. Una dieta rica en fruta, verdura y platos de cuchara aporta bastante más que una basada en alimentos secos o procesados."],
          tips:[["vaso","Agua y otras bebidas","Son la principal fuente. El agua es la mejor opción; las bebidas azucaradas hidratan, pero añaden calorías que no sacian."],
                ["manzana","Fruta y verdura","La sandía, la naranja, el pepino o el tomate tienen más de un 85 % de agua."],
                ["sopa","Sopas, cremas y guisos","Cuentan como agua, y en invierno son una forma cómoda de llegar a la cantidad diaria."]] },
        { h:"Cuándo necesitas más", img:"A1-b",
          p:["Hay situaciones en las que las pérdidas aumentan de forma notable, a veces sin que lo percibas."],
          tips:[["sol","Calor","Con temperaturas altas se suda más, incluso sin hacer ejercicio. La sed llega con algo de retraso."],
                ["zapatilla","Actividad física","Según la intensidad y el calor, una hora de entrenamiento puede suponer perder entre medio litro y más de un litro de sudor."],
                ["termometro","Enfermedad","La fiebre, los vómitos o la diarrea aumentan mucho las pérdidas. En esos casos, las soluciones de rehidratación son más eficaces que el agua sola."]] },
        { h:"La señal más fiable", img:"A1-c",
          p:["No hace falta llevar la cuenta de cada vaso. El color de la orina es un indicador sencillo y bastante fiable del estado de hidratación en personas sanas."],
          tips:[["gota","Amarillo pálido","Indica una hidratación adecuada."],
                ["gotallena","Amarillo oscuro","Es señal de que conviene beber más. Algunos suplementos vitamínicos pueden oscurecerla sin que haya deshidratación."]] }
      ],
      res:["Los 8 vasos son una referencia útil, no una regla exacta.",
           "Una parte del agua llega con los alimentos.",
           "El color de la orina es la forma más sencilla de saber cómo vas."],
      reto:"Mañana, bebe un vaso de agua nada más levantarte y apúntalo con «+ vaso»." },
    { d:"A2-portada", t:"Trucos para beber más sin pensarlo", s:"Por qué la fuerza de voluntad falla y qué funciona en su lugar.",
      i:["Casi nadie bebe poca agua por desinterés, sino porque no la tiene a mano en el momento en que la necesita. Beber es un comportamiento muy sensible al entorno: si el agua está cerca y visible, se consume más sin esfuerzo.",
         "Por eso las estrategias más eficaces no dependen de acordarse, sino de cambiar lo que te rodea y de enganchar el hábito a rutinas que ya tienes."],
      sec:[
        { h:"Que sea lo más fácil", img:"A2-a",
          p:["La regla es sencilla: reduce los pasos entre la sed y el vaso. Cuantos menos obstáculos, más veces bebes."],
          tips:[["botella","Una botella propia","Llevar una botella reutilizable que te guste multiplica las ocasiones de beber durante el día."],
                ["ojo","A la vista","Lo que está a la vista se usa. Déjala en la mesa de trabajo o de estudio, no dentro de la mochila."],
                ["plato","Ligada a las comidas","Un vaso de agua con cada comida asegura tres o cuatro vasos al día sin pensar en ello."]] },
        { h:"Si el agua te resulta aburrida", img:"A2-b",
          p:["Darle sabor sin azúcar es una forma eficaz de beber más, sobre todo para quien está acostumbrado a refrescos."],
          tips:[["limon","Cítricos","Unas rodajas de limón, lima o naranja cambian el sabor sin añadir calorías."],
                ["hoja","Hierbas","La menta o la hierbabuena dan frescor, especialmente con agua fría."],
                ["fresa","Fruta","Fresas, frutos rojos o pepino, mejor si se dejan reposar un rato en la nevera."]] }
      ],
      res:["Cambiar el entorno funciona mejor que proponérselo.",
           "Ten el agua a la vista y ligada a las comidas.",
           "Si el agua sola no te apetece, dale sabor sin azúcar."],
      reto:"Rellena una botella y déjala hoy a la vista en tu mesa. Cada vaso que bebas, toca «+ vaso»." },
    { d:"A3-portada", t:"Agua y deporte", s:"Cuánto beber antes, durante y después de entrenar.",
      i:["Durante el ejercicio, el cuerpo se refrigera sudando, y con el sudor pierde agua y sales minerales. Una pérdida de solo el 2 % del peso corporal ya puede reducir el rendimiento y aumentar la sensación de esfuerzo.",
         "La hidratación deportiva no consiste en beber mucho, sino en beber con criterio: llegar bien hidratado, reponer durante el esfuerzo si es largo y recuperar después."],
      sec:[
        { h:"Antes, durante y después", img:"A3-a",
          p:["Cada fase tiene su objetivo. Antes, empezar sin déficit; durante, limitar las pérdidas; después, recuperar lo que falta."],
          tips:[["reloj","Antes","Uno o dos vasos de agua en las dos o tres horas previas, para llegar hidratado sin sentirte pesado."],
                ["gota","Durante","En sesiones de más de una hora, sorbos pequeños cada 15 o 20 minutos. En entrenamientos cortos suele bastar con beber al terminar."],
                ["pesa","Después","Si te pesas antes y después, cada kilo perdido equivale aproximadamente a un litro de sudor. Lo recomendable es reponer algo más de esa cantidad en las horas siguientes."]] },
        { h:"Calor y esfuerzos largos", img:"A3-b",
          p:["Con más de una hora de ejercicio intenso o con calor, el agua sola puede quedarse corta, porque el sudor también arrastra sodio."],
          tips:[["sol","Elige la hora","En verano, entrena a primera hora de la mañana o al final de la tarde, y busca sombra."],
                ["sal","Bebidas con electrolitos","Ayudan a reponer el sodio y favorecen que el agua se retenga. Para entrenamientos cortos o suaves no son necesarias."]] }
      ],
      res:["Llega al entrenamiento bien hidratado.",
           "En sesiones largas, bebe a sorbos durante el esfuerzo.",
           "Con calor o más de una hora de ejercicio, añade electrolitos."],
      reto:"En tu próximo entreno, pésate antes y después: la diferencia te dirá cuánto sudas." }
  ],
  screen:[
    { d:"P1-portada", t:"¿Por qué menos de 2 horas?", s:"De dónde sale la cifra, qué cuenta y qué efectos tiene pasarse.",
      i:["El límite de 2 horas diarias de pantallas en el tiempo libre procede de las guías de salud para niños y adolescentes, y se ha convertido en una referencia útil también para adultos jóvenes. No hay una cifra mágica: lo que importa es qué desplaza ese tiempo.",
         "Cada hora frente al móvil es una hora que no se dedica a dormir, moverse, ver a otras personas o concentrarse en algo. Ese es, en buena medida, el problema."],
      sec:[
        { h:"Qué cuenta y qué no", img:"P1-a",
          p:["La referencia se aplica al ocio. El tiempo que dedicas a estudiar o trabajar con un ordenador tiene otros efectos y se valora aparte."],
          tips:[["corazon","Redes sociales","Cuentan. Son además las más asociadas al malestar por comparación con los demás."],
                ["play","Vídeos y series","Cuentan, sobre todo el vídeo corto, que dificulta poner un final."],
                ["mando","Videojuegos","Cuentan. Con moderación pueden ser sociales y estimulantes."],
                ["libro","Estudio y trabajo","No cuentan, aunque conviene hacer pausas para la vista y el cuerpo."]] },
        { h:"Lo que notas cuando te pasas", img:"P1-b",
          p:["Los estudios encuentran asociaciones consistentes entre muchas horas de ocio con pantallas y varios problemas. No siempre está claro qué es causa y qué es consecuencia, pero el patrón se repite."],
          tips:[["luna","Peor sueño","Se retrasa la hora de dormir y se tarda más en conciliar el sueño."],
                ["zapatilla","Más sedentarismo","Las horas sentado se acumulan sin que se perciban."],
                ["nube","Más ansiedad","El uso intensivo de redes se asocia a más ansiedad y peor imagen de uno mismo, sobre todo por la comparación constante."]] }
      ],
      res:["Las 2 horas son una referencia para el ocio, no para el estudio o el trabajo.",
           "El problema principal es lo que ese tiempo desplaza.",
           "Sueño, actividad física y bienestar son lo primero que se resiente."],
      reto:"Mira en los ajustes del móvil cuánto tiempo pasaste ayer en cada app." },
    { d:"P2-portada", t:"Cómo mirar menos el móvil", s:"Estrategias que no dependen de la fuerza de voluntad.",
      i:["Las aplicaciones más usadas están diseñadas por equipos enteros cuyo objetivo es captar tu atención el mayor tiempo posible. Plantearlo como una cuestión de autocontrol es partir en desventaja.",
         "Lo que mejor funciona es añadir fricción: pequeños obstáculos que no impiden usar el móvil, pero que obligan a hacerlo de forma intencionada y no por inercia."],
      sec:[
        { h:"Cambia el móvil", img:"P2-a",
          p:["Unos pocos ajustes reducen mucho las veces que lo coges sin motivo."],
          tips:[["campanafuera","Notificaciones al mínimo","Deja activas solo las de personas (mensajes y llamadas) y desactiva las de aplicaciones."],
                ["byn","Escala de grises","Sin color, las aplicaciones resultan mucho menos atractivas. Se activa en los ajustes de accesibilidad y algunos estudios muestran reducciones notables del tiempo de uso."],
                ["candado","Límites por aplicación","Fija un tiempo máximo diario para las dos o tres aplicaciones que más usas."]] },
        { h:"Cambia el entorno", img:"P2-b",
          p:["La distancia física es una de las barreras más eficaces. Basta con que el móvil esté en otra habitación para que el impulso de cogerlo se debilite."],
          tips:[["puerta","Fuera del dormitorio","Es el cambio con más impacto, sobre todo para el sueño."],
                ["enchufe","Un sitio fijo para cargarlo","Lejos de la cama y de la mesa de estudio."],
                ["despertador","Un despertador independiente","Así el móvil deja de ser lo primero y lo último que ves cada día."]] }
      ],
      res:["La fuerza de voluntad compite en desventaja con aplicaciones diseñadas para engancharte.",
           "Menos notificaciones, escala de grises y límites por aplicación.",
           "La distancia física es la barrera más eficaz."],
      reto:"Hoy, mientras estudias o trabajas, deja el móvil en otra habitación durante una hora." },
    { d:"P3-portada", t:"Pantallas y sueño", s:"Por qué el móvil en la cama te quita horas, y no solo por la luz.",
      i:["Durante años se ha culpado a la luz azul de las pantallas. Su efecto existe, pero es modesto. Lo que más pesa es el contenido: mensajes, vídeos y notificaciones mantienen la mente activa y, sobre todo, retrasan la hora real de dormir.",
         "Muchas personas no duermen poco porque tarden en dormirse, sino porque se acuestan con el móvil y no lo sueltan hasta mucho después."],
      sec:[
        { h:"Por qué te quita horas", img:"P3-a",
          p:["Los formatos actuales están pensados para que no haya un punto final natural. Cuando no hay un final, decidir parar requiere un esfuerzo que, a última hora del día, cuesta más."],
          tips:[["play","El siguiente vídeo","Cada pieza dura poco, por lo que el coste de ver otra parece mínimo."],
                ["bucle","Sin final","El desplazamiento infinito elimina las pausas en las que normalmente te detendrías."],
                ["reloj","El coste real","Una hora de móvil en la cama suele traducirse en una hora menos de sueño."]] },
        { h:"Qué hacer", img:"P3-b",
          p:["La solución más eficaz es sencilla: que el móvil no duerma contigo. Lo demás son formas de hacerlo más llevadero."],
          tips:[["despertador","Un despertador clásico","Elimina la excusa más habitual para tener el móvil junto a la cama."],
                ["libro","Una alternativa a mano","Un libro en la mesilla ocupa el hueco que deja la pantalla."],
                ["cargador","El cargador en otra habitación","Si el cargador está fuera, el móvil también."]] }
      ],
      res:["Lo que más afecta al sueño es el contenido, no tanto la luz.",
           "El problema principal es que retrasa la hora real de dormir.",
           "Cargar el móvil fuera del dormitorio es la medida más eficaz."],
      reto:"Esta noche, deja el móvil cargando fuera del dormitorio." }
  ]
};

/* la miniatura de cada artículo en la hoja es su portada */
function sfDibujo(d){ return '<img src="salud/'+d+'.jpg" alt="" loading="lazy" decoding="async">'; }
function sfIcono(n){ return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(SF_IC[n]||"")+'</svg>'; }

function sfMinutos(a){
  var txt=[].concat(a.i).join(" ")+" "+a.sec.map(function(s){ return [].concat(s.p).join(" ")+" "+s.tips.map(function(t){ return t[1]+" "+t[2]; }).join(" "); }).join(" ")+" "+(a.res||[]).join(" ");
  return Math.max(1, Math.round(txt.split(/\s+/).length/200));
}
var SF_TEMA={ sleep:"sueño", water:"agua", screen:"pantallas" };
/* consejo como en Salud del iPhone: icono grande y una sola frase */
function sfConsejo(t){
  return '<li><span class="sfa-ic">'+sfIcono(t[0])+'</span><p>'+(t[1]?'<b>'+t[1]+'.</b> ':'')+t[2]+'</p></li>';
}
function sfArticulo(k, i){
  var a=SF_ARTS[k][i]; if(!a) return;
  var tema=SF_TEMA[k]||SF_HOJA[k].t.toLowerCase();
  openSheet(
    '<div class="sfh sfh-leer sfa" style="--sf:var('+SF_COLOR[k]+')">'+
    '<div class="sfa-cab"><button class="sfa-bt" data-act="x-sf-volver" data-k="'+k+'" aria-label="Volver"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>'+
      '<b>Artículo sobre '+(k=="screen"?"las ":"el ")+tema+'</b>'+
      '<button class="sfa-bt" data-act="close-sheet" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'+
    '<div class="sfh-dib sfa-portada">'+sfDibujo(a.d)+'</div>'+
    '<h3>'+a.t+'</h3>'+
    [a.s].concat(a.i).map(function(x){ return '<p>'+x+'</p>'; }).join("")+
    a.sec.map(function(s){
      return '<section class="sfa-sec"><h4>'+s.h+'</h4>'+[].concat(s.p).map(function(x){ return '<p>'+x+'</p>'; }).join("")+
        '<div class="sfh-dib sfa-img">'+sfDibujo(s.img)+'</div>'+
        '<ul class="sfa-tips">'+s.tips.map(sfConsejo).join("")+'</ul></section>';
    }).join("")+
    (a.res ? '<section class="sfa-sec"><h4>En resumen</h4><ul class="sfa-res">'+a.res.map(function(x){ return '<li>'+x+'</li>'; }).join("")+'</ul></section>' : '')+
    '<section class="sfa-sec"><h4>Pruébalo hoy</h4><ul class="sfa-tips">'+sfConsejo(["diana","",a.reto])+'</ul></section>'+
    '</div>'
  );
  var sc=document.querySelector("#sheet .sheet-card"); if(!sc) return;
  sc.scrollTop=0;
  /* la cabecera va sobre la portada; al bajar, se vuelve opaca */
  var cab=sc.querySelector(".sfa-cab"), por=sc.querySelector(".sfa-portada");
  sc.onscroll=function(){
    if(!cab || !cab.isConnected){ sc.onscroll=null; return; }
    cab.classList.toggle("solida", sc.scrollTop > por.offsetHeight-70);
  };
}

(function(){
  var st=document.createElement("style");
  st.textContent=[
'.sfh-dib{ aspect-ratio:400/220!important; }',
'.sfh-dib img{ display:block; width:100%; height:100%; object-fit:cover; }',
'.sfa{ --sfa-pad:24px; }',
'@media (min-width:640px){ .sfa{ --sfa-pad:28px; } }',
/* cabecera flotante sobre la portada */
'.sfa-cab{ position:sticky; top:calc(-1 * var(--sfa-pad)); z-index:3; display:flex; align-items:center; gap:10px; height:68px; padding:0 14px;',
'  margin:calc(-1 * var(--sfa-pad)) calc(-1 * var(--sfa-pad)) 0; color:#fff; transition:background .25s, color .25s; }',
'.sfa-cab b{ flex:1; text-align:center; font-size:16px; font-weight:600; text-shadow:0 1px 6px rgba(0,0,0,.35); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
'.sfa-bt{ flex:none; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; color:inherit;',
'  background:rgba(20,18,30,.28); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); box-shadow:inset 0 0 0 1px rgba(255,255,255,.22); }',
'.sfa-bt svg{ width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }',
'.sfa-cab.solida{ background:color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); color:var(--t1); }',
'.sfa-cab.solida b{ text-shadow:none; }',
'.sfa-cab.solida .sfa-bt{ background:color-mix(in srgb, var(--t1) 8%, transparent); box-shadow:none; }',
'.sfa-portada{ position:relative; margin:-68px calc(-1 * var(--sfa-pad)) 26px; aspect-ratio:400/250!important; border-radius:0!important; }',
'.sfa-portada::before{ content:""; position:absolute; inset:0 0 auto; height:90px; z-index:1; background:linear-gradient(rgba(10,8,20,.45), transparent); }',
/* texto grande y limpio, sin grises */
'.sfa h3{ font-size:32px; font-weight:800; letter-spacing:-.03em; line-height:1.1; margin-bottom:12px; }',
'.sfa p{ font-size:17.5px; line-height:1.45; color:var(--t1); margin-bottom:12px; }',
'.sfa-sec{ margin-top:34px; }',
'.sfa-sec h4{ font-size:23px; font-weight:800; letter-spacing:-.02em; line-height:1.2; margin-bottom:8px; }',
'.sfa-img{ border-radius:16px; margin:18px 0 22px; }',
'.sfa-tips{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:22px; }',
'.sfa-tips li{ display:flex; align-items:center; gap:18px; }',
'.sfa-tips p{ flex:1; margin:0; }',
'.sfa-tips p b{ font-weight:600; }',
'.sfa-ic{ flex:none; width:58px; height:58px; display:grid; place-items:center; }',
'.sfa-ic svg{ width:58px; height:58px; overflow:visible; fill:none; stroke:var(--sf); stroke-width:1.15; stroke-linecap:round; stroke-linejoin:round; }',
'.sfa-ic svg .f{ fill:var(--sf); fill-opacity:.28; stroke:none; }',
'.sfa-ic svg .s{ fill:var(--sf); stroke:none; }',
'.sfa-res{ margin:6px 0 0; padding:0 0 0 20px; list-style:disc; display:flex; flex-direction:column; gap:8px; }',
'.sfa-res li{ font-size:17.5px; line-height:1.45; color:var(--t1); }',
'.sfa-res li::marker{ color:var(--sf); }'
  ].join("\n"); document.head.appendChild(st);
})();
