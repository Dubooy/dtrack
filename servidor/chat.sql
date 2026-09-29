-- ════════════════════════════════════════════════════════════════
-- DTrack · chat de los grupos
--
-- Cómo se instala (una sola vez):
--   Supabase → tu proyecto → SQL Editor → New query → pega TODO este
--   archivo → Run. Tiene que salir «Success. No rows returned».
--   Se puede volver a ejecutar sin miedo: no borra mensajes.
--
-- Qué añade:
--   · g_chat: los mensajes de cada grupo, con sus reacciones.
--   · gc_leer, gc_enviar, gc_reaccion, gc_borrar, gc_resumen: lo que usa
--     la app para leer, escribir, reaccionar, borrar lo tuyo y saber
--     cuántos mensajes nuevos hay en cada grupo.
--   · Tiempo real: la tabla se apunta a «supabase_realtime», así la app
--     se entera al momento cuando alguien escribe.
--
-- Quién ve qué: solo los miembros de un grupo ven y escriben en su chat.
-- Para saber en qué grupos estás se usa la función que ya existe,
-- g_mis_grupos(), así que no depende de cómo estén guardados los grupos.
-- Todo corre con los permisos de quien pregunta (security invoker).
-- ════════════════════════════════════════════════════════════════

create table if not exists public.g_chat (
  id       bigint generated always as identity primary key,
  grupo    text        not null,
  uid      uuid        not null default auth.uid(),
  texto    text        not null check (char_length(texto) between 1 and 1000),
  reac     jsonb       not null default '{}'::jsonb,   -- {"🔥": ["uid", …]}
  creado   timestamptz not null default now(),
  cambiado timestamptz not null default now()
);
create index if not exists g_chat_grupo_id on public.g_chat (grupo, id desc);

-- los grupos en los que estás, sacados de g_mis_grupos() sea cual sea su forma
-- (una lista json, filas json o una tabla con columna id)
create or replace function public.gc_mis_ids()
returns setof text
language plpgsql stable security invoker
set search_path = public
as $$
declare j jsonb;
begin
  if auth.uid() is null then return; end if;
  select jsonb_agg(to_jsonb(x)) into j from public.g_mis_grupos() x;
  if j is null then return; end if;
  if jsonb_typeof(j->0) = 'array' then j := j->0; end if;
  return query
    select e->>'id' from jsonb_array_elements(j) e
    where jsonb_typeof(e) = 'object' and e ? 'id';
end $$;

-- permisos: nadie toca la tabla sin cuenta; con cuenta, solo lo justo
alter table public.g_chat enable row level security;
revoke all on public.g_chat from anon, authenticated;
grant select on public.g_chat to authenticated;
grant insert (grupo, texto) on public.g_chat to authenticated;
grant update (reac, cambiado) on public.g_chat to authenticated;
grant delete on public.g_chat to authenticated;

drop policy if exists g_chat_ver on public.g_chat;
create policy g_chat_ver on public.g_chat for select to authenticated
  using (grupo in (select public.gc_mis_ids()));

drop policy if exists g_chat_escribir on public.g_chat;
create policy g_chat_escribir on public.g_chat for insert to authenticated
  with check (uid = auth.uid() and grupo in (select public.gc_mis_ids()));

drop policy if exists g_chat_reaccionar on public.g_chat;
create policy g_chat_reaccionar on public.g_chat for update to authenticated
  using (grupo in (select public.gc_mis_ids()))
  with check (grupo in (select public.gc_mis_ids()));

drop policy if exists g_chat_borrar on public.g_chat;
create policy g_chat_borrar on public.g_chat for delete to authenticated
  using (uid = auth.uid());

-- ── leer: los últimos mensajes, o los anteriores a uno ──
create or replace function public.gc_leer(p_grupo text, p_antes bigint default null, p_n int default 60)
returns json
language sql stable security invoker
set search_path = public
as $$
  select coalesce(json_agg(m order by m.id), '[]'::json) from (
    select id, uid, texto, reac, creado
    from public.g_chat
    where grupo = p_grupo and (p_antes is null or id < p_antes)
    order by id desc
    limit least(greatest(coalesce(p_n, 60), 1), 100)
  ) m;
$$;

-- ── escribir ──
create or replace function public.gc_enviar(p_grupo text, p_texto text)
returns json
language plpgsql volatile security invoker
set search_path = public
as $$
declare t text := btrim(coalesce(p_texto, '')); r public.g_chat;
begin
  if auth.uid() is null then raise exception 'sin_sesion'; end if;
  if t = '' then raise exception 'vacio'; end if;
  if char_length(t) > 1000 then t := left(t, 1000); end if;
  if p_grupo not in (select public.gc_mis_ids()) then raise exception 'no_eres_miembro'; end if;
  if (select count(*) from public.g_chat
        where uid = auth.uid() and creado > now() - interval '1 minute') >= 20 then
    raise exception 'muy_rapido';
  end if;
  insert into public.g_chat (grupo, texto) values (p_grupo, t) returning * into r;
  return json_build_object('id', r.id, 'uid', r.uid, 'texto', r.texto, 'reac', r.reac, 'creado', r.creado);
end $$;

-- ── reaccionar: pone o quita tu emoji (uno de cada, como en Actividad) ──
create or replace function public.gc_reaccion(p_id bigint, p_emoji text)
returns json
language plpgsql volatile security invoker
set search_path = public
as $$
declare yo text := auth.uid()::text; e text := left(coalesce(p_emoji, ''), 8); r jsonb;
begin
  if yo is null then raise exception 'sin_sesion'; end if;
  if e = '' then raise exception 'vacio'; end if;
  update public.g_chat c set
    reac = case
      when coalesce(c.reac->e, '[]'::jsonb) ? yo then
        case when jsonb_array_length((c.reac->e) - yo) = 0 then c.reac - e
             else jsonb_set(c.reac, array[e], (c.reac->e) - yo) end
      when not (c.reac ? e) and (select count(*) from jsonb_object_keys(c.reac)) >= 12 then c.reac
      else jsonb_set(c.reac, array[e], coalesce(c.reac->e, '[]'::jsonb) || to_jsonb(yo))
    end,
    cambiado = now()
  where c.id = p_id
  returning c.reac into r;
  if r is null then raise exception 'no_eres_miembro'; end if;
  return r;
end $$;

-- ── borrar un mensaje tuyo ──
create or replace function public.gc_borrar(p_id bigint)
returns boolean
language plpgsql volatile security invoker
set search_path = public
as $$
begin
  delete from public.g_chat where id = p_id and uid = auth.uid();
  return found;
end $$;

-- ── cuántos mensajes nuevos hay en cada uno de tus grupos ──
-- p_vistos: {"id del grupo": último mensaje que ya viste}
create or replace function public.gc_resumen(p_vistos jsonb default '{}'::jsonb)
returns json
language sql stable security invoker
set search_path = public
as $$
  select coalesce(json_agg(r), '[]'::json) from (
    select g.id as grupo,
      (select max(c.id) from public.g_chat c where c.grupo = g.id) as ultimo,
      (select count(*) from (
         select 1 from public.g_chat c
         where c.grupo = g.id
           and c.id > coalesce(case when jsonb_typeof(p_vistos->g.id) = 'number' then (p_vistos->>g.id)::bigint end, 0)
           and c.uid <> auth.uid()
         limit 99) s) as sin_leer
    from public.gc_mis_ids() as g(id)
  ) r;
$$;

grant execute on function public.gc_mis_ids(), public.gc_leer(text, bigint, int), public.gc_enviar(text, text),
  public.gc_reaccion(bigint, text), public.gc_borrar(bigint), public.gc_resumen(jsonb) to authenticated;
revoke execute on function public.gc_mis_ids(), public.gc_leer(text, bigint, int), public.gc_enviar(text, text),
  public.gc_reaccion(bigint, text), public.gc_borrar(bigint), public.gc_resumen(jsonb) from anon, public;

-- ── tiempo real ──
do $$
begin
  alter publication supabase_realtime add table public.g_chat;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- que la app vea las funciones nuevas sin esperar
notify pgrst, 'reload schema';
