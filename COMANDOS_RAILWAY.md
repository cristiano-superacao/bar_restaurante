# 🚀 Comandos Rápidos - Deploy Railway

## 📋 Validar Sistema

```bash
node scripts/validate-railway.mjs
```

## 💾 Commit das Otimizações

```bash
git add .
git commit -m "feat: otimizações Railway - sistema pronto para deploy"
git push origin main
```

## 🔐 Gerar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Testar Localmente

### Iniciar Servidor

```bash
cd server
npm install
npm start
```

### Testar Health Check

```bash
curl http://localhost:3000/api/health
```

### Testar Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

## 🐳 Docker Local (Opcional)

### PostgreSQL com Docker

```bash
cd server
docker compose up -d
```

### Parar Docker

```bash
docker compose down
```

## 🌐 Railway CLI (Opcional)

### Instalar

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

### Ver Logs

```bash
railway logs
```

### Executar Migrations

```bash
railway run npm run migrate
```

### Listar Variáveis

```bash
railway variables
```

## 📊 Monitoramento

### Health Check Produção

```bash
curl https://sua-api.up.railway.app/api/health
```

### Testar Login Produção

```bash
curl -X POST https://sua-api.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

## 🔧 Troubleshooting

### Verificar Portas em Uso

```powershell
# Windows PowerShell
netstat -ano | findstr :3000
```

### Matar Processo na Porta 3000

```powershell
# Windows PowerShell
# Identifique o PID primeiro com netstat
taskkill /PID <pid> /F
```

### Limpar Cache npm

```bash
npm cache clean --force
cd server
rm -rf node_modules package-lock.json
npm install
```

## 📖 Documentação

- [GUIA_DEPLOY_RAILWAY.md](GUIA_DEPLOY_RAILWAY.md) - Guia completo
- [OTIMIZACOES_RAILWAY.md](OTIMIZACOES_RAILWAY.md) - Resumo das alterações
- [server/README.md](server/README.md) - Documentação da API
