-- ════════════════════════════════════════════════════════════════
-- Peak · conexión con Notion
--
-- Cómo se instala (una sola vez):
--   Supabase → SQL Editor → New query → pega TODO este archivo → Run.
--   Tiene que salir «Success. No rows returned». Se puede repetir sin miedo.
--
-- Qué guarda: una fila por persona que ha conectado su Notion, con el
-- permiso que da Notion y las dos tablas que Peak crea allí.
-- Nadie puede leerla desde la app (RLS sin reglas): solo la función
-- «notion» del servidor, con la clave de servicio. Así el permiso de
-- Notion nunca llega al móvil.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.notion_conexiones (
  uid           uuid primary key references auth.users(id) on delete cascade,
  token         text not null,
  refresco      text,
  espacio       text,
  espacio_icono text,
  pagina        text,          -- la página de Notion donde viven las tablas de Peak
  pagina_titulo text,
  db_habitos    text,
  db_libros     text,
  exportado     timestamptz,
  creado        timestamptz not null default now()
);

alter table public.notion_conexiones enable row level security;
revoke all on public.notion_conexiones from anon, authenticated;
