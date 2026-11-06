import type { Messages } from '@/i18n';

// XProDemoPage English copy. Mounted under the `xpro.*` namespace.
export const xProDemoPageEnUS: Messages = {
  xpro: {
    title: 'X-Pro Self-Implemented Components',
    datagrid: {
      title: 'DataGrid Pro (Community + pinned columns & row reordering)',
    },
    datagridPremium: {
      title: 'DataGrid Premium (export / column menu / resizing / pinned rows / aggregation)',
      hint: 'Hover a header and open its menu to sort, pin, hide or manage columns; drag a header edge to resize (double-click to reset); toolbar export opens the native Save As dialog.',
    },
    col: {
      name: 'Name',
      department: 'Department',
      salary: 'Salary',
      age: 'Age',
    },
    charts: {
      title: 'Charts Pro (seven self-implemented charts)',
      heatmap: 'Heatmap',
      funnel: 'Funnel',
      radar: 'Radar',
      candlestick: 'Candlestick',
      sankey: 'Sankey',
      gantt: 'Gantt',
      treemap: 'Treemap',
      funnelHorizontal: 'Funnel (horizontal)',
      // Demo data labels (category names fed into the charts)
      data: {
        weekdays: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' },
        quarters: { q1: 'Q1', q2: 'Q2', q3: 'Q3', q4: 'Q4' },
        funnel: {
          visits: 'Visits',
          signups: 'Signups',
          trials: 'Trials',
          purchases: 'Purchases',
          renewals: 'Renewals',
        },
        radar: {
          axes: { speed: 'Speed', power: 'Power', defense: 'Defense', range: 'Range', hp: 'HP' },
          series: { playerA: 'Player A', playerB: 'Player B' },
        },
        sankey: {
          budget: 'Budget',
          engineering: 'Engineering',
          design: 'Design',
          marketing: 'Marketing',
          product: 'Product',
        },
        gantt: {
          research: 'Research',
          design: 'Design',
          development: 'Development',
          testing: 'Testing',
        },
        treemap: {
          portfolio: 'Portfolio',
          tech: 'Tech',
          frontend: 'Frontend',
          backend: 'Backend',
          design: 'Design',
          marketing: 'Marketing',
          operations: 'Operations',
        },
      },
    },
  },
};
