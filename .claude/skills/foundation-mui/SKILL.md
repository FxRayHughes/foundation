---
name: foundation-mui
description: Foundation 项目 MUI 9 组件库总索引。汇总全部 Foundation×MUI 铁律（配色、圆角、图标、i18n、样式工厂、对话框）、styles.ts 工厂模式标准写法、全 skill 导航索引。当使用任何 MUI 组件时首先阅读本 SKILL。
---

# Foundation × MUI 9 总索引

本 SKILL 是 Foundation 项目使用 MUI 9 组件的**唯一入口**。所有 MUI 相关开发必须遵守此处铁律，具体组件用法查阅对应子 SKILL。

## 已安装依赖

| 包 | 版本 | 用途 |
|---|---|---|
| `@mui/material` | ^9.0.1 | 核心 UI 组件库 |
| `@mui/icons-material` | ^9.0.1 | 图标库（仅用 *Rounded 系列） |
| `@mui/system` | ^7.3.11 | sx prop / styled / theme utilities |
| `@mui/x-charts` | ^9.3.0 | 图表（Pie/Bar/Line/Scatter/Gauge...） |
| `@mui/x-data-grid` | ^9.3.0 | 数据表格（DataGrid） |

**未安装（不要使用）**：`@mui/lab`、`@mui/x-date-pickers`、`@mui/x-tree-view`、`@mui/x-scheduler`

---

## Foundation × MUI 铁律

### 1. 配色铁律

**只从 `theme.palette.foundation.*` 取值，禁止硬编码十六进制色值。**

```tsx
// ✅ 正确
const fp = theme.palette.foundation;
backgroundColor: fp.bg.surface
color: fp.text.primary
borderColor: fp.divider

// ❌ 错误
backgroundColor: '#ffffff'
color: 'rgba(0,0,0,0.87)'
```

可用语义槽位：

| 槽位 | 用途 |
|------|------|
| `bg.base` | 标题栏 / 最外层 |
| `bg.sidebar` | 侧边栏 |
| `bg.content` | 主内容区 |
| `bg.surface` | 卡片 / Paper |
| `bg.elevated` | 输入框 / Tooltip 内层 |
| `bg.hover` / `bg.active` | 半透明 hover/active |
| `text.primary` / `text.secondary` / `text.muted` | 文字三级 |
| `divider` | 分隔线 |
| `accent` / `accentHover` | 品牌强调色 |
| `status.danger` / `success` / `warning` | 状态色 |

### 2. 圆角铁律

| 元素 | borderRadius |
|------|-------------|
| Button / IconButton | 6 |
| Paper / Card / 容器 | 8 |

已在主题中统一配置，**勿在 sx 中覆盖**，除非有特殊设计需求并经过确认。

### 3. 图标铁律

**只用 `@mui/icons-material` 的 `*Rounded` 系列。**

```tsx
// ✅
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

// ❌ 禁止
import DeleteIcon from '@mui/icons-material/Delete'; // 非 Rounded
import { FaTrash } from 'react-icons/fa';           // 第三方
<span>🗑️</span>                                      // emoji
```

### 4. i18n 铁律

**所有人类可见字符串走 `t('key')`**——包括：
- 按钮文字、label、placeholder、helperText
- aria-label、Tooltip title
- Dialog 标题/内容/按钮
- Snackbar 消息、Alert 内容
- 表头、空状态文案

```tsx
// ✅
<Button>{t('home.submit')}</Button>
<TextField label={t('form.name')} placeholder={t('form.namePlaceholder')} />
<Tooltip title={t('actions.delete')}><IconButton>...</IconButton></Tooltip>

// ❌
<Button>提交</Button>
<TextField label="Name" placeholder="Enter your name" />
```
### 5. 样式工厂铁律

**样式写在 `<Name>.styles.ts`，使用工厂函数模式。**

```tsx
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const myComponentStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: { backgroundColor: fp.bg.surface, borderRadius: 2 },
    title: { color: fp.text.primary, fontWeight: 600 },
    action: { color: fp.accent },
  };
};

// MyComponent.tsx
import { useTheme } from '@mui/material';
import { myComponentStyles } from './MyComponent.styles';

export const MyComponent = () => {
  const theme = useTheme();
  const styles = myComponentStyles(theme);
  return <Box sx={styles.root}>...</Box>;
};
```

**禁止在 View 中内联复杂 sx 对象**（简单的如 `sx={{ mt: 2 }}` 可以）。

### 6. 对话框铁律

**确认 / 文件操作走 `NativeDialogs`，不用 MUI Dialog 做 confirm/alert。**

```tsx
// ✅ 确认操作
const ok = await NativeDialogs.confirm({
  title: t('dialog.deleteTitle'),
  message: t('dialog.deleteMessage'),
});

// ❌ 不要用 MUI Dialog 做简单确认
<Dialog open={confirmOpen}>...</Dialog>
```

MUI Dialog **可以用于**：复杂表单、多步向导、内容预览等需要自定义 UI 的场景。

### 7. 调用链铁律

```
View (.tsx) → ViewModel hook (use<Name>.ts) → services/ → @bindings/
```

- View 和 ViewModel **都不直接 import** `@bindings/*`
- ViewModel **不持有翻译后字符串**，暴露 i18n key 给 View
- View 调 `t()` 渲染
---

## Skill 导航索引

| Skill | 覆盖组件 | 路径 |
|-------|----------|------|
| [foundation-mui-inputs](../foundation-mui-inputs/SKILL.md) | Button / TextField / Select / Checkbox / Switch / Slider / Radio / Rating / Autocomplete / ToggleButton / FAB / NumberField | 输入类 |
| [foundation-mui-data-display](../foundation-mui-data-display/SKILL.md) | Typography / Avatar / Badge / Chip / Divider / List / Table / Tooltip / Icon | 数据展示 |
| [foundation-mui-feedback](../foundation-mui-feedback/SKILL.md) | Alert / Backdrop / Dialog / Progress / Skeleton / Snackbar | 反馈 |
| [foundation-mui-surfaces](../foundation-mui-surfaces/SKILL.md) | Accordion / AppBar / Card / Paper | 容器表面 |
| [foundation-mui-navigation](../foundation-mui-navigation/SKILL.md) | BottomNav / Breadcrumbs / Drawer / Link / Menu / Pagination / SpeedDial / Stepper / Tabs | 导航 |
| [foundation-mui-layout](../foundation-mui-layout/SKILL.md) | Box / Container / Grid / Stack / ImageList | 布局 |
| [foundation-mui-utils](../foundation-mui-utils/SKILL.md) | Modal / Popover / Popper / Portal / ClickAway / CssBaseline / Transitions / useMediaQuery / NoSsr / TextareaAutosize | 工具 |
| [foundation-mui-icons](../foundation-mui-icons/SKILL.md) | @mui/icons-material 用法 / 搜索选型 / 自定义 SVG | 图标 |
| [foundation-mui-x-data-grid](../foundation-mui-x-data-grid/SKILL.md) | DataGrid 全功能（列/行/编辑/筛选/排序/分页/导出） | 数据表格 |
| [foundation-mui-x-charts](../foundation-mui-x-charts/SKILL.md) | Pie / Bar / Line / Scatter / Gauge / Sparkline / 图表定制 | 图表 |

---

## 与其他 Foundation SKILL 的关系

| SKILL | 关系 |
|-------|------|
| `foundation-theme` | 主题注册系统（preset / registry / ThemeProvider）—— 本 SKILL 聚焦**组件用法**，主题系统**不重复** |
| `foundation-i18n` | 国际化系统 —— 本 SKILL 强制所有 MUI 组件文案走 `t()` |
| `foundation-persistence` | 持久化 —— Dialog/Snackbar 等交互结果如需持久化走 SQLite |
| `foundation-utils` | Go 工具层 —— 与前端 MUI 组件无直接关系 |
