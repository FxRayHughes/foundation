import { useMemo } from 'react';
import { Treemap, type TreemapData } from '@mantine/charts';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useChartColors, useChartsI18n } from '../shared';

export interface TreemapNode {
  label: string;
  value?: number;
  children?: TreemapNode[];
  color?: string;
}

export interface TreemapChartProps {
  data: TreemapNode;
  colorMap?: string[];
  width?: number;
  height?: number;
  onNodeClick?: (node: TreemapNode) => void;
  /** 图表容器的无障碍名称；缺省 `xproCharts.treemap.ariaLabel` */
  ariaLabel?: string;
}

// 矩形树图：@mantine/charts Treemap 的薄封装。
// 根节点本身不绘制，其 children 作为第一层；第一层按系列色赋色，子层继承父色。
// 每个节点携带 __fdIndex 以便点击时回查原始 TreemapNode。
const INDEX_KEY = '__fdIndex';

function getNodeValue(node: TreemapNode): number {
  if (node.value !== undefined) return node.value;
  return (node.children ?? []).reduce((sum, child) => sum + getNodeValue(child), 0);
}

export function TreemapChart({ data, colorMap, width, height, onNodeClick, ariaLabel }: TreemapChartProps) {
  const { t } = useChartsI18n();
  const paletteColors = useChartColors();
  const colors = colorMap ?? paletteColors;

  const { treeData, flat } = useMemo(() => {
    const flatNodes: TreemapNode[] = [];
    const convert = (node: TreemapNode, color?: string): TreemapData => {
      flatNodes.push(node);
      const item: TreemapData = {
        name: node.label,
        // 有 children 时交给 Recharts 汇总，避免父值与子值之和不一致
        value: node.children?.length ? undefined : getNodeValue(node),
        [INDEX_KEY]: flatNodes.length - 1,
      };
      if (node.color ?? color) item.color = node.color ?? color;
      if (node.children?.length) item.children = node.children.map((c) => convert(c));
      return item;
    };
    const top = data.children?.length ? data.children : [data];
    const converted = top.map((child, i) => convert(child, colors[i % colors.length]));
    return { treeData: converted, flat: flatNodes };
  }, [data, colors]);

  return (
    <Treemap
      role="figure"
      aria-label={ariaLabel ?? t('xproCharts.treemap.ariaLabel')}
      w={width ?? '100%'}
      height={height ?? 300}
      data={treeData}
      strokeColor={FOUNDATION_CSS_VARS.bg.surface}
      textColor={FOUNDATION_CSS_VARS.text.primary}
      style={onNodeClick ? { cursor: 'pointer' } : undefined}
      treemapProps={
        onNodeClick
          ? {
              onClick: (node) => {
                const idx = node[INDEX_KEY];
                const original = typeof idx === 'number' ? flat[idx] : undefined;
                if (original) onNodeClick(original);
              },
            }
          : undefined
      }
    />
  );
}
