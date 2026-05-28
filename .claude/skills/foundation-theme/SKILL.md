---
name: foundation-theme
description: Foundation 脚手架的主题注册系统使用指南。说明如何注册新主题、切换主题、扩展调色板，以及如何在组件里安全地消费主题色。
---

# Foundation 主题注册系统

Foundation 脚手架内置一套**注册式主题系统**，建立在 MUI Theme 之上：

- 调色板使用语义槽位（`bg.surface` / `text.primary` / `accent` ...），而不是裸十六进制色值；
- 主题以**预设（preset）**形式注册到 `themeRegistry`，可在运行时增删切换；
- `<FoundationThemeProvider>` 把当前预设编译成 MUI Theme 注入下游，组件继续用 MUI 的 `sx` / `useTheme()` 即可。

> 默认注册了 `foundation-light`（白色，默认）与 `foundation-dark`（暗色）两个预设。

---

## 1. 文件结构

```
src/styles/themes/
├── types.ts              # FoundationPalette / FoundationThemePreset 接口
├── buildMuiTheme.ts      # preset → MUI Theme 编译器（含组件覆盖）
├── registry.ts           # 注册中心单例（register / get / list / subscribe）
├── ThemeProvider.tsx     # <FoundationThemeProvider> + useFoundationTheme
├── presets/
│   ├── light.ts          # 默认白色预设
│   └── dark.ts           # 暗色预设
└── index.ts              # 对外出口（含 registerFoundationThemes 启动函数）
```

---

## 2. 启动注册

`App.tsx` 顶部调用一次：

```tsx
import { FoundationThemeProvider, registerFoundationThemes } from '@/styles/themes';

registerFoundationThemes(); // 幂等：内置 light + dark

export const App = () => (
  <FoundationThemeProvider>
    {/* ... */}
  </FoundationThemeProvider>
);
```

`registerFoundationThemes()` 内部会把 `light` 标记为默认主题。如果你想换默认主题，**不要**直接改这个函数——注册一个新主题并指定 `default: true`（见第 4 节）。

---

## 3. 在组件里消费主题色

**铁律：** 组件样式禁止硬编码十六进制。所有颜色必须从 `theme.palette.foundation` 取。

推荐：在 `<Name>.styles.ts` 写工厂函数：

```ts
// MyCard.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const myCardStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation; // ← 语义调色板
  return {
    root: {
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      color: fp.text.primary,
      borderRadius: 1,
    },
    accent: { color: fp.accent },
  };
};
```

```tsx
// MyCard.tsx
import { useTheme } from '@mui/material';
import { myCardStyles } from './MyCard.styles';

export const MyCard = () => {
  const theme = useTheme();
  const styles = myCardStyles(theme);
  return <Box sx={styles.root}>...</Box>;
};
```

可用槽位见 `FoundationPalette`：

| 槽位 | 用途 |
|------|------|
| `bg.base` | 标题栏 / 最外层 |
| `bg.sidebar` | 侧边栏 |
| `bg.content` | 主内容区 |
| `bg.surface` | 卡片 / Paper |
| `bg.elevated` | 输入框 / Tooltip 内层 |
| `bg.hover` / `bg.active` | 半透明 hover/active 覆盖 |
| `text.primary` / `text.secondary` / `text.muted` | 文字三级 |
| `divider` | 分隔线 |
| `accent` / `accentHover` | 品牌强调色（按钮主色） |
| `status.danger` / `success` / `warning` | 状态色 |

---

## 4. 注册自定义主题

```ts
// src/styles/themes/presets/brand.ts
import type { FoundationThemePreset } from '../types';

export const brandPreset: FoundationThemePreset = {
  name: 'brand-purple',
  label: 'Brand · Purple',
  mode: 'light',
  palette: {
    bg: {
      base: '#f4f3ff',
      sidebar: '#ffffff',
      content: '#ffffff',
      surface: '#ffffff',
      elevated: '#faf9ff',
      hover: 'rgba(99, 102, 241, 0.06)',
      active: 'rgba(99, 102, 241, 0.12)',
    },
    text: { primary: '#1e1b4b', secondary: '#475569', muted: '#94a3b8' },
    divider: 'rgba(30, 27, 75, 0.08)',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    status: { danger: '#dc2626', success: '#16a34a', warning: '#d97706' },
  },
};
```

注册（推荐在应用启动时和 `registerFoundationThemes()` 一起）：

```ts
import { themeRegistry } from '@/styles/themes';
import { brandPreset } from '@/styles/themes/presets/brand';

themeRegistry.register(brandPreset, { default: true }); // 设为默认
```

> `register` 是幂等的：相同 `name` 会覆盖。如果不指定 `default`，注册的第一个主题自动成为默认。

---

## 5. 运行时切换主题

任意组件里：

```tsx
import { useFoundationTheme } from '@/styles/themes';

const ThemeSwitcher = () => {
  const { current, available, setTheme } = useFoundationTheme();
  return (
    <select value={current.name} onChange={(e) => setTheme(e.target.value)}>
      {available.map((p) => (
        <option key={p.name} value={p.name}>{p.label}</option>
      ))}
    </select>
  );
};
```

`<FoundationThemeProvider>` 订阅了 `themeRegistry.subscribe`，新增 / 移除主题时 `available` 列表会自动刷新。

---

## 6. 进一步覆盖 MUI 选项

`FoundationThemePreset.muiOverrides` 字段会被 `createTheme(base, muiOverrides)` 深合并：

```ts
export const denseLight: FoundationThemePreset = {
  ...lightPreset,
  name: 'foundation-light-dense',
  label: 'Light · Dense',
  muiOverrides: {
    components: {
      MuiButton: { defaultProps: { size: 'small' } },
    },
    typography: { fontSize: 13 },
  },
};
```

---

## 7. 反例

❌ 在组件里直接写颜色：

```tsx
<Box sx={{ backgroundColor: '#ffffff', color: '#0f172a' }} />
```

❌ 重新建立独立的 ThemeProvider：

```tsx
<ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
```

❌ 旁路注册中心，直接 import 预设给 ThemeProvider：

```tsx
import { lightPreset } from '@/styles/themes';
<ThemeProvider theme={buildMuiTheme(lightPreset)}>
```

✅ 永远走 `<FoundationThemeProvider>` + `themeRegistry`。

---

## 8. 设计约束

- **按钮**：`borderRadius: 6`（方形圆角，**不是**圆形）；hover/active 必有 transition；
- **Paper / 卡片**：`borderRadius: 8`；
- **图标按钮**：`borderRadius: 6`，hover 用 `bg.hover`；
- **窗口标题栏**：背景用 `bg.base`，下方分隔线用 `divider`；
- **侧边栏**：背景用 `bg.sidebar`，激活项背景用 `bg.active`；
- 不允许任何组件硬编码十六进制色值。

---

## 9. 与后端协调

后端 `internal/app/window_<os>.go` 里的 `BackgroundColour` 控制 webview 在 React 接管前的初始底色。**当默认主题变更时，需要同步修改这个值**，避免启动闪白 / 闪黑：

```go
// 默认 light 主题：白色底
BackgroundColour: application.NewRGB(255, 255, 255),
```

如果你把默认主题切到深色，这里也要改成对应深色 RGB。
