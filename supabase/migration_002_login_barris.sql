-- Baile do Chopp — migration 002: campo "barris" nas reservas + login de usuários
-- Rode este script no SQL Editor do Supabase (depois de já ter rodado supabase/schema.sql).

-- 1) Quantidade de barris de chopp por mesa -------------------------------

alter table public.reservas
  add column if not exists barris integer;

-- 2) Usuários e login -------------------------------------------------------
-- IMPORTANTE: diferente da tabela `reservas`, a tabela `usuarios` NÃO tem
-- policy de leitura pública — não dá para "SELECT * FROM usuarios" pela API
-- REST com a chave anônima. Todo acesso (login, criar usuário, listar) passa
-- por funções (RPC) que rodam no servidor do Postgres, então a senha (com
-- hash bcrypt via pgcrypto) nunca é exposta para o navegador.

create extension if not exists pgcrypto;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.usuarios enable row level security;
-- Sem nenhuma policy: acesso via REST fica bloqueado por padrão para todo mundo.
-- Só as funções abaixo (security definer) conseguem ler/escrever essa tabela.

-- Usuário padrão: Administrador / baile@2026
insert into public.usuarios (username, password_hash, is_admin)
values ('Administrador', crypt('baile@2026', gen_salt('bf')), true)
on conflict (username) do nothing;

-- Login: recebe usuário+senha, retorna os dados do usuário se bater.
-- Retorna zero linhas se usuário/senha errados.
create or replace function public.login(p_username text, p_password text)
returns table (id uuid, username text, is_admin boolean)
language sql
security definer
set search_path = public, extensions
as $$
  select id, username, is_admin
  from usuarios
  where username = p_username
    and password_hash = crypt(p_password, password_hash)
  limit 1;
$$;

grant execute on function public.login(text, text) to anon;

-- Criação de novo usuário (usada pela tela do Administrador).
create or replace function public.criar_usuario(p_username text, p_password text)
returns table (id uuid, username text, is_admin boolean)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
    insert into usuarios (username, password_hash, is_admin)
    values (p_username, crypt(p_password, gen_salt('bf')), false)
    returning usuarios.id, usuarios.username, usuarios.is_admin;
end;
$$;

grant execute on function public.criar_usuario(text, text) to anon;

-- Lista usuários cadastrados (sem senha) para a tela do Administrador.
create or replace function public.listar_usuarios()
returns table (id uuid, username text, is_admin boolean, created_at timestamptz)
language sql
security definer
set search_path = public, extensions
as $$
  select id, username, is_admin, created_at
  from usuarios
  order by created_at desc;
$$;

grant execute on function public.listar_usuarios() to anon;
