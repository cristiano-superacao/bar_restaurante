# 🚀 Deploy no Railway - Guia Rápido

## Pré-requisitos
- Conta no [Railway.app](https://railway.app)
- Repositório GitHub conectado

## Passo 1: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório `cristiano-superacao/bar_restaurante`

## Passo 2: Adicionar Banco de Dados Postgres

1. No seu projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. O Railway criará automaticamente o banco e as variáveis de ambiente

## Passo 3: Configurar o Serviço Backend

1. Clique em **"+ New"** → **"GitHub Repo"**
2. Selecione novamente seu repositório
3. Configure as seguintes opções:

### Root Directory
```
server
```

### Build Command
```
npm install
```

### Start Command
```
npm start
```

### Variáveis de Ambiente

O Railway já conectará automaticamente as variáveis do Postgres. Adicione manualmente:

```env
NODE_ENV=production
JWT_SECRET=seu_segredo_jwt_super_seguro_aqui_minimo_32_caracteres
PORT=3000
```

**⚠️ IMPORTANTE:** Gere um `JWT_SECRET` seguro. Você pode usar:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Passo 4: Deploy

1. O Railway fará o deploy automaticamente
2. Aguarde a build completar (pode levar 2-3 minutos)
3. Verifique os logs para garantir que não há erros

## Passo 5: Executar Migrations

1. No dashboard do Railway, clique no serviço do backend
2. Vá em **"Settings"** → **"Deploy"**
3. Na seção **"Custom Start Command"**, execute uma vez:

```bash
npm run migrate && npm start
```

Ou use o Railway CLI:
```bash
railway run npm run migrate
```

## Passo 6: Obter URL da API

1. No serviço backend, vá em **"Settings"**
2. Clique em **"Generate Domain"**
3. Copie a URL gerada (ex: `https://bar-restaurante-production.up.railway.app`)

## Passo 7: Configurar Frontend

Atualize o arquivo `js/config.js`:

```javascript
API: {
    enabled: true,  // ← Ativar API
    baseUrl: 'https://sua-url-railway.up.railway.app',  // ← Sua URL
    timeoutMs: 8000
}
```

## Passo 8: Testar

1. Faça push da alteração no `config.js`
2. Acesse seu frontend (Netlify/Vercel)
3. Faça login com:
   - **Usuário:** admin
   - **Senha:** admin123

## 🔧 Comandos Úteis Railway CLI

Instalar Railway CLI:
```bash
npm i -g @railway/cli
```

Fazer login:
```bash
railway login
```

Ver logs em tempo real:
```bash
railway logs
```

Executar comando no servidor:
```bash
railway run npm run migrate
```

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o serviço Postgres está rodando
- Confirme que as variáveis de ambiente estão conectadas

### Migrations não aplicadas
Execute manualmente:
```bash
railway run npm run migrate
```

### JWT inválido
- Gere um novo `JWT_SECRET` com pelo menos 32 caracteres
- Atualize a variável de ambiente no Railway
- Faça redeploy

### CORS error no frontend
O backend já está configurado para aceitar requisições de qualquer origem. Se persistir:
- Verifique se `baseUrl` no `config.js` está correto
- Confirme que a URL inclui `https://` (não `http://`)

## 📊 Monitoramento

- **Logs:** Railway Dashboard → Seu serviço → "Logs"
- **Métricas:** Railway Dashboard → "Metrics"
- **Banco:** Use Railway Dashboard → PostgreSQL → "Query"

## 💰 Custos

- **Plano Free:** $5 de crédito mensal
- **Postgres:** ~$0.01/hora (~$7.20/mês)
- **Backend:** ~$0.01/hora (~$7.20/mês)

**Total estimado:** ~$14-15/mês (com uso moderado)

## 🔐 Segurança em Produção

Antes de ir ao ar:

1. ✅ Gere um `JWT_SECRET` forte
2. ✅ Altere a senha do admin no banco (tabela `users`)
3. ✅ Configure rate limiting (já incluído)
4. ✅ Ative HTTPS (Railway faz automaticamente)
5. ✅ Monitore os logs regularmente

## 🆘 Suporte

- [Documentação Railway](https://docs.railway.app)
- [Discord Railway](https://discord.gg/railway)
- Issues no GitHub do projeto
