# Grid (v2)

## Import

```typescript
import Grid from '@mui/material/Grid';
// 或
import { Grid } from '@mui/material';
```

> MUI 9 中 `Grid` 默认就是 v2 版本（基于 CSS Grid），无需单独导入 `Grid2`。

## 基础用法（Foundation 模式）

Grid v2 使用 `container` + `size` prop 构建网格布局：

```tsx
import { Box, Grid, useTheme } from '@mui/material';
import { myStyles } from './MyComponent.styles';

const MyComponent = () => {
  const theme = useTheme();
  const styles = myStyles(theme);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={8}>
          <Box sx={styles.card}>{t('main.content')}</Box>
        </Grid>
        <Grid size={4}>
          <Box sx={styles.card}>{t('sidebar.content')}</Box>
        </Grid>
      </Grid>
    </Box>
  );
};
```

## 所有 Props / 变体

### Container（网格容器）

```tsx
// 基础容器
<Grid container>...</Grid>

// 带间距
<Grid container spacing={2}>...</Grid>

// 自定义列数（默认 12）
<Grid container columns={16}>...</Grid>

// 行列间距分开设置
<Grid container columnSpacing={3} rowSpacing={2}>...</Grid>
```
### Size（子项尺寸）

```tsx
// 固定列数（12 列制）
<Grid size={6}>半宽</Grid>
<Grid size={12}>全宽</Grid>

// 响应式尺寸
<Grid size={{ xs: 12, sm: 6, md: 4 }}>
  {/* xs: 全宽, sm: 半宽, md: 三分之一 */}
</Grid>

// 自动填充剩余空间
<Grid size="grow">自动撑满</Grid>

// 自适应内容宽度
<Grid size="auto">按内容宽度</Grid>
```

### Offset（偏移）

```tsx
// 固定偏移
<Grid size={6} offset={3}>居中（左偏移 3 列）</Grid>

// 响应式偏移
<Grid size={{ xs: 6, md: 4 }} offset={{ xs: 3, md: 0 }}>
  {/* xs: 居中, md: 无偏移 */}
</Grid>

// 自动偏移（推到最右）
<Grid size={4} offset="auto">右对齐</Grid>
<Grid size={{ xs: 4, md: 2 }} offset={{ md: 'auto' }}>
  {/* md 时推到最右 */}
</Grid>
```

### 嵌套 Grid

Grid 可以同时是 container 和 item：

```tsx
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 5 }}>
    <Box sx={styles.card}>{t('section.a')}</Box>
  </Grid>
  <Grid container spacing={4} size={{ xs: 12, md: 7 }}>
    <Grid size={{ xs: 6, lg: 3 }}>
      <Box sx={styles.card}>{t('item.1')}</Box>
    </Grid>
    <Grid size={{ xs: 6, lg: 3 }}>
      <Box sx={styles.card}>{t('item.2')}</Box>
    </Grid>
  </Grid>
</Grid>
```

### Direction（方向）

```tsx
// 默认行方向
<Grid container direction="row">...</Grid>

// 列方向
<Grid container direction="column">...</Grid>

// 响应式方向
<Grid container direction={{ xs: 'column', sm: 'row' }}>...</Grid>
```

## Props 完整参考

### Container Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `container` | `boolean` | `false` | 标记为网格容器 |
| `spacing` | `number \| object` | `0` | 子项间距（theme.spacing 倍数） |
| `columnSpacing` | `number \| object` | — | 列间距（覆盖 spacing） |
| `rowSpacing` | `number \| object` | — | 行间距（覆盖 spacing） |
| `columns` | `number \| object` | `12` | 总列数 |
| `direction` | `'row' \| 'column' \| object` | `'row'` | 排列方向 |
| `sx` | `SxProps<Theme>` | — | 额外样式 |
### Item Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number \| 'auto' \| 'grow' \| object` | — | 子项占据列数 |
| `offset` | `number \| 'auto' \| object` | — | 左偏移列数 |

## 响应式用法（breakpoints）

`size`、`offset`、`spacing`、`columns`、`direction` 均支持断点对象：

```tsx
<Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
  {items.map((item, index) => (
    <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
      <Box sx={styles.card}>{t(item.labelKey)}</Box>
    </Grid>
  ))}
</Grid>
```

**典型响应式网格**：

```tsx
// 三列网格：手机 1 列 → 平板 2 列 → 桌面 3 列
<Grid container spacing={2}>
  {items.map((item) => (
    <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
      <Card>{t(item.labelKey)}</Card>
    </Grid>
  ))}
</Grid>
```

## 与 Foundation styles.ts 配合

```typescript
// OverviewPage.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const overviewPageStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    gridContainer: {
      flexGrow: 1,
    },
    statCard: {
      p: 3,
      backgroundColor: fp.bg.surface,
      border: `1px solid ${fp.divider}`,
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    },
  };
};
```

```tsx
<Box sx={styles.gridContainer}>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Box sx={styles.statCard}>...</Box>
    </Grid>
  </Grid>
</Box>
```

## Foundation 约束

1. **Grid v2 是 MUI 9 默认**：直接 `import Grid from '@mui/material/Grid'`，无需 Grid2

2. **size 取代旧版 xs/sm/md**：不再使用 `<Grid item xs={6}>`，改用 `<Grid size={{ xs: 6 }}>`

3. **不再需要 `item` prop**：MUI 9 Grid v2 中没有 container 标记的子 Grid 自动是 item

4. **间距使用 spacing prop**，不要在子项上加 margin：
   ```tsx
   // 错误
   <Grid container>
     <Grid size={6} sx={{ mr: 2 }}>...</Grid>
   </Grid>

   // 正确
   <Grid container spacing={2}>
     <Grid size={6}>...</Grid>
   </Grid>
   ```

5. **列方向限制**：`direction="column"` 时 `size` 和 `offset` 作用于高度而非宽度，使用时需注意

6. **颜色取值**：Grid 容器/子项的 sx 中颜色只从 `theme.palette.foundation.*` 取

## 无障碍 (a11y)

1. **Grid 无语义**：Grid 默认渲染为 `<div>`，不具备列表语义。如果网格内容是同类项目列表，考虑使用 `role="list"` + `role="listitem"`：
   ```tsx
   <Grid container spacing={2} role="list" aria-label={t('grid.items')}>
     <Grid size={{ xs: 12, sm: 6 }} role="listitem">
       <Box sx={styles.card}>...</Box>
     </Grid>
   </Grid>
   ```

2. **响应式布局不影响阅读顺序**：确保 DOM 顺序与视觉顺序一致，避免使用 CSS `order` 改变阅读流

3. **间距不影响可操作性**：确保 Grid 子项中的可交互元素（按钮、链接）有足够的点击区域（最小 44x44px）

