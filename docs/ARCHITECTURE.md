# 🏗️ Arquitetura do Sistema

## Visão Geral

Sistema de gestão completo para bares e restaurantes com **arquitetura híbrida progressiva** e **design system Premium com gradiente azul**. O sistema opera em três modos distintos, permitindo flexibilidade total na implantação.

## 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (SPA)                          │
│  HTML5 + CSS3 + Vanilla JavaScript + Design System Azul    │
│  ├── PWA (Service Worker + Manifest)                       │
│  ├── LocalStorage (Modo Offline)                           │
│  └── API Client (Detecção Automática Backend)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS + JWT
                     │
┌────────────────────┴────────────────────────────────────────┐
│                   BACKEND (API REST)                        │
│  Node.js + Express + JWT Authentication                     │
│  ├── Rate Limiting (100 req/15min global)                  │
│  ├── Helmet (Security Headers)                             │
│  ├── CORS (Configurável)                                   │
│  ├── Express Validator (Validação de dados)                │
│  └── PostgreSQL Client (node-postgres)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL/TCP
                     │
┌────────────────────┴────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                     │
│  ├── Multi-tenant (company_id isolation)                   │
│  ├── RBAC (superadmin, admin, staff)                       │
│  ├── Funções Operacionais (Caixa, Cozinha, Motoboy, etc)  │
│  └── Migrations Idempotentes                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Design System Premium Azul

### Paleta de Cores Principal

```css
/* Azul Principal (Sidebar e elementos primários) */
--primary-900: #1e3a8a;  /* Azul escuro base */
--primary-950: #172554;  /* Azul quase preto */
--primary-700: #1d4ed8;  /* Azul escuro hover */
--primary-600: #2563eb;  /* Azul médio */
--primary-500: #3b82f6;  /* Azul médio claro */
--primary-300: #93c5fd;  /* Azul claro */
--primary-200: #bfdbfe;  /* Azul muito claro */

/* Tons Neutros */
--gray-50: #f8fafc;      /* Fundo body claro */
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-600: #475569;
--gray-900: #0f172a;

/* Cores Semânticas */
--success-100: #dcfce7;  /* Verde claro (badges) */
--success-700: #15803d;  /* Verde escuro */
--warning-500: #f59e0b;
--error-500: #ef4444;
```

### Componentes Principais

- **Sidebar**: Gradiente azul (180deg, #1e3a8a → #172554)
- **Footer**: Gradiente azul (135deg, #1e3a8a → #172554)
- **Botões Primários**: Gradiente azul (135deg, #3b82f6 → #2563eb)
- **Cards**: Fundo branco com borda cinza-200 e sombra sutil
- **Inputs Focus**: Border azul (#3b82f6) com box-shadow

## 🗂️ Estrutura de Pastas

```
bar_restaurante-main/
├── css/                        # Estilos do frontend
│   ├── design-system.css      # Design System (app shell + footer azul)
│   ├── sidebar-azul.css       # Tema Premium (stub para overrides)
│   ├── base.css               # Legacy (importa design-system)
│   ├── login.css              # Login específico
│   ├── dashboard.css          # Dashboard específico
│   ├── cupom.css              # Cupom/impressão (escopado)
│   ├── fixes.css              # Legacy (neutralizado)
│   └── [outros módulos].css  # Estilos específicos por página
├── js/                         # Scripts do frontend
│   ├── auth-neon.js           # Autenticação + logout centralizado
│   ├── api.js                 # API client (detecção auto backend)
│   ├── dashboard.js           # App shell (menu/overlay/user display)
│   ├── config.js              # Configurações (API URLs)
│   ├── utils.js               # Utilidades (formatação, validação)
│   └── [módulos].js           # Lógica específica por página
├── server/                     # Backend Node.js
│   ├── src/
│   │   ├── index.js           # Servidor Express principal
│   │   ├── db.js              # Cliente PostgreSQL
│   │   ├── migrate.js         # Executor de migrações
│   │   ├── middleware/
│   │   │   └── auth.js        # Middleware JWT
│   │   ├── migrations/
│   │   │   └── schema.sql     # Schema completo
│   │   └── routes/            # Rotas da API
│   │       ├── auth.js        # Login, refresh token
│   │       ├── users.js       # CRUD usuários
│   │       ├── companies.js   # CRUD empresas
│   │       ├── menuItems.js   # Cardápio
│   │       ├── orders.js      # Pedidos
│   │       ├── tables.js      # Mesas
│   │       ├── customers.js   # Clientes
│   │       ├── reservations.js# Reservas
│   │       ├── stock.js       # Estoque
│   │       └── transactions.js# Transações financeiras
│   ├── package.json           # Dependências backend
│   └── README.md              # Docs do backend
├── scripts/                    # Scripts de validação
│   ├── validate-ui.mjs        # Validador de UI (CSS/HTML)
│   └── analyze-css.mjs        # Analisador de duplicidades CSS
├── docs/                       # Documentação (nova)
│   ├── ARCHITECTURE.md        # Este arquivo
│   ├── API.md                 # Documentação completa da API
│   ├── DEPLOYMENT.md          # Guias de deploy
│   └── DEVELOPMENT.md         # Guia para desenvolvedores
├── [páginas].html             # Páginas principais (16 no total)
├── [páginas]-old.html         # Backup das páginas antigas
├── index.html                 # Tela de login
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker
├── favicon.svg                # Ícone do sistema
├── Dockerfile                 # Imagem Docker otimizada
├── railway.json               # Config Railway
├── package.json               # Frontend package
└── README.md                  # Documentação principal
```

## 🔄 Fluxo de Dados

### Modo Offline (LocalStorage)

```
User Action → Frontend JS → LocalStorage API
                            ↓
                       Persist Data
                            ↓
                       UI Update
```

### Modo Cloud (PostgreSQL)

```
User Action → Frontend JS → JWT Token Check
                            ↓
                       API Request (fetch)
                            ↓
                       Express Router
                            ↓
                       Auth Middleware (verify JWT)
                            ↓
                       express-validator
                            ↓
                       Database Query (PostgreSQL)
                            ↓
                       JSON Response
                            ↓
                       UI Update
```

## 🔐 Segurança

### Autenticação JWT

- **Access Token**: Expiração 24h
- **Refresh Token**: Expiração 7 dias
- **Armazenamento**: LocalStorage (accessToken, refreshToken)
- **Header**: `Authorization: Bearer <token>`

### Roles e Permissões

| Role | Acesso | Restrições |
|------|--------|------------|
| **superadmin** | Global (todas empresas) | Pode criar/editar empresas e admins |
| **admin** | Empresa específica | Pode criar/editar staff da sua empresa |
| **staff** | Empresa específica | CRUD limitado (não gerencia usuários) |

### Funções Operacionais

- **Caixa**: Operador de caixa/pagamentos
- **Cozinha**: Equipe de cozinha
- **Motoboy**: Entregadores (exibidos no select de delivery)
- **Supervisor**: Supervisores operacionais
- **Garçom**: Atendimento/mesas

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

#### companies (Multi-tenant)
```sql
id SERIAL PRIMARY KEY
name VARCHAR(255) NOT NULL UNIQUE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### users (Autenticação + RBAC + Funções)
```sql
id SERIAL PRIMARY KEY
username VARCHAR(255) NOT NULL UNIQUE
password_hash TEXT NOT NULL
role VARCHAR(50) DEFAULT 'staff' -- superadmin, admin, staff
function VARCHAR(50) -- Caixa, Cozinha, Motoboy, Supervisor, Garçom
company_id INTEGER REFERENCES companies(id)
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### menu_items (Cardápio)
```sql
id SERIAL PRIMARY KEY
name VARCHAR(255) NOT NULL
description TEXT
price DECIMAL(10,2) NOT NULL
category VARCHAR(100)
image_url TEXT
is_available BOOLEAN DEFAULT true
company_id INTEGER REFERENCES companies(id)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### orders (Pedidos)
```sql
id SERIAL PRIMARY KEY
order_number VARCHAR(50) UNIQUE
customer_id INTEGER REFERENCES customers(id)
table_id INTEGER REFERENCES tables(id)
delivery_driver VARCHAR(255) -- Nome do motoboy (para delivery)
order_type VARCHAR(50) -- 'dine-in', 'delivery', 'takeout'
status VARCHAR(50) DEFAULT 'pending'
total_amount DECIMAL(10,2) NOT NULL
company_id INTEGER REFERENCES companies(id)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

> Mais detalhes: `server/src/migrations/schema.sql`

## 🚀 Deploy

### Estratégias de Deploy

#### 1. Frontend Estático (Netlify/Vercel)
- Build: Não necessário (site estático)
- Deploy: Drag & drop ou Git push
- CDN: Global
- HTTPS: Automático

#### 2. Backend API (Railway)
- Runtime: Node.js 18+
- Database: PostgreSQL 14+
- Health Check: `/api/health`
- Migrations: Automáticas no start

#### 3. Docker (Qualquer provedor)
- Dockerfile otimizado multi-stage
- Healthcheck integrado
- Variáveis de ambiente configuráveis

> Mais detalhes: `docs/DEPLOYMENT.md`

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5, CSS3 (Design System Premium Azul)
- Vanilla JavaScript (ES6+)
- Font Awesome 6.4.0
- Chart.js (relatórios)
- Service Worker (PWA)

### Backend
- Node.js 18+
- Express 4.18+
- PostgreSQL 14+
- JWT (jsonwebtoken)
- bcryptjs (hash de senhas)
- express-validator
- helmet (security headers)
- express-rate-limit

### DevOps
- Docker
- Railway (Backend)
- Netlify (Frontend)
- Git + GitHub

## 📊 Performance

### Métricas Esperadas

- **Frontend**: < 2s (First Contentful Paint)
- **API Response**: < 200ms (média)
- **Database Queries**: < 50ms (queries otimizadas com índices)
- **Lighthouse Score**: > 90 (Performance, Accessibility, Best Practices)

### Otimizações Aplicadas

- CSS minificado e centralizado (design-system)
- Scripts carregados via `defer`
- Service Worker para cache offline
- Índices de banco de dados em colunas chave
- Rate limiting para prevenir DDoS
- Compressão Gzip no backend

## 🧪 Testes e Validação

### Scripts de Validação

```bash
# Validar consistência de UI (CSS/HTML)
node scripts/validate-ui.mjs

# Analisar duplicidades de CSS
node scripts/analyze-css.mjs
```

### Resultados Esperados

- ✅ Nenhuma duplicidade de seletor CSS
- ✅ Todas as páginas com design-system.css
- ✅ Sidebar com tema azul carregado
- ✅ Validação de UI sem problemas

## 🔄 Roadmap de Evolução

### Próximas Funcionalidades
- [ ] Relatórios PDF exportáveis
- [ ] Integração com APIs de pagamento
- [ ] Sistema de notificações push (PWA)
- [ ] Dashboard em tempo real (WebSockets)
- [ ] App mobile nativo (React Native)
- [ ] Módulo de CRM avançado

### Melhorias Técnicas
- [ ] Testes automatizados (Jest + Playwright)
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Sentry
- [ ] Logs centralizados
- [ ] Backup automático de banco de dados

---

**Última atualização**: 12 de janeiro de 2026  
**Versão do sistema**: 3.0.0 (Design Premium Azul)
