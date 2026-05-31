import { useMemo, useCallback, type MouseEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  ChartContainer,
  useChartColors,
  useChartTooltip,
  Tooltip,
  Legend,
  type TooltipState,
} from '../shared';

interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  nodeWidth?: number;
  nodePadding?: number;
  width?: number;
  height?: number;
}

interface LayoutNode {
  id: string;
  label: string;
  color: string;
  layer: number;
  x: number;
  y: number;
  height: number;
}

interface LayoutLink {
  source: LayoutNode;
  target: LayoutNode;
  value: number;
  width: number;
  sy: number;
  ty: number;
}

function computeLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  colors: string[],
  chartWidth: number,
  chartHeight: number,
  nodeWidth: number,
  nodePadding: number,
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } {
  const nodeMap = new Map<string, { node: SankeyNode; layer: number }>();
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const n of nodes) {
    adjacency.set(n.id, []);
    inDegree.set(n.id, 0);
  }

  for (const link of links) {
    adjacency.get(link.source)?.push(link.target);
    inDegree.set(link.target, (inDegree.get(link.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const n of nodes) {
    if ((inDegree.get(n.id) ?? 0) === 0) queue.push(n.id);
  }

  const layers: string[][] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const layerNodes = [...queue];
    layers.push(layerNodes);
    queue.length = 0;
    for (const id of layerNodes) {
      visited.add(id);
      for (const target of adjacency.get(id) ?? []) {
        inDegree.set(target, (inDegree.get(target) ?? 0) - 1);
        if ((inDegree.get(target) ?? 0) === 0 && !visited.has(target)) {
          queue.push(target);
        }
      }
    }
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      if (layers.length === 0) layers.push([]);
      layers[layers.length - 1]!.push(n.id);
    }
  }

  for (let i = 0; i < layers.length; i++) {
    for (const id of layers[i]!) {
      const node = nodes.find((n) => n.id === id)!;
      nodeMap.set(id, { node, layer: i });
    }
  }

  const numLayers = layers.length || 1;
  const layerSpacing = (chartWidth - nodeWidth) / Math.max(numLayers - 1, 1);

  const nodeValues = new Map<string, number>();
  for (const n of nodes) {
    const outVal = links
      .filter((l) => l.source === n.id)
      .reduce((sum, l) => sum + l.value, 0);
    const inVal = links
      .filter((l) => l.target === n.id)
      .reduce((sum, l) => sum + l.value, 0);
    nodeValues.set(n.id, Math.max(outVal, inVal, 1));
  }

  const layerTotals = layers.map((layer) =>
    layer.reduce((sum, id) => sum + (nodeValues.get(id) ?? 1), 0),
  );
  const maxTotal = Math.max(...layerTotals, 1);
  const availableHeight = chartHeight - nodePadding * (Math.max(...layers.map((l) => l.length), 1) - 1);
  const scale = availableHeight / maxTotal;

  const layoutNodes: LayoutNode[] = [];
  const nodePositions = new Map<string, LayoutNode>();

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]!;
    const totalH = layer.reduce((s, id) => s + (nodeValues.get(id) ?? 1) * scale, 0);
    const totalPad = nodePadding * (layer.length - 1);
    let y = (chartHeight - totalH - totalPad) / 2;

    for (let j = 0; j < layer.length; j++) {
      const id = layer[j]!;
      const entry = nodeMap.get(id)!;
      const h = Math.max((nodeValues.get(id) ?? 1) * scale, 4);
      const color = entry.node.color ?? colors[layoutNodes.length % colors.length]!;
      const layoutNode: LayoutNode = {
        id,
        label: entry.node.label,
        color,
        layer: i,
        x: i * layerSpacing,
        y,
        height: h,
      };
      layoutNodes.push(layoutNode);
      nodePositions.set(id, layoutNode);
      y += h + nodePadding;
    }
  }

  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();
  for (const n of layoutNodes) {
    sourceOffsets.set(n.id, n.y);
    targetOffsets.set(n.id, n.y);
  }

  const totalValue = links.reduce((s, l) => s + l.value, 0) || 1;
  const layoutLinks: LayoutLink[] = [];

  for (const link of links) {
    const source = nodePositions.get(link.source);
    const target = nodePositions.get(link.target);
    if (!source || !target) continue;

    const linkWidth = Math.max((link.value / totalValue) * chartHeight * 0.4, 2);
    const sy = sourceOffsets.get(link.source) ?? source.y;
    const ty = targetOffsets.get(link.target) ?? target.y;

    layoutLinks.push({ source, target, value: link.value, width: linkWidth, sy, ty });

    sourceOffsets.set(link.source, sy + linkWidth);
    targetOffsets.set(link.target, ty + linkWidth);
  }

  return { layoutNodes, layoutLinks };
}

function linkPath(link: LayoutLink, nodeWidth: number): string {
  const x0 = link.source.x + nodeWidth;
  const x1 = link.target.x;
  const midX = (x0 + x1) / 2;
  const y0 = link.sy + link.width / 2;
  const y1 = link.ty + link.width / 2;
  return `M${x0},${y0} C${midX},${y0} ${midX},${y1} ${x1},${y1}`;
}

export function SankeyChart({
  nodes,
  links,
  nodeWidth = 20,
  nodePadding = 12,
  width,
  height,
}: SankeyChartProps) {
  const colors = useChartColors(nodes.length);
  const { tooltip, show, hide } = useChartTooltip();

  const handleNodeHover = useCallback(
    (e: MouseEvent, node: LayoutNode) => {
      const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
      show(e.clientX - rect.left, e.clientY - rect.top, `${node.label}: ${node.height.toFixed(0)}`);
    },
    [show],
  );

  const handleLinkHover = useCallback(
    (e: MouseEvent, link: LayoutLink) => {
      const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
      show(
        e.clientX - rect.left,
        e.clientY - rect.top,
        `${link.source.label} → ${link.target.label}: ${link.value}`,
      );
    },
    [show],
  );

  const legendItems = useMemo(
    () => nodes.map((n, i) => ({ label: n.label, color: n.color ?? colors[i % colors.length]! })),
    [nodes, colors],
  );

  return (
    <ChartContainer width={width} height={height}>
      {(dims) => <SankeyInner {...{ nodes, links, nodeWidth, nodePadding, colors, dims, tooltip, handleNodeHover, handleLinkHover, hide, legendItems }} />}
    </ChartContainer>
  );
}

interface SankeyInnerProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  nodeWidth: number;
  nodePadding: number;
  colors: string[];
  dims: { width: number; height: number };
  tooltip: TooltipState;
  handleNodeHover: (e: MouseEvent, node: LayoutNode) => void;
  handleLinkHover: (e: MouseEvent, link: LayoutLink) => void;
  hide: () => void;
  legendItems: { label: string; color: string }[];
}

function SankeyInner({
  nodes,
  links,
  nodeWidth,
  nodePadding,
  colors,
  dims,
  tooltip,
  handleNodeHover,
  handleLinkHover,
  hide,
  legendItems,
}: SankeyInnerProps) {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const svgHeight = dims.height - 40;

  const { layoutNodes, layoutLinks } = useMemo(
    () => computeLayout(nodes, links, colors, dims.width, svgHeight, nodeWidth, nodePadding),
    [nodes, links, colors, dims.width, svgHeight, nodeWidth, nodePadding],
  );

  return (
    <div style={{ position: 'relative', width: dims.width, height: dims.height }}>
      <svg width={dims.width} height={svgHeight}>
        <g>
          {layoutLinks.map((link, i) => (
            <path
              key={`link-${i}`}
              d={linkPath(link, nodeWidth)}
              fill="none"
              stroke={link.source.color}
              strokeWidth={link.width}
              strokeOpacity={0.35}
              onMouseMove={(e) => handleLinkHover(e as unknown as MouseEvent, link)}
              onMouseLeave={hide}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </g>
        <g>
          {layoutNodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={nodeWidth}
                height={node.height}
                fill={node.color}
                rx={3}
                onMouseMove={(e) => handleNodeHover(e as unknown as MouseEvent, node)}
                onMouseLeave={hide}
                style={{ cursor: 'pointer' }}
              />
              <text
                x={node.layer === 0 ? node.x + nodeWidth + 6 : node.x - 6}
                y={node.y + node.height / 2}
                dy="0.35em"
                textAnchor={node.layer === 0 ? 'start' : 'end'}
                fill={fp.text.primary}
                fontSize={11}
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <Tooltip state={tooltip} />
      <Legend items={legendItems} />
    </div>
  );
}