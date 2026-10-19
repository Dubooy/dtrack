-- ════════════════════════════════════════════════════════════════
-- Peak · panel de novedades, seguridad y borrar la cuenta (19/10/2026)
--
-- Cómo se instala (una sola vez, después de social.sql y grupos-varios.sql):
--   Supabase → SQL Editor → New query → pega TODO este archivo → Run.
--   Tiene que salir «Success. No rows returned». Se puede repetir sin miedo.
--
-- Qué hace:
--   1. Cierra el chat: ya no se pueden escribir mensajes, mandar fotos ni
--      comentar (la app ahora es un panel de niveles y fotos). Lo que ya
--      hay se queda y se puede seguir reaccionando.
--   2. Reacciones seguras: solo con gc_reaccion (tu emoji, en tus grupos).
--      Antes cualquiera de un grupo podía reescribir a mano las reacciones
--      de cualquier mensaje.
--   3. datos y perfiles: cada uno solo ve y cambia lo suyo. Se quitan las
--      reglas que hubiera y se ponen estas.
--   4. borrar_mi_cuenta(): borra todo lo tuyo y la cuenta.
--   5. Storage: puedes listar y borrar las fotos de tu carpeta en «gym» y
--      «avatares» (la app las borra antes de llamar a borrar_mi_cuenta).
--
-- Además, en Supabase → Edge Functions, borra la función «aviso-chat» y,
-- en Database → Webhooks, el webhook de g_chat: sin mensajes ya no sirven.
-- ════════════════════════════════════════════════════════════════

-- ── 1. el chat ya no se escribe ──
revoke insert on public.g_chat from authenticated;
drop policy if exists g_chat_escribir on public.g_chat;

create or replace function public.gc_enviar(p_grupo text, p_texto text, p_foto text default null,
                                            p_padre bigint default null, p_evento bigint default null)
returns json
language plpgsql volatile security invoker
set search_path = public
as $$
begin
  raise exception 'chat_cerrado';
end $$;

-- ── 2. reacciones solo por la función ──
revoke update on public.g_chat from authenticated;
drop policy if exists g_chat_reaccionar on public.g_chat;

create or replace function public.gc_reaccion(p_id bigint, p_emoji text)
returns json
language plpgsql volatile security definer
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
    and c.grupo in (select public.gc_mis_ids())
    and (not c.oculto or c.uid = auth.uid())
    and not exists (select 1 from public.g_bloqueos b where b.uid = auth.uid() and b.bloqueado = c.uid)
  returning c.reac into r;
  if r is null then raise exception 'no_eres_miembro'; end if;
  return r;
end $$;
revoke execute on function public.gc_reaccion(bigint, text) from anon, public;
grant execute on function public.gc_reaccion(bigint, text) to authenticated;

-- ── 3. datos y perfiles: cada uno lo suyo ──
-- ¿se comparte algún grupo con esa persona? (para ver su nombre y su foto)
create or replace function public.peak_comparte_grupo(p_uid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select p_uid = auth.uid() or exists (
    select 1 from public.g_miembros a join public.g_miembros b on a.grupo = b.grupo
    where a.uid = auth.uid() and b.uid = p_uid);
$$;
revoke execute on function public.peak_comparte_grupo(uuid) from anon, public;
grant execute on function public.peak_comparte_grupo(uuid) to authenticated;

do $$
declare p record; otros boolean;
begin
  -- fuera las reglas que hubiera en las dos tablas
  for p in select tablename, policyname from pg_policies
           where schemaname = 'public' and tablename in ('datos', 'perfiles') loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;

  -- datos (tu estado entero: diario, ánimo…): solo tú
  execute 'alter table public.datos enable row level security';
  execute 'revoke all on public.datos from anon';
  execute 'grant select, insert, update on public.datos to authenticated';
  execute 'revoke delete on public.datos from authenticated';
  execute $p$create policy datos_mios on public.datos for all to authenticated
           using (id = auth.uid()) with check (id = auth.uid())$p$;

  -- perfiles: lo tuyo lo cambias tú. Si alguna función de grupos lee perfiles
  -- con los permisos de quien pregunta, también se deja ver a la gente de tus grupos
  execute 'alter table public.perfiles enable row level security';
  execute 'revoke all on public.perfiles from anon';
  execute 'grant select, insert, update on public.perfiles to authenticated';
  execute 'revoke delete on public.perfiles from authenticated';
  select exists (
    select 1 from pg_proc f join pg_namespace n on n.oid = f.pronamespace
    where n.nspname = 'public' and not f.prosecdef and f.prosrc ilike '%perfiles%'
      and f.proname not in ('peak_comparte_grupo', 'borrar_mi_cuenta')) into otros;
  if otros then
    execute $p$create policy perfiles_ver on public.perfiles for select to authenticated
             using (public.peak_comparte_grupo(id))$p$;
  else
    execute $p$create policy perfiles_ver on public.perfiles for select to authenticated
             using (id = auth.uid())$p$;
  end if;
  execute $p$create policy perfiles_poner on public.perfiles for insert to authenticated
           with check (id = auth.uid())$p$;
  execute $p$create policy perfiles_cambiar on public.perfiles for update to authenticated
           using (id = auth.uid()) with check (id = auth.uid())$p$;
end $$;

-- ── 4. borrar mi cuenta ──
-- Borra, de todas las tablas de Peak, las filas que son tuyas (columnas uid,
-- dueno, por, autor, bloqueado), tus reacciones dentro de los mensajes, tu
-- perfil y tus datos, los grupos que se quedan sin nadie y, al final, la cuenta.
create or replace function public.borrar_mi_cuenta()
returns boolean
language plpgsql volatile security definer
set search_path = public
as $$
declare
  yo uuid := auth.uid();
  mis uuid[];
  t record; pend text[] := '{}'; sigue text[]; q text; vuelta int;
begin
  if yo is null then raise exception 'sin_sesion'; end if;
  select coalesce(array_agg(grupo), '{}') into mis from public.g_miembros where uid = yo;

  -- tus reacciones dentro de las listas de reacciones (columnas «reac» con listas de personas)
  for t in select c.table_name from information_schema.columns c
           join information_schema.tables tb on tb.table_schema = c.table_schema and tb.table_name = c.table_name
           where c.table_schema = 'public' and c.column_name = 'reac' and c.data_type = 'jsonb' and tb.table_type = 'BASE TABLE' loop
    execute format($f$update public.%I set reac = coalesce((
        select jsonb_object_agg(k, case when jsonb_typeof(v) = 'array' then v - %L else v end)
        from jsonb_each(reac) e(k, v)
        where not (jsonb_typeof(v) = 'array' and jsonb_array_length(v - %L) = 0)), '{}'::jsonb)
      where reac::text like %L$f$, t.table_name, yo::text, yo::text, '%' || yo::text || '%');
  end loop;

  -- todas las filas tuyas, en cualquier tabla de Peak
  for t in select c.table_name, c.column_name from information_schema.columns c
           join information_schema.tables tb on tb.table_schema = c.table_schema and tb.table_name = c.table_name
           where c.table_schema = 'public' and tb.table_type = 'BASE TABLE' and c.data_type = 'uuid'
             and c.column_name in ('uid', 'dueno', 'por', 'autor', 'bloqueado') loop
    pend := pend || format('delete from public.%I where %I = %L', t.table_name, t.column_name, yo);
  end loop;
  pend := pend || format('delete from public.datos where id = %L', yo)
               || format('delete from public.perfiles where id = %L', yo);

  -- se repite por si alguna tabla depende de otra (hasta que no quede nada o no avance)
  for vuelta in 1..4 loop
    sigue := '{}';
    foreach q in array pend loop
      begin execute q; exception when foreign_key_violation then sigue := sigue || q; end;
    end loop;
    exit when cardinality(sigue) = 0 or cardinality(sigue) = cardinality(pend);
    pend := sigue;
  end loop;
  if cardinality(sigue) > 0 then raise exception 'borrado_incompleto: %', sigue[1]; end if;

  -- los grupos en los que estabas y se han quedado sin nadie
  if cardinality(mis) > 0 then
    delete from public.g_chat where grupo in (select g::text from unnest(mis) g)
      and not exists (select 1 from public.g_miembros m where m.grupo::text = g_chat.grupo);
    delete from public.g_socios where grupo in (select g::text from unnest(mis) g)
      and not exists (select 1 from public.g_miembros m where m.grupo::text = g_socios.grupo);
    delete from public.g_grupo_foto where grupo in (select g::text from unnest(mis) g)
      and not exists (select 1 from public.g_miembros m where m.grupo::text = g_grupo_foto.grupo);
    delete from public.g_grupos g where g.id = any(mis)
      and not exists (select 1 from public.g_miembros m where m.grupo = g.id);
  end if;

  -- y la cuenta (lo que cuelga de ella con «on delete cascade» se va solo)
  delete from auth.users where id = yo;
  return true;
end $$;
revoke execute on function public.borrar_mi_cuenta() from anon, public;
grant execute on function public.borrar_mi_cuenta() to authenticated;
-- la app pregunta antes si está, para no borrar tus fotos si luego no se puede borrar la cuenta
create or replace function public.borrar_mi_cuenta_lista()
returns boolean language sql stable security invoker set search_path = public as $$ select true $$;
revoke execute on function public.borrar_mi_cuenta_lista() from anon, public;
grant execute on function public.borrar_mi_cuenta_lista() to authenticated;

-- ── 5. Storage: tus fotos de tu carpeta ──
drop policy if exists peak_fotos_ver_mias on storage.objects;
create policy peak_fotos_ver_mias on storage.objects for select to authenticated
  using (bucket_id in ('gym', 'avatares') and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists peak_fotos_borrar_mias on storage.objects;
create policy peak_fotos_borrar_mias on storage.objects for delete to authenticated
  using (bucket_id in ('gym', 'avatares') and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
