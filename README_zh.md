# Spec CLI

> 以规范驱动开发（SDD）为核心思想的命令行工具

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org)

**Spec CLI** 帮助开发者创建、管理、校验和可视化项目规范文档（Specs）。内置 AI 专家 Agent，自动生成高质量 PRD、架构设计等核心文档 —— 所有内容遵循标准化、可机器校验的格式。

---

## 功能特性

- **标准化 Spec 体系** — 8 大分类目录结构、ID 引用系统、完全可校验
- **AI 专家 Agent** — PM Agent 结构化访谈生成 PRD、Architect Agent 推理生成架构
- **自动校验** — 完整性检查、一致性检测、引用健康度、文档腐烂预警
- **引用图谱** — 依赖关系查询、影响半径追踪、死链接检测
- **版本化变更** — 变更追踪与完整回滚支持
- **格式导出** — 支持 AI Context、OpenAPI、JSON 等格式导出

---

## 快速开始

```bash
# 安装（需要 Node.js >= 18）
npm install -g spec-cli

# 初始化新的 Spec 项目
spec-cli init

# 使用 AI 访谈生成 PRD
spec-cli generate --batch prd

# 校验 Spec 健康状态
spec-cli validate

# 查看整体状态
spec-cli status
```

---

## 命令总览

| 命令 | 说明 |
|------|------|
| `spec-cli init` | 初始化一个新的 Spec 项目 |
| `spec-cli generate` | 使用 AI 生成/填充 Spec 文档 |
| `spec-cli validate` | 校验 Spec 规范性和一致性 |
| `spec-cli status` | 查看 Spec 整体状态 |
| `spec-cli config` | 管理 spec-cli 配置 |
| `spec-cli graph` | 查询引用关系与影响分析 |
| `spec-cli update` | 管理变更生命周期 |
| `spec-cli export` | 导出为其他格式 |

---

## Spec 类别

```
specs/
├── 0_Project_Overview/     # 项目简介、术语表、项目宪法
├── 1_PRD/                  # 产品需求、用户故事、功能规格、非功能性需求
├── 2_Architecture/         # 技术栈、系统架构、API 设计
├── 3_Data_Model/           # ER 图、实体定义、Schema、数据字典
├── 4_UI_UX/                # Design Tokens、组件库、页面流、状态机
├── 5_Dev_Standards/        # 代码风格、命名规范、Git 工作流
├── 6_AI_Context/           # 提示词模板、AI 规则、文件索引
└── 7_Changelog/            # 变更日志、ADR 架构决策记录
```

---

## 配置

在项目根目录下创建 `.spec-cli.json`，或全局 `~/.spec-cli.json`：

```json
{
  "project": { "name": "MyApp", "spec_dir": "./specs" },
  "ai": { "provider": "openai", "model": "gpt-4o" },
  "validate": { "strict": false, "auto_fix": false }
}
```

---

## 开发指引

本项目使用 pnpm monorepo 管理：

```bash
pnpm install
pnpm build

# 快速测试
SPEC_CLI_TEMPLATES_DIR=./templates node packages/cli/dist/index.js init --bare --output /tmp/my-project
```

### 包结构

| 包 | 路径 | 说明 |
|----|------|------|
| `@spec-cli/shared` | `packages/shared/` | 共享类型定义、常量、Zod Schema |
| `@spec-cli/core` | `packages/core/` | 核心引擎（项目管理、校验、图谱、搜索） |
| `@spec-cli/agents` | `packages/agents/` | PM Agent 与 Architect Agent |
| `spec-cli` | `packages/cli/` | CLI 入口与各命令实现 |

---

## 环境要求

- Node.js >= 18
- pnpm >= 8

---

## 许可证

MIT
