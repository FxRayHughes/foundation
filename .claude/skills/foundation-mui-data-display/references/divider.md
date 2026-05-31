# Divider

## Import

```tsx
import Divider from '@mui/material/Divider';
// 或
import { Divider } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { dividerStyles } from './Section.styles';

function Section() {
  const theme = useTheme();
  const styles = dividerStyles(theme);

  return (
    <Box>
      <Typography>{/* ... */}</Typography>
      <Divider sx={styles.root} />
      <Typography>{/* ... */}</Typography>
    </Box>
  );
}
```

样式工厂：

```tsx
// Section.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const dividerStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      borderColor: fp.divider,
    },
    thick: {
      borderColor: fp.divider,
      borderBottomWidth: 2,
    },
    inset: {
      borderColor: fp.divider,
      ml: 9, // 配合 ListItemIcon 宽度
    },
  };
};
```

## 所有 Variants

### 全宽分隔线（默认）

```tsx
<Divider sx={styles.root} />
```

### 内缩分隔线

```tsx
{/* 从左侧缩进（配合 List 使用） */}
<Divider variant="inset" sx={styles.root} />
```

### 中间分隔线

```tsx
{/* 两侧都缩进 */}
<Divider variant="middle" sx={styles.root} />
```

### 垂直分隔线

```tsx
import Box from '@mui/material/Box';

<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <Typography>{t('item.1')}</Typography>
  <Divider orientation="vertical" flexItem sx={styles.root} />
  <Typography>{t('item.2')}</Typography>
</Box>
```

### 带文本的分隔线

```tsx
<Divider sx={styles.root}>{t('divider.or')}</Divider>

{/* 文本位置控制 */}
<Divider textAlign="left" sx={styles.root}>{t('divider.section')}</Divider>
<Divider textAlign="right" sx={styles.root}>{t('divider.end')}</Divider>
```

### 在 List 中使用

```tsx
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

<List>
  <ListItem>{/* ... */}</ListItem>
  <Divider variant="inset" component="li" sx={styles.root} />
  <ListItem>{/* ... */}</ListItem>
</List>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'fullWidth'\|'inset'\|'middle'` | `'fullWidth'` | 缩进变体 |
| orientation | `'horizontal'\|'vertical'` | `'horizontal'` | 方向 |
| flexItem | `boolean` | `false` | 在 flex 容器中自适应高度 |
| textAlign | `'center'\|'left'\|'right'` | `'center'` | 文本位置（有 children 时） |
| light | `boolean` | `false` | 使用更浅的颜色（已废弃，用 sx） |
| absolute | `boolean` | `false` | 绝对定位 |
| component | `ElementType` | `'hr'` | 根元素（List 中用 `'li'`） |
| children | `ReactNode` | — | 分隔线中的文本 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 常见组合场景

### Sidebar 分组分隔

```tsx
// Foundation Sidebar 中的典型用法
<List>
  {/* 第一组 */}
  <ListItemButton>{/* ... */}</ListItemButton>
  <ListItemButton>{/* ... */}</ListItemButton>

  <Divider sx={{ my: 1, borderColor: theme.palette.foundation.divider }} />

  {/* 第二组 */}
  <ListItemButton>{/* ... */}</ListItemButton>
</List>
```

### Toolbar 按钮分隔

```tsx
<Box sx={{ display: 'flex', alignItems: 'center' }}>
  <IconButton>{/* ... */}</IconButton>
  <IconButton>{/* ... */}</IconButton>
  <Divider orientation="vertical" flexItem sx={{ mx: 1, ...styles.root }} />
  <IconButton>{/* ... */}</IconButton>
</Box>
```

## 无障碍 (a11y)

- Divider 默认渲染为 `<hr>`，自带 `role="separator"`
- 垂直分隔线自动设置 `aria-orientation="vertical"`
- 带文本的 Divider 不应作为唯一的语义分隔手段
- 在 List 中使用时设置 `component="li"` 保持列表语义

## Foundation 约束

⚠️ **配色**：`borderColor` 只从 `fp.divider` 取值，禁止硬编码 hex。

⚠️ **i18n**：带文本的 Divider，文本内容必须走 `t('key')`。

⚠️ **List 中使用**：必须设置 `component="li"` 以保持 HTML 语义正确。

⚠️ **间距**：通过 `sx={{ my: N }}` 控制上下间距，不要用额外的空 Box 撑开。
