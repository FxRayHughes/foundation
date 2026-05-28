import { Box, ButtonBase, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { settingsPageStyles } from './SettingsPage.styles';
import { useSettingsPage } from './useSettingsPage';
import { Personalization } from './personalization';
import { Language } from './language';
import { Database } from './database';

// 设置页（两列）：
//   左列：选项列表（personalization / language / database）
//   右列：根据 activeItemId 分发到对应子页面组件
//
// 每个子页面是一个独立目录（personalization / language / database），
// 内部包含 View / VM / Style / lang。SettingsPage 仅做"框架 + 分发"，
// 不感知子页面的业务细节。
export const SettingsPage = () => {
  const theme = useTheme();
  const styles = settingsPageStyles(theme);
  const vm = useSettingsPage();
  const t = useT();

  return (
    <Box sx={styles.root}>
      {/* 左列：选项列表 */}
      <Box sx={styles.list} aria-label={t('settings.title')}>
        <Box sx={styles.listHeader}>
          <Typography sx={styles.listEyebrow}>{t('settings.eyebrow')}</Typography>
          <Typography sx={styles.listTitle}>{t('settings.title')}</Typography>
        </Box>
        <Box sx={styles.listItems}>
          {vm.items.map((item) => {
            const isActive = item.id === vm.activeItemId;
            return (
              <ButtonBase
                key={item.id}
                onClick={() => vm.setActiveItemId(item.id)}
                sx={isActive ? styles.listItemActive : styles.listItem}
                aria-pressed={isActive}
              >
                {isActive && <Box sx={styles.listItemIndicator} aria-hidden />}
                <Typography sx={styles.listItemLabel}>{t(item.labelKey)}</Typography>
                <Typography sx={styles.listItemDesc}>{t(item.descriptionKey)}</Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {/* 右列：详细配置 */}
      <Box sx={styles.detail}>
        <Box sx={styles.detailHeader}>
          <Typography sx={styles.detailEyebrow}>{t(vm.activeItem.labelKey)}</Typography>
          <Typography component="h1" sx={styles.detailTitle}>
            {t(vm.activeItem.labelKey)}
          </Typography>
          <Typography sx={styles.detailDesc}>{t(vm.activeItem.descriptionKey)}</Typography>
        </Box>

        {vm.activeItem.id === 'personalization' && <Personalization />}
        {vm.activeItem.id === 'language' && <Language />}
        {vm.activeItem.id === 'database' && <Database />}
      </Box>
    </Box>
  );
};
