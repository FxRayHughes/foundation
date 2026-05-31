# Drawer 抽屉

## Import

```tsx
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
```

## 基础用法（Foundation 模式）

```tsx
import { useState } from 'react';
import { useTheme } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useRouter } from '@/shared/hooks/useRouter';
import { useT } from '@/i18n';
import { drawerStyles } from './AppDrawer.styles';

export const AppDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const theme = useTheme();
  const styles = drawerStyles(theme);
  const { navigate } = useRouter();
  const { t } = useT();

  const handleNav = (id: string) => {
    navigate(id);
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose} sx={styles.drawer}>
      <List>
        <ListItemButton onClick={() => handleNav('home')}>
          <ListItemIcon><HomeRoundedIcon /></ListItemIcon>
          <ListItemText primary={t('nav.home')} />
        </ListItemButton>
        <ListItemButton onClick={() => handleNav('settings')}>
          <ListItemIcon><SettingsRoundedIcon /></ListItemIcon>
          <ListItemText primary={t('nav.settings')} />
        </ListItemButton>
      </List>
    </Drawer>
  );
};
```

**styles.ts 工厂：**

```tsx
// AppDrawer.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const drawerStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    drawer: {
      '& .MuiDrawer-paper': {
        backgroundColor: fp.bg.sidebar,
        width: 260,
        borderRadius: 0,
      },
    },
  };
};
```

## 所有 Variants

| Variant | 说明 | 适用场景 |
|---------|------|----------|
| `temporary`（默认） | 覆盖在内容上方，点击遮罩或 Esc 关闭 | 移动端导航 |
| `persistent` | 推开内容，用户手动开关 | 桌面端可折叠侧栏 |
| `permanent` | 始终可见，不可关闭 | 桌面端固定侧栏 |

### Temporary（临时抽屉）

```tsx
<Drawer variant="temporary" anchor="left" open={open} onClose={onClose}>
  {drawerContent}
</Drawer>
```

### Persistent（持久抽屉）

```tsx
<Drawer variant="persistent" anchor="left" open={open}>
  {drawerContent}
</Drawer>
// 主内容区需要配合 margin-left 偏移
```

### Permanent（永久抽屉）

```tsx
<Drawer variant="permanent" anchor="left">
  {drawerContent}
</Drawer>
```

### SwipeableDrawer（可滑动抽屉）

```tsx
<SwipeableDrawer
  anchor="left"
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
>
  {drawerContent}
</SwipeableDrawer>
```

### Anchor 方向

```tsx
// 支持四个方向
<Drawer anchor="left" />   // 默认，从左侧滑出
<Drawer anchor="right" />  // 从右侧滑出
<Drawer anchor="top" />    // 从顶部滑出
<Drawer anchor="bottom" /> // 从底部滑出
```

## Props 完整参考

### Drawer

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 是否打开 |
| `onClose` | `(event) => void` | — | 关闭回调 |
| `anchor` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | 滑出方向 |
| `variant` | `'temporary' \| 'persistent' \| 'permanent'` | `'temporary'` | 抽屉类型 |
| `elevation` | `number` | `16` | 阴影层级（仅 temporary） |
| `hideBackdrop` | `boolean` | `false` | 隐藏遮罩 |
| `ModalProps` | `object` | — | 传递给内部 Modal 的 props |
| `PaperProps` | `object` | — | 传递给内部 Paper 的 props |
| `slots` | `{ transition }` | — | 自定义过渡动画组件 |
| `slotProps` | `{ transition, backdrop }` | — | 传递给 slot 的 props |
| `transitionDuration` | `number \| { enter, exit }` | — | 过渡时长 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### SwipeableDrawer（继承 Drawer 所有 props）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onOpen` | `(event) => void` | **必填** | 打开回调 |
| `disableBackdropTransition` | `boolean` | `false` | 禁用遮罩过渡（性能优化） |
| `disableDiscovery` | `boolean` | `false` | 禁用边缘滑动发现 |
| `disableSwipeToOpen` | `boolean` | `false` | 禁用滑动打开 |
| `hysteresis` | `number` | `0.52` | 滑动阈值比例 |
| `minFlingVelocity` | `number` | `450` | 最小甩动速度 |
| `swipeAreaWidth` | `number` | `20` | 边缘触发区域宽度(px) |

## 受控 / 非受控

Drawer **始终是受控组件**——必须通过 `open` prop 控制开关状态：

```tsx
const [open, setOpen] = useState(false);

<Drawer open={open} onClose={() => setOpen(false)}>
```

## 与 Foundation 路由集成

```tsx
const { navigate } = useRouter();

const handleNavigation = (routeId: string) => {
  navigate(routeId);
  setOpen(false); // 导航后关闭抽屉
};
```

## 无障碍 (a11y)

- Temporary Drawer 内部使用 Modal，自动管理焦点陷阱
- 按 Esc 键关闭临时抽屉
- 点击遮罩关闭临时抽屉
- 抽屉内容应包含可聚焦元素（如 List + ListItemButton）
- 如果抽屉是导航用途，建议在 Paper 上添加 `role="navigation"`

## Foundation 约束

1. **配色**：Paper 背景用 `fp.bg.sidebar`，列表项文字用 `fp.text.primary`
2. **圆角**：Drawer Paper 不加圆角（`borderRadius: 0`），贴边显示
3. **图标**：导航项图标只用 `*Rounded` 系列
4. **i18n**：所有导航文字走 `t('key')`
5. **路由**：点击导航项调用 `navigate(id)` 后关闭抽屉
6. **宽度**：侧边抽屉推荐 240-280px，与 Foundation 三栏布局的 Sidebar 宽度协调