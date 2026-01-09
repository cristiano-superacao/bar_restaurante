// API helper com fallback para LocalStorage quando CONFIG.API.enabled=false
(function () {
  const CFG = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : { API: { enabled: false } };
  const enabled = !!(CFG.API && CFG.API.enabled);
  const baseUrl = (CFG.API && CFG.API.baseUrl) || '';
  const timeoutMs = (CFG.API && CFG.API.timeoutMs) || 8000;

  async function fetchWithTimeout(url, options = {}) {
    if (!enabled) throw new Error('API disabled');
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(baseUrl + url, { 
        ...options, 
        signal: controller.signal, 
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(options.headers || {}) 
        } 
      });
      if (!res.ok) {
        if (res.status === 401) {
          try {
            localStorage.removeItem('authToken');
            // Opcional: limpar dados de usuário
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
          } catch {}
          if (typeof window !== 'undefined') {
            window.location.href = 'index.html';
          }
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const ct = res.headers.get('content-type') || '';
      return ct.includes('application/json') ? res.json() : res.text();
    } finally {
      clearTimeout(id);
    }
  }

  // LocalStorage helpers
  const LS = {
    get: (k, def) => {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (def ?? null); } catch { return def ?? null; }
    },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    del: (k) => localStorage.removeItem(k),
  };

  const api = {
    enabled,
    auth: {
      async login({ username, email, password }) {
        if (!enabled) throw new Error('API disabled');
        const body = JSON.stringify({ username, email, password });
        const res = await fetchWithTimeout('/api/auth/login', { method: 'POST', body });
        if (res && res.token) {
          localStorage.setItem('authToken', res.token);
          if (res.user) {
            localStorage.setItem('username', res.user.username || res.user.email || '');
            localStorage.setItem('userRole', res.user.role || '');
          }
        }
        return res;
      },
      isTokenValid() {
        if (!enabled) return !!localStorage.getItem('authToken');
        const token = localStorage.getItem('authToken');
        if (!token) return false;
        try {
          const base64 = token.split('.')[1];
          const payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
          if (!payload || !payload.exp) return true; // sem exp, considerar válido
          const now = Math.floor(Date.now() / 1000);
          return payload.exp > now;
        } catch {
          return false;
        }
      },
      ensureAuthenticated() {
        if (!enabled) return true;
        const ok = this.isTokenValid();
        if (!ok && typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = 'index.html';
        }
        return ok;
      }
    },
    // Mesas
    tables: {
      async list() {
        if (!enabled) return LS.get('tables', []);
        return fetchWithTimeout('/api/tables');
      },
      async create(data) {
        if (!enabled) {
          const curr = LS.get('tables', []);
          const item = { id: Date.now(), ...data };
          curr.push(item); LS.set('tables', curr); return item;
        }
        return fetchWithTimeout('/api/tables', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = LS.get('tables', []);
          const upd = curr.map(t => t.id === id ? { ...data, id } : t);
          LS.set('tables', upd); return upd.find(t => t.id === id) || null;
        }
        return fetchWithTimeout(`/api/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = LS.get('tables', []);
          LS.set('tables', curr.filter(t => t.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/tables/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Pedidos
    orders: {
      async listWithItems() {
        if (!enabled) return LS.get('pedidos', []);
        const orders = await fetchWithTimeout('/api/orders');
        const itemsByOrder = await Promise.all(orders.map(o => fetchWithTimeout(`/api/orders/${o.id}/items`)));
        return orders.map((o, idx) => ({
          id: o.id,
          table: o.table_name || '',
          status: o.status,
          total: Number(o.total) || 0,
          data: o.created_at,
          items: (itemsByOrder[idx] || []).map(it => ({ id: it.id, name: it.name, price: Number(it.price), quantity: it.quantity }))
        }));
      },
      async create(payload) {
        if (!enabled) {
          const curr = LS.get('pedidos', []);
          const item = { id: Date.now(), ...payload };
          curr.push(item); LS.set('pedidos', curr); return item;
        }
        return fetchWithTimeout('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = LS.get('pedidos', []);
          const upd = curr.map(p => p.id === id ? { ...p, ...data } : p);
          LS.set('pedidos', upd); return upd.find(p => p.id === id) || null;
        }
        return fetchWithTimeout(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = LS.get('pedidos', []);
          LS.set('pedidos', curr.filter(p => p.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/orders/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Cardápio (somente leitura por enquanto)
    menu: {
      async list() {
        if (!enabled) return LS.get('menuItems', []);
        return fetchWithTimeout('/api/menu-items');
      },
      async create(data) {
        if (!enabled) {
          const curr = LS.get('menuItems', []);
          const item = { id: Date.now(), ...data };
          curr.push(item); LS.set('menuItems', curr); return item;
        }
        return fetchWithTimeout('/api/menu-items', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = LS.get('menuItems', []);
          const upd = curr.map(m => m.id === id ? { ...m, ...data, id } : m);
          LS.set('menuItems', upd); return upd.find(m => m.id === id) || null;
        }
        return fetchWithTimeout(`/api/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = LS.get('menuItems', []);
          LS.set('menuItems', curr.filter(m => m.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/menu-items/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Estoque
    stock: {
      async list() {
        if (!enabled) return LS.get('estoque', []);
        const rows = await fetchWithTimeout('/api/stock');
        // mapear min_quantity -> minQuantity
        return rows.map(r => ({ ...r, minQuantity: r.min_quantity }));
      },
      async create(data) {
        if (!enabled) {
          const curr = LS.get('estoque', []);
          const item = { id: Date.now().toString(), ...data };
          curr.push(item); LS.set('estoque', curr); return item;
        }
        const payload = { ...data, minQuantity: data.minQuantity };
        return fetchWithTimeout('/api/stock', { method: 'POST', body: JSON.stringify(payload) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = LS.get('estoque', []);
          const upd = curr.map(s => s.id === id ? { ...data, id } : s);
          LS.set('estoque', upd); return upd.find(s => s.id === id) || null;
        }
        const payload = { ...data, minQuantity: data.minQuantity };
        return fetchWithTimeout(`/api/stock/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = LS.get('estoque', []);
          LS.set('estoque', curr.filter(s => s.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/stock/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Financeiro / Transações
    transactions: {
      async list() {
        if (!enabled) return LS.get('transacoes', []);
        return fetchWithTimeout('/api/transactions');
      },
      async create(data) {
        if (!enabled) {
          const curr = LS.get('transacoes', []);
          const item = { id: Date.now().toString(), ...data };
          curr.push(item); LS.set('transacoes', curr); return item;
        }
        return fetchWithTimeout('/api/transactions', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = LS.get('transacoes', []);
          const upd = curr.map(t => t.id === id ? { ...data, id } : t);
          LS.set('transacoes', upd); return upd.find(t => t.id === id) || null;
        }
        return fetchWithTimeout(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = LS.get('transacoes', []);
          LS.set('transacoes', curr.filter(t => t.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/transactions/${id}`, { method: 'DELETE' });
        return true;
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.API = api;
  }
})();
