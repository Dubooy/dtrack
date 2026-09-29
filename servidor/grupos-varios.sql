-- ════════════════════════════════════════════════════════════════
-- DTrack · varios grupos a la vez
--
-- Cómo se instala (una sola vez, después de social.sql):
--   Supabase → SQL Editor → New query → pega TODO este archivo → Run.
--   Tiene que salir «Success. No rows returned». Se puede repetir sin miedo.
--
-- Qué cambia:
--   · g_activo: el grupo que tienes abierto (uno por persona).
--   · g_mi_grupo() devuelve ese grupo (o, si no hay, el primero al que
--     te uniste). Como todas las funciones g_* preguntan a g_mi_grupo(),
--     el reto, la racha, la actividad y lo demás pasan a ser del grupo
--     que tienes abierto, sin tocarlas.
--   · g_crear y g_unirse: ya no piden estar sin grupo; como mucho 8, y
--     el grupo nuevo queda abierto.
--   · g_salir: sales solo del grupo abierto; se abre otro de los tuyos.
--   · g_mis_grupos() y g_activar(): la lista y el cambio de grupo que
--     usa la app.
--   Tus datos (ficha, días, fotos) son los mismos en todos tus grupos.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.g_activo (
  uid    uuid primary key,
  grupo  uuid not null references public.g_grupos(id) on delete cascade,
  cambio timestamptz not null default now()
);
alter table public.g_activo enable row level security;
revoke all on public.g_activo from anon, authenticated;

-- el grupo abierto; si no hay (o ya no estás en él), el primero al que te uniste
create or replace function public.g_mi_grupo()
returns uuid
language sql stable security definer
set search_path to 'public'
as $$
  select m.grupo from public.g_miembros m
  left join public.g_activo a on a.uid = m.uid and a.grupo = m.grupo
  where m.uid = auth.uid()
  order by (a.grupo is not null) desc, m.unido asc nulls last, m.grupo
  limit 1
$$;

create or replace function public.g_crear(p_nombre text)
returns json
language plpgsql security definer
set search_path to 'public'
as $$
declare yo uuid := auth.uid(); g uuid; cod text;
begin
  if yo is null then raise exception 'sin_sesion'; end if;
  if (select count(*) from public.g_miembros where uid = yo) >= 8 then raise exception 'demasiados_grupos'; end if;
  cod := public.g_codigo_nuevo();
  insert into public.g_grupos(nombre, codigo)
    values (left(coalesce(nullif(trim(p_nombre), ''), 'Mi grupo'), 28), cod) returning id into g;
  insert into public.g_miembros(grupo, uid) values (g, yo);
  insert into public.g_activo(uid, grupo) values (yo, g)
    on conflict (uid) do update set grupo = excluded.grupo, cambio = now();
  return json_build_object('id', g, 'codigo', cod);
end $$;

create or replace function public.g_unirse(p_codigo text)
returns json
language plpgsql security definer
set search_path to 'public'
as $$
declare yo uuid := auth.uid(); g uuid; n int;
begin
  if yo is null then raise exception 'sin_sesion'; end if;
  select id into g from public.g_grupos where codigo = upper(trim(p_codigo));
  if g is null then raise exception 'codigo_mal'; end if;
  if exists(select 1 from public.g_miembros where uid = yo and grupo = g) then raise exception 'ya_en_grupo'; end if;
  if (select count(*) from public.g_miembros where uid = yo) >= 8 then raise exception 'demasiados_grupos'; end if;
  select count(*) into n from public.g_miembros where grupo = g;
  if n >= 12 then raise exception 'lleno'; end if;
  -- la ficha que ya tienes en otro grupo viene contigo
  insert into public.g_miembros(grupo, uid, ficha)
    values (g, yo, (select ficha from public.g_miembros where uid = yo and ficha is not null order by unido desc limit 1));
  insert into public.g_activo(uid, grupo) values (yo, g)
    on conflict (uid) do update set grupo = excluded.grupo, cambio = now();
  return json_build_object('id', g);
end $$;

create or replace function public.g_salir()
returns json
language plpgsql security definer
set search_path to 'public'
as $$
declare yo uuid := auth.uid(); g uuid := public.g_mi_grupo();
begin
  if yo is null then raise exception 'sin_sesion'; end if;
  if g is null then return json_build_object('ok', true); end if;
  delete from public.g_miembros where uid = yo and grupo = g;
  delete from public.g_activo where uid = yo;
  if not exists(select 1 from public.g_miembros where grupo = g) then
    delete from public.g_grupos where id = g;
  end if;
  return json_build_object('ok', true);
end $$;

-- tus grupos, en el orden en que entraste, marcando el abierto
create or replace function public.g_mis_grupos()
returns json
language sql stable security definer
set search_path to 'public'
as $$
  select coalesce(json_agg(json_build_object(
           'id', g.id, 'nombre', g.nombre, 'codigo', g.codigo,
           'miembros', (select count(*) from public.g_miembros x where x.grupo = g.id),
           'activo', g.id = public.g_mi_grupo()
         ) order by m.unido nulls last, g.id), '[]'::json)
  from public.g_miembros m join public.g_grupos g on g.id = m.grupo
  where m.uid = auth.uid()
$$;

-- abrir otro de tus grupos
create or replace function public.g_activar(p_grupo uuid)
returns json
language plpgsql security definer
set search_path to 'public'
as $$
declare yo uuid := auth.uid();
begin
  if yo is null then raise exception 'sin_sesion'; end if;
  if not exists(select 1 from public.g_miembros where uid = yo and grupo = p_grupo) then raise exception 'no_eres_miembro'; end if;
  insert into public.g_activo(uid, grupo) values (yo, p_grupo)
    on conflict (uid) do update set grupo = excluded.grupo, cambio = now();
  return json_build_object('ok', true);
end $$;

revoke execute on function public.g_mis_grupos(), public.g_activar(uuid) from anon, public;
grant execute on function public.g_mis_grupos(), public.g_activar(uuid) to authenticated;

notify pgrst, 'reload schema';
