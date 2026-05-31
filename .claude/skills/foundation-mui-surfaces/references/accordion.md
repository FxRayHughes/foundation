# Accordion

可折叠面板组件，用于分组展示大量内容并允许用户按需展开/收起。Foundation 中用于设置页分组、FAQ 列表、可折叠配置区域等场景。

## Import

```tsx
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
```

## 基础用法（Foundation 模式）

```tsx
// SettingsGroup.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const settingsGroupStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      '&:before': { display: 'none' },
      '&.Mui-expanded': { margin: 0 },
    },
    summary: {
      color: fp.text.primary,
      fontWeight: 600,
      '&.Mui-expanded': { minHeight: 48 },
    },
    details: {
      color: fp.text.secondary,
      borderTop: `1px solid ${fp.divider}`,
      pt: 2,
    },
    actions: {
      borderTop: `1px solid ${fp.divider}`,
      px: 3,
      py: 1.5,
    },
  };
};
```

```tsx
// SettingsGroup.tsx
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { settingsGroupStyles } from './SettingsGroup.styles';

export const SettingsGroup = () => {
  const theme = useTheme();
  const styles = settingsGroupStyles(theme);
  const { t } = useT();

  return (
    <Accordion sx={styles.root} elevation={0} disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        aria-controls="general-content"
        id="general-header"
        sx={styles.summary}
      >
        <Typography fontWeight={600}>{t('settings.general.title')}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        <Typography>{t('settings.general.description')}</Typography>
      </AccordionDetails>
    </Accordion>
  );
};
```

## 所有 Variants

### 默认（elevation）

```tsx
<Accordion elevation={0} sx={styles.root}>
  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
    <Typography>{t('section.title')}</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography>{t('section.content')}</Typography>
  </AccordionDetails>
</Accordion>
```

### outlined

```tsx
<Accordion variant="outlined" disableGutters>
  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
    <Typography>{t('section.title')}</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography>{t('section.content')}</Typography>
  </AccordionDetails>
</Accordion>
```

### 禁用状态

```tsx
<Accordion disabled sx={styles.root}>
  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
    <Typography>{t('section.disabled')}</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography>{t('section.disabledContent')}</Typography>
  </AccordionDetails>
</Accordion>
```

### 默认展开

```tsx
<Accordion defaultExpanded sx={styles.root} elevation={0} disableGutters>
  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
    <Typography fontWeight={600}>{t('section.expanded')}</Typography>
  </AccordionSummary>
  <AccordionDetails sx={styles.details}>
    <Typography>{t('section.expandedContent')}</Typography>
  </AccordionDetails>
</Accordion>
```

## 受控 vs 非受控

### 非受控（默认）

每个 Accordion 独立管理自身展开状态：

```tsx
<Accordion defaultExpanded={false} disableGutters>
  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
    <Typography>{t('faq.question1')}</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Typography>{t('faq.answer1')}</Typography>
  </AccordionDetails>
</Accordion>
```

### 受控（手风琴模式 — 同时只展开一个）

```tsx
// FaqList.tsx
import { useState } from 'react';

export const FaqList = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const { t } = useT();
  const theme = useTheme();
  const styles = settingsGroupStyles(theme);

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Accordion
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
        sx={styles.root}
        elevation={0}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography fontWeight={600}>{t('faq.q1')}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={styles.details}>
          <Typography>{t('faq.a1')}</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === 'panel2'}
        onChange={handleChange('panel2')}
        sx={styles.root}
        elevation={0}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography fontWeight={600}>{t('faq.q2')}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={styles.details}>
          <Typography>{t('faq.a2')}</Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
};
```

## 带 Actions 的 Accordion

```tsx
import AccordionActions from '@mui/material/AccordionActions';
import Button from '@mui/material/Button';

<Accordion sx={styles.root} elevation={0} disableGutters>
  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
    <Typography fontWeight={600}>{t('settings.advanced.title')}</Typography>
  </AccordionSummary>
  <AccordionDetails sx={styles.details}>
    <Typography>{t('settings.advanced.warning')}</Typography>
  </AccordionDetails>
  <AccordionActions sx={styles.actions}>
    <Button size="small">{t('actions.cancel')}</Button>
    <Button size="small" variant="contained">{t('actions.apply')}</Button>
  </AccordionActions>
</Accordion>
```

## 带图标和副标题的 Summary

```tsx
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Stack from '@mui/material/Stack';

<AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={styles.summary}>
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
    <SettingsRoundedIcon sx={{ color: theme.palette.foundation.accent }} />
    <Stack>
      <Typography fontWeight={600}>{t('settings.general.title')}</Typography>
      <Typography variant="body2" sx={{ color: theme.palette.foundation.text.muted }}>
        {t('settings.general.subtitle')}
      </Typography>
    </Stack>
  </Stack>
</AccordionSummary>
```

## 多个 Accordion 分组（列表模式）

```tsx
// AccordionGroup.styles.ts
export const accordionGroupStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.surface,
      '&:before': { display: 'none' },
      '&:first-of-type': { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
      '&:last-of-type': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
      '&:not(:last-of-type)': { borderBottom: `1px solid ${fp.divider}` },
    },
    wrapper: {
      border: `1px solid ${fp.divider}`,
      borderRadius: 2,
      overflow: 'hidden',
    },
  };
};
```

## Props 完整参考

### Accordion

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 必须包含 AccordionSummary + AccordionDetails |
| `classes` | `object` | — | 覆盖内部 CSS class |
| `defaultExpanded` | `bool` | `false` | 初始展开状态（非受控） |
| `disabled` | `bool` | `false` | 禁用状态 |
| `disableGutters` | `bool` | `false` | 移除展开时的额外 margin |
| `elevation` | `number` (0-24) | `1` | 阴影深度 |
| `expanded` | `bool` | — | 受控展开状态 |
| `onChange` | `func` | — | `(event, expanded) => void` 展开状态变化回调 |
| `slotProps` | `object` | — | 内部插槽 props（transition 等） |
| `slots` | `object` | — | 内部插槽组件替换 |
| `square` | `bool` | `false` | 移除圆角 |
| `sx` | `SxProps<Theme>` | — | MUI system 样式 |
| `variant` | `'elevation' \| 'outlined'` | `'elevation'` | 外观模式 |

### AccordionSummary

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 标题内容 |
| `classes` | `object` | — | 覆盖内部 CSS class |
| `expandIcon` | `ReactNode` | — | 展开/收起图标（自动旋转） |
| `id` | `string` | — | 用于 aria 关联 |
| `sx` | `SxProps<Theme>` | — | 样式 |

### AccordionDetails

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 展开内容 |
| `classes` | `object` | — | 覆盖内部 CSS class |
| `sx` | `SxProps<Theme>` | — | 样式 |

### AccordionActions

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 操作按钮 |
| `disableSpacing` | `bool` | `false` | 禁用子元素间距 |
| `sx` | `SxProps<Theme>` | — | 样式 |

## 过渡动画自定义

```tsx
import Fade from '@mui/material/Fade';

<Accordion
  sx={styles.root}
  elevation={0}
  disableGutters
  slots={{ transition: Fade }}
  slotProps={{ transition: { timeout: 400 } }}
>
  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
    <Typography>{t('section.animated')}</Typography>
  </AccordionSummary>
  <AccordionDetails sx={styles.details}>
    <Typography>{t('section.animatedContent')}</Typography>
  </AccordionDetails>
</Accordion>
```

## 无障碍 (a11y)

- `AccordionSummary` 自动渲染为 `<button>`，键盘可聚焦（Tab）、可触发（Enter/Space）。
- 使用 `id` + `aria-controls` 关联 summary 与 details：

```tsx
<AccordionSummary
  id="section1-header"
  aria-controls="section1-content"
  expandIcon={<ExpandMoreRoundedIcon />}
>
  <Typography>{t('section.title')}</Typography>
</AccordionSummary>
```

- 展开图标自动获得 `aria-expanded` 状态。
- 禁用状态自动设置 `aria-disabled="true"`。

## Foundation 约束

| 约束 | 说明 |
|------|------|
| ⚠️ 必须 `disableGutters` | 避免展开时产生额外 margin，保持紧凑布局 |
| ⚠️ 必须 `elevation={0}` | 配合 border 使用，不用阴影表达层级 |
| ⚠️ 移除默认分隔线 | 在 sx 中设置 `'&:before': { display: 'none' }` |
| ⚠️ 展开图标 | 统一使用 `ExpandMoreRoundedIcon`（*Rounded 系列） |
| 背景色 | 使用 `fp.bg.surface`，不用默认 Paper 背景 |
| 分隔线 | 使用 `fp.divider` 作为 borderTop/borderBottom 色值 |
| 禁止 | 硬编码 hex、使用非 Rounded 图标、省略 aria-controls |
