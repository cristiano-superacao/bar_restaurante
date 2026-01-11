document.addEventListener('DOMContentLoaded', function () {

    // --- Dados (Simulação de Banco de Dados) ---
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = window.APP_STORAGE;

    let menuItems = STORE.get('menuItems', [], ['menuItems']) || [];
    let mesas = STORE.get('tables', [], ['tables', 'mesas']) || [];
    let pedidos = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];

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
    const orderDiscountInput = document.getElementById('order-discount');
    const orderPaymentSelect = document.getElementById('order-payment');
    const orderCloseBtn = document.getElementById('order-close-btn');
    function populateStatusSelect() {
        const sel = document.getElementById('order-status');
        if (!sel) return;
        const statuses = window.CONFIG?.CONSTS?.ORDER_STATUS_MESA
            || window.UTILS?.CONSTANTS?.ORDER_STATUS?.MESA
            || ['Pendente','Em Preparo','Entregue','Pago','Cancelado'];
        (window.UTILS?.populateSelect ? window.UTILS.populateSelect(sel, statuses) : (() => {
          const current = sel.value; sel.innerHTML=''; statuses.forEach(s=>{const opt=document.createElement('option'); opt.value=s; opt.textContent=s; sel.appendChild(opt);}); if(current) sel.value=current;
        })());
    }

    function populatePaymentSelect() {
        if (!orderPaymentSelect) return;
        const methods = window.CONFIG?.CONSTS?.PAYMENT_METHODS
            || window.UTILS?.CONSTANTS?.PAYMENT_METHODS
            || ['Dinheiro','Cartão','PIX'];
        if (window.UTILS?.populateSelect) {
          window.UTILS.populateSelect(orderPaymentSelect, methods, 'Selecione...');
        } else {
          const current = orderPaymentSelect.value; orderPaymentSelect.innerHTML='<option value="">Selecione...</option>'; methods.forEach(m=>{const opt=document.createElement('option'); opt.value=m; opt.textContent=m; orderPaymentSelect.appendChild(opt);}); if(current) orderPaymentSelect.value=current;
        }
    }

    let currentOrderItems = [];

    // --- Funções ---

    const formatCurrency = window.CONFIG?.UTILS?.formatCurrency || ((v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`);

    function saveOrders() {
        if (!apiEnabled) {
            STORE.set('pedidos', pedidos);
        }
    }

    async function loadData() {
        // Carrega dados de acordo com a fonte
        if (apiEnabled && window.API) {
            try {
                [menuItems, mesas, pedidos] = await Promise.all([
                    window.API.menu.list(),
                    window.API.tables.list(),
                    window.API.orders.listWithItems({ type: 'Mesa' })
                ]);
            } catch (e) {
                console.warn('Falha ao carregar via API, usando LocalStorage.', e);
                menuItems = STORE.get('menuItems', menuItems, ['menuItems']) || menuItems;
                mesas = STORE.get('tables', mesas, ['tables', 'mesas']) || mesas;
                pedidos = (STORE.get('pedidos', pedidos, ['pedidos', 'orders']) || pedidos).filter(o => (o.orderType || o.order_type || 'Mesa') !== 'Delivery');
            }
        } else {
            menuItems = STORE.get('menuItems', menuItems, ['menuItems']) || menuItems;
            mesas = STORE.get('tables', mesas, ['tables', 'mesas']) || mesas;
            pedidos = (STORE.get('pedidos', pedidos, ['pedidos', 'orders']) || pedidos).filter(o => (o.orderType || o.order_type || 'Mesa') !== 'Delivery');
        }
    }

    function renderOrders(filteredOrders) {
        ordersGrid.innerHTML = '';
        const emptyEl = document.getElementById('orders-empty');
        if (filteredOrders.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
        }

        // Estatísticas por status
        const stats = { Pendentes: 0, 'Em Preparo': 0, Entregues: 0, Cancelados: 0 };
        filteredOrders.forEach(o => {
            if (o.status === 'Pendente') stats.Pendentes++;
            else if (o.status === 'Em Preparo') stats['Em Preparo']++;
            else if (o.status === 'Entregue' || o.status === 'Pago') stats.Entregues++;
            else if (o.status === 'Cancelado') stats.Cancelados++;
        });
        const el = id => document.getElementById(id);
        if (el('pedidos-pendentes')) el('pedidos-pendentes').textContent = String(stats.Pendentes);
        if (el('pedidos-preparo')) el('pedidos-preparo').textContent = String(stats['Em Preparo']);
        if (el('pedidos-entregues')) el('pedidos-entregues').textContent = String(stats.Entregues);
        if (el('pedidos-cancelados')) el('pedidos-cancelados').textContent = String(stats.Cancelados);

        // Render cards no estilo Mesas
        filteredOrders.sort((a, b) => b.id - a.id).forEach(order => {
            const card = document.createElement('div');
            const statusClass = (order.status || '').replace(' ', '-');
            card.className = `order-card ${statusClass}`;
            card.dataset.id = order.id;

            const totalItems = (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
            const iconClass = (order.status === 'Cancelado') ? 'fa-ban' : (order.status === 'Em Preparo' ? 'fa-fire' : 'fa-clipboard-list');

            card.innerHTML = `
                <i class="fas ${iconClass} order-icon"></i>
                <h3>${order.table}</h3>
                <p>#${String(order.id).padStart(4, '0')} • ${totalItems} itens</p>
                <div class="order-status-text">${order.status}</div>
                <div class="order-total-price">${formatCurrency(order.total)}</div>
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
            option.value = apiEnabled ? String(mesa.id) : mesa.name;
            option.textContent = `${mesa.name} (${mesa.status})`;
            option.dataset.name = mesa.name;
            orderTableSelect.appendChild(option);
        });
    }

    function populateMenuItemSelect() {
        menuItemSelect.innerHTML = '<option value="">Selecione um item...</option>';
        menuItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} - ${formatCurrency(item.price)}`;
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
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                    <button type="button" class="btn-remove-item" data-index="${index}" title="Remover item">&times;</button>
                `;
                orderItemsContainer.appendChild(itemRow);
            });
        }
        updateOrderTotal();
    }

    function updateOrderTotal() {
        const subtotal = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = orderDiscountInput ? (parseFloat(orderDiscountInput.value) || 0) : 0;
        const total = Math.max(0, subtotal - discount);
        orderTotalPriceEl.textContent = formatCurrency(total);
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
        populateStatusSelect();
        populatePaymentSelect();
        if (order) {
            modalTitle.textContent = 'Editar Pedido';
            orderIdInput.value = order.id;
            if (orderDiscountInput) orderDiscountInput.value = String(Number(order.discount ?? 0));
            if (orderPaymentSelect) orderPaymentSelect.value = order.paymentMethod || order.payment_method || '';
            if (apiEnabled) {
                // tentar selecionar mesa pelo nome
                const opts = Array.from(orderTableSelect.options);
                const found = opts.find(o => o.dataset.name === order.table);
                if (found) orderTableSelect.value = found.value;
            } else {
                document.getElementById('order-table').value = order.table;
            }
            document.getElementById('order-status').value = order.status;
            currentOrderItems = JSON.parse(JSON.stringify(order.items)); // Deep copy

            const isClosable = order.status !== 'Pago' && order.status !== 'Cancelado';
            if (orderCloseBtn) orderCloseBtn.style.display = isClosable ? 'inline-flex' : 'none';
        } else {
            modalTitle.textContent = 'Novo Pedido';
            orderIdInput.value = '';
            currentOrderItems = [];
            if (orderDiscountInput) orderDiscountInput.value = '0';
            if (orderPaymentSelect) orderPaymentSelect.value = '';
            if (orderCloseBtn) orderCloseBtn.style.display = 'none';
        }
        renderCurrentOrderItems();
        modal.classList.add('show');
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const id = orderIdInput.value;
        const subtotal = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = orderDiscountInput ? (parseFloat(orderDiscountInput.value) || 0) : 0;
        const total = Math.max(0, subtotal - discount);
        const paymentMethod = orderPaymentSelect ? orderPaymentSelect.value : '';

        if (currentOrderItems.length === 0) {
            alert('Adicione pelo menos um item ao pedido.');
            return;
        }

        if (apiEnabled && window.API) {
            try {
                const status = document.getElementById('order-status').value;
                if (id) {
                    // Atualiza apenas o status pelo endpoint
                    await window.API.orders.update(parseInt(id), { status, discount, paymentMethod });
                } else {
                    const tableId = parseInt(document.getElementById('order-table').value);
                    const items = currentOrderItems.map(it => ({ menuItemId: it.id, quantity: it.quantity, price: it.price }));
                    await window.API.orders.create({ tableId, status, items, orderType: 'Mesa', discount, paymentMethod });
                }
                pedidos = await window.API.orders.listWithItems({ type: 'Mesa' });
                filterAndRenderOrders();
                closeModal();
            } catch (err) {
                alert('Erro ao salvar pedido via API.');
            }
        } else {
            const newOrder = {
                id: id ? parseInt(id) : Date.now(),
                table: document.getElementById('order-table').value,
                items: currentOrderItems,
                orderType: 'Mesa',
                paymentMethod,
                discount,
                subtotal,
                total,
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
    }

    async function handleCloseAccount() {
        const id = orderIdInput.value;
        if (!id) return;

        const discount = orderDiscountInput ? (parseFloat(orderDiscountInput.value) || 0) : 0;
        const paymentMethod = (orderPaymentSelect && orderPaymentSelect.value) ? orderPaymentSelect.value : 'Dinheiro';

        if (apiEnabled && window.API) {
            try {
                await window.API.orders.close(parseInt(id), { paymentMethod, discount, deliveryFee: 0 });
                pedidos = await window.API.orders.listWithItems({ type: 'Mesa' });
                filterAndRenderOrders();
                closeModal();
                window.open(`cupom.html?orderId=${encodeURIComponent(String(id))}`, '_blank');
            } catch (e) {
                alert('Erro ao fechar conta via API.');
            }
            return;
        }

        const now = new Date().toISOString();
        const updated = pedidos.map(o => {
            if (String(o.id) !== String(id)) return o;
            const subtotal = (o.items || []).reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);
            const total = Math.max(0, subtotal - discount);
            return { ...o, status: 'Pago', paymentMethod, discount, subtotal, total, paidAt: now };
        });
        pedidos = updated;
        saveOrders();

        // Gera transação de receita no financeiro (LocalStorage)
        const transacoes = STORE.get('transacoes', [], ['transacoes']) || [];
        const orderTotal = updated.find(o => String(o.id) === String(id))?.total || 0;
        transacoes.push({
            id: String(Date.now()),
            descricao: `Pedido #${String(id).padStart(4, '0')} (Mesa)`,
            valor: Number(orderTotal) || 0,
            tipo: 'Receita',
            data: new Date().toISOString().slice(0, 10),
            status: 'pago'
        });
        STORE.set('transacoes', transacoes);

        filterAndRenderOrders();
        closeModal();
        window.open(`cupom.html?orderId=${encodeURIComponent(String(id))}`, '_blank');
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
    if (orderDiscountInput) orderDiscountInput.addEventListener('input', updateOrderTotal);
    orderForm.addEventListener('submit', handleFormSubmit);
    if (orderCloseBtn) orderCloseBtn.addEventListener('click', handleCloseAccount);
    ordersGrid.addEventListener('click', handleGridClick);


    // --- Inicialização ---
    (async () => {
        await loadData();
        populateMenuItemSelect();
        filterAndRenderOrders();
    })();
});
