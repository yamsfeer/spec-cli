---
id: AI-FI-001
type: ai_prompt
title: 文件索引
status: draft
version: 1
tags: []
dependencies: []
---

# 文件索引

> 本文档为 AI 编码助手提供项目结构的快速索引。添加新文件后请更新此表。

## 项目结构

```
project-root/
├── src/
│   ├── routes/        # API 路由定义
│   ├── controllers/   # 请求处理控制器
│   ├── services/      # 业务逻辑服务层
│   ├── repositories/  # 数据访问层
│   ├── models/        # 数据模型定义
│   ├── middleware/     # Express/Web 中间件
│   ├── utils/         # 工具函数
│   └── config/        # 配置管理
├── tests/             # 测试文件
├── prisma/            # 数据库 Schema (如使用 Prisma)
├── public/            # 静态资源
└── docs/              # 项目文档
```

## 文件清单

| 文件路径 | 用途 | 关键导出/内容 |
|---------|------|-------------|
| `src/index.ts` | 应用入口 | 启动服务器 |
| `src/config/index.ts` | 配置管理 | `config` 对象 |
| `src/routes/index.ts` | 路由聚合 | 注册所有路由 |
| `src/utils/validators.ts` | 通用校验函数 | `validateEmail`, `validatePassword` |
| `src/middleware/auth.ts` | 认证中间件 | `authMiddleware` |
| `src/middleware/errorHandler.ts` | 错误处理中间件 | `errorHandler` |

## 关键类型定义

| 类型/接口 | 文件 | 用途 |
|----------|------|------|
| `User` | `src/models/user.ts` | 用户数据模型 |
| `Order` | `src/models/order.ts` | 订单数据模型 |
| `ApiResponse<T>` | `src/utils/types.ts` | 统一 API 响应格式 |

## 环境变量

| 变量名 | 用途 | 必填 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | 是 |
| `JWT_SECRET` | JWT 签名密钥 | 是 |
| `PORT` | 服务端口 | 否 (默认 3000) |
| `NODE_ENV` | 运行环境 | 否 (默认 development) |

## 更新规则

1. 新增/重命名/删除文件时更新此索引
2. 新增环境变量时更新环境变量表格
3. 新增公共类型时更新类型定义表格
