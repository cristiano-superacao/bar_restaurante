# 📚 API Documentation

## Base URL

```
Produção: https://barestaurante.up.railway.app/api
Local:    http://localhost:3000/api
```

## Autenticação

Todas as rotas protegidas requerem token JWT no header:

```http
Authorization: Bearer <access_token>
```

### Obtenção de Token

**POST** `/api/auth/login`

```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Resposta (200 OK)**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "function": "Supervisor",
    "companyId": 1
  }
}
```

### Refresh Token

**POST** `/api/auth/refresh`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (200 OK)**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👥 Usuários (Users)

### Listar Usuários

**GET** `/api/users`

**Headers**: `Authorization: Bearer <token>`

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "function": "Supervisor",
    "company_id": 1,
    "company_name": "Bar do João",
    "is_active": true,
    "created_at": "2026-01-10T10:00:00.000Z"
  }
]
```

### Criar Usuário

**POST** `/api/users`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "username": "caixa01",
  "password": "senha123",
  "role": "staff",
  "function": "Caixa",
  "companyId": 1
}
```

**Validações**
- `username`: Obrigatório, alfanumérico, 3-50 caracteres
- `password`: Obrigatório, mínimo 6 caracteres
- `role`: Obrigatório, enum ['superadmin', 'admin', 'staff']
- `function`: Opcional, enum ['Caixa', 'Cozinha', 'Motoboy', 'Supervisor', 'Garçom']
- `companyId`: Obrigatório (exceto para superadmin)

**Resposta (201 Created)**
```json
{
  "id": 5,
  "username": "caixa01",
  "role": "staff",
  "function": "Caixa",
  "company_id": 1
}
```

### Atualizar Usuário

**PUT** `/api/users/:id`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "username": "caixa01_updated",
  "role": "staff",
  "function": "Supervisor",
  "isActive": true
}
```

**Resposta (200 OK)**
```json
{
  "id": 5,
  "username": "caixa01_updated",
  "role": "staff",
  "function": "Supervisor",
  "company_id": 1,
  "is_active": true
}
```

### Deletar Usuário

**DELETE** `/api/users/:id`

**Headers**: `Authorization: Bearer <token>`

**Resposta (200 OK)**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

---

## 🏢 Empresas (Companies)

### Listar Empresas

**GET** `/api/companies`

**Headers**: `Authorization: Bearer <token>`

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "name": "Bar do João",
    "created_at": "2026-01-01T10:00:00.000Z"
  }
]
```

### Criar Empresa

**POST** `/api/companies`

**Headers**: `Authorization: Bearer <token>` (apenas superadmin)

**Body**
```json
{
  "name": "Restaurante Maria"
}
```

**Validações**
- `name`: Obrigatório, 3-255 caracteres

**Resposta (201 Created)**
```json
{
  "id": 2,
  "name": "Restaurante Maria",
  "created_at": "2026-01-12T10:00:00.000Z"
}
```

### Atualizar Empresa

**PUT** `/api/companies/:id`

**Headers**: `Authorization: Bearer <token>` (apenas superadmin)

**Body**
```json
{
  "name": "Restaurante Maria - Filial Centro"
}
```

**Resposta (200 OK)**
```json
{
  "id": 2,
  "name": "Restaurante Maria - Filial Centro"
}
```

### Deletar Empresa

**DELETE** `/api/companies/:id`

**Headers**: `Authorization: Bearer <token>` (apenas superadmin)

**Resposta (200 OK)**
```json
{
  "message": "Empresa deletada com sucesso"
}
```

---

## 🍔 Cardápio (Menu Items)

### Listar Itens do Cardápio

**GET** `/api/menu-items`

**Headers**: `Authorization: Bearer <token>`

**Query Params**
- `category` (opcional): Filtrar por categoria

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "name": "X-Burger Especial",
    "description": "Hambúrguer artesanal com queijo, bacon e molho especial",
    "price": "25.90",
    "category": "Lanches",
    "image_url": "https://exemplo.com/xburguer.jpg",
    "is_available": true,
    "company_id": 1,
    "created_at": "2026-01-10T10:00:00.000Z"
  }
]
```

### Criar Item do Cardápio

**POST** `/api/menu-items`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "name": "Pizza Marguerita",
  "description": "Molho de tomate, mussarela e manjericão",
  "price": 45.90,
  "category": "Pizzas",
  "imageUrl": "https://exemplo.com/marguerita.jpg"
}
```

**Validações**
- `name`: Obrigatório, 3-255 caracteres
- `price`: Obrigatório, numérico positivo
- `category`: Opcional, máximo 100 caracteres

**Resposta (201 Created)**
```json
{
  "id": 10,
  "name": "Pizza Marguerita",
  "price": "45.90",
  "category": "Pizzas",
  "company_id": 1
}
```

### Atualizar Item do Cardápio

**PUT** `/api/menu-items/:id`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "name": "Pizza Marguerita Especial",
  "price": 49.90,
  "isAvailable": true
}
```

**Resposta (200 OK)**
```json
{
  "id": 10,
  "name": "Pizza Marguerita Especial",
  "price": "49.90",
  "is_available": true
}
```

### Deletar Item do Cardápio

**DELETE** `/api/menu-items/:id`

**Headers**: `Authorization: Bearer <token>`

**Resposta (200 OK)**
```json
{
  "message": "Item deletado com sucesso"
}
```

---

## 📦 Pedidos (Orders)

### Listar Pedidos

**GET** `/api/orders`

**Headers**: `Authorization: Bearer <token>`

**Query Params**
- `status` (opcional): Filtrar por status
- `orderType` (opcional): Filtrar por tipo (dine-in, delivery, takeout)

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "order_number": "ORD-001",
    "customer_id": 5,
    "customer_name": "João Silva",
    "table_id": 3,
    "table_number": "Mesa 3",
    "delivery_driver": "Carlos Motoboy",
    "order_type": "delivery",
    "status": "preparing",
    "total_amount": "125.80",
    "company_id": 1,
    "created_at": "2026-01-12T14:30:00.000Z",
    "items": [
      {
        "id": 1,
        "menu_item_id": 10,
        "menu_item_name": "Pizza Marguerita",
        "quantity": 2,
        "unit_price": "45.90",
        "subtotal": "91.80"
      }
    ]
  }
]
```

### Criar Pedido

**POST** `/api/orders`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "customerId": 5,
  "tableId": null,
  "deliveryDriver": "Carlos Motoboy",
  "orderType": "delivery",
  "items": [
    {
      "menuItemId": 10,
      "quantity": 2
    },
    {
      "menuItemId": 15,
      "quantity": 1
    }
  ]
}
```

**Validações**
- `orderType`: Obrigatório, enum ['dine-in', 'delivery', 'takeout']
- `customerId`: Obrigatório
- `items`: Obrigatório, array não vazio
- `items[].menuItemId`: Obrigatório, inteiro
- `items[].quantity`: Obrigatório, inteiro > 0
- `deliveryDriver`: Obrigatório se orderType = 'delivery'

**Resposta (201 Created)**
```json
{
  "id": 50,
  "order_number": "ORD-050",
  "total_amount": "125.80",
  "status": "pending"
}
```

### Atualizar Status do Pedido

**PUT** `/api/orders/:id/status`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "status": "ready"
}
```

**Validações**
- `status`: Obrigatório, enum ['pending', 'preparing', 'ready', 'delivered', 'cancelled']

**Resposta (200 OK)**
```json
{
  "id": 50,
  "status": "ready",
  "updated_at": "2026-01-12T15:00:00.000Z"
}
```

---

## 🪑 Mesas (Tables)

### Listar Mesas

**GET** `/api/tables`

**Headers**: `Authorization: Bearer <token>`

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "table_number": "Mesa 1",
    "capacity": 4,
    "status": "available",
    "company_id": 1,
    "created_at": "2026-01-10T10:00:00.000Z"
  }
]
```

### Criar Mesa

**POST** `/api/tables`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "tableNumber": "Mesa 10",
  "capacity": 6
}
```

**Validações**
- `tableNumber`: Obrigatório, 1-50 caracteres
- `capacity`: Obrigatório, inteiro > 0

**Resposta (201 Created)**
```json
{
  "id": 10,
  "table_number": "Mesa 10",
  "capacity": 6,
  "status": "available",
  "company_id": 1
}
```

### Atualizar Status da Mesa

**PUT** `/api/tables/:id/status`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "status": "occupied"
}
```

**Validações**
- `status`: Obrigatório, enum ['available', 'occupied', 'reserved']

**Resposta (200 OK)**
```json
{
  "id": 10,
  "status": "occupied"
}
```

---

## 👤 Clientes (Customers)

### Listar Clientes

**GET** `/api/customers`

**Headers**: `Authorization: Bearer <token>`

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(11) 98765-4321",
    "address": "Rua Exemplo, 123",
    "company_id": 1,
    "created_at": "2026-01-10T10:00:00.000Z"
  }
]
```

### Criar Cliente

**POST** `/api/customers`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "name": "Maria Oliveira",
  "email": "maria@exemplo.com",
  "phone": "(11) 91234-5678",
  "address": "Av. Principal, 456"
}
```

**Validações**
- `name`: Obrigatório, 3-255 caracteres
- `email`: Opcional, formato de email válido
- `phone`: Opcional, 10-20 caracteres

**Resposta (201 Created)**
```json
{
  "id": 10,
  "name": "Maria Oliveira",
  "email": "maria@exemplo.com",
  "company_id": 1
}
```

---

## 📅 Reservas (Reservations)

### Listar Reservas

**GET** `/api/reservations`

**Headers**: `Authorization: Bearer <token>`

**Query Params**
- `date` (opcional): Filtrar por data (formato: YYYY-MM-DD)

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "customer_id": 5,
    "customer_name": "João Silva",
    "table_id": 3,
    "table_number": "Mesa 3",
    "reservation_date": "2026-01-15",
    "reservation_time": "19:30:00",
    "party_size": 4,
    "status": "confirmed",
    "company_id": 1,
    "created_at": "2026-01-12T10:00:00.000Z"
  }
]
```

### Criar Reserva

**POST** `/api/reservations`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "customerId": 5,
  "tableId": 3,
  "reservationDate": "2026-01-15",
  "reservationTime": "19:30",
  "partySize": 4
}
```

**Validações**
- `customerId`: Obrigatório, inteiro
- `tableId`: Obrigatório, inteiro
- `reservationDate`: Obrigatório, formato YYYY-MM-DD
- `reservationTime`: Obrigatório, formato HH:MM
- `partySize`: Obrigatório, inteiro > 0

**Resposta (201 Created)**
```json
{
  "id": 20,
  "status": "pending",
  "reservation_date": "2026-01-15"
}
```

---

## 📦 Estoque (Stock)

### Listar Itens do Estoque

**GET** `/api/stock`

**Headers**: `Authorization: Bearer <token>`

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "item_name": "Carne Bovina (kg)",
    "quantity": 50.5,
    "unit": "kg",
    "min_quantity": 10,
    "company_id": 1,
    "created_at": "2026-01-10T10:00:00.000Z"
  }
]
```

### Adicionar Item ao Estoque

**POST** `/api/stock`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "itemName": "Tomate (kg)",
  "quantity": 30,
  "unit": "kg",
  "minQuantity": 5
}
```

**Validações**
- `itemName`: Obrigatório, 3-255 caracteres
- `quantity`: Obrigatório, numérico >= 0
- `unit`: Obrigatório, máximo 20 caracteres
- `minQuantity`: Opcional, numérico >= 0

**Resposta (201 Created)**
```json
{
  "id": 15,
  "item_name": "Tomate (kg)",
  "quantity": 30,
  "unit": "kg"
}
```

---

## 💰 Transações Financeiras (Transactions)

### Listar Transações

**GET** `/api/transactions`

**Headers**: `Authorization: Bearer <token>`

**Query Params**
- `type` (opcional): Filtrar por tipo (income, expense)
- `startDate` (opcional): Data inicial (YYYY-MM-DD)
- `endDate` (opcional): Data final (YYYY-MM-DD)

**Resposta (200 OK)**
```json
[
  {
    "id": 1,
    "description": "Venda - Pedido #ORD-050",
    "amount": "125.80",
    "type": "income",
    "category": "Vendas",
    "payment_method": "credit_card",
    "company_id": 1,
    "created_at": "2026-01-12T15:00:00.000Z"
  }
]
```

### Criar Transação

**POST** `/api/transactions`

**Headers**: `Authorization: Bearer <token>`

**Body**
```json
{
  "description": "Compra de ingredientes",
  "amount": 350.00,
  "type": "expense",
  "category": "Suprimentos",
  "paymentMethod": "debit_card"
}
```

**Validações**
- `description`: Obrigatório, 3-500 caracteres
- `amount`: Obrigatório, numérico > 0
- `type`: Obrigatório, enum ['income', 'expense']
- `category`: Obrigatório, máximo 100 caracteres
- `paymentMethod`: Obrigatório, enum ['cash', 'credit_card', 'debit_card', 'pix', 'other']

**Resposta (201 Created)**
```json
{
  "id": 50,
  "description": "Compra de ingredientes",
  "amount": "350.00",
  "type": "expense"
}
```

---

## 🔒 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: username duplicado) |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

## 🛡️ Rate Limiting

- **Global**: 100 requisições por 15 minutos por IP
- **Login**: 5 requisições por 15 minutos por IP

## 🔧 Health Check

**GET** `/api/health`

**Resposta (200 OK)**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-12T10:00:00.000Z",
  "database": "connected"
}
```

---

**Última atualização**: 12 de janeiro de 2026  
**Versão da API**: 3.0.0
