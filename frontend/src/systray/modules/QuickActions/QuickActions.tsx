import { Box, Button, Typography, useTheme } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useT } from '@/i18n';
import { broadcast, getWindowId } from '@/services/childwindow';

export const QuickActions = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const t = useT();

  const handleShowWindow = () => {
    broadcast({ from: getWindowId(), type: 'app:show-window' });
  };

  const handleOpenSettings = () => {
    broadcast({ from: getWindowId(), type: 'app:open-settings' });
  };

  return (
    <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${fp.divider}` }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: fp.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
        {t('systray.quickActions.title')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Button
          size="small"
          startIcon={<VisibilityRoundedIcon />}
          onClick={handleShowWindow}
          sx={{ justifyContent: 'flex-start', textTransform: 'none', color: fp.text.primary, borderRadius: 1.5, '&:hover': { backgroundColor: fp.bg.hover } }}
        >
          {t('systray.quickActions.showWindow')}
        </Button>
        <Button
          size="small"
          startIcon={<SettingsRoundedIcon />}
          onClick={handleOpenSettings}
          sx={{ justifyContent: 'flex-start', textTransform: 'none', color: fp.text.primary, borderRadius: 1.5, '&:hover': { backgroundColor: fp.bg.hover } }}
        >
          {t('systray.quickActions.openSettings')}
        </Button>
      </Box>
    </Box>
  );
};
