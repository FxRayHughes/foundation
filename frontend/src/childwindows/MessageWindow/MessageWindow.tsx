import { Button, Text } from '@mantine/core';
import { useT } from '@/i18n';
import { ChildTitleBar } from '@/components/ChildTitleBar';
import { useMessageWindow } from './useMessageWindow';
import classes from './MessageWindow.module.css';

export function MessageWindow() {
  const t = useT();
  const { title, message, icon: Icon, iconColor, handleOk } = useMessageWindow();

  const resolvedTitle = title || t('childwindow.message.defaultTitle');

  return (
    <div className={classes.root}>
      <ChildTitleBar title={resolvedTitle} onClose={handleOk} />
      <div className={classes.body}>
        <Icon size={36} stroke={1.75} className={classes.icon} style={{ color: iconColor }} />
        <Text className={classes.message}>{message}</Text>
      </div>
      <div className={classes.actions}>
        <Button variant="filled" size="xs" className={classes.button} onClick={handleOk}>
          {t('childwindow.message.okBtn')}
        </Button>
      </div>
    </div>
  );
}
