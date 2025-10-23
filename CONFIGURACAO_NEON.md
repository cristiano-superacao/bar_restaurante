# 🐘 Configuração Neon PostgreSQL para Netlify

## 📋 Passo a passo para configurar o banco Neon

### 1. 🌐 Criar conta no Neon
- Acesse: https://neon.tech
- Crie uma conta gratuita
- Confirme seu email

### 2. 🗄️ Criar banco de dados
- No painel do Neon, clique em "Create Project"
- Nome: `bar-restaurante-maria-flor`
- Região: `US East (N. Virginia)` (mais próximo do Netlify)
- PostgreSQL version: `15` (recomendado)

### 3. 📝 Obter string de conexão
Após criar o projeto, você receberá uma string similar a:
```
postgresql://username:password@ep-example-123.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### 4. 🔧 Configurar no Netlify
No painel do Netlify, vá em:
- **Site settings** → **Environment variables**
- Adicione:
  ```
  DATABASE_URL = sua_string_de_conexao_neon_aqui
  NODE_ENV = production
  JWT_SECRET = seu_jwt_secret_super_seguro
  ```

### 5. 🏗️ Criar tabelas no banco
Execute o script SQL no console do Neon:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'funcionario',
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_criacao TIMESTAMP DEFAULT NOW(),
    ultimo_login TIMESTAMP,
    telefone VARCHAR(20),
    observacoes TEXT
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
```

### 6. 📊 Inserir usuários de teste
Execute o arquivo: `database/usuarios_hasheados_reais.sql`

### 7. 🧪 Testar conexão
Após o deploy, teste:
- **Teste de conexão**: https://barestaurente.netlify.app/.netlify/functions/server/test
- **Login de teste**: https://barestaurente.netlify.app (use: cristiano@mariaflor.com.br / admin123)

## 🔧 Estrutura da API

### Endpoints disponíveis:
- `POST /api/auth/login` - Autenticação de usuários
- `GET /api/dashboard` - Dados do dashboard
- `GET /api/test` - Teste de conexão com banco
- `GET /api/users` - Listar usuários (admin)

### Exemplo de uso:
```javascript
// Login
fetch('/.netlify/functions/server/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cristiano@mariaflor.com.br',
    senha: 'admin123'
  })
})
```

## ⚡ Benefícios do Neon + Netlify:
- ✅ **Serverless**: Escala automaticamente
- ✅ **Performance**: Edge computing global
- ✅ **Custo**: Plano gratuito generoso
- ✅ **Segurança**: SSL/TLS nativo
- ✅ **Backup**: Automático e versionado

## 📚 Recursos úteis:
- [Documentação Neon](https://neon.tech/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Deploy Status](https://barestaurente.netlify.app)

**Sistema pronto para produção com banco Neon!** 🚀