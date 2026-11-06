import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import type { ReactElement } from 'react';
import { useT } from '@/i18n';
import { useRouter } from '@/router';
import type { RouteDefinition } from '@/router';
import { usePreferences } from '@/preferences';
import classes from './Sidebar.module.css';

// 左侧侧边栏（扁平化，宽 64px）：
//  - 顶部：品牌方块（默认 "F"，文案走 i18n key sidebar.brand）+ 短 divider
//  - 主区：路由表中 slot === 'primary' 的条目
//  - 底部：路由表中 slot === 'footer' 的条目（如 Settings）
//  - 选中态：bg.active 底色 + accent 图标 + 左侧 3px accent indicator bar
//  - Tooltip 可在偏好里关闭（aria-label 仍保留，可访问性不掉）
// 不接受 props —— 路由表是唯一事实源，新增页面只改 routes.tsx。
export const Sidebar = () => {
  const { primary, footer, active, navigate } = useRouter();
  const { preferences } = usePreferences();
  const t = useT();

  // 路由 label 解析：优先 t(labelKey)，否则回落到 label 字面量
  const labelOf = (r: RouteDefinition): string =>
    r.labelKey ? t(r.labelKey) : r.label;

  const wrapTooltip = (label: string, child: ReactElement): ReactElement => {
    if (!preferences.showTooltip) return child;
    return (
      <Tooltip label={label} position="right">
        {child}
      </Tooltip>
    );
  };

  const renderItem = (r: RouteDefinition) => {
    const isActive = r.id === active.id;
    const label = labelOf(r);
    const Icon = r.icon ?? IconHome;
    return (
      <div key={r.id} className={classes.itemWrap}>
        {isActive && <div className={classes.indicator} aria-hidden />}
        {wrapTooltip(
          label,
          <ActionIcon
            onClick={() => navigate(r.id)}
            className={classes.item}
            data-active={isActive || undefined}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={24} stroke={1.75} />
          </ActionIcon>,
        )}
      </div>
    );
  };

  return (
    <Box component="nav" className={classes.root} aria-label={t('sidebar.navAriaLabel')}>
      {preferences.showLogo && (
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
