# Foundation 高级图表组件

> **Foundation 自实现**：所有图表均为纯 SVG 实现，不依赖 canvas 或第三方图表库。
> **禁止**使用 `@mui/x-charts-pro` / `@mui/x-charts-premium` / `@mui/x-data-grid-pro` / `@mui/x-data-grid-premium` 等官方付费包。
> 统一 import 路径：`import { HeatmapChart, FunnelChart, ... } from '@/components/x-pro'`

---

## HeatmapChart 热力图

### Import

```tsx
import { HeatmapChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { HeatmapChart } from '@/components/x-pro';
import { useT } from '@/i18n';

function MyHeatmap() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  const data = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <HeatmapChart
      data={data}
      xLabels={[t('chart.mon'), t('chart.tue'), t('chart.wed')]}
      yLabels={[t('chart.morning'), t('chart.afternoon'), t('chart.evening')]}
      colorMap={{ min: fp.surfaceContainer, max: fp.primary }}
      tooltip
      onCellClick={(row, col, value) => console.log(row, col, value)}
    />
  );
}
```

### 数据格式

`data` 为二维数值矩阵 `number[][]`，行对应 Y 轴（yLabels），列对应 X 轴（xLabels）。
矩阵中的数值决定单元格颜色深浅，在 colorMap.min 到 colorMap.max 之间线性插值。

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `data` | `number[][]` | 是 | — | 二维数值矩阵 |
| `xLabels` | `string[]` | 否 | — | X 轴标签数组 |
| `yLabels` | `string[]` | 否 | — | Y 轴标签数组 |
| `colorMap` | `{ min: string; max: string }` | 否 | fp 主题色 | 颜色映射范围 |
| `width` | `number` | 否 | 自适应 | 图表宽度（px） |
| `height` | `number` | 否 | 自适应 | 图表高度（px） |
| `tooltip` | `boolean` | 否 | `false` | 是否启用悬浮提示框 |
| `onCellClick` | `(row: number, col: number, value: number) => void` | 否 | — | 单元格点击回调 |

### Foundation 约束

- 颜色默认从 `theme.palette.foundation` 取，通过 `colorMap` 可覆盖
- 标签文案必须走 `t('key')`
- 不传 width/height 时通过 ResizeObserver 自适应父容器

---

## FunnelChart 漏斗图

### Import

```tsx
import { FunnelChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { FunnelChart } from '@/components/x-pro';
import { useT } from '@/i18n';

function MyFunnel() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  return (
    <FunnelChart
      data={[
        { label: t('funnel.visit'), value: 10000, color: fp.primary },
        { label: t('funnel.signup'), value: 5000 },
        { label: t('funnel.purchase'), value: 1000 },
      ]}
      orientation="vertical"
    />
  );
}
```

### 数据格式

`data` 为 `FunnelDataItem[]` 数组，每项包含：
- `label`：阶段名称（必须走 `t()`）
- `value`：该阶段数值，决定漏斗宽度比例
- `color`：可选，覆盖该阶段颜色（默认从 fp 调色板依次取色）

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `data` | `FunnelDataItem[]` | 是 | — | 漏斗数据数组 |
| `data[].label` | `string` | 是 | — | 阶段标签 |
| `data[].value` | `number` | 是 | — | 阶段数值 |
| `data[].color` | `string` | 否 | fp 调色板 | 阶段颜色 |
| `orientation` | `'vertical' \| 'horizontal'` | 否 | `'vertical'` | 漏斗方向 |
| `width` | `number` | 否 | 自适应 | 图表宽度（px） |
| `height` | `number` | 否 | 自适应 | 图表高度（px） |

### Foundation 约束

- label 必须走 `t('key')`，禁止硬编码中文/英文
- 不传 color 时按 fp 调色板顺序自动分配

---

## RadarChart 雷达图

### Import

```tsx
import { RadarChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { RadarChart } from '@/components/x-pro';
import { useT } from '@/i18n';

function MyRadar() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  return (
    <RadarChart
      axes={[t('stat.speed'), t('stat.power'), t('stat.defense'), t('stat.range'), t('stat.hp')]}
      series={[
        { label: t('player.a'), data: [80, 90, 70, 60, 85], color: fp.primary },
        { label: t('player.b'), data: [65, 75, 95, 80, 70], color: fp.secondary },
      ]}
      max={100}
      fillOpacity={0.3}
      levels={5}
    />
  );
}
```

### 数据格式

- `axes`：字符串数组，定义雷达图各维度名称，数量决定多边形顶点数
- `series`：`RadarSeries[]` 数组，每项的 `data` 长度必须与 `axes` 长度一致
  - `label`：系列名称
  - `data`：各维度数值数组
  - `color`：可选，系列颜色

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `axes` | `string[]` | 是 | — | 各维度轴标签 |
| `series` | `RadarSeries[]` | 是 | — | 数据系列数组 |
| `series[].label` | `string` | 是 | — | 系列名称 |
| `series[].data` | `number[]` | 是 | — | 各维度数值（长度须与 axes 一致） |
| `series[].color` | `string` | 否 | fp 调色板 | 系列颜色 |
| `max` | `number` | 否 | 自动计算 | 轴最大值 |
| `fillOpacity` | `number` | 否 | `0.2` | 填充区域透明度（0-1） |
| `width` | `number` | 否 | 自适应 | 图表宽度（px） |
| `height` | `number` | 否 | 自适应 | 图表高度（px） |
| `levels` | `number` | 否 | `5` | 网格层数 |

### Foundation 约束

- axes 标签必须走 `t('key')`
- 不传 max 时自动取所有 series.data 中的最大值
- 不传 color 时按 fp 调色板顺序分配

---

## CandlestickChart K线图

### Import

```tsx
import { CandlestickChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { CandlestickChart } from '@/components/x-pro';
import { useT } from '@/i18n';

function MyKLine() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  return (
    <CandlestickChart
      data={[
        { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
        { date: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
        { date: '2024-01-03', open: 112, high: 118, low: 108, close: 98 },
      ]}
      upColor={fp.success}
      downColor={fp.error}
      margin={{ top: 20, right: 30, bottom: 30, left: 50 }}
    />
  );
}
```

### 数据格式

`data` 为 `CandlestickDataPoint[]` 数组，每项包含：
- `date`：日期字符串（ISO 格式，如 `'2024-01-01'`）
- `open`：开盘价
- `high`：最高价
- `low`：最低价
- `close`：收盘价

当 `close >= open` 时使用 upColor 渲染（阳线），否则使用 downColor（阴线）。

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `data` | `CandlestickDataPoint[]` | 是 | — | OHLC 数据数组 |
| `data[].date` | `string` | 是 | — | 日期（ISO 格式） |
| `data[].open` | `number` | 是 | — | 开盘价 |
| `data[].high` | `number` | 是 | — | 最高价 |
| `data[].low` | `number` | 是 | — | 最低价 |
| `data[].close` | `number` | 是 | — | 收盘价 |
| `upColor` | `string` | 否 | `fp.success` | 阳线颜色 |
| `downColor` | `string` | 否 | `fp.error` | 阴线颜色 |
| `width` | `number` | 否 | 自适应 | 图表宽度（px） |
| `height` | `number` | 否 | 自适应 | 图表高度（px） |
| `margin` | `{ top?: number; right?: number; bottom?: number; left?: number }` | 否 | 内置默认 | 图表内边距 |

### Foundation 约束

- 涨跌颜色默认从 `fp.success` / `fp.error` 取，可通过 props 覆盖
- 日期轴标签自动格式化，无需手动处理

---

## SankeyChart 桑基图

### Import

```tsx
import { SankeyChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { SankeyChart } from '@/components/x-pro';
import { useT } from '@/i18n';

function MySankey() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  return (
    <SankeyChart
      nodes={[
        { id: 'source', label: t('sankey.source'), color: fp.primary },
        { id: 'process', label: t('sankey.process') },
        { id: 'output', label: t('sankey.output') },
      ]}
      links={[
        { source: 'source', target: 'process', value: 100 },
        { source: 'process', target: 'output', value: 80 },
      ]}
      nodeWidth={20}
      nodePadding={10}
    />
  );
}
```

### 数据格式

- `nodes`：节点数组，每个节点必须有唯一 `id` 和显示用 `label`
- `links`：连接数组，`source` / `target` 为节点 id，`value` 决定流量宽度
- 布局算法自动计算节点位置和连接曲线

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `nodes` | `{ id: string; label: string; color?: string }[]` | 是 | — | 节点数组 |
| `links` | `{ source: string; target: string; value: number }[]` | 是 | — | 连接数组 |
| `nodeWidth` | `number` | 否 | `20` | 节点矩形宽度（px） |
| `nodePadding` | `number` | 否 | `10` | 节点垂直间距（px） |
| `width` | `number` | 否 | 自适应 | 图表宽度（px） |
| `height` | `number` | 否 | 自适应 | 图表高度（px） |

### Foundation 约束

- node.label 必须走 `t('key')`
- 不传 color 时节点按 fp 调色板顺序取色
- 连接线颜色跟随 source 节点颜色，透明度降低

---

## GanttChart 甘特图

### Import

```tsx
import { GanttChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { GanttChart } from '@/components/x-pro';
import { useT } from '@/i18n';

function MyGantt() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  return (
    <GanttChart
      tasks={[
        { id: '1', label: t('task.design'), start: '2024-01-01', end: '2024-01-15', progress: 100, color: fp.primary },
        { id: '2', label: t('task.dev'), start: '2024-01-10', end: '2024-02-01', progress: 60, dependencies: ['1'] },
        { id: '3', label: t('task.test'), start: '2024-01-25', end: '2024-02-10', progress: 0, dependencies: ['2'] },
      ]}
      viewMode="week"
      onTaskClick={(task) => console.log(task.id)}
    />
  );
}
```

### 数据格式

`tasks` 为 `GanttTask[]` 数组，每项包含：
- `id`：唯一标识符
- `label`：任务名称（必须走 `t()`）
- `start` / `end`：ISO 日期字符串，定义任务时间范围
- `progress`：可选，完成百分比（0-100），渲染为条内填充
- `dependencies`：可选，依赖的任务 id 数组，渲染为箭头连线
- `color`：可选，任务条颜色

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `tasks` | `GanttTask[]` | 是 | — | 任务列表 |
| `tasks[].id` | `string` | 是 | — | 任务唯一标识 |
| `tasks[].label` | `string` | 是 | — | 任务名称 |
| `tasks[].start` | `string` | 是 | — | 开始日期（ISO 格式） |
| `tasks[].end` | `string` | 是 | — | 结束日期（ISO 格式） |
| `tasks[].progress` | `number` | 否 | `0` | 完成百分比（0-100） |
| `tasks[].dependencies` | `string[]` | 否 | `[]` | 依赖任务 ID 数组 |
| `tasks[].color` | `string` | 否 | fp 调色板 | 任务条颜色 |
| `viewMode` | `'day' \| 'week' \| 'month'` | 否 | `'week'` | 时间轴粒度 |
| `width` | `number` | 否 | 自适应 | 图表宽度（px） |
| `height` | `number` | 否 | 自适应 | 图表高度（px） |
| `onTaskClick` | `(task: GanttTask) => void` | 否 | — | 任务点击回调 |

### Foundation 约束

- task.label 必须走 `t('key')`
- dependencies 渲染为从依赖任务末端到当前任务起始的箭头连线
- 不传 color 时按 fp 调色板顺序分配

---

## TreemapChart 树状图

### Import

```tsx
import { TreemapChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { TreemapChart } from '@/components/x-pro';
import { useT } from '@/i18n';

function MyTreemap() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  return (
    <TreemapChart
      data={{
        label: t('treemap.root'),
        children: [
          { label: t('treemap.categoryA'), value: 100 },
          {
            label: t('treemap.categoryB'),
            children: [
              { label: t('treemap.b1'), value: 80 },
              { label: t('treemap.b2'), value: 120 },
            ],
          },
          { label: t('treemap.categoryC'), value: 60 },
        ],
      }}
      colorMap={[fp.primary, fp.secondary, fp.tertiary]}
      onNodeClick={(node) => console.log(node.label)}
    />
  );
}
```

### 数据格式

`data` 为递归的 `TreemapNode` 结构：
- `label`：节点名称（必须走 `t()`）
- `value`：可选，叶子节点的数值（决定面积占比）
- `children`：可选，子节点数组（有 children 时 value 由子节点累加）
- `color`：可选，节点颜色

根节点不渲染为矩形，仅作为数据容器。面积按 squarified treemap 算法分配。

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `data` | `TreemapNode` | 是 | — | 树形层级数据（根节点） |
| `data.label` | `string` | 是 | — | 节点名称 |
| `data.value` | `number` | 否 | 子节点累加 | 叶子节点数值 |
| `data.children` | `TreemapNode[]` | 否 | — | 子节点数组 |
| `data.color` | `string` | 否 | colorMap 分配 | 节点颜色 |
| `colorMap` | `string[]` | 否 | fp 调色板 | 颜色数组（按层级/索引分配） |
| `width` | `number` | 否 | 自适应 | 图表宽度（px） |
| `height` | `number` | 否 | 自适应 | 图表高度（px） |
| `onNodeClick` | `(node: TreemapNode) => void` | 否 | — | 节点点击回调 |

### Foundation 约束

- node.label 必须走 `t('key')`
- 不传 colorMap 时从 fp 调色板取色
- 支持多层嵌套，点击可用于实现下钻交互

---

## ZoomableChart 缩放平移包装器

### Import

```tsx
import { ZoomableChart } from '@/components/x-pro';
```

### 基础用法

```tsx
import { useTheme } from '@mui/material/styles';
import { ZoomableChart } from '@/components/x-pro';
import { LineChart } from '@mui/x-charts/LineChart';
import { useT } from '@/i18n';

function MyZoomableChart() {
  const theme = useTheme();
  const { t } = useT();
  const fp = theme.palette.foundation;

  return (
    <ZoomableChart
      enableZoom
      enablePan
      minZoom={0.5}
      maxZoom={5}
      onZoomChange={(zoom) => console.log('zoom:', zoom)}
    >
      <LineChart
        series={[{ data: [1, 3, 2, 5, 4], label: t('chart.series1'), color: fp.primary }]}
        xAxis={[{ data: [1, 2, 3, 4, 5] }]}
        height={300}
      />
    </ZoomableChart>
  );
}
```

### 数据格式

ZoomableChart 本身不接收数据，它是一个包装器组件。将任何子组件（包括 MUI X Charts 免费版图表或其他自实现图表）作为 children 传入即可添加缩放平移功能。

### Props 完整参考表

| Prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `children` | `ReactNode` | 是 | — | 被包装的图表组件 |
| `enableZoom` | `boolean` | 否 | `true` | 是否启用滚轮缩放 |
| `enablePan` | `boolean` | 否 | `true` | 是否启用拖拽平移 |
| `minZoom` | `number` | 否 | `0.5` | 最小缩放倍数 |
| `maxZoom` | `number` | 否 | `5` | 最大缩放倍数 |
| `onZoomChange` | `(zoom: number) => void` | 否 | — | 缩放级别变化回调 |

### Foundation 约束

- 可包装任何图表组件（MUI X Charts 免费版 + 自实现 x-pro 图表）
- 缩放通过 CSS transform 实现，不影响子组件内部渲染逻辑
- 双击重置缩放到 1x

---

## Foundation 约束（全局）

以下规则适用于所有高级图表组件：

| 规则 | 说明 |
|------|------|
| Import 路径 | 统一从 `@/components/x-pro` 导入 |
| 禁止付费包 | 禁止 `@mui/x-charts-pro` / `@mui/x-charts-premium` / `@mui/x-data-grid-pro` / `@mui/x-data-grid-premium` |
| 配色 | 从 `theme.palette.foundation.*` 取色，禁止硬编码十六进制 |
| 图标 | 使用 `@mui/icons-material` 的 `*Rounded` 系列 |
| 文案 | 所有人类可见字符串走 `t('key')`，禁止硬编码 |
| 样式 | 走 styles.ts 工厂函数，禁止内联 sx 超过 3 个属性 |
| 数据流 | 数据操作通过 ViewModel → services 层，View 不直接处理业务逻辑 |
| 响应式 | 不传 width/height 时通过 ResizeObserver 自适应父容器 |
| 渲染方式 | 纯 SVG 实现，不依赖 canvas 或第三方图表库（d3、echarts 等） |
| 圆角 | 图表容器圆角 8px，按钮圆角 12px（匹配方圆设计语言） |
