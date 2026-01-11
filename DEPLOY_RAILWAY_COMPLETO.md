# Guia de Deploy Railway - Bar Restaurante

Este guia detalha o processo de deploy do backend no Railway.

## Pré-requisitos

- Conta no Railway: https://railway.app
- Repositório GitHub conectado
- Código fonte commitado e enviado

## Passo a Passo

### 1. Criar Projeto no Railway

1. Acesse Railway: https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Autorize o Railway a acessar seu repositório
6. Selecione `cristiano-superacao/bar_restaurante`

### 2. Adicionar PostgreSQL

1. No projeto Railway, clique em **"New Service"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Railway criará automaticamente:
   - Banco de dados PostgreSQL
   - Variável `DATABASE_URL` (gerada automaticamente)

### 3. Configurar Variáveis de Ambiente

No serviço do backend (não no PostgreSQL), adicione as variáveis:

```env
# Gerado automaticamente pelo PostgreSQL service
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Gere um segredo forte (32+ caracteres)
JWT_SECRET=sua_chave_secreta_de_32_ou_mais_caracteres_aqui

# Porta (Railway usa PORT automaticamente)
PORT=3000

# Ambiente
NODE_ENV=production

# CORS (URL do frontend ou * para qualquer origem)
CORS_ORIGIN=https://seu-frontend.netlify.app
```

**Como gerar JWT_SECRET:**

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

### 4. Configurar Root Directory

O Railway precisa saber onde está o código do servidor:

1. Vá em **Settings** do serviço
2. Em **"Root Directory"**, defina: `server`
3. Em **"Start Command"**, defina: `npm start`
4. Salve as alterações

**Alternativa:** Use o arquivo `railway.json` na raiz (já incluído no repo):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 5. Deploy

1. Railway detecta automaticamente `server/package.json`
2. Executa `npm install` automaticamente
3. Aplica migrações no primeiro start (via `src/index.js`)
4. Inicia o servidor com `npm start`

**Aguarde 2-3 minutos** para o deploy completar.

### 6. Gerar Domínio Público

1. No serviço do backend, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Railway criará uma URL como: `https://bar-restaurante-production.up.railway.app`
5. Copie esta URL

### 7. Testar API

Acesse a URL gerada no navegador:

```
https://bar-restaurante-production.up.railway.app
```

Você verá a página de status da API.

**Teste o health check:**

```bash
curl https://bar-restaurante-production.up.railway.app/health
```

Resposta esperada:
```json
{"ok": true}
```

**Teste o login:**

```bash
curl -X POST https://bar-restaurante-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Resposta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "admin",
    "role": "admin",
    "companyId": 1
  }
}
```

### 8. Conectar Frontend

No sistema frontend:

1. Faça login
2. Vá em **Configurações** → **Conexão com API**
3. Marque **"API habilitada"**
4. Cole a URL do Railway: `https://bar-restaurante-production.up.railway.app`
5. Clique em **"Testar Conexão"**
6. Se OK, clique em **"Salvar"**
7. A página recarregará em modo cloud

### 9. Atualizar CORS

Após conectar o frontend, atualize `CORS_ORIGIN` no Railway:

```env
CORS_ORIGIN=https://seu-frontend.netlify.app
```

Isso permite apenas seu frontend acessar a API (segurança).

## Verificação de Deploy

### Logs

Para ver logs em tempo real:

1. No Railway, clique no serviço do backend
2. Vá na aba **"Deployments"**
3. Clique no deployment ativo
4. Veja os logs em tempo real

**Logs esperados no startup:**

```
✅ Connected to PostgreSQL
✅ Running migrations...
✅ Migrations complete
🚀 Server running on port 3000
```

### Variáveis de Ambiente

Verifique se todas as variáveis estão configuradas:

- ✅ `DATABASE_URL` (gerado automaticamente)
- ✅ `JWT_SECRET` (32+ caracteres)
- ✅ `PORT` (3000)
- ✅ `NODE_ENV` (production)
- ✅ `CORS_ORIGIN` (URL do frontend)

### Migrações

As migrações são aplicadas automaticamente no startup. Para verificar:

```bash
# No Railway CLI (se instalado)
railway run node src/migrate.js
```

### Health Check

Sempre verifique `/health` após deploy:

```bash
curl https://sua-url.up.railway.app/health
```

## Troubleshooting

### "O aplicativo não respondeu"

**Sintoma:** Página de erro do Railway

**Soluções:**

1. **Verifique Root Directory:**
   - Settings → Root Directory: `server`
   - Start Command: `npm start`

2. **Verifique Variáveis:**
   - `DATABASE_URL` configurado?
   - `JWT_SECRET` definido (32+ chars)?
   - `PORT=3000`

3. **Veja os Logs:**
   - Deployments → Clique no deploy → View Logs
   - Procure por erros em vermelho

4. **Reinicie o Serviço:**
   - Settings → Restart
   - Aguarde 1-2 minutos

### Erro "DATABASE_URL is required"

**Solução:**

1. Verifique se o PostgreSQL service está rodando
2. Adicione a variável:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
3. Reinicie o serviço

### Erro "JWT_SECRET is required"

**Solução:**

Adicione a variável com um segredo forte:

```env
JWT_SECRET=gere_um_segredo_com_node_ou_openssl_aqui
```

### Erro de Migração

**Sintoma:** Logs mostram erro ao criar tabelas

**Soluções:**

1. Verifique se `DATABASE_URL` está correto
2. Reinicie o PostgreSQL service
3. Rode migrações manualmente:
   ```bash
   railway run npm run migrate
   ```

### CORS Error no Frontend

**Sintoma:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solução:**

Configure `CORS_ORIGIN` com a URL do frontend:

```env
CORS_ORIGIN=https://seu-frontend.netlify.app
```

Ou deixe vazio para permitir qualquer origem (⚠️ apenas em dev):

```env
CORS_ORIGIN=
```

### Deploy Travado

**Soluções:**

1. Cancele o deploy e tente novamente
2. Verifique se há erros no `package.json`
3. Limpe cache: Settings → Delete Service → Recrie

## Monitoramento

### Métricas

Railway fornece métricas em tempo real:

- CPU Usage
- Memory Usage
- Network Traffic
- Request Count

Acesse na aba **"Metrics"** do serviço.

### Alertas

Configure alertas para:

- High CPU usage (>80%)
- High memory usage (>90%)
- Service crashes
- Failed deployments

### Logs

Os logs são mantidos por 7 dias. Para logs permanentes:

1. Integre com serviço de logs (Papertrail, Loggly)
2. Ou exporte logs periodicamente

## Escala e Performance

### Vertical Scaling

Railway permite aumentar recursos:

- Memory: 512MB → 8GB
- vCPU: Shared → Dedicated

Acesse Settings → Resources

### Horizontal Scaling

Para escalar horizontalmente (múltiplas instâncias):

1. Use Redis para sessões compartilhadas
2. Configure load balancer
3. Use Railway's Multi-region deploy

### Otimizações

- ✅ Connection pooling (já configurado em `db.js`)
- ✅ Rate limiting (já configurado)
- ✅ Gzip compression (adicione se necessário)
- ✅ Caching de queries (implemente se necessário)

## Backup e Recuperação

### Backup Automático

Railway faz backup automático do PostgreSQL diariamente.

Para backup manual:

```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Restauração

```bash
railway run psql $DATABASE_URL < backup.sql
```

### Exportar Dados

Via API:

1. Faça login no sistema
2. Vá em **Configurações**
3. Clique em **"Exportar Dados (JSON)"**
4. Salve o arquivo

## Custos

Railway oferece:

- **Hobby Plan**: $5/mês (500 horas de execução)
- **Pro Plan**: $20/mês (uso ilimitado)

**Recomendação para produção:** Pro Plan

## Domínio Personalizado

Para usar seu próprio domínio:

1. No Railway, vá em **Settings** → **Domains**
2. Clique em **"Custom Domain"**
3. Adicione: `api.seudominio.com`
4. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: bar-restaurante-production.up.railway.app
   ```
5. Aguarde propagação DNS (até 24h)

## CI/CD Automático

O repositório já inclui GitHub Actions (`.github/workflows/railway-deploy.yml`).

A cada push na branch `main`, o Railway faz deploy automaticamente.

## Suporte

- 📧 Railway: https://railway.app/help
- 💬 Discord: https://discord.gg/railway
- 📖 Docs: https://docs.railway.app

---

**Deploy concluído! 🚀**

Seu backend está rodando no Railway e pronto para produção.
