# 🚀 Guia Completo de Deploy no Railway

> **Sistema Bar & Restaurante** - Deploy profissional em minutos

## 📋 Pré-requisitos

- ✅ Conta no [Railway.app](https://railway.app) (gratuita)
- ✅ Repositório GitHub conectado
- ✅ Git instalado localmente

---

## 🎯 Passo a Passo Rápido

### 1️⃣ Criar Projeto Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha este repositório

### 2️⃣ Adicionar PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Aguarde a criação (automática)

✅ O Railway cria automaticamente a variável `DATABASE_URL`

### 3️⃣ Configurar Backend

1. Clique no serviço do seu repositório
2. Vá em **"Settings"**
3. Configure:

#### Root Directory
```
server
```

#### Variáveis de Ambiente

Adicione manualmente estas variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `JWT_SECRET` | *(gerar)* | Chave secreta JWT (ver abaixo) |
| `PORT` | `3000` | Porta do servidor |
| `CORS_ORIGIN` | `*` | Permitir todas origens |
| `DATABASE_SSL` | `true` | SSL habilitado para Railway |

**🔐 Gerar JWT_SECRET:**

Execute no terminal local:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole no `JWT_SECRET`

### 4️⃣ Deploy Automático

✅ O Railway faz o build e deploy automaticamente!

Aguarde 2-3 minutos e acompanhe os logs.

### 5️⃣ Gerar URL Pública

1. No serviço backend, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada (ex: `https://bar-restaurante-production.up.railway.app`)

### 6️⃣ Conectar Frontend à API

**Opção A - Interface Visual (Recomendado):**

1. Abra `configuracoes.html` no navegador
2. Role até **"Conexão com API"**
3. Marque **"API habilitada"**
4. Cole a URL do Railway
5. Clique em **"Testar Conexão"**
6. Se OK, clique em **"Salvar"**

**Opção B - Código (js/config.js):**

```javascript
API: {
    enabled: true,
    baseUrl: 'https://bar-restaurante-production.up.railway.app',
    timeoutMs: 8000
}
```

### 7️⃣ Testar o Sistema

#### Credenciais de Teste:

| Usuário | Senha | Função | Acesso |
|---------|-------|--------|--------|
| `superadmin` | `super123` | Super Admin | Todas empresas |
| `admin` | `admin123` | Admin | Maria Flor |
| `garcom` | `garcom123` | Staff | Limitado |

1. Acesse seu frontend
2. Faça login com `admin` / `admin123`
3. Teste criar um pedido
4. Verifique o dashboard

---

## 🔧 Railway CLI (Opcional)

### Instalar

```bash
npm install -g @railway/cli
```

### Comandos Úteis

```bash
# Login
railway login

# Ver logs em tempo real
railway logs

# Executar migrations
railway run npm run migrate

# Listar variáveis de ambiente
railway variables

# Rebuild completo
railway up --detach
```

---

## 🐛 Solução de Problemas

### ❌ Erro: "DATABASE_URL not found"

**Solução:**
1. Verifique se o PostgreSQL está criado
2. Vá em Settings → Variables
3. Confirme que `DATABASE_URL` existe
4. Se não, reconecte o banco: Settings → Connect

### ❌ Erro: "JWT must be provided"

**Solução:**
1. Gere novo `JWT_SECRET` (min. 32 caracteres)
2. Adicione nas variáveis de ambiente
3. Faça redeploy

### ❌ Erro de CORS no frontend

**Solução:**
1. Verifique se a URL da API está correta
2. Use `https://` (não `http://`)
3. Configure `CORS_ORIGIN=*` no Railway

### ❌ Migrations não aplicadas

**Solução:**
```bash
railway run npm run migrate
```

Ou acesse o banco direto:
1. Railway → PostgreSQL → Data
2. Execute o SQL em `server/src/migrations/schema.sql`

### ❌ Build falhou

**Solução:**
1. Verifique os logs: Railway → Logs
2. Confirme que `server/package.json` existe
3. Tente limpar o cache: Settings → Clear Build Cache

---

## 📊 Monitoramento

### Logs
Railway Dashboard → Serviço → **Logs**

### Métricas
Railway Dashboard → Serviço → **Metrics**

### Banco de Dados
Railway Dashboard → PostgreSQL → **Data** ou **Query**

### Health Check
```
https://sua-api.up.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2026-01-14T...",
  "database": "connected",
  "version": "2.2.0"
}
```

---

## 💰 Custos Estimados

| Recurso | Consumo | Custo/mês |
|---------|---------|-----------|
| PostgreSQL | ~720h | $7-10 |
| Backend | ~720h | $7-10 |
| **Total** | | **$14-20/mês** |

💡 **Plano Trial:** $5 de crédito grátis mensalmente

---

## 🔐 Segurança em Produção

### ✅ Checklist Antes de Ir ao Ar

- [ ] Gerar `JWT_SECRET` forte (mínimo 32 caracteres)
- [ ] Alterar senhas padrão no banco (`users` table)
- [ ] Configurar `CORS_ORIGIN` com URL específica
- [ ] Ativar SSL no banco (já ativo no Railway)
- [ ] Revisar permissões de usuários
- [ ] Configurar backups automáticos
- [ ] Monitorar logs regularmente

### 🔄 Alterando Senhas

```sql
-- Conecte ao banco via Railway → PostgreSQL → Query
UPDATE users 
SET password = '$2b$10$...' -- use bcrypt para gerar
WHERE username = 'admin';
```

Ou use a interface:
```
configuracoes.html → Usuários → Editar → Alterar Senha
```

---

## 🚀 Deploy Automático (CI/CD)

### GitHub Actions

O repositório já inclui workflow `.github/workflows/railway-deploy.yml`

#### Configurar:

1. Obtenha o token: Railway → Account Settings → Tokens
2. GitHub → Settings → Secrets → Actions
3. Adicione: `RAILWAY_TOKEN` = (seu token)

✅ Agora cada push em `main` dispara deploy automático!

---

## 📱 Deploy do Frontend

### Netlify (Recomendado)

1. Conecte o repositório ao Netlify
2. Configure:
   - **Build command:** `echo "Static site"`
   - **Publish directory:** `.` (raiz)
3. Deploy!

### Vercel

1. Conecte o repositório ao Vercel
2. Configure:
   - **Framework:** Other
   - **Root directory:** `./`
3. Deploy!

---

## 📚 Documentação Adicional

- 📖 [API Completa](docs/API.md)
- 🏗️ [Arquitetura](docs/ARCHITECTURE.md)
- 👨‍💻 [Desenvolvimento](docs/DEVELOPMENT.md)
- 🐳 [Docker](Dockerfile)

---

## 🆘 Suporte

- 📧 Issues: [GitHub Issues](https://github.com/cristiano-superacao/bar_restaurante/issues)
- 📚 Docs Railway: [docs.railway.app](https://docs.railway.app)
- 💬 Discord Railway: [discord.gg/railway](https://discord.gg/railway)

---

## ✅ Checklist Final

- [ ] PostgreSQL criado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET gerado (min. 32 chars)
- [ ] Domain gerado no Railway
- [ ] Frontend conectado à API
- [ ] Login funcionando
- [ ] Pedidos sendo salvos
- [ ] Health check respondendo

**🎉 Parabéns! Seu sistema está no ar!**
