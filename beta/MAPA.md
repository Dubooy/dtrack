# Mapa de la app (beta/)

`index.html` se **genera**: no se edita. Se cambian las piezas de `src/` y se ejecuta
`node herramientas/montar-beta.js` (con `--comprobar` solo mira que esté al día; GitHub
también lo comprueba en cada push). El resultado es el mismo archivo de siempre, así que el
service worker, la app de iPhone y el resto no notan nada.

Cada pieza de `src/js/` es un trozo de la misma función grande (ver la plantilla), en orden:
lo de abajo puede usar lo de arriba y al revés, como antes. Las piezas se fueron añadiendo
por capas, así que una zona de la app puede tener retoques en varias piezas: busca con grep.

## Armazón
| Pieza | Qué hay |
|---|---|
| `src/index.plantilla.html` | La cabecera (meta, tema, fuentes) y el orden de todas las piezas |
| `src/css/tailwind.css` | Tailwind compilado (una sola línea, no se toca) |
| `src/css/estilos.css` | Estilos base de la app |
| `src/html/arranque.html` | Pantalla de carga (logo girando) |
| `src/html/pantallas.html` | El HTML de todas las pestañas y hojas |
| `src/js/zz-se-actualiza-sola.js` | Registro del service worker y recarga sola al haber versión nueva |

## Lógica (src/js/, en orden)
| Pieza | Qué hay |
|---|---|
| `00-errores.js` | Aviso en pantalla si algo falla |
| `01-idiomas.js` | Traducciones (es, en, fr, it) |
| `02-textos.js` | TEXTOS de la app (`textos.js` de fuera manda si existe) |
| `03-estado-y-datos.js` | Estado guardado (`nura-v4`), consultas, retos del día, logo |
| `04-pintar.js` | Pintado: parte del día, gráficas, vaso/luna/reloj, compartir, año, calendario |
| `05-hojas-avisos-tutorial.js` | Hojas (sheets), avisos diarios, tutorial |
| `06-navegacion-y-eventos.js` | Barra de abajo (base, arrastrar la pastilla) y eventos de toque |
| `07-cuenta-y-bienvenida.js` | Carrusel y animación de bienvenida, entrar con Google |
| `08-modo-prueba.js` | Modo prueba (`enVisor`, usuarios de mentira) |
| `09-fotos-prueba.js` | Fotos de los usuarios de prueba en base64 (una línea de 20 KB: no leer) |
| `10-grupo.js` | Social: el grupo, reto en común, estilos de la pestaña |
| `11-estudio-y-perfil.js` | Comodines de racha, temporizador de estudio, perfil |
| `12-nivel-y-desbloqueos.js` | Desbloqueos por nivel, anillo y camino de XP, gimnasio, info del grupo, salud del día |
| `13-novedades-semana.js` | Reto de la semana, resumen semanal, sonidos, racha del grupo |
| `14-hoy.js` | El Resumen/Hoy, parte del día a pantalla completa |
| `15-limpieza-pulido-retoque.js` | Historial, comidas, metas del mes, avisos, reacciones, selector de tema |
| `16-evolucion-y-transiciones.js` | Tarjetas de Resumen, retos de la semana, Tu evolución, transiciones |
| `17-rumbo.js` | Gran revisión: Vital, Retos, Social, Ajustes, preguntas iniciales, diario, instalar |
| `18-diseno-temas.js` | Temas (Arena, Porcelana, Clásico, Esencial), privacidad, hábitos flexibles, tu año |
| `19-objetivos-bucle.js` | Objetivos, tendencias, retos adaptativos, experimentos, metas del mes |
| `20-google-calendar.js` | Google Calendar en Hoy |
| `21-grupo-servidor.js` | Social con Supabase: bajar/subir grupo, llamadas, sincronizar (con fusión a tres bandas: `fusiona3`, base en IndexedDB) |
| `22-cuenta-entrar.js` | Cuenta: correo y código, Google, conflictos de versión, foto de perfil |
| `23-meditacion.js` | Meditación: sonido, voz y sesión a pantalla completa |
| `24-pegatinas-fotos-gym.js` | Pegatinas para compartir, fotos del gym, resumen del mes |
| `25-claridad-solidez.js` | Retoques de septiembre (agua, objetivos del mes, XP justo) y el easter egg «DUBOY» |
| `26-chat.js` | Chat del grupo en tiempo real |
| `27-meditacion-ojos-sonidos.js` | Meditación con ojos cerrados, sonidos de fondo |
| `28-fotos-perfil.js` | Barra de hábitos, recorte y galería de fotos de perfil, foto en grande |
| `29-libros-habitos.js` | Lectura: biblioteca, encuesta, fichas de libros |
| `30-lector.js` | Lector de EPUB a pantalla completa (`lcArchivo`) |
| `31-moderacion-secciones.js` | Denunciar/bloquear y las secciones Hoy · Objetivos · Cuerpo · Mente · Social |
| `32-estiramientos-catalogo.js` | Libros por tema y lista de estiramientos (posturas) |
| `33-persona-3d.js` | Persona 3D de los estiramientos (`maniquiCarga`, usa `tres.js` y `cuerpo.glb`) |
| `34-estiramientos-guia.js` | Modo guiado y ficha «?» con músculos |
| `35-notion.js` | Conexión con Notion |
| `36-barra.js` | Barra de abajo «Liquid Glass» (burbuja e iconos) |
| `37-fotos-grandes-grupo.js` | Fotos de perfil en grande, foto del grupo |
| `38-app-iphone.js` | Dentro de la app de iPhone (Capacitor, canal `peakBarra`) |
| `39-estirar-y-leer.js` | Estirar en Cuerpo y leer en Mente, a un toque |
| `40-estilo-orden.js` | Estilo ordenado: crema, tinta y un acento, una sola tarjeta (solo temas Claro y Oscuro) |
| `41-rutinas-estirar.js` | Rutinas de estirar al final de Cuerpo: miniaturas, la rutina en orden y editable, y crear la tuya |
| `42-salud-filas.js` | Salud del día: filas de agua, sueño y pantalla con color, frase, barra, «+» y animación de los iconos (el marcado está en html/pantallas.html) |
| `43-alimentacion.js` | Alimentación en Cuerpo (debajo de Ejercicio): «He comido bien» (+10 XP), objetivo (definir, mantener, volumen) e ideas de desayuno, almuerzo y cena con macros |
| `44-salud-articulos.js` | Artículos largos de Salud del día (sueño, agua, pantalla): portada, secciones con imagen, consejos con icono y «Pruébalo hoy». Imágenes en `beta/salud/*.jpg` |
| `45-mapa-musculos.js` | Mapa 2D de músculos de la ficha «?» (`mapaMusculos`; formas MIT de react-native-body-highlighter) |
| `46-experimentos-ajustes.js` | Experimentos fuera de Objetivos: se activan en Ajustes › Avanzado › «Activar experimento» |
| `47-montana.js` | «Ver tu montaña» en Progreso: los 40 niveles como una montaña de luz a pantalla completa, con los rangos en los picos, Peak. en la cima y la gente de tus grupos |
| `48-foto-todos-grupos.js` | Foto del gym: elegir si se publica en el grupo abierto o en todos tus grupos |
| `49-montana-3d.js` | «Ver tu montaña» en 3D: selector 2D/3D, un pico de cuatro caras (como el Cervino) con el camino de luz en espiral hasta la cima, la gente de tus grupos en su nivel; se gira con el dedo. Brillo en caras, camino y tu sitio; sombras de verdad (rayos sobre un mapa de alturas, `sombras()`); sol y luz según la hora; las pastillas y etiquetas se esquivan (`OCU`); tocar a un amigo acerca la cámara y abre su ficha; banderines de rango en el círculo de cada rango y de su color (al tocarlos, qué desbloquea); cielo según la hora; niebla y nubes sin racha; huellas de la semana (+XP de los últimos 7 días) |
| `50-progreso-montana.js` | Progreso con la estética de la montaña: cabecera de noche con estrellas, montaña 3D pequeña, insignia de rango con barra de luz, llama de racha, «Tu camino» como sendero, amigos por delante/detrás y XP de hoy |
| `51-objetivos-peak.js` | Objetivos con aire Peak.: «Los tres de hoy» como tres cumbres del logo, títulos en Unbounded con rayita, reto de la semana como sendero de puntos, metas del mes como tramos con %, selector con pastilla de tinta, tarjetas sin sombra |
| `52-hoy-salud.js` | Hoy con la estética de Salud del día: Retos, Hábitos, Cuerpo, Estudiar y Parte del día como tarjetas (icono y título en su color, número grande, barritas de la semana); títulos con color en Hábitos, Lectura y Tu evolución. Sobrescribe `hoyAnillo`, `anilloDetalle`, `tarjetaEstudio` y `tarjetaParte` |
| `53-temas-degradado.js` | Modos con degradado (Atardecer, Océano, Uva; claros y «noche»): degradado diagonal de dos colores en el primer 25 % de la pantalla que pasa a blanco o negro. Libres desde el inicio. Sobrescribe `applyTheme` y `muestraTema` |
| `54-ui-pulido.js` | Pulido de UI: una sola letra (Unbounded en el título de cada pestaña y números grandes; SF, `--f-texto`, en lo demás), cabecera pequeña con degradado al bajar y título grande que se encoge, cada pestaña recuerda su scroll (envuelve `go`), tarjetas con fundido, botones que se hunden, números que suben y hojas que se cierran arrastrando |
| `55-diseno-base.js` | Diseño nuevo, la base: Instrument Sans (texto) y Unbounded (títulos y números), colores crema/tinta de Claro y Oscuro. Maquetas en `diseno/ui-peak/`. |
| `56-diseno-hoy.js` | Diseño nuevo de Hoy (`hoyNuevo`, la llama `pintaHoy`): DÍA N., Retos·Hábitos·Cuerpo, listas numeradas, Parte/Estudiar, Tu semana. Tu foto arriba con menú Tu perfil/Ajustes/Modo (`hoyNuevoAccion`, desde `rumboAccion`). |
| `57-diseno-objetivos.js` | Diseño nuevo de Objetivos (sin tarjetas, «Más» con Mis retos y Experimentos) y Progreso (rango, montaña de noche con Abrir 3D, hoy/racha/mejor, tu grupo). |
| `58-diseno-cuerpo.js` | Diseño nuevo de Cuerpo: orden Salud del día, Ejercicio, Estirar, Alimentación; tarjeta «Entreno de hoy» con Gym/Correr/Deporte/Otro. |

## Fuera de src/ (archivos que la app carga tal cual)
`textos.js`, `peak-anim.js` (animación del logo), `tres.js` (three.js), `cuerpo.glb` (modelo 3D),
`vendor/` (jszip, epub.js), `salud/` (imágenes de los artículos de salud, JPG a 1200×660 sacados de los SVG de /mnt/project-files/salud-articulos/svg), `libros/` (EPUB y catálogo), `sw.js`, `manifest.webmanifest`, `privacidad.html`.
