import { Text } from '@mantine/core';
import { useT } from '@/i18n';
import classes from './AppStatus.module.css';

export const AppStatus = () => {
  const t = useT();

  return (
    <div className={classes.root}>
      <Text className={classes.sectionTitle}>{t('systray.appStatus.title')}</Text>
      <div className={classes.statusRow}>
        <div className={classes.dot} />
        <Text className={classes.statusText}>{t('systray.appStatus.running')}</Text>
      </div>
      <Text className={classes.version}>
        {t('systray.appStatus.version')} {__APP_VERSION__}
      </Text>
    </div>
  );
};
