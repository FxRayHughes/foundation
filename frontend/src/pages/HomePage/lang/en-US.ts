import type { Messages } from '@/i18n';

// HomePage English copy. Mounted under the `home.*` namespace.
export const homePageEnUS: Messages = {
  home: {
    eyebrow: 'Foundation Scaffold',
    hero: 'Welcome to Foundation',
    subtitle: 'A clean Wails 3 + React 19 + MUI base. Replace this page with your own first feature, or start by editing {{file}}.',
    backendCard: {
      title: 'Backend round-trip',
      defaultResult: 'Please enter your name and tap Greet 👇',
      placeholder: 'Your name',
      submit: 'Greet',
      submitting: 'Greeting…',
      errorPrefix: 'Error: ',
    },
    footer: {
      backendTick: 'Backend tick: {{time}}',
      poweredBy: 'Powered by Wails 3 · React 19 · MUI 9',
    },
  },
};
