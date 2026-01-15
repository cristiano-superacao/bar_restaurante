# 🍽️ Bar Restaurante - Backend API

> API RESTful completa para sistema de gestão de bar e restaurante com multi-tenancy

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-4.19.2-blue.svg)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-blue.svg)](https://www.postgresql.org)
[![Railway](https://img.shields.io/badge/deploy-Railway-purple.svg)](https://railway.app)

API compatível com Railway para o sistema Maria Flor. Rotas expõem CRUD para entidades principais e autenticação JWT.

---

## 🚀 Migrações Automáticas

**O servidor executa migrações automaticamente ao iniciar!**

Ao rodar `npm start` (ou fazer deploy no Railway), o sistema:

1. ✅ Conecta ao PostgreSQL
2. ✅ Executa `src/migrations/schema.sql`
3. ✅ Cria/atualiza todas as tabelas
4. ✅ Inicia a API

**Não é necessário rodar `npm run migrate` manualmente!** As tabelas são criadas automaticamente.

---

## 📦 Instalação Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+ (local ou Railway)
- npm ou yarn

### Passo a Passo

```bash
# 1. Entre na pasta do servidor
cd server

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env

# 4. Edite o .env com suas credenciais
# DATABASE_URL, JWT_SECRET, etc.

# 5. Inicie o servidor (migrations automáticas)
npm start

# Ou para desenvolvimento com hot-reload
npm run dev
```

---

## ⚙️ Configuração (.env)

### Variáveis Obrigatórias

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://usuario:senha@localhost:5432/barestaurante

# JWT Secret (mínimo 32 caracteres)
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria_minimo_32_caracteres
```

### Variáveis Opcionais

```env
# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=*

# SSL do Banco
DATABASE_SSL=false

# Logs
LOG_SQL=false
```

### Gerar JWT_SECRET Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎮 Comandos NPM

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento com hot-reload |
| `npm start` | Produção |
| `npm run migrate` | Executar migrations (opcional, já roda no start) |
| `npm run rebuild` | Rebuild completo do banco ⚠️ |
| `npm run check-env` | Validar variáveis de ambiente |

---

## 🐳 Postgres Local com Docker (Recomendado)

Se não quiser instalar PostgreSQL no Windows, use o `docker-compose.yml` incluído:

```bash
# 1. Suba o banco
cd server
docker compose up -d

# 2. Configure o .env
DATABASE_URL=postgresql://bar:bar@localhost:5432/bar_restaurante
DATABASE_SSL=false

# 3. Inicie o servidor
npm start
```

### Adminer (Interface Visual)

Acesse `http://localhost:8080`

- **Sistema:** PostgreSQL
- **Servidor:** `db` ou `localhost`
- **Usuário/Senha:** `bar` / `bar`
- **Banco:** `bar_restaurante`

---

## 🚀 Deploy no Railway

### Passo a Passo Rápido

1. **Criar projeto no Railway**
2. **Adicionar PostgreSQL**
3. **Configurar variáveis:**
   - `JWT_SECRET` (gerar com crypto)
   - `NODE_ENV=production`
   - `PORT=3000`
   - `CORS_ORIGIN=*`
4. **Deploy automático!**

📖 **Guia Completo:** [GUIA_DEPLOY_RAILWAY.md](../GUIA_DEPLOY_RAILWAY.md)

---

## 🔐 Autenticação e Autorização

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "company_id": 1
  }
}
```

### Usar Token nas Requisições

```http
GET /api/menu-items
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Company-Id: 1
```

### Roles

- **superadmin**: Acesso a todas empresas (requer `X-Company-Id`)
- **admin**: Acesso total à sua empresa
- **staff**: Acesso limitado (garçom, cozinha, etc.)

### Usuários Padrão (Seeds)

| Usuário | Senha | Role | Empresa |
|---------|-------|------|---------|
| `superadmin` | `super123` | superadmin | Todas |
| `admin` | `admin123` | admin | Maria Flor (1) |
| `garcom` | `garcom123` | staff | Maria Flor (1) |

---

## 📡 Endpoints da API

### Health Check
- `GET /api/health` - Status da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuário atual

### Empresas (superadmin)
- `GET /api/companies` - Listar
- `POST /api/companies` - Criar
- `PUT /api/companies/:id` - Atualizar
- `DELETE /api/companies/:id` - Deletar

### Cardápio
- `GET /api/menu-items` - Listar
- `POST /api/menu-items` - Criar
- `PUT /api/menu-items/:id` - Atualizar
- `DELETE /api/menu-items/:id` - Deletar

### Pedidos
- `GET /api/orders` - Listar
- `POST /api/orders` - Criar
- `PUT /api/orders/:id` - Atualizar
- `DELETE /api/orders/:id` - Cancelar
- `GET /api/orders/:id/items` - Itens do pedido
- `POST /api/orders/:id/items` - Adicionar item

### Mesas
- `GET /api/tables` - Listar
- `POST /api/tables` - Criar
- `PUT /api/tables/:id` - Atualizar
- `DELETE /api/tables/:id` - Deletar

### Estoque
- `GET /api/stock` - Listar
- `POST /api/stock` - Adicionar
- `PUT /api/stock/:id` - Atualizar
- `DELETE /api/stock/:id` - Deletar

### Transações
- `GET /api/transactions` - Listar
- `POST /api/transactions` - Criar
- `GET /api/transactions/summary` - Resumo

### Clientes
- `GET /api/customers` - Listar
- `POST /api/customers` - Criar
- `PUT /api/customers/:id` - Atualizar
- `DELETE /api/customers/:id` - Deletar

### Reservas
- `GET /api/reservations` - Listar
- `POST /api/reservations` - Criar
- `PUT /api/reservations/:id` - Atualizar
- `DELETE /api/reservations/:id` - Cancelar

### Usuários
- `GET /api/users` - Listar
- `POST /api/users` - Criar
- `PUT /api/users/:id` - Atualizar
- `DELETE /api/users/:id` - Deletar

📖 **Documentação Completa:** [docs/API.md](../docs/API.md)

---

## 🔒 Segurança

### Headers de Segurança (Helmet)
- CSP (Content Security Policy)
- XSS Protection
- HSTS
- noSniff
- frameguard

### Rate Limiting
- Global: 100 req/15min
- Login: 5 req/15min

### Validação de Entrada
- express-validator em todas as rotas
- Sanitização automática

---

## 🧪 Testes

### Testar Health Check

```bash
curl http://localhost:3000/api/health
```

**Response esperado:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-14T...",
  "database": "connected",
  "version": "2.2.0"
}
```

### Testar Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🗄️ Banco de Dados

### Estrutura de Tabelas

- `companies` - Empresas/Restaurantes
- `users` - Usuários do sistema
- `menu_items` - Cardápio
- `tables` - Mesas
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `stock` - Estoque
- `transactions` - Transações financeiras
- `customers` - Clientes
- `reservations` - Reservas

### Executar Migrations Manualmente

```bash
npm run migrate
```

### Rebuild Completo (⚠️ Apaga todos os dados)

```bash
npm run rebuild
```

---

## 🐛 Troubleshooting

### ❌ Erro: "DATABASE_URL not found"

**Solução:** Configure a variável no `.env`

### ❌ Erro: "JWT malformed"

**Solução:** Verifique se o token está sendo enviado corretamente:
```
Authorization: Bearer <token>
```

### ❌ Erro: "ECONNREFUSED"

**Solução:** PostgreSQL não está rodando. Inicie o serviço:
```bash
# Com Docker
docker compose up -d

# Windows Service
net start postgresql-x64-14
```

### ❌ Migrations não aplicadas

**Solução:** Execute manualmente:
```bash
npm run migrate
```

---

## 📚 Documentação Adicional

- 📖 [API Completa](../docs/API.md)
- 🏗️ [Arquitetura](../docs/ARCHITECTURE.md)
- 🚀 [Deploy Railway](../GUIA_DEPLOY_RAILWAY.md)
- 👨‍💻 [Desenvolvimento](../docs/DEVELOPMENT.md)

---

## 📄 Licença

MIT © Cristiano Santos

---

## 🆘 Suporte

- 📧 Issues: [GitHub](https://github.com/cristiano-superacao/bar_restaurante/issues)
- 📚 Docs: [README Principal](../README.md)

- `superadmin` / `superadmin123` (acesso a todas as empresas)
- `admin` / `admin123` (vinculado à empresa "Default")

## Deploy Railway

- Crie um novo serviço a partir deste diretório server/
- Defina as variáveis DATABASE_URL e JWT_SECRET
- Habilite AUTO DEPLOY e vincule ao Postgres gerenciado

