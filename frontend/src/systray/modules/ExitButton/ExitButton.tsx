import { Box, Button, useTheme } from '@mui/material';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import { Application } from '@wailsio/runtime';
import { useT } from '@/i18n';

export const ExitButton = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const t = useT();

  return (
    <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${fp.divider}` }}>
      <Button
        fullWidth
        size="small"
        startIcon={<PowerSettingsNewRoundedIcon />}
        onClick={() => Application.Quit()}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          color: fp.status.danger,
          borderRadius: 1.5,
          '&:hover': { backgroundColor: `${fp.status.danger}14` },
        }}
      >
        {t('systray.exit.label')}
      </Button>
    </Box>
  );
};
