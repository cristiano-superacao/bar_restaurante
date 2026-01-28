# 🍽️ Sistema de Gestão para Bar e Restaurante

[![Version](https://img.shields.io/badge/version-3.0.0-brightgreen.svg)](https://github.com/cristiano-superacao/bar_restaurante)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Railway](https://img.shields.io/badge/deploy-Railway-purple.svg)](https://railway.app)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-blue.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)](Dockerfile)

> 🚀 **Sistema completo de gestão empresarial** para bares e restaurantes com **arquitetura híbrida progressiva** e **Design Premium Azul profissional**. Opera 100% offline (LocalStorage) ou com backend robusto (Express + PostgreSQL). Interface responsiva, moderna e pronta para produção.

📍 **Demo Online**: [barestaurante.up.railway.app](https://barestaurante.up.railway.app)  
📍 **API Backend**: [barestaurante.up.railway.app/api/health](https://barestaurante.up.railway.app/api/health)  
📍 **Repositório**: [github.com/cristiano-superacao/bar_restaurante](https://github.com/cristiano-superacao/bar_restaurante)

---

## ✨ Novidades da Versão 3.0.0

### 🎨 Design Premium Azul Profissional
- **Nova Paleta de Cores Azul Premium**: Sistema visual renovado com azul profissional (#1e3a8a → #172554) na sidebar
- **Design System Centralizado**: Todo o tema unificado em `css/design-system.css` para manutenção simplificada
- **Zero Duplicidades CSS**: Eliminação completa de duplicações entre arquivos CSS
- **Sidebar e Footer Premium**: Gradientes azuis sofisticados, sombras sutis e animações fluidas
- **16 Páginas Atualizadas**: Todas as interfaces seguem o novo padrão visual Premium
- **Responsividade Aprimorada**: Layout profissional otimizado para desktop, tablet e mobile

### 🧹 Refatoração e Organização
- **CSS Inline Eliminado**: Todo CSS do cupom migrado para arquivo dedicado (cupom.css)
- **Escopo de Estilos**: Login e cupom com escopo próprio (body.login-page, body.page-cupom)
- **Estrutura docs/**: Nova pasta com documentação profissional completa
  - [ARCHITECTURE.md](docs/ARCHITECTURE.md): Arquitetura completa do sistema
  - [API.md](docs/API.md): Documentação detalhada da API REST
  - [DEPLOYMENT.md](docs/DEPLOYMENT.md): Guias de deploy (Railway, Netlify, Docker)
  - [DEVELOPMENT.md](docs/DEVELOPMENT.md): Guia para desenvolvedores
- **Validações Automatizadas**: Scripts de validação de UI e análise de CSS

### 👨‍💼 Sistema de Funções Operacionais (Mantido)
- **Campo `function` em Users**: Caixa, Cozinha, Motoboy, Supervisor, Garçom
- **Badges Coloridas**: Identificação visual por função operacional
- **Filtros por Função**: Select de motoboy no delivery lista apenas usuários com função "Motoboy"

### 🛵 Melhorias no Delivery (Mantidas)
- **Campo Motoboy Obrigatório**: Seleção de motoboy responsável pelo pedido
- **Impressão em Duas Vias**: Confirmação automática para imprimir segunda via
- **Nome do Motoboy no Cupom**: Identificação clara no documento fiscal

### 🎯 Tratamento de Erros Padronizado (Mantido)
- **Mensagens Inline**: Substituição de `alert()` por blocos de erro dentro dos modais
- **Validações Client-Side**: Feedback imediato antes de enviar ao backend
- **Detalhes da API**: Exibição de mensagens detalhadas do servidor

---

## 📋 Índice

- [✨ Visão Geral](#-visão-geral)
- [🎨 Novidades da Versão 2.3.0](#-novidades-da-versão-230)
- [🎯 Funcionalidades Principais](#-funcionalidades-principais)
- [🏗️ Arquitetura do Sistema](#️-arquitetura-do-sistema)
- [⚡ Início Rápido](#-início-rápido)
- [🔧 Stack Tecnológica](#-stack-tecnológica)
- [📦 Instalação Detalhada](#-instalação-detalhada)
- [🚀 Deploy em Produção](#-deploy-em-produção)
- [📖 Documentação da API](#-documentação-da-api)
- [🔒 Segurança e Boas Práticas](#-segurança-e-boas-práticas)
- [🤝 Como Contribuir](#-como-contribuir)
- [📄 Licença](#-licença)
- [📞 Suporte e Contato](#-suporte-e-contato)

---

## ✨ Visão Geral

Sistema profiPremium Azul**: Sidebar azul sofisticada, gradientes, sombras e animações profissionais
- ✅ **Zero Duplicidades CSS**: Código limpo e centralizado no design-system.css
- ✅ **Documentação Completa**: Arquitetura, API, Deploy e Development guides em docs/ign system verde profissional**, permitindo operação em múltiplos cenários e facilitando a transição gradual para cloud.

### 🎯 Modos de Operação

| Modo | Persistência | Ideal Para | Status |
|------|--------------|------------|--------|
| **🌐 Offline** | LocalStorage | Testes, demonstrações, ambientes sem internet | ✅ Estável |
| **☁️ Cloud** | PostgreSQL (Railway) | Produção, multi-loja, acesso remoto | ✅ Estável |
| **🔄 Híbrido** | Transição transparente | Migração gradual, failover automático | ✅ Estável |

### 🌟 Principais Diferenciais

- ✅ **Design System Verde Profissional**: Sidebar verde escura, fundo claro, visual moderno
- ✅ **Multi-tenant**: Isolamento completo de dados por empresa (company_id)
- ✅ **Autenticação JWT**: Segurança robusta com roles (superadmin, admin, staff)
- ✅ **Interface Responsiva**: Design adaptativo profissional (desktop, tablet, mobile)
- ✅ **RBAC Completo**: Controle de acesso granular por função de usuário
- ✅ **Funções Operacionais**: Caixa, Cozinha, Motoboy, Supervisor, Garçom
- ✅ **Delivery com Motoboy**: Impressão em duas vias com nome do responsável
- ✅ **Tratamento de Erros**: Mensagens inline padronizadas em todos os modais
- ✅ **Docker Ready**: Dockerfile otimizado + healthcheck automático
- ✅ **Validação Completa**: express-validator em todas as rotas da API
- ✅ **Rate Limiting**: Proteção contra ataques (100 req/15min global, 5 req/15min login)
- ✅ **Progressive Web App (PWA)**: Instalável e funciona offline
- ✅ **Detecção Automática de API**: Frontend detecta automaticamente backend local ou cloud

---

---

## 🎯 Funcionalidades Principais

### 📊 Gestão de Vendas e Pedidos
- **Pedidos Integrados**: Mesa, delivery e balcão em interface unificada
- **Comandas Inteligentes**: Vinculação automática de itens por mesa/cliente
- **Controle de Status**: Fluxo completo (Pendente → Em Preparo → Pronto → Entregue → Finalizado)
- **Impressão de Comanda**: Geração automática de comprovantes e comandas
- **Histórico Completo**: Auditoria de todas as operações com timestamps

### 🍽️ Cardápio Digital
- **Categorias Dinâmicas**: Entradas, pratos, bebidas, sobremesas, etc.
- **Gestão de Preços**: Atualização em tempo real sem duplicação
- **Controle de Estoque**: Integração automática com inventário
- **Fotos e Descrições**: Upload e gerenciamento de imagens dos pratos
- **Status de Disponibilidade**: Ativação/desativação instantânea de itens

### 🪑 Gestão de Mesas
- **Layout Visual**: Visualização gráfica do salão em tempo real
- **Status Dinâmico**: Livre, ocupada, reservada com cores distintas
- **Capacidade Configurável**: Definição de lotação por mesa
- **Histórico de Ocupação**: Rastreamento completo de uso

### 🛵 Delivery Completo
- **Gestão de Entregas**: Rastreamento de status (aguardando, saiu, entregue)
- **Endereços Salvos**: Histórico de locais de entrega por cliente
- **Cálculo de Taxa**: Sistema flexível de cobrança de entrega
- **Tempo Estimado**: Controle de SLA e previsões
- **Integração WhatsApp**: Links automáticos para confirmação

### 📦 Controle de Estoque
- **Inventário Completo**: Ingredientes, bebidas, produtos auxiliares
- **Alertas de Baixo Estoque**: Notificações configuráveis
- **Movimentações Rastreadas**: Entrada, saída, ajuste manual
- **Relatórios de Consumo**: Análise de desperdícios e tendências
- **Integração com Pedidos**: Baixa automática ao confirmar venda

### 👥 Cadastro de Clientes
- **Perfil Completo**: Nome, telefone, email, endereços
- **Histórico de Compras**: Todas as transações por cliente
- **Programa de Fidelidade**: Pontos e recompensas configuráveis
- **Preferências Alimentares**: Alergias, restrições, favoritos
- **Aniversariantes**: Relatório mensal para campanhas

### 📅 Sistema de Reservas
- **Agendamento Online**: Interface calendário intuitiva
- **Conflito de Horários**: Validação automática de disponibilidade
- **Confirmação Automática**: Email/SMS de confirmação
- **Status de Reserva**: Confirmada, pendente, cancelada
- **Histórico por Cliente**: Todas as reservas registradas

### 👨‍💼 Gestão de Usuários
- **Níveis de Acesso**: Superadmin, Admin, Staff (garçom, cozinha)
- **Permissões Granulares**: Controle fino de funcionalidades por role
- **Auditoria de Ações**: Log completo de operações por usuário
- **Multi-empresa**: Um usuário pode acessar múltiplas empresas

### 💰 Financeiro Completo
- **Fluxo de Caixa**: Entradas, saídas, saldo consolidado
- **Categorização de Despesas**: Classificação automática de custos
- **Métodos de Pagamento**: Dinheiro, cartão, PIX, vale, cortesia
- **Fechamento de Caixa**: Conciliação diária com divergências
- **Movimentações Bancárias**: Integração com contas correntes

### 📈 Relatórios e Analytics
- **Dashboard Executivo**: KPIs em tempo real (faturamento, ticket médio, etc.)
- **Relatórios Customizados**: Vendas por período, produto, categoria, garçom
- **Gráficos Interativos**: Chart.js com múltiplas visualizações
- **Exportação de Dados**: CSV, PDF, impressão direta
- **Análise de Tendências**: Comparação mensal/anual

### 🎟️ Sistema de Cupons
- **Descontos Programados**: Valor fixo ou percentual
- **Validade Configurável**: Data de expiração automática
- **Limite de Uso**: Número máximo de resgates
- **Cupons Personalizados**: Geração de códigos únicos por cliente

### ⚙️ Configurações do Sistema
- **Dados da Empresa**: Logo, nome fantasia, CNPJ, endereço
- **Parâmetros Operacionais**: Taxa de serviço, horários, tolerâncias
- **Integrações**: API keys, webhooks, notificações
- **Temas e Layout**: Personalização visual (em desenvolvimento)
- **Backup Automático**: Exportação agendada de dados

---

## 🏗️ Arquitetura do Sistema

### 📐 Diagrama de Arquitetura

```mermaid
graph TB
    subgraph Frontend["🌐 Frontend (Netlify)"]
        HTML[16 Páginas HTML]
        JS[20 Módulos JavaScript]
        CSS[15 Arquivos CSS]
        PWA[Service Worker + Manifest]
    end
    
    subgraph Config["⚙️ Detecção de Ambiente"]
        Detect[detectApiBaseUrl]
        Detect -->|Localhost| Local[http://localhost:3000]
        Detect -->|Produção| Cloud[https://barestaurante.up.railway.app]
    end
    
    subgraph Backend["🚀 Backend (Railway)"]
        API[Express API]
        Auth[JWT Authentication]
        Routes[11 Rotas REST]
        Middleware[Validação + Rate Limit]
    end
    
    subgraph Database["💾 Persistência"]
        LocalStorage[(LocalStorage)]
        PostgreSQL[(PostgreSQL 14+)]
    end
    
    HTML --> JS
    JS --> Detect
    Detect --> API
    API --> Auth
    Auth --> Routes
    Routes --> Middleware
    Middleware --> PostgreSQL
    
    JS -.->|Fallback| LocalStorage
    
    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style Database fill:#f0f0f0
    style Config fill:#e8f5e9
```

### 🔄 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Railway)
    participant DB as PostgreSQL
    participant LS as LocalStorage
    
    U->>F: Login/Signup
    F->>A: POST /api/auth/login
    
    alt API Online
        A->>DB: Valida credenciais
        DB-->>A: Usuário encontrado
        A-->>F: JWT Token + userData
        F->>LS: Salva token + userData
        F-->>U: Redireciona para dashboard
    else API Offline (502/503)
        A--xF: Erro de rede
        F->>LS: Cria conta local (modo demo)
        F-->>U: Alerta + Redireciona
    end
```

### 📁 Estrutura Detalhada

<details>
<summary><b>📂 Frontend (clique para expandir)</b></summary>

```
├── 📄 index.html              # Landing page / Login
├── 📄 dashboard.html          # Dashboard principal com KPIs
├── 📄 pedidos.html            # Gestão de pedidos
├── 📄 mesas.html              # Controle de mesas
├── 📄 cardapio.html           # Cardápio digital
├── 📄 delivery.html           # Sistema de entregas
├── 📄 estoque.html            # Controle de estoque
├── 📄 clientes.html           # Cadastro de clientes
├── 📄 reserva.html            # Sistema de reservas
├── 📄 usuarios.html           # Gestão de usuários
├── 📄 empresas.html           # Multi-empresa (superadmin)
├── 📄 financeiro.html         # Fluxo de caixa
├── 📄 relatorios.html         # Relatórios e analytics
├── 📄 cupom.html              # Sistema de cupons
├── 📄 configuracoes.html      # Configurações gerais
├── 📄 manual.html             # Manual do usuário
├── 📄 manifest.json           # PWA manifest
├── 📄 sw.js                   # Service Worker
├── css/ (15 arquivos)
│   ├── base.css               # Estilos globais + reset
│   ├── login.css              # Tela de login
│   ├── dashboard.css          # Dashboard
│   ├── pedidos.css            # Módulo pedidos
│   ├── mesas.css              # Visualização mesas
│   ├── cardapio.css           # Cardápio
│   ├── delivery.css           # Delivery
│   ├── estoque.css            # Estoque
│   ├── clientes.css           # Clientes
│   ├── reserva.css            # Reservas
│   ├── financeiro.css         # Financeiro
│   ├── relatorios.css         # Relatórios
│   ├── cupom.css              # Cupons
│   ├── configuracoes.css      # Configurações
│   └── fixes.css              # Correções específicas
└── js/ (20 módulos)
    ├── config.js              # Config central (detectApiBaseUrl)
    ├── api.js                 # Cliente API com fallback
    ├── auth-neon.js           # Autenticação JWT
    ├── utils.js               # Funções utilitárias
    ├── login.js               # Login/signup com fallback
    ├── dashboard.js           # Dashboard
    ├── pedidos.js             # Pedidos
    ├── mesas.js               # Mesas
    ├── cardapio.js            # Cardápio
    ├── delivery.js            # Delivery
    ├── estoque.js             # Estoque
    ├── clientes.js            # Clientes
    ├── reserva.js             # Reservas
    ├── usuarios.js            # Usuários
    ├── empresas.js            # Multi-empresa
    ├── financeiro.js          # Financeiro
    ├── relatorios.js          # Relatórios
    ├── cupom.js               # Cupons
    ├── configuracoes.js       # Configurações
    └── manual.js              # Manual
```
</details>

<details>
<summary><b>🗄️ Backend (clique para expandir)</b></summary>

```
server/
├── 📄 package.json            # Dependências Node.js
├── 📄 docker-compose.yml      # Setup Docker local
├── 📄 README.md               # Documentação backend
└── src/
    ├── index.js               # Entry point Express
    ├── db.js                  # Cliente PostgreSQL (pg)
    ├── migrate.js             # Sistema de migrações
    ├── rebuild.js             # Rebuild completo DB
    ├── middleware/
    │   └── auth.js            # Middleware JWT verification
    ├── migrations/
    │   └── schema.sql         # Schema completo + seeds
    └── routes/ (11 rotas REST)
        ├── auth.js            # POST /api/auth/login|register
        ├── companies.js       # CRUD empresas (superadmin)
        ├── customers.js       # CRUD clientes
        ├── database.js        # GET /api/database/health
        ├── menuItems.js       # CRUD cardápio
        ├── orders.js          # CRUD pedidos
        ├── reservations.js    # CRUD reservas
        ├── stock.js           # CRUD estoque
        ├── tables.js          # CRUD mesas
        ├── transactions.js    # CRUD transações financeiras
        └── users.js           # CRUD usuários
```
</details>

---

## ⚡ Início Rápido

### Pré-requisitos

- Node.js ≥18.0.0
- npm ≥9.0.0
- PostgreSQL 14+ (para modo cloud)

### 🚀 Instalação em 3 Passos

```bash
# 1. Clone o repositório
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante

# 2. Configure o backend
cd server
npm install
cp .env.example .env  # Configure suas variáveis de ambiente

# 3. Inicie o servidor
npm run dev

# 4. Acesse o frontend
# Abra o arquivo index.html em qualquer navegador
# Ou use o Live Server do VS Code
```

### 🎯 Credenciais Padrão

```javascript
// Superadmin (acesso completo)
Email: admin@exemplo.com
Senha: admin123

// Admin (acesso à empresa)
Email: gerente@empresa.com  
Senha: gerente123

// Staff (operacional)
Email: staff@empresa.com
Senha: staff123
```

### 🌐 URLs de Produção

- **Frontend**: https://barestaurante.netlify.app
- **Backend API**: https://barestaurante.up.railway.app
- **Health Check**: https://barestaurante.up.railway.app/api/health
- **Repositório**: https://github.com/cristiano-superacao/bar_restaurante

---

## 🔧 Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **HTML5** | - | Estrutura das 16 páginas |
| **CSS3** | - | Estilos responsivos + Flexbox/Grid |
| **JavaScript (ES6+)** | - | Lógica de negócio (sem frameworks) |
| **Chart.js** | 4.x | Gráficos e visualizações |
| **Font Awesome** | 6.x | Ícones profissionais |
| **LocalStorage API** | - | Modo offline e cache |
| **Service Worker** | - | PWA e offline support |

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **Node.js** | ≥18.0.0 | Runtime JavaScript |
| **Express** | 4.19.2 | Framework web REST API |
| **PostgreSQL** | 14+ | Banco de dados relacional |
| **pg** | 8.12.0 | Driver PostgreSQL |
| **jsonwebtoken** | 9.0.2 | Autenticação JWT |
| **bcryptjs** | 2.4.3 | Hash de senhas |
| **helmet** | 7.1.0 | Headers de segurança |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing |
| **express-rate-limit** | 7.3.1 | Rate limiting |
| **express-validator** | 7.1.0 | Validação de entrada |
| **dotenv** | 16.4.5 | Variáveis de ambiente |

### DevOps e Infraestrutura
| Ferramenta | Uso |
|-----------|-----|
| **Railway** | Deploy e hosting do backend |
| **Netlify** | Deploy e hosting do frontend |
| **Docker** | Containerização (desenvolvimento) |
| **GitHub Actions** | CI/CD (futuramente) |
| **Git** | Controle de versão |

---

## 📦 Instalação Detalhada

### 1. Backend (Node.js + PostgreSQL)

#### Variáveis de Ambiente (.env)

Crie um arquivo `.env` na pasta `server/`:

```env
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/bar_restaurante

# Porta do servidor
PORT=3000

# JWT Secret (gere uma chave segura)
JWT_SECRET=sua_chave_secreta_muito_forte_aqui_min_32_chars

# Ambiente
NODE_ENV=development

# CORS (origens permitidas - separadas por vírgula)
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://barestaurante.netlify.app
```

#### Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
npm run dev

# Produção
npm start

# Executar migrações manualmente
npm run migrate

# Rebuild completo do banco (⚠️ apaga todos os dados)
npm run rebuild

# Testes (em desenvolvimento)
npm test
```

#### Docker (Opcional)

```bash
# Subir PostgreSQL + Backend
cd server
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

### 2. Frontend (Estático)

#### Opção A: Servidor Local Simples

```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (http-server)
npx http-server -p 8000

# Usando PHP
php -S localhost:8000
```

#### Opção B: Live Server (VS Code)

1. Instale a extensão **Live Server**
2. Clique direito em `index.html`
3. Selecione "Open with Live Server"

#### Opção C: Acesso Direto

Abra `index.html` diretamente no navegador (funciona em modo offline).

---

## 🚀 Deploy em Produção

### Backend no Railway

#### 1. Preparação

```bash
# Certifique-se de que o servidor/ existe
cd servidor
npm install  # Instala dependências do wrapper
```

#### 2. Configuração Railway

Crie um arquivo `railway.json` na raiz:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Ou configure via `railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

#### 3. Variáveis de Ambiente Railway

Configure no painel Railway:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-injetado
JWT_SECRET=sua_chave_secreta_forte
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://barestaurante.netlify.app
```

#### 4. Deploy

```bash
# Via CLI Railway
railway login
railway link
railway up

# Ou conecte seu repositório GitHub no painel Railway
```

### Frontend no Netlify

#### 1. Build Settings

```toml
# netlify.toml (na raiz do projeto)
[build]
  publish = "."
  command = "echo 'Static site - no build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy

**Opção A: GitHub Integration**
1. Conecte seu repositório no Netlify
2. Configure o branch `main`
3. Deploy automático a cada push

**Opção B: Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Opção C: Drag & Drop**
1. Acesse https://app.netlify.com/drop
2. Arraste a pasta do projeto
3. Publique

### Verificação de Saúde

```bash
# Backend Railway
curl https://barestaurante.up.railway.app/api/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "uptime": 12345
}
```

---

## 📖 Documentação da API

### Base URL

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: `https://barestaurante.up.railway.app`

### Autenticação

Todas as rotas protegidas requerem header:

```http
Authorization: Bearer {JWT_TOKEN}
```

### Endpoints Disponíveis

#### 🔐 Autenticação (`/api/auth`)

<details>
<summary><b>POST</b> /api/auth/register - Criar nova conta</summary>

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "admin"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "admin",
    "company_id": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `400`: Email já cadastrado
- `422`: Validação falhou (senha muito curta, email inválido)

</details>

<details>
<summary><b>POST</b> /api/auth/login - Fazer login</summary>

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "admin",
    "company_id": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `401`: Credenciais inválidas
- `422`: Validação falhou

</details>

#### 🍽️ Cardápio (`/api/menu-items`)

<details>
<summary><b>GET</b> /api/menu-items - Listar itens do cardápio</summary>

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Pizza Margherita",
    "description": "Molho de tomate, mussarela e manjericão",
    "price": 45.90,
    "category": "Pizzas",
    "image_url": "https://exemplo.com/pizza.jpg",
    "available": true,
    "company_id": 1,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

</details>

<details>
<summary><b>POST</b> /api/menu-items - Criar item</summary>

**Request Body:**
```json
{
  "name": "Hambúrguer Artesanal",
  "description": "Pão brioche, blend 180g, queijo cheddar",
  "price": 32.90,
  "category": "Hambúrgueres",
  "image_url": "https://exemplo.com/burger.jpg",
  "available": true
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "name": "Hambúrguer Artesanal",
  "price": 32.90,
  "company_id": 1
}
```

</details>

<details>
<summary><b>PUT</b> /api/menu-items/:id - Atualizar item</summary>

**Request Body:**
```json
{
  "name": "Hambúrguer Artesanal Premium",
  "price": 39.90,
  "available": true
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "name": "Hambúrguer Artesanal Premium",
  "price": 39.90
}
```

</details>

<details>
<summary><b>DELETE</b> /api/menu-items/:id - Remover item</summary>

**Response (204 No Content)**

</details>

#### 📝 Pedidos (`/api/orders`)

<details>
<summary><b>GET</b> /api/orders - Listar pedidos</summary>

**Query Parameters:**
- `status` (opcional): `Pendente`, `Em Preparo`, `Pronto`, `Entregue`, `Finalizado`
- `type` (opcional): `Mesa`, `Delivery`, `Balcão`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "table_id": 5,
    "customer_id": 10,
    "status": "Em Preparo",
    "type": "Mesa",
    "items": [
      {
        "menu_item_id": 1,
        "name": "Pizza Margherita",
        "quantity": 2,
        "price": 45.90,
        "subtotal": 91.80
      }
    ],
    "subtotal": 91.80,
    "discount": 0,
    "delivery_fee": 0,
    "total": 91.80,
    "company_id": 1,
    "created_at": "2024-01-15T12:30:00Z"
  }
]
```

</details>

<details>
<summary><b>POST</b> /api/orders - Criar pedido</summary>

**Request Body:**
```json
{
  "table_id": 5,
  "type": "Mesa",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "price": 45.90
    },
    {
      "menu_item_id": 3,
      "quantity": 1,
      "price": 15.00
    }
  ],
  "discount": 10.00,
  "notes": "Sem cebola"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "total": 96.80,
  "status": "Pendente"
}
```

</details>

<details>
<summary><b>PATCH</b> /api/orders/:id/status - Atualizar status</summary>

**Request Body:**
```json
{
  "status": "Pronto"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "Pronto",
  "updated_at": "2024-01-15T13:00:00Z"
}
```

</details>

#### 🪑 Mesas (`/api/tables`)

<details>
<summary><b>GET</b> /api/tables - Listar mesas</summary>

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "number": "01",
    "capacity": 4,
    "status": "Livre",
    "company_id": 1
  }
]
```

</details>

<details>
<summary><b>POST</b> /api/tables - Criar mesa</summary>

**Request Body:**
```json
{
  "number": "05",
  "capacity": 6,
  "status": "Livre"
}
```

</details>

<details>
<summary><b>PATCH</b> /api/tables/:id/status - Atualizar status</summary>

**Request Body:**
```json
{
  "status": "Ocupada"
}
```

</details>

#### 📅 Reservas (`/api/reservations`)

<details>
<summary><b>GET</b> /api/reservations - Listar reservas</summary>

**Query Parameters:**
- `date` (opcional): `YYYY-MM-DD`
- `status` (opcional): `Confirmada`, `Pendente`, `Cancelada`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "customer_name": "João Silva",
    "customer_phone": "(11) 98765-4321",
    "date": "2024-01-20",
    "time": "19:00",
    "guests": 4,
    "table_id": 3,
    "status": "Confirmada",
    "notes": "Aniversário",
    "company_id": 1
  }
]
```

</details>

#### 📦 Estoque (`/api/stock`)

<details>
<summary><b>GET</b> /api/stock - Listar produtos</summary>

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Farinha de Trigo",
    "category": "Ingredientes",
    "quantity": 50,
    "min_quantity": 10,
    "unit": "kg",
    "supplier": "Fornecedor ABC",
    "company_id": 1
  }
]
```

</details>

<details>
<summary><b>POST</b> /api/stock/movement - Registrar movimentação</summary>

**Request Body:**
```json
{
  "stock_id": 1,
  "type": "entrada",
  "quantity": 20,
  "notes": "Compra mensal"
}
```

</details>

#### 👥 Clientes (`/api/customers`)

<details>
<summary><b>GET</b> /api/customers - Listar clientes</summary>

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Maria Santos",
    "cpf": "123.456.789-00",
    "phone": "(11) 99999-8888",
    "email": "maria@exemplo.com",
    "address": "Rua das Flores, 123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567",
    "company_id": 1
  }
]
```

</details>

#### 💰 Transações (`/api/transactions`)

<details>
<summary><b>GET</b> /api/transactions - Listar transações</summary>

**Query Parameters:**
- `type` (opcional): `Receita`, `Despesa`
- `start_date` (opcional): `YYYY-MM-DD`
- `end_date` (opcional): `YYYY-MM-DD`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "type": "Receita",
    "category": "Vendas",
    "description": "Pedido #123",
    "amount": 150.00,
    "payment_method": "Cartão de Crédito",
    "date": "2024-01-15",
    "company_id": 1
  }
]
```

</details>

#### 👤 Usuários (`/api/users`)

<details>
<summary><b>GET</b> /api/users - Listar usuários</summary>

**Requer:** `admin` ou `superadmin`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "admin",
    "company_id": 1,
    "active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

</details>

#### 🏢 Empresas (`/api/companies`)

<details>
<summary><b>GET</b> /api/companies - Listar empresas</summary>

**Requer:** `superadmin`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Restaurante Exemplo",
    "cnpj": "12.345.678/0001-90",
    "address": "Av. Principal, 100",
    "phone": "(11) 3333-4444",
    "email": "contato@restaurante.com",
    "active": true
  }
]
```

</details>

#### 🏥 Saúde (`/api/health`, `/api/database/health`)

<details>
<summary><b>GET</b> /api/health - Status da API</summary>

**Sem autenticação**

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345
}
```

</details>

<details>
<summary><b>GET</b> /api/database/health - Status do banco</summary>

**Response (200 OK):**
```json
{
  "status": "connected",
  "database": "bar_restaurante",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

</details>

### Rate Limiting

| Endpoint | Limite |
|----------|--------|
| **Global** | 100 requisições / 15 minutos |
| **POST /api/auth/login** | 5 requisições / 15 minutos |
| **POST /api/auth/register** | 5 requisições / 15 minutos |

**Response (429 Too Many Requests):**
```json
{
  "error": "Muitas requisições. Tente novamente em alguns minutos."
}
```

---

## 🔒 Segurança e Boas Práticas

### 🛡️ Camadas de Segurança Implementadas

#### 1. Autenticação e Autorização
- ✅ **JWT (JSON Web Tokens)**: Tokens assinados com HS256
- ✅ **Bcrypt**: Hash de senhas com salt rounds = 10
- ✅ **Role-Based Access Control (RBAC)**: 3 níveis (superadmin, admin, staff)
- ✅ **Token Expiration**: 24 horas de validade
- ✅ **Logout Seguro**: Remoção de tokens do cliente

#### 2. Proteção de Endpoints
- ✅ **Middleware de Autenticação**: Verifica JWT em todas as rotas protegidas
- ✅ **express-validator**: Validação de entrada em todas as rotas
- ✅ **Sanitização**: Remoção de caracteres perigosos (SQL Injection, XSS)
- ✅ **Rate Limiting**: Proteção contra brute-force e DDoS

#### 3. Headers de Segurança (Helmet.js)
```javascript
helmet({
  contentSecurityPolicy: false, // Configurar CSP conforme necessário
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
})
```

- ✅ **X-Content-Type-Options**: nosniff
- ✅ **X-Frame-Options**: DENY
- ✅ **X-XSS-Protection**: 1; mode=block
- ✅ **Strict-Transport-Security**: max-age=15552000; includeSubDomains

#### 4. Isolamento Multi-tenant
- ✅ **company_id**: Todas as queries filtradas por empresa
- ✅ **Validação de Propriedade**: Usuário só acessa dados da sua empresa
- ✅ **Superadmin Exception**: Acesso cross-company apenas para superadmin

#### 5. Banco de Dados
- ✅ **Prepared Statements**: Proteção contra SQL Injection (pg library)
- ✅ **Constraints**: CHECK, NOT NULL, FOREIGN KEY para integridade
- ✅ **Índices**: Performance em queries com company_id
- ✅ **Migrações Idempotentes**: Schemas versionados e tolerantes

### 🔐 Boas Práticas para Produção

#### Variáveis de Ambiente Sensíveis

```env
# ⚠️ NUNCA commite este arquivo no Git
JWT_SECRET=gere_uma_chave_forte_com_min_32_caracteres_random
DATABASE_URL=postgresql://usuario:senha@host:5432/database
```

Gere uma chave JWT forte:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### CORS Configuração

```javascript
// Em produção, especifique origens permitidas
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
};
```

#### HTTPS Obrigatório

- ✅ Railway e Netlify fornecem HTTPS automaticamente
- ✅ Para self-hosted, use Let's Encrypt + Nginx/Caddy

#### Monitoramento e Logs

```javascript
// Logs estruturados (evite expor dados sensíveis)
console.log({
  level: 'info',
  message: 'User logged in',
  userId: user.id,
  // Nunca logue: password, JWT tokens, dados pessoais completos
});
```

#### Backup e Recuperação

```bash
# Backup PostgreSQL (agende daily)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20240115.sql
```

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Siga estas diretrizes:

### 📋 Processo de Contribuição

1. **Fork** o repositório
2. **Clone** seu fork localmente:
   ```bash
   git clone https://github.com/SEU_USUARIO/bar_restaurante.git
   ```
3. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
4. **Faça suas alterações** e commit:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```
5. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
6. Abra um **Pull Request** no repositório original

### 📝 Padrão de Commits

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição>

<corpo opcional>

<rodapé opcional>
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta lógica)
- `refactor`: Refatoração de código
- `test`: Adição/correção de testes
- `chore`: Tarefas de manutenção

**Exemplos:**
```bash
feat(cardapio): adiciona filtro por disponibilidade
fix(auth): corrige validação de token expirado
docs(readme): atualiza instruções de deploy
style(pedidos): ajusta espaçamento do layout
refactor(api): melhora tratamento de erros HTTP
test(estoque): adiciona testes unitários de movimentação
chore(deps): atualiza dependências do backend
```

### 🐛 Reportando Bugs

Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) com:

- **Descrição clara** do problema
- **Passos para reproduzir**
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** (se aplicável)
- **Ambiente**: SO, navegador, versão do Node.js

### 💡 Sugerindo Melhorias

Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) com:

- **Descrição detalhada** da feature
- **Justificativa**: por que seria útil?
- **Exemplos de uso** ou mockups (se aplicável)

### ✅ Checklist para Pull Requests

- [ ] Código segue o estilo do projeto
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Documentação atualizada (se necessário)
- [ ] Testes adicionados/atualizados (se aplicável)
- [ ] Sem erros de linting ou build
- [ ] Testado localmente em desenvolvimento
- [ ] Compatibilidade retroativa mantida

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2024 Cristiano Superação

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[...texto completo da licença...]
```

### ⚖️ Resumo da Licença

✅ **Permitido:**
- Uso comercial
- Modificação
- Distribuição
- Uso privado

⚠️ **Condições:**
- Incluir aviso de copyright e licença
- Fornecer cópia da licença MIT

❌ **Limitações:**
- Sem garantias
- Sem responsabilidade do autor

---

## 📞 Suporte e Contato

### 🆘 Precisa de Ajuda?

1. **Documentação**: Leia este README e o [Manual do Usuário](manual.html)
2. **Issues**: Verifique [issues existentes](https://github.com/cristiano-superacao/bar_restaurante/issues)
3. **Nova Issue**: Abra uma [nova issue](https://github.com/cristiano-superacao/bar_restaurante/issues/new)

### 📬 Contatos

- **GitHub**: [@cristiano-superacao](https://github.com/cristiano-superacao)
- **Repositório**: https://github.com/cristiano-superacao/bar_restaurante
- **Demo Frontend**: https://barestaurante.netlify.app
- **API Backend**: https://barestaurante.up.railway.app

### 🌟 Agradecimentos

Obrigado a todos que contribuíram para este projeto!

---

<div align="center">

**Feito com ❤️ para a comunidade de restaurantes e bares**

[![GitHub Stars](https://img.shields.io/github/stars/cristiano-superacao/bar_restaurante?style=social)](https://github.com/cristiano-superacao/bar_restaurante/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/cristiano-superacao/bar_restaurante?style=social)](https://github.com/cristiano-superacao/bar_restaurante/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/cristiano-superacao/bar_restaurante)](https://github.com/cristiano-superacao/bar_restaurante/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/cristiano-superacao/bar_restaurante)](https://github.com/cristiano-superacao/bar_restaurante/pulls)

⭐ **Se este projeto foi útil, considere dar uma estrela!** ⭐

</div>

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
