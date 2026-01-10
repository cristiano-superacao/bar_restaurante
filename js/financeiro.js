document.addEventListener('DOMContentLoaded', () => {
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const addTransacaoBtn = document.getElementById('add-transacao-btn');
    const modal = document.getElementById('transacao-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const transacaoForm = document.getElementById('transacao-form');
    const transacoesList = document.getElementById('transacoes-list');

    let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
    let editingTransacaoId = null;

    const saveTransacoes = () => {
        if (!apiEnabled) {
            localStorage.setItem('transacoes', JSON.stringify(transacoes));
        }
    };

    const loadTransacoes = async () => {
        if (apiEnabled && window.API) {
            try {
                transacoes = await window.API.transactions.list();
            } catch (e) {
                console.warn('Falha ao carregar transações da API, usando LocalStorage.', e);
                transacoes = JSON.parse(localStorage.getItem('transacoes')) || transacoes;
            }
        } else {
            transacoes = JSON.parse(localStorage.getItem('transacoes')) || transacoes;
        }
    };

    const formatCurrency = (value) => {
        if (window.CONFIG && window.CONFIG.UTILS && typeof window.CONFIG.UTILS.formatCurrency === 'function') {
            return window.CONFIG.UTILS.formatCurrency(value);
        }
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const renderFinanceiro = () => {
        const empty = document.getElementById('transacoes-empty');
        transacoesList.innerHTML = `
            <div class="transacao-header">
                <div>Descrição</div>
                <div>Valor</div>
                <div>Tipo</div>
                <div>Data</div>
                <div>Ações</div>
            </div>
        `;
        let totalReceitas = 0;
        let totalDespesas = 0;

        const searchTerm = (document.getElementById('financeiro-search')?.value || '').toLowerCase();
        const tipoFilter = document.getElementById('financeiro-tipo-filter')?.value || 'todos';
        const statusFilter = document.getElementById('financeiro-status-filter')?.value || 'todos';

        const filtered = transacoes.filter(t => {
            const matchSearch = !searchTerm || (t.descricao || '').toLowerCase().includes(searchTerm);
            const matchTipo = tipoFilter === 'todos' || (t.tipo || '').toLowerCase() === (tipoFilter === 'receita' ? 'receita' : 'despesa');
            const matchStatus = statusFilter === 'todos' || (t.status || 'pago') === statusFilter;
            return matchSearch && matchTipo && matchStatus;
        });

        filtered.forEach(transacao => {
            const item = document.createElement('div');
            item.className = 'transacao-item';

            if(transacao.tipo === 'Receita') {
                totalReceitas += transacao.valor;
            } else {
                totalDespesas += transacao.valor;
            }

            item.innerHTML = `
                <div>${transacao.descricao}</div>
                <div class="valor ${transacao.tipo.toLowerCase()}">${formatCurrency(transacao.valor)}</div>
                <div>${transacao.tipo}</div>
                <div>${new Date(transacao.data + 'T00:00:00').toLocaleDateString()}</div>
                <div class="transacao-actions">
                    <button class="btn btn-secondary edit-btn" data-id="${transacao.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger delete-btn" data-id="${transacao.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            transacoesList.appendChild(item);
        });

        document.getElementById('total-receitas').textContent = formatCurrency(totalReceitas);
        document.getElementById('total-despesas').textContent = formatCurrency(totalDespesas);
        document.getElementById('saldo-total').textContent = formatCurrency(totalReceitas - totalDespesas);
        const hasItems = filtered.length > 0;
        if (empty) empty.style.display = hasItems ? 'none' : 'flex';
    };

    const openModal = (transacao = null) => {
        transacaoForm.reset();
        if (transacao) {
            document.getElementById('transacao-modal-title').textContent = 'Editar Transação';
            editingTransacaoId = transacao.id;
            document.getElementById('transacao-id').value = transacao.id;
            document.getElementById('transacao-descricao').value = transacao.descricao;
            document.getElementById('transacao-valor').value = transacao.valor;
            document.getElementById('transacao-tipo').value = transacao.tipo;
            document.getElementById('transacao-data').value = transacao.data;
        } else {
            document.getElementById('transacao-modal-title').textContent = 'Nova Transação';
            editingTransacaoId = null;
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    addTransacaoBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    transacaoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const transacaoData = {
            id: editingTransacaoId || Date.now().toString(),
            descricao: document.getElementById('transacao-descricao').value,
            valor: parseFloat(document.getElementById('transacao-valor').value),
            tipo: document.getElementById('transacao-tipo').value,
            data: document.getElementById('transacao-data').value,
            status: 'pago'
        };

        if (apiEnabled && window.API) {
            try {
                if (editingTransacaoId) {
                    await window.API.transactions.update(Number(editingTransacaoId), transacaoData);
                } else {
                    await window.API.transactions.create(transacaoData);
                }
                await loadTransacoes();
                renderFinanceiro();
                closeModal();
            } catch (err) {
                alert('Erro ao salvar transação via API.');
            }
        } else {
            if (editingTransacaoId) {
                transacoes = transacoes.map(t => t.id === editingTransacaoId ? transacaoData : t);
            } else {
                transacoes.push(transacaoData);
            }
            saveTransacoes();
            renderFinanceiro();
            closeModal();
        }
    });

    transacoesList.addEventListener('click', async (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const transacao = transacoes.find(t => t.id === id);
            openModal(transacao);
        }
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            if (apiEnabled && window.API) {
                try {
                    await window.API.transactions.remove(Number(id));
                    await loadTransacoes();
                } catch (err) {
                    alert('Erro ao excluir transação via API.');
                }
            } else {
                transacoes = transacoes.filter(t => t.id !== id);
                saveTransacoes();
            }
            renderFinanceiro();
        }
    });

    // Filtros e busca
    ['financeiro-search','financeiro-tipo-filter','financeiro-status-filter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', renderFinanceiro);
            el.addEventListener('change', renderFinanceiro);
        }
    });

    (async () => {
        await loadTransacoes();
        renderFinanceiro();
    })();
});

