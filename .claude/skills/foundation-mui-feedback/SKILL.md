---
name: foundation-mui-feedback
description: MUI 9 反馈类组件在 Foundation 项目中的详尽用法。当使用 Alert/Dialog/Progress/Skeleton/Snackbar/Backdrop 时参考。
---

# MUI 9 反馈类组件 — Foundation 用法指南

## 何时使用本 Skill

- 需要向用户展示操作结果反馈（成功/警告/错误/信息）
- 需要弹出对话框收集输入或确认操作
- 需要展示加载状态（进度条/骨架屏/遮罩）
- 需要展示临时通知消息（Snackbar）

## Foundation 铁律摘要

| 规则 | 要求 |
|------|------|
| 配色 | 只从 `theme.palette.foundation.*` 取值，禁止硬编码 hex |
| 圆角 | 按钮 6px，容器 8px（主题已统一） |
| 图标 | 只用 `@mui/icons-material` 的 `*Rounded` 系列 |
| i18n | 所有人类可见字符串走 `t('key')` |
| 样式 | 写在 `<Name>.styles.ts`，使用工厂函数 |
| 对话框 | 简单确认/警告/错误 → NativeDialogs；复杂表单/向导 → MUI Dialog |
| 调用链 | View → ViewModel → services/ → @bindings/ |
| 骨架屏 | 页面级骨架用项目自有 `src/components/Skeleton/` |

## ⚠️ Dialog 场景分界（最重要）

```
简单确认 "确定要删除吗？"        → NativeDialogs.confirm(...)
错误提示 "操作失败"              → NativeDialogs.error(...)
警告提示 "数据将丢失"            → NativeDialogs.warning(...)
信息提示 "操作完成"              → NativeDialogs.info(...)

复杂表单（多字段输入）            → MUI Dialog
多步向导（步骤切换）              → MUI Dialog
内容预览（富文本/图片/代码）      → MUI Dialog
自定义 UI（进度/列表/树形选择）   → MUI Dialog
```

## References 索引

| 文件 | 覆盖组件 | 场景 |
|------|----------|------|
| [alert.md](references/alert.md) | Alert, AlertTitle | 内联反馈提示 |
| [backdrop.md](references/backdrop.md) | Backdrop | 全屏遮罩 + 加载 |
| [dialog.md](references/dialog.md) | Dialog, DialogTitle, DialogContent, DialogActions | 复杂对话框 |
| [progress.md](references/progress.md) | CircularProgress, LinearProgress | 加载进度 |
| [skeleton.md](references/skeleton.md) | Skeleton | 占位骨架 |
| [snackbar.md](references/snackbar.md) | Snackbar, SnackbarContent | 临时通知 |
