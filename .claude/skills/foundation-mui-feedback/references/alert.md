# Alert / AlertTitle

## Import

```tsx
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
```

或命名导入：

```tsx
import { Alert, AlertTitle } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { useT } from '@/i18n';
import { alertStyles } from './MyComponent.styles';

function MyComponent() {
  const theme = useTheme();
  const t = useT();
  const styles = alertStyles(theme);

  return (
    <Alert severity="success" icon={<CheckCircleRounded />} sx={styles.root}>
      <AlertTitle>{t('alerts.saveSuccess.title')}</AlertTitle>
      {t('alerts.saveSuccess.message')}
    </Alert>
  );
}
```

样式工厂：

```tsx
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const alertStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.surface,
      borderRadius: 2,
      color: fp.text.primary,
    },
  };
};
```

## 所有 Variants

### filled（实心填充）

```tsx
<Alert variant="filled" severity="error">
  {t('alerts.networkError')}
</Alert>
```

### outlined（描边）

```tsx
<Alert variant="outlined" severity="warning">
  {t('alerts.unsavedChanges')}
</Alert>
```

### standard（默认，浅色背景）

```tsx
<Alert variant="standard" severity="info">
  {t('alerts.newVersion')}
</Alert>
```

## Severity 四种级别

| severity | 用途 | 默认图标 |
|----------|------|----------|
| `error` | 操作失败、系统错误 | ErrorRounded |
| `warning` | 潜在风险、需注意 | WarningRounded |
| `info` | 中性信息提示 | InfoRounded |
| `success` | 操作成功 | CheckCircleRounded |

```tsx
<Alert severity="error">{t('alerts.saveFailed')}</Alert>
<Alert severity="warning">{t('alerts.diskLow')}</Alert>
<Alert severity="info">{t('alerts.updateAvailable')}</Alert>
<Alert severity="success">{t('alerts.saved')}</Alert>
```

## 带标题

```tsx
<Alert severity="error">
  <AlertTitle>{t('alerts.error.title')}</AlertTitle>
  {t('alerts.error.detail')}
</Alert>
```

## 自定义图标

```tsx
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';

<Alert severity="warning" icon={<WarningAmberRounded />}>
  {t('alerts.customIcon')}
</Alert>
```

禁用图标：

```tsx
<Alert severity="info" icon={false}>
  {t('alerts.noIcon')}
</Alert>
```

## 可关闭 Alert

```tsx
import { useState } from 'react';

function DismissibleAlert() {
  const [open, setOpen] = useState(true);
  const t = useT();

  if (!open) return null;

  return (
    <Alert severity="info" onClose={() => setOpen(false)}>
      {t('alerts.dismissible')}
    </Alert>
  );
}
```

## 带操作按钮

```tsx
import Button from '@mui/material/Button';

<Alert
  severity="warning"
  action={
    <Button color="inherit" size="small" onClick={handleRetry}>
      {t('common.retry')}
    </Button>
  }
>
  {t('alerts.connectionLost')}
</Alert>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| severity | `'error' \| 'warning' \| 'info' \| 'success'` | `'success'` | 严重程度，决定颜色和默认图标 |
| variant | `'filled' \| 'outlined' \| 'standard'` | `'standard'` | 外观变体 |
| icon | `ReactNode \| false` | — | 自定义图标，false 隐藏 |
| iconMapping | `{ error, info, success, warning }` | — | 按 severity 映射图标 |
| onClose | `(event) => void` | — | 关闭回调，传入后显示关闭按钮 |
| action | `ReactNode` | — | 右侧操作区域 |
| closeText | `string` | `'Close'` | 关闭按钮 aria-label |
| color | `'error' \| 'info' \| 'success' \| 'warning'` | — | 覆盖 severity 的颜色 |
| slots | `{ closeButton, closeIcon }` | — | 自定义插槽组件 |
| slotProps | `{ closeButton, closeIcon }` | — | 插槽 props |
| sx | `SxProps<Theme>` | — | 样式覆盖 |
| children | `ReactNode` | — | Alert 内容 |

## 无障碍 (a11y)

- Alert 默认 `role="alert"`，屏幕阅读器会立即播报
- 关闭按钮自动带 `aria-label`（通过 `closeText` prop 自定义）
- severity 信息通过图标 + 颜色 + role 三重传达
- 不要仅依赖颜色传达信息，确保文字内容足够清晰

```tsx
<Alert severity="error" closeText={t('a11y.closeAlert')}>
  {t('alerts.formError')}
</Alert>
```

## Foundation 约束

⚠️ **配色**：不要用 `color` prop 覆盖为自定义颜色，让 severity 决定颜色语义。如需自定义背景，在样式工厂中从 `fp.bg.*` 或 `fp.status.*` 取值。

⚠️ **图标**：自定义 icon 必须用 `@mui/icons-material` 的 `*Rounded` 系列，禁止 emoji。

⚠️ **i18n**：Alert 内所有文字（标题、内容、按钮文字）必须走 `t('key')`。

⚠️ **场景分界**：Alert 用于页面内联提示。如果是阻断式错误/确认，走 NativeDialogs 而非 Alert。
