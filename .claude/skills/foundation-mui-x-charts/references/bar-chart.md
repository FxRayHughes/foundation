# BarChart 柱状图 / 条形图

## Import

```tsx
// 默认导入（推荐）
import { BarChart } from '@mui/x-charts/BarChart';

// 命名导入 + CSS 类
import { BarChart, barClasses } from '@mui/x-charts/BarChart';

// Composition API（高级自定义布局）
import { BarPlot } from '@mui/x-charts/BarChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { ChartsXAxis, ChartsYAxis } from '@mui/x-charts';
```

## 基础用法（Foundation 模式完整示例）

```tsx
import { Box, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useT } from '@/i18n';
import { barStyles } from './Bar.styles';

export const BytesBar = () => {
  const theme = useTheme();
  const t = useT();
  const styles = barStyles(theme);

  const fp = theme.palette.foundation;
  const colors = [fp.accent, fp.status.success, fp.status.warning];

  return (
    <Box sx={styles.chartCard}>
      <BarChart
        layout="horizontal"
        yAxis={[{
          scaleType: 'band',
          data: [t('table.users'), t('table.orders'), t('table.logs')],
        }]}
        xAxis={[{
          valueFormatter: (v: number) => `${(v / 1024).toFixed(1)} KB`,
        }]}
        series={[{
          data: [12800, 8500, 24000],
          valueFormatter: (v: number | null) =>
            `${((v ?? 0) / 1024).toFixed(1)} KB`,
        }]}
        colors={colors}
        height={220}
        hideLegend
      />
    </Box>
  );
};
```

样式文件：

```tsx
// Bar.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const barStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    chartCard: {
      backgroundColor: fp.bg.surface,
      borderRadius: 2,
      p: 2,
    },
  };
};
```

## 所有 Variants

### 垂直柱状图（默认）

```tsx
<BarChart
  xAxis={[{ scaleType: 'band', data: ['Q1', 'Q2', 'Q3', 'Q4'] }]}
  series={[
    { data: [4, 3, 5, 7], label: t('chart.sales') },
    { data: [1, 6, 3, 2], label: t('chart.profit') },
  ]}
  colors={[fp.accent, fp.status.success]}
  height={300}
/>
```

### 水平条形图（layout="horizontal"）

类别轴变为 yAxis，数值轴变为 xAxis：

```tsx
<BarChart
  layout="horizontal"
  yAxis={[{ scaleType: 'band', data: categories }]}
  xAxis={[{ valueFormatter: (v: number) => `${v}%` }]}
  series={[{ data: [35, 44, 24, 18] }]}
  colors={[fp.accent]}
  height={250}
  hideLegend
/>
```

### 堆叠柱状图（Stacked）

同 `stack` 值的系列会堆叠在一起：

```tsx
<BarChart
  xAxis={[{ scaleType: 'band', dataKey: 'year' }]}
  series={[
    { dataKey: 'current', stack: 'assets', label: t('chart.current') },
    { dataKey: 'fixed', stack: 'assets', label: t('chart.fixed') },
    { dataKey: 'debt', stack: 'liability', label: t('chart.debt') },
  ]}
  dataset={data}
  colors={[fp.accent, fp.status.success, fp.status.danger]}
  height={350}
/>
```

### 带圆角柱体

```tsx
<BarChart
  series={[{ data: [3, 7, 1, 4] }]}
  xAxis={[{ scaleType: 'band', data: ['A', 'B', 'C', 'D'] }]}
  borderRadius={6}
  height={300}
/>
```

### 带柱体标签（Bar Label）

```tsx
<BarChart
  series={[{ data: [35, 44, 24], label: t('chart.revenue') }]}
  xAxis={[{ scaleType: 'band', data: ['A', 'B', 'C'] }]}
  barLabel="value"
  height={300}
/>
```

自定义标签格式：

```tsx
<BarChart
  series={[{ data: [35, 44, 24] }]}
  barLabel={(item) => `${item.value}%`}
  height={300}
/>
```

### 带网格线

```tsx
<BarChart
  grid={{ vertical: true, horizontal: true }}
  series={series}
  xAxis={xAxis}
  height={300}
/>
```

### Dataset 模式（推荐多系列）

```tsx
const dataset = [
  { month: t('month.jan'), london: 18, paris: 15, berlin: 12 },
  { month: t('month.feb'), london: 22, paris: 19, berlin: 16 },
  { month: t('month.mar'), london: 28, paris: 24, berlin: 20 },
];

<BarChart
  dataset={dataset}
  xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
  series={[
    { dataKey: 'london', label: 'London', valueFormatter },
    { dataKey: 'paris', label: 'Paris', valueFormatter },
    { dataKey: 'berlin', label: 'Berlin', valueFormatter },
  ]}
  colors={[fp.accent, fp.status.success, fp.status.warning]}
  height={300}
/>
```

### 条间距控制

```tsx
<BarChart
  xAxis={[{
    scaleType: 'band',
    data: categories,
    categoryGapRatio: 0.3,  // 类别间距比（0-1）
    barGapRatio: 0.1,       // 同类别内柱间距比
  }]}
  series={series}
  height={300}
/>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `series` | `BarSeriesType[]` | 必填 | 数据系列配置 |
| `dataset` | `object[]` | - | 数据集模式（series 用 dataKey 引用字段） |
| `xAxis` | `AxisConfig[]` | auto | X 轴配置数组 |
| `yAxis` | `AxisConfig[]` | auto | Y 轴配置数组 |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | 布局方向 |
| `borderRadius` | `number` | `0` | 柱体圆角半径 |
| `barLabel` | `'value' \| 'percentage' \| ((item) => string)` | - | 柱体标签 |
| `width` | `number` | 响应式 | 图表宽度 |
| `height` | `number` | 响应式 | 图表高度 |
| `colors` | `string[]` | MUI 默认 | 调色板 |
| `margin` | `{ top?, right?, bottom?, left? }` | auto | 绘图区外边距 |
| `grid` | `{ horizontal?: boolean, vertical?: boolean }` | - | 网格线配置 |
| `hideLegend` | `boolean` | `false` | 隐藏图例 |
| `skipAnimation` | `boolean` | `false` | 跳过入场动画 |
| `onItemClick` | `(event, d: BarItemIdentifier) => void` | - | 柱体点击回调 |
| `onAxisClick` | `(event, data) => void` | - | 轴区域点击回调 |
| `slotProps` | `{ bar?, legend?, tooltip?, axisLabel? }` | - | 子组件 props |
| `slots` | `{ bar?, legend?, tooltip? }` | - | 子组件替换 |
| `sx` | `SxProps<Theme>` | - | 根元素样式 |
| `loading` | `boolean` | `false` | 显示加载骨架 |

### BarSeriesType Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `data` | `number[]` | - | 数据值数组（与 dataKey 二选一） |
| `dataKey` | `string` | - | dataset 中的字段名（与 data 二选一） |
| `label` | `string` | - | 系列名称（图例 + tooltip） |
| `id` | `string` | 自动生成 | 系列唯一标识 |
| `stack` | `string` | - | 堆叠组标识（同名的系列堆叠） |
| `stackOrder` | `'none' \| 'ascending' \| 'descending' \| 'reverse'` | `'none'` | 堆叠排序 |
| `stackOffset` | `'none' \| 'expand' \| 'diverging' \| 'silhouette' \| 'wiggle'` | `'none'` | 堆叠偏移策略 |
| `color` | `string` | 从 colors 取 | 系列颜色 |
| `highlightScope` | `{ highlight, fade }` | - | 高亮范围 |
| `valueFormatter` | `(value: number \| null) => string` | - | 数值格式化 |

## 受控 vs 非受控

BarChart 不需要受控模式。高亮状态通过 `highlightedItem` 可控制：

```tsx
const [highlighted, setHighlighted] = useState<HighlightedItem | null>(null);

<BarChart
  highlightedItem={highlighted}
  onHighlightChange={setHighlighted}
  series={series}
/>
```

## 无障碍 (a11y)

- 图表渲染为 SVG，自动添加 `role="img"`
- 添加描述性 aria-label：

```tsx
<BarChart
  series={series}
  slotProps={{
    svg: { 'aria-label': t('charts.bar.ariaLabel') },
  }}
/>
```

- 确保颜色对比度满足 WCAG AA（4.5:1）
- 柱体标签（barLabel）提供数据的文本替代

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **配色**：`colors` 从 `theme.palette.foundation.*` 取值，禁止硬编码 hex
2. **圆角**：外层容器 `borderRadius: 2`，柱体 `borderRadius: 4-6`
3. **i18n**：轴标签 / 系列 label / tooltip 格式化走 `t()` 或 `valueFormatter`
4. **样式**：图表容器样式写在 `<Name>.styles.ts` 工厂函数
5. **水平布局**：Foundation 数据存储页使用 `layout="horizontal"` 展示字节条形图
6. **hideLegend**：单系列图表默认隐藏图例
7. **真实用例**：Foundation「设置→数据存储」页使用横向 BarChart 展示各表精确字节数
