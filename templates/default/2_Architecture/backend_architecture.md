---
id: BA-001
type: backend_architecture
title: 后端架构
status: draft
version: 1
tags: []
dependencies:
  - TS-001
---

# 后端架构

## 分层架构

```
┌─────────────────┐
│   Routes / API   │  ← 路由层：处理 HTTP 请求/响应
├─────────────────┤
│   Controllers    │  ← 控制层：参数校验、调用服务
├─────────────────┤
│    Services      │  ← 服务层：业务逻辑
├─────────────────┤
│   Repository     │  ← 数据层：数据库访问
├─────────────────┤
│    Database      │  ← 数据库
└─────────────────┘
```

## 目录结构

```
server/
├── src/
│   ├── routes/        # 路由定义
│   ├── controllers/   # 控制器
│   ├── services/      # 业务服务
│   ├── repositories/  # 数据访问
│   ├── models/        # 数据模型
│   ├── middleware/     # 中间件
│   ├── utils/         # 工具函数
│   └── config/        # 配置
└── tests/
```

## 中间件

| 中间件 | 用途 | 优先级 |
|--------|------|--------|
| Logger | 请求日志记录 | 前置 |
| Auth | 身份认证 & 鉴权 | 前置 |
| CORS | 跨域处理 | 前置 |
| Rate Limit | 限流保护 | 前置 |
| Error Handler | 统一错误处理 | 后置 |

## 错误码设计

采用统一的错误码体系：

| 错误码 | 含义 | HTTP 状态码 |
|--------|------|-----------|
| `AUTH_001` | Token 无效 | 401 |
| `AUTH_002` | 权限不足 | 403 |
| `VALID_001` | 参数校验失败 | 400 |
| `NOT_FOUND_001` | 资源不存在 | 404 |
| `SERVER_001` | 内部服务错误 | 500 |
