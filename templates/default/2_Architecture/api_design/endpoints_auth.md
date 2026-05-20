---
id: API-AUTH-001
type: api_endpoint
title: 认证 API
status: draft
version: 1
tags: []
dependencies:
  - US-001
---

# 认证 API 端点

## 端点列表

### 1. 用户注册

```
POST /auth/register
```

**描述**：新用户注册账号。

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "用户名"
}
```

**响应体**：
```json
{
  "code": 0,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "用户名",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token-string"
  },
  "message": "注册成功"
}
```

**错误响应**：
| 错误码 | 说明 |
|--------|------|
| `AUTH_001` | 邮箱已被注册 |
| `VALID_001` | 参数校验失败 |

---

### 2. 用户登录

```
POST /auth/login
```

**描述**：用户使用邮箱和密码登录。

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**响应体**：
```json
{
  "code": 0,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "用户名"
    },
    "token": "jwt-token-string"
  },
  "message": "登录成功"
}
```

---

### 3. 退出登录

```
POST /auth/logout
```
**权限**：需登录

**描述**：用户退出登录，使 Token 失效。

**请求头**：`Authorization: Bearer <token>`

**请求体**：无

**响应体**：
```json
{
  "code": 0,
  "message": "已退出登录"
}
```

---

### 4. 获取当前用户信息

```
GET /auth/me
```
**权限**：需登录

**描述**：获取当前登录用户的详细信息。

**请求头**：`Authorization: Bearer <token>`

**响应体**：
```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "用户名",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  }
}
```

### 5. 修改密码

```
PUT /auth/password
```
**权限**：需登录

**请求体**：
```json
{
  "old_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

### 6. 刷新 Token

```
POST /auth/refresh
```
**权限**：需登录

**描述**：刷新即将过期的 JWT Token。

---

## 通用响应格式

```json
{
  "code": 0,
  "data": {},
  "message": "success"
}
```

## 认证方式

采用 JWT (JSON Web Token) Bearer Token 认证：
- Token 有效期：`access_token` 1小时，`refresh_token` 7天
- Token 存储：客户端存储于 `localStorage` 或 `httpOnly cookie`
