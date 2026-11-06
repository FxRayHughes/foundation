import { useState, useCallback, useRef, type ReactNode, type WheelEvent, type MouseEvent } from 'react';
import { AreaChart, LineChart } from '@mantine/charts';
import type { AreaChartSeries } from '@mantine/charts';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useChartColors, useChartsI18n } from '../shared';
import classes from './ZoomableChart.module.css';

interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface ZoomableSeries {
  name: string;
  label?: string;
  color?: string;
}

export interface ZoomableChartProps {
  /**
   * 模式一（兼容旧版）：包裹任意子内容，提供滚轮缩放 + 拖拽平移（CSS transform）。
   * 传入 data/dataKey/series 时忽略 children。
   */
  children?: ReactNode;
  enableZoom?: boolean;
  enablePan?: boolean;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange?: (zoom: number) => void;

  /**
   * 模式二：@mantine/charts LineChart / AreaChart + 内置 Brush（区间选择器）实现 X 轴缩放。
   */
  data?: Record<string, unknown>[];
  dataKey?: string;
  series?: ZoomableSeries[];
  type?: 'line' | 'area';
  width?: number;
  height?: number;
  /** Brush 初始区间（数据下标） */
  startIndex?: number;
  endIndex?: number;
  /** Brush 区间变化回调（数据下标） */
  onRangeChange?: (range: { startIndex: number; endIndex: number }) => void;
  /** 图表容器的无障碍名称；缺省 `xproCharts.zoomable.ariaLabel` / `transformAriaLabel` */
  ariaLabel?: string;
}

export function ZoomableChart(props: ZoomableChartProps) {
  const { data, dataKey, series } = props;
  if (data && dataKey && series) {
    return <BrushChart {...props} data={data} dataKey={dataKey} series={series} />;
  }
  return <TransformZoom {...props} />;
}

// ---------- 模式二：Brush 缩放 ----------

function BrushChart({
  data,
  dataKey,
  series,
  type = 'line',
  width,
  height,
  startIndex,
  endIndex,
  onRangeChange,
  ariaLabel,
}: ZoomableChartProps & Required<Pick<ZoomableChartProps, 'data' | 'dataKey' | 'series'>>) {
  const { t } = useChartsI18n();
  const colors = useChartColors(series.length);
  const chartSeries: AreaChartSeries[] = series.map((s, i) => ({
    name: s.name,
    color: s.color ?? colors[i]!,
    ...(s.label !== undefined ? { label: s.label } : {}),
  }));

  const common = {
    role: 'figure',
    'aria-label': ariaLabel ?? t('xproCharts.zoomable.ariaLabel'),
    w: width ?? '100%',
    h: height ?? 300,
    data,
    dataKey,
    series: chartSeries,
    gridColor: FOUNDATION_CSS_VARS.divider,
    textColor: FOUNDATION_CSS_VARS.text.secondary,
    withBrush: true,
    brushProps: {
      ...(startIndex !== undefined ? { startIndex } : {}),
      ...(endIndex !== undefined ? { endIndex } : {}),
      ...(onRangeChange ? { onChange: onRangeChange } : {}),
    },
  };

  return type === 'area' ? <AreaChart {...common} /> : <LineChart {...common} />;
}

// ---------- 模式一：CSS transform 缩放 / 平移 ----------

function TransformZoom({
  children,
  enableZoom = true,
  enablePan = true,
  minZoom = 0.5,
  maxZoom = 5,
  onZoomChange,
  ariaLabel,
}: ZoomableChartProps) {
  const { t } = useChartsI18n();
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const clampScale = useCallback(
    (s: number) => Math.min(maxZoom, Math.max(minZoom, s)),
    [minZoom, maxZoom],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (!enableZoom) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => {
        const newScale = clampScale(prev.scale * delta);
        onZoomChange?.(newScale);
        return { ...prev, scale: newScale };
      });
    },
    [enableZoom, clampScale, onZoomChange],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enablePan) return;
      setPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrigin.current = { x: zoom.translateX, y: zoom.translateY };
    },
    [enablePan, zoom.translateX, zoom.translateY],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!panning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setZoom((prev) => ({
        ...prev,
        translateX: panOrigin.current.x + dx,
        translateY: panOrigin.current.y + dy,
      }));
    },
    [panning],
  );

  const handleMouseUp = useCallback(() => setPanning(false), []);

  const transform = `scale(${zoom.scale}) translate(${zoom.translateX / zoom.scale}px, ${zoom.translateY / zoom.scale}px)`;

  return (
    <div
      className={classes.viewport}
      role="figure"
      aria-label={ariaLabel ?? t('xproCharts.zoomable.transformAriaLabel')}
      data-pan={enablePan || undefined}
      data-panning={panning || undefined}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={classes.content} style={{ transform }}>
        {children}
      </div>
    </div>
  );
}
