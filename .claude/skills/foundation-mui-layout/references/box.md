# Box

## Import

```typescript
import Box from '@mui/material/Box';
// 或
import { Box } from '@mui/material';
```

## 基础用法（Foundation 模式）

Box 是 Foundation 项目**最常用**的布局组件。它本质是一个增强版 `<div>`，内置 `sx` prop 支持主题感知样式。

```tsx
import { Box, useTheme } from '@mui/material';
import { myStyles } from './MyComponent.styles';

const MyComponent = () => {
  const theme = useTheme();
  const styles = myStyles(theme);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.card}>
        {/* 内容 */}
      </Box>
    </Box>
  );
};
```

**Foundation 实际用法**（摘自 HomePage）：

```tsx
<Box sx={styles.root}>
  <Box sx={styles.body}>
    <Typography sx={styles.eyebrow}>{t('home.eyebrow')}</Typography>
    <Box sx={styles.card}>
      <Box component="form" sx={styles.form} onSubmit={onSubmit}>
        {/* 表单内容 */}
      </Box>
    </Box>
  </Box>
</Box>
```

**Foundation 实际用法**（摘自 AppLayout）：

```tsx
<Box sx={styles.root}>
  <Sidebar />
  <Box component="main" sx={styles.main}>
    <RouterOutlet />
  </Box>
</Box>
```
## 所有 Props / 变体

### `component` prop（多态渲染）

Box 可以渲染为任意 HTML 元素：

```tsx
<Box component="section" sx={styles.section}>...</Box>
<Box component="form" onSubmit={handleSubmit}>...</Box>
<Box component="main" sx={styles.main}>...</Box>
<Box component="nav" sx={styles.nav}>...</Box>
<Box component="ul" aria-labelledby="list-title" sx={{ pl: 2 }}>...</Box>
<Box component="span">内联元素</Box>
```

### `sx` prop（主题感知样式）

`sx` 是 Box 的核心能力，支持所有 CSS 属性 + MUI System 简写：

```tsx
<Box
  sx={{
    // 尺寸（数字 = theme.spacing 倍数，字符串 = 原始 CSS）
    width: 300,          // 300px
    height: '100%',      // 100%
    p: 3,                // padding: theme.spacing(3) = 24px
    px: 2,               // paddingLeft + paddingRight
    m: 'auto',           // margin: auto

    // Flexbox
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,              // gap: theme.spacing(2) = 16px

    // 颜色（从主题取）
    bgcolor: 'foundation.bg.surface',
    color: 'foundation.text.primary',

    // 边框
    border: 1,           // 1px solid
    borderColor: 'foundation.divider',
    borderRadius: 1,     // theme.shape.borderRadius * 1 = 8px

    // 响应式
    width: { xs: '100%', md: 600 },
    flexDirection: { xs: 'column', sm: 'row' },
  }}
/>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `component` | `ElementType` | `'div'` | 渲染的 HTML 元素或 React 组件 |
| `sx` | `SxProps<Theme>` | — | 主题感知样式对象，支持所有 CSS + System 简写 |
| `children` | `ReactNode` | — | 子元素 |
| `ref` | `Ref<HTMLElement>` | — | 转发 ref |

**System 简写速查**（sx 内可用）：

| 简写 | CSS 属性 |
|------|----------|
| `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my` | margin 系列 |
| `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py` | padding 系列 |
| `bgcolor` | backgroundColor |
| `color` | color |
| `width`, `height`, `minWidth`, `maxWidth` | 尺寸 |
| `display`, `overflow`, `visibility` | 显示 |
| `flexGrow`, `flexShrink`, `flexBasis` | Flex 子项 |
| `gap`, `rowGap`, `columnGap` | 间距 |
| `gridColumn`, `gridRow`, `gridArea` | Grid 子项 |
| `position`, `top`, `right`, `bottom`, `left`, `zIndex` | 定位 |
| `border`, `borderTop`, `borderRadius`, `borderColor` | 边框 |
| `boxShadow` | 阴影 |
| `typography` | 排版预设 |
## 响应式用法（breakpoints）

sx prop 中任何属性都可以传断点对象：

```tsx
<Box
  sx={{
    // 移动端竖排，桌面端横排
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },

    // 响应式间距
    gap: { xs: 1, sm: 2, md: 3 },

    // 响应式尺寸
    width: { xs: '100%', sm: 400, md: 600 },

    // 响应式 padding
    p: { xs: 2, md: 4 },
  }}
/>
```

**MUI 9 默认断点**：

| 断点 | 最小宽度 |
|------|----------|
| `xs` | 0px |
| `sm` | 600px |
| `md` | 900px |
| `lg` | 1200px |
| `xl` | 1536px |

## 与 Foundation styles.ts 配合

Foundation 项目中 Box 的样式**必须**通过 styles.ts 工厂函数定义：

```typescript
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const myComponentStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fp.bg.content,
      overflow: 'hidden',
    },
    body: {
      flex: 1,
      overflowY: 'auto',
      px: 6,
      py: 6,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      alignItems: 'flex-start',
      maxWidth: 720,
    },
    card: {
      width: '100%',
      p: 3,
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
  };
};
```

## Foundation 约束

1. **禁止内联 sx 硬编码颜色**：
   ```tsx
   // 错误
   <Box sx={{ bgcolor: '#1a1a2e' }}>

   // 正确
   <Box sx={{ bgcolor: fp.bg.surface }}>
   ```

2. **禁止在 View 中写复杂 sx**（超过 3 个属性应提取到 styles.ts）：
   ```tsx
   // 错误 —— View 里写大段样式
   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, bgcolor: '...' }}>

   // 正确 —— 样式集中到 styles.ts
   <Box sx={styles.card}>
   ```

3. **圆角统一**：容器类 Box 使用 `borderRadius: 1`（= 8px）

4. **Box 作为表单容器**：
   ```tsx
   <Box component="form" sx={styles.form} onSubmit={onSubmit}>
     <TextField ... />
     <Button type="submit">{t('submit')}</Button>
   </Box>
   ```

5. **Box 作为布局骨架**（Foundation 推荐模式）：
   ```tsx
   // 页面根容器：flex 列，撑满可用空间
   root: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }

   // 可滚动内容区
   body: { flex: 1, overflowY: 'auto', px: 6, py: 6 }

   // 横向排列区
   row: { display: 'flex', gap: 2, alignItems: 'center' }
   ```

## 无障碍 (a11y)

1. **语义化 component**：当 Box 承担特定语义角色时，使用对应 HTML 元素：
   ```tsx
   <Box component="main">...</Box>      {/* 主内容区 */}
   <Box component="nav">...</Box>       {/* 导航区 */}
   <Box component="section">...</Box>   {/* 独立章节 */}
   <Box component="aside">...</Box>     {/* 侧边栏 */}
   <Box component="article">...</Box>   {/* 独立文章 */}
   ```

2. **ARIA 属性**：Box 支持所有标准 HTML/ARIA 属性：
   ```tsx
   <Box role="region" aria-label={t('section.stats')}>...</Box>
   <Box aria-hidden="true">装饰性内容</Box>
   ```

3. **键盘可访问**：可交互的 Box 需要 `tabIndex` 和键盘事件处理：
   ```tsx
   <Box
     component="div"
     role="button"
     tabIndex={0}
     onClick={handleClick}
     onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
     aria-label={t('action.expand')}
   >
     ...
   </Box>
   ```

4. **避免空 div 嵌套**：不要为了样式创建无意义的嵌套层级，屏幕阅读器会遍历所有节点

