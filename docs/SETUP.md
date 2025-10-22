# 🚀 SETUP COMPLETO - Sistema Maria Flor

> **Guia passo a passo para configurar o sistema em produção**

## 📋 Pré-requisitos

### 🔧 Ferramentas Necessárias
- **Node.js** v18+ ([Download](https://nodejs.org))
- **Git** ([Download](https://git-scm.com))
- **Navegador moderno** (Chrome, Firefox, Edge, Safari)

### ☁️ Contas Necessárias
- **GitHub** - Para versionamento do código
- **Neon** - Banco PostgreSQL gratuito ([neon.tech](https://neon.tech))
- **Netlify** - Hospedagem gratuita ([netlify.com](https://netlify.com))

## 🎯 Opção 1: Setup Local (Desenvolvimento)

### 1. Clonar o Repositório
```bash
# Clone o projeto
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante

# Ou baixe o ZIP e extraia
```

### 2. Instalar Dependências
```bash
# Instalar Node.js dependencies
npm install

# Verificar instalação
node --version
npm --version
```

### 3. Configurar Ambiente Local
```bash
# Copiar arquivo de exemplo
cp .env.production .env.local

# Editar configurações locais
notepad .env.local
```

**Conteúdo do .env.local:**
```env
# Para desenvolvimento local (usando dados simulados)
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-local-123456
DATABASE_URL=postgresql://localhost/maria_flor_dev
```

### 4. Testar Localmente
```bash
# Iniciar servidor local
npm run dev
# ou
node server.js

# Abrir navegador
start http://localhost:3000
```

## 🌐 Opção 2: Deploy em Produção

### 1. Configurar Banco Neon

#### Criar Conta e Projeto
1. Acesse [neon.tech](https://neon.tech)
2. Faça cadastro gratuito
3. Crie novo projeto: **"maria-flor-prod"**
4. Escolha região: **US East (Ohio)** ou mais próxima
5. Copie a **Connection String**

#### Executar Scripts SQL
```bash
# 1. Acessar console SQL no Neon Dashboard

# 2. Executar na ordem:

# Estrutura das tabelas
-- Cole o conteúdo de: database/schema.sql

# Usuários padrão
-- Cole o conteúdo de: database/usuarios_hasheados.sql

# Dados de exemplo (opcional)
-- Cole o conteúdo de: database/dados_exemplo.sql
```

### 2. Deploy na Netlify

#### Via Interface Web (Recomendado)
1. **Conectar GitHub**:
   - Acesse [netlify.com](https://netlify.com)
   - Login com GitHub
   - "New site from Git"
   - Escolha o repositório

2. **Configurar Build**:
   - **Build command**: `npm install`
   - **Publish directory**: `./`
   - **Functions directory**: `netlify/functions`

3. **Variáveis de Ambiente**:
   ```
   Site Settings > Environment variables
   
   DATABASE_URL = sua-connection-string-neon
   JWT_SECRET = uma-chave-super-secreta-256-bits
   NODE_ENV = production
   ```

#### Via CLI (Alternativa)
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
netlify deploy --prod
```

### 3. Configurar Domínio (Opcional)

#### Subdomínio Netlify (Gratuito)
```bash
# Alterar nome do site
Site Settings > Change site name
# Ex: maria-flor-restaurante.netlify.app
```

#### Domínio Personalizado
```bash
# No Netlify Dashboard
Domain Settings > Add custom domain
# Ex: sistema.mariaflor.com
```

## 🔒 Configurações de Segurança

### 1. Headers de Segurança
O arquivo `netlify.toml` já inclui:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 2. Variáveis de Ambiente Seguras
```env
# ⚠️ NUNCA commitar essas variáveis no Git
JWT_SECRET=gere-uma-chave-de-256-bits-super-segura
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### 3. Gerar JWT Secret Seguro
```bash
# No Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou online
# https://generate-secret.now.sh/32
```

## ✅ Verificações Finais

### 1. Testar Sistema Completo
```bash
# URLs para testar:
https://seu-site.netlify.app              # Login
https://seu-site.netlify.app/pages/dashboard.html  # Dashboard

# Credenciais de teste:
admin / admin123
gerente / gerente123
garcom / garcom123
```

### 2. Verificar Funcionalidades
- [ ] Login com todos os usuários
- [ ] Dashboard carregando dados
- [ ] Criação de pedidos
- [ ] Processamento de vendas
- [ ] Controle de mesas
- [ ] Gestão do cardápio

### 3. Performance e SEO
```bash
# Testar no PageSpeed Insights
https://pagespeed.web.dev/

# Testar segurança
https://securityheaders.com/

# Meta esperadas:
- Performance: 90+
- Security Headers: A+
- Mobile Friendly: ✅
```

## 🔄 Manutenção e Atualizações

### 1. Backup Automático
```sql
-- Configurar backup automático no Neon
-- Dashboard > Settings > Backups
-- Frequência: Diária
-- Retenção: 30 dias
```

### 2. Monitoramento
```bash
# Logs da aplicação
Netlify Dashboard > Functions > Logs

# Métricas do banco
Neon Dashboard > Monitoring

# Uptime monitoring (opcional)
https://uptimerobot.com/
```

### 3. Updates de Código
```bash
# Atualizar código
git pull origin main
git push origin main

# Deploy automático via Netlify
# (configurado automaticamente)
```

## 🚨 Troubleshooting

### Problema: Deploy falhando
```bash
# Verificar logs de build
Netlify Dashboard > Deploys > [Failed Deploy] > Logs

# Soluções comuns:
1. Verificar package.json
2. Conferir variáveis de ambiente
3. Testar build localmente: npm run build
```

### Problema: Banco não conecta
```bash
# Verificar connection string
1. Copiar exata do Neon Dashboard
2. Incluir ?sslmode=require no final
3. Testar conexão no Neon SQL Editor
```

### Problema: APIs retornando 500
```bash
# Verificar logs das functions
Netlify Dashboard > Functions > api-complete > Function log

# Verificar variáveis
Site Settings > Environment variables
```

## 📞 Suporte

### 🆘 Para Problemas Técnicos
- **Email**: `suporte@mariaflor.com`
- **GitHub Issues**: [Abrir Issue](https://github.com/cristiano-superacao/bar_restaurante/issues/new)
- **WhatsApp**: `(71) 99999-9999`

### 📚 Documentação Adicional
- [📖 Documentação Completa](DOCUMENTACAO_COMPLETA.md)
- [🔌 API Reference](API_REFERENCE.md)
- [🚀 Guia Rápido](GUIA_RAPIDO.md)

## ✨ Próximos Passos

Após o setup, considere:

1. **Personalizar o sistema**:
   - Logo da empresa
   - Cores da marca
   - Produtos do cardápio

2. **Treinar a equipe**:
   - Cada perfil de usuário
   - Fluxo de trabalho
   - Resolução de problemas

3. **Configurar integrações**:
   - WhatsApp Business (futuro)
   - Sistema fiscal (futuro)
   - Apps de delivery (futuro)

---

**🌸 Sistema pronto para revolucionar seu restaurante!**

**Desenvolvido com ❤️ em Salvador, BA**