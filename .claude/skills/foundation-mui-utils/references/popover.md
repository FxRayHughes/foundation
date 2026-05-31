# Popover

基于锚点定位的弹出层，带 backdrop，点击外部自动关闭。内部基于 Modal 实现。

## Import

```tsx
import Popover from '@mui/material/Popover';
```

## 基础用法（Foundation 模式）

```tsx
// UserPopover.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const userPopoverStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    paper: {
      backgroundColor: fp.bg.surface,
      borderRadius: 2,
      p: 2,
      minWidth: 200,
    },
    item: { color: fp.text.primary },
  };
};
```

```tsx
// UserPopover.tsx
import { useState, MouseEvent } from 'react';
import { Popover, Box, Typography, Button, useTheme } from '@mui/material';
import { userPopoverStyles } from './UserPopover.styles';
import { useT } from '@/i18n';

export const UserPopover = () => {
  const theme = useTheme();
  const styles = userPopoverStyles(theme);
  const { t } = useT();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button onClick={handleOpen}>{t('user.profile')}</Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: styles.paper } }}
      >
        <Typography sx={styles.item}>{t('user.info')}</Typography>
      </Popover>
    </>
  );
};
```

## 所有 Props / 变体

### 鼠标悬停触发

```tsx
<Popover
  open={Boolean(anchorEl)}
  anchorEl={anchorEl}
  onClose={handleClose}
  sx={{ pointerEvents: 'none' }}
  slotProps={{ paper: { sx: { ...styles.paper, pointerEvents: 'auto' } } }}
  disableRestoreFocus
>
  <Typography sx={styles.item}>{t('hover.content')}</Typography>
</Popover>
```

### 虚拟元素定位

不依赖真实 DOM 元素，用坐标定位：

```tsx
const virtualEl: PopoverVirtualElement = {
  nodeType: 1,
  getBoundingClientRect: () => DOMRect.fromRect({ x: 100, y: 200, width: 0, height: 0 }),
};

<Popover open={open} anchorEl={virtualEl} onClose={handleClose}>
  <Box sx={styles.paper}>{t('popover.virtual')}</Box>
</Popover>
```

### 自定义过渡动画

默认使用 Grow，可替换：

```tsx
import Fade from '@mui/material/Fade';

<Popover
  open={open}
  anchorEl={anchorEl}
  onClose={handleClose}
  slots={{ transition: Fade }}
  slotProps={{ transition: { timeout: 350 } }}
>
  {/* 内容 */}
</Popover>
```

## 定位 / 锚点

### anchorOrigin + transformOrigin

控制 Popover 相对于锚点的位置：

```tsx
<Popover
  anchorOrigin={{
    vertical: 'bottom',  // 'top' | 'center' | 'bottom' | number
    horizontal: 'left',  // 'left' | 'center' | 'right' | number
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'left',
  }}
>
```

### anchorReference

| 值 | 说明 |
|----|------|
| `'anchorEl'`（默认） | 相对于 `anchorEl` DOM 元素定位 |
| `'anchorPosition'` | 使用 `anchorPosition={{ top, left }}` 绝对坐标 |
| `'none'` | 不定位（需自行设置 CSS） |

```tsx
<Popover
  anchorReference="anchorPosition"
  anchorPosition={{ top: 200, left: 400 }}
>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | — | **必填**。是否显示 |
| `anchorEl` | `HTMLElement \| VirtualElement \| (() => ...)` | — | 锚点元素 |
| `onClose` | `(event, reason) => void` | — | 关闭回调 |
| `anchorOrigin` | `{ vertical, horizontal }` | `{ vertical: 'top', horizontal: 'left' }` | 锚点对齐原点 |
| `transformOrigin` | `{ vertical, horizontal }` | `{ vertical: 'top', horizontal: 'left' }` | Popover 变换原点 |
| `anchorReference` | `'anchorEl' \| 'anchorPosition' \| 'none'` | `'anchorEl'` | 定位参考方式 |
| `anchorPosition` | `{ top: number, left: number }` | — | 绝对坐标（需 `anchorReference="anchorPosition"`） |
| `elevation` | `number` | `8` | Paper 阴影层级 |
| `marginThreshold` | `number` | `16` | 距视口边缘最小间距（px） |
| `slots.transition` | `elementType` | `Grow` | 过渡动画组件 |
| `slotProps.transition` | `object` | `{}` | 过渡动画 props |
| `slotProps.paper` | `object` | `{}` | Paper 容器 props |
| `disableScrollLock` | `boolean` | `false` | 不锁定滚动 |
| `container` | `HTMLElement \| (() => HTMLElement)` | — | Portal 容器 |
| `sx` | `SxProps<Theme>` | — | 根元素样式 |

## 无障碍 (a11y)

- Popover 内部使用 Modal，自动管理焦点陷阱
- 触发按钮应有 `aria-haspopup="true"` 和 `aria-expanded={open}`
- Popover 内容应有 `role="dialog"` 或适当的 ARIA role

```tsx
<Button
  aria-haspopup="true"
  aria-expanded={open}
  onClick={handleOpen}
>
  {t('actions.open')}
</Button>
```

## Foundation 约束

1. Paper 容器 `borderRadius: 2`（8px），背景 `fp.bg.surface`
2. 所有文案走 `t('key')`
3. 样式通过 `slotProps.paper.sx` 或 styles.ts 工厂传入
4. 简单确认操作不要用 Popover，走 NativeDialogs
