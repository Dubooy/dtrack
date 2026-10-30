# ECHO//VOID — PROMPT MAESTRO DE DESARROLLO

> Documento de visión escrito por el autor del juego. Es la referencia para cualquier decisión.
> La imagen de referencia de dirección artística es `referencia.webp` (en esta misma carpeta).

## 1. TU PAPEL

Actúa como un equipo completo de desarrollo de videojuegos formado por:

* Director creativo y director artístico.
* Diseñador de videojuegos especializado en experiencias experimentales.
* Programador senior de Three.js y TypeScript.
* Especialista en shaders GLSL y renderizado procedural.
* Diseñador de niveles y mecánicas.
* Diseñador de sonido e interfaces.

Tu misión es diseñar y desarrollar ECHO//VOID, un videojuego 3D en primera persona, procedural, con una identidad artística muy marcada y una mecánica central basada en la observación y la memoria.

No quiero únicamente una idea, una explicación, un documento de diseño o una escena estática.
Quiero que construyas un videojuego real, jugable y progresivamente ampliable.
Debes tomar decisiones creativas propias cuando sea necesario, pero respetando estrictamente la identidad descrita en este documento.

## 2. IDENTIDAD DEL JUEGO

Nombre: ECHO//VOID

Lema:
«Lo que no miras no existe. Lo que recuerdas puede salvarte».

Género:
Aventura conceptual en primera persona, exploración, plataformas y habilidad.

Perspectiva: Primera persona.

Experiencia deseada:
Una aventura misteriosa, hipnótica, inquietante y sorprendente.
El jugador debe sentir que está explorando un universo artificial cuyas reglas no comprende completamente.
No quiero un juego de terror convencional, ni un shooter, ni un clon de Minecraft, ni un juego de plataformas genérico.
Quiero una experiencia con identidad propia.

### La premisa

El universo de ECHO//VOID no existe de manera permanente.
Su realidad depende de la observación.
Las estructuras aparecen cuando el jugador las mira y desaparecen cuando deja de observarlas.
Sin embargo, existe una manera de conservar temporalmente aquello que se ha visto: los ecos.
El jugador puede recordar una estructura y mantenerla presente durante unos segundos, incluso cuando ya no la está mirando.
La memoria se convierte en una herramienta física.

Regla fundamental del universo:

OBSERVAR = EXISTIR.
RECORDAR = CONSERVAR.
OLVIDAR = DESAPARECER.

Toda la experiencia debe construirse alrededor de esta regla.

## 3. DIRECCIÓN ARTÍSTICA

Esta es una de las partes más importantes del proyecto.
La identidad visual debe ser reconocible incluso en una captura pequeña.
Utiliza la imagen de referencia adjunta como guía principal de dirección artística.
No la copies literalmente: interpreta su lenguaje visual.

### Geometría

Combina dos lenguajes visuales:

1. Low-poly pixelado:
   * Polígonos grandes.
   * Bloques geométricos.
   * Superficies angulosas.
   * Arquitectura monumental.
   * Siluetas claramente reconocibles.
2. Dithering experimental:
   * Patrones de puntos.
   * Ruido ordenado.
   * Transiciones de iluminación pixeladas.
   * Texturas de apariencia digital.
   * Sensación de imagen reconstruida por una computadora antigua.

La combinación debe parecer intencionada y sofisticada.
No quiero que parezca simplemente un juego con gráficos malos o texturas de baja calidad.

### Paleta cromática

La paleta debe ser extremadamente limitada.

* Negro profundo: #08090D.
* Blanco grisáceo: #D8D8D5.
* Gris oscuro: tonos intermedios.
* Magenta de anomalías: #D52AFF.

El magenta debe ser un color extraordinariamente escaso.

Regla artística innegociable:
El magenta solo aparece en:

* Ecos creados por el jugador.
* Anomalías.
* Elementos que rompen las reglas normales del universo.
* Portales y fenómenos especiales.

Nunca utilices magenta como decoración ambiental general.
El mundo ordinario debe permanecer monocromático.

### Renderizado

Implementa:

* Resolución interna baja, inicialmente 192×144 o una proporción equivalente.
* Escalado de imagen con pixelación visible.
* Dithering mediante shader.
* Iluminación limitada y expresiva.
* Sombras estilizadas.
* Materiales geométricos.
* Niebla oscura.
* Distorsiones sutiles en anomalías.
* Efectos de desaparición y reconstrucción.

Evita filtros excesivos que dificulten la lectura del escenario.
El jugador debe distinguir claramente dónde puede caminar, saltar y aterrizar.

## 4. DISEÑO DEL UNIVERSO

El escenario debe parecer una arquitectura imposible suspendida sobre un vacío.
Utiliza elementos como:

* Torres flotantes.
* Puentes interrumpidos.
* Escaleras que no conducen a ningún lugar.
* Habitaciones abiertas al vacío.
* Plataformas suspendidas.
* Arcos monumentales.
* Pasillos imposibles.
* Estructuras repetidas.
* Bloques arquitectónicos gigantes.
* Portales geométricos.

La arquitectura debe ser reconocible, pero imposible.
No generes simplemente un conjunto aleatorio de cubos.
Cada nivel debe tener composición, ritmo visual y una intención espacial.
Utiliza generación procedural con reglas geométricas, semillas reproducibles y módulos combinables.
Los niveles deben parecer diseñados por alguien, aunque su geometría se genere mediante algoritmos.

## 5. MECÁNICA PRINCIPAL: LOS ECOS

Esta mecánica es el corazón del juego.
El universo debe reaccionar a la mirada del jugador.

### Estados de la geometría

Cada elemento relevante puede encontrarse en tres estados:

ESTADO 1 — OBSERVADO

* Color blanco o gris.
* Visible.
* Sólido.
* Forma parte del mundo actual.

ESTADO 2 — RECORDADO

* Color magenta.
* Se conserva temporalmente aunque el jugador deje de mirarlo.
* Permite utilizar estructuras que normalmente desaparecerían.
* Puede tener una ligera animación de distorsión.

ESTADO 3 — OLVIDADO

* La geometría desaparece.
* El espacio vuelve a ser vacío.
* El jugador ya no puede utilizar esa estructura.

### Acción de crear un eco

El jugador mira una estructura y pulsa E.
La estructura queda recordada.
Debe transformarse visualmente en magenta y permanecer durante un tiempo limitado.

Valores iniciales ajustables:

* Duración: 5 segundos.
* Máximo de ecos simultáneos: 2.
* Crear un tercer eco elimina el más antiguo.
* Los ecos muestran una señal visual antes de desaparecer.
* La duración debe poder modificarse fácilmente desde una configuración central.

Estos valores son parámetros iniciales para probar y equilibrar, no reglas intocables.

### Reglas importantes

* No se puede recordar cualquier objeto del escenario indiscriminadamente.
* Solo las estructuras compatibles con la mecánica pueden convertirse en ecos.
* El jugador debe poder comprender qué está recordando.
* El sistema debe ser consistente y predecible.
* Los ecos deben tener utilidad real para superar obstáculos.

No quiero una mecánica que solo sea un efecto visual.
Debe ser necesaria para progresar.

## 6. GAMEPLAY

La experiencia debe combinar:

* Exploración en primera persona.
* Saltos y plataformas.
* Precisión.
* Resolución de situaciones espaciales.
* Observación del entorno.
* Uso inteligente de ecos.

El movimiento debe ser fluido y satisfactorio.

### Controles iniciales

* WASD: movimiento.
* Ratón: mirar.
* Espacio: saltar.
* E: crear un eco.
* Escape: pausa.

La cámara debe tener una sensación de control precisa.
Evita movimientos bruscos, aceleraciones extrañas y una cámara que provoque incomodidad.

### Obstáculos

Diseña situaciones que utilicen las reglas del universo:

* Plataformas que desaparecen al dejar de mirarlas.
* Puentes que deben conservarse mediante ecos.
* Escaleras que solo existen cuando se observan.
* Estructuras que deben recordarse en un orden determinado.
* Plataformas que desaparecen mientras el jugador está en el aire.
* Caminos que requieren utilizar dos ecos simultáneamente.
* Anomalías que alteran la geometría.
* Caminos ocultos que solo pueden descubrirse observando el escenario.

La dificultad debe crecer progresivamente.
El jugador debe aprender las reglas jugando, no leyendo explicaciones interminables.

## 7. DISEÑO DE LA AVENTURA

Quiero una aventura conceptual, no una colección infinita de niveles arcade.
Debe tener una progresión con intención y una sensación de descubrimiento.
Organiza la experiencia en zonas o capítulos que puedan desarrollarse progresivamente.
Cada zona debe introducir una nueva forma de interpretar la mecánica de observación y memoria.

Ideas de progresión:

1. Aprender que el mundo depende de la mirada.
2. Descubrir que los ecos permiten conservar estructuras.
3. Aprender a combinar varios ecos.
4. Encontrar anomalías que alteran las reglas.
5. Descubrir que el universo puede no ser lo que parece.

No desarrolles toda la aventura de golpe.
Primero crea un prototipo vertical completo y sólido.
Después diseña una estructura que permita ampliar el juego sin rehacer sus sistemas principales.

## 8. NARRATIVA

La historia debe contarse principalmente mediante el entorno.
Evita diálogos constantes y explicaciones excesivas.
Utiliza:

* Mensajes breves.
* Terminales.
* Señales geométricas.
* Arquitectura extraña.
* Cambios de comportamiento del mundo.
* Anomalías visuales.
* Elementos que parecen repetirse de manera intencionada.

El jugador debe hacerse preguntas.
¿Por qué existe este universo?
¿Quién construyó estas estructuras?
¿Por qué la memoria puede alterar la realidad?
¿El jugador está descubriendo el mundo o reconstruyéndolo?
La narrativa debe mantener el misterio.
No reveles todo inmediatamente.

## 9. SONIDO

El sonido debe ser minimalista y ambiental.
Utiliza sonido procedural siempre que resulte adecuado.
Ideas:

* Viento lejano.
* Resonancias metálicas.
* Pulsos digitales.
* Ecos espaciales.
* Sonidos breves al materializarse una estructura.
* Sonidos distintos cuando un eco está a punto de desaparecer.
* Silencio cuando el jugador se encuentra en zonas vacías.

No quiero música épica ni una banda sonora constante.
El sonido debe reforzar la soledad, la escala y la extrañeza del universo.

## 10. INTERFAZ

La interfaz debe ser mínima.
No utilices menús convencionales recargados.
Elementos posibles:

* Indicador de ecos disponibles.
* Retícula pequeña.
* Indicador discreto de interacción.
* Mensajes breves.
* Información de nivel.

Utiliza tipografía monoespaciada o inspirada en terminales.
La interfaz debe integrarse con el mundo.
No debe competir visualmente con el escenario.

## 11. TECNOLOGÍA

Utiliza preferentemente:

* Three.js.
* TypeScript.
* Vite.
* GLSL para shaders personalizados.

Organiza el proyecto de manera modular.
Separa claramente:

* Sistema de movimiento.
* Cámara.
* Generador procedural.
* Sistema de observación.
* Sistema de ecos.
* Física y colisiones.
* Diseño de niveles.
* Shaders.
* Interfaz.
* Audio.

No concentres todo el código en un único archivo.
Utiliza parámetros centralizados para ajustar físicas, duración de ecos, distancias y calidad visual.
La generación procedural debe ser reproducible mediante semillas.
Prioriza rendimiento y estabilidad.

## 12. PRIMER OBJETIVO: PROTOTIPO JUGABLE

Antes de crear una aventura completa, desarrolla una demostración vertical que incluya:

1. Una escena 3D en primera persona.
2. Un entorno arquitectónico procedural.
3. Un vacío negro alrededor del escenario.
4. Movimiento WASD.
5. Salto funcional.
6. Colisiones fiables.
7. Estructuras que aparecen al observarlas.
8. Estructuras que desaparecen al dejar de observarlas.
9. Creación de ecos mediante E.
10. Dos ecos simultáneos como máximo.
11. Plataformas que obliguen a utilizar la mecánica.
12. Un objetivo o portal al final.
13. Shaders de pixelación y dithering.
14. Paleta monocromática con magenta reservado a anomalías y ecos.
15. Sonido ambiental básico.
16. Una interfaz mínima.

Debe existir un pequeño nivel completo que permita experimentar la mecánica y llegar a una salida.
No aceptes una escena bonita pero imposible de jugar.

## 13. CALIDAD Y CRITERIOS DE DISEÑO

Quiero que el resultado tenga personalidad.

Evita:

* Apariencia de plantilla genérica.
* Estética Minecraft.
* Exceso de elementos decorativos.
* Magenta por todas partes.
* Texturas aleatorias sin intención.
* Generación procedural sin composición.
* Mecánicas que no afectan al recorrido.
* Interfaces recargadas.
* Efectos visuales que impiden jugar.
* Código improvisado y difícil de ampliar.

Prioriza:

1. Identidad visual.
2. Mecánica central divertida.
3. Control satisfactorio.
4. Diseño espacial inteligente.
5. Atmósfera.
6. Rendimiento.
7. Arquitectura técnica ampliable.

## 14. METODOLOGÍA DE TRABAJO

Trabaja por etapas.

ETAPA 1 — Fundación

* Configura el proyecto.
* Crea la escena.
* Implementa la cámara.
* Implementa el movimiento y las colisiones.
* Comprueba que todo funciona.

ETAPA 2 — Identidad visual

* Crea geometría procedural.
* Implementa la paleta.
* Implementa pixelación.
* Implementa dithering.
* Ajusta la iluminación.

ETAPA 3 — Mecánica

* Implementa la observación.
* Implementa los tres estados de geometría.
* Implementa los ecos.
* Comprueba que las estructuras reaccionan correctamente.

ETAPA 4 — Nivel

* Construye un nivel pequeño.
* Introduce obstáculos.
* Diseña una ruta que utilice la mecánica.
* Añade un objetivo final.

ETAPA 5 — Pulido

* Sonido.
* Interfaz.
* Efectos.
* Ajustes de movimiento.
* Rendimiento.
* Corrección de errores.

Al terminar cada etapa:

* Comprueba que el proyecto ejecuta.
* Detecta y corrige errores.
* No rompas funcionalidades anteriores.
* Indica qué se ha implementado.
* Explica cómo probarlo.

No simules que una característica funciona si todavía no está implementada.
Si una decisión técnica presenta problemas, busca una alternativa que mantenga la intención original.

## 15. INSTRUCCIÓN FINAL

Quiero que desarrolles ECHO//VOID como si fuera un videojuego experimental independiente con una dirección artística profesional.
No quiero una demo genérica de Three.js.
Quiero un universo reconocible, una mecánica que defina toda la experiencia y una atmósfera que el jugador recuerde.

La idea fundamental debe permanecer presente en cada decisión:

EL MUNDO EXISTE PORQUE LO OBSERVAS.
EL ECO EXISTE PORQUE LO RECUERDAS.
EL VACÍO ES TODO LO QUE HAS OLVIDADO.

Empieza por construir el prototipo jugable, no por escribir una explicación interminable del proyecto.
Si tienes acceso a un entorno de archivos, crea los archivos reales del proyecto, ejecuta las comprobaciones y entrega una versión que pueda probarse.
