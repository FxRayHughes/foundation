# Slider

MUI 9 的 Slider 组件用于在数值范围内选择值，支持单值和范围选择。

## Import

```tsx
import { Slider } from '@mui/material';
// 常搭配
import { Box, Typography } from '@mui/material';
```

## 基础用法（Foundation 模式）

```tsx
import { Slider, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { sliderStyles } from './MySlider.styles';

function MySlider() {
  const theme = useTheme();
  const t = useT();
  const styles = sliderStyles(theme);
  const [value, setValue] = useState(30);

  return (
    <Box sx={styles.container}>
      <Typography gutterBottom>{t('settings.volume')}</Typography>
      <Slider
        value={value}
        onChange={(_, newValue) => setValue(newValue as number)}
        aria-label={t('aria.volume')}
        sx={styles.slider}
      />
    </Box>
  );
}
```

```tsx
// MySlider.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const sliderStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    container: { width: 300, px: 2 },
    slider: {
      color: fp.accent,
      '& .MuiSlider-thumb': {
        '&:hover, &.Mui-focusVisible': {
          boxShadow: `0 0 0 8px ${fp.accent}20`,
        },
      },
    },
  };
};
```

## 范围选择 (Range)

```tsx
const [range, setRange] = useState<number[]>([20, 80]);

<Slider
  value={range}
  onChange={(_, newValue) => setRange(newValue as number[])}
  valueLabelDisplay="auto"
  aria-label={t('aria.priceRange')}
/>
```

## 离散值 (Steps)

```tsx
{/* 固定步长 */}
<Slider
  defaultValue={30}
  step={10}
  marks
  min={0}
  max={100}
  aria-label={t('aria.temperature')}
/>

{/* 自定义刻度标记 */}
const marks = [
  { value: 0, label: t('slider.cold') },
  { value: 50, label: t('slider.warm') },
  { value: 100, label: t('slider.hot') },
];

<Slider
  defaultValue={50}
  step={null}
  marks={marks}
  aria-label={t('aria.temperature')}
/>
```

## 值标签显示

```tsx
{/* 悬停时显示 */}
<Slider valueLabelDisplay="auto" aria-label={t('aria.value')} />

{/* 始终显示 */}
<Slider valueLabelDisplay="on" aria-label={t('aria.value')} />

{/* 不显示 */}
<Slider valueLabelDisplay="off" aria-label={t('aria.value')} />

{/* 自定义格式 */}
<Slider
  valueLabelDisplay="auto"
  valueLabelFormat={(value) => `${value}%`}
  aria-label={t('aria.percentage')}
/>
```

## 垂直方向

```tsx
<Box sx={{ height: 200 }}>
  <Slider
    orientation="vertical"
    defaultValue={30}
    aria-label={t('aria.verticalSlider')}
  />
</Box>
```

## Sizes

```tsx
<Slider size="small" defaultValue={30} aria-label={t('aria.small')} />
<Slider size="medium" defaultValue={30} aria-label={t('aria.medium')} />
```

## Colors

```tsx
<Slider color="primary" defaultValue={30} aria-label={t('aria.slider')} />
<Slider color="secondary" defaultValue={30} aria-label={t('aria.slider')} />
<Slider color="success" defaultValue={30} aria-label={t('aria.slider')} />
<Slider color="error" defaultValue={30} aria-label={t('aria.slider')} />
```

## 受限范围 (Min Distance)

```tsx
const minDistance = 10;
const [value, setValue] = useState<number[]>([20, 60]);

const handleChange = (_: Event, newValue: number | number[], activeThumb: number) => {
  if (!Array.isArray(newValue)) return;
  if (activeThumb === 0) {
    setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
  } else {
    setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
  }
};

<Slider
  value={value}
  onChange={handleChange}
  disableSwap
  aria-label={t('aria.range')}
/>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| value | `number \| number[]` | - | 受控值（数组为范围模式） |
| defaultValue | `number \| number[]` | - | 非受控默认值 |
| onChange | `(event, value, activeThumb) => void` | - | 值变化回调 |
| onChangeCommitted | `(event, value) => void` | - | 拖拽结束回调 |
| min | `number` | `0` | 最小值 |
| max | `number` | `100` | 最大值 |
| step | `number \| null` | `1` | 步长（null 时只能选 marks 值） |
| marks | `boolean \| Mark[]` | `false` | 刻度标记 |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
| size | `'small' \| 'medium'` | `'medium'` | 尺寸 |
| color | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'primary'` | 颜色 |
| disabled | `boolean` | `false` | 禁用 |
| disableSwap | `boolean` | `false` | 范围模式下禁止交换 |
| valueLabelDisplay | `'auto' \| 'on' \| 'off'` | `'off'` | 值标签显示模式 |
| valueLabelFormat | `(value) => ReactNode` | - | 值标签格式化 |
| getAriaLabel | `(index) => string` | - | 范围模式下各 thumb 的 aria-label |
| getAriaValueText | `(value, index) => string` | - | 值的文本描述 |
| track | `'normal' \| 'inverted' \| false` | `'normal'` | 轨道显示模式 |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 受控 vs 非受控

```tsx
// 受控（推荐）
const [value, setValue] = useState(50);
<Slider value={value} onChange={(_, v) => setValue(v as number)} />

// 非受控
<Slider defaultValue={50} />
```

## 无障碍 (a11y)

- **必须**提供 `aria-label` 或 `aria-labelledby`（走 t()）
- 范围模式用 `getAriaLabel` 为每个 thumb 提供独立标签
- `getAriaValueText` 提供值的文本描述（如 "30 度"）
- 键盘：左右/上下箭头调整值，Home/End 跳到最小/最大值
- `marks` 的 `label` 走 `t('key')`

## Foundation 约束

⚠️ **aria-label 必填**：Slider 没有可见 label 时必须提供 `aria-label`（走 t()）

⚠️ **配色**：自定义颜色从 `theme.palette.foundation.*` 取

⚠️ **marks label**：刻度标记的 label 走 `t('key')`

⚠️ **valueLabelFormat**：格式化函数中如有单位文字，也走 `t('key')`
