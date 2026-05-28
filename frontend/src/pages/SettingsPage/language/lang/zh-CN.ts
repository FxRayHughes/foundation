import type { Messages } from '@/i18n';

export const languageZhCN: Messages = {
  settings: {
    language: {
      title: '语言',
      hint: '切换界面语言，立即生效；选择"跟随系统"会按浏览器偏好自动选定。',
      auto: {
        label: '跟随系统',
        description: '使用浏览器 / 操作系统的语言设置',
      },
      currentLine: '当前生效：{{label}}',
    },
  },
};
