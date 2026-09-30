-- ════════════════════════════════════════════════════════════════
-- Peak · Social: chat de los grupos y fotos con likes, reacciones,
-- descripción y comentarios.
--
-- Cómo se instala (una sola vez):
--   Supabase → tu proyecto → SQL Editor → New query → pega TODO este
--   archivo → Run. Tiene que salir «Success. No rows returned».
--   Se puede volver a ejecutar sin miedo: no borra nada.
--
-- Qué añade:
--   · g_chat: los mensajes de cada grupo (texto y/o foto), con sus
--     reacciones. Los comentarios de una foto también son filas de
--     g_chat: llevan «padre» (una foto del chat) o «evento» (una foto
--     de la actividad automática, como las del gym).
--   · g_socios: quién está en qué grupo, apuntado por cada uno al abrir
--     Social. Sirve para saber quién puede ver las fotos de tu perfil.
--   · g_foto_descr y g_foto_reac: la descripción de cada foto de tu
--     perfil (la escribes tú) y sus likes (❤️) y reacciones.
--   · Funciones gc_* (chat) y gf_* (fotos) que usa la app.
--   · Tiempo real: g_chat se apunta a «supabase_realtime».
--
-- Quién ve qué: solo los miembros de un grupo ven y escriben en su
-- chat; las fotos de tu perfil (descripción, likes) solo las ven quienes
-- comparten algún grupo contigo. Para saber en qué grupos estás se usa
-- la función que ya existe, g_mis_grupos(). Todo corre con los permisos
-- de quien pregunta (security invoker).
-- ════════════════════════════════════════════════════════════════

-- ── los grupos en los que estás ──
-- Con g_mis_grupos() (varios grupos), todos los de esa lista, sea cual sea su forma.
-- Si no existe (servidor de un solo grupo), el grupo que devuelve g_estado().
create or replace function public.gc_mis_ids()
returns setof text
language plpgsql stable security invoker
set search_path = public
as $$
declare j jsonb; e jsonb;
begin
  if auth.uid() is null then return; end if;
  begin
    execute 'select jsonb_agg(to_jsonb(x)) from public.g_mis_grupos() x' into j;
    if j is not null and jsonb_typeof(j->0) = 'array' then j := j->0; end if;
  exception when undefined_function then
    j := null;
    begin
      execute 'select to_jsonb(x) from public.g_estado(''2999-01-01'') x' into e;
      if e is not null and jsonb_typeof(e) = 'array' then e := e->0; end if;
      if e is not null and jsonb_typeof(e) = 'object' and jsonb_typeof(e->'grupo') = 'object' and (e->'grupo') ? 'id' then
        j := jsonb_build_array(jsonb_build_object('id', e->'grupo'->>'id'));
      end if;
    exception when others then j := null;
    end;
  end;
  if j is null then return; end if;
  return query
    select x->>'id' from jsonb_array_elements(j) x
    where jsonb_typeof(x) = 'object' and x ? 'id';
end $$;

-- ════════════════ CHAT ════════════════
create table if not exists public.g_chat (
  id       bigint generated always as identity primary key,
  grupo    text        not null,
  uid      uuid        not null default auth.uid(),
  texto    text        not null default '',
  reac     jsonb       not null default '{}'::jsonb,   -- {"🔥": ["uid", …]}
  creado   timestamptz not null default now(),
  cambiado timestamptz not null default now()
);
alter table public.g_chat add column if not exists foto   text;
alter table public.g_chat add column if not exists padre  bigint references public.g_chat(id) on delete cascade;
alter table public.g_chat add column if not exists evento bigint;
alter table public.g_chat alter column texto set default '';
alter table public.g_chat drop constraint if exists g_chat_texto_check;
alter table public.g_chat drop constraint if exists g_chat_contenido;
alter table public.g_chat add constraint g_chat_contenido check (
  char_length(texto) <= 1000 and (char_length(texto) >= 1 or foto is not null)
  and (foto is null or char_length(foto) <= 500));
create index if not exists g_chat_grupo_id on public.g_chat (grupo, id desc);
create index if not exists g_chat_padre on public.g_chat (padre) where padre is not null;
create index if not exists g_chat_evento on public.g_chat (grupo, evento) where evento is not null;

alter table public.g_chat enable row level security;
revoke all on public.g_chat from anon, authenticated;
grant select on public.g_chat to authenticated;
grant insert (grupo, texto, foto, padre, evento) on public.g_chat to authenticated;
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

-- ── leer: los últimos mensajes (o los anteriores a uno), sus comentarios
--    y los comentarios de las fotos de la actividad ──
create or replace function public.gc_leer(p_grupo text, p_antes bigint default null, p_n int default 60)
returns json
language sql stable security invoker
set search_path = public
as $$
  with m as (
    select id from public.g_chat
    where grupo = p_grupo and padre is null and evento is null and (p_antes is null or id < p_antes)
    order by id desc
    limit least(greatest(coalesce(p_n, 60), 1), 100)
  )
  select coalesce(json_agg(r order by r.id), '[]'::json) from (
    select c.id, c.uid, c.texto, c.foto, c.padre, c.evento, c.reac, c.creado
    from public.g_chat c
    where c.grupo = p_grupo
      and (c.id in (select id from m)
           or c.padre in (select id from m)
           or (p_antes is null and c.evento is not null and c.creado > now() - interval '70 days'))
  ) r;
$$;

-- ── escribir: un mensaje, una foto o un comentario ──
drop function if exists public.gc_enviar(text, text);
create or replace function public.gc_enviar(p_grupo text, p_texto text, p_foto text default null,
                                            p_padre bigint default null, p_evento bigint default null)
returns json
language plpgsql volatile security invoker
set search_path = public
as $$
declare t text := left(btrim(coalesce(p_texto, '')), 1000); f text := nullif(btrim(coalesce(p_foto, '')), ''); r public.g_chat;
begin
  if auth.uid() is null then raise exception 'sin_sesion'; end if;
  if t = '' and f is null then raise exception 'vacio'; end if;
  if f is not null and f !~ '^https://zznytqlurhxhdwludrxm\.supabase\.co/storage/v1/object/public/' then raise exception 'foto_mal'; end if;
  if p_grupo not in (select public.gc_mis_ids()) then raise exception 'no_eres_miembro'; end if;
  if p_padre is not null and not exists (select 1 from public.g_chat
       where id = p_padre and grupo = p_grupo and padre is null and evento is null) then
    raise exception 'no_existe';
  end if;
  if (select count(*) from public.g_chat
        where uid = auth.uid() and creado > now() - interval '1 minute') >= 20 then
    raise exception 'muy_rapido';
  end if;
  insert into public.g_chat (grupo, texto, foto, padre, evento)
    values (p_grupo, t, f, p_padre, case when p_padre is null then p_evento end)
    returning * into r;
  return json_build_object('id', r.id, 'uid', r.uid, 'texto', r.texto, 'foto', r.foto, 'padre', r.padre,
                           'evento', r.evento, 'reac', r.reac, 'creado', r.creado);
end $$;

-- ── reaccionar: pone o quita tu emoji (uno de cada) ──
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

-- ── borrar un mensaje tuyo (con sus comentarios) ──
create or replace function public.gc_borrar(p_id bigint)
returns boolean
language plpgsql volatile security invoker
set search_path = public
as $$
begin
  delete from public.g_chat where id = p_id and uid = auth.uid();
  return found;
end $$;

-- ════════════════ QUIÉN ESTÁ EN QUÉ GRUPO ════════════════
create table if not exists public.g_socios (
  grupo text not null,
  uid   uuid not null default auth.uid(),
  visto timestamptz not null default now(),
  primary key (grupo, uid)
);
alter table public.g_socios enable row level security;
revoke all on public.g_socios from anon, authenticated;
grant select, delete on public.g_socios to authenticated;
grant insert (grupo, uid) on public.g_socios to authenticated;
drop policy if exists g_socios_ver on public.g_socios;
create policy g_socios_ver on public.g_socios for select to authenticated
  using (grupo in (select public.gc_mis_ids()));
drop policy if exists g_socios_entrar on public.g_socios;
create policy g_socios_entrar on public.g_socios for insert to authenticated
  with check (uid = auth.uid() and grupo in (select public.gc_mis_ids()));
drop policy if exists g_socios_salir on public.g_socios;
create policy g_socios_salir on public.g_socios for delete to authenticated
  using (uid = auth.uid());

-- apunta tus grupos de ahora (y quita los que ya no)
create or replace function public.gc_socios()
returns void
language plpgsql volatile security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.g_socios (grupo, uid)
    select g, auth.uid() from public.gc_mis_ids() g
    on conflict do nothing;
  delete from public.g_socios where uid = auth.uid() and grupo not in (select public.gc_mis_ids());
end $$;

-- ¿compartes algún grupo con esa persona? (o eres tú)
create or replace function public.gc_comparte(p_uid uuid)
returns boolean
language sql stable security invoker
set search_path = public
as $$
  select p_uid = auth.uid() or exists (
    select 1 from public.g_socios s
    where s.uid = p_uid and s.grupo in (select public.gc_mis_ids()));
$$;

-- ── cuántos mensajes nuevos hay en cada uno de tus grupos ──
-- p_vistos: {"id del grupo": último mensaje que ya viste}. De paso, te apunta en g_socios.
drop function if exists public.gc_resumen(jsonb);
create or replace function public.gc_resumen(p_vistos jsonb default '{}'::jsonb)
returns json
language plpgsql volatile security invoker
set search_path = public
as $$
declare r json;
begin
  perform public.gc_socios();
  select coalesce(json_agg(x), '[]'::json) into r from (
    select g.id as grupo,
      (select max(c.id) from public.g_chat c where c.grupo = g.id) as ultimo,
      (select count(*) from (
         select 1 from public.g_chat c
         where c.grupo = g.id
           and c.id > coalesce(case when jsonb_typeof(p_vistos->g.id) = 'number' then (p_vistos->>g.id)::bigint end, 0)
           and c.uid <> auth.uid()
         limit 99) s) as sin_leer
    from public.gc_mis_ids() as g(id)
  ) x;
  return r;
end $$;

-- ════════════════ FOTOS DEL PERFIL ════════════════
create table if not exists public.g_foto_descr (
  dueno    uuid not null default auth.uid(),
  dia      date not null,
  descr    text not null check (char_length(descr) between 1 and 300),
  cambiado timestamptz not null default now(),
  primary key (dueno, dia)
);
create table if not exists public.g_foto_reac (
  dueno  uuid not null,
  dia    date not null,
  uid    uuid not null default auth.uid(),
  emoji  text not null check (char_length(emoji) between 1 and 8),
  creado timestamptz not null default now(),
  primary key (dueno, dia, uid, emoji)
);
alter table public.g_foto_descr enable row level security;
alter table public.g_foto_reac enable row level security;
revoke all on public.g_foto_descr, public.g_foto_reac from anon, authenticated;
grant select, delete on public.g_foto_descr, public.g_foto_reac to authenticated;
grant insert (dia, descr) on public.g_foto_descr to authenticated;
grant update (descr, cambiado) on public.g_foto_descr to authenticated;
grant insert (dueno, dia, emoji) on public.g_foto_reac to authenticated;

drop policy if exists fd_ver on public.g_foto_descr;
create policy fd_ver on public.g_foto_descr for select to authenticated using (public.gc_comparte(dueno));
drop policy if exists fd_poner on public.g_foto_descr;
create policy fd_poner on public.g_foto_descr for insert to authenticated with check (dueno = auth.uid());
drop policy if exists fd_cambiar on public.g_foto_descr;
create policy fd_cambiar on public.g_foto_descr for update to authenticated using (dueno = auth.uid()) with check (dueno = auth.uid());
drop policy if exists fd_quitar on public.g_foto_descr;
create policy fd_quitar on public.g_foto_descr for delete to authenticated using (dueno = auth.uid());

drop policy if exists fr_ver on public.g_foto_reac;
create policy fr_ver on public.g_foto_reac for select to authenticated using (public.gc_comparte(dueno));
drop policy if exists fr_poner on public.g_foto_reac;
create policy fr_poner on public.g_foto_reac for insert to authenticated
  with check (uid = auth.uid() and public.gc_comparte(dueno));
drop policy if exists fr_quitar on public.g_foto_reac;
create policy fr_quitar on public.g_foto_reac for delete to authenticated using (uid = auth.uid());

-- descripción y reacciones de todas las fotos de una persona
-- {"descr": {"2026-09-28": "texto"}, "reac": {"2026-09-28": {"❤️": ["uid", …]}}}
create or replace function public.gf_datos(p_dueno uuid)
returns json
language sql stable security invoker
set search_path = public
as $$
  select json_build_object(
    'descr', coalesce((select json_object_agg(dia::text, descr) from public.g_foto_descr where dueno = p_dueno), '{}'::json),
    'reac',  coalesce((select json_object_agg(d, e) from (
                select dia::text as d, json_object_agg(emoji, us) as e from (
                  select dia, emoji, json_agg(uid order by creado) as us
                  from public.g_foto_reac where dueno = p_dueno group by dia, emoji) x
                group by dia) y), '{}'::json));
$$;

-- poner, cambiar o quitar (texto vacío) la descripción de una foto tuya
create or replace function public.gf_descr(p_dia date, p_texto text)
returns boolean
language plpgsql volatile security invoker
set search_path = public
as $$
declare t text := left(btrim(coalesce(p_texto, '')), 300);
begin
  if auth.uid() is null then raise exception 'sin_sesion'; end if;
  if t = '' then
    delete from public.g_foto_descr where dueno = auth.uid() and dia = p_dia;
  else
    insert into public.g_foto_descr (dia, descr) values (p_dia, t)
      on conflict (dueno, dia) do update set descr = excluded.descr, cambiado = now();
  end if;
  return true;
end $$;

-- like (❤️) o reacción a una foto: se pone o se quita. Devuelve las de esa foto.
create or replace function public.gf_reaccion(p_dueno uuid, p_dia date, p_emoji text)
returns json
language plpgsql volatile security invoker
set search_path = public
as $$
declare e text := left(coalesce(p_emoji, ''), 8); r json;
begin
  if auth.uid() is null then raise exception 'sin_sesion'; end if;
  if e = '' then raise exception 'vacio'; end if;
  if not public.gc_comparte(p_dueno) then raise exception 'no_eres_miembro'; end if;
  if exists (select 1 from public.g_foto_reac where dueno = p_dueno and dia = p_dia and uid = auth.uid() and emoji = e) then
    delete from public.g_foto_reac where dueno = p_dueno and dia = p_dia and uid = auth.uid() and emoji = e;
  else
    insert into public.g_foto_reac (dueno, dia, emoji) values (p_dueno, p_dia, e);
  end if;
  select coalesce(json_object_agg(emoji, us), '{}'::json) into r from (
    select emoji, json_agg(uid order by creado) as us from public.g_foto_reac
    where dueno = p_dueno and dia = p_dia group by emoji) x;
  return r;
end $$;

-- ════════════════ PERMISOS DE LAS FUNCIONES ════════════════
revoke execute on function public.gc_mis_ids(), public.gc_leer(text, bigint, int),
  public.gc_enviar(text, text, text, bigint, bigint), public.gc_reaccion(bigint, text), public.gc_borrar(bigint),
  public.gc_socios(), public.gc_comparte(uuid), public.gc_resumen(jsonb),
  public.gf_datos(uuid), public.gf_descr(date, text), public.gf_reaccion(uuid, date, text) from anon, public;
grant execute on function public.gc_mis_ids(), public.gc_leer(text, bigint, int),
  public.gc_enviar(text, text, text, bigint, bigint), public.gc_reaccion(bigint, text), public.gc_borrar(bigint),
  public.gc_socios(), public.gc_comparte(uuid), public.gc_resumen(jsonb),
  public.gf_datos(uuid), public.gf_descr(date, text), public.gf_reaccion(uuid, date, text) to authenticated;

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
