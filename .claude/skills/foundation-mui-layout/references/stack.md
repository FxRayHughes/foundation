# Stack

## Import

```typescript
import Stack from '@mui/material/Stack';
// 或
import { Stack } from '@mui/material';
```

## 基础用法（Foundation 模式）

Stack 用于一维排列子元素（垂直或水平），自动管理间距。比 Box + flexbox 更语义化。

```tsx
import { Stack, Box, Typography, useTheme } from '@mui/material';

const MyComponent = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;

  return (
    <Stack spacing={2}>
      <Box sx={{ p: 2, bgcolor: fp.bg.surface, borderRadius: 1 }}>
        <Typography>{t('item.first')}</Typography>
      </Box>
      <Box sx={{ p: 2, bgcolor: fp.bg.surface, borderRadius: 1 }}>
        <Typography>{t('item.second')}</Typography>
      </Box>
      <Box sx={{ p: 2, bgcolor: fp.bg.surface, borderRadius: 1 }}>
        <Typography>{t('item.third')}</Typography>
      </Box>
    </Stack>
  );
};
```

## 所有 Props / 变体

### Direction（方向）

```tsx
// 垂直排列（默认）
<Stack direction="column" spacing={2}>...</Stack>

// 水平排列
<Stack direction="row" spacing={2}>...</Stack>

// 反向
<Stack direction="column-reverse">...</Stack>
<Stack direction="row-reverse">...</Stack>

// 响应式方向
<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
  <Item>{t('a')}</Item>
  <Item>{t('b')}</Item>
  <Item>{t('c')}</Item>
</Stack>
```

### Spacing（间距）

```tsx
// 固定间距（theme.spacing 倍数）
<Stack spacing={1}>...</Stack>   {/* 8px */}
<Stack spacing={2}>...</Stack>   {/* 16px */}
<Stack spacing={3}>...</Stack>   {/* 24px */}

// 响应式间距
<Stack spacing={{ xs: 1, sm: 2, md: 4 }}>...</Stack>
```
### Divider（分隔线）

在子元素之间插入分隔线：

```tsx
import { Stack, Divider } from '@mui/material';

<Stack
  direction="row"
  divider={<Divider orientation="vertical" flexItem />}
  spacing={2}
>
  <Item>{t('item.1')}</Item>
  <Item>{t('item.2')}</Item>
  <Item>{t('item.3')}</Item>
</Stack>
```

### useFlexGap（推荐）

使用 CSS `gap` 替代默认的 margin 实现，避免已知限制：

```tsx
<Stack spacing={2} useFlexGap>
  {/* 使用 flexbox gap，无 margin 副作用 */}
</Stack>
```

### 对齐

```tsx
// 水平居中（column 方向）
<Stack alignItems="center" spacing={2}>...</Stack>

// 垂直居中（row 方向）
<Stack direction="row" alignItems="center" spacing={2}>...</Stack>

// 两端对齐
<Stack direction="row" justifyContent="space-between">...</Stack>

// 右对齐
<Stack direction="row" justifyContent="flex-end" spacing={1}>...</Stack>
```

## Props 完整参考

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse' \| object` | `'column'` | 排列方向 |
| `spacing` | `number \| object` | `0` | 子元素间距（theme.spacing 倍数） |
| `divider` | `ReactNode` | — | 子元素之间插入的分隔元素 |
| `useFlexGap` | `boolean` | `false` | 使用 CSS gap 替代 margin |
| `alignItems` | `string` | — | CSS align-items |
| `justifyContent` | `string` | — | CSS justify-content |
| `flexWrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | — | 是否换行 |
| `component` | `ElementType` | `'div'` | 渲染的 HTML 元素 |
| `sx` | `SxProps<Theme>` | — | 额外样式 |

## 响应式用法（breakpoints）

`direction` 和 `spacing` 均支持断点对象：

```tsx
<Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={{ xs: 1, sm: 2, md: 4 }}
>
  <Box sx={styles.card}>{t('card.a')}</Box>
  <Box sx={styles.card}>{t('card.b')}</Box>
  <Box sx={styles.card}>{t('card.c')}</Box>
</Stack>
```

**典型场景**：手机竖排、桌面横排：

```tsx
<Stack
  direction={{ xs: 'column', md: 'row' }}
  spacing={2}
  alignItems={{ xs: 'stretch', md: 'flex-start' }}
>
  <Box sx={{ flex: 1 }}>...</Box>
  <Box sx={{ flex: 1 }}>...</Box>
</Stack>
```
## 与 Foundation styles.ts 配合

```typescript
// ActionBar.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const actionBarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      p: 2,
      borderTop: `1px solid ${fp.divider}`,
      backgroundColor: fp.bg.surface,
    },
    actions: {
      // Stack 本身的 sx（用于覆盖对齐等）
      justifyContent: 'flex-end',
    },
  };
};
```

```tsx
<Box sx={styles.root}>
  <Stack direction="row" spacing={1} sx={styles.actions}>
    <Button variant="outlined">{t('action.cancel')}</Button>
    <Button variant="contained">{t('action.save')}</Button>
  </Stack>
</Box>
```

## Stack vs Grid 选型

| 场景 | 推荐 |
|------|------|
| 按钮组（水平排列） | Stack direction="row" |
| 表单字段（垂直排列） | Stack direction="column" |
| 卡片列表（一行多列，响应式） | Grid |
| 导航菜单项 | Stack direction="column" |
| 页脚链接（水平 + 分隔线） | Stack direction="row" divider={...} |
| 仪表盘多卡片布局 | Grid |

## Foundation 约束

1. **推荐 useFlexGap**：Foundation 项目建议始终加 `useFlexGap`，避免 margin 副作用：
   ```tsx
   <Stack spacing={2} useFlexGap>...</Stack>
   ```

2. **不要在 Stack 子项上加 margin**：间距由 `spacing` prop 统一管理

3. **divider 方向要匹配**：
   - `direction="row"` 时用 `<Divider orientation="vertical" flexItem />`
   - `direction="column"` 时用 `<Divider />`（默认水平）

4. **颜色取值**：Stack 的 sx 中颜色只从 `theme.palette.foundation.*` 取

5. **典型 Foundation 用法**：
   ```tsx
   // 按钮组
   <Stack direction="row" spacing={1}>
     <Button>{t('cancel')}</Button>
     <Button variant="contained">{t('confirm')}</Button>
   </Stack>

   // 表单
   <Stack spacing={2}>
     <TextField label={t('field.name')} />
     <TextField label={t('field.email')} />
   </Stack>

   // 信息列表
   <Stack spacing={0.5}>
     <Typography sx={{ color: fp.text.muted }}>{t('info.label')}</Typography>
     <Typography sx={{ color: fp.text.primary }}>{value}</Typography>
   </Stack>
   ```

6. **white-space 注意**：Stack 默认不设 `white-space`，但如果子元素文本溢出，需要自行处理 `overflow` / `textOverflow`

## 无障碍 (a11y)

1. **按钮组语义**：当 Stack 用于按钮组时，使用 `role="group"` + `aria-label`：
   ```tsx
   <Stack direction="row" spacing={1} role="group" aria-label={t('actions.group')}>
     <Button>{t('action.cancel')}</Button>
     <Button variant="contained">{t('action.save')}</Button>
   </Stack>
   ```

2. **导航列表**：当 Stack 用于导航菜单时，使用 `component="nav"`：
   ```tsx
   <Stack component="nav" spacing={0.5} aria-label={t('nav.main')}>
     <NavItem />
     <NavItem />
   </Stack>
   ```

3. **Divider 不影响阅读**：Stack 的 `divider` prop 插入的分隔线对屏幕阅读器透明（`role="separator"`）

4. **方向变化**：响应式 `direction` 变化不影响 DOM 顺序，屏幕阅读器始终按源码顺序朗读

