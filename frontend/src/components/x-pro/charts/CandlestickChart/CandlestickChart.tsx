import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { useChartDimensions } from '../shared/hooks';
import { useChartTooltip } from '../shared/useChartTooltip';
import { Tooltip } from '../shared/Tooltip';
import { Legend } from '../shared/Legend';
import type { ChartMargin } from '../shared/types';

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
  margin?: ChartMargin;
}

const DEFAULT_MARGIN: ChartMargin = { top: 16, right: 16, bottom: 32, left: 48 };

export function CandlestickChart({
  data,
  upColor,
  downColor,
  width,
  height,
  margin = DEFAULT_MARGIN,
}: CandlestickChartProps) {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const { ref, dimensions } = useChartDimensions(width, height, margin);
  const { tooltip, show, hide } = useChartTooltip();

  const up = upColor ?? fp.status.success;
  const down = downColor ?? fp.status.danger;

  const { innerWidth, innerHeight } = dimensions;
  const candleCount = data.length;

  if (candleCount === 0) {
    return <Box ref={ref} sx={{ width: width ?? '100%', height: height ?? 300 }} />;
  }

  const allHighs = data.map((d) => d.high);
  const allLows = data.map((d) => d.low);
  const priceMax = Math.max(...allHighs);
  const priceMin = Math.min(...allLows);
  const priceRange = priceMax - priceMin || 1;

  const candleWidth = Math.max(1, (innerWidth / candleCount) * 0.6);
  const gap = innerWidth / candleCount;

  const scaleY = (price: number) =>
    margin.top + innerHeight - ((price - priceMin) / priceRange) * innerHeight;

  const scaleX = (index: number) => margin.left + gap * index + gap / 2;

  const handleMouseEnter = (e: React.MouseEvent, d: CandlestickDataPoint) => {
    const rect = (e.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    show(x, y, `${d.date}\nO:${d.open} H:${d.high} L:${d.low} C:${d.close}`);
  };

  const legendItems = [
    { label: 'Up', color: up },
    { label: 'Down', color: down },
  ];

  return (
    <Box ref={ref} sx={{ width: width ?? '100%', height: height ?? 300, position: 'relative' }}>
      <Legend items={legendItems} />
      <svg
        width={dimensions.width}
        height={dimensions.height - 28}
        style={{ display: 'block' }}
      >
        {data.map((d, i) => {
          const isUp = d.close >= d.open;
          const color = isUp ? up : down;
          const cx = scaleX(i);
          const bodyTop = scaleY(Math.max(d.open, d.close));
          const bodyBottom = scaleY(Math.min(d.open, d.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);

          return (
            <g
              key={d.date + i}
              onMouseEnter={(e) => handleMouseEnter(e, d)}
              onMouseLeave={hide}
              style={{ cursor: 'pointer' }}
            >
              <line
                x1={cx}
                y1={scaleY(d.high)}
                x2={cx}
                y2={scaleY(d.low)}
                stroke={color}
                strokeWidth={1}
              />
              <rect
                x={cx - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isUp ? color : color}
                stroke={color}
                strokeWidth={0.5}
              />
            </g>
          );
        })}
        {Array.from({ length: 5 }).map((_, i) => {
          const price = priceMin + (priceRange / 4) * i;
          const y = scaleY(price);
          return (
            <g key={`axis-${i}`}>
              <line
                x1={margin.left}
                y1={y}
                x2={dimensions.width - margin.right}
                y2={y}
                stroke={fp.divider}
                strokeDasharray="2,2"
              />
              <text
                x={margin.left - 4}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill={fp.text.muted}
              >
                {price.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
      <Tooltip state={tooltip} />
    </Box>
  );
}
