import type { CSSProperties } from 'react';
import { ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { Window } from '@wailsio/runtime';
import { useT } from '@/i18n';
import classes from './ChildTitleBar.module.css';

export interface ChildTitleBarProps {
  title?: string;
  onClose?: () => void;
}

export const ChildTitleBar = ({ title, onClose }: ChildTitleBarProps) => {
  const t = useT();
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      Window.Close();
    }
  };

  return (
    <div className={classes.root} style={{ '--wails-draggable': 'drag' } as CSSProperties}>
      <span className={classes.title}>{title}</span>
      <div className={classes.spacer} />
      <div style={{ '--wails-draggable': 'no-drag' } as CSSProperties}>
        <ActionIcon
          onClick={handleClose}
          className={classes.closeBtn}
          aria-label={t('titleBar.controls.close')}
        >
          <IconX size={13} stroke={1.75} />
        </ActionIcon>
      </div>
    </div>
  );
};
