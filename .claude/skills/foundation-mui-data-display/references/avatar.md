# Avatar / AvatarGroup

## Import

```tsx
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
// 或
import { Avatar, AvatarGroup } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import PersonRounded from '@mui/icons-material/PersonRounded';
import { useT } from '@/i18n';
import { avatarStyles } from './UserAvatar.styles';

function UserAvatar({ name, src }: { name: string; src?: string }) {
  const theme = useTheme();
  const t = useT();
  const styles = avatarStyles(theme);

  return (
    <Avatar
      sx={styles.root}
      src={src}
      alt={t('avatar.alt', { name })}
    >
      {!src && <PersonRounded />}
    </Avatar>
  );
}
```

样式工厂：

```tsx
// UserAvatar.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const avatarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      bgcolor: fp.bg.elevated,
      color: fp.text.primary,
      width: 40,
      height: 40,
    },
    small: {
      bgcolor: fp.bg.surface,
      color: fp.text.secondary,
      width: 24,
      height: 24,
      fontSize: '0.75rem',
    },
    large: {
      bgcolor: fp.accent,
      color: fp.bg.base,
      width: 56,
      height: 56,
    },
  };
};
```

## 所有 Variants

### 图片头像

```tsx
<Avatar src="/path/to/photo.jpg" alt={t('user.avatar.alt')} />
```

### 字母头像（Fallback）

```tsx
{/* 自动取首字母 */}
<Avatar sx={styles.root}>H</Avatar>
<Avatar sx={styles.root}>RA</Avatar>
```

### 图标头像

```tsx
import FolderRounded from '@mui/icons-material/FolderRounded';

<Avatar sx={styles.root}>
  <FolderRounded />
</Avatar>
```

### 不同形状

```tsx
{/* 圆形（默认） */}
<Avatar variant="circular" src={src} alt={alt} />

{/* 圆角方形 */}
<Avatar variant="rounded" src={src} alt={alt} />

{/* 方形 */}
<Avatar variant="square" src={src} alt={alt} />
```

## AvatarGroup 用法

```tsx
import AvatarGroup from '@mui/material/AvatarGroup';

<AvatarGroup max={4} sx={styles.group}>
  <Avatar alt={t('user.1')} src="/user1.jpg" />
  <Avatar alt={t('user.2')} src="/user2.jpg" />
  <Avatar alt={t('user.3')} src="/user3.jpg" />
  <Avatar alt={t('user.4')} src="/user4.jpg" />
  <Avatar alt={t('user.5')} src="/user5.jpg" />
</AvatarGroup>
```

超出 `max` 的头像会显示为 `+N` 计数。

## Props 完整参考

### Avatar Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| alt | `string` | — | 图片替代文本（a11y 必填） |
| src | `string` | — | 图片 URL |
| srcSet | `string` | — | 响应式图片 srcSet |
| sizes | `string` | — | 响应式 sizes 属性 |
| variant | `'circular'\|'rounded'\|'square'` | `'circular'` | 形状变体 |
| component | `ElementType` | `'div'` | 根元素类型 |
| imgProps | `object` | — | 传递给内部 `<img>` 的属性 |
| children | `ReactNode` | — | 回退内容（字母/图标） |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### AvatarGroup Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| max | `number` | `5` | 最多显示数量 |
| total | `number` | — | 总数（用于计算 +N） |
| spacing | `'small'\|'medium'\|number` | `'medium'` | 头像间重叠间距 |
| variant | `'circular'\|'rounded'\|'square'` | `'circular'` | 统一子头像形状 |
| renderSurplus | `(surplus: number) => ReactNode` | — | 自定义 +N 渲染 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## Sizes

Foundation 推荐的尺寸规范：

| 场景 | 尺寸 | sx |
|------|------|-----|
| 列表项 / 消息 | 32px | `{ width: 32, height: 32 }` |
| 默认 | 40px | 无需设置（MUI 默认） |
| 卡片头部 | 48px | `{ width: 48, height: 48 }` |
| 个人资料 | 56-80px | `{ width: 56, height: 56 }` |

## 图片加载失败回退

Avatar 自动处理图片加载失败，按以下顺序回退：
1. `src` 图片 → 2. `children`（字母/图标）→ 3. 默认 PersonRounded 图标

```tsx
{/* 图片失败时显示首字母 */}
<Avatar src="/broken-link.jpg" alt={t('user.name')}>
  N
</Avatar>
```

## 无障碍 (a11y)

- 图片头像必须提供 `alt` 属性
- 装饰性头像使用 `alt=""`
- AvatarGroup 中每个 Avatar 都需要独立的 `alt`
- 图标头像需要通过 `aria-label` 提供语义

```tsx
<Avatar aria-label={t('avatar.user.profile')}>
  <PersonRounded />
</Avatar>
```

## Foundation 约束

⚠️ **配色**：`bgcolor` 只从 `fp.bg.*` 或 `fp.accent` 取值，禁止硬编码 hex。

⚠️ **图标**：回退图标只用 `*Rounded` 系列（如 `PersonRounded`、`FolderRounded`）。

⚠️ **i18n**：`alt` 属性必须走 `t('key')`，不可硬编码字符串。

⚠️ **圆角**：`variant="rounded"` 的圆角由主题统一控制，不要在 sx 中覆盖 `borderRadius`。
