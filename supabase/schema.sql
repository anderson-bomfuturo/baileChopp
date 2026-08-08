-- Baile do Chopp — schema de reservas de mesas
-- Rode este script no SQL Editor do seu projeto Supabase (Dashboard > SQL Editor > New query).

create table if not exists public.reservas (
  mesa_id text primary key,                -- ex: "MESA_01" (id vindo do Mesas.svg)
  numero integer not null,                 -- número da mesa, extraído do id
  status text not null default 'LIVRE'
    check (status in ('LIVRE', 'RESERVADO', 'PAGO', 'ENTREGUE', 'PATROCINIO')),
  comprador text,
  telefone text,
  valor numeric(10, 2),
  observacao text,
  comprovante_codigo text,
  updated_at timestamptz not null default now()
);

-- Mantém updated_at sempre atualizado em cada UPDATE
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reservas_updated_at on public.reservas;
create trigger trg_reservas_updated_at
  before update on public.reservas
  for each row execute function public.set_updated_at();

-- Habilita Realtime (para sincronizar entre vários dispositivos/telas ao vivo)
alter publication supabase_realtime add table public.reservas;

-- RLS: como o app usa a chave anônima direto do navegador (sem login),
-- liberamos leitura/escrita pública nessa tabela. Se quiser exigir login
-- de operadores no futuro, troque estas policies por checagens de auth.uid().
alter table public.reservas enable row level security;

drop policy if exists "Reservas: leitura pública" on public.reservas;
create policy "Reservas: leitura pública"
  on public.reservas for select
  to anon
  using (true);

drop policy if exists "Reservas: escrita pública" on public.reservas;
create policy "Reservas: escrita pública"
  on public.reservas for insert
  to anon
  with check (true);

drop policy if exists "Reservas: atualização pública" on public.reservas;
create policy "Reservas: atualização pública"
  on public.reservas for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Reservas: exclusão pública" on public.reservas;
create policy "Reservas: exclusão pública"
  on public.reservas for delete
  to anon
  using (true);
