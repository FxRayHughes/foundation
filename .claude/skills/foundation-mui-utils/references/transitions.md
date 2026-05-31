# Transitions

MUI 提供 5 种过渡动画组件：Collapse、Fade、Grow、Slide、Zoom。用于元素进入/退出时的视觉过渡效果。

## Import

```tsx
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';
```

## 选型指南

| 组件 | 效果 | 典型场景 |
|------|------|----------|
| `Fade` | 透明度渐变 | Modal 内容、通知、切换面板 |
| `Collapse` | 垂直折叠/展开 | 列表展开、手风琴、详情区域 |
| `Grow` | 从锚点缩放+淡入 | 菜单弹出、Popover 内容 |
| `Slide` | 从指定方向滑入 | 抽屉、侧边栏、通知条 |
| `Zoom` | 从中心缩放 | FAB 按钮、图标切换 |

---

## Fade

透明度从 0 到 1 的渐变动画。

### 基础用法（Foundation 模式）

```tsx
import { useState } from 'react';
import { Fade, Box, Button, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const FadeDemo = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const { t } = useT();
  const [show, setShow] = useState(false);

  return (
    <>
      <Button onClick={() => setShow(!show)}>{t('toggle')}</Button>
      <Fade in={show} timeout={300}>
        <Box sx={{ backgroundColor: fp.bg.surface, p: 2, borderRadius: 2 }}>
          {t('fade.content')}
        </Box>
      </Fade>
    </>
  );
};
```

### 自定义时长

```tsx
<Fade in={show} timeout={{ enter: 500, exit: 200 }}>
  <Box>{t('fade.custom')}</Box>
</Fade>
```

---

## Collapse

垂直方向的折叠/展开动画，常用于列表项展开、手风琴面板。

### 基础用法

```tsx
import { useState } from 'react';
import { Collapse, Box, Button, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const CollapseDemo = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? t('collapse.hide') : t('collapse.show')}
      </Button>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ backgroundColor: fp.bg.surface, p: 2, mt: 1, borderRadius: 2 }}>
          {t('collapse.details')}
        </Box>
      </Collapse>
    </>
  );
};
```

### 水平折叠

```tsx
<Collapse in={expanded} orientation="horizontal" timeout={300}>
  <Box sx={{ width: 200, p: 2 }}>{t('collapse.horizontal')}</Box>
</Collapse>
```

### 指定折叠高度（collapsedSize）

部分内容始终可见，展开显示全部：

```tsx
<Collapse in={expanded} collapsedSize={40}>
  <Box sx={{ p: 2 }}>
    {t('collapse.preview')}
    {/* 展开后显示更多内容 */}
  </Box>
</Collapse>
```

---

## Grow

从锚点位置缩放 + 淡入，常用于菜单弹出。

### 基础用法

```tsx
import { useState } from 'react';
import { Grow, Paper, Button, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const GrowDemo = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const { t } = useT();
  const [show, setShow] = useState(false);

  return (
    <>
      <Button onClick={() => setShow(!show)}>{t('toggle')}</Button>
      <Grow in={show} timeout={300}>
        <Paper sx={{ backgroundColor: fp.bg.elevated, p: 2, mt: 1 }}>
          {t('grow.content')}
        </Paper>
      </Grow>
    </>
  );
};
```

### 自定义变换原点

```tsx
<Grow
  in={show}
  style={{ transformOrigin: '0 0 0' }}
  timeout={400}
>
  <Paper sx={{ p: 2 }}>{t('grow.topLeft')}</Paper>
</Grow>
```

---

## Slide

从指定方向滑入/滑出，常用于抽屉、侧边栏、通知条。

### 基础用法

```tsx
import { useState, useRef } from 'react';
import { Slide, Paper, Button, Box, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const SlideDemo = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const { t } = useT();
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  return (
    <Box ref={containerRef} sx={{ overflow: 'hidden', position: 'relative', height: 200 }}>
      <Button onClick={() => setShow(!show)}>{t('toggle')}</Button>
      <Slide direction="up" in={show} container={containerRef.current} mountOnEnter unmountOnExit>
        <Paper sx={{ backgroundColor: fp.bg.elevated, p: 2, position: 'absolute', bottom: 0, width: '100%' }}>
          {t('slide.content')}
        </Paper>
      </Slide>
    </Box>
  );
};
```

### 方向选项

```tsx
<Slide direction="up" in={show}>...</Slide>    {/* 从下方滑入 */}
<Slide direction="down" in={show}>...</Slide>  {/* 从上方滑入 */}
<Slide direction="left" in={show}>...</Slide>  {/* 从右侧滑入 */}
<Slide direction="right" in={show}>...</Slide> {/* 从左侧滑入 */}
```

### 限定容器

默认相对于 `body` 滑动，可指定 `container` 限定范围：

```tsx
<Slide direction="left" in={show} container={containerRef.current}>
  <Paper>{t('slide.bounded')}</Paper>
</Slide>
```

---

## Zoom

从中心点缩放进入/退出，常用于 FAB 按钮切换。

### 基础用法

```tsx
import { useState } from 'react';
import { Zoom, Fab, useTheme } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import { useT } from '@/i18n';

export const ZoomDemo = () => {
  const { t } = useT();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ position: 'relative', height: 56 }}>
      <Zoom in={tab === 0} unmountOnExit>
        <Fab color="primary" aria-label={t('fab.add')} sx={{ position: 'absolute' }}>
          <AddRounded />
        </Fab>
      </Zoom>
      <Zoom in={tab === 1} unmountOnExit>
        <Fab color="secondary" aria-label={t('fab.edit')} sx={{ position: 'absolute' }}>
          <EditRounded />
        </Fab>
      </Zoom>
    </Box>
  );
};
```

---

## 通用 Props 参考

所有 Transition 组件共享以下 props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `in` | `boolean` | `false` | 控制进入/退出状态 |
| `timeout` | `number \| { enter?: number, exit?: number } \| 'auto'` | 组件各异 | 动画时长（ms） |
| `mountOnEnter` | `boolean` | `false` | 首次 `in=true` 时才挂载子节点 |
| `unmountOnExit` | `boolean` | `false` | `in=false` 动画结束后卸载子节点 |
| `appear` | `boolean` | `true` | 首次挂载时是否播放进入动画 |
| `easing` | `string \| { enter?: string, exit?: string }` | — | 缓动函数 |
| `addEndListener` | `(node, done) => void` | — | 自定义动画结束监听 |

### Collapse 专有 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 折叠方向 |
| `collapsedSize` | `string \| number` | `'0px'` | 折叠状态的最小尺寸 |

### Slide 专有 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'down'` | 滑入方向 |
| `container` | `HTMLElement \| (() => HTMLElement)` | `body` | 限定滑动范围的容器 |

### Grow 专有 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `style.transformOrigin` | `string` | `'center center'` | 缩放原点 |

---

## 配合 Modal / Popper 使用

### Modal + Fade

```tsx
<Modal open={open} onClose={handleClose} closeAfterTransition>
  <Fade in={open}>
    <Box sx={styles.content}>{t('modal.fadeContent')}</Box>
  </Fade>
</Modal>
```

### Popper + Grow

```tsx
<Popper open={open} anchorEl={anchorEl} transition>
  {({ TransitionProps }) => (
    <Grow {...TransitionProps}>
      <Paper sx={styles.paper}>{t('popper.menu')}</Paper>
    </Grow>
  )}
</Popper>
```

## 无障碍 (a11y)

- 过渡动画应尊重用户的 `prefers-reduced-motion` 偏好
- 使用 `useMediaQuery('(prefers-reduced-motion: reduce)')` 检测并禁用动画
- `unmountOnExit` 确保隐藏内容不被屏幕阅读器读取

```tsx
import useMediaQuery from '@mui/material/useMediaQuery';

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<Fade in={show} timeout={prefersReducedMotion ? 0 : 300}>
  <Box>{t('content')}</Box>
</Fade>
```

## Foundation 约束

1. 动画时长建议 150-300ms，不超过 500ms（桌面应用追求响应速度）
2. 列表展开用 `Collapse`，弹层用 `Fade` 或 `Grow`，侧边栏用 `Slide`
3. 所有文案走 `t('key')`
4. 配色从 `theme.palette.foundation.*` 取
5. 尊重 `prefers-reduced-motion`：检测到时将 timeout 设为 0
6. `unmountOnExit` 推荐用于非频繁切换的重型组件，避免不必要的 DOM 保留
