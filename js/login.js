document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const cfg = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : { API: { enabled: false } };

    // Verificar se já está logado
    if (localStorage.getItem('authToken')) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Se API estiver habilitada, autentica via servidor; senão, usa simulação
        if (cfg.API && cfg.API.enabled && window.API && window.API.auth) {
            try {
                const res = await window.API.auth.login({ username, password });
                if (res && res.token) {
                    localStorage.setItem('loginTime', new Date().toISOString());
                    window.location.href = 'dashboard.html';
                    return;
                }
                throw new Error('Falha no login');
            } catch (err) {
                errorMessage.textContent = 'Usuário ou senha inválidos.';
                errorMessage.style.display = 'block';
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                    errorMessage.textContent = '';
                }, 3000);
                return;
            }
        }

        // Simulação de autenticação local
        if (username === 'admin' && password === '123456') {
            localStorage.setItem('authToken', 'dummy_token_12345');
            localStorage.setItem('username', username);
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('loginTime', new Date().toISOString());
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = 'Usuário ou senha inválidos.';
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
                errorMessage.textContent = '';
            }, 3000);
        }
    });
});