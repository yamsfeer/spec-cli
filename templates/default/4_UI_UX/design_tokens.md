---
id: DT-001
type: design_token
title: Design Tokens
status: draft
version: 1
tags: []
dependencies: []
---

# Design Tokens

## 颜色 (Colors)

### 主色调

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary-50` | `#EFF6FF` | 主色最浅 |
| `--color-primary-100` | `#DBEAFE` | 浅色背景 |
| `--color-primary-500` | `#3B82F6` | 主色基准 (Blue-500) |
| `--color-primary-600` | `#2563EB` | 主色悬停 |
| `--color-primary-700` | `#1D4ED8` | 主色按下 |

### 中性色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-gray-50` | `#F9FAFB` | 页面背景 |
| `--color-gray-100` | `#F3F4F6` | 卡片背景 |
| `--color-gray-200` | `#E5E7EB` | 边框 |
| `--color-gray-500` | `#6B7280` | 辅助文字 |
| `--color-gray-700` | `#374151` | 次要标题 |
| `--color-gray-900` | `#111827` | 正文标题 |

### 语义色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-success` | `#10B981` | 成功状态 |
| `--color-warning` | `#F59E0B` | 警告状态 |
| `--color-error` | `#EF4444` | 错误状态 |
| `--color-info` | `#3B82F6` | 信息提示 |

## 字体 (Typography)

| Token | 字体 | 字号 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|------|
| `--font-sans` | Inter, system-ui | — | — | — | 默认字体 |
| `--font-mono` | JetBrains Mono | — | — | — | 代码字体 |
| `--text-xs` | — | 12px | 16px | 400 | 辅助文字 |
| `--text-sm` | — | 14px | 20px | 400 | 正文小号 |
| `--text-base` | — | 16px | 24px | 400 | 正文 |
| `--text-lg` | — | 18px | 28px | 500 | 大号正文 |
| `--text-xl` | — | 20px | 28px | 600 | 小标题 |
| `--text-2xl` | — | 24px | 32px | 700 | 标题 |
| `--text-3xl` | — | 30px | 36px | 700 | 大标题 |

## 间距 (Spacing)

| Token | 值 | 用途 |
|-------|-----|------|
| `--spacing-1` | 4px | 极小间距 |
| `--spacing-2` | 8px | 小间距 |
| `--spacing-3` | 12px | 组件内间距 |
| `--spacing-4` | 16px | 标准间距 |
| `--spacing-6` | 24px | 区块间距 |
| `--spacing-8` | 32px | 大区间距 |
| `--spacing-12` | 48px | 页面边距 |

## 圆角 (Border Radius)

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 4px | 小元素 |
| `--radius-md` | 8px | 按钮、输入框 |
| `--radius-lg` | 12px | 卡片 |
| `--radius-full` | 9999px | 圆角（头像、标签） |

## 阴影 (Shadows)

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 微阴影 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | 卡片阴影 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | 弹窗阴影 |
