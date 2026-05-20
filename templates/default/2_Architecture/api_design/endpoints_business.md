---
id: API-BIZ-001
type: api_endpoint
title: 业务 API
status: draft
version: 1
tags: []
dependencies:
  - US-001
---

# 业务 API 端点

## 商品管理

### GET /products
**描述**：获取商品列表（支持分页、筛选、排序）

**查询参数**：`?page=1&limit=20&category=xxx&sort=created_at`

**响应体**：
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "商品名",
        "price": 99.99,
        "images": ["url"],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### GET /products/:id
**描述**：获取商品详情

### POST /products (需管理员权限)
**描述**：创建商品

### PUT /products/:id (需管理员权限)
**描述**：更新商品

### DELETE /products/:id (需管理员权限)
**描述**：删除商品（软删除）

---

## 订单管理

### POST /orders (需登录)
**描述**：创建订单

**请求体**：
```json
{
  "items": [
    { "product_id": "uuid", "quantity": 2 }
  ],
  "address_id": "uuid"
}
```

### GET /orders (需登录)
**描述**：获取当前用户的订单列表

### GET /orders/:id (需登录)
**描述**：获取订单详情

### PUT /orders/:id/cancel (需登录)
**描述**：取消订单

---

## 用户管理

### PUT /users/profile (需登录)
**描述**：更新用户个人信息

### GET /users/addresses (需登录)
**描述**：获取用户地址列表

### POST /users/addresses (需登录)
**描述**：添加收货地址

---

## 通用查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | number | 页码，从 1 开始 |
| `limit` | number | 每页条数，默认 20，最大 100 |
| `sort` | string | 排序字段 |
| `order` | string | 排序方向 (asc/desc) |

## 通用错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|-----------|------|
| `NOT_FOUND_001` | 404 | 资源不存在 |
| `AUTH_002` | 403 | 权限不足 |
| `VALID_001` | 400 | 请求参数校验失败 |
| `SERVER_001` | 500 | 服务器内部错误 |
