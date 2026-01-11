(function () {
  function $(sel) { return document.querySelector(sel); }

  let cameFromSwitch = false;
  let didInitialScrollToSelected = false;

  function fmtDate(iso) {
    if (!iso) return '';
    try {
      if (window.CONFIG && window.CONFIG.UTILS && typeof window.CONFIG.UTILS.formatDate === 'function') {
        return window.CONFIG.UTILS.formatDate(iso);
      }
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return String(iso);
    }
  }

  const setText = (id, value) => (window.UTILS?.setText ? window.UTILS.setText(id, value) : (() => { const el = document.getElementById(id); if (el) el.textContent = value; })());
  const getSelectedCompanyId = () => (window.UTILS?.getSelectedCompanyId ? window.UTILS.getSelectedCompanyId() : (() => { const v = localStorage.getItem('activeCompanyId'); const n = v ? Number(v) : null; return Number.isFinite(n) ? n : null; })());

  function setSelectedCompany(company) {
    if (!company) {
      localStorage.removeItem('activeCompanyId');
      localStorage.removeItem('activeCompanyName');
      try { if (typeof window !== 'undefined' && typeof window.renderCompanyBadge === 'function') window.renderCompanyBadge(); } catch {}
      return;
    }
    localStorage.setItem('activeCompanyId', String(company.id));
    localStorage.setItem('activeCompanyName', String(company.name || ''));
    try { if (typeof window !== 'undefined' && typeof window.renderCompanyBadge === 'function') window.renderCompanyBadge(); } catch {}

    // No fluxo de troca rápida, o redirecionamento automático cuida do retorno.
    if (cameFromSwitch) return;

    // UX: permite voltar para a última tela usada
    try {
      const headerActions = document.querySelector('.main-header .header-actions');
      if (!headerActions) return;
      const toolbar = headerActions.querySelector('.toolbar') || headerActions;

      // Evita duplicar
      const existing = document.getElementById('btn-back-after-company');
      if (existing) existing.remove();

      const target = localStorage.getItem('lastNonCompaniesPage') || 'dashboard.html';
      const btn = document.createElement('a');
      btn.href = target;
      btn.id = 'btn-back-after-company';
      btn.className = 'btn btn-primary';
      btn.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar';
      btn.title = 'Voltar para a última tela';
      toolbar.appendChild(btn);
    } catch {}
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

  function renderList(companiesFiltered, companiesAll, rerender) {
    const list = document.getElementById('companies-list');
    const empty = document.getElementById('companies-empty');
    if (!list || !empty) return;

    if (!companiesFiltered.length) {
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }

    empty.style.display = 'none';

    const selectedId = getSelectedCompanyId();

    list.innerHTML = companiesFiltered.map(c => {
      const isActive = c.active !== false;
      const isSelected = selectedId && Number(c.id) === selectedId;
      const badgeClass = isActive ? 'badge badge-success' : 'badge badge-muted';
      const badgeText = isActive ? 'Ativa' : 'Inativa';
      const selText = isSelected ? 'Selecionada' : 'Selecionar';
      const selClass = isSelected ? 'btn btn-secondary' : 'btn btn-primary';

      const rowClass = isSelected ? 'data-list-item is-selected' : 'data-list-item';

      return `
        <div class="${rowClass}" data-company-id="${c.id}">
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
        const company = (companiesAll || companiesFiltered).find(x => Number(x.id) === id);
        if (company) {
          setSelectedCompany(company);

          // Retorno automático no fluxo de troca de empresa
          if (cameFromSwitch) {
            cameFromSwitch = false;
            let target = localStorage.getItem('lastNonCompaniesPage') || 'dashboard.html';
            if (/empresas\.html/i.test(String(target))) target = 'dashboard.html';
            setTimeout(() => { window.location.href = target; }, 250);
            return;
          }

          if (typeof rerender === 'function') rerender({ scrollToSelected: true });
        }
      });
    });

    list.querySelectorAll('[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('click', async (ev) => {
        const row = ev.target.closest('[data-company-id]');
        const id = row ? Number(row.getAttribute('data-company-id')) : null;
        const company = (companiesAll || companiesFiltered).find(x => Number(x.id) === id);
        if (!company) return;
        try {
          const updated = await window.API.companies.update(company.id, { active: company.active === false });
          // Atualiza lista local
          const source = companiesAll || companiesFiltered;
          const idx = source.findIndex(x => Number(x.id) === Number(company.id));
          if (idx >= 0) source[idx] = { ...source[idx], ...(updated || {}), active: updated?.active ?? (company.active === false) };
          if (typeof rerender === 'function') rerender();
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
    const qs = new URLSearchParams(String(window.location.search || ''));
    cameFromSwitch = (qs.get('from') === 'switch');

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

    function rerender(opts) {
      const options = opts || {};
      const filtered = applyFilter(companies, searchInput ? searchInput.value : '');
      renderStats(companies);
      renderList(filtered, companies, rerender);

      const shouldScroll = Boolean(options.scrollToSelected) || (!didInitialScrollToSelected);
      if (shouldScroll) {
        // UX: rolar até a empresa selecionada (somente na carga inicial ou após selecionar)
        try {
          const selectedId = getSelectedCompanyId();
          if (selectedId) {
            const row = document.querySelector(`[data-company-id="${selectedId}"]`);
            if (row && typeof row.scrollIntoView === 'function') {
              row.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
          }
        } catch {}
        didInitialScrollToSelected = true;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', rerender);

      // UX: foco automático na busca
      setTimeout(() => {
        try { searchInput.focus(); } catch {}
      }, 50);
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

    // Se veio do atalho "Trocar empresa", sugere ação mais direta
    if (cameFromSwitch) {
      try {
        const hint = document.getElementById('companies-selected');
        if (hint && hint.textContent === '—') hint.textContent = 'Selecione uma empresa';
      } catch {}
    }
  });
})();

