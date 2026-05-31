# CircularProgress / LinearProgress

## Import

```tsx
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
```

或命名导入：

```tsx
import { CircularProgress, LinearProgress } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useT } from '@/i18n';
import { progressStyles } from './Download.styles';

function DownloadProgress({ progress }) {
  const theme = useTheme();
  const t = useT();
  const styles = progressStyles(theme);

  return (
    <Box sx={styles.root}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={styles.bar}
        aria-label={t('a11y.downloadProgress')}
      />
      <Typography sx={styles.label}>
        {t('download.progress', { percent: progress })}
      </Typography>
    </Box>
  );
}
```

## 颜色

两种 Progress 都支持 `color` prop：

```tsx
<CircularProgress color="secondary" />
<CircularProgress color="success" />
<CircularProgress color="inherit" />  {/* 继承父元素颜色 */}

<LinearProgress color="secondary" />
<LinearProgress color="warning" />
```

| color | 说明 |
|-------|------|
| `'primary'` | 默认主色 |
| `'secondary'` | 次要色 |
| `'error'` | 错误红 |
| `'info'` | 信息蓝 |
| `'success'` | 成功绿 |
| `'warning'` | 警告橙 |
| `'inherit'` | 继承父元素 |

## Props 完整参考

### CircularProgress

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'determinate' \| 'indeterminate'` | `'indeterminate'` | 进度类型 |
| value | `number` | — | 进度值 0-100（determinate 时必填） |
| size | `number \| string` | `40` | 直径（px 或 CSS 值） |
| thickness | `number` | `3.6` | 圆环粗细 |
| color | `string` | `'primary'` | 颜色 |
| disableShrink | `boolean` | `false` | 禁用收缩动画 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### LinearProgress

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'buffer'\|'determinate'\|'indeterminate'\|'query'` | `'indeterminate'` | 进度类型 |
| value | `number` | — | 进度值 0-100 |
| valueBuffer | `number` | — | 缓冲值（buffer variant） |
| color | `string` | `'primary'` | 颜色 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- Progress 组件默认 `role="progressbar"`
- determinate 模式自动设置 `aria-valuenow`、`aria-valuemin`、`aria-valuemax`
- 添加 `aria-label` 描述进度含义

```tsx
<CircularProgress
  variant="determinate"
  value={progress}
  aria-label={t('a11y.uploadProgress')}
/>

<LinearProgress
  variant="determinate"
  value={progress}
  aria-label={t('a11y.fileDownload')}
/>
```

对于 indeterminate 模式，配合 `aria-busy` 使用：

```tsx
<Box aria-busy={loading} aria-live="polite">
  {loading && <LinearProgress aria-label={t('a11y.loading')} />}
  {/* 内容 */}
</Box>
```

## Foundation 约束

⚠️ **配色**：不要硬编码进度条颜色。使用 `color` prop 的语义值或在样式工厂中从 `fp.accent` 取值。

⚠️ **场景选择**：
- 页面整体加载 → `LinearProgress` 放在顶部
- 按钮内加载 → `CircularProgress size={20}` + `color="inherit"`
- 全屏阻断 → `Backdrop` + `CircularProgress`
- 内容占位 → 用 `Skeleton`（不是 Progress）

⚠️ **i18n**：`aria-label` 和百分比文字必须走 `t('key')`。

⚠️ **图标**：不要用图标替代 Progress 组件。加载状态统一用 MUI Progress。

样式工厂：

```tsx
// Download.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const progressStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: { display: 'flex', alignItems: 'center', gap: 2 },
    bar: { flex: 1, borderRadius: 1 },
    label: { color: fp.text.secondary, minWidth: 48 },
  };
};
```

## CircularProgress — 所有 Variants

### indeterminate（不确定进度，默认）

```tsx
<CircularProgress />
```

### determinate（确定进度）

```tsx
<CircularProgress variant="determinate" value={75} />
```

## CircularProgress — 尺寸

```tsx
<CircularProgress size={20} />  {/* 小 */}
<CircularProgress size={40} />  {/* 默认 */}
<CircularProgress size={60} />  {/* 大 */}
```

也可用字符串：

```tsx
<CircularProgress size="3rem" />
```

## CircularProgress — 厚度

```tsx
<CircularProgress thickness={2} />  {/* 细 */}
<CircularProgress thickness={3.6} /> {/* 默认 */}
<CircularProgress thickness={6} />  {/* 粗 */}
```

## CircularProgress — 带标签

```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function CircularWithLabel({ value }) {
  const t = useT();
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={value} />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t('progress.percent', { value: Math.round(value) })}
        </Typography>
      </Box>
    </Box>
  );
}
```

## 颜色

两种 Progress 都支持 `color` prop：

```tsx
<CircularProgress color="secondary" />
<CircularProgress color="success" />
<CircularProgress color="inherit" />  {/* 继承父元素颜色 */}

<LinearProgress color="secondary" />
<LinearProgress color="warning" />
```

| color | 说明 |
|-------|------|
| `'primary'` | 默认主色 |
| `'secondary'` | 次要色 |
| `'error'` | 错误红 |
| `'info'` | 信息蓝 |
| `'success'` | 成功绿 |
| `'warning'` | 警告橙 |
| `'inherit'` | 继承父元素 |

## Props 完整参考

### CircularProgress

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'determinate' \| 'indeterminate'` | `'indeterminate'` | 进度类型 |
| value | `number` | — | 进度值 0-100（determinate 时必填） |
| size | `number \| string` | `40` | 直径（px 或 CSS 值） |
| thickness | `number` | `3.6` | 圆环粗细 |
| color | `string` | `'primary'` | 颜色 |
| disableShrink | `boolean` | `false` | 禁用收缩动画 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### LinearProgress

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'buffer'\|'determinate'\|'indeterminate'\|'query'` | `'indeterminate'` | 进度类型 |
| value | `number` | — | 进度值 0-100 |
| valueBuffer | `number` | — | 缓冲值（buffer variant） |
| color | `string` | `'primary'` | 颜色 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- Progress 组件默认 `role="progressbar"`
- determinate 模式自动设置 `aria-valuenow`、`aria-valuemin`、`aria-valuemax`
- 添加 `aria-label` 描述进度含义

```tsx
<CircularProgress
  variant="determinate"
  value={progress}
  aria-label={t('a11y.uploadProgress')}
/>

<LinearProgress
  variant="determinate"
  value={progress}
  aria-label={t('a11y.fileDownload')}
/>
```

对于 indeterminate 模式，配合 `aria-busy` 使用：

```tsx
<Box aria-busy={loading} aria-live="polite">
  {loading && <LinearProgress aria-label={t('a11y.loading')} />}
  {/* 内容 */}
</Box>
```

## Foundation 约束

⚠️ **配色**：不要硬编码进度条颜色。使用 `color` prop 的语义值或在样式工厂中从 `fp.accent` 取值。

⚠️ **场景选择**：
- 页面整体加载 → `LinearProgress` 放在顶部
- 按钮内加载 → `CircularProgress size={20}` + `color="inherit"`
- 全屏阻断 → `Backdrop` + `CircularProgress`
- 内容占位 → 用 `Skeleton`（不是 Progress）

⚠️ **i18n**：`aria-label` 和百分比文字必须走 `t('key')`。

⚠️ **图标**：不要用图标替代 Progress 组件。加载状态统一用 MUI Progress。

## LinearProgress — 所有 Variants

### indeterminate（不确定，默认）

```tsx
<LinearProgress />
```

### determinate（确定进度）

```tsx
<LinearProgress variant="determinate" value={50} />
```

### buffer（缓冲）

```tsx
<LinearProgress variant="buffer" value={60} valueBuffer={80} />
```

### query（查询中）

```tsx
<LinearProgress variant="query" />
```

## LinearProgress — 带百分比标签

```tsx
function LinearWithLabel({ value }) {
  const t = useT();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {t('progress.percent', { value: Math.round(value) })}
      </Typography>
    </Box>
  );
}
```

## 颜色

两种 Progress 都支持 `color` prop：

```tsx
<CircularProgress color="secondary" />
<CircularProgress color="success" />
<CircularProgress color="inherit" />  {/* 继承父元素颜色 */}

<LinearProgress color="secondary" />
<LinearProgress color="warning" />
```

| color | 说明 |
|-------|------|
| `'primary'` | 默认主色 |
| `'secondary'` | 次要色 |
| `'error'` | 错误红 |
| `'info'` | 信息蓝 |
| `'success'` | 成功绿 |
| `'warning'` | 警告橙 |
| `'inherit'` | 继承父元素 |

## Props 完整参考

### CircularProgress

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'determinate' \| 'indeterminate'` | `'indeterminate'` | 进度类型 |
| value | `number` | — | 进度值 0-100（determinate 时必填） |
| size | `number \| string` | `40` | 直径（px 或 CSS 值） |
| thickness | `number` | `3.6` | 圆环粗细 |
| color | `string` | `'primary'` | 颜色 |
| disableShrink | `boolean` | `false` | 禁用收缩动画 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

### LinearProgress

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'buffer'\|'determinate'\|'indeterminate'\|'query'` | `'indeterminate'` | 进度类型 |
| value | `number` | — | 进度值 0-100 |
| valueBuffer | `number` | — | 缓冲值（buffer variant） |
| color | `string` | `'primary'` | 颜色 |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

- Progress 组件默认 `role="progressbar"`
- determinate 模式自动设置 `aria-valuenow`、`aria-valuemin`、`aria-valuemax`
- 添加 `aria-label` 描述进度含义

```tsx
<CircularProgress
  variant="determinate"
  value={progress}
  aria-label={t('a11y.uploadProgress')}
/>

<LinearProgress
  variant="determinate"
  value={progress}
  aria-label={t('a11y.fileDownload')}
/>
```

对于 indeterminate 模式，配合 `aria-busy` 使用：

```tsx
<Box aria-busy={loading} aria-live="polite">
  {loading && <LinearProgress aria-label={t('a11y.loading')} />}
  {/* 内容 */}
</Box>
```

## Foundation 约束

⚠️ **配色**：不要硬编码进度条颜色。使用 `color` prop 的语义值或在样式工厂中从 `fp.accent` 取值。

⚠️ **场景选择**：
- 页面整体加载 → `LinearProgress` 放在顶部
- 按钮内加载 → `CircularProgress size={20}` + `color="inherit"`
- 全屏阻断 → `Backdrop` + `CircularProgress`
- 内容占位 → 用 `Skeleton`（不是 Progress）

⚠️ **i18n**：`aria-label` 和百分比文字必须走 `t('key')`。

⚠️ **图标**：不要用图标替代 Progress 组件。加载状态统一用 MUI Progress。
