# Diseño nuevo de Peak. (9/10/2026)

Maquetas en HTML: se abren en el navegador y no tocan la app. Hay versión clara y oscura de cada pantalla.
Mente y Social se quedan como están.

| Archivo | Qué es |
|---|---|
| `base-claro.html`, `base-oscuro.html` | La base común: colores, letras, espacios y piezas |
| `lista-tareas.html` | La lista de retos y hábitos |
| `hoy-*.html` | Hoy, y el menú que sale al tocar tu foto (perfil, ajustes y modo) |
| `objetivos-*.html`, `progreso-*.html` | Objetivos, con sus dos pestañas |
| `cuerpo-*.html` | Cuerpo: Salud del día arriba, Ejercicio, Estirar y Alimentación |

## Reglas
- **Colores:** crema `#F1ECE1`, superficie `#FBF8F1` y tinta `#141414`. En oscuro, `#0A0A0A`, `#161513` y `#F3EEE3`. Un solo acento, `#0E8A6E`. El verde `#3BE08B` solo para datos que suben. Salud del día conserva sus colores (agua azul, sueño morado, pantalla naranja), pero solo en el icono, el título y la barra de hoy.
- **Letras:** Unbounded en el título de cada pestaña, el dato grande, los números y los títulos de sección. Instrument Sans en el resto: 500 para el texto normal y 600 para destacar.
- **Espacios:** siempre múltiplos de 4. Margen lateral de 20 y 32 entre bloques.
- **Datos y listas:** van separados con líneas finas, sin tarjetas. La tarjeta es solo para lo que se toca y abre otra cosa.
- **Lista de tareas:** numerada (01, 02…), sin horas, con barra de segmentos arriba. Las hechas van tachadas al final.
- **Botones:** píldoras de tinta, y la barra de abajo flotante.
- **Arriba a la derecha:** tu foto. Al tocarla salen Tu perfil, Ajustes y Modo; el rango ya no va ahí.
