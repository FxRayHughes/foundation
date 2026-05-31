import { useRef, useMemo } from 'react';
import { Box } from '@mui/material';
import { useChartDimensions, useChartColors, useChartTooltip } from '../shared';

export interface FunnelDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  data: FunnelDataItem[];
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
}

interface ComputedLayer {
  label: string;
  value: number;
  color: string;
  path: string;
}

function buildVerticalLayers(
  sorted: FunnelDataItem[],
  colors: string[],
  w: number,
  h: number,
): ComputedLayer[] {
  const maxValue = sorted[0]?.value ?? 1;
  const layerHeight = h / sorted.length;
  const layers: ComputedLayer[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]!;
    const nextItem = sorted[i + 1];
    const currentRatio = item.value / maxValue;
    const nextRatio = nextItem ? nextItem.value / maxValue : currentRatio * 0.6;
    const cx = w / 2;
    const topHalf = (w * currentRatio) / 2;
    const bottomHalf = (w * nextRatio) / 2;
    const y = i * layerHeight;

    const path = [
      `M ${cx - topHalf} ${y}`,
      `L ${cx + topHalf} ${y}`,
      `L ${cx + bottomHalf} ${y + layerHeight}`,
      `L ${cx - bottomHalf} ${y + layerHeight}`,
      'Z',
    ].join(' ');

    layers.push({
      label: item.label,
      value: item.value,
      color: item.color ?? colors[i % colors.length]!,
      path,
    });
  }

  return layers;
}

function buildHorizontalLayers(
  sorted: FunnelDataItem[],
  colors: string[],
  w: number,
  h: number,
): ComputedLayer[] {
  const maxValue = sorted[0]?.value ?? 1;
  const layerWidth = w / sorted.length;
  const layers: ComputedLayer[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]!;
    const nextItem = sorted[i + 1];
    const currentRatio = item.value / maxValue;
    const nextRatio = nextItem ? nextItem.value / maxValue : currentRatio * 0.6;
    const cy = h / 2;
    const leftHalf = (h * currentRatio) / 2;
    const rightHalf = (h * nextRatio) / 2;
    const x = i * layerWidth;

    const path = [
      `M ${x} ${cy - leftHalf}`,
      `L ${x} ${cy + leftHalf}`,
      `L ${x + layerWidth} ${cy + rightHalf}`,
      `L ${x + layerWidth} ${cy - rightHalf}`,
      'Z',
    ].join(' ');

    layers.push({
      label: item.label,
      value: item.value,
      color: item.color ?? colors[i % colors.length]!,
      path,
    });
  }

  return layers;
}

export function FunnelChart({ data, orientation = 'vertical', width, height }: FunnelChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dimensions = useChartDimensions(containerRef, width, height);
  const colors = useChartColors();
  const { tooltip, show, hide } = useChartTooltip();

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data],
  );

  const layers = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];
    return orientation === 'vertical'
      ? buildVerticalLayers(sorted, colors, dimensions.width, dimensions.height)
      : buildHorizontalLayers(sorted, colors, dimensions.width, dimensions.height);
  }, [sorted, colors, dimensions, orientation]);

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>, layer: ComputedLayer) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    show(e.clientX - rect.left, e.clientY - rect.top, `${layer.label}: ${layer.value}`);
  };

  return (
    <Box
      ref={containerRef}
      sx={{ width: width ?? '100%', height: height ?? 300, position: 'relative' }}
    >
      <svg width={dimensions.width} height={dimensions.height}>
        {layers.map((layer) => (
          <path
            key={layer.label}
            d={layer.path}
            fill={layer.color}
            opacity={0.85}
            onMouseMove={(e) => handleMouseMove(e, layer)}
            onMouseLeave={hide}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => {
              (e.currentTarget as SVGPathElement).style.opacity = '1';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as SVGPathElement).style.opacity = '0.85';
            }}
          />
        ))}
      </svg>
      {tooltip.visible && (
        <Box
          sx={{
            position: 'absolute',
            left: tooltip.x + 12,
            top: tooltip.y - 28,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'foundation.bg.elevated',
            color: 'foundation.text.primary',
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 1,
          }}
        >
          {tooltip.content}
        </Box>
      )}
    </Box>
  );
}
