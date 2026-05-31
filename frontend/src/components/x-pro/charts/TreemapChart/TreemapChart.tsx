import { type MouseEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import { ChartContainer, Tooltip, useChartTooltip, useChartColors } from '../shared';
import type { ChartDimensions } from '../shared';

export interface TreemapNode {
  label: string;
  value?: number;
  children?: TreemapNode[];
  color?: string;
}

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  node: TreemapNode;
  color: string;
  value: number;
}

export interface TreemapChartProps {
  data: TreemapNode;
  colorMap?: string[];
  width?: number;
  height?: number;
  onNodeClick?: (node: TreemapNode) => void;
}

function getNodeValue(node: TreemapNode): number {
  if (node.value !== undefined) return node.value;
  if (!node.children?.length) return 0;
  return node.children.reduce((sum, child) => sum + getNodeValue(child), 0);
}

function worstRatio(row: number[], w: number): number {
  if (row.length === 0) return Infinity;
  const s = row.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...row);
  const minVal = Math.min(...row);
  const rMax = (w * w * maxVal) / (s * s);
  const rMin = (s * s) / (w * w * minVal);
  return Math.max(rMax, rMin);
}

function squarify(
  nodes: { node: TreemapNode; area: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  getColor: (index: number) => string,
  colorOffset: number,
): LayoutRect[] {
  if (nodes.length === 0) return [];
  if (w <= 0 || h <= 0) return [];

  if (nodes.length === 1) {
    const item = nodes[0]!;
    const color = item.node.color ?? getColor(colorOffset);
    if (item.node.children?.length) {
      return squarifyChildren(item.node, x, y, w, h, getColor, colorOffset);
    }
    return [{ x, y, w, h, node: item.node, color, value: getNodeValue(item.node) }];
  }

  const totalArea = nodes.reduce((s, n) => s + n.area, 0);
  const shortSide = Math.min(w, h);

  const row: number[] = [];
  let rowIdx = 0;

  for (let i = 0; i < nodes.length; i++) {
    const testRow = [...row, nodes[i]!.area];
    if (row.length === 0 || worstRatio(testRow, shortSide) <= worstRatio(row, shortSide)) {
      row.push(nodes[i]!.area);
      rowIdx = i;
    } else {
      break;
    }
  }

  const rowSum = row.reduce((a, b) => a + b, 0);
  const rowRatio = rowSum / totalArea;
  const results: LayoutRect[] = [];

  if (w >= h) {
    const rowW = w * rowRatio;
    let cy = y;
    for (let i = 0; i <= rowIdx; i++) {
      const item = nodes[i]!;
      const itemH = h * (item.area / rowSum);
      const color = item.node.color ?? getColor(colorOffset + i);
      if (item.node.children?.length) {
        results.push(...squarifyChildren(item.node, x, cy, rowW, itemH, getColor, colorOffset + i));
      } else {
        results.push({ x, y: cy, w: rowW, h: itemH, node: item.node, color, value: getNodeValue(item.node) });
      }
      cy += itemH;
    }
    const remaining = nodes.slice(rowIdx + 1);
    if (remaining.length > 0) {
      results.push(...squarify(remaining, x + rowW, y, w - rowW, h, getColor, colorOffset + rowIdx + 1));
    }
  } else {
    const rowH = h * rowRatio;
    let cx = x;
    for (let i = 0; i <= rowIdx; i++) {
      const item = nodes[i]!;
      const itemW = w * (item.area / rowSum);
      const color = item.node.color ?? getColor(colorOffset + i);
      if (item.node.children?.length) {
        results.push(...squarifyChildren(item.node, cx, y, itemW, rowH, getColor, colorOffset + i));
      } else {
        results.push({ x: cx, y, w: itemW, h: rowH, node: item.node, color, value: getNodeValue(item.node) });
      }
      cx += itemW;
    }
    const remaining = nodes.slice(rowIdx + 1);
    if (remaining.length > 0) {
      results.push(...squarify(remaining, x, y + rowH, w, h - rowH, getColor, colorOffset + rowIdx + 1));
    }
  }

  return results;
}

function squarifyChildren(
  parent: TreemapNode,
  x: number,
  y: number,
  w: number,
  h: number,
  getColor: (index: number) => string,
  colorOffset: number,
): LayoutRect[] {
  const children = parent.children ?? [];
  const items = children
    .map((child) => ({ node: child, area: getNodeValue(child) }))
    .filter((item) => item.area > 0)
    .sort((a, b) => b.area - a.area);
  return squarify(items, x, y, w, h, getColor, colorOffset);
}

function computeLayout(
  data: TreemapNode,
  width: number,
  height: number,
  getColor: (index: number) => string,
): LayoutRect[] {
  const children = data.children ?? [];
  if (children.length === 0 && data.value !== undefined) {
    const color = data.color ?? getColor(0);
    return [{ x: 0, y: 0, w: width, h: height, node: data, color, value: data.value }];
  }
  const items = children
    .map((child) => ({ node: child, area: getNodeValue(child) }))
    .filter((item) => item.area > 0)
    .sort((a, b) => b.area - a.area);
  return squarify(items, 0, 0, width, height, getColor, 0);
}

export function TreemapChart({ data, colorMap, width, height, onNodeClick }: TreemapChartProps) {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const paletteColors = useChartColors();
  const colors = colorMap ?? paletteColors;
  const getColor = (i: number) => colors[i % colors.length]!;
  const { tooltip, show, hide } = useChartTooltip();

  const renderContent = (dims: ChartDimensions) => {
    const rects = computeLayout(data, dims.width, dims.height, getColor);

    const handleMouseMove = (e: MouseEvent<SVGRectElement>, rect: LayoutRect) => {
      const svg = (e.target as SVGElement).ownerSVGElement;
      if (!svg) return;
      const point = svg.getBoundingClientRect();
      show(e.clientX - point.left, e.clientY - point.top, `${rect.node.label}: ${rect.value}`);
    };

    const handleClick = (rect: LayoutRect) => {
      onNodeClick?.(rect.node);
    };

    return (
      <>
        <svg width={dims.width} height={dims.height} style={{ display: 'block' }}>
          {rects.map((rect, i) => {
            const padding = 1;
            const rx = rect.x + padding;
            const ry = rect.y + padding;
            const rw = Math.max(0, rect.w - padding * 2);
            const rh = Math.max(0, rect.h - padding * 2);
            const showLabel = rw > 30 && rh > 16;
            return (
              <g key={`${rect.node.label}-${i}`}>
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  rx={4}
                  ry={4}
                  fill={rect.color}
                  opacity={0.85}
                  style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                  onMouseMove={(e) => handleMouseMove(e, rect)}
                  onMouseLeave={hide}
                  onClick={() => handleClick(rect)}
                />
                {showLabel && (
                  <text
                    x={rx + rw / 2}
                    y={ry + rh / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={fp.text.primary}
                    fontSize={Math.min(12, rw / rect.node.label.length * 1.4)}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {rect.node.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <Tooltip state={tooltip} />
      </>
    );
  };

  return (
    <ChartContainer width={width} height={height}>
      {renderContent}
    </ChartContainer>
  );
}
