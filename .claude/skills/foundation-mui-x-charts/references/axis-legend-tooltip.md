# 坐标轴 / 图例 / 提示框 通用配置

## Import

```tsx
// 坐标轴（Composition API 中使用）
import { ChartsXAxis, ChartsYAxis } from '@mui/x-charts';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';

// 图例
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { ContinuousColorLegend, PiecewiseColorLegend } from '@mui/x-charts/ChartsLegend';

// 提示框
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { useItemTooltip, useAxisTooltip } from '@mui/x-charts/ChartsTooltip';
```

## 坐标轴（Axis）

### 轴类型（scaleType）

| scaleType | 说明 | 适用数据 |
|-----------|------|----------|
| `'band'` | 等宽分段（柱状图类别轴） | 字符串/数字/日期 |
| `'point'` | 等距点（折线图默认 X 轴） | 字符串/数字/日期 |
| `'linear'` | 线性数值映射 | 数字 |
| `'log'` | 对数刻度 | 数字 |
| `'sqrt'` | 平方根刻度 | 数字 |
| `'symlog'` | 对称对数（含负值） | 数字 |
| `'time'` / `'utc'` | 时间轴 | Date 对象 |

### 轴配置对象

```tsx
xAxis={[{
  id: 'x-axis-1',           // 唯一标识（Composition 中必填）
  scaleType: 'band',        // 刻度类型
  data: ['A', 'B', 'C'],    // 轴数据
  dataKey: 'month',          // dataset 模式字段名
  label: t('chart.xLabel'),  // 轴标签
  position: 'bottom',        // 'top' | 'bottom'（X）/ 'left' | 'right'（Y）
  min: 0,                    // 域最小值
  max: 100,                  // 域最大值
  reverse: false,            // 反转方向
  width: 60,                 // Y 轴宽度
  height: 48,                // X 轴高度
  valueFormatter: (v, ctx) => {
    // ctx.location: 'tick' | 'tooltip'
    if (ctx.location === 'tick') return v.toString().slice(0, 3);
    return `${t('chart.value')}: ${v}`;
  },
  colorMap: { ... },         // 基于值的颜色映射
  tickInterval: [0, 25, 50, 75, 100], // 自定义刻度位置
}]}
```

### 隐藏轴

```tsx
xAxis={[{ position: 'none' }]}  // 隐藏 X 轴
yAxis={[{ position: 'none' }]}  // 隐藏 Y 轴
```

### 多轴

```tsx
<LineChart
  yAxis={[
    { id: 'left', label: t('chart.temperature') },
    { id: 'right', label: t('chart.humidity'), position: 'right' },
  ]}
  series={[
    { data: temps, yAxisId: 'left' },
    { data: humidity, yAxisId: 'right' },
  ]}
/>
```

### 参考线

```tsx
<LineChart
  // ... series, xAxis, yAxis
  slotProps={{
    referenceLine: { y: 50, label: t('chart.threshold'), lineStyle: { stroke: 'red' } },
  }}
/>

// Composition API
<ChartsReferenceLine y={50} label="Threshold" lineStyle={{ stroke: 'red' }} />
```

### 网格线

```tsx
<BarChart grid={{ horizontal: true, vertical: false }} ... />
```

### colorMap（基于值着色）

三种模式（颜色必须从 `theme.palette.foundation.*` 取）：

```tsx
const fp = theme.palette.foundation;

// 分段（piecewise）—— n 个阈值产生 n+1 个颜色区间
colorMap: {
  type: 'piecewise',
  thresholds: [0, 50, 100],
  colors: [fp.status.danger, fp.status.warning, fp.status.success, fp.accent],
}

// 连续（continuous）—— 渐变两端
colorMap: {
  type: 'continuous',
  min: 0,
  max: 100,
  color: [fp.status.danger, fp.status.success],
}

// 序数（ordinal）—— 类别对应颜色
colorMap: {
  type: 'ordinal',
  values: ['A', 'B', 'C'],
  colors: [fp.accent, fp.status.success, fp.status.warning],
}
```

---

## 图例（Legend）

### 隐藏图例

```tsx
<PieChart hideLegend ... />
<BarChart hideLegend ... />
```

### 图例位置

通过 `slotProps.legend` 配置：

```tsx
<BarChart
  slotProps={{
    legend: {
      direction: 'horizontal',  // 'horizontal' | 'vertical'
      position: {
        vertical: 'bottom',     // 'top' | 'middle' | 'bottom'
        horizontal: 'center',   // 'left' | 'middle' | 'right'
      },
    },
  }}
/>
```

### 图例尺寸

```tsx
slotProps={{
  legend: {
    itemMarkWidth: 10,
    itemMarkHeight: 10,
    markGap: 5,
    itemGap: 10,
  },
}}
```

### 图例标记形状

```tsx
series={[{
  data: values,
  label: t('chart.series1'),
  labelMarkType: 'circle',  // 'circle' | 'square' | 'line' | 'rect'
}]}
```

### 可见性切换

图例默认支持点击切换系列可见性（v9 新特性）。

### 自定义图例组件

Composition API 中使用 `ChartsLegend`：

```tsx
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';

// 在 ChartsDataProvider 内部使用
<ChartsLegend
  direction="horizontal"
  position={{ vertical: 'top', horizontal: 'center' }}
  onItemClick={(event, context, index) => {
    console.log('点击了图例项', context);
  }}
/>
```

### 颜色图例（Color Legend）

用于展示 colorMap 的颜色映射：

```tsx
import { ContinuousColorLegend } from '@mui/x-charts/ChartsLegend';
import { PiecewiseColorLegend } from '@mui/x-charts/ChartsLegend';

// 连续色阶图例
<ContinuousColorLegend axisId="my-axis" direction="horizontal" />

// 分段色阶图例
<PiecewiseColorLegend axisId="my-axis" direction="horizontal" />
```

---

## 提示框（Tooltip）

### 触发方式

```tsx
<BarChart
  slotProps={{
    tooltip: {
      trigger: 'item',   // 'item' | 'axis' | 'none'
    },
  }}
/>
```

- `'item'`：hover 到具体数据项时显示
- `'axis'`：鼠标位置对应 X 轴值，显示该位置所有系列数据
- `'none'`：禁用 tooltip

### 格式化

通过 series 的 `valueFormatter` 控制 tooltip 内容：

```tsx
series={[{
  data: values,
  valueFormatter: (v: number | null) => `${(v ?? 0).toFixed(1)} MB`,
  label: t('chart.diskUsage'),
}]}
```

轴格式化：

```tsx
xAxis={[{
  data: dates,
  scaleType: 'time',
  valueFormatter: (date: Date, ctx) => {
    if (ctx.location === 'tooltip') return date.toLocaleString();
    return date.toLocaleDateString();
  },
}]}
```

### 排序

```tsx
slotProps={{
  tooltip: {
    trigger: 'axis',
    // 按值降序排列 tooltip 中的系列
    itemSorter: (a, b) => (b.value ?? 0) - (a.value ?? 0),
  },
}}
```

### 位置

```tsx
slotProps={{
  tooltip: {
    trigger: 'item',
    // 固定位置
    anchorEl: { getBoundingClientRect: () => ({ ... }) },
  },
}}
```

### 样式定制

```tsx
const fp = theme.palette.foundation;

<BarChart
  sx={{
    '& .MuiChartsTooltip-root': {
      backgroundColor: fp.bg.elevated,
      borderRadius: 2,
      border: `1px solid ${fp.divider}`,
    },
    '& .MuiChartsTooltip-cell': {
      color: fp.text.primary,
    },
  }}
/>
```

### 自定义 Tooltip 组件

```tsx
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { useItemTooltip, useAxisTooltip } from '@mui/x-charts/ChartsTooltip';

// Composition API 中
<ChartsTooltip trigger="axis" />
```

---

## 无障碍 (a11y)

- 轴 `label` 为 SVG text 元素，可被辅助技术读取
- Tooltip 默认 `role="tooltip"`，键盘用户通过 Tab 聚焦数据项触发
- 图例项可通过键盘 Tab 导航并 Enter 切换可见性

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **轴标签**：`label` 和 `valueFormatter` 走 `t()` 国际化，禁止硬编码中文/英文
2. **颜色**：`colorMap` 的 colors 从 `theme.palette.foundation.*` 取值，禁止硬编码 hex
3. **图例**：小图表 `hideLegend`，大图表通过 `slotProps.legend` 配置位置
4. **tooltip**：通过 `valueFormatter` 控制显示内容，样式覆盖从 fp 取色
5. **网格线**：按需开启，避免同时开启水平 + 垂直产生视觉噪音
6. **参考线**：用于标注阈值、目标值等关键指标，颜色走 `fp.status.*`
