import { Box, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { useSystrayPanel } from './useSystrayPanel';
import { systrayPanelStyles } from './SystrayPanel.styles';

export const SystrayPanel = () => {
  const theme = useTheme();
  const styles = systrayPanelStyles(theme);
  const t = useT();
  const { modules } = useSystrayPanel();

  return (
    <Box sx={styles.root}>
      <Box sx={styles.header}>
        <Typography sx={styles.appName}>{t('systray.appName')}</Typography>
      </Box>
      <Box sx={styles.content}>
        {modules.map((mod) => (
          <Box key={mod.id}>
            <mod.component />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
