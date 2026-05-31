# TextField

Foundation 项目中 TextField 默认 `size="small"` `variant="outlined"`（主题已配置），是最常用的文本输入组件。

## Import

```tsx
import { TextField } from '@mui/material';
// 需要 InputAdornment 时
import { TextField, InputAdornment } from '@mui/material';
// 图标
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
```

## 基础用法（Foundation 模式）

```tsx
import { TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { formStyles } from './MyForm.styles';

function MyForm() {
  const theme = useTheme();
  const t = useT();
  const styles = formStyles(theme);

  return (
    <TextField
      label={t('form.username.label')}
      placeholder={t('form.username.placeholder')}
      helperText={t('form.username.helper')}
      sx={styles.input}
    />
  );
}
```

```tsx
// MyForm.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const formStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    input: {
      '& .MuiOutlinedInput-root': {
        backgroundColor: fp.bg.surface,
      },
    },
  };
};
```

## 所有 Variants

### outlined（默认，主题已配置）

```tsx
<TextField variant="outlined" label={t('form.email')} />
```

### filled

```tsx
<TextField variant="filled" label={t('form.email')} />
```

### standard

```tsx
<TextField variant="standard" label={t('form.email')} />
```

## 多行文本

```tsx
{/* 固定行数 */}
<TextField
  multiline
  rows={4}
  label={t('form.description')}
  placeholder={t('form.description.placeholder')}
/>

{/* 自动增长（设置最小/最大行数） */}
<TextField
  multiline
  minRows={2}
  maxRows={6}
  label={t('form.notes')}
/>
```

## 数字输入

> ⚠️ `@mui/x-number-field` 未安装，使用 `type="number"` 替代。

```tsx
<TextField
  type="number"
  label={t('form.quantity')}
  slotProps={{
    input: { inputProps: { min: 0, max: 100, step: 1 } },
  }}
/>
```

## 密码输入

```tsx
import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

function PasswordField() {
  const t = useT();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      type={showPassword ? 'text' : 'password'}
      label={t('form.password')}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={t('aria.togglePassword')}
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
```

## 带装饰器 (Adornment)

```tsx
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

{/* 前置图标 */}
<TextField
  label={t('form.search')}
  slotProps={{
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <SearchRoundedIcon fontSize="small" />
        </InputAdornment>
      ),
    },
  }}
/>

{/* 后置文字 */}
<TextField
  label={t('form.weight')}
  slotProps={{
    input: {
      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
    },
  }}
/>
```

## 验证与错误状态

```tsx
<TextField
  error={!!errors.email}
  label={t('form.email')}
  helperText={errors.email ? t('form.email.error') : t('form.email.helper')}
/>

{/* 必填标记 */}
<TextField
  required
  label={t('form.name')}
  helperText={t('form.name.required')}
/>
```

## 受控 vs 非受控

```tsx
// 受控（推荐用于 ViewModel）
const [value, setValue] = useState('');
<TextField
  value={value}
  onChange={(e) => setValue(e.target.value)}
  label={t('form.name')}
/>

// 非受控（简单场景）
<TextField
  defaultValue="initial"
  inputRef={inputRef}
  label={t('form.name')}
/>
```

## Sizes

```tsx
<TextField size="small" label={t('form.small')} />  {/* 默认（主题配置） */}
<TextField size="medium" label={t('form.medium')} />
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| variant | `'outlined' \| 'filled' \| 'standard'` | `'outlined'`（主题） | 样式变体 |
| size | `'small' \| 'medium'` | `'small'`（主题） | 输入框尺寸 |
| label | `ReactNode` | - | 浮动标签（走 t()） |
| placeholder | `string` | - | 占位文本（走 t()） |
| helperText | `ReactNode` | - | 辅助文本（走 t()） |
| error | `boolean` | `false` | 错误状态 |
| required | `boolean` | `false` | 必填标记 |
| disabled | `boolean` | `false` | 禁用状态 |
| fullWidth | `boolean` | `false` | 撑满容器 |
| multiline | `boolean` | `false` | 多行模式 |
| rows | `number` | - | 固定行数（multiline 时） |
| minRows | `number` | - | 最小行数 |
| maxRows | `number` | - | 最大行数 |
| type | `string` | `'text'` | 输入类型（text/number/password/email 等） |
| value | `string` | - | 受控值 |
| defaultValue | `string` | - | 非受控默认值 |
| onChange | `(event) => void` | - | 值变化回调 |
| slotProps | `object` | - | 子组件 props（MUI 9 推荐替代 InputProps） |
| autoFocus | `boolean` | `false` | 自动聚焦 |
| autoComplete | `string` | - | 浏览器自动填充提示 |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 无障碍 (a11y)

- `label` 自动关联 input 的 `aria-labelledby`
- 无 label 时必须提供 `aria-label`（走 t()）
- `helperText` 自动关联 `aria-describedby`
- `error` 状态自动设置 `aria-invalid="true"`
- `required` 自动设置 `aria-required="true"`

## Foundation 约束

⚠️ **默认配置**：主题已设置 `size="small"` + `variant="outlined"`，无需重复指定

⚠️ **配色**：自定义背景色从 `theme.palette.foundation.bg.*` 取

⚠️ **i18n**：`label`、`placeholder`、`helperText` 全部走 `t('key')`

⚠️ **slotProps**：MUI 9 推荐用 `slotProps` 替代旧的 `InputProps` / `inputProps`

⚠️ **数字输入**：用 `type="number"` + `inputProps.min/max/step`，不用 `@mui/x-number-field`
