import { Box, IconButton, Typography, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Window } from '@wailsio/runtime';
import { childTitleBarStyles } from './ChildTitleBar.styles';

export interface ChildTitleBarProps {
  title?: string;
  onClose?: () => void;
}

export const ChildTitleBar = ({ title, onClose }: ChildTitleBarProps) => {
  const theme = useTheme();
  const styles = childTitleBarStyles(theme);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      Window.Close();
    }
  };

  return (
    <Box sx={styles.root} style={{ '--wails-draggable': 'drag' } as React.CSSProperties}>
      <Typography variant="caption" sx={styles.title}>
        {title}
      </Typography>
      <Box sx={styles.spacer} />
      <Box style={{ '--wails-draggable': 'no-drag' } as React.CSSProperties}>
        <IconButton size="small" onClick={handleClose} sx={styles.closeBtn}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Box>
  );
};
