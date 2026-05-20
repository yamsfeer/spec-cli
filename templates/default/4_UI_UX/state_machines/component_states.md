---
id: CSF-001
type: component_state_flow
title: 组件状态机
status: draft
version: 1
tags: []
dependencies:
  - CS-001
  - PF-AUTH-001
---

# 组件状态机

## LoginForm 登录表单状态机

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> editing: 用户开始输入
    editing --> validating: 点击登录
    validating --> idle: 校验失败(显示错误)
    validating --> submitting: 校验通过
    submitting --> success: 登录成功
    submitting --> error: 登录失败
    error --> editing: 修改后重试
    success --> [*]: 跳转
```

**状态说明：**

| 状态 | 描述 | UI 表现 |
|------|------|--------|
| `idle` | 初始空白状态 | 表单空白，按钮可用 |
| `editing` | 用户正在输入 | 显示输入内容，按钮可用 |
| `validating` | 前端校验中 | 显示错误提示（如有） |
| `submitting` | 请求中 | 按钮显示 loading，禁用输入 |
| `success` | 登录成功 | 短暂提示后跳转 |
| `error` | 登录失败 | 显示服务端错误信息 |

---

## Button 按钮状态机

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> hover: 鼠标移入
    hover --> active: 鼠标按下
    active --> idle: 鼠标松开
    idle --> loading: 开始异步操作
    loading --> idle: 操作完成
    loading --> disabled: 不可再操作
    idle --> disabled: 权限/条件不满足
    disabled --> idle: 条件满足
```

---

## Modal 弹窗状态机

```mermaid
stateDiagram-v2
    [*] --> closed
    closed --> opening: open = true
    opening --> open: 动画完成
    open --> closing: 点击关闭/遮罩/ESC
    closing --> closed: 动画完成
```

---

## Form 表单状态机

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> dirty: 用户修改任意字段
    dirty --> validating: 触发校验(blur/submit)
    validating --> invalid: 有校验错误
    validating --> valid: 校验通过
    invalid --> dirty: 用户继续修改
    valid --> submitting: 提交表单
    submitting --> submitted: 提交成功
    submitting --> error: 提交失败
    error --> valid: 用户重试
    submitted --> [*]
```
