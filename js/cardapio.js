document.addEventListener('DOMContentLoaded', function () {
    // --- Elementos do DOM ---
    const menuGrid = document.getElementById('menu-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const addItemBtn = document.getElementById('add-item-btn');
    const modal = document.getElementById('item-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const itemForm = document.getElementById('item-form');
    const modalTitle = document.getElementById('modal-title');
    const itemIdInput = document.getElementById('item-id');
    const itemFormErrorWrap = document.getElementById('item-form-error');
    const productAddonsSection = document.getElementById('product-addons-section');
    const productAddonsOptions = document.getElementById('product-addons-options');
    const productAddonsCount = document.getElementById('product-addons-count');

    const ADDONS_MAX = 4;

    // --- Dados Iniciais (Simulação de um banco de dados) ---
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = window.APP_STORAGE;

    let estoque = STORE.get('estoque', [], ['estoque']) || [];

    let menuItems = STORE.get('menuItems', null, ['menuItems']);
    if (!menuItems) menuItems = [
        {
            id: 1,
            name: 'Hambúrguer Clássico',
            category: 'Lanches',
            price: 25.50,
            description: 'Pão, carne, queijo, alface, tomate e molho especial.'
        },
        {
            id: 2,
            name: 'Pizza Margherita',
            category: 'Pizzas',
            price: 45.00,
            description: 'Molho de tomate, mussarela fresca, manjericão e azeite.'
        },
        {
            id: 3,
            name: 'Coca-Cola Lata',
            category: 'Bebidas',
            price: 5.00,
            description: 'Refrigerante de cola gelado, 350ml.'
        },
        {
            id: 4,
            name: 'Pudim de Leite',
            category: 'Sobremesas',
            price: 12.00,
            description: 'Pudim de leite condensado com calda de caramelo.'
        }
    ];

    // --- Funções ---

    const formatBRL = window.CONFIG?.UTILS?.formatCurrency || ((v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

    const showFormError = (msg) => {
        if (!itemFormErrorWrap) return;
        const box = itemFormErrorWrap.querySelector('.alert');
        if (box) box.textContent = String(msg || 'Erro');
        itemFormErrorWrap.style.display = 'block';
    };

    const clearFormError = () => {
        if (!itemFormErrorWrap) return;
        const box = itemFormErrorWrap.querySelector('.alert');
        if (box) box.textContent = '';
        itemFormErrorWrap.style.display = 'none';
    };

    function normalizeText(v) {
        try {
            return String(v || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
        } catch {
            return String(v || '').toLowerCase();
        }
    }

    function isAddonStockItem(stockItem) {
        const cat = normalizeText(stockItem?.category);
        return stockItem?.isAddon === true || stockItem?.is_addon === true || cat.includes('acomp');
    }

    async function loadStock() {
        if (apiEnabled && window.API) {
            try {
                estoque = await window.API.stock.list();
            } catch (e) {
                console.warn('Falha ao carregar estoque via API, usando LocalStorage.', e);
                estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
            }
        } else {
            estoque = STORE.get('estoque', estoque, ['estoque']) || estoque;
        }
    }

    function getAddonStockOptions() {
        const list = Array.isArray(estoque) ? estoque : [];
        return list
            .filter(isAddonStockItem)
            .map(s => ({
                id: s.id,
                name: s.name,
                quantity: Number(s.quantity ?? s.quantidade ?? 0),
                unit: s.unit || s.unidade || 'un',
            }))
            .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
    }

    function getSelectedAddonIds() {
        if (!productAddonsOptions) return [];
        const checked = Array.from(productAddonsOptions.querySelectorAll('input[type="checkbox"]:checked'));
        return checked.map(i => String(i.value)).filter(Boolean);
    }

    function updateAddonsLimitUI() {
        if (!productAddonsOptions) return;
        const checkboxes = Array.from(productAddonsOptions.querySelectorAll('input[type="checkbox"]'));
        const labels = Array.from(productAddonsOptions.querySelectorAll('.addon-option'));
        const selectedCount = checkboxes.filter(cb => cb.checked).length;
        if (productAddonsCount) productAddonsCount.textContent = `${selectedCount}/${ADDONS_MAX}`;

        const shouldLock = selectedCount >= ADDONS_MAX;
        checkboxes.forEach((cb, idx) => {
            const label = labels[idx];
            if (!label) return;
            const isSelected = cb.checked;
            const shouldDisable = shouldLock && !isSelected;
            cb.disabled = cb.disabled || shouldDisable;
            label.classList.toggle('is-disabled', cb.disabled);
            label.classList.toggle('is-locked', shouldLock && isSelected);
        });
    }

    function renderProductAddonOptions(selectedIds = []) {
        if (!productAddonsOptions) return;
        const opts = getAddonStockOptions();
        if (opts.length === 0) {
            productAddonsOptions.innerHTML = '<div class="empty-message" style="margin:0;">Cadastre itens no estoque e marque como Acompanhamento.</div>';
            if (productAddonsCount) productAddonsCount.textContent = `0/${ADDONS_MAX}`;
            return;
        }
        const selectedSet = new Set((selectedIds || []).map(s => String(s)));
        productAddonsOptions.innerHTML = '';

        opts.forEach((s) => {
            const isOut = s.quantity <= 0;
            const isChecked = selectedSet.has(String(s.id));
            const label = document.createElement('label');
            label.className = `addon-option${isOut ? ' is-disabled' : ''}`;
            label.innerHTML = `
                <input type="checkbox" value="${String(s.id)}" ${(isOut && !isChecked) ? 'disabled' : ''} ${isChecked ? 'checked' : ''}>
                <span class="addon-name">${String(s.name)}</span>
                <span class="addon-meta">${Number.isFinite(s.quantity) ? s.quantity : 0} ${String(s.unit)}</span>
            `;
            productAddonsOptions.appendChild(label);
        });

        updateAddonsLimitUI();
    }

    function onProductAddonToggle(e) {
        const target = e.target;
        if (!target || target.tagName !== 'INPUT' || target.type !== 'checkbox') return;
        const checked = getSelectedAddonIds();
        if (checked.length > ADDONS_MAX) {
            target.checked = false;
            showFormError(`Selecione no máximo ${ADDONS_MAX} opções.`);
        } else {
            clearFormError();
        }
        updateAddonsLimitUI();
    }

    // Popula o filtro de categorias dinamicamente
    function populateCategoryFilter() {
        const categories = [...new Set(menuItems.map(item => item.category))];
        categoryFilter.innerHTML = '<option value="all">Todas as Categorias</option>';
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Salva os itens no localStorage
    function saveItems() {
        if (!apiEnabled) {
            STORE.set('menuItems', menuItems);
        }
    }

    async function loadItems() {
        if (apiEnabled && window.API) {
            try {
                menuItems = await window.API.menu.list();
            } catch (e) {
                console.warn('Falha ao carregar cardápio da API, usando LocalStorage.', e);
                menuItems = STORE.get('menuItems', menuItems, ['menuItems']) || menuItems;
            }
        } else {
            menuItems = STORE.get('menuItems', menuItems, ['menuItems']) || menuItems;
        }
    }

    // Renderiza os itens do cardápio no grid
    function renderMenuItems(items) {
        const stockList = Array.isArray(estoque) ? estoque : [];
        const stockNameById = new Map(stockList.map(s => [String(s.id), String(s.name || '')]));

        menuGrid.innerHTML = '';
        if (items.length === 0) {
            menuGrid.innerHTML = '<p>Nenhum item encontrado com os filtros atuais.</p>';
            return;
        }
        items.forEach(item => {
            const addonIds = item.addonStockIds || item.addon_stock_ids || [];
            const addonsText = (Array.isArray(addonIds) && addonIds.length)
                ? addonIds
                    .slice(0, 4)
                    .map(id => stockNameById.get(String(id)) || '')
                    .filter(Boolean)
                    .join(', ')
                : '';

            const card = document.createElement('div');
            const catClass = `cat-${(item.category||'').replace(/\s+/g,'')}`;
            card.className = `menu-item-card ${catClass}`;
            card.innerHTML = `
                <div class="card-content">
                    <span class="card-category">${item.category}</span>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-description">${item.description}</p>
                    ${addonsText ? `<div class="menu-card-addons"><strong>Acomp:</strong> ${addonsText}</div>` : ''}
                    <div class="card-footer">
                        <span class="card-price">${formatBRL(item.price)}</span>
                        <div class="card-actions">
                            <button class="btn btn-secondary btn-edit" data-id="${item.id}" title="Editar"><i class="fas fa-pen"></i> Editar</button>
                            <button class="btn btn-secondary btn-delete" data-id="${item.id}" title="Excluir"><i class="fas fa-trash"></i> Excluir</button>
                        </div>
                    </div>
                </div>
            `;
            menuGrid.appendChild(card);
        });
    }

    // Filtra e renderiza os itens
    function filterAndRender() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        const filteredItems = menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || item.category === category;
            return matchesSearch && matchesCategory;
        });

        renderMenuItems(filteredItems);

        // Atualiza cards de métricas
        const total = menuItems.length;
        const categorias = new Set(menuItems.map(i => i.category));
        const precoMedio = total ? (menuItems.reduce((sum, i) => sum + (i.price || 0), 0) / total) : 0;
        const fmt = (window.CONFIG && window.CONFIG.UTILS) ? window.CONFIG.UTILS.formatCurrency : (v => `R$ ${v.toFixed(2).replace('.', ',')}`);
        const totalEl = document.getElementById('menu-total');
        const catEl = document.getElementById('menu-categorias');
        const avgEl = document.getElementById('menu-preco-medio');
        if (totalEl) totalEl.textContent = total;
        if (catEl) catEl.textContent = categorias.size;
        if (avgEl) avgEl.textContent = fmt(precoMedio);
    }

    // Abre o modal
    function openModal(item = null) {
        itemForm.reset();
        clearFormError();
        if (item) {
            modalTitle.textContent = 'Editar Item';
            itemIdInput.value = item.id;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-description').value = item.description;

            const selected = item.addonStockIds || item.addon_stock_ids || [];
            renderProductAddonOptions(Array.isArray(selected) ? selected : []);
        } else {
            modalTitle.textContent = 'Adicionar Novo Item';
            itemIdInput.value = '';

            renderProductAddonOptions([]);
        }
        modal.classList.add('show');
    }

    // Fecha o modal
    function closeModal() {
        modal.classList.remove('show');
    }

    // Manipula o envio do formulário (Adicionar/Editar)
    async function handleFormSubmit(e) {
        e.preventDefault();
        const id = itemIdInput.value;
        const categoryInput = document.getElementById('item-category');
        const category = categoryInput.value.trim();

        const selectedAddonIds = getSelectedAddonIds();
        if (selectedAddonIds.length > ADDONS_MAX) {
            showFormError(`Selecione no máximo ${ADDONS_MAX} opções.`);
            return;
        }

        const newItem = {
            id: id ? parseInt(id) : Date.now(), // Cria um novo ID se não existir
            name: document.getElementById('item-name').value,
            category: category,
            price: parseFloat(document.getElementById('item-price').value),
            description: document.getElementById('item-description').value,
            addonStockIds: selectedAddonIds
        };

        if (apiEnabled && window.API) {
            try {
                if (id) {
                    await window.API.menu.update(parseInt(id), newItem);
                } else {
                    await window.API.menu.create(newItem);
                }
                await loadItems();
                populateCategoryFilter();
                filterAndRender();
                closeModal();
            } catch (err) {
                const msg = (err && err.details && (err.details.error || err.details.message))
                    ? `Erro: ${err.details.error || err.details.message}`
                    : 'Erro ao salvar item via API.';
                showFormError(msg);
            }
        } else {
            if (id) {
                menuItems = menuItems.map(item => item.id === parseInt(id) ? newItem : item);
            } else {
                menuItems.push(newItem);
            }
            saveItems();
            populateCategoryFilter(); // Atualiza as categorias no filtro
            filterAndRender();
            closeModal();
        }
    }

    // Manipula cliques no grid (para editar ou deletar)
    async function handleGridClick(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const id = parseInt(target.dataset.id);

        if (target.classList.contains('btn-edit')) {
            const itemToEdit = menuItems.find(item => item.id === id);
            openModal(itemToEdit);
        }

        if (target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este item?')) {
                if (apiEnabled && window.API) {
                    try {
                        await window.API.menu.remove(id);
                        await loadItems();
                    } catch (err) {
                        alert('Erro ao excluir item via API.');
                    }
                } else {
                    menuItems = menuItems.filter(item => item.id !== id);
                    saveItems();
                }
                populateCategoryFilter();
                filterAndRender();
            }
        }
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', filterAndRender);
    categoryFilter.addEventListener('change', filterAndRender);
    addItemBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    itemForm.addEventListener('submit', handleFormSubmit);
    menuGrid.addEventListener('click', handleGridClick);
    if (productAddonsOptions) productAddonsOptions.addEventListener('change', onProductAddonToggle);

    // --- Inicialização ---
    (async () => {
        await loadStock();
        await loadItems();
        populateCategoryFilter();
        filterAndRender();
    })();
});
