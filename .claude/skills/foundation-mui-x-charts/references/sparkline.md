# SparkLineChart 迷你图

## Import

```tsx
// 默认导入
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
```

## 基础用法（Foundation 模式完整示例）

```tsx
import { Box, useTheme } from '@mui/material';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { useT } from '@/i18n';
import { sparklineStyles } from './Sparkline.styles';

export const InlineTrend = () => {
  const theme = useTheme();
  const t = useT();
  const fp = theme.palette.foundation;
  const styles = sparklineStyles(theme);

  return (
    <Box sx={styles.sparkContainer}>
      <SparkLineChart
        data={[1, 4, 2, 5, 7, 2, 4, 6]}
        height={40}
        color={fp.accent}
        showTooltip
        valueFormatter={(v: number) => `${v} ${t('common.requests')}`}
        aria-label={t('charts.sparkline.trend')}
      />
    </Box>
  );
};
```

样式文件：

```tsx
// Sparkline.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const sparklineStyles = (theme: Theme): Record<string, SxProps<Theme>> => ({
  sparkContainer: {
    display: 'inline-flex',
    width: 120,
    height: 40,
  },
});
```

## 所有 Variants

### 折线迷你图（默认）

```tsx
<SparkLineChart
  plotType="line"
  data={[1, 4, 2, 5, 7, 2, 4, 6]}
  height={60}
  color={fp.accent}
/>
```

### 柱状迷你图

```tsx
<SparkLineChart
  plotType="bar"
  data={[1, 4, 2, 5, 7, 2, 4, 6]}
  height={60}
  color={fp.accent}
/>
```

### 面积填充

```tsx
<SparkLineChart
  data={[1, 4, 2, 5, 7, 2, 4, 6]}
  area
  height={60}
  color={fp.accent}
/>
```

### 带 Tooltip 和高亮

```tsx
<SparkLineChart
  data={values}
  showTooltip
  showHighlight
  valueFormatter={(v: number) => `${v} MB`}
  height={60}
  color={fp.accent}
/>
```

### 自定义线宽

```tsx
<SparkLineChart
  data={values}
  lineWidth={2}
  height={60}
  color={fp.accent}
/>
```

### 时间轴 X 轴

```tsx
<SparkLineChart
  data={values}
  xAxis={{
    scaleType: 'time',
    data: dates,  // Date[] 与 data 等长
    valueFormatter: (date: Date) => date.toLocaleDateString(),
  }}
  height={60}
  color={fp.accent}
/>
```

### 固定 Y 轴范围

```tsx
<SparkLineChart
  data={values}
  yAxis={{ min: 0, max: 100 }}
  height={60}
  color={fp.accent}
/>
```

### 根据趋势动态着色

```tsx
const isUp = values[values.length - 1] > values[0];
<SparkLineChart
  data={values}
  color={isUp ? fp.status.success : fp.status.danger}
  height={40}
/>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `data` | `number[]` | 必填 | 数据数组 |
| `plotType` | `'line' \| 'bar'` | `'line'` | 图表类型 |
| `height` | `number` | 必填 | 高度（px） |
| `width` | `number` | 响应式 | 宽度（不传则填充父容器） |
| `color` | `string` | MUI 默认 | 线条 / 柱体颜色 |
| `area` | `boolean` | `false` | 是否填充面积（仅 line 模式） |
| `lineWidth` | `number` | `1.5` | 线宽（仅 line 模式） |
| `showTooltip` | `boolean` | `false` | 显示 tooltip |
| `showHighlight` | `boolean` | `false` | 高亮当前悬停点 |
| `valueFormatter` | `(v: number) => string` | - | tooltip 数值格式化 |
| `xAxis` | `{ scaleType?, data?, valueFormatter? }` | - | X 轴配置 |
| `yAxis` | `{ min?: number, max?: number }` | auto | Y 轴范围 |
| `margin` | `{ top?, right?, bottom?, left? }` | `{ top: 5, right: 5, bottom: 5, left: 5 }` | 外边距 |
| `sx` | `SxProps<Theme>` | - | 样式覆盖 |
| `aria-label` | `string` | - | 无障碍标签 |

## 无障碍 (a11y)

- 添加 `aria-label` 描述迷你图含义：

```tsx
<SparkLineChart
  data={values}
  aria-label={t('charts.sparkline.cpuTrend')}
  height={40}
/>
```

- SparkLineChart 渲染为 SVG，辅助技术可读取 aria-label
- 搭配 `showTooltip` 让键盘用户也能获取数据值

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **配色**：`color` 从 `theme.palette.foundation.*` 取值，禁止硬编码 hex
2. **i18n**：`valueFormatter` 格式化数值时考虑单位国际化，`aria-label` 走 `t()`
3. **样式**：容器样式写在 `<Name>.styles.ts` 工厂函数
4. **用途**：适合表格行内、卡片角落等紧凑空间的趋势展示
5. **高度**：通常 40-100px，不宜过大（大图用 LineChart）
6. **无障碍**：提供 `aria-label` 描述图表含义
