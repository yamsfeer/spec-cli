---
id: ER-001
type: entity
title: ER 图
status: draft
version: 1
tags: []
dependencies: []
---

# 实体关系图 (ER Diagram)

## ER 图

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Address : has
    User {
        uuid id PK
        string email UK
        string password_hash
        string name
        datetime created_at
        datetime updated_at
    }

    Product ||--o{ OrderItem : contains
    Product {
        uuid id PK
        string name
        text description
        decimal price
        int stock
        datetime created_at
        datetime updated_at
    }

    Order ||--|{ OrderItem : includes
    Order {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        string status
        uuid address_id FK
        datetime created_at
        datetime updated_at
    }

    OrderItem {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }

    Address {
        uuid id PK
        uuid user_id FK
        string receiver_name
        string phone
        string province
        string city
        string district
        string detail
        boolean is_default
    }
```

## 关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| User → Order | 1:N | 一个用户可以有多个订单 |
| User → Address | 1:N | 一个用户可以有多个收货地址 |
| Order → OrderItem | 1:N | 一个订单包含多个商品项 |
| Product → OrderItem | 1:N | 一个商品可以出现在多个订单项中 |

## 索引设计

| 表 | 索引字段 | 类型 | 说明 |
|----|---------|------|------|
| User | email | UNIQUE | 登录时查找 |
| Order | user_id, status | COMPOSITE | 查询用户订单列表 |
| Order | created_at | BTREE | 按时间排序 |
| Product | name | FULLTEXT | 商品搜索 |
