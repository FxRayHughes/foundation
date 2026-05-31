# Switch

MUI 9 的 Switch 组件用于切换开关状态，适合布尔设置项。

## Import

```tsx
import { Switch, FormControlLabel, FormGroup } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { Switch, FormControlLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { switchStyles } from './MySwitch.styles';

function MySwitch() {
  const theme = useTheme();
  const t = useT();
  const styles = switchStyles(theme);
  const [enabled, setEnabled] = useState(false);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          sx={styles.switch}
        />
      }
      label={t('settings.notifications.enable')}
    />
  );
}
```

```tsx
// MySwitch.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const switchStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    switch: {
      '& .MuiSwitch-switchBase.Mui-checked': {
        color: fp.accent,
      },
      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: fp.accent,
      },
    },
  };
};
```

## 基本变体

### 带标签

```tsx
<FormControlLabel
  control={<Switch checked={checked} onChange={handleChange} />}
  label={t('settings.darkMode')}
/>
```

### 无标签（独立使用）

```tsx
<Switch
  checked={checked}
  onChange={handleChange}
  inputProps={{ 'aria-label': t('aria.toggleDarkMode') }}
/>
```

### 标签在左侧

```tsx
<FormControlLabel
  control={<Switch checked={checked} onChange={handleChange} />}
  label={t('settings.autoSave')}
  labelPlacement="start"
  sx={{ ml: 0, justifyContent: 'space-between', width: '100%' }}
/>
```

## FormGroup（多个 Switch 分组）

```tsx
<FormGroup>
  <FormControlLabel
    control={<Switch checked={notifications} onChange={handleNotifications} />}
    label={t('settings.notifications')}
  />
  <FormControlLabel
    control={<Switch checked={sounds} onChange={handleSounds} />}
    label={t('settings.sounds')}
  />
  <FormControlLabel
    control={<Switch checked={autoUpdate} onChange={handleAutoUpdate} />}
    label={t('settings.autoUpdate')}
  />
</FormGroup>
```

## Sizes

```tsx
<Switch size="small" />  {/* 更紧凑 */}
<Switch size="medium" /> {/* 默认 */}
```

## Colors

```tsx
<Switch color="primary" />   {/* 默认 */}
<Switch color="secondary" />
<Switch color="success" />
<Switch color="error" />
<Switch color="warning" />
<Switch color="info" />
<Switch color="default" />
```

## 禁用状态

```tsx
<FormControlLabel
  control={<Switch disabled />}
  label={t('settings.premium')}
/>
<FormControlLabel
  control={<Switch disabled checked />}
  label={t('settings.alwaysOn')}
/>
```

## Props 完整参考

### Switch Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| checked | `boolean` | - | 受控选中状态 |
| defaultChecked | `boolean` | - | 非受控默认值 |
| onChange | `(event, checked) => void` | - | 状态变化回调 |
| color | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'primary'` | 颜色 |
| size | `'small' \| 'medium'` | `'medium'` | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| required | `boolean` | `false` | 必填 |
| disableRipple | `boolean` | `false` | 禁用水波纹 |
| edge | `'start' \| 'end' \| false` | `false` | 边缘对齐 |
| inputProps | `object` | - | 传递给 input 的属性 |
| inputRef | `Ref` | - | input 的 ref |
| value | `any` | - | 表单提交值 |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 受控 vs 非受控

```tsx
// 受控（推荐）
const [checked, setChecked] = useState(false);
<Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} />

// 非受控
<Switch defaultChecked />
```

## 无障碍 (a11y)

- 搭配 `FormControlLabel` 时自动关联 label
- 独立使用时**必须**提供 `inputProps={{ 'aria-label': t('...') }}`
- 自动设置 `role="switch"` 和 `aria-checked`
- 键盘：Space 切换状态
- 建议为设置列表中的 Switch 提供描述性 label

## Foundation 约束

⚠️ **配色**：自定义颜色从 `theme.palette.foundation.*` 取，注意 track 和 thumb 分别设置

⚠️ **i18n**：label 和 aria-label 全部走 `t('key')`

⚠️ **设置页模式**：设置页中 Switch 通常 `labelPlacement="start"` + 两端对齐布局

⚠️ **独立使用**：无 FormControlLabel 时必须提供 `inputProps={{ 'aria-label': t('...') }}`

⚠️ **vs Checkbox**：Switch 用于即时生效的开关（如设置项），Checkbox 用于表单提交前的多选
