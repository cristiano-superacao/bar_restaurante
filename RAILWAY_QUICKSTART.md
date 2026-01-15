# ⚡ Deploy Railway - Quick Start

> Sistema Bar & Restaurante pronto para produção

## ✅ Status

**Sistema validado e pronto para deploy!**

```
❌ Erros críticos: 0
⚠️  Avisos: 0
```

## 🚀 5 Passos para Deploy

### 1️⃣ Validar Sistema

```bash
node scripts/validate-railway.mjs
```

### 2️⃣ Criar Projeto Railway

1. Acesse [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Selecione este repositório

### 3️⃣ Adicionar PostgreSQL

1. **+ New** → **Database** → **PostgreSQL**
2. Aguarde criação automática

### 4️⃣ Configurar Variáveis

No Railway → Settings → Variables:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
JWT_SECRET=<gerar_abaixo>
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5️⃣ Deploy Automático ✨

✅ Railway detecta as configurações e faz o deploy!

## 🌐 Obter URL da API

1. Railway → Serviço → **Settings**
2. Networking → **Generate Domain**
3. Copie a URL

## 🔗 Conectar Frontend

**Opção 1 - Interface (Recomendado):**

1. Abra `configuracoes.html`
2. Seção "Conexão com API"
3. Marque **API habilitada**
4. Cole a URL do Railway
5. **Testar** → **Salvar**

**Opção 2 - Código:**

Edite `js/config.js`:
```javascript
API: {
    enabled: true,
    baseUrl: 'https://sua-api.up.railway.app',
    timeoutMs: 8000
}
```

## 🧪 Testar

### Health Check
```
https://sua-api.up.railway.app/api/health
```

### Login
```
Usuário: admin
Senha: admin123
```

## 📚 Documentação Completa

- 📖 [GUIA_DEPLOY_RAILWAY.md](GUIA_DEPLOY_RAILWAY.md) - Guia detalhado
- 📊 [OTIMIZACOES_RAILWAY.md](OTIMIZACOES_RAILWAY.md) - O que foi otimizado
- 💻 [COMANDOS_RAILWAY.md](COMANDOS_RAILWAY.md) - Comandos úteis
- 🔧 [server/README.md](server/README.md) - Documentação da API

## ⚡ Recursos Otimizados

- ✅ railway.json com healthcheck
- ✅ nixpacks.toml otimizado
- ✅ Migrations automáticas
- ✅ CSS responsivo validado
- ✅ Multi-tenant funcional
- ✅ Segurança (Helmet + Rate Limiting)
- ✅ 6 media queries responsivas
- ✅ 10 tabelas PostgreSQL
- ✅ JWT authentication

## 💰 Custo Estimado

**$14-20/mês** (PostgreSQL + Backend)

## 🆘 Problemas?

1. Consulte [Troubleshooting](GUIA_DEPLOY_RAILWAY.md#-solução-de-problemas)
2. Execute validação: `node scripts/validate-railway.mjs`
3. Verifique logs no Railway Dashboard
4. Abra issue no GitHub

---

**✨ Deploy em 5 minutos! ✨**
