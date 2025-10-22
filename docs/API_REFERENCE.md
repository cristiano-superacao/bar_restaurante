# 🔌 API REFERENCE - Sistema Maria Flor

> **Documentação completa da API REST**

## 🌐 Base URL

- **Local**: `http://localhost:8888/.netlify/functions/api-complete`
- **Produção**: `https://maria-flor.netlify.app/.netlify/functions/api-complete`

## 🔐 Autenticação

Todos os endpoints (exceto login) requerem token JWT no header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Endpoints

### 🔑 Autenticação

#### POST `/auth/login`
Realiza login no sistema.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "nome": "Administrador",
      "role": "admin",
      "email": "admin@mariaflor.com"
    },
    "message": "Bem-vindo, Administrador!",
    "redirectTo": "/pages/dashboard.html"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Usuário ou senha inválidos"
}
```

#### POST `/auth/logout`
Invalida token JWT (logout).

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 📊 Dashboard

#### GET `/dashboard`
Retorna dados gerais do dashboard.

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vendas_hoje": {
      "quantidade": 23,
      "total": 2450.80,
      "ticket_medio": 106.56
    },
    "pedidos_ativos": 8,
    "mesas_ocupadas": 12,
    "total_mesas": 20,
    "estoque_baixo": 5,
    "vendas_semana": [
      { "dia": "Seg", "valor": 1200.00 },
      { "dia": "Ter", "valor": 1500.50 },
      { "dia": "Qua", "valor": 1800.30 }
    ],
    "produtos_mais_vendidos": [
      {
        "nome": "Hambúrguer Artesanal",
        "quantidade": 15,
        "receita": 450.00
      }
    ]
  }
}
```

### 🍽️ Cardápio

#### GET `/menu/categories`
Lista todas as categorias do cardápio.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Entradas",
      "descricao": "Pratos para começar",
      "icone": "fas fa-seedling",
      "cor": "#28a745",
      "ativo": true
    }
  ]
}
```

#### GET `/menu/items`
Lista itens do cardápio.

**Query Parameters:**
- `categoria_id` (opcional): Filtrar por categoria
- `disponivel` (opcional): true/false
- `search` (opcional): Buscar por nome

**Example:** `/menu/items?categoria_id=1&disponivel=true`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Bruschetta Especial",
      "descricao": "Torrada artesanal com tomate, manjericão e mussarela de búfala",
      "preco": 18.90,
      "categoria_id": 1,
      "categoria_nome": "Entradas",
      "disponivel": true,
      "tempo_preparo": 10,
      "ingredientes": ["pão", "tomate", "manjericão", "mussarela"],
      "alergenos": ["glúten", "lactose"],
      "calorias": 280,
      "imagem_url": "/img/products/bruschetta.jpg"
    }
  ]
}
```

#### POST `/menu/items`
Cria novo item do cardápio.

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "nome": "Risotto de Camarão",
  "descricao": "Risotto cremoso com camarões grandes e aspargos",
  "categoria_id": 2,
  "preco": 45.90,
  "custo": 18.50,
  "tempo_preparo": 25,
  "ingredientes": ["arroz arbóreo", "camarão", "aspargo", "vinho branco"],
  "alergenos": ["frutos do mar"],
  "calorias": 420
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "nome": "Risotto de Camarão",
    "preco": 45.90,
    "categoria_nome": "Pratos Principais"
  },
  "message": "Produto criado com sucesso"
}
```

#### PUT `/menu/items/{id}`
Atualiza item do cardápio.

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "nome": "Risotto de Camarão Premium",
  "preco": 52.90,
  "disponivel": true
}
```

#### DELETE `/menu/items/{id}`
Remove item do cardápio.

**Headers:**
```http
Authorization: Bearer {token}
```

### 🪑 Mesas

#### GET `/tables`
Lista todas as mesas.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero": 1,
      "capacidade": 2,
      "status": "livre",
      "localizacao": "salao",
      "observacoes": null,
      "ultimo_uso": "2025-10-22T14:30:00Z"
    }
  ]
}
```

**Status possíveis:**
- `livre`: Mesa disponível
- `ocupada`: Mesa com clientes
- `reservada`: Mesa reservada
- `manutencao`: Mesa em manutenção

#### PUT `/tables/update-status`
Atualiza status de uma mesa.

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "mesa_id": 1,
  "status": "ocupada",
  "cliente_nome": "João Silva",
  "observacoes": "Cliente preferencial"
}
```

#### POST `/tables/reserve`
Faz reserva de mesa.

**Request:**
```json
{
  "mesa_id": 1,
  "cliente_nome": "Maria Santos",
  "cliente_telefone": "(71) 99999-9999",
  "data_reserva": "2025-10-22T19:00:00Z",
  "observacoes": "Aniversário, preparar mesa especial"
}
```

### 📋 Pedidos

#### GET `/orders`
Lista pedidos.

**Query Parameters:**
- `status` (opcional): Filtrar por status
- `mesa_id` (opcional): Filtrar por mesa
- `data` (opcional): Filtrar por data (YYYY-MM-DD)
- `garcom_id` (opcional): Filtrar por garçom

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "numero": 1001,
      "mesa_numero": 5,
      "cliente_nome": "João Silva",
      "garcom_nome": "Ana Souza",
      "status": "preparando",
      "subtotal": 85.40,
      "taxa_servico": 8.54,
      "total": 93.94,
      "iniciado_em": "2025-10-22T18:30:00Z",
      "itens": [
        {
          "produto_nome": "Hambúrguer Artesanal",
          "quantidade": 2,
          "preco_unitario": 32.90,
          "observacoes": "Sem cebola"
        }
      ]
    }
  ]
}
```

**Status possíveis:**
- `aberto`: Pedido criado
- `confirmado`: Cliente confirmou
- `preparando`: Cozinha iniciou preparo
- `pronto`: Prato pronto para entrega
- `entregue`: Pedido entregue
- `pago`: Pagamento processado
- `cancelado`: Pedido cancelado

#### POST `/orders/create`
Cria novo pedido.

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "mesa_id": 5,
  "cliente_nome": "João Silva",
  "cliente_telefone": "(71) 99999-9999",
  "tipo_pedido": "local",
  "itens": [
    {
      "cardapio_id": 10,
      "quantidade": 2,
      "preco_unitario": 32.90,
      "observacoes": "Sem cebola, ponto da carne mal passado"
    },
    {
      "cardapio_id": 25,
      "quantidade": 1,
      "preco_unitario": 19.50,
      "observacoes": "Extra molho"
    }
  ],
  "observacoes": "Cliente alérgico a frutos do mar",
  "taxa_servico": 10.0
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "numero": 1002,
    "subtotal": 85.30,
    "taxa_servico": 8.53,
    "total": 93.83,
    "tempo_estimado": 25
  },
  "message": "Pedido criado com sucesso"
}
```

#### PUT `/orders/update-status`
Atualiza status do pedido.

**Request:**
```json
{
  "pedido_id": 123,
  "status": "pronto",
  "observacoes": "Prato pronto há 5 minutos"
}
```

#### GET `/orders/{id}`
Detalhes de um pedido específico.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "numero": 1001,
    "mesa": {
      "numero": 5,
      "capacidade": 4
    },
    "cliente": {
      "nome": "João Silva",
      "telefone": "(71) 99999-9999"
    },
    "garcom": {
      "nome": "Ana Souza",
      "id": 5
    },
    "status": "preparando",
    "subtotal": 85.40,
    "taxa_servico": 8.54,
    "total": 93.94,
    "iniciado_em": "2025-10-22T18:30:00Z",
    "tempo_preparo_estimado": 25,
    "itens": [
      {
        "id": 1,
        "produto": {
          "nome": "Hambúrguer Artesanal",
          "categoria": "Pratos Principais"
        },
        "quantidade": 2,
        "preco_unitario": 32.90,
        "subtotal": 65.80,
        "observacoes": "Sem cebola",
        "status": "preparando"
      }
    ],
    "historico": [
      {
        "status": "aberto",
        "timestamp": "2025-10-22T18:30:00Z",
        "usuario": "Ana Souza"
      },
      {
        "status": "confirmado",
        "timestamp": "2025-10-22T18:32:00Z",
        "usuario": "João Silva"
      }
    ]
  }
}
```

### 💰 Vendas

#### POST `/sales/process-payment`
Processa pagamento de um pedido.

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "pedido_id": 123,
  "metodo_pagamento": "cartao_credito",
  "valor_pago": 93.94,
  "valor_troco": 0,
  "numero_transacao": "TXN123456789",
  "parcelamento": {
    "parcelas": 3,
    "valor_parcela": 31.31
  },
  "observacoes": "Pagamento aprovado"
}
```

**Métodos de pagamento aceitos:**
- `dinheiro`
- `cartao_credito`
- `cartao_debito`
- `pix`
- `transferencia`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "venda_id": 456,
    "pedido_id": 123,
    "total_pago": 93.94,
    "troco": 0,
    "metodo": "cartao_credito",
    "data_pagamento": "2025-10-22T19:15:00Z",
    "comprovante": {
      "numero": "COMP001456",
      "url": "/comprovantes/001456.pdf"
    }
  },
  "message": "Pagamento processado com sucesso"
}
```

#### GET `/sales/report`
Gera relatório de vendas.

**Query Parameters:**
- `data_inicio` (obrigatório): Data inicial (YYYY-MM-DD)
- `data_fim` (obrigatório): Data final (YYYY-MM-DD)
- `metodo_pagamento` (opcional): Filtrar por método
- `garcom_id` (opcional): Filtrar por garçom

**Example:** `/sales/report?data_inicio=2025-10-01&data_fim=2025-10-22`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "inicio": "2025-10-01",
      "fim": "2025-10-22"
    },
    "resumo": {
      "total_vendas": 15420.80,
      "quantidade_vendas": 145,
      "ticket_medio": 106.35,
      "total_taxa_servico": 1542.08
    },
    "por_metodo": [
      {
        "metodo": "cartao_credito",
        "quantidade": 89,
        "total": 9876.50,
        "percentual": 64.1
      }
    ],
    "por_dia": [
      {
        "data": "2025-10-22",
        "vendas": 1230.40,
        "quantidade": 12
      }
    ],
    "por_garcom": [
      {
        "garcom_nome": "Ana Souza",
        "vendas": 3450.20,
        "quantidade": 32
      }
    ]
  }
}
```

### 👥 Usuários

#### GET `/users`
Lista usuários (apenas admin).

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "nome": "Administrador",
      "email": "admin@mariaflor.com",
      "role": "admin",
      "ativo": true,
      "ultimo_login": "2025-10-22T18:00:00Z",
      "criado_em": "2025-10-01T10:00:00Z"
    }
  ]
}
```

#### POST `/users/create`
Cria novo usuário (apenas admin).

**Request:**
```json
{
  "username": "novo_garcom",
  "password": "senha123",
  "nome": "Carlos Silva",
  "email": "carlos@mariaflor.com",
  "role": "garcom",
  "telefone": "(71) 98888-8888"
}
```

### 📦 Estoque

#### GET `/inventory`
Lista produtos do estoque.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "produto_nome": "Pão de Hambúrguer",
      "quantidade": 50,
      "unidade": "unidades",
      "quantidade_minima": 20,
      "status": "normal",
      "custo_unitario": 2.50,
      "fornecedor": "Padaria Central"
    }
  ]
}
```

**Status possíveis:**
- `normal`: Estoque adequado
- `baixo`: Abaixo do mínimo
- `critico`: Muito baixo (< 10% do mínimo)
- `zerado`: Sem estoque

#### POST `/inventory/movement`
Registra movimentação de estoque.

**Request:**
```json
{
  "produto_id": 1,
  "tipo": "entrada",
  "quantidade": 100,
  "motivo": "Compra",
  "documento": "NF-001234",
  "custo_unitario": 2.45
}
```

**Tipos de movimentação:**
- `entrada`: Compra/recebimento
- `saida`: Venda/consumo
- `ajuste`: Correção de estoque
- `perda`: Quebra/vencimento

## 🚨 Códigos de Status HTTP

| Código | Status | Descrição |
|--------|--------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token de acesso necessário ou inválido |
| 403 | Forbidden | Acesso negado para este usuário |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: username já existe) |
| 422 | Unprocessable Entity | Dados válidos mas regra de negócio violada |
| 500 | Internal Server Error | Erro interno do servidor |

## 🔒 Segurança

### Headers Obrigatórios
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Rate Limiting
- 100 requisições por minuto por IP
- 1000 requisições por hora por usuário autenticado

### Validação de Dados
- Todos os inputs são validados e sanitizados
- Proteção contra SQL Injection
- Validação de tipos de dados

## 📝 Notas Importantes

1. **Timestamps**: Todos em UTC (ISO 8601)
2. **Valores monetários**: Em centavos ou com 2 casas decimais
3. **Paginação**: Use `?page=1&limit=50` quando disponível
4. **Cache**: Responses são cacheadas por 5 minutos
5. **Backup**: Dados são salvos automaticamente na nuvem

## 🧪 Testes com curl

### Login
```bash
curl -X POST \
  http://localhost:8888/.netlify/functions/api-complete/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

### Dashboard
```bash
curl -X GET \
  http://localhost:8888/.netlify/functions/api-complete/dashboard \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

### Criar Pedido
```bash
curl -X POST \
  http://localhost:8888/.netlify/functions/api-complete/orders/create \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "mesa_id": 1,
    "cliente_nome": "Teste",
    "itens": [
      {
        "cardapio_id": 1,
        "quantidade": 1,
        "preco_unitario": 25.90
      }
    ]
  }'
```

---

**📚 Esta documentação é atualizada constantemente. Para a versão mais recente, consulte o repositório no GitHub.**