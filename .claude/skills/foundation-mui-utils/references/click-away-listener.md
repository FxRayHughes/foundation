# ClickAwayListener

监听子元素外部的点击/触摸事件的工具组件。常与 Popper / 自定义下拉配合使用。

## Import

```tsx
import ClickAwayListener from '@mui/material/ClickAwayListener';
```

## 基础用法（Foundation 模式）

```tsx
// DropdownMenu.tsx
import { useState } from 'react';
import { Box, Paper, Typography, Button, useTheme } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import { useT } from '@/i18n';

export const DropdownMenu = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const { t } = useT();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button onClick={(e) => setAnchorEl(e.currentTarget)}>
        {t('menu.open')}
      </Button>
      <Popper open={open} anchorEl={anchorEl} placement="bottom-start">
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper sx={{ backgroundColor: fp.bg.surface, borderRadius: 2, p: 1 }}>
            <Typography>{t('menu.item1')}</Typography>
            <Typography>{t('menu.item2')}</Typography>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
```

## 所有 Props / 变体

### 默认（trailing 事件）

监听 mouseUp / touchEnd（点击结束时触发）：

```tsx
<ClickAwayListener onClickAway={handleClose}>
  <Box>{/* 内容 */}</Box>
</ClickAwayListener>
```

### Leading 事件（mouseDown / touchStart）

监听点击开始时触发，响应更快：

```tsx
<ClickAwayListener
  onClickAway={handleClose}
  mouseEvent="onMouseDown"
  touchEvent="onTouchStart"
>
  <Box>{/* 内容 */}</Box>
</ClickAwayListener>
```

### 禁用某类事件

```tsx
// 只监听鼠标，忽略触摸
<ClickAwayListener onClickAway={handleClose} touchEvent={false}>
  <Box>{/* 内容 */}</Box>
</ClickAwayListener>

// 只监听触摸，忽略鼠标
<ClickAwayListener onClickAway={handleClose} mouseEvent={false}>
  <Box>{/* 内容 */}</Box>
</ClickAwayListener>
```

### 配合 Portal

ClickAwayListener 正确处理 Portal 内的子元素——点击 Portal 内容不会触发 clickAway：

```tsx
<ClickAwayListener onClickAway={handleClose}>
  <div>
    <Button>{t('trigger')}</Button>
    <Portal>
      <Paper>{t('portal.content')}</Paper>
    </Portal>
  </div>
</ClickAwayListener>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onClickAway` | `(event: MouseEvent \| TouchEvent) => void` | — | **必填**。外部点击回调 |
| `children` | `ReactElement` | — | **必填**。单个子元素 |
| `mouseEvent` | `'onClick' \| 'onMouseDown' \| 'onMouseUp' \| false` | `'onClick'` | 鼠标事件类型 |
| `touchEvent` | `'onTouchStart' \| 'onTouchEnd' \| false` | `'onTouchEnd'` | 触摸事件类型 |
| `disableReactTree` | `boolean` | `false` | 禁用 React 树检测（仅用 DOM 树判断） |

## 无障碍 (a11y)

- ClickAwayListener 不添加任何 ARIA 属性
- 确保关闭行为不会让键盘用户困惑
- 建议同时支持 Escape 键关闭（需自行实现）

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') handleClose();
};

<ClickAwayListener onClickAway={handleClose}>
  <Box onKeyDown={handleKeyDown} tabIndex={-1}>
    {/* 内容 */}
  </Box>
</ClickAwayListener>
```

## Foundation 约束

1. Foundation 是桌面应用，**推荐将 `touchEvent` 设为 `false`** 减少不必要的监听
2. 主要配合 Popper 使用（Popover/Modal 已内置关闭逻辑）
3. 浮层关闭 **必须同时支持** ClickAway + Escape 键
4. 子元素必须是单个 React 元素（不能是 Fragment）
5. 所有文案走 `t('key')`
6. 不要在 onClickAway 中直接操作 DOM，走 React 状态

## 常见模式：Popper + ClickAway + Transition

Foundation 中最常见的浮层组合模式：

```tsx
// ActionMenu.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const actionMenuStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    paper: {
      backgroundColor: fp.bg.elevated,
      borderRadius: 2,
      p: 0.5,
      boxShadow: theme.shadows[8],
      border: `1px solid ${fp.divider}`,
      minWidth: 160,
    },
    item: {
      color: fp.text.primary,
      px: 1.5,
      py: 0.75,
      borderRadius: 1,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      '&:hover': { backgroundColor: fp.bg.hover },
    },
  };
};
```

```tsx
// ActionMenu.tsx
import { useState, MouseEvent, KeyboardEvent } from 'react';
import { Popper, Paper, Box, Button, Typography, useTheme } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import { actionMenuStyles } from './ActionMenu.styles';
import { useT } from '@/i18n';

export const ActionMenu = () => {
  const theme = useTheme();
  const styles = actionMenuStyles(theme);
  const { t } = useT();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleToggle = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  return (
    <>
      <Button
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {t('actions.more')}
      </Button>
      <Popper open={open} anchorEl={anchorEl} transition placement="bottom-start">
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper sx={styles.paper}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box onKeyDown={handleKeyDown} tabIndex={-1}>
                  <Box sx={styles.item} onClick={handleClose}>
                    <ContentCopyRounded fontSize="small" />
                    <Typography variant="body2">{t('actions.copy')}</Typography>
                  </Box>
                  <Box sx={styles.item} onClick={handleClose}>
                    <DeleteRounded fontSize="small" />
                    <Typography variant="body2">{t('actions.delete')}</Typography>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
```