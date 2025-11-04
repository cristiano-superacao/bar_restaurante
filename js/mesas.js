document.addEventListener('DOMContentLoaded', function () {

    // --- Dados (Simulação de Banco de Dados) ---
    let tables = JSON.parse(localStorage.getItem('tables')) || [
        { id: 1, name: 'Mesa 01', capacity: 4, status: 'Livre' },
        { id: 2, name: 'Mesa 02', capacity: 2, status: 'Ocupada' },
        { id: 3, name: 'Mesa 03', capacity: 6, status: 'Livre' },
        { id: 4, name: 'Balcão 1', capacity: 1, status: 'Ocupada' },
        { id: 5, name: 'Varanda', capacity: 8, status: 'Livre' },
    ];

    // --- Elementos do DOM ---
    const tablesGrid = document.getElementById('tables-grid');
    const statusFilter = document.getElementById('table-status-filter');
    const addTableBtn = document.getElementById('add-table-btn');
    const modal = document.getElementById('table-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const tableForm = document.getElementById('table-form');
    const modalTitle = document.getElementById('table-modal-title');
    const tableIdInput = document.getElementById('table-id');

    // --- Funções ---

    function saveTables() {
        localStorage.setItem('tables', JSON.stringify(tables));
    }

    function renderTables(filteredTables) {
        tablesGrid.innerHTML = '';
        if (filteredTables.length === 0) {
            tablesGrid.innerHTML = '<p>Nenhuma mesa encontrada.</p>';
            return;
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
        const filtered = status === 'all' ? tables : tables.filter(table => table.status === status);
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
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const id = tableIdInput.value;
        const newTable = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('table-name').value,
            capacity: parseInt(document.getElementById('table-capacity').value),
            status: document.getElementById('table-status').value
        };

        if (id) {
            tables = tables.map(table => table.id === parseInt(id) ? newTable : table);
        } else {
            tables.push(newTable);
        }

        saveTables();
        filterAndRenderTables();
        closeModal();
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
    statusFilter.addEventListener('change', filterAndRenderTables);
    addTableBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    tableForm.addEventListener('submit', handleFormSubmit);
    tablesGrid.addEventListener('click', handleGridClick);

    // --- Inicialização ---
    filterAndRenderTables();
});