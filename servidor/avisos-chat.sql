-- ════════════════════════════════════════════════════════════════
-- Peak · avisos del chat
--
-- RETIRADO (19/10/2026): el chat pasó a ser un panel sin mensajes, así que la
-- función «aviso-chat» se quitó (bórrala también en Supabase con su webhook).
-- La tabla g_push se queda por si vuelven los avisos del grupo; borrar_mi_cuenta()
-- (panel-y-cuenta.sql) borra tus filas.
--
-- Guarda la suscripción de avisos de cada móvil para poder avisar cuando
-- alguien escribe en el chat de tu grupo. La usa la función «aviso-chat»
-- (servidor/aviso-chat/index.ts), que salta con cada mensaje nuevo.
--
-- Cómo se instala (una sola vez): Supabase → SQL Editor → New query →
-- pega TODO este archivo → Run. Se puede volver a ejecutar sin miedo.
-- ════════════════════════════════════════════════════════════════
create table if not exists public.g_push (
  endpoint text        primary key,
  uid      uuid        not null default auth.uid(),
  sub      jsonb       not null,
  creado   timestamptz not null default now()
);
alter table public.g_push enable row level security;
revoke all on public.g_push from anon, authenticated;
grant select, insert, update, delete on public.g_push to authenticated;
drop policy if exists g_push_mio on public.g_push;
create policy g_push_mio on public.g_push for all to authenticated
  using (uid = auth.uid()) with check (uid = auth.uid());
