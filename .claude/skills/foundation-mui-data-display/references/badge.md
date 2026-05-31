# Badge

## Import

```tsx
import Badge from '@mui/material/Badge';
// 或
import { Badge } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import MailRounded from '@mui/icons-material/MailRounded';
import { useT } from '@/i18n';
import { badgeStyles } from './NotificationBadge.styles';

function NotificationBadge({ count }: { count: number }) {
  const theme = useTheme();
  const t = useT();
  const styles = badgeStyles(theme);

  return (
    <Badge
      badgeContent={count}
      sx={styles.root}
      aria-label={t('badge.notifications', { count })}
    >
      <MailRounded />
    </Badge>
  );
}
```

样式工厂：

```tsx
// NotificationBadge.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const badgeStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      '& .MuiBadge-badge': {
        bgcolor: fp.status.danger,
        color: fp.bg.base,
      },
    },
    success: {
      '& .MuiBadge-badge': {
        bgcolor: fp.status.success,
        color: fp.bg.base,
      },
    },
    warning: {
      '& .MuiBadge-badge': {
        bgcolor: fp.status.warning,
        color: fp.bg.base,
      },
    },
  };
};
```

## 所有 Variants

### 数字徽章

```tsx
<Badge badgeContent={4} sx={styles.root}>
  <MailRounded />
</Badge>

{/* 超过最大值显示 99+ */}
<Badge badgeContent={100} max={99} sx={styles.root}>
  <MailRounded />
</Badge>

{/* 值为 0 时隐藏（默认行为） */}
<Badge badgeContent={0} sx={styles.root}>
  <MailRounded />
</Badge>

{/* 值为 0 时仍显示 */}
<Badge badgeContent={0} showZero sx={styles.root}>
  <MailRounded />
</Badge>
```

### 圆点徽章（Dot）

```tsx
{/* 仅显示状态点，不显示数字 */}
<Badge variant="dot" sx={styles.success}>
  <MailRounded />
</Badge>
```

### 位置控制

```tsx
{/* 右上（默认） */}
<Badge badgeContent={4} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
  <MailRounded />
</Badge>

{/* 右下 */}
<Badge badgeContent={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
  <MailRounded />
</Badge>

{/* 左上 */}
<Badge badgeContent={4} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
  <MailRounded />
</Badge>
```

### 与 Avatar 组合

```tsx
import Avatar from '@mui/material/Avatar';

{/* 在线状态指示 */}
<Badge
  variant="dot"
  overlap="circular"
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  sx={styles.success}
>
  <Avatar src="/user.jpg" alt={t('user.avatar')} />
</Badge>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| badgeContent | `ReactNode` | — | 徽章内容（数字/文本） |
| variant | `'standard'\|'dot'` | `'standard'` | 徽章变体 |
| max | `number` | `99` | 最大显示数字 |
| showZero | `boolean` | `false` | 值为 0 时是否显示 |
| invisible | `boolean` | `false` | 是否隐藏徽章 |
| overlap | `'rectangular'\|'circular'` | `'rectangular'` | 重叠模式（配合子元素形状） |
| anchorOrigin | `{ vertical: 'top'\|'bottom', horizontal: 'left'\|'right' }` | `{ vertical: 'top', horizontal: 'right' }` | 徽章位置 |
| color | `string` | — | 颜色（Foundation 中用 sx 覆盖） |
| children | `ReactNode` | — | 被装饰的元素 |
| component | `ElementType` | `'span'` | 根元素 |
| components | `{ Badge?: ElementType, Root?: ElementType }` | — | 内部组件覆盖 |
| slotProps | `{ badge?: object, root?: object }` | — | 内部 slot 属性 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- 徽章本身不可聚焦，需确保父元素可访问
- 使用 `aria-label` 描述徽章含义
- 对于纯装饰性徽章，确保信息在其他地方也可获取

```tsx
<Badge badgeContent={4} sx={styles.root}>
  <MailRounded aria-label={t('badge.unread', { count: 4 })} />
</Badge>
```

## Foundation 约束

⚠️ **配色**：禁止使用 `color="primary"` 等 prop。通过 sx 的 `'& .MuiBadge-badge'` 选择器设置 `bgcolor`，只从 `fp.status.*` 或 `fp.accent` 取值。

⚠️ **图标**：被装饰的图标只用 `*Rounded` 系列。

⚠️ **i18n**：`aria-label` 必须走 `t('key')`。

⚠️ **在线状态**：与 Avatar 组合时使用 `overlap="circular"` + `variant="dot"`。
