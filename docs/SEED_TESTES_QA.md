# Seed de Testes (QA) — Local + Railway

Este projeto já possui um seed de demo em `server/src/seed.js`.

Para validação completa com dados realistas (empresa, clientes, motoboys, pedidos mesa, deliveries, reservas e financeiro), use o seed de QA em `server/src/seed-qa.js`.

## O que o seed QA cria

- 1 empresa: `Empresa QA` (configurável)
- Exercício das opções de cadastro da empresa (atualizações repetidas + alternância de ativo/bloqueado)
- 10 clientes
- 10 motoboys + 10 usuários operacionais (`staff_qa_*`)
- Estoque + acompanhamentos (com baixa no estoque via `order_item_addons`)
- Cardápio (itens com addons)
- 10 pedidos de mesa + 10 deliveries
- 10 reservas
- +10 lançamentos de despesas no financeiro

## Pré-requisitos

- Node.js 18+
- PostgreSQL local (para o fluxo local)
- Variáveis de ambiente do banco:
  - `DATABASE_URL`

## Execução no PostgreSQL local

No Windows (PowerShell):

1. Suba/aponte seu Postgres local e defina `DATABASE_URL`.
2. Rode migração:

`cd server`

`npm install`

`$env:DATABASE_URL = "postgres://USER:SENHA@localhost:5432/NOME_DO_BANCO"`

`npm run migrate`

3. Rode o seed QA (modo local rápido):

`$env:ALLOW_INSECURE_SEED = "true"`

`$env:SEED_RESET = "true"`

`npm run seed:qa`

4. Gere um relatório/validação:

`npm run qa:report`

## Execução no PostgreSQL do Railway

1. Defina `DATABASE_URL` com a URL do Railway.
2. Rode migração se necessário:

`cd server`

`$env:DATABASE_URL = "postgres://...railway..."`

`npm run migrate`

3. Rode o seed QA no Railway:

- Recomendado: **não** usar `ALLOW_INSECURE_SEED` em produção.

`$env:ALLOW_SEED = "true"`

`$env:SEED_RESET = "true"`

`$env:SEED_SUPERADMIN_PASSWORD = "SENHA_FORTE"`

`$env:SEED_ADMIN_PASSWORD = "SENHA_FORTE"`

`$env:SEED_MOTOBOY_PASSWORD = "SENHA_FORTE"`

`npm run seed:qa`

4. Valide:

`npm run qa:report`

## Comparação Local vs Railway (consistência)

Após rodar o **mesmo seed QA** nos dois bancos:

`cd server`

`$env:LOCAL_DATABASE_URL = "postgres://...local..."`

`$env:RAILWAY_DATABASE_URL = "postgres://...railway..."`

`npm run qa:compare`

> Observação: o comparador valida contadores por tabela (por empresa). Se você rodar o seed com tags/condições diferentes, os números podem divergir.

## Sobre “migração” de dados

O fluxo recomendado aqui é:

- Persistir e validar o seed no banco local
- Repetir o seed no Railway com os mesmos parâmetros
- Comparar os dados

Se você quiser migração 1:1 via dump/restore, use `pg_dump`/`pg_restore` (fora do escopo automático do script).
