---
name: foundation-mui-layout
description: MUI 9 布局类组件在 Foundation 项目中的详尽用法。当使用 Box/Container/Grid/Stack/ImageList 时参考。
---

# Foundation MUI 布局组件 SKILL

## 概述

本 SKILL 覆盖 Foundation 项目中 MUI 9 布局类组件的用法规范。布局组件负责页面结构编排、元素排列与响应式适配。

## 覆盖组件

| 组件 | 用途 | Foundation 使用频率 |
|------|------|---------------------|
| **Box** | 万能容器，Foundation 最常用的布局原语 | 极高 |
| **Stack** | 一维排列（垂直/水平），带间距 | 高 |
| **Grid** (v2) | 二维网格布局（CSS Grid，非旧版 12 列 flexbox） | 中 |
| **Container** | 限制最大宽度的居中容器 | 低（桌面应用少用） |
| **ImageList** | 图片网格展示（标准/瀑布/交错） | 按需 |

## Foundation 铁律

1. **配色**：只从 `theme.palette.foundation.*` 取值，禁止硬编码十六进制
2. **圆角**：按钮/IconButton `borderRadius: 6`，Paper/Card/容器 `borderRadius: 8`（主题已统一，勿在 sx 覆盖）
3. **图标**：只用 `@mui/icons-material` 的 `*Rounded` 系列，禁 emoji/Unicode/第三方 icon 包
4. **i18n**：所有人类可见文案走 `t('key')`——包括 label/placeholder/helperText/aria-label/Tooltip title
5. **样式**：统一使用 `<Name>.styles.ts` 工厂函数模式
6. **对话框**：简单确认/警告/错误走 NativeDialogs；MUI Dialog 仅用于复杂表单/多步向导
7. **调用链**：View → ViewModel hook → services/ → @bindings/。View 和 VM 都不直接 import @bindings/*
8. **路由**：用 `useRouter().navigate(id)`，不用 react-router
9. **Box 是万能容器**：Foundation 项目大量使用 `Box` + `sx` 做布局，这是推荐方式

## styles.ts 工厂函数模式

Foundation 项目所有样式统一采用工厂函数模式，接收 `Theme` 返回样式对象：

```typescript
import type { SxProps, Theme } from '@mui/material';

export const myPageStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fp.bg.content,
    },
    card: {
      p: 3,
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      borderRadius: 1,
    },
  };
};
```

使用方式：

```tsx
import { Box, useTheme } from '@mui/material';
import { myPageStyles } from './MyPage.styles';
import { useT } from '@/i18n';

const MyPage = () => {
  const theme = useTheme();
  const styles = myPageStyles(theme);
  const { t } = useT();
  return <Box sx={styles.root}>...</Box>;
};
```

## Foundation 调色板语义槽位速查

```typescript
theme.palette.foundation.bg.base       // 标题栏/最外层
theme.palette.foundation.bg.sidebar    // 侧边栏
theme.palette.foundation.bg.content    // 主内容区（页面默认背景）
theme.palette.foundation.bg.surface    // 卡片/Paper 表面
theme.palette.foundation.bg.elevated   // 输入框/提升层
theme.palette.foundation.bg.hover      // hover 覆盖
theme.palette.foundation.bg.active     // active/selected 覆盖
theme.palette.foundation.text.primary  // 主文本
theme.palette.foundation.text.secondary // 次文本
theme.palette.foundation.text.muted    // 弱化文本
theme.palette.foundation.divider       // 分割线
theme.palette.foundation.accent        // 强调色
theme.palette.foundation.accentHover   // 强调色 hover
theme.palette.foundation.status.danger // 错误/危险
theme.palette.foundation.status.success // 成功
theme.palette.foundation.status.warning // 警告
```

## 参考文档索引

| 组件 | 文件 | 说明 |
|------|------|------|
| Box | [references/box.md](./references/box.md) | 万能容器，Foundation 最常用 |
| Container | [references/container.md](./references/container.md) | 限制最大宽度居中容器 |
| Grid (v2) | [references/grid.md](./references/grid.md) | CSS Grid 二维响应式布局 |
| Stack | [references/stack.md](./references/stack.md) | 一维垂直/水平排列 |
| ImageList | [references/image-list.md](./references/image-list.md) | 图片网格/瀑布流/编织 |

## 组件选型决策树

```
需要布局？
├── 简单包裹/自由定位 → Box（万能容器）
├── 一维排列（垂直或水平） → Stack
├── 二维网格 → Grid (v2, CSS Grid)
├── 限制最大宽度居中 → Container（桌面应用少用）
└── 图片网格展示 → ImageList
```

## 注意事项

- **桌面应用特殊性**：Foundation 是 Wails 桌面应用，窗口尺寸由用户控制但通常比浏览器窗口小。Container 的 `maxWidth` 断点在桌面应用中意义有限，大多数场景用 Box 即可。
- **Grid v2 是 MUI 9 默认**：不再需要 `import Grid2`，直接 `import Grid from '@mui/material/Grid'` 即为 v2 版本（基于 CSS Grid）。
- **Stack vs Box with flex**：单行/单列排列优先 Stack（语义更清晰），复杂嵌套用 Box。
- **响应式**：所有布局组件的 sx prop 支持断点对象 `{ xs: ..., sm: ..., md: ..., lg: ..., xl: ... }`。
