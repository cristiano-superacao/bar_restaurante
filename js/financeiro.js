document.addEventListener('DOMContentLoaded', () => {
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = window.APP_STORAGE;
    const addTransacaoBtn = document.getElementById('add-transacao-btn');
    const modal = document.getElementById('transacao-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const transacaoForm = document.getElementById('transacao-form');
    const transacoesList = document.getElementById('transacoes-list');

    let transacoes = STORE.get('transacoes', [], ['transacoes']) || [];
    let editingTransacaoId = null;

    const saveTransacoes = () => {
        if (!apiEnabled) {
            STORE.set('transacoes', transacoes);
        }
    };

    const loadTransacoes = async () => {
        if (apiEnabled && window.API) {
            try {
                transacoes = await window.API.transactions.list();
            } catch (e) {
                console.warn('Falha ao carregar transações da API, usando LocalStorage.', e);
                transacoes = STORE.get('transacoes', transacoes, ['transacoes']) || transacoes;
            }
        } else {
            transacoes = STORE.get('transacoes', transacoes, ['transacoes']) || transacoes;
        }
    };

    const formatCurrency = window.CONFIG?.UTILS?.formatCurrency || ((v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    const formatDate = window.CONFIG?.UTILS?.formatDate || ((v) => new Date(String(v) + 'T00:00:00').toLocaleDateString('pt-BR'));

    const renderFinanceiro = () => {
        const empty = document.getElementById('transacoes-empty');
        transacoesList.innerHTML = '';
        
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

        // Configuração de cores e ícones por tipo
        const tipoConfig = {
            'Receita': { 
                icon: '💰', 
                color: '#10b981',
                iconClass: 'fa-arrow-trend-up',
                borderColor: '#10b981'
            },
            'Despesa': { 
                icon: '💸', 
                color: '#ef4444',
                iconClass: 'fa-arrow-trend-down',
                borderColor: '#ef4444'
            }
        };

        filtered.forEach(transacao => {
            const config = tipoConfig[transacao.tipo] || tipoConfig['Receita'];
            const isPago = (transacao.status || 'pago') === 'pago';

            const valorNum = Number(transacao.valor) || 0;
            
            if(transacao.tipo === 'Receita') {
                totalReceitas += valorNum;
            } else {
                totalDespesas += valorNum;
            }

            const item = document.createElement('div');
            item.className = `transacao-card ${transacao.tipo.toLowerCase()}`;
            item.setAttribute('data-tipo-color', config.color);
            
            item.innerHTML = `
                <div class="transacao-card-actions">
                    <button class="transacao-card-action-btn edit edit-btn" data-id="${transacao.id}" title="Editar">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="transacao-card-action-btn delete delete-btn" data-id="${transacao.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="transacao-card-header">
                    <div class="transacao-card-icon" style="background: linear-gradient(135deg, ${config.color}15, ${config.color}25); color: ${config.color};">
                        <span class="icon-emoji">${config.icon}</span>
                    </div>
                    <div class="transacao-card-info">
                        <div class="transacao-card-tipo-badge" style="background: linear-gradient(135deg, ${config.color}15, ${config.color}25); color: ${config.color}; border-color: ${config.color}30;">
                            <i class="fas ${config.iconClass}"></i> ${transacao.tipo}
                        </div>
                        <h3 class="transacao-card-descricao">${transacao.descricao}</h3>
                    </div>
                </div>
                <div class="transacao-card-body">
                    <div class="transacao-card-meta">
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(transacao.data)}
                        </span>
                        <span class="meta-item status-badge ${isPago ? 'pago' : 'pendente'}">
                            <i class="fas ${isPago ? 'fa-check-circle' : 'fa-clock'}"></i>
                            ${isPago ? 'Pago' : 'Pendente'}
                        </span>
                    </div>
                </div>
                <div class="transacao-card-footer">
                    <div class="transacao-card-valor-wrapper">
                        <span class="valor-label">Valor</span>
                        <span class="transacao-card-valor" style="background: linear-gradient(135deg, ${config.color}, ${config.color}dd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                            ${transacao.tipo === 'Receita' ? '+' : '-'} ${formatCurrency(valorNum)}
                        </span>
                    </div>
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

