document.addEventListener('DOMContentLoaded', function () {
  const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;

  const STORE = window.APP_STORAGE;

  let menuItems = STORE.get('menuItems', [], ['menuItems']) || [];
  let deliveries = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
  let estoque = STORE.get('estoque', [], ['estoque']) || [];

  const grid = document.getElementById('delivery-grid');
  const emptyEl = document.getElementById('delivery-empty');
  const searchInput = document.getElementById('search-delivery-input');
  const statusFilter = document.getElementById('delivery-status-filter');
  const addBtn = document.getElementById('add-delivery-btn');

  const modal = document.getElementById('delivery-modal');
  const closeModalBtn = modal.querySelector('.close-btn');
  const form = document.getElementById('delivery-form');

  const modalTitle = document.getElementById('delivery-modal-title');
  const idInput = document.getElementById('delivery-id');
  const customerNameInput = document.getElementById('delivery-customer-name');
  const customerPhoneInput = document.getElementById('delivery-customer-phone');
  const customerAddressInput = document.getElementById('delivery-customer-address');
  const customerNeighborhoodInput = document.getElementById('delivery-customer-neighborhood');
  const customerReferenceInput = document.getElementById('delivery-customer-reference');
  const driverSelect = document.getElementById('delivery-driver');
  const statusSelect = document.getElementById('delivery-status');
  const feeInput = document.getElementById('delivery-fee');
  const discountInput = document.getElementById('delivery-discount');
  const paymentSelect = document.getElementById('delivery-payment');
  
  function populateDriverSelect() {
    if (!driverSelect) return;
    // Buscar usuários com função "Motoboy"
    const users = window.APP_STORAGE?.get('users', []) || [];
    const motoboys = users.filter(u => u.function === 'Motoboy' && u.status !== 'Inativo');
    driverSelect.innerHTML = '<option value="">Selecione o motoboy...</option>';
    motoboys.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name || m.username;
      opt.textContent = m.name || m.username;
      driverSelect.appendChild(opt);
    });
  }
  
  function populateStatusSelect() {
    const sel = document.getElementById('delivery-status');
    if (!sel) return;
    const statuses = window.CONFIG?.CONSTS?.ORDER_STATUS_DELIVERY
      || window.UTILS?.CONSTANTS?.ORDER_STATUS?.DELIVERY
      || ['Pendente','Em Preparo','Saiu para Entrega','Entregue','Pago','Cancelado'];
    (window.UTILS?.populateSelect ? window.UTILS.populateSelect(sel, statuses) : (() => {
      const current = sel.value; sel.innerHTML=''; statuses.forEach(s=>{const opt=document.createElement('option');opt.value=s;opt.textContent=s;sel.appendChild(opt);}); if(current) sel.value=current;
    })());
  }

  function populatePaymentSelect() {
    if (!paymentSelect) return;
    const methods = window.CONFIG?.CONSTS?.PAYMENT_METHODS
      || window.UTILS?.CONSTANTS?.PAYMENT_METHODS
      || ['Dinheiro','Cartão','PIX'];
    if (window.UTILS?.populateSelect) {
      window.UTILS.populateSelect(paymentSelect, methods, 'Selecione...');
    } else {
      const current = paymentSelect.value; paymentSelect.innerHTML='<option value="">Selecione...</option>'; methods.forEach(m=>{const opt=document.createElement('option');opt.value=m;opt.textContent=m;paymentSelect.appendChild(opt);}); if(current) paymentSelect.value=current;
    }
  }

  const menuItemSelect = document.getElementById('delivery-menu-item-select');
  const qtyInput = document.getElementById('delivery-item-quantity');
  const addItemBtn = document.getElementById('delivery-add-item-btn');
  const itemsContainer = document.getElementById('delivery-items-container');

  const addonsSection = document.getElementById('delivery-addons-section');
  const addonsOptions = document.getElementById('delivery-addons-options');
  const addonsCountEl = document.getElementById('delivery-addons-count');
  const ADDONS_MAX = 4;

  const subtotalEl = document.getElementById('delivery-subtotal');
  const totalEl = document.getElementById('delivery-total');
  const closeBtn = document.getElementById('delivery-close-btn');

  let currentItems = [];

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
    const base = `${menuItem?.category || ''} ${menuItem?.name || ''}`;
    const t = normalizeText(base);
    return ['pastel', 'hamburguer', 'crepe', 'tapioca'].some(k => t.includes(k));
  }

  function isAddonStockItem(stockItem) {
    const cat = normalizeText(stockItem?.category);
    return stockItem?.isAddon === true || stockItem?.is_addon === true || cat.includes('acomp');
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
    addonsOptions.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
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

  function renderAddonOptions(menuItem = null) {
    if (!addonsOptions) return;
    const opts = menuItem ? getAddonOptionsForMenuItem(menuItem) : getAddonStockOptions();
    if (opts.length === 0) {
      addonsOptions.innerHTML = '<div class="empty-message" style="margin:0;">Cadastre itens no estoque e marque como Acompanhamento.</div>';
      if (addonsCountEl) addonsCountEl.textContent = `0/${ADDONS_MAX}`;
      return;
    }

    addonsOptions.innerHTML = '';
    opts.forEach((s) => {
      const isOut = s.quantity <= 0;
      const label = document.createElement('label');
      label.className = `addon-option${isOut ? ' is-disabled' : ''}`;
      label.innerHTML = `
        <input type="checkbox" value="${String(s.id)}" ${(isOut) ? 'disabled' : ''}>
        <span class="addon-name">${String(s.name)}</span>
        <span class="addon-meta">${Number.isFinite(s.quantity) ? s.quantity : 0} ${String(s.unit)}</span>
      `;
      addonsOptions.appendChild(label);
    });

    updateAddonsLimitUI();
  }

  function getSelectedAddons() {
    if (!addonsSection || addonsSection.style.display === 'none' || !addonsOptions) return [];
    const checked = Array.from(addonsOptions.querySelectorAll('input[type="checkbox"]:checked'));
    const ids = checked.map(i => i.value).filter(Boolean);
    const opts = getAddonStockOptions();
    return ids.map(raw => {
      const match = opts.find(o => String(o.id) === String(raw));
      return match ? { stockId: match.id, name: match.name, quantity: 1 } : null;
    }).filter(Boolean);
  }

  function orderItemKey(menuItemId, addons = []) {
    const addonIds = (addons || []).map(a => String(a.stockId)).sort().join(',');
    return `${String(menuItemId)}|${addonIds}`;
  }

  function syncAddonsVisibility() {
    if (!addonsSection || !menuItemSelect) return;
    const selected = menuItemSelect.options[menuItemSelect.selectedIndex];
    const itemId = selected && selected.value ? Number(selected.value) : null;
    const menuItem = (Array.isArray(menuItems) ? menuItems : []).find(mi => Number(mi.id) === Number(itemId));
    const configuredIds = menuItem?.addonStockIds ?? menuItem?.addon_stock_ids;
    const hasConfigured = Array.isArray(configuredIds) && configuredIds.length > 0;
    const show = !!menuItem && (hasConfigured || menuItemAllowsAddons(menuItem));

    addonsSection.style.display = show ? 'block' : 'none';
    if (show) renderAddonOptions(menuItem);
    else clearAddonSelection();
    updateAddonsLimitUI();
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

  const formatBRL = window.CONFIG?.UTILS?.formatCurrency || ((v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

  function calcTotals() {
    const subtotal = currentItems.reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
    const fee = Number(feeInput.value) || 0;
    const discount = Number(discountInput.value) || 0;
    const total = Math.max(0, subtotal + fee - discount);
    return { subtotal, total, fee, discount };
  }

  function saveLocal() {
    // mantido por compatibilidade, mas preferimos salvar o conjunto completo via merge
    STORE.set('pedidos', deliveries);
  }

  async function loadData() {
    if (apiEnabled && window.API) {
      try {
        const [m, d] = await Promise.all([
          window.API.menu.list(),
          window.API.orders.listWithItems({ type: 'Delivery' })
        ]);
        menuItems = m || [];
        deliveries = d || [];

        try {
          estoque = await window.API.stock.list();
        } catch (e) {
          estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
        }
        return;
      } catch (e) {
        console.warn('Falha ao carregar via API, usando LocalStorage.', e);
      }
    }

    menuItems = STORE.get('menuItems', menuItems, ['menuItems']) || menuItems;
    deliveries = (STORE.get('pedidos', deliveries, ['pedidos', 'orders']) || deliveries).filter(o => (o.orderType || o.order_type) === 'Delivery');
    estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
  }

  function populateMenu() {
    menuItemSelect.innerHTML = '<option value="">Selecione um item...</option>';
    menuItems.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.name} - ${formatBRL(item.price)}`;
      opt.dataset.price = item.price;
      opt.dataset.name = item.name;
      menuItemSelect.appendChild(opt);
    });
  }

  function renderItems() {
    itemsContainer.innerHTML = '';
    if (currentItems.length === 0) {
      itemsContainer.innerHTML = '<p class="empty-message">Nenhum item adicionado.</p>';
    } else {
      currentItems.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'order-item-row';
        const addons = Array.isArray(it.addons) ? it.addons : [];
        const addonText = addons.length
          ? `<div class="order-item-addons">Acomp: ${addons.map(a => a.name).join(', ')}</div>`
          : '';
        row.innerHTML = `
          <div class="order-item-main"><span>${it.quantity}x ${it.name}</span>${addonText}</div>
          <span>${formatBRL(Number(it.price) * Number(it.quantity))}</span>
          <button type="button" class="btn-remove-item" data-index="${idx}" title="Remover item">&times;</button>
        `;
        itemsContainer.appendChild(row);
      });
    }
    const totals = calcTotals();
    subtotalEl.textContent = formatBRL(totals.subtotal);
    totalEl.textContent = formatBRL(totals.total);
  }

  function addItem() {
    const opt = menuItemSelect.options[menuItemSelect.selectedIndex];
    if (!opt || !opt.value) return;

    const itemId = parseInt(opt.value);
    const name = opt.dataset.name;
    const price = parseFloat(opt.dataset.price);
    const qty = parseInt(qtyInput.value);
    if (qty <= 0) return;

    const selectedAddons = getSelectedAddons();
    if (selectedAddons.length > ADDONS_MAX) return;

    const key = orderItemKey(itemId, selectedAddons);
    const existing = currentItems.find(i => i.key === key);
    if (existing) existing.quantity += qty;
    else currentItems.push({ key, id: itemId, name, price, quantity: qty, addons: selectedAddons });

    renderItems();
    menuItemSelect.value = '';
    qtyInput.value = 1;

    clearAddonSelection();
    syncAddonsVisibility();
  }

  function removeItem(e) {
    if (!e.target.classList.contains('btn-remove-item')) return;
    const idx = parseInt(e.target.dataset.index);
    currentItems.splice(idx, 1);
    renderItems();
  }

  function renderGrid(list) {
    grid.innerHTML = '';
    const has = list.length > 0;
    if (emptyEl) emptyEl.style.display = has ? 'none' : 'flex';

    const stats = { Pendentes: 0, 'Em Preparo': 0, Saiu: 0, Entregues: 0 };
    list.forEach(o => {
      if (o.status === 'Pendente') stats.Pendentes++;
      else if (o.status === 'Em Preparo') stats['Em Preparo']++;
      else if (o.status === 'Saiu para Entrega') stats.Saiu++;
      else if (o.status === 'Entregue' || o.status === 'Pago') stats.Entregues++;
    });
    const el = id => document.getElementById(id);
    if (el('delivery-pendentes')) el('delivery-pendentes').textContent = String(stats.Pendentes);
    if (el('delivery-preparo')) el('delivery-preparo').textContent = String(stats['Em Preparo']);
    if (el('delivery-saiu')) el('delivery-saiu').textContent = String(stats.Saiu);
    if (el('delivery-entregues')) el('delivery-entregues').textContent = String(stats.Entregues);

    // Cards estilo Mesas
    list.sort((a, b) => Number(b.id) - Number(a.id)).forEach(order => {
      const card = document.createElement('div');
      const statusClass = String(order.status || '').replace(/\s+/g, '-');
      card.className = `order-card ${statusClass}`;
      card.dataset.id = order.id;

      const headerTitle = order.customerName || order.customer_name || 'Cliente';
      const phone = order.customerPhone || order.customer_phone || '';
      const address = order.customerAddress || order.customer_address || '';
      const subtitle = [phone, address].filter(Boolean).join(' • ');

      const iconClass = (order.status === 'Cancelado')
        ? 'fa-ban'
        : (order.status === 'Saiu para Entrega')
          ? 'fa-truck'
          : (order.status === 'Em Preparo')
            ? 'fa-fire'
            : 'fa-motorcycle';

      card.innerHTML = `
        <i class="fas ${iconClass} order-icon"></i>
        <h3>${headerTitle}</h3>
        <p>#${String(order.id).padStart(4, '0')}${subtitle ? ' • ' + subtitle : ''}</p>
        <div class="order-status-text">${order.status}</div>
        <div class="order-total-price">${formatBRL(order.total)}</div>
      `;
      grid.appendChild(card);
    });
  }

  function filterAndRender() {
    const term = (searchInput.value || '').toLowerCase();
    const status = statusFilter.value;

    const filtered = (deliveries || []).filter(o => {
      const idStr = String(o.id || '');
      const name = String(o.customerName || o.customer_name || '').toLowerCase();
      const phone = String(o.customerPhone || o.customer_phone || '').toLowerCase();
      const matchesSearch = !term || idStr.includes(term) || name.includes(term) || phone.includes(term);
      const matchesStatus = status === 'all' || o.status === status;
      return matchesSearch && matchesStatus;
    });

    renderGrid(filtered);
  }

  function openModal(order = null) {
    form.reset();
    populateMenu();
    populateStatusSelect();
    populatePaymentSelect();
    populateDriverSelect();
    const errEl = document.getElementById('delivery-form-error');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    currentItems = [];

    if (order) {
      modalTitle.textContent = 'Editar Delivery';
      idInput.value = order.id;
      customerNameInput.value = order.customerName || order.customer_name || '';
      customerPhoneInput.value = order.customerPhone || order.customer_phone || '';
      customerAddressInput.value = order.customerAddress || order.customer_address || '';
      customerNeighborhoodInput.value = order.customerNeighborhood || order.customer_neighborhood || '';
      customerReferenceInput.value = order.customerReference || order.customer_reference || '';
      driverSelect.value = order.deliveryDriver || order.delivery_driver || '';
      statusSelect.value = order.status || 'Pendente';
      feeInput.value = Number(order.deliveryFee ?? order.delivery_fee ?? 0);
      discountInput.value = Number(order.discount ?? 0);
      paymentSelect.value = order.paymentMethod || order.payment_method || '';
      currentItems = JSON.parse(JSON.stringify(order.items || []));

      const isClosable = order.status !== 'Pago' && order.status !== 'Cancelado';
      closeBtn.style.display = isClosable ? 'inline-flex' : 'none';
    } else {
      modalTitle.textContent = 'Novo Delivery';
      idInput.value = '';
      statusSelect.value = 'Pendente';
      feeInput.value = 0;
      discountInput.value = 0;
      paymentSelect.value = '';
      closeBtn.style.display = 'none';
    }

    renderItems();
    syncAddonsVisibility();
    modal.classList.add('show');
  }

  function closeModal() {
    modal.classList.remove('show');
  }

  async function submit(e) {
    e.preventDefault();
    const errEl = document.getElementById('delivery-form-error');
    const showError = (msg) => { if (errEl) { errEl.textContent = String(msg || 'Erro'); errEl.style.display = 'block'; } };
    if (currentItems.length === 0) {
      showError('Adicione pelo menos um item ao delivery.');
      return;
    }

    const totals = calcTotals();
    const payload = {
      orderType: 'Delivery',
      status: statusSelect.value,
      customerName: customerNameInput.value,
      customerPhone: customerPhoneInput.value,
      customerAddress: customerAddressInput.value,
      customerNeighborhood: customerNeighborhoodInput.value,
      customerReference: customerReferenceInput.value,
      deliveryDriver: driverSelect.value,
      deliveryFee: totals.fee,
      discount: totals.discount,
      paymentMethod: paymentSelect.value,
      items: currentItems.map(it => ({
        menuItemId: it.id,
        quantity: it.quantity,
        price: it.price,
        addons: (Array.isArray(it.addons) ? it.addons : []).map(a => ({ stockId: a.stockId, quantity: a.quantity || 1 }))
      }))
    };

    const id = idInput.value ? Number(idInput.value) : null;

    if (apiEnabled && window.API) {
      try {
        if (id) {
          await window.API.orders.update(id, payload);
        } else {
          await window.API.orders.create(payload);
        }
        deliveries = await window.API.orders.listWithItems({ type: 'Delivery' });
        filterAndRender();
        closeModal();
      } catch (e) {
        const msg = (e && e.details && (e.details.error || e.details.message)) ? (e.details.error || e.details.message) : 'Erro ao salvar delivery via API.';
        showError(msg);
      }
      return;
    }

    // LocalStorage + Baixa de Estoque
    const now = new Date().toISOString();
    const order = {
      id: id || Date.now(),
      orderType: 'Delivery',
      status: payload.status,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerAddress: payload.customerAddress,
      customerNeighborhood: payload.customerNeighborhood,
      customerReference: payload.customerReference,
      deliveryDriver: payload.deliveryDriver,
      paymentMethod: payload.paymentMethod,
      deliveryFee: payload.deliveryFee,
      discount: payload.discount,
      subtotal: totals.subtotal,
      total: totals.total,
      items: currentItems,
      data: now,
      paidAt: payload.status === 'Pago' ? now : null
    };

    // BAIXA AUTOMÁTICA DE ESTOQUE (igual aos pedidos)
    if (!id) { // Apenas para pedidos novos
      const estoqueLocal = STORE.get('estoque', [], ['estoque', 'stock']) || [];

      const needed = new Map();
      const safeNumber = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      (currentItems || []).forEach(item => {
        // Produto base (mantém regra antiga: baixa se existir item de estoque com mesmo id)
        const baseStock = (estoqueLocal || []).find(s => Number(s.id) === Number(item.id));
        if (baseStock) {
          needed.set(String(baseStock.id), (needed.get(String(baseStock.id)) || 0) + safeNumber(item.quantity || 0));
        }

        // Acompanhamentos
        const addons = Array.isArray(item.addons) ? item.addons : [];
        addons.forEach(a => {
          const k = String(a.stockId);
          const prev = needed.get(k) || 0;
          needed.set(k, prev + (safeNumber(item.quantity) || 1) * (safeNumber(a.quantity) || 1));
        });
      });

      for (const [stockId, qNeed] of needed.entries()) {
        const stockItem = (estoqueLocal || []).find(s => String(s.id) === String(stockId));
        if (!stockItem) {
          showError(`Item de estoque não encontrado (ID: ${stockId}).`);
          return;
        }
        const have = safeNumber(stockItem.quantity ?? stockItem.quantidade ?? 0);
        if (have < qNeed) {
          showError(`Estoque insuficiente para "${stockItem.name || 'item'}". Disponível: ${have} — Necessário: ${qNeed}.`);
          return;
        }
      }

      const estoqueNovo = (estoqueLocal || []).map(s => {
        const key = String(s.id);
        const dec = needed.get(key) || 0;
        if (!dec) return s;
        const have = safeNumber(s.quantity ?? s.quantidade ?? 0);
        const next = Math.max(0, have - dec);
        if (s.quantity !== undefined) return { ...s, quantity: next };
        return { ...s, quantidade: next };
      });

      STORE.set('estoque', estoqueNovo);
    }

    const allOrders = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
    const merged = id ? allOrders.map(o => (o.id === id ? order : o)) : [...allOrders, order];
    STORE.set('pedidos', merged);

    deliveries = merged.filter(o => (o.orderType || o.order_type) === 'Delivery');
    filterAndRender();
    closeModal();
  }

  async function closeAccount() {
    const id = Number(idInput.value);
    if (!id) return;

    const paymentMethod = paymentSelect.value || 'Dinheiro';
    const totals = calcTotals();

    if (apiEnabled && window.API) {
      try {
        await window.API.orders.close(id, { paymentMethod, discount: totals.discount, deliveryFee: totals.fee });
        deliveries = await window.API.orders.listWithItems({ type: 'Delivery' });
        filterAndRender();
        closeModal();
        window.open(`cupom.html?orderId=${encodeURIComponent(String(id))}`, '_blank');
      } catch (e) {
        const errEl = document.getElementById('delivery-form-error');
        if (errEl) { errEl.textContent = 'Erro ao fechar conta via API.'; errEl.style.display = 'block'; }
      }
      return;
    }

    const allOrders = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
    const now = new Date().toISOString();
    const updated = allOrders.map(o => {
      if (o.id !== id) return o;
      return { ...o, status: 'Pago', paymentMethod, discount: totals.discount, deliveryFee: totals.fee, subtotal: totals.subtotal, total: totals.total, paidAt: now };
    });
    STORE.set('pedidos', updated);

    // Gera transação de receita no financeiro
    const transacoes = STORE.get('transacoes', [], ['transacoes']) || [];
    transacoes.push({
      id: String(Date.now()),
      descricao: `Pedido #${String(id).padStart(4, '0')} (Delivery)`,
      valor: totals.total,
      tipo: 'Receita',
      data: new Date().toISOString().slice(0, 10),
      status: 'pago'
    });
    STORE.set('transacoes', transacoes);

    deliveries = updated.filter(o => (o.orderType || o.order_type) === 'Delivery');
    filterAndRender();
    closeModal();
    window.open(`cupom.html?orderId=${encodeURIComponent(String(id))}`, '_blank');
  }

  function handleGridClick(e) {
    const card = e.target.closest('.order-card');
    if (!card) return;
    const id = Number(card.dataset.id);
    const order = (deliveries || []).find(o => Number(o.id) === id);
    if (order) openModal(order);
  }

  // Listeners
  searchInput.addEventListener('input', filterAndRender);
  statusFilter.addEventListener('change', filterAndRender);
  addBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  addItemBtn.addEventListener('click', addItem);
  if (menuItemSelect) menuItemSelect.addEventListener('change', syncAddonsVisibility);
  if (addonsOptions) addonsOptions.addEventListener('change', onAddonToggle);
  itemsContainer.addEventListener('click', removeItem);
  feeInput.addEventListener('input', renderItems);
  discountInput.addEventListener('input', renderItems);
  form.addEventListener('submit', submit);
  closeBtn.addEventListener('click', closeAccount);
  grid.addEventListener('click', handleGridClick);

  (async () => {
    await loadData();
    populateMenu();
    filterAndRender();
  })();
});

