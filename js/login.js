document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const cfg = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : { API: { enabled: false } };
    
    // Modal de cadastro
    const openSignupLink = document.getElementById('open-signup');
    const signupModal = document.getElementById('signup-modal');
    const signupClose = document.getElementById('signup-close');
    const signupCancel = document.getElementById('signup-cancel');
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

    // Gerenciamento do modal de cadastro com acessibilidade
    let lastFocusedElement = null;

    function openSignup() { 
        if (signupModal) {
            // Salva elemento que tinha foco antes do modal
            lastFocusedElement = document.activeElement;
            
            signupModal.classList.add('show');
            signupModal.setAttribute('aria-hidden', 'false');
            
            // Foca no primeiro campo do formulário
            const firstInput = signupModal.querySelector('input');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
            
            // Adiciona trap de foco no modal
            document.addEventListener('keydown', handleModalKeydown);
        }
    }
    
    function closeSignup() { 
        if (signupModal) {
            signupModal.classList.remove('show');
            signupModal.setAttribute('aria-hidden', 'true');
            
            // Remove trap de foco
            document.removeEventListener('keydown', handleModalKeydown);
            
            // Restaura foco no elemento anterior
            if (lastFocusedElement) {
                lastFocusedElement.focus();
                lastFocusedElement = null;
            }
        }
    }
    
    function handleModalKeydown(e) {
        // Fecha modal com ESC
        if (e.key === 'Escape') {
            closeSignup();
            return;
        }
        
        // Trap de foco: mantém foco dentro do modal
        if (e.key === 'Tab' && signupModal && signupModal.classList.contains('show')) {
            const focusableElements = signupModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    if (openSignupLink) openSignupLink.addEventListener('click', (e) => { e.preventDefault(); openSignup(); });
    if (signupClose) signupClose.addEventListener('click', closeSignup);
    if (signupCancel) signupCancel.addEventListener('click', closeSignup);
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

        // Função helper para mostrar erro
        const showError = (message) => {
            if (errorText) errorText.textContent = message;
            if (errorMessage) errorMessage.classList.add('show');
            setTimeout(() => {
                if (errorMessage) errorMessage.classList.remove('show');
            }, 5000);
        };

        // Se API estiver habilitada, autentica via servidor; senão, usa simulação
        if (cfg.API && cfg.API.enabled && window.API && window.API.auth) {
            try {
                const res = await window.API.auth.login({ username, password });
                if (res && res.token) {
                    try {
                        const apiUser = res.user || {};
                        const companyId = apiUser.companyId ?? apiUser.company_id ?? localStorage.getItem('activeCompanyId') ?? null;
                        const currentUser = {
                            id: apiUser.id ?? Date.now(),
                            nome: apiUser.nome || apiUser.name || apiUser.username || apiUser.email || username,
                            name: apiUser.name || apiUser.nome || apiUser.username || apiUser.email || username,
                            email: apiUser.email || '',
                            username: apiUser.username || apiUser.email || username,
                            role: apiUser.role || localStorage.getItem('userRole') || '',
                            company_id: companyId != null ? Number(companyId) : null,
                            permissions: Array.isArray(apiUser.permissions) ? apiUser.permissions : []
                        };
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    } catch {}
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
                showError('Usuário ou senha inválidos.');
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

            try {
                const companyId = found.company_id ?? Number(localStorage.getItem('activeCompanyId') || 1);
                const currentUser = {
                    id: found.id ?? Date.now(),
                    nome: found.name || found.nome || found.username,
                    name: found.name || found.nome || found.username,
                    email: found.email || '',
                    username: found.username,
                    role: found.role || 'admin',
                    company_id: companyId != null ? Number(companyId) : null,
                    permissions: Array.isArray(found.permissions) ? found.permissions : []
                };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                if (currentUser.company_id != null) {
                    localStorage.setItem('activeCompanyId', String(currentUser.company_id));
                }
            } catch {}
            window.location.href = 'dashboard.html';
            return;
        }

        showError('Usuário ou senha inválidos.');
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
