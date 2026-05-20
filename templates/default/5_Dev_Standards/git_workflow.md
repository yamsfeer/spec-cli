---
id: GW-001
type: git_workflow
title: Git 工作流
status: draft
version: 1
tags: []
dependencies: []
---

# Git 工作流

## 分支策略

采用 **GitHub Flow**（简化版 Git Flow）：

```
main ─────●──────────●──────────●───────
           \         /          /
            ●──●──●─●          /
             feature-A         /
                               ●──●─●
                                fix-B
```

| 分支 | 用途 | 说明 |
|------|------|------|
| `main` | 生产分支 | 永远可部署，通过 PR 合并 |
| `develop` | 开发分支（可选） | 大型项目使用，小项目可直接跳过 |
| `feature/*` | 功能分支 | 从 main 拉出，合并回 main |
| `fix/*` | 修复分支 | 从 main 拉出，合并回 main |
| `hotfix/*` | 热修复分支 | 从 main 拉出，紧急修复后合并回 main |
| `release/*` | 发布分支 | 发布前冻结，只修 Bug |

## 提交信息规范 (Conventional Commits)

```
<type>(<scope>): <subject>

[body]

[footer]
```

**Type（类型）：**

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更改 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构（不是新功能或修复） |
| `perf` | 性能优化 |
| `test` | 添加测试 |
| `chore` | 构建过程或辅助工具变更 |
| `ci` | CI 配置变更 |

**示例：**

```
feat(auth): 添加手机号登录方式

支持使用手机号和验证码登录，兼容原有邮箱登录。

Closes #123
```

## Code Review 流程

1. **创建 PR** — 开发者完成功能后创建 Pull Request
2. **自动检查** — CI 运行 Lint + Test + Build
3. **Code Review** — 至少 1 位团队成员审查
   - 代码质量、可读性、命名
   - 是否遵循项目规范
   - 是否有安全风险
   - 是否有足够的测试覆盖
4. **修改** — 根据审查意见修改代码
5. **审批** — 审查者 Approve
6. **合并** — 使用 Squash Merge（推荐）或 Rebase Merge

## 发布流程

1. 从 `main` 创建 `release/vX.Y.Z` 分支
2. 更新版本号 (`package.json`, CHANGELOG)
3. 执行回归测试
4. 合并到 `main`，打 Tag `vX.Y.Z`
5. 部署到生产环境
6. 如果出现问题，创建 `hotfix/*` 分支修复

## 禁止事项

- ❌ 直接 push 到 `main` 分支
- ❌ Force push 到共享分支
- ❌ 提交包含密码/密钥/Token
- ❌ 提交 `node_modules` 或构建产物
- ❌ 提交中的 TODO 没有关联 Issue
