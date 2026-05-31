import { useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  ChartContainer,
  useChartColors,
  useChartTooltip,
  Tooltip,
  Legend,
} from '../shared';

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
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleRad: number,
): { x: number; y: number } {
  return {
    x: cx + radius * Math.sin(angleRad),
    y: cy - radius * Math.cos(angleRad),
  };
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  values: number[],
  maxVal: number,
  radius: number,
): string {
  const step = (2 * Math.PI) / values.length;
  return values
    .map((v, i) => {
      const r = (v / maxVal) * radius;
      const { x, y } = polarToCartesian(cx, cy, r, step * i);
      return `${x},${y}`;
    })
    .join(' ');
}

export function RadarChart({
  axes,
  series,
  max,
  fillOpacity = 0.25,
  width,
  height,
  levels = 5,
}: RadarChartProps) {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const colors = useChartColors(series.length);
  const { tooltip, show, hide } = useChartTooltip();
  const svgRef = useRef<SVGSVGElement>(null);

  const maxVal = max ?? Math.max(...series.flatMap((s) => s.data), 1);
  const axisCount = axes.length;
  const angleStep = (2 * Math.PI) / axisCount;

  const resolvedColors = series.map((s, i) => s.color ?? colors[i]!);

  const legendItems = series.map((s, i) => ({
    label: s.label,
    color: resolvedColors[i]!,
  }));

  return (
    <ChartContainer width={width} height={height}>
      {(dimensions) => {
        const { width: w, height: h } = dimensions;
        const padding = 40;
        const radius = Math.min(w, h) / 2 - padding;
        const cx = w / 2;
        const cy = h / 2;

        return (
          <>
            <svg
              ref={svgRef}
              width={w}
              height={h}
              onMouseLeave={hide}
              style={{ display: 'block' }}
            >
              {Array.from({ length: levels }, (_, lvl) => {
                const r = (radius * (lvl + 1)) / levels;
                const pts = Array.from({ length: axisCount }, (__, i) => {
                  const { x, y } = polarToCartesian(cx, cy, r, angleStep * i);
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polygon
                    key={lvl}
                    points={pts}
                    fill="none"
                    stroke={fp.divider}
                    strokeWidth={1}
                  />
                );
              })}

              {axes.map((label, i) => {
                const end = polarToCartesian(cx, cy, radius, angleStep * i);
                const labelPos = polarToCartesian(cx, cy, radius + 16, angleStep * i);
                return (
                  <g key={i}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={end.x}
                      y2={end.y}
                      stroke={fp.divider}
                      strokeWidth={1}
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                      fill={fp.text.secondary}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {series.map((s, si) => {
                const color = resolvedColors[si]!;
                const points = buildPolygonPoints(cx, cy, s.data, maxVal, radius);
                return (
                  <polygon
                    key={si}
                    points={points}
                    fill={color}
                    fillOpacity={fillOpacity}
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              })}

              {series.map((s, si) => {
                const color = resolvedColors[si]!;
                return s.data.map((val, di) => {
                  const r = (val / maxVal) * radius;
                  const { x, y } = polarToCartesian(cx, cy, r, angleStep * di);
                  return (
                    <circle
                      key={`${si}-${di}`}
                      cx={x}
                      cy={y}
                      r={4}
                      fill={color}
                      stroke={fp.bg.surface}
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const svg = svgRef.current;
                        if (!svg) return;
                        const rect = svg.getBoundingClientRect();
                        show(
                          e.clientX - rect.left,
                          e.clientY - rect.top,
                          `${s.label} — ${axes[di]}: ${val}`,
                        );
                      }}
                      onMouseLeave={hide}
                    />
                  );
                });
              })}
            </svg>
            <Legend items={legendItems} />
            <Tooltip state={tooltip} />
          </>
        );
      }}
    </ChartContainer>
  );
}
