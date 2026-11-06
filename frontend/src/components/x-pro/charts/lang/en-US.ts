import type { Messages } from '@/i18n';

// x-pro Charts copy. Mounted under the `xproCharts.*` namespace.
// Component defaults only — every public label prop still overrides these.
export const xProChartsEnUS: Messages = {
  xproCharts: {
    noData: 'No data',
    candlestick: {
      ariaLabel: 'Candlestick chart',
      open: 'Open',
      high: 'High',
      low: 'Low',
      close: 'Close',
    },
    funnel: {
      ariaLabel: 'Funnel chart',
      segmentAriaLabel: '{{name}}: {{value}}',
    },
    heatmap: {
      ariaLabel: 'Heatmap',
      cellTooltip: '{{row}}, {{column}}: {{value}}',
    },
    radar: {
      ariaLabel: 'Radar chart',
    },
    sankey: {
      ariaLabel: 'Sankey diagram',
    },
    treemap: {
      ariaLabel: 'Treemap',
    },
    gantt: {
      ariaLabel: 'Gantt chart',
      task: '{{label}}: {{start}} – {{end}}',
      taskWithProgress: '{{label}}: {{start}} – {{end}} ({{progress}}% done)',
    },
    zoomable: {
      ariaLabel: 'Zoomable chart',
      transformAriaLabel: 'Zoomable view: scroll to zoom, drag to pan',
    },
  },
};
