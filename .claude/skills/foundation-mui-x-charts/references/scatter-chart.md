# ScatterChart 散点图

## Import

```tsx
// 默认导入（推荐）
import { ScatterChart } from '@mui/x-charts/ScatterChart';

// 命名导入
import { ScatterChart, scatterClasses } from '@mui/x-charts/ScatterChart';

// Composition API（高级自定义布局）
import { ScatterPlot } from '@mui/x-charts/ScatterChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { ChartsXAxis, ChartsYAxis } from '@mui/x-charts';
```

## 基础用法（Foundation 模式完整示例）

```tsx
import { Box, useTheme } from '@mui/material';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { useT } from '@/i18n';
import { scatterStyles } from './Scatter.styles';

export const CorrelationScatter = () => {
  const theme = useTheme();
  const t = useT();
  const fp = theme.palette.foundation;
  const styles = scatterStyles(theme);

  return (
    <Box sx={styles.chartCard}>
      <ScatterChart
        height={300}
        series={[
          {
            label: t('chart.groupA'),
            data: [
              { x: 1, y: 2, id: '1' },
              { x: 2, y: 5, id: '2' },
              { x: 3, y: 3, id: '3' },
            ],
            color: fp.accent,
          },
          {
            label: t('chart.groupB'),
            data: [
              { x: 1, y: 4, id: '4' },
              { x: 2, y: 3, id: '5' },
              { x: 3, y: 6, id: '6' },
            ],
            color: fp.status.success,
          },
        ]}
        xAxis={[{ label: t('chart.xLabel') }]}
        yAxis={[{ label: t('chart.yLabel') }]}
      />
    </Box>
  );
};
```

样式文件：

```tsx
// Scatter.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const scatterStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
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

### 基础散点图

```tsx
<ScatterChart
  series={[{
    data: [
      { x: 100, y: 200, id: 'a1' },
      { x: 120, y: 180, id: 'a2' },
      { x: 170, y: 300, id: 'a3' },
    ],
    label: t('chart.seriesA'),
    color: fp.accent,
  }]}
  height={300}
/>
```

### 多系列散点图

```tsx
<ScatterChart
  series={[
    { data: groupAData, label: t('chart.groupA'), color: fp.accent },
    { data: groupBData, label: t('chart.groupB'), color: fp.status.success },
    { data: groupCData, label: t('chart.groupC'), color: fp.status.warning },
  ]}
  height={350}
/>
```

### 气泡图（z 值控制点大小）

通过 `z` 值控制点面积：

```tsx
<ScatterChart
  series={[{
    data: [
      { x: 1, y: 2, z: 100, id: '1' },
      { x: 2, y: 5, z: 300, id: '2' },
      { x: 3, y: 3, z: 50, id: '3' },
    ],
    label: t('chart.bubble'),
    color: fp.accent,
  }]}
  zAxis={[{ dataKey: 'z' }]}
  height={350}
/>
```

### Dataset 模式

```tsx
const dataset = [
  { x1: 10, y1: 20, x2: 15, y2: 25 },
  { x1: 20, y1: 30, x2: 25, y2: 35 },
];

<ScatterChart
  dataset={dataset}
  series={[
    { datasetKeys: { x: 'x1', y: 'y1' }, label: t('chart.seriesA'), color: fp.accent },
    { datasetKeys: { x: 'x2', y: 'y2' }, label: t('chart.seriesB'), color: fp.status.success },
  ]}
  height={300}
/>
```

### 带网格线

```tsx
<ScatterChart
  grid={{ horizontal: true, vertical: true }}
  series={series}
  height={300}
/>
```

### colorMap（基于轴值着色）

分段着色：

```tsx
<ScatterChart
  series={[{ data: points, color: fp.accent }]}
  xAxis={[{
    colorMap: {
      type: 'piecewise',
      thresholds: [-1.5, 0, 1.5],
      colors: [fp.status.danger, fp.status.warning, fp.status.success, fp.accent],
    },
  }]}
  height={300}
/>
```

连续色阶：

```tsx
<ScatterChart
  series={[{ data: points }]}
  yAxis={[{
    colorMap: {
      type: 'continuous',
      min: -2,
      max: 2,
      color: [fp.status.danger, fp.status.success],
    },
  }]}
  height={300}
/>
```

zAxis ordinal（按类别着色）：

```tsx
<ScatterChart
  series={[{ data: points }]}
  zAxis={[{
    data: categories,
    colorMap: {
      type: 'ordinal',
      values: categories,
      colors: [fp.accent, fp.status.success, fp.status.warning, fp.status.danger],
    },
  }]}
  height={300}
/>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `series` | `ScatterSeriesType[]` | 必填 | 数据系列配置 |
| `dataset` | `object[]` | - | 数据集模式 |
| `xAxis` | `AxisConfig[]` | auto | X 轴配置 |
| `yAxis` | `AxisConfig[]` | auto | Y 轴配置 |
| `zAxis` | `AxisConfig[]` | - | Z 轴（控制点大小 / 颜色映射） |
| `width` | `number` | 响应式 | 图表宽度 |
| `height` | `number` | 响应式 | 图表高度 |
| `colors` | `string[]` | MUI 默认 | 调色板 |
| `margin` | `{ top?, right?, bottom?, left? }` | auto | 绘图区外边距 |
| `grid` | `{ horizontal?: boolean, vertical?: boolean }` | - | 网格线 |
| `hideLegend` | `boolean` | `false` | 隐藏图例 |
| `skipAnimation` | `boolean` | `false` | 跳过动画 |
| `onItemClick` | `(event, d: ScatterItemIdentifier) => void` | - | 数据点点击 |
| `slotProps` | `{ scatter?, legend?, tooltip? }` | - | 子组件 props |
| `slots` | `{ scatter?, legend?, tooltip? }` | - | 子组件替换 |
| `sx` | `SxProps<Theme>` | - | 根元素样式 |
| `loading` | `boolean` | `false` | 显示加载骨架 |

### ScatterSeriesType 关键字段

| 字段 | Type | Default | 说明 |
|------|------|---------|------|
| `data` | `{ x: number, y: number, z?: number, id: string \| number }[]` | - | 数据点数组 |
| `datasetKeys` | `{ x: string, y: string, z?: string }` | - | dataset 模式字段映射 |
| `label` | `string` | - | 系列标签 |
| `id` | `string` | 自动生成 | 系列唯一标识 |
| `color` | `string` | 从 colors 取 | 点颜色 |
| `markerSize` | `number` | `4` | 点大小（像素半径） |
| `valueFormatter` | `(params: { x, y, z? }) => string` | - | tooltip 格式化 |
| `highlightScope` | `{ highlight, fade }` | - | 高亮范围 |

### ScatterValueType（data 数组元素）

| 字段 | Type | 说明 |
|------|------|------|
| `x` | `number` | X 坐标值 |
| `y` | `number` | Y 坐标值 |
| `z` | `number` | Z 值（可选，控制点大小或颜色） |
| `id` | `string \| number` | 唯一标识（必填） |

## 无障碍 (a11y)

- 添加 aria-label 描述图表内容：

```tsx
<ScatterChart
  series={series}
  slotProps={{ svg: { 'aria-label': t('charts.scatter.ariaLabel') } }}
/>
```

- 确保不同系列的颜色有足够对比度
- 使用 `markerSize` 确保点足够大可被点击（建议 >= 6）

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **配色**：系列 `color` 或 `colors` 从 `theme.palette.foundation.*` 取值，禁止硬编码 hex
2. **圆角**：外层容器 `borderRadius: 2`
3. **i18n**：轴 `label` + 系列 `label` + `valueFormatter` 走 `t()`
4. **样式**：图表容器样式写在 `<Name>.styles.ts` 工厂函数
5. **colorMap**：散点图最适合使用 `colorMap` 做基于值的颜色映射
6. **性能**：大数据量（>1000 点）考虑使用 `skipAnimation` 提升渲染性能
