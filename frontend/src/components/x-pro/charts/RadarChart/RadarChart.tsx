import { useMemo } from 'react';
import { RadarChart as MantineRadarChart, type RadarChartSeries } from '@mantine/charts';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useChartColors, useChartsI18n } from '../shared';

export interface RadarSeries {
  label: string;
  data: number[];
  color?: string;
}

export interface RadarChartProps {
  axes: string[];
  series: RadarSeries[];
  max?: number;
  fillOpacity?: number;
  width?: number;
  height?: number;
  levels?: number;
  /** 图表容器的无障碍名称；缺省 `xproCharts.radar.ariaLabel` */
  ariaLabel?: string;
}

const AXIS_KEY = '__axis';

// 雷达图：@mantine/charts RadarChart 的薄封装。
// 原 { axes, series[].data[] } 结构 → Recharts 行式数据 [{ __axis, [series.label]: value }]。
export function RadarChart({
  axes,
  series,
  max,
  fillOpacity = 0.25,
  width,
  height,
  levels = 5,
  ariaLabel,
}: RadarChartProps) {
  const { t } = useChartsI18n();
  const colors = useChartColors(series.length);

  const data = useMemo(
    () =>
      axes.map((axis, ai) => {
        const row: Record<string, string | number> = { [AXIS_KEY]: axis };
        for (const s of series) row[s.label] = s.data[ai] ?? 0;
        return row;
      }),
    [axes, series],
  );

  const mantineSeries = useMemo<RadarChartSeries[]>(
    () =>
      series.map((s, i) => ({
        name: s.label,
        color: s.color ?? colors[i]!,
        opacity: fillOpacity,
      })),
    [series, colors, fillOpacity],
  );

  const maxVal = max ?? Math.max(...series.flatMap((s) => s.data), 1);

  return (
    <MantineRadarChart
      role="figure"
      aria-label={ariaLabel ?? t('xproCharts.radar.ariaLabel')}
      w={width ?? '100%'}
      h={height ?? 300}
      data={data}
      dataKey={AXIS_KEY}
      series={mantineSeries}
      gridColor={FOUNDATION_CSS_VARS.divider}
      textColor={FOUNDATION_CSS_VARS.text.secondary}
      withLegend
      withTooltip
      withDots
      dotProps={{ r: 4, strokeWidth: 2, stroke: FOUNDATION_CSS_VARS.bg.surface }}
      // 半径轴只用来固定量程与网格层数，不显示刻度
      withPolarRadiusAxis
      polarRadiusAxisProps={{
        domain: [0, maxVal],
        tickCount: levels + 1,
        tick: false,
        axisLine: false,
      }}
      radarProps={{ strokeWidth: 2 }}
    />
  );
}
