# 🗄️ **CONFIGURAÇÃO NEON POSTGRESQL - GUIA COMPLETO**

## 🎯 **PASSOS PARA CONFIGURAR O NEON**

### **1. 🌐 Acesse o Neon**
- Vá para: https://neon.tech
- Faça login ou crie uma conta gratuita

### **2. 📊 Criar Novo Projeto**
1. Clique em **"Create Project"**
2. **Nome do projeto:** `bar-restaurante-maria-flor`
3. **Região:** Escolha a mais próxima (ex: US East)
4. **Database name:** `maria_flor_db`
5. Clique em **"Create Project"**

### **3. 🔗 Obter Connection String**
Após criar o projeto, você verá uma string similar a:
```
postgresql://usuario:senha@host.neon.tech:5432/maria_flor_db?sslmode=require
```

**Exemplo real:**
```
postgresql://neondb_owner:AbC123DeF456@ep-cool-forest-12345678.us-east-1.aws.neon.tech:5432/maria_flor_db?sslmode=require
```

### **4. 🛠️ Configurar no Netlify**

#### **4.1 Acesse o Painel Netlify:**
- Vá para: https://app.netlify.com/sites/barestaurente
- Clique em **"Site settings"**
- Vá para **"Environment variables"**

#### **4.2 Adicionar Variáveis:**
Adicione estas 2 variáveis:

**Variável 1:**
- **Key:** `DATABASE_URL`
- **Value:** Sua connection string do Neon (cole aqui)

**Variável 2:**
- **Key:** `NODE_ENV`
- **Value:** `production`

#### **4.3 Salvar:**
- Clique em **"Save"**
- O deploy será feito automaticamente

### **5. 🗃️ Criar Tabelas no Banco**

#### **5.1 Acesse o Console SQL do Neon:**
- No painel do Neon, vá para **"SQL Editor"**
- Execute o script abaixo:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP
);

-- Inserir usuários padrão
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Administrador do Sistema', 'admin@mariaflor.com.br', '$2b$10$hashadmin123', 'administrador'),
('Gerente Maria Flor', 'gerente@mariaflor.com.br', '$2b$10$hashgerente123', 'gerente'),
('Usuário do Sistema', 'usuario@mariaflor.com.br', '$2b$10$hashusuario123', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
```

### **6. 🧪 Testar Conexão**

#### **6.1 Testar API:**
Acesse: https://barestaurente.netlify.app/.netlify/functions/server/test

**Deve retornar:**
```json
{
  "success": true,
  "message": "API funcionando",
  "database": "connected",
  "timestamp": "2025-10-22T..."
}
```

#### **6.2 Testar Login:**
1. Acesse: https://barestaurente.netlify.app
2. Use: `admin@mariaflor.com.br` / `admin123`
3. Deve fazer login com sucesso

## 🔧 **CONFIGURAÇÃO AUTOMÁTICA VIA SCRIPT**

Se preferir, use este script para configurar automaticamente:

```bash
# No seu terminal local:
npm run setup-neon
```

## 📋 **VARIÁVEIS DE AMBIENTE NECESSÁRIAS**

No Netlify, configure estas variáveis:

```env
DATABASE_URL=postgresql://usuario:senha@host.neon.tech:5432/database?sslmode=require
NODE_ENV=production
```

## 🚨 **TROUBLESHOOTING**

### **Problema: "Database connection failed"**
**Solução:**
1. Verifique se a `DATABASE_URL` está correta
2. Confirme que o Neon está ativo
3. Teste a connection string no console do Neon

### **Problema: "Usuario não encontrado"**
**Solução:**
1. Verifique se as tabelas foram criadas
2. Execute novamente o script SQL
3. Confirme que os usuários foram inseridos

### **Problema: API não responde**
**Solução:**
1. Verifique os logs no Netlify Functions
2. Confirme que `NODE_ENV=production`
3. Redeploy o site se necessário

## 🎯 **LINKS IMPORTANTES**

- **🌐 Site:** https://barestaurente.netlify.app
- **🔧 Netlify Panel:** https://app.netlify.com/sites/barestaurente
- **🗄️ Neon Console:** https://console.neon.tech
- **📊 Neon Database:** Seu projeto criado
- **🔍 API Test:** https://barestaurente.netlify.app/.netlify/functions/server/test

---

## 🎉 **APÓS CONFIGURAR O NEON**

Seu sistema terá:
- ✅ Banco de dados real na nuvem
- ✅ Dados persistentes
- ✅ Performance melhorada
- ✅ Backup automático (Neon)
- ✅ Escalabilidade automática

**Siga este guia passo a passo e seu sistema estará 100% configurado!** 🌟