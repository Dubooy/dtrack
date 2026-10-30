# ECHO//VOID — diseño implementado

Qué existe ya y por qué. La visión completa está en `prompt-maestro.md`; la referencia visual, en
`referencia.webp`. Todos los números citados viven en `src/config.ts`.

## La regla, tal como funciona

- **OBSERVAR = EXISTIR.** Las estructuras observables (claras, limpias, con una línea de barrido)
  ganan presencia mientras caen dentro del cono de la mirada: 26° de radio y hasta 80 m. Fuera de
  él aguantan 0,45 s y se deshacen en 0,55 s. Sostienen al jugador con presencia ≥ 0,5 y dejan de
  hacerlo por debajo de 0,18. Nunca se solidifican con el jugador dentro.
  - La viñeta oscurece los bordes de la imagen: es la forma visual del cono.
  - El suelo que pisas avisa con un chasquido cuando empieza a olvidarse.
- **RECORDAR = CONSERVAR.** E sobre una estructura observable que estés viendo la convierte en eco
  (magenta, tiembla a saltos) durante 5 s. Caben 2; el tercero borra el más antiguo. Parpadea el
  último 1,5 s con un tic sonoro. E sobre un eco lo renueva. La retícula muestra unas esquinas y
  una «E» cuando hay algo que recordar.
- **OLVIDAR = DESAPARECER.** Al caducar, el eco vuelve a depender de la mirada.
- **Piedra.** Lo oscuro, con juntas de sillería, existe siempre: suelo seguro y puntos de control.
- **Estática.** Dentro de una zona de estática nadie observa: solo sostienen los ecos, y no se
  pueden crear ecos desde dentro.
- **Caer** al vacío te devuelve al último punto de control; los ecos se pierden.

## Zona 01 — Umbral

Ocho tramos encadenados. Su geometría se genera con la semilla (medidas, giros, decorado), pero
la secuencia está diseñada.

| # | Tramo | Qué enseña | Eco |
|---|---|---|---|
| 1 | Despertar | Apareces mirando al arco. El camino está a tu izquierda y solo aparece al buscarlo. | — |
| 2 | Puente | Existe mientras lo miras; si apartas la vista, caes. | — |
| 3 | Escalones | Piedras pequeñas: al mirar la siguiente, la tuya se olvida. Saltar a tiempo o mirar con intención. | Atajo |
| 4 | Sendero | Losas sueltas: se construye delante y se borra detrás. Si te paras sin mirar, caes. | — |
| 5 | Escalera | Escalera observable junto a una torre. Camino oculto hacia abajo, al lado contrario: registro secreto. | — |
| 6 | Estática | El puente cruza una zona sin observación: hay que recordarlo antes de entrar. | **Sí** |
| 7 | Dos ecos | Una piedra y un puente que gira, dentro de la estática: dos ecos, en el orden en que se pisan. | **Dos** |
| 8 | Atrio | Tres pilares a 120°: el portal solo se reconstruye si existen a la vez. Nunca caben dos en la mirada. | **Dos** |

`npm run probar` lo demuestra: el bot completa el nivel con varias semillas, y hay pruebas de que
sin eco la estática se traga el puente y de que el portal no se abre mirando los pilares de uno en uno.

## Narrativa

Terminales breves al acercarse, sin diálogos. El arco del principio es el mismo dibujo que el
portal del final. El registro 07 («he cruzado este puente 312 veces; nunca es el mismo puente»)
une la semilla procedural con la historia: cada partida es otra reconstrucción. El final pregunta:
¿estás descubriendo este lugar o reconstruyéndolo?

## Imagen

Escena a ~144 filas con escala entera. El postproceso reduce todo a seis grises y una rampa de
magenta con ruido ordenado (Bayer 8×8). El magenta solo sale si el píxel ya venía magenta (ecos,
portal, pilares reconstruidos, destellos raros de la estática). Luz principal dura con sombras
pixeladas, niebla oscura, contornos por profundidad y arquitectura procedural: islas con panza
escalonada, torres (a veces repetidas en fila), arcos, columnatas, escaleras a ninguna parte,
salas abiertas al vacío, puentes rotos y molas en el horizonte.

## Siguientes zonas (ideas, sin hacer)

- **Zona 02 — Anomalías.** Estructuras invertidas, en magenta: existen solo cuando *no* las miras.
  Se cruzan mirando a otra parte.
- **Barrido del olvido.** Una onda periódica borra todo lo que no sea eco; sobrevivir es recordar
  el suelo a tiempo.
- **Ecos con memoria de posición.** Estructuras que se mueven y el eco las fija donde estaban.
- **Revelación.** Repeticiones, el arco, los registros: el jugador no descubre el mundo, lo reconstruye.
- Soporte de mando y ajustes de accesibilidad (sin dithering animado, contraste alto).
