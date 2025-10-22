# 🚀 DEPLOY PARA barestaurente.netlify.app

## 📋 Passo a passo para deploy:

### 1. 🌐 Acesse o Netlify
- Vá para: https://app.netlify.com
- Faça login com sua conta

### 2. 📦 Criar novo site
- Clique em **"Add new site"** → **"Import an existing project"**
- Selecione **"Deploy with GitHub"**
- Conecte sua conta GitHub se necessário
- Procure e selecione: `cristiano-superacao/bar_restaurante`

### 3. ⚙️ Configurações de Build
```
Branch to deploy: main
Build command: (deixe vazio)
Publish directory: . 
Functions directory: netlify/functions
```

### 4. 🏷️ Configurar nome do site
Após o deploy inicial:
- Vá em **"Site settings"** → **"General"** → **"Site details"**
- Clique em **"Change site name"**
- Digite: `barestaurente`
- Seu site ficará: `https://barestaurente.netlify.app`

### 5. 🔐 Variáveis de Ambiente
Em **"Site settings"** → **"Environment variables"**, adicione:

```
DATABASE_URL=postgresql://usuario:senha@host:5432/database
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
NODE_ENV=production
PORT=8888
```

### 6. 🔄 Deploy Automático
- Toda alteração no GitHub será automaticamente deployada
- Status do deploy visível no painel

### 7. 📱 Teste o Sistema
Após o deploy, teste em:
- **Site principal**: https://barestaurente.netlify.app
- **Dashboard**: https://barestaurente.netlify.app/pages/dashboard.html
- **API**: https://barestaurente.netlify.app/.netlify/functions/server

## ✅ Checklist Final:
- [ ] Site conectado ao GitHub
- [ ] Nome alterado para `barestaurente`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Sistema funcionando online

## 🎯 URLs Finais:
- **Dashboard**: https://barestaurente.netlify.app/pages/dashboard.html
- **Login**: https://barestaurente.netlify.app/index.html
- **API Functions**: https://barestaurente.netlify.app/.netlify/functions/

**O sistema estará live em poucos minutos!** 🌟