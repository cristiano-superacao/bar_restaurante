# 💻 Guia de Desenvolvimento

Este guia fornece todas as informações necessárias para desenvolvedores que desejam contribuir ou customizar o sistema.

## 📋 Índice

1. [Setup do Ambiente](#setup-do-ambiente)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Padrões de Código](#padrões-de-código)
4. [Design System](#design-system)
5. [Fluxo de Trabalho](#fluxo-de-trabalho)
6. [Testes](#testes)
7. [Debug](#debug)
8. [Contribuindo](#contribuindo)

---

## Setup do Ambiente

### Pré-requisitos

- **Node.js**: 18.x ou superior
- **npm**: 9.x ou superior
- **PostgreSQL**: 14.x ou superior
- **Git**: 2.x ou superior
- **VS Code** (recomendado) com extensões:
  - ESLint
  - Prettier
  - PostgreSQL
  - Thunder Client (para testes de API)

### Clone do Repositório

```bash
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante
```

### Setup do Backend

```bash
cd server

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

**Configuração mínima do .env:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://baruser:barpassword@localhost:5432/bar_restaurante
JWT_SECRET=dev_secret_key_mínimo_32_caracteres
JWT_REFRESH_SECRET=dev_refresh_secret_diferente
FRONTEND_URL=http://localhost:8080
```

### Setup do Banco de Dados

#### Opção 1: Docker (Recomendado)

```bash
cd server
docker-compose up -d postgres
npm run migrate
```

#### Opção 2: PostgreSQL Local

```bash
# Criar database
psql -U postgres -c "CREATE DATABASE bar_restaurante;"
psql -U postgres -c "CREATE USER baruser WITH PASSWORD 'barpassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE bar_restaurante TO baruser;"

# Executar migrações
cd server
npm run migrate
```

### Iniciar Desenvolvimento

**Backend (Terminal 1)**
```bash
cd server
npm run dev
# API rodando em http://localhost:3000
```

**Frontend (Terminal 2)**
```bash
# Na raiz do projeto
npx http-server -p 8080 -c-1
# Frontend rodando em http://localhost:8080
```

### Verificar Instalação

```bash
# Health check da API
curl http://localhost:3000/api/health

# Login de teste
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"Super@2025"}'
```

Acesse http://localhost:8080 e faça login com:
- **Usuário**: superadmin
- **Senha**: Super@2025

---

## Estrutura do Projeto

```
bar_restaurante/
├── server/                      # Backend Node.js
│   ├── src/
│   │   ├── index.js            # Entry point
│   │   ├── db.js               # Conexão com PostgreSQL
│   │   ├── middleware/
│   │   │   └── auth.js         # Autenticação JWT
│   │   ├── routes/             # Rotas da API
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── companies.js
│   │   │   ├── menuItems.js
│   │   │   ├── orders.js
│   │   │   ├── tables.js
│   │   │   ├── customers.js
│   │   │   ├── reservations.js
│   │   │   ├── stock.js
│   │   │   └── transactions.js
│   │   └── migrations/
│   │       └── schema.sql      # Schema do banco
│   ├── package.json
│   └── docker-compose.yml
│
├── css/                         # Estilos
│   ├── design-system.css       # Design system centralizado (PRINCIPAL)
│   ├── dashboard.css           # Dashboard específico
│   ├── cardapio.css            # Cardápio específico
│   ├── pedidos.css             # Pedidos específico
│   ├── mesas.css               # Mesas específico
│   ├── clientes.css            # Clientes específico
│   ├── estoque.css             # Estoque específico
│   ├── financeiro.css          # Financeiro específico
│   ├── reserva.css             # Reservas específico
│   ├── delivery.css            # Delivery específico
│   ├── cupom.css               # Cupom específico (escopado)
│   ├── configuracoes.css       # Configurações específico
│   └── login.css               # Login específico (escopado)
│
├── js/                          # Scripts
│   ├── api.js                  # Cliente HTTP (fetch wrapper)
│   ├── auth-neon.js            # Gerenciamento de autenticação
│   ├── config.js               # Configurações globais
│   ├── utils.js                # Utilitários
│   ├── dashboard.js            # Lógica do dashboard
│   ├── cardapio.js             # Lógica do cardápio
│   ├── pedidos.js              # Lógica de pedidos
│   ├── mesas.js                # Lógica de mesas
│   ├── clientes.js             # Lógica de clientes
│   ├── estoque.js              # Lógica de estoque
│   ├── financeiro.js           # Lógica financeira
│   ├── reserva.js              # Lógica de reservas
│   ├── delivery.js             # Lógica de delivery
│   ├── cupom.js                # Lógica de cupom
│   ├── configuracoes.js        # Lógica de configurações
│   ├── usuarios.js             # Lógica de usuários
│   ├── empresas.js             # Lógica de empresas
│   └── login.js                # Lógica de login
│
├── docs/                        # Documentação
│   ├── ARCHITECTURE.md         # Arquitetura do sistema
│   ├── API.md                  # Documentação da API
│   ├── DEPLOYMENT.md           # Guias de deploy
│   └── DEVELOPMENT.md          # Este arquivo
│
├── scripts/                     # Scripts utilitários
│   ├── validate-ui.mjs         # Validação de UI
│   └── analyze-css.mjs         # Análise de CSS
│
├── *.html                       # Páginas principais
├── *-old.html                   # Backups (não editar)
├── sw.js                        # Service Worker (PWA)
├── manifest.json                # Manifest (PWA)
├── package.json                 # Metadados do frontend
├── README.md                    # Documentação principal
└── CHANGELOG.md                 # Histórico de versões
```

---

## Padrões de Código

### JavaScript

#### Convenções de Nomenclatura

```javascript
// Variáveis e funções: camelCase
const userName = 'João';
function getUserData() { }

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.exemplo.com';
const MAX_RETRY_ATTEMPTS = 3;

// Classes: PascalCase
class UserManager { }

// Arquivos: kebab-case
// pedidos-controller.js, user-service.js
```

#### Async/Await

```javascript
// ✅ BOM: Usar async/await
async function fetchUsers() {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}

// ❌ EVITAR: Promises encadeadas
function fetchUsers() {
  return api.get('/users')
    .then(response => response.data)
    .catch(error => {
      console.error('Erro:', error);
      throw error;
    });
}
```

#### Error Handling

```javascript
// ✅ BOM: Try-catch com mensagens específicas
async function createOrder(orderData) {
  try {
    const response = await api.post('/orders', orderData);
    showSuccessMessage('Pedido criado com sucesso!');
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      showErrorMessage('Dados do pedido inválidos');
    } else if (error.response?.status === 401) {
      showErrorMessage('Sessão expirada. Faça login novamente.');
      redirectToLogin();
    } else {
      showErrorMessage('Erro ao criar pedido. Tente novamente.');
    }
    throw error;
  }
}
```

#### API Client (api.js)

```javascript
// ✅ Sempre usar o wrapper api.js
import { api } from './api.js';

// GET
const users = await api.get('/users');

// POST
const newUser = await api.post('/users', { username: 'maria', ... });

// PUT
const updated = await api.put('/users/5', { username: 'maria_updated' });

// DELETE
await api.delete('/users/5');

// ❌ NÃO usar fetch diretamente
const response = await fetch(API_BASE_URL + '/users', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### CSS

#### Arquitetura

O projeto usa **Design System centralizado** em `css/design-system.css`:

```css
/* design-system.css contém: */
:root { /* CSS Variables */ }
.app-shell { /* Layout principal */ }
.sidebar { /* Sidebar */ }
.app-footer { /* Footer */ }
.btn-* { /* Botões */ }
.badge-* { /* Badges */ }
/* ... componentes globais ... */
```

**CSS específico de página** deve:
1. Escopar seletores quando possível:

```css
/* ✅ BOM: Escopado */
body.page-cupom .cupom-container { }

/* ❌ EVITAR: Global */
.cupom-container { }
```

2. Usar nomenclatura BEM para componentes:

```css
/* Bloco */
.order-card { }

/* Elemento */
.order-card__header { }
.order-card__title { }

/* Modificador */
.order-card--pending { }
.order-card--delivered { }
```

#### CSS Variables

```css
/* ✅ Usar variáveis do design system */
.custom-button {
  background: var(--primary-600);
  color: var(--white);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}

/* ❌ EVITAR: Hard-coded values */
.custom-button {
  background: #2563eb;
  color: white;
  border-radius: 8px;
  padding: 12px 16px;
}
```

#### Responsividade

```css
/* Mobile-first */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### HTML

#### Estrutura de Página

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página - Bar & Restaurante</title>
  
  <!-- Design System (SEMPRE primeiro) -->
  <link rel="stylesheet" href="css/design-system.css">
  
  <!-- CSS específico da página -->
  <link rel="stylesheet" href="css/minha-pagina.css">
  
  <!-- PWA -->
  <link rel="manifest" href="manifest.json">
</head>
<body class="page-minha-pagina">
  <!-- App Shell -->
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- ... sidebar content ... -->
    </aside>
    
    <!-- Main Content -->
    <main class="main-content">
      <div class="page-header">
        <h1 class="page-title">Título da Página</h1>
      </div>
      
      <div class="page-content">
        <!-- Conteúdo principal -->
      </div>
    </main>
  </div>
  
  <!-- Footer -->
  <footer class="app-footer">
    <!-- ... footer content ... -->
  </footer>
  
  <!-- Scripts -->
  <script type="module" src="js/auth-neon.js"></script>
  <script type="module" src="js/minha-pagina.js"></script>
</body>
</html>
```

#### Acessibilidade

```html
<!-- ✅ BOM: Semântica e ARIA -->
<button 
  class="btn-primary" 
  aria-label="Adicionar novo item ao cardápio"
  onclick="openAddItemModal()">
  <i class="fas fa-plus" aria-hidden="true"></i>
  Adicionar Item
</button>

<nav aria-label="Navegação principal">
  <ul>
    <li><a href="dashboard.html">Dashboard</a></li>
  </ul>
</nav>

<!-- ❌ EVITAR: Falta de semântica -->
<div class="btn" onclick="openAddItemModal()">
  <i class="fas fa-plus"></i>
  Adicionar Item
</div>
```

---

## Design System

### Paleta de Cores

```css
/* Primária (Azul) */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-600: #2563eb;
--primary-900: #1e3a8a;
--primary-950: #172554;

/* Neutros */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Semântica */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;

--danger-50: #fef2f2;
--danger-500: #ef4444;

--warning-50: #fffbeb;
--warning-500: #f59e0b;

--info-50: #eff6ff;
--info-500: #3b82f6;
```

### Tipografia

```css
--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Espaçamento

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Componentes

#### Botões

```html
<!-- Primário -->
<button class="btn-primary">
  <i class="fas fa-save"></i>
  Salvar
</button>

<!-- Secundário -->
<button class="btn-secondary">Cancelar</button>

<!-- Danger -->
<button class="btn-danger">Deletar</button>

<!-- Success -->
<button class="btn-success">Confirmar</button>
```

#### Badges

```html
<span class="badge-success">Pago</span>
<span class="badge-warning">Pendente</span>
<span class="badge-danger">Cancelado</span>
<span class="badge-info">Em Preparo</span>
```

#### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título do Card</h3>
  </div>
  <div class="card-body">
    <!-- Conteúdo -->
  </div>
  <div class="card-footer">
    <button class="btn-primary">Ação</button>
  </div>
</div>
```

---

## Fluxo de Trabalho

### Git Workflow

```bash
# 1. Criar branch para feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug

# 2. Fazer commits atômicos
git add arquivo1.js arquivo2.css
git commit -m "feat: adicionar filtro de pedidos por status"

# 3. Push para remoto
git push origin feature/nome-da-feature

# 4. Criar Pull Request no GitHub

# 5. Após aprovação, merge para main
git checkout main
git pull origin main
git merge feature/nome-da-feature
git push origin main

# 6. Deletar branch local
git branch -d feature/nome-da-feature
```

### Mensagens de Commit (Conventional Commits)

```bash
# Feature
git commit -m "feat: adicionar busca de clientes por telefone"

# Fix
git commit -m "fix: corrigir cálculo de total do pedido"

# Docs
git commit -m "docs: atualizar README com instruções de deploy"

# Style
git commit -m "style: ajustar espaçamento do dashboard"

# Refactor
git commit -m "refactor: extrair lógica de validação para utils"

# Test
git commit -m "test: adicionar testes para autenticação"

# Chore
git commit -m "chore: atualizar dependências do backend"
```

---

## Testes

### Backend

#### Testes Manuais (Thunder Client/Postman)

**Collection de testes**: `server/tests/api-tests.json` (criar)

**Exemplo de teste de Login:**
```json
{
  "name": "Login - Sucesso",
  "method": "POST",
  "url": "{{baseUrl}}/api/auth/login",
  "body": {
    "username": "superadmin",
    "password": "Super@2025"
  },
  "tests": [
    {
      "type": "status",
      "value": 200
    },
    {
      "type": "json-query",
      "path": "$.accessToken",
      "exists": true
    }
  ]
}
```

#### Testes Automatizados (Futuro)

```bash
# Instalar Jest
npm install --save-dev jest supertest

# Executar testes
npm test
```

**Exemplo de teste (server/tests/auth.test.js):**
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('Auth Routes', () => {
  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'superadmin', password: 'Super@2025' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
```

### Frontend

#### Validação de UI

```bash
# Verificar estrutura HTML e links
node scripts/validate-ui.mjs

# Analisar duplicidades CSS
node scripts/analyze-css.mjs
```

#### Testes Manuais

**Checklist de teste:**
- [ ] Login funciona
- [ ] Navegação entre páginas
- [ ] CRUD de cada módulo (criar, editar, deletar)
- [ ] Responsividade (mobile, tablet, desktop)
- [ ] Tratamento de erros (API offline, sessão expirada)
- [ ] PWA (instalar, funcionar offline)

---

## Debug

### Backend

#### Logs

```javascript
// Adicionar logs detalhados
console.log('[DEBUG] Request:', req.body);
console.log('[DEBUG] User:', req.user);
console.log('[DEBUG] Query result:', result.rows);
```

#### Node.js Debugger

```bash
# Iniciar com debugger
node --inspect src/index.js

# Ou usar VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "program": "${workspaceFolder}/server/src/index.js",
  "envFile": "${workspaceFolder}/server/.env"
}
```

### Frontend

#### Console do Navegador

```javascript
// Logs estruturados
console.group('Fetch Users');
console.log('Request:', endpoint);
console.log('Response:', data);
console.groupEnd();

// Tabelas
console.table(orders);

// Timers
console.time('Load Orders');
await loadOrders();
console.timeEnd('Load Orders');
```

#### Network Tab

1. Abrir DevTools (F12)
2. Aba "Network"
3. Filtrar por "Fetch/XHR"
4. Verificar:
   - Status Code
   - Request Headers (Authorization)
   - Response Body

---

## Contribuindo

### Reportar Bugs

Abra uma **Issue** no GitHub com:
- **Título**: Breve descrição do bug
- **Descrição**: Passos para reproduzir, comportamento esperado vs. atual
- **Ambiente**: SO, navegador, versão
- **Screenshots**: Se aplicável

### Sugerir Features

Abra uma **Issue** com:
- **Título**: [Feature] Nome da funcionalidade
- **Descrição**: Caso de uso, benefícios
- **Mockups**: Se tiver

### Pull Requests

1. Fork do repositório
2. Crie branch (`feature/minha-feature`)
3. Commit das mudanças
4. Push para o branch
5. Abra Pull Request com:
   - Descrição clara das mudanças
   - Referência a Issues relacionadas
   - Screenshots (se mudanças visuais)

---

## 📚 Recursos Adicionais

- [Documentação da API](API.md)
- [Guia de Deploy](DEPLOYMENT.md)
- [Arquitetura do Sistema](ARCHITECTURE.md)
- [README Principal](../README.md)

---

**Última atualização**: 12 de janeiro de 2026  
**Versão**: 3.0.0

**Dúvidas?** Abra uma Issue no GitHub!
