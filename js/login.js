document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const cfg = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : { API: { enabled: false } };
    // Impact overlay + modal de cadastro
    const impactOverlay = document.getElementById('impact-overlay');
    const impactSignupBtn = document.getElementById('impact-signup-btn');
    const impactCloseBtn = document.getElementById('impact-close-btn');
    const openSignupLink = document.getElementById('open-signup-link');
    const signupModal = document.getElementById('signup-modal');
    const signupClose = document.getElementById('signup-close');
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');

    // Verificar se já está logado
    if (localStorage.getItem('authToken')) {
        const role = localStorage.getItem('userRole');
        const activeCompanyId = localStorage.getItem('activeCompanyId');
        if (role === 'superadmin' && !activeCompanyId) {
            window.location.href = 'empresas.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return;
    }

    // Exibe mensagem impactante uma vez na sessão
    try {
        const seen = sessionStorage.getItem('impactSeen');
        if (!seen && impactOverlay) impactOverlay.classList.add('show');
        const closeImpact = () => { impactOverlay && impactOverlay.classList.remove('show'); sessionStorage.setItem('impactSeen', '1'); };
        if (impactCloseBtn) impactCloseBtn.addEventListener('click', closeImpact);
        if (impactSignupBtn) impactSignupBtn.addEventListener('click', () => { closeImpact(); openSignup(); });
    } catch {}

    function openSignup() { if (signupModal) signupModal.classList.add('show'); }
    function closeSignup() { if (signupModal) signupModal.classList.remove('show'); }
    if (openSignupLink) openSignupLink.addEventListener('click', openSignup);
    if (signupClose) signupClose.addEventListener('click', closeSignup);
    window.addEventListener('click', (e) => { if (e.target === signupModal) closeSignup(); });

    // Ajusta rótulo da empresa conforme modo API
    try {
        const companyLabel = document.querySelector('label[for="su-company"]');
        if (companyLabel && cfg.API && cfg.API.enabled) {
            companyLabel.textContent = 'Empresa (obrigatória)';
        }
    } catch {}

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
                    const role = (res.user && res.user.role) ? res.user.role : localStorage.getItem('userRole');
                    const activeCompanyId = localStorage.getItem('activeCompanyId');
                    if (role === 'superadmin' && !activeCompanyId) {
                        window.location.href = 'empresas.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
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

        // Simulação de autenticação local (CONFIG + usuários cadastrados em LS)
        const builtins = (cfg && cfg.USERS) ? cfg.USERS : {};
        const lsUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const list = [
            ...Object.values(builtins || {}),
            ...lsUsers.map(u => ({ username: u.username, password: u.password, role: u.role || 'admin' }))
        ];
        const found = list.find(u => String(u.username || '') === username && String(u.password || '') === String(password || ''));

        if (found) {
            localStorage.setItem('authToken', 'dummy_token_' + Date.now());
            localStorage.setItem('username', found.username);
            localStorage.setItem('userRole', found.role || 'admin');
            // Em modo local, mantém uma empresa ativa padrão para não travar navegação
            localStorage.setItem('activeCompanyId', localStorage.getItem('activeCompanyId') || '1');
            localStorage.setItem('activeCompanyName', localStorage.getItem('activeCompanyName') || (cfg.APP && cfg.APP.name ? cfg.APP.name : 'Empresa'));
            localStorage.setItem('loginTime', new Date().toISOString());
            window.location.href = 'dashboard.html';
            return;
        }

        errorMessage.textContent = 'Usuário ou senha inválidos.';
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
        }, 3000);
    });

    // Cadastro de conta
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (signupError) { signupError.textContent = ''; }

            const companyName = (document.getElementById('su-company')?.value || '').trim();
            const name = (document.getElementById('su-name')?.value || '').trim();
            const email = (document.getElementById('su-email')?.value || '').trim();
            const username = (document.getElementById('su-username')?.value || '').trim();
            const pass1 = (document.getElementById('su-password')?.value || '');
            const pass2 = (document.getElementById('su-password2')?.value || '');

            if (!cfg.UTILS.validateEmail(email)) { if (signupError) signupError.textContent = 'E-mail inválido.'; return; }
            if (pass1.length < 6) { if (signupError) signupError.textContent = 'Use ao menos 6 caracteres na senha.'; return; }
            if (pass1 !== pass2) { if (signupError) signupError.textContent = 'As senhas não conferem.'; return; }

            function createLocalUser() {
                const existing = JSON.parse(localStorage.getItem('users') || '[]');
                const conflict = existing.some(u => String(u.username).toLowerCase() === username.toLowerCase()) ||
                    Object.values(cfg.USERS || {}).some(u => String(u.username).toLowerCase() === username.toLowerCase());
                if (conflict) {
                    const e = new Error('Usuário já existe');
                    e.code = 'CONFLICT';
                    throw e;
                }
                existing.push({
                    id: Date.now(),
                    username,
                    email,
                    name,
                    role: 'admin',
                    password: pass1,
                    companyName: companyName || (cfg.APP && cfg.APP.name ? cfg.APP.name : 'Empresa')
                });
                localStorage.setItem('users', JSON.stringify(existing));
            }

            try {
                if (window.API && typeof window.API.auth?.register === 'function') {
                    // Em modo API, empresa é obrigatória para criar o tenant
                    if (cfg.API && cfg.API.enabled && !companyName) {
                        if (signupError) signupError.textContent = 'Informe o nome da empresa.';
                        return;
                    }
                    await window.API.auth.register({ username, email, password: pass1, name, companyName });
                } else {
                    // Fallback direto para LocalStorage
                    createLocalUser();
                }

                closeSignup();
                const userInput = document.getElementById('username');
                if (userInput) userInput.value = username;
                alert('Conta criada com sucesso! Faça login para continuar.');
            } catch (err) {
                // Se a API estiver fora do ar (Railway 502), cria em modo local para não bloquear o usuário
                const code = String(err && err.code || '').toUpperCase();
                const msgUp = String(err && err.message || '').toUpperCase();
                const isApiOffline = (code === 'NETWORK' || code === 'TIMEOUT' || /HTTP\s(502|503|504)/.test(msgUp));

                if (cfg.API && cfg.API.enabled && isApiOffline) {
                    try {
                        createLocalUser();
                        closeSignup();
                        const userInput = document.getElementById('username');
                        if (userInput) userInput.value = username;
                        alert('API indisponível no momento. Conta criada em modo local (demo). Faça login para continuar.');
                        return;
                    } catch (e2) {
                        err = e2;
                    }
                }
                if (signupError) {
                    const msg = String(err && (err.code || err.message) || '').toUpperCase();
                    if (msg.includes('TIMEOUT') || msg.includes('ABORT')) {
                        signupError.textContent = 'Conexão com o servidor expirou. Tente novamente.';
                    } else if (msg.includes('NETWORK') || msg.includes('HTTP 502') || msg.includes('HTTP 503') || msg.includes('HTTP 504')) {
                        signupError.textContent = 'Servidor indisponível (API offline). Tente novamente em instantes.';
                    } else if (msg.includes('HTTP 409') || msg.includes('USUÁRIO JÁ EXISTE') || msg.includes('UNIQUE')) {
                        signupError.textContent = 'Usuário/email/empresa já existe.';
                    } else if (msg.includes('HTTP 400')) {
                        signupError.textContent = 'Dados inválidos. Verifique os campos informados.';
                    } else {
                        signupError.textContent = (err && err.message) ? err.message : 'Falha ao criar conta.';
                    }
                }
            }
        });
    }
});
