import { useMemo, useState, type MouseEvent } from 'react';
import {
  ChartTooltip,
  FunnelChart as MantineFunnelChart,
  type FunnelChartCell,
} from '@mantine/charts';
import { getThemeColor, useMantineTheme } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useChartColors, useChartsI18n } from '../shared';
import classes from './FunnelChart.module.css';

export interface FunnelDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  data: FunnelDataItem[];
  /**
   * 'vertical'（默认）：自上而下收窄，底层 @mantine/charts FunnelChart（Recharts Funnel）。
   * 'horizontal'：自左向右收窄，纯 SVG 自绘（Recharts Funnel 不支持横向），
   * 配色 / 描边 / Tooltip（同一个 Mantine ChartTooltip）/ 标签与纵向保持一致。
   */
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  /** 在每层内部显示数值（经 valueFormatter 格式化），默认 false */
  withLabels?: boolean;
  /** Tooltip 与标签的数值格式化 */
  valueFormatter?: (value: number) => string;
  /** 图表容器的无障碍名称；缺省 `xproCharts.funnel.ariaLabel` */
  ariaLabel?: string;
}

// 漏斗图：纵向为 @mantine/charts FunnelChart 的薄封装，横向为 SVG 自绘。
// 数据按 value 降序排列；未指定 color 的层取主题系列色。
export function FunnelChart({
  data,
  orientation = 'vertical',
  width,
  height,
  withLabels = false,
  valueFormatter,
  ariaLabel,
}: FunnelChartProps) {
  const colors = useChartColors();
  const { t } = useChartsI18n();

  const cells = useMemo<FunnelChartCell[]>(
    () =>
      [...data]
        .sort((a, b) => b.value - a.value)
        .map((item, i) => ({
          key: item.label,
          name: item.label,
          value: item.value,
          color: item.color ?? colors[i % colors.length]!,
        })),
    [data, colors],
  );

  const label = ariaLabel ?? t('xproCharts.funnel.ariaLabel');
  const h = height ?? 300;

  if (cells.length === 0) {
    return (
      <div
        className={classes.empty}
        style={{ width: width ?? '100%', height: h }}
        role="figure"
        aria-label={label}
      >
        {t('xproCharts.noData')}
      </div>
    );
  }

  if (orientation === 'horizontal') {
    return (
      <HorizontalFunnel
        cells={cells}
        width={width}
        height={h}
        withLabels={withLabels}
        valueFormatter={valueFormatter}
        ariaLabel={label}
      />
    );
  }

  return (
    <MantineFunnelChart
      data={cells}
      role="figure"
      aria-label={label}
      strokeColor={FOUNDATION_CSS_VARS.bg.surface}
      tooltipDataSource="segment"
      withLabels={withLabels}
      labelsPosition="inside"
      valueFormatter={valueFormatter}
      // 原生 size 同时控制宽高（正方形），这里用内联样式覆盖为独立宽高
      style={{
        width: width ?? '100%',
        height: h,
        minWidth: 0,
        minHeight: 0,
      }}
    />
  );
}

// ---------- 横向漏斗（SVG 自绘） ----------
// 几何与 Recharts Funnel 一致（转置）：第 i 层左边高度 ∝ value[i]，右边高度 ∝ value[i+1]，
// 最后一层收成三角形（Recharts 默认 lastShapeType='triangle'）；各层沿 X 轴等宽，沿 Y 轴居中。

interface HorizontalFunnelProps {
  cells: FunnelChartCell[];
  width: number | undefined;
  height: number;
  withLabels: boolean;
  valueFormatter: ((value: number) => string) | undefined;
  ariaLabel: string;
}

interface HoverState {
  index: number;
  x: number;
  y: number;
}

const TOOLTIP_OFFSET = 12;
const TOOLTIP_FLIP_THRESHOLD = 180;
const STROKE_WIDTH = 1;
const LABEL_MIN_HEIGHT = 16;

function HorizontalFunnel({
  cells,
  width,
  height,
  withLabels,
  valueFormatter,
  ariaLabel,
}: HorizontalFunnelProps) {
  const theme = useMantineTheme();
  const { t } = useChartsI18n();
  const { ref, width: measuredWidth } = useElementSize();
  const [hover, setHover] = useState<HoverState | null>(null);

  const svgWidth = width ?? measuredWidth;
  const format = (v: number) => (valueFormatter ? valueFormatter(v) : String(v));

  const segments = useMemo(() => {
    const max = Math.max(...cells.map((c) => c.value), 0) || 1;
    const stepW = svgWidth / cells.length;
    const cy = height / 2;
    return cells.map((cell, i) => {
      const next = cells[i + 1];
      const hl = (Math.max(cell.value, 0) / max) * height;
      const hr = next ? (Math.max(next.value, 0) / max) * height : 0;
      const x0 = i * stepW;
      const x1 = x0 + stepW;
      const points = [
        `${x0},${cy - hl / 2}`,
        `${x1},${cy - hr / 2}`,
        `${x1},${cy + hr / 2}`,
        `${x0},${cy + hl / 2}`,
      ].join(' ');
      // 标签放在该层的"重心"附近：左高右低时略偏左，保证文字落在形状内
      const labelX = x0 + stepW * (next ? 0.5 : 0.33);
      const labelRoom = next ? (hl + hr) / 2 : hl * 0.66;
      return { cell, points, labelX, labelRoom, cx: x0 + stepW / 2 };
    });
  }, [cells, svgWidth, height]);

  const showAt = (index: number, e: MouseEvent<SVGPolygonElement>) => {
    const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!box) return;
    setHover({ index, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const showAtCenter = (index: number) => {
    const seg = segments[index];
    if (seg) setHover({ index, x: seg.cx, y: height / 2 });
  };

  const hovered = hover ? segments[hover.index] : undefined;
  const flip = hover !== null && hover.x > svgWidth - TOOLTIP_FLIP_THRESHOLD;

  return (
    <div
      ref={ref}
      className={classes.root}
      style={{ width: width ?? '100%', height }}
      role="figure"
      aria-label={ariaLabel}
      onMouseLeave={() => setHover(null)}
    >
      {svgWidth > 0 && (
        <svg width={svgWidth} height={height} className={classes.svg}>
          {segments.map(({ cell, points, labelX, labelRoom }, i) => (
            <g key={cell.key ?? `${cell.name}-${i}`}>
              <polygon
                points={points}
                className={classes.segment}
                style={{
                  fill: getThemeColor(cell.color, theme),
                  stroke: FOUNDATION_CSS_VARS.bg.surface,
                  strokeWidth: STROKE_WIDTH,
                }}
                tabIndex={0}
                aria-label={t('xproCharts.funnel.segmentAriaLabel', {
                  name: cell.name,
                  value: format(cell.value),
                })}
                onMouseEnter={(e) => showAt(i, e)}
                onMouseMove={(e) => showAt(i, e)}
                onFocus={() => showAtCenter(i)}
                onBlur={() => setHover(null)}
              />
              {withLabels && labelRoom >= LABEL_MIN_HEIGHT && (
                <text
                  x={labelX}
                  y={height / 2}
                  className={classes.label}
                  textAnchor="middle"
                  dominantBaseline="central"
                  aria-hidden
                >
                  {format(cell.value)}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}

      {hover && hovered && (
        <div
          className={classes.tooltip}
          style={{
            left: hover.x + (flip ? -TOOLTIP_OFFSET : TOOLTIP_OFFSET),
            top: hover.y + TOOLTIP_OFFSET,
            transform: flip ? 'translateX(-100%)' : undefined,
          }}
        >
          <ChartTooltip
            payload={cells}
            type="radial"
            segmentId={hover.index}
            valueFormatter={valueFormatter}
          />
        </div>
      )}
    </div>
  );
}
