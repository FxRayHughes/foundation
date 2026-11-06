---
name: foundation-theme
description: Foundation 脚手架的主题注册系统使用指南（Mantine 9）。说明如何注册新主题预设、切换主题、用 mantineOverrides 覆盖 Mantine theme，以及如何在组件里安全地消费主题色（CSS 变量 --fd-* / FOUNDATION_CSS_VARS / useFoundationPalette）。
---

# Foundation 主题注册系统（Mantine 9）

Foundation 脚手架内置一套**注册式主题系统**，建立在 Mantine theme + CSS 变量之上：

- 调色板使用语义槽位（`bg.surface` / `text.primary` / `accent` ...），而不是裸十六进制色值；
- 主题以**预设（preset）**形式注册到 `themeRegistry`，可在运行时增删切换；
- `<FoundationThemeProvider>` 把当前预设编译成三样东西注入下游：
  1. **CSS 变量 `--fd-*`**（`cssVariablesResolver` 注入 `:root`）—— 组件样式 `*.module.css` 一律写 `var(--fd-xxx)`，切主题零重渲染；
  2. **Mantine 主色 `'foundation'`**（由 `accent` 生成 10 级色阶，`primaryShade: 6` = accent，shade 7 = accentHover）—— `<Button>` / `<Switch>` / `<Checkbox>` / `<Progress>` / 焦点环等 Mantine 原生组件不传 `color` 即自动跟随强调色；
  3. **Mantine 语义变量映射**（`--mantine-color-body / text / dimmed / placeholder / default* / error / anchor` → `--fd-*`）—— 没写样式的 Mantine 组件也和预设一致。
- `<MantineProvider forceColorScheme={preset.mode}>`：明暗由预设的 `mode` 决定，不走 Mantine 自己的 color scheme 切换。

> 内置预设：`foundation-light`（白色，默认）、`foundation-dark`（暗色）、`foundation-obsidian`（纯黑紫调）。另有用户自定义主题 `foundation-custom`（由设置页编辑，持久化在 SQLite）。

---

## 1. 文件结构

```
src/styles/
├── index.ts                     # 全局样式入口：@mantine/core / @mantine/charts / mantine-datatable 样式 + global.css
├── global.css                   # 全局基础样式（body 底色 / 滚动条，替代原 CssBaseline），颜色只用 --fd-*
└── themes/
    ├── types.ts                 # FoundationPalette / FoundationThemePreset 接口
    ├── buildMantineTheme.ts     # preset → Mantine theme 编译器 + cssVariablesResolver + FOUNDATION_CSS_VARS
    ├── mantineComponents.module.css  # Mantine 原生组件全局样式覆盖（Button / ActionIcon / Paper / Card / Menu / Input / Tooltip ...）
    ├── useFoundationPalette.ts  # JS 侧读取当前预设的真实色值
    ├── registry.ts              # 注册中心单例（register / unregister / get / has / list / subscribe）
    ├── ThemeProvider.tsx        # <FoundationThemeProvider>（内含 MantineProvider）+ useFoundationTheme
    ├── customTheme.ts           # 用户自定义主题 foundation-custom（seed / preview / hydrate / unregister / parse）
    ├── presets/
    │   ├── light.ts             # 默认白色预设
    │   ├── dark.ts              # 暗色预设
    │   └── obsidian.ts          # 纯黑紫调预设
    └── index.ts                 # 对外出口（含 registerFoundationThemes 启动函数）
```

组件层一律从 `@/styles/themes` 导入，不要直接引用子文件。

---

## 2. 启动注册

入口文件（`main.tsx` / `child.tsx` / `systrayEntry.tsx`）先 `import '@/styles'` 引入全局样式（顺序：Mantine 基础 → 扩展包 → Foundation 全局覆盖）。`App.tsx` 顶部调用一次：

```tsx
import { FoundationThemeProvider, registerFoundationThemes } from '@/styles/themes';

registerFoundationThemes(); // 幂等：内置 light（默认）+ dark + obsidian

export const App = () => (
  <I18nProvider>
    <FoundationThemeProvider>
      {/* ... */}
    </FoundationThemeProvider>
  </I18nProvider>
);
```

- `registerFoundationThemes()` 会把 `light` 标记为默认主题。想换默认主题，**不要**改这个函数 —— 注册新预设并指定 `default: true`（见第 4 节）。
- 自定义主题不在这里注册：`FoundationThemeProvider` mount 时通过 `AppSettingsService.get()` 异步读取 `customTheme` JSON 并 hydrate 到 registry，再应用 `themeChoice`。
- **不要**在业务代码里再挂 `<MantineProvider>`。三个入口（主窗口 `App.tsx`、子窗口 `child.tsx`、托盘面板 `systrayEntry.tsx`）都只挂 `<I18nProvider><FoundationThemeProvider>…`，各自先调 `registerFoundationThemes()`；子窗口**不再**固定 light 主题，与主窗口一致（含自定义主题、跟随系统）。

### 跨窗口同步（appsettings:changed）

每个 OS 窗口都有独立的 React 树和 `FoundationThemeProvider`，靠后端事件保持一致：

```
主窗口 setChoice / 设置页改自定义主题
  └── AppSettingsService.setThemeChoice / setCustomTheme / resetCustomTheme
      └── 后端 appsettings.Service 写库成功 → app.Event.Emit("appsettings:changed", "<字段名>")
          └── 所有窗口的 FoundationThemeProvider：AppSettingsService.onChanged(field)
              → field 为 'themeChoice' | 'customTheme' 时，200ms 防抖后重新 get()
              → hydrate 自定义主题 + 应用 themeChoice
```

- 事件名常量：`internal/events/events.go` 的 `AppSettingsChanged = "appsettings:changed"`，payload 为字段名 `"themeChoice" | "customTheme" | "localeChoice"`。
- 200ms 防抖的原因：自定义主题调色时每次改色都会写库并广播，避免拖动取色器时其它窗口（以及发起窗口自身）回闪。
- 发起切换的窗口也会收到广播并重拉一次，结果与本地状态一致，无副作用。
- 业务代码**不要**自己订阅 `appsettings:changed` 去改主题；一律交给 Provider。

---

## 3. 在组件里消费主题色

**铁律：** 组件样式禁止硬编码十六进制。颜色只能来自 `FoundationPalette`，按场景三选一：

| 场景 | 用法 | 说明 |
|------|------|------|
| **默认（绝大多数）** | `*.module.css` 里写 `var(--fd-xxx)` | 切主题零重渲染 |
| JS 侧需要"引用"颜色（`@mantine/charts` 的 `color`、内联 `style`、SVG `fill`） | `FOUNDATION_CSS_VARS.xxx`（值是 `'var(--fd-xxx)'` 字符串） | 仍是 CSS 变量，跟随主题 |
| JS 侧必须拿"真实色值"（canvas、算透明度 / 渐变、只认具体颜色串的第三方库） | `useFoundationPalette()` | 返回当前预设的 `FoundationPalette`，主题切换时重渲染 |

### 3.1 CSS Modules（推荐）

```css
/* MyCard.module.css */
.root {
  background-color: var(--fd-bg-surface);
  border: 1px solid var(--fd-divider);
  color: var(--fd-text-primary);
  border-radius: 8px;
  transition: background-color 120ms ease;
}
.root:hover {
  background-color: var(--fd-bg-hover);
}
.accent {
  color: var(--fd-accent);
}
```

```tsx
// MyCard.tsx
import { Text } from '@mantine/core';
import classes from './MyCard.module.css';

export const MyCard = () => (
  <div className={classes.root}>
    <Text className={classes.accent}>...</Text>
  </div>
);
```

覆盖 Mantine 组件内部样式时，用 `className` 或 `classNames={{ root: classes.x, label: classes.y }}`；需要压过全局覆盖时提高选择器权重（如 `.item.item { ... }`，参考 `components/Sidebar/Sidebar.module.css`）。

### 3.2 FOUNDATION_CSS_VARS（JS 引用变量）

```tsx
import { BarChart } from '@mantine/charts';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';

<BarChart
  data={data}
  dataKey="name"
  series={[{ name: 'bytes', color: FOUNDATION_CSS_VARS.accent }]}
  gridColor={FOUNDATION_CSS_VARS.divider}
  textColor={FOUNDATION_CSS_VARS.text.secondary}
/>
```

### 3.3 useFoundationPalette（JS 真实色值）

```ts
import { useFoundationPalette } from '@/styles/themes';

const palette = useFoundationPalette();
ctx.fillStyle = palette.accent; // canvas 只认具体颜色
```

### 3.4 槽位与 CSS 变量对照

| 槽位 | CSS 变量 | 用途 |
|------|----------|------|
| `bg.base` | `--fd-bg-base` | 标题栏 / 最外层 |
| `bg.sidebar` | `--fd-bg-sidebar` | 侧边栏 |
| `bg.content` | `--fd-bg-content` | 主内容区（也是 `body` / `--mantine-color-body`） |
| `bg.surface` | `--fd-bg-surface` | 卡片 / Paper / 下拉层 |
| `bg.elevated` | `--fd-bg-elevated` | 输入框 / 提升层 |
| `bg.hover` / `bg.active` | `--fd-bg-hover` / `--fd-bg-active` | 半透明 hover / active 覆盖 |
| `text.primary` / `text.secondary` / `text.muted` | `--fd-text-primary` / `--fd-text-secondary` / `--fd-text-muted` | 文字三级（secondary 即 `dimmed`） |
| `divider` | `--fd-divider` | 分隔线 / 边框 |
| `accent` / `accentHover` | `--fd-accent` / `--fd-accent-hover` | 品牌强调色（= Mantine `foundation` 色 shade 6 / 7） |
| `status.danger` / `success` / `warning` | `--fd-danger` / `--fd-success` / `--fd-warning` | 状态色 |

> 槽位新增 / 改名要同步三处：`types.ts` 的 `FoundationPalette`、`buildMantineTheme.ts` 的 `FOUNDATION_CSS_VARS` 与 `paletteToCssVars`，以及全部预设。

---

## 4. 注册自定义预设

```ts
// src/styles/themes/presets/brand.ts
import type { FoundationThemePreset } from '../types';

export const brandPreset: FoundationThemePreset = {
  name: 'brand-purple',
  label: 'Brand · Purple',
  mode: 'light',            // 决定 forceColorScheme
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
    accent: '#6366f1',      // 用 #rgb / #rrggbb，才能生成 10 级色阶（否则 10 级全填同一色）
    accentHover: '#4f46e5',
    status: { danger: '#dc2626', success: '#16a34a', warning: '#d97706' },
  },
};
```

> 预设文件是**唯一**允许出现十六进制色值的地方。

注册（推荐在应用启动时和 `registerFoundationThemes()` 一起）：

```ts
import { themeRegistry } from '@/styles/themes';
import { brandPreset } from '@/styles/themes/presets/brand';

themeRegistry.register(brandPreset, { default: true }); // 设为默认
```

- `register` 是幂等的：相同 `name` 会覆盖。不指定 `default` 时，注册的第一个预设自动成为默认。
- `unregister(name)` 不能移除默认预设（会抛错）。
- "跟随系统"（`'system'`）固定映射到 `foundation-light` / `foundation-dark`（见 `ThemeProvider.tsx` 的 `SYSTEM_LIGHT_NAME` / `SYSTEM_DARK_NAME`）。

---

## 5. 运行时切换主题

```tsx
import { Select } from '@mantine/core';
import { useT } from '@/i18n';
import { useFoundationTheme } from '@/styles/themes';

const ThemeSwitcher = () => {
  const t = useT();
  const { choice, available, setChoice } = useFoundationTheme();
  return (
    <Select
      value={choice}
      onChange={(v) => v && setChoice(v)}
      data={[
        { value: 'system', label: t('settings.themes.system.label') },
        ...available.map((p) => ({ value: p.name, label: p.label })),
      ]}
    />
  );
};
```

`useFoundationTheme()` 返回：

| 字段 | 说明 |
|------|------|
| `current` | 当前实际生效的预设（`'system'` 已解析成 light/dark） |
| `choice` | 用户选择：`'system'` 或预设 name |
| `available` | 已注册的全部预设（订阅 `themeRegistry`，增删自动刷新） |
| `setChoice(choice)` | 切换；未注册的 name 会抛错；写库走 `AppSettingsService.setThemeChoice`，失败不回滚 UI |

> 真实代码中设置页的主题切换在 `pages/SettingsPage/personalization/usePersonalization.ts`，ViewModel 只暴露 i18n key，View 调 `t()`。

---

## 6. mantineOverrides：进一步覆盖 Mantine theme

`FoundationThemePreset.mantineOverrides`（`MantineThemeOverride`）会在 `buildMantineTheme` 末尾经 `mergeThemeOverrides(base, mantineOverrides)` 深合并：

```ts
import { Button } from '@mantine/core';
import { lightPreset } from '@/styles/themes';
import type { FoundationThemePreset } from '@/styles/themes';

export const denseLight: FoundationThemePreset = {
  ...lightPreset,
  name: 'foundation-light-dense',
  label: 'Light · Dense',
  mantineOverrides: {
    fontSizes: { sm: '12px', md: '13px' },
    components: {
      Button: Button.extend({ defaultProps: { size: 'xs' } }),
    },
  },
};
```

适合放进 `mantineOverrides` 的：字号 / 间距 / 圆角刻度、组件 `defaultProps`。**不要**在这里改 `primaryColor` 或塞十六进制色 —— 颜色一律通过 `palette` 表达，否则 `--fd-*` 与 Mantine 色会分裂。

基础 theme（所有预设共享）在 `buildMantineTheme.ts`：

- `primaryColor: 'foundation'`、`primaryShade: 6`
- 字体 Inter 栈；`fontSizes` xs 12 / sm 13 / md 14 / lg 16 / xl 18
- `radius` xs 2 / sm 4 / md 8 / lg 12 / xl 16，`defaultRadius: 'sm'`
- 组件覆盖：`Button` / `ActionIcon`（默认 `variant="subtle"`）/ `Paper` / `Card` / `Popover` / `Menu` / `Input` / `Tooltip`（默认 `withArrow` + `openDelay: 300`），样式在 `mantineComponents.module.css`
- `other.foundation = palette`（需要时可经 `useMantineTheme().other.foundation` 读取，但优先用 `useFoundationPalette()`）

改**所有预设共享**的组件样式 → 改 `buildMantineTheme.ts` + `mantineComponents.module.css`（颜色仍只用 `--fd-*`）；只影响**单个预设** → 用 `mantineOverrides`。

---

## 7. 反例

❌ 在组件里直接写颜色：

```css
.root { background-color: #ffffff; color: #0f172a; }
```

```tsx
<Box style={{ color: '#6366f1' }} />
<Button color="blue">...</Button>   {/* 用 Mantine 内置色板而非 foundation 主色 */}
```

❌ 业务组件里再建一层 Provider：

```tsx
<MantineProvider theme={createTheme({ primaryColor: 'violet' })}>
```

❌ 旁路注册中心，直接拿预设编译（独立入口 `child.tsx` / `systrayEntry.tsx` 也不例外，否则无法跟随主窗口切主题）：

```tsx
import { buildMantineTheme, lightPreset } from '@/styles/themes';
<MantineProvider theme={buildMantineTheme(lightPreset)}>
```

❌ 用 `useFoundationPalette()` 拼内联 style 代替 CSS 变量（会让每次切主题都重渲染，且绕过 CSS Modules）。

❌ 自己定义 `--my-color` 之类的颜色变量替代 `--fd-*`。

✅ 永远走 `<FoundationThemeProvider>` + `themeRegistry`，样式写 `var(--fd-*)`。

---

## 8. 设计约束

- **按钮 / 图标按钮**：方形圆角（Mantine 默认 `radius="sm"` = 4px，自绘按钮写 `border-radius: 6px`），**不用**圆形（`999`）；hover / active 必有 transition（默认 `120ms ease`）；
- **Paper / 卡片 / 容器**：`8px`（`radius="md"`）；
- **ActionIcon**：默认 `variant="subtle"`，hover 底色 `--fd-bg-hover`；
- **窗口标题栏**：背景 `--fd-bg-base`，下方分隔线 `--fd-divider`；
- **侧边栏**：背景 `--fd-bg-sidebar`，激活项背景 `--fd-bg-active` + `--fd-accent` 图标；
- 除 `presets/*.ts` 外，不允许任何地方硬编码十六进制色值。

---

## 9. 与后端 / 首屏协调

后端 `internal/app/window_<os>.go` 里的 `BackgroundColour` 控制 webview 在 React 接管前的初始底色；`frontend/index.html` 内联的首屏骨架也写死了 light / dark 预设色值（它在 Mantine 加载前渲染，无法用 `--fd-*`）。**当默认主题或内置预设颜色变更时，需要同步修改这两处**，避免启动闪白 / 闪黑：

```go
// 默认 light 主题：白色底
BackgroundColour: application.NewRGB(255, 255, 255),
```
