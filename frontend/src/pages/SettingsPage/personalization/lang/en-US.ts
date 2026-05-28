import type { Messages } from '@/i18n';

export const personalizationEnUS: Messages = {
  settings: {
    personalization: {
      theme: {
        title: 'Theme',
        hint: 'Choose between light and dark. "Follow system" tracks your OS preference automatically.',
        currentLine: 'Currently active: {{label}}',
        followingSystem: ' (following system)',
      },
      preferences: {
        title: 'Display preferences',
        hint: 'Toggle visibility of UI elements; takes effect immediately.',
        showLogo: {
          label: 'Show Logo',
          description: 'The brand square at the top of the sidebar',
        },
        showTooltip: {
          label: 'Show menu tooltips',
          description: 'Show the name bubble when hovering over menu buttons',
        },
      },
      customTheme: {
        title: 'Custom theme',
        hint: 'Tweak the palette field by field. Once saved it appears in the theme list above ("Custom"). Click a swatch to open the system color picker; the text box accepts any CSS color value (#hex / rgb / rgba).',
        toolbar: {
          seedLight: 'Seed from "Light"',
          seedDark: 'Seed from "Dark"',
          seedObsidian: 'Seed from "Obsidian"',
          modeLight: 'Mode: Light (click to toggle)',
          modeDark: 'Mode: Dark (click to toggle)',
          remove: 'Remove custom theme',
        },
        notUsingHint: 'Note: you are using "{{label}}". Editing colors will switch to "Custom" automatically.',
        groups: {
          background: 'Background',
          text: 'Text',
          border: 'Border',
          accent: 'Accent',
          status: 'Status',
        },
        fields: {
          bg: {
            base: { label: 'Base background', description: 'Title bar / outermost layer' },
            sidebar: { label: 'Sidebar background' },
            content: { label: 'Content background' },
            surface: { label: 'Card surface', description: 'Paper / cards' },
            elevated: { label: 'Elevated layer', description: 'Inputs / raised surfaces' },
            hover: { label: 'Hover overlay', description: 'Translucent hover tint' },
            active: { label: 'Active overlay', description: 'Translucent selected tint' },
          },
          text: {
            primary: { label: 'Primary text' },
            secondary: { label: 'Secondary text' },
            muted: { label: 'Muted text', description: 'Hints / helper copy' },
          },
          divider: { label: 'Divider' },
          accent: { label: 'Accent' },
          accentHover: { label: 'Accent hover' },
          status: {
            danger: { label: 'Danger', description: 'Error / destructive' },
            success: { label: 'Success' },
            warning: { label: 'Warning' },
          },
        },
        a11y: {
          colorPickerFor: 'Color picker for {{label}}',
          colorValueFor: 'Color value for {{label}}',
        },
      },
    },
  },
};
