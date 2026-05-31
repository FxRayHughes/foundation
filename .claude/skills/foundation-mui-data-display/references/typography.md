# Typography

## Import

```tsx
import Typography from '@mui/material/Typography';
// 或
import { Typography } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useT } from '@/i18n';
import { typographyStyles } from './MyComponent.styles';

function MyComponent() {
  const theme = useTheme();
  const t = useT();
  const styles = typographyStyles(theme);

  return (
    <Typography sx={styles.title} variant="h5" component="h1">
      {t('page.title')}
    </Typography>
  );
}
```

样式工厂示例：

```tsx
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const typographyStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    title: {
      color: fp.text.primary,
      fontWeight: 600,
    },
    subtitle: {
      color: fp.text.secondary,
      mt: 0.5,
    },
    muted: {
      color: fp.text.muted,
      fontSize: '0.75rem',
    },
  };
};
```

## 所有 Variants

Typography 提供 13 个语义化 variant，映射到不同 HTML 元素：

```tsx
{/* 标题系列 */}
<Typography variant="h1">h1 — 最大标题</Typography>
<Typography variant="h2">h2</Typography>
<Typography variant="h3">h3</Typography>
<Typography variant="h4">h4</Typography>
<Typography variant="h5">h5 — 页面标题常用</Typography>
<Typography variant="h6">h6 — 区块标题常用</Typography>

{/* 副标题 */}
<Typography variant="subtitle1">subtitle1 — 较大副标题</Typography>
<Typography variant="subtitle2">subtitle2 — 较小副标题</Typography>

{/* 正文 */}
<Typography variant="body1">body1 — 默认正文（16px）</Typography>
<Typography variant="body2">body2 — 较小正文（14px）</Typography>

{/* 辅助文本 */}
<Typography variant="caption">caption — 注释/辅助说明</Typography>
<Typography variant="overline">overline — 全大写标签</Typography>
```

### Variant 与默认 HTML 元素映射

| variant | 默认元素 | 典型场景 |
|---------|----------|----------|
| h1 | `<h1>` | 极少使用，仅落地页大标题 |
| h2 | `<h2>` | 一级页面标题 |
| h3 | `<h3>` | 二级区块标题 |
| h4 | `<h4>` | 卡片标题 |
| h5 | `<h5>` | Foundation 页面标题常用 |
| h6 | `<h6>` | Foundation 区块标题常用 |
| subtitle1 | `<h6>` | 列表项主文本 |
| subtitle2 | `<h6>` | 列表项次文本 |
| body1 | `<p>` | 默认正文 |
| body2 | `<p>` | 辅助正文 |
| caption | `<span>` | 时间戳、注释 |
| overline | `<span>` | 分类标签 |

## component 属性（语义覆盖）

当 variant 的视觉效果与语义不匹配时，用 `component` 覆盖渲染元素：

```tsx
{/* 视觉上是 h5，语义上是 h1（页面唯一主标题） */}
<Typography variant="h5" component="h1">
  {t('home.title')}
</Typography>

{/* 视觉上是 body1，渲染为 span（内联使用） */}
<Typography variant="body1" component="span">
  {t('inline.text')}
</Typography>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'h1'\|'h2'\|'h3'\|'h4'\|'h5'\|'h6'\|'subtitle1'\|'subtitle2'\|'body1'\|'body2'\|'caption'\|'overline'\|'inherit'` | `'body1'` | 排版变体 |
| component | `ElementType` | 由 variant 决定 | 渲染的 HTML 元素 |
| align | `'inherit'\|'left'\|'center'\|'right'\|'justify'` | `'inherit'` | 文本对齐 |
| color | `string` | — | 文本颜色（Foundation 中用 sx 取 fp.text.*） |
| gutterBottom | `boolean` | `false` | 底部添加 margin |
| noWrap | `boolean` | `false` | 单行截断（text-overflow: ellipsis） |
| paragraph | `boolean` | `false` | 渲染为 `<p>` 并添加底部 margin |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 文本截断

```tsx
{/* 单行截断 */}
<Typography noWrap sx={styles.ellipsis}>
  {t('long.text.key')}
</Typography>

{/* 多行截断（CSS line-clamp） */}
<Typography sx={styles.lineClamp}>
  {t('description')}
</Typography>
```

样式工厂：

```tsx
export const textStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    ellipsis: {
      color: fp.text.primary,
      maxWidth: 200,
    },
    lineClamp: {
      color: fp.text.secondary,
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
  };
};
```

## 颜色用法

在 Foundation 中，**禁止**使用 `color="primary"` 等 MUI 内置颜色 prop。
始终通过 sx 从 `theme.palette.foundation` 取色：

```tsx
<Typography sx={{ color: theme.palette.foundation.text.primary }}>
  {t('main.text')}
</Typography>
<Typography sx={{ color: theme.palette.foundation.text.secondary }}>
  {t('secondary.text')}
</Typography>
<Typography sx={{ color: theme.palette.foundation.text.muted }}>
  {t('muted.text')}
</Typography>
<Typography sx={{ color: theme.palette.foundation.accent }}>
  {t('accent.text')}
</Typography>
```

## 无障碍 (a11y)

- 使用语义化 variant（h1-h6 保持文档层级）
- 页面只有一个 `<h1>`（用 `component="h1"` 指定）
- 标题层级不跳级（h2 后不直接用 h4）
- 对装饰性文本添加 `aria-hidden="true"`
- 确保文本与背景对比度 ≥ 4.5:1（WCAG AA）

## Foundation 约束

⚠️ **禁止**使用 `color` prop 的预设值（如 `color="primary"`），必须通过 sx 从 `theme.palette.foundation.*` 取色。

⚠️ **禁止**硬编码字体大小，依赖 variant 的主题定义。如需微调，在 `theme.typography` 中统一修改。

⚠️ 所有文本内容必须走 `t('key')` 国际化，包括 `aria-label`。

⚠️ Typography 的 `variant` 选择应基于语义而非视觉，视觉调整用 `component` + `sx`。
