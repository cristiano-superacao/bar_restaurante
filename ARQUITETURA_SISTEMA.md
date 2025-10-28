# 🏗️ Arquitetura do Sistema - Maria Flor

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Cliente)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  index.html  │  │ dashboard.html│ │  pages/*.html│              │
│  │   (Login)    │  │  (Principal)  │ │   (Módulos)  │              │
│  └──────┬───────┘  └──────┬────────┘ └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┼──────────────────┘                       │
│                          │                                           │
│  ┌──────────────────────▼──────────────────────┐                    │
│  │        JavaScript Modules                    │                    │
│  │  ┌──────────────┐  ┌─────────────────────┐ │                    │
│  │  │ auth-neon.js │  │   dashboard.js      │ │                    │
│  │  │  (Auth Sys)  │  │   mesas.js          │ │                    │
│  │  └──────────────┘  └─────────────────────┘ │                    │
│  │         │                    │               │                    │
│  │         └────────Fetch API───┘               │                    │
│  └──────────────────────┬──────────────────────┘                    │
│                         │                                            │
└─────────────────────────┼────────────────────────────────────────────┘
                          │ HTTPS
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NETLIFY (Hospedagem)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Netlify Functions (Serverless)                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │          netlify/functions/server.js                     ││   │
│  │  │                                                           ││   │
│  │  │  Routes:                                                  ││   │
│  │  │  • POST /auth/login  → authenticateUser()               ││   │
│  │  │  • GET  /dashboard   → getDashboardData()               ││   │
│  │  │  • GET  /test        → health check                     ││   │
│  │  │  • GET  /users       → listUsers()                      ││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │ @neondatabase/serverless
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NODE.JS API (Express)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  server.js  ──►  api/routes.js  ──┐                                 │
│                                    │                                 │
│  Rotas:                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  /api/auth     ──► api/auth.js                              │   │
│  │    • POST /login                                             │   │
│  │    • POST /register                                          │   │
│  │    • GET  /verify                                            │   │
│  │    • GET  /users                                             │   │
│  │                                                               │   │
│  │  /api/sales    ──► api/sales.js                             │   │
│  │    • GET  /                                                  │   │
│  │    • POST /                                                  │   │
│  │    • GET  /:id                                               │   │
│  │    • PUT  /:id                                               │   │
│  │                                                               │   │
│  │  /api/products ──► api/products.js                          │   │
│  │    • GET  /                                                  │   │
│  │    • POST /                                                  │   │
│  │    • GET  /:id                                               │   │
│  │    • PUT  /:id                                               │   │
│  │    • DELETE /:id                                             │   │
│  │    • GET  /categories/list                                   │   │
│  │                                                               │   │
│  │  /api/orders   ──► api/orders.js                            │   │
│  │    • GET  /                                                  │   │
│  │    • POST /                                                  │   │
│  │    • GET  /:id                                               │   │
│  │    • PUT  /:id/status                                        │   │
│  │    • DELETE /:id                                             │   │
│  │                                                               │   │
│  │  /api/reports  ──► api/reports.js                           │   │
│  │    • GET  /dashboard                                         │   │
│  │    • GET  /financial                                         │   │
│  │    • GET  /sales                                             │   │
│  │    • GET  /inventory                                         │   │
│  │                                                               │   │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │ @neondatabase/serverless
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NEON DATABASE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Tabelas de Autenticação:                                           │
│  ┌────────────┐  ┌─────────────┐                                   │
│  │   users    │  │  usuarios   │                                   │
│  └────────────┘  └─────────────┘                                   │
│                                                                       │
│  Tabelas de Produtos:                                               │
│  ┌────────────┐  ┌─────────────┐                                   │
│  │ categories │  │  products   │                                   │
│  └────────────┘  └─────────────┘                                   │
│                                                                       │
│  Tabelas de Vendas:                                                 │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐                │
│  │ customers  │  │   sales     │  │  sale_items  │                │
│  └────────────┘  └─────────────┘  └──────────────┘                │
│                                                                       │
│  Tabelas de Pedidos:                                                │
│  ┌────────────┐  ┌─────────────┐                                   │
│  │   orders   │  │ order_items │                                   │
│  └────────────┘  └─────────────┘                                   │
│                                                                       │
│  Tabelas de Estoque:                                                │
│  ┌────────────────────┐                                             │
│  │  stock_movements   │                                             │
│  └────────────────────┘                                             │
│                                                                       │
│  Tabelas de Compras:                                                │
│  ┌────────────┐  ┌─────────────┐  ┌────────────────┐              │
│  │ suppliers  │  │  purchases  │  │ purchase_items │              │
│  └────────────┘  └─────────────┘  └────────────────┘              │
│                                                                       │
│  Tabelas Financeiras:                                               │
│  ┌────────────┐  ┌─────────────┐                                   │
│  │  expenses  │  │  settings   │                                   │
│  └────────────┘  └─────────────┘                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

### 1. Autenticação (Login)
```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│ Cliente │────►│ auth-neon.js │────►│ /auth/login │────►│ Database │
└─────────┘     └──────────────┘     └─────────────┘     └──────────┘
     ▲                                        │
     │                                        ▼
     │                                 ┌──────────────┐
     └─────────────────────────────────│  JWT Token   │
                                       └──────────────┘
```

### 2. CRUD de Produtos
```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌──────────┐
│ Cliente │────►│ Fetch API  │────►│ /api/products│────►│ Database │
└─────────┘     └────────────┘     └──────────────┘     └──────────┘
     ▲                                        │
     │                                        ▼
     │                                 ┌──────────────┐
     └─────────────────────────────────│  Response    │
                                       └──────────────┘
```

### 3. Criação de Pedidos
```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│ Cliente │────►│ Fetch API  │────►│ /api/orders │────►│ Database │
│ (Mesa)  │     └────────────┘     └─────────────┘     │ orders + │
└─────────┘                                             │ items    │
     ▲                                                  └──────────┘
     │                                                       │
     │                                                       ▼
     │                                             ┌──────────────────┐
     └─────────────────────────────────────────────│ Order Created ID │
                                                   └──────────────────┘
```

### 4. Relatórios Dashboard
```
┌─────────┐     ┌────────────┐     ┌──────────────────┐     ┌──────────┐
│Dashboard│────►│ Fetch API  │────►│ /api/reports/    │────►│ Database │
│  Page   │     └────────────┘     │    dashboard     │     │ (agregado)│
└─────────┘                        └──────────────────┘     └──────────┘
     ▲                                        │
     │                                        ▼
     │                                 ┌──────────────┐
     └─────────────────────────────────│ Estatísticas │
                                       │ • Vendas     │
                                       │ • Pedidos    │
                                       │ • Top 5      │
                                       └──────────────┘
```

## 🔐 Segurança

### Camadas de Segurança:

1. **Frontend:**
   - Token JWT armazenado em LocalStorage
   - Validação de campos
   - Sanitização de inputs

2. **API:**
   - Verificação de token JWT
   - Validação de dados de entrada
   - Rate limiting (Netlify)
   - CORS configurado

3. **Banco de Dados:**
   - Conexão SSL/TLS (Neon)
   - Senhas com BCrypt (hash)
   - Prepared statements (SQL injection protection)
   - Validações de tipo

### Autenticação JWT:
```
┌─────────────────────────────────────────────────────────┐
│  JWT Token Components:                                  │
│                                                          │
│  Header:                                                │
│  {                                                       │
│    "alg": "HS256",                                      │
│    "typ": "JWT"                                         │
│  }                                                       │
│                                                          │
│  Payload:                                               │
│  {                                                       │
│    "id": 1,                                             │
│    "username": "admin",                                 │
│    "email": "admin@mariaflor.com.br",                  │
│    "role": "admin",                                     │
│    "iat": 1234567890,                                   │
│    "exp": 1234654290                                    │
│  }                                                       │
│                                                          │
│  Signature: HMACSHA256(                                 │
│    base64UrlEncode(header) + "." +                      │
│    base64UrlEncode(payload),                            │
│    JWT_SECRET                                           │
│  )                                                       │
└─────────────────────────────────────────────────────────┘
```

## 📊 Modelo de Dados Simplificado

```
users/usuarios
    ├── sales (1:N)
    │   └── sale_items (1:N)
    │       └── products (N:1)
    │
    ├── orders (1:N)
    │   └── order_items (1:N)
    │       └── products (N:1)
    │
    ├── purchases (1:N)
    │   └── purchase_items (1:N)
    │       └── products (N:1)
    │
    └── expenses (1:N)

products
    ├── category (N:1)
    ├── stock_movements (1:N)
    ├── sale_items (1:N)
    ├── order_items (1:N)
    └── purchase_items (1:N)

customers
    └── sales (1:N)

suppliers
    └── purchases (1:N)
```

## 🚀 Deploy e Infraestrutura

```
┌────────────────────────────────────────────────────────┐
│                    GitHub Repository                    │
│         https://github.com/cristiano-superacao/        │
│                  bar_restaurante                        │
└───────────────────┬────────────────────────────────────┘
                    │ Git Push
                    ▼
┌────────────────────────────────────────────────────────┐
│                  Netlify (Auto Deploy)                  │
│  • Build automático                                     │
│  • Deploy em CDN global                                │
│  • HTTPS automático                                     │
│  • Variáveis de ambiente                               │
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│            Production URL                               │
│       https://barestaurente.netlify.app                │
└────────────────────────────────────────────────────────┘
```

## 📈 Escalabilidade

### Horizontal:
- ✅ Netlify Functions (Serverless)
- ✅ Neon Database (Auto-scaling)
- ✅ CDN Global (Netlify)

### Vertical:
- ✅ Neon: Upgrade de plano
- ✅ Netlify: Upgrade de plano
- ✅ Otimizações de query

## 🎯 Performance

### Frontend:
- Cache de assets estáticos
- Minificação de JS/CSS
- Lazy loading de imagens
- Service Worker (PWA ready)

### Backend:
- Conexões serverless (Neon)
- Cache de queries frequentes
- Índices no banco de dados
- Queries otimizadas

### Database:
- Índices em colunas críticas
- Queries com LIMIT
- Agregações otimizadas
- Connection pooling (Neon)

---

**Última atualização:** 2024  
**Versão do Sistema:** 2.0.0  
**Arquiteto:** Cristiano Santos
