# 🚀 Guia de Deploy

Este guia consolida todas as opções de deployment do sistema Bar & Restaurante.

## 📋 Índice

1. [Deploy do Backend](#deploy-do-backend)
   - [Railway (Recomendado)](#railway-recomendado)
   - [Docker Local](#docker-local)
   - [Local sem Docker](#local-sem-docker)
2. [Deploy do Frontend](#deploy-do-frontend)
   - [Netlify](#netlify)
   - [Vercel](#vercel)
   - [Servidor Estático](#servidor-estático)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [CI/CD](#cicd)

---

## Deploy do Backend

### Railway (Recomendado)

Railway oferece deploy automático com PostgreSQL integrado.

#### Passo 1: Preparar o Projeto

```bash
cd server
npm install
```

#### Passo 2: Criar Conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Crie um novo projeto

#### Passo 3: Adicionar PostgreSQL

1. No dashboard do projeto, clique em "New"
2. Selecione "Database" → "PostgreSQL"
3. Aguarde a criação (1-2 minutos)

#### Passo 4: Deploy da Aplicação

**Opção A: Via CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Linkar projeto
railway link

# Deploy
railway up
```

**Opção B: Via GitHub**

1. Conecte seu repositório GitHub ao Railway
2. Selecione a pasta `server/` como root
3. Railway detectará automaticamente o `package.json`
4. Deploy será automático a cada push

#### Passo 5: Configurar Variáveis de Ambiente

No dashboard do Railway, adicione:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=seu_segredo_super_secreto_aqui
JWT_REFRESH_SECRET=seu_refresh_secret_aqui
FRONTEND_URL=https://seu-frontend.netlify.app
```

> **Nota**: `${{Postgres.DATABASE_URL}}` é automaticamente preenchido pelo Railway

#### Passo 6: Executar Migrações

```bash
# Via CLI do Railway
railway run npm run migrate

# Ou conecte ao PostgreSQL diretamente
railway connect Postgres
# Execute o script server/src/migrations/schema.sql
```

#### Passo 7: Obter URL da API

1. No dashboard, vá em "Settings"
2. Clique em "Generate Domain"
3. Sua API estará disponível em: `https://seu-app.up.railway.app`

---

### Docker Local

#### Pré-requisitos

- Docker Desktop instalado
- Docker Compose instalado

#### Passo 1: Configurar docker-compose.yml

Arquivo já configurado em `server/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: baruser
      POSTGRES_PASSWORD: barpassword
      POSTGRES_DB: bar_restaurante
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://baruser:barpassword@postgres:5432/bar_restaurante
      JWT_SECRET: dev_secret_key
      JWT_REFRESH_SECRET: dev_refresh_secret
      NODE_ENV: development
    depends_on:
      - postgres
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json

volumes:
  postgres_data:
```

#### Passo 2: Build e Start

```bash
cd server
docker-compose up -d --build
```

#### Passo 3: Executar Migrações

```bash
# Conectar ao container da aplicação
docker-compose exec app npm run migrate

# Ou executar diretamente no PostgreSQL
docker-compose exec postgres psql -U baruser -d bar_restaurante -f /app/src/migrations/schema.sql
```

#### Passo 4: Verificar Status

```bash
# Logs da aplicação
docker-compose logs -f app

# Status dos containers
docker-compose ps
```

#### Comandos Úteis

```bash
# Parar containers
docker-compose down

# Parar e remover volumes (dados serão perdidos)
docker-compose down -v

# Rebuild completo
docker-compose up -d --build --force-recreate
```

---

### Local sem Docker

#### Passo 1: Instalar PostgreSQL

**Windows**
- Download: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
- Instale e anote usuário/senha configurados

**Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (via Homebrew)**
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Passo 2: Criar Banco de Dados

```bash
# Acessar psql
psql -U postgres

# Criar database
CREATE DATABASE bar_restaurante;

# Criar usuário
CREATE USER baruser WITH PASSWORD 'barpassword';

# Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE bar_restaurante TO baruser;

\q
```

#### Passo 3: Configurar .env

Crie `server/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://baruser:barpassword@localhost:5432/bar_restaurante
JWT_SECRET=dev_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
FRONTEND_URL=http://localhost:8080
```

#### Passo 4: Instalar Dependências

```bash
cd server
npm install
```

#### Passo 5: Executar Migrações

```bash
npm run migrate
```

#### Passo 6: Iniciar Servidor

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

API estará disponível em: `http://localhost:3000`

---

## Deploy do Frontend

### Netlify

#### Passo 1: Preparar o Projeto

O frontend já está pronto para deploy estático (HTML/CSS/JS puro).

#### Passo 2: Deploy via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (na raiz do projeto)
netlify deploy

# Deploy de produção
netlify deploy --prod
```

#### Passo 3: Deploy via Interface Web

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte seu repositório GitHub
4. Configure:
   - **Branch**: `main`
   - **Build command**: (deixe vazio)
   - **Publish directory**: `/` (raiz do projeto)
5. Clique em "Deploy site"

#### Passo 4: Configurar Variáveis de Ambiente

1. Vá em "Site settings" → "Environment variables"
2. Adicione: (não necessário para frontend estático, mas útil se usar build tools)

#### Passo 5: Configurar API URL

Edite `js/config.js`:

```javascript
const API_BASE_URL = 'https://seu-backend.up.railway.app/api';
```

Faça commit e push. Netlify fará redeploy automático.

#### Passo 6: Configurar Domínio Personalizado (Opcional)

1. Vá em "Domain settings"
2. Clique em "Add custom domain"
3. Siga instruções para configurar DNS

---

### Vercel

#### Deploy via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Produção
vercel --prod
```

#### Deploy via GitHub

1. Acesse [vercel.com](https://vercel.com)
2. "Import Project" → Conecte GitHub
3. Selecione o repositório
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (deixe vazio)
   - **Output Directory**: `.`
5. Deploy

---

### Servidor Estático

#### Nginx

**nginx.conf**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/bar_restaurante;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configurar CORS se necessário
    location /api {
        proxy_pass https://seu-backend.up.railway.app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Apache

**.htaccess**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

---

## Configuração do Banco de Dados

### Schema Completo

O schema está em `server/src/migrations/schema.sql`. Principais tabelas:

- **companies**: Multi-tenancy
- **users**: Autenticação e autorização
- **menu_items**: Cardápio
- **customers**: Clientes
- **tables**: Mesas
- **orders** + **order_items**: Pedidos
- **reservations**: Reservas
- **stock**: Controle de estoque
- **transactions**: Financeiro

### Executar Migrações

**Railway**
```bash
railway run npm run migrate
```

**Docker**
```bash
docker-compose exec app npm run migrate
```

**Local**
```bash
cd server
npm run migrate
```

### Backup do Banco

**PostgreSQL Local/Docker**
```bash
pg_dump -U baruser -d bar_restaurante > backup.sql
```

**Railway**
```bash
railway run pg_dump > backup.sql
```

### Restaurar Backup

```bash
psql -U baruser -d bar_restaurante < backup.sql
```

---

## Variáveis de Ambiente

### Backend (server/.env)

```env
# Ambiente
NODE_ENV=production

# Servidor
PORT=3000

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=seu_segredo_super_secreto_mínimo_32_caracteres
JWT_REFRESH_SECRET=seu_refresh_secret_diferente_também_longo
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://seu-frontend.netlify.app

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (js/config.js)

```javascript
const API_BASE_URL = 'https://seu-backend.up.railway.app/api';
const WS_URL = 'wss://seu-backend.up.railway.app'; // Para WebSockets futuro
```

---

## CI/CD

### GitHub Actions (Exemplo)

**`.github/workflows/deploy.yml`**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: '.'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🔍 Verificação Pós-Deploy

### Backend

```bash
# Health check
curl https://seu-backend.up.railway.app/api/health

# Deve retornar:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

### Frontend

1. Acesse a URL do frontend
2. Tente fazer login
3. Verifique Console do navegador (F12) para erros de conexão

### Banco de Dados

```bash
# Railway
railway connect Postgres

# Verificar tabelas
\dt

# Verificar usuário padrão
SELECT * FROM users WHERE username = 'superadmin';
```

---

## 🐛 Troubleshooting

### Erro de CORS

Verifique `FRONTEND_URL` no backend e adicione ao array de origens permitidas em `server/src/index.js`:

```javascript
const corsOptions = {
  origin: [process.env.FRONTEND_URL, 'http://localhost:8080'],
  credentials: true
};
```

### Erro de Database Connection

- Verifique `DATABASE_URL` está correta
- Confirme que o PostgreSQL está rodando
- Teste conexão: `psql $DATABASE_URL`

### Migrações Não Aplicadas

```bash
# Forçar re-execução
railway run npm run rebuild
```

---

**Última atualização**: 12 de janeiro de 2026  
**Versão**: 3.0.0
