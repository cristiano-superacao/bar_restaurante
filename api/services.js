const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Conexão com Neon PostgreSQL
const sql = neon(process.env.DATABASE_URL);

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'maria-flor-jwt-secret';
const JWT_EXPIRES_IN = '24h';

/**
 * Utilitários para autenticação JWT
 */
const authUtils = {
  generateToken: (user) => {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        nome: user.nome 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  },

  hashPassword: async (password) => {
    return await bcrypt.hash(password, 12);
  },

  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  }
};

/**
 * Middleware de autenticação
 */
const authMiddleware = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Token de acesso requerido');
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN
  return authUtils.verifyToken(token);
};

/**
 * Serviços de Usuários
 */
const userService = {
  // Fazer login
  async login(username, password) {
    try {
      const users = await sql`
        SELECT id, username, password_hash, nome, email, role, ativo 
        FROM usuarios 
        WHERE username = ${username} AND ativo = true
      `;

      if (users.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const user = users[0];
      const isValidPassword = await authUtils.comparePassword(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Senha inválida');
      }

      // Atualizar último login
      await sql`
        UPDATE usuarios 
        SET ultimo_login = NOW() 
        WHERE id = ${user.id}
      `;

      const token = authUtils.generateToken(user);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          nome: user.nome,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Listar usuários (admin apenas)
  async getUsers(userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });
    
    if (decoded.role !== 'admin') {
      throw new Error('Acesso negado');
    }

    const users = await sql`
      SELECT id, username, nome, email, role, ativo, criado_em, ultimo_login
      FROM usuarios
      ORDER BY nome
    `;

    return users;
  },

  // Criar usuário
  async createUser(userData, userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });
    
    if (decoded.role !== 'admin' && decoded.role !== 'gerente') {
      throw new Error('Acesso negado');
    }

    const { username, password, nome, email, role, telefone } = userData;
    const passwordHash = await authUtils.hashPassword(password);

    const result = await sql`
      INSERT INTO usuarios (username, password_hash, nome, email, role, telefone)
      VALUES (${username}, ${passwordHash}, ${nome}, ${email}, ${role}, ${telefone})
      RETURNING id, username, nome, email, role
    `;

    return result[0];
  }
};

/**
 * Serviços de Cardápio
 */
const menuService = {
  // Listar categorias
  async getCategories() {
    return await sql`
      SELECT * FROM categorias 
      WHERE ativo = true 
      ORDER BY ordem, nome
    `;
  },

  // Listar itens do cardápio
  async getMenuItems(categoria_id = null) {
    let query = sql`
      SELECT c.*, cat.nome as categoria_nome, cat.cor as categoria_cor
      FROM cardapio c
      LEFT JOIN categorias cat ON c.categoria_id = cat.id
      WHERE c.disponivel = true
    `;

    if (categoria_id) {
      query = sql`
        SELECT c.*, cat.nome as categoria_nome, cat.cor as categoria_cor
        FROM cardapio c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        WHERE c.disponivel = true AND c.categoria_id = ${categoria_id}
      `;
    }

    const items = await query;
    return items.map(item => ({
      ...item,
      ordem: item.ordem || 999
    })).sort((a, b) => a.ordem - b.ordem);
  },

  // Criar item do cardápio
  async createMenuItem(itemData, userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });
    
    if (!['admin', 'gerente'].includes(decoded.role)) {
      throw new Error('Acesso negado');
    }

    const { nome, descricao, categoria_id, preco, custo, tempo_preparo, ingredientes } = itemData;

    const result = await sql`
      INSERT INTO cardapio (nome, descricao, categoria_id, preco, custo, tempo_preparo, ingredientes)
      VALUES (${nome}, ${descricao}, ${categoria_id}, ${preco}, ${custo}, ${tempo_preparo}, ${ingredientes})
      RETURNING *
    `;

    return result[0];
  }
};

/**
 * Serviços de Mesas
 */
const tableService = {
  // Listar mesas
  async getTables() {
    return await sql`
      SELECT * FROM mesas 
      ORDER BY numero
    `;
  },

  // Atualizar status da mesa
  async updateTableStatus(mesa_id, status, userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });

    await sql`
      UPDATE mesas 
      SET status = ${status}, atualizado_em = NOW()
      WHERE id = ${mesa_id}
    `;

    return { success: true };
  }
};

/**
 * Serviços de Pedidos
 */
const orderService = {
  // Criar novo pedido
  async createOrder(orderData, userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });

    const { mesa_id, cliente_nome, cliente_telefone, itens, observacoes } = orderData;

    // Gerar número do pedido
    const numeroResult = await sql`
      SELECT COALESCE(MAX(numero), 0) + 1 as proximo_numero 
      FROM pedidos 
      WHERE DATE(iniciado_em) = CURRENT_DATE
    `;
    const numero = numeroResult[0].proximo_numero;

    // Criar pedido
    const pedidoResult = await sql`
      INSERT INTO pedidos (numero, mesa_id, garcom_id, cliente_nome, cliente_telefone, observacoes)
      VALUES (${numero}, ${mesa_id}, ${decoded.id}, ${cliente_nome}, ${cliente_telefone}, ${observacoes})
      RETURNING id, numero
    `;

    const pedido = pedidoResult[0];
    let subtotal = 0;

    // Adicionar itens
    for (const item of itens) {
      const menuItem = await sql`
        SELECT preco FROM cardapio WHERE id = ${item.cardapio_id}
      `;

      if (menuItem.length === 0) {
        throw new Error(`Item ${item.cardapio_id} não encontrado no cardápio`);
      }

      const preco_unitario = menuItem[0].preco;
      const item_subtotal = preco_unitario * item.quantidade;
      subtotal += item_subtotal;

      await sql`
        INSERT INTO pedido_itens (pedido_id, cardapio_id, quantidade, preco_unitario, subtotal, observacoes)
        VALUES (${pedido.id}, ${item.cardapio_id}, ${item.quantidade}, ${preco_unitario}, ${item_subtotal}, ${item.observacoes})
      `;
    }

    // Atualizar total do pedido
    const taxa_servico = subtotal * 0.1; // 10% de taxa de serviço
    const total = subtotal + taxa_servico;

    await sql`
      UPDATE pedidos 
      SET subtotal = ${subtotal}, taxa_servico = ${taxa_servico}, total = ${total}
      WHERE id = ${pedido.id}
    `;

    return {
      id: pedido.id,
      numero: pedido.numero,
      subtotal,
      taxa_servico,
      total
    };
  },

  // Listar pedidos
  async getOrders(status = null, data = null) {
    let query;

    if (status && data) {
      query = sql`
        SELECT p.*, m.numero as mesa_numero, u.nome as garcom_nome,
               COUNT(pi.id) as total_itens
        FROM pedidos p
        LEFT JOIN mesas m ON p.mesa_id = m.id
        LEFT JOIN usuarios u ON p.garcom_id = u.id
        LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
        WHERE p.status = ${status} AND DATE(p.iniciado_em) = ${data}
        GROUP BY p.id, m.numero, u.nome
        ORDER BY p.iniciado_em DESC
      `;
    } else if (status) {
      query = sql`
        SELECT p.*, m.numero as mesa_numero, u.nome as garcom_nome,
               COUNT(pi.id) as total_itens
        FROM pedidos p
        LEFT JOIN mesas m ON p.mesa_id = m.id
        LEFT JOIN usuarios u ON p.garcom_id = u.id
        LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
        WHERE p.status = ${status}
        GROUP BY p.id, m.numero, u.nome
        ORDER BY p.iniciado_em DESC
      `;
    } else {
      query = sql`
        SELECT p.*, m.numero as mesa_numero, u.nome as garcom_nome,
               COUNT(pi.id) as total_itens
        FROM pedidos p
        LEFT JOIN mesas m ON p.mesa_id = m.id
        LEFT JOIN usuarios u ON p.garcom_id = u.id
        LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
        GROUP BY p.id, m.numero, u.nome
        ORDER BY p.iniciado_em DESC
        LIMIT 50
      `;
    }

    return await query;
  },

  // Atualizar status do pedido
  async updateOrderStatus(pedido_id, status, userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });

    const updateFields = { status };
    
    // Adicionar timestamps baseados no status
    if (status === 'confirmado') updateFields.confirmado_em = 'NOW()';
    if (status === 'pronto') updateFields.pronto_em = 'NOW()';
    if (status === 'entregue') updateFields.entregue_em = 'NOW()';
    if (status === 'pago') updateFields.finalizado_em = 'NOW()';

    await sql`
      UPDATE pedidos 
      SET status = ${status}, 
          ${status === 'confirmado' ? sql`confirmado_em = NOW()` : sql``}
          ${status === 'pronto' ? sql`pronto_em = NOW()` : sql``}
          ${status === 'entregue' ? sql`entregue_em = NOW()` : sql``}
          ${status === 'pago' ? sql`finalizado_em = NOW()` : sql``}
      WHERE id = ${pedido_id}
    `;

    return { success: true };
  }
};

/**
 * Serviços de Vendas
 */
const salesService = {
  // Processar venda/pagamento
  async processPayment(paymentData, userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });

    const { pedido_id, metodo_pagamento, valor_pago, valor_troco, numero_transacao, observacoes } = paymentData;

    const result = await sql`
      INSERT INTO vendas (pedido_id, caixa_id, metodo_pagamento, valor_pago, valor_troco, numero_transacao, observacoes)
      VALUES (${pedido_id}, ${decoded.id}, ${metodo_pagamento}, ${valor_pago}, ${valor_troco}, ${numero_transacao}, ${observacoes})
      RETURNING *
    `;

    // Atualizar status do pedido para 'pago'
    await orderService.updateOrderStatus(pedido_id, 'pago', `Bearer ${authUtils.generateToken(decoded)}`);

    return result[0];
  },

  // Relatório de vendas
  async getSalesReport(data_inicio, data_fim, userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });

    if (!['admin', 'gerente'].includes(decoded.role)) {
      throw new Error('Acesso negado');
    }

    const vendas = await sql`
      SELECT v.*, p.numero as pedido_numero, u.nome as caixa_nome
      FROM vendas v
      JOIN pedidos p ON v.pedido_id = p.id
      JOIN usuarios u ON v.caixa_id = u.id
      WHERE DATE(v.data_venda) BETWEEN ${data_inicio} AND ${data_fim}
      ORDER BY v.data_venda DESC
    `;

    const resumo = await sql`
      SELECT 
        COUNT(*) as total_vendas,
        SUM(valor_pago) as total_faturamento,
        AVG(valor_pago) as ticket_medio,
        COUNT(DISTINCT pedido_id) as total_pedidos
      FROM vendas v
      WHERE DATE(v.data_venda) BETWEEN ${data_inicio} AND ${data_fim}
    `;

    return {
      vendas,
      resumo: resumo[0]
    };
  }
};

/**
 * Serviços de Dashboard
 */
const dashboardService = {
  async getDashboardData(userToken) {
    const decoded = authMiddleware({ headers: { authorization: `Bearer ${userToken}` } });

    // Vendas do dia
    const vendasHoje = await sql`
      SELECT 
        COUNT(*) as quantidade,
        COALESCE(SUM(valor_pago), 0) as total
      FROM vendas 
      WHERE DATE(data_venda) = CURRENT_DATE
    `;

    // Pedidos ativos
    const pedidosAtivos = await sql`
      SELECT COUNT(*) as total
      FROM pedidos
      WHERE status IN ('aberto', 'confirmado', 'preparando', 'pronto')
    `;

    // Mesas ocupadas
    const mesasOcupadas = await sql`
      SELECT COUNT(*) as total
      FROM mesas
      WHERE status = 'ocupada'
    `;

    // Produtos com estoque baixo
    const estoqueBaixo = await sql`
      SELECT COUNT(*) as total
      FROM estoque
      WHERE quantidade_atual <= quantidade_minima AND ativo = true
    `;

    // Vendas da semana
    const vendasSemana = await sql`
      SELECT 
        TO_CHAR(data_venda, 'Day') as dia,
        DATE(data_venda) as data,
        COALESCE(SUM(valor_pago), 0) as valor
      FROM vendas
      WHERE data_venda >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(data_venda), TO_CHAR(data_venda, 'Day')
      ORDER BY DATE(data_venda)
    `;

    return {
      vendas_hoje: {
        quantidade: parseInt(vendasHoje[0].quantidade),
        total: parseFloat(vendasHoje[0].total)
      },
      pedidos_ativos: parseInt(pedidosAtivos[0].total),
      mesas_ocupadas: parseInt(mesasOcupadas[0].total),
      estoque_baixo: parseInt(estoqueBaixo[0].total),
      vendas_semana: vendasSemana.map(v => ({
        dia: v.dia.trim().substring(0, 3),
        data: v.data,
        valor: parseFloat(v.valor)
      }))
    };
  }
};

module.exports = {
  authUtils,
  authMiddleware,
  userService,
  menuService,
  tableService,
  orderService,
  salesService,
  dashboardService
};