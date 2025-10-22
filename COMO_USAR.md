# 🌟 SISTEMA MARIA FLOR - INSTRUÇÕES DE USO

## 📋 Como usar o sistema

### 1. Abrir o Sistema
- Abra o arquivo `index.html` diretamente no navegador
- OU use o arquivo `iniciar_servidor.bat` (se tiver Python instalado)

### 2. Usuários de Teste Disponíveis

| Usuário  | Senha      | Função      | Acesso                    |
|----------|------------|-------------|---------------------------|
| admin    | admin123   | Administrador| Acesso total ao sistema   |
| gerente  | gerente123 | Gerente     | Dashboard e relatórios    |
| garcom   | garcom123  | Garçom      | Pedidos e vendas          |
| cozinha  | cozinha123 | Cozinha     | Pedidos da cozinha        |
| caixa    | caixa123   | Caixa       | Vendas e pagamentos       |

### 3. Funcionalidades Principais

#### 🏠 Dashboard (Admin/Gerente)
- Vendas do dia
- Pedidos ativos
- Mesas ocupadas
- Produtos em falta
- Gráficos de vendas

#### 🍽️ Garçom
- Criar novos pedidos
- Acompanhar mesas
- Fechar contas

#### 👨‍🍳 Cozinha
- Visualizar pedidos
- Marcar pratos prontos
- Controlar tempo de preparo

#### 💰 Caixa
- Processar pagamentos
- Emitir recibos
- Controle de fechamento

### 4. Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Autenticação**: JWT simulado
- **Gráficos**: Chart.js
- **Ícones**: Font Awesome
- **Responsivo**: Mobile-first design

### 5. Arquivos Importantes

```
📁 Sistema Maria Flor/
├── 📄 index.html              # Página de login
├── 📁 css/
│   ├── login.css             # Estilos do login
│   └── corrections.css       # Correções e melhorias
├── 📁 js/
│   ├── server-simulator.js   # Servidor simulado
│   ├── auth-simple.js        # Sistema de autenticação
│   └── login-simple.js       # Lógica do login
├── 📁 admin/                 # Painel administrativo
├── 📁 garcom/                # Interface do garçom
├── 📁 cozinha/               # Interface da cozinha
└── 📁 caixa/                 # Interface do caixa
```

### 6. Como Testar

1. **Abrir o sistema**:
   ```
   Clique duas vezes em: index.html
   ```

2. **Fazer login**:
   - Use qualquer usuário da tabela acima
   - Exemplo: admin / admin123

3. **Navegar pelo sistema**:
   - Cada usuário será redirecionado para sua área específica
   - Use o menu lateral para navegar

### 7. Resolução de Problemas

#### ❌ Erro: "Servidor não está rodando"
- **Solução**: O sistema funciona sem servidor
- Use o arquivo HTML diretamente no navegador

#### ❌ Login não funciona
- **Verificar**: Usuário e senha corretos
- **Verificar**: JavaScript habilitado no navegador

#### ❌ Layout quebrado
- **Verificar**: Conexão com internet (Font Awesome)
- **Verificar**: Arquivos CSS na pasta correta

### 8. Instalação do Python (Opcional)

Se quiser usar o servidor Python:

1. **Baixar Python**:
   - Vá em: https://python.org/downloads
   - Baixe a versão mais recente

2. **Instalar**:
   - Marque "Add to PATH"
   - Clique em "Install Now"

3. **Testar**:
   ```
   python --version
   ```

4. **Iniciar servidor**:
   - Clique duas vezes em: `iniciar_servidor.bat`
   - Acesse: http://localhost:8000

### 9. Próximos Passos

#### Para Produção:
- [ ] Instalar banco de dados PostgreSQL
- [ ] Configurar servidor Node.js ou Python
- [ ] Configurar domínio e SSL
- [ ] Backup automático dos dados

#### Melhorias Futuras:
- [ ] App mobile nativo
- [ ] Integração com WhatsApp
- [ ] Sistema de delivery
- [ ] Relatórios avançados

### 10. Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@mariaflor.com
- 📱 WhatsApp: (71) 99999-9999
- 🌐 Site: www.mariaflor.com

---

**✨ Sistema criado com ❤️ para o Restaurante Maria Flor**
**📍 Salvador, BA - Bairro do Resgate**