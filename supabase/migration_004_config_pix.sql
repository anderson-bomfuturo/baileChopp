-- Baile do Chopp — migration 004: configuração da chave Pix (editável pelo admin)
-- Rode este script no SQL Editor do Supabase (depois das migrations anteriores).

create table if not exists public.configuracoes (
  id text primary key,          -- linha única: 'geral'
  pix_key text,
  pix_nome text,
  pix_cidade text,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_configuracoes_updated_at on public.configuracoes;
create trigger trg_configuracoes_updated_at
  before update on public.configuracoes
  for each row execute function public.set_updated_at();

-- Habilita Realtime (a tela de reservas reflete na hora quando o admin salva a chave).
alter publication supabase_realtime add table public.configuracoes;

-- RLS: mesmo modelo já usado em `reservas` — o app não tem sessão do Supabase
-- Auth (login é próprio, via RPC), então o controle de quem é admin acontece
-- na UI, não no banco. Consistente com o restante do projeto.
alter table public.configuracoes enable row level security;

drop policy if exists "Configuracoes: leitura pública" on public.configuracoes;
create policy "Configuracoes: leitura pública"
  on public.configuracoes for select
  to anon
  using (true);

drop policy if exists "Configuracoes: escrita pública" on public.configuracoes;
create policy "Configuracoes: escrita pública"
  on public.configuracoes for insert
  to anon
  with check (true);

drop policy if exists "Configuracoes: atualização pública" on public.configuracoes;
create policy "Configuracoes: atualização pública"
  on public.configuracoes for update
  to anon
  using (true)
  with check (true);

insert into public.configuracoes (id) values ('geral')
on conflict (id) do nothing;
