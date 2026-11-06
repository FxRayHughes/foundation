import { Box, UnstyledButton } from '@mantine/core';
import { useT } from '@/i18n';
import type { NavItem } from '../useNavigation';
import { navLabel } from '../navLabel';
import { useNavBar } from './useNavBar';
import classes from './NavBar.module.css';

export interface NavBarProps {
  // top：标题栏下方独占一行（44px，含品牌、底部分隔线，footer 靠右）
  // titlebar：嵌入标题栏（var(--fd-titlebar-h)）（≤28px，无品牌、无分隔线、透明底，footer 以竖线分隔）
  placement?: 'top' | 'titlebar';
}

// 水平导航条：图标 18 + 文字，选中态为 pill（bg.active + accent）。
// 文字始终可见，因此不弹 Tooltip；showLogo 控制 top 模式左侧品牌方块。
export const NavBar = ({ placement = 'top' }: NavBarProps) => {
  const { primary, footer, navigate, showLogo } = useNavBar();
  const t = useT();
  const compact = placement === 'titlebar';

  const renderItem = (item: NavItem) => {
    const label = navLabel(t, item);
    const Icon = item.icon;
    return (
      <UnstyledButton
          key={item.id}
          className={classes.item}
          onClick={() => navigate(item.id)}
          data-active={item.active || undefined}
          aria-current={item.active ? 'page' : undefined}
        >
          <Icon size={compact ? 16 : 18} stroke={1.75} />
          <span className={classes.label}>{label}</span>
        </UnstyledButton>
    );
  };

  return (
    <Box
      component="nav"
      className={classes.root}
      data-placement={placement}
      aria-label={t('sidebar.navAriaLabel')}
    >
      {!compact && showLogo && (
        <span className={classes.brand} aria-hidden>
          {t('sidebar.brand')}
        </span>
      )}
      <div className={classes.group}>{primary.map(renderItem)}</div>
      {footer.length > 0 &&
        (compact ? (
          <span className={classes.separator} aria-hidden />
        ) : (
          <div className={classes.spacer} />
        ))}
      <div className={classes.group}>{footer.map(renderItem)}</div>
    </Box>
  );
};
