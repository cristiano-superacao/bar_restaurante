document.addEventListener('DOMContentLoaded', () => {
    const addReservaBtn = document.getElementById('add-reserva-btn');
    const modal = document.getElementById('reserva-modal');
    const closeModalBtn = modal.querySelector('.close-btn');
    const reservaForm = document.getElementById('reserva-form');
    const reservasGrid = document.getElementById('reservas-grid');
    const searchInput = document.getElementById('search-input');
    const dateFilter = document.getElementById('date-filter');
    const statusFilter = document.getElementById('status-filter');
    const emptyEl = document.getElementById('reservas-empty');

    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = window.APP_STORAGE;

    let reservas = STORE.get('reservas', [], ['reservas']) || [];
    let editingReservaId = null;

    async function loadReservas() {
        if (apiEnabled && window.API && window.API.reservations) {
            try {
                reservas = await window.API.reservations.list();
                return;
            } catch (e) {
                console.warn('Falha ao carregar reservas da API, usando LocalStorage.', e);
            }
        }
        reservas = STORE.get('reservas', [], ['reservas']) || [];
    }

    const saveReservas = () => {
        STORE.set('reservas', reservas);
    };

    function fmtTime(v) {
        const s = String(v || '');
        return s.length >= 5 ? s.slice(0, 5) : s;
    }

    const renderReservas = () => {
        reservasGrid.innerHTML = '';
        const filteredReservas = reservas.filter(reserva => {
            const q = (searchInput.value || '').toLowerCase();
            const searchMatch = (reserva.name || '').toLowerCase().includes(q) || (reserva.phone || '').includes(searchInput.value || '');
            const dateMatch = !dateFilter.value || reserva.date === dateFilter.value;
            const statusMatch = !statusFilter || statusFilter.value === 'all' || reserva.status === statusFilter.value;
            return searchMatch && dateMatch && statusMatch;
        });

        // métricas
        const stats = { Confirmada: 0, Pendente: 0, Cancelada: 0, total: filteredReservas.length };
        filteredReservas.forEach(r => { if (stats[r.status] !== undefined) stats[r.status]++; });
        const el = id => document.getElementById(id);
        if (el('reservas-confirmadas')) el('reservas-confirmadas').textContent = String(stats.Confirmada);
        if (el('reservas-pendentes')) el('reservas-pendentes').textContent = String(stats.Pendente);
        if (el('reservas-canceladas')) el('reservas-canceladas').textContent = String(stats.Cancelada);
        if (el('reservas-total')) el('reservas-total').textContent = String(stats.total);

        // empty-state toggle
        if (filteredReservas.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
        }

        filteredReservas.forEach(reserva => {
            const card = document.createElement('div');
            const statusClass = String(reserva.status || '').replace(/\s+/g, '-');
            card.className = `reserva-card ${statusClass}`;

            const iconClass = (reserva.status === 'Cancelada')
                ? 'fa-ban'
                : (reserva.status === 'Confirmada')
                    ? 'fa-check-circle'
                    : (reserva.status === 'Pendente')
                        ? 'fa-hourglass-half'
                        : 'fa-calendar-check';

            const dateStr = (window.CONFIG && window.CONFIG.UTILS && typeof window.CONFIG.UTILS.formatDate === 'function')
                ? window.CONFIG.UTILS.formatDate(reserva.date)
                : new Date(reserva.date + 'T00:00:00').toLocaleDateString();

            card.innerHTML = `
                <i class="fas ${iconClass} reserva-icon"></i>
                <h3>${reserva.name}</h3>
                <p>${dateStr} • ${fmtTime(reserva.time)} • ${reserva.people} pessoas</p>
                <div class="reserva-status-text">${reserva.status}</div>
                <div class="reserva-actions">
                    <button class="btn btn-secondary edit-btn" data-id="${reserva.id}"><i class="fas fa-pen"></i> Editar</button>
                    <button class="btn btn-danger delete-btn" data-id="${reserva.id}"><i class="fas fa-trash"></i> Excluir</button>
                </div>
            `;
            reservasGrid.appendChild(card);
        });
    };

    const openModal = (reserva = null) => {
        reservaForm.reset();
        if (reserva) {
            document.getElementById('reserva-modal-title').textContent = 'Editar Reserva';
            editingReservaId = reserva.id;
            document.getElementById('reserva-id').value = reserva.id;
            document.getElementById('reserva-name').value = reserva.name;
            document.getElementById('reserva-phone').value = reserva.phone;
            document.getElementById('reserva-date').value = reserva.date;
            document.getElementById('reserva-time').value = reserva.time;
            document.getElementById('reserva-people').value = reserva.people;
            document.getElementById('reserva-status').value = reserva.status;
        } else {
            document.getElementById('reserva-modal-title').textContent = 'Nova Reserva';
            editingReservaId = null;
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    addReservaBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    reservaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const reservaData = {
            id: editingReservaId || Date.now().toString(),
            name: document.getElementById('reserva-name').value,
            phone: document.getElementById('reserva-phone').value,
            date: document.getElementById('reserva-date').value,
            time: document.getElementById('reserva-time').value,
            people: document.getElementById('reserva-people').value,
            status: document.getElementById('reserva-status').value,
        };

        if (apiEnabled && window.API && window.API.reservations) {
            try {
                if (editingReservaId) {
                    await window.API.reservations.update(editingReservaId, reservaData);
                } else {
                    const payload = { ...reservaData };
                    delete payload.id;
                    await window.API.reservations.create(payload);
                }
                await loadReservas();
                renderReservas();
                closeModal();
                return;
            } catch (err) {
                alert('Erro ao salvar reserva via API.');
                return;
            }
        }

        if (editingReservaId) {
            reservas = reservas.map(r => r.id === editingReservaId ? reservaData : r);
        } else {
            reservas.push(reservaData);
        }
        saveReservas();
        renderReservas();
        closeModal();
    });

    reservasGrid.addEventListener('click', async (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const reserva = reservas.find(r => r.id === id);
            openModal(reserva);
        }
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;

            if (apiEnabled && window.API && window.API.reservations) {
                if (!confirm('Deseja excluir esta reserva?')) return;
                try {
                    await window.API.reservations.remove(id);
                    await loadReservas();
                    renderReservas();
                    return;
                } catch (err) {
                    alert('Erro ao excluir reserva via API.');
                    return;
                }
            }

            reservas = reservas.filter(r => r.id !== id);
            saveReservas();
            renderReservas();
        }
    });

    searchInput.addEventListener('input', renderReservas);
    dateFilter.addEventListener('change', renderReservas);
    if (statusFilter) statusFilter.addEventListener('change', renderReservas);

    (async () => {
        await loadReservas();
        renderReservas();
    })();
});

