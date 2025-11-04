document.addEventListener('DOMContentLoaded', () => {
    const addTransacaoBtn = document.getElementById('add-transacao-btn');
    const modal = document.getElementById('transacao-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const transacaoForm = document.getElementById('transacao-form');
    const transacoesList = document.getElementById('transacoes-list');

    let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
    let editingTransacaoId = null;

    const saveTransacoes = () => {
        localStorage.setItem('transacoes', JSON.stringify(transacoes));
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const renderFinanceiro = () => {
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

        transacoes.forEach(transacao => {
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

    transacaoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const transacaoData = {
            id: editingTransacaoId || Date.now().toString(),
            descricao: document.getElementById('transacao-descricao').value,
            valor: parseFloat(document.getElementById('transacao-valor').value),
            tipo: document.getElementById('transacao-tipo').value,
            data: document.getElementById('transacao-data').value,
        };

        if (editingTransacaoId) {
            transacoes = transacoes.map(t => t.id === editingTransacaoId ? transacaoData : t);
        } else {
            transacoes.push(transacaoData);
        }
        saveTransacoes();
        renderFinanceiro();
        closeModal();
    });

    transacoesList.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const transacao = transacoes.find(t => t.id === id);
            openModal(transacao);
        }
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            transacoes = transacoes.filter(t => t.id !== id);
            saveTransacoes();
            renderFinanceiro();
        }
    });

    renderFinanceiro();
});
