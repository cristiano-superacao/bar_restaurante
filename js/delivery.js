document.addEventListener('DOMContentLoaded', function () {
  const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;

  const STORE = window.APP_STORAGE;

  let menuItems = STORE.get('menuItems', [], ['menuItems']) || [];
  let deliveries = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
  let estoque = STORE.get('estoque', [], ['estoque']) || [];
  let motoboys = STORE.get('motoboys', [], ['motoboys','drivers']) || [];

  const grid = document.getElementById('delivery-grid');
  const emptyEl = document.getElementById('delivery-empty');
  const searchInput = document.getElementById('search-delivery-input');
  const statusFilter = document.getElementById('delivery-status-filter');
  const addBtn = document.getElementById('add-delivery-btn');

  // Motoboy Manager elements
  const motoboyListEl = document.getElementById('motoboy-list');
  const motoboyAddBtn = document.getElementById('motoboy-add-btn');
  const motoboyModal = document.getElementById('motoboy-modal');
  const motoboyForm = document.getElementById('motoboy-form');
  const motoboyModalTitle = document.getElementById('motoboy-modal-title');
  const motoboyIdInput = document.getElementById('motoboy-id');
  const motoboyNameInput = document.getElementById('motoboy-name');
  const motoboyPhoneInput = document.getElementById('motoboy-phone');
  const motoboyUsernameInput = document.getElementById('motoboy-username');
  const motoboyEmailInput = document.getElementById('motoboy-email');
  const motoboyPasswordInput = document.getElementById('motoboy-password');
  const motoboyStatusSelect = document.getElementById('motoboy-status');

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
  
  function getMotoboyById(id) {
    if (!id) return null;
    return (motoboys || []).find(m => String(m.id) === String(id)) || null;
  }

  function getMotoboyDisplayName(m) {
    if (!m) return '';
    return String(m.name || m.username || m.email || '').trim();
  }

  function getOrderMotoboyId(order) {
    const id = order?.deliveryDriverId ?? order?.delivery_driver_id ?? order?.delivery_driverId;
    if (id !== undefined && id !== null && String(id).trim() !== '') return String(id);

    const legacyName = String(order?.deliveryDriver || order?.delivery_driver || '').trim();
    if (!legacyName) return '';
    const found = (motoboys || []).find(m => {
      const n = getMotoboyDisplayName(m);
      return n && n.toLowerCase() === legacyName.toLowerCase();
    });
    return found ? String(found.id) : '';
  }

  function getOrderMotoboyName(order) {
    const direct = String(order?.deliveryDriverName || order?.delivery_driver_name || '').trim();
    if (direct) return direct;
    const byId = getMotoboyById(getOrderMotoboyId(order));
    const fromId = getMotoboyDisplayName(byId);
    if (fromId) return fromId;
    return String(order?.deliveryDriver || order?.delivery_driver || '').trim();
  }

  function isOrderOpenForDriver(status) {
    const s = String(status || '').trim();
    return s && !['Entregue', 'Pago', 'Cancelado'].includes(s);
  }

  function motoboyIsInUse(motoboy) {
    if (!motoboy) return false;
    const idStr = String(motoboy.id);
    const name = getMotoboyDisplayName(motoboy);
    return (deliveries || []).some(o => {
      const oid = String(o?.deliveryDriverId ?? o?.delivery_driver_id ?? '');
      if (oid && oid === idStr) return true;
      const legacy = String(o?.deliveryDriver || o?.delivery_driver || '');
      return legacy && name && legacy.toLowerCase() === name.toLowerCase();
    });
  }

  function motoboyHasOpenDeliveries(motoboy) {
    if (!motoboy) return false;
    const idStr = String(motoboy.id);
    const name = getMotoboyDisplayName(motoboy);
    return (deliveries || []).some(o => {
      const status = o?.status;
      if (!isOrderOpenForDriver(status)) return false;
      const oid = String(o?.deliveryDriverId ?? o?.delivery_driver_id ?? '');
      if (oid && oid === idStr) return true;
      const legacy = String(o?.deliveryDriver || o?.delivery_driver || '');
      return legacy && name && legacy.toLowerCase() === name.toLowerCase();
    });
  }
  
  function populateDriverSelect(currentOrder = null) {
    if (!driverSelect) return;
    const currentId = currentOrder ? getOrderMotoboyId(currentOrder) : String(driverSelect.value || '').trim();
    // Preferir lista local de motoboys; fallback para usuários com função 'Motoboy'
    let list = Array.isArray(motoboys) ? motoboys : [];
    if (!list || list.length === 0) {
      const users = window.APP_STORAGE?.get('users', []) || [];
      list = users
        .filter(u => u.function === 'Motoboy' && u.status !== 'Inativo')
        .map(u => ({ id: u.id || String(Date.now()), name: u.name || u.username, phone: u.phone || '', status: u.status || 'Ativo' }));
    }
    driverSelect.innerHTML = '<option value="">Selecione o motoboy...</option>';

    const active = (list || []).filter(m => String(m.status || 'Ativo') !== 'Inativo');
    active.forEach(m => {
      const opt = document.createElement('option');
      opt.value = String(m.id);
      opt.textContent = getMotoboyDisplayName(m);
      driverSelect.appendChild(opt);
    });

    // Se estiver editando um delivery que já tem motoboy inativo, manter visível/selecionado
    if (currentId && !active.some(m => String(m.id) === String(currentId))) {
      const inactive = (list || []).find(m => String(m.id) === String(currentId));
      if (inactive) {
        const opt = document.createElement('option');
        opt.value = String(inactive.id);
        opt.textContent = `${getMotoboyDisplayName(inactive)} (Inativo)`;
        opt.disabled = true;
        driverSelect.appendChild(opt);
      }
    }

    if (currentId) driverSelect.value = String(currentId);
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

  // Motoboy CRUD (LocalStorage)
  async function loadMotoboys() {
    if (apiEnabled && window.API) {
      try {
        const users = await window.API.users.list();
        const list = (users || []).filter(u => String(u.function || '').toLowerCase() === 'motoboy');
        motoboys = list.map(u => ({
          id: u.id,
          name: u.name || u.username || u.email || '',
          phone: u.phone || '',
          status: (u.active === false) ? 'Inativo' : 'Ativo'
        }));
        return;
      } catch (e) {
        console.warn('Falha ao carregar motoboys via API, usando LocalStorage.', e);
      }
    }
    motoboys = STORE.get('motoboys', motoboys, ['motoboys','drivers']) || motoboys;
  }
  function saveMotoboys() {
    STORE.set('motoboys', motoboys);
  }
  function renderMotoboys() {
    if (!motoboyListEl) return;
    motoboyListEl.innerHTML = '';
    const list = Array.isArray(motoboys) ? motoboys : [];
    if (list.length === 0) {
      motoboyListEl.innerHTML = '<div class="empty-message">Nenhum motoboy cadastrado.</div>';
      return;
    }
    list.forEach(m => {
      const isActive = (m.status || 'Ativo') === 'Ativo';
      const toggleLabel = isActive ? 'Inativar' : 'Ativar';
      const card = document.createElement('div');
      card.className = 'data-list-item';
      card.innerHTML = `
        <div class=\"data-list-main\">
          <div class=\"data-list-title\">${String(m.name || '')}</div>
          <div class=\"data-list-sub\">
            <span class=\"badge ${isActive ? 'badge-success' : 'badge-muted'}\">${m.status || 'Ativo'}</span>
            ${m.phone ? `<span class=\"muted\">${m.phone}</span>` : ''}
          </div>
        </div>
        <div class=\"data-list-actions\">
          <button class=\"btn btn-secondary\" data-action=\"edit\" data-id=\"${String(m.id)}\">Editar</button>
          <button class=\"btn btn-secondary\" data-action=\"toggle\" data-id=\"${String(m.id)}\">${toggleLabel}</button>
          <button class=\"btn btn-secondary\" data-action=\"delete\" data-id=\"${String(m.id)}\">Excluir</button>
        </div>
      `;
      motoboyListEl.appendChild(card);
    });
  }
  function openMotoboyModal(m = null) {
    if (!motoboyModal || !motoboyForm) return;
    motoboyForm.reset();
    if (m) {
      motoboyModalTitle.textContent = 'Editar Motoboy';
      motoboyIdInput.value = String(m.id);
      motoboyNameInput.value = m.name || '';
      motoboyPhoneInput.value = m.phone || '';
      motoboyStatusSelect.value = m.status || 'Ativo';
      if (motoboyUsernameInput) motoboyUsernameInput.value = m.username || '';
      if (motoboyEmailInput) motoboyEmailInput.value = m.email || '';
    } else {
      motoboyModalTitle.textContent = 'Novo Motoboy';
      motoboyIdInput.value = '';
      motoboyStatusSelect.value = 'Ativo';
    }
    motoboyModal.classList.add('show');
  }
  function closeMotoboyModal() { if (motoboyModal) motoboyModal.classList.remove('show'); }
  async function submitMotoboy(e) {
    e.preventDefault();
    const idRaw = motoboyIdInput.value ? motoboyIdInput.value : '';
    const rec = {
      id: idRaw ? (Number(idRaw) || idRaw) : String(Date.now()),
      name: motoboyNameInput.value.trim(),
      phone: motoboyPhoneInput.value.trim(),
      status: motoboyStatusSelect.value || 'Ativo'
    };
    if (!rec.name) return;

    // Criação via API (requer username, email, password)
    if (apiEnabled && window.API && !idRaw) {
      const username = ((motoboyUsernameInput?.value || '').trim()) || createUsernameFromName(rec.name);
      const email = ((motoboyEmailInput?.value || '').trim()) || createEmailFromUsername(username);
      const password = (motoboyPasswordInput?.value || '').trim();
      if (!username || !email || !password || password.length < 6) {
        if (window.UTILS?.notify) window.UTILS.notify('Para criar via API, informe usuário, email e senha (mín. 6 caracteres).', 'error');
        else alert('Para criar via API, informe usuário, email e senha (mín. 6 caracteres).');
      } else {
        try {
          await window.API.users.create({ username, email, password, role: 'staff', function: 'Motoboy' });
          await loadMotoboys();
          renderMotoboys();
          populateDriverSelect();
          closeMotoboyModal();
          return;
        } catch (err) {
          console.warn('Falha ao criar motoboy via API, mantendo operação local.', err);
        }
      }
    }

    if (apiEnabled && window.API && idRaw) {
      try {
        await window.API.users.update(Number(idRaw), { function: 'Motoboy', active: rec.status === 'Ativo' });
        await loadMotoboys();
        renderMotoboys();
        populateDriverSelect();
        closeMotoboyModal();
        return;
      } catch (err) {
        console.warn('Falha ao atualizar motoboy via API, mantendo alteração local.', err);
      }
    }

    const exists = Array.isArray(motoboys) && motoboys.some(x => String(x.id) === String(rec.id));
    motoboys = exists ? motoboys.map(x => (String(x.id) === String(rec.id) ? rec : x)) : [...(motoboys || []), rec];
    saveMotoboys();
    renderMotoboys();
    populateDriverSelect();
    closeMotoboyModal();
  }
  async function handleMotoboyListClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.action;
    if (!id || !act) return;
    const m = (motoboys || []).find(x => String(x.id) === String(id));
    if (act === 'edit') { openMotoboyModal(m); return; }
    if (act === 'toggle') {
      if (!m) return;
      const nextStatus = (m.status || 'Ativo') === 'Ativo' ? 'Inativo' : 'Ativo';
      if (nextStatus === 'Inativo' && motoboyHasOpenDeliveries(m)) {
        if (window.UTILS?.notify) window.UTILS.notify('Não é possível inativar: motoboy vinculado a deliveries em aberto.', 'error');
        else alert('Não é possível inativar: motoboy vinculado a deliveries em aberto.');
        return;
      }

      if (apiEnabled && window.API && id && !isNaN(Number(id))) {
        try {
          await window.API.users.update(Number(id), { function: 'Motoboy', active: nextStatus === 'Ativo' });
          await loadMotoboys();
          renderMotoboys();
          populateDriverSelect();
          return;
        } catch (err) {
          console.warn('Falha ao alterar status via API, mantendo alteração local.', err);
        }
      }

      motoboys = (motoboys || []).map(x => (String(x.id) === String(id) ? { ...x, status: nextStatus } : x));
      saveMotoboys();
      renderMotoboys();
      populateDriverSelect();
      return;
    }
    if (act === 'delete') {
      if (!m) return;
      if (motoboyIsInUse(m)) {
        if (window.UTILS?.notify) window.UTILS.notify('Não é possível excluir: motoboy já vinculado a deliveries. Inative ao invés de excluir.', 'error');
        else alert('Não é possível excluir: motoboy já vinculado a deliveries. Inative ao invés de excluir.');
        return;
      }
      if (!confirm(`Excluir motoboy "${getMotoboyDisplayName(m)}"?`)) return;

      if (apiEnabled && window.API && id && !isNaN(Number(id))) {
        try {
          await window.API.users.remove(Number(id));
          await loadMotoboys();
          renderMotoboys();
          populateDriverSelect();
          return;
        } catch (err) {
          console.warn('Falha ao excluir motoboy via API, removendo apenas localmente.', err);
        }
      }
      motoboys = (motoboys || []).filter(x => String(x.id) !== String(id));
      saveMotoboys();
      renderMotoboys();
      populateDriverSelect();
      return;
    }
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
  const ADDONS_MAX = Number(window.CONFIG?.CONSTS?.ADDONS_MAX ?? 4);

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
  function createUsernameFromName(name) {
    const base = normalizeText(name || '');
    let slug = base.replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    slug = slug.replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
    return slug;
  }
  function getCompanyDomain() {
    try {
      const companyName = localStorage.getItem('activeCompanyName') || (window.CONFIG?.APP?.name || 'empresa');
      const base = normalizeText(companyName);
      const slug = base.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      return (slug || 'empresa') + '.local';
    } catch { return 'empresa.local'; }
  }
  function createEmailFromUsername(username) {
    const user = String(username || '').trim().toLowerCase();
    const safeUser = user.replace(/[^a-z0-9.]/g, '').replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
    return `${safeUser}@${getCompanyDomain()}`;
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
    const qtyEls = addonsOptions.querySelectorAll('.addon-qty');
    qtyEls.forEach(el => { el.textContent = '0'; });
    updateAddonsLimitUI();
  }

  function updateAddonsLimitUI() {
    if (!addonsOptions) return;
    const options = Array.from(addonsOptions.querySelectorAll('.addon-option'));
    const totalQty = options.reduce((sum, opt) => {
      const qEl = opt.querySelector('.addon-qty');
      const q = qEl ? Number(qEl.textContent || 0) : 0;
      return sum + (Number.isFinite(q) ? q : 0);
    }, 0);
    if (addonsCountEl) addonsCountEl.textContent = `${totalQty}/${ADDONS_MAX}`;

    const remaining = Math.max(0, ADDONS_MAX - totalQty);
    options.forEach((opt) => {
      const incBtn = opt.querySelector('.addon-qty-btn.inc');
      const decBtn = opt.querySelector('.addon-qty-btn.dec');
      const qEl = opt.querySelector('.addon-qty');
      const q = qEl ? Number(qEl.textContent || 0) : 0;

      if (incBtn) incBtn.disabled = remaining <= 0;
      if (decBtn) decBtn.disabled = q <= 0;
      opt.classList.toggle('is-locked', remaining <= 0 && q > 0);
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
      const wrap = document.createElement('div');
      wrap.className = `addon-option${isOut ? ' is-disabled' : ''}`;
      wrap.dataset.stockId = String(s.id);
      wrap.innerHTML = `
        <span class="addon-name">${String(s.name)}</span>
        <span class="addon-meta">${Number.isFinite(s.quantity) ? s.quantity : 0} ${String(s.unit)}</span>
        <div class="addon-qty-controls">
          <button type="button" class="addon-qty-btn dec" aria-label="Remover" ${(isOut) ? 'disabled' : ''}>−</button>
          <span class="addon-qty">0</span>
          <button type="button" class="addon-qty-btn inc" aria-label="Adicionar" ${(isOut) ? 'disabled' : ''}>+</button>
        </div>
      `;
      addonsOptions.appendChild(wrap);
    });

    updateAddonsLimitUI();
  }

  function getSelectedAddons() {
    if (!addonsSection || addonsSection.style.display === 'none' || !addonsOptions) return [];
    const opts = getAddonStockOptions();
    const selected = [];
    const nodes = Array.from(addonsOptions.querySelectorAll('.addon-option'));
    nodes.forEach((n) => {
      const qEl = n.querySelector('.addon-qty');
      const qty = qEl ? Number(qEl.textContent || 0) : 0;
      if (!qty) return;
      const stockId = n.dataset.stockId;
      const match = opts.find(o => String(o.id) === String(stockId));
      if (match) selected.push({ stockId: match.id, name: match.name, quantity: qty });
    });
    return selected;
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
    if (show) {
      const titleEl = addonsSection.querySelector('.addons-title');
      if (titleEl) titleEl.textContent = `Acompanhamentos (até ${ADDONS_MAX})`;
      renderAddonOptions(menuItem);
    }
    else clearAddonSelection();
    updateAddonsLimitUI();
  }

  function onAddonQtyClick(e) {
    const btn = e.target.closest('.addon-qty-btn');
    if (!btn) return;
    const opt = btn.closest('.addon-option');
    const qEl = opt ? opt.querySelector('.addon-qty') : null;
    if (!qEl) return;

    const options = Array.from(addonsOptions.querySelectorAll('.addon-option'));
    const totalQty = options.reduce((sum, o) => {
      const el = o.querySelector('.addon-qty');
      const q = el ? Number(el.textContent || 0) : 0;
      return sum + (Number.isFinite(q) ? q : 0);
    }, 0);
    const remaining = Math.max(0, ADDONS_MAX - totalQty);
    const current = Number(qEl.textContent || 0);

    if (btn.classList.contains('inc')) {
      if (remaining <= 0) return;
      qEl.textContent = String(current + 1);
    } else {
      if (current <= 0) return;
      qEl.textContent = String(current - 1);
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
      const driver = getOrderMotoboyName(order);
      const subtitle = [phone, address, (driver ? `Motoboy: ${driver}` : '')].filter(Boolean).join(' • ');

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
    populateDriverSelect(order);
    if (window.UTILS?.formError) window.UTILS.formError.clear('delivery-form-error');
    else {
      const errEl = document.getElementById('delivery-form-error');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    }
    currentItems = [];

    if (order) {
      modalTitle.textContent = 'Editar Delivery';
      idInput.value = order.id;
      customerNameInput.value = order.customerName || order.customer_name || '';
      customerPhoneInput.value = order.customerPhone || order.customer_phone || '';
      customerAddressInput.value = order.customerAddress || order.customer_address || '';
      customerNeighborhoodInput.value = order.customerNeighborhood || order.customer_neighborhood || '';
      customerReferenceInput.value = order.customerReference || order.customer_reference || '';
      driverSelect.value = getOrderMotoboyId(order) || '';
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
    const showError = (msg) => {
      if (window.UTILS?.formError) window.UTILS.formError.show(errEl, msg);
      else if (errEl) { errEl.textContent = String(msg || 'Erro'); errEl.style.display = 'block'; }
    };
    if (currentItems.length === 0) {
      showError('Adicione pelo menos um item ao delivery.');
      return;
    }

    const selectedDriverId = String(driverSelect.value || '').trim();
    const selectedMotoboy = selectedDriverId ? getMotoboyById(selectedDriverId) : null;
    const selectedDriverName = selectedMotoboy ? getMotoboyDisplayName(selectedMotoboy) : '';

    const totals = calcTotals();
    const payload = {
      orderType: 'Delivery',
      status: statusSelect.value,
      customerName: customerNameInput.value,
      customerPhone: customerPhoneInput.value,
      customerAddress: customerAddressInput.value,
      customerNeighborhood: customerNeighborhoodInput.value,
      customerReference: customerReferenceInput.value,
      deliveryDriverId: selectedDriverId || null,
      deliveryDriverName: selectedDriverName,
      // compat: manter também o campo antigo por nome
      deliveryDriver: selectedDriverName,
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
      deliveryDriverId: payload.deliveryDriverId,
      deliveryDriverName: payload.deliveryDriverName,
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
        if (window.UTILS?.formError) window.UTILS.formError.show(errEl, 'Erro ao fechar conta via API.');
        else if (errEl) { errEl.textContent = 'Erro ao fechar conta via API.'; errEl.style.display = 'block'; }
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
  if (addonsOptions) addonsOptions.addEventListener('click', onAddonQtyClick);
  itemsContainer.addEventListener('click', removeItem);
  feeInput.addEventListener('input', renderItems);
  discountInput.addEventListener('input', renderItems);
  form.addEventListener('submit', submit);
  closeBtn.addEventListener('click', closeAccount);
  grid.addEventListener('click', handleGridClick);

  // Motoboy Manager listeners
  if (motoboyAddBtn) motoboyAddBtn.addEventListener('click', () => openMotoboyModal());
  if (motoboyListEl) motoboyListEl.addEventListener('click', handleMotoboyListClick);
  if (motoboyForm) motoboyForm.addEventListener('submit', submitMotoboy);
  if (motoboyNameInput && motoboyUsernameInput) {
    motoboyNameInput.addEventListener('input', () => {
      if (!motoboyUsernameInput.value) {
        motoboyUsernameInput.value = createUsernameFromName(motoboyNameInput.value);
      }
      if (motoboyEmailInput && !motoboyEmailInput.value && motoboyUsernameInput.value) {
        motoboyEmailInput.value = createEmailFromUsername(motoboyUsernameInput.value);
      }
    });
  }
  if (motoboyUsernameInput && motoboyEmailInput) {
    motoboyUsernameInput.addEventListener('input', () => {
      if (!motoboyEmailInput.value && motoboyUsernameInput.value) {
        motoboyEmailInput.value = createEmailFromUsername(motoboyUsernameInput.value);
      }
    });
  }
  const motoboyCloseBtn = motoboyModal ? motoboyModal.querySelector('.close-btn') : null;
  if (motoboyCloseBtn) motoboyCloseBtn.addEventListener('click', closeMotoboyModal);
  window.addEventListener('click', (e) => { if (e.target === motoboyModal) closeMotoboyModal(); });

  (async () => {
    await loadData();
    populateMenu();
    filterAndRender();
    await loadMotoboys();
    renderMotoboys();
    populateDriverSelect();
  })();
});

