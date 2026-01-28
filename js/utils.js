// Utils compartilhados - Sistema Bar/Restaurante
// Padroniza formatações e elimina duplicidades entre páginas

(function(){
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const getSelectedCompanyId = () => {
    const v = localStorage.getItem('activeCompanyId');
    const n = v ? Number(v) : null;
    return Number.isFinite(n) ? n : null;
  };

  const formatCurrency = (value, locale = 'pt-BR', currency = 'BRL') => {
    const n = Number(value || 0);
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
  };

  const formatDate = (date, locale = 'pt-BR') => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  };

  const formatDateTime = (date, locale = 'pt-BR') => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  const debounce = (fn, wait = 250) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const throttle = (fn, wait = 250) => {
    let inFlight = false;
    return (...args) => {
      if (inFlight) return;
      inFlight = true;
      fn(...args);
      setTimeout(() => { inFlight = false; }, wait);
    };
  };

  const storage = {
    get(key, fallback = null) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    },
    remove(key) { try { localStorage.removeItem(key); } catch {} },
  };

  const toast = (msg, type = 'info') => {
    // Toast simples sem dependências externas
    const el = document.createElement('div');
    el.textContent = msg;
    el.className = `toast toast-${type}`;
    Object.assign(el.style, {
      position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#1a73e8',
      color: '#fff', padding: '10px 16px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.2)',
      zIndex: 9999, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600
    });
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2500);
  };

  // Notificações padronizadas (preferir toast; fallback para alert)
  const notify = (msg, type = 'info') => {
    const message = String(msg || '');
    if (!message) return;
    try {
      toast(message, type);
    } catch {
      try { alert(message); } catch {}
    }
  };

  // Form errors padronizados
  const formError = {
    show(elOrId, msg = 'Erro') {
      const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
      if (!el) return;
      el.textContent = String(msg || 'Erro');
      el.style.display = 'block';
    },
    clear(elOrId) {
      const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
      if (!el) return;
      el.textContent = '';
      el.style.display = 'none';
    }
  };

  const currencyInputMask = (input) => {
    input.addEventListener('input', debounce(() => {
      const onlyDigits = input.value.replace(/\D/g, '');
      const value = (Number(onlyDigits) / 100).toFixed(2);
      input.value = value.replace('.', ',');
    }, 100));
  };

  // Modal helpers (padroniza comportamento entre páginas)
  const modal = (() => {
    const state = new WeakMap();

    const getFocusable = (root) => {
      if (!root) return [];
      return Array.from(root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
    };

    const isOpen = (modalEl, activeClass) => {
      if (!modalEl) return false;
      if (activeClass) return modalEl.classList.contains(activeClass);
      // fallback: display flex via style
      return modalEl.style.display && modalEl.style.display !== 'none';
    };

    const open = (modalEl, opts = {}) => {
      if (!modalEl) return;
      const {
        activeClass = 'show',
        aria = true,
        focus = true,
      } = opts;

      const prevFocus = document.activeElement;
      state.set(modalEl, { prevFocus });

      if (activeClass) modalEl.classList.add(activeClass);
      else modalEl.style.display = 'flex';

      if (aria) {
        modalEl.setAttribute('aria-hidden', 'false');
      }

      if (focus) {
        const focusables = getFocusable(modalEl);
        const first = focusables[0];
        if (first && typeof first.focus === 'function') {
          setTimeout(() => first.focus(), 0);
        }
      }
    };

    const close = (modalEl, opts = {}) => {
      if (!modalEl) return;
      const {
        activeClass = 'show',
        aria = true,
        restoreFocus = true,
      } = opts;

      if (activeClass) modalEl.classList.remove(activeClass);
      else modalEl.style.display = 'none';

      if (aria) {
        modalEl.setAttribute('aria-hidden', 'true');
      }

      if (restoreFocus) {
        const st = state.get(modalEl);
        const prev = st && st.prevFocus;
        if (prev && typeof prev.focus === 'function') {
          try { prev.focus(); } catch {}
        }
      }
    };

    const bind = (modalEl, opts = {}) => {
      if (!modalEl) return;
      if (state.get(modalEl)?.bound) return;

      const {
        activeClass = 'show',
        closeOnBackdrop = true,
        closeOnEsc = true,
        trapFocus = true,
        closeBtnSelector = '.close-btn, .modal-close, [data-modal-close], #modal-close, #modal-cancel',
      } = opts;

      const onClick = (e) => {
        const closeBtn = e.target.closest(closeBtnSelector);
        if (closeBtn && modalEl.contains(closeBtn)) {
          e.preventDefault();
          close(modalEl, { activeClass });
          return;
        }
        if (closeOnBackdrop && e.target === modalEl) {
          close(modalEl, { activeClass });
        }
      };

      const onKeyDown = (e) => {
        if (!isOpen(modalEl, activeClass)) return;

        if (closeOnEsc && e.key === 'Escape') {
          e.preventDefault();
          close(modalEl, { activeClass });
          return;
        }

        if (!trapFocus || e.key !== 'Tab') return;
        const focusables = getFocusable(modalEl);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !modalEl.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      modalEl.addEventListener('click', onClick);
      document.addEventListener('keydown', onKeyDown);

      const existing = state.get(modalEl) || {};
      state.set(modalEl, { ...existing, bound: true, onClick, onKeyDown });
    };

    return { open, close, bind, isOpen };
  })();

  // Constantes compartilhadas para status e métodos de pagamento
  const CONSTANTS = {
    ORDER_STATUS: {
      MESA: ['Pendente','Em Preparo','Entregue','Pago','Cancelado'],
      DELIVERY: ['Pendente','Em Preparo','Saiu para Entrega','Entregue','Pago','Cancelado'],
    },
    PAYMENT_METHODS: ['Dinheiro','Cartão','PIX'],
  };

  // Helper para popular selects com opções
  const populateSelect = (selectEl, options, placeholder = null) => {
    if (!selectEl) return;
    const current = selectEl.value;
    selectEl.innerHTML = '';
    if (placeholder !== null) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = String(placeholder);
      selectEl.appendChild(opt);
    }
    options.forEach((val) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      selectEl.appendChild(opt);
    });
    if (current) selectEl.value = current;
  };

  // Disponibiliza globalmente em window.UTILS
  if (typeof window !== 'undefined') {
    window.UTILS = { setText, getSelectedCompanyId, formatCurrency, formatDate, formatDateTime, debounce, throttle, storage, toast, notify, formError, currencyInputMask, modal, CONSTANTS, populateSelect };
    // Mescla com CONFIG.UTILS, preservando chaves existentes e padronizando as funções críticas
    if (window.CONFIG) {
      const existing = window.CONFIG.UTILS || {};
      window.CONFIG.UTILS = {
        ...existing,
        setText,
        getSelectedCompanyId,
        formatCurrency,
        formatDate,
        formatDateTime,
        debounce,
        throttle,
        storage,
        toast,
        notify,
        formError,
        currencyInputMask,
        modal,
        CONSTANTS,
        populateSelect,
      };
    }
  }
})();
