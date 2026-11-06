import { useMemo, useCallback, useId } from 'react';
import { getThemeColor, useMantineTheme } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useChartColors, useChartsI18n } from '../shared';
import type { ChartMargin } from '../shared';
import classes from './GanttChart.module.css';

// 甘特图：@mantine/charts 无原生对应组件，保持纯 SVG 自绘。
// 固定色（表头 / 网格 / 文本 / 依赖箭头）走 GanttChart.module.css 的 var(--fd-*)；
// 任务条颜色来自 useChartColors（CSS 变量或 Mantine token），通过 style.fill 注入。

export interface GanttTask {
  id: string;
  label: string;
  start: string;
  end: string;
  progress?: number;
  dependencies?: string[];
  color?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  viewMode?: ViewMode;
  width?: number;
  height?: number;
  onTaskClick?: (task: GanttTask) => void;
  /** 图表容器的无障碍名称；缺省 `xproCharts.gantt.ariaLabel` */
  ariaLabel?: string;
}

// 相邻刻度标签的最小间距（px）；月视图标签（如 "Jan 2024" / "2024年1月"）更宽
const MIN_TICK_LABEL_GAP = { day: 44, week: 44, month: 72 } as const;
const ROW_HEIGHT = 36;
const ROW_GAP = 4;
const HEADER_HEIGHT = 40;
const LABEL_WIDTH = 120;

const MARGIN: ChartMargin = { top: 0, right: 16, bottom: 0, left: 0 };

function getTimeRange(tasks: GanttTask[]): { min: number; max: number } {
  if (tasks.length === 0) {
    const now = Date.now();
    return { min: now, max: now + 86400000 * 7 };
  }
  let min = Infinity;
  let max = -Infinity;
  for (const t of tasks) {
    const s = new Date(t.start).getTime();
    const e = new Date(t.end).getTime();
    if (s < min) min = s;
    if (e > max) max = e;
  }
  const padding = (max - min) * 0.05 || 86400000;
  return { min: min - padding, max: max + padding };
}

type ViewMode = 'day' | 'week' | 'month';

// 刻度 / 任务日期按当前语言格式化（Intl），避免写死 'M/D' / 'YYYY-MM'
function createTickFormatter(locale: string, viewMode: ViewMode): (d: Date) => string {
  const fmt = new Intl.DateTimeFormat(
    locale,
    viewMode === 'month' ? { year: 'numeric', month: 'short' } : { month: 'numeric', day: 'numeric' },
  );
  return (d) => fmt.format(d);
}

function generateTicks(
  min: number,
  max: number,
  viewMode: ViewMode,
  format: (d: Date) => string,
): { time: number; label: string }[] {
  const ticks: { time: number; label: string }[] = [];
  const start = new Date(min);

  if (viewMode === 'day') {
    start.setHours(0, 0, 0, 0);
    const cursor = new Date(start);
    while (cursor.getTime() <= max) {
      ticks.push({ time: cursor.getTime(), label: format(cursor) });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (viewMode === 'week') {
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    const cursor = new Date(start);
    while (cursor.getTime() <= max) {
      ticks.push({ time: cursor.getTime(), label: format(cursor) });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const cursor = new Date(start);
    while (cursor.getTime() <= max) {
      ticks.push({ time: cursor.getTime(), label: format(cursor) });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }
  return ticks;
}

function GanttChart({ tasks, viewMode = 'day', width, height, onTaskClick, ariaLabel }: GanttChartProps) {
  const { t, locale } = useChartsI18n();
  const theme = useMantineTheme();
  const colors = useChartColors();
  // useChartColors 可能返回 Mantine token（如 'violet.5'），自绘 SVG 需要解析成 CSS 变量
  const resolveColor = (color: string) => getThemeColor(color, theme);
  const getColor = (i: number) => resolveColor(colors[i % colors.length]!);
  const markerId = `gantt-arrow-${useId().replace(/:/g, '')}`;

  const computedHeight = height ?? Math.max(200, HEADER_HEIGHT + tasks.length * (ROW_HEIGHT + ROW_GAP) + 16);
  const { ref, width: measuredWidth } = useElementSize();
  const svgWidth = width ?? measuredWidth;
  const innerWidth = svgWidth - MARGIN.left - MARGIN.right;

  const { min, max } = useMemo(() => getTimeRange(tasks), [tasks]);
  const ticks = useMemo(
    () => generateTicks(min, max, viewMode, createTickFormatter(locale, viewMode)),
    [min, max, viewMode, locale],
  );
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale]);
  const describeTask = (task: GanttTask) => {
    const vars = {
      label: task.label,
      start: dateFormat.format(new Date(task.start)),
      end: dateFormat.format(new Date(task.end)),
    };
    return task.progress !== undefined
      ? t('xproCharts.gantt.taskWithProgress', { ...vars, progress: Math.round(Math.min(Math.max(task.progress, 0), 1) * 100) })
      : t('xproCharts.gantt.task', vars);
  };

  const chartLeft = LABEL_WIDTH;
  const chartWidth = innerWidth - LABEL_WIDTH;

  const xScale = useCallback(
    (time: number) => chartLeft + ((time - min) / (max - min)) * chartWidth,
    [min, max, chartLeft, chartWidth]
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [tasks]);

  // 刻度过密时抽稀标签（网格线保留）：保证相邻标签间距 ≥ MIN_TICK_LABEL_GAP px
  const labelStep = useMemo(() => {
    if (ticks.length < 2) return 1;
    const pxPerTick = chartWidth / ticks.length;
    return Math.max(1, Math.ceil(MIN_TICK_LABEL_GAP[viewMode] / Math.max(pxPerTick, 1)));
  }, [ticks.length, chartWidth, viewMode]);

  const getTaskY = (index: number) => HEADER_HEIGHT + index * (ROW_HEIGHT + ROW_GAP);

  return (
    <div
      ref={ref}
      className={classes.root}
      style={{ width: width ?? '100%', height: computedHeight }}
      role="figure"
      aria-label={ariaLabel ?? t('xproCharts.gantt.ariaLabel')}
    >
      {tasks.length === 0 && <div className={classes.empty}>{t('xproCharts.noData')}</div>}
      {svgWidth > 0 && tasks.length > 0 && (
        <svg width={svgWidth} height={computedHeight} className={classes.svg}>
          {/* Header background */}
          <rect x={0} y={0} width={svgWidth} height={HEADER_HEIGHT} className={classes.header} />

          {/* Grid lines and tick labels */}
          {ticks.map((tick, i) => {
            const x = xScale(tick.time);
            if (x < chartLeft || x > svgWidth - MARGIN.right) return null;
            return (
              <g key={tick.time}>
                <line
                  x1={x} y1={HEADER_HEIGHT}
                  x2={x} y2={computedHeight}
                  className={classes.gridLine}
                />
                {i % labelStep === 0 && (
                  <text x={x} y={HEADER_HEIGHT - 10} textAnchor="middle" className={classes.tickLabel}>
                    {tick.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className={classes.arrowHead} />
            </marker>
          </defs>

          {/* Dependency arrows */}
          {tasks.map((task) =>
            (task.dependencies ?? []).map((depId) => {
              const depIndex = taskMap.get(depId);
              const taskIndex = taskMap.get(task.id);
              if (depIndex === undefined || taskIndex === undefined) return null;
              const depTask = tasks[depIndex]!;
              const fromX = xScale(new Date(depTask.end).getTime());
              const fromY = getTaskY(depIndex) + ROW_HEIGHT / 2;
              const toX = xScale(new Date(task.start).getTime());
              const toY = getTaskY(taskIndex) + ROW_HEIGHT / 2;
              const midX = (fromX + toX) / 2;
              return (
                <path
                  key={`${depId}-${task.id}`}
                  d={`M${fromX},${fromY} C${midX},${fromY} ${midX},${toY} ${toX},${toY}`}
                  className={classes.dependency}
                  markerEnd={`url(#${markerId})`}
                />
              );
            })
          )}

          {/* Task bars */}
          {tasks.map((task, index) => {
            const startX = xScale(new Date(task.start).getTime());
            const endX = xScale(new Date(task.end).getTime());
            const y = getTaskY(index);
            const barWidth = Math.max(endX - startX, 2);
            const barColor = task.color ? resolveColor(task.color) : getColor(index);
            const progress = task.progress ?? 0;

            return (
              <g
                key={task.id}
                className={onTaskClick ? classes.taskClickable : undefined}
                onClick={() => onTaskClick?.(task)}
                aria-label={describeTask(task)}
              >
                {/* 悬停显示完整名称 + 起止日期（标签可能被截断） */}
                <title>{describeTask(task)}</title>
                {/* Label */}
                <text x={8} y={y + ROW_HEIGHT / 2 + 4} className={classes.taskLabel}>
                  {task.label.length > 14 ? task.label.slice(0, 13) + '…' : task.label}
                </text>

                {/* Background bar */}
                <rect
                  x={startX} y={y + 4}
                  width={barWidth} height={ROW_HEIGHT - 8}
                  rx={4} ry={4}
                  style={{ fill: barColor }}
                  opacity={0.3}
                />

                {/* Progress bar */}
                {progress > 0 && (
                  <rect
                    x={startX} y={y + 4}
                    width={barWidth * Math.min(progress, 1)} height={ROW_HEIGHT - 8}
                    rx={4} ry={4}
                    style={{ fill: barColor }}
                    opacity={0.85}
                  />
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export { GanttChart };
export type { GanttChartProps };
