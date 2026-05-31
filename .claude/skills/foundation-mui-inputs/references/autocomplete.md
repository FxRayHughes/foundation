# Autocomplete

MUI 9 的 Autocomplete 组件提供带搜索过滤的下拉选择，支持单选、多选、自由输入等模式。

## Import

```tsx
import { Autocomplete, TextField } from '@mui/material';
// 常搭配
import { Chip } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { Autocomplete, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { autocompleteStyles } from './MyAutocomplete.styles';

interface Option {
  label: string;
  value: string;
}

function MyAutocomplete() {
  const theme = useTheme();
  const t = useT();
  const styles = autocompleteStyles(theme);
  const [value, setValue] = useState<Option | null>(null);

  const options: Option[] = [
    { label: t('lang.zhCN'), value: 'zh-CN' },
    { label: t('lang.enUS'), value: 'en-US' },
    { label: t('lang.jaJP'), value: 'ja-JP' },
  ];

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => setValue(newValue)}
      options={options}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('form.language')}
          placeholder={t('form.language.placeholder')}
        />
      )}
      sx={styles.autocomplete}
    />
  );
}
```

```tsx
// MyAutocomplete.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const autocompleteStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    autocomplete: {
      '& .MuiOutlinedInput-root': {
        backgroundColor: fp.bg.surface,
      },
    },
  };
};
```

## 多选模式

```tsx
<Autocomplete
  multiple
  options={options}
  getOptionLabel={(option) => option.label}
  value={selectedItems}
  onChange={(_, newValue) => setSelectedItems(newValue)}
  renderInput={(params) => (
    <TextField {...params} label={t('form.tags')} placeholder={t('form.tags.placeholder')} />
  )}
/>
```

## 多选 + Chip 标签

```tsx
import { Chip } from '@mui/material';

<Autocomplete
  multiple
  options={options}
  value={selectedItems}
  onChange={(_, newValue) => setSelectedItems(newValue)}
  getOptionLabel={(option) => option.label}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        label={option.label}
        size="small"
        {...getTagProps({ index })}
        key={option.value}
      />
    ))
  }
  renderInput={(params) => (
    <TextField {...params} label={t('form.skills')} />
  )}
/>
```

## 自由输入 (freeSolo)

允许用户输入不在选项列表中的值：

```tsx
<Autocomplete
  freeSolo
  options={suggestions.map((s) => s.label)}
  renderInput={(params) => (
    <TextField {...params} label={t('form.search')} />
  )}
/>
```

## 异步加载选项

```tsx
function AsyncAutocomplete() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchOptions().then((data) => {
      setOptions(data);
      setLoading(false);
    });
  }, [open]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      loadingText={t('common.loading')}
      noOptionsText={t('common.noOptions')}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField {...params} label={t('form.user')} />
      )}
    />
  );
}
```

## 分组选项

```tsx
<Autocomplete
  options={options.sort((a, b) => -b.group.localeCompare(a.group))}
  groupBy={(option) => option.group}
  getOptionLabel={(option) => option.label}
  renderInput={(params) => (
    <TextField {...params} label={t('form.country')} />
  )}
/>
```

## 禁用选项

```tsx
<Autocomplete
  options={options}
  getOptionDisabled={(option) => option.disabled}
  getOptionLabel={(option) => option.label}
  renderInput={(params) => (
    <TextField {...params} label={t('form.plan')} />
  )}
/>
```

## 固定选项（不可删除）

```tsx
<Autocomplete
  multiple
  value={value}
  onChange={(_, newValue) => {
    setValue([...fixedOptions, ...newValue.filter((v) => !fixedOptions.includes(v))]);
  }}
  options={options}
  getOptionLabel={(option) => option.label}
  renderTags={(tagValue, getTagProps) =>
    tagValue.map((option, index) => (
      <Chip
        label={option.label}
        {...getTagProps({ index })}
        disabled={fixedOptions.includes(option)}
        key={option.value}
      />
    ))
  }
  renderInput={(params) => <TextField {...params} label={t('form.members')} />}
/>
```

## Sizes

```tsx
<Autocomplete
  size="small"  {/* 默认（主题配置） */}
  options={options}
  renderInput={(params) => <TextField {...params} label={t('form.item')} />}
/>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| options | `T[]` | **必填** | 选项数组 |
| value | `T \| T[] \| null` | - | 受控值 |
| defaultValue | `T \| T[]` | - | 非受控默认值 |
| onChange | `(event, value, reason, details) => void` | - | 值变化回调 |
| inputValue | `string` | - | 受控输入文本 |
| onInputChange | `(event, value, reason) => void` | - | 输入文本变化回调 |
| getOptionLabel | `(option) => string` | - | 获取选项显示文本 |
| isOptionEqualToValue | `(option, value) => boolean` | - | 判断选项是否等于当前值 |
| multiple | `boolean` | `false` | 多选模式 |
| freeSolo | `boolean` | `false` | 允许自由输入 |
| disableCloseOnSelect | `boolean` | `false` | 选择后不关闭下拉 |
| disableClearable | `boolean` | `false` | 隐藏清除按钮 |
| loading | `boolean` | `false` | 加载状态 |
| loadingText | `ReactNode` | `'Loading...'` | 加载提示文本（走 t()） |
| noOptionsText | `ReactNode` | `'No options'` | 无选项提示（走 t()） |
| groupBy | `(option) => string` | - | 分组函数 |
| filterOptions | `(options, state) => T[]` | - | 自定义过滤逻辑 |
| getOptionDisabled | `(option) => boolean` | - | 禁用特定选项 |
| renderInput | `(params) => ReactNode` | **必填** | 渲染输入框 |
| renderOption | `(props, option, state) => ReactNode` | - | 自定义选项渲染 |
| renderTags | `(value, getTagProps) => ReactNode` | - | 自定义标签渲染（多选） |
| size | `'small' \| 'medium'` | `'small'`（主题） | 尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| fullWidth | `boolean` | `false` | 撑满容器 |
| open | `boolean` | - | 受控打开状态 |
| onOpen | `(event) => void` | - | 打开回调 |
| onClose | `(event, reason) => void` | - | 关闭回调 |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 受控 vs 非受控

```tsx
// 受控（推荐）
const [value, setValue] = useState<Option | null>(null);
<Autocomplete
  value={value}
  onChange={(_, v) => setValue(v)}
  options={options}
  renderInput={(params) => <TextField {...params} label={t('form.item')} />}
/>

// 非受控
<Autocomplete
  defaultValue={options[0]}
  options={options}
  renderInput={(params) => <TextField {...params} label={t('form.item')} />}
/>
```

## 无障碍 (a11y)

- 自动设置 `role="combobox"` 和 `aria-expanded`
- 选项列表自动设置 `role="listbox"`
- 键盘：上下箭头导航，Enter 选择，Escape 关闭
- `loadingText` 和 `noOptionsText` 作为 live region 播报
- `renderInput` 中的 TextField 的 label 作为 accessible name

## Foundation 约束

⚠️ **renderInput 必填**：必须提供 `renderInput`，通常渲染 `<TextField>`

⚠️ **配色**：自定义样式从 `theme.palette.foundation.*` 取

⚠️ **i18n**：`loadingText`、`noOptionsText`、TextField 的 label/placeholder 全部走 `t('key')`

⚠️ **选项 label**：如果选项 label 是动态文本，也需要走 `t('key')`

⚠️ **isOptionEqualToValue**：使用对象选项时建议提供，避免引用比较问题
