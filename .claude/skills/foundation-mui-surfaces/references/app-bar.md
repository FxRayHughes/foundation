# AppBar / Toolbar

AppBar 是固定/粘性的顶部工具栏容器。**在 Foundation 项目中，顶部标题栏由自绘 TitleBar 组件实现，AppBar 不用于窗口标题栏**。AppBar 仅在页面内部作为工具栏（搜索栏、筛选栏、操作栏）使用。

## Import

```tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
```

## 基础用法（Foundation 模式 — 页面内工具栏）

```tsx
// ContentToolbar.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const contentToolbarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    appBar: {
      backgroundColor: fp.bg.elevated,
      borderBottom: `1px solid ${fp.divider}`,
      boxShadow: 'none',
      position: 'sticky',
      top: 0,
      zIndex: theme.zIndex.appBar,
    },
    toolbar: {
      minHeight: 48,
      px: 2,
      gap: 1,
    },
    title: {
      color: fp.text.primary,
      fontWeight: 600,
      flexGrow: 1,
    },
    searchInput: {
      backgroundColor: fp.bg.surface,
      borderRadius: 1.5,
      px: 1.5,
      py: 0.5,
    },
  };
};
```

```tsx
// ContentToolbar.tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import { useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { contentToolbarStyles } from './ContentToolbar.styles';

export const ContentToolbar = () => {
  const theme = useTheme();
  const styles = contentToolbarStyles(theme);
  const { t } = useT();

  return (
    <AppBar sx={styles.appBar} color="transparent" elevation={0}>
      <Toolbar sx={styles.toolbar} variant="dense">
        <Typography sx={styles.title} variant="subtitle1">
          {t('toolbar.title')}
        </Typography>
        <IconButton size="small" aria-label={t('toolbar.search')}>
          <SearchRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" aria-label={t('toolbar.filter')}>
          <FilterListRoundedIcon fontSize="small" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
```

## 所有 Variants / Position

### position

AppBar 支持 5 种定位模式：

```tsx
{/* 固定在视口顶部（脱离文档流） */}
<AppBar position="fixed" sx={styles.appBar}>...</AppBar>

{/* 相对父容器粘性定位（推荐用于页面内工具栏） */}
<AppBar position="sticky" sx={styles.appBar}>...</AppBar>

{/* 绝对定位 */}
<AppBar position="absolute" sx={styles.appBar}>...</AppBar>

{/* 静态定位（在文档流中） */}
<AppBar position="static" sx={styles.appBar}>...</AppBar>

{/* 相对定位 */}
<AppBar position="relative" sx={styles.appBar}>...</AppBar>
```

**Foundation 推荐**：页面内工具栏用 `position="sticky"`，不用 `fixed`（避免与自绘 TitleBar 冲突）。

### color

```tsx
{/* 透明背景（Foundation 推荐，配合 sx 手动设背景色） */}
<AppBar color="transparent" elevation={0}>...</AppBar>

{/* 默认主题色（本项目不推荐） */}
<AppBar color="primary">...</AppBar>

{/* 继承父级背景 */}
<AppBar color="inherit">...</AppBar>
```

### Toolbar variant

```tsx
{/* 标准高度 (64px) */}
<Toolbar>...</Toolbar>

{/* 紧凑高度 (48px)，Foundation 推荐 */}
<Toolbar variant="dense">...</Toolbar>
```

## 典型页面内工具栏场景

### 搜索 + 筛选 + 操作

```tsx
// ListToolbar.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const listToolbarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    appBar: {
      backgroundColor: fp.bg.elevated,
      borderBottom: `1px solid ${fp.divider}`,
      boxShadow: 'none',
    },
    toolbar: { minHeight: 48, gap: 1 },
    spacer: { flexGrow: 1 },
  };
};
```

```tsx
// ListToolbar.tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';

<AppBar position="sticky" color="transparent" elevation={0} sx={styles.appBar}>
  <Toolbar variant="dense" sx={styles.toolbar}>
    <TextField
      size="small"
      placeholder={t('toolbar.searchPlaceholder')}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
    <Box sx={styles.spacer} />
    <IconButton size="small" aria-label={t('toolbar.sort')}>
      <SortRoundedIcon fontSize="small" />
    </IconButton>
    <IconButton size="small" aria-label={t('toolbar.add')}>
      <AddRoundedIcon fontSize="small" />
    </IconButton>
  </Toolbar>
</AppBar>
```

### 标签页式工具栏

```tsx
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

<AppBar position="static" color="transparent" elevation={0} sx={styles.appBar}>
  <Toolbar variant="dense" disableGutters sx={{ px: 2 }}>
    <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
      <Tab label={t('tabs.all')} />
      <Tab label={t('tabs.active')} />
      <Tab label={t('tabs.archived')} />
    </Tabs>
  </Toolbar>
</AppBar>
```

### 面包屑式工具栏

```tsx
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

<AppBar position="static" color="transparent" elevation={0} sx={styles.appBar}>
  <Toolbar variant="dense" sx={styles.toolbar}>
    <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
      <Link underline="hover" color="inherit" onClick={() => navigate('home')}>
        {t('nav.home')}
      </Link>
      <Link underline="hover" color="inherit" onClick={() => navigate('settings')}>
        {t('nav.settings')}
      </Link>
      <Typography color="text.primary">{t('nav.current')}</Typography>
    </Breadcrumbs>
  </Toolbar>
</AppBar>
```

## Props 完整参考

### AppBar

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 内容（通常是 Toolbar） |
| `classes` | `object` | — | 覆盖内部 CSS class |
| `color` | `'default' \| 'inherit' \| 'primary' \| 'secondary' \| 'transparent' \| 'error' \| 'info' \| 'success' \| 'warning'` | `'primary'` | 背景色主题 |
| `enableColorOnDark` | `bool` | `false` | 暗色模式下是否保留 color 设置 |
| `elevation` | `number` (0-24) | `4` | 阴影深度 |
| `position` | `'fixed' \| 'absolute' \| 'sticky' \| 'static' \| 'relative'` | `'fixed'` | 定位模式 |
| `sx` | `SxProps<Theme>` | — | MUI system 样式 |

### Toolbar

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 工具栏内容 |
| `classes` | `object` | — | 覆盖内部 CSS class |
| `component` | `elementType` | `'div'` | 根元素类型 |
| `disableGutters` | `bool` | `false` | 移除左右 padding |
| `sx` | `SxProps<Theme>` | — | 样式 |
| `variant` | `'dense' \| 'regular'` | `'regular'` | 高度模式（dense=48px, regular=64px） |

## 无障碍 (a11y)

- AppBar 默认渲染为 `<header>` 元素，自带 `role="banner"` 语义。
- 如果页面有多个 AppBar（如页面内工具栏），应改为 `component="nav"` 或 `component="div"` 并添加 `role`：

```tsx
{/* 页面内工具栏，不是全局 header */}
<AppBar component="div" role="toolbar" aria-label={t('toolbar.ariaLabel')} ...>
  <Toolbar>...</Toolbar>
</AppBar>
```

- 工具栏内的 IconButton 必须有 `aria-label`：

```tsx
<IconButton aria-label={t('toolbar.search')}>
  <SearchRoundedIcon />
</IconButton>
```

- 使用 `position="fixed"` 时，需要在下方添加等高占位避免内容被遮挡：

```tsx
<AppBar position="fixed">...</AppBar>
<Toolbar /> {/* 占位 */}
```

## Foundation 约束

| 约束 | 说明 |
|------|------|
| ⚠️ 不用于窗口标题栏 | 窗口标题栏由 `src/components/TitleBar/` 自绘实现 |
| ⚠️ 推荐 position | 页面内工具栏用 `sticky` 或 `static`，不用 `fixed` |
| ⚠️ 推荐 color | 使用 `color="transparent"` + sx 手动设背景色 |
| ⚠️ elevation | 始终 `elevation={0}`，用 borderBottom 代替阴影 |
| ⚠️ Toolbar variant | 推荐 `variant="dense"`（48px），节省垂直空间 |
| 背景色 | 使用 `fp.bg.elevated`，不用 MUI 默认的 primary 色 |
| 分隔线 | 用 `borderBottom: 1px solid ${fp.divider}` 代替 boxShadow |
| 禁止 | 硬编码 hex、使用 `position="fixed"`（与 TitleBar 冲突）、省略 aria-label |
