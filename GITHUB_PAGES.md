# Configuração para GitHub Pages

## Deploy Automático

Este projeto está configurado para deploy automático no GitHub Pages.

### Como configurar:

1. **Push para GitHub:**
```bash
git init
git add .
git commit -m "Initial commit - Maria Flor Sistema"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/maria-flor-sistema.git
git push -u origin main
```

2. **Ativar GitHub Pages:**
   - Vá para Settings do repositório
   - Seção "Pages"
   - Source: "Deploy from a branch"
   - Branch: "main" / "(root)"
   - Clique em "Save"

3. **URL do Site:**
   - Seu site estará disponível em: `https://seu-usuario.github.io/maria-flor-sistema/`

### Características do Modo Cliente:

- ✅ **100% Frontend:** Funciona sem servidor backend
- ✅ **Armazenamento Local:** Dados salvos no navegador (localStorage)
- ✅ **PWA Ready:** Pode ser instalado como app no mobile
- ✅ **Offline:** Funciona sem internet após primeiro carregamento
- ✅ **Responsivo:** Adaptado para desktop, tablet e mobile

### Funcionalidades Disponíveis:

- 🔐 **Login Demo:** Qualquer usuário/senha funciona
- 📊 **Dashboard:** Estatísticas e gráficos em tempo real
- 💰 **Vendas:** Sistema completo de registro de vendas
- 🍽️ **Cardápio:** Gestão de produtos com categorias
- 📦 **Estoque:** Controle de inventário com alertas
- 📋 **Pedidos:** Sistema kanban para cozinha
- 💵 **Financeiro:** Receitas, despesas e relatórios
- 📱 **Mobile First:** Interface otimizada para celular

### Dados Iniciais:

O sistema vem com dados de demonstração:
- 6 produtos pré-cadastrados
- 6 categorias padrão
- 2 vendas de exemplo
- Gráficos com dados simulados

### Backup de Dados:

```javascript
// Exportar dados
const backup = window.clientConfig.exportData();
console.log(backup); // Copiar e salvar

// Importar dados
const success = window.clientConfig.importData(backupJson);
```

### Personalização:

- **Logo:** Alterar ícones nos arquivos CSS
- **Cores:** Modificar variáveis CSS em `css/dashboard.css`
- **Nome:** Alterar "Maria Flor" nos arquivos HTML
- **Produtos:** Editar `js/client-config.js` (função setupInitialData)

### Performance:

- **Cache:** Service Worker para carregamento rápido
- **Minificado:** Código otimizado para produção
- **Compressão:** Assets servidos com compressão GZIP
- **Lazy Loading:** Carregamento sob demanda

### Limitações do Modo Cliente:

- Dados salvos apenas no navegador local
- Sem sincronização entre dispositivos
- Backup manual necessário
- Não adequado para múltiplos usuários simultâneos

### Para Uso Profissional:

Se você precisar de:
- Múltiplos usuários
- Sincronização entre dispositivos  
- Backup automático
- Relatórios avançados

Considere migrar para o modo servidor com Netlify + Neon Database.

### Suporte:

- 📧 Issues no GitHub para bugs
- 📖 README.md para documentação completa
- 🛠️ SETUP.md para guia de instalação