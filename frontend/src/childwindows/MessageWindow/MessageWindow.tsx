import { Box, Button, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { ChildTitleBar } from '@/components/ChildTitleBar';
import { useMessageWindow } from './useMessageWindow';
import { messageWindowStyles } from './MessageWindow.styles';

export function MessageWindow() {
  const theme = useTheme();
  const t = useT();
  const { title, message, icon: Icon, iconColor, handleOk } = useMessageWindow();
  const styles = messageWindowStyles(theme);
  const fp = theme.palette.foundation;

  const resolvedTitle = title || t('childwindow.message.defaultTitle');
  const color = iconColor(fp as unknown as Record<string, unknown>);

  return (
    <Box sx={styles.root}>
      <ChildTitleBar title={resolvedTitle} onClose={handleOk} />
      <Box sx={styles.body}>
        <Icon sx={{ fontSize: 36, color }} />
        <Typography sx={styles.message}>{message}</Typography>
      </Box>
      <Box sx={styles.actions}>
        <Button
          variant="contained"
          size="small"
          sx={styles.button}
          onClick={handleOk}
        >
          {t('childwindow.message.okBtn')}
        </Button>
      </Box>
    </Box>
  );
}
