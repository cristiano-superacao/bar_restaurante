(function(){
  // Protege a página
  if (window.API && API.auth) API.auth.ensureAuthenticated();

  const el = {
    list: document.getElementById('clientes-list'),
    empty: document.getElementById('empty-state'),
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

  function openModal(editing){
    el.modal.classList.add('show');
    el.modalTitle.textContent = editing ? 'Editar Cliente' : 'Novo Cliente';
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
    const payload = {
      name: el.name.value.trim(),
      email: el.email.value.trim() || null,
      phone: el.phone.value.trim() || null,
      address: el.address.value.trim() || null,
      birthdate: el.birthdate.value || null,
      notes: el.notes.value.trim() || null
    };
    if (!payload.name) { alert('Nome é obrigatório'); return; }

    try {
      if (el.id.value) {
        await API.customers.update(Number(el.id.value), payload);
      } else {
        await API.customers.create(payload);
      }
      closeModal();
      load();
    } catch (e) {
      alert('Erro ao salvar cliente');
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

    el.list.innerHTML = '';
    if (!filtered.length) {
      el.empty.style.display = 'flex';
      return;
    }
    el.empty.style.display = 'none';

    const frag = document.createDocumentFragment();
    filtered.forEach(c => {
      const row = document.createElement('div');
      row.className = 'data-list-item client-item';
      row.innerHTML = `
        <div class="data-list-main">
          <div class="data-list-title">${c.name||''}</div>
          <div class="data-list-sub">
            ${c.email ? `<span class="muted"><i class='fas fa-envelope'></i> ${c.email}</span>`: ''}
            ${c.phone ? `<span class="muted"><i class='fas fa-phone'></i> ${c.phone}</span>`: ''}
            ${c.address ? `<span class="muted"><i class='fas fa-location-dot'></i> ${c.address}</span>`: ''}
            ${c.birthdate ? `<span class="client-badge"><i class='fas fa-cake-candles'></i> ${c.birthdate}</span>`:''}
          </div>
        </div>
        <div class="data-list-actions">
          <button class="btn btn-secondary btn-edit"><i class="fas fa-pen"></i> Editar</button>
          <button class="btn btn-secondary btn-delete"><i class="fas fa-trash"></i> Excluir</button>
        </div>
      `;
      row.querySelector('.btn-edit').addEventListener('click', () => {
        el.id.value = c.id;
        el.name.value = c.name || '';
        el.email.value = c.email || '';
        el.phone.value = c.phone || '';
        el.address.value = c.address || '';
        el.birthdate.value = c.birthdate ? String(c.birthdate).slice(0,10) : '';
        el.notes.value = c.notes || '';
        openModal(true);
      });
      row.querySelector('.btn-delete').addEventListener('click', async () => {
        if (!confirm('Excluir este cliente?')) return;
        try { await API.customers.remove(c.id); load(); } catch { alert('Erro ao excluir'); }
      });
      frag.appendChild(row);
    });
    el.list.appendChild(frag);
  }

  // Sidebar toggle (responsivo)
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('menu-toggle');
  if (toggle) toggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
  if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });

  // User header
  try {
    document.getElementById('username-display').textContent = localStorage.getItem('username') || '';
    document.getElementById('user-role-display').textContent = (localStorage.getItem('userRole')||'').toLowerCase();
  } catch {}

  load();
})();

