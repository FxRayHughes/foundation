import type { Messages } from '@/i18n';

// HomePage 中文文案。挂在 home.* 命名空间下。
// 由 src/pages/HomePage/lang/index.ts 通过 localeRegistry.extend('zh-CN', ...) 注入。
export const homePageZhCN: Messages = {
  home: {
    eyebrow: 'Foundation 脚手架',
    hero: '欢迎使用 Foundation',
    subtitle: '一个干净的 Wails 3 + React 19 + MUI 基座。把这个页面替换为你的第一个功能，或者从修改 {{file}} 开始。',
    backendCard: {
      title: '后端往返调用',
      defaultResult: '请输入你的名字，然后点击「问候」👇',
      placeholder: '你的名字',
      submit: '问候',
      submitting: '问候中…',
      errorPrefix: '错误：',
    },
    childWindowCard: {
      title: '子窗口测试',
      description: '点击按钮打开不同类型的子窗口，测试窗口间通信。',
      confirmBtn: '确认窗口',
      messageBtn: '消息窗口',
      blankBtn: '空白窗口',
      resultPrefix: '子窗口返回：',
    },
    systrayCard: {
      title: '系统托盘',
      description: '启用系统托盘后，点击托盘图标会弹出 MUI 面板窗口。',
      enableBtn: '启用托盘',
      disableBtn: '禁用托盘',
      statusOn: '已启用',
      statusOff: '未启用',
    },
    footer: {
      backendTick: '后端心跳：{{time}}',
      poweredBy: '由 Wails 3 · React 19 · MUI 9 提供支持',
    },
  },
};
