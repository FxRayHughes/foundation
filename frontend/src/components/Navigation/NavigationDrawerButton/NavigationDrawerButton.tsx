import { ActionIcon, Drawer, Tooltip } from '@mantine/core';
import { IconMenu2 } from '@tabler/icons-react';
import { useT } from '@/i18n';
import { NavSidebar } from '../NavSidebar';
import { useNavigationDrawerButton } from './useNavigationDrawerButton';
import classes from './NavigationDrawerButton.module.css';

// 标题栏菜单按钮（"专注"布局）：点击从左侧滑出抽屉，内含完整导航（展开侧栏的抽屉模式）。
// 抽屉在 选择条目 / Esc / 点击遮罩 / 关闭按钮 时关闭。
export const NavigationDrawerButton = () => {
  const { opened, open, close, showTooltip } = useNavigationDrawerButton();
  const t = useT();
  const label = t('sidebar.openMenu');

  return (
    <>
      <Tooltip label={label} position="bottom" disabled={!showTooltip}>
        <ActionIcon
          className={classes.button}
          onClick={open}
          aria-label={label}
          aria-expanded={opened}
          aria-haspopup="dialog"
        >
          <IconMenu2 size={18} stroke={1.75} />
        </ActionIcon>
      </Tooltip>
      <Drawer
        opened={opened}
        onClose={close}
        position="left"
        size={240}
        withCloseButton={false}
        closeOnEscape
        closeOnClickOutside
        classNames={{ content: classes.content, body: classes.body }}
      >
        <NavSidebar onClose={close} />
      </Drawer>
    </>
  );
};
