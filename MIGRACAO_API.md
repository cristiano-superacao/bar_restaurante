# 🔄 Guia de Migração: LocalStorage → API

## Visão Geral

O sistema foi desenvolvido com **arquitetura híbrida progressiva**, permitindo funcionar 100% offline (LocalStorage) ou com backend completo (API + Postgres), **sem alterar a interface**.

## Modo de Operação Atual

✅ **LocalStorage** (Padrão)

- Todos os dados salvos no navegador
- Funciona offline
- Sem necessidade de servidor
- Ideal para testes e desenvolvimento

## Como Ativar a API

### Pré-requisitos

1. Backend deployado no Railway (veja [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md))
2. Banco Postgres criado e migrations aplicadas
3. URL da API disponível

### Passo 1: Atualizar Configuração

Opção A (recomendado): Configurações (sem editar arquivos)

1. Vá em **Configurações → Conexão com API**
2. Marque **API habilitada** e cole a URL do Railway
3. Clique em **Testar** e depois **Salvar**

Isso grava um override no navegador (LocalStorage) e mantém o código intacto.

Opção B: Edite `js/config.js`:

```javascript
// Antes (LocalStorage)
API: {
    enabled: false,
    baseUrl: 'http://localhost:3000',
    timeoutMs: 8000
}

// Depois (API ativa)
API: {
    enabled: true,  // ← Mudar para true
    baseUrl: 'https://sua-url-railway.up.railway.app',  // ← Sua URL
    timeoutMs: 8000
}
```

### Passo 2: Fazer Commit e Push

```bash
git add js/config.js
git commit -m "feat: ativar API em produção"
git push origin main
```

### Passo 3: Deploy do Frontend

Se estiver usando Netlify/Vercel, o deploy será automático após o push.

### Passo 4: Testar

1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Acesse o sistema
3. Faça login com: **admin** / **admin123** (empresa Default)
    - Para administrar todas as empresas: **superadmin** / **superadmin123**
4. Se usar **superadmin**, selecione uma empresa em **Empresas** antes de criar/listar dados.
5. Verifique no console do navegador (F12):
   - Deve aparecer requisições para sua API
   - Não deve haver erros 401/403

## Migração de Dados Existentes

### ⚠️ IMPORTANTE

Dados salvos no LocalStorage **NÃO** são migrados automaticamente para a API.

### Opção 1: Começar do Zero (Recomendado)

Simplesmente ative a API. O banco já vem com:

- Usuário admin (admin/admin123)
- Estrutura pronta para receber dados

### Opção 2: Migrar Dados Manualmente

Se você tem dados importantes no LocalStorage:

1. **Exportar dados do LocalStorage**

   ```javascript
   // Cole no console do navegador (F12)
   const data = {
       menuItems: JSON.parse(localStorage.getItem('menuItems') || '[]'),
       tables: JSON.parse(localStorage.getItem('tables') || '[]'),
       pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
       estoque: JSON.parse(localStorage.getItem('estoque') || '[]'),
       transacoes: JSON.parse(localStorage.getItem('transacoes') || '[]')
   };
   console.log(JSON.stringify(data, null, 2));
   // Copie o resultado
   ```

2. **Importar via API**
   - Use ferramentas como Postman ou Insomnia
   - Envie POST requests para cada endpoint
   - Exemplo: `POST /api/menu-items` com os dados

### Opção 3: Script de Migração (Avançado)

Crie um script Node.js:

```javascript
// migrate-data.js
const data = require('./exported-data.json');
const API_URL = 'https://sua-url-railway.up.railway.app';

async function migrate() {
    // Login
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const { token } = await res.json();

    // Migrar menu items
    for (const item of data.menuItems) {
        await fetch(`${API_URL}/api/menu-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(item)
        });
    }
    // Repetir para outras entidades...
}

migrate();
```

## Testando os Dois Modos

### Desenvolvimento Local

**Backend local:**

```javascript
API: {
    enabled: true,
    baseUrl: 'http://localhost:3000',
    timeoutMs: 8000
}
```

**Sem backend:**

```javascript
API: {
    enabled: false,
    baseUrl: 'http://localhost:3000',
    timeoutMs: 8000
}
```

### Produção

```javascript
API: {
    enabled: true,
    baseUrl: 'https://sua-url-railway.up.railway.app',
    timeoutMs: 8000
}
```

## Funcionalidades por Modo

| Funcionalidade | LocalStorage | API + Postgres |
| --- | --- | --- |
| Login | ✅ Simulado | ✅ JWT Real |
| Cardápio CRUD | ✅ | ✅ |
| Mesas CRUD | ✅ | ✅ |
| Pedidos CRUD | ✅ | ✅ |
| Estoque CRUD | ✅ | ✅ |
| Financeiro CRUD | ✅ | ✅ |
| Relatórios | ✅ | ✅ |
| Multi-usuário | ❌ | ✅ |
| Persistência | ❌ (local) | ✅ (servidor) |
| Backup | ❌ | ✅ |
| Segurança | ❌ | ✅ |

## Vantagens de Cada Modo

### LocalStorage

- ✅ Sem custos de servidor
- ✅ Funciona offline
- ✅ Setup instantâneo
- ✅ Ideal para demos
- ❌ Dados locais apenas
- ❌ Sem multi-usuário
- ❌ Sem backup

### API + Postgres

- ✅ Dados centralizados
- ✅ Multi-usuário
- ✅ Backup automático
- ✅ Segurança real (JWT)
- ✅ Escalável
- ❌ Requer servidor
- ❌ Custo mensal (~$15)

## Troubleshooting

### "Failed to fetch" ao ativar API

- Verifique se `baseUrl` está correto
- Confirme que o backend está rodando
- Abra a URL da API no navegador para testar

### Dados não aparecem após ativar API

- O banco começa vazio
- Adicione dados manualmente ou importe

### Login não funciona

- Verifique credenciais: admin/admin123
- Confira JWT_SECRET no Railway
- Veja os logs do backend

### Performance lenta

- Verifique a latência da API
- Considere aumentar `timeoutMs` no config
- Railway pode "adormecer" (cold start) no plano free

## Rollback para LocalStorage

Se algo der errado, volte facilmente:

```javascript
API: {
    enabled: false,  // ← Desativar
    baseUrl: 'https://sua-url-railway.up.railway.app',
    timeoutMs: 8000
}
```

Commit, push e pronto. O sistema volta a usar LocalStorage automaticamente.

## Próximos Passos

Com a API ativa, você pode:

1. Criar múltiplos usuários (garçons, cozinha, admin)
2. Acessar de vários dispositivos simultaneamente
3. Ter relatórios centralizados
4. Fazer backup do banco regularmente
5. Escalar conforme necessário

## Suporte

Dúvidas? Abra uma issue no repositório do projeto.
