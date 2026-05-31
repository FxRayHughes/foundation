import { useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { useChartDimensions, useChartColors } from '../shared/hooks';
import type { ChartMargin } from '../shared/types';

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
  viewMode?: 'day' | 'week' | 'month';
  width?: number;
  height?: number;
  onTaskClick?: (task: GanttTask) => void;
}

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

function generateTicks(min: number, max: number, viewMode: 'day' | 'week' | 'month'): { time: number; label: string }[] {
  const ticks: { time: number; label: string }[] = [];
  const start = new Date(min);

  if (viewMode === 'day') {
    start.setHours(0, 0, 0, 0);
    const cursor = new Date(start);
    while (cursor.getTime() <= max) {
      ticks.push({ time: cursor.getTime(), label: `${cursor.getMonth() + 1}/${cursor.getDate()}` });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (viewMode === 'week') {
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    const cursor = new Date(start);
    while (cursor.getTime() <= max) {
      ticks.push({ time: cursor.getTime(), label: `${cursor.getMonth() + 1}/${cursor.getDate()}` });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const cursor = new Date(start);
    while (cursor.getTime() <= max) {
      ticks.push({ time: cursor.getTime(), label: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}` });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }
  return ticks;
}

function GanttChart({ tasks, viewMode = 'day', width, height, onTaskClick }: GanttChartProps) {
  const theme = useTheme();
  const palette = (theme.palette as any).foundation;
  const getColor = useChartColors();

  const computedHeight = height ?? Math.max(200, HEADER_HEIGHT + tasks.length * (ROW_HEIGHT + ROW_GAP) + 16);
  const { ref, dimensions } = useChartDimensions(width, computedHeight, MARGIN);

  const { min, max } = useMemo(() => getTimeRange(tasks), [tasks]);
  const ticks = useMemo(() => generateTicks(min, max, viewMode), [min, max, viewMode]);

  const chartLeft = LABEL_WIDTH;
  const chartWidth = dimensions.innerWidth - LABEL_WIDTH;

  const xScale = useCallback(
    (time: number) => chartLeft + ((time - min) / (max - min)) * chartWidth,
    [min, max, chartLeft, chartWidth]
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [tasks]);

  const getTaskY = (index: number) => HEADER_HEIGHT + index * (ROW_HEIGHT + ROW_GAP);

  return (
    <div ref={ref} style={{ width: width ?? '100%', height: computedHeight, overflow: 'hidden' }}>
      <svg
        width={dimensions.width}
        height={computedHeight}
        style={{ display: 'block', userSelect: 'none' }}
      >
        {/* Header background */}
        <rect
          x={0} y={0}
          width={dimensions.width}
          height={HEADER_HEIGHT}
          fill={palette?.bg?.surface ?? '#f5f5f5'}
        />

        {/* Grid lines and tick labels */}
        {ticks.map((tick) => {
          const x = xScale(tick.time);
          if (x < chartLeft || x > dimensions.width - MARGIN.right) return null;
          return (
            <g key={tick.time}>
              <line
                x1={x} y1={HEADER_HEIGHT}
                x2={x} y2={computedHeight}
                stroke={palette?.divider ?? '#e0e0e0'}
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <text
                x={x} y={HEADER_HEIGHT - 10}
                textAnchor="middle"
                fontSize={11}
                fill={palette?.text?.secondary ?? '#666'}
              >
                {tick.label}
              </text>
            </g>
          );
        })}

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
              <g key={`${depId}-${task.id}`}>
                <path
                  d={`M${fromX},${fromY} C${midX},${fromY} ${midX},${toY} ${toX},${toY}`}
                  fill="none"
                  stroke={palette?.text?.muted ?? '#999'}
                  strokeWidth={1.5}
                  markerEnd="url(#gantt-arrow)"
                />
              </g>
            );
          })
        )}

        {/* Arrow marker definition */}
        <defs>
          <marker id="gantt-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={palette?.text?.muted ?? '#999'} />
          </marker>
        </defs>

        {/* Task bars */}
        {tasks.map((task, index) => {
          const startX = xScale(new Date(task.start).getTime());
          const endX = xScale(new Date(task.end).getTime());
          const y = getTaskY(index);
          const barWidth = Math.max(endX - startX, 2);
          const barColor = task.color ?? getColor(index);
          const progress = task.progress ?? 0;

          return (
            <g
              key={task.id}
              style={{ cursor: onTaskClick ? 'pointer' : 'default' }}
              onClick={() => onTaskClick?.(task)}
            >
              {/* Label */}
              <text
                x={8} y={y + ROW_HEIGHT / 2 + 4}
                fontSize={12}
                fill={palette?.text?.primary ?? '#333'}
              >
                {task.label.length > 14 ? task.label.slice(0, 13) + '…' : task.label}
              </text>

              {/* Background bar */}
              <rect
                x={startX} y={y + 4}
                width={barWidth} height={ROW_HEIGHT - 8}
                rx={4} ry={4}
                fill={barColor}
                opacity={0.3}
              />

              {/* Progress bar */}
              {progress > 0 && (
                <rect
                  x={startX} y={y + 4}
                  width={barWidth * Math.min(progress, 1)} height={ROW_HEIGHT - 8}
                  rx={4} ry={4}
                  fill={barColor}
                  opacity={0.85}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export { GanttChart };
export type { GanttChartProps };
