document.addEventListener('DOMContentLoaded', function () {

    // --- Dados (Simulação de Banco de Dados) ---
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = (typeof window !== 'undefined' && window.APP_STORAGE)
        ? window.APP_STORAGE
        : {
            get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (def ?? null); } catch { return def ?? null; } },
            set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
        };

    let tables = STORE.get('tables', null, ['tables', 'mesas']);
    if (!tables) tables = [
        { id: 1, name: 'Mesa 01', capacity: 4, status: 'Livre' },
        { id: 2, name: 'Mesa 02', capacity: 2, status: 'Ocupada' },
        { id: 3, name: 'Mesa 03', capacity: 6, status: 'Livre' },
        { id: 4, name: 'Balcão 1', capacity: 1, status: 'Ocupada' },
        { id: 5, name: 'Varanda', capacity: 8, status: 'Livre' },
    ];

    // --- Elementos do DOM ---
    const tablesGrid = document.getElementById('tables-grid');
    const searchInput = document.getElementById('search-table-input');
    const statusFilter = document.getElementById('table-status-filter');
    const addTableBtn = document.getElementById('add-table-btn');
    const modal = document.getElementById('table-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const tableForm = document.getElementById('table-form');
    const modalTitle = document.getElementById('table-modal-title');
    const tableIdInput = document.getElementById('table-id');

    // --- Funções ---

    function saveTables() {
        if (!apiEnabled) {
            STORE.set('tables', tables);
        }
    }

    async function loadTables() {
        if (apiEnabled && window.API) {
            try {
                tables = await window.API.tables.list();
            } catch (e) {
                console.warn('Falha ao carregar mesas da API, usando LocalStorage.', e);
                tables = STORE.get('tables', tables, ['tables', 'mesas']) || tables;
            }
        } else {
            tables = STORE.get('tables', tables, ['tables', 'mesas']) || tables;
        }
    }

    function renderTables(filteredTables) {
        tablesGrid.innerHTML = '';

        const emptyEl = document.getElementById('tables-empty');

        // Atualiza métricas
        const livres = filteredTables.filter(t => t.status === 'Livre').length;
        const ocupadas = filteredTables.filter(t => t.status === 'Ocupada').length;
        const capacidade = filteredTables.reduce((sum, t) => sum + (t.capacity || 0), 0);
        const total = filteredTables.length;
        const el = id => document.getElementById(id);
        if (el('mesas-livres')) el('mesas-livres').textContent = String(livres);
        if (el('mesas-ocupadas')) el('mesas-ocupadas').textContent = String(ocupadas);
        if (el('mesas-capacidade')) el('mesas-capacidade').textContent = String(capacidade);
        if (el('mesas-total')) el('mesas-total').textContent = String(total);

        if (filteredTables.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
        }

        filteredTables.forEach(table => {
            const card = document.createElement('div');
            card.className = `table-card ${table.status}`;
            card.dataset.id = table.id;

            card.innerHTML = `
                <i class="fas fa-chair table-icon"></i>
                <h3>${table.name}</h3>
                <p>Capacidade: ${table.capacity}</p>
                <p class="table-status-text">${table.status}</p>
            `;
            tablesGrid.appendChild(card);
        });
    }

    function filterAndRenderTables() {
        const status = statusFilter.value;
        const query = (searchInput?.value || '').toLowerCase();
        let filtered = status === 'all' ? tables : tables.filter(table => table.status === status);
        if (query) filtered = filtered.filter(table => (table.name || '').toLowerCase().includes(query));
        renderTables(filtered);
    }

    function openModal(table = null) {
        tableForm.reset();
        if (table) {
            modalTitle.textContent = 'Editar Mesa';
            tableIdInput.value = table.id;
            document.getElementById('table-name').value = table.name;
            document.getElementById('table-capacity').value = table.capacity;
            document.getElementById('table-status').value = table.status;
        } else {
            modalTitle.textContent = 'Adicionar Nova Mesa';
            tableIdInput.value = '';
        }
        modal.classList.add('show');
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const id = tableIdInput.value;
        const newTable = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('table-name').value,
            capacity: parseInt(document.getElementById('table-capacity').value),
            status: document.getElementById('table-status').value
        };

        if (apiEnabled && window.API) {
            try {
                if (id) {
                    await window.API.tables.update(parseInt(id), { name: newTable.name, capacity: newTable.capacity, status: newTable.status });
                } else {
                    await window.API.tables.create({ name: newTable.name, capacity: newTable.capacity, status: newTable.status });
                }
                await loadTables();
                filterAndRenderTables();
                closeModal();
            } catch (err) {
                alert('Erro ao salvar a mesa via API.');
            }
        } else {
            if (id) {
                tables = tables.map(table => table.id === parseInt(id) ? newTable : table);
            } else {
                tables.push(newTable);
            }
            saveTables();
            filterAndRenderTables();
            closeModal();
        }
    }

    function handleGridClick(e) {
        const card = e.target.closest('.table-card');
        if (card) {
            const tableId = parseInt(card.dataset.id);
            const table = tables.find(t => t.id === tableId);
            if (table) {
                openModal(table);
            }
        }
    }

    // --- Event Listeners ---
    if (searchInput) searchInput.addEventListener('input', filterAndRenderTables);
    statusFilter.addEventListener('change', filterAndRenderTables);
    addTableBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    tableForm.addEventListener('submit', handleFormSubmit);
    tablesGrid.addEventListener('click', handleGridClick);

    // --- Inicialização ---
    (async () => {
        await loadTables();
        filterAndRenderTables();
    })();
});
