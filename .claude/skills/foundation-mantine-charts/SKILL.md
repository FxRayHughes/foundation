---
name: foundation-mantine-charts
description: Foundation 项目图表用法：@mantine/charts 9.7.5（基于 recharts 3.10）的 Bar/Line/Area/Donut/Pie/Radar/Scatter/Bubble/Composite/Sparkline/Gauge/Funnel/Sankey/Treemap/Heatmap/MatrixChart/BarsList 等，以及项目自封装的 x-pro 图表（HeatmapChart/FunnelChart/RadarChart/CandlestickChart/SankeyChart/GanttChart/TreemapChart/ZoomableChart + useChartColors）。含配色铁律（FOUNDATION_CSS_VARS / useChartColors / 何时用 useFoundationPalette）、尺寸、i18n、官方文档。触发词：图表 / chart / BarChart / LineChart / DonutChart / PieChart / 热力图 / 漏斗 / 雷达 / K线 / 桑基 / 甘特 / 矩形树图 / 缩放 / Brush / @mantine/charts / recharts / x-charts 迁移。
---

# Foundation 图表（@mantine/charts + x-pro）

两层：
1. **`@mantine/charts`**（`import { BarChart, DonutChart } from '@mantine/charts'`）——直接用，覆盖绝大部分场景。样式 `@mantine/charts/styles.css` 已在 `styles/index.ts` 全局引入。
2. **项目 x-pro 图表**（`import { HeatmapChart, … } from '@/components/x-pro/charts'`）——对 @mantine/charts 的薄封装（统一数据结构 + 默认主题色），外加 Mantine 没有的 `GanttChart`（纯 SVG 自绘）和 `ZoomableChart`。

旧 `@mui/x-charts` 已移除。对照：`PieChart(innerRadius)` → `DonutChart` / `PieChart`；`BarChart(layout="horizontal")` → `BarChart orientation="vertical"`；`LineChart` / `ScatterChart` / `Gauge` / `SparkLineChart` → `LineChart` / `ScatterChart` / `GaugeChart` / `Sparkline`。

## 配色铁律

| 场景 | 写法 |
|---|---|
| series / cell 颜色、`gridColor` / `textColor` / `strokeColor` / `cursorFill` | `FOUNDATION_CSS_VARS.*`（`'var(--fd-…)'`，主题切换零重渲染） |
| 多系列需要一组区分色 | `useChartColors(count?)`（`@/components/x-pro/charts`） |
| 需要真实色值做插值 / canvas | `useFoundationPalette()` |
| ❌ | 十六进制、`'blue.6'` 之类 Mantine 色阶直接写在业务代码里 |

`@mantine/charts` 的所有 `color` 都经 `getThemeColor` 解析：`'var(--x)'` 原样使用，`'violet.5'` 转成 Mantine 色阶变量。所以 CSS 变量字符串可以直接塞进 `color` 字段。默认 `textColor` 为 `'dimmed'`（= `--fd-text-secondary`），`gridColor` 默认随 color scheme——项目里显式传 `FOUNDATION_CSS_VARS.divider` 以对齐主题。

### `useChartColors`

```ts
// components/x-pro/charts/shared/useChartColors.ts
// 前 7 个 = 主题变量：accent, success, warning, danger, accentHover, text.secondary, text.muted
// 后 8 个 = Mantine 色阶 token：violet.5 pink.5 cyan.5 orange.5 lime.6 grape.5 teal.5 indigo.5
const colors = useChartColors();     // 全部 15 个
const colors = useChartColors(n);    // 循环取 n 个
```

返回值可直接喂 @mantine/charts 的 `color`；**自绘 SVG** 时 token 需先解析：`getThemeColor(color, useMantineTheme())`（`GanttChart` 就是这么做的）。新增系列色只改这个文件，不要在页面里另造色板。

## 尺寸

- 网格类（Bar / Line / Area / Composite / Scatter / Radar / Candlestick）用 `h={number}`（必填一个高度）+ 可选 `w`；宽度默认撑满父级，父级在 flex 中需 `min-width: 0`。
- Donut / Pie / Gauge 用 `size`（正方形）；Sankey / Treemap 用 `height` + `w`。
- 需要按容器自适应的自绘图表：`useElementSize()`（`HeatmapChart` / `GanttChart`）。

## i18n

x-pro 图表自带语言包（`components/x-pro/charts/lang`，命名空间 `xproCharts.*`，`registerXProChartsLocales()` 已在 `App.tsx` 注册；组件内用 `useChartsI18n()`），覆盖 aria-label / 空状态 / tooltip 固定文案；每个 x-pro 图表都接受可选 `ariaLabel`。

series 的 `label`、`xAxisLabel` / `yAxisLabel`、tooltip 内的固定文案（如 `CandlestickChart` 的 `labels`）都传 `t()`；类目名（`dataKey` 指向的字段值）如果是人类可读名也先翻译再放进 data。`valueFormatter` 负责数字格式（字节、百分比等）。

---

## @mantine/charts 常用

### BarChart（`settings/database/Database.tsx` 实例）

```tsx
<BarChart
  h={220}
  data={barData}                       // [{ label, sizeBytes, color }]
  dataKey="label"
  orientation="vertical"               // vertical = 类目在 Y 轴（水平条形）
  series={[{ name: 'sizeBytes', label: t('settings.database.charts.bytes.title'), color: FOUNDATION_CSS_VARS.accent }]}
  valueFormatter={formatBytes}
  yAxisProps={{ width: 96 }}
  gridAxis="x"
  gridColor={FOUNDATION_CSS_VARS.divider}
  textColor={FOUNDATION_CSS_VARS.text.muted}
  cursorFill={FOUNDATION_CSS_VARS.bg.hover}
  maxBarWidth={28}
/>
```

- 每行数据带 `color` 字段 → 该柱单独着色（源码：`entry?.color ? getThemeColor(entry.color)`）；或用 `getBarColor(value, series)` 按值着色。
- `type`: `'default' | 'stacked' | 'percent' | 'waterfall'`；`series[].stackId`；`withBarValueLabel`；`withLegend`；`referenceLines`。

### DonutChart / PieChart

```tsx
<DonutChart
  data={tables.map((tb, i) => ({ name: labelOf(tb), value: tb.sizeBytes, color: colorOf(i) }))}   // color 必填
  size={200} thickness={52} paddingAngle={1} strokeWidth={0}
  pieProps={{ cornerRadius: 2 }}
  withTooltip tooltipDataSource="segment"   // 只显示悬停段
  valueFormatter={formatBytes}
/>
```

`chartLabel`（中心文字）、`withLabels` + `labelsType: 'value' | 'percent' | 'name'`、`startAngle/endAngle`（半环）、`strokeColor`（建议 `FOUNDATION_CSS_VARS.bg.surface`）。

### LineChart / AreaChart / CompositeChart

共用 `GridChartBaseProps`：`data`、`dataKey`、`series`、`withLegend`、`withTooltip`（默认 true）、`gridAxis: 'x'|'y'|'xy'|'none'`、`tickLine`、`strokeDasharray`、`xAxisProps` / `yAxisProps`、`valueFormatter`、`unit`、`referenceLines` / `referenceAreas` / `referenceDots`、`withRightYAxis`、**`withBrush` + `brushProps`**（区间缩放）。
- Line：`curveType`（`linear|monotone|natural|step|…`）、`withDots`、`connectNulls`、`type="gradient"` + `gradientStops`。
- Area：`type: 'default'|'stacked'|'percent'|'split'|'stream'`、`withGradient`、`fillOpacity`、`splitColors`。**AreaChartSeries 的 `color` 必填**。
- Composite：`series[].type: 'line'|'area'|'bar'` 混排。

### 其它

| 组件 | 要点 |
|---|---|
| `Sparkline` | `data: number[]`、`color`、`trendColors={{ positive: FOUNDATION_CSS_VARS.status.success, negative: FOUNDATION_CSS_VARS.status.danger }}`、`h` / `w` |
| `GaugeChart` | `value` / `min` / `max` / `sections` / `filledColor` / `trackColor`（`FOUNDATION_CSS_VARS.bg.elevated`）/ `size` |
| `RadialBarChart` / `BulletChart` / `WaffleChart` / `SunburstChart` / `BubbleChart` / `ScatterChart` | 见 references |
| `BarsList` | 列表式横条（`data: [{ name, value, color? }]`、`barColor`、`valueFormatter`）——适合"Top N"这种小块 |
| `Heatmap` | **日历热力图**（`data: Record<'YYYY-MM-DD', number>`、`startDate/endDate`、`colors`）；矩阵热力图用 `MatrixChart` 或项目 `HeatmapChart` |
| `MatrixChart` | 行列矩阵（`data: [{ x, y, value }]`、`xLabels/yLabels`、`colors`、`cellSize`、`getCellProps`） |
| `ChartTooltip` / `ChartLegend` | 自定义 tooltip/legend 内容（`tooltipProps={{ content: … }}`） |

Styles API：根元素 CSS 变量 `--chart-text-color` / `--chart-grid-color` / `--chart-cursor-fill`，selector `root | container | axis | grid | referenceLine | tooltip* | legend*`，可用 `classNames` + module.css 改（颜色仍用 `--fd-*`）。

---

## 项目 x-pro 图表（`frontend/src/components/x-pro/charts/`）

所有组件在 `width` 缺省时撑满父级宽度（`'100%'`），颜色缺省取主题。

| 组件 | 底层 | Props（类型从 `@/components/x-pro/charts` 导出） |
|---|---|---|
| `HeatmapChart` | `MatrixChart` | `data: number[][]`（行 × 列）、`xLabels?`、`yLabels?`、`colorMap?: { min, max }`（默认 `bg.hover → accent`，中间 11 档 `color-mix` 插值）、`width?` / `height?`（缺省按容器 `useElementSize` 计算正方形格子）、`tooltip?`（默认 true）、`onCellClick?(row, col, value)` |
| `FunnelChart` | `FunnelChart` | `data: FunnelDataItem[]`（`{ label, value, color? }`，自动按 value 降序）、`width?`、`height?`（默认 300）、`orientation?: 'vertical' \| 'horizontal'`（vertical 走 Mantine 原生；horizontal 为项目自绘 SVG，左→右收窄，tooltip / 配色一致）、`withLabels?`、`valueFormatter?`、`ariaLabel?` |
| `RadarChart` | `RadarChart` | `axes: string[]`、`series: RadarSeries[]`（`{ label, data: number[], color? }`）、`max?`、`fillOpacity?`（0.25）、`levels?`（5）、`width?`、`height?`（300）。自带 legend / tooltip / dots |
| `CandlestickChart` | `CandlestickChart` | `data: CandlestickDataPoint[]`（`{ date, open, high, low, close }`）、`upColor?`（默认 success）、`downColor?`（默认 danger）、`width?`、`height?`（300）、`margin?: ChartMargin`、`labels?: Partial<CandlestickChartLabels>`（tooltip 的 open/high/low/close 文案；**默认取 x-pro 图表语言包 `xproCharts.candlestick.*`，随语言切换**，传入的字段逐项覆盖） |
| `SankeyChart` | `SankeyChart` | `nodes: { id, label, color? }[]`、`links: { source: id, target: id, value }[]`（按 id 引用，内部转下标；找不到的 link 丢弃）、`nodeWidth?`（20）、`nodePadding?`（12）、`width?`、`height?`（300） |
| `TreemapChart` | `Treemap` | `data: TreemapNode`（`{ label, value?, children?, color? }`，**根节点不绘制**，第一层按系列色、子层继承父色）、`colorMap?: string[]`、`width?`、`height?`（300）、`onNodeClick?(node)`（回传原始 TreemapNode） |
| `GanttChart` | **纯 SVG 自绘** | `tasks: GanttTask[]`（`{ id, label, start, end, progress?: 0–1, dependencies?: id[], color? }`）、`viewMode?: 'day' \| 'week' \| 'month'`、`width?`、`height?`（缺省按任务数计算）、`onTaskClick?(task)`。固定色走 `GanttChart.module.css` 的 `--fd-*`，条形色来自 `useChartColors` 经 `getThemeColor` 解析 |
| `ZoomableChart` | `LineChart` / `AreaChart` + Brush，或 CSS transform | **模式二（推荐）**：传 `data` + `dataKey` + `series: ZoomableSeries[]`（`{ name, label?, color? }`）+ `type?: 'line' \| 'area'`、`startIndex?` / `endIndex?`、`onRangeChange?({ startIndex, endIndex })`、`width?`、`height?`（300）。**模式一（兼容）**：不传 data 时包裹任意 `children`，提供滚轮缩放 / 拖拽平移：`enableZoom?`、`enablePan?`、`minZoom?`（0.5）、`maxZoom?`（5）、`onZoomChange?` |
| `useChartColors(count?)` | — | 见上 |
| `ChartMargin` | — | `{ top, right, bottom, left }` |

用法（`pages/XProDemoPage/XProDemoPage.tsx`）：

```tsx
import { HeatmapChart, FunnelChart, RadarChart, CandlestickChart, SankeyChart, GanttChart, TreemapChart } from '@/components/x-pro/charts';
import { useFoundationPalette } from '@/styles/themes';

const fp = useFoundationPalette();     // 热力图示例里想用 surface→accent 做插值，取真实色值

<Paper className={classes.card}>
  <Text className={classes.cardTitle}>{t('xpro.charts.heatmap')}</Text>
  <HeatmapChart data={heatmapData} xLabels={xLabels} yLabels={yLabels} colorMap={{ min: fp.bg.surface, max: fp.accent }} height={200} />
</Paper>
<RadarChart axes={radarAxes} series={radarSeries} height={250} />
<CandlestickChart data={candles} height={220} />  {/* 文案默认走 xproCharts 语言包；需要时用 labels 覆盖 */}
<GanttChart tasks={ganttTasks} viewMode="week" height={200} onTaskClick={(task) => vm.select(task.id)} />
```

> `colorMap` 其实也接受 `FOUNDATION_CSS_VARS.*`（插值用的是 CSS `color-mix`），用变量更好——主题切换无需重渲染。

### 扩展 x-pro 图表的约定

- 每个图表一个文件夹：`<Name>/<Name>.tsx` + `index.ts`（+ 需要时 `<Name>.module.css`），并在 `charts/index.ts` 与 `x-pro/index.ts` 导出组件和 Props 类型。
- 优先包 @mantine/charts；只有没有对应组件时才自绘 SVG，自绘的固定色写 module.css（`fill: var(--fd-…)`），数据色走 `useChartColors` + `getThemeColor`。
- 默认色一律来自 `FOUNDATION_CSS_VARS` / `useChartColors`，禁止十六进制；公开的文案类 props 让调用方传 `t()` 结果。

## references

`references/official/`：Mantine 官方 LLM 文档（https://mantine.dev/llms/charts-*.md，9.7.5，2026-11-06 拉取）——`charts-getting-started.md`、`charts-bar-chart.md`、`charts-line-chart.md`、`charts-area-chart.md`、`charts-donut-chart.md`、`charts-pie-chart.md`、`charts-radar-chart.md`、`charts-candlestick-chart.md`、`charts-sankey-chart.md`、`charts-treemap.md`、`charts-matrix-chart.md`、`charts-heatmap.md`、`charts-funnel-chart.md`、`charts-gauge-chart.md`、`charts-sparkline.md`、`charts-composite-chart.md`、`charts-scatter-chart.md`、`charts-bubble-chart.md`、`charts-bars-list.md`、`charts-bullet-chart.md`、`charts-radial-bar-chart.md`、`charts-sunburst-chart.md`、`charts-waffle-chart.md`。官方示例中的 `'indigo.6'` 等颜色请替换为 `FOUNDATION_CSS_VARS` / `useChartColors`。类型以 `frontend/node_modules/@mantine/charts/lib/<Name>/<Name>.d.ts` 为准。
