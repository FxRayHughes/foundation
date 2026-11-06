import { ActionIcon, Box, Tooltip, UnstyledButton } from '@mantine/core';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconX,
} from '@tabler/icons-react';
import { useT } from '@/i18n';
import type { NavItem } from '../useNavigation';
import { navLabel } from '../navLabel';
import { useNavSidebar } from './useNavSidebar';
import classes from './NavSidebar.module.css';

export interface NavSidebarProps {
  placement?: 'left' | 'right';
  // 传入即为抽屉模式（NavigationDrawerButton 使用）：始终展开、无折叠开关、
  // 品牌行右侧显示关闭按钮、点击条目后关闭抽屉
  onClose?: () => void;
}

// 展开侧栏（~220px，可折叠为 64px 图标栏）：
//  - 品牌行：品牌方块（showLogo）+ 应用名 t('app.title')
//  - 主区 primary 路由；底部 footer 路由 + 折叠开关
//  - 行 = 48px 图标格 + 文字，折叠时只剩图标格，图标位置与 rail 完全一致，宽度平滑过渡
//  - 折叠态显示 Tooltip（受偏好 showTooltip 控制）
export const NavSidebar = ({ placement = 'left', onClose }: NavSidebarProps) => {
  const inDrawer = onClose !== undefined;
  const { primary, footer, showLogo, collapsed, toggleCollapsed, select, tooltipsEnabled } =
    useNavSidebar({ inDrawer, onClose });
  const t = useT();
  const tooltipPosition = placement === 'right' ? 'left' : 'right';

  const ToggleIcon =
    placement === 'right'
      ? collapsed
        ? IconLayoutSidebarRightExpand
        : IconLayoutSidebarRightCollapse
      : collapsed
        ? IconLayoutSidebarLeftExpand
        : IconLayoutSidebarLeftCollapse;
  const toggleLabel = t(collapsed ? 'sidebar.expand' : 'sidebar.collapse');

  const renderItem = (item: NavItem) => {
    const label = navLabel(t, item);
    const Icon = item.icon;
    return (
      <Tooltip key={item.id} label={label} position={tooltipPosition} disabled={!tooltipsEnabled}>
        <UnstyledButton
          className={classes.item}
          onClick={() => select(item.id)}
          data-active={item.active || undefined}
          aria-label={collapsed ? label : undefined}
          aria-current={item.active ? 'page' : undefined}
        >
          {item.active && <span className={classes.indicator} aria-hidden />}
          <span className={classes.itemIcon}>
            <Icon size={20} stroke={1.75} />
          </span>
          <span className={classes.label}>{label}</span>
        </UnstyledButton>
      </Tooltip>
    );
  };

  const showBrandRow = showLogo || inDrawer;

  return (
    <Box
      component="nav"
      className={classes.root}
      data-placement={placement}
      data-collapsed={collapsed || undefined}
      data-in-drawer={inDrawer || undefined}
      aria-label={t('sidebar.navAriaLabel')}
    >
      {showBrandRow && (
        <>
          <div className={classes.brandRow}>
            {showLogo && (
              <span className={classes.brandCell} aria-hidden>
                <span className={classes.brand}>{t('sidebar.brand')}</span>
              </span>
            )}
            <span className={classes.brandTitle} data-no-logo={!showLogo || undefined}>
              {t('app.title')}
            </span>
            {inDrawer && (
              <ActionIcon
                className={classes.close}
                onClick={onClose}
                aria-label={t('sidebar.closeMenu')}
              >
                <IconX size={18} stroke={1.75} />
              </ActionIcon>
            )}
          </div>
          <div className={classes.divider} aria-hidden />
        </>
      )}

      <div className={classes.section}>{primary.map(renderItem)}</div>

      <div className={classes.spacer} />

      <div className={classes.section}>{footer.map(renderItem)}</div>

      {!inDrawer && (
        <>
          <div className={classes.divider} aria-hidden />
          <Tooltip label={toggleLabel} position={tooltipPosition} disabled={!tooltipsEnabled}>
            <UnstyledButton
              className={classes.item}
              data-kind="toggle"
              onClick={toggleCollapsed}
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
            >
              <span className={classes.itemIcon}>
                <ToggleIcon size={20} stroke={1.75} />
              </span>
              <span className={classes.label}>{toggleLabel}</span>
            </UnstyledButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
};
