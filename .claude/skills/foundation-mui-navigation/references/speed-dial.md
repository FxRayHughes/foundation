# SpeedDial 快速拨号

## Import

```tsx
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
```

## 基础用法（Foundation 模式）

```tsx
import { useState } from 'react';
import { useTheme } from '@mui/material';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import FileCopyRoundedIcon from '@mui/icons-material/FileCopyRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useT } from '@/i18n';
import { speedDialStyles } from './QuickActions.styles';

export const QuickActions = () => {
  const theme = useTheme();
  const styles = speedDialStyles(theme);
  const { t } = useT();

  const actions = [
    { icon: <FileCopyRoundedIcon />, name: t('actions.copy') },
    { icon: <SaveRoundedIcon />, name: t('actions.save') },
    { icon: <PrintRoundedIcon />, name: t('actions.print') },
    { icon: <ShareRoundedIcon />, name: t('actions.share') },
  ];

  return (
    <SpeedDial
      ariaLabel={t('speedDial.quickActions')}
      icon={<SpeedDialIcon openIcon={<CloseRoundedIcon />} />}
      sx={styles.root}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          slotProps={{ tooltip: { title: action.name } }}
          onClick={() => handleAction(action)}
        />
      ))}
    </SpeedDial>
  );
};
```

**styles.ts 工厂：**

```tsx
// QuickActions.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const speedDialStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      position: 'fixed',
      bottom: 16,
      right: 16,
      '& .MuiFab-primary': {
        backgroundColor: fp.accent,
        '&:hover': { backgroundColor: fp.accentHover },
      },
      '& .MuiSpeedDialAction-fab': {
        backgroundColor: fp.bg.surface,
        color: fp.text.primary,
        '&:hover': { backgroundColor: fp.bg.hover },
      },
    },
  };
};
```

## 所有 Variants

### direction 方向

```tsx
<SpeedDial direction="up" />     // 默认，向上展开
<SpeedDial direction="down" />   // 向下展开
<SpeedDial direction="left" />   // 向左展开
<SpeedDial direction="right" />  // 向右展开
```

### 自定义关闭图标

```tsx
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

<SpeedDial
  icon={<SpeedDialIcon icon={<AddRoundedIcon />} openIcon={<CloseRoundedIcon />} />}
/>
```

### 持久显示 Tooltip

```tsx
// Tooltip 始终可见（适合触屏设备）
<SpeedDialAction
  icon={<SaveRoundedIcon />}
  slotProps={{ tooltip: { title: t('actions.save'), open: true } }}
/>
```

### 受控开关

```tsx
const [open, setOpen] = useState(false);

<SpeedDial
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  icon={<SpeedDialIcon />}
  ariaLabel={t('speedDial.actions')}
>
```

## Props 完整参考

### SpeedDial

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ariaLabel` | `string` | **必填** | 无障碍标签 |
| `icon` | `node` | — | FAB 图标（通常用 SpeedDialIcon） |
| `open` | `boolean` | — | 受控开关状态 |
| `onOpen` | `(event, reason) => void` | — | 打开回调 |
| `onClose` | `(event, reason) => void` | — | 关闭回调 |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'up'` | 展开方向 |
| `hidden` | `boolean` | `false` | 隐藏 SpeedDial |
| `FabProps` | `object` | — | 传递给内部 Fab 的 props |
| `openIcon` | `node` | — | 打开状态的图标 |
| `children` | `node` | — | SpeedDialAction 子元素 |
| `slots` | `{ transition }` | — | 自定义过渡组件 |
| `slotProps` | `{ transition }` | — | 过渡组件 props |
| `transitionDuration` | `number \| { enter, exit }` | — | 过渡时长 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### SpeedDialAction

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `node` | — | 操作图标 |
| `slotProps` | `{ tooltip: { title }, fab }` | — | Tooltip 和 Fab 的 props |
| `delay` | `number` | `0` | 出现延迟(ms) |
| `FabProps` | `object` | — | 传递给内部 Fab 的 props |
| `onClick` | `(event) => void` | — | 点击回调 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### SpeedDialIcon

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `node` | — | 关闭状态图标（默认 + 号） |
| `openIcon` | `node` | — | 打开状态图标 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 受控 / 非受控

**受控模式**：通过 `open` + `onOpen` + `onClose` 控制。

```tsx
const [open, setOpen] = useState(false);
<SpeedDial open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
```

**非受控模式**：不传 `open`，组件内部管理悬停/聚焦状态。

## 与 Foundation 路由集成

SpeedDial 通常用于操作（保存、分享等），不直接做路由导航。如果需要导航：

```tsx
const { navigate } = useRouter();

const actions = [
  { icon: <AddRoundedIcon />, name: t('actions.newItem'), action: () => navigate('new-item') },
  { icon: <SettingsRoundedIcon />, name: t('nav.settings'), action: () => navigate('settings') },
];

<SpeedDialAction onClick={action.action} />
```

## 无障碍 (a11y)

- `ariaLabel` 是**必填** prop，描述 SpeedDial 的用途
- FAB 自动获得 `aria-haspopup`、`aria-expanded`、`aria-controls`
- 操作容器获得 `role="menu"` + `aria-orientation`
- 每个 SpeedDialAction 获得 `role="menuitem"` + `aria-describedby`（指向 tooltip）
- 键盘操作：Space/Enter 切换开关，方向键移动焦点，Esc 关闭
- **必须**为每个 action 提供 `slotProps.tooltip.title`

## Foundation 约束

1. **配色**：主 FAB 用 `fp.accent`，action FAB 用 `fp.bg.surface`
2. **圆角**：FAB 天然圆形，不需要额外设置
3. **图标**：所有图标只用 `*Rounded` 系列
4. **i18n**：`ariaLabel` 和所有 tooltip title 走 `t('key')`
5. **样式**：复杂样式抽到 `styles.ts` 工厂函数
6. **数量**：3-6 个 action，超过 6 个应使用其他 UI 模式