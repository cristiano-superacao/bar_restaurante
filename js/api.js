// API helper com fallback para LocalStorage quando CONFIG.API.enabled=false
(function () {
  const CFG = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : { API: { enabled: false } };
  const enabled = !!(CFG.API && CFG.API.enabled);
  const baseUrl = (CFG.API && CFG.API.baseUrl) || '';
  const timeoutMs = (CFG.API && CFG.API.timeoutMs) || 8000;

  function getActiveCompanyId() {
    return localStorage.getItem('activeCompanyId') || 'default';
  }

  function companyKey(baseKey) {
    return `${String(baseKey)}_${getActiveCompanyId()}`;
  }

  async function fetchWithTimeout(url, options = {}) {
    if (!enabled) throw new Error('API disabled');
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const token = localStorage.getItem('authToken');

      // Multi-empresa: para superadmin, enviar contexto via header quando definido
      const userRole = localStorage.getItem('userRole');
      const activeCompanyId = localStorage.getItem('activeCompanyId');
      const companyHeader = (userRole === 'superadmin' && activeCompanyId)
        ? { 'X-Company-Id': String(activeCompanyId) }
        : {};

      // Se for superadmin, exige empresa selecionada para endpoints escopados
      const needsCompany = /^\/api\/(menu-items|tables|orders|stock|transactions|customers|reservations)(\/|$)/.test(url);
      if (userRole === 'superadmin' && needsCompany && !activeCompanyId) {
        try {
          if (typeof window !== 'undefined' && !String(window.location?.pathname || '').includes('empresas.html')) {
            window.location.href = 'empresas.html';
          }
        } catch {}
        const err = new Error('NO_COMPANY_CONTEXT');
        err.code = 'NO_COMPANY_CONTEXT';
        throw err;
      }

      const res = await fetch(baseUrl + url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...companyHeader,
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

  // Storage por empresa (LocalStorage) com migração automática de chaves legadas
  const APP_STORAGE = {
    key(baseKey) {
      return companyKey(baseKey);
    },
    get(baseKey, def, legacyKeys = []) {
      const scopedKey = companyKey(baseKey);
      const scoped = LS.get(scopedKey, null);
      if (scoped !== null) return scoped;

      const legacies = Array.isArray(legacyKeys) ? legacyKeys : [];
      for (const k of legacies) {
        const v = LS.get(k, null);
        if (v !== null) {
          // migra somente se ainda não há nada no escopo atual
          try { LS.set(scopedKey, v); } catch {}
          return v;
        }
      }
      return def ?? null;
    },
    set(baseKey, value) {
      return LS.set(companyKey(baseKey), value);
    },
    del(baseKey) {
      return LS.del(companyKey(baseKey));
    }
  };

  try {
    if (typeof window !== 'undefined') window.APP_STORAGE = APP_STORAGE;
  } catch {}

  const api = {
    enabled,
    auth: {
      async register({ username, email, password, name, companyName }) {
        if (!enabled) {
          const users = LS.get('users', []);
          const exists = (users || []).some(u => String(u.username).toLowerCase() === String(username).toLowerCase())
            || Object.values((window.CONFIG && window.CONFIG.USERS) || {}).some(u => String(u.username).toLowerCase() === String(username).toLowerCase());
          if (exists) throw new Error('Usuário já existe');
          const item = {
            id: Date.now(),
            username, email: email || '', name: name || '', role: 'admin',
            // Armazenar senha em LS é apenas para modo demo; não usar em produção
            password
          };
          users.push(item); LS.set('users', users);
          return { ok: true, user: { id: item.id, username: item.username, role: item.role } };
        }
        const body = JSON.stringify({ username, email, password, name, companyName });
        return fetchWithTimeout('/api/auth/register', { method: 'POST', body });
      },
      async login({ username, email, password }) {
        if (!enabled) throw new Error('API disabled');
        const body = JSON.stringify({ username, email, password });
        const res = await fetchWithTimeout('/api/auth/login', { method: 'POST', body });
        if (res && res.token) {
          localStorage.setItem('authToken', res.token);
          if (res.user) {
            localStorage.setItem('username', res.user.username || res.user.email || '');
            localStorage.setItem('userRole', res.user.role || '');

            if (res.user.companyName) {
              localStorage.setItem('activeCompanyName', String(res.user.companyName));
            }

            // Se o usuário vier com companyId (admin/staff), guardar para contexto
            if (res.user.companyId) {
              localStorage.setItem('activeCompanyId', String(res.user.companyId));
            } else {
              localStorage.removeItem('activeCompanyId');
            }
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
    // Clientes (por empresa)
    customers: {
      async list(){
        if (!enabled) return APP_STORAGE.get('clientes', [], ['clientes', companyKey('clientes')]);
        return fetchWithTimeout('/api/customers');
      },
      async create(data){
        if (!enabled){
          const curr = APP_STORAGE.get('clientes', [], ['clientes', companyKey('clientes')]);
          const item = { id: Date.now(), ...data };
          curr.push(item); APP_STORAGE.set('clientes', curr); return item;
        }
        return fetchWithTimeout('/api/customers', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data){
        if (!enabled){
          const curr = APP_STORAGE.get('clientes', [], ['clientes', companyKey('clientes')]);
          const upd = curr.map(c => c.id === id ? { ...c, ...data, id } : c);
          APP_STORAGE.set('clientes', upd); return upd.find(c => c.id === id) || null;
        }
        return fetchWithTimeout(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id){
        if (!enabled){
          const curr = APP_STORAGE.get('clientes', [], ['clientes', companyKey('clientes')]);
          APP_STORAGE.set('clientes', curr.filter(c => c.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/customers/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Empresas (somente superadmin quando API habilitada)
    companies: {
      async list() {
        if (!enabled) return LS.get('companies', []);
        return fetchWithTimeout('/api/companies');
      },
      async create(data) {
        if (!enabled) {
          const curr = LS.get('companies', []);
          const item = { id: Date.now(), ...data };
          curr.push(item); LS.set('companies', curr); return item;
        }
        return fetchWithTimeout('/api/companies', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = LS.get('companies', []);
          const upd = curr.map(c => c.id === id ? { ...c, ...data, id } : c);
          LS.set('companies', upd); return upd.find(c => c.id === id) || null;
        }
        return fetchWithTimeout(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      }
    },

    // Usuários (admin e superadmin quando API habilitada)
    users: {
      async list() {
        if (!enabled) return LS.get('users', []);
        return fetchWithTimeout('/api/users');
      },
      async create(data) {
        if (!enabled) {
          const curr = LS.get('users', []);
          const item = { id: Date.now(), ...data };
          curr.push(item); LS.set('users', curr); return item;
        }
        return fetchWithTimeout('/api/users', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = LS.get('users', []);
          const upd = curr.map(u => u.id === id ? { ...u, ...data, id } : u);
          LS.set('users', upd); return upd.find(u => u.id === id) || null;
        }
        return fetchWithTimeout(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = LS.get('users', []);
          LS.set('users', curr.filter(u => u.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/users/${id}`, { method: 'DELETE' });
        return true;
      }
    },
    // Mesas
    tables: {
      async list() {
        if (!enabled) return APP_STORAGE.get('tables', [], ['tables', 'mesas']);
        return fetchWithTimeout('/api/tables');
      },
      async create(data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('tables', [], ['tables', 'mesas']);
          const item = { id: Date.now(), ...data };
          curr.push(item); APP_STORAGE.set('tables', curr); return item;
        }
        return fetchWithTimeout('/api/tables', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('tables', [], ['tables', 'mesas']);
          const upd = curr.map(t => t.id === id ? { ...data, id } : t);
          APP_STORAGE.set('tables', upd); return upd.find(t => t.id === id) || null;
        }
        return fetchWithTimeout(`/api/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = APP_STORAGE.get('tables', [], ['tables', 'mesas']);
          APP_STORAGE.set('tables', curr.filter(t => t.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/tables/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Pedidos
    orders: {
      async listWithItems(opts = {}) {
        if (!enabled) return APP_STORAGE.get('pedidos', [], ['pedidos', 'orders']);
        const type = opts && opts.type ? String(opts.type) : '';
        const q = type ? `?type=${encodeURIComponent(type)}` : '';
        const orders = await fetchWithTimeout(`/api/orders${q}`);
        const itemsByOrder = await Promise.all(orders.map(o => fetchWithTimeout(`/api/orders/${o.id}/items`)));
        return orders.map((o, idx) => ({
          id: o.id,
          table: o.table_name || '',
          status: o.status,
          orderType: o.order_type || 'Mesa',
          customerName: o.customer_name || '',
          customerPhone: o.customer_phone || '',
          customerAddress: o.customer_address || '',
          customerNeighborhood: o.customer_neighborhood || '',
          customerReference: o.customer_reference || '',
          paymentMethod: o.payment_method || '',
          discount: Number(o.discount) || 0,
          deliveryFee: Number(o.delivery_fee) || 0,
          subtotal: Number(o.subtotal) || 0,
          total: Number(o.total) || 0,
          data: o.created_at,
          paidAt: o.paid_at,
          items: (itemsByOrder[idx] || []).map(it => ({
            id: it.menu_item_id,
            orderItemId: it.id,
            name: it.name,
            price: Number(it.price),
            quantity: it.quantity
          }))
        }));
      },
      async create(payload) {
        if (!enabled) {
          const curr = APP_STORAGE.get('pedidos', [], ['pedidos', 'orders']);
          const item = { id: Date.now(), ...payload };
          curr.push(item); APP_STORAGE.set('pedidos', curr); return item;
        }
        return fetchWithTimeout('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('pedidos', [], ['pedidos', 'orders']);
          const upd = curr.map(p => p.id === id ? { ...p, ...data } : p);
          APP_STORAGE.set('pedidos', upd); return upd.find(p => p.id === id) || null;
        }
        return fetchWithTimeout(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async close(id, data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('pedidos', [], ['pedidos', 'orders']);
          const now = new Date().toISOString();
          const upd = curr.map(p => {
            if (p.id !== id) return p;
            const discount = Number(data?.discount) || 0;
            const deliveryFee = Number(data?.deliveryFee) || 0;
            const subtotal = (p.items || []).reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
            const total = Math.max(0, subtotal + deliveryFee - discount);
            return { ...p, status: 'Pago', paymentMethod: data?.paymentMethod || '', discount, deliveryFee, subtotal, total, paidAt: now };
          });
          APP_STORAGE.set('pedidos', upd);
          return { ok: true };
        }
        return fetchWithTimeout(`/api/orders/${id}/close`, { method: 'POST', body: JSON.stringify(data || {}) });
      },
      async receipt(id) {
        if (!enabled) {
          const orders = APP_STORAGE.get('pedidos', [], ['pedidos', 'orders']);
          const order = (orders || []).find(o => o.id === id);
          if (!order) throw new Error('NOT_FOUND');
          const companyName = localStorage.getItem('activeCompanyName') || (window.CONFIG?.APP?.name || '');
          const discount = Number(order.discount) || 0;
          const deliveryFee = Number(order.deliveryFee) || 0;
          const subtotal = Number(order.subtotal) || (order.items || []).reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
          const total = Number(order.total) || Math.max(0, subtotal + deliveryFee - discount);
          return {
            company: { name: companyName },
            order: {
              id: order.id,
              status: order.status,
              orderType: order.orderType || 'Mesa',
              customerName: order.customerName || '',
              customerPhone: order.customerPhone || '',
              customerAddress: order.customerAddress || '',
              paymentMethod: order.paymentMethod || '',
              discount,
              deliveryFee,
              subtotal,
              total,
              paidAt: order.paidAt || null,
              createdAt: order.data || null
            },
            items: (order.items || []).map(it => ({
              name: it.name,
              quantity: Number(it.quantity) || 0,
              price: Number(it.price) || 0,
              lineTotal: (Number(it.price) || 0) * (Number(it.quantity) || 0)
            }))
          };
        }
        return fetchWithTimeout(`/api/orders/${id}/receipt`);
      },
      async remove(id) {
        if (!enabled) {
          const curr = APP_STORAGE.get('pedidos', [], ['pedidos', 'orders']);
          APP_STORAGE.set('pedidos', curr.filter(p => p.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/orders/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Cardápio (somente leitura por enquanto)
    menu: {
      async list() {
        if (!enabled) return APP_STORAGE.get('menuItems', [], ['menuItems']);
        return fetchWithTimeout('/api/menu-items');
      },
      async create(data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('menuItems', [], ['menuItems']);
          const item = { id: Date.now(), ...data };
          curr.push(item); APP_STORAGE.set('menuItems', curr); return item;
        }
        return fetchWithTimeout('/api/menu-items', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('menuItems', [], ['menuItems']);
          const upd = curr.map(m => m.id === id ? { ...m, ...data, id } : m);
          APP_STORAGE.set('menuItems', upd); return upd.find(m => m.id === id) || null;
        }
        return fetchWithTimeout(`/api/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = APP_STORAGE.get('menuItems', [], ['menuItems']);
          APP_STORAGE.set('menuItems', curr.filter(m => m.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/menu-items/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Estoque
    stock: {
      async list() {
        if (!enabled) return APP_STORAGE.get('estoque', [], ['estoque']);
        const rows = await fetchWithTimeout('/api/stock');
        // mapear min_quantity -> minQuantity
        return rows.map(r => ({ ...r, minQuantity: r.min_quantity }));
      },
      async create(data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('estoque', [], ['estoque']);
          const item = { id: Date.now().toString(), ...data };
          curr.push(item); APP_STORAGE.set('estoque', curr); return item;
        }
        const payload = { ...data, minQuantity: data.minQuantity };
        return fetchWithTimeout('/api/stock', { method: 'POST', body: JSON.stringify(payload) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('estoque', [], ['estoque']);
          const upd = curr.map(s => s.id === id ? { ...data, id } : s);
          APP_STORAGE.set('estoque', upd); return upd.find(s => s.id === id) || null;
        }
        const payload = { ...data, minQuantity: data.minQuantity };
        return fetchWithTimeout(`/api/stock/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = APP_STORAGE.get('estoque', [], ['estoque']);
          APP_STORAGE.set('estoque', curr.filter(s => s.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/stock/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Financeiro / Transações
    transactions: {
      async list() {
        if (!enabled) return APP_STORAGE.get('transacoes', [], ['transacoes']);
        return fetchWithTimeout('/api/transactions');
      },
      async create(data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('transacoes', [], ['transacoes']);
          const item = { id: Date.now().toString(), ...data };
          curr.push(item); APP_STORAGE.set('transacoes', curr); return item;
        }
        return fetchWithTimeout('/api/transactions', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('transacoes', [], ['transacoes']);
          const upd = curr.map(t => t.id === id ? { ...data, id } : t);
          APP_STORAGE.set('transacoes', upd); return upd.find(t => t.id === id) || null;
        }
        return fetchWithTimeout(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = APP_STORAGE.get('transacoes', [], ['transacoes']);
          APP_STORAGE.set('transacoes', curr.filter(t => t.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/transactions/${id}`, { method: 'DELETE' });
        return true;
      }
    },

    // Reservas
    reservations: {
      async list() {
        if (!enabled) return APP_STORAGE.get('reservas', [], ['reservas']);
        return fetchWithTimeout('/api/reservations');
      },
      async create(data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('reservas', [], ['reservas']);
          const item = { id: Date.now().toString(), ...data };
          curr.push(item); APP_STORAGE.set('reservas', curr); return item;
        }
        return fetchWithTimeout('/api/reservations', { method: 'POST', body: JSON.stringify(data) });
      },
      async update(id, data) {
        if (!enabled) {
          const curr = APP_STORAGE.get('reservas', [], ['reservas']);
          const upd = curr.map(r => r.id === id ? { ...r, ...data, id } : r);
          APP_STORAGE.set('reservas', upd); return upd.find(r => r.id === id) || null;
        }
        return fetchWithTimeout(`/api/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      },
      async remove(id) {
        if (!enabled) {
          const curr = APP_STORAGE.get('reservas', [], ['reservas']);
          APP_STORAGE.set('reservas', curr.filter(r => r.id !== id));
          return true;
        }
        await fetchWithTimeout(`/api/reservations/${id}`, { method: 'DELETE' });
        return true;
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.API = api;
  }
})();

