import { Box, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const Notifications = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const t = useT();

  return (
    <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${fp.divider}`, flex: 1 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: fp.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
        {t('systray.notifications.title')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
        <Typography sx={{ fontSize: 12, color: fp.text.muted }}>
          {t('systray.notifications.empty')}
        </Typography>
      </Box>
    </Box>
  );
};
