import type { Messages } from '@/i18n';

export const languageEnUS: Messages = {
  settings: {
    language: {
      title: 'Language',
      hint: 'Switch the UI language, takes effect immediately. "Auto" follows the browser preference.',
      auto: {
        label: 'Auto',
        description: 'Use the browser / OS language setting',
      },
      currentLine: 'Currently active: {{label}}',
    },
  },
};
