# Backdrop

## Import

```tsx
import Backdrop from '@mui/material/Backdrop';
```

或命名导入：

```tsx
import { Backdrop } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useT } from '@/i18n';
import { backdropStyles } from './MyComponent.styles';

function MyComponent() {
  const theme = useTheme();
  const t = useT();
  const styles = backdropStyles(theme);
  const [loading, setLoading] = useState(false);

  return (
    <Backdrop
      sx={styles.root}
      open={loading}
      aria-label={t('a11y.loading')}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
```

样式工厂：

```tsx
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const backdropStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      color: fp.text.primary,
      zIndex: theme.zIndex.drawer + 1,
    },
  };
};
```

## 带文字提示的 Backdrop

```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

<Backdrop open={loading} sx={styles.root}>
  <Box sx={styles.content}>
    <CircularProgress color="inherit" />
    <Typography sx={{ mt: 2 }}>{t('loading.pleaseWait')}</Typography>
  </Box>
</Backdrop>
```

## 局部 Backdrop（容器内遮罩）

```tsx
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

function PartialBackdrop({ loading, children }) {
  const theme = useTheme();
  const t = useT();

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <Backdrop
        open={loading}
        sx={{
          position: 'absolute',
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        aria-label={t('a11y.sectionLoading')}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
```

## 过渡动画

默认使用 Fade 过渡。可自定义过渡组件：

```tsx
import Fade from '@mui/material/Fade';

<Backdrop
  open={open}
  TransitionComponent={Fade}
  transitionDuration={500}
>
  <CircularProgress color="inherit" />
</Backdrop>
```

## 不可见 Backdrop（仅捕获点击）

```tsx
<Backdrop open={menuOpen} invisible onClick={handleClose} />
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| open | `boolean` | — | **必填**，是否显示 |
| children | `ReactNode` | — | 遮罩层上方内容 |
| invisible | `boolean` | `false` | true 时背景透明（仅捕获点击） |
| onClick | `(event) => void` | — | 点击遮罩回调 |
| TransitionComponent | `Component` | `Fade` | 过渡动画组件 |
| transitionDuration | `number \| { enter, exit }` | — | 过渡时长(ms) |
| component | `elementType` | `'div'` | 根元素类型 |
| slots | `{ root, transition }` | — | 自定义插槽 |
| slotProps | `{ root, transition }` | — | 插槽 props |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- 为 Backdrop 添加 `aria-label` 描述当前状态
- 如果 Backdrop 包含可交互内容，确保焦点管理正确
- 使用 `aria-busy="true"` 标记正在加载的区域

```tsx
<Box aria-busy={loading} aria-live="polite">
  <Backdrop open={loading} aria-label={t('a11y.loading')}>
    <CircularProgress aria-label={t('a11y.progressIndicator')} />
  </Backdrop>
  {/* 内容 */}
</Box>
```

## Foundation 约束

⚠️ **zIndex**：Backdrop 的 zIndex 应使用 `theme.zIndex.drawer + 1` 或更高，确保覆盖侧边栏。

⚠️ **配色**：不要硬编码 `rgba(0,0,0,0.5)`。如需自定义透明度，基于 `fp.bg.base` 添加 alpha。

⚠️ **图标**：Backdrop 内的加载指示器用 `CircularProgress`，不要用自定义 SVG 动画。

⚠️ **i18n**：`aria-label` 和任何文字提示必须走 `t('key')`。

⚠️ **场景**：全局阻断式加载用 Backdrop；局部加载优先用 `LinearProgress` 或 `Skeleton`。
