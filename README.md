# Sistema de Gestão para Bar e Restaurante

## Visão Geral

Este é um sistema de gestão completo para bares e restaurantes, desenvolvido com **arquitetura híbrida progressiva**. Funciona 100% offline (LocalStorage) ou com backend completo (Express + Postgres), mantendo a mesma interface responsiva e profissional em ambos os modos.

## 🚀 Novidades (Janeiro 2026)

- ✅ **Backend Express + PostgreSQL** compatível com Railway
- ✅ **Autenticação JWT** com guards de página
- ✅ **API REST completa** para todas as funcionalidades
- ✅ **Modo híbrido**: funciona com ou sem backend
- ✅ **Zero breaking changes** na interface
- ✅ **Deploy pronto** para produção

## 📚 Documentação

- **[Guia de Deploy Railway](DEPLOY_RAILWAY.md)** - Como fazer deploy do backend
- **[Guia de Migração API](MIGRACAO_API.md)** - Como ativar/desativar a API

## Funcionalidades Principais

- **Dashboard Intuitivo:** Uma visão geral e de fácil acesso para todas as funcionalidades do sistema.
- **Gestão de Cardápio:** Crie, edite, visualize e remova itens do cardápio, organizados por categorias.
- **Controle de Pedidos:** Lance novos pedidos, associe-os a mesas, atualize seus status (Pendente, Em Preparo, Entregue) e calcule o total.
- **Gerenciamento de Mesas:** Adicione e gerencie o status das mesas (Livre, Ocupada).
- **Sistema de Reservas:** Agende e controle as reservas dos clientes.
- **Controle de Estoque:** Monitore a quantidade de produtos, defina estoques mínimos e receba alertas visuais.
- **Módulo Financeiro:** Registre receitas e despesas para ter um balanço simples do fluxo de caixa.
- **Relatórios Gráficos:** Visualize dados de vendas por item e categoria através de gráficos interativos.
- **Configurações:** Exporte todos os dados da aplicação em formato JSON ou limpe o armazenamento local para recomeçar.
- **Design Responsivo:** A interface se adapta a diferentes tamanhos de tela, de desktops a dispositivos móveis.
- **Autenticação Simples:** Uma tela de login protege o acesso ao sistema.

## Tecnologias Utilizadas

### Frontend
- **HTML5:** Estrutura semântica das páginas
- **CSS3:** Design responsivo com Flexbox, Grid e variáveis CSS
- **JavaScript (ES6+):** Lógica da aplicação e manipulação do DOM
- **Chart.js:** Gráficos dinâmicos na página de relatórios
- **Font Awesome:** Ícones em toda a interface
- **LocalStorage:** Persistência de dados no navegador (modo offline)

### Backend (Opcional)
- **Node.js + Express:** API REST
- **PostgreSQL:** Banco de dados relacional
- **JWT (jsonwebtoken):** Autenticação segura
- **bcryptjs:** Criptografia de senhas
- **Railway:** Plataforma de deploy

---

## Como Utilizar o Sistema

### 1. Acesso e Login

Para começar, acesse o sistema. Você será direcionado para a página de login.

**Credenciais padrão:**
- **Usuário:** `admin`
- **Senha:** `admin123` (modo API) ou `123456` (modo LocalStorage)

> ⚠️ **Produção:** Altere a senha padrão no banco de dados antes de usar em produção!

Após inserir as credenciais, você será levado ao Dashboard principal.

### 2. Navegação

O menu lateral à esquerda contém links para todas as seções do sistema:
- **Dashboard:** Página inicial com uma mensagem de boas-vindas.
- **Cardápio:** Gerencie os pratos e bebidas.
- **Pedidos:** Controle os pedidos dos clientes.
- **Mesas:** Visualize e altere o status das mesas.
- **Reservas:** Administre as reservas de mesas.
- **Estoque:** Controle os produtos e ingredientes.
- **Financeiro:** Gerencie as receitas e despesas.
- **Relatórios:** Veja os gráficos de desempenho.
- **Configurações:** Exporte ou limpe os dados.

Em telas menores (como celulares), o menu fica oculto e pode ser aberto clicando no ícone de "hambúrguer" (☰) no canto superior esquerdo.

### 3. Gerenciando as Seções (Exemplo: Cardápio)

Todas as seções de gerenciamento (Cardápio, Pedidos, Mesas, etc.) seguem um padrão de uso similar:

- **Adicionar Novo Item:** Clique no botão "Adicionar Item" (ou "Novo Pedido", "Nova Reserva", etc.) no canto superior direito. Um formulário aparecerá para que você preencha as informações.
- **Editar um Item:** Em cada item listado, haverá um botão de edição (ícone de lápis). Clique nele para abrir o formulário com os dados já preenchidos, prontos para serem alterados.
- **Excluir um Item:** Ao lado do botão de edição, haverá um botão de exclusão (ícone de lixeira). **Atenção:** a exclusão é permanente.
- **Buscar e Filtrar:** Utilize os campos de busca e os filtros (como categorias ou status) para encontrar rapidamente o que você procura.

### 4. Persistência de Dados

O sistema suporta dois modos de operação:

#### Modo LocalStorage (Padrão)
Todos os dados são salvos no **LocalStorage do seu navegador**:
- ✅ Dados disponíveis mesmo após fechar o navegador
- ✅ Funciona 100% offline
- ⚠️ Dados locais (não compartilhados entre dispositivos)
- ⚠️ Sem backup automático

Para gerenciar dados:
- **Backup:** Vá em **Configurações** → **"Exportar Dados (JSON)"**
- **Limpar:** Vá em **Configurações** → **"Limpar Todos os Dados"**

#### Modo API + PostgreSQL
Com o backend ativado, os dados são salvos no servidor:
- ✅ Dados centralizados e compartilhados
- ✅ Multi-usuário simultâneo
- ✅ Backup automático no banco
- ✅ Segurança com JWT
- ⚠️ Requer conexão com internet

Para ativar, veja [MIGRACAO_API.md](MIGRACAO_API.md)