import type { Locale } from '../types';

// 简体中文（默认）—— 公用文案。
// 仅放"跨页面 / 框架级"的 keys：
//   - app.*：应用元数据
//   - sidebar.* / titleBar.*：基座组件
//   - route.*：路由 label（多处消费：Sidebar tooltip / 设置页 / 未来面包屑）
//   - common.*：通用术语（保存 / 取消 / 删除 / 是 / 否 / 加载中 / 错误 / 跟随系统）
// 页面级文案（home / settings 等）不要放这里 —— 各 page 自带 lang/ 目录注册。
//
// 命名约定：点路径分组；模板插值用 {{var}}（与 t(key, vars) 配合）。
export const zhCN: Locale = {
  code: 'zh-CN',
  englishName: 'Chinese (Simplified)',
  nativeName: '简体中文',
  messages: {
    app: {
      title: 'Foundation',
    },
    sidebar: {
      brand: 'F',
      navAriaLabel: '主导航',
    },
    titleBar: {
      controls: {
        minimise: '最小化',
        maximise: '最大化 / 还原',
        close: '关闭',
      },
    },
    route: {
      home: '首页',
      settings: '设置',
    },
    common: {
      save: '保存',
      cancel: '取消',
      remove: '删除',
      reset: '重置',
      yes: '是',
      no: '否',
      loading: '加载中…',
      error: '错误',
      followSystem: '跟随系统',
      auto: '自动',
    },
  },
};
