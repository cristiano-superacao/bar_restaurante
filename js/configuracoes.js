document.addEventListener('DOMContentLoaded', function () {

    // --- Elementos do DOM ---
    const profileNameEl = document.getElementById('profile-name');
    const profileRoleEl = document.getElementById('profile-role');
    const exportDataBtn = document.getElementById('export-data-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');

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

    // --- Inicialização ---
    loadProfileInfo();
});