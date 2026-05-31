# Portal

将子节点渲染到当前 DOM 层级之外（默认 `document.body`）。Modal / Popover / Popper 内部均使用 Portal。

## Import

```tsx
import Portal from '@mui/material/Portal';
```

## 基础用法（Foundation 模式）

```tsx
import { useState, useRef } from 'react';
import { Portal, Box, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const PortalDemo = () => {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Box ref={containerRef} sx={{ border: '1px dashed grey', p: 2 }}>
        <Typography>{t('portal.targetContainer')}</Typography>
      </Box>

      <Portal container={() => containerRef.current!}>
        <Typography>{t('portal.teleportedContent')}</Typography>
      </Portal>
    </>
  );
};
```

## 所有 Props / 变体

### 默认挂载到 body

```tsx
<Portal>
  <div>{t('portal.bodyContent')}</div>
</Portal>
```

### 指定容器

```tsx
<Portal container={() => document.getElementById('sidebar')!}>
  <NotificationBadge />
</Portal>
```

### 禁用 Portal（留在原位）

某些组件（Popper/Modal）支持 `disablePortal`，效果等同于不用 Portal：

```tsx
<Popper disablePortal>{/* 内容不会传送 */}</Popper>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 要传送的子节点 |
| `container` | `HTMLElement \| (() => HTMLElement)` | `document.body` | 目标容器 |
| `disablePortal` | `boolean` | `false` | 禁用传送，子节点留在原位 |

## 无障碍 (a11y)

- Portal 本身不影响无障碍树，但传送后的内容可能脱离 Tab 顺序
- 如果传送内容需要键盘交互，确保焦点可达
- Modal 类组件已内置焦点管理，无需额外处理

## Foundation 约束

1. Foundation 中很少直接使用 Portal——优先用 Modal / Popover / Popper 等高级组件
2. 如需直接使用，确保传送内容的样式仍走 `theme.palette.foundation.*`
3. 注意：Portal 不支持 SSR 中的 `createPortal`，但 Foundation 是桌面应用无此问题