(function () {
  function $(sel) { return document.querySelector(sel); }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function getSelectedCompanyId() {
    const v = localStorage.getItem('activeCompanyId');
    const n = v ? Number(v) : null;
    return Number.isFinite(n) ? n : null;
  }

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

  async function createUserFlow() {
    const username = prompt('Username:');
    if (!username) return;
    const email = prompt('Email:');
    if (!email) return;
    const password = prompt('Senha:');
    if (!password) return;

    const isSuperadmin = localStorage.getItem('userRole') === 'superadmin';
    let role = prompt('Role (admin/staff/superadmin):', 'staff') || 'staff';
    role = role.trim();

    let payload = { username, email, password, role };

    if (isSuperadmin) {
      const cid = getSelectedCompanyId();
      const companyId = cid || Number(prompt('companyId (obrigatório para superadmin criar usuário):') || 0);
      if (!companyId) {
        alert('companyId é obrigatório. Selecione uma empresa em Empresas.');
        return;
      }
      payload.companyId = companyId;
    }

    await window.API.users.create(payload);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = $('.toolbar .search-input input');
    const newBtn = document.getElementById('btn-new-user');

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
      newBtn.addEventListener('click', async () => {
        try {
          await createUserFlow();
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

