# Popper

轻量级锚点定位引擎，不带 backdrop、不阻塞滚动、不管理焦点。适用于 Tooltip 式提示、下拉选项定位、自动补全浮层等场景。内部基于 Floating UI。

## Import

```tsx
import Popper from '@mui/material/Popper';
```

## 基础用法（Foundation 模式）

```tsx
// QuickActions.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const quickActionsStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    paper: {
      backgroundColor: fp.bg.elevated,
      borderRadius: 2,
      p: 1.5,
      boxShadow: theme.shadows[8],
      border: `1px solid ${fp.divider}`,
    },
    item: {
      color: fp.text.primary,
      px: 1.5,
      py: 0.75,
      borderRadius: 1,
      cursor: 'pointer',
      '&:hover': { backgroundColor: fp.bg.hover },
    },
  };
};
```

```tsx
// QuickActions.tsx
import { useState, MouseEvent } from 'react';
import { Popper, Paper, Box, Typography, Button, useTheme } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fade from '@mui/material/Fade';
import { quickActionsStyles } from './QuickActions.styles';
import { useT } from '@/i18n';

export const QuickActions = () => {
  const theme = useTheme();
  const styles = quickActionsStyles(theme);
  const { t } = useT();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleToggle = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button onClick={handleToggle}>{t('actions.quick')}</Button>
      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper sx={styles.paper}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Typography sx={styles.item}>{t('actions.copy')}</Typography>
                  <Typography sx={styles.item}>{t('actions.paste')}</Typography>
                  <Typography sx={styles.item}>{t('actions.delete')}</Typography>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};
```

## Placement（定位方向）

Popper 支持 12 种定位方向：

```tsx
// 主方向 4 种
<Popper placement="top" />
<Popper placement="bottom" />
<Popper placement="left" />
<Popper placement="right" />

// 带对齐 8 种
<Popper placement="top-start" />
<Popper placement="top-end" />
<Popper placement="bottom-start" />
<Popper placement="bottom-end" />
<Popper placement="left-start" />
<Popper placement="left-end" />
<Popper placement="right-start" />
<Popper placement="right-end" />
```

## 带过渡动画

Popper 通过 `transition` prop 启用动画，render props 传递 `TransitionProps`：

```tsx
<Popper open={open} anchorEl={anchorEl} transition>
  {({ TransitionProps }) => (
    <Fade {...TransitionProps} timeout={150}>
      <Paper sx={styles.paper}>{t('popper.content')}</Paper>
    </Fade>
  )}
</Popper>
```

也可使用 Grow / Slide / Zoom：

```tsx
import Grow from '@mui/material/Grow';

<Popper open={open} anchorEl={anchorEl} transition placement="bottom-end">
  {({ TransitionProps }) => (
    <Grow {...TransitionProps}>
      <Paper sx={styles.paper}>{t('menu.items')}</Paper>
    </Grow>
  )}
</Popper>
```

## Modifiers（Floating UI 修饰器）

通过 `modifiers` prop 自定义定位行为：

```tsx
<Popper
  open={open}
  anchorEl={anchorEl}
  placement="bottom"
  modifiers={[
    { name: 'offset', options: { offset: [0, 8] } },
    { name: 'flip', options: { fallbackPlacements: ['top', 'right'] } },
    { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
  ]}
>
  <Paper sx={styles.paper}>{t('popper.content')}</Paper>
</Popper>
```

### 常用 Modifier

| Modifier | 作用 |
|----------|------|
| `offset` | 设置浮层与锚点的偏移 `[skidding, distance]` |
| `flip` | 空间不足时翻转到对面 |
| `preventOverflow` | 防止溢出视口 |
| `arrow` | 箭头定位 |
| `hide` | 锚点不可见时隐藏 |

## 虚拟锚点

不依赖真实 DOM 元素，用坐标定位（如右键菜单）：

```tsx
const [anchorEl, setAnchorEl] = useState<{ getBoundingClientRect: () => DOMRect } | null>(null);

const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  setAnchorEl({
    getBoundingClientRect: () => new DOMRect(e.clientX, e.clientY, 0, 0),
  });
};

<Box onContextMenu={handleContextMenu}>
  {t('area.rightClick')}
</Box>
<Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start">
  <Paper sx={styles.paper}>{t('contextMenu.title')}</Paper>
</Popper>
```

## 配合 ClickAwayListener

Popper 不自带关闭逻辑，需手动配合：

```tsx
<Popper open={open} anchorEl={anchorEl}>
  <ClickAwayListener onClickAway={handleClose}>
    <Paper sx={styles.paper}>{t('popper.closable')}</Paper>
  </ClickAwayListener>
</Popper>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | — | **必填**。控制 Popper 是否可见 |
| `anchorEl` | `HTMLElement \| VirtualElement \| (() => ...)` | — | 锚点元素或虚拟元素 |
| `children` | `ReactNode \| (props) => ReactNode` | — | 内容或 render function（transition 时） |
| `placement` | `PopperPlacementType` | `'bottom'` | 定位方向（12 种） |
| `transition` | `boolean` | `false` | 启用过渡动画 render props |
| `modifiers` | `Modifier[]` | `[]` | Floating UI 修饰器数组 |
| `disablePortal` | `boolean` | `false` | 不使用 Portal，渲染在父节点内 |
| `keepMounted` | `boolean` | `false` | 关闭后保持 DOM |
| `container` | `HTMLElement \| (() => HTMLElement)` | `document.body` | Portal 挂载容器 |
| `popperRef` | `Ref<PopperInstance>` | — | Popper 实例引用 |
| `popperOptions` | `object` | `{}` | 传给底层 Floating UI 的选项 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖（应用于根 div） |

## Popper vs Popover 对比

| 特性 | Popper | Popover |
|------|--------|---------|
| Backdrop | 无 | 有（透明） |
| 滚动锁定 | 无 | 有 |
| 焦点管理 | 无 | 有 |
| 关闭逻辑 | 需手动（ClickAwayListener） | 内置 onClose |
| 定位引擎 | Floating UI（全功能） | Floating UI（简化） |
| 适用场景 | Tooltip/下拉/自动补全 | 菜单/信息卡片 |

## 无障碍 (a11y)

- Popper 本身不管理焦点，需手动处理
- 下拉菜单场景：给锚点添加 `aria-haspopup="true"` 和 `aria-expanded={open}`
- 浮层内容添加 `role="menu"` 或 `role="listbox"`（视场景）
- 键盘导航需自行实现（Escape 关闭、箭头键移动）

```tsx
<Button
  aria-haspopup="true"
  aria-expanded={open}
  aria-controls={open ? 'actions-popper' : undefined}
  onClick={handleToggle}
>
  {t('actions.open')}
</Button>
<Popper open={open} anchorEl={anchorEl} id="actions-popper" role="menu">
  <Paper sx={styles.paper}>{/* 菜单项 */}</Paper>
</Popper>
```

## Foundation 约束

1. **Popper 不带关闭逻辑** → 必须配合 `ClickAwayListener` 或键盘事件处理
2. 浮层容器用 `Paper` 包裹，`borderRadius: 2`（8px），背景 `fp.bg.elevated`
3. 推荐加 `boxShadow: theme.shadows[8]` 和 `border: 1px solid ${fp.divider}` 增强层次
4. 所有文案走 `t('key')`
5. 样式抽到 `styles.ts` 工厂函数
6. 右键菜单用虚拟锚点实现，不要用浏览器原生 contextmenu
