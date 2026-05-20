---
id: ENT-USER-001
type: entity
title: 用户实体
status: draft
version: 1
tags: []
dependencies:
  - ER-001
---

# 用户实体 (User)

## 字段定义

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK, NOT NULL | 用户唯一标识，自动生成 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 用户邮箱，用于登录和通知 |
| password_hash | VARCHAR(255) | NOT NULL | 密码的哈希值（bcrypt/argon2），不存储明文 |
| name | VARCHAR(100) | NOT NULL | 用户显示名称 |
| avatar_url | VARCHAR(500) | NULLABLE | 用户头像 URL |
| email_verified | BOOLEAN | NOT NULL, DEFAULT false | 邮箱是否验证 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 最后更新时间 |
| deleted_at | TIMESTAMP | NULLABLE | 软删除时间（NULL 表示未删除） |

## 关联关系

- `User` 1 → N `Order`：用户拥有多个订单
- `User` 1 → N `Address`：用户拥有多个收货地址

## 业务规则

1. **邮箱唯一性**：系统内邮箱必须唯一（不区分大小写）
2. **密码强度**：密码长度 8-128 字符，必须包含字母和数字
3. **软删除**：用户删除操作不物理删除数据，设置 `deleted_at` 时间戳
4. **时间戳**：`created_at` 创建时设置后不可修改，`updated_at` 每次更新自动刷新

## 状态流转

```
注册 → 邮箱未验证 → 邮箱已验证 → 活跃
                         ↓
                       已删除 (软删除)
```

## TypeScript 类型定义

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;  // 仅在服务端使用
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```
