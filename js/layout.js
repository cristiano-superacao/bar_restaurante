// Layout compartilhado (sidebar + overlay) para eliminar duplicidade nos HTMLs.
// Mantém IDs/classes esperados por `auth-neon.js` e outros scripts.

(function () {
    'use strict';

    const HEADER_CONFIG = {
        'dashboard.html': {
            title: 'Dashboard',
            subtitle: 'Visão geral do seu estabelecimento',
            actionsHtml: `
                <div class="header-search">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Buscar...">
                </div>

                <button class="header-icon-btn" title="Notificações" aria-label="Notificações">
                    <i class="fas fa-bell"></i>
                    <span class="badge-dot"></span>
                </button>

                <button class="header-icon-btn" title="Ajuda" aria-label="Ajuda">
                    <i class="fas fa-question-circle"></i>
                </button>
            `.trim(),
        },
        'pedidos.html': {
            title: 'Gerenciamento de Pedidos',
            subtitle: 'Acompanhe e gerencie todos os pedidos em tempo real',
        },
        'mesas.html': {
            title: 'Gerenciamento de Mesas',
            subtitle: 'Visualize e organize o status das suas mesas em tempo real',
        },
        'cardapio.html': {
            title: 'Cardápio',
            subtitle: 'Gerencie os pratos e bebidas do seu estabelecimento',
        },
        'clientes.html': {
            title: 'Clientes',
            subtitle: 'Gerencie informações e histórico dos seus clientes',
        },
        'delivery.html': {
            title: 'Delivery',
            subtitle: 'Crie, acompanhe e gerencie entregas em tempo real',
        },
        'reserva.html': {
            title: 'Reservas',
            subtitle: 'Gerencie as reservas de mesas com calendário e status',
        },
        'estoque.html': {
            title: 'Estoque',
            subtitle: 'Controle de produtos com alertas de quantidade mínima',
        },
        'financeiro.html': {
            title: 'Financeiro',
            subtitle: 'Controle completo de receitas, despesas e saldo',
        },
        'relatorios.html': {
            title: 'Relatórios',
            subtitle: 'Análises e métricas detalhadas do seu negócio',
        },
        'cupom.html': {
            title: 'Cupom Fiscal',
            subtitle: 'Visualize e imprima o cupom do pedido',
        },
        'manual.html': {
            title: 'Manual do Sistema',
            subtitle: 'Aprenda a usar todas as funcionalidades',
        },
        'empresas.html': {
            title: 'Empresas',
            subtitle: 'Gerencie as empresas do sistema',
        },
        'usuarios.html': {
            title: 'Usuários',
            subtitle: 'Gerencie usuários e permissões do sistema',
        },
        'configuracoes.html': {
            title: 'Configurações',
            subtitle: 'Ajuste as configurações do sistema',
        },
    };

    function getActivePage() {
        try {
            const raw = String(window.location.pathname || '');
            const page = raw.split('/').pop() || '';
            return page && page.endsWith('.html') ? page : 'dashboard.html';
        } catch {
            return 'dashboard.html';
        }
    }

    function buildSidebarTemplate(activePage) {
        const showPendingBadge = activePage === 'pedidos.html';

        return `
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="sidebar-logo">
            <i class="fas fa-utensils"></i>
        </div>
        <div class="sidebar-brand">
            <div class="sidebar-brand-name">Bar &amp; Restaurante</div>
            <div class="sidebar-brand-subtitle">Sistema de Gestão</div>
        </div>
    </div>

    <nav class="sidebar-nav">
        <div class="nav-section">
            <div class="nav-section-title">Principal</div>
            <ul class="nav-list">
                <li class="nav-item"><a href="dashboard.html"><i class="fas fa-chart-line"></i><span>Dashboard</span></a></li>
                <li class="nav-item"><a href="pedidos.html"><i class="fas fa-receipt"></i><span>Pedidos</span>${showPendingBadge ? '<span class="nav-badge" id="pending-badge">0</span>' : ''}</a></li>
                <li class="nav-item"><a href="mesas.html"><i class="fas fa-chair"></i><span>Mesas</span></a></li>
                <li class="nav-item"><a href="cardapio.html"><i class="fas fa-book-open"></i><span>Cardápio</span></a></li>
                <li class="nav-item"><a href="estoque.html"><i class="fas fa-boxes"></i><span>Estoque</span></a></li>
            </ul>
        </div>

        <div class="nav-section">
            <div class="nav-section-title">Operações</div>
            <ul class="nav-list">
                <li class="nav-item"><a href="delivery.html"><i class="fas fa-motorcycle"></i><span>Delivery</span></a></li>
                <li class="nav-item"><a href="reserva.html"><i class="fas fa-calendar-check"></i><span>Reservas</span></a></li>
                <li class="nav-item"><a href="clientes.html"><i class="fas fa-users"></i><span>Clientes</span></a></li>
            </ul>
        </div>

        <div class="nav-section">
            <div class="nav-section-title">Gestão</div>
            <ul class="nav-list">
                <li class="nav-item"><a href="financeiro.html"><i class="fas fa-dollar-sign"></i><span>Financeiro</span></a></li>
                <li class="nav-item"><a href="relatorios.html"><i class="fas fa-chart-bar"></i><span>Relatórios</span></a></li>
                <li class="nav-item"><a href="cupom.html"><i class="fas fa-ticket-alt"></i><span>Cupons</span></a></li>
            </ul>
        </div>

        <div class="nav-section">
            <div class="nav-section-title">Sistema</div>
            <ul class="nav-list">
                <li class="nav-item"><a href="usuarios.html"><i class="fas fa-user-cog"></i><span>Usuários</span></a></li>
                <li class="nav-item"><a href="empresas.html"><i class="fas fa-building"></i><span>Empresas</span></a></li>
                <li class="nav-item"><a href="configuracoes.html"><i class="fas fa-cog"></i><span>Configurações</span></a></li>
                <li class="nav-item"><a href="manual.html"><i class="fas fa-book"></i><span>Manual</span></a></li>
            </ul>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="user-card" id="user-menu">
            <div class="user-avatar" id="user-avatar">U</div>
            <div class="user-info">
                <span class="user-name" id="username-display">Usuário</span>
                <span class="user-role" id="user-role-display">Admin</span>
            </div>
            <button class="logout-btn" id="logout-btn" title="Sair" aria-label="Sair do sistema">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    </div>
</aside>
        `.trim();
    }

    function buildOverlayElement() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebar-overlay';
        return overlay;
    }

    function buildHeaderTemplate(activePage) {
        const cfg = HEADER_CONFIG[activePage] || { title: 'Sistema', subtitle: '' };
        const title = String(cfg.title || 'Sistema');
        const subtitle = String(cfg.subtitle || '');
        const actionsHtml = (cfg.actionsHtml || '').trim();

        // Sempre renderiza .header-actions para compatibilidade com auth-neon.js (company-pill)
        return `
<header class="main-header">
    <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menu">
        <i class="fas fa-bars"></i>
    </button>

    <div class="header-title">
        <h1>${title}</h1>
        <p>${subtitle}</p>
    </div>

    <div class="header-actions">${actionsHtml}</div>
</header>
        `.trim();
    }

    function markActive(sidebar, activePage) {
        try {
            const items = sidebar.querySelectorAll('.nav-item');
            items.forEach((li) => li.classList.remove('active'));

            const link = sidebar.querySelector(`.sidebar-nav a[href="${CSS.escape(activePage)}"]`);
            const li = link ? link.closest('li') : null;
            if (li) li.classList.add('active');
        } catch {
            // noop
        }
    }

    function insertOverlayAfterSidebar(sidebar, overlay) {
        try {
            const parent = sidebar.parentNode;
            if (!parent) return;
            if (sidebar.nextSibling) parent.insertBefore(overlay, sidebar.nextSibling);
            else parent.appendChild(overlay);
        } catch {
            // noop
        }
    }

    function injectSidebar() {
        if (document.getElementById('sidebar')) return;

        const activePage = getActivePage();
        const template = buildSidebarTemplate(activePage);

        const wrap = document.createElement('div');
        wrap.innerHTML = template;
        const sidebar = wrap.firstElementChild;
        if (!sidebar) return;

        markActive(sidebar, activePage);

        const placeholder = document.getElementById('app-sidebar');
        const overlayPlaceholder = document.getElementById('app-sidebar-overlay');
        const overlay = buildOverlayElement();

        if (placeholder) {
            placeholder.replaceWith(sidebar);
        } else {
            const container = document.querySelector('.app-container') || document.body;
            const mainWrapper = document.querySelector('.main-wrapper');
            if (mainWrapper && mainWrapper.parentElement === container) {
                container.insertBefore(sidebar, mainWrapper);
            } else {
                container.insertBefore(sidebar, container.firstChild);
            }
        }

        if (overlayPlaceholder) {
            overlayPlaceholder.replaceWith(overlay);
        } else {
            insertOverlayAfterSidebar(sidebar, overlay);
        }
    }

    function injectHeader() {
        if (document.querySelector('.main-wrapper .main-header')) return;

        const activePage = getActivePage();
        const template = buildHeaderTemplate(activePage);
        const wrap = document.createElement('div');
        wrap.innerHTML = template;
        const header = wrap.firstElementChild;
        if (!header) return;

        const placeholder = document.getElementById('app-header');
        if (placeholder) {
            placeholder.replaceWith(header);
            return;
        }

        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;
        if (mainWrapper.firstChild) mainWrapper.insertBefore(header, mainWrapper.firstChild);
        else mainWrapper.appendChild(header);
    }

    function bindSidebarInteractions() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (!menuToggle || !sidebar || !overlay) return;
        if (menuToggle.dataset.bound === '1') return;
        menuToggle.dataset.bound = '1';

        const open = () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        };
        const close = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        };
        const toggle = () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        };

        menuToggle.addEventListener('click', toggle);
        overlay.addEventListener('click', close);

        // UX: fecha com ESC
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape') close();
        });

        // UX: fecha ao clicar em um link do menu (mobile)
        sidebar.addEventListener('click', (ev) => {
            const link = ev.target && ev.target.closest ? ev.target.closest('a') : null;
            if (!link) return;
            if (sidebar.classList.contains('open')) close();
        });

        // Se a tela for redimensionada para desktop, garante estado fechado
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) close();
        });
    }

    // Executa o quanto antes (antes do DOMContentLoaded) para compatibilidade com auth.
    try {
        injectSidebar();
        injectHeader();
        bindSidebarInteractions();
    } catch {
        // noop
    }
})();
