# Sistema de Gestão para Bar e Restaurante

## Visão Geral

Este é um sistema de gestão completo para bares e restaurantes, desenvolvido com **arquitetura híbrida progressiva**. Funciona 100% offline (LocalStorage) ou com backend completo (Express + Postgres), mantendo a mesma interface responsiva e profissional em ambos os modos.

## 🚀 Novidades (Janeiro 2026)

### Backend e Infraestrutura

- ✅ **Backend Express + PostgreSQL** compatível com Railway
- ✅ **Autenticação JWT** com guards de página
- ✅ **API REST completa** para todas as funcionalidades
- ✅ **Modo híbrido**: funciona com ou sem backend
- ✅ **Zero breaking changes** na interface
- ✅ **Deploy pronto** para produção
- ✅ **Multi-tenant** com escopo por `company_id`

### Design System Modernizado

- ✅ **Componentes compartilhados** centralizados em `css/base.css`
- ✅ **Eliminação de ~60% duplicação CSS/JS**
- ✅ **Botões padronizados** (.btn, .btn-primary, .btn-secondary, .btn-danger)
- ✅ **Utilitários centralizados** (formatação, storage, validação)
- ✅ **Tema azul profissional** com variáveis CSS
- ✅ **Layout 100% responsivo** (mobile/tablet/desktop)
- ✅ **Métricas em tempo real** em todas as páginas
- ✅ **Filtros e buscas** padronizados
- ✅ **Novas páginas**: Usuários, Empresas, Manual, Clientes, Delivery

## 📚 Documentação

- **[Guia de Deploy Railway](DEPLOY_RAILWAY.md)** - Como fazer deploy do backend
- **[Guia de Migração API](MIGRACAO_API.md)** - Como ativar/desativar a API

## Funcionalidades Principais

### 📊 Dashboard e Navegação

- **Dashboard Intuitivo**: Visão geral com acesso rápido a todas as funcionalidades
- **Sidebar responsiva**: Menu lateral com ícones e navegação fluida
- **Design System**: Componentes compartilhados e consistentes

### 📋 Módulos de Gestão

#### 🍽️ Cardápio

- Cadastro completo de itens (nome, categoria, preço, descrição)
- Busca e filtro por categoria
- **Métricas**: Total de itens, categorias, preço médio
- Cards visuais organizados por categoria

#### 📝 Pedidos

- Criação de pedidos com seleção de mesa e itens
- Atualização de status (Pendente → Em Preparo → Entregue)
- **Métricas**: Contadores por status em tempo real
- Busca por mesa ou ID, filtro por status

#### 🪑 Mesas

- Gerenciamento de mesas (nome, capacidade, status)
- Status visual (Livre/Ocupada)
- **Métricas**: Livres, Ocupadas, Total, Capacidade total
- Busca por nome e filtro de status

#### 📅 Reservas

- Agendamento com data, hora, cliente e nº de pessoas
- Status (Confirmada, Pendente, Cancelada)
- **Métricas**: Contadores por status
- Busca por nome/telefone, filtros de data e status

#### 📦 Estoque

- Controle de produtos com quantidade e estoque mínimo
- Alertas visuais (Baixo, Crítico, OK)
- **Métricas**: Total itens, Baixo, Crítico, OK
- Busca e filtro por categoria

#### 💰 Financeiro

- Registro de receitas e despesas
- **Métricas**: Saldo, Receitas, Despesas, Previsão
- Busca por descrição, filtros de tipo e status
- Empty-state quando sem transações

#### 📈 Relatórios

- Gráficos interativos (Chart.js)
- Top itens mais vendidos, vendas por categoria
- **Filtro de período**: Hoje, 7 dias, 30 dias, Todos
- Métricas de vendas totais e pedidos

#### 🏍️ Delivery

- Gerenciamento de entregas com endereço completo
- Taxa de entrega configurável
- Status (Pendente → Em Preparo → Entregue)
- **Métricas**: Contadores por status
- Busca e filtros integrados

#### 👤 Clientes

- Cadastro completo com CPF, telefone, email
- Histórico de pedidos e preferências
- **Métricas**: Total de clientes, ativos
- Busca por nome/CPF/telefone

#### ⚙️ Configurações

- Visualização de perfil do usuário
- **Configuração de API**: habilitar/testar conexão com backend
- Exportação de dados (backup JSON)
- Limpeza de dados (reset completo)
- Busca e filtro por seção

### 🆕 Novas Páginas

- **👥 Usuários**: Gestão de usuários e permissões
- **🏢 Empresas**: Gestão multi-tenant com seleção de contexto
- **📖 Manual**: Busca por módulo, links rápidos, documentação integrada
- **👤 Clientes**: Cadastro completo de clientes com CPF/telefone
- **🏍️ Delivery**: Gestão de entregas com endereços e taxas

### 🎨 Design e UX

- **Layout responsivo**: Adapta-se a mobile, tablet e desktop
- **Empty-states**: Feedback visual quando não há dados
- **Stat cards**: Métricas rápidas em cada página
- **Toolbar unificada**: Busca e filtros padronizados
- **Tema azul profissional**: Paleta consistente e acessível (`--blue-600`, `--primary-color`)
- **Base.css compartilhado**: Botões, formulários e utilitários centralizados
- **Zero duplicação**: Componentes reutilizáveis em todos os módulos

## Estrutura do Projeto

```
bar_restaurante/
├── css/                    # Estilos organizados por página
│   ├── base.css           # Estilos base compartilhados (botões, forms, utilities)
│   ├── dashboard.css      # Layout sidebar/main-content
│   ├── login.css          # Página de login
│   ├── cardapio.css       # Estilos específicos do cardápio
│   ├── pedidos.css        # Estilos específicos de pedidos
│   └── ...                # Outros módulos
├── js/                     # Scripts organizados por módulo
│   ├── config.js          # Configuração global e API
│   ├── utils.js           # Utilitários compartilhados (formatação, storage)
│   ├── api.js             # Cliente HTTP e storage multi-tenant
│   ├── auth-neon.js       # Autenticação e guards
│   ├── cardapio.js        # Lógica do cardápio
│   ├── pedidos.js         # Lógica de pedidos
│   └── ...                # Outros módulos
├── server/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── index.js       # Entrypoint com auto-migração
│   │   ├── db.js          # Cliente PostgreSQL
│   │   ├── migrate.js     # Sistema de migração
│   │   ├── middleware/    # Auth JWT
│   │   ├── migrations/    # SQL schemas
│   │   └── routes/        # Endpoints por módulo
│   ├── package.json
│   └── README.md
├── *.html                  # Páginas do sistema
├── README.md              # Este arquivo
├── DEPLOY_RAILWAY.md      # Guia de deploy
├── MIGRACAO_API.md        # Guia de ativação da API
└── CHANGELOG.md           # Histórico de mudanças
```

## Tecnologias Utilizadas

### Frontend

- **HTML5:** Estrutura semântica das páginas
- **CSS3:** Design responsivo com Flexbox, Grid e variáveis CSS
- **JavaScript (ES6+):** Lógica da aplicação e manipulação do DOM
- **Chart.js:** Gráficos dinâmicos na página de relatórios
- **Font Awesome:** Ícones em toda a interface
- **LocalStorage:** Persistência de dados no navegador (modo offline)

### Backend (Opcional)

- **Node.js + Express:** API REST
- **PostgreSQL:** Banco de dados relacional
- **JWT (jsonwebtoken):** Autenticação segura
- **bcryptjs:** Criptografia de senhas
- **Railway:** Plataforma de deploy

---

## Como Utilizar o Sistema

### 1. Acesso e Login

Para começar, acesse o sistema. Você será direcionado para a página de login.

**Credenciais padrão:**

- **Admin (empresa Default):** `admin` / `admin123`
- **Superadmin (todas as empresas):** `superadmin` / `superadmin123`

> ⚠️ **Produção:** Altere a senha padrão no banco de dados antes de usar em produção!

Após inserir as credenciais, você será levado ao Dashboard principal.

### 2. Navegação

O menu lateral à esquerda contém links para todas as seções do sistema:

- **Dashboard** → Página inicial com visão geral
- **Cardápio** → Gestão de itens do menu (com métricas)
- **Pedidos** → Controle de pedidos por status
- **Clientes** → Cadastro e gestão de clientes
- **Delivery** → Gestão de entregas com endereços
- **Mesas** → Visualização de ocupação e capacidade
- **Reservas** → Gerenciamento de agendamentos
- **Estoque** → Controle de inventário e alertas
- **Financeiro** → Receitas, despesas e saldo
- **Relatórios** → Gráficos e análises por período
- **Configurações** → Perfil, API, backup e reset de dados
- **Usuários** → Gestão de contas e permissões
- **Empresas** → Gestão multi-tenant e seleção de contexto
- **Manual** → Documentação e ajuda integrada

Em telas menores (como celulares), o menu fica oculto e pode ser aberto clicando no ícone de "hambúrguer" (☰) no canto superior esquerdo.

### 3. Usando os Módulos

Todas as páginas de gestão seguem um padrão consistente:

#### Interface Unificada

- **Toolbar superior**: Busca e filtros padronizados
- **Stat Cards**: Métricas em tempo real logo abaixo
- **Lista/Grid**: Conteúdo principal organizado visualmente
- **Empty-state**: Feedback claro quando não há dados

#### Ações Comuns

- **➕ Adicionar**: Botão verde no canto superior direito da toolbar
- **✏️ Editar**: Clique no item ou botão de edição para modificar
- **🗑️ Excluir**: Botão vermelho para remover (confirmação obrigatória)
- **🔍 Buscar**: Campo de busca na toolbar (busca em tempo real)
- **🎛️ Filtrar**: Filtros "pill" com dropdown para refinar resultados

#### Métricas em Tempo Real

Cada página exibe cards com indicadores principais:

- **Cardápio**: Total itens, categorias, preço médio
- **Pedidos**: Pendentes, em preparo, entregues, cancelados
- **Mesas**: Livres, ocupadas, total, capacidade
- **Reservas**: Confirmadas, pendentes, canceladas, total
- **Estoque**: Total, baixo, crítico, OK
- **Financeiro**: Saldo, receitas, despesas, previsão
- **Relatórios**: Vendas totais, nº de pedidos

### 5. Configuração da API (Opcional)

O sistema pode funcionar totalmente offline ou conectado a um backend na nuvem.

#### Para ativar o modo API:

1. Acesse **Configurações** no menu lateral
2. Clique na aba **"Conexão com API"**
3. Marque **"API habilitada"**
4. Insira a **URL da API** (ex: `https://seu-servico.up.railway.app`)
5. Clique em **"Testar"** para verificar conectividade
6. Se bem-sucedido, clique em **"Salvar"**
7. A página recarregará e os dados passarão a vir do backend

#### Para voltar ao modo offline:

1. Vá em **Configurações → Conexão com API**
2. Desmarque **"API habilitada"**
3. Salve e recarregue

> 💡 **Dica**: A configuração fica salva no LocalStorage, você pode usar o sistema em diferentes computadores com configurações distintas.

Para mais detalhes, veja [MIGRACAO_API.md](MIGRACAO_API.md)

#### Responsividade

O layout se adapta automaticamente:

- **Desktop** (>1024px): Sidebar fixa, 4 cards por linha
- **Tablet** (768-1024px): Sidebar retrátil, 2 cards por linha
- **Mobile** (<768px): Menu hambúrguer, 1 card por linha

### 4. Persistência de Dados

O sistema suporta dois modos de operação:

#### Modo LocalStorage (Padrão)

Todos os dados são salvos no **LocalStorage do seu navegador**:

- ✅ Dados disponíveis mesmo após fechar o navegador
- ✅ Funciona 100% offline
- ⚠️ Dados locais (não compartilhados entre dispositivos)
- ⚠️ Sem backup automático

Para gerenciar dados:

- **Backup:** Vá em **Configurações** → **"Exportar Dados (JSON)"**
- **Limpar:** Vá em **Configurações** → **"Limpar Todos os Dados"**

#### Modo API + PostgreSQL

Com o backend ativado, os dados são salvos no servidor:

- ✅ Dados centralizados e compartilhados
- ✅ Multi-usuário simultâneo
- ✅ Backup automático no banco
- ✅ Segurança com JWT
- ⚠️ Requer conexão com internet

Para ativar, veja [MIGRACAO_API.md](MIGRACAO_API.md)

---

## 🌐 Modo Cloud (Railway)

Para salvar tudo na nuvem com acesso em qualquer computador e persistência por módulo:

- **Backend no Railway:** deploy do diretório `server/` com Postgres gerenciado.
- **Auto-migrações:** `server/src/index.js` aplica [server/src/migrations/schema.sql](server/src/migrations/schema.sql) em cada inicialização (idempotente).
- **Autenticação:** JWT via `/api/auth/login`.

### Habilitar API no Frontend

Opção recomendada (sem alterar código):

1. Abra **Configurações → Conexão com API** em [configuracoes.html](configuracoes.html)
2. **API habilitada:** marcar
3. **URL da API:** `https://SEU_SERVICO.up.railway.app`
4. Testar e salvar (persistido em LocalStorage, funciona em qualquer PC)

Opcional por código: ajuste `API.enabled=true` e `API.baseUrl` em [js/config.js](js/config.js).

### Escopo Multi-empresa (company_id)

- Usuários `admin/staff`: contexto de empresa vem no JWT automaticamente.
- `superadmin`: informe empresa via `X-Company-Id` header ou `?companyId=...` query.

### Mapeamento por Módulo (Rotas ↔ Tabelas)

- **Cardápio:** `GET/POST/PUT/DELETE /api/menu-items` ↔ `menu_items (company_id)`
- **Mesas:** `GET/POST/PUT/DELETE /api/tables` ↔ `tables (company_id)`
- **Pedidos:** `GET/POST/PUT/DELETE /api/orders` (+ itens) ↔ `orders / order_items (company_id)`
- **Estoque:** `GET/POST/PUT/DELETE /api/stock` ↔ `stock (company_id)`
- **Clientes:** `GET/POST/PUT/DELETE /api/customers` ↔ `customers (company_id)`
- **Reservas:** `GET/POST/PUT/DELETE /api/reservations` ↔ `reservations (company_id)`
- **Financeiro:** `GET/POST/PUT/DELETE /api/transactions` ↔ `transactions (company_id)`
- **Usuários:** `GET/POST/PUT/DELETE /api/users` ↔ `users (company_id opcional)`
- **Empresas:** `GET/POST/PUT /api/companies` ↔ `companies`
- **Database:** `GET /api/database/info`, `GET /api/database/schema/:table`

### Variáveis no Railway

No serviço `server/` defina:

```
DATABASE_URL=postgres://... (fornecido pelo Railway)
JWT_SECRET=um_token_forte_de_32+_chars
PORT=3000
NODE_ENV=production
```

### Testes Rápidos (curl)

```
# Login superadmin
curl -X POST https://SEU_SERVICO.up.railway.app/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"username":"superadmin","password":"superadmin123"}'

# Listar empresas
curl -H "Authorization: Bearer $TOKEN" \
	https://SEU_SERVICO.up.railway.app/api/companies

# Listar cardápio de uma empresa (superadmin)
curl -H "Authorization: Bearer $TOKEN" -H "X-Company-Id: 1" \
	https://SEU_SERVICO.up.railway.app/api/menu-items
```

### Layout Responsivo

O frontend permanece responsivo e profissional (mobile/desktop), independente do modo. Ao habilitar a API, os dados passam a ser centralizados no Postgres sem alterar a UX.

---

## ⚡ Quick Start

### Frontend (modo offline)

- Abra `index.html` diretamente no navegador, ou sirva a pasta com um servidor simples:

```bash
# usando Python
python -m http.server 5500

# ou usando Node (npx)
npx serve .
```

### Backend local (API)

```bash
cd server
npm install

# crie .env com suas variáveis
# DATABASE_URL=postgres://user:password@host:5432/db
# JWT_SECRET=um_segredo_forte_de_32+_chars
# PORT=3000

npm start
# As migrações são aplicadas automaticamente ao iniciar
```

Depois, ative a API pela tela **Configurações → Conexão com API** informando `http://localhost:3000`.
