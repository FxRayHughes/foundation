import type { Messages } from '@/i18n';

// SettingsPage top-level English copy: only "frame" layer (eyebrow/title, list, themes).
// Per-subpage copy lives in SettingsPage/<name>/lang/ and is registered by register<Name>Locales.
export const settingsPageEnUS: Messages = {
  settings: {
    eyebrow: 'Settings',
    title: 'Preferences',
    list: {
      personalization: {
        label: 'Personalization',
        description: 'Theme, display preferences, and custom palette',
      },
      language: {
        label: 'Language',
        description: 'Switch the UI language',
      },
      database: {
        label: 'Data storage',
        description: 'Database location and disk usage',
      },
    },
    themes: {
      system: { label: 'Follow system', description: 'Tracks the OS light / dark preference' },
      light: { label: 'Light', description: 'Default white theme for daytime use' },
      dark: { label: 'Dark', description: 'Dim grey theme for low-light environments' },
      obsidian: { label: 'Obsidian', description: 'Pure black canvas with violet accent' },
      custom: { label: 'Custom', description: 'Your saved custom palette' },
    },
  },
};
