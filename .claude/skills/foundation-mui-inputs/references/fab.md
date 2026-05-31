# FAB (Floating Action Button)

MUI 9 的 Fab 组件是浮动操作按钮，用于页面中最重要的主操作。

## Import

```tsx
import { Fab } from '@mui/material';
// 图标
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded';
```

## 基础用法（Foundation 模式）

```tsx
import { Fab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { fabStyles } from './MyFab.styles';

function MyFab() {
  const theme = useTheme();
  const t = useT();
  const styles = fabStyles(theme);

  return (
    <Fab
      color="primary"
      aria-label={t('aria.addItem')}
      onClick={handleAdd}
      sx={styles.fab}
    >
      <AddRoundedIcon />
    </Fab>
  );
}
```

```tsx
// MyFab.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const fabStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    fab: {
      position: 'fixed',
      bottom: 24,
      right: 24,
      backgroundColor: fp.accent,
      '&:hover': { backgroundColor: fp.accentHover },
    },
  };
};
```

## 所有 Variants

### circular（默认，圆形）

```tsx
<Fab color="primary" aria-label={t('aria.add')}>
  <AddRoundedIcon />
</Fab>
```

### extended（扩展，带文字）

```tsx
<Fab variant="extended" color="primary" aria-label={t('aria.navigate')}>
  <NavigationRoundedIcon sx={{ mr: 1 }} />
  {t('actions.navigate')}
</Fab>
```

## Sizes

```tsx
<Fab size="small" aria-label={t('aria.add')}>
  <AddRoundedIcon fontSize="small" />
</Fab>

<Fab size="medium" aria-label={t('aria.add')}>
  <AddRoundedIcon />
</Fab>

<Fab size="large" aria-label={t('aria.add')}>  {/* 默认 */}
  <AddRoundedIcon />
</Fab>
```

## Colors

```tsx
<Fab color="primary" aria-label={t('aria.add')}><AddRoundedIcon /></Fab>
<Fab color="secondary" aria-label={t('aria.edit')}><EditRoundedIcon /></Fab>
<Fab color="success" aria-label={t('aria.check')}><CheckRoundedIcon /></Fab>
<Fab color="error" aria-label={t('aria.delete')}><DeleteRoundedIcon /></Fab>
<Fab color="info" aria-label={t('aria.info')}><InfoRoundedIcon /></Fab>
<Fab color="warning" aria-label={t('aria.warning')}><WarningRoundedIcon /></Fab>
```

## 禁用状态

```tsx
<Fab disabled aria-label={t('aria.add')}>
  <AddRoundedIcon />
</Fab>
```

## 定位模式

### 固定定位（页面级）

```tsx
<Fab
  sx={{
    position: 'fixed',
    bottom: 24,
    right: 24,
  }}
  aria-label={t('aria.add')}
>
  <AddRoundedIcon />
</Fab>
```

### 绝对定位（容器内）

```tsx
<Box sx={{ position: 'relative', height: 300 }}>
  <Fab
    sx={{
      position: 'absolute',
      bottom: 16,
      right: 16,
    }}
    aria-label={t('aria.add')}
  >
    <AddRoundedIcon />
  </Fab>
</Box>
```

## 带动画（配合列表/内容切换）

```tsx
import { Zoom } from '@mui/material';

<Zoom in={showFab}>
  <Fab color="primary" aria-label={t('aria.add')} sx={styles.fab}>
    <AddRoundedIcon />
  </Fab>
</Zoom>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'circular' \| 'extended'` | `'circular'` | 形状变体 |
| color | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'info' \| 'warning' \| 'inherit' \| 'default'` | `'default'` | 颜色 |
| size | `'small' \| 'medium' \| 'large'` | `'large'` | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| disableRipple | `boolean` | `false` | 禁用水波纹 |
| href | `string` | - | 作为链接 |
| component | `ElementType` | `'button'` | 根元素类型 |
| aria-label | `string` | **必填** | 无障碍标签（走 t()） |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 无障碍 (a11y)

- **必须**提供 `aria-label`（走 t()），因为 FAB 通常只有图标
- extended variant 有文字时，文字即为 accessible name，但仍建议提供 aria-label
- 键盘：Tab 聚焦，Enter/Space 触发
- 固定定位的 FAB 应确保不遮挡其他可交互元素

## Foundation 约束

⚠️ **aria-label 必填**：FAB 通常只有图标，必须提供 `aria-label`（走 t()）

⚠️ **配色**：自定义颜色从 `theme.palette.foundation.*` 取

⚠️ **图标**：只用 `*Rounded` 系列

⚠️ **定位**：Foundation 是桌面应用，FAB 使用场景较少；如需使用，注意不要遮挡三栏布局的内容

⚠️ **extended 文字**：variant="extended" 时按钮文字走 `t('key')`

⚠️ **阴影**：FAB 默认有 elevation，这是合理的（区别于普通 Button 的 disableElevation）
