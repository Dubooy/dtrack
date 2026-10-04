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

/* artículos: d = portada, t = título, s = entradilla, i = introducción,
   sec = secciones { h, p, img, tips:[[icono, título, texto]] }, reto = «Pruébalo hoy» */
SF_ARTS={
  sleep:[
    { d:"S1-portada", t:"Por qué dormir bien lo cambia todo", s:"Lo que hace tu cuerpo mientras duermes.",
      i:"Dormir no es tiempo perdido. Mientras descansas, el cuerpo y el cerebro hacen un trabajo que no pueden hacer despiertos.",
      sec:[
        { h:"Lo que pasa mientras duermes", img:"S1-a",
          p:"Cada noche pasas varias veces por el sueño ligero y el profundo, en vueltas de hora y media más o menos. En cada fase pasa algo distinto.",
          tips:[["cerebro","Memoria","El cerebro repasa lo que has aprendido y lo guarda. Estudiar y luego dormir funciona mejor que pasar la noche en vela."],
                ["pesa","Músculos","En el sueño profundo se repara el músculo que has trabajado al entrenar."],
                ["tenedor","Hambre","Dormir poco desajusta las ganas de comer: al día siguiente te apetece más dulce y más comida rápida."],
                ["cara","Ánimo","Con sueño todo molesta más. Dormir bien te ayuda a tener paciencia y a llevar mejor el estrés."]] },
        { h:"Cuántas horas necesitas", img:"S1-b",
          p:"Depende de la edad. Son referencias: hay quien necesita un poco más y quien un poco menos.",
          tips:[["reloj","De 14 a 17 años","Entre 8 y 10 horas."],
                ["reloj","De 18 a 25 años","Entre 7 y 9 horas."],
                ["calendario","Casi todos los días","Lo que cuenta es dormir bien entre semana, no recuperar el fin de semana."]] }
      ],
      reto:"Esta noche, pon una alarma para irte a la cama 8 horas antes de la hora a la que te levantas." },
    { d:"S2-portada", t:"Una rutina para dormirte antes", s:"Pequeños cambios que se notan en una semana.",
      i:"El cuerpo tiene un reloj interno que se guía por la luz y por los horarios. Si le das pistas claras, te costará menos dormirte.",
      sec:[
        { h:"Durante el día", img:"S2-a",
          p:"Lo que haces por la mañana y por la tarde también cuenta para la noche.",
          tips:[["sol","Luz por la mañana","Sal fuera un rato nada más levantarte. La luz del sol pone en hora el reloj del cuerpo."],
                ["taza","Cafeína, antes de las 16:00","El café, el té y las bebidas energéticas siguen haciendo efecto 6 horas después."],
                ["zapatilla","Muévete","El ejercicio ayuda a dormir mejor, pero evita entrenar fuerte justo antes de acostarte."]] },
        { h:"Antes de acostarte", img:"S2-b",
          p:"La última hora del día es para bajar el ritmo.",
          tips:[["luna","Siempre a la misma hora","Acuéstate y levántate a la misma hora, también el fin de semana."],
                ["libro","Lee en papel","Un rato de lectura avisa al cerebro de que toca descansar."],
                ["termometro","Habitación fresca","Se duerme mejor a unos 18 o 19 grados, a oscuras y sin ruido."],
                ["movilfuera","Móvil fuera","Déjalo cargando lejos de la cama."]] },
        { h:"Si no te duermes", img:"S2-c",
          p:"Dar vueltas en la cama enseña al cerebro que la cama es para estar despierto.",
          tips:[["arena","Unos 20 minutos","Si pasa más o menos ese tiempo y sigues despierto, no mires la hora y levántate."],
                ["sofa","Levántate un rato","Haz algo tranquilo con poca luz y vuelve a la cama cuando tengas sueño."]] }
      ],
      reto:"Elige una hora para acostarte y otra para levantarte, y mantenlas los próximos 7 días." },
    { d:"S3-portada", t:"Siestas: cuándo sí y cuándo no", s:"Cortas y temprano, mejor.",
      i:"Una siesta bien hecha te despeja toda la tarde. Mal hecha, te deja peor y te quita sueño por la noche.",
      sec:[
        { h:"La siesta buena", img:"S3-a",
          p:"El truco es despertarte antes de entrar en el sueño profundo.",
          tips:[["crono","De 10 a 20 minutos","Pon una alarma. Es suficiente para recargar sin quedarte atontado."],
                ["reloj","Antes de las 16:00","Cuanto más tarde, más te costará dormirte por la noche."]] },
        { h:"Cuándo evitarla", img:"S3-b",
          p:"Si pasas de media hora, te despiertas en pleno sueño profundo, sin saber muy bien dónde estás.",
          tips:[["aviso","Si duermes mal de noche","Las siestas largas empeoran el problema. Mejor aguantar y acostarte antes."],
                ["luna","Si ya es de tarde","Una cabezada a las ocho le roba horas a la noche."]] }
      ],
      reto:"La próxima vez que estés cansado después de comer, prueba una siesta de 15 minutos con alarma." }
  ],
  water:[
    { d:"A1-portada", t:"¿De verdad hacen falta 8 vasos?", s:"Lo que dice la ciencia, sin mitos.",
      i:"Los 8 vasos son una referencia fácil de recordar, no una regla exacta. Lo importante es beber a menudo y fijarte en lo que te pide el cuerpo.",
      sec:[
        { h:"De dónde sale el agua", img:"A1-a",
          p:"No toda el agua que necesitas viene del vaso: una parte te llega con la comida.",
          tips:[["vaso","Agua y bebidas","Son la mayor parte. El agua es la mejor opción."],
                ["manzana","Fruta y verdura","La sandía, la naranja o el pepino son casi todo agua."],
                ["sopa","Sopas y cremas","También cuentan, sobre todo en invierno."]] },
        { h:"Cuándo necesitas más", img:"A1-b",
          p:"Hay días en los que el cuerpo pierde más agua de lo normal.",
          tips:[["sol","Calor","Con calor sudas más, aunque no lo notes."],
                ["zapatilla","Deporte","Por cada hora de entreno, suma uno o dos vasos."],
                ["termometro","Si estás malo","Con fiebre, vómitos o diarrea se pierde mucha agua."]] },
        { h:"La pista más fácil", img:"A1-c",
          p:"El color de la orina te dice cómo vas sin tener que contar nada.",
          tips:[["gota","Amarillo claro","Vas bien."],
                ["gotallena","Amarillo oscuro","Toca beber más."]] }
      ],
      reto:"Mañana, bebe un vaso de agua nada más levantarte y apúntalo con «+ vaso»." },
    { d:"A2-portada", t:"Trucos para beber más sin pensarlo", s:"Que beber agua sea lo fácil.",
      i:"Casi nadie se olvida de beber por pereza, sino porque no tiene agua a mano. Cambia lo que te rodea y lo demás viene solo.",
      sec:[
        { h:"Que sea lo fácil", img:"A2-a",
          p:"Pon el agua donde vas a estar.",
          tips:[["botella","Llévala siempre","Una botella que te guste es la mejor inversión."],
                ["ojo","Déjala a la vista","Lo que ves, lo bebes. Si está en la mochila, se queda ahí."],
                ["plato","Un vaso con cada comida","Engánchalo a algo que ya haces tres veces al día."]] },
        { h:"Si el agua te aburre", img:"A2-b",
          p:"Dale sabor sin añadir azúcar.",
          tips:[["limon","Limón o naranja","Unas rodajas y listo."],
                ["hoja","Menta","Un par de hojas en la botella refrescan mucho."],
                ["fresa","Fruta","Fresas, frutos rojos o pepino, mejor si los dejas un rato en la nevera."]] }
      ],
      reto:"Rellena una botella y déjala hoy a la vista en tu mesa. Cada vaso que bebas, toca «+ vaso»." },
    { d:"A3-portada", t:"Agua y deporte", s:"Antes, durante y después de entrenar.",
      i:"Cuando entrenas, sudas, y con el sudor se van agua y sales. Si no las repones, rindes menos y te cansas antes.",
      sec:[
        { h:"Antes, durante y después", img:"A3-a",
          p:"Reparte el agua a lo largo del entreno.",
          tips:[["reloj","Antes","Uno o dos vasos en las dos horas anteriores."],
                ["gota","Durante","Sorbos pequeños cada 15 o 20 minutos."],
                ["pesa","Después","Recupera lo que has sudado durante la hora siguiente."]] },
        { h:"Si hace calor o entrenas mucho", img:"A3-b",
          p:"Con más de una hora de ejercicio o mucho calor, el agua sola puede quedarse corta.",
          tips:[["sol","Elige la hora","Con calor, entrena a primera hora o al final de la tarde."],
                ["sal","Bebida con sales","Ayuda a reponer lo que pierdes al sudar. Para entrenos cortos no hace falta."]] }
      ],
      reto:"En tu próximo entreno, lleva una botella y da un sorbo cada vez que descanses." }
  ],
  screen:[
    { d:"P1-portada", t:"¿Por qué menos de 2 horas?", s:"El tiempo de ocio con pantallas, en su sitio.",
      i:"Las 2 horas al día son una referencia muy usada para el tiempo libre delante de una pantalla. No se trata de dejar el móvil, sino de que lo uses tú a él.",
      sec:[
        { h:"Qué cuenta y qué no", img:"P1-a",
          p:"Solo cuenta el ocio. Lo que haces para estudiar o trabajar, no.",
          tips:[["corazon","Redes sociales","Cuentan."],
                ["play","Vídeos y series","Cuentan."],
                ["mando","Videojuegos","Cuentan."],
                ["libro","Clase y deberes","No cuentan."]] },
        { h:"Lo que notas cuando te pasas", img:"P1-b",
          p:"Muchas horas de pantalla se relacionan con cosas que se notan en el día a día.",
          tips:[["luna","Duermes peor","Te acuestas más tarde y te cuesta más dormirte."],
                ["zapatilla","Te mueves menos","Las horas sentado se acumulan sin que te des cuenta."],
                ["nube","Más agobio","Compararte en redes puede hacerte sentir peor contigo."]] }
      ],
      reto:"Mira en los ajustes del móvil cuánto tiempo pasaste ayer en cada app." },
    { d:"P2-portada", t:"Cómo mirar menos el móvil", s:"Ideas que funcionan de verdad.",
      i:"Las apps están hechas para que no las sueltes. La fuerza de voluntad sirve de poco: es más fácil cambiar el móvil y el sitio donde lo dejas.",
      sec:[
        { h:"Cambia el móvil", img:"P2-a",
          p:"Haz que el móvil sea un poco menos atractivo.",
          tips:[["campanafuera","Quita notificaciones","Deja solo las de personas, no las de apps."],
                ["byn","Blanco y negro","Sin colores, las apps pierden mucha gracia. Se activa en los ajustes de accesibilidad."],
                ["candado","Pon límites","Ponle un tiempo máximo al día a la app que más usas."]] },
        { h:"Cambia el sitio", img:"P2-b",
          p:"Si el móvil no está a mano, no lo coges.",
          tips:[["puerta","Fuera del dormitorio","Que duerma en otra habitación."],
                ["enchufe","Cárgalo lejos","Elige un sitio fijo para cargarlo, lejos de la cama y de la mesa de estudio."],
                ["despertador","Despertador normal","Así el móvil no es lo primero que miras al despertarte."]] }
      ],
      reto:"Hoy, mientras estudias, deja el móvil boca abajo en otra habitación durante una hora." },
    { d:"P3-portada", t:"Pantallas y sueño", s:"Por qué el móvil en la cama te quita horas.",
      i:"El problema no es solo la luz de la pantalla. Lo que más pesa es lo que ves en ella.",
      sec:[
        { h:"Por qué te quita horas", img:"P3-a",
          p:"Cada vídeo dura poco y siempre hay otro esperando.",
          tips:[["play","Uno más","Los vídeos cortos están pensados para que no haya un final."],
                ["bucle","Sin final","Sin un final claro, es fácil seguir mucho más de lo que querías."],
                ["reloj","Hora de dormir","Una hora de móvil en la cama suele ser una hora menos de sueño."]] },
        { h:"Qué hacer", img:"P3-b",
          p:"Prepara la noche para que el móvil no esté.",
          tips:[["despertador","Despertador de los de antes","Para no necesitar el móvil al lado."],
                ["libro","Un libro en la mesilla","Para tener algo que hacer que no sea mirar la pantalla."],
                ["cargador","Cargador fuera","Deja el cargador del móvil en otra habitación."]] }
      ],
      reto:"Esta noche, deja el móvil cargando fuera del dormitorio." }
  ]
};

/* la miniatura de cada artículo en la hoja es su portada */
function sfDibujo(d){ return '<img src="salud/'+d+'.svg" alt="" loading="lazy" decoding="async">'; }
function sfIcono(n){ return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(SF_IC[n]||"")+'</svg>'; }

function sfArticulo(k, i){
  var a=SF_ARTS[k][i]; if(!a) return;
  openSheet(
    '<div class="sfh sfh-leer" style="--sf:var('+SF_COLOR[k]+')">'+
    '<div class="sfh-cab"><button class="sfh-volver" data-act="x-sf-volver" data-k="'+k+'"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>'+SF_HOJA[k].t+'</button>'+closeBtn()+'</div>'+
    '<div class="sfh-dib grande">'+sfDibujo(a.d)+'</div>'+
    '<h3>'+a.t+'</h3><p class="sfh-ent">'+a.s+'</p>'+
    '<p class="sfa-intro">'+a.i+'</p>'+
    a.sec.map(function(s){
      return '<section class="sfa-sec"><h4>'+s.h+'</h4><p>'+s.p+'</p>'+
        '<div class="sfh-dib sfa-img">'+sfDibujo(s.img)+'</div>'+
        '<ul class="sfa-tips">'+s.tips.map(function(t){
          return '<li><span class="sfa-ic">'+sfIcono(t[0])+'</span><div><b>'+t[1]+'</b><span>'+t[2]+'</span></div></li>';
        }).join("")+'</ul></section>';
    }).join("")+
    '<div class="sfa-reto"><span class="sfa-ic">'+sfIcono("diana")+'</span><div><b>Pruébalo hoy</b><span>'+a.reto+'</span></div></div>'+
    '</div>'
  );
  var sc=document.querySelector("#sheet .sheet-card"); if(sc) sc.scrollTop=0;
}

(function(){
  var st=document.createElement("style");
  st.textContent=[
'.sfh-dib{ aspect-ratio:400/220!important; }',
'.sfh-dib img{ display:block; width:100%; height:100%; object-fit:cover; }',
'.sfa-intro{ font-size:16.5px!important; line-height:1.5!important; font-weight:500; margin-bottom:6px!important; }',
'.sfa-sec{ margin-top:26px; }',
'.sfa-sec h4{ font-size:20px; font-weight:800; letter-spacing:-.02em; line-height:1.2; margin-bottom:6px; }',
'.sfa-img{ border-radius:18px; margin:6px 0 14px; }',
'.sfa-tips{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px; }',
'.sfa-tips li, .sfa-reto{ display:flex; align-items:flex-start; gap:12px; }',
'.sfa-tips b, .sfa-reto b{ display:block; font-size:15px; font-weight:700; line-height:1.3; }',
'.sfa-tips li span:not(.sfa-ic), .sfa-reto span:not(.sfa-ic){ display:block; font-size:14.5px; line-height:1.45; color:var(--t2); margin-top:2px; }',
'.sfa-ic{ flex:none; width:38px; height:38px; border-radius:12px; display:grid; place-items:center; color:var(--sf);',
'  background:color-mix(in srgb, var(--sf) 12%, transparent); }',
'.sfa-ic svg{ width:22px; height:22px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }',
'.sfa-ic svg .f{ fill:currentColor; fill-opacity:.22; stroke:none; }',
'.sfa-ic svg .s{ fill:currentColor; stroke:none; }',
'.sfa-reto{ margin:28px 0 6px; padding:16px; border-radius:20px; background:color-mix(in srgb, var(--sf) 10%, transparent);',
'  box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--sf) 35%, transparent); }',
'.sfa-reto .sfa-ic{ background:var(--sf); color:#fff; }',
'.sfa-reto b{ color:var(--sf); }'
  ].join("\n"); document.head.appendChild(st);
})();
