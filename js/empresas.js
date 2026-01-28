(function () {
  // 🔐 Verificação de acesso - Apenas superadmin pode acessar esta página
  if (typeof RBAC !== 'undefined' && !RBAC.isSuperAdmin()) {
    console.warn('⚠️ Acesso negado: Apenas superadmin pode acessar a gestão de empresas');
    RBAC.showAccessDeniedMessage();
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 2000);
    return;
  }

  function $(sel) { return document.querySelector(sel); }

  let cameFromSwitch = false;
  let didInitialScrollToSelected = false;
  let companies = [];
  let editingCompanyId = null;

  const setText = (id, value) => (window.UTILS?.setText ? window.UTILS.setText(id, value) : (() => { const el = document.getElementById(id); if (el) el.textContent = value; })());
  const getSelectedCompanyId = () => (window.UTILS?.getSelectedCompanyId ? window.UTILS.getSelectedCompanyId() : (() => { const v = localStorage.getItem('activeCompanyId'); const n = v ? Number(v) : null; return Number.isFinite(n) ? n : null; })());

  function fmtDate(iso) {
    if (!iso) return '—';
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

  function toDateInputValue(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return '';
    }
  }

  function setSelectedCompany(company) {
    if (!company) {
      localStorage.removeItem('activeCompanyId');
      localStorage.removeItem('activeCompanyName');
      localStorage.removeItem('activeCompany');
      localStorage.removeItem('activeCompanyNumber');
      try { if (typeof window !== 'undefined' && typeof window.renderCompanyBadge === 'function') window.renderCompanyBadge(); } catch {}
      return;
    }
    localStorage.setItem('activeCompanyId', String(company.id));
    localStorage.setItem('activeCompanyName', String(company.name || ''));
    try {
      localStorage.setItem('activeCompany', JSON.stringify({
        id: company.id,
        companyNumber: company.company_number ?? company.companyNumber ?? null,
        name: company.name || '',
        trialStartAt: company.trial_start_at ?? company.trialStartAt ?? null,
        trialEndAt: company.trial_end_at ?? company.trialEndAt ?? null,
        active: company.active !== false
      }));
      if (company.company_number != null) localStorage.setItem('activeCompanyNumber', String(company.company_number));
    } catch {}
    try { if (typeof window !== 'undefined' && typeof window.renderCompanyBadge === 'function') window.renderCompanyBadge(); } catch {}

    if (cameFromSwitch) return;

    try {
      const headerActions = document.querySelector('.main-header .header-actions');
      if (!headerActions) return;
      const toolbar = headerActions.querySelector('.toolbar') || headerActions;

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
    const list = await window.API.companies.list();
    return Array.isArray(list) ? list : [];
  }

  function applyFilter(items, q) {
    const query = (q || '').trim().toLowerCase();
    if (!query) return items;
    return items.filter(c => {
      const parts = [
        c.name,
        c.document,
        c.email,
        c.phone,
        c.company_number
      ].map(v => String(v || '').toLowerCase());
      return parts.some(p => p.includes(query));
    });
  }

  function getTrialStatus(company) {
    const end = company?.trial_end_at || company?.trialEndAt;
    if (!end) return { label: 'Trial: —', kind: 'muted' };
    const endMs = new Date(end).getTime();
    if (Number.isNaN(endMs)) return { label: 'Trial: —', kind: 'muted' };
    const expired = Date.now() > endMs;
    return expired
      ? { label: `Trial expirado (${fmtDate(end)})`, kind: 'error' }
      : { label: `Trial até ${fmtDate(end)}`, kind: 'success' };
  }

  function renderStats(items) {
    const total = items.length;
    const active = items.filter(c => c.active !== false).length;
    const inactive = total - active;

    setText('companies-total', String(total));
    setText('companies-active', String(active));
    setText('companies-inactive', String(inactive));

    const selectedId = getSelectedCompanyId();
    const selected = selectedId ? items.find(c => Number(c.id) === selectedId) : null;
    const suffix = selected?.company_number ? ` (#${selected.company_number})` : '';
    setText('companies-selected', selected ? String(selected.name) + suffix : '—');
  }

  function renderList(itemsFiltered, itemsAll, rerender) {
    const list = document.getElementById('companies-list');
    const empty = document.getElementById('companies-empty');
    if (!list || !empty) return;

    if (!itemsFiltered.length) {
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }

    empty.style.display = 'none';
    const selectedId = getSelectedCompanyId();

    list.innerHTML = itemsFiltered.map((c) => {
      const isActive = c.active !== false;
      const isSelected = selectedId && Number(c.id) === selectedId;
      const trial = getTrialStatus(c);

      const badgeClass = isSelected ? 'company-badge selected' : (isActive ? 'company-badge active' : 'company-badge inactive');
      const badgeText = isSelected ? 'Selecionada' : (isActive ? 'Ativa' : 'Bloqueada');

      const doc = String(c.document || '').trim();
      const phone = String(c.phone || '').trim();
      const email = String(c.email || '').trim();
      const address = String(c.address || '').trim();

      return `
        <div class="company-card ${isSelected ? 'selected' : ''}" data-company-id="${c.id}">
          <div class="company-card-header">
            <div class="company-info">
              <div class="company-name" title="${String(c.name || '')}">
                ${String(c.name || '')}${c.company_number ? ` <span class="muted">(#${c.company_number})</span>` : ''}
              </div>
              <div class="company-cnpj">${doc ? doc : 'Documento: —'}</div>
              <div class="${badgeClass}">${badgeText}</div>
            </div>
          </div>
          <div class="company-card-body">
            <div class="company-detail">
              <i class="fas fa-clock"></i>
              <div class="company-detail-content">
                <div class="company-detail-label">Trial</div>
                <div class="company-detail-value">${trial.label}</div>
              </div>
            </div>
            <div class="company-detail">
              <i class="fas fa-phone"></i>
              <div class="company-detail-content">
                <div class="company-detail-label">Telefone</div>
                <div class="company-detail-value">${phone || '—'}</div>
              </div>
            </div>
            <div class="company-detail">
              <i class="fas fa-envelope"></i>
              <div class="company-detail-content">
                <div class="company-detail-label">Email</div>
                <div class="company-detail-value">${email || '—'}</div>
              </div>
            </div>
            <div class="company-detail">
              <i class="fas fa-location-dot"></i>
              <div class="company-detail-content">
                <div class="company-detail-label">Endereço</div>
                <div class="company-detail-value">${address || '—'}</div>
              </div>
            </div>
          </div>
          <div class="company-card-footer">
            <button class="company-action-btn select" data-action="select">
              <i class="fas fa-check"></i> ${isSelected ? 'Selecionada' : 'Selecionar'}
            </button>
            <button class="company-action-btn edit" data-action="edit">
              <i class="fas fa-pen"></i> Editar
            </button>
            <button class="company-action-btn block" data-action="toggle">
              <i class="fas fa-ban"></i> ${isActive ? 'Bloquear' : 'Desbloquear'}
            </button>
            <button class="company-action-btn delete" data-action="delete">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('[data-action="select"]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        const card = ev.target.closest('[data-company-id]');
        const id = card ? Number(card.getAttribute('data-company-id')) : null;
        const company = (itemsAll || itemsFiltered).find(x => Number(x.id) === id);
        if (!company) return;
        setSelectedCompany(company);

        if (cameFromSwitch) {
          cameFromSwitch = false;
          let target = localStorage.getItem('lastNonCompaniesPage') || 'dashboard.html';
          if (/empresas\.html/i.test(String(target))) target = 'dashboard.html';
          setTimeout(() => { window.location.href = target; }, 250);
          return;
        }

        if (typeof rerender === 'function') rerender({ scrollToSelected: true });
      });
    });

    list.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        const card = ev.target.closest('[data-company-id]');
        const id = card ? Number(card.getAttribute('data-company-id')) : null;
        const company = (itemsAll || itemsFiltered).find(x => Number(x.id) === id);
        if (!company) return;
        openModal(company);
      });
    });

    list.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
      btn.addEventListener('click', async (ev) => {
        const card = ev.target.closest('[data-company-id]');
        const id = card ? Number(card.getAttribute('data-company-id')) : null;
        const company = (itemsAll || itemsFiltered).find(x => Number(x.id) === id);
        if (!company) return;

        const isActive = company.active !== false;
        const blockedReason = !isActive ? '' : (prompt('Motivo do bloqueio (opcional):', '') || '').trim();

        try {
          const updated = await window.API.companies.update(company.id, {
            active: !isActive,
            blockedReason: blockedReason || undefined
          });
          const idx = companies.findIndex(x => Number(x.id) === Number(company.id));
          if (idx >= 0) companies[idx] = { ...companies[idx], ...(updated || {}), active: updated?.active ?? (!isActive) };
          if (window.UTILS?.notify) window.UTILS.notify('Empresa atualizada com sucesso.', 'success');
          if (typeof rerender === 'function') rerender();
        } catch {
          if (window.UTILS?.notify) window.UTILS.notify('Não foi possível atualizar a empresa.', 'error');
        }
      });
    });

    list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async (ev) => {
        const card = ev.target.closest('[data-company-id]');
        const id = card ? Number(card.getAttribute('data-company-id')) : null;
        const company = (itemsAll || itemsFiltered).find(x => Number(x.id) === id);
        if (!company) return;

        const hint = company.company_number ? `${company.name} (ou ${company.company_number})` : company.name;
        const confirmValue = prompt(`Para excluir permanentemente, digite o NOME da empresa (ou o número)\n\nConfirme: ${hint}`);
        if (!confirmValue) return;

        try {
          await window.API.companies.remove(company.id, { confirm: String(confirmValue).trim() });
          companies = companies.filter(x => Number(x.id) !== Number(company.id));

          const selectedId = getSelectedCompanyId();
          if (selectedId && Number(selectedId) === Number(company.id)) {
            setSelectedCompany(null);
          }

          if (window.UTILS?.notify) window.UTILS.notify('Empresa excluída.', 'success');
          if (typeof rerender === 'function') rerender();
        } catch {
          if (window.UTILS?.notify) window.UTILS.notify('Não foi possível excluir a empresa.', 'error');
        }
      });
    });
  }

  function openModal(company = null) {
    editingCompanyId = company ? Number(company.id) : null;

    const title = document.getElementById('modal-title');
    if (title) title.textContent = editingCompanyId ? 'Editar Empresa' : 'Nova Empresa';

    const numberEl = document.getElementById('company-number-input');
    const nameEl = document.getElementById('company-name-input');
    const legalNameEl = document.getElementById('company-legal-name-input');
    const docEl = document.getElementById('company-cnpj-input');
    const phoneEl = document.getElementById('company-phone-input');
    const emailEl = document.getElementById('company-email-input');
    const addressEl = document.getElementById('company-address-input');
    const statusEl = document.getElementById('company-status-input');
    const trialStartEl = document.getElementById('company-trial-start-input');
    const trialEndEl = document.getElementById('company-trial-end-input');
    const blockReasonEl = document.getElementById('company-block-reason-input');

    if (numberEl) numberEl.value = company?.company_number ? String(company.company_number) : '';
    if (nameEl) nameEl.value = company?.name ? String(company.name) : '';
    if (legalNameEl) legalNameEl.value = company?.legal_name ? String(company.legal_name) : '';
    if (docEl) docEl.value = company?.document ? String(company.document) : '';
    if (phoneEl) phoneEl.value = company?.phone ? String(company.phone) : '';
    if (emailEl) emailEl.value = company?.email ? String(company.email) : '';
    if (addressEl) addressEl.value = company?.address ? String(company.address) : '';
    if (trialStartEl) trialStartEl.value = toDateInputValue(company?.trial_start_at);
    if (trialEndEl) trialEndEl.value = toDateInputValue(company?.trial_end_at);
    if (blockReasonEl) blockReasonEl.value = company?.blocked_reason ? String(company.blocked_reason) : '';
    if (statusEl) statusEl.value = (company && company.active === false) ? 'inactive' : 'active';

    const modalEl = document.getElementById('company-modal');
    if (modalEl && window.UTILS?.modal) {
      window.UTILS.modal.bind(modalEl);
      window.UTILS.modal.open(modalEl);
    }
  }

  function closeModal() {
    const modalEl = document.getElementById('company-modal');
    if (modalEl && window.UTILS?.modal) window.UTILS.modal.close(modalEl);
    editingCompanyId = null;
  }

  function collectFormData() {
    const name = (document.getElementById('company-name-input')?.value || '').trim();
    const legalName = (document.getElementById('company-legal-name-input')?.value || '').trim();
    const documentVal = (document.getElementById('company-cnpj-input')?.value || '').trim();
    const phone = (document.getElementById('company-phone-input')?.value || '').trim();
    const email = (document.getElementById('company-email-input')?.value || '').trim();
    const address = (document.getElementById('company-address-input')?.value || '').trim();
    const status = (document.getElementById('company-status-input')?.value || 'active');
    const blockedReason = (document.getElementById('company-block-reason-input')?.value || '').trim();
    const trialStart = (document.getElementById('company-trial-start-input')?.value || '').trim();
    const trialEnd = (document.getElementById('company-trial-end-input')?.value || '').trim();

    const active = status !== 'inactive';

    const payload = {
      name,
      legalName: legalName || undefined,
      document: documentVal || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      active,
      blockedReason: (!active && blockedReason) ? blockedReason : undefined,
      trialStartAt: trialStart ? new Date(`${trialStart}T00:00:00`).toISOString() : undefined,
      trialEndAt: trialEnd ? new Date(`${trialEnd}T23:59:59`).toISOString() : undefined,
    };

    return payload;
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

    const searchInput = document.getElementById('search-input')
      || document.querySelector('.toolbar .search-box input')
      || document.querySelector('.toolbar input[type="search"], .toolbar input[type="text"]');
    const newBtn = document.getElementById('btn-new-company');

    try { companies = await loadCompanies(); } catch { companies = []; }

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

    // Modal bindings
    const modalEl = document.getElementById('company-modal');
    if (modalEl && window.UTILS?.modal) window.UTILS.modal.bind(modalEl);

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
    const cancelBtn = document.getElementById('modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

    const saveBtn = document.getElementById('modal-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const payload = collectFormData();
        if (!payload.name || payload.name.length < 2) {
          if (window.UTILS?.notify) window.UTILS.notify('Informe o nome da empresa.', 'error');
          return;
        }

        try {
          if (editingCompanyId) {
            const updated = await window.API.companies.update(editingCompanyId, payload);
            const idx = companies.findIndex(c => Number(c.id) === Number(editingCompanyId));
            if (idx >= 0 && updated) companies[idx] = { ...companies[idx], ...updated };
            if (window.UTILS?.notify) window.UTILS.notify('Empresa atualizada.', 'success');
          } else {
            const created = await window.API.companies.create(payload);
            const company = created?.company || created;
            if (company) companies.unshift(company);
            if (window.UTILS?.notify) window.UTILS.notify('Empresa criada.', 'success');
          }
          closeModal();
          rerender();
        } catch (err) {
          if (window.UTILS?.notify) window.UTILS.notify('Não foi possível salvar a empresa.', 'error');
        }
      });
    }

    if (newBtn) {
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(null);
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

