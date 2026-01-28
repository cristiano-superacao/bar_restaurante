(function () {
  function $(sel) { return document.querySelector(sel); }

  // Utilitário: slug para classes de função (remove acentos, minúsculas)
  function toSlug(s) {
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  const setText = (id, value) => (window.UTILS?.setText ? window.UTILS.setText(id, value) : (() => { const el = document.getElementById(id); if (el) el.textContent = value; })());
  const getSelectedCompanyId = () => (window.UTILS?.getSelectedCompanyId ? window.UTILS.getSelectedCompanyId() : (() => { const v = localStorage.getItem('activeCompanyId'); const n = v ? Number(v) : null; return Number.isFinite(n) ? n : null; })());

  function applyFilter(items, q) {
    const query = (q || '').trim().toLowerCase();
    if (!query) return items;
    return items.filter(u => {
      const hay = `${u.username || ''} ${u.email || ''} ${u.role || ''} ${u.company_name || ''}`.toLowerCase();
      return hay.includes(query);
    });
  }

  function renderStats(users) {
    const total = users.length;
    const active = users.filter(u => u.active !== false).length;
    const inactive = total - active;

    setText('users-total', String(total));
    setText('users-active', String(active));
    setText('users-inactive', String(inactive));
    setText('users-pending', '0');
  }

  function renderList(users) {
    const list = document.getElementById('users-list');
    const empty = document.getElementById('users-empty');
    if (!list || !empty) return;

    if (!users.length) {
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }

    empty.style.display = 'none';

    const isSuperadmin = localStorage.getItem('userRole') === 'superadmin';

    list.innerHTML = users.map(u => {
      const isActive = u.active !== false;
      const badgeClass = isActive ? 'badge badge-success' : 'badge badge-muted';
      const badgeText = isActive ? 'Ativo' : 'Inativo';
      const funcText = u.function ? String(u.function) : null;
      const funcCls = funcText ? `badge-function-${toSlug(funcText)}` : '';
      const funcBadge = funcText ? `<span class="badge ${funcCls}">Função: ${funcText}</span>` : '';
      const companyPart = isSuperadmin
        ? `<span class="muted">Empresa: ${u.company_name ? u.company_name : (u.company_id ?? '—')}</span>`
        : '';

      return `
        <div class="data-list-item" data-user-id="${u.id}">
          <div class="data-list-main">
            <div class="data-list-title">${String(u.username || '')}</div>
            <div class="data-list-sub">
              <span class="${badgeClass}">${badgeText}</span>
              <span class="muted">${String(u.email || '')}</span>
              <span class="muted">Role: ${String(u.role || '')}</span>
              ${funcBadge}
              ${companyPart}
            </div>
          </div>
          <div class="data-list-actions">
            <button class="btn btn-secondary" data-action="toggle">${isActive ? 'Desativar' : 'Ativar'}</button>
            <button class="btn btn-secondary" data-action="reset">Senha</button>
            <button class="btn btn-secondary" data-action="delete">Excluir</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadUsers() {
    if (!window.API || !window.API.users) return [];
    return window.API.users.list();
  }

  function openUserModal() {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    if (!modal || !form) return;
    document.getElementById('modal-title').textContent = 'Novo Usuário';
    form.reset();
    if (window.UTILS?.formError) window.UTILS.formError.clear('user-form-error');
    else {
      const errEl = document.getElementById('user-form-error');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    }
    if (window.UTILS?.modal) window.UTILS.modal.open(modal, { activeClass: 'active' });
    else modal.classList.add('active');
  }

  function closeUserModal() {
    const modal = document.getElementById('user-modal');
    if (!modal) return;
    if (window.UTILS?.modal) window.UTILS.modal.close(modal, { activeClass: 'active' });
    else modal.classList.remove('active');
  }

  async function submitUserForm() {
    const nameEl = document.getElementById('user-name-input');
    const emailEl = document.getElementById('user-email-input');
    const passwordEl = document.getElementById('user-password-input');
    const roleEl = document.getElementById('user-role-input');
    const statusEl = document.getElementById('user-status-input');
    const errEl = document.getElementById('user-form-error');

    if (!nameEl || !emailEl || !roleEl || !statusEl) return;

    const username = (nameEl.value || '').trim();
    const email = (emailEl.value || '').trim();
    const password = (passwordEl?.value || '').trim();
    const selectedFunction = (roleEl.value || '').trim(); // Agora é a função operacional
    const status = (statusEl.value || 'active');

    const showError = (msg) => {
      if (window.UTILS?.formError) window.UTILS.formError.show(errEl, msg);
      else if (errEl) { errEl.textContent = String(msg || 'Erro'); errEl.style.display = 'block'; }
    };
    if (!username || !email) { showError('Preencha nome e email.'); return; }
    if (!password) { showError('Informe uma senha.'); return; }
    if (!selectedFunction) { showError('Selecione uma função.'); return; }

    // Mapeia função operacional para role técnico do sistema
    const functionToRoleMap = {
      'Gerente': 'admin',
      'Supervisor': 'admin',
      'Caixa': 'staff',
      'Cozinheira': 'staff',
      'Garçom': 'staff'
    };

    const role = functionToRoleMap[selectedFunction] || 'staff';

    const isSuperadmin = localStorage.getItem('userRole') === 'superadmin';
    const payload = { 
      username, 
      email, 
      password, 
      role,
      function: selectedFunction // Armazena a função operacional
    };

    if (isSuperadmin) {
      const cid = getSelectedCompanyId();
      const companyId = cid || null;
      if (!companyId) {
        if (window.UTILS?.notify) window.UTILS.notify('companyId é obrigatório. Selecione uma empresa em Empresas.', 'error');
        else alert('companyId é obrigatório. Selecione uma empresa em Empresas.');
        return;
      }
      payload.companyId = companyId;
    }

    let created;
    try {
      created = await window.API.users.create(payload);
    } catch (e) {
      const details = e && e.details && (e.details.error || e.details.message);
      showError(details || 'Não foi possível criar o usuário.');
      return;
    }

    // Ajusta status se não for "active" (POST não aceita active)
    const shouldBeActive = status === 'active';
    if (!shouldBeActive && created?.id) {
      const makeActive = false; // "inactive" e "pending" mapeados como inativo
      try {
        await window.API.users.update(created.id, { active: makeActive });
      } catch (e) {
        // Mostrar erro, mas manter modal fechando após criação
        const details = e && e.details && (e.details.error || e.details.message);
        showError(details || 'Usuário criado, mas falha ao ajustar status.');
      }
    }

    closeUserModal();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input');
    const newBtn = document.getElementById('btn-new-user');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');

    const userModal = document.getElementById('user-modal');
    if (window.UTILS?.modal && userModal) {
      window.UTILS.modal.bind(userModal, {
        activeClass: 'active',
        closeBtnSelector: '.modal-close, .close-btn, #modal-close, #modal-cancel'
      });
    }

    let users = [];
    try {
      users = await loadUsers();
    } catch {
      users = [];
    }

    function rerender() {
      const filtered = applyFilter(users, searchInput ? searchInput.value : '');
      renderStats(users);
      renderList(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', rerender);

    if (newBtn) {
      newBtn.addEventListener('click', () => {
        openUserModal();
      });
    }

    if (!window.UTILS?.modal) {
      if (modalClose) modalClose.addEventListener('click', closeUserModal);
      if (modalCancel) modalCancel.addEventListener('click', closeUserModal);
    }
    if (modalSave) {
      modalSave.addEventListener('click', async () => {
        try {
          await submitUserForm();
          users = await loadUsers();
          rerender();
        } catch {
          alert('Não foi possível criar o usuário.');
        }
      });
    }

    const list = document.getElementById('users-list');
    if (list) {
      list.addEventListener('click', async (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) return;
        const row = ev.target.closest('[data-user-id]');
        const id = row ? row.getAttribute('data-user-id') : null;
        if (!id) return;

        const action = btn.getAttribute('data-action');
        const user = users.find(u => String(u.id) === String(id));
        if (!user) return;

        try {
          if (action === 'toggle') {
            await window.API.users.update(user.id, { active: user.active === false });
          } else if (action === 'reset') {
            const password = prompt('Nova senha:');
            if (!password) return;
            await window.API.users.update(user.id, { password });
          } else if (action === 'delete') {
            const ok = confirm('Excluir este usuário?');
            if (!ok) return;
            await window.API.users.remove(user.id);
          }

          users = await loadUsers();
          rerender();
        } catch {
          alert('Ação não concluída. Verifique permissões e contexto de empresa.');
        }
      });
    }

    rerender();
  });
})();

