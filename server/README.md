# Bar Restaurante API (Express + Postgres)

API compatível com Railway para o sistema Maria Flor. Rotas expõem CRUD para entidades principais e autenticação JWT.

## 🚀 Migrações Automáticas

**O servidor executa migrações automaticamente ao iniciar!**

Ao rodar `npm start` (ou fazer deploy no Railway), o sistema:

1. ✅ Conecta ao PostgreSQL
2. ✅ Executa `src/migrations/schema.sql`
3. ✅ Cria/atualiza todas as tabelas
4. ✅ Inicia a API

**Não é necessário rodar `npm run migrate` manualmente!** As tabelas são criadas automaticamente.

## Requisitos

- Node 18+
- Banco Postgres (Railway ou local)

## Configuração

1. Copie `.env.example` para `.env` e ajuste:

```env
DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=troque_este_segredo
PORT=3000
```

2. Instale dependências:

```bash
cd server
npm install
```

3. Inicie o servidor (migrações rodam automaticamente):

```bash
npm start
```

### Migração Manual (Opcional)

Se preferir executar migrações separadamente:

```bash
npm run migrate
```

Observação: o schema já inclui suporte a multi-empresa e seeds iniciais.

## Postgres local com Docker (recomendado)

Se você não quiser instalar Postgres no Windows, use o `docker-compose.yml`.

1. Suba o banco:

```bash
cd server
docker compose up -d
```

1. Crie/ajuste `server/.env` com:

```env
DATABASE_URL=postgres://bar:bar@localhost:5432/bar_restaurante
JWT_SECRET=troque_este_segredo_com_32+_caracteres
PORT=3000
NODE_ENV=development
DATABASE_SSL=false
```

1. Rode as migrations e inicie a API:

```bash
npm run migrate
npm start
```

1. (Opcional) Adminer para ver o banco:

- Abra `http://localhost:8080`
- Sistema: PostgreSQL
- Servidor: `db` (se estiver acessando de outro container) ou `localhost` (do host)
- Usuário/Senha: `bar` / `bar`
- Banco: `bar_restaurante`

## Executar

npm run dev

A API responderá em <http://localhost:3000>.

## Rotas

- GET /health – verificação de saúde
- POST /api/auth/login { username|email, password }
- CRUD /api/companies (somente `superadmin`)
- CRUD /api/users (`admin` e `superadmin`)
- CRUD /api/menu-items
- CRUD /api/tables
- GET/POST/PUT/DELETE /api/orders (+ /:id/items)
- CRUD /api/stock
- CRUD /api/transactions

### Multi-empresa (company_id)

As rotas de dados (`menu-items`, `tables`, `orders`, `stock`, `transactions`) são isoladas por empresa.

- Usuários `admin`/`staff`: o `companyId` vem do JWT.
- Usuário `superadmin`: precisa informar o contexto da empresa por `X-Company-Id` (header) ou `?companyId=...` (query) ao chamar essas rotas.

Exemplo:

- `GET /api/menu-items` com header `X-Company-Id: 1`

### Seeds de acesso (após `npm run migrate`)

- `superadmin` / `superadmin123` (acesso a todas as empresas)
- `admin` / `admin123` (vinculado à empresa "Default")

## Deploy Railway

- Crie um novo serviço a partir deste diretório server/
- Defina as variáveis DATABASE_URL e JWT_SECRET
- Habilite AUTO DEPLOY e vincule ao Postgres gerenciado

