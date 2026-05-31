# Tabs 选项卡

## Import

```tsx
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabScrollButton from '@mui/material/TabScrollButton';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useRouter } from '@/shared/hooks/useRouter';
import { useT } from '@/i18n';
import { tabsStyles } from './AppTabs.styles';

export const AppTabs = () => {
  const theme = useTheme();
  const styles = tabsStyles(theme);
  const { currentRoute, navigate } = useRouter();
  const { t } = useT();

  return (
    <Box sx={styles.root}>
      <Tabs
        value={currentRoute}
        onChange={(_, newValue) => navigate(newValue)}
        aria-label={t('nav.tabs')}
        sx={styles.tabs}
      >
        <Tab value="home" label={t('nav.home')} icon={<HomeRoundedIcon />} iconPosition="start" />
        <Tab value="settings" label={t('nav.settings')} icon={<SettingsRoundedIcon />} iconPosition="start" />
      </Tabs>
    </Box>
  );
};
```

**styles.ts 工厂：**

```tsx
// AppTabs.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const tabsStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      borderBottom: `1px solid ${fp.divider}`,
    },
    tabs: {
      '& .MuiTab-root': {
        color: fp.text.secondary,
        textTransform: 'none',
        minHeight: 48,
        '&.Mui-selected': { color: fp.accent },
      },
      '& .MuiTabs-indicator': {
        backgroundColor: fp.accent,
      },
    },
  };
};
```

## 所有 Variants

### 基本 Tabs

```tsx
<Tabs value={value} onChange={handleChange}>
  <Tab label={t('tabs.one')} />
  <Tab label={t('tabs.two')} />
  <Tab label={t('tabs.three')} />
</Tabs>
```

### 带图标 Tabs

```tsx
// 图标在文字左侧
<Tab icon={<HomeRoundedIcon />} iconPosition="start" label={t('nav.home')} />

// 图标在文字上方（默认）
<Tab icon={<HomeRoundedIcon />} label={t('nav.home')} />

// 图标在文字右侧
<Tab icon={<HomeRoundedIcon />} iconPosition="end" label={t('nav.home')} />

// 图标在文字下方
<Tab icon={<HomeRoundedIcon />} iconPosition="bottom" label={t('nav.home')} />

// 仅图标
<Tab icon={<HomeRoundedIcon />} aria-label={t('nav.home')} />
```

### 可滚动 Tabs

```tsx
// 自动显示滚动按钮
<Tabs
  value={value}
  onChange={handleChange}
  variant="scrollable"
  scrollButtons="auto"
  aria-label={t('nav.scrollableTabs')}
>
  {items.map(item => (
    <Tab key={item.id} value={item.id} label={t(item.labelKey)} />
  ))}
</Tabs>
```

### 全宽 Tabs

```tsx
// 等分容器宽度
<Tabs value={value} onChange={handleChange} variant="fullWidth">
  <Tab label={t('tabs.item1')} />
  <Tab label={t('tabs.item2')} />
  <Tab label={t('tabs.item3')} />
</Tabs>
```

### 垂直 Tabs

```tsx
<Box sx={{ display: 'flex' }}>
  <Tabs
    orientation="vertical"
    value={value}
    onChange={handleChange}
    sx={{ borderRight: 1, borderColor: 'divider' }}
  >
    <Tab label={t('tabs.item1')} />
    <Tab label={t('tabs.item2')} />
  </Tabs>
  <Box sx={{ p: 2 }}>{/* TabPanel 内容 */}</Box>
</Box>
```

### 居中 Tabs

```tsx
<Tabs value={value} onChange={handleChange} centered>
  <Tab label={t('tabs.item1')} />
  <Tab label={t('tabs.item2')} />
</Tabs>
```

### 禁用某个 Tab

```tsx
<Tabs value={value} onChange={handleChange}>
  <Tab label={t('tabs.active')} />
  <Tab label={t('tabs.disabled')} disabled />
  <Tab label={t('tabs.active2')} />
</Tabs>
```

## 本地状态 Tabs（非路由）

当 Tabs 用于页面内区域切换而非路由导航时，使用本地 state：

```tsx
const [tabValue, setTabValue] = useState(0);

<Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
  <Tab label={t('detail.overview')} />
  <Tab label={t('detail.history')} />
  <Tab label={t('detail.comments')} />
</Tabs>

{tabValue === 0 && <OverviewPanel />}
{tabValue === 1 && <HistoryPanel />}
{tabValue === 2 && <CommentsPanel />}
```

## Props 完整参考

### Tabs

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `any` | — | 当前选中 Tab 的值 |
| `onChange` | `(event, value) => void` | — | 选中变化回调 |
| `variant` | `'standard' \| 'scrollable' \| 'fullWidth'` | `'standard'` | 布局模式 |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
| `centered` | `boolean` | `false` | 居中对齐（仅 standard） |
| `scrollButtons` | `'auto' \| true \| false` | `'auto'` | 滚动按钮显示策略 |
| `allowScrollButtonsMobile` | `boolean` | `false` | 移动端也显示滚动按钮 |
| `indicatorColor` | `'primary' \| 'secondary'` | `'primary'` | 指示器颜色 |
| `textColor` | `'primary' \| 'secondary' \| 'inherit'` | `'primary'` | 文字颜色 |
| `TabIndicatorProps` | `object` | — | 传递给指示器的 props |
| `TabScrollButtonComponent` | `elementType` | `TabScrollButton` | 自定义滚动按钮组件 |
| `visibleScrollbar` | `boolean` | `false` | 显示滚动条 |
| `action` | `ref` | — | 暴露 `updateIndicator` / `updateScrollButtons` |
| `selectionFollowsFocus` | `boolean` | `false` | 焦点移动时自动选中 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

### Tab

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `any` | — | Tab 的值（不传则用索引） |
| `label` | `node` | — | 文字标签 |
| `icon` | `node` | — | 图标元素 |
| `iconPosition` | `'start' \| 'end' \| 'top' \| 'bottom'` | `'top'` | 图标位置 |
| `disabled` | `boolean` | `false` | 禁用 |
| `wrapped` | `boolean` | `false` | 允许文字换行 |
| `disableRipple` | `boolean` | `false` | 禁用涟漪效果 |
| `component` | `elementType` | `'div'` | 根元素类型 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 受控 / 非受控

**受控模式（推荐）**：通过 `value` + `onChange` 控制。

```tsx
// 路由联动
const { currentRoute, navigate } = useRouter();
<Tabs value={currentRoute} onChange={(_, v) => navigate(v)}>

// 本地状态
const [value, setValue] = useState(0);
<Tabs value={value} onChange={(_, v) => setValue(v)}>
```

**非受控模式**：不传 `value`，组件内部管理（不推荐）。

## 无障碍 (a11y)

- Tabs 容器自动获得 `role="tablist"`
- 每个 Tab 获得 `role="tab"` + `aria-selected`
- 使用方向键在 Tab 间切换焦点
- TabPanel 需手动添加 `role="tabpanel"` + `aria-labelledby`
- 仅图标 Tab **必须**提供 `aria-label={t('...')}`
- 推荐关联模式：

```tsx
<Tab id="tab-0" aria-controls="tabpanel-0" label={t('tabs.first')} />
// ...
<Box role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0">
  {/* 内容 */}
</Box>
```

## Foundation 约束

⚠️ **本项目特有约束：**

1. **配色**：选中色用 `fp.accent`，未选中用 `fp.text.secondary`，指示器用 `fp.accent`，底边框用 `fp.divider`
2. **圆角**：Tab 本身无圆角
3. **图标**：只用 `*Rounded` 系列，推荐 `iconPosition="start"`
4. **i18n**：`label` 必须走 `t('key')`，`aria-label` 也走 `t()`
5. **路由**：页面级 Tabs 的 `value` 对应 route id，`onChange` 调用 `navigate(id)`
6. **本地 Tabs**：页面内区域切换用数字索引或字符串常量，不走路由
7. **textTransform**：设为 `'none'`，不要全大写
8. **样式**：复杂样式抽到 `styles.ts` 工厂函数
