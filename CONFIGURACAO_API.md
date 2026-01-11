# 🚀 API Configurada no Railway

## ✅ Status da API
- **URL**: https://barestaurante.up.railway.app
- **Status**: Rodando (v2.2.0)
- **Banco**: PostgreSQL na nuvem

## 🔧 Como Habilitar no Frontend

### Opção 1: Via Interface (Recomendado)
1. Abra o sistema no navegador
2. Faça login com: `admin` / `admin123`
3. Acesse **Configurações** → **Conexão com API**
4. Marque: **API habilitada**
5. Cole a URL: `https://barestaurante.up.railway.app`
6. Clique em **Testar** (deve mostrar "Conexão OK")
7. Clique em **Salvar**

### Opção 2: Habilitar por Padrão no Código
Edite `js/config.js`:
```javascript
API: {
    enabled: true,
    baseUrl: 'https://barestaurante.up.railway.app',
    timeoutMs: 8000
}
```

## 🔐 Usuários Criados no Banco
- **Superadmin**: `superadmin` / `superadmin123` (acessa todas empresas)
- **Admin Default**: `admin` / `admin123` (empresa Default)
- **Admin Empresa A**: `adminA` / `admin123`
- **Admin Empresa B**: `adminB` / `admin123`

## 📊 Empresas de Teste
O banco já tem 3 empresas criadas:
1. **Default** (empresa padrão)
2. **Empresa Teste A** (com mesas, cardápio, estoque)
3. **Empresa Teste B** (com mesas, cardápio, estoque)

## ✨ Recursos Funcionando
- ✅ Autenticação JWT
- ✅ Multi-empresa (multi-tenant)
- ✅ CRUD completo: Cardápio, Pedidos, Mesas, Clientes, Estoque, Transações, Reservas
- ✅ Fechamento de conta (gera transação automática)
- ✅ Cupom fiscal
- ✅ Layout responsivo

## 🧪 Testar Manualmente

### 1. Verificar saúde da API
```bash
curl https://barestaurante.up.railway.app/health
# Retorna: {"ok":true}
```

### 2. Login
```bash
curl -X POST https://barestaurante.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Listar mesas (precisa do token)
```bash
curl https://barestaurante.up.railway.app/api/tables \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔄 Migração de Dados Locais
Se você tem dados no LocalStorage e quer migrar para o banco:
1. Exporte via **Configurações** → **Exportar Dados**
2. Crie os registros manualmente pela interface com a API habilitada

## 📝 Próximos Passos
1. Habilite a API nas configurações do frontend
2. Faça login e teste criar um pedido
3. Verifique se os dados persistem após recarregar a página
4. Configure um domínio customizado (opcional)

## 🧹 Reconstrução do Banco (Local)
Se preferir apagar e reconstruir o banco local com o schema atual:

1. No PowerShell:

```powershell
Push-Location "C:\Users\PrescriMed\Desktop\Sistema\bar_restaurante-main\server"
$env:DATABASE_URL="postgres://bar:bar@localhost:5432/bar_restaurante"
$env:JWT_SECRET="local_dev_secret_please_change"
$env:NODE_ENV="production"
npm run rebuild
Pop-Location
```

- O script remove objetos do schema `public` e reaplica o schema em [server/src/migrations/schema.sql](server/src/migrations/schema.sql).
- Não impacta o layout do frontend; apenas recria tabelas, índices e seeds padronizados.
- Em produção (Railway), não execute sem backup e confirmação explícita.
