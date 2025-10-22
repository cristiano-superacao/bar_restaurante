# 📚 DOCUMENTAÇÃO COMPLETA - SISTEMA MARIA FLOR

> **Sistema de Gestão Completo para Restaurantes**  
> Desenvolvido para o Restaurante Maria Flor - Salvador, BA

---

## 📑 ÍNDICE

1. [Visão Geral](#-visão-geral)
2. [Instalação e Configuração](#-instalação-e-configuração)
3. [Arquitetura do Sistema](#️-arquitetura-do-sistema)
4. [Banco de Dados](#️-banco-de-dados)
5. [APIs e Endpoints](#-apis-e-endpoints)
6. [Interface do Usuário](#-interface-do-usuário)
7. [Sistema de Autenticação](#-sistema-de-autenticação)
8. [Funcionalidades](#-funcionalidades)
9. [Deploy em Produção](#-deploy-em-produção)
10. [Resolução de Problemas](#-resolução-de-problemas)
11. [Manual do Usuário](#-manual-do-usuário)

---

## 🎯 VISÃO GERAL

### O que é o Sistema Maria Flor?

O **Sistema Maria Flor** é uma solução completa de gestão para restaurantes e bares, desenvolvida especificamente para modernizar e otimizar as operações do Restaurante Maria Flor em Salvador, Bahia.

### 🌟 Principais Características

- **💻 100% Web-based** - Funciona em qualquer navegador
- **📱 Responsivo** - Interface adaptável para desktop, tablet e mobile  
- **☁️ Cloud-ready** - Preparado para deploy em nuvem (Netlify + Neon)
- **🔐 Seguro** - Autenticação JWT com senhas criptografadas
- **⚡ Rápido** - Interface otimizada e APIs eficientes
- **🎨 Moderno** - Design clean e intuitivo

### 🎭 Usuários do Sistema

| Tipo de Usuário | Descrição | Principais Funcionalidades |
|------------------|-----------|---------------------------|
| **Admin** | Administrador total do sistema | Acesso completo, configurações, relatórios |
| **Gerente** | Gestão operacional | Dashboard, vendas, pedidos, relatórios |
| **Garçom** | Atendimento ao cliente | Pedidos, mesas, cardápio |
| **Cozinha** | Preparo dos pratos | Pedidos da cozinha, tempo de preparo |
| **Caixa** | Processamento de pagamentos | Vendas, fechamento, métodos de pagamento |

---

## 🚀 INSTALAÇÃO E CONFIGURAÇÃO

### 🎯 Opção 1: Uso Imediato (Sem Instalação)

**Para testar rapidamente o sistema:**

```bash
# 1. Navegue até o diretório do projeto
cd C:\Users\Farmacia L7\Desktop\Cristiano\Bar_Restaurante

# 2. Abra o arquivo index.html diretamente no navegador
start index.html
```

**Credenciais de teste:**
- `admin` / `admin123`
- `gerente` / `gerente123`
- `garcom` / `garcom123`
- `cozinha` / `cozinha123`
- `caixa` / `caixa123`

### 🎯 Opção 2: Instalação Completa

**Pré-requisitos:**
- Node.js v18+ ([Download aqui](https://nodejs.org))
- Conta no Neon Database ([neon.tech](https://neon.tech))
- Conta na Netlify ([netlify.com](https://netlify.com))

**Passo a passo:**

```bash
# 1. Clonar o repositório
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.production .env
# Editar .env com suas configurações

# 4. Configurar banco de dados
# Executar scripts SQL no Neon Database

# 5. Testar localmente
npm run dev
```

### ⚙️ Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados Neon PostgreSQL
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Chave secreta JWT (troque em produção!)
JWT_SECRET="sua-chave-super-secreta-aqui"

# Ambiente
NODE_ENV="production"

# Configurações opcionais
ENCRYPTION_KEY="sua-chave-de-32-caracteres-aqui"
SESSION_SECRET="sua-chave-de-sessao"
```

---

## 🏗️ ARQUITETURA DO SISTEMA

### 📋 Visão Geral da Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │     BACKEND     │    │   DATABASE      │
│                 │    │                 │    │                 │
│ • HTML5         │───▶│ • Node.js       │───▶│ • PostgreSQL    │
│ • CSS3          │    │ • Express.js    │    │ • Neon Cloud    │
│ • JavaScript    │    │ • Netlify Funcs │    │ • 11 Tabelas    │
│ • Chart.js      │    │ • JWT Auth      │    │ • Índices       │
│ • Font Awesome  │    │ • bcrypt        │    │ • Triggers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📁 Estrutura de Arquivos

```
📂 maria-flor-sistema/
├── 📄 index.html                    # Página de login principal
├── 📄 package.json                  # Configurações Node.js
├── 📄 netlify.toml                  # Configurações Netlify
├── 📄 .env.production               # Variáveis de ambiente
│
├── 📂 pages/                        # Páginas da aplicação
│   ├── 📄 dashboard.html           # Dashboard principal
│   └── 📄 mesas.html               # Gestão de mesas
│
├── 📂 css/                         # Estilos
│   ├── 📄 login.css               # Estilos da página de login
│   ├── 📄 dashboard.css           # Estilos do dashboard
│   └── 📄 corrections.css         # Correções e melhorias
│
├── 📂 js/                          # Scripts JavaScript
│   ├── 📄 auth-simple.js          # Sistema de autenticação
│   ├── 📄 login-simple.js         # Lógica do login
│   ├── 📄 dashboard.js            # Funcionalidades do dashboard
│   └── 📄 server-simulator.js     # Simulador local
│
├── 📂 netlify/functions/           # Serverless Functions
│   └── 📄 api-complete.js         # API principal
│
├── 📂 api/                         # Serviços do backend
│   └── 📄 services.js             # Lógica de negócio
│
├── 📂 database/                    # Scripts do banco
│   ├── 📄 schema.sql              # Estrutura das tabelas
│   ├── 📄 usuarios_hasheados.sql  # Usuários padrão
│   └── 📄 usuarios_teste.sql      # Dados de teste
│
├── 📂 scripts/                     # Scripts utilitários
│   └── 📄 generate-hashes.js      # Gerador de hashes
│
└── 📂 docs/                        # Documentação
    ├── 📄 COMO_USAR.md            # Guia rápido
    ├── 📄 IMPLEMENTACAO_COMPLETA.md
    └── 📄 API_REFERENCE.md        # Referência da API
```

### 🔄 Fluxo de Dados

```mermaid
graph LR
    A[Usuario] --> B[Interface HTML]
    B --> C[JavaScript Client]
    C --> D[Netlify Functions]
    D --> E[Services Layer]
    E --> F[Neon Database]
    F --> E
    E --> D
    D --> C
    C --> B
    B --> A
```

---

## 🗄️ BANCO DE DADOS

### 📊 Diagrama Entidade-Relacionamento

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   usuarios  │     │   pedidos   │     │    mesas    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │────▶│ garcom_id   │     │ id (PK)     │
│ username    │     │ mesa_id     │◀────│ numero      │
│ password    │     │ status      │     │ capacidade  │
│ nome        │     │ total       │     │ status      │
│ role        │     └─────────────┘     └─────────────┘
└─────────────┘            │
                          │
                          ▼
                ┌─────────────────┐
                │  pedido_itens   │
                ├─────────────────┤
                │ id (PK)         │
                │ pedido_id (FK)  │
                │ cardapio_id (FK)│
                │ quantidade      │
                │ preco_unitario  │
                └─────────────────┘
                          │
                          ▼
                ┌─────────────────┐
                │    cardapio     │
                ├─────────────────┤
                │ id (PK)         │
                │ nome            │
                │ preco           │
                │ categoria_id    │
                └─────────────────┘
```

### 🔧 Tabelas Principais

#### 1. **usuarios** - Sistema de Autenticação
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'garcom',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **cardapio** - Itens do Cardápio
```sql
CREATE TABLE cardapio (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    preco DECIMAL(10,2) NOT NULL,
    disponivel BOOLEAN DEFAULT true,
    tempo_preparo INTEGER DEFAULT 15
);
```

#### 3. **pedidos** - Gestão de Pedidos
```sql
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL,
    mesa_id INTEGER REFERENCES mesas(id),
    garcom_id INTEGER REFERENCES usuarios(id),
    status VARCHAR(20) DEFAULT 'aberto',
    subtotal DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. **vendas** - Processamento de Pagamentos
```sql
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    caixa_id INTEGER REFERENCES usuarios(id),
    metodo_pagamento VARCHAR(30) DEFAULT 'dinheiro',
    valor_pago DECIMAL(10,2) NOT NULL,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🔍 Índices para Performance

```sql
-- Índices principais
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_cardapio_disponivel ON cardapio(disponivel);
```

---

## 🔌 APIS E ENDPOINTS

### 🌐 Base URL
- **Local**: `http://localhost:8888/.netlify/functions/api-complete`
- **Produção**: `https://seusite.netlify.app/.netlify/functions/api-complete`

### 🔐 Autenticação

#### POST `/auth/login`
Realiza login do usuário.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "nome": "Administrador",
      "role": "admin"
    },
    "message": "Bem-vindo, Administrador!",
    "redirectTo": "/pages/dashboard.html"
  }
}
```

**Response (Erro):**
```json
{
  "success": false,
  "error": "Usuário ou senha inválidos"
}
```

### 📊 Dashboard

#### GET `/dashboard`
Retorna dados do dashboard.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vendas_hoje": {
      "quantidade": 23,
      "total": 2450.80
    },
    "pedidos_ativos": 8,
    "mesas_ocupadas": 12,
    "estoque_baixo": 5,
    "vendas_semana": [
      { "dia": "Seg", "valor": 1200 },
      { "dia": "Ter", "valor": 1500 }
    ]
  }
}
```

### 🍽️ Cardápio

#### GET `/menu/categories`
Lista categorias do cardápio.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Entradas",
      "descricao": "Pratos para começar",
      "icone": "fas fa-seedling",
      "cor": "#28a745"
    }
  ]
}
```

#### GET `/menu/items`
Lista itens do cardápio.

**Query Parameters:**
- `categoria_id` (opcional): Filtrar por categoria

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Bruschetta",
      "descricao": "Torrada com tomate e manjericão",
      "preco": 18.90,
      "categoria_nome": "Entradas",
      "disponivel": true
    }
  ]
}
```

#### POST `/menu/items`
Cria novo item do cardápio.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "nome": "Risotto de Camarão",
  "descricao": "Risotto cremoso com camarões grandes",
  "categoria_id": 2,
  "preco": 45.90,
  "tempo_preparo": 25
}
```

### 🪑 Mesas

#### GET `/tables`
Lista todas as mesas.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero": 1,
      "capacidade": 2,
      "status": "livre",
      "localizacao": "salao"
    }
  ]
}
```

#### PUT `/tables/update-status`
Atualiza status de uma mesa.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "mesa_id": 1,
  "status": "ocupada"
}
```

### 📋 Pedidos

#### POST `/orders/create`
Cria novo pedido.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "mesa_id": 1,
  "cliente_nome": "João Silva",
  "itens": [
    {
      "cardapio_id": 1,
      "quantidade": 2,
      "observacoes": "Sem cebola"
    }
  ],
  "observacoes": "Cliente alérgico a frutos do mar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "numero": 1001,
    "subtotal": 37.80,
    "taxa_servico": 3.78,
    "total": 41.58
  }
}
```

#### GET `/orders`
Lista pedidos.

**Query Parameters:**
- `status`: Filtrar por status (opcional)
- `data`: Filtrar por data (opcional)

#### PUT `/orders/update-status`
Atualiza status do pedido.

**Request:**
```json
{
  "pedido_id": 123,
  "status": "preparando"
}
```

### 💰 Vendas

#### POST `/sales/process-payment`
Processa pagamento.

**Request:**
```json
{
  "pedido_id": 123,
  "metodo_pagamento": "cartao_credito",
  "valor_pago": 41.58,
  "valor_troco": 0,
  "numero_transacao": "TXN123456"
}
```

#### GET `/sales/report`
Gera relatório de vendas.

**Query Parameters:**
- `data_inicio`: Data inicial (YYYY-MM-DD)
- `data_fim`: Data final (YYYY-MM-DD)

### 🚨 Códigos de Status HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token de acesso necessário |
| 403 | Forbidden | Acesso negado para este usuário |
| 404 | Not Found | Endpoint não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |

---

## 💻 INTERFACE DO USUÁRIO

### 🎨 Design System

#### Cores Principais
```css
:root {
  --primary-color: #667eea;        /* Azul principal */
  --secondary-color: #764ba2;      /* Roxo elegante */
  --success-color: #28a745;        /* Verde sucesso */
  --danger-color: #dc3545;         /* Vermelho erro */
  --warning-color: #ffc107;        /* Amarelo aviso */
  --info-color: #17a2b8;          /* Azul informação */
  --light-color: #f8f9fa;         /* Cinza claro */
  --dark-color: #2c3e50;          /* Cinza escuro */
}
```

#### Tipografia
```css
/* Fonte principal */
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* Hierarquia de títulos */
h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 500; }
h5 { font-size: 1rem; font-weight: 500; }
```

### 📱 Responsividade

#### Breakpoints
```css
/* Mobile First */
@media (min-width: 576px) { /* Telefones grandes */ }
@media (min-width: 768px) { /* Tablets */ }
@media (min-width: 992px) { /* Desktops pequenos */ }
@media (min-width: 1200px) { /* Desktops grandes */ }
```

#### Layout Adaptativo
- **Mobile (< 768px)**: Menu colapsado, cards empilhados
- **Tablet (768px - 991px)**: Menu lateral reduzido
- **Desktop (≥ 992px)**: Layout completo com sidebar

### 🧭 Navegação

#### Menu Principal
```
📊 Dashboard          # Visão geral do sistema
💰 Vendas            # Processamento de pagamentos  
🪑 Mesas             # Controle de mesas
📋 Pedidos           # Gestão de pedidos
📖 Cardápio          # Itens do cardápio
📦 Estoque           # Controle de estoque
👥 Usuários          # Gestão de usuários (admin)
⚙️ Configurações     # Configurações do sistema
📊 Relatórios        # Relatórios gerenciais
```

### 🎯 Componentes da Interface

#### Cards de Resumo
```html
<div class="summary-card">
  <div class="card-icon">
    <i class="fas fa-cash-register"></i>
  </div>
  <div class="card-content">
    <h3>R$ 2.450,80</h3>
    <p>Vendas de Hoje</p>
  </div>
</div>
```

#### Tabelas Responsivas
```html
<div class="table-responsive">
  <table class="table">
    <thead>
      <tr>
        <th>Pedido</th>
        <th>Mesa</th>
        <th>Status</th>
        <th>Total</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody id="pedidos-table">
      <!-- Dados carregados via JavaScript -->
    </tbody>
  </table>
</div>
```

#### Formulários
```html
<form class="form">
  <div class="form-group">
    <label for="nome">Nome do Produto</label>
    <input type="text" id="nome" class="form-control" required>
  </div>
  <div class="form-group">
    <label for="preco">Preço</label>
    <input type="number" id="preco" class="form-control" step="0.01" required>
  </div>
  <button type="submit" class="btn btn-primary">Salvar</button>
</form>
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### 🛡️ Segurança Implementada

#### JWT (JSON Web Tokens)
- **Algoritmo**: HMAC SHA256 (HS256)
- **Expiração**: 24 horas
- **Payload**: ID, username, role, nome do usuário

#### Criptografia de Senhas
- **Algoritmo**: bcrypt
- **Salt Rounds**: 12
- **Exemplo de hash**: `$2b$12$LKJ9K.8vZQY5tP2bGZX1.O...`

#### Níveis de Acesso

| Role | Permissões |
|------|-----------|
| **admin** | Acesso total ao sistema, configurações, usuários |
| **gerente** | Dashboard, vendas, pedidos, cardápio, relatórios |
| **garcom** | Pedidos, mesas, cardápio (visualização) |
| **cozinha** | Pedidos da cozinha, tempo de preparo |
| **caixa** | Vendas, pagamentos, fechamento |

### 🔑 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API
    participant D as Database
    
    U->>F: Inserir credenciais
    F->>A: POST /auth/login
    A->>D: Verificar usuário
    D-->>A: Dados do usuário
    A->>A: Validar senha (bcrypt)
    A->>A: Gerar JWT token
    A-->>F: Token + dados usuário
    F->>F: Salvar no localStorage
    F-->>U: Redirecionar para dashboard
```

### 🔒 Middleware de Proteção

```javascript
// Verificação automática de autenticação
function authMiddleware(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Token de acesso requerido');
  }
  
  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  return jwt.verify(token, JWT_SECRET);
}

// Verificação de permissões por role
function hasPermission(userRole, requiredPermission) {
  const permissions = {
    admin: ['*'], // Acesso total
    gerente: ['vendas', 'pedidos', 'cardapio', 'relatorios'],
    garcom: ['pedidos', 'mesas', 'cardapio-view'],
    cozinha: ['pedidos-cozinha'],
    caixa: ['vendas', 'pagamentos']
  };
  
  return permissions[userRole]?.includes(requiredPermission) || 
         permissions[userRole]?.includes('*');
}
```

---

## ⚡ FUNCIONALIDADES

### 📊 Dashboard Executivo

#### Widgets Principais
1. **Vendas do Dia**
   - Total em R$
   - Quantidade de pedidos
   - Comparação com ontem

2. **Pedidos Ativos** 
   - Em preparação
   - Aguardando pagamento
   - Tempo médio de preparo

3. **Mesas**
   - Ocupadas / Total
   - Tempo médio de ocupação
   - Mesas disponíveis

4. **Estoque**
   - Produtos em falta
   - Alertas de reposição
   - Movimento do dia

#### Gráficos Interativos
```javascript
// Gráfico de vendas da semana
const salesChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
    datasets: [{
      label: 'Vendas (R$)',
      data: [1200, 1500, 1800, 2100, 2450, 3200, 2800],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  }
});
```

### 💰 Sistema de Vendas

#### Processamento de Pagamentos
```javascript
async function processPayment(paymentData) {
  const response = await fetch('/api/sales/process-payment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pedido_id: paymentData.pedidoId,
      metodo_pagamento: paymentData.metodo,
      valor_pago: paymentData.valor,
      valor_troco: paymentData.troco
    })
  });
  
  return await response.json();
}
```

#### Métodos de Pagamento
- **Dinheiro** - Com cálculo de troco
- **Cartão de Crédito** - Com número da transação  
- **Cartão de Débito** - Com número da transação
- **PIX** - Com QR Code (futuro)
- **Transferência** - Com comprovante

### 🪑 Gestão de Mesas

#### Status das Mesas
```javascript
const mesaStatus = {
  'livre': {
    cor: '#28a745',
    icone: 'fas fa-check-circle',
    acao: 'Ocupar Mesa'
  },
  'ocupada': {
    cor: '#dc3545', 
    icone: 'fas fa-users',
    acao: 'Liberar Mesa'
  },
  'reservada': {
    cor: '#ffc107',
    icone: 'fas fa-calendar-alt',
    acao: 'Confirmar Reserva'
  },
  'manutencao': {
    cor: '#6c757d',
    icone: 'fas fa-tools',
    acao: 'Finalizar Manutenção'
  }
};
```

### 📋 Sistema de Pedidos

#### Ciclo de Vida do Pedido
1. **Aberto** - Pedido criado pelo garçom
2. **Confirmado** - Pedido confirmado pelo cliente
3. **Preparando** - Cozinha iniciou preparo
4. **Pronto** - Prato pronto para entrega
5. **Entregue** - Pedido entregue ao cliente
6. **Pago** - Pagamento processado

#### Criação de Pedidos
```javascript
async function criarPedido(dadosPedido) {
  // Validar itens do pedido
  if (!dadosPedido.itens || dadosPedido.itens.length === 0) {
    throw new Error('Pedido deve ter pelo menos um item');
  }
  
  // Calcular totais
  let subtotal = 0;
  dadosPedido.itens.forEach(item => {
    subtotal += item.preco_unitario * item.quantidade;
  });
  
  const taxaServico = subtotal * 0.10; // 10%
  const total = subtotal + taxaServico;
  
  // Enviar para API
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...dadosPedido,
      subtotal,
      taxa_servico: taxaServico,
      total
    })
  });
  
  return await response.json();
}
```

### 📖 Gestão do Cardápio

#### Categorias Organizadas
```javascript
const categorias = [
  {
    nome: 'Entradas',
    icone: 'fas fa-seedling',
    cor: '#28a745'
  },
  {
    nome: 'Pratos Principais', 
    icone: 'fas fa-utensils',
    cor: '#dc3545'
  },
  {
    nome: 'Bebidas',
    icone: 'fas fa-glass-cheers', 
    cor: '#007bff'
  },
  {
    nome: 'Sobremesas',
    icone: 'fas fa-ice-cream',
    cor: '#fd7e14'
  }
];
```

#### CRUD de Produtos
```javascript
// Criar produto
async function criarProduto(produto) {
  const response = await fetch('/api/menu/items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produto)
  });
  
  if (!response.ok) {
    throw new Error('Erro ao criar produto');
  }
  
  return await response.json();
}

// Atualizar produto
async function atualizarProduto(id, produto) {
  const response = await fetch(`/api/menu/items/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produto)
  });
  
  return await response.json();
}
```

### 📦 Controle de Estoque

#### Alertas de Estoque Baixo
```javascript
function verificarEstoqueBaixo() {
  return fetch('/api/estoque/alertas', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success && data.data.length > 0) {
      mostrarNotificacao(`${data.data.length} produtos com estoque baixo!`, 'warning');
    }
  });
}

// Verificar a cada 5 minutos
setInterval(verificarEstoqueBaixo, 5 * 60 * 1000);
```

---

## 🚀 DEPLOY EM PRODUÇÃO

### 🌐 Netlify + Neon Setup

#### 1. Configurar Banco Neon

```bash
# 1. Criar conta em neon.tech
# 2. Criar novo projeto PostgreSQL
# 3. Executar scripts SQL:

# Estrutura das tabelas
psql "sua-connection-string" -f database/schema.sql

# Usuários padrão
psql "sua-connection-string" -f database/usuarios_hasheados.sql

# Dados de exemplo (opcional)
psql "sua-connection-string" -f database/dados_exemplo.sql
```

#### 2. Deploy na Netlify

```bash
# Via CLI da Netlify
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod

# Ou conectar via GitHub no painel da Netlify
```

#### 3. Variáveis de Ambiente na Netlify

No painel da Netlify, configure:

```
Site Settings > Environment variables

DATABASE_URL = postgresql://user:pass@host/db?sslmode=require
JWT_SECRET = sua-chave-super-secreta-de-producao
NODE_ENV = production
```

#### 4. Configurações Build

```toml
# netlify.toml
[build]
  functions = "netlify/functions"
  command = "npm install"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api-complete/:splat"
  status = 200
```

### 🔒 Configurações de Segurança

#### Headers de Segurança
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com fonts.googleapis.com"
```

#### HTTPS e SSL
- Certificado SSL automático via Netlify
- Redirecionamento HTTP → HTTPS forçado
- HSTS (HTTP Strict Transport Security)

### 📊 Monitoramento

#### Logs da Aplicação
```javascript
// Adicionar logging nas funções
console.log(`[${new Date().toISOString()}] Login attempt: ${username}`);
console.error(`[${new Date().toISOString()}] Error:`, error.message);
```

#### Métricas Netlify
- Acessar Analytics no painel da Netlify
- Monitorar Functions invocations
- Verificar bandwidth e storage

---

## 🚨 RESOLUÇÃO DE PROBLEMAS

### ❌ Problemas Comuns

#### 1. "Arquivo dashboard.html não encontrado"

**Problema**: Login redireciona para `admin/dashboard.html` mas arquivo está em `pages/dashboard.html`

**Solução**:
```javascript
// No arquivo js/login-simple.js, linha ~45
function redirectToDashboard() {
    window.location.href = 'pages/dashboard.html'; // ✅ Correto
    // NÃO: window.location.href = 'admin/dashboard.html'; // ❌ Errado
}
```

#### 2. "Erro 500 - Internal Server Error"

**Possíveis Causas**:
- Variáveis de ambiente não configuradas
- String de conexão do banco incorreta
- Token JWT inválido

**Debug**:
```javascript
// Verificar logs da função na Netlify
// Site Settings > Functions > View function logs

// Adicionar logs de debug
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'Não configurado');
```

#### 3. "CORS Error"

**Problema**: Erro de CORS ao fazer requisições para API

**Solução**:
```javascript
// Verificar headers CORS na API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};
```

#### 4. "Token Expired"

**Problema**: Token JWT expirado (24h)

**Solução**:
```javascript
// Implementar refresh automático
function checkTokenExpiration() {
  const token = localStorage.getItem('authToken');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    if (payload.exp < now) {
      // Token expirado - fazer logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '../index.html';
    }
  }
}

// Verificar a cada minuto
setInterval(checkTokenExpiration, 60000);
```

### 🔧 Ferramentas de Debug

#### 1. Console do Navegador
```javascript
// Verificar dados do usuário
console.log('User:', JSON.parse(localStorage.getItem('currentUser')));

// Verificar token
console.log('Token:', localStorage.getItem('authToken'));

// Testar conexão com API
fetch('/.netlify/functions/api-complete/dashboard', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
})
.then(r => r.json())
.then(console.log);
```

#### 2. Netlify Functions Logs
```bash
# CLI da Netlify
netlify functions:invoke api-complete --payload='{"path":"/dashboard","httpMethod":"GET"}'

# Ou via painel web:
# Site Settings > Functions > api-complete > Function log
```

#### 3. Teste de Conexão com Banco
```sql
-- Testar no console do Neon
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN ativo = true THEN 1 END) as usuarios_ativos
FROM usuarios;

-- Verificar últimos logins
SELECT username, ultimo_login 
FROM usuarios 
WHERE ultimo_login IS NOT NULL 
ORDER BY ultimo_login DESC 
LIMIT 5;
```

---

## 👤 MANUAL DO USUÁRIO

### 🚀 Primeiros Passos

#### 1. Acessando o Sistema
1. Abra o navegador (Chrome, Firefox, Safari ou Edge)
2. Digite o endereço: `https://seurestaurante.netlify.app`
3. Ou abra o arquivo `index.html` localmente

#### 2. Fazendo Login
1. Digite seu **usuário** (exemplo: `admin`)
2. Digite sua **senha** (exemplo: `admin123`)  
3. Clique em **"Entrar"**
4. Aguarde o redirecionamento para o dashboard

#### 3. Navegação Principal
- **Menu lateral**: Clique nos ícones para navegar
- **Toggle menu**: Botão ☰ para expandir/contrair
- **Logout**: Botão no canto superior direito

### 📊 Usando o Dashboard

#### Visão Geral
O dashboard mostra informações em tempo real:

1. **Cards de Resumo**
   - 💰 Vendas do dia (valor + quantidade)
   - 📋 Pedidos ativos
   - 🪑 Mesas ocupadas  
   - 📦 Produtos em falta

2. **Gráfico de Vendas**
   - Vendas dos últimos 7 dias
   - Hover para ver valores exatos

3. **Atualizações Automáticas**
   - Dados atualizados a cada 30 segundos
   - Indicador "Última atualização" no rodapé

### 💰 Módulo de Vendas

#### Processando uma Venda
1. No menu, clique em **"💰 Vendas"**
2. Clique em **"Nova Venda"**
3. Selecione a **mesa** ou digite **"Balcão"**
4. Adicione **itens do pedido**:
   - Clique no produto
   - Ajuste a quantidade
   - Adicione observações (opcional)
5. Revise o **total** (subtotal + taxa de serviço)
6. Escolha o **método de pagamento**:
   - 💵 Dinheiro (digite valor recebido)
   - 💳 Cartão (digite número da transação)
   - 📱 PIX (futuro)
7. Clique em **"Finalizar Venda"**

#### Métodos de Pagamento

**💵 Dinheiro**:
- Digite o valor recebido
- Sistema calcula o troco automaticamente
- Confirme o troco com o cliente

**💳 Cartão de Crédito/Débito**:
- Digite o número da transação
- Aguarde aprovação da maquininha
- Entregue o comprovante ao cliente

### 🪑 Gestão de Mesas

#### Visualização das Mesas
- **🟢 Verde**: Mesa livre
- **🔴 Vermelho**: Mesa ocupada
- **🟡 Amarelo**: Mesa reservada
- **⚫ Cinza**: Mesa em manutenção

#### Operações com Mesas
1. **Ocupar mesa livre**:
   - Clique na mesa verde
   - Selecione "Ocupar Mesa"
   - Digite nome do cliente (opcional)

2. **Liberar mesa ocupada**:
   - Clique na mesa vermelha  
   - Confirme que o cliente já pagou
   - Mesa volta ao status livre

3. **Fazer reserva**:
   - Clique na mesa livre
   - Selecione "Reservar Mesa"
   - Digite dados da reserva

### 📋 Sistema de Pedidos

#### Criando um Novo Pedido
1. Clique em **"📋 Pedidos"**
2. Clique em **"+ Novo Pedido"**
3. **Selecione a mesa** (ou "Balcão/Delivery")
4. **Dados do cliente**:
   - Nome (obrigatório)
   - Telefone (opcional)
5. **Adicionar itens**:
   - Navegue pelas categorias
   - Clique no produto desejado
   - Ajuste quantidade com **+ / -**
   - Adicione observações se necessário
6. **Confirmar pedido**:
   - Revise itens e total
   - Clique em "Confirmar Pedido"

#### Acompanhamento de Pedidos
- **🟡 Aberto**: Pedido criado, aguardando confirmação
- **🔵 Confirmado**: Cliente confirmou, enviado para cozinha  
- **🟠 Preparando**: Cozinha iniciou preparo
- **🟢 Pronto**: Prato pronto, aguardando entrega
- **✅ Entregue**: Pedido entregue ao cliente
- **💰 Pago**: Pagamento processado

### 📖 Gerenciando o Cardápio

#### Visualizando Produtos
1. Clique em **"📖 Cardápio"**
2. Use **filtros por categoria**:
   - 🌱 Entradas
   - 🍽️ Pratos Principais  
   - 🍹 Bebidas
   - 🍰 Sobremesas
3. **Informações exibidas**:
   - Nome e descrição
   - Preço atual
   - Status (disponível/indisponível)
   - Tempo de preparo

#### Adicionando Novo Produto (Admin/Gerente)
1. Clique em **"+ Novo Produto"**
2. **Preencha os dados**:
   - Nome do produto
   - Descrição detalhada
   - Categoria
   - Preço de venda
   - Custo (opcional)
   - Tempo de preparo (minutos)
   - Ingredientes principais
   - Informações de alérgenos
3. **Upload de imagem** (opcional)
4. Clique em **"Salvar Produto"**

#### Editando Produtos
1. Na lista de produtos, clique em **"✏️ Editar"**
2. Modifique os campos desejados
3. **Para alterar preço**:
   - Sistema registra histórico de preços
   - Pedidos em andamento mantêm preço original
4. **Disponibilidade**:
   - Toggle "Disponível" liga/desliga produto
   - Produtos indisponíveis não aparecem nos pedidos

### 📦 Controle de Estoque

#### Visualização do Estoque
1. Clique em **"📦 Estoque"**
2. **Informações exibidas**:
   - Nome do produto
   - Quantidade atual
   - Unidade de medida (kg, L, unidades)
   - Quantidade mínima (alerta)
   - Status (normal/baixo/crítico)

#### Alertas de Estoque
- **🟡 Baixo**: Quantidade abaixo do mínimo
- **🔴 Crítico**: Produto acabando (< 10% do mínimo)
- **Notificações automáticas** no dashboard

#### Movimentação de Estoque
1. **Entrada de produtos**:
   - Clique em "📥 Entrada"
   - Digite quantidade recebida
   - Adicione nota fiscal (opcional)
   - Confirme entrada

2. **Saída de produtos**:
   - Registrada automaticamente nos pedidos
   - Saída manual para perdas/quebras

### 👥 Gestão de Usuários (Admin)

#### Criando Novo Usuário
1. Clique em **"👥 Usuários"**
2. Clique em **"+ Novo Usuário"**
3. **Preencha os dados**:
   - Nome completo
   - Nome de usuário (login)
   - E-mail
   - Telefone
   - **Perfil de acesso**:
     - 👑 Admin (acesso total)
     - 👔 Gerente (gestão operacional)
     - 🍽️ Garçom (pedidos e mesas)
     - 👨‍🍳 Cozinha (pedidos da cozinha)
     - 💰 Caixa (vendas e pagamentos)
4. **Definir senha inicial**
5. Clique em **"Criar Usuário"**

#### Gerenciando Permissões
- **Admin**: Todas as funcionalidades
- **Gerente**: Dashboard, vendas, relatórios, cardápio
- **Garçom**: Pedidos, mesas, cardápio (visualização)
- **Cozinha**: Pedidos da cozinha, controle de preparo
- **Caixa**: Vendas, pagamentos, fechamento

### 📊 Relatórios

#### Relatório de Vendas Diárias
1. Clique em **"📊 Relatórios"**
2. Selecione **"Vendas Diárias"**
3. **Escolha o período**:
   - Data específica
   - Última semana
   - Último mês
4. **Informações exibidas**:
   - Total de vendas (R$)
   - Número de pedidos
   - Ticket médio
   - Métodos de pagamento utilizados
   - Produtos mais vendidos

#### Relatório de Performance
- **Vendas por garçom**
- **Tempo médio de atendimento**  
- **Mesas mais utilizadas**
- **Horários de pico**

### ⚙️ Configurações do Sistema

#### Configurações Gerais
1. **Dados do restaurante**:
   - Nome, endereço, telefone
   - Logo e cores da marca
   - Horário de funcionamento

2. **Configurações de venda**:
   - Taxa de serviço (%)
   - Métodos de pagamento aceitos
   - Tempo padrão de preparo

3. **Configurações de estoque**:
   - Alertas de quantidade mínima
   - Unidades de medida padrão

#### Backup e Segurança
- **Backup automático**: Dados salvos na nuvem
- **Logs de auditoria**: Registro de todas as ações
- **Sessões de usuário**: Controle de acesso ativo

### 📱 Uso no Mobile

#### Acessibilidade Mobile
- **Interface responsiva** para smartphones
- **Menu otimizado** para toque
- **Botões grandes** para facilitar uso

#### Funcionalidades Mobile
- ✅ Login e navegação
- ✅ Criação de pedidos
- ✅ Consulta de mesas
- ✅ Processamento de vendas
- ✅ Visualização do cardápio

#### Dicas para Uso Mobile
1. **Orientação**: Use preferencialmente em modo retrato
2. **Navegação**: Deslize para acessar menu lateral
3. **Zoom**: Aperte duas vezes para ampliar tabelas
4. **Economia de dados**: Sistema otimizado para 3G/4G

### 🚨 Situações de Emergência

#### Sistema Offline
Se o sistema sair do ar:
1. **Continue anotando pedidos** em papel
2. **Use calculadora** para totais
3. **Processe pagamentos** normalmente
4. **Quando voltar**: Registre pedidos no sistema

#### Problemas de Login
1. **Verifique usuário/senha**
2. **Teste com outro navegador**
3. **Limpe cache** do navegador
4. **Contate administrador** se persistir

#### Erro nos Dados
1. **Anote o erro** detalhadamente  
2. **Tire print da tela** se possível
3. **Continue operação** em papel
4. **Reporte ao suporte** técnico

---

## 📞 SUPORTE E CONTATO

### 🆘 Suporte Técnico

**Para problemas técnicos:**
- 📧 Email: `suporte.tecnico@mariaflor.com`
- 📱 WhatsApp: `(71) 99999-9999`
- 🕐 Horário: Segunda a Sexta, 8h às 18h

### 👨‍💻 Desenvolvimento

**Para customizações e melhorias:**
- 📧 Email: `desenvolvimento@mariaflor.com`
- 💻 GitHub: [cristiano-superacao/bar_restaurante](https://github.com/cristiano-superacao/bar_restaurante)

### 📚 Documentação Adicional

- 🌐 **Site oficial**: `https://mariaflor.com`
- 📖 **Wiki do projeto**: `https://github.com/cristiano-superacao/bar_restaurante/wiki`
- 🎥 **Vídeos tutoriais**: `https://youtube.com/mariaflorsistema`

---

## 📝 CHANGELOG

### Versão 2.0.0 (22/10/2025)
- ✅ Sistema completo implementado
- ✅ Banco PostgreSQL estruturado
- ✅ APIs REST funcionais
- ✅ Interface responsiva
- ✅ Autenticação JWT
- ✅ Dashboard em tempo real

### Versão 1.5.0 (15/10/2025)
- ✅ Estrutura básica criada
- ✅ Login implementado
- ✅ Layout responsivo

### Próximas Versões
- 📱 **v2.1.0**: App mobile PWA
- 🚚 **v2.2.0**: Sistema de delivery
- 📊 **v2.3.0**: Relatórios avançados
- 🤖 **v2.4.0**: Integração WhatsApp

---

## 📄 LICENÇA

Este projeto está licenciado sob a **Licença MIT**.

**Copyright © 2025 Maria Flor Restaurant System**

Desenvolvido com ❤️ para revolucionar a gestão de restaurantes.

**📍 Salvador, BA - Bairro do Resgate**  
**🌟 Sistema Maria Flor - A tecnologia que seu restaurante merece!**

---

*📚 Esta documentação é um documento vivo e será atualizada conforme o sistema evolui.*