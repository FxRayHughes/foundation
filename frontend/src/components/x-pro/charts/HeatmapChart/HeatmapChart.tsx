import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '@mui/material';
import { Tooltip } from '../shared/Tooltip';
import { useChartTooltip } from '../shared/useChartTooltip';

export interface HeatmapChartProps {
  data: number[][];
  xLabels?: string[];
  yLabels?: string[];
  colorMap?: { min: string; max: string };
  width?: number;
  height?: number;
  tooltip?: boolean;
  onCellClick?: (row: number, col: number, value: number) => void;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

export const HeatmapChart = ({
  data, xLabels, yLabels, colorMap,
  width: propWidth, height: propHeight,
  tooltip: enableTooltip = true, onCellClick,
}: HeatmapChartProps) => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const minColor = colorMap?.min ?? '#e0e0e0';
  const maxColor = colorMap?.max ?? fp.accent;
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: propWidth ?? 300, h: propHeight ?? 200 });
  const { tooltip: tipState, show, hide } = useChartTooltip();

  useEffect(() => {
    if (propWidth && propHeight) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      setSize({ w: propWidth ?? e.contentRect.width, h: propHeight ?? e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [propWidth, propHeight]);

  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const allValues = data.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const margin = { top: 20, right: 10, bottom: 30, left: 40 };
  const plotW = size.w - margin.left - margin.right;
  const plotH = size.h - margin.top - margin.bottom;
  const cellW = cols > 0 ? plotW / cols : 0;
  const cellH = rows > 0 ? plotH / rows : 0;

  const handleMouseEnter = useCallback((evt: React.MouseEvent, ri: number, ci: number, val: number) => {
    if (!enableTooltip) return;
    const xl = xLabels?.[ci] ?? `${ci}`;
    const yl = yLabels?.[ri] ?? `${ri}`;
    show(evt.clientX, evt.clientY, `${yl}, ${xl}: ${val}`);
  }, [enableTooltip, xLabels, yLabels, show]);

  return (
    <div ref={containerRef} style={{ width: propWidth ?? '100%', height: propHeight ?? '100%', position: 'relative' }}>
      <svg width={size.w} height={size.h}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {data.map((row, ri) =>
            row.map((val, ci) => {
              const norm = maxVal === minVal ? 0.5 : (val - minVal) / (maxVal - minVal);
              return (
                <rect
                  key={`${ri}-${ci}`}
                  x={ci * cellW}
                  y={ri * cellH}
                  width={Math.max(0, cellW - 1)}
                  height={Math.max(0, cellH - 1)}
                  fill={lerpColor(minColor, maxColor, norm)}
                  style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                  onMouseEnter={(e) => handleMouseEnter(e, ri, ci, val)}
                  onMouseLeave={hide}
                  onClick={() => onCellClick?.(ri, ci, val)}
                />
              );
            })
          )}
          {xLabels?.map((label, i) => (
            <text key={`x-${i}`} x={i * cellW + cellW / 2} y={plotH + 16} textAnchor="middle" fontSize={11} fill={fp.text.secondary}>
              {label}
            </text>
          ))}
          {yLabels?.map((label, i) => (
            <text key={`y-${i}`} x={-6} y={i * cellH + cellH / 2 + 4} textAnchor="end" fontSize={11} fill={fp.text.secondary}>
              {label}
            </text>
          ))}
        </g>
      </svg>
      {enableTooltip && tipState.visible && <Tooltip state={tipState} />}
    </div>
  );
};
