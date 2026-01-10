document.addEventListener('DOMContentLoaded', function () {
  const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;

  let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
  let deliveries = JSON.parse(localStorage.getItem('pedidos')) || [];

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
  const statusSelect = document.getElementById('delivery-status');
  const feeInput = document.getElementById('delivery-fee');
  const discountInput = document.getElementById('delivery-discount');
  const paymentSelect = document.getElementById('delivery-payment');

  const menuItemSelect = document.getElementById('delivery-menu-item-select');
  const qtyInput = document.getElementById('delivery-item-quantity');
  const addItemBtn = document.getElementById('delivery-add-item-btn');
  const itemsContainer = document.getElementById('delivery-items-container');

  const subtotalEl = document.getElementById('delivery-subtotal');
  const totalEl = document.getElementById('delivery-total');
  const closeBtn = document.getElementById('delivery-close-btn');

  let currentItems = [];

  function formatBRL(v) {
    if (window.CONFIG && window.CONFIG.UTILS && typeof window.CONFIG.UTILS.formatCurrency === 'function') {
      return window.CONFIG.UTILS.formatCurrency(Number(v) || 0);
    }
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function calcTotals() {
    const subtotal = currentItems.reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
    const fee = Number(feeInput.value) || 0;
    const discount = Number(discountInput.value) || 0;
    const total = Math.max(0, subtotal + fee - discount);
    return { subtotal, total, fee, discount };
  }

  function saveLocal() {
    localStorage.setItem('pedidos', JSON.stringify(deliveries));
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
        return;
      } catch (e) {
        console.warn('Falha ao carregar via API, usando LocalStorage.', e);
      }
    }

    menuItems = JSON.parse(localStorage.getItem('menuItems')) || menuItems;
    deliveries = (JSON.parse(localStorage.getItem('pedidos')) || deliveries).filter(o => (o.orderType || o.order_type) === 'Delivery');
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
        row.innerHTML = `
          <span>${it.quantity}x ${it.name}</span>
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

    const existing = currentItems.find(i => i.id === itemId);
    if (existing) existing.quantity += qty;
    else currentItems.push({ id: itemId, name, price, quantity: qty });

    renderItems();
    menuItemSelect.value = '';
    qtyInput.value = 1;
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
      else if (o.status === 'Entregue') stats.Entregues++;
    });
    const el = id => document.getElementById(id);
    if (el('delivery-pendentes')) el('delivery-pendentes').textContent = String(stats.Pendentes);
    if (el('delivery-preparo')) el('delivery-preparo').textContent = String(stats['Em Preparo']);
    if (el('delivery-saiu')) el('delivery-saiu').textContent = String(stats.Saiu);
    if (el('delivery-entregues')) el('delivery-entregues').textContent = String(stats.Entregues);

    list.sort((a, b) => Number(b.id) - Number(a.id)).forEach(order => {
      const card = document.createElement('div');
      card.className = 'order-card';
      card.dataset.id = order.id;

      const itemsHtml = (order.items || []).map(item => `
        <li>
          <span class="item-name">${item.quantity}x ${item.name}</span>
          <span class="item-price">${formatBRL(Number(item.price) * Number(item.quantity))}</span>
        </li>
      `).join('');

      const headerTitle = order.customerName || order.customer_name || 'Cliente';
      const phone = order.customerPhone || order.customer_phone || '';
      const address = order.customerAddress || order.customer_address || '';
      const statusClass = String(order.status || '').replace(/\s+/g, '-');

      card.innerHTML = `
        <div class="order-card-header">
          <div>
            <h3>${headerTitle}</h3>
            <div class="delivery-subtitle">${phone}${phone && address ? ' • ' : ''}${address}</div>
          </div>
          <span class="order-id">#${String(order.id).padStart(4, '0')}</span>
        </div>
        <div class="order-card-body">
          <ul>${itemsHtml}</ul>
        </div>
        <div class="order-card-footer">
          <span class="order-total-price">${formatBRL(order.total)}</span>
          <span class="order-status ${statusClass}">${order.status}</span>
        </div>
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
    currentItems = [];

    if (order) {
      modalTitle.textContent = 'Editar Delivery';
      idInput.value = order.id;
      customerNameInput.value = order.customerName || order.customer_name || '';
      customerPhoneInput.value = order.customerPhone || order.customer_phone || '';
      customerAddressInput.value = order.customerAddress || order.customer_address || '';
      customerNeighborhoodInput.value = order.customerNeighborhood || order.customer_neighborhood || '';
      customerReferenceInput.value = order.customerReference || order.customer_reference || '';
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
    modal.classList.add('show');
  }

  function closeModal() {
    modal.classList.remove('show');
  }

  async function submit(e) {
    e.preventDefault();
    if (currentItems.length === 0) {
      alert('Adicione pelo menos um item ao delivery.');
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
      deliveryFee: totals.fee,
      discount: totals.discount,
      paymentMethod: paymentSelect.value,
      items: currentItems.map(it => ({ menuItemId: it.id, quantity: it.quantity, price: it.price }))
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
      } catch {
        alert('Erro ao salvar delivery via API.');
      }
      return;
    }

    // LocalStorage
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
      paymentMethod: payload.paymentMethod,
      deliveryFee: payload.deliveryFee,
      discount: payload.discount,
      subtotal: totals.subtotal,
      total: totals.total,
      items: currentItems,
      data: now,
      paidAt: payload.status === 'Pago' ? now : null
    };

    const allOrders = JSON.parse(localStorage.getItem('pedidos')) || [];
    const merged = id ? allOrders.map(o => (o.id === id ? order : o)) : [...allOrders, order];
    localStorage.setItem('pedidos', JSON.stringify(merged));

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
      } catch {
        alert('Erro ao fechar conta via API.');
      }
      return;
    }

    const allOrders = JSON.parse(localStorage.getItem('pedidos')) || [];
    const now = new Date().toISOString();
    const updated = allOrders.map(o => {
      if (o.id !== id) return o;
      return { ...o, status: 'Pago', paymentMethod, discount: totals.discount, deliveryFee: totals.fee, subtotal: totals.subtotal, total: totals.total, paidAt: now };
    });
    localStorage.setItem('pedidos', JSON.stringify(updated));

    // Gera transação de receita no financeiro
    const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
    transacoes.push({
      id: String(Date.now()),
      descricao: `Pedido #${String(id).padStart(4, '0')} (Delivery)`,
      valor: totals.total,
      tipo: 'Receita',
      data: new Date().toISOString().slice(0, 10),
      status: 'pago'
    });
    localStorage.setItem('transacoes', JSON.stringify(transacoes));

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

