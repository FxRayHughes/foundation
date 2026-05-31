import { Box, Button, Typography, useTheme } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useT } from '@/i18n';
import { ChildTitleBar } from '@/components/ChildTitleBar';
import { useConfirmWindow } from './useConfirmWindow';
import { confirmWindowStyles } from './ConfirmWindow.styles';

export const ConfirmWindow = () => {
  const theme = useTheme();
  const styles = confirmWindowStyles(theme);
  const t = useT();
  const { params, handleConfirm, handleCancel } = useConfirmWindow();

  return (
    <Box sx={styles.root}>
      <ChildTitleBar title={params.title || t('childwindow.confirm.defaultTitle')} onClose={handleCancel} />
      <Box sx={styles.body}>
        <HelpOutlineRoundedIcon sx={styles.icon} />
        <Typography sx={styles.message}>
          {params.message}
        </Typography>
      </Box>
      <Box sx={styles.actions}>
        <Button variant="outlined" sx={styles.button} onClick={handleCancel}>
          {t('childwindow.confirm.cancelBtn')}
        </Button>
        <Button variant="contained" sx={styles.button} onClick={handleConfirm}>
          {t('childwindow.confirm.confirmBtn')}
        </Button>
      </Box>
    </Box>
  );
};
