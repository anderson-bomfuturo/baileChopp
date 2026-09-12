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
2. No **SQL Editor**, rode nesta ordem: [`supabase/schema.sql`](supabase/schema.sql) — cria a tabela `reservas`, habilita Realtime e configura as policies de acesso público (o app usa a chave anônima direto do navegador, sem login) — depois [`supabase/migration_002_login_barris.sql`](supabase/migration_002_login_barris.sql), [`supabase/migration_003_precos_barris.sql`](supabase/migration_003_precos_barris.sql) e [`supabase/migration_004_config_pix.sql`](supabase/migration_004_config_pix.sql).
3. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.
4. Preencha `.env.local` (dev) ou as variáveis de ambiente do Vercel (produção) com:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

## Preços e pagamento via Pix

- Valor da mesa (R$ 200) e dos barris de chopp (50L com 4 ingressos / 30L) ficam definidos em [`src/data/pricing.js`](src/data/pricing.js) — mude ali se os valores mudarem de edição pra edição.
- Ao marcar uma mesa como **Reservado**, o campo "Valor a pagar" já soma automaticamente mesa + barris escolhidos (ainda editável manualmente).
- Para habilitar o botão **"Gerar QR Code Pix"** no popup de reserva, um usuário Administrador precisa preencher a chave Pix, o nome e a cidade do recebedor na tela de Administração (card "Configuração Pix"). Sem isso o botão fica oculto (o resto do app funciona normalmente).

## Deploy (Vercel)

1. Importe o repositório do GitHub no [Vercel](https://vercel.com/new). Detecção automática de Create React App (sem configuração extra).
2. Em **Environment Variables**, adicione `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` e, se for usar Pix, `REACT_APP_PIX_KEY` / `REACT_APP_PIX_NOME` / `REACT_APP_PIX_CIDADE`.
3. Deploy. A cada push na branch principal, o Vercel gera um novo deploy automaticamente.

## Scripts disponíveis

- `npm start` — modo desenvolvimento em [http://localhost:3000](http://localhost:3000)
- `npm test` — testes
- `npm run build` — build de produção em `build/`
