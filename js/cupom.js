document.addEventListener('DOMContentLoaded', async () => {
  const qs = new URLSearchParams(window.location.search);
  const orderId = qs.get('orderId');

  const companyEl = document.getElementById('company-block');
  const metaEl = document.getElementById('order-meta');
  const itemsEl = document.getElementById('items');
  const totalsEl = document.getElementById('totals');

  const printBtn = document.getElementById('print-btn');
  const closeBtn = document.getElementById('close-btn');

  function formatBRL(v) {
    if (window.CONFIG && window.CONFIG.UTILS && typeof window.CONFIG.UTILS.formatCurrency === 'function') {
      return window.CONFIG.UTILS.formatCurrency(Number(v) || 0);
    }
    return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function fmtDateTime(v) {
    if (!v) return '';
    try {
      return new Date(v).toLocaleString('pt-BR');
    } catch { return String(v); }
  }

  async function loadReceipt() {
    if (!orderId) throw new Error('orderId ausente');
    if (!window.API || !window.API.orders || typeof window.API.orders.receipt !== 'function') {
      throw new Error('API.orders.receipt indisponível');
    }
    return window.API.orders.receipt(Number(orderId));
  }

  try {
    const data = await loadReceipt();
    const company = data.company || {};
    const order = data.order || {};
    const items = data.items || [];

    const companyLines = [];
    companyLines.push(`<div class="name">${company.legalName || company.name || 'Empresa'}</div>`);
    if (company.name && company.legalName && company.name !== company.legalName) companyLines.push(`<div>${company.name}</div>`);
    if (company.document) companyLines.push(`<div>Doc: ${company.document}</div>`);
    if (company.phone) companyLines.push(`<div>Tel: ${company.phone}</div>`);
    if (company.address) companyLines.push(`<div>${company.address}</div>`);

    companyEl.innerHTML = companyLines.join('');

    const metaLines = [];
    metaLines.push(`<div class="row"><span>Pedido</span><span>#${String(order.id).padStart(4, '0')}</span></div>`);
    metaLines.push(`<div class="row"><span>Tipo</span><span>${order.orderType || 'Mesa'}</span></div>`);
    if (order.orderType === 'Delivery') {
      if (order.customerName) metaLines.push(`<div class="row"><span>Cliente</span><span>${order.customerName}</span></div>`);
      if (order.customerPhone) metaLines.push(`<div class="row"><span>Telefone</span><span>${order.customerPhone}</span></div>`);
      if (order.customerAddress) metaLines.push(`<div class="row"><span>Endereço</span><span>${order.customerAddress}</span></div>`);
    }
    if (order.paymentMethod) metaLines.push(`<div class="row"><span>Pagamento</span><span>${order.paymentMethod}</span></div>`);
    metaLines.push(`<div class="row"><span>Emissão</span><span>${fmtDateTime(order.paidAt || order.createdAt)}</span></div>`);
    metaEl.innerHTML = metaLines.join('');

    const itemLines = [];
    itemLines.push('<div class="items-title">ITENS</div>');
    items.forEach(it => {
      itemLines.push(`
        <div class="item">
          <div class="row"><span>${it.quantity}x ${it.name}</span><span>${formatBRL(it.lineTotal)}</span></div>
          <div class="row"><span>  ${formatBRL(it.price)}</span><span></span></div>
        </div>
      `);
    });
    itemsEl.innerHTML = itemLines.join('');

    const totalsLines = [];
    totalsLines.push(`<div class="row"><span>Subtotal</span><span>${formatBRL(order.subtotal)}</span></div>`);
    if (Number(order.deliveryFee) > 0) totalsLines.push(`<div class="row"><span>Taxa entrega</span><span>${formatBRL(order.deliveryFee)}</span></div>`);
    if (Number(order.discount) > 0) totalsLines.push(`<div class="row"><span>Desconto</span><span>- ${formatBRL(order.discount)}</span></div>`);
    totalsLines.push(`<div class="row grand"><span>Total</span><span>${formatBRL(order.total)}</span></div>`);
    totalsEl.innerHTML = totalsLines.join('');

    setTimeout(() => {
      try { window.focus(); } catch {}
    }, 10);
  } catch (e) {
    companyEl.innerHTML = '<div class="name">Erro</div>';
    metaEl.textContent = 'Não foi possível carregar o cupom.';
    itemsEl.textContent = String(e && e.message ? e.message : e);
  }

  if (printBtn) printBtn.addEventListener('click', () => window.print());
  if (closeBtn) closeBtn.addEventListener('click', () => window.close());
});
