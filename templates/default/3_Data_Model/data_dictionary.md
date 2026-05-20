---
id: DD-001
type: field
title: 数据字典
status: draft
version: 1
tags: []
dependencies:
  - ER-001
---

# 数据字典

## users 表

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | UUID | 是 | gen_random_uuid() | 主键 |
| email | VARCHAR(255) | 是 | — | 用户邮箱，唯一 |
| password_hash | VARCHAR(255) | 是 | — | 密码哈希值 |
| name | VARCHAR(100) | 是 | — | 用户显示名称 |
| avatar_url | VARCHAR(500) | 否 | NULL | 头像 URL |
| created_at | TIMESTAMP | 是 | NOW() | 创建时间 |
| updated_at | TIMESTAMP | 是 | NOW() | 更新时间 |

## products 表

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | UUID | 是 | gen_random_uuid() | 主键 |
| name | VARCHAR(200) | 是 | — | 商品名称 |
| description | TEXT | 否 | NULL | 商品描述 |
| price | DECIMAL(10,2) | 是 | 0.00 | 单价 |
| stock | INTEGER | 是 | 0 | 库存数量 |
| images | JSONB | 否 | '[]' | 商品图片列表 |
| status | VARCHAR(20) | 是 | 'active' | 状态：active/offline |
| created_at | TIMESTAMP | 是 | NOW() | 创建时间 |
| updated_at | TIMESTAMP | 是 | NOW() | 更新时间 |

## orders 表

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | UUID | 是 | gen_random_uuid() | 主键 |
| user_id | UUID | 是 | — | 用户 ID (FK → users) |
| total_amount | DECIMAL(12,2) | 是 | 0.00 | 订单总金额 |
| status | VARCHAR(20) | 是 | 'pending' | pending/paid/shipped/completed/cancelled |
| address_id | UUID | 是 | — | 收货地址 (FK → addresses) |
| created_at | TIMESTAMP | 是 | NOW() | 创建时间 |
| updated_at | TIMESTAMP | 是 | NOW() | 更新时间 |

## order_items 表

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | UUID | 是 | gen_random_uuid() | 主键 |
| order_id | UUID | 是 | — | 订单 ID (FK → orders) |
| product_id | UUID | 是 | — | 商品 ID (FK → products) |
| quantity | INTEGER | 是 | 1 | 数量 |
| unit_price | DECIMAL(10,2) | 是 | — | 下单时单价 |

## addresses 表

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | UUID | 是 | gen_random_uuid() | 主键 |
| user_id | UUID | 是 | — | 用户 ID (FK → users) |
| receiver_name | VARCHAR(100) | 是 | — | 收货人姓名 |
| phone | VARCHAR(20) | 是 | — | 联系电话 |
| province | VARCHAR(50) | 是 | — | 省份 |
| city | VARCHAR(50) | 是 | — | 城市 |
| district | VARCHAR(50) | 是 | — | 区/县 |
| detail | VARCHAR(500) | 是 | — | 详细地址 |
| is_default | BOOLEAN | 是 | false | 是否默认地址 |
