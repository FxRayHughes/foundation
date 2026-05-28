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
    footer: {
      backendTick: '后端心跳：{{time}}',
      poweredBy: '由 Wails 3 · React 19 · MUI 9 提供支持',
    },
  },
};
