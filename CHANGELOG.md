# Changelog

## v2.1.0 – 2026-01-10

### Infra & Deploy
- CI/CD: workflow GitHub Actions para deploy automático no Railway ([.github/workflows/railway-deploy.yml](.github/workflows/railway-deploy.yml))
- Backend com auto-migrações aplicando [server/src/migrations/schema.sql](server/src/migrations/schema.sql) no startup

### Banco & Seeds
- Seeds idempotentes: empresas de teste (A e B) + admins (`adminA`, `adminB`)
- Seeds por módulo: mesas, cardápio, estoque, pedidos demo, transações financeiras, reservas
- Índices de performance e backfills de `company_id`, `subtotal`, `total`

### Frontend & Configuração
- Configuração de API via cliente (LocalStorage) em [configuracoes.html](configuracoes.html); remoção de baseUrl fixa de produção
- Documentação atualizada para modo Cloud (Railway) em [README.md](README.md) e [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)

### Multi-empresa
- Rotas escopadas por `company_id` com `X-Company-Id` para superadmin
- Módulos: cardápio, mesas, pedidos (+itens), estoque, clientes, reservas, financeiro; usuários, empresas e diagnóstico de banco

### UI
- Layout responsivo e profissional preservado; uso de componentes e estilos padronizados
