---
id: CS-001
type: component_spec
title: 组件库
status: draft
version: 1
tags: []
dependencies:
  - DT-001
---

# 组件库

## 基础组件

### Button 按钮

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' | 'primary' | 按钮样式变体 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 按钮尺寸 |
| disabled | boolean | false | 禁用状态 |
| loading | boolean | false | 加载中状态 |
| onClick | () => void | — | 点击回调 |

**状态**：`idle` → `hover` → `active` / `loading` / `disabled`

---

### Input 输入框

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | 'text' \| 'password' \| 'email' \| 'number' | 'text' | 输入类型 |
| placeholder | string | '' | 占位文本 |
| value | string | '' | 受控值 |
| error | string | '' | 错误提示信息 |
| disabled | boolean | false | 禁用状态 |

**状态**：`idle` → `focus` → `filled` / `error` / `disabled`

---

### Modal 弹窗

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | boolean | false | 是否显示 |
| title | string | '' | 弹窗标题 |
| onClose | () => void | — | 关闭回调 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 弹窗尺寸 |

---

### Table 表格

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | Column[] | [] | 列定义 |
| dataSource | T[] | [] | 数据源 |
| loading | boolean | false | 加载状态 |
| pagination | PaginationConfig | — | 分页配置 |
| emptyText | string | '暂无数据' | 空状态文案 |

---

### Form 表单

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| onSubmit | (values) => void | — | 提交回调 |
| initialValues | Record<string, any> | {} | 初始值 |
| validateOn | 'submit' \| 'blur' \| 'change' | 'submit' | 校验时机 |

---

## 复合组件

### LoginForm 登录表单

组合 `Form` + `Input` + `Button`，包含邮箱、密码、记住我、忘记密码链接。

### RegisterForm 注册表单

组合 `Form` + `Input` + `Button`，包含邮箱、密码、确认密码、昵称。

---

## 布局组件

| 组件 | 说明 |
|------|------|
| Header | 顶部导航栏（Logo + 导航 + 用户头像下拉） |
| Sidebar | 侧边菜单栏（可折叠） |
| Footer | 页脚（版权信息 + 链接） |
| Container | 内容区域容器（最大宽度 1200px） |
