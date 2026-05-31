# ToggleButton / ToggleButtonGroup

MUI 9 的 ToggleButton 组件用于互斥或多选的按钮组，常用于视图切换、格式工具栏等场景。

## Import

```tsx
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
// 图标（只用 *Rounded 系列）
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
```

## 基础用法（Foundation 模式）

```tsx
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import { toggleStyles } from './MyToggle.styles';

function MyToggle() {
  const theme = useTheme();
  const t = useT();
  const styles = toggleStyles(theme);
  const [view, setView] = useState('list');

  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={(_, newView) => { if (newView !== null) setView(newView); }}
      aria-label={t('aria.viewMode')}
      sx={styles.group}
    >
      <ToggleButton value="list" aria-label={t('aria.listView')}>
        <ViewListRoundedIcon />
      </ToggleButton>
      <ToggleButton value="grid" aria-label={t('aria.gridView')}>
        <ViewModuleRoundedIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
```

```tsx
// MyToggle.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const toggleStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    group: {
      '& .Mui-selected': {
        backgroundColor: fp.bg.active,
        color: fp.accent,
        '&:hover': { backgroundColor: fp.bg.hover },
      },
    },
  };
};
```

## 互斥选择 (Exclusive)

同一时间只能选中一个：

```tsx
const [alignment, setAlignment] = useState('left');

<ToggleButtonGroup
  value={alignment}
  exclusive
  onChange={(_, newAlignment) => {
    if (newAlignment !== null) setAlignment(newAlignment);
  }}
  aria-label={t('aria.textAlignment')}
>
  <ToggleButton value="left" aria-label={t('aria.alignLeft')}>
    <FormatAlignLeftRoundedIcon />
  </ToggleButton>
  <ToggleButton value="center" aria-label={t('aria.alignCenter')}>
    <FormatAlignCenterRoundedIcon />
  </ToggleButton>
  <ToggleButton value="right" aria-label={t('aria.alignRight')}>
    <FormatAlignRightRoundedIcon />
  </ToggleButton>
</ToggleButtonGroup>
```

> ⚠️ exclusive 模式下，`onChange` 的 newValue 可能为 `null`（取消选中），需要判断。

## 多选模式

```tsx
const [formats, setFormats] = useState<string[]>(['bold']);

<ToggleButtonGroup
  value={formats}
  onChange={(_, newFormats) => setFormats(newFormats)}
  aria-label={t('aria.textFormatting')}
>
  <ToggleButton value="bold" aria-label={t('aria.bold')}>
    <FormatBoldRoundedIcon />
  </ToggleButton>
  <ToggleButton value="italic" aria-label={t('aria.italic')}>
    <FormatItalicRoundedIcon />
  </ToggleButton>
  <ToggleButton value="underline" aria-label={t('aria.underline')}>
    <FormatUnderlinedRoundedIcon />
  </ToggleButton>
</ToggleButtonGroup>
```

## 带文字的 ToggleButton

```tsx
<ToggleButtonGroup
  value={period}
  exclusive
  onChange={(_, v) => { if (v !== null) setPeriod(v); }}
  aria-label={t('aria.timePeriod')}
>
  <ToggleButton value="day">{t('period.day')}</ToggleButton>
  <ToggleButton value="week">{t('period.week')}</ToggleButton>
  <ToggleButton value="month">{t('period.month')}</ToggleButton>
</ToggleButtonGroup>
```

## 垂直方向

```tsx
<ToggleButtonGroup
  orientation="vertical"
  value={view}
  exclusive
  onChange={handleChange}
  aria-label={t('aria.viewMode')}
>
  <ToggleButton value="list" aria-label={t('aria.listView')}>
    <ViewListRoundedIcon />
  </ToggleButton>
  <ToggleButton value="grid" aria-label={t('aria.gridView')}>
    <ViewModuleRoundedIcon />
  </ToggleButton>
</ToggleButtonGroup>
```

## Sizes

```tsx
<ToggleButtonGroup size="small">...</ToggleButtonGroup>
<ToggleButtonGroup size="medium">...</ToggleButtonGroup>  {/* 默认 */}
<ToggleButtonGroup size="large">...</ToggleButtonGroup>
```

## Colors

```tsx
<ToggleButtonGroup color="primary">...</ToggleButtonGroup>
<ToggleButtonGroup color="secondary">...</ToggleButtonGroup>
<ToggleButtonGroup color="success">...</ToggleButtonGroup>
<ToggleButtonGroup color="error">...</ToggleButtonGroup>
```

## 禁用

```tsx
{/* 禁用整组 */}
<ToggleButtonGroup disabled>...</ToggleButtonGroup>

{/* 禁用单个 */}
<ToggleButtonGroup value={value} exclusive onChange={handleChange}>
  <ToggleButton value="a">{t('opt.a')}</ToggleButton>
  <ToggleButton value="b" disabled>{t('opt.b')}</ToggleButton>
  <ToggleButton value="c">{t('opt.c')}</ToggleButton>
</ToggleButtonGroup>
```

## fullWidth

```tsx
<ToggleButtonGroup fullWidth value={value} exclusive onChange={handleChange}>
  <ToggleButton value="a">{t('opt.a')}</ToggleButton>
  <ToggleButton value="b">{t('opt.b')}</ToggleButton>
</ToggleButtonGroup>
```

## Props 完整参考

### ToggleButtonGroup Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| value | `any` | - | 受控值（exclusive 时为单值，否则为数组） |
| onChange | `(event, value) => void` | - | 值变化回调 |
| exclusive | `boolean` | `false` | 互斥模式（单选） |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 统一尺寸 |
| color | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'standard'` | `'standard'` | 选中颜色 |
| disabled | `boolean` | `false` | 禁用整组 |
| fullWidth | `boolean` | `false` | 撑满容器 |
| aria-label | `string` | - | 无障碍标签（走 t()） |
| sx | `SxProps<Theme>` | - | 自定义样式 |

### ToggleButton Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| value | `any` | **必填** | 此按钮的值 |
| selected | `boolean` | - | 选中状态（Group 自动管理） |
| disabled | `boolean` | `false` | 禁用 |
| color | 同 Group | - | 单独颜色 |
| size | 同 Group | - | 单独尺寸 |
| fullWidth | `boolean` | `false` | 撑满 |
| aria-label | `string` | - | 无障碍标签（走 t()） |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 无障碍 (a11y)

- `ToggleButtonGroup` **必须**提供 `aria-label`（走 t()）
- 纯图标的 `ToggleButton` **必须**提供 `aria-label`（走 t()）
- 自动设置 `aria-pressed` 表示选中状态
- 键盘：Tab 进入组，左右箭头在按钮间移动

## Foundation 约束

⚠️ **exclusive null 检查**：exclusive 模式下 onChange 的 newValue 可能为 null，必须判断

⚠️ **配色**：选中状态颜色从 `theme.palette.foundation.*` 取

⚠️ **图标**：只用 `*Rounded` 系列

⚠️ **i18n**：`aria-label`（Group 和纯图标 Button）、文字按钮内容全部走 `t('key')`

⚠️ **圆角**：主题已统一，勿在 sx 覆盖 borderRadius
