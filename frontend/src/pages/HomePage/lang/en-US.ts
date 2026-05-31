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
    childWindowCard: {
      title: 'Child Window Test',
      description: 'Click buttons to open different child windows and test inter-window communication.',
      confirmBtn: 'Confirm',
      messageBtn: 'Message',
      blankBtn: 'Blank',
      resultPrefix: 'Child returned: ',
    },
    systrayCard: {
      title: 'System Tray',
      description: 'Enable the system tray to show a MUI panel popup when clicking the tray icon.',
      enableBtn: 'Enable Tray',
      disableBtn: 'Disable Tray',
      statusOn: 'Enabled',
      statusOff: 'Disabled',
    },
    footer: {
      backendTick: 'Backend tick: {{time}}',
      poweredBy: 'Powered by Wails 3 · React 19 · MUI 9',
    },
  },
};
