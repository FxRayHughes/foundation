import { Text } from '@mantine/core';
import { useT } from '@/i18n';
import classes from './Notifications.module.css';

export const Notifications = () => {
  const t = useT();

  return (
    <div className={classes.root}>
      <Text className={classes.sectionTitle}>{t('systray.notifications.title')}</Text>
      <div className={classes.empty}>
        <Text className={classes.emptyText}>{t('systray.notifications.empty')}</Text>
      </div>
    </div>
  );
};
