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

    let reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    let editingReservaId = null;

    const saveReservas = () => {
        localStorage.setItem('reservas', JSON.stringify(reservas));
    };

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
            card.className = 'reserva-card';
            card.innerHTML = `
                <div class="reserva-card-header">
                    <h3>${reserva.name}</h3>
                    <span class="reserva-status ${reserva.status.toLowerCase()}">${reserva.status}</span>
                </div>
                <div class="reserva-card-body">
                    <p><i class="fas fa-phone"></i> ${reserva.phone}</p>
                    <p><i class="fas fa-calendar-day"></i> ${new Date(reserva.date + 'T00:00:00').toLocaleDateString()}</p>
                    <p><i class="fas fa-clock"></i> ${reserva.time}</p>
                    <p><i class="fas fa-users"></i> ${reserva.people} pessoas</p>
                </div>
                <div class="reserva-card-actions">
                    <button class="btn btn-secondary edit-btn" data-id="${reserva.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger delete-btn" data-id="${reserva.id}"><i class="fas fa-trash"></i></button>
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

    reservaForm.addEventListener('submit', (e) => {
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

        if (editingReservaId) {
            reservas = reservas.map(r => r.id === editingReservaId ? reservaData : r);
        } else {
            reservas.push(reservaData);
        }
        saveReservas();
        renderReservas();
        closeModal();
    });

    reservasGrid.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const reserva = reservas.find(r => r.id === id);
            openModal(reserva);
        }
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            reservas = reservas.filter(r => r.id !== id);
            saveReservas();
            renderReservas();
        }
    });

    searchInput.addEventListener('input', renderReservas);
    dateFilter.addEventListener('change', renderReservas);
    if (statusFilter) statusFilter.addEventListener('change', renderReservas);

    renderReservas();
});

