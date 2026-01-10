(function () {
  function $(sel) { return document.querySelector(sel); }

  function fmtDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR');
    } catch {
      return String(iso);
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function getSelectedCompanyId() {
    const v = localStorage.getItem('activeCompanyId');
    const n = v ? Number(v) : null;
    return Number.isFinite(n) ? n : null;
  }

  function setSelectedCompany(company) {
    if (!company) {
      localStorage.removeItem('activeCompanyId');
      localStorage.removeItem('activeCompanyName');
      return;
    }
    localStorage.setItem('activeCompanyId', String(company.id));
    localStorage.setItem('activeCompanyName', String(company.name || ''));
  }

  async function loadCompanies() {
    if (!window.API || !window.API.companies) return [];
    return window.API.companies.list();
  }

  function applyFilter(items, q) {
    const query = (q || '').trim().toLowerCase();
    if (!query) return items;
    return items.filter(c => String(c.name || '').toLowerCase().includes(query));
  }

  function renderStats(companies) {
    const total = companies.length;
    const active = companies.filter(c => c.active !== false).length;
    const inactive = total - active;

    setText('companies-total', String(total));
    setText('companies-active', String(active));
    setText('companies-inactive', String(inactive));

    const selectedId = getSelectedCompanyId();
    const selected = selectedId ? companies.find(c => Number(c.id) === selectedId) : null;
    setText('companies-selected', selected ? String(selected.name) : '—');
  }

  function renderList(companies) {
    const list = document.getElementById('companies-list');
    const empty = document.getElementById('companies-empty');
    if (!list || !empty) return;

    if (!companies.length) {
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }

    empty.style.display = 'none';

    const selectedId = getSelectedCompanyId();

    list.innerHTML = companies.map(c => {
      const isActive = c.active !== false;
      const isSelected = selectedId && Number(c.id) === selectedId;
      const badgeClass = isActive ? 'badge badge-success' : 'badge badge-muted';
      const badgeText = isActive ? 'Ativa' : 'Inativa';
      const selText = isSelected ? 'Selecionada' : 'Selecionar';
      const selClass = isSelected ? 'btn btn-secondary' : 'btn btn-primary';

      return `
        <div class="data-list-item" data-company-id="${c.id}">
          <div class="data-list-main">
            <div class="data-list-title">${String(c.name || '')}</div>
            <div class="data-list-sub">
              <span class="${badgeClass}">${badgeText}</span>
              <span class="muted">ID: ${c.id}</span>
              ${c.created_at ? `<span class="muted">Criado: ${fmtDate(c.created_at)}</span>` : ''}
            </div>
          </div>
          <div class="data-list-actions">
            <button class="${selClass}" data-action="select">${selText}</button>
            <button class="btn btn-secondary" data-action="toggle">${isActive ? 'Desativar' : 'Ativar'}</button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('[data-action="select"]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const row = ev.target.closest('[data-company-id]');
        const id = row ? Number(row.getAttribute('data-company-id')) : null;
        const company = companies.find(x => Number(x.id) === id);
        if (company) {
          setSelectedCompany(company);
          renderStats(companies);
          renderList(companies);
        }
      });
    });

    list.querySelectorAll('[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('click', async (ev) => {
        const row = ev.target.closest('[data-company-id]');
        const id = row ? Number(row.getAttribute('data-company-id')) : null;
        const company = companies.find(x => Number(x.id) === id);
        if (!company) return;
        try {
          const updated = await window.API.companies.update(company.id, { active: company.active === false });
          // Atualiza lista local
          const idx = companies.findIndex(x => Number(x.id) === Number(company.id));
          if (idx >= 0) companies[idx] = { ...companies[idx], ...(updated || {}), active: updated?.active ?? (company.active === false) };
          renderStats(companies);
          renderList(companies);
        } catch (e) {
          alert('Não foi possível atualizar a empresa.');
        }
      });
    });
  }

  async function createCompanyFlow() {
    const name = prompt('Nome da empresa:');
    if (!name) return;

    const createAdmin = confirm('Criar também um usuário admin para esta empresa?');
    let payload = { name };

    if (createAdmin) {
      const adminUsername = prompt('Username do admin:');
      const adminEmail = prompt('Email do admin:');
      const adminPassword = prompt('Senha do admin:');
      if (adminUsername && adminEmail && adminPassword) {
        payload = { ...payload, adminUsername, adminEmail, adminPassword };
      }
    }

    await window.API.companies.create(payload);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'superadmin') {
      const body = document.querySelector('.content-body');
      if (body) {
        body.innerHTML = '<div class="empty-state"><div class="icon"><i class="fas fa-lock"></i></div><div>Acesso restrito</div><small>Somente superadmin pode gerenciar empresas.</small></div>';
      }
      return;
    }

    const searchInput = $('.toolbar .search-input input');
    const newBtn = document.getElementById('btn-new-company');

    let companies = [];
    try {
      companies = await loadCompanies();
    } catch {
      companies = [];
    }

    function rerender() {
      const filtered = applyFilter(companies, searchInput ? searchInput.value : '');
      renderStats(companies);
      renderList(filtered);
    }

    if (searchInput) {
      searchInput.addEventListener('input', rerender);
    }

    const clearBtn = document.getElementById('btn-clear-company');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        setSelectedCompany(null);
        rerender();
      });
    }

    if (newBtn) {
      newBtn.addEventListener('click', async () => {
        try {
          await createCompanyFlow();
          companies = await loadCompanies();
          rerender();
        } catch {
          alert('Não foi possível criar a empresa.');
        }
      });
    }

    rerender();
  });
})();
