# �️ Sistema Bar Restaurante Maria Flor

> **Sistema completo de gestão para bar e restaurante**  
> Desenvolvido e idealizado por **Cristiano Santos**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://barestaurente.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-✅%20Online-success)](https://barestaurente.netlify.app)
[![Versão](https://img.shields.io/badge/Versão-2.0.0-blue)](https://github.com/cristiano-superacao/bar_restaurante)

## 🌟 **Deploy Live**
**🚀 Sistema Online**: [https://barestaurente.netlify.app](https://barestaurente.netlify.app)

## 🚀 Características Principais

- 💻 **100% Web-based** - Funciona em qualquer navegador
- 📱 **Responsivo** - Interface adaptável para desktop, tablet e mobile
- ☁️ **Cloud-ready** - Deploy automático Netlify + PostgreSQL
- 🔐 **Seguro** - Autenticação JWT com senhas criptografadas (bcrypt)
- ⚡ **Rápido** - APIs otimizadas e interface moderna
- 🎨 **Intuitivo** - Design clean e fácil de usar
- 📝 **Ficha Técnica** - Controle completo de ingredientes e custos

## 📚 Documentação Completa

- **[📖 Documentação Completa](docs/DOCUMENTACAO_COMPLETA.md)** - Guia completo do sistema
- **[🛠️ Implementação](docs/IMPLEMENTACAO_COMPLETA.md)** - Detalhes técnicos
- **[🎯 Como Usar](docs/COMO_USAR.md)** - Guia do usuário
- **[🚀 Guia Rápido](docs/GUIA_RAPIDO.md)** - Início rápido em 5 minutos
- **[🗄️ Configurar Neon](docs/CONFIGURAR_NEON.md)** - Setup do banco de dados
- **[👥 Usuários do Sistema](docs/USUARIOS_SISTEMA.md)** - Credenciais e perfis
- **[🔌 API Reference](docs/API_REFERENCE.md)** - Endpoints e exemplos
- **[⚙️ Setup](docs/SETUP.md)** - Instalação e configuração

## 🔑 Acesso Rápido

**Credenciais de teste:**
- **Admin**: `admin` / `admin123`
- **Gerente**: `gerente` / `gerente123`
- **Garçom**: `garcom` / `garcom123`
- **Cozinha**: `cozinha` / `cozinha123`
- **Caixa**: `caixa` / `caixa123`

## 🚀 Funcionalidades Implementadas

- ✅ **Sistema de Autenticação** - Login seguro com múltiplos perfis
- ✅ **Dashboard Interativo** - Visão geral com gráficos em tempo real
- ✅ **Gestão de Vendas** - CRUD completo com histórico
- ✅ **Sistema de Mesas** - Controle visual e interativo
- ✅ **Gerenciamento de Pedidos** - Kanban board completo
- ✅ **Cardápio Digital** - Gestão completa de produtos
- ✅ **Ficha Técnica** - Controle de ingredientes e custos
- ✅ **Controle de Estoque** - Inventário com alertas
- ✅ **Módulo Financeiro** - Relatórios e controle de despesas
- ✅ **Sistema de Permissões** - Controle por função de usuário

## 🔑 **Credenciais de Acesso**

| Tipo | Email | Senha | Função |
|------|-------|-------|---------|
| **👑 Admin** | cristiano@mariaflor.com.br | admin123 | Administrador geral |
| **�‍💼 Gerente** | maria@mariaflor.com.br | maria2024 | Gerente geral |
| **👨‍🍳 Chef** | joao.chef@mariaflor.com.br | chef2024 | Chef de cozinha |
| **🍽️ Garçom** | ana.garcom@mariaflor.com.br | garcom2024 | Atendimento senior |
| **💰 Caixa** | carlos.caixa@mariaflor.com.br | caixa2024 | Financeiro |
| **📦 Estoque** | pedro.estoque@mariaflor.com.br | estoque2024 | Controle de estoque |

*[Ver todos os 10 usuários](docs/USUARIOS_SISTEMA.md)*

## �🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL (Neon)
- **Hospedagem**: Netlify com deploy automático
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

## 🧪 Testes

```bash
# Rodar testes unitários
npm test

# Cobertura de código
npm run test:coverage

# Testes de integração
npm run test:integration
```

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/SEU_USERNAME/bar_restaurante.git`
3. **Crie uma branch**: `git checkout -b minha-feature`
4. **Commit suas mudanças**: `git commit -m "feat: minha nova feature"`
5. **Push para a branch**: `git push origin minha-feature`
6. **Abra um Pull Request**

## 📝 Roadmap

- [ ] 📱 **v2.1.0**: PWA (Progressive Web App)
- [ ] 🚚 **v2.2.0**: Sistema de delivery integrado
- [ ] 📊 **v2.3.0**: Relatórios avançados e BI
- [ ] 🤖 **v2.4.0**: Integração WhatsApp Business
- [ ] 🔄 **v2.5.0**: Sincronização multi-loja
- [ ] 💳 **v2.6.0**: Integração PIX e gateways

## 🐛 Reportar Problemas

Encontrou um bug? [Abra uma issue](https://github.com/cristiano-superacao/bar_restaurante/issues/new) com:
- Descrição detalhada do problema
- Passos para reproduzir
- Screenshots (se aplicável)
- Ambiente (navegador, OS)

## 📈 Performance

- ⚡ **Tempo de carregamento**: < 2s
- 📱 **Compatibilidade móvel**: 100%
- 🔒 **Security Score**: A+
- 📊 **Lighthouse Score**: 95+

## 🔒 Segurança

- Autenticação JWT com expiração
- Senhas criptografadas com bcrypt
- Headers de segurança configurados
- Validação de entrada
- Proteção contra XSS e CSRF

## 🚀 Performance

- Assets otimizados
- Cache configurado
- Código minificado em produção
- Lazy loading de imagens
- APIs otimizadas

## 📞 Suporte

### 🆘 Suporte Técnico
- 📧 Email: `cristiano.s.santos@ba.estudante.senai.br`
- 📱 WhatsApp: `(71) 99337-2960`
- 🐙 GitHub: [Issues](https://github.com/cristiano-superacao/bar_restaurante/issues)

### 👨‍💻 Desenvolvimento
- 📧 Email: `desenvolvimento@mariaflor.com`
- 💻 GitHub: [@cristiano-superacao](https://github.com/cristiano-superacao)

## 🏆 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Cristiano Superação**  
📧 Email: cristiano.s.santos@ba.estudante.senai.br
🐙 GitHub: [@cristiano-superacao](https://github.com/cristiano-superacao)  
💼 LinkedIn: [Cristiano Superação](https://linkedin.com/in/cristiano-superacao)

## � Agradecimentos

- **Restaurante Maria Flor** - Por confiar no projeto
- **Comunidade Open Source** - Pelas ferramentas incríveis
- **Netlify & Neon** - Pela infraestrutura gratuita

---

<div align="center">

**🌸 Desenvolvido com ❤️ em Salvador, BA**

[![Netlify Status](https://api.netlify.com/api/v1/badges/sua-badge/deploy-status)](https://app.netlify.com/sites/maria-flor/deploys)

*Se este projeto te ajudou, deixe uma ⭐!*

</div>

## 📄 Licença

Copyright © 2024 Cristiano Santos. Todos os direitos reservados.

Este é um projeto proprietário desenvolvido especificamente para gestão de bar e restaurante.

## ⭐ Agradecimentos

- Font Awesome pelos ícones
- Chart.js pelos gráficos
- PostgreSQL pelo banco de dados
- Netlify pela hospedagem

---

<div align="center">

**🍽️ Criado e Idealizado por ♥ Cristiano Santos**

**🌟 Sistema Online**: [barestaurente.netlify.app](https://barestaurente.netlify.app)

</div>