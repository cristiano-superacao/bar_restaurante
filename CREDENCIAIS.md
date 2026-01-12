# 🔑 Credenciais de Acesso - Sistema Bar Restaurante

## 🟣 Super Administrador (Acesso Total)

**Perfil**: Acesso irrestrito a todas as empresas e funcionalidades

| Campo | Valor |
|-------|-------|
| **Usuário** | `superadmin` |
| **Senha** | `super123` |
| **Email** | superadmin@sistema.com.br |
| **Company ID** | `null` (todas as empresas) |

**Permissões Especiais**:
- ✅ Acesso à página de Gestão de Empresas
- ✅ Visualiza dados de TODAS as empresas
- ✅ Pode criar/editar/excluir empresas
- ✅ Acesso completo ao sistema

---

## 🔵 Administrador - Maria Flor

**Perfil**: Gerencia apenas a empresa Maria Flor

| Campo | Valor |
|-------|-------|
| **Usuário** | `admin` |
| **Senha** | `admin123` |
| **Email** | admin@mariaflor.com.br |
| **Company ID** | `1` (Maria Flor) |

**Permissões**:
- ✅ Dashboard e relatórios
- ✅ Gestão completa de pedidos, mesas, cardápio
- ✅ Gestão de delivery, clientes e reservas
- ✅ Controle de estoque e financeiro
- ✅ Gerenciamento de usuários da empresa
- ✅ Configurações do sistema
- ❌ NÃO pode acessar gestão de empresas
- ❌ Vê apenas dados da empresa ID 1

---

## 🔵 Administrador - Outro Restaurante

**Perfil**: Gerencia apenas o Outro Restaurante (para testes multi-tenant)

| Campo | Valor |
|-------|-------|
| **Usuário** | `admin2` |
| **Senha** | `admin123` |
| **Email** | admin@outrorestaurante.com.br |
| **Company ID** | `2` (Outro Restaurante) |

**Permissões**: Iguais ao admin, mas vê apenas dados da empresa ID 2

---

## ⚪ Funcionário - Garçom

**Perfil**: Operações de atendimento

| Campo | Valor |
|-------|-------|
| **Usuário** | `garcom` |
| **Senha** | `garcom123` |
| **Email** | garcom@mariaflor.com.br |
| **Company ID** | `1` (Maria Flor) |

**Permissões**:
- ✅ Visualizar dashboard
- ✅ Visualizar e criar pedidos
- ✅ Visualizar mesas
- ✅ Visualizar cardápio
- ✅ Visualizar delivery
- ❌ Bloqueado: Usuários, Empresas, Configurações, Financeiro, Estoque

---

## ⚪ Funcionário - Cozinha

**Perfil**: Operações de cozinha

| Campo | Valor |
|-------|-------|
| **Usuário** | `cozinha` |
| **Senha** | `cozinha123` |
| **Email** | cozinha@mariaflor.com.br |
| **Company ID** | `1` (Maria Flor) |

**Permissões**:
- ✅ Visualizar dashboard
- ✅ Visualizar pedidos
- ✅ Visualizar cardápio
- ❌ Bloqueado: Usuários, Empresas, Configurações, Financeiro, Estoque, Clientes, Reservas, Mesas

---

## ⚪ Funcionário - Caixa

**Perfil**: Operações de caixa

| Campo | Valor |
|-------|-------|
| **Usuário** | `caixa` |
| **Senha** | `caixa123` |
| **Email** | caixa@mariaflor.com.br |
| **Company ID** | `1` (Maria Flor) |

**Permissões**:
- ✅ Visualizar dashboard
- ✅ Visualizar pedidos
- ✅ Visualizar financeiro
- ❌ Bloqueado: Usuários, Empresas, Configurações, Estoque, Clientes, Reservas, Mesas, Cardápio

---

## 🧪 Cenários de Teste

### Teste 1: Isolamento Multi-Tenant
1. Faça login como `admin` (Company ID 1)
2. Navegue até Pedidos, Clientes, etc.
3. Verifique que vê apenas dados da empresa Maria Flor
4. Faça logout e login como `admin2` (Company ID 2)
5. Verifique que vê apenas dados do Outro Restaurante
6. Os dados devem ser completamente isolados

### Teste 2: Acesso Cross-Company (Superadmin)
1. Faça login como `superadmin`
2. Navegue até a página **Empresas** (deve estar visível no menu)
3. Veja a lista de todas as empresas cadastradas
4. Navegue até Pedidos, Clientes, etc.
5. Verifique que vê dados de TODAS as empresas

### Teste 3: Restrições de Staff
1. Faça login como `garcom`
2. Verifique que os seguintes links NÃO aparecem no menu:
   - Usuários
   - Empresas
   - Configurações
   - Financeiro
   - Estoque
3. Tente acessar manualmente `usuarios.html`
4. Deve ser redirecionado para o dashboard com mensagem de erro

### Teste 4: Proteção de Página Empresas
1. Faça login como `admin`
2. Verifique que o link "Empresas" NÃO aparece no menu
3. Tente acessar manualmente `empresas.html`
4. Deve ser redirecionado para o dashboard com mensagem de erro
5. Faça login como `superadmin`
6. O link "Empresas" deve aparecer no menu
7. Acesso à página deve funcionar normalmente

### Teste 5: Badge de Role
1. Faça login com qualquer usuário
2. Verifique o cabeçalho da página
3. Deve aparecer um badge colorido indicando o role:
   - 🟣 Roxo para Superadmin
   - 🔵 Azul para Admin
   - ⚪ Cinza para Staff

---

## 📋 Matriz de Permissões

| Página/Funcionalidade | Superadmin | Admin | Staff |
|----------------------|------------|-------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Pedidos (ver) | ✅ | ✅ | ✅ |
| Pedidos (criar/editar) | ✅ | ✅ | ✅ (apenas criar) |
| Mesas | ✅ | ✅ | ✅ (visualizar) |
| Cardápio | ✅ | ✅ | ✅ (visualizar) |
| Delivery | ✅ | ✅ | ✅ (visualizar) |
| Clientes | ✅ | ✅ | ❌ |
| Reservas | ✅ | ✅ | ❌ |
| Estoque | ✅ | ✅ | ❌ |
| Financeiro | ✅ | ✅ | ❌ |
| Relatórios | ✅ | ✅ | ❌ |
| Usuários | ✅ | ✅ | ❌ |
| **Empresas** | ✅ | ❌ | ❌ |
| Configurações | ✅ | ✅ | ❌ |
| Manual | ✅ | ✅ | ✅ |

---

## 🔍 Como Verificar o Role Atual

### No Console do Navegador (F12)

```javascript
// Ver informações completas do RBAC
RBAC.debugInfo();

// Verificar role atual
RBAC.getCurrentRole();

// Verificar se é superadmin
RBAC.isSuperAdmin();

// Verificar se é admin ou superior
RBAC.isAdmin();

// Verificar usuário completo
RBAC.getCurrentUser();
```

### No LocalStorage

1. Abra o DevTools (F12)
2. Vá para a aba **Application** ou **Armazenamento**
3. Expanda **Local Storage**
4. Procure por:
   - `currentUser`: Dados completos do usuário (JSON)
   - `authToken`: Token de autenticação

---

## 🚀 URLs de Acesso

### Local
- Frontend: `http://localhost:8000`
- Backend API: `http://localhost:3000`

### Produção
- Frontend: `https://barestaurante.netlify.app`
- Backend API: `https://barestaurante.up.railway.app`

---

## 📚 Documentação Adicional

- [RBAC.md](RBAC.md) - Documentação completa do sistema de controle de acesso
- [README.md](README.md) - Documentação geral do sistema
- [CONFIGURACAO_API.md](CONFIGURACAO_API.md) - Como configurar a API

---

## ⚠️ Notas de Segurança

1. **Produção**: Altere todas as senhas padrão antes de colocar em produção
2. **API Backend**: O backend deve sempre validar as permissões, não confie apenas no frontend
3. **JWT Secret**: Use uma chave forte e secreta no arquivo `.env`
4. **HTTPS**: Em produção, sempre use HTTPS (Railway e Netlify já fornecem)
5. **Company ID**: Em produção, o company_id deve vir do JWT decodificado no backend

---

**Última atualização**: Janeiro 2026  
**Versão**: 2.2.0
