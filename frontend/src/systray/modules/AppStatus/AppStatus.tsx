import { Box, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const AppStatus = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const t = useT();

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: fp.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
        {t('systray.appStatus.title')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: fp.status.success }} />
        <Typography sx={{ fontSize: 13, color: fp.text.primary }}>
          {t('systray.appStatus.running')}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 12, color: fp.text.muted, mt: 0.5 }}>
        {t('systray.appStatus.version')} 1.0.0
      </Typography>
    </Box>
  );
};
