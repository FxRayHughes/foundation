import type { Messages } from '@/i18n';

// XProDemoPage 中文文案。挂在 xpro.* 命名空间下。
// 由 src/pages/XProDemoPage/lang/index.ts 通过 localeRegistry.extend('zh-CN', ...) 注入。
export const xProDemoPageZhCN: Messages = {
  xpro: {
    title: 'X-Pro 自实现组件',
    datagrid: {
      title: 'DataGrid Pro（社区版扩展：列固定 + 行重排）',
    },
    datagridPremium: {
      title: 'DataGrid Premium（导出 / 列菜单 / 列宽拖拽 / 固定行 / 聚合）',
      hint: '悬停表头打开列菜单（排序、固定、隐藏、管理列）；拖动表头右边缘调整列宽，双击恢复；工具栏导出会弹出系统「另存为」对话框。',
    },
    col: {
      name: '姓名',
      department: '部门',
      salary: '薪资',
      age: '年龄',
    },
    charts: {
      title: 'Charts Pro（八种自实现图表）',
      heatmap: '热力图',
      funnel: '漏斗图',
      radar: '雷达图',
      candlestick: 'K 线图',
      sankey: '桑基图',
      gantt: '甘特图',
      treemap: '矩形树图',
      funnelHorizontal: '漏斗图（横向）',
      // 演示数据的类目名（喂给图表的人类可读标签）
      data: {
        weekdays: { mon: '周一', tue: '周二', wed: '周三', thu: '周四', fri: '周五' },
        quarters: { q1: '一季度', q2: '二季度', q3: '三季度', q4: '四季度' },
        funnel: {
          visits: '访问',
          signups: '注册',
          trials: '试用',
          purchases: '购买',
          renewals: '续费',
        },
        radar: {
          axes: { speed: '速度', power: '力量', defense: '防御', range: '射程', hp: '生命值' },
          series: { playerA: '玩家 A', playerB: '玩家 B' },
        },
        sankey: {
          budget: '预算',
          engineering: '研发',
          design: '设计',
          marketing: '市场',
          product: '产品',
        },
        gantt: {
          research: '调研',
          design: '设计',
          development: '开发',
          testing: '测试',
        },
        treemap: {
          portfolio: '投资组合',
          tech: '技术',
          frontend: '前端',
          backend: '后端',
          design: '设计',
          marketing: '市场',
          operations: '运营',
        },
      },
    },
  },
};
