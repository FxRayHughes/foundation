# Skeleton

## Import

```tsx
import Skeleton from '@mui/material/Skeleton';
```

或命名导入：

```tsx
import { Skeleton } from '@mui/material';
```

## ⚠️ Foundation 特别说明

Foundation 项目已有页面级骨架屏组件 `src/components/Skeleton/`。

- **页面级骨架**（整页加载占位）→ 使用项目自有 `src/components/Skeleton/`
- **组件级骨架**（单个卡片/列表项/头像占位）→ 使用 MUI `Skeleton`

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { skeletonStyles } from './UserCard.styles';

function UserCardSkeleton() {
  const theme = useTheme();
  const styles = skeletonStyles(theme);

  return (
    <Box sx={styles.root}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={styles.textGroup}>
        <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="40%" />
      </Box>
    </Box>
  );
}
```

## 条件渲染模式（数据加载后替换）

```tsx
function UserInfo({ user, loading }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {loading ? (
        <Skeleton variant="circular" width={48} height={48} />
      ) : (
        <Avatar src={user.avatar} />
      )}
      <Box>
        {loading ? (
          <Skeleton variant="text" width={120} sx={{ fontSize: '1rem' }} />
        ) : (
          <Typography>{user.name}</Typography>
        )}
      </Box>
    </Box>
  );
}
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'circular' \| 'rectangular' \| 'rounded' \| 'text'` | `'text'` | 形状变体 |
| animation | `'pulse' \| 'wave' \| false` | `'pulse'` | 动画类型 |
| width | `number \| string` | — | 宽度 |
| height | `number \| string` | — | 高度 |
| children | `ReactNode` | — | 子元素（用于推断尺寸） |
| component | `elementType` | `'span'` | 根元素类型 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- Skeleton 不需要额外的 aria 属性（纯视觉占位）
- 包含 Skeleton 的容器应标记 `aria-busy="true"`
- 数据加载完成后移除 `aria-busy` 或设为 `false`
- 配合 `aria-live="polite"` 让屏幕阅读器通知内容变化

```tsx
<Box aria-busy={loading} aria-live="polite">
  {loading ? <ListSkeleton count={3} /> : <ActualList items={items} />}
</Box>
```

## Foundation 约束

⚠️ **页面级骨架**：整页加载骨架使用项目自有的 `src/components/Skeleton/`（已匹配 AppLayout 三栏布局）。MUI Skeleton 仅用于组件级占位。

⚠️ **配色**：Skeleton 默认颜色已由主题统一，不要在 sx 中覆盖 `backgroundColor`。如必须自定义，从 `fp.bg.hover` 取值。

⚠️ **动画**：统一使用默认的 `pulse` 动画。不要混用 `wave` 和 `pulse`（视觉不一致）。

⚠️ **布局匹配**：Skeleton 的尺寸应尽量匹配最终渲染内容的尺寸，避免加载完成后页面跳动（CLS）。

⚠️ **不要过度使用**：短暂操作（< 300ms）不需要 Skeleton。仅对首屏加载和明显耗时操作使用。

样式工厂：

```tsx
// UserCard.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const skeletonStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      backgroundColor: fp.bg.surface,
    },
    textGroup: { flex: 1 },
  };
};
```

## 所有 Variants

### text（文本行，默认）

```tsx
<Skeleton variant="text" sx={{ fontSize: '1rem' }} />
<Skeleton variant="text" sx={{ fontSize: '2rem' }} />
```

`text` variant 高度自动匹配 `fontSize`，包含行间距。

### rectangular（矩形）

```tsx
<Skeleton variant="rectangular" width={210} height={118} />
```

### rounded（圆角矩形）

```tsx
<Skeleton variant="rounded" width={210} height={60} />
```

### circular（圆形）

```tsx
<Skeleton variant="circular" width={40} height={40} />
```

## 动画类型

### pulse（默认，脉冲闪烁）

```tsx
<Skeleton animation="pulse" />
```

### wave（波浪扫过）

```tsx
<Skeleton animation="wave" />
```

### false（无动画，静态灰块）

```tsx
<Skeleton animation={false} />
```

## 尺寸控制

```tsx
{/* 固定宽高 */}
<Skeleton width={200} height={40} />

{/* 百分比宽度 */}
<Skeleton width="80%" />

{/* 通过 sx 控制 */}
<Skeleton sx={{ width: '100%', height: 120 }} />
```

## 包裹子元素（推断尺寸）

Skeleton 可以包裹子元素，自动推断尺寸：

```tsx
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

{/* 文字骨架 — 自动匹配 Typography 高度 */}
<Skeleton>
  <Typography>placeholder</Typography>
</Skeleton>

{/* 头像骨架 — 自动匹配 Avatar 尺寸 */}
<Skeleton variant="circular">
  <Avatar />
</Skeleton>
```

## 列表骨架示例

```tsx
function ListSkeleton({ count = 5 }) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" sx={{ fontSize: '0.875rem' }} />
            <Skeleton variant="text" width="40%" sx={{ fontSize: '0.75rem' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
```

## 卡片骨架示例

```tsx
function CardSkeleton() {
  return (
    <Box sx={{ width: 300 }}>
      <Skeleton variant="rectangular" height={140} />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} width="80%" />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="60%" />
      </Box>
    </Box>
  );
}
```

## 条件渲染模式（数据加载后替换）

```tsx
function UserInfo({ user, loading }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {loading ? (
        <Skeleton variant="circular" width={48} height={48} />
      ) : (
        <Avatar src={user.avatar} />
      )}
      <Box>
        {loading ? (
          <Skeleton variant="text" width={120} sx={{ fontSize: '1rem' }} />
        ) : (
          <Typography>{user.name}</Typography>
        )}
      </Box>
    </Box>
  );
}
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'circular' \| 'rectangular' \| 'rounded' \| 'text'` | `'text'` | 形状变体 |
| animation | `'pulse' \| 'wave' \| false` | `'pulse'` | 动画类型 |
| width | `number \| string` | — | 宽度 |
| height | `number \| string` | — | 高度 |
| children | `ReactNode` | — | 子元素（用于推断尺寸） |
| component | `elementType` | `'span'` | 根元素类型 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- Skeleton 不需要额外的 aria 属性（纯视觉占位）
- 包含 Skeleton 的容器应标记 `aria-busy="true"`
- 数据加载完成后移除 `aria-busy` 或设为 `false`
- 配合 `aria-live="polite"` 让屏幕阅读器通知内容变化

```tsx
<Box aria-busy={loading} aria-live="polite">
  {loading ? <ListSkeleton count={3} /> : <ActualList items={items} />}
</Box>
```

## Foundation 约束

⚠️ **页面级骨架**：整页加载骨架使用项目自有的 `src/components/Skeleton/`（已匹配 AppLayout 三栏布局）。MUI Skeleton 仅用于组件级占位。

⚠️ **配色**：Skeleton 默认颜色已由主题统一，不要在 sx 中覆盖 `backgroundColor`。如必须自定义，从 `fp.bg.hover` 取值。

⚠️ **动画**：统一使用默认的 `pulse` 动画。不要混用 `wave` 和 `pulse`（视觉不一致）。

⚠️ **布局匹配**：Skeleton 的尺寸应尽量匹配最终渲染内容的尺寸，避免加载完成后页面跳动（CLS）。

⚠️ **不要过度使用**：短暂操作（< 300ms）不需要 Skeleton。仅对首屏加载和明显耗时操作使用。
