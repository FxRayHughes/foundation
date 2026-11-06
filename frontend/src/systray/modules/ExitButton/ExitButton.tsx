import { Button } from '@mantine/core';
import { IconPower } from '@tabler/icons-react';
import { Application } from '@wailsio/runtime';
import { useT } from '@/i18n';
import classes from './ExitButton.module.css';

export const ExitButton = () => {
  const t = useT();

  return (
    <div className={classes.root}>
      <Button
        fullWidth
        variant="subtle"
        size="xs"
        justify="flex-start"
        leftSection={<IconPower size={18} stroke={1.75} />}
        onClick={() => Application.Quit()}
        className={classes.exit}
      >
        {t('systray.exit.label')}
      </Button>
    </div>
  );
};
