# Tooltip / Icon / SvgIcon

## Import

```tsx
import Tooltip from '@mui/material/Tooltip';
import Icon from '@mui/material/Icon';
import SvgIcon from '@mui/material/SvgIcon';
// 或
import { Tooltip, Icon, SvgIcon } from '@mui/material';

// Material Icons（Foundation 唯一允许的图标来源）
import HomeRounded from '@mui/icons-material/HomeRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
```

## Tooltip 基础用法（Foundation 模式）

```tsx
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import { useT } from '@/i18n';
import { tooltipStyles } from './ActionBar.styles';

function ActionBar() {
  const theme = useTheme();
  const t = useT();
  const styles = tooltipStyles(theme);

  return (
    <Tooltip title={t('action.delete')} placement="bottom">
      <IconButton sx={styles.iconButton} aria-label={t('action.delete')}>
        <DeleteRounded />
      </IconButton>
    </Tooltip>
  );
}
```

样式工厂：

```tsx
// ActionBar.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const tooltipStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    iconButton: {
      color: fp.text.secondary,
      '&:hover': {
        color: fp.text.primary,
        bgcolor: fp.bg.hover,
      },
    },
  };
};
```

## Tooltip 所有 Variants

### 基础 Tooltip

```tsx
<Tooltip title={t('tooltip.info')}>
  <Typography>{t('hover.me')}</Typography>
</Tooltip>
```

### 位置控制

```tsx
{/* 12 个位置 */}
<Tooltip title={t('tip')} placement="top">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="top-start">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="top-end">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="bottom">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="bottom-start">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="bottom-end">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="left">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="left-start">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="left-end">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="right">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="right-start">{/* ... */}</Tooltip>
<Tooltip title={t('tip')} placement="right-end">{/* ... */}</Tooltip>
```

### 带箭头

```tsx
<Tooltip title={t('tooltip.with.arrow')} arrow>
  <IconButton aria-label={t('action.info')}>
    <InfoRounded />
  </IconButton>
</Tooltip>
```

### 延迟显示/隐藏

```tsx
<Tooltip
  title={t('tooltip.delayed')}
  enterDelay={500}
  leaveDelay={200}
>
  <span>{t('hover.delayed')}</span>
</Tooltip>
```

### 富文本内容

```tsx
<Tooltip
  title={
    <Box>
      <Typography variant="subtitle2">{t('tooltip.title')}</Typography>
      <Typography variant="caption">{t('tooltip.description')}</Typography>
    </Box>
  }
>
  <IconButton aria-label={t('action.help')}>
    <HelpRounded />
  </IconButton>
</Tooltip>
```

### 受控模式

```tsx
function ControlledTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip
      title={t('tooltip.controlled')}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <IconButton aria-label={t('action.info')}>
        <InfoRounded />
      </IconButton>
    </Tooltip>
  );
}
```

### 禁用元素的 Tooltip

```tsx
{/* 禁用元素需要包裹 span */}
<Tooltip title={t('tooltip.disabled.reason')}>
  <span>
    <IconButton disabled aria-label={t('action.disabled')}>
      <DeleteRounded />
    </IconButton>
  </span>
</Tooltip>
```

### 自定义样式

```tsx
<Tooltip
  title={t('tooltip.custom')}
  slotProps={{
    tooltip: {
      sx: {
        bgcolor: theme.palette.foundation.bg.elevated,
        color: theme.palette.foundation.text.primary,
        border: `1px solid ${theme.palette.foundation.divider}`,
        fontSize: '0.75rem',
      },
    },
    arrow: {
      sx: {
        color: theme.palette.foundation.bg.elevated,
      },
    },
  }}
>
  <span>{t('custom.tooltip')}</span>
</Tooltip>
```

## Tooltip Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| title | `ReactNode` | — | 提示内容（空字符串时不显示） |
| placement | `'top'\|'bottom'\|'left'\|'right'\|...-start\|...-end` | `'bottom'` | 位置 |
| arrow | `boolean` | `false` | 显示箭头 |
| open | `boolean` | — | 受控模式 |
| onOpen | `(event) => void` | — | 打开回调 |
| onClose | `(event) => void` | — | 关闭回调 |
| enterDelay | `number` | `100` | 显示延迟（ms） |
| leaveDelay | `number` | `0` | 隐藏延迟（ms） |
| enterNextDelay | `number` | `0` | 连续 Tooltip 间延迟 |
| enterTouchDelay | `number` | `700` | 触摸设备显示延迟 |
| leaveTouchDelay | `number` | `1500` | 触摸设备隐藏延迟 |
| disableFocusListener | `boolean` | `false` | 禁用焦点触发 |
| disableHoverListener | `boolean` | `false` | 禁用悬停触发 |
| disableTouchListener | `boolean` | `false` | 禁用触摸触发 |
| disableInteractive | `boolean` | `false` | 禁止鼠标进入 Tooltip |
| followCursor | `boolean` | `false` | 跟随光标 |
| TransitionComponent | `ElementType` | `Grow` | 过渡动画组件 |
| TransitionProps | `object` | — | 过渡动画属性 |
| slotProps | `{ tooltip?: object, arrow?: object, popper?: object }` | — | 内部 slot 属性 |
| children | `ReactElement` | — | 触发元素（必须能接收 ref） |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## Icon / SvgIcon

### Material Icons 用法（Foundation 标准）

```tsx
// Foundation 只允许 @mui/icons-material 的 *Rounded 系列
import HomeRounded from '@mui/icons-material/HomeRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';

// 直接使用
<HomeRounded />
<SettingsRounded fontSize="small" />
<DeleteRounded sx={{ color: theme.palette.foundation.status.danger }} />
```

### Icon 尺寸

```tsx
<HomeRounded fontSize="small" />    {/* 20px */}
<HomeRounded fontSize="medium" />   {/* 24px，默认 */}
<HomeRounded fontSize="large" />    {/* 35px */}
<HomeRounded sx={{ fontSize: 48 }} /> {/* 自定义 */}
```

### SvgIcon（自定义 SVG）

仅在 `@mui/icons-material` 没有合适图标时使用：

```tsx
import SvgIcon from '@mui/material/SvgIcon';

function CustomIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </SvgIcon>
  );
}

// 使用
<CustomIcon sx={{ color: theme.palette.foundation.text.primary }} />
```

### SvgIcon Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| children | `ReactNode` | — | SVG path 元素 |
| color | `string` | `'inherit'` | 颜色（Foundation 用 sx） |
| fontSize | `'inherit'\|'small'\|'medium'\|'large'` | `'medium'` | 尺寸 |
| htmlColor | `string` | — | 直接设置 fill 颜色 |
| inheritViewBox | `boolean` | `false` | 继承子 SVG 的 viewBox |
| shapeRendering | `string` | — | SVG shapeRendering 属性 |
| titleAccess | `string` | — | 无障碍标题 |
| viewBox | `string` | `'0 0 24 24'` | SVG viewBox |
| sx | `SxProps<Theme>` | — | 样式覆盖 |

## 无障碍 (a11y)

### Tooltip

- Tooltip 自动为子元素添加 `aria-describedby`
- 纯图标按钮必须同时有 `aria-label` 和 Tooltip
- Tooltip 内容应简短（1-2 句话）
- 不要在 Tooltip 中放置交互元素（按钮、链接）

### Icon

- 装饰性图标（有文本伴随）：无需额外属性
- 语义性图标（独立使用）：需要 `titleAccess` 或外层 `aria-label`
- IconButton 中的图标：由 IconButton 的 `aria-label` 提供语义

```tsx
{/* 装饰性 — 有文本伴随 */}
<ListItemIcon><HomeRounded /></ListItemIcon>
<ListItemText primary={t('nav.home')} />

{/* 语义性 — 独立使用 */}
<Tooltip title={t('action.delete')}>
  <IconButton aria-label={t('action.delete')}>
    <DeleteRounded />
  </IconButton>
</Tooltip>
```

## Foundation 约束

⚠️ **图标来源**：只允许 `@mui/icons-material` 的 `*Rounded` 系列。禁止 emoji、Unicode 符号、第三方 icon 包（如 react-icons、lucide）。

⚠️ **图标颜色**：通过 sx 的 `color` 从 `fp.text.*` / `fp.accent` / `fp.status.*` 取值，禁止 `color="primary"` prop。

⚠️ **Tooltip 文本**：`title` 属性必须走 `t('key')` 国际化。

⚠️ **IconButton + Tooltip**：纯图标按钮必须同时包裹 Tooltip 并设置 `aria-label`。

⚠️ **禁用元素**：禁用的按钮需要额外包裹 `<span>` 才能触发 Tooltip。

⚠️ **SvgIcon 限制**：仅在 Material Icons 库确实没有合适图标时才使用 SvgIcon 自定义，且必须保持 Rounded 风格一致性。
