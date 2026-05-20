---
id: NC-001
type: naming_convention
title: 命名规范
status: draft
version: 1
tags: []
dependencies:
  - CST-001
---

# 命名规范

## 文件命名

| 文件类型 | 规则 | 示例 |
|---------|------|------|
| TypeScript 模块 | kebab-case | `spec-project.ts` |
| React 组件 | PascalCase | `LoginForm.tsx` |
| 样式文件 | kebab-case | `login-form.module.css` |
| 测试文件 | `*.test.ts` / `*.spec.ts` | `validator.test.ts` |
| 配置文件 | kebab-case | `tsconfig.json` |
| Markdown 文档 | snake_case | `user_stories.md` |
| 目录 | PascalCase / snake_case 根据项目约定 | `components/`, `api_design/` |

## 代码命名

### 变量

```typescript
// camelCase
let userName = '';
const maxRetryCount = 3;
const isLoading = false;  // boolean 使用 is/has/should 前缀
```

### 常量

```typescript
// UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;
```

### 函数

```typescript
// camelCase，动词开头
function getUserById(id: string) {}
function createOrder(data: OrderData) {}
function validateEmail(email: string) {}
function hasAccess(user: User) {}
function isActive(user: User) {}  // boolean 返回值用 is/has
```

### 类

```typescript
// PascalCase
class UserService {}
class OrderController {}
class DatabaseConnection {}
```

### 接口与类型

```typescript
// PascalCase
interface UserProfile {}
type OrderStatus = 'pending' | 'paid' | 'shipped';
```

### 枚举

```typescript
// PascalCase 枚举名，PascalCase 成员
enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
}
```

## 数据库命名

| 对象 | 规则 | 示例 |
|------|------|------|
| 表名 | snake_case，复数 | `users`, `order_items` |
| 主键 | `id` | `id` |
| 外键 | `{referenced_table}_id` | `user_id`, `order_id` |
| 时间戳 | `created_at`, `updated_at` | — |
| 布尔字段 | `is_` 前缀 | `is_active`, `is_deleted` |
| 索引 | `idx_{table}_{column}` | `idx_users_email` |

## API 命名

| 对象 | 规则 | 示例 |
|------|------|------|
| 路由 | 复数名词，kebab-case | `/users`, `/order-items` |
| 查询参数 | camelCase | `?pageSize=20&sortBy=createdAt` |
| 错误码 | UPPER_SNAKE_CASE | `AUTH_TOKEN_EXPIRED` |

## Git 命名

| 对象 | 规则 | 示例 |
|------|------|------|
| 分支 | `type/description` | `feature/user-login`, `fix/token-expiry` |
| Tag | `v{major}.{minor}.{patch}` | `v1.2.0` |
