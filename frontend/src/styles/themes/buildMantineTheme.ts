import {
  ActionIcon,
  Button,
  Card,
  createTheme,
  Input,
  mergeThemeOverrides,
  Menu,
  Paper,
  Popover,
  Tooltip,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  type MantineThemeOverride,
} from '@mantine/core';
import classes from './mantineComponents.module.css';
import type { FoundationPalette, FoundationThemePreset } from './types';

// ============================================================================
// Foundation × Mantine 主题编译
// ============================================================================
//
// 1. FoundationPalette → CSS 变量 --fd-*（由 cssVariablesResolver 注入 :root）
//    组件样式（*.module.css）一律写 var(--fd-xxx)，主题切换零重渲染、零硬编码。
// 2. accent → Mantine 'foundation' 10 级色阶，并设为 primaryColor，
//    这样 <Button> / <Switch> / <Checkbox> / 焦点环等 Mantine 原生组件自动跟随强调色。
// 3. Mantine 自身的语义色（body / text / dimmed / border / default）全部映射到 --fd-*，
//    保证没写样式的 Mantine 组件也和三套预设一致。

const FONT_STACK = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// FoundationPalette 的 CSS 变量名对照表。
// JS 侧需要"引用而非取值"时用它（例如 @mantine/charts 的 color、内联 style）：
//   <BarChart series={[{ name: 'v', color: FOUNDATION_CSS_VARS.accent }]} />
export const FOUNDATION_CSS_VARS = {
  bg: {
    base: 'var(--fd-bg-base)',
    sidebar: 'var(--fd-bg-sidebar)',
    content: 'var(--fd-bg-content)',
    surface: 'var(--fd-bg-surface)',
    elevated: 'var(--fd-bg-elevated)',
    hover: 'var(--fd-bg-hover)',
    active: 'var(--fd-bg-active)',
  },
  text: {
    primary: 'var(--fd-text-primary)',
    secondary: 'var(--fd-text-secondary)',
    muted: 'var(--fd-text-muted)',
  },
  divider: 'var(--fd-divider)',
  accent: 'var(--fd-accent)',
  accentHover: 'var(--fd-accent-hover)',
  status: {
    danger: 'var(--fd-danger)',
    success: 'var(--fd-success)',
    warning: 'var(--fd-warning)',
  },
} as const satisfies FoundationPalette;

const paletteToCssVars = (p: FoundationPalette): Record<string, string> => ({
  '--fd-bg-base': p.bg.base,
  '--fd-bg-sidebar': p.bg.sidebar,
  '--fd-bg-content': p.bg.content,
  '--fd-bg-surface': p.bg.surface,
  '--fd-bg-elevated': p.bg.elevated,
  '--fd-bg-hover': p.bg.hover,
  '--fd-bg-active': p.bg.active,
  '--fd-text-primary': p.text.primary,
  '--fd-text-secondary': p.text.secondary,
  '--fd-text-muted': p.text.muted,
  '--fd-divider': p.divider,
  '--fd-accent': p.accent,
  '--fd-accent-hover': p.accentHover,
  '--fd-danger': p.status.danger,
  '--fd-success': p.status.success,
  '--fd-warning': p.status.warning,
});

// Mantine 内置语义色 → Foundation 变量
const mantineSemanticVars = (): Record<string, string> => ({
  '--mantine-color-body': 'var(--fd-bg-content)',
  '--mantine-color-text': 'var(--fd-text-primary)',
  '--mantine-color-dimmed': 'var(--fd-text-secondary)',
  '--mantine-color-placeholder': 'var(--fd-text-muted)',
  '--mantine-color-default': 'var(--fd-bg-elevated)',
  '--mantine-color-default-hover': 'var(--fd-bg-hover)',
  '--mantine-color-default-color': 'var(--fd-text-primary)',
  '--mantine-color-default-border': 'var(--fd-divider)',
  '--mantine-color-error': 'var(--fd-danger)',
  '--mantine-color-anchor': 'var(--fd-accent)',
});

export const buildCssVariablesResolver =
  (preset: FoundationThemePreset): CSSVariablesResolver =>
  () => {
    const scheme = { ...paletteToCssVars(preset.palette), ...mantineSemanticVars() };
    // forceColorScheme 下只会命中其中一套，两边写同样的值即可
    return { variables: {}, light: scheme, dark: scheme };
  };

// ---------- accent → 10 级色阶 ----------

type RGB = [number, number, number];

const parseHex = (hex: string): RGB | null => {
  const raw = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())?.[1];
  if (!raw) return null;
  const h = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};

const toHex = ([r, g, b]: RGB): string =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

const mix = (c: RGB, target: RGB, amount: number): string =>
  toHex(c.map((v, i) => v + ((target[i] ?? v) - v) * amount) as RGB);

// shade 6 = accent（primaryShade），shade 7 = accentHover（Mantine 的 filled-hover 取 primaryShade+1）
const accentTuple = (accent: string, accentHover: string): MantineColorsTuple => {
  const rgb = parseHex(accent);
  if (!rgb) {
    return [accent, accent, accent, accent, accent, accent, accent, accentHover, accentHover, accentHover];
  }
  const white: RGB = [255, 255, 255];
  const black: RGB = [0, 0, 0];
  return [
    mix(rgb, white, 0.9),
    mix(rgb, white, 0.75),
    mix(rgb, white, 0.6),
    mix(rgb, white, 0.45),
    mix(rgb, white, 0.3),
    mix(rgb, white, 0.15),
    toHex(rgb),
    parseHex(accentHover) ? accentHover : mix(rgb, black, 0.1),
    mix(rgb, black, 0.2),
    mix(rgb, black, 0.3),
  ];
};

// 把 FoundationThemePreset 编译为 Mantine theme override。
// 组件级默认值 / 样式覆盖集中在这里 + mantineComponents.module.css，
// 业务组件不需要重复声明。
export const buildMantineTheme = (preset: FoundationThemePreset): MantineThemeOverride => {
  const { palette, mantineOverrides } = preset;

  const base = createTheme({
    primaryColor: 'foundation',
    primaryShade: 6,
    colors: {
      foundation: accentTuple(palette.accent, palette.accentHover),
    },
    white: '#ffffff',
    fontFamily: FONT_STACK,
    headings: { fontFamily: FONT_STACK, fontWeight: '600' },
    fontSizes: { xs: '12px', sm: '13px', md: '14px', lg: '16px', xl: '18px' },
    // 圆角语言：默认 4px（sm），容器 8px（md），大按钮 / 卡片可用 12px（lg）
    radius: { xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px' },
    defaultRadius: 'sm',
    cursorType: 'pointer',
    focusRing: 'auto',
    components: {
      Button: Button.extend({
        classNames: { root: classes.button },
      }),
      ActionIcon: ActionIcon.extend({
        defaultProps: { variant: 'subtle' },
        classNames: { root: classes.actionIcon },
      }),
      Paper: Paper.extend({ classNames: { root: classes.surface } }),
      Card: Card.extend({ classNames: { root: classes.surface } }),
      Popover: Popover.extend({ classNames: { dropdown: classes.dropdown } }),
      Menu: Menu.extend({ classNames: { dropdown: classes.dropdown, item: classes.menuItem } }),
      Input: Input.extend({ classNames: { input: classes.input } }),
      Tooltip: Tooltip.extend({
        defaultProps: { withArrow: true, openDelay: 300 },
        classNames: { tooltip: classes.tooltip },
      }),
    },
    other: { foundation: palette },
  });

  return mantineOverrides ? mergeThemeOverrides(base, mantineOverrides) : base;
};
