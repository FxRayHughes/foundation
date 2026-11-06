import { Button, Text } from '@mantine/core';
import { IconHelpCircle } from '@tabler/icons-react';
import { useT } from '@/i18n';
import { ChildTitleBar } from '@/components/ChildTitleBar';
import { useConfirmWindow } from './useConfirmWindow';
import classes from './ConfirmWindow.module.css';

export const ConfirmWindow = () => {
  const t = useT();
  const { params, handleConfirm, handleCancel } = useConfirmWindow();

  return (
    <div className={classes.root}>
      <ChildTitleBar title={params.title || t('childwindow.confirm.defaultTitle')} onClose={handleCancel} />
      <div className={classes.body}>
        <IconHelpCircle size={36} stroke={1.75} className={classes.icon} />
        <Text className={classes.message}>{params.message}</Text>
      </div>
      <div className={classes.actions}>
        <Button variant="outline" className={classes.button} onClick={handleCancel}>
          {t('childwindow.confirm.cancelBtn')}
        </Button>
        <Button variant="filled" className={classes.button} onClick={handleConfirm}>
          {t('childwindow.confirm.confirmBtn')}
        </Button>
      </div>
    </div>
  );
};
