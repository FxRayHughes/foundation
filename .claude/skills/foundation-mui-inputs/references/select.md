# Select

MUI 9 的 Select 组件用于从预定义选项列表中选择值。Foundation 中常搭配 FormControl + InputLabel 使用。

## Import

```tsx
import {
  Select, MenuItem, FormControl, InputLabel, FormHelperText
} from '@mui/material';
// NativeSelect（原生下拉，移动端更友好）
import { NativeSelect } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { selectStyles } from './MySelect.styles';

function MySelect() {
  const theme = useTheme();
  const t = useT();
  const styles = selectStyles(theme);
  const [value, setValue] = useState('');

  return (
    <FormControl size="small" sx={styles.formControl}>
      <InputLabel>{t('form.language.label')}</InputLabel>
      <Select
        value={value}
        label={t('form.language.label')}
        onChange={(e) => setValue(e.target.value)}
      >
        <MenuItem value="zh-CN">{t('lang.zhCN')}</MenuItem>
        <MenuItem value="en-US">{t('lang.enUS')}</MenuItem>
      </Select>
    </FormControl>
  );
}
```

```tsx
// MySelect.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const selectStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    formControl: {
      minWidth: 120,
      '& .MuiOutlinedInput-root': {
        backgroundColor: fp.bg.surface,
      },
    },
  };
};
```

## 所有 Variants

### outlined（默认）

```tsx
<FormControl variant="outlined" size="small">
  <InputLabel>{t('form.category')}</InputLabel>
  <Select value={value} label={t('form.category')} onChange={handleChange}>
    <MenuItem value="a">{t('category.a')}</MenuItem>
    <MenuItem value="b">{t('category.b')}</MenuItem>
  </Select>
</FormControl>
```

### filled

```tsx
<FormControl variant="filled" size="small">
  <InputLabel>{t('form.category')}</InputLabel>
  <Select value={value} label={t('form.category')} onChange={handleChange}>
    <MenuItem value="a">{t('category.a')}</MenuItem>
  </Select>
</FormControl>
```

### standard

```tsx
<FormControl variant="standard">
  <InputLabel>{t('form.category')}</InputLabel>
  <Select value={value} onChange={handleChange}>
    <MenuItem value="a">{t('category.a')}</MenuItem>
  </Select>
</FormControl>
```

## 多选 (Multiple)

```tsx
const [selected, setSelected] = useState<string[]>([]);

<FormControl size="small" fullWidth>
  <InputLabel>{t('form.tags')}</InputLabel>
  <Select
    multiple
    value={selected}
    label={t('form.tags')}
    onChange={(e) => setSelected(e.target.value as string[])}
    renderValue={(selected) => selected.join(', ')}
  >
    {options.map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>
        <Checkbox checked={selected.includes(opt.value)} />
        <ListItemText primary={t(opt.labelKey)} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
```

## 带分组

```tsx
import { ListSubheader } from '@mui/material';

<Select value={value} label={t('form.food')} onChange={handleChange}>
  <ListSubheader>{t('food.fruits')}</ListSubheader>
  <MenuItem value="apple">{t('food.apple')}</MenuItem>
  <MenuItem value="banana">{t('food.banana')}</MenuItem>
  <ListSubheader>{t('food.vegetables')}</ListSubheader>
  <MenuItem value="carrot">{t('food.carrot')}</MenuItem>
</Select>
```

## NativeSelect（移动端友好）

```tsx
import { NativeSelect, FormControl, InputLabel } from '@mui/material';

<FormControl size="small">
  <InputLabel variant="standard">{t('form.os')}</InputLabel>
  <NativeSelect value={value} onChange={handleChange}>
    <option value="windows">Windows</option>
    <option value="macos">macOS</option>
    <option value="linux">Linux</option>
  </NativeSelect>
</FormControl>
```

## 带辅助文本和错误

```tsx
<FormControl size="small" error={!!error} fullWidth>
  <InputLabel>{t('form.role')}</InputLabel>
  <Select value={value} label={t('form.role')} onChange={handleChange}>
    <MenuItem value="admin">{t('role.admin')}</MenuItem>
    <MenuItem value="user">{t('role.user')}</MenuItem>
  </Select>
  <FormHelperText>
    {error ? t('form.role.error') : t('form.role.helper')}
  </FormHelperText>
</FormControl>
```

## Props 完整参考

### Select Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| value | `any` | - | 受控值 |
| defaultValue | `any` | - | 非受控默认值 |
| onChange | `(event, child) => void` | - | 值变化回调 |
| variant | `'outlined' \| 'filled' \| 'standard'` | `'outlined'` | 样式变体 |
| size | `'small' \| 'medium'` | `'small'`（主题） | 尺寸 |
| multiple | `boolean` | `false` | 多选模式 |
| displayEmpty | `boolean` | `false` | 值为空时是否显示 placeholder |
| renderValue | `(value) => ReactNode` | - | 自定义已选值的渲染 |
| label | `ReactNode` | - | 标签（需与 InputLabel 一致） |
| error | `boolean` | `false` | 错误状态（通过 FormControl 传递） |
| disabled | `boolean` | `false` | 禁用 |
| fullWidth | `boolean` | `false` | 撑满容器 |
| native | `boolean` | `false` | 使用原生 select 元素 |
| autoWidth | `boolean` | `false` | 自动宽度 |
| MenuProps | `object` | - | 下拉菜单的 Props |
| sx | `SxProps<Theme>` | - | 自定义样式 |

### MenuItem Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| value | `any` | - | 选项值 |
| disabled | `boolean` | `false` | 禁用此选项 |
| selected | `boolean` | - | 选中状态（自动管理） |
| dense | `boolean` | `false` | 紧凑模式 |

## 受控 vs 非受控

```tsx
// 受控（推荐）
const [value, setValue] = useState('');
<Select value={value} onChange={(e) => setValue(e.target.value)} />

// 非受控
<Select defaultValue="option1" />
```

## 无障碍 (a11y)

- `InputLabel` 自动关联 Select 的 `aria-labelledby`
- 无 label 时必须提供 `aria-label`（走 t()）
- `FormHelperText` 自动关联 `aria-describedby`
- 键盘导航：上下箭头选择，Enter 确认，Escape 关闭
- 多选模式下 `aria-multiselectable="true"` 自动设置

## Foundation 约束

⚠️ **FormControl 包裹**：Select 必须放在 `<FormControl>` 内，配合 `<InputLabel>` 使用

⚠️ **label 同步**：`<InputLabel>` 的文本必须与 `<Select label={...}>` 一致（outlined variant 需要）

⚠️ **配色**：自定义样式从 `theme.palette.foundation.*` 取

⚠️ **i18n**：label、MenuItem 文本、helperText 全部走 `t('key')`

⚠️ **size**：主题默认 `size="small"`，FormControl 也要设置 `size="small"` 保持一致
