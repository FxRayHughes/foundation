# 样式定制 + Composition API

## Import

```tsx
// 核心容器
import { ChartsContainer } from '@mui/x-charts/ChartsContainer';
import { ChartsDataProvider } from '@mui/x-charts/ChartsDataProvider';
import { ChartsSurface } from '@mui/x-charts/ChartsSurface';

// 绘图子组件
import { BarPlot } from '@mui/x-charts/BarChart';
import { LinePlot, AreaPlot, MarkPlot, LineHighlightPlot } from '@mui/x-charts/LineChart';
import { ScatterPlot } from '@mui/x-charts/ScatterChart';
import { PiePlot, PieArcPlot, PieArcLabelPlot } from '@mui/x-charts/PieChart';

// 轴 / 图例 / Tooltip
import { ChartsXAxis, ChartsYAxis } from '@mui/x-charts';
import { ChartsGrid } from '@mui/x-charts/ChartsGrid';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';
import { ChartsClipPath } from '@mui/x-charts/ChartsClipPath';

// CSS 类名（用于 sx 样式覆盖）
import { barClasses } from '@mui/x-charts/BarChart';
import { lineClasses, areaClasses, markClasses } from '@mui/x-charts/LineChart';
import { pieClasses } from '@mui/x-charts/PieChart';
import { gaugeClasses } from '@mui/x-charts/Gauge';

// 内置调色板（Foundation 项目不推荐，仅供参考）
import { blueberryTwilightPalette, mangoFusionPalette, cheerfulFiestaPalette } from '@mui/x-charts/colorPalettes';
```

## 基础用法（Foundation 模式完整示例）

混合图表（柱 + 线）使用 Composition API：

```tsx
import { Box, useTheme } from '@mui/material';
import { ChartsContainer } from '@mui/x-charts/ChartsContainer';
import { BarPlot } from '@mui/x-charts/BarChart';
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart';
import { ChartsXAxis, ChartsYAxis } from '@mui/x-charts';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { useT } from '@/i18n';
import { mixedChartStyles } from './MixedChart.styles';

export const MixedChart = () => {
  const theme = useTheme();
  const t = useT();
  const fp = theme.palette.foundation;
  const styles = mixedChartStyles(theme);

  return (
    <Box sx={styles.chartCard}>
      <ChartsContainer
        series={[
          { type: 'bar', data: [1, 2, 3, 2, 1], color: fp.accent },
          { type: 'line', data: [4, 3, 1, 3, 4], color: fp.status.success, showMark: true },
        ]}
        xAxis={[{ data: ['A', 'B', 'C', 'D', 'E'], scaleType: 'band', id: 'x' }]}
        height={300}
      >
        <BarPlot />
        <LinePlot />
        <MarkPlot />
        <ChartsXAxis label={t('chart.category')} axisId="x" />
        <ChartsYAxis />
        <ChartsTooltip trigger="axis" />
      </ChartsContainer>
    </Box>
  );
};
```

### series 必须指定 type

在 Composition 中，series 不会自动推断类型：

```tsx
// ✅ 正确
series={[
  { type: 'bar', data: [1, 2, 3] },
  { type: 'line', data: [3, 2, 1] },
]}

// ❌ 错误（缺少 type）
series={[
  { data: [1, 2, 3] },
]}
```

---

## 样式定制

### 尺寸与边距

```tsx
<BarChart
  width={600}
  height={400}
  margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
/>
```

不传 `width`/`height` 时自动响应式填充父容器。

### sx 样式覆盖

所有图表组件支持 MUI `sx` prop：

```tsx
const fp = theme.palette.foundation;

<LineChart
  sx={{
    // 修改线条样式
    '& .MuiLineElement-root': { strokeWidth: 2 },
    // 修改面积填充
    '& .MuiAreaElement-root': { fillOpacity: 0.3 },
    // 修改标记点
    '& .MuiMarkElement-root': { scale: '0.8' },
    // 轴标签
    '& .MuiChartsAxis-label': { fill: fp.text.secondary, fontSize: 12 },
    // 刻度文字
    '& .MuiChartsAxis-tickLabel': { fill: fp.text.muted, fontSize: 11 },
  }}
/>
```

### CSS 类名参考

使用官方导出的 `*Classes` 对象（不要猜字符串类名）：

```tsx
import { pieClasses } from '@mui/x-charts/PieChart';

<PieChart
  sx={{
    [`& .${pieClasses.arcLabel}`]: {
      fontWeight: 'bold',
      fill: fp.text.primary,
    },
  }}
/>
```

### 自定义调色板（Foundation 模式）

```tsx
const fp = theme.palette.foundation;

// 推荐：从 Foundation palette 构建图表调色板
const chartPalette = [
  fp.accent,
  fp.status.success,
  fp.status.warning,
  fp.status.danger,
  fp.text.muted,
];

<BarChart colors={chartPalette} />
```

### 绘图区背景（仅 Composition）

```tsx
function Background() {
  const fp = theme.palette.foundation;
  return <rect x={0} y={0} width="100%" height="100%" fill={fp.bg.elevated} rx={8} />;
}

<ChartsContainer ...>
  <Background />
  <BarPlot />
  <ChartsXAxis />
</ChartsContainer>
```

### 可用的绘图子组件

| 组件 | 说明 |
|------|------|
| `BarPlot` | 柱状图绘制 |
| `LinePlot` | 折线绘制 |
| `AreaPlot` | 面积填充 |
| `MarkPlot` | 数据点标记 |
| `ScatterPlot` | 散点绘制 |
| `PiePlot` | 饼图绘制 |
| `LineHighlightPlot` | 折线高亮 |
| `ChartsXAxis` | X 轴 |
| `ChartsYAxis` | Y 轴 |
| `ChartsGrid` | 网格线 |
| `ChartsLegend` | 图例 |
| `ChartsTooltip` | 提示框 |
| `ChartsReferenceLine` | 参考线 |
| `ChartsClipPath` | 裁剪路径 |
| `ChartsAxisHighlight` | 轴高亮线 |

### 核心结构组件

| 组件 | 说明 |
|------|------|
| `ChartsDataProvider` | 数据上下文提供者（最外层，不含 SVG） |
| `ChartsContainer` | = DataProvider + Surface（简写，含 SVG） |
| `ChartsSurface` | SVG 渲染层 |
| `ChartsWrapper` | HTML 包装器（含图例定位） |

### ChartsDataProvider + ChartsSurface（分离模式）

当需要在 SVG 外部放置 HTML 组件（如图例）时：

```tsx
<ChartsDataProvider
  series={[{ type: 'bar', data: [100, 200] }]}
  xAxis={[{ scaleType: 'band', data: ['A', 'B'] }]}
  width={500}
  height={300}
>
  <ChartsLegend />
  <ChartsSurface>
    <BarPlot />
    <ChartsXAxis />
  </ChartsSurface>
</ChartsDataProvider>
```

### 图层顺序

子组件的渲染顺序决定了 SVG 图层叠加（先渲染的在底层）：

```tsx
<ChartsContainer ...>
  {/* 底层 → 顶层 */}
  <ChartsGrid />
  <AreaPlot />
  <BarPlot />
  <LinePlot />
  <MarkPlot />
  <ChartsReferenceLine y={50} />
  <ChartsXAxis />
  <ChartsYAxis />
  <ChartsAxisHighlight x="line" />
  <ChartsTooltip />
</ChartsContainer>
```

### 响应式 Composition

不传 `width`/`height` 时自动响应式：

```tsx
<Box sx={{ width: '100%', height: 400 }}>
  <ChartsContainer series={series} xAxis={xAxis}>
    <BarPlot />
    <ChartsXAxis />
  </ChartsContainer>
</Box>
```

### Dataset 在 Composition 中

```tsx
<ChartsContainer
  dataset={dataset}
  series={[
    { type: 'bar', dataKey: 'london', label: 'London' },
    { type: 'line', dataKey: 'paris', label: 'Paris' },
  ]}
  xAxis={[{ dataKey: 'month', scaleType: 'band' }]}
>
  <BarPlot />
  <LinePlot />
</ChartsContainer>
```

---

## 无障碍 (a11y)

- Composition 模式下，通过 `ChartsContainer` 的 `slotProps.svg` 添加 aria-label
- 确保图表有文本替代（轴标签、图例、tooltip）
- 颜色不应是传达信息的唯一方式（搭配形状、标签）

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **配色**：所有颜色从 `theme.palette.foundation.*` 取值，禁止硬编码 hex 或使用内置调色板
2. **圆角**：外层容器 `borderRadius: 2`
3. **CSS 类名**：通过 `sx` + 官方 `*Classes` 对象定制，不要用字符串猜类名
4. **Composition**：混合图表（柱+线）必须用 Composition API
5. **图层**：注意子组件顺序，Grid 在底层，Tooltip 在顶层
6. **响应式**：优先不传 width/height 让图表自适应父容器
7. **样式工厂**：图表容器的 sx 写在 `<Name>.styles.ts` 工厂函数中
8. **type 必填**：Composition 模式下 series 必须指定 `type` 字段
