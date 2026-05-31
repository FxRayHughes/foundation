# CssBaseline / ScopedCssBaseline

全局 CSS 重置组件，类似 normalize.css。统一跨浏览器默认样式。

## Import

```tsx
import CssBaseline from '@mui/material/CssBaseline';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
```

## 基础用法（Foundation 模式）

Foundation 项目在 `App.tsx` 顶层已包含 `CssBaseline`：

```tsx
// App.tsx（已配置，无需重复添加）
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* 应用内容 */}
    </ThemeProvider>
  );
}
```

## 所有 Props / 变体

### 全局重置（CssBaseline）

应用于整个文档，放在 ThemeProvider 内部：

```tsx
<ThemeProvider theme={theme}>
  <CssBaseline />
  <App />
</ThemeProvider>
```

### 局部重置（ScopedCssBaseline）

仅对子元素应用重置，适合渐进式迁移：

```tsx
<ScopedCssBaseline>
  {/* 仅此区域内应用 CSS 重置 */}
  <MyMigratedSection />
</ScopedCssBaseline>
```

### 启用 color-scheme

让原生元素（滚动条等）跟随明暗模式：

```tsx
<CssBaseline enableColorScheme />
// 或
<ScopedCssBaseline enableColorScheme>
  {/* 内容 */}
</ScopedCssBaseline>
```

### 自定义全局样式覆盖

通过主题 `styleOverrides` 扩展：

```tsx
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        body: {
          backgroundColor: themeParam.palette.foundation.bg.base,
          scrollbarColor: `${themeParam.palette.foundation.text.muted} transparent`,
        },
      }),
    },
  },
});
```

## CssBaseline 重置内容

| 类别 | 重置行为 |
|------|----------|
| Page | `margin: 0`，背景色跟随主题 |
| Layout | 全局 `box-sizing: border-box`（含 `*::before` / `*::after`） |
| Typography | `font-size: 16px`，`font-family` 跟随主题 |
| Font smoothing | `-webkit-font-smoothing: antialiased` |
| Color scheme | 可选 `color-scheme: dark` / `light` |

## Props 完整参考

### CssBaseline

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 可选子节点 |
| `enableColorScheme` | `boolean` | `false` | 启用 CSS `color-scheme` 属性 |

### ScopedCssBaseline

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 受重置影响的子节点 |
| `enableColorScheme` | `boolean` | `false` | 启用 CSS `color-scheme` 属性 |
| `component` | `elementType` | `'div'` | 根元素类型 |
| `sx` | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- CssBaseline 不影响无障碍性
- 确保自定义 `styleOverrides` 不会破坏焦点可见性（如移除 `outline`）

## Foundation 约束

1. Foundation 已在顶层配置 `CssBaseline`，**不要重复添加**
2. 如需自定义全局样式，通过主题 `MuiCssBaseline.styleOverrides` 配置
3. 背景色等全局样式从 `theme.palette.foundation.*` 取值
4. `ScopedCssBaseline` 在 Foundation 中几乎不需要（整个应用已统一重置）
5. `enableColorScheme` 建议开启，让原生控件跟随明暗模式
6. 自定义滚动条时确保对比度足够（WCAG AA 要求 3:1）

## 自定义滚动条（Foundation 推荐模式）

桌面应用中常需自定义滚动条外观：

```tsx
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => {
        const fp = themeParam.palette.foundation;
        return {
          body: {
            backgroundColor: fp.bg.base,
            scrollbarColor: `${fp.text.muted} transparent`,
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${fp.text.muted} transparent`,
          },
          '*::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: fp.text.muted,
            borderRadius: 4,
            '&:hover': {
              backgroundColor: fp.text.secondary,
            },
          },
        };
      },
    },
  },
});
```

## 与 GlobalStyles 的区别

| 特性 | CssBaseline styleOverrides | GlobalStyles |
|------|---------------------------|--------------|
| 配置位置 | 主题 `components` | JSX 组件 |
| 生效时机 | 主题加载时 | 组件挂载时 |
| 推荐度 | **优先使用** | 仅在无法通过主题覆盖时 |
| 动态性 | 跟随主题切换 | 可依赖运行时状态 |