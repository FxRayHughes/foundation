---
name: foundation-mui-x-charts
description: "@mui/x-charts v9.3 在 Foundation 项目中的详尽用法。社区版图表：Pie/Bar/Line/Scatter/Gauge/Sparkline + 项目自实现高级图表：Heatmap/Funnel/Radar/Candlestick/Sankey/Gantt/Treemap/Zoom。"
---

# Foundation MUI X Charts 用法指南

> 基于 `@mui/x-charts ^9.3.0`，适用于 Foundation 项目的图表开发规范。

## 概述

MUI X Charts 提供声明式 React 图表组件，支持 PieChart、BarChart、LineChart、ScatterChart、Gauge、SparkLineChart 六大类型，以及 Composition API 实现完全自定义组合。

此外，Foundation 项目自实现了高级图表组件（位于 `src/components/x-pro/charts/`），覆盖官方 Pro/Premium 付费图表类型。

## 何时使用本 Skill

- 需要在 Foundation 中添加任何数据可视化图表时
- 修改「设置→数据存储」页面的 PieChart / BarChart 时
- 需要了解 @mui/x-charts v9 的 API、Composition 模式、dataset prop 时
- 需要使用高级图表（Heatmap/Funnel/Radar/Candlestick/Sankey/Gantt/Treemap）时
- 为图表设置主题配色、响应式布局、无障碍属性时

## 支持的图表类型

### 社区版（@mui/x-charts）

| 类型 | 组件 | 适用场景 |
|------|------|----------|
| 饼图 | `PieChart` | 占比分布、分类构成 |
| 柱状图 | `BarChart` | 分组比较、排名、时序对比 |
| 折线图 | `LineChart` | 趋势、时间序列、面积堆叠 |
| 散点图 | `ScatterChart` | 相关性、分布密度 |
| 仪表盘 | `Gauge` / `GaugeContainer` | 单值指标、进度 |
| 迷你图 | `SparkLineChart` | 行内趋势、紧凑展示 |

### 自实现高级图表（@/components/x-pro）

**禁止**使用 `@mui/x-charts-pro` / `@mui/x-charts-premium` 官方付费包。

| 类型 | 组件 | 适用场景 |
|------|------|----------|
| 热力图 | `HeatmapChart` | 矩阵数据、时间×类别密度 |
| 漏斗图 | `FunnelChart` | 转化率、流程衰减 |
| 雷达图 | `RadarChart` | 多维对比、能力评估 |
| K线图 | `CandlestickChart` | 金融 OHLC 数据 |
| 桑基图 | `SankeyChart` | 流量分配、资源流向 |
| 甘特图 | `GanttChart` | 项目时间线、任务依赖 |
| 树状图 | `TreemapChart` | 层级占比、磁盘空间 |
| 缩放包装 | `ZoomableChart` | 为任何图表添加缩放平移 |

```tsx
// 高级图表统一 import
import { HeatmapChart, FunnelChart, RadarChart, CandlestickChart, SankeyChart, GanttChart, TreemapChart, ZoomableChart } from '@/components/x-pro';
```

## Foundation 铁律摘要

| # | 规则 | 要点 |
|---|------|------|
| 1 | 配色 | 只从 `theme.palette.foundation.*` 取，禁止硬编码 hex |
| 2 | 圆角 | 按钮 6 / 容器 8，图表条形 4-6，饼图弧角 2 |
| 3 | 图标 | 只用 `@mui/icons-material` 的 `*Rounded` 系列 |
| 4 | i18n | 所有人类可见字符串走 `t('key')` |
| 5 | 样式工厂 | 写在 `<Name>.styles.ts`，工厂函数返回 `Record<string, SxProps<Theme>>` |
| 6 | 对话框 | 简单确认走 NativeDialogs；复杂表单走 MUI Dialog |
| 7 | 调用链 | View → ViewModel → services/ → @bindings/ |
| 8 | 路由 | Foundation 自有路由，不用 react-router |

### 配色取值示例

```tsx
const theme = useTheme();
const fp = theme.palette.foundation;
const palette: string[] = [
  fp.accent,
  fp.status.success,
  fp.status.warning,
  fp.status.danger,
  fp.text.muted,
];
<PieChart colors={palette} ... />
```

### 样式工厂模式

```tsx
// Database.styles.ts
import type { SxProps, Theme } from '@mui/material';
export const chartStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    chartCard: { backgroundColor: fp.bg.surface, borderRadius: 2, p: 2 },
    chartHost: { width: '100%', height: 220 },
  };
};
```

## 项目真实用例

Foundation 的「设置 → 数据存储」页面已使用：

- **PieChart**（环形图）：展示各表占比，`innerRadius: 48` + `paddingAngle: 1` + `cornerRadius: 2`
- **BarChart**（横向条形图）：展示各表精确字节数，`layout="horizontal"`

配色统一从 `theme.palette.foundation.*` 取值，两张图共享同一组 palette 确保视觉一致。

## References 索引

| 文件 | 内容 |
|------|------|
| [references/pie-chart.md](./references/pie-chart.md) | PieChart 饼图 / 环形图 |
| [references/bar-chart.md](./references/bar-chart.md) | BarChart 柱状图 / 条形图 |
| [references/line-chart.md](./references/line-chart.md) | LineChart 折线图 / 面积图 |
| [references/scatter-chart.md](./references/scatter-chart.md) | ScatterChart 散点图 |
| [references/gauge.md](./references/gauge.md) | Gauge / GaugeContainer 仪表盘 |
| [references/sparkline.md](./references/sparkline.md) | SparkLineChart 迷你图 |
| [references/axis-legend-tooltip.md](./references/axis-legend-tooltip.md) | 坐标轴 / 图例 / 提示框通用配置 |
| [references/styling-composition.md](./references/styling-composition.md) | 样式定制 + Composition API |
| [references/pro-premium-charts.md](./references/pro-premium-charts.md) | **自实现高级图表**：Heatmap/Funnel/Radar/Candlestick/Sankey/Gantt/Treemap/ZoomableChart |

## 通用 Props 速查

所有图表组件共享的核心 props：

| Prop | 类型 | 说明 |
|------|------|------|
| `series` | `Array` | 数据系列配置（必填） |
| `width` / `height` | `number` | 尺寸（不传则响应式填充父容器） |
| `colors` | `string[]` | 调色板，按序分配给各系列 |
| `dataset` | `Array<object>` | 数据集（类似 DataGrid 的 rows） |
| `margin` | `{ top, right, bottom, left }` | 绘图区域外边距 |
| `hideLegend` | `boolean` | 隐藏图例 |
| `slotProps` | `object` | 自定义子组件 props（legend、tooltip 等） |
| `sx` | `SxProps` | MUI sx 样式覆盖 |
| `skipAnimation` | `boolean` | 跳过入场动画 |
| `onItemClick` | `(event, item) => void` | 数据项点击回调 |

## 反例

```tsx
// ❌ 硬编码颜色
<PieChart colors={['#FF6384', '#36A2EB']} />

// ✅ 从 theme 取色
<PieChart colors={[fp.accent, fp.status.success]} />

// ❌ 硬编码标签
series={[{ data: [{ label: '用户表' }] }]}

// ✅ 走 i18n
series={[{ data: [{ label: t('settings.database.tables.users') }] }]}

// ❌ 内联样式写容器
<div style={{ borderRadius: 8, background: '#1e1e2e' }}>

// ✅ styles.ts 工厂函数
<Box sx={styles.chartCard}>
```
