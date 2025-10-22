/**
 * Login Simplificado - Maria Flor
 * Funciona com o servidor Python local
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Login page carregada');
    
    // Verificar se já está logado
    if (authSystem.isLoggedIn()) {
        console.log('👤 Usuário já logado, redirecionando...');
        redirectToDashboard();
        return;
    }

    // Elementos do formulário
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Verificar se os elementos existem
    if (!loginForm) {
        console.error('❌ Formulário de login não encontrado!');
        return;
    }

    // Função para mostrar erro
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        } else {
            alert(message);
        }
    }

    // Função para esconder erro
    function hideError() {
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    // Função para carregar (loading)
    function setLoading(loading) {
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.textContent = loading ? 'Entrando...' : 'Entrar';
        }
    }

    // Função para redirecionar
    function redirectToDashboard() {
        const user = authSystem.getCurrentUser();
        if (!user) {
            window.location.href = 'pages/dashboard.html';
            return;
        }

        // Todos redirecionam para o dashboard principal
        window.location.href = 'pages/dashboard.html';
    }

    // Handler do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validação básica
        if (!username || !password) {
            showError('Por favor, preencha todos os campos');
            return;
        }

        hideError();
        setLoading(true);

        try {
            console.log('🔄 Fazendo login...');
            
            const result = await authSystem.login(username, password);
            
            if (result.success) {
                console.log('✅ Login realizado com sucesso!');
                
                // Mostrar mensagem de sucesso
                if (errorMessage) {
                    errorMessage.style.color = '#28a745';
                    errorMessage.textContent = result.message;
                    errorMessage.style.display = 'block';
                }
                
                // Redirecionar após pequeno delay
                setTimeout(() => {
                    redirectToDashboard();
                }, 1000);
                
            } else {
                console.log('❌ Erro no login:', result.error);
                showError(result.error || 'Usuário ou senha inválidos');
            }
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            showError('Erro de conexão. Verifique se o servidor está rodando.');
        } finally {
            setLoading(false);
        }
    });

    // Limpar erro quando o usuário digitar
    if (usernameInput) {
        usernameInput.addEventListener('input', hideError);
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', hideError);
    }

    // Focar no campo de usuário
    if (usernameInput) {
        usernameInput.focus();
    }

    console.log('✅ Login system iniciado');
});

// Função global para logout (pode ser chamada de qualquer lugar)
function logout() {
    authSystem.logout();
}

console.log('📝 Login script carregado');