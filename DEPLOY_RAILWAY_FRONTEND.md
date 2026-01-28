# Deploy Frontend no Railway

Este guia explica como fazer deploy do **frontend completo** no Railway, servindo os arquivos estáticos HTML/CSS/JS.

## Arquitetura

- **Frontend**: Railway (arquivos estáticos servidos via http-server)
- **Backend**: Railway (API em Express + PostgreSQL)
- **Domínio**: https://barestaurante.up.railway.app

## Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Backend já configurado no Railway (veja `DEPLOY_RAILWAY_COMPLETO.md`)
3. Repositório GitHub conectado

## Deploy do Frontend

### 1. Criar Novo Serviço

No dashboard do Railway:

1. Clique em **New** → **GitHub Repo**
2. Selecione o repositório `bar_restaurante`
3. Configure o serviço:
   - **Nome**: `bar-restaurante-frontend`
   - **Root Directory**: `.` (raiz do projeto)

### 2. Configurar Variáveis de Ambiente

No serviço frontend, adicione:

```env
NODE_ENV=production
```

### 3. Configurar Build

Railway detectará automaticamente o `package.json` e usará:

- **Build**: `npm ci` (instala dependências)
- **Start**: `npm start` (executa `http-server`)

### 4. Configurar Domínio

1. No serviço frontend, vá em **Settings** → **Networking**
2. Clique em **Generate Domain**
3. Use o domínio gerado (ex: `barestaurante.up.railway.app`)
4. Ou configure domínio customizado

### 5. Conectar ao Backend

O frontend já está configurado para detectar automaticamente o ambiente Railway e conectar ao backend.

Verifique em `js/config.js`:
- A detecção automática aponta para `https://barestaurante.up.railway.app`
- Ou use o query param `?api=https://sua-api.up.railway.app`

## Estrutura de Serviços no Railway

Você terá **2 serviços**:

1. **Backend** (API):
   - Repositório: `bar_restaurante`
   - Root Directory: `server`
   - Start: `npm start`
   - Porta: 3000
   - Health Check: `/api/health`

2. **Frontend** (Static Files):
   - Repositório: `bar_restaurante`
   - Root Directory: `.` (raiz)
   - Start: `npm start` (http-server)
   - Porta: 8000 (ou auto-detect)

## Variáveis de Ambiente (Frontend)

```env
# Ambiente
NODE_ENV=production

# Opcional: forçar URL da API
API_URL=https://sua-api.up.railway.app
```

## Verificação

Após o deploy:

1. Acesse `https://seu-frontend.up.railway.app`
2. O sistema deve carregar normalmente
3. Vá em **Configurações** → **Conexão com API**
4. Clique em **Usar Railway** para conectar ao backend
5. Clique em **Testar Conexão** (deve mostrar "OK")
6. Faça login com suas credenciais

## CORS

Certifique-se de que o backend permite requests do frontend:

No serviço backend, configure:

```env
CORS_ORIGIN=https://seu-frontend.up.railway.app
# Ou para desenvolvimento/testes:
CORS_ORIGIN=*
```

## Troubleshooting

### Frontend não carrega

1. Verifique os logs: `railway logs -s bar-restaurante-frontend`
2. Confirme que o build foi executado com sucesso
3. Verifique se `http-server` está instalado nas dependências

### API não conecta

1. Abra `js/config.js` e verifique `DEFAULT_RAILWAY`
2. Use o query param `?api=https://sua-api.up.railway.app`
3. Ou configure manualmente em Configurações → Conexão com API

### Erro 404 em rotas

http-server serve arquivos estáticos. Para SPA routing, use o parâmetro `-P`:
```json
"start": "npx http-server . -p 8000 -P /index.html"
```

## Custo

Railway oferece:
- **$5 de crédito grátis por mês**
- **Plano Hobby**: $5/mês por serviço após créditos

Para reduzir custos, considere hospedar o frontend em:
- Vercel (grátis para sites estáticos)
- Cloudflare Pages (grátis)
- GitHub Pages (grátis)

E manter apenas o backend no Railway.

## Atualização

Para fazer deploy de novas versões:

1. Faça commit das mudanças
2. Push para o GitHub: `git push origin main`
3. Railway fará deploy automático

Ou force rebuild manualmente:
```bash
railway up -s bar-restaurante-frontend
```

## Links Úteis

- [Documentação Railway](https://docs.railway.app)
- [Deploy API](./DEPLOY_RAILWAY_COMPLETO.md)
- [Setup Local](./docs/LOCAL_E_RAILWAY.md)
