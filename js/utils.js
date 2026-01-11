// Utils compartilhados - Sistema Bar/Restaurante
// Padroniza formatações e elimina duplicidades entre páginas

(function(){
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

  const currencyInputMask = (input) => {
    input.addEventListener('input', debounce(() => {
      const onlyDigits = input.value.replace(/\D/g, '');
      const value = (Number(onlyDigits) / 100).toFixed(2);
      input.value = value.replace('.', ',');
    }, 100));
  };

  // Disponibiliza globalmente em window.UTILS
  if (typeof window !== 'undefined') {
    window.UTILS = { formatCurrency, formatDate, formatDateTime, debounce, throttle, storage, toast, currencyInputMask };
    // Mescla com CONFIG.UTILS, preservando chaves existentes e padronizando as funções críticas
    if (window.CONFIG) {
      const existing = window.CONFIG.UTILS || {};
      window.CONFIG.UTILS = {
        ...existing,
        formatCurrency,
        formatDate,
        formatDateTime,
        debounce,
        throttle,
        storage,
        toast,
        currencyInputMask,
      };
    }
  }
})();
