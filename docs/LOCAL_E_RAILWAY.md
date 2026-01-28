# Local e Railway (Backend + Frontend)

Este guia deixa o sistema pronto para rodar **localmente** e também no **Railway**.

## 1) Rodar local (com API + Postgres)

### Atalho (recomendado)

Se estiver no Windows, você pode automatizar tudo (Docker + .env + migrate + seed + start):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1
```

### 1.1 Subir PostgreSQL (Docker)

Na pasta `server/` existe um `docker-compose.yml` com Postgres + Adminer.

No PowerShell, na raiz do projeto:

```powershell
Push-Location server
docker compose up -d
Pop-Location
```

- Postgres: `localhost:5432`
- Adminer: `http://localhost:8080`

Credenciais padrão do compose:
- usuário: `bar`
- senha: `bar`
- banco: `bar_restaurante`

### 1.2 Configurar variáveis do backend

Crie `server/.env` baseado em `server/.env.example`.

Exemplo (local):

```env
DATABASE_URL=postgresql://bar:bar@localhost:5432/bar_restaurante
JWT_SECRET=gere-um-segredo-com-32-ou-mais-caracteres
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8000

# Seed (opcional)
ALLOW_INSECURE_SEED=true
SEED_SUPERADMIN_PASSWORD=uma-senha-forte-aqui
SEED_ADMIN_PASSWORD=uma-senha-forte-aqui
```

### 1.3 Rodar migrações e (opcional) seed

```powershell
Push-Location server
npm install
npm run migrate
npm run seed
Pop-Location
```

### 1.4 Subir backend

```powershell
Push-Location server
npm run dev
Pop-Location
```

A API ficará em `http://localhost:3000`.

### 1.5 Subir frontend

Na raiz do projeto:

```powershell
npm install
npm run dev
```

O frontend vai subir em uma porta livre (ex.: `http://localhost:8001`).

### 1.6 Conectar frontend na API local

Opção A (recomendado): em Configurações → Conexão com API
- Clique em **Usar Local (localhost:3000)**
- Clique em **Testar Conexão**
- Clique em **Salvar Configurações**

Opção B (rápido via URL):
- Abra qualquer tela com `?api=local`
  - Ex.: `http://localhost:8001/dashboard.html?api=local`

## 2) Railway (API + Postgres)

### 2.1 Deploy do backend

Siga o guia principal de deploy: `DEPLOY_RAILWAY_COMPLETO.md`.

Variáveis mínimas no serviço do backend:
- `DATABASE_URL` (referência do serviço Postgres do Railway)
- `JWT_SECRET` (forte)
- `NODE_ENV=production`
- `CORS_ORIGIN=https://SEU_FRONTEND.netlify.app` (ou `*` em testes)

### 2.2 Conectar frontend na API do Railway

Opção A (recomendado): Configurações → Conexão com API
- Clique em **Usar Railway (padrão)**
- Ajuste a URL se seu domínio no Railway for diferente
- Teste e salve

Opção B (rápido via URL):
- `?api=railway`
  - Ex.: `https://seu-frontend.netlify.app/dashboard.html?api=railway`

## 3) Dica importante (segurança)

- Não use as senhas padrão do seed em produção.
- No Railway, evite rodar `seed` a menos que você saiba exatamente o impacto.
