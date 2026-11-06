import {
  CandlestickChart as MantineCandlestickChart,
  type CandlestickChartLabels,
} from '@mantine/charts';
import { useMemo } from 'react';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useChartsI18n } from '../shared';
import type { ChartMargin } from '../shared';

export interface CandlestickDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  upColor?: string;
  downColor?: string;
  width?: number;
  height?: number;
  /** 透传给 Recharts ComposedChart 的 margin（坐标轴由底层绘制，默认不需要设置） */
  margin?: ChartMargin;
  /**
   * Tooltip 中 open/high/low/close 的文案。
   * 缺省取 x-pro 图表语言包 `xproCharts.candlestick.*`（随当前语言切换）；传入的字段逐项覆盖默认值。
   */
  labels?: Partial<CandlestickChartLabels>;
  /** 图表容器的无障碍名称；缺省 `xproCharts.candlestick.ariaLabel` */
  ariaLabel?: string;
}

// K 线图：@mantine/charts CandlestickChart 的薄封装。
// 涨 / 跌默认色取主题 success / danger。
export function CandlestickChart({
  data,
  upColor,
  downColor,
  width,
  height,
  margin,
  labels,
  ariaLabel,
}: CandlestickChartProps) {
  const { t } = useChartsI18n();
  const resolvedLabels = useMemo<CandlestickChartLabels>(
    () => ({
      open: labels?.open ?? t('xproCharts.candlestick.open'),
      high: labels?.high ?? t('xproCharts.candlestick.high'),
      low: labels?.low ?? t('xproCharts.candlestick.low'),
      close: labels?.close ?? t('xproCharts.candlestick.close'),
    }),
    [labels?.open, labels?.high, labels?.low, labels?.close, t],
  );

  return (
    <MantineCandlestickChart
      role="figure"
      aria-label={ariaLabel ?? t('xproCharts.candlestick.ariaLabel')}
      w={width ?? '100%'}
      h={height ?? 300}
      data={data}
      dataKey="date"
      upColor={upColor ?? FOUNDATION_CSS_VARS.status.success}
      downColor={downColor ?? FOUNDATION_CSS_VARS.status.danger}
      gridColor={FOUNDATION_CSS_VARS.divider}
      textColor={FOUNDATION_CSS_VARS.text.muted}
      strokeDasharray="2 2"
      gridAxis="y"
      labels={resolvedLabels}
      valueFormatter={(v) => v.toFixed(2)}
      composedChartProps={margin ? { margin } : undefined}
    />
  );
}
