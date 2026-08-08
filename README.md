# Baile do Chopp — Mapa de Reservas de Mesas

App React (Create React App) para gerenciar reservas de mesas de um evento, com status por mesa (LIVRE, RESERVADO, PAGO, ENTREGUE, PATROCÍNIO), popup de cadastro, geração de comprovante e envio via WhatsApp. Dados persistidos no Supabase, com sincronização em tempo real entre telas/dispositivos.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm start
```

## Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o script [`supabase/schema.sql`](supabase/schema.sql) — cria a tabela `reservas`, habilita Realtime e configura as policies de acesso público (o app usa a chave anônima direto do navegador, sem login).
3. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.
4. Preencha `.env.local` (dev) ou as variáveis de ambiente do Vercel (produção) com:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

## Deploy (Vercel)

1. Importe o repositório do GitHub no [Vercel](https://vercel.com/new). Detecção automática de Create React App (sem configuração extra).
2. Em **Environment Variables**, adicione `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY` com os mesmos valores do Supabase.
3. Deploy. A cada push na branch principal, o Vercel gera um novo deploy automaticamente.

## Scripts disponíveis

- `npm start` — modo desenvolvimento em [http://localhost:3000](http://localhost:3000)
- `npm test` — testes
- `npm run build` — build de produção em `build/`
