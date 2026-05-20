---
id: TEST-001
type: git_workflow
title: 测试策略
status: draft
version: 1
tags: []
dependencies:
  - CST-001
---

# 测试策略

## 测试金字塔

```
        ┌──────┐
        │ E2E  │  ← 少：关键用户流程
        ├──────┤
        │ 集成  │  ← 中：API + 数据库交互
        ├──────┤
        │ 单元  │  ← 多：函数/类/组件
        └──────┘
```

## 各层测试说明

### 单元测试 (Unit Tests)

| 项目 | 说明 |
|------|------|
| 工具 | Vitest（前端）/ Vitest + Supertest（后端） |
| 覆盖范围 | 所有工具函数、业务逻辑函数、组件渲染 |
| 目标覆盖率 | ≥ 80% |
| 运行频率 | 每次提交 + CI |

```typescript
// 示例：单元测试
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validators';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });
});
```

### 集成测试 (Integration Tests)

| 项目 | 说明 |
|------|------|
| 覆盖范围 | API 端点、数据库操作、外部服务交互 |
| 环境 | 使用测试数据库/容器 |
| 运行频率 | 每次 PR + CI |

```typescript
// 示例：API 集成测试
describe('POST /auth/register', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'Test1234!', name: 'Test' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('test@example.com');
  });
});
```

### E2E 测试 (End-to-End)

| 项目 | 说明 |
|------|------|
| 工具 | Playwright / Cypress |
| 覆盖范围 | 关键用户流程（注册→登录→核心操作） |
| 运行频率 | 发布前 + nightly CI |

```typescript
// 示例：E2E 测试 (Playwright)
test('user can login and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test1234!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 测试文件组织

```
src/
├── utils/
│   ├── validators.ts
│   └── __tests__/
│       └── validators.test.ts
├── services/
│   ├── user.service.ts
│   └── __tests__/
│       └── user.service.test.ts
```

## 测试命名规范

| 场景 | 格式 |
|------|------|
| 函数 | `describe('functionName', () => { ... })` |
| 正常情况 | `it('should return X when given Y')` |
| 异常情况 | `it('should throw error when given invalid input')` |
| 边界值 | `it('should handle empty array')` |

## 运行命令

```bash
# 运行所有测试
pnpm test

# 运行单个文件
pnpm test path/to/test.test.ts

# 带覆盖率
pnpm test --coverage

# Watch 模式
pnpm test --watch
```
