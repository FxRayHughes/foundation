import { Box, ButtonBase, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { useLanguage } from './useLanguage';
import { languageStyles } from './Language.styles';
import { settingsPageStyles } from '../SettingsPage.styles';

// 语言子页面：选项卡片切换 + 当前语言展示。
// 文案 namespace：settings.language.*
export const Language = () => {
  const theme = useTheme();
  const shared = settingsPageStyles(theme);
  const styles = languageStyles(theme);
  const vm = useLanguage();
  const t = useT();

  return (
    <Box sx={shared.section}>
      <Box sx={shared.sectionHeader}>
        <Typography sx={shared.sectionTitle}>{t('settings.language.title')}</Typography>
        <Typography sx={shared.sectionHint}>{t('settings.language.hint')}</Typography>
      </Box>
      <Box sx={styles.grid}>
        {vm.options.map((option) => {
          const active = option.value === vm.choice;
          const label = option.labelKey ? t(option.labelKey) : option.fallbackLabel;
          const desc = option.descriptionKey
            ? t(option.descriptionKey)
            : option.fallbackDescription;
          return (
            <ButtonBase
              key={option.value}
              onClick={() => vm.setChoice(option.value)}
              sx={active ? styles.cardActive : styles.card}
              aria-pressed={active}
            >
              <Typography sx={styles.cardLabel}>{label}</Typography>
              <Typography sx={styles.cardDesc}>{desc}</Typography>
            </ButtonBase>
          );
        })}
      </Box>
      <Typography sx={styles.currentLine}>
        {t('settings.language.currentLine', { label: vm.currentLabel })}
      </Typography>
    </Box>
  );
};
