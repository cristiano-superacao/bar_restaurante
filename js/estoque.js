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

    let estoque = STORE.get('estoque', [], ['estoque']) || [];
    let editingProdutoId = null;

    const saveEstoque = () => {
        if (!apiEnabled) {
            STORE.set('estoque', estoque);
        }
    };

    const loadEstoque = async () => {
        if (apiEnabled && window.API) {
            try {
                estoque = await window.API.stock.list();
            } catch (e) {
                console.warn('Falha ao carregar estoque da API, usando LocalStorage.', e);
                estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
            }
        } else {
            estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
        }
    };

    const renderEstoque = () => {
        estoqueList.innerHTML = `
            <div class="estoque-header">
                <div>Produto</div>
                <div>Categoria</div>
                <div>Qtd</div>
                <div>Est. Mín.</div>
                <div>Status</div>
                <div>Ações</div>
            </div>
        `;
        const filteredEstoque = estoque.filter(produto => {
            const searchMatch = produto.name.toLowerCase().includes(searchInput.value.toLowerCase());
            const categoryMatch = categoryFilter.value === 'all' || produto.category === categoryFilter.value;
            return searchMatch && categoryMatch;
        });

        // Atualiza métricas
        const total = filteredEstoque.length;
        let baixo = 0, critico = 0, ok = 0;
        filteredEstoque.forEach(produto => {
            if (produto.quantity === 0) critico++;
            else if (produto.quantity <= produto.minQuantity) baixo++;
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
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
        }

        filteredEstoque.forEach(produto => {
            const item = document.createElement('div');
            item.className = 'estoque-item';

            let statusClass = 'ok';
            let statusText = 'OK';
            if (produto.quantity <= produto.minQuantity) {
                statusClass = 'baixo';
                statusText = 'Baixo';
            }
            if (produto.quantity == 0) {
                statusClass = 'critico';
                statusText = 'Crítico';
            }

            item.innerHTML = `
                <div>${produto.name}</div>
                <div>${produto.category}</div>
                <div>${produto.quantity} ${produto.unit}</div>
                <div>${produto.minQuantity} ${produto.unit}</div>
                <div><span class="status ${statusClass}">${statusText}</span></div>
                <div class="item-actions">
                    <button class="btn btn-secondary edit-btn" data-id="${produto.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger delete-btn" data-id="${produto.id}"><i class="fas fa-trash"></i></button>
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
            editingProdutoId = produto.id;
            document.getElementById('produto-id').value = produto.id;
            document.getElementById('produto-name').value = produto.name;
            document.getElementById('produto-category').value = produto.category;
            document.getElementById('produto-quantity').value = produto.quantity;
            document.getElementById('produto-unit').value = produto.unit;
            document.getElementById('produto-min-quantity').value = produto.minQuantity;
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
        const produtoData = {
            id: editingProdutoId || Date.now().toString(),
            name: document.getElementById('produto-name').value,
            category: document.getElementById('produto-category').value,
            quantity: parseInt(document.getElementById('produto-quantity').value),
            unit: document.getElementById('produto-unit').value,
            minQuantity: parseInt(document.getElementById('produto-min-quantity').value),
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
                    await window.API.stock.update(Number(editingProdutoId), produtoData);
                } else {
                    await window.API.stock.create(produtoData);
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
                estoque = estoque.map(p => p.id === editingProdutoId ? produtoData : p);
            } else {
                estoque.push(produtoData);
            }
            saveEstoque();
            renderEstoque();
            closeModal();
        }
    });

    estoqueList.addEventListener('click', async (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const produto = estoque.find(p => p.id === id);
            openModal(produto);
        }
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            if (apiEnabled && window.API) {
                try {
                    await window.API.stock.remove(Number(id));
                    await loadEstoque();
                } catch (err) {
                    alert('Erro ao excluir item de estoque via API.');
                }
            } else {
                estoque = estoque.filter(p => p.id !== id);
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

