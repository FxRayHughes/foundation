# Button

MUI 9 中 Button 是最常用的交互组件。Foundation 项目中 `LoadingButton` 已合并到 Button（通过 `loading` prop），无需额外安装 `@mui/lab`。

## Import

```tsx
// 推荐：named import
import { Button, IconButton, ButtonGroup } from '@mui/material';

// 图标（只用 *Rounded 系列）
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
```

## 基础用法（Foundation 模式）

```tsx
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { buttonStyles } from './MyComponent.styles';

function MyComponent() {
  const theme = useTheme();
  const t = useT();
  const styles = buttonStyles(theme);

  return (
    <Button
      variant="contained"
      sx={styles.primary}
      onClick={handleClick}
    >
      {t('actions.save')}
    </Button>
  );
}
```

```tsx
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const buttonStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    primary: {
      backgroundColor: fp.accent,
      color: fp.text.primary,
      '&:hover': { backgroundColor: fp.accentHover },
    },
    danger: {
      backgroundColor: fp.status.danger,
      color: fp.text.primary,
    },
  };
};
```

## 所有 Variants

### contained（默认填充按钮）

```tsx
<Button variant="contained">{t('actions.confirm')}</Button>
```

主题已设置 `disableElevation: true`，无需手动指定。

### outlined（描边按钮）

```tsx
<Button variant="outlined">{t('actions.cancel')}</Button>
```

### text（文本按钮）

```tsx
<Button variant="text">{t('actions.learnMore')}</Button>
```

## Loading 状态（MUI 9 内置）

MUI 9 将 LoadingButton 合并进 Button，直接使用 `loading` prop：

```tsx
<Button
  variant="contained"
  loading={isSubmitting}
  loadingPosition="start"
  startIcon={<SaveRoundedIcon />}
>
  {t('actions.saving')}
</Button>

{/* loading 时显示指示器，按钮自动 disabled */}
<Button loading>{t('actions.submit')}</Button>

{/* loadingPosition 选项：'start' | 'end' | 'center'（默认 center） */}
<Button loading loadingPosition="end" endIcon={<SendRoundedIcon />}>
  {t('actions.send')}
</Button>
```

## Sizes

```tsx
<Button size="small">{t('actions.small')}</Button>
<Button size="medium">{t('actions.medium')}</Button>  {/* 默认 */}
<Button size="large">{t('actions.large')}</Button>
```

## Colors

```tsx
<Button color="primary">{t('actions.primary')}</Button>
<Button color="secondary">{t('actions.secondary')}</Button>
<Button color="success">{t('actions.success')}</Button>
<Button color="error">{t('actions.error')}</Button>
<Button color="info">{t('actions.info')}</Button>
<Button color="warning">{t('actions.warning')}</Button>
```

## 带图标用法

```tsx
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

{/* 前置图标 */}
<Button variant="contained" startIcon={<AddRoundedIcon />}>
  {t('actions.add')}
</Button>

{/* 后置图标 */}
<Button variant="outlined" endIcon={<DeleteRoundedIcon />}>
  {t('actions.delete')}
</Button>
```

## IconButton

纯图标按钮，必须附加 `aria-label`（走 i18n）：

```tsx
import { IconButton } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

<IconButton aria-label={t('aria.settings')} size="small">
  <SettingsRoundedIcon fontSize="small" />
</IconButton>

<IconButton aria-label={t('aria.delete')} color="error">
  <DeleteRoundedIcon />
</IconButton>
```

## ButtonGroup

```tsx
import { ButtonGroup, Button } from '@mui/material';

<ButtonGroup variant="outlined" aria-label={t('aria.actionGroup')}>
  <Button>{t('actions.left')}</Button>
  <Button>{t('actions.center')}</Button>
  <Button>{t('actions.right')}</Button>
</ButtonGroup>

{/* 垂直方向 */}
<ButtonGroup orientation="vertical" variant="contained">
  <Button>{t('actions.top')}</Button>
  <Button>{t('actions.bottom')}</Button>
</ButtonGroup>
```

## Props 完整参考

### Button Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'contained' \| 'outlined' \| 'text'` | `'text'` | 按钮样式变体 |
| color | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'info' \| 'warning' \| 'inherit'` | `'primary'` | 颜色主题 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| disabled | `boolean` | `false` | 禁用状态 |
| disableElevation | `boolean` | `true`（主题设置） | 禁用阴影 |
| disableRipple | `boolean` | `false` | 禁用水波纹效果 |
| fullWidth | `boolean` | `false` | 是否撑满容器宽度 |
| startIcon | `ReactNode` | - | 前置图标 |
| endIcon | `ReactNode` | - | 后置图标 |
| href | `string` | - | 作为链接使用 |
| loading | `boolean` | `false` | 加载状态（MUI 9） |
| loadingPosition | `'start' \| 'end' \| 'center'` | `'center'` | 加载指示器位置 |
| loadingIndicator | `ReactNode` | `<CircularProgress />` | 自定义加载指示器 |
| onClick | `(event) => void` | - | 点击事件处理 |
| sx | `SxProps<Theme>` | - | 自定义样式 |

### IconButton Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| color | 同 Button | `'default'` | 颜色主题 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| disabled | `boolean` | `false` | 禁用状态 |
| edge | `'start' \| 'end' \| false` | `false` | 边缘对齐（消除一侧 padding） |
| aria-label | `string` | **必填** | 无障碍标签（走 t()） |

### ButtonGroup Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'contained' \| 'outlined' \| 'text'` | `'outlined'` | 按钮组样式 |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| color | 同 Button | `'primary'` | 统一颜色 |
| size | 同 Button | `'medium'` | 统一尺寸 |
| disabled | `boolean` | `false` | 禁用整组 |
| fullWidth | `boolean` | `false` | 撑满容器 |

## 无障碍 (a11y)

- `IconButton` **必须**提供 `aria-label`（走 `t()`）
- 加载状态的按钮自动设置 `aria-busy="true"`
- `ButtonGroup` 需要 `aria-label` 描述分组用途
- 禁用按钮会自动设置 `aria-disabled="true"`
- 按钮内文本即为其 accessible name，无需额外 aria-label

## Foundation 约束

⚠️ **disableElevation**：主题已全局设置 `disableElevation: true`，不要在 sx 里加 `boxShadow`

⚠️ **配色**：使用 `sx` 自定义颜色时，从 `theme.palette.foundation.*` 取值

⚠️ **图标**：只用 `@mui/icons-material` 的 `*Rounded` 后缀图标

⚠️ **文字**：按钮文字走 `t('key')`，IconButton 的 `aria-label` 也走 `t('key')`

⚠️ **LoadingButton**：MUI 9 不再需要 `@mui/lab`，直接 `<Button loading>` 即可

⚠️ **圆角**：主题已统一按钮 borderRadius: 6，勿在 sx 覆盖
