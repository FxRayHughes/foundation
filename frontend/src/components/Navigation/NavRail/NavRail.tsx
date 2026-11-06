import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { useT } from '@/i18n';
import type { NavItem } from '../useNavigation';
import { navLabel } from '../navLabel';
import { useNavRail } from './useNavRail';
import classes from './NavRail.module.css';

export interface NavRailProps {
  // 图标栏所在侧：决定激活指示条贴哪条边、分隔线画在哪侧、Tooltip 朝哪弹
  placement?: 'left' | 'right';
}

// 64px 图标栏（扁平化）：
//  - 顶部：品牌方块（i18n key sidebar.brand）+ 短 divider（偏好 showLogo 控制）
//  - 主区：slot === 'primary' 的路由；底部：slot === 'footer' 的路由
//  - 选中态：bg.active 底色 + accent 图标 + 贴外侧边缘的 3px accent indicator bar
//  - Tooltip 可在偏好里关闭（aria-label 仍保留）
export const NavRail = ({ placement = 'left' }: NavRailProps) => {
  const { primary, footer, navigate, showTooltip, showLogo } = useNavRail();
  const t = useT();
  const tooltipPosition = placement === 'right' ? 'left' : 'right';

  const renderItem = (item: NavItem) => {
    const label = navLabel(t, item);
    const Icon = item.icon;
    return (
      <div key={item.id} className={classes.itemWrap}>
        {item.active && <div className={classes.indicator} aria-hidden />}
        <Tooltip label={label} position={tooltipPosition} disabled={!showTooltip}>
          <ActionIcon
            onClick={() => navigate(item.id)}
            className={classes.item}
            data-active={item.active || undefined}
            aria-label={label}
            aria-current={item.active ? 'page' : undefined}
          >
            <Icon size={24} stroke={1.75} />
          </ActionIcon>
        </Tooltip>
      </div>
    );
  };

  return (
    <Box
      component="nav"
      className={classes.root}
      data-placement={placement}
      aria-label={t('sidebar.navAriaLabel')}
    >
      {showLogo && (
        <>
          <div className={classes.brand} aria-hidden>
            <span>{t('sidebar.brand')}</span>
          </div>
          <div className={classes.brandDivider} aria-hidden />
        </>
      )}

      <div className={classes.section}>{primary.map(renderItem)}</div>

      <div className={classes.spacer} />

      <div className={classes.section}>{footer.map(renderItem)}</div>
    </Box>
  );
};
