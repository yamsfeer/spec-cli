# Spec CLI — 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位

**Spec CLI** 是一个以规范驱动开发（SDD）为核心思想的命令行工具，用 TypeScript 实现。它帮助用户创建、管理、校验和可视化项目规范文档（specs），并通过 AI 辅助生成高质量的 PRD、架构设计等核心文档。

### 1.2 目标用户

| 用户类型 | 特征 | 核心需求 |
|---------|------|---------|
| 独立开发者 | 技术能力强，产品思维弱 | 需要 AI 辅助梳理需求，快速生成架构 |
| 非技术创业者 | 有产品想法，无技术背景 | 需要 AI 全流程引导，降低专业门槛 |
| 小型团队 | 有分工但缺规范 | 需要标准化的文档体系和协作流程 |

### 1.3 核心价值

- **标准化**：一套完整的 Spec 文档体系，目录结构、格式、引用关系完全标准化
- **智能化**：内置 PM Agent 和 Architect Agent，用 AI 辅助生成高质量核心文档
- **可校验**：自动检测文档完整性、一致性、引用健康度，防止“文档腐烂”
- **可视化**：通过 Spec Lens 和 Spec Graph 直观理解复杂的文档引用关系
- **可追溯**：变更影响分析，每次修改都知道波及范围

---

## 2. 核心概念

### 2.1 Spec 文档体系

项目 Spec 由 7 个核心类别组成，存储在 `specs/` 目录下：

```
specs/
├── 0_Project_Overview/     # 项目总览（项目简介、术语表、项目宪法）
├── 1_PRD/                  # 产品需求（用户故事、功能规格、非功能性需求）
├── 2_Architecture/         # 技术架构（技术栈、系统架构、API 设计、部署）
├── 3_Data_Model/           # 数据模型（ER 图、实体定义、Schema、数据字典）
├── 4_UI_UX/                # UI/UX 设计（Design Tokens、组件库、状态机、页面流）
├── 5_Dev_Standards/        # 开发规范（代码风格、命名规范、Git 工作流、测试）
├── 6_AI_Context/           # AI 协作上下文（提示词模板、AI 规则、文件索引）
└── 7_Changelog/            # 变更记录（变更日志、架构决策记录）
```

### 2.2 条目 ID 与引用系统

- 每个可被引用的内容单元称为一个“条目”（Entry），拥有全局唯一的 ID
- ID 格式：`{类型前缀}-{唯一标识}`，如 `US-001`、`API-POST-/auth/login`
- 引用通过 Front Matter 的 `dependencies` 字段或内联 `@ref(ID)` 声明
- 系统维护一个 `_ref_index.json`，记录所有条目及其引用关系

### 2.3 专家 Agent

| Agent | 职责 | 调起时机 |
|-------|------|---------|
| **PM Agent** | 结构化访谈用户，生成高质量 PRD | `spec-cli generate --batch prd` |
| **Architect Agent** | 从 PRD 推理生成架构设计、数据模型 | `spec-cli generate --batch architecture` |

---

## 3. 命令体系

### 3.1 命令总览

```
spec-cli
├── init           初始化项目 Spec
├── generate       用 AI 对话填充 Spec 文档
├── validate       校验 Spec 规范性和一致性
├── lens           可视化浏览 Spec 文档
├── graph          查询 Spec 引用关系与影响分析
├── update         变更管理与影响分析
├── status         查看 Spec 整体状态
├── export         导出为其他格式
└── config         管理 spec-cli 自身配置
```

---

### 3.2 `spec-cli init` — 初始化项目

**用途：** 从零创建一个标准化的 Spec 项目。

**流程：**
1. 进入 AI 对话模式，引导用户描述产品（产品名、一句话介绍、目标用户、核心场景、技术偏好）
2. 根据对话生成项目初始化声明，写入 `project_brief.md`
3. 运行骨架生成脚本：创建完整目录结构、复制模板文件、分配全局唯一 ID、注入占位引用、生成 `_ref_index.json`
4. 输出初始化报告（创建了多少文件、多少待填充、下一步操作）

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| `--template <name>` | string | 使用预设模板（`web-fullstack`、`mobile-app`、`cli-tool`、`api-service`） |
| `--from <file>` | string | 从已有文件导入初始声明，跳过对话 |
| `--bare` | boolean | 只生成骨架不对话，所有内容后续手动填充 |
| `--output <path>` | string | 指定输出目录，默认为当前目录 |

**输出示例：**
```
[OK] Project spec created

  Path:    ./my-product/specs/
  Files:   27 created, 21 pending
  Agent:   PM Agent ready for interview
  Next:    spec-cli generate --batch prd
```

---

### 3.3 `spec-cli generate` — 生成/填充文档

**用途：** 使用 AI 对话或专家 Agent 填充 Spec 文件内容。

**子命令 / 参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| `--batch <name>` | string | 按批次填充（`prd`、`architecture`、`data-model`、`ui-ux`、`dev-standards`、`all`） |
| `--file <path>` | string | 指定单个文件填充 |
| `--auto` | boolean | 无交互模式，一次性填充所有未完成文件 |
| `--refine` | boolean | 针对已有内容进行细化，不覆盖 |
| `--agent <name>` | string | 指定 Agent（`pm`、`architect`，默认根据 batch 自动选择） |

**批次对应关系：**
| batch 名称 | 调用的 Agent | 填充的 Spec 目录 |
|-----------|-------------|-----------------|
| `prd` | PM Agent | `1_PRD/` |
| `architecture` | Architect Agent | `2_Architecture/` + `3_Data_Model/` |
| `data-model` | Architect Agent | `3_Data_Model/` |
| `ui-ux` | 默认 AI | `4_UI_UX/` |
| `dev-standards` | 默认 AI | `5_Dev_Standards/` |
| `all` | 依次调用 | 全部待填充文件 |

**交互流程（以 `--batch prd` 为例）：**
```
$ spec-cli generate --batch prd

[Agent:PM] PM Agent started

Phase 1: 产品愿景与边界
  PM: "让我们先聊聊你的产品。它叫什么名字？"
  你: "SubWise"
  PM: "一句话介绍它？"
  你: "独立开发者的 SaaS 订阅管理工具"

Phase 2: 用户画像
  PM: "谁会用它？描述一下典型用户"
  ...

Phase 3: 核心场景
  PM: "用户第一次打开 SubWise，你希望他看到什么？"
  ...

[... 访谈继续 ...]

Phase 7: 评审确认
  PM: "我已经整理好了 PRD，包含 8 个用户故事。要逐条过一遍吗？"

[OK] PRD generation complete
  1_PRD/prd_main.md
  1_PRD/user_stories.md (8 个用户故事)
  1_PRD/non_functional.md
  References auto-generated, IDs assigned
[OK] validate --light passed
```

**PM Agent 核心能力：**
- 结构化访谈（愿景 → 用户 → 场景 → 功能 → 边界 → 非功能）
- 追问与反诘（主动发现用户遗漏的边界条件）
- 场景穷举（登录失败、密码找回、账号锁定等）
- 矛盾检测（“你要简单又要强大——具体怎么取舍？”）
- 优先级引导（MoSCoW 分类）
- 竞品参考注入
- 缺失补全（基于行业知识库建议遗漏项）
- 生成 EARS 格式验收标准

**Architect Agent 核心能力：**
- 从 PRD 提取架构约束（并发量级、数据规模、实时性要求）
- 质量属性优先级排序（性能 vs 可维护性 vs 安全性）
- 技术选型推理（候选方案对比 → 推荐 + 理由）
- 架构模式匹配（单体/微服务、REST/GraphQL、关系型/文档型）
- 数据建模（实体识别 → 关系识别 → ER 图 → Schema）
- API 设计（从用户故事推导端点 → OpenAPI 定义）
- 组件拆分（前端组件树、后端模块分层）
- 假设声明（明确列出未确认的假设，供用户审查）
- 架构决策记录（ADR）自动生成

---

### 3.4 `spec-cli validate` — 校验规范

**用途：** 校验 Spec 文档是否符合规范，检测一致性问题。

**检查项分类：**
| 类别 | 检查项 | 严重程度 |
|------|--------|---------|
| 结构规范 | 目录结构是否完整 | Error |
| 结构规范 | 必填文件是否存在 | Error |
| Front Matter | 必填字段是否存在 | Error |
| Front Matter | 字段类型是否正确 | Error |
| ID 体系 | 所有条目 ID 是否全局唯一 | Error |
| ID 体系 | 所有 `@ref()` 和 `dependencies` 中的 ID 是否能找到目标 | Error |
| ID 体系 | 双向引用是否一致 | Warning |
| 引用完整性 | 用户故事是否关联了状态机、API、实体 | Warning |
| 引用完整性 | 是否有孤儿条目（无任何引用关系的孤立条目） | Warning |
| 数据格式 | JSON/YAML/Mermaid 代码块是否可解析 | Error |
| 内容完整性 | 每个文件的必填章节是否非空 | Warning |
| 术语一致性 | 同一概念在不同文件中的名称是否一致 | Warning |
| 版本一致性 | 上下游条目版本是否匹配 | Warning |

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| `--strict` | boolean | 将 Warning 也视为 Error |
| `--file <path>` | string | 只检查指定文件 |
| `--fix` | boolean | 自动修复可修复的问题（如双向引用补全） |
| `--json` | boolean | 以 JSON 格式输出检查结果 |

**输出示例：**
```
Spec Validation Report
========================

[ERROR] 3 errors found:
  - api_design/endpoints_auth.md: 引用不存在的 ID "ENT-session"
  - 3_Data_Model/entities/user.md: Front Matter 缺少 "id" 字段
  - 4_UI_UX/user_flows/: 目录为空

[WARN] 5 warnings:
  - US-002 "查看统计报表": 未关联任何 API
  - ENT-user.email: 1_PRD 中称"邮箱"，3_Data_Model 中称"email"
  - PF-settings: 未被任何用户故事引用（可能是死流程）
  - US-008 版本为 v2，但其引用的 ENT-discount 版本为 v1
  - 2_Architecture/tech_stack.md: 技术栈清单章节为空

Completion:     67% (18/27 files filled)
Ref health:     92% (2 dangling refs)
```

---

### 3.5 `spec-cli lens` — 可视化浏览

**用途：** 启动本地 Web 服务，以可视化方式浏览 Spec 文档。

**子命令：**
| 命令 | 说明 |
|------|------|
| `spec-cli lens` | 启动 Web 服务，在浏览器中浏览 Spec |
| `spec-cli lens --dependency` | 打开依赖拓扑图视图 |
| `spec-cli lens --file <path>` | 查看单个文件的渲染视图 |
| `spec-cli lens --story <ID>` | 以用户故事为中心，展示关联的所有条目 |

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| `--port <number>` | number | 指定端口，默认 3000 |
| `--open` | boolean | 自动打开浏览器 |

**核心视图：**
- **文档阅读视图：** Markdown 渲染 + 结构化数据可视化（JSON Schema 渲染为表格、Mermaid 渲染为图表）
- **依赖拓扑图：** 以力导向图展示所有条目及其引用关系，节点可点击跳转
- **用户故事追踪视图：** US → 页面流 → 组件状态机 → API → 实体，一图展示完整链路
- **完成度仪表盘：** 各类别填充进度、引用健康度、待处理变更

---

### 3.6 `spec-cli graph` — 引用关系查询

**用途：** 查询 Spec 文档间的引用关系，理解影响范围。

**子命令：**
| 命令 | 说明 | 对应 Claude Code |
|------|------|-----------------|
| `spec-cli graph context <ID>` | 展示某个条目的完整上下文 | `context` |
| `spec-cli graph search <query>` | 搜索 Spec 中的概念、ID、术语 | `search` |
| `spec-cli graph caller <ID>` | 查询谁引用了这个条目 | `caller` |
| `spec-cli graph impact <ID>` | 分析修改该条目的影响半径 | `impact` |
| `spec-cli graph status` | Spec 整体健康度报告 | `status` |
| `spec-cli graph diff` | 未提交变更的影响概览 | — |

**参数（通用）：**
| 参数 | 类型 | 说明 |
|------|------|------|
| `--json` | boolean | 以 JSON 格式输出 |
| `--depth <number>` | number | 影响分析的深度，默认 3 层 |

**各子命令输出设计：**

#### `graph context <ID>`
```
US-001: 用户登录
========================================
Location:  1_PRD/user_stories.md
Summary:   作为注册用户，我希望使用邮箱和密码登录...
Upstream:  (none)
Downstream:
  ├── API-POST-/auth/login
  ├── PF-login
  ├── CSF-LoginForm
  └── ENT-user
Tags:      [P0] [auth] [core]
Status:    confirmed | Version: v2
```

#### `graph search <query>`
```
Search: "订阅提醒"
========================================
ID matches (1):
  US-005: 订阅到期提醒

Content matches (3):
  2_Architecture/api_design/endpoints_business.md
    └─ API-GET-/subscriptions/expiring-soon
  4_UI_UX/user_flows/flow_notification.md
    └─ "系统在到期前 3 天推送提醒"
  5_Dev_Standards/naming_conventions.md
    └─ 提及 "reminder" 前缀规范

Found 4 results
```

#### `graph caller <ID>`
```
"ENT-discount" is referenced by:
========================================
Direct references (5):
  ├── US-008: 优惠券使用
  ├── API-POST-/orders/apply-discount
  ├── PF-checkout: 结算页面流
  ├── CSF-DiscountInput: 优惠码输入组件
  └── ENT-order.total_discount: 关联字段

Indirect references (2):
  └── US-012: 订单详情查看 (via ENT-order)
  └── API-GET-/orders/:id (via ENT-order)

[WARN] Deleting this entry affects 7 references
```

#### `graph impact <ID>`
```
Impact analysis for "US-001 用户登录":
========================================
Direct downstream (must update):
  └── API-POST-/auth/login (若变更了认证方式)

Indirect downstream (review suggested):
  ├── PF-login (页面流可能需调整)
  ├── CSF-LoginForm (组件状态可能需增加)
  └── US-005 "找回密码" (复用同一页面流)

Scope:
  Impact depth:    2 levels
  Files affected:  4
  Entries touched: 6
  Impact score:    6/10
```

#### `graph status`
```
Spec Health Report
========================================
Completion:      ████████░░ 78%  (21/27 files filled)
Ref health:      ██████████ 100% (no dangling refs)
Consistency:     ███████░░░ 72%

[WARN] Terminology inconsistency (3)
[WARN] Broken bidirectional refs (2)
[WARN] Orphan entries (1)
[WARN] Version behind (2)
```

#### `graph diff`
```
Uncommitted Changes
========================================
Modified entries (3):
  [MOD] US-001: 用户登录 → 增加了 "手机号登录"
  [MOD] API-POST-/auth/login → 请求体新增 "phone" 字段
  [MOD] CSF-LoginForm → 状态机新增 "phone_input" 状态

[WARN] Affected but not modified (2):
  US-005 "找回密码"、PF-login 页面流

[WARN] New dangling reference (1):
  ENT-user.phone 字段尚未定义
```

---

### 3.7 `spec-cli update` — 变更管理

**用途：** 管理 Spec 的变更流程，追踪影响范围，引导修改。

**子命令：**
| 命令 | 说明 |
|------|------|
| `spec-cli update start <ID>` | 开始一个变更，标记条目为"修改中"，创建变更记录 |
| `spec-cli update analyze <ID>` | 分析修改该条目的影响范围（等价于 `graph impact`，但会记录到变更上下文） |
| `spec-cli update apply <ID>` | AI 引导修改，逐级更新受影响的下游条目 |
| `spec-cli update review` | 展示本次所有变更的 Diff，确认后更新 Changelog |
| `spec-cli update abort` | 放弃本次变更，恢复到修改前状态 |

**变更流程示例：**
```
$ spec-cli update start US-001
[OK] Change #12 created: "修改 US-001 用户登录"

$ spec-cli update analyze US-001
[... 影响分析报告 ...]

$ spec-cli update apply US-001
[Agent:AI] "你希望对 US-001 做什么改动？"
你: "增加手机号登录的方式"
[Agent:AI] "好的，这将影响以下条目：
  - API-POST-/auth/login: 需增加 phone 字段
  - CSF-LoginForm: 需增加 phone_input 状态
  - PF-login: 需更新页面流
  要逐一修改吗？"
你: "是的"
[... AI 逐一修改，每步确认 ...]
[OK] Modified 4 entries

$ spec-cli update review
Change #12 Summary:
  [OK] US-001: 增加手机号登录
  [OK] API-POST-/auth/login: 新增 phone 字段
  [OK] CSF-LoginForm: 新增 phone_input 状态
  [OK] PF-login: 更新页面流
  [OK] Changelog: 已更新

$ spec-cli update abort  (如果需要放弃)
[OK] Reverted change #12
```

---

### 3.8 `spec-cli status` — 状态总览

**用途：** 快速查看 Spec 整体状态。

**输出示例：**
```
Spec Status: SubWise
========================================
Version: 0.1.0 | Last modified: 2026-05-20 14:30

Files: 27 total | 18 filled | 9 pending

Category Completion:
  0_Project_Overview  ████████░░  80%
  1_PRD               ██████████ 100%
  2_Architecture      ██████░░░░  60%
  3_Data_Model        ████████░░  80%
  4_UI_UX             ████░░░░░░  40%
  5_Dev_Standards     ██████████ 100%
  6_AI_Context        ██░░░░░░░░  20%
  7_Changelog         ░░░░░░░░░░   0%

Ref health:     92% (2 dangling refs)
[WARN] Pending changes: 1 (#12: Modify US-001)
```

---

### 3.9 `spec-cli export` — 格式导出

**用途：** 导出 Spec 为其他格式。

| 参数 | 类型 | 说明 |
|------|------|------|
| `--format <type>` | string | 导出格式（`ai-context`、`openapi`、`pdf`、`json`） |
| `--output <path>` | string | 输出路径 |

**格式说明：**
- `ai-context`：导出为 AI Agent 可用的压缩上下文（精简 + 去冗余）
- `openapi`：从 `api_design/` 导出符合 OpenAPI 3.0 规范的文件
- `pdf`：将全部 Spec 渲染为可打印的 PDF
- `json`：整个 Spec 序列化为结构化 JSON

---

### 3.10 `spec-cli config` — 配置管理

**用途：** 管理 spec-cli 自身配置（API Key、默认模板、AI 模型选择等）。

```
spec-cli config set <key> <value>   → 设置配置项
spec-cli config get <key>            → 查看配置项
spec-cli config list                 → 列出所有配置
```

---

## 4. 技术架构

### 4.1 技术栈

| 层 | 技术选型 |
|---|---------|
| 运行时 | Node.js 18+ |
| 语言 | TypeScript 5.x |
| CLI 框架 | Commander.js 或 Clipanion |
| 交互式对话 | Inquirer.js 或 @clack/prompts |
| AI 集成 | Vercel AI SDK（模型无关，支持 OpenAI / Claude / 本地模型） |
| 文件操作 | fs-extra |
| 终端美化 | chalk（颜色、样式输出） |
| 模板引擎 | Handlebars 或 EJS（用于骨架生成） |
| 引用索引 | 自定义 JSON 数据库（lowdb 或直接 JSON 文件） |
| 校验引擎 | 自定义规则引擎 + Zod Schema 验证 |
| Web 服务（lens） | Express 或 Fastify + 前端用 React/Vue 渲染可视化 |
| 搜索 | ripgrep 库（高性能全文搜索） |
| 状态管理 | 引用索引缓存 + 文件监听（chokidar） |
| 包管理 | pnpm |
| 测试 | Vitest |
| 构建 | tsup |

### 4.2 模块架构

```
spec-cli
├── packages/
│   ├── cli/                    # CLI 入口 + 命令定义
│   │   ├── src/
│   │   │   ├── index.ts        # 入口
│   │   │   ├── commands/       # 命令实现
│   │   │   │   ├── init.ts
│   │   │   │   ├── generate.ts
│   │   │   │   ├── validate.ts
│   │   │   │   ├── lens.ts
│   │   │   │   ├── graph.ts
│   │   │   │   ├── update.ts
│   │   │   │   ├── status.ts
│   │   │   │   └── export.ts
│   │   │   └── utils/          # 终端输出美化（chalk）
│   │   └── package.json
│   │
│   ├── core/                   # 核心逻辑
│   │   ├── src/
│   │   │   ├── spec-project.ts     # 项目管理（读/写文件、维护索引）
│   │   │   ├── id-registry.ts      # ID 注册与引用管理
│   │   │   ├── template-engine.ts  # 模板渲染（骨架生成）
│   │   │   ├── dependency-graph.ts # 依赖拓扑构建与查询
│   │   │   ├── validator.ts       # 校验规则引擎
│   │   │   ├── diff-tracker.ts     # 变更追踪与回滚
│   │   │   └── searcher.ts         # 全文搜索
│   │   └── package.json
│   │
│   ├── agents/                 # 专家 Agent
│   │   ├── src/
│   │   │   ├── pm-agent.ts         # PM Agent：结构化访谈
│   │   │   ├── architect-agent.ts  # Architect Agent：架构推理
│   │   │   └── agent-base.ts       # Agent 基类
│   │   └── package.json
│   │
│   ├── lens/                   # Spec Lens Web 服务
│   │   ├── src/
│   │   │   ├── server.ts       # Express/Fastify 服务
│   │   │   ├── routes/         # API 路由
│   │   │   └── views/          # 前端可视化页面
│   │   └── package.json
│   │
│   └── shared/                 # 共享类型与常量
│       ├── src/
│       │   ├── types.ts        # 核心类型定义
│       │   ├── constants.ts    # 常量（ID 前缀、模板路径等）
│       │   └── schemas.ts      # Zod Schema 定义
│       └── package.json
│
├── templates/                  # 内置模板
│   ├── web-fullstack/
│   ├── mobile-app/
│   ├── cli-tool/
│   └── api-service/
│
├── docs/                       # spec-cli 自身文档
├── package.json                # Monorepo 根配置
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## 5. 核心数据结构

### 5.1 引用索引

```typescript
// 文件: _ref_index.json
interface RefIndex {
  version: string;           // 索引格式版本
  project: string;           // 项目名称
  last_updated: string;      // 最后更新时间
  entries: Record<string, Entry>;
}

interface Entry {
  id: string;                // 全局唯一 ID
  type: EntryType;           // 条目类型
  file: string;              // 所在文件相对路径
  title: string;             // 人类可读标题
  summary?: string;          // 内容摘要
  dependencies: string[];    // 我依赖了哪些 ID
  dependents: string[];      // 哪些 ID 依赖了我
  tags: string[];            // 标签
  status: 'draft' | 'confirmed' | 'deprecated';
  version: number;           // 条目版本号
  last_modified: string;     // 最后修改时间
  checksum: string;          // 内容校验和（检测是否被外部修改）
}

type EntryType =
  | 'project_brief'
  | 'glossary'
  | 'user_story'
  | 'functional_spec'
  | 'non_functional_requirement'
  | 'tech_stack'
  | 'system_architecture'
  | 'frontend_architecture'
  | 'backend_architecture'
  | 'api_endpoint'
  | 'data_flow'
  | 'entity'
  | 'field'
  | 'design_token'
  | 'page_flow'
  | 'component_state_flow'
  | 'component_spec'
  | 'coding_style'
  | 'naming_convention'
  | 'git_workflow'
  | 'adr'
  | 'ai_prompt'
  | 'ai_rule';
```

### 5.2 项目配置

```typescript
// 文件: .spec-cli.json
interface SpecCliConfig {
  version: string;
  project: {
    name: string;
    spec_dir: string;        // Spec 目录路径，默认 "./specs"
  };
  ai: {
    provider: 'openai' | 'anthropic' | 'local';
    model: string;
    api_key_env: string;     // 环境变量名
  };
  agents: {
    pm: {
      interview_depth: 'basic' | 'standard' | 'deep';
      language: string;
    };
    architect: {
      default_tech_stack?: string[];
      prefer_serverless: boolean;
    };
  };
  validate: {
    strict: boolean;
    auto_fix: boolean;
  };
}
```

---

## 6. 质量保障（Guard / Audit）

### 6.1 六道防线总览

| # | 防线 | 检查什么 | 对比的 Spec 来源 |
|---|------|---------|-----------------|
| ① | 需求覆盖度检查器 | 功能是否做全 | PRD |
| ② | 数据模型一致性校验器 | Schema 是否被篡改 | Data_Model |
| ③ | API 契约校验器 | 接口实现是否对版 | API_Design |
| ④ | 代码规范合规扫描器 | 风格/命名是否规范 | Dev_Standards |
| ⑤ | 架构分层守卫 | 依赖是否越界 | Architecture |
| ⑥ | UI/UX 视觉审计 | 视觉/交互是否合格 | UI_UX |

> 注：质量保障工具为独立模块，可与 spec-cli 配合使用，但不一定在 spec-cli 内部实现。

---

## 7. 非功能性需求

### 7.1 性能
- `spec-cli validate` 在 27 个文件的 Spec 项目上运行时间 < 3 秒
- `spec-cli graph` 查询延迟 < 500ms
- Spec Lens Web 页面首次加载 < 2 秒

### 7.2 可扩展性
- 支持自定义模板（用户可新增 `templates/` 目录下的模板）
- 支持自定义校验规则（插件化）
- AI 模型可切换（OpenAI / Claude / 本地模型）

### 7.3 可靠性
- `spec-cli update` 变更支持完整回滚
- 索引文件损坏时可从源文件重新构建
- 关键操作前自动创建备份

### 7.4 兼容性
- 支持 macOS、Linux、Windows（WSL）
- Node.js 18+
- 生成的 Spec 文件为纯 Markdown + JSON/YAML，可用任何编辑器打开

---

## 8. 用户故事映射

| ID | 用户故事 | 优先级 |
|----|---------|-------|
| US-001 | 作为开发者，我希望通过 `spec-cli init` 快速创建一个标准化的 Spec 项目 | P0 |
| US-002 | 作为开发者，我希望通过 PM Agent 的引导式访谈生成高质量 PRD | P0 |
| US-003 | 作为非技术创始人，我希望 Architect Agent 帮我自动生成可用的架构设计 | P0 |
| US-004 | 作为用户，我希望 `spec-cli validate` 告诉我 Spec 有哪些问题 | P0 |
| US-005 | 作为用户，我希望通过 Spec Lens 可视化浏览复杂的文档引用关系 | P1 |
| US-006 | 作为用户，我希望 `spec-cli graph impact` 告诉我修改一个需求会影响什么 | P1 |
| US-007 | 作为用户，我希望 `spec-cli update` 帮我管理变更并引导逐级修改 | P1 |
| US-008 | 作为用户，我希望 `spec-cli status` 一眼看清 Spec 整体状况 | P2 |
| US-009 | 作为用户，我希望 `spec-cli export` 导出 Spec 给 AI Agent 使用 | P2 |
| US-010 | 作为团队，我希望 Spec 的变更可追溯、可回滚 | P1 |

---

## 9. 项目宪法 (Constitution)

1. **文档即源码。** Spec 文档与代码同等重要，必须可校验、可追溯。
2. **骨架脚本化，血肉 AI 化。** 文档结构由确定性脚本保证，内容由 AI 生成。
3. **引用优先于复制。** 同一信息只在一处定义，其他地方通过 ID 引用。
4. **先校验，再生成代码。** Spec 未通过 `validate`，不允许进入代码生成阶段。
5. **用户拥有最终决策权。** AI 是辅助工具，所有关键决策需用户确认。
