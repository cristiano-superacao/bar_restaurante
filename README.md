# 🌟 Maria Flor - Sistema Completo de Gestão para Restaurantes

Sistema moderno e completo de gestão para bares e restaurantes com interface responsiva e funcionalidades avançadas.

[![Status](https://img.shields.io/badge/Status-✅%20Produção-success)](https://github.com/cristiano-superacao/bar_restaurante)
[![Versão](https://img.shields.io/badge/Versão-2.0.0-blue)](https://github.com/cristiano-superacao/bar_restaurante)
[![Licença](https://img.shields.io/badge/Licença-MIT-green)](LICENSE)

## 🚀 Funcionalidades Implementadas

- ✅ **Sistema de Autenticação** - Login seguro com múltiplos perfis
- ✅ **Dashboard Interativo** - Visão geral com gráficos em tempo real
- ✅ **Gestão de Vendas** - CRUD completo com histórico
- ✅ **Sistema de Mesas** - Controle visual e interativo
- ✅ **Gerenciamento de Pedidos** - Kanban board completo
- ✅ **Cardápio Digital** - Gestão completa de produtos
- ✅ **Controle de Estoque** - Inventário com alertas
- ✅ **Módulo Financeiro** - Relatórios e controle de despesas
- ✅ **Sistema de Permissões** - Controle por função de usuário

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL (Neon)
- **Hospedagem**: Netlify + GitHub Pages
- **Charts**: Chart.js
- **Icons**: Font Awesome

## 🌐 Deploy

### GitHub Pages
O projeto está configurado para funcionar no GitHub Pages como uma aplicação estática.

### Netlify
Para funcionalidades avançadas com backend, o projeto pode ser deployado no Netlify.

### Configuração do Banco Neon

1. Crie uma conta no [Neon](https://neon.tech)
2. Crie um novo projeto
3. Execute o script `database/schema.sql` no console SQL
4. Configure a variável `DATABASE_URL` no arquivo `.env`

## 📦 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/maria-flor-sistema.git

# Entre no diretório
cd maria-flor-sistema

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Banco de dados Neon
DATABASE_URL=postgresql://username:password@host/database

# JWT Secret
JWT_SECRET=seu-jwt-secret-seguro

# Ambiente
NODE_ENV=production
```

### Scripts Disponíveis

- `npm start` - Inicia o servidor de produção
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Executa o build do projeto
- `npm test` - Executa os testes

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔐 Autenticação

### 🔐 Credenciais de Teste Implementadas

#### 👑 **Administração (Acesso Total)**
- **admin** / MariaFlor2025! (Administrador)
- **gerente** / Gerente123! (Gerente)

#### 🍽️ **Atendimento**
- **garcom1** / Garcom123! (Garçonete)
- **garcom2** / Garcom123! (Garçom)

#### 🔥 **Cozinha**
- **cozinha1** / Cozinha123! (Chef)
- **cozinha2** / Cozinha123! (Cozinheira)

#### 💰 **Financeiro**
- **caixa1** / Caixa123! (Operador de Caixa)
- **caixa2** / Caixa123! (Caixa)

#### 📦 **Estoque**
- **estoque1** / Estoque123! (Almoxarife)
- **estoque2** / Estoque123! (Controle de Estoque)

### Sistema de Permissões Baseado em Roles

| Usuário | Vendas | Pedidos | Cardápio | Estoque | Financeiro |
|---------|--------|---------|----------|---------|------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gerente | ✅ | ✅ | ✅ | ✅ | ✅ |
| Garçom | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cozinha | ❌ | ✅ | ✅ | ❌ | ❌ |
| Caixa | ✅ | ❌ | ❌ | ❌ | ✅ |
| Estoque | ❌ | ❌ | ✅ | ✅ | ❌ |

### Atalhos de Teclado
- **Ctrl + /** : Mostrar/Ocultar credenciais no login
- **Ctrl + Shift + V** : Executar validação completa do sistema
- **ESC** : Limpar campos de login
- **Enter** : Submeter formulário

### Produção
Em produção, os usuários são validados contra o banco de dados com senhas criptografadas.

## 📊 Dashboard

O dashboard inclui:
- Vendas do dia em tempo real
- Gráfico de vendas por período
- Produtos mais vendidos
- Pedidos recentes
- Indicadores de performance

## 💳 Sistema de Vendas

- Registro rápido de vendas
- Múltiplos métodos de pagamento (Dinheiro, Cartão, PIX)
- Controle de itens e quantidades
- Histórico completo de transações

## 🍽️ Gestão de Pedidos

- Sistema de pedidos por mesa
- Status de preparação (Pendente, Preparando, Pronto, Entregue)
- Controle de tempo de preparo
- Interface para cozinha

## 📋 Cardápio

- Gestão de produtos e categorias
- Controle de preços
- Upload de imagens
- Produtos ativos/inativos

## 📦 Estoque

- Controle de entrada e saída
- Alertas de estoque baixo
- Relatórios de movimentação
- Integração com vendas

## 💰 Módulo Financeiro

- Relatórios de receitas e despesas
- Controle de fluxo de caixa
- Gráficos de performance
- Exportação de relatórios

## 🎨 Personalização

O sistema pode ser personalizado alterando:
- Cores e tema no arquivo `css/dashboard.css`
- Logo e imagens na pasta `img/`
- Configurações no banco de dados

## 🔒 Segurança

- Autenticação JWT
- Headers de segurança configurados
- Validação de entrada
- Proteção contra XSS e CSRF

## 🚀 Performance

- Assets otimizados
- Cache configurado
- Código minificado em produção
- Lazy loading de imagens

## 📞 Suporte

Para suporte técnico, abra uma issue no GitHub ou entre em contato:
- **Email**: suporte@mariaflor.com
- **GitHub**: [Issues](https://github.com/seu-usuario/maria-flor-sistema/issues)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ⭐ Agradecimentos

- Font Awesome pelos ícones
- Chart.js pelos gráficos
- Neon pelo banco de dados
- Netlify pela hospedagem

---

**Desenvolvido com ❤️ para Maria Flor**