-- Baile do Chopp — migration 003: preço da mesa + barris por tipo (50L / 30L)
-- Rode este script no SQL Editor do Supabase (depois de já ter rodado
-- supabase/schema.sql e supabase/migration_002_login_barris.sql).

-- 1) Colunas novas: quantidade de cada tipo de barril -----------------------

alter table public.reservas
  add column if not exists barril_50 integer,
  add column if not exists barril_30 integer;

-- 2) Migra dados da coluna antiga `barris` (genérica) para `barril_50`.
--    Assumimos que reservas antigas se referiam ao barril de 50L, já que era
--    a única opção disponível até agora. Ajuste manualmente se algum
--    registro específico foi na verdade um barril de 30L.
update public.reservas
  set barril_50 = barris
  where barris is not null and barril_50 is null;

-- A coluna `barris` fica mantida (não é mais usada pelo app) só por segurança
-- histórica. Pode ser removida depois de conferir a migração dos dados:
-- alter table public.reservas drop column barris;
