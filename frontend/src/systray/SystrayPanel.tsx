import { Text } from '@mantine/core';
import { useT } from '@/i18n';
import { useSystrayPanel } from './useSystrayPanel';
import classes from './SystrayPanel.module.css';

export const SystrayPanel = () => {
  const t = useT();
  const { modules } = useSystrayPanel();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Text className={classes.appName}>{t('systray.appName')}</Text>
      </div>
      <div className={classes.content}>
        {modules.map((mod) => (
          <div key={mod.id}>
            <mod.component />
          </div>
        ))}
      </div>
    </div>
  );
};
