# 🚄 Configuração Railway - Checklist Completo

## ❌ Problema: "O aplicativo não respondeu"

Este erro geralmente ocorre quando:
1. ✅ **Variáveis de ambiente não configuradas** ← Causa mais comum
2. ✅ **Root Directory incorreto**
3. ✅ **Porta incorreta**
4. ✅ **Falha nas migrações do banco**

---

## 📋 Checklist de Configuração

### 1. Configure as Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```env
# 🔐 OBRIGATÓRIAS
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres-aleatorios
PORT=3000

# 🌐 OPCIONAIS
CORS_ORIGIN=*
NODE_ENV=production
```

#### ⚙️ Como gerar JWT_SECRET seguro:
```bash
# No seu terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 🗄️ DATABASE_URL:
- Se você criou um **PostgreSQL Plugin** no Railway, a variável `DATABASE_URL` já estará disponível automaticamente
- Caso contrário, adicione manualmente usando a connection string do seu banco

---

### 2. Configure o Root Directory

Na aba **Settings** do seu serviço Railway:

1. Procure por **Root Directory**
2. Defina como: `server`
3. Salve as alterações

**Ou use os arquivos de configuração já criados** (`railway.json` ou `railway.toml`)

---

### 3. Verifique o Start Command

Na aba **Settings**, procure por **Start Command**:

```bash
npm start
```

Se o Root Directory estiver como `server`, use apenas `npm start`.
Caso contrário, use: `cd server && npm start`

---

### 4. Adicione o PostgreSQL

Se ainda não tem banco de dados:

1. No seu projeto Railway, clique em **+ New**
2. Selecione **Database** → **Add PostgreSQL**
3. Aguarde a criação (1-2 minutos)
4. A variável `DATABASE_URL` será adicionada automaticamente

---

### 5. Conecte o Serviço ao Banco

1. Clique no seu **serviço Node.js**
2. Vá em **Settings** → **Variables**
3. Clique em **+ Add Variable Reference**
4. Selecione `DATABASE_URL` do serviço PostgreSQL
5. Salve

---

### 6. Force um Redeploy

Após configurar tudo:

1. Vá na aba **Deployments**
2. Clique nos **três pontinhos** do último deploy
3. Selecione **Redeploy**

Ou simplesmente faça um novo push no GitHub (já configurado com GitHub Actions)

---

## 🔍 Verificando os Logs

Para ver o que está acontecendo:

1. No Railway, clique no seu serviço
2. Vá na aba **Logs** ou **Deployments**
3. Procure por mensagens de erro

### ✅ Logs de Sucesso:
```
🔄 Executando migrações do banco de dados...
✅ Migrações aplicadas com sucesso!
🚀 API rodando na porta 3000
📊 Database: PostgreSQL (Railway)
```

### ❌ Logs de Erro Comuns:

**Erro 1: DATABASE_URL não definida**
```
Error: Connection string is required
```
→ Adicione a variável `DATABASE_URL` nas configurações

**Erro 2: JWT_SECRET não definida**
```
Error: JWT_SECRET is required
```
→ Adicione a variável `JWT_SECRET` nas configurações

**Erro 3: Erro de migração**
```
❌ Erro ao executar migrações
```
→ Verifique se o banco PostgreSQL está ativo e acessível

---

## 🧪 Testando a API

Após o deploy bem-sucedido:

### 1. Teste a rota principal:
```
https://barestaurante.up.railway.app/
```
Deve retornar uma página HTML com status do sistema

### 2. Teste a rota de health:
```
https://barestaurante.up.railway.app/api/health
```
Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "database": "connected"
}
```

### 3. Teste o login:
```bash
curl -X POST https://barestaurante.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"admin123"}'
```

---

## 🚨 Troubleshooting

### Problema: "Application failed to respond"

**Solução 1: Verifique as variáveis**
```bash
# No Railway, vá em Variables e confirme:
✅ DATABASE_URL
✅ JWT_SECRET
✅ PORT=3000
```

**Solução 2: Verifique Root Directory**
```bash
# Em Settings:
Root Directory: server
```

**Solução 3: Verifique o Build**
```bash
# Logs devem mostrar:
npm install --production
✔ Build completed
```

**Solução 4: Redeploy**
```bash
# Force um novo deploy:
Deployments → ⋮ → Redeploy
```

### Problema: "CORS error" no frontend

**Solução:**
```env
# Adicione nas variáveis do Railway:
CORS_ORIGIN=https://seu-dominio.vercel.app
# Ou use * para permitir qualquer origem (não recomendado em produção)
CORS_ORIGIN=*
```

### Problema: "Rate limit exceeded"

**Solução:**
- O limite atual é de **100 requisições por 15 minutos**
- Para aumentar, edite `server/src/index.js` linha 51:
```javascript
max: 500, // Aumente conforme necessário
```

---

## 📱 Conectando o Frontend

Atualize o arquivo `js/config.js` do frontend:

```javascript
const API_URL = 'https://barestaurante.up.railway.app/api';

const API_ENDPOINTS = {
  AUTH: `${API_URL}/auth`,
  MENU: `${API_URL}/menu`,
  ORDERS: `${API_URL}/orders`,
  TABLES: `${API_URL}/tables`,
  STOCK: `${API_URL}/stock`,
  TRANSACTIONS: `${API_URL}/transactions`,
  CUSTOMERS: `${API_URL}/customers`,
  RESERVATIONS: `${API_URL}/reservations`,
  COMPANIES: `${API_URL}/companies`,
  USERS: `${API_URL}/users`,
};
```

---

## 🎯 Próximos Passos

1. ✅ Configure as variáveis de ambiente
2. ✅ Adicione o PostgreSQL plugin
3. ✅ Force um redeploy
4. ✅ Teste a API com os endpoints de health
5. ✅ Configure o frontend com a URL do Railway
6. ✅ Teste o login e funcionalidades principais

---

## 💡 Dicas Adicionais

### Monitoramento
- Railway oferece métricas gratuitas na aba **Metrics**
- Configure alertas para falhas de deploy

### Domínio Customizado
1. Vá em **Settings** → **Domains**
2. Clique em **Custom Domain**
3. Adicione seu domínio e configure o DNS

### CI/CD Automático
- Já configurado! Cada push no GitHub dispara um deploy automático
- Veja o progresso em **Deployments**

### Backup do Banco
```bash
# No Railway CLI:
railway run pg_dump $DATABASE_URL > backup.sql
```

---

## 📞 Suporte

Se o problema persistir:

1. Copie os logs completos do Railway
2. Verifique se todas as variáveis estão configuradas
3. Teste localmente com `npm run dev` no diretório `server/`
4. Consulte a documentação completa em `DEPLOY_RAILWAY_COMPLETO.md`

---

**Versão:** 2.2.0  
**Última atualização:** Janeiro 2024  
**Mantém:** Layout responsivo e profissional ✅
