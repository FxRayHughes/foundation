import { useMemo } from 'react';
import { SankeyChart as MantineSankeyChart, type SankeyChartData } from '@mantine/charts';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';
import { useChartColors, useChartsI18n } from '../shared';

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
  /** 图表容器的无障碍名称；缺省 `xproCharts.sankey.ariaLabel` */
  ariaLabel?: string;
}

// 桑基图：@mantine/charts SankeyChart 的薄封装。
// 原 id 引用的 links → Recharts 需要的节点下标；节点显式赋色，连线随源节点着色。
export function SankeyChart({
  nodes,
  links,
  nodeWidth = 20,
  nodePadding = 12,
  width,
  height,
  ariaLabel,
}: SankeyChartProps) {
  const { t } = useChartsI18n();
  const colors = useChartColors(nodes.length);

  const data = useMemo<SankeyChartData>(() => {
    const indexById = new Map(nodes.map((n, i) => [n.id, i]));
    return {
      nodes: nodes.map((n, i) => ({ name: n.label, color: n.color ?? colors[i]! })),
      links: links.flatMap((l) => {
        const source = indexById.get(l.source);
        const target = indexById.get(l.target);
        return source === undefined || target === undefined ? [] : [{ source, target, value: l.value }];
      }),
    };
  }, [nodes, links, colors]);

  return (
    <MantineSankeyChart
      role="figure"
      aria-label={ariaLabel ?? t('xproCharts.sankey.ariaLabel')}
      w={width ?? '100%'}
      height={height ?? 300}
      data={data}
      nodeWidth={nodeWidth}
      nodePadding={nodePadding}
      linkOpacity={0.35}
      textColor={FOUNDATION_CSS_VARS.text.primary}
    />
  );
}
