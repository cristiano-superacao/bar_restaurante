# 🍽️ Sistema de Gestão para Bar e Restaurante

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/cristiano-superacao/bar_restaurante)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Railway](https://img.shields.io/badge/deploy-Railway-purple.svg)](https://railway.app)

> Sistema completo de gestão para bares e restaurantes com arquitetura híbrida: funciona 100% offline (LocalStorage) ou com backend completo (Express + PostgreSQL). Interface responsiva e profissional para desktop, tablet e mobile.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API Backend](#-api-backend)
- [Deploy](#-deploy)
- [Documentação](#-documentação)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Visão Geral

Sistema profissional de gestão desenvolvido com **arquitetura híbrida progressiva**, permitindo:

- ✅ **Modo Offline**: Persistência total via LocalStorage do navegador
- ✅ **Modo Cloud**: Backend Node.js + PostgreSQL no Railway
- ✅ **Multi-tenant**: Suporte a múltiplas empresas com isolamento de dados
- ✅ **Autenticação JWT**: Segurança robusta com tokens e roles
- ✅ **Interface Responsiva**: Design adaptativo para todos os dispositivos
- ✅ **Zero Breaking Changes**: Transição suave entre modos

## ✨ Funcionalidades

### 📊 Módulos Principais

#### 🍽️ Cardápio
- Cadastro completo de itens (nome, categoria, preço, descrição, imagem)
- Busca em tempo real e filtros por categoria
- Métricas: Total de itens, categorias únicas, preço médio
- Visualização em grid com cards categorizados

#### 📝 Pedidos
- Gestão de pedidos Mesa e Delivery
- Controle de status: Pendente → Em Preparo → Entregue → Pago
- Adição de itens do cardápio com cálculo automático
- Métricas por status em tempo real
- Geração de cupom fiscal

#### 🪑 Mesas
- Gerenciamento de mesas (nome, capacidade, status)
- Status visual: Livre/Ocupada
- Métricas: Disponibilidade e capacidade total
- Busca e filtros de status

#### 📅 Reservas
- Agendamento com data, hora, cliente e pessoas
- Status: Confirmada, Pendente, Cancelada
- Busca por nome/telefone
- Filtros de data e status

#### 📦 Estoque
- Controle de produtos com quantidade atual e mínima
- Alertas visuais: Baixo, Crítico, OK
- Métricas de inventário
- Busca e filtro por categoria

#### 💰 Financeiro
- Registro de receitas e despesas
- Dashboard com saldo, receitas, despesas e previsão
- Filtros por tipo e período
- Busca por descrição

#### 📈 Relatórios
- Gráficos interativos (Chart.js)
- Top itens mais vendidos
- Vendas por categoria
- Filtros: Hoje, 7 dias, 30 dias, Todos

#### 🏍️ Delivery
- Gestão de entregas com endereço completo
- Taxa de entrega configurável
- Status e rastreamento
- Métricas por status

#### 👤 Clientes
- Cadastro completo: nome, CPF, telefone, email
- Histórico de pedidos
- Busca avançada

#### ⚙️ Configurações
- Perfil do usuário
- Configuração de conexão API
- Exportação/importação de dados
- Limpeza de dados

#### 👥 Usuários
- Gestão de contas e permissões
- Roles: superadmin, admin, staff
- Controle de acesso

#### 🏢 Empresas
- Gestão multi-tenant
- Seleção de contexto (para superadmin)
- Cadastro de empresas

#### 📖 Manual
- Documentação integrada
- Busca por módulo
- Links rápidos

### 🎨 Design e UX

- **Layout Responsivo**: Adaptação automática para mobile, tablet e desktop
- **Empty States**: Feedback visual quando não há dados
- **Stat Cards**: Métricas rápidas em todas as páginas
- **Toolbar Unificada**: Busca e filtros padronizados
- **Tema Azul Profissional**: Paleta consistente e acessível
- **Design System**: Componentes compartilhados e reutilizáveis
- **Sidebar Inteligente**: Colapsa automaticamente em telas pequenas

## 🛠️ Tecnologias

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| HTML5 | - | Estrutura semântica |
| CSS3 | - | Flexbox, Grid, variáveis CSS |
| JavaScript | ES6+ | Lógica e manipulação DOM |
| Chart.js | Latest | Gráficos dinâmicos |
| Font Awesome | 6.0 | Ícones |
| LocalStorage | - | Persistência offline |

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.19.2 | Framework web |
| PostgreSQL | 14+ | Banco de dados |
| JWT | 9.0.2 | Autenticação |
| bcryptjs | 3.0.2 | Hash de senhas |
| Helmet | 7.0.0 | Segurança headers |
| express-validator | 7.0.1 | Validação de entrada |
| express-rate-limit | 7.4.0 | Rate limiting |

### DevOps

- **Railway**: Deploy e hospedagem
- **Git**: Controle de versão
- **Docker**: Containerização (opcional)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ (para backend)
- PostgreSQL 14+ (para modo cloud)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Frontend (Modo Offline)

1. Clone o repositório:
```bash
git clone https://github.com/cristiano-superacao/bar_restaurante.git
cd bar_restaurante
```

2. Abra `index.html` diretamente no navegador ou use um servidor local:

```bash
# Opção 1: Node.js
npm install
npm start

# Opção 2: Python
python -m http.server 8000

# Opção 3: npx
npx serve .
```

3. Acesse `http://localhost:8000` (ou a porta configurada)

### Backend (Modo Cloud)

1. Entre no diretório do servidor:
```bash
cd server
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o ambiente:
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:
```env
DATABASE_URL=postgres://usuario:senha@host:5432/database
JWT_SECRET=seu_segredo_forte_de_32+_caracteres
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.com
```

4. Inicie o servidor:
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

As migrações são aplicadas automaticamente na inicialização.

## ⚙️ Configuração

### Ativando o Modo API

#### Via Interface (Recomendado)

1. Acesse o sistema e faça login
2. Vá em **Configurações** → **Conexão com API**
3. Marque **"API habilitada"**
4. Insira a URL da API: `https://seu-servico.up.railway.app`
5. Clique em **"Testar Conexão"**
6. Se bem-sucedido, clique em **"Salvar"**
7. A página recarregará em modo cloud

#### Via Código

Edite `js/config.js`:
```javascript
window.CONFIG = {
  API: {
    enabled: true,
    baseUrl: 'https://seu-servico.up.railway.app',
    timeout: 15000
  }
};
```

### Voltando ao Modo Offline

1. **Configurações** → **Conexão com API**
2. Desmarque **"API habilitada"**
3. Salve e recarregue

## 📖 Uso

### Login

**Credenciais padrão:**
- **Admin**: `admin` / `admin123`
- **Superadmin**: `superadmin` / `superadmin123`

> ⚠️ **Importante**: Altere as senhas padrão antes de usar em produção!

### Navegação

O menu lateral contém todos os módulos:

- **Dashboard**: Visão geral do sistema
- **Cardápio**: Gestão de itens do menu
- **Pedidos**: Controle de pedidos
- **Clientes**: Cadastro de clientes
- **Delivery**: Gestão de entregas
- **Mesas**: Controle de ocupação
- **Reservas**: Agendamentos
- **Estoque**: Inventário
- **Financeiro**: Fluxo de caixa
- **Relatórios**: Análises e gráficos
- **Configurações**: Ajustes do sistema
- **Usuários**: Gestão de acessos
- **Empresas**: Multi-tenant
- **Manual**: Ajuda

### Ações Comuns

- **➕ Adicionar**: Botão verde na toolbar
- **✏️ Editar**: Clique no item ou botão de edição
- **🗑️ Excluir**: Botão vermelho (com confirmação)
- **🔍 Buscar**: Campo de busca em tempo real
- **🎛️ Filtrar**: Filtros pill com dropdown

### Backup e Restauração

1. **Exportar Dados**:
   - Vá em **Configurações**
   - Clique em **"Exportar Dados (JSON)"**
   - Salve o arquivo

2. **Limpar Dados**:
   - **Configurações** → **"Limpar Todos os Dados"**
   - Confirme a ação

## 🌐 API Backend

### Endpoints Principais

#### Autenticação
```
POST /api/auth/login
POST /api/auth/register
```

#### Empresas (Multi-tenant)
```
GET    /api/companies
POST   /api/companies
PUT    /api/companies/:id
```

#### Usuários
```
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

#### Cardápio
```
GET    /api/menu-items
POST   /api/menu-items
PUT    /api/menu-items/:id
DELETE /api/menu-items/:id
```

#### Mesas
```
GET    /api/tables
POST   /api/tables
PUT    /api/tables/:id
DELETE /api/tables/:id
```

#### Pedidos
```
GET    /api/orders
GET    /api/orders/:id/items
POST   /api/orders
PUT    /api/orders/:id
POST   /api/orders/:id/close
DELETE /api/orders/:id
```

#### Estoque
```
GET    /api/stock
POST   /api/stock
PUT    /api/stock/:id
DELETE /api/stock/:id
```

#### Clientes
```
GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
```

#### Reservas
```
GET    /api/reservations
POST   /api/reservations
PUT    /api/reservations/:id
DELETE /api/reservations/:id
```

#### Transações (Financeiro)
```
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

### Autenticação e Autorização

Todas as rotas (exceto `/api/auth/login` e `/api/auth/register`) requerem token JWT:

```bash
Authorization: Bearer <token>
```

#### Roles

- **superadmin**: Acesso total, gestão de empresas
- **admin**: Gestão completa dentro da empresa
- **staff**: Operações básicas (pedidos, mesas)

#### Multi-tenant

Para **superadmin**, especifique a empresa:
```bash
X-Company-Id: 1
```

Usuários **admin** e **staff** têm contexto de empresa no JWT.

### Validação de Entrada

Todas as rotas POST/PUT validam entrada com `express-validator`:

**Exemplo de erro:**
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "msg": "Invalid value",
      "param": "price",
      "location": "body"
    }
  ]
}
```

### Rate Limiting

- **Global**: 100 requisições/15 minutos
- **Login**: 5 tentativas/15 minutos

### Segurança

- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurável
- ✅ Rate limiting anti-brute-force
- ✅ Validação de entrada em todas as rotas
- ✅ JWT com expiração
- ✅ Senhas hasheadas com bcrypt

## 🚀 Deploy

### Railway (Recomendado)

1. **Crie conta no Railway**: https://railway.app

2. **Novo Projeto**:
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório

3. **Adicione PostgreSQL**:
   - "New Service" → "Database" → "PostgreSQL"
   - Railway gerará `DATABASE_URL` automaticamente

4. **Configure Variáveis**:
   ```
   DATABASE_URL=<gerado_automaticamente>
   JWT_SECRET=<seu_segredo_32+_chars>
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://seu-frontend.com
   ```

5. **Deploy**:
   - Railway detecta automaticamente `server/`
   - Deploy acontece em cada push no GitHub

6. **URL Pública**:
   - Railway fornece URL: `https://xxx.up.railway.app`
   - Configure no frontend em **Configurações → API**

### Netlify/Vercel (Frontend)

1. Conecte seu repositório
2. Configure build:
   ```
   Base directory: /
   Build command: npm run build
   Publish directory: /
   ```
3. Deploy automático a cada push

### Docker (Opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
EXPOSE 3000
CMD ["node", "src/index.js"]
```

```bash
docker build -t bar-restaurante-api .
docker run -p 3000:3000 --env-file .env bar-restaurante-api
```

## 📚 Documentação

- **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)**: Guia detalhado de deploy no Railway
- **[MIGRACAO_API.md](MIGRACAO_API.md)**: Como ativar/desativar a API
- **[CONFIGURACAO_API.md](CONFIGURACAO_API.md)**: Configuração avançada da API
- **[CHANGELOG.md](CHANGELOG.md)**: Histórico de mudanças
- **[server/README.md](server/README.md)**: Documentação do backend

## 📂 Estrutura do Projeto

```
bar_restaurante/
├── css/                    # Estilos organizados por página
│   ├── base.css           # Estilos base compartilhados
│   ├── dashboard.css      # Layout principal
│   ├── login.css          # Página de login
│   └── ...                # Módulos específicos
├── js/                     # Scripts por módulo
│   ├── config.js          # Configuração global
│   ├── utils.js           # Utilitários compartilhados
│   ├── api.js             # Cliente HTTP multi-tenant
│   ├── auth-neon.js       # Autenticação e guards
│   ├── dashboard.js       # Sidebar e navegação
│   └── ...                # Módulos específicos
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── index.js       # Entrypoint com auto-migração
│   │   ├── db.js          # Cliente PostgreSQL
│   │   ├── middleware/    # Auth JWT
│   │   ├── routes/        # Endpoints por módulo
│   │   └── migrations/    # SQL schemas
│   ├── package.json
│   └── README.md
├── scripts/                # Scripts de validação
│   ├── validate-ui.mjs    # Validador de UI
│   └── analyze-css.mjs    # Analisador CSS
├── *.html                  # Páginas do sistema (17)
├── package.json           # Dependências frontend
├── README.md              # Este arquivo
├── DEPLOY_RAILWAY.md      # Guia de deploy
├── MIGRACAO_API.md        # Guia de migração
├── CONFIGURACAO_API.md    # Configuração avançada
├── CHANGELOG.md           # Histórico
├── LICENSE                # Licença MIT
└── manifest.json          # PWA manifest
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. Commit suas mudanças:
   ```bash
   git commit -m 'Adiciona nova funcionalidade'
   ```
4. Push para a branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. Abra um Pull Request

### Diretrizes

- Mantenha o código limpo e documentado
- Siga o padrão de código existente
- Teste suas mudanças antes de enviar
- Atualize a documentação se necessário

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (navegador, SO, versão)

## 💡 Sugestões

Tem uma ideia? Abra uma [issue](https://github.com/cristiano-superacao/bar_restaurante/issues) com a tag `enhancement`.

## 📜 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Cristiano Santos**
- GitHub: [@cristiano-superacao](https://github.com/cristiano-superacao)
- Email: contato@superacao.dev

## 🙏 Agradecimentos

- Font Awesome pelos ícones
- Chart.js pelos gráficos
- Railway pela hospedagem
- Comunidade open source

## 📊 Status do Projeto

- ✅ Frontend completo e responsivo
- ✅ Backend Express + PostgreSQL
- ✅ Autenticação JWT multi-tenant
- ✅ Validação de entrada robusta
- ✅ Segurança endurecida
- ✅ Deploy pronto para produção
- 🔄 Em desenvolvimento contínuo

## 🔮 Roadmap

- [ ] PWA completo com service worker
- [ ] Notificações push
- [ ] Integração com pagamentos
- [ ] Impressão térmica (ESC/POS)
- [ ] App mobile nativo
- [ ] Analytics e dashboards avançados
- [ ] Integração com delivery (iFood, Uber Eats)
- [ ] Gestão de comandas

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- 📧 Email: contato@superacao.dev
- 💬 Issues: [GitHub Issues](https://github.com/cristiano-superacao/bar_restaurante/issues)
- 📖 Docs: Ver arquivos de documentação no repositório

---

<div align="center">

**[⬆ Voltar ao topo](#-sistema-de-gestão-para-bar-e-restaurante)**

Feito com ❤️ por [Cristiano Santos](https://github.com/cristiano-superacao)

</div>
