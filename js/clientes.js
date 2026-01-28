(function(){
  // Protege a página
  if (window.API && API.auth) API.auth.ensureAuthenticated();

  const el = {
    grid: document.getElementById('clients-grid'),
    empty: document.getElementById('clients-empty'),
    search: document.getElementById('search-client-input'),
    btnNew: document.getElementById('btn-new-client'),
    modal: document.getElementById('client-modal'),
    modalTitle: document.getElementById('client-modal-title'),
    closeModal: document.getElementById('close-client-modal'),
    cancel: document.getElementById('cancel-client'),
    form: document.getElementById('client-form'),
    id: document.getElementById('client-id'),
    name: document.getElementById('client-name'),
    email: document.getElementById('client-email'),
    phone: document.getElementById('client-phone'),
    address: document.getElementById('client-address'),
    birthdate: document.getElementById('client-birthdate'),
    notes: document.getElementById('client-notes')
  };

  function setMetric(id, value) {
    const m = document.getElementById(id);
    if (m) m.textContent = String(value);
  }

  function openModal(editing){
    el.modal.classList.add('show');
    el.modalTitle.textContent = editing ? 'Editar Cliente' : 'Novo Cliente';
    if (window.UTILS?.formError) window.UTILS.formError.clear('client-form-error');
    else {
      const errEl = document.getElementById('client-form-error');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    }
  }
  function closeModal(){ el.modal.classList.remove('show'); }

  el.btnNew.addEventListener('click', () => {
    el.form.reset();
    el.id.value = '';
    openModal(false);
  });
  el.closeModal.addEventListener('click', closeModal);
  el.cancel.addEventListener('click', closeModal);

  el.form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const errEl = document.getElementById('client-form-error');
    const showError = (msg) => {
      if (window.UTILS?.formError) window.UTILS.formError.show(errEl, msg);
      else if (errEl) { errEl.textContent = String(msg || 'Erro'); errEl.style.display = 'block'; }
    };
    const payload = {
      name: el.name.value.trim(),
      email: el.email.value.trim() || null,
      phone: el.phone.value.trim() || null,
      address: el.address.value.trim() || null,
      birthdate: el.birthdate.value || null,
      notes: el.notes.value.trim() || null
    };
    if (!payload.name) { showError('Nome é obrigatório'); return; }

    try {
      if (el.id.value) {
        await API.customers.update(Number(el.id.value), payload);
      } else {
        await API.customers.create(payload);
      }
      closeModal();
      load();
    } catch (e) {
      const msg = (e && e.details && (e.details.error || e.details.message)) ? (e.details.error || e.details.message) : 'Erro ao salvar cliente';
      showError(msg);
    }
  });

  el.search.addEventListener('input', () => render(window.__CLIENTS||[]));

  async function load(){
    try {
      const items = await API.customers.list();
      window.__CLIENTS = items || [];
      render(items||[]);
    } catch(e) {
      window.__CLIENTS = [];
      render([]);
    }
  }

  function render(items){
    const q = (el.search.value||'').toLowerCase();
    const filtered = items.filter(c => {
      const txt = `${c.name||''} ${c.email||''} ${c.phone||''}`.toLowerCase();
      return txt.includes(q);
    });

    // métricas
    setMetric('clients-total', filtered.length);
    setMetric('clients-email', filtered.filter(c => !!c.email).length);
    setMetric('clients-phone', filtered.filter(c => !!c.phone).length);

    el.grid.innerHTML = '';
    if (!filtered.length) {
      el.empty.style.display = 'flex';
      return;
    }
    el.empty.style.display = 'none';

    const frag = document.createDocumentFragment();
    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'client-card';
      card.dataset.id = c.id;
      card.innerHTML = `
        <i class="fas fa-user client-icon"></i>
        <h3>${c.name||''}</h3>
        <p class="client-sub">
          ${c.email ? `<span class="client-badge"><i class='fas fa-envelope'></i> ${c.email}</span>`: ''}
          ${c.phone ? `<span class="client-badge"><i class='fas fa-phone'></i> ${c.phone}</span>`: ''}
          ${c.address ? `<span class="client-badge"><i class='fas fa-location-dot'></i> ${c.address}</span>`: ''}
          ${c.birthdate ? `<span class="client-badge"><i class='fas fa-cake-candles'></i> ${String(c.birthdate).slice(0,10)}</span>`:''}
        </p>
        <div class="client-actions">
          <button class="btn btn-secondary btn-edit"><i class="fas fa-pen"></i> Editar</button>
          <button class="btn btn-secondary btn-delete"><i class="fas fa-trash"></i> Excluir</button>
        </div>
      `;
      card.querySelector('.btn-edit').addEventListener('click', () => {
        el.id.value = c.id;
        el.name.value = c.name || '';
        el.email.value = c.email || '';
        el.phone.value = c.phone || '';
        el.address.value = c.address || '';
        el.birthdate.value = c.birthdate ? String(c.birthdate).slice(0,10) : '';
        el.notes.value = c.notes || '';
        openModal(true);
      });
      card.querySelector('.btn-delete').addEventListener('click', async () => {
        if (!confirm('Excluir este cliente?')) return;
        try { await API.customers.remove(c.id); load(); }
        catch {
          if (window.UTILS?.notify) window.UTILS.notify('Erro ao excluir', 'error');
          else alert('Erro ao excluir');
        }
      });
      frag.appendChild(card);
    });
    el.grid.appendChild(frag);
  }

  // User header
  try {
    document.getElementById('username-display').textContent = localStorage.getItem('username') || '';
    document.getElementById('user-role-display').textContent = (localStorage.getItem('userRole')||'').toLowerCase();
  } catch {}

  load();
})();

