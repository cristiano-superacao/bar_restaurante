// Sistema de Login Avançado - Maria Flor
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    if (window.authSystem && window.authSystem.isLoggedIn()) {
        window.location.href = 'pages/dashboard.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const showPasswordBtn = document.querySelector('.toggle-password');
    
    // Inicializar interface
    initializeInterface();
    
    // Submissão do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            showError('Por favor, preencha todos os campos');
            return;
        }
        
        // Mostrar loading
        showLoading(true);
        
        try {
            // Aguardar sistema de auth estar pronto
            if (!window.authSystem) {
                throw new Error('Sistema de autenticação não carregado');
            }
            
            // Tentar fazer login
            const result = await window.authSystem.login(username, password);
            
            if (result.success) {
                showSuccess(result.message);
                
                // Aguardar um pouco para mostrar a mensagem
                setTimeout(() => {
                    window.location.href = result.redirectTo;
                }, 1000);
            }
            
        } catch (error) {
            showError(error.message);
            
            // Vibrar no mobile se houver erro
            if (navigator.vibrate) {
                navigator.vibrate([100, 30, 100]);
            }
        } finally {
            showLoading(false);
        }
    });
    
    // Inicializar interface
    function initializeInterface() {
        // Mostrar/ocultar senha
        if (showPasswordBtn) {
            showPasswordBtn.addEventListener('click', togglePassword);
        }
        
        // Adicionar sugestões de usuário
        createUserSuggestions();
        
        // Animação nos campos de input
        setupInputAnimations();
        
        // Atalhos de teclado
        setupKeyboardShortcuts();
        
        // Efeitos visuais
        createParticles();
        
        // Auto-focus no campo de usuário
        usernameInput.focus();
    }
    
    // Função para alternar visibilidade da senha
    function togglePassword() {
        const toggleIcon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
    
    // Função para mostrar erro
    function showError(message) {
        showMessage(message, 'error');
    }
    
    // Função para mostrar sucesso
    function showSuccess(message) {
        showMessage(message, 'success');
    }
    
    // Função genérica para mostrar mensagens
    function showMessage(message, type) {
        // Remover mensagem anterior se existir
        const existingMessage = document.querySelector('.error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Criar nova mensagem
        const messageElement = document.createElement('div');
        messageElement.className = `error-message show ${type}`;
        messageElement.textContent = message;
        
        // Inserir após o formulário
        loginForm.parentNode.insertBefore(messageElement, loginForm.nextSibling);
        
        // Remover após tempo
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        }, type === 'error' ? 4000 : 3000);
    }
    
    // Função para mostrar loading
    function showLoading(show) {
        const submitBtn = loginForm.querySelector('.login-btn') || loginForm.querySelector('button[type="submit"]');
        
        if (!submitBtn) return;
        
        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        }
    }
    
    // Criar sugestões de usuário para demonstração
    function createUserSuggestions() {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'login-suggestions';
        suggestionsContainer.innerHTML = `
            <div class="suggestions-header" onclick="toggleSuggestions()">
                <h4><i class="fas fa-users"></i> Credenciais de Teste</h4>
                <button type="button" class="btn-toggle">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="suggestions-content" id="suggestionsContent">
                <div class="suggestion-group">
                    <h5><i class="fas fa-crown" style="color: #e74c3c;"></i> Gerência</h5>
                    <div class="suggestion-item" data-username="admin" data-password="MariaFlor2025!">
                        <strong>admin</strong> / MariaFlor2025! <span class="role-badge admin">Administrador</span>
                    </div>
                    <div class="suggestion-item" data-username="gerente" data-password="Gerente123!">
                        <strong>gerente</strong> / Gerente123! <span class="role-badge manager">Gerente</span>
                    </div>
                </div>
                
                <div class="suggestion-group">
                    <h5><i class="fas fa-concierge-bell" style="color: #3498db;"></i> Atendimento</h5>
                    <div class="suggestion-item" data-username="garcom1" data-password="Garcom123!">
                        <strong>garcom1</strong> / Garcom123! <span class="role-badge waiter">Garçonete</span>
                    </div>
                    <div class="suggestion-item" data-username="garcom2" data-password="Garcom123!">
                        <strong>garcom2</strong> / Garcom123! <span class="role-badge waiter">Garçom</span>
                    </div>
                </div>
                
                <div class="suggestion-group">
                    <h5><i class="fas fa-fire" style="color: #e67e22;"></i> Cozinha</h5>
                    <div class="suggestion-item" data-username="cozinha1" data-password="Cozinha123!">
                        <strong>cozinha1</strong> / Cozinha123! <span class="role-badge kitchen">Chef</span>
                    </div>
                    <div class="suggestion-item" data-username="cozinha2" data-password="Cozinha123!">
                        <strong>cozinha2</strong> / Cozinha123! <span class="role-badge kitchen">Cozinheira</span>
                    </div>
                </div>
                
                <div class="suggestion-group">
                    <h5><i class="fas fa-cash-register" style="color: #27ae60;"></i> Financeiro</h5>
                    <div class="suggestion-item" data-username="caixa1" data-password="Caixa123!">
                        <strong>caixa1</strong> / Caixa123! <span class="role-badge cashier">Operador</span>
                    </div>
                    <div class="suggestion-item" data-username="caixa2" data-password="Caixa123!">
                        <strong>caixa2</strong> / Caixa123! <span class="role-badge cashier">Caixa</span>
                    </div>
                </div>
                
                <div class="suggestion-group">
                    <h5><i class="fas fa-boxes" style="color: #f39c12;"></i> Estoque</h5>
                    <div class="suggestion-item" data-username="estoque1" data-password="Estoque123!">
                        <strong>estoque1</strong> / Estoque123! <span class="role-badge stock">Almoxarife</span>
                    </div>
                    <div class="suggestion-item" data-username="estoque2" data-password="Estoque123!">
                        <strong>estoque2</strong> / Estoque123! <span class="role-badge stock">Estoque</span>
                    </div>
                </div>
            </div>
        `;
        
        // Inserir após o formulário
        loginForm.parentNode.insertBefore(suggestionsContainer, loginForm.nextSibling);
        
        // Click nas sugestões para preencher automaticamente
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                const username = this.dataset.username;
                const password = this.dataset.password;
                
                usernameInput.value = username;
                passwordInput.value = password;
                
                // Highlight temporário
                this.style.background = '#667eea';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.style.background = '';
                    this.style.color = '';
                }, 500);
                
                // Focar no botão de login
                const submitBtn = loginForm.querySelector('.login-btn') || loginForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.focus();
            });
        });
    }
    
    // Animação nos campos de input
    function setupInputAnimations() {
        const inputs = document.querySelectorAll('input');
        
        inputs.forEach(input => {
            const icon = input.parentNode.querySelector('.input-icon');
            
            if (icon) {
                input.addEventListener('focus', () => {
                    icon.style.color = '#667eea';
                    icon.style.transform = 'translateY(-50%) scale(1.1)';
                });
                
                input.addEventListener('blur', () => {
                    icon.style.color = '#7f8c8d';
                    icon.style.transform = 'translateY(-50%) scale(1)';
                });
            }
        });
    }
    
    // Atalhos de teclado
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Enter para submeter
            if (e.key === 'Enter' && (usernameInput.matches(':focus') || passwordInput.matches(':focus'))) {
                e.preventDefault();
                loginForm.dispatchEvent(new Event('submit'));
            }
            
            // ESC para limpar campos
            if (e.key === 'Escape') {
                usernameInput.value = '';
                passwordInput.value = '';
                usernameInput.focus();
            }
            
            // Ctrl+/ para mostrar/ocultar sugestões
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                toggleSuggestions();
            }
        });
    }
    
    // Efeito de partículas no fundo
    function createParticles() {
        const container = document.body;
        
        // Adicionar CSS para animação das partículas e sugestões
        if (!document.getElementById('particles-style')) {
            const style = document.createElement('style');
            style.id = 'particles-style';
            style.textContent = `
                .particle {
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: -1;
                    animation: float 6s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
                    25% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
                    50% { transform: translateY(-10px) translateX(-10px); opacity: 1; }
                    75% { transform: translateY(-15px) translateX(5px); opacity: 0.5; }
                }
                
                .login-suggestions {
                    margin-top: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    max-width: 500px;
                }
                
                .suggestions-header {
                    padding: 15px 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .suggestions-header:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                
                .suggestions-header h4 {
                    margin: 0;
                    color: white;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .btn-toggle {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                }
                
                .btn-toggle:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .suggestions-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.4s ease;
                }
                
                .suggestions-content.show {
                    max-height: 600px;
                }
                
                .suggestion-group {
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .suggestion-group:last-child {
                    border-bottom: none;
                }
                
                .suggestion-group h5 {
                    margin: 0 0 10px 0;
                    color: white;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    opacity: 0.9;
                }
                
                .suggestion-item {
                    padding: 10px 15px;
                    margin: 6px 0;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: white;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .suggestion-item:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateX(5px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }
                
                .role-badge {
                    padding: 3px 10px;
                    border-radius: 15px;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .role-badge.admin { background: #e74c3c; color: white; }
                .role-badge.manager { background: #9b59b6; color: white; }
                .role-badge.waiter { background: #3498db; color: white; }
                .role-badge.kitchen { background: #e67e22; color: white; }
                .role-badge.cashier { background: #27ae60; color: white; }
                .role-badge.stock { background: #f39c12; color: white; }
                
                .error-message {
                    margin-top: 15px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    text-align: center;
                    font-weight: 500;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                
                .error-message.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .error-message.error {
                    background: rgba(231, 76, 60, 0.15);
                    border: 2px solid #e74c3c;
                    color: #e74c3c;
                }
                
                .error-message.success {
                    background: rgba(39, 174, 96, 0.15);
                    border: 2px solid #27ae60;
                    color: #27ae60;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Criar partículas
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (3 + Math.random() * 4) + 's';
            container.appendChild(particle);
        }
    }
});

// Toggle de mostrar/ocultar sugestões (função global)
function toggleSuggestions() {
    const content = document.getElementById('suggestionsContent');
    const icon = document.querySelector('.btn-toggle i');
    
    if (content && icon) {
        content.classList.toggle('show');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    }
}

// Efeito de parallax suave no scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroIcon = document.querySelector('.hero-icon');
    if (heroIcon) {
        heroIcon.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Verificar se já está logado ao carregar a página
if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'pages/dashboard.html';
}