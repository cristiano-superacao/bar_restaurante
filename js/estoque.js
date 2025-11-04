document.addEventListener('DOMContentLoaded', () => {
    const addProdutoBtn = document.getElementById('add-produto-btn');
    const modal = document.getElementById('produto-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const produtoForm = document.getElementById('produto-form');
    const estoqueList = document.getElementById('estoque-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
    let editingProdutoId = null;

    const saveEstoque = () => {
        localStorage.setItem('estoque', JSON.stringify(estoque));
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

    produtoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const produtoData = {
            id: editingProdutoId || Date.now().toString(),
            name: document.getElementById('produto-name').value,
            category: document.getElementById('produto-category').value,
            quantity: parseInt(document.getElementById('produto-quantity').value),
            unit: document.getElementById('produto-unit').value,
            minQuantity: parseInt(document.getElementById('produto-min-quantity').value),
        };

        if (editingProdutoId) {
            estoque = estoque.map(p => p.id === editingProdutoId ? produtoData : p);
        } else {
            estoque.push(produtoData);
        }
        saveEstoque();
        renderEstoque();
        closeModal();
    });

    estoqueList.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const produto = estoque.find(p => p.id === id);
            openModal(produto);
        }
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            estoque = estoque.filter(p => p.id !== id);
            saveEstoque();
            renderEstoque();
        }
    });

    searchInput.addEventListener('input', renderEstoque);
    categoryFilter.addEventListener('change', renderEstoque);

    renderEstoque();
});
