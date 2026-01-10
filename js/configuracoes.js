document.addEventListener('DOMContentLoaded', function () {

    // --- Elementos do DOM ---
    const profileNameEl = document.getElementById('profile-name');
    const profileRoleEl = document.getElementById('profile-role');
    const exportDataBtn = document.getElementById('export-data-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const settingsSearchEl = document.getElementById('settings-search');
    const sectionFilterEl = document.getElementById('settings-section-filter');
    const settingsCards = Array.from(document.querySelectorAll('.settings-card'));

    // Painel API
    const apiEnabledToggle = document.getElementById('api-enabled-toggle');
    const apiBaseUrlEl = document.getElementById('api-baseurl');
    const apiTimeoutEl = document.getElementById('api-timeout');
    const apiTestBtn = document.getElementById('api-test-btn');
    const apiSaveBtn = document.getElementById('api-save-btn');
    const apiResetBtn = document.getElementById('api-reset-btn');
    const apiStatusEl = document.getElementById('api-status');

    // --- Funções ---

    // Carrega informações do perfil do localStorage
    function loadProfileInfo() {
        const username = localStorage.getItem('username') || 'Não definido';
        const userRole = localStorage.getItem('userRole') || 'Não definido';

        if (profileNameEl && profileRoleEl) {
            profileNameEl.value = username;
            profileRoleEl.value = userRole;
        }
    }

    function applySettingsFilters() {
        const q = (settingsSearchEl?.value || '').toLowerCase();
        const section = sectionFilterEl?.value || 'all';
        settingsCards.forEach(card => {
            const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const matchesSearch = !q || title.includes(q);
            const matchesSection = section === 'all' || (card.dataset.section === section);
            card.style.display = (matchesSearch && matchesSection) ? '' : 'none';
        });
    }

    function setApiStatus(text, type) {
        if (!apiStatusEl) return;
        apiStatusEl.textContent = text || '';
        apiStatusEl.classList.remove('ok', 'err');
        if (type) apiStatusEl.classList.add(type);
    }

    function getApiConfigFromConfig() {
        const cfg = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : null;
        const api = cfg && cfg.API ? cfg.API : { enabled: false, baseUrl: '', timeoutMs: 8000 };
        return {
            enabled: !!api.enabled,
            baseUrl: String(api.baseUrl || ''),
            timeoutMs: Number(api.timeoutMs || 8000)
        };
    }

    function loadApiPanel() {
        if (!apiEnabledToggle || !apiBaseUrlEl || !apiTimeoutEl) return;
        const apiCfg = getApiConfigFromConfig();
        apiEnabledToggle.checked = !!apiCfg.enabled;
        apiBaseUrlEl.value = apiCfg.baseUrl;
        apiTimeoutEl.value = String(apiCfg.timeoutMs || 8000);
        setApiStatus(apiCfg.enabled ? 'API habilitada (config atual).' : 'API desabilitada (LocalStorage).');
    }

    function normalizeBaseUrl(url) {
        const u = String(url || '').trim();
        if (!u) return '';
        return u.replace(/\/$/, '');
    }

    function saveApiOverride() {
        if (!apiEnabledToggle || !apiBaseUrlEl || !apiTimeoutEl) return;
        const enabled = !!apiEnabledToggle.checked;
        const baseUrl = normalizeBaseUrl(apiBaseUrlEl.value);
        const timeoutMs = Math.max(1000, Number(apiTimeoutEl.value || 8000));

        if (enabled) {
            if (!baseUrl || !(baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
                setApiStatus('Informe uma URL válida (http/https) para habilitar a API.', 'err');
                return;
            }
        }

        const payload = { enabled, baseUrl, timeoutMs };
        try {
            localStorage.setItem('apiConfigOverride', JSON.stringify(payload));
        } catch {
            setApiStatus('Não foi possível salvar no navegador.', 'err');
            return;
        }

        setApiStatus('Configuração salva. Recarregando...', 'ok');
        setTimeout(() => window.location.reload(), 600);
    }

    function resetApiOverride() {
        try {
            localStorage.removeItem('apiConfigOverride');
        } catch {}
        setApiStatus('Configuração removida. Voltando ao padrão...', 'ok');
        setTimeout(() => window.location.reload(), 600);
    }

    async function testApiConnection() {
        if (!apiBaseUrlEl) return;
        const baseUrl = normalizeBaseUrl(apiBaseUrlEl.value);
        if (!baseUrl || !(baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
            setApiStatus('Informe uma URL válida para testar.', 'err');
            return;
        }

        const timeoutMs = Math.max(1000, Number(apiTimeoutEl?.value || 8000));
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        setApiStatus('Testando conexão...', null);

        try {
            const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
            if (!res.ok) {
                setApiStatus(`Falha no /health (HTTP ${res.status}).`, 'err');
                return;
            }
            setApiStatus('Conexão OK. /health respondeu com sucesso.', 'ok');
        } catch (e) {
            const msg = (e && e.name === 'AbortError') ? 'Timeout no teste.' : 'Falha ao conectar (CORS/URL/servidor offline).';
            setApiStatus(msg, 'err');
        } finally {
            clearTimeout(id);
        }
    }

    // Exporta todos os dados do localStorage para um arquivo JSON
    function exportData() {
        // Normaliza chaves usadas em diferentes módulos
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || JSON.parse(localStorage.getItem('orders')) || [];
        const mesas = JSON.parse(localStorage.getItem('mesas')) || JSON.parse(localStorage.getItem('tables')) || [];
        const estoque = JSON.parse(localStorage.getItem('estoque')) || [];
        const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];

        const data = {
            users: JSON.parse(localStorage.getItem('users')) || [],
            menuItems: JSON.parse(localStorage.getItem('menuItems')) || [],
            pedidos,
            mesas,
            estoque,
            transacoes,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `bar_restaurante_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Limpa todos os dados do localStorage
    function clearAllData() {
        if (confirm('ATENÇÃO: Esta ação é irreversível e apagará TODOS os dados (cardápio, pedidos, mesas, etc.). Deseja continuar?')) {
            // Dados do app
            localStorage.removeItem('users');
            localStorage.removeItem('menuItems');
            localStorage.removeItem('orders');
            localStorage.removeItem('pedidos');
            localStorage.removeItem('tables');
            localStorage.removeItem('mesas');
            localStorage.removeItem('estoque');
            localStorage.removeItem('transacoes');
            // Sessão
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
            alert('Todos os dados foram limpos. A aplicação será recarregada.');
            window.location.href = 'index.html';
        }
    }

    // --- Event Listeners ---
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
    if (settingsSearchEl) settingsSearchEl.addEventListener('input', applySettingsFilters);
    if (sectionFilterEl) sectionFilterEl.addEventListener('change', applySettingsFilters);

    if (apiTestBtn) apiTestBtn.addEventListener('click', testApiConnection);
    if (apiSaveBtn) apiSaveBtn.addEventListener('click', saveApiOverride);
    if (apiResetBtn) apiResetBtn.addEventListener('click', resetApiOverride);

    // --- Inicialização ---
    loadProfileInfo();
    applySettingsFilters();
    loadApiPanel();
});
