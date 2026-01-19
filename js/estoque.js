document.addEventListener('DOMContentLoaded', () => {
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = window.APP_STORAGE;
    const addProdutoBtn = document.getElementById('add-produto-btn');
    const modal = document.getElementById('produto-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const produtoForm = document.getElementById('produto-form');
    const estoqueList = document.getElementById('estoque-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    let estoque = STORE.get('estoque', [], ['estoque', 'stock']) || [];
    let editingProdutoId = null;

    const toInt = (v, fallback = 0) => {
        const n = Number.parseInt(String(v ?? ''), 10);
        return Number.isFinite(n) ? n : fallback;
    };

    const normalizeProduto = (p) => {
        if (!p || typeof p !== 'object') return null;
        const id = p.id ?? p.stockId ?? p.stock_id ?? p.menuItemId ?? p.menu_item_id;
        const name = p.name ?? p.nome ?? '';
        const category = p.category ?? p.categoria ?? 'Outros';
        const unit = p.unit ?? p.unidade ?? 'un';
        const quantity = Number(p.quantity ?? p.quantidade ?? 0);
        const minQuantity = Number(p.minQuantity ?? p.min_quantity ?? p.quantidadeMinima ?? p.quantidade_minima ?? 0);
        const isAddon = p.isAddon ?? p.is_addon ?? false;
        return {
            ...p,
            id: id != null ? String(id) : String(Date.now()),
            name: String(name || '').trim(),
            category: String(category || 'Outros').trim(),
            unit: String(unit || 'un').trim(),
            quantity: Number.isFinite(quantity) ? quantity : 0,
            minQuantity: Number.isFinite(minQuantity) ? minQuantity : 0,
            isAddon: !!isAddon,
        };
    };

    const normalizeEstoqueList = (list) => {
        const arr = Array.isArray(list) ? list : [];
        return arr.map(normalizeProduto).filter(Boolean);
    };

    const saveEstoque = () => {
        if (!apiEnabled) {
            STORE.set('estoque', estoque);
        }
    };

    const loadEstoque = async () => {
        if (apiEnabled && window.API) {
            try {
                estoque = normalizeEstoqueList(await window.API.stock.list());
            } catch (e) {
                console.warn('Falha ao carregar estoque da API, usando LocalStorage.', e);
                estoque = normalizeEstoqueList(STORE.get('estoque', estoque, ['estoque', 'stock']) || estoque);
            }
        } else {
            estoque = normalizeEstoqueList(STORE.get('estoque', estoque, ['estoque', 'stock']) || estoque);
        }
    };

    const renderEstoque = () => {
        estoqueList.innerHTML = '';

        const q = String(searchInput?.value || '').trim().toLowerCase();
        const cat = String(categoryFilter?.value || 'all');

        const filteredEstoque = (Array.isArray(estoque) ? estoque : []).filter((produto) => {
            const name = String(produto?.name || '').toLowerCase();
            const searchMatch = !q || name.includes(q);
            const categoryMatch = cat === 'all' || String(produto?.category || '') === cat;
            return searchMatch && categoryMatch;
        });

        // Atualiza métricas
        const total = filteredEstoque.length;
        let baixo = 0, critico = 0, ok = 0;
        filteredEstoque.forEach(produto => {
            const quantity = Number(produto.quantity ?? 0);
            const minQuantity = Number(produto.minQuantity ?? 0);
            if (quantity === 0) critico++;
            else if (quantity <= minQuantity) baixo++;
            else ok++;
        });
        const el = id => document.getElementById(id);
        if (el('estoque-total')) el('estoque-total').textContent = String(total);
        if (el('estoque-baixo')) el('estoque-baixo').textContent = String(baixo);
        if (el('estoque-critico')) el('estoque-critico').textContent = String(critico);
        if (el('estoque-ok')) el('estoque-ok').textContent = String(ok);

        // Empty-state toggle
        const emptyEl = document.getElementById('estoque-empty');
        if (filteredEstoque.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        const iconByCategory = (category) => {
            switch (String(category || '').toLowerCase()) {
                case 'bebidas': return 'fa-wine-bottle';
                case 'ingredientes': return 'fa-carrot';
                case 'limpeza': return 'fa-broom';
                default: return 'fa-box-open';
            }
        };

        filteredEstoque.forEach(produto => {
            const item = document.createElement('div');

            const quantity = Number(produto.quantity ?? 0);
            const minQuantity = Number(produto.minQuantity ?? 0);

            let statusClass = 'ok';
            let statusText = 'OK';
            if (quantity === 0) {
                statusClass = 'critical';
                statusText = 'Crítico';
            } else if (quantity <= minQuantity) {
                statusClass = 'low';
                statusText = 'Baixo';
            }

            item.className = `estoque-item ${statusClass}`;

            item.innerHTML = `
                <div class="estoque-icon" aria-hidden="true"><i class="fas ${iconByCategory(produto.category)}"></i></div>
                <div class="estoque-info">
                    <div class="estoque-name">${String(produto.name || '')}</div>
                    <span class="estoque-category">${String(produto.category || 'Outros')}</span>
                </div>
                <div class="estoque-quantity">
                    <span class="quantity-value">${Number.isFinite(quantity) ? quantity : 0}</span>
                    <span class="quantity-unit">${String(produto.unit || 'un')}</span>
                    <div class="quantity-status">Mín: ${Number.isFinite(minQuantity) ? minQuantity : 0} ${String(produto.unit || 'un')} • ${statusText}</div>
                </div>
                <div class="estoque-actions">
                    <button class="estoque-action-btn edit" type="button" title="Editar" aria-label="Editar" data-id="${produto.id}"><i class="fas fa-pen"></i></button>
                    <button class="estoque-action-btn delete" type="button" title="Excluir" aria-label="Excluir" data-id="${produto.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            estoqueList.appendChild(item);
        });
    };

    const openModal = (produto = null) => {
        produtoForm.reset();
        const errEl = document.getElementById('estoque-form-error');
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
        if (produto) {
            document.getElementById('produto-modal-title').textContent = 'Editar Produto';
            const p = normalizeProduto(produto);
            editingProdutoId = p.id;
            document.getElementById('produto-id').value = p.id;
            document.getElementById('produto-name').value = p.name;
            document.getElementById('produto-category').value = p.category;
            document.getElementById('produto-quantity').value = String(toInt(p.quantity, 0));
            document.getElementById('produto-unit').value = p.unit;
            document.getElementById('produto-min-quantity').value = String(toInt(p.minQuantity, 0));
            const isAddonCheckbox = document.getElementById('produto-is-addon');
            if (isAddonCheckbox) isAddonCheckbox.checked = p.isAddon || false;
        } else {
            document.getElementById('produto-modal-title').textContent = 'Novo Produto';
            editingProdutoId = null;
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    addProdutoBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    produtoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('estoque-form-error');
        const showError = (msg) => { if (errEl) { errEl.textContent = String(msg || 'Erro'); errEl.style.display = 'block'; } };
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
        const isAddonCheckbox = document.getElementById('produto-is-addon');
        const produtoData = {
            id: editingProdutoId || Date.now().toString(),
            name: document.getElementById('produto-name').value,
            category: document.getElementById('produto-category').value,
            quantity: parseInt(document.getElementById('produto-quantity').value),
            unit: document.getElementById('produto-unit').value,
            minQuantity: parseInt(document.getElementById('produto-min-quantity').value),
            isAddon: isAddonCheckbox ? isAddonCheckbox.checked : false
        };

        // Validações básicas e mensagens amigáveis
        if (!produtoData.name || !String(produtoData.name).trim()) {
            showError('Nome do produto é obrigatório.');
            return;
        }
        if (!produtoData.category) {
            showError('Categoria é obrigatória.');
            return;
        }
        if (Number.isNaN(produtoData.quantity) || produtoData.quantity < 0) {
            showError('Quantidade deve ser um número maior ou igual a 0.');
            return;
        }
        if (!produtoData.unit || !String(produtoData.unit).trim()) {
            showError('Unidade é obrigatória (ex.: un, kg, L).');
            return;
        }
        if (Number.isNaN(produtoData.minQuantity) || produtoData.minQuantity < 0) {
            // Permitir vazio => 0
            produtoData.minQuantity = Number.isNaN(produtoData.minQuantity) ? 0 : produtoData.minQuantity;
        }

        if (apiEnabled && window.API) {
            try {
                if (editingProdutoId) {
                    await window.API.stock.update(Number(editingProdutoId), normalizeProduto(produtoData));
                } else {
                    await window.API.stock.create(normalizeProduto(produtoData));
                }
                await loadEstoque();
                renderEstoque();
                closeModal();
            } catch (err) {
                // Mensagens detalhadas vindas do helper da API
                if (err && err.code === 'NO_COMPANY_CONTEXT') {
                    showError('Selecione uma empresa para operar o estoque.');
                    return;
                }
                const msg = (err && err.details && (err.details.error || err.details.message))
                  ? (err.details.error || err.details.message)
                  : (err && err.message ? err.message : 'Erro ao salvar item de estoque');
                showError(msg);
            }
        } else {
            if (editingProdutoId) {
                estoque = (estoque || []).map(p => String(p.id) === String(editingProdutoId) ? normalizeProduto(produtoData) : normalizeProduto(p)).filter(Boolean);
            } else {
                estoque.push(normalizeProduto(produtoData));
            }
            estoque = normalizeEstoqueList(estoque);
            saveEstoque();
            renderEstoque();
            closeModal();
        }
    });

    estoqueList.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.estoque-action-btn.edit');
        if (editBtn) {
            const id = String(editBtn.dataset.id || '');
            const produto = (estoque || []).find(p => String(p.id) === String(id));
            openModal(produto);
        }
        const delBtn = e.target.closest('.estoque-action-btn.delete');
        if (delBtn) {
            const id = String(delBtn.dataset.id || '');
            if (apiEnabled && window.API) {
                try {
                    await window.API.stock.remove(Number(id));
                    await loadEstoque();
                } catch (err) {
                    alert('Erro ao excluir item de estoque via API.');
                }
            } else {
                estoque = (estoque || []).filter(p => String(p.id) !== String(id));
                saveEstoque();
            }
            renderEstoque();
        }
    });

    searchInput.addEventListener('input', renderEstoque);
    categoryFilter.addEventListener('change', renderEstoque);

    (async () => {
        await loadEstoque();
        renderEstoque();
    })();
});

