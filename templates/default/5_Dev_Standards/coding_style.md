---
id: CST-001
type: coding_style
title: 代码风格规范
status: draft
version: 1
tags: []
dependencies: []
---

# 代码风格规范

## 格式化规则

本项目使用自动化工具保证代码风格一致性：

| 规则 | 配置 |
|------|------|
| 缩进 | 2 空格（不使用 Tab） |
| 引号 | 单引号 `'`（字符串），双引号用于 JSX 属性 |
| 分号 | 必须使用分号 |
| 行尾 | LF (Unix) |
| 行宽 | 100 字符 |
| 尾逗号 | 所有多行结构使用尾逗号 |

## ESLint 规则

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## 代码组织

### 文件结构

每个模块文件按以下顺序组织：
1. Import 语句（第三方库 → 内部模块 → 类型导入）
2. Type/Interface 定义
3. 常量定义
4. 函数/类实现
5. Export 语句

### Import 排序

```typescript
// 1. Node.js 内置模块
import fs from 'node:fs';
import path from 'node:path';

// 2. 第三方库
import chalk from 'chalk';
import { Command } from 'commander';

// 3. 内部模块
import { SpecProject } from '@spec-cli/core';
import { Entry } from '@spec-cli/shared';

// 4. 类型导入
import type { ValidationResult } from '@spec-cli/shared';
```

### 函数命名

```typescript
// 动词开头
function getUserById() {}
function createOrder() {}
function validateInput() {}
function hasPermission() {}

// 事件处理
function handleClick() {}
function onKeyDown() {}
```

### 注释规范

```typescript
/**
 * JSDoc 用于公共 API
 * @param name - 参数说明
 * @returns 返回值说明
 */
export function greet(name: string): string {
  // 单行注释用于解释实现细节
  return `Hello, ${name}`;
}
```
