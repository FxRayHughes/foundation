# PieChart 饼图 / 环形图

## Import

```tsx
// 默认导入（推荐）
import { PieChart } from '@mui/x-charts/PieChart';

// 命名导入 + CSS 类
import { PieChart, pieClasses } from '@mui/x-charts/PieChart';

// Composition API（高级自定义布局）
import { PiePlot, PieArcPlot, PieArcLabelPlot } from '@mui/x-charts/PieChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
```

## 基础用法（Foundation 模式完整示例）

```tsx
import { Box, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useT } from '@/i18n';
import { pieStyles } from './Pie.styles';

export const UsagePie = () => {
  const theme = useTheme();
  const t = useT();
  const styles = pieStyles(theme);

  const fp = theme.palette.foundation;
  const colors = [
    fp.accent,
    fp.status.success,
    fp.status.warning,
    fp.status.danger,
    fp.text.muted,
  ];

  const data = [
    { id: 'users', value: 1200, label: t('tables.users') },
    { id: 'orders', value: 800, label: t('tables.orders') },
    { id: 'logs', value: 2400, label: t('tables.logs') },
  ];

  return (
    <Box sx={styles.chartCard}>
      <PieChart
        series={[{
          data,
          innerRadius: 48,
          paddingAngle: 1,
          cornerRadius: 2,
          valueFormatter: (item) => `${item.value} ${t('common.records')}`,
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
// Pie.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const pieStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
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

## 数据格式

### series 数组

```tsx
series={[
  {
    // 必填
    data: PieValueType[],
    // 可选
    id?: string,
    innerRadius?: number,        // 内半径（0 = 实心饼，>0 = 环形）
    outerRadius?: number | string, // 外半径（像素或百分比 '80%'）
    paddingAngle?: number,         // 弧片间隔角度
    cornerRadius?: number,         // 弧片圆角
    startAngle?: number,           // 起始角度（度）
    endAngle?: number,             // 结束角度（度）
    cx?: number | string,          // 圆心 X
    cy?: number | string,          // 圆心 Y
    arcLabel?: 'value' | 'label' | 'formattedValue' | ((item) => string),
    arcLabelMinAngle?: number,     // 弧片角度小于此值时隐藏标签
    arcLabelRadius?: number | string, // 标签距圆心距离
    highlightScope?: { highlight: 'item' | 'series', fade: 'global' | 'series' | 'none' },
    faded?: { innerRadius?, outerRadius?, additionalRadius?, cornerRadius?, paddingAngle?, color? },
    valueFormatter?: (item: { value: number }) => string,
    color?: string,                // 整个系列的默认颜色
  }
]
```

### PieValueType（data 数组元素）

```tsx
interface PieValueType {
  id: string | number;   // 唯一标识
  value: number;         // 数值（决定弧片大小）
  label?: string;        // 图例 / tooltip 标签
  color?: string;        // 单项颜色覆盖
}
```

## 所有 Variants

### 实心饼图（Pie）

`innerRadius` 为 0 或不设置：

```tsx
<PieChart
  series={[{ data, cornerRadius: 2 }]}
  colors={colors}
  height={220}
/>
```

### 环形图（Donut）

设置 `innerRadius > 0`：

```tsx
<PieChart
  series={[{
    data,
    innerRadius: 48,
    outerRadius: 100,
    paddingAngle: 1,
    cornerRadius: 2,
  }]}
  height={220}
/>
```

### 半圆饼图（Semi-circle）

通过 `startAngle` / `endAngle` 控制：

```tsx
<PieChart
  series={[{
    data,
    startAngle: -90,
    endAngle: 90,
    innerRadius: 48,
  }]}
  height={200}
/>
```

### 带弧片标签（Arc Label）

```tsx
<PieChart
  series={[{
    data,
    arcLabel: (item) => `${item.value}%`,
    arcLabelMinAngle: 35,
    arcLabelRadius: '60%',
  }]}
  sx={{
    [`& .${pieClasses.arcLabel}`]: {
      fontWeight: 'bold',
      fill: fp.text.primary,
    },
  }}
  height={260}
/>
```

### 多层嵌套饼图

```tsx
<PieChart
  series={[
    { innerRadius: 0, outerRadius: 60, id: 'inner', data: categoryData },
    { innerRadius: 80, outerRadius: 110, id: 'outer', data: detailData },
  ]}
  height={300}
/>
```

### 高亮交互（Highlight + Fade）

```tsx
<PieChart
  series={[{
    data,
    highlightScope: { highlight: 'item', fade: 'global' },
    faded: {
      innerRadius: 30,
      additionalRadius: -30,
      color: fp.text.muted,
    },
  }]}
  height={220}
/>
```

## Props 完整参考

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `series` | `PieSeriesType[]` | 必填 | 数据系列配置数组 |
| `width` | `number` | 响应式 | 图表固定宽度（px） |
| `height` | `number` | 响应式 | 图表固定高度（px） |
| `colors` | `string[]` | MUI 默认调色板 | 自定义调色板，按序分配 |
| `margin` | `{ top?, right?, bottom?, left? }` | `auto` | 绘图区域外边距 |
| `hideLegend` | `boolean` | `false` | 隐藏图例 |
| `skipAnimation` | `boolean` | `false` | 跳过入场动画 |
| `onItemClick` | `(event, d: PieItemIdentifier) => void` | - | 弧片点击回调 |
| `slotProps` | `{ legend?, tooltip?, pieArc?, pieArcLabel? }` | - | 子组件 props 覆盖 |
| `slots` | `{ legend?, tooltip?, pieArc?, pieArcLabel? }` | - | 子组件替换 |
| `sx` | `SxProps<Theme>` | - | 根元素样式 |
| `loading` | `boolean` | `false` | 显示加载骨架 |
| `className` | `string` | - | 根元素 CSS 类名 |

### PieSeriesType Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `data` | `PieValueType[]` | 必填 | 数据项数组 |
| `id` | `string` | 自动生成 | 系列唯一标识 |
| `innerRadius` | `number` | `0` | 内半径（0=实心，>0=环形） |
| `outerRadius` | `number \| string` | `'80%'` | 外半径 |
| `paddingAngle` | `number` | `0` | 弧片间隔角度（度） |
| `cornerRadius` | `number` | `0` | 弧片圆角半径 |
| `startAngle` | `number` | `0` | 起始角度（度） |
| `endAngle` | `number` | `360` | 结束角度（度） |
| `cx` | `number \| string` | `'50%'` | 圆心 X 坐标 |
| `cy` | `number \| string` | `'50%'` | 圆心 Y 坐标 |
| `arcLabel` | `'value' \| 'label' \| 'formattedValue' \| ((item) => string)` | - | 弧片上显示的标签 |
| `arcLabelMinAngle` | `number` | `0` | 角度小于此值时隐藏标签 |
| `arcLabelRadius` | `number \| string` | - | 标签距圆心距离 |
| `highlightScope` | `{ highlight, fade }` | - | 高亮范围配置 |
| `faded` | `{ innerRadius?, outerRadius?, additionalRadius?, cornerRadius?, color? }` | - | 淡出时的样式 |
| `valueFormatter` | `(item: { value: number }) => string` | - | 数值格式化（tooltip + arcLabel） |
| `color` | `string` | 从 colors 取 | 系列默认颜色 |

### PieValueType（data 数组元素）

| 字段 | Type | 说明 |
|------|------|------|
| `id` | `string \| number` | 唯一标识 |
| `value` | `number` | 数值（决定弧片大小） |
| `label` | `string` | 图例 / tooltip 标签 |
| `color` | `string` | 单项颜色覆盖 |

## 响应式尺寸

不传 `width` / `height` 时，PieChart 自动填充父容器：

```tsx
<Box sx={{ width: '100%', height: 300 }}>
  <PieChart series={[{ data }]} />
</Box>
```

传固定值时为绝对尺寸：

```tsx
<PieChart series={[{ data }]} width={400} height={300} />
```

## 颜色配置

### 方式一：colors prop（调色板按序分配）

```tsx
const fp = theme.palette.foundation;
<PieChart
  colors={[fp.accent, fp.status.success, fp.status.warning]}
  series={[{ data }]}
/>
```

### 方式二：逐项 color（精确控制每个弧片）

```tsx
const data = tables.map((tb, idx) => ({
  id: tb.name,
  value: tb.sizeBytes,
  label: t(`tables.${tb.labelKey}`),
  color: palette[idx % palette.length],
}));
<PieChart series={[{ data }]} />
```

## 交互事件

### 点击事件

```tsx
<PieChart
  series={series}
  onItemClick={(event, d) => {
    // d: { type: 'pie', seriesId: string, dataIndex: number }
    handleSelect(d.dataIndex);
  }}
/>
```

## 无障碍 (a11y)

- PieChart 渲染为 SVG，自动添加 `role="img"`
- 通过 `slotProps.svg` 添加 `aria-label`：

```tsx
<PieChart
  series={[{ data }]}
  slotProps={{
    svg: { 'aria-label': t('charts.pie.ariaLabel') },
  }}
/>
```

- 确保 `label` 字段有意义的文本描述（走 i18n）
- 高对比度配色：避免相邻弧片颜色过于接近

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **配色**：`colors` prop 或逐项 `color` 必须从 `theme.palette.foundation.*` 取值，禁止硬编码 hex
2. **圆角**：外层容器 `borderRadius: 2`（MUI spacing = 8px），弧片 `cornerRadius: 2`
3. **i18n**：`label` 走 `t('key')`，`valueFormatter` 格式化数值时可拼接翻译单位
4. **样式**：图表 wrapper 的 sx 写在 `<Name>.styles.ts` 工厂函数中
5. **图例**：小图表用 `hideLegend`，大图表保留图例并通过 `slotProps.legend` 配置位置
6. **tooltip**：通过 `valueFormatter` 控制 tooltip 显示内容
7. **真实用例**：Foundation「设置→数据存储」页使用 `innerRadius: 48` + `paddingAngle: 1` + `cornerRadius: 2` 的环形图展示表占比
