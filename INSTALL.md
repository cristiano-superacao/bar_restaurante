# 📦 Guia de Instalação Completo

Este guia fornece instruções detalhadas para instalar e configurar o Sistema de Gestão para Bar e Restaurante em diferentes ambientes.

## Índice

- [Requisitos do Sistema](#requisitos-do-sistema)
- [Instalação Frontend (Modo Offline)](#instalação-frontend-modo-offline)
- [Instalação Backend (Modo Cloud)](#instalação-backend-modo-cloud)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Primeiro Acesso](#primeiro-acesso)
- [Troubleshooting](#troubleshooting)

## Requisitos do Sistema

### Mínimos

**Para Frontend (Modo Offline):**
- Navegador moderno atualizado:
  - Google Chrome 90+
  - Mozilla Firefox 88+
  - Safari 14+
  - Microsoft Edge 90+
- 2 GB RAM
- 100 MB espaço livre

**Para Backend (Modo Cloud):**
- Node.js 18.0.0 ou superior
- PostgreSQL 14.0 ou superior
- 512 MB RAM (servidor)
- 1 GB espaço livre (servidor)

### Recomendados

- Node.js 20.x LTS
- PostgreSQL 16.x
- 2 GB RAM (servidor)
- Conexão estável à internet

## Instalação Frontend (Modo Offline)

### Opção 1: Abrir Diretamente no Navegador

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/cristiano-superacao/bar_restaurante.git
   cd bar_restaurante
   ```

2. **Abra o arquivo:**
   - Navegue até a pasta do projeto
   - Clique duas vezes em `index.html`
   - O sistema abrirá no navegador padrão

3. **Faça login:**
   - Usuário: `admin`
   - Senha: `admin123`

### Opção 2: Servidor Local com Node.js

1. **Clone e instale:**
   ```bash
   git clone https://github.com/cristiano-superacao/bar_restaurante.git
   cd bar_restaurante
   npm install
   ```

2. **Inicie o servidor:**
   ```bash
   npm start
   ```

3. **Acesse no navegador:**
   ```
   http://localhost:8000
   ```

### Opção 3: Servidor Local com Python

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/cristiano-superacao/bar_restaurante.git
   cd bar_restaurante
   ```

2. **Inicie o servidor Python:**
   
   **Python 3:**
   ```bash
   python -m http.server 8000
   ```
   
   **Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

3. **Acesse no navegador:**
   ```
   http://localhost:8000
   ```

### Opção 4: npx (Sem Instalação)

```bash
cd bar_restaurante
npx serve .
```

Acesse a URL mostrada no terminal (geralmente `http://localhost:3000`).

## Instalação Backend (Modo Cloud)

### Instalação Local

#### 1. Instalar PostgreSQL

**Windows:**
- Baixe em: https://www.postgresql.org/download/windows/
- Execute o instalador
- Durante instalação, defina senha para usuário `postgres`
- Anote a porta (padrão: 5432)

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Criar Banco de Dados

```bash
# Acesse o PostgreSQL
psql -U postgres

# Dentro do psql:
CREATE DATABASE bar_restaurante;
CREATE USER bar_user WITH ENCRYPTED PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE bar_restaurante TO bar_user;
\q
```

#### 3. Configurar Backend

```bash
# Entre no diretório do servidor
cd bar_restaurante/server

# Instale as dependências
npm install
```

#### 4. Criar Arquivo de Ambiente

Crie um arquivo `.env` na pasta `server/`:

```env
# Banco de dados
DATABASE_URL=postgres://bar_user:sua_senha_forte@localhost:5432/bar_restaurante

# Segurança
JWT_SECRET=gere_um_segredo_forte_com_32_ou_mais_caracteres_aqui

# Servidor
PORT=3000
NODE_ENV=development

# CORS (opcional - deixe vazio para permitir qualquer origem)
CORS_ORIGIN=http://localhost:8000
```

**⚠️ Importante:** Nunca commite o arquivo `.env` no Git!

#### 5. Gerar JWT Secret Seguro

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OpenSSL:**
```bash
openssl rand -hex 32
```

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 6. Iniciar o Servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

O servidor iniciará em `http://localhost:3000` e aplicará as migrações automaticamente.

#### 7. Verificar Instalação

Acesse no navegador:
```
http://localhost:3000
```

Você verá a página de status da API.

**Teste o endpoint:**
```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{"ok": true}
```

### Instalação no Railway

#### 1. Criar Conta no Railway

- Acesse: https://railway.app
- Faça login com GitHub

#### 2. Novo Projeto

- Clique em **"New Project"**
- Selecione **"Deploy from GitHub repo"**
- Autorize o Railway a acessar seu repositório
- Selecione o repositório `bar_restaurante`

#### 3. Adicionar PostgreSQL

- No projeto, clique em **"New Service"**
- Selecione **"Database"** → **"PostgreSQL"**
- Railway criará automaticamente o banco e gerará `DATABASE_URL`

#### 4. Configurar Variáveis de Ambiente

No serviço do backend:

- Clique em **"Variables"**
- Adicione:
  ```
  JWT_SECRET=<gere_um_segredo_forte>
  PORT=3000
  NODE_ENV=production
  CORS_ORIGIN=<url_do_seu_frontend>
  ```

`DATABASE_URL` é adicionado automaticamente pelo Railway.

#### 5. Deploy

- Railway detecta automaticamente `server/package.json`
- Deploy acontece automaticamente
- Aguarde a conclusão (1-3 minutos)

#### 6. Obter URL Pública

- Clique em **"Settings"** → **"Generate Domain"**
- Railway criará uma URL como: `https://seu-projeto.up.railway.app`
- Copie esta URL

#### 7. Conectar Frontend

No sistema frontend:

1. Faça login
2. Vá em **Configurações** → **Conexão com API**
3. Marque **"API habilitada"**
4. Cole a URL do Railway
5. Clique em **"Testar Conexão"**
6. Se OK, clique em **"Salvar"**

## Configuração do Banco de Dados

### Estrutura de Tabelas

As migrações criam automaticamente as seguintes tabelas:

- `companies` - Empresas (multi-tenant)
- `users` - Usuários do sistema
- `menu_items` - Itens do cardápio
- `tables` - Mesas do restaurante
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `stock` - Estoque
- `customers` - Clientes
- `reservations` - Reservas
- `transactions` - Transações financeiras

### Dados Iniciais (Seeds)

Após as migrações, o sistema cria automaticamente:

**Empresa padrão:**
- ID: 1
- Nome: "Default Company"

**Usuários:**
- **Superadmin**: `superadmin` / `superadmin123`
- **Admin**: `admin` / `admin123`

### Executar Migrações Manualmente

```bash
cd server
npm run migrate
```

### Resetar Banco (⚠️ Apaga tudo)

```bash
cd server
npm run rebuild
```

## Configuração de Ambiente

### Variáveis de Ambiente Detalhadas

#### DATABASE_URL
Formato: `postgres://usuario:senha@host:porta/database`

**Exemplos:**
- Local: `postgres://bar_user:senha@localhost:5432/bar_restaurante`
- Railway: `postgres://usuario:senha@containers-us-west-xxx.railway.app:5432/railway`
- Heroku: Fornecido automaticamente como `DATABASE_URL`

#### JWT_SECRET
String aleatória longa para assinar tokens JWT.

**Requisitos:**
- Mínimo 32 caracteres
- Use caracteres aleatórios
- Nunca compartilhe ou commite no Git

**Exemplo:**
```
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c3c9e1b6f5f3e1b8f4c3a0e9d7c6b5a4f
```

#### PORT
Porta onde o servidor escutará.

**Padrão:** `3000`
**Railway:** Usa `$PORT` (automático)

#### NODE_ENV
Ambiente de execução.

**Valores:**
- `development` - Desenvolvimento (logs verbosos)
- `production` - Produção (otimizado)
- `test` - Testes automatizados

#### CORS_ORIGIN
URLs permitidas para acessar a API.

**Exemplos:**
- Único: `https://meusite.com`
- Múltiplos: `https://meusite.com,https://app.meusite.com`
- Qualquer (⚠️ não use em produção): deixe vazio

### Arquivo .env.example

Crie `server/.env.example` para compartilhar estrutura:

```env
# Banco de dados (substitua com suas credenciais)
DATABASE_URL=postgres://usuario:senha@host:5432/database

# JWT Secret (gere um novo)
JWT_SECRET=your_secret_here_min_32_chars

# Servidor
PORT=3000
NODE_ENV=development

# CORS (opcional)
CORS_ORIGIN=http://localhost:8000
```

## Primeiro Acesso

### 1. Acessar Sistema

Navegue até a URL do frontend:
- Local: `http://localhost:8000`
- Netlify: `https://seu-site.netlify.app`

### 2. Fazer Login

Use as credenciais padrão:
- **Usuário:** `admin`
- **Senha:** `admin123`

### 3. Alterar Senha (Importante!)

1. Vá em **Configurações** → **Perfil**
2. Clique em **"Alterar Senha"**
3. Digite nova senha forte
4. Salve

### 4. Configurar API (Opcional)

Se instalou o backend:

1. **Configurações** → **Conexão com API**
2. Marque **"API habilitada"**
3. URL da API:
   - Local: `http://localhost:3000`
   - Railway: `https://seu-projeto.up.railway.app`
4. **"Testar Conexão"** → **"Salvar"**

### 5. Cadastrar Empresa (Multi-tenant)

Se é **superadmin**:

1. Vá em **Empresas**
2. Clique em **"➕ Nova Empresa"**
3. Preencha:
   - Nome
   - Razão social
   - CNPJ
   - Telefone
   - Endereço
4. Salve

### 6. Cadastrar Usuários

1. Vá em **Usuários**
2. **"➕ Novo Usuário"**
3. Defina:
   - Nome
   - Email
   - Senha
   - Role (admin/staff)
   - Empresa (se não for superadmin)
4. Salve

### 7. Configurar Módulos

Configure cada módulo conforme necessário:

- **Cardápio**: Adicione categorias e itens
- **Mesas**: Cadastre mesas com capacidades
- **Estoque**: Adicione produtos e estoques mínimos
- **Clientes**: Importe ou cadastre clientes

## Troubleshooting

### Problemas Comuns

#### Frontend não abre

**Sintoma:** Página em branco ou erro 404

**Soluções:**
1. Verifique se está abrindo `index.html`
2. Tente outro navegador
3. Limpe cache do navegador (Ctrl+Shift+Del)
4. Verifique console do navegador (F12)

#### Erro de CORS

**Sintoma:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Soluções:**
1. Configure `CORS_ORIGIN` no `.env` do backend:
   ```env
   CORS_ORIGIN=http://localhost:8000
   ```
2. Ou deixe vazio para permitir qualquer origem (⚠️ apenas em dev):
   ```env
   CORS_ORIGIN=
   ```
3. Reinicie o servidor backend

#### Erro de Conexão com Banco

**Sintoma:** `Error: connect ECONNREFUSED`

**Soluções:**
1. Verifique se PostgreSQL está rodando:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows (PowerShell como admin)
   Get-Service postgresql*
   ```
2. Confirme `DATABASE_URL` no `.env`
3. Teste conexão:
   ```bash
   psql -U bar_user -d bar_restaurante -h localhost
   ```
4. Verifique firewall/porta 5432

#### Erro JWT Invalid

**Sintoma:** `401 Unauthorized` ou `JWT invalid`

**Soluções:**
1. Limpe localStorage do navegador:
   ```javascript
   // No console (F12)
   localStorage.clear();
   ```
2. Faça login novamente
3. Verifique se `JWT_SECRET` é o mesmo no servidor

#### Migrações não executam

**Sintoma:** Tabelas não existem

**Soluções:**
1. Execute manualmente:
   ```bash
   cd server
   npm run migrate
   ```
2. Verifique permissões do usuário do banco
3. Confira logs do servidor

#### Backend não inicia

**Sintoma:** `Error: Cannot find module`

**Soluções:**
1. Reinstale dependências:
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Verifique versão do Node.js:
   ```bash
   node --version  # Deve ser 18+
   ```
3. Atualize Node.js se necessário

#### Rate limit atingido

**Sintoma:** `429 Too Many Requests`

**Solução:**
Aguarde 15 minutos ou ajuste limites em `server/src/index.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200  // Aumente este valor
});
```

### Logs e Diagnóstico

#### Ver logs do backend

```bash
# Desenvolvimento
npm run dev

# Produção com PM2
pm2 logs bar-restaurante-api

# Railway
railway logs
```

#### Ver logs do navegador

1. Pressione **F12**
2. Vá na aba **Console**
3. Procure por erros em vermelho

#### Testar API diretamente

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Listar empresas (com token)
curl http://localhost:3000/api/companies \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Contato para Suporte

Se o problema persistir:

- 📧 Email: contato@superacao.dev
- 💬 Issues: https://github.com/cristiano-superacao/bar_restaurante/issues
- 📖 Docs: Veja arquivos de documentação no repositório

---

## Próximos Passos

Após instalação bem-sucedida:

1. ✅ Altere senhas padrão
2. ✅ Configure backup regular
3. ✅ Teste todos os módulos
4. ✅ Importe dados se houver
5. ✅ Configure domínio personalizado (opcional)
6. ✅ Ative HTTPS (obrigatório em produção)

**Bom uso do sistema! 🎉**
