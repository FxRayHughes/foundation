import { Button, Text } from '@mantine/core';
import { IconEye, IconSettings } from '@tabler/icons-react';
import { useT } from '@/i18n';
import { broadcast, getWindowId } from '@/services/childwindow';
import classes from './QuickActions.module.css';

export const QuickActions = () => {
  const t = useT();

  const handleShowWindow = () => {
    broadcast({ from: getWindowId(), type: 'app:show-window' });
  };

  const handleOpenSettings = () => {
    broadcast({ from: getWindowId(), type: 'app:open-settings' });
  };

  return (
    <div className={classes.root}>
      <Text className={classes.sectionTitle}>{t('systray.quickActions.title')}</Text>
      <div className={classes.list}>
        <Button
          variant="subtle"
          size="xs"
          justify="flex-start"
          leftSection={<IconEye size={18} stroke={1.75} />}
          onClick={handleShowWindow}
          className={classes.action}
        >
          {t('systray.quickActions.showWindow')}
        </Button>
        <Button
          variant="subtle"
          size="xs"
          justify="flex-start"
          leftSection={<IconSettings size={18} stroke={1.75} />}
          onClick={handleOpenSettings}
          className={classes.action}
        >
          {t('systray.quickActions.openSettings')}
        </Button>
      </div>
    </div>
  );
};
