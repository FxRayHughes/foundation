import { useMemo } from 'react';
import { MatrixChart, type MatrixChartCell } from '@mantine/charts';
import { useElementSize } from '@mantine/hooks';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useChartsI18n } from '../shared';
import classes from './HeatmapChart.module.css';

export interface HeatmapChartProps {
  data: number[][];
  xLabels?: string[];
  yLabels?: string[];
  /** 颜色区间（任意 CSS 颜色或 var(--fd-*)），中间色由 color-mix 插值 */
  colorMap?: { min: string; max: string };
  width?: number;
  height?: number;
  tooltip?: boolean;
  onCellClick?: (row: number, col: number, value: number) => void;
  /** 图表容器的无障碍名称；缺省 `xproCharts.heatmap.ariaLabel` */
  ariaLabel?: string;
}

// 热力图：@mantine/charts MatrixChart 的薄封装。
// 原 number[][] 矩阵 → MatrixChart 的 { x, y, value } 单元格；
// 单元格为正方形，边长按容器尺寸自适应。
const COLOR_STEPS = 11; // 0%, 10%, …, 100%（百分比必须为整数：getThemeColor 会按 '.' 拆分色名）
const Y_LABELS_WIDTH = 40;
const X_LABELS_HEIGHT = 24;
const GAP = 1;

export const HeatmapChart = ({
  data, xLabels, yLabels, colorMap,
  width: propWidth, height: propHeight,
  tooltip: enableTooltip = true, onCellClick, ariaLabel,
}: HeatmapChartProps) => {
  const { t } = useChartsI18n();
  const { ref, width: measuredW, height: measuredH } = useElementSize();
  const w = propWidth ?? (measuredW || 300);
  const h = propHeight ?? (measuredH || 200);

  const minColor = colorMap?.min ?? FOUNDATION_CSS_VARS.bg.hover;
  const maxColor = colorMap?.max ?? FOUNDATION_CSS_VARS.accent;

  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  const xKeys = useMemo(
    () => Array.from({ length: cols }, (_, ci) => xLabels?.[ci] ?? String(ci)),
    [cols, xLabels],
  );
  const yKeys = useMemo(
    () => Array.from({ length: rows }, (_, ri) => yLabels?.[ri] ?? String(ri)),
    [rows, yLabels],
  );

  // 单元格 → 原始行列索引（用于 onCellClick 回调）
  const { cells, indexOf } = useMemo(() => {
    const list: MatrixChartCell[] = [];
    const idx = new Map<string, [number, number]>();
    data.forEach((row, ri) =>
      row.forEach((value, ci) => {
        const x = xKeys[ci]!;
        const y = yKeys[ri]!;
        list.push({ x, y, value });
        idx.set(`${x}\u0000${y}`, [ri, ci]);
      }),
    );
    return { cells: list, indexOf: idx };
  }, [data, xKeys, yKeys]);

  const colors = useMemo(
    () =>
      Array.from({ length: COLOR_STEPS }, (_, i) => {
        const pct = Math.round((i * 100) / (COLOR_STEPS - 1));
        return `color-mix(in srgb, ${maxColor} ${pct}%, ${minColor})`;
      }),
    [minColor, maxColor],
  );

  const yW = yLabels ? Y_LABELS_WIDTH : 0;
  const xH = xLabels ? X_LABELS_HEIGHT : 0;
  const cellSize = Math.max(
    4,
    Math.floor(Math.min(cols ? (w - yW) / cols : 0, rows ? (h - xH) / rows : 0)) - GAP,
  );

  return (
    <div
      ref={ref}
      className={classes.root}
      role="figure"
      aria-label={ariaLabel ?? t('xproCharts.heatmap.ariaLabel')}
      style={{ width: propWidth ?? '100%', height: propHeight ?? '100%' }}
    >
      <MatrixChart
        data={cells}
        xLabels={xKeys}
        yLabels={yKeys}
        colors={colors}
        cellSize={cellSize}
        gap={GAP}
        cellRadius={0}
        fontSize={11}
        withXLabels={!!xLabels}
        withYLabels={!!yLabels}
        xLabelsRotation={0}
        xLabelsHeight={X_LABELS_HEIGHT}
        yLabelsWidth={Y_LABELS_WIDTH}
        classNames={{ xLabel: classes.label, yLabel: classes.label }}
        withTooltip={enableTooltip}
        getTooltipLabel={(cell) =>
          t('xproCharts.heatmap.cellTooltip', {
            row: cell.y,
            column: cell.x,
            value: cell.value ?? t('xproCharts.noData'),
          })
        }
        getCellProps={
          onCellClick
            ? (cell) => ({
                style: { cursor: 'pointer' },
                onClick: () => {
                  const pos = indexOf.get(`${cell.x}\u0000${cell.y}`);
                  if (pos && cell.value !== null) onCellClick(pos[0], pos[1], cell.value);
                },
              })
            : undefined
        }
      />
    </div>
  );
};
