import type { Messages } from '@/i18n';

// x-pro 图表组件文案。挂在 xproCharts.* 命名空间下。
// 仅作组件默认值 —— 公开的文案类 props（如 CandlestickChart 的 labels）仍可覆盖。
export const xProChartsZhCN: Messages = {
  xproCharts: {
    noData: '暂无数据',
    candlestick: {
      ariaLabel: 'K 线图',
      open: '开盘',
      high: '最高',
      low: '最低',
      close: '收盘',
    },
    funnel: {
      ariaLabel: '漏斗图',
      segmentAriaLabel: '{{name}}：{{value}}',
    },
    heatmap: {
      ariaLabel: '热力图',
      cellTooltip: '{{row}}，{{column}}：{{value}}',
    },
    radar: {
      ariaLabel: '雷达图',
    },
    sankey: {
      ariaLabel: '桑基图',
    },
    treemap: {
      ariaLabel: '矩形树图',
    },
    gantt: {
      ariaLabel: '甘特图',
      task: '{{label}}：{{start}} – {{end}}',
      taskWithProgress: '{{label}}：{{start}} – {{end}}（已完成 {{progress}}%）',
    },
    zoomable: {
      ariaLabel: '可缩放图表',
      transformAriaLabel: '可缩放视图：滚轮缩放，拖拽平移',
    },
  },
};
