# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.2.0] - 2026-01-11

### � Adicionado

- **Dockerfile**: Build otimizado com Node 18 Alpine + healthcheck automático
- **Rota `/api/health`**: Endpoint para verificação de saúde (status + database connection)
- **Script `check-env.js`**: Validação de variáveis de ambiente antes do start
- **Railway configs**: `railway.json`, `railway.toml` para deploy determinístico
- **Documentação completa**:
  - README.md reformulado com badges, diagramas Mermaid e exemplos
  - INSTALL.md com guia passo-a-passo detalhado
  - RAILWAY_SETUP.md com checklist completo de configuração
  - CORRIGIR_ERRO_RAILWAY.md com troubleshooting específico
  - CONTRIBUTING.md com guia de contribuição
- **Migrações resilientes**: Normalização de dados legados antes de aplicar constraints
- **.dockerignore**: Otimização de contexto de build
- **Engines em package.json**: Requer Node ≥18.0.0 e npm ≥9.0.0

### 🔒 Segurança

- **Backend**: Validação de entrada com `express-validator` em todas as rotas
  - Validação em `menuItems`, `tables`, `stock`, `reservations`, `transactions`, `orders`
  - Proteção contra SQL injection e dados malformados
  - Mensagens de erro estruturadas com detalhes de validação
- **Headers HTTP**: Helmet configurado para headers seguros (CSP, XSS, HSTS)
- **Rate Limiting**: 
  - Global: 100 req/15min (reduzido de 1000 para produção)
  - Login: 5 tentativas/15min (anti-brute-force)
- **CORS**: Configurável via variável `CORS_ORIGIN`
- **JWT**: Tokens com expiração automática
- **Prepared Statements**: Todas as queries usam parametrização

### 🐛 Corrigido

- **Erro de migração**: `orders_status_chk` violada por dados legados
  - Normalização de status antigos (Aberto → Pendente, Fechado → Pago)
  - Constraints adicionadas como `NOT VALID` com validação tolerante
- **Erro de build Railway**: Root directory incorreto ("servidor" → "server")
- **Falha ao aplicar constraints**: Migrações agora são idempotentes e resilientes

### 🎨 Refatoração

- **CSS**: Consolidação de estilos
  - Remoção de duplicatas de `.form-group` em `configuracoes.css`
  - Modais centralizados em `base.css`
  - Toolbar e components compartilhados
  - Redução de ~60% de duplicação CSS
- **JS**: Utilitários centralizados
  - `js/utils.js` como fonte única de helpers
  - `CONSTANTS` e `populateSelect` compartilhados
  - Storage multi-tenant padronizado
  - Formatadores unificados (moeda, data, texto)

### 🔧 Melhorias

- **Docker**: Build em duas etapas com alpine para imagem menor
- **Healthcheck**: Container só fica "healthy" quando API responde
- **Validação pré-start**: `prestart` script valida env antes de iniciar
- **Error handling**: Mensagens de erro mais descritivas
- **Logs estruturados**: Emojis e formatação consistente
- **Deploy**: Suporte a múltiplos providers (Railway, Vercel, Netlify, Heroku)

- **API**: Respostas padronizadas e consistentes
- **Validação**: Scripts de validação UI e CSS (`scripts/`)
- **Performance**: Queries otimizadas e índices no banco
- **UX**: Empty states e feedback visual aprimorados

### 📚 Documentação

- README.md: Guia completo com badges, tecnologias e estrutura
- INSTALL.md: Instalação detalhada (local, Railway, Docker)
- CHANGELOG.md: Histórico completo de mudanças
- API: Documentação de endpoints com exemplos

### 🐛 Correções

- Validação de company_id em rotas multi-tenant
- Cálculo correto de totais em pedidos
- Tratamento de erros em transações
- Proteção contra dados inválidos

## [2.1.0] - 2026-01-10

### 🚀 Infraestrutura & Deploy

- **CI/CD**: GitHub Actions para deploy automático no Railway
- **Backend**: Auto-migrações aplicadas no startup
- **Docker**: Suporte a containerização
- **Railway**: Configuração completa com PostgreSQL gerenciado

### 💾 Banco de Dados

- **Seeds Idempotentes**:
  - Empresas de teste (A e B)
  - Usuários admin (adminA, adminB)
  - Dados demo por módulo (mesas, cardápio, estoque, pedidos, transações, reservas)
- **Índices de Performance**:
  - Índices em `company_id` para todas as tabelas
  - Backfills automáticos de `subtotal` e `total`
- **Migrations**: Sistema robusto e idempotente

### 🏢 Multi-empresa (Multi-tenant)

- **Isolamento de Dados**: Escopo por `company_id`
- **Header `X-Company-Id`**: Para superadmin trocar contexto
- **Rotas Escopadas**: Todas as entidades respeitam empresa
- **Gestão**: Módulo completo de empresas

### 🎨 Frontend

- **Configuração de API**: Via interface gráfica
- **LocalStorage**: Persistência de configurações
- **Modo Híbrido**: Offline (LocalStorage) ou Cloud (API)
- **Layout Responsivo**: Mobile, tablet e desktop
- **Design System**: Componentes padronizados

### 📦 Módulos

- Cardápio (menu_items)
- Mesas (tables)
- Pedidos (orders + order_items)
- Estoque (stock)
- Clientes (customers)
- Reservas (reservations)
- Financeiro (transactions)
- Usuários (users)
- Empresas (companies)

### 📖 Documentação

- DEPLOY_RAILWAY.md: Guia de deploy no Railway
- MIGRACAO_API.md: Como ativar/desativar API
- CONFIGURACAO_API.md: Configuração avançada
- server/README.md: Documentação do backend

## [2.0.0] - 2025-12-15

### 💥 Breaking Changes

- **Backend Completo**: Express + PostgreSQL
- **Autenticação JWT**: Login obrigatório
- **Multi-tenant**: Suporte a múltiplas empresas
- **Migrações**: Schema SQL versionado

### ✨ Novas Funcionalidades

- **API REST**: Endpoints completos para todos os módulos
- **Autenticação**: Login/registro com JWT
- **Roles**: superadmin, admin, staff
- **Segurança**: bcrypt, CORS, rate limiting
- **Validações**: Input validation em rotas críticas

### 🗄️ Banco de Dados

- PostgreSQL como banco principal
- Tabelas normalizadas
- Foreign keys e constraints
- Índices de performance
- Seeds de dados iniciais

### 🎨 UI/UX

- Dashboard redesenhado
- Sidebar responsiva
- Stat cards em tempo real
- Filtros e buscas padronizados
- Empty states informativos

## [1.5.0] - 2025-11-20

### ✨ Novas Páginas

- **Delivery**: Gestão de entregas com endereços
- **Clientes**: Cadastro completo (CPF, telefone, email)
- **Usuários**: Gestão de acessos e permissões
- **Empresas**: Seleção de contexto multi-tenant
- **Manual**: Documentação integrada no sistema

### 🎨 Design

- Tema azul profissional
- Paleta de cores consistente
- Variáveis CSS centralizadas
- Componentes reutilizáveis
- Layout totalmente responsivo

### 🔧 Melhorias

- Métricas em tempo real
- Busca instantânea
- Filtros avançados
- Exportação de dados
- Backup/restore

## [1.0.0] - 2025-10-01

### 🎉 Release Inicial

- **Módulos Base**:
  - Dashboard com visão geral
  - Cardápio com categorias
  - Pedidos (mesa)
  - Mesas com capacidade
  - Reservas
  - Estoque com alertas
  - Financeiro (receitas/despesas)
  - Relatórios com gráficos
  - Configurações

- **Persistência**: LocalStorage do navegador
- **Design**: Interface clean e intuitiva
- **Responsivo**: Mobile e desktop
- **Offline**: Funciona sem internet

---

## Tipos de Mudanças

- `Added` (Adicionado): Para novas funcionalidades
- `Changed` (Modificado): Para mudanças em funcionalidades existentes
- `Deprecated` (Obsoleto): Para funcionalidades que serão removidas
- `Removed` (Removido): Para funcionalidades removidas
- `Fixed` (Corrigido): Para correções de bugs
- `Security` (Segurança): Para vulnerabilidades corrigidas

## v2.1.0 – 2026-01-10

### Infra & Deploy
- CI/CD: workflow GitHub Actions para deploy automático no Railway
- Backend com auto-migrações aplicando schema.sql no startup

### Banco & Seeds
- Seeds idempotentes: empresas de teste (A e B) + admins (adminA, adminB)
- Seeds por módulo: mesas, cardápio, estoque, pedidos demo, transações financeiras, reservas
- Índices de performance e backfills de company_id, subtotal, total

### Frontend & Configuração
- Configuração de API via cliente (LocalStorage) em configuracoes.html
- Remoção de baseUrl fixa de produção
- Documentação atualizada para modo Cloud (Railway)

### Multi-empresa
- Rotas escopadas por company_id com X-Company-Id para superadmin
- Módulos: cardápio, mesas, pedidos (+itens), estoque, clientes, reservas, financeiro
- Gestão de usuários, empresas e diagnóstico de banco

### UI
- Layout responsivo e profissional preservado
- Uso de componentes e estilos padronizados
