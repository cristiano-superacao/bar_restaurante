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

            try {
                if (window.API && typeof window.API.auth?.register === 'function') {
                    await window.API.auth.register({ username, email, password: pass1, name, companyName });
                } else {
                    // Fallback direto para LocalStorage
                    const existing = JSON.parse(localStorage.getItem('users') || '[]');
                    const conflict = existing.some(u => String(u.username).toLowerCase() === username.toLowerCase()) ||
                        Object.values(cfg.USERS || {}).some(u => String(u.username).toLowerCase() === username.toLowerCase());
                    if (conflict) throw new Error('Usuário já existe');
                    existing.push({ id: Date.now(), username, email, name, role: 'admin', password: pass1 });
                    localStorage.setItem('users', JSON.stringify(existing));
                }

                closeSignup();
                const userInput = document.getElementById('username');
                if (userInput) userInput.value = username;
                alert('Conta criada com sucesso! Faça login para continuar.');
            } catch (err) {
                if (signupError) signupError.textContent = (err && err.message) ? err.message : 'Falha ao criar conta.';
            }
        });
    }
});