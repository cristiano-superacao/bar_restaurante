# 🚀 DEPLOY AUTOMÁTICO PARA BARESTAURENTE.NETLIFY.APP

## ✅ **CONFIGURAÇÃO COMPLETA DE DEPLOY**

### 📋 **Passo a Passo no Netlify:**

#### 1. **Acesse seu site**
- URL: https://app.netlify.com/sites/barestaurente
- Ou acesse: https://app.netlify.com e procure por "barestaurente"

#### 2. **Configurações de Build**
Verifique se estão corretas:
```
Branch: main
Build command: (vazio)
Publish directory: .
Functions directory: netlify/functions
```

#### 3. **Variáveis de Ambiente** 🔑
Vá em: **Site settings** → **Environment variables** → **Add variable**

Adicione as seguintes variáveis:

```bash
# Banco de Dados Neon
DATABASE_URL = postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require

# Configuração de Ambiente
NODE_ENV = production

# JWT Secret (opcional)
JWT_SECRET = barestaurente_jwt_secret_2024

# Configuração de Deploy
NETLIFY_SITE_NAME = barestaurente
```

#### 4. **Deploy Manual** (se necessário)
- Vá para: **Deploys** tab
- Clique em: **Trigger deploy** → **Deploy site**

#### 5. **Configurar Domínio**
- Vá em: **Site settings** → **Domain settings**
- Verifique se está: `barestaurente.netlify.app`
- Se não, clique em: **Change site name** → Digite: `barestaurente`

### 🗄️ **Configuração do Banco Neon**

#### 1. **Criar conta no Neon**
- Acesse: https://neon.tech
- Crie conta gratuita
- Confirme email

#### 2. **Criar projeto**
- Nome: `bar-restaurante-maria-flor`
- Região: `US East (N. Virginia)`
- PostgreSQL: `v15`

#### 3. **Obter string de conexão**
Será algo como:
```
postgresql://usuario:senha@ep-example-123.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 4. **Executar SQL**
No console do Neon, execute:

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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
```

#### 5. **Inserir usuários**
Execute o conteúdo do arquivo: `database/usuarios_hasheados_reais.sql`

### 🧪 **Testar o Deploy**

#### 1. **URLs para testar:**
- **Site**: https://barestaurente.netlify.app
- **API Test**: https://barestaurente.netlify.app/.netlify/functions/server/test
- **Dashboard**: https://barestaurente.netlify.app/pages/dashboard.html

#### 2. **Credenciais para login:**
```
Email: cristiano@mariaflor.com.br
Senha: admin123
```

#### 3. **Outros usuários:**
```
maria@mariaflor.com.br / maria2024 (Gerente)
joao.chef@mariaflor.com.br / chef2024 (Chef)
ana.garcom@mariaflor.com.br / garcom2024 (Garçom)
```

### 🔧 **Troubleshooting**

#### Se der erro de deploy:
1. Verifique se o branch é `main`
2. Confirme que `netlify.toml` existe
3. Veja os logs em: **Deploys** → **Function logs**

#### Se a API não funcionar:
1. Verifique variáveis de ambiente
2. Teste: `/.netlify/functions/server/test`
3. Veja Function logs no Netlify

#### Se o login não funcionar:
1. Confirme que o banco está criado
2. Verifique se os usuários foram inseridos
3. Teste a string de conexão

### 📊 **Status do Deploy**
- ✅ Código no GitHub atualizado
- ✅ Netlify Functions configuradas
- ✅ Neon PostgreSQL compatível
- ✅ Sistema de autenticação integrado
- ✅ Layout original mantido
- ⏳ Aguardando configuração do banco
- ⏳ Deploy final pendente

### 🎯 **Resultado Final**
Após seguir estes passos, você terá:
- Sistema online em: `https://barestaurente.netlify.app`
- 10 usuários funcionais
- Dashboard completo
- Ficha técnica funcionando
- Deploy automático ativo

**Tudo pronto! Agora é só configurar o banco e fazer o deploy!** 🚀