import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconGripHorizontal } from '@tabler/icons-react';
import { useT } from '@/i18n';
import type { NavItem } from '../useNavigation';
import { navLabel } from '../navLabel';
import { useNavDock } from './useNavDock';
import classes from './NavDock.module.css';

export interface NavDockProps {
  // 悬浮模式：竖向排列、顶部拖拽手柄、吸附左 / 右边缘（布局预设 floating）
  floating?: boolean;
}

// 浮动 Dock：
//  - 默认：底部居中横向胶囊（AppLayout 负责定位到内容区底部），Tooltip 朝上
//  - floating：竖向胶囊，悬浮于内容区；拖动顶部手柄移动，松手吸附最近的左 / 右边缘，
//    位置存 preferences（floatDockSide / floatDockY）；手柄支持方向键
//  - 44px 图标按钮，选中 accent 图标 + 圆点；primary / footer 之间分隔线
export const NavDock = ({ floating = false }: NavDockProps) => {
  const { primary, footer, navigate, showTooltip, drag, edgeGap, safeGap } = useNavDock();
  const t = useT();
  // 实测 Dock 高度写入 --dock-half-h，供定位 clamp 使用（路由条目数变化时自动更新）
  const rootRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!floating || !el) return;
    const apply = () => el.style.setProperty('--dock-half-h', `${el.offsetHeight / 2}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [floating]);
  const tooltipPos = floating ? (drag.side === 'right' ? 'left' : 'right') : 'top';

  const renderItem = (item: NavItem) => {
    const label = navLabel(t, item);
    const Icon = item.icon;
    return (
      <div key={item.id} className={classes.itemWrap}>
        <Tooltip label={label} position={tooltipPos} disabled={!showTooltip || drag.dragging}>
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
        {item.active && <span className={classes.dot} aria-hidden />}
      </div>
    );
  };

  let style: CSSProperties | undefined;
  if (floating) {
    style = drag.live
      ? { left: drag.live.x, top: drag.live.y, transform: 'translate(-50%, -50%)' }
      : {
          // 以 Dock 顶边定位，按实测高度夹取：top ∈ [safeGap, 100% − 高度 − safeGap]，
          // 保证 Dock（及其拖拽手柄）永远完整地处在内容区内、不压到标题栏 / 红绿灯
          top: `clamp(${safeGap}px, calc(${drag.y * 100}% - var(--dock-half-h)), calc(100% - 2 * var(--dock-half-h) - ${safeGap}px))`,
          ...(drag.side === 'right' ? { right: edgeGap } : { left: edgeGap }),
        };
  }

  return (
    <Box
      component="nav"
      className={classes.root}
      aria-label={t('sidebar.navAriaLabel')}
      ref={rootRef}
      data-dock
      data-floating={floating || undefined}
      data-dragging={drag.dragging || undefined}
      style={style}
    >
      {floating && (
        <button
          type="button"
          className={classes.handle}
          style={{ '--wails-draggable': 'no-drag' } as CSSProperties}
          aria-label={t('sidebar.dragDock')}
          title={t('sidebar.dragDock')}
          onPointerDown={drag.onHandlePointerDown}
          onKeyDown={drag.onHandleKeyDown}
          onDoubleClick={drag.onHandleDoubleClick}
        >
          <IconGripHorizontal size={16} stroke={1.75} />
        </button>
      )}
      {primary.map(renderItem)}
      {primary.length > 0 && footer.length > 0 && <span className={classes.separator} aria-hidden />}
      {footer.map(renderItem)}
    </Box>
  );
};
