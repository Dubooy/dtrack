# Conectar Peak con Notion: lo que hay que activar (una sola vez)

Notion no deja que una web hable con su API directamente desde el navegador, y
para dar permiso hace falta un secreto que no puede ir dentro de la app. Por eso
hay una pequeña función en Supabase (`servidor/notion/index.ts`) que hace de
puente. Son cuatro pasos, unos 15 minutos.

## 1. Crear la integración en Notion

1. Entra en https://www.notion.so/profile/integrations y pulsa **New integration**.
2. Tipo: **Public** (pública, para que cualquier persona de Peak pueda conectar la suya).
3. Nombre: `Peak.` · Logo: `logo/final/icono.png`.
4. Rellena lo que pide Notion:
   - **Redirect URI**: `https://zznytqlurhxhdwludrxm.supabase.co/functions/v1/notion`
   - **Privacy policy**: `https://dubooy.github.io/dtrack/beta/privacidad.html`
   - **Terms of use**: la misma dirección vale de momento.
   - Web de la empresa y correo: los tuyos.
5. En **Capabilities** deja marcado: *Read content*, *Update content* e *Insert content*.
   No hace falta leer correos de usuarios.
6. Guarda y copia el **OAuth client ID** y el **OAuth client secret**.

## 2. La tabla en Supabase

Supabase → **SQL Editor** → New query → pega todo `servidor/notion.sql` → **Run**.
Tiene que salir «Success. No rows returned».

## 3. Los secretos

Supabase → **Edge Functions** → **Secrets** → añade:

| Nombre | Valor |
|---|---|
| `NOTION_CLIENT_ID` | el client ID del paso 1 |
| `NOTION_CLIENT_SECRET` | el client secret del paso 1 |

(Opcional: `PEAK_APP_URL` si la app pasa a otra dirección; por defecto vuelve a
`https://dubooy.github.io/dtrack/beta/`.)

## 4. La función

Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**:

1. Nombre: `notion` (exactamente así).
2. Pega todo `servidor/notion/index.ts` y pulsa **Deploy**.
3. En los ajustes de la función, **apaga «Verify JWT»** (Enforce JWT verification).
   Notion vuelve a esta función sin sesión de Peak; las llamadas de la app se
   comprueban dentro con su propio testigo.

Con la CLI de Supabase es lo mismo:
`supabase functions deploy notion --no-verify-jwt` (copiando el archivo a
`supabase/functions/notion/index.ts`).

## Cómo se usa

Ajustes → **Notion** → *Conectar con Notion*. Notion pregunta qué páginas
compartir con Peak: marca una (o crea antes una página vacía «Peak»). De vuelta
en la app, eliges esa página y Peak crea dentro:

- **Peak · Hábitos**: una fila por día con los hábitos hechos y pendientes, el
  porcentaje, el agua, el sueño y la pantalla.
- **Peak · Libros**: cada libro de Lectura con autor, estado, tema, páginas y
  fechas (cuando la parte de libros esté en la app).

La primera vez manda el último mes. Después, con «Exportar solo cada día»
activado, se pone al día una vez al día al abrir la app. Lo que ya está se
actualiza, no se duplica. Desconectar borra el permiso del servidor; lo que ya
está en Notion se queda allí.
