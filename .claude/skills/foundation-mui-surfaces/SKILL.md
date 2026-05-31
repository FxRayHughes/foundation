---
name: foundation-mui-surfaces
description: MUI 9 容器表面类组件在 Foundation 项目中的详尽用法。当使用 Accordion/AppBar/Card/Paper 时参考。
---

# Foundation x MUI 9 — 容器表面类组件

## 何时使用本 SKILL

- 需要使用 Paper / Card / Accordion / AppBar 等**承载内容的容器**时
- 需要了解各容器的 variant、elevation、受控模式等 API 细节时
- 需要确认 Foundation 项目中容器组件的样式约束时
- 设置页需要分区卡片（Card）时
- 需要可折叠内容区域（Accordion）时
- 页面内需要工具栏（AppBar + Toolbar）时

## Foundation 铁律速查

| # | 规则 | 要点 |
|---|------|------|
| 1 | 配色 | 只从 `theme.palette.foundation.*` 取值，禁止硬编码 hex |
| 2 | 圆角 | Paper/Card 容器 `borderRadius: 8`（主题已统一，勿覆盖） |
| 3 | 图标 | 只用 `@mui/icons-material` 的 `*Rounded` 系列 |
| 4 | i18n | 所有人类可见文字走 `t('key')` |
| 5 | 样式 | 写在 `<Name>.styles.ts` 工厂函数 `(theme: Theme) => Record<string, SxProps<Theme>>` |
| 6 | 对话框 | 简单确认走 NativeDialogs；MUI Dialog 仅用于复杂表单/多步向导 |
| 7 | 调用链 | View -> ViewModel hook -> services/ -> @bindings/ |

## 组件层级关系

```
Paper (基础表面)
├── Card (继承自 Paper，带结构化内容区域)
├── Accordion (继承自 Paper，可折叠面板)
└── AppBar (继承自 Paper，固定/粘性工具栏)
```

## References 索引

| 文件 | 覆盖组件 | 典型场景 |
|------|----------|----------|
| [paper.md](references/paper.md) | Paper | 所有表面容器的基础，内容区域背景 |
| [card.md](references/card.md) | Card / CardHeader / CardContent / CardActions / CardMedia / CardActionArea | 设置页 section、信息展示卡片 |
| [accordion.md](references/accordion.md) | Accordion / AccordionSummary / AccordionDetails / AccordionActions | 可折叠设置组、FAQ、分组内容 |
| [app-bar.md](references/app-bar.md) | AppBar / Toolbar | 页面内工具栏（本项目有自绘 TitleBar，AppBar 不常用） |

## styles.ts 范本

```tsx
import type { SxProps, Theme } from '@mui/material';

export const surfaceStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    card: {
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      // borderRadius 由主题统一为 8，无需手动设置
    },
    cardTitle: { color: fp.text.primary, fontWeight: 600 },
    cardSubtitle: { color: fp.text.secondary },
  };
};
```
