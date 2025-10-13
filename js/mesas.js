/* ===== SISTEMA DE MESAS - MARIA FLOR ===== */

class SistemaMesas {
    constructor() {
        this.mesas = [];
        this.mesaSelecionada = null;
        this.filtroAtivo = 'todas';
        this.init();
    }

    init() {
        this.carregarMesas();
        this.setupEventListeners();
        this.atualizarContadores();
    }

    // Carregar mesas do localStorage ou criar dados padrão
    carregarMesas() {
        const mesasSalvas = localStorage.getItem('mariaflor_mesas');
        if (mesasSalvas) {
            this.mesas = JSON.parse(mesasSalvas);
        } else {
            this.criarMesasIniciais();
        }
        this.renderizarMesas();
    }

    // Criar mesas iniciais para demonstração
    criarMesasIniciais() {
        this.mesas = [
            {
                id: 1,
                numero: 1,
                capacidade: 4,
                status: 'livre',
                garcom: '',
                cliente: '',
                horarioReserva: '',
                valorPedido: 0,
                pedidoAtivo: false,
                itens: []
            },
            {
                id: 2,
                numero: 2,
                capacidade: 2,
                status: 'ocupada',
                garcom: 'Maria Silva',
                cliente: 'João Santos',
                horarioReserva: '',
                valorPedido: 45.50,
                pedidoAtivo: true,
                itens: ['Hambúrguer Clássico', 'Refrigerante']
            },
            {
                id: 3,
                numero: 3,
                capacidade: 6,
                status: 'reservada',
                garcom: '',
                cliente: 'Ana Costa',
                horarioReserva: '2025-10-13T19:30',
                valorPedido: 0,
                pedidoAtivo: false,
                itens: []
            },
            {
                id: 4,
                numero: 4,
                capacidade: 4,
                status: 'livre',
                garcom: '',
                cliente: '',
                horarioReserva: '',
                valorPedido: 0,
                pedidoAtivo: false,
                itens: []
            },
            {
                id: 5,
                numero: 5,
                capacidade: 8,
                status: 'ocupada',
                garcom: 'Pedro Oliveira',
                cliente: 'Família Silva',
                horarioReserva: '',
                valorPedido: 125.80,
                pedidoAtivo: true,
                itens: ['Pizza Margherita', 'Pizza Calabresa', 'Refrigerante', 'Suco Natural']
            },
            {
                id: 6,
                numero: 6,
                capacidade: 2,
                status: 'manutencao',
                garcom: '',
                cliente: '',
                horarioReserva: '',
                valorPedido: 0,
                pedidoAtivo: false,
                itens: []
            }
        ];
        this.salvarMesas();
    }

    // Salvar mesas no localStorage
    salvarMesas() {
        localStorage.setItem('mariaflor_mesas', JSON.stringify(this.mesas));
    }

    // Renderizar mesas na tela
    renderizarMesas() {
        const container = document.getElementById('mesasGrid');
        if (!container) return;

        const mesasFiltradas = this.filtroAtivo === 'todas' 
            ? this.mesas 
            : this.mesas.filter(mesa => mesa.status === this.filtroAtivo);

        container.innerHTML = '';

        mesasFiltradas.forEach(mesa => {
            const mesaCard = this.criarMesaCard(mesa);
            container.appendChild(mesaCard);
        });

        this.atualizarContadores();
    }

    // Criar card da mesa
    criarMesaCard(mesa) {
        const div = document.createElement('div');
        div.className = `mesa-card ${mesa.status}`;
        div.setAttribute('data-mesa-id', mesa.id);
        div.onclick = () => this.selecionarMesa(mesa.id);

        let detalhesExtra = '';
        if (mesa.status === 'ocupada') {
            detalhesExtra = `
                <div class="mesa-detalhes">
                    <div><strong>Garçom:</strong> ${mesa.garcom}</div>
                    <div class="mesa-valor">R$ ${mesa.valorPedido.toFixed(2)}</div>
                </div>
            `;
        } else if (mesa.status === 'reservada') {
            const horario = mesa.horarioReserva ? new Date(mesa.horarioReserva).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : '';
            detalhesExtra = `
                <div class="mesa-detalhes">
                    <div><strong>Cliente:</strong> ${mesa.cliente}</div>
                    <div><strong>Horário:</strong> ${horario}</div>
                </div>
            `;
        } else if (mesa.status === 'manutencao') {
            detalhesExtra = `
                <div class="mesa-detalhes">
                    <div><i class="fas fa-tools"></i> Em manutenção</div>
                </div>
            `;
        }

        div.innerHTML = `
            <div class="mesa-numero">Mesa ${mesa.numero}</div>
            <div class="mesa-info">
                <i class="fas fa-users"></i> ${mesa.capacidade} lugares
            </div>
            <div class="mesa-status ${mesa.status}">
                ${this.getStatusText(mesa.status)}
            </div>
            ${detalhesExtra}
        `;

        return div;
    }

    // Obter texto do status
    getStatusText(status) {
        const statusTexts = {
            livre: 'Livre',
            ocupada: 'Ocupada',
            reservada: 'Reservada',
            manutencao: 'Manutenção'
        };
        return statusTexts[status] || 'Desconhecido';
    }

    // Selecionar mesa
    selecionarMesa(mesaId) {
        // Remover seleção anterior
        document.querySelectorAll('.mesa-card').forEach(card => {
            card.classList.remove('selecionada');
        });

        // Adicionar seleção atual
        const mesaCard = document.querySelector(`[data-mesa-id="${mesaId}"]`);
        if (mesaCard) {
            mesaCard.classList.add('selecionada');
        }

        const mesa = this.mesas.find(m => m.id === mesaId);
        if (mesa) {
            this.mesaSelecionada = mesa;
            this.exibirDetalhesMesa(mesa);
        }
    }

    // Exibir detalhes da mesa no painel
    exibirDetalhesMesa(mesa) {
        const detailsContainer = document.getElementById('mesaDetails');
        if (!detailsContainer) return;

        const horario = mesa.horarioReserva ? 
            new Date(mesa.horarioReserva).toLocaleString('pt-BR') : 'Não definido';

        detailsContainer.innerHTML = `
            <div class="info-item">
                <span class="info-label">Mesa:</span>
                <span class="info-value">${mesa.numero}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Capacidade:</span>
                <span class="info-value">${mesa.capacidade} pessoas</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value mesa-status ${mesa.status}">${this.getStatusText(mesa.status)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Garçom:</span>
                <span class="info-value">${mesa.garcom || 'Não atribuído'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Cliente:</span>
                <span class="info-value">${mesa.cliente || 'Nenhum'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Horário Reserva:</span>
                <span class="info-value">${horario}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Valor do Pedido:</span>
                <span class="info-value mesa-valor">R$ ${mesa.valorPedido.toFixed(2)}</span>
            </div>
            ${mesa.itens.length > 0 ? `
                <div class="info-item">
                    <span class="info-label">Itens do Pedido:</span>
                    <span class="info-value">${mesa.itens.join(', ')}</span>
                </div>
            ` : ''}
            
            <div style="margin-top: 20px;">
                <button class="btn-primary" onclick="sistemaMesas.abrirModalMesa(${mesa.id})">
                    <i class="fas fa-edit"></i> Editar Mesa
                </button>
            </div>
        `;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Filtros de status
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.getAttribute('data-status');
                this.aplicarFiltro(status);
            });
        });

        // Modal events
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('mesaModal');
            if (e.target === modal) {
                this.fecharModalMesa();
            }
        });
    }

    // Aplicar filtro de status
    aplicarFiltro(status) {
        this.filtroAtivo = status;
        
        // Atualizar botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');

        this.renderizarMesas();
    }

    // Atualizar contadores
    atualizarContadores() {
        const contadores = {
            totalMesas: this.mesas.length,
            mesasLivres: this.mesas.filter(m => m.status === 'livre').length,
            mesasOcupadas: this.mesas.filter(m => m.status === 'ocupada').length,
            mesasReservadas: this.mesas.filter(m => m.status === 'reservada').length,
            mesasManutencao: this.mesas.filter(m => m.status === 'manutencao').length
        };

        Object.entries(contadores).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Abrir modal da mesa
    abrirModalMesa(mesaId = null) {
        const modal = document.getElementById('mesaModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (mesaId) {
            // Editar mesa existente
            const mesa = this.mesas.find(m => m.id === mesaId);
            if (mesa) {
                modalTitle.textContent = `Mesa ${mesa.numero} - Editar`;
                this.preencherFormularioMesa(mesa);
            }
        } else {
            // Nova mesa
            modalTitle.textContent = 'Adicionar Nova Mesa';
            this.limparFormularioMesa();
        }
        
        modal.style.display = 'block';
        this.atualizarBotoesModal();
    }

    // Preencher formulário com dados da mesa
    preencherFormularioMesa(mesa) {
        document.getElementById('mesaNumero').value = mesa.numero;
        document.getElementById('mesaCapacidade').value = mesa.capacidade;
        document.getElementById('mesaStatus').value = mesa.status;
        document.getElementById('mesaGarcom').value = mesa.garcom;
        document.getElementById('reservaCliente').value = mesa.cliente;
        document.getElementById('reservaHorario').value = mesa.horarioReserva;
        document.getElementById('pedidoValor').value = `R$ ${mesa.valorPedido.toFixed(2)}`;
        
        this.atualizarStatusMesa();
    }

    // Limpar formulário
    limparFormularioMesa() {
        document.getElementById('mesaNumero').value = '';
        document.getElementById('mesaCapacidade').value = '4';
        document.getElementById('mesaStatus').value = 'livre';
        document.getElementById('mesaGarcom').value = '';
        document.getElementById('reservaCliente').value = '';
        document.getElementById('reservaHorario').value = '';
        document.getElementById('pedidoValor').value = 'R$ 0,00';
        
        this.atualizarStatusMesa();
    }

    // Atualizar campos baseado no status
    atualizarStatusMesa() {
        const status = document.getElementById('mesaStatus').value;
        const reservaInfo = document.getElementById('reservaInfo');
        const pedidoInfo = document.getElementById('pedidoInfo');
        
        // Mostrar/ocultar campos baseado no status
        if (status === 'reservada') {
            reservaInfo.style.display = 'flex';
        } else {
            reservaInfo.style.display = 'none';
        }
        
        if (status === 'ocupada') {
            pedidoInfo.style.display = 'block';
        } else {
            pedidoInfo.style.display = 'none';
        }
        
        this.atualizarBotoesModal();
    }

    // Atualizar botões do modal baseado no status
    atualizarBotoesModal() {
        const status = document.getElementById('mesaStatus').value;
        const btnIniciarPedido = document.getElementById('btnIniciarPedido');
        const btnVerPedido = document.getElementById('btnVerPedido');
        const btnFecharConta = document.getElementById('btnFecharConta');
        
        // Ocultar todos os botões primeiro
        [btnIniciarPedido, btnVerPedido, btnFecharConta].forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        
        // Mostrar botões baseado no status
        if (status === 'livre') {
            if (btnIniciarPedido) btnIniciarPedido.style.display = 'inline-block';
        } else if (status === 'ocupada') {
            if (btnVerPedido) btnVerPedido.style.display = 'inline-block';
            if (btnFecharConta) btnFecharConta.style.display = 'inline-block';
        }
    }

    // Salvar mesa
    salvarMesa() {
        const numero = parseInt(document.getElementById('mesaNumero').value);
        const capacidade = parseInt(document.getElementById('mesaCapacidade').value);
        const status = document.getElementById('mesaStatus').value;
        const garcom = document.getElementById('mesaGarcom').value;
        const cliente = document.getElementById('reservaCliente').value;
        const horarioReserva = document.getElementById('reservaHorario').value;
        
        if (!numero || numero <= 0) {
            alert('Por favor, insira um número válido para a mesa.');
            return;
        }

        // Verificar se o número da mesa já existe (exceto na mesa atual)
        const mesaExistente = this.mesas.find(m => 
            m.numero === numero && (!this.mesaSelecionada || m.id !== this.mesaSelecionada.id)
        );
        
        if (mesaExistente) {
            alert(`Já existe uma mesa com o número ${numero}. Por favor, escolha outro número.`);
            return;
        }

        let mesa;
        if (this.mesaSelecionada) {
            // Editar mesa existente
            mesa = this.mesaSelecionada;
        } else {
            // Nova mesa
            mesa = {
                id: Date.now(),
                valorPedido: 0,
                pedidoAtivo: false,
                itens: []
            };
            this.mesas.push(mesa);
        }

        // Atualizar dados da mesa
        mesa.numero = numero;
        mesa.capacidade = capacidade;
        mesa.status = status;
        mesa.garcom = garcom;
        mesa.cliente = cliente;
        mesa.horarioReserva = horarioReserva;

        // Limpar dados irrelevantes baseado no status
        if (status !== 'reservada') {
            mesa.cliente = '';
            mesa.horarioReserva = '';
        }
        if (status !== 'ocupada') {
            mesa.valorPedido = 0;
            mesa.pedidoAtivo = false;
            mesa.itens = [];
        }

        this.salvarMesas();
        this.renderizarMesas();
        this.fecharModalMesa();
        
        this.showNotification('Mesa salva com sucesso!', 'success');
    }

    // Excluir mesa
    excluirMesa() {
        if (!this.mesaSelecionada) return;
        
        if (confirm(`Tem certeza que deseja excluir a Mesa ${this.mesaSelecionada.numero}?`)) {
            this.mesas = this.mesas.filter(m => m.id !== this.mesaSelecionada.id);
            this.salvarMesas();
            this.renderizarMesas();
            this.fecharModalMesa();
            
            this.showNotification('Mesa excluída com sucesso!', 'success');
        }
    }

    // Fechar modal
    fecharModalMesa() {
        const modal = document.getElementById('mesaModal');
        modal.style.display = 'none';
        this.mesaSelecionada = null;
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Criar elemento de notificação se não existir
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        // Definir cor baseada no tipo
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }

    // Ações dos botões do modal
    iniciarPedido() {
        if (this.mesaSelecionada) {
            this.showNotification('Funcionalidade de pedidos será implementada em breve!', 'info');
        }
    }

    verPedido() {
        if (this.mesaSelecionada) {
            this.showNotification('Visualizando pedido da mesa...', 'info');
        }
    }

    fecharConta() {
        if (this.mesaSelecionada) {
            if (confirm(`Fechar conta da Mesa ${this.mesaSelecionada.numero}?`)) {
                this.mesaSelecionada.status = 'livre';
                this.mesaSelecionada.garcom = '';
                this.mesaSelecionada.cliente = '';
                this.mesaSelecionada.valorPedido = 0;
                this.mesaSelecionada.pedidoAtivo = false;
                this.mesaSelecionada.itens = [];
                
                this.salvarMesas();
                this.renderizarMesas();
                this.fecharModalMesa();
                
                this.showNotification('Conta fechada com sucesso!', 'success');
            }
        }
    }
}

// Funções globais para os botões
function adicionarMesa() {
    sistemaMesas.abrirModalMesa();
}

function reorganizarMesas() {
    sistemaMesas.showNotification('Funcionalidade de reorganização será implementada em breve!', 'info');
}

function salvarMesa() {
    sistemaMesas.salvarMesa();
}

function excluirMesa() {
    sistemaMesas.excluirMesa();
}

function fecharModalMesa() {
    sistemaMesas.fecharModalMesa();
}

function atualizarStatusMesa() {
    sistemaMesas.atualizarStatusMesa();
}

function iniciarPedido() {
    sistemaMesas.iniciarPedido();
}

function verPedido() {
    sistemaMesas.verPedido();
}

function fecharConta() {
    sistemaMesas.fecharConta();
}

// Inicializar sistema quando a página carregar
function inicializarMesas() {
    window.sistemaMesas = new SistemaMesas();
}

// Exportar para uso global
window.SistemaMesas = SistemaMesas;