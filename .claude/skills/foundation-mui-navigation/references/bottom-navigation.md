# BottomNavigation 底部导航

## Import

```tsx
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useRouter } from '@/shared/hooks/useRouter';
import { useT } from '@/i18n';
import { bottomNavStyles } from './BottomNav.styles';

export const BottomNav = () => {
  const theme = useTheme();
  const styles = bottomNavStyles(theme);
  const { currentRoute, navigate } = useRouter();
  const { t } = useT();

  return (
    <BottomNavigation
      value={currentRoute}
      onChange={(_, newValue) => navigate(newValue)}
      sx={styles.root}
    >
      <BottomNavigationAction
        value="home"
        label={t('nav.home')}
        icon={<HomeRoundedIcon />}
      />
      <BottomNavigationAction
        value="profile"
        label={t('nav.profile')}
        icon={<PersonRoundedIcon />}
      />
      <BottomNavigationAction
        value="settings"
        label={t('nav.settings')}
        icon={<SettingsRoundedIcon />}
      />
    </BottomNavigation>
  );
};
```

**styles.ts 工厂：**

```tsx
// BottomNav.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const bottomNavStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      backgroundColor: fp.bg.base,
      borderTop: `1px solid ${fp.divider}`,
      '& .Mui-selected': { color: fp.accent },
      '& .MuiBottomNavigationAction-root': { color: fp.text.secondary },
    },
  };
};
```

## 所有 Variants

| 模式 | 说明 |
|------|------|
| 带文字标签 | 3 个 action 时始终显示图标+文字 |
| 仅图标 | 4-5 个 action 时，未选中项只显示图标（设置 `showLabels={false}`） |
| 固定定位 | 配合 `position: 'fixed'` 固定在底部 |

```tsx
// 仅图标模式（4+ action）
<BottomNavigation showLabels={false} value={currentRoute} onChange={(_, v) => navigate(v)}>
  <BottomNavigationAction value="home" label={t('nav.home')} icon={<HomeRoundedIcon />} />
  <BottomNavigationAction value="search" label={t('nav.search')} icon={<SearchRoundedIcon />} />
  <BottomNavigationAction value="notifications" label={t('nav.notifications')} icon={<NotificationsRoundedIcon />} />
  <BottomNavigationAction value="profile" label={t('nav.profile')} icon={<PersonRoundedIcon />} />
</BottomNavigation>
```

## Props 完整参考

### BottomNavigation

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `any` | — | 当前选中值 |
| `onChange` | `(event, value) => void` | — | 选中变化回调 |
| `showLabels` | `boolean` | `false` | 是否始终显示文字标签 |
| `component` | `elementType` | `'div'` | 根元素类型 |
| `children` | `node` | — | BottomNavigationAction 子元素 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### BottomNavigationAction

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `any` | — | 该 action 的值 |
| `label` | `node` | — | 文字标签 |
| `icon` | `node` | — | 图标元素 |
| `showLabel` | `boolean` | — | 单独控制是否显示标签 |
| `disabled` | `boolean` | `false` | 禁用 |
| `component` | `elementType` | `'button'` | 根元素类型 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 受控 / 非受控

**受控模式（推荐）**：通过 `value` + `onChange` 控制选中状态，与 Foundation 路由联动。

```tsx
// 受控 —— value 来自路由状态
<BottomNavigation value={currentRoute} onChange={(_, v) => navigate(v)}>
```

**非受控模式**：不传 `value`，组件内部管理状态（不推荐，无法与路由同步）。

## 与 Foundation 路由集成

```tsx
const { currentRoute, navigate } = useRouter();

<BottomNavigation
  value={currentRoute}
  onChange={(_, newValue) => navigate(newValue)}
>
  {routes
    .filter(r => r.showInBottomNav)
    .map(route => (
      <BottomNavigationAction
        key={route.id}
        value={route.id}
        label={t(route.labelKey)}
        icon={route.icon}
      />
    ))}
</BottomNavigation>
```

## 无障碍 (a11y)

- 每个 `BottomNavigationAction` 自动渲染为 `<button>`，可键盘聚焦
- `label` 同时作为 `aria-label`；如果隐藏了 label，需手动添加 `aria-label={t('...')}`
- 选中项自动获得 `aria-selected` 属性
- 使用 Tab 键在 action 间切换

## Foundation 约束

1. **配色**：选中色用 `fp.accent`，未选中用 `fp.text.secondary`，背景用 `fp.bg.base`
2. **圆角**：BottomNavigation 本身无圆角（贴底）
3. **图标**：只用 `*Rounded` 系列
4. **i18n**：`label` 必须走 `t('key')`
5. **路由**：`onChange` 调用 `navigate(id)`，不做 URL 跳转
6. **样式**：复杂样式抽到 `styles.ts` 工厂函数
