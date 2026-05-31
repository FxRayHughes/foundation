# LineChart 折线图 / 面积图

## Import

```tsx
// 默认导入（推荐）
import { LineChart } from '@mui/x-charts/LineChart';

// 命名导入 + CSS 类
import { LineChart, lineClasses, areaClasses, markClasses } from '@mui/x-charts/LineChart';

// Composition API（高级自定义布局）
import { LinePlot, AreaPlot, MarkPlot, LineHighlightPlot } from '@mui/x-charts/LineChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { ChartsXAxis, ChartsYAxis } from '@mui/x-charts';
```

## 基础用法（Foundation 模式完整示例）

```tsx
import { Box, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useT } from '@/i18n';
import { lineStyles } from './Line.styles';

export const TrendLine = () => {
  const theme = useTheme();
  const t = useT();
  const fp = theme.palette.foundation;
  const styles = lineStyles(theme);

  return (
    <Box sx={styles.chartCard}>
      <LineChart
        xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7], label: t('chart.day') }]}
        series={[
          {
            data: [2, 5.5, 2, 8.5, 1.5, 5, 7],
            label: t('chart.requests'),
            color: fp.accent,
            area: true,
          },
        ]}
        height={300}
        hideLegend
      />
    </Box>
  );
};
```

样式文件：

```tsx
// Line.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const lineStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
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

### 基础折线图

```tsx
<LineChart
  xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
  series={[{ data: [2, 5.5, 2, 8.5, 1.5, 5] }]}
  colors={[fp.accent]}
  height={300}
/>
```

### 面积图（Area）

在 series 上设置 `area: true`：

```tsx
<LineChart
  series={[{ data: [2, 5, 2, 8, 1, 5], area: true, color: fp.accent }]}
  xAxis={[{ data: [1, 2, 3, 4, 5, 6] }]}
  height={300}
/>
```

### 堆叠面积图

```tsx
<LineChart
  series={[
    { dataKey: 'fr', label: t('chart.france'), stack: 'total', area: true },
    { dataKey: 'dl', label: t('chart.germany'), stack: 'total', area: true },
    { dataKey: 'gb', label: t('chart.uk'), stack: 'total', area: true },
  ]}
  dataset={dataset}
  xAxis={[{ dataKey: 'date', scaleType: 'time' }]}
  colors={[fp.accent, fp.status.success, fp.status.warning]}
  height={300}
/>
```

### 多系列折线

```tsx
<LineChart
  xAxis={[{ data: months }]}
  series={[
    { data: salesData, label: t('chart.sales'), color: fp.accent },
    { data: profitData, label: t('chart.profit'), color: fp.status.success },
  ]}
  height={350}
/>
```

### 带数据点标记（Marks）

```tsx
<LineChart
  series={[{ data: values, showMark: true }]}
  height={300}
/>

// 条件显示标记
<LineChart
  series={[{ data: values, showMark: (params) => params.index % 2 === 0 }]}
  height={300}
/>
```

### 插值方式（Curve）

```tsx
// 直线（默认）
series={[{ data: values, curve: 'linear' }]}

// 单调平滑
series={[{ data: values, curve: 'monotoneX' }]}

// 阶梯
series={[{ data: values, curve: 'step' }]}

// 阶梯前置
series={[{ data: values, curve: 'stepBefore' }]}

// 阶梯后置
series={[{ data: values, curve: 'stepAfter' }]}

// 自然样条
series={[{ data: values, curve: 'natural' }]}
```

### 缺失数据处理

```tsx
series={[{
  data: [2, 5, null, 8, null, 5],  // null 表示缺失
  connectNulls: true,               // 跳过 null 连接前后点
}]}
```

### 时间轴

```tsx
<LineChart
  xAxis={[{
    dataKey: 'date',
    scaleType: 'time',
    valueFormatter: (date: Date) =>
      date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
  }]}
  dataset={timeData}
  series={[{ dataKey: 'value', color: fp.accent }]}
  height={300}
/>
```

### Dataset 模式

```tsx
const dataset = [
  { year: 2020, revenue: 100, cost: 80 },
  { year: 2021, revenue: 150, cost: 90 },
  { year: 2022, revenue: 200, cost: 110 },
];

<LineChart
  dataset={dataset}
  xAxis={[{ dataKey: 'year', valueFormatter: (v: number) => v.toString() }]}
  series={[
    { dataKey: 'revenue', label: t('chart.revenue'), area: true },
    { dataKey: 'cost', label: t('chart.cost') },
  ]}
  colors={[fp.accent, fp.status.danger]}
  height={350}
/>
```

### 对数刻度

```tsx
<LineChart
  yAxis={[{ scaleType: 'log' }]}
  series={[{ data: [1, 10, 100, 1000], color: fp.accent }]}
  xAxis={[{ data: [1, 2, 3, 4] }]}
  height={300}
/>
```

### 网格线

```tsx
<LineChart
  grid={{ horizontal: true, vertical: true }}
  series={series}
  xAxis={xAxis}
  height={300}
/>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `series` | `LineSeriesType[]` | 必填 | 数据系列配置 |
| `dataset` | `object[]` | - | 数据集模式 |
| `xAxis` | `AxisConfig[]` | auto | X 轴配置 |
| `yAxis` | `AxisConfig[]` | auto | Y 轴配置 |
| `width` | `number` | 响应式 | 图表宽度 |
| `height` | `number` | 响应式 | 图表高度 |
| `colors` | `string[]` | MUI 默认 | 调色板 |
| `margin` | `{ top?, right?, bottom?, left? }` | auto | 绘图区外边距 |
| `grid` | `{ horizontal?: boolean, vertical?: boolean }` | - | 网格线 |
| `hideLegend` | `boolean` | `false` | 隐藏图例 |
| `skipAnimation` | `boolean` | `false` | 跳过动画 |
| `onMarkClick` | `(event, d) => void` | - | 数据点点击 |
| `onLineClick` | `(event, d) => void` | - | 线条点击 |
| `onAreaClick` | `(event, d) => void` | - | 面积区域点击 |
| `onAxisClick` | `(event, data) => void` | - | 轴区域点击 |
| `slotProps` | `{ mark?, line?, area?, legend?, tooltip? }` | - | 子组件 props |
| `slots` | `{ mark?, line?, area?, legend?, tooltip? }` | - | 子组件替换 |
| `sx` | `SxProps<Theme>` | - | 根元素样式 |
| `loading` | `boolean` | `false` | 显示加载骨架 |

### LineSeriesType 关键字段

| 字段 | Type | Default | 说明 |
|------|------|---------|------|
| `data` | `(number \| null)[]` | - | Y 值数组（与 dataKey 二选一） |
| `dataKey` | `string` | - | dataset 中的字段名 |
| `label` | `string` | - | 系列标签（图例 + tooltip） |
| `id` | `string` | 自动生成 | 系列唯一标识 |
| `color` | `string` | 从 colors 取 | 线条颜色 |
| `area` | `boolean` | `false` | 是否填充面积 |
| `stack` | `string` | - | 堆叠组标识 |
| `stackOrder` | `string` | `'none'` | 堆叠排序 |
| `stackOffset` | `string` | `'none'` | 堆叠偏移策略 |
| `curve` | `'linear' \| 'monotoneX' \| 'step' \| 'stepBefore' \| 'stepAfter' \| 'natural'` | `'linear'` | 插值方式 |
| `showMark` | `boolean \| ((params) => boolean)` | `false` | 是否显示数据点标记 |
| `connectNulls` | `boolean` | `false` | 是否跳过 null 连接 |
| `valueFormatter` | `(value: number \| null) => string` | - | tooltip 格式化 |
| `highlightScope` | `{ highlight, fade }` | - | 高亮范围 |

## 颜色配置

```tsx
// 方式一：全局调色板
<LineChart colors={[fp.accent, fp.status.success, fp.status.warning]} />

// 方式二：逐系列 color
series={[
  { data: values1, color: fp.accent },
  { data: values2, color: fp.status.success },
]}

// 方式三：colorMap（基于 Y 值着色区间）
<LineChart
  yAxis={[{
    colorMap: {
      type: 'piecewise',
      thresholds: [0, 50, 100],
      colors: [fp.status.danger, fp.status.warning, fp.status.success],
    },
  }]}
/>
```

## 无障碍 (a11y)

- 添加 aria-label 描述图表内容：

```tsx
<LineChart
  series={series}
  slotProps={{ svg: { 'aria-label': t('charts.line.ariaLabel') } }}
/>
```

- 使用 `showMark: true` 让数据点可被辅助技术定位
- 确保线条颜色对比度满足 WCAG AA

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **配色**：线条 / 面积颜色从 `theme.palette.foundation.*` 取值，禁止硬编码 hex
2. **圆角**：外层容器 `borderRadius: 2`
3. **i18n**：轴标签 `valueFormatter` + 系列 `label` 走 `t()`
4. **样式**：图表容器样式写在 `<Name>.styles.ts` 工厂函数
5. **面积图**：推荐搭配 `area: true` 展示趋势
6. **时间轴**：使用 `scaleType: 'time'` + `valueFormatter` 格式化日期
7. **单系列**：使用 `hideLegend` 隐藏图例
