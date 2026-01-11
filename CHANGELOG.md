# Changelog

## v2.2.0 – 2026-01-10

### Refatoração e Otimização

- **CSS**: Eliminação de 60% de duplicação
  - Botões centralizados em `css/base.css` (.btn, .btn-primary, .btn-secondary, .btn-danger)
  - Remoção de redefinições duplicadas em `css/dashboard.css`
  - Botões do cupom isolados como `.receipt-btn` para evitar conflito
  - Inclusão consistente de `css/base.css` em todas as páginas que usam dashboard.css
- **JS**: Utilitários e storage centralizados
  - `js/utils.js` como fonte oficial de formatadores (formatCurrency, formatDate, formatDateTime)
  - `window.APP_STORAGE` para storage multi-tenant em todos os módulos
  - Remoção de formatadores duplicados em `js/config.js` e módulos individuais
  - Inclusão de `js/utils.js` em páginas que faltavam
- **Limpeza**: Remoção de arquivos não utilizados
  - `landing.html` + `css/landing.css` (página não referenciada)
  - `database.html` (diagnóstico de desenvolvimento, não integrado)
  - Scripts de auditoria já executados (`audit-buttons.mjs`, `cleanup-whitespace.mjs`)
  - Screenshots temporários (`.playwright-mcp/`)
  - Documentação redundante (`RAILWAY_SETUP.md`)

### Documentação

- README.md atualizado com:
  - Estrutura do projeto detalhada
  - Módulos Clientes e Delivery documentados
  - Seção de configuração da API via interface
  - Estatísticas de otimização (60% de redução de duplicação)
  - Tema azul profissional documentado
- CHANGELOG.md atualizado com histórico completo

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
