import type { Messages } from '@/i18n';

export const layoutEnUS: Messages = {
  settings: {
    layout: {
      title: 'Layout presets',
      hint: 'Choose the grid layout of the app shell. Applies instantly — navigation position, shape and content frame change together.',
      currentLine: 'Current layout: {{label}}',
      presets: {
        classic: { label: 'Classic', description: 'Left icon rail, compact and dense (default)' },
        sidebar: { label: 'Sidebar', description: 'Left sidebar with icons and labels, collapsible to a rail' },
        topnav: { label: 'Top navigation', description: 'Horizontal navigation bar below the title bar' },
        titlebar: { label: 'Merged title bar', description: 'Navigation embedded in the title bar to save vertical space' },
        right: { label: 'Right rail', description: 'Icon rail on the right side of the window' },
        dock: { label: 'Bottom dock', description: 'Floating dock centered at the bottom of the content' },
        floating: { label: 'Floating dock', description: 'Vertical dock floating on the right — drag it anywhere, snaps to either edge' },
        inset: { label: 'Inset card', description: 'Sidebar plus a floating, rounded content card' },
        focus: { label: 'Focus', description: 'No persistent navigation; the title-bar menu opens a drawer' },
      },
      nav: {
        title: 'Navigation options',
        hint: 'Fine-tune how navigation behaves.',
        collapsed: {
          label: 'Collapse sidebar by default',
          description: 'Only affects layouts that use the expanded sidebar (Sidebar / Inset card): collapses it to an icon rail.',
        },
        collapsedInactive: 'The current layout has no expanded sidebar; this option takes effect after switching to one that does.',
        moreInPersonalization: '"Show Logo" and "Show menu tooltips" live under Personalization → Display preferences.',
      },
    },
  },
};
