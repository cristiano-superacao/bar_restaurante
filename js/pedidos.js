document.addEventListener('DOMContentLoaded', function () {

    // --- Dados (Simulação de Banco de Dados) ---
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const mesas = JSON.parse(localStorage.getItem('mesas')) || [];
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

    // --- Elementos do DOM ---
    const ordersGrid = document.getElementById('orders-grid');
    const searchInput = document.getElementById('search-order-input');
    const statusFilter = document.getElementById('status-filter');
    const addOrderBtn = document.getElementById('add-order-btn');
    const modal = document.getElementById('order-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const orderForm = document.getElementById('order-form');
    const modalTitle = document.getElementById('order-modal-title');
    const orderIdInput = document.getElementById('order-id');
    const orderTableSelect = document.getElementById('order-table');
    const menuItemSelect = document.getElementById('menu-item-select');
    const itemQuantityInput = document.getElementById('item-quantity');
    const addItemToOrderBtn = document.getElementById('add-item-to-order-btn');
    const orderItemsContainer = document.getElementById('order-items-container');
    const orderTotalPriceEl = document.getElementById('order-total-price');

    let currentOrderItems = [];

    // --- Funções ---

    function saveOrders() {
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
    }

    function renderOrders(filteredOrders) {
        ordersGrid.innerHTML = '';
        if (filteredOrders.length === 0) {
            ordersGrid.innerHTML = '<p class="empty-message">Nenhum pedido encontrado com os filtros atuais.</p>';
            return;
        }

        filteredOrders.sort((a, b) => b.id - a.id).forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card';
            card.dataset.id = order.id;

            const itemsHtml = order.items.map(item => `
                <li>
                    <span class="item-name">${item.quantity}x ${item.name}</span>
                    <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </li>
            `).join('');

            card.innerHTML = `
                <div class="order-card-header">
                    <h3>${order.table}</h3>
                    <span class="order-id">#${String(order.id).padStart(4, '0')}</span>
                </div>
                <div class="order-card-body">
                    <ul>${itemsHtml}</ul>
                </div>
                <div class="order-card-footer">
                    <span class="order-total-price">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
                    <span class="order-status ${order.status.replace(' ', '-')}">${order.status}</span>
                </div>
            `;
            ordersGrid.appendChild(card);
        });
    }

    function filterAndRenderOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;

        const filtered = pedidos.filter(order => {
            const matchesSearch = order.table.toLowerCase().includes(searchTerm) || String(order.id).includes(searchTerm);
            const matchesStatus = status === 'all' || order.status === status;
            return matchesSearch && matchesStatus;
        });
        renderOrders(filtered);
    }

    function populateTableSelect() {
        orderTableSelect.innerHTML = '<option value="">Selecione uma mesa...</option>';
        mesas.forEach(mesa => {
            const option = document.createElement('option');
            option.value = mesa.name;
            option.textContent = `${mesa.name} (${mesa.status})`;
            orderTableSelect.appendChild(option);
        });
    }

    function populateMenuItemSelect() {
        menuItemSelect.innerHTML = '<option value="">Selecione um item...</option>';
        menuItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} - R$ ${item.price.toFixed(2)}`;
            option.dataset.price = item.price;
            option.dataset.name = item.name;
            menuItemSelect.appendChild(option);
        });
    }

    function renderCurrentOrderItems() {
        orderItemsContainer.innerHTML = '';
        if (currentOrderItems.length === 0) {
            orderItemsContainer.innerHTML = '<p class="empty-message">Nenhum item adicionado.</p>';
        } else {
            currentOrderItems.forEach((item, index) => {
                const itemRow = document.createElement('div');
                itemRow.className = 'order-item-row';
                itemRow.innerHTML = `
                    <span>${item.quantity}x ${item.name}</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.',',')}</span>
                    <button type="button" class="btn-remove-item" data-index="${index}" title="Remover item">&times;</button>
                `;
                orderItemsContainer.appendChild(itemRow);
            });
        }
        updateOrderTotal();
    }

    function updateOrderTotal() {
        const total = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderTotalPriceEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    function handleAddItemToOrder() {
        const selectedOption = menuItemSelect.options[menuItemSelect.selectedIndex];
        if (!selectedOption.value) return;

        const itemId = parseInt(selectedOption.value);
        const itemName = selectedOption.dataset.name;
        const itemPrice = parseFloat(selectedOption.dataset.price);
        const quantity = parseInt(itemQuantityInput.value);

        if (quantity <= 0) return;

        const existingItem = currentOrderItems.find(item => item.id === itemId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            currentOrderItems.push({ id: itemId, name: itemName, price: itemPrice, quantity: quantity });
        }

        renderCurrentOrderItems();
        menuItemSelect.value = '';
        itemQuantityInput.value = 1;
    }
    
    function handleRemoveOrderItem(e) {
        if (e.target.classList.contains('btn-remove-item')) {
            const index = parseInt(e.target.dataset.index);
            currentOrderItems.splice(index, 1);
            renderCurrentOrderItems();
        }
    }

    function openModal(order = null) {
        orderForm.reset();
        populateTableSelect();
        if (order) {
            modalTitle.textContent = 'Editar Pedido';
            orderIdInput.value = order.id;
            document.getElementById('order-table').value = order.table;
            document.getElementById('order-status').value = order.status;
            currentOrderItems = JSON.parse(JSON.stringify(order.items)); // Deep copy
        } else {
            modalTitle.textContent = 'Novo Pedido';
            orderIdInput.value = '';
            currentOrderItems = [];
        }
        renderCurrentOrderItems();
        modal.classList.add('show');
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const id = orderIdInput.value;
        const total = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (currentOrderItems.length === 0) {
            alert('Adicione pelo menos um item ao pedido.');
            return;
        }

        const newOrder = {
            id: id ? parseInt(id) : Date.now(),
            table: document.getElementById('order-table').value,
            items: currentOrderItems,
            total: total,
            status: document.getElementById('order-status').value,
            data: new Date().toISOString()
        };

        if (id) {
            pedidos = pedidos.map(order => order.id === parseInt(id) ? newOrder : order);
        } else {
            pedidos.push(newOrder);
        }

        saveOrders();
        filterAndRenderOrders();
        closeModal();
    }
    
    function handleGridClick(e) {
        const card = e.target.closest('.order-card');
        if (card) {
            const orderId = parseInt(card.dataset.id);
            const order = pedidos.find(o => o.id === orderId);
            if (order) {
                openModal(order);
            }
        }
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', filterAndRenderOrders);
    statusFilter.addEventListener('change', filterAndRenderOrders);
    addOrderBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    addItemToOrderBtn.addEventListener('click', handleAddItemToOrder);
    orderItemsContainer.addEventListener('click', handleRemoveOrderItem);
    orderForm.addEventListener('submit', handleFormSubmit);
    ordersGrid.addEventListener('click', handleGridClick);


    // --- Inicialização ---
    populateMenuItemSelect();
    filterAndRenderOrders();
});