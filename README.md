# Sistema de Gestão para Bar e Restaurante

## Visão Geral

Este é um sistema de gestão completo para bares e restaurantes, desenvolvido como uma aplicação web moderna, responsiva e totalmente funcional no lado do cliente. Ele permite o gerenciamento de cardápio, pedidos, mesas, reservas, estoque e finanças, tudo de forma intuitiva e com os dados armazenados localmente no navegador do usuário.

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

- **HTML5:** Para a estrutura semântica das páginas.
- **CSS3:** Para estilização moderna, utilizando Flexbox, Grid e Variáveis CSS para um design coeso e responsivo.
- **JavaScript (ES6+):** Para toda a lógica da aplicação, manipulação do DOM e interatividade.
- **Chart.js:** Para a criação de gráficos dinâmicos na página de relatórios.
- **Font Awesome:** Para a utilização de ícones em toda a interface.
- **Google Fonts:** Para a tipografia do projeto.
- **LocalStorage:** Para a persistência de todos os dados diretamente no navegador, permitindo que a aplicação funcione offline e sem a necessidade de um banco de dados externo.

---

## Como Utilizar o Sistema

### 1. Acesso e Login

Para começar, acesse o sistema através do link fornecido. Você será direcionado para a página de login.

- **Usuário:** `admin`
- **Senha:** `123456`

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

Todos os dados que você insere no sistema (itens do cardápio, pedidos, etc.) são salvos no **LocalStorage do seu navegador**. Isso significa que:
- Os dados estarão disponíveis mesmo que você feche e abra o navegador novamente.
- Os dados são locais para cada computador/navegador. Se você acessar de um dispositivo diferente, os dados não estarão lá.
- Para limpar todos os dados e começar do zero, vá até **Configurações** e clique em **"Limpar Todos os Dados"**.
- Para fazer um backup, vá até **Configurações** e clique em **"Exportar Dados (JSON)"**. Um arquivo será baixado com todas as informações do sistema.