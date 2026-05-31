# Radio / RadioGroup

MUI 9 的 Radio 组件用于单选场景，必须搭配 RadioGroup 使用以确保互斥。

## Import

```tsx
import {
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel
} from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { radioStyles } from './MyRadio.styles';

function MyRadio() {
  const theme = useTheme();
  const t = useT();
  const styles = radioStyles(theme);
  const [value, setValue] = useState('light');

  return (
    <FormControl sx={styles.group}>
      <FormLabel>{t('settings.theme.label')}</FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <FormControlLabel
          value="light"
          control={<Radio />}
          label={t('settings.theme.light')}
        />
        <FormControlLabel
          value="dark"
          control={<Radio />}
          label={t('settings.theme.dark')}
        />
        <FormControlLabel
          value="system"
          control={<Radio />}
          label={t('settings.theme.system')}
        />
      </RadioGroup>
    </FormControl>
  );
}
```

```tsx
// MyRadio.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const radioStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    group: {
      '& .MuiRadio-root': { color: fp.text.muted },
      '& .Mui-checked': { color: fp.accent },
    },
  };
};
```

## 水平排列

```tsx
<RadioGroup row value={value} onChange={handleChange}>
  <FormControlLabel value="left" control={<Radio />} label={t('align.left')} />
  <FormControlLabel value="center" control={<Radio />} label={t('align.center')} />
  <FormControlLabel value="right" control={<Radio />} label={t('align.right')} />
</RadioGroup>
```

## Sizes

```tsx
<Radio size="small" />  {/* 更紧凑 */}
<Radio size="medium" /> {/* 默认 */}
```

## Colors

```tsx
<Radio color="primary" />   {/* 默认 */}
<Radio color="secondary" />
<Radio color="success" />
<Radio color="error" />
<Radio color="warning" />
<Radio color="info" />
<Radio color="default" />
```

## 禁用选项

```tsx
<RadioGroup value={value} onChange={handleChange}>
  <FormControlLabel value="a" control={<Radio />} label={t('option.a')} />
  <FormControlLabel value="b" control={<Radio />} label={t('option.b')} disabled />
  <FormControlLabel value="c" control={<Radio />} label={t('option.c')} />
</RadioGroup>
```

## 标签位置

```tsx
<FormControlLabel
  value="option"
  control={<Radio />}
  label={t('form.option')}
  labelPlacement="start"  {/* 标签在左 */}
/>
<FormControlLabel
  value="option"
  control={<Radio />}
  label={t('form.option')}
  labelPlacement="top"    {/* 标签在上 */}
/>
```

## 带错误状态

```tsx
<FormControl error={!!error}>
  <FormLabel>{t('form.priority')}</FormLabel>
  <RadioGroup value={value} onChange={handleChange}>
    <FormControlLabel value="high" control={<Radio />} label={t('priority.high')} />
    <FormControlLabel value="low" control={<Radio />} label={t('priority.low')} />
  </RadioGroup>
  <FormHelperText>{error ? t('form.priority.error') : ''}</FormHelperText>
</FormControl>
```

## Props 完整参考

### RadioGroup Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| value | `any` | - | 受控选中值 |
| defaultValue | `any` | - | 非受控默认值 |
| onChange | `(event, value) => void` | - | 值变化回调 |
| name | `string` | - | 表单 name 属性 |
| row | `boolean` | `false` | 水平排列 |
| children | `ReactNode` | - | FormControlLabel 子元素 |

### Radio Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| checked | `boolean` | - | 受控选中（RadioGroup 自动管理） |
| color | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'primary'` | 颜色 |
| size | `'small' \| 'medium'` | `'medium'` | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| disableRipple | `boolean` | `false` | 禁用水波纹 |
| required | `boolean` | `false` | 必填 |
| value | `any` | - | 此选项的值 |
| inputProps | `object` | - | 传递给 input 的属性 |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 受控 vs 非受控

```tsx
// 受控（推荐）
const [value, setValue] = useState('option1');
<RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
  <FormControlLabel value="option1" control={<Radio />} label={t('opt.1')} />
  <FormControlLabel value="option2" control={<Radio />} label={t('opt.2')} />
</RadioGroup>

// 非受控
<RadioGroup defaultValue="option1">
  <FormControlLabel value="option1" control={<Radio />} label={t('opt.1')} />
  <FormControlLabel value="option2" control={<Radio />} label={t('opt.2')} />
</RadioGroup>
```

## 无障碍 (a11y)

- `RadioGroup` 自动设置 `role="radiogroup"`
- `FormLabel` 作为 group 的 accessible name（通过 `aria-labelledby`）
- 键盘导航：上下/左右箭头在选项间移动，自动选中
- Tab 键进入/离开 RadioGroup，箭头键在组内移动
- 每个 Radio 自动设置 `role="radio"` 和 `aria-checked`

## Foundation 约束

⚠️ **必须用 RadioGroup**：不要单独使用 Radio，必须包裹在 RadioGroup 中确保互斥

⚠️ **FormControl + FormLabel**：提供分组语义，FormLabel 作为 legend

⚠️ **配色**：自定义颜色从 `theme.palette.foundation.*` 取

⚠️ **i18n**：FormLabel、FormControlLabel 的 label 全部走 `t('key')`

⚠️ **value 类型**：RadioGroup 的 value 始终是 string（即使传入 number 也会转为 string）
