# Bar Restaurante API (Express + Postgres)

API compatível com Railway para o sistema Maria Flor. Rotas expõem CRUD para entidades principais e autenticação JWT.

## Requisitos
- Node 18+
- Banco Postgres (Railway ou local)

## Configuração
1. Copie `.env.example` para `.env` e ajuste:

DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=troque_este_segredo
PORT=3000

2. Instale deps:

cd server
npm install

3. Crie o schema no banco executando o conteúdo de `src/migrations/schema.sql` (pelo cliente SQL da Railway ou psql).

## Executar

npm run dev

A API responderá em http://localhost:3000.

## Rotas
- GET /health – verificação de saúde
- POST /api/auth/login { username|email, password }
- CRUD /api/menu-items
- CRUD /api/tables
- GET/POST/PUT/DELETE /api/orders (+ /:id/items)
- CRUD /api/stock
- CRUD /api/transactions

## Deploy Railway
- Crie um novo serviço a partir deste diretório server/
- Defina as variáveis DATABASE_URL e JWT_SECRET
- Habilite AUTO DEPLOY e vincule ao Postgres gerenciado