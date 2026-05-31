import type { SxProps, Theme } from '@mui/material';

export const childTitleBarStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: {
      height: 32,
      minHeight: 32,
      display: 'flex',
      alignItems: 'center',
      pl: 1.5,
      pr: 0,
      backgroundColor: fp.bg.base,
      borderBottom: `1px solid ${fp.divider}`,
      flexShrink: 0,
    },
    title: {
      fontSize: 12,
      fontWeight: 500,
      color: fp.text.secondary,
      userSelect: 'none',
    },
    spacer: {
      flex: 1,
    },
    closeBtn: {
      width: 40,
      height: 32,
      borderRadius: 0,
      fontSize: 13,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: fp.text.secondary,
      '&:hover': {
        backgroundColor: fp.status.danger,
        color: '#fff',
      },
    },
  };
};
