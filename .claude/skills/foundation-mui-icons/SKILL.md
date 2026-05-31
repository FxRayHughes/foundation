---
name: foundation-mui-icons
description: Foundation 项目 @mui/icons-material 图标库详尽用法指南。Icon 铁律：只用 *Rounded 系列，禁止 emoji/Unicode/第三方 icon 包。
---

# @mui/icons-material 使用指南

## 何时使用本 SKILL

- 需要在 UI 中添加图标时
- 选择合适图标变体时
- 在 Button / IconButton / ListItem / Input / Chip 等组件中嵌入图标时
- 封装自定义 SVG 图标时
- 处理图标无障碍属性时

## 铁律摘要

1. **只用 `*Rounded` 系列**——匹配方圆设计语言（按钮 borderRadius: 6，容器 borderRadius: 8）
2. **禁止 emoji / Unicode 符号 / 第三方 icon 包**（react-icons、lucide、heroicons 等）
3. **Default import**——`import XxxRoundedIcon from '@mui/icons-material/XxxRounded'`，保证 tree-shaking
4. **配色只从 theme.palette.foundation.* 取**——禁止硬编码 hex
5. **纯图标按钮必须有 aria-label**——走 `t('key')` i18n
6. **自定义 SVG 图标统一放 `src/components/icons/`**

---

## 包概述

`@mui/icons-material` 提供 5000+ Material Design 图标的 React 组件封装，每个图标有 **5 种风格变体**：

| 风格 | 后缀 | 示例 | 说明 |
|------|------|------|------|
| Filled | 无后缀 | `Delete` | 实心填充（默认） |
| Outlined | `Outlined` | `DeleteOutlined` | 线框轮廓 |
| **Rounded** | **`Rounded`** | **`DeleteRounded`** | **圆角（Foundation 唯一允许）** |
| Sharp | `Sharp` | `DeleteSharp` | 直角锐利 |
| Two Tone | `TwoTone` | `DeleteTwoTone` | 双色调 |

每个图标组件本质是一个 `<SvgIcon>` 包裹的 `<svg>` 元素，支持 MUI 的 `sx` / `color` / `fontSize` 等标准 props。

---

## Foundation Icon 铁律

> **只允许使用 `*Rounded` 系列图标**，以匹配项目的方圆设计语言。

```tsx
// ✅ 正确：使用 *Rounded 系列
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';

// ❌ 禁止：非 Rounded 系列
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';

// ❌ 禁止：第三方 icon 包
import { FaTrash } from 'react-icons/fa';
import { Trash2 } from 'lucide-react';

// ❌ 禁止：emoji / Unicode 符号当图标
<span>🗑️</span>
<span>✓</span>
```

---

## Import 方式

### 推荐：Default Import（tree-shaking 友好）

```tsx
// ✅ 每个图标单独 import，Vite/webpack 只打包用到的图标
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
```

### 不推荐：Named Import（会打包整个包）

```tsx
// ❌ 从顶层桶文件导入，开发模式慢、生产包体积大
import { SearchRounded, HomeRounded } from '@mui/icons-material';
```

### 命名约定

导入后变量名统一加 `Icon` 后缀，便于在 JSX 中区分组件与图标：

```tsx
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
```

---

## 尺寸规则

| `fontSize` 值 | 实际尺寸 | 适用场景 |
|---------------|---------|----------|
| `"small"` | 20px | 行内文本、按钮内、表格行操作 |
| `"medium"` | 24px | 默认尺寸，大多数场景 |
| `"large"` | 35px | 状态卡片、空状态插图 |
| `"inherit"` | 继承父元素 font-size | 需要跟随文字大小时 |

```tsx
// 标准尺寸
<DeleteRoundedIcon fontSize="small" />
<DeleteRoundedIcon />                    {/* 默认 medium */}
<DeleteRoundedIcon fontSize="large" />

// 自定义尺寸：用 sx，不用 style
<DeleteRoundedIcon sx={{ fontSize: 48 }} />

// ❌ 禁止：内联 style
<DeleteRoundedIcon style={{ fontSize: 48 }} />
```

---

## 颜色规则

### 基本原则

- 默认使用 `color="inherit"`，图标颜色跟随父元素 `color`
- 状态色从 `theme.palette.foundation.*` 取，**禁止硬编码 hex**
- 可用的 `color` prop 值：`"inherit"` | `"primary"` | `"secondary"` | `"action"` | `"disabled"` | `"error"`

```tsx
// ✅ 跟随父元素颜色（默认行为）
<DeleteRoundedIcon color="inherit" />

// ✅ 使用 MUI 语义色
<ErrorRoundedIcon color="error" />
<CheckCircleRoundedIcon color="primary" />

// ✅ 使用 Foundation 主题色（通过 sx）
<WarningRoundedIcon sx={{ color: (theme) => theme.palette.foundation.status.warning }} />
<DeleteRoundedIcon sx={{ color: (theme) => theme.palette.foundation.status.danger }} />

// ❌ 禁止：硬编码颜色值
<DeleteRoundedIcon sx={{ color: '#ff0000' }} />
<DeleteRoundedIcon style={{ color: 'red' }} />
```

---

## 在各组件中使用

### Button（带图标的按钮）

```tsx
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

// 左侧图标
<Button startIcon={<SearchRoundedIcon />}>{t('actions.search')}</Button>

// 右侧图标
<Button endIcon={<SendRoundedIcon />}>{t('actions.send')}</Button>
```

### IconButton（纯图标按钮）

纯图标按钮**必须**提供 `aria-label`，否则屏幕阅读器无法识别用途。

```tsx
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// ✅ 必须有 aria-label（走 i18n）
<IconButton aria-label={t('actions.delete')}>
  <DeleteRoundedIcon />
</IconButton>

<IconButton aria-label={t('actions.close')} size="small">
  <CloseRoundedIcon fontSize="small" />
</IconButton>

// ❌ 禁止：无 aria-label 的 IconButton
<IconButton><DeleteRoundedIcon /></IconButton>
```

### ListItemIcon（列表项图标）

```tsx
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

<List>
  <ListItem>
    <ListItemIcon><PersonRoundedIcon /></ListItemIcon>
    <ListItemText primary={t('nav.profile')} />
  </ListItem>
  <ListItem>
    <ListItemIcon><SettingsRoundedIcon /></ListItemIcon>
    <ListItemText primary={t('nav.settings')} />
  </ListItem>
</List>
```

### InputAdornment（输入框装饰图标）

```tsx
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

// 前置图标
<TextField
  placeholder={t('search.placeholder')}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchRoundedIcon />
      </InputAdornment>
    ),
  }}
/>

// 后置图标（如密码可见性切换）
<TextField
  type="password"
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton aria-label={t('actions.toggleVisibility')}>
          <VisibilityRoundedIcon />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>
```

### Chip（标签图标）

```tsx
import FaceRoundedIcon from '@mui/icons-material/FaceRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';

// 前置图标
<Chip icon={<FaceRoundedIcon />} label={t('tags.user')} />

// 删除图标（默认是 CancelRounded，可自定义）
<Chip
  label={t('tags.selected')}
  onDelete={handleDelete}
  deleteIcon={<CancelRoundedIcon />}
/>

// 带自定义删除图标
<Chip
  icon={<DoneRoundedIcon />}
  label={t('tags.completed')}
  color="primary"
  variant="outlined"
/>
```

---

## 搜索选型流程

当需要找到合适的图标时，按以下流程操作：

1. **打开 MUI Icons 搜索页面**：https://mui.com/material-ui/material-icons/
2. **输入英文关键词**搜索（如 `delete`、`settings`、`folder`、`download`）
3. **切换到 Rounded 标签页**筛选 Rounded 变体
4. **点击图标**查看组件名（如 `DeleteRounded`）
5. **在代码中使用**：`import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'`

### 常用图标速查表

| 用途 | 图标组件 |
|------|---------|
| 搜索 | `SearchRoundedIcon` |
| 设置 | `SettingsRoundedIcon` |
| 关闭 | `CloseRoundedIcon` |
| 删除 | `DeleteRoundedIcon` |
| 编辑 | `EditRoundedIcon` |
| 添加 | `AddRoundedIcon` |
| 返回 | `ArrowBackRoundedIcon` |
| 菜单 | `MenuRoundedIcon` |
| 主页 | `HomeRoundedIcon` |
| 用户 | `PersonRoundedIcon` |
| 文件夹 | `FolderRoundedIcon` / `FolderOpenRoundedIcon` |
| 下载 | `DownloadRoundedIcon` |
| 上传 | `UploadRoundedIcon` |
| 刷新 | `RefreshRoundedIcon` |
| 展开 | `ExpandMoreRoundedIcon` / `ExpandLessRoundedIcon` |
| 更多 | `MoreVertRoundedIcon` / `MoreHorizRoundedIcon` |
| 复制 | `ContentCopyRoundedIcon` |
| 保存 | `SaveRoundedIcon` |
| 警告 | `WarningRoundedIcon` |
| 错误 | `ErrorRoundedIcon` |
| 成功 | `CheckCircleRoundedIcon` |
| 信息 | `InfoRoundedIcon` |

---

## 自定义 SVG Icon

当 MUI 图标库中没有合适的图标时，可以用 `SvgIcon` 封装自定义 SVG。

### 存放位置

自定义图标统一放在 `frontend/src/components/icons/` 目录下，每个图标一个文件。

### 标准封装方式

```tsx
// frontend/src/components/icons/CustomLogoIcon.tsx
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export const CustomLogoIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
  </SvgIcon>
);
```

### 使用方式

```tsx
import { CustomLogoIcon } from '@/components/icons/CustomLogoIcon';

// 与 MUI 图标完全一致的 API
<CustomLogoIcon fontSize="large" color="primary" />
<CustomLogoIcon sx={{ fontSize: 48, color: (theme) => theme.palette.foundation.accent }} />
```

### 注意事项

- `viewBox` 必须与原始 SVG 的 viewBox 一致（通常是 `"0 0 24 24"`）
- 移除 SVG 中的 `fill` 属性，让 MUI 通过 `currentColor` 控制颜色
- 移除 `width` / `height` 属性，由 `fontSize` prop 控制尺寸
- 如果 SVG 有多个 `<path>`，全部放在 `<SvgIcon>` 内即可
- 导出使用 named export，文件名与组件名一致

---

## SvgIcon 组件详解

`SvgIcon` 是所有 MUI 图标的底层组件，它：

- 将 `<svg>` 包装为 MUI 组件，支持 `sx` / `color` / `fontSize` 等 props
- 默认 `viewBox="0 0 24 24"`、`fill="currentColor"`
- 自动应用 `aria-hidden="true"`（装饰性图标）

```tsx
import SvgIcon from '@mui/material/SvgIcon';

// 直接使用（不推荐，建议封装为独立组件）
<SvgIcon viewBox="0 0 24 24" fontSize="small">
  <path d="M..." />
</SvgIcon>
```

---

## Icon 组件（Font Icon）

> **不推荐在 Foundation 项目中使用。** 仅作了解。

`Icon` 组件用于渲染 font icon（如 Material Icons Web Font），需要额外加载字体文件：

```tsx
import Icon from '@mui/material/Icon';

// 需要在 index.html 中引入 Material Icons 字体
<Icon>delete</Icon>
<Icon fontSize="small">settings</Icon>
```

**不推荐原因：**

- 需要加载额外的字体文件（~200KB+）
- 无法 tree-shake，所有图标都在字体中
- 渲染依赖网络加载，可能出现 FOUT（Flash of Unstyled Text）
- 不支持自定义 SVG 图标
- `SvgIcon` 方案更轻量、更可控

---

## 无障碍（Accessibility）

### 交互性图标（有操作含义）

放在 `IconButton` 中的图标**必须**通过按钮的 `aria-label` 提供文字描述：

```tsx
// ✅ IconButton 提供 aria-label
<IconButton aria-label={t('actions.delete')}>
  <DeleteRoundedIcon />
</IconButton>

// ✅ Button 有文字，图标自动作为装饰
<Button startIcon={<SaveRoundedIcon />}>{t('actions.save')}</Button>
```

### 装饰性图标（无操作含义）

纯装饰性图标（如列表项前的图标、状态指示器）不需要额外的无障碍标注，`SvgIcon` 默认已设置 `aria-hidden="true"`：

```tsx
// ✅ 装饰性图标，无需额外处理
<ListItemIcon><FolderRoundedIcon /></ListItemIcon>

// ✅ 状态指示器
<CheckCircleRoundedIcon color="primary" />
```

### Tooltip 中的图标

如果图标需要解释但不是按钮，用 `Tooltip` 包裹：

```tsx
import Tooltip from '@mui/material/Tooltip';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

<Tooltip title={t('help.storageInfo')}>
  <InfoRoundedIcon fontSize="small" sx={{ cursor: 'help' }} />
</Tooltip>
```

---

## 反模式汇总

| 反模式 | 正确做法 |
|--------|---------|
| `import { Delete } from '@mui/icons-material'` | `import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'` |
| 使用非 Rounded 变体 | 始终选择 `*Rounded` 后缀 |
| `<span>🗑️</span>` 当图标 | 使用对应的 MUI Icon 组件 |
| `import { FaXxx } from 'react-icons/fa'` | 使用 `@mui/icons-material` |
| `style={{ fontSize: 32 }}` | `sx={{ fontSize: 32 }}` |
| `sx={{ color: '#ff0000' }}` | `sx={{ color: (theme) => theme.palette.xxx }}` |
| `<IconButton>` 无 aria-label | 必须添加 `aria-label={t('...')}` |
| 自定义图标散落各处 | 统一放 `src/components/icons/` |
| 图标文字硬编码 | 所有人类可见文字走 `t()` |

---

## 样式工厂中使用图标

在 Foundation 的样式工厂模式中，图标颜色应从 theme 取值：

```tsx
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const myStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    iconDefault: {
      color: fp.text.secondary,
    },
    iconDanger: {
      color: fp.status.danger,
    },
    iconSuccess: {
      color: fp.status.success,
    },
    iconAccent: {
      color: fp.accent,
    },
  };
};
```

```tsx
// MyComponent.tsx
import { useTheme } from '@mui/material/styles';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { myStyles } from './MyComponent.styles';

const MyComponent = () => {
  const theme = useTheme();
  const styles = myStyles(theme);

  return (
    <>
      <DeleteRoundedIcon sx={styles.iconDanger} />
      <CheckCircleRoundedIcon sx={styles.iconSuccess} />
    </>
  );
};
```

---

## Foundation 约束总结

| 约束 | 说明 |
|------|------|
| 只用 `*Rounded` | 匹配方圆设计语言 |
| Default import | `import XxxRoundedIcon from '@mui/icons-material/XxxRounded'` |
| 变量名加 `Icon` 后缀 | `DeleteRoundedIcon`、`SettingsRoundedIcon` |
| 颜色从 theme 取 | `theme.palette.foundation.*`，禁止硬编码 hex |
| IconButton 必须 aria-label | `aria-label={t('key')}`，走 i18n |
| 装饰性图标无需 aria-label | `SvgIcon` 默认 `aria-hidden="true"` |
| 自定义图标放 `src/components/icons/` | 用 `SvgIcon` 封装，named export |
| 禁止 emoji / Unicode / 第三方包 | 只用 `@mui/icons-material` |
| 禁止 `style` prop | 用 `sx` 或样式工厂 |
