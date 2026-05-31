# Paper

MUI 最基础的容器表面组件，为内容提供背景色、阴影（elevation）或边框（outlined）。Foundation 中所有卡片、面板的底层都是 Paper。

## Import

```tsx
import Paper from '@mui/material/Paper';
```

## 基础用法（Foundation 模式）

```tsx
// InfoPanel.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const infoPanelStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      p: 3,
      // borderRadius 由主题统一为 8，无需手动设置
    },
    title: { color: fp.text.primary, fontWeight: 600, mb: 1 },
    body: { color: fp.text.secondary },
  };
};
```

```tsx
// InfoPanel.tsx
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { infoPanelStyles } from './InfoPanel.styles';

export const InfoPanel = () => {
  const theme = useTheme();
  const styles = infoPanelStyles(theme);
  const { t } = useT();

  return (
    <Paper sx={styles.root} elevation={0}>
      <Typography sx={styles.title}>{t('panel.title')}</Typography>
      <Typography sx={styles.body}>{t('panel.description')}</Typography>
    </Paper>
  );
};
```

## 所有 Variants

### elevation（默认）

通过 `elevation` prop 控制阴影深度（0-24）。Foundation 中推荐 `elevation={0}` 配合 border 使用。

```tsx
<Paper elevation={0} sx={styles.root}>{/* 无阴影，靠 border 区分层级 */}</Paper>
<Paper elevation={1} sx={styles.root}>{/* 轻微阴影 */}</Paper>
<Paper elevation={3} sx={styles.root}>{/* 中等阴影 */}</Paper>
```

### outlined

无阴影，使用 1px 边框。Foundation 推荐模式。

```tsx
<Paper variant="outlined" sx={styles.root}>
  {/* 自动 elevation=0 + 1px border */}
</Paper>
```

### square

移除圆角（`borderRadius: 0`）。Foundation 中**不推荐**，因为方圆设计语言要求容器保持 8px 圆角。

```tsx
{/* ⚠️ 仅在全宽横幅等特殊场景使用 */}
<Paper square elevation={0} sx={styles.banner}>
  ...
</Paper>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 内容 |
| `classes` | `object` | — | 覆盖内部 CSS class |
| `component` | `elementType` | `'div'` | 根元素类型 |
| `elevation` | `number` (0-24) | `1` | 阴影深度（variant="elevation" 时生效） |
| `square` | `bool` | `false` | `true` 时移除圆角 |
| `sx` | `SxProps<Theme>` | — | MUI system 样式 |
| `variant` | `'elevation' \| 'outlined'` | `'elevation'` | 外观模式 |

## 无障碍 (a11y)

- Paper 本身是纯展示容器，无语义角色。
- 如果 Paper 用作交互区域，需要添加 `role` 和键盘事件：

```tsx
<Paper
  role="region"
  aria-label={t('panel.ariaLabel')}
  tabIndex={0}
  sx={styles.root}
>
  ...
</Paper>
```

- 如果 Paper 包含一组相关内容，使用 `component="section"`：

```tsx
<Paper component="section" aria-labelledby="section-title" sx={styles.root} elevation={0}>
  <Typography id="section-title" variant="h6" sx={styles.title}>
    {t('section.heading')}
  </Typography>
  <Typography sx={styles.body}>{t('section.content')}</Typography>
</Paper>
```

- 避免在 Paper 上使用 `onClick` 而不提供键盘等效操作。如需可点击容器，优先使用 `CardActionArea` 或 `ButtonBase`。

## 常见组合模式

### 内嵌面板（嵌套 Paper）

```tsx
// NestedPanel.styles.ts
export const nestedPanelStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    outer: {
      backgroundColor: fp.bg.content,
      border: `1px solid ${fp.divider}`,
      p: 3,
    },
    inner: {
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      p: 2,
      mt: 2,
    },
  };
};
```

```tsx
<Paper sx={styles.outer} elevation={0}>
  <Typography sx={styles.title}>{t('panel.outer')}</Typography>
  <Paper sx={styles.inner} elevation={0}>
    <Typography>{t('panel.inner')}</Typography>
  </Paper>
</Paper>
```

### 全宽横幅（square 模式）

```tsx
// Banner.styles.ts
export const bannerStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.elevated,
      borderBottom: `1px solid ${fp.divider}`,
      px: 3,
      py: 2,
    },
  };
};
```

```tsx
{/* 仅在全宽横幅场景使用 square */}
<Paper square elevation={0} sx={styles.root}>
  <Typography>{t('banner.message')}</Typography>
</Paper>
```

### 作为表单容器

```tsx
// FormContainer.styles.ts
export const formContainerStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
  };
};
```

```tsx
<Paper component="form" sx={styles.root} elevation={0} onSubmit={handleSubmit}>
  <TextField label={t('form.name')} />
  <TextField label={t('form.email')} />
  <Button type="submit" variant="contained">{t('form.submit')}</Button>
</Paper>
```

## Elevation 与 Foundation 设计语言

Foundation 使用 border 而非 shadow 表达层级关系：

| 层级 | elevation | 背景色 | 用途 |
|------|-----------|--------|------|
| 基底 | — | `fp.bg.base` | 页面最底层 |
| 内容区 | 0 | `fp.bg.content` | 主内容区域 |
| 表面 | 0 | `fp.bg.surface` | 卡片、面板 |
| 浮起 | 0-1 | `fp.bg.elevated` | 工具栏、弹出层 |
| 悬浮 | 0 | `fp.bg.hover` | 鼠标悬停状态 |

所有层级通过 `border: 1px solid ${fp.divider}` 区分，而非 elevation 阴影。

## Foundation 约束

| 约束 | 说明 |
|------|------|
| 推荐模式 | `elevation={0}` + border（通过 styles.ts 设置 `border: 1px solid ${fp.divider}`） |
| 背景色 | 使用 `fp.bg.surface`，不用 MUI 默认的 `theme.palette.background.paper` |
| 圆角 | 主题已统一 8px，不要在 sx 中覆盖 `borderRadius` |
| 禁止 | 硬编码 `boxShadow`、硬编码 hex 色值 |
