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
        const data = {
            users: JSON.parse(localStorage.getItem('users')) || [],
            menuItems: JSON.parse(localStorage.getItem('menuItems')) || [],
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            tables: JSON.parse(localStorage.getItem('tables')) || [],
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
            localStorage.removeItem('users');
            localStorage.removeItem('menuItems');
            localStorage.removeItem('orders');
            localStorage.removeItem('tables');
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
            alert('Todos os dados foram limpos. A aplicação será recarregada.');
            window.location.href = 'login.html';
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