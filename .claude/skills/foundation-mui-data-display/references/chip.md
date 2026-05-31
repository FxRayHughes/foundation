# Chip

## Import

```tsx
import Chip from '@mui/material/Chip';
// 或
import { Chip } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import TagRounded from '@mui/icons-material/TagRounded';
import { useT } from '@/i18n';
import { chipStyles } from './TagChip.styles';

function TagChip({ label, onDelete }: { label: string; onDelete?: () => void }) {
  const theme = useTheme();
  const t = useT();
  const styles = chipStyles(theme);

  return (
    <Chip
      sx={styles.root}
      icon={<TagRounded />}
      label={label}
      onDelete={onDelete}
      aria-label={t('chip.tag', { label })}
    />
  );
}
```

样式工厂：

```tsx
// TagChip.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const chipStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      bgcolor: fp.bg.surface,
      color: fp.text.primary,
      borderRadius: '16px',
      '& .MuiChip-icon': { color: fp.text.secondary },
      '& .MuiChip-deleteIcon': {
        color: fp.text.muted,
        '&:hover': { color: fp.status.danger },
      },
    },
    outlined: {
      bgcolor: 'transparent',
      border: `1px solid ${fp.divider}`,
      color: fp.text.primary,
    },
    active: {
      bgcolor: fp.accent,
      color: fp.bg.base,
      '& .MuiChip-icon': { color: fp.bg.base },
    },
    status: {
      success: {
        bgcolor: fp.status.success,
        color: fp.bg.base,
      },
      warning: {
        bgcolor: fp.status.warning,
        color: fp.bg.base,
      },
      danger: {
        bgcolor: fp.status.danger,
        color: fp.bg.base,
      },
    },
  };
};
```

## 所有 Variants

### Filled（默认）

```tsx
<Chip label={t('chip.label')} sx={styles.root} />
```

### Outlined

```tsx
<Chip label={t('chip.label')} variant="outlined" sx={styles.outlined} />
```

### 可点击

```tsx
<Chip
  label={t('chip.clickable')}
  onClick={handleClick}
  sx={styles.root}
/>
```

### 可删除

```tsx
<Chip
  label={t('chip.deletable')}
  onDelete={handleDelete}
  sx={styles.root}
/>
```

### 带图标

```tsx
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';

<Chip
  icon={<CheckCircleRounded />}
  label={t('chip.success')}
  sx={styles.root}
/>
```

### 带头像

```tsx
import Avatar from '@mui/material/Avatar';

<Chip
  avatar={<Avatar src="/user.jpg" alt={t('user.name')} />}
  label={t('chip.user')}
  sx={styles.root}
/>
```

### 自定义删除图标

```tsx
import CloseRounded from '@mui/icons-material/CloseRounded';

<Chip
  label={t('chip.custom.delete')}
  onDelete={handleDelete}
  deleteIcon={<CloseRounded />}
  sx={styles.root}
/>
```

## Sizes

```tsx
{/* 小尺寸 */}
<Chip size="small" label={t('chip.small')} sx={styles.root} />

{/* 中等尺寸（默认） */}
<Chip size="medium" label={t('chip.medium')} sx={styles.root} />
```

| Size | 高度 | 字号 | 典型场景 |
|------|------|------|----------|
| small | 24px | 0.8125rem | 表格内、紧凑列表 |
| medium | 32px | 0.8125rem | 默认、筛选条件 |

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| label | `ReactNode` | — | 显示文本 |
| variant | `'filled'\|'outlined'` | `'filled'` | 变体 |
| size | `'small'\|'medium'` | `'medium'` | 尺寸 |
| icon | `ReactElement` | — | 左侧图标 |
| avatar | `ReactElement<AvatarProps>` | — | 左侧头像 |
| deleteIcon | `ReactElement` | — | 自定义删除图标 |
| onClick | `() => void` | — | 点击回调（添加后 Chip 变为可点击） |
| onDelete | `() => void` | — | 删除回调（添加后显示删除图标） |
| clickable | `boolean` | — | 强制可点击状态 |
| disabled | `boolean` | `false` | 禁用状态 |
| color | `string` | — | 颜色（Foundation 中用 sx） |
| component | `ElementType` | — | 根元素 |
| skipFocusWhenDisabled | `boolean` | `false` | 禁用时跳过焦点 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 筛选条件组合用法

```tsx
function FilterChips({ filters, activeFilters, onToggle }) {
  const theme = useTheme();
  const t = useT();
  const styles = chipStyles(theme);

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {filters.map((filter) => (
        <Chip
          key={filter.id}
          label={t(filter.labelKey)}
          onClick={() => onToggle(filter.id)}
          sx={activeFilters.includes(filter.id) ? styles.active : styles.outlined}
          icon={activeFilters.includes(filter.id) ? <CheckCircleRounded /> : undefined}
        />
      ))}
    </Box>
  );
}
```

## 无障碍 (a11y)

- 可点击的 Chip 自动获得 `role="button"` 和键盘支持
- 可删除的 Chip 的删除按钮有独立的 `tabIndex`
- 使用 `aria-label` 为无文本 Chip 提供语义
- 禁用状态的 Chip 添加 `aria-disabled="true"`

```tsx
<Chip
  label={t('chip.status.online')}
  sx={styles.root}
  aria-label={t('chip.status.description')}
/>
```

## Foundation 约束

⚠️ **配色**：禁止使用 `color="primary"` 等 prop。通过 sx 设置 `bgcolor`/`color`，只从 `fp.*` 取值。

⚠️ **圆角**：Chip 保持默认圆角（16px 药丸形），不要覆盖为方形。

⚠️ **图标**：`icon` 和 `deleteIcon` 只用 `*Rounded` 系列。

⚠️ **i18n**：`label` 和 `aria-label` 必须走 `t('key')`。

⚠️ **状态色**：表示状态时用 `fp.status.success/warning/danger`，不要自定义颜色。
