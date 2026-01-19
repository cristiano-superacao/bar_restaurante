# Deploy no Netlify + Railway

Este projeto usa **arquitetura separada**:
- **Frontend** → Netlify (HTML/CSS/JS estático)
- **Backend** → Railway (Node.js + PostgreSQL)

## 🚀 Deploy Automático

### Frontend (Netlify)

1. **Conectar Repositório**
   ```bash
   # No Netlify Dashboard:
   # 1. New site from Git
   # 2. Escolher GitHub: cristiano-superacao/bar_restaurante
   # 3. Branch: main
   ```

2. **Configurações de Build**
   ```
   Build command: (deixar vazio - site estático)
   Publish directory: .
   ```

3. **Variáveis de Ambiente** (não necessárias - API detectada automaticamente)

4. **Deploy**
   - Push para `main` → deploy automático
   - URL gerada: `https://seu-site.netlify.app`

### Backend (Railway)

1. **Já está configurado** em:
   ```
   https://barestaurante.up.railway.app
   ```

2. **Variáveis no Railway**:
   - `DATABASE_URL` → PostgreSQL connection string
   - `PORT` → 3000
   - `NODE_ENV` → production

## 🔗 Comunicação Frontend ↔ Backend

O arquivo `js/config.js` detecta automaticamente:

```javascript
// Localhost → API em localhost:3000
localhost:8080 → http://localhost:3000

// Netlify → API no Railway
*.netlify.app → https://barestaurante.up.railway.app

// Railway → API no Railway (mesmo domínio)
*.railway.app → https://barestaurante.up.railway.app
```

## ✅ Testes

### Local
```bash
# Servidor HTTP local
python -m http.server 8080

# Abrir: http://localhost:8080?api=railway
```

### Netlify
```bash
# Instalar CLI (opcional)
npm install -g netlify-cli

# Testar localmente
netlify dev

# Deploy manual
netlify deploy --prod
```

## 📋 Checklist de Deploy

- [x] Frontend estático (HTML/CSS/JS)
- [x] Backend Railway funcionando
- [x] `netlify.toml` configurado
- [x] Detecção automática de API
- [x] CORS configurado
- [x] Headers de segurança
- [ ] Domínio customizado (opcional)

## 🔧 Configurações Importantes

### netlify.toml
- Redirecionamento para SPA (fallback)
- Headers CORS para Railway
- Cache de assets estáticos
- Sem cache para HTML/SW

### js/config.js
- Detecção automática de ambiente
- Fallback para Railway
- Suporte a querystring `?api=railway`

## 📖 Documentação

- [Netlify Docs](https://docs.netlify.com/)
- [Railway Docs](https://docs.railway.app/)
- [CORS Setup](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
