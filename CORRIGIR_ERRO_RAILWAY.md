# 🚨 AÇÃO IMEDIATA - Corrigir Erro Railway

## ❌ Erro Atual
```
O aplicativo não respondeu
ID: cy-gFmnxQTCXBUaqPvyhXg
```

## ✅ Solução em 5 Passos

### 1️⃣ Acesse o Railway Dashboard
👉 https://railway.app/dashboard

### 2️⃣ Adicione as Variáveis de Ambiente

No seu projeto → Clique no serviço Node.js → Aba **Variables**

```env
DATABASE_URL=postgresql://[COPIE DO PLUGIN POSTGRESQL]
JWT_SECRET=[GERE UMA CHAVE SEGURA ABAIXO]
PORT=3000
CORS_ORIGIN=*
```

**Como gerar JWT_SECRET:**
```bash
# Execute no seu terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3️⃣ Configure o PostgreSQL Plugin

Se ainda não tem:
1. No projeto Railway → **+ New**
2. Selecione **Database** → **Add PostgreSQL**
3. Aguarde 1-2 minutos
4. Copie a variável `DATABASE_URL` para o serviço Node.js

### 4️⃣ Configure Root Directory

No serviço Node.js → Aba **Settings**:
1. Procure por **Root Directory**
2. Digite: `server`
3. Salve

### 5️⃣ Force um Redeploy

1. Aba **Deployments**
2. Clique nos **⋮** (três pontos)
3. Selecione **Redeploy**

---

## 🧪 Verificação de Sucesso

Após o redeploy, acesse:
```
https://barestaurante.up.railway.app/
```

**✅ Esperado:** Página HTML com status do sistema

**❌ Se ainda falhar:** Verifique os logs em **Deployments** → Clique no deploy → **View Logs**

---

## 📋 Checklist Rápido

- [ ] DATABASE_URL configurada (do plugin PostgreSQL)
- [ ] JWT_SECRET configurada (mínimo 32 caracteres)
- [ ] PORT=3000
- [ ] Root Directory = `server`
- [ ] Redeploy forçado
- [ ] Página raiz carrega corretamente

---

## 🔍 Logs que Indicam Sucesso

```
🔄 Executando migrações do banco de dados...
✅ Migrações aplicadas com sucesso!
🚀 API rodando na porta 3000
📊 Database: PostgreSQL (Railway)
```

---

## 🆘 Se o Erro Persistir

1. **Copie os logs completos** da aba Deployments
2. Verifique se TODAS as variáveis estão configuradas
3. Teste localmente:
   ```bash
   cd server
   npm install
   npm run check-env
   npm start
   ```
4. Consulte a documentação completa em:
   - `RAILWAY_SETUP.md` - Guia detalhado
   - `DEPLOY_RAILWAY_COMPLETO.md` - Troubleshooting completo

---

## 📞 Suporte Railway

- Documentação: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

---

**Última atualização:** $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Versão do Sistema:** 2.2.0  
**Layout:** Responsivo e profissional ✅
