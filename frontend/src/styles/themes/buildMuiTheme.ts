import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import type { FoundationPalette, FoundationThemePreset } from './types';

// 把 foundation 字段挂到 MUI 类型系统上：
// 这样在任何组件里都能 theme.palette.foundation.bg.surface 取色。
declare module '@mui/material/styles' {
  interface Palette {
    foundation: FoundationPalette;
  }
  interface PaletteOptions {
    foundation?: FoundationPalette;
  }
}

const FONT_STACK = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// 把 FoundationThemePreset 编译为完整的 MUI Theme。
// MUI palette、components 全套覆盖都在这里集中应用，
// 调用方只需要决定 palette 颜色与 mode，不需要重复声明组件覆盖。
export const buildMuiTheme = (preset: FoundationThemePreset): Theme => {
  const { palette, mode, muiOverrides } = preset;

  const base: ThemeOptions = {
    palette: {
      mode,
      foundation: palette,
      primary: { main: palette.accent, dark: palette.accentHover, contrastText: '#fff' },
      error: { main: palette.status.danger },
      success: { main: palette.status.success },
      warning: { main: palette.status.warning },
      background: { default: palette.bg.content, paper: palette.bg.surface },
      text: {
        primary: palette.text.primary,
        secondary: palette.text.secondary,
        disabled: palette.text.muted,
      },
      divider: palette.divider,
    },
    typography: {
      fontFamily: FONT_STACK,
      fontSize: 14,
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': { colorScheme: mode },
          body: {
            margin: 0,
            padding: 0,
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: palette.bg.content,
            color: palette.text.primary,
            fontFamily: FONT_STACK,
            userSelect: 'none',
            WebkitFontSmoothing: 'antialiased',
          },
          '#root': {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: palette.divider,
            borderRadius: 4,
          },
          '*::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 4,
            minHeight: 32,
            padding: '6px 14px',
            fontWeight: 500,
            transition: 'background-color 120ms ease, transform 120ms ease',
            '&:active': { transform: 'translateY(1px)' },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            color: palette.text.secondary,
            backgroundColor: 'transparent', // 扁平化默认：无底色，hover 才出现
            transition: 'background-color 120ms ease, color 120ms ease',
            '&:hover': {
              backgroundColor: palette.bg.hover,
              color: palette.text.primary,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 4,
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: palette.bg.elevated,
            '& fieldset': { borderColor: palette.divider },
            '&:hover fieldset': { borderColor: palette.accent },
            '&.Mui-focused fieldset': { borderColor: palette.accent },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: palette.bg.base,
            color: palette.text.primary,
            border: `1px solid ${palette.divider}`,
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 4,
            padding: '6px 10px',
          },
        },
      },
    },
  };

  // createTheme 第二参数支持深合并，preset 可以微调任意 MUI 选项。
  return muiOverrides ? createTheme(base, muiOverrides) : createTheme(base);
};
