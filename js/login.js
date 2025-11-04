document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Verificar se já está logado
    if (localStorage.getItem('authToken')) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Simulação de autenticação
        if (username === 'admin' && password === '123456') {
            // Armazenar token de autenticação e informações do usuário
            localStorage.setItem('authToken', 'dummy_token_12345');
            localStorage.setItem('username', username);
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('loginTime', new Date().toISOString());

            // Redirecionar para o dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Exibir mensagem de erro
            errorMessage.textContent = 'Usuário ou senha inválidos.';
            errorMessage.style.display = 'block';

            // Limpar a mensagem de erro após alguns segundos
            setTimeout(() => {
                errorMessage.style.display = 'none';
                errorMessage.textContent = '';
            }, 3000);
        }
    });
});