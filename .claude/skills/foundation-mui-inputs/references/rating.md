# Rating

MUI 9 的 Rating 组件用于星级评分或满意度评价。

## Import

```tsx
import { Rating } from '@mui/material';
// 常搭配
import { Box, Typography } from '@mui/material';
// 自定义图标
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
```

## 基础用法（Foundation 模式）

```tsx
import { Rating, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useT } from '@/i18n';
import { ratingStyles } from './MyRating.styles';

function MyRating() {
  const theme = useTheme();
  const t = useT();
  const styles = ratingStyles(theme);
  const [value, setValue] = useState<number | null>(3);

  return (
    <Box sx={styles.container}>
      <Typography component="legend">{t('form.rating')}</Typography>
      <Rating
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        sx={styles.rating}
      />
    </Box>
  );
}
```

```tsx
// MyRating.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const ratingStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    container: { display: 'flex', alignItems: 'center', gap: 1 },
    rating: {
      '& .MuiRating-iconFilled': { color: fp.accent },
      '& .MuiRating-iconHover': { color: fp.accentHover },
    },
  };
};
```

## 只读模式

```tsx
<Rating value={4} readOnly />
```

## 禁用状态

```tsx
<Rating value={3} disabled />
```

## 精度（半星）

```tsx
<Rating
  value={value}
  precision={0.5}
  onChange={(_, newValue) => setValue(newValue)}
/>

{/* 只读半星 */}
<Rating value={3.5} precision={0.5} readOnly />
```

## 自定义星数

```tsx
{/* 10 星评分 */}
<Rating
  max={10}
  value={value}
  onChange={(_, newValue) => setValue(newValue)}
/>
```

## Sizes

```tsx
<Rating size="small" value={3} readOnly />
<Rating size="medium" value={3} readOnly />  {/* 默认 */}
<Rating size="large" value={3} readOnly />
```

## 自定义图标

```tsx
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';

<Rating
  icon={<FavoriteRoundedIcon fontSize="inherit" />}
  emptyIcon={<FavoriteBorderRoundedIcon fontSize="inherit" />}
  value={value}
  onChange={(_, newValue) => setValue(newValue)}
  sx={{ '& .MuiRating-iconFilled': { color: theme.palette.foundation.status.danger } }}
/>
```

## 悬停反馈

```tsx
function HoverRating() {
  const t = useT();
  const [value, setValue] = useState<number | null>(2);
  const [hover, setHover] = useState(-1);

  const labels: Record<number, string> = {
    1: t('rating.terrible'),
    2: t('rating.poor'),
    3: t('rating.ok'),
    4: t('rating.good'),
    5: t('rating.excellent'),
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Rating
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        onChangeActive={(_, newHover) => setHover(newHover)}
      />
      <Typography variant="body2">
        {labels[hover !== -1 ? hover : (value ?? 0)] ?? ''}
      </Typography>
    </Box>
  );
}
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| value | `number \| null` | - | 受控值 |
| defaultValue | `number` | - | 非受控默认值 |
| onChange | `(event, value) => void` | - | 值变化回调 |
| onChangeActive | `(event, value) => void` | - | 悬停值变化回调 |
| max | `number` | `5` | 最大星数 |
| precision | `number` | `1` | 精度（0.5 为半星） |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| readOnly | `boolean` | `false` | 只读模式 |
| disabled | `boolean` | `false` | 禁用 |
| highlightSelectedOnly | `boolean` | `false` | 只高亮选中的那颗星 |
| icon | `ReactNode` | `<Star />` | 填充图标 |
| emptyIcon | `ReactNode` | `<StarBorder />` | 空图标 |
| getLabelText | `(value) => string` | - | 自定义 aria-label 文本 |
| name | `string` | - | 表单 name |
| sx | `SxProps<Theme>` | - | 自定义样式 |

## 受控 vs 非受控

```tsx
// 受控（推荐）
const [value, setValue] = useState<number | null>(3);
<Rating value={value} onChange={(_, v) => setValue(v)} />

// 非受控
<Rating defaultValue={3} />
```

## 无障碍 (a11y)

- 自动生成 `aria-label`（如 "3 Stars"）
- `getLabelText` 可自定义标签文本（走 t()）：
  ```tsx
  <Rating getLabelText={(value) => t('rating.stars', { count: value })} />
  ```
- 键盘：左右箭头调整值
- `readOnly` 时设置 `aria-readonly="true"`
- 建议搭配 `<Typography component="legend">` 提供可见标签

## Foundation 约束

⚠️ **配色**：自定义图标颜色从 `theme.palette.foundation.*` 取

⚠️ **图标**：自定义图标只用 `*Rounded` 系列，必须设置 `fontSize="inherit"`

⚠️ **i18n**：`getLabelText` 返回值走 `t('key')`，悬停标签文本走 `t('key')`

⚠️ **可见标签**：Rating 旁边应有 Typography 说明用途（文本走 t()）
