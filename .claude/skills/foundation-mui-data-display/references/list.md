# List 全家族

## Import

```tsx
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
// 或
import {
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, ListSubheader,
} from '@mui/material';
```

## 基础用法（Foundation 模式）

List 是 Foundation Sidebar（ChannelList）的核心组件。

```tsx
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeRounded from '@mui/icons-material/HomeRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import { useT } from '@/i18n';
import { listStyles } from './ChannelList.styles';

function ChannelList({ activeId, onNavigate }) {
  const theme = useTheme();
  const t = useT();
  const styles = listStyles(theme);

  return (
    <List sx={styles.root} aria-label={t('sidebar.channels')}>
      <ListItemButton
        selected={activeId === 'home'}
        onClick={() => onNavigate('home')}
        sx={styles.item}
      >
        <ListItemIcon sx={styles.icon}>
          <HomeRounded />
        </ListItemIcon>
        <ListItemText primary={t('nav.home')} />
      </ListItemButton>

      <ListItemButton
        selected={activeId === 'settings'}
        onClick={() => onNavigate('settings')}
        sx={styles.item}
      >
        <ListItemIcon sx={styles.icon}>
          <SettingsRounded />
        </ListItemIcon>
        <ListItemText primary={t('nav.settings')} />
      </ListItemButton>
    </List>
  );
}
```

样式工厂：

```tsx
// ChannelList.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const listStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      py: 1,
      px: 1,
    },
    item: {
      borderRadius: 1, // 8px（theme.shape.borderRadius 倍数）
      mb: 0.25,
      color: fp.text.secondary,
      '&:hover': {
        bgcolor: fp.bg.hover,
      },
      '&.Mui-selected': {
        bgcolor: fp.bg.active,
        color: fp.text.primary,
        '&:hover': {
          bgcolor: fp.bg.active,
        },
      },
    },
    icon: {
      color: 'inherit',
      minWidth: 36,
    },
  };
};
```

## 组件层级关系

```
List
├── ListSubheader        (分组标题)
├── ListItem             (静态列表项容器)
│   ├── ListItemButton   (可交互的列表项)
│   │   ├── ListItemIcon (左侧图标)
│   │   ├── ListItemText (主/副文本)
│   │   └── ListItemSecondaryAction (右侧操作)
│   └── ...
└── Divider component="li" (分隔线)
```

## 所有用法

### 简单列表

```tsx
<List>
  <ListItem>
    <ListItemText primary={t('item.1')} />
  </ListItem>
  <ListItem>
    <ListItemText primary={t('item.2')} />
  </ListItem>
</List>
```

### 可交互列表（Foundation 主要用法）

```tsx
<List>
  <ListItemButton onClick={handleClick}>
    <ListItemIcon><InboxRounded /></ListItemIcon>
    <ListItemText primary={t('inbox')} />
  </ListItemButton>
</List>
```

### 带副文本

```tsx
<ListItemButton>
  <ListItemIcon><PersonRounded /></ListItemIcon>
  <ListItemText
    primary={t('user.name')}
    secondary={t('user.status.online')}
  />
</ListItemButton>
```

### 带分组标题

```tsx
<List
  subheader={
    <ListSubheader sx={styles.subheader}>
      {t('list.group.channels')}
    </ListSubheader>
  }
>
  <ListItemButton sx={styles.item}>
    <ListItemText primary={t('channel.general')} />
  </ListItemButton>
</List>
```

ListSubheader 样式：

```tsx
subheader: {
  bgcolor: 'transparent',
  color: fp.text.muted,
  fontSize: '0.6875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  lineHeight: '1.2rem',
  px: 2,
  py: 0.5,
},
```

### 嵌套列表（可折叠）

```tsx
import Collapse from '@mui/material/Collapse';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';

function NestedList() {
  const [open, setOpen] = useState(true);

  return (
    <List>
      <ListItemButton onClick={() => setOpen(!open)}>
        <ListItemIcon><FolderRounded /></ListItemIcon>
        <ListItemText primary={t('category.name')} />
        {open ? <ExpandLessRounded /> : <ExpandMoreRounded />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4, ...styles.item }}>
            <ListItemText primary={t('subcategory.item')} />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
}
```

### 带右侧操作

```tsx
import IconButton from '@mui/material/IconButton';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';

<ListItem
  secondaryAction={
    <IconButton edge="end" aria-label={t('list.item.more')}>
      <MoreVertRounded />
    </IconButton>
  }
>
  <ListItemButton>
    <ListItemIcon><DescriptionRounded /></ListItemIcon>
    <ListItemText primary={t('document.name')} />
  </ListItemButton>
</ListItem>
```

### Dense 模式（紧凑）

```tsx
<List dense>
  <ListItemButton>
    <ListItemText primary={t('compact.item')} />
  </ListItemButton>
</List>
```

## Props 完整参考

### List Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| children | `ReactNode` | — | 列表项 |
| dense | `boolean` | `false` | 紧凑模式（减少 padding） |
| disablePadding | `boolean` | `false` | 移除上下 padding |
| subheader | `ReactNode` | — | 列表头部（ListSubheader） |
| component | `ElementType` | `'ul'` | 根元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### ListItem Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| alignItems | `'flex-start'\|'center'` | `'center'` | 垂直对齐 |
| disableGutters | `boolean` | `false` | 移除左右 padding |
| disablePadding | `boolean` | `false` | 移除所有 padding |
| divider | `boolean` | `false` | 底部显示分隔线 |
| secondaryAction | `ReactNode` | — | 右侧操作区 |
| component | `ElementType` | `'li'` | 根元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### ListItemButton Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| selected | `boolean` | `false` | 选中状态 |
| disabled | `boolean` | `false` | 禁用状态 |
| dense | `boolean` | — | 紧凑模式（继承 List） |
| disableGutters | `boolean` | `false` | 移除左右 padding |
| alignItems | `'flex-start'\|'center'` | `'center'` | 垂直对齐 |
| autoFocus | `boolean` | `false` | 自动聚焦 |
| divider | `boolean` | `false` | 底部分隔线 |
| onClick | `() => void` | — | 点击回调 |
| component | `ElementType` | `'div'` | 根元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### ListItemIcon Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| children | `ReactNode` | — | 图标元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### ListItemText Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| primary | `ReactNode` | — | 主文本 |
| secondary | `ReactNode` | — | 副文本 |
| primaryTypographyProps | `TypographyProps` | — | 主文本 Typography 属性 |
| secondaryTypographyProps | `TypographyProps` | — | 副文本 Typography 属性 |
| inset | `boolean` | `false` | 无图标时保持缩进对齐 |
| disableTypography | `boolean` | `false` | 不包裹 Typography |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### ListSubheader Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| children | `ReactNode` | — | 标题文本 |
| disableSticky | `boolean` | `false` | 禁用粘性定位 |
| disableGutters | `boolean` | `false` | 移除左右 padding |
| inset | `boolean` | `false` | 缩进对齐 |
| color | `'default'\|'primary'\|'inherit'` | `'default'` | 颜色（Foundation 用 sx） |
| component | `ElementType` | `'li'` | 根元素 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## Foundation Sidebar 完整示例

```tsx
// 这是 Foundation 项目 ChannelList 的典型结构
function ChannelList() {
  const theme = useTheme();
  const t = useT();
  const { currentRoute, navigate } = useRouter();
  const styles = listStyles(theme);

  const routes = [
    { id: 'home', icon: HomeRounded, labelKey: 'nav.home' },
    { id: 'settings', icon: SettingsRounded, labelKey: 'nav.settings' },
  ];

  return (
    <List
      sx={styles.root}
      component="nav"
      aria-label={t('sidebar.navigation')}
    >
      {routes.map(({ id, icon: Icon, labelKey }) => (
        <ListItemButton
          key={id}
          selected={currentRoute === id}
          onClick={() => navigate(id)}
          sx={styles.item}
        >
          <ListItemIcon sx={styles.icon}>
            <Icon />
          </ListItemIcon>
          <ListItemText primary={t(labelKey)} />
        </ListItemButton>
      ))}
    </List>
  );
}
```

## 无障碍 (a11y)

- List 使用 `component="nav"` + `aria-label` 标识导航区域
- ListItemButton 自动获得 `role="button"` 和键盘支持
- `selected` 状态自动设置 `aria-selected`
- ListSubheader 自动关联为列表的 `aria-labelledby`
- 嵌套列表使用 `aria-expanded` 标识展开状态

```tsx
<List component="nav" aria-label={t('sidebar.main.nav')}>
  <ListItemButton
    selected={isActive}
    aria-current={isActive ? 'page' : undefined}
  >
    {/* ... */}
  </ListItemButton>
</List>
```

## Foundation 约束

⚠️ **配色**：`selected` 和 `hover` 状态颜色通过 sx 的 `'&.Mui-selected'` / `'&:hover'` 设置，只从 `fp.bg.active` / `fp.bg.hover` 取值。

⚠️ **圆角**：ListItemButton 设置 `borderRadius: 1`（8px），匹配 Foundation 方圆设计。

⚠️ **图标**：ListItemIcon 中只用 `*Rounded` 系列图标。

⚠️ **i18n**：`primary`、`secondary`、`aria-label` 全部走 `t('key')`。

⚠️ **路由**：点击事件调用 `useRouter().navigate(id)`，不用 react-router 的 Link/NavLink。

⚠️ **ListSubheader**：设置 `bgcolor: 'transparent'` 避免遮挡滚动内容。

