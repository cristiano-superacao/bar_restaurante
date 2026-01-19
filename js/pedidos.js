document.addEventListener('DOMContentLoaded', function () {

    // --- Dados (Simulação de Banco de Dados) ---
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = window.APP_STORAGE;

    let menuItems = STORE.get('menuItems', [], ['menuItems']) || [];
    let mesas = STORE.get('tables', [], ['tables', 'mesas']) || [];
    let pedidos = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
    let estoque = STORE.get('estoque', [], ['estoque']) || [];

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
    const addonsSection = document.getElementById('addons-section');
    const addonsOptions = document.getElementById('addons-options');
    const addonsCountEl = document.getElementById('addons-count');
    const ADDONS_MAX = 4;
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
                try {
                    estoque = await window.API.stock.list();
                } catch (e) {
                    estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
                }
            } catch (e) {
                console.warn('Falha ao carregar via API, usando LocalStorage.', e);
                menuItems = STORE.get('menuItems', menuItems, ['menuItems']) || menuItems;
                mesas = STORE.get('tables', mesas, ['tables', 'mesas']) || mesas;
                pedidos = (STORE.get('pedidos', pedidos, ['pedidos', 'orders']) || pedidos).filter(o => (o.orderType || o.order_type || 'Mesa') !== 'Delivery');
                estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
            }
        } else {
            menuItems = STORE.get('menuItems', menuItems, ['menuItems']) || menuItems;
            mesas = STORE.get('tables', mesas, ['tables', 'mesas']) || mesas;
            pedidos = (STORE.get('pedidos', pedidos, ['pedidos', 'orders']) || pedidos).filter(o => (o.orderType || o.order_type || 'Mesa') !== 'Delivery');
            estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
        }
    }

    function normalizeText(v) {
        try {
            return String(v || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
        } catch {
            return String(v || '').toLowerCase();
        }
    }

    function menuItemAllowsAddons(menuItem) {
        // Nova lógica: verifica se o campo allowsAddons está marcado
        if (menuItem?.allowsAddons === true) return true;
        
        // Fallback: se não tem o campo, usa a lógica antiga (nome do produto)
        const base = `${menuItem?.category || ''} ${menuItem?.name || ''}`;
        const t = normalizeText(base);
        return ['pastel', 'hamburguer', 'crepe', 'tapioca'].some(k => t.includes(k));
    }

    function isAddonStockItem(stockItem) {
        // Nova lógica: verifica se o campo isAddon está marcado
        if (stockItem?.isAddon === true || stockItem?.is_addon === true) return true;
        
        // Fallback: se não tem o campo, usa a lógica antiga (categoria)
        const cat = normalizeText(stockItem?.category);
        return cat.includes('acomp');
    }

    function getAddonStockOptions() {
        const list = Array.isArray(estoque) ? estoque : [];
        return list
            .filter(isAddonStockItem)
            .map(s => ({
                id: s.id,
                name: s.name,
                quantity: Number(s.quantity ?? s.quantidade ?? 0),
                unit: s.unit || s.unidade || 'un',
            }))
            .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
    }

    function getAddonOptionsForMenuItem(menuItem) {
        const opts = getAddonStockOptions();
        const ids = menuItem?.addonStockIds ?? menuItem?.addon_stock_ids;
        if (!Array.isArray(ids) || ids.length === 0) return opts;
        const allowed = new Set(ids.map(v => String(v)));
        return opts.filter(o => allowed.has(String(o.id)));
    }

    function clearAddonSelection() {
        if (!addonsOptions) return;
        const inputs = addonsOptions.querySelectorAll('input[type="checkbox"]');
        inputs.forEach(i => { i.checked = false; });
        updateAddonsLimitUI();
    }

    function updateAddonsLimitUI() {
        if (!addonsOptions) return;

        const checkboxes = Array.from(addonsOptions.querySelectorAll('input[type="checkbox"]'));
        const labels = Array.from(addonsOptions.querySelectorAll('.addon-option'));
        const selectedCount = checkboxes.filter(cb => cb.checked).length;
        if (addonsCountEl) addonsCountEl.textContent = `${selectedCount}/${ADDONS_MAX}`;

        const shouldLock = selectedCount >= ADDONS_MAX;
        checkboxes.forEach((cb, idx) => {
            const label = labels[idx];
            if (!label) return;
            const isSelected = cb.checked;
            const shouldDisable = shouldLock && !isSelected;
            cb.disabled = cb.disabled || shouldDisable;
            label.classList.toggle('is-disabled', cb.disabled);
            label.classList.toggle('is-locked', shouldLock && isSelected);
        });
    }

    function onAddonToggle(e) {
        const target = e.target;
        if (!target || target.tagName !== 'INPUT' || target.type !== 'checkbox') return;
        const checked = Array.from(addonsOptions.querySelectorAll('input[type="checkbox"]:checked'));
        if (checked.length > ADDONS_MAX) {
            target.checked = false;
        }
        updateAddonsLimitUI();
    }

    function renderAddonOptions(menuItem = null) {
        if (!addonsOptions) return;
        const opts = menuItem ? getAddonOptionsForMenuItem(menuItem) : getAddonStockOptions();
        if (opts.length === 0) {
            addonsOptions.innerHTML = '<div class="empty-message" style="margin:0;">Cadastre itens no estoque com categoria "Acompanhamentos".</div>';
            if (addonsCountEl) addonsCountEl.textContent = `0/${ADDONS_MAX}`;
            return;
        }
        addonsOptions.innerHTML = '';
        opts.forEach((s) => {
            const label = document.createElement('label');
            label.className = `addon-option${(s.quantity <= 0) ? ' is-disabled' : ''}`;
            label.innerHTML = `
                <input type="checkbox" value="${String(s.id)}" ${(s.quantity <= 0) ? 'disabled' : ''}>
                <span class="addon-name">${String(s.name)}</span>
                <span class="addon-meta">${Number.isFinite(s.quantity) ? s.quantity : 0} ${String(s.unit)}</span>
            `;
            addonsOptions.appendChild(label);
        });

        updateAddonsLimitUI();
    }

    function syncAddonsVisibility() {
        if (!addonsSection || !menuItemSelect) return;
        const selectedOption = menuItemSelect.options[menuItemSelect.selectedIndex];
        const itemId = selectedOption && selectedOption.value ? Number(selectedOption.value) : null;
        const menuItem = (Array.isArray(menuItems) ? menuItems : []).find(mi => Number(mi.id) === Number(itemId));
        const configuredIds = menuItem?.addonStockIds ?? menuItem?.addon_stock_ids;
        const hasConfiguredAddons = Array.isArray(configuredIds) && configuredIds.length > 0;
        const show = !!menuItem && (hasConfiguredAddons || menuItemAllowsAddons(menuItem));

        addonsSection.style.display = show ? 'block' : 'none';
        if (show) {
            renderAddonOptions(menuItem);
        } else {
            clearAddonSelection();
        }

        updateAddonsLimitUI();
    }

    function getSelectedAddons() {
        if (!addonsSection || addonsSection.style.display === 'none' || !addonsOptions) return [];
        const checked = Array.from(addonsOptions.querySelectorAll('input[type="checkbox"]:checked'));
        const ids = checked.map(i => i.value).filter(Boolean);
        const opts = getAddonStockOptions();
        const selected = ids.map((raw) => {
            const match = opts.find(o => String(o.id) === String(raw));
            return match ? { stockId: match.id, name: match.name, quantity: 1 } : null;
        }).filter(Boolean);
        return selected;
    }

    function orderItemKey(menuItemId, addons = []) {
        const addonIds = (addons || []).map(a => String(a.stockId)).sort().join(',');
        return `${String(menuItemId)}|${addonIds}`;
    }

    function ensureOrderItemKeys() {
        currentOrderItems = (currentOrderItems || []).map(it => {
            if (it && it.key) return it;
            const addons = Array.isArray(it.addons) ? it.addons : [];
            return { ...it, addons, key: orderItemKey(it.id, addons) };
        });
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
                const addons = Array.isArray(item.addons) ? item.addons : [];
                const addonText = addons.length
                    ? `<div class="order-item-addons">Acomp: ${addons.map(a => a.name).join(', ')}</div>`
                    : '';
                itemRow.innerHTML = `
                    <div class="order-item-main">
                        <span>${item.quantity}x ${item.name}</span>
                        ${addonText}
                    </div>
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

        const selectedAddons = getSelectedAddons();
        if (selectedAddons.length > ADDONS_MAX) {
            const errEl = document.getElementById('order-form-error');
            if (errEl) { errEl.textContent = `Selecione no máximo ${ADDONS_MAX} acompanhamentos.`; errEl.style.display = 'block'; }
            return;
        }

        const key = orderItemKey(itemId, selectedAddons);
        const existingItem = currentOrderItems.find(item => item.key === key);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            currentOrderItems.push({ key, id: itemId, name: itemName, price: itemPrice, quantity: quantity, addons: selectedAddons });
        }

        renderCurrentOrderItems();
        menuItemSelect.value = '';
        itemQuantityInput.value = 1;
        clearAddonSelection();
        syncAddonsVisibility();
        updateAddonsLimitUI();
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
        const errEl = document.getElementById('order-form-error');
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
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
            ensureOrderItemKeys();

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
        syncAddonsVisibility();
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
        const errEl = document.getElementById('order-form-error');
        const showError = (msg) => { if (errEl) { errEl.textContent = String(msg || 'Erro'); errEl.style.display = 'block'; } };

        if (currentOrderItems.length === 0) {
            showError('Adicione pelo menos um item ao pedido.');
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
                    const items = currentOrderItems.map(it => ({
                        menuItemId: it.id,
                        quantity: it.quantity,
                        price: it.price,
                        addons: (Array.isArray(it.addons) ? it.addons : []).map(a => ({ stockId: a.stockId, quantity: a.quantity || 1 }))
                    }));
                    await window.API.orders.create({ tableId, status, items, orderType: 'Mesa', discount, paymentMethod });
                }
                pedidos = await window.API.orders.listWithItems({ type: 'Mesa' });
                filterAndRenderOrders();
                closeModal();
            } catch (err) {
                console.error('Erro ao salvar pedido via API:', err);
                const msg = (err && err.details && (err.details.error || err.details.message))
                    ? `Erro: ${err.details.error || err.details.message}`
                    : 'Erro ao salvar pedido via API.';
                showError(msg);
            }
        } else {
            // Movimentação de saída do estoque (modo LocalStorage)
            // Regra: deduz somente na criação do pedido (evita dupla baixa ao editar).
            if (!id) {
                const estoqueAtual = STORE.get('estoque', estoque, ['estoque']) || estoque;

                const safeNumber = (v) => {
                    const n = Number(v);
                    return Number.isFinite(n) ? n : 0;
                };

                const resolveBaseStockId = (menuItemId, menuItemName) => {
                    const mid = menuItemId ? String(menuItemId) : '';
                    const nameNorm = normalizeText(menuItemName);

                    // vínculo explícito (menuItemId/menu_item_id)
                    let found = (estoqueAtual || []).find(s => String(s.menuItemId || s.menu_item_id || '') === mid && !s.isAddon && !s.is_addon);
                    if (found) return String(found.id);

                    // match conservador por id + nome
                    found = (estoqueAtual || []).find(s => {
                        if (s.isAddon || s.is_addon) return false;
                        const sid = String(s.id);
                        const sameId = sid === mid || safeNumber(sid) === safeNumber(mid);
                        if (!sameId) return false;
                        const sNameNorm = normalizeText(s.name);
                        return sNameNorm && nameNorm && sNameNorm === nameNorm;
                    });
                    return found ? String(found.id) : null;
                };

                const needed = new Map();
                const stockLabelById = new Map();

                currentOrderItems.forEach(it => {
                    // Produto base (opcional: só se houver vínculo confiável)
                    const baseStockId = resolveBaseStockId(it.id, it.name);
                    if (baseStockId) {
                        needed.set(baseStockId, (needed.get(baseStockId) || 0) + safeNumber(it.quantity || 1));
                    }

                    // Acompanhamentos (sempre vinculados via stockId)
                    const addons = Array.isArray(it.addons) ? it.addons : [];
                    addons.forEach(a => {
                        const k = String(a.stockId);
                        const prev = needed.get(k) || 0;
                        needed.set(k, prev + (safeNumber(it.quantity) || 1) * (safeNumber(a.quantity) || 1));
                    });
                });

                for (const [stockId, qNeed] of needed.entries()) {
                    const item = (estoqueAtual || []).find(s => String(s.id) === String(stockId));
                    const qHave = safeNumber(item?.quantity ?? item?.quantidade ?? 0);
                    const label = item?.name ? String(item.name) : `ID: ${stockId}`;
                    stockLabelById.set(String(stockId), label);
                    if (!item || qHave < qNeed) {
                        showError(`Estoque insuficiente para "${label}". Necessário: ${qNeed}.`);
                        return;
                    }
                }

                const estoqueNovo = (estoqueAtual || []).map(s => {
                    const key = String(s.id);
                    const dec = needed.get(key) || 0;
                    if (!dec) return s;
                    const qHave = safeNumber(s.quantity ?? s.quantidade ?? 0);
                    const next = Math.max(0, qHave - dec);
                    if (s.quantity !== undefined) return { ...s, quantity: next };
                    return { ...s, quantidade: next };
                });

                STORE.set('estoque', estoqueNovo);
                estoque = estoqueNovo;
            }

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
        const errEl = document.getElementById('order-form-error');
        const showError = (msg) => { if (errEl) { errEl.textContent = String(msg || 'Erro'); errEl.style.display = 'block'; } };

        if (apiEnabled && window.API) {
            try {
                await window.API.orders.close(parseInt(id), { paymentMethod, discount, deliveryFee: 0 });
                pedidos = await window.API.orders.listWithItems({ type: 'Mesa' });
                filterAndRenderOrders();
                closeModal();
                window.open(`cupom.html?orderId=${encodeURIComponent(String(id))}`, '_blank');
            } catch (e) {
                console.error('Erro ao fechar conta via API:', e);
                const msg = (e && e.details && (e.details.error || e.details.message))
                    ? `Erro: ${e.details.error || e.details.message}`
                    : 'Erro ao fechar conta via API.';
                showError(msg);
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
        const closedOrder = updated.find(o => String(o.id) === String(id));
        
        // MOVIMENTAÇÃO DE ESTOQUE AO FINALIZAR PEDIDO
        if (closedOrder && closedOrder.items) {
            const estoqueAtual = STORE.get('estoque', estoque, ['estoque']) || estoque;
            const safeNumber = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
            
            closedOrder.items.forEach(orderItem => {
                // Deduzir acompanhamentos do estoque
                if (Array.isArray(orderItem.addons)) {
                    orderItem.addons.forEach(addon => {
                        const stockId = String(addon.stockId || addon.stock_id || '');
                        const qtyToDeduct = safeNumber(addon.quantity) * safeNumber(orderItem.quantity);
                        const stockItem = estoqueAtual.find(s => String(s.id) === stockId);
                        if (stockItem && qtyToDeduct > 0) {
                            stockItem.quantity = Math.max(0, safeNumber(stockItem.quantity) - qtyToDeduct);
                        }
                    });
                }
            });
            
            STORE.set('estoque', estoqueAtual);
            estoque = estoqueAtual;
        }
        
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
    if (menuItemSelect) menuItemSelect.addEventListener('change', syncAddonsVisibility);
    if (addonsOptions) addonsOptions.addEventListener('change', onAddonToggle);
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
        syncAddonsVisibility();
    })();
});
