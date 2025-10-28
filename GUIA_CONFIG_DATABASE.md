# 🚀 Guia Rápido de Configuração do Banco de Dados

## 📋 Pré-requisitos

- Conta no [Neon](https://neon.tech) (gratuito)
- Node.js instalado (v18+)
- Git instalado

## 🎯 Passo a Passo

### 1️⃣ Criar Conta no Neon

1. Acesse: https://neon.tech
2. Clique em **"Sign Up"**
3. Use GitHub, Google ou Email para cadastrar
4. Confirme seu email

### 2️⃣ Criar Projeto no Neon

1. No dashboard do Neon, clique em **"New Project"**
2. Preencha:
   - **Project Name:** `maria-flor-restaurante`
   - **Region:** Escolha a mais próxima (ex: `US East`)
   - **Postgres Version:** `15` (recomendado)
3. Clique em **"Create Project"**

### 3️⃣ Obter a Connection String

1. No dashboard do projeto, copie a **Connection String**
2. Formato: `postgresql://username:password@host/database`
3. Exemplo:
```
postgresql://maria-flor_owner:AbCdEf123456@ep-cool-grass-123456.us-east-2.aws.neon.tech/maria-flor?sslmode=require
```

### 4️⃣ Configurar Variáveis de Ambiente

**Opção A - Local (.env):**
```bash
# No diretório do projeto
cp .env.example .env

# Edite o arquivo .env
nano .env  # ou use seu editor favorito
```

Adicione:
```env
DATABASE_URL=sua-connection-string-do-neon
JWT_SECRET=maria-flor-jwt-secret-2024
NODE_ENV=production
```

**Opção B - Netlify (Produção):**
1. Acesse seu site no [Netlify Dashboard](https://app.netlify.com)
2. Vá em **Site settings → Environment variables**
3. Adicione as variáveis:
   - `DATABASE_URL` = sua connection string
   - `JWT_SECRET` = uma chave secreta forte
   - `NODE_ENV` = `production`

### 5️⃣ Executar Scripts SQL no Neon

1. No dashboard do Neon, clique em **"SQL Editor"**
2. Cole e execute **na ordem**:

#### A) Schema Principal (Obrigatório)
```bash
# Copie o conteúdo de database/schema.sql
# Cole no SQL Editor do Neon
# Clique em "Run"
```

Ou via terminal:
```bash
# Opção 1: Via arquivo
psql "sua-connection-string" -f database/schema.sql

# Opção 2: Via stdin
cat database/schema.sql | psql "sua-connection-string"
```

#### B) Usuários Iniciais (Recomendado)
```bash
# Escolha um dos scripts:

# Opção 1: Usuários com hash (mais seguro)
psql "sua-connection-string" -f database/usuarios_hasheados.sql

# Opção 2: Usuários completos (10 usuários)
psql "sua-connection-string" -f database/criar_usuarios_completos.sql
```

#### C) Verificar Instalação
```sql
-- No SQL Editor do Neon, execute:

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar usuários
SELECT COUNT(*) FROM usuarios;

-- Contar produtos
SELECT COUNT(*) FROM products;
```

### 6️⃣ Testar Conexão

**Localmente:**
```bash
# Execute o script de teste
node test-system-integration.js

# Ou teste a conexão diretamente
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT NOW()\`.then(r => console.log('✅ Conectado:', r[0].now));
"
```

**Via API:**
```bash
# Testar endpoint de health check
curl https://seu-site.netlify.app/.netlify/functions/server/test

# Resposta esperada:
# {"success":true,"message":"Conexão com Neon OK","database":"connected"}
```

### 7️⃣ Testar Login

**Via cURL:**
```bash
curl -X POST https://seu-site.netlify.app/.netlify/functions/server/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cristiano@mariaflor.com.br",
    "senha": "admin123"
  }'
```

**Via Frontend:**
1. Acesse: `https://seu-site.netlify.app`
2. Use as credenciais:
   - Email: `cristiano@mariaflor.com.br`
   - Senha: `admin123`

## 🔑 Credenciais de Teste Padrão

Se você executou o script `criar_usuarios_completos.sql`:

| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| Cristiano Santos | cristiano@mariaflor.com.br | admin123 | admin |
| Maria Flor | maria@mariaflor.com.br | maria2024 | gerente |
| João Chef | joao.chef@mariaflor.com.br | chef2024 | cozinha |
| Ana Garçom | ana.garcom@mariaflor.com.br | garcom2024 | garcom |
| Carlos Caixa | carlos.caixa@mariaflor.com.br | caixa2024 | caixa |

## 🧪 Verificação Final

Execute todos os testes:
```bash
# 1. Testar integração completa
node test-system-integration.js

# 2. Iniciar servidor local (opcional)
npm start

# 3. Testar endpoints da API
curl http://localhost:3000/api/status
```

**Resultado Esperado:**
```
✅ SISTEMA ÍNTEGRO - Todas as verificações críticas passaram!
Taxa de sucesso: 98.7%
```

## 🐛 Problemas Comuns

### Erro: "connection refused"
**Causa:** Connection string incorreta ou Neon fora do ar  
**Solução:** 
- Verifique se copiou a string completa
- Certifique-se que o projeto está ativo no Neon
- Teste a conexão: `psql "sua-string" -c "SELECT 1"`

### Erro: "password authentication failed"
**Causa:** Senha ou usuário incorreto na connection string  
**Solução:** 
- Gere uma nova connection string no Neon
- Use a opção "Copy connection string" no dashboard

### Erro: "SSL required"
**Causa:** Neon requer SSL  
**Solução:** 
- Adicione `?sslmode=require` no final da connection string
- Exemplo: `postgresql://...?sslmode=require`

### Erro: "relation does not exist"
**Causa:** Tabelas não foram criadas  
**Solução:** 
- Execute `database/schema.sql` no SQL Editor
- Verifique se as tabelas existem: `\dt` (no psql)

### Erro: "too many connections"
**Causa:** Limite de conexões do Neon atingido  
**Solução:** 
- Use Neon Serverless driver (já configurado)
- Aguarde alguns minutos para conexões fecharem
- Upgrade para plano pago se necessário

## 📊 Estrutura de Dados

### Tabelas Criadas:
- ✅ `users` / `usuarios` - Autenticação
- ✅ `categories` - Categorias de produtos
- ✅ `products` - Produtos do cardápio
- ✅ `customers` - Clientes
- ✅ `sales` + `sale_items` - Vendas
- ✅ `orders` + `order_items` - Pedidos
- ✅ `stock_movements` - Estoque
- ✅ `suppliers` - Fornecedores
- ✅ `purchases` + `purchase_items` - Compras
- ✅ `expenses` - Despesas
- ✅ `settings` - Configurações

### Dados Iniciais:
- 6 categorias de produtos
- 9 produtos de exemplo
- 2+ usuários admin
- Configurações do sistema

## 🎉 Pronto!

Seu banco de dados está configurado e pronto para uso!

### Próximos Passos:

1. ✅ Acessar o sistema via web
2. ✅ Testar funcionalidades
3. ✅ Adicionar mais produtos
4. ✅ Começar a usar!

## 📞 Suporte

**Problemas?**
- 📧 Email: cristiano.s.santos@ba.estudante.senai.br
- 🐙 GitHub Issues: [Abrir Issue](https://github.com/cristiano-superacao/bar_restaurante/issues)
- 📖 Documentação: [INTEGRACAO_COMPLETA.md](./INTEGRACAO_COMPLETA.md)

---

**Tempo estimado de configuração:** 10-15 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)
