import type { CSSProperties } from 'react';
import { ActionIcon } from '@mantine/core';
import { IconMinus, IconSquare, IconX } from '@tabler/icons-react';
import { useT } from '@/i18n';
import { useWindowControls } from './useWindowControls';
import classes from './TitleBar.module.css';

// 窗口三联按钮：Fluent caption button（46×36、0 圆角、透明），等距排列。
// 关闭键 hover 变红，最小化/最大化保持中性灰。
// 通过 --wails-draggable: no-drag 阻止拖拽穿透。
// aria-label 走 i18n（titleBar.controls.*），系统按钮不应硬编码语言。
export const WindowControls = () => {
  const t = useT();
  const { minimise, toggleMaximise, close } = useWindowControls();

  return (
    <div className={classes.controls} style={{ '--wails-draggable': 'no-drag' } as CSSProperties}>
      <ActionIcon
        onClick={minimise}
        className={classes.controlBtn}
        aria-label={t('titleBar.controls.minimise')}
      >
        <IconMinus size={14} stroke={1.75} />
      </ActionIcon>
      <ActionIcon
        onClick={toggleMaximise}
        className={classes.controlBtn}
        aria-label={t('titleBar.controls.maximise')}
      >
        <IconSquare size={14} stroke={1.75} />
      </ActionIcon>
      <ActionIcon
        onClick={close}
        className={classes.closeBtn}
        aria-label={t('titleBar.controls.close')}
      >
        <IconX size={14} stroke={1.75} />
      </ActionIcon>
    </div>
  );
};
