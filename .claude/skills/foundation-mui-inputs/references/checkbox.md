# Checkbox

MUI 9 的 Checkbox 组件用于布尔选择或多选场景。Foundation 中通常搭配 FormControlLabel 使用。

## Import

```tsx
import { Checkbox, FormControlLabel, FormGroup, FormControl, FormLabel } from '@mui/material';
// 自定义图标（可选）
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
```

## 基础用法（Foundation 模式）

```tsx
import { Checkbox, FormControlLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { checkboxStyles } from './MyCheckbox.styles';

function MyCheckbox() {
  const theme = useTheme();
  const t = useT();
  const styles = checkboxStyles(theme);
  const [checked, setChecked] = useState(false);

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          sx={styles.checkbox}
        />
      }
      label={t('form.agreeTerms')}
    />
  );
}
```

```tsx
// MyCheckbox.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const checkboxStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    checkbox: {
      color: fp.text.muted,
      '&.Mui-checked': { color: fp.accent },
    },
  };
};
```

## 基本变体

### 带标签

```tsx
<FormControlLabel
  control={<Checkbox checked={checked} onChange={handleChange} />}
  label={t('form.rememberMe')}
/>
```

### 无标签（独立使用）

```tsx
<Checkbox
  checked={checked}
  onChange={handleChange}
  inputProps={{ 'aria-label': t('aria.selectRow') }}
/>
```

### 不确定状态 (Indeterminate)

用于"全选"场景，部分子项选中时显示横线：

```tsx
function IndeterminateExample() {
  const t = useT();
  const [checked, setChecked] = useState([true, false]);

  const allChecked = checked.every(Boolean);
  const indeterminate = checked.some(Boolean) && !allChecked;

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={allChecked}
            indeterminate={indeterminate}
            onChange={(e) => setChecked([e.target.checked, e.target.checked])}
          />
        }
        label={t('form.selectAll')}
      />
      <FormGroup sx={{ ml: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked[0]}
              onChange={(e) => setChecked([e.target.checked, checked[1]])}
            />
          }
          label={t('form.option1')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={checked[1]}
              onChange={(e) => setChecked([checked[0], e.target.checked])}
            />
          }
          label={t('form.option2')}
        />
      </FormGroup>
    </>
  );
}
```

## FormGroup（多个 Checkbox 分组）

```tsx
<FormControl component="fieldset">
  <FormLabel component="legend">{t('form.interests')}</FormLabel>
  <FormGroup>
    <FormControlLabel control={<Checkbox />} label={t('interest.music')} />
    <FormControlLabel control={<Checkbox />} label={t('interest.sports')} />
    <FormControlLabel control={<Checkbox />} label={t('interest.reading')} />
  </FormGroup>
</FormControl>

{/* 水平排列 */}
<FormGroup row>
  <FormControlLabel control={<Checkbox />} label={t('day.mon')} />
  <FormControlLabel control={<Checkbox />} label={t('day.tue')} />
  <FormControlLabel control={<Checkbox />} label={t('day.wed')} />
</FormGroup>
```

## Sizes

```tsx
<Checkbox size="small" />  {/* 20px */}
<Checkbox size="medium" /> {/* 24px，默认 */}
<Checkbox size="large" />  {/* 28px */}
```

## Colors

```tsx
<Checkbox color="primary" />   {/* 默认 */}
<Checkbox color="secondary" />
<Checkbox color="success" />
<Checkbox color="error" />
<Checkbox color="warning" />
<Checkbox color="info" />
<Checkbox color="default" />
```

## 自定义图标

```tsx
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';

<Checkbox
  icon={<CheckBoxOutlineBlankRoundedIcon />}
  checkedIcon={<CheckBoxRoundedIcon />}
/>
```

## 标签位置

```tsx
<FormControlLabel
  control={<Checkbox />}
  label={t('form.option')}
  labelPlacement="start"   {/* 标签在左 */}
/>
<FormControlLabel
  control={<Checkbox />}
  label={t('form.option')}
  labelPlacement="top"     {/* 标签在上 */}
/>
<FormControlLabel
  control={<Checkbox />}
  label={t('form.option')}
  labelPlacement="bottom"  {/* 标签在下 */}
/>
```

## Props 完整参考

### Checkbox Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| checked | `boolean` | - | 受控选中状态 |
| defaultChecked | `boolean` | - | 非受控默认值 |
| onChange | `(event, checked) => void` | - | 状态变化回调 |
| indeterminate | `boolean` | `false` | 不确定状态 |
| color | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'primary'` | 颜色 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| required | `boolean` | `false` | 必填 |
| icon | `ReactNode` | - | 未选中时的图标 |
| checkedIcon | `ReactNode` | - | 选中时的图标 |
| indeterminateIcon | `ReactNode` | - | 不确定状态图标 |
| disableRipple | `boolean` | `false` | 禁用水波纹 |
| inputProps | `object` | - | 传递给 input 元素的属性 |
| inputRef | `Ref` | - | input 元素的 ref |
| value | `any` | - | 表单提交时的值 |
| sx | `SxProps<Theme>` | - | 自定义样式 |

### FormControlLabel Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| control | `ReactElement` | **必填** | 控件元素（Checkbox/Switch/Radio） |
| label | `ReactNode` | **必填** | 标签文本（走 t()） |
| labelPlacement | `'end' \| 'start' \| 'top' \| 'bottom'` | `'end'` | 标签位置 |
| disabled | `boolean` | `false` | 禁用整体 |
| value | `any` | - | 表单值 |

## 受控 vs 非受控

```tsx
// 受控（推荐）
const [checked, setChecked] = useState(false);
<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />

// 非受控
<Checkbox defaultChecked />
```

## 无障碍 (a11y)

- 搭配 `FormControlLabel` 时自动关联 label
- 独立使用时**必须**提供 `inputProps={{ 'aria-label': t('...') }}`
- `indeterminate` 自动设置 `aria-checked="mixed"`
- `FormGroup` + `FormLabel` 构成 fieldset/legend 语义
- 键盘：Space 切换选中状态

## Foundation 约束

⚠️ **配色**：自定义颜色从 `theme.palette.foundation.*` 取，用 sx 的 `&.Mui-checked` 选择器

⚠️ **i18n**：`label`（FormControlLabel）和 `aria-label` 全部走 `t('key')`

⚠️ **图标**：自定义图标只用 `*Rounded` 系列

⚠️ **独立使用**：无 FormControlLabel 包裹时，必须提供 `inputProps={{ 'aria-label': t('...') }}`
