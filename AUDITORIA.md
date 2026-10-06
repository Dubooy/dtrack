# Auditoría de Peak. (beta pública) — octubre 2026

Revisión completa de `beta/` (la app publicada, que también carga la app de iPhone) hecha como
CTO / Product Lead: código, datos, sincronización, seguridad, rendimiento móvil y recorrido de
usuario. Todo lo de abajo se ha comprobado **arrancando la app** en un Chromium con tamaño de
iPhone 13 (CPU 4× más lenta para simular un móvil medio), con un usuario nuevo, uno con
120–365 días de historia y uno con sesión y grupo (sin red), además de leer el código.

## Cómo se ha probado

- Análisis estático de las 50 piezas de `beta/src/js/` montadas como en `index.html`
  (redeclaraciones, referencias sin definir, código inalcanzable).
- Recorrido completo: bienvenida → preguntas iniciales → tutorial → Hoy, Objetivos, Cuerpo,
  Mente, Social. Prueba de humo pulsando 88 botones distintos: **ningún error de JavaScript**.
- Inyección de HTML/JS en nombres, descripciones, reto y actividad del grupo: **nada se ejecuta**,
  todo sale escapado.
- Perfiles de CPU de la carga y de los cambios de pestaña; memoria, nodos y listeners tras 60
  cambios de pestaña (**estables, sin fugas**); 8 sesiones del modo guiado 3D (los contextos WebGL
  se liberan).
- Simulación de «la app se queda abierta y vuelves al día siguiente» con reloj falso.

## Diagnóstico

### P0 — crítico

| # | Problema | Efecto real | Estado |
|---|---|---|---|
| 1 | **Al volver a la app otro día, la pantalla sigue en el día anterior.** Si Peak se queda en memoria (lo normal en iPhone, web instalada y app nativa), al abrirla por la mañana Hoy dice «Buenas noches · martes 6» y cada botón lleva la fecha de ayer (`data-day`). | Marcar un hábito, un reto, el ejercicio o el agua **lo apunta en el día anterior**: hoy queda vacío y la racha se rompe sin que el usuario lo vea. | Arreglado |
| 2 | **Sincronización entre dispositivos: «Hay dos versiones… la otra se pierde».** En cuanto la nube tiene una versión más nueva, se obliga a elegir una versión entera, aunque este dispositivo no haya cambiado nada. La web y la app de iPhone tienen almacenes separados, así que basta con usar las dos. | Quien elige «Quedarme con esta» **borra para siempre** lo que apuntó en el otro dispositivo. | Arreglado |
| 3 | **No existe «Borrar mi cuenta»**, pero la política de privacidad y Ajustes dicen que al borrarla se eliminan los datos del servidor. «Borrar todos los datos» solo vacía el estado local (y luego la nube). Perfil, fecha de nacimiento, grupos, mensajes y fotos se quedan. | Incumple lo que se promete (RGPD, derecho de supresión). | **Necesita decisión** (ver abajo) |

### P1 — importante

| # | Problema | Efecto | Estado |
|---|---|---|---|
| 4 | **Escrituras automáticas masivas.** Pintar «Tu año», las estadísticas o el resumen pasa por cientos de días vacíos; cada uno guardaba sus «tres retos» (`chPick`) y su modo adaptativo (`chInfo`), **con un guardado completo del estado por día** (≈270 la primera vez, incluso días anteriores a empezar). Además se reescribía el `chInfo` de días pasados. | Primer pintado lento, estado inflado y cambios «fantasma» que provocan conflictos de sincronización entre dispositivos. | Arreglado |
| 5 | **El 3D se carga aunque no se vea.** Al entrar en Cuerpo se descargan `tres.js` + `cuerpo.glb` (1,2 MB) y se renderizan 6 miniaturas de 1080×1080 con codificación PNG en el hilo principal, aunque «Estirar» esté al final de la página. | ~2,8 s de hilo principal ocupado en la primera visita de cada sesión (en este entorno) y 1,2 MB de datos móviles para quien solo quería marcar «He hecho ejercicio». | Arreglado (miniaturas al acercarse a la vista) |
| 6 | **Cambio de pestaña lento: 170–650 ms con CPU de móvil medio.** `go()` quita y pone la clase `.view` (de la que cuelgan ~30 reglas de estilo) y fuerza un reflow antes de pintar; `moveMarker()` fuerza otro para la barra lateral, que en el móvil ni se ve. | Toques que se sienten pesados en la acción más repetida de la app. | Arreglado |
| 7 | **Resumen del mes «de prueba» a todos.** `DTRACK_BETA=1` está activo en la app publicada y abre una vez, a pantalla completa, el resumen del **mes en curso**: un usuario nuevo lo ve nada más terminar el tutorial («1 día activo de 6»). | Interrumpe la primera sesión, la más importante para D1. | Arreglado (queda el resumen de verdad: mes anterior, primeros 7 días) |
| 8 | **Puente con la app de iPhone**: cada 400 ms hace `elementFromPoint` + `getComputedStyle` (fuerza layout), también con la app en segundo plano. | Batería y tirones en animaciones. | Arreglado (no corre con la app oculta) |
| 9 | **Textos que no casan**: el tutorial habla de «Vital» y el anillo dice «Cuerpo». | Confusión en el primer minuto. | Arreglado (es/en/fr/it) |
| 10 | **Hoy no responde del todo a «¿qué tengo que hacer hoy?»**: los tres retos del día solo se marcan en Objetivos y, a quien dijo «No estudio», Hoy le sigue enseñando la tarjeta «Estudiar». | Fricción y ruido en la pantalla principal. | **Decisión de producto** (propuesta abajo) |

### P2 — futuro (no justifica tocarlo ahora)

- **Arquitectura por capas**: 133 funciones se reasignan (`f = envoltorio(f)`) y ~35 se declaran
  dos o tres veces (gana la última por *hoisting*; las anteriores son código muerto, p. ej.
  `pintaMetas` ×3, `compartirSemana` ×2 en la misma pieza). Funciona, pero entender qué hace una
  función obliga a leer varias piezas. Recomendación: ir borrando las declaraciones muertas y, al
  tocar una zona, consolidar sus capas. **No** hace falta una migración grande.
- **Carga inicial**: `index.html` pesa 1,9 MB (235 KB de traducciones que el 95 % no usa, 20 KB de
  fotos de prueba en base64). Cargar idiomas y módulos poco usados (lector EPUB, chat, montaña 3D)
  bajo demanda recortaría el arranque.
- **Miniaturas 3D**: guardarlas entre sesiones (Cache Storage) y encuadrar la cámara en la zona del
  cuerpo de cada estiramiento (en los de cuello el gesto se ve pequeño).
- **Seguridad menor**: la política de `g_chat` deja a cualquier miembro reescribir por REST el JSON
  de reacciones de cualquier mensaje (saltándose `gc_reaccion`); el endpoint de avisos push se
  guarda en el estado que se sincroniza (un dispositivo pisa el del otro); los mensajes de error
  del servidor se enseñan en crudo (`DTRACK_BETA`).
- **Comprobar en Supabase** que `datos`, `perfiles`, `g_grupos` y `g_miembros` tienen RLS
  (`id = auth.uid()` en `datos`): su SQL no está en el repo y `datos` guarda el diario y el ánimo.
- **Actualización sola**: al volver a la app con versión nueva se recarga sin avisar; si había
  texto a medio escribir en una hoja, se pierde.

## Producto

### Usuario nuevo (primeros minutos)
- **Lo que funciona**: carrusel claro («Cuida el cuerpo…»), entrar con correo o Google, cuatro
  preguntas que **sí** personalizan hábitos y retos, tutorial corto de tres anillos. La primera
  acción (marcar un hábito) es un toque.
- **Dónde se pierde**: (1) el resumen del mes que salía justo después del tutorial (arreglado);
  (2) «Te quedan 3 retos» sin poder marcarlos ahí; (3) quien pulsa «Saltar» en las preguntas se
  queda con hábitos de estudiante («Repaso rápido y mochila lista»); (4) Mente enseña tareas
  «Académica/Personal» y balance aunque no estudie.
- **XP y niveles**: se entienden por el anillo de nivel y las celebraciones «+4 XP», pero hay más
  de 15 fuentes de XP y el usuario no sabe cuál pesa más. El detalle de cada anillo ya lo explica
  bien; falta lo mismo para el nivel.

### Retención (bucle ACCIÓN → PROGRESO → RECOMPENSA → MOTIVACIÓN → VOLVER)
- **D1**: el bucle diario existe (anillos, Parte del día por la noche, racha). El fallo nº 1
  (día equivocado al volver) lo rompía justo en la vuelta del día siguiente.
- **D7**: racha + comodines, reto de la semana, resumen semanal, racha y reto del grupo. Bien
  cubierto; el mayor riesgo era perder datos al cambiar de dispositivo (nº 2).
- **D30**: niveles (40, ~1 año a ritmo alto), «Tu evolución» a los 28 días, resumen del mes,
  montaña. Bien pensado.
- **Coherencia**: la base es buena (todo suma XP → nivel → rango → montaña), pero conviven
  retos diarios, reto de la semana, objetivos del mes, metas, reto del grupo, experimentos y
  logros. Recomendación: no añadir más sistemas y, cuando se toque, presentar todo como
  «lo de hoy» (Hoy) y «lo de esta semana/mes» (Objetivos).

### Secciones
- **Hoy**: jerarquía buena (saludo con lo que falta → anillos → estudio/Parte → hábitos →
  nivel → evolución). Propuesta (P1, decisión): poner los tres retos marcables en Hoy (lo mismo
  que «Los tres de hoy») y, sin estudios, cambiar «Estudiar» por «Meditar».
- **Objetivos**: «Los tres de hoy» con explicación de por qué salen, metas del mes y descansos.
  La relación objetivo → acciones existe (las preguntas iniciales eligen retos por objetivo:
  «Elegidos para: Dormir mejor · …»). Falta enseñar en cada meta qué acciones la mueven.
- **Cuerpo**: ejercicio a un toque, alimentación, salud del día (agua/sueño/pantalla con
  artículos) y rutinas de estirar. El 3D **sí ayuda** en el modo guiado (postura animada, cuenta
  atrás, ficha «?» con músculos), pero en estiramientos de cuello/hombros la figura entera hace el
  gesto pequeño (P2: encuadre por zona).
- **Mente**: meditación con sonidos y lectura (biblioteca de 77 libros + lector). Identidad
  clara. Las tareas «Académica/Personal» encajan peor para quien no estudia.
- **Social**: grupos cerrados de 2–12, racha del grupo (80 % hace el Parte), reto común con
  +150 XP, chat en tiempo real, reacciones, fotos del gym, moderación (denunciar/bloquear).
  Genera razones reales para volver (no fallar al grupo); no hace falta ningún feed nuevo.

### Monetización futura (Free + Pro)
Es viable sin rehacer: ya hay cuenta, perfil en servidor y un sistema de desbloqueos por nivel
(`12-nivel-y-desbloqueos.js`) que sirve de modelo para «desbloqueado por Pro». Lo que falta:
un campo `plan` en `perfiles` decidido en el servidor (lo local se puede editar), y que lo que se
cobre de verdad (grupos grandes, sincronización avanzada, estadísticas largas) se limite también
en el servidor (RLS/funciones), no solo en la pantalla.

## Qué se ha cambiado (y cómo se ha comprobado)

Todo en piezas de `beta/src/` (montado con `node herramientas/montar-beta.js`), `beta/textos.js`
y `CACHE` de `beta/sw.js` → `v248`. Ninguna función de la app se ha quitado.

| # | Cambio | Pieza | Comprobación |
|---|---|---|---|
| 1 | Al volver a la app (o al pasar la medianoche con ella delante) se repinta el día nuevo; con el Parte del día abierto espera a que se cierre. | `06-navegacion-y-eventos.js` | Reloj falso: 23:50 → oculta → 08:30. Antes: «Buenas noches · martes 6», botones con fecha de ayer. Ahora: «Buenos días · miércoles 7», botones de hoy. También a medianoche con la app abierta y con el Parte abierto. |
| 2 | **Fusión a tres bandas** al sincronizar: se guarda la «base» (la última versión común con la nube, en IndexedDB) y, si la nube va por delante, se juntan los cambios de los dos lados; las listas de marcas del mismo día se unen; los retos del día, su «por qué» y el saldo de comodines (que se recalculan solos) no cuentan como choque. Solo se pregunta «Hay dos versiones» si lo mismo cambió de verdad en los dos sitios. | `21-grupo-servidor.js` | 12 casos unitarios + prueba de punta a punta con un Supabase simulado y dos dispositivos. **Antes**: al reabrir A salía el diálogo sin motivo y una marca se perdía (nube final `i1, i3`). **Ahora**: sin diálogo y nada se pierde (`i1, i2, i3` en A, B y la nube). Si los dos cambian la lista de tareas, se sigue preguntando. |
| 4 | Los «tres retos» y su «por qué» solo se guardan para hoy o para días con algún reto marcado; los demás se calculan y se recuerdan en memoria hasta el siguiente guardado. `dayXP` y `tripleDone` ya no los piden si ese día no se marcó ninguno. | `03-estado-y-datos.js`, `19-objetivos-bucle.js` | Cambios automáticos al abrir: de ~550 a 6. XP, nivel, logros y racha **idénticos** a la versión anterior con 60, 120 y 365 días de historia. |
| 5 | Las miniaturas 3D se hacen cuando «Estirar» está a menos de 600 px de verse (IntersectionObserver; sin él, como antes). | `33-persona-3d.js` | Entrar en Cuerpo: antes descargaba `tres.js` + `cuerpo.glb` y hacía 6 fotos; ahora nada. Al bajar a Estirar: las 6 salen igual que antes. |
| 6 | `go()` solo reinicia la animación de entrada si la vista ya estaba visible (al mostrarla, la animación empieza sola); `moveMarker()` no mide la barra lateral cuando no se ve (< 1024 px). | `06-navegacion-y-eventos.js` | Animación `vIn` sigue saliendo en cada cambio; el marcador de escritorio sigue en su sitio. Cambio de pestaña con CPU 4× y 120 días: Objetivos 645→259 ms (1ª vez) y 243→164 ms; Cuerpo 379→244 / 387→211 ms; Hoy 261→172 ms. |
| 7 | Fuera la vista previa del resumen del mes «de la beta». Queda el resumen de verdad (mes anterior, los 7 primeros días, si lo usaste). | `24-pegatinas-fotos-gym.js` | Usuario nuevo: antes salía a pantalla completa justo tras el tutorial; ahora no. |
| 8 | El puente con la app de iPhone no mide nada con la app oculta. | `38-app-iphone.js` | — |
| 9 | «Vital» → «Cuerpo» en el tutorial, el objetivo del grupo, las fotos del gym y los experimentos (es/en/fr/it). | `01-idiomas.js`, `02-textos.js`, `textos.js`, `10`, `19`, `24`, `28` | Tutorial comprobado en los cuatro idiomas. |

**Segunda pasada (regresiones):** prueba de humo de 88 botones en las cinco secciones sin errores
de consola; inyección en el grupo sin ejecutar nada; memoria, nodos y listeners estables tras 60
cambios de pestaña; análisis estático con los mismos avisos que antes (ninguno nuevo); tema oscuro
y escritorio correctos; `node herramientas/montar-beta.js --comprobar` al día.

## Pendiente: borrar la cuenta (P0, necesita decisión y servidor)

No se ha implementado porque toca tablas que no están en el repo (`perfiles`, `datos`,
`g_grupos`, `g_miembros`, fotos) y hay que decidir qué pasa con lo compartido. Propuesta:

1. **Decidir**: los mensajes del chat y las fotos publicadas en grupos, ¿se borran o quedan como
   «alguien»? (Lo más limpio para el RGPD: borrarlos.)
2. **Servidor**: una función `security definer` `borrar_mi_cuenta()` que, para `auth.uid()`,
   borre `datos`, `perfiles`, `g_miembros` (y el grupo si se queda vacío), `g_activo`,
   `g_socios`, `g_chat`, `g_foto_descr`, `g_foto_reac`, `g_bloqueos`, `g_denuncias` y
   `notion_conexiones`, y al final `delete from auth.users where id = auth.uid()`.
   Las fotos de Storage se borran antes desde la app con la API de Storage (no a mano en
   `storage.objects`).
3. **App**: en Ajustes › Tus datos, «Borrar mi cuenta» con doble confirmación; llama a la
   función, borra lo local y cierra la sesión. Si la función no existe, que lo diga (como ya
   hacen el chat o las fotos con «falta activar … en el servidor»).

## Siguientes pasos recomendados

1. Borrado de cuenta (arriba).
2. Revisar en Supabase las políticas RLS de `datos`, `perfiles`, `g_grupos` y `g_miembros` y
   guardar su SQL en `servidor/` como el resto.
3. Hoy: los tres retos marcables en Hoy y «Meditar» en lugar de «Estudiar» para quien no estudia.
4. Avisos push activados por defecto en la primera semana (el bucle D1 depende de que Peak te
   recuerde volver) y sacar el endpoint del estado que se sincroniza.
5. Limpieza sin riesgo: borrar las ~35 declaraciones de función muertas (ver P2).
