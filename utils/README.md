# 🛠️ Utilitários de Desenvolvimento

Esta pasta contém ferramentas e scripts para facilitar o desenvolvimento e teste do sistema.

## 📁 Arquivos Disponíveis

### 🚀 **start.bat**
Script principal para inicializar o sistema localmente.

**Como usar:**
```bash
# Duplo clique no arquivo OU execute no terminal:
start.bat
```

**O que faz:**
- ✅ Verifica arquivos essenciais
- 🐍 Tenta usar Python (servidor personalizado)
- 🟢 Fallback para Node.js se Python não estiver disponível
- 🌐 Abre navegador automaticamente
- 📋 Mostra credenciais de teste

### 🐍 **dev-server.py**
Servidor de desenvolvimento Python personalizado.

**Recursos:**
- 🔄 Hot reload automático
- 📂 Roteamento personalizado (`/dashboard`, `/test`, etc.)
- 🌐 Headers CORS configurados
- 📊 Logs detalhados
- 🚀 Abertura automática do navegador

**Como usar:**
```bash
python utils/dev-server.py
```

### 📋 **iniciar_teste_local.bat**
Script simples para testes rápidos.

**Como usar:**
```bash
iniciar_teste_local.bat
```

## 🎯 **URLs Disponíveis**

Quando o servidor estiver rodando:

| URL | Descrição |
|-----|-----------|
| `http://localhost:8000` | Página principal (login) |
| `http://localhost:8000/dashboard` | Dashboard do sistema |
| `http://localhost:8000/test` | Página de testes |
| `http://localhost:8000/status` | Status do servidor |

## 🔑 **Credenciais de Teste**

| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `admin123` | Administrador |
| `gerente` | `gerente123` | Gerente |
| `garcom` | `garcom123` | Garçom |
| `cozinha` | `cozinha123` | Cozinha |
| `caixa` | `caixa123` | Caixa |

## 🚨 **Solução de Problemas**

### ❌ **Erro: "Porta já está em uso"**
```bash
# Tente uma porta diferente:
python -m http.server 8080
# Ou mate o processo na porta 8000
```

### ❌ **Python não encontrado**
1. Instale Python: https://python.org/downloads
2. OU use Node.js: https://nodejs.org
3. OU abra `index.html` diretamente no navegador

### ❌ **Arquivos não carregam**
- Certifique-se de executar na pasta raiz do projeto
- Verifique se `index.html` existe na pasta principal

## 💡 **Dicas**

1. **Desenvolvimento:** Use `start.bat` para inicialização rápida
2. **Debug:** Use `dev-server.py` diretamente para logs detalhados
3. **Testes:** Acesse `/test` para página completa de testes
4. **Status:** Acesse `/status` para verificar saúde do sistema

---

**🛠️ Desenvolvido para facilitar o desenvolvimento local**  
**📧 Dúvidas: cristiano.s.santos@ba.estudante.senai.br**