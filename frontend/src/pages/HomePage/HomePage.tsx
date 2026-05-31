import { Box, Button, TextField, Typography, useTheme } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import { useT } from '@/i18n';
import { useHomePage } from './useHomePage';
import { homePageStyles } from './HomePage.styles';

// Home 页面：脚手架占位首页 —— 只演示 Greet 调用 + time 事件订阅。
// 所有人类可见文本必须走 t() —— 不允许在 JSX 里硬编码中/英文。
export const HomePage = () => {
  const theme = useTheme();
  const styles = homePageStyles(theme);
  const t = useT();
  const { name, setName, result, time, loading, error, greet, openConfirm, openMessage, openBlank, childResult, systrayEnabled, toggleSystray } = useHomePage();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void greet();
  };

  return (
    <Box sx={styles.root}>
      <Box sx={styles.body}>
        <Typography sx={styles.eyebrow}>{t('home.eyebrow')}</Typography>
        <Typography component="h1" sx={styles.hero}>
          {t('home.hero')}
        </Typography>
        <Typography sx={styles.subtitle}>
          {t('home.subtitle', { file: 'internal/services/greet/greet.go' })}
        </Typography>

        <Box sx={styles.card}>
          <Typography sx={styles.cardTitle}>{t('home.backendCard.title')}</Typography>
          <Typography sx={styles.result}>{result ?? t('home.backendCard.defaultResult')}</Typography>
          <Box component="form" sx={styles.form} onSubmit={onSubmit}>
            <TextField
              sx={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('home.backendCard.placeholder')}
              autoComplete="off"
              disabled={loading}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? t('home.backendCard.submitting') : t('home.backendCard.submit')}
            </Button>
          </Box>
          {error && (
            <Typography sx={styles.error}>
              {t('home.backendCard.errorPrefix')}{error}
            </Typography>
          )}
        </Box>

        <Box sx={styles.card}>
          <Typography sx={styles.cardTitle}>{t('home.childWindowCard.title')}</Typography>
          <Typography sx={{ fontSize: 13, color: theme.palette.foundation.text.secondary }}>
            {t('home.childWindowCard.description')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            <Button variant="outlined" size="small" startIcon={<OpenInNewRoundedIcon />} onClick={() => void openConfirm()}>
              {t('home.childWindowCard.confirmBtn')}
            </Button>
            <Button variant="outlined" size="small" startIcon={<OpenInNewRoundedIcon />} onClick={() => void openMessage()}>
              {t('home.childWindowCard.messageBtn')}
            </Button>
            <Button variant="outlined" size="small" startIcon={<OpenInNewRoundedIcon />} onClick={() => void openBlank()}>
              {t('home.childWindowCard.blankBtn')}
            </Button>
          </Box>
          {childResult && (
            <Typography sx={{ fontSize: 13, color: theme.palette.foundation.accent, mt: 1 }}>
              {t('home.childWindowCard.resultPrefix')}{childResult}
            </Typography>
          )}
        </Box>

        <Box sx={styles.card}>
          <Typography sx={styles.cardTitle}>{t('home.systrayCard.title')}</Typography>
          <Typography sx={{ fontSize: 13, color: theme.palette.foundation.text.secondary }}>
            {t('home.systrayCard.description')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
            <Button
              variant={systrayEnabled ? 'contained' : 'outlined'}
              size="small"
              color={systrayEnabled ? 'error' : 'primary'}
              startIcon={<NotificationsActiveRoundedIcon />}
              onClick={() => void toggleSystray()}
            >
              {systrayEnabled ? t('home.systrayCard.disableBtn') : t('home.systrayCard.enableBtn')}
            </Button>
            <Typography sx={{ fontSize: 12, color: theme.palette.foundation.text.muted }}>
              {systrayEnabled ? t('home.systrayCard.statusOn') : t('home.systrayCard.statusOff')}
            </Typography>
          </Box>
        </Box>

        <Box sx={styles.footer}>
          <Typography variant="inherit">
            {t('home.footer.backendTick', { time: time || '—' })}
          </Typography>
          <Typography variant="inherit">{t('home.footer.poweredBy')}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
