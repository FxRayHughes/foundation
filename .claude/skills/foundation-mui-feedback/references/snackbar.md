# Snackbar / SnackbarContent

## Import

```tsx
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
```

或命名导入：

```tsx
import { Snackbar, SnackbarContent } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useT } from '@/i18n';
import { snackbarStyles } from './MyComponent.styles';

function MyComponent() {
  const theme = useTheme();
  const t = useT();
  const styles = snackbarStyles(theme);
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="success" variant="filled">
        {t('snackbar.saveSuccess')}
      </Alert>
    </Snackbar>
  );
}
```

样式工厂：

```tsx
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const snackbarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    content: {
      backgroundColor: fp.bg.elevated,
      color: fp.text.primary,
    },
  };
};
```

## 位置 (anchorOrigin)

```tsx
{/* 底部居中（推荐默认） */}
<Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />

{/* 底部左侧 */}
<Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} />

{/* 底部右侧 */}
<Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />

{/* 顶部居中 */}
<Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />

{/* 顶部右侧 */}
<Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} />
```

| vertical | horizontal | 适用场景 |
|----------|-----------|----------|
| `'bottom'` | `'center'` | 通用通知（推荐） |
| `'bottom'` | `'left'` | 不遮挡右下角操作 |
| `'top'` | `'center'` | 重要通知 |
| `'top'` | `'right'` | 不遮挡主内容 |

## 搭配 Alert 使用（推荐模式）

```tsx
<Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="success" variant="filled">
    {t('snackbar.saved')}
  </Alert>
</Snackbar>

<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="error" variant="filled">
    {t('snackbar.networkError')}
  </Alert>
</Snackbar>

<Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="warning" variant="filled">
    {t('snackbar.unsavedChanges')}
  </Alert>
</Snackbar>

<Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="info" variant="filled">
    {t('snackbar.newUpdate')}
  </Alert>
</Snackbar>
```

## 使用 SnackbarContent（自定义内容）

```tsx
import SnackbarContent from '@mui/material/SnackbarContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseRounded from '@mui/icons-material/CloseRounded';

<Snackbar open={open} onClose={handleClose}>
  <SnackbarContent
    message={t('snackbar.fileUploaded')}
    action={
      <>
        <Button color="secondary" size="small" onClick={handleUndo}>
          {t('common.undo')}
        </Button>
        <IconButton size="small" color="inherit" onClick={handleClose}
          aria-label={t('a11y.close')}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </>
    }
  />
</Snackbar>
```

## 自动隐藏时长

```tsx
{/* 4 秒后自动关闭（成功通知推荐） */}
<Snackbar autoHideDuration={4000} />

{/* 6 秒后自动关闭（错误通知推荐，给用户更多阅读时间） */}
<Snackbar autoHideDuration={6000} />

{/* 不自动关闭（需要用户手动操作） */}
<Snackbar autoHideDuration={null} />
```

## 过渡动画

```tsx
import Slide from '@mui/material/Slide';
import Grow from '@mui/material/Grow';
import Fade from '@mui/material/Fade';

{/* 从底部滑入（默认） */}
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}
<Snackbar TransitionComponent={SlideTransition} />

{/* 从左侧滑入 */}
function SlideLeft(props) {
  return <Slide {...props} direction="right" />;
}
<Snackbar TransitionComponent={SlideLeft} />

{/* 放大出现 */}
<Snackbar TransitionComponent={Grow} />

{/* 淡入 */}
<Snackbar TransitionComponent={Fade} />
```

## 连续 Snackbar（队列模式）

```tsx
import { useState, useCallback, useEffect } from 'react';

function useSnackbarQueue() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (queue.length > 0 && !current) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [queue, current]);

  const enqueue = useCallback((message, severity = 'info') => {
    setQueue((prev) => [...prev, { message, severity, key: Date.now() }]);
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleExited = () => {
    setCurrent(null);
  };

  return { current, open, enqueue, handleClose, handleExited };
}
```

## 简单消息 Snackbar（无 Alert）

```tsx
<Snackbar
  open={open}
  autoHideDuration={3000}
  onClose={handleClose}
  message={t('snackbar.copied')}
/>
```

## Props 完整参考

### Snackbar

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| open | `boolean` | — | 是否显示 |
| onClose | `(event, reason) => void` | — | 关闭回调，reason: 'timeout' \| 'clickaway' \| 'escapeKeyDown' |
| autoHideDuration | `number \| null` | `null` | 自动关闭时长(ms)，null 不自动关闭 |
| anchorOrigin | `{ vertical, horizontal }` | `{ vertical: 'bottom', horizontal: 'left' }` | 位置 |
| message | `ReactNode` | — | 消息内容（简单文本时用） |
| action | `ReactNode` | — | 操作按钮 |
| children | `ReactNode` | — | 自定义内容（通常放 Alert） |
| TransitionComponent | `Component` | `Grow` | 过渡动画 |
| transitionDuration | `number \| { enter, exit }` | — | 过渡时长 |
| resumeHideDuration | `number` | — | 窗口获焦后恢复计时的延迟 |
| disableWindowBlurListener | `boolean` | `false` | 禁用窗口失焦暂停 |
| key | `any` | — | 用于连续 Snackbar 的 key |
| ClickAwayListenerProps | `object` | — | ClickAwayListener 的 props |
| ContentProps | `object` | — | SnackbarContent 的 props |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- Snackbar 默认 `role="presentation"`，内部 Alert/SnackbarContent 带 `role="alert"`
- 屏幕阅读器会自动播报 Snackbar 内容（通过 `aria-live="assertive"`）
- 关闭按钮需要 `aria-label`
- `autoHideDuration` 不宜过短（< 3000ms），给用户足够阅读时间
- 不要同时显示多个 Snackbar（使用队列模式）

```tsx
<Snackbar open={open} onClose={handleClose}>
  <Alert
    onClose={handleClose}
    severity="success"
    variant="filled"
    role="alert"
  >
    {t('snackbar.operationComplete')}
  </Alert>
</Snackbar>
```

## Foundation 约束

⚠️ **场景分界**：Snackbar 用于非阻断式临时通知（操作成功/失败反馈）。阻断式确认/错误走 NativeDialogs。

⚠️ **配色**：搭配 Alert 使用时，Alert 的 `variant="filled"` 已有语义色。自定义 SnackbarContent 时从 `fp.bg.elevated` 取背景色。

⚠️ **i18n**：Snackbar 的 `message`、Alert 内文字、按钮文字、`aria-label` 全部走 `t('key')`。

⚠️ **图标**：关闭按钮用 `CloseRounded`，操作图标用 `*Rounded` 系列。

⚠️ **时长建议**：
- 成功通知：`autoHideDuration={4000}`
- 错误通知：`autoHideDuration={6000}`（给用户更多时间）
- 需要操作的通知：`autoHideDuration={null}`（不自动关闭）

⚠️ **clickaway 处理**：始终在 `onClose` 中过滤 `reason === 'clickaway'`，防止用户误触关闭重要通知。

⚠️ **位置**：Foundation 桌面应用推荐 `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}`，避免遮挡三栏布局的侧边栏。

### SnackbarContent

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| message | `ReactNode` | — | 消息内容 |
| action | `ReactNode` | — | 操作区域 |
| role | `string` | `'alert'` | ARIA role |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- Snackbar 默认 `role="presentation"`，内部 Alert/SnackbarContent 带 `role="alert"`
- 屏幕阅读器会自动播报 Snackbar 内容（通过 `aria-live="assertive"`）
- 关闭按钮需要 `aria-label`
- `autoHideDuration` 不宜过短（< 3000ms），给用户足够阅读时间
- 不要同时显示多个 Snackbar（使用队列模式）

```tsx
<Snackbar open={open} onClose={handleClose}>
  <Alert
    onClose={handleClose}
    severity="success"
    variant="filled"
    role="alert"
  >
    {t('snackbar.operationComplete')}
  </Alert>
</Snackbar>
```

## Foundation 约束

⚠️ **场景分界**：Snackbar 用于非阻断式临时通知（操作成功/失败反馈）。阻断式确认/错误走 NativeDialogs。

⚠️ **配色**：搭配 Alert 使用时，Alert 的 `variant="filled"` 已有语义色。自定义 SnackbarContent 时从 `fp.bg.elevated` 取背景色。

⚠️ **i18n**：Snackbar 的 `message`、Alert 内文字、按钮文字、`aria-label` 全部走 `t('key')`。

⚠️ **图标**：关闭按钮用 `CloseRounded`，操作图标用 `*Rounded` 系列。

⚠️ **时长建议**：
- 成功通知：`autoHideDuration={4000}`
- 错误通知：`autoHideDuration={6000}`（给用户更多时间）
- 需要操作的通知：`autoHideDuration={null}`（不自动关闭）

⚠️ **clickaway 处理**：始终在 `onClose` 中过滤 `reason === 'clickaway'`，防止用户误触关闭重要通知。

⚠️ **位置**：Foundation 桌面应用推荐 `anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}`，避免遮挡三栏布局的侧边栏。
