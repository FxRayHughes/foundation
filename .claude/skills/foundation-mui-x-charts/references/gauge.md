# Gauge / GaugeContainer 仪表盘

## Import

```tsx
// 简单用法（推荐）
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

// Composition API（自定义指针、文本等）
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from '@mui/x-charts/Gauge';
```

## 基础用法（Foundation 模式完整示例）

```tsx
import { Box, useTheme } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { useT } from '@/i18n';
import { gaugeStyles } from './Gauge.styles';

export const ProgressGauge = () => {
  const theme = useTheme();
  const t = useT();
  const fp = theme.palette.foundation;
  const styles = gaugeStyles(theme);

  return (
    <Box sx={styles.chartCard}>
      <Gauge
        value={75}
        valueMin={0}
        valueMax={100}
        startAngle={-110}
        endAngle={110}
        width={200}
        height={200}
        text={({ value }) => `${value}%`}
        aria-label={t('gauge.cpuUsage')}
        sx={{
          [`& .${gaugeClasses.valueArc}`]: { fill: fp.accent },
          [`& .${gaugeClasses.referenceArc}`]: { fill: fp.bg.elevated },
          [`& .${gaugeClasses.valueText}`]: {
            fill: fp.text.primary,
            fontSize: 20,
          },
        }}
      />
    </Box>
  );
};
```

样式文件：

```tsx
// Gauge.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const gaugeStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    chartCard: {
      backgroundColor: fp.bg.surface,
      borderRadius: 2,
      p: 2,
      display: 'flex',
      justifyContent: 'center',
    },
  };
};
```

## 所有 Variants

### 全圆仪表盘

```tsx
<Gauge
  value={60}
  startAngle={0}
  endAngle={360}
  width={200}
  height={200}
  text={({ value }) => `${value}%`}
/>
```

### 半圆仪表盘

```tsx
<Gauge
  value={60}
  startAngle={-90}
  endAngle={90}
  width={200}
  height={120}
/>
```

### 默认弧形（-110 到 110）

```tsx
<Gauge value={75} width={200} height={200} />
```

### 自定义文本

```tsx
// 自定义格式
<Gauge
  value={75}
  text={({ value, valueMax }) => `${value}/${valueMax}`}
  width={200}
  height={200}
/>

// 隐藏文本
<Gauge value={60} text="" width={200} height={200} />
```

### 自定义弧形参数

```tsx
<Gauge
  value={60}
  innerRadius="70%"
  outerRadius="100%"
  cornerRadius={4}
  width={200}
  height={200}
/>
```

### GaugeContainer + 自定义指针（Composition API）

```tsx
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from '@mui/x-charts/Gauge';

function CustomPointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();
  if (valueAngle === null) return null;

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={fp.accent} />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke={fp.accent}
        strokeWidth={3}
      />
    </g>
  );
}

export const CustomGauge = () => (
  <GaugeContainer
    width={200}
    height={200}
    startAngle={-110}
    endAngle={110}
    value={30}
  >
    <GaugeReferenceArc />
    <GaugeValueArc />
    <CustomPointer />
  </GaugeContainer>
);
```

### useGaugeState Hook

在 GaugeContainer 内部使用，获取计算后的状态：

```tsx
const {
  value,        // 当前值
  valueMin,     // 最小值
  valueMax,     // 最大值
  startAngle,   // 起始角度（弧度）
  endAngle,     // 结束角度（弧度）
  valueAngle,   // 当前值对应角度（弧度）
  outerRadius,  // 外半径（像素）
  innerRadius,  // 内半径（像素）
  cx,           // 圆心 X（像素）
  cy,           // 圆心 Y（像素）
} = useGaugeState();
```

## Props 完整参考

### Gauge Props

| Prop | Type | Default | 说明 |
|------|------|---------|------|
| `value` | `number` | 必填 | 当前值 |
| `valueMin` | `number` | `0` | 最小值 |
| `valueMax` | `number` | `100` | 最大值 |
| `startAngle` | `number` | `-110` | 起始角度（度） |
| `endAngle` | `number` | `110` | 结束角度（度） |
| `innerRadius` | `number \| string` | `'80%'` | 内半径 |
| `outerRadius` | `number \| string` | `'100%'` | 外半径 |
| `cornerRadius` | `number` | `0` | 弧角圆角 |
| `cx` | `number \| string` | `'50%'` | 圆心 X |
| `cy` | `number \| string` | `'50%'` | 圆心 Y |
| `text` | `string \| ((params: { value, valueMin, valueMax }) => string)` | 显示 value | 中心文本 |
| `width` | `number` | 必填 | 宽度 |
| `height` | `number` | 必填 | 高度 |
| `sx` | `SxProps<Theme>` | - | 样式覆盖（用于自定义弧颜色） |
| `aria-label` | `string` | - | 无障碍标签 |
| `aria-labelledby` | `string` | - | 无障碍标签引用 |

### GaugeContainer Props

与 Gauge 相同的配置 props（value, valueMin, valueMax, startAngle, endAngle, innerRadius, outerRadius, cornerRadius, cx, cy, width, height），但不渲染默认弧和文本，需要手动组合子组件：

- `GaugeReferenceArc` — 背景参考弧
- `GaugeValueArc` — 值弧（填充部分）

### gaugeClasses（CSS 类名）

| 类名 | 说明 |
|------|------|
| `gaugeClasses.root` | 根 SVG 元素 |
| `gaugeClasses.valueArc` | 值弧（填充部分） |
| `gaugeClasses.referenceArc` | 背景参考弧 |
| `gaugeClasses.valueText` | 中心文本 |

## 颜色配置

通过 sx + gaugeClasses 自定义弧颜色：

```tsx
import { gaugeClasses } from '@mui/x-charts/Gauge';

<Gauge
  value={75}
  width={200}
  height={200}
  sx={{
    [`& .${gaugeClasses.valueArc}`]: { fill: fp.accent },
    [`& .${gaugeClasses.referenceArc}`]: { fill: fp.bg.elevated },
    [`& .${gaugeClasses.valueText}`]: {
      fill: fp.text.primary,
      fontSize: 20,
    },
  }}
/>
```

根据值动态着色：

```tsx
const getColor = (value: number) => {
  if (value >= 80) return fp.status.danger;
  if (value >= 60) return fp.status.warning;
  return fp.status.success;
};

<Gauge
  value={currentValue}
  sx={{
    [`& .${gaugeClasses.valueArc}`]: { fill: getColor(currentValue) },
  }}
/>
```

## 无障碍 (a11y)

Gauge 遵循 WAI-ARIA Meter 模式，自动设置 `role="meter"`：

```tsx
<Gauge
  value={75}
  aria-label={t('gauge.diskUsage')}
  // 自动添加: aria-valuenow={75}, aria-valuemin={0}, aria-valuemax={100}
  width={200}
  height={200}
/>
```

- **必须**提供 `aria-label` 或 `aria-labelledby`
- 文本内容应有意义（不仅仅是数字）

## Foundation 约束

> ⚠️ 以下为本项目特有约束，必须严格遵守：

1. **配色**：弧颜色通过 `sx` + `gaugeClasses` 从 `theme.palette.foundation.*` 取值，禁止硬编码 hex
2. **圆角**：外层容器 `borderRadius: 2`
3. **i18n**：`text` prop 和 `aria-label` 走 `t()`
4. **样式**：图表容器样式写在 `<Name>.styles.ts` 工厂函数
5. **尺寸**：Gauge 必须显式指定 width/height（不支持响应式）
6. **无障碍**：必须提供 `aria-label` 或 `aria-labelledby`
