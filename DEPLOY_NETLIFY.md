# Deploy no Netlify - Configuração Manual

## Como configurar o deploy automático:

### 1. Acesse o Netlify
- Vá para https://netlify.com
- Faça login ou crie uma conta

### 2. Conecte o GitHub
- Clique em "New site from Git"
- Selecione "GitHub" 
- Autorize o Netlify a acessar seu repositório
- Selecione o repositório: `cristiano-superacao/bar_restaurante`

### 3. Configurações de Build
- **Branch**: `main`
- **Build command**: (deixe vazio)
- **Publish directory**: `.` (ponto)
- **Functions directory**: `netlify/functions`

### 4. Variáveis de Ambiente
No painel do Netlify, vá em "Site settings" > "Environment variables" e adicione:

```
DATABASE_URL=sua_url_do_neon_postgresql
JWT_SECRET=seu_jwt_secret_super_seguro
NODE_ENV=production
```

### 5. Deploy Automático
- Toda alteração no branch `main` do GitHub será automaticamente deployada
- O site estará disponível em: `https://seu-nome-do-site.netlify.app`

### 6. Configuração de Redirects
O arquivo `netlify.toml` já está configurado para:
- Redirecionamentos de API para functions
- SPA routing para o dashboard
- Configurações de build

### 7. Custom Domain (Opcional)
- No painel do Netlify, vá em "Domain settings"
- Adicione seu domínio personalizado
- Configure os DNS conforme instruções

## URLs importantes:
- **Site**: https://sua-app.netlify.app
- **API**: https://sua-app.netlify.app/.netlify/functions/server
- **Dashboard**: https://sua-app.netlify.app/pages/dashboard.html

## Status do Deploy:
✅ Código commitado no GitHub
✅ Configuração netlify.toml criada  
⏳ Configuração manual no Netlify pendente