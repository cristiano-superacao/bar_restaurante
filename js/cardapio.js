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

    // --- Dados Iniciais (Simulação de um banco de dados) ---
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = (typeof window !== 'undefined' && window.APP_STORAGE)
        ? window.APP_STORAGE
        : {
            get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (def ?? null); } catch { return def ?? null; } },
            set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
        };

    let menuItems = STORE.get('menuItems', null, ['menuItems']);
    if (!menuItems) menuItems = [
        {
            id: 1,
            name: 'Hambúrguer Clássico',
            category: 'Lanches',
            price: 25.50,
            description: 'Pão, carne, queijo, alface, tomate e molho especial.',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
        },
        {
            id: 2,
            name: 'Pizza Margherita',
            category: 'Pizzas',
            price: 45.00,
            description: 'Molho de tomate, mussarela fresca, manjericão e azeite.',
            image: 'https://images.unsplash.com/photo-1598021680942-85f81e038dd4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
        },
        {
            id: 3,
            name: 'Coca-Cola Lata',
            category: 'Bebidas',
            price: 5.00,
            description: 'Refrigerante de cola gelado, 350ml.',
            image: 'https://images.unsplash.com/photo-1622483767028-3f66f32a2ea7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
        },
        {
            id: 4,
            name: 'Pudim de Leite',
            category: 'Sobremesas',
            price: 12.00,
            description: 'Pudim de leite condensado com calda de caramelo.',
            image: 'https://images.unsplash.com/photo-1586985289933-60a93a935c17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
        }
    ];

    // --- Funções ---

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
        menuGrid.innerHTML = '';
        if (items.length === 0) {
            menuGrid.innerHTML = '<p>Nenhum item encontrado com os filtros atuais.</p>';
            return;
        }
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            card.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/300x180.png?text=Sem+Imagem'}" alt="${item.name}" class="card-image">
                <div class="card-content">
                    <span class="card-category">${item.category}</span>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-description">${item.description}</p>
                    <div class="card-footer">
                        <span class="card-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                        <div class="card-actions">
                            <button class="btn btn-edit" data-id="${item.id}" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-delete" data-id="${item.id}" title="Excluir"><i class="fas fa-trash"></i></button>
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
        if (item) {
            modalTitle.textContent = 'Editar Item';
            itemIdInput.value = item.id;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-description').value = item.description;
            document.getElementById('item-image').value = item.image;
        } else {
            modalTitle.textContent = 'Adicionar Novo Item';
            itemIdInput.value = '';
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

        const newItem = {
            id: id ? parseInt(id) : Date.now(), // Cria um novo ID se não existir
            name: document.getElementById('item-name').value,
            category: category,
            price: parseFloat(document.getElementById('item-price').value),
            description: document.getElementById('item-description').value,
            image: document.getElementById('item-image').value
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
                alert('Erro ao salvar item via API.');
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

    // --- Inicialização ---
    (async () => {
        await loadItems();
        populateCategoryFilter();
        filterAndRender();
    })();
});
