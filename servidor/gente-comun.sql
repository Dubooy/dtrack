-- ════════════════════════════════════════════════════════════════
-- La gente de todos tus grupos (para «Ver tu montaña» en Progreso)
-- Devuelve, sin repetir, a todas las personas que comparten algún grupo
-- contigo (tú no), con su nombre, su foto y su nivel (el más alto que
-- tenga apuntado en sus fichas). Si esta función no está, la app usa lo
-- que recuerda de cada grupo que has abierto.
-- Se ejecuta una vez en Supabase › SQL Editor.
-- ════════════════════════════════════════════════════════════════
create or replace function public.g_gente_comun()
returns json
language sql stable security definer
set search_path to 'public'
as $$
  select coalesce(json_agg(x), '[]'::json) from (
    select m.uid,
           max(p.usuario) as usuario,
           max(p.avatar)  as avatar,
           max(case when (m.ficha->>'nivel') ~ '^[0-9]+$' then (m.ficha->>'nivel')::int end) as nivel
    from public.g_miembros m
    left join public.perfiles p on p.id = m.uid
    where m.grupo in (select grupo from public.g_miembros where uid = auth.uid())
      and m.uid <> auth.uid()
    group by m.uid
  ) x
$$;
revoke execute on function public.g_gente_comun() from anon, public;
grant execute on function public.g_gente_comun() to authenticated;
notify pgrst, 'reload schema';
