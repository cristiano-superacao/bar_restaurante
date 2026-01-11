# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Sistema de Gestão para Bar e Restaurante**! 

Este documento fornece diretrizes para contribuir com o projeto de forma eficiente e consistente.

---

## 📋 Índice

- [Código de Conduta](#-código-de-conduta)
- [Como Contribuir](#-como-contribuir)
- [Reportando Bugs](#-reportando-bugs)
- [Sugerindo Melhorias](#-sugerindo-melhorias)
- [Processo de Pull Request](#-processo-de-pull-request)
- [Style Guide](#-style-guide)
- [Estrutura de Commits](#-estrutura-de-commits)
- [Ambiente de Desenvolvimento](#-ambiente-de-desenvolvimento)

---

## 🤝 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você deve:

- Ser respeitoso e inclusivo com todos os colaboradores
- Aceitar críticas construtivas de forma positiva
- Focar no que é melhor para a comunidade
- Demonstrar empatia com outros membros

---

## 🚀 Como Contribuir

### 1. Fork o Repositório

Clique no botão "Fork" no topo da página do repositório.

### 2. Clone Seu Fork

```bash
git clone https://github.com/seu-usuario/bar_restaurante.git
cd bar_restaurante
```

### 3. Adicione o Repositório Original como Upstream

```bash
git remote add upstream https://github.com/cristiano-superacao/bar_restaurante.git
```

### 4. Crie uma Branch para Sua Feature

```bash
# Sempre crie a partir da main atualizada
git checkout main
git pull upstream main
git checkout -b feature/minha-feature
```

**Convenção de nomes de branch:**
- `feature/nome-descritivo` - Nova funcionalidade
- `fix/nome-do-bug` - Correção de bug
- `docs/nome-do-doc` - Atualização de documentação
- `refactor/nome` - Refatoração de código
- `test/nome` - Adição ou correção de testes

### 5. Faça Suas Alterações

- Siga o [Style Guide](#-style-guide)
- Mantenha os commits pequenos e focados
- Escreva mensagens de commit claras (veja [Estrutura de Commits](#-estrutura-de-commits))

### 6. Teste Suas Alterações

```bash
# Frontend
npm start

# Backend
cd server
npm run check-env
npm start

# Acesse e teste: http://localhost:8000 e http://localhost:3000
```

### 7. Commit Suas Mudanças

```bash
git add .
git commit -m "feat: adiciona funcionalidade X"
```

### 8. Push para Seu Fork

```bash
git push origin feature/minha-feature
```

### 9. Abra um Pull Request

- Vá até o repositório original no GitHub
- Clique em "New Pull Request"
- Selecione sua branch
- Preencha o template de PR com detalhes

---

## 🐛 Reportando Bugs

Antes de reportar um bug, **verifique se já não existe uma issue aberta**.

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que realmente acontece.

**Screenshots**
Se aplicável, adicione capturas de tela.

**Ambiente**
- OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
- Navegador: [e.g. Chrome 120, Firefox 115]
- Node.js: [e.g. 18.17.0]
- PostgreSQL: [e.g. 14.5]

**Contexto Adicional**
Qualquer outra informação relevante.
```

---

## 💡 Sugerindo Melhorias

Sugestões de melhorias são sempre bem-vindas!

### Template de Feature Request

```markdown
**Problema Relacionado**
Descreva o problema que a feature resolve. Ex: "É frustrante quando..."

**Solução Proposta**
Descrição clara da solução desejada.

**Alternativas Consideradas**
Outras soluções que você considerou.

**Contexto Adicional**
Screenshots, mockups, links de referência, etc.
```

---

## 🔄 Processo de Pull Request

### Checklist Antes de Submeter

- [ ] Código segue o [Style Guide](#-style-guide)
- [ ] Commits seguem a [Estrutura de Commits](#-estrutura-de-commits)
- [ ] Código foi testado localmente (frontend + backend)
- [ ] Documentação foi atualizada (se necessário)
- [ ] Sem warnings no console do navegador
- [ ] Sem erros de validação no backend
- [ ] README.md atualizado (se aplicável)

### Template de Pull Request

```markdown
**Descrição**
Resumo claro das mudanças.

**Tipo de Mudança**
- [ ] Bug fix (correção que resolve uma issue)
- [ ] Nova feature (adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação
- [ ] Refatoração
- [ ] Testes

**Issues Relacionadas**
Fecha #123, Relaciona-se com #456

**Como Testar**
1. Clone a branch
2. Execute `npm install`
3. Inicie o servidor: `npm start`
4. Vá para [página específica]
5. Teste [funcionalidade específica]

**Screenshots/GIFs**
Se aplicável, adicione evidências visuais.

**Checklist**
- [ ] Testado localmente
- [ ] Documentação atualizada
- [ ] Sem warnings
- [ ] Commits seguem convenção
```

### Revisão de Código

- **Paciência**: Revisões podem levar alguns dias
- **Feedback**: Esteja aberto a sugestões de mudança
- **Discussão**: Discussões construtivas são bem-vindas
- **Iteração**: Pode haver múltiplas rodadas de revisão

---

## 🎨 Style Guide

### JavaScript

**Geral:**
```javascript
// ✅ Bom
const userName = 'João Silva';
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ Ruim
var user_name = "João Silva"  // sem ponto-vírgula, var, snake_case
function calculateTotal(items) {
  var sum = 0
  for (var i = 0; i < items.length; i++) {
    sum += items[i].price
  }
  return sum
}
```

**Convenções:**
- ✅ Use `const` por padrão, `let` se precisar reatribuir
- ✅ Arrow functions para callbacks
- ✅ Template literals para strings com variáveis
- ✅ Destructuring quando apropriado
- ✅ camelCase para variáveis e funções
- ✅ PascalCase para classes
- ✅ UPPER_SNAKE_CASE para constantes globais
- ❌ Evite `var`
- ❌ Evite `function` tradicional (prefira arrow)
- ❌ Evite concatenação de strings com `+`

**Async/Await:**
```javascript
// ✅ Bom
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// ❌ Ruim
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error(error));
}
```

### HTML

**Convenções:**
```html
<!-- ✅ Bom: Semântico, acessível, indentado -->
<main class="container">
  <section class="section" aria-labelledby="products-heading">
    <h2 id="products-heading">Produtos</h2>
    <div class="grid">
      <article class="card">
        <img src="product.jpg" alt="Descrição do produto">
        <h3>Nome do Produto</h3>
        <button type="button" class="btn btn-primary" aria-label="Adicionar ao carrinho">
          Adicionar
        </button>
      </article>
    </div>
  </section>
</main>

<!-- ❌ Ruim: Não semântico, sem acessibilidade -->
<div class="main">
  <div class="section">
    <div class="title">Produtos</div>
    <div class="grid">
      <div class="card">
        <img src="product.jpg">
        <div class="name">Nome do Produto</div>
        <div class="btn" onclick="add()">Adicionar</div>
      </div>
    </div>
  </div>
</div>
```

### CSS

**Convenções:**
```css
/* ✅ Bom: BEM, variáveis, mobile-first */
:root {
  --primary-color: #1a73e8;
  --spacing-md: 1rem;
}

.card {
  padding: var(--spacing-md);
  background: white;
}

.card__title {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.card--featured {
  border: 2px solid var(--primary-color);
}

/* Mobile-first */
@media (min-width: 768px) {
  .card {
    padding: calc(var(--spacing-md) * 2);
  }
}

/* ❌ Ruim: Sem organização, magic numbers, desktop-first */
.card {
  padding: 32px;
  background: #fff;
}

.card .title {
  color: #1a73e8;
  font-size: 20px;
}

.cardFeatured {
  border: 2px solid #1a73e8;
}

@media (max-width: 767px) {
  .card {
    padding: 16px;
  }
}
```

### SQL

**Convenções:**
```sql
-- ✅ Bom: UPPER_CASE keywords, indentação, comentários
-- Busca pedidos recentes com itens
SELECT 
  o.id,
  o.total,
  o.created_at,
  json_agg(
    json_build_object(
      'item_id', oi.id,
      'name', mi.name,
      'quantity', oi.quantity
    )
  ) AS items
FROM orders o
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN menu_items mi ON mi.id = oi.menu_item_id
WHERE o.company_id = $1
  AND o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;

-- ❌ Ruim: lower_case, sem indentação
select o.id,o.total,o.created_at from orders o where o.company_id=$1 and o.created_at>=now()-interval'7days'order by o.created_at desc limit 10;
```

---

## 📝 Estrutura de Commits

Usamos **[Conventional Commits](https://www.conventionalcommits.org/)** para mensagens de commit padronizadas.

### Formato

```
<tipo>(<escopo>): <descrição curta>

<corpo opcional>

<rodapé opcional>
```

### Tipos

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat(pedidos): adiciona filtro por status` |
| `fix` | Correção de bug | `fix(api): corrige validação de email` |
| `docs` | Documentação | `docs(readme): atualiza instruções de instalação` |
| `style` | Formatação de código | `style(css): padroniza indentação` |
| `refactor` | Refatoração | `refactor(utils): extrai função de formatação` |
| `test` | Testes | `test(orders): adiciona teste de criação` |
| `chore` | Tarefas de manutenção | `chore(deps): atualiza dependências` |
| `perf` | Melhoria de performance | `perf(api): otimiza query de pedidos` |
| `ci` | CI/CD | `ci(github): adiciona workflow de testes` |
| `build` | Build system | `build(docker): otimiza Dockerfile` |
| `revert` | Reverte commit | `revert: reverte "feat: nova feature"` |

### Escopos Sugeridos

- `api` - Backend
- `frontend` - Interface
- `auth` - Autenticação
- `db` - Banco de dados
- `deploy` - Deploy
- `docs` - Documentação
- `cardapio`, `pedidos`, `mesas`, etc. - Módulos específicos

### Exemplos

```bash
# Feature simples
git commit -m "feat(cardapio): adiciona busca por categoria"

# Bug fix com corpo
git commit -m "fix(api): corrige validação de CPF

O regex anterior não validava corretamente CPFs com dígitos repetidos.
Agora usa validação completa com cálculo de dígito verificador."

# Breaking change
git commit -m "feat(api)!: altera estrutura de retorno de pedidos

BREAKING CHANGE: O endpoint /api/orders agora retorna um objeto
com { data: [], total: 0 } ao invés de um array direto."

# Fecha issue
git commit -m "fix(delivery): corrige cálculo de taxa

Closes #42"
```

---

## 🛠️ Ambiente de Desenvolvimento

### Requisitos

- **Node.js** ≥18.0.0
- **npm** ≥9.0.0
- **PostgreSQL** ≥14 (para backend)
- **Git** 2.x
- **Editor**: VS Code (recomendado) com extensões:
  - ESLint
  - Prettier
  - EditorConfig
  - GitLens

### Configuração Inicial

```bash
# Clone e configure
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante

# Frontend
npm install
npm start  # http://localhost:8000

# Backend (novo terminal)
cd server
cp .env.example .env
# Edite .env com suas credenciais
npm install
npm run check-env
npm run migrate
npm start  # http://localhost:3000/api/health
```

### Scripts Úteis

```bash
# Frontend
npm start              # Inicia dev server
npm run build          # Build (se necessário)
npm run deploy         # Deploy rápido

# Backend
npm run dev            # Dev com auto-reload
npm start              # Produção
npm run migrate        # Aplica migrações
npm run rebuild        # Rebuild completo do banco
npm run check-env      # Valida variáveis
```

### Debugging

**Frontend:**
- Use DevTools do navegador (F12)
- Console.log é seu amigo
- Breakpoints no Sources tab

**Backend:**
```bash
# Node.js inspector
node --inspect src/index.js

# VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/server/src/index.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Testando APIs

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@default.local","password":"admin123"}'

# Listar mesas (com token)
curl http://localhost:3000/api/tables \
  -H "Authorization: Bearer <seu-token>" \
  -H "X-Company-Id: 1"
```

---

## 📞 Dúvidas?

- 📖 Consulte a [documentação](README.md)
- 💬 Abra uma [discussão](https://github.com/cristiano-superacao/bar_restaurante/discussions)
- 📧 Entre em contato: cristiano.superacao@gmail.com

---

**Obrigado por contribuir! 🎉**

---

<div align="center">

[⬆ Voltar ao topo](#-guia-de-contribuição)

</div>
