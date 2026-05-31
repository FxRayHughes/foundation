# useMediaQuery

CSS 媒体查询的 React hook，用于响应式布局判断。在 Foundation 桌面应用中主要用于窗口尺寸适配和系统偏好检测。

## Import

```tsx
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
```

## 基础用法（Foundation 模式）

```tsx
// ResponsiveLayout.tsx
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';
import { useT } from '@/i18n';

export const ResponsiveLayout = () => {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  // 使用主题断点
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: isCompact ? 'column' : 'row',
      backgroundColor: fp.bg.content,
      gap: 2,
    }}>
      {!isCompact && <Box sx={{ width: 240 }}>{t('layout.sidebar')}</Box>}
      <Box sx={{ flex: 1 }}>{t('layout.main')}</Box>
    </Box>
  );
};
```

## 使用主题断点

MUI 主题内置断点，推荐优先使用：

```tsx
const theme = useTheme();

// 宽度 < 600px
const isXs = useMediaQuery(theme.breakpoints.down('sm'));
// 宽度 >= 600px 且 < 900px
const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
// 宽度 >= 900px
const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
// 宽度 >= 1200px
const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
```

### 默认断点值

| 断点 | 最小宽度 |
|------|----------|
| `xs` | 0px |
| `sm` | 600px |
| `md` | 900px |
| `lg` | 1200px |
| `xl` | 1536px |

## 自定义媒体查询字符串

不限于断点，可使用任意 CSS 媒体查询：

```tsx
// 检测系统暗色模式偏好
const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

// 检测动画偏好
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

// 检测高对比度
const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');

// 自定义宽度
const isNarrow = useMediaQuery('(max-width: 480px)');

// 横竖屏
const isLandscape = useMediaQuery('(orientation: landscape)');

// 分辨率
const isRetina = useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');
```

## 检测系统暗色模式

Foundation 中用于初始化主题或跟随系统：

```tsx
import useMediaQuery from '@mui/material/useMediaQuery';
import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

export const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: prefersDarkMode ? 'dark' : 'light',
      },
    }),
    [prefersDarkMode],
  );

  return theme;
};
```

## 检测动画偏好

尊重用户的 `prefers-reduced-motion` 设置：

```tsx
import useMediaQuery from '@mui/material/useMediaQuery';
import Fade from '@mui/material/Fade';

export const AnimatedPanel = ({ open, children }) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <Fade in={open} timeout={prefersReducedMotion ? 0 : 300}>
      {children}
    </Fade>
  );
};
```

## 条件渲染 vs 样式切换

```tsx
// 方式 1：条件渲染（组件完全不同时）
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

if (isMobile) return <MobileView />;
return <DesktopView />;

// 方式 2：样式切换（同一组件不同布局时，推荐）
<Box sx={{
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '240px 1fr',
}}>
  ...
</Box>
```

## Options 参数

```tsx
useMediaQuery(query, options?)
```

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `defaultMatches` | `boolean` | `false` | SSR 时的默认值（Foundation 不需要） |
| `matchMedia` | `(query) => MediaQueryList` | `window.matchMedia` | 自定义匹配函数（测试用） |
| `noSsr` | `boolean` | `false` | 跳过 SSR 匹配逻辑 |

## API 签名

```tsx
function useMediaQuery(
  query: string | ((theme: Theme) => string),
  options?: Options
): boolean;
```

支持传入函数，接收 theme 参数：

```tsx
const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
```

## 窗口尺寸适配（Foundation 场景）

桌面应用窗口可自由调整大小，常见适配模式：

```tsx
// AdaptivePanel.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const adaptivePanelStyles = (
  theme: Theme,
  isCompact: boolean,
): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      display: 'flex',
      flexDirection: isCompact ? 'column' : 'row',
      backgroundColor: fp.bg.content,
      height: '100%',
    },
    sidebar: {
      width: isCompact ? '100%' : 240,
      borderRight: isCompact ? 'none' : `1px solid ${fp.divider}`,
      borderBottom: isCompact ? `1px solid ${fp.divider}` : 'none',
    },
    content: {
      flex: 1,
      overflow: 'auto',
    },
  };
};
```

```tsx
// AdaptivePanel.tsx
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';
import { adaptivePanelStyles } from './AdaptivePanel.styles';
import { useT } from '@/i18n';

export const AdaptivePanel = () => {
  const theme = useTheme();
  const { t } = useT();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const styles = adaptivePanelStyles(theme, isCompact);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.sidebar}>{t('panel.sidebar')}</Box>
      <Box sx={styles.content}>{t('panel.content')}</Box>
    </Box>
  );
};
```

## 无障碍 (a11y)

- `prefers-reduced-motion` 检测是无障碍最佳实践
- `prefers-contrast` 检测可用于提供高对比度主题
- 响应式布局变化不应导致焦点丢失
- 条件渲染时确保屏幕阅读器能感知内容变化

```tsx
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');

// 根据偏好调整 UI
const animationDuration = prefersReducedMotion ? 0 : 200;
const borderWidth = prefersHighContrast ? 2 : 1;
```

## Foundation 约束

1. Foundation 是桌面应用（Wails webview），**不需要 SSR 相关选项**（`defaultMatches`、`noSsr` 可忽略）
2. 窗口尺寸适配用 `theme.breakpoints`，不要硬编码像素值
3. **必须**检测 `prefers-reduced-motion` 并尊重用户偏好
4. 暗色模式检测仅用于初始化，运行时主题切换走 Foundation 自有的主题系统
5. 样式工厂函数可接收 `isCompact` 等布尔参数，避免在 JSX 中写复杂三元
6. 配色从 `theme.palette.foundation.*` 取，禁止硬编码 hex
