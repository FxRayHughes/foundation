---
name: foundation-mui-data-display
description: MUI 9 数据展示类组件在 Foundation 项目中的详尽用法。当使用 Typography/Avatar/Badge/Chip/Divider/List/Table/Tooltip 时参考。
---

# MUI 9 数据展示组件 — Foundation 用法指南

## 何时使用本 Skill

- 需要展示文本内容（标题、正文、标签）→ Typography
- 需要展示用户头像或头像组 → Avatar / AvatarGroup
- 需要在图标/头像上叠加数字或状态点 → Badge
- 需要展示标签、筛选条件、可删除项 → Chip
- 需要分隔内容区域 → Divider
- 需要展示导航列表、菜单列表（Sidebar 核心）→ List
- 需要展示简单表格数据 → Table（复杂数据用 DataGrid）
- 需要鼠标悬停提示 → Tooltip
- 需要展示 Material 图标 → Icon / SvgIcon

## Foundation 铁律摘要

| # | 规则 | 要点 |
|---|------|------|
| 1 | 配色 | 只从 `theme.palette.foundation.*` 取值，禁止硬编码 hex |
| 2 | 圆角 | 按钮 6px / 容器 8px，已由主题统一 |
| 3 | 图标 | 只用 `@mui/icons-material` 的 `*Rounded` 系列 |
| 4 | i18n | 所有人类可见字符串走 `t('key')` |
| 5 | 样式工厂 | 写在 `<Name>.styles.ts`，使用 `(theme: Theme) => Record<string, SxProps<Theme>>` |
| 6 | 对话框 | 简单确认走 NativeDialogs；MUI Dialog 仅用于复杂表单 |
| 7 | 调用链 | View → ViewModel → services/ → @bindings/ |
| 8 | 路由 | 用 `useRouter().navigate(id)`，不用 react-router |

## References 索引

| 文件 | 覆盖组件 | 说明 |
|------|----------|------|
| [typography.md](./references/typography.md) | Typography | 文本排版，variant 映射 |
| [avatar.md](./references/avatar.md) | Avatar, AvatarGroup | 用户头像、头像组 |
| [badge.md](./references/badge.md) | Badge | 徽章/角标 |
| [chip.md](./references/chip.md) | Chip | 标签/筛选条件 |
| [divider.md](./references/divider.md) | Divider | 分隔线 |
| [list.md](./references/list.md) | List 全家族 | 列表（Sidebar 基础） |
| [table.md](./references/table.md) | Table 全家族 | 简单表格 |
| [tooltip.md](./references/tooltip.md) | Tooltip, Icon, SvgIcon | 悬停提示与图标 |
