import type { Messages } from '@/i18n';

// XProDemoPage 中文文案。挂在 xpro.* 命名空间下。
// 由 src/pages/XProDemoPage/lang/index.ts 通过 localeRegistry.extend('zh-CN', ...) 注入。
export const xProDemoPageZhCN: Messages = {
  xpro: {
    title: 'X-Pro 自实现组件',
    datagrid: {
      title: 'DataGrid Pro（社区版扩展：列固定 + 行重排）',
    },
    col: {
      name: '姓名',
      department: '部门',
      salary: '薪资',
      age: '年龄',
    },
    charts: {
      title: 'Charts Pro（七种自实现图表）',
      heatmap: '热力图',
      funnel: '漏斗图',
      radar: '雷达图',
      candlestick: 'K 线图',
      sankey: '桑基图',
      gantt: '甘特图',
      treemap: '矩形树图',
    },
  },
};
