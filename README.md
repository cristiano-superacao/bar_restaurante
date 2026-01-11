# 🍽️ Sistema de Gestão para Bar e Restaurante

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/cristiano-superacao/bar_restaurante)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Railway](https://img.shields.io/badge/deploy-Railway-purple.svg)](https://railway.app)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-blue.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)](Dockerfile)

> Sistema completo de gestão empresarial para bares e restaurantes com arquitetura híbrida progressiva. Funciona 100% offline (LocalStorage) ou com backend completo (Express + PostgreSQL). Interface responsiva e profissional, pronta para produção.

---

## 📋 Índice

- [✨ Visão Geral](#-visão-geral)
- [🎯 Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [⚡ Início Rápido](#-início-rápido)
- [🔧 Tecnologias](#-tecnologias)
- [📦 Instalação](#-instalação)
- [🚀 Deploy](#-deploy)
- [📖 API Backend](#-api-backend)
- [🔒 Segurança](#-segurança)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## ✨ Visão Geral

Sistema profissional de gestão desenvolvido com **arquitetura híbrida progressiva**, permitindo operação em múltiplos cenários:

### 🎯 Modos de Operação

| Modo | Descrição | Ideal Para |
|------|-----------|------------|
| **🌐 Offline** | Persistência via LocalStorage | Testes, demonstrações, ambientes sem internet |
| **☁️ Cloud** | Backend Node.js + PostgreSQL | Produção, multi-loja, acesso remoto |
| **🔄 Híbrido** | Transição transparente entre modos | Migração gradual, failover automático |

### 🌟 Principais Diferenciais

- ✅ **Multi-tenant**: Isolamento completo de dados por empresa
- ✅ **Autenticação JWT**: Segurança robusta com roles (superadmin, admin, staff)
- ✅ **Interface Responsiva**: Design adaptativo (desktop, tablet, mobile)
- ✅ **Zero Breaking Changes**: Compatibilidade retroativa garantida
- ✅ **Docker Ready**: Dockerfile + Healthcheck incluídos
- ✅ **Validação Completa**: express-validator em todas as rotas
- ✅ **Rate Limiting**: Proteção contra ataques (100 req/15min)

---

## 🎯 Funcionalidades

### 📊 Módulos Principais (16 Telas)

<details open>
<summary><b>🍽️ Cardápio</b> - Gestão completa do menu</summary>

- ✅ Cadastro de itens (nome, categoria, preço, descrição, imagem)
- ✅ Busca em tempo real e filtros por categoria
- ✅ Métricas: Total de itens, categorias, preço médio
- ✅ Grid responsivo com cards categorizados
- ✅ Validação: preço ≥0, campos obrigatórios
</details>

<details>
<summary><b>📝 Pedidos</b> - Controle de pedidos Mesa e Delivery</summary>

- ✅ Gestão de status: `Pendente` → `Em Preparo` → `Entregue` → `Pago`
- ✅ Adição de itens do cardápio com cálculo automático
- ✅ Descontos, taxa de entrega, subtotal
- ✅ Métricas por status em tempo real
- ✅ Geração de cupom fiscal
- ✅ Validação de itens, quantidades e totais
</details>

<details>
<summary><b>🪑 Mesas</b> - Gerenciamento de mesas</summary>

- ✅ Cadastro (nome, capacidade, status)
- ✅ Status visual: `Livre` / `Ocupada`
- ✅ Métricas: Disponibilidade e capacidade total
- ✅ Busca e filtros de status
- ✅ Validação: capacidade ≥1
</details>

<details>
<summary><b>📅 Reservas</b> - Sistema de agendamento</summary>

- ✅ Reserva com data, hora, cliente e número de pessoas
- ✅ Status: `Confirmada`, `Pendente`, `Cancelada`
- ✅ Busca por nome/telefone
- ✅ Filtros de data e status
- ✅ Validação: data/hora ISO8601, pessoas ≥1
</details>

<details>
<summary><b>📦 Estoque</b> - Controle de inventário</summary>

- ✅ Produtos com quantidade atual e mínima
- ✅ Alertas visuais: `Baixo`, `Crítico`, `OK`
- ✅ Métricas de inventário
- ✅ Busca e filtro por categoria
- ✅ Validação: quantidades ≥0
</details>

<details>
<summary><b>💰 Financeiro</b> - Gestão financeira</summary>

- ✅ Registro de receitas e despesas
- ✅ Dashboard: Saldo, receitas, despesas, previsão
- ✅ Filtros por tipo e período
- ✅ Busca por descrição
- ✅ Validação: valor ≥0, tipo (Receita/Despesa)
</details>

<details>
<summary><b>📈 Relatórios</b> - Analytics e insights</summary>

- ✅ Gráficos interativos (Chart.js)
- ✅ Top itens mais vendidos
- ✅ Vendas por categoria
- ✅ Filtros: Hoje, 7 dias, 30 dias, Todos
- ✅ Exportação de dados
</details>

<details>
<summary><b>🏍️ Delivery</b> - Gestão de entregas</summary>

- ✅ Endereço completo (rua, bairro, referência)
- ✅ Taxa de entrega configurável
- ✅ Status e rastreamento
- ✅ Métricas por status
- ✅ Validação de dados do cliente
</details>

<details>
<summary><b>👤 Clientes</b> - CRM básico</summary>

- ✅ Cadastro: nome, CPF, telefone, email, endereço
- ✅ Histórico de pedidos
- ✅ Busca avançada
- ✅ Validação de email e telefone
</details>

<details>
<summary><b>⚙️ Configurações</b> - Personalização</summary>

- ✅ Perfil do usuário
- ✅ Configuração de conexão API
- ✅ Exportação/importação de dados
- ✅ Limpeza de dados
- ✅ Tema claro/escuro
</details>

<details>
<summary><b>👥 Usuários</b> - Gestão de acesso</summary>

- ✅ CRUD completo de usuários
- ✅ Roles: `superadmin`, `admin`, `staff`
- ✅ Ativação/desativação de contas
- ✅ Validação de email único
</details>

<details>
<summary><b>🏢 Empresas</b> - Multi-tenant</summary>

- ✅ Cadastro de empresas (razão social, CNPJ)
- ✅ Isolamento total de dados por empresa
- ✅ Superadmin gerencia todas as empresas
- ✅ Admin gerencia apenas sua empresa
</details>

<details>
<summary><b>📊 Dashboard</b> - Visão geral</summary>

- ✅ KPIs: Vendas, pedidos, mesas, estoque
- ✅ Gráficos de tendências
- ✅ Alertas de estoque baixo
- ✅ Pedidos pendentes
</details>

<details>
<summary><b>🧾 Cupom Fiscal</b> - Impressão</summary>

- ✅ Geração de cupom formatado
- ✅ Dados da empresa e cliente
- ✅ Itens com subtotal
- ✅ Total, desconto, forma de pagamento
</details>

<details>
<summary><b>📚 Manual</b> - Documentação integrada</summary>

- ✅ Guia de uso do sistema
- ✅ FAQ e troubleshooting
- ✅ Exemplos práticos
</details>

<details>
<summary><b>🔐 Login</b> - Autenticação</summary>

- ✅ Login com email/username e senha
- ✅ Autenticação JWT
- ✅ Rate limiting (5 tentativas/15min)
- ✅ Redirecionamento baseado em role
</details>

---

## 🏗️ Arquitetura

### 📐 Estrutura do Projeto

```
bar_restaurante/
├── 📄 Frontend (Static Site)
│   ├── *.html              # 16 páginas principais
│   ├── css/                # Estilos responsivos
│   │   ├── base.css        # Base + componentes compartilhados
│   │   ├── login.css       # Autenticação
│   │   └── *.css           # Módulos específicos
│   ├── js/                 # JavaScript ES6+
│   │   ├── config.js       # Configuração API
│   │   ├── utils.js        # Utilitários centralizados
│   │   ├── api.js          # Cliente HTTP
│   │   └── *.js            # Lógica de cada módulo
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker (offline)
│
├── 🖥️ Backend (Node.js + Express)
│   ├── src/
│   │   ├── index.js        # Entry point + Express config
│   │   ├── db.js           # Pool PostgreSQL
│   │   ├── check-env.js    # Validação de variáveis
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT + RBAC
│   │   ├── routes/         # 11 rotas API
│   │   │   ├── auth.js     # Login, registro
│   │   │   ├── menuItems.js
│   │   │   ├── tables.js
│   │   │   ├── orders.js
│   │   │   ├── stock.js
│   │   │   ├── transactions.js
│   │   │   ├── reservations.js
│   │   │   ├── customers.js
│   │   │   ├── users.js
│   │   │   ├── companies.js
│   │   │   └── database.js # Admin tools
│   │   └── migrations/
│   │       └── schema.sql  # DDL + seeds
│   ├── package.json        # Dependências
│   └── .env.example        # Template de variáveis
│
├── 🐳 Deploy
│   ├── Dockerfile          # Build otimizado (Node 18 Alpine)
│   ├── .dockerignore       # Exclusões de build
│   ├── railway.json        # Config Railway (Nixpacks)
│   └── railway.toml        # Config alternativa
│
└── 📚 Documentação
    ├── README.md           # Este arquivo
    ├── INSTALL.md          # Guia de instalação
    ├── CHANGELOG.md        # Histórico de mudanças
    ├── RAILWAY_SETUP.md    # Deploy Railway detalhado
    └── CORRIGIR_ERRO_RAILWAY.md  # Troubleshooting
```

### 🔄 Fluxo de Dados

```mermaid
graph LR
    A[Navegador] -->|HTTP/HTTPS| B[Frontend HTML+JS]
    B -->|LocalStorage| C[Modo Offline]
    B -->|Fetch API| D[Backend Express]
    D -->|JWT Auth| E[Middleware]
    E -->|SQL| F[PostgreSQL]
    F -->|Dados| D
    D -->|JSON| B
```

### 🔐 Autenticação e Autorização

```mermaid
graph TD
    A[Login] -->|POST /api/auth/login| B[Backend]
    B -->|bcrypt.compare| C{Senha OK?}
    C -->|Não| D[401 Unauthorized]
    C -->|Sim| E[Gera JWT Token]
    E -->|Inclui: id, role, company_id| F[Retorna Token]
    F -->|Bearer Token| G[Requests Subsequentes]
    G -->|middleware/auth.js| H{Token Válido?}
    H -->|Não| I[401 Unauthorized]
    H -->|Sim| J{Role Autorizado?}
    J -->|Não| K[403 Forbidden]
    J -->|Sim| L[Processa Request]
```

---

## ⚡ Início Rápido

### 🚀 Frontend (Modo Offline)

```bash
# Clone o repositório
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante

# Instale dependências (apenas para dev server)
npm install

# Inicie o servidor de desenvolvimento
npm start
# ou abra index.html diretamente no navegador

# Acesse: http://localhost:8000
```

**Credenciais padrão (modo offline):**
- Usuário: `admin`
- Senha: `admin`

### ☁️ Backend (Modo Cloud)

```bash
cd server

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Instale dependências
npm install

# Execute migrações
npm run migrate

# Inicie o servidor
npm start

# API disponível em: http://localhost:3000
```

**Credenciais padrão (modo cloud):**
- **Superadmin**: `superadmin` / `superadmin123`
- **Admin**: `admin` / `admin123`

---

## 🔧 Tecnologias

### 🎨 Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **HTML5** | - | Estrutura semântica |
| **CSS3** | - | Flexbox, Grid, CSS Variables |
| **JavaScript** | ES6+ | Vanilla JS (sem frameworks) |
| **Chart.js** | 4.x | Gráficos e relatórios |
| **Font Awesome** | 6.0 | Ícones |
| **LocalStorage** | - | Persistência offline |

### 🖥️ Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | ≥18.0.0 | Runtime JavaScript |
| **Express** | 4.19.2 | Framework web |
| **PostgreSQL** | 14+ | Banco de dados relacional |
| **JWT** | 9.0.2 | Autenticação stateless |
| **bcryptjs** | 3.0.2 | Hash de senhas |
| **Helmet** | 7.0.0 | Segurança HTTP headers |
| **express-validator** | 7.0.1 | Validação de entrada |
| **express-rate-limit** | 7.4.0 | Rate limiting |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | 16.4.5 | Variáveis de ambiente |

### 🐳 DevOps

| Tecnologia | Uso |
|------------|-----|
| **Docker** | Containerização |
| **Railway** | Deploy PaaS |
| **GitHub Actions** | CI/CD (auto-deploy) |
| **Nixpacks** | Build alternativo |

---
- Controle de acesso

#### 🏢 Empresas
- Gestão multi-tenant
- Seleção de contexto (para superadmin)
- Cadastro de empresas

#### 📖 Manual
- Documentação integrada
- Busca por módulo
- Links rápidos

### 🎨 Design e UX

- **Layout Responsivo**: Adaptação automática para mobile, tablet e desktop
- **Empty States**: Feedback visual quando não há dados
- **Stat Cards**: Métricas rápidas em todas as páginas
- **Toolbar Unificada**: Busca e filtros padronizados
- **Tema Azul Profissional**: Paleta consistente e acessível
- **Design System**: Componentes compartilhados e reutilizáveis
- **Sidebar Inteligente**: Colapsa automaticamente em telas pequenas

## 🛠️ Tecnologias

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| HTML5 | - | Estrutura semântica |
| CSS3 | - | Flexbox, Grid, variáveis CSS |
| JavaScript | ES6+ | Lógica e manipulação DOM |
| Chart.js | Latest | Gráficos dinâmicos |
| Font Awesome | 6.0 | Ícones |
| LocalStorage | - | Persistência offline |

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.19.2 | Framework web |
| PostgreSQL | 14+ | Banco de dados |
| JWT | 9.0.2 | Autenticação |
| bcryptjs | 3.0.2 | Hash de senhas |
| Helmet | 7.0.0 | Segurança headers |
| express-validator | 7.0.1 | Validação de entrada |
| express-rate-limit | 7.4.0 | Rate limiting |

### DevOps

- **Railway**: Deploy e hospedagem
- **Git**: Controle de versão
- **Docker**: Containerização (opcional)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ (para backend)
- PostgreSQL 14+ (para modo cloud)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Frontend (Modo Offline)

1. Clone o repositório:
```bash
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante
```

2. Abra `index.html` diretamente no navegador ou use um servidor local:

```bash
# Opção 1: Node.js
npm install
npm start

# Opção 2: Python
python -m http.server 8000

# Opção 3: npx
npx serve .
```

3. Acesse `http://localhost:8000` (ou a porta configurada)

### Backend (Modo Cloud)

1. Entre no diretório do servidor:
```bash
cd server
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o ambiente:
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:
```env
DATABASE_URL=postgres://usuario:senha@host:5432/database
JWT_SECRET=seu_segredo_forte_de_32+_caracteres
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.com
```

4. Inicie o servidor:
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

As migrações são aplicadas automaticamente na inicialização.

## 📦 Instalação

Para instalação detalhada, consulte **[INSTALL.md](INSTALL.md)**.

### ⚡ Frontend Rápido

```bash
# Clone e acesse
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante

# Opção 1: Abrir direto no navegador
open index.html  # ou dê duplo clique

# Opção 2: Servidor local (npm)
npm install && npm start

# Opção 3: Python
python -m http.server 8000

# Opção 4: npx (sem instalação)
npx http-server . -p 8000
```

### ⚡ Backend Rápido

```bash
cd server

# Configure variáveis (obrigatório)
cp .env.example .env
nano .env  # ou use seu editor preferido

# Instale e inicie
npm install
npm run migrate  # aplica migrações
npm start

# Verificação
curl http://localhost:3000/api/health
# Esperado: {"status":"ok","timestamp":"...","database":"connected"}
```

**Variáveis obrigatórias em `.env`:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-min-32-chars
PORT=3000
```

---

## 🚀 Deploy

### 🚂 Railway (Recomendado)

**Deploy automático via GitHub:**

1. **Crie conta no Railway**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Selecione** `cristiano-superacao/bar_restaurante`
4. **Add PostgreSQL** plugin
5. **Configure variáveis**:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=gere-com-node-crypto-randomBytes-32-hex
   PORT=3000
   CORS_ORIGIN=*
   ```
6. **Deploy**: Automático a cada push

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Documentação completa**: [RAILWAY_SETUP.md](RAILWAY_SETUP.md)

### 🐳 Docker

```bash
# Build
docker build -t bar-restaurante .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  bar-restaurante

# Healthcheck automático via /api/health
```

### ☁️ Outros Providers

- **Vercel**: Frontend estático
- **Netlify**: Frontend + Serverless Functions
- **Heroku**: Backend Node.js
- **Render**: Full-stack
- **DigitalOcean**: App Platform

---

## 📖 API Backend

### 🔐 Autenticação

Todas as rotas (exceto `/api/auth/login`) requerem header:
```http
Authorization: Bearer <jwt_token>
```

### 📍 Endpoints Principais

#### 🔑 Auth

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@default.local",
  "password": "admin123"
}

# Resposta (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "admin",
    "email": "admin@default.local",
    "role": "admin",
    "company_id": 1
  }
}
```

#### 🏢 Companies (Multi-tenant)

```http
GET /api/companies
Authorization: Bearer <token>

# Resposta
[
  {
    "id": 1,
    "name": "Default",
    "legal_name": "Empresa Default LTDA",
    "document": "00000000000000",
    "phone": "(11) 0000-0000",
    "address": "Rua Exemplo, 123",
    "active": true
  }
]
```

```http
POST /api/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Minha Empresa",
  "legal_name": "Minha Empresa LTDA",
  "document": "12345678000190",
  "phone": "(11) 99999-9999",
  "address": "Av. Principal, 456"
}
```

#### 🍽️ Menu Items

```http
GET /api/menu-items
Authorization: Bearer <token>
X-Company-Id: 1

# Resposta
[
  {
    "id": 1,
    "company_id": 1,
    "name": "Coca-Cola Lata",
    "category": "Bebidas",
    "price": 6.00,
    "description": "350ml",
    "image": null
  }
]
```

```http
POST /api/menu-items
Authorization: Bearer <token>
X-Company-Id: 1
Content-Type: application/json

{
  "name": "Pizza Mussarela",
  "category": "Pratos",
  "price": 39.90,
  "description": "8 fatias, queijo e orégano"
}
```

#### 📝 Orders

```http
GET /api/orders?status=Pendente
Authorization: Bearer <token>
X-Company-Id: 1

# Resposta
[
  {
    "id": 1,
    "company_id": 1,
    "table_id": 1,
    "status": "Pendente",
    "order_type": "Mesa",
    "customer_name": "Cliente Teste",
    "subtotal": 28.90,
    "total": 28.90,
    "created_at": "2026-01-11T10:00:00.000Z"
  }
]
```

```http
POST /api/orders
Authorization: Bearer <token>
X-Company-Id: 1
Content-Type: application/json

{
  "table_id": 1,
  "order_type": "Mesa",
  "customer_name": "João Silva",
  "status": "Pendente",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "price": 6.00
    }
  ],
  "subtotal": 12.00,
  "discount": 0,
  "delivery_fee": 0,
  "total": 12.00
}
```

```http
POST /api/orders/:id/close
Authorization: Bearer <token>
X-Company-Id: 1
Content-Type: application/json

{
  "payment_method": "Dinheiro"
}

# Define status como "Pago" e paid_at = NOW()
```

#### 🪑 Tables

```http
GET /api/tables
POST /api/tables
PUT /api/tables/:id
DELETE /api/tables/:id
```

#### 📦 Stock

```http
GET /api/stock
POST /api/stock
PUT /api/stock/:id
DELETE /api/stock/:id
```

#### 💰 Transactions

```http
GET /api/transactions?tipo=Receita
POST /api/transactions
PUT /api/transactions/:id
DELETE /api/transactions/:id
```

#### 📅 Reservations

```http
GET /api/reservations?status=Confirmada
POST /api/reservations
PUT /api/reservations/:id
DELETE /api/reservations/:id
```

#### 👤 Customers

```http
GET /api/customers?search=João
POST /api/customers
PUT /api/customers/:id
DELETE /api/customers/:id
```

#### 👥 Users (Admin/Superadmin only)

```http
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

### 📊 Health Check

```http
GET /api/health

# Resposta (200 OK)
{
  "status": "ok",
  "timestamp": "2026-01-11T12:00:00.000Z",
  "database": "connected"
}
```

### 🛡️ Validação de Entrada

Todos os endpoints validam entrada com `express-validator`:

```http
POST /api/menu-items
Content-Type: application/json

{
  "name": "",
  "price": -10
}

# Resposta (400 Bad Request)
{
  "error": "Erro de validação",
  "details": [
    {
      "field": "name",
      "message": "Nome é obrigatório"
    },
    {
      "field": "price",
      "message": "Preço deve ser maior ou igual a 0"
    }
  ]
}
```

### 🔒 Rate Limiting

- **Global**: 100 requisições / 15 minutos
- **Login**: 5 tentativas / 15 minutos

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Too many requests, please try again later."
}
```

---

## 🔒 Segurança

### 🛡️ Medidas Implementadas

| Camada | Proteção | Implementação |
|--------|----------|---------------|
| **Headers HTTP** | CSP, XSS, HSTS | Helmet.js |
| **Autenticação** | JWT + bcrypt | jsonwebtoken + bcryptjs |
| **Autorização** | RBAC (Role-Based) | Middleware `requireAuth`, `requireRole` |
| **Validação** | Input sanitization | express-validator em todas as rotas |
| **Rate Limiting** | Anti-brute-force | express-rate-limit (100 req/15min) |
| **CORS** | Origin whitelisting | Configurável via `CORS_ORIGIN` |
| **SQL Injection** | Prepared statements | pg com queries parametrizadas |
| **Secrets** | Env variables | dotenv (nunca commitar .env) |
| **Password** | bcrypt (10 rounds) | Salt + hash antes de salvar |

### 🔐 Boas Práticas

1. **Troque senhas padrão** antes de produção
2. **Use HTTPS** em produção (Railway já fornece)
3. **Rotacione JWT_SECRET** periodicamente
4. **Monitore logs** de tentativas de login falhadas
5. **Mantenha dependências atualizadas**: `npm audit fix`
6. **Backup regular** do banco PostgreSQL
7. **Limite permissões** do usuário PostgreSQL

### 🚨 Roles e Permissões

| Role | Permissões |
|------|------------|
| **superadmin** | Acesso total, gerencia todas as empresas e usuários |
| **admin** | Gerencia sua empresa, CRUD completo de dados |
| **staff** | Operações básicas (pedidos, mesas, estoque) |

```javascript
// Exemplo de proteção de rota
router.use(requireAuth);                    // Requer token válido
router.use(requireRole(['admin', 'superadmin']));  // Requer role específica
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estas etapas:

### 📝 Como Contribuir

1. **Fork o repositório**
2. **Clone seu fork**:
   ```bash
   git clone https://github.com/seu-usuario/bar_restaurante.git
   cd bar_restaurante
   ```
3. **Crie uma branch**:
   ```bash
   git checkout -b feature/minha-feature
   ```
4. **Faça suas alterações** seguindo o style guide
5. **Teste localmente**:
   ```bash
   npm start  # frontend
   cd server && npm start  # backend
   ```
6. **Commit suas mudanças**:
   ```bash
   git add .
   git commit -m "feat: adiciona funcionalidade X"
   ```
7. **Push para o GitHub**:
   ```bash
   git push origin feature/minha-feature
   ```
8. **Abra um Pull Request** descrevendo suas mudanças

### 📏 Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudar comportamento
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### 🎨 Style Guide

**JavaScript:**
- ES6+ (arrow functions, const/let, template literals)
- Sem ponto e vírgula opcional
- 2 espaços de indentação
- Nomes descritivos em camelCase

**CSS:**
- BEM ou classes descritivas
- Variáveis CSS para cores e espaçamentos
- Mobile-first (media queries de min-width)

**HTML:**
- Semântico (main, section, article, header, etc.)
- Atributos em ordem: class, id, data-*, eventos
- Acessibilidade (alt, aria-label, roles)

### 🐛 Reportando Bugs

Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) com:
- **Título claro**
- **Descrição** do problema
- **Passos para reproduzir**
- **Comportamento esperado vs atual**
- **Screenshots** (se aplicável)
- **Ambiente** (navegador, OS, versão Node)

### 💡 Solicitando Features

Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) descrevendo:
- **Problema** que a feature resolve
- **Solução proposta**
- **Alternativas consideradas**
- **Contexto adicional**

---

## 📚 Documentação Adicional

| Documento | Descrição |
|-----------|-----------|
| [INSTALL.md](INSTALL.md) | Guia de instalação detalhado |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões e mudanças |
| [RAILWAY_SETUP.md](RAILWAY_SETUP.md) | Deploy no Railway passo a passo |
| [CORRIGIR_ERRO_RAILWAY.md](CORRIGIR_ERRO_RAILWAY.md) | Troubleshooting de deploy |
| [DEPLOY_RAILWAY_COMPLETO.md](DEPLOY_RAILWAY_COMPLETO.md) | Guia completo de deploy |
| [CONFIGURACAO_API.md](CONFIGURACAO_API.md) | Configuração de conexão API |
| [MIGRACAO_API.md](MIGRACAO_API.md) | Migração de offline para cloud |

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2026 Cristiano Santos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Suporte

### 🆘 Precisa de Ajuda?

- 📖 **Documentação**: Consulte os arquivos `.md` na raiz do projeto
- 🐛 **Bugs**: [Abra uma issue](https://github.com/cristiano-superacao/bar_restaurante/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/cristiano-superacao/bar_restaurante/discussions)
- 📧 **Contato direto**: cristiano.superacao@gmail.com

### 🔗 Links Úteis

- **Repositório**: https://github.com/cristiano-superacao/bar_restaurante
- **Railway**: https://railway.app
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express Docs**: https://expressjs.com/
- **Chart.js Docs**: https://www.chartjs.org/docs/

---

## 🎯 Roadmap

### ✅ v2.2.0 (Atual)
- ✅ Validação completa com express-validator
- ✅ Rate limiting e segurança
- ✅ Dockerfile + Healthcheck
- ✅ Documentação completa

### 🚧 v2.3.0 (Próximo)
- [ ] PWA completo (offline-first)
- [ ] Push notifications
- [ ] Impressão de pedidos (thermal printer)
- [ ] Integração com WhatsApp Business API
- [ ] Relatórios em PDF

### 🔮 v3.0.0 (Futuro)
- [ ] App mobile (React Native)
- [ ] Painel administrativo avançado
- [ ] Inteligência artificial (previsão de demanda)
- [ ] Integração com delivery apps (iFood, Rappi)
- [ ] Sistema de fidelidade e cupons

---

## 🏆 Agradecimentos

- **Chart.js** - Gráficos interativos
- **Font Awesome** - Ícones incríveis
- **Railway** - Deploy simplificado
- **PostgreSQL** - Banco de dados robusto
- **Express** - Framework web minimalista
- Toda a comunidade open-source! 💚

---

## 📊 Status do Projeto

![GitHub stars](https://img.shields.io/github/stars/cristiano-superacao/bar_restaurante?style=social)
![GitHub forks](https://img.shields.io/github/forks/cristiano-superacao/bar_restaurante?style=social)
![GitHub issues](https://img.shields.io/github/issues/cristiano-superacao/bar_restaurante)
![GitHub pull requests](https://img.shields.io/github/issues-pr/cristiano-superacao/bar_restaurante)
![Last commit](https://img.shields.io/github/last-commit/cristiano-superacao/bar_restaurante)

---

<div align="center">

**🍽️ Sistema de Gestão para Bar e Restaurante**

Desenvolvido com ❤️ por [Cristiano Santos](https://github.com/cristiano-superacao)

⭐ Se este projeto foi útil, considere dar uma estrela!

[⬆ Voltar ao topo](#-sistema-de-gestão-para-bar-e-restaurante)

</div>
POST   /api/stock
PUT    /api/stock/:id
DELETE /api/stock/:id
```

#### Clientes
```
GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
```

#### Reservas
```
GET    /api/reservations
POST   /api/reservations
PUT    /api/reservations/:id
DELETE /api/reservations/:id
```

#### Transações (Financeiro)
```
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

### Autenticação e Autorização

Todas as rotas (exceto `/api/auth/login` e `/api/auth/register`) requerem token JWT:

```bash
Authorization: Bearer <token>
```

#### Roles

- **superadmin**: Acesso total, gestão de empresas
- **admin**: Gestão completa dentro da empresa
- **staff**: Operações básicas (pedidos, mesas)

#### Multi-tenant

Para **superadmin**, especifique a empresa:
```bash
X-Company-Id: 1
```

Usuários **admin** e **staff** têm contexto de empresa no JWT.

### Validação de Entrada

Todas as rotas POST/PUT validam entrada com `express-validator`:

**Exemplo de erro:**
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "msg": "Invalid value",
      "param": "price",
      "location": "body"
    }
  ]
}
```

### Rate Limiting

- **Global**: 100 requisições/15 minutos
- **Login**: 5 tentativas/15 minutos

### Segurança

- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurável
- ✅ Rate limiting anti-brute-force
- ✅ Validação de entrada em todas as rotas
- ✅ JWT com expiração
- ✅ Senhas hasheadas com bcrypt

## 🚀 Deploy

### Railway (Recomendado)

1. **Crie conta no Railway**: https://railway.app

2. **Novo Projeto**:
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório

3. **Adicione PostgreSQL**:
   - "New Service" → "Database" → "PostgreSQL"
   - Railway gerará `DATABASE_URL` automaticamente

4. **Configure Variáveis**:
   ```
   DATABASE_URL=<gerado_automaticamente>
   JWT_SECRET=<seu_segredo_32+_chars>
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://seu-frontend.com
   ```

5. **Deploy**:
   - Railway detecta automaticamente `server/`
   - Deploy acontece em cada push no GitHub

6. **URL Pública**:
   - Railway fornece URL: `https://xxx.up.railway.app`
   - Configure no frontend em **Configurações → API**

### Netlify/Vercel (Frontend)

1. Conecte seu repositório
2. Configure build:
   ```
   Base directory: /
   Build command: npm run build
   Publish directory: /
   ```
3. Deploy automático a cada push

### Docker (Opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
EXPOSE 3000
CMD ["node", "src/index.js"]
```

```bash
docker build -t bar-restaurante-api .
docker run -p 3000:3000 --env-file .env bar-restaurante-api
```

## 📚 Documentação

- **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)**: Guia detalhado de deploy no Railway
- **[MIGRACAO_API.md](MIGRACAO_API.md)**: Como ativar/desativar a API
- **[CONFIGURACAO_API.md](CONFIGURACAO_API.md)**: Configuração avançada da API
- **[CHANGELOG.md](CHANGELOG.md)**: Histórico de mudanças
- **[server/README.md](server/README.md)**: Documentação do backend

## 📂 Estrutura do Projeto

```
bar_restaurante/
├── css/                    # Estilos organizados por página
│   ├── base.css           # Estilos base compartilhados
│   ├── dashboard.css      # Layout principal
│   ├── login.css          # Página de login
│   └── ...                # Módulos específicos
├── js/                     # Scripts por módulo
│   ├── config.js          # Configuração global
│   ├── utils.js           # Utilitários compartilhados
│   ├── api.js             # Cliente HTTP multi-tenant
│   ├── auth-neon.js       # Autenticação e guards
│   ├── dashboard.js       # Sidebar e navegação
│   └── ...                # Módulos específicos
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── index.js       # Entrypoint com auto-migração
│   │   ├── db.js          # Cliente PostgreSQL
│   │   ├── middleware/    # Auth JWT
│   │   ├── routes/        # Endpoints por módulo
│   │   └── migrations/    # SQL schemas
│   ├── package.json
│   └── README.md
├── scripts/                # Scripts de validação
│   ├── validate-ui.mjs    # Validador de UI
│   └── analyze-css.mjs    # Analisador CSS
├── *.html                  # Páginas do sistema (17)
├── package.json           # Dependências frontend
├── README.md              # Este arquivo
├── DEPLOY_RAILWAY.md      # Guia de deploy
├── MIGRACAO_API.md        # Guia de migração
├── CONFIGURACAO_API.md    # Configuração avançada
├── CHANGELOG.md           # Histórico
├── LICENSE                # Licença MIT
└── manifest.json          # PWA manifest
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. Commit suas mudanças:
   ```bash
   git commit -m 'Adiciona nova funcionalidade'
   ```
4. Push para a branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. Abra um Pull Request

### Diretrizes

- Mantenha o código limpo e documentado
- Siga o padrão de código existente
- Teste suas mudanças antes de enviar
- Atualize a documentação se necessário

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (navegador, SO, versão)

## 💡 Sugestões

Tem uma ideia? Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) com a tag `enhancement`.

## 📜 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Cristiano Santos**
- GitHub: [@cristiano-superacao](https://github.com/cristiano-superacao)
- Email: contato@superacao.dev

## 🙏 Agradecimentos

- Font Awesome pelos ícones
- Chart.js pelos gráficos
- Railway pela hospedagem
- Comunidade open source

## 📊 Status do Projeto

- ✅ Frontend completo e responsivo
- ✅ Backend Express + PostgreSQL
- ✅ Autenticação JWT multi-tenant
- ✅ Validação de entrada robusta
- ✅ Segurança endurecida
- ✅ Deploy pronto para produção
- 🔄 Em desenvolvimento contínuo

## 🔮 Roadmap

- [ ] PWA completo com service worker
- [ ] Notificações push
- [ ] Integração com pagamentos
- [ ] Impressão térmica (ESC/POS)
- [ ] App mobile nativo
- [ ] Analytics e dashboards avançados
- [ ] Integração com delivery (iFood, Uber Eats)
- [ ] Gestão de comandas

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- 📧 Email: contato@superacao.dev
- 💬 Issues: [GitHub Issues](https://github.com/cristiano-superacao/bar_restaurante/issues)
- 📖 Docs: Ver arquivos de documentação no repositório

---

<div align="center">

**[⬆ Voltar ao topo](#-sistema-de-gestão-para-bar-e-restaurante)**

Feito com ❤️ por [Cristiano Santos](https://github.com/cristiano-superacao)

</div>
