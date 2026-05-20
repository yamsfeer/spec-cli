# Spec CLI — TODO / 开发跟踪

> 最后更新: 2026-05-21

---

## 已完成 (MVP)

### 项目基础设施

- [x] pnpm monorepo 工作区配置
- [x] TypeScript 构建配置 (tsup)
- [x] 4 个包的 package.json 与依赖管理
- [x] 统一的 tsconfig.json

### `@spec-cli/shared` — 共享包

- [x] `types.ts` — 所有 TypeScript 类型定义 (RefIndex, Entry, SpecCliConfig 等)
- [x] `constants.ts` — 常量 (目录结构, ID 前缀, batch 映射等)
- [x] `schemas.ts` — Zod Schema (Entity, RefIndex, Config, FrontMatter)

### `@spec-cli/core` — 核心引擎

- [x] `spec-project.ts` — SpecProject 类 (初始化、读写、索引管理)
- [x] `id-registry.ts` — IdRegistry 类 (ID 注册、引用查询、孤儿/悬空检测)
- [x] `template-engine.ts` — TemplateEngine 类 (Handlebars 渲染、骨架生成)
- [x] `validator.ts` — Validator 类 (结构校验、Front Matter、ID 唯一性、引用完整性)
- [x] `dependency-graph.ts` — DependencyGraph 类 (上下文、引用者、影响分析)
- [x] `diff-tracker.ts` — DiffTracker 类 (变更记录、备份回滚)
- [x] `searcher.ts` — Searcher 类 (全文搜索)

### `@spec-cli/agents` — 专家 Agent

- [x] `agent-base.ts` — Agent 基类 (访谈框架、内容生成接口)
- [x] `pm-agent.ts` — PM Agent (7 阶段结构化访谈、MoSCoW 优先级、EARS 验收标准)
- [x] `architect-agent.ts` — Architect Agent (需求提取、技术选型、数据建模、ADR 生成)

### `spec-cli` — CLI 包

- [x] `index.ts` — Commander.js 主入口
- [x] `commands/init.ts` — 项目初始化 (交互式问答、--template、--bare、--from、--output)
- [x] `commands/generate.ts` — 文档生成 (--batch、--file、--auto、--refine、--agent)
- [x] `commands/validate.ts` — 校验 (--strict、--file、--fix、--json)
- [x] `commands/status.ts` — 状态总览
- [x] `commands/config.ts` — 配置管理 (set、get、list)
- [x] `commands/graph.ts` — 引用查询 (context、search、caller、impact、status、diff)
- [x] `commands/update.ts` — 变更管理 (start、analyze、apply、review、abort)
- [x] `commands/export.ts` — 格式导出 (ai-context、json)

### 模板

- [x] `templates/default/` — 30 个 Spec 骨架 Markdown 文件覆盖全部 7 个类别

### 集成测试

- [x] `spec-cli init --bare` — 30 文件创建验证
- [x] `spec-cli validate` — 0 错误通过
- [x] `spec-cli status` — 状态报告正确
- [x] `spec-cli graph context` — 上下文查询正常
- [x] `spec-cli graph search` — 全文搜索正常
- [x] `spec-cli graph caller` — 引用者查询正常
- [x] `spec-cli config list` — 配置输出正常

---

## 未完成 — 待后续迭代

### 高优先级 (P0-P1)

- [ ] **真实 AI API 集成**
  - [ ] 接入 Vercel AI SDK 对接 OpenAI / Claude API
  - [ ] Agent 访谈流程接入真实 LLM 对话
  - [ ] PM Agent: 追问逻辑、矛盾检测、竞品参考注入、缺失补全
  - [ ] Architect Agent: 从 PRD 内容自动推理架构、生成 OpenAPI 定义
  - [ ] 对话历史保存与恢复

- [ ] **spec-cli init 增强**
  - [ ] `--from <file>` 从已有文档导入项目声明（目前是占位实现）
  - [ ] `--template` 支持更多预设模板 (web-fullstack, mobile-app, cli-tool, api-service)
  - [ ] 非 bare 模式下的 AI 引导对话（产品描述 → 自动推断 project_brief）

- [ ] **spec-cli validate 增强**
  - [ ] `--fix` 自动修复可修复的问题（如双向引用补全）
  - [ ] 术语一致性检查（同一概念在不同文件中名称是否一致）
  - [ ] 版本一致性检查（上下游条目版本是否匹配）
  - [ ] 内容完整性检查（每个文件的必填章节是否非空）
  - [ ] 数据格式验证（JSON/YAML/Mermaid 代码块可解析性）

- [ ] **spec-cli graph 增强**
  - [ ] `graph impact` 生成变更影响分析报告
  - [ ] `graph diff` 展示未提交变更的引用影响
  - [ ] `--depth` 参数控制分析深度
  - [ ] `--json` 格式输出支持

### 中优先级 (P2)

- [ ] **spec-cli update 完整实现**
  - [ ] AI 引导修改（根据影响分析逐级更新下游条目）
  - [ ] 变更 Diff 展示
  - [ ] 真实文件修改与备份
  - [ ] Changelog 自动更新

- [ ] **spec-cli export 增强**
  - [ ] `--format openapi` 从 api_design/ 解析并生成 OpenAPI 3.0 规范
  - [ ] `--format pdf` 渲染全部 Spec 为 PDF
  - [ ] `--format ai-context` 优化压缩（去冗余、精简）

- [ ] **Spec Lens Web 可视化服务**
  - [ ] Express/Fastify Web 服务器搭建
  - [ ] 文档阅读视图（Markdown 渲染 + 结构化数据可视化）
  - [ ] 依赖拓扑图（力导向图展示引用关系）
  - [ ] 用户故事追踪视图（US → API → Entity 完整链路）
  - [ ] 完成度仪表盘
  - [ ] 前端 UI（React/Vue）

### 低优先级 (P3+)

- [ ] **更多预设模板**
  - [ ] `web-fullstack` — 全栈 Web 应用模板
  - [ ] `mobile-app` — 移动应用模板
  - [ ] `cli-tool` — CLI 工具模板
  - [ ] `api-service` — API 服务模板

- [ ] **插件系统**
  - [ ] 自定义校验规则插件化
  - [ ] 自定义模板支持

- [ ] **质量保障工具（六道防线）**
  - [ ] 需求覆盖度检查器
  - [ ] 数据模型一致性校验器
  - [ ] API 契约校验器
  - [ ] 代码规范合规扫描器
  - [ ] 架构分层守卫
  - [ ] UI/UX 视觉审计

- [ ] **协作与 CI/CD 集成**
  - [ ] `spec-cli validate` 作为 CI 检查步骤
  - [ ] GitHub Actions / GitLab CI 模板
  - [ ] PR 中自动展示 Spec 变更影响

- [ ] **npm 包发布**
  - [ ] 配置正确的发布脚本
  - [ ] 发布到 npm registry
  - [ ] `npx spec-cli init` 立即可用

- [ ] **单元测试**
  - [ ] shared 包测试
  - [ ] core 包各模块测试
  - [ ] agents 包测试
  - [ ] CLI 命令 E2E 测试

- [ ] **性能优化**
  - [ ] `spec-cli validate` 在 27 文件项目上 < 3 秒
  - [ ] `spec-cli graph` 查询延迟 < 500ms
  - [ ] 大项目（100+ 文件）性能验证

---

## 已知问题

1. **模板路径解析**: `TemplateEngine.resolveTemplatesDir()` 当前依赖 `SPEC_CLI_TEMPLATES_DIR` 环境变量或 `cwd/templates`。发布为 npm 包后需要改为相对包根路径的查找方式。
2. **CLI 打包后的依赖**: `fs-extra` 需要在 CLI 包中显式声明，标记为 external 避免打包。
3. **空目录不存在**: 模板中 `3_Data_Model/schema/` 目录为空，init 时不会创建。需在 SPEC_DIR_STRUCTURE 中补充分配文件或改用 `.gitkeep`。
