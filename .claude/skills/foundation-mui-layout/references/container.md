# Container

## Import

```typescript
import Container from '@mui/material/Container';
// 或
import { Container } from '@mui/material';
```

## 基础用法（Foundation 模式）

Container 将内容水平居中并限制最大宽度。在 Foundation 桌面应用中使用频率较低（因为窗口本身就是有限宽度），但在需要限制内容宽度的场景仍然有用。

```tsx
import { Container, Box, useTheme } from '@mui/material';

const ContentPage = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4, color: fp.text.primary }}>
        <Typography>{t('page.content')}</Typography>
      </Box>
    </Container>
  );
};
```

## 所有 Props / 变体

### Fluid Container（流式，默认）

宽度随视口变化，但不超过 `maxWidth` 指定的断点宽度：

```tsx
<Container maxWidth="sm">  {/* 最大 600px */}
<Container maxWidth="md">  {/* 最大 900px */}
<Container maxWidth="lg">  {/* 最大 1200px */}
<Container maxWidth="xl">  {/* 最大 1536px */}
<Container maxWidth={false}> {/* 无最大宽度限制（全宽） */}
```

### Fixed Container（固定）

宽度跳跃式变化，始终等于当前激活断点的 `maxWidth`：

```tsx
<Container fixed>
  {/* sm 时 600px，md 时 900px，lg 时 1200px... */}
</Container>
```

### 去除内边距

```tsx
<Container disableGutters>
  {/* 移除左右 padding（默认 16px / 24px） */}
</Container>
```
## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxWidth` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| false` | `'lg'` | 最大宽度断点，`false` 表示不限制 |
| `fixed` | `boolean` | `false` | 是否使用固定宽度（跳跃式） |
| `disableGutters` | `boolean` | `false` | 是否移除左右内边距 |
| `component` | `ElementType` | `'div'` | 渲染的 HTML 元素 |
| `sx` | `SxProps<Theme>` | — | 额外样式 |

**maxWidth 对应的像素值**：

| 值 | 最大宽度 |
|----|----------|
| `'xs'` | 444px |
| `'sm'` | 600px |
| `'md'` | 900px |
| `'lg'` | 1200px |
| `'xl'` | 1536px |

## 响应式用法（breakpoints）

Container 本身通过 `maxWidth` 实现响应式。内部元素可通过 sx 断点对象进一步适配：

```tsx
<Container maxWidth="md">
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: { xs: 2, md: 4 },
    }}
  >
    <Box sx={{ flex: 1 }}>{t('left')}</Box>
    <Box sx={{ flex: 1 }}>{t('right')}</Box>
  </Box>
</Container>
```

## 与 Foundation styles.ts 配合

```typescript
// MyPage.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const myPageStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    container: {
      py: 4,
      backgroundColor: fp.bg.content,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
  };
};
```

```tsx
<Container maxWidth="md" sx={styles.container}>
  <Box sx={styles.content}>...</Box>
</Container>
```

## Foundation 约束

1. **桌面应用中少用 Container**：Foundation 是 Wails 桌面应用，窗口本身宽度有限。大多数场景用 `Box` + `maxWidth` 即可：
   ```tsx
   // 推荐：直接用 Box 限制宽度
   <Box sx={{ maxWidth: 720, px: 6 }}>...</Box>

   // 也可以用 Container（页面内容较多时）
   <Container maxWidth="md">...</Container>
   ```

2. **不要嵌套 Container**：虽然技术上可行，但几乎没有合理场景需要嵌套

3. **颜色取值**：Container 的 sx 中颜色只从 `theme.palette.foundation.*` 取

4. **典型 Foundation 场景**：
   - 设置页详情区域需要限制内容宽度时
   - 独立弹窗/对话框内容需要居中时
   - 文档/帮助类页面内容排版时

## 无障碍 (a11y)

1. **语义化 component**：当 Container 包裹页面主内容时，使用 `component="main"`：
   ```tsx
   <Container component="main" maxWidth="md">
     {/* 页面主内容 */}
   </Container>
   ```

2. **landmark 角色**：Container 默认渲染为 `<div>`，不具备 landmark 语义。如需辅助技术识别，添加 `role` 或使用语义化 component：
   ```tsx
   <Container component="section" aria-labelledby="section-title">
     <Typography id="section-title">{t('section.heading')}</Typography>
   </Container>
   ```
