import type { SxProps, Theme } from '@mui/material';

export const createStyles = (theme: Theme): Record<string, SxProps<Theme>> => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
  },
  pinnedTop: {
    borderBottom: `2px solid ${theme.palette.divider}`,
    '& .MuiDataGrid-root': {
      border: 'none',
    },
  },
  pinnedBottom: {
    borderTop: `2px solid ${theme.palette.divider}`,
    '& .MuiDataGrid-root': {
      border: 'none',
    },
  },
  mainSection: {
    flex: 1,
    overflow: 'hidden',
    '& .MuiDataGrid-root': {
      border: 'none',
    },
  },
  sentinel: {
    height: 1,
    width: '100%',
  },
  loadingIndicator: {
    display: 'flex',
    justifyContent: 'center',
    py: 1,
  },
});
