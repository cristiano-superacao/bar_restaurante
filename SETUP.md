# Guia de Setup - Maria Flor Sistema

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- Git
- Conta no GitHub
- Conta no Netlify (opcional)
- Conta no Neon Database (para produção)

## 🚀 Setup Rápido

### 1. Preparar Repositório no GitHub

```bash
# No diretório do projeto
git init
git add .
git commit -m "Initial commit - Maria Flor Sistema"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/maria-flor-sistema.git
git push -u origin main
```

### 2. Configurar GitHub Pages

1. Vá para Settings > Pages no seu repositório
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Salve e aguarde o deploy

Seu site estará disponível em: `https://seu-usuario.github.io/maria-flor-sistema`

### 3. Deploy no Netlify (Recomendado)

#### Via GitHub (Mais Fácil)
1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Conecte ao GitHub e selecione o repositório
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.`
5. Deploy!

#### Via Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Inicializar projeto
netlify init

# Deploy
netlify deploy --prod
```

### 4. Configurar Banco Neon (Para Produção)

1. Crie conta em [neon.tech](https://neon.tech)
2. Crie novo projeto
3. Copie a connection string
4. Execute o script `database/schema.sql`
5. Configure variáveis no Netlify:
   - Site settings > Environment variables
   - Adicione `DATABASE_URL` com sua connection string
   - Adicione `JWT_SECRET` com uma chave secura

### 5. Variáveis de Ambiente

No Netlify, configure:
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=sua-chave-jwt-super-secreta
NODE_ENV=production
```

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações

# Iniciar servidor local
npm run dev

# Abrir no navegador
# http://localhost:3000
```

## 📱 Teste de Funcionalidades

### Login Demo
- Usuário: qualquer coisa
- Senha: qualquer coisa
- (Em produção, usar usuários do banco)

### Funcionalidades Disponíveis
✅ Sistema de login  
✅ Dashboard com gráficos  
✅ Módulo de vendas básico  
✅ Interface responsiva  
🔄 Sistema completo de pedidos  
🔄 Gestão de cardápio  
🔄 Controle de estoque  
🔄 Relatórios financeiros  

## 🛠️ Personalização

### Alterar Logo e Cores
- Logo: substitua ícones nos arquivos CSS
- Cores: edite variáveis CSS em `css/login.css` e `css/dashboard.css`

### Adicionar Funcionalidades
- Backend: edite arquivos em `api/`
- Frontend: adicione páginas em `pages/`
- Banco: execute scripts em `database/`

## 🆘 Solução de Problemas

### Site não carrega no GitHub Pages
- Verifique se o repositório está público
- Aguarde alguns minutos para propagação
- Verifique se os caminhos dos arquivos estão corretos

### Erro no Netlify
- Verifique logs na seção Functions
- Confirme se as variáveis de ambiente estão configuradas
- Teste localmente primeiro

### Banco não conecta
- Verifique string de conexão do Neon
- Confirme se o IP está liberado (Neon libera por padrão)
- Teste a conexão diretamente no console do Neon

## 📞 Suporte

- 📧 Email: suporte@exemplo.com
- 💬 GitHub Issues: Use para reportar bugs
- 📖 Documentação: README.md

## 🎯 Próximos Passos

1. ✅ Deploy básico funcionando
2. 🔄 Implementar módulos restantes
3. 🔄 Adicionar testes automatizados
4. 🔄 Melhorar documentação
5. 🔄 Adicionar recursos avançados

---

**🎉 Parabéns! Seu sistema está funcionando!**

Acesse seu site e teste todas as funcionalidades. O sistema está pronto para ser usado e expandido conforme suas necessidades.