# 🔐 VARIÁVEIS DE AMBIENTE PARA NETLIFY

## Copie e cole no painel do Netlify:

### Site settings → Environment variables → Add variable

```bash
# Nome: DATABASE_URL
# Valor: [SUA_STRING_NEON_AQUI]
# Exemplo: postgresql://usuario:senha@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require

# Nome: NODE_ENV  
# Valor: production

# Nome: JWT_SECRET
# Valor: barestaurente_jwt_secret_super_seguro_2024

# Nome: NETLIFY_SITE_NAME
# Valor: barestaurente
```

## 🗄️ SQL para executar no Neon:

```sql
-- 1. Criar tabela de usuários
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

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- 3. Inserir usuário administrador
INSERT INTO usuarios (nome, email, senha, role, ativo, data_criacao, ultimo_login, telefone, observacoes) 
VALUES (
    'Cristiano Santos',
    'cristiano@mariaflor.com.br',
    '$2b$10$hash_aqui', -- Use o hash do arquivo usuarios_hasheados_reais.sql
    'admin',
    true,
    NOW(),
    NOW(),
    '(71) 99999-9999',
    'Criador e proprietário do sistema. Acesso total a todas as funcionalidades.'
);

-- 4. Inserir outros usuários (use o arquivo completo)
-- Execute todo o conteúdo de: database/usuarios_hasheados_reais.sql
```

## 🎯 URLs importantes após deploy:

- **Site**: https://barestaurente.netlify.app
- **Login**: cristiano@mariaflor.com.br / admin123  
- **API Test**: https://barestaurente.netlify.app/.netlify/functions/server/test
- **Dashboard**: https://barestaurente.netlify.app/pages/dashboard.html

## ✅ Checklist de Deploy:

- [ ] Banco Neon criado
- [ ] String de conexão obtida
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] SQL executado no Neon
- [ ] Deploy realizado
- [ ] Site testado
- [ ] Login funcionando
- [ ] Dashboard carregando

**Deploy pronto! 🚀**